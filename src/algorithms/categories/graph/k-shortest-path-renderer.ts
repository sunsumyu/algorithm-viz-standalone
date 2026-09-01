/**
 * K 短路与 A* 启发式搜索 (K-th Shortest Path) 可视化引擎
 * 进阶图论: 反向图 Dijkstra 预处理 h(u) = dis[u->T]、正向 A* 优先队列搜索 f(u) = g(u) + h(u)、终点第 K 次弹出即为第 K 短路 (洛谷 P2483)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  K_SHORTEST_PATH_CODE_LANGUAGES,
  K_SHORTEST_PATH_PROBLEM_HTML,
  K_SHORTEST_PATH_ANALYSIS_HTML,
} from './k-shortest-path-problem-content';

export interface KPathStep {
  type: 'REV_DIJKSTRA' | 'ASTAR_EXPAND' | 'FOUND_PATH' | 'ALL_DONE';
  hSnapshot: number[];
  curNode?: number;
  curG?: number;
  curF?: number;
  activePath?: number[];
  discoveredPaths: Array<{ path: number[]; len: number; rank: number }>;
  message: string;
}

class KPathAudio {
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

  public static playDijkstra(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playPop(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
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

export class KShortestPathVisualizer extends StepVisualizer<any> {
  // 图与参数 (1-indexed)
  private n = 5;
  private S = 1;
  private T = 5;
  private K = 3;
  private edges: Array<{ u: number; v: number; w: number }> = [];
  private nodePositions: Array<{ x: number; y: number }> = [];

  // 推演步骤
  private traceSteps: KPathStep[] = [];
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
    this.codeLanguages = K_SHORTEST_PATH_CODE_LANGUAGES;
    this.codeLines = K_SHORTEST_PATH_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = 'K 短路 A* 求解引擎 (K-th Shortest Path)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: 'K 短路' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_DAG_MULTI_PATH');
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

    if (presetKey === 'CLASSIC_DAG_MULTI_PATH') {
      this.n = 5;
      this.S = 1;
      this.T = 5;
      this.K = 3;
      this.edges = [
        { u: 1, v: 2, w: 2 },
        { u: 1, v: 3, w: 4 },
        { u: 2, v: 4, w: 3 },
        { u: 3, v: 4, w: 1 },
        { u: 2, v: 5, w: 7 },
        { u: 4, v: 5, w: 2 },
      ];
      this.nodePositions = [
        { x: 0, y: 0 },
        { x: 60, y: 100 },  // 1 (S)
        { x: 170, y: 45 },  // 2
        { x: 170, y: 155 }, // 3
        { x: 290, y: 100 }, // 4
        { x: 400, y: 100 }, // 5 (T)
      ];
    } else {
      this.n = 4;
      this.S = 1;
      this.T = 4;
      this.K = 3;
      this.edges = [
        { u: 1, v: 2, w: 2 },
        { u: 2, v: 3, w: 1 },
        { u: 3, v: 2, w: 2 }, // 环 2-3
        { u: 2, v: 4, w: 4 },
        { u: 3, v: 4, w: 2 },
      ];
      this.nodePositions = [
        { x: 0, y: 0 },
        { x: 70, y: 100 },
        { x: 180, y: 50 },
        { x: 180, y: 150 },
        { x: 380, y: 100 },
      ];
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const n = this.n;
    const S = this.S;
    const T = this.T;
    const K = this.K;

    const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n + 1 }, () => []);
    const revAdj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n + 1 }, () => []);

    this.edges.forEach((e) => {
      adj[e.u].push({ to: e.v, w: e.w });
      revAdj[e.v].push({ to: e.u, w: e.w });
    });

    // 1. 反向 Dijkstra 计算 h(u) = dis[u->T]
    const h = Array(n + 1).fill(Infinity);
    h[T] = 0;
    const pqDijkstra: Array<{ u: number; d: number }> = [{ u: T, d: 0 }];

    while (pqDijkstra.length > 0) {
      pqDijkstra.sort((a, b) => a.d - b.d);
      const { u, d } = pqDijkstra.shift()!;
      if (d > h[u]) continue;

      for (const e of revAdj[u]) {
        if (h[e.to] > h[u] + e.w) {
          h[e.to] = h[u] + e.w;
          pqDijkstra.push({ u: e.to, d: h[e.to] });
        }
      }
    }

    const steps: KPathStep[] = [];
    const discoveredPaths: Array<{ path: number[]; len: number; rank: number }> = [];

    steps.push({
      type: 'REV_DIJKSTRA',
      hSnapshot: [...h],
      discoveredPaths: [],
      message: `🔄 [阶段 1: 反向 Dijkstra] 以终点 ${T} 为源点，预处理各点到终点的精确最短路作为 A* 启发函数 h(u)！`,
    });

    // 2. 正向 A* 搜索
    interface AStarNode {
      u: number;
      g: number;
      f: number;
      path: number[];
    }

    const pq: AStarNode[] = [{ u: S, g: 0, f: h[S], path: [S] }];
    const countPop = Array(n + 1).fill(0);

    while (pq.length > 0) {
      pq.sort((a, b) => a.f - b.f);
      const cur = pq.shift()!;
      countPop[cur.u]++;

      steps.push({
        type: 'ASTAR_EXPAND',
        hSnapshot: [...h],
        curNode: cur.u,
        curG: cur.g,
        curF: cur.f,
        activePath: cur.path,
        discoveredPaths: [...discoveredPaths],
        message: `🔍 [A* 优先队列弹出] 节点 ${cur.u}：累计花费 g=${cur.g}, 启发估价 h=${h[cur.u]}, 综合优先值 f=${cur.f} (第 ${countPop[cur.u]} 次到达)！`,
      });

      if (cur.u === T) {
        const rank = countPop[T];
        discoveredPaths.push({ path: [...cur.path], len: cur.g, rank });

        steps.push({
          type: 'FOUND_PATH',
          hSnapshot: [...h],
          curNode: T,
          curG: cur.g,
          curF: cur.f,
          activePath: cur.path,
          discoveredPaths: [...discoveredPaths],
          message: `🎯 [锁定第 ${rank} 短路] 终点 ${T} 第 ${rank} 次被弹出小根堆！路径: [${cur.path.join(' → ')}]，长度 = ${cur.g}！`,
        });

        if (rank === K) break;
      }

      if (countPop[cur.u] <= K) {
        for (const e of adj[cur.u]) {
          const nextG = cur.g + e.w;
          const nextF = nextG + h[e.to];
          pq.push({ u: e.to, g: nextG, f: nextF, path: [...cur.path, e.to] });
        }
      }
    }

    steps.push({
      type: 'ALL_DONE',
      hSnapshot: [...h],
      discoveredPaths: [...discoveredPaths],
      message: `🎉 [K 短路搜索完毕] 成功求出从 ${S} 到 ${T} 的前 ${discoveredPaths.length} 条最短路径！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#kpath-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: K_SHORTEST_PATH_CODE_LANGUAGES,
      problemHtml: K_SHORTEST_PATH_PROBLEM_HTML,
      analysisHtml: K_SHORTEST_PATH_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-kpath-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-kpath-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-kpath-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.kpath-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_DAG_MULTI_PATH';
        this.root?.querySelectorAll('.kpath-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-kpath-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        KPathAudio.isMuted = !KPathAudio.isMuted;
        soundBtn.textContent = KPathAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'REV_DIJKSTRA') KPathAudio.playDijkstra();
      else if (cur.type === 'ASTAR_EXPAND') KPathAudio.playPop();
      else if (cur.type === 'FOUND_PATH' || cur.type === 'ALL_DONE') KPathAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-kpath-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停搜索';

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
    const playBtn = this.root?.querySelector('#btn-kpath-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动搜索';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#kpath-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#kpath-status-badge') as HTMLElement | null;
    const pathsBadge = this.root.querySelector('#kpath-paths-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = '🏁 K 短路搜索完成';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (pathsBadge) {
      if (cur.discoveredPaths.length > 0) {
        pathsBadge.innerHTML = cur.discoveredPaths
          .map((p) => `<span style="background: #1e293b; color: #facc15; padding: 2px 6px; border-radius: 4px; font-weight: bold;">第${p.rank}短: ${p.len}</span>`)
          .join(' ');
      } else {
        pathsBadge.textContent = '搜索中...';
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

    // 1. 绘制有向边
    this.edges.forEach((e) => {
      const p1 = this.nodePositions[e.u];
      const p2 = this.nodePositions[e.v];
      if (!p1 || !p2) return;

      const isPathEdge = cur && cur.activePath && cur.activePath.some((node, idx) => node === e.u && cur.activePath![idx + 1] === e.v);

      ctx.save();
      ctx.strokeStyle = isPathEdge ? '#facc15' : 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = isPathEdge ? 3.5 : 2;
      if (isPathEdge) {
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 10;
      }

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // 箭头
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      const arrowX = p2.x - 17 * Math.cos(angle);
      const arrowY = p2.y - 17 * Math.sin(angle);

      ctx.fillStyle = isPathEdge ? '#facc15' : '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(arrowX - 7 * Math.cos(angle - Math.PI / 6), arrowY - 7 * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(arrowX - 7 * Math.cos(angle + Math.PI / 6), arrowY - 7 * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      // 边权
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = isPathEdge ? '#fde047' : '#94a3b8';
      ctx.fillText(`w=${e.w}`, midX, midY - 4);

      ctx.restore();
    });

    // 2. 绘制节点与启发估价值 h(u)
    for (let i = 1; i <= this.n; i++) {
      const pos = this.nodePositions[i];
      if (!pos) continue;

      const isS = i === this.S;
      const isT = i === this.T;
      const isCur = cur && cur.curNode === i;
      const hVal = cur ? cur.hSnapshot[i] : Infinity;

      ctx.save();
      let strokeColor = isS ? '#10b981' : isT ? '#ec4899' : '#38bdf8';
      let fillColor = '#1e293b';
      let radius = 16;

      if (isCur) {
        strokeColor = '#facc15';
        fillColor = '#854d0e';
        radius = 18 + Math.sin(this.pulseAnim) * 1.5;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
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
      ctx.fillText(`${i}${isS ? '(S)' : isT ? '(T)' : ''}`, pos.x, pos.y - 3);

      // h(u) 估价值
      ctx.font = '9px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(hVal === Infinity ? 'h:∞' : `h:${hVal}`, pos.x, pos.y + 8);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const K_SHORTEST_PATH_TEMPLATE = `
  <div id="algo-k-shortest-path-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🚀</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">K 短路问题 (A* Algorithm)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="kpath-preset-btn active" data-preset="CLASSIC_DAG_MULTI_PATH" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">5 节点多重汇聚图 (K=3)</button>
          <button class="kpath-preset-btn" data-preset="CYCLE_LOOP_GRAPH" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">含环多次绕行图 (K=3)</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="kpath-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-kpath-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-kpath-autoplay" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(59,130,246,0.25);">▶️ 自动搜索</button>
        <button id="btn-kpath-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-kpath-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #1e40af;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>🏆 已发现短路: <b id="kpath-paths-badge" style="color: #059669; font-size: 12px;">搜索中...</b></span>
      </div>
      <div id="kpath-narration-box" style="font-weight: 700; color: #1e3a8a;">
        💡 准备就绪：反向 Dijkstra 预处理 h(u)，A* 优先队列终点第 K 次弹出求得答案！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：图 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="kpath-canvas" width="460" height="200" style="width: 460px; height: 200px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🟢 绿色 S 为起点 | 🌸 粉色 T 为终点 | 节点下方标注启发式估计值 h:dis[u→T]
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="kpath-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'k-shortest-path',
  name: 'K 短路问题 (K-th Shortest Path)',
  viewId: 'algo-k-shortest-path-view',
  category: 'graph',
  description: '进阶图论搜索算法：反向图 Dijkstra 计算真实最短路作为启发函数 h(u)、正向 A* 优先队列搜索与终点第 K 次弹出判定 (洛谷 P2483)',
  icon: '🚀',
  template: K_SHORTEST_PATH_TEMPLATE,
  Visualizer: KShortestPathVisualizer,
  difficulty: 3,
  levelOrder: 52,
  learningGoal: '掌握 A* 启发函数单调一致性、反向 Dijkstra 构建完美估价函数与优先队列第 K 次到达终点正确性证明',
});
