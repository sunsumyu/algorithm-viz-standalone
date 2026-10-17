import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { KnapsackStepMatrixCompiler, type KnapsackDomainConfig } from './knapsack-step-matrix-compiler';
import { cloneTree } from './strategy-helpers';
import { snapshotGrid2D } from './grid-snapshot';

export type KnapsackFamilyModelId =
  | 'last-stone-weight-ii'
  | 'complete-knapsack'
  | 'coin-change-ii'
  | 'coin-change'
  | 'perfect-squares'
  | 'ones-and-zeroes'
  | 'word-break'
  | 'multiple-knapsack'
  | 'profitable-schemes'
  | 'coins-from-piles';

/**
 * 背包 DP 扩展家族多态策略 (KnapsackFamilyStrategy)
 * 覆盖：最后一块石头的重量 II、完全背包、零钱兑换 I/II、完全平方数、一和零、单词拆分、多重背包、盈利计划
 */
export class KnapsackFamilyStrategy implements IAlgorithmStrategy {
  constructor(public readonly modelId: KnapsackFamilyModelId) {}

  public canHandle(modelId: string): boolean {
    return (
      modelId === this.modelId ||
      (this.modelId === 'last-stone-weight-ii' && (modelId === 'last-stone-weight-2' || modelId === 'last_stone_weight_ii' || modelId === 'last-stone-weight-ii-standard')) ||
      (this.modelId === 'complete-knapsack' && (modelId === 'unbounded-knapsack' || modelId === 'complete_knapsack')) ||
      (this.modelId === 'coin-change-ii' && (modelId === 'coin-change-2' || modelId === 'coin2')) ||
      (this.modelId === 'coin-change' && modelId === 'coin1') ||
      (this.modelId === 'perfect-squares' && (modelId === 'num-squares' || modelId === 'perfect_squares')) ||
      (this.modelId === 'ones-and-zeroes' && modelId === 'ones-zeros') ||
      (this.modelId === 'word-break' && modelId === 'word_break') ||
      (this.modelId === 'multiple-knapsack' && modelId === 'bounded-knapsack') ||
      (this.modelId === 'coins-from-piles' && (
        modelId === 'coins-from-piles' ||
        modelId === 'coins-from-piles-074' ||
        modelId === 'class074-code02' ||
        modelId === 'maximum-value-of-k-coins-from-piles' ||
        modelId === 'leetcode-2218'
      ))
    );
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, isMemo, anchorMap } = params;

