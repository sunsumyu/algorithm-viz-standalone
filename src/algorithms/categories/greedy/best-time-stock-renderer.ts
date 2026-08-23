/**
 * 买卖股票最佳时机 II 可视化器（贪心算法）
 * LeetCode 122
 * 重做：玻璃感 + SVG 价格折线 + 买卖点弹入动画 + stroke-dashoffset 连接线
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './best-time-stock.html?raw';

type StockPhase = 'init' | 'compare' | 'skip' | 'trade' | 'done';

interface StockStep {
  prices: number[];
  currentIndex: number;
  totalProfit: number;
  transactionCount: number;
  /** 最新一次交易发生的买入下标（仅 trade 阶段有） */
  lastBuyIdx: number;
  /** 最新一次交易发生的卖出下标（仅 trade 阶段有） */
  lastSellIdx: number;
  /** 该步阶段 */
  phase: StockPhase;
  message: string;
  log: string;
  codeLine: number | number[];
}

/**
 * 拆分每个比较日为两个子步骤：
 * 1) compare —— 高亮今日和明日，准备判断
 * 2) skip 或 trade —— 根据 diff 决定
 */
function buildSteps(prices: number[]): StockStep[] {
  const steps: StockStep[] = [];
  const n = prices.length;
  if (n < 2) {
    steps.push({
      prices, currentIndex: 0, totalProfit: 0, transactionCount: 0,
      lastBuyIdx: -1, lastSellIdx: -1, phase: 'done',
      message: '价格序列太短，无法交易', log: 'init: too short', codeLine: 1,
    });
    return steps;
  }

  steps.push({
    prices, currentIndex: -1, totalProfit: 0, transactionCount: 0,
    lastBuyIdx: -1, lastSellIdx: -1, phase: 'init',
    message: `初始化：扫描 ${n} 天价格，收集所有上涨日的收益`,
    log: `init: ${n} days, prices=[${prices.join(',')}]`,
    codeLine: [2, 3],
  });

  let profit = 0;
  let txCount = 0;

  for (let i = 0; i < n - 1; i++) {
    const diff = prices[i + 1] - prices[i];

    // 1) compare 子步骤
    steps.push({
      prices, currentIndex: i, totalProfit: profit, transactionCount: txCount,
      lastBuyIdx: -1, lastSellIdx: -1, phase: 'compare',
      message: `第 ${i} 天（${prices[i]}） vs 第 ${i + 1} 天（${prices[i + 1]}）`,
      log: `compare day ${i} (${prices[i]}) → day ${i + 1} (${prices[i + 1]})`,
      codeLine: 4,
    });

    if (diff > 0) {
      profit += diff;
      txCount++;
      // 2) trade 子步骤
      steps.push({
        prices, currentIndex: i, totalProfit: profit, transactionCount: txCount,
        lastBuyIdx: i, lastSellIdx: i + 1, phase: 'trade',
        message: `📈 上涨 +${diff}，今日买入明日卖出，累计利润 = ${profit}`,
        log: `trade day ${i}→${i + 1}: profit +${diff}, total=${profit}`,
        codeLine: 7,
      });
    } else {
      // 2) skip 子步骤
      steps.push({
        prices, currentIndex: i, totalProfit: profit, transactionCount: txCount,
        lastBuyIdx: -1, lastSellIdx: -1, phase: 'skip',
        message: diff === 0 ? `📉 持平，不交易` : `📉 下跌 ${diff}，跳过`,
        log: `skip day ${i}→${i + 1}: diff=${diff}`,
        codeLine: 8,
      });
    }
  }

  steps.push({
    prices, currentIndex: n - 1, totalProfit: profit, transactionCount: txCount,
    lastBuyIdx: -1, lastSellIdx: -1, phase: 'done',
    message: `✅ 完成！总利润 = ${profit}，共 ${txCount} 笔交易`,
    log: `done: profit=${profit}, tx=${txCount}`,
    codeLine: 10,
  });

  return steps;
}

/**
 * SVG 渲染：价格折线 + 区域填充 + 动画点
 */
