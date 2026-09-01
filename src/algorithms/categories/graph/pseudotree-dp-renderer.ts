/**
 * 基环树 DP 与断环为链 (Pseudotree DP - Namori Graph) 可视化引擎
 * 参考左程云《算法通关课》Class 077: 基环树找环、断边化树、两次树形 DP 与无后效性最优化 (洛谷 P2607 骑士 / P1453 城市环路)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  PSEUDOTREE_CODE_LANGUAGES,
  PSEUDOTREE_PROBLEM_HTML,
  PSEUDOTREE_ANALYSIS_HTML,
} from './pseudotree-dp-problem-content';

export interface PseudotreeStep {
  type: 'INIT' | 'FIND_CYCLE' | 'CUT_EDGE' | 'TREE_DP_1' | 'TREE_DP_2' | 'ALL_DONE';
  cycleNodes?: number[];
  cutEdge?: { u: number; v: number };
  dpPhase?: 1 | 2;
  activeRoot?: number;
  dpSnapshot?: Array<[number, number]>; // dp[u][0], dp[u][1]
  ans1?: number;
  ans2?: number;
  bestAns?: number;
  message: string;
}

class PseudoAudio {
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

  public static playCycle(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  public static playCut(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  public static playDP(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
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

export class PseudotreeVisualizer extends StepVisualizer<any> {
  // 基环树数据 (1-indexed)
  private n = 6;
  private weights: number[] = [];
  private edges: Array<{ u: number; v: number; id: number }> = [];
  private nodePositions: Array<{ x: number; y: number }> = [];

  // 推演步骤
  private traceSteps: PseudotreeStep[] = [];
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
    this.codeLanguages = PSEUDOTREE_CODE_LANGUAGES;
    this.codeLines = PSEUDOTREE_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '基环树 DP 引擎 (Class 077)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '基环树 DP' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_6_KNIGHTS');
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

    if (presetKey === 'CLASSIC_6_KNIGHTS') {
      this.n = 6;
      this.weights = [0, 10, 20, 15, 30, 25, 40];
      this.edges = [
        { u: 1, v: 2, id: 1 },
        { u: 2, v: 3, id: 2 },
        { u: 3, v: 1, id: 3 }, // 核心环: 1-2-3
        { u: 1, v: 4, id: 4 }, // 悬挂子树
        { u: 2, v: 5, id: 5 },
        { u: 3, v: 6, id: 6 },
      ];
      this.nodePositions = [
        { x: 0, y: 0 },
        { x: 230, y: 55 },  // 1 (环顶)
        { x: 160, y: 125 }, // 2 (环左)
        { x: 300, y: 125 }, // 3 (环右)
        { x: 230, y: 5 },   // 4 (挂 1)
        { x: 80, y: 165 },  // 5 (挂 2)
        { x: 380, y: 165 }, // 6 (挂 3)
      ];
    } else if (presetKey === 'CITY_LOOP_8_NODES') {
      this.n = 8;
      this.weights = [0, 15, 25, 10, 35, 20, 30, 45, 50];
      this.edges = [
        { u: 1, v: 2, id: 1 },
        { u: 2, v: 3, id: 2 },
        { u: 3, v: 4, id: 3 },
        { u: 4, v: 1, id: 4 }, // 4 节点环 1-2-3-4
        { u: 1, v: 5, id: 5 },
        { u: 2, v: 6, id: 6 },
        { u: 3, v: 7, id: 7 },
        { u: 4, v: 8, id: 8 },
      ];
      this.nodePositions = [
        { x: 0, y: 0 },
        { x: 170, y: 55 },
        { x: 290, y: 55 },
        { x: 290, y: 130 },
        { x: 170, y: 130 },
        { x: 90, y: 35 },
        { x: 370, y: 35 },
        { x: 370, y: 160 },
        { x: 90, y: 160 },
      ];
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const n = this.n;
    const adj: Array<Array<{ to: number; id: number }>> = Array.from({ length: n + 1 }, () => []);
    this.edges.forEach((e) => {
      adj[e.u].push({ to: e.v, id: e.id });
      adj[e.v].push({ to: e.u, id: e.id });
    });

    const vis: boolean[] = Array(n + 1).fill(false);
    let rootU = 0;
    let rootV = 0;
    let cutEdgeId = -1;

    // 1. 找环
    const findCircle = (u: number, edgeId: number) => {
      vis[u] = true;
      for (const edge of adj[u]) {
        if (edge.id === edgeId) continue;
        const v = edge.to;
        if (vis[v]) {
          rootU = u;
          rootV = v;
          cutEdgeId = edge.id;
        } else {
          findCircle(v, edge.id);
        }
      }
    };

    findCircle(1, -1);

    const steps: PseudotreeStep[] = [];

    steps.push({
      type: 'INIT',
      message: `🚀 初始化基环树：${n} 个节点与 ${n} 条边。环的存在破坏了树形 DP 无后效性，准备 DFS 找环！`,
    });

    steps.push({
      type: 'FIND_CYCLE',
      cutEdge: { u: rootU, v: rootV },
      message: `🎡 [DFS 锁定简单环] 成功在基环树中找到核心环，并锁定关键环边 (N${rootU} ↔ N${rootV})！`,
    });

    steps.push({
      type: 'CUT_EDGE',
      cutEdge: { u: rootU, v: rootV },
      message: `✂️ [断环为链] 强制切断环边 (N${rootU} ↔ N${rootV})，基环树退化为标准普通树！由于两端互斥，分别强制不选 N${rootU} 和 N${rootV}！`,
    });

    // 树形 DP
    const dp: Array<[number, number]> = Array.from({ length: n + 1 }, () => [0, 0]);

    const treeDP = (u: number, edgeId: number) => {
      dp[u][0] = 0;
      dp[u][1] = this.weights[u];

      for (const edge of adj[u]) {
        if (edge.id === edgeId || edge.id === cutEdgeId) continue;
        const v = edge.to;
        treeDP(v, edge.id);
        dp[u][0] += Math.max(dp[v][0], dp[v][1]);
        dp[u][1] += dp[v][0];
      }
    };

    // 第一次 DP: 强制不选 rootU
    treeDP(rootU, -1);
    const ans1 = dp[rootU][0];
    const cloneDP1 = dp.map((item) => [...item] as [number, number]);

    steps.push({
      type: 'TREE_DP_1',
      activeRoot: rootU,
      dpPhase: 1,
      cutEdge: { u: rootU, v: rootV },
      dpSnapshot: cloneDP1,
      ans1: ans1,
      message: `🛡️ [方案 1: 强制不选 N${rootU}] 以 N${rootU} 为根做树形 DP，汇总得到最大权收益 dp[N${rootU}][0] = ${ans1}！`,
    });

    // 第二次 DP: 强制不选 rootV
    treeDP(rootV, -1);
    const ans2 = dp[rootV][0];
    const cloneDP2 = dp.map((item) => [...item] as [number, number]);

    steps.push({
      type: 'TREE_DP_2',
      activeRoot: rootV,
      dpPhase: 2,
      cutEdge: { u: rootU, v: rootV },
      dpSnapshot: cloneDP2,
      ans1: ans1,
      ans2: ans2,
      message: `🛡️ [方案 2: 强制不选 N${rootV}] 以 N${rootV} 为根做树形 DP，汇总得到最大权收益 dp[N${rootV}][0] = ${ans2}！`,
    });

    const best = Math.max(ans1, ans2);
    steps.push({
      type: 'ALL_DONE',
      cutEdge: { u: rootU, v: rootV },
      ans1: ans1,
      ans2: ans2,
      bestAns: best,
      message: `🏁 [求解完成] 取两方案最大值 max(ans1, ans2) = max(${ans1}, ${ans2}) = ${best}！基环树最大独立集完美求解！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#pseudo-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: PSEUDOTREE_CODE_LANGUAGES,
      problemHtml: PSEUDOTREE_PROBLEM_HTML,
      analysisHtml: PSEUDOTREE_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-pseudo-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-pseudo-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-pseudo-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.pseudo-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_6_KNIGHTS';
        this.root?.querySelectorAll('.pseudo-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-pseudo-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        PseudoAudio.isMuted = !PseudoAudio.isMuted;
        soundBtn.textContent = PseudoAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'FIND_CYCLE') PseudoAudio.playCycle();
      else if (cur.type === 'CUT_EDGE') PseudoAudio.playCut();
      else if (cur.type === 'TREE_DP_1' || cur.type === 'TREE_DP_2') PseudoAudio.playDP();
      else if (cur.type === 'ALL_DONE') PseudoAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-pseudo-autoplay') as HTMLButtonElement | null;
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
    const playBtn = this.root?.querySelector('#btn-pseudo-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动求解';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#pseudo-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#pseudo-status-badge') as HTMLElement | null;
    const ans1Val = this.root.querySelector('#pseudo-ans1-val') as HTMLElement | null;
    const ans2Val = this.root.querySelector('#pseudo-ans2-val') as HTMLElement | null;
    const bestVal = this.root.querySelector('#pseudo-best-val') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = '🎯 基环树 DP 求解完毕';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (ans1Val) ans1Val.textContent = cur.ans1 !== undefined ? `${cur.ans1}` : '-';
    if (ans2Val) ans2Val.textContent = cur.ans2 !== undefined ? `${cur.ans2}` : '-';
    if (bestVal) bestVal.textContent = cur.bestAns !== undefined ? `${cur.bestAns}` : '计算中...';
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
    this.edges.forEach((edge) => {
      const p1 = this.nodePositions[edge.u];
      const p2 = this.nodePositions[edge.v];
      if (!p1 || !p2) return;

      const isCutEdge = cur && cur.cutEdge && (
        (cur.cutEdge.u === edge.u && cur.cutEdge.v === edge.v) ||
        (cur.cutEdge.u === edge.v && cur.cutEdge.v === edge.u)
      );

      ctx.save();
      if (isCutEdge && cur.type !== 'INIT' && cur.type !== 'FIND_CYCLE') {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
      } else {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
      }

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      if (isCutEdge && cur.type !== 'INIT' && cur.type !== 'FIND_CYCLE') {
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#ef4444';
        ctx.fillText('✂️', midX - 6, midY + 4);
      }

      ctx.restore();
    });

    // 2. 绘制节点
    for (let i = 1; i <= this.n; i++) {
      const pos = this.nodePositions[i];
      if (!pos) continue;

      const isCutU = cur && cur.cutEdge && cur.cutEdge.u === i;
      const isCutV = cur && cur.cutEdge && cur.cutEdge.v === i;
      const isExclRoot = cur && cur.activeRoot === i;

      ctx.save();
      let strokeColor = '#38bdf8';
      let fillColor = '#1e293b';
      let radius = 17;

      if (isExclRoot) {
        strokeColor = '#ef4444';
        fillColor = '#7f1d1d';
        radius = 20 + Math.sin(this.pulseAnim) * 1.5;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 14;
      } else if (isCutU || isCutV) {
        strokeColor = '#f59e0b';
        fillColor = '#78350f';
        radius = 19;
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

      // 点权 / DP 值
      const dpVal = cur && cur.dpSnapshot ? cur.dpSnapshot[i] : null;
      ctx.font = '8px monospace';
      ctx.fillStyle = '#facc15';
      ctx.fillText(dpVal ? `[${dpVal[0]},${dpVal[1]}]` : `w:${this.weights[i]}`, pos.x, pos.y + 7);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const PSEUDOTREE_TEMPLATE = `
  <div id="algo-pseudotree-dp-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🎡</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">基环树 DP (Pseudotree DP)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="pseudo-preset-btn active" data-preset="CLASSIC_6_KNIGHTS" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">6 骑士经典环</button>
          <button class="pseudo-preset-btn" data-preset="CITY_LOOP_8_NODES" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">8 节点城市环路</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="pseudo-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-pseudo-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-pseudo-autoplay" style="background: linear-gradient(135deg, #ec4899, #db2777); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(236,72,153,0.25);">▶️ 自动求解</button>
        <button id="btn-pseudo-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-pseudo-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #9d174d;">
      <div style="display: flex; gap: 14px; align-items: center;">
        <span>🛡️ 方案 1 (不选 U): <b id="pseudo-ans1-val" style="color: #db2777; font-size: 12.5px;">-</b></span>
        <span>🛡️ 方案 2 (不选 V): <b id="pseudo-ans2-val" style="color: #db2777; font-size: 12.5px;">-</b></span>
        <span>👑 最优独立集: <b id="pseudo-best-val" style="color: #059669; font-size: 13px;">计算中...</b></span>
      </div>
      <div id="pseudo-narration-box" style="font-weight: 700; color: #831843;">
        💡 准备就绪：找环断边化树，两次树形 DP 排除互斥顶点！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：基环树 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="pseudo-canvas" width="460" height="200" style="width: 460px; height: 200px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          ✂️ 剪刀红虚线为切断的环边 | 🔴 红色高亮为当前强制不选的根节点 | [0, 1] 标注节点 DP 状态
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="pseudo-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'pseudotree-dp',
  name: '基环树 DP (Pseudotree DP)',
  viewId: 'algo-pseudotree-dp-view',
  category: 'graph',
  description: '环上树形动态规划算法：左程云 Class 077 基环树找环、断环为链、两次树形 DP 与最优化独立集 (洛谷 P2607 骑士 / P1453 城市环路)',
  icon: '🎡',
  template: PSEUDOTREE_TEMPLATE,
  Visualizer: PseudotreeVisualizer,
  difficulty: 3,
  levelOrder: 46,
  learningGoal: '掌握基环树结构特性、DFS 找环判定、断边化树与两次树形 DP 分类消除后效性的工程精髓',
});
