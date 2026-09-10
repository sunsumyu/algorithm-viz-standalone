/**
 * 穿云神箭·极光引爆重叠气球 (Arrow Balloon Sniper: Greedy Interval Burst)
 * 经典贪心区间选点算法（LeetCode 452 & LeetCode 435）：
 * 1. 🎯 60 FPS 极光穿透射击引擎 (Canvas 2D 拟真霓虹气球浮动、X轴激光导轨、垂直贯穿极光与粒子碎裂爆破)
 * 2. ⚡ 动态区间选点物理 (按右端点升序排序 -> 贪心逼近最右端 -> 单发极光穿透所有重叠气球)
 * 3. ⏱️ 步骤贪心推演与单步调试 (单步分析气球区间交集判定、激光覆盖范围与新箭触发决策)
 * 4. 🎛️ 经典题库预设 (LeetCode 经典交错、密集重叠群、零交集链条、大小嵌套与自定义随机靶场)
 * 5. 🔊 原生 Web Audio 引擎激光蓄力、贯穿爆炸、连击和弦与通关礼炮
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  ARROW_BALLOON_CODE_LANGUAGES,
  ARROW_BALLOON_PROBLEM_HTML,
  ARROW_BALLOON_ANALYSIS_HTML,
} from './arrow-balloon-problem-content';

export interface BalloonItem {
  id: number;
  start: number;
  end: number;
  color: string;
  isPopped: boolean;
  poppedByArrow?: number;
  yOffset: number; // 悬浮 Y 轴偏移
  floatPhase: number; // 浮动正弦相位
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
}

export interface LaserShot {
  x: number;
  alpha: number;
  hitBalloonsCount: number;
}

class ArrowBalloonAudio {
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

  public static playAim(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(450, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }

  public static playLaser(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {}
  }

  public static playPop(combo: number = 1): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const baseFreq = 420 + Math.min(combo, 6) * 110;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  public static playCombo(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const chord = [523.25, 659.25, 783.99, 1046.5]; // C5 - E5 - G5 - C6
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.06 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.22);
      });
    } catch {}
  }

  public static playWin(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
        gain.gain.setValueAtTime(0.16, ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.09 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.09);
        osc.stop(ctx.currentTime + idx * 0.09 + 0.28);
      });
    } catch {}
  }
}

export class ArrowBalloonVisualizer extends StepVisualizer<any> {
  // 核心数据
  private rawPoints: [number, number][] = [[10, 16], [2, 8], [1, 6], [7, 12]];
  private balloons: BalloonItem[] = [];
  private currentAimX = 6;
  private arrowsFired: { x: number; count: number }[] = [];
  private totalArrowsCount = 0;
  private optimalArrowsCount = 2;

  // 求解与调试状态
  private isAutoPlaying = false;
  private autoPlayTimer: any = null;
  private autoStepIndex = 0;
  private greedyArrowPos = -1;
  private playSpeed = 1;

  // 画布与动画
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private lastTimestamp = 0;
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private activeLasers: LaserShot[] = [];
  private screenShake = 0;

  // 坐标系常量
  private maxCoord = 24;

  constructor() {
    super();
    this.codeLanguages = ARROW_BALLOON_CODE_LANGUAGES;
    this.codeLines = ARROW_BALLOON_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '穿云神箭贪心算法执行引擎';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '穿云神箭·激光引爆重叠气球' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset([[10, 16], [2, 8], [1, 6], [7, 12]]);
    this.initGameUI();
    this.startLoop();
  }

  public destroy(): void {
    super.destroy();
    this.stopAutoPlay();
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
    }
    if (this.animFrameId && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private calculateOptimalArrows(points: [number, number][]): number {
    if (points.length === 0) return 0;
    const sorted = [...points].sort((a, b) => a[1] - b[1]);
    let count = 1;
    let arrowPos = sorted[0][1];
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i][0] > arrowPos) {
        count++;
        arrowPos = sorted[i][1];
      }
    }
    return count;
  }

  private loadPreset(points: [number, number][]): void {
    this.stopAutoPlay();
    this.rawPoints = points;
    this.optimalArrowsCount = this.calculateOptimalArrows(points);

    const colors = ['#38bdf8', '#ec4899', '#a855f7', '#f59e0b', '#10b981', '#6366f1', '#f43f5e', '#06b6d4'];
    this.balloons = points.map((pt, i) => ({
      id: i + 1,
      start: pt[0],
      end: pt[1],
      color: colors[i % colors.length],
      isPopped: false,
      yOffset: 30 + ((i * 37) % 110),
      floatPhase: (i * 1.3) % (Math.PI * 2),
    }));

    this.arrowsFired = [];
    this.totalArrowsCount = 0;
    this.autoStepIndex = 0;
    this.greedyArrowPos = -1;
    this.currentAimX = this.balloons.length > 0 ? this.balloons[0].end : 6;
    this.particles = [];
    this.floatingTexts = [];
    this.activeLasers = [];

    this.updateHUD();
    this.logNarration(`🎯 靶场已装填 ${this.balloons.length} 个气球，理论最优解需 ${this.optimalArrowsCount} 支箭！移动准星并射击。`);
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#arrow-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.bindCanvasEvents();
    }

    this.mountTerminal({
      codeLanguages: ARROW_BALLOON_CODE_LANGUAGES,
      problemHtml: ARROW_BALLOON_PROBLEM_HTML,
      analysisHtml: ARROW_BALLOON_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 1. 发射按钮
    const shootBtn = this.root.querySelector('#btn-arrow-shoot') as HTMLButtonElement | null;
    if (shootBtn) {
      shootBtn.addEventListener('click', () => this.shootArrowAt(this.currentAimX));
    }

    // 2. 瞄准滑动条
    const aimSlider = this.root.querySelector('#arrow-aim-slider') as HTMLInputElement | null;
    if (aimSlider) {
      aimSlider.addEventListener('input', () => {
        this.currentAimX = parseFloat(aimSlider.value);
        ArrowBalloonAudio.playAim();
        this.updateAimDisplay();
      });
    }

    // 3. 微调按钮
    const aimLeftBtn = this.root.querySelector('#btn-aim-left') as HTMLButtonElement | null;
    const aimRightBtn = this.root.querySelector('#btn-aim-right') as HTMLButtonElement | null;
    if (aimLeftBtn) {
      aimLeftBtn.addEventListener('click', () => {
        this.currentAimX = Math.max(0, this.currentAimX - 0.5);
        this.syncSlider();
        ArrowBalloonAudio.playAim();
      });
    }
    if (aimRightBtn) {
      aimRightBtn.addEventListener('click', () => {
        this.currentAimX = Math.min(this.maxCoord, this.currentAimX + 0.5);
        this.syncSlider();
        ArrowBalloonAudio.playAim();
      });
    }

    // 4. 贪心排序按钮
    const sortBtn = this.root.querySelector('#btn-greedy-sort') as HTMLButtonElement | null;
    if (sortBtn) {
      sortBtn.addEventListener('click', () => {
        this.balloons.sort((a, b) => a.end - b.end);
        // 重新分配 Y 轴，展现整齐阶梯感
        this.balloons.forEach((b, idx) => {
          b.yOffset = 25 + (idx * 28) % 130;
        });
        ArrowBalloonAudio.playAim();
        this.logNarration(`⚡ 核心贪心第一步：所有气球已按右端点（End Coordinate）升序排序！优先锁定最先结束的目标。`);
        this.updateHUD();
      });
    }

    // 5. 贪心单步推演按钮
    const stepBtn = this.root.querySelector('#btn-greedy-step') as HTMLButtonElement | null;
    if (stepBtn) {
      stepBtn.addEventListener('click', () => this.runGreedySingleStep());
    }

    // 6. 贪心自动求解与连播
    const autoPlayBtn = this.root.querySelector('#btn-greedy-autoplay') as HTMLButtonElement | null;
    if (autoPlayBtn) {
      autoPlayBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) {
          this.stopAutoPlay();
        } else {
          this.startAutoPlay();
        }
      });
    }

    // 7. 预设关卡切换
    this.root.querySelectorAll<HTMLButtonElement>('.arrow-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.preset || 'CLASSIC';
        this.root?.querySelectorAll('.arrow-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        if (type === 'CLASSIC') this.loadPreset([[10, 16], [2, 8], [1, 6], [7, 12]]);
        else if (type === 'CLUSTER') this.loadPreset([[1, 6], [2, 8], [3, 7], [10, 15], [12, 17], [11, 16], [18, 22]]);
        else if (type === 'CHAIN') this.loadPreset([[1, 3], [5, 7], [9, 11], [13, 15], [17, 19]]);
        else if (type === 'NESTED') this.loadPreset([[1, 12], [2, 5], [3, 4], [14, 22], [15, 18], [16, 17]]);
        else if (type === 'RANDOM') this.generateRandomLevel();
      });
    });

    // 8. 重置关卡
    const resetBtn = this.root.querySelector('#btn-arrow-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.loadPreset(this.rawPoints));
    }

    // 9. 静音控制
    const muteBtn = this.root.querySelector('#btn-arrow-sound') as HTMLButtonElement | null;
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        ArrowBalloonAudio.isMuted = !ArrowBalloonAudio.isMuted;
        muteBtn.textContent = ArrowBalloonAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }

    // 10. 键盘快捷键 (空格发射，左右方向键瞄准)
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
    }
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (!this.root || !this.root.isConnected) return;
    if (e.code === 'Space') {
      e.preventDefault();
      this.shootArrowAt(this.currentAimX);
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      this.currentAimX = Math.max(0, this.currentAimX - 0.5);
      this.syncSlider();
      ArrowBalloonAudio.playAim();
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      this.currentAimX = Math.min(this.maxCoord, this.currentAimX + 0.5);
      this.syncSlider();
      ArrowBalloonAudio.playAim();
    }
  };

  private bindCanvasEvents(): void {
    if (!this.canvas) return;

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas!.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const scaleX = (this.canvas!.width - 50) / this.maxCoord;
      const targetCoord = Math.max(0, Math.min(this.maxCoord, Math.round(((mouseX - 25) / scaleX) * 2) / 2));
      if (Math.abs(this.currentAimX - targetCoord) >= 0.5) {
        this.currentAimX = targetCoord;
        this.syncSlider();
        ArrowBalloonAudio.playAim();
      }
    });

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas!.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const scaleX = (this.canvas!.width - 50) / this.maxCoord;
      const targetCoord = Math.max(0, Math.min(this.maxCoord, Math.round(((mouseX - 25) / scaleX) * 2) / 2));
      this.currentAimX = targetCoord;
      this.syncSlider();
      this.shootArrowAt(this.currentAimX);
    });
  }

  private syncSlider(): void {
    if (!this.root) return;
    const slider = this.root.querySelector('#arrow-aim-slider') as HTMLInputElement | null;
    if (slider) slider.value = this.currentAimX.toString();
    this.updateAimDisplay();
  }

  private updateAimDisplay(): void {
    if (!this.root) return;
    const disp = this.root.querySelector('#arrow-aim-val') as HTMLElement | null;
    if (disp) disp.textContent = `X = ${this.currentAimX.toFixed(1)}`;
  }

  private shootArrowAt(x: number): void {
    this.totalArrowsCount++;
    this.arrowsFired.push({ x, count: this.totalArrowsCount });
    this.screenShake = 6;

    ArrowBalloonAudio.playLaser();

    // 判定引爆的气球
    let hitCount = 0;
    const unpopped = this.balloons.filter((b) => !b.isPopped);

    this.balloons.forEach((b) => {
      if (!b.isPopped && x >= b.start && x <= b.end) {
        b.isPopped = true;
        b.poppedByArrow = this.totalArrowsCount;
        hitCount++;
        this.spawnBalloonParticles(b, x);
      }
    });

    this.activeLasers.push({ x, alpha: 1.0, hitBalloonsCount: hitCount });

    if (hitCount > 0) {
      if (hitCount >= 3) {
        ArrowBalloonAudio.playCombo();
        this.spawnFloatingText(x, 80, `💥 COMBO x${hitCount}!`, '#f43f5e');
      } else {
        ArrowBalloonAudio.playPop(hitCount);
        this.spawnFloatingText(x, 90, `🎯 击中 ${hitCount} 个气球!`, '#38bdf8');
      }
      this.logNarration(`🚀 第 ${this.totalArrowsCount} 支箭在 X=${x.toFixed(1)} 发射，贯穿并引爆了 ${hitCount} 个重叠气球！`);
    } else {
      this.spawnFloatingText(x, 120, 'MISS', '#94a3b8');
      this.logNarration(`💨 第 ${this.totalArrowsCount} 支箭在 X=${x.toFixed(1)} 发射，未命中任何气球。`);
    }

    const remaining = this.balloons.filter((b) => !b.isPopped).length;
    if (remaining === 0) {
      this.handleVictory();
    }

    this.updateHUD();
  }

  private spawnBalloonParticles(balloon: BalloonItem, hitX: number): void {
    if (!this.canvas) return;
    const scaleX = (this.canvas.width - 50) / this.maxCoord;
    const px = 25 + hitX * scaleX;
    const py = balloon.yOffset;

    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      this.particles.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        color: balloon.color,
        size: 2.5 + Math.random() * 3.5,
        alpha: 1.0,
        life: 0,
        maxLife: 30 + Math.random() * 20,
      });
    }
  }

  private spawnFloatingText(coordX: number, screenY: number, text: string, color: string): void {
    if (!this.canvas) return;
    const scaleX = (this.canvas.width - 50) / this.maxCoord;
    const px = 25 + coordX * scaleX;
    this.floatingTexts.push({
      x: px,
      y: screenY,
      text,
      color,
      alpha: 1.0,
      life: 0,
    });
  }

  private handleVictory(): void {
    ArrowBalloonAudio.playWin();
    const isOptimal = this.totalArrowsCount === this.optimalArrowsCount;
    const msg = isOptimal
      ? `🏆 完美通关！你使用了 ${this.totalArrowsCount} 支箭，达到了贪心理论极限！⭐⭐⭐`
      : `🎉 靶场全清！你使用了 ${this.totalArrowsCount} 支箭（理论最优只需 ${this.optimalArrowsCount} 支箭，可点击贪心单步推演复盘）。`;
    this.logNarration(msg);
  }

  private runGreedySingleStep(): void {
    // 确保排序
    this.balloons.sort((a, b) => a.end - b.end);

    if (this.autoStepIndex === 0) {
      // 第一步：锁定第一个气球的右端点并射击
      const first = this.balloons[0];
      this.greedyArrowPos = first.end;
      this.currentAimX = this.greedyArrowPos;
      this.syncSlider();
      this.shootArrowAt(this.greedyArrowPos);
      this.logNarration(`📍 [贪心步骤 1] 锁定首个气球 #${first.id} [${first.start}, ${first.end}] 的最右端 X=${first.end} 射出第 1 支箭！`);
      this.autoStepIndex = 1;
      return;
    }

    if (this.autoStepIndex >= this.balloons.length) {
      this.logNarration(`✨ 贪心推演已完成所有气球的扫描判定！共计使用 ${this.totalArrowsCount} 支箭。`);
      this.stopAutoPlay();
      return;
    }

    const cur = this.balloons[this.autoStepIndex];
    if (cur.start <= this.greedyArrowPos) {
      this.logNarration(`🔍 [气球 #${cur.id} [${cur.start}, ${cur.end}]] 左端点 ${cur.start} <= 当前激光位置 ${this.greedyArrowPos}，已被前一支箭一并引爆！无需加箭。`);
    } else {
      // 超出范围，必须加箭
      this.greedyArrowPos = cur.end;
      this.currentAimX = this.greedyArrowPos;
      this.syncSlider();
      this.shootArrowAt(this.greedyArrowPos);
      this.logNarration(`⚡ [气球 #${cur.id} [${cur.start}, ${cur.end}]] 左端点 ${cur.start} > 上次激光位置，已超出覆盖！在 X=${cur.end} 贪心射出新箭！`);
    }

    this.autoStepIndex++;
    if (this.autoStepIndex >= this.balloons.length) {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-greedy-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停求解';

    const step = () => {
      if (!this.isAutoPlaying) return;
      this.runGreedySingleStep();
      if (this.autoStepIndex < this.balloons.length) {
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
    const playBtn = this.root?.querySelector('#btn-greedy-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动推演';
  }

  private generateRandomLevel(): void {
    const count = 7 + Math.floor(Math.random() * 5);
    const pts: [number, number][] = [];
    for (let i = 0; i < count; i++) {
      const s = Math.floor(Math.random() * 16) + 1;
      const len = Math.floor(Math.random() * 5) + 2;
      pts.push([s, Math.min(this.maxCoord - 1, s + len)]);
    }
    this.loadPreset(pts);
  }

  private logNarration(msg: string): void {
    if (!this.root) return;
    const logBox = this.root.querySelector('#arrow-narration-box') as HTMLElement | null;
    if (logBox) {
      logBox.innerHTML = `💡 ${msg}`;
    }
  }

  private updateHUD(): void {
    if (!this.root) return;

    const remaining = this.balloons.filter((b) => !b.isPopped).length;
    const total = this.balloons.length;

    const statCountEl = this.root.querySelector('#arrow-stat-count') as HTMLElement | null;
    const statBalloonsEl = this.root.querySelector('#arrow-stat-balloons') as HTMLElement | null;
    const statOptimalEl = this.root.querySelector('#arrow-stat-optimal') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#arrow-status-badge') as HTMLElement | null;

    if (statCountEl) statCountEl.textContent = this.totalArrowsCount.toString();
    if (statBalloonsEl) statBalloonsEl.textContent = `${total - remaining} / ${total}`;
    if (statOptimalEl) statOptimalEl.textContent = this.optimalArrowsCount.toString();

    if (statusBadge) {
      if (remaining === 0) {
        if (this.totalArrowsCount === this.optimalArrowsCount) {
          statusBadge.textContent = '🌟 完美贪心通关';
          statusBadge.style.background = '#f0fdf4';
          statusBadge.style.color = '#16a34a';
        } else {
          statusBadge.textContent = '🎯 靶场清除完毕';
          statusBadge.style.background = '#eff6ff';
          statusBadge.style.color = '#2563eb';
        }
      } else {
        statusBadge.textContent = `🎯 剩余 ${remaining} 个目标`;
        statusBadge.style.background = '#f8fafc';
        statusBadge.style.color = '#475569';
      }
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
    // 气球浮动
    this.balloons.forEach((b) => {
      b.floatPhase += dt * 0.0025;
    });

    // 震屏减退
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 0.03);
    }

    // 粒子物理
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12; // 重力
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // 浮动文字
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life++;
      ft.y -= 0.8;
      ft.alpha = Math.max(0, 1 - ft.life / 40);
      if (ft.life >= 40) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // 激光淡出
    for (let i = this.activeLasers.length - 1; i >= 0; i--) {
      const ls = this.activeLasers[i];
      ls.alpha -= dt * 0.0035;
      if (ls.alpha <= 0) {
        this.activeLasers.splice(i, 1);
      }
    }
  }

  private renderCanvas(): void {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const scaleX = (width - 50) / this.maxCoord;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 震屏位移
    if (this.screenShake > 0) {
      const sx = (Math.random() - 0.5) * this.screenShake;
      const sy = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(sx, sy);
    }

    // 1. 深空渐变背景与星尘
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0b0f19');
    bgGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. 坐标网格竖线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= this.maxCoord; x += 2) {
      const px = 25 + x * scaleX;
      ctx.beginPath();
      ctx.moveTo(px, 15);
      ctx.lineTo(px, height - 35);
      ctx.stroke();
    }

    // 3. X 轴导轨与刻度
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(25, height - 35);
    ctx.lineTo(width - 25, height - 35);
    ctx.stroke();

    for (let x = 0; x <= this.maxCoord; x += 2) {
      const px = 25 + x * scaleX;
      ctx.beginPath();
      ctx.moveTo(px, height - 35);
      ctx.lineTo(px, height - 30);
      ctx.stroke();

      ctx.font = '9.5px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText(`${x}`, px, height - 18);
    }

    // 4. 绘制所有已发射的历史激光标记
    this.arrowsFired.forEach((arrow) => {
      const ax = 25 + arrow.x * scaleX;
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(ax, 15);
      ctx.lineTo(ax, height - 35);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`🏹#${arrow.count}`, ax, height - 40);
      ctx.restore();
    });

    // 5. 绘制气球
    this.balloons.forEach((b) => {
      if (b.isPopped) return;

      const sx = 25 + b.start * scaleX;
      const ex = 25 + b.end * scaleX;
      const spanW = Math.max(16, ex - sx);
      const floatY = b.yOffset + Math.sin(b.floatPhase) * 4;

      ctx.save();
      // 气球悬挂引线
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx + spanW / 2, floatY + 12);
      ctx.lineTo(sx + spanW / 2, floatY + 22);
      ctx.stroke();

      // 气球主体发光胶囊
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.roundRect(sx, floatY - 11, spanW, 22, 11);
      ctx.fill();

      // 气球顶部高光
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.roundRect(sx + 3, floatY - 9, Math.max(8, spanW - 6), 5, 2.5);
      ctx.fill();

      // 气球边框
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 气球区间文字
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(`🎈#${b.id} [${b.start}, ${b.end}]`, sx + spanW / 2, floatY);

      // 端点辅助标线
      ctx.strokeStyle = `${b.color}44`;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(sx, floatY + 11);
      ctx.lineTo(sx, height - 35);
      ctx.moveTo(ex, floatY + 11);
      ctx.lineTo(ex, height - 35);
      ctx.stroke();

      ctx.restore();
    });

    // 6. 活跃激光爆发特效
    this.activeLasers.forEach((ls) => {
      const lx = 25 + ls.x * scaleX;
      ctx.save();
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 20 * ls.alpha;

      // 激光外晕
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.7 * ls.alpha})`;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(lx, 10);
      ctx.lineTo(lx, height - 35);
      ctx.stroke();

      // 激光白芯
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.95 * ls.alpha})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(lx, 10);
      ctx.lineTo(lx, height - 35);
      ctx.stroke();
      ctx.restore();
    });

    // 7. 当前瞄准准星与发射器
    const aimPx = 25 + this.currentAimX * scaleX;
    ctx.save();
    // 瞄准引导虚线
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.7)';
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(aimPx, 15);
    ctx.lineTo(aimPx, height - 35);
    ctx.stroke();

    // 顶部十字准心
    ctx.setLineDash([]);
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(aimPx, 20, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(aimPx - 9, 20);
    ctx.lineTo(aimPx + 9, 20);
    ctx.moveTo(aimPx, 11);
    ctx.lineTo(aimPx, 29);
    ctx.stroke();

    // 底部极光发射炮台
    ctx.fillStyle = '#ec4899';
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(aimPx - 8, height - 25);
    ctx.lineTo(aimPx + 8, height - 25);
    ctx.lineTo(aimPx, height - 35);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 8. 爆炸粒子
    this.particles.forEach((p) => {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 9. 浮动文字
    this.floatingTexts.forEach((ft) => {
      ctx.save();
      ctx.font = 'bold 12px monospace';
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

export const ARROW_BALLOON_TEMPLATE = `
  <div id="algo-arrow-balloon-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏：预设关卡与控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🎯</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">穿云神箭·激光引爆重叠气球</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="arrow-preset-btn active" data-preset="CLASSIC" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典交错</button>
          <button class="arrow-preset-btn" data-preset="CLUSTER" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">密集重叠群</button>
          <button class="arrow-preset-btn" data-preset="CHAIN" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">零交集链条</button>
          <button class="arrow-preset-btn" data-preset="NESTED" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">大小嵌套</button>
          <button class="arrow-preset-btn" data-preset="RANDOM" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">🎲 随机靶场</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="arrow-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">🎯 靶场就绪</span>
        <button id="btn-greedy-sort" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">1. 贪心右端点排序</button>
        <button id="btn-greedy-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-greedy-autoplay" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(59,130,246,0.25);">▶️ 自动推演</button>
        <button id="btn-arrow-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-arrow-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条与统计 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #1e40af;">
      <div style="display: flex; gap: 14px; align-items: center;">
        <span>🎯 已射箭数: <b id="arrow-stat-count" style="color: #2563eb; font-size: 12px;">0</b></span>
        <span>🎈 已引爆气球: <b id="arrow-stat-balloons" style="color: #059669; font-size: 12px;">0 / 4</b></span>
        <span>⭐ 理论最少箭数: <b id="arrow-stat-optimal" style="color: #d97706; font-size: 12px;">2</b></span>
      </div>
      <div id="arrow-narration-box" style="font-weight: 700; color: #1e3a8a;">
        💡 移动准星到气球区间并在 X 坐标发射极光神箭，用最少数量的箭引爆所有目标！
      </div>
    </div>

    <!-- 主交互区：左侧 Canvas + 瞄准面板，右侧终端 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.35fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：靶场 Canvas 与射击控制台 -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <!-- Canvas 容器 -->
        <div style="position: relative; display: flex; justify-content: center; background: #0b0f19; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="arrow-canvas" width="460" height="200" style="width: 460px; height: 200px; cursor: crosshair;"></canvas>
        </div>

        <!-- 极光发射控制台 -->
        <div style="display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 6px; flex: 1;">
            <button id="btn-aim-left" style="padding: 2px 6px; font-size: 11px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff; cursor: pointer;">◀ -0.5</button>
            <input id="arrow-aim-slider" type="range" min="0" max="24" step="0.5" value="6" style="flex: 1; accent-color: #ec4899; cursor: pointer;" />
            <button id="btn-aim-right" style="padding: 2px 6px; font-size: 11px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff; cursor: pointer;">+0.5 ▶</button>
            <span id="arrow-aim-val" style="font-family: monospace; font-size: 11.5px; font-weight: 800; color: #ec4899; min-width: 55px; text-align: center;">X = 6.0</span>
          </div>

          <button id="btn-arrow-shoot" style="background: linear-gradient(135deg, #ec4899, #be185d); color: #ffffff; border: none; border-radius: 6px; padding: 5px 14px; font-size: 12px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 8px rgba(236,72,153,0.35);">🏹 发射极光神箭 (Space)</button>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          💡 支持鼠标悬浮定位、按左右方向键微调准星、点击画布或按空格直接射击！
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="arrow-terminal-mount" style="flex: 1; min-height: 220px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'arrow-balloon',
  name: '穿云神箭·极光引爆重叠气球',
  viewId: 'algo-arrow-balloon-view',
  category: 'game',
  description: '极光穿透射击贪心算法游戏：60 FPS 悬浮霓虹气球、X轴激光重叠引爆、贪心右边界排序与一键神箭破敌',
  icon: '🎯',
  template: ARROW_BALLOON_TEMPLATE,
  Visualizer: ArrowBalloonVisualizer,
  difficulty: 2,
  levelOrder: 16,
  learningGoal: '掌握贪心区间选点与无重叠区间核心思想：按右端点升序排序、射点贪心逼近局部重叠右界以覆盖最大区间群',
});
