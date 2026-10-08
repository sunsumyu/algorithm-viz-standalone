import { StepBase } from '../../step-visualizer';
import type { HighlightTarget } from '../../step-visualizer';

export type StockPhase = 'init' | 'compare' | 'skip' | 'trade' | 'done';

export interface StockStep extends StepBase {
  prices: number[];
  currentIndex: number;
  totalProfit: number;
  transactionCount: number;
  lastBuyIdx: number;
  lastSellIdx: number;
  dailyDiff: number;
  tradeRanges: Array<[number, number]>;
  phase: StockPhase;
  message: string;
  log: string;
  decision?: string;
  codeLine: HighlightTarget;
  line?: number;
  metrics?: Record<string, string>;
}

export const BEST_TIME_STOCK_CODE_LINES: Record<string, HighlightTarget> = {
  guard: { java: 2, cpp: 4, python: 3, javascript: 2 },
  init: { java: 2, cpp: 4, python: 3, javascript: 2 },
  compare: { java: 3, cpp: 5, python: 4, javascript: 3 },
  trade: { java: 5, cpp: 6, python: 5, javascript: 4 },
  skip: { java: 5, cpp: 6, python: 5, javascript: 4 },
  done: { java: 7, cpp: 8, python: 6, javascript: 6 },
};

function getLine(target: HighlightTarget): number {
  if (typeof target === 'number') return target;
  if (typeof target === 'object' && target !== null && 'java' in target) {
    const j = (target as any).java;
    if (typeof j === 'number') return j;
    if (j && typeof j.primary === 'number') return j.primary;
  }
  return 1;
}

function withMetrics(steps: StockStep[]): StockStep[] {
  return steps.map((s) => {
    const isComparing = s.phase === 'compare' || s.phase === 'trade' || s.phase === 'skip';
    const curDiff = s.dailyDiff;

    let action = '🔍 比较相邻两日';
    if (s.phase === 'trade') action = '📈 锁定正收益 (买入并卖出)';
    else if (s.phase === 'skip') action = '📉 避开亏损 (放弃交易)';
    else if (s.phase === 'done') action = '🎉 扫描完成';
    else if (s.phase === 'init') action = '初始化';

    return {
      ...s,
      decision: s.decision ?? action,
      line: s.line ?? getLine(s.codeLine),
      metrics: {
        'cur-day': s.currentIndex >= 0 ? `第 ${s.currentIndex} 天` : '未开始',
        'daily-diff': isComparing
          ? curDiff > 0
            ? `+${curDiff} (上涨)`
            : curDiff < 0
              ? `${curDiff} (下跌)`
              : '0 (平盘)'
          : '—',
        'total-profit': `+${s.totalProfit}`,
        'tx-count': `${s.transactionCount} 笔`,
        action,
      },
    };
  });
}

export function buildStockSteps(prices: number[]): StockStep[] {
  const steps: StockStep[] = [];
  const n = prices.length;
  const lines = BEST_TIME_STOCK_CODE_LINES;

  if (n < 2) {
    steps.push({
      prices,
      currentIndex: 0,
      totalProfit: 0,
      transactionCount: 0,
      lastBuyIdx: -1,
      lastSellIdx: -1,
      dailyDiff: 0,
      tradeRanges: [],
      phase: 'done',
      message: '价格序列天数少于 2，无法交易，利润为 0',
      log: 'init: too short',
      decision: '无需交易',
      codeLine: lines.guard,
      line: getLine(lines.guard),
    });
    return withMetrics(steps);
  }

  let profit = 0;
  let txCount = 0;
  const tradeRanges: Array<[number, number]> = [];

  steps.push({
    prices,
    currentIndex: -1,
    totalProfit: 0,
    transactionCount: 0,
    lastBuyIdx: -1,
    lastSellIdx: -1,
    dailyDiff: 0,
    tradeRanges: [],
    phase: 'init',
    message: `初始化：prices = [${prices.join(', ')}]，扫描 ${n} 天价格，贪心收集所有正收益`,
    log: `init: ${n} days, prices=[${prices.join(',')}]`,
    decision: '初始化',
    codeLine: lines.init,
    line: getLine(lines.init),
  });

  for (let i = 0; i < n - 1; i++) {
    const diff = prices[i + 1] - prices[i];

    steps.push({
      prices,
      currentIndex: i,
      totalProfit: profit,
      transactionCount: txCount,
      lastBuyIdx: -1,
      lastSellIdx: -1,
      dailyDiff: diff,
      tradeRanges: [...tradeRanges],
      phase: 'compare',
      message: `🔍 比较相邻两日：第 ${i} 天 (${prices[i]}) &rarr; 第 ${i + 1} 天 (${prices[i + 1]})，差值 diff = ${diff >= 0 ? `+${diff}` : diff}`,
      log: `compare day ${i} (${prices[i]}) → day ${i + 1} (${prices[i + 1]})`,
      decision: '比较相邻两日',
      codeLine: lines.compare,
      line: getLine(lines.compare),
    });

    if (diff > 0) {
      profit += diff;
      txCount++;
      tradeRanges.push([i, i + 1]);

      steps.push({
        prices,
        currentIndex: i,
        totalProfit: profit,
        transactionCount: txCount,
        lastBuyIdx: i,
        lastSellIdx: i + 1,
        dailyDiff: diff,
        tradeRanges: [...tradeRanges],
        phase: 'trade',
        message: `📈 股价上涨：diff=+${diff} > 0，第 ${i} 天买入第 ${i + 1} 天卖出，锁定利润 +${diff}，累计总利润 = ${profit}`,
        log: `trade day ${i}→${i + 1}: profit +${diff}, total=${profit}`,
        decision: '买入并卖出锁定利润',
        codeLine: lines.trade,
        line: getLine(lines.trade),
      });
    } else {
      steps.push({
        prices,
        currentIndex: i,
        totalProfit: profit,
        transactionCount: txCount,
        lastBuyIdx: -1,
        lastSellIdx: -1,
        dailyDiff: diff,
        tradeRanges: [...tradeRanges],
        phase: 'skip',
        message: `📉 股价下跌/持平：diff=${diff} &le; 0，跳过不产生交易`,
        log: `skip day ${i}→${i + 1}: diff=${diff}`,
        decision: '跳过不产生交易',
        codeLine: lines.skip,
        line: getLine(lines.skip),
      });
    }
  }

  steps.push({
    prices,
    currentIndex: n - 1,
    totalProfit: profit,
    transactionCount: txCount,
    lastBuyIdx: -1,
    lastSellIdx: -1,
    dailyDiff: 0,
    tradeRanges: [...tradeRanges],
    phase: 'done',
    message: `🎉 贪心扫描完成！最大总利润 = ${profit}，共完成 ${txCount} 笔正收益交易`,
    log: `done: profit=${profit}, tx=${txCount}`,
    decision: '贪心扫描完成',
    codeLine: lines.done,
    line: getLine(lines.done),
  });

  return withMetrics(steps);
}
