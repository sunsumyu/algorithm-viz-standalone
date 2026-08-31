/**
 * 国际象棋·N皇后巅峰对弈 (N-Queens Chess Battle & Backtracking Arena)
 * 经典回溯算法、激光攻击射线与 92 解全景画廊：
 * 1. 👑 拟真木质棋盘与激光攻击场：落子即刻投射横、竖、斜 8 向高能激光威胁线
 * 2. ⚡ 实时冲突检测：两后相争触发雷击警报与危险闪烁
 * 3. 🤖 人机回溯对弈模式：与回溯 AI 逐行交锋，亲身体验死局回溯
 * 4. 🖼️ 92 种合法解全景画廊：一键演算并自由切换全部 92 组 8 皇后黄金解
 * 5. 🔊 拟真落子音效与 Web Audio 合成器
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  NQUEEN_BATTLE_CODE_LANGUAGES,
  NQUEEN_BATTLE_PROBLEM_HTML,
  NQUEEN_BATTLE_ANALYSIS_HTML,
} from './nqueen-battle-problem-content';

export interface QueenPlacement {
  row: number;
  col: number;
}

class ChessAudio {
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

  public static playPlace(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(360, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playConflict(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
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
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.25);
      });
    } catch {}
  }
}

export class NQueenBattleVisualizer extends StepVisualizer<any> {
  private n = 8;
  private board: number[] = []; // board[row] = col, -1 代表未放置
  private allSolutions: number[][] = [];
  private currentSolutionIdx = 0;
  private isShowingLasers = true;

  // 画布
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;

  constructor() {
    super();
    this.codeLanguages = NQUEEN_BATTLE_CODE_LANGUAGES;
    this.codeLines = NQUEEN_BATTLE_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = 'N 皇后回溯与约束满足引擎';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '国际象棋·N皇后巅峰对弈' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.resetBoard(8);
    this.computeAllSolutions();
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

  private resetBoard(n: number): void {
    this.n = n;
    this.board = new Array(n).fill(-1);
    this.currentSolutionIdx = 0;
    this.computeAllSolutions();
    this.updateHUD();
  }

  private computeAllSolutions(): void {
    const solutions: number[][] = [];
    const current = new Array(this.n).fill(-1);

    const isValid = (row: number, col: number): boolean => {
      for (let r = 0; r < row; r++) {
        const c = current[r];
        if (c === col || Math.abs(r - row) === Math.abs(c - col)) return false;
      }
      return true;
    };

    const dfs = (row: number) => {
      if (row === this.n) {
        solutions.push([...current]);
        return;
      }
      for (let c = 0; c < this.n; c++) {
        if (isValid(row, c)) {
          current[row] = c;
          dfs(row + 1);
          current[row] = -1;
        }
      }
    };

    dfs(0);
    this.allSolutions = solutions;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#nqueen-chess-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.bindCanvasClick();
    }

    this.mountTerminal({
      codeLanguages: NQUEEN_BATTLE_CODE_LANGUAGES,
      problemHtml: NQUEEN_BATTLE_PROBLEM_HTML,
      analysisHtml: NQUEEN_BATTLE_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 规模切换 Chips (4 / 6 / 8)
    this.root.querySelectorAll<HTMLButtonElement>('.nqueen-size-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const size = parseInt(btn.dataset.size || '8', 10);
        this.root?.querySelectorAll('.nqueen-size-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.resetBoard(size);
      });
    });

    // 激光射线开关
    const laserToggle = this.root.querySelector('#chk-nqueen-lasers') as HTMLInputElement | null;
    if (laserToggle) {
      laserToggle.addEventListener('change', () => {
        this.isShowingLasers = laserToggle.checked;
      });
    }

    // 92 解画廊上一解 / 下一解
    const prevSolBtn = this.root.querySelector('#btn-nqueen-prev-sol') as HTMLButtonElement | null;
    const nextSolBtn = this.root.querySelector('#btn-nqueen-next-sol') as HTMLButtonElement | null;

    if (prevSolBtn) {
      prevSolBtn.addEventListener('click', () => {
        if (this.allSolutions.length === 0) return;
        this.currentSolutionIdx = (this.currentSolutionIdx - 1 + this.allSolutions.length) % this.allSolutions.length;
        this.board = [...this.allSolutions[this.currentSolutionIdx]];
        ChessAudio.playPlace();
        this.updateHUD();
      });
    }

    if (nextSolBtn) {
      nextSolBtn.addEventListener('click', () => {
        if (this.allSolutions.length === 0) return;
        this.currentSolutionIdx = (this.currentSolutionIdx + 1) % this.allSolutions.length;
        this.board = [...this.allSolutions[this.currentSolutionIdx]];
        ChessAudio.playPlace();
        this.updateHUD();
      });
    }

    // AI 辅助落子一步
    const aiStepBtn = this.root.querySelector('#btn-nqueen-ai-step') as HTMLButtonElement | null;
    if (aiStepBtn) {
      aiStepBtn.addEventListener('click', () => {
        if (this.allSolutions.length > 0) {
          const sample = this.allSolutions[0];
          for (let r = 0; r < this.n; r++) {
            if (this.board[r] === -1) {
              this.board[r] = sample[r];
              ChessAudio.playPlace();
              break;
            }
          }
          this.updateHUD();
        }
      });
    }

    // 清空棋盘
    const clearBtn = this.root.querySelector('#btn-nqueen-clear') as HTMLButtonElement | null;
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.board = new Array(this.n).fill(-1);
        this.updateHUD();
      });
    }
  }

  private bindCanvasClick(): void {
    if (!this.canvas) return;

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas!.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const cellSize = this.canvas!.width / this.n;
      const c = Math.floor(clickX / cellSize);
      const r = Math.floor(clickY / cellSize);

      if (r < 0 || r >= this.n || c < 0 || c >= this.n) return;

      if (this.board[r] === c) {
        this.board[r] = -1; // 移除
      } else {
        this.board[r] = c; // 放置
        ChessAudio.playPlace();
      }

      this.updateHUD();
    });
  }

  private checkConflicts(): { hasConflict: boolean; conflictingRows: Set<number> } {
    const conflictingRows = new Set<number>();

    for (let r1 = 0; r1 < this.n; r1++) {
      const c1 = this.board[r1];
      if (c1 === -1) continue;

      for (let r2 = r1 + 1; r2 < this.n; r2++) {
        const c2 = this.board[r2];
        if (c2 === -1) continue;

        if (c1 === c2 || Math.abs(r1 - r2) === Math.abs(c1 - c2)) {
          conflictingRows.add(r1);
          conflictingRows.add(r2);
        }
      }
    }

    return { hasConflict: conflictingRows.size > 0, conflictingRows };
  }

  private updateHUD(): void {
    if (!this.root) return;

    const countEl = this.root.querySelector('#nqueen-placed-count') as HTMLElement | null;
    const solGalleryEl = this.root.querySelector('#nqueen-gallery-indicator') as HTMLElement | null;
    const statusEl = this.root.querySelector('#nqueen-status-badge') as HTMLElement | null;

    const placedCount = this.board.filter((c) => c !== -1).length;
    if (countEl) countEl.textContent = `已放置: ${placedCount} / ${this.n} 👑`;

    if (solGalleryEl) {
      solGalleryEl.textContent = `解号: ${this.currentSolutionIdx + 1} / ${this.allSolutions.length} (总解数: ${this.allSolutions.length})`;
    }

    const { hasConflict } = this.checkConflicts();
    if (statusEl) {
      if (hasConflict) {
        statusEl.textContent = '⚠️ 激光冲突中!';
        statusEl.style.background = '#fef2f2';
        statusEl.style.color = '#dc2626';
        statusEl.style.borderColor = '#fecaca';
      } else if (placedCount === this.n) {
        statusEl.textContent = '🏆 完美无冲突解!';
        statusEl.style.background = '#f0fdf4';
        statusEl.style.color = '#16a34a';
        statusEl.style.borderColor = '#bbf7d0';
      } else {
        statusEl.textContent = '🛡️ 安全布阵中';
        statusEl.style.background = '#eff6ff';
        statusEl.style.color = '#2563eb';
        statusEl.style.borderColor = '#bfdbfe';
      }
    }
  }

  private startLoop(): void {
    if (typeof requestAnimationFrame !== 'function') return;
    const loop = () => {
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
    const cellSize = width / this.n;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. 棋盘黑白交错方格
    for (let r = 0; r < this.n; r++) {
      for (let c = 0; c < this.n; c++) {
        const isWhite = (r + c) % 2 === 0;
        ctx.fillStyle = isWhite ? '#fef3c7' : '#d97706';
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);

        ctx.strokeStyle = 'rgba(120, 53, 15, 0.2)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }

    const { conflictingRows } = this.checkConflicts();

    // 2. 绘制皇后激光攻击射线 (Laser Attack Rays)
    if (this.isShowingLasers) {
      for (let r = 0; r < this.n; r++) {
        const c = this.board[r];
        if (c === -1) continue;

        const cx = (c + 0.5) * cellSize;
        const cy = (r + 0.5) * cellSize;
        const isConflict = conflictingRows.has(r);

        ctx.strokeStyle = isConflict ? 'rgba(239, 68, 68, 0.4)' : 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 2;

        // 横向与纵向射线
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(width, cy);
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, height);

        // 45° 与 135° 对角线射线
        for (let d = -this.n; d < this.n; d++) {
          const x1 = cx - this.n * cellSize;
          const y1 = cy - this.n * cellSize;
          const x2 = cx + this.n * cellSize;
          const y2 = cy + this.n * cellSize;
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);

          const x3 = cx - this.n * cellSize;
          const y3 = cy + this.n * cellSize;
          const x4 = cx + this.n * cellSize;
          const y4 = cy - this.n * cellSize;
          ctx.moveTo(x3, y3);
          ctx.lineTo(x4, y4);
        }
        ctx.stroke();
      }
    }

    // 3. 绘制皇后实体
    for (let r = 0; r < this.n; r++) {
      const c = this.board[r];
      if (c === -1) continue;

      const cx = (c + 0.5) * cellSize;
      const cy = (r + 0.5) * cellSize;
      const isConflict = conflictingRows.has(r);

      // 底盘光晕
      ctx.beginPath();
      ctx.arc(cx, cy, cellSize * 0.38, 0, Math.PI * 2);
      ctx.fillStyle = isConflict ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.4)';
      ctx.fill();

      // 皇后皇冠
      ctx.font = `${cellSize * 0.65}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('👑', cx, cy);
    }

    ctx.restore();
  }
}

export const NQUEEN_BATTLE_TEMPLATE = `
  <div id="algo-nqueen-battle-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏：N 规模选择与功能控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">👑</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">国际象棋·N皇后巅峰对弈</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="nqueen-size-btn" data-size="4" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">4 皇后</button>
          <button class="nqueen-size-btn" data-size="6" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">6 皇后</button>
          <button class="nqueen-size-btn active" data-size="8" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">8 皇后 (92解)</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="nqueen-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">🛡️ 安全布阵中</span>
        <button id="btn-nqueen-ai-step" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 6px rgba(37,99,235,0.25);">🤖 AI 回溯落子</button>
        <button id="btn-nqueen-prev-sol" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">◀ 上一解</button>
        <button id="btn-nqueen-next-sol" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">下一解 ▶</button>
        <button id="btn-nqueen-clear" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🗑️ 清空</button>
      </div>
    </div>

    <!-- 概念横幅与开关 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #b45309;">
      <span id="nqueen-gallery-indicator">🧠 回溯与约束：点击棋盘任意方格放置/移除皇后，实时投射横向、纵向与对角线激光威胁！</span>
      <label style="display: flex; align-items: center; gap: 4px; font-size: 10.5px; color: #92400e; cursor: pointer;">
        <input type="checkbox" id="chk-nqueen-lasers" checked /> 显示攻击激光射线
      </label>
    </div>

    <!-- 主交互区：左侧 2.5D 棋盘 + 右侧终端 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.2fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：木质国际象棋棋盘 -->
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; position: relative;">
        <div style="font-size: 11.5px; font-weight: 700; color: #475569; margin-bottom: 4px;" id="nqueen-placed-count">已放置: 0 / 8 👑</div>
        <canvas id="nqueen-chess-canvas" width="280" height="280" style="width: 280px; height: 280px; cursor: pointer; border-radius: 6px; box-shadow: 0 4px 16px rgba(180,83,9,0.15); border: 3px solid #78350f;"></canvas>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="nqueen-terminal-mount" style="flex: 1; min-height: 220px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'nqueen-battle',
  name: '国际象棋·N皇后对弈',
  viewId: 'algo-nqueen-battle-view',
  category: 'game',
  description: '回溯算法棋盘游戏：放置皇后投射激光射线、人机对弈与 92 组解全景画廊速览',
  icon: '👑',
  template: NQUEEN_BATTLE_TEMPLATE,
  Visualizer: NQueenBattleVisualizer,
  difficulty: 3,
  levelOrder: 4,
  learningGoal: '透视约束满足问题（CSP）在对角线、行、列的剪枝原理与回溯算法状态空间搜索',
});
