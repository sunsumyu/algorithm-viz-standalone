/**
 * 严格次小生成树 (Strict Second Minimum Spanning Tree) 可视化引擎
 * 进阶图论: Kruskal 求最小生成树、树上倍增维护路径最大与严格次大边权、非树边替换瓶颈边 (洛谷 P4180)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  SECOND_MST_CODE_LANGUAGES,
  SECOND_MST_PROBLEM_HTML,
  SECOND_MST_ANALYSIS_HTML,
} from './second-mst-problem-content';

export interface SecondMSTStep {
  type: 'KRUSKAL_MST' | 'CHECK_NON_TREE' | 'SWAP_EDGE' | 'ALL_DONE';
  mstEdges: Array<{ u: number; v: number; w: number }>;
  nonTreeEdges: Array<{ u: number; v: number; w: number }>;
  curEdge?: { u: number; v: number; w: number };
  cutEdge?: { u: number; v: number; w: number };
  cycleEdges?: Array<{ u: number; v: number }>;
  max1?: number;
  max2?: number;
  delta?: number;
  bestSecondMST?: number;
  message: string;
}

class SecondMSTAudio {
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

  public static playMST(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  public static playTry(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playSwap(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const chord = [523.25, 659.25, 783.99, 1046.5];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.22);
      });
    } catch {}
  }
}

export class SecondMSTVisualizer extends StepVisualizer<any> {
  // 图节点与坐标 (1-indexed)
  private n = 5;
  private allEdges: Array<{ u: number; v: number; w: number }> = [];
  private nodePositions: Array<{ x: number; y: number }> = [];

  // 推演步骤
  private traceSteps: SecondMSTStep[] = [];
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
    this.codeLanguages = SECOND_MST_CODE_LANGUAGES;
    this.codeLines = SECOND_MST_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '严格次小生成树计算引擎 (Strict Second MST)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '次小生成树' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_STRICT_MST');
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

    if (presetKey === 'CLASSIC_STRICT_MST') {
      this.n = 5;
      this.allEdges = [
        { u: 1, v: 2, w: 2 },
        { u: 1, v: 3, w: 4 },
        { u: 2, v: 3, w: 3 },
        { u: 2, v: 4, w: 5 },
        { u: 3, v: 4, w: 1 },
        { u: 3, v: 5, w: 7 },
        { u: 4, v: 5, w: 6 },
      ];
      this.nodePositions = [
        { x: 0, y: 0 },
        { x: 90, y: 50 },   // 1
        { x: 230, y: 35 },  // 2
        { x: 130, y: 150 }, // 3
        { x: 320, y: 140 }, // 4
        { x: 420, y: 60 },  // 5
      ];
    } else {
      this.n = 4;
      this.allEdges = [
        { u: 1, v: 2, w: 3 },
        { u: 2, v: 3, w: 4 },
        { u: 3, v: 4, w: 4 },
        { u: 4, v: 1, w: 2 },
        { u: 1, v: 3, w: 5 },
      ];
      this.nodePositions = [
        { x: 0, y: 0 },
        { x: 120, y: 45 },
        { x: 320, y: 45 },
        { x: 320, y: 155 },
        { x: 120, y: 155 },
      ];
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const n = this.n;
    const sortedEdges = [...this.allEdges].sort((a, b) => a.w - b.w);

    const parent = Array.from({ length: n + 1 }, (_, i) => i);
    const findSet = (i: number): number => (parent[i] === i ? i : (parent[i] = findSet(parent[i])));

    const mstEdges: Array<{ u: number; v: number; w: number }> = [];
    const nonTreeEdges: Array<{ u: number; v: number; w: number }> = [];
    let mstSum = 0;

    sortedEdges.forEach((e) => {
      const ru = findSet(e.u);
      const rv = findSet(e.v);
      if (ru !== rv) {
        parent[ru] = rv;
        mstEdges.push(e);
        mstSum += e.w;
      } else {
        nonTreeEdges.push(e);
      }
    });

    const steps: SecondMSTStep[] = [];

    steps.push({
      type: 'KRUSKAL_MST',
      mstEdges: [...mstEdges],
      nonTreeEdges: [...nonTreeEdges],
      message: `🌲 [Kruskal 阶段] 成功构建最小生成树 (MST)，包含 ${mstEdges.length} 条树边，基础权值和 = ${mstSum}！`,
    });

    // 树上 DFS 寻找路径与瓶颈边
    const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n + 1 }, () => []);
    mstEdges.forEach((e) => {
      adj[e.u].push({ to: e.v, w: e.w });
      adj[e.v].push({ to: e.u, w: e.w });
    });

    const findPathOnTree = (start: number, target: number): Array<{ u: number; v: number; w: number }> => {
      const path: Array<{ u: number; v: number; w: number }> = [];
      const visited = Array(n + 1).fill(false);

      const dfs = (u: number): boolean => {
        visited[u] = true;
        if (u === target) return true;
        for (const edge of adj[u]) {
          if (!visited[edge.to]) {
            path.push({ u, v: edge.to, w: edge.w });
            if (dfs(edge.to)) return true;
            path.pop();
          }
        }
        return false;
      };

      dfs(start);
      return path;
    };

    let bestDelta = Infinity;
    let bestCutEdge: { u: number; v: number; w: number } | undefined;
    let bestNonTreeEdge: { u: number; v: number; w: number } | undefined;

    nonTreeEdges.forEach((e) => {
      const path = findPathOnTree(e.u, e.v);
      const weights = path.map((p) => p.w).sort((a, b) => b - a);
      const max1 = weights[0] || -1;
      let max2 = -1;
      for (const w of weights) {
        if (w < max1) {
          max2 = w;
          break;
        }
      }

      let delta = Infinity;
      let cutCandidate: { u: number; v: number; w: number } | undefined;

      if (e.w > max1) {
        delta = e.w - max1;
        cutCandidate = path.find((p) => p.w === max1);
      } else if (max2 !== -1) {
        delta = e.w - max2;
        cutCandidate = path.find((p) => p.w === max2);
      }

      steps.push({
        type: 'CHECK_NON_TREE',
        mstEdges: [...mstEdges],
        nonTreeEdges: [...nonTreeEdges],
        curEdge: e,
        cycleEdges: path.map((p) => ({ u: p.u, v: p.v })),
        max1,
        max2,
        delta: delta === Infinity ? undefined : delta,
        message: `🔍 [探测非树边 (${e.u}, ${e.v}, w=${e.w})] 环上树边最大边权 max1=${max1}, 次大边权 max2=${max2}。增量 Δ = ${delta === Infinity ? '无' : delta}。`,
      });

      if (delta < bestDelta && cutCandidate) {
        bestDelta = delta;
        bestCutEdge = cutCandidate;
        bestNonTreeEdge = e;

        steps.push({
          type: 'SWAP_EDGE',
          mstEdges: [...mstEdges],
          nonTreeEdges: [...nonTreeEdges],
          curEdge: e,
          cutEdge: cutCandidate,
          bestSecondMST: mstSum + bestDelta,
          message: `✂️ [更新最优候选] 替换瓶颈边 (${cutCandidate.u}, ${cutCandidate.v}, w=${cutCandidate.w})，加入非树边 (${e.u}, ${e.v}, w=${e.w})，当前严格次小生成树权值 = ${mstSum + bestDelta}！`,
        });
      }
    });

    steps.push({
      type: 'ALL_DONE',
      mstEdges: [...mstEdges],
      nonTreeEdges: [...nonTreeEdges],
      curEdge: bestNonTreeEdge,
      cutEdge: bestCutEdge,
      bestSecondMST: mstSum + bestDelta,
      message: `🎉 [计算完成] 严格次小生成树构建成功！MST 权值 = ${mstSum}，严格次小 MST 权值 = ${mstSum + bestDelta} (增量 Δ = +${bestDelta})！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#secondmst-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: SECOND_MST_CODE_LANGUAGES,
      problemHtml: SECOND_MST_PROBLEM_HTML,
      analysisHtml: SECOND_MST_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-secondmst-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-secondmst-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-secondmst-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.secondmst-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_STRICT_MST';
        this.root?.querySelectorAll('.secondmst-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-secondmst-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        SecondMSTAudio.isMuted = !SecondMSTAudio.isMuted;
        soundBtn.textContent = SecondMSTAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'KRUSKAL_MST') SecondMSTAudio.playMST();
      else if (cur.type === 'CHECK_NON_TREE') SecondMSTAudio.playTry();
      else if (cur.type === 'SWAP_EDGE' || cur.type === 'ALL_DONE') SecondMSTAudio.playSwap();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-secondmst-autoplay') as HTMLButtonElement | null;
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
    const playBtn = this.root?.querySelector('#btn-secondmst-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动求解';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#secondmst-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#secondmst-status-badge') as HTMLElement | null;
    const ansBadge = this.root.querySelector('#secondmst-ans-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = '🏁 次小生成树就绪';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (ansBadge) {
      ansBadge.textContent = cur.bestSecondMST ? `${cur.bestSecondMST}` : '计算中...';
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

    // 1. 绘制所有非树边 (灰色虚线)
    if (cur) {
      cur.nonTreeEdges.forEach((e) => {
        const p1 = this.nodePositions[e.u];
        const p2 = this.nodePositions[e.v];
        if (!p1 || !p2) return;

        const isCurEdge = cur.curEdge && cur.curEdge.u === e.u && cur.curEdge.v === e.v && cur.curEdge.w === e.w;

        ctx.save();
        ctx.strokeStyle = isCurEdge ? '#f59e0b' : 'rgba(148, 163, 184, 0.35)';
        ctx.lineWidth = isCurEdge ? 3 : 1.5;
        ctx.setLineDash(isCurEdge ? [] : [4, 4]);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.font = 'bold 9.5px monospace';
        ctx.fillStyle = isCurEdge ? '#facc15' : '#64748b';
        ctx.fillText(`w=${e.w}`, midX, midY);

        ctx.restore();
      });

      // 2. 绘制 MST 树边 (绿色实线)
      cur.mstEdges.forEach((e) => {
        const p1 = this.nodePositions[e.u];
        const p2 = this.nodePositions[e.v];
        if (!p1 || !p2) return;

        const isCut = cur.cutEdge && ((cur.cutEdge.u === e.u && cur.cutEdge.v === e.v) || (cur.cutEdge.u === e.v && cur.cutEdge.v === e.u));
        const isCycle = cur.cycleEdges && cur.cycleEdges.some((ce) => (ce.u === e.u && ce.v === e.v) || (ce.u === e.v && ce.v === e.u));

        ctx.save();
        let strokeColor = '#10b981';
        let lineW = 2.5;

        if (isCut) {
          strokeColor = '#ef4444';
          lineW = 3.5;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 10;
        } else if (isCycle) {
          strokeColor = '#38bdf8';
          lineW = 3;
        }

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineW;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = isCut ? '#f87171' : '#4ade80';
        ctx.fillText(`w=${e.w}`, midX, midY - 2);

        if (isCut) {
          ctx.font = '12px sans-serif';
          ctx.fillText('✂️', midX + 8, midY + 4);
        }

        ctx.restore();
      });
    }

    // 3. 绘制节点
    for (let i = 1; i <= this.n; i++) {
      const pos = this.nodePositions[i];
      if (!pos) continue;

      ctx.save();
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${i}`, pos.x, pos.y);
      ctx.restore();
    }

    ctx.restore();
  }
}

export const SECOND_MST_TEMPLATE = `
  <div id="algo-second-mst-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🌲</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">严格次小生成树 (Strict Second MST)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="secondmst-preset-btn active" data-preset="CLASSIC_STRICT_MST" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">5 节点经典严格图</button>
          <button class="secondmst-preset-btn" data-preset="EQUAL_WEIGHT_CASE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">同权边严格次大测试</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="secondmst-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-secondmst-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-secondmst-autoplay" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(16,185,129,0.25);">▶️ 自动求解</button>
        <button id="btn-secondmst-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-secondmst-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #166534;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>🏆 严格次小 MST 权值: <b id="secondmst-ans-badge" style="color: #059669; font-size: 12px;">计算中...</b></span>
      </div>
      <div id="secondmst-narration-box" style="font-weight: 700; color: #14532d;">
        💡 准备就绪：Kruskal 跑出 MST，倍增维护 (max1, max2)，枚举非树边求最小增量！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：图 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="secondmst-canvas" width="460" height="200" style="width: 460px; height: 200px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🟢 绿色为 MST 树边 | 🟡 橙色为当前探测的非树边 | 🔴 红色 ✂️ 为被替换的瓶颈边
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="secondmst-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'second-mst',
  name: '严格次小生成树 (Strict Second MST)',
  viewId: 'algo-second-mst-view',
  category: 'graph',
  description: '进阶图论瓶颈替换算法：Kruskal 求主 MST、树上倍增维护路径最大边权与严格次大边权、非树边替换瓶颈边 (洛谷 P4180)',
  icon: '🌲',
  template: SECOND_MST_TEMPLATE,
  Visualizer: SecondMSTVisualizer,
  difficulty: 3,
  levelOrder: 51,
  learningGoal: '掌握严格次小生成树与非严格次小生成树的区别、倍增维护 (max1, max2) 的区间合并方程与非树边替换证明',
});
