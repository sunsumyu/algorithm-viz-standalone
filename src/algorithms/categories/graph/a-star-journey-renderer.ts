/**
 * A* 算法与迷宫启发式寻路 (A* Search Pathfinding) 可视化引擎
 * 参考左程云《算法通关课》【必备篇】class065: F(x) = G(x) + H(x) 曼哈顿距离启发式剪枝与 Dijkstra 对比验证
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  A_STAR_JOURNEY_CODE_LANGUAGES,
  A_STAR_JOURNEY_PROBLEM_HTML,
  A_STAR_JOURNEY_ANALYSIS_HTML,
} from './a-star-journey-problem-content';

export interface AStarCell {
  r: number;
  c: number;
  g: number;
  h: number;
  f: number;
}

export interface AStarStep {
  type: 'POP_OPEN' | 'EXPLORE_NEIGHBOR' | 'UPDATE_SCORE' | 'TARGET_REACHED' | 'NO_PATH';
  curR: number;
  curC: number;
  curG: number;
  curH: number;
  curF: number;
  targetR?: number;
  targetC?: number;
  openSetSnapshot: AStarCell[];
  closedSetSnapshot: boolean[][];
  gScoreSnapshot: number[][];
  exploredCount: number;
  finalPath?: Array<[number, number]>;
  message: string;
}

class AStarAudio {
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
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playExplore(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(783.99, ctx.currentTime);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {}
  }

  public static playWin(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.16, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.3);
      });
    } catch {}
  }
}

export class AStarJourneyVisualizer extends StepVisualizer<any> {
  // 迷宫配置
  private rows = 10;
  private cols = 16;
  private grid: number[][] = [];
  private startPos: [number, number] = [1, 1];
  private targetPos: [number, number] = [8, 14];

  // 算法模式: 'a-star' 或 'dijkstra'
  private algoMode: 'a-star' | 'dijkstra' = 'a-star';

  // 推演步骤
  private traceSteps: AStarStep[] = [];
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
    this.codeLanguages = A_STAR_JOURNEY_CODE_LANGUAGES;
    this.codeLines = A_STAR_JOURNEY_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = 'A* 启发式寻路算法引擎 (class065)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: 'A* 启发式寻路' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_MAZE');
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
    this.rows = 10;
    this.cols = 16;
    this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(1));

    if (presetKey === 'CLASSIC_MAZE') {
      this.startPos = [1, 1];
      this.targetPos = [8, 14];
      // 设置墙壁
      for (let r = 0; r < 8; r++) this.grid[r][4] = 0;
      for (let r = 2; r < 10; r++) this.grid[r][8] = 0;
      for (let r = 0; r < 8; r++) this.grid[r][12] = 0;
    } else if (presetKey === 'S_CORRIDOR') {
      this.startPos = [1, 1];
      this.targetPos = [8, 14];
      for (let c = 0; c < 13; c++) this.grid[3][c] = 0;
      for (let c = 3; c < 16; c++) this.grid[6][c] = 0;
    } else if (presetKey === 'OPEN_SPRINT') {
      this.startPos = [1, 1];
      this.targetPos = [8, 14];
      // 几乎无障碍物
      this.grid[4][7] = 0;
      this.grid[5][7] = 0;
    } else if (presetKey === 'DEAD_END_TRAP') {
      this.startPos = [1, 1];
      this.targetPos = [8, 14];
      // U型陷阱
      for (let r = 1; r < 7; r++) this.grid[r][6] = 0;
      for (let r = 1; r < 7; r++) this.grid[r][10] = 0;
      for (let c = 6; c <= 10; c++) this.grid[7][c] = 0;
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const m = this.rows;
    const n = this.cols;
    const [sr, sc] = this.startPos;
    const [tr, tc] = this.targetPos;

    const gScore: number[][] = Array.from({ length: m }, () => Array(n).fill(Infinity));
    const closed: boolean[][] = Array.from({ length: m }, () => Array(n).fill(false));
    const parent: Map<string, [number, number]> = new Map();

    const manhattan = (r: number, c: number) => {
      if (this.algoMode === 'dijkstra') return 0; // Dijkstra 相当于 h(x) = 0
      return Math.abs(r - tr) + Math.abs(c - tc);
    };

    gScore[sr][sc] = 0;
    const openSet: AStarCell[] = [{ r: sr, c: sc, g: 0, h: manhattan(sr, sc), f: manhattan(sr, sc) }];

    const steps: AStarStep[] = [];
    const cloneOpen = (): AStarCell[] => openSet.map((item) => ({ ...item }));
    const cloneClosed = () => closed.map((row) => [...row]);
    const cloneGScore = () => gScore.map((row) => [...row]);

    let exploredCount = 0;

    steps.push({
      type: 'POP_OPEN',
      curR: sr,
      curC: sc,
      curG: 0,
      curH: manhattan(sr, sc),
      curF: manhattan(sr, sc),
      openSetSnapshot: cloneOpen(),
      closedSetSnapshot: cloneClosed(),
      gScoreSnapshot: cloneGScore(),
      exploredCount: 0,
      message: `🚀 初始化：起点 (${sr}, ${sc}) 加入 Open 集，初始估价 F = G(0) + H(${manhattan(sr, sc)}) = ${manhattan(sr, sc)}。`,
    });

    const dirs = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    let pathFound = false;

    while (openSet.length > 0) {
      openSet.sort((a, b) => a.f - b.f || a.h - b.h);
      const cur = openSet.shift()!;
      const { r, c, g, h, f } = cur;

      if (closed[r][c]) continue;
      closed[r][c] = true;
      exploredCount++;

      if (r === tr && c === tc) {
        // 构建最终路径
        const path: Array<[number, number]> = [[tr, tc]];
        let currKey = `${tr},${tc}`;
        while (parent.has(currKey)) {
          const p = parent.get(currKey)!;
          path.unshift(p);
          currKey = `${p[0]},${p[1]}`;
        }

        steps.push({
          type: 'TARGET_REACHED',
          curR: r,
          curC: c,
          curG: g,
          curH: h,
          curF: f,
          openSetSnapshot: cloneOpen(),
          closedSetSnapshot: cloneClosed(),
          gScoreSnapshot: cloneGScore(),
          exploredCount,
          finalPath: path,
          message: `🎯 成功抵达终点 (${tr}, ${tc})！最短耗费步数: ${g}，总探测节点数: ${exploredCount}！`,
        });
        pathFound = true;
        break;
      }

      steps.push({
        type: 'POP_OPEN',
        curR: r,
        curC: c,
        curG: g,
        curH: h,
        curF: f,
        openSetSnapshot: cloneOpen(),
        closedSetSnapshot: cloneClosed(),
        gScoreSnapshot: cloneGScore(),
        exploredCount,
        message: `📥 弹出 Open 集中最小评估节点 (${r}, ${c})：G=${g}, H=${h}, F=${f}。`,
      });

      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < m && nc >= 0 && nc < n && this.grid[nr][nc] === 1 && !closed[nr][nc]) {
          const tentG = g + 1;
          if (tentG < gScore[nr][nc]) {
            gScore[nr][nc] = tentG;
            parent.set(`${nr},${nc}`, [r, c]);
            const nH = manhattan(nr, nc);
            const nF = tentG + nH;
            openSet.push({ r: nr, c: nc, g: tentG, h: nH, f: nF });

            steps.push({
              type: 'UPDATE_SCORE',
              curR: r,
              curC: c,
              curG: g,
              curH: h,
              curF: f,
              targetR: nr,
              targetC: nc,
              openSetSnapshot: cloneOpen(),
              closedSetSnapshot: cloneClosed(),
              gScoreSnapshot: cloneGScore(),
              exploredCount,
              message: `⚡ 探测邻居 (${nr}, ${nc})：更新 G=${tentG}, H=${nH}, 综合 F=${nF} 加入 Open 集。`,
            });
          }
        }
      }
    }

    if (!pathFound) {
      steps.push({
        type: 'NO_PATH',
        curR: 0,
        curC: 0,
        curG: 0,
        curH: 0,
        curF: 0,
        openSetSnapshot: [],
        closedSetSnapshot: cloneClosed(),
        gScoreSnapshot: cloneGScore(),
        exploredCount,
        message: `❌ Open 队列排空，未能找到通往终点的可行路线！`,
      });
    }

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#astar-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: A_STAR_JOURNEY_CODE_LANGUAGES,
      problemHtml: A_STAR_JOURNEY_PROBLEM_HTML,
      analysisHtml: A_STAR_JOURNEY_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-astar-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-astar-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-astar-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 模式切换 (A* vs Dijkstra)
    const modeBtn = this.root.querySelector('#btn-astar-mode') as HTMLButtonElement | null;
    if (modeBtn) {
      modeBtn.addEventListener('click', () => {
        this.algoMode = this.algoMode === 'a-star' ? 'dijkstra' : 'a-star';
        modeBtn.innerHTML = this.algoMode === 'a-star' ? '🧭 当前: A* 启发式' : '⚪ 当前: Dijkstra 盲搜';
        modeBtn.style.background = this.algoMode === 'a-star' ? '#eff6ff' : '#f1f5f9';
        this.computeTraceSteps();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.astar-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_MAZE';
        this.root?.querySelectorAll('.astar-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-astar-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        AStarAudio.isMuted = !AStarAudio.isMuted;
        soundBtn.textContent = AStarAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'POP_OPEN') AStarAudio.playPop();
      else if (cur.type === 'UPDATE_SCORE') AStarAudio.playExplore();
      else if (cur.type === 'TARGET_REACHED') AStarAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-astar-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停寻路';

    const step = () => {
      if (!this.isAutoPlaying) return;
      if (this.currentStepPtr < this.traceSteps.length - 1) {
        this.stepForward();
        this.autoPlayTimer = setTimeout(step, 600 / this.playSpeed);
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
    const playBtn = this.root?.querySelector('#btn-astar-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动寻路';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#astar-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#astar-status-badge') as HTMLElement | null;
    const exploredStat = this.root.querySelector('#astar-explored-stat') as HTMLElement | null;
    const currentScoreStat = this.root.querySelector('#astar-score-stat') as HTMLElement | null;
    const openSetContainer = this.root.querySelector('#astar-openset-container') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'TARGET_REACHED') {
        statusBadge.textContent = '🎯 终点命中！';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (exploredStat) {
      exploredStat.textContent = `${cur.exploredCount} 节点`;
    }

    if (currentScoreStat) {
      currentScoreStat.textContent = `F: ${cur.curF} (G:${cur.curG} + H:${cur.curH})`;
    }

    if (openSetContainer) {
      if (cur.openSetSnapshot.length === 0) {
        openSetContainer.innerHTML = '<span style="font-size: 10.5px; color: #94a3b8;">Open 集为空</span>';
      } else {
        openSetContainer.innerHTML = cur.openSetSnapshot
          .slice(0, 10)
          .map((item, idx) => {
            const isTop = idx === 0;
            return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 2px 6px; border-radius: 4px; background: ${isTop ? '#eff6ff' : '#f8fafc'}; border: 1px solid ${isTop ? '#3b82f6' : '#cbd5e1'}; font-size: 10px; margin-bottom: 2px;">
              <span>${isTop ? '⭐ [Top] ' : ''}(${item.r}, ${item.c})</span>
              <span style="font-family: monospace; font-weight: bold; color: #2563eb;">F=${item.f} <span style="font-size: 8.5px; color: #64748b;">(G:${item.g}+H:${item.h})</span></span>
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
    const m = this.rows;
    const n = this.cols;
    const cur = this.traceSteps[this.currentStepPtr];

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    const cellW = (width - 20) / n;
    const cellH = (height - 20) / m;
    const offsetX = 10;
    const offsetY = 10;

    // 1. 绘制网格单元
    for (let r = 0; r < m; r++) {
      for (let c = 0; c < n; c++) {
        const x = offsetX + c * cellW;
        const y = offsetY + r * cellH;
        const isWall = this.grid[r][c] === 0;
        const isStart = r === this.startPos[0] && c === this.startPos[1];
        const isTarget = r === this.targetPos[0] && c === this.targetPos[1];
        const isClosed = cur?.closedSetSnapshot[r]?.[c];
        const inOpen = cur?.openSetSnapshot.some((item) => item.r === r && item.c === c);
        const isCur = cur && cur.curR === r && cur.curC === c;
        const isPath = cur?.finalPath?.some(([pr, pc]) => pr === r && pc === c);

        ctx.save();

        if (isWall) {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x, y, cellW, cellH);
          ctx.strokeStyle = '#334155';
          ctx.strokeRect(x, y, cellW, cellH);
        } else if (isPath) {
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(x, y, cellW, cellH);
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 10;
        } else if (isCur) {
          ctx.fillStyle = '#ca8a04';
          ctx.fillRect(x, y, cellW, cellH);
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 12;
        } else if (inOpen) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.fillRect(x, y, cellW, cellH);
        } else if (isClosed) {
          ctx.fillStyle = 'rgba(30, 58, 138, 0.5)';
          ctx.fillRect(x, y, cellW, cellH);
        } else {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x, y, cellW, cellH);
        }

        ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
        ctx.strokeRect(x, y, cellW, cellH);

        // 起点 / 终点标注
        if (isStart) {
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🚩', x + cellW / 2, y + cellH / 2);
        } else if (isTarget) {
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🎯', x + cellW / 2, y + cellH / 2);
        } else if (!isWall && cur && cur.gScoreSnapshot[r]?.[c] < 1e8) {
          // 渲染 F 估价
          const g = cur.gScoreSnapshot[r][c];
          const h = this.algoMode === 'a-star' ? Math.abs(r - this.targetPos[0]) + Math.abs(c - this.targetPos[1]) : 0;
          ctx.font = 'bold 8px monospace';
          ctx.fillStyle = '#94a3b8';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${g + h}`, x + cellW / 2, y + cellH / 2);
        }

        ctx.restore();
      }
    }

    // 2. 若存在最终路径，绘制金色流光连线
    if (cur?.finalPath && cur.finalPath.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      cur.finalPath.forEach(([pr, pc], idx) => {
        const cx = offsetX + pc * cellW + cellW / 2;
        const cy = offsetY + pr * cellH + cellH / 2;
        if (idx === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      });
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }
}

export const A_STAR_JOURNEY_TEMPLATE = `
  <div id="algo-a-star-journey-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🧭</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">A* 启发式寻路 (A* Search Pathfinding)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="astar-preset-btn active" data-preset="CLASSIC_MAZE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典迷宫</button>
          <button class="astar-preset-btn" data-preset="S_CORRIDOR" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">S型回廊</button>
          <button class="astar-preset-btn" data-preset="DEAD_END_TRAP" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">U型陷阱</button>
          <button class="astar-preset-btn" data-preset="OPEN_SPRINT" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">直线冲刺</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <button id="btn-astar-mode" style="background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🧭 当前: A* 启发式</button>
        <span id="astar-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-astar-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步寻路</button>
        <button id="btn-astar-autoplay" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(59,130,246,0.25);">▶️ 自动寻路</button>
        <button id="btn-astar-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-astar-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #1e40af;">
      <div style="display: flex; gap: 14px; align-items: center;">
        <span>🔍 已探测节点数: <b id="astar-explored-stat" style="color: #2563eb; font-size: 12.5px;">0 节点</b></span>
        <span>📊 当前评估: <b id="astar-score-stat" style="color: #ea580c; font-size: 12px;">-</b></span>
      </div>
      <div id="astar-narration-box" style="font-weight: 700; color: #1e3a8a;">
        💡 准备就绪：点击「当前模式」可在 A* 与 Dijkstra 间即时对比剪枝效率！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：迷宫 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="astar-canvas" width="460" height="230" style="width: 460px; height: 230px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🚩 绿色起点 | 🎯 红色终点 | 🟡 金色当前探测 | 浅蓝 Open 待选集 | 深蓝 Closed 集
        </div>
      </div>

      <!-- 右侧：Open 优先队列与代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; max-height: 100px; display: flex; flex-direction: column; gap: 2px;">
          <div style="font-size: 10.5px; font-weight: 700; color: #0f172a;">⚡ Open 优先队列 (按 F = G + H 升序):</div>
          <div id="astar-openset-container" style="display: flex; flex-direction: column; overflow-y: auto;"></div>
        </div>

        <div id="astar-terminal-mount" style="flex: 1; min-height: 180px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'a-star-journey',
  name: 'A* 启发式搜索 (A* Pathfinding)',
  viewId: 'algo-a-star-journey-view',
  category: 'graph',
  description: 'A* 启发式搜索算法：左程云 class065 估价函数 F(x) = G(x) + H(x)、曼哈顿距离可采纳性剪枝与 Dijkstra 盲搜效率对比',
  icon: '🧭',
  template: A_STAR_JOURNEY_TEMPLATE,
  Visualizer: AStarJourneyVisualizer,
  difficulty: 2,
  levelOrder: 26,
  learningGoal: '掌握 A* 启发式估价函数 F = G + H 的设计原则、曼哈顿距离的可采纳性证明以及相比 Dijkstra 的大幅剪枝机制',
});