    switch (this.modelId) {
      case 'last-stone-weight-ii':
        return this.compileLastStoneWeightII(model, stage, Boolean(isMemo), anchorMap);
      case 'complete-knapsack':
        return this.compileCompleteKnapsack(model, stage, Boolean(isMemo), anchorMap);
      case 'coin-change-ii':
        return this.compileCoinChangeII(model, stage, Boolean(isMemo), anchorMap);
      case 'coin-change':
        return this.compileCoinChange(model, stage, Boolean(isMemo), anchorMap);
      case 'perfect-squares':
        return this.compilePerfectSquares(model, stage, Boolean(isMemo), anchorMap);
      case 'ones-and-zeroes':
        return this.compileOnesAndZeroes(model, stage, Boolean(isMemo), anchorMap);
      case 'word-break':
        return this.compileWordBreak(model, stage, Boolean(isMemo), anchorMap);
      case 'multiple-knapsack':
        return this.compileMultipleKnapsack(model, stage, Boolean(isMemo), anchorMap);
      case 'profitable-schemes':
        return this.compileProfitableSchemes(model, stage, Boolean(isMemo), anchorMap);
      case 'coins-from-piles':
        return this.compileCoinsFromPiles(model, params);
      default:
        return [];
    }
  }

  // =========================================================================
  // 1. 最后一块石头的重量 II (Last Stone Weight II, LC 1049)
  // =========================================================================
  private compileLastStoneWeightII(
    model: IYamlAlgorithmModel,
    stage: number,
    isMemo: boolean,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const rawStones = (model.defaultParams as any)?.stones || [2, 7, 4, 1, 8, 1];
    const stones: number[] = Array.isArray(rawStones) ? rawStones.map(Number) : String(rawStones).split(',').map(Number);
    const sum = stones.reduce((a, b) => a + b, 0);
    const target = Math.floor(sum / 2);

    const domainConfig: KnapsackDomainConfig = {
      modelId: 'last-stone-weight-ii',
      kind: 'last-stone-weight',
      items: stones.map((stone, idx) => ({
        index: idx,
        weight: stone,
        value: stone,
        label: `stone[${idx}]=${stone}`
      })),
      capacity: target,
      anchorMap,
      isMemo: Boolean(isMemo),
      oddCheck: {
        hasOddFail: false,
        sum
      }
    };

    return KnapsackStepMatrixCompiler.compile(domainConfig, stage);
  }

  // =========================================================================
  // 2. 完全背包理论/标准 (Complete Knapsack)
  // =========================================================================
  private compileCompleteKnapsack(
    model: IYamlAlgorithmModel,
    stage: number,
    isMemo: boolean,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const rawWeights = (model.defaultParams as any)?.weights || [1, 3, 4];
    const rawValues = (model.defaultParams as any)?.values || [15, 20, 30];
    const weights: number[] = Array.isArray(rawWeights) ? rawWeights.map(Number) : String(rawWeights).split(',').map(Number);
    const values: number[] = Array.isArray(rawValues) ? rawValues.map(Number) : String(rawValues).split(',').map(Number);
    const capacity = Number((model.defaultParams as any)?.bagWeight ?? (model.defaultParams as any)?.n ?? 4);

    const domainConfig: KnapsackDomainConfig = {
      modelId: 'complete-knapsack',
      kind: 'complete-standard',
      items: weights.map((w, idx) => ({
        index: idx,
        weight: w,
        value: values[idx] ?? w,
        label: `物品${idx}(w=${w},v=${values[idx] ?? w})`
      })),
      capacity,
      anchorMap,
      isMemo: Boolean(isMemo)
    };

    return KnapsackStepMatrixCompiler.compile(domainConfig, stage);
  }

  // =========================================================================
  // 3. 零钱兑换 II (Coin Change II, LC 518 - 求组合数)
  // =========================================================================
  private compileCoinChangeII(
    model: IYamlAlgorithmModel,
    stage: number,
    isMemo: boolean,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const rawCoins = (model.defaultParams as any)?.coins || [1, 2, 5];
    const coins: number[] = Array.isArray(rawCoins) ? rawCoins.map(Number) : String(rawCoins).split(',').map(Number);
    const amount = Number((model.defaultParams as any)?.amount ?? (model.defaultParams as any)?.n ?? 5);

    const domainConfig: KnapsackDomainConfig = {
      modelId: 'coin-change-ii',
      kind: 'coin-change-count',
      items: coins.map((c, idx) => ({
        index: idx,
        weight: c,
        value: c,
        label: `面值${c}`
      })),
      capacity: amount,
      anchorMap,
      isMemo: Boolean(isMemo)
    };

    return KnapsackStepMatrixCompiler.compile(domainConfig, stage);
  }

  // =========================================================================
  // 4. 零钱兑换 (Coin Change, LC 322 - 求最少硬币数)
  // =========================================================================
  private compileCoinChange(
    model: IYamlAlgorithmModel,
    stage: number,
    isMemo: boolean,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const rawCoins = (model.defaultParams as any)?.coins || [1, 2, 5];
    const coins: number[] = Array.isArray(rawCoins) ? rawCoins.map(Number) : String(rawCoins).split(',').map(Number);
    const amount = Number((model.defaultParams as any)?.amount ?? (model.defaultParams as any)?.n ?? 5);

    const domainConfig: KnapsackDomainConfig = {
      modelId: 'coin-change',
      kind: 'coin-change-min',
      items: coins.map((c, idx) => ({
        index: idx,
        weight: c,
        value: 1,
        label: `面值${c}`
      })),
      capacity: amount,
      anchorMap,
      isMemo: Boolean(isMemo)
    };

    return KnapsackStepMatrixCompiler.compile(domainConfig, stage);
  }

  // =========================================================================
  // 5. 完全平方数 (Perfect Squares, LC 279)
  // =========================================================================
  private compilePerfectSquares(
    model: IYamlAlgorithmModel,
    stage: number,
    isMemo: boolean,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const n = Number((model.defaultParams as any)?.n ?? 12);
    const m = Math.floor(Math.sqrt(n));
    const items = [];
    for (let i = 1; i <= m; i++) {
      const sq = i * i;
      items.push({
        index: i - 1,
        weight: sq,
        value: 1,
        label: `${i}²=${sq}`
      });
    }

    const domainConfig: KnapsackDomainConfig = {
      modelId: 'perfect-squares',
      kind: 'coin-change-min',
      items,
      capacity: n,
      anchorMap,
      isMemo: Boolean(isMemo)
    };

    return KnapsackStepMatrixCompiler.compile(domainConfig, stage);
  }

  // =========================================================================
  // 6. 一和零 (Ones and Zeroes, LC 474 - 二维费用背包)
  // =========================================================================
  private compileOnesAndZeroes(
    model: IYamlAlgorithmModel,
    stage: number,
    isMemo: boolean,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const rawStrs = (model.defaultParams as any)?.strs || ['10', '0001', '111001', '1', '0'];
    const strs: string[] = Array.isArray(rawStrs) ? rawStrs.map(String) : String(rawStrs).split(',');
    const m = Number((model.defaultParams as any)?.m ?? 5); // 0 上限
    const n = Number((model.defaultParams as any)?.n ?? 3); // 1 上限

    if (stage === 1 || stage === 2) {
      return this.compileOnesAndZeroesStage1or2(strs, m, n, isMemo, anchorMap);
    }
    if (stage === 3) {
      return this.compileOnesAndZeroesStage3(strs, m, n, anchorMap);
    }
    return this.compileOnesAndZeroesStage4(strs, m, n, anchorMap);
  }

  private compileOnesAndZeroesStage1or2(
    strs: string[],
    m: number,
    n: number,
    isMemo: boolean,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const lineEntry = anchorMap?.entry || 1;
    const lineDfsStart = anchorMap?.dfs_start || 2;
    const lineDfsEntry = anchorMap?.dfs_entry || 4;
    const lineBoundary = anchorMap?.boundary || 5;
    const lineCacheHit = anchorMap?.cache_hit || (isMemo ? 6 : 5);
    const lineBranchNotTake = anchorMap?.branch_not_take || (isMemo ? 7 : 6);
    const lineCount = anchorMap?.count || (isMemo ? 9 : 8);
    const lineCondTake = anchorMap?.cond_take || (isMemo ? 10 : 9);
    const lineBranchTake = anchorMap?.branch_take || (isMemo ? 11 : 10);
    const lineCombine = anchorMap?.combine || (isMemo ? 13 : 12);
    const lineReturn = anchorMap?.return || lineCombine;

    const dpGrid: (number | null)[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));
    const memoCache: Record<string, number> = {};
    const activeStack: string[] = [];
    const visitedCells: Set<string> = new Set();
    let nodeIdCounter = 0;
    let callCount = 0;
    const MAX_CALLS = isMemo ? 80 : 50;

    const rootNode: UniversalTreeNode = {
      id: `node-${++nodeIdCounter}`,
      r: m,
      c: n,
      val: `dfs(0, ${m}, ${n})`,
      status: 'current',
      children: []
    };

    // Step 0: Entry
    steps.push({
      type: 'entry',
      line: lineEntry,
      i: 0,
      j: m,
      grid: snapshotGrid2D(dpGrid),
      activeStack: [],
      visited: [],
      tag: `函数入口: 一和零 (${strs.length}个串, m=${m}, n=${n})`,
      log: `| 🎯 函数入口：一和零（二维费用 0-1 背包），字符串序列=[${strs.join(', ')}]，容量上限 0最多${m}个，1最多${n}个`,
      msg: `函数入口：待考察字符串列表 <code>[${strs.join(', ')}]</code>，容量约束为最多 <code>${m}</code> 个 0 与 <code>${n}</code> 个 1。`
    });

    // Step 1: Dfs Start
    steps.push({
      type: 'entry',
      line: lineDfsStart,
      i: 0,
      j: m,
      grid: snapshotGrid2D(dpGrid),
      activeStack: [],
      visited: [],
      tag: `启动递归: dfs(i=0, zeros=${m}, ones=${n})`,
      log: `| 🚀 启动顶层递归调用：dfs(strs, i=0, zeros=${m}, ones=${n})`,
      msg: `启动主函数递归调用：<code>dfs(strs, 0, ${m}, ${n})</code>。`
    });

    const countCost = (s: string) => {
      let c0 = 0, c1 = 0;
      for (const ch of s) {
        if (ch === '0') c0++;
        else if (ch === '1') c1++;
      }
      return [c0, c1];
    };

    const dfs = (i: number, zeros: number, ones: number, currentNode?: UniversalTreeNode): number => {
      callCount++;
      const shouldRecord = isMemo || callCount <= MAX_CALLS;
      const key = `${i}-${zeros}-${ones}`;
      activeStack.push(key);
      visitedCells.add(key);
      if (currentNode) currentNode.status = 'current';

      // Callee Entry Frame
      if (shouldRecord && currentNode) {
        steps.push({
          type: 'entry',
          line: lineDfsEntry,
          i: Math.min(i, strs.length - 1),
          j: zeros,
          grid: snapshotGrid2D(dpGrid),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          tag: `dfs(i=${i}, 0限=${zeros}, 1限=${ones})`,
          log: `| 📥 进入 dfs(i=${i}, zeros=${zeros}, ones=${ones}) [考察串: "${strs[i] || 'Ø'}"]`,
          msg: `进入递归函数：考察物品 <code>i=${i} ("${strs[i] || 'Ø'}")</code>，当前剩余 0 容量 <code>${zeros}</code>，1 容量 <code>${ones}</code>。`,
          activeNodeId: currentNode.id,
          tree: cloneTree(rootNode)
        });
      }

      // Boundary check: i >= strs.length
      if (i >= strs.length) {
        if (shouldRecord && currentNode) {
          currentNode.status = 'resolved';
          currentNode.val = `${currentNode.val} -> 0`;
          steps.push({
            type: 'boundary',
            line: lineBoundary,
            i: Math.min(i, strs.length - 1),
            j: zeros,
            grid: snapshotGrid2D(dpGrid),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            tag: `越界触底: i=${i} >= ${strs.length} -> 0`,
            log: `| 🛑 【越界触底】已考察完所有字符串物品 (i=${i} >= ${strs.length})，无更多可采纳物品，返回 0`,
            msg: `边界条件触发：已考察完全部字符串 <code>(i=${i} >= ${strs.length})</code>，返回 <strong>0</strong>。`,
            activeNodeId: currentNode.id,
            tree: cloneTree(rootNode)
          });
        }
        activeStack.pop();
        return 0;
      }

      // Cache hit check (Stage 2)
      if (isMemo && memoCache[key] !== undefined) {
        const cached = memoCache[key];
        if (currentNode) {
          currentNode.status = 'pruned';
          currentNode.val = `${currentNode.val} -> [cache: ${cached}]`;
          steps.push({
            type: 'cache-hit',
            line: lineCacheHit,
            i,
            j: zeros,
            grid: snapshotGrid2D(dpGrid),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            tag: `备忘录命中 memo[${i}][${zeros}][${ones}] = ${cached}`,
            log: `| ⚡ 【备忘录命中】子状态 (i=${i}, 0=${zeros}, 1=${ones}) 此前已求解，直接返回缓存值 ${cached}`,
            msg: `备忘录剪枝命中：状态 <code>(i=${i}, zeros=${zeros}, ones=${ones})</code> 缓存直接返回 <strong>${cached}</strong>。`,
            activeNodeId: currentNode.id,
            tree: cloneTree(rootNode)
          });
        }
        activeStack.pop();
        return cached;
      }

      // 1. 分支 1: 不选当前串 (not_take)
      const childNotTake: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: zeros,
        c: ones,
        val: `dfs(${i + 1},${zeros},${ones})`,
        status: 'pending',
        edgeLabel: '不选',
        children: []
      };
      if (currentNode) currentNode.children.push(childNotTake);

      if (shouldRecord) {
        steps.push({
          type: 'branch-call',
          line: lineBranchNotTake,
          i,
          j: zeros,
          branchType: 'top',
          varName: 'notTake',
          grid: snapshotGrid2D(dpGrid),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          tag: `分支 1 (不选): 深入 dfs(i=${i + 1}, 0=${zeros}, 1=${ones})`,
          log: `| 🌿 【决策分支 1: 不选】放弃字符串 "${strs[i]}"，深入 dfs(i=${i + 1}, zeros=${zeros}, ones=${ones})`,
          msg: `【决策分支 1: 不选当前串】放弃选入 <code>"${strs[i]}"</code>，状态保持容量不变，调用 <code>dfs(${i + 1}, ${zeros}, ${ones})</code>。`,
          activeNodeId: currentNode?.id,
          tree: cloneTree(rootNode)
        });
      }

      const notTakeVal = dfs(i + 1, zeros, ones, childNotTake);

      // Call-Return Parity: not_take return
      if (shouldRecord) {
        steps.push({
          type: 'branch-return',
          line: lineBranchNotTake,
          i,
          j: zeros,
          branchType: 'top',
          subResult: notTakeVal,
          grid: snapshotGrid2D(dpGrid),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          tag: `notTake = ${notTakeVal}`,
          log: `| ↩️ 【回溯赋值】子递归返回父层 dfs(i=${i}, 0=${zeros}, 1=${ones})，notTake = ${notTakeVal}`,
          msg: `子递归返回赋值：当前局部变量 <code>notTake = <strong>${notTakeVal}</strong></code>。`,
          activeNodeId: currentNode?.id,
          tree: cloneTree(rootNode)
        });
      }

      // 2. 统计当前字符串开销 (count)
      const [c0, c1] = countCost(strs[i]);
      if (shouldRecord) {
        steps.push({
          type: 'eval',
          line: lineCount,
          i,
          j: zeros,
          grid: snapshotGrid2D(dpGrid),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          tag: `count("${strs[i]}"): 0耗=${c0}, 1耗=${c1}`,
          log: `| 📊 统计字符串 "${strs[i]}" 字符消耗: 消耗 ${c0} 个 '0', 消耗 ${c1} 个 '1'`,
          msg: `统计字符开销：<code>"${strs[i]}"</code> 包含 <code>${c0}</code> 个 0 与 <code>${c1}</code> 个 1。`,
          activeNodeId: currentNode?.id,
          tree: cloneTree(rootNode)
        });
      }

      // 3. 容量判断 (cond_take)
      const canTake = zeros >= c0 && ones >= c1;
      if (shouldRecord) {
        steps.push({
          type: 'cond',
          line: lineCondTake,
          i,
          j: zeros,
          grid: snapshotGrid2D(dpGrid),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          tag: `容量判定: (${zeros}>=${c0} && ${ones}>=${c1}) -> ${canTake}`,
          log: `| ⚖️ 检查是否能容纳 "${strs[i]}": 0容量(${zeros} >= ${c0}) 且 1容量(${ones} >= ${c1}) => ${canTake}`,
          msg: `检查容量限制：当前 0 剩余 <code>${zeros}</code> (需 ${c0})，1 剩余 <code>${ones}</code> (需 ${c1})，判定结果：<strong>${canTake ? '可容纳 ✓' : '超出限制 ✗'}</strong>。`,
          activeNodeId: currentNode?.id,
          tree: cloneTree(rootNode)
        });
      }

      // 4. 分支 2: 选入当前串 (take)
      let takeVal = 0;
      if (canTake) {
        const childTake: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: zeros - c0,
          c: ones - c1,
          val: `dfs(${i + 1},${zeros - c0},${ones - c1})`,
          status: 'pending',
          edgeLabel: '选入',
          children: []
        };
        if (currentNode) currentNode.children.push(childTake);

        if (shouldRecord) {
          steps.push({
            type: 'branch-call',
            line: lineBranchTake,
            i,
            j: zeros,
            branchType: 'diag',
            varName: 'take',
            grid: snapshotGrid2D(dpGrid),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            tag: `分支 2 (选入): 深入 dfs(i=${i + 1}, 0=${zeros - c0}, 1=${ones - c1})`,
            log: `| 🌿 【决策分支 2: 选入】采纳字符串 "${strs[i]}"，扣减容量后深入 dfs(i=${i + 1}, zeros=${zeros - c0}, ones=${ones - c1})`,
            msg: `【决策分支 2: 选入当前串】采纳 <code>"${strs[i]}"</code>，扣减对应开销，调用 <code>dfs(${i + 1}, ${zeros - c0}, ${ones - c1})</code>。`,
            activeNodeId: currentNode?.id,
            tree: cloneTree(rootNode)
          });
        }

        const subTake = dfs(i + 1, zeros - c0, ones - c1, childTake);
        takeVal = 1 + subTake;

        // Call-Return Parity: take return
        if (shouldRecord) {
          steps.push({
            type: 'branch-return',
            line: lineBranchTake,
            i,
            j: zeros,
            branchType: 'diag',
            subResult: takeVal,
            grid: snapshotGrid2D(dpGrid),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            tag: `take = 1 + ${subTake} = ${takeVal}`,
            log: `| ↩️ 【回溯赋值】子递归返回父层 dfs(i=${i}, 0=${zeros}, 1=${ones})，take = 1 + ${subTake} = ${takeVal}`,
            msg: `子递归返回赋值：采纳当前串收益计算 <code>take = 1 + ${subTake} = <strong>${takeVal}</strong></code>。`,
            activeNodeId: currentNode?.id,
            tree: cloneTree(rootNode)
          });
        }
      }

      // 5. 汇总决策 (combine)
      const res = Math.max(notTakeVal, takeVal);
      if (isMemo) memoCache[key] = res;
      dpGrid[zeros][ones] = res;

      if (currentNode) {
        currentNode.status = 'resolved';
        currentNode.val = `${currentNode.val} -> ${res}`;
      }

      if (shouldRecord) {
        steps.push({
          type: 'record',
          line: lineCombine,
          i,
          j: zeros,
          grid: snapshotGrid2D(dpGrid),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          tag: `max(notTake=${notTakeVal}, take=${takeVal}) = ${res}`,
          log: `| 🔄 【汇总决策】dfs(i=${i}, 0=${zeros}, 1=${ones}) = max(不选=${notTakeVal}, 选入=${takeVal}) = ${res}`,
          msg: `决策汇总：取两者较大值 <code>max(${notTakeVal}, ${takeVal}) = <strong>${res}</strong></code>${isMemo ? ' 并写入备忘录 memo' : ''}。`,
          activeNodeId: currentNode?.id,
          tree: cloneTree(rootNode)
        });
      }

      activeStack.pop();
      return res;
    };

    const finalAns = dfs(0, m, n, rootNode);

    // Final Return
    steps.push({
      type: 'return',
      line: lineReturn,
      i: 0,
      j: m,
      grid: snapshotGrid2D(dpGrid),
      activeStack: [],
      visited: [...visitedCells],
      tag: `最大子集数量: ${finalAns}`,
      log: `| 🏆 计算完成！在 0<=${m} 与 1<=${n} 约束下的最大子集长度为: ${finalAns}`,
      msg: `🏆 推导完成！在容量限制最多 <code>${m}</code> 个 0 与 <code>${n}</code> 个 1 的约束下，最大子集元素个数为 <strong>${finalAns}</strong>。`,
      tree: cloneTree(rootNode)
    });

    return steps;
  }

  private compileOnesAndZeroesStage3(
    strs: string[],
    m: number,
    n: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const len = strs.length;
    const lineEntry = anchorMap?.entry || 1;
    const lineInit = anchorMap?.init || 3;
    const lineLoopI = anchorMap?.loop_i || 4;
    const lineCount = anchorMap?.count || 5;
    const lineTransfer = anchorMap?.transfer || 10;
    const lineReturn = anchorMap?.return || 15;

    // dp[len + 1][m + 1][n + 1]
    const dp: number[][][] = Array.from({ length: len + 1 }, () =>
      Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
    );

    const countCost = (s: string) => {
      let c0 = 0, c1 = 0;
      for (const ch of s) {
        if (ch === '0') c0++;
        else if (ch === '1') c1++;
      }
      return [c0, c1];
    };

    const cleanNullGrid = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));

    steps.push({
      type: 'entry',
      line: lineEntry,
      i: 0,
      j: 0,
      grid: cleanNullGrid,
      tag: `主函数入口: 共有 ${len} 个字符串, m=${m}, n=${n}`,
      log: `| 🎯 函数入口：一和零（3D DP 递推填表），共 ${len} 个字符串`,
      msg: `主函数入口：准备进行自底向上动态规划推导。`
    });

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      grid: cleanNullGrid,
      tag: `分配 dp[${len + 1}][${m + 1}][${n + 1}] 表格`,
      log: `| 📋 分配三维 DP 表，基底 dp[0][z][o] = 0 全部为 0`,
      msg: `初始化：分配三维状态表 <code>dp[${len + 1}][${m + 1}][${n + 1}]</code>，前 0 个物品方案数为 0。`
    });

    for (let i = 1; i <= len; i++) {
      const s = strs[i - 1];
      steps.push({
        type: 'eval',
        line: lineLoopI,
        i,
        j: 0,
        grid: snapshotGrid2D(dp[i]),
        tag: `外层循环: 考察第 ${i} 个串 "${s}"`,
        log: `| 🔄 外层循环：考察第 ${i} 个字符串 "${s}" (1-based)`,
        msg: `外层循环：考察第 <code>${i}/${len}</code> 个字符串物品 <code>"${s}"</code>。`
      });

      const [c0, c1] = countCost(s);
      steps.push({
        type: 'eval',
        line: lineCount,
        i,
        j: 0,
        grid: snapshotGrid2D(dp[i]),
        tag: `统计 "${s}": 0耗=${c0}, 1耗=${c1}`,
        log: `| 📊 统计 "${s}" 字符开销: 消耗 ${c0} 个 0, 消耗 ${c1} 个 1`,
        msg: `统计开销：当前字符串 <code>"${s}"</code> 消耗 <code>${c0}</code> 个 0，<code>${c1}</code> 个 1。`
      });

      for (let z = 0; z <= m; z++) {
        for (let o = 0; o <= n; o++) {
          dp[i][z][o] = dp[i - 1][z][o];
          const canTake = z >= c0 && o >= c1;

          if (canTake) {
            const takeVal = dp[i - 1][z - c0][o - c1] + 1;
            if (takeVal > dp[i][z][o]) {
              dp[i][z][o] = takeVal;
              steps.push({
                type: 'update',
                line: lineTransfer,
                i: z,
                j: o,
                grid: snapshotGrid2D(dp[i]),
                gridHighlight: { i: z, j: o },
                topI: z - c0,
                topJ: o - c1,
                tag: `纳入 "${s}": dp[${i}][${z}][${o}] = ${takeVal}`,
                log: `| ⚡ 选入 "${s}" 获得更大解：dp[${i}][${z}][${o}] = dp[${i - 1}][${z - c0}][${o - c1}] + 1 = ${takeVal}`,
                msg: `状态转移：选入 <code>"${s}"</code>，状态更新为 <code>dp[${i}][${z}][${o}] = <strong>${takeVal}</strong></code>。`
              });
            }
          }
        }
      }
    }

    const finalAns = dp[len][m][n];
    steps.push({
      type: 'return',
      line: lineReturn,
      i: m,
      j: n,
      grid: snapshotGrid2D(dp[len]),
      gridHighlight: { i: m, j: n },
      tag: `最大子集大小: ${finalAns}`,
      log: `| 🏆 计算完成！最大子集数量 dp[${len}][${m}][${n}] = ${finalAns}`,
      msg: `🏆 推导完成！在容量限制 <code>0 <= ${m}, 1 <= ${n}</code> 下的最大子集元素个数为 <strong>${finalAns}</strong>。`
    });

    return steps;
  }

  private compileOnesAndZeroesStage4(
    strs: string[],
    m: number,
    n: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const lineEntry = anchorMap?.entry || 1;
    const lineInit = anchorMap?.init || 3;
    const lineLoopI = anchorMap?.loop_i || 4;
    const lineCount = anchorMap?.count || 5;
    const lineTransfer = anchorMap?.transfer || 8;
    const lineReturn = anchorMap?.return || 12;

    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    const countCost = (s: string) => {
      let c0 = 0, c1 = 0;
      for (const ch of s) {
        if (ch === '0') c0++;
        else if (ch === '1') c1++;
      }
      return [c0, c1];
    };

    const cleanNullGrid = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));

    steps.push({
      type: 'entry',
      line: lineEntry,
      i: 0,
      j: 0,
      grid: cleanNullGrid,
      tag: `主函数入口: 空间压缩版 (m=${m}, n=${n})`,
      log: `| 🎯 函数入口：一和零（二维滚动数组空间压缩）`,
      msg: `主函数入口：利用空间压缩，将三维状态表压缩至二维 <code>dp[${m + 1}][${n + 1}]</code>。`
    });

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      grid: cleanNullGrid,
      tag: `初始化 dp[${m + 1}][${n + 1}] 二维费用表`,
      log: `| 📋 分配二维费用 DP 表：dp[${m + 1}][${n + 1}] 全部为 0`,
      msg: `初始化 <code>${m + 1} × ${n + 1}</code> 的二维滚动状态表。`
    });

    for (let sIdx = 0; sIdx < strs.length; sIdx++) {
      const s = strs[sIdx];
      const [c0, c1] = countCost(s);

      steps.push({
        type: 'eval',
        line: lineLoopI,
        i: 0,
        j: 0,
        grid: snapshotGrid2D(dp),
        tag: `考察物品 "${s}"`,
        log: `| 🔄 遍历物品：字符串 "${s}" (0耗=${c0}, 1耗=${c1})`,
        msg: `遍历物品：考虑选入字符串 <code>"${s}"</code>（需 <code>${c0}</code> 个 0 与 <code>${c1}</code> 个 1）。`
      });

      for (let z = m; z >= c0; z--) {
        for (let o = n; o >= c1; o--) {
          const oldVal = dp[z][o];
          const takeVal = dp[z - c0][o - c1] + 1;
          if (takeVal > oldVal) {
            dp[z][o] = takeVal;
            steps.push({
              type: 'update-1d',
              line: lineTransfer,
              i: z,
              j: o,
              grid: snapshotGrid2D(dp),
              gridHighlight: { i: z, j: o },
              topI: z - c0,
              topJ: o - c1,
              tag: `倒序更新 dp[${z}][${o}] = ${dp[z][o]}`,
              log: `| ⚡ 双倒序更新: dp[${z}][${o}] = max(${oldVal}, dp[${z - c0}][${o - c1}] + 1) = ${dp[z][o]}`,
              msg: `双倒序状态转移：<code>dp[${z}][${o}] = max(${oldVal}, dp[${z - c0}][${o - c1}] + 1) = <strong>${dp[z][o]}</strong></code>。`
            });
          }
        }
      }
    }

    const finalAns = dp[m][n];
    steps.push({
      type: 'return',
      line: lineReturn,
      i: m,
      j: n,
      grid: snapshotGrid2D(dp),
      gridHighlight: { i: m, j: n },
      tag: `最大子集大小: ${finalAns}`,
      log: `| 🏆 计算完成！最大子集数量 = ${finalAns}`,
      msg: `🏆 推导完成！在容量限制最多 <code>${m}</code> 个 0 与 <code>${n}</code> 个 1 的约束下，最大子集元素个数为 <strong>${finalAns}</strong>。`
    });

    return steps;
  }

  // =========================================================================
  // 7. 单词拆分 (Word Break, LC 139)
  // =========================================================================
  private compileWordBreak(
    model: IYamlAlgorithmModel,
    stage: number,
    isMemo: boolean,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = String((model.defaultParams as any)?.s || 'leetcode');
    const rawDict = (model.defaultParams as any)?.wordDict || ['leet', 'code'];
    const wordDict: string[] = Array.isArray(rawDict) ? rawDict.map(String) : String(rawDict).split(',');

    if (stage === 1 || stage === 2) {
      return this.compileWordBreakStage1or2(s, wordDict, isMemo, anchorMap);
    }
    if (stage === 3) {
      return this.compileWordBreakStage3(s, wordDict, anchorMap);
    }
    return this.compileWordBreakStage4(s, wordDict, anchorMap);
  }

  private compileWordBreakStage1or2(
    s: string,
    wordDict: string[],
    isMemo: boolean,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const wordSet = new Set(wordDict);
    const n = s.length;

    const lineEntry = anchorMap?.entry || 1;
    const lineInitSet = anchorMap?.init_set || 2;
    const lineDfsStart = anchorMap?.dfs_start || (isMemo ? 4 : 3);
    const lineDfsEntry = anchorMap?.dfs_entry || (isMemo ? 6 : 5);
    const lineBoundary = anchorMap?.boundary || (isMemo ? 7 : 6);
    const lineCacheHit = anchorMap?.cache_hit || (isMemo ? 8 : 7);
    const lineLoopEnd = anchorMap?.loop_end || (isMemo ? 9 : 7);
    const lineCondMatch = anchorMap?.cond_match || (isMemo ? 11 : 9);
    const lineBranchTake = anchorMap?.branch_take || (isMemo ? 12 : 10);
    const lineBranchReturn = anchorMap?.branch_return || (isMemo ? 13 : 11);
    const lineFailReturn = anchorMap?.fail_return || (isMemo ? 16 : 14);
    const lineReturn = anchorMap?.return || lineDfsStart;

    const dpState: (number | null)[] = new Array(n + 1).fill(null);
    dpState[0] = 1;
    const memoCache: Record<number, boolean> = {};
    const activeStack: string[] = [];
    const visitedCells: Set<string> = new Set();
    let nodeIdCounter = 0;
    let callCount = 0;
    const MAX_CALLS = isMemo ? 80 : 50;

    const rootNode: UniversalTreeNode = {
      id: `node-${++nodeIdCounter}`,
      r: 0,
      c: 0,
      val: `dfs(0)`,
      status: 'current',
      children: []
    };

    steps.push({
      type: 'entry',
      line: lineEntry,
      i: 0,
      j: 0,
      dp1d: dpState.map(v => (v !== null ? v : 0)),
      highlightSlots: [0],
      tag: `函数入口: s="${s}", 词典=[${wordDict.join(', ')}]`,
      log: `| 🎯 函数入口：单词拆分，目标字符串 "${s}"，词典 [${wordDict.join(', ')}]`,
      msg: `函数入口：考察目标字符串 <code>"${s}"</code> 是否能由字典中的单词拼接而成。`
    });

    steps.push({
      type: 'init',
      line: lineInitSet,
      i: 0,
      j: 0,
      dp1d: dpState.map(v => (v !== null ? v : 0)),
      highlightSlots: [0],
      tag: `构建词典 HashSet (${wordDict.length} 个单词)`,
      log: `| 📋 构建哈希表 HashSet，提供 O(1) 前缀词匹配能力`,
      msg: `初始化：将词典转为哈希集合 <code>Set</code>，提供 $O(1)$ 时间复杂度的单词查询能力。`
    });

    steps.push({
      type: 'entry',
      line: lineDfsStart,
      i: 0,
      j: 0,
      dp1d: dpState.map(v => (v !== null ? v : 0)),
      highlightSlots: [0],
      tag: `启动递归: dfs(start=0)`,
      log: `| 🚀 启动前缀搜索递归：dfs(start=0)`,
      msg: `启动顶层搜索：<code>dfs(s, set, 0)</code>。`
    });

    const dfs = (start: number, currentNode?: UniversalTreeNode): boolean => {
      callCount++;
      const shouldRecord = isMemo || callCount <= MAX_CALLS;
      const key = `${start}`;
      activeStack.push(key);
      visitedCells.add(key);
      if (currentNode) currentNode.status = 'current';

      // Callee Entry Frame
      if (shouldRecord && currentNode) {
        steps.push({
          type: 'entry',
          line: lineDfsEntry,
          i: 0,
          j: start,
          dp1d: dpState.map(v => (v !== null ? v : 0)),
          highlightSlots: [start],
          activeStack: [...activeStack],
          visited: [...visitedCells],
          tag: `dfs(start=${start})`,
          log: `| 📥 进入 dfs(start=${start}) [待匹配剩余前缀: "${s.substring(start)}"]`,
          msg: `进入递归函数：当前从下标 <code>start=${start}</code> 开始寻找可拆分的前缀单词。`,
          activeNodeId: currentNode.id,
          tree: cloneTree(rootNode)
        });
      }

      // Boundary check: start == s.length()
      if (start === n) {
        dpState[n] = 1;
        if (shouldRecord && currentNode) {
          currentNode.status = 'resolved';
          currentNode.val = `${currentNode.val} -> true`;
          steps.push({
            type: 'boundary',
            line: lineBoundary,
            i: 0,
            j: n,
            dp1d: dpState.map(v => (v !== null ? v : 0)),
            highlightSlots: [n],
            activeStack: [...activeStack],
            visited: [...visitedCells],
            tag: `触底成功: start=${start} == len -> true`,
            log: `| 🎉 【拆分成功】start=${start} 到达字符串末尾，所有字符均已成功拆分，返回 true`,
            msg: `边界条件触发：光标到达末尾 <code>start == ${n}</code>，全串匹配成功，返回 <strong>true</strong>！`,
            activeNodeId: currentNode.id,
            tree: cloneTree(rootNode)
          });
        }
        activeStack.pop();
        return true;
      }

      // Cache hit check (Stage 2)
      if (isMemo && memoCache[start] !== undefined) {
        const cached = memoCache[start];
        if (currentNode) {
          currentNode.status = 'pruned';
          currentNode.val = `${currentNode.val} -> [cache: ${cached}]`;
          steps.push({
            type: 'cache-hit',
            line: lineCacheHit,
            i: 0,
            j: start,
            dp1d: dpState.map(v => (v !== null ? v : 0)),
            highlightSlots: [start],
            activeStack: [...activeStack],
            visited: [...visitedCells],
            tag: `备忘录命中 memo[${start}] = ${cached}`,
            log: `| ⚡ 【备忘录命中】前缀 start=${start} 此前已计算为 ${cached}，剪枝返回`,
            msg: `备忘录剪枝命中：位置 <code>start=${start}</code> 之前已验证结果为 <strong>${cached}</strong>，直接返回。`,
            activeNodeId: currentNode.id,
            tree: cloneTree(rootNode)
          });
        }
        activeStack.pop();
        return cached;
      }

      // Loop end from start + 1 to n
      for (let end = start + 1; end <= n; end++) {
        const prefix = s.substring(start, end);
        const inDict = wordSet.has(prefix);

        if (shouldRecord) {
          steps.push({
            type: 'eval',
            line: lineLoopEnd,
            i: 0,
            j: start,
            dp1d: dpState.map(v => (v !== null ? v : 0)),
            highlightSlots: [start, end],
            tag: `枚举切分点 end=${end}`,
            log: `| 🔍 枚举结束位置 end=${end}，截取子串 s[${start}..${end}] = "${prefix}"`,
            msg: `枚举前缀分割点：考察子串 <code>s[${start}..${end}] = "${prefix}"</code>。`,
            activeNodeId: currentNode?.id,
            tree: cloneTree(rootNode)
          });

          steps.push({
            type: 'cond',
            line: lineCondMatch,
            i: 0,
            j: end,
            dp1d: dpState.map(v => (v !== null ? v : 0)),
            highlightSlots: [end],
            tag: `词典检查: "${prefix}" -> ${inDict ? '命中 ✓' : '未命中 ✗'}`,
            log: `| ⚖️ 词典查询：set.contains("${prefix}") => ${inDict}`,
            msg: `词典匹配查询：子串 <code>"${prefix}"</code> ${inDict ? '<strong>存在于词典中 ✓</strong>' : '不存在于词典中 ✗'}。`,
            activeNodeId: currentNode?.id,
            tree: cloneTree(rootNode)
          });
        }

        if (inDict) {
          const childTake: UniversalTreeNode = {
            id: `node-${++nodeIdCounter}`,
            r: 0,
            c: end,
            val: `dfs(${end})`,
            status: 'pending',
            edgeLabel: `"${prefix}"`,
            children: []
          };
          if (currentNode) currentNode.children.push(childTake);

          if (shouldRecord) {
            steps.push({
              type: 'branch-call',
              line: lineBranchTake,
              i: 0,
              j: end,
              branchType: 'diag',
              varName: 'match',
              dp1d: dpState.map(v => (v !== null ? v : 0)),
              highlightSlots: [end],
              activeStack: [...activeStack],
              visited: [...visitedCells],
              tag: `子递归深入: dfs(start=${end})`,
              log: `| 🌿 【采纳前缀 "${prefix}"】深入搜索后续部分 dfs(start=${end})`,
              msg: `采纳前缀 <code>"${prefix}"</code> 匹配，调用子递归 <code>dfs(${end})</code>。`,
              activeNodeId: currentNode?.id,
              tree: cloneTree(rootNode)
            });
          }

          const matched = dfs(end, childTake);

          // Call-Return Parity: branch return
          if (shouldRecord) {
            steps.push({
              type: 'branch-return',
              line: lineBranchReturn,
              i: 0,
              j: start,
              branchType: 'diag',
              subResult: matched ? 1 : 0,
              dp1d: dpState.map(v => (v !== null ? v : 0)),
              highlightSlots: [start],
              activeStack: [...activeStack],
              visited: [...visitedCells],
              tag: `match = ${matched}`,
              log: `| ↩️ 【回溯赋值】子递归返回父层 dfs(start=${start})，match = ${matched}`,
              msg: `子递归返回：<code>match = <strong>${matched}</strong></code>。`,
              activeNodeId: currentNode?.id,
              tree: cloneTree(rootNode)
            });
          }

          if (matched) {
            dpState[start] = 1;
            if (isMemo) memoCache[start] = true;
            if (currentNode) {
              currentNode.status = 'resolved';
              currentNode.val = `${currentNode.val} -> true`;
            }
            activeStack.pop();
            return true;
          }
        }
      }

      // If loop exhausted with no match
      dpState[start] = 0;
      if (isMemo) memoCache[start] = false;
      if (currentNode) {
        currentNode.status = 'resolved';
        currentNode.val = `${currentNode.val} -> false`;
      }

      if (shouldRecord) {
        steps.push({
          type: 'boundary',
          line: lineFailReturn,
          i: 0,
          j: start,
          dp1d: dpState.map(v => (v !== null ? v : 0)),
          highlightSlots: [start],
          activeStack: [...activeStack],
          visited: [...visitedCells],
          tag: `dfs(start=${start}) 无解 -> false`,
          log: `| ❌ 【无解返回】从 start=${start} 起始的所有前缀拆分均无法完全拆分全串，返回 false`,
          msg: `所有切分尝试均失败：从 <code>start=${start}</code> 无法拼出合法拆分方案，返回 <strong>false</strong>。`,
          activeNodeId: currentNode?.id,
          tree: cloneTree(rootNode)
        });
      }

      activeStack.pop();
      return false;
    };

    const finalAns = dfs(0, rootNode);

    steps.push({
      type: 'return',
      line: lineReturn,
      i: 0,
      j: n,
      dp1d: dpState.map(v => (v !== null ? v : 0)),
      highlightSlots: [n],
      tag: `拆分结果: ${finalAns}`,
      log: `| 🏆 计算完成！字符串 "${s}" 是否能被完全拆分: ${finalAns}`,
      msg: `🏆 推导完成！字符串 <code>"${s}"</code> ${finalAns ? '<strong>可以</strong>' : '<strong>不能</strong>'} 被字典中的单词完全拼接拆分。`,
      tree: cloneTree(rootNode)
    });

    return steps;
  }

  private compileWordBreakStage3(
    s: string,
    wordDict: string[],
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const wordSet = new Set(wordDict);
    const n = s.length;

    const lineEntry = anchorMap?.entry || 1;
    const lineInitSet = anchorMap?.init_set || 2;
    const lineInit = anchorMap?.init || 4;
    const lineBase = anchorMap?.base || 5;
    const lineLoopI = anchorMap?.loop_i || 6;
    const lineCond = anchorMap?.cond || 8;
    const lineTransfer = anchorMap?.transfer || 9;
    const lineBreak = anchorMap?.break || 10;
    const lineReturn = anchorMap?.return || 14;

    const dp: boolean[] = new Array(n + 1).fill(false);
    dp[0] = true;

    steps.push({
      type: 'entry',
      line: lineEntry,
      i: 0,
      j: 0,
      dp1d: dp.map(v => (v ? 1 : 0)),
      highlightSlots: [0],
      tag: `主函数入口: 单词拆分 (s="${s}")`,
      log: `| 🎯 函数入口：单词拆分（自底向上 DP 递推）`,
      msg: `主函数入口：准备自底向上推导前缀可拆分性数组 <code>dp[0..${n}]</code>。`
    });

    steps.push({
      type: 'init',
      line: lineInitSet,
      i: 0,
      j: 0,
      dp1d: dp.map(v => (v ? 1 : 0)),
      highlightSlots: [0],
      tag: `建立哈希表`,
      log: `| 📋 建立词典哈希集合，加速子串存在性判断`,
      msg: `初始化：将词典转为 <code>HashSet</code>。`
    });

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      dp1d: dp.map(v => (v ? 1 : 0)),
      highlightSlots: [0],
      tag: `分配 dp[${n + 1}] 数组`,
      log: `| 📋 分配布尔数组 dp[${n + 1}]，默认全部为 false`,
      msg: `分配状态表：<code>boolean[] dp = new boolean[${n + 1}]</code>。`
    });

    steps.push({
      type: 'init',
      line: lineBase,
      i: 0,
      j: 0,
      dp1d: dp.map(v => (v ? 1 : 0)),
      highlightSlots: [0],
      tag: `dp[0] = true (空串基底)`,
      log: `| 📋 设定边界基底：dp[0] = true（空字符串默认可被合法拆分）`,
      msg: `设定递推基底：<code>dp[0] = true</code>。`
    });

    for (let i = 1; i <= n; i++) {
      steps.push({
        type: 'eval',
        line: lineLoopI,
        i: 0,
        j: i,
        dp1d: dp.map(v => (v ? 1 : 0)),
        highlightSlots: [i],
        tag: `考察前缀长度 i = ${i} ("${s.substring(0, i)}")`,
        log: `| 🔄 外层遍历前缀长度 i = ${i} ("${s.substring(0, i)}")`,
        msg: `外层循环：考察前缀长度 <code>i = ${i}</code>，对应子串 <code>"${s.substring(0, i)}"</code>。`
      });

      for (let j = 0; j < i; j++) {
        const sub = s.substring(j, i);
        const inDict = wordSet.has(sub);
        const canTransfer = dp[j] && inDict;

        steps.push({
          type: 'cond',
          line: lineCond,
          i: j,
          j: i,
          dp1d: dp.map(v => (v ? 1 : 0)),
          srcSlots: [j],
          highlightSlots: [i],
          tag: `判定: dp[${j}]=${dp[j]} 且 "${sub}" 在词典 -> ${canTransfer}`,
          log: `| ⚖️ 考察分割点 j=${j}: dp[${j}] = ${dp[j]} 且 wordSet.has("${sub}") = ${inDict} => ${canTransfer}`,
          msg: `考察分割点 <code>j = ${j}</code>：前缀 <code>dp[${j}] = ${dp[j]}</code> 且后缀 <code>"${sub}"</code> 存在于词典中 => <strong>${canTransfer ? '可转移 ✓' : '无法转移 ✗'}</strong>。`
        });

        if (canTransfer) {
          dp[i] = true;
          steps.push({
            type: 'update',
            line: lineTransfer,
            i: j,
            j: i,
            dp1d: dp.map(v => (v ? 1 : 0)),
            srcSlots: [j],
            highlightSlots: [i],
            tag: `前缀 [0..${i}] 拆出词 "${sub}" -> dp[${i}] = true`,
            log: `| ⚡ 匹配成功: 子串 s[${j}..${i}] = "${sub}" 在词典中且 dp[${j}]=true，则 dp[${i}] = true`,
            msg: `状态转移：子串 <code>"${sub}"</code> 在词典中且前驱 <code>dp[${j}] = true</code>，更新 <code>dp[${i}] = <strong>true</strong></code>。`
          });

          steps.push({
            type: 'eval',
            line: lineBreak,
            i: j,
            j: i,
            dp1d: dp.map(v => (v ? 1 : 0)),
            highlightSlots: [i],
            tag: `已找到合法分割，提前 break`,
            log: `| ⏩ 找到可行解，直接 break 跳出内层循环`,
            msg: `剪枝优化：<code>dp[${i}]</code> 已确认为 true，直接 break 退出内层循环。`
          });
          break;
        }
      }
    }

    const finalAns = dp[n];
    steps.push({
      type: 'return',
      line: lineReturn,
      i: 0,
      j: n,
      dp1d: dp.map(v => (v ? 1 : 0)),
      highlightSlots: [n],
      tag: `最终结果: ${finalAns}`,
      log: `| 🏆 计算完成！dp[${n}] = ${finalAns}`,
      msg: `🏆 推导完成！字符串 <code>"${s}"</code> ${finalAns ? '<strong>可以</strong>' : '<strong>不能</strong>'} 被字典中的单词完全拼接拆分。`
    });

    return steps;
  }

  private compileWordBreakStage4(
    s: string,
    wordDict: string[],
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const wordSet = new Set(wordDict);
    const n = s.length;

    const lineEntry = anchorMap?.entry || 1;
    const lineInitSet = anchorMap?.init_set || 2;
    const lineCalcMaxLen = anchorMap?.calc_maxlen || 4;
    const lineInit = anchorMap?.init || 5;
    const lineBase = anchorMap?.base || 6;
    const lineTransfer = anchorMap?.transfer || 10;
    const lineReturn = anchorMap?.return || 15;

    const dp: boolean[] = new Array(n + 1).fill(false);
    dp[0] = true;

    steps.push({
      type: 'entry',
      line: lineEntry,
      i: 0,
      j: 0,
      dp1d: dp.map(v => (v ? 1 : 0)),
      highlightSlots: [0],
      tag: `主函数入口: 单词拆分空间优化版`,
      log: `| 🎯 函数入口：单词拆分（最大词长限制加速优化）`,
      msg: `主函数入口：限制内层分割点回溯深度，加速递推。`
    });

    steps.push({
      type: 'init',
      line: lineInitSet,
      i: 0,
      j: 0,
      dp1d: dp.map(v => (v ? 1 : 0)),
      highlightSlots: [0],
      tag: `建立哈希表`,
      log: `| 📋 建立词典哈希集合`,
      msg: `初始化：将词典转为哈希集合。`
    });

    let maxLen = 0;
    for (const w of wordDict) maxLen = Math.max(maxLen, w.length);

    steps.push({
      type: 'eval',
      line: lineCalcMaxLen,
      i: 0,
      j: maxLen,
      dp1d: dp.map(v => (v ? 1 : 0)),
      highlightSlots: [0],
      tag: `计算词典最大单词长度 maxLen = ${maxLen}`,
      log: `| 📊 统计词典中最大单词长度 maxLen = ${maxLen}`,
      msg: `词长优化：词典中最长单词为 <code>${maxLen}</code>，内层分割点只需倒退最多 <code>${maxLen}</code> 位。`
    });

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      dp1d: dp.map(v => (v ? 1 : 0)),
      highlightSlots: [0],
      tag: `分配 dp[${n + 1}] 数组`,
      log: `| 📋 分配布尔数组 dp[${n + 1}]`,
      msg: `分配状态表：<code>boolean[] dp = new boolean[${n + 1}]</code>。`
    });

    steps.push({
      type: 'init',
      line: lineBase,
      i: 0,
      j: 0,
      dp1d: dp.map(v => (v ? 1 : 0)),
      highlightSlots: [0],
      tag: `dp[0] = true`,
      log: `| 📋 设定边界基底：dp[0] = true`,
      msg: `设定递推基底：<code>dp[0] = true</code>。`
    });

    for (let i = 1; i <= n; i++) {
      for (let j = Math.max(0, i - maxLen); j < i; j++) {
        const sub = s.substring(j, i);
        if (dp[j] && wordSet.has(sub)) {
          dp[i] = true;
          steps.push({
            type: 'update-1d',
            line: lineTransfer,
            i: j,
            j: i,
            dp1d: dp.map(v => (v ? 1 : 0)),
            srcSlots: [j],
            highlightSlots: [i],
            tag: `前缀 [0..${i}] 拆出词 "${sub}" -> dp[${i}] = true`,
            log: `| ⚡ 匹配成功: 子串 s[${j}..${i}] = "${sub}" 在词典中且 dp[${j}]=true，则 dp[${i}] = true`,
            msg: `状态转移：子串 <code>"${sub}"</code> 在词典中且前驱 <code>dp[${j}] = true</code>，更新 <code>dp[${i}] = <strong>true</strong></code>。`
          });
          break;
        }
      }
    }

    const finalAns = dp[n];
    steps.push({
      type: 'return',
      line: lineReturn,
      i: 0,
      j: n,
      dp1d: dp.map(v => (v ? 1 : 0)),
      highlightSlots: [n],
      tag: `最终结果: ${finalAns}`,
      log: `| 🏆 计算完成！dp[${n}] = ${finalAns}`,
      msg: `🏆 推导完成！字符串 <code>"${s}"</code> ${finalAns ? '<strong>可以</strong>' : '<strong>不能</strong>'} 被字典中的单词完全拼接拆分。`
    });

    return steps;
  }

  // =========================================================================
  // 8. 多重背包 (Multiple Knapsack)
  // =========================================================================
  private compileMultipleKnapsack(
    model: IYamlAlgorithmModel,
    stage: number,
    isMemo: boolean,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const rawWeights = (model.defaultParams as any)?.weights || [1, 3, 4];
    const rawValues = (model.defaultParams as any)?.values || [15, 20, 30];
    const rawNums = (model.defaultParams as any)?.nums || [2, 3, 2];
    const weights: number[] = Array.isArray(rawWeights) ? rawWeights.map(Number) : String(rawWeights).split(',').map(Number);
    const values: number[] = Array.isArray(rawValues) ? rawValues.map(Number) : String(rawValues).split(',').map(Number);
    const nums: number[] = Array.isArray(rawNums) ? rawNums.map(Number) : String(rawNums).split(',').map(Number);
    const bagWeight = Number((model.defaultParams as any)?.bagWeight ?? (model.defaultParams as any)?.n ?? 4);

    const domainConfig: KnapsackDomainConfig = {
      modelId: 'multiple-knapsack',
      kind: 'multiple-knapsack',
      items: weights.map((w, idx) => ({
        index: idx,
        weight: w,
        value: values[idx] ?? w,
        count: nums[idx] ?? 1,
        label: `物品${idx}(w=${w},v=${values[idx] ?? w},限${nums[idx] ?? 1}件)`
      })),
      capacity: bagWeight,
      anchorMap,
      isMemo: Boolean(isMemo)
    };

    return KnapsackStepMatrixCompiler.compile(domainConfig, stage);
  }

  // =========================================================================
  // 9. 盈利计划 (Profitable Schemes, LC 879 - 三维计数 DP)
  // =========================================================================
  private compileProfitableSchemes(
    model: IYamlAlgorithmModel,
    stage: number,
    isMemo: boolean,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const rawGroup = (model.defaultParams as any)?.group || [2, 2];
    const rawProfit = (model.defaultParams as any)?.profit || [2, 3];
    const group: number[] = Array.isArray(rawGroup) ? rawGroup.map(Number) : String(rawGroup).split(',').map(Number);
    const profit: number[] = Array.isArray(rawProfit) ? rawProfit.map(Number) : String(rawProfit).split(',').map(Number);
    const n = Number((model.defaultParams as any)?.n ?? 5);
    const minProfit = Number((model.defaultParams as any)?.minProfit ?? 3);

    if (stage === 1 || stage === 2) {
      return this.compileProfitableSchemesStage1or2(group, profit, n, minProfit, isMemo, anchorMap);
    }
    if (stage === 3) {
      return this.compileProfitableSchemesStage3(group, profit, n, minProfit, anchorMap);
    }
    return this.compileProfitableSchemesStage4(group, profit, n, minProfit, anchorMap);
  }

  private compileProfitableSchemesStage1or2(
    group: number[],
    profit: number[],
    n: number,
    minProfit: number,
    isMemo: boolean,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const len = group.length;
    const lineEntry = anchorMap?.entry || 1;
    const lineDfsEntry = anchorMap?.dfs_entry || (isMemo ? 5 : 4);
    const lineBoundary = anchorMap?.boundary || (isMemo ? 6 : 5);
    const lineCacheHit = anchorMap?.cache_hit || 7;
    const lineNotTake = anchorMap?.not_take || (isMemo ? 9 : 8);
    const lineCondTake = anchorMap?.cond_take || (isMemo ? 10 : 9);
    const lineTake = anchorMap?.take || (isMemo ? 11 : 10);
    const lineCombine = anchorMap?.combine || (isMemo ? 12 : 11);
    const lineReturn = anchorMap?.return || (isMemo ? 14 : 12);
    const MOD = 1000000007;

    const dpGrid: (number | null)[][] = Array.from({ length: n + 1 }, () => new Array(minProfit + 1).fill(null));
    const memoCache: Map<string, number> = new Map();
    const activeStack: string[] = [];
    let nodeIdCounter = 0;
    let callCount = 0;
    const MAX_CALLS = isMemo ? 60 : 40;

    const rootNode: UniversalTreeNode = {
      id: `node-${++nodeIdCounter}`,
      r: n,
      c: minProfit,
      val: `dfs(0,${n},${minProfit})`,
      status: 'current',
      children: []
    };

    steps.push({
      type: 'entry',
      line: lineEntry,
      i: 0,
      j: 0,
      grid: snapshotGrid2D(dpGrid),
      tag: `函数入口: n=${n}, minProfit=${minProfit}, tasks=${len}`,
      log: `| 🎯 函数入口：盈利计划，n=${n}，最低利润 ${minProfit}，共 ${len} 项工作`,
      msg: `函数入口：在 <code>${n}</code> 名员工限制下寻找利润至少为 <code>${minProfit}</code> 的盈利计划数量。`
    });

    const dfs = (i: number, remN: number, remP: number, currentNode?: UniversalTreeNode): number => {
      callCount++;
      const shouldRecord = isMemo || callCount <= MAX_CALLS;
      const key = `${i},${remN},${remP}`;
      activeStack.push(key);
      if (currentNode) currentNode.status = 'current';

      if (shouldRecord && currentNode) {
        steps.push({
          type: 'entry',
          line: lineDfsEntry,
          i: remN,
          j: Math.min(remP, minProfit),
          grid: snapshotGrid2D(dpGrid),
          activeStack: [...activeStack],
          tag: `dfs(${i}, n=${remN}, p≥${remP})`,
          log: `| 📥 进入 dfs(i=${i}, remN=${remN}, remP=${remP})`,
          msg: `进入递归：任务下标 <code>i=${i}</code>，剩余员工 <code>${remN}</code>，还需利润 <code>${remP}</code>。`,
          activeNodeId: currentNode.id,
          tree: cloneTree(rootNode)
        });
      }

      // Boundary: all tasks considered → 1 plan if profit satisfied (remP≤0)
      if (i >= len) {
        const val = remP <= 0 ? 1 : 0;
        if (currentNode) {
          currentNode.status = val ? 'resolved' : 'pruned';
          currentNode.val = `${currentNode.val} → ${val}`;
        }
        if (shouldRecord) {
          steps.push({
            type: 'boundary',
            line: lineBoundary,
            i: remN,
            j: Math.min(remP, minProfit),
            grid: snapshotGrid2D(dpGrid),
            activeStack: [...activeStack],
            tag: `任务耗尽: ${val === 1 ? '利润达标 → 1' : '利润不足 → 0'}`,
            log: `| ${val ? '🎉' : '❌'} 任务全部考察，利润${val ? '达标' : '不足'} → ${val}`,
            msg: `边界条件：任务已全部决策，剩余利润需求 <code>${remP}</code>${val ? ' ≤ 0，计划合法，返回 <strong>1</strong>' : ' > 0，利润不足，返回 <strong>0</strong>'}。`,
            activeNodeId: currentNode?.id,
            tree: cloneTree(rootNode)
          });
        }
        activeStack.pop();
        return val;
      }

      // Cache hit
      if (isMemo) {
        const clamped = Math.max(0, remP);
        const mKey = `${i},${remN},${clamped}`;
        if (memoCache.has(mKey)) {
          const cached = memoCache.get(mKey)!;
          if (currentNode) { currentNode.status = 'pruned'; }
          steps.push({
            type: 'cache-hit',
            line: lineCacheHit,
            i: remN,
            j: Math.min(remP, minProfit),
            grid: snapshotGrid2D(dpGrid),
            activeStack: [...activeStack],
            tag: `备忘录命中 (${i},${remN},${clamped}) = ${cached}`,
            log: `| ⚡ 备忘录命中：(${i},${remN},${clamped}) = ${cached}`,
            msg: `备忘录剪枝：状态 <code>(${i}, remN=${remN}, remP≥${clamped})</code> 已缓存，返回 <strong>${cached}</strong>。`,
            activeNodeId: currentNode?.id,
            tree: cloneTree(rootNode)
          });
          activeStack.pop();
          return cached;
        }
      }

      // Branch 1: not take
      const childNotTake: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: remN,
        c: Math.min(remP, minProfit),
        val: `dfs(${i + 1},${remN},${remP})`,
        status: 'pending',
        edgeLabel: '不选',
        children: []
      };
      if (currentNode) currentNode.children.push(childNotTake);

      if (shouldRecord) {
        steps.push({
          type: 'branch-call',
          line: lineNotTake,
          i: remN,
          j: Math.min(remP, minProfit),
          branchType: 'top',
          varName: 'notTake',
          grid: snapshotGrid2D(dpGrid),
          activeStack: [...activeStack],
          tag: `不选任务 ${i}: dfs(${i + 1},${remN},${remP})`,
          log: `| 🌿 分支 1 (不选)：跳过工作 ${i}，深入 dfs(${i + 1}, ${remN}, ${remP})`,
          msg: `决策分支 1：<strong>不选</strong>任务 ${i}（需 ${group[i]} 人，得 ${profit[i]} 利润），状态不变。`,
          activeNodeId: currentNode?.id,
          tree: cloneTree(rootNode)
        });
      }

      const notTakeVal = dfs(i + 1, remN, remP, childNotTake);

      if (shouldRecord) {
        steps.push({
          type: 'branch-return',
          line: lineNotTake,
          i: remN,
          j: Math.min(remP, minProfit),
          branchType: 'top',
          subResult: notTakeVal,
          grid: snapshotGrid2D(dpGrid),
          activeStack: [...activeStack],
          tag: `notTake = ${notTakeVal}`,
          log: `| ↩️ notTake = ${notTakeVal}`,
          msg: `不选分支返回 <code>notTake = <strong>${notTakeVal}</strong></code>。`,
          activeNodeId: currentNode?.id,
          tree: cloneTree(rootNode)
        });
      }

      // Branch 2: take if enough workers
      const g = group[i];
      const p = profit[i];
      const canTake = remN >= g;

      if (shouldRecord) {
        steps.push({
          type: 'cond',
          line: lineCondTake,
          i: remN,
          j: Math.min(remP, minProfit),
          grid: snapshotGrid2D(dpGrid),
          activeStack: [...activeStack],
          tag: `容量判定: ${remN} >= ${g} → ${canTake}`,
          log: `| ⚖️ 员工检查: remN(${remN}) >= g(${g}) → ${canTake}`,
          msg: `检查员工：剩余员工 <code>${remN}</code> ${canTake ? '≥' : '<'} 所需 <code>${g}</code>，${canTake ? '可选入 ✓' : '人数不足 ✗'}。`,
          activeNodeId: currentNode?.id,
          tree: cloneTree(rootNode)
        });
      }

      let takeVal = 0;
      if (canTake) {
        const childTake: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: remN - g,
          c: Math.max(0, remP - p),
          val: `dfs(${i + 1},${remN - g},${Math.max(0, remP - p)})`,
          status: 'pending',
          edgeLabel: '选入',
          children: []
        };
        if (currentNode) currentNode.children.push(childTake);

        if (shouldRecord) {
          steps.push({
            type: 'branch-call',
            line: lineTake,
            i: remN - g,
            j: Math.max(0, remP - p),
            branchType: 'diag',
            varName: 'take',
            grid: snapshotGrid2D(dpGrid),
            activeStack: [...activeStack],
            tag: `选入任务 ${i}: dfs(${i + 1},${remN - g},${Math.max(0, remP - p)})`,
            log: `| 🌿 分支 2 (选入)：消耗 ${g} 人、增 ${p} 利润，深入 dfs(${i + 1}, ${remN - g}, ${Math.max(0, remP - p)})`,
            msg: `决策分支 2：<strong>选入</strong>任务 ${i}（消耗 <code>${g}</code> 人，获得 <code>${p}</code> 利润）。`,
            activeNodeId: currentNode?.id,
            tree: cloneTree(rootNode)
          });
        }

        takeVal = dfs(i + 1, remN - g, Math.max(0, remP - p), childTake);

        if (shouldRecord) {
          steps.push({
            type: 'branch-return',
            line: lineTake,
            i: remN,
            j: Math.min(remP, minProfit),
            branchType: 'diag',
            subResult: takeVal,
            grid: snapshotGrid2D(dpGrid),
            activeStack: [...activeStack],
            tag: `take = ${takeVal}`,
            log: `| ↩️ take = ${takeVal}`,
            msg: `选入分支返回 <code>take = <strong>${takeVal}</strong></code>。`,
            activeNodeId: currentNode?.id,
            tree: cloneTree(rootNode)
          });
        }
      }

      const res = (notTakeVal + (canTake ? takeVal : 0)) % MOD;
      if (currentNode) {
        currentNode.status = 'resolved';
        currentNode.val = `${currentNode.val} → ${res}`;
      }

      if (isMemo) {
        const clamped = Math.max(0, remP);
        memoCache.set(`${i},${remN},${clamped}`, res);
      }
      
      dpGrid[remN][Math.max(0, remP)] = res;

      if (shouldRecord) {
        steps.push({
          type: 'eval',
          line: lineCombine,
          i: remN,
          j: Math.min(remP, minProfit),
          grid: snapshotGrid2D(dpGrid),
          activeStack: [...activeStack],
          tag: `合并结果 = ${res}`,
          log: `| 📊 合并: notTake(${notTakeVal}) + take(${canTake ? takeVal : 0}) = ${res}`,
          msg: `合并两路决策：<code>(${notTakeVal} + ${canTake ? takeVal : 0}) % MOD = <strong>${res}</strong></code>。`,
          activeNodeId: currentNode?.id,
          tree: cloneTree(rootNode)
        });
      }

      activeStack.pop();
      return res;
    };

    const finalAns = dfs(0, n, minProfit, rootNode);

    steps.push({
      type: 'return',
      line: lineReturn,
      i: n,
      j: minProfit,
      grid: snapshotGrid2D(dpGrid),
      tag: `盈利计划总数: ${finalAns}`,
      log: `| 🏆 计算完成！合法盈利计划总数 = ${finalAns}`,
      msg: `🏆 推导完成！在最多 <code>${n}</code> 人且利润至少 <code>${minProfit}</code> 的限制下，合法盈利计划数为 <strong>${finalAns}</strong>。`,
      tree: cloneTree(rootNode)
    });

    return steps;
  }

  private compileProfitableSchemesStage3(
    group: number[],
    profit: number[],
    n: number,
    minProfit: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const len = group.length;
    const MOD = 1000000007;
    const lineEntry = anchorMap?.entry || 1;
    const lineInit = anchorMap?.init || 3;
    const lineBase = anchorMap?.base || 4;
    const lineLoopI = anchorMap?.loop_i || 5;
    const lineCount = anchorMap?.count || 6;
    const lineTransfer = anchorMap?.transfer || 10;
    const lineReturn = anchorMap?.return || 15;

    // dp[i][j][k] = 前 i 个任务，人数≤j, 利润≥k 的计划数
    const dp: (number | null)[][][] = Array.from({ length: len + 1 }, () =>
      Array.from({ length: n + 1 }, () => new Array(minProfit + 1).fill(null))
    );

    steps.push({
      type: 'entry',
      line: lineEntry,
      i: 0,
      j: 0,
      grid: snapshotGrid2D(dp[0]),
      tag: `主函数入口: n=${n}, minProfit=${minProfit}, tasks=${len}`,
      log: `| 🎯 函数入口：盈利计划（三维大一统状态表），n=${n}，minProfit=${minProfit}，任务数=${len}`,
      msg: `主函数入口：准备构建三维状态表 <code>dp[任务][人数][利润]</code>，进行正向推导。`
    });

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      grid: snapshotGrid2D(dp[0]),
      tag: `初始化 dp[${len + 1}][${n + 1}][${minProfit + 1}] 未探索`,
      log: `| 📋 分配三维计划计数表 dp[${len + 1}][${n + 1}][${minProfit + 1}]，全部初始未探索`,
      msg: `初始化：分配三维大状态表 <code>dp[${len + 1}][${n + 1}][${minProfit + 1}]</code>。`
    });

    // 设定基底：无任何任务时，任意人数下达标利润阈值 0 的方案数均为 1
    for (let j = 0; j <= n; j++) dp[0][j][0] = 1;

    steps.push({
      type: 'init',
      line: lineBase,
      i: 0,
      j: 0,
      grid: snapshotGrid2D(dp[0]),
      tag: `基底: dp[0][j][0] = 1 (j=0..${n})`,
      log: `| 📋 基底初始化：前 0 个任务，空计划利润 ≥ 0 的方案均为 1`,
      msg: `设定基底：无任何任务时，任意人数下达标利润阈值 0 的方案数均为 <code>1</code>。`
    });

    for (let i = 1; i <= len; i++) {
      const g = group[i - 1];
      const p = profit[i - 1];

      steps.push({
        type: 'eval',
        line: lineLoopI,
        i,
        j: 0,
        grid: snapshotGrid2D(dp[i - 1]),
        tag: `外层循环: 任务 ${i}/${len} (需${g}人, 得${p}利润)`,
        log: `| 🔄 遍历任务 #${i}: 需 ${g} 人, 得 ${p} 利润`,
        msg: `遍历任务 <code>#${i}</code>（需 <code>${g}</code> 名员工，利润 <code>${p}</code>）。`
      });

      steps.push({
        type: 'eval',
        line: lineCount,
        i,
        j: 0,
        grid: snapshotGrid2D(dp[i - 1]),
        tag: `统计任务参数: g=${g}, p=${p}`,
        log: `| 📊 获取任务参数: g=${g}, p=${p}`,
        msg: `任务参数：当前任务 <code>#${i}</code> 消耗 <code>${g}</code> 人，收益 <code>${p}</code>。`
      });

      // 三维 DP 表：可以直接双正序，无惧污染，因为状态继承于 i-1 层
      for (let j = 0; j <= n; j++) {
        for (let k = 0; k <= minProfit; k++) {
          const inheritedVal = dp[i - 1][j][k];
          dp[i][j][k] = inheritedVal; // 不选分支的继承

          if (j >= g) {
            const prevProfit = Math.max(0, k - p);
            const addVal = dp[i - 1][j - g][prevProfit];
            if (addVal !== null && addVal > 0) {
              const curVal = dp[i][j][k] ?? 0;
              dp[i][j][k] = (curVal + addVal) % MOD;
              steps.push({
                type: 'update',
                line: lineTransfer,
                i: j,
                j: k,
                grid: snapshotGrid2D(dp[i]),
                gridHighlight: { i: j, j: k },
                topI: j - g,
                topJ: prevProfit,
                tag: `dp[${i}][${j}][${k}] = dp[${i - 1}][${j}][${k}] + dp[${i - 1}][${j - g}][${prevProfit}] = ${dp[i][j][k]}`,
                log: `| ⚡ 选入任务${i}: dp[${i}][${j}][${k}] = (不选 + 选入前驱) % MOD = ${dp[i][j][k]}`,
                msg: `状态转移：选入任务 <code>${i}</code>，<code>dp[${i}][${j}][${k}] = dp[${i - 1}][${j}][${k}] + dp[${i - 1}][${j - g}][${prevProfit}] = <strong>${dp[i][j][k]}</strong></code>。`
              });
            }
          }
        }
      }
    }

    const finalAns = dp[len][n][minProfit];
    steps.push({
      type: 'return',
      line: lineReturn,
      i: n,
      j: minProfit,
      grid: snapshotGrid2D(dp[len]),
      gridHighlight: { i: n, j: minProfit },
      tag: `盈利计划总数: ${finalAns}`,
      log: `| 🏆 计算完成！dp[${len}][${n}][${minProfit}] = ${finalAns}`,
      msg: `🏆 推导完成！在考虑所有 <code>${len}</code> 项任务后，最多 <code>${n}</code> 人且利润至少 <code>${minProfit}</code> 的合法计划数为 <strong>${finalAns}</strong>。`
    });

    return steps;
  }

  private compileProfitableSchemesStage4(
    group: number[],
    profit: number[],
    n: number,
    minProfit: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const len = group.length;
    const MOD = 1000000007;
    const lineEntry = anchorMap?.entry || 1;
    const lineInit = anchorMap?.init || 3;
    const lineBase = anchorMap?.base || 4;
    const lineLoopI = anchorMap?.loop_i || 5;
    const lineTransfer = anchorMap?.transfer || 9;
    const lineReturn = anchorMap?.return || 12;

    // 空间压缩为二维滚动
    const dp: (number | null)[][] = Array.from({ length: n + 1 }, () => new Array(minProfit + 1).fill(null));

    steps.push({
      type: 'entry',
      line: lineEntry,
      i: 0,
      j: 0,
      grid: snapshotGrid2D(dp),
      tag: `主函数入口: 盈利计划 (空间压缩)`,
      log: `| 🎯 函数入口：盈利计划（同址二维滚动压缩），n=${n}，minProfit=${minProfit}`,
      msg: `主函数入口：利用倒序滚动在 <code>dp[n+1][minProfit+1]</code> 同址更新，省去任务下标维度。`
    });

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      grid: snapshotGrid2D(dp),
      tag: `初始化二维滚动表`,
      log: `| 📋 初始化 dp[${n + 1}][${minProfit + 1}] 未探索`,
      msg: `初始化：<code>dp[${n + 1}][${minProfit + 1}]</code> 未探索。`
    });

    // 设定基底
    for (let j = 0; j <= n; j++) dp[j][0] = 1;

    steps.push({
      type: 'init',
      line: lineBase,
      i: 0,
      j: 0,
      grid: snapshotGrid2D(dp),
      tag: `基底 dp[j][0] = 1`,
      log: `| 📋 基底 dp[j][0] = 1 for j in 0..${n}`,
      msg: `基底：<code>dp[j][0] = 1</code>（任意人数下空计划利润 ≥ 0 方案数为 1）。`
    });

    for (let i = 0; i < len; i++) {
      const g = group[i];
      const p = profit[i];

      steps.push({
        type: 'eval',
        line: lineLoopI,
        i: 0,
        j: 0,
        grid: snapshotGrid2D(dp),
        tag: `任务 ${i + 1}: 需${g}人, 得${p}利润 (双倒序滚动)`,
        log: `| 🔄 处理任务 #${i + 1} (g=${g}, p=${p})，人数 j 从 ${n} 倒序到 ${g}`,
        msg: `任务 <code>${i + 1}</code>：人数 <code>j</code> 从 <code>${n}</code> 倒序到 <code>${g}</code>，利润 <code>k</code> 从 <code>${minProfit}</code> 倒序到 <code>0</code>。`
      });

      for (let j = n; j >= g; j--) {
        for (let k = minProfit; k >= 0; k--) {
          const prevProfit = Math.max(0, k - p);
          const addVal = dp[j - g][prevProfit];
          if (addVal !== null && addVal > 0) {
            const oldVal = dp[j][k] ?? 0;
            dp[j][k] = (oldVal + addVal) % MOD;
            steps.push({
              type: 'update-1d',
              line: lineTransfer,
              i: j,
              j: k,
              grid: snapshotGrid2D(dp),
              gridHighlight: { i: j, j: k },
              topI: j - g,
              topJ: prevProfit,
              tag: `双倒序: dp[${j}][${k}] = ${dp[j][k]}`,
              log: `| ⚡ 双倒序累加: dp[${j}][${k}] = (${oldVal} + dp[${j - g}][${prevProfit}]) % MOD = ${dp[j][k]}`,
              msg: `双倒序状态转移：<code>dp[${j}][${k}] = (${oldVal} + dp[${j - g}][${prevProfit}]) % MOD = <strong>${dp[j][k]}</strong></code>。`
            });
          }
        }
      }
    }

    const finalAns = dp[n][minProfit];
    steps.push({
      type: 'return',
      line: lineReturn,
      i: n,
      j: minProfit,
      grid: snapshotGrid2D(dp),
      gridHighlight: { i: n, j: minProfit },
      tag: `盈利计划总数: ${finalAns}`,
      log: `| 🏆 计算完成！dp[${n}][${minProfit}] = ${finalAns}`,
      msg: `🏆 推导完成！合法盈利计划总数为 <strong>${finalAns}</strong>。`
    });

    return steps;
  }
  // =========================================================================
  // 10. 从栈中取出K个硬币的最大面值和 (Maximum Value of K Coins From Piles, LC 2218)
  // =========================================================================
  private compileCoinsFromPiles(
    model: IYamlAlgorithmModel,
    params: StageExecutionParams
  ): UniversalStep[] {
    const defaultParams = model.defaultParams as any;
    let piles: number[][] = [[1, 100, 3], [7, 8, 9]];
    const rawPiles = (params as any)?.piles ?? defaultParams?.piles;
    if (Array.isArray(rawPiles)) {
      piles = rawPiles;
    } else if (typeof rawPiles === 'string') {
      try {
        piles = JSON.parse(rawPiles);
      } catch {
        piles = [[1, 100, 3], [7, 8, 9]];
      }
    }

    const rawK = (params as any)?.k ?? defaultParams?.k ?? 2;
    const k = Math.max(0, Number(rawK));

    return compileCoinsFromPilesSteps(
      piles,
      k,
      params.stage,
      Boolean(params.isMemo),
      params.anchorMap,
      params.direction === 'reverse' ? 'reverse' : 'forward'
    );
  }
}


