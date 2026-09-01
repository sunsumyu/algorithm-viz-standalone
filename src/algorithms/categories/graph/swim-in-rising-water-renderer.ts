/**
 * 水位上升的泳池中游泳 (Swim In Rising Water - LeetCode 778) 可视化引擎
 * 左程云《算法通关课》Class 064 Code03
 * 核心：网格图瓶颈最短路、max(curTime, grid[nr][nc]) 松弛、Dijkstra 小根堆
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  SWIM_IN_RISING_WATER_CODE_LANGUAGES,
  SWIM_IN_RISING_WATER_PROBLEM_HTML,
  SWIM_IN_RISING_WATER_ANALYSIS_HTML,
} from './swim-in-rising-water-problem-content';

export interface SwimStep {
  type: 'POP_CELL' | 'RELAX_NEIGHBOR' | 'REACH_TARGET' | 'ALL_DONE';
  curR: number;
  curC: number;
  curWaterLevel: number;
  distGrid: number[][];
  visitedGrid: boolean[][];
  pqSnapshot: Array<{ r: number; c: number; t: number }>;
  bestPath?: Array<{ r: number; c: number }>;
  message: string;
}

class SwimAudio {
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

  public static playSplash(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  public static playPop(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
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

export class SwimInRisingWaterVisualizer extends StepVisualizer<any> {
  private gridMatrix: number[][] = [
    [0, 2, 1, 3, 4],
    [10, 11, 14, 12, 5],
    [23, 22, 21, 15, 16],
    [18, 17, 19, 20, 24],
    [9, 8, 7, 6, 13],
  ];

  // 推演步骤
  private traceSteps: SwimStep[] = [];
  private currentStepPtr = 0;
  private isAutoPlaying = false;
  private autoPlayTimer: any = null;
  private playSpeed = 1;

  // 画布与动画
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private lastTimestamp = 0;
  private waveAnim = 0;

  constructor() {
    super();
    this.codeLanguages = SWIM_IN_RISING_WATER_CODE_LANGUAGES;
    this.codeLines = SWIM_IN_RISING_WATER_CODE_LANGUAGES['java'] || [];
    this.codePanelTitle = '水位上升泳池 Dijkstra 瓶颈最短路引擎 (LeetCode 778)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '水位上升的泳池中游泳' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('LEETCODE_5X5');
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
    if (presetKey === 'LEETCODE_5X5') {
      this.gridMatrix = [
        [0, 2, 1, 3, 4],
        [10, 11, 14, 12, 5],
        [23, 22, 21, 15, 16],
        [18, 17, 19, 20, 24],
        [9, 8, 7, 6, 13],
      ];
    } else if (presetKey === 'SIMPLE_3X3') {
      this.gridMatrix = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
      ];
    } else {
      this.gridMatrix = [
        [0, 3, 2, 1],
        [12, 13, 14, 4],
        [11, 15, 10, 5],
        [9, 8, 7, 6],
      ];
    }
    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const steps: SwimStep[] = [];
    const grid = this.gridMatrix;
    const n = grid.length;
    const m = grid[0].length;

    const dist: number[][] = Array.from({ length: n }, () => Array(m).fill(Infinity));
    const visited: boolean[][] = Array.from({ length: n }, () => Array(m).fill(false));
    const parent: Record<string, { r: number; c: number }> = {};

    dist[0][0] = grid[0][0];
    const pq: Array<{ r: number; c: number; t: number }> = [{ r: 0, c: 0, t: grid[0][0] }];

    const dr = [-1, 0, 1, 0];
    const dc = [0, 1, 0, -1];

    let foundTarget = false;

    while (pq.length > 0) {
      pq.sort((a, b) => a.t - b.t);
      const top = pq.shift()!;
      const { r, c, t } = top;

      if (visited[r][c]) continue;
      visited[r][c] = true;

      // 记录弹出状态
      steps.push({
        type: 'POP_CELL',
        curR: r,
        curC: c,
        curWaterLevel: t,
        distGrid: dist.map((row) => [...row]),
        visitedGrid: visited.map((row) => [...row]),
        pqSnapshot: pq.map((item) => ({ ...item })),
        message: `🏊 [弹出水位最低前沿] 从小根堆弹出平台 (${r}, ${c})，平台高度 = ${grid[r][c]}，所需最少水位 t = ${t}！`,
      });

      if (r === n - 1 && c === m - 1) {
        foundTarget = true;
        // 回溯最优路径
        const bestPath: Array<{ r: number; c: number }> = [];
        let curr = { r, c };
        while (curr) {
          bestPath.push(curr);
          if (curr.r === 0 && curr.c === 0) break;
          curr = parent[`${curr.r},${curr.c}`];
        }
        bestPath.reverse();

        steps.push({
          type: 'REACH_TARGET',
          curR: r,
          curC: c,
          curWaterLevel: t,
          distGrid: dist.map((row) => [...row]),
          visitedGrid: visited.map((row) => [...row]),
          pqSnapshot: [],
          bestPath,
          message: `🎉 [成功抵达终点 (${n - 1}, ${m - 1})] 小根堆首次弹出右下角平台，最少需要等待水位上升至 t = ${t}！`,
        });
        break;
      }

      // 松弛相邻 4 个方向
      for (let i = 0; i < 4; ++i) {
        const nr = r + dr[i];
        const nc = c + dc[i];
        if (nr >= 0 && nr < n && nc >= 0 && nc < m && !visited[nr][nc]) {
          const nextTime = Math.max(t, grid[nr][nc]);
          if (nextTime < dist[nr][nc]) {
            dist[nr][nc] = nextTime;
            parent[`${nr},${nc}`] = { r, c };
            pq.push({ r: nr, c: nc, t: nextTime });

            steps.push({
              type: 'RELAX_NEIGHBOR',
              curR: nr,
              curC: nc,
              curWaterLevel: nextTime,
              distGrid: dist.map((row) => [...row]),
              visitedGrid: visited.map((row) => [...row]),
              pqSnapshot: pq.map((item) => ({ ...item })),
              message: `🌊 [水位松弛] 探索邻居 (${nr}, ${nc})，平台高度 ${grid[nr][nc]}，瓶颈水位 max(${t}, ${grid[nr][nc]}) = ${nextTime}，加入优先队列！`,
            });
          }
        }
      }
    }

    if (!foundTarget) {
      steps.push({
        type: 'ALL_DONE',
        curR: 0,
        curC: 0,
        curWaterLevel: 0,
        distGrid: dist.map((row) => [...row]),
        visitedGrid: visited.map((row) => [...row]),
        pqSnapshot: [],
        message: '无法到达终点！',
      });
    }

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#swim-rising-water-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: SWIM_IN_RISING_WATER_CODE_LANGUAGES,
      problemHtml: SWIM_IN_RISING_WATER_PROBLEM_HTML,
      analysisHtml: SWIM_IN_RISING_WATER_ANALYSIS_HTML,
      initialLang: 'java',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-swim-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-swim-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-swim-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.swim-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'LEETCODE_5X5';
        this.root?.querySelectorAll('.swim-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-swim-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        SwimAudio.isMuted = !SwimAudio.isMuted;
        soundBtn.textContent = SwimAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'POP_CELL') SwimAudio.playPop();
      else if (cur.type === 'RELAX_NEIGHBOR') SwimAudio.playSplash();
      else if (cur.type === 'REACH_TARGET') SwimAudio.playVictory();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-swim-autoplay') as HTMLButtonElement | null;
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
    const playBtn = this.root?.querySelector('#btn-swim-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动模拟';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#swim-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#swim-status-badge') as HTMLElement | null;
    const waterBadge = this.root.querySelector('#swim-water-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'REACH_TARGET') {
        statusBadge.textContent = '🏁 到达终点';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (waterBadge) {
      waterBadge.textContent = `当前水位 t = ${cur.curWaterLevel} | 当前探索位置: (${cur.curR}, ${cur.curC})`;
    }
  }

  private startLoop(): void {
    if (typeof requestAnimationFrame !== 'function') return;
    const loop = (timestamp: number) => {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const dt = Math.min(32, timestamp - this.lastTimestamp);
      this.lastTimestamp = timestamp;

      this.waveAnim += dt * 0.005;
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
      const grid = this.gridMatrix;
      const n = grid.length;
      const m = grid[0].length;

      const cellSize = Math.min(36, Math.floor(180 / Math.max(n, m)));
      const startX = 25;
      const startY = 25;

      // 1. 绘制网格方块与淹没水波
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < m; c++) {
          const x = startX + c * (cellSize + 4);
          const y = startY + r * (cellSize + 4);
          const val = grid[r][c];
          const isVisited = cur.visitedGrid[r]?.[c] ?? false;
          const isCur = cur.curR === r && cur.curC === c;
          const isSubmerged = val <= cur.curWaterLevel;
          const isPath = cur.bestPath?.some((p) => p.r === r && p.c === c) ?? false;

          ctx.save();

          // 底色
          let bgColor = '#1e293b';
          let borderColor = '#334155';

          if (isPath) {
            bgColor = '#065f46';
            borderColor = '#10b981';
          } else if (isCur) {
            bgColor = '#854d0e';
            borderColor = '#facc15';
          } else if (isVisited) {
            bgColor = '#1e3a8a';
            borderColor = '#38bdf8';
          } else if (isSubmerged) {
            bgColor = '#0369a1';
            borderColor = '#38bdf8';
          }

          ctx.fillStyle = bgColor;
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = isCur || isPath ? 2.5 : 1;

          ctx.beginPath();
          ctx.roundRect(x, y, cellSize, cellSize, 4);
          ctx.fill();
          ctx.stroke();

          // 淹没水纹流动动画
          if (isSubmerged) {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
            const waveH = Math.sin(this.waveAnim + (r + c) * 0.8) * 2;
            ctx.fillRect(x + 2, y + cellSize / 2 + waveH, cellSize - 4, cellSize / 2 - waveH - 2);
          }

          // 平台高度与数字
          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${val}`, x + cellSize / 2, y + cellSize / 2);

          // 起点与终点标识
          if (r === 0 && c === 0) {
            ctx.font = 'bold 8px sans-serif';
            ctx.fillStyle = '#fde047';
            ctx.fillText('START', x + cellSize / 2, y + 6);
          } else if (r === n - 1 && c === m - 1) {
            ctx.font = 'bold 8px sans-serif';
            ctx.fillStyle = '#34d399';
            ctx.fillText('END', x + cellSize / 2, y + 6);
          }

          ctx.restore();
        }
      }

      // 2. 右侧优先队列与当前状态 HUD
      ctx.save();
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('📦 Dijkstra 小根堆状态 [(r, c, 水位t)]:', 245, 26);

      const pqItems = cur.pqSnapshot.slice(0, 5);
      pqItems.forEach((item, idx) => {
        const itemY = 38 + idx * 22;
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.roundRect(245, itemY, 195, 18, 3);
        ctx.fill();
        ctx.stroke();

        ctx.font = '10px monospace';
        ctx.fillStyle = '#fde047';
        ctx.textAlign = 'left';
        ctx.fillText(`Top#${idx}: 格子(${item.r}, ${item.c}) ➔ 水位 t = ${item.t}`, 252, itemY + 13);
      });

      // 核心算法卡片
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(245, 155, 195, 52, 4);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 10.5px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('👑 瓶颈最短路转移:', 255, 172);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#34d399';
      ctx.fillText('nextTime = max(curT, height)', 255, 192);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const SWIM_IN_RISING_WATER_TEMPLATE = `
  <div id="algo-swim-in-rising-water-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🏊</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">水位上升的泳池中游泳 (Swim in Rising Water - LC 778)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="swim-preset-btn active" data-preset="LEETCODE_5X5" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典 5x5</button>
          <button class="swim-preset-btn" data-preset="SIMPLE_3X3" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">基础 3x3</button>
          <button class="swim-preset-btn" data-preset="CLIFF_4X4" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">断崖 4x4</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="swim-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-swim-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-swim-autoplay" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(2,132,199,0.25);">▶️ 自动模拟</button>
        <button id="btn-swim-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-swim-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #0369a1;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>🌊 水位指标: <b id="swim-water-badge" style="color: #0284c7; font-size: 12px;">当前水位 t = 0</b></span>
      </div>
      <div id="swim-narration-box" style="font-weight: 700; color: #075985;">
        💡 准备就绪：从 (0,0) 出发，Dijkstra 小根堆贪心探索水位最低连通前沿，首次弹出 (n-1,m-1) 即为最少耗时！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：泳池高程矩阵与淹没水纹 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="swim-rising-water-canvas" width="460" height="220" style="width: 460px; height: 220px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          左侧为泳池高程网格 (🌊 水波覆盖表示已被淹没，🟢 绿色为到达终点的全局最优路径) | 右侧为优先队列
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="swim-water-terminal-mount" data-code-terminal style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'swim-in-rising-water',
  name: '水位上升的泳池中游泳 (Swim in Rising Water)',
  viewId: 'algo-swim-in-rising-water-view',
  category: 'graph',
  description: '左程云算法通关课 Class 064 Code03：网格图瓶颈最短路、max(t, grid[nr][nc]) 松弛、Dijkstra 小根堆 (LeetCode 778)',
  icon: '🏊',
  template: SWIM_IN_RISING_WATER_TEMPLATE,
  Visualizer: SwimInRisingWaterVisualizer,
  difficulty: 3,
  levelOrder: 76,
  learningGoal: '掌握瓶颈最短路模型转化、网格图 Dijkstra 小根堆松弛技巧与二分+BFS/并查集等价判定',
});
