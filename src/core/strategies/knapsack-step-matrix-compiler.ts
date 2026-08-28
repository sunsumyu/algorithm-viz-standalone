import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { cloneTree, buildKnapsackDPDependencyTree, findNodeIdByCoord } from './strategy-helpers';

/**
 * 背包问题领域实体与值对象 (Knapsack Domain Models & Value Objects)
 */
export interface KnapsackItem {
  index: number;
  weight: number;
  value: number;
  label?: string;
}

export type KnapsackKind =
  | 'partition-subset'   // 分割等和子集（布尔可达性 / 价值=重量）
  | '01-standard'        // 标准 0-1 背包（最大价值）
  | 'complete-standard'  // 完全背包（无限次选取，正序压缩）
  | 'last-stone-weight'  // 最后一块石头的重量 II (最大装载 capacity = sum/2)
  | 'target-sum';        // 目标和 (方案数累加)

export interface KnapsackDomainConfig {
  modelId: string;
  kind: KnapsackKind;
  items: KnapsackItem[];
  capacity: number;
  anchorMap?: Record<string, number>;
  isMemo?: boolean;
  oddCheck?: {
    hasOddFail: boolean;
    sum: number;
    oddMessage?: string;
  };
  valueUnit?: string;
  weightUnit?: string;
}

/**
 * 背包 DP 统一步骤矩阵编译器 (KnapsackStepMatrixCompiler) - 编译流水线深模块 (Deep Module)
 * 遵循领域驱动设计 (DDD) 与流水线模式 (Pipeline Pattern)，统领背包算法家族 4 阶段演进推导：
 * - 阶段 1: 纯递归决策树 (Pure DFS Tree)
 * - 阶段 2: 记忆化搜索与剪枝 (Memoized Search & Pruning)
 * - 阶段 3: 二维 DP 状态表推导与空间依赖箭头 (2D DP Tabulation & Transfer Vectors)
 * - 阶段 4: 一维空间压缩与滚动数组推导 (1D Rolling Space Optimization)
 */
export class KnapsackStepMatrixCompiler {
  /**
   * 编译入口：根据阶段与领域配置生成通用步骤
   */
  public static compile(config: KnapsackDomainConfig, stage: number): UniversalStep[] {
    switch (stage) {
      case 1:
      case 2:
        return this.compileStage1or2(config, Boolean(config.isMemo));
      case 3:
        return this.compileStage3(config);
      case 4:
        return this.compileStage4(config);
      default:
        return [];
    }
  }