/**
 * 从栈中取出K个硬币的最大面值和 (LeetCode 2218 / Class 074 Code02)
 * 核心状态推演编译器 (CoinsFromPilesCompiler)
 * 职责：编译生成四阶段全生命周期 UniversalStep 序列，杜绝伪绿灯与跳步。
 */
export function compileCoinsFromPilesSteps(
  piles: number[][],
  k: number,
  stage: number = 3,
  isMemo: boolean = false,
  anchorMap?: Record<string, number>,
  direction?: 'forward' | 'reverse' | string
): UniversalStep[] {
  const isReverse = direction === 'reverse';
  const stageNum = typeof stage === 'number' ? stage : 3;

  if (stageNum === 1) {
    return compileStage1Steps(piles, k, anchorMap, isReverse);
  } else if (stageNum === 2) {
    return compileStage2Steps(piles, k, anchorMap, isReverse);
  } else if (stageNum === 3) {
    return compileStage3Steps(piles, k, anchorMap, isReverse);
  } else {
    return compileStage4Steps(piles, k, anchorMap, isReverse);
  }
}

// ============================================================================
// 阶段 1: 暴力递归
// ============================================================================
function compileStage1Steps(
  piles: number[][],
  k: number,
  anchors?: Record<string, number>,
  isReverse: boolean = false
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const n = piles.length;
  const lineEntry = anchors?.entry || 3;
  const lineDfsEntry = anchors?.dfs_entry || 5;
  const lineBoundary = anchors?.boundary || 6;
  const lineBranch0 = anchors?.branch_not_take || 7;
  const lineLoopCoins = anchors?.loop_coins || 10;
  const lineBranchTake = anchors?.branch_take || 12;
  const lineCombine = anchors?.combine || 14;

  let nodeCounter = 1;
  const rootNode: UniversalTreeNode = {
    id: `node-${nodeCounter}`,
    r: isReverse ? n - 1 : 0,
    c: k,
    val: isReverse ? `dfs(${n - 1},${k})` : `dfs(0,${k})`,
    status: 'current',
    children: []
  };

  const emptyGrid: (number | null)[][] = Array.from({ length: n }, () => new Array(k + 1).fill(null));
  const activeStack: string[] = [];

  function pushStep(data: Partial<UniversalStep>) {
    steps.push({
      stage: 1,
      grid: JSON.parse(JSON.stringify(emptyGrid)),
      activeStack: [...activeStack],
      treeRoot: cloneTree(rootNode),
      decision: data.decision || '递归分支探索',
      log: data.log || '| 探索',
      msg: data.msg || data.log || '',
      line: data.line || lineDfsEntry,
      ...data
    });
  }

  pushStep({
    type: 'entry',
    line: lineEntry,
    activeNodeId: rootNode.id,
    tag: `启动递归 dfs(${isReverse ? n - 1 : 0}, ${k})`,
    log: `| 🚀 启动暴力递归：总容量 K=${k}，硬币栈总数 N=${n}，方向=${isReverse ? '倒序' : '正序'}`,
    msg: `启动硬币栈挑选递归：从 ${isReverse ? '末尾栈' : '首栈'} 开始探索，总容量限制 <code>K = ${k}</code>。`,
    decision: '启动主函数'
  });

  function dfs(i: number, remK: number, parentNode: UniversalTreeNode, depth: number): number {
    if (steps.length > 300) return 0;
    const callLabel = `dfs(${i},${remK})`;
    activeStack.push(callLabel);

    pushStep({
      type: 'dfs-entry',
      line: lineDfsEntry,
      i: Math.min(Math.max(0, i), n - 1),
      j: remK,
      activeNodeId: parentNode.id,
      tag: `进入帧 ${callLabel}`,
      log: `| 📥 进入递归帧 ${callLabel}，剩余容量 remK=${remK}`,
      msg: `进入递归函数帧：当前考察硬币栈 <code>#${i}</code>，剩余待提取容量 <code>remK = ${remK}</code>。`,
      decision: `考察栈 #${i}`
    });

    const isBase = isReverse ? (i < 0 || remK === 0) : (i === n || remK === 0);
    if (isBase) {
      parentNode.status = 'base';
      parentNode.tag = '基底: 0';
      pushStep({
        type: 'boundary',
        line: lineBoundary,
        i: Math.min(Math.max(0, i), n - 1),
        j: remK,
        activeNodeId: parentNode.id,
        tag: '命中基底返回 0',
        log: `| 🎯 边界命中: ${remK === 0 ? '容量扣减完毕' : '栈已考察完毕'}，return 0`,
        msg: `边界条件命中：${remK === 0 ? '剩余容量已精确扣减为 0' : '所有硬币栈已遍历完毕'}，不可再抽取硬币，返回 <strong>0</strong>。`,
        decision: '基底返回 0'
      });
      activeStack.pop();
      return 0;
    }

    // 分支 0: 拿 0 枚
    const nextI = isReverse ? i - 1 : i + 1;
    const child0: UniversalTreeNode = {
      id: `node-${++nodeCounter}`,
      r: Math.min(Math.max(0, nextI), n - 1),
      c: remK,
      val: `dfs(${nextI},${remK})`,
      edgeLabel: '拿0枚',
      status: 'current',
      children: []
    };
    parentNode.children.push(child0);

    pushStep({
      type: 'branch-call',
      line: lineBranch0,
      i,
      j: remK,
      activeNodeId: parentNode.id,
      tag: `栈#${i} 拿 0 枚`,
      log: `| 🌿 分支 0: 栈 #${i} 拿 0 枚，转向下层 dfs(${nextI}, ${remK})`,
      msg: `组内互斥分支 0：当前栈 <code>#${i}</code> <strong>拿 0 枚</strong>硬币，进入下一层 <code>dfs(${nextI}, ${remK})</code>。`,
      decision: `栈 #${i} 选拿 0 枚`
    });

    let maxVal = dfs(nextI, remK, child0, depth + 1);

    // 分支 c: 拿 c 枚
    const pile = piles[i];
    const t = Math.min(pile.length, remK);
    let sum = 0;
    for (let c = 1; c <= t; c++) {
      sum += pile[c - 1];
      const childC: UniversalTreeNode = {
        id: `node-${++nodeCounter}`,
        r: Math.min(Math.max(0, nextI), n - 1),
        c: remK - c,
        val: `dfs(${nextI},${remK - c})`,
        edgeLabel: `拿${c}枚(+${sum})`,
        status: 'current',
        children: []
      };
      parentNode.children.push(childC);

      pushStep({
        type: 'branch-call',
        line: lineLoopCoins,
        i,
        j: remK,
        activeNodeId: parentNode.id,
        tag: `栈#${i} 拿 ${c} 枚 (和=${sum})`,
        log: `| 🪙 分支 ${c}: 栈 #${i} 拿 ${c} 枚，累计前缀和 ${sum}，深入 dfs(${nextI}, ${remK - c})`,
        msg: `组内互斥分支 ${c}：连续拿取 <code>${c}</code> 枚硬币（面值和 <code>${sum}</code>），进入 <code>dfs(${nextI}, ${remK - c})</code>。`,
        decision: `栈 #${i} 试算拿 ${c} 枚`
      });

      const sub = dfs(nextI, remK - c, childC, depth + 1) + sum;
      if (sub > maxVal) {
        maxVal = sub;
      }

      pushStep({
        type: 'branch-eval',
        line: lineBranchTake,
        i,
        j: remK,
        activeNodeId: parentNode.id,
        tag: `试算分支收益=${sub}`,
        log: `| ⚖️ 分支收益比较: 拿 ${c} 枚得 ${sub}，当前最高 maxVal=${maxVal}`,
        msg: `分支收益结算：拿取 ${c} 枚总收益为 <code>${sub}</code>，当前最优面值更新为 <strong>${maxVal}</strong>。`,
        decision: `更新最优面值=${maxVal}`
      });
    }

    parentNode.status = 'visited';
    parentNode.tag = `= ${maxVal}`;
    pushStep({
      type: 'combine',
      line: lineCombine,
      i,
      j: remK,
      activeNodeId: parentNode.id,
      tag: `汇聚返回 ${maxVal}`,
      log: `| 🔄 栈 #${i} 决策完毕，汇总返回 maxVal=${maxVal}`,
      msg: `硬币栈 #${i} 组内各互斥分支比较完毕，向父调用返回最大面值 <strong>${maxVal}</strong>。`,
      decision: `返回结果 ${maxVal}`
    });

    activeStack.pop();
    return maxVal;
  }

  const startI = isReverse ? n - 1 : 0;
  dfs(startI, k, rootNode, 0);

  return steps;
}

