/**
 * 无向图割点与割边（桥）Tarjan 算法可视化引擎 (Cut Vertices & Bridges)
 * 参考左程云《算法通关课》class068: DFN 时间戳、LOW 追溯值、DFS 树边与返祖回边 (洛谷 P3388 / LeetCode 1192)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  TARJAN_BRIDGE_CODE_LANGUAGES,
  TARJAN_BRIDGE_PROBLEM_HTML,
  TARJAN_BRIDGE_ANALYSIS_HTML,
} from './tarjan-bridge-problem-content';

export interface GraphNodePos {
  id: number;
  x: number;
  y: number;
}

export interface TarjanStep {
  type: 'DFS_VISIT' | 'TREE_EDGE_FORWARD' | 'TREE_EDGE_BACKTRACK' | 'CUT_VERTEX_FOUND' | 'BRIDGE_FOUND' | 'BACK_EDGE' | 'DONE';
  curU: number;
  curV?: number;
  dfnSnapshot: number[];
  lowSnapshot: number[];
  cutVertices: number[];
  bridges: Array<[number, number]>;
  treeEdges: Array<[number, number]>;
  backEdges: Array<[number, number]>;
  message: string;
}

class TarjanAudio {
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

  public static playVisit(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {}
  }

  public static playBackEdge(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {}
  }

  public static playCut(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.16, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
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
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.25);
      });
    } catch {}
  }
}

export class TarjanBridgeVisualizer extends StepVisualizer<any> {
  // 图拓扑数据
  private n = 6;
  private adjList: number[][] = [];
  private nodePositions: GraphNodePos[] = [];

  // 推演步骤
  private traceSteps: TarjanStep[] = [];
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
    this.codeLanguages = TARJAN_BRIDGE_CODE_LANGUAGES;
    this.codeLines = TARJAN_BRIDGE_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = 'Tarjan 割点与割边算法引擎 (class068)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: 'Tarjan 割点与桥算法' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('DUMBBELL_DOUBLE_CYCLE');
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

    if (presetKey === 'DUMBBELL_DOUBLE_CYCLE') {
      // 节点 1,2,3 形成左环，4,5,6 形成右环，3-4 为桥
      this.n = 6;
      this.adjList = [
        [],
        [2, 3], // 1
        [1, 3], // 2
        [1, 2, 4], // 3 (割点)
        [3, 5, 6], // 4 (割点)
        [4, 6], // 5
        [4, 5], // 6
      ];
      this.nodePositions = [
        { id: 0, x: 0, y: 0 },
        { id: 1, x: 80, y: 70 },
        { id: 2, x: 80, y: 160 },
        { id: 3, x: 170, y: 115 },
        { id: 4, x: 290, y: 115 },
        { id: 5, x: 380, y: 70 },
        { id: 6, x: 380, y: 160 },
      ];
    } else if (presetKey === 'CLOVER_LEAF') {
      // 根节点 1 连接两个独立环 (2,3) 和 (4,5)
      this.n = 5;
      this.adjList = [
        [],
        [2, 3, 4, 5], // 1 (根割点，拥有2个子树分支)
        [1, 3], // 2
        [1, 2], // 3
        [1, 5], // 4
        [1, 4], // 5
      ];
      this.nodePositions = [
        { id: 0, x: 0, y: 0 },
        { id: 1, x: 230, y: 115 },
        { id: 2, x: 110, y: 70 },
        { id: 3, x: 110, y: 160 },
        { id: 4, x: 350, y: 70 },
        { id: 5, x: 350, y: 160 },
      ];
    } else if (presetKey === 'CRITICAL_NETWORK') {
      // LeetCode 1192 结构
      this.n = 5;
      this.adjList = [
        [],
        [2, 3],
        [1, 3],
        [1, 2, 4],
        [3, 5],
        [4],
      ];
      this.nodePositions = [
        { id: 0, x: 0, y: 0 },
        { id: 1, x: 90, y: 75 },
        { id: 2, x: 90, y: 155 },
        { id: 3, x: 190, y: 115 },
        { id: 4, x: 300, y: 115 },
        { id: 5, x: 400, y: 115 },
      ];
    } else if (presetKey === 'SIMPLE_CYCLE') {
      this.n = 5;
      this.adjList = [
        [],
        [2, 5],
        [1, 3],
        [2, 4],
        [3, 5],
        [4, 1],
      ];
      this.nodePositions = [
        { id: 0, x: 0, y: 0 },
        { id: 1, x: 230, y: 45 },
        { id: 2, x: 350, y: 95 },
        { id: 3, x: 310, y: 185 },
        { id: 4, x: 150, y: 185 },
        { id: 5, x: 110, y: 95 },
      ];
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const n = this.n;
    const dfn: number[] = Array(n + 1).fill(0);
    const low: number[] = Array(n + 1).fill(0);
    const isCut: boolean[] = Array(n + 1).fill(false);
    const bridges: Array<[number, number]> = [];
    const treeEdges: Array<[number, number]> = [];
    const backEdges: Array<[number, number]> = [];
    let timer = 0;

    const steps: TarjanStep[] = [];

    const cloneDfn = () => [...dfn];
    const cloneLow = () => [...low];
    const getCutList = () => {
      const res: number[] = [];
      for (let i = 1; i <= n; i++) {
        if (isCut[i]) res.push(i);
      }
      return res;
    };

    steps.push({
      type: 'DFS_VISIT',
      curU: 1,
      dfnSnapshot: cloneDfn(),
      lowSnapshot: cloneLow(),
      cutVertices: [],
      bridges: [],
      treeEdges: [],
      backEdges: [],
      message: `🚀 初始化：图共有 ${n} 个节点，准备从节点 1 启动 Tarjan 深度优先搜索。`,
    });

    const dfs = (u: number, father: number) => {
      timer++;
      dfn[u] = low[u] = timer;
      let children = 0;

      steps.push({
        type: 'DFS_VISIT',
        curU: u,
        dfnSnapshot: cloneDfn(),
        lowSnapshot: cloneLow(),
        cutVertices: getCutList(),
        bridges: [...bridges],
        treeEdges: [...treeEdges],
        backEdges: [...backEdges],
        message: `🧭 访问节点 ${u}：分配时间戳 dfn[${u}] = low[${u}] = ${timer}。`,
      });

      for (const v of this.adjList[u]) {
        if (v === father) continue;

        if (dfn[v] === 0) {
          // 树边
          children++;
          treeEdges.push([u, v]);

          steps.push({
            type: 'TREE_EDGE_FORWARD',
            curU: u,
            curV: v,
            dfnSnapshot: cloneDfn(),
            lowSnapshot: cloneLow(),
            cutVertices: getCutList(),
            bridges: [...bridges],
            treeEdges: [...treeEdges],
            backEdges: [...backEdges],
            message: `🌱 探索树枝边 (${u} → ${v})，递归深入节点 ${v}...`,
          });

          dfs(v, u);

          // 回溯更新 low
          low[u] = Math.min(low[u], low[v]);

          steps.push({
            type: 'TREE_EDGE_BACKTRACK',
            curU: u,
            curV: v,
            dfnSnapshot: cloneDfn(),
            lowSnapshot: cloneLow(),
            cutVertices: getCutList(),
            bridges: [...bridges],
            treeEdges: [...treeEdges],
            backEdges: [...backEdges],
            message: `🔙 从节点 ${v} 回溯至 ${u}：更新 low[${u}] = min(low[${u}], low[${v}]) = ${low[u]}。`,
          });

          // 割点判定 (非根)
          if (father !== 0 && low[v] >= dfn[u]) {
            isCut[u] = true;
            steps.push({
              type: 'CUT_VERTEX_FOUND',
              curU: u,
              curV: v,
              dfnSnapshot: cloneDfn(),
              lowSnapshot: cloneLow(),
              cutVertices: getCutList(),
              bridges: [...bridges],
              treeEdges: [...treeEdges],
              backEdges: [...backEdges],
              message: `✂️ [割点确立] 节点 ${u} 为割点！因为子树 ${v} 的 low[${v}]=${low[v]} >= dfn[${u}]=${dfn[u]}，无法越过 ${u} 向上回溯！`,
            });
          }

          // 桥判定
          if (low[v] > dfn[u]) {
            bridges.push([u, v]);
            steps.push({
              type: 'BRIDGE_FOUND',
              curU: u,
              curV: v,
              dfnSnapshot: cloneDfn(),
              lowSnapshot: cloneLow(),
              cutVertices: getCutList(),
              bridges: [...bridges],
              treeEdges: [...treeEdges],
              backEdges: [...backEdges],
              message: `⚡ [割边/桥确立] 边 (${u}, ${v}) 为关键连接(桥)！因为 low[${v}]=${low[v]} > dfn[${u}]=${dfn[u]}，子树 ${v} 甚至无法回溯到 ${u}！`,
            });
          }
        } else {
          // 返祖回边
          low[u] = Math.min(low[u], dfn[v]);
          backEdges.push([u, v]);

          steps.push({
            type: 'BACK_EDGE',
            curU: u,
            curV: v,
            dfnSnapshot: cloneDfn(),
            lowSnapshot: cloneLow(),
            cutVertices: getCutList(),
            bridges: [...bridges],
            treeEdges: [...treeEdges],
            backEdges: [...backEdges],
            message: `↩️ 发现返祖回边 (${u} ⤺ ${v})：祖先 dfn[${v}]=${dfn[v]}，快速提升 low[${u}] = ${low[u]}！`,
          });
        }
      }

      // 根节点割点判定
      if (father === 0 && children >= 2) {
        isCut[u] = true;
        steps.push({
          type: 'CUT_VERTEX_FOUND',
          curU: u,
          dfnSnapshot: cloneDfn(),
          lowSnapshot: cloneLow(),
          cutVertices: getCutList(),
          bridges: [...bridges],
          treeEdges: [...treeEdges],
          backEdges: [...backEdges],
          message: `✂️ [根节点割点] 根节点 ${u} 拥有 ${children} 个独立子树分支 (children >= 2)，确立为割点！`,
        });
      }
    };

    for (let i = 1; i <= n; i++) {
      if (dfn[i] === 0) dfs(i, 0);
    }

    steps.push({
      type: 'DONE',
      curU: 0,
      dfnSnapshot: cloneDfn(),
      lowSnapshot: cloneLow(),
      cutVertices: getCutList(),
      bridges: [...bridges],
      treeEdges: [...treeEdges],
      backEdges: [...backEdges],
      message: `🏁 Tarjan 算法执行完毕！共发现 ${getCutList().length} 个割点，${bridges.length} 座关键桥！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#tarjan-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: TARJAN_BRIDGE_CODE_LANGUAGES,
      problemHtml: TARJAN_BRIDGE_PROBLEM_HTML,
      analysisHtml: TARJAN_BRIDGE_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-tarjan-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-tarjan-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-tarjan-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.tarjan-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'DUMBBELL_DOUBLE_CYCLE';
        this.root?.querySelectorAll('.tarjan-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-tarjan-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        TarjanAudio.isMuted = !TarjanAudio.isMuted;
        soundBtn.textContent = TarjanAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'DFS_VISIT') TarjanAudio.playVisit();
      else if (cur.type === 'BACK_EDGE') TarjanAudio.playBackEdge();
      else if (cur.type === 'CUT_VERTEX_FOUND' || cur.type === 'BRIDGE_FOUND') TarjanAudio.playCut();
      else if (cur.type === 'DONE') TarjanAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-tarjan-autoplay') as HTMLButtonElement | null;
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
    const playBtn = this.root?.querySelector('#btn-tarjan-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动推演';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#tarjan-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#tarjan-status-badge') as HTMLElement | null;
    const cutListSpan = this.root.querySelector('#tarjan-cut-list') as HTMLElement | null;
    const bridgeListSpan = this.root.querySelector('#tarjan-bridge-list') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'DONE') {
        statusBadge.textContent = `🎯 完成: ${cur.cutVertices.length} 割点, ${cur.bridges.length} 桥`;
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (cutListSpan) {
      if (cur.cutVertices.length === 0) {
        cutListSpan.innerHTML = '<span style="color: #94a3b8;">暂无</span>';
      } else {
        cutListSpan.innerHTML = cur.cutVertices
          .map((id) => `<span style="background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; font-weight: bold; padding: 1px 6px; border-radius: 4px; font-size: 11px; margin-right: 3px;">✂️ 节点 ${id}</span>`)
          .join('');
      }
    }

    if (bridgeListSpan) {
      if (cur.bridges.length === 0) {
        bridgeListSpan.innerHTML = '<span style="color: #94a3b8;">暂无</span>';
      } else {
        bridgeListSpan.innerHTML = cur.bridges
          .map(([u, v]) => `<span style="background: #fefce8; color: #ca8a04; border: 1px solid #fef08a; font-weight: bold; padding: 1px 6px; border-radius: 4px; font-size: 11px; margin-right: 3px;">⚡ (${u}, ${v})</span>`)
          .join('');
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

    // 1. 绘制普通边
    for (let u = 1; u <= this.n; u++) {
      const p1 = this.nodePositions[u];
      if (!p1) continue;

      for (const v of this.adjList[u]) {
        if (u > v) continue;
        const p2 = this.nodePositions[v];
        if (!p2) continue;

        ctx.save();
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 2. 绘制树边 (绿色实线)
    if (cur) {
      cur.treeEdges.forEach(([u, v]) => {
        const p1 = this.nodePositions[u];
        const p2 = this.nodePositions[v];
        if (!p1 || !p2) return;

        ctx.save();
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      });
    }

    // 3. 绘制返祖回边 (黄色虚线)
    if (cur) {
      cur.backEdges.forEach(([u, v]) => {
        const p1 = this.nodePositions[u];
        const p2 = this.nodePositions[v];
        if (!p1 || !p2) return;

        ctx.save();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      });
    }

    // 4. 绘制桥 (割边: 红色加粗发光闪电)
    if (cur) {
      cur.bridges.forEach(([u, v]) => {
        const p1 = this.nodePositions[u];
        const p2 = this.nodePositions[v];
        if (!p1 || !p2) return;

        ctx.save();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4.5;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      });
    }

    // 5. 绘制节点
    for (let i = 1; i <= this.n; i++) {
      const pos = this.nodePositions[i];
      if (!pos) continue;

      const isCurrent = cur && cur.curU === i;
      const isCut = cur && cur.cutVertices.includes(i);
      const dfnVal = cur ? cur.dfnSnapshot[i] : 0;
      const lowVal = cur ? cur.lowSnapshot[i] : 0;

      ctx.save();
      let radius = 18;
      let fillColor = '#1e293b';
      let strokeColor = '#64748b';

      if (isCurrent) {
        fillColor = '#ca8a04';
        strokeColor = '#facc15';
        radius = 21 + Math.sin(this.pulseAnim) * 2;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
      } else if (isCut) {
        fillColor = '#7f1d1d';
        strokeColor = '#ef4444';
        radius = 20;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
      } else if (dfnVal > 0) {
        fillColor = '#0f766e';
        strokeColor = '#14b8a6';
      }

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 节点编号
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${i}`, pos.x, pos.y - (dfnVal > 0 ? 3 : 0));

      // DFN / LOW 标识
      if (dfnVal > 0) {
        ctx.font = '9px monospace';
        ctx.fillStyle = '#fde047';
        ctx.fillText(`[${dfnVal}/${lowVal}]`, pos.x, pos.y + 9);
      }

      // 割点剪刀标识
      if (isCut) {
        ctx.font = '11px sans-serif';
        ctx.fillText('✂️', pos.x + 14, pos.y - 12);
      }

      ctx.restore();
    }

    ctx.restore();
  }
}

export const TARJAN_BRIDGE_TEMPLATE = `
  <div id="algo-tarjan-bridge-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">✂️</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">Tarjan 割点与桥 (Cut Vertices & Bridges)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="tarjan-preset-btn active" data-preset="DUMBBELL_DOUBLE_CYCLE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典哑铃双环</button>
          <button class="tarjan-preset-btn" data-preset="CLOVER_LEAF" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">根节点多子树割点</button>
          <button class="tarjan-preset-btn" data-preset="CRITICAL_NETWORK" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">LC 1192 集群网络</button>
          <button class="tarjan-preset-btn" data-preset="SIMPLE_CYCLE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">简单环 (无割点/桥)</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="tarjan-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-tarjan-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-tarjan-autoplay" style="background: linear-gradient(135deg, #ef4444, #b91c1c); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(239,68,68,0.25);">▶️ 自动推演</button>
        <button id="btn-tarjan-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-tarjan-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #991b1b;">
      <div style="display: flex; gap: 14px; align-items: center;">
        <span>✂️ 割点集合: <span id="tarjan-cut-list"></span></span>
        <span>⚡ 割边 (桥) 集合: <span id="tarjan-bridge-list"></span></span>
      </div>
      <div id="tarjan-narration-box" style="font-weight: 700; color: #7f1d1d;">
        💡 准备就绪：深度优先遍历构建 DFS 树，计算 DFN 与 LOW 追溯值！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：图拓扑 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="tarjan-canvas" width="460" height="230" style="width: 460px; height: 230px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🟢 绿色实线: DFS 树枝边 | 🟡 黄色虚线: 返祖回边 | 🔴 红色发光: 关键桥梁 (⚡) | ✂️ 红色节点: 割点
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="tarjan-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'tarjan-bridge',
  name: '割点与桥 (Cut Vertices & Bridges)',
  viewId: 'algo-tarjan-bridge-view',
  category: 'graph',
  description: 'Tarjan 割点与割边算法：左程云 class068 DFN 时间戳、LOW 追溯值、DFS 树边与返祖回边判别 (洛谷 P3388 / LeetCode 1192)',
  icon: '✂️',
  template: TARJAN_BRIDGE_TEMPLATE,
  Visualizer: TarjanBridgeVisualizer,
  difficulty: 3,
  levelOrder: 30,
  learningGoal: '掌握 Tarjan 算法在无向图中的 DFS 遍历模型、DFN/LOW 状态转移及割点/桥判定的数学充分必要条件',
});
