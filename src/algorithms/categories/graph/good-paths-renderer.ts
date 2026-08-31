/**
 * 好路径数目与点权升序并查集 (Number of Good Paths) 可视化引擎
 * 参考左程云《算法通关课》【必备篇】class057: 点权升序加边、并查集最大权维护与组合数累加 (LeetCode 2421)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  GOOD_PATHS_CODE_LANGUAGES,
  GOOD_PATHS_PROBLEM_HTML,
  GOOD_PATHS_ANALYSIS_HTML,
} from './good-paths-problem-content';

export interface GoodPathEdge {
  u: number;
  v: number;
  maxVal: number;
}

export interface GoodPathsStep {
  type: 'INIT' | 'ACTIVATE_EDGE' | 'GOOD_PATH_FOUND' | 'UNION_ASYMMETRIC' | 'ALL_DONE';
  curEdge?: [number, number];
  curMaxWeight?: number;
  activeEdgeIndices: number[];
  parentSnapshot: number[];
  countSnapshot: number[];
  matchedNodePairs?: Array<[number, number]>;
  addedPaths: number;
  totalGoodPaths: number;
  message: string;
}

class GoodPathsAudio {
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

  public static playGoodPath(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const notes = [659.25, 880, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.14, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.18);
      });
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

export class GoodPathsVisualizer extends StepVisualizer<any> {
  // 树数据
  private vals: number[] = [1, 3, 2, 1, 3];
  private rawEdges: Array<[number, number]> = [[0, 1], [0, 2], [2, 3], [2, 4]];
  private nodePositions: Array<{ x: number; y: number }> = [];

  // 推演步骤
  private traceSteps: GoodPathsStep[] = [];
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
    this.codeLanguages = GOOD_PATHS_CODE_LANGUAGES;
    this.codeLines = GOOD_PATHS_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '好路径点权升序并查集引擎 (LeetCode 2421)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '好路径数目' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_TREE');
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

    if (presetKey === 'CLASSIC_TREE') {
      this.vals = [1, 3, 2, 1, 3];
      this.rawEdges = [[0, 1], [0, 2], [2, 3], [2, 4]];
      this.nodePositions = [
        { x: 160, y: 80 },  // 0 (val: 1)
        { x: 80, y: 160 },  // 1 (val: 3)
        { x: 260, y: 80 },  // 2 (val: 2)
        { x: 220, y: 160 }, // 3 (val: 1)
        { x: 340, y: 160 }, // 4 (val: 3)
      ];
    } else if (presetKey === 'STAR_CLUSTER') {
      this.vals = [1, 1, 2, 2, 3];
      this.rawEdges = [[0, 2], [1, 2], [2, 4], [3, 4]];
      this.nodePositions = [
        { x: 90, y: 60 },
        { x: 90, y: 170 },
        { x: 200, y: 115 },
        { x: 310, y: 60 },
        { x: 350, y: 150 },
      ];
    } else if (presetKey === 'UNIFORM_VALUES') {
      this.vals = [2, 2, 2, 2];
      this.rawEdges = [[0, 1], [1, 2], [2, 3]];
      this.nodePositions = [
        { x: 90, y: 115 },
        { x: 180, y: 115 },
        { x: 270, y: 115 },
        { x: 360, y: 115 },
      ];
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const n = this.vals.length;
    const parent: number[] = Array.from({ length: n }, (_, i) => i);
    const count: number[] = Array(n).fill(1);
    const currentVal: number[] = [...this.vals];

    const sortedEdges: GoodPathEdge[] = this.rawEdges.map(([u, v]) => ({
      u,
      v,
      maxVal: Math.max(this.vals[u], this.vals[v]),
    })).sort((a, b) => a.maxVal - b.maxVal);

    const find = (i: number): number => {
      if (parent[i] !== i) parent[i] = find(parent[i]);
      return parent[i];
    };

    let totalGoodPaths = n;
    const activeEdgeIndices: number[] = [];
    const steps: GoodPathsStep[] = [];

    const cloneParent = () => [...parent];
    const cloneCount = () => [...count];

    steps.push({
      type: 'INIT',
      activeEdgeIndices: [],
      parentSnapshot: cloneParent(),
      countSnapshot: cloneCount(),
      addedPaths: 0,
      totalGoodPaths: n,
      message: `🚀 初始化：${n} 个单节点自身各贡献 1 条好路径（基础答案 = ${n}）。边按 max(val[u], val[v]) 升序排序。`,
    });

    sortedEdges.forEach((edge, idx) => {
      activeEdgeIndices.push(idx);
      const fu = find(edge.u);
      const fv = find(edge.v);

      if (currentVal[fu] === currentVal[fv]) {
        const added = count[fu] * count[fv];
        totalGoodPaths += added;
        parent[fv] = fu;
        count[fu] += count[fv];

        steps.push({
          type: 'GOOD_PATH_FOUND',
          curEdge: [edge.u, edge.v],
          curMaxWeight: edge.maxVal,
          activeEdgeIndices: [...activeEdgeIndices],
          parentSnapshot: cloneParent(),
          countSnapshot: cloneCount(),
          matchedNodePairs: [[edge.u, edge.v]],
          addedPaths: added,
          totalGoodPaths,
          message: `🎉 [发现好路径！] 边 (${edge.u} ↔ ${edge.v}) 连接两个最大点权同为 ${currentVal[fu]} 的集合！新增好路径 count[${fu}]×count[${fv}] = ${added} 条！`,
        });
      } else if (currentVal[fu] > currentVal[fv]) {
        parent[fv] = fu;
        steps.push({
          type: 'UNION_ASYMMETRIC',
          curEdge: [edge.u, edge.v],
          curMaxWeight: edge.maxVal,
          activeEdgeIndices: [...activeEdgeIndices],
          parentSnapshot: cloneParent(),
          countSnapshot: cloneCount(),
          addedPaths: 0,
          totalGoodPaths,
          message: `🔗 边 (${edge.u} ↔ ${edge.v})：集合最大点权不同 (${currentVal[fu]} > ${currentVal[fv]})，点权小者向大者合并，不产生同权好路径。`,
        });
      } else {
        parent[fu] = fv;
        steps.push({
          type: 'UNION_ASYMMETRIC',
          curEdge: [edge.u, edge.v],
          curMaxWeight: edge.maxVal,
          activeEdgeIndices: [...activeEdgeIndices],
          parentSnapshot: cloneParent(),
          countSnapshot: cloneCount(),
          addedPaths: 0,
          totalGoodPaths,
          message: `🔗 边 (${edge.u} ↔ ${edge.v})：集合最大点权不同 (${currentVal[fv]} > ${currentVal[fu]})，点权小者向大者合并，不产生同权好路径。`,
        });
      }
    });

    steps.push({
      type: 'ALL_DONE',
      activeEdgeIndices: [...activeEdgeIndices],
      parentSnapshot: cloneParent(),
      countSnapshot: cloneCount(),
      addedPaths: 0,
      totalGoodPaths,
      message: `🏁 全树加边完成！最终累计好路径总数：${totalGoodPaths} 条！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#good-paths-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: GOOD_PATHS_CODE_LANGUAGES,
      problemHtml: GOOD_PATHS_PROBLEM_HTML,
      analysisHtml: GOOD_PATHS_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-good-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-good-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-good-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.good-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_TREE';
        this.root?.querySelectorAll('.good-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-good-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        GoodPathsAudio.isMuted = !GoodPathsAudio.isMuted;
        soundBtn.textContent = GoodPathsAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'GOOD_PATH_FOUND') GoodPathsAudio.playGoodPath();
      else if (cur.type === 'UNION_ASYMMETRIC') GoodPathsAudio.playEdge();
      else if (cur.type === 'ALL_DONE') GoodPathsAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-good-autoplay') as HTMLButtonElement | null;
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
    const playBtn = this.root?.querySelector('#btn-good-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动推演';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#good-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#good-status-badge') as HTMLElement | null;
    const totalCountBadge = this.root.querySelector('#good-total-count') as HTMLElement | null;
    const addedBadge = this.root.querySelector('#good-added-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = `🎯 累计好路径: ${cur.totalGoodPaths} 条`;
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (totalCountBadge) {
      totalCountBadge.textContent = `${cur.totalGoodPaths} 条`;
    }

    if (addedBadge) {
      if (cur.addedPaths > 0) {
        addedBadge.innerHTML = `<span style="color: #eab308; font-weight: bold;">+${cur.addedPaths} (同权配对)</span>`;
      } else {
        addedBadge.innerHTML = '<span style="color: #94a3b8;">+0</span>';
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
    this.rawEdges.forEach(([u, v]) => {
      const p1 = this.nodePositions[u];
      const p2 = this.nodePositions[v];
      if (!p1 || !p2) return;

      const isCurrent = cur && cur.curEdge && ((cur.curEdge[0] === u && cur.curEdge[1] === v) || (cur.curEdge[0] === v && cur.curEdge[1] === u));

      ctx.save();
      if (isCurrent) {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
      } else {
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 2;
      }

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
    });

    // 2. 绘制节点
    for (let i = 0; i < this.vals.length; i++) {
      const pos = this.nodePositions[i];
      if (!pos) continue;

      const val = this.vals[i];
      const isCurrentEdgeNode = cur && cur.curEdge && (cur.curEdge[0] === i || cur.curEdge[1] === i);

      ctx.save();
      let radius = 20;
      let fillColor = '#1e293b';
      let strokeColor = '#64748b';

      if (isCurrentEdgeNode) {
        fillColor = '#ca8a04';
        strokeColor = '#facc15';
        radius = 23 + Math.sin(this.pulseAnim) * 2;
        ctx.shadowColor = '#facc15';
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

      // 标签
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`N${i}`, pos.x, pos.y - 3);

      // 点权
      ctx.font = '9px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`v:${val}`, pos.x, pos.y + 9);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const GOOD_PATHS_TEMPLATE = `
  <div id="algo-good-paths-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🛤️</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">好路径数目 (Number of Good Paths)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="good-preset-btn active" data-preset="CLASSIC_TREE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典测试树</button>
          <button class="good-preset-btn" data-preset="STAR_CLUSTER" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">星簇拓扑</button>
          <button class="good-preset-btn" data-preset="UNIFORM_VALUES" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">全等点权链</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="good-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-good-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步加边</button>
        <button id="btn-good-autoplay" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(245,158,11,0.25);">▶️ 自动加边</button>
        <button id="btn-good-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-good-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #fefce8; border: 1px solid #fef08a; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #854d0e;">
      <div style="display: flex; gap: 14px; align-items: center;">
        <span>🎯 好路径总数: <b id="good-total-count" style="color: #ca8a04; font-size: 12.5px;">5 条</b></span>
        <span id="good-added-badge"></span>
      </div>
      <div id="good-narration-box" style="font-weight: 700; color: #713f12;">
        💡 准备就绪：按边两端最大点权升序排序加边，同权集合合并触发好路径计数！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：树拓扑 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="good-paths-canvas" width="460" height="230" style="width: 460px; height: 230px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🔵 蓝色字为节点点权 (val) | 🟡 金色高亮为当前激活边与并查集并入节点
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="good-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'good-paths',
  name: '好路径数目 (Number of Good Paths)',
  viewId: 'algo-good-paths-view',
  category: 'graph',
  description: '点权升序并查集算法：左程云 class057 好路径数目 (LeetCode 2421)、边权排序、并查集同权分量合并与乘法原理计数',
  icon: '🛤️',
  template: GOOD_PATHS_TEMPLATE,
  Visualizer: GoodPathsVisualizer,
  difficulty: 3,
  levelOrder: 34,
  learningGoal: '掌握点权升序加边将“路径中间点不超过端点”转化为连通性保证的巧妙转换，以及并查集维护最大权节点频次',
});