// ============================================================================
// 阶段 2: 记忆化搜索
// ============================================================================
function compileStage2Steps(
  piles: number[][],
  k: number,
  anchors?: Record<string, number>,
  isReverse: boolean = false
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const n = piles.length;
  const lineInitMemo = anchors?.init_memo || 4;
  const lineEntry = anchors?.entry || 6;
  const lineDfsEntry = anchors?.dfs_entry || 8;
  const lineBoundary = anchors?.boundary || 9;
  const lineCacheHit = anchors?.cache_hit || 10;
  const lineBranch0 = anchors?.branch_not_take || 11;
  const lineLoopCoins = anchors?.loop_coins || 14;
  const lineBranchTake = anchors?.branch_take || 16;
  const lineCombine = anchors?.combine || 18;

  const memoGrid: (number | null)[][] = Array.from({ length: n }, () => new Array(k + 1).fill(null));
  const activeStack: string[] = [];
  let nodeCounter = 1;

  const rootNode: UniversalTreeNode = {
    id: `node-${nodeCounter}`,
    r: isReverse ? n - 1 : 0,
    c: k,
    val: isReverse ? `dfsMemo(${n - 1},${k})` : `dfsMemo(0,${k})`,
    status: 'current',
    children: []
  };

  function pushStep(data: Partial<UniversalStep>) {
    steps.push({
      stage: 2,
      grid: JSON.parse(JSON.stringify(memoGrid)),
      activeStack: [...activeStack],
      treeRoot: cloneTree(rootNode),
      decision: data.decision || '记忆化探查',
      log: data.log || '| 记忆化搜索',
      msg: data.msg || data.log || '',
      line: data.line || lineDfsEntry,
      ...data
    });
  }

  pushStep({
    type: 'init-memo',
    line: lineInitMemo,
    i: 0,
    j: 0,
    activeNodeId: rootNode.id,
    tag: `初始化备忘录 memo[${n}][${k + 1}]`,
    log: `| 📋 初始化二维备忘录 memo[${n}][${k + 1}] 全为 null (-1)`,
    msg: `创建规格为 <code>${n} × ${k + 1}</code> 的二维备忘录矩阵，初始状态全部填充为空。`,
    decision: '建立备忘录'
  });

  pushStep({
    type: 'entry',
    line: lineEntry,
    activeNodeId: rootNode.id,
    tag: `启动记忆化 dfsMemo(${isReverse ? n - 1 : 0}, ${k})`,
    log: `| 🚀 启动记忆化搜索：dfsMemo(${isReverse ? n - 1 : 0}, ${k})`,
    msg: `启动带备忘录的深度优先搜索，遇到重叠子状态立即 O(1) 查表剪枝。`,
    decision: '启动记忆化搜索'
  });

  function dfsMemo(i: number, remK: number, parentNode: UniversalTreeNode): number {
    if (steps.length > 350) return 0;
    const callLabel = `dfsMemo(${i},${remK})`;
    activeStack.push(callLabel);

    const safeI = Math.min(Math.max(0, i), n - 1);
    pushStep({
      type: 'dfs-entry',
      line: lineDfsEntry,
      i: safeI,
      j: remK,
      activeNodeId: parentNode.id,
      tag: `进入帧 ${callLabel}`,
      log: `| 📥 进入帧 ${callLabel}，探查备忘录缓存`,
      msg: `探查状态 <code>memo[${i}][${remK}]</code>：检查是否曾被计算缓存。`,
      decision: `探查 memo[${i}][${remK}]`
    });

    const isBase = isReverse ? (i < 0 || remK === 0) : (i === n || remK === 0);
    if (isBase) {
      parentNode.status = 'base';
      parentNode.tag = '基底: 0';
      pushStep({
        type: 'boundary',
        line: lineBoundary,
        i: safeI,
        j: remK,
        activeNodeId: parentNode.id,
        tag: '命中基底 0',
        log: `| 🎯 边界命中: 剩余容量为 0 或栈已耗尽，return 0`,
        msg: `边界条件命中：不可再提取硬币，直接返回基底值 <strong>0</strong>。`,
        decision: '基底返回 0'
      });
      activeStack.pop();
      return 0;
    }

    if (memoGrid[i][remK] !== null) {
      const cached = memoGrid[i][remK]!;
      parentNode.status = 'pruned';
      parentNode.tag = `⚡剪枝: ${cached}`;
      pushStep({
        type: 'cache-hit',
        line: lineCacheHit,
        i,
        j: remK,
        activeNodeId: parentNode.id,
        gridHighlight: { i, j: remK },
        tag: `⚡ 备忘录命中 memo[${i}][${remK}] = ${cached}`,
        log: `| ⚡ 备忘录命中: memo[${i}][${remK}] = ${cached}，立即剪枝返回！`,
        msg: `⚡ <strong>备忘录命中</strong>：状态 <code>memo[${i}][${remK}]</code> 先前已被计算，直接返回缓存值 <strong>${cached}</strong>，成功剪除庞大子树！`,
        decision: `Cache Hit: 直接返回 ${cached}`
      });
      activeStack.pop();
      return cached;
    }

    const nextI = isReverse ? i - 1 : i + 1;
    const child0: UniversalTreeNode = {
      id: `node-${++nodeCounter}`,
      r: Math.min(Math.max(0, nextI), n - 1),
      c: remK,
      val: `dfsMemo(${nextI},${remK})`,
      edgeLabel: '拿0枚',
      status: 'current',
      children: []
    };
    parentNode.children.push(child0);

    pushStep({
      type: 'branch-call',
      line: lineBranch0,
      i,
      j: remK,
      activeNodeId: parentNode.id,
      tag: `栈#${i} 选拿 0 枚`,
      log: `| 🌿 缓存未命中，展开分支 0：栈 #${i} 拿 0 枚`,
      msg: `缓存未命中：尝试分支 0（不拿当前栈硬币），深入 <code>dfsMemo(${nextI}, ${remK})</code>。`,
      decision: `展开分支 0`
    });

    let maxVal = dfsMemo(nextI, remK, child0);

    const pile = piles[i];
    const t = Math.min(pile.length, remK);
    let sum = 0;
    for (let c = 1; c <= t; c++) {
      sum += pile[c - 1];
      const childC: UniversalTreeNode = {
        id: `node-${++nodeCounter}`,
        r: Math.min(Math.max(0, nextI), n - 1),
        c: remK - c,
        val: `dfsMemo(${nextI},${remK - c})`,
        edgeLabel: `拿${c}枚(+${sum})`,
        status: 'current',
        children: []
      };
      parentNode.children.push(childC);

      pushStep({
        type: 'branch-call',
        line: lineLoopCoins,
        i,
        j: remK,
        activeNodeId: parentNode.id,
        tag: `栈#${i} 拿 ${c} 枚`,
        log: `| 🪙 分支 ${c}: 栈 #${i} 连续拿 ${c} 枚 (和=${sum})`,
        msg: `尝试分支 ${c}：连续抽取 <code>${c}</code> 枚硬币（前缀和 <code>${sum}</code>）。`,
        decision: `试算拿 ${c} 枚`
      });

      const sub = dfsMemo(nextI, remK - c, childC) + sum;
      if (sub > maxVal) {
        maxVal = sub;
      }

      pushStep({
        type: 'branch-eval',
        line: lineBranchTake,
        i,
        j: remK,
        activeNodeId: parentNode.id,
        tag: `试算结果=${sub}`,
        log: `| ⚖️ 分支收益比较: 拿 ${c} 枚收益 ${sub}，当前 maxVal=${maxVal}`,
        msg: `比较分支收益：拿取 ${c} 枚收益为 <code>${sub}</code>，当前最优面值 <strong>${maxVal}</strong>。`,
        decision: `更新最优面值=${maxVal}`
      });
    }

    memoGrid[i][remK] = maxVal;
    parentNode.status = 'visited';
    parentNode.tag = `= ${maxVal}`;

    pushStep({
      type: 'memo-store',
      line: lineCombine,
      i,
      j: remK,
      activeNodeId: parentNode.id,
      gridHighlight: { i, j: remK },
      tag: `💾 写入 memo[${i}][${remK}] = ${maxVal}`,
      log: `| 💾 写入备忘录: memo[${i}][${remK}] = ${maxVal}，落盘回溯`,
      msg: `💾 <strong>写入备忘录</strong>：将状态 <code>memo[${i}][${remK}] = <strong>${maxVal}</strong></code> 存入表格，供后续剪枝使用。`,
      decision: `缓存落盘 memo[${i}][${remK}] = ${maxVal}`
    });

    activeStack.pop();
    return maxVal;
  }

  const startI = isReverse ? n - 1 : 0;
  dfsMemo(startI, k, rootNode);

  return steps;
}

