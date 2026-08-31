/**
 * DAG 拓扑排序与动态规划 / 关键路径 (DAG Topo DP & Critical Path) 可视化引擎
 * 参考左程云《算法通关课》【必备篇】class060: 食物链计数 (P4017) 与 并行课程 III (LeetCode 2050)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  TOPO_DP_CODE_LANGUAGES,
  TOPO_DP_PROBLEM_HTML,
  TOPO_DP_ANALYSIS_HTML,
} from './topo-dp-problem-content';

export interface DAGNode {
  id: number;
  time: number;
  x: number;
  y: number;
}

export interface DAGEdge {
  u: number;
  v: number;
}

export interface TopoDPStep {
  type: 'POP_QUEUE' | 'UPDATE_DP' | 'UNLOCK_NODE' | 'DONE';
  u: number;
  v?: number;
  curCost: number;
  inDegreeSnapshot: number[];
  costSnapshot: number[];
  queueSnapshot: number[];
  criticalPath: number[];
  message: string;
}

class TopoDPAudio {
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

  public static playPop(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  public static playUpdate(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  public static playUnlock(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const notes = [440, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.15);
      });
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
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.35);
      });
    } catch {}
  }
}

export class TopoDPVisualizer extends StepVisualizer<any> {
  // DAG 数据结构
  private n = 5;
  private nodes: DAGNode[] = [];
  private edges: DAGEdge[] = [];
  private times: number[] = [1, 2, 3, 4, 5];

  // 步骤追踪
  private traceSteps: TopoDPStep[] = [];
  private currentStepPtr = 0;
  private isAutoPlaying = false;
  private autoPlayTimer: any = null;
  private playSpeed = 1;

  // 画布与渲染
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private lastTimestamp = 0;
  private pulseAnim = 0;

  constructor() {
    super();
    this.codeLanguages = TOPO_DP_CODE_LANGUAGES;
    this.codeLines = TOPO_DP_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = 'DAG 拓扑 DP 算法引擎 (LeetCode 2050)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: 'DAG 拓扑排序与动态规划' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_COURSES');
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

    if (presetKey === 'CLASSIC_COURSES') {
      // N=5, Relations: [[1,5],[2,5],[3,5],[3,4],[4,5]], Times: [1,2,3,4,5]
      this.n = 5;
      this.times = [1, 2, 3, 4, 5];
      this.nodes = [
        { id: 1, time: 1, x: 70, y: 50 },
        { id: 2, time: 2, x: 70, y: 115 },
        { id: 3, time: 3, x: 70, y: 180 },
        { id: 4, time: 4, x: 230, y: 180 },
        { id: 5, time: 5, x: 390, y: 115 },
      ];
      this.edges = [
        { u: 1, v: 5 },
        { u: 2, v: 5 },
        { u: 3, v: 5 },
        { u: 3, v: 4 },
        { u: 4, v: 5 },
      ];
    } else if (presetKey === 'DIAMOND_DAG') {
      this.n = 6;
      this.times = [2, 3, 5, 4, 2, 6];
      this.nodes = [
        { id: 1, time: 2, x: 60, y: 115 },
        { id: 2, time: 3, x: 170, y: 55 },
        { id: 3, time: 5, x: 170, y: 175 },
        { id: 4, time: 4, x: 290, y: 55 },
        { id: 5, time: 2, x: 290, y: 175 },
        { id: 6, time: 6, x: 400, y: 115 },
      ];
      this.edges = [
        { u: 1, v: 2 },
        { u: 1, v: 3 },
        { u: 2, v: 4 },
        { u: 3, v: 5 },
        { u: 4, v: 6 },
        { u: 5, v: 6 },
        { u: 3, v: 4 },
      ];
    } else if (presetKey === 'INDUSTRIAL_PIPELINE') {
      this.n = 6;
      this.times = [4, 1, 6, 2, 5, 3];
      this.nodes = [
        { id: 1, time: 4, x: 60, y: 70 },
        { id: 2, time: 1, x: 60, y: 160 },
        { id: 3, time: 6, x: 190, y: 70 },
        { id: 4, time: 2, x: 190, y: 160 },
        { id: 5, time: 5, x: 320, y: 115 },
        { id: 6, time: 3, x: 410, y: 115 },
      ];
      this.edges = [
        { u: 1, v: 3 },
        { u: 2, v: 4 },
        { u: 3, v: 5 },
        { u: 4, v: 5 },
        { u: 5, v: 6 },
      ];
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const n = this.n;
    const graph: number[][] = Array.from({ length: n + 1 }, () => []);
    const inDegree: number[] = Array(n + 1).fill(0);
    const cost: number[] = Array(n + 1).fill(0);
    const parent: number[] = Array(n + 1).fill(0);

    this.edges.forEach((e) => {
      graph[e.u].push(e.v);
      inDegree[e.v]++;
    });

    const queue: number[] = [];
    for (let i = 1; i <= n; i++) {
      if (inDegree[i] === 0) {
        cost[i] = this.times[i - 1];
        queue.push(i);
      }
    }

    const steps: TopoDPStep[] = [];
    const cloneInDegree = () => [...inDegree];
    const cloneCost = () => [...cost];
    const cloneQueue = () => [...queue];

    const getCriticalPath = (): number[] => {
      let maxEnd = 1;
      for (let i = 1; i <= n; i++) {
        if (cost[i] > cost[maxEnd]) maxEnd = i;
      }
      const path: number[] = [];
      let curr = maxEnd;
      while (curr !== 0) {
        path.unshift(curr);
        curr = parent[curr];
      }
      return path;
    };

    steps.push({
      type: 'POP_QUEUE',
      u: queue[0] || 1,
      curCost: cost[queue[0] || 1],
      inDegreeSnapshot: cloneInDegree(),
      costSnapshot: cloneCost(),
      queueSnapshot: cloneQueue(),
      criticalPath: getCriticalPath(),
      message: `🚀 初始化：入度为 0 的前置节点 [${queue.join(', ')}] 入队，初始工期设为自身开销。`,
    });

    while (queue.length > 0) {
      const u = queue.shift()!;
      const uCost = cost[u];

      steps.push({
        type: 'POP_QUEUE',
        u,
        curCost: uCost,
        inDegreeSnapshot: cloneInDegree(),
        costSnapshot: cloneCost(),
        queueSnapshot: cloneQueue(),
        criticalPath: getCriticalPath(),
        message: `📥 节点 [${u}] 拓扑就绪，最早完成时间为 ${uCost} 个月。`,
      });

      for (const v of graph[u]) {
        const nextTime = this.times[v - 1];
        const newVcost = uCost + nextTime;

        if (newVcost > cost[v]) {
          cost[v] = newVcost;
          parent[v] = u;
        }

        inDegree[v]--;

        steps.push({
          type: 'UPDATE_DP',
          u,
          v,
          curCost: cost[v],
          inDegreeSnapshot: cloneInDegree(),
          costSnapshot: cloneCost(),
          queueSnapshot: cloneQueue(),
          criticalPath: getCriticalPath(),
          message: `⚡ [状态转移] 课程 ${u} → ${v}：更新 cost[${v}] = max(cost[${v}], cost[${u}] + time[${v}]) = ${cost[v]}，入度减为 ${inDegree[v]}。`,
        });

        if (inDegree[v] === 0) {
          queue.push(v);
          steps.push({
            type: 'UNLOCK_NODE',
            u,
            v,
            curCost: cost[v],
            inDegreeSnapshot: cloneInDegree(),
            costSnapshot: cloneCost(),
            queueSnapshot: cloneQueue(),
            criticalPath: getCriticalPath(),
            message: `🔓 节点 [${v}] 所有前驱先修课均已完结 (入度为 0)，解锁并加入就绪队列！`,
          });
        }
      }
    }

    steps.push({
      type: 'DONE',
      u: 0,
      curCost: Math.max(...cost),
      inDegreeSnapshot: cloneInDegree(),
      costSnapshot: cloneCost(),
      queueSnapshot: [],
      criticalPath: getCriticalPath(),
      message: `🏁 DAG 拓扑 DP 推演完成！项目关键路径为 [${getCriticalPath().join(' → ')}]，最少总月份: ${Math.max(...cost)}！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#topodp-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: TOPO_DP_CODE_LANGUAGES,
      problemHtml: TOPO_DP_PROBLEM_HTML,
      analysisHtml: TOPO_DP_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-topodp-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-topodp-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-topodp-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.topodp-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_COURSES';
        this.root?.querySelectorAll('.topodp-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-topodp-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        TopoDPAudio.isMuted = !TopoDPAudio.isMuted;
        soundBtn.textContent = TopoDPAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'POP_QUEUE') TopoDPAudio.playPop();
      else if (cur.type === 'UPDATE_DP') TopoDPAudio.playUpdate();
      else if (cur.type === 'UNLOCK_NODE') TopoDPAudio.playUnlock();
      else if (cur.type === 'DONE') TopoDPAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-topodp-autoplay') as HTMLButtonElement | null;
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
    const playBtn = this.root?.querySelector('#btn-topodp-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动推演';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#topodp-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#topodp-status-badge') as HTMLElement | null;
    const queueList = this.root.querySelector('#topodp-queue-list') as HTMLElement | null;
    const maxCostStat = this.root.querySelector('#topodp-maxcost-stat') as HTMLElement | null;
    const criticalPathEl = this.root.querySelector('#topodp-critical-path') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
      statusBadge.style.background = '#eff6ff';
      statusBadge.style.color = '#2563eb';
    }

    if (maxCostStat) {
      maxCostStat.textContent = `${Math.max(...cur.costSnapshot)} 个月`;
    }

    if (criticalPathEl) {
      criticalPathEl.textContent = cur.criticalPath.join(' → ');
    }

    if (queueList) {
      if (cur.queueSnapshot.length === 0) {
        queueList.innerHTML = '<span style="font-size: 10.5px; color: #94a3b8;">就绪队列为空</span>';
      } else {
        queueList.innerHTML = cur.queueSnapshot
          .map((u) => `<span style="background: #3b82f6; color: #ffffff; font-weight: bold; padding: 2px 7px; border-radius: 4px; font-size: 11px; margin-right: 4px;">课程 ${u}</span>`)
          .join('');
      }
    }
  }

  private startLoop(): void {
    if (typeof requestAnimationFrame !== 'function') return;
    const loop = (timestamp: number) => {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const dt = Math.min(32, timestamp - this.lastTimestamp);
      this.lastTimestamp = timestamp;

      this.pulseAnim += dt * 0.005;
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

    // 1. 深色背景
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // 2. 绘制 DAG 依赖有向箭头
    this.edges.forEach((e) => {
      const n1 = this.nodes.find((n) => n.id === e.u);
      const n2 = this.nodes.find((n) => n.id === e.v);
      if (!n1 || !n2) return;

      const isCriticalEdge = cur && cur.criticalPath.includes(e.u) && cur.criticalPath.includes(e.v);
      const isRelaxingEdge = cur && cur.u === e.u && cur.v === e.v;

      ctx.save();
      if (isRelaxingEdge) {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 10;
      } else if (isCriticalEdge) {
        ctx.strokeStyle = '#f97316'; // 关键路径橙红
        ctx.lineWidth = 2.5;
      } else {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.lineWidth = 1.5;
      }

      ctx.beginPath();
      ctx.moveTo(n1.x, n1.y);
      ctx.lineTo(n2.x, n2.y);
      ctx.stroke();

      // 绘制箭头
      const angle = Math.atan2(n2.y - n1.y, n2.x - n1.x);
      const arrowLen = 9;
      const targetX = n2.x - 20 * Math.cos(angle);
      const targetY = n2.y - 20 * Math.sin(angle);

      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath();
      ctx.moveTo(targetX, targetY);
      ctx.lineTo(targetX - arrowLen * Math.cos(angle - Math.PI / 6), targetY - arrowLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(targetX - arrowLen * Math.cos(angle + Math.PI / 6), targetY - arrowLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    });

    // 3. 绘制节点
    this.nodes.forEach((node) => {
      const inDeg = cur ? cur.inDegreeSnapshot[node.id] : 0;
      const costVal = cur ? cur.costSnapshot[node.id] : 0;
      const isCur = cur && cur.u === node.id;
      const isTargetRelax = cur && cur.v === node.id;
      const inQueue = cur && cur.queueSnapshot.includes(node.id);
      const isZeroInDeg = inDeg === 0;

      ctx.save();

      let fillColor = '#1e293b';
      let strokeColor = '#64748b';
      let radius = 19;

      if (isCur) {
        fillColor = '#ca8a04';
        strokeColor = '#facc15';
        radius = 22 + Math.sin(this.pulseAnim) * 2;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
      } else if (isTargetRelax) {
        fillColor = '#1e3a8a';
        strokeColor = '#38bdf8';
      } else if (isZeroInDeg) {
        fillColor = '#065f46';
        strokeColor = '#34d399';
      }

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 课程编号与自身耗时
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${node.id} (${node.time}m)`, node.x, node.y - 2);

      // 入度小徽章 (右上角)
      ctx.fillStyle = inDeg === 0 ? '#10b981' : '#ef4444';
      ctx.beginPath();
      ctx.arc(node.x + 14, node.y - 14, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 8.5px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${inDeg}`, node.x + 14, node.y - 14);

      // DP 最早完成时间标注 (下方)
      ctx.font = '9.5px monospace';
      ctx.fillStyle = '#fde047';
      ctx.fillText(`cost=${costVal}`, node.x, node.y + radius + 10);

      ctx.restore();
    });

    ctx.restore();
  }
}

export const TOPO_DP_TEMPLATE = `
  <div id="algo-topo-dp-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🎓</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">拓扑排序与 DAG 关键路径 (Topo DP)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="topodp-preset-btn active" data-preset="CLASSIC_COURSES" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典课程 (N=5)</button>
          <button class="topodp-preset-btn" data-preset="DIAMOND_DAG" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">钻石依赖 (N=6)</button>
          <button class="topodp-preset-btn" data-preset="INDUSTRIAL_PIPELINE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">流水线工程 (N=6)</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="topodp-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-topodp-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-topodp-autoplay" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(59,130,246,0.25);">▶️ 自动推演</button>
        <button id="btn-topodp-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-topodp-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #1e40af;">
      <div style="display: flex; gap: 14px; align-items: center;">
        <span>⏳ 最少总耗时: <b id="topodp-maxcost-stat" style="color: #2563eb; font-size: 12px;">0 个月</b></span>
        <span>🌟 关键路径: <b id="topodp-critical-path" style="color: #ea580c; font-size: 12px;">-</b></span>
      </div>
      <div id="topodp-narration-box" style="font-weight: 700; color: #1e3a8a;">
        💡 准备就绪：观察入度剥离与无后效性 DP 状态转移！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：DAG Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="topodp-canvas" width="460" height="230" style="width: 460px; height: 230px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🔴 右上角红标为当前入度 | 🟡 下方黄字为最早完工时间 cost[u]
        </div>
      </div>

      <!-- 右侧：队列与代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; max-height: 90px; display: flex; flex-direction: column; gap: 4px;">
          <div style="font-size: 10.5px; font-weight: 700; color: #0f172a;">⚡ 拓扑就绪队列 (In-Degree = 0 节点):</div>
          <div id="topodp-queue-list" style="display: flex; flex-wrap: wrap; gap: 3px;"></div>
        </div>

        <div id="topodp-terminal-mount" style="flex: 1; min-height: 190px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'topo-dp',
  name: '拓扑排序与 DAG 关键路径',
  viewId: 'algo-topo-dp-view',
  category: 'graph',
  description: 'DAG 拓扑动态规划算法：左程云 class060 食物链计数 (P4017) 与 并行课程 III (LeetCode 2050)、入度剥离、最长工期关键路径推演',
  icon: '🎓',
  template: TOPO_DP_TEMPLATE,
  Visualizer: TopoDPVisualizer,
  difficulty: 2,
  levelOrder: 23,
  learningGoal: '掌握拓扑排序如何为 DAG 提供无后效性计算拓扑序，以及 Critical Path 关键路径与路径计数 DP 的状态转移',
});