  /**
   * 阶段 1 & 2: 递归分支树编译
   */
  public static compileStage1or2(config: KnapsackDomainConfig, isMemo: boolean = false): UniversalStep[] {
    const { items, capacity, kind, anchorMap, oddCheck } = config;
    const n = items.length;
    const generated: UniversalStep[] = [];

    const lineOddCheck = anchorMap?.odd_check || 4;
    const lineDfsStart = anchorMap?.dfs_start || 6;
    const lineBaseMatch = anchorMap?.base_match || (isMemo ? 15 : 12);
    const lineBaseOverflow = anchorMap?.base_overflow || (isMemo ? 17 : 14);
    const lineCacheHit = anchorMap?.cache_hit || 19;
    const lineBranchNotTake = anchorMap?.branch_not_take || (isMemo ? 22 : 17);
    const lineBranchTake = anchorMap?.branch_take || (isMemo ? 26 : 21);
    const lineCombine = anchorMap?.combine || (isMemo ? 28 : 23);

    // 奇数/不可行前置拦截
    if (oddCheck?.hasOddFail) {
      generated.push({
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
      return generated;
    }

    const target = capacity;
    const memoCache: Record<string, any> = {};
    const gridState: (number | null)[][] = Array.from({ length: n }, () => new Array(target + 1).fill(null));
    const activeStack: string[] = [];
    const visitedCells: Set<string> = new Set();
    let nodeIdCounter = 0;
    let callCount = 0;
    const MAX_RECORDED_CALLS = 100;

    const rootNode: UniversalTreeNode = {
      id: `node-${++nodeIdCounter}`,
      r: 0,
      c: target,
      val: `dfs(0,${target})`,
      status: 'current',
      children: []
    };

    function dfs(i: number, curTarget: number, currentTreeNode?: UniversalTreeNode): any {
      callCount++;
      const shouldRecord = isMemo || callCount <= MAX_RECORDED_CALLS;
      const key = `${i},${curTarget}`;
      activeStack.push(key);
      visitedCells.add(key);
      if (currentTreeNode) currentTreeNode.status = 'current';

      if (shouldRecord && currentTreeNode) {
        generated.push({
          type: 'entry',
          i: Math.min(i, n - 1),
          j: Math.max(0, Math.min(curTarget, target)),
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineDfsStart,
          tag: `dfs(${i}, ${curTarget})`,
          log: `| ➡️ 进入搜索: dfs(物品索引=${i}, 剩余容量/目标=${curTarget})`,
          msg: `进入递归搜索：当前考虑第 <code>${i}</code> 件物品，剩余容量/目标为 <code>${curTarget}</code>。`,
          gridHighlight: { i: Math.min(i, n - 1), j: Math.max(0, Math.min(curTarget, target)) },
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode)
        });
      }

      // Base Case 1: 完美装满 / 达到目标
      if (curTarget === 0) {
        if (currentTreeNode) {
          currentTreeNode.status = 'base';
          currentTreeNode.tag = kind === 'partition-subset' ? '🎯=true' : (kind === 'target-sum' ? '🎯=1' : '🎯=0');
        }
        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'boundary',
            i: Math.min(i, n - 1),
            j: 0,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineBaseMatch,
            tag: '🎯 目标达成: true',
            log: `| 🎯 边界命中: curTarget = 0，已找到恰好装满的子集方案，return true`,
            msg: `🎯 边界命中：剩余目标已精确扣减为 <code>0</code>，方案成立，返回 <strong>true</strong>。`,
            gridHighlight: { i: Math.min(i, n - 1), j: 0 },
            activeNodeId: currentTreeNode.id,
            treeRoot: cloneTree(rootNode)
          });
        }
        activeStack.pop();
        return kind === 'partition-subset' ? true : (kind === 'target-sum' ? 1 : 0);
      }

