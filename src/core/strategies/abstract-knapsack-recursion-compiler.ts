import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { cloneTree } from './strategy-helpers';
import type { KnapsackDomainConfig, KnapsackItem } from './knapsack-step-matrix-compiler';

export interface KnapsackRecursionContext {
  config: KnapsackDomainConfig;
  items: KnapsackItem[];
  capacity: number;
  n: number;
  isMemo: boolean;
  anchorMap: Record<string, number>;
  gridState: (number | null)[][] ;
  activeStack: string[];
  visitedCells: Set<string>;
  memoCache: Record<string, any>;
  rootNode: UniversalTreeNode;
  nodeIdCounter: number;
  callCount: number;
}

export interface KnapsackBoundaryResult {
  isBase: boolean;
  val?: any;
  lineKey?: string;
  tag?: string;
  log?: string;
  msg?: string;
}

/**
 * AbstractKnapsackRecursionCompiler — 背包 DP 递归与记忆化顶层抽象编译器
 *
 * 核心设计：Template Method 模式。
 * 遵循《universal-dp-refactoring》黄金基准，独占背包决策树的控制流，保障零跳步物理不变量：
 *   1. main_entry / odd_check: 主函数入口与奇数总和合法性特判
 *   2. dfs_entry: 递归函数入口帧（压栈、高亮函数头）
 *   3. boundary: 目标达成 (curTarget == 0) 或 物品耗尽/超重拦截 (i >= n || curTarget < 0)
 *   4. cache_hit: 备忘录命中 O(1) 剪枝（仅 Stage 2）
 *   5. branch-call (not_take): 决策 1（不选当前物品）调用前高亮与依赖注入
 *   6. branch-return (not_take): 子递归返回后发射回溯赋值帧 (notTake = ...)
 *   7. cond (take): 决策 2（选入当前物品）前置容量判断 (w >= weights[i])
 *   8. branch-call (take): 决策 2 调用前高亮与依赖注入
 *   9. branch-return (take): 子递归返回后发射回溯赋值帧 (take = ...)
 *  10. combine: 结果汇总、写入备忘录、回溯出栈
 *  11. return: 最终结果收敛
 */
