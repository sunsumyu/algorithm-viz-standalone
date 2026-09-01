/**
 * 柯尼希定理与二分图最小点覆盖 / 最大独立集 (Konig's Theorem) 可视化引擎
 * 参考左程云《算法通关课》Class 069: 柯尼希定理、最大匹配转化、未匹配点交替轨扫描与构造方案 (洛谷 P2740)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  KONIG_CODE_LANGUAGES,
  KONIG_PROBLEM_HTML,
  KONIG_ANALYSIS_HTML,
} from './konig-min-vertex-cover-problem-content';

export interface KonigStep {
  type: 'MATCHING' | 'ALTERNATING_SCAN' | 'MIN_VERTEX_COVER' | 'MAX_INDEPENDENT_SET' | 'ALL_DONE';
  matchLSnapshot: number[]; // matchL[u] = v
  matchRSnapshot: number[]; // matchR[v] = u
  visLSnapshot: boolean[];
  visRSnapshot: boolean[];
  vertexCoverNodes: Array<{ side: 'L' | 'R'; id: number }>;
  independentSetNodes: Array<{ side: 'L' | 'R'; id: number }>;
  matchingSize: number;
  message: string;
}

class KonigAudio {
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

  public static playMatch(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  public static playCover(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  public static playIndep(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1318.5, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
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

export class KonigCoverVisualizer extends StepVisualizer<any> {
  // 二分图数据 (1-indexed)
  private n = 4;
  private m = 4;
  private adj: number[][] = [];
  private leftPositions: Array<{ x: number; y: number }> = [];
  private rightPositions: Array<{ x: number; y: number }> = [];

  // 推演步骤
  private traceSteps: KonigStep[] = [];
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
    this.codeLanguages = KONIG_CODE_LANGUAGES;
    this.codeLines = KONIG_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '柯尼希定理 Konig 引擎 (Class 069)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '柯尼希定理' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_4X4_KONIG');
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

    if (presetKey === 'CLASSIC_4X4_KONIG') {
      this.n = 4;
      this.m = 4;
      this.adj = [
        [],
        [1, 2],       // L1 -> R1, R2
        [1, 3],       // L2 -> R1, R3
        [2, 3, 4],    // L3 -> R2, R3, R4
        [3],          // L4 -> R3
      ];
      this.leftPositions = [
        { x: 0, y: 0 },
        { x: 110, y: 35 },
        { x: 110, y: 80 },
        { x: 110, y: 125 },
        { x: 110, y: 170 },
      ];
      this.rightPositions = [
        { x: 0, y: 0 },
        { x: 290, y: 35 },
        { x: 290, y: 80 },
        { x: 290, y: 125 },
        { x: 290, y: 170 },
      ];
    } else if (presetKey === 'DENSE_CROSS_5X5') {
      this.n = 4;
      this.m = 4;
      this.adj = [
        [],
        [1, 2],
        [2, 3],
        [3, 4],
        [1, 4],
      ];
      this.leftPositions = [
        { x: 0, y: 0 },
        { x: 110, y: 35 },
        { x: 110, y: 80 },
        { x: 110, y: 125 },
        { x: 110, y: 170 },
      ];
      this.rightPositions = [
        { x: 0, y: 0 },
        { x: 290, y: 35 },
        { x: 290, y: 80 },
        { x: 290, y: 125 },
        { x: 290, y: 170 },
      ];
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const n = this.n;
    const m = this.m;
    const matchL: number[] = Array(n + 1).fill(0);
    const matchR: number[] = Array(m + 1).fill(0);
    const vis: boolean[] = Array(m + 1).fill(false);
    const visL: boolean[] = Array(n + 1).fill(false);
    const visR: boolean[] = Array(m + 1).fill(false);

    const steps: KonigStep[] = [];

    // 1. 匈牙利求最大匹配
    const dfs = (u: number): boolean => {
      for (const v of this.adj[u]) {
        if (!vis[v]) {
          vis[v] = true;
          if (matchR[v] === 0 || dfs(matchR[v])) {
            matchR[v] = u;
            matchL[u] = v;
            return true;
          }
        }
      }
      return false;
    };

    let matchCount = 0;
    for (let i = 1; i <= n; i++) {
      vis.fill(false);
      if (dfs(i)) matchCount++;
    }

    const cloneMatchL = () => [...matchL];
    const cloneMatchR = () => [...matchR];
    const cloneVisL = () => [...visL];
    const cloneVisR = () => [...visR];

    steps.push({
      type: 'MATCHING',
      matchLSnapshot: cloneMatchL(),
      matchRSnapshot: cloneMatchR(),
      visLSnapshot: cloneVisL(),
      visRSnapshot: cloneVisR(),
      vertexCoverNodes: [],
      independentSetNodes: [],
      matchingSize: matchCount,
      message: `💖 [阶段 1: 匈牙利最大匹配] 完成匹配求解，最大匹配边数为 ${matchCount} 条！`,
    });

    // 2. 交错轨遍历
    const alternatingDfs = (u: number) => {
      visL[u] = true;
      for (const v of this.adj[u]) {
        if (!visR[v] && v !== matchL[u]) {
          visR[v] = true;
          if (matchR[v] !== 0 && !visL[matchR[v]]) {
            alternatingDfs(matchR[v]);
          }
        }
      }
    };

    for (let i = 1; i <= n; i++) {
      if (matchL[i] === 0) {
        alternatingDfs(i);
      }
    }

    steps.push({
      type: 'ALTERNATING_SCAN',
      matchLSnapshot: cloneMatchL(),
      matchRSnapshot: cloneMatchR(),
      visLSnapshot: cloneVisL(),
      visRSnapshot: cloneVisR(),
      vertexCoverNodes: [],
      independentSetNodes: [],
      matchingSize: matchCount,
      message: `🔍 [阶段 2: 柯尼希交错轨扫描] 从未匹配左点发起交错探索，标记可达点集 visL / visR！`,
    });

    // 3. 最小点覆盖 = 未访问左点 + 已访问右点
    const coverNodes: Array<{ side: 'L' | 'R'; id: number }> = [];
    for (let i = 1; i <= n; i++) {
      if (!visL[i]) coverNodes.push({ side: 'L', id: i });
    }
    for (let j = 1; j <= m; j++) {
      if (visR[j]) coverNodes.push({ side: 'R', id: j });
    }

    steps.push({
      type: 'MIN_VERTEX_COVER',
      matchLSnapshot: cloneMatchL(),
      matchRSnapshot: cloneMatchR(),
      visLSnapshot: cloneVisL(),
      visRSnapshot: cloneVisR(),
      vertexCoverNodes: coverNodes,
      independentSetNodes: [],
      matchingSize: matchCount,
      message: `🛡️ [阶段 3: 最小点覆盖] 柯尼希定理结论：选取未访问左点 + 已访问右点，最小覆盖点数 = ${coverNodes.length} (恰等于最大匹配数 ${matchCount})！`,
    });

    // 4. 最大独立集 = 已访问左点 + 未访问右点
    const indepNodes: Array<{ side: 'L' | 'R'; id: number }> = [];
    for (let i = 1; i <= n; i++) {
      if (visL[i]) indepNodes.push({ side: 'L', id: i });
    }
    for (let j = 1; j <= m; j++) {
      if (!visR[j]) indepNodes.push({ side: 'R', id: j });
    }

    steps.push({
      type: 'MAX_INDEPENDENT_SET',
      matchLSnapshot: cloneMatchL(),
      matchRSnapshot: cloneMatchR(),
      visLSnapshot: cloneVisL(),
      visRSnapshot: cloneVisR(),
      vertexCoverNodes: coverNodes,
      independentSetNodes: indepNodes,
      matchingSize: matchCount,
      message: `💎 [阶段 4: 最大独立集] 补集对偶定理：选取已访问左点 + 未访问右点，最大独立集大小 = ${indepNodes.length} (|V| - 匹配数 = ${n + m} - ${matchCount})！`,
    });

    steps.push({
      type: 'ALL_DONE',
      matchLSnapshot: cloneMatchL(),
      matchRSnapshot: cloneMatchR(),
      visLSnapshot: cloneVisL(),
      visRSnapshot: cloneVisR(),
      vertexCoverNodes: coverNodes,
      independentSetNodes: indepNodes,
      matchingSize: matchCount,
      message: `🏁 柯尼希定理推演完毕！最大匹配 = 最小点覆盖 (${matchCount})，最大独立集 = ${indepNodes.length}，定理完美得证！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#konig-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: KONIG_CODE_LANGUAGES,
      problemHtml: KONIG_PROBLEM_HTML,
      analysisHtml: KONIG_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-konig-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-konig-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-konig-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.konig-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_4X4_KONIG';
        this.root?.querySelectorAll('.konig-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-konig-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        KonigAudio.isMuted = !KonigAudio.isMuted;
        soundBtn.textContent = KonigAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'MATCHING') KonigAudio.playMatch();
      else if (cur.type === 'MIN_VERTEX_COVER') KonigAudio.playCover();
      else if (cur.type === 'MAX_INDEPENDENT_SET') KonigAudio.playIndep();
      else if (cur.type === 'ALL_DONE') KonigAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-konig-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停证明';

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
    const playBtn = this.root?.querySelector('#btn-konig-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动推演';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#konig-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#konig-status-badge') as HTMLElement | null;
    const matchVal = this.root.querySelector('#konig-match-val') as HTMLElement | null;
    const coverVal = this.root.querySelector('#konig-cover-val') as HTMLElement | null;
    const indepVal = this.root.querySelector('#konig-indep-val') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = '🎯 柯尼希定理证明完毕';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (matchVal) matchVal.textContent = `${cur.matchingSize}`;
    if (coverVal) coverVal.textContent = `${cur.vertexCoverNodes.length || cur.matchingSize}`;
    if (indepVal) indepVal.textContent = `${cur.independentSetNodes.length || this.n + this.m - cur.matchingSize}`;
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

    // 1. 绘制二分图边
    for (let u = 1; u <= this.n; u++) {
      const p1 = this.leftPositions[u];
      if (!p1) continue;

      for (const v of this.adj[u]) {
        const p2 = this.rightPositions[v];
        if (!p2) continue;

        const isMatched = cur && cur.matchLSnapshot[u] === v;

        ctx.save();
        if (isMatched) {
          ctx.strokeStyle = '#ec4899';
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#ec4899';
          ctx.shadowBlur = 10;
        } else {
          ctx.strokeStyle = 'rgba(71, 85, 105, 0.35)';
          ctx.lineWidth = 1.2;
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 2. 绘制左部节点
    for (let i = 1; i <= this.n; i++) {
      const pos = this.leftPositions[i];
      if (!pos) continue;

      const isCover = cur && cur.vertexCoverNodes.some((node) => node.side === 'L' && node.id === i);
      const isIndep = cur && cur.independentSetNodes.some((node) => node.side === 'L' && node.id === i);
      const isVis = cur && cur.visLSnapshot[i];

      ctx.save();
      let strokeColor = '#38bdf8';
      let fillColor = '#1e293b';
      let radius = 16;

      if (isCover) {
        strokeColor = '#f59e0b'; // 盾牌金色
        fillColor = '#78350f';
        radius = 18 + Math.sin(this.pulseAnim) * 1.5;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12;
      } else if (isIndep) {
        strokeColor = '#10b981'; // 绿宝石
        fillColor = '#064e3b';
        radius = 18;
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
      ctx.fillText(isCover ? `🛡️L${i}` : isIndep ? `💎L${i}` : `L${i}`, pos.x, pos.y - 3);

      ctx.font = '8px monospace';
      ctx.fillStyle = isVis ? '#38bdf8' : '#64748b';
      ctx.fillText(isVis ? 'vis:T' : 'vis:F', pos.x, pos.y + 7);

      ctx.restore();
    }

    // 3. 绘制右部节点
    for (let i = 1; i <= this.m; i++) {
      const pos = this.rightPositions[i];
      if (!pos) continue;

      const isCover = cur && cur.vertexCoverNodes.some((node) => node.side === 'R' && node.id === i);
      const isIndep = cur && cur.independentSetNodes.some((node) => node.side === 'R' && node.id === i);
      const isVis = cur && cur.visRSnapshot[i];

      ctx.save();
      let strokeColor = '#c084fc';
      let fillColor = '#1e293b';
      let radius = 16;

      if (isCover) {
        strokeColor = '#f59e0b';
        fillColor = '#78350f';
        radius = 18 + Math.sin(this.pulseAnim) * 1.5;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12;
      } else if (isIndep) {
        strokeColor = '#10b981';
        fillColor = '#064e3b';
        radius = 18;
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
      ctx.fillText(isCover ? `🛡️R${i}` : isIndep ? `💎R${i}` : `R${i}`, pos.x, pos.y - 3);

      ctx.font = '8px monospace';
      ctx.fillStyle = isVis ? '#c084fc' : '#64748b';
      ctx.fillText(isVis ? 'vis:T' : 'vis:F', pos.x, pos.y + 7);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const KONIG_TEMPLATE = `
  <div id="algo-konig-min-vertex-cover-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🛡️</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">柯尼希定理 (Kőnig's Theorem)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="konig-preset-btn active" data-preset="CLASSIC_4X4_KONIG" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">4×4 经典二分图</button>
          <button class="konig-preset-btn" data-preset="DENSE_CROSS_5X5" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">4×4 环形交叉网</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="konig-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-konig-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-konig-autoplay" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(245,158,11,0.25);">▶️ 自动推演</button>
        <button id="btn-konig-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-konig-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #fefce8; border: 1px solid #fef08a; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #854d0e;">
      <div style="display: flex; gap: 14px; align-items: center;">
        <span>💖 最大匹配数: <b id="konig-match-val" style="color: #db2777; font-size: 12.5px;">0</b></span>
        <span>🛡️ 最小点覆盖: <b id="konig-cover-val" style="color: #d97706; font-size: 12.5px;">0</b></span>
        <span>💎 最大独立集: <b id="konig-indep-val" style="color: #059669; font-size: 12.5px;">0</b></span>
      </div>
      <div id="konig-narration-box" style="font-weight: 700; color: #713f12;">
        💡 准备就绪：最大匹配数 = 最小点覆盖数，最大独立集 = 总点数 - 最大匹配数！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：二分图 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="konig-canvas" width="460" height="210" style="width: 460px; height: 210px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🛡️ 金色盾牌节点为最小点覆盖 (覆盖所有边) | 💎 绿色宝石节点为最大独立集 (两两互不相连)
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="konig-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'konig-min-vertex-cover',
  name: '柯尼希定理 (Konig Theorem)',
  viewId: 'algo-konig-min-vertex-cover-view',
  category: 'graph',
  description: '二分图对偶核心定理：左程云 Class 069 柯尼希定理、最大匹配数 = 最小点覆盖数、最大独立集与交错轨构造法 (洛谷 P2740)',
  icon: '🛡️',
  template: KONIG_TEMPLATE,
  Visualizer: KonigCoverVisualizer,
  difficulty: 3,
  levelOrder: 44,
  learningGoal: '掌握柯尼希定理证明思路、未匹配点交错轨标记构造最小点覆盖与最大独立集的工程实现与经典建模转换',
});
