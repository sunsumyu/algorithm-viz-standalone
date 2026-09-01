/**
 * 网络流最大权闭合子图 (Max-Weight Closure of Directed Graph) 可视化引擎
 * 进阶网络流: 正权点连源点 S、负权点连汇点 T、依赖边容量无穷大、最大权 = 正权和 - 最小割 (洛谷 P2762)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  MAX_WEIGHT_CLOSURE_CODE_LANGUAGES,
  MAX_WEIGHT_CLOSURE_PROBLEM_HTML,
  MAX_WEIGHT_CLOSURE_ANALYSIS_HTML,
} from './max-weight-closure-problem-content';

export interface ClosureStep {
  type: 'INIT_DEPENDENCIES' | 'BUILD_NETWORK' | 'DINIC_MIN_CUT' | 'FIND_CLOSURE' | 'ALL_DONE';
  cutEdges: Array<{ u: string; v: string }>;
  flowEdges: Array<{ u: string; v: string; cap: number; flow: number; isInf?: boolean }>;
  chosenNodes: string[];
  totalPositive: number;
  minCutValue: number;
  maxProfit: number;
  message: string;
}

class ClosureAudio {
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

  public static playNetwork(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  public static playCut(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  public static playProfit(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.14, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.25);
      });
    } catch {}
  }
}

export class MaxWeightClosureVisualizer extends StepVisualizer<any> {
  private nodePositions: Record<string, { x: number; y: number; weight: number; label: string }> = {};

  // 推演步骤
  private traceSteps: ClosureStep[] = [];
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
    this.codeLanguages = MAX_WEIGHT_CLOSURE_CODE_LANGUAGES;
    this.codeLines = MAX_WEIGHT_CLOSURE_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '最大权闭合子图求解引擎 (Max-Weight Closure)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '最大权闭合子图' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('SPACE_PROJECT_PLAN');
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

    if (presetKey === 'SPACE_PROJECT_PLAN') {
      this.nodePositions = {
        S: { x: 30, y: 100, weight: 0, label: 'S' },
        E1: { x: 130, y: 60, weight: 10, label: 'E1(+10)' },
        E2: { x: 130, y: 140, weight: 15, label: 'E2(+15)' },
        I1: { x: 270, y: 40, weight: -5, label: 'I1(-5)' },
        I2: { x: 270, y: 100, weight: -7, label: 'I2(-7)' },
        I3: { x: 270, y: 160, weight: -8, label: 'I3(-8)' },
        T: { x: 380, y: 100, weight: 0, label: 'T' },
      };
    } else {
      this.nodePositions = {
        S: { x: 30, y: 100, weight: 0, label: 'S' },
        E1: { x: 130, y: 70, weight: 20, label: 'P1(+20)' },
        E2: { x: 130, y: 130, weight: 8, label: 'P2(+8)' },
        I1: { x: 270, y: 70, weight: -12, label: 'LibA(-12)' },
        I2: { x: 270, y: 130, weight: -10, label: 'LibB(-10)' },
        T: { x: 380, y: 100, weight: 0, label: 'T' },
      };
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const steps: ClosureStep[] = [];

    // 1. 依赖关系展示
    steps.push({
      type: 'INIT_DEPENDENCIES',
      cutEdges: [],
      flowEdges: [
        { u: 'E1', v: 'I1', cap: 999, flow: 0, isInf: true },
        { u: 'E1', v: 'I2', cap: 999, flow: 0, isInf: true },
        { u: 'E2', v: 'I2', cap: 999, flow: 0, isInf: true },
        { u: 'E2', v: 'I3', cap: 999, flow: 0, isInf: true },
      ],
      chosenNodes: [],
      totalPositive: 25,
      minCutValue: 0,
      maxProfit: 0,
      message: '🚀 [原图依赖关系] 实验 E1 需要仪器 I1, I2；实验 E2 需要仪器 I2, I3！选实验必须选对应仪器！',
    });

    // 2. 建立网络流模型
    steps.push({
      type: 'BUILD_NETWORK',
      cutEdges: [],
      flowEdges: [
        { u: 'S', v: 'E1', cap: 10, flow: 0 },
        { u: 'S', v: 'E2', cap: 15, flow: 0 },
        { u: 'E1', v: 'I1', cap: 999, flow: 0, isInf: true },
        { u: 'E1', v: 'I2', cap: 999, flow: 0, isInf: true },
        { u: 'E2', v: 'I2', cap: 999, flow: 0, isInf: true },
        { u: 'E2', v: 'I3', cap: 999, flow: 0, isInf: true },
        { u: 'I1', v: 'T', cap: 5, flow: 0 },
        { u: 'I2', v: 'T', cap: 7, flow: 0 },
        { u: 'I3', v: 'T', cap: 8, flow: 0 },
      ],
      chosenNodes: [],
      totalPositive: 25,
      minCutValue: 0,
      maxProfit: 0,
      message: '📐 [网络流建图] S 连实验 (容量=收益)，仪器连 T (容量=成本)，依赖边容量为 ∞ (不可割断)！',
    });

    // 3. Dinic 求最小割
    steps.push({
      type: 'DINIC_MIN_CUT',
      cutEdges: [{ u: 'I1', v: 'T' }, { u: 'I2', v: 'T' }, { u: 'I3', v: 'T' }],
      flowEdges: [
        { u: 'S', v: 'E1', cap: 10, flow: 10 },
        { u: 'S', v: 'E2', cap: 15, flow: 10 },
        { u: 'E1', v: 'I1', cap: 999, flow: 5, isInf: true },
        { u: 'E1', v: 'I2', cap: 999, flow: 5, isInf: true },
        { u: 'E2', v: 'I2', cap: 999, flow: 2, isInf: true },
        { u: 'E2', v: 'I3', cap: 999, flow: 8, isInf: true },
        { u: 'I1', v: 'T', cap: 5, flow: 5 },
        { u: 'I2', v: 'T', cap: 7, flow: 7 },
        { u: 'I3', v: 'T', cap: 8, flow: 8 },
      ],
      chosenNodes: [],
      totalPositive: 25,
      minCutValue: 20,
      maxProfit: 5,
      message: '✂️ [最小割求解] Dinic 求得最小割为 20 (对应支付仪器成本 5+7+8=20)，割断 (I1->T, I2->T, I3->T)！',
    });

    // 4. 残量网络提取闭合子图
    steps.push({
      type: 'FIND_CLOSURE',
      cutEdges: [{ u: 'I1', v: 'T' }, { u: 'I2', v: 'T' }, { u: 'I3', v: 'T' }],
      flowEdges: [
        { u: 'S', v: 'E1', cap: 10, flow: 10 },
        { u: 'S', v: 'E2', cap: 15, flow: 10 },
        { u: 'E1', v: 'I1', cap: 999, flow: 5, isInf: true },
        { u: 'E1', v: 'I2', cap: 999, flow: 5, isInf: true },
        { u: 'E2', v: 'I2', cap: 999, flow: 2, isInf: true },
        { u: 'E2', v: 'I3', cap: 999, flow: 8, isInf: true },
        { u: 'I1', v: 'T', cap: 5, flow: 5 },
        { u: 'I2', v: 'T', cap: 7, flow: 7 },
        { u: 'I3', v: 'T', cap: 8, flow: 8 },
      ],
      chosenNodes: ['E1', 'E2', 'I1', 'I2', 'I3'],
      totalPositive: 25,
      minCutValue: 20,
      maxProfit: 5,
      message: '💰 [最优闭合子图提取] 从 S 出发沿残量可达：选择实验 [E1, E2] 和仪器 [I1, I2, I3]，最大净收益 = 25 - 20 = 5！',
    });

    steps.push({
      type: 'ALL_DONE',
      cutEdges: [{ u: 'I1', v: 'T' }, { u: 'I2', v: 'T' }, { u: 'I3', v: 'T' }],
      flowEdges: steps[3].flowEdges,
      chosenNodes: ['E1', 'E2', 'I1', 'I2', 'I3'],
      totalPositive: 25,
      minCutValue: 20,
      maxProfit: 5,
      message: '🎉 [求解成功] 最大权闭合子图方案提取完毕，完美解决复杂收益与成本依赖决策！',
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#mwc-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: MAX_WEIGHT_CLOSURE_CODE_LANGUAGES,
      problemHtml: MAX_WEIGHT_CLOSURE_PROBLEM_HTML,
      analysisHtml: MAX_WEIGHT_CLOSURE_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-mwc-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-mwc-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-mwc-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.mwc-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'SPACE_PROJECT_PLAN';
        this.root?.querySelectorAll('.mwc-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-mwc-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        ClosureAudio.isMuted = !ClosureAudio.isMuted;
        soundBtn.textContent = ClosureAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'BUILD_NETWORK') ClosureAudio.playNetwork();
      else if (cur.type === 'DINIC_MIN_CUT') ClosureAudio.playCut();
      else if (cur.type === 'FIND_CLOSURE' || cur.type === 'ALL_DONE') ClosureAudio.playProfit();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-mwc-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停求解';

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
    const playBtn = this.root?.querySelector('#btn-mwc-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动求解';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#mwc-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#mwc-status-badge') as HTMLElement | null;
    const profitBadge = this.root.querySelector('#mwc-profit-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = '🏁 最大净收益已锁定';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (profitBadge) {
      if (cur.type === 'FIND_CLOSURE' || cur.type === 'ALL_DONE') {
        profitBadge.textContent = `净收益: +${cur.maxProfit} (所选: ${cur.chosenNodes.join(', ')})`;
        profitBadge.style.color = '#16a34a';
      } else {
        profitBadge.textContent = '计算中...';
        profitBadge.style.color = '#2563eb';
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
    const cur = this.traceSteps[this.currentStepPtr];

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    if (cur) {
      // 1. 绘制边
      cur.flowEdges.forEach((e) => {
        const p1 = this.nodePositions[e.u];
        const p2 = this.nodePositions[e.v];
        if (!p1 || !p2) return;

        const isCut = cur.cutEdges.some((ce) => ce.u === e.u && ce.v === e.v);

        ctx.save();
        ctx.strokeStyle = isCut ? '#ef4444' : e.isInf ? '#f59e0b' : '#38bdf8';
        ctx.lineWidth = isCut ? 2 : e.isInf ? 2 : 2.5;
        if (isCut) {
          ctx.setLineDash([4, 4]);
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // 箭头
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const arrowX = p2.x - 16 * Math.cos(angle);
        const arrowY = p2.y - 16 * Math.sin(angle);

        ctx.fillStyle = isCut ? '#ef4444' : e.isInf ? '#f59e0b' : '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - 6 * Math.cos(angle - Math.PI / 6), arrowY - 6 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(arrowX - 6 * Math.cos(angle + Math.PI / 6), arrowY - 6 * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();

        // 文字
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - 8;
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = isCut ? '#f87171' : '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText(e.isInf ? '∞' : `${e.flow}/${e.cap}`, midX, midY);

        if (isCut) {
          ctx.font = '10px sans-serif';
          ctx.fillText('✂️', midX, midY + 16);
        }

        ctx.restore();
      });

      // 2. 绘制节点
      Object.keys(this.nodePositions).forEach((key) => {
        const node = this.nodePositions[key];
        const isChosen = cur.chosenNodes.includes(key);
        const isSource = key === 'S';
        const isSink = key === 'T';

        ctx.save();
        let fillColor = '#1e293b';
        let strokeColor = '#38bdf8';
        let radius = 14;

        if (isSource) {
          fillColor = '#713f12';
          strokeColor = '#facc15';
        } else if (isSink) {
          fillColor = '#581c87';
          strokeColor = '#c084fc';
        } else if (isChosen) {
          fillColor = '#064e3b';
          strokeColor = '#10b981';
          radius = 16 + Math.sin(this.pulseAnim) * 1.5;
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 12;
        }

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 9.5px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x, node.y);
        ctx.restore();
      });
    }

    ctx.restore();
  }
}

export const MAX_WEIGHT_CLOSURE_TEMPLATE = `
  <div id="algo-max-weight-closure-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">💰</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">最大权闭合子图 (Max-Weight Closure)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="mwc-preset-btn active" data-preset="SPACE_PROJECT_PLAN" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">太空飞行计划 (实验/仪器)</button>
          <button class="mwc-preset-btn" data-preset="SOFTWARE_FEATURE_HIRE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">软件研发与组件依赖</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="mwc-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-mwc-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-mwc-autoplay" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(16,185,129,0.25);">▶️ 自动求解</button>
        <button id="btn-mwc-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-mwc-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #166534;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>💰 决策净收益: <b id="mwc-profit-badge" style="color: #059669; font-size: 12px;">计算中...</b></span>
      </div>
      <div id="mwc-narration-box" style="font-weight: 700; color: #14532d;">
        💡 准备就绪：正权连源、负权连汇、依赖边 ∞，最大收益 = 正权和 - 最小割！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：网络流 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="mwc-canvas" width="460" height="200" style="width: 460px; height: 200px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🟢 绿色光环为最终选中的最优闭合子图 | ✂️ 红色虚线为最小割断边
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="mwc-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'max-weight-closure',
  name: '最大权闭合子图 (Max-Weight Closure)',
  viewId: 'algo-max-weight-closure-view',
  category: 'graph',
  description: '进阶网络流割模型算法：正权点连源点 S、负权点连汇点 T、依赖边容量无穷大、最大收益 = 总正权和 - 最小割 (洛谷 P2762 太空飞行计划)',
  icon: '💰',
  template: MAX_WEIGHT_CLOSURE_TEMPLATE,
  Visualizer: MaxWeightClosureVisualizer,
  difficulty: 3,
  levelOrder: 59,
  learningGoal: '掌握闭合子图数学定义、最小割建图模型映射逻辑与残量网络 DFS 提取全局最优闭合子图方案',
});
