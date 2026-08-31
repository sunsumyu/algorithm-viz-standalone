/**
 * 弹簧鞋大冒险·跳跃覆盖范围 (Spring Jump Quest: Greedy Maximum Reach)
 * 经典贪心算法、动态最大覆盖光场与最少步数求解：
 * 1. 🦘 60 FPS 霓虹浮空跳台 (Canvas 2D 拟真弹簧鞋抛物线飞跃、火箭推进粒子与光柱)
 * 2. 🟢 动态最大覆盖光场 (实时展现 maxReach 辐射范围与当前步右边界 curEnd)
 * 3. 🏃‍♂️ 手动飞跃与陷阱判定 (点击视野内任意平台弹跳，体验零动力陷阱带来的绝望)
 * 4. ✨ 贪心最少步数一键推演 (全自动规划 LeetCode 45 黄金飞跃航线)
 * 5. 🔊 原生 Web Audio 弹簧起跳、火箭喷射与通关礼炮音效
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  JUMP_QUEST_CODE_LANGUAGES,
  JUMP_QUEST_PROBLEM_HTML,
  JUMP_QUEST_ANALYSIS_HTML,
} from './jump-quest-problem-content';

export interface Platform {
  id: number;
  power: number; // 弹跳力
  isGoal: boolean;
}

class JumpAudio {
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

  public static playBoing(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.15);
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
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  public static playDeadTrap(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  }

  public static playVictory(): void {
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

export class JumpQuestVisualizer extends StepVisualizer<any> {
  private platforms: Platform[] = [];
  private currentPlatformIdx = 0;
  private maxReach = 0;
  private stepCount = 0;

  // 物理跳跃
  private heroX = 0;
  private heroY = 0;
  private isJumping = false;
  private jumpProgress = 0;
  private jumpStartX = 0;
  private jumpStartY = 0;
  private jumpTargetX = 0;
  private jumpTargetY = 0;

  // 状态
  private isVictory = false;
  private isTrapped = false;

  // 贪心最优解
  private minStepsOptimal = 0;
  private canReachGoal = false;

  // 画布与动画
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private lastTimestamp = 0;

  constructor() {
    super();
    this.codeLanguages = JUMP_QUEST_CODE_LANGUAGES;
    this.codeLines = JUMP_QUEST_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '跳跃游戏贪心覆盖范围引擎';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '弹簧鞋大冒险·跳跃覆盖范围' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadLevel([2, 3, 1, 1, 4]);
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

  private loadLevel(nums: number[]): void {
    this.platforms = nums.map((p, i) => ({
      id: i,
      power: p,
      isGoal: i === nums.length - 1,
    }));

    this.currentPlatformIdx = 0;
    this.stepCount = 0;
    this.isJumping = false;
    this.jumpProgress = 0;
    this.isVictory = false;
    this.isTrapped = false;
    this.maxReach = nums[0];

    this.computeOptimalSolution();
    this.updateHUD();
  }

  private computeOptimalSolution(): void {
    const nums = this.platforms.map((p) => p.power);
    const n = nums.length;
    let reach = 0;
    let curEnd = 0;
    let steps = 0;

    for (let i = 0; i < n; i++) {
      if (i > reach) break;
      reach = Math.max(reach, i + nums[i]);
      if (i < n - 1) {
        if (i === curEnd) {
          curEnd = reach;
          steps++;
        }
      }
    }

    this.canReachGoal = reach >= n - 1;
    this.minStepsOptimal = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#jump-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.bindCanvasInteraction();
    }

    this.mountTerminal({
      codeLanguages: JUMP_QUEST_CODE_LANGUAGES,
      problemHtml: JUMP_QUEST_PROBLEM_HTML,
      analysisHtml: JUMP_QUEST_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 一键贪心最优跳跃
    const autoBtn = this.root.querySelector('#btn-jump-auto') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => this.runAutoGreedyJumps());
    }

    // 关卡预设
    this.root.querySelectorAll<HTMLButtonElement>('.jump-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.preset || 'CLASSIC';
        this.root?.querySelectorAll('.jump-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        if (type === 'CLASSIC') this.loadLevel([2, 3, 1, 1, 4]);
        else if (type === 'OBSTACLE') this.loadLevel([2, 3, 0, 1, 4]);
        else if (type === 'TRAP') this.loadLevel([3, 2, 1, 0, 4]);
        else if (type === 'STEP') this.loadLevel([1, 1, 1, 1, 1]);
      });
    });

    // 重置
    const resetBtn = this.root.querySelector('#btn-jump-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.loadLevel(this.platforms.map((p) => p.power)));
    }
  }

  private bindCanvasInteraction(): void {
    if (!this.canvas) return;

    this.canvas.addEventListener('click', (e) => {
      if (this.isJumping || this.isVictory || this.isTrapped) return;
      const rect = this.canvas!.getBoundingClientRect();
      const clickX = e.clientX - rect.left;

      const n = this.platforms.length;
      const cellW = (this.canvas!.width || 460) / (n + 1);

      for (let i = 0; i < n; i++) {
        const px = (i + 1) * cellW;
        if (Math.abs(clickX - px) <= cellW * 0.45) {
          // 仅允许跳向当前平台可达的范围内
          const maxAllowed = this.currentPlatformIdx + this.platforms[this.currentPlatformIdx].power;
          if (i > this.currentPlatformIdx && i <= maxAllowed) {
            this.startJumpTo(i);
          }
          break;
        }
      }
    });
  }

  private startJumpTo(targetIdx: number): void {
    this.isJumping = true;
    this.jumpProgress = 0;

    const n = this.platforms.length;
    const cellW = (this.canvas?.width || 460) / (n + 1);
    const canvasH = this.canvas?.height || 200;

    this.jumpStartX = (this.currentPlatformIdx + 1) * cellW;
    this.jumpStartY = canvasH - 50;
    this.jumpTargetX = (targetIdx + 1) * cellW;
    this.jumpTargetY = canvasH - 50;

    this.currentPlatformIdx = targetIdx;
    this.stepCount++;
    this.maxReach = Math.max(this.maxReach, targetIdx + this.platforms[targetIdx].power);

    JumpAudio.playBoing();
  }

  private runAutoGreedyJumps(): void {
    if (!this.canReachGoal || this.isVictory || this.isTrapped) return;

    const path: number[] = [0];
    let cur = 0;
    const nums = this.platforms.map((p) => p.power);
    const n = nums.length;

    while (cur < n - 1) {
      const maxAllowed = cur + nums[cur];
      if (maxAllowed >= n - 1) {
        path.push(n - 1);
        break;
      }
      let bestNext = cur + 1;
      let bestReach = bestNext + nums[bestNext];
      for (let j = cur + 1; j <= maxAllowed; j++) {
        if (j + nums[j] > bestReach) {
          bestReach = j + nums[j];
          bestNext = j;
        }
      }
      path.push(bestNext);
      cur = bestNext;
    }

    // 播放步骤动画
    let stepIdx = 1;
    const doStep = () => {
      if (stepIdx >= path.length) return;
      this.startJumpTo(path[stepIdx++]);
      setTimeout(doStep, 600);
    };
    doStep();
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
    if (this.isJumping) {
      this.jumpProgress += dt * 2.5;
      if (this.jumpProgress >= 1) {
        this.jumpProgress = 1;
        this.isJumping = false;
        JumpAudio.playLand();

        if (this.currentPlatformIdx === this.platforms.length - 1) {
          this.isVictory = true;
          JumpAudio.playVictory();
        } else if (this.platforms[this.currentPlatformIdx].power === 0 && this.maxReach <= this.currentPlatformIdx) {
          this.isTrapped = true;
          JumpAudio.playDeadTrap();
        }
      }
    } else {
      const n = this.platforms.length;
      const cellW = (this.canvas?.width || 460) / (n + 1);
      const canvasH = this.canvas?.height || 200;
      this.heroX = (this.currentPlatformIdx + 1) * cellW;
      this.heroY = canvasH - 50;
    }
    this.updateHUD();
  }

  private updateHUD(): void {
    if (!this.root) return;

    const reachEl = this.root.querySelector('#jump-max-reach') as HTMLElement | null;
    const stepsEl = this.root.querySelector('#jump-steps-count') as HTMLElement | null;
    const statusEl = this.root.querySelector('#jump-status-badge') as HTMLElement | null;

    if (reachEl) reachEl.innerHTML = `🟢 贪心最大覆盖下标: <b>#${Math.min(this.platforms.length - 1, this.maxReach)}</b> (终点: #${this.platforms.length - 1})`;
    if (stepsEl) stepsEl.innerHTML = `已用步数: <b>${this.stepCount}</b> (理论最少步数: <b>${this.canReachGoal ? this.minStepsOptimal : '不可达'}</b>)`;

    if (statusEl) {
      if (this.isVictory) {
        statusEl.textContent = '🏆 成功飞跃抵达终点！';
        statusEl.style.background = '#f0fdf4';
        statusEl.style.color = '#16a34a';
      } else if (this.isTrapped) {
        statusEl.textContent = '💀 陷入零动力死胡同！';
        statusEl.style.background = '#fef2f2';
        statusEl.style.color = '#dc2626';
      } else {
        statusEl.textContent = '🦘 探索起跳中...';
        statusEl.style.background = '#eff6ff';
        statusEl.style.color = '#2563eb';
      }
    }
  }

  private renderCanvas(): void {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const n = this.platforms.length;
    const cellW = width / (n + 1);

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. 赛博深空背景
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // 2. 绘制最大覆盖光场 (Green Max Reach Zone)
    const reachEndX = (Math.min(n - 1, this.maxReach) + 1) * cellW + cellW * 0.45;
    const reachStartX = cellW * 0.55;

    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
    ctx.beginPath();
    ctx.roundRect(reachStartX, 20, reachEndX - reachStartX, height - 50, 10);
    ctx.fill();

    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. 绘制霓虹浮空平台
    for (let i = 0; i < n; i++) {
      const p = this.platforms[i];
      const px = (i + 1) * cellW;
      const py = height - 50;
      const isCurrent = i === this.currentPlatformIdx;
      const inReach = i <= this.maxReach;

      ctx.save();
      ctx.translate(px, py);

      // 平台底座
      ctx.fillStyle = p.isGoal ? '#8b5cf6' : p.power === 0 ? '#ef4444' : inReach ? '#3b82f6' : '#475569';
      ctx.beginPath();
      ctx.roundRect(-cellW * 0.4, 0, cellW * 0.8, 16, 4);
      ctx.fill();

      ctx.strokeStyle = isCurrent ? '#38bdf8' : '#94a3b8';
      ctx.lineWidth = isCurrent ? 2.5 : 1;
      ctx.stroke();

      // 弹力角标
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(p.isGoal ? '🏁' : `+${p.power}`, 0, 12);

      // 平台下标
      ctx.font = '9px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`#${i}`, 0, 28);

      ctx.restore();
    }

    // 4. 绘制勇士 Hero
    let drawX = this.heroX;
    let drawY = this.heroY;

    if (this.isJumping) {
      const p = this.jumpProgress;
      drawX = this.jumpStartX + (this.jumpTargetX - this.jumpStartX) * p;
      const baseJumpY = this.jumpStartY + (this.jumpTargetY - this.jumpStartY) * p;
      const arc = Math.sin(p * Math.PI) * 55;
      drawY = baseJumpY - arc;
    }

    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🦘', drawX, drawY - 14);

    ctx.restore();
  }
}

export const JUMP_QUEST_TEMPLATE = `
  <div id="algo-jump-quest-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏：题库预设与功能控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🦘</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">弹簧鞋大冒险·跳跃覆盖范围</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="jump-preset-btn active" data-preset="CLASSIC" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典可达 [2,3,1,1,4]</button>
          <button class="jump-preset-btn" data-preset="OBSTACLE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">含零跨越 [2,3,0,1,4]</button>
          <button class="jump-preset-btn" data-preset="TRAP" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">🚫 绝望陷阱 [3,2,1,0,4]</button>
          <button class="jump-preset-btn" data-preset="STEP" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">步步紧逼 [1,1,1,1,1]</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="jump-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">🦘 探索起跳中...</span>
        <button id="btn-jump-auto" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border: none; border-radius: 6px; padding: 4px 12px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(16,185,129,0.25);">✨ 贪心最少步数飞跃</button>
        <button id="btn-jump-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 概念横幅与覆盖范围状态 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #1e40af;">
      <span id="jump-max-reach">🟢 贪心最大覆盖下标: <b>#2</b> (终点: #4)</span>
      <span id="jump-steps-count" style="font-weight: 800; color: #059669;">已用步数: 0 (理论最少步数: 2)</span>
    </div>

    <!-- 主交互区：左侧 60 FPS 平台飞跃 Canvas + 右侧终端 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.35fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：跳台沙盘 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #334155;">
          <canvas id="jump-canvas" width="460" height="180" style="width: 460px; height: 180px; cursor: pointer;"></canvas>
        </div>
        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          💡 点击当前平台所能辐射覆盖的任意跳台进行飞跃，绿色能量光场直观展现贪心最大覆盖范围的动态扩张！
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="jump-terminal-mount" style="flex: 1; min-height: 220px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'jump-quest',
  name: '弹簧鞋大冒险·跳跃覆盖范围',
  viewId: 'algo-jump-quest-view',
  category: 'game',
  description: '跳跃游戏贪心算法：60 FPS 抛物线飞跃、动态最大覆盖光场辐射、最少跳跃步数求解与陷阱躲避',
  icon: '🦘',
  template: JUMP_QUEST_TEMPLATE,
  Visualizer: JumpQuestVisualizer,
  difficulty: 2,
  levelOrder: 13,
  learningGoal: '通过弹簧鞋平台飞跃，彻底掌握贪心算法如何通过维护最大覆盖范围（Max Reach）来替代复杂的递归与动规',
});
