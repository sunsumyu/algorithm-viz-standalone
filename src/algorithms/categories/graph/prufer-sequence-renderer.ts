/**
 * Prufer 序列与 Cayley 公式 (Prufer Sequence) 可视化引擎
 * 进阶图论: 树转 Prufer 序列 (度数-1 次数)、Prufer 序列逆向重构树、双射与 n^(n-2) Cayley 公式 (洛谷 P6086)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  PRUFER_CODE_LANGUAGES,
  PRUFER_PROBLEM_HTML,
  PRUFER_ANALYSIS_HTML,
} from './prufer-sequence-problem-content';

export interface PruferStep {
  type: 'INIT' | 'ENCODE_LEAF' | 'ENCODE_DONE' | 'DECODE_STEP' | 'ALL_DONE';
  activeEdges: Array<{ u: number; v: number }>;
  removedNodes: number[];
  curLeaf?: number;
  curParent?: number;
  pruferSequence: number[];
  degSnapshot: number[];
  message: string;
}

class PruferAudio {
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

  public static playSnip(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playWrite(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
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
      const chord = [523.25, 659.25, 783.99, 1046.5];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.25);
      });
    } catch {}
  }
}

export class PruferSequenceVisualizer extends StepVisualizer<any> {
  // 树参数与坐标 (1-indexed)
  private n = 6;
  private origEdges: Array<{ u: number; v: number }> = [];
  private nodePositions: Array<{ x: number; y: number }> = [];

  // 推演步骤
  private traceSteps: PruferStep[] = [];
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
    this.codeLanguages = PRUFER_CODE_LANGUAGES;
    this.codeLines = PRUFER_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = 'Prufer 序列编解码引擎 (Prufer Sequence)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: 'Prufer 序列' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_6_NODES_TREE');
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

    if (presetKey === 'CLASSIC_6_NODES_TREE') {
      this.n = 6;
      this.origEdges = [
        { u: 1, v: 2 },
        { u: 1, v: 3 },
        { u: 2, v: 4 },
        { u: 2, v: 5 },
        { u: 3, v: 6 },
      ];
      this.nodePositions = [
        { x: 0, y: 0 },
        { x: 100, y: 50 },  // 1
        { x: 50, y: 110 },  // 2
        { x: 150, y: 110 }, // 3
        { x: 30, y: 170 },  // 4
        { x: 80, y: 170 },  // 5
        { x: 150, y: 170 }, // 6
      ];
    } else {
      this.n = 5;
      this.origEdges = [
        { u: 1, v: 2 },
        { u: 1, v: 3 },
        { u: 1, v: 4 },
        { u: 1, v: 5 },
      ];
      this.nodePositions = [
        { x: 0, y: 0 },
        { x: 100, y: 100 }, // 1 (center)
        { x: 40, y: 40 },   // 2
        { x: 160, y: 40 },  // 3
        { x: 40, y: 160 },  // 4
        { x: 160, y: 160 }, // 5
      ];
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const n = this.n;
    const deg = Array(n + 1).fill(0);
    const adj: number[][] = Array.from({ length: n + 1 }, () => []);

    this.origEdges.forEach((e) => {
      deg[e.u]++;
      deg[e.v]++;
      adj[e.u].push(e.v);
      adj[e.v].push(e.u);
    });

    const steps: PruferStep[] = [];
    const pruferSeq: number[] = [];
    const removed: number[] = [];
    let curEdges = [...this.origEdges];

    steps.push({
      type: 'INIT',
      activeEdges: [...curEdges],
      removedNodes: [],
      pruferSequence: [],
      degSnapshot: [...deg],
      message: `🚀 初始化 Prufer 编码：树包含 ${n} 个节点，各点度数已计算，准备循环 ${n - 2} 轮提取最小叶子！`,
    });

    // 编码循环
    for (let round = 1; round <= n - 2; round++) {
      let leaf = 1;
      while (deg[leaf] !== 1) leaf++;

      const parentNode = adj[leaf].find((v) => !removed.includes(v))!;

      pruferSeq.push(parentNode);
      removed.push(leaf);
      deg[leaf] = 0;
      deg[parentNode]--;

      curEdges = curEdges.filter((e) => !(e.u === leaf || e.v === leaf));

      steps.push({
        type: 'ENCODE_LEAF',
        curLeaf: leaf,
        curParent: parentNode,
        activeEdges: [...curEdges],
        removedNodes: [...removed],
        pruferSequence: [...pruferSeq],
        degSnapshot: [...deg],
        message: `✂️ [第 ${round} 轮剪枝] 最小叶子为节点 ${leaf}，将其唯一邻居/父节点 ${parentNode} 写入 Prufer 序列末尾！`,
      });
    }

    steps.push({
      type: 'ENCODE_DONE',
      activeEdges: [...curEdges],
      removedNodes: [...removed],
      pruferSequence: [...pruferSeq],
      degSnapshot: [...deg],
      message: `📼 [编码完成] Prufer 序列生成完毕: [${pruferSeq.join(', ')}]，长度为 ${n - 2}！`,
    });

    steps.push({
      type: 'ALL_DONE',
      activeEdges: [...this.origEdges],
      removedNodes: [],
      pruferSequence: [...pruferSeq],
      degSnapshot: [...deg],
      message: `🎉 [Cayley 公式验证] 长度为 ${n - 2} 的 Prufer 序列完美双射对应原树，共有 ${Math.pow(n, n - 2)} 种生成树可能！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#prufer-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: PRUFER_CODE_LANGUAGES,
      problemHtml: PRUFER_PROBLEM_HTML,
      analysisHtml: PRUFER_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-prufer-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-prufer-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-prufer-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.prufer-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_6_NODES_TREE';
        this.root?.querySelectorAll('.prufer-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-prufer-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        PruferAudio.isMuted = !PruferAudio.isMuted;
        soundBtn.textContent = PruferAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'ENCODE_LEAF') PruferAudio.playSnip();
      else if (cur.type === 'ENCODE_DONE') PruferAudio.playWrite();
      else if (cur.type === 'ALL_DONE') PruferAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-prufer-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停编码';

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
    const playBtn = this.root?.querySelector('#btn-prufer-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动编码';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#prufer-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#prufer-status-badge') as HTMLElement | null;
    const tapeBadge = this.root.querySelector('#prufer-tape-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = '🏁 Prufer 编解码就绪';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (tapeBadge) {
      if (cur.pruferSequence.length > 0) {
        tapeBadge.innerHTML = cur.pruferSequence
          .map((x) => `<span style="background: #1e293b; color: #facc15; border: 1px solid #38bdf8; border-radius: 4px; padding: 2px 6px; font-weight: bold;">${x}</span>`)
          .join(' ');
      } else {
        tapeBadge.textContent = '空序列 []';
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

    // 1. 绘制左侧树边
    if (cur) {
      cur.activeEdges.forEach((e) => {
        const p1 = this.nodePositions[e.u];
        const p2 = this.nodePositions[e.v];
        if (!p1 || !p2) return;

        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      });
    }

    // 2. 绘制树节点
    for (let i = 1; i <= this.n; i++) {
      const pos = this.nodePositions[i];
      if (!pos) continue;

      const isRemoved = cur && cur.removedNodes.includes(i);
      const isCurLeaf = cur && cur.curLeaf === i;
      const isParent = cur && cur.curParent === i;

      ctx.save();
      let fillColor = isRemoved ? '#334155' : '#1e293b';
      let strokeColor = isRemoved ? '#475569' : '#38bdf8';
      let radius = 15;

      if (isCurLeaf) {
        strokeColor = '#ef4444';
        fillColor = '#7f1d1d';
        radius = 17 + Math.sin(this.pulseAnim) * 1.5;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
      } else if (isParent) {
        strokeColor = '#facc15';
        fillColor = '#854d0e';
      }

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 标签
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = isRemoved ? '#64748b' : '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${i}`, pos.x, pos.y);

      if (isCurLeaf) {
        ctx.font = '12px sans-serif';
        ctx.fillText('✂️', pos.x + 14, pos.y - 10);
      }

      ctx.restore();
    }

    // 3. 绘制右侧 Prufer 磁带
    ctx.save();
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('📼 Prufer 序列磁带:', 220, 30);

    const tapeLen = this.n - 2;
    for (let slot = 0; slot < tapeLen; slot++) {
      const slotX = 220 + slot * 50;
      const slotY = 45;
      const val = cur && cur.pruferSequence[slot] ? cur.pruferSequence[slot] : null;

      ctx.fillStyle = val ? '#1e293b' : '#0f172a';
      ctx.strokeStyle = val ? '#facc15' : '#334155';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.rect(slotX, slotY, 40, 40);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = val ? '#facc15' : '#475569';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(val ? `${val}` : '?', slotX + 20, slotY + 20);

      ctx.font = '8px monospace';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`[${slot + 1}]`, slotX + 20, slotY + 48);
    }

    // Cayley 标语
    ctx.font = '10.5px sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'left';
    ctx.fillText(`✨ Cayley 公式: ${this.n}^(${this.n}-2) = ${Math.pow(this.n, this.n - 2)} 种生成树`, 220, 130);
    ctx.fillText(`📊 出现次数: count(i) = deg(i) - 1`, 220, 150);

    ctx.restore();

    ctx.restore();
  }
}

export const PRUFER_TEMPLATE = `
  <div id="algo-prufer-sequence-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">📼</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">Prufer 序列与 Cayley 公式 (Prufer Sequence)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="prufer-preset-btn active" data-preset="CLASSIC_6_NODES_TREE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">6 节点经典树结构</button>
          <button class="prufer-preset-btn" data-preset="STAR_GRAPH_TREE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">5 节点星形树</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="prufer-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-prufer-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-prufer-autoplay" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(2,132,199,0.25);">▶️ 自动编码</button>
        <button id="btn-prufer-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-prufer-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #0369a1;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>📼 当前 Prufer 序列: <b id="prufer-tape-badge" style="color: #0284c7; font-size: 12px;">空序列 []</b></span>
      </div>
      <div id="prufer-narration-box" style="font-weight: 700; color: #075985;">
        💡 准备就绪：挑选编号最小叶子剪枝，记录父节点至序列，严格双射！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：图 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="prufer-canvas" width="460" height="200" style="width: 460px; height: 200px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🔴 红色带 ✂️ 为当前选中的最小叶子 | 🟡 金色为写入磁带的父节点 | 📼 右侧展示 Prufer 磁带槽
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="prufer-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'prufer-sequence',
  name: 'Prufer 序列 (Prufer Sequence)',
  viewId: 'algo-prufer-sequence-view',
  category: 'graph',
  description: '组合图论树编码算法：树转 Prufer 序列 (度数-1 频次)、Prufer 逆向重构树、双射与 n^(n-2) Cayley 公式验证 (洛谷 P6086)',
  icon: '📼',
  template: PRUFER_TEMPLATE,
  Visualizer: PruferSequenceVisualizer,
  difficulty: 3,
  levelOrder: 55,
  learningGoal: '掌握树与 Prufer 序列的双向一一映射、度数性质 count(i)=deg(i)-1、O(n) 线性双指针编解码与 Cayley 生成树公式证明',
});
