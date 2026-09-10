import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { cloneTree } from './strategy-helpers';

export type KnapsackFamilyModelId =
  | 'last-stone-weight-ii'
  | 'complete-knapsack'
  | 'coin-change-ii'
  | 'coin-change'
  | 'perfect-squares'
  | 'ones-and-zeroes'
  | 'word-break'
  | 'multiple-knapsack';

/**
 * 背包 DP 扩展家族多态策略 (KnapsackFamilyStrategy)
 * 覆盖：最后一块石头的重量 II、完全背包、零钱兑换 I/II、完全平方数、一和零、单词拆分
 */
export class KnapsackFamilyStrategy implements IAlgorithmStrategy {
  public readonly modelId: string;

  constructor(modelId: KnapsackFamilyModelId | string) {
    this.modelId = modelId;
  }

  public canHandle(modelId: string): boolean {
    return (
      modelId === this.modelId ||
      (this.modelId === 'last-stone-weight-ii' && (modelId === 'last-stone-weight' || modelId === 'last-stone-weight-2')) ||
      (this.modelId === 'complete-knapsack' && (modelId === 'complete-standard' || modelId === 'knapsack-complete')) ||
      (this.modelId === 'coin-change-ii' && (modelId === 'coin-change-2' || modelId === 'coin2')) ||
      (this.modelId === 'coin-change' && modelId === 'coin1') ||
      (this.modelId === 'multiple-knapsack' && (modelId === 'multiple-knapsack-theory' || modelId === 'knapsack-multiple'))
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
    const n = stones.length;

    if (stage === 1 || stage === 2) {
      const steps: UniversalStep[] = [];
      const memo: Record<string, number> = {};
      let nodeIdCounter = 0;
      const rootNode: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: 0,
        c: target,
        val: `dfs(0, ${target})`,
        status: 'current',
        children: []
      };

      function dfs(i: number, cap: number, node?: UniversalTreeNode): number {
        const key = `${i},${cap}`;
        if (i >= n || cap === 0) {
          if (node) { node.status = 'base'; node.tag = `= 0`; }
          return 0;
        }
        if (isMemo && memo[key] !== undefined) {
          if (node) { node.status = 'visited'; node.tag = `⚡=${memo[key]}`; }
          return memo[key];
        }

        // 不选
        let childNotTake: UniversalTreeNode | undefined;
        if (node) {
          childNotTake = { id: `node-${++nodeIdCounter}`, r: i + 1, c: cap, val: `dfs(${i + 1}, ${cap})`, edgeLabel: '不选', status: 'normal', children: [] };
          node.children.push(childNotTake);
        }
        const notTake = dfs(i + 1, cap, childNotTake);

        // 选入
        let take = 0;
        if (cap >= stones[i]) {
          let childTake: UniversalTreeNode | undefined;
          if (node) {
            childTake = { id: `node-${++nodeIdCounter}`, r: i + 1, c: cap - stones[i], val: `dfs(${i + 1}, ${cap - stones[i]})`, edgeLabel: `选(${stones[i]})`, status: 'normal', children: [] };
            node.children.push(childTake);
          }
          take = dfs(i + 1, cap - stones[i], childTake) + stones[i];
        }

        const res = Math.max(notTake, take);
        if (isMemo) memo[key] = res;
        if (node) { node.status = res > 0 ? 'visited' : 'normal'; node.tag = `= ${res}`; }
        return res;
      }

      dfs(0, target, rootNode);

      steps.push({
        type: 'entry',
        i: 0,
        j: target,
        grid: [[0]],
        tag: `dfs(0, ${target})`,
        log: `| ➡️ 递归搜索：石头数组 [${stones.join(', ')}]，总重=${sum}，目标拆分子集容量=${target}`,
        msg: `将石头分为两堆，转化为容量为 <code>${target}</code> (总重 ${sum} / 2) 的 0-1 背包问题。`,
        activeNodeId: rootNode.id,
        treeRoot: cloneTree(rootNode)
      });
      return steps;
    }

    // Stage 3 & 4: DP Tabulation
    const steps: UniversalStep[] = [];
    const dp = new Array(target + 1).fill(0);

    steps.push({
      type: 'init',
      line: anchorMap?.init || 2,
      i: 0,
      j: 0,
      dp1d: [...dp],
      highlightSlots: [0],
      tag: `初始化 dp[0..${target}]`,
      log: `| 📋 初始化一维滚动数组，容量上限 target = ${target}`,
      msg: `初始化 <code>dp[0..${target}] = 0</code>，目标容量 <code>${target}</code>。`
    });

    for (let i = 0; i < n; i++) {
      const stone = stones[i];
      for (let j = target; j >= stone; j--) {
        const oldVal = dp[j];
        const candidate = dp[j - stone] + stone;
        dp[j] = Math.max(oldVal, candidate);

        steps.push({
          type: stage === 4 ? 'update-1d' : 'update',
          line: anchorMap?.transfer || 6,
          i: 0,
          j,
          dp1d: [...dp],
          currentI: i,
          currentJ: j,
          srcSlots: [j - stone],
          highlightSlots: [j],
          tag: `dp[${j}] = max(${oldVal}, dp[${j - stone}]+${stone}) = ${dp[j]}`,
          log: `| ⚡ 逆序更新: 考察石头 ${stone}，dp[${j}] = max(${oldVal}, ${candidate}) = ${dp[j]}`,
          msg: `放入石头 <code>${stone}</code>：<code>dp[${j}] = max(${oldVal}, dp[${j - stone}] + ${stone}) = <strong>${dp[j]}</strong></code>。`
        });
      }
    }

    const finalAns = sum - 2 * dp[target];
    steps.push({
      type: 'return',
      line: anchorMap?.return || 10,
      i: 0,
      j: target,
      dp1d: [...dp],
      highlightSlots: [target],
      tag: `最终剩余重量: ${finalAns}`,
      log: `| 🏆 计算完成！最大凑出子集重=${dp[target]}，两堆对撞粉碎剩余 = ${sum} - 2*${dp[target]} = ${finalAns}`,
      msg: `🏆 计算完成！子集最大装载 <code>${dp[target]}</code>，两堆对撞粉碎后最小剩余重量为 <code>${sum} - 2 × ${dp[target]} = <strong>${finalAns}</strong></code>。`
    });

    return steps;
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
    const n = weights.length;

    const steps: UniversalStep[] = [];
    const dp = new Array(capacity + 1).fill(0);

    steps.push({
      type: 'init',
      line: anchorMap?.init || 2,
      i: 0,
      j: 0,
      dp1d: [...dp],
      highlightSlots: [0],
      tag: `完全背包初始化 dp[0..${capacity}]`,
      log: `| 📋 初始化一维滚动数组，容量上限 = ${capacity}`,
      msg: `初始化 <code>dp[0..${capacity}] = 0</code>。完全背包每个物品可重复选取，容量正序遍历！`
    });

    for (let i = 0; i < n; i++) {
      const w = weights[i];
      const v = values[i];

      steps.push({
        type: 'outer-loop',
        line: anchorMap?.outer_loop || 4,
        i: 0,
        j: 0,
        dp1d: [...dp],
        currentI: i,
        tag: `考察物品 ${i} (重=${w}, 价=${v})`,
        log: `| 🔄 外层循环: 考察第 ${i} 种物品 (重量 ${w}, 价值 ${v})`,
        msg: `外层循环：考察物品 <code>[重量 ${w}, 价值 ${v}]</code>。`
      });

      // 完全背包：正序正向遍历
      for (let j = w; j <= capacity; j++) {
        const oldVal = dp[j];
        const candidate = dp[j - w] + v;
        dp[j] = Math.max(oldVal, candidate);

        steps.push({
          type: stage === 4 ? 'update-1d' : 'update',
          line: anchorMap?.transfer || 6,
          i: 0,
          j,
          dp1d: [...dp],
          currentI: i,
          currentJ: j,
          srcSlots: [j - w],
          highlightSlots: [j],
          tag: `正序: dp[${j}] = max(${oldVal}, dp[${j - w}]+${v}) = ${dp[j]}`,
          log: `| ⚡ 正序累加: dp[${j}] = max(${oldVal}, ${candidate}) = ${dp[j]}`,
          msg: `正序遍历槽位 <code>dp[${j}] = max(dp[${j}], dp[${j - w}] + ${v}) = <strong>${dp[j]}</strong></code>（允许该物品继续复选）。`
        });
      }
    }

    steps.push({
      type: 'return',
      line: anchorMap?.return || 10,
      i: 0,
      j: capacity,
      dp1d: [...dp],
      highlightSlots: [capacity],
      tag: `完全背包最大价值: ${dp[capacity]}`,
      log: `| 🏆 计算完成！容量 ${capacity} 下的最大价值为 ${dp[capacity]}`,
      msg: `🏆 推导完成！完全背包在容量 <code>${capacity}</code> 下的最大总价值为 <strong>${dp[capacity]}</strong>。`
    });

    return steps;
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
    const n = coins.length;

    const steps: UniversalStep[] = [];
    const dp = new Array(amount + 1).fill(0);
    dp[0] = 1;

    steps.push({
      type: 'init',
      line: anchorMap?.init || 2,
      i: 0,
      j: 0,
      dp1d: [...dp],
      highlightSlots: [0],
      tag: 'dp[0] = 1 (凑成金额 0 方案数为 1)',
      log: `| 📋 初始化 dp[0..${amount}]，dp[0] = 1（求组合数：先硬币后金额）`,
      msg: `初始化 <code>dp[0] = 1</code>（凑成金额 0 只有 1 种方法：不选任何硬币）。`
    });

    for (let i = 0; i < n; i++) {
      const coin = coins[i];

      steps.push({
        type: 'outer-loop',
        line: anchorMap?.outer_loop || 4,
        i: 0,
        j: 0,
        dp1d: [...dp],
        currentI: i,
        tag: `考察面值 coin = ${coin}`,
        log: `| 🔄 外层循环: 考察硬币面值 ${coin}（先物品后容量，确保组合唯一）`,
        msg: `外层遍历硬币：当前面值 <code>coin = ${coin}</code>。`
      });

      for (let j = coin; j <= amount; j++) {
        const oldVal = dp[j];
        const addVal = dp[j - coin];
        dp[j] = oldVal + addVal;

        steps.push({
          type: stage === 4 ? 'update-1d' : 'update',
          line: anchorMap?.transfer || 6,
          i: 0,
          j,
          dp1d: [...dp],
          currentI: i,
          currentJ: j,
          srcSlots: [j - coin],
          highlightSlots: [j],
          tag: `dp[${j}] += dp[${j - coin}] (${addVal}) => ${dp[j]}`,
          log: `| ⚡ 累加组合数: dp[${j}] = ${oldVal} + ${addVal} = ${dp[j]}`,
          msg: `使用面值 <code>${coin}</code>：<code>dp[${j}] += dp[${j - coin}] (${addVal}) = <strong>${dp[j]}</strong></code> 种组合。`
        });
      }
    }

    steps.push({
      type: 'return',
      line: anchorMap?.return || 10,
      i: 0,
      j: amount,
      dp1d: [...dp],
      highlightSlots: [amount],
      tag: `总组合数: ${dp[amount]}`,
      log: `| 🏆 计算完成！凑成金额 ${amount} 的全部组合数为 ${dp[amount]}`,
      msg: `🏆 演化完成！凑齐金额 <code>${amount}</code> 的不同组合总数为 <strong>${dp[amount]}</strong> 种。`
    });

    return steps;
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

    const steps: UniversalStep[] = [];
    const INF = 999999;
    const dp = new Array(amount + 1).fill(INF);
    dp[0] = 0;

    steps.push({
      type: 'init',
      line: anchorMap?.init || 2,
      i: 0,
      j: 0,
      dp1d: dp.map(v => (v === INF ? -1 : v)),
      highlightSlots: [0],
      tag: 'dp[0] = 0, 其余置 INF',
      log: `| 📋 初始化 dp 表，dp[0] = 0，其余填充无穷大（求最小值）`,
      msg: `初始化 <code>dp[0] = 0</code>，其余置为 $\infty$（表示尚未可达）。`
    });

    for (let i = 0; i < coins.length; i++) {
      const coin = coins[i];
      for (let j = coin; j <= amount; j++) {
        if (dp[j - coin] !== INF) {
          const oldVal = dp[j];
          dp[j] = Math.min(dp[j], dp[j - coin] + 1);

          steps.push({
            type: stage === 4 ? 'update-1d' : 'update',
            line: anchorMap?.transfer || 6,
            i: 0,
            j,
            dp1d: dp.map(v => (v === INF ? -1 : v)),
            currentI: i,
            currentJ: j,
            srcSlots: [j - coin],
            highlightSlots: [j],
            tag: `dp[${j}] = min(${oldVal === INF ? '∞' : oldVal}, ${dp[j - coin] + 1}) = ${dp[j]}`,
            log: `| ⚡ 取最少枚数: 使用硬币 ${coin}，dp[${j}] = min(${oldVal === INF ? '∞' : oldVal}, ${dp[j - coin] + 1}) = ${dp[j]}`,
            msg: `尝试面值 <code>${coin}</code>：<code>dp[${j}] = min(dp[${j}], dp[${j - coin}] + 1) = <strong>${dp[j]}</strong></code> 枚。`
          });
        }
      }
    }

    const finalAns = dp[amount] === INF ? -1 : dp[amount];
    steps.push({
      type: 'return',
      line: anchorMap?.return || 10,
      i: 0,
      j: amount,
      dp1d: dp.map(v => (v === INF ? -1 : v)),
      highlightSlots: [amount],
      tag: `最少硬币枚数: ${finalAns}`,
      log: `| 🏆 计算完成！凑齐金额 ${amount} 的最少硬币数为 ${finalAns}`,
      msg: `🏆 计算完成！凑齐金额 <code>${amount}</code> 所需的最少硬币枚数为 <strong>${finalAns}</strong>。`
    });

    return steps;
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
    const steps: UniversalStep[] = [];
    const INF = 999999;
    const dp = new Array(n + 1).fill(INF);
    dp[0] = 0;

    steps.push({
      type: 'init',
      line: anchorMap?.init || 2,
      i: 0,
      j: 0,
      dp1d: dp.map(v => (v === INF ? -1 : v)),
      highlightSlots: [0],
      tag: 'dp[0] = 0, 其余置 INF',
      log: `| 📋 初始化完全平方数 dp 表，n = ${n}`,
      msg: `初始化 <code>dp[0] = 0</code>，其余置为 $\infty$。每个完全平方数可无限选取。`
    });

    for (let i = 1; i * i <= n; i++) {
      const square = i * i;
      for (let j = square; j <= n; j++) {
        if (dp[j - square] !== INF) {
          const oldVal = dp[j];
          dp[j] = Math.min(dp[j], dp[j - square] + 1);

          steps.push({
            type: stage === 4 ? 'update-1d' : 'update',
            line: anchorMap?.transfer || 6,
            i: 0,
            j,
            dp1d: dp.map(v => (v === INF ? -1 : v)),
            currentI: i,
            currentJ: j,
            srcSlots: [j - square],
            highlightSlots: [j],
            tag: `选用平方数 ${square}: dp[${j}] = ${dp[j]}`,
            log: `| ⚡ 尝试完全平方数 ${square} (${i}^2)，dp[${j}] = min(${oldVal === INF ? '∞' : oldVal}, ${dp[j - square] + 1}) = ${dp[j]}`,
            msg: `选用完全平方数 <code>${square} (${i}²)</code>：<code>dp[${j}] = min(dp[${j}], dp[${j - square}] + 1) = <strong>${dp[j]}</strong></code>。`
          });
        }
      }
    }

    steps.push({
      type: 'return',
      line: anchorMap?.return || 10,
      i: 0,
      j: n,
      dp1d: dp.map(v => (v === INF ? -1 : v)),
      highlightSlots: [n],
      tag: `最少完全平方数: ${dp[n]}`,
      log: `| 🏆 计算完成！和为 ${n} 的完全平方数的最少数量为 ${dp[n]}`,
      msg: `🏆 推导完成！凑成目标数 <code>${n}</code> 所需的最少完全平方数数量为 <strong>${dp[n]}</strong> 个。`
    });

    return steps;
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
    const strs: string[] = Array.isArray(rawStrs) ? rawStrs : String(rawStrs).split(',');
    const m = Number((model.defaultParams as any)?.m ?? 3); // 0 上限
    const n = Number((model.defaultParams as any)?.n ?? 3); // 1 上限

    const steps: UniversalStep[] = [];
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    steps.push({
      type: 'init',
      line: anchorMap?.init || 2,
      i: 0,
      j: 0,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: `创建 dp[${m + 1}][${n + 1}] 二维费用表`,
      log: `| 📋 初始化二维费用 DP 表：最多 ${m} 个 0，最多 ${n} 个 1`,
      msg: `初始化 <code>${m + 1} × ${n + 1}</code> 的状态表（0 的个数 $\le m$，1 的个数 $\le n$）。`
    });

    for (let sIdx = 0; sIdx < strs.length; sIdx++) {
      const str = strs[sIdx];
      let zeros = 0, ones = 0;
      for (const ch of str) {
        if (ch === '0') zeros++;
        else if (ch === '1') ones++;
      }

      for (let i = m; i >= zeros; i--) {
        for (let j = n; j >= ones; j--) {
          const oldVal = dp[i][j];
          dp[i][j] = Math.max(oldVal, dp[i - zeros][j - ones] + 1);

          steps.push({
            type: 'update',
            line: anchorMap?.transfer || 6,
            i,
            j,
            grid: JSON.parse(JSON.stringify(dp)),
            gridHighlight: { i, j },
            topI: i - zeros,
            topJ: j - ones,
            tag: `纳入 "${str}": dp[${i}][${j}] = ${dp[i][j]}`,
            log: `| ⚡ 考察字符串 "${str}" (0s=${zeros}, 1s=${ones})，dp[${i}][${j}] = max(${oldVal}, ${dp[i - zeros][j - ones]} + 1) = ${dp[i][j]}`,
            msg: `考虑选入 <code>"${str}" (0:${zeros}, 1:${ones})</code>：<code>dp[${i}][${j}] = max(dp[${i}][${j}], dp[${i - zeros}][${j - ones}] + 1) = <strong>${dp[i][j]}</strong></code>。`
          });
        }
      }
    }

    steps.push({
      type: 'return',
      line: anchorMap?.return || 10,
      i: m,
      j: n,
      grid: JSON.parse(JSON.stringify(dp)),
      gridHighlight: { i: m, j: n },
      tag: `最大子集大小: ${dp[m][n]}`,
      log: `| 🏆 计算完成！最大子集数量 = ${dp[m][n]}`,
      msg: `🏆 推导完成！在容量限制 <code>0 $\le$ ${m}, 1 $\le$ ${n}</code> 下的最大子集元素个数为 <strong>${dp[m][n]}</strong>。`
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
    const wordDict: string[] = Array.isArray(rawDict) ? rawDict : String(rawDict).split(',');
    const wordSet = new Set(wordDict);
    const len = s.length;

    const steps: UniversalStep[] = [];
    const dp = new Array(len + 1).fill(false);
    dp[0] = true;

    steps.push({
      type: 'init',
      line: anchorMap?.init || 2,
      i: 0,
      j: 0,
      dp1d: dp.map(v => (v ? 1 : 0)),
      highlightSlots: [0],
      tag: 'dp[0] = true (空串可拆分)',
      log: `| 📋 初始化 dp 表，字符串 s = "${s}"，词典 = [${wordDict.join(', ')}]`,
      msg: `初始化 <code>dp[0] = true</code>（空字符串默认可被合法拆分）。`
    });

    for (let i = 1; i <= len; i++) {
      for (let j = 0; j < i; j++) {
        const sub = s.substring(j, i);
        if (dp[j] && wordSet.has(sub)) {
          dp[i] = true;
          steps.push({
            type: stage === 4 ? 'update-1d' : 'update',
            line: anchorMap?.transfer || 6,
            i: 0,
            j: i,
            dp1d: dp.map(v => (v ? 1 : 0)),
            srcSlots: [j],
            highlightSlots: [i],
            tag: `前缀 [0..${i}] 拆出词 "${sub}" = true`,
            log: `| ⚡ 匹配成功: 子串 s[${j}..${i}] = "${sub}" 在词典中且 dp[${j}]=true，则 dp[${i}] = true`,
            msg: `前缀匹配：子串 <code>"${sub}"</code> 存在于词典中且前驱 <code>dp[${j}] = true</code>，推导出 <code>dp[${i}] = <strong>true</strong></code>。`
          });
          break;
        }
      }
    }

    const finalAns = dp[len];
    steps.push({
      type: 'return',
      line: anchorMap?.return || 10,
      i: 0,
      j: len,
      dp1d: dp.map(v => (v ? 1 : 0)),
      highlightSlots: [len],
      tag: `拆分结果: ${finalAns}`,
      log: `| 🏆 计算完成！字符串 "${s}" 是否能被拆分: ${finalAns}`,
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
    const n = weights.length;

    const steps: UniversalStep[] = [];
    const dp = new Array(bagWeight + 1).fill(0);

    steps.push({
      type: 'init',
      line: anchorMap?.init || 2,
      i: 0,
      j: 0,
      dp1d: [...dp],
      highlightSlots: [0],
      tag: `初始化多重背包 dp[0..${bagWeight}]`,
      log: `| 📋 初始化多重背包状态表：背包容量 bagWeight = ${bagWeight}`,
      msg: `初始化 <code>dp[0..${bagWeight}] = 0</code>。多重背包每种物品有独立件数上限。`
    });

    for (let i = 0; i < n; i++) {
      const w = weights[i];
      const v = values[i];
      const count = nums[i];

      steps.push({
        type: 'outer-loop',
        line: anchorMap?.outer_loop || 4,
        i: 0,
        j: 0,
        dp1d: [...dp],
        currentI: i,
        tag: `考察物品 ${i} (重=${w}, 价=${v}, 上限=${count}件)`,
        log: `| 🔄 考察物品 ${i}：重量 ${w}，价值 ${v}，数量上限 ${count} 件`,
        msg: `外层循环：考察物品 <code>[重量 ${w}, 价值 ${v}, 上限 ${count} 件]</code>。`
      });

      for (let j = bagWeight; j >= w; j--) {
        for (let k = 1; k <= count && j >= k * w; k++) {
          const oldVal = dp[j];
          const candidate = dp[j - k * w] + k * v;
          if (candidate > oldVal) {
            dp[j] = candidate;
            steps.push({
              type: stage === 4 ? 'update-1d' : 'update',
              line: anchorMap?.transfer || 6,
              i: 0,
              j,
              dp1d: [...dp],
              currentI: i,
              currentJ: j,
              srcSlots: [j - k * w],
              highlightSlots: [j],
              tag: `选入 ${k} 件: dp[${j}] = max(${oldVal}, dp[${j - k * w}] + ${k * v}) = ${dp[j]}`,
              log: `| ⚡ 选入 ${k} 件物品 ${i}，dp[${j}] 更新为 ${dp[j]}`,
              msg: `选入 <code>${k}</code> 件物品 <code>${i}</code>：<code>dp[${j}] = <strong>${dp[j]}</strong></code>。`
            });
          }
        }
      }
    }

    steps.push({
      type: 'return',
      line: anchorMap?.return || 10,
      i: 0,
      j: bagWeight,
      dp1d: [...dp],
      highlightSlots: [bagWeight],
      tag: `多重背包最大价值: ${dp[bagWeight]}`,
      log: `| 🏆 计算完成！容量 ${bagWeight} 下的最大总价值为 ${dp[bagWeight]}`,
      msg: `🏆 推导完成！多重背包在容量 <code>${bagWeight}</code> 下的最大总价值为 <strong>${dp[bagWeight]}</strong>。`
    });

    return steps;
  }
}
