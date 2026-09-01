/**
 * 树上启发式合并 (DSU on Tree - Heavy-Light Merge on Trees) 可视化引擎
 * 进阶树论: 重儿子保留计数桶 (keep=true)、轻儿子统计后清空 (keep=false)、严格 O(N log N)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DSU_ON_TREE_CODE_LANGUAGES,
  DSU_ON_TREE_PROBLEM_HTML,
  DSU_ON_TREE_ANALYSIS_HTML,
} from './dsu-on-tree-problem-content';

export interface DSUStep {
  type: 'VISIT_LIGHT' | 'VISIT_HEAVY' | 'ADD_NODE' | 'CLEAR_BUCKET' | 'RECORD_ANS' | 'ALL_DONE';
  curNode: number;
  isKeep: boolean;
  colorBucket: Record<string, number>;
  distinctCount: number;
  ansList: number[];
  activeSubtreeNodes: number[];
  message: string;
}

class DSUAudio {
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

  public static playAdd(): void {
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

  public static playClear(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(261.63, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  public static playRecord(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const chord = [523.25, 659.25, 783.99, 1046.5];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.18);
      });
    } catch {}
  }
}

export class DSUOnTreeVisualizer extends StepVisualizer<any> {
  private n = 7;
  private nodeColors: Record<number, string> = {
    1: 'Red',
    2: 'Blue',
    3: 'Red',
    4: 'Green',
    5: 'Blue',
    6: 'Yellow',
    7: 'Green',
  };
  private colorHex: Record<string, string> = {
    Red: '#ef4444',
    Blue: '#3b82f6',
    Green: '#10b981',
    Yellow: '#eab308',
  };
  private treeEdges: Array<{ u: number; v: number; isHeavy: boolean }> = [
    { u: 1, v: 2, isHeavy: true },
    { u: 1, v: 3, isHeavy: false },
    { u: 2, v: 4, isHeavy: true },
    { u: 2, v: 5, isHeavy: false },
    { u: 4, v: 6, isHeavy: true },
    { u: 3, v: 7, isHeavy: true },
  ];
  private nodePositions: Record<number, { x: number; y: number }> = {
    1: { x: 120, y: 35 },
    2: { x: 75, y: 90 },
    3: { x: 175, y: 90 },
    4: { x: 45, y: 150 },
    5: { x: 105, y: 150 },
    6: { x: 45, y: 200 },
    7: { x: 175, y: 150 },
  };

  // 推演步骤
  private traceSteps: DSUStep[] = [];
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
    this.codeLanguages = DSU_ON_TREE_CODE_LANGUAGES;
    this.codeLines = DSU_ON_TREE_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '树上启发式合并 DSU on Tree 引擎';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '树上启发式合并' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_7_NODE_TREE');
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

    if (presetKey === 'CLASSIC_7_NODE_TREE') {
      this.n = 7;
      this.nodeColors = {
        1: 'Red',
        2: 'Blue',
        3: 'Red',
        4: 'Green',
        5: 'Blue',
        6: 'Yellow',
        7: 'Green',
      };
      this.treeEdges = [
        { u: 1, v: 2, isHeavy: true },
        { u: 1, v: 3, isHeavy: false },
        { u: 2, v: 4, isHeavy: true },
        { u: 2, v: 5, isHeavy: false },
        { u: 4, v: 6, isHeavy: true },
        { u: 3, v: 7, isHeavy: true },
      ];
      this.nodePositions = {
        1: { x: 120, y: 35 },
        2: { x: 75, y: 90 },
        3: { x: 175, y: 90 },
        4: { x: 45, y: 145 },
        5: { x: 105, y: 145 },
        6: { x: 45, y: 195 },
        7: { x: 175, y: 145 },
      };
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const bucket: Record<string, number> = { Red: 0, Blue: 0, Green: 0, Yellow: 0 };
    let distinct = 0;
    const ans = Array(this.n + 1).fill(0);
    const steps: DSUStep[] = [];

    const addCol = (col: string) => {
      if (bucket[col] === 0) distinct++;
      bucket[col]++;
    };

    const clearBucket = () => {
      for (const k in bucket) bucket[k] = 0;
      distinct = 0;
    };

    // 1. 递归处理轻儿子 3 的子树 (keep=false)
    // 3 的重儿子 7
    addCol('Green');
    steps.push({
      type: 'ADD_NODE',
      curNode: 7,
      isKeep: true,
      colorBucket: { ...bucket },
      distinctCount: distinct,
      ansList: [...ans],
      activeSubtreeNodes: [7],
      message: '🌲 [统计重儿子 7] 加入节点 7(Green)，当前桶内颜色数 = 1。',
    });
    addCol('Red');
    ans[3] = distinct;
    steps.push({
      type: 'RECORD_ANS',
      curNode: 3,
      isKeep: false,
      colorBucket: { ...bucket },
      distinctCount: distinct,
      ansList: [...ans],
      activeSubtreeNodes: [3, 7],
      message: '📝 [记录答案 ans[3]] 节点 3 子树包含 {Green, Red}，不同颜色数 = 2！',
    });

    // 清空轻儿子 3
    clearBucket();
    steps.push({
      type: 'CLEAR_BUCKET',
      curNode: 3,
      isKeep: false,
      colorBucket: { ...bucket },
      distinctCount: distinct,
      ansList: [...ans],
      activeSubtreeNodes: [],
      message: '🧹 [清空计数桶] 节点 3 为轻儿子 (keep=false)，清空全局桶释放空间！',
    });

    // 2. 递归处理重儿子 2 (keep=true)
    // 2 的轻儿子 5 (keep=false)
    addCol('Blue');
    ans[5] = distinct;
    steps.push({
      type: 'RECORD_ANS',
      curNode: 5,
      isKeep: false,
      colorBucket: { ...bucket },
      distinctCount: distinct,
      ansList: [...ans],
      activeSubtreeNodes: [5],
      message: '📝 [记录答案 ans[5]] 节点 5 为叶子，颜色为 Blue，ans[5] = 1。',
    });
    clearBucket();
    steps.push({
      type: 'CLEAR_BUCKET',
      curNode: 5,
      isKeep: false,
      colorBucket: { ...bucket },
      distinctCount: distinct,
      ansList: [...ans],
      activeSubtreeNodes: [],
      message: '🧹 [清空计数桶] 节点 5 为轻儿子 (keep=false)，清空桶。',
    });

    // 2 的重儿子 4 (keep=true)
    addCol('Yellow'); // 6
    addCol('Green');  // 4
    ans[4] = distinct;
    steps.push({
      type: 'RECORD_ANS',
      curNode: 4,
      isKeep: true,
      colorBucket: { ...bucket },
      distinctCount: distinct,
      ansList: [...ans],
      activeSubtreeNodes: [4, 6],
      message: '👑 [重儿子 4 保留数据] 节点 4 子树包含 {Yellow, Green}，ans[4] = 2，保留数据！',
    });

    // 合并轻儿子 5 与自身 2
    addCol('Blue'); // 5
    addCol('Blue'); // 2
    ans[2] = distinct;
    steps.push({
      type: 'RECORD_ANS',
      curNode: 2,
      isKeep: true,
      colorBucket: { ...bucket },
      distinctCount: distinct,
      ansList: [...ans],
      activeSubtreeNodes: [2, 4, 5, 6],
      message: '👑 [重儿子 2 合并轻儿子] 暴力合并节点 5(Blue) 与自身 2(Blue)，ans[2] = 3，保留数据！',
    });

    // 3. 根节点 1：暴力合并轻儿子 3 的子树 {3, 7} 与自身 1
    addCol('Red');   // 3
    addCol('Green'); // 7
    addCol('Red');   // 1
    ans[1] = distinct;
    steps.push({
      type: 'RECORD_ANS',
      curNode: 1,
      isKeep: true,
      colorBucket: { ...bucket },
      distinctCount: distinct,
      ansList: [...ans],
      activeSubtreeNodes: [1, 2, 3, 4, 5, 6, 7],
      message: '🎉 [根节点 1 汇聚全树] 暴力加入轻儿子 3 子树及自身，整棵树包含 4 种不同颜色，ans[1] = 4！',
    });

    steps.push({
      type: 'ALL_DONE',
      curNode: 1,
      isKeep: true,
      colorBucket: { ...bucket },
      distinctCount: distinct,
      ansList: [...ans],
      activeSubtreeNodes: [1, 2, 3, 4, 5, 6, 7],
      message: '✨ [DSU on Tree 完成] 树上启发式合并全部完成，所有节点子树颜色数精确求出，严格 O(N log N)！',
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#dsu-tree-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: DSU_ON_TREE_CODE_LANGUAGES,
      problemHtml: DSU_ON_TREE_PROBLEM_HTML,
      analysisHtml: DSU_ON_TREE_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-dsu-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-dsu-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-dsu-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 音效
    const soundBtn = this.root.querySelector('#btn-dsu-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        DSUAudio.isMuted = !DSUAudio.isMuted;
        soundBtn.textContent = DSUAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'ADD_NODE') DSUAudio.playAdd();
      else if (cur.type === 'CLEAR_BUCKET') DSUAudio.playClear();
      else if (cur.type === 'RECORD_ANS' || cur.type === 'ALL_DONE') DSUAudio.playRecord();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-dsu-autoplay') as HTMLButtonElement | null;
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
    const playBtn = this.root?.querySelector('#btn-dsu-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动合并';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#dsu-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#dsu-status-badge') as HTMLElement | null;
    const distinctBadge = this.root.querySelector('#dsu-distinct-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = '🏁 合并完成';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (distinctBadge) {
      distinctBadge.textContent = `当前桶内不同颜色数: ${cur.distinctCount}`;
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
      // 1. 绘制树边 (重边粗绿，轻边细虚)
      this.treeEdges.forEach((e) => {
        const p1 = this.nodePositions[e.u];
        const p2 = this.nodePositions[e.v];
        if (!p1 || !p2) return;

        ctx.save();
        ctx.strokeStyle = e.isHeavy ? '#10b981' : 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = e.isHeavy ? 3 : 1.5;
        if (!e.isHeavy) ctx.setLineDash([4, 4]);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      });

      // 2. 绘制树节点
      for (let u = 1; u <= this.n; u++) {
        const pos = this.nodePositions[u];
        if (!pos) continue;

        const colName = this.nodeColors[u];
        const colHex = this.colorHex[colName] || '#ffffff';
        const isCur = cur.curNode === u;
        const inActive = cur.activeSubtreeNodes.includes(u);

        ctx.save();
        let radius = 13;
        if (isCur) {
          radius = 15 + Math.sin(this.pulseAnim) * 1.5;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 10;
        }

        ctx.fillStyle = colHex;
        ctx.strokeStyle = isCur ? '#facc15' : inActive ? '#38bdf8' : '#334155';
        ctx.lineWidth = isCur ? 3 : inActive ? 2 : 1;

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

        // 答案标注
        if (cur.ansList[u] > 0) {
          ctx.font = '9px sans-serif';
          ctx.fillStyle = '#10b981';
          ctx.fillText(`ans:${cur.ansList[u]}`, pos.x, pos.y + 18);
        }

        ctx.restore();
      }

      // 3. 右侧全局颜色计数桶 HUD
      ctx.save();
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('📊 全局颜色计数桶 cnt[]:', 250, 30);

      const colorKeys = ['Red', 'Blue', 'Green', 'Yellow'];
      colorKeys.forEach((key, idx) => {
        const itemY = 46 + idx * 26;
        const count = cur.colorBucket[key] || 0;

        // 色块
        ctx.fillStyle = this.colorHex[key];
        ctx.beginPath();
        ctx.roundRect(250, itemY, 14, 14, 3);
        ctx.fill();

        ctx.font = 'bold 10.5px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText(`${key}: ${count} 个`, 272, itemY + 11);

        // 条形图
        if (count > 0) {
          ctx.fillStyle = this.colorHex[key];
          ctx.beginPath();
          ctx.roundRect(350, itemY + 2, count * 20, 10, 2);
          ctx.fill();
        }
      });

      // 统计提示
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`🟢 粗绿实线 = 重边 | 🔵 细蓝虚线 = 轻边`, 240, 175);
      ctx.fillText(`💡 重儿子子树直接继承，轻儿子按需加入`, 240, 195);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const DSU_ON_TREE_TEMPLATE = `
  <div id="algo-dsu-on-tree-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🌲</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">树上启发式合并 (DSU on Tree)</span>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="dsu-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-dsu-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-dsu-autoplay" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(2,132,199,0.25);">▶️ 自动合并</button>
        <button id="btn-dsu-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-dsu-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #0369a1;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>📊 桶特征: <b id="dsu-distinct-badge" style="color: #0284c7; font-size: 12px;">当前桶内不同颜色数: 0</b></span>
      </div>
      <div id="dsu-narration-box" style="font-weight: 700; color: #075985;">
        💡 准备就绪：重儿子保留计数桶 (keep=true)，轻儿子统计后清空 (keep=false)，严格 O(N log N)！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：树形结构与颜色桶 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="dsu-tree-canvas" width="460" height="220" style="width: 460px; height: 220px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          左侧为 7 节点树形彩色拓扑 | 右侧为动态颜色计数桶与出现频次 | 节点下方标有已计算出的 ans
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="dsu-tree-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'dsu-on-tree',
  name: '树上启发式合并 (DSU on Tree)',
  viewId: 'algo-dsu-on-tree-view',
  category: 'graph',
  description: '进阶树论高效算法：重儿子保留计数桶、轻儿子统计后清空、轻边跳跃不超过 log N 次 (CF600E / 洛谷 U41492)',
  icon: '🌲',
  template: DSU_ON_TREE_TEMPLATE,
  Visualizer: DSUOnTreeVisualizer,
  difficulty: 3,
  levelOrder: 63,
  learningGoal: '掌握重链剖分与启发式合并在树上子树统计的应用、严格 O(N log N) 复杂度证明与桶空间复用',
});
