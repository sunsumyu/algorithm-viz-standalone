/**
 * 萌宠餐厅·饼干大派送 (Cookie Pets: Greedy Two-Pointer Feeder)
 * 经典双指针贪心算法、单调双序列匹配与咀嚼投喂动画：
 * 1. 🐱 60 FPS 萌宠餐厅 (Canvas 2D 拟真木质餐桌、排队萌宠、烘焙饼干托盘与抛物线投喂)
 * 2. 👉 双指针实时透视 (清晰呈现萌宠指针 childPtr 与饼干指针 cookiePtr 的单向滑动)
 * 3. 💖 满意度与咀嚼粒子 (饼干入口触发咀嚼碎屑与冒爱心特效)
 * 4. ✨ 贪心启示之眼 (一键自动完成双排序与最优贪心投喂)
 * 5. 🔊 原生 Web Audio 投喂清脆咀嚼音效与欢呼
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  COOKIE_FEEDER_CODE_LANGUAGES,
  COOKIE_FEEDER_PROBLEM_HTML,
  COOKIE_FEEDER_ANALYSIS_HTML,
} from './cookie-feeder-problem-content';

export interface Pet {
  id: number;
  name: string;
  avatar: string;
  greed: number; // 胃口需求
  isSatisfied: boolean;
}

export interface CookieItem {
  id: number;
  size: number; // 饼干尺寸
  isUsed: boolean;
}

export interface FlyingCookie {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number;
  size: number;
}

class FeederAudio {
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

  public static playCrunch(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  public static playSkip(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  public static playVictory(): void {
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

export class CookieFeederVisualizer extends StepVisualizer<any> {
  private pets: Pet[] = [];
  private cookies: CookieItem[] = [];

  // 双指针
  private childPtr = 0;
  private cookiePtr = 0;

  // 飞行饼干动画
  private flyingCookies: FlyingCookie[] = [];

  // 状态
  private satisfiedCount = 0;
  private isDone = false;

  // 画布与动画
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private lastTimestamp = 0;

  constructor() {
    super();
    this.codeLanguages = COOKIE_FEEDER_CODE_LANGUAGES;
    this.codeLines = COOKIE_FEEDER_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '双指针贪心饼干分发引擎';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '萌宠餐厅·饼干大派送' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.setupData([1, 2, 3], [1, 1]);
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

  private setupData(greeds: number[], sizes: number[]): void {
    // 排序
    const sortedGreeds = [...greeds].sort((a, b) => a - b);
    const sortedSizes = [...sizes].sort((a, b) => a - b);

    const petPool = [
      { name: '仓鼠', avatar: '🐹' },
      { name: '猫咪', avatar: '🐱' },
      { name: '柴犬', avatar: '🐶' },
      { name: '熊猫', avatar: '🐼' },
      { name: '棕熊', avatar: '🐻' },
      { name: '兔子', avatar: '🐰' },
    ];

    this.pets = sortedGreeds.map((g, i) => ({
      id: i,
      name: petPool[i % petPool.length].name,
      avatar: petPool[i % petPool.length].avatar,
      greed: g,
      isSatisfied: false,
    }));

    this.cookies = sortedSizes.map((s, i) => ({
      id: i,
      size: s,
      isUsed: false,
    }));

    this.childPtr = 0;
    this.cookiePtr = 0;
    this.satisfiedCount = 0;
    this.isDone = false;
    this.flyingCookies = [];

    this.updateHUD();
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#cookie-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: COOKIE_FEEDER_CODE_LANGUAGES,
      problemHtml: COOKIE_FEEDER_PROBLEM_HTML,
      analysisHtml: COOKIE_FEEDER_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步投喂尝试
    const feedBtn = this.root.querySelector('#btn-cookie-feed') as HTMLButtonElement | null;
    if (feedBtn) {
      feedBtn.addEventListener('click', () => this.tryFeedStep());
    }

    // 饼干过小跳过
    const skipBtn = this.root.querySelector('#btn-cookie-skip') as HTMLButtonElement | null;
    if (skipBtn) {
      skipBtn.addEventListener('click', () => this.skipCookieStep());
    }

    // 一键贪心自动推演
    const autoGreedyBtn = this.root.querySelector('#btn-cookie-auto') as HTMLButtonElement | null;
    if (autoGreedyBtn) {
      autoGreedyBtn.addEventListener('click', () => this.runAutoGreedy());
    }

    // 关卡预设
    this.root.querySelectorAll<HTMLButtonElement>('.cookie-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.preset || 'CLASSIC';
        this.root?.querySelectorAll('.cookie-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        if (type === 'CLASSIC') this.setupData([1, 2, 3], [1, 1]);
        else if (type === 'ALL') this.setupData([1, 2], [1, 2, 3]);
        else if (type === 'MIXED') this.setupData([2, 3, 5, 7], [1, 2, 4, 8]);
      });
    });

    // 重置
    const resetBtn = this.root.querySelector('#btn-cookie-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.setupData(this.pets.map((p) => p.greed), this.cookies.map((c) => c.size)));
    }
  }

  // 尝试将当前 cookiePtr 饼干投喂给当前 childPtr 萌宠
  private tryFeedStep(): void {
    if (this.isDone || this.childPtr >= this.pets.length || this.cookiePtr >= this.cookies.length) return;

    const curPet = this.pets[this.childPtr];
    const curCookie = this.cookies[this.cookiePtr];

    if (curCookie.size >= curPet.greed) {
      // 成功满足！
      curPet.isSatisfied = true;
      curCookie.isUsed = true;

      // 触发抛物线飞行动画
      this.spawnFlyingCookie(this.cookiePtr, this.childPtr, curCookie.size);

      this.childPtr++;
      this.cookiePtr++;
      this.satisfiedCount++;
      FeederAudio.playCrunch();
    } else {
      // 饼干太小，无法满足
      curCookie.isUsed = true;
      this.cookiePtr++;
      FeederAudio.playSkip();
    }

    if (this.childPtr >= this.pets.length || this.cookiePtr >= this.cookies.length) {
      this.isDone = true;
      FeederAudio.playVictory();
    }

    this.updateHUD();
  }

  private skipCookieStep(): void {
    if (this.isDone || this.cookiePtr >= this.cookies.length) return;
    this.cookies[this.cookiePtr].isUsed = true;
    this.cookiePtr++;
    FeederAudio.playSkip();

    if (this.cookiePtr >= this.cookies.length) {
      this.isDone = true;
      FeederAudio.playVictory();
    }
    this.updateHUD();
  }

  private spawnFlyingCookie(cookieIdx: number, petIdx: number, size: number): void {
    const width = this.canvas?.width || 460;
    const petSpacing = width / (this.pets.length + 1);
    const cookieSpacing = width / (this.cookies.length + 1);

    const startX = (cookieIdx + 1) * cookieSpacing;
    const startY = 150;
    const targetX = (petIdx + 1) * petSpacing;
    const targetY = 45;

    this.flyingCookies.push({
      startX,
      startY,
      targetX,
      targetY,
      progress: 0,
      size,
    });
  }

  private runAutoGreedy(): void {
    if (this.isDone) return;
    const step = () => {
      if (this.isDone || this.childPtr >= this.pets.length || this.cookiePtr >= this.cookies.length) return;
      this.tryFeedStep();
      if (!this.isDone) {
        setTimeout(step, 450);
      }
    };
    step();
  }

  private updateHUD(): void {
    if (!this.root) return;

    const countEl = this.root.querySelector('#cookie-satisfied-count') as HTMLElement | null;
    const statusEl = this.root.querySelector('#cookie-status-badge') as HTMLElement | null;
    const pointerInfoEl = this.root.querySelector('#cookie-pointers-info') as HTMLElement | null;

    if (countEl) countEl.textContent = `💖 喂饱萌宠: ${this.satisfiedCount} / ${this.pets.length}`;

    if (pointerInfoEl) {
      const petText = this.childPtr < this.pets.length ? `${this.pets[this.childPtr].name} (胃口 ${this.pets[this.childPtr].greed})` : '已全部喂饱';
      const cookieText = this.cookiePtr < this.cookies.length ? `尺寸 ${this.cookies[this.cookiePtr].size}` : '饼干已耗尽';
      pointerInfoEl.innerHTML = `萌宠指针: <b>${petText}</b> | 饼干指针: <b>${cookieText}</b>`;
    }

    if (statusEl) {
      if (this.isDone) {
        statusEl.textContent = `🏆 投喂结算完成！共满足 ${this.satisfiedCount} 只`;
        statusEl.style.background = '#f0fdf4';
        statusEl.style.color = '#16a34a';
      } else {
        statusEl.textContent = `🍪 正在贪心匹配...`;
        statusEl.style.background = '#eff6ff';
        statusEl.style.color = '#2563eb';
      }
    }
  }

  private startLoop(): void {
    if (typeof requestAnimationFrame !== 'function') return;
    const loop = (timestamp: number) => {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
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
    for (let i = this.flyingCookies.length - 1; i >= 0; i--) {
      const fc = this.flyingCookies[i];
      fc.progress += dt * 2.8;
      if (fc.progress >= 1) {
        this.flyingCookies.splice(i, 1);
      }
    }
  }

  private renderCanvas(): void {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. 餐厅温馨背景
    ctx.fillStyle = '#fffbeb';
    ctx.fillRect(0, 0, width, height);

    // 木质餐桌隔板
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(0, 85, width, 14);

    // 2. 绘制萌宠 (Top Row)
    const petSpacing = width / (this.pets.length + 1);
    for (let i = 0; i < this.pets.length; i++) {
      const p = this.pets[i];
      const px = (i + 1) * petSpacing;
      const py = 45;
      const isCurrent = i === this.childPtr;

      ctx.save();
      ctx.translate(px, py);

      // 头顶高亮光圈
      if (isCurrent && !this.isDone) {
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
        ctx.fill();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.isSatisfied ? '💖' : p.avatar, 0, 0);

      // 胃口需求角标
      ctx.font = 'bold 9.5px monospace';
      ctx.fillStyle = '#b45309';
      ctx.fillText(`胃口: ${p.greed}`, 0, 24);

      ctx.restore();
    }

    // 3. 绘制饼干托盘 (Bottom Row)
    const cookieSpacing = width / (this.cookies.length + 1);
    for (let j = 0; j < this.cookies.length; j++) {
      const c = this.cookies[j];
      const cx = (j + 1) * cookieSpacing;
      const cy = 150;
      const isCurrent = j === this.cookiePtr;

      ctx.save();
      ctx.translate(cx, cy);

      if (isCurrent && !this.isDone) {
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.font = c.isUsed ? '18px sans-serif' : '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = c.isUsed ? 'rgba(0,0,0,0.25)' : '#000000';
      ctx.fillText(c.isUsed ? '💨' : '🍪', 0, 0);

      ctx.font = 'bold 9.5px monospace';
      ctx.fillStyle = c.isUsed ? '#94a3b8' : '#78350f';
      ctx.fillText(`尺寸: ${c.size}`, 0, 22);

      ctx.restore();
    }

    // 4. 绘制飞行饼干
    for (const fc of this.flyingCookies) {
      const p = fc.progress;
      const fx = fc.startX + (fc.targetX - fc.startX) * p;
      const baseFy = fc.startY + (fc.targetY - fc.startY) * p;
      const arc = Math.sin(p * Math.PI) * 35;
      const fy = baseFy - arc;

      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🍪', fx, fy);
    }

    ctx.restore();
  }
}

export const COOKIE_FEEDER_TEMPLATE = `
  <div id="algo-cookie-feeder-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏：关卡预设与功能控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🍪</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">萌宠餐厅·饼干大派送</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="cookie-preset-btn active" data-preset="CLASSIC" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典部分满足</button>
          <button class="cookie-preset-btn" data-preset="ALL" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">全员满足局</button>
          <button class="cookie-preset-btn" data-preset="MIXED" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">🔥 混合大挑战</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="cookie-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">🍪 正在贪心匹配...</span>
        <button id="btn-cookie-feed" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border: none; border-radius: 6px; padding: 4px 12px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(16,185,129,0.25);">👉 尝试投喂 (Feed)</button>
        <button id="btn-cookie-skip" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">⏩ 饼干太小跳过</button>
        <button id="btn-cookie-auto" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 6px rgba(37,99,235,0.25);">✨ 贪心启示之眼</button>
        <button id="btn-cookie-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 概念横幅与双指针状态 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #1e40af;">
      <span id="cookie-pointers-info">萌宠指针: <b>仓鼠 (胃口 1)</b> | 饼干指针: <b>尺寸 1</b></span>
      <span id="cookie-satisfied-count" style="font-weight: 700; color: #16a34a;">💖 喂饱萌宠: 0 / 3</span>
    </div>

    <!-- 主交互区：左侧 60 FPS 餐厅 Canvas + 右侧终端 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.35fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：餐厅沙盘 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #fffbeb; border-radius: 6px; overflow: hidden; border: 1px solid #fed7aa;">
          <canvas id="cookie-canvas" width="460" height="200" style="width: 460px; height: 200px;"></canvas>
        </div>
        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          💡 贪心策略：将最小的饼干优先分配给胃口最小且能被满足的萌宠，大饼干保留给胃口更大的萌宠！
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="cookie-terminal-mount" style="flex: 1; min-height: 220px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'cookie-feeder',
  name: '萌宠餐厅·饼干大派送',
  viewId: 'algo-cookie-feeder-view',
  category: 'game',
  description: '双指针贪心算法游戏：萌宠餐厅、香脆饼干托盘、抛物线咀嚼投喂动画与双序列最优匹配',
  icon: '🍪',
  template: COOKIE_FEEDER_TEMPLATE,
  Visualizer: CookieFeederVisualizer,
  difficulty: 2,
  levelOrder: 8,
  learningGoal: '掌握双排序 + 双指针贪心算法在双序列容量与需求匹配中的核心应用',
});
