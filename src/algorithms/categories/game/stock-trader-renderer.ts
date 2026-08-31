/**
 * 星际华尔街·买卖股票的波段时机 (Stock Trader Empire: Wave Harvest)
 * 经典贪心与动态规划状态机算法（LeetCode 121 & LeetCode 122）：
 * 1. 📈 60 FPS 霓虹 K 线走势引擎 (Canvas 2D 拟真赛博走势图、正负斜率发光廊道与日线节点)
 * 2. ⚡ 正斜率波段贪心物理 (今日买明日卖拆解，累加所有 (prices[i] - prices[i-1] > 0) 正上坡)
 * 3. ⏱️ 步骤贪心推演与单步调试 (单步分析相邻日差值、正斜率判定与累计利润实时流)
 * 4. 🎛️ 经典题库预设 (LeetCode 经典波段、持续牛市单边上涨、持续熊市下挫、高波动震荡与随机走势)
 * 5. 🔊 原生 Web Audio 引擎交易买入鸣音、出金清脆铃铛、斜率扫描音与大捷号角
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  STOCK_TRADER_CODE_LANGUAGES,
  STOCK_TRADER_PROBLEM_HTML,
  STOCK_TRADER_ANALYSIS_HTML,
} from './stock-trader-problem-content';

export interface PricePoint {
  day: number;
  price: number;
  x: number;
  y: number;
  tradeState: 'NONE' | 'BUY' | 'SELL';
}

export interface SlopeSegment {
  fromDay: number;
  toDay: number;
  diff: number;
  isPositive: boolean;
  isHarvested: boolean;
}

export interface CoinParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
}

class StockAudio {
  private static audioCtx: AudioContext | null = null;
  public static isMuted = false;

  private static getCtx(): AudioContext | null {
    if (this.isMuted || typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioClass) this.audioCtx = new AudioClass();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public static playBuy(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playSell(profit: number = 5): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const baseFreq = 580 + Math.min(profit * 20, 600);
      const chord = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.2);
      });
    } catch {}
  }

  public static playScan(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(660, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }

  public static playWin(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.26);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.26);
      });
    } catch {}
  }
}

export class StockTraderVisualizer extends StepVisualizer<any> {
  // 核心数据
  private rawPrices: number[] = [7, 1, 5, 3, 6, 4];
  private pricePoints: PricePoint[] = [];
  private slopeSegments: SlopeSegment[] = [];
  private optimalProfit = 7;
  private currentProfit = 0;

  // 交易与推演状态
  private isAutoPlaying = false;
  private autoPlayTimer: any = null;
  private tradeStepIndex = 1;
  private playSpeed = 1;
  private manualBuyDay: number | null = null;

  // 画布与特效
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private lastTimestamp = 0;
  private particles: CoinParticle[] = [];
  private floatingTexts: FloatingText[] = [];
  private neonGlowPulse = 0;

  constructor() {
    super();
    this.codeLanguages = STOCK_TRADER_CODE_LANGUAGES;
    this.codeLines = STOCK_TRADER_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '买卖股票贪心算法执行引擎';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '星际华尔街·买卖股票的波段时机' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset([7, 1, 5, 3, 6, 4]);
    this.initGameUI();
    this.startLoop();
  }

  public destroy(): void {
    super.destroy();
    this.stopAutoPlay();
    if (this.animFrameId && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private calculateGreedyProfit(prices: number[]): number {
    let profit = 0;
    for (let i = 1; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff > 0) profit += diff;
    }
    return profit;
  }

  private loadPreset(prices: number[]): void {
    this.stopAutoPlay();
    this.rawPrices = prices;
    this.optimalProfit = this.calculateGreedyProfit(prices);

    this.pricePoints = prices.map((price, i) => ({
      day: i,
      price,
      x: 0,
      y: 0,
      tradeState: 'NONE',
    }));

    this.slopeSegments = [];
    for (let i = 1; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      this.slopeSegments.push({
        fromDay: i - 1,
        toDay: i,
        diff,
        isPositive: diff > 0,
        isHarvested: false,
      });
    }

    this.currentProfit = 0;
    this.tradeStepIndex = 1;
    this.manualBuyDay = null;
    this.particles = [];
    this.floatingTexts = [];

    this.updateHUD();
    this.logNarration(`📈 盘面已装入 ${prices.length} 天报价序列，贪心理论最大收益为 $${this.optimalProfit}。点击日线节点模拟买卖！`);
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#stock-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.bindCanvasEvents();
    }

    this.mountTerminal({
      codeLanguages: STOCK_TRADER_CODE_LANGUAGES,
      problemHtml: STOCK_TRADER_PROBLEM_HTML,
      analysisHtml: STOCK_TRADER_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 1. 贪心单步推演
    const stepBtn = this.root.querySelector('#btn-stock-step') as HTMLButtonElement | null;
    if (stepBtn) {
      stepBtn.addEventListener('click', () => this.runGreedySingleStep());
    }

    // 2. 贪心自动求解
    const autoBtn = this.root.querySelector('#btn-stock-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) {
          this.stopAutoPlay();
        } else {
          this.startAutoPlay();
        }
      });
    }

    // 3. 一键最优收割
    const solveBtn = this.root.querySelector('#btn-stock-solve') as HTMLButtonElement | null;
    if (solveBtn) {
      solveBtn.addEventListener('click', () => {
        this.slopeSegments.forEach((seg) => {
          if (seg.isPositive) {
            seg.isHarvested = true;
            this.pricePoints[seg.fromDay].tradeState = 'BUY';
            this.pricePoints[seg.toDay].tradeState = 'SELL';
          }
        });
        this.currentProfit = this.optimalProfit;
        StockAudio.playWin();
        this.logNarration(`🏆 贪心全波段收益已全部锁定！累计斩获最大净利润 $${this.currentProfit}！`);
        this.updateHUD();
      });
    }

    // 4. 预设走势切换
    this.root.querySelectorAll<HTMLButtonElement>('.stock-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.preset || 'CLASSIC_GREEDY';
        this.root?.querySelectorAll('.stock-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        if (type === 'CLASSIC_GREEDY') this.loadPreset([7, 1, 5, 3, 6, 4]);
        else if (type === 'CONTINUOUS_BULL') this.loadPreset([1, 2, 3, 4, 5]);
        else if (type === 'BEAR_MARKET') this.loadPreset([7, 6, 4, 3, 1]);
        else if (type === 'VOLATILE_WAVES') this.loadPreset([3, 8, 2, 9, 1, 7, 4, 10]);
        else if (type === 'RANDOM_MARKET') this.generateRandomMarket();
      });
    });

    // 5. 重置按钮
    const resetBtn = this.root.querySelector('#btn-stock-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.loadPreset(this.rawPrices));
    }

    // 6. 静音控制
    const muteBtn = this.root.querySelector('#btn-stock-sound') as HTMLButtonElement | null;
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        StockAudio.isMuted = !StockAudio.isMuted;
        muteBtn.textContent = StockAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private bindCanvasEvents(): void {
    if (!this.canvas) return;

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas!.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // 寻找被点击的日线节点
      for (let i = 0; i < this.pricePoints.length; i++) {
        const pt = this.pricePoints[i];
        const dist = Math.hypot(clickX - pt.x, clickY - pt.y);
        if (dist <= 18) {
          this.handleNodeClick(i);
          break;
        }
      }
    });
  }

  private handleNodeClick(dayIdx: number): void {
    const pt = this.pricePoints[dayIdx];

    if (this.manualBuyDay === null) {
      // 设定为买入点
      this.manualBuyDay = dayIdx;
      pt.tradeState = 'BUY';
      StockAudio.playBuy();
      this.spawnFloatingText(pt.x, pt.y - 20, `🟢 BUY $${pt.price}`, '#10b981');
      this.logNarration(`🟢 第 ${dayIdx + 1} 天以 $${pt.price} 买入！请点击后续任一天作为卖出点。`);
    } else if (this.manualBuyDay === dayIdx) {
      // 取消买入
      this.manualBuyDay = null;
      pt.tradeState = 'NONE';
      StockAudio.playScan();
      this.logNarration(`↩️ 取消第 ${dayIdx + 1} 天的买入操作。`);
    } else if (dayIdx > this.manualBuyDay) {
      // 设定为卖出点
      const buyDay = this.manualBuyDay;
      const buyPrice = this.pricePoints[buyDay].price;
      const sellPrice = pt.price;
      const profit = sellPrice - buyPrice;

      pt.tradeState = 'SELL';
      this.currentProfit += profit;
      this.manualBuyDay = null;

      if (profit > 0) {
        StockAudio.playSell(profit);
        this.spawnCoinParticles(pt.x, pt.y, profit);
        this.spawnFloatingText(pt.x, pt.y - 20, `+$${profit} 盈利!`, '#fbbf24');
        this.logNarration(`💰 成功交易：第 ${buyDay + 1} 天 ($${buyPrice}) 买入 $\\to$ 第 ${dayIdx + 1} 天 ($${sellPrice}) 卖出，获利 $${profit}！累计收益: $${this.currentProfit}`);
      } else {
        StockAudio.playScan();
        this.spawnFloatingText(pt.x, pt.y - 20, `$${profit} 亏损`, '#ef4444');
        this.logNarration(`⚠️ 逆势交易：第 ${buyDay + 1} 天 ($${buyPrice}) 买入 $\\to$ 第 ${dayIdx + 1} 天 ($${sellPrice}) 卖出，亏损 $${-profit}。累计收益: $${this.currentProfit}`);
      }

      if (this.currentProfit === this.optimalProfit) {
        StockAudio.playWin();
        this.logNarration(`🌟 完美通关！你收获了 $${this.currentProfit} 利润，完全达成贪心最优解！⭐⭐⭐`);
      }
    } else {
      // 不能向过去时间卖出
      this.logNarration(`⚠️ 股票只能在未来的天数卖出！已将第 ${dayIdx + 1} 天设为新的买入点。`);
      this.pricePoints[this.manualBuyDay].tradeState = 'NONE';
      this.manualBuyDay = dayIdx;
      pt.tradeState = 'BUY';
      StockAudio.playBuy();
    }

    this.updateHUD();
  }

  private runGreedySingleStep(): void {
    const n = this.rawPrices.length;
    if (this.tradeStepIndex >= n) {
      this.logNarration(`✨ 贪心单步推演完成！所有正斜率上坡已收割完毕，总利润为 $${this.currentProfit}。`);
      this.stopAutoPlay();
      return;
    }

    const i = this.tradeStepIndex;
    const prev = this.rawPrices[i - 1];
    const cur = this.rawPrices[i];
    const diff = cur - prev;
    const seg = this.slopeSegments[i - 1];

    if (diff > 0) {
      seg.isHarvested = true;
      this.pricePoints[i - 1].tradeState = 'BUY';
      this.pricePoints[i].tradeState = 'SELL';
      this.currentProfit += diff;
      StockAudio.playSell(diff);
      this.spawnCoinParticles(this.pricePoints[i].x, this.pricePoints[i].y, diff);
      this.spawnFloatingText(this.pricePoints[i].x, this.pricePoints[i].y - 20, `+$${diff}`, '#10b981');
      this.logNarration(`🚀 [第 ${i + 1} 天 vs 第 ${i} 天] 价格从 $${prev} 上涨到 $${cur} (差值 +$${diff} > 0) $\\implies$ 贪心买入并卖出，锁定利润 +$${diff}！累计: $${this.currentProfit}`);
    } else {
      StockAudio.playScan();
      this.logNarration(`💤 [第 ${i + 1} 天 vs 第 ${i} 天] 价格从 $${prev} 下跌到 $${cur} (差值 $${diff} <= 0) $\\implies$ 绿灯不亮，跳过不交易。`);
    }

    this.tradeStepIndex++;
    this.updateHUD();

    if (this.tradeStepIndex >= n) {
      this.stopAutoPlay();
      StockAudio.playWin();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-stock-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停推演';

    const step = () => {
      if (!this.isAutoPlaying) return;
      this.runGreedySingleStep();
      if (this.tradeStepIndex < this.rawPrices.length) {
        this.autoPlayTimer = setTimeout(step, 800 / this.playSpeed);
      } else {
        this.stopAutoPlay();
      }
    };
    step();
  }

  private stopAutoPlay(): void {
    this.isAutoPlaying = false;
    if (this.autoPlayTimer) {
      clearTimeout(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
    const playBtn = this.root?.querySelector('#btn-stock-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动推演';
  }

  private generateRandomMarket(): void {
    const count = 7 + Math.floor(Math.random() * 3);
    const prices: number[] = [Math.floor(Math.random() * 5) + 3];
    for (let i = 1; i < count; i++) {
      const delta = Math.floor(Math.random() * 7) - 3;
      prices.push(Math.max(1, prices[i - 1] + delta));
    }
    this.loadPreset(prices);
  }

  private spawnCoinParticles(x: number, y: number, count: number): void {
    const numParticles = Math.min(24, Math.max(10, count * 3));
    for (let i = 0; i < numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.0,
        size: 3 + Math.random() * 3,
        alpha: 1.0,
        life: 0,
        maxLife: 30 + Math.random() * 15,
        color: '#fbbf24',
      });
    }
  }

  private spawnFloatingText(x: number, y: number, text: string, color: string): void {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      alpha: 1.0,
      life: 0,
    });
  }

  private logNarration(msg: string): void {
    if (!this.root) return;
    const logBox = this.root.querySelector('#stock-narration-box') as HTMLElement | null;
    if (logBox) {
      logBox.innerHTML = `💡 ${msg}`;
    }
  }

  private updateHUD(): void {
    if (!this.root) return;

    const profitStatEl = this.root.querySelector('#stock-stat-profit') as HTMLElement | null;
    const optimalStatEl = this.root.querySelector('#stock-stat-optimal') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#stock-status-badge') as HTMLElement | null;
    const segListEl = this.root.querySelector('#stock-segments-list') as HTMLElement | null;

    if (profitStatEl) profitStatEl.textContent = `$${this.currentProfit}`;
    if (optimalStatEl) optimalStatEl.textContent = `$${this.optimalProfit}`;

    if (statusBadge) {
      if (this.currentProfit === this.optimalProfit && this.optimalProfit > 0) {
        statusBadge.textContent = '🌟 完美达成最大利润';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `💹 盘面运行中`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (segListEl) {
      segListEl.innerHTML = this.slopeSegments
        .map((seg, idx) => {
          const isInspected = idx < this.tradeStepIndex - 1;
          const bg = seg.isHarvested ? '#dcfce7' : isInspected ? '#f1f5f9' : '#ffffff';
          const borderColor = seg.isHarvested ? '#22c55e' : '#cbd5e1';
          const textColor = seg.diff > 0 ? '#16a34a' : '#ef4444';
          const sign = seg.diff > 0 ? `+${seg.diff}` : `${seg.diff}`;

          return `
          <div style="display: flex; flex-direction: column; align-items: center; padding: 3px 6px; border-radius: 6px; border: 1px solid ${borderColor}; background: ${bg}; min-width: 52px;">
            <span style="font-size: 9px; color: #64748b;">Day ${seg.fromDay + 1}→${seg.toDay + 1}</span>
            <span style="font-size: 11px; font-weight: 800; color: ${textColor}; font-family: monospace;">${sign}</span>
          </div>
        `;
        })
        .join('');
    }
  }

  private startLoop(): void {
    if (typeof requestAnimationFrame !== 'function') return;
    const loop = (timestamp: number) => {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const dt = Math.min(32, timestamp - this.lastTimestamp);
      this.lastTimestamp = timestamp;

      this.updatePhysics(dt);
      this.renderCanvas();

      if (typeof requestAnimationFrame === 'function') {
        this.animFrameId = requestAnimationFrame(loop);
      }
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private updatePhysics(dt: number): void {
    this.neonGlowPulse += dt * 0.005;

    // 粒子物理
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // 浮动文字
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life++;
      ft.y -= 0.6;
      ft.alpha = Math.max(0, 1 - ft.life / 35);
      if (ft.life >= 35) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private renderCanvas(): void {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const count = this.pricePoints.length;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. 深空 K 线走势背景
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#080d1a');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. 坐标与极值计算
    const maxP = Math.max(...this.rawPrices, 10);
    const minP = Math.max(0, Math.min(...this.rawPrices) - 1);
    const pRange = Math.max(1, maxP - minP);

    const padLeft = 35;
    const padRight = 35;
    const padTop = 30;
    const padBottom = 35;

    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;
    const stepX = count > 1 ? chartW / (count - 1) : 0;

    this.pricePoints.forEach((pt, i) => {
      pt.x = padLeft + i * stepX;
      const normY = (pt.price - minP) / pRange;
      pt.y = padTop + chartH - normY * chartH;
    });

    // 3. 背景网格线与价格刻度
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let p = minP; p <= maxP; p += Math.ceil(pRange / 4)) {
      const ny = padTop + chartH - ((p - minP) / pRange) * chartH;
      ctx.beginPath();
      ctx.moveTo(padLeft, ny);
      ctx.lineTo(width - padRight, ny);
      ctx.stroke();

      ctx.font = '9px monospace';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'right';
      ctx.fillText(`$${p}`, padLeft - 6, ny + 3);
    }

    // 4. 绘制正斜率绿色走势发光区域 (贪心收集区)
    this.slopeSegments.forEach((seg) => {
      const p1 = this.pricePoints[seg.fromDay];
      const p2 = this.pricePoints[seg.toDay];

      if (seg.isPositive) {
        ctx.save();
        const segGrad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        segGrad.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
        segGrad.addColorStop(1, 'rgba(16, 185, 129, 0.35)');

        ctx.fillStyle = segGrad;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p2.x, height - padBottom);
        ctx.lineTo(p1.x, height - padBottom);
        ctx.closePath();
        ctx.fill();

        // 收集发光光环
        if (seg.isHarvested) {
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        ctx.restore();
      }
    });

    // 5. 绘制走势折线
    ctx.save();
    for (let i = 0; i < count - 1; i++) {
      const p1 = this.pricePoints[i];
      const p2 = this.pricePoints[i + 1];
      const isRising = p2.price > p1.price;

      ctx.strokeStyle = isRising ? '#10b981' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.restore();

    // 6. 绘制价格节点与日标签
    this.pricePoints.forEach((pt) => {
      ctx.save();

      // 日期底部标签
      ctx.font = '9.5px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText(`D${pt.day + 1}`, pt.x, height - 15);

      // 节点外晕
      if (pt.tradeState === 'BUY') {
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 12;
      } else if (pt.tradeState === 'SELL') {
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12;
      } else {
        ctx.fillStyle = '#38bdf8';
      }

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
      ctx.fill();

      // 节点白心
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
      ctx.fill();

      // 价格标签胶囊
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(`$${pt.price}`, pt.x, pt.y - 10);

      // 买入/卖出徽章
      if (pt.tradeState === 'BUY') {
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 8.5px sans-serif';
        ctx.fillText('BUY', pt.x, pt.y + 16);
      } else if (pt.tradeState === 'SELL') {
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 8.5px sans-serif';
        ctx.fillText('SELL', pt.x, pt.y + 16);
      }

      ctx.restore();
    });

    // 7. 金币粒子
    this.particles.forEach((p) => {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 8. 浮动文字
    this.floatingTexts.forEach((ft) => {
      ctx.save();
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = ft.alpha;
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    ctx.restore();
  }
}

export const STOCK_TRADER_TEMPLATE = `
  <div id="algo-stock-trader-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏：行情预设与控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">📈</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">星际华尔街·买卖股票的波段时机</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="stock-preset-btn active" data-preset="CLASSIC_GREEDY" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典波段 [7,1,5,3,6,4]</button>
          <button class="stock-preset-btn" data-preset="CONTINUOUS_BULL" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">单边牛市 [1,2,3,4,5]</button>
          <button class="stock-preset-btn" data-preset="BEAR_MARKET" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">单边熊市 [7,6,4,3,1]</button>
          <button class="stock-preset-btn" data-preset="VOLATILE_WAVES" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">🌊 高波动震荡</button>
          <button class="stock-preset-btn" data-preset="RANDOM_MARKET" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">🎲 随机行情</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="stock-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">💹 盘面就绪</span>
        <button id="btn-stock-solve" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">✨ 一键最优收割</button>
        <button id="btn-stock-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-stock-autoplay" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(59,130,246,0.25);">▶️ 自动推演</button>
        <button id="btn-stock-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-stock-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条与统计 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #1e40af;">
      <div style="display: flex; gap: 14px; align-items: center;">
        <span>💰 累计交易利润: <b id="stock-stat-profit" style="color: #16a34a; font-size: 12px;">$0</b></span>
        <span>⭐ 贪心理论最大利润: <b id="stock-stat-optimal" style="color: #d97706; font-size: 12px;">$7</b></span>
      </div>
      <div id="stock-narration-box" style="font-weight: 700; color: #1e3a8a;">
        💡 点击价格节点选择买入/卖出日，或点击自动推演直观观察正斜率贪心收割！
      </div>
    </div>

    <!-- 主交互区：左侧 Canvas + 斜率矩阵，右侧终端 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.35fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：走势图 Canvas 与斜率走廊 -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <!-- Canvas 容器 -->
        <div style="position: relative; display: flex; justify-content: center; background: #080d1a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="stock-canvas" width="460" height="180" style="width: 460px; height: 180px; cursor: pointer;"></canvas>
        </div>

        <!-- 每日差值贪心分解条 -->
        <div style="display: flex; flex-direction: column; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; gap: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 11px; font-weight: 700; color: #334155;">⚡ 每日差值正斜率分解 (diff = prices[i] - prices[i-1] > 0 则累加)</span>
          </div>
          <div id="stock-segments-list" style="display: flex; gap: 6px; flex-wrap: wrap;"></div>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          💡 任意长线波段皆可等价拆解为单日上涨收益之和！只需收集所有绿色正斜率。
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="stock-terminal-mount" style="flex: 1; min-height: 220px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'stock-trader',
  name: '星际华尔街·买卖股票的最佳时机',
  viewId: 'algo-stock-trader-view',
  category: 'game',
  description: '股票交易贪心与动规算法游戏：60 FPS 霓虹K线走势、正上坡波段贪心捕捉、买卖交易决策与状态机推演',
  icon: '📈',
  template: STOCK_TRADER_TEMPLATE,
  Visualizer: StockTraderVisualizer,
  difficulty: 2,
  levelOrder: 18,
  learningGoal: '掌握贪心买卖股票（收集所有正向斜率收益）与动态规划状态机模型（买入/卖出/冷冻期状态转移）的核心原理',
});
