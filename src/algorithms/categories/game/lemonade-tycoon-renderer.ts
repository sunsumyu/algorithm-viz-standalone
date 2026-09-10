/**
 * 柠檬水摊贩·贪心收银大亨 (Lemonade Tycoon: Greedy Cashier Simulation)
 * 经典贪心算法、收银抽屉与万能零钱保留策略：
 * 1. 🏖️ 60 FPS 海滩柠檬水摊 (Canvas 2D 拟真木质吧台、遮阳伞、冰镇柠檬杯与排队顾客)
 * 2. 💵 实时现金抽屉 (清晰展示 $5、$10 与 $20 钞票存量)
 * 3. 🧠 贪心 vs 穷举找零对抗 (针对 $20 提供「优先 10+5」与「消耗三张 5」双重选项，直观体现后续破产对比)
 * 4. ✨ 贪心启示之眼 (一键极速贪心收银，全自动完成队列找零与收益结算)
 * 5. 🔊 原生 Web Audio 收银机「叮！」声、金币碰撞与欢呼音效
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  LEMONADE_TYCOON_CODE_LANGUAGES,
  LEMONADE_TYCOON_PROBLEM_HTML,
  LEMONADE_TYCOON_ANALYSIS_HTML,
} from './lemonade-tycoon-problem-content';

export interface Customer {
  id: number;
  bill: 5 | 10 | 20;
  status: 'WAITING' | 'SERVED' | 'FAILED';
  avatar: string;
}

class TycoonAudio {
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

  public static playChaChing(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(800, ctx.currentTime);
      osc2.frequency.setValueAtTime(1600, ctx.currentTime);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.25);
      osc2.stop(ctx.currentTime + 0.25);
    } catch {}
  }

  public static playCoin(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playBuzzer(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }

  public static playWin(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.25);
      });
    } catch {}
  }
}

export class LemonadeTycoonVisualizer extends StepVisualizer<any> {
  private queue: Customer[] = [];
  private currentCustomerIdx = 0;

  // 零钱抽屉
  private fiveCount = 0;
  private tenCount = 0;
  private twentyCount = 0;

  // 游戏状态
  private isGameOver = false;
  private isVictory = false;
  private servedCount = 0;
  private totalRevenue = 0;

  // 画布
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private lastTimestamp = 0;

  constructor() {
    super();
    this.codeLanguages = LEMONADE_TYCOON_CODE_LANGUAGES;
    this.codeLines = LEMONADE_TYCOON_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '柠檬水贪心收银算法引擎';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '柠檬水摊贩·贪心收银大亨' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.setupQueue([5, 5, 5, 10, 20]);
    this.initGameUI();
    this.startLoop();
  }

  public destroy(): void {
    super.destroy();
    if (this.animFrameId && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private setupQueue(bills: (5 | 10 | 20)[]): void {
    const avatars = ['👦', '👧', '👨', '👩', '👴', '👵', '🧑', '👱‍♂️'];
    this.queue = bills.map((b, i) => ({
      id: i,
      bill: b,
      status: 'WAITING',
      avatar: avatars[i % avatars.length],
    }));

    this.currentCustomerIdx = 0;
    this.fiveCount = 0;
    this.tenCount = 0;
    this.twentyCount = 0;
    this.isGameOver = false;
    this.isVictory = false;
    this.servedCount = 0;
    this.totalRevenue = 0;

    this.updateHUD();
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#lemonade-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: LEMONADE_TYCOON_CODE_LANGUAGES,
      problemHtml: LEMONADE_TYCOON_PROBLEM_HTML,
      analysisHtml: LEMONADE_TYCOON_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 快捷找零操作按钮
    const btnDirect5 = this.root.querySelector('#btn-lemon-take5') as HTMLButtonElement | null;
    const btnChange10 = this.root.querySelector('#btn-lemon-change10') as HTMLButtonElement | null;
    const btnGreedy20 = this.root.querySelector('#btn-lemon-greedy20') as HTMLButtonElement | null;
    const btnThree5 = this.root.querySelector('#btn-lemon-three5') as HTMLButtonElement | null;

    if (btnDirect5) btnDirect5.addEventListener('click', () => this.handleServe(5));
    if (btnChange10) btnChange10.addEventListener('click', () => this.handleServe(10));
    if (btnGreedy20) btnGreedy20.addEventListener('click', () => this.handleServe20(true));
    if (btnThree5) btnThree5.addEventListener('click', () => this.handleServe20(false));

    // 一键贪心自动收银
    const autoGreedyBtn = this.root.querySelector('#btn-lemon-auto-greedy') as HTMLButtonElement | null;
    if (autoGreedyBtn) {
      autoGreedyBtn.addEventListener('click', () => this.runAutoGreedy());
    }

    // 关卡预设
    this.root.querySelectorAll<HTMLButtonElement>('.lemon-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.preset || 'EASY';
        this.root?.querySelectorAll('.lemon-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        if (type === 'EASY') this.setupQueue([5, 5, 5, 10, 20]);
        else if (type === 'STRICT') this.setupQueue([5, 5, 10, 10, 20]);
        else if (type === 'RUSH') this.setupQueue([5, 5, 5, 10, 5, 5, 10, 20, 20, 20]);
        else if (type === 'FAIL') this.setupQueue([10, 10]);
      });
    });

    // 重置
    const resetBtn = this.root.querySelector('#btn-lemon-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.setupQueue(this.queue.map((c) => c.bill)));
    }
  }

  // 服务当前顾客 (收到 $5 或 $10)
  private handleServe(bill: 5 | 10): void {
    if (this.isGameOver || this.isVictory || this.currentCustomerIdx >= this.queue.length) return;
    const cur = this.queue[this.currentCustomerIdx];

    if (cur.bill !== bill) {
      TycoonAudio.playBuzzer();
      return;
    }

    if (bill === 5) {
      this.fiveCount++;
      this.finishCurrentCustomer();
    } else if (bill === 10) {
      if (this.fiveCount < 1) {
        this.triggerBankruptcy('没有 $5 钞票可为 $10 顾客找零！');
        return;
      }
      this.fiveCount--;
      this.tenCount++;
      this.finishCurrentCustomer();
    }
  }

  // 服务当前顾客 (收到 $20，选择 10+5 或 5+5+5)
  private handleServe20(useGreedy: boolean): void {
    if (this.isGameOver || this.isVictory || this.currentCustomerIdx >= this.queue.length) return;
    const cur = this.queue[this.currentCustomerIdx];

    if (cur.bill !== 20) {
      TycoonAudio.playBuzzer();
      return;
    }

    if (useGreedy) {
      // 贪心优先 10 + 5
      if (this.tenCount >= 1 && this.fiveCount >= 1) {
        this.tenCount--;
        this.fiveCount--;
        this.twentyCount++;
        this.finishCurrentCustomer();
      } else if (this.fiveCount >= 3) {
        this.fiveCount -= 3;
        this.twentyCount++;
        this.finishCurrentCustomer();
      } else {
        this.triggerBankruptcy('零钱不足以找零 $15！');
      }
    } else {
      // 非贪心：强行使用三张 $5
      if (this.fiveCount >= 3) {
        this.fiveCount -= 3;
        this.twentyCount++;
        this.finishCurrentCustomer();
      } else {
        this.triggerBankruptcy('手头 $5 钞票不足 3 张！');
      }
    }
  }

  private finishCurrentCustomer(): void {
    this.queue[this.currentCustomerIdx].status = 'SERVED';
    this.currentCustomerIdx++;
    this.servedCount++;
    this.totalRevenue += 5;
    TycoonAudio.playChaChing();

    if (this.currentCustomerIdx === this.queue.length) {
      this.isVictory = true;
      TycoonAudio.playWin();
    }
    this.updateHUD();
  }

  private triggerBankruptcy(reason: string): void {
    this.isGameOver = true;
    if (this.currentCustomerIdx < this.queue.length) {
      this.queue[this.currentCustomerIdx].status = 'FAILED';
    }
    TycoonAudio.playBuzzer();
    this.updateHUD(reason);
  }

  // 一键全自动贪心推演
  private runAutoGreedy(): void {
    if (this.isGameOver || this.isVictory) return;
    const step = () => {
      if (this.currentCustomerIdx >= this.queue.length || this.isGameOver) return;
      const cur = this.queue[this.currentCustomerIdx];
      if (cur.bill === 5) this.handleServe(5);
      else if (cur.bill === 10) this.handleServe(10);
      else if (cur.bill === 20) this.handleServe20(true);

      if (!this.isGameOver && this.currentCustomerIdx < this.queue.length) {
        setTimeout(step, 400);
      }
    };
    step();
  }

  private updateHUD(failReason?: string): void {
    if (!this.root) return;

    const fiveEl = this.root.querySelector('#lemon-drawer-5') as HTMLElement | null;
    const tenEl = this.root.querySelector('#lemon-drawer-10') as HTMLElement | null;
    const twentyEl = this.root.querySelector('#lemon-drawer-20') as HTMLElement | null;
    const revenueEl = this.root.querySelector('#lemon-revenue') as HTMLElement | null;
    const statusEl = this.root.querySelector('#lemon-status-badge') as HTMLElement | null;
    const currentCustomerEl = this.root.querySelector('#lemon-current-customer') as HTMLElement | null;

    if (fiveEl) fiveEl.textContent = `${this.fiveCount} 张`;
    if (tenEl) tenEl.textContent = `${this.tenCount} 张`;
    if (twentyEl) twentyEl.textContent = `${this.twentyCount} 张`;
    if (revenueEl) revenueEl.textContent = `💰 净赚营业额: $${this.totalRevenue}`;

    if (currentCustomerEl) {
      if (this.currentCustomerIdx < this.queue.length) {
        const cur = this.queue[this.currentCustomerIdx];
        currentCustomerEl.innerHTML = `当前顾客: <b>${cur.avatar} (递出 $${cur.bill})</b> | 需找零: <b style="color:#ef4444;">$${cur.bill - 5}</b>`;
      } else {
        currentCustomerEl.innerHTML = `🎉 队列已全员完成！`;
      }
    }

    if (statusEl) {
      if (this.isGameOver) {
        statusEl.textContent = `💀 找零失败破产！${failReason || ''}`;
        statusEl.style.background = '#fef2f2';
        statusEl.style.color = '#dc2626';
      } else if (this.isVictory) {
        statusEl.textContent = '🏆 贪心找零大获全胜！';
        statusEl.style.background = '#f0fdf4';
        statusEl.style.color = '#16a34a';
      } else {
        statusEl.textContent = `🍹 接待进度: ${this.servedCount} / ${this.queue.length}`;
        statusEl.style.background = '#eff6ff';
        statusEl.style.color = '#2563eb';
      }
    }
  }

  private startLoop(): void {
    if (typeof requestAnimationFrame !== 'function') return;
    const loop = (timestamp: number) => {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      this.lastTimestamp = timestamp;

      this.renderCanvas();

      if (typeof requestAnimationFrame === 'function') {
        this.animFrameId = requestAnimationFrame(loop);
      }
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private renderCanvas(): void {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. 金色海滩与木质吧台
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(0, 0, width, height);

    // 木质柜台
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, height - 70, width, 70);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(0, height - 74, width, 6);

    // 摊位招牌
    ctx.font = '28px sans-serif';
    ctx.fillText('🏖️', 16, 40);
    ctx.fillText('🍹', width - 45, height - 85);
    ctx.fillText('🍋', width - 85, height - 85);

    // 2. 绘制排队顾客队伍
    const startX = 60;
    const spacing = 45;

    for (let i = 0; i < this.queue.length; i++) {
      const c = this.queue[i];
      const isCurrent = i === this.currentCustomerIdx;
      const cx = startX + i * spacing;
      const cy = height - 95;

      if (cx > width - 100) continue;

      ctx.save();
      ctx.translate(cx, cy);

      // 头顶气泡展示持有钞票
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(-16, -34, 32, 18, 4);
      ctx.fill();
      ctx.strokeStyle = c.bill === 20 ? '#10b981' : c.bill === 10 ? '#3b82f6' : '#d97706';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = 'bold 9.5px monospace';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText(`$${c.bill}`, 0, -22);

      // 顾客身躯
      ctx.font = isCurrent ? '26px sans-serif' : '20px sans-serif';
      ctx.fillText(c.status === 'FAILED' ? '😭' : c.status === 'SERVED' ? '😋' : c.avatar, 0, 0);

      if (isCurrent && !this.isGameOver && !this.isVictory) {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(-4, 16);
        ctx.lineTo(4, 16);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }

    ctx.restore();
  }
}

export const LEMONADE_TYCOON_TEMPLATE = `
  <div id="algo-lemonade-tycoon-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏：关卡预设与功能控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🍹</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">柠檬水摊贩·贪心收银大亨</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="lemon-preset-btn active" data-preset="EASY" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典入门</button>
          <button class="lemon-preset-btn" data-preset="STRICT" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">严格贪心 (10+5必选)</button>
          <button class="lemon-preset-btn" data-preset="RUSH" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">🔥 极速长客流</button>
          <button class="lemon-preset-btn" data-preset="FAIL" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">🚫 必败无解局</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="lemon-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">🍹 接待中</span>
        <button id="btn-lemon-auto-greedy" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 6px rgba(37,99,235,0.25);">✨ 贪心启示之眼</button>
        <button id="btn-lemon-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 概念横幅与当前顾客 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #1e40af;">
      <span id="lemon-current-customer">当前顾客: <b>👦 (递出 $5)</b> | 需找零: $0</span>
      <span id="lemon-revenue" style="font-weight: 700; color: #16a34a;">💰 净赚营业额: $0</span>
    </div>

    <!-- 主交互区：左侧 60 FPS 海滩吧台 + 收银抽屉与操作，右侧终端 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.35fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：海滩排队 Canvas + 现金抽屉与找零决策 -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <!-- Canvas 排队小摊 -->
        <div style="position: relative; display: flex; justify-content: center; background: #fef3c7; border-radius: 6px; overflow: hidden; border: 1px solid #fed7aa;">
          <canvas id="lemonade-canvas" width="460" height="150" style="width: 460px; height: 150px;"></canvas>
        </div>

        <!-- 现金抽屉与存量 -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
          <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 6px; text-align: center;">
            <div style="font-size: 10.5px; color: #475569; font-weight: 700;">💵 $5 零钱 (万能)</div>
            <strong id="lemon-drawer-5" style="font-size: 14px; color: #0f172a;">0 张</strong>
          </div>
          <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 6px; text-align: center;">
            <div style="font-size: 10.5px; color: #475569; font-weight: 700;">💴 $10 钞票</div>
            <strong id="lemon-drawer-10" style="font-size: 14px; color: #0f172a;">0 张</strong>
          </div>
          <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 6px; text-align: center;">
            <div style="font-size: 10.5px; color: #475569; font-weight: 700;">💶 $20 大钞</div>
            <strong id="lemon-drawer-20" style="font-size: 14px; color: #0f172a;">0 张</strong>
          </div>
        </div>

        <!-- 收银找零动作按钮 -->
        <div style="font-size: 11px; font-weight: 800; color: #0f172a; margin-top: 2px;">🛎️ 找零决策交互:</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
          <button id="btn-lemon-take5" style="background: #f0fdf4; border: 1px solid #86efac; color: #166534; padding: 6px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
            ✅ 收入 $5 (无需找零)
          </button>
          <button id="btn-lemon-change10" style="background: #eff6ff; border: 1px solid #93c5fd; color: #1e40af; padding: 6px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
            🔄 收入 $10 (找零 $5)
          </button>
          <button id="btn-lemon-greedy20" style="background: #fffbeb; border: 1px solid #fde047; color: #854d0e; padding: 6px; border-radius: 6px; font-size: 11px; font-weight: 800; cursor: pointer;">
            💡 收入 $20 · 贪心找零 (10+5)
          </button>
          <button id="btn-lemon-three5" style="background: #fef2f2; border: 1px solid #fca5a5; color: #991b1b; padding: 6px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
            ⚠️ 收入 $20 · 消耗三张 5 块 (5+5+5)
          </button>
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="lemon-terminal-mount" style="flex: 1; min-height: 220px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'lemonade-tycoon',
  name: '柠檬水摊贩·贪心收银大亨',
  viewId: 'algo-lemonade-tycoon-view',
  category: 'game',
  description: '经典贪心经营游戏：海滩柠檬水小摊、实时钞票抽屉、$20 找零贪心权衡与一键自动收银推演',
  icon: '🍹',
  template: LEMONADE_TYCOON_TEMPLATE,
  Visualizer: LemonadeTycoonVisualizer,
  difficulty: 2,
  levelOrder: 7,
  learningGoal: '掌握贪心选择性质（Greedy Choice Property）在硬币找零与资源通用性权衡中的关键作用',
});
