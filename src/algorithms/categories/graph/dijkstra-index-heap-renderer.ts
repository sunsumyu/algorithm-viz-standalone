/**
 * 反向索引堆优化 Dijkstra (Dijkstra with Index Min-Heap) 可视化引擎
 * 参考左程云《算法通关课》【必备篇】class061: 原地 decreaseKey、反向索引映射 where[] 与堆空间常数优化 (洛谷 P4779)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DIJKSTRA_INDEX_HEAP_CODE_LANGUAGES,
  DIJKSTRA_INDEX_HEAP_PROBLEM_HTML,
  DIJKSTRA_INDEX_HEAP_ANALYSIS_HTML,
} from './dijkstra-index-heap-problem-content';

export interface DijkstraEdge {
  to: number;
  weight: number;
}

export interface DijkstraIndexHeapStep {
  type: 'INIT' | 'POP_MIN' | 'RELAX_INSERT' | 'RELAX_DECREASE' | 'RELAX_IGNORE' | 'ALL_DONE';
  curNode?: number;
  neighborNode?: number;
  heapSnapshot: number[];
  whereSnapshot: number[];
  distSnapshot: number[];
  heapSize: number;
  message: string;
}

class IndexHeapAudio {
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

  public static playInsert(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {}
  }

  public static playDecrease(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  public static playLock(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
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
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.25);
      });
    } catch {}
  }
}

export class DijkstraIndexHeapVisualizer extends StepVisualizer<any> {
  // 图数据 (1-indexed)
  private n = 5;
  private adj: DijkstraEdge[][] = [];
  private nodePositions: Array<{ x: number; y: number }> = [];

  // 推演步骤
  private traceSteps: DijkstraIndexHeapStep[] = [];
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
    this.codeLanguages = DIJKSTRA_INDEX_HEAP_CODE_LANGUAGES;
    this.codeLines = DIJKSTRA_INDEX_HEAP_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '反向索引堆 Dijkstra 引擎 (洛谷 P4779)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '反向索引堆 Dijkstra' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_LUOGU');
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

    if (presetKey === 'CLASSIC_LUOGU') {
      this.n = 5;
      this.adj = [
        [],
        [{ to: 2, weight: 2 }, { to: 3, weight: 5 }],
        [{ to: 3, weight: 1 }, { to: 4, weight: 4 }, { to: 5, weight: 7 }],
        [{ to: 4, weight: 2 }],
        [{ to: 5, weight: 1 }],
        [],
      ];
      this.nodePositions = [
        { x: 0, y: 0 },
        { x: 40, y: 115 },  // 1 (源点)
        { x: 110, y: 55 },  // 2
        { x: 110, y: 175 }, // 3
        { x: 180, y: 85 },  // 4
        { x: 230, y: 145 }, // 5
      ];
    } else if (presetKey === 'DECREASE_KEY_CASCADE') {
      this.n = 4;
      this.adj = [
        [],
        [{ to: 2, weight: 10 }, { to: 3, weight: 2 }],
        [{ to: 4, weight: 1 }],
        [{ to: 2, weight: 3 }, { to: 4, weight: 12 }],
        [],
      ];
      this.nodePositions = [
        { x: 0, y: 0 },
        { x: 45, y: 115 },
        { x: 135, y: 55 },
        { x: 135, y: 175 },
        { x: 225, y: 115 },
      ];
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const n = this.n;
    const heap: number[] = Array(n + 1).fill(0);
    const where: number[] = Array(n + 1).fill(-1);
    const dist: number[] = Array(n + 1).fill(Infinity);
    let size = 0;

    const swapNode = (i: number, j: number) => {
      where[heap[i]] = j;
      where[heap[j]] = i;
      const tmp = heap[i];
      heap[i] = heap[j];
      heap[j] = tmp;
    };

    const heapInsert = (i: number) => {
      while (dist[heap[i]] < dist[heap[Math.floor((i - 1) / 2)]]) {
        const p = Math.floor((i - 1) / 2);
        swapNode(i, p);
        i = p;
      }
    };

    const heapify = (i: number) => {
      let l = i * 2 + 1;
      while (l < size) {
        let best = (l + 1 < size && dist[heap[l + 1]] < dist[heap[l]]) ? l + 1 : l;
        best = dist[heap[best]] < dist[heap[i]] ? best : i;
        if (best === i) break;
        swapNode(best, i);
        i = best;
        l = i * 2 + 1;
      }
    };

    const steps: DijkstraIndexHeapStep[] = [];
    const cloneHeap = () => heap.slice(0, size);
    const cloneWhere = () => [...where];
    const cloneDist = () => [...dist];

    // 初始化源点 1
    heap[size] = 1;
    where[1] = size;
    dist[1] = 0;
    size++;

    steps.push({
      type: 'INIT',
      curNode: 1,
      heapSnapshot: cloneHeap(),
      whereSnapshot: cloneWhere(),
      distSnapshot: cloneDist(),
      heapSize: size,
      message: `🚀 初始化：源点 N1 入堆，设置 dist[1] = 0, where[1] = 0。`,
    });

    while (size > 0) {
      const u = heap[0];
      swapNode(0, --size);
      heapify(0);
      where[u] = -2; // 锁定

      steps.push({
        type: 'POP_MIN',
        curNode: u,
        heapSnapshot: cloneHeap(),
        whereSnapshot: cloneWhere(),
        distSnapshot: cloneDist(),
        heapSize: size,
        message: `👑 弹出堆顶最小距离节点 N${u} (最优距离 = ${dist[u]})，设置 where[${u}] = -2 彻底锁定！`,
      });

      for (const edge of this.adj[u]) {
        const v = edge.to;
        const w = edge.weight;

        if (where[v] === -1) {
          // 首次入堆
          heap[size] = v;
          where[v] = size;
          dist[v] = dist[u] + w;
          heapInsert(size++);

          steps.push({
            type: 'RELAX_INSERT',
            curNode: u,
            neighborNode: v,
            heapSnapshot: cloneHeap(),
            whereSnapshot: cloneWhere(),
            distSnapshot: cloneDist(),
            heapSize: size,
            message: `✨ [首次入堆] 边 N${u} → N${v} (权 ${w})：首次发现 N${v}，加入堆中设置 dist[${v}] = ${dist[v]}，where[${v}] = ${where[v]}。`,
          });
        } else if (where[v] >= 0) {
          // 在堆中松弛
          if (dist[u] + w < dist[v]) {
            const oldD = dist[v];
            dist[v] = dist[u] + w;
            heapInsert(where[v]);

            steps.push({
              type: 'RELAX_DECREASE',
              curNode: u,
              neighborNode: v,
              heapSnapshot: cloneHeap(),
              whereSnapshot: cloneWhere(),
              distSnapshot: cloneDist(),
              heapSize: size,
              message: `⚡ [原地 decreaseKey 核心优化！] 边 N${u} → N${v}：发现更短路径 (${dist[u]} + ${w} = ${dist[v]} < ${oldD})！N${v} 原地在堆中上浮调整！`,
            });
          }
        } else {
          // where[v] === -2
          steps.push({
            type: 'RELAX_IGNORE',
            curNode: u,
            neighborNode: v,
            heapSnapshot: cloneHeap(),
            whereSnapshot: cloneWhere(),
            distSnapshot: cloneDist(),
            heapSize: size,
            message: `🔒 边 N${u} → N${v}：节点 N${v} 已锁定最短路 (where == -2)，直接忽略！`,
          });
        }
      }
    }

    steps.push({
      type: 'ALL_DONE',
      heapSnapshot: cloneHeap(),
      whereSnapshot: cloneWhere(),
      distSnapshot: cloneDist(),
      heapSize: 0,
      message: `🏁 Dijkstra 搜索完成！所有可达节点的最短距离均已锁定，堆总操作次数达到极限常数优化！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#dijkstra-heap-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: DIJKSTRA_INDEX_HEAP_CODE_LANGUAGES,
      problemHtml: DIJKSTRA_INDEX_HEAP_PROBLEM_HTML,
      analysisHtml: DIJKSTRA_INDEX_HEAP_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-dijkstra-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-dijkstra-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-dijkstra-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.dijkstra-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_LUOGU';
        this.root?.querySelectorAll('.dijkstra-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-dijkstra-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        IndexHeapAudio.isMuted = !IndexHeapAudio.isMuted;
        soundBtn.textContent = IndexHeapAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'POP_MIN') IndexHeapAudio.playLock();
      else if (cur.type === 'RELAX_INSERT') IndexHeapAudio.playInsert();
      else if (cur.type === 'RELAX_DECREASE') IndexHeapAudio.playDecrease();
      else if (cur.type === 'ALL_DONE') IndexHeapAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-dijkstra-autoplay') as HTMLButtonElement | null;
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
    const playBtn = this.root?.querySelector('#btn-dijkstra-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动推演';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#dijkstra-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#dijkstra-status-badge') as HTMLElement | null;
    const heapArrayBox = this.root.querySelector('#dijkstra-heap-array') as HTMLElement | null;
    const whereMapBox = this.root.querySelector('#dijkstra-where-map') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = '🎯 最短路已全部求出';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (heapArrayBox) {
      heapArrayBox.innerHTML = cur.heapSnapshot.length === 0
        ? '<span style="color: #94a3b8; font-size: 11px;">[堆已空]</span>'
        : cur.heapSnapshot
            .map((node, idx) => `
              <div style="display: flex; flex-direction: column; align-items: center; background: #1e293b; border: 1px solid #38bdf8; border-radius: 4px; padding: 2px 5px; min-width: 32px;">
                <span style="color: #94a3b8; font-size: 8px;">idx:${idx}</span>
                <span style="color: #f8fafc; font-weight: bold; font-size: 10.5px;">N${node}</span>
                <span style="color: #38bdf8; font-size: 9px;">d:${cur.distSnapshot[node]}</span>
              </div>
            `)
            .join('');
    }

    if (whereMapBox) {
      whereMapBox.innerHTML = Array.from({ length: this.n }, (_, i) => i + 1)
        .map((u) => {
          const w = cur.whereSnapshot[u];
          let bg = '#f8fafc';
          let border = '#cbd5e1';
          let label = '未入堆 (-1)';
          let color = '#64748b';

          if (w >= 0) {
            bg = '#fefce8';
            border = '#facc15';
            label = `堆内[${w}]`;
            color = '#ca8a04';
          } else if (w === -2) {
            bg = '#f0fdf4';
            border = '#86efac';
            label = '锁定 (-2)';
            color = '#16a34a';
          }

          return `
            <div style="display: flex; align-items: center; justify-content: space-between; background: ${bg}; border: 1px solid ${border}; border-radius: 4px; padding: 2px 6px; font-size: 10.5px;">
              <span style="font-weight: bold;">N${u}</span>
              <span style="color: ${color}; font-weight: 600;">${label}</span>
            </div>
          `;
        })
        .join('');
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

    // 1. 绘制有向边与权重
    for (let u = 1; u <= this.n; u++) {
      const p1 = this.nodePositions[u];
      if (!p1) continue;

      for (const edge of this.adj[u]) {
        const v = edge.to;
        const w = edge.weight;
        const p2 = this.nodePositions[v];
        if (!p2) continue;

        const isCurrentRay = cur && cur.curNode === u && cur.neighborNode === v;

        ctx.save();
        if (isCurrentRay) {
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 12;
        } else {
          ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
          ctx.lineWidth = 2;
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // 边权重
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.font = 'bold 9.5px monospace';
        ctx.fillStyle = isCurrentRay ? '#facc15' : '#94a3b8';
        ctx.fillText(`${w}`, midX, midY - 4);

        ctx.restore();
      }
    }

    // 2. 绘制节点
    for (let i = 1; i <= this.n; i++) {
      const pos = this.nodePositions[i];
      if (!pos) continue;

      const w = cur ? cur.whereSnapshot[i] : -1;
      const d = cur ? cur.distSnapshot[i] : Infinity;
      const isCur = cur && cur.curNode === i;

      ctx.save();
      let radius = 18;
      let fillColor = '#1e293b';
      let strokeColor = '#475569';

      if (w >= 0) {
        fillColor = '#854d0e';
        strokeColor = '#facc15';
      } else if (w === -2) {
        fillColor = '#065f46';
        strokeColor = '#22c55e';
      }

      if (isCur) {
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
      ctx.fillText(`N${i}`, pos.x, pos.y - 3);

      // 最短路距离
      ctx.font = '8.5px monospace';
      ctx.fillStyle = d === Infinity ? '#64748b' : '#38bdf8';
      ctx.fillText(d === Infinity ? '∞' : `${d}`, pos.x, pos.y + 7);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const DIJKSTRA_INDEX_HEAP_TEMPLATE = `
  <div id="algo-dijkstra-index-heap-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">⚡</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">反向索引堆优化 Dijkstra (Index Min-Heap)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="dijkstra-preset-btn active" data-preset="CLASSIC_LUOGU" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">洛谷标准图</button>
          <button class="dijkstra-preset-btn" data-preset="DECREASE_KEY_CASCADE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">原地上浮级联网</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="dijkstra-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-dijkstra-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步松弛</button>
        <button id="btn-dijkstra-autoplay" style="background: linear-gradient(135deg, #eab308, #ca8a04); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(234,179,8,0.25);">▶️ 自动推演</button>
        <button id="btn-dijkstra-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-dijkstra-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #fefce8; border: 1px solid #fef08a; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #854d0e;">
      <div id="dijkstra-narration-box" style="font-weight: 700; color: #713f12;">
        💡 准备就绪：反向索引堆维护 where[] 映射表，支持原地 decreaseKey 极限优化！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：网络拓扑与反向索引堆仪表盘 -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="dijkstra-heap-canvas" width="460" height="170" style="width: 460px; height: 170px;"></canvas>
        </div>

        <!-- 堆与 where 映射状态条 -->
        <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px;">
          <div style="font-size: 10.5px; font-weight: 700; color: #0f172a;">📊 当前反向索引堆数组 heap[]:</div>
          <div id="dijkstra-heap-array" style="display: flex; gap: 6px; overflow-x: auto; min-height: 36px; align-items: center;"></div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px;">
          <div style="font-size: 10.5px; font-weight: 700; color: #0f172a;">🧭 where[] 映射状态表 (-1:未入堆, &ge;0:堆内, -2:已锁定):</div>
          <div id="dijkstra-where-map" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px;"></div>
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="dijkstra-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'dijkstra-index-heap',
  name: '反向索引堆优化 Dijkstra (Index Min-Heap)',
  viewId: 'algo-dijkstra-index-heap-view',
  category: 'graph',
  description: '单源最短路径极限常数优化算法：左程云 class061 反向索引堆、where[] 下标映射、原地 decreaseKey 与 O(V) 空间常数优化 (洛谷 P4779)',
  icon: '⚡',
  template: DIJKSTRA_INDEX_HEAP_TEMPLATE,
  Visualizer: DijkstraIndexHeapVisualizer,
  difficulty: 3,
  levelOrder: 37,
  learningGoal: '掌握反向索引堆的双向映射维护、原地 decreaseKey 上浮优化以及彻底消除堆内冗余节点的工程威力',
});
