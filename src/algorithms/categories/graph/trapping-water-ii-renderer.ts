/**
 * 接雨水 II 与三维木桶边界优先队列收缩 (Trapping Rain Water II 3D) 可视化引擎
 * 参考左程云《算法通关课》【必备篇】class062: 二维高度图、小根堆由外向内木桶短板收缩 (LeetCode 407)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  TRAPPING_WATER_II_CODE_LANGUAGES,
  TRAPPING_WATER_II_PROBLEM_HTML,
  TRAPPING_WATER_II_ANALYSIS_HTML,
} from './trapping-water-ii-problem-content';

export interface HeapCell {
  r: number;
  c: number;
  w: number;
}

export interface TrapStep {
  type: 'POP_MIN_PLANK' | 'EXPLORE_NEIGHBOR' | 'TRAP_WATER' | 'UPDATE_WATERLINE' | 'DONE';
  curR: number;
  curC: number;
  curW: number;
  targetR?: number;
  targetC?: number;
  targetHeight?: number;
  trappedWater?: number;
  totalTrapped: number;
  visitedSnapshot: boolean[][];
  waterLineSnapshot: number[][];
  heapSnapshot: HeapCell[];
  message: string;
}

class WaterAudio {
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

  public static playHeapPop(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {}
  }

  public static playWaterDrop(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  public static playWin(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      notes.forEach((freq, idx) => {
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

export class TrappingWaterIIVisualizer extends StepVisualizer<any> {
  // 网格与地形
  private heightMap: number[][] = [
    [1, 4, 3, 1, 3, 2],
    [3, 2, 1, 3, 2, 4],
    [2, 3, 3, 2, 3, 1],
  ];
  private rows = 3;
  private cols = 6;

  // 推演状态机
  private traceSteps: TrapStep[] = [];
  private currentStepPtr = 0;
  private isAutoPlaying = false;
  private autoPlayTimer: any = null;
  private playSpeed = 1;

  // 画布与动画
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private lastTimestamp = 0;
  private waterWaveAnim = 0;

  constructor() {
    super();
    this.codeLanguages = TRAPPING_WATER_II_CODE_LANGUAGES;
    this.codeLines = TRAPPING_WATER_II_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '三维接雨水小根堆收缩引擎 (LeetCode 407)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '接雨水 II 3D 木桶算法' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_BASIN');
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

    if (presetKey === 'CLASSIC_BASIN') {
      this.heightMap = [
        [1, 4, 3, 1, 3, 2],
        [3, 2, 1, 3, 2, 4],
        [2, 3, 3, 2, 3, 1],
      ];
    } else if (presetKey === 'CENTER_PIT') {
      this.heightMap = [
        [3, 3, 3, 3, 3],
        [3, 2, 2, 2, 3],
        [3, 2, 1, 2, 3],
        [3, 2, 2, 2, 3],
        [3, 3, 3, 3, 3],
      ];
    } else if (presetKey === 'TIERED_RESERVOIR') {
      this.heightMap = [
        [4, 4, 4, 4, 4, 4],
        [4, 1, 2, 2, 1, 4],
        [4, 2, 3, 3, 2, 4],
        [4, 2, 3, 3, 2, 4],
        [4, 1, 2, 2, 1, 4],
        [4, 4, 4, 4, 4, 4],
      ];
    } else if (presetKey === 'LEAKY_WALLS') {
      this.heightMap = [
        [5, 5, 1, 5, 5],
        [5, 2, 2, 2, 5],
        [5, 2, 1, 2, 5],
        [5, 2, 2, 2, 5],
        [5, 5, 5, 5, 5],
      ];
    }

    this.rows = this.heightMap.length;
    this.cols = this.heightMap[0].length;
    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const m = this.rows;
    const n = this.cols;
    const visited: boolean[][] = Array.from({ length: m }, () => Array(n).fill(false));
    const waterLine: number[][] = this.heightMap.map((row) => [...row]);
    const heap: HeapCell[] = [];

    // 1. 外围边界入堆
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (i === 0 || i === m - 1 || j === 0 || j === n - 1) {
          heap.push({ r: i, c: j, w: this.heightMap[i][j] });
          visited[i][j] = true;
        }
      }
    }

    const steps: TrapStep[] = [];
    const cloneVisited = () => visited.map((r) => [...r]);
    const cloneWaterLine = () => waterLine.map((r) => [...r]);
    const cloneHeap = (): HeapCell[] => heap.map((h) => ({ ...h }));

    let totalTrapped = 0;

    steps.push({
      type: 'POP_MIN_PLANK',
      curR: 0,
      curC: 0,
      curW: 0,
      totalTrapped: 0,
      visitedSnapshot: cloneVisited(),
      waterLineSnapshot: cloneWaterLine(),
      heapSnapshot: cloneHeap(),
      message: `🚀 初始化：四周 ${heap.length} 个边界格子作为木桶初始边框压入小根堆。`,
    });

    const dirs = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    while (heap.length > 0) {
      heap.sort((a, b) => a.w - b.w);
      const cur = heap.shift()!;
      const { r, c, w } = cur;

      steps.push({
        type: 'POP_MIN_PLANK',
        curR: r,
        curC: c,
        curW: w,
        totalTrapped,
        visitedSnapshot: cloneVisited(),
        waterLineSnapshot: cloneWaterLine(),
        heapSnapshot: cloneHeap(),
        message: `📥 弹出当前木桶最短板：坐标 (${r}, ${c})，水线高度 ${w}。`,
      });

      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < m && nc >= 0 && nc < n && !visited[nr][nc]) {
          visited[nr][nc] = true;
          const neighborH = this.heightMap[nr][nc];

          if (neighborH < w) {
            // 产生积水
            const trapped = w - neighborH;
            totalTrapped += trapped;
            waterLine[nr][nc] = w;

            steps.push({
              type: 'TRAP_WATER',
              curR: r,
              curC: c,
              curW: w,
              targetR: nr,
              targetC: nc,
              targetHeight: neighborH,
              trappedWater: trapped,
              totalTrapped,
              visitedSnapshot: cloneVisited(),
              waterLineSnapshot: cloneWaterLine(),
              heapSnapshot: cloneHeap(),
              message: `💧 [积水产生] 邻居 (${nr}, ${nc}) 原高度 ${neighborH} < 水线 ${w}：积水 +${trapped}！累计蓄水量: ${totalTrapped}。`,
            });
          } else {
            waterLine[nr][nc] = neighborH;
          }

          // 无论是否蓄水，新水线为 max(w, neighborH) 入堆
          const newW = Math.max(w, neighborH);
          heap.push({ r: nr, c: nc, w: newW });

          steps.push({
            type: 'UPDATE_WATERLINE',
            curR: r,
            curC: c,
            curW: w,
            targetR: nr,
            targetC: nc,
            targetHeight: neighborH,
            totalTrapped,
            visitedSnapshot: cloneVisited(),
            waterLineSnapshot: cloneWaterLine(),
            heapSnapshot: cloneHeap(),
            message: `🧱 邻居 (${nr}, ${nc}) 确立新水线高度 ${newW}，推入小根堆。`,
          });
        }
      }
    }

    steps.push({
      type: 'DONE',
      curR: 0,
      curC: 0,
      curW: 0,
      totalTrapped,
      visitedSnapshot: cloneVisited(),
      waterLineSnapshot: cloneWaterLine(),
      heapSnapshot: [],
      message: `🏁 三维木桶收缩完毕！该三维地形最多可接雨水体积: ${totalTrapped}！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#trapwater-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: TRAPPING_WATER_II_CODE_LANGUAGES,
      problemHtml: TRAPPING_WATER_II_PROBLEM_HTML,
      analysisHtml: TRAPPING_WATER_II_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-trapwater-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-trapwater-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-trapwater-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.trapwater-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_BASIN';
        this.root?.querySelectorAll('.trapwater-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-trapwater-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        WaterAudio.isMuted = !WaterAudio.isMuted;
        soundBtn.textContent = WaterAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'POP_MIN_PLANK') WaterAudio.playHeapPop();
      else if (cur.type === 'TRAP_WATER') WaterAudio.playWaterDrop();
      else if (cur.type === 'DONE') WaterAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-trapwater-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停推演';

    const step = () => {
      if (!this.isAutoPlaying) return;
      if (this.currentStepPtr < this.traceSteps.length - 1) {
        this.stepForward();
        this.autoPlayTimer = setTimeout(step, 700 / this.playSpeed);
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
    const playBtn = this.root?.querySelector('#btn-trapwater-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动推演';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#trapwater-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#trapwater-status-badge') as HTMLElement | null;
    const totalWaterStat = this.root.querySelector('#trapwater-total-stat') as HTMLElement | null;
    const heapContainer = this.root.querySelector('#trapwater-heap-container') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
      statusBadge.style.background = '#eff6ff';
      statusBadge.style.color = '#2563eb';
    }

    if (totalWaterStat) {
      totalWaterStat.textContent = `${cur.totalTrapped} 滴水`;
    }

    if (heapContainer) {
      if (cur.heapSnapshot.length === 0) {
        heapContainer.innerHTML = '<span style="font-size: 10.5px; color: #94a3b8;">小根堆为空</span>';
      } else {
        heapContainer.innerHTML = cur.heapSnapshot
          .slice(0, 10)
          .map((item, idx) => {
            const isTop = idx === 0;
            return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 2px 6px; border-radius: 4px; background: ${isTop ? '#eff6ff' : '#f8fafc'}; border: 1px solid ${isTop ? '#3b82f6' : '#cbd5e1'}; font-size: 10px; margin-bottom: 2px;">
              <span>${isTop ? '⭐ [短板] ' : ''}(${item.r}, ${item.c})</span>
              <span style="font-family: monospace; font-weight: bold; color: #2563eb;">水线: ${item.w}</span>
            </div>
          `;
          })
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

      this.waterWaveAnim += dt * 0.005;
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
    const m = this.rows;
    const n = this.cols;
    const cur = this.traceSteps[this.currentStepPtr];

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. 深渊夜色
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // 2. 2.5D 等角投影参数
    const originX = width / 2;
    const originY = 35;
    const tileW = Math.min(48, 380 / (m + n));
    const tileH = tileW * 0.52;
    const heightUnit = 12; // 每一单位高度的垂直像素

    // 绘制函数：从后向前 (r 从 0 到 m-1, c 从 0 到 n-1)
    for (let r = 0; r < m; r++) {
      for (let c = 0; c < n; c++) {
        // 计算等角屏幕坐标
        const isoX = originX + (c - r) * (tileW / 2);
        const isoY = originY + (c + r) * (tileH / 2);

        const groundH = this.heightMap[r][c];
        const curWaterLine = cur ? cur.waterLineSnapshot[r]?.[c] ?? groundH : groundH;
        const waterDepth = Math.max(0, curWaterLine - groundH);
        const isVisited = cur?.visitedSnapshot[r]?.[c];
        const isCurMin = cur && cur.curR === r && cur.curC === c;
        const isTarget = cur && cur.targetR === r && cur.targetC === c;

        const groundPixH = groundH * heightUnit;
        const waterPixH = waterDepth * heightUnit;

        // 绘制地面立柱 (从底座到地表)
        ctx.save();

        // 柱体底座 (灰色石块)
        ctx.fillStyle = isCurMin ? '#facc15' : isTarget ? '#38bdf8' : isVisited ? '#334155' : '#1e293b';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;

        // 顶面
        const topY = isoY - groundPixH;
        ctx.beginPath();
        ctx.moveTo(isoX, topY);
        ctx.lineTo(isoX + tileW / 2, topY + tileH / 2);
        ctx.lineTo(isoX, topY + tileH);
        ctx.lineTo(isoX - tileW / 2, topY + tileH / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 地面高度数字
        ctx.font = 'bold 9.5px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`H:${groundH}`, isoX, topY + tileH / 2);

        // 若有积水，在地面顶上绘制半透明水体立方体
        if (waterDepth > 0) {
          const waterTopY = topY - waterPixH;

          // 水体侧面
          ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.beginPath();
          ctx.moveTo(isoX - tileW / 2, topY + tileH / 2);
          ctx.lineTo(isoX, topY + tileH);
          ctx.lineTo(isoX, waterTopY + tileH);
          ctx.lineTo(isoX - tileW / 2, waterTopY + tileH / 2);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = 'rgba(14, 165, 233, 0.45)';
          ctx.beginPath();
          ctx.moveTo(isoX, topY + tileH);
          ctx.lineTo(isoX + tileW / 2, topY + tileH / 2);
          ctx.lineTo(isoX + tileW / 2, waterTopY + tileH / 2);
          ctx.lineTo(isoX, waterTopY + tileH);
          ctx.closePath();
          ctx.fill();

          // 水体顶面 (波动波光)
          ctx.fillStyle = 'rgba(56, 189, 248, 0.65)';
          ctx.strokeStyle = '#7dd3fc';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(isoX, waterTopY);
          ctx.lineTo(isoX + tileW / 2, waterTopY + tileH / 2);
          ctx.lineTo(isoX, waterTopY + tileH);
          ctx.lineTo(isoX - tileW / 2, waterTopY + tileH / 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // 水深文字
          ctx.font = 'bold 9.5px monospace';
          ctx.fillStyle = '#082f49';
          ctx.fillText(`+${waterDepth}💧`, isoX, waterTopY + tileH / 2);
        }

        ctx.restore();
      }
    }

    ctx.restore();
  }
}

export const TRAPPING_WATER_II_TEMPLATE = `
  <div id="algo-trapping-water-ii-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🌊</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">接雨水 II (Trapping Rain Water II 3D)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="trapwater-preset-btn active" data-preset="CLASSIC_BASIN" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典盆地 (3x6)</button>
          <button class="trapwater-preset-btn" data-preset="CENTER_PIT" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">中央深坑 (5x5)</button>
          <button class="trapwater-preset-btn" data-preset="TIERED_RESERVOIR" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">阶梯水库 (6x6)</button>
          <button class="trapwater-preset-btn" data-preset="LEAKY_WALLS" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">豁口外泄地形</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="trapwater-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-trapwater-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-trapwater-autoplay" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(59,130,246,0.25);">▶️ 自动推演</button>
        <button id="btn-trapwater-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-trapwater-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #1e40af;">
      <div style="display: flex; gap: 14px; align-items: center;">
        <span>💧 累计接雨水体积: <b id="trapwater-total-stat" style="color: #2563eb; font-size: 13px;">0 滴水</b></span>
      </div>
      <div id="trapwater-narration-box" style="font-weight: 700; color: #1e3a8a;">
        💡 准备就绪：观察小根堆维护的木桶最短板由外向内收缩与蓄水！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：3D 等角 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="trapwater-canvas" width="460" height="230" style="width: 460px; height: 230px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🟡 金色代表当前木桶最短板 | 💧 蓝色半透明层为该单元格积水量
        </div>
      </div>

      <!-- 右侧：小根堆列表与代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; max-height: 100px; display: flex; flex-direction: column; gap: 2px;">
          <div style="font-size: 10.5px; font-weight: 700; color: #0f172a;">⚡ 木桶边界小根堆 (按水线高度升序):</div>
          <div id="trapwater-heap-container" style="display: flex; flex-direction: column; overflow-y: auto;"></div>
        </div>

        <div id="trapwater-terminal-mount" style="flex: 1; min-height: 180px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'trapping-water-ii',
  name: '接雨水 II (Trapping Rain Water II)',
  viewId: 'algo-trapping-water-ii-view',
  category: 'graph',
  description: '三维接雨水算法：左程云 class062 二维高度图 (LeetCode 407)、木桶短板理论、小根堆由外向内收缩与水线等角可视化',
  icon: '🌊',
  template: TRAPPING_WATER_II_TEMPLATE,
  Visualizer: TrappingWaterIIVisualizer,
  difficulty: 3,
  levelOrder: 25,
  learningGoal: '掌握木桶短板理论在三维网格中的扩展、优先队列由外向内收缩与水线高度更新状态机',
});
