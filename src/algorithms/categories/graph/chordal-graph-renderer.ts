/**
 * 弦图判定与最大势算法 MCS (Chordal Graph & MCS) 可视化引擎
 * 进阶图论: 完美消除序列 (PEO)、最大势算法 (Maximum Cardinality Search - O(V+E))、极大团计数
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  CHORDAL_GRAPH_CODE_LANGUAGES,
  CHORDAL_GRAPH_PROBLEM_HTML,
  CHORDAL_GRAPH_ANALYSIS_HTML,
} from './chordal-graph-problem-content';

export interface ChordalStep {
  type: 'SELECT_MAX_LABEL' | 'UPDATE_NEIGHBORS' | 'VERIFY_PEO_NODE' | 'ALL_DONE';
  curNode: number;
  labelMap: Record<number, number>;
  peoList: number[];
  visitedNodes: number[];
  currentClique?: number[];
  isChordal: boolean;
  message: string;
}

class ChordalAudio {
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

  public static playSelect(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playVerify(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
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

export class ChordalGraphVisualizer extends StepVisualizer<any> {
  private n = 5;
  private graphNodes: Record<number, { x: number; y: number }> = {
    1: { x: 50, y: 110 },
    2: { x: 100, y: 50 },
    3: { x: 120, y: 140 },
    4: { x: 170, y: 60 },
    5: { x: 210, y: 130 },
  };
  private graphEdges: Array<{ u: number; v: number; isChord: boolean }> = [
    { u: 1, v: 2, isChord: false },
    { u: 1, v: 3, isChord: false },
    { u: 2, v: 3, isChord: true },
    { u: 2, v: 4, isChord: false },
    { u: 3, v: 4, isChord: true },
    { u: 3, v: 5, isChord: false },
    { u: 4, v: 5, isChord: false },
  ];

  // 推演步骤
  private traceSteps: ChordalStep[] = [];
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
    this.codeLanguages = CHORDAL_GRAPH_CODE_LANGUAGES;
    this.codeLines = CHORDAL_GRAPH_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '弦图判定与极大团 MCS 引擎 (Chordal Graph)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '弦图判定与 MCS 算法' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_CHORDAL_5');
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
    const steps: ChordalStep[] = [];
    const labels: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const vis: number[] = [];
    const peo: number[] = [];

    // 1. MCS 倒序选取节点
    // 选 5 (label 0)
    vis.push(5);
    labels[3]++;
    labels[4]++;
    steps.push({
      type: 'SELECT_MAX_LABEL',
      curNode: 5,
      labelMap: { ...labels },
      peoList: [5],
      visitedNodes: [...vis],
      isChordal: true,
      message: '🎯 [MCS 选取] 初始任选节点 5 作为 PEO 逆序首位，其未访问邻居 {3, 4} 势值 +1！',
    });

    // 选 4 (label 1)
    vis.push(4);
    labels[2]++;
    labels[3]++;
    steps.push({
      type: 'SELECT_MAX_LABEL',
      curNode: 4,
      labelMap: { ...labels },
      peoList: [4, 5],
      visitedNodes: [...vis],
      isChordal: true,
      message: '🎯 [MCS 选取] 当前势最大节点 4 (势=1)，邻居 {2, 3} 势值 +1！',
    });

    // 选 3 (label 2)
    vis.push(3);
    labels[1]++;
    labels[2]++;
    steps.push({
      type: 'SELECT_MAX_LABEL',
      curNode: 3,
      labelMap: { ...labels },
      peoList: [3, 4, 5],
      visitedNodes: [...vis],
      isChordal: true,
      message: '🎯 [MCS 选取] 当前势最大节点 3 (势=2)，邻居 {1, 2} 势值 +1！',
    });

    // 选 2 (label 2)
    vis.push(2);
    labels[1]++;
    steps.push({
      type: 'SELECT_MAX_LABEL',
      curNode: 2,
      labelMap: { ...labels },
      peoList: [2, 3, 4, 5],
      visitedNodes: [...vis],
      isChordal: true,
      message: '🎯 [MCS 选取] 选取节点 2 (势=2)，邻居 {1} 势值 +1！',
    });

    // 选 1
    vis.push(1);
    steps.push({
      type: 'SELECT_MAX_LABEL',
      curNode: 1,
      labelMap: { ...labels },
      peoList: [1, 2, 3, 4, 5],
      visitedNodes: [...vis],
      isChordal: true,
      message: '🎯 [PEO 构造完成] 得到正向完美消除序列: [1, 2, 3, 4, 5]！',
    });

    // 2. 验证 PEO 团性质与极大团提取
    steps.push({
      type: 'VERIFY_PEO_NODE',
      curNode: 1,
      labelMap: { ...labels },
      peoList: [1, 2, 3, 4, 5],
      visitedNodes: [...vis],
      currentClique: [1, 2, 3],
      isChordal: true,
      message: '👑 [验证团性质] 节点 1 的后继邻居 {2, 3} 之间存在连边，构成完全子图 (团) {1, 2, 3}！',
    });

    steps.push({
      type: 'VERIFY_PEO_NODE',
      curNode: 2,
      labelMap: { ...labels },
      peoList: [1, 2, 3, 4, 5],
      visitedNodes: [...vis],
      currentClique: [2, 3, 4],
      isChordal: true,
      message: '👑 [验证团性质] 节点 2 的后继邻居 {3, 4} 之间存在连边，构成完全子图 (团) {2, 3, 4}！',
    });

    steps.push({
      type: 'VERIFY_PEO_NODE',
      curNode: 3,
      labelMap: { ...labels },
      peoList: [1, 2, 3, 4, 5],
      visitedNodes: [...vis],
      currentClique: [3, 4, 5],
      isChordal: true,
      message: '👑 [验证团性质] 节点 3 的后继邻居 {4, 5} 之间存在连边，构成完全子图 (团) {3, 4, 5}！',
    });

    steps.push({
      type: 'ALL_DONE',
      curNode: 5,
      labelMap: { ...labels },
      peoList: [1, 2, 3, 4, 5],
      visitedNodes: [...vis],
      currentClique: [3, 4, 5],
      isChordal: true,
      message: '🎉 [判定成功] 全图所有后继诱导子图均为团，判定该图为【严格弦图】！包含 3 个极大团。',
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#chordal-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: CHORDAL_GRAPH_CODE_LANGUAGES,
      problemHtml: CHORDAL_GRAPH_PROBLEM_HTML,
      analysisHtml: CHORDAL_GRAPH_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-chordal-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-chordal-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-chordal-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 音效
    const soundBtn = this.root.querySelector('#btn-chordal-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        ChordalAudio.isMuted = !ChordalAudio.isMuted;
        soundBtn.textContent = ChordalAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'SELECT_MAX_LABEL') ChordalAudio.playSelect();
      else if (cur.type === 'VERIFY_PEO_NODE') ChordalAudio.playVerify();
      else if (cur.type === 'ALL_DONE') ChordalAudio.playVictory();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-chordal-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停搜索';

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
    const playBtn = this.root?.querySelector('#btn-chordal-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动搜索';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#chordal-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#chordal-status-badge') as HTMLElement | null;
    const peoBadge = this.root.querySelector('#chordal-peo-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = '🏁 弦图验证成功';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (peoBadge) {
      peoBadge.textContent = `当前 PEO 序列: [${cur.peoList.join(', ')}]`;
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
      // 1. 绘制无向图边 (弦边高亮)
      this.graphEdges.forEach((e) => {
        const p1 = this.graphNodes[e.u];
        const p2 = this.graphNodes[e.v];
        if (!p1 || !p2) return;

        const inClique = cur.currentClique && cur.currentClique.includes(e.u) && cur.currentClique.includes(e.v);

        ctx.save();
        ctx.strokeStyle = inClique ? '#10b981' : e.isChord ? '#facc15' : 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = inClique ? 3.5 : e.isChord ? 2.5 : 1.5;
        if (inClique) {
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 8;
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      });

      // 2. 绘制节点与势值
      for (let u = 1; u <= this.n; u++) {
        const pos = this.graphNodes[u];
        if (!pos) continue;

        const isCur = cur.curNode === u;
        const inClique = cur.currentClique && cur.currentClique.includes(u);
        const isVisited = cur.visitedNodes.includes(u);

        ctx.save();
        let fillColor = '#1e293b';
        let strokeColor = isCur ? '#facc15' : inClique ? '#10b981' : isVisited ? '#38bdf8' : '#64748b';
        let radius = 13;

        if (isCur) {
          fillColor = '#854d0e';
          radius = 15 + Math.sin(this.pulseAnim) * 1.5;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 10;
        }

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isCur ? 3 : 2;

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

        // 势值标签
        const labelVal = cur.labelMap[u] || 0;
        ctx.font = '9px sans-serif';
        ctx.fillStyle = '#facc15';
        ctx.fillText(`势:${labelVal}`, pos.x, pos.y + 18);

        ctx.restore();
      }

      // 3. 右侧 PEO 磁带与极大团 HUD
      ctx.save();
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('📼 完美消除序列 (PEO) 磁带:', 255, 30);

      // PEO 磁带格子
      for (let i = 0; i < this.n; i++) {
        const itemX = 255 + i * 36;
        const nodeVal = cur.peoList[i];

        ctx.fillStyle = nodeVal !== undefined ? '#1e3a8a' : '#1e293b';
        ctx.strokeStyle = nodeVal !== undefined ? '#38bdf8' : '#475569';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.roundRect(itemX, 42, 30, 26, 4);
        ctx.fill();
        ctx.stroke();

        if (nodeVal !== undefined) {
          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(`v${nodeVal}`, itemX + 15, 58);
        }
      }

      // 极大团列表
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'left';
      ctx.fillText('👑 提取出的极大团 (Maximal Cliques):', 255, 100);

      const cliques = ['{1, 2, 3}', '{2, 3, 4}', '{3, 4, 5}'];
      cliques.forEach((cStr, idx) => {
        const itemY = 120 + idx * 22;
        ctx.font = '10px monospace';
        ctx.fillStyle = '#10b981';
        ctx.fillText(`[团 ${idx + 1}] 顶点集: ${cStr}`, 255, itemY);
      });

      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`💡 弦图极大团总数不超过 V 个 (严格 ≤ 5)`, 250, 195);
      ctx.fillText(`⚡ MCS 最大势算法构造 PEO 复杂度严格 O(V + E)`, 250, 212);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const CHORDAL_GRAPH_TEMPLATE = `
  <div id="algo-chordal-graph-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🎻</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">弦图判定与最大势算法 (Chordal Graph - MCS)</span>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="chordal-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-chordal-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-chordal-autoplay" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(2,132,199,0.25);">▶️ 自动搜索</button>
        <button id="btn-chordal-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-chordal-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #0369a1;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>🎻 序列状态: <b id="chordal-peo-badge" style="color: #0284c7; font-size: 12px;">PEO: []</b></span>
      </div>
      <div id="chordal-narration-box" style="font-weight: 700; color: #075985;">
        💡 准备就绪：MCS 维护最大势，正向生成 PEO，验证完全子图与极大团！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：弦图与 PEO 磁带 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="chordal-canvas" width="460" height="230" style="width: 460px; height: 230px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          左侧为 5 节点无向弦图 | 🟡 黄色线为弦边 | 右侧为动态 PEO 磁带与极大团提取结果
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="chordal-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'chordal-graph',
  name: '弦图判定与极大团 (Chordal Graph - MCS)',
  viewId: 'algo-chordal-graph-view',
  category: 'graph',
  description: '进阶图论高效判定：完美消除序列 (PEO)、最大势算法 (MCS) 严格 O(V+E) 构造与极大团计数 (Maximal Clique)',
  icon: '🎻',
  template: CHORDAL_GRAPH_TEMPLATE,
  Visualizer: ChordalGraphVisualizer,
  difficulty: 3,
  levelOrder: 66,
  learningGoal: '掌握弦图无弦环定义、MCS 最大势算法线性时间构造 PEO 原理及极大团数量不超过 V 个的严密证明',
});