// ============================================================================
// 阶段 3: 严格二维动态规划
// ============================================================================
function compileStage3Steps(
  piles: number[][],
  k: number,
  anchors?: Record<string, number>,
  isReverse: boolean = false
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const n = piles.length;
  const lineInitDp = anchors?.init_dp || 4;
  const lineOuterLoop = anchors?.outer_loop || 5;
  const linePresumCalc = anchors?.presum_calc || 8;
  const lineInnerCap = anchors?.inner_cap || 10;
  const lineBranch0 = anchors?.branch_not_take || 11;
  const lineLoopCoins = anchors?.loop_coins || 12;
  const lineTransition = anchors?.transition || 13;
  const lineReturnAns = anchors?.return_ans || 17;

  // dp 矩阵为 n x (k + 1)，行代表硬币栈 0..n-1，列代表容量 0..k
  const dp: number[][] = Array.from({ length: n }, () => new Array(k + 1).fill(0));

  function pushStep(data: Partial<UniversalStep>) {
    steps.push({
      stage: 3,
      grid: JSON.parse(JSON.stringify(dp)),
      decision: data.decision || '二维动态规划状态转移',
      log: data.log || '| DP填表',
      msg: data.msg || data.log || '',
      line: data.line || lineTransition,
      ...data
    });
  }

  pushStep({
    type: 'init-dp',
    line: lineInitDp,
    i: 0,
    j: 0,
    tag: `创建二维 DP 矩阵 dp[${n}][${k + 1}]`,
    log: `| 📋 创建规格为 ${n} × ${k + 1} 的二维动态规划状态表`,
    msg: `初始化 <code>${n} × ${k + 1}</code> 的二维 DP 状态表，行表示硬币栈，列表示抽取容量上限。`,
    decision: '初始化 DP 表'
  });

  if (!isReverse) {
    // 正序推导：从栈 0 到 栈 n-1
    for (let i = 0; i < n; i++) {
      const pile = piles[i];
      const t = Math.min(pile.length, k);
      const preSum = new Array(t + 1).fill(0);
      for (let p = 0; p < t; p++) preSum[p + 1] = preSum[p] + pile[p];

      pushStep({
        type: 'outer-loop',
        line: lineOuterLoop,
        i,
        j: 0,
        gridHighlight: { i, j: 0 },
        tag: `考察硬币栈 #${i} (前缀和预处理)`,
        log: `| 🔁 外层循环: 考察硬币栈 #${i}，前缀和预处理完成 preSum=[${preSum.join(',')}]`,
        msg: `外层循环：考察硬币栈 <code>#${i}</code>，计算连续抽取 1..${t} 枚硬币的前缀和。`,
        decision: `考察硬币栈 #${i}`
      });

      for (let j = 0; j <= k; j++) {
        pushStep({
          type: 'inner-cap',
          line: lineInnerCap,
          i,
          j,
          gridHighlight: { i, j },
          tag: `考察容量 j=${j}`,
          log: `| ➡️ 内层循环: 考察容量上限 j = ${j}/${k}`,
          msg: `内层循环：当前总抽取容量限制为 <code>j = ${j}</code>。`,
          decision: `考察容量 j = ${j}`
        });

        // 分支 0: 拿 0 枚
        const valNotTake = i > 0 ? dp[i - 1][j] : 0;
        let bestVal = valNotTake;
        let bestC = 0;

        const candidateDeps: Array<{ r: number; c: number; type?: 'top' | 'left' | 'diag'; label?: string }> = [];
        if (i > 0) {
          candidateDeps.push({ r: i - 1, c: j, type: 'top', label: `拿0枚(dp[${i - 1}][${j}])` });
        }

        // 组内互斥枚举拿 1..t 枚
        for (let c = 1; c <= Math.min(t, j); c++) {
          const prevVal = i > 0 ? dp[i - 1][j - c] : 0;
          const cand = prevVal + preSum[c];
          if (i > 0) {
            candidateDeps.push({
              r: i - 1,
              c: j - c,
              type: 'diag',
              label: `拿${c}枚(dp[${i - 1}][${j - c}]+${preSum[c]})`
            });
          }
          if (cand > bestVal) {
            bestVal = cand;
            bestC = c;
          }
        }

        dp[i][j] = bestVal;

        pushStep({
          type: 'transition',
          line: lineTransition,
          i,
          j,
          val: bestVal,
          topI: i > 0 ? i - 1 : undefined,
          topJ: j,
          leftI: i > 0 && bestC > 0 ? i - 1 : undefined,
          leftJ: i > 0 && bestC > 0 ? j - bestC : undefined,
          deps: candidateDeps.length > 0 ? candidateDeps : [{ r: i, c: j, type: 'top', label: `基底: ${bestVal}` }],
          gridHighlight: { i, j },
          tag: `转移落盘 dp[${i}][${j}] = ${bestVal}`,
          log: `| ⚖️ 组内互斥转移: dp[${i}][${j}] = ${bestVal} (优选拿${bestC}枚)`,
          msg: `组内互斥决策：比较拿 0..${Math.min(t, j)} 枚硬币，最优选择为<strong>拿 ${bestC} 枚</strong>，<code>dp[${i}][${j}] = <strong>${bestVal}</strong></code>。`,
          decision: `dp[${i}][${j}] = ${bestVal}`
        });
      }
    }

    pushStep({
      type: 'return-ans',
      line: lineReturnAns,
      i: n - 1,
      j: k,
      val: dp[n - 1][k],
      gridHighlight: { i: n - 1, j: k },
      tag: `全局最优解 = ${dp[n - 1][k]}`,
      log: `| 🎉 二维填表完成！全部 ${n} 个栈在容量 ${k} 下最大面值为 dp[${n - 1}][${k}] = ${dp[n - 1][k]}`,
      msg: `🎉 <strong>二维填表推导完成</strong>！在容量为 <code>${k}</code> 下，最大可得面值为 <strong>${dp[n - 1][k]}</strong>。`,
      decision: `最终最大面值 = ${dp[n - 1][k]}`
    });
  } else {
    // 逆向推导：从栈 n-1 倒推至 栈 0，容量从 k 倒推至 0
    for (let i = n - 1; i >= 0; i--) {
      const pile = piles[i];
      const t = Math.min(pile.length, k);
      const preSum = new Array(t + 1).fill(0);
      for (let p = 0; p < t; p++) preSum[p + 1] = preSum[p] + pile[p];

      pushStep({
        type: 'outer-loop',
        line: lineOuterLoop,
        i,
        j: k,
        gridHighlight: { i, j: k },
        tag: `逆向考察硬币栈 #${i}`,
        log: `| 🔁 逆向外层循环: 考察硬币栈 #${i}`,
        msg: `逆向外层循环：从后向前逆序寻源硬币栈 <code>#${i}</code>。`,
        decision: `逆向考察栈 #${i}`
      });

      for (let j = k; j >= 0; j--) {
        const valNotTake = i < n - 1 ? dp[i + 1][j] : 0;
        let bestVal = valNotTake;
        let bestC = 0;

        const candidateDeps: Array<{ r: number; c: number; type?: 'top' | 'left' | 'diag'; label?: string }> = [];
        if (i < n - 1) {
          candidateDeps.push({ r: i + 1, c: j, type: 'top', label: `拿0枚` });
        }

        for (let c = 1; c <= Math.min(t, j); c++) {
          const prevVal = i < n - 1 ? dp[i + 1][j - c] : 0;
          const cand = prevVal + preSum[c];
          if (i < n - 1) {
            candidateDeps.push({ r: i + 1, c: j - c, type: 'diag', label: `拿${c}枚` });
          }
          if (cand > bestVal) {
            bestVal = cand;
            bestC = c;
          }
        }

        dp[i][j] = bestVal;

        pushStep({
          type: 'transition',
          line: lineTransition,
          i,
          j,
          val: bestVal,
          deps: candidateDeps.length > 0 ? candidateDeps : [{ r: i, c: j, type: 'top', label: `基底: ${bestVal}` }],
          gridHighlight: { i, j },
          tag: `逆向转移 dp[${i}][${j}] = ${bestVal}`,
          log: `| ⚖️ 逆向转移: dp[${i}][${j}] = ${bestVal}`,
          msg: `逆向依赖回溯：状态 <code>dp[${i}][${j}] = <strong>${bestVal}</strong></code>。`,
          decision: `逆向更新 dp[${i}][${j}] = ${bestVal}`
        });
      }
    }

    pushStep({
      type: 'return-ans',
      line: lineReturnAns,
      i: 0,
      j: k,
      val: dp[0][k],
      gridHighlight: { i: 0, j: k },
      tag: `逆向收敛最优解 = ${dp[0][k]}`,
      log: `| 🎉 逆向推演收敛完成！最大面值为 ${dp[0][k]}`,
      msg: `🎉 <strong>逆向推演收敛完成</strong>！最优收益为 <strong>${dp[0][k]}</strong>。`,
      decision: `逆向收敛 = ${dp[0][k]}`
    });
  }

  return steps;
}

