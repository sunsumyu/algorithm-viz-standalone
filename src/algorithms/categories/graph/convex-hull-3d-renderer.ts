/**
 * 三维凸包增量构造与面可见性 (3D Convex Hull - Incremental Algorithm - 洛谷 P4724) 可视化引擎
 * 进阶几何与图论对偶: 四面体基底、有向体积与外法向量、地平线提取与锥面缝合
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  CONVEX_HULL_3D_CODE_LANGUAGES,
  CONVEX_HULL_3D_PROBLEM_HTML,
  CONVEX_HULL_3D_ANALYSIS_HTML,
} from './convex-hull-3d-problem-content';

export interface Hull3DStep {
  type: 'BASE_TETRAHEDRON' | 'ADD_NEW_POINT' | 'CHECK_VISIBILITY' | 'EXTRACT_HORIZON' | 'SEW_CONES' | 'CONVERGED';
  activePointIdx: number;
  faces: Array<{ a: number; b: number; c: number; visible?: boolean; isNew?: boolean }>;
  horizonEdges: Array<[number, number]>;
  numVertices: number;
  numFaces: number;
  numEdges: number;
  message: string;
}

class HullAudio {
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

  public static playTick(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
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

export class ConvexHull3DVisualizer extends StepVisualizer<any> {
  private pts3D: Array<{ x: number; y: number; z: number }> = [
    { x: -45, y: -40, z: -35 },
    { x: 45, y: -40, z: -35 },
    { x: 0, y: 50, z: -35 },
    { x: 0, y: 0, z: 50 },
    { x: 60, y: 25, z: 25 },
  ];

  // 推演步骤
  private traceSteps: Hull3DStep[] = [];
  private currentStepPtr = 0;
  private isAutoPlaying = false;
  private autoPlayTimer: any = null;
  private playSpeed = 1;

  // 画布与3D旋转
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private lastTimestamp = 0;
  private rotY = 0.4;
  private rotX = 0.3;
  private pulseAnim = 0;

  constructor() {
    super();
    this.codeLanguages = CONVEX_HULL_3D_CODE_LANGUAGES;
    this.codeLines = CONVEX_HULL_3D_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '三维凸包增量构造引擎 (P4724 3D Convex Hull)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '三维凸包增量法' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('TETRAHEDRON_WITH_OUTER_POINT');
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
    const steps: Hull3DStep[] = [];

    // 1. 初始四面体 (4 个点, 4 个面)
    const baseFaces = [
      { a: 0, b: 1, c: 2 },
      { a: 0, b: 2, c: 3 },
      { a: 0, b: 3, c: 1 },
      { a: 1, b: 3, c: 2 },
    ];

    steps.push({
      type: 'BASE_TETRAHEDRON',
      activePointIdx: -1,
      faces: baseFaces,
      horizonEdges: [],
      numVertices: 4,
      numFaces: 4,
      numEdges: 6,
      message: '🔺 [构建初始四面体] 选取 4 个不共面的基底点 P0~P3，构成包含 4 个三角形面的初始凸多面体！',
    });

    // 2. 加入新点 P4
    steps.push({
      type: 'ADD_NEW_POINT',
      activePointIdx: 4,
      faces: baseFaces,
      horizonEdges: [],
      numVertices: 5,
      numFaces: 4,
      numEdges: 6,
      message: '📍 [增量引入新点 P4] 位于右上方外部 (60, 25, 25)，准备计算各三角面对 P4 的空间可见性！',
    });

    // 3. 检查各面可见性 (有向体积判据)
    const checkedFaces = [
      { a: 0, b: 1, c: 2, visible: false },
      { a: 0, b: 2, c: 3, visible: false },
      { a: 0, b: 3, c: 1, visible: true },
      { a: 1, b: 3, c: 2, visible: true },
    ];

    steps.push({
      type: 'CHECK_VISIBILITY',
      activePointIdx: 4,
      faces: checkedFaces,
      horizonEdges: [],
      numVertices: 5,
      numFaces: 4,
      numEdges: 6,
      message: '👁️ [面可见性判定] 有向体积 Volume > 0 的面为可见面 (🔴 红色)，点 P4 能够直视面 (0,3,1) 与 (1,3,2)！',
    });

    // 4. 提取地平线边界边 (Horizon Edges)
    const horizons: Array<[number, number]> = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ];

    steps.push({
      type: 'EXTRACT_HORIZON',
      activePointIdx: 4,
      faces: checkedFaces,
      horizonEdges: horizons,
      numVertices: 5,
      numFaces: 4,
      numEdges: 6,
      message: '🟡 [地平线提取] 锁定可见面与不可见面交界的分界闭合回路 (地平线 Horizon)！',
    });

    // 5. 缝合新锥面，生成更新后的三维凸包
    const updatedFaces = [
      { a: 0, b: 1, c: 2 },
      { a: 0, b: 2, c: 3 },
      { a: 0, b: 1, c: 4, isNew: true },
      { a: 1, b: 2, c: 4, isNew: true },
      { a: 2, b: 3, c: 4, isNew: true },
      { a: 3, b: 0, c: 4, isNew: true },
    ];

    steps.push({
      type: 'SEW_CONES',
      activePointIdx: 4,
      faces: updatedFaces,
      horizonEdges: [],
      numVertices: 5,
      numFaces: 6,
      numEdges: 9,
      message: '✨ [锥面缝合完成] 剔除可见面，将点 P4 与地平线边界边逐一相连生成 4 个全新三角面！',
    });

    // 6. 最终收敛完成
    steps.push({
      type: 'CONVERGED',
      activePointIdx: -1,
      faces: updatedFaces,
      horizonEdges: [],
      numVertices: 5,
      numFaces: 6,
      numEdges: 9,
      message: '🎉 [三维凸包构建完毕] 满足欧拉示性数 V - E + F = 5 - 9 + 6 = 2，三维凸多面体拓扑严谨！',
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#convex-hull-3d-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: CONVEX_HULL_3D_CODE_LANGUAGES,
      problemHtml: CONVEX_HULL_3D_PROBLEM_HTML,
      analysisHtml: CONVEX_HULL_3D_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-hull3d-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-hull3d-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-hull3d-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 音效
    const soundBtn = this.root.querySelector('#btn-hull3d-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        HullAudio.isMuted = !HullAudio.isMuted;
        soundBtn.textContent = HullAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'ADD_NEW_POINT') HullAudio.playLaser();
      else if (cur.type === 'CHECK_VISIBILITY') HullAudio.playTick();
      else if (cur.type === 'SEW_CONES' || cur.type === 'CONVERGED') HullAudio.playVictory();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-hull3d-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停构造';

    const step = () => {
      if (!this.isAutoPlaying) return;
      if (this.currentStepPtr < this.traceSteps.length - 1) {
        this.stepForward();
        this.autoPlayTimer = setTimeout(step, 950 / this.playSpeed);
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
    const playBtn = this.root?.querySelector('#btn-hull3d-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动构造';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#hull3d-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#hull3d-status-badge') as HTMLElement | null;
    const eulerBadge = this.root.querySelector('#hull3d-euler-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'CONVERGED') {
        statusBadge.textContent = '🏁 凸包构建完成';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (eulerBadge) {
      eulerBadge.textContent = `欧拉公式: V(${cur.numVertices}) - E(${cur.numEdges}) + F(${cur.numFaces}) = 2`;
    }
  }

  private startLoop(): void {
    if (typeof requestAnimationFrame !== 'function') return;
    const loop = (timestamp: number) => {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const dt = Math.min(32, timestamp - this.lastTimestamp);
      this.lastTimestamp = timestamp;

      this.rotY += dt * 0.0008;
      this.rotX = 0.3 + Math.sin(this.rotY * 0.5) * 0.1;
      this.pulseAnim += dt * 0.006;
      this.renderCanvas();

      if (typeof requestAnimationFrame === 'function') {
        this.animFrameId = requestAnimationFrame(loop);
      }
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private project3D(x: number, y: number, z: number, cx: number, cy: number): { x: number; y: number; depth: number } {
    // 绕 Y 轴与 X 轴旋转投影
    const cosY = Math.cos(this.rotY),
      sinY = Math.sin(this.rotY);
    const x1 = x * cosY + z * sinY;
    const z1 = -x * sinY + z * cosY;

    const cosX = Math.cos(this.rotX),
      sinX = Math.sin(this.rotX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

    const scale = 240 / (240 + z2);
    return {
      x: cx + x1 * scale,
      y: cy - y2 * scale,
      depth: z2,
    };
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

    const cx = 130;
    const cy = 110;

    if (cur) {
      // 1. 投影所有点
      const proj = this.pts3D.map((p) => this.project3D(p.x, p.y, p.z, cx, cy));

      // 2. 绘制三角面
      cur.faces.forEach((f) => {
        const pA = proj[f.a];
        const pB = proj[f.b];
        const pC = proj[f.c];
        if (!pA || !pB || !pC) return;

        ctx.save();
        let fillColor = 'rgba(56, 189, 248, 0.12)';
        let strokeColor = 'rgba(56, 189, 248, 0.6)';

        if (f.visible) {
          fillColor = 'rgba(239, 68, 68, 0.35)';
          strokeColor = '#ef4444';
        } else if (f.isNew) {
          fillColor = 'rgba(16, 185, 129, 0.35)';
          strokeColor = '#10b981';
        }

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.lineTo(pC.x, pC.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      });

      // 3. 绘制地平线高亮边
      cur.horizonEdges.forEach(([u, v]) => {
        const pU = proj[u];
        const pV = proj[v];
        if (!pU || !pV) return;

        ctx.save();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.moveTo(pU.x, pU.y);
        ctx.lineTo(pV.x, pV.y);
        ctx.stroke();
        ctx.restore();
      });

      // 4. 绘制 3D 空间顶点
      proj.forEach((p, idx) => {
        if (idx === 4 && cur.type === 'BASE_TETRAHEDRON') return;

        const isAddPoint = cur.activePointIdx === idx;

        ctx.save();
        let radius = isAddPoint ? 6 + Math.sin(this.pulseAnim) * 1.5 : 4;
        let fillColor = isAddPoint ? '#facc15' : '#38bdf8';

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 9.5px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`P${idx}`, p.x + 6, p.y - 4);

        ctx.restore();
      });

      // 5. 右侧 3D 凸包状态与欧拉定理 HUD
      ctx.save();
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('🌐 3D 凸多面体与欧拉公式:', 255, 30);

      // 欧拉卡片
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(255, 42, 180, 52, 4);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 10.5px monospace';
      ctx.fillStyle = '#facc15';
      ctx.fillText(`顶点数 V = ${cur.numVertices} | 面数 F = ${cur.numFaces}`, 265, 60);
      ctx.fillStyle = '#34d399';
      ctx.fillText(`棱边数 E = ${cur.numEdges} (V-E+F=2)`, 265, 80);

      // 图例与算法原理
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#facc15';
      ctx.fillText('👑 增量法三要素:', 250, 125);
      ctx.fillStyle = '#ef4444';
      ctx.fillText('🔴 红色面: 可见面 (有向体积 > 0)', 250, 145);
      ctx.fillStyle = '#facc15';
      ctx.fillText('🟡 金色边: 地平线交界分界回路', 250, 165);
      ctx.fillStyle = '#34d399';
      ctx.fillText('🟢 绿色面: 新缝合锥面 (Cone Face)', 250, 185);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const CONVEX_HULL_3D_TEMPLATE = `
  <div id="algo-convex-hull-3d-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🌐</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">三维凸包增量法 (3D Convex Hull - P4724)</span>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="hull3d-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-hull3d-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-hull3d-autoplay" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(2,132,199,0.25);">▶️ 自动构造</button>
        <button id="btn-hull3d-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-hull3d-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #0369a1;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>📐 凸包示性数: <b id="hull3d-euler-badge" style="color: #0284c7; font-size: 12px;">V(4) - E(6) + F(4) = 2</b></span>
      </div>
      <div id="hull3d-narration-box" style="font-weight: 700; color: #075985;">
        💡 准备就绪：四面体基底 -> 面可见性判定 -> 地平线提取 -> 缝合锥面，期望 O(N log N)！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：3D 空间立体投影 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="convex-hull-3d-canvas" width="460" height="220" style="width: 460px; height: 220px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          左侧为实时 3D 旋转立体凸包 (支持透光面与地平线高亮) | 右侧为欧拉公式与拓扑状态
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="hull3d-terminal-mount" data-code-terminal style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'convex-hull-3d',
  name: '三维凸包增量法 (3D Convex Hull)',
  viewId: 'algo-convex-hull-3d-view',
  category: 'graph',
  description: '进阶计算几何与图论对偶：四面体基底、有向体积与面可见性、地平线提取与锥面缝合 (洛谷 P4724)',
  icon: '🌐',
  template: CONVEX_HULL_3D_TEMPLATE,
  Visualizer: ConvexHull3DVisualizer,
  difficulty: 3,
  levelOrder: 75,
  learningGoal: '掌握三维凸包增量构造法的几何判据（外法向量与有向体积）、地平线提取与欧拉公式 V-E+F=2',
});
