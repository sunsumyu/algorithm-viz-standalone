/**
 * 电动车充放电分层图最短路 (Electric Vehicle Minimum Cost - Charge Layered Dijkstra) 可视化引擎
 * 左程云算法通关课 Class 064 Code05 (LeetCode LCP 35)
 * 核心：状态空间 (u, charge)、原地充电转移与道路行驶转移、分层图 Dijkstra 优先队列
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  EV_CHARGE_CODE_LANGUAGES,
  EV_CHARGE_PROBLEM_HTML,
  EV_CHARGE_ANALYSIS_HTML,
} from './ev-charge-dijkstra-problem-content';

export interface EVStep {
  type: 'POP_STATE' | 'ACTION_CHARGE' | 'ACTION_DRIVE' | 'REACH_GOAL' | 'ALL_DONE';
  curCity: number;
  curPower: number;
  curCost: number;
  actionType: 'CHARGE' | 'DRIVE' | 'NONE';
  pqSnapshot: Array<{ city: number; power: number; cost: number }>;
  bestCost: number;
  message: string;
}

class EVAudio {
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

  public static playCharge(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  public static playDrive(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(392.0, ctx.currentTime);
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
        osc.type = 'triangle';
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

export class EVChargeDijkstraVisualizer extends StepVisualizer<any> {
  // 城市与道路 (0-indexed)
  private numCities = 4;
  private maxPower = 4;
  private startCity = 0;
  private endCity = 3;
  private chargeRates: number[] = [2, 10, 3, 5];
  private cityPositions: Array<{ x: number; y: number }> = [
    { x: 50, y: 100 },  // 0
    { x: 140, y: 45 },  // 1
    { x: 140, y: 155 }, // 2
    { x: 230, y: 100 }, // 3
  ];
  private paths: Array<{ u: number; v: number; w: number }> = [
    { u: 0, v: 1, w: 2 },
    { u: 0, v: 2, w: 3 },
    { u: 1, v: 3, w: 2 },
    { u: 2, v: 3, w: 2 },
  ];

  // 推演步骤
  private traceSteps: EVStep[] = [];
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
    this.codeLanguages = EV_CHARGE_CODE_LANGUAGES;
    this.codeLines = EV_CHARGE_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '电动车分层图 Dijkstra 引擎 (EV Charge Plan)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '电动车游历城市' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_4_CITIES_EV');
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

    if (presetKey === 'CLASSIC_4_CITIES_EV') {
      this.numCities = 4;
      this.maxPower = 4;
      this.startCity = 0;
      this.endCity = 3;
      this.chargeRates = [2, 10, 3, 5];
      this.cityPositions = [
        { x: 50, y: 100 },  // 0 (charge 2)
        { x: 140, y: 45 },  // 1 (charge 10)
        { x: 140, y: 155 }, // 2 (charge 3)
        { x: 230, y: 100 }, // 3 (charge 5)
      ];
      this.paths = [
        { u: 0, v: 1, w: 2 },
        { u: 0, v: 2, w: 3 },
        { u: 1, v: 3, w: 2 },
        { u: 2, v: 3, w: 2 },
      ];
    } else {
      this.numCities = 3;
      this.maxPower = 3;
      this.startCity = 0;
      this.endCity = 2;
      this.chargeRates = [1, 5, 2];
      this.cityPositions = [
        { x: 50, y: 100 },
        { x: 140, y: 50 },
        { x: 230, y: 100 },
      ];
      this.paths = [
        { u: 0, v: 1, w: 1 },
        { u: 1, v: 2, w: 1 },
        { u: 0, v: 2, w: 3 },
      ];
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const N = this.numCities;
    const cnt = this.maxPower;
    const dist: number[][] = Array.from({ length: N }, () => Array(cnt + 1).fill(9999));
    const vis: boolean[][] = Array.from({ length: N }, () => Array(cnt + 1).fill(false));

    const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: N }, () => []);
    this.paths.forEach((p) => {
      adj[p.u].push({ to: p.v, w: p.w });
      adj[p.v].push({ to: p.u, w: p.w });
    });

    const pq: Array<{ city: number; power: number; cost: number }> = [];

    dist[this.startCity][0] = 0;
    pq.push({ city: this.startCity, power: 0, cost: 0 });

    const steps: EVStep[] = [];

    while (pq.length > 0) {
      pq.sort((a, b) => a.cost - b.cost);
      const cur = pq.shift()!;
      const u = cur.city;
      const p = cur.power;
      const cost = cur.cost;

      if (vis[u][p]) continue;
      vis[u][p] = true;

      steps.push({
        type: 'POP_STATE',
        curCity: u,
        curPower: p,
        curCost: cost,
        actionType: 'NONE',
        pqSnapshot: JSON.parse(JSON.stringify(pq)),
        bestCost: cost,
        message: `⚡ [出堆最优状态] 到达城市 ${u}，剩余电量 ${p}/${cnt}，累计花费时间 = ${cost}！`,
      });

      if (u === this.endCity) {
        steps.push({
          type: 'REACH_GOAL',
          curCity: u,
          curPower: p,
          curCost: cost,
          actionType: 'NONE',
          pqSnapshot: JSON.parse(JSON.stringify(pq)),
          bestCost: cost,
          message: `🎯 [到达终点城市] 成功抵达目标城市 ${u}！全局最小耗费为 ${cost}！`,
        });
        break;
      }

      // 1. 原地充 1 格电
      if (p < cnt && !vis[u][p + 1] && cost + this.chargeRates[u] < dist[u][p + 1]) {
        dist[u][p + 1] = cost + this.chargeRates[u];
        pq.push({ city: u, power: p + 1, cost: dist[u][p + 1] });

        steps.push({
          type: 'ACTION_CHARGE',
          curCity: u,
          curPower: p + 1,
          curCost: dist[u][p + 1],
          actionType: 'CHARGE',
          pqSnapshot: JSON.parse(JSON.stringify(pq)),
          bestCost: cost,
          message: `🔋 [原地充电] 在城市 ${u} 充 1 格电 (电价 +${this.chargeRates[u]})，电量变为 ${p + 1}/${cnt}，总花费 ${dist[u][p + 1]}！`,
        });
      }

      // 2. 道路行驶
      for (const edge of adj[u]) {
        const v = edge.to;
        const w = edge.w;
        if (p >= w && !vis[v][p - w] && cost + w < dist[v][p - w]) {
          dist[v][p - w] = cost + w;
          pq.push({ city: v, power: p - w, cost: dist[v][p - w] });

          steps.push({
            type: 'ACTION_DRIVE',
            curCity: v,
            curPower: p - w,
            curCost: dist[v][p - w],
            actionType: 'DRIVE',
            pqSnapshot: JSON.parse(JSON.stringify(pq)),
            bestCost: cost,
            message: `🚗 [驾车行驶] 沿道路 ${u} ➔ ${v} 驾驶 (耗电 ${w}, 耗时 +${w})，电量剩余 ${p - w}/${cnt}，总花费 ${dist[v][p - w]}！`,
          });
        }
      }
    }

    steps.push({
      type: 'ALL_DONE',
      curCity: this.endCity,
      curPower: steps[steps.length - 1].curPower,
      curCost: steps[steps.length - 1].bestCost,
      actionType: 'NONE',
      pqSnapshot: [],
      bestCost: steps[steps.length - 1].bestCost,
      message: `🎉 [计算完毕] 电动车游历城市分层图 Dijkstra 求解完成，最短耗时为 ${steps[steps.length - 1].bestCost}！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#evcharge-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: EV_CHARGE_CODE_LANGUAGES,
      problemHtml: EV_CHARGE_PROBLEM_HTML,
      analysisHtml: EV_CHARGE_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-evcharge-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-evcharge-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-evcharge-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.evcharge-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_4_CITIES_EV';
        this.root?.querySelectorAll('.evcharge-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-evcharge-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        EVAudio.isMuted = !EVAudio.isMuted;
        soundBtn.textContent = EVAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'ACTION_CHARGE') EVAudio.playCharge();
      else if (cur.type === 'ACTION_DRIVE') EVAudio.playDrive();
      else if (cur.type === 'REACH_GOAL' || cur.type === 'ALL_DONE') EVAudio.playVictory();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-evcharge-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停模拟';

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
    const playBtn = this.root?.querySelector('#btn-evcharge-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动模拟';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#evcharge-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#evcharge-status-badge') as HTMLElement | null;
    const batteryBadge = this.root.querySelector('#evcharge-battery-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = '🏁 到达目的地';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (batteryBadge) {
      batteryBadge.textContent = `当前城市: ${cur.curCity} | 电量: ${cur.curPower}/${this.maxPower} | 花费: ${cur.curCost}`;
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
      // 1. 绘制道路
      this.paths.forEach((p) => {
        const p1 = this.cityPositions[p.u];
        const p2 = this.cityPositions[p.v];
        if (!p1 || !p2) return;

        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // 道路距离标签
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - 6;
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText(`耗电${p.w}`, midX, midY);
        ctx.restore();
      });

      // 2. 绘制城市节点
      for (let i = 0; i < this.numCities; i++) {
        const pos = this.cityPositions[i];
        if (!pos) continue;

        const isCurCity = cur.curCity === i;

        ctx.save();
        let fillColor = '#1e293b';
        let strokeColor = i === this.startCity ? '#10b981' : i === this.endCity ? '#ec4899' : '#38bdf8';
        let radius = 16;

        if (isCurCity) {
          fillColor = '#854d0e';
          strokeColor = '#facc15';
          radius = 18 + Math.sin(this.pulseAnim) * 1.5;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 12;
        }

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`C${i}`, pos.x, pos.y);

        // 电价
        ctx.font = '9px sans-serif';
        ctx.fillStyle = '#facc15';
        ctx.fillText(`⚡$${this.chargeRates[i]}/格`, pos.x, pos.y + 24);

        ctx.restore();
      }

      // 3. 右侧电池 HUD 与优先队列
      ctx.save();
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('🔋 当前电池状态:', 270, 30);

      // 电池外壳
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(270, 42, 120, 24, 4);
      ctx.fill();
      ctx.stroke();

      // 电池电量条
      const fillW = (cur.curPower / this.maxPower) * 116;
      if (fillW > 0) {
        ctx.fillStyle = cur.curPower <= 1 ? '#ef4444' : '#10b981';
        ctx.beginPath();
        ctx.roundRect(272, 44, fillW, 20, 2);
        ctx.fill();
      }

      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(`${cur.curPower} / ${this.maxPower}`, 330, 58);

      // 优先队列
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'left';
      ctx.fillText('📥 优先队列 (状态堆):', 270, 95);

      const pqList = cur.pqSnapshot.slice(0, 4);
      pqList.forEach((item, idx) => {
        const itemY = 108 + idx * 22;
        ctx.font = '9.5px monospace';
        ctx.fillStyle = '#facc15';
        ctx.fillText(`(城${item.city}, 电${item.power}) => 花费: ${item.cost}`, 270, itemY);
      });

      ctx.restore();
    }

    ctx.restore();
  }
}

export const EV_CHARGE_TEMPLATE = `
  <div id="algo-ev-charge-dijkstra-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">⚡</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">电动车分层图最短路 (EV Charge Dijkstra)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="evcharge-preset-btn active" data-preset="CLASSIC_4_CITIES_EV" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">4 城市电价博弈图</button>
          <button class="evcharge-preset-btn" data-preset="TRIANGLE_CHEAP_CHARGER" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">3 城市捷径充电</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="evcharge-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-evcharge-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-evcharge-autoplay" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(2,132,199,0.25);">▶️ 自动模拟</button>
        <button id="btn-evcharge-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-evcharge-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #0369a1;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>🔋 电动车状态: <b id="evcharge-battery-badge" style="color: #0284c7; font-size: 12px;">电量: 0/4</b></span>
      </div>
      <div id="evcharge-narration-box" style="font-weight: 700; color: #075985;">
        💡 准备就绪：(u, power) 分层图状态空间，原地充电 + 道路行驶双决策！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：城市拓扑与电池 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="evcharge-canvas" width="460" height="200" style="width: 460px; height: 200px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          左侧为城市电价地图 | 🟡 金色高亮为当前车辆所在城市 | 右侧为动态电池 HUD 与状态优先队列
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="evcharge-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'ev-charge-dijkstra',
  name: '电动车分层图最短路 (EV Charge Plan)',
  viewId: 'algo-ev-charge-dijkstra-view',
  category: 'graph',
  description: '带电量约束的分层图 Dijkstra：(u, power) 状态空间、原地充电与道路行驶双转移决策 (左程云 Class064 Code05 / LeetCode LCP 35)',
  icon: '⚡',
  template: EV_CHARGE_TEMPLATE,
  Visualizer: EVChargeDijkstraVisualizer,
  difficulty: 3,
  levelOrder: 62,
  learningGoal: '掌握二维状态分层图建模、原地充电转移与道路放电转移松弛方程及优先队列 Dijkstra 最优性证明',
});
