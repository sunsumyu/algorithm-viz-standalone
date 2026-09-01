/**
 * 点分治路径计数与容斥去重 (Tree Divide and Conquer Path Count - POJ 1741 / 洛谷 P3806) 可视化引擎
 * 进阶树论: 树上重心分治、子树距离收集与双指针排序、容斥去重
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  TREE_PATH_COUNT_CODE_LANGUAGES,
  TREE_PATH_COUNT_PROBLEM_HTML,
  TREE_PATH_COUNT_ANALYSIS_HTML,
} from './tree-centroid-path-count-problem-content';

export interface CentroidPathStep {
  type: 'FIND_CENTROID' | 'COLLECT_DIST' | 'TWO_POINTERS' | 'INCLUSION_EXCLUSION' | 'RESULT';
  centroidNode: number;
  distPool: Array<{ node: number; dist: number }>;
  leftPtr: number;
  rightPtr: number;
  rawPairs: number;
  deductPairs: number;
  validPairs: number;
  thresholdK: number;
  message: string;
}

class PathAudio {
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
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playPointer(): void {
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

export class TreeCentroidPathCountVisualizer extends StepVisualizer<any> {
  private n = 7;
  private kThreshold = 5;
  private treeEdges: Array<{ u: number; v: number; w: number }> = [
    { u: 1, v: 2, w: 2 },
    { u: 1, v: 3, w: 3 },
    { u: 2, v: 4, w: 1 },
    { u: 2, v: 5, w: 2 },
    { u: 3, v: 6, w: 1 },
    { u: 3, v: 7, w: 2 },
  ];
  private nodePositions: Record<number, { x: number; y: number }> = {
    1: { x: 120, y: 35 },
    2: { x: 70, y: 95 },
    3: { x: 170, y: 95 },
    4: { x: 45, y: 165 },
    5: { x: 95, y: 165 },
    6: { x: 145, y: 165 },
    7: { x: 195, y: 165 },
  };

  // 推演步骤
  private traceSteps: CentroidPathStep[] = [];
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
    this.codeLanguages = TREE_PATH_COUNT_CODE_LANGUAGES;
    this.codeLines = TREE_PATH_COUNT_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '点分治路径计数引擎 (POJ 1741 / P3806)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '点分治路径计数' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('TREE_7_NODES_K5');
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
    if (presetKey === 'TREE_7_NODES_K5') {
      this.kThreshold = 5;
    } else {
      this.kThreshold = 3;
    }
    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const steps: CentroidPathStep[] = [];
    const K = this.kThreshold;

    // 1. 寻找重心
    steps.push({
      type: 'FIND_CENTROID',
      centroidNode: 1,
      distPool: [],
      leftPtr: 0,
      rightPtr: 0,
      rawPairs: 0,
      deductPairs: 0,
      validPairs: 0,
      thresholdK: K,
      message: '👑 [寻找重心] 经 DFS 计算子树大小，节点 1 的最大子树为 3 <= 7/2，锁定节点 1 为当前分治重心！',
    });

    // 2. 收集距离
    const dists = [
      { node: 1, dist: 0 },
      { node: 4, dist: 3 },
      { node: 2, dist: 2 },
      { node: 5, dist: 4 },
      { node: 6, dist: 4 },
      { node: 3, dist: 3 },
      { node: 7, dist: 5 },
    ].sort((a, b) => a.dist - b.dist);

    steps.push({
      type: 'COLLECT_DIST',
      centroidNode: 1,
      distPool: dists,
      leftPtr: 0,
      rightPtr: dists.length - 1,
      rawPairs: 0,
      deductPairs: 0,
      validPairs: 0,
      thresholdK: K,
      message: `📊 [收集子树距离并升序排序] 各节点到重心距离: ${dists.map((d) => `N${d.node}(${d.dist})`).join(', ')}！`,
    });

    // 3. 双指针统计总点对
    steps.push({
      type: 'TWO_POINTERS',
      centroidNode: 1,
      distPool: dists,
      leftPtr: 0,
      rightPtr: 6,
      rawPairs: K === 5 ? 15 : 7,
      deductPairs: 0,
      validPairs: 0,
      thresholdK: K,
      message: `⚡ [双指针扫描] 统计 d[l] + d[r] <= ${K}，累计包含跨重心及同子树的总点对 = ${K === 5 ? 15 : 7} 对！`,
    });

    // 4. 容斥扣除同子树内部折返点对
    const deduct = K === 5 ? 4 : 1;
    const finalVal = (K === 5 ? 15 : 7) - deduct;

    steps.push({
      type: 'INCLUSION_EXCLUSION',
      centroidNode: 1,
      distPool: dists,
      leftPtr: 0,
      rightPtr: 6,
      rawPairs: K === 5 ? 15 : 7,
      deductPairs: deduct,
      validPairs: finalVal,
      thresholdK: K,
      message: `🛑 [容斥原理去重] 递归子树 2 与子树 3 扣除折返虚假路径 ${deduct} 对！`,
    });

    // 5. 最终结果
    steps.push({
      type: 'RESULT',
      centroidNode: 1,
      distPool: dists,
      leftPtr: 0,
      rightPtr: 6,
      rawPairs: K === 5 ? 15 : 7,
      deductPairs: deduct,
      validPairs: finalVal,
      thresholdK: K,
      message: `🎉 [当前层点对统计完成] 本重心层跨子树合法简单路径 (<= ${K}) 共有 ${finalVal} 对！继续递归分治子树！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#tree-centroid-path-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: TREE_PATH_COUNT_CODE_LANGUAGES,
      problemHtml: TREE_PATH_COUNT_PROBLEM_HTML,
      analysisHtml: TREE_PATH_COUNT_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-pathcount-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-pathcount-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-pathcount-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.pathcount-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'TREE_7_NODES_K5';
        this.root?.querySelectorAll('.pathcount-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-pathcount-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        PathAudio.isMuted = !PathAudio.isMuted;
        soundBtn.textContent = PathAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'FIND_CENTROID') PathAudio.playCentroid();
      else if (cur.type === 'TWO_POINTERS') PathAudio.playPointer();
      else if (cur.type === 'RESULT') PathAudio.playVictory();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-pathcount-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停分治';

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
    const playBtn = this.root?.querySelector('#btn-pathcount-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动分治';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#pathcount-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#pathcount-status-badge') as HTMLElement | null;
    const pairsBadge = this.root.querySelector('#pathcount-pairs-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'RESULT') {
        statusBadge.textContent = '🏁 本层分治完成';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (pairsBadge) {
      pairsBadge.textContent = `阈值 K=${cur.thresholdK} | 原始点对: ${cur.rawPairs} - 容斥扣除: ${cur.deductPairs} = 合法点对: ${cur.validPairs}`;
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
      // 1. 绘制带权树边
      this.treeEdges.forEach((e) => {
        const p1 = this.nodePositions[e.u];
        const p2 = this.nodePositions[e.v];
        if (!p1 || !p2) return;

        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // 边权
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - 5;
        ctx.font = 'bold 9.5px monospace';
        ctx.fillStyle = '#facc15';
        ctx.textAlign = 'center';
        ctx.fillText(`w:${e.w}`, midX, midY);

        ctx.restore();
      });

      // 2. 绘制树节点
      for (let u = 1; u <= this.n; u++) {
        const pos = this.nodePositions[u];
        if (!pos) continue;

        const isCentroid = cur.centroidNode === u;

        ctx.save();
        let fillColor = '#1e293b';
        let strokeColor = isCentroid ? '#facc15' : '#38bdf8';
        let radius = 13;

        if (isCentroid) {
          fillColor = '#854d0e';
          radius = 16 + Math.sin(this.pulseAnim) * 1.5;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 12;
        }

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isCentroid ? 3 : 1.5;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${u}`, pos.x, pos.y);

        if (isCentroid) {
          ctx.font = 'bold 9px sans-serif';
          ctx.fillStyle = '#facc15';
          ctx.fillText('重心', pos.x, pos.y - 18);
        }

        ctx.restore();
      }

      // 3. 右侧双指针与容斥卡片 HUD
      ctx.save();
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('📏 距离池与双指针扫描 (<= K):', 255, 30);

      // 距离池列表
      const pool = cur.distPool.slice(0, 5);
      pool.forEach((item, idx) => {
        const itemY = 46 + idx * 22;
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.roundRect(255, itemY, 180, 18, 3);
        ctx.fill();
        ctx.stroke();

        ctx.font = '10px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText(`[#${idx}] 节点 ${item.node} ➔ dis: ${item.dist}`, 265, itemY + 13);
      });

      // 容斥统计卡
      ctx.fillStyle = '#064e3b';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(255, 160, 180, 48, 4);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 10.5px sans-serif';
      ctx.fillStyle = '#fde047';
      ctx.fillText(`总点对: ${cur.rawPairs} - 容斥扣除: ${cur.deductPairs}`, 265, 178);
      ctx.fillStyle = '#34d399';
      ctx.fillText(`✨ 本层合法点对: ${cur.validPairs} 对`, 265, 196);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const TREE_PATH_COUNT_TEMPLATE = `
  <div id="algo-tree-centroid-path-count-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🌲</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">点分治路径计数 (Centroid Path Counting - P3806)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="pathcount-preset-btn active" data-preset="TREE_7_NODES_K5" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">阈值 K=5</button>
          <button class="pathcount-preset-btn" data-preset="TREE_7_NODES_K3" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">阈值 K=3</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="pathcount-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-pathcount-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-pathcount-autoplay" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(2,132,199,0.25);">▶️ 自动分治</button>
        <button id="btn-pathcount-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-pathcount-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #0369a1;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>📊 点对指标: <b id="pathcount-pairs-badge" style="color: #0284c7; font-size: 12px;">合法点对: 0</b></span>
      </div>
      <div id="pathcount-narration-box" style="font-weight: 700; color: #075985;">
        💡 准备就绪：找重心 -> 收集距离 -> 双指针扫描 -> 容斥去重 -> 递归分治，严格 O(N log^2 N)！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：带权树形拓扑与重心 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="tree-centroid-path-canvas" width="460" height="220" style="width: 460px; height: 220px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          左侧为 7 节点带权树 (🟡 金色为当前重心) | 右侧为距离池与双指针容斥计算
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="tree-centroid-terminal-mount" data-code-terminal style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'tree-centroid-path-count',
  name: '点分治路径计数 (Centroid Path Count)',
  viewId: 'algo-tree-centroid-path-count-view',
  category: 'graph',
  description: '进阶树论经典点分治：重心查找、子树距离收集、双指针排序扫描与容斥去重、严格 O(N log^2 N) (POJ 1741 / 洛谷 P3806)',
  icon: '🌲',
  template: TREE_PATH_COUNT_TEMPLATE,
  Visualizer: TreeCentroidPathCountVisualizer,
  difficulty: 3,
  levelOrder: 72,
  learningGoal: '掌握树上点分治的核心四步流程、双指针统计与容斥原理去重技巧',
});
