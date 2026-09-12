/**
 * 买卖股票最佳时机 II 可视化器（贪心算法）— 声明式 4-Card 标准架构
 * LeetCode 122：跨天利润分解，贪心收集所有相邻两天的正向收益
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  BEST_TIME_STOCK_PROBLEM_HTML,
  BEST_TIME_STOCK_ANALYSIS_HTML,
  BEST_TIME_STOCK_CODE_LANGUAGES,
} from './best-time-stock-problem-content';

export type StockPhase = 'init' | 'compare' | 'skip' | 'trade' | 'done';

export interface StockStep {
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
  codeLine: number;
  metrics?: Record<string, string>;
}

export function buildStockSteps(prices: number[]): StockStep[] {
  const steps: StockStep[] = [];
  const n = prices.length;
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
      codeLine: 2,
    });
    return steps;
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
    codeLine: 3,
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
      codeLine: 4,
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
        codeLine: 5,
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
        codeLine: 5,
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
    codeLine: 7,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
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

export function renderBestTimeStockCanvas(container: HTMLElement, step: StockStep): void {
  const arr = step.prices;
  const n = arr.length;

  if (n === 0) {
    container.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const minVal = Math.min(...arr);
  const maxVal = Math.max(...arr);
  const valRange = maxVal - minVal || 1;

  const svgWidth = 420;
  const svgHeight = 160;
  const padX = 30;
  const padY = 25;

  const points = arr.map((val, idx) => {
    const x = padX + (idx / Math.max(1, n - 1)) * (svgWidth - padX * 2);
    const y = svgHeight - padY - ((val - minVal) / valRange) * (svgHeight - padY * 2);
    return { x, y, val, idx };
  });

  // 收益交易线段高亮 (绿色)
  const tradeSegmentsSvg = step.tradeRanges
    .map(([bIdx, sIdx]) => {
      const p1 = points[bIdx];
      const p2 = points[sIdx];
      return `
        <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#10b981" stroke-width="4" stroke-linecap="round" />
      `;
    })
    .join('');

  // 整体折线路径
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // 节点圆圈与标注
  const nodesSvg = points
    .map((p) => {
      const isCurrent = p.idx === step.currentIndex && step.phase !== 'done';
      const isNextCompare = p.idx === step.currentIndex + 1 && step.phase === 'compare';
      const isTrade = step.tradeRanges.some(([b, s]) => b === p.idx || s === p.idx);

      let stroke = '#cbd5e1';
      let fill = '#ffffff';
      let r = 5;

      if (isCurrent || isNextCompare) {
        stroke = '#059669';
        fill = '#34d399';
        r = 7.5;
      } else if (isTrade) {
        stroke = '#10b981';
        fill = '#ecfdf5';
        r = 6;
      }

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />
          <text x="${p.x}" y="${p.y - 10}" fill="${isTrade ? '#059669' : '#64748b'}" font-size="10.5" font-family="JetBrains Mono" font-weight="${isTrade ? '800' : '600'}" text-anchor="middle">
            ${p.val}
          </text>
          <text x="${p.x}" y="${svgHeight - 6}" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono" text-anchor="middle">
            D${p.idx}
          </text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 8px; box-sizing: border-box;">
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: 100%; overflow: visible;" preserveAspectRatio="xMidYMid meet">
        <!-- 背景基准线 -->
        <line x1="${padX}" y1="${svgHeight - padY}" x2="${svgWidth - padX}" y2="${svgHeight - padY}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3 3" />
        <line x1="${padX}" y1="${padY}" x2="${svgWidth - padX}" y2="${padY}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3 3" />

        <!-- 背景底折线 -->
        <path d="${linePath}" fill="none" stroke="#e2e8f0" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />

        <!-- 正收益交易线段 -->
        ${tradeSegmentsSvg}

        <!-- 节点与标签 -->
        ${nodesSvg}
      </svg>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'best-time-stock',
  name: '买卖股票的最佳时机 II',
  category: 'greedy',
  description: '跨天利润贪心分解为每天相邻价差，只收集所有正向收益',
  icon: '📈',
  difficulty: 2,
  levelOrder: 4,
  learningGoal: '掌握贪心算法中的利润等价分解思想，化解复杂多买多卖调度问题',
  inputs: [
    {
      id: 'prices',
      label: '价格序列',
      type: 'text',
      defaultValue: '7,1,5,3,6,4',
      placeholder: '7,1,5,3,6,4',
    },
  ],
  presets: [
    { label: '示例 1 (利润 7)', values: { prices: '7,1,5,3,6,4' } },
    { label: '单调递增 (利润 4)', values: { prices: '1,2,3,4,5' } },
    { label: '单调递减 (利润 0)', values: { prices: '7,6,4,3,1' } },
    { label: '锯齿震荡 (利润 3)', values: { prices: '2,1,2,1,2,1' } },
  ],
  metrics: [
    { id: 'cur-day', label: '当前扫描天', color: '#3b82f6' },
    { id: 'daily-diff', label: '当日差值 diff', color: '#d97706' },
    { id: 'total-profit', label: '累计总利润', color: '#059669' },
    { id: 'tx-count', label: '交易笔数', color: '#a855f7' },
    { id: 'action', label: '贪心判定', color: '#2563eb' },
  ],
  legend: [
    { label: '📈 正收益买卖区间', color: '#10b981' },
    { label: '📉 下跌跳过区间', color: '#ef4444' },
    { label: '📍 当前扫描日', color: '#3b82f6' },
  ],
  codeLanguages: BEST_TIME_STOCK_CODE_LANGUAGES,
  problemHtml: BEST_TIME_STOCK_PROBLEM_HTML,
  analysisHtml: BEST_TIME_STOCK_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const rawPrices = String(inputs.prices ?? '7,1,5,3,6,4')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    return withMetrics(buildStockSteps(rawPrices.length > 0 ? rawPrices : [7, 1, 5, 3, 6, 4]));
  },
  renderCanvas: (container, step) => renderBestTimeStockCanvas(container, step as StockStep),
});
