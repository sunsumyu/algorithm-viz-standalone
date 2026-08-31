/**
 * 时间折跃·星际航道区间合并 (Warp Gate: Interval Merge Fleet)
 * 经典贪心算法、星舰时空折跃与等离子融合透视：
 * 1. 🛸 60 FPS 深空折跃跑道 (Canvas 2D 拟真星际航道、时间轴刻度、光子护盾与等离子电弧)
 * 2. ⚡ 动态区间融合物理 (重叠航道碰撞激发能量光环，实时拓展右边界 prev.end = max(prev.end, cur.end))
 * 3. ⏱️ 步骤贪心推演 (按左端点升序排列 -> 线性合并 -> 生成最简跃迁通道)
 * 4. 🎛️ 经典题库预设 (经典相交、边界接触、黑洞全吞噬、乱序重排)
 * 5. 🔊 原生 Web Audio 引擎超空间跳跃、等离子融合火花与通关礼炮
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  INTERVAL_WARP_CODE_LANGUAGES,
  INTERVAL_WARP_PROBLEM_HTML,
  INTERVAL_WARP_ANALYSIS_HTML,
} from './interval-warp-problem-content';

export interface IntervalItem {
  id: number;
  start: number;
  end: number;
  color: string;
  isMerged?: boolean;
}

class WarpAudio {
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

  public static playWarp(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  }

  public static playFusion(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
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

export class IntervalWarpVisualizer extends StepVisualizer<any> {
  private rawIntervals: [number, number][] = [[1, 3], [2, 6], [8, 10], [15, 18]];
  private currentIntervals: IntervalItem[] = [];
  private mergedResult: [number, number][] = [];
  private isProcessing = false;
  private warpStepIdx = -1;

  // 画布与动画
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private lastTimestamp = 0;

  constructor() {
    super();
    this.codeLanguages = INTERVAL_WARP_CODE_LANGUAGES;
    this.codeLines = INTERVAL_WARP_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '合并区间贪心算法引擎';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '时间折跃·星际航道区间合并' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset([[1, 3], [2, 6], [8, 10], [15, 18]]);
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

  private loadPreset(intervals: [number, number][]): void {
    this.rawIntervals = intervals;
    const colors = ['#38bdf8', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];
    this.currentIntervals = intervals.map((intv, i) => ({
      id: i,
      start: intv[0],
      end: intv[1],
      color: colors[i % colors.length],
      isMerged: false,
    }));

    this.mergedResult = [];
    this.isProcessing = false;
    this.warpStepIdx = -1;
    this.updateHUD();
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#warp-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: INTERVAL_WARP_CODE_LANGUAGES,
      problemHtml: INTERVAL_WARP_PROBLEM_HTML,
      analysisHtml: INTERVAL_WARP_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 1. 贪心左端点排序
    const sortBtn = this.root.querySelector('#btn-warp-sort') as HTMLButtonElement | null;
    if (sortBtn) {
      sortBtn.addEventListener('click', () => {
        this.currentIntervals.sort((a, b) => a.start - b.start);
        WarpAudio.playWarp();
        this.updateHUD();
      });
    }

    // 2. 一键贪心融合通关
    const mergeBtn = this.root.querySelector('#btn-warp-merge') as HTMLButtonElement | null;
    if (mergeBtn) {
      mergeBtn.addEventListener('click', () => this.runGreedyMerge());
    }

    // 预设关卡
    this.root.querySelectorAll<HTMLButtonElement>('.warp-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.preset || 'CLASSIC';
        this.root?.querySelectorAll('.warp-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        if (type === 'CLASSIC') this.loadPreset([[1, 3], [2, 6], [8, 10], [15, 18]]);
        else if (type === 'TOUCH') this.loadPreset([[1, 4], [4, 5]]);
        else if (type === 'BLACKHOLE') this.loadPreset([[1, 10], [2, 3], [4, 5], [6, 7], [8, 9]]);
        else if (type === 'UNSORTED') this.loadPreset([[1, 4], [0, 4]]);
      });
    });

    // 重置
    const resetBtn = this.root.querySelector('#btn-warp-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.loadPreset(this.rawIntervals));
    }
  }

  private runGreedyMerge(): void {
    if (this.isProcessing) return;
    this.isProcessing = true;

    // 先按起点排序
    this.currentIntervals.sort((a, b) => a.start - b.start);
    WarpAudio.playWarp();

    const merged: IntervalItem[] = [{ ...this.currentIntervals[0] }];
    let i = 1;

    const step = () => {
      if (i >= this.currentIntervals.length) {
        this.currentIntervals = merged;
        this.mergedResult = merged.map((m) => [m.start, m.end]);
        this.isProcessing = false;
        this.warpStepIdx = -1;
        WarpAudio.playWin();
        this.updateHUD();
        return;
      }

      this.warpStepIdx = i;
      const prev = merged[merged.length - 1];
      const cur = this.currentIntervals[i];

      if (cur.start <= prev.end) {
        // 重叠融合
        prev.end = Math.max(prev.end, cur.end);
        prev.isMerged = true;
        WarpAudio.playFusion();
      } else {
        merged.push({ ...cur });
      }

      this.updateHUD();
      i++;
      setTimeout(step, 500);
    };

    setTimeout(step, 400);
  }

  private updateHUD(): void {
    if (!this.root) return;

    const listEl = this.root.querySelector('#warp-intervals-display') as HTMLElement | null;
    const statusEl = this.root.querySelector('#warp-status-badge') as HTMLElement | null;
    const resultEl = this.root.querySelector('#warp-result-display') as HTMLElement | null;

    if (listEl) {
      listEl.innerHTML = `当前航道: <b>[ ${this.currentIntervals.map((it) => `[${it.start}, ${it.end}]`).join(', ')} ]</b>`;
    }

    if (resultEl) {
      if (this.mergedResult.length > 0) {
        resultEl.innerHTML = `🏆 合并后超级跃迁道: <b>[ ${this.mergedResult.map((m) => `[${m[0]}, ${m[1]}]`).join(', ')} ]</b>`;
      } else {
        resultEl.innerHTML = `💡 点击「✨ 贪心区间折跃」全自动排序并融合所有重叠时空段！`;
      }
    }

    if (statusEl) {
      if (this.isProcessing) {
        statusEl.textContent = '⚡ 等离子跃迁融合中...';
        statusEl.style.background = '#eff6ff';
        statusEl.style.color = '#2563eb';
      } else if (this.mergedResult.length > 0) {
        statusEl.textContent = '🏆 航道合并完毕！';
        statusEl.style.background = '#f0fdf4';
        statusEl.style.color = '#16a34a';
      } else {
        statusEl.textContent = '🛸 舰队航道就绪';
        statusEl.style.background = '#f8fafc';
        statusEl.style.color = '#475569';
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
    const maxTime = 20;
    const scaleX = (width - 40) / maxTime;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. 深空宇宙背景
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // 2. 时间轴标尺
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, height - 30);
    ctx.lineTo(width - 20, height - 30);
    ctx.stroke();

    for (let t = 0; t <= maxTime; t += 2) {
      const tx = 20 + t * scaleX;
      ctx.beginPath();
      ctx.moveTo(tx, height - 30);
      ctx.lineTo(tx, height - 25);
      ctx.stroke();

      ctx.font = '9px monospace';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(`${t}`, tx, height - 12);
    }

    // 3. 绘制时空折跃航道
    const laneHeight = 22;
    for (let i = 0; i < this.currentIntervals.length; i++) {
      const it = this.currentIntervals[i];
      const startX = 20 + it.start * scaleX;
      const endX = 20 + it.end * scaleX;
      const barW = Math.max(12, endX - startX);
      const barY = 20 + i * (laneHeight + 8);

      ctx.save();
      ctx.fillStyle = it.color;
      ctx.beginPath();
      ctx.roundRect(startX, barY, barW, laneHeight, 6);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 航道星舰与区间标签
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`🛸 [${it.start}, ${it.end}]`, startX + barW / 2, barY + laneHeight / 2);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const INTERVAL_WARP_TEMPLATE = `
  <div id="algo-interval-warp-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏：按键预设与功能控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🛸</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">时间折跃·星际航道区间合并</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="warp-preset-btn active" data-preset="CLASSIC" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典相交</button>
          <button class="warp-preset-btn" data-preset="TOUCH" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">边界接触 [1,4][4,5]</button>
          <button class="warp-preset-btn" data-preset="BLACKHOLE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">🔥 黑洞全吞噬</button>
          <button class="warp-preset-btn" data-preset="UNSORTED" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">乱序重排 [1,4][0,4]</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="warp-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">🛸 舰队就绪</span>
        <button id="btn-warp-sort" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">1. 贪心起点排序</button>
        <button id="btn-warp-merge" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #ffffff; border: none; border-radius: 6px; padding: 4px 12px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(59,130,246,0.25);">✨ 贪心区间折跃</button>
        <button id="btn-warp-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 概念横幅与当前区间状态 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #1e40af;">
      <span id="warp-intervals-display">当前航道: [ [1, 3], [2, 6], [8, 10], [15, 18] ]</span>
      <span id="warp-result-display" style="font-weight: 700;">💡 点击「✨ 贪心区间折跃」全自动排序并融合所有重叠时空段！</span>
    </div>

    <!-- 主交互区：左侧深空航道 Canvas，右侧终端 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.35fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：深空航道 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #090d16; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="warp-canvas" width="460" height="180" style="width: 460px; height: 180px;"></canvas>
        </div>
        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          💡 先按起点升序排序，赋予区间单调性；线性扫描时若 cur.start <= prev.end 则融合右端点！
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="warp-terminal-mount" style="flex: 1; min-height: 220px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'interval-warp',
  name: '时间折跃·星际航道区间合并',
  viewId: 'algo-interval-warp-view',
  category: 'game',
  description: '区间贪心算法游戏：60 FPS 星舰折跃航道、时间轴刻度、等离子能量融合与最优航道生成',
  icon: '🛸',
  template: INTERVAL_WARP_TEMPLATE,
  Visualizer: IntervalWarpVisualizer,
  difficulty: 2,
  levelOrder: 15,
  learningGoal: '掌握经典区间重叠合并问题的排序与双端点贪心维护机制，理解相邻单调性对算法复杂度的降维威力',
});
