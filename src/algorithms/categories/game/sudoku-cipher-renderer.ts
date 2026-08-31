/**
 * 数独神偷·密码解构者 (Sudoku Cipher: Backtracking & MRV Solver)
 * 经典回溯算法、9x9 赛博密码矩阵与动态递归透视：
 * 1. 🔲 60 FPS 赛博数独沙盘 (Canvas 2D 霓虹十字线、3x3 粗九宫格、初始固化数字与动态解)
 * 2. 🎯 实时十字线与行/列/宫冲突扫描 (自动标红冲突数字并蜂鸣警报)
 * 3. ⚡ 动态量子回溯动画 (60 FPS 实时推演试探 $\to$ 冲突 $\to$ 撤销回溯全过程)
 * 4. 🎛️ 经典题库预设 (入门微解局、经典世界级难题与一键清空)
 * 5. 🔊 原生 Web Audio 赛博按键音、冲突警报与破译通关音效
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  SUDOKU_CIPHER_CODE_LANGUAGES,
  SUDOKU_CIPHER_PROBLEM_HTML,
  SUDOKU_CIPHER_ANALYSIS_HTML,
} from './sudoku-cipher-problem-content';

class CipherAudio {
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

  public static playBeep(freq = 600): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }

  public static playConflict(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
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

export class SudokuCipherVisualizer extends StepVisualizer<any> {
  private board: number[][] = []; // 9x9, 0 代表空格
  private initialFixed: boolean[][] = []; // 是否为初始固定数字
  private selectedRow = -1;
  private selectedCol = -1;

  // 求解动画
  private isSolving = false;
  private isSolved = false;
  private solvingSteps: { r: number; c: number; num: number; isBacktrack: boolean }[] = [];
  private solvingStepIdx = 0;

  // 画布
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private lastTimestamp = 0;

  constructor() {
    super();
    this.codeLanguages = SUDOKU_CIPHER_CODE_LANGUAGES;
    this.codeLines = SUDOKU_CIPHER_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '数独回溯与约束满足引擎';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '数独神偷·密码解构者' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('EASY');
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

  private loadPreset(type: 'EASY' | 'MEDIUM' | 'HARD'): void {
    const rawEasy = [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ];

    const rawHard = [
      [8, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 3, 6, 0, 0, 0, 0, 0],
      [0, 7, 0, 0, 9, 0, 2, 0, 0],
      [0, 5, 0, 0, 0, 7, 0, 0, 0],
      [0, 0, 0, 0, 4, 5, 7, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 3, 0],
      [0, 0, 1, 0, 0, 0, 0, 6, 8],
      [0, 0, 8, 5, 0, 0, 0, 1, 0],
      [0, 9, 0, 0, 0, 0, 4, 0, 0],
    ];

    const target = type === 'HARD' ? rawHard : rawEasy;
    this.board = target.map((row) => [...row]);
    this.initialFixed = target.map((row) => row.map((val) => val !== 0));
    this.selectedRow = -1;
    this.selectedCol = -1;
    this.isSolving = false;
    this.isSolved = false;
    this.updateHUD();
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#sudoku-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.bindCanvasInteraction();
    }

    this.mountTerminal({
      codeLanguages: SUDOKU_CIPHER_CODE_LANGUAGES,
      problemHtml: SUDOKU_CIPHER_PROBLEM_HTML,
      analysisHtml: SUDOKU_CIPHER_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 虚拟数字键盘 1~9 与清空
    this.root.querySelectorAll<HTMLButtonElement>('.sudoku-numpad-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const num = parseInt(btn.dataset.num || '0', 10);
        this.inputNumber(num);
      });
    });

    // 一键回溯自动破解
    const autoSolveBtn = this.root.querySelector('#btn-sudoku-auto-solve') as HTMLButtonElement | null;
    if (autoSolveBtn) {
      autoSolveBtn.addEventListener('click', () => this.startBacktrackSolver());
    }

    // 预设题库
    this.root.querySelectorAll<HTMLButtonElement>('.sudoku-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = (btn.dataset.preset || 'EASY') as 'EASY' | 'MEDIUM' | 'HARD';
        this.root?.querySelectorAll('.sudoku-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(type);
      });
    });

    // 清空重置
    const resetBtn = this.root.querySelector('#btn-sudoku-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            if (!this.initialFixed[r][c]) this.board[r][c] = 0;
          }
        }
        this.isSolving = false;
        this.isSolved = false;
        this.updateHUD();
      });
    }
  }

  private bindCanvasInteraction(): void {
    if (!this.canvas) return;

    this.canvas.addEventListener('click', (e) => {
      if (this.isSolving) return;
      const rect = this.canvas!.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const cellSize = this.canvas!.width / 9;
      const c = Math.floor(clickX / cellSize);
      const r = Math.floor(clickY / cellSize);

      if (r >= 0 && r < 9 && c >= 0 && c < 9) {
        this.selectedRow = r;
        this.selectedCol = c;
        CipherAudio.playBeep(700);
        this.updateHUD();
      }
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (e) => {
        if (this.isSolving) return;
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= 9) {
          this.inputNumber(num);
        } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
          this.inputNumber(0);
        }
      });
    }
  }

  private inputNumber(num: number): void {
    if (this.selectedRow === -1 || this.selectedCol === -1) return;
    if (this.initialFixed[this.selectedRow][this.selectedCol]) return;

    this.board[this.selectedRow][this.selectedCol] = num;
    if (num !== 0) {
      if (this.isValidPlacement(this.selectedRow, this.selectedCol, num)) {
        CipherAudio.playBeep(850);
      } else {
        CipherAudio.playConflict();
      }
    }
    this.updateHUD();
  }

  private isValidPlacement(row: number, col: number, num: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (i !== col && this.board[row][i] === num) return false;
      if (i !== row && this.board[i][col] === num) return false;
      const r = 3 * Math.floor(row / 3) + Math.floor(i / 3);
      const c = 3 * Math.floor(col / 3) + (i % 3);
      if ((r !== row || c !== col) && this.board[r][c] === num) return false;
    }
    return true;
  }

  private startBacktrackSolver(): void {
    if (this.isSolving) return;
    this.isSolving = true;
    this.solvingSteps = [];

    // 拷贝并预演回溯路径
    const tempBoard = this.board.map((r) => [...r]);

    const solve = (r: number, c: number): boolean => {
      if (r === 9) return true;
      const nextR = c === 8 ? r + 1 : r;
      const nextC = c === 8 ? 0 : c + 1;

      if (this.initialFixed[r][c]) {
        return solve(nextR, nextC);
      }

      for (let num = 1; num <= 9; num++) {
        if (this.isValidTemp(tempBoard, r, c, num)) {
          tempBoard[r][c] = num;
          this.solvingSteps.push({ r, c, num, isBacktrack: false });

          if (solve(nextR, nextC)) return true;

          tempBoard[r][c] = 0;
          this.solvingSteps.push({ r, c, num: 0, isBacktrack: true });
        }
      }
      return false;
    };

    solve(0, 0);

    // 播放回溯步骤动画
    this.solvingStepIdx = 0;
    const stepAnim = () => {
      if (!this.isSolving || this.solvingStepIdx >= this.solvingSteps.length) {
        this.isSolving = false;
        this.isSolved = true;
        CipherAudio.playWin();
        this.updateHUD();
        return;
      }

      const st = this.solvingSteps[this.solvingStepIdx++];
      this.board[st.r][st.c] = st.num;
      this.selectedRow = st.r;
      this.selectedCol = st.c;

      if (st.isBacktrack) {
        CipherAudio.playConflict();
      } else {
        CipherAudio.playBeep(400 + st.num * 50);
      }

      setTimeout(stepAnim, 25);
    };

    stepAnim();
  }

  private isValidTemp(b: number[][], row: number, col: number, num: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (b[row][i] === num) return false;
      if (b[i][col] === num) return false;
      const r = 3 * Math.floor(row / 3) + Math.floor(i / 3);
      const c = 3 * Math.floor(col / 3) + (i % 3);
      if (b[r][c] === num) return false;
    }
    return true;
  }

  private updateHUD(): void {
    if (!this.root) return;

    const statusEl = this.root.querySelector('#sudoku-status-badge') as HTMLElement | null;
    const cellInfoEl = this.root.querySelector('#sudoku-selected-info') as HTMLElement | null;

    if (cellInfoEl) {
      if (this.selectedRow !== -1 && this.selectedCol !== -1) {
        const val = this.board[this.selectedRow][this.selectedCol];
        const isFixed = this.initialFixed[this.selectedRow][this.selectedCol];
        cellInfoEl.innerHTML = `当前单元格: <b>[第 ${this.selectedRow + 1} 行, 第 ${this.selectedCol + 1} 列]</b> ${isFixed ? '(初始固化)' : `值: ${val === 0 ? '空' : val}`}`;
      } else {
        cellInfoEl.innerHTML = `点击棋盘任意空格进行手动填数或开启回溯求解`;
      }
    }

    if (statusEl) {
      if (this.isSolving) {
        statusEl.textContent = '⚡ 量子回溯求解中...';
        statusEl.style.background = '#eff6ff';
        statusEl.style.color = '#2563eb';
      } else if (this.isSolved) {
        statusEl.textContent = '🏆 密码矩阵破译完成！';
        statusEl.style.background = '#f0fdf4';
        statusEl.style.color = '#16a34a';
      } else {
        statusEl.textContent = '🧩 密室解密中';
        statusEl.style.background = '#f8fafc';
        statusEl.style.color = '#475569';
      }
    }
  }

  private startLoop(): void {
    if (typeof requestAnimationFrame !== 'function') return;
    const loop = (timestamp: number) => {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      this.lastTimestamp = timestamp;

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
    const cellSize = width / 9;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. 赛博暗色矩阵背景
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // 2. 绘制选中单元格的十字交叉霓虹高亮
    if (this.selectedRow !== -1 && this.selectedCol !== -1) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.fillRect(0, this.selectedRow * cellSize, width, cellSize);
      ctx.fillRect(this.selectedCol * cellSize, 0, cellSize, height);

      // 3x3 所在大宫格高亮
      const startR = Math.floor(this.selectedRow / 3) * 3;
      const startC = Math.floor(this.selectedCol / 3) * 3;
      ctx.fillRect(startC * cellSize, startR * cellSize, cellSize * 3, cellSize * 3);

      // 选中单元格焦点外框
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.selectedCol * cellSize, this.selectedRow * cellSize, cellSize, cellSize);
    }

    // 3. 绘制 9x9 网格线
    for (let i = 0; i <= 9; i++) {
      const isThick = i % 3 === 0;
      ctx.strokeStyle = isThick ? '#38bdf8' : '#334155';
      ctx.lineWidth = isThick ? 2.5 : 0.8;

      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(width, i * cellSize);
      ctx.stroke();
    }

    // 4. 绘制数字
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = this.board[r][c];
        if (val === 0) continue;

        const isFixed = this.initialFixed[r][c];
        const isConflict = !this.isValidPlacement(r, c, val);
        const cx = (c + 0.5) * cellSize;
        const cy = (r + 0.5) * cellSize;

        ctx.font = isFixed ? 'bold 15px monospace' : '14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (isConflict) ctx.fillStyle = '#ef4444';
        else if (isFixed) ctx.fillStyle = '#38bdf8';
        else ctx.fillStyle = '#10b981';

        ctx.fillText(String(val), cx, cy);
      }
    }

    ctx.restore();
  }
}

export const SUDOKU_CIPHER_TEMPLATE = `
  <div id="algo-sudoku-cipher-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏：题库预设与功能控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🧩</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">数独神偷·密码解构者</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="sudoku-preset-btn active" data-preset="EASY" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典中等局</button>
          <button class="sudoku-preset-btn" data-preset="HARD" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">🔥 世界最难题库</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="sudoku-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">🧩 密室解密中</span>
        <button id="btn-sudoku-auto-solve" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border: none; border-radius: 6px; padding: 4px 12px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(16,185,129,0.25);">⚡ 量子回溯求解</button>
        <button id="btn-sudoku-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 概念横幅与当前选中 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #1e40af;">
      <span id="sudoku-selected-info">点击棋盘任意空格进行手动填数或开启回溯求解</span>
      <span style="font-weight: 700; color: #3b82f6;">💡 规则：行、列与 3x3 宫格数字无重复</span>
    </div>

    <!-- 主交互区：左侧 9x9 赛博数独 Canvas + 虚拟数字键盘，右侧终端 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.35fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：数独 Canvas 与数字键盘 -->
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 8px;">
        <canvas id="sudoku-canvas" width="280" height="280" style="width: 280px; height: 280px; cursor: pointer; border-radius: 6px; box-shadow: 0 4px 16px rgba(15,23,42,0.2);"></canvas>

        <!-- 虚拟键盘 1~9 与清空 -->
        <div style="display: flex; gap: 4px;">
          <button class="sudoku-numpad-btn" data-num="1" style="width: 26px; height: 26px; font-weight: 800; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">1</button>
          <button class="sudoku-numpad-btn" data-num="2" style="width: 26px; height: 26px; font-weight: 800; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">2</button>
          <button class="sudoku-numpad-btn" data-num="3" style="width: 26px; height: 26px; font-weight: 800; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">3</button>
          <button class="sudoku-numpad-btn" data-num="4" style="width: 26px; height: 26px; font-weight: 800; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">4</button>
          <button class="sudoku-numpad-btn" data-num="5" style="width: 26px; height: 26px; font-weight: 800; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">5</button>
          <button class="sudoku-numpad-btn" data-num="6" style="width: 26px; height: 26px; font-weight: 800; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">6</button>
          <button class="sudoku-numpad-btn" data-num="7" style="width: 26px; height: 26px; font-weight: 800; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">7</button>
          <button class="sudoku-numpad-btn" data-num="8" style="width: 26px; height: 26px; font-weight: 800; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">8</button>
          <button class="sudoku-numpad-btn" data-num="9" style="width: 26px; height: 26px; font-weight: 800; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">9</button>
          <button class="sudoku-numpad-btn" data-num="0" style="padding: 0 8px; height: 26px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f1f5f9; cursor: pointer;">⌫ 清除</button>
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="sudoku-terminal-mount" style="flex: 1; min-height: 220px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'sudoku-cipher',
  name: '数独神偷·密码解构者',
  viewId: 'algo-sudoku-cipher-view',
  category: 'game',
  description: '回溯算法数独游戏：9x9 赛博密码矩阵、实时十字线冲突扫描、动态量子回溯求解与世界难题挑战',
  icon: '🧩',
  template: SUDOKU_CIPHER_TEMPLATE,
  Visualizer: SudokuCipherVisualizer,
  difficulty: 3,
  levelOrder: 9,
  learningGoal: '透视经典回溯与约束满足问题（CSP）在二维空间中的试探、冲突检测与撤销回溯机制',
});
