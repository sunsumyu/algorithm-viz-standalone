/**
 * 熔岩跑酷·单调栈跳跃者 (Monotonic Stack Lava Parkour)
 * 沉浸式 60 FPS 物理跑酷、单调栈推演与动态熔岩躲避：
 * 1. 🏃‍♂️ 60 FPS 抛物线跳跃与熔岩物理 (按空格键沿单调栈求解的绿色弧线向右侧下一个更高石柱飞跃)
 * 2. 🌋 实时上升沸腾熔岩 (较矮石柱随时间被逐渐吞噬，逼迫玩家高速进行栈运算与跳跃)
 * 3. 📦 栈结构实时动态透视 (直观展现石柱下标与高度的 Push、Pop 与单调性维护)
 * 4. 🎛️ 地形预设与随机生成 (支持阶梯峡谷、双峰山脉、经典波浪等多种单调栈特异地形)
 * 5. 🔊 原生 Web Audio 飞跃破风声与熔岩沸腾音效
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  LAVA_PARKOUR_CODE_LANGUAGES,
  LAVA_PARKOUR_PROBLEM_HTML,
  LAVA_PARKOUR_ANALYSIS_HTML,
} from './lava-parkour-problem-content';

export interface Pillar {
  id: number;
  height: number; // 柱子高度 1~8
  nextGreaterIdx: number; // 单调栈求解的目标索引
}

class ParkourAudio {
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

  public static playJump(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  public static playLand(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  public static playPop(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {}
  }

  public static playWin(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.12 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.3);
      });
    } catch {}
  }
}

export class LavaParkourVisualizer extends StepVisualizer<any> {
  private heights: number[] = [3, 1, 5, 2, 4, 7, 3, 6, 8];
  private nextGreaterArr: number[] = [];
  private currentPillarIdx = 0;

  // 物理跳跃
  private heroX = 0;
  private heroY = 0;
  private isJumping = false;
  private jumpProgress = 0;
  private jumpStartX = 0;
  private jumpStartY = 0;
  private jumpTargetX = 0;
  private jumpTargetY = 0;

  // 熔岩系统
  private lavaLevel = 0.5; // 熔岩高度
  private lavaSpeed = 0.08;
  private isGameOver = false;
  private isVictory = false;

  // 单调栈透视
  private activeStack: number[] = [];

  // 画布
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private lastTimestamp = 0;

  constructor() {
    super();
    this.codeLanguages = LAVA_PARKOUR_CODE_LANGUAGES;
    this.codeLines = LAVA_PARKOUR_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '单调栈下一个更大元素引擎';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '熔岩跑酷·单调栈跳跃者' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.resetLevel([3, 1, 5, 2, 4, 7, 3, 6, 8]);
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

  private resetLevel(heights: number[]): void {
    this.heights = heights;
    this.currentPillarIdx = 0;
    this.isJumping = false;
    this.jumpProgress = 0;
    this.lavaLevel = 0.5;
    this.isGameOver = false;
    this.isVictory = false;

    this.computeMonotonicStack();
    this.updateHUD();
    this.renderStackDOM();
  }

  // 单调递减栈计算 Next Greater Element
  private computeMonotonicStack(): void {
    const n = this.heights.length;
    this.nextGreaterArr = new Array(n).fill(-1);
    const stack: number[] = [];

    for (let i = 0; i < n; i++) {
      while (stack.length > 0 && this.heights[i] > this.heights[stack[stack.length - 1]]) {
        const topIdx = stack.pop()!;
        this.nextGreaterArr[topIdx] = i;
      }
      stack.push(i);
    }
    this.activeStack = stack;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#lava-parkour-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: LAVA_PARKOUR_CODE_LANGUAGES,
      problemHtml: LAVA_PARKOUR_PROBLEM_HTML,
      analysisHtml: LAVA_PARKOUR_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 跳跃按钮与空格绑定
    const jumpBtn = this.root.querySelector('#btn-lava-jump') as HTMLButtonElement | null;
    if (jumpBtn) {
      jumpBtn.addEventListener('click', () => this.triggerJump());
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
          e.preventDefault();
          this.triggerJump();
        }
      });
    }

    // 地形切换
    this.root.querySelectorAll<HTMLButtonElement>('.lava-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.preset || 'WAVE';
        this.root?.querySelectorAll('.lava-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        if (type === 'WAVE') this.resetLevel([3, 1, 5, 2, 4, 7, 3, 6, 8]);
        else if (type === 'VALLEY') this.resetLevel([6, 3, 1, 2, 4, 7, 2, 5, 8]);
        else if (type === 'RANDOM') {
          const rand = Array.from({ length: 9 }, () => Math.floor(1 + Math.random() * 7));
          this.resetLevel(rand);
        }
      });
    });

    // 重置
    const resetBtn = this.root.querySelector('#btn-lava-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetLevel(this.heights));
    }
  }

  // 触发单调栈智能跳跃
  private triggerJump(): void {
    if (this.isJumping || this.isGameOver || this.isVictory) return;

    const targetIdx = this.nextGreaterArr[this.currentPillarIdx];
    if (targetIdx === -1) {
      // 已经是当前最高，飞跃到终点大门
      if (this.currentPillarIdx === this.heights.length - 1) {
        this.isVictory = true;
        ParkourAudio.playWin();
        return;
      }
      // 跳到下一根相邻柱子
      this.startParabolicJump(this.currentPillarIdx + 1);
    } else {
      this.startParabolicJump(targetIdx);
    }
  }

  private startParabolicJump(targetIdx: number): void {
    if (targetIdx >= this.heights.length) {
      this.isVictory = true;
      ParkourAudio.playWin();
      return;
    }

    this.isJumping = true;
    this.jumpProgress = 0;

    const cellW = (this.canvas?.width || 420) / (this.heights.length + 1);
    const maxH = 8;
    const canvasH = this.canvas?.height || 220;

    this.jumpStartX = (this.currentPillarIdx + 1) * cellW;
    this.jumpStartY = canvasH - 30 - (this.heights[this.currentPillarIdx] / maxH) * 120;

    this.jumpTargetX = (targetIdx + 1) * cellW;
    this.jumpTargetY = canvasH - 30 - (this.heights[targetIdx] / maxH) * 120;

    this.currentPillarIdx = targetIdx;
    ParkourAudio.playJump();
    ParkourAudio.playPop();
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
    if (!this.isGameOver && !this.isVictory) {
      this.lavaLevel = Math.min(6.5, this.lavaLevel + this.lavaSpeed * dt);
    }

    if (this.isJumping) {
      this.jumpProgress += dt * 2.2;
      if (this.jumpProgress >= 1) {
        this.jumpProgress = 1;
        this.isJumping = false;
        ParkourAudio.playLand();

        // 检查当前柱子是否已被岩浆吞没
        if (this.heights[this.currentPillarIdx] <= this.lavaLevel) {
          this.isGameOver = true;
        }
        if (this.currentPillarIdx === this.heights.length - 1) {
          this.isVictory = true;
          ParkourAudio.playWin();
        }
      }
    } else {
      const cellW = (this.canvas?.width || 420) / (this.heights.length + 1);
      const canvasH = this.canvas?.height || 220;
      this.heroX = (this.currentPillarIdx + 1) * cellW;
      this.heroY = canvasH - 30 - (this.heights[this.currentPillarIdx] / 8) * 120;

      if (this.heights[this.currentPillarIdx] <= this.lavaLevel) {
        this.isGameOver = true;
      }
    }

    this.updateHUD();
  }

  private updateHUD(): void {
    if (!this.root) return;
    const posEl = this.root.querySelector('#lava-hero-pos') as HTMLElement | null;
    const targetEl = this.root.querySelector('#lava-target-info') as HTMLElement | null;
    const statusEl = this.root.querySelector('#lava-status-badge') as HTMLElement | null;

    if (posEl) posEl.textContent = `当前石柱: #${this.currentPillarIdx} (高度 ${this.heights[this.currentPillarIdx]})`;

    const target = this.nextGreaterArr[this.currentPillarIdx];
    if (targetEl) {
      if (target !== -1) {
        targetEl.innerHTML = `🎯 单调栈目标: <b>#${target}</b> (高度 ${this.heights[target]})`;
      } else {
        targetEl.innerHTML = `🎯 单调栈目标: <span style="color:#10b981;">已达当前局部最高点！</span>`;
      }
    }

    if (statusEl) {
      if (this.isGameOver) {
        statusEl.textContent = '💀 坠入熔岩！请重置';
        statusEl.style.background = '#fef2f2';
        statusEl.style.color = '#dc2626';
      } else if (this.isVictory) {
        statusEl.textContent = '🏆 成功登顶逃逸！';
        statusEl.style.background = '#f0fdf4';
        statusEl.style.color = '#16a34a';
      } else {
        statusEl.textContent = `🌋 熔岩高度: ${this.lavaLevel.toFixed(1)}`;
        statusEl.style.background = '#fff7ed';
        statusEl.style.color = '#ea580c';
      }
    }
  }

  private renderStackDOM(): void {
    if (!this.root) return;
    const stackContainer = this.root.querySelector('#lava-stack-visual') as HTMLElement | null;
    if (!stackContainer) return;

    stackContainer.innerHTML = '';
    const reversed = [...this.activeStack].reverse();

    reversed.forEach((idx) => {
      const item = document.createElement('div');
      item.style.cssText = 'background: #3b82f6; color: #ffffff; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; font-family: monospace; display: flex; justify-content: space-between; margin-bottom: 2px;';
      item.innerHTML = `<span>下标 #${idx}</span><span>高度: ${this.heights[idx]}</span>`;
      stackContainer.appendChild(item);
    });
  }

  private renderCanvas(): void {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const cellW = width / (this.heights.length + 1);
    const maxH = 8;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. 地牢深渊背景
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // 2. 绘制玄武岩石柱
    for (let i = 0; i < this.heights.length; i++) {
      const h = this.heights[i];
      const px = (i + 1) * cellW;
      const ph = (h / maxH) * 120;
      const py = height - 30 - ph;

      const isCurrent = i === this.currentPillarIdx;
      const isTarget = i === this.nextGreaterArr[this.currentPillarIdx];

      ctx.fillStyle = isCurrent ? '#3b82f6' : isTarget ? '#10b981' : '#475569';
      ctx.fillRect(px - cellW * 0.35, py, cellW * 0.7, ph + 30);

      ctx.strokeStyle = isCurrent ? '#93c5fd' : isTarget ? '#86efac' : '#64748b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px - cellW * 0.35, py, cellW * 0.7, ph + 30);

      // 标柱子高度与下标
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'center';
      ctx.fillText(`H:${h}`, px, py - 4);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`#${i}`, px, height - 6);
    }

    // 3. 绘制跳跃抛物线弧线 (Jump Trajectory)
    const targetIdx = this.nextGreaterArr[this.currentPillarIdx];
    if (targetIdx !== -1) {
      const sx = (this.currentPillarIdx + 1) * cellW;
      const sy = height - 30 - (this.heights[this.currentPillarIdx] / maxH) * 120;
      const tx = (targetIdx + 1) * cellW;
      const ty = height - 30 - (this.heights[targetIdx] / maxH) * 120;

      ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      const cpX = (sx + tx) / 2;
      const cpY = Math.min(sy, ty) - 40;
      ctx.quadraticCurveTo(cpX, cpY, tx, ty);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 4. 绘制上升熔岩 (Lava Wave)
    const lavaH = (this.lavaLevel / maxH) * 120;
    const lavaY = height - 30 - lavaH;

    ctx.fillStyle = 'rgba(239, 68, 68, 0.75)';
    ctx.fillRect(0, lavaY, width, height - lavaY);

    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= width; x += 10) {
      const waveY = lavaY + Math.sin(x * 0.08 + Date.now() / 200) * 3;
      if (x === 0) ctx.moveTo(x, waveY);
      else ctx.lineTo(x, waveY);
    }
    ctx.stroke();

    // 5. 绘制勇士 Hero
    let drawX = this.heroX;
    let drawY = this.heroY;

    if (this.isJumping) {
      const p = this.jumpProgress;
      drawX = this.jumpStartX + (this.jumpTargetX - this.jumpStartX) * p;
      const baseJumpY = this.jumpStartY + (this.jumpTargetY - this.jumpStartY) * p;
      const arc = Math.sin(p * Math.PI) * 45;
      drawY = baseJumpY - arc;
    }

    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏃‍♂️', drawX, drawY - 10);

    ctx.restore();
  }
}

export const LAVA_PARKOUR_TEMPLATE = `
  <div id="algo-lava-parkour-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏：状态 HUD 与功能控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🌋</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">熔岩跑酷·单调栈跳跃者</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="lava-preset-btn active" data-preset="WAVE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典波浪地形</button>
          <button class="lava-preset-btn" data-preset="VALLEY" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">深谷飞跃地形</button>
          <button class="lava-preset-btn" data-preset="RANDOM" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">🎲 随机石柱</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="lava-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #fed7aa; background: #fff7ed; color: #ea580c;">🌋 熔岩高度: 0.5</span>
        <button id="btn-lava-jump" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border: none; border-radius: 6px; padding: 4px 14px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(16,185,129,0.25);">🦘 纵身一跃 (Space)</button>
        <button id="btn-lava-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 概念横幅 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #1e40af;">
      <span id="lava-hero-pos">当前石柱: #0 (高度 3)</span>
      <span id="lava-target-info">🎯 单调栈目标: <b>#2</b> (高度 5)</span>
    </div>

    <!-- 主交互区：左侧 60 FPS 熔岩跑酷沙盘，右侧单调栈透视与终端 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.35fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：跑酷 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #334155;">
          <canvas id="lava-parkour-canvas" width="460" height="230" style="width: 460px; height: 230px;"></canvas>
        </div>
        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          💡 单调栈指示绿色抛物弧线，按空格键即可精准跳向右侧第一个更高石柱以躲避不断上涨的熔岩！
        </div>
      </div>

      <!-- 右侧：单调栈结构与代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <!-- 单调栈栈槽 -->
        <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px; flex: 0.8; min-height: 90px; overflow-y: auto;">
          <div style="font-size: 10.5px; font-weight: 800; color: #0f172a; margin-bottom: 3px;">📦 单调栈实时状态 (Monotonic Decreasing Stack)</div>
          <div id="lava-stack-visual" style="display: flex; flex-direction: column; gap: 2px;"></div>
        </div>

        <!-- 暗色代码终端挂载槽位 -->
        <div id="lava-terminal-mount" style="flex: 1.2; min-height: 160px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'lava-parkour',
  name: '熔岩跑酷·单调栈跳跃者',
  viewId: 'algo-lava-parkour-view',
  category: 'game',
  description: '单调栈物理跑酷游戏：60 FPS 抛物线跳跃、动态熔岩上涨躲避、实时单调递减栈透视与下一个更大元素求解',
  icon: '🌋',
  template: LAVA_PARKOUR_TEMPLATE,
  Visualizer: LavaParkourVisualizer,
  difficulty: 3,
  levelOrder: 5,
  learningGoal: '通过熔岩逃逸飞跃实战，彻底掌握单调递减栈的入栈、出栈与下一个更大元素（NGE）计算规律',
});
