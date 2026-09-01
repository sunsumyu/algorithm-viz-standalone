/**
 * 树上差分与子树前缀和 (Tree Difference Array) 可视化引擎
 * 进阶图论: 点差分 (diff[u]++, diff[v]++, diff[lca]--, diff[fa[lca]]--)、边差分 (diff[lca]-=2)、自底向上 DFS 前缀和 (洛谷 P3128 / P3258)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  TREE_DIFF_CODE_LANGUAGES,
  TREE_DIFF_PROBLEM_HTML,
  TREE_DIFF_ANALYSIS_HTML,
} from './tree-difference-problem-content';

export interface TreeDiffStep {
  type: 'INIT' | 'ADD_TAGS' | 'DFS_SUM' | 'ALL_DONE';
  diffSnapshot: number[];
  valSnapshot: number[];
  curNode?: number;
  highlightPath?: { u: number; v: number; lca: number; faLca?: number };
  maxNode?: number;
  message: string;
}

class TreeDiffAudio {
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

  public static playTag(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playAccumulate(): void {
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

export class TreeDifferenceVisualizer extends StepVisualizer<any> {
  // 树结构与节点坐标 (1-indexed)
  private n = 7;
  private treeEdges: Array<{ u: number; v: number }> = [];
  private nodePositions: Array<{ x: number; y: number }> = [];
  private parents: number[] = [];

  // 推演步骤
  private traceSteps: TreeDiffStep[] = [];
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
    this.codeLanguages = TREE_DIFF_CODE_LANGUAGES;
    this.codeLines = TREE_DIFF_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '树上差分统计引擎 (Tree Difference)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '树上差分' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('NODE_DIFF_MAX_FLOW');
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

    this.n = 7;
    this.treeEdges = [
      { u: 1, v: 2 },
      { u: 1, v: 3 },
      { u: 2, v: 4 },
      { u: 2, v: 5 },
      { u: 3, v: 6 },
      { u: 3, v: 7 },
    ];
    this.parents = [0, 0, 1, 1, 2, 2, 3, 3];
    this.nodePositions = [
      { x: 0, y: 0 },
      { x: 230, y: 35 },  // 1 (根)
      { x: 130, y: 95 },  // 2
      { x: 330, y: 95 },  // 3
      { x: 80, y: 165 },  // 4
      { x: 180, y: 165 }, // 5
      { x: 280, y: 165 }, // 6
      { x: 380, y: 165 }, // 7
    ];

    this.computeTraceSteps(presetKey);
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(mode: string): void {
    const n = this.n;
    const diff = Array(n + 1).fill(0);
    const val = Array(n + 1).fill(0);

    const steps: TreeDiffStep[] = [];
    const cloneD = () => [...diff];
    const cloneV = () => [...val];

    steps.push({
      type: 'INIT',
      diffSnapshot: cloneD(),
      valSnapshot: cloneV(),
      message: `🚀 初始化树上差分系统：全树 7 个节点差分标记 diff[] 与权值 val[] 均为 0。`,
    });

    if (mode === 'NODE_DIFF_MAX_FLOW') {
      // 路径 1: 4 -> 5 (lca: 2, faLca: 1)
      diff[4] += 1;
      diff[5] += 1;
      diff[2] -= 1;
      diff[1] -= 1;
      steps.push({
        type: 'ADD_TAGS',
        diffSnapshot: cloneD(),
        valSnapshot: cloneV(),
        highlightPath: { u: 4, v: 5, lca: 2, faLca: 1 },
        message: `📍 [点差分修改 1] 路径 4 -> 5 全体点权 +1：diff[4]+=1, diff[5]+=1, diff[lca=2]-=1, diff[fa=1]-=1。`,
      });

      // 路径 2: 4 -> 6 (lca: 1, faLca: 0)
      diff[4] += 1;
      diff[6] += 1;
      diff[1] -= 1;
      steps.push({
        type: 'ADD_TAGS',
        diffSnapshot: cloneD(),
        valSnapshot: cloneV(),
        highlightPath: { u: 4, v: 6, lca: 1 },
        message: `📍 [点差分修改 2] 路径 4 -> 6 全体点权 +1：diff[4]+=1, diff[6]+=1, diff[lca=1]-=1。`,
      });
    } else {
      // 边差分：路径 4 -> 6 (lca: 1)
      diff[4] += 1;
      diff[6] += 1;
      diff[1] -= 2;
      steps.push({
        type: 'ADD_TAGS',
        diffSnapshot: cloneD(),
        valSnapshot: cloneV(),
        highlightPath: { u: 4, v: 6, lca: 1 },
        message: `📍 [边差分修改] 路径 4 -> 6 全体边权 +1 (下放给子节点)：diff[4]+=1, diff[6]+=1, diff[lca=1]-=2。`,
      });
    }

    // 自底向上 DFS 前缀和
    const adj: number[][] = Array.from({ length: n + 1 }, () => []);
    this.treeEdges.forEach((e) => {
      adj[e.u].push(e.v);
      adj[e.v].push(e.u);
    });

    const dfs = (u: number, p: number) => {
      val[u] = diff[u];
      for (const v of adj[u]) {
        if (v !== p) {
          dfs(v, u);
          val[u] += val[v];
        }
      }
      steps.push({
        type: 'DFS_SUM',
        curNode: u,
        diffSnapshot: cloneD(),
        valSnapshot: cloneV(),
        message: `🔄 [DFS 自底向上汇总] 节点 ${u} 计算子树和：val[${u}] = diff[${u}] + sum(son) = ${val[u]}！`,
      });
    };

    dfs(1, 0);

    let maxNode = 1;
    for (let i = 1; i <= n; i++) {
      if (val[i] > val[maxNode]) maxNode = i;
    }

    steps.push({
      type: 'ALL_DONE',
      maxNode: maxNode,
      diffSnapshot: cloneD(),
      valSnapshot: cloneV(),
      message: `🏁 [汇总完成] 全树前缀和统计就绪！最大点权/流量集中在节点 ${maxNode} (权值 = ${val[maxNode]})！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#treediff-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: TREE_DIFF_CODE_LANGUAGES,
      problemHtml: TREE_DIFF_PROBLEM_HTML,
      analysisHtml: TREE_DIFF_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-treediff-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-treediff-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-treediff-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.treediff-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'NODE_DIFF_MAX_FLOW';
        this.root?.querySelectorAll('.treediff-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-treediff-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        TreeDiffAudio.isMuted = !TreeDiffAudio.isMuted;
        soundBtn.textContent = TreeDiffAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'ADD_TAGS') TreeDiffAudio.playTag();
      else if (cur.type === 'DFS_SUM') TreeDiffAudio.playAccumulate();
      else if (cur.type === 'ALL_DONE') TreeDiffAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-treediff-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停汇总';

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
    const playBtn = this.root?.querySelector('#btn-treediff-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动汇总';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#treediff-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#treediff-status-badge') as HTMLElement | null;
    const maxBadge = this.root.querySelector('#treediff-max-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = '🏁 全树差分前缀和完成';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (maxBadge) {
      if (cur.maxNode) {
        maxBadge.textContent = `节点 ${cur.maxNode} (权值 ${cur.valSnapshot[cur.maxNode]})`;
      } else {
        maxBadge.textContent = '汇总中...';
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

    // 1. 绘制树边
    this.treeEdges.forEach((e) => {
      const p1 = this.nodePositions[e.u];
      const p2 = this.nodePositions[e.v];
      if (!p1 || !p2) return;

      ctx.save();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
    });

    // 2. 绘制节点与差分/权值标记
    for (let i = 1; i <= this.n; i++) {
      const pos = this.nodePositions[i];
      if (!pos) continue;

      const isCur = cur && cur.curNode === i;
      const isMax = cur && cur.maxNode === i;
      const diffVal = cur ? cur.diffSnapshot[i] : 0;
      const finalVal = cur ? cur.valSnapshot[i] : 0;

      ctx.save();
      let fillColor = '#1e293b';
      let strokeColor = '#38bdf8';
      let radius = 16;

      if (isCur) {
        strokeColor = '#facc15';
        fillColor = '#854d0e';
        radius = 18 + Math.sin(this.pulseAnim) * 1.5;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
      } else if (isMax) {
        strokeColor = '#22c55e';
        fillColor = '#14532d';
        radius = 18;
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 14;
      }

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 节点编号
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${i}`, pos.x, pos.y - 3);

      // 差分标签 & 汇总值
      ctx.font = '9px monospace';
      if (finalVal > 0) {
        ctx.fillStyle = '#4ade80';
        ctx.fillText(`val:${finalVal}`, pos.x, pos.y + 8);
      } else {
        const diffText = diffVal > 0 ? `+${diffVal}` : `${diffVal}`;
        ctx.fillStyle = diffVal !== 0 ? '#facc15' : '#64748b';
        ctx.fillText(`d:${diffText}`, pos.x, pos.y + 8);
      }

      ctx.restore();
    }

    ctx.restore();
  }
}

export const TREE_DIFF_TEMPLATE = `
  <div id="algo-tree-difference-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🌲</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">树上差分与子树前缀和 (Tree Difference)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="treediff-preset-btn active" data-preset="NODE_DIFF_MAX_FLOW" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">点差分：多路径叠加</button>
          <button class="treediff-preset-btn" data-preset="EDGE_DIFF_TRAFFIC" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">边差分：边权下放</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="treediff-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-treediff-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-treediff-autoplay" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(16,185,129,0.25);">▶️ 自动汇总</button>
        <button id="btn-treediff-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-treediff-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #166534;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>🏆 最大权值节点: <b id="treediff-max-badge" style="color: #059669; font-size: 12px;">汇总中...</b></span>
      </div>
      <div id="treediff-narration-box" style="font-weight: 700; color: #14532d;">
        💡 准备就绪：打上 LCA 点/边差分标记，自底向上 DFS 一次性汇总！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：树形 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="treediff-canvas" width="460" height="200" style="width: 460px; height: 200px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🟡 d: 差分标记值 | 🟢 val: 自底向上汇聚后的最终权值 | 🌟 绿色高亮为最大值节点
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="treediff-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'tree-difference',
  name: '树上差分 (Tree Difference)',
  viewId: 'algo-tree-difference-view',
  category: 'graph',
  description: '进阶树论高效区间更新算法：点差分 (diff[u]++, diff[v]++, diff[lca]--, diff[fa[lca]]--)、边差分与自底向上 DFS 子树前缀和汇总 (洛谷 P3128 / P3258)',
  icon: '🌲',
  template: TREE_DIFF_TEMPLATE,
  Visualizer: TreeDifferenceVisualizer,
  difficulty: 3,
  levelOrder: 50,
  learningGoal: '掌握树上点差分与边差分数学公式、LCA 边界截断消除向上扩散效应与 O(n) 自底向上前缀和汇总原理',
});
