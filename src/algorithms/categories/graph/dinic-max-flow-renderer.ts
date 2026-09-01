/**
 * Dinic 网络最大流与残量网络 (Dinic Max Flow & Residual Graph) 可视化引擎
 * 参考左程云《算法通关课》【必备篇】class071: 增广路、成对反向弧退流、BFS 层次图、当前弧优化与多路增广 (洛谷 P3376)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DINIC_MAX_FLOW_CODE_LANGUAGES,
  DINIC_MAX_FLOW_PROBLEM_HTML,
  DINIC_MAX_FLOW_ANALYSIS_HTML,
} from './dinic-max-flow-problem-content';

export interface DinicEdgeVisual {
  from: number;
  to: number;
  cap: number;
  flow: number;
  isRev: boolean;
}

export interface DinicStep {
  type: 'BFS_LEVEL' | 'DFS_FLOW' | 'AUGMENT_SUCCESS' | 'ALL_DONE';
  depthSnapshot: number[];
  edgesSnapshot: DinicEdgeVisual[];
  activePath?: number[];
  pushedFlow?: number;
  totalMaxFlow: number;
  message: string;
}

class DinicAudio {
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

  public static playBfs(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playFlow(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
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

export class DinicMaxFlowVisualizer extends StepVisualizer<any> {
  // 网络拓扑
  private n = 4;
  private s = 1;
  private t = 4;
  private rawEdges: Array<{ u: number; v: number; cap: number }> = [];
  private nodePositions: Array<{ x: number; y: number }> = [];

  // 推演步骤
  private traceSteps: DinicStep[] = [];
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
    this.codeLanguages = DINIC_MAX_FLOW_CODE_LANGUAGES;
    this.codeLines = DINIC_MAX_FLOW_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = 'Dinic 最大流与残量网络引擎 (洛谷 P3376)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: 'Dinic 网络最大流' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_4_NODE_BACKFLOW');
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

    if (presetKey === 'CLASSIC_4_NODE_BACKFLOW') {
      // 经典的 4 节点回退网络
      // 1 (S), 4 (T)
      this.n = 4;
      this.s = 1;
      this.t = 4;
      this.rawEdges = [
        { u: 1, v: 2, cap: 10 },
        { u: 1, v: 3, cap: 10 },
        { u: 2, v: 3, cap: 1 },
        { u: 2, v: 4, cap: 10 },
        { u: 3, v: 4, cap: 10 },
      ];
      this.nodePositions = [
        { x: 0, y: 0 },
        { x: 60, y: 115 },  // 1 (S)
        { x: 190, y: 55 },  // 2
        { x: 190, y: 175 }, // 3
        { x: 330, y: 115 }, // 4 (T)
      ];
    } else if (presetKey === 'LUOGU_P3376_6_NODE') {
      this.n = 6;
      this.s = 1;
      this.t = 6;
      this.rawEdges = [
        { u: 1, v: 2, cap: 10 },
        { u: 1, v: 3, cap: 10 },
        { u: 2, v: 4, cap: 4 },
        { u: 2, v: 5, cap: 8 },
        { u: 3, v: 4, cap: 9 },
        { u: 4, v: 6, cap: 10 },
        { u: 5, v: 6, cap: 10 },
      ];
      this.nodePositions = [
        { x: 0, y: 0 },
        { x: 50, y: 115 },  // 1 (S)
        { x: 140, y: 65 },  // 2
        { x: 140, y: 165 }, // 3
        { x: 240, y: 65 },  // 4
        { x: 240, y: 165 }, // 5
        { x: 340, y: 115 }, // 6 (T)
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
      rev: number;
      isRev: boolean;
      origFrom: number;
    }

    const adj: EdgeInternal[][] = Array.from({ length: n + 1 }, () => []);
    this.rawEdges.forEach(({ u, v, cap }) => {
      adj[u].push({ to: v, cap, flow: 0, rev: adj[v].length, isRev: false, origFrom: u });
      adj[v].push({ to: u, cap: 0, flow: 0, rev: adj[u].length - 1, isRev: true, origFrom: v });
    });

    const depth: number[] = Array(n + 1).fill(0);
    const cur: number[] = Array(n + 1).fill(0);
    let totalMaxFlow = 0;

    const steps: DinicStep[] = [];

    const getSnapshot = (): DinicEdgeVisual[] => {
      const list: DinicEdgeVisual[] = [];
      for (let u = 1; u <= n; u++) {
        for (const e of adj[u]) {
          if (!e.isRev) {
            list.push({ from: u, to: e.to, cap: e.cap, flow: e.flow, isRev: false });
          }
        }
      }
      return list;
    };

    const bfs = (): boolean => {
      depth.fill(0);
      const q: number[] = [s];
      depth[s] = 1;

      while (q.length > 0) {
        const u = q.shift()!;
        for (const e of adj[u]) {
          if (e.cap - e.flow > 0 && depth[e.to] === 0) {
            depth[e.to] = depth[u] + 1;
            q.push(e.to);
          }
        }
      }
      return depth[t] > 0;
    };

    const dfs = (u: number, limit: number, path: number[]): number => {
      if (u === t || limit === 0) return limit;
      let flow = 0;

      for (let i = cur[u]; i < adj[u].length; i++) {
        cur[u] = i;
        const e = adj[u][i];
        if (depth[e.to] === depth[u] + 1 && e.cap - e.flow > 0) {
          const pushed = dfs(e.to, Math.min(limit - flow, e.cap - e.flow), [...path, e.to]);
          if (pushed > 0) {
            e.flow += pushed;
            adj[e.to][e.rev].flow -= pushed;
            flow += pushed;

            steps.push({
              type: 'DFS_FLOW',
              depthSnapshot: [...depth],
              edgesSnapshot: getSnapshot(),
              activePath: [...path, e.to],
              pushedFlow: pushed,
              totalMaxFlow: totalMaxFlow + flow,
              message: `🌊 多路增广：沿分层路径 [${[...path, e.to].map((p) => 'N' + p).join(' → ')}] 成功推入流量 +${pushed}！`,
            });

            if (flow === limit) break;
          }
        }
      }
      return flow;
    };

    while (bfs()) {
      steps.push({
        type: 'BFS_LEVEL',
        depthSnapshot: [...depth],
        edgesSnapshot: getSnapshot(),
        totalMaxFlow,
        message: `🧭 BFS 划分层次图完成！汇点 N${t} 位于第 ${depth[t]} 层，准备执行多路增广。`,
      });

      cur.fill(0);
      const pushed = dfs(s, Infinity, [s]);
      totalMaxFlow += pushed;
    }

    steps.push({
      type: 'ALL_DONE',
      depthSnapshot: [...depth],
      edgesSnapshot: getSnapshot(),
      totalMaxFlow,
      message: `🏁 BFS 无法再到达汇点！全网最大流已达成，最终最大流吞吐量为：${totalMaxFlow}！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#dinic-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: DINIC_MAX_FLOW_CODE_LANGUAGES,
      problemHtml: DINIC_MAX_FLOW_PROBLEM_HTML,
      analysisHtml: DINIC_MAX_FLOW_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-dinic-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-dinic-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-dinic-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.dinic-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_4_NODE_BACKFLOW';
        this.root?.querySelectorAll('.dinic-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-dinic-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        DinicAudio.isMuted = !DinicAudio.isMuted;
        soundBtn.textContent = DinicAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'BFS_LEVEL') DinicAudio.playBfs();
      else if (cur.type === 'DFS_FLOW') DinicAudio.playFlow();
      else if (cur.type === 'ALL_DONE') DinicAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-dinic-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停增广';

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
    const playBtn = this.root?.querySelector('#btn-dinic-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动增广';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#dinic-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#dinic-status-badge') as HTMLElement | null;
    const maxFlowBadge = this.root.querySelector('#dinic-max-flow-val') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = `🎯 最大流 = ${cur.totalMaxFlow}`;
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (maxFlowBadge) {
      maxFlowBadge.textContent = `${cur.totalMaxFlow}`;
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

    // 1. 绘制管道边与流量
    if (cur && cur.edgesSnapshot) {
      cur.edgesSnapshot.forEach((e) => {
        const p1 = this.nodePositions[e.from];
        const p2 = this.nodePositions[e.to];
        if (!p1 || !p2) return;

        const isFull = e.flow === e.cap;
        const hasFlow = e.flow > 0;

        ctx.save();
        if (isFull) {
          ctx.strokeStyle = '#ef4444'; // 满流红色瓶颈
          ctx.lineWidth = 3.5;
        } else if (hasFlow) {
          ctx.strokeStyle = '#38bdf8'; // 有流水蓝色
          ctx.lineWidth = 3;
        } else {
          ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
          ctx.lineWidth = 2;
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // 箭头与文本
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.font = 'bold 9.5px monospace';
        ctx.fillStyle = isFull ? '#f87171' : hasFlow ? '#38bdf8' : '#94a3b8';
        ctx.fillText(`${e.flow}/${e.cap}`, midX, midY - 4);

        ctx.restore();
      });
    }

    // 2. 绘制节点
    for (let i = 1; i <= this.n; i++) {
      const pos = this.nodePositions[i];
      if (!pos) continue;

      const d = cur ? cur.depthSnapshot[i] : 0;
      const isSource = i === this.s;
      const isSink = i === this.t;

      ctx.save();
      let radius = 18;
      let fillColor = '#1e293b';
      let strokeColor = '#475569';

      if (isSource) {
        fillColor = '#854d0e';
        strokeColor = '#facc15';
        radius = 21 + Math.sin(this.pulseAnim) * 2;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 14;
      } else if (isSink) {
        fillColor = '#1e3a8a';
        strokeColor = '#3b82f6';
        radius = 21 + Math.sin(this.pulseAnim + Math.PI) * 2;
        ctx.shadowColor = '#3b82f6';
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

      // 层次 depth
      ctx.font = '8.5px monospace';
      ctx.fillStyle = d > 0 ? '#38bdf8' : '#64748b';
      ctx.fillText(`d:${d}`, pos.x, pos.y + 7);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const DINIC_MAX_FLOW_TEMPLATE = `
  <div id="algo-dinic-max-flow-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🌊</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">Dinic 网络最大流 (Dinic Max Flow)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="dinic-preset-btn active" data-preset="CLASSIC_4_NODE_BACKFLOW" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典反向退流图</button>
          <button class="dinic-preset-btn" data-preset="LUOGU_P3376_6_NODE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">洛谷 6 节点多路网</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="dinic-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-dinic-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步增广</button>
        <button id="btn-dinic-autoplay" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(2,132,199,0.25);">▶️ 自动增广</button>
        <button id="btn-dinic-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-dinic-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #0369a1;">
      <div style="display: flex; gap: 14px; align-items: center;">
        <span>🎯 当前最大流总计: <b id="dinic-max-flow-val" style="color: #0284c7; font-size: 13px;">0</b></span>
      </div>
      <div id="dinic-narration-box" style="font-weight: 700; color: #075985;">
        💡 准备就绪：BFS 划分分层图，DFS 多路增广与当前弧优化，退流反向弧保证最优解！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：残量网络 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="dinic-canvas" width="460" height="230" style="width: 460px; height: 230px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🟡 S 为源点 | 🔵 T 为汇点 | 管道标注为 [流量/容量]，红色表示已达容量上限 (瓶颈割边)
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="dinic-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'dinic-max-flow',
  name: 'Dinic 网络最大流 (Dinic Max Flow)',
  viewId: 'algo-dinic-max-flow-view',
  category: 'graph',
  description: '网络最大流核心算法：左程云 class071 Dinic 算法、成对反向弧退流、BFS 层次图、当前弧优化与多路增广 (洛谷 P3376)',
  icon: '🌊',
  template: DINIC_MAX_FLOW_TEMPLATE,
  Visualizer: DinicMaxFlowVisualizer,
  difficulty: 3,
  levelOrder: 38,
  learningGoal: '掌握 Dinic 算法的成对反向弧退流机制、BFS 层次图构建与 DFS 当前弧多路增广的工程实现',
});
