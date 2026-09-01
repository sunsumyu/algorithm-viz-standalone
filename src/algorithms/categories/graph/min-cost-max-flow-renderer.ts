/**
 * 最小费用最大流 (Minimum Cost Maximum Flow - MCMF) 可视化引擎
 * 参考左程云《算法通关课》【必备篇】class072: 连续最短路算法 (SPFA / EK)、成对反向弧负费用退费与费用累加 (洛谷 P3381)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  MCMF_CODE_LANGUAGES,
  MCMF_PROBLEM_HTML,
  MCMF_ANALYSIS_HTML,
} from './min-cost-max-flow-problem-content';

export interface MCMFEdgeVisual {
  from: number;
  to: number;
  cap: number;
  flow: number;
  cost: number;
}

export interface MCMFStep {
  type: 'SPFA_PATH' | 'PUSH_FLOW' | 'ALL_DONE';
  distSnapshot: number[];
  edgesSnapshot: MCMFEdgeVisual[];
  activePath?: number[];
  pushedFlow?: number;
  stepCost?: number;
  totalMaxFlow: number;
  totalMinCost: number;
  message: string;
}

class MCMFAudio {
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

  public static playSpfa(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playCoin(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const notes = [659.25, 987.77, 1318.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.14, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.16);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.16);
      });
    } catch {}
  }

  public static playWin(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.3);
      });
    } catch {}
  }
}

export class MinCostMaxFlowVisualizer extends StepVisualizer<any> {
  // 网络拓扑 (1-indexed)
  private n = 4;
  private s = 1;
  private t = 4;
  private rawEdges: Array<{ u: number; v: number; cap: number; cost: number }> = [];
  private nodePositions: Array<{ x: number; y: number }> = [];

  // 推演步骤
  private traceSteps: MCMFStep[] = [];
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
    this.codeLanguages = MCMF_CODE_LANGUAGES;
    this.codeLines = MCMF_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '最小费用最大流 MCMF 引擎 (洛谷 P3381)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '最小费用最大流' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_4_NODE_MCMF');
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

    if (presetKey === 'CLASSIC_4_NODE_MCMF') {
      this.n = 4;
      this.s = 1;
      this.t = 4;
      this.rawEdges = [
        { u: 1, v: 2, cap: 4, cost: 1 },  // N1->N2
        { u: 1, v: 3, cap: 2, cost: 4 },  // N1->N3
        { u: 2, v: 3, cap: 2, cost: 1 },  // N2->N3
        { u: 2, v: 4, cap: 2, cost: 5 },  // N2->N4
        { u: 3, v: 4, cap: 4, cost: 2 },  // N3->N4
      ];
      this.nodePositions = [
        { x: 0, y: 0 },
        { x: 60, y: 115 },  // 1 (S)
        { x: 190, y: 55 },  // 2
        { x: 190, y: 175 }, // 3
        { x: 330, y: 115 }, // 4 (T)
      ];
    } else if (presetKey === 'PARALLEL_ROUTE_COMPETITION') {
      this.n = 4;
      this.s = 1;
      this.t = 4;
      this.rawEdges = [
        { u: 1, v: 2, cap: 3, cost: 2 },
        { u: 2, v: 4, cap: 3, cost: 2 },
        { u: 1, v: 3, cap: 5, cost: 6 },
        { u: 3, v: 4, cap: 5, cost: 6 },
      ];
      this.nodePositions = [
        { x: 0, y: 0 },
        { x: 60, y: 115 },
        { x: 190, y: 55 },
        { x: 190, y: 175 },
        { x: 330, y: 115 },
      ];
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const n = this.n;
    const s = this.s;
    const t = this.t;

    interface EdgeInternal {
      to: number;
      cap: number;
      flow: number;
      cost: number;
      rev: number;
      isRev: boolean;
    }

    const adj: EdgeInternal[][] = Array.from({ length: n + 1 }, () => []);
    this.rawEdges.forEach(({ u, v, cap, cost }) => {
      adj[u].push({ to: v, cap, flow: 0, cost, rev: adj[v].length, isRev: false });
      adj[v].push({ to: u, cap: 0, flow: 0, cost: -cost, rev: adj[u].length - 1, isRev: true });
    });

    const dist: number[] = Array(n + 1).fill(Infinity);
    const preNode: number[] = Array(n + 1).fill(0);
    const preEdge: number[] = Array(n + 1).fill(0);
    const inQueue: boolean[] = Array(n + 1).fill(false);

    let totalMaxFlow = 0;
    let totalMinCost = 0;

    const steps: MCMFStep[] = [];

    const getSnapshot = (): MCMFEdgeVisual[] => {
      const list: MCMFEdgeVisual[] = [];
      for (let u = 1; u <= n; u++) {
        for (const e of adj[u]) {
          if (!e.isRev) {
            list.push({ from: u, to: e.to, cap: e.cap, flow: e.flow, cost: e.cost });
          }
        }
      }
      return list;
    };

    const spfa = (): boolean => {
      dist.fill(Infinity);
      inQueue.fill(false);
      const q: number[] = [s];
      dist[s] = 0;
      inQueue[s] = true;

      while (q.length > 0) {
        const u = q.shift()!;
        inQueue[u] = false;

        for (let i = 0; i < adj[u].length; i++) {
          const e = adj[u][i];
          if (e.cap - e.flow > 0 && dist[e.to] > dist[u] + e.cost) {
            dist[e.to] = dist[u] + e.cost;
            preNode[e.to] = u;
            preEdge[e.to] = i;
            if (!inQueue[e.to]) {
              inQueue[e.to] = true;
              q.push(e.to);
            }
          }
        }
      }
      return dist[t] < Infinity;
    };

    while (spfa()) {
      // 提取最短费用增广路径
      const path: number[] = [];
      let pushed = Infinity;

      for (let u = t; u !== s; u = preNode[u]) {
        path.unshift(u);
        const e = adj[preNode[u]][preEdge[u]];
        pushed = Math.min(pushed, e.cap - e.flow);
      }
      path.unshift(s);

      steps.push({
        type: 'SPFA_PATH',
        distSnapshot: [...dist],
        edgesSnapshot: getSnapshot(),
        activePath: [...path],
        totalMaxFlow,
        totalMinCost,
        message: `🧭 SPFA 寻路：找到单位费用最低的最短增广路 [${path.map((p) => 'N' + p).join(' → ')}]，单位距离 = $${dist[t]}。`,
      });

      // 推流
      for (let u = t; u !== s; u = preNode[u]) {
        const e = adj[preNode[u]][preEdge[u]];
        e.flow += pushed;
        adj[u][e.rev].flow -= pushed;
      }

      const costDelta = pushed * dist[t];
      totalMaxFlow += pushed;
      totalMinCost += costDelta;

      steps.push({
        type: 'PUSH_FLOW',
        distSnapshot: [...dist],
        edgesSnapshot: getSnapshot(),
        activePath: [...path],
        pushedFlow: pushed,
        stepCost: costDelta,
        totalMaxFlow,
        totalMinCost,
        message: `💰 [推流增广] 注入流量 +${pushed}，单次新增费用 ${pushed}×$${dist[t]} = +$${costDelta}！当前累计: ${totalMaxFlow} 流量, $${totalMinCost} 费用。`,
      });
    }

    steps.push({
      type: 'ALL_DONE',
      distSnapshot: [...dist],
      edgesSnapshot: getSnapshot(),
      totalMaxFlow,
      totalMinCost,
      message: `🏁 SPFA 无法再找到费用增广路！全局最小费用最大流计算完成！最终结果：最大流 = ${totalMaxFlow}，最小费用 = $${totalMinCost}！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#mcmf-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: MCMF_CODE_LANGUAGES,
      problemHtml: MCMF_PROBLEM_HTML,
      analysisHtml: MCMF_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-mcmf-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-mcmf-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-mcmf-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.mcmf-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_4_NODE_MCMF';
        this.root?.querySelectorAll('.mcmf-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-mcmf-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        MCMFAudio.isMuted = !MCMFAudio.isMuted;
        soundBtn.textContent = MCMFAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'SPFA_PATH') MCMFAudio.playSpfa();
      else if (cur.type === 'PUSH_FLOW') MCMFAudio.playCoin();
      else if (cur.type === 'ALL_DONE') MCMFAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-mcmf-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停推演';

    const step = () => {
      if (!this.isAutoPlaying) return;
      if (this.currentStepPtr < this.traceSteps.length - 1) {
        this.stepForward();
        this.autoPlayTimer = setTimeout(step, 750 / this.playSpeed);
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
    const playBtn = this.root?.querySelector('#btn-mcmf-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动增广';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#mcmf-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#mcmf-status-badge') as HTMLElement | null;
    const flowBadge = this.root.querySelector('#mcmf-flow-val') as HTMLElement | null;
    const costBadge = this.root.querySelector('#mcmf-cost-val') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = '🎯 最小费用最大流达成';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (flowBadge) flowBadge.textContent = `${cur.totalMaxFlow}`;
    if (costBadge) costBadge.textContent = `$${cur.totalMinCost}`;
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

    // 1. 绘制管道与流量/费用
    if (cur && cur.edgesSnapshot) {
      cur.edgesSnapshot.forEach((e) => {
        const p1 = this.nodePositions[e.from];
        const p2 = this.nodePositions[e.to];
        if (!p1 || !p2) return;

        const isFull = e.flow === e.cap;
        const hasFlow = e.flow > 0;
        const isPathEdge = cur.activePath && cur.activePath.includes(e.from) && cur.activePath.includes(e.to) && cur.activePath.indexOf(e.to) === cur.activePath.indexOf(e.from) + 1;

        ctx.save();
        if (isPathEdge) {
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 12;
        } else if (isFull) {
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
        } else if (hasFlow) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
        } else {
          ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
          ctx.lineWidth = 2;
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // 标签：flow/cap ($cost)
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = isPathEdge ? '#facc15' : isFull ? '#f87171' : '#cbd5e1';
        ctx.fillText(`${e.flow}/${e.cap} ($${e.cost})`, midX, midY - 4);

        ctx.restore();
      });
    }

    // 2. 绘制节点
    for (let i = 1; i <= this.n; i++) {
      const pos = this.nodePositions[i];
      if (!pos) continue;

      const d = cur ? cur.distSnapshot[i] : Infinity;
      const isSource = i === this.s;
      const isSink = i === this.t;
      const isPath = cur && cur.activePath && cur.activePath.includes(i);

      ctx.save();
      let radius = 18;
      let fillColor = '#1e293b';
      let strokeColor = '#475569';

      if (isSource) {
        fillColor = '#854d0e';
        strokeColor = '#facc15';
      } else if (isSink) {
        fillColor = '#1e3a8a';
        strokeColor = '#3b82f6';
      }

      if (isPath) {
        strokeColor = '#facc15';
        radius = 21 + Math.sin(this.pulseAnim) * 2;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 14;
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
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isSource ? 'S' : isSink ? 'T' : `N${i}`, pos.x, pos.y - 3);

      // 距离费用 $d
      ctx.font = '8.5px monospace';
      ctx.fillStyle = d < Infinity ? '#38bdf8' : '#64748b';
      ctx.fillText(d < Infinity ? `$${d}` : '$∞', pos.x, pos.y + 7);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const MCMF_TEMPLATE = `
  <div id="algo-min-cost-max-flow-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">💰</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">最小费用最大流 (MCMF)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="mcmf-preset-btn active" data-preset="CLASSIC_4_NODE_MCMF" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典费用权衡网</button>
          <button class="mcmf-preset-btn" data-preset="PARALLEL_ROUTE_COMPETITION" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">并行梯级费率网</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="mcmf-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-mcmf-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步增广</button>
        <button id="btn-mcmf-autoplay" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(16,185,129,0.25);">▶️ 自动增广</button>
        <button id="btn-mcmf-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-mcmf-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #166534;">
      <div style="display: flex; gap: 14px; align-items: center;">
        <span>🎯 最大流: <b id="mcmf-flow-val" style="color: #2563eb; font-size: 12.5px;">0</b></span>
        <span>💵 最小费用: <b id="mcmf-cost-val" style="color: #16a34a; font-size: 12.5px;">$0</b></span>
      </div>
      <div id="mcmf-narration-box" style="font-weight: 700; color: #14532d;">
        💡 准备就绪：SPFA 寻找单位费用最短路，增广推流并累加费用！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：费用流残量网络 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="mcmf-canvas" width="460" height="230" style="width: 460px; height: 230px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          管道标注为 [流量/容量 ($单位费用)] | 节点角标为 SPFA 最短费用标号 $dist
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="mcmf-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'min-cost-max-flow',
  name: '最小费用最大流 (Min-Cost Max-Flow)',
  viewId: 'algo-min-cost-max-flow-view',
  category: 'graph',
  description: '运筹学网络流核心算法：左程云 class072 连续最短路算法 (SPFA / EK)、成对反向弧负费用退费与费用累加 (洛谷 P3381)',
  icon: '💰',
  template: MCMF_TEMPLATE,
  Visualizer: MinCostMaxFlowVisualizer,
  difficulty: 3,
  levelOrder: 40,
  learningGoal: '掌握费用流的残量网络负费用定义、SPFA 连续最短路增广机制与贪心推流达成全局最小总费用的证明',
});
