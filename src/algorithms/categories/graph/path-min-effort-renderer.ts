/**
 * 最小体力消耗路径 (Path With Minimum Effort - 2D Grid Dijkstra) 可视化引擎
 * 左程云算法通关课 Class 064 Code02 (LeetCode 1631)
 * 核心：网格图瓶颈最短路、max(|h1 - h2|) 松弛、Dijkstra 优先队列贪心扩展
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  PATH_MIN_EFFORT_CODE_LANGUAGES,
  PATH_MIN_EFFORT_PROBLEM_HTML,
  PATH_MIN_EFFORT_ANALYSIS_HTML,
} from './path-min-effort-problem-content';

export interface GridDijkstraStep {
  type: 'POP_NODE' | 'RELAX_NEIGHBOR' | 'REACH_TARGET' | 'ALL_DONE';
  curR: number;
  curC: number;
  curEffort: number;
  distGrid: number[][];
  visitedGrid: boolean[][];
  pqSnapshot: Array<{ r: number; c: number; effort: number }>;
  bestPath?: Array<{ r: number; c: number }>;
  message: string;
}

class GridAudio {
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
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playRelax(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
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

export class PathMinEffortVisualizer extends StepVisualizer<any> {
  private heights: number[][] = [];
  private rows = 4;
  private cols = 4;

  // 推演步骤
  private traceSteps: GridDijkstraStep[] = [];
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
    this.codeLanguages = PATH_MIN_EFFORT_CODE_LANGUAGES;
    this.codeLines = PATH_MIN_EFFORT_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '最小体力消耗 Dijkstra 引擎 (Path With Min Effort)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '最小体力消耗路径' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_4X4_MOUNTAIN');
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

    if (presetKey === 'CLASSIC_4X4_MOUNTAIN') {
      this.heights = [
        [1, 2, 2, 1],
        [3, 8, 2, 1],
        [5, 3, 2, 1],
        [1, 1, 2, 1],
      ];
      this.rows = 4;
      this.cols = 4;
    } else {
      this.heights = [
        [1, 2, 3],
        [3, 8, 4],
        [5, 3, 5],
      ];
      this.rows = 3;
      this.cols = 3;
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const R = this.rows;
    const C = this.cols;
    const dist: number[][] = Array.from({ length: R }, () => Array(C).fill(999));
    const visited: boolean[][] = Array.from({ length: R }, () => Array(C).fill(false));
    const parent: Array<Array<{ r: number; c: number } | null>> = Array.from({ length: R }, () => Array(C).fill(null));

    const pq: Array<{ r: number; c: number; effort: number }> = [];

    dist[0][0] = 0;
    pq.push({ r: 0, c: 0, effort: 0 });

    const steps: GridDijkstraStep[] = [];
    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];

    while (pq.length > 0) {
      pq.sort((a, b) => a.effort - b.effort);
      const cur = pq.shift()!;
      const r = cur.r;
      const c = cur.c;
      const d = cur.effort;

      if (visited[r][c]) continue;
      visited[r][c] = true;

      steps.push({
        type: 'POP_NODE',
        curR: r,
        curC: c,
        curEffort: d,
        distGrid: dist.map((row) => [...row]),
        visitedGrid: visited.map((row) => [...row]),
        pqSnapshot: JSON.parse(JSON.stringify(pq)),
        message: `⛰️ [弹出最优格] 出堆当前最小体力格子 (${r}, ${c})，当前瓶颈差值 = ${d}！`,
      });

      if (r === R - 1 && c === C - 1) {
        // 回溯最优路径
        const bestPath: Array<{ r: number; c: number }> = [];
        let p: { r: number; c: number } | null = { r, c };
        while (p) {
          bestPath.unshift(p);
          p = parent[p.r][p.c];
        }

        steps.push({
          type: 'REACH_TARGET',
          curR: r,
          curC: c,
          curEffort: d,
          distGrid: dist.map((row) => [...row]),
          visitedGrid: visited.map((row) => [...row]),
          pqSnapshot: JSON.parse(JSON.stringify(pq)),
          bestPath,
          message: `🎯 [到达终点] 成功抵达 (${r}, ${c})！全局最小体力消耗为 ${d}，路径完美避开高峰！`,
        });
        break;
      }

      for (let i = 0; i < 4; i++) {
        const nr = r + dr[i];
        const nc = c + dc[i];
        if (nr >= 0 && nr < R && nc >= 0 && nc < C && !visited[nr][nc]) {
          const stepEffort = Math.abs(this.heights[nr][nc] - this.heights[r][c]);
          const nextEffort = Math.max(d, stepEffort);

          if (nextEffort < dist[nr][nc]) {
            dist[nr][nc] = nextEffort;
            parent[nr][nc] = { r, c };
            pq.push({ r: nr, c: nc, effort: nextEffort });

            steps.push({
              type: 'RELAX_NEIGHBOR',
              curR: nr,
              curC: nc,
              curEffort: nextEffort,
              distGrid: dist.map((row) => [...row]),
              visitedGrid: visited.map((row) => [...row]),
              pqSnapshot: JSON.parse(JSON.stringify(pq)),
              message: `🔄 [松弛邻居] 从 (${r},${c})[高度${this.heights[r][c]}] 到 (${nr},${nc})[高度${this.heights[nr][nc]}]，高度差 |${this.heights[nr][nc]}-${this.heights[r][c]}|=${stepEffort}，更新体力 = max(${d}, ${stepEffort}) = ${nextEffort}！`,
            });
          }
        }
      }
    }

    steps.push({
      type: 'ALL_DONE',
      curR: R - 1,
      curC: C - 1,
      curEffort: dist[R - 1][C - 1],
      distGrid: dist.map((row) => [...row]),
      visitedGrid: visited.map((row) => [...row]),
      pqSnapshot: [],
      bestPath: steps[steps.length - 1].bestPath,
      message: `🎉 [计算完成] 最小体力消耗路径为 ${dist[R - 1][C - 1]}，Dijkstra 贪心搜索收敛！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#mineffort-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: PATH_MIN_EFFORT_CODE_LANGUAGES,
      problemHtml: PATH_MIN_EFFORT_PROBLEM_HTML,
      analysisHtml: PATH_MIN_EFFORT_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-mineffort-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-mineffort-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-mineffort-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.mineffort-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_4X4_MOUNTAIN';
        this.root?.querySelectorAll('.mineffort-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-mineffort-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        GridAudio.isMuted = !GridAudio.isMuted;
        soundBtn.textContent = GridAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'POP_NODE') GridAudio.playPop();
      else if (cur.type === 'RELAX_NEIGHBOR') GridAudio.playRelax();
      else if (cur.type === 'REACH_TARGET' || cur.type === 'ALL_DONE') GridAudio.playVictory();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-mineffort-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停搜索';

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
    const playBtn = this.root?.querySelector('#btn-mineffort-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动搜索';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#mineffort-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#mineffort-status-badge') as HTMLElement | null;
    const effortBadge = this.root.querySelector('#mineffort-effort-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = '🏁 搜索完成';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (effortBadge) {
      effortBadge.textContent = `当前最小体力: ${cur.curEffort}`;
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
      const cellSize = 42;
      const startX = 20;
      const startY = 15;

      // 1. 绘制网格
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const x = startX + c * (cellSize + 6);
          const y = startY + r * (cellSize + 6);
          const h = this.heights[r][c];
          const d = cur.distGrid[r][c];
          const isVisited = cur.visitedGrid[r][c];
          const isCur = cur.curR === r && cur.curC === c;
          const isBestPath = cur.bestPath && cur.bestPath.some((p) => p.r === r && p.c === c);

          ctx.save();
          // 高度色彩映射
          let bg = '#1e293b';
          if (h >= 8) bg = '#7f1d1d';
          else if (h >= 5) bg = '#854d0e';
          else if (h >= 3) bg = '#1e3a8a';

          if (isBestPath) bg = '#064e3b';

          ctx.fillStyle = bg;
          ctx.strokeStyle = isCur ? '#facc15' : isBestPath ? '#10b981' : isVisited ? '#38bdf8' : '#334155';
          ctx.lineWidth = isCur || isBestPath ? 3 : 1.5;
          if (isCur) {
            ctx.shadowColor = '#facc15';
            ctx.shadowBlur = 10;
          }

          ctx.beginPath();
          ctx.roundRect(x, y, cellSize, cellSize, 6);
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;

          // 高度文本
          ctx.font = 'bold 13px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(`H:${h}`, x + cellSize / 2, y + 16);

          // dist 文本
          ctx.font = '9.5px monospace';
          ctx.fillStyle = d === 999 ? '#64748b' : '#38bdf8';
          ctx.fillText(d === 999 ? '∞' : `d:${d}`, x + cellSize / 2, y + 32);

          ctx.restore();
        }
      }

      // 2. 右侧优先队列状态
      ctx.save();
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('📥 优先队列 (小根堆):', 230, 25);

      const pqList = cur.pqSnapshot.slice(0, 5);
      pqList.forEach((item, idx) => {
        const itemY = 42 + idx * 26;
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.roundRect(230, itemY, 200, 22, 4);
        ctx.fill();
        ctx.stroke();

        ctx.font = '10px monospace';
        ctx.fillStyle = '#facc15';
        ctx.textAlign = 'left';
        ctx.fillText(`[#${idx + 1}] (${item.r}, ${item.c}) => 体力: ${item.effort}`, 240, itemY + 15);
      });

      if (pqList.length === 0) {
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('(堆已为空)', 230, 48);
      }

      ctx.restore();
    }

    ctx.restore();
  }
}

export const PATH_MIN_EFFORT_TEMPLATE = `
  <div id="algo-path-min-effort-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">⛰️</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">最小体力消耗路径 (Path With Min Effort)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="mineffort-preset-btn active" data-preset="CLASSIC_4X4_MOUNTAIN" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">4×4 高峰规避图</button>
          <button class="mineffort-preset-btn" data-preset="CLIFF_ESCAPE_3X3" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">3×3 悬崖网格</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="mineffort-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-mineffort-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-mineffort-autoplay" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(2,132,199,0.25);">▶️ 自动搜索</button>
        <button id="btn-mineffort-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-mineffort-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #0369a1;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>⛰️ 路径瓶颈指标: <b id="mineffort-effort-badge" style="color: #0284c7; font-size: 12px;">当前最小体力: 0</b></span>
      </div>
      <div id="mineffort-narration-box" style="font-weight: 700; color: #075985;">
        💡 准备就绪：Dijkstra 维护优先队列，松弛方程 max(curEffort, |h1 - h2|)，首达终点即最优！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：网格地图 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="mineffort-canvas" width="460" height="200" style="width: 460px; height: 200px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          左侧为 2D 网格高度地图 | 🟡 金色光环为当前出堆格子 | 🟢 绿色为回溯最优最小体力路径
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="mineffort-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'path-min-effort',
  name: '最小体力消耗路径 (Path With Min Effort)',
  viewId: 'algo-path-min-effort-view',
  category: 'graph',
  description: '网格图瓶颈最短路算法：max(|h1 - h2|) 状态松弛、Dijkstra 优先队列贪心扩展 (左程云 Class064 Code02 / LeetCode 1631)',
  icon: '⛰️',
  template: PATH_MIN_EFFORT_TEMPLATE,
  Visualizer: PathMinEffortVisualizer,
  difficulty: 2,
  levelOrder: 61,
  learningGoal: '掌握网格图 Dijkstra 瓶颈最短路模型、max 松弛方程最优子结构证明与优先队列首次出堆即最优原理',
});
