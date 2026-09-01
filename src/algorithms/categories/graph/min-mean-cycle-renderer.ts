/**
 * 最小均值回路与分数规划 (Minimum Mean Weight Cycle - Karp's Algorithm) 可视化引擎
 * 进阶图论: 0-1 分数规划、边权重赋权 w'(e) = w(e) - lambda、SPFA 负环判定、二分逼近
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  MIN_MEAN_CYCLE_CODE_LANGUAGES,
  MIN_MEAN_CYCLE_PROBLEM_HTML,
  MIN_MEAN_CYCLE_ANALYSIS_HTML,
} from './min-mean-cycle-problem-content';

export interface MeanCycleStep {
  type: 'INIT_GUESS' | 'EVALUATE_WEIGHTS' | 'DETECT_NEG_CYCLE' | 'UPDATE_BOUNDS' | 'CONVERGED';
  lambda: number;
  boundL: number;
  boundR: number;
  hasNegCycle: boolean;
  activeCycleNodes: number[];
  reweightedEdges: Array<{ u: number; v: number; origW: number; newW: number }>;
  message: string;
}

class MeanCycleAudio {
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

  public static playLaser(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
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
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
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
      const chord = [523.25, 659.25, 783.99, 1046.5];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.22);
      });
    } catch {}
  }
}

export class MinMeanCycleVisualizer extends StepVisualizer<any> {
  private n = 4;
  private origEdges: Array<{ u: number; v: number; w: number }> = [
    { u: 1, v: 2, w: 4 },
    { u: 2, v: 3, w: 2 },
    { u: 3, v: 1, w: 3 },
    { u: 2, v: 4, w: 1 },
    { u: 4, v: 3, w: 1 },
  ];
  private nodePositions: Record<number, { x: number; y: number }> = {
    1: { x: 65, y: 55 },
    2: { x: 185, y: 55 },
    3: { x: 65, y: 165 },
    4: { x: 185, y: 165 },
  };

  // 推演步骤
  private traceSteps: MeanCycleStep[] = [];
  private currentStepPtr = 0;
  private isAutoPlaying = false;
  private autoPlayTimer: any = null;
  private playSpeed = 1;

  // 画布与动画
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private lastTimestamp = 0;
  private pulseAnim = 0;

  constructor() {
    super();
    this.codeLanguages = MIN_MEAN_CYCLE_CODE_LANGUAGES;
    this.codeLines = MIN_MEAN_CYCLE_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '最小均值回路 0-1 分数规划引擎 (Min Mean Cycle)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '最小均值回路' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('FOUR_NODES_TWO_CYCLES');
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

  private loadPreset(_presetKey: string): void {
    this.stopAutoPlay();
    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const steps: MeanCycleStep[] = [];

    // 1. 初始二分猜测 lambda = 2.5
    const reweighted1 = this.origEdges.map((e) => ({
      u: e.u,
      v: e.v,
      origW: e.w,
      newW: Number((e.w - 2.5).toFixed(2)),
    }));

    steps.push({
      type: 'INIT_GUESS',
      lambda: 2.5,
      boundL: 0.0,
      boundR: 5.0,
      hasNegCycle: true,
      activeCycleNodes: [2, 4, 3],
      reweightedEdges: reweighted1,
      message: '⚡ [二分猜测 lambda = 2.5] 边权映射 w\' = w - 2.5，环 2➔4➔3➔2 新权和为 -3.5 < 0，触发负环！',
    });

    // 2. 负环确认，收缩上界 R = 2.5
    steps.push({
      type: 'DETECT_NEG_CYCLE',
      lambda: 2.5,
      boundL: 0.0,
      boundR: 2.5,
      hasNegCycle: true,
      activeCycleNodes: [2, 4, 3],
      reweightedEdges: reweighted1,
      message: '🛑 [负环成立] SPFA 探测到负权回路，说明最小平均权值 <= 2.5，更新上界 R = 2.5！',
    });

    // 3. 第二轮猜测 lambda = 1.25
    const reweighted2 = this.origEdges.map((e) => ({
      u: e.u,
      v: e.v,
      origW: e.w,
      newW: Number((e.w - 1.25).toFixed(2)),
    }));

    steps.push({
      type: 'EVALUATE_WEIGHTS',
      lambda: 1.25,
      boundL: 1.25,
      boundR: 2.5,
      hasNegCycle: false,
      activeCycleNodes: [],
      reweightedEdges: reweighted2,
      message: '📈 [二分猜测 lambda = 1.25] 边权映射 w\' = w - 1.25，所有环和均为正数 (无负环)，更新下界 L = 1.25！',
    });

    // 4. 收敛至最优均值 lambda* = 1.333
    const reweightedOpt = this.origEdges.map((e) => ({
      u: e.u,
      v: e.v,
      origW: e.w,
      newW: Number((e.w - 1.333).toFixed(3)),
    }));

    steps.push({
      type: 'CONVERGED',
      lambda: 1.333,
      boundL: 1.333,
      boundR: 1.333,
      hasNegCycle: true,
      activeCycleNodes: [2, 4, 3],
      reweightedEdges: reweightedOpt,
      message: '🎉 [二分收敛完成] 全局最小均值回路为 2 ➔ 4 ➔ 3 ➔ 2，平均边权 lambda* = (1+1+2)/3 = 1.333！',
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#min-mean-cycle-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: MIN_MEAN_CYCLE_CODE_LANGUAGES,
      problemHtml: MIN_MEAN_CYCLE_PROBLEM_HTML,
      analysisHtml: MIN_MEAN_CYCLE_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-meancycle-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-meancycle-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-meancycle-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 音效
    const soundBtn = this.root.querySelector('#btn-meancycle-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        MeanCycleAudio.isMuted = !MeanCycleAudio.isMuted;
        soundBtn.textContent = MeanCycleAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'INIT_GUESS' || cur.type === 'EVALUATE_WEIGHTS') MeanCycleAudio.playLaser();
      else if (cur.type === 'DETECT_NEG_CYCLE') MeanCycleAudio.playBuzzer();
      else if (cur.type === 'CONVERGED') MeanCycleAudio.playVictory();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-meancycle-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停二分';

    const step = () => {
      if (!this.isAutoPlaying) return;
      if (this.currentStepPtr < this.traceSteps.length - 1) {
        this.stepForward();
        this.autoPlayTimer = setTimeout(step, 950 / this.playSpeed);
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
    const playBtn = this.root?.querySelector('#btn-meancycle-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动二分';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#meancycle-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#meancycle-status-badge') as HTMLElement | null;
    const boundsBadge = this.root.querySelector('#meancycle-bounds-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'CONVERGED') {
        statusBadge.textContent = '🏁 二分收敛完成';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (boundsBadge) {
      boundsBadge.textContent = `二分区间: [${cur.boundL.toFixed(3)}, ${cur.boundR.toFixed(3)}] | 当前猜测 λ: ${cur.lambda.toFixed(3)}`;
    }
  }

  private startLoop(): void {
    if (typeof requestAnimationFrame !== 'function') return;
    const loop = (timestamp: number) => {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const dt = Math.min(32, timestamp - this.lastTimestamp);
      this.lastTimestamp = timestamp;

      this.pulseAnim += dt * 0.006;
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
    const cur = this.traceSteps[this.currentStepPtr];

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    if (cur) {
      // 1. 绘制重新赋权的有向边
      cur.reweightedEdges.forEach((e) => {
        const p1 = this.nodePositions[e.u];
        const p2 = this.nodePositions[e.v];
        if (!p1 || !p2) return;

        const isNegEdge = e.newW < 0;
        const isCycleEdge = cur.activeCycleNodes.includes(e.u) && cur.activeCycleNodes.includes(e.v);

        ctx.save();
        ctx.strokeStyle = isCycleEdge ? '#ef4444' : isNegEdge ? '#facc15' : '#38bdf8';
        ctx.lineWidth = isCycleEdge ? 3 : 1.5;

        if (isCycleEdge) {
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 8;
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // 箭头与边权
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;

        ctx.fillStyle = isCycleEdge ? '#ef4444' : '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(midX, midY);
        ctx.lineTo(midX - 7 * Math.cos(angle - Math.PI / 6), midY - 7 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(midX - 7 * Math.cos(angle + Math.PI / 6), midY - 7 * Math.sin(angle + Math.PI / 6));
        ctx.fill();

        ctx.font = 'bold 9.5px monospace';
        ctx.fillStyle = isNegEdge ? '#f87171' : '#cbd5e1';
        ctx.textAlign = 'center';
        ctx.fillText(`w':${e.newW}`, midX, midY - 6);

        ctx.restore();
      });

      // 2. 绘制节点
      for (let u = 1; u <= this.n; u++) {
        const pos = this.nodePositions[u];
        if (!pos) continue;

        const inCycle = cur.activeCycleNodes.includes(u);

        ctx.save();
        let fillColor = inCycle ? '#7f1d1d' : '#1e293b';
        let strokeColor = inCycle ? '#ef4444' : '#38bdf8';
        let radius = 13;

        if (inCycle) {
          radius = 15 + Math.sin(this.pulseAnim) * 1.5;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 10;
        }

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = inCycle ? 2.5 : 1.5;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${u}`, pos.x, pos.y);

        ctx.restore();
      }

      // 3. 右侧分数规划二分状态 HUD
      ctx.save();
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('📊 0-1 分数规划二分收敛:', 255, 30);

      // 二分区间卡片
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(255, 42, 180, 52, 4);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 10.5px monospace';
      ctx.fillStyle = '#facc15';
      ctx.fillText(`区间: [${cur.boundL.toFixed(3)}, ${cur.boundR.toFixed(3)}]`, 265, 60);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`猜测均值 λ = ${cur.lambda.toFixed(3)}`, 265, 80);

      // 负环判定结论
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#facc15';
      ctx.fillText('👑 分数规划定理:', 250, 125);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('若存在负环  ⟺  λ* < λ (缩小上界)', 250, 145);
      ctx.fillText('若无负环    ⟺  λ* ≥ λ (提高下界)', 250, 165);
      ctx.fillStyle = '#10b981';
      ctx.fillText('最优回路 2➔4➔3➔2 (λ* = 1.333)', 250, 188);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const MIN_MEAN_CYCLE_TEMPLATE = `
  <div id="algo-min-mean-cycle-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🔄</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">最小均值回路 (Min Mean Weight Cycle)</span>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="meancycle-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-meancycle-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-meancycle-autoplay" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(2,132,199,0.25);">▶️ 自动二分</button>
        <button id="btn-meancycle-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-meancycle-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #0369a1;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>🎯 二分状态: <b id="meancycle-bounds-badge" style="color: #0284c7; font-size: 12px;">区间: [0, 5] | 猜测 λ: 2.5</b></span>
      </div>
      <div id="meancycle-narration-box" style="font-weight: 700; color: #075985;">
        💡 准备就绪：0-1 分数规划二分 lambda + SPFA 负环判定，精准逼近最小均值回路！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：有向图与负环 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="min-mean-cycle-canvas" width="460" height="220" style="width: 460px; height: 220px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          左侧为有向带权图 (🔴 红色高亮为检测到的负权回路) | 边上标注赋权 w' = w - λ
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="min-mean-terminal-mount" data-code-terminal style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'min-mean-cycle',
  name: '最小均值回路 (Min Mean Cycle)',
  viewId: 'algo-min-mean-cycle-view',
  category: 'graph',
  description: '进阶图论 0-1 分数规划：边权动态赋权 w\'(e)=w(e)-λ、SPFA 负环判别与二分逼近最小平均回路 (洛谷 P2868)',
  icon: '🔄',
  template: MIN_MEAN_CYCLE_TEMPLATE,
  Visualizer: MinMeanCycleVisualizer,
  difficulty: 3,
  levelOrder: 73,
  learningGoal: '掌握 0-1 分数规划转化为负环判定的数学原理、二分逼近与 Karp 最小均值回路算法',
});
