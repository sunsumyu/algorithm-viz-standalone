/**
 * Kruskal 重构树与路径瓶颈 LCA (Kruskal Reconstruction Tree) 可视化引擎
 * 参考左程云《算法通关课》进阶图论: 边权升序构造 2n-1 节点二叉树、LCA 快速查询路径瓶颈与子树可达性
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  KRUSKAL_TREE_CODE_LANGUAGES,
  KRUSKAL_TREE_PROBLEM_HTML,
  KRUSKAL_TREE_ANALYSIS_HTML,
} from './kruskal-reconstruction-tree-problem-content';

export interface KruskalEdge {
  u: number;
  v: number;
  w: number;
}

export interface KruskalTreeNode {
  id: number;
  val: number;
  isVirtual: boolean;
  left?: number;
  right?: number;
  x: number;
  y: number;
}

export interface KruskalTreeStep {
  type: 'INIT' | 'ADD_VIRTUAL_NODE' | 'TREE_COMPLETE' | 'LCA_QUERY';
  curEdge?: KruskalEdge;
  activeTreeNodes: KruskalTreeNode[];
  lcaPair?: [number, number];
  lcaNode?: number;
  message: string;
}

class KruskalTreeAudio {
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

  public static playEdge(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {}
  }

  public static playSprout(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(987.77, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } catch {}
  }

  public static playLca(): void {
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

export class KruskalReconstructionTreeVisualizer extends StepVisualizer<any> {
  // 原图数据
  private n = 4;
  private rawEdges: KruskalEdge[] = [];
  private graphPositions: Array<{ x: number; y: number }> = [];

  // 推演步骤
  private traceSteps: KruskalTreeStep[] = [];
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
    this.codeLanguages = KRUSKAL_TREE_CODE_LANGUAGES;
    this.codeLines = KRUSKAL_TREE_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = 'Kruskal 重构树与 LCA 引擎';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: 'Kruskal 重构树' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_4_NODE_DIAMOND');
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

    if (presetKey === 'CLASSIC_4_NODE_DIAMOND') {
      this.n = 4;
      this.rawEdges = [
        { u: 1, v: 2, w: 1 },
        { u: 2, v: 3, w: 2 },
        { u: 3, v: 4, w: 3 },
        { u: 1, v: 3, w: 4 },
        { u: 1, v: 4, w: 5 },
      ];
      this.graphPositions = [
        { x: 0, y: 0 },
        { x: 40, y: 115 },  // 1
        { x: 95, y: 55 },   // 2
        { x: 95, y: 175 },  // 3
        { x: 150, y: 115 }, // 4
      ];
    } else if (presetKey === 'LINEAR_WEIGHT_CHAIN') {
      this.n = 4;
      this.rawEdges = [
        { u: 1, v: 2, w: 2 },
        { u: 2, v: 3, w: 5 },
        { u: 3, v: 4, w: 8 },
      ];
      this.graphPositions = [
        { x: 0, y: 0 },
        { x: 30, y: 115 },
        { x: 75, y: 115 },
        { x: 120, y: 115 },
        { x: 165, y: 115 },
      ];
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const n = this.n;
    const parent: number[] = Array.from({ length: 2 * n + 1 }, (_, i) => i);
    const sortedEdges = [...this.rawEdges].sort((a, b) => a.w - b.w);

    const find = (i: number): number => {
      if (parent[i] !== i) parent[i] = find(parent[i]);
      return parent[i];
    };

    const treeNodes: KruskalTreeNode[] = [];
    // 初始 n 个真实叶子节点
    for (let i = 1; i <= n; i++) {
      treeNodes.push({
        id: i,
        val: 0,
        isVirtual: false,
        x: 230 + (i - 1) * 60,
        y: 190,
      });
    }

    let nodeCount = n;
    const steps: KruskalTreeStep[] = [];

    const cloneTree = () => treeNodes.map((t) => ({ ...t }));

    steps.push({
      type: 'INIT',
      activeTreeNodes: cloneTree(),
      message: `🚀 初始化：原图 ${n} 个真实节点作为重构树的叶子节点，并查集各自分立。`,
    });

    for (const e of sortedEdges) {
      const fu = find(e.u);
      const fv = find(e.v);

      if (fu !== fv) {
        nodeCount++;
        const nc = nodeCount;
        parent[nc] = nc;
        parent[fu] = nc;
        parent[fv] = nc;

        // 计算虚节点坐标 (位于左右子节点中间上方)
        const leftNode = treeNodes.find((t) => t.id === fu);
        const rightNode = treeNodes.find((t) => t.id === fv);
        const xPos = leftNode && rightNode ? (leftNode.x + rightNode.x) / 2 : 320;
        const yPos = Math.max(30, 190 - (nodeCount - n) * 45);

        treeNodes.push({
          id: nc,
          val: e.w,
          isVirtual: true,
          left: fu,
          right: fv,
          x: xPos,
          y: yPos,
        });

        steps.push({
          type: 'ADD_VIRTUAL_NODE',
          curEdge: e,
          activeTreeNodes: cloneTree(),
          message: `🌲 选取最小边 (${e.u} ↔ ${e.v}，权 ${e.w})：新建虚节点 N${nc} [权值 ${e.w}]，将 N${fu} 与 N${fv} 挂为左右子树！`,
        });
      }
    }

    steps.push({
      type: 'TREE_COMPLETE',
      activeTreeNodes: cloneTree(),
      message: `🎉 Kruskal 重构树构建完成！共计 ${nodeCount} 个节点（${n} 个叶子 + ${nodeCount - n} 个虚点），点权从叶到根单调递增！`,
    });

    // 演示 LCA 查询路径瓶颈 (N1 与 N4)
    steps.push({
      type: 'LCA_QUERY',
      activeTreeNodes: cloneTree(),
      lcaPair: [1, 4],
      lcaNode: nodeCount,
      message: `🔍 [LCA 路径瓶颈查询] 查询 N1 与 N4 之间的最大边权最小值：重构树上 LCA(N1, N4) = N${nodeCount}，点权 = ${treeNodes.find((t) => t.id === nodeCount)?.val}！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#kruskal-tree-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: KRUSKAL_TREE_CODE_LANGUAGES,
      problemHtml: KRUSKAL_TREE_PROBLEM_HTML,
      analysisHtml: KRUSKAL_TREE_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-ktree-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-ktree-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-ktree-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.ktree-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_4_NODE_DIAMOND';
        this.root?.querySelectorAll('.ktree-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-ktree-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        KruskalTreeAudio.isMuted = !KruskalTreeAudio.isMuted;
        soundBtn.textContent = KruskalTreeAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'ADD_VIRTUAL_NODE') KruskalTreeAudio.playSprout();
      else if (cur.type === 'LCA_QUERY') KruskalTreeAudio.playLca();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-ktree-autoplay') as HTMLButtonElement | null;
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
    const playBtn = this.root?.querySelector('#btn-ktree-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动推演';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#ktree-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#ktree-status-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'TREE_COMPLETE' || cur.type === 'LCA_QUERY') {
        statusBadge.textContent = '🎯 重构树构建完成';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
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

    // 1. 绘制原图 (左侧 0 ~ 190px)
    this.rawEdges.forEach((e) => {
      const p1 = this.graphPositions[e.u];
      const p2 = this.graphPositions[e.v];
      if (!p1 || !p2) return;

      const isCurEdge = cur && cur.curEdge && cur.curEdge.u === e.u && cur.curEdge.v === e.v;

      ctx.save();
      if (isCurEdge) {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
      } else {
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
        ctx.lineWidth = 2;
      }

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      ctx.font = 'bold 9.5px monospace';
      ctx.fillStyle = isCurEdge ? '#facc15' : '#94a3b8';
      ctx.fillText(`${e.w}`, midX, midY - 3);

      ctx.restore();
    });

    for (let i = 1; i <= this.n; i++) {
      const p = this.graphPositions[i];
      if (!p) continue;

      ctx.save();
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 9.5px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`N${i}`, p.x, p.y);
      ctx.restore();
    }

    // 分隔线
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(195, 10);
    ctx.lineTo(195, height - 10);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. 绘制右侧 Kruskal 重构树
    if (cur && cur.activeTreeNodes) {
      // 树边
      cur.activeTreeNodes.forEach((tn) => {
        if (tn.left !== undefined) {
          const lNode = cur.activeTreeNodes.find((t) => t.id === tn.left);
          if (lNode) {
            ctx.save();
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(tn.x, tn.y);
            ctx.lineTo(lNode.x, lNode.y);
            ctx.stroke();
            ctx.restore();
          }
        }
        if (tn.right !== undefined) {
          const rNode = cur.activeTreeNodes.find((t) => t.id === tn.right);
          if (rNode) {
            ctx.save();
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(tn.x, tn.y);
            ctx.lineTo(rNode.x, rNode.y);
            ctx.stroke();
            ctx.restore();
          }
        }
      });

      // 树节点
      cur.activeTreeNodes.forEach((tn) => {
        const isLca = cur.lcaNode === tn.id;

        ctx.save();
        let radius = tn.isVirtual ? 15 : 12;
        let fillColor = tn.isVirtual ? '#065f46' : '#1e293b';
        let strokeColor = tn.isVirtual ? '#34d399' : '#38bdf8';

        if (isLca) {
          fillColor = '#854d0e';
          strokeColor = '#facc15';
          radius = 18 + Math.sin(this.pulseAnim) * 2;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 14;
        }

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(tn.x, tn.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tn.isVirtual ? `w:${tn.val}` : `N${tn.id}`, tn.x, tn.y);

        ctx.restore();
      });
    }

    ctx.restore();
  }
}

export const KRUSKAL_TREE_TEMPLATE = `
  <div id="algo-kruskal-reconstruction-tree-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🌲</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">Kruskal 重构树与路径瓶颈 LCA</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="ktree-preset-btn active" data-preset="CLASSIC_4_NODE_DIAMOND" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典菱形网</button>
          <button class="ktree-preset-btn" data-preset="LINEAR_WEIGHT_CHAIN" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">线性递增链</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="ktree-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-ktree-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步建树</button>
        <button id="btn-ktree-autoplay" style="background: linear-gradient(135deg, #059669, #047857); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(5,150,105,0.25);">▶️ 自动推演</button>
        <button id="btn-ktree-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-ktree-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #166534;">
      <div id="ktree-narration-box" style="font-weight: 700; color: #14532d;">
        💡 准备就绪：边权升序构造 2n-1 二叉树，LCA 点权严格对应两点路径瓶颈！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：原图与重构树 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="kruskal-tree-canvas" width="460" height="230" style="width: 460px; height: 230px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          左侧为原图拓扑 | 右侧为 Kruskal 重构树（绿色节点为虚父节点，标注权值 w；蓝色节点为原图叶子）
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="ktree-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'kruskal-reconstruction-tree',
  name: 'Kruskal 重构树 (Kruskal Tree)',
  viewId: 'algo-kruskal-reconstruction-tree-view',
  category: 'graph',
  description: '进阶图论与树上倍增算法：左程云 Kruskal 重构树、边权升序新建虚点、2n-1 二叉树性质与 LCA 快速求路径瓶颈距离',
  icon: '🌲',
  template: KRUSKAL_TREE_TEMPLATE,
  Visualizer: KruskalReconstructionTreeVisualizer,
  difficulty: 3,
  levelOrder: 39,
  learningGoal: '掌握 Kruskal 重构树的虚点构造方法、点权堆性质以及 LCA 节点点权等价于原图路径最大边权最小值的数学证明',
});
