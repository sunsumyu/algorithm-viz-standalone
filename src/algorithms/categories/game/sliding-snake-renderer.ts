/**
 * 贪吃蛇·滑动窗口大吞噬 (Sliding Window Snake: Dynamic Window Quest)
 * 经典滑动窗口算法、双指针单调收缩与 60 FPS 贪吃蛇身躯伸缩动画：
 * 1. 🐍 60 FPS 赛博贪吃蛇身躯 (蛇头 = right 延伸，蛇尾 = left 遇到重复收缩，身躯 = 滑动窗口区间 [left, right])
 * 2. 🔤 符文传送带与排异高亮 (实时呈现字符出现下标与哈希映射更新)
 * 3. 📊 实时窗口长度与历史最大纪录 (K = right - left + 1 动态表盘)
 * 4. 🎛️ 经典题库预设 (abcabcbb, bbbbb, pwwkew 与自定义输入)
 * 5. 🔊 原生 Web Audio 贪吃蛇吞食咀嚼、脱节排异与纪录突破音效
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  SLIDING_SNAKE_CODE_LANGUAGES,
  SLIDING_SNAKE_PROBLEM_HTML,
  SLIDING_SNAKE_ANALYSIS_HTML,
} from './sliding-snake-problem-content';

class SnakeAudio {
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

  public static playChomp(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playShrink(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.14);
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

export class SlidingSnakeVisualizer extends StepVisualizer<any> {
  private str = 'abcabcbb';
  private left = 0;
  private right = -1; // 尚未吞噬第一个
  private maxLen = 0;
  private charMap: Map<string, number> = new Map();
  private isAutoPlaying = false;
  private isFinished = false;

  // 画布与动画
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private lastTimestamp = 0;

  constructor() {
    super();
    this.codeLanguages = SLIDING_SNAKE_CODE_LANGUAGES;
    this.codeLines = SLIDING_SNAKE_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '滑动窗口最长子串引擎';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '贪吃蛇·滑动窗口大吞噬' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.resetString('abcabcbb');
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

  private resetString(str: string): void {
    this.str = str;
    this.left = 0;
    this.right = -1;
    this.maxLen = 0;
    this.charMap.clear();
    this.isAutoPlaying = false;
    this.isFinished = false;
    this.updateHUD();
    this.renderHashDOM();
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#snake-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: SLIDING_SNAKE_CODE_LANGUAGES,
      problemHtml: SLIDING_SNAKE_PROBLEM_HTML,
      analysisHtml: SLIDING_SNAKE_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步吞噬下一字符
    const stepBtn = this.root.querySelector('#btn-snake-step') as HTMLButtonElement | null;
    if (stepBtn) {
      stepBtn.addEventListener('click', () => this.stepForward());
    }

    // 一键自动爬行
    const autoBtn = this.root.querySelector('#btn-snake-auto') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => this.runAutoCrawl());
    }

    // 预设字符串
    this.root.querySelectorAll<HTMLButtonElement>('.snake-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.str || 'abcabcbb';
        this.root?.querySelectorAll('.snake-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.resetString(val);
      });
    });

    // 重置
    const resetBtn = this.root.querySelector('#btn-snake-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetString(this.str));
    }
  }

  // 滑动窗口核心逻辑：向前移动 1 步
  private stepForward(): void {
    if (this.isFinished || this.right >= this.str.length - 1) {
      this.isFinished = true;
      SnakeAudio.playWin();
      this.updateHUD();
      return;
    }

    this.right++;
    const ch = this.str[this.right];

    // 检查重复
    if (this.charMap.has(ch) && this.charMap.get(ch)! >= this.left) {
      // 触发蛇尾收缩排异
      this.left = this.charMap.get(ch)! + 1;
      SnakeAudio.playShrink();
    } else {
      SnakeAudio.playChomp();
    }

    this.charMap.set(ch, this.right);
    const curLen = this.right - this.left + 1;
    this.maxLen = Math.max(this.maxLen, curLen);

    if (this.right === this.str.length - 1) {
      this.isFinished = true;
      SnakeAudio.playWin();
    }

    this.updateHUD();
    this.renderHashDOM();
  }

  private runAutoCrawl(): void {
    if (this.isFinished) return;
    this.isAutoPlaying = true;

    const crawl = () => {
      if (!this.isAutoPlaying || this.isFinished || this.right >= this.str.length - 1) {
        this.isAutoPlaying = false;
        return;
      }
      this.stepForward();
      if (!this.isFinished) {
        setTimeout(crawl, 500);
      }
    };
    crawl();
  }

  private updateHUD(): void {
    if (!this.root) return;

    const lenEl = this.root.querySelector('#snake-current-len') as HTMLElement | null;
    const maxEl = this.root.querySelector('#snake-max-len') as HTMLElement | null;
    const pointersEl = this.root.querySelector('#snake-pointers-info') as HTMLElement | null;
    const statusEl = this.root.querySelector('#snake-status-badge') as HTMLElement | null;

    const curLen = this.right >= 0 ? this.right - this.left + 1 : 0;
    if (lenEl) lenEl.textContent = `📏 当前蛇身长度: ${curLen}`;
    if (maxEl) maxEl.textContent = `🏆 历史最长无重复纪录: ${this.maxLen}`;

    if (pointersEl) {
      pointersEl.innerHTML = `蛇尾 [Left]: <b>#${this.left}</b> | 蛇头 [Right]: <b>#${this.right >= 0 ? this.right : '-'}</b>`;
    }

    if (statusEl) {
      if (this.isFinished) {
        statusEl.textContent = `🎉 传送带吞噬完毕！最长子串: ${this.maxLen}`;
        statusEl.style.background = '#f0fdf4';
        statusEl.style.color = '#16a34a';
      } else {
        statusEl.textContent = `🐍 窗口滑动中...`;
        statusEl.style.background = '#eff6ff';
        statusEl.style.color = '#2563eb';
      }
    }
  }

  private renderHashDOM(): void {
    if (!this.root) return;
    const container = this.root.querySelector('#snake-hash-container') as HTMLElement | null;
    if (!container) return;

    container.innerHTML = '';
    this.charMap.forEach((lastIdx, ch) => {
      const tag = document.createElement('div');
      const inWindow = lastIdx >= this.left;
      tag.style.cssText = `padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; font-family: monospace; border: 1px solid ${inWindow ? '#86efac' : '#cbd5e1'}; background: ${inWindow ? '#f0fdf4' : '#f1f5f9'}; color: ${inWindow ? '#166534' : '#64748b'};`;
      tag.textContent = `'${ch}': #${lastIdx}`;
      container.appendChild(tag);
    });
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
    const n = this.str.length;
    const cellW = width / (n + 1);

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. 赛博传送带暗色背景
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // 传送带发光轨道
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, height / 2 - 25, width, 50);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, height / 2 - 25, width, 50);

    // 2. 绘制贪吃蛇发光身躯 (覆盖 [left, right] 区间)
    if (this.right >= this.left && this.right >= 0) {
      const sx = (this.left + 1) * cellW - cellW * 0.4;
      const ex = (this.right + 1) * cellW + cellW * 0.4;
      const snakeW = ex - sx;

      // 蛇身外光晕
      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.beginPath();
      ctx.roundRect(sx - 4, height / 2 - 28, snakeW + 8, 56, 12);
      ctx.fill();

      // 蛇身实体
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.roundRect(sx, height / 2 - 22, snakeW, 44, 8);
      ctx.fill();

      ctx.strokeStyle = '#86efac';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 3. 绘制字符符文方块
    for (let i = 0; i < n; i++) {
      const ch = this.str[i];
      const cx = (i + 1) * cellW;
      const cy = height / 2;
      const inWindow = i >= this.left && i <= this.right;

      // 字符方块
      ctx.save();
      ctx.translate(cx, cy);

      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = inWindow ? '#ffffff' : '#94a3b8';
      ctx.fillText(ch, 0, 0);

      // 下标标记
      ctx.font = '9px monospace';
      ctx.fillStyle = inWindow ? '#86efac' : '#64748b';
      ctx.fillText(`#${i}`, 0, 32);

      ctx.restore();
    }

    // 4. 绘制蛇头与蛇尾图标
    if (this.right >= 0) {
      const headX = (this.right + 1) * cellW;
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🐍', headX, height / 2 - 38);
    }

    ctx.restore();
  }
}

export const SLIDING_SNAKE_TEMPLATE = `
  <div id="algo-sliding-snake-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏：题库预设与功能控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🐍</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">贪吃蛇·滑动窗口大吞噬</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="snake-preset-btn active" data-str="abcabcbb" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">"abcabcbb"</button>
          <button class="snake-preset-btn" data-str="pwwkew" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">"pwwkew"</button>
          <button class="snake-preset-btn" data-str="bbbbb" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">"bbbbb"</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="snake-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">🐍 窗口滑动中...</span>
        <button id="btn-snake-step" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border: none; border-radius: 6px; padding: 4px 12px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(16,185,129,0.25);">👉 吞噬下一字符 (Right++)</button>
        <button id="btn-snake-auto" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 6px rgba(37,99,235,0.25);">✨ 自动爬行</button>
        <button id="btn-snake-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 概念横幅与双指针状态 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #1e40af;">
      <span id="snake-pointers-info">蛇尾 [Left]: <b>#0</b> | 蛇头 [Right]: <b>#-</b></span>
      <div style="display: flex; gap: 12px;">
        <span id="snake-current-len" style="font-weight: 700;">📏 当前蛇身长度: 0</span>
        <span id="snake-max-len" style="font-weight: 800; color: #16a34a;">🏆 历史最长无重复纪录: 0</span>
      </div>
    </div>

    <!-- 主交互区：左侧 60 FPS 贪吃蛇 Canvas + 哈希映射表，右侧终端 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.35fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：贪吃蛇 Canvas 与哈希表 -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #334155;">
          <canvas id="snake-canvas" width="460" height="150" style="width: 460px; height: 150px;"></canvas>
        </div>

        <!-- 字符哈希最近位置 -->
        <div style="display: flex; flex-direction: column; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px;">
          <div style="font-size: 10.5px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">🗂️ 字符最近下标哈希映射 (Char Map):</div>
          <div id="snake-hash-container" style="display: flex; gap: 4px; flex-wrap: wrap;"></div>
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="snake-terminal-mount" style="flex: 1; min-height: 220px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'sliding-snake',
  name: '贪吃蛇·滑动窗口大吞噬',
  viewId: 'algo-sliding-snake-view',
  category: 'game',
  description: '滑动窗口双指针游戏：赛博贪吃蛇身躯伸缩、符文排异机制、实时哈希映射与无重复最长子串求解',
  icon: '🐍',
  template: SLIDING_SNAKE_TEMPLATE,
  Visualizer: SlidingSnakeVisualizer,
  difficulty: 2,
  levelOrder: 10,
  learningGoal: '通过贪吃蛇身躯伸缩实战，彻底掌握滑动窗口右边界主动探索、左边界被动收缩与哈希去重的时空优化',
});
