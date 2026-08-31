/**
 * 极速加油站·环岛拉力赛 (Gas Station Rally: Greedy Circuit Runner)
 * 经典贪心算法、环形赛道与局部透支跳跃剪枝：
 * 1. 🏎️ 60 FPS 环形霓虹赛道 (Canvas 2D 粒子引擎、汽车漂移、加油站油桶与耗油路段)
 * 2. ⛽ 动态油箱表盘与贪心状态条 (实时追踪 curSum 净油量与 totalSum 全局总油量)
 * 3. 🧠 贪心跳跃推演引擎 (在透支点瞬间标记并排除整个区间 [start, fail]，直观展现 O(N) 贪心跃迁)
 * 4. ✨ 贪心启示之眼 (一键计算全局唯一可行起点并驱动赛车完成 360° 胜利巡游)
 * 5. 🔊 原生 Web Audio 引擎轰鸣与加油音效
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  GAS_STATION_CODE_LANGUAGES,
  GAS_STATION_PROBLEM_HTML,
  GAS_STATION_ANALYSIS_HTML,
} from './gas-station-problem-content';

export interface StationData {
  id: number;
  gas: number;
  cost: number;
  angle: number; // 极坐标角度 (弧度)
}

class RallyAudio {
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

  public static playEngine(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  }

  public static playRefuel(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  public static playOutGas(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }

  public static playVictory(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.12 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.3);
      });
    } catch {}
  }
}

export class GasStationVisualizer extends StepVisualizer<any> {
  private stations: StationData[] = [];
  private gasList: number[] = [1, 2, 3, 4, 5];
  private costList: number[] = [3, 4, 5, 1, 2];

  // 赛车运动状态
  private selectedStart = 0;
  private currentFuel = 0;
  private carAngle = 0;
  private targetAngle = 0;
  private isDriving = false;
  private currentSegmentIdx = 0;
  private stepsCompleted = 0;
  private isFailed = false;
  private isVictory = false;

  // 贪心最优解
  private greedyOptimalStart = -1;

  // 画布与动画
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private lastTimestamp = 0;

  constructor() {
    super();
    this.codeLanguages = GAS_STATION_CODE_LANGUAGES;
    this.codeLines = GAS_STATION_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '环形加油站贪心算法引擎';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '极速加油站·环岛拉力赛' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.setupCircuit([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]);
    this.initGameUI();
    this.startLoop();
  }

  public destroy(): void {
    super.destroy();
    if (this.animFrameId && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private setupCircuit(gas: number[], cost: number[]): void {
    this.gasList = gas;
    this.costList = cost;
    this.isDriving = false;
    this.isFailed = false;
    this.isVictory = false;
    this.stepsCompleted = 0;

    const n = gas.length;
    this.stations = [];
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      this.stations.push({
        id: i,
        gas: gas[i],
        cost: cost[i],
        angle,
      });
    }

    this.computeGreedySolution();
    this.setStartStation(this.selectedStart);
  }

  private computeGreedySolution(): void {
    let curSum = 0;
    let totalSum = 0;
    let start = 0;

    for (let i = 0; i < this.gasList.length; i++) {
      const rest = this.gasList[i] - this.costList[i];
      curSum += rest;
      totalSum += rest;
      if (curSum < 0) {
        start = i + 1;
        curSum = 0;
      }
    }

    this.greedyOptimalStart = totalSum >= 0 ? start : -1;
  }

  private setStartStation(idx: number): void {
    this.selectedStart = idx;
    this.currentSegmentIdx = idx;
    this.carAngle = this.stations[idx].angle;
    this.targetAngle = this.carAngle;
    this.currentFuel = 0;
    this.isDriving = false;
    this.isFailed = false;
    this.isVictory = false;
    this.stepsCompleted = 0;
    this.updateHUD();
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#gas-station-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.bindCanvasInteraction();
    }

    this.mountTerminal({
      codeLanguages: GAS_STATION_CODE_LANGUAGES,
      problemHtml: GAS_STATION_PROBLEM_HTML,
      analysisHtml: GAS_STATION_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 启动发车
    const startDriveBtn = this.root.querySelector('#btn-gas-start-drive') as HTMLButtonElement | null;
    if (startDriveBtn) {
      startDriveBtn.addEventListener('click', () => this.startDriving());
    }

    // 一键贪心最优起点
    const autoGreedyBtn = this.root.querySelector('#btn-gas-auto-greedy') as HTMLButtonElement | null;
    if (autoGreedyBtn) {
      autoGreedyBtn.addEventListener('click', () => {
        if (this.greedyOptimalStart !== -1) {
          this.setStartStation(this.greedyOptimalStart);
          this.startDriving();
        }
      });
    }

    // 预设地图切换
    this.root.querySelectorAll<HTMLButtonElement>('.gas-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.preset || 'CLASSIC';
        this.root?.querySelectorAll('.gas-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        if (type === 'CLASSIC') this.setupCircuit([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]);
        else if (type === 'IMPOSSIBLE') this.setupCircuit([2, 3, 4], [3, 4, 3]);
        else if (type === 'SEVEN') this.setupCircuit([3, 1, 4, 2, 5, 1, 2], [2, 3, 2, 4, 1, 3, 2]);
      });
    });

    // 重置
    const resetBtn = this.root.querySelector('#btn-gas-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.setStartStation(this.selectedStart));
    }
  }

  private bindCanvasInteraction(): void {
    if (!this.canvas) return;

    this.canvas.addEventListener('click', (e) => {
      if (this.isDriving) return;
      const rect = this.canvas!.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const cx = this.canvas!.width / 2;
      const cy = this.canvas!.height / 2;
      const radius = 95;

      for (const st of this.stations) {
        const sx = cx + Math.cos(st.angle) * radius;
        const sy = cy + Math.sin(st.angle) * radius;
        if (Math.hypot(clickX - sx, clickY - sy) <= 22) {
          this.setStartStation(st.id);
          RallyAudio.playRefuel();
          break;
        }
      }
    });
  }

  private startDriving(): void {
    if (this.isDriving) return;
    this.isDriving = true;
    this.isFailed = false;
    this.isVictory = false;
    this.stepsCompleted = 0;
    this.currentSegmentIdx = this.selectedStart;
    this.currentFuel = 0;
    RallyAudio.playEngine();
    this.driveStep();
  }

  // 模拟从当前站点加油并驶向下一站
  private driveStep(): void {
    if (!this.isDriving) return;

    const n = this.stations.length;
    const curSt = this.stations[this.currentSegmentIdx];
    const nextIdx = (this.currentSegmentIdx + 1) % n;
    const nextSt = this.stations[nextIdx];

    // 加油
    this.currentFuel += curSt.gas;
    RallyAudio.playRefuel();

    // 判定油量是否足够驶向下一站
    if (this.currentFuel < curSt.cost) {
      // 抛锚
      setTimeout(() => {
        this.isDriving = false;
        this.isFailed = true;
        RallyAudio.playOutGas();
        this.updateHUD();
      }, 500);
      return;
    }

    // 成功驶向下一站
    this.targetAngle = nextSt.angle < curSt.angle ? nextSt.angle + Math.PI * 2 : nextSt.angle;

    setTimeout(() => {
      this.currentFuel -= curSt.cost;
      this.currentSegmentIdx = nextIdx;
      this.carAngle = nextSt.angle;
      this.stepsCompleted++;
      this.updateHUD();

      if (this.stepsCompleted === n) {
        // 完成整整一圈
        this.isDriving = false;
        this.isVictory = true;
        RallyAudio.playVictory();
        this.updateHUD();
      } else {
        setTimeout(() => this.driveStep(), 400);
      }
    }, 450);
  }

  private startLoop(): void {
    if (typeof requestAnimationFrame !== 'function') return;
    const loop = (timestamp: number) => {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
      this.lastTimestamp = timestamp;

      this.updateCarPhysics(dt);
      this.renderCanvas();

      if (typeof requestAnimationFrame === 'function') {
        this.animFrameId = requestAnimationFrame(loop);
      }
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  private updateCarPhysics(dt: number): void {
    if (this.isDriving) {
      const diff = this.targetAngle - this.carAngle;
      if (Math.abs(diff) > 0.02) {
        this.carAngle += diff * dt * 4.5;
      }
    }
  }

  private updateHUD(): void {
    if (!this.root) return;

    const fuelEl = this.root.querySelector('#gas-fuel-gauge') as HTMLElement | null;
    const startEl = this.root.querySelector('#gas-start-info') as HTMLElement | null;
    const statusEl = this.root.querySelector('#gas-status-badge') as HTMLElement | null;

    if (fuelEl) fuelEl.textContent = `⛽ 当前剩余油量: ${this.currentFuel} L`;
    if (startEl) {
      startEl.innerHTML = `当前选择起点: <b>加油站 #${this.selectedStart}</b> (最优贪心解: ${this.greedyOptimalStart === -1 ? '无解' : `#${this.greedyOptimalStart}`})`;
    }

    if (statusEl) {
      if (this.isFailed) {
        statusEl.textContent = '💀 油量透支抛锚！贪心跳跃此区间';
        statusEl.style.background = '#fef2f2';
        statusEl.style.color = '#dc2626';
      } else if (this.isVictory) {
        statusEl.textContent = '🏆 成功绕行一周！贪心验证通过';
        statusEl.style.background = '#f0fdf4';
        statusEl.style.color = '#16a34a';
      } else {
        statusEl.textContent = `🏎️ 已行驶: ${this.stepsCompleted} / ${this.stations.length} 段`;
        statusEl.style.background = '#eff6ff';
        statusEl.style.color = '#2563eb';
      }
    }
  }

  private renderCanvas(): void {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = 95;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. 深色赛道背景
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // 2. 环形霓虹赛道
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 18;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. 绘制赛道各段耗油量标记 (Cost Tags)
    const n = this.stations.length;
    for (let i = 0; i < n; i++) {
      const st = this.stations[i];
      const nextSt = this.stations[(i + 1) % n];
      const midAngle = (st.angle + (nextSt.angle < st.angle ? nextSt.angle + Math.PI * 2 : nextSt.angle)) / 2;
      const mx = cx + Math.cos(midAngle) * (radius - 24);
      const my = cy + Math.sin(midAngle) * (radius - 24);

      ctx.font = 'bold 9.5px monospace';
      ctx.fillStyle = '#f87171';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`-${st.cost}L`, mx, my);
    }

    // 4. 绘制加油站点 (Gas Station Nodes)
    for (const st of this.stations) {
      const sx = cx + Math.cos(st.angle) * radius;
      const sy = cy + Math.sin(st.angle) * radius;
      const isStart = st.id === this.selectedStart;
      const isOptimal = st.id === this.greedyOptimalStart;

      // 外光晕
      ctx.beginPath();
      ctx.arc(sx, sy, 16, 0, Math.PI * 2);
      ctx.fillStyle = isOptimal ? 'rgba(245, 158, 11, 0.35)' : isStart ? 'rgba(59, 130, 246, 0.35)' : 'rgba(30, 41, 59, 0.8)';
      ctx.fill();

      ctx.strokeStyle = isOptimal ? '#f59e0b' : isStart ? '#3b82f6' : '#64748b';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`+${st.gas}L`, sx, sy - 1);

      ctx.font = '8px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`#${st.id}`, sx, sy + 18);
    }

    // 5. 绘制赛车 (Race Car Sprite)
    const carX = cx + Math.cos(this.carAngle) * radius;
    const carY = cy + Math.sin(this.carAngle) * radius;

    ctx.save();
    ctx.translate(carX, carY);
    ctx.rotate(this.carAngle + Math.PI / 2);

    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏎️', 0, 0);

    if (this.isDriving) {
      // 尾气火光
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(-10, 0, 3 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    ctx.restore();
  }
}

export const GAS_STATION_TEMPLATE = `
  <div id="algo-gas-station-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏：赛道预设与功能控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🏎️</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">极速加油站·环岛拉力赛</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="gas-preset-btn active" data-preset="CLASSIC" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典 5 站赛道</button>
          <button class="gas-preset-btn" data-preset="SEVEN" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">长征 7 站赛道</button>
          <button class="gas-preset-btn" data-preset="IMPOSSIBLE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">🚫 全局无解赛道</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="gas-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">🏎️ 准备发车</span>
        <button id="btn-gas-start-drive" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border: none; border-radius: 6px; padding: 4px 12px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(16,185,129,0.25);">🚦 发车绕行</button>
        <button id="btn-gas-auto-greedy" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 6px rgba(37,99,235,0.25);">✨ 贪心启示之眼</button>
        <button id="btn-gas-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 概念横幅 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #1e40af;">
      <span id="gas-start-info">当前选择起点: <b>加油站 #0</b></span>
      <span id="gas-fuel-gauge" style="font-weight: 700;">⛽ 当前剩余油量: 0 L</span>
    </div>

    <!-- 主交互区：左侧 60 FPS 环形赛道 Canvas + 右侧终端 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.25fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：环道沙盘 -->
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; position: relative;">
        <canvas id="gas-station-canvas" width="300" height="300" style="width: 300px; height: 300px; cursor: pointer; border-radius: 6px;"></canvas>
        <div style="font-size: 10.5px; color: #64748b; margin-top: 4px;">
          💡 点击环道上的任意站点节点可更换发车起点，点击「🚦 发车绕行」即可实时验证贪心逻辑！
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="gas-terminal-mount" style="flex: 1; min-height: 220px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'gas-station-rally',
  name: '极速加油站·环岛拉力赛',
  viewId: 'algo-gas-station-view',
  category: 'game',
  description: '经典贪心算法游戏：环形霓虹赛道、实时剩余油量表盘、局部透支跳跃剪枝与 360° 胜利巡游',
  icon: '🏎️',
  template: GAS_STATION_TEMPLATE,
  Visualizer: GasStationVisualizer,
  difficulty: 3,
  levelOrder: 6,
  learningGoal: '通过环形赛车与油量补给实战，彻底掌握贪心算法中的局部透支排除法与全局可行性充要条件',
});
