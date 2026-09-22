import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { cloneTree, build1DDPDependencyTree, findNodeIdByCoord } from './strategy-helpers';

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
      (this.modelId === 'best-time-to-buy-and-sell-stock-ii' && (modelId === 'stock-2' || modelId === 'stock-ii' || modelId === 'best-time-stock')) ||
      (this.modelId === 'best-time-to-buy-and-sell-stock-iii' && (modelId === 'stock-3' || modelId === 'stock-iii')) ||
      (this.modelId === 'best-time-to-buy-and-sell-stock-iv' && (modelId === 'stock-4' || modelId === 'stock-iv')) ||
      (this.modelId === 'best-time-to-buy-and-sell-stock-with-cooldown' && modelId === 'stock-cooldown') ||
      (this.modelId === 'best-time-to-buy-and-sell-stock-with-transaction-fee' && (modelId === 'stock-fee' || modelId === 'stock-with-fee'))
    );
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, isMemo, anchorMap } = params;
    const rawPrices = (model.defaultParams as any)?.prices || [7, 1, 5, 3, 6, 4];
    const prices: number[] = Array.isArray(rawPrices) ? rawPrices.map(Number) : String(rawPrices).split(',').map(Number);

    switch (this.modelId) {
      case 'best-time-to-buy-and-sell-stock-ii':
        return this.compileStockII(prices, stage, Boolean(isMemo), anchorMap);
      case 'best-time-to-buy-and-sell-stock-iii':
        return this.compileStockIII(prices, stage, Boolean(isMemo), anchorMap);
      case 'best-time-to-buy-and-sell-stock-iv':
        return this.compileStockIV(prices, stage, Number((model.defaultParams as any)?.k ?? 2), anchorMap);
      case 'best-time-to-buy-and-sell-stock-with-cooldown':
        return this.compileStockCooldown(prices, stage, anchorMap);
      case 'best-time-to-buy-and-sell-stock-with-transaction-fee':
        return this.compileStockFee(prices, stage, Number((model.defaultParams as any)?.fee ?? 2), anchorMap);
      case 'best-time-to-buy-and-sell-stock':
      default:
        return this.compileStockI(prices, stage, Boolean(isMemo), anchorMap);
    }
  }

  // =========================================================================
  // 1. 股票 I: 单次买卖 (LC 121)
  // =========================================================================
  private compileStockI(
    prices: number[],
    stage: number,
    isMemo: boolean,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const n = prices.length;
    const steps: UniversalStep[] = [];

    // Stage 1 & 2: 递归决策树与记忆化搜索
    if (stage === 1 || stage === 2) {
      let nodeIdCounter = 0;
      const rootNode: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: 0,
        c: 0,
        val: 'dfs(day=0,未持股)',
        status: 'current',
        children: []
      };

      steps.push({
        type: 'init',
        line: anchorMap?.entry || 2,
        i: 0,
        j: 0,
        grid: [[...prices]],
        memo: new Array(n).fill(0),
        dp1d: new Array(n).fill(0),
        activeSlot: 0,
        highlightSlots: [0],
        tag: '股票 I 决策树入口',
        log: `| 📋 启动递归: prices=[${prices.join(', ')}], status=0(未持股)`,
        msg: `启动单次买卖决策：从第 0 天开始，初始状态为 <strong>未持股 (status=0)</strong>。`,
        activeNodeId: rootNode.id,
        treeRoot: cloneTree(rootNode),
      });

      const memo: Record<string, number> = {};

      function dfs(day: number, status: number, parentNode: UniversalTreeNode): number {
        const stateKey = `${day},${status}`;
        const node: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: day,
          c: status,
          val: `dfs(${day}, ${status === 1 ? '持股' : '空仓'})`,
          status: 'current',
          children: []
        };
        parentNode.children.push(node);

        steps.push({
          type: 'dfs-call',
          line: anchorMap?.recursion || 6,
          i: day,
          j: status,
          activeSlot: day < n ? day : n - 1,
          highlightSlots: [day < n ? day : n - 1],
          tag: `Day ${day} ${status === 1 ? '持有' : '未持'}`,
          log: `| ➡️ dfs(day=${day}, status=${status}) (价格 ${day < n ? prices[day] : '越界'})`,
          msg: `进入递归：第 <code>${day}</code> 天，状态为 <code>${status === 1 ? '持股' : '未持有'}</code>。`,
          activeNodeId: node.id,
          treeRoot: cloneTree(rootNode),
          dp1d: prices.map((_, k) => (memo[`${k},1`] ?? 0))
        });

        if (day >= n) {
          node.status = 'base';
          node.tag = '= 0';
          steps.push({
            type: 'boundary',
            line: anchorMap?.boundary || 7,
            i: day,
            j: status,
            activeSlot: n - 1,
            highlightSlots: [n - 1],
            tag: '天数越界: 返回 0',
            log: `| if (day == prices.length) 越界基底返回 0`,
            msg: `天数耗尽（已越界），无法再产生收益，返回 <code>0</code>。`,
            activeNodeId: node.id,
            treeRoot: cloneTree(rootNode),
          });
          return 0;
        }

        if (isMemo && memo[stateKey] !== undefined) {
          node.status = 'visited';
          node.tag = `⚡=${memo[stateKey]}`;
          steps.push({
            type: 'memo-hit',
            line: anchorMap?.memo || anchorMap?.cache_hit || 8,
            i: day,
            j: status,
            activeSlot: day,
            highlightSlots: [day],
            tag: `缓存命中 memo[${day}][${status}]=${memo[stateKey]}`,
            log: `| ⚡ 命中缓存 memo[${day}][${status}] = ${memo[stateKey]}，剪枝返回`,
            msg: `缓存命中：第 <code>${day}</code> 天已计算过，直接返回 <code>${memo[stateKey]}</code>。`,
            activeNodeId: node.id,
            treeRoot: cloneTree(rootNode),
            dp1d: prices.map((_, k) => (memo[`${k},1`] ?? 0))
          });
          return memo[stateKey];
        }

        let res = 0;
        if (status === 0) {
          // 未持股：观望 vs 买入
          const keep = dfs(day + 1, 0, node);
          const buy = -prices[day] + dfs(day + 1, 1, node);
          res = Math.max(keep, buy);
        } else {
          // 持股：观望 vs 卖出（单次买卖卖出后不能再买，未来收益为 0）
          const keep = dfs(day + 1, 1, node);
          const sell = prices[day];
          res = Math.max(keep, sell);
        }

        if (isMemo) memo[stateKey] = res;
        node.status = 'visited';
        node.val = `dfs(${day},${status})=${res}`;

        steps.push({
          type: 'dfs-return',
          line: anchorMap?.combine || 11,
          i: day,
          j: status,
          activeSlot: day,
          highlightSlots: [day],
          tag: `Day ${day} 决策最优: ${res}`,
          log: `| ↩️ Day ${day} (status=${status}) 归纳最优收益 = ${res}`,
          msg: `第 <code>${day}</code> 天（${status === 1 ? '持股' : '未持'}）决策完毕：最大收益为 <strong>${res}</strong>。`,
          activeNodeId: node.id,
          treeRoot: cloneTree(rootNode),
          dp1d: prices.map((_, k) => (memo[`${k},1`] ?? 0))
        });

        return res;
      }

      const finalAns = dfs(0, 0, rootNode);

      steps.push({
        type: 'return',
        line: anchorMap?.return || 3,
        i: 0,
        j: 0,
        grid: [[...prices]],
        memo: new Array(n).fill(finalAns),
        dp1d: new Array(n).fill(finalAns),
        activeSlot: 0,
        highlightSlots: [0],
        tag: `全局单次买卖最大收益: ${finalAns}`,
        log: `| 🏆 单次买卖递归演化推导完成！最大利润 = ${finalAns}`,
        msg: `🏆 全局推导完成！单次买卖最大利润为 <strong>${finalAns}</strong>。`,
        activeNodeId: rootNode.id,
        treeRoot: cloneTree(rootNode),
      });

      return steps;
    }

    // Stage 3 & 4: 二维填表与空间压缩
    const dp: number[][] = Array.from({ length: n }, () => [0, 0]);
    dp[0][0] = -prices[0];
    dp[0][1] = 0;
    const dailyProfit: (number | null)[] = new Array(n).fill(null);

    steps.push({
      type: 'init',
      line: anchorMap?.init || 3,
      i: 0,
      j: 0,
      grid: [[...dailyProfit]],
      memo: [...dailyProfit],
      dp1d: [...dailyProfit],
      activeSlot: 0,
      highlightSlots: [0],
      tag: `初始化: Day 0 价格 ${prices[0]}`,
      log: `| 📋 初始化第 0 天：买入 dp[0][0]=-${prices[0]}，不持股 dp[0][1]=0`,
      msg: `初始化：第 0 天买入股票 <code>dp[0][0] = -${prices[0]}</code>，不持股利润 <code>dp[0][1] = 0</code>。`
    });

    dailyProfit[0] = 0;
    steps.push({
      type: 'init-val',
      line: anchorMap?.init_val || anchorMap?.init || 3,
      i: 0,
      j: 0,
      grid: [[...dailyProfit]],
      memo: [...dailyProfit],
      dp1d: [...dailyProfit],
      activeSlot: 0,
      highlightSlots: [0],
      tag: `Day 0 基础收益: 0`,
      log: `| 📋 记录第 0 天已实现利润为 0`,
      msg: `第 0 天未持股基础收益为 <code>0</code>。`
    });

    for (let i = 1; i < n; i++) {
      steps.push({
        type: 'loop',
        line: anchorMap?.loop || 6,
        i: 0,
        j: i,
        grid: [[...dailyProfit]],
        memo: [...dailyProfit],
        dp1d: [...dailyProfit],
        activeSlot: i,
        currentI: i,
        highlightSlots: [i],
        tag: `考察第 ${i} 天 (价格 ${prices[i]})`,
        log: `| 🔄 循环迭代: 准备决策第 ${i} 天股价 ${prices[i]}`,
        msg: `循环步进：考察第 <code>${i}</code> 天股价（<code>${prices[i]}</code>）。`
      });

      dp[i][0] = Math.max(dp[i - 1][0], -prices[i]);
      dp[i][1] = Math.max(dp[i - 1][1], dp[i - 1][0] + prices[i]);
      dailyProfit[i] = dp[i][1];

      steps.push({
        type: stage === 4 ? 'update-1d' : 'update',
        line: anchorMap?.transfer_hold || anchorMap?.transfer || 7,
        i: 0,
        j: i,
        grid: [[...dailyProfit]],
        memo: [...dailyProfit],
        dp1d: [...dailyProfit],
        activeSlot: i,
        currentI: i,
        highlightSlots: [i],
        tag: `Day ${i}: 持股=${dp[i][0]}, 利润=${dp[i][1]}`,
        log: `| ⚡ Day ${i}: 持股 max(${dp[i-1][0]}, -${prices[i]})=${dp[i][0]}，利润 max(${dp[i-1][1]}, ${dp[i-1][0]}+${prices[i]})=${dp[i][1]}`,
        msg: `第 <code>${i}</code> 天：持股成本 <code>${dp[i][0]}</code>，最大收益 <code>${dp[i][1]}</code>。`
      });
    }

    const finalAns = dp[n - 1][1];
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
      tag: `最大利润: ${finalAns}`,
      log: `| 🏆 推导完成！最大利润 = ${finalAns}`,
      msg: `🏆 演化计算完成！单次买卖最大利润为 <strong>${finalAns}</strong>。`
    });

    for (const step of steps) {
      step.treeRoot = build1DDPDependencyTree(n, 'best-time-to-buy-and-sell-stock', step.dp1d, step.activeSlot ?? step.j);
      step.activeNodeId = findNodeIdByCoord(step.treeRoot, 0, step.activeSlot ?? step.j);
    }

    return steps;
  }

  // =========================================================================
  // 2. 股票 II: 多次买卖 (LC 122)
  // =========================================================================
  private compileStockII(
    prices: number[],
    stage: number,
    isMemo: boolean,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const n = prices.length;
    const steps: UniversalStep[] = [];

    // Stage 1 & 2: 递归与记忆化
    if (stage === 1 || stage === 2) {
      let nodeIdCounter = 0;
      const rootNode: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: 0,
        c: 0,
        val: 'dfs(day=0,未持股)',
        status: 'current',
        children: []
      };

      steps.push({
        type: 'init',
        line: anchorMap?.entry || 2,
        i: 0,
        j: 0,
        grid: [[...prices]],
        memo: new Array(n).fill(0),
        dp1d: new Array(n).fill(0),
        activeSlot: 0,
        highlightSlots: [0],
        tag: '多次交易决策入口',
        log: `| 📋 启动多次买卖递归: prices=[${prices.join(', ')}]`,
        msg: `启动多次交易决策：允许任意次买卖复利累加。`,
        activeNodeId: rootNode.id,
        treeRoot: cloneTree(rootNode),
      });

      const memo: Record<string, number> = {};

      function dfs(day: number, status: number, parentNode: UniversalTreeNode): number {
        const stateKey = `${day},${status}`;
        const node: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: day,
          c: status,
          val: `dfs(${day}, ${status === 1 ? '持股' : '空仓'})`,
          status: 'current',
          children: []
        };
        parentNode.children.push(node);

        steps.push({
          type: 'dfs-call',
          line: anchorMap?.recursion || 6,
          i: day,
          j: status,
          activeSlot: day < n ? day : n - 1,
          highlightSlots: [day < n ? day : n - 1],
          tag: `Day ${day} ${status === 1 ? '持有' : '未持'}`,
          log: `| ➡️ dfs(day=${day}, status=${status}) (价格 ${day < n ? prices[day] : '越界'})`,
          msg: `进入递归：第 <code>${day}</code> 天，状态为 <code>${status === 1 ? '持股' : '未持有'}</code>。`,
          activeNodeId: node.id,
          treeRoot: cloneTree(rootNode),
          dp1d: prices.map((_, k) => (memo[`${k},1`] ?? 0))
        });

        if (day >= n) {
          node.status = 'base';
          node.tag = '= 0';
          steps.push({
            type: 'boundary',
            line: anchorMap?.boundary || 7,
            i: day,
            j: status,
            activeSlot: n - 1,
            highlightSlots: [n - 1],
            tag: '天数越界: 返回 0',
            log: `| if (day == prices.length) 越界基底返回 0`,
            msg: `天数耗尽，返回 <code>0</code>。`,
            activeNodeId: node.id,
            treeRoot: cloneTree(rootNode),
          });
          return 0;
        }

        if (isMemo && memo[stateKey] !== undefined) {
          node.status = 'visited';
          node.tag = `⚡=${memo[stateKey]}`;
          steps.push({
            type: 'memo-hit',
            line: anchorMap?.memo || anchorMap?.cache_hit || 8,
            i: day,
            j: status,
            activeSlot: day,
            highlightSlots: [day],
            tag: `缓存命中 memo[${day}][${status}]=${memo[stateKey]}`,
            log: `| ⚡ 命中缓存 memo[${day}][${status}] = ${memo[stateKey]}，剪枝返回`,
            msg: `缓存命中：第 <code>${day}</code> 天已计算过，直接返回 <code>${memo[stateKey]}</code>。`,
            activeNodeId: node.id,
            treeRoot: cloneTree(rootNode),
            dp1d: prices.map((_, k) => (memo[`${k},1`] ?? 0))
          });
          return memo[stateKey];
        }

        let res = 0;
        if (status === 0) {
          const keep = dfs(day + 1, 0, node);
          const buy = -prices[day] + dfs(day + 1, 1, node);
          res = Math.max(keep, buy);
        } else {
          const keep = dfs(day + 1, 1, node);
          const sell = prices[day] + dfs(day + 1, 0, node); // 多次买卖卖出后允许继续买
          res = Math.max(keep, sell);
        }

        if (isMemo) memo[stateKey] = res;
        node.status = 'visited';
        node.val = `dfs(${day},${status})=${res}`;

        steps.push({
          type: 'dfs-return',
          line: anchorMap?.combine || 11,
          i: day,
          j: status,
          activeSlot: day,
          highlightSlots: [day],
          tag: `Day ${day} 最优: ${res}`,
          log: `| ↩️ Day ${day} (status=${status}) 最优收益 = ${res}`,
          msg: `第 <code>${day}</code> 天决策完成：<code>max = <strong>${res}</strong></code>。`,
          activeNodeId: node.id,
          treeRoot: cloneTree(rootNode),
          dp1d: prices.map((_, k) => (memo[`${k},1`] ?? 0))
        });

        return res;
      }

      const finalAns = dfs(0, 0, rootNode);

      steps.push({
        type: 'return',
        line: anchorMap?.return || 3,
        i: 0,
        j: 0,
        grid: [[...prices]],
        memo: new Array(n).fill(finalAns),
        dp1d: new Array(n).fill(finalAns),
        activeSlot: 0,
        highlightSlots: [0],
        tag: `多次交易最大收益: ${finalAns}`,
        log: `| 🏆 多次交易递归推导完成！最大累积利润 = ${finalAns}`,
        msg: `🏆 多次交易全局推导完成！最大累积收益为 <strong>${finalAns}</strong>。`,
        activeNodeId: rootNode.id,
        treeRoot: cloneTree(rootNode),
      });

      return steps;
    }

    // Stage 3 & 4: 多次买卖填表与滚动优化
    const dp: number[][] = Array.from({ length: n }, () => [0, 0]);
    dp[0][0] = -prices[0];
    dp[0][1] = 0;
    const dailyProfit: (number | null)[] = new Array(n).fill(null);

    steps.push({
      type: 'init',
      line: anchorMap?.init || 3,
      i: 0,
      j: 0,
      grid: [[...dailyProfit]],
      memo: [...dailyProfit],
      dp1d: [...dailyProfit],
      activeSlot: 0,
      highlightSlots: [0],
      tag: `多次交易初始化 Day 0`,
      log: `| 📋 多次交易初始化：dp[0][0] = -${prices[0]}，dp[0][1] = 0`,
      msg: `初始化：第 0 天持股 <code>${dp[0][0]}</code>，未持股利润 <code>0</code>。`
    });

    dailyProfit[0] = 0;
    steps.push({
      type: 'init-val',
      line: anchorMap?.init_val || anchorMap?.init || 3,
      i: 0,
      j: 0,
      grid: [[...dailyProfit]],
      memo: [...dailyProfit],
      dp1d: [...dailyProfit],
      activeSlot: 0,
      highlightSlots: [0],
      tag: `Day 0 初始收益: 0`,
      log: `| 📋 记录第 0 天已实现利润为 0`,
      msg: `第 0 天未持股初始收益为 <code>0</code>。`
    });

    for (let i = 1; i < n; i++) {
      steps.push({
        type: 'loop',
        line: anchorMap?.loop || 6,
        i: 0,
        j: i,
        grid: [[...dailyProfit]],
        memo: [...dailyProfit],
        dp1d: [...dailyProfit],
        activeSlot: i,
        currentI: i,
        highlightSlots: [i],
        tag: `考察第 ${i} 天 (价格 ${prices[i]})`,
        log: `| 🔄 循环迭代: 准备决策第 ${i} 天价格 ${prices[i]}`,
        msg: `循环步进：考察第 <code>${i}</code> 天股价（<code>${prices[i]}</code>）。`
      });

      dp[i][0] = Math.max(dp[i - 1][0], dp[i - 1][1] - prices[i]);
      dp[i][1] = Math.max(dp[i - 1][1], dp[i - 1][0] + prices[i]);
      dailyProfit[i] = dp[i][1];

      steps.push({
        type: stage === 4 ? 'update-1d' : 'update',
        line: anchorMap?.transfer_hold || anchorMap?.transfer || 7,
        i: 0,
        j: i,
        grid: [[...dailyProfit]],
        memo: [...dailyProfit],
        dp1d: [...dailyProfit],
        activeSlot: i,
        currentI: i,
        highlightSlots: [i],
        tag: `Day ${i}: 持股=${dp[i][0]}, 累计利润=${dp[i][1]}`,
        log: `| ⚡ Day ${i} (价格 ${prices[i]}): 持股=${dp[i][0]}, 累计利润=${dp[i][1]}`,
        msg: `第 <code>${i}</code> 天：买入复利 <code>dp[i][0] = ${dp[i][0]}</code>，累计利润 <code>${dp[i][1]}</code>。`
      });
    }

    const finalAns = dp[n - 1][1];
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
      tag: `多次交易最大利润: ${finalAns}`,
      log: `| 🏆 多次交易推导完成！最大利润 = ${finalAns}`,
      msg: `🏆 演化计算完成！多次买卖最大累积利润为 <strong>${finalAns}</strong>。`
    });

    for (const step of steps) {
      step.treeRoot = build1DDPDependencyTree(n, 'best-time-to-buy-and-sell-stock-ii', step.dp1d, step.activeSlot ?? step.j);
      step.activeNodeId = findNodeIdByCoord(step.treeRoot, 0, step.activeSlot ?? step.j);
    }

    return steps;
  }

  // =========================================================================
  // 3. 股票 III: 最多 2 次交易 (LC 123)
  // =========================================================================
  private compileStockIII(
    prices: number[],
    stage: number,
    isMemo: boolean,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const n = prices.length;
    const steps: UniversalStep[] = [];

    // Stage 1 & 2: 递归与记忆化
    if (stage === 1 || stage === 2) {
      let nodeIdCounter = 0;
      const rootNode: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: 0,
        c: 0,
        val: 'dfs(day=0,交易=0,空仓)',
        status: 'current',
        children: []
      };

      steps.push({
        type: 'init',
        line: anchorMap?.entry || 2,
        i: 0,
        j: 0,
        grid: [[...prices]],
        memo: new Array(n).fill(0),
        dp1d: new Array(n).fill(0),
        activeSlot: 0,
        highlightSlots: [0],
        tag: '最多2次交易决策树入口',
        log: `| 📋 启动两笔交易状态机递归: prices=[${prices.join(', ')}]`,
        msg: `启动最多 2 笔交易决策状态机。`,
        activeNodeId: rootNode.id,
        treeRoot: cloneTree(rootNode),
      });

      const memo: Record<string, number> = {};

      function dfs(day: number, count: number, hold: number, parentNode: UniversalTreeNode): number {
        const stateKey = `${day},${count},${hold}`;
        const node: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: day,
          c: count * 2 + hold,
          val: `dfs(${day},交易${count},${hold === 1 ? '持股' : '空仓'})`,
          status: 'current',
          children: []
        };
        parentNode.children.push(node);

        steps.push({
          type: 'dfs-call',
          line: anchorMap?.recursion || 6,
          i: day,
          j: count * 2 + hold,
          activeSlot: day < n ? day : n - 1,
          highlightSlots: [day < n ? day : n - 1],
          tag: `Day ${day} 交易#${count} ${hold === 1 ? '持股' : '空仓'}`,
          log: `| ➡️ dfs(day=${day}, count=${count}, hold=${hold})`,
          msg: `进入递归：第 <code>${day}</code> 天，已完成交易 <code>${count}</code> 笔，<code>${hold === 1 ? '持股' : '空仓'}</code>。`,
          activeNodeId: node.id,
          treeRoot: cloneTree(rootNode),
          dp1d: prices.map((_, k) => (memo[`${k},${count},${hold}`] ?? 0))
        });

        if (day >= n || count === 2) {
          node.status = 'base';
          node.tag = '= 0';
          steps.push({
            type: 'boundary',
            line: anchorMap?.boundary || 7,
            i: day,
            j: count * 2 + hold,
            activeSlot: n - 1,
            highlightSlots: [n - 1],
            tag: count === 2 ? '达到最大2笔交易限制' : '天数越界',
            log: `| 边界触发：${count === 2 ? '达到2次交易上限' : '天数耗尽'}，返回 0`,
            msg: `${count === 2 ? '已完成 2 笔交易上限' : '天数耗尽'}，返回 <code>0</code>。`,
            activeNodeId: node.id,
            treeRoot: cloneTree(rootNode),
          });
          return 0;
        }

        if (isMemo && memo[stateKey] !== undefined) {
          node.status = 'visited';
          node.tag = `⚡=${memo[stateKey]}`;
          steps.push({
            type: 'memo-hit',
            line: anchorMap?.memo || anchorMap?.cache_hit || 8,
            i: day,
            j: count * 2 + hold,
            activeSlot: day,
            highlightSlots: [day],
            tag: `缓存命中 memo=${memo[stateKey]}`,
            log: `| ⚡ 命中三维缓存 memo[${day}][${count}][${hold}] = ${memo[stateKey]}`,
            msg: `缓存命中：该状态最大收益为 <code>${memo[stateKey]}</code>。`,
            activeNodeId: node.id,
            treeRoot: cloneTree(rootNode),
            dp1d: prices.map((_, k) => (memo[`${k},${count},${hold}`] ?? 0))
          });
          return memo[stateKey];
        }

        const keep = dfs(day + 1, count, hold, node);
        let action = 0;
        if (hold === 0) {
          action = -prices[day] + dfs(day + 1, count, 1, node);
        } else {
          action = prices[day] + dfs(day + 1, count + 1, 0, node);
        }

        const res = Math.max(keep, action);
        if (isMemo) memo[stateKey] = res;
        node.status = 'visited';
        node.val = `dfs=${res}`;

        steps.push({
          type: 'dfs-return',
          line: anchorMap?.combine || 11,
          i: day,
          j: count * 2 + hold,
          activeSlot: day,
          highlightSlots: [day],
          tag: `Day ${day} 最优: ${res}`,
          log: `| ↩️ Day ${day} (count=${count}, hold=${hold}) 最优 = ${res}`,
          msg: `第 <code>${day}</code> 天决策归纳：<code>max = <strong>${res}</strong></code>。`,
          activeNodeId: node.id,
          treeRoot: cloneTree(rootNode),
          dp1d: prices.map((_, k) => (memo[`${k},${count},${hold}`] ?? 0))
        });

        return res;
      }

      const finalAns = dfs(0, 0, 0, rootNode);

      steps.push({
        type: 'return',
        line: anchorMap?.return || 3,
        i: 0,
        j: 0,
        grid: [[...prices]],
        memo: new Array(n).fill(finalAns),
        dp1d: new Array(n).fill(finalAns),
        activeSlot: 0,
        highlightSlots: [0],
        tag: `最多2笔交易最大收益: ${finalAns}`,
        log: `| 🏆 最多两笔买卖递归计算完成！最大收益 = ${finalAns}`,
        msg: `🏆 全局推导完成！最多 2 笔交易的最大利润为 <strong>${finalAns}</strong>。`,
        activeNodeId: rootNode.id,
        treeRoot: cloneTree(rootNode),
      });

      return steps;
    }

    // Stage 3 & 4: 5 状态机填表
    const dp = [-prices[0], 0, -prices[0], 0];
    const dailyProfit: (number | null)[] = new Array(n).fill(null);

    steps.push({
      type: 'init',
      line: anchorMap?.init || 3,
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

    dailyProfit[0] = 0;
    steps.push({
      type: 'init-val',
      line: anchorMap?.init_val || anchorMap?.init || 3,
      i: 0,
      j: 0,
      grid: [[...dailyProfit]],
      memo: [...dailyProfit],
      dp1d: [...dailyProfit],
      activeSlot: 0,
      highlightSlots: [0],
      tag: 'Day 0 收益: 0',
      log: '| 📋 第 0 天卖出收益初始化为 0',
      msg: '第 0 天卖出收益为 <code>0</code>。'
    });

    for (let i = 1; i < n; i++) {
      const p = prices[i];

      steps.push({
        type: 'loop',
        line: anchorMap?.loop || 6,
        i: 0,
        j: i,
        grid: [[...dailyProfit]],
        memo: [...dailyProfit],
        dp1d: [...dailyProfit],
        activeSlot: i,
        currentI: i,
        highlightSlots: [i],
        tag: `考察第 ${i} 天 (价格 ${p})`,
        log: `| 🔄 循环迭代: 准备决策第 ${i} 天股价 ${p}`,
        msg: `循环步进：考察第 <code>${i}</code> 天股价（<code>${p}</code>）。`
      });

      dp[0] = Math.max(dp[0], -p);
      dp[1] = Math.max(dp[1], dp[0] + p);
      dp[2] = Math.max(dp[2], dp[1] - p);
      dp[3] = Math.max(dp[3], dp[2] + p);
      dailyProfit[i] = dp[3];

      steps.push({
        type: stage === 4 ? 'update-1d' : 'update',
        line: anchorMap?.transfer || 7,
        i: 0,
        j: i,
        grid: [[...dailyProfit]],
        memo: [...dailyProfit],
        dp1d: [...dailyProfit],
        activeSlot: i,
        currentI: i,
        highlightSlots: [i],
        tag: `Day ${i} (p=${p}): 卖2利润=${dp[3]}`,
        log: `| ⚡ Day ${i} (价格 ${p}): 买1=${dp[0]}, 卖1=${dp[1]}, 买2=${dp[2]}, 卖2=${dp[3]}`,
        msg: `第 <code>${i}</code> 天（价格 ${p}）：二次交易最终利润 <code>dp[3] = <strong>${dp[3]}</strong></code>。`
      });
    }

    const finalAns = dp[3];
    steps.push({
      type: 'return',
      line: anchorMap?.return || 11,
      i: 0,
      j: n - 1,
      grid: [[...dailyProfit]],
      memo: [...dailyProfit],
      dp1d: [...dailyProfit],
      activeSlot: n - 1,
      highlightSlots: [n - 1],
      tag: `最多2次交易最大利润: ${finalAns}`,
      log: `| 🏆 计算完成！最多两次买卖最大收益 = ${finalAns}`,
      msg: `🏆 演化计算完成！最多两次买卖的最大收益为 <strong>${finalAns}</strong>。`
    });

    for (const step of steps) {
      step.treeRoot = build1DDPDependencyTree(n, 'best-time-to-buy-and-sell-stock-iii', step.dp1d, step.activeSlot ?? step.j);
      step.activeNodeId = findNodeIdByCoord(step.treeRoot, 0, step.activeSlot ?? step.j);
    }

    return steps;
  }

  // =========================================================================
  // 4. 股票 IV: 最多 K 次交易
  // =========================================================================
  private compileStockIV(prices: number[], stage: number, k: number, anchorMap?: Record<string, number>): UniversalStep[] {
    const n = prices.length;
    const steps: UniversalStep[] = [];
    const dp = new Array(2 * k).fill(0);
    for (let i = 0; i < 2 * k; i += 2) {
      dp[i] = -prices[0];
    }
    const dailyProfit: (number | null)[] = new Array(n).fill(null);

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

    dailyProfit[0] = 0;
    steps.push({
      type: 'init-val',
      line: anchorMap?.init_val || anchorMap?.init || 2,
      i: 0,
      j: 0,
      grid: [[...dailyProfit]],
      memo: [...dailyProfit],
      dp1d: [...dailyProfit],
      activeSlot: 0,
      highlightSlots: [0],
      tag: 'Day 0 初始收益: 0',
      log: '| 📋 第 0 天卖出收益初始化为 0',
      msg: '第 0 天卖出收益为 <code>0</code>。'
    });

    for (let i = 1; i < n; i++) {
      const p = prices[i];

      steps.push({
        type: 'loop',
        line: anchorMap?.loop || 5,
        i: 0,
        j: i,
        grid: [[...dailyProfit]],
        memo: [...dailyProfit],
        dp1d: [...dailyProfit],
        activeSlot: i,
        currentI: i,
        highlightSlots: [i],
        tag: `考察第 ${i} 天 (价格 ${p})`,
        log: `| 🔄 循环迭代: 准备决策第 ${i} 天价格 ${p}`,
        msg: `循环步进：考察第 <code>${i}</code> 天股价（<code>${p}</code>）。`
      });

      dp[0] = Math.max(dp[0], -p);
      dp[1] = Math.max(dp[1], dp[0] + p);
      for (let j = 2; j < 2 * k; j += 2) {
        dp[j] = Math.max(dp[j], dp[j - 1] - p);
        dp[j + 1] = Math.max(dp[j + 1], dp[j] + p);
      }
      dailyProfit[i] = dp[2 * k - 1];

      steps.push({
        type: stage === 4 ? 'update-1d' : 'update',
        line: anchorMap?.transfer || 6,
        i: 0,
        j: i,
        grid: [[...dailyProfit]],
        memo: [...dailyProfit],
        dp1d: [...dailyProfit],
        activeSlot: i,
        currentI: i,
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

  // =========================================================================
  // 5. 含冷冻期 (LC 309)
  // =========================================================================
  private compileStockCooldown(prices: number[], stage: number, anchorMap?: Record<string, number>): UniversalStep[] {
    const n = prices.length;
    const steps: UniversalStep[] = [];
    let s0 = -prices[0], s1 = 0, s2 = 0;
    const dailyProfit: (number | null)[] = new Array(n).fill(null);

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

    dailyProfit[0] = 0;
    steps.push({
      type: 'init-val',
      line: anchorMap?.init_val || anchorMap?.init || 2,
      i: 0,
      j: 0,
      grid: [[...dailyProfit]],
      memo: [...dailyProfit],
      dp1d: [...dailyProfit],
      activeSlot: 0,
      highlightSlots: [0],
      tag: 'Day 0 收益: 0',
      log: '| 📋 第 0 天卖出收益初始化为 0',
      msg: '第 0 天初始收益为 <code>0</code>。'
    });

    for (let i = 1; i < n; i++) {
      const p = prices[i];

      steps.push({
        type: 'loop',
        line: anchorMap?.loop || 5,
        i: 0,
        j: i,
        grid: [[...dailyProfit]],
        memo: [...dailyProfit],
        dp1d: [...dailyProfit],
        activeSlot: i,
        currentI: i,
        highlightSlots: [i],
        tag: `考察第 ${i} 天 (价格 ${p})`,
        log: `| 🔄 循环迭代: 准备决策第 ${i} 天价格 ${p}`,
        msg: `循环步进：考察第 <code>${i}</code> 天股价（<code>${p}</code>）。`
      });

      const next0 = Math.max(s0, s1 - p);
      const next1 = Math.max(s1, s2);
      const next2 = s0 + p;
      s0 = next0; s1 = next1; s2 = next2;
      dailyProfit[i] = Math.max(s1, s2);

      steps.push({
        type: stage === 4 ? 'update-1d' : 'update',
        line: anchorMap?.transfer || 6,
        i: 0,
        j: i,
        grid: [[...dailyProfit]],
        memo: [...dailyProfit],
        dp1d: [...dailyProfit],
        activeSlot: i,
        currentI: i,
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

  // =========================================================================
  // 6. 含手续费 (LC 714)
  // =========================================================================
  private compileStockFee(prices: number[], stage: number, fee: number, anchorMap?: Record<string, number>): UniversalStep[] {
    const n = prices.length;
    const steps: UniversalStep[] = [];
    let hold = -prices[0];
    let sold = 0;
    const dailyProfit: (number | null)[] = new Array(n).fill(null);

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

    dailyProfit[0] = 0;
    steps.push({
      type: 'init-val',
      line: anchorMap?.init_val || anchorMap?.init || 2,
      i: 0,
      j: 0,
      grid: [[...dailyProfit]],
      memo: [...dailyProfit],
      dp1d: [...dailyProfit],
      activeSlot: 0,
      highlightSlots: [0],
      tag: 'Day 0 收益: 0',
      log: '| 📋 第 0 天净利润初始化为 0',
      msg: '第 0 天净收益为 <code>0</code>。'
    });

    for (let i = 1; i < n; i++) {
      const p = prices[i];

      steps.push({
        type: 'loop',
        line: anchorMap?.loop || 5,
        i: 0,
        j: i,
        grid: [[...dailyProfit]],
        memo: [...dailyProfit],
        dp1d: [...dailyProfit],
        activeSlot: i,
        currentI: i,
        highlightSlots: [i],
        tag: `考察第 ${i} 天 (价格 ${p})`,
        log: `| 🔄 循环迭代: 准备决策第 ${i} 天价格 ${p}`,
        msg: `循环步进：考察第 <code>${i}</code> 天股价（<code>${p}</code>）。`
      });

      hold = Math.max(hold, sold - p);
      sold = Math.max(sold, hold + p - fee);
      dailyProfit[i] = sold;

      steps.push({
        type: stage === 4 ? 'update-1d' : 'update',
        line: anchorMap?.transfer || 6,
        i: 0,
        j: i,
        grid: [[...dailyProfit]],
        memo: [...dailyProfit],
        dp1d: [...dailyProfit],
        activeSlot: i,
        currentI: i,
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
