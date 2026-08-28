import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';

export type StockModelId =
  | 'best-time-to-buy-and-sell-stock'
  | 'best-time-to-buy-and-sell-stock-ii'
  | 'best-time-to-buy-and-sell-stock-iii'
  | 'best-time-to-buy-and-sell-stock-iv'
  | 'best-time-to-buy-and-sell-stock-with-cooldown'
  | 'best-time-to-buy-and-sell-stock-with-transaction-fee';

/**
 * 买卖股票家族独立算法策略模块 (StockStrategy)
 * 覆盖全部 6 道经典股票买卖题型与状态机推演：
 * - 股票 I (LC 121): 单次买卖（持股 / 不持股）
 * - 股票 II (LC 122): 多次买卖贪心与 DP 演进
 * - 股票 III (LC 123): 最多 2 次交易（5 个状态）
 * - 股票 IV (LC 188): 最多 K 次交易（2k+1 个状态）
 * - 含冷冻期 (LC 309): 3 种状态（持股、保持卖出、冷冻期）
 * - 含手续费 (LC 714): 卖出扣费状态推导
 */
export class StockStrategy implements IAlgorithmStrategy {
  public readonly modelId: string;

  constructor(modelId: StockModelId | string = 'best-time-to-buy-and-sell-stock') {
    this.modelId = modelId;
  }

  public canHandle(modelId: string): boolean {
    return (
      modelId === this.modelId ||
      (this.modelId === 'best-time-to-buy-and-sell-stock' && (modelId === 'stock-1' || modelId === 'stock-i')) ||
      (this.modelId === 'best-time-to-buy-and-sell-stock-ii' && (modelId === 'stock-2' || modelId === 'stock-ii')) ||
      (this.modelId === 'best-time-to-buy-and-sell-stock-iii' && (modelId === 'stock-3' || modelId === 'stock-iii')) ||
      (this.modelId === 'best-time-to-buy-and-sell-stock-iv' && (modelId === 'stock-4' || modelId === 'stock-iv')) ||
      (this.modelId === 'best-time-to-buy-and-sell-stock-with-cooldown' && modelId === 'stock-cooldown') ||
      (this.modelId === 'best-time-to-buy-and-sell-stock-with-transaction-fee' && (modelId === 'stock-fee' || modelId === 'stock-with-fee'))
    );
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, anchorMap } = params;
    const rawPrices = (model.defaultParams as any)?.prices || [7, 1, 5, 3, 6, 4];
    const prices: number[] = Array.isArray(rawPrices) ? rawPrices.map(Number) : String(rawPrices).split(',').map(Number);

