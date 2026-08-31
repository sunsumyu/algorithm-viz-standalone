/**
 * 深海声呐·二分探宝雷达 (Binary Search Sonar: Deep Ocean Probe)
 * 经典二分查找算法（LeetCode 704 & LeetCode 35）：
 * 1. 📡 60 FPS 深海声呐雷达引擎 (Canvas 2D 拟真深海海沟、浮标边界、垂直激光探针与水波微粒)
 * 2. ⚡ 对数级区间收缩物理 (每次声呐脉冲折半剔除无效海沟，O(log N) 快速收敛)
 * 3. ⏱️ 步骤二分推演与单步调试 (单步分析 mid 探针位置、大小比较与 [L, R] 边界调整)
 * 4. 🎛️ 经典题库预设 (LeetCode 经典命中、搜索插入位置、大规模深潜海沟、目标不存在与随机海沟)
 * 5. 🔊 原生 Web Audio 引擎深海声呐脉冲、探针回响、宝藏锁定金鸣与通关号角
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  BINARY_SONAR_CODE_LANGUAGES,
  BINARY_SONAR_PROBLEM_HTML,
  BINARY_SONAR_ANALYSIS_HTML,
} from './binary-sonar-problem-content';

export interface TrenchSlot {
  idx: number;
  val: number;
  x: number;
  y: number;
  width: number;
  height: number;
  isInspected: boolean;
  isTarget: boolean;
  isEliminated: boolean;
}

export interface SonarParticle {
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

class SonarAudio {
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

  public static playPing(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime); // High C6 Ping
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  }

  public static playProbe(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.16, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  public static playFound(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C major arpeggio
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.28);
      });
    } catch {}
  }

  public static playMiss(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(180, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
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
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.09);
        osc.stop(ctx.currentTime + idx * 0.09 + 0.3);
      });
    } catch {}
  }
}

export class BinarySonarVisualizer extends StepVisualizer<any> {
  // 核心数据
  private rawArray: number[] = [-1, 0, 3, 5, 9, 12];
  private targetVal = 9;
  private trenchSlots: TrenchSlot[] = [];
  private leftBound = 0;
  private rightBound = 5;
  private midIndex: number | null = null;
  private isFound = false;
  private foundIndex = -1;

  // 探宝与推演状态
  private isAutoPlaying = false;
  private autoPlayTimer: any = null;
  private sonarStepIndex = 0;
  private userPingsCount = 0;
  private optimalPings = 3;
  private playSpeed = 1;

  // 画布与特效
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private lastTimestamp = 0;
  private particles: SonarParticle[] = [];
  private floatingTexts: FloatingText[] = [];
  private radarScanAngle = 0;
  private probePulseAlpha = 0;

  constructor() {
    super();
    this.codeLanguages = BINARY_SONAR_CODE_LANGUAGES;
    this.codeLines = BINARY_SONAR_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '二分查找声呐探针算法引擎';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '深海声呐·二分探宝雷达' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset([-1, 0, 3, 5, 9, 12], 9);
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

  private calculateTheoreticalPings(n: number): number {
    return Math.max(1, Math.ceil(Math.log2(n + 1)));
  }

  private loadPreset(arr: number[], target: number): void {
    this.stopAutoPlay();
    this.rawArray = [...arr].sort((a, b) => a - b);
    this.targetVal = target;
    this.optimalPings = this.calculateTheoreticalPings(this.rawArray.length);

    this.trenchSlots = this.rawArray.map((val, i) => ({
      idx: i,
      val,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      isInspected: false,
      isTarget: val === target,
      isEliminated: false,
    }));

    this.leftBound = 0;
    this.rightBound = this.rawArray.length - 1;
    this.midIndex = null;
    this.isFound = false;
    this.foundIndex = -1;
    this.userPingsCount = 0;
    this.sonarStepIndex = 0;
    this.particles = [];
    this.floatingTexts = [];
    this.probePulseAlpha = 0;

    this.updateHUD();
    this.logNarration(`🌊 海沟就绪！包含 ${this.rawArray.length} 个有序宝藏点，目标为 $T=${this.targetVal}$。理论最优需 $\\le ${this.optimalPings}$ 次声呐脉冲！`);
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#sonar-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.bindCanvasEvents();
    }

    this.mountTerminal({
      codeLanguages: BINARY_SONAR_CODE_LANGUAGES,
      problemHtml: BINARY_SONAR_PROBLEM_HTML,
      analysisHtml: BINARY_SONAR_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 1. 二分单步推演
    const stepBtn = this.root.querySelector('#btn-sonar-step') as HTMLButtonElement | null;
    if (stepBtn) {
      stepBtn.addEventListener('click', () => this.runBinarySingleStep());
    }

    // 2. 二分自动求解
    const autoBtn = this.root.querySelector('#btn-sonar-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) {
          this.stopAutoPlay();
        } else {
          this.startAutoPlay();
        }
      });
    }

    // 3. 预设场景切换
    this.root.querySelectorAll<HTMLButtonElement>('.sonar-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.preset || 'CLASSIC_FOUND';
        this.root?.querySelectorAll('.sonar-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        if (type === 'CLASSIC_FOUND') this.loadPreset([-1, 0, 3, 5, 9, 12], 9);
        else if (type === 'INSERT_POSITION') this.loadPreset([1, 3, 5, 6], 2);
        else if (type === 'LARGE_TRENCH') this.loadPreset([2, 5, 8, 12, 16, 23, 38, 56, 72, 91, 105, 120], 72);
        else if (type === 'NOT_FOUND') this.loadPreset([-1, 0, 3, 5, 9, 12], 2);
        else if (type === 'RANDOM_OCEAN') this.generateRandomOcean();
      });
    });

    // 4. 重置按钮
    const resetBtn = this.root.querySelector('#btn-sonar-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.loadPreset(this.rawArray, this.targetVal));
    }

    // 5. 静音控制
    const muteBtn = this.root.querySelector('#btn-sonar-sound') as HTMLButtonElement | null;
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        SonarAudio.isMuted = !SonarAudio.isMuted;
        muteBtn.textContent = SonarAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private bindCanvasEvents(): void {
    if (!this.canvas) return;

    this.canvas.addEventListener('click', (e) => {
      if (this.isFound) return;
      const rect = this.canvas!.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // 寻找被点击的海沟槽位
      for (let i = 0; i < this.trenchSlots.length; i++) {
        const slot = this.trenchSlots[i];
        if (clickX >= slot.x && clickX <= slot.x + slot.width && clickY >= slot.y && clickY <= slot.y + slot.height) {
          this.handleManualProbe(i);
          break;
        }
      }
    });
  }

  private handleManualProbe(index: number): void {
    this.userPingsCount++;
    const slot = this.trenchSlots[index];
    slot.isInspected = true;
    this.midIndex = index;
    this.probePulseAlpha = 1.0;

    SonarAudio.playPing();
    this.spawnWaterParticles(slot.x + slot.width / 2, slot.y + slot.height / 2, 16);

    if (slot.val === this.targetVal) {
      this.isFound = true;
      this.foundIndex = index;
      SonarAudio.playFound();
      this.spawnFloatingText(slot.x + slot.width / 2, slot.y - 20, `🎯 锁定宝藏! [${index}]`, '#fbbf24');
      this.logNarration(`🏆 探针锁定宝藏！在下标 [${index}] 成功探获数值 ${slot.val}！总共发射了 ${this.userPingsCount} 次声呐脉冲。`);
    } else if (slot.val < this.targetVal) {
      SonarAudio.playMiss();
      this.spawnFloatingText(slot.x + slot.width / 2, slot.y - 20, `▲ 目标在右侧 (> ${slot.val})`, '#38bdf8');
      this.logNarration(`🔍 探测点 [${index}] 数值 ${slot.val} < 目标 ${this.targetVal} $\\implies$ 宝藏位于右半海沟！`);
    } else {
      SonarAudio.playMiss();
      this.spawnFloatingText(slot.x + slot.width / 2, slot.y - 20, `▼ 目标在左侧 (< ${slot.val})`, '#38bdf8');
      this.logNarration(`🔍 探测点 [${index}] 数值 ${slot.val} > 目标 ${this.targetVal} $\\implies$ 宝藏位于左半海沟！`);
    }

    this.updateHUD();
  }

  private runBinarySingleStep(): void {
    if (this.isFound || this.leftBound > this.rightBound) {
      if (this.isFound) {
        this.logNarration(`✨ 二分探测已在下标 [${this.foundIndex}] 成功定位目标！`);
      } else {
        this.logNarration(`🚫 搜索区间为空 (L > R)，海沟中不存在目标宝藏 ${this.targetVal}！`);
      }
      this.stopAutoPlay();
      return;
    }

    this.sonarStepIndex++;
    this.userPingsCount++;

    // 计算防溢出中点
    const mid = this.leftBound + Math.floor((this.rightBound - this.leftBound) / 2);
    this.midIndex = mid;
    this.probePulseAlpha = 1.0;

    const midSlot = this.trenchSlots[mid];
    midSlot.isInspected = true;
    SonarAudio.playProbe();
    this.spawnWaterParticles(midSlot.x + midSlot.width / 2, midSlot.y + midSlot.height / 2, 20);

    if (midSlot.val === this.targetVal) {
      this.isFound = true;
      this.foundIndex = mid;
      SonarAudio.playFound();
      this.spawnFloatingText(midSlot.x + midSlot.width / 2, midSlot.y - 20, `🎯 宝藏捕获! [${mid}]`, '#22c55e');
      this.logNarration(`🎯 [步骤 ${this.sonarStepIndex}] Mid = ${mid} (nums[${mid}]=${midSlot.val}) == Target ${this.targetVal}！探宝成功！🎉`);
      this.stopAutoPlay();
    } else if (midSlot.val < this.targetVal) {
      // 排除左半区
      for (let i = this.leftBound; i <= mid; i++) {
        this.trenchSlots[i].isEliminated = true;
      }
      this.spawnFloatingText(midSlot.x + midSlot.width / 2, midSlot.y - 20, `排除左侧 [${this.leftBound}..${mid}]`, '#ef4444');
      this.logNarration(`📍 [步骤 ${this.sonarStepIndex}] Mid = ${mid} (nums[${mid}]=${midSlot.val}) < ${this.targetVal} $\\implies$ 目标在右半区，更新 L = ${mid + 1}！`);
      this.leftBound = mid + 1;
    } else {
      // 排除右半区
      for (let i = mid; i <= this.rightBound; i++) {
        this.trenchSlots[i].isEliminated = true;
      }
      this.spawnFloatingText(midSlot.x + midSlot.width / 2, midSlot.y - 20, `排除右侧 [${mid}..${this.rightBound}]`, '#ef4444');
      this.logNarration(`📍 [步骤 ${this.sonarStepIndex}] Mid = ${mid} (nums[${mid}]=${midSlot.val}) > ${this.targetVal} $\\implies$ 目标在左半区，更新 R = ${mid - 1}！`);
      this.rightBound = mid - 1;
    }

    this.updateHUD();

    if (this.leftBound > this.rightBound && !this.isFound) {
      this.stopAutoPlay();
      this.logNarration(`⚠️ 区间收缩完毕 (L=${this.leftBound} > R=${this.rightBound})，海沟未探测到目标 $T=${this.targetVal}$ (返回 -1 或插入位置 ${this.leftBound})。`);
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-sonar-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停探宝';

    const step = () => {
      if (!this.isAutoPlaying) return;
      this.runBinarySingleStep();
      if (!this.isFound && this.leftBound <= this.rightBound) {
        this.autoPlayTimer = setTimeout(step, 850 / this.playSpeed);
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
    const playBtn = this.root?.querySelector('#btn-sonar-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动探宝';
  }

  private generateRandomOcean(): void {
    const count = 8 + Math.floor(Math.random() * 5);
    const nums: number[] = [];
    let cur = Math.floor(Math.random() * 5);
    for (let i = 0; i < count; i++) {
      cur += Math.floor(Math.random() * 6) + 1;
      nums.push(cur);
    }
    const pickTarget = Math.random() > 0.3 ? nums[Math.floor(Math.random() * nums.length)] : cur + 3;
    this.loadPreset(nums, pickTarget);
  }

  private spawnWaterParticles(x: number, y: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        size: 2.5 + Math.random() * 3.5,
        alpha: 1.0,
        life: 0,
        maxLife: 30 + Math.random() * 20,
        color: '#38bdf8',
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
    const logBox = this.root.querySelector('#sonar-narration-box') as HTMLElement | null;
    if (logBox) {
      logBox.innerHTML = `💡 ${msg}`;
    }
  }

  private updateHUD(): void {
    if (!this.root) return;

    const targetStatEl = this.root.querySelector('#sonar-stat-target') as HTMLElement | null;
    const pingsStatEl = this.root.querySelector('#sonar-stat-pings') as HTMLElement | null;
    const optimalStatEl = this.root.querySelector('#sonar-stat-optimal') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#sonar-status-badge') as HTMLElement | null;
    const rangeListEl = this.root.querySelector('#sonar-range-slots') as HTMLElement | null;

    if (targetStatEl) targetStatEl.textContent = `${this.targetVal}`;
    if (pingsStatEl) pingsStatEl.textContent = `${this.userPingsCount}`;
    if (optimalStatEl) optimalStatEl.textContent = `≤ ${this.optimalPings}`;

    if (statusBadge) {
      if (this.isFound) {
        statusBadge.textContent = '🎯 宝藏已锁定';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else if (this.leftBound > this.rightBound) {
        statusBadge.textContent = '⚠️ 目标不存在';
        statusBadge.style.background = '#fef2f2';
        statusBadge.style.color = '#ef4444';
      } else {
        statusBadge.textContent = `📡 探测中 [L:${this.leftBound}, R:${this.rightBound}]`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (rangeListEl) {
      rangeListEl.innerHTML = this.rawArray
        .map((num, idx) => {
          const isL = idx === this.leftBound;
          const isR = idx === this.rightBound;
          const isMid = idx === this.midIndex;
          const isOut = idx < this.leftBound || idx > this.rightBound;

          let badge = '';
          if (isL && isR) badge = '<span style="color:#ec4899;font-weight:bold;">L=R</span>';
          else if (isL) badge = '<span style="color:#0284c7;font-weight:bold;">L</span>';
          else if (isR) badge = '<span style="color:#d97706;font-weight:bold;">R</span>';
          if (isMid) badge += '<span style="color:#10b981;font-weight:bold;margin-left:2px;">Mid</span>';

          const bg = isMid ? '#dbeafe' : isOut ? '#f1f5f9' : '#ffffff';
          const borderColor = isMid ? '#2563eb' : isOut ? '#e2e8f0' : '#94a3b8';
          const opacity = isOut ? 'opacity: 0.4;' : '';

          return `
          <div style="display: flex; flex-direction: column; align-items: center; padding: 2px 5px; border-radius: 6px; border: 1px solid ${borderColor}; background: ${bg}; min-width: 44px; ${opacity}">
            <span style="font-size: 8.5px; height: 12px;">${badge}</span>
            <span style="font-size: 11px; font-weight: 800; color: #0f172a; font-family: monospace;">${num}</span>
            <span style="font-size: 8.5px; color: #64748b;">[${idx}]</span>
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
    this.radarScanAngle += dt * 0.003;
    if (this.probePulseAlpha > 0) {
      this.probePulseAlpha = Math.max(0, this.probePulseAlpha - dt * 0.003);
    }

    // 粒子物理
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;
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
    const count = this.trenchSlots.length;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. 深海海沟渐变背景
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
    oceanGrad.addColorStop(0, '#020617');
    oceanGrad.addColorStop(0.5, '#071630');
    oceanGrad.addColorStop(1, '#0b2347');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. 水面潜艇与声呐雷达波束
    const subX = width / 2;
    const subY = 22;

    // 潜艇外壳
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(subX, subY, 26, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 潜艇指挥塔
    ctx.fillRect(subX - 5, subY - 12, 10, 6);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(subX, subY - 12);
    ctx.lineTo(subX, subY - 18);
    ctx.stroke();

    // 声呐雷达锥形扫描光晕
    ctx.save();
    const coneGrad = ctx.createRadialGradient(subX, subY, 10, subX, subY, height);
    coneGrad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
    coneGrad.addColorStop(1, 'rgba(56, 189, 248, 0.01)');
    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(subX, subY);
    ctx.arc(subX, subY, height - 30, Math.PI / 4, (3 * Math.PI) / 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 3. 计算海沟宝藏槽位排布
    const paddingX = 20;
    const availableW = width - paddingX * 2;
    const slotW = Math.min(52, (availableW - (count - 1) * 8) / count);
    const spacing = count > 1 ? (availableW - count * slotW) / (count - 1) : 0;
    const trenchY = height - 55;

    this.trenchSlots.forEach((slot, i) => {
      slot.width = slotW;
      slot.height = 36;
      slot.x = paddingX + i * (slotW + spacing);
      slot.y = trenchY;
    });

    // 4. 绘制排除区域的暗影遮罩
    if (this.leftBound > 0) {
      const leftEnd = this.trenchSlots[this.leftBound].x;
      ctx.fillStyle = 'rgba(2, 6, 23, 0.65)';
      ctx.fillRect(0, 40, leftEnd - 4, height - 40);
    }
    if (this.rightBound < count - 1) {
      const rightStart = this.trenchSlots[this.rightBound].x + slotW;
      ctx.fillStyle = 'rgba(2, 6, 23, 0.65)';
      ctx.fillRect(rightStart + 4, 40, width - rightStart, height - 40);
    }

    // 5. 绘制中点探针光束
    if (this.midIndex !== null && this.midIndex >= 0 && this.midIndex < count) {
      const midSlot = this.trenchSlots[this.midIndex];
      const mx = midSlot.x + slotW / 2;

      ctx.save();
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + this.probePulseAlpha * 0.6})`;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(subX, subY + 5);
      ctx.lineTo(mx, trenchY);
      ctx.stroke();

      // 探针触地水波光环
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      ctx.ellipse(mx, trenchY + 18, 18 * (1 + this.probePulseAlpha), 6 * (1 + this.probePulseAlpha), 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 6. 绘制左右浮标指示器
    if (this.leftBound <= this.rightBound && this.leftBound < count && this.rightBound < count) {
      const lSlot = this.trenchSlots[this.leftBound];
      const rSlot = this.trenchSlots[this.rightBound];

      // Left 浮标
      ctx.save();
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#0284c7';
      ctx.textAlign = 'center';
      ctx.fillText('⚓ L', lSlot.x + slotW / 2, trenchY - 14);
      ctx.strokeStyle = '#0284c7';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(lSlot.x + slotW / 2, trenchY - 10);
      ctx.lineTo(lSlot.x + slotW / 2, trenchY);
      ctx.stroke();

      // Right 浮标
      ctx.fillStyle = '#d97706';
      ctx.fillText('⚓ R', rSlot.x + slotW / 2, trenchY - 14);
      ctx.strokeStyle = '#d97706';
      ctx.beginPath();
      ctx.moveTo(rSlot.x + slotW / 2, trenchY - 10);
      ctx.lineTo(rSlot.x + slotW / 2, trenchY);
      ctx.stroke();
      ctx.restore();
    }

    // 7. 绘制宝藏槽位
    this.trenchSlots.forEach((slot) => {
      ctx.save();

      const isMid = slot.idx === this.midIndex;
      const isElim = slot.isEliminated;

      if (slot.idx === this.foundIndex) {
        ctx.fillStyle = '#065f46'; // 命中高亮绿
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 12;
      } else if (isMid) {
        ctx.fillStyle = '#1e3a8a';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
      } else if (isElim) {
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.2;
      }

      ctx.beginPath();
      ctx.roundRect(slot.x, slot.y, slot.width, slot.height, 6);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 宝藏数值
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = slot.idx === this.foundIndex ? '#fef08a' : isElim ? '#475569' : '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${slot.val}`, slot.x + slot.width / 2, slot.y + slot.height / 2);

      // 下标小标签
      ctx.font = '9px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`[${slot.idx}]`, slot.x + slot.width / 2, slot.y + slot.height + 11);

      ctx.restore();
    });

    // 8. 水波微粒
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

export const BINARY_SONAR_TEMPLATE = `
  <div id="algo-binary-sonar-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏：海沟预设与控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">📡</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">深海声呐·二分探宝雷达</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="sonar-preset-btn active" data-preset="CLASSIC_FOUND" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典命中 T=9</button>
          <button class="sonar-preset-btn" data-preset="INSERT_POSITION" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">插入位置 T=2</button>
          <button class="sonar-preset-btn" data-preset="LARGE_TRENCH" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">🌊 大规模深海海沟</button>
          <button class="sonar-preset-btn" data-preset="NOT_FOUND" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">目标缺失 T=2</button>
          <button class="sonar-preset-btn" data-preset="RANDOM_OCEAN" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">🎲 随机海沟</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="sonar-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">📡 声呐就绪</span>
        <button id="btn-sonar-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步二分</button>
        <button id="btn-sonar-autoplay" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(59,130,246,0.25);">▶️ 自动探宝</button>
        <button id="btn-sonar-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-sonar-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条与统计 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #1e40af;">
      <div style="display: flex; gap: 14px; align-items: center;">
        <span>🎯 探宝目标: <b id="sonar-stat-target" style="color: #2563eb; font-size: 12px;">9</b></span>
        <span>📡 已发射脉冲: <b id="sonar-stat-pings" style="color: #059669; font-size: 12px;">0</b></span>
        <span>⭐ 理论对数步数: <b id="sonar-stat-optimal" style="color: #d97706; font-size: 12px;">≤ 3</b></span>
      </div>
      <div id="sonar-narration-box" style="font-weight: 700; color: #1e3a8a;">
        💡 点击海沟宝箱进行声呐探测，或点击自动探宝观察 [L, R] 边界折半收缩！
      </div>
    </div>

    <!-- 主交互区：左侧 Canvas + 区间边界条，右侧终端 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.35fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：深海海沟 Canvas 与区间槽位 -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <!-- Canvas 容器 -->
        <div style="position: relative; display: flex; justify-content: center; background: #020617; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="sonar-canvas" width="460" height="180" style="width: 460px; height: 180px; cursor: pointer;"></canvas>
        </div>

        <!-- 实时 [L, Mid, R] 边界槽位 -->
        <div style="display: flex; flex-direction: column; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; gap: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 11px; font-weight: 700; color: #334155;">📍 实时海沟搜索区间 [Left, Right] (中点 Mid = L + (R - L) / 2)</span>
          </div>
          <div id="sonar-range-slots" style="display: flex; gap: 6px; flex-wrap: wrap;"></div>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          💡 严格单调递增序列，每次判定直接排除半区海沟，实现 O(log N) 极速收敛！
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="sonar-terminal-mount" style="flex: 1; min-height: 220px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'binary-sonar',
  name: '深海声呐·二分探宝雷达',
  viewId: 'algo-binary-sonar-view',
  category: 'game',
  description: '二分查找探宝算法游戏：60 FPS 深海声呐扫描、左右区间折半缩减、中点探针雷达与对数复杂度探宝',
  icon: '📡',
  template: BINARY_SONAR_TEMPLATE,
  Visualizer: BinarySonarVisualizer,
  difficulty: 1,
  levelOrder: 19,
  learningGoal: '掌握二分查找经典双指针边界收缩（left <= right 与 left < right 循环不变量）、中点防溢出计算与 O(log N) 探宝机制',
});
