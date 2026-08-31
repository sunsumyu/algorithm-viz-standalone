/**
 * 差分约束系统与 SPFA 负环判定 (System of Difference Constraints) 可视化引擎
 * 参考左程云《算法通关课》class070: 三角不等式向最短路转化、超级源点建图与负环无解检测 (洛谷 P5960)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DIFF_CONSTRAINTS_CODE_LANGUAGES,
  DIFF_CONSTRAINTS_PROBLEM_HTML,
  DIFF_CONSTRAINTS_ANALYSIS_HTML,
} from './diff-constraints-problem-content';

export interface ConstraintItem {
  u: number; // x_u
  v: number; // x_v
  weight: number; // x_u - x_v <= weight
}

export interface DiffConstraintStep {
  type: 'INIT' | 'RELAX' | 'NO_RELAX' | 'NEGATIVE_CYCLE' | 'FEASIBLE_DONE';
  curU: number;
  curV?: number;
  curWeight?: number;
  distSnapshot: number[];
  countSnapshot: number[];
  inQueueSnapshot: boolean[];
  queueSnapshot: number[];
  negativeCycleEdges?: Array<[number, number]>;
  message: string;
}

class DiffAudio {
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

  public static playRelax(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
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

  public static playAlarm(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }

  public static playWin(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.25);
      });
    } catch {}
  }
}

export class DiffConstraintsVisualizer extends StepVisualizer<any> {
  // 约束数据
  private n = 4;
  private constraints: ConstraintItem[] = [];
  private nodePositions: Array<{ x: number; y: number }> = [];

  // 推演步骤
  private traceSteps: DiffConstraintStep[] = [];
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
    this.codeLanguages = DIFF_CONSTRAINTS_CODE_LANGUAGES;
    this.codeLines = DIFF_CONSTRAINTS_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '差分约束 SPFA 负环检测引擎 (class070)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '差分约束系统' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('FEASIBLE_SYSTEM');
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

    if (presetKey === 'FEASIBLE_SYSTEM') {
      this.n = 4;
      this.constraints = [
        { u: 1, v: 2, weight: 3 }, // x1 - x2 <= 3 -> 2 -> 1 (3)
        { u: 2, v: 3, weight: -2 }, // x2 - x3 <= -2 -> 3 -> 2 (-2)
        { u: 3, v: 4, weight: 1 }, // x3 - x4 <= 1 -> 4 -> 3 (1)
        { u: 1, v: 4, weight: 4 }, // x1 - x4 <= 4 -> 4 -> 1 (4)
        { u: 4, v: 2, weight: 5 }, // x4 - x2 <= 5 -> 2 -> 4 (5)
      ];
    } else if (presetKey === 'NEGATIVE_CYCLE_CONTRADICTION') {
      this.n = 3;
      this.constraints = [
        { u: 1, v: 2, weight: -3 }, // x1 - x2 <= -3 -> 2 -> 1 (-3)
        { u: 2, v: 1, weight: 2 }, // x2 - x1 <= 2  -> 1 -> 2 (2) 环权为 -1!
        { u: 3, v: 1, weight: 4 },
      ];
    } else if (presetKey === 'INTERVAL_ORDERING') {
      this.n = 4;
      this.constraints = [
        { u: 2, v: 1, weight: 5 },
        { u: 3, v: 2, weight: 2 },
        { u: 4, v: 3, weight: 3 },
        { u: 4, v: 1, weight: 12 },
      ];
    }

    this.layoutNodes();
    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private layoutNodes(): void {
    this.nodePositions = [];
    // 0 号超级源点
    this.nodePositions.push({ x: 230, y: 35 });

    const centerX = 230;
    const centerY = 135;
    const radius = 75;

    for (let i = 1; i <= this.n; i++) {
      const angle = ((i - 1) / this.n) * Math.PI * 2 + Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      this.nodePositions.push({ x, y });
    }
  }

  private computeTraceSteps(): void {
    const n = this.n;
    const graph: Array<Array<{ to: number; weight: number }>> = Array.from({ length: n + 1 }, () => []);

    // 1. 不等式建边: v -> u (weight)
    for (const c of this.constraints) {
      graph[c.v].push({ to: c.u, weight: c.weight });
    }

    // 2. 超级源点 0 -> i (0)
    for (let i = 1; i <= n; i++) {
      graph[0].push({ to: i, weight: 0 });
    }

    const dist: number[] = Array(n + 1).fill(999);
    const count: number[] = Array(n + 1).fill(0);
    const inQueue: boolean[] = Array(n + 1).fill(false);
    const queue: number[] = [];

    const steps: DiffConstraintStep[] = [];
    const cloneDist = () => [...dist];
    const cloneCount = () => [...count];
    const cloneInQueue = () => [...inQueue];
    const cloneQueue = () => [...queue];

    dist[0] = 0;
    queue.push(0);
    inQueue[0] = true;

    steps.push({
      type: 'INIT',
      curU: 0,
      distSnapshot: cloneDist(),
      countSnapshot: cloneCount(),
      inQueueSnapshot: cloneInQueue(),
      queueSnapshot: cloneQueue(),
      message: `🚀 初始化超级源点 x0=0，向所有变量节点连权为 0 的边并加入 SPFA 队列。`,
    });

    let hasNegativeCycle = false;

    while (queue.length > 0) {
      const u = queue.shift()!;
      inQueue[u] = false;

      for (const edge of graph[u]) {
        const v = edge.to;
        const w = edge.weight;

        if (dist[v] > dist[u] + w) {
          dist[v] = dist[u] + w;
          count[v] = count[u] + 1;

          if (count[v] > n) {
            hasNegativeCycle = true;
            steps.push({
              type: 'NEGATIVE_CYCLE',
              curU: u,
              curV: v,
              curWeight: w,
              distSnapshot: cloneDist(),
              countSnapshot: cloneCount(),
              inQueueSnapshot: cloneInQueue(),
              queueSnapshot: cloneQueue(),
              negativeCycleEdges: [[u, v]],
              message: `💥 [检测到负权环！] 节点 x${v} 入队松弛次数已达 ${count[v]} > ${n}！说明存在逻辑矛盾，系统无解 (NO)！`,
            });
            break;
          }

          if (!inQueue[v]) {
            queue.push(v);
            inQueue[v] = true;
          }

          steps.push({
            type: 'RELAX',
            curU: u,
            curV: v,
            curWeight: w,
            distSnapshot: cloneDist(),
            countSnapshot: cloneCount(),
            inQueueSnapshot: cloneInQueue(),
            queueSnapshot: cloneQueue(),
            message: `✨ [松弛成功] 边 (${u === 0 ? 'x0' : 'x' + u} → x${v}, 权值 ${w})：更新 dist[x${v}] = ${dist[v]}。`,
          });
        }
      }

      if (hasNegativeCycle) break;
    }

    if (!hasNegativeCycle) {
      steps.push({
        type: 'FEASIBLE_DONE',
        curU: -1,
        distSnapshot: cloneDist(),
        countSnapshot: cloneCount(),
        inQueueSnapshot: cloneInQueue(),
        queueSnapshot: cloneQueue(),
        message: `🏁 SPFA 队列清空且无负环！成功求出一组最大可行解：[${dist.slice(1).map((d, i) => `x${i + 1}=${d}`).join(', ')}]！`,
      });
    }

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#diff-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: DIFF_CONSTRAINTS_CODE_LANGUAGES,
      problemHtml: DIFF_CONSTRAINTS_PROBLEM_HTML,
      analysisHtml: DIFF_CONSTRAINTS_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-diff-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-diff-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-diff-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.diff-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'FEASIBLE_SYSTEM';
        this.root?.querySelectorAll('.diff-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-diff-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        DiffAudio.isMuted = !DiffAudio.isMuted;
        soundBtn.textContent = DiffAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'RELAX') DiffAudio.playRelax();
      else if (cur.type === 'NEGATIVE_CYCLE') DiffAudio.playAlarm();
      else if (cur.type === 'FEASIBLE_DONE') DiffAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-diff-autoplay') as HTMLButtonElement | null;
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
    const playBtn = this.root?.querySelector('#btn-diff-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动推演';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#diff-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#diff-status-badge') as HTMLElement | null;
    const queueList = this.root.querySelector('#diff-queue-list') as HTMLElement | null;
    const constraintsList = this.root.querySelector('#diff-constraints-list') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'FEASIBLE_DONE') {
        statusBadge.textContent = '🎯 可行解达成 (FEASIBLE)';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else if (cur.type === 'NEGATIVE_CYCLE') {
        statusBadge.textContent = '💥 负环矛盾 (INFEASIBLE)';
        statusBadge.style.background = '#fef2f2';
        statusBadge.style.color = '#dc2626';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (queueList) {
      if (cur.queueSnapshot.length === 0) {
        queueList.innerHTML = '<span style="color: #94a3b8; font-size: 11px;">[队列为空]</span>';
      } else {
        queueList.innerHTML = cur.queueSnapshot
          .map((u) => `<span style="background: #3b82f6; color: #ffffff; padding: 1px 6px; border-radius: 4px; font-weight: bold; font-size: 11px; margin-right: 3px;">x${u}</span>`)
          .join('');
      }
    }

    if (constraintsList) {
      constraintsList.innerHTML = this.constraints
        .map((c) => {
          const uVal = cur.distSnapshot[c.u];
          const vVal = cur.distSnapshot[c.v];
          const isSatisfied = uVal !== 999 && vVal !== 999 ? uVal - vVal <= c.weight : false;
          const bg = isSatisfied ? '#f0fdf4' : '#f8fafc';
          const border = isSatisfied ? '#bbf7d0' : '#e2e8f0';
          const icon = isSatisfied ? '✅' : '⏳';

          return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 2px 6px; border-radius: 4px; background: ${bg}; border: 1px solid ${border}; font-size: 10.5px; margin-bottom: 2px;">
              <span>x${c.u} - x${c.v} &le; ${c.weight}</span>
              <span style="font-size: 10px;">${icon} (${uVal === 999 ? '?' : uVal} - ${vVal === 999 ? '?' : vVal})</span>
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

    // 1. 绘制超级源点向变量节点的连线
    const pos0 = this.nodePositions[0];
    if (pos0) {
      for (let i = 1; i <= this.n; i++) {
        const posi = this.nodePositions[i];
        if (!posi) continue;

        ctx.save();
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(pos0.x, pos0.y);
        ctx.lineTo(posi.x, posi.y);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 2. 绘制不等式有向边: v -> u (weight)
    for (const c of this.constraints) {
      const p1 = this.nodePositions[c.v];
      const p2 = this.nodePositions[c.u];
      if (!p1 || !p2) continue;

      const isCurrent = cur && cur.curU === c.v && cur.curV === c.u;

      ctx.save();
      if (isCurrent) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
      } else {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 2;
      }

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 边权文字
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = isCurrent ? '#38bdf8' : '#94a3b8';
      ctx.fillText(`+(${c.weight})`, midX + 3, midY - 3);

      ctx.restore();
    }

    // 3. 绘制节点 (包括超级源点 0)
    for (let i = 0; i <= this.n; i++) {
      const pos = this.nodePositions[i];
      if (!pos) continue;

      const isSource = i === 0;
      const isCurrent = cur && cur.curU === i;
      const distVal = cur ? cur.distSnapshot[i] : (isSource ? 0 : 999);
      const isNegCycle = cur && cur.type === 'NEGATIVE_CYCLE' && cur.curV === i;

      ctx.save();
      let radius = isSource ? 16 : 19;
      let fillColor = isSource ? '#713f12' : '#1e293b';
      let strokeColor = isSource ? '#eab308' : '#64748b';

      if (isNegCycle) {
        fillColor = '#7f1d1d';
        strokeColor = '#ef4444';
        radius = 23 + Math.sin(this.pulseAnim * 2) * 3;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 15;
      } else if (isCurrent) {
        fillColor = '#0369a1';
        strokeColor = '#38bdf8';
        radius = 22 + Math.sin(this.pulseAnim) * 2;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
      } else if (distVal < 999) {
        fillColor = '#1e3a8a';
        strokeColor = '#3b82f6';
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
      ctx.fillText(isSource ? '⭐x0' : `x${i}`, pos.x, pos.y - (isSource ? 0 : 3));

      // 当前距离值
      if (!isSource) {
        ctx.font = '9px monospace';
        ctx.fillStyle = distVal === 999 ? '#94a3b8' : '#67e8f9';
        ctx.fillText(distVal === 999 ? '∞' : `${distVal}`, pos.x, pos.y + 9);
      }

      ctx.restore();
    }

    ctx.restore();
  }
}

export const DIFF_CONSTRAINTS_TEMPLATE = `
  <div id="algo-diff-constraints-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">⚖️</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">差分约束系统 (Difference Constraints)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="diff-preset-btn active" data-preset="FEASIBLE_SYSTEM" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">标准可行解系统</button>
          <button class="diff-preset-btn" data-preset="NEGATIVE_CYCLE_CONTRADICTION" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">负环矛盾无解</button>
          <button class="diff-preset-btn" data-preset="INTERVAL_ORDERING" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">区间时序约束</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="diff-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-diff-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步松弛</button>
        <button id="btn-diff-autoplay" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(2,132,199,0.25);">▶️ 自动松弛</button>
        <button id="btn-diff-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-diff-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #0369a1;">
      <div style="display: flex; gap: 14px; align-items: center;">
        <span>📬 SPFA 活跃队列: <span id="diff-queue-list"></span></span>
      </div>
      <div id="diff-narration-box" style="font-weight: 700; color: #075985;">
        💡 准备就绪：建立超级源点 x0，由三角不等式建边并运行 SPFA 负环检测！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：约束拓扑 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="diff-canvas" width="460" height="230" style="width: 460px; height: 230px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          ⭐ 金色为超级源点 x0 (权为0) | 🔵 蓝色为变量节点与当前最短路上限 | 🔴 红色闪烁为负环矛盾
        </div>
      </div>

      <!-- 右侧：不等式列表与代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; max-height: 105px; display: flex; flex-direction: column; gap: 2px;">
          <div style="font-size: 10.5px; font-weight: 700; color: #0f172a;">📋 线性不等式约束状态:</div>
          <div id="diff-constraints-list" style="display: flex; flex-direction: column; overflow-y: auto;"></div>
        </div>

        <div id="diff-terminal-mount" style="flex: 1; min-height: 175px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'diff-constraints',
  name: '差分约束系统 (Difference Constraints)',
  viewId: 'algo-diff-constraints-view',
  category: 'graph',
  description: '差分约束系统：左程云 class070 线性不等式向最短路转化、超级源点建图与 SPFA 负权环无解检测 (洛谷 P5960)',
  icon: '⚖️',
  template: DIFF_CONSTRAINTS_TEMPLATE,
  Visualizer: DiffConstraintsVisualizer,
  difficulty: 3,
  levelOrder: 31,
  learningGoal: '掌握差分约束系统与最短路三角不等式的数学同构转换、超级源点的引入意义以及负权环与代数矛盾的判定',
});