function renderChart(
  svg: SVGSVGElement,
  prices: number[],
  currentIdx: number,
  buyIdx: number,
  sellIdx: number,
  phase: StockPhase,
): void {
  svg.innerHTML = '';
  const n = prices.length;
  if (n === 0) return;

  const w = svg.clientWidth || 500;
  const h = svg.clientHeight || 220;
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

  // defs: gradient + area gradient
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <linearGradient id="stockGrad" x1="0" x2="1">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <linearGradient id="stockAreaGrad" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity=".45"/>
      <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
    </linearGradient>
  `;
  svg.appendChild(defs);

  const padX = 24, padY = 18;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const xStep = n <= 1 ? innerW : innerW / (n - 1);

  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = Math.max(1, maxP - minP);
  const yScale = innerH / (range * 1.15);

  const xAt = (i: number) => padX + i * xStep;
  const yAt = (p: number) => padY + (maxP + range * 0.08 - p) * yScale;

  // grid lines (4 horizontal)
  const grid = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  grid.setAttribute('class', 'stock-grid');
  for (let g = 0; g <= 4; g++) {
    const y = padY + (innerH / 4) * g;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', String(padX));
    line.setAttribute('x2', String(w - padX));
    line.setAttribute('y1', String(y));
    line.setAttribute('y2', String(y));
    grid.appendChild(line);
  }
  svg.appendChild(grid);

  // x-axis labels
  prices.forEach((p, i) => {
    const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    lbl.setAttribute('x', String(xAt(i)));
    lbl.setAttribute('y', String(h - 4));
    lbl.setAttribute('class', 'stock-axis-label');
    lbl.setAttribute('text-anchor', 'middle');
    lbl.textContent = `D${i}`;
    svg.appendChild(lbl);
  });

  // y-axis labels (min, mid, max)
  [minP, (minP + maxP) / 2, maxP].forEach((p) => {
    const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    lbl.setAttribute('x', String(6));
    lbl.setAttribute('y', String(yAt(p) + 3));
    lbl.setAttribute('class', 'stock-axis-label');
    lbl.textContent = String(Math.round(p));
    svg.appendChild(lbl);
  });

  // 折线：从 0 到 currentIdx（或全部）
  const upTo = Math.min(currentIdx >= 0 ? currentIdx + 1 : n, n);
  if (upTo >= 2) {
    let polyline = '';
    let area = `M ${xAt(0)},${h - padY} `;
    for (let i = 0; i < upTo; i++) {
      polyline += `${xAt(i)},${yAt(prices[i])} `;
      area += `L ${xAt(i)},${yAt(prices[i])} `;
    }
    area += `L ${xAt(upTo - 1)},${h - padY} Z`;

    const areaEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    areaEl.setAttribute('d', area);
    areaEl.setAttribute('class', 'stock-area');
    svg.appendChild(areaEl);

    const lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    lineEl.setAttribute('points', polyline);
    lineEl.setAttribute('class', 'stock-line');
    svg.appendChild(lineEl);
  }

  // 所有可见点（灰/小）+ 当前点（pulse）+ 买卖点（bounce）
  for (let i = 0; i < upTo; i++) {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', String(xAt(i)));
    c.setAttribute('cy', String(yAt(prices[i])));
    c.setAttribute('r', '5');
    c.setAttribute('fill', '#e2e8f0');
    c.setAttribute('class', 'stock-pt');

    if (i === currentIdx && phase === 'compare') {
      c.setAttribute('fill', '#fde68a');
      c.setAttribute('class', 'stock-pt stock-pt--current');
    }

    if (i === buyIdx && phase === 'trade') {
      c.setAttribute('class', 'stock-pt stock-pt--buy');
      c.setAttribute('r', '8');
    }
    if (i === sellIdx && phase === 'trade') {
      c.setAttribute('class', 'stock-pt stock-pt--sell');
      c.setAttribute('r', '8');
    }

    svg.appendChild(c);

    // 价格标签
    const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    lbl.setAttribute('x', String(xAt(i)));
    lbl.setAttribute('y', String(yAt(prices[i]) - 10));
    lbl.setAttribute('class', 'stock-pt-label');
    lbl.textContent = String(prices[i]);
    svg.appendChild(lbl);
  }

  // 买卖点之间的虚线连接
  if (phase === 'trade' && buyIdx >= 0 && sellIdx >= 0) {
    const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ln.setAttribute('x1', String(xAt(buyIdx)));
    ln.setAttribute('y1', String(yAt(prices[buyIdx])));
    ln.setAttribute('x2', String(xAt(sellIdx)));
    ln.setAttribute('y2', String(yAt(prices[sellIdx])));
    ln.setAttribute('class', 'stock-link');
    svg.appendChild(ln);
  }
}

export class BestTimeStockVisualizer extends StepVisualizer<StockStep> {
  protected codeLines = [
    "public int maxProfit(int[] prices) {",
    "    if (prices.length < 2) return 0;",
    "    int profit = 0, tx = 0;",
    "    for (int i = 0; i < prices.length - 1; i++) {",
    "        if (prices[i + 1] > prices[i]) {",
    "            profit += prices[i + 1] - prices[i];",
    "            tx++;",
    "        }",
    "    }",
    "    return profit;",
    "}",
  ];
  protected codePanelTitle = '贪心算法 · 买卖股票 (Java)';

  private inputEl: HTMLInputElement | null = null;
  private svgEl: SVGSVGElement | null = null;
  private dayEl: HTMLElement | null = null;
  private priceEl: HTMLElement | null = null;
  private profitEl: HTMLElement | null = null;
  private txEl: HTMLElement | null = null;
  private statusEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private clearLogBtn: HTMLButtonElement | null = null;
  private exampleBtns: NodeListOf<HTMLButtonElement> | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputEl = this.root.querySelector('#stock-input');
    this.svgEl = this.root.querySelector('#stock-svg');
    this.dayEl = this.root.querySelector('#stock-stat-day');
    this.priceEl = this.root.querySelector('#stock-stat-price');
    this.profitEl = this.root.querySelector('#stock-stat-profit');
    this.txEl = this.root.querySelector('#stock-stat-tx');
    this.statusEl = this.root.querySelector('#stock-stat-status');
    this.resultEl = this.root.querySelector('#stock-result');
    this.logEl = this.root.querySelector('#stock-log');
    this.clearLogBtn = this.root.querySelector('#stock-log-clear');
    this.exampleBtns = this.root.querySelectorAll('.stock-chip');

    this.bindPlaybackControls({ message: 'step-message' });

    const startBtn = this.root.querySelector('#stock-start');
    if (startBtn) startBtn.addEventListener('click', () => this.start());

    this.exampleBtns?.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.inputEl) this.inputEl.value = btn.dataset.val || '';
        this.start();
      });
    });

    if (this.clearLogBtn) {
      this.clearLogBtn.addEventListener('click', () => {
        if (this.logEl) this.logEl.innerHTML = '';
      });
    }
  }

  protected buildSteps(): StockStep[] {
    const defaultPrices = [7, 1, 5, 3, 6, 4];
    let prices = defaultPrices;
    if (this.inputEl) {
      const input = this.inputEl.value.trim();
      if (input) {
        const parsed = input.split(/[,，\s]+/).map((n) => parseInt(n.trim())).filter(Number.isFinite);
        if (parsed.length > 0) prices = parsed;
      }
    }
    return buildSteps(prices);
  }

  protected renderStep(step: StockStep): void {
    this.renderStats(step);
    this.renderChart(step);
    this.renderResultBanner(step);
    this.renderLogPanel();
  }

  private renderStats(step: StockStep): void {
    if (this.dayEl) {
      this.dayEl.textContent = step.currentIndex >= 0 ? `D${step.currentIndex}` : '-';
    }
    if (this.priceEl) {
      this.priceEl.textContent = step.currentIndex >= 0
        ? String(step.prices[step.currentIndex])
        : '-';
    }
    if (this.profitEl) this.profitEl.textContent = String(step.totalProfit);
    if (this.txEl) this.txEl.textContent = String(step.transactionCount);
    if (this.statusEl) {
      const names: Record<StockPhase, string> = {
        'init': '准备中', 'compare': '比较', 'skip': '跳过', 'trade': '交易', 'done': '完成',
      };
      this.statusEl.textContent = names[step.phase];
    }
  }

  private renderChart(step: StockStep): void {
    if (!this.svgEl) return;
    renderChart(
      this.svgEl, step.prices, step.currentIndex,
      step.lastBuyIdx, step.lastSellIdx, step.phase,
    );
  }

  private renderResultBanner(step: StockStep): void {
    const resultEl = this.resultEl;
    if (!resultEl) return;
    resultEl.classList.toggle('stock-result--done', step.phase === 'done');
    const emoji = resultEl.querySelector('.stock-emoji') as HTMLElement | null;
    if (emoji) {
      if (step.phase === 'done') emoji.textContent = '✅';
      else if (step.phase === 'trade') emoji.textContent = '💰';
      else if (step.phase === 'skip') emoji.textContent = '📉';
      else if (step.phase === 'compare') emoji.textContent = '🔍';
      else emoji.textContent = '📈';
    }
  }

  private renderLogPanel(): void {
    const logEl = this.logEl;
    if (!logEl) return;
    logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const line = document.createElement('div');
      line.className = 'stock-log-line' + (i === this.currentIndex ? ' stock-log-active' : '');
      line.innerHTML = `<span class="stock-log-num">${String(i + 1).padStart(2, '0')}</span><span>${s.log}</span>`;
      logEl.appendChild(line);
    });
    logEl.scrollTop = logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'best-time-stock',
  name: '买卖股票的最佳时机 II',
  viewId: 'algo-best-time-stock-view',
  category: 'greedy',
  description: 'LeetCode 122：贪心算法，收集所有正收益，最大化利润',
  icon: '📈',
  template,
  Visualizer: BestTimeStockVisualizer,
  difficulty: 1,
  levelOrder: 4,
  learningGoal: '掌握只允许一次交易的贪心策略',
});