export abstract class AbstractKnapsackRecursionCompiler {
  public compile(config: KnapsackDomainConfig, isMemo: boolean = false): UniversalStep[] {
    const { items, capacity, anchorMap, oddCheck } = config;
    const n = items.length;
    const target = capacity;

    const lineOddCheck = anchorMap?.odd_check || 4;
    const lineMainEntry = anchorMap?.entry || 1;
    const lineReturn = anchorMap?.return || lineMainEntry;
    const lineDfsStart = anchorMap?.dfs_start || (anchorMap?.entry || 6);

    const steps: UniversalStep[] = [];

    // 奇数/不可行前置拦截
    if (oddCheck?.hasOddFail) {
      steps.push({
        type: 'boundary',
        i: 0,
        j: 0,
        grid: [[0]],
        activeStack: [],
        visited: [],
        line: lineOddCheck,
        tag: `奇数总和 ${oddCheck.sum} 无法平分`,
        log: `| ❌ 数组总和 sum = ${oddCheck.sum} 为奇数，无法等分为两个整数子集，直接 return false`,
        msg: `数组总和 <code>sum = ${oddCheck.sum}</code> 为奇数，无法平分成两个相等的整数子集，直接返回 <strong>false</strong>。`
      });
      return steps;
    }

    const gridState: (number | null)[][] = Array.from({ length: n }, () =>
      new Array(target + 1).fill(null)
    );
    const activeStack: string[] = [];
    const visitedCells: Set<string> = new Set();
    const memoCache: Record<string, any> = {};

    const rootNode: UniversalTreeNode = {
      id: 'node-1',
      r: 0,
      c: target,
      val: `dfs(0,${target})`,
      status: 'current',
      children: []
    };

    const ctx: KnapsackRecursionContext = {
      config,
      items,
      capacity: target,
      n,
      isMemo,
      anchorMap: anchorMap || {},
      gridState,
      activeStack,
      visitedCells,
      memoCache,
      rootNode,
      nodeIdCounter: 1,
      callCount: 0
    };

    const emitStep = (stepData: any) => {
      const isComparing =
        stepData.type === 'cond-eval' ||
        stepData.type === 'branch-call' ||
        stepData.type === 'match-branch';

      steps.push({
        curI: stepData.i ?? 0,
        curJ: stepData.j ?? 0,
        isComparing,
        callStack: activeStack.map((coord, idx) => ({
          label: `dfs(${coord})`,
          coord,
          depth: idx + 1
        })),
        ...stepData
      });
    };

    // 主函数入口
    emitStep({
      type: 'entry',
      i: 0,
      j: target,
      grid: JSON.parse(JSON.stringify(gridState)),
      activeStack: [],
      visited: [],
      line: lineMainEntry,
      tag: `knapsack(items=${n}, capacity=${target})`,
      log: `| 🎒 主函数入口：求解容量为 ${target} 的背包，候选物品共 ${n} 件`,
      msg: `主函数入口：开始求解背包问题，背包容量为 <code>${target}</code>，共有 <code>${n}</code> 件候选物品。`,
      gridHighlight: { i: 0, j: target },
      activeNodeId: rootNode.id,
      treeRoot: cloneTree(rootNode)
    });

    const total = this.runDfs(0, target, rootNode, ctx, emitStep);
    const isCoinMin = ctx.config.kind === 'coin-change-min';
    const finalDiff = ctx.config.kind === 'last-stone-weight' && ctx.config.oddCheck?.sum !== undefined
      ? ctx.config.oddCheck.sum - 2 * Number(total)
      : (isCoinMin ? (Number(total) >= 1000000 ? -1 : total) : total);

    const isStoneDiff = ctx.config.kind === 'last-stone-weight' && ctx.config.oddCheck?.sum !== undefined;

    emitStep({
      type: 'return',
      i: 0,
      j: target,
      grid: JSON.parse(JSON.stringify(ctx.gridState)),
      activeStack: [],
      visited: [...ctx.visitedCells],
      line: lineReturn,
      tag: isStoneDiff ? `两堆最小差值: ${finalDiff}` : `最终答案: ${finalDiff}`,
      log: isStoneDiff
        ? `| 🏆 背包状态演化计算完成！最大子集重=${total}，两堆粉碎最小差值 = ${ctx.config.oddCheck?.sum} - 2*${total} = ${finalDiff}`
        : `| 🏆 背包状态演化计算完成！结果 = ${finalDiff}`,
      msg: isStoneDiff
        ? `🏆 演化计算完成！背包在容量 <code>${target}</code> 下最大装载 <code>${total}</code>，两堆石头碰撞粉碎后最小差值为 <code>${ctx.config.oddCheck?.sum} - 2 × ${total} = <strong>${finalDiff}</strong></code>。`
        : `🏆 演化计算完成！背包在容量 <code>${target}</code> 下的最优推导结果为 <strong>${finalDiff}</strong>。`,
      gridHighlight: { i: 0, j: target },
      activeNodeId: rootNode.id,
      treeRoot: cloneTree(rootNode)
    });

    return steps;
  }

