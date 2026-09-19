import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { cloneTree } from './strategy-helpers';

/**
 * 组合总和 Ⅳ 专属推演策略 (KnapsackCombinationSum4Strategy)
 * 对应 LeetCode 377，属于完全背包的「排列」变体：
 *   - 递归展开时，每一层循环遍历所有的可选数字 nums；
 *   - 动态规划递推填表时，外层遍历目标和容量 target (1..target)，内层遍历数字数组 nums；
 *   - 阶段 1：暴力多路决策树展开（树深即排列长度）；
 *   - 阶段 2：基于剩余目标和 remain 的记忆化搜索剪枝；
 *   - 阶段 3：自底向上递推填表；
 *   - 阶段 4：一维滚动数组空间压缩。
 */
export class KnapsackCombinationSum4Strategy implements IAlgorithmStrategy {
  public readonly modelId = 'combination-sum-iv';

  public canHandle(modelId: string): boolean {
    return (
      modelId === this.modelId ||
      modelId === 'combination-sum-4' ||
      modelId === 'combination_sum_iv'
    );
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const rawNums = (model.defaultParams as any)?.nums || [1, 2, 3];
    const nums: number[] = Array.isArray(rawNums) ? rawNums.map(Number) : String(rawNums).split(',').map(Number);
    const target = Number((model.defaultParams as any)?.target ?? (model.defaultParams as any)?.n ?? 4);

    const { stage, isMemo, anchorMap } = params;

    if (stage === 1 || stage === 2) {
      return this.compileStage1or2(nums, target, Boolean(isMemo), anchorMap);
    }
    return this.compileStage3or4(nums, target, stage === 4, anchorMap);
  }

  /**
   * 阶段 1 & 2: 多路排列树递归与记忆化搜索
   */
  private compileStage1or2(
    nums: number[],
    target: number,
    isMemo: boolean,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const generated: UniversalStep[] = [];
    const lineEntry = anchorMap?.entry || 1;
    const lineDfsStart = anchorMap?.dfs_start || 6;
    const lineBaseMatch = anchorMap?.base_match || 7;
    const lineBaseOverflow = anchorMap?.base_overflow || 8;
    const lineCacheHit = anchorMap?.cache_hit || (isMemo ? 10 : 9);
    const lineBranchTake = anchorMap?.branch_take || (isMemo ? 12 : 9);
    const lineCombine = anchorMap?.combine || (isMemo ? 14 : 11);
    const lineReturn = anchorMap?.return || (isMemo ? 16 : 13);

    const memoCache: Record<number, number> = {};
    const dpState: (number | null)[] = new Array(target + 1).fill(null);
    dpState[0] = 1;
    const activeStack: string[] = [];
    const visitedCells: Set<string> = new Set();
    let nodeIdCounter = 0;
    let callCount = 0;
    const MAX_RECORDED_CALLS = 120;

    const rootNode: UniversalTreeNode = {
      id: `node-${++nodeIdCounter}`,
      r: target,
      c: 0,
      val: `dfs(${target})`,
      status: 'current',
      children: []
    };

    function dfs(remain: number, currentTreeNode?: UniversalTreeNode): number {
      callCount++;
      const shouldRecord = isMemo || callCount <= MAX_RECORDED_CALLS;
      const key = `${remain}`;
      activeStack.push(key);
      visitedCells.add(key);
      if (currentTreeNode) currentTreeNode.status = 'current';

      if (shouldRecord && currentTreeNode) {
        generated.push({
          type: 'entry',
          i: 0,
          j: Math.max(0, Math.min(remain, target)),
          grid: [dpState.map(v => (v !== null ? v : 0))],
          dp1d: dpState.map(v => (v !== null ? v : 0)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineDfsStart,
          tag: `dfs(${remain})`,
          log: `| ➡️ 进入搜索: dfs(剩余目标和=${remain})`,
          msg: `进入递归搜索：当前待凑齐的剩余目标和为 <code>${remain}</code>。`,
          gridHighlight: { i: 0, j: Math.max(0, Math.min(remain, target)) },
          highlightSlots: [Math.max(0, Math.min(remain, target))],
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode)
        });
      }

      // Base Case 1: 恰好凑成目标和 (remain === 0)
      if (remain === 0) {
        if (currentTreeNode) {
          currentTreeNode.status = 'base';
          currentTreeNode.tag = '🎯=1';
        }
        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'boundary',
            i: 0,
            j: 0,
            grid: [dpState.map(v => (v !== null ? v : 0))],
            dp1d: dpState.map(v => (v !== null ? v : 0)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineBaseMatch,
            tag: '🎯 目标达成: 1 种有效排列',
            log: `| 🎯 边界命中: remain = 0，已凑出有效排列，返回 1`,
            msg: `🎯 边界命中：剩余目标和已精确扣减为 <code>0</code>，构成 1 种有效排列，返回 <strong>1</strong>。`,
            gridHighlight: { i: 0, j: 0 },
            highlightSlots: [0],
            activeNodeId: currentTreeNode.id,
            treeRoot: cloneTree(rootNode)
          });
        }
        activeStack.pop();
        return 1;
      }

