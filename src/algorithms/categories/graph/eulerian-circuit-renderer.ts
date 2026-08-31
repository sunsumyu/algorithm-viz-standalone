/**
 * 欧拉路径与欧拉回路 Hierholzer 算法 (Eulerian Path & Circuit) 可视化引擎
 * 参考左程云《算法通关课》class067: 一笔画判定、度数平衡、当前弧优化与后序压栈 (洛谷 P7771 / LeetCode 332)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  EULERIAN_CIRCUIT_CODE_LANGUAGES,
  EULERIAN_CIRCUIT_PROBLEM_HTML,
  EULERIAN_CIRCUIT_ANALYSIS_HTML,
} from './eulerian-circuit-problem-content';

export interface EulerEdge {
  id: number;
  u: number;
  v: number;
}

export interface EulerStep {
  type: 'DEGREE_CHECK' | 'EXPLORE_EDGE' | 'PUSH_POSTORDER' | 'NO_EULER' | 'CIRCUIT_DONE';
  curU: number;
  curV?: number;
  curEdgeId?: number;
  visitedEdgeIds: number[];
  postOrderStack: number[];
  finalPath?: number[];
  message: string;
}

class EulerAudio {
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

  public static playStroke(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playStack(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playWin(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const notes = [440, 554.37, 659.25, 880, 1108.7];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
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

export class EulerianCircuitVisualizer extends StepVisualizer<any> {
  // 图拓扑
  private n = 5;
  private isDirected = false;
  private rawEdges: EulerEdge[] = [];
  private nodePositions: Array<{ x: number; y: number }> = [];

  // 推演步骤
  private traceSteps: EulerStep[] = [];
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
    this.codeLanguages = EULERIAN_CIRCUIT_CODE_LANGUAGES;
    this.codeLines = EULERIAN_CIRCUIT_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '欧拉路径 Hierholzer 一笔画引擎 (class067)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '欧拉回路与路径' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('SANTA_HOUSE');
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

    if (presetKey === 'SANTA_HOUSE') {
      // 经典信封屋 (5 节点, 8 条边): 0,1 为底部左右; 2,3 为顶部左右; 4 为房顶尖
      this.n = 5;
      this.isDirected = false;
      this.rawEdges = [
        { id: 0, u: 0, v: 1 },
        { id: 1, u: 1, v: 3 },
        { id: 2, u: 3, v: 2 },
        { id: 3, u: 2, v: 0 },
        { id: 4, u: 0, v: 3 },
        { id: 5, u: 1, v: 2 },
        { id: 6, u: 2, v: 4 },
        { id: 7, u: 3, v: 4 },
      ];
      this.nodePositions = [
        { x: 150, y: 175 }, // 0
        { x: 310, y: 175 }, // 1
        { x: 150, y: 105 }, // 2
        { x: 310, y: 105 }, // 3
        { x: 230, y: 40 },  // 4
      ];
    } else if (presetKey === 'PENTAGRAM_STAR') {
      this.n = 5;
      this.isDirected = false;
      this.rawEdges = [
        { id: 0, u: 0, v: 1 },
        { id: 1, u: 1, v: 2 },
        { id: 2, u: 2, v: 3 },
        { id: 3, u: 3, v: 4 },
        { id: 4, u: 4, v: 0 },
        { id: 5, u: 0, v: 2 },
        { id: 6, u: 2, v: 4 },
        { id: 7, u: 4, v: 1 },
        { id: 8, u: 1, v: 3 },
        { id: 9, u: 3, v: 0 },
      ];
      const centerX = 230;
      const centerY = 115;
      const radius = 75;
      this.nodePositions = [];
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        this.nodePositions.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        });
      }
    } else if (presetKey === 'KONIGSBERG_BRIDGES') {
      this.n = 4;
      this.isDirected = false;
      this.rawEdges = [
        { id: 0, u: 0, v: 1 },
        { id: 1, u: 0, v: 1 },
        { id: 2, u: 0, v: 2 },
        { id: 3, u: 0, v: 2 },
        { id: 4, u: 0, v: 3 },
        { id: 5, u: 1, v: 3 },
        { id: 6, u: 2, v: 3 },
      ];
      this.nodePositions = [
        { x: 130, y: 115 },
        { x: 230, y: 55 },
        { x: 230, y: 175 },
        { x: 330, y: 115 },
      ];
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const n = this.n;
    const degrees = Array(n).fill(0);

    for (const e of this.rawEdges) {
      degrees[e.u]++;
      degrees[e.v]++;
    }

    const oddNodes: number[] = [];
    for (let i = 0; i < n; i++) {
      if (degrees[i] % 2 !== 0) oddNodes.push(i);
    }

    const steps: EulerStep[] = [];

    // 1. 度数校验
    if (oddNodes.length !== 0 && oddNodes.length !== 2) {
      steps.push({
        type: 'NO_EULER',
        curU: 0,
        visitedEdgeIds: [],
        postOrderStack: [],
        message: `⚠️ [无法一笔画] 奇度数节点共有 ${oddNodes.length} 个 (非 0 或 2)，根据欧拉定理，该图不存在欧拉路径！`,
      });
      this.traceSteps = steps;
      return;
    }

    let startNode = 0;
    if (oddNodes.length === 2) {
      startNode = oddNodes[0];
    }

    steps.push({
      type: 'DEGREE_CHECK',
      curU: startNode,
      visitedEdgeIds: [],
      postOrderStack: [],
      message: `📐 度数校验通过：奇度数点 ${oddNodes.length} 个。选定起始点为节点 ${startNode}，准备启动 Hierholzer 算法！`,
    });

    // 邻接表结构，每条边记录 edgeId 与 visited 状态
    const adj: Array<Array<{ to: number; edgeId: number }>> = Array.from({ length: n }, () => []);
    for (const e of this.rawEdges) {
      adj[e.u].push({ to: e.v, edgeId: e.id });
      if (!this.isDirected) {
        adj[e.v].push({ to: e.u, edgeId: e.id });
      }
    }

    // 排序保证字典序
    for (let i = 0; i < n; i++) {
      adj[i].sort((a, b) => a.to - b.to);
    }

    const head = Array(n).fill(0);
    const edgeUsed = Array(this.rawEdges.length).fill(false);
    const visitedEdgeIds: number[] = [];
    const stack: number[] = [];

    const dfs = (u: number) => {
      while (head[u] < adj[u].length) {
        const item = adj[u][head[u]++];
        if (edgeUsed[item.edgeId]) continue;

        edgeUsed[item.edgeId] = true;
        visitedEdgeIds.push(item.edgeId);

        steps.push({
          type: 'EXPLORE_EDGE',
          curU: u,
          curV: item.to,
          curEdgeId: item.edgeId,
          visitedEdgeIds: [...visitedEdgeIds],
          postOrderStack: [...stack],
          message: `🖌️ [画笔推进] 沿边 (${u} ↔ ${item.to}) 绘制前进，深入探索节点 ${item.to}...`,
        });

        dfs(item.to);
      }

      // 后序压栈
      stack.push(u);

      steps.push({
        type: 'PUSH_POSTORDER',
        curU: u,
        visitedEdgeIds: [...visitedEdgeIds],
        postOrderStack: [...stack],
        message: `📥 [后序入栈] 节点 ${u} 所有可用出边已绘制完毕，压入后序栈 (当前栈深: ${stack.length})。`,
      });
    };

    dfs(startNode);

    const finalPath = [...stack].reverse();
    steps.push({
      type: 'CIRCUIT_DONE',
      curU: startNode,
      visitedEdgeIds: [...visitedEdgeIds],
      postOrderStack: [...stack],
      finalPath,
      message: `🏁 一笔画绘制大功告成！完美欧拉路径: [${finalPath.join(' → ')}]！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#euler-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: EULERIAN_CIRCUIT_CODE_LANGUAGES,
      problemHtml: EULERIAN_CIRCUIT_PROBLEM_HTML,
      analysisHtml: EULERIAN_CIRCUIT_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-euler-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-euler-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-euler-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.euler-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'SANTA_HOUSE';
        this.root?.querySelectorAll('.euler-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-euler-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        EulerAudio.isMuted = !EulerAudio.isMuted;
        soundBtn.textContent = EulerAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'EXPLORE_EDGE') EulerAudio.playStroke();
      else if (cur.type === 'PUSH_POSTORDER') EulerAudio.playStack();
      else if (cur.type === 'CIRCUIT_DONE') EulerAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-euler-autoplay') as HTMLButtonElement | null;
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
    const playBtn = this.root?.querySelector('#btn-euler-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动推演';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#euler-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#euler-status-badge') as HTMLElement | null;
    const stackPreview = this.root.querySelector('#euler-stack-preview') as HTMLElement | null;
    const pathBadge = this.root.querySelector('#euler-path-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'CIRCUIT_DONE') {
        statusBadge.textContent = '🎯 欧拉一笔画达成！';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else if (cur.type === 'NO_EULER') {
        statusBadge.textContent = '❌ 无欧拉路径';
        statusBadge.style.background = '#fef2f2';
        statusBadge.style.color = '#dc2626';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (stackPreview) {
      if (cur.postOrderStack.length === 0) {
        stackPreview.innerHTML = '<span style="color: #94a3b8; font-size: 11px;">[栈空]</span>';
      } else {
        stackPreview.innerHTML = cur.postOrderStack
          .map((id) => `<span style="background: #e0e7ff; color: #4338ca; border: 1px solid #c7d2fe; border-radius: 4px; padding: 1px 6px; font-weight: bold; font-size: 11px; margin-right: 3px;">Node ${id}</span>`)
          .join('');
      }
    }

    if (pathBadge && cur.finalPath) {
      pathBadge.innerHTML = cur.finalPath.join(' ➔ ');
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

    // 1. 绘制边
    for (const e of this.rawEdges) {
      const p1 = this.nodePositions[e.u];
      const p2 = this.nodePositions[e.v];
      if (!p1 || !p2) continue;

      const isVisited = cur && cur.visitedEdgeIds.includes(e.id);
      const isCurrent = cur && cur.curEdgeId === e.id;

      ctx.save();
      if (isCurrent) {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 4.5;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 14;
      } else if (isVisited) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 2;
      }

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
    }

    // 2. 绘制节点
    for (let i = 0; i < this.n; i++) {
      const pos = this.nodePositions[i];
      if (!pos) continue;

      const isCurrent = cur && cur.curU === i;

      ctx.save();
      let radius = 19;
      let fillColor = '#1e293b';
      let strokeColor = '#64748b';

      if (isCurrent) {
        fillColor = '#ca8a04';
        strokeColor = '#facc15';
        radius = 22 + Math.sin(this.pulseAnim) * 2;
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
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`N${i}`, pos.x, pos.y);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const EULERIAN_CIRCUIT_TEMPLATE = `
  <div id="algo-eulerian-circuit-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🎨</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">欧拉回路一笔画 (Eulerian Circuit)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="euler-preset-btn active" data-preset="SANTA_HOUSE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典信封房屋 (2奇点)</button>
          <button class="euler-preset-btn" data-preset="PENTAGRAM_STAR" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">五角星欧拉回路 (全偶点)</button>
          <button class="euler-preset-btn" data-preset="KONIGSBERG_BRIDGES" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">哥尼斯堡七桥 (无解)</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="euler-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-euler-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步绘制</button>
        <button id="btn-euler-autoplay" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(16,185,129,0.25);">▶️ 自动绘制</button>
        <button id="btn-euler-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-euler-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #166534;">
      <div style="display: flex; gap: 10px; align-items: center;">
        <span>📥 后序回溯栈: <span id="euler-stack-preview"></span></span>
        <span id="euler-path-badge" style="font-weight: 800; color: #047857;"></span>
      </div>
      <div id="euler-narration-box" style="font-weight: 700; color: #14532d;">
        💡 准备就绪：校验奇偶度数，当前弧优化 DFS 并后序入栈！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：一笔画 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="euler-canvas" width="460" height="230" style="width: 460px; height: 230px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🟡 金色为当前画笔位置 | 🟢 绿色实线为已绘制的欧拉轨迹 | 灰色为未走边
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="euler-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'eulerian-circuit',
  name: '欧拉回路与一笔画 (Eulerian Circuit)',
  viewId: 'algo-eulerian-circuit-view',
  category: 'graph',
  description: '欧拉路径与欧拉回路算法：左程云 class067 Hierholzer 算法、度数平衡判定、当前弧优化与后序压栈逆序 (洛谷 P7771 / LeetCode 332)',
  icon: '🎨',
  template: EULERIAN_CIRCUIT_TEMPLATE,
  Visualizer: EulerianCircuitVisualizer,
  difficulty: 3,
  levelOrder: 33,
  learningGoal: '掌握欧拉图与半欧拉图充要条件、Hierholzer 算法为什么必须后序压栈以及当前弧优化的工程实践',
});
