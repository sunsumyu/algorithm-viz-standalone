/**
 * 混合图欧拉回路与网络流定向 (Mixed Graph Eulerian Circuit - POJ 1637) 可视化引擎
 * 进阶网络流建模: 任意初始定向、度数差额 D[u]、Dinic 最大流调整方向、满流判定
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  MIXED_EULER_CODE_LANGUAGES,
  MIXED_EULER_PROBLEM_HTML,
  MIXED_EULER_ANALYSIS_HTML,
} from './mixed-eulerian-circuit-problem-content';

export interface MixedStep {
  type: 'INIT_ORIENT' | 'CHECK_DIFF' | 'DINIC_FLOW' | 'FLIP_EDGE' | 'RESULT';
  directedEdges: Array<{ u: number; v: number; isFlipped: boolean }>;
  degIn: Record<number, number>;
  degOut: Record<number, number>;
  flowVal: number;
  maxFlowTarget: number;
  isEulerian: boolean;
  message: string;
}

class MixedAudio {
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
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playFlip(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(783.99, ctx.currentTime);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
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

export class MixedEulerianCircuitVisualizer extends StepVisualizer<any> {
  private n = 4;
  private nodePositions: Record<number, { x: number; y: number }> = {
    1: { x: 60, y: 55 },
    2: { x: 180, y: 55 },
    3: { x: 180, y: 165 },
    4: { x: 60, y: 165 },
  };

  // 推演步骤
  private traceSteps: MixedStep[] = [];
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
    this.codeLanguages = MIXED_EULER_CODE_LANGUAGES;
    this.codeLines = MIXED_EULER_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '混合图欧拉回路 Dinic 定向引擎 (POJ 1637)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '混合图欧拉回路' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('MIXED_EULERIAN_VALID');
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

  private loadPreset(presetKey: string): void {
    this.stopAutoPlay();
    this.computeTraceSteps(presetKey === 'MIXED_EULERIAN_VALID');
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(isValidCase: boolean): void {
    const steps: MixedStep[] = [];

    if (isValidCase) {
      // 1. 初始任意定向
      steps.push({
        type: 'INIT_ORIENT',
        directedEdges: [
          { u: 1, v: 2, isFlipped: false },
          { u: 2, v: 3, isFlipped: false },
          { u: 3, v: 4, isFlipped: false },
          { u: 4, v: 1, isFlipped: false },
          { u: 2, v: 4, isFlipped: false },
        ],
        degIn: { 1: 1, 2: 1, 3: 1, 4: 2 },
        degOut: { 1: 1, 2: 2, 3: 1, 4: 1 },
        flowVal: 0,
        maxFlowTarget: 1,
        isEulerian: false,
        message: '🔄 [初始任意定向] 无向边任意定向为 2➔3, 3➔4, 4➔1, 2➔4，计算出入度差额 D[u]！',
      });

      // 2. 差额分析
      steps.push({
        type: 'CHECK_DIFF',
        directedEdges: [
          { u: 1, v: 2, isFlipped: false },
          { u: 2, v: 3, isFlipped: false },
          { u: 3, v: 4, isFlipped: false },
          { u: 4, v: 1, isFlipped: false },
          { u: 2, v: 4, isFlipped: false },
        ],
        degIn: { 1: 1, 2: 1, 3: 1, 4: 2 },
        degOut: { 1: 1, 2: 2, 3: 1, 4: 1 },
        flowVal: 0,
        maxFlowTarget: 1,
        isEulerian: false,
        message: '📊 [网络流建图] 节点 4 入度偏多 (D=+1)，连 S➔4(cap=1)；节点 2 出度偏多 (D=-1)，连 2➔T(cap=1)！',
      });

      // 3. Dinic 最大流增广
      steps.push({
        type: 'DINIC_FLOW',
        directedEdges: [
          { u: 1, v: 2, isFlipped: false },
          { u: 2, v: 3, isFlipped: false },
          { u: 3, v: 4, isFlipped: false },
          { u: 4, v: 1, isFlipped: false },
          { u: 2, v: 4, isFlipped: false },
        ],
        degIn: { 1: 1, 2: 1, 3: 1, 4: 2 },
        degOut: { 1: 1, 2: 2, 3: 1, 4: 1 },
        flowVal: 1,
        maxFlowTarget: 1,
        isEulerian: false,
        message: '⚡ [Dinic 增广] 发现增广路 S ➔ 4 ➔ 2 ➔ T，推送流量 1！网络达到满流状态！',
      });

      // 4. 满流翻转边
      steps.push({
        type: 'FLIP_EDGE',
        directedEdges: [
          { u: 1, v: 2, isFlipped: false },
          { u: 2, v: 3, isFlipped: false },
          { u: 3, v: 4, isFlipped: false },
          { u: 4, v: 1, isFlipped: false },
          { u: 4, v: 2, isFlipped: true }, // 翻转为 4➔2
        ],
        degIn: { 1: 1, 2: 2, 3: 1, 4: 1 },
        degOut: { 1: 1, 2: 2, 3: 1, 4: 1 },
        flowVal: 1,
        maxFlowTarget: 1,
        isEulerian: true,
        message: '🔄 [边方向修正] 满流边 (2➔4) 成功翻转为 (4➔2)！所有节点入度严格等于出度 (in=out)！',
      });

      // 5. 欧拉回路成立
      steps.push({
        type: 'RESULT',
        directedEdges: [
          { u: 1, v: 2, isFlipped: false },
          { u: 2, v: 3, isFlipped: false },
          { u: 3, v: 4, isFlipped: false },
          { u: 4, v: 1, isFlipped: false },
          { u: 4, v: 2, isFlipped: true },
        ],
        degIn: { 1: 1, 2: 2, 3: 1, 4: 1 },
        degOut: { 1: 1, 2: 2, 3: 1, 4: 1 },
        flowVal: 1,
        maxFlowTarget: 1,
        isEulerian: true,
        message: '🎉 [欧拉回路构造成功] 闭合回路: 1 ➔ 2 ➔ 3 ➔ 4 ➔ 2 ➔ 4 ➔ 1 遍历整张图所有边！',
      });
    } else {
      steps.push({
        type: 'RESULT',
        directedEdges: [{ u: 1, v: 2, isFlipped: false }],
        degIn: { 1: 0, 2: 1, 3: 0, 4: 0 },
        degOut: { 1: 1, 2: 0, 3: 0, 4: 0 },
        flowVal: 0,
        maxFlowTarget: 0,
        isEulerian: false,
        message: '❌ [无解判定] 节点 1 度数差 D[1]=-1 为奇数，奇偶性不符，无法构成欧拉回路！',
      });
    }

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#mixed-euler-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: MIXED_EULER_CODE_LANGUAGES,
      problemHtml: MIXED_EULER_PROBLEM_HTML,
      analysisHtml: MIXED_EULER_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-mixed-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-mixed-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-mixed-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.mixed-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'MIXED_EULERIAN_VALID';
        this.root?.querySelectorAll('.mixed-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-mixed-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        MixedAudio.isMuted = !MixedAudio.isMuted;
        soundBtn.textContent = MixedAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'INIT_ORIENT' || cur.type === 'CHECK_DIFF') MixedAudio.playLaser();
      else if (cur.type === 'FLIP_EDGE') MixedAudio.playFlip();
      else if (cur.type === 'RESULT') MixedAudio.playVictory();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-mixed-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停定向';

    const step = () => {
      if (!this.isAutoPlaying) return;
      if (this.currentStepPtr < this.traceSteps.length - 1) {
        this.stepForward();
        this.autoPlayTimer = setTimeout(step, 900 / this.playSpeed);
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
    const playBtn = this.root?.querySelector('#btn-mixed-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动定向';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#mixed-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#mixed-status-badge') as HTMLElement | null;
    const flowBadge = this.root.querySelector('#mixed-flow-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'RESULT') {
        statusBadge.textContent = cur.isEulerian ? '🏁 欧拉回路存在' : '❌ 无法构成回路';
        statusBadge.style.background = cur.isEulerian ? '#f0fdf4' : '#fef2f2';
        statusBadge.style.color = cur.isEulerian ? '#16a34a' : '#ef4444';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (flowBadge) {
      flowBadge.textContent = `网络流: ${cur.flowVal} / ${cur.maxFlowTarget} (满流: ${cur.flowVal === cur.maxFlowTarget ? '是' : '否'})`;
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
      // 1. 绘制有向边
      cur.directedEdges.forEach((e) => {
        const p1 = this.nodePositions[e.u];
        const p2 = this.nodePositions[e.v];
        if (!p1 || !p2) return;

        ctx.save();
        ctx.strokeStyle = e.isFlipped ? '#10b981' : '#38bdf8';
        ctx.lineWidth = e.isFlipped ? 3 : 2;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // 绘制箭头
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;

        ctx.fillStyle = e.isFlipped ? '#10b981' : '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(midX, midY);
        ctx.lineTo(midX - 8 * Math.cos(angle - Math.PI / 6), midY - 8 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(midX - 8 * Math.cos(angle + Math.PI / 6), midY - 8 * Math.sin(angle + Math.PI / 6));
        ctx.fill();

        ctx.restore();
      });

      // 2. 绘制节点
      for (let u = 1; u <= this.n; u++) {
        const pos = this.nodePositions[u];
        if (!pos) continue;

        const inD = cur.degIn[u] || 0;
        const outD = cur.degOut[u] || 0;
        const isBalanced = inD === outD;

        ctx.save();
        ctx.fillStyle = isBalanced ? '#064e3b' : '#1e293b';
        ctx.strokeStyle = isBalanced ? '#10b981' : '#38bdf8';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${u}`, pos.x, pos.y);

        // 度数标签
        ctx.font = '9px sans-serif';
        ctx.fillStyle = isBalanced ? '#34d399' : '#facc15';
        ctx.fillText(`in:${inD} out:${outD}`, pos.x, pos.y + 20);

        ctx.restore();
      }

      // 3. 右侧网络流与欧拉回路 HUD
      ctx.save();
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('⚡ Dinic 网络流建图状态:', 255, 30);

      // 网络流卡片
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(255, 42, 180, 52, 6);
      ctx.fill();
      ctx.stroke();

      ctx.font = '10px monospace';
      ctx.fillStyle = '#fde047';
      ctx.fillText(`源汇网络: S ➔ 4 ➔ 2 ➔ T`, 265, 60);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`当前流量: ${cur.flowVal} / 目标: ${cur.maxFlowTarget}`, 265, 80);

      // 欧拉回路定理
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#facc15';
      ctx.fillText('👑 定理判定:', 250, 125);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('1. 度数差 D[u] 必为偶数', 250, 145);
      ctx.fillText('2. 满流反转使 in[u] == out[u]', 250, 165);
      ctx.fillStyle = '#10b981';
      ctx.fillText('3. 有向欧拉回路必定存在！', 250, 185);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const MIXED_EULER_TEMPLATE = `
  <div id="algo-mixed-eulerian-circuit-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🔄</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">混合图欧拉回路 (Mixed Eulerian Circuit)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="mixed-preset-btn active" data-preset="MIXED_EULERIAN_VALID" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">有解标准图</button>
          <button class="mixed-preset-btn" data-preset="MIXED_EULERIAN_IMPOSSIBLE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">无解奇度数图</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="mixed-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-mixed-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-mixed-autoplay" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(2,132,199,0.25);">▶️ 自动定向</button>
        <button id="btn-mixed-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-mixed-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #0369a1;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>⚡ 网络流状态: <b id="mixed-flow-badge" style="color: #0284c7; font-size: 12px;">流量: 0 / 1</b></span>
      </div>
      <div id="mixed-narration-box" style="font-weight: 700; color: #075985;">
        💡 准备就绪：无向边任意定向 + 出入度差额 D[u] + Dinic 最大流满流反转判定！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：混合图拓扑与定向 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="mixed-euler-canvas" width="460" height="220" style="width: 460px; height: 220px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          左侧为 4 节点混合图 | 🟢 绿色边为 Dinic 满流后翻转边 | 节点下方标注出入度平衡态
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="mixed-euler-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'mixed-eulerian-circuit',
  name: '混合图欧拉回路 (Mixed Eulerian Circuit)',
  viewId: 'algo-mixed-eulerian-circuit-view',
  category: 'graph',
  description: '进阶网络流经典建模：任意初始定向、出入度差额 D[u]、Dinic 最大流调整方向与满流回路判定 (POJ 1637)',
  icon: '🔄',
  template: MIXED_EULER_TEMPLATE,
  Visualizer: MixedEulerianCircuitVisualizer,
  difficulty: 3,
  levelOrder: 71,
  learningGoal: '掌握混合图欧拉回路转化为网络流最大流的建模技巧、奇偶性判别及残量网络边反转重构回路',
});