  protected runDfs(
    i: number,
    curTarget: number,
    currentNode: UniversalTreeNode,
    ctx: KnapsackRecursionContext,
    emitStep: (data: any) => void
  ): any {
    ctx.callCount++;
    const key = `${i},${curTarget}`;
    ctx.activeStack.push(key);
    ctx.visitedCells.add(key);
    currentNode.status = 'current';

    const lineDfsStart = ctx.anchorMap.entry || ctx.anchorMap.dfs_start || (ctx.isMemo ? 6 : 4);
    const lineBaseMatch = ctx.anchorMap.boundary || ctx.anchorMap.base_match || (ctx.isMemo ? 15 : 12);
    const lineBaseOverflow = ctx.anchorMap.boundary || ctx.anchorMap.base_overflow || (ctx.isMemo ? 17 : 14);
    const lineCacheHit = ctx.anchorMap.cache_hit || 19;
    const lineBranchNotTake = ctx.anchorMap.branch_not_take || ctx.anchorMap.branch_down || (ctx.isMemo ? 22 : 17);
    const lineCondTake = ctx.anchorMap.cond_take || lineBranchNotTake;
    const lineBranchTake = ctx.anchorMap.branch_take || ctx.anchorMap.branch_right || (ctx.isMemo ? 26 : 21);
    const lineCombine = ctx.anchorMap.combine || (ctx.isMemo ? 28 : 23);

    const safeI = Math.min(i, ctx.n - 1);
    const safeJ = Math.max(0, Math.min(curTarget, ctx.capacity));

    // 1. 函数入口帧 (Entry)
    emitStep({
      type: 'entry',
      i: safeI,
      j: safeJ,
      grid: JSON.parse(JSON.stringify(ctx.gridState)),
      activeStack: [...ctx.activeStack],
      visited: [...ctx.visitedCells],
      line: lineDfsStart,
      tag: `dfs(${i}, ${curTarget})`,
      log: `| ➡️ 进入搜索: dfs(物品索引=${i}, 剩余容量/目标=${curTarget})`,
      msg: `进入递归搜索：当前考虑第 <code>${i}</code> 件物品，剩余容量/目标为 <code>${curTarget}</code>。`,
      gridHighlight: { i: safeI, j: safeJ },
      activeNodeId: currentNode.id,
      treeRoot: cloneTree(ctx.rootNode)
    });

    // 2. 边界检查 (Boundary)
    const baseCheck = this.checkBoundary(i, curTarget, ctx);
    if (baseCheck.isBase) {
      if (currentNode) {
        currentNode.status = baseCheck.val ? 'base' : 'pruned';
        currentNode.tag = `= ${baseCheck.val}`;
      }
      const lineBoundary = baseCheck.lineKey
        ? (ctx.anchorMap[baseCheck.lineKey] || lineBaseMatch)
        : (curTarget === 0 ? lineBaseMatch : lineBaseOverflow);

      emitStep({
        type: 'boundary',
        i: safeI,
        j: safeJ,
        grid: JSON.parse(JSON.stringify(ctx.gridState)),
        activeStack: [...ctx.activeStack],
        visited: [...ctx.visitedCells],
        line: lineBoundary,
        tag: baseCheck.tag || 'Base Case',
        log: baseCheck.log || `| 🎬 满足 Base Case: i=${i}, curTarget=${curTarget}, return ${baseCheck.val}`,
        msg: baseCheck.msg || `🎬 满足边界条件，直接返回 <strong>${baseCheck.val}</strong>。`,
        gridHighlight: { i: safeI, j: safeJ },
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(ctx.rootNode)
      });

      ctx.activeStack.pop();
      return baseCheck.val;
    }

    // 3. 备忘录缓存命中判定 (Stage 2)
    if (ctx.isMemo && ctx.memoCache[key] !== undefined) {
      const cachedVal = ctx.memoCache[key];
      currentNode.status = 'visited';
      currentNode.tag = `⚡=${cachedVal}`;

      emitStep({
        type: 'memo-hit',
        i: safeI,
        j: safeJ,
        grid: JSON.parse(JSON.stringify(ctx.gridState)),
        activeStack: [...ctx.activeStack],
        visited: [...ctx.visitedCells],
        line: lineCacheHit,
        tag: `⚡ 备忘录命中: ${cachedVal}`,
        log: `| ⚡ 备忘录命中: memo[${i}][${curTarget}] = ${cachedVal}，直接剪枝返回！`,
        msg: `⚡ 备忘录命中：状态 <code>(${i}, ${curTarget})</code> 先前已计算过结果为 <strong>${cachedVal}</strong>，直接剪枝返回！`,
        gridHighlight: { i: safeI, j: safeJ },
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(ctx.rootNode)
      });

      ctx.activeStack.pop();
      return cachedVal;
    }

    const currentItem = ctx.items[i];
    const itemW = currentItem.weight;

    // 🌟 多重背包 (multiple-knapsack) 独立决策展开：支持每种物品数量上限 count
    if (ctx.config.kind === 'multiple-knapsack') {
      const countLimit = currentItem.count ?? 1;
      let bestVal = 0;
      const lineLoopCount = ctx.anchorMap.loop_count || ctx.anchorMap.branch_take || lineBranchTake;

      for (let k = 0; k <= countLimit && k * itemW <= curTarget; k++) {
        const nextTarget = curTarget - k * itemW;
        const branchLabel = k === 0 ? '不选' : `选${k}件`;
        const candidateDeps = [{
          r: Math.min(i + 1, ctx.n - 1),
          c: Math.max(0, nextTarget),
          type: 'diag' as const,
          label: `${branchLabel}(w=${k * itemW})`
        }];

        emitStep({
          type: 'branch-call',
          i: safeI,
          j: safeJ,
          targetI: i + 1,
          targetJ: nextTarget,
          branchIndex: k,
          branchType: 'diag',
          varName: `k_${k}`,
          deps: candidateDeps,
          grid: JSON.parse(JSON.stringify(ctx.gridState)),
          activeStack: [...ctx.activeStack],
          visited: [...ctx.visitedCells],
          line: lineLoopCount,
          tag: `物品[${i}] ${branchLabel} (重=${k * itemW})`,
          log: `| 📦 多重背包分支: 物品 ${i} ${branchLabel}，剩余容量 ${nextTarget}，深入 dfs(${i + 1}, ${nextTarget})`,
          msg: `多重背包决策：当前物品 <code>item[${i}]</code> <strong>${branchLabel}</strong>（消耗容量 <code>${k * itemW}</code>，价值 <code>${k * currentItem.value}</code>）。`,
          gridHighlight: { i: safeI, j: safeJ },
          activeNodeId: currentNode.id,
          treeRoot: cloneTree(ctx.rootNode)
        });

        const childNode: UniversalTreeNode = {
          id: `node-${++ctx.nodeIdCounter}`,
          r: Math.min(i + 1, ctx.n - 1),
          c: Math.max(0, nextTarget),
          val: `dfs(${i + 1},${nextTarget})`,
          edgeLabel: branchLabel,
          status: 'current',
          children: []
        };
        currentNode.children.push(childNode);

        const subRes = this.runDfs(i + 1, nextTarget, childNode, ctx, emitStep);
        const branchVal = k * currentItem.value + subRes;

        emitStep({
          type: 'branch-return',
          i: safeI,
          j: safeJ,
          targetI: i + 1,
          targetJ: nextTarget,
          branchIndex: k,
          varName: `k_${k}`,
          subResult: branchVal,
          grid: JSON.parse(JSON.stringify(ctx.gridState)),
          activeStack: [...ctx.activeStack],
          visited: [...ctx.visitedCells],
          line: lineLoopCount,
          tag: `${branchLabel}收益: ${branchVal}`,
          log: `| ↩️ 分支返回: 物品 ${i} ${branchLabel} 总收益 = ${branchVal}`,
          msg: `分支返回：物品 <code>item[${i}]</code> ${branchLabel} 的收益为 <strong>${branchVal}</strong>。 `,
          gridHighlight: { i: safeI, j: safeJ },
          activeNodeId: currentNode.id,
          treeRoot: cloneTree(ctx.rootNode)
        });

        if (branchVal > bestVal) {
          bestVal = branchVal;
        }
      }

      if (ctx.isMemo) {
        ctx.memoCache[key] = bestVal;
      }
      ctx.gridState[safeI][safeJ] = bestVal;
      currentNode.status = bestVal > 0 ? 'visited' : 'normal';
      currentNode.tag = `= ${bestVal}`;

      emitStep({
        type: 'combine',
        i: safeI,
        j: safeJ,
        grid: JSON.parse(JSON.stringify(ctx.gridState)),
        activeStack: [...ctx.activeStack],
        visited: [...ctx.visitedCells],
        line: lineCombine,
        tag: `maxVal = ${bestVal}`,
        log: `| ✨ 汇总多重分支: dfs(${i}, ${curTarget}) 最优收益 = ${bestVal}`,
        msg: `✨ 汇总多重分支决策：在容量 <code>${curTarget}</code> 下最大总价值为 <code>maxVal = <strong>${bestVal}</strong></code>。`,
        gridHighlight: { i: safeI, j: safeJ },
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(ctx.rootNode)
      });

      ctx.activeStack.pop();
      return bestVal;
    }
    const canTake = curTarget >= itemW;
    const isComplete =
      ctx.config.kind === 'complete-standard' ||
      ctx.config.kind === 'coin-change-count' ||
      ctx.config.kind === 'coin-change-min';
    const takeNextI = isComplete ? i : (i + 1);
    const takeBranchType = isComplete ? 'left' : 'diag';
    const takeDepR = isComplete ? i : Math.min(i + 1, ctx.n - 1);
    const takeLabel = isComplete ? `复选(w=${itemW})` : `选入(w=${itemW})`;

    // 提前解析所有候选分支并注入 candidateDeps
    const candidateDeps: Array<{ r: number; c: number; type: 'diag' | 'top' | 'left'; label: string }> = [
      {
        r: Math.min(i + 1, ctx.n - 1),
        c: safeJ,
        type: 'top',
        label: `不选(w=${itemW})`
      }
    ];
    if (canTake) {
      candidateDeps.push({
        r: takeDepR,
        c: Math.max(0, curTarget - itemW),
        type: takeBranchType,
        label: takeLabel
      });
    }

    // 4. 决策 1: 不选当前物品 (Not Take)
    // 🌟【强制拦截点】：进入决策 1 前发射调用帧并注入 deps
    emitStep({
      type: 'branch-call',
      i: safeI,
      j: safeJ,
      targetI: i + 1,
      targetJ: curTarget,
      branchIndex: 0,
      branchType: 'top',
      varName: 'notTake',
      deps: candidateDeps,
      grid: JSON.parse(JSON.stringify(ctx.gridState)),
      activeStack: [...ctx.activeStack],
      visited: [...ctx.visitedCells],
      line: lineBranchNotTake,
      tag: `不选 item[${i}]=${itemW}`,
      log: `| 🚫 决策 1: 不选 item[${i}] (w=${itemW})，剩余容量保持 ${curTarget}，深入 dfs(${i + 1}, ${curTarget})`,
      msg: `🚫 决策 1：<strong>不选</strong> 当前物品 <code>item[${i}] (重量 ${itemW})</code>，剩余容量保持 <code>${curTarget}</code>。`,
      gridHighlight: { i: safeI, j: safeJ },
      activeNodeId: currentNode.id,
      treeRoot: cloneTree(ctx.rootNode)
    });

    const childNotTake: UniversalTreeNode = {
      id: `node-${++ctx.nodeIdCounter}`,
      r: Math.min(i + 1, ctx.n - 1),
      c: safeJ,
      val: `dfs(${i + 1},${curTarget})`,
      edgeLabel: '不选',
      status: 'current',
      children: []
    };
    currentNode.children.push(childNotTake);

    const notTakeRes = this.runDfs(i + 1, curTarget, childNotTake, ctx, emitStep);

    // 🌟【Call-Return Parity 闭环】：决策 1 返回后发射回溯赋值帧
    emitStep({
      type: 'branch-return',
      i: safeI,
      j: safeJ,
      targetI: i + 1,
      targetJ: curTarget,
      branchIndex: 0,
      varName: 'notTake',
      subResult: notTakeRes,
      grid: JSON.parse(JSON.stringify(ctx.gridState)),
      activeStack: [...ctx.activeStack],
      visited: [...ctx.visitedCells],
      line: lineBranchNotTake,
      tag: `notTake = ${notTakeRes}`,
      log: `| ↩️ 决策 1 返回: notTake = ${notTakeRes}，准备考察决策 2`,
      msg: `决策 1 返回：不选当前物品的收益为 <code>notTake = <strong>${notTakeRes}</strong></code>。`,
      gridHighlight: { i: safeI, j: safeJ },
      activeNodeId: currentNode.id,
      treeRoot: cloneTree(ctx.rootNode)
    });

    // 5. 决策 2: 选入当前物品 (Take)
    let takeRes: any = 0;

    // 前置容量判断帧 (cond_take)
    emitStep({
      type: 'cond-eval',
      i: safeI,
      j: safeJ,
      grid: JSON.parse(JSON.stringify(ctx.gridState)),
      activeStack: [...ctx.activeStack],
      visited: [...ctx.visitedCells],
      line: lineCondTake,
      tag: canTake ? `容量充足 (${curTarget} >= ${itemW})` : `容量不足 (${curTarget} < ${itemW})`,
      log: canTake
        ? `| 🔍 容量检查: 背包剩余 ${curTarget} >= 物品重量 ${itemW}，可以选入！`
        : `| 🔍 容量检查: 背包剩余 ${curTarget} < 物品重量 ${itemW}，容量不足，跳过选入`,
      msg: canTake
        ? `比对容量条件：<code>w = ${curTarget} >= weights[${i}] = ${itemW}</code> 成立，当前背包足以容纳该物品。`
        : `比对容量条件：<code>w = ${curTarget} < weights[${i}] = ${itemW}</code> 不成立，容量不足无法选入。`,
      gridHighlight: { i: safeI, j: safeJ },
      activeNodeId: currentNode.id,
      treeRoot: cloneTree(ctx.rootNode)
    });

    if (canTake) {
      const nextTarget = curTarget - itemW;

      // 🌟【强制拦截点】：进入决策 2 前发射调用帧并高亮
      emitStep({
        type: 'branch-call',
        i: safeI,
        j: safeJ,
        targetI: takeNextI,
        targetJ: nextTarget,
        branchIndex: 1,
        branchType: takeBranchType,
        varName: 'take',
        deps: [{
          r: takeDepR,
          c: Math.max(0, nextTarget),
          type: takeBranchType,
          label: takeLabel
        }],
        grid: JSON.parse(JSON.stringify(ctx.gridState)),
        activeStack: [...ctx.activeStack],
        visited: [...ctx.visitedCells],
        line: lineBranchTake,
        tag: `${takeLabel} item[${i}]=${itemW}`,
        log: `| 📦 决策 2: ${takeLabel} item[${i}] (w=${itemW}, v=${currentItem.value})，深入 dfs(${takeNextI}, ${nextTarget})`,
        msg: `📦 决策 2：<strong>${isComplete ? '复选' : '选入'}</strong> 当前物品 <code>item[${i}] (重量 ${itemW}, 价值 ${currentItem.value})</code>，扣减容量深入 <code>dfs(${takeNextI}, ${nextTarget})</code>。`,
        gridHighlight: { i: safeI, j: safeJ },
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(ctx.rootNode)
      });

      const childTake: UniversalTreeNode = {
        id: `node-${++ctx.nodeIdCounter}`,
        r: takeDepR,
        c: Math.max(0, nextTarget),
        val: `dfs(${takeNextI},${nextTarget})`,
        edgeLabel: isComplete ? '复选' : '选入',
        status: 'current',
        children: []
      };
      currentNode.children.push(childTake);

      takeRes = this.runDfs(takeNextI, nextTarget, childTake, ctx, emitStep);

      // 🌟【Call-Return Parity 闭环】：决策 2 返回后发射回溯赋值帧
      const fullTakeVal = this.computeTakeResult(takeRes, currentItem, ctx);
      emitStep({
        type: 'branch-return',
        i: safeI,
        j: safeJ,
        targetI: takeNextI,
        targetJ: nextTarget,
        branchIndex: 1,
        varName: 'take',
        subResult: fullTakeVal,
        grid: JSON.parse(JSON.stringify(ctx.gridState)),
        activeStack: [...ctx.activeStack],
        visited: [...ctx.visitedCells],
        line: lineBranchTake,
        tag: `take = ${fullTakeVal}`,
        log: `| ↩️ 决策 2 返回: take = ${fullTakeVal}，准备合并汇总`,
        msg: `决策 2 返回：${isComplete ? '复选' : '选入'}当前物品后总收益为 <code>take = <strong>${fullTakeVal}</strong></code>。`,
        gridHighlight: { i: safeI, j: safeJ },
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(ctx.rootNode)
      });
    }

    // 6. 决策合并 (Combine)
    const finalRes = this.combineBranches(notTakeRes, takeRes, canTake, currentItem, ctx);

    ctx.gridState[safeI][safeJ] = typeof finalRes === 'boolean' ? (finalRes ? 1 : 0) : finalRes;
    if (ctx.isMemo) {
      ctx.memoCache[key] = finalRes;
    }

    currentNode.status = finalRes ? 'visited' : 'pruned';
    currentNode.tag = `= ${finalRes}`;

    emitStep({
      type: 'combine',
      i: safeI,
      j: safeJ,
      grid: JSON.parse(JSON.stringify(ctx.gridState)),
      activeStack: [...ctx.activeStack],
      visited: [...ctx.visitedCells],
      line: lineCombine,
      tag: `状态汇总: ${finalRes}`,
      log: `| ✨ 合并分支: dfs(${i}, ${curTarget}) = ${finalRes}${ctx.isMemo ? ' [存入备忘录]' : ''}`,
      msg: `✨ 汇总分支决策：<code>dfs(${i}, ${curTarget}) = <strong>${finalRes}</strong></code>。`,
      gridHighlight: { i: safeI, j: safeJ },
      activeNodeId: currentNode.id,
      treeRoot: cloneTree(ctx.rootNode)
    });

    ctx.activeStack.pop();
    return finalRes;
  }

  protected abstract checkBoundary(i: number, curTarget: number, ctx: KnapsackRecursionContext): KnapsackBoundaryResult;
  protected abstract computeTakeResult(subResult: any, item: KnapsackItem, ctx: KnapsackRecursionContext): any;
  protected abstract combineBranches(notTakeRes: any, takeRes: any, canTake: boolean, item: KnapsackItem, ctx: KnapsackRecursionContext): any;
}
