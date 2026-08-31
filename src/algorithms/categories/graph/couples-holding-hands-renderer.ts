/**
 * 情侣牵手与并查集连通环置换 (Couples Holding Hands / Union-Find Permutation Cycles) 可视化引擎
 * 参考左程云《算法通关课》【必备篇】class056: 置换环分解定理、最少交换次数 N - Sets (LeetCode 765)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  COUPLES_CODE_LANGUAGES,
  COUPLES_PROBLEM_HTML,
  COUPLES_ANALYSIS_HTML,
} from './couples-holding-hands-problem-content';

export interface CoupleStep {
  type: 'SCAN_PAIR' | 'UNION_SETS' | 'ALREADY_COUPLE' | 'DONE';
  pairIdx: number;
  p1: number;
  p2: number;
  c1: number;
  c2: number;
  parentSnapshot: number[];
  setsCount: number;
  minSwaps: number;
  message: string;
}

class CoupleAudio {
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

  public static playMatch(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  public static playUnion(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
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
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
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

export class CouplesHoldingHandsVisualizer extends StepVisualizer<any> {
  // 情侣与座位数据
  private row: number[] = [0, 2, 1, 3, 4, 6, 5, 7];
  private n = 4; // 情侣对数
  private nodePositions: Map<number, { x: number; y: number }> = new Map();

  // 推演步骤
  private traceSteps: CoupleStep[] = [];
  private currentStepPtr = 0;
  private isAutoPlaying = false;
  private autoPlayTimer: any = null;
  private playSpeed = 1;

  // 画布与动画
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private lastTimestamp = 0;
  private heartBeatAnim = 0;

  constructor() {
    super();
    this.codeLanguages = COUPLES_CODE_LANGUAGES;
    this.codeLines = COUPLES_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '情侣牵手并查集置换引擎 (LeetCode 765)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '情侣牵手并查集置换' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_2_SWAPS');
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

    if (presetKey === 'CLASSIC_2_SWAPS') {
      this.row = [0, 2, 1, 3, 4, 6, 5, 7];
    } else if (presetKey === 'BIG_CYCLE_3_SWAPS') {
      this.row = [0, 3, 2, 5, 4, 7, 6, 1];
    } else if (presetKey === 'ONE_MISMATCH') {
      this.row = [0, 1, 2, 5, 4, 3, 6, 7];
    } else if (presetKey === 'PARTY_N6') {
      this.row = [0, 3, 2, 5, 4, 7, 6, 9, 8, 11, 10, 1];
    }

    this.n = this.row.length / 2;
    this.layoutGraphNodes();
    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private layoutGraphNodes(): void {
    this.nodePositions.clear();
    const count = this.n;
    const centerX = 230;
    const centerY = 115;
    const radius = Math.min(85, count * 16);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      this.nodePositions.set(i, { x, y });
    }
  }

  private computeTraceSteps(): void {
    const n = this.n;
    const parent: number[] = Array.from({ length: n }, (_, i) => i);
    let sets = n;

    const find = (i: number): number => {
      if (parent[i] !== i) parent[i] = find(parent[i]);
      return parent[i];
    };

    const union = (x: number, y: number): boolean => {
      const fx = find(x);
      const fy = find(y);
      if (fx !== fy) {
        parent[fx] = fy;
        sets--;
        return true;
      }
      return false;
    };

    const steps: CoupleStep[] = [];
    const cloneParent = () => [...parent];

    steps.push({
      type: 'SCAN_PAIR',
      pairIdx: -1,
      p1: -1,
      p2: -1,
      c1: -1,
      c2: -1,
      parentSnapshot: cloneParent(),
      setsCount: sets,
      minSwaps: n - sets,
      message: `🚀 初始化：共有 ${n} 对情侣，初始 ${sets} 个独立并查集连通块。`,
    });

    for (let i = 0; i < this.row.length; i += 2) {
      const p1 = this.row[i];
      const p2 = this.row[i + 1];
      const c1 = Math.floor(p1 / 2);
      const c2 = Math.floor(p2 / 2);
      const sofaIdx = i / 2;

      if (c1 === c2) {
        steps.push({
          type: 'ALREADY_COUPLE',
          pairIdx: sofaIdx,
          p1,
          p2,
          c1,
          c2,
          parentSnapshot: cloneParent(),
          setsCount: sets,
          minSwaps: n - sets,
          message: `❤️ 沙发 [${sofaIdx}]：坐在上面的是情侣本人 (${p1}, ${p2})，均属于情侣组 ${c1}，天生就座无须交换！`,
        });
      } else {
        const merged = union(c1, c2);
        steps.push({
          type: 'UNION_SETS',
          pairIdx: sofaIdx,
          p1,
          p2,
          c1,
          c2,
          parentSnapshot: cloneParent(),
          setsCount: sets,
          minSwaps: n - sets,
          message: `🔗 沙发 [${sofaIdx}]：坐在上面的是不同情侣 (${p1}, ${p2}) $\\implies$ 合并情侣组 ${c1} 与 ${c2} (当前连通块数: ${sets})。`,
        });
      }
    }

    steps.push({
      type: 'DONE',
      pairIdx: -1,
      p1: -1,
      p2: -1,
      c1: -1,
      c2: -1,
      parentSnapshot: cloneParent(),
      setsCount: sets,
      minSwaps: n - sets,
      message: `🏁 并查集扫描完毕！全图共有 ${sets} 个独立置换环，最少交换次数 = N - Sets = ${n} - ${sets} = ${n - sets} 次！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#couples-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: COUPLES_CODE_LANGUAGES,
      problemHtml: COUPLES_PROBLEM_HTML,
      analysisHtml: COUPLES_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-couples-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-couples-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-couples-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.couples-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_2_SWAPS';
        this.root?.querySelectorAll('.couples-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-couples-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        CoupleAudio.isMuted = !CoupleAudio.isMuted;
        soundBtn.textContent = CoupleAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'ALREADY_COUPLE') CoupleAudio.playMatch();
      else if (cur.type === 'UNION_SETS') CoupleAudio.playUnion();
      else if (cur.type === 'DONE') CoupleAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-couples-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停推演';

    const step = () => {
      if (!this.isAutoPlaying) return;
      if (this.currentStepPtr < this.traceSteps.length - 1) {
        this.stepForward();
        this.autoPlayTimer = setTimeout(step, 750 / this.playSpeed);
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
    const playBtn = this.root?.querySelector('#btn-couples-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动推演';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#couples-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#couples-status-badge') as HTMLElement | null;
    const seatsContainer = this.root.querySelector('#couples-seats-container') as HTMLElement | null;
    const setsStat = this.root.querySelector('#couples-sets-stat') as HTMLElement | null;
    const swapsStat = this.root.querySelector('#couples-swaps-stat') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'DONE') {
        statusBadge.textContent = `🎉 最少交换: ${cur.minSwaps} 次`;
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (setsStat) setsStat.textContent = `${cur.setsCount} 块`;
    if (swapsStat) swapsStat.textContent = `${cur.minSwaps} 次 (N - Sets)`;

    if (seatsContainer) {
      const colors = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
      let html = '';

      for (let i = 0; i < this.row.length; i += 2) {
        const p1 = this.row[i];
        const p2 = this.row[i + 1];
        const c1 = Math.floor(p1 / 2);
        const c2 = Math.floor(p2 / 2);
        const isCur = cur.pairIdx === i / 2;
        const isMatched = c1 === c2;

        const border = isCur ? '#facc15' : isMatched ? '#f472b6' : '#cbd5e1';
        const bg = isCur ? '#fefce8' : isMatched ? '#fdf2f8' : '#f8fafc';

        html += `
          <div style="display: flex; align-items: center; justify-content: center; gap: 4px; padding: 4px 6px; border-radius: 6px; border: 1.5px solid ${border}; background: ${bg}; margin-bottom: 4px;">
            <span style="font-size: 10px; color: #64748b; font-weight: bold;">沙发 ${i / 2}:</span>
            <span style="background: ${colors[c1 % colors.length]}; color: #ffffff; font-weight: bold; font-size: 11px; padding: 1px 6px; border-radius: 4px;">P${p1} (组${c1})</span>
            <span style="font-size: 12px;">${isMatched ? '❤️' : '⚡'}</span>
            <span style="background: ${colors[c2 % colors.length]}; color: #ffffff; font-weight: bold; font-size: 11px; padding: 1px 6px; border-radius: 4px;">P${p2} (组${c2})</span>
          </div>
        `;
      }
      seatsContainer.innerHTML = html;
    }
  }

  private startLoop(): void {
    if (typeof requestAnimationFrame !== 'function') return;
    const loop = (timestamp: number) => {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const dt = Math.min(32, timestamp - this.lastTimestamp);
      this.lastTimestamp = timestamp;

      this.heartBeatAnim += dt * 0.005;
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
    const colors = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // 1. 绘制并查集连通边
    for (let i = 0; i <= this.currentStepPtr; i++) {
      const step = this.traceSteps[i];
      if (step.type === 'UNION_SETS' && step.c1 >= 0 && step.c2 >= 0) {
        const p1 = this.nodePositions.get(step.c1);
        const p2 = this.nodePositions.get(step.c2);
        if (!p1 || !p2) continue;

        const isLatest = i === this.currentStepPtr;

        ctx.save();
        if (isLatest) {
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 10;
        } else {
          ctx.strokeStyle = 'rgba(236, 72, 153, 0.6)';
          ctx.lineWidth = 2;
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 2. 绘制情侣组节点
    for (let i = 0; i < this.n; i++) {
      const pos = this.nodePositions.get(i);
      if (!pos) continue;

      const isCurrentActive = cur && (cur.c1 === i || cur.c2 === i);
      const color = colors[i % colors.length];

      ctx.save();
      let radius = 20;

      if (isCurrentActive) {
        radius = 23 + Math.sin(this.heartBeatAnim) * 2;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
      }

      ctx.fillStyle = color;
      ctx.strokeStyle = isCurrentActive ? '#facc15' : '#ffffff';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 组别文字
      ctx.font = 'bold 11.5px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`组 ${i}`, pos.x, pos.y - 2);

      // 情侣成员小标
      ctx.font = '9px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillText(`(${i * 2},${i * 2 + 1})`, pos.x, pos.y + 10);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const COUPLES_TEMPLATE = `
  <div id="algo-couples-holding-hands-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">💑</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">情侣牵手与并查集置换 (Couples Holding Hands)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="couples-preset-btn active" data-preset="CLASSIC_2_SWAPS" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典错位 (2次)</button>
          <button class="couples-preset-btn" data-preset="BIG_CYCLE_3_SWAPS" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">全错位大环 (3次)</button>
          <button class="couples-preset-btn" data-preset="ONE_MISMATCH" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">单环错位 (1次)</button>
          <button class="couples-preset-btn" data-preset="PARTY_N6" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">大型情侣舞会 (N=6)</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="couples-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-couples-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步扫描</button>
        <button id="btn-couples-autoplay" style="background: linear-gradient(135deg, #ec4899, #db2777); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(236,72,153,0.25);">▶️ 自动推演</button>
        <button id="btn-couples-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-couples-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #9d174d;">
      <div style="display: flex; gap: 14px; align-items: center;">
        <span>🧩 连通分量数 (Sets): <b id="couples-sets-stat" style="color: #db2777; font-size: 12px;">4 块</b></span>
        <span>✨ 最少交换次数: <b id="couples-swaps-stat" style="color: #2563eb; font-size: 12.5px;">0 次 (N - Sets)</b></span>
      </div>
      <div id="couples-narration-box" style="font-weight: 700; color: #831843;">
        💡 准备就绪：两两沙发扫描相邻就座者，根据置换环定理推导最少交换次数！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：情侣置换并查集图 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="couples-canvas" width="460" height="230" style="width: 460px; height: 230px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          💖 节点为情侣组编号 | 边为错位同座建立的置换关系 | 环大小 K 需 K-1 次交换
        </div>
      </div>

      <!-- 右侧：沙发就座排布与代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; max-height: 105px; display: flex; flex-direction: column; gap: 2px;">
          <div style="font-size: 10.5px; font-weight: 700; color: #0f172a;">🛋️ 沙发就座排布 (两两成对):</div>
          <div id="couples-seats-container" style="display: flex; flex-direction: column; overflow-y: auto;"></div>
        </div>

        <div id="couples-terminal-mount" style="flex: 1; min-height: 175px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'couples-holding-hands',
  name: '情侣牵手 (Couples Holding Hands)',
  viewId: 'algo-couples-holding-hands-view',
  category: 'graph',
  description: '并查集置换环分解算法：左程云 class056 情侣牵手 (LeetCode 765)、错位建图、连通分量计数与最少交换次数 N - Sets 定理',
  icon: '💑',
  template: COUPLES_TEMPLATE,
  Visualizer: CouplesHoldingHandsVisualizer,
  difficulty: 2,
  levelOrder: 27,
  learningGoal: '掌握置换环定理、并查集如何将错位排布分解为独立连通分量以及最少交换次数 N - Sets 的数学本质',
});
