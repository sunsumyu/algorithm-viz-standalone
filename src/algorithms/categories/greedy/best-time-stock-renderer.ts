/**
 * 买卖股票最佳时机 II 可视化器（贪心算法）— 4-Card 标准现代架构
 * LeetCode 122：跨天利润分解，贪心收集所有相邻两天的正向收益
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  BEST_TIME_STOCK_PROBLEM_HTML,
  BEST_TIME_STOCK_ANALYSIS_HTML,
  BEST_TIME_STOCK_CODE_LANGUAGES,
} from './best-time-stock-problem-content';
import template from './best-time-stock.html?raw';

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

/* ── Visualizer class ─────────────────────────────────────── */
export class BestTimeStockVisualizer extends StepVisualizer<StockStep> {
  protected codeLanguages = BEST_TIME_STOCK_CODE_LANGUAGES;
  protected codeLines = BEST_TIME_STOCK_CODE_LANGUAGES['java'];
  protected codePanelTitle = '买卖股票的最佳时机 II 代码调试';

  private chartContainer: HTMLElement | null = null;
  private diffContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.chartContainer = this.root.querySelector('#st-chart-container');
    this.diffContainer = this.root.querySelector('#st-diff-container');
    this.decisionMonitorContainer = this.root.querySelector('#st-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#st-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.st-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pricesEl = this.root?.querySelector('#input-prices') as HTMLInputElement | null;
        if (pricesEl && btn.dataset.prices) pricesEl.value = btn.dataset.prices;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: BEST_TIME_STOCK_PROBLEM_HTML,
      analysisHtml: BEST_TIME_STOCK_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): StockStep[] {
    const pricesEl = this.root?.querySelector('#input-prices') as HTMLInputElement | null;
    const rawPrices = (pricesEl?.value || '7,1,5,3,6,4')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    const prices = rawPrices.length > 0 ? rawPrices : [7, 1, 5, 3, 6, 4];
    return buildStockSteps(prices);
  }

  protected renderStep(step: StockStep): void {
    const arr = step.prices;
    const n = arr.length;

    // 1. 渲染价格走势图与收益折线沙盘 (Card 1)
    if (this.chartContainer && n > 0) {
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

      this.chartContainer.innerHTML = `
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
      `;
    }

    // 2. 渲染当日差值与买卖状态 (Card 2 Left)
    if (this.diffContainer) {
      const isComparing = step.phase === 'compare' || step.phase === 'trade' || step.phase === 'skip';
      const curDiff = step.dailyDiff;

      this.diffContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>当日差值 <code style="color:#059669; font-weight:700;">diff</code>:</span>
            <span style="font-family: monospace; font-weight:700; color: ${curDiff > 0 ? '#059669' : curDiff < 0 ? '#dc2626' : '#64748b'};">
              ${isComparing ? (curDiff > 0 ? `+${curDiff} (上涨)` : curDiff < 0 ? `${curDiff} (下跌)` : '0 (平盘)') : '-'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>当前扫描天:</span>
            <span style="font-family: monospace; font-weight:700;">${step.currentIndex >= 0 ? `第 ${step.currentIndex} 天` : '未开始'}</span>
          </div>
        </div>
      `;
    }

    // 3. 渲染贪心交易判定监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      const isTrade = step.phase === 'trade';
      const isSkip = step.phase === 'skip';

      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>贪心判定:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isTrade ? '#ecfdf5' : isSkip ? '#fef2f2' : '#eff6ff'}; color: ${isTrade ? '#059669' : isSkip ? '#dc2626' : '#2563eb'}; border: 1px solid ${isTrade ? '#a7f3d0' : isSkip ? '#fecaca' : '#bfdbfe'};">
              ${isTrade ? '📈 锁定正收益 (买入并卖出)' : isSkip ? '📉 避开亏损 (放弃交易)' : '🔍 比较相邻两日'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 贪心准则: <code style="color:#059669; font-family:monospace;">result += Math.max(prices[i] - prices[i-1], 0)</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染累计交易与总收益看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>累计最大总利润: <strong style="color: #059669; font-family: monospace; font-size: 13.5px;">+${step.totalProfit}</strong></span>
            <span style="font-size: 10.5px; font-weight: 700; color: #475569;">共 ${step.transactionCount} 笔交易</span>
          </div>
        </div>
      `;
    }

    const badgeProfit = this.root?.querySelector('#badge-total-profit');
    if (badgeProfit) {
      badgeProfit.textContent = `总利润: +${step.totalProfit}`;
    }


    // 7. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '步骤';

        if (st.phase === 'trade') {
          badgeColor = '#059669';
          badgeBg = '#ecfdf5';
          badgeText = '交易';
        } else if (st.phase === 'skip') {
          badgeColor = '#dc2626';
          badgeBg = '#fef2f2';
          badgeText = '跳过';
        } else if (st.phase === 'done') {
          badgeColor = '#2563eb';
          badgeBg = '#eff6ff';
          badgeText = '完成';
        }

        return `
          <div style="display: flex; align-items: flex-start; gap: 6px; padding: 3px 0; border-bottom: 1px solid #f8fafc; font-size: 11px;">
            <span style="color: #94a3b8; font-family: monospace; font-size: 10px; min-width: 24px;">#${idx + 1}</span>
            <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 1px 5px; border-radius: 4px; font-weight: 700; font-size: 10px;">${badgeText}</span>
            <span style="color: #334155; flex: 1;">${st.message}</span>
          </div>
        `;
      });

      this.logContainer.innerHTML = logs.join('');
      this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }
    if (this.logCountEl) {
      this.logCountEl.textContent = `${this.currentIndex + 1} / ${this.steps.length} 记录`;
    }
  }

  public reset(): void {
    super.reset();
    if (this.chartContainer) this.chartContainer.innerHTML = '';
  }
}

registerAlgorithm({
  id: 'best-time-stock',
  name: '买卖股票的最佳时机 II',
  viewId: 'algo-best-time-stock-view',
  category: 'greedy',
  description: '跨天利润贪心分解为每天相邻价差，只收集所有正向收益',
  icon: '📈',
  template,
  Visualizer: BestTimeStockVisualizer,
  difficulty: 2,
  levelOrder: 4,
  learningGoal: '掌握贪心算法中的利润等价分解思想，化解复杂多买多卖调度问题',
});