      // Base Case 2: 目标和超扣 (remain < 0)
      if (remain < 0) {
        if (currentTreeNode) {
          currentTreeNode.status = 'pruned';
          currentTreeNode.tag = '🚫=0';
        }
        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'boundary',
            i: 0,
            j: 0,
            grid: [dpState.map(v => (v !== null ? v : 0))],
            dp1d: dpState.map(v => (v !== null ? v : 0)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineBaseOverflow,
            tag: '🚫 目标超扣: 0 种方案',
            log: `| 🚫 剪枝越界: remain < 0，无法继续选取，返回 0`,
            msg: `🚫 边界拦截：剩余目标和已超扣为负数 <code>${remain}</code>，无法构成合法排列，返回 <strong>0</strong>。`,
            gridHighlight: { i: 0, j: 0 },
            highlightSlots: [0],
            activeNodeId: currentTreeNode.id,
            treeRoot: cloneTree(rootNode)
          });
        }
        activeStack.pop();
        return 0;
      }

      // 记忆化备忘录命中
      if (isMemo && memoCache[remain] !== undefined) {
        const cachedVal = memoCache[remain];
        if (currentTreeNode) {
          currentTreeNode.status = 'visited';
          currentTreeNode.tag = `⚡=${cachedVal}`;
        }
        generated.push({
          type: 'memo-hit',
          i: 0,
          j: remain,
          grid: [dpState.map(v => (v !== null ? v : 0))],
          dp1d: dpState.map(v => (v !== null ? v : 0)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineCacheHit,
          tag: `⚡ 备忘录命中: ${cachedVal}`,
          log: `| ⚡ 备忘录命中: memo[${remain}] = ${cachedVal}，直接剪枝返回！`,
          msg: `⚡ 备忘录命中：状态 <code>remain = ${remain}</code> 先前已推导过结果为 <strong>${cachedVal}</strong>，直接剪枝返回！`,
          gridHighlight: { i: 0, j: remain },
          highlightSlots: [remain],
          activeNodeId: currentTreeNode?.id,
          treeRoot: cloneTree(rootNode)
        });
        activeStack.pop();
        return cachedVal;
      }

      let totalWays = 0;
      let branchIdx = 0;

      // 遍历所有可用数字展开分支
      for (const num of nums) {
        branchIdx++;
        if (remain >= num) {
          if (shouldRecord && currentTreeNode) {
            generated.push({
              type: 'branch-call',
              i: 0,
              j: remain,
              targetI: 0,
              targetJ: remain - num,
              branchIndex: branchIdx,
              branchType: 'diag',
              varName: `+${num}`,
              grid: [dpState.map(v => (v !== null ? v : 0))],
              dp1d: dpState.map(v => (v !== null ? v : 0)),
              activeStack: [...activeStack],
              visited: [...visitedCells],
              line: lineBranchTake,
              tag: `尝试选入数字 +${num}`,
              log: `| 📦 分支尝试: 选入数字 ${num}，剩余目标和变为 ${remain - num}，进入 dfs(${remain - num})`,
              msg: `📦 尝试选入数字 <code>${num}</code>，剩余目标和变为 <code>${remain - num}</code>。`,
              gridHighlight: { i: 0, j: remain },
              highlightSlots: [remain],
              activeNodeId: currentTreeNode.id,
              treeRoot: cloneTree(rootNode)
            });
          }

          let childNode: UniversalTreeNode | undefined;
          if (shouldRecord && currentTreeNode) {
            childNode = {
              id: `node-${++nodeIdCounter}`,
              r: remain - num,
              c: 0,
              val: `dfs(${remain - num})`,
              edgeLabel: `+${num}`,
              status: 'normal',
              children: []
            };
            currentTreeNode.children.push(childNode);
          }

          const branchRes = dfs(remain - num, childNode);
          totalWays += branchRes;

          // 🌟【Call-Return Parity 闭环】：子递归返回后发射回溯赋值帧
          if (shouldRecord && currentTreeNode) {
            generated.push({
              type: 'branch-return',
              i: 0,
              j: remain,
              targetI: 0,
              targetJ: remain - num,
              branchIndex: branchIdx,
              varName: `+${num}`,
              subResult: branchRes,
              grid: [dpState.map(v => (v !== null ? v : 0))],
              dp1d: dpState.map(v => (v !== null ? v : 0)),
              activeStack: [...activeStack],
              visited: [...visitedCells],
              line: lineCombine,
              tag: `+${num} 返回: ${branchRes}`,
              log: `| ↩️ 分支返回: 选入数字 ${num} 得到 ${branchRes} 种子排列，当前累计 ${totalWays}`,
              msg: `分支返回：以 <code>+${num}</code> 结尾的排列数为 <code>${branchRes}</code>，当前累计 <code>totalWays = <strong>${totalWays}</strong></code>。`,
              gridHighlight: { i: 0, j: remain },
              highlightSlots: [remain],
              activeNodeId: currentTreeNode.id,
              treeRoot: cloneTree(rootNode)
            });
          }
        }
      }

      if (isMemo) memoCache[remain] = totalWays;
      dpState[remain] = totalWays;

      if (currentTreeNode) {
        currentTreeNode.status = totalWays > 0 ? 'visited' : 'pruned';
        currentTreeNode.tag = `= ${totalWays}`;
      }

      if (shouldRecord && currentTreeNode) {
        generated.push({
          type: 'combine',
          i: 0,
          j: remain,
          grid: [dpState.map(v => (v !== null ? v : 0))],
          dp1d: dpState.map(v => (v !== null ? v : 0)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineCombine,
          tag: `汇总方案数: ${totalWays}`,
          log: `| ✨ 合并分支: dfs(${remain}) 累加得到 ${totalWays} 种排列${isMemo ? ' [存入 memo]' : ''}`,
          msg: `✨ 汇总各数字结尾分支：<code>dfs(${remain}) = <strong>${totalWays}</strong></code> 种排列方案。`,
          gridHighlight: { i: 0, j: remain },
          highlightSlots: [remain],
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode)
        });
      }

      activeStack.pop();
      return totalWays;
    }

    const total = dfs(target, rootNode);

    generated.push({
      type: 'return',
      i: 0,
      j: target,
      grid: [dpState.map(v => (v !== null ? v : 0))],
      dp1d: dpState.map(v => (v !== null ? v : 0)),
      activeStack: [],
      visited: [...visitedCells],
      line: lineReturn,
      tag: `最终排列总数: ${total}`,
      log: `| 🏆 组合总和 Ⅳ 递归推导完成！总排列数 = ${total}`,
      msg: `🏆 演化推导完成！组成目标和 <code>${target}</code> 的全部排列总数为 <strong>${total}</strong> 种。`,
      gridHighlight: { i: 0, j: target },
      highlightSlots: [target],
      activeNodeId: rootNode.id,
      treeRoot: cloneTree(rootNode)
    });

    return generated;
  }

  /**
   * 阶段 3 & 4: 递推填表与一维滚动数组
   */
  private compileStage3or4(
    nums: number[],
    target: number,
    isCompressed: boolean,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const lineInit = anchorMap?.init || 2;
    const lineOuter = anchorMap?.outer_loop || anchorMap?.loop_i || 4;
    const lineInner = anchorMap?.inner_loop || anchorMap?.loop_j || 5;
    const lineTransfer = anchorMap?.transfer || anchorMap?.accumulate || 7;
    const lineReturn = anchorMap?.return || 11;

    const dp: (number | null)[] = new Array(target + 1).fill(null);

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      grid: [[...dp]],
      dp1d: [...dp],
      highlightSlots: [0],
      tag: '初始化排列 DP 数组',
      log: `| 📋 初始化长度为 ${target + 1} 的状态数组`,
      msg: `初始化：分配长度为 <code>${target + 1}</code> 的排列状态表 <code>dp[0..${target}]</code>。`
    });

    dp[0] = 1;
    steps.push({
      type: 'init-val',
      line: lineInit,
      i: 0,
      j: 0,
      grid: [[...dp]],
      dp1d: [...dp],
      memoj: 1,
      highlightSlots: [0],
      tag: '基础条件: dp[0] = 1',
      log: '| 📋 初始空集方案数：凑齐和为 0 只有 1 种选法（空集）',
      msg: '空集方案数初始化：<code>dp[0] = 1</code>。'
    });

    for (let i = 1; i <= target; i++) {
      steps.push({
        type: 'outer-loop',
        line: lineOuter,
        i: 0,
        j: i,
        grid: [[...dp]],
        dp1d: [...dp],
        memoj: dp[i] ?? 0,
        currentI: i,
        highlightSlots: [i],
        tag: `外层遍历容量 i = ${i}`,
        log: `| 🔄 外层循环: 考察背包容量 i = ${i}（先容量后物品，推导有序排列）`,
        msg: `外层循环：当前背包目标容量 <code>i = ${i}</code>（求排列数必须先遍历容量）。`
      });

      for (let j = 0; j < nums.length; j++) {
        const num = nums[j];

        if (i >= num) {
          const oldVal = dp[i] ?? 0;
          const prevVal = dp[i - num] ?? 0;
          dp[i] = oldVal + prevVal;

          steps.push({
            type: isCompressed ? 'update-1d' : 'update',
            line: lineTransfer,
            i: 0,
            j: i,
            grid: [[...dp]],
            dp1d: [...dp],
            memoj: dp[i] ?? 0,
            currentI: i,
            currentJ: j,
            srcSlots: [i - num],
            highlightSlots: [i],
            topI: 0,
            topJ: i - num,
            tag: `以 +${num} 结尾: dp[${i}] = ${oldVal} + ${prevVal} = ${dp[i]}`,
            log: `| ⚡ 累加排列: 末尾追加数字 ${num}，dp[${i}] += dp[${i - num}] (${prevVal}) = ${dp[i]}`,
            msg: `以数字 <code>${num}</code> 作为排列末尾：<code>dp[${i}] += dp[${i} - ${num}] (${prevVal}) = <strong>${dp[i]}</strong></code> 种。`
          });
        }
      }
    }

    const finalAnswer = dp[target] ?? 0;

    steps.push({
      type: 'return',
      line: lineReturn,
      i: 0,
      j: target,
      grid: [[...dp]],
      dp1d: [...dp],
      memoj: finalAnswer,
      highlightSlots: [target],
      tag: `最终排列总数: ${finalAnswer}`,
      log: `| 🏆 计算完成！dp[${target}] = ${finalAnswer} 种排列方案`,
      msg: `🏆 状态转移推导完成！凑成目标和 <code>${target}</code> 的不同排列总数为 <strong>${finalAnswer}</strong> 种。`
    });

    return steps;
  }
}
