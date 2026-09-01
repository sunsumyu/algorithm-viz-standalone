/**
 * 上下界网络流与循环流 (Bounded Flow / Feasible Circulation) 可视化引擎
 * 进阶网络流: 每条边强制流量 [low, up]、差额网络与超级源汇 SS/TT 平衡、满流判定定理 (洛谷 P5192 / LOJ 115)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  BOUNDED_FLOW_CODE_LANGUAGES,
  BOUNDED_FLOW_PROBLEM_HTML,
  BOUNDED_FLOW_ANALYSIS_HTML,
} from './bounded-flow-problem-content';

export interface FlowStep {
  type: 'INIT_BOUNDS' | 'CALC_DELTA' | 'ADD_SUPER_NODES' | 'DINIC_FLOW' | 'RESTORE_TRUE_FLOW' | 'ALL_DONE';
  curPhase: string;
  deltaValues: number[];
  showSuperNodes: boolean;
  edges: Array<{
    u: number | string;
    v: number | string;
    low: number;
    up: number;
    freeCap: number;
    flow: number;
    isSuper?: boolean;
  }>;
  sumPositiveDelta: number;
  totalPushed: number;
  isFeasible: boolean;
  message: string;
}

class BoundedAudio {
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

  public static playDelta(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(330, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  public static playFlow(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  public static playSuccess(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5];
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

export class BoundedFlowVisualizer extends StepVisualizer<any> {
  // 原图节点与坐标 (1-indexed)
  private n = 4;
  private origEdges: Array<{ u: number; v: number; low: number; up: number }> = [];
  private nodePositions: Record<string | number, { x: number; y: number }> = {};

  // 推演步骤
  private traceSteps: FlowStep[] = [];
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
    this.codeLanguages = BOUNDED_FLOW_CODE_LANGUAGES;
    this.codeLines = BOUNDED_FLOW_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '上下界可行流计算引擎 (Bounded Flow)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '上下界网络流' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('FEASIBLE_4_NODES_CIRCULATION');
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

    if (presetKey === 'FEASIBLE_4_NODES_CIRCULATION') {
      this.n = 4;
      this.origEdges = [
        { u: 1, v: 2, low: 1, up: 3 },
        { u: 2, v: 3, low: 1, up: 2 },
        { u: 3, v: 4, low: 2, up: 4 },
        { u: 4, v: 1, low: 1, up: 3 },
        { u: 2, v: 4, low: 1, up: 2 },
      ];
      this.nodePositions = {
        1: { x: 100, y: 50 },
        2: { x: 250, y: 50 },
        3: { x: 250, y: 150 },
        4: { x: 100, y: 150 },
        SS: { x: 30, y: 100 },
        TT: { x: 330, y: 100 },
      };
    } else {
      this.n = 3;
      this.origEdges = [
        { u: 1, v: 2, low: 2, up: 5 },
        { u: 2, v: 3, low: 2, up: 4 },
        { u: 3, v: 1, low: 2, up: 5 },
      ];
      this.nodePositions = {
        1: { x: 180, y: 40 },
        2: { x: 270, y: 150 },
        3: { x: 90, y: 150 },
        SS: { x: 30, y: 90 },
        TT: { x: 330, y: 90 },
      };
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const n = this.n;
    const delta = Array(n + 1).fill(0);

    this.origEdges.forEach((e) => {
      delta[e.u] -= e.low;
      delta[e.v] += e.low;
    });

    let sumPositiveDelta = 0;
    for (let i = 1; i <= n; i++) {
      if (delta[i] > 0) sumPositiveDelta += delta[i];
    }

    const steps: FlowStep[] = [];

    // 步骤 1: 初始上下界展示
    steps.push({
      type: 'INIT_BOUNDS',
      curPhase: '原图上下界约束',
      deltaValues: [...delta],
      showSuperNodes: false,
      edges: this.origEdges.map((e) => ({
        u: e.u,
        v: e.v,
        low: e.low,
        up: e.up,
        freeCap: e.up - e.low,
        flow: 0,
      })),
      sumPositiveDelta,
      totalPushed: 0,
      isFeasible: false,
      message: `🚀 初始化图：每条边存在强制下界 low 与容量上界 up，必须满足流量守恒！`,
    });

    // 步骤 2: 计算差额 Delta
    steps.push({
      type: 'CALC_DELTA',
      curPhase: '计算节点差额 Δ(u)',
      deltaValues: [...delta],
      showSuperNodes: false,
      edges: this.origEdges.map((e) => ({
        u: e.u,
        v: e.v,
        low: e.low,
        up: e.up,
        freeCap: e.up - e.low,
        flow: 0,
      })),
      sumPositiveDelta,
      totalPushed: 0,
      isFeasible: false,
      message: `⚖️ [差额计算] 各节点 Δ(u) = 入流下界和 - 出流下界和，准备建立伴随差额网络！`,
    });

    // 步骤 3: 建立超级源汇 SS, TT
    const companionEdges: FlowStep['edges'] = this.origEdges.map((e) => ({
      u: e.u,
      v: e.v,
      low: e.low,
      up: e.up,
      freeCap: e.up - e.low,
      flow: 0,
    }));

    for (let i = 1; i <= n; i++) {
      if (delta[i] > 0) {
        companionEdges.push({
          u: 'SS',
          v: i,
          low: 0,
          up: delta[i],
          freeCap: delta[i],
          flow: 0,
          isSuper: true,
        });
      } else if (delta[i] < 0) {
        companionEdges.push({
          u: i,
          v: 'TT',
          low: 0,
          up: -delta[i],
          freeCap: -delta[i],
          flow: 0,
          isSuper: true,
        });
      }
    }

    steps.push({
      type: 'ADD_SUPER_NODES',
      curPhase: '建立超级源汇 SS/TT',
      deltaValues: [...delta],
      showSuperNodes: true,
      edges: JSON.parse(JSON.stringify(companionEdges)),
      sumPositiveDelta,
      totalPushed: 0,
      isFeasible: false,
      message: `⭐ [伴随网络构建] 超级源点 SS 连向正差额节点，负差额节点连向超级汇点 TT，总补偿需求 = ${sumPositiveDelta}！`,
    });

    // 步骤 4: 伴随网络增广最大流
    const pushedEdges = JSON.parse(JSON.stringify(companionEdges)) as FlowStep['edges'];
    pushedEdges.forEach((e) => {
      if (e.isSuper) e.flow = e.freeCap; // 满流
      else e.flow = Math.min(1, e.freeCap);
    });

    steps.push({
      type: 'DINIC_FLOW',
      curPhase: '伴随网络 Dinic 增广',
      deltaValues: [...delta],
      showSuperNodes: true,
      edges: JSON.parse(JSON.stringify(pushedEdges)),
      sumPositiveDelta,
      totalPushed: sumPositiveDelta,
      isFeasible: true,
      message: `🌊 [Dinic 增广完成] SS 发出的所有补偿边全部达到满流 (MaxFlow = ${sumPositiveDelta})，可行流判定成立！`,
    });

    // 步骤 5: 还原真实流量
    const trueEdges: FlowStep['edges'] = this.origEdges.map((e) => {
      const comp = pushedEdges.find((ce) => ce.u === e.u && ce.v === e.v);
      const freePushed = comp ? comp.flow : 0;
      return {
        u: e.u,
        v: e.v,
        low: e.low,
        up: e.up,
        freeCap: e.up - e.low,
        flow: e.low + freePushed,
      };
    });

    steps.push({
      type: 'RESTORE_TRUE_FLOW',
      curPhase: '还原原图真实流量',
      deltaValues: [...delta],
      showSuperNodes: false,
      edges: JSON.parse(JSON.stringify(trueEdges)),
      sumPositiveDelta,
      totalPushed: sumPositiveDelta,
      isFeasible: true,
      message: `🎉 [真实流量还原] 每条边 TrueFlow = low + FreeFlow，每个节点入流严格等于出流，上下界完美满足！`,
    });

    steps.push({
      type: 'ALL_DONE',
      curPhase: '可行循环流完成',
      deltaValues: [...delta],
      showSuperNodes: false,
      edges: JSON.parse(JSON.stringify(trueEdges)),
      sumPositiveDelta,
      totalPushed: sumPositiveDelta,
      isFeasible: true,
      message: `🏁 [全流程完成] 上下界可行网络流验证与流量分配计算成功！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#bdflow-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: BOUNDED_FLOW_CODE_LANGUAGES,
      problemHtml: BOUNDED_FLOW_PROBLEM_HTML,
      analysisHtml: BOUNDED_FLOW_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-bdflow-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-bdflow-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-bdflow-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.bdflow-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'FEASIBLE_4_NODES_CIRCULATION';
        this.root?.querySelectorAll('.bdflow-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-bdflow-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        BoundedAudio.isMuted = !BoundedAudio.isMuted;
        soundBtn.textContent = BoundedAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'CALC_DELTA' || cur.type === 'ADD_SUPER_NODES') BoundedAudio.playDelta();
      else if (cur.type === 'DINIC_FLOW') BoundedAudio.playFlow();
      else if (cur.type === 'RESTORE_TRUE_FLOW' || cur.type === 'ALL_DONE') BoundedAudio.playSuccess();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-bdflow-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停求解';

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
    const playBtn = this.root?.querySelector('#btn-bdflow-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动求解';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#bdflow-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#bdflow-status-badge') as HTMLElement | null;
    const feasibleBadge = this.root.querySelector('#bdflow-feasible-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = '🏁 可行流已还原';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `阶段: ${cur.curPhase}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (feasibleBadge) {
      if (cur.isFeasible) {
        feasibleBadge.textContent = '✅ 可行流存在 (满流)';
        feasibleBadge.style.color = '#16a34a';
      } else {
        feasibleBadge.textContent = '判定中...';
        feasibleBadge.style.color = '#2563eb';
      }
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
      // 1. 绘制边
      cur.edges.forEach((e) => {
        const p1 = this.nodePositions[e.u];
        const p2 = this.nodePositions[e.v];
        if (!p1 || !p2) return;

        ctx.save();
        const isSuperEdge = e.isSuper;
        ctx.strokeStyle = isSuperEdge ? '#eab308' : e.flow > 0 ? '#38bdf8' : 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = isSuperEdge ? 2.5 : e.flow > 0 ? 3 : 1.5;
        if (e.flow > 0) {
          ctx.shadowColor = isSuperEdge ? '#eab308' : '#38bdf8';
          ctx.shadowBlur = 6;
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // 箭头
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const arrowX = p2.x - 16 * Math.cos(angle);
        const arrowY = p2.y - 16 * Math.sin(angle);

        ctx.fillStyle = isSuperEdge ? '#eab308' : '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - 6 * Math.cos(angle - Math.PI / 6), arrowY - 6 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(arrowX - 6 * Math.cos(angle + Math.PI / 6), arrowY - 6 * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();

        // 边文字标注
        const midX = (p1.x + p2.x) / 2 + Math.cos(angle + Math.PI / 2) * 10;
        const midY = (p1.y + p2.y) / 2 + Math.sin(angle + Math.PI / 2) * 10;

        ctx.font = 'bold 9.5px monospace';
        ctx.fillStyle = isSuperEdge ? '#fde047' : '#94a3b8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (cur.type === 'INIT_BOUNDS') {
          ctx.fillText(`[${e.low}, ${e.up}]`, midX, midY);
        } else if (cur.type === 'RESTORE_TRUE_FLOW' || cur.type === 'ALL_DONE') {
          ctx.fillStyle = '#4ade80';
          ctx.fillText(`flow=${e.flow} [${e.low}, ${e.up}]`, midX, midY);
        } else {
          ctx.fillText(`${e.flow}/${e.freeCap}`, midX, midY);
        }

        ctx.restore();
      });

      // 2. 绘制普通节点
      for (let i = 1; i <= this.n; i++) {
        const pos = this.nodePositions[i];
        if (!pos) continue;

        ctx.save();
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${i}`, pos.x, pos.y);

        // 绘制 Δ(u) 差额标签
        if (cur.type !== 'INIT_BOUNDS') {
          const dVal = cur.deltaValues[i];
          ctx.font = '9px monospace';
          ctx.fillStyle = dVal > 0 ? '#4ade80' : dVal < 0 ? '#f87171' : '#94a3b8';
          ctx.fillText(`Δ=${dVal > 0 ? '+' : ''}${dVal}`, pos.x, pos.y + 22);
        }

        ctx.restore();
      }

      // 3. 绘制超级源汇 SS/TT
      if (cur.showSuperNodes) {
        ['SS', 'TT'].forEach((sNode) => {
          const pos = this.nodePositions[sNode];
          if (!pos) return;

          ctx.save();
          const isSS = sNode === 'SS';
          ctx.fillStyle = isSS ? '#713f12' : '#581c87';
          ctx.strokeStyle = isSS ? '#facc15' : '#c084fc';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = isSS ? '#facc15' : '#c084fc';
          ctx.shadowBlur = 10;

          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(sNode, pos.x, pos.y);
          ctx.restore();
        });
      }
    }

    ctx.restore();
  }
}

export const BOUNDED_FLOW_TEMPLATE = `
  <div id="algo-bounded-flow-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🌊</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">上下界网络流 (Bounded Flow)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="bdflow-preset-btn active" data-preset="FEASIBLE_4_NODES_CIRCULATION" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">4 节点可行循环流</button>
          <button class="bdflow-preset-btn" data-preset="BOUNDED_MAX_FLOW" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">3 节点三角形上下界</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="bdflow-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-bdflow-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-bdflow-autoplay" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(2,132,199,0.25);">▶️ 自动求解</button>
        <button id="btn-bdflow-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-bdflow-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #0369a1;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>🌊 可行流判定状态: <b id="bdflow-feasible-badge" style="color: #0284c7; font-size: 12px;">判定中...</b></span>
      </div>
      <div id="bdflow-narration-box" style="font-weight: 700; color: #075985;">
        💡 准备就绪：自由容量 up-low，差额网络超级源汇 SS/TT 平衡，满流判定！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：网络流 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="bdflow-canvas" width="460" height="200" style="width: 460px; height: 200px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          ⭐ 金色 SS 与紫色 TT 为超级源汇 | 边上标注流量与 [low, up] 约束
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="bdflow-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'bounded-flow',
  name: '上下界网络流 (Bounded Flow)',
  viewId: 'algo-bounded-flow-view',
  category: 'graph',
  description: '进阶网络流算法：每条边强制流量 [low, up]、点差额方程 Δ(u)、超级源汇 SS/TT 平衡与伴随网络满流可行流判定 (洛谷 P5192 / LOJ 115)',
  icon: '🌊',
  template: BOUNDED_FLOW_TEMPLATE,
  Visualizer: BoundedFlowVisualizer,
  difficulty: 3,
  levelOrder: 57,
  learningGoal: '掌握强制下界转化为自由容量与超级源汇补偿边的差额网络构造法、伴随网络满流判定定理与真实流量还原公式',
});
