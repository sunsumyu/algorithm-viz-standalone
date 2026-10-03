import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { cloneTree } from './strategy-helpers';

/** 组合总和 Ⅳ 专属推演策略 (LeetCode 377, 完全背包有序排列演化) */
export class KnapsackCombinationSum4Strategy implements IAlgorithmStrategy {
  public readonly modelId = 'combination-sum-iv';
  public canHandle(modelId: string): boolean { return modelId === this.modelId || modelId === 'combination-sum-4' || modelId === 'combination_sum_iv'; }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const rawNums = (model.defaultParams as any)?.nums || [1, 2, 3];
    const nums: number[] = (Array.isArray(rawNums) ? rawNums : String(rawNums).split(',')).map(Number);
    const target = Number((model.defaultParams as any)?.target ?? (model.defaultParams as any)?.n ?? 4);
    const { stage, isMemo, anchorMap } = params;
    return stage === 1 || stage === 2 ? this.compileStage1or2(nums, target, Boolean(isMemo), anchorMap) : this.compileStage3or4(nums, target, stage === 4, anchorMap);
  }

  private compileStage1or2(nums: number[], target: number, isMemo: boolean, map?: Record<string, number>): UniversalStep[] {
    const generated: UniversalStep[] = [], dpState: (number | null)[] = new Array(target + 1).fill(null);
    dpState[0] = 1;
    const activeStack: string[] = [], visitedCells = new Set<string>(), memoCache: Record<number, number> = {};
    let nodeIdCounter = 0, callCount = 0;
    const rootNode: UniversalTreeNode = { id: `node-${++nodeIdCounter}`, r: target, c: 0, val: `dfs(${target})`, status: 'current', children: [] };

    const emit = (node: UniversalTreeNode | undefined, data: Partial<UniversalStep>, remainVal: number) => {
      const curJ = Math.max(0, Math.min(remainVal, target));
      generated.push({
        i: 0, j: curJ, grid: [dpState.map(v => (v !== null ? v : 0))], dp1d: dpState.map(v => (v !== null ? v : 0)),
        activeStack: [...activeStack], visited: [...visitedCells], gridHighlight: { i: 0, j: curJ }, highlightSlots: [curJ],
        activeNodeId: node?.id, treeRoot: cloneTree(rootNode), ...data
      });
    };

    const dfs = (remain: number, curr?: UniversalTreeNode): number => {
      callCount++;
      const shouldRecord = isMemo || callCount <= 120, key = `${remain}`;
      activeStack.push(key); visitedCells.add(key);
      if (curr) curr.status = 'current';

      if (shouldRecord && curr) emit(curr, { type: 'entry', line: map?.dfs_start || 6, tag: `dfs(${remain})`, msg: `进入递归：待凑齐目标和 ${remain}` }, remain);

      if (remain === 0) {
        if (curr) { curr.status = 'base'; curr.tag = '🎯=1'; }
        if (shouldRecord && curr) emit(curr, { type: 'boundary', line: map?.base_match || 7, tag: '🎯 目标达成', msg: '构成 1 种有效排列' }, 0);
        activeStack.pop(); return 1;
      }
      if (remain < 0) {
        if (curr) { curr.status = 'pruned'; curr.tag = '🚫=0'; }
        if (shouldRecord && curr) emit(curr, { type: 'boundary', line: map?.base_overflow || 8, tag: '🚫 目标超扣', msg: '无法构成合法排列' }, 0);
        activeStack.pop(); return 0;
      }
      if (isMemo && memoCache[remain] !== undefined) {
        const cached = memoCache[remain];
        if (curr) { curr.status = 'visited'; curr.tag = `⚡=${cached}`; }
        emit(curr, { type: 'memo-hit', line: map?.cache_hit || (isMemo ? 10 : 9), tag: `⚡ 备忘录命中: ${cached}`, msg: `备忘录直接剪枝返回 ${cached}` }, remain);
        activeStack.pop(); return cached;
      }

      let totalWays = 0, bIdx = 0;
      for (const num of nums) {
        bIdx++;
        if (remain >= num) {
          if (shouldRecord && curr) emit(curr, { type: 'branch-call', line: map?.branch_take || (isMemo ? 12 : 9), branchIndex: bIdx, branchType: 'diag', varName: `+${num}`, tag: `选入 +${num}`, msg: `尝试选入数字 ${num}` }, remain);
          let childNode: UniversalTreeNode | undefined;
          if (shouldRecord && curr) {
            childNode = { id: `node-${++nodeIdCounter}`, r: remain - num, c: 0, val: `dfs(${remain - num})`, edgeLabel: `+${num}`, status: 'normal', children: [] };
            curr.children.push(childNode);
          }
          const branchRes = dfs(remain - num, childNode);
          totalWays += branchRes;
          if (shouldRecord && curr) emit(curr, { type: 'branch-return', line: map?.combine || (isMemo ? 14 : 11), branchIndex: bIdx, branchType: 'diag', varName: `+${num}`, subResult: branchRes, tag: `+${num} 返回: ${branchRes}`, msg: `以 +${num} 结尾累计 ${totalWays}` }, remain);
        }
      }

      if (isMemo) memoCache[remain] = totalWays;
      dpState[remain] = totalWays;
      if (curr) { curr.status = totalWays > 0 ? 'visited' : 'pruned'; curr.tag = `= ${totalWays}`; }
      if (shouldRecord && curr) emit(curr, { type: 'combine', line: map?.combine || (isMemo ? 14 : 11), tag: `汇总: ${totalWays}`, msg: `dfs(${remain}) 汇总共 ${totalWays} 种排列` }, remain);
      activeStack.pop(); return totalWays;
    };

    const total = dfs(target, rootNode);
    emit(rootNode, { type: 'return', line: map?.return || (isMemo ? 16 : 13), activeStack: [], tag: `总排列数: ${total}`, msg: `目标和 ${target} 的全部排列数为 ${total}` }, target);
    return generated;
  }

  private compileStage3or4(nums: number[], target: number, isCompressed: boolean, map?: Record<string, number>): UniversalStep[] {
    const steps: UniversalStep[] = [], dp: (number | null)[] = new Array(target + 1).fill(null);
    const lineInit = map?.init || 2, lineOuter = map?.outer_loop || map?.loop_i || 4;
    const lineTransfer = map?.transfer || map?.accumulate || 7, lineReturn = map?.return || 11;

    const emitTab = (data: Partial<UniversalStep>) => steps.push({ i: 0, grid: [[...dp]], dp1d: [...dp], ...data });
    emitTab({ type: 'init', line: lineInit, j: 0, highlightSlots: [0], tag: '初始化排列 DP 数组', msg: `初始化 dp[0..${target}]` });
    dp[0] = 1;
    emitTab({ type: 'init-val', line: lineInit, j: 0, memoj: 1, highlightSlots: [0], tag: 'dp[0] = 1', msg: '空集方案数初始化: 1' });

    for (let i = 1; i <= target; i++) {
      emitTab({ type: 'outer-loop', line: lineOuter, j: i, currentI: i, memoj: dp[i] ?? 0, highlightSlots: [i], tag: `容量 i = ${i}`, msg: `外层遍历容量 i = ${i}` });
      for (let j = 0; j < nums.length; j++) {
        const num = nums[j];
        if (i >= num) {
          const oldVal = dp[i] ?? 0, prevVal = dp[i - num] ?? 0;
          dp[i] = oldVal + prevVal;
          emitTab({
            type: isCompressed ? 'update-1d' : 'update', line: lineTransfer, j: i, currentI: i, currentJ: j,
            memoj: dp[i] ?? 0, highlightSlots: [i], srcSlots: [i - num], topI: 0, topJ: i - num,
            tag: `dp[${i}] += dp[${i - num}]`, msg: `末尾追加数字 ${num}，dp[${i}] = ${dp[i]}`
          });
        }
      }
    }
    const finalAns = dp[target] ?? 0;
    emitTab({ type: 'return', line: lineReturn, j: target, memoj: finalAns, highlightSlots: [target], tag: `结果: ${finalAns}`, msg: `排列总数 = ${finalAns}` });
    return steps;
  }
}
