/**
 * 树上众数求和 (Tree Dominant Color - CF600E) 可视化引擎
 * 进阶树论: 树上启发式合并 DSU on Tree、动态维护最大频次 maxCnt 与众数和 sumColor
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  TREE_DOMINANT_CODE_LANGUAGES,
  TREE_DOMINANT_PROBLEM_HTML,
  TREE_DOMINANT_ANALYSIS_HTML,
} from './tree-dominant-color-problem-content';

export interface DominantStep {
  type: 'SOLVE_LIGHT' | 'SOLVE_HEAVY' | 'MERGE_NODE' | 'UPDATE_MAX' | 'RECORD_ANS';
  curNode: number;
  colorBucket: Record<number, number>;
  maxCnt: number;
  sumColor: number;
  ansMap: Record<number, number>;
  message: string;
}

class DominantAudio {
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

  public static playTick(): void {
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

  public static playMaxUp(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
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

export class TreeDominantColorVisualizer extends StepVisualizer<any> {
  private n = 6;
  private nodeColors: Record<number, number> = {
    1: 1, // 红色
    2: 2, // 蓝色
    3: 1, // 红色
    4: 2, // 蓝色
    5: 3, // 绿色
    6: 3, // 绿色
  };
  private treeEdges: Array<{ u: number; v: number }> = [
    { u: 1, v: 2 },
    { u: 1, v: 3 },
    { u: 2, v: 4 },
    { u: 2, v: 5 },
    { u: 3, v: 6 },
  ];
  private nodePositions: Record<number, { x: number; y: number }> = {
    1: { x: 120, y: 35 },
    2: { x: 70, y: 95 },
    3: { x: 170, y: 95 },
    4: { x: 45, y: 165 },
    5: { x: 95, y: 165 },
    6: { x: 170, y: 165 },
  };

  // 推演步骤
  private traceSteps: DominantStep[] = [];
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
    this.codeLanguages = TREE_DOMINANT_CODE_LANGUAGES;
    this.codeLines = TREE_DOMINANT_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '树上众数 DSU on Tree 引擎 (CF600E)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '树上众数求和' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('TREE_CF600E_6_NODES');
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
    const steps: DominantStep[] = [];

    // 1. 递归处理轻儿子子树
    steps.push({
      type: 'SOLVE_LIGHT',
      curNode: 3,
      colorBucket: { 1: 0, 2: 0, 3: 0 },
      maxCnt: 0,
      sumColor: 0,
      ansMap: {},
      message: '🌲 [DSU on Tree] 递归轻儿子 3 求解完毕并清空桶 (keep=false)，ans[3] = 1 + 3 = 4！',
    });

    // 2. 递归处理重儿子子树 2 并保留信息 (keep=true)
    steps.push({
      type: 'SOLVE_HEAVY',
      curNode: 2,
      colorBucket: { 1: 0, 2: 2, 3: 1 },
      maxCnt: 2,
      sumColor: 2,
      ansMap: { 2: 2, 4: 2, 5: 3, 3: 4, 6: 3 },
      message: '👑 [保留重儿子] 重儿子 2 拥有最大子树 (sz=3)，求解后保留计数桶 (keep=true)，maxCnt=2, sumColor=2！',
    });

    // 3. 将根节点 1 加入桶
    steps.push({
      type: 'MERGE_NODE',
      curNode: 1,
      colorBucket: { 1: 1, 2: 2, 3: 1 },
      maxCnt: 2,
      sumColor: 2,
      ansMap: { 2: 2, 4: 2, 5: 3, 3: 4, 6: 3 },
      message: '➕ [合并根节点] 将根节点 1 (颜色 1 - 红色) 计入桶，cnt[1]=1！',
    });

    // 4. 将轻子树 3 重新合并进入桶
    steps.push({
      type: 'MERGE_NODE',
      curNode: 3,
      colorBucket: { 1: 2, 2: 2, 3: 2 },
      maxCnt: 2,
      sumColor: 6,
      ansMap: { 2: 2, 4: 2, 5: 3, 3: 4, 6: 3 },
      message: '⚡ [合并轻子树] 遍历轻儿子 3 及其子树，颜色 1 频次升至 2，颜色 3 频次升至 2！',
    });

    // 5. 最终记录根节点 1 的答案
    steps.push({
      type: 'RECORD_ANS',
      curNode: 1,
      colorBucket: { 1: 2, 2: 2, 3: 2 },
      maxCnt: 2,
      sumColor: 6,
      ansMap: { 1: 6, 2: 2, 3: 4, 4: 2, 5: 3, 6: 3 },
      message: '🎉 [整树众数和求解完毕] 颜色 1、2、3 均达到最大频次 2，ans[1] = 1 + 2 + 3 = 6！',
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#tree-dominant-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: TREE_DOMINANT_CODE_LANGUAGES,
      problemHtml: TREE_DOMINANT_PROBLEM_HTML,
      analysisHtml: TREE_DOMINANT_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-dominant-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-dominant-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-dominant-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 音效
    const soundBtn = this.root.querySelector('#btn-dominant-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        DominantAudio.isMuted = !DominantAudio.isMuted;
        soundBtn.textContent = DominantAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'SOLVE_HEAVY' || cur.type === 'MERGE_NODE') DominantAudio.playTick();
      else if (cur.type === 'RECORD_ANS') DominantAudio.playVictory();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-dominant-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停合并';

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
    const playBtn = this.root?.querySelector('#btn-dominant-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动合并';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#dominant-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#dominant-status-badge') as HTMLElement | null;
    const maxBadge = this.root.querySelector('#dominant-max-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'RECORD_ANS') {
        statusBadge.textContent = '🏁 全树求解完毕';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (maxBadge) {
      maxBadge.textContent = `最大频次 maxCnt: ${cur.maxCnt} | 众数和 sumColor: ${cur.sumColor}`;
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
      // 1. 绘制树边
      this.treeEdges.forEach((e) => {
        const p1 = this.nodePositions[e.u];
        const p2 = this.nodePositions[e.v];
        if (!p1 || !p2) return;

        const isHeavyEdge = (e.u === 1 && e.v === 2) || (e.u === 2 && e.v === 4);

        ctx.save();
        ctx.strokeStyle = isHeavyEdge ? '#ec4899' : 'rgba(100, 116, 139, 0.4)';
        ctx.lineWidth = isHeavyEdge ? 3.5 : 1.5;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      });

      // 2. 绘制节点与颜色
      const colorMap: Record<number, string> = {
        1: '#ef4444', // 红
        2: '#3b82f6', // 蓝
        3: '#10b981', // 绿
      };

      for (let u = 1; u <= this.n; u++) {
        const pos = this.nodePositions[u];
        if (!pos) continue;

        const c = this.nodeColors[u];
        const isCur = cur.curNode === u;
        const colorHex = colorMap[c] || '#94a3b8';

        ctx.save();
        let radius = 13;
        if (isCur) {
          radius = 15 + Math.sin(this.pulseAnim) * 1.5;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 10;
        }

        ctx.fillStyle = colorHex;
        ctx.strokeStyle = isCur ? '#facc15' : '#ffffff';
        ctx.lineWidth = isCur ? 3 : 1.5;

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

        // 标注当前答案 ans[u]
        const ans = cur.ansMap[u];
        if (ans !== undefined) {
          ctx.font = '9px sans-serif';
          ctx.fillStyle = '#fde047';
          ctx.fillText(`ans=${ans}`, pos.x, pos.y + 20);
        }

        ctx.restore();
      }

      // 3. 右侧全局频次柱状图与统计 HUD
      ctx.save();
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('📊 全局颜色频次桶 cnt[c]:', 255, 30);

      const colorNames = [
        { id: 1, name: '颜色 1 (红)', col: '#ef4444' },
        { id: 2, name: '颜色 2 (蓝)', col: '#3b82f6' },
        { id: 3, name: '颜色 3 (绿)', col: '#10b981' },
      ];

      colorNames.forEach((item, idx) => {
        const count = cur.colorBucket[item.id] || 0;
        const barY = 48 + idx * 26;

        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.textAlign = 'left';
        ctx.fillText(item.name, 255, barY + 12);

        // 柱状条
        ctx.fillStyle = item.col;
        ctx.beginPath();
        ctx.roundRect(330, barY, Math.max(10, count * 40), 16, 3);
        ctx.fill();

        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${count}`, 335 + Math.max(10, count * 40), barY + 12);
      });

      // 统计指标卡
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(255, 140, 180, 56, 6);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 10.5px sans-serif';
      ctx.fillStyle = '#facc15';
      ctx.fillText(`👑 最大频次 maxCnt: ${cur.maxCnt}`, 265, 160);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`✨ 众数编号之和: ${cur.sumColor}`, 265, 180);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const TREE_DOMINANT_TEMPLATE = `
  <div id="algo-tree-dominant-color-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">👑</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">树上众数求和 (Tree Dominant Color - CF600E)</span>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="dominant-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-dominant-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-dominant-autoplay" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(2,132,199,0.25);">▶️ 自动合并</button>
        <button id="btn-dominant-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-dominant-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #0369a1;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>📊 统计指标: <b id="dominant-max-badge" style="color: #0284c7; font-size: 12px;">最大频次 maxCnt: 0 | 众数和: 0</b></span>
      </div>
      <div id="dominant-narration-box" style="font-weight: 700; color: #075985;">
        💡 准备就绪：DSU on Tree 动态维护 maxCnt 与 sumColor，严格 O(N log N)！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：树形拓扑与颜色 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="tree-dominant-canvas" width="460" height="220" style="width: 460px; height: 220px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          左侧为 6 节点彩色树 (粉色边为重儿子) | 右侧为动态颜色频次直方图与众数编号累加
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="tree-dominant-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'tree-dominant-color',
  name: '树上众数求和 (Tree Dominant Color)',
  viewId: 'algo-tree-dominant-color-view',
  category: 'graph',
  description: '进阶树论启发式合并：DSU on Tree 动态最值维护、子树众数频次单调更新与众数编号求和 (CF600E Lomsat gelral)',
  icon: '👑',
  template: TREE_DOMINANT_TEMPLATE,
  Visualizer: TreeDominantColorVisualizer,
  difficulty: 3,
  levelOrder: 70,
  learningGoal: '掌握 DSU on Tree 动态维护最值与属性和的 O(1) 转移技巧及树上启发式合并模板',
});
