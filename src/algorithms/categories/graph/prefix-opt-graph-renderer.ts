/**
 * 前缀优化建图与线性边数压缩 (Prefix Optimization Graph Building) 可视化引擎
 * 进阶图论: 至多选一限制、前缀链辅助点、O(k) 线性边数极致压缩 (洛谷 P6378 [PA2010] Riddle)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  PREFIX_OPT_CODE_LANGUAGES,
  PREFIX_OPT_PROBLEM_HTML,
  PREFIX_OPT_ANALYSIS_HTML,
} from './prefix-opt-graph-problem-content';

export interface PrefixStep {
  type: 'SELECT_VAR' | 'LIGHT_PREFIX' | 'INHIBIT_PREV' | 'ALL_DONE';
  selectedVar: number;
  activePrefixNodes: number[];
  forbiddenVars: number[];
  naiveEdgesCount: number;
  optEdgesCount: number;
  message: string;
}

class PrefixAudio {
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

  public static playSelect(): void {
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

  public static playChain(): void {
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

export class PrefixOptGraphVisualizer extends StepVisualizer<any> {
  private k = 4;
  private varPositions: Record<number, { x: number; y: number }> = {
    1: { x: 50, y: 160 },
    2: { x: 110, y: 160 },
    3: { x: 170, y: 160 },
    4: { x: 230, y: 160 },
  };
  private prePositions: Record<number, { x: number; y: number }> = {
    1: { x: 50, y: 50 },
    2: { x: 110, y: 50 },
    3: { x: 170, y: 50 },
    4: { x: 230, y: 50 },
  };

  // 推演步骤
  private traceSteps: PrefixStep[] = [];
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
    this.codeLanguages = PREFIX_OPT_CODE_LANGUAGES;
    this.codeLines = PREFIX_OPT_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '前缀优化建图与边数压缩引擎 (Prefix Opt Graph)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '前缀优化建图' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('FOUR_VARIABLES_DEMO');
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
    const steps: PrefixStep[] = [];
    const naiveE = this.k * (this.k - 1);
    const optE = 3 * this.k - 2;

    // 1. 初始状态
    steps.push({
      type: 'SELECT_VAR',
      selectedVar: 0,
      activePrefixNodes: [],
      forbiddenVars: [],
      naiveEdgesCount: naiveE,
      optEdgesCount: optE,
      message: '🌐 [建图骨架] 引入前缀点 Pre_1 ➔ Pre_2 ➔ Pre_3 ➔ Pre_4，边数从 12 条压缩至 10 条！',
    });

    // 2. 尝试选中变量 u_3
    steps.push({
      type: 'SELECT_VAR',
      selectedVar: 3,
      activePrefixNodes: [3, 4],
      forbiddenVars: [],
      naiveEdgesCount: naiveE,
      optEdgesCount: optE,
      message: '🎯 [选定变量 u3] 假设在布尔满足中选择变量 u3 为真，激活边 u3 ➔ Pre3！',
    });

    // 3. 沿前缀链传递激活
    steps.push({
      type: 'LIGHT_PREFIX',
      selectedVar: 3,
      activePrefixNodes: [3, 4],
      forbiddenVars: [],
      naiveEdgesCount: naiveE,
      optEdgesCount: optE,
      message: '⚡ [前缀链传递] Pre3 激活并沿链向前传递 Pre3 ➔ Pre4，表示后继前缀均已包含选中点！',
    });

    // 4. 逆向禁止前缀节点
    steps.push({
      type: 'INHIBIT_PREV',
      selectedVar: 3,
      activePrefixNodes: [3, 4],
      forbiddenVars: [1, 2],
      naiveEdgesCount: naiveE,
      optEdgesCount: optE,
      message: '🛑 [逆向精准禁止] 边 u3 ➔ ~Pre2 触发！由于 Pre2 汇聚了 u1 与 u2，前缀链单次即可将 u1 与 u2 全部禁止！',
    });

    steps.push({
      type: 'ALL_DONE',
      selectedVar: 3,
      activePrefixNodes: [3, 4],
      forbiddenVars: [1, 2],
      naiveEdgesCount: naiveE,
      optEdgesCount: optE,
      message: '🎉 [至多选一约束完成] 仅需 3k-2 条有向边，完美表达任意集合的至多选一限制！',
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#prefix-opt-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: PREFIX_OPT_CODE_LANGUAGES,
      problemHtml: PREFIX_OPT_PROBLEM_HTML,
      analysisHtml: PREFIX_OPT_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-prefix-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-prefix-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-prefix-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 音效
    const soundBtn = this.root.querySelector('#btn-prefix-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        PrefixAudio.isMuted = !PrefixAudio.isMuted;
        soundBtn.textContent = PrefixAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'SELECT_VAR') PrefixAudio.playSelect();
      else if (cur.type === 'LIGHT_PREFIX') PrefixAudio.playChain();
      else if (cur.type === 'ALL_DONE') PrefixAudio.playVictory();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-prefix-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停演示';

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
    const playBtn = this.root?.querySelector('#btn-prefix-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动演示';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#prefix-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#prefix-status-badge') as HTMLElement | null;
    const edgeBadge = this.root.querySelector('#prefix-edge-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = '🏁 约束推导完成';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (edgeBadge) {
      edgeBadge.textContent = `朴素边数: ${cur.naiveEdgesCount} ➔ 前缀优化边数: ${cur.optEdgesCount}`;
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
      // 1. 绘制前缀链水平有向边 (Pre_{i-1} -> Pre_i)
      for (let i = 1; i < this.k; i++) {
        const p1 = this.prePositions[i];
        const p2 = this.prePositions[i + 1];
        if (!p1 || !p2) continue;

        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      }

      // 2. 绘制实体点到前缀点垂直边 (u_i -> Pre_i)
      for (let i = 1; i <= this.k; i++) {
        const pVar = this.varPositions[i];
        const pPre = this.prePositions[i];
        if (!pVar || !pPre) continue;

        const isChosen = cur.selectedVar === i;

        ctx.save();
        ctx.strokeStyle = isChosen ? '#facc15' : 'rgba(100, 116, 139, 0.4)';
        ctx.lineWidth = isChosen ? 3 : 1.5;
        if (isChosen) {
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 8;
        }

        ctx.beginPath();
        ctx.moveTo(pVar.x, pVar.y);
        ctx.lineTo(pPre.x, pPre.y);
        ctx.stroke();
        ctx.restore();
      }

      // 3. 绘制斜向逆向禁止边 (u3 -> ~Pre2)
      if (cur.selectedVar === 3) {
        const pVar3 = this.varPositions[3];
        const pPre2 = this.prePositions[2];
        if (pVar3 && pPre2) {
          ctx.save();
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.setLineDash([4, 4]);
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 8;

          ctx.beginPath();
          ctx.moveTo(pVar3.x, pVar3.y);
          ctx.lineTo(pPre2.x, pPre2.y);
          ctx.stroke();
          ctx.restore();
        }
      }

      // 4. 绘制前缀节点
      for (let i = 1; i <= this.k; i++) {
        const pos = this.prePositions[i];
        if (!pos) continue;

        const isActive = cur.activePrefixNodes.includes(i);

        ctx.save();
        ctx.fillStyle = isActive ? '#0369a1' : '#1e293b';
        ctx.strokeStyle = isActive ? '#38bdf8' : '#64748b';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.roundRect(pos.x - 14, pos.y - 12, 28, 24, 4);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 9.5px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`P${i}`, pos.x, pos.y);
        ctx.restore();
      }

      // 5. 绘制实体变量节点
      for (let i = 1; i <= this.k; i++) {
        const pos = this.varPositions[i];
        if (!pos) continue;

        const isChosen = cur.selectedVar === i;
        const isForbidden = cur.forbiddenVars.includes(i);

        ctx.save();
        let fillColor = '#1e293b';
        let strokeColor = isChosen ? '#facc15' : isForbidden ? '#ef4444' : '#38bdf8';
        let radius = 13;

        if (isChosen) {
          fillColor = '#854d0e';
          radius = 15 + Math.sin(this.pulseAnim) * 1.5;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 10;
        }

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isChosen || isForbidden ? 3 : 1.5;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`u${i}`, pos.x, pos.y);

        if (isForbidden) {
          ctx.font = 'bold 12px sans-serif';
          ctx.fillStyle = '#ef4444';
          ctx.fillText('❌', pos.x, pos.y + 18);
        }

        ctx.restore();
      }

      // 6. 右侧边数压缩对比 HUD
      ctx.save();
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('📊 边数压缩量化对比:', 260, 30);

      // 朴素两两连边卡片
      ctx.fillStyle = '#7f1d1d';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(260, 42, 175, 26, 4);
      ctx.fill();
      ctx.stroke();
      ctx.font = '10px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`朴素完全图: k(k-1) = ${this.k * (this.k - 1)} 条边`, 268, 58);

      // 前缀优化连边卡片
      ctx.fillStyle = '#064e3b';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(260, 76, 175, 26, 4);
      ctx.fill();
      ctx.stroke();
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`前缀优化图: 3k-2 = ${3 * this.k - 2} 条边`, 268, 92);

      // 规模拓展说明
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#facc15';
      ctx.fillText(`🚀 当 k = 100,000 时:`, 255, 135);
      ctx.fillStyle = '#ef4444';
      ctx.fillText(`• 朴素边数: 100 亿条边 (内存爆炸)`, 255, 155);
      ctx.fillStyle = '#10b981';
      ctx.fillText(`• 前缀优化: 仅 30 万条边 (毫秒通过)`, 255, 175);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const PREFIX_OPT_TEMPLATE = `
  <div id="algo-prefix-opt-graph-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🌐</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">前缀优化建图 (Prefix Optimization Graph)</span>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="prefix-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-prefix-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-prefix-autoplay" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(2,132,199,0.25);">▶️ 自动演示</button>
        <button id="btn-prefix-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-prefix-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #0369a1;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>📊 边数对比: <b id="prefix-edge-badge" style="color: #0284c7; font-size: 12px;">朴素: 12 ➔ 前缀优化: 10</b></span>
      </div>
      <div id="prefix-narration-box" style="font-weight: 700; color: #075985;">
        💡 准备就绪：前缀链辅助点 ui -> Pre_i, Pre_{i-1} -> Pre_i, ui -> ~Pre_{i-1}，严格 O(k) 边数！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：前缀链与变量节点 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="prefix-opt-canvas" width="460" height="220" style="width: 460px; height: 220px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          上方为前缀辅助链 P1..P4 | 下方为实体变量 u1..u4 | 选定 u3 沿红虚线禁止前驱 ~P2
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="prefix-opt-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'prefix-opt-graph',
  name: '前缀优化建图 (Prefix Opt Graph)',
  viewId: 'algo-prefix-opt-graph-view',
  category: 'graph',
  description: '进阶图论建图优化：至多选一限制、前缀链辅助点将 O(k^2) 边数压缩至严格 O(k) 线性边数 (洛谷 P6378 [PA2010] Riddle)',
  icon: '🌐',
  template: PREFIX_OPT_TEMPLATE,
  Visualizer: PrefixOptGraphVisualizer,
  difficulty: 3,
  levelOrder: 69,
  learningGoal: '掌握至多选一约束的前缀辅助链建图技巧、线性边数压缩原理及树状数组/线段树优化建图扩展',
});
