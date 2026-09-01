/**
 * 树上倍增求最近公共祖先 (LCA - Binary Lifting) 可视化引擎
 * 参考左程云《算法通关课》Class 076: 树上倍增表 up[u][i]、二进制深度对齐与 O(log n) 祖先定位 (洛谷 P3379)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  LCA_CODE_LANGUAGES,
  LCA_PROBLEM_HTML,
  LCA_ANALYSIS_HTML,
} from './lca-binary-lifting-problem-content';

export interface LCAStep {
  type: 'PREPROCESS' | 'ALIGN_DEPTH' | 'SYNC_LEAP' | 'FOUND_LCA';
  curU: number;
  curV: number;
  hopPower?: number; // 2^i
  lcaNode?: number;
  depthSnapshot: number[];
  activeArc?: { from: number; to: number };
  message: string;
}

class LCAAUDIO {
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

  public static playHop(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  public static playAlign(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  public static playLCA(): void {
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

export class LCABinaryLiftingVisualizer extends StepVisualizer<any> {
  // 树数据 (1-indexed)
  private n = 10;
  private adj: number[][] = [];
  private nodePositions: Array<{ x: number; y: number }> = [];

  // 查询点对
  private queryU = 8;
  private queryV = 9;

  // 推演步骤
  private traceSteps: LCAStep[] = [];
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
    this.codeLanguages = LCA_CODE_LANGUAGES;
    this.codeLines = LCA_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '树上倍增 LCA 引擎 (洛谷 P3379)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '树上倍增 LCA' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('TREE_PAIR_8_9');
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

    this.n = 10;
    this.adj = [
      [],
      [2, 3],          // 1 -> 2, 3
      [1, 4, 5],       // 2 -> 4, 5
      [1, 6, 7],       // 3 -> 6, 7
      [2, 8],          // 4 -> 8
      [2, 9],          // 5 -> 9
      [3],             // 6
      [3, 10],         // 7 -> 10
      [4],             // 8
      [5],             // 9
      [7],             // 10
    ];

    this.nodePositions = [
      { x: 0, y: 0 },
      { x: 230, y: 30 },  // 1 (根, depth 1)
      { x: 130, y: 70 },  // 2 (depth 2)
      { x: 330, y: 70 },  // 3 (depth 2)
      { x: 80, y: 110 },  // 4 (depth 3)
      { x: 180, y: 110 }, // 5 (depth 3)
      { x: 280, y: 110 }, // 6 (depth 3)
      { x: 380, y: 110 }, // 7 (depth 3)
      { x: 60, y: 155 },  // 8 (depth 4)
      { x: 200, y: 155 }, // 9 (depth 4)
      { x: 380, y: 155 }, // 10 (depth 4)
    ];

    if (presetKey === 'TREE_PAIR_8_9') {
      this.queryU = 8;
      this.queryV = 9;
    } else if (presetKey === 'TREE_PAIR_9_10') {
      this.queryU = 9;
      this.queryV = 10;
    } else if (presetKey === 'DEEP_PAIR_7_10') {
      this.queryU = 7;
      this.queryV = 10;
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const n = this.n;
    const maxLog = 4;
    const depth: number[] = Array(n + 1).fill(0);
    const up: number[][] = Array.from({ length: n + 1 }, () => Array(maxLog + 1).fill(0));

    // 1. DFS 构建倍增表
    const dfs = (u: number, p: number, d: number) => {
      depth[u] = d;
      up[u][0] = p;
      for (let i = 1; i <= maxLog; i++) {
        up[u][i] = up[up[u][i - 1]][i - 1];
      }
      for (const v of this.adj[u]) {
        if (v !== p) dfs(v, u, d + 1);
      }
    };
    dfs(1, 0, 1);

    const steps: LCAStep[] = [];
    const cloneD = () => [...depth];

    steps.push({
      type: 'PREPROCESS',
      curU: this.queryU,
      curV: this.queryV,
      depthSnapshot: cloneD(),
      message: `🚀 [倍增表构建完成] DFS 预处理深度 depth 与 up[u][i] (2^i 级祖先跳跃表)。准备查询 LCA(N${this.queryU}, N${this.queryV})！`,
    });

    let u = this.queryU;
    let v = this.queryV;

    // 深度对齐
    if (depth[u] < depth[v]) {
      const tmp = u; u = v; v = tmp;
    }

    for (let i = maxLog; i >= 0; i--) {
      if (depth[u] - (1 << i) >= depth[v]) {
        const nextU = up[u][i];
        steps.push({
          type: 'ALIGN_DEPTH',
          curU: nextU,
          curV: v,
          hopPower: 1 << i,
          depthSnapshot: cloneD(),
          activeArc: { from: u, to: nextU },
          message: `🔼 [深度对齐] 节点 N${u} 向上倍增跳跃 2^${i}=${1 << i} 步到达 N${nextU}，与 N${v} 深度对齐！`,
        });
        u = nextU;
      }
    }

    if (u === v) {
      steps.push({
        type: 'FOUND_LCA',
        curU: u,
        curV: v,
        lcaNode: u,
        depthSnapshot: cloneD(),
        message: `👑 [查询完成] 深度对齐后两节点重合！最近公共祖先为 LCA = N${u}！`,
      });
      this.traceSteps = steps;
      return;
    }

    // 同步跳跃
    for (let i = maxLog; i >= 0; i--) {
      if (up[u][i] !== up[v][i]) {
        const nextU = up[u][i];
        const nextV = up[v][i];
        steps.push({
          type: 'SYNC_LEAP',
          curU: nextU,
          curV: nextV,
          hopPower: 1 << i,
          depthSnapshot: cloneD(),
          message: `⚡ [同步跃升] 2^${i}=${1 << i} 步祖先不同 (up[N${u}][${i}]=N${nextU} ≠ up[N${v}][${i}]=N${nextV})，同步向上跳跃！`,
        });
        u = nextU;
        v = nextV;
      }
    }

    const finalLca = up[u][0];
    steps.push({
      type: 'FOUND_LCA',
      curU: u,
      curV: v,
      lcaNode: finalLca,
      depthSnapshot: cloneD(),
      message: `👑 [锁定 LCA] 节点已停在 LCA 正下方直接子节点！最近公共祖先为 up[N${u}][0] = N${finalLca}！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#lca-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: LCA_CODE_LANGUAGES,
      problemHtml: LCA_PROBLEM_HTML,
      analysisHtml: LCA_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-lca-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-lca-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-lca-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.lca-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'TREE_PAIR_8_9';
        this.root?.querySelectorAll('.lca-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-lca-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        LCAAUDIO.isMuted = !LCAAUDIO.isMuted;
        soundBtn.textContent = LCAAUDIO.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'ALIGN_DEPTH') LCAAUDIO.playAlign();
      else if (cur.type === 'SYNC_LEAP') LCAAUDIO.playHop();
      else if (cur.type === 'FOUND_LCA') LCAAUDIO.playLCA();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-lca-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停查询';

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
    const playBtn = this.root?.querySelector('#btn-lca-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动查询';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#lca-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#lca-status-badge') as HTMLElement | null;
    const uBadge = this.root.querySelector('#lca-u-val') as HTMLElement | null;
    const vBadge = this.root.querySelector('#lca-v-val') as HTMLElement | null;
    const lcaBadge = this.root.querySelector('#lca-res-val') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'FOUND_LCA') {
        statusBadge.textContent = '🎯 LCA 锁定成功';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (uBadge) uBadge.textContent = `N${cur.curU}`;
    if (vBadge) vBadge.textContent = `N${cur.curV}`;
    if (lcaBadge) lcaBadge.textContent = cur.lcaNode ? `N${cur.lcaNode}` : '计算中...';
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

    // 1. 深度基准线
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.2)';
    ctx.lineWidth = 1;
    [30, 70, 110, 155].forEach((y, idx) => {
      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(width - 10, y);
      ctx.stroke();

      ctx.font = '8px monospace';
      ctx.fillStyle = '#475569';
      ctx.fillText(`d=${idx + 1}`, 15, y - 4);
    });

    // 2. 绘制树边
    for (let u = 1; u <= this.n; u++) {
      const p1 = this.nodePositions[u];
      if (!p1) continue;

      for (const v of this.adj[u]) {
        if (v <= u) continue;
        const p2 = this.nodePositions[v];
        if (!p2) continue;

        ctx.save();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 3. 绘制跳跃弧线
    if (cur && cur.activeArc) {
      const p1 = this.nodePositions[cur.activeArc.from];
      const p2 = this.nodePositions[cur.activeArc.to];
      if (p1 && p2) {
        ctx.save();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        const midX = (p1.x + p2.x) / 2 - 25;
        const midY = (p1.y + p2.y) / 2;
        ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 4. 绘制节点
    for (let i = 1; i <= this.n; i++) {
      const pos = this.nodePositions[i];
      if (!pos) continue;

      const isU = cur && cur.curU === i;
      const isV = cur && cur.curV === i;
      const isLCA = cur && cur.lcaNode === i;

      ctx.save();
      let radius = 15;
      let strokeColor = '#38bdf8';
      let fillColor = '#1e293b';

      if (isLCA) {
        strokeColor = '#facc15';
        fillColor = '#854d0e';
        radius = 18 + Math.sin(this.pulseAnim) * 2;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 16;
      } else if (isU && isV) {
        strokeColor = '#ec4899';
        fillColor = '#831843';
        radius = 18;
      } else if (isU) {
        strokeColor = '#ec4899'; // U 节点粉色
        fillColor = '#701a75';
        radius = 17;
      } else if (isV) {
        strokeColor = '#10b981'; // V 节点绿色
        fillColor = '#064e3b';
        radius = 17;
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
      ctx.fillText(isLCA ? `👑N${i}` : isU ? `U:N${i}` : isV ? `V:N${i}` : `N${i}`, pos.x, pos.y);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const LCA_TEMPLATE = `
  <div id="algo-lca-binary-lifting-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🌲</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">最近公共祖先 (LCA 倍增法)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="lca-preset-btn active" data-preset="TREE_PAIR_8_9" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">N8 ↔ N9 (LCA=N2)</button>
          <button class="lca-preset-btn" data-preset="TREE_PAIR_9_10" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">N9 ↔ N10 (LCA=N1)</button>
          <button class="lca-preset-btn" data-preset="DEEP_PAIR_7_10" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">N7 ↔ N10 (包含关系)</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="lca-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-lca-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步跃升</button>
        <button id="btn-lca-autoplay" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(16,185,129,0.25);">▶️ 自动查询</button>
        <button id="btn-lca-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-lca-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #166534;">
      <div style="display: flex; gap: 14px; align-items: center;">
        <span>🎯 当前位置: <b id="lca-u-val" style="color: #ec4899; font-size: 12.5px;">-</b> 与 <b id="lca-v-val" style="color: #10b981; font-size: 12.5px;">-</b></span>
        <span>👑 最近公共祖先: <b id="lca-res-val" style="color: #d97706; font-size: 13px;">计算中...</b></span>
      </div>
      <div id="lca-narration-box" style="font-weight: 700; color: #14532d;">
        💡 准备就绪：up[u][i] = up[up[u][i-1]][i-1]，深度对齐后同步倍增跳跃！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：树形网络 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="lca-canvas" width="460" height="190" style="width: 460px; height: 190px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🟣 粉色节点为 U | 🟢 绿色节点为 V | 👑 金色皇冠为计算出的最近公共祖先 LCA
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="lca-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'lca-binary-lifting',
  name: '最近公共祖先 (LCA 倍增法)',
  viewId: 'algo-lca-binary-lifting-view',
  category: 'graph',
  description: '树上对数级查询算法：左程云 Class 076 树上倍增表 up[u][i]、二进制深度对齐与 O(log n) 祖先定位 (洛谷 P3379)',
  icon: '🌲',
  template: LCA_TEMPLATE,
  Visualizer: LCABinaryLiftingVisualizer,
  difficulty: 3,
  levelOrder: 45,
  learningGoal: '掌握树上倍增转移方程 up[u][i] = up[up[u][i-1]][i-1]、两阶段二进制对齐与同步跃升的工程实现',
});
