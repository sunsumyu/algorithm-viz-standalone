/**
 * 分层图最短路 (Layered Graph Dijkstra) 交互式可视化引擎
 * 参考左程云《算法通关课》【必备篇】class064: 飞行路线与分层图建模
 * 特性：
 * 1. 🌐 Canvas 2D 多层空间平行立体拓扑投影 (Layer 0, Layer 1, ... Layer K)
 * 2. ⚡ 层内通行 (常规边权) 与 跨层跃迁 (免单券 0 权激光通道) 动态区分渲染
 * 3. 📊 实时 dist[u][k] 状态矩阵与优先队列堆顶弹出追踪
 * 4. 🎛️ 5 组预设拓扑与自由调整免单券数 K (0 ~ 3)
 * 5. 🔊 Web Audio 音效引擎（松弛波、跨层跃迁金鸣、堆操作音）
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  LAYERED_DIJKSTRA_CODE_LANGUAGES,
  LAYERED_DIJKSTRA_PROBLEM_HTML,
  LAYERED_DIJKSTRA_ANALYSIS_HTML,
} from './layered-dijkstra-problem-content';

export interface GraphEdge {
  u: number;
  v: number;
  w: number;
}

export interface NodePos {
  x: number;
  y: number;
}

export interface PQItem {
  u: number;
  used: number;
  cost: number;
  path: Array<{ u: number; used: number }>;
}

export interface TraceStep {
  type: 'POP' | 'RELAX_PAY' | 'RELAX_FREE' | 'SKIP_VISITED' | 'FOUND_TARGET' | 'DONE';
  u: number;
  used: number;
  cost: number;
  to?: number;
  edgeWeight?: number;
  newCost?: number;
  distSnapshot: number[][];
  visitedSnapshot: boolean[][];
  pqSnapshot: PQItem[];
  currentPath: Array<{ u: number; used: number }>;
  message: string;
}

class LayeredAudio {
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

  public static playPop(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  public static playRelax(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  public static playLayerJump(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const notes = [440, 659.25, 880, 1318.5]; // 跨层高维金鸣
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);
        gain.gain.setValueAtTime(0.14, ctx.currentTime + idx * 0.04);
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
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.35);
      });
    } catch {}
  }
}

export class LayeredDijkstraVisualizer extends StepVisualizer<any> {
  // 图数据结构
  private nodeCount = 5;
  private maxFreeTickets = 1; // K
  private startNode = 0;
  private targetNode = 4;
  private edges: GraphEdge[] = [];
  private basePositions: NodePos[] = [];

  // 推演状态机
  private traceSteps: TraceStep[] = [];
  private currentStepPtr = 0;
  private isAutoPlaying = false;
  private autoPlayTimer: any = null;
  private playSpeed = 1;

  // 画布与渲染
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private lastTimestamp = 0;
  private pulseAnim = 0;

  constructor() {
    super();
    this.codeLanguages = LAYERED_DIJKSTRA_CODE_LANGUAGES;
    this.codeLines = LAYERED_DIJKSTRA_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '分层图 Dijkstra 算法引擎 (P4568)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '分层图最短路' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_1_FREE');
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

    if (presetKey === 'CLASSIC_1_FREE') {
      // N=5, K=1, S=0, T=4
      this.nodeCount = 5;
      this.maxFreeTickets = 1;
      this.startNode = 0;
      this.targetNode = 4;
      this.basePositions = [
        { x: 60, y: 80 }, // 0
        { x: 170, y: 40 }, // 1
        { x: 170, y: 120 }, // 2
        { x: 290, y: 40 }, // 3
        { x: 390, y: 80 }, // 4
      ];
      this.edges = [
        { u: 0, v: 1, w: 5 },
        { u: 0, v: 2, w: 100 },
        { u: 1, v: 2, w: 2 },
        { u: 1, v: 3, w: 20 },
        { u: 2, v: 4, w: 8 },
        { u: 3, v: 4, w: 3 },
      ];
    } else if (presetKey === 'TWO_TICKETS') {
      // N=6, K=2, S=0, T=5
      this.nodeCount = 6;
      this.maxFreeTickets = 2;
      this.startNode = 0;
      this.targetNode = 5;
      this.basePositions = [
        { x: 50, y: 75 }, // 0
        { x: 140, y: 35 }, // 1
        { x: 140, y: 115 }, // 2
        { x: 260, y: 35 }, // 3
        { x: 260, y: 115 }, // 4
        { x: 380, y: 75 }, // 5
      ];
      this.edges = [
        { u: 0, v: 1, w: 10 },
        { u: 0, v: 2, w: 80 },
        { u: 1, v: 3, w: 50 },
        { u: 2, v: 4, w: 15 },
        { u: 1, v: 2, w: 5 },
        { u: 3, v: 5, w: 5 },
        { u: 4, v: 5, w: 70 },
        { u: 3, v: 4, w: 10 },
      ];
    } else if (presetKey === 'THREE_TICKETS') {
      // N=6, K=3
      this.nodeCount = 6;
      this.maxFreeTickets = 3;
      this.startNode = 0;
      this.targetNode = 5;
      this.basePositions = [
        { x: 50, y: 75 },
        { x: 140, y: 35 },
        { x: 140, y: 115 },
        { x: 260, y: 35 },
        { x: 260, y: 115 },
        { x: 380, y: 75 },
      ];
      this.edges = [
        { u: 0, v: 1, w: 10 },
        { u: 0, v: 2, w: 80 },
        { u: 1, v: 3, w: 50 },
        { u: 2, v: 4, w: 15 },
        { u: 1, v: 2, w: 5 },
        { u: 3, v: 5, w: 5 },
        { u: 4, v: 5, w: 70 },
      ];
    } else if (presetKey === 'ZERO_TICKETS') {
      // K=0 (普通 Dijkstra)
      this.nodeCount = 5;
      this.maxFreeTickets = 0;
      this.startNode = 0;
      this.targetNode = 4;
      this.basePositions = [
        { x: 60, y: 80 },
        { x: 170, y: 40 },
        { x: 170, y: 120 },
        { x: 290, y: 40 },
        { x: 390, y: 80 },
      ];
      this.edges = [
        { u: 0, v: 1, w: 5 },
        { u: 0, v: 2, w: 100 },
        { u: 1, v: 2, w: 2 },
        { u: 1, v: 3, w: 20 },
        { u: 2, v: 4, w: 8 },
        { u: 3, v: 4, w: 3 },
      ];
    } else if (presetKey === 'GRID_NETWORK') {
      // N=6, K=1
      this.nodeCount = 6;
      this.maxFreeTickets = 1;
      this.startNode = 0;
      this.targetNode = 5;
      this.basePositions = [
        { x: 60, y: 40 },
        { x: 210, y: 40 },
        { x: 370, y: 40 },
        { x: 60, y: 110 },
        { x: 210, y: 110 },
        { x: 370, y: 110 },
      ];
      this.edges = [
        { u: 0, v: 1, w: 30 },
        { u: 1, v: 2, w: 40 },
        { u: 0, v: 3, w: 5 },
        { u: 3, v: 4, w: 80 },
        { u: 4, v: 5, w: 10 },
        { u: 1, v: 4, w: 15 },
        { u: 2, v: 5, w: 5 },
      ];
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const N = this.nodeCount;
    const K = this.maxFreeTickets;
    const S = this.startNode;
    const T = this.targetNode;
    const INF = 999999;

    const graph: Array<Array<{ to: number; w: number }>> = Array.from({ length: N }, () => []);
    this.edges.forEach((e) => {
      graph[e.u].push({ to: e.v, w: e.w });
      graph[e.v].push({ to: e.u, w: e.w });
    });

    const dist: number[][] = Array.from({ length: N }, () => Array(K + 1).fill(INF));
    const visited: boolean[][] = Array.from({ length: N }, () => Array(K + 1).fill(false));
    const pq: PQItem[] = [];

    dist[S][0] = 0;
    pq.push({ u: S, used: 0, cost: 0, path: [{ u: S, used: 0 }] });

    const steps: TraceStep[] = [];

    const cloneDist = () => dist.map((r) => [...r]);
    const cloneVisited = () => visited.map((r) => [...r]);
    const clonePQ = () => pq.map((item) => ({ ...item, path: [...item.path] }));

    steps.push({
      type: 'POP',
      u: S,
      used: 0,
      cost: 0,
      distSnapshot: cloneDist(),
      visitedSnapshot: cloneVisited(),
      pqSnapshot: clonePQ(),
      currentPath: [{ u: S, used: 0 }],
      message: `🚀 初始化：起点城市 [${S}] 在 Layer 0 距离置为 0，推入优先队列。`,
    });

    while (pq.length > 0) {
      pq.sort((a, b) => a.cost - b.cost);
      const cur = pq.shift()!;
      const { u, used, cost, path } = cur;

      if (visited[u][used]) {
        steps.push({
          type: 'SKIP_VISITED',
          u,
          used,
          cost,
          distSnapshot: cloneDist(),
          visitedSnapshot: cloneVisited(),
          pqSnapshot: clonePQ(),
          currentPath: path,
          message: `⏩ 状态 (城市:${u}, 已用券:${used}, 花费:${cost}) 已经访问过，跳过。`,
        });
        continue;
      }

      visited[u][used] = true;

      steps.push({
        type: 'POP',
        u,
        used,
        cost,
        distSnapshot: cloneDist(),
        visitedSnapshot: cloneVisited(),
        pqSnapshot: clonePQ(),
        currentPath: path,
        message: `📥 堆顶弹出最优状态：到达城市 [${u}]（Layer ${used}），当前累计花费 ${cost}。`,
      });

      if (u === T) {
        steps.push({
          type: 'FOUND_TARGET',
          u,
          used,
          cost,
          distSnapshot: cloneDist(),
          visitedSnapshot: cloneVisited(),
          pqSnapshot: clonePQ(),
          currentPath: path,
          message: `🎯 成功到达目标城市 [${T}]（使用 ${used} 张免费券）！最小花费锁定为 ${cost}！🎉`,
        });
        break;
      }

      for (const edge of graph[u]) {
        const v = edge.to;
        const w = edge.w;

        // 决策 1：正常购买机票（不使用免费券）
        if (dist[v][used] > cost + w) {
          dist[v][used] = cost + w;
          const newPath = [...path, { u: v, used }];
          pq.push({ u: v, used, cost: cost + w, path: newPath });

          steps.push({
            type: 'RELAX_PAY',
            u,
            used,
            cost,
            to: v,
            edgeWeight: w,
            newCost: cost + w,
            distSnapshot: cloneDist(),
            visitedSnapshot: cloneVisited(),
            pqSnapshot: clonePQ(),
            currentPath: newPath,
            message: `🎫 [同层通行] 城市 ${u} → ${v} (付费 +${w})：更新 dist[${v}][${used}] = ${cost + w}，入堆。`,
          });
        }

        // 决策 2：使用 1 张免费券跨层跃迁（若还有余量）
        if (used < K && dist[v][used + 1] > cost) {
          dist[v][used + 1] = cost;
          const newPath = [...path, { u: v, used: used + 1 }];
          pq.push({ u: v, used: used + 1, cost, path: newPath });

          steps.push({
            type: 'RELAX_FREE',
            u,
            used,
            cost,
            to: v,
            edgeWeight: 0,
            newCost: cost,
            distSnapshot: cloneDist(),
            visitedSnapshot: cloneVisited(),
            pqSnapshot: clonePQ(),
            currentPath: newPath,
            message: `✨ [跨层跃迁] 城市 ${u} → ${v} (免单 +0 券:${used}->${used + 1})：更新 dist[${v}][${used + 1}] = ${cost}，入堆！`,
          });
        }
      }
    }

    steps.push({
      type: 'DONE',
      u: T,
      used: 0,
      cost: 0,
      distSnapshot: cloneDist(),
      visitedSnapshot: cloneVisited(),
      pqSnapshot: clonePQ(),
      currentPath: steps[steps.length - 1]?.currentPath || [],
      message: `🏁 分层图最短路推演完毕！已探索所有层级可能的最优状态。`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#layered-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: LAYERED_DIJKSTRA_CODE_LANGUAGES,
      problemHtml: LAYERED_DIJKSTRA_PROBLEM_HTML,
      analysisHtml: LAYERED_DIJKSTRA_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 1. 单步推演
    const stepBtn = this.root.querySelector('#btn-layered-step') as HTMLButtonElement | null;
    if (stepBtn) {
      stepBtn.addEventListener('click', () => this.stepForward());
    }

    // 2. 自动播放
    const autoBtn = this.root.querySelector('#btn-layered-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) {
          this.stopAutoPlay();
        } else {
          this.startAutoPlay();
        }
      });
    }

    // 3. 重置
    const resetBtn = this.root.querySelector('#btn-layered-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 4. 预设切换
    this.root.querySelectorAll<HTMLButtonElement>('.layered-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_1_FREE';
        this.root?.querySelectorAll('.layered-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 5. K 值滑块 / 切换
    const kSelect = this.root.querySelector('#layered-k-select') as HTMLSelectElement | null;
    if (kSelect) {
      kSelect.addEventListener('change', (e) => {
        const newK = parseInt((e.target as HTMLSelectElement).value, 10);
        this.maxFreeTickets = newK;
        this.computeTraceSteps();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 6. 音效
    const soundBtn = this.root.querySelector('#btn-layered-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        LayeredAudio.isMuted = !LayeredAudio.isMuted;
        soundBtn.textContent = LayeredAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'POP') LayeredAudio.playPop();
      else if (cur.type === 'RELAX_PAY') LayeredAudio.playRelax();
      else if (cur.type === 'RELAX_FREE') LayeredAudio.playLayerJump();
      else if (cur.type === 'FOUND_TARGET') LayeredAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-layered-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停推演';

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
    const playBtn = this.root?.querySelector('#btn-layered-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动推演';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#layered-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#layered-status-badge') as HTMLElement | null;
    const matrixContainer = this.root.querySelector('#layered-matrix-container') as HTMLElement | null;
    const pqContainer = this.root.querySelector('#layered-pq-container') as HTMLElement | null;
    const kSelect = this.root.querySelector('#layered-k-select') as HTMLSelectElement | null;

    if (kSelect) {
      kSelect.value = `${this.maxFreeTickets}`;
    }

    if (narrationBox) {
      narrationBox.innerHTML = `💡 ${cur.message}`;
    }

    if (statusBadge) {
      if (cur.type === 'FOUND_TARGET') {
        statusBadge.textContent = `🎯 目标锁定：花费 ${cur.cost}`;
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    // 渲染 dist[u][k] 状态矩阵
    if (matrixContainer) {
      const INF = 999999;
      let html = `
        <table style="width: 100%; border-collapse: collapse; font-size: 10.5px; text-align: center;">
          <thead>
            <tr style="background: #f1f5f9; color: #475569; font-weight: 700; border-bottom: 1px solid #cbd5e1;">
              <th style="padding: 3px 6px;">城市</th>
      `;
      for (let k = 0; k <= this.maxFreeTickets; k++) {
        html += `<th style="padding: 3px 6px;">Layer ${k} (已用${k}张)</th>`;
      }
      html += `</tr></thead><tbody>`;

      for (let u = 0; u < this.nodeCount; u++) {
        const isStart = u === this.startNode;
        const isTarget = u === this.targetNode;
        const label = isStart ? `<b>${u} (S)</b>` : isTarget ? `<b>${u} (T)</b>` : `${u}`;

        html += `<tr style="border-bottom: 1px solid #f1f5f9;">`;
        html += `<td style="padding: 3px 6px; font-weight: 700; background: #f8fafc; color: #334155;">${label}</td>`;

        for (let k = 0; k <= this.maxFreeTickets; k++) {
          const d = cur.distSnapshot[u]?.[k] ?? INF;
          const isVisited = cur.visitedSnapshot[u]?.[k];
          const isCur = cur.u === u && cur.used === k;

          let bg = '#ffffff';
          let color = '#334155';
          if (isCur) {
            bg = '#fef08a'; // 当前高亮黄
            color = '#854d0e';
          } else if (isVisited) {
            bg = '#dcfce7'; // 已访问绿
            color = '#15803d';
          }

          const valText = d === INF ? '∞' : `${d}`;
          html += `<td style="padding: 3px 6px; background: ${bg}; color: ${color}; font-family: monospace; font-weight: bold;">${valText}</td>`;
        }
        html += `</tr>`;
      }
      html += `</tbody></table>`;
      matrixContainer.innerHTML = html;
    }

    // 渲染优先队列
    if (pqContainer) {
      if (cur.pqSnapshot.length === 0) {
        pqContainer.innerHTML = '<span style="font-size: 11px; color: #94a3b8;">优先队列为空</span>';
      } else {
        pqContainer.innerHTML = cur.pqSnapshot
          .map((item, idx) => {
            const isTop = idx === 0;
            return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 2px 6px; border-radius: 4px; background: ${isTop ? '#eff6ff' : '#f8fafc'}; border: 1px solid ${isTop ? '#bfdbfe' : '#e2e8f0'}; font-size: 10.5px; margin-bottom: 3px;">
              <span>${isTop ? '⭐ [堆顶] ' : ''}城市 <b>${item.u}</b> (L${item.used})</span>
              <span style="font-family: monospace; font-weight: bold; color: #2563eb;">花费: ${item.cost}</span>
            </div>
          `;
          })
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

      this.pulseAnim += dt * 0.005;
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
    const K = this.maxFreeTickets;
    const cur = this.traceSteps[this.currentStepPtr];

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. 深邃背景
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // 计算分层垂直排布空间
    const layerHeight = height / (K + 1);
    const layerColors = ['#38bdf8', '#a855f7', '#f59e0b', '#10b981'];

    // 2. 绘制每个 Layer 平面背景
    for (let k = 0; k <= K; k++) {
      const ly = k * layerHeight;
      ctx.save();
      ctx.fillStyle = k % 2 === 0 ? 'rgba(30, 41, 59, 0.45)' : 'rgba(15, 23, 42, 0.45)';
      ctx.fillRect(0, ly, width, layerHeight - 2);

      // Layer 标签
      ctx.font = 'bold 10.5px sans-serif';
      ctx.fillStyle = layerColors[k % layerColors.length];
      ctx.fillText(`🔷 Layer ${k} (已用 ${k} 张免单券)`, 12, ly + 14);
      ctx.restore();
    }

    // 辅助函数：获取 (u, k) 在画布上的实际 (X, Y)
    const getPos = (u: number, k: number): { x: number; y: number } => {
      const base = this.basePositions[u] || { x: 50, y: 50 };
      const layerYOffset = k * layerHeight;
      // 归一化缩放
      const scaleY = (layerHeight - 26) / 160;
      return {
        x: base.x + 15,
        y: layerYOffset + 24 + base.y * scaleY,
      };
    };

    // 3. 绘制层间跨层免单边 (Layer Jump Edges: u@L_k -> v@L_{k+1})
    for (let k = 0; k < K; k++) {
      this.edges.forEach((e) => {
        // 双向航线，绘制 u@k -> v@{k+1} 和 v@k -> u@{k+1}
        const p1_u = getPos(e.u, k);
        const p2_v = getPos(e.v, k + 1);

        ctx.save();
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.2)'; // 淡淡的金色激光虚线
        ctx.setLineDash([3, 4]);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(p1_u.x, p1_u.y);
        ctx.lineTo(p2_v.x, p2_v.y);
        ctx.stroke();
        ctx.restore();
      });
    }

    // 4. 绘制各层内部常规边 (Intra-layer Edges)
    for (let k = 0; k <= K; k++) {
      this.edges.forEach((e) => {
        const p1 = getPos(e.u, k);
        const p2 = getPos(e.v, k);

        ctx.save();
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // 边权文字
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        ctx.font = '9px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${e.w}`, mx, my - 5);
        ctx.restore();
      });
    }

    // 5. 绘制当前正在松弛或激活的高亮边
    if (cur && cur.to !== undefined) {
      const fromPos = getPos(cur.u, cur.used);
      const isFree = cur.type === 'RELAX_FREE';
      const toLayer = isFree ? cur.used + 1 : cur.used;
      const toPos = getPos(cur.to, toLayer);

      ctx.save();
      ctx.strokeStyle = isFree ? '#fbbf24' : '#38bdf8'; // 金色免单 vs 蓝色付费
      ctx.lineWidth = 3;
      ctx.shadowColor = isFree ? '#fbbf24' : '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(fromPos.x, fromPos.y);
      ctx.lineTo(toPos.x, toPos.y);
      ctx.stroke();
      ctx.restore();
    }

    // 6. 绘制最优路径高亮连线
    if (cur && cur.currentPath && cur.currentPath.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      for (let i = 0; i < cur.currentPath.length; i++) {
        const stepNode = cur.currentPath[i];
        const pos = getPos(stepNode.u, stepNode.used);
        if (i === 0) ctx.moveTo(pos.x, pos.y);
        else ctx.lineTo(pos.x, pos.y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 7. 绘制各层节点
    for (let k = 0; k <= K; k++) {
      for (let u = 0; u < this.nodeCount; u++) {
        const pos = getPos(u, k);
        const isCur = cur && cur.u === u && cur.used === k;
        const isVisited = cur && cur.visitedSnapshot[u]?.[k];
        const isStart = u === this.startNode;
        const isTarget = u === this.targetNode;

        ctx.save();

        let fillColor = '#1e293b';
        let strokeColor = '#64748b';
        let radius = 11;

        if (isCur) {
          fillColor = '#facc15';
          strokeColor = '#ffffff';
          radius = 13 + Math.sin(this.pulseAnim) * 2;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 12;
        } else if (isVisited) {
          fillColor = '#15803d';
          strokeColor = '#4ade80';
        } else if (isStart) {
          strokeColor = '#38bdf8';
        } else if (isTarget) {
          strokeColor = '#ec4899';
        }

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 节点编号
        ctx.font = 'bold 10.5px monospace';
        ctx.fillStyle = isCur ? '#000000' : '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${u}`, pos.x, pos.y);

        // 节点最短距离标签 (小字标注在下方)
        const d = cur?.distSnapshot[u]?.[k];
        const distStr = d === undefined || d >= 999999 ? '∞' : `${d}`;
        ctx.font = '9px monospace';
        ctx.fillStyle = isVisited ? '#86efac' : '#94a3b8';
        ctx.fillText(`[${distStr}]`, pos.x, pos.y + radius + 8);

        ctx.restore();
      }
    }

    ctx.restore();
  }
}

export const LAYERED_DIJKSTRA_TEMPLATE = `
  <div id="algo-layered-dijkstra-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🛫</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">分层图最短路 (Layered Graph Dijkstra)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="layered-preset-btn active" data-preset="CLASSIC_1_FREE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典单券 K=1</button>
          <button class="layered-preset-btn" data-preset="TWO_TICKETS" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">双券跳跃 K=2</button>
          <button class="layered-preset-btn" data-preset="THREE_TICKETS" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">三券网络 K=3</button>
          <button class="layered-preset-btn" data-preset="ZERO_TICKETS" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">零券普通 Dijkstra</button>
          <button class="layered-preset-btn" data-preset="GRID_NETWORK" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">网格环形网络</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <label style="font-size: 11px; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 4px;">
          免单券 K:
          <select id="layered-k-select" style="padding: 2px 4px; font-size: 11px; border-radius: 4px; border: 1px solid #cbd5e1;">
            <option value="0">0 (普通)</option>
            <option value="1" selected>1 (单券)</option>
            <option value="2">2 (双券)</option>
            <option value="3">3 (三券)</option>
          </select>
        </label>
        <span id="layered-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-layered-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-layered-autoplay" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(59,130,246,0.25);">▶️ 自动推演</button>
        <button id="btn-layered-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-layered-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 步骤说明横条 -->
    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #1e40af;">
      <div id="layered-narration-box" style="font-weight: 700; color: #1e3a8a;">
        💡 准备就绪：观察分层立体网络中的常规付费边（同层）与跨层免单边（金色跃迁）。
      </div>
    </div>

    <!-- 主展示区：左侧 Canvas + 状态矩阵，右侧优先队列与代码终端 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：分层拓扑 Canvas 与 dist[u][k] 矩阵 -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <!-- Canvas 拓扑容器 -->
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="layered-canvas" width="460" height="230" style="width: 460px; height: 230px;"></canvas>
        </div>

        <!-- 实时 dist[u][k] 状态矩阵表 -->
        <div style="display: flex; flex-direction: column; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; gap: 4px;">
          <div style="font-size: 11px; font-weight: 700; color: #334155;">📊 实时最短距离状态矩阵 dist[城市][已用券数]</div>
          <div id="layered-matrix-container"></div>
        </div>
      </div>

      <!-- 右侧：优先队列追踪 + 代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <!-- 优先队列实时堆内容 -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; max-height: 110px; display: flex; flex-direction: column;">
          <div style="font-size: 11px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">⚡ 优先队列小根堆 (按照累计花费排序)</div>
          <div id="layered-pq-container" style="flex: 1; overflow-y: auto;"></div>
        </div>

        <!-- 代码终端 -->
        <div id="layered-terminal-mount" style="flex: 1; min-height: 180px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'layered-dijkstra',
  name: '分层图最短路 (Layered Dijkstra)',
  viewId: 'algo-layered-dijkstra-view',
  category: 'graph',
  description: '分层图最短路径算法：左程云 class064 飞行路线 (洛谷 P4568)、k 次免费乘车券、三维空间多层拓扑与跨层跃迁推演',
  icon: '🛫',
  template: LAYERED_DIJKSTRA_TEMPLATE,
  Visualizer: LayeredDijkstraVisualizer,
  difficulty: 3,
  levelOrder: 20,
  learningGoal: '掌握分层图状态维度扩展技巧（将后效性资源纳入状态 dist[u][k]）、同层与跨层转移方程及多层空间最短路 Dijkstra 求解',
});