// ============================================================================
// 阶段 4: 一维空间压缩
// ============================================================================
function compileStage4Steps(
  piles: number[][],
  k: number,
  anchors?: Record<string, number>,
  isReverse: boolean = false
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const n = piles.length;
  const lineInitDp = anchors?.init_dp || 3;
  const lineOuterLoop = anchors?.outer_loop || 4;
  const lineInnerCap = anchors?.inner_cap || 8;
  const lineTransition = anchors?.transition || 10;
  const lineReturnAns = anchors?.return_ans || 14;

  const dp = new Array(k + 1).fill(0);

  function pushStep(data: Partial<UniversalStep>) {
    steps.push({
      stage: 4,
      dp1d: [...dp],
      metrics: { space: 'O(K)' },
      decision: data.decision || '空间压缩状态流转',
      log: data.log || '| 一维压缩流转',
      msg: data.msg || data.log || '',
      line: data.line || lineTransition,
      ...data
    });
  }

  pushStep({
    type: 'init-dp',
    line: lineInitDp,
    activeSlot: 0,
    tag: `初始化一维数组 dp[0..${k}] 全为 0`,
    log: `| 📋 初始化一维滚动数组 dp[0..${k}] 全为 0`,
    msg: `初始化长度为 <code>${k + 1}</code> 的一维滚动数组，辅助空间由 O(N×K) 大幅降至 <strong>O(K)</strong>。`,
    decision: '初始化一维数组'
  });

  const pileIndices = isReverse
    ? Array.from({ length: n }, (_, idx) => n - 1 - idx)
    : Array.from({ length: n }, (_, idx) => idx);

  for (const i of pileIndices) {
    const pile = piles[i];
    const t = Math.min(pile.length, k);
    const preSum = new Array(t + 1).fill(0);
    for (let p = 0; p < t; p++) preSum[p + 1] = preSum[p] + pile[p];

    pushStep({
      type: 'outer-loop',
      line: lineOuterLoop,
      activeSlot: 0,
      tag: `考察硬币栈 #${i}`,
      log: `| 🔁 空间压缩外层: 考察硬币栈 #${i}，前缀和 preSum=[${preSum.join(',')}]`,
      msg: `外层遍历硬币栈 <code>#${i}</code>。注意：分组背包中<strong>容量必须在外层倒序遍历</strong>，以防同组重复拿取！`,
      decision: `考察硬币栈 #${i}`
    });

    // 容量从 k 倒序遍历至 1
    for (let j = k; j > 0; j--) {
      pushStep({
        type: 'inner-cap',
        line: lineInnerCap,
        activeSlot: j,
        tag: `容量倒序 j = ${j}`,
        log: `| ⬅️ 容量倒序: j = ${j}，防止同组多选`,
        msg: `容量倒序考察 <code>j = ${j}</code>：枚举拿取 1..${Math.min(t, j)} 枚硬币。`,
        decision: `倒序考察容量 j=${j}`
      });

      for (let c = 1; c <= Math.min(t, j); c++) {
        const candidate = dp[j - c] + preSum[c];
        const isUpdate = candidate > dp[j];
        if (isUpdate) {
          dp[j] = candidate;
        }

        pushStep({
          type: 'transition',
          line: lineTransition,
          activeSlot: j,
          highlightSlots: [j - c],
          tag: `转移 dp[${j}] = max(dp[${j}], dp[${j - c}] + ${preSum[c]}) = ${dp[j]}`,
          log: `| 🪙 拿取 ${c} 枚: 试算 dp[${j - c}] + ${preSum[c]} = ${candidate} -> dp[${j}] = ${dp[j]}`,
          msg: `组内互斥比较：尝试拿 <code>${c}</code> 枚硬币，从历史状态 <code>dp[${j - c}]</code> 转移，更新 <code>dp[${j}] = <strong>${dp[j]}</strong></code>。`,
          decision: isUpdate ? `更新 dp[${j}] = ${dp[j]}` : `保持当前最优 dp[${j}]`
        });
      }
    }
  }

  pushStep({
    type: 'return-ans',
    line: lineReturnAns,
    activeSlot: k,
    tag: `一维压缩完成！最大收益 = ${dp[k]}`,
    log: `| 🎉 一维空间压缩完成！dp[${k}] = ${dp[k]}`,
    msg: `🎉 <strong>空间压缩演化完成</strong>！在 O(K) 辅助空间下，求得全局最大收益为 <strong>${dp[k]}</strong>。`,
    decision: `完成 O(K) 压缩推导`
  });

  return steps;
}
