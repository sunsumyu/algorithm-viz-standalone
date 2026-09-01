/**
 * DAG 最小路径覆盖 (Minimum Path Cover on DAG) 可视化引擎
 * 经典图论建模: 拆点二分图 (u_out, v_in)、最小路径数 = n - 最大匹配数、路径链提取 (洛谷 P2764)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  MIN_PATH_COVER_CODE_LANGUAGES,
  MIN_PATH_COVER_PROBLEM_HTML,
  MIN_PATH_COVER_ANALYSIS_HTML,
} from './min-path-cover-problem-content';

export interface PathCoverStep {
  type: 'MATCH_PAIR' | 'AUGMENT_CHAIN' | 'EXTRACT_PATHS' | 'ALL_DONE';
  matchedEdges: Array<{ u: number; v: number }>;
  currentU: number;
  currentV: number;
  pathsResult?: number[][];
  message: string;
}

class PathCoverAudio {
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
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playExtract(): void {
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

export class MinPathCoverVisualizer extends StepVisualizer<any> {
  private n = 6;
  private dagNodes: Record<number, { x: number; y: number }> = {
    1: { x: 40, y: 80 },
    2: { x: 95, y: 45 },
    3: { x: 95, y: 120 },
    4: { x: 155, y: 45 },
    5: { x: 155, y: 120 },
    6: { x: 205, y: 80 },
  };
  private dagEdges: Array<{ u: number; v: number }> = [
    { u: 1, v: 2 },
    { u: 1, v: 3 },
    { u: 2, v: 4 },
    { u: 3, v: 4 },
    { u: 3, v: 5 },
    { u: 5, v: 6 },
    { u: 4, v: 6 },
  ];

  // 拆点二分图坐标
  private bipLeft: Record<number, { x: number; y: number }> = {
    1: { x: 250, y: 25 },
    2: { x: 250, y: 60 },
    3: { x: 250, y: 95 },
    4: { x: 250, y: 130 },
    5: { x: 250, y: 165 },
    6: { x: 250, y: 200 },
  };
  private bipRight: Record<number, { x: number; y: number }> = {
    1: { x: 340, y: 25 },
    2: { x: 340, y: 60 },
    3: { x: 340, y: 95 },
    4: { x: 340, y: 130 },
    5: { x: 340, y: 165 },
    6: { x: 340, y: 200 },
  };

  // 推演步骤
  private traceSteps: PathCoverStep[] = [];
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
    this.codeLanguages = MIN_PATH_COVER_CODE_LANGUAGES;
    this.codeLines = MIN_PATH_COVER_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = 'DAG 最小路径覆盖引擎 (Min Path Cover)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: 'DAG 最小路径覆盖' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_6_NODE_DAG');
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

  private loadPreset(_presetKey: string): void {
    this.stopAutoPlay();
    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const steps: PathCoverStep[] = [];
    const matched: Array<{ u: number; v: number }> = [];

    // 匹配 1_out -> 2_in
    matched.push({ u: 1, v: 2 });
    steps.push({
      type: 'MATCH_PAIR',
      matchedEdges: [...matched],
      currentU: 1,
      currentV: 2,
      message: '🔗 [二分图匹配] 节点 1(出点) 与 2(入点) 建立匹配，合并路径段 1 ➔ 2！',
    });

    // 匹配 2_out -> 4_in
    matched.push({ u: 2, v: 4 });
    steps.push({
      type: 'MATCH_PAIR',
      matchedEdges: [...matched],
      currentU: 2,
      currentV: 4,
      message: '🔗 [二分图匹配] 节点 2(出点) 与 4(入点) 建立匹配，延长路径段 1 ➔ 2 ➔ 4！',
    });

    // 匹配 3_out -> 5_in
    matched.push({ u: 3, v: 5 });
    steps.push({
      type: 'MATCH_PAIR',
      matchedEdges: [...matched],
      currentU: 3,
      currentV: 5,
      message: '🔗 [二分图匹配] 节点 3(出点) 与 5(入点) 建立匹配，开启新路径段 3 ➔ 5！',
    });

    // 匹配 5_out -> 6_in
    matched.push({ u: 5, v: 6 });
    steps.push({
      type: 'MATCH_PAIR',
      matchedEdges: [...matched],
      currentU: 5,
      currentV: 6,
      message: '🔗 [二分图匹配] 节点 5(出点) 与 6(入点) 建立匹配，延长路径段 3 ➔ 5 ➔ 6！',
    });

    // 提取不相交覆盖路径
    steps.push({
      type: 'EXTRACT_PATHS',
      matchedEdges: [...matched],
      currentU: 0,
      currentV: 0,
      pathsResult: [
        [1, 2, 4],
        [3, 5, 6],
      ],
      message: '👑 [提取路径链] 最大匹配数 = 4，最小路径数 = 6 - 4 = 2 条不相交路径！',
    });

    steps.push({
      type: 'ALL_DONE',
      matchedEdges: [...matched],
      currentU: 0,
      currentV: 0,
      pathsResult: [
        [1, 2, 4],
        [3, 5, 6],
      ],
      message: '🎉 [覆盖完成] 全图 6 个节点恰好被 2 条独立路径覆盖：[1➔2➔4] 与 [3➔5➔6]！',
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#path-cover-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: MIN_PATH_COVER_CODE_LANGUAGES,
      problemHtml: MIN_PATH_COVER_PROBLEM_HTML,
      analysisHtml: MIN_PATH_COVER_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-pathcover-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-pathcover-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-pathcover-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 音效
    const soundBtn = this.root.querySelector('#btn-pathcover-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        PathCoverAudio.isMuted = !PathCoverAudio.isMuted;
        soundBtn.textContent = PathCoverAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'MATCH_PAIR') PathCoverAudio.playMatch();
      else if (cur.type === 'EXTRACT_PATHS') PathCoverAudio.playExtract();
      else if (cur.type === 'ALL_DONE') PathCoverAudio.playVictory();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-pathcover-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停匹配';

    const step = () => {
      if (!this.isAutoPlaying) return;
      if (this.currentStepPtr < this.traceSteps.length - 1) {
        this.stepForward();
        this.autoPlayTimer = setTimeout(step, 900 / this.playSpeed);
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
    const playBtn = this.root?.querySelector('#btn-pathcover-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动匹配';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#pathcover-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#pathcover-status-badge') as HTMLElement | null;
    const matchBadge = this.root.querySelector('#pathcover-match-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = '🏁 覆盖求解完成';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (matchBadge) {
      matchBadge.textContent = `已建立匹配: ${cur.matchedEdges.length} | 剩余最小路径数: ${this.n - cur.matchedEdges.length}`;
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
      // 1. 绘制左侧 DAG 拓扑
      this.dagEdges.forEach((e) => {
        const p1 = this.dagNodes[e.u];
        const p2 = this.dagNodes[e.v];
        if (!p1 || !p2) return;

        const isMatched = cur.matchedEdges.some((m) => m.u === e.u && m.v === e.v);

        ctx.save();
        ctx.strokeStyle = isMatched ? '#10b981' : 'rgba(100, 116, 139, 0.4)';
        ctx.lineWidth = isMatched ? 3 : 1.5;
        if (isMatched) {
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 8;
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      });

      // 绘制 DAG 节点
      for (let i = 1; i <= this.n; i++) {
        const pos = this.dagNodes[i];
        if (!pos) continue;

        ctx.save();
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${i}`, pos.x, pos.y);
        ctx.restore();
      }

      // 2. 绘制右侧拆点二分图 (u_out 和 v_in)
      ctx.save();
      ctx.font = 'bold 10.5px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText('出点集 L (u_out)', 250, 15);
      ctx.fillText('入点集 R (v_in)', 340, 15);

      // 二分图匹配连线
      cur.matchedEdges.forEach((m) => {
        const pL = this.bipLeft[m.u];
        const pR = this.bipRight[m.v];
        if (pL && pR) {
          ctx.save();
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 8;

          ctx.beginPath();
          ctx.moveTo(pL.x, pL.y);
          ctx.lineTo(pR.x, pR.y);
          ctx.stroke();
          ctx.restore();
        }
      });

      // 绘制二分图左右节点
      for (let i = 1; i <= this.n; i++) {
        const pL = this.bipLeft[i];
        const pR = this.bipRight[i];

        // 左点
        if (pL) {
          ctx.fillStyle = '#1e3a8a';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(pL.x, pL.y, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 8.5px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${i}`, pL.x, pL.y);
        }

        // 右点
        if (pR) {
          ctx.fillStyle = '#831843';
          ctx.strokeStyle = '#f472b6';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(pR.x, pR.y, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 8.5px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${i}`, pR.x, pR.y);
        }
      }
      ctx.restore();

      // 3. 右侧路径链提取结果 HUD
      ctx.save();
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'left';
      ctx.fillText('📋 最终不相交路径链:', 375, 50);

      if (cur.pathsResult) {
        cur.pathsResult.forEach((path, idx) => {
          const pathStr = path.join(' ➔ ');
          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = idx === 0 ? '#10b981' : '#38bdf8';
          ctx.fillText(`路径 ${idx + 1}: ${pathStr}`, 375, 75 + idx * 24);
        });
      } else {
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('(二分图匹配进行中...)', 375, 75);
      }

      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#facc15';
      ctx.fillText(`定理: 路径数 = n - 最大匹配`, 375, 150);
      ctx.fillText(`6 - ${cur.matchedEdges.length} = ${this.n - cur.matchedEdges.length} 条路径`, 375, 170);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const MIN_PATH_COVER_TEMPLATE = `
  <div id="algo-min-path-cover-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🚀</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">DAG 最小路径覆盖 (Min Path Cover)</span>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="pathcover-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-pathcover-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-pathcover-autoplay" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(2,132,199,0.25);">▶️ 自动匹配</button>
        <button id="btn-pathcover-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-pathcover-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #0369a1;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>🚀 覆盖指标: <b id="pathcover-match-badge" style="color: #0284c7; font-size: 12px;">已匹配: 0 | 路径数: 6</b></span>
      </div>
      <div id="pathcover-narration-box" style="font-weight: 700; color: #075985;">
        💡 准备就绪：DAG 拆点构建二分图，路径数 = n - 最大匹配数！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.5fr) 340px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：DAG 与二分图匹配 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="path-cover-canvas" width="490" height="230" style="width: 490px; height: 230px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          左侧为原 DAG 拓扑 | 中间为拆点二分图 (u_out 与 v_in) | 🟢 绿色为构建出的不相交路径链
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="path-cover-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'min-path-cover',
  name: 'DAG 最小路径覆盖 (Min Path Cover)',
  viewId: 'algo-min-path-cover-view',
  category: 'graph',
  description: '经典网络流/二分图建模：DAG 拆点二分图匹配定理 (路径数 = n - 最大匹配)、不相交与可相交路径覆盖 (洛谷 P2764)',
  icon: '🚀',
  template: MIN_PATH_COVER_TEMPLATE,
  Visualizer: MinPathCoverVisualizer,
  difficulty: 3,
  levelOrder: 65,
  learningGoal: '掌握 DAG 拆点二分图匹配原理、Dilworth 反链对偶定理与传递闭包处理可相交路径覆盖',
});
