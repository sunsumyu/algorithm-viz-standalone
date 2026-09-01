/**
 * 二分图最大权完美匹配与 KM 算法 (Kuhn-Munkres Algorithm) 可视化引擎
 * 参考左程云《算法通关课》进阶图论: 顶标理论、相等子图、slack[] 松弛数组与 O(n^3) 最优带权分配 (洛谷 P6577)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  KM_ALGORITHM_CODE_LANGUAGES,
  KM_ALGORITHM_PROBLEM_HTML,
  KM_ALGORITHM_ANALYSIS_HTML,
} from './km-algorithm-problem-content';

export interface KMStep {
  type: 'INIT' | 'SEARCH_AUGMENT' | 'UPDATE_LABELS' | 'MATCH_FLIP' | 'ALL_DONE';
  curL?: number;
  curR?: number;
  lxSnapshot: number[];
  lySnapshot: number[];
  matchSnapshot: number[]; // match[R] = L
  matchedWeight: number;
  message: string;
}

class KMAudio {
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

  public static playLabel(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playMatch(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
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
      const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.3);
      });
    } catch {}
  }
}

export class KMAlgorithmVisualizer extends StepVisualizer<any> {
  // 二分图数据 (1-indexed)
  private n = 3;
  private matrix: number[][] = [];
  private leftPositions: Array<{ x: number; y: number }> = [];
  private rightPositions: Array<{ x: number; y: number }> = [];

  // 推演步骤
  private traceSteps: KMStep[] = [];
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
    this.codeLanguages = KM_ALGORITHM_CODE_LANGUAGES;
    this.codeLines = KM_ALGORITHM_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = 'KM 二分图最佳匹配引擎 (洛谷 P6577)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: 'KM 最佳匹配' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_3X3_KM');
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

    if (presetKey === 'CLASSIC_3X3_KM') {
      this.n = 3;
      this.matrix = [
        [0, 0, 0, 0],
        [0, 3, 5, 4], // L1
        [0, 2, 4, 1], // L2
        [0, 5, 2, 3], // L3
      ];
      this.leftPositions = [
        { x: 0, y: 0 },
        { x: 100, y: 55 },
        { x: 100, y: 115 },
        { x: 100, y: 175 },
      ];
      this.rightPositions = [
        { x: 0, y: 0 },
        { x: 300, y: 55 },
        { x: 300, y: 115 },
        { x: 300, y: 175 },
      ];
    } else if (presetKey === 'COMPETITIVE_4X4_KM') {
      this.n = 4;
      this.matrix = [
        [0, 0, 0, 0, 0],
        [0, 10, 8, 4, 2],
        [0, 9, 7, 5, 3],
        [0, 8, 6, 4, 1],
        [0, 7, 5, 3, 2],
      ];
      this.leftPositions = [
        { x: 0, y: 0 },
        { x: 100, y: 40 },
        { x: 100, y: 90 },
        { x: 100, y: 140 },
        { x: 100, y: 190 },
      ];
      this.rightPositions = [
        { x: 0, y: 0 },
        { x: 300, y: 40 },
        { x: 300, y: 90 },
        { x: 300, y: 140 },
        { x: 300, y: 190 },
      ];
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const n = this.n;
    const lx: number[] = Array(n + 1).fill(0);
    const ly: number[] = Array(n + 1).fill(0);
    const match: number[] = Array(n + 1).fill(0);
    const slack: number[] = Array(n + 1).fill(Infinity);
    const visX: boolean[] = Array(n + 1).fill(false);
    const visY: boolean[] = Array(n + 1).fill(false);

    // 1. 初始化顶标
    for (let i = 1; i <= n; i++) {
      let maxW = -Infinity;
      for (let j = 1; j <= n; j++) maxW = Math.max(maxW, this.matrix[i][j]);
      lx[i] = maxW;
    }

    const steps: KMStep[] = [];

    const getMatchedSum = () => {
      let sum = 0;
      for (let v = 1; v <= n; v++) {
        if (match[v] > 0) sum += this.matrix[match[v]][v];
      }
      return sum;
    };

    const cloneLx = () => [...lx];
    const cloneLy = () => [...ly];
    const cloneMatch = () => [...match];

    steps.push({
      type: 'INIT',
      lxSnapshot: cloneLx(),
      lySnapshot: cloneLy(),
      matchSnapshot: cloneMatch(),
      matchedWeight: 0,
      message: `🚀 初始化：左部顶标 lx[i] 赋为出边最大权值，右部顶标 ly[j] = 0。相等子图已激活！`,
    });

    const dfs = (u: number): boolean => {
      visX[u] = true;
      for (let v = 1; v <= n; v++) {
        if (visY[v]) continue;
        const delta = lx[u] + ly[v] - this.matrix[u][v];
        if (delta === 0) {
          visY[v] = true;
          if (match[v] === 0 || dfs(match[v])) {
            match[v] = u;
            return true;
          }
        } else {
          slack[v] = Math.min(slack[v], delta);
        }
      }
      return false;
    };

    for (let i = 1; i <= n; i++) {
      slack.fill(Infinity);
      while (true) {
        visX.fill(false);
        visY.fill(false);

        if (dfs(i)) {
          steps.push({
            type: 'MATCH_FLIP',
            curL: i,
            lxSnapshot: cloneLx(),
            lySnapshot: cloneLy(),
            matchSnapshot: cloneMatch(),
            matchedWeight: getMatchedSum(),
            message: `💖 [增广成功] 成功在相等子图中为 L${i} 找到增广轨并完成匹配！`,
          });
          break;
        }

        // 增广失败，调整顶标
        let d = Infinity;
        for (let j = 1; j <= n; j++) {
          if (!visY[j]) d = Math.min(d, slack[j]);
        }

        for (let j = 1; j <= n; j++) {
          if (visX[j]) lx[j] -= d;
          if (visY[j]) ly[j] += d;
          else slack[j] -= d;
        }

        steps.push({
          type: 'UPDATE_LABELS',
          curL: i,
          lxSnapshot: cloneLx(),
          lySnapshot: cloneLy(),
          matchSnapshot: cloneMatch(),
          matchedWeight: getMatchedSum(),
          message: `⚡ [顶标调整] 相等子图无增广路：计算松弛量 d = ${d}，树内左点 lx - ${d}，树内右点 ly + ${d}，成功引入新边！`,
        });
      }
    }

    steps.push({
      type: 'ALL_DONE',
      lxSnapshot: cloneLx(),
      lySnapshot: cloneLy(),
      matchSnapshot: cloneMatch(),
      matchedWeight: getMatchedSum(),
      message: `🏁 KM 算法完成！全图达成完美最大权匹配，最大权值总和为：${getMatchedSum()}！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#km-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: KM_ALGORITHM_CODE_LANGUAGES,
      problemHtml: KM_ALGORITHM_PROBLEM_HTML,
      analysisHtml: KM_ALGORITHM_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-km-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-km-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-km-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.km-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_3X3_KM';
        this.root?.querySelectorAll('.km-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-km-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        KMAudio.isMuted = !KMAudio.isMuted;
        soundBtn.textContent = KMAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'UPDATE_LABELS') KMAudio.playLabel();
      else if (cur.type === 'MATCH_FLIP') KMAudio.playMatch();
      else if (cur.type === 'ALL_DONE') KMAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-km-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停匹配';

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
    const playBtn = this.root?.querySelector('#btn-km-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动匹配';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#km-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#km-status-badge') as HTMLElement | null;
    const weightBadge = this.root.querySelector('#km-weight-val') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = '🎯 完美最大权匹配达成';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (weightBadge) {
      weightBadge.textContent = `${cur.matchedWeight}`;
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

    // 1. 绘制带权边
    for (let u = 1; u <= this.n; u++) {
      const p1 = this.leftPositions[u];
      if (!p1) continue;

      for (let v = 1; v <= this.n; v++) {
        const p2 = this.rightPositions[v];
        if (!p2) continue;

        const w = this.matrix[u][v];
        const isMatched = cur && cur.matchSnapshot[v] === u;
        const isEquality = cur && cur.lxSnapshot[u] + cur.lySnapshot[v] === w;

        ctx.save();
        if (isMatched) {
          ctx.strokeStyle = '#ec4899'; // 匹配粉色
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#ec4899';
          ctx.shadowBlur = 12;
        } else if (isEquality) {
          ctx.strokeStyle = '#38bdf8'; // 相等子图青色
          ctx.lineWidth = 2.5;
        } else {
          ctx.strokeStyle = 'rgba(71, 85, 105, 0.25)';
          ctx.lineWidth = 1;
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // 边权
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = isMatched ? '#f472b6' : isEquality ? '#38bdf8' : '#64748b';
        ctx.fillText(`${w}`, midX, midY - 2);

        ctx.restore();
      }
    }

    // 2. 绘制左部节点
    for (let i = 1; i <= this.n; i++) {
      const pos = this.leftPositions[i];
      if (!pos) continue;
      const lxVal = cur ? cur.lxSnapshot[i] : 0;

      ctx.save();
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`L${i}`, pos.x, pos.y - 3);

      // 顶标 lx
      ctx.font = '8.5px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`lx:${lxVal}`, pos.x, pos.y + 7);
      ctx.restore();
    }

    // 3. 绘制右部节点
    for (let i = 1; i <= this.n; i++) {
      const pos = this.rightPositions[i];
      if (!pos) continue;
      const lyVal = cur ? cur.lySnapshot[i] : 0;
      const isMatched = cur && cur.matchSnapshot[i] > 0;

      ctx.save();
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = isMatched ? '#ec4899' : '#a855f7';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`R${i}`, pos.x, pos.y - 3);

      // 顶标 ly
      ctx.font = '8.5px monospace';
      ctx.fillStyle = '#c084fc';
      ctx.fillText(`ly:${lyVal}`, pos.x, pos.y + 7);
      ctx.restore();
    }

    ctx.restore();
  }
}

export const KM_ALGORITHM_TEMPLATE = `
  <div id="algo-km-algorithm-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">💘</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">二分图最大权匹配 (KM 算法)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="km-preset-btn active" data-preset="CLASSIC_3X3_KM" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">3×3 经典分配</button>
          <button class="km-preset-btn" data-preset="COMPETITIVE_4X4_KM" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">4×4 激烈竞争网</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="km-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-km-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步增广</button>
        <button id="btn-km-autoplay" style="background: linear-gradient(135deg, #ec4899, #db2777); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(236,72,153,0.25);">▶️ 自动匹配</button>
        <button id="btn-km-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-km-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #9d174d;">
      <div style="display: flex; gap: 14px; align-items: center;">
        <span>🎯 当前已匹配权值总和: <b id="km-weight-val" style="color: #db2777; font-size: 13px;">0</b></span>
      </div>
      <div id="km-narration-box" style="font-weight: 700; color: #831843;">
        💡 准备就绪：顶标理论与相等子图，增广失败动态松弛调整顶标！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：二分图带权网络 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="km-canvas" width="460" height="230" style="width: 460px; height: 230px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🔵 青色亮线为相等子图关键边 | 💖 粉色实线为已选中的最大权完美匹配边
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="km-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'km-algorithm',
  name: 'KM 算法 (Kuhn-Munkres)',
  viewId: 'algo-km-algorithm-view',
  category: 'graph',
  description: '二分图最佳完美匹配算法：左程云进阶图论 KM 算法、顶标理论、相等子图、slack[] 松弛优化与最大权分配 (洛谷 P6577)',
  icon: '💘',
  template: KM_ALGORITHM_TEMPLATE,
  Visualizer: KMAlgorithmVisualizer,
  difficulty: 3,
  levelOrder: 41,
  learningGoal: '掌握顶标与相等子图对偶定理、增广失败时顶标自适应差值调整机制以及 O(n^3) 极速匹配',
});