    switch (this.modelId) {
      case 'best-time-to-buy-and-sell-stock-ii':
        return this.compileStockII(prices, stage, anchorMap);
      case 'best-time-to-buy-and-sell-stock-iii':
        return this.compileStockIII(prices, stage, anchorMap);
      case 'best-time-to-buy-and-sell-stock-iv':
        return this.compileStockIV(prices, stage, Number((model.defaultParams as any)?.k ?? 2), anchorMap);
      case 'best-time-to-buy-and-sell-stock-with-cooldown':
        return this.compileStockCooldown(prices, stage, anchorMap);
      case 'best-time-to-buy-and-sell-stock-with-transaction-fee':
        return this.compileStockFee(prices, stage, Number((model.defaultParams as any)?.fee ?? 2), anchorMap);
      case 'best-time-to-buy-and-sell-stock':
      default:
        return this.compileStockI(prices, stage, anchorMap);
    }
  }

  // 1. 股票 I: 单次买卖
  private compileStockI(prices: number[], stage: number, anchorMap?: Record<string, number>): UniversalStep[] {
    const n = prices.length;
    const steps: UniversalStep[] = [];
    const dp: number[][] = Array.from({ length: n }, () => [0, 0]);
    dp[0][0] = -prices[0];
    dp[0][1] = 0;
    const dailyProfit = new Array(n).fill(0);

    steps.push({
      type: 'init',
      line: anchorMap?.init || 2,
      i: 0,
      j: 0,
      grid: [[...dailyProfit]],
      memo: [...dailyProfit],
      dp1d: [...dailyProfit],
      activeSlot: 0,
      highlightSlots: [0],
      tag: `Day 0: 买入=${dp[0][0]}, 利润=0`,
      log: `| 📋 初始化第 0 天：买入 price=${prices[0]}，dp[0][0]=-${prices[0]}，dp[0][1]=0`,
      msg: `初始化：第 0 天买入股票 <code>dp[0][0] = -${prices[0]}</code>，不持股利润 <code>dp[0][1] = 0</code>。`
    });

    for (let i = 1; i < n; i++) {
      dp[i][0] = Math.max(dp[i - 1][0], -prices[i]);
      dp[i][1] = Math.max(dp[i - 1][1], dp[i - 1][0] + prices[i]);
      dailyProfit[i] = dp[i][1];

      steps.push({
        type: stage === 4 ? 'update-1d' : 'update',
        line: anchorMap?.transfer || 6,
        i: 0,
        j: i,
        grid: [[...dailyProfit]],
        memo: [...dailyProfit],
        dp1d: [...dailyProfit],
        activeSlot: i,
        highlightSlots: [i],
        tag: `Day ${i} (价格 ${prices[i]}): 持有=${dp[i][0]}, 利润=${dp[i][1]}`,
        log: `| ⚡ Day ${i}: 持股 max(${dp[i-1][0]}, -${prices[i]})=${dp[i][0]}，利润 max(${dp[i-1][1]}, ${dp[i-1][0]}+${prices[i]})=${dp[i][1]}`,
        msg: `第 <code>${i}</code> 天（价格 ${prices[i]}）：持股成本 <code>${dp[i][0]}</code>，最大收益 <code>${dp[i][1]}</code>。`
      });
    }

    steps.push({
      type: 'return',
      line: anchorMap?.return || 10,
      i: 0,
      j: n - 1,
      grid: [[...dailyProfit]],
      memo: [...dailyProfit],
      dp1d: [...dailyProfit],
      activeSlot: n - 1,
      highlightSlots: [n - 1],
      tag: `最大利润: ${dp[n - 1][1]}`,
      log: `| 🏆 推导完成！最大利润 = ${dp[n - 1][1]}`,
      msg: `🏆 演化计算完成！单次买卖最大利润为 <strong>${dp[n - 1][1]}</strong>。`
    });

    return steps;
  }

  // 2. 股票 II: 多次买卖
  private compileStockII(prices: number[], stage: number, anchorMap?: Record<string, number>): UniversalStep[] {
    const n = prices.length;
    const steps: UniversalStep[] = [];
    const dp: number[][] = Array.from({ length: n }, () => [0, 0]);
    dp[0][0] = -prices[0];
    dp[0][1] = 0;
    const dailyProfit = new Array(n).fill(0);

    steps.push({
      type: 'init',
      line: anchorMap?.init || 2,
      i: 0,
      j: 0,
      grid: [[...dailyProfit]],
      memo: [...dailyProfit],
      dp1d: [...dailyProfit],
      activeSlot: 0,
      highlightSlots: [0],
      tag: `初始化 Day 0: 持有=${dp[0][0]}, 利润=0`,
      log: `| 📋 多次交易初始化：dp[0][0] = -${prices[0]}，dp[0][1] = 0`,
      msg: `初始化：多次交易允许复利累加。第 0 天持股 <code>${dp[0][0]}</code>，利润 <code>0</code>。`
    });

    for (let i = 1; i < n; i++) {
      dp[i][0] = Math.max(dp[i - 1][0], dp[i - 1][1] - prices[i]);
      dp[i][1] = Math.max(dp[i - 1][1], dp[i - 1][0] + prices[i]);
      dailyProfit[i] = dp[i][1];

      steps.push({
        type: stage === 4 ? 'update-1d' : 'update',
        line: anchorMap?.transfer || 6,
        i: 0,
        j: i,
        grid: [[...dailyProfit]],
        memo: [...dailyProfit],
        dp1d: [...dailyProfit],
        activeSlot: i,
        highlightSlots: [i],
        tag: `Day ${i}: 持股=${dp[i][0]}, 累计利润=${dp[i][1]}`,
        log: `| ⚡ Day ${i} (价格 ${prices[i]}): 持股=${dp[i][0]}, 累计利润=${dp[i][1]}`,
        msg: `第 <code>${i}</code> 天：买入复利 <code>dp[i][0] = ${dp[i][0]}</code>，累计利润 <code>${dp[i][1]}</code>。`
      });
    }

    steps.push({
      type: 'return',
      line: anchorMap?.return || 10,
      i: 0,
      j: n - 1,
      grid: [[...dailyProfit]],
      memo: [...dailyProfit],
      dp1d: [...dailyProfit],
      activeSlot: n - 1,
      highlightSlots: [n - 1],
      tag: `多次交易最大利润: ${dp[n - 1][1]}`,
      log: `| 🏆 多次交易推导完成！最大利润 = ${dp[n - 1][1]}`,
      msg: `🏆 演化计算完成！多次买卖最大累积利润为 <strong>${dp[n - 1][1]}</strong>。`
    });

    return steps;
  }

  // 3. 股票 III: 最多 2 次交易 (5 种状态)
  private compileStockIII(prices: number[], stage: number, anchorMap?: Record<string, number>): UniversalStep[] {
    const n = prices.length;
    const steps: UniversalStep[] = [];
    const dp = [-prices[0], 0, -prices[0], 0];
    const dailyProfit = new Array(n).fill(0);

    steps.push({
      type: 'init',
      line: anchorMap?.init || 2,
      i: 0,
      j: 0,
      grid: [[...dailyProfit]],
      memo: [...dailyProfit],
      dp1d: [...dailyProfit],
      activeSlot: 0,
      highlightSlots: [0],
      tag: '初始化 4 种买卖状态',
      log: '| 📋 股票 III (最多2次): 状态包含 [买1, 卖1, 买2, 卖2]',
      msg: `初始化 4 种状态：<code>[买1: -${prices[0]}, 卖1: 0, 买2: -${prices[0]}, 卖2: 0]</code>。`
    });

    for (let i = 1; i < n; i++) {
      const p = prices[i];
      dp[0] = Math.max(dp[0], -p);
      dp[1] = Math.max(dp[1], dp[0] + p);
      dp[2] = Math.max(dp[2], dp[1] - p);
      dp[3] = Math.max(dp[3], dp[2] + p);
      dailyProfit[i] = dp[3];

      steps.push({
        type: 'update',
        line: anchorMap?.transfer || 6,
        i: 0,
        j: i,
        grid: [[...dailyProfit]],
        memo: [...dailyProfit],
        dp1d: [...dailyProfit],
        activeSlot: i,
        highlightSlots: [i],
        tag: `Day ${i} (p=${p}): 卖2利润=${dp[3]}`,
        log: `| ⚡ Day ${i} (价格 ${p}): 买1=${dp[0]}, 卖1=${dp[1]}, 买2=${dp[2]}, 卖2=${dp[3]}`,
        msg: `第 <code>${i}</code> 天（价格 ${p}）：二次交易最终利润 <code>dp[3] = <strong>${dp[3]}</strong></code>。`
      });
    }

    steps.push({
      type: 'return',
      line: anchorMap?.return || 10,
      i: 0,
      j: n - 1,
      grid: [[...dailyProfit]],
      memo: [...dailyProfit],
      dp1d: [...dailyProfit],
      activeSlot: n - 1,
      highlightSlots: [n - 1],
      tag: `最多2次交易最大利润: ${dp[3]}`,
      log: `| 🏆 计算完成！最多两次买卖最大收益 = ${dp[3]}`,
      msg: `🏆 演化计算完成！最多两次买卖的最大收益为 <strong>${dp[3]}</strong>。`
    });

    return steps;
  }

  // 4. 股票 IV: 最多 K 次交易
  private compileStockIV(prices: number[], stage: number, k: number, anchorMap?: Record<string, number>): UniversalStep[] {
    const n = prices.length;
    const steps: UniversalStep[] = [];
    const dp = new Array(2 * k).fill(0);
    for (let i = 0; i < 2 * k; i += 2) {
      dp[i] = -prices[0];
    }
    const dailyProfit = new Array(n).fill(0);

    steps.push({
      type: 'init',
      line: anchorMap?.init || 2,
      i: 0,
      j: 0,
      grid: [[...dailyProfit]],
      memo: [...dailyProfit],
      dp1d: [...dailyProfit],
      activeSlot: 0,
      highlightSlots: [0],
      tag: `初始化 K=${k} 次交易状态`,
      log: `| 📋 股票 IV (最多 ${k} 次交易): 状态数组长度 ${2 * k}`,
      msg: `初始化 <code>${2 * k}</code> 种状态（奇数买入，偶数卖出）。`
    });

    for (let i = 1; i < n; i++) {
      const p = prices[i];
      dp[0] = Math.max(dp[0], -p);
      dp[1] = Math.max(dp[1], dp[0] + p);
      for (let j = 2; j < 2 * k; j += 2) {
        dp[j] = Math.max(dp[j], dp[j - 1] - p);
        dp[j + 1] = Math.max(dp[j + 1], dp[j] + p);
      }
      dailyProfit[i] = dp[2 * k - 1];

      steps.push({
        type: 'update',
        line: anchorMap?.transfer || 6,
        i: 0,
        j: i,
        grid: [[...dailyProfit]],
        memo: [...dailyProfit],
        dp1d: [...dailyProfit],
        activeSlot: i,
        highlightSlots: [i],
        tag: `Day ${i}: 第 ${k} 次卖出利润 = ${dp[2 * k - 1]}`,
        log: `| ⚡ Day ${i} (价格 ${p}): 第 ${k} 次交易最终收益 = ${dp[2 * k - 1]}`,
        msg: `第 <code>${i}</code> 天（价格 ${p}）：最多 ${k} 次交易的最大收益为 <code>dp[${2 * k - 1}] = <strong>${dp[2 * k - 1]}</strong></code>。`
      });
    }

    steps.push({
      type: 'return',
      line: anchorMap?.return || 10,
      i: 0,
      j: n - 1,
      grid: [[...dailyProfit]],
      memo: [...dailyProfit],
      dp1d: [...dailyProfit],
      activeSlot: n - 1,
      highlightSlots: [n - 1],
      tag: `K=${k} 次交易最大利润: ${dp[2 * k - 1]}`,
      log: `| 🏆 计算完成！最多 ${k} 次买卖最大利润 = ${dp[2 * k - 1]}`,
      msg: `🏆 演化计算完成！最多 <code>${k}</code> 次买卖的最大利润为 <strong>${dp[2 * k - 1]}</strong>。`
    });

    return steps;
  }

  // 5. 含冷冻期 (LC 309)
  private compileStockCooldown(prices: number[], stage: number, anchorMap?: Record<string, number>): UniversalStep[] {
    const n = prices.length;
    const steps: UniversalStep[] = [];
    // 0:持股, 1:保持卖出, 2:当天卖出(进入冷冻)
    let s0 = -prices[0], s1 = 0, s2 = 0;
    const dailyProfit = new Array(n).fill(0);

    steps.push({
      type: 'init',
      line: anchorMap?.init || 2,
      i: 0,
      j: 0,
      grid: [[...dailyProfit]],
      memo: [...dailyProfit],
      dp1d: [...dailyProfit],
      activeSlot: 0,
      highlightSlots: [0],
      tag: '初始化冷冻期 3 态状态机',
      log: '| 📋 含冷冻期: [0:持股, 1:保持卖出, 2:刚卖出冷冻]',
      msg: `初始化 3 状态：<code>[持股: -${prices[0]}, 保持卖出: 0, 刚卖出冷冻: 0]</code>。`
    });

    for (let i = 1; i < n; i++) {
      const p = prices[i];
      const next0 = Math.max(s0, s1 - p);
      const next1 = Math.max(s1, s2);
      const next2 = s0 + p;
      s0 = next0; s1 = next1; s2 = next2;
      dailyProfit[i] = Math.max(s1, s2);

      steps.push({
        type: 'update',
        line: anchorMap?.transfer || 6,
        i: 0,
        j: i,
        grid: [[...dailyProfit]],
        memo: [...dailyProfit],
        dp1d: [...dailyProfit],
        activeSlot: i,
        highlightSlots: [i],
        tag: `Day ${i} (p=${p}): 最大非持股收益 = ${dailyProfit[i]}`,
        log: `| ⚡ Day ${i} (价格 ${p}): 持股=${s0}, 保持卖出=${s1}, 刚卖出冷冻=${s2}`,
        msg: `第 <code>${i}</code> 天：持股 <code>${s0}</code>，保持卖出 <code>${s1}</code>，刚卖出冷冻 <code>${s2}</code>。`
      });
    }

    const finalAns = Math.max(s1, s2);
    steps.push({
      type: 'return',
      line: anchorMap?.return || 10,
      i: 0,
      j: n - 1,
      grid: [[...dailyProfit]],
      memo: [...dailyProfit],
      dp1d: [...dailyProfit],
      activeSlot: n - 1,
      highlightSlots: [n - 1],
      tag: `含冷冻期最大利润: ${finalAns}`,
      log: `| 🏆 计算完成！max(保持卖出:${s1}, 刚卖出:${s2}) = ${finalAns}`,
      msg: `🏆 演化推导完成！含冷冻期最大收益为 <strong>${finalAns}</strong>。`
    });

    return steps;
  }

  // 6. 含手续费 (LC 714)
  private compileStockFee(prices: number[], stage: number, fee: number, anchorMap?: Record<string, number>): UniversalStep[] {
    const n = prices.length;
    const steps: UniversalStep[] = [];
    let hold = -prices[0];
    let sold = 0;
    const dailyProfit = new Array(n).fill(0);

    steps.push({
      type: 'init',
      line: anchorMap?.init || 2,
      i: 0,
      j: 0,
      grid: [[...dailyProfit]],
      memo: [...dailyProfit],
      dp1d: [...dailyProfit],
      activeSlot: 0,
      highlightSlots: [0],
      tag: `初始化 (手续费 fee=${fee})`,
      log: `| 📋 含手续费买卖: hold = -${prices[0]}, sold = 0, fee = ${fee}`,
      msg: `初始化：每次卖出时扣除手续费 <code>fee = ${fee}</code>。`
    });

    for (let i = 1; i < n; i++) {
      const p = prices[i];
      hold = Math.max(hold, sold - p);
      sold = Math.max(sold, hold + p - fee);
      dailyProfit[i] = sold;

      steps.push({
        type: 'update',
        line: anchorMap?.transfer || 6,
        i: 0,
        j: i,
        grid: [[...dailyProfit]],
        memo: [...dailyProfit],
        dp1d: [...dailyProfit],
        activeSlot: i,
        highlightSlots: [i],
        tag: `Day ${i} (p=${p}): 净利润 sold = ${sold}`,
        log: `| ⚡ Day ${i} (价格 ${p}): hold = ${hold}, sold = max(sold, hold + ${p} - ${fee}) = ${sold}`,
        msg: `第 <code>${i}</code> 天（价格 ${p}）：扣除手续费后最大净利润 <code>sold = <strong>${sold}</strong></code>。`
      });
    }

    steps.push({
      type: 'return',
      line: anchorMap?.return || 10,
      i: 0,
      j: n - 1,
      grid: [[...dailyProfit]],
      memo: [...dailyProfit],
      dp1d: [...dailyProfit],
      activeSlot: n - 1,
      highlightSlots: [n - 1],
      tag: `扣费后最大利润: ${sold}`,
      log: `| 🏆 计算完成！扣除全部手续费后的最终最大利润 = ${sold}`,
      msg: `🏆 演化推导完成！扣除手续费后最大利润为 <strong>${sold}</strong>。`
    });

    return steps;
  }
}
