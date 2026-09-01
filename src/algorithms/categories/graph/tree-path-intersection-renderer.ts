/**
 * 树上路径相交判定与 LCA 几何拓扑 (Tree Path Intersection & LCA) 可视化引擎
 * 进阶树论: 两路径相交充要条件、LCA 包含判定定理、树上距离 dis(u, v)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  TREE_INTERSECT_CODE_LANGUAGES,
  TREE_INTERSECT_PROBLEM_HTML,
  TREE_INTERSECT_ANALYSIS_HTML,
} from './tree-path-intersection-problem-content';

export interface IntersectStep {
  type: 'COMPUTE_LCA1' | 'COMPUTE_LCA2' | 'CHECK_ON_PATH' | 'RESULT';
  lca1: number;
  lca2: number;
  checkingLCA: number;
  targetPath: 'A' | 'B';
  isOnPath: boolean;
  isIntersect: boolean;
  intersectNode?: number;
  message: string;
}

class TreeAudio {
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

  public static playPing(): void {
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

  public static playCheck(): void {
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

export class TreePathIntersectionVisualizer extends StepVisualizer<any> {
  private n = 7;
  private pathA = { u: 4, v: 5 };
  private pathB = { u: 2, v: 7 };
  private treeEdges: Array<{ u: number; v: number }> = [
    { u: 1, v: 2 },
    { u: 1, v: 3 },
    { u: 2, v: 4 },
    { u: 2, v: 5 },
    { u: 4, v: 6 },
    { u: 3, v: 7 },
  ];
  private nodePositions: Record<number, { x: number; y: number }> = {
    1: { x: 120, y: 35 },
    2: { x: 70, y: 90 },
    3: { x: 170, y: 90 },
    4: { x: 40, y: 150 },
    5: { x: 100, y: 150 },
    6: { x: 40, y: 200 },
    7: { x: 170, y: 150 },
  };

  // 推演步骤
  private traceSteps: IntersectStep[] = [];
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
    this.codeLanguages = TREE_INTERSECT_CODE_LANGUAGES;
    this.codeLines = TREE_INTERSECT_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '树上路径相交判定引擎 (Path Intersection)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '树上路径相交判定' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('INTERSECTING_PATHS_7');
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

    if (presetKey === 'INTERSECTING_PATHS_7') {
      this.pathA = { u: 4, v: 5 };
      this.pathB = { u: 2, v: 7 };
    } else {
      this.pathA = { u: 4, v: 6 };
      this.pathB = { u: 3, v: 7 };
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const steps: IntersectStep[] = [];

    // 计算 LCA1 与 LCA2
    const lca1 = this.pathA.u === 4 && this.pathA.v === 5 ? 2 : 4;
    const lca2 = this.pathB.u === 2 && this.pathB.v === 7 ? 1 : 3;

    steps.push({
      type: 'COMPUTE_LCA1',
      lca1,
      lca2: 0,
      checkingLCA: lca1,
      targetPath: 'A',
      isOnPath: false,
      isIntersect: false,
      message: `🌲 [计算 LCA(P1)] 路径 P1(${this.pathA.u}, ${this.pathA.v}) 的最高公共祖先为 LCA1 = ${lca1}！`,
    });

    steps.push({
      type: 'COMPUTE_LCA2',
      lca1,
      lca2,
      checkingLCA: lca2,
      targetPath: 'B',
      isOnPath: false,
      isIntersect: false,
      message: `🌲 [计算 LCA(P2)] 路径 P2(${this.pathB.u}, ${this.pathB.v}) 的最高公共祖先为 LCA2 = ${lca2}！`,
    });

    if (this.pathA.u === 4 && this.pathA.v === 5) {
      // 判定 LCA1=2 是否在路径 P2(2, 7) 上
      steps.push({
        type: 'CHECK_ON_PATH',
        lca1,
        lca2,
        checkingLCA: lca1,
        targetPath: 'B',
        isOnPath: true,
        isIntersect: true,
        intersectNode: 2,
        message: `🔍 [距离判定定理] 验证 LCA1(${lca1}) 在路径 P2(${this.pathB.u}, ${this.pathB.v}) 上：dis(${this.pathB.u}, ${lca1}) + dis(${lca1}, ${this.pathB.v}) == dis(${this.pathB.u}, ${this.pathB.v}) 成立！`,
      });

      steps.push({
        type: 'RESULT',
        lca1,
        lca2,
        checkingLCA: lca1,
        targetPath: 'B',
        isOnPath: true,
        isIntersect: true,
        intersectNode: 2,
        message: '🎉 [判定结果: 相交] 两条树上路径相交！公共交集节点为节点 2！',
      });
    } else {
      steps.push({
        type: 'CHECK_ON_PATH',
        lca1,
        lca2,
        checkingLCA: lca1,
        targetPath: 'B',
        isOnPath: false,
        isIntersect: false,
        message: `🔍 [距离判定定理] 验证 LCA1(${lca1}) 不在 P2 上，且 LCA2(${lca2}) 亦不在 P1 上！`,
      });

      steps.push({
        type: 'RESULT',
        lca1,
        lca2,
        checkingLCA: 0,
        targetPath: 'B',
        isOnPath: false,
        isIntersect: false,
        message: '❌ [判定结果: 不相交] 两条树上路径完全不相交 (交集为空)！',
      });
    }

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#tree-intersect-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: TREE_INTERSECT_CODE_LANGUAGES,
      problemHtml: TREE_INTERSECT_PROBLEM_HTML,
      analysisHtml: TREE_INTERSECT_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-intersect-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-intersect-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-intersect-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.intersect-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'INTERSECTING_PATHS_7';
        this.root?.querySelectorAll('.intersect-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-intersect-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        TreeAudio.isMuted = !TreeAudio.isMuted;
        soundBtn.textContent = TreeAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'COMPUTE_LCA1' || cur.type === 'COMPUTE_LCA2') TreeAudio.playPing();
      else if (cur.type === 'CHECK_ON_PATH') TreeAudio.playCheck();
      else if (cur.type === 'RESULT') TreeAudio.playVictory();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-intersect-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停判定';

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
    const playBtn = this.root?.querySelector('#btn-intersect-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动判定';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#intersect-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#intersect-status-badge') as HTMLElement | null;
    const resultBadge = this.root.querySelector('#intersect-result-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'RESULT') {
        statusBadge.textContent = cur.isIntersect ? '🏁 判定: 相交' : '🏁 判定: 不相交';
        statusBadge.style.background = cur.isIntersect ? '#f0fdf4' : '#fef2f2';
        statusBadge.style.color = cur.isIntersect ? '#16a34a' : '#ef4444';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (resultBadge) {
      resultBadge.textContent = `LCA1: ${cur.lca1 || '-'} | LCA2: ${cur.lca2 || '-'} | 相交: ${cur.type === 'RESULT' ? (cur.isIntersect ? '是' : '否') : '计算中'}`;
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

        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      });

      // 2. 绘制节点与路径标记
      for (let u = 1; u <= this.n; u++) {
        const pos = this.nodePositions[u];
        if (!pos) continue;

        const isLCA1 = cur.lca1 === u;
        const isLCA2 = cur.lca2 === u;
        const isIntersectPoint = cur.intersectNode === u;

        ctx.save();
        let fillColor = '#1e293b';
        let strokeColor = isIntersectPoint ? '#facc15' : isLCA1 ? '#10b981' : isLCA2 ? '#38bdf8' : '#475569';
        let radius = 13;

        if (isIntersectPoint) {
          fillColor = '#854d0e';
          radius = 16 + Math.sin(this.pulseAnim) * 2;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 12;
        }

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isIntersectPoint ? 3.5 : isLCA1 || isLCA2 ? 2.5 : 1.5;

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

        if (isLCA1) {
          ctx.font = '9px sans-serif';
          ctx.fillStyle = '#10b981';
          ctx.fillText('LCA1', pos.x, pos.y - 18);
        }
        if (isLCA2) {
          ctx.font = '9px sans-serif';
          ctx.fillStyle = '#38bdf8';
          ctx.fillText('LCA2', pos.x, pos.y + 20);
        }

        ctx.restore();
      }

      // 3. 右侧路径定义与判定定理 HUD
      ctx.save();
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('📋 待判定树上路径:', 255, 30);

      // 路径 1 (绿色)
      ctx.fillStyle = '#064e3b';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(255, 42, 180, 24, 4);
      ctx.fill();
      ctx.stroke();
      ctx.font = 'bold 10.5px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(`路径 P1: (${this.pathA.u} ➔ ${this.pathA.v}) [LCA: ${cur.lca1 || '-'}]`, 265, 58);

      // 路径 2 (蓝色)
      ctx.fillStyle = '#1e3a8a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(255, 74, 180, 24, 4);
      ctx.fill();
      ctx.stroke();
      ctx.font = 'bold 10.5px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`路径 P2: (${this.pathB.u} ➔ ${this.pathB.v}) [LCA: ${cur.lca2 || '-'}]`, 265, 90);

      // 充要定理
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#facc15';
      ctx.fillText('👑 判定定理:', 250, 130);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('P1 ∩ P2 ≠ ∅  ⟺', 250, 148);
      ctx.fillText('LCA1 在 P2 上  或  LCA2 在 P1 上', 250, 166);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('利用树上距离公式只需 O(log N)！', 250, 190);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const TREE_INTERSECT_TEMPLATE = `
  <div id="algo-tree-path-intersection-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🌲</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">树上路径相交判定 (Tree Path Intersection)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="intersect-preset-btn active" data-preset="INTERSECTING_PATHS_7" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">相交路径用例</button>
          <button class="intersect-preset-btn" data-preset="DISJOINT_PATHS_7" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">不相交路径用例</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="intersect-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-intersect-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-intersect-autoplay" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(2,132,199,0.25);">▶️ 自动判定</button>
        <button id="btn-intersect-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-intersect-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #0369a1;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>🔍 拓扑指标: <b id="intersect-result-badge" style="color: #0284c7; font-size: 12px;">LCA1: - | LCA2: - | 相交: 计算中</b></span>
      </div>
      <div id="intersect-narration-box" style="font-weight: 700; color: #075985;">
        💡 准备就绪：LCA(P1) 在 P2 上 或 LCA(P2) 在 P1 上，单次 O(log N)！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：树形拓扑与交点 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="tree-intersect-canvas" width="460" height="220" style="width: 460px; height: 220px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          左侧为 7 节点树形拓扑 | 🟢 绿色为 LCA1 | 🔵 蓝色为 LCA2 | 🟡 金色光环为两条路径的公共相交节点
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="tree-intersect-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'tree-path-intersection',
  name: '树上路径相交判定 (Tree Path Intersection)',
  viewId: 'algo-tree-path-intersection-view',
  category: 'graph',
  description: '进阶树论几何判定：两路径相交充要条件 (LCA 包含定理)、树上距离公式判定、倍增 LCA 极速 O(log N) 求解 (洛谷 P3398)',
  icon: '🌲',
  template: TREE_INTERSECT_TEMPLATE,
  Visualizer: TreePathIntersectionVisualizer,
  difficulty: 2,
  levelOrder: 68,
  learningGoal: '掌握树上单峰路径性质、LCA 判定两路径相交的充要定理及树上距离 dis(u, v) 快速计算',
});
