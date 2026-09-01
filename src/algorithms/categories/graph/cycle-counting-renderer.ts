/**
 * 无向图三元环与四元环定向计数 (Cycle Counting) 可视化引擎
 * 进阶图论: 度数偏序有向化 (出度 <= sqrt(m))、两步打标枚举、严格 O(m*sqrt(m)) 环计数 (洛谷 P1989)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  CYCLE_COUNTING_CODE_LANGUAGES,
  CYCLE_COUNTING_PROBLEM_HTML,
  CYCLE_COUNTING_ANALYSIS_HTML,
} from './cycle-counting-problem-content';

export interface CycleStep {
  type: 'DEG_ORIENT' | 'TAG_OUT_NEIGHBORS' | 'CHECK_TRIANGLE' | 'FOUND_TRIANGLE' | 'ALL_DONE';
  degSnapshot: number[];
  orientedEdges: Array<{ from: number; to: number }>;
  curU?: number;
  curV?: number;
  curW?: number;
  taggedNodes?: number[];
  foundTriangles: Array<[number, number, number]>;
  activeTriangle?: [number, number, number];
  message: string;
}

class CycleAudio {
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

  public static playOrient(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  public static playTag(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playTriangle(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const chord = [659.25, 830.61, 987.77];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.04 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.04);
        osc.stop(ctx.currentTime + idx * 0.04 + 0.2);
      });
    } catch {}
  }

  public static playWin(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const chord = [523.25, 659.25, 783.99, 1046.5];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.14, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.25);
      });
    } catch {}
  }
}

export class CycleCountingVisualizer extends StepVisualizer<any> {
  // 图与节点坐标 (1-indexed)
  private n = 6;
  private origEdges: Array<{ u: number; v: number }> = [];
  private nodePositions: Array<{ x: number; y: number }> = [];

  // 推演步骤
  private traceSteps: CycleStep[] = [];
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
    this.codeLanguages = CYCLE_COUNTING_CODE_LANGUAGES;
    this.codeLines = CYCLE_COUNTING_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '三元环定向统计引擎 (Cycle Counting)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '三元环计数' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_6_NODES_GRAPH');
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

    if (presetKey === 'CLASSIC_6_NODES_GRAPH') {
      this.n = 6;
      this.origEdges = [
        { u: 1, v: 2 },
        { u: 2, v: 3 },
        { u: 3, v: 1 }, // 三角 1-2-3
        { u: 2, v: 4 },
        { u: 4, v: 5 },
        { u: 5, v: 2 }, // 三角 2-4-5
        { u: 3, v: 6 },
        { u: 6, v: 1 }, // 三角 1-3-6
        { u: 3, v: 4 },
      ];
      this.nodePositions = [
        { x: 0, y: 0 },
        { x: 140, y: 40 },  // 1
        { x: 260, y: 40 },  // 2
        { x: 140, y: 150 }, // 3
        { x: 260, y: 150 }, // 4
        { x: 380, y: 95 },  // 5
        { x: 40, y: 95 },   // 6
      ];
    } else {
      this.n = 5;
      // K5 完全图，含 10 个三元环
      this.origEdges = [
        { u: 1, v: 2 }, { u: 1, v: 3 }, { u: 1, v: 4 }, { u: 1, v: 5 },
        { u: 2, v: 3 }, { u: 2, v: 4 }, { u: 2, v: 5 },
        { u: 3, v: 4 }, { u: 3, v: 5 },
        { u: 4, v: 5 },
      ];
      const r = 70;
      const cx = 230, cy = 95;
      this.nodePositions = [{ x: 0, y: 0 }];
      for (let i = 1; i <= 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        this.nodePositions.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
      }
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const n = this.n;
    const deg = Array(n + 1).fill(0);
    this.origEdges.forEach((e) => {
      deg[e.u]++;
      deg[e.v]++;
    });

    const cmp = (u: number, v: number) => deg[u] < deg[v] || (deg[u] === deg[v] && u < v);

    const dagAdj: number[][] = Array.from({ length: n + 1 }, () => []);
    const orientedEdges: Array<{ from: number; to: number }> = [];

    this.origEdges.forEach((e) => {
      if (cmp(e.u, e.v)) {
        dagAdj[e.u].push(e.v);
        orientedEdges.push({ from: e.u, to: e.v });
      } else {
        dagAdj[e.v].push(e.u);
        orientedEdges.push({ from: e.v, to: e.u });
      }
    });

    const steps: CycleStep[] = [];
    const foundTriangles: Array<[number, number, number]> = [];
    const vis = Array(n + 1).fill(0);

    steps.push({
      type: 'DEG_ORIENT',
      degSnapshot: [...deg],
      orientedEdges: [...orientedEdges],
      foundTriangles: [],
      message: `📐 [度数偏序有向化] 各点度数计算完毕，按 deg[u] < deg[v] 定向为 DAG，出度被严格约束在 O(√m) 内！`,
    });

    for (let u = 1; u <= n; u++) {
      const outNeighbors = dagAdj[u];
      if (outNeighbors.length === 0) continue;

      // 1. 打标
      for (const v of outNeighbors) {
        vis[v] = u;
      }

      steps.push({
        type: 'TAG_OUT_NEIGHBORS',
        degSnapshot: [...deg],
        orientedEdges: [...orientedEdges],
        curU: u,
        taggedNodes: [...outNeighbors],
        foundTriangles: [...foundTriangles],
        message: `🟡 [第一层打标] 遍历节点 ${u} 的出边邻居 [${outNeighbors.join(', ')}]，设置时间戳 vis[v] = ${u}！`,
      });

      // 2. 二阶出边探测
      for (const v of outNeighbors) {
        for (const w of dagAdj[v]) {
          if (vis[w] === u) {
            foundTriangles.push([u, v, w]);
            steps.push({
              type: 'FOUND_TRIANGLE',
              degSnapshot: [...deg],
              orientedEdges: [...orientedEdges],
              curU: u,
              curV: v,
              curW: w,
              activeTriangle: [u, v, w],
              foundTriangles: [...foundTriangles],
              message: `🔺 [捕获三元环] 从 ${u} 经 ${v} 到达 ${w}，且 vis[${w}] == ${u}！捕获三元环 (${u}, ${v}, ${w})！`,
            });
          }
        }
      }
    }

    steps.push({
      type: 'ALL_DONE',
      degSnapshot: [...deg],
      orientedEdges: [...orientedEdges],
      foundTriangles: [...foundTriangles],
      message: `🎉 [统计完成] 全图三元环统计完毕，共捕获 ${foundTriangles.length} 个三元环！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#cycle-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: CYCLE_COUNTING_CODE_LANGUAGES,
      problemHtml: CYCLE_COUNTING_PROBLEM_HTML,
      analysisHtml: CYCLE_COUNTING_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-cycle-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-cycle-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-cycle-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.cycle-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_6_NODES_GRAPH';
        this.root?.querySelectorAll('.cycle-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-cycle-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        CycleAudio.isMuted = !CycleAudio.isMuted;
        soundBtn.textContent = CycleAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'DEG_ORIENT') CycleAudio.playOrient();
      else if (cur.type === 'TAG_OUT_NEIGHBORS') CycleAudio.playTag();
      else if (cur.type === 'FOUND_TRIANGLE') CycleAudio.playTriangle();
      else if (cur.type === 'ALL_DONE') CycleAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-cycle-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停统计';

    const step = () => {
      if (!this.isAutoPlaying) return;
      if (this.currentStepPtr < this.traceSteps.length - 1) {
        this.stepForward();
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
    const playBtn = this.root?.querySelector('#btn-cycle-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动统计';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#cycle-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#cycle-status-badge') as HTMLElement | null;
    const countBadge = this.root.querySelector('#cycle-count-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = '🏁 统计完毕';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (countBadge) {
      countBadge.textContent = `${cur.foundTriangles.length} 个`;
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

    // 1. 绘制当前捕获的高亮三角形
    if (cur && cur.activeTriangle) {
      const [u, v, w] = cur.activeTriangle;
      const p1 = this.nodePositions[u];
      const p2 = this.nodePositions[v];
      const p3 = this.nodePositions[w];
      if (p1 && p2 && p3) {
        ctx.save();
        ctx.fillStyle = 'rgba(250, 204, 21, 0.22)';
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 14;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // 2. 绘制有向边
    if (cur) {
      cur.orientedEdges.forEach((e) => {
        const p1 = this.nodePositions[e.from];
        const p2 = this.nodePositions[e.to];
        if (!p1 || !p2) return;

        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // 箭头
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const arrowX = p2.x - 17 * Math.cos(angle);
        const arrowY = p2.y - 17 * Math.sin(angle);

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - 7 * Math.cos(angle - Math.PI / 6), arrowY - 7 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(arrowX - 7 * Math.cos(angle + Math.PI / 6), arrowY - 7 * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });
    }

    // 3. 绘制节点
    for (let i = 1; i <= this.n; i++) {
      const pos = this.nodePositions[i];
      if (!pos) continue;

      const isCurU = cur && cur.curU === i;
      const isTagged = cur && cur.taggedNodes && cur.taggedNodes.includes(i);
      const isTriNode = cur && cur.activeTriangle && cur.activeTriangle.includes(i);
      const degVal = cur ? cur.degSnapshot[i] : 0;

      ctx.save();
      let fillColor = '#1e293b';
      let strokeColor = '#38bdf8';
      let radius = 15;

      if (isTriNode) {
        strokeColor = '#facc15';
        fillColor = '#854d0e';
        radius = 17 + Math.sin(this.pulseAnim) * 1.5;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
      } else if (isCurU) {
        strokeColor = '#ec4899';
        fillColor = '#831843';
        radius = 17;
      } else if (isTagged) {
        strokeColor = '#22c55e';
        fillColor = '#14532d';
      }

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 标签
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${i}`, pos.x, pos.y - 3);

      ctx.font = '8.5px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`d:${degVal}`, pos.x, pos.y + 7);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const CYCLE_COUNTING_TEMPLATE = `
  <div id="algo-cycle-counting-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🔺</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">三元环定向计数 (Cycle Counting)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="cycle-preset-btn active" data-preset="CLASSIC_6_NODES_GRAPH" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">6 节点经典三角图</button>
          <button class="cycle-preset-btn" data-preset="COMPLETE_K5_GRAPH" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">K5 完全图 (10 三角)</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="cycle-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-cycle-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-cycle-autoplay" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(245,158,11,0.25);">▶️ 自动统计</button>
        <button id="btn-cycle-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-cycle-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #92400e;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>🔺 已捕获三元环: <b id="cycle-count-badge" style="color: #b45309; font-size: 12px;">0 个</b></span>
      </div>
      <div id="cycle-narration-box" style="font-weight: 700; color: #78350f;">
        💡 准备就绪：度数偏序定向 DAG，两步打标严格 O(m√m) 极速统计！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：图 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="cycle-canvas" width="460" height="200" style="width: 460px; height: 200px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🌸 粉色为当前枚举点 u | 🟢 绿色为一层出边邻居 v (vis[v]=u) | 🟡 金色高亮为捕获的三元环
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="cycle-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'cycle-counting',
  name: '三元环与四元环计数 (Cycle Counting)',
  viewId: 'algo-cycle-counting-view',
  category: 'graph',
  description: '进阶图论高效环计数算法：度数偏序定向为 DAG (出度 <= sqrt(m))、两步打标枚举、严格 O(m*sqrt(m)) 极速三元环统计 (洛谷 P1989)',
  icon: '🔺',
  template: CYCLE_COUNTING_TEMPLATE,
  Visualizer: CycleCountingVisualizer,
  difficulty: 3,
  levelOrder: 53,
  learningGoal: '掌握度数偏序有向化定理、DAG 最大出度上界 O(√m) 的严密证明与无冗余三元环枚举实现',
});
