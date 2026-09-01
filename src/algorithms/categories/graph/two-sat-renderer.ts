/**
 * 2-SAT 问题与 Tarjan 强连通分量判定 (2-Satisfiability Problem) 可视化引擎
 * 参考左程云《算法通关课》Class 078: 逻辑蕴涵建图 (~u -> v, ~v -> u)、Tarjan SCC 缩点、矛盾检测与拓扑序逆序赋值 (洛谷 P4782)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  TWO_SAT_CODE_LANGUAGES,
  TWO_SAT_PROBLEM_HTML,
  TWO_SAT_ANALYSIS_HTML,
} from './two-sat-problem-content';

export interface TwoSATStep {
  type: 'BUILD_GRAPH' | 'TARJAN_SCC' | 'CHECK_CONFLICT' | 'ALL_DONE';
  clauses: string[];
  edges: Array<{ from: number; to: number }>;
  sccSnapshot: number[];
  conflictVar?: number;
  assignment?: number[];
  isSatisfiable?: boolean;
  message: string;
}

const SCC_PALETTE = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4', '#e11d48', '#84cc16'];

class TwoSATAudio {
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

  public static playImply(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playSCC(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  public static playConflict(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
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

export class TwoSATVisualizer extends StepVisualizer<any> {
  // 变量数与节点位置 (1-indexed, 2*n 个文字节点)
  private n = 3;
  private clauses: Array<{ u: number; valU: number; v: number; valV: number }> = [];
  private nodePositions: Array<{ x: number; y: number }> = [];

  // 推演步骤
  private traceSteps: TwoSATStep[] = [];
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
    this.codeLanguages = TWO_SAT_CODE_LANGUAGES;
    this.codeLines = TWO_SAT_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '2-SAT 逻辑求解引擎 (洛谷 P4782)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '2-SAT 求解' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('SOLVABLE_3_VARS');
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

    if (presetKey === 'SOLVABLE_3_VARS') {
      this.n = 3;
      this.clauses = [
        { u: 1, valU: 1, v: 2, valV: 1 },  // (x1 ∨ x2)
        { u: 1, valU: 0, v: 3, valV: 1 },  // (¬x1 ∨ x3)
        { u: 2, valU: 0, v: 3, valV: 0 },  // (¬x2 ∨ ¬x3)
      ];
      this.nodePositions = [
        { x: 0, y: 0 },
        { x: 100, y: 40 },  // 1: x1 (true)
        { x: 100, y: 130 }, // 2: ¬x1 (false)
        { x: 230, y: 40 },  // 3: x2 (true)
        { x: 230, y: 130 }, // 4: ¬x2 (false)
        { x: 360, y: 40 },  // 5: x3 (true)
        { x: 360, y: 130 }, // 6: ¬x3 (false)
      ];
    } else if (presetKey === 'CONTRADICTORY_UNSOLVABLE') {
      this.n = 2;
      this.clauses = [
        { u: 1, valU: 1, v: 2, valV: 1 },  // (x1 ∨ x2)
        { u: 1, valU: 0, v: 2, valV: 1 },  // (¬x1 ∨ x2)
        { u: 1, valU: 1, v: 2, valV: 0 },  // (x1 ∨ ¬x2)
        { u: 1, valU: 0, v: 2, valV: 0 },  // (¬x1 ∨ ¬x2)
      ];
      this.nodePositions = [
        { x: 0, y: 0 },
        { x: 140, y: 45 },  // 1: x1
        { x: 140, y: 135 }, // 2: ¬x1
        { x: 320, y: 45 },  // 3: x2
        { x: 320, y: 135 }, // 4: ¬x2
      ];
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const n = this.n;
    const totalNodes = 2 * n;
    const adj: number[][] = Array.from({ length: totalNodes + 1 }, () => []);
    const edgeList: Array<{ from: number; to: number }> = [];

    const clauseStrings = this.clauses.map((c) => {
      const uStr = c.valU ? `x${c.u}` : `¬x${c.u}`;
      const vStr = c.valV ? `x${c.v}` : `¬x${c.v}`;
      return `(${uStr} ∨ ${vStr})`;
    });

    // 1. 蕴涵建图
    this.clauses.forEach((c) => {
      const nodeU = c.valU ? 2 * c.u - 1 : 2 * c.u;
      const notU  = c.valU ? 2 * c.u : 2 * c.u - 1;
      const nodeV = c.valV ? 2 * c.v - 1 : 2 * c.v;
      const notV  = c.valV ? 2 * c.v : 2 * c.v - 1;

      adj[notU].push(nodeV);
      edgeList.push({ from: notU, to: nodeV });
      adj[notV].push(nodeU);
      edgeList.push({ from: notV, to: nodeU });
    });

    const steps: TwoSATStep[] = [];

    steps.push({
      type: 'BUILD_GRAPH',
      clauses: clauseStrings,
      edges: edgeList,
      sccSnapshot: Array(totalNodes + 1).fill(0),
      message: `🚀 [逻辑蕴涵建图] 将每个子句 (u ∨ v) 转化为两条有向边 (¬u → v 与 ¬v → u)，构建出 ${edgeList.length} 条蕴涵推导链！`,
    });

    // 2. Tarjan SCC 缩点
    let dfnCnt = 0;
    let sccCnt = 0;
    const dfn = Array(totalNodes + 1).fill(0);
    const low = Array(totalNodes + 1).fill(0);
    const scc = Array(totalNodes + 1).fill(0);
    const inStack = Array(totalNodes + 1).fill(false);
    const st: number[] = [];

    const tarjan = (u: number) => {
      dfn[u] = low[u] = ++dfnCnt;
      st.push(u);
      inStack[u] = true;

      for (const v of adj[u]) {
        if (!dfn[v]) {
          tarjan(v);
          low[u] = Math.min(low[u], low[v]);
        } else if (inStack[v]) {
          low[u] = Math.min(low[u], dfn[v]);
        }
      }

      if (dfn[u] == low[u]) {
        sccCnt++;
        while (true) {
          const top = st.pop()!;
          inStack[top] = false;
          scc[top] = sccCnt;
          if (top === u) break;
        }
      }
    };

    for (let i = 1; i <= totalNodes; i++) {
      if (!dfn[i]) tarjan(i);
    }

    const cloneSCC = () => [...scc];

    steps.push({
      type: 'TARJAN_SCC',
      clauses: clauseStrings,
      edges: edgeList,
      sccSnapshot: cloneSCC(),
      message: `🔄 [Tarjan SCC 强连通分量] 完成缩点，全图划分为 ${sccCnt} 个强连通分量 (SCC)，同色文字属于等价真值环！`,
    });

    // 3. 冲突检测与赋值
    let conflictVar = 0;
    const assignment: number[] = Array(n + 1).fill(0);

    for (let i = 1; i <= n; i++) {
      const trueNode = 2 * i - 1;
      const falseNode = 2 * i;
      if (scc[trueNode] === scc[falseNode]) {
        conflictVar = i;
        break;
      }
      assignment[i] = scc[trueNode] < scc[falseNode] ? 1 : 0;
    }

    if (conflictVar > 0) {
      steps.push({
        type: 'CHECK_CONFLICT',
        clauses: clauseStrings,
        edges: edgeList,
        sccSnapshot: cloneSCC(),
        conflictVar: conflictVar,
        isSatisfiable: false,
        message: `❌ [逻辑矛盾判定] 变量 x${conflictVar} 与 ¬x${conflictVar} 属于同一个强连通分量 (SCC #${scc[2 * conflictVar]})，互相推导自相矛盾，问题无解 (UNSATISFIABLE)！`,
      });
    } else {
      const ansStr = Array.from({ length: n }, (_, i) => `x${i + 1}=${assignment[i + 1]}`).join(', ');
      steps.push({
        type: 'ALL_DONE',
        clauses: clauseStrings,
        edges: edgeList,
        sccSnapshot: cloneSCC(),
        assignment: assignment,
        isSatisfiable: true,
        message: `🏁 [2-SAT 求解成功] 各变量正反节点均处于不同 SCC。逆拓扑序赋值方案：${ansStr}，所有子句均被满足 (SATISFIABLE)！`,
      });
    }

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#twosat-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: TWO_SAT_CODE_LANGUAGES,
      problemHtml: TWO_SAT_PROBLEM_HTML,
      analysisHtml: TWO_SAT_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-twosat-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-twosat-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-twosat-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.twosat-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'SOLVABLE_3_VARS';
        this.root?.querySelectorAll('.twosat-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-twosat-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        TwoSATAudio.isMuted = !TwoSATAudio.isMuted;
        soundBtn.textContent = TwoSATAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'BUILD_GRAPH') TwoSATAudio.playImply();
      else if (cur.type === 'TARJAN_SCC') TwoSATAudio.playSCC();
      else if (cur.type === 'CHECK_CONFLICT') TwoSATAudio.playConflict();
      else if (cur.type === 'ALL_DONE') TwoSATAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-twosat-autoplay') as HTMLButtonElement | null;
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
    const playBtn = this.root?.querySelector('#btn-twosat-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动推演';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#twosat-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#twosat-status-badge') as HTMLElement | null;
    const clausePanel = this.root.querySelector('#twosat-clause-panel') as HTMLElement | null;
    const ansBadge = this.root.querySelector('#twosat-ans-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.isSatisfiable === true) {
        statusBadge.textContent = '🎯 可满足 (SATISFIABLE)';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else if (cur.isSatisfiable === false) {
        statusBadge.textContent = '❌ 自相矛盾 (UNSATISFIABLE)';
        statusBadge.style.background = '#fef2f2';
        statusBadge.style.color = '#dc2626';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (clausePanel) {
      clausePanel.innerHTML = cur.clauses
        .map((c) => `<span style="background: #1e293b; color: #facc15; border: 1px solid #38bdf8; border-radius: 4px; padding: 2px 6px; font-size: 11px; font-weight: bold;">${c}</span>`)
        .join('');
    }

    if (ansBadge) {
      if (cur.assignment) {
        const assignStr = Array.from({ length: this.n }, (_, i) => `x${i + 1}=${cur.assignment![i + 1]}`).join(' | ');
        ansBadge.textContent = assignStr;
      } else if (cur.isSatisfiable === false) {
        ansBadge.textContent = '无解 (矛盾环)';
      } else {
        ansBadge.textContent = '推演中...';
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

    // 1. 绘制蕴涵有向边
    if (cur) {
      cur.edges.forEach((edge) => {
        const p1 = this.nodePositions[edge.from];
        const p2 = this.nodePositions[edge.to];
        if (!p1 || !p2) return;

        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // 箭头
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const arrowX = p2.x - 17 * Math.cos(angle);
        const arrowY = p2.y - 17 * Math.sin(angle);

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - 8 * Math.cos(angle - Math.PI / 6), arrowY - 8 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(arrowX - 8 * Math.cos(angle + Math.PI / 6), arrowY - 8 * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });
    }

    // 2. 绘制文字节点
    const totalNodes = 2 * this.n;
    for (let i = 1; i <= totalNodes; i++) {
      const pos = this.nodePositions[i];
      if (!pos) continue;

      const varId = Math.floor((i + 1) / 2);
      const isPositive = i % 2 === 1;
      const sccId = cur ? cur.sccSnapshot[i] : 0;
      const isConflict = cur && cur.conflictVar === varId;

      ctx.save();
      let strokeColor = sccId > 0 ? SCC_PALETTE[(sccId - 1) % SCC_PALETTE.length] : '#38bdf8';
      let fillColor = '#1e293b';
      let radius = 16;

      if (isConflict) {
        strokeColor = '#ef4444';
        fillColor = '#7f1d1d';
        radius = 18 + Math.sin(this.pulseAnim) * 1.5;
        ctx.shadowColor = '#ef4444';
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
      ctx.fillText(isPositive ? `x${varId}` : `¬x${varId}`, pos.x, pos.y - 3);

      ctx.font = '8.5px monospace';
      ctx.fillStyle = sccId > 0 ? strokeColor : '#64748b';
      ctx.fillText(sccId > 0 ? `SCC#${sccId}` : 'id:' + i, pos.x, pos.y + 7);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const TWO_SAT_TEMPLATE = `
  <div id="algo-two-sat-problem-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">⚖️</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">2-SAT 命题逻辑判定 (Two-SAT)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="twosat-preset-btn active" data-preset="SOLVABLE_3_VARS" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">3 变量可满足系统</button>
          <button class="twosat-preset-btn" data-preset="CONTRADICTORY_UNSOLVABLE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">2 变量自相矛盾无解</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="twosat-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-twosat-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-twosat-autoplay" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(59,130,246,0.25);">▶️ 自动推演</button>
        <button id="btn-twosat-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-twosat-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #1e40af;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <div id="twosat-clause-panel" style="display: flex; gap: 6px;"></div>
        <span>🔑 真值赋值: <b id="twosat-ans-badge" style="color: #059669; font-size: 12.5px;">推演中...</b></span>
      </div>
      <div id="twosat-narration-box" style="font-weight: 700; color: #1e3a8a;">
        💡 准备就绪：逻辑蕴涵有向图建图，Tarjan SCC 缩点判解！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：蕴涵图 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="twosat-canvas" width="460" height="180" style="width: 460px; height: 180px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🔵 箭头为逻辑蕴涵方向 (~u → v) | 彩色光环表示同一强连通分量 (SCC) | 🔴 红色为自相矛盾变量
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="twosat-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'two-sat-problem',
  name: '2-SAT 问题 (2-Satisfiability)',
  viewId: 'algo-two-sat-problem-view',
  category: 'graph',
  description: '命题逻辑与图论结合算法：左程云 Class 078 蕴涵图建模、Tarjan 强连通分量 SCC 判环与拓扑序逆序赋值 (洛谷 P4782)',
  icon: '⚖️',
  template: TWO_SAT_TEMPLATE,
  Visualizer: TwoSATVisualizer,
  difficulty: 3,
  levelOrder: 47,
  learningGoal: '掌握析取子句到蕴涵有向图的等价变换、Tarjan 缩点自相矛盾判定以及逆拓扑序合法赋值构造的完整证明',
});
