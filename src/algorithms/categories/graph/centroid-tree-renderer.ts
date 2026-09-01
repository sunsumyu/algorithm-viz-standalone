/**
 * 动态点分治与点分树 (Dynamic Centroid Decomposition / Centroid Tree) 可视化引擎
 * 进阶树论: 重心递归分治建树、树高严格 O(log n)、点分树向上跳跃维护距离 (洛谷 P6329 / SPOJ QTREE5)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  CENTROID_TREE_CODE_LANGUAGES,
  CENTROID_TREE_PROBLEM_HTML,
  CENTROID_TREE_ANALYSIS_HTML,
} from './centroid-tree-problem-content';

export interface CTreeStep {
  type: 'FIND_CENTROID' | 'SPLIT_AND_CONNECT' | 'JUMP_QUERY_DEMO' | 'ALL_DONE';
  curCentroid?: number;
  curSubtreeNodes?: number[];
  cTreeEdges: Array<{ u: number; v: number }>;
  jumpPath?: number[];
  message: string;
}

class CTreeAudio {
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

  public static playCentroid(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  public static playConnect(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  public static playJump(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const chord = [440, 554.37, 659.25, 880];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.2);
      });
    } catch {}
  }
}

export class CentroidTreeVisualizer extends StepVisualizer<any> {
  // 原树参数与坐标 (1-indexed)
  private n = 7;
  private origEdges: Array<{ u: number; v: number }> = [];
  private origPositions: Array<{ x: number; y: number }> = [];
  private ctreePositions: Array<{ x: number; y: number }> = [];

  // 推演步骤
  private traceSteps: CTreeStep[] = [];
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
    this.codeLanguages = CENTROID_TREE_CODE_LANGUAGES;
    this.codeLines = CENTROID_TREE_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '动态点分树构建引擎 (Centroid Tree)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '点分树构建' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_7_NODES_TREE');
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

    if (presetKey === 'CLASSIC_7_NODES_TREE') {
      this.n = 7;
      this.origEdges = [
        { u: 1, v: 2 },
        { u: 2, v: 4 },
        { u: 3, v: 2 },
        { u: 4, v: 6 },
        { u: 5, v: 6 },
        { u: 6, v: 7 },
      ];
      this.origPositions = [
        { x: 0, y: 0 },
        { x: 40, y: 160 },  // 1
        { x: 70, y: 100 },  // 2
        { x: 100, y: 160 }, // 3
        { x: 100, y: 40 },  // 4 (global centroid)
        { x: 130, y: 160 }, // 5
        { x: 130, y: 100 }, // 6
        { x: 160, y: 160 }, // 7
      ];
      this.ctreePositions = [
        { x: 0, y: 0 },
        { x: 260, y: 155 }, // 1
        { x: 280, y: 95 },  // 2
        { x: 300, y: 155 }, // 3
        { x: 330, y: 35 },  // 4 (root)
        { x: 360, y: 155 }, // 5
        { x: 380, y: 95 },  // 6
        { x: 400, y: 155 }, // 7
      ];
    } else {
      // 6 节点链 1-2-3-4-5-6
      this.n = 6;
      this.origEdges = [
        { u: 1, v: 2 },
        { u: 2, v: 3 },
        { u: 3, v: 4 },
        { u: 4, v: 5 },
        { u: 5, v: 6 },
      ];
      this.origPositions = [
        { x: 0, y: 0 },
        { x: 30, y: 40 },
        { x: 55, y: 70 },
        { x: 80, y: 100 },
        { x: 105, y: 130 },
        { x: 130, y: 160 },
        { x: 155, y: 180 },
      ];
      this.ctreePositions = [
        { x: 0, y: 0 },
        { x: 270, y: 155 }, // 1
        { x: 280, y: 95 },  // 2
        { x: 330, y: 35 },  // 3 (root)
        { x: 380, y: 95 },  // 5
        { x: 350, y: 155 }, // 4
        { x: 410, y: 155 }, // 6
      ];
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const steps: CTreeStep[] = [];

    if (this.n === 7) {
      // 1. 全局重心 4
      steps.push({
        type: 'FIND_CENTROID',
        curCentroid: 4,
        curSubtreeNodes: [1, 2, 3, 4, 5, 6, 7],
        cTreeEdges: [],
        message: '👑 [第 1 层分治] 全局树定位重心为节点 4（最大子树为 3 <= 7/2），作为点分树根节点！',
      });

      // 2. 递归子树重心 2 与 6
      steps.push({
        type: 'SPLIT_AND_CONNECT',
        curCentroid: 2,
        curSubtreeNodes: [1, 2, 3],
        cTreeEdges: [{ u: 4, v: 2 }, { u: 4, v: 6 }],
        message: '🌲 [第 2 层分治] 左右子树重心分别为 2 和 6，在点分树中连接 4 → 2 与 4 → 6！',
      });

      // 3. 递归叶子重心 1, 3, 5, 7
      steps.push({
        type: 'SPLIT_AND_CONNECT',
        cTreeEdges: [
          { u: 4, v: 2 },
          { u: 4, v: 6 },
          { u: 2, v: 1 },
          { u: 2, v: 3 },
          { u: 6, v: 5 },
          { u: 6, v: 7 },
        ],
        message: '✨ [第 3 层分治] 各单点叶子重心挂载完毕，点分树树高仅为 3 层 (<= log2(7)+1)！',
      });

      // 4. 向上跳跃演示 (从节点 1 向上跳跃 1 -> 2 -> 4)
      steps.push({
        type: 'JUMP_QUERY_DEMO',
        jumpPath: [1, 2, 4],
        cTreeEdges: [
          { u: 4, v: 2 },
          { u: 4, v: 6 },
          { u: 2, v: 1 },
          { u: 2, v: 3 },
          { u: 6, v: 5 },
          { u: 6, v: 7 },
        ],
        message: '🚀 [动态距离查询演示] 节点 1 仅需向上跳 2 步 (1 → 2 → 4)，即可完成对原树全图任意点路径的统计与更新！',
      });
    } else {
      steps.push({
        type: 'FIND_CENTROID',
        curCentroid: 3,
        curSubtreeNodes: [1, 2, 3, 4, 5, 6],
        cTreeEdges: [],
        message: '👑 [单链找重心] 6 节点链重心为 3，打破原链 O(n) 深度！',
      });

      steps.push({
        type: 'SPLIT_AND_CONNECT',
        cTreeEdges: [{ u: 3, v: 2 }, { u: 3, v: 5 }, { u: 2, v: 1 }, { u: 5, v: 4 }, { u: 5, v: 6 }],
        message: '🌲 [点分树重构] 退化单链成功重构为高度为 3 的平衡点分树！',
      });

      steps.push({
        type: 'JUMP_QUERY_DEMO',
        jumpPath: [1, 2, 3],
        cTreeEdges: [{ u: 3, v: 2 }, { u: 3, v: 5 }, { u: 2, v: 1 }, { u: 5, v: 4 }, { u: 5, v: 6 }],
        message: '🚀 [O(log n) 祖先跳跃] 节点 1 仅需跳跃 1 → 2 → 3，复杂度降维打击！',
      });
    }

    steps.push({
      type: 'ALL_DONE',
      cTreeEdges: [...steps[steps.length - 1].cTreeEdges],
      message: '🎉 [点分树构建就绪] 严格 O(log n) 深度树高，支持高效树上动态带修距离查询！',
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#ctree-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: CENTROID_TREE_CODE_LANGUAGES,
      problemHtml: CENTROID_TREE_PROBLEM_HTML,
      analysisHtml: CENTROID_TREE_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-ctree-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-ctree-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-ctree-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.ctree-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_7_NODES_TREE';
        this.root?.querySelectorAll('.ctree-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-ctree-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        CTreeAudio.isMuted = !CTreeAudio.isMuted;
        soundBtn.textContent = CTreeAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'FIND_CENTROID') CTreeAudio.playCentroid();
      else if (cur.type === 'SPLIT_AND_CONNECT') CTreeAudio.playConnect();
      else if (cur.type === 'JUMP_QUERY_DEMO' || cur.type === 'ALL_DONE') CTreeAudio.playJump();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-ctree-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停构建';

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
    const playBtn = this.root?.querySelector('#btn-ctree-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动构建';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#ctree-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#ctree-status-badge') as HTMLElement | null;
    const heightBadge = this.root.querySelector('#ctree-height-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = '🏁 点分树构建就绪';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (heightBadge) {
      heightBadge.textContent = `树高: 3 层 (<= ⌊log2(${this.n})⌋+1)`;
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

    // 分隔线
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(200, 0);
    ctx.lineTo(200, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // 标题
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('🌲 原树 (Original Tree)', 10, 20);
    ctx.fillText('👑 点分树 (Centroid Tree ≤ log n)', 215, 20);

    // 1. 绘制左侧原树边
    this.origEdges.forEach((e) => {
      const p1 = this.origPositions[e.u];
      const p2 = this.origPositions[e.v];
      if (!p1 || !p2) return;

      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
    });

    // 2. 绘制左侧原树节点
    for (let i = 1; i <= this.n; i++) {
      const pos = this.origPositions[i];
      if (!pos) continue;

      const isCentroid = cur && cur.curCentroid === i;

      ctx.save();
      let fillColor = '#1e293b';
      let strokeColor = '#38bdf8';
      let radius = 13;

      if (isCentroid) {
        strokeColor = '#facc15';
        fillColor = '#854d0e';
        radius = 15 + Math.sin(this.pulseAnim) * 1.5;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
      }

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${i}`, pos.x, pos.y);
      ctx.restore();
    }

    // 3. 绘制右侧点分树边
    if (cur) {
      cur.cTreeEdges.forEach((e) => {
        const p1 = this.ctreePositions[e.u];
        const p2 = this.ctreePositions[e.v];
        if (!p1 || !p2) return;

        const isJumpEdge = cur.jumpPath && cur.jumpPath.includes(e.u) && cur.jumpPath.includes(e.v);

        ctx.save();
        ctx.strokeStyle = isJumpEdge ? '#f43f5e' : '#10b981';
        ctx.lineWidth = isJumpEdge ? 3.5 : 2.5;
        if (isJumpEdge) {
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 10;
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      });

      // 4. 绘制右侧点分树节点
      for (let i = 1; i <= this.n; i++) {
        const pos = this.ctreePositions[i];
        if (!pos) continue;

        const isJump = cur.jumpPath && cur.jumpPath.includes(i);

        ctx.save();
        let fillColor = '#1e293b';
        let strokeColor = '#10b981';
        let radius = 13;

        if (isJump) {
          strokeColor = '#f43f5e';
          fillColor = '#881337';
          radius = 15;
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 10;
        }

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${i}`, pos.x, pos.y);
        ctx.restore();
      }
    }

    ctx.restore();
  }
}

export const CENTROID_TREE_TEMPLATE = `
  <div id="algo-centroid-tree-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🌲</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">动态点分树 (Centroid Tree)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="ctree-preset-btn active" data-preset="CLASSIC_7_NODES_TREE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">7 节点多分支树</button>
          <button class="ctree-preset-btn" data-preset="CHAIN_6_NODES_DEGENERATE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">6 节点退化单链</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="ctree-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-ctree-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-ctree-autoplay" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(16,185,129,0.25);">▶️ 自动构建</button>
        <button id="btn-ctree-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-ctree-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #166534;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>👑 点分树平衡性质: <b id="ctree-height-badge" style="color: #059669; font-size: 12px;">树高: 3 层</b></span>
      </div>
      <div id="ctree-narration-box" style="font-weight: 700; color: #14532d;">
        💡 准备就绪：每层子树求重心递归连边，点分树树高严格 ≤ log2(n)+1！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：原树与点分树 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="ctree-canvas" width="460" height="200" style="width: 460px; height: 200px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          左侧为原树 | 右侧为动态生成的平衡点分树 | 🔴 红色为向上跳跃祖先路径 (O(log n))
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="ctree-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'centroid-tree',
  name: '点分树 (Centroid Tree)',
  viewId: 'algo-centroid-tree-view',
  category: 'graph',
  description: '进阶树论高效数据结构：重心递归分治建树、树高严格 O(log n)、点分树向上跳跃维护动态带修距离 (洛谷 P6329 / SPOJ QTREE5)',
  icon: '🌲',
  template: CENTROID_TREE_TEMPLATE,
  Visualizer: CentroidTreeVisualizer,
  difficulty: 3,
  levelOrder: 58,
  learningGoal: '掌握点分树深度严格不超过 O(log n) 的严密证明、祖先路径全覆盖定理与动态点分治单次 O(log^2 n) 维护技巧',
});
