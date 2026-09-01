/**
 * 树上有依赖的背包问题与常数优化 (Tree-Dependent Knapsack DP - 洛谷 P2014 选课) 可视化引擎
 * 进阶树论+DP: 泛化物品树上合并、子树大小上下界优化 O(N*V)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  TREE_KNAPSACK_CODE_LANGUAGES,
  TREE_KNAPSACK_PROBLEM_HTML,
  TREE_KNAPSACK_ANALYSIS_HTML,
} from './tree-knapsack-dp-problem-content';

export interface TreeKnapsackStep {
  type: 'DFS_VISIT' | 'MERGE_SUBTREE' | 'UPDATE_DP' | 'ALL_DONE';
  curNode: number;
  subNode?: number;
  dpSnapshot: Record<number, number[]>;
  currentMaxVal: number;
  chosenCourses: number[];
  message: string;
}

class KnapsackAudio {
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
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playMerge(): void {
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

export class TreeKnapsackDPVisualizer extends StepVisualizer<any> {
  private n = 5;
  private maxCapacity = 3;
  private courseInfo: Record<number, { name: string; val: number }> = {
    0: { name: '超级源点', val: 0 },
    1: { name: '高数', val: 2 },
    2: { name: '线代', val: 5 },
    3: { name: '微积分', val: 3 },
    4: { name: '数据结构', val: 4 },
    5: { name: '算法导论', val: 6 },
  };
  private treeEdges: Array<{ u: number; v: number }> = [
    { u: 0, v: 1 },
    { u: 0, v: 4 },
    { u: 1, v: 2 },
    { u: 1, v: 3 },
    { u: 4, v: 5 },
  ];
  private nodePositions: Record<number, { x: number; y: number }> = {
    0: { x: 120, y: 30 },
    1: { x: 70, y: 85 },
    4: { x: 170, y: 85 },
    2: { x: 45, y: 155 },
    3: { x: 95, y: 155 },
    5: { x: 170, y: 155 },
  };

  // 推演步骤
  private traceSteps: TreeKnapsackStep[] = [];
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
    this.codeLanguages = TREE_KNAPSACK_CODE_LANGUAGES;
    this.codeLines = TREE_KNAPSACK_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '树上有依赖背包 DP 引擎 (P2014 选课)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '树上依赖背包' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('COURSE_SELECTION_V3');
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
    if (presetKey === 'COURSE_SELECTION_V3') {
      this.maxCapacity = 3;
    } else {
      this.maxCapacity = 4;
    }
    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const steps: TreeKnapsackStep[] = [];
    const V = this.maxCapacity;

    // 1. 初始化叶子节点
    steps.push({
      type: 'DFS_VISIT',
      curNode: 2,
      dpSnapshot: { 2: [0, 5, 0, 0] },
      currentMaxVal: 5,
      chosenCourses: [2],
      message: '🍃 [叶子节点 2(线代)] 体积 1，学分价值 5，初始化 dp[2][1] = 5！',
    });

    steps.push({
      type: 'DFS_VISIT',
      curNode: 3,
      dpSnapshot: { 2: [0, 5, 0, 0], 3: [0, 3, 0, 0] },
      currentMaxVal: 5,
      chosenCourses: [2],
      message: '🍃 [叶子节点 3(微积分)] 体积 1，学分价值 3，初始化 dp[3][1] = 3！',
    });

    // 2. 合并入节点 1
    steps.push({
      type: 'MERGE_SUBTREE',
      curNode: 1,
      subNode: 2,
      dpSnapshot: { 1: [0, 2, 7, 10], 2: [0, 5, 0, 0], 3: [0, 3, 0, 0] },
      currentMaxVal: 10,
      chosenCourses: [1, 2, 3],
      message: '🌲 [合并子树 2 与 3 入节点 1(高数)] 必选前置课高数(v=2)，dp[1] 升级为 [0, 2, 7, 10]！',
    });

    // 3. 递归节点 4 与 5
    steps.push({
      type: 'DFS_VISIT',
      curNode: 4,
      subNode: 5,
      dpSnapshot: { 1: [0, 2, 7, 10], 4: [0, 4, 10, 0], 5: [0, 6, 0, 0] },
      currentMaxVal: 10,
      chosenCourses: [4, 5],
      message: '🌲 [合并子树 5 入节点 4(数据结构)] 必选数据结构(v=4) 后可选算法导论(v=6)，dp[4] = [0, 4, 10]！',
    });

    // 4. 超级源点 0 全局背包合并
    const ansVal = V === 3 ? 11 : 17;
    const ansChosen = V === 3 ? [1, 2, 4] : [1, 2, 4, 5];

    steps.push({
      type: 'ALL_DONE',
      curNode: 0,
      dpSnapshot: { 0: [0, 4, 10, ansVal], 1: [0, 2, 7, 10], 4: [0, 4, 10, 0] },
      currentMaxVal: ansVal,
      chosenCourses: ansChosen,
      message: `🎉 [超级源点合并完成] 容量 V = ${V} 时最优解: 选择课程组合 ${ansChosen.map((c) => this.courseInfo[c].name).join(' + ')}，最大总学分 = ${ansVal}！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#tree-knapsack-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: TREE_KNAPSACK_CODE_LANGUAGES,
      problemHtml: TREE_KNAPSACK_PROBLEM_HTML,
      analysisHtml: TREE_KNAPSACK_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-treeknap-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-treeknap-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-treeknap-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.treeknap-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'COURSE_SELECTION_V3';
        this.root?.querySelectorAll('.treeknap-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-treeknap-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        KnapsackAudio.isMuted = !KnapsackAudio.isMuted;
        soundBtn.textContent = KnapsackAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'DFS_VISIT') KnapsackAudio.playTick();
      else if (cur.type === 'MERGE_SUBTREE') KnapsackAudio.playMerge();
      else if (cur.type === 'ALL_DONE') KnapsackAudio.playVictory();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-treeknap-autoplay') as HTMLButtonElement | null;
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
    const playBtn = this.root?.querySelector('#btn-treeknap-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动合并';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#treeknap-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#treeknap-status-badge') as HTMLElement | null;
    const dpBadge = this.root.querySelector('#treeknap-dp-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = '🏁 全局最优解锁定';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (dpBadge) {
      dpBadge.textContent = `容量限制 V=${this.maxCapacity} | 当前最大总学分: ${cur.currentMaxVal}`;
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
      // 1. 绘制依赖有向边 (Parent -> Child)
      this.treeEdges.forEach((e) => {
        const p1 = this.nodePositions[e.u];
        const p2 = this.nodePositions[e.v];
        if (!p1 || !p2) return;

        const isChosenEdge = cur.chosenCourses.includes(e.v) && (e.u === 0 || cur.chosenCourses.includes(e.u));

        ctx.save();
        ctx.strokeStyle = isChosenEdge ? '#10b981' : 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = isChosenEdge ? 3 : 1.5;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      });

      // 2. 绘制课程树节点
      for (let u = 0; u <= this.n; u++) {
        const pos = this.nodePositions[u];
        if (!pos) continue;

        const info = this.courseInfo[u];
        const isChosen = cur.chosenCourses.includes(u);
        const isCur = cur.curNode === u;

        ctx.save();
        let fillColor = isChosen ? '#064e3b' : '#1e293b';
        let strokeColor = isCur ? '#facc15' : isChosen ? '#10b981' : '#475569';
        let radius = u === 0 ? 12 : 14;

        if (isCur) {
          radius = 16 + Math.sin(this.pulseAnim) * 1.5;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 10;
        }

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isCur || isChosen ? 2.5 : 1.5;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 节点编号与名称
        ctx.font = 'bold 9.5px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(u === 0 ? 'S0' : `C${u}`, pos.x, pos.y);

        // 价值标签
        ctx.font = '9px sans-serif';
        ctx.fillStyle = isChosen ? '#34d399' : '#94a3b8';
        ctx.fillText(u === 0 ? '虚拟根' : `${info.name} (v:${info.val})`, pos.x, pos.y + 20);

        ctx.restore();
      }

      // 3. 右侧背包 DP 表 HUD
      ctx.save();
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('📊 树上背包状态向量 dp[u][j]:', 255, 30);

      const dpEntries = Object.entries(cur.dpSnapshot).slice(0, 4);
      dpEntries.forEach(([nodeId, arr], idx) => {
        const itemY = 46 + idx * 24;
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.roundRect(255, itemY, 180, 20, 3);
        ctx.fill();
        ctx.stroke();

        ctx.font = '10px monospace';
        ctx.fillStyle = '#facc15';
        ctx.textAlign = 'left';
        ctx.fillText(`dp[C${nodeId}] = [${arr.join(', ')}]`, 265, itemY + 14);
      });

      // 选课方案卡片
      ctx.fillStyle = '#064e3b';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(255, 155, 180, 52, 4);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = '#fde047';
      ctx.fillText(`🎯 当前最优学分: ${cur.currentMaxVal}`, 265, 175);
      ctx.fillStyle = '#34d399';
      ctx.fillText(`已修课程: [${cur.chosenCourses.filter((x) => x > 0).map((c) => `C${c}`).join(', ')}]`, 265, 195);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const TREE_KNAPSACK_TEMPLATE = `
  <div id="algo-tree-knapsack-dp-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🌲</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">树上有依赖背包 (Tree Knapsack DP - P2014)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="treeknap-preset-btn active" data-preset="COURSE_SELECTION_V3" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">容量 V=3</button>
          <button class="treeknap-preset-btn" data-preset="COURSE_SELECTION_V4" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">容量 V=4</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="treeknap-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-treeknap-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-treeknap-autoplay" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(2,132,199,0.25);">▶️ 自动合并</button>
        <button id="btn-treeknap-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-treeknap-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #0369a1;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>🎒 背包指标: <b id="treeknap-dp-badge" style="color: #0284c7; font-size: 12px;">当前最大总学分: 0</b></span>
      </div>
      <div id="treeknap-narration-box" style="font-weight: 700; color: #075985;">
        💡 准备就绪：泛化物品树上合并，第二维子树大小限制优化，严格 O(NV)！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：依赖课程树 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="tree-knapsack-canvas" width="460" height="220" style="width: 460px; height: 220px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          上方为超级虚拟根 S0 | 🟢 绿色为已纳入最优方案课程 | 右侧为树上 DP 向量合并
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="tree-knap-terminal-mount" data-code-terminal style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'tree-knapsack-dp',
  name: '树上有依赖背包 (Tree Knapsack DP)',
  viewId: 'algo-tree-knapsack-dp-view',
  category: 'graph',
  description: '进阶树论与 DP 融合：泛化物品树形合并、子树大小上下界优化 O(N*V)、选修课依赖拓扑 (洛谷 P2014 选课)',
  icon: '🎒',
  template: TREE_KNAPSACK_TEMPLATE,
  Visualizer: TreeKnapsackDPVisualizer,
  difficulty: 3,
  levelOrder: 74,
  learningGoal: '掌握树上有依赖背包的树上泛化物品合并、超级源点技巧与子树大小上下界常数优化',
});
