/**
 * 回文忍者·神速飞刀切割者 (Palindrome Ninja: Backtracking Slicer)
 * 经典回溯算法、竹简神速飞刀切割与全解画廊：
 * 1. 🥷 60 FPS 竹林忍道修罗场 (Canvas 2D 拟真竹简、发光神刃刀痕、回文金光与非回文碎裂)
 * 2. 🗡️ 实时交互切割 (点击字符间隙拔刀切断/缝合，实时判断子串回文有效性)
 * 3. 🖼️ 全解方案画廊 (一键推演全部合法回文子串组合并自由切换)
 * 4. 🎛️ 经典题库预设 ("aab", "cbbbcc", "racecar", "efe")
 * 5. 🔊 原生 Web Audio 飞刀出鞘破空声、竹简斩断与通关清脆音效
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  PALINDROME_NINJA_CODE_LANGUAGES,
  PALINDROME_NINJA_PROBLEM_HTML,
  PALINDROME_NINJA_ANALYSIS_HTML,
} from './palindrome-ninja-problem-content';

export interface SlashCut {
  x: number;
  y: number;
  progress: number;
}

class NinjaAudio {
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

  public static playSlash(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  public static playPalindromeChime(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
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

export class PalindromeNinjaVisualizer extends StepVisualizer<any> {
  private str = 'aab';
  private cuts: Set<number> = new Set(); // 存储切割点下标 (0 代表 index 0 与 1 之间)
  private allSolutions: string[][] = [];
  private currentSolIdx = 0;

  // 刀光粒子动画
  private slashEffects: SlashCut[] = [];

  // 画布与动画
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private lastTimestamp = 0;

  constructor() {
    super();
    this.codeLanguages = PALINDROME_NINJA_CODE_LANGUAGES;
    this.codeLines = PALINDROME_NINJA_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '回文分割回溯求解引擎';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '回文忍者·神速飞刀切割者' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadString('aab');
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

  private loadString(s: string): void {
    this.str = s;
    this.cuts.clear();
    this.slashEffects = [];
    this.computeAllSolutions();
    this.currentSolIdx = 0;
    this.updateHUD();
  }

  private isPalindrome(s: string, start: number, end: number): boolean {
    while (start < end) {
      if (s[start++] !== s[end--]) return false;
    }
    return true;
  }

  private computeAllSolutions(): void {
    const res: string[][] = [];
    const path: string[] = [];

    const dfs = (start: number) => {
      if (start >= this.str.length) {
        res.push([...path]);
        return;
      }
      for (let i = start; i < this.str.length; i++) {
        if (this.isPalindrome(this.str, start, i)) {
          path.push(this.str.slice(start, i + 1));
          dfs(i + 1);
          path.pop();
        }
      }
    };

    dfs(0);
    this.allSolutions = res;
  }

  private getChunksFromCuts(): string[] {
    const chunks: string[] = [];
    let start = 0;
    for (let i = 0; i < this.str.length - 1; i++) {
      if (this.cuts.has(i)) {
        chunks.push(this.str.slice(start, i + 1));
        start = i + 1;
      }
    }
    chunks.push(this.str.slice(start));
    return chunks;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#ninja-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.bindCanvasInteraction();
    }

    this.mountTerminal({
      codeLanguages: PALINDROME_NINJA_CODE_LANGUAGES,
      problemHtml: PALINDROME_NINJA_PROBLEM_HTML,
      analysisHtml: PALINDROME_NINJA_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 方案画廊 上一方案 / 下一方案
    const prevBtn = this.root.querySelector('#btn-ninja-prev-sol') as HTMLButtonElement | null;
    const nextBtn = this.root.querySelector('#btn-ninja-next-sol') as HTMLButtonElement | null;

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.allSolutions.length === 0) return;
        this.currentSolIdx = (this.currentSolIdx - 1 + this.allSolutions.length) % this.allSolutions.length;
        this.applySolution(this.allSolutions[this.currentSolIdx]);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.allSolutions.length === 0) return;
        this.currentSolIdx = (this.currentSolIdx + 1) % this.allSolutions.length;
        this.applySolution(this.allSolutions[this.currentSolIdx]);
      });
    }

    // 预设题库
    this.root.querySelectorAll<HTMLButtonElement>('.ninja-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.str || 'aab';
        this.root?.querySelectorAll('.ninja-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadString(val);
      });
    });

    // 重置
    const resetBtn = this.root.querySelector('#btn-ninja-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.cuts.clear();
        this.updateHUD();
      });
    }
  }

  private applySolution(sol: string[]): void {
    this.cuts.clear();
    let curr = 0;
    for (let i = 0; i < sol.length - 1; i++) {
      curr += sol[i].length;
      this.cuts.add(curr - 1);
    }
    NinjaAudio.playPalindromeChime();
    this.updateHUD();
  }

  private bindCanvasInteraction(): void {
    if (!this.canvas) return;

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas!.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const n = this.str.length;
      const cellW = (this.canvas!.width || 460) / (n + 1);

      // 检查是否点击在某个间隙附近
      for (let i = 0; i < n - 1; i++) {
        const gapX = (i + 1) * cellW + cellW * 0.5;
        if (Math.abs(clickX - gapX) <= 18) {
          if (this.cuts.has(i)) {
            this.cuts.delete(i);
          } else {
            this.cuts.add(i);
            this.slashEffects.push({
              x: gapX,
              y: clickY,
              progress: 0,
            });
            NinjaAudio.playSlash();
          }
          this.updateHUD();
          break;
        }
      }
    });
  }

  private updateHUD(): void {
    if (!this.root) return;

    const chunks = this.getChunksFromCuts();
    const allPalindromes = chunks.every((chk) => this.isPalindrome(chk, 0, chk.length - 1));

    const solInfoEl = this.root.querySelector('#ninja-sol-indicator') as HTMLElement | null;
    const statusEl = this.root.querySelector('#ninja-status-badge') as HTMLElement | null;
    const chunksDisplayEl = this.root.querySelector('#ninja-chunks-display') as HTMLElement | null;

    if (solInfoEl) {
      solInfoEl.innerHTML = `当前方案: <b>${this.currentSolIdx + 1} / ${this.allSolutions.length}</b> (总回文方案数: ${this.allSolutions.length})`;
    }

    if (chunksDisplayEl) {
      chunksDisplayEl.innerHTML = `当前切片: <b>[ ${chunks.map((c) => `"${c}"`).join(', ')} ]</b>`;
    }

    if (statusEl) {
      if (allPalindromes) {
        statusEl.textContent = '🏆 全切片皆为回文！';
        statusEl.style.background = '#f0fdf4';
        statusEl.style.color = '#16a34a';
      } else {
        statusEl.textContent = '💥 存在非回文碎片';
        statusEl.style.background = '#fef2f2';
        statusEl.style.color = '#dc2626';
      }
    }
  }

  private startLoop(): void {
    if (typeof requestAnimationFrame !== 'function') return;
    const loop = (timestamp: number) => {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
      this.lastTimestamp = timestamp;

      this.updatePhysics(dt);
      this.renderCanvas();

      if (typeof requestAnimationFrame === 'function') {
        this.animFrameId = requestAnimationFrame(loop);
      }
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private updatePhysics(dt: number): void {
    for (let i = this.slashEffects.length - 1; i >= 0; i--) {
      const se = this.slashEffects[i];
      se.progress += dt * 3.5;
      if (se.progress >= 1) {
        this.slashEffects.splice(i, 1);
      }
    }
  }

  private renderCanvas(): void {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const n = this.str.length;
    const cellW = width / (n + 1);

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. 竹林和风背景
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(0, 0, width, height);

    // 2. 绘制竹简字符块与切片连通性
    const chunks = this.getChunksFromCuts();

    for (let i = 0; i < n; i++) {
      const ch = this.str[i];
      const cx = (i + 1) * cellW;
      const cy = height / 2;

      ctx.save();
      ctx.translate(cx, cy);

      // 竹简方块
      ctx.fillStyle = '#047857';
      ctx.beginPath();
      ctx.roundRect(-cellW * 0.42, -30, cellW * 0.84, 60, 6);
      ctx.fill();

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(ch, 0, 0);

      ctx.restore();
    }

    // 3. 绘制发光刀痕 (Active Cuts)
    for (let i = 0; i < n - 1; i++) {
      const gapX = (i + 1) * cellW + cellW * 0.5;

      if (this.cuts.has(i)) {
        // 切开刀痕
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(gapX, height / 2 - 38);
        ctx.lineTo(gapX, height / 2 + 38);
        ctx.stroke();

        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🗡️', gapX, height / 2 - 46);
      } else {
        // 未切开的缝隙提示
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(gapX, height / 2 - 25);
        ctx.lineTo(gapX, height / 2 + 25);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // 4. 绘制刀光飞斩特效
    for (const se of this.slashEffects) {
      const p = se.progress;
      ctx.save();
      ctx.strokeStyle = `rgba(255, 255, 255, ${1 - p})`;
      ctx.lineWidth = 5 * (1 - p);
      ctx.beginPath();
      ctx.moveTo(se.x - 15, se.y - 40 * (1 - p));
      ctx.lineTo(se.x + 15, se.y + 40 * (1 - p));
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }
}

export const PALINDROME_NINJA_TEMPLATE = `
  <div id="algo-palindrome-ninja-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏：题库预设与功能控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🗡️</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">回文忍者·神速飞刀切割者</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="ninja-preset-btn active" data-str="aab" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">"aab"</button>
          <button class="ninja-preset-btn" data-str="efe" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">"efe"</button>
          <button class="ninja-preset-btn" data-str="cbbbcc" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">"cbbbcc"</button>
          <button class="ninja-preset-btn" data-str="racecar" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">🔥 "racecar"</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="ninja-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">🗡️ 拔刀切竹中</span>
        <button id="btn-ninja-prev-sol" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">◀ 上一解</button>
        <button id="btn-ninja-next-sol" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">下一解 ▶</button>
        <button id="btn-ninja-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 概念横幅与切片状态 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #065f46;">
      <span id="ninja-sol-indicator">当前方案: 1 / 2</span>
      <span id="ninja-chunks-display" style="font-weight: 700;">当前切片: [ "aab" ]</span>
    </div>

    <!-- 主交互区：左侧 60 FPS 竹林 Canvas + 右侧终端 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.35fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：竹林沙盘 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #064e3b; border-radius: 6px; overflow: hidden; border: 1px solid #059669;">
          <canvas id="ninja-canvas" width="460" height="180" style="width: 460px; height: 180px; cursor: pointer;"></canvas>
        </div>
        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          💡 点击竹简间的虚线空隙可拔刀切断/缝合，回溯算法确保每一个切片都是完美对称的回文串！
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="ninja-terminal-mount" style="flex: 1; min-height: 220px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'palindrome-ninja',
  name: '回文忍者·神速飞刀切割者',
  viewId: 'algo-palindrome-ninja-view',
  category: 'game',
  description: '回溯分割算法游戏：竹林修罗场、神速飞刀刀光粒子、回文有效性检测与全解画廊速览',
  icon: '🗡️',
  template: PALINDROME_NINJA_TEMPLATE,
  Visualizer: PalindromeNinjaVisualizer,
  difficulty: 2,
  levelOrder: 12,
  learningGoal: '掌握经典回溯算法在字符串分割、组合生成与回文子串判定中的应用机制',
});
