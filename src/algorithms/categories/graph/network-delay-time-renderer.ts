/**
 * 网络延迟时间 (Network Delay Time - LeetCode 743 / 左程云 Class 064 Code01) 可视化引擎
 * 核心：单源最短路径 Dijkstra 堆优化、信号广播向外扩散、全网收齐时间 max(dist[1..n])、不可达节点判定 (-1)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  NETWORK_DELAY_CODE_LANGUAGES,
  NETWORK_DELAY_PROBLEM_HTML,
  NETWORK_DELAY_ANALYSIS_HTML,
} from './network-delay-time-problem-content';

export interface DelayStep {
  type: 'EMIT_SIGNAL' | 'POP_MIN_NODE' | 'RELAX_LINK' | 'ALL_RECEIVED' | 'UNREACHABLE';
  curNode: number;
  distList: number[];
  visitedList: boolean[];
  pqSnapshot: Array<{ u: number; d: number }>;
  maxDelaySoFar: number;
  message: string;
}

class NetAudio {
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

  public static playBeep(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playLink(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  public static playVictory(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const chord = [523.25, 659.25, 783.99, 1046.5];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.22);
      });
    } catch {}
  }
}

export class NetworkDelayTimeVisualizer extends StepVisualizer<any> {
  private n = 4;
  private startK = 2;
  private times: Array<{ u: number; v: number; w: number }> = [
    { u: 2, v: 1, w: 1 },
    { u: 2, v: 3, w: 1 },
    { u: 3, v: 4, w: 1 },
  ];
  private nodePositions: Record<number, { x: number; y: number }> = {
    1: { x: 60, y: 70 },
    2: { x: 130, y: 35 },
    3: { x: 130, y: 130 },
    4: { x: 200, y: 130 },
  };

  // 推演步骤
  private traceSteps: DelayStep[] = [];
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
    this.codeLanguages = NETWORK_DELAY_CODE_LANGUAGES;
    this.codeLines = NETWORK_DELAY_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '网络延迟时间 Dijkstra 引擎 (Network Delay Time)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '网络延迟时间' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('LEETCODE_EXAMPLE_1');
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

    if (presetKey === 'LEETCODE_EXAMPLE_1') {
      this.n = 4;
      this.startK = 2;
      this.times = [
        { u: 2, v: 1, w: 1 },
        { u: 2, v: 3, w: 1 },
        { u: 3, v: 4, w: 1 },
      ];
      this.nodePositions = {
        1: { x: 60, y: 70 },
        2: { x: 130, y: 35 },
        3: { x: 130, y: 130 },
        4: { x: 200, y: 130 },
      };
    } else if (presetKey === 'DISCONNECTED_CASE_2') {
      this.n = 2;
      this.startK = 2;
      this.times = [{ u: 1, v: 2, w: 1 }];
      this.nodePositions = {
        1: { x: 70, y: 90 },
        2: { x: 190, y: 90 },
      };
    } else {
      this.n = 5;
      this.startK = 1;
      this.times = [
        { u: 1, v: 2, w: 2 },
        { u: 1, v: 3, w: 4 },
        { u: 2, v: 4, w: 3 },
        { u: 3, v: 4, w: 1 },
        { u: 4, v: 5, w: 2 },
      ];
      this.nodePositions = {
        1: { x: 40, y: 90 },
        2: { x: 95, y: 40 },
        3: { x: 95, y: 140 },
        4: { x: 155, y: 90 },
        5: { x: 215, y: 90 },
      };
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const N = this.n;
    const K = this.startK;
    const dist: number[] = Array(N + 1).fill(999);
    const vis: boolean[] = Array(N + 1).fill(false);

    const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: N + 1 }, () => []);
    this.times.forEach((t) => {
      adj[t.u].push({ to: t.v, w: t.w });
    });

    const pq: Array<{ u: number; d: number }> = [];

    dist[K] = 0;
    pq.push({ u: K, d: 0 });

    const steps: DelayStep[] = [];

    steps.push({
      type: 'EMIT_SIGNAL',
      curNode: K,
      distList: [...dist],
      visitedList: [...vis],
      pqSnapshot: JSON.parse(JSON.stringify(pq)),
      maxDelaySoFar: 0,
      message: `📡 [信号源发射] 从源点节点 ${K} 发出无线广播信号，初始时刻 t = 0！`,
    });

    while (pq.length > 0) {
      pq.sort((a, b) => a.d - b.d);
      const cur = pq.shift()!;
      const u = cur.u;
      const d = cur.d;

      if (vis[u]) continue;
      vis[u] = true;

      // 计算当前最大延迟
      let currentMax = 0;
      for (let i = 1; i <= N; i++) {
        if (dist[i] !== 999) currentMax = Math.max(currentMax, dist[i]);
      }

      steps.push({
        type: 'POP_MIN_NODE',
        curNode: u,
        distList: [...dist],
        visitedList: [...vis],
        pqSnapshot: JSON.parse(JSON.stringify(pq)),
        maxDelaySoFar: currentMax,
        message: `🔔 [节点收齐信号] 节点 ${u} 在时刻 t = ${d} 最早收到信号并锁定！`,
      });

      for (const edge of adj[u]) {
        const v = edge.to;
        const w = edge.w;
        if (dist[u] + w < dist[v]) {
          dist[v] = dist[u] + w;
          pq.push({ u: v, d: dist[v] });

          steps.push({
            type: 'RELAX_LINK',
            curNode: v,
            distList: [...dist],
            visitedList: [...vis],
            pqSnapshot: JSON.parse(JSON.stringify(pq)),
            maxDelaySoFar: currentMax,
            message: `⚡ [链路松弛] 信号从节点 ${u} 沿有向边 (${u} ➔ ${v}, 延迟 ${w}) 传输，预计到达节点 ${v} 时刻 t = ${dist[v]}！`,
          });
        }
      }
    }

    let finalMax = 0;
    let hasUnreachable = false;
    for (let i = 1; i <= N; i++) {
      if (dist[i] === 999) {
        hasUnreachable = true;
        break;
      }
      finalMax = Math.max(finalMax, dist[i]);
    }

    if (hasUnreachable) {
      steps.push({
        type: 'UNREACHABLE',
        curNode: 0,
        distList: [...dist],
        visitedList: [...vis],
        pqSnapshot: [],
        maxDelaySoFar: -1,
        message: `❌ [全网无法收齐] 存在孤立或无入度节点无法收到信号，全局返回 -1！`,
      });
    } else {
      steps.push({
        type: 'ALL_RECEIVED',
        curNode: 0,
        distList: [...dist],
        visitedList: [...vis],
        pqSnapshot: [],
        maxDelaySoFar: finalMax,
        message: `🎉 [全网广播完毕] 所有 ${N} 个节点均已收到信号！全网最大延迟时间为 ${finalMax}！`,
      });
    }

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#netdelay-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: NETWORK_DELAY_CODE_LANGUAGES,
      problemHtml: NETWORK_DELAY_PROBLEM_HTML,
      analysisHtml: NETWORK_DELAY_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-netdelay-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-netdelay-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-netdelay-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.netdelay-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'LEETCODE_EXAMPLE_1';
        this.root?.querySelectorAll('.netdelay-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-netdelay-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        NetAudio.isMuted = !NetAudio.isMuted;
        soundBtn.textContent = NetAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'EMIT_SIGNAL' || cur.type === 'POP_MIN_NODE') NetAudio.playBeep();
      else if (cur.type === 'RELAX_LINK') NetAudio.playLink();
      else if (cur.type === 'ALL_RECEIVED') NetAudio.playVictory();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-netdelay-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停广播';

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
    const playBtn = this.root?.querySelector('#btn-netdelay-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动广播';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#netdelay-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#netdelay-status-badge') as HTMLElement | null;
    const delayBadge = this.root.querySelector('#netdelay-time-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_RECEIVED') {
        statusBadge.textContent = '🏁 全网收齐';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else if (cur.type === 'UNREACHABLE') {
        statusBadge.textContent = '❌ 不可达 (-1)';
        statusBadge.style.background = '#fef2f2';
        statusBadge.style.color = '#ef4444';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (delayBadge) {
      delayBadge.textContent = `全网最大延迟: ${cur.maxDelaySoFar === -1 ? '-1 (不可达)' : cur.maxDelaySoFar}`;
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

    if (cur) {
      // 1. 绘制有向边
      this.times.forEach((t) => {
        const p1 = this.nodePositions[t.u];
        const p2 = this.nodePositions[t.v];
        if (!p1 || !p2) return;

        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // 箭头与权重
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - 5;
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#facc15';
        ctx.textAlign = 'center';
        ctx.fillText(`t:${t.w}`, midX, midY);

        ctx.restore();
      });

      // 2. 绘制节点与广播波纹
      for (let u = 1; u <= this.n; u++) {
        const pos = this.nodePositions[u];
        if (!pos) continue;

        const isSource = u === this.startK;
        const isCur = cur.curNode === u;
        const isLocked = cur.visitedList[u];
        const d = cur.distList[u];

        ctx.save();
        let fillColor = '#1e293b';
        let strokeColor = isSource ? '#ec4899' : isLocked ? '#10b981' : d !== 999 ? '#38bdf8' : '#475569';
        let radius = 14;

        if (isCur) {
          radius = 16 + Math.sin(this.pulseAnim) * 1.5;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 12;
        }

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isCur || isLocked ? 2.5 : 1.5;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 节点编号
        ctx.font = 'bold 10.5px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${u}`, pos.x, pos.y);

        // 时间标签
        ctx.font = '9.5px sans-serif';
        ctx.fillStyle = d === 999 ? '#64748b' : '#10b981';
        ctx.fillText(d === 999 ? '⏳等待' : `t=${d}`, pos.x, pos.y + 20);

        ctx.restore();
      }

      // 3. 右侧 Dijkstra 优先队列 HUD
      ctx.save();
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('📥 优先队列 (小根堆):', 255, 30);

      const pqList = cur.pqSnapshot.slice(0, 4);
      pqList.forEach((item, idx) => {
        const itemY = 48 + idx * 24;
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.roundRect(255, itemY, 180, 20, 4);
        ctx.fill();
        ctx.stroke();

        ctx.font = '10px monospace';
        ctx.fillStyle = '#facc15';
        ctx.textAlign = 'left';
        ctx.fillText(`[#${idx + 1}] 节点 ${item.u} (时刻: ${item.d})`, 265, itemY + 14);
      });

      if (pqList.length === 0) {
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('(堆已为空)', 255, 52);
      }

      // 延迟时间公式
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`📡 源点节点: K = ${this.startK}`, 250, 165);
      ctx.fillText(`⏱️ 全网延迟 = max(dist[1..${this.n}])`, 250, 183);
      ctx.fillText(`💡 存在 ∞ 节点则返回 -1`, 250, 201);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const NETWORK_DELAY_TEMPLATE = `
  <div id="algo-network-delay-time-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">📡</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">网络延迟时间 (Network Delay Time - LC 743)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="netdelay-preset-btn active" data-preset="LEETCODE_EXAMPLE_1" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">4 节点标准用例</button>
          <button class="netdelay-preset-btn" data-preset="DISCONNECTED_CASE_2" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">不可达用例 (-1)</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="netdelay-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-netdelay-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-netdelay-autoplay" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(2,132,199,0.25);">▶️ 自动广播</button>
        <button id="btn-netdelay-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-netdelay-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #0369a1;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>⏱️ 广播指标: <b id="netdelay-time-badge" style="color: #0284c7; font-size: 12px;">全网最大延迟: 0</b></span>
      </div>
      <div id="netdelay-narration-box" style="font-weight: 700; color: #075985;">
        💡 准备就绪：Dijkstra 堆优化求解单源最短路，全网延迟 = max(dist[1..n])！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：网络拓扑与信号 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="netdelay-canvas" width="460" height="220" style="width: 460px; height: 220px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          左侧为有向网络拓扑 | 🟣 粉色为信号源点 K | 🟢 绿色为已收到信号节点 | 右侧为堆状态
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="netdelay-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'network-delay-time',
  name: '网络延迟时间 (Network Delay Time)',
  viewId: 'algo-network-delay-time-view',
  category: 'graph',
  description: 'Dijkstra 堆优化经典应用：信号广播单源最短路径、全网延迟时间 max(dist[1..n]) 与连通性判定 (LeetCode 743 / 左程云 Class064 Code01)',
  icon: '📡',
  template: NETWORK_DELAY_TEMPLATE,
  Visualizer: NetworkDelayTimeVisualizer,
  difficulty: 2,
  levelOrder: 67,
  learningGoal: '掌握 Dijkstra 堆优化在网络路由与信号扩散中的精确建模、全网最大延迟计算与不可达节点判定',
});
