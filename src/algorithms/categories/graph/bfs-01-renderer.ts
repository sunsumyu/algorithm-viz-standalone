/**
 * 0-1 BFS 双端队列最短路 (0-1 BFS Deque Shortest Path) 可视化引擎
 * 参考左程云《算法通关课》【必备篇】class062: 0-1 BFS 与双端队列保证单调性
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  BFS_01_CODE_LANGUAGES,
  BFS_01_PROBLEM_HTML,
  BFS_01_ANALYSIS_HTML,
} from './bfs-01-problem-content';

export interface DequeItem {
  r: number;
  c: number;
  dist: number;
  action?: 'HEAD' | 'TAIL' | 'POPPED';
}

export interface BFSStep {
  type: 'POP_FRONT' | 'RELAX_ZERO' | 'RELAX_ONE' | 'FOUND_TARGET' | 'DONE';
  r: number;
  c: number;
  dist: number;
  toR?: number;
  toC?: number;
  weight?: number;
  newDist?: number;
  distSnapshot: number[][];
  visitedSnapshot: boolean[][];
  dequeSnapshot: DequeItem[];
  pathSnapshot: Array<[number, number]>;
  message: string;
}

class DequeAudio {
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
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playPushFront(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  public static playPushBack(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
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
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.3);
      });
    } catch {}
  }
}

export class BFS01Visualizer extends StepVisualizer<any> {
  // 网格与状态
  private grid: number[][] = [
    [0, 1, 1, 0, 0, 0],
    [0, 1, 0, 1, 1, 0],
    [0, 1, 0, 0, 1, 0],
    [0, 0, 1, 0, 1, 0],
    [1, 0, 0, 0, 0, 0],
  ];
  private rows = 5;
  private cols = 6;

  // 单步推演状态
  private traceSteps: BFSStep[] = [];
  private currentStepPtr = 0;
  private isAutoPlaying = false;
  private autoPlayTimer: any = null;
  private playSpeed = 1;

  // 画布渲染
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private lastTimestamp = 0;
  private pulsePhase = 0;

  constructor() {
    super();
    this.codeLanguages = BFS_01_CODE_LANGUAGES;
    this.codeLines = BFS_01_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '0-1 BFS 双端队列算法引擎 (LeetCode 2290)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '0-1 BFS 双端队列最短路' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC');
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

    if (presetKey === 'CLASSIC') {
      this.grid = [
        [0, 1, 1, 0, 0, 0],
        [0, 1, 0, 1, 1, 0],
        [0, 1, 0, 0, 1, 0],
        [0, 0, 1, 0, 1, 0],
        [1, 0, 0, 0, 0, 0],
      ];
    } else if (presetKey === 'MAZE_CORRIDOR') {
      this.grid = [
        [0, 0, 1, 0, 0, 0, 0],
        [1, 0, 1, 0, 1, 1, 0],
        [1, 0, 0, 0, 1, 0, 0],
        [1, 1, 1, 0, 1, 0, 1],
        [0, 0, 0, 0, 1, 0, 0],
      ];
    } else if (presetKey === 'HEAVY_WALLS') {
      this.grid = [
        [0, 1, 1, 1, 1],
        [1, 1, 0, 1, 1],
        [1, 0, 1, 0, 1],
        [1, 1, 0, 1, 1],
        [1, 1, 1, 1, 0],
      ];
    } else if (presetKey === 'FREE_RUN') {
      this.grid = [
        [0, 0, 0, 0, 1],
        [1, 1, 1, 0, 0],
        [0, 0, 0, 0, 1],
        [0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0],
      ];
    } else if (presetKey === 'RANDOM') {
      this.generateRandomGrid(5, 6);
    }

    this.rows = this.grid.length;
    this.cols = this.grid[0].length;
    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private generateRandomGrid(m: number, n: number): void {
    const newGrid: number[][] = [];
    for (let r = 0; r < m; r++) {
      const row: number[] = [];
      for (let c = 0; c < n; c++) {
        if ((r === 0 && c === 0) || (r === m - 1 && c === n - 1)) {
          row.push(0);
        } else {
          row.push(Math.random() < 0.35 ? 1 : 0);
        }
      }
      newGrid.push(row);
    }
    this.grid = newGrid;
  }

  private computeTraceSteps(): void {
    const m = this.rows;
    const n = this.cols;
    const INF = 999999;

    const dist: number[][] = Array.from({ length: m }, () => Array(n).fill(INF));
    const visited: boolean[][] = Array.from({ length: m }, () => Array(n).fill(false));
    const parent: Array<Array<[number, number] | null>> = Array.from({ length: m }, () => Array(n).fill(null));
    const deque: Array<[number, number]> = [];

    dist[0][0] = 0;
    deque.push([0, 0]);

    const steps: BFSStep[] = [];
    const cloneDist = () => dist.map((r) => [...r]);
    const cloneVisited = () => visited.map((r) => [...r]);
    const cloneDeque = (): DequeItem[] => deque.map(([r, c]) => ({ r, c, dist: dist[r][c] }));

    const getPathTo = (r: number, c: number): Array<[number, number]> => {
      const path: Array<[number, number]> = [];
      let curr: [number, number] | null = [r, c];
      while (curr) {
        path.unshift(curr);
        curr = parent[curr[0]][curr[1]];
      }
      return path;
    };

    steps.push({
      type: 'POP_FRONT',
      r: 0,
      c: 0,
      dist: 0,
      distSnapshot: cloneDist(),
      visitedSnapshot: cloneVisited(),
      dequeSnapshot: cloneDeque(),
      pathSnapshot: [[0, 0]],
      message: `🚀 初始化：起点 (0, 0) 距离设为 0，入双端队列。`,
    });

    const dirs = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    while (deque.length > 0) {
      const [r, c] = deque.shift()!;
      const curDist = dist[r][c];

      if (visited[r][c]) continue;
      visited[r][c] = true;

      const curPath = getPathTo(r, c);

      steps.push({
        type: 'POP_FRONT',
        r,
        c,
        dist: curDist,
        distSnapshot: cloneDist(),
        visitedSnapshot: cloneVisited(),
        dequeSnapshot: cloneDeque(),
        pathSnapshot: curPath,
        message: `📥 队头出队：探索坐标 (${r}, ${c})，当前代价为 ${curDist}。`,
      });

      if (r === m - 1 && c === n - 1) {
        steps.push({
          type: 'FOUND_TARGET',
          r,
          c,
          dist: curDist,
          distSnapshot: cloneDist(),
          visitedSnapshot: cloneVisited(),
          dequeSnapshot: cloneDeque(),
          pathSnapshot: curPath,
          message: `🎯 成功到达右下角终点 (${r}, ${c})！移除障碍物最少代价为 ${curDist}！🎉`,
        });
        break;
      }

      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < m && nc >= 0 && nc < n) {
          const w = this.grid[nr][nc]; // 0 或 1
          if (dist[nr][nc] > curDist + w) {
            dist[nr][nc] = curDist + w;
            parent[nr][nc] = [r, c];
            const newPath = [...curPath, [nr, nc] as [number, number]];

            if (w === 0) {
              // 0 权插队头
              deque.unshift([nr, nc]);
              steps.push({
                type: 'RELAX_ZERO',
                r,
                c,
                dist: curDist,
                toR: nr,
                toC: nc,
                weight: 0,
                newDist: curDist,
                distSnapshot: cloneDist(),
                visitedSnapshot: cloneVisited(),
                dequeSnapshot: cloneDeque(),
                pathSnapshot: newPath,
                message: `🟢 [0 权空地] (${r},${c}) → (${nr},${nc}) 代价 +0：距离保持 ${curDist}，插入【队头 (Front)】！`,
              });
            } else {
              // 1 权插队尾
              deque.push([nr, nc]);
              steps.push({
                type: 'RELAX_ONE',
                r,
                c,
                dist: curDist,
                toR: nr,
                toC: nc,
                weight: 1,
                newDist: curDist + 1,
                distSnapshot: cloneDist(),
                visitedSnapshot: cloneVisited(),
                dequeSnapshot: cloneDeque(),
                pathSnapshot: newPath,
                message: `🧱 [1 权障碍] (${r},${c}) → (${nr},${nc}) 移除障碍 +1：距离变为 ${curDist + 1}，插入【队尾 (Back)】！`,
              });
            }
          }
        }
      }
    }

    steps.push({
      type: 'DONE',
      r: m - 1,
      c: n - 1,
      dist: dist[m - 1][n - 1],
      distSnapshot: cloneDist(),
      visitedSnapshot: cloneVisited(),
      dequeSnapshot: cloneDeque(),
      pathSnapshot: getPathTo(m - 1, n - 1),
      message: `🏁 0-1 BFS 搜索完成！已找到全局最小障碍消除数。`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#bfs01-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: BFS_01_CODE_LANGUAGES,
      problemHtml: BFS_01_PROBLEM_HTML,
      analysisHtml: BFS_01_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步推演
    const stepBtn = this.root.querySelector('#btn-bfs01-step') as HTMLButtonElement | null;
    if (stepBtn) {
      stepBtn.addEventListener('click', () => this.stepForward());
    }

    // 自动推演
    const autoBtn = this.root.querySelector('#btn-bfs01-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) {
          this.stopAutoPlay();
        } else {
          this.startAutoPlay();
        }
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-bfs01-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设选择
    this.root.querySelectorAll<HTMLButtonElement>('.bfs01-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC';
        this.root?.querySelectorAll('.bfs01-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-bfs01-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        DequeAudio.isMuted = !DequeAudio.isMuted;
        soundBtn.textContent = DequeAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'POP_FRONT') DequeAudio.playPop();
      else if (cur.type === 'RELAX_ZERO') DequeAudio.playPushFront();
      else if (cur.type === 'RELAX_ONE') DequeAudio.playPushBack();
      else if (cur.type === 'FOUND_TARGET') DequeAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-bfs01-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停推演';

    const step = () => {
      if (!this.isAutoPlaying) return;
      if (this.currentStepPtr < this.traceSteps.length - 1) {
        this.stepForward();
        this.autoPlayTimer = setTimeout(step, 650 / this.playSpeed);
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
    const playBtn = this.root?.querySelector('#btn-bfs01-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动推演';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#bfs01-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#bfs01-status-badge') as HTMLElement | null;
    const dequeContainer = this.root.querySelector('#bfs01-deque-container') as HTMLElement | null;
    const minCostStat = this.root.querySelector('#bfs01-mincost-stat') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'FOUND_TARGET') {
        statusBadge.textContent = `🎯 到达终点: 消除 ${cur.dist} 个障碍`;
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (minCostStat) {
      const endDist = cur.distSnapshot[this.rows - 1]?.[this.cols - 1];
      minCostStat.textContent = endDist === undefined || endDist >= 999999 ? '探索中...' : `${endDist}`;
    }

    // 渲染双端队列可视化
    if (dequeContainer) {
      if (cur.dequeSnapshot.length === 0) {
        dequeContainer.innerHTML = '<span style="font-size: 11px; color: #94a3b8;">双端队列为空</span>';
      } else {
        dequeContainer.innerHTML = cur.dequeSnapshot
          .map((item, idx) => {
            const isHead = idx === 0;
            const isTail = idx === cur.dequeSnapshot.length - 1;
            const bg = isHead ? '#eff6ff' : isTail ? '#fef2f2' : '#f8fafc';
            const border = isHead ? '#3b82f6' : isTail ? '#ef4444' : '#cbd5e1';
            const tag = isHead ? '⬅️ 队头' : isTail ? '队尾 ➡️' : '';

            return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 2px 6px; border-radius: 4px; background: ${bg}; border: 1px solid ${border}; font-size: 10.5px; margin-bottom: 2px;">
              <span><b>(${item.r}, ${item.c})</b> <span style="font-size: 9px; color: #64748b;">${tag}</span></span>
              <span style="font-family: monospace; font-weight: bold; color: #2563eb;">d = ${item.dist}</span>
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

      this.pulsePhase += dt * 0.006;
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

    // 1. 背景
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // 2. 网格尺寸排布
    const padding = 16;
    const cellW = (width - padding * 2) / n;
    const cellH = (height - padding * 2) / m;

    // 绘制单元格
    for (let r = 0; r < m; r++) {
      for (let c = 0; c < n; c++) {
        const x = padding + c * cellW;
        const y = padding + r * cellH;
        const isObstacle = this.grid[r][c] === 1;
        const isStart = r === 0 && c === 0;
        const isTarget = r === m - 1 && c === n - 1;
        const isCurrent = cur && cur.r === r && cur.c === c;
        const isVisited = cur && cur.visitedSnapshot[r]?.[c];
        const distVal = cur?.distSnapshot[r]?.[c];

        ctx.save();

        // 背景填充
        if (isCurrent) {
          ctx.fillStyle = '#facc15'; // 当前探索黄
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 10;
        } else if (isStart) {
          ctx.fillStyle = '#065f46'; // 起点翡翠绿
        } else if (isTarget) {
          ctx.fillStyle = '#831843'; // 终点玫红
        } else if (isVisited) {
          ctx.fillStyle = isObstacle ? '#7f1d1d' : '#1e3a8a'; // 已访问
        } else if (isObstacle) {
          ctx.fillStyle = '#3f1821'; // 障碍砖红
        } else {
          ctx.fillStyle = '#131b2e'; // 空地深蓝
        }

        ctx.strokeStyle = isCurrent ? '#ffffff' : isObstacle ? '#f87171' : '#334155';
        ctx.lineWidth = isCurrent ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, cellW - 4, cellH - 4, 4);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 障碍物标志 / 状态文字
        if (isObstacle) {
          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = '#fca5a5';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🧱 障', x + cellW / 2, y + cellH / 2 - 4);
        } else if (isStart) {
          ctx.font = 'bold 10px sans-serif';
          ctx.fillStyle = '#a7f3d0';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🚀 起点', x + cellW / 2, y + cellH / 2 - 4);
        } else if (isTarget) {
          ctx.font = 'bold 10px sans-serif';
          ctx.fillStyle = '#fbcfe8';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🎯 终点', x + cellW / 2, y + cellH / 2 - 4);
        }

        // 最短距离标注
        if (distVal !== undefined && distVal < 999999) {
          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = isCurrent ? '#000000' : '#38bdf8';
          ctx.textAlign = 'center';
          ctx.fillText(`d=${distVal}`, x + cellW / 2, y + cellH - 6);
        }

        ctx.restore();
      }
    }

    // 3. 绘制路径连线
    if (cur && cur.pathSnapshot && cur.pathSnapshot.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      cur.pathSnapshot.forEach(([pr, pc], idx) => {
        const px = padding + pc * cellW + cellW / 2;
        const py = padding + pr * cellH + cellH / 2;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }
}

export const BFS_01_TEMPLATE = `
  <div id="algo-bfs-01-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🧱</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">0-1 BFS 双端队列最短路 (Deque BFS)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="bfs01-preset-btn active" data-preset="CLASSIC" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典障碍 (5x6)</button>
          <button class="bfs01-preset-btn" data-preset="MAZE_CORRIDOR" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">迷宫走廊 (5x7)</button>
          <button class="bfs01-preset-btn" data-preset="HEAVY_WALLS" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">重度障碍墙</button>
          <button class="bfs01-preset-btn" data-preset="FREE_RUN" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">0 代价畅通</button>
          <button class="bfs01-preset-btn" data-preset="RANDOM" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">🎲 随机迷宫</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="bfs01-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-bfs01-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-bfs01-autoplay" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(59,130,246,0.25);">▶️ 自动推演</button>
        <button id="btn-bfs01-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-bfs01-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #1e40af;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>🎯 当前终点消除障碍数: <b id="bfs01-mincost-stat" style="color: #2563eb; font-size: 12px;">探索中...</b></span>
        <span>⚡ 复杂度: <b style="color: #059669;">O(M × N) 线性时间</b></span>
      </div>
      <div id="bfs01-narration-box" style="font-weight: 700; color: #1e3a8a;">
        💡 准备就绪：观察 0 权空地插队头 (push_front) 与 1 权障碍插队尾 (push_back) 的单调性维持！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：网格 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #090d16; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="bfs01-canvas" width="460" height="230" style="width: 460px; height: 230px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🟢 空地 (0 权) 插入双端队列头部 ⬅️ | 🧱 障碍物 (1 权) 插入双端队列尾部 ➡️
        </div>
      </div>

      <!-- 右侧：双端队列与代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; max-height: 110px; display: flex; flex-direction: column;">
          <div style="font-size: 11px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">⚡ 双端队列 Deque (天然维护单调性)</div>
          <div id="bfs01-deque-container" style="flex: 1; overflow-y: auto;"></div>
        </div>

        <div id="bfs01-terminal-mount" style="flex: 1; min-height: 180px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'bfs-01',
  name: '0-1 BFS 双端队列最短路',
  viewId: 'algo-bfs-01-view',
  category: 'graph',
  description: '0-1 BFS 算法：左程云 class062 到达角落移除障碍物的最小数目 (LeetCode 2290)、双端队列代替堆优化实现 O(V+E) 极速最短路',
  icon: '🧱',
  template: BFS_01_TEMPLATE,
  Visualizer: BFS01Visualizer,
  difficulty: 2,
  levelOrder: 21,
  learningGoal: '掌握 0-1 BFS 核心思想（边权只有 0/1 时用 Deque 的 front/back 维持单调性）以及 O(V+E) 极速搜索机制',
});
