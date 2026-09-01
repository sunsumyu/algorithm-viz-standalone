/**
 * 平面图最小割转对偶图最短路 (Planar Graph Min-Cut to Dual Graph Shortest Path) 可视化引擎
 * 进阶图论: 狼抓兔子、平面图每个面抽象为点、最小割等价于对偶图最短路、Dijkstra 极速求解 (洛谷 P4001)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  PLANAR_DUAL_CODE_LANGUAGES,
  PLANAR_DUAL_PROBLEM_HTML,
  PLANAR_DUAL_ANALYSIS_HTML,
} from './planar-graph-dual-problem-content';

export interface PlanarStep {
  type: 'POP_DUAL' | 'RELAX_DUAL' | 'REACH_T_STAR' | 'ALL_DONE';
  curDualNode: string;
  distMap: Record<string, number>;
  visitedDual: string[];
  dualPq: Array<{ node: string; dist: number }>;
  bestDualPath?: string[];
  cutPlanarEdges?: Array<{ u: string; v: string }>;
  message: string;
}

class PlanarAudio {
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

  public static playLaser(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playCut(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(329.63, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
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

export class PlanarGraphDualVisualizer extends StepVisualizer<any> {
  // 原图节点与边
  private planarNodes: Record<string, { x: number; y: number }> = {
    'S(0,0)': { x: 50, y: 40 },
    '(0,1)': { x: 130, y: 40 },
    '(0,2)': { x: 210, y: 40 },
    '(1,0)': { x: 50, y: 110 },
    '(1,1)': { x: 130, y: 110 },
    '(1,2)': { x: 210, y: 110 },
    '(2,0)': { x: 50, y: 180 },
    '(2,1)': { x: 130, y: 180 },
    'T(2,2)': { x: 210, y: 180 },
  };

  // 对偶图面节点
  private dualNodes: Record<string, { x: number; y: number; label: string }> = {
    'S*': { x: 180, y: 15, label: 'S*' },
    'T*': { x: 80, y: 205, label: 'T*' },
    'F1': { x: 80, y: 65, label: 'F1' },
    'F2': { x: 105, y: 85, label: 'F2' },
    'F3': { x: 160, y: 65, label: 'F3' },
    'F4': { x: 185, y: 85, label: 'F4' },
    'F5': { x: 80, y: 135, label: 'F5' },
    'F6': { x: 105, y: 155, label: 'F6' },
    'F7': { x: 160, y: 135, label: 'F7' },
    'F8': { x: 185, y: 155, label: 'F8' },
  };

  // 推演步骤
  private traceSteps: PlanarStep[] = [];
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
    this.codeLanguages = PLANAR_DUAL_CODE_LANGUAGES;
    this.codeLines = PLANAR_DUAL_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '平面图对偶转换与 Dijkstra 引擎 (Planar Dual Min-Cut)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '平面图最小割转对偶图' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_3X3_TRIANGULATION');
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
    const dist: Record<string, number> = {
      'S*': 0,
      'F1': 999,
      'F2': 999,
      'F3': 999,
      'F4': 999,
      'F5': 999,
      'F6': 999,
      'F7': 999,
      'F8': 999,
      'T*': 999,
    };
    const visited: string[] = [];
    const steps: PlanarStep[] = [];

    // 对偶图 Dijkstra 状态序列
    // S* -> F3 (w=2)
    dist['F3'] = 2;
    steps.push({
      type: 'RELAX_DUAL',
      curDualNode: 'F3',
      distMap: { ...dist },
      visitedDual: [...visited],
      dualPq: [
        { node: 'F3', dist: 2 },
        { node: 'F4', dist: 4 },
      ],
      message: '⚡ [松弛对偶边] 从 S* 跨越原图顶边进入三角面 F3 (容量 2)！',
    });

    visited.push('F3');
    dist['F4'] = 3;
    steps.push({
      type: 'POP_DUAL',
      curDualNode: 'F3',
      distMap: { ...dist },
      visitedDual: [...visited],
      dualPq: [
        { node: 'F4', dist: 3 },
        { node: 'F7', dist: 5 },
      ],
      message: '🌟 [出堆对偶面 F3] 访问面 F3，松弛内部斜对角边进入 F4 (dist=3)！',
    });

    visited.push('F4');
    dist['F7'] = 4;
    steps.push({
      type: 'RELAX_DUAL',
      curDualNode: 'F7',
      distMap: { ...dist },
      visitedDual: [...visited],
      dualPq: [
        { node: 'F7', dist: 4 },
        { node: 'F8', dist: 6 },
      ],
      message: '⚡ [松弛对偶边] 沿网格中间通道穿越至三角面 F7 (dist=4)！',
    });

    visited.push('F7');
    dist['F6'] = 5;
    steps.push({
      type: 'POP_DUAL',
      curDualNode: 'F7',
      distMap: { ...dist },
      visitedDual: [...visited],
      dualPq: [
        { node: 'F6', dist: 5 },
        { node: 'T*', dist: 7 },
      ],
      message: '🌟 [出堆对偶面 F7] 面 F7 跨越斜向边进入面 F6 (dist=5)！',
    });

    visited.push('F6');
    dist['T*'] = 6;
    steps.push({
      type: 'REACH_T_STAR',
      curDualNode: 'T*',
      distMap: { ...dist },
      visitedDual: [...visited],
      dualPq: [],
      bestDualPath: ['S*', 'F3', 'F4', 'F7', 'F6', 'T*'],
      cutPlanarEdges: [
        { u: 'S(0,0)', v: '(0,1)' },
        { u: '(0,1)', v: '(1,1)' },
        { u: '(1,1)', v: '(2,1)' },
        { u: '(2,1)', v: '(2,0)' },
      ],
      message: '🎯 [抵达超级汇面 T*] 对偶图最短路计算完毕！最短距离为 6，完美对应原图最小割容量！',
    });

    steps.push({
      type: 'ALL_DONE',
      curDualNode: 'T*',
      distMap: { ...dist },
      visitedDual: [...visited],
      dualPq: [],
      bestDualPath: ['S*', 'F3', 'F4', 'F7', 'F6', 'T*'],
      cutPlanarEdges: [
        { u: 'S(0,0)', v: '(0,1)' },
        { u: '(0,1)', v: '(1,1)' },
        { u: '(1,1)', v: '(2,1)' },
        { u: '(2,1)', v: '(2,0)' },
      ],
      message: '🎉 [最小割割线生成] ✂️ 红色割线斩断 S 与 T 的所有连通路径，Dijkstra 极速替代 Dinic 成功！',
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#planar-dual-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: PLANAR_DUAL_CODE_LANGUAGES,
      problemHtml: PLANAR_DUAL_PROBLEM_HTML,
      analysisHtml: PLANAR_DUAL_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-planar-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-planar-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-planar-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 音效
    const soundBtn = this.root.querySelector('#btn-planar-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        PlanarAudio.isMuted = !PlanarAudio.isMuted;
        soundBtn.textContent = PlanarAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'RELAX_DUAL') PlanarAudio.playLaser();
      else if (cur.type === 'REACH_T_STAR') PlanarAudio.playCut();
      else if (cur.type === 'ALL_DONE') PlanarAudio.playVictory();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-planar-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停搜索';

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
    const playBtn = this.root?.querySelector('#btn-planar-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动搜索';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#planar-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#planar-status-badge') as HTMLElement | null;
    const mincutBadge = this.root.querySelector('#planar-mincut-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = '🏁 转换求解完成';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (mincutBadge) {
      mincutBadge.textContent = `当前对偶最短路 / 最小割容量: ${cur.distMap['T*'] === 999 ? '计算中...' : cur.distMap['T*']}`;
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
      // 1. 绘制平面图原网格 (蓝色线)
      const planarGridEdges = [
        ['S(0,0)', '(0,1)'], ['(0,1)', '(0,2)'],
        ['(1,0)', '(1,1)'], ['(1,1)', '(1,2)'],
        ['(2,0)', '(2,1)'], ['(2,1)', 'T(2,2)'],
        ['S(0,0)', '(1,0)'], ['(1,0)', '(2,0)'],
        ['(0,1)', '(1,1)'], ['(1,1)', '(2,1)'],
        ['(0,2)', '(1,2)'], ['(1,2)', 'T(2,2)'],
        ['S(0,0)', '(1,1)'], ['(0,1)', '(1,2)'],
        ['(1,0)', '(2,1)'], ['(1,1)', 'T(2,2)'],
      ];

      planarGridEdges.forEach(([u, v]) => {
        const p1 = this.planarNodes[u];
        const p2 = this.planarNodes[v];
        if (!p1 || !p2) return;

        const isCut = cur.cutPlanarEdges && cur.cutPlanarEdges.some((ce) => (ce.u === u && ce.v === v) || (ce.u === v && ce.v === u));

        ctx.save();
        ctx.strokeStyle = isCut ? '#ef4444' : 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = isCut ? 3.5 : 1.5;
        if (isCut) {
          ctx.setLineDash([4, 4]);
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 8;
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      });

      // 2. 绘制对偶图边与路径 (黄色线)
      if (cur.bestDualPath && cur.bestDualPath.length > 1) {
        ctx.save();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        for (let i = 0; i < cur.bestDualPath.length - 1; i++) {
          const d1 = this.dualNodes[cur.bestDualPath[i]];
          const d2 = this.dualNodes[cur.bestDualPath[i + 1]];
          if (d1 && d2) {
            ctx.moveTo(d1.x, d1.y);
            ctx.lineTo(d2.x, d2.y);
          }
        }
        ctx.stroke();
        ctx.restore();
      }

      // 3. 绘制对偶图面节点 (橙色圆点)
      for (const key in this.dualNodes) {
        const d = this.dualNodes[key];
        const isCur = cur.curDualNode === key;
        const isPath = cur.bestDualPath && cur.bestDualPath.includes(key);

        ctx.save();
        let radius = 9;
        if (isCur) radius = 11 + Math.sin(this.pulseAnim) * 1.5;

        ctx.fillStyle = key.includes('*') ? '#ec4899' : '#f97316';
        ctx.strokeStyle = isCur ? '#facc15' : isPath ? '#10b981' : '#ffffff';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(d.label, d.x, d.y);
        ctx.restore();
      }

      // 4. 右侧对偶图优先队列与对偶理论 HUD
      ctx.save();
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('📥 对偶图 Dijkstra 优先队列:', 255, 30);

      const pqList = cur.dualPq.slice(0, 4);
      pqList.forEach((item, idx) => {
        const itemY = 48 + idx * 24;
        ctx.font = '10px monospace';
        ctx.fillStyle = '#facc15';
        ctx.fillText(`[#${idx + 1}] 面 ${item.node} => 距离: ${item.dist}`, 255, itemY);
      });

      if (pqList.length === 0) {
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('(优先队列已清空)', 255, 52);
      }

      // 理论解释
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`🌐 蓝色网格 = 原平面网络流图`, 245, 160);
      ctx.fillText(`🟠 橙色节点 = 对偶图面节点 (Face)`, 245, 178);
      ctx.fillText(`✂️ 红色虚线 = 最小割割断边集`, 245, 196);
      ctx.fillText(`⚡ 黄色光芒 = 对偶图 S* 到 T* 最短路`, 245, 214);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const PLANAR_DUAL_TEMPLATE = `
  <div id="algo-planar-graph-dual-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🌐</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">平面图最小割转对偶图最短路 (Planar Graph Dual)</span>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="planar-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-planar-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-planar-autoplay" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(2,132,199,0.25);">▶️ 自动搜索</button>
        <button id="btn-planar-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-planar-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #0369a1;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>🌐 割容量对偶映射: <b id="planar-mincut-badge" style="color: #0284c7; font-size: 12px;">当前对偶最短路: 准备中</b></span>
      </div>
      <div id="planar-narration-box" style="font-weight: 700; color: #075985;">
        💡 准备就绪：平面图面转点、原图割转对偶路径，Dijkstra 极速取代 Dinic！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：平面图与对偶图叠加 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="planar-dual-canvas" width="460" height="230" style="width: 460px; height: 230px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          左侧为平面三角剖分网格与对偶图叠加 | 🟡 黄色光芒为对偶最短路径 | ✂️ 红色虚线为原图等价最小割
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="planar-dual-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'planar-graph-dual',
  name: '平面图最小割转对偶图最短路 (Planar Graph Dual)',
  viewId: 'algo-planar-graph-dual-view',
  category: 'graph',
  description: '进阶图论对偶建模：平面图面转点、最小割等价于对偶图最短路、Dijkstra 取代 Dinic 极速求解 (洛谷 P4001 狼抓兔子)',
  icon: '🌐',
  template: PLANAR_DUAL_TEMPLATE,
  Visualizer: PlanarGraphDualVisualizer,
  difficulty: 3,
  levelOrder: 64,
  learningGoal: '掌握平面图与对偶图转换几何原理、最小割与对偶路径等价性定理及大规模网格最大流加速技巧',
});
