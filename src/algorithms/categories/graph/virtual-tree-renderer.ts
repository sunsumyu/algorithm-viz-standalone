/**
 * 虚树与多次关键点树形 DP (Virtual Tree / Auxiliary Tree) 可视化引擎
 * 进阶树论: 关键点按 DFN 排序、单调栈维护 LCA 关键链、O(K log N) 虚树构建与极速 DP (洛谷 P2495 [SDOI2011] 消耗战)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  VIRTUAL_TREE_CODE_LANGUAGES,
  VIRTUAL_TREE_PROBLEM_HTML,
  VIRTUAL_TREE_ANALYSIS_HTML,
} from './virtual-tree-problem-content';

export interface VTreeStep {
  type: 'SELECT_KEY_NODES' | 'SORT_BY_DFN' | 'MONO_STACK_BUILD' | 'VIRTUAL_TREE_DONE' | 'ALL_DONE';
  keyNodes: number[];
  stackSnapshot: number[];
  lcaNodes: number[];
  vTreeEdges: Array<{ u: number; v: number }>;
  curProcessing?: number;
  message: string;
}

class VTreeAudio {
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

  public static playKey(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  public static playStack(): void {
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

  public static playSuccess(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const chord = [523.25, 659.25, 783.99, 1046.5];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.22);
      });
    } catch {}
  }
}

export class VirtualTreeVisualizer extends StepVisualizer<any> {
  // 原树参数与坐标 (1-indexed)
  private n = 9;
  private origEdges: Array<{ u: number; v: number }> = [];
  private origPositions: Array<{ x: number; y: number }> = [];
  private vtreePositions: Array<{ x: number; y: number }> = [];
  private keyNodes: number[] = [];

  // 推演步骤
  private traceSteps: VTreeStep[] = [];
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
    this.codeLanguages = VIRTUAL_TREE_CODE_LANGUAGES;
    this.codeLines = VIRTUAL_TREE_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '虚树构建与关键点 DP 引擎 (Virtual Tree)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '虚树构建' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_9_NODES_TREE');
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

    if (presetKey === 'CLASSIC_9_NODES_TREE') {
      this.n = 9;
      this.keyNodes = [4, 5, 8];
      this.origEdges = [
        { u: 1, v: 2 },
        { u: 1, v: 3 },
        { u: 2, v: 4 },
        { u: 2, v: 5 },
        { u: 3, v: 6 },
        { u: 3, v: 7 },
        { u: 6, v: 8 },
        { u: 6, v: 9 },
      ];
      this.origPositions = [
        { x: 0, y: 0 },
        { x: 100, y: 35 },  // 1 (root)
        { x: 50, y: 85 },   // 2
        { x: 150, y: 85 },  // 3
        { x: 30, y: 135 },  // 4 (key)
        { x: 70, y: 135 },  // 5 (key)
        { x: 130, y: 135 }, // 6
        { x: 170, y: 135 }, // 7
        { x: 120, y: 175 }, // 8 (key)
        { x: 145, y: 175 }, // 9
      ];
      this.vtreePositions = [
        { x: 0, y: 0 },
        { x: 330, y: 35 },  // 1 (root)
        { x: 270, y: 95 },  // 2 (LCA of 4, 5)
        { x: 0, y: 0 },
        { x: 245, y: 165 }, // 4 (key)
        { x: 295, y: 165 }, // 5 (key)
        { x: 390, y: 95 },  // 6 (LCA of 8)
        { x: 0, y: 0 },
        { x: 390, y: 165 }, // 8 (key)
        { x: 0, y: 0 },
      ];
    } else {
      this.n = 6;
      this.keyNodes = [2, 5];
      this.origEdges = [
        { u: 1, v: 2 },
        { u: 2, v: 3 },
        { u: 3, v: 4 },
        { u: 4, v: 5 },
        { u: 5, v: 6 },
      ];
      this.origPositions = [
        { x: 0, y: 0 },
        { x: 30, y: 35 },
        { x: 55, y: 65 },
        { x: 80, y: 95 },
        { x: 105, y: 125 },
        { x: 130, y: 155 },
        { x: 155, y: 180 },
      ];
      this.vtreePositions = [
        { x: 0, y: 0 },
        { x: 330, y: 35 },
        { x: 330, y: 95 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 330, y: 155 },
        { x: 0, y: 0 },
      ];
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const steps: VTreeStep[] = [];

    if (this.n === 9) {
      // 1. 选出关键点
      steps.push({
        type: 'SELECT_KEY_NODES',
        keyNodes: [4, 5, 8],
        stackSnapshot: [],
        lcaNodes: [],
        vTreeEdges: [],
        message: '⭐ [选择关键点] 本次询问指定 3 个关键点：[4, 5, 8]，准备提取极小骨架虚树！',
      });

      // 2. 按 DFN 排序
      steps.push({
        type: 'SORT_BY_DFN',
        keyNodes: [4, 5, 8],
        stackSnapshot: [1],
        lcaNodes: [],
        vTreeEdges: [],
        message: '📑 [DFN 序排序] 关键点按原树 DFS 序排序为 [4, 5, 8]，根节点 1 压入单调栈！',
      });

      // 3. 插入 4, 5 (产生 LCA 2)
      steps.push({
        type: 'MONO_STACK_BUILD',
        keyNodes: [4, 5, 8],
        curProcessing: 5,
        stackSnapshot: [1, 2, 5],
        lcaNodes: [2],
        vTreeEdges: [{ u: 2, v: 4 }],
        message: '🧱 [单调栈构建] 插入点 5 时计算 LCA(4, 5) = 2，弹栈连接 2 → 4，LCA 节点 2 与 5 入栈！',
      });

      // 4. 插入 8 (产生 LCA 6)
      steps.push({
        type: 'MONO_STACK_BUILD',
        keyNodes: [4, 5, 8],
        curProcessing: 8,
        stackSnapshot: [1, 6, 8],
        lcaNodes: [2, 6],
        vTreeEdges: [{ u: 2, v: 4 }, { u: 2, v: 5 }, { u: 1, v: 2 }],
        message: '🧱 [单调栈结算] 插入点 8 时弹出左子树并连接 1 → 2，LCA(1, 8)=1，虚树结构逐步成型！',
      });

      // 5. 虚树构建完成
      steps.push({
        type: 'VIRTUAL_TREE_DONE',
        keyNodes: [4, 5, 8],
        stackSnapshot: [],
        lcaNodes: [2, 6],
        vTreeEdges: [{ u: 1, v: 2 }, { u: 2, v: 4 }, { u: 2, v: 5 }, { u: 1, v: 6 }, { u: 6, v: 8 }],
        message: '🌲 [虚树构建完成] 包含根节点与关键点仅 5 个节点 (<= 2K)，原 9 节点大树压缩成功！',
      });
    } else {
      steps.push({
        type: 'SELECT_KEY_NODES',
        keyNodes: [2, 5],
        stackSnapshot: [],
        lcaNodes: [],
        vTreeEdges: [],
        message: '⭐ [关键点选择] 选中单链中的关键点 [2, 5]！',
      });

      steps.push({
        type: 'VIRTUAL_TREE_DONE',
        keyNodes: [2, 5],
        stackSnapshot: [],
        lcaNodes: [],
        vTreeEdges: [{ u: 1, v: 2 }, { u: 2, v: 5 }],
        message: '🌲 [链上虚树压缩] 虚树仅保留 1 → 2 → 5 直链，DP 复杂度极速降维！',
      });
    }

    steps.push({
      type: 'ALL_DONE',
      keyNodes: this.keyNodes,
      stackSnapshot: [],
      lcaNodes: [2, 6],
      vTreeEdges: steps[steps.length - 1].vTreeEdges,
      message: '🎉 [虚树极速 DP 就绪] 在规模 <= 2K 的虚树上单次 DFS 仅耗时 O(K)，海量询问不再超时！',
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#vtree-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: VIRTUAL_TREE_CODE_LANGUAGES,
      problemHtml: VIRTUAL_TREE_PROBLEM_HTML,
      analysisHtml: VIRTUAL_TREE_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-vtree-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-vtree-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-vtree-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.vtree-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_9_NODES_TREE';
        this.root?.querySelectorAll('.vtree-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-vtree-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        VTreeAudio.isMuted = !VTreeAudio.isMuted;
        soundBtn.textContent = VTreeAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'SELECT_KEY_NODES') VTreeAudio.playKey();
      else if (cur.type === 'MONO_STACK_BUILD') VTreeAudio.playStack();
      else if (cur.type === 'VIRTUAL_TREE_DONE' || cur.type === 'ALL_DONE') VTreeAudio.playSuccess();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-vtree-autoplay') as HTMLButtonElement | null;
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
    const playBtn = this.root?.querySelector('#btn-vtree-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动构建';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#vtree-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#vtree-status-badge') as HTMLElement | null;
    const scaleBadge = this.root.querySelector('#vtree-scale-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = '🏁 虚树构建完成';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (scaleBadge) {
      scaleBadge.textContent = `原树: ${this.n} 节点 ➔ 虚树: ≤ ${2 * this.keyNodes.length} 节点`;
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
    ctx.fillText(`🌲 原大树 (N=${this.n})`, 10, 20);
    ctx.fillText(`✨ 压缩虚树 (K=${this.keyNodes.length})`, 215, 20);

    // 1. 绘制左侧原树边
    this.origEdges.forEach((e) => {
      const p1 = this.origPositions[e.u];
      const p2 = this.origPositions[e.v];
      if (!p1 || !p2) return;

      ctx.save();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.lineWidth = 1.5;

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

      const isKey = this.keyNodes.includes(i);
      const isCur = cur && cur.curProcessing === i;

      ctx.save();
      let fillColor = '#1e293b';
      let strokeColor = isKey ? '#f43f5e' : '#475569';
      let radius = 12;

      if (isKey) {
        fillColor = '#881337';
        radius = 14 + (isCur ? Math.sin(this.pulseAnim) * 2 : 0);
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 10;
      }

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = isKey ? 2.5 : 1.5;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = isKey ? '#ffffff' : '#94a3b8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${i}`, pos.x, pos.y);

      if (isKey) {
        ctx.font = '10px sans-serif';
        ctx.fillText('⭐', pos.x + 12, pos.y - 8);
      }

      ctx.restore();
    }

    // 3. 绘制右侧虚树边
    if (cur) {
      cur.vTreeEdges.forEach((e) => {
        const p1 = this.vtreePositions[e.u];
        const p2 = this.vtreePositions[e.v];
        if (!p1 || !p2 || (p1.x === 0 && p1.y === 0) || (p2.x === 0 && p2.y === 0)) return;

        ctx.save();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      });

      // 4. 绘制右侧虚树节点
      for (let i = 1; i <= this.n; i++) {
        const pos = this.vtreePositions[i];
        if (!pos || (pos.x === 0 && pos.y === 0)) continue;

        const isKey = this.keyNodes.includes(i);
        const isLCA = cur.lcaNodes.includes(i);
        const isRoot = i === 1;

        ctx.save();
        let fillColor = '#1e293b';
        let strokeColor = isKey ? '#f43f5e' : isLCA ? '#facc15' : '#10b981';
        let radius = 13;

        if (isKey) {
          fillColor = '#881337';
        } else if (isLCA) {
          fillColor = '#713f12';
        } else if (isRoot) {
          fillColor = '#064e3b';
        }

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

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

export const VIRTUAL_TREE_TEMPLATE = `
  <div id="algo-virtual-tree-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🌲</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">虚树与关键点 DP (Virtual Tree)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="vtree-preset-btn active" data-preset="CLASSIC_9_NODES_TREE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">9 节点树 (3 关键点)</button>
          <button class="vtree-preset-btn" data-preset="DEEP_CHAIN_KEY_POINTS" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">单链多关键点</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="vtree-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-vtree-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-vtree-autoplay" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(16,185,129,0.25);">▶️ 自动构建</button>
        <button id="btn-vtree-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-vtree-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #166534;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>🌲 规模压缩比: <b id="vtree-scale-badge" style="color: #059669; font-size: 12px;">原树 9 节点 ➔ 虚树 ≤ 6 节点</b></span>
      </div>
      <div id="vtree-narration-box" style="font-weight: 700; color: #14532d;">
        💡 准备就绪：DFN 序排序 + 单调栈维护关键链，虚树大小 ≤ 2K！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：原树与虚树 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="vtree-canvas" width="460" height="200" style="width: 460px; height: 200px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          左侧为原大树 (🔴 ⭐ 带星为关键点) | 右侧为压缩后的虚树 (🟡 金色为插入的 LCA 汇聚点)
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="vtree-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'virtual-tree',
  name: '虚树 (Virtual Tree)',
  viewId: 'algo-virtual-tree-view',
  category: 'graph',
  description: '进阶树论高效数据结构：关键点按 DFN 序排序、单调栈维护 LCA 关键链、O(K log N) 虚树构建与极速树形 DP (洛谷 P2495 [SDOI2011] 消耗战)',
  icon: '🌲',
  template: VIRTUAL_TREE_TEMPLATE,
  Visualizer: VirtualTreeVisualizer,
  difficulty: 3,
  levelOrder: 60,
  learningGoal: '掌握虚树大小不超过 2K 的严密证明、单调栈单遍构建算法与海量关键点询问由 O(N) 降为 O(K) 的优化本质',
});