      // Base Case 2: 物品耗尽 或 容量超扣
      if (i >= n || curTarget < 0) {
        if (currentTreeNode) {
          currentTreeNode.status = 'pruned';
          currentTreeNode.tag = kind === 'partition-subset' ? '🚫=false' : '🚫=0';
        }
        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'boundary',
            i: Math.min(i, n - 1),
            j: Math.max(0, Math.min(curTarget, target)),
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineBaseOverflow,
            tag: curTarget < 0 ? '🚫 超重拦截: false' : '🚫 物品耗尽: false',
            log: `| 🚫 边界拦截: ${curTarget < 0 ? `剩余容量 ${curTarget} < 0 超扣` : `物品已全部考察 (i=${i})`}, return false`,
            msg: `🚫 边界拦截：${curTarget < 0 ? `容量超扣为 <code>${curTarget} < 0</code>` : `物品已考察完毕 <code>i = ${i} >= ${n}</code>`}，当前分支不可行，返回 <strong>false</strong>。`,
            gridHighlight: { i: Math.min(i, n - 1), j: Math.max(0, Math.min(curTarget, target)) },
            activeNodeId: currentTreeNode.id,
            treeRoot: cloneTree(rootNode)
          });
        }
        activeStack.pop();
        return kind === 'partition-subset' ? false : 0;
      }

      // 记忆化命中判定
      if (isMemo && memoCache[key] !== undefined) {
        const cachedVal = memoCache[key];
        if (currentTreeNode) {
          currentTreeNode.status = 'visited';
          currentTreeNode.tag = `⚡=${cachedVal}`;
        }
        generated.push({
          type: 'memo-hit',
          i,
          j: curTarget,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineCacheHit,
          tag: `⚡ 备忘录命中: ${cachedVal}`,
          log: `| ⚡ 备忘录命中: memo[${i}][${curTarget}] = ${cachedVal}，直接剪枝返回！`,
          msg: `⚡ 备忘录命中：状态 <code>(${i}, ${curTarget})</code> 先前已计算过结果为 <strong>${cachedVal}</strong>，直接剪枝返回！`,
          gridHighlight: { i, j: curTarget },
          activeNodeId: currentTreeNode ? currentTreeNode.id : undefined,
          treeRoot: cloneTree(rootNode)
        });
        activeStack.pop();
        return cachedVal;
      }

      const itemW = items[i].weight;

      // 决策 1: 不选当前物品
      if (shouldRecord && currentTreeNode) {
        generated.push({
          type: 'match-branch',
          i,
          j: curTarget,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineBranchNotTake,
          tag: `不选 item[${i}]=${itemW}`,
          log: `| 🚫 决策 1: 不选 item[${i}] (w=${itemW})，剩余目标仍为 ${curTarget}，进入 dfs(${i + 1}, ${curTarget})`,
          msg: `🚫 决策 1：<strong>不选</strong> 当前物品 <code>item[${i}] (重量 ${itemW})</code>，剩余目标保持 <code>${curTarget}</code>。`,
          gridHighlight: { i, j: curTarget },
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode)
        });
      }

      let childNotTake: UniversalTreeNode | undefined;
      if (shouldRecord && currentTreeNode) {
        childNotTake = {
          id: `node-${++nodeIdCounter}`,
          r: i + 1,
          c: curTarget,
          val: `dfs(${i + 1},${curTarget})`,
          edgeLabel: '不选',
          status: 'normal',
          children: []
        };
        currentTreeNode.children.push(childNotTake);
      }
      const notTakeRes = dfs(i + 1, curTarget, childNotTake);

      if (kind === 'partition-subset' && notTakeRes) {
        if (isMemo) memoCache[key] = true;
        gridState[i][curTarget] = 1;
        if (currentTreeNode) {
          currentTreeNode.status = 'visited';
          currentTreeNode.tag = '= true';
        }
        activeStack.pop();
        return true;
      }

      // 决策 2: 选入当前物品
      if (shouldRecord && currentTreeNode) {
        generated.push({
          type: 'match-branch',
          i,
          j: curTarget,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineBranchTake,
          tag: `选入 item[${i}]=${itemW}`,
          log: `| 📦 决策 2: 选入 item[${i}] (w=${itemW})，剩余目标扣减为 ${curTarget - itemW}，进入 dfs(${i + 1}, ${curTarget - itemW})`,
          msg: `📦 决策 2：<strong>选入</strong> 当前物品 <code>item[${i}] (重量 ${itemW})</code>，剩余目标变为 <code>${curTarget - itemW}</code>。`,
          gridHighlight: { i, j: curTarget },
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode)
        });
      }

      let childTake: UniversalTreeNode | undefined;
      if (shouldRecord && currentTreeNode) {
        childTake = {
          id: `node-${++nodeIdCounter}`,
          r: i + 1,
          c: Math.max(0, curTarget - itemW),
          val: `dfs(${i + 1},${curTarget - itemW})`,
          edgeLabel: '选入',
          status: 'normal',
          children: []
        };
        currentTreeNode.children.push(childTake);
      }
      const takeRes = dfs(i + 1, curTarget - itemW, childTake);

      const finalRes = kind === 'partition-subset'
        ? (notTakeRes || takeRes)
        : kind === 'target-sum'
        ? ((notTakeRes || 0) + (takeRes || 0))
        : Math.max(notTakeRes, (takeRes || 0) + items[i].value);
      if (isMemo) memoCache[key] = finalRes;
      gridState[i][curTarget] = typeof finalRes === 'boolean' ? (finalRes ? 1 : 0) : finalRes;

      if (currentTreeNode) {
        currentTreeNode.status = finalRes ? 'visited' : 'pruned';
        currentTreeNode.tag = `= ${finalRes}`;
      }

      if (shouldRecord && currentTreeNode) {
        generated.push({
          type: 'update',
          i,
          j: curTarget,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineCombine,
          tag: `状态汇总: ${finalRes}`,
          log: `| ✨ 合并分支: dfs(${i}, ${curTarget}) = ${finalRes}${isMemo ? ' [存入备忘录]' : ''}`,
          msg: `✨ 汇总分支决策结果：<code>dfs(${i}, ${curTarget}) = <strong>${finalRes}</strong></code>。`,
          gridHighlight: { i, j: curTarget },
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode)
        });
      }

      activeStack.pop();
      return finalRes;
    }

    const total = dfs(0, target, rootNode);

    generated.push({
      type: 'return',
      i: 0,
      j: target,
      grid: JSON.parse(JSON.stringify(gridState)),
      activeStack: [],
      visited: [...visitedCells],
      line: lineCombine,
      tag: '最终判定答案',
      log: `| 🏆 背包状态演化计算完成！结果 = ${total}`,
      msg: `🏆 演化计算完成！背包在容量 <code>${target}</code> 下的最优推导结果为 <strong>${total}</strong>。`,
      gridHighlight: { i: 0, j: target },
      activeNodeId: rootNode.id,
      treeRoot: cloneTree(rootNode)
    });

    return generated;
  }

  /**
   * 阶段 3: 二维 DP 状态表推导与空间依赖连线
   */
  public static compileStage3(config: KnapsackDomainConfig): UniversalStep[] {
    const { items, capacity, kind, anchorMap, oddCheck } = config;
    const n = items.length;
    const steps: UniversalStep[] = [];

    const lineOddCheck = anchorMap?.odd_check || 4;
    const lineInit = anchorMap?.init || 4;
    const lineInitRow = anchorMap?.init_row || anchorMap?.init_val || 5;
    const lineCond = anchorMap?.cond || anchorMap?.init_val || 9;
    const lineTransferMax = anchorMap?.transfer_max || anchorMap?.transfer || 11;
    const lineReturn = anchorMap?.return || 15;

    if (oddCheck?.hasOddFail) {
      steps.push({
        type: 'init',
        line: lineOddCheck,
        i: 0,
        j: 0,
        grid: [[0]],
        tag: `奇数总和 ${oddCheck.sum} 无法平分`,
        log: `| ❌ 数组总和 sum = ${oddCheck.sum} 为奇数，无法等分为两个整数子集，直接 return false`,
        msg: `数组总和 <code>sum = ${oddCheck.sum}</code> 为奇数，无法平分成两个相等的整数子集，直接返回 <strong>false</strong>。`
      });
      return steps;
    }

    const dp: (number | null)[][] = Array.from({ length: n }, () => new Array(capacity + 1).fill(null));

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '创建二维 DP 表',
      log: `| 📋 初始化 dp[${n}][${capacity + 1}] 二维表格`,
      msg: `创建 <code>${n} × ${capacity + 1}</code> 的二维 DP 状态表。`
    });

    // 1. 初始化第 0 件物品行
    const w0 = items[0].weight;
    const v0 = items[0].value;
    const isCountKind = kind === 'target-sum';
    if (isCountKind) {
      // 计数型背包：dp[0][0] = 1（不选有 1 种方案），dp[0][w0] += 1（选了也有 1 种方案）
      for (let j = 0; j <= capacity; j++) {
        dp[0][j] = 0;
      }
      dp[0][0] = 1;
      if (w0 <= capacity) dp[0][w0] = (dp[0][w0] ?? 0) + 1;
    } else {
      for (let j = 0; j <= capacity; j++) {
        dp[0][j] = j >= w0 ? v0 : 0;
      }
    }

    steps.push({
      type: 'init-row',
      line: lineInitRow,
      i: 0,
      j: Math.min(w0, capacity),
      grid: JSON.parse(JSON.stringify(dp)),
      gridHighlight: { i: 0, j: Math.min(w0, capacity) },
      tag: `初始化第 0 行: item[0]=${w0}`,
      log: `| 🎯 初始化首行: 当容量 j >= ${w0} 时，第 0 件物品可装入，dp[0][j] = ${v0}`,
      msg: `初始化第 0 件物品行：当背包容量 <code>j >= ${w0}</code> 时，可装入物品 0，<code>dp[0][j] = ${v0}</code>。`
    });

    // 2. 双重循环填表
    for (let i = 1; i < n; i++) {
      const wi = items[i].weight;
      const vi = items[i].value;

      for (let j = 0; j <= capacity; j++) {
        if (j < wi) {
          dp[i][j] = dp[i - 1][j] ?? 0;
          steps.push({
            type: 'update',
            line: lineCond,
            i,
            j,
            topI: i - 1,
            topJ: j,
            grid: JSON.parse(JSON.stringify(dp)),
            gridHighlight: { i, j },
            tag: `容量不足: dp[${i}][${j}] = ${dp[i][j]}`,
            log: `| ⚠️ 容量不足 (j=${j} < w=${wi}): dp[${i}][${j}] 继承上方 dp[${i - 1}][${j}] = ${dp[i][j]}`,
            msg: `容量不足 (<code>${j} < ${wi}</code>)：无法装入第 <code>${i}</code> 件物品，继承上方状态 <code>dp[${i - 1}][${j}] = <strong>${dp[i][j]}</strong></code>。`
          });
        } else {
          const valNotTake = dp[i - 1][j] ?? 0;
          const valTake = (dp[i - 1][j - wi] ?? 0) + (isCountKind ? 0 : vi);
          dp[i][j] = isCountKind ? (valNotTake + (dp[i - 1][j - wi] ?? 0)) : Math.max(valNotTake, valTake);

          steps.push({
            type: 'update',
            line: lineTransferMax,
            i,
            j,
            topI: i - 1,
            topJ: j,
            leftI: i - 1,
            leftJ: j - wi,
            grid: JSON.parse(JSON.stringify(dp)),
            gridHighlight: { i, j },
            tag: `决策取优: dp[${i}][${j}] = ${dp[i][j]}`,
            log: `| 📦 状态转移: dp[${i}][${j}] = max(不放:${valNotTake}, 放:${valTake}) = ${dp[i][j]}`,
            msg: `状态转移：<code>dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i - 1}][${j - wi}] + ${vi}) = <strong>${dp[i][j]}</strong></code>。`
          });
        }
      }
    }

    const finalAnswer = dp[n - 1][capacity];
    const isTargetMatched = kind === 'partition-subset' ? finalAnswer === capacity : true;

    steps.push({
      type: 'return',
      line: lineReturn,
      i: n - 1,
      j: capacity,
      grid: JSON.parse(JSON.stringify(dp)),
      gridHighlight: { i: n - 1, j: capacity },
      tag: `最终答案: ${isTargetMatched}`,
      log: `| 🏆 最终判定: dp[${n - 1}][${capacity}] = ${finalAnswer} ${kind === 'partition-subset' ? (isTargetMatched ? '== target 成立，判定为 true' : '!= target 不成立，判定为 false') : ''}`,
      msg: `🏆 计算完成！最终结果 <code>dp[${n - 1}][${capacity}] = <strong>${finalAnswer}</strong></code>${kind === 'partition-subset' ? (isTargetMatched ? '（与目标容量相等，判定为 <strong>true</strong>）' : '（无法达到目标容量，判定为 <strong>false</strong>）') : ''}。`
    });

    steps.forEach(step => {
      step.treeRoot = buildKnapsackDPDependencyTree(items, capacity, step.grid, step.i, step.j);
      step.activeNodeId = findNodeIdByCoord(step.treeRoot, step.i, step.j);
    });

    return steps;
  }

  /**
   * 阶段 4: 一维空间压缩与滚动数组推导
   */
  public static compileStage4(config: KnapsackDomainConfig): UniversalStep[] {
    const { items, capacity, kind, anchorMap, oddCheck } = config;
    const n = items.length;
    const steps: UniversalStep[] = [];

    const lineOddCheck = anchorMap?.odd_check || 4;
    const lineInit = anchorMap?.init || 3;
    const lineOuter = anchorMap?.outer_loop || anchorMap?.loop_i || 4;
    const lineInner = anchorMap?.inner_loop || anchorMap?.loop_j || 5;
    const lineTransfer = anchorMap?.transfer || anchorMap?.accumulate || 6;
    const lineReturn = anchorMap?.return || 9;

    if (oddCheck?.hasOddFail) {
      steps.push({
        type: 'init',
        line: lineOddCheck,
        i: 0,
        j: 0,
        dp1d: [0],
        memoj: 0,
        tag: `奇数总和 ${oddCheck.sum} 无法平分`,
        log: `| ❌ 数组总和 sum = ${oddCheck.sum} 为奇数，无法等分为两个整数子集，直接 return false`,
        msg: `数组总和 <code>sum = ${oddCheck.sum}</code> 为奇数，无法平分成两个相等的整数子集，直接返回 <strong>false</strong>。`
      });
      return steps;
    }

    const isCountKind = kind === 'target-sum';
    const dp: number[] = new Array(capacity + 1).fill(0);
    if (isCountKind) dp[0] = 1;

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      dp1d: [...dp],
      memoj: 0,
      highlightSlots: [0],
      tag: `一维数组初始化 dp[0..${capacity}]`,
      log: `| 📋 初始化一维滚动数组 dp[${capacity + 1}]，全部填充 0`,
      msg: `初始化长度为 <code>${capacity + 1}</code> 的一维滚动数组，全部置 0。`
    });

    for (let i = 0; i < n; i++) {
      const wi = items[i].weight;
      const vi = items[i].value;

      steps.push({
        type: 'outer-loop',
        line: lineOuter,
        i,
        j: 0,
        dp1d: [...dp],
        memoj: dp[capacity],
        currentI: i,
        tag: `考察第 ${i} 件物品: w=${wi}`,
        log: `| 🔄 外层循环: 考察第 ${i} 件物品 (重量 ${wi}, 价值 ${vi})`,
        msg: `外层循环：考察第 <code>${i}</code> 件物品（重量 <code>${wi}</code>，价值 <code>${vi}</code>）。`
      });

      // 0-1 背包从后向前逆序遍历，完全背包从前向后正序遍历
      const isReverse = kind !== 'complete-standard';

      if (isReverse) {
        for (let j = capacity; j >= wi; j--) {
          const oldVal = dp[j];
          const candidateVal = isCountKind ? dp[j - wi] : (dp[j - wi] + vi);
          dp[j] = isCountKind ? (oldVal + candidateVal) : Math.max(oldVal, candidateVal);

          steps.push({
            type: 'update-1d',
            line: lineTransfer,
            i,
            j,
            dp1d: [...dp],
            memoj: dp[j],
            highlightSlots: [j],
            srcSlots: [j - wi],
            currentI: i,
            currentJ: j,
            tag: `dp[${j}] = max(${oldVal}, dp[${j - wi}]+${vi}) = ${dp[j]}`,
            log: `| ⚡ 逆序更新 dp[${j}] = max(dp[${j}]:${oldVal}, dp[${j - wi}]+${vi}:${candidateVal}) = ${dp[j]}`,
            msg: `逆序更新槽位 <code>dp[${j}] = max(dp[${j}], dp[${j - wi}] + ${vi}) = <strong>${dp[j]}</strong></code>（依赖旧状态 <code>dp[${j - wi}]</code>，避免重复选取）。`
          });
        }
      } else {
        for (let j = wi; j <= capacity; j++) {
          const oldVal = dp[j];
          const candidateVal = dp[j - wi] + vi;
          dp[j] = Math.max(oldVal, candidateVal);

          steps.push({
            type: 'update-1d',
            line: lineTransfer,
            i,
            j,
            dp1d: [...dp],
            memoj: dp[j],
            highlightSlots: [j],
            srcSlots: [j - wi],
            currentI: i,
            currentJ: j,
            tag: `dp[${j}] = max(${oldVal}, dp[${j - wi}]+${vi}) = ${dp[j]}`,
            log: `| ⚡ 正序更新 dp[${j}] = max(dp[${j}]:${oldVal}, dp[${j - wi}]+${vi}:${candidateVal}) = ${dp[j]}`,
            msg: `正序更新槽位 <code>dp[${j}] = max(dp[${j}], dp[${j - wi}] + ${vi}) = <strong>${dp[j]}</strong></code>（允许同一物品多次装入）。`
          });
        }
      }
    }

    const finalAnswer = dp[capacity];
    const isTargetMatched = kind === 'partition-subset' ? finalAnswer === capacity : true;

    steps.push({
      type: 'return',
      line: lineReturn,
      i: n - 1,
      j: capacity,
      dp1d: [...dp],
      memoj: finalAnswer,
      highlightSlots: [capacity],
      tag: `一维压缩最终结果: ${finalAnswer}`,
      log: `| 🏆 一维空间压缩计算完成！dp[${capacity}] = ${finalAnswer} ${kind === 'partition-subset' ? (isTargetMatched ? '== target 成立，判定为 true' : '!= target 不成立，判定为 false') : ''}`,
      msg: `🏆 空间压缩推导完成！一维滚动数组最终结果 <code>dp[${capacity}] = <strong>${finalAnswer}</strong></code>${kind === 'partition-subset' ? (isTargetMatched ? '（恰好等于目标容量，返回 <strong>true</strong>）' : '（无法达到目标容量，返回 <strong>false</strong>）') : ''}。`
    });

    return steps;
  }
}
