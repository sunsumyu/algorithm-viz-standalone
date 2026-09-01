/**
 * DAG 支配树与编译控制流分析 (Dominator Tree on DAG) 可视化引擎
 * 进阶图论: 控制流图支配关系 (idom)、DAG 前驱节点支配树 LCA 定理、增量倍增构建 (洛谷 P5180)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DOMINATOR_TREE_CODE_LANGUAGES,
  DOMINATOR_TREE_PROBLEM_HTML,
  DOMINATOR_TREE_ANALYSIS_HTML,
} from './dominator-tree-problem-content';

export interface DomTreeStep {
  type: 'TOPO_VISIT' | 'CALC_LCA' | 'ADD_IDOM_EDGE' | 'ALL_DONE';
  curNode?: number;
  preds?: number[];
  lcaResult?: number;
  idomSnapshot: number[];
  treeEdges: Array<{ u: number; v: number }>;
  message: string;
}

class DomTreeAudio {
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

  public static playTopo(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playLCA(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  public static playConnect(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const chord = [523.25, 659.25, 783.99, 1046.5];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.22);
      });
    } catch {}
  }
}

export class DominatorTreeVisualizer extends StepVisualizer<any> {
  // 图参数与坐标 (1-indexed)
  private n = 6;
  private rootNode = 1;
  private cfgEdges: Array<{ u: number; v: number }> = [];
  private cfgPositions: Array<{ x: number; y: number }> = [];
  private domPositions: Array<{ x: number; y: number }> = [];

  // 推演步骤
  private traceSteps: DomTreeStep[] = [];
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
    this.codeLanguages = DOMINATOR_TREE_CODE_LANGUAGES;
    this.codeLines = DOMINATOR_TREE_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = 'DAG 支配树构建引擎 (Dominator Tree)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '支配树构建' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_IF_ELSE_CFG');
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

    if (presetKey === 'CLASSIC_IF_ELSE_CFG') {
      this.n = 6;
      this.rootNode = 1;
      this.cfgEdges = [
        { u: 1, v: 2 },
        { u: 1, v: 3 },
        { u: 2, v: 4 },
        { u: 3, v: 4 },
        { u: 4, v: 5 },
        { u: 4, v: 6 },
      ];
      this.cfgPositions = [
        { x: 0, y: 0 },
        { x: 100, y: 35 },  // 1 (root)
        { x: 50, y: 85 },   // 2
        { x: 150, y: 85 },  // 3
        { x: 100, y: 135 }, // 4
        { x: 50, y: 175 },  // 5
        { x: 150, y: 175 }, // 6
      ];
      this.domPositions = [
        { x: 0, y: 0 },
        { x: 330, y: 35 },  // 1 (root)
        { x: 260, y: 95 },  // 2 (idom: 1)
        { x: 400, y: 95 },  // 3 (idom: 1)
        { x: 330, y: 115 }, // 4 (idom: 1)
        { x: 280, y: 175 }, // 5 (idom: 4)
        { x: 380, y: 175 }, // 6 (idom: 4)
      ];
    } else {
      this.n = 5;
      this.rootNode = 1;
      this.cfgEdges = [
        { u: 1, v: 2 },
        { u: 1, v: 3 },
        { u: 2, v: 3 },
        { u: 2, v: 4 },
        { u: 3, v: 4 },
        { u: 4, v: 5 },
      ];
      this.cfgPositions = [
        { x: 0, y: 0 },
        { x: 100, y: 35 },
        { x: 50, y: 85 },
        { x: 150, y: 85 },
        { x: 100, y: 135 },
        { x: 100, y: 175 },
      ];
      this.domPositions = [
        { x: 0, y: 0 },
        { x: 330, y: 35 },
        { x: 260, y: 95 },
        { x: 400, y: 95 },
        { x: 330, y: 125 },
        { x: 330, y: 175 },
      ];
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const n = this.n;
    const root = this.rootNode;

    const adj: number[][] = Array.from({ length: n + 1 }, () => []);
    const revAdj: number[][] = Array.from({ length: n + 1 }, () => []);
    const inDegree = Array(n + 1).fill(0);

    this.cfgEdges.forEach((e) => {
      adj[e.u].push(e.v);
      revAdj[e.v].push(e.u);
      inDegree[e.v]++;
    });

    const up: number[][] = Array.from({ length: n + 1 }, () => Array(18).fill(0));
    const depth = Array(n + 1).fill(0);
    const idom = Array(n + 1).fill(0);
    const treeEdges: Array<{ u: number; v: number }> = [];

    const getLCA = (u: number, v: number): number => {
      if (depth[u] < depth[v]) {
        const temp = u;
        u = v;
        v = temp;
      }
      for (let i = 17; i >= 0; i--) {
        if (depth[u] - (1 << i) >= depth[v]) u = up[u][i];
      }
      if (u === v) return u;
      for (let i = 17; i >= 0; i--) {
        if (up[u][i] !== up[v][i]) {
          u = up[u][i];
          v = up[v][i];
        }
      }
      return up[u][0];
    };

    const steps: DomTreeStep[] = [];
    const q: number[] = [root];
    depth[root] = 1;

    steps.push({
      type: 'TOPO_VISIT',
      curNode: root,
      idomSnapshot: [...idom],
      treeEdges: [],
      message: `🚀 初始化 DAG 支配树：入口源点为节点 ${root}，作为支配树根节点入队！`,
    });

    while (q.length > 0) {
      const u = q.shift()!;

      if (u !== root) {
        const preds = revAdj[u];
        let pLCA = preds[0];
        for (let i = 1; i < preds.length; i++) {
          pLCA = getLCA(pLCA, preds[i]);
        }

        steps.push({
          type: 'CALC_LCA',
          curNode: u,
          preds: [...preds],
          lcaResult: pLCA,
          idomSnapshot: [...idom],
          treeEdges: [...treeEdges],
          message: `🔍 [前驱 LCA 计算] 节点 ${u} 的所有前驱节点为 [${preds.join(', ')}]，在支配树上的最近公共祖先 LCA 为 ${pLCA}！`,
        });

        idom[u] = pLCA;
        depth[u] = depth[pLCA] + 1;
        up[u][0] = pLCA;
        for (let i = 1; i <= 17; i++) up[u][i] = up[up[u][i - 1]][i - 1];
        treeEdges.push({ u: pLCA, v: u });

        steps.push({
          type: 'ADD_IDOM_EDGE',
          curNode: u,
          lcaResult: pLCA,
          idomSnapshot: [...idom],
          treeEdges: [...treeEdges],
          message: `🏛️ [挂载支配边] 确定直接支配点 idom[${u}] = ${pLCA}，在支配树中连边 ${pLCA} → ${u}！`,
        });
      }

      for (const v of adj[u]) {
        if (--inDegree[v] === 0) {
          q.push(v);
        }
      }
    }

    steps.push({
      type: 'ALL_DONE',
      idomSnapshot: [...idom],
      treeEdges: [...treeEdges],
      message: `🎉 [支配树构建完毕] DAG 支配树全部生成完成，清晰表达了所有控制流咽喉汇聚点！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#domtree-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: DOMINATOR_TREE_CODE_LANGUAGES,
      problemHtml: DOMINATOR_TREE_PROBLEM_HTML,
      analysisHtml: DOMINATOR_TREE_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-domtree-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-domtree-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-domtree-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.domtree-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_IF_ELSE_CFG';
        this.root?.querySelectorAll('.domtree-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-domtree-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        DomTreeAudio.isMuted = !DomTreeAudio.isMuted;
        soundBtn.textContent = DomTreeAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'TOPO_VISIT') DomTreeAudio.playTopo();
      else if (cur.type === 'CALC_LCA') DomTreeAudio.playLCA();
      else if (cur.type === 'ADD_IDOM_EDGE' || cur.type === 'ALL_DONE') DomTreeAudio.playConnect();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-domtree-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停构建';

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
    const playBtn = this.root?.querySelector('#btn-domtree-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动构建';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#domtree-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#domtree-status-badge') as HTMLElement | null;
    const idomBadge = this.root.querySelector('#domtree-idom-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = '🏁 支配树构建完成';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (idomBadge) {
      const idomList = cur.idomSnapshot
        .map((p, idx) => (idx > 1 && p > 0 ? `idom(${idx})=${p}` : null))
        .filter(Boolean);
      idomBadge.textContent = idomList.length > 0 ? idomList.join(' | ') : '初始根节点 1';
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

    // 中间虚线分隔
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(210, 0);
    ctx.lineTo(210, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // 区域标题
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('📊 原控制流图 (CFG DAG)', 10, 20);
    ctx.fillText('🏛️ 支配树 (Dominator Tree)', 220, 20);

    // 1. 绘制左侧 CFG 边
    this.cfgEdges.forEach((e) => {
      const p1 = this.cfgPositions[e.u];
      const p2 = this.cfgPositions[e.v];
      if (!p1 || !p2) return;

      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // 箭头
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      const arrowX = p2.x - 16 * Math.cos(angle);
      const arrowY = p2.y - 16 * Math.sin(angle);

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(arrowX - 7 * Math.cos(angle - Math.PI / 6), arrowY - 7 * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(arrowX - 7 * Math.cos(angle + Math.PI / 6), arrowY - 7 * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    });

    // 2. 绘制左侧 CFG 节点
    for (let i = 1; i <= this.n; i++) {
      const pos = this.cfgPositions[i];
      if (!pos) continue;

      const isCur = cur && cur.curNode === i;
      const isPred = cur && cur.preds && cur.preds.includes(i);

      ctx.save();
      let fillColor = '#1e293b';
      let strokeColor = i === this.rootNode ? '#10b981' : '#38bdf8';
      let radius = 14;

      if (isCur) {
        strokeColor = '#facc15';
        fillColor = '#854d0e';
        radius = 16 + Math.sin(this.pulseAnim) * 1.5;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
      } else if (isPred) {
        strokeColor = '#a855f7';
        fillColor = '#581c87';
      }

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.font = 'bold 10.5px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${i}`, pos.x, pos.y);
      ctx.restore();
    }

    // 3. 绘制右侧支配树边
    if (cur) {
      cur.treeEdges.forEach((e) => {
        const p1 = this.domPositions[e.u];
        const p2 = this.domPositions[e.v];
        if (!p1 || !p2) return;

        ctx.save();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      });

      // 4. 绘制右侧支配树节点
      for (let i = 1; i <= this.n; i++) {
        const pos = this.domPositions[i];
        if (!pos) continue;

        const isLCA = cur.lcaResult === i;
        const isCur = cur.curNode === i;

        ctx.save();
        let fillColor = '#1e293b';
        let strokeColor = i === this.rootNode ? '#10b981' : '#38bdf8';
        let radius = 14;

        if (isLCA) {
          strokeColor = '#facc15';
          fillColor = '#854d0e';
          radius = 16;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 10;
        } else if (isCur) {
          strokeColor = '#ec4899';
          fillColor = '#831843';
        }

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 10.5px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${i}`, pos.x, pos.y);
        ctx.restore();
      }
    }

    ctx.restore();
  }
}

export const DOMINATOR_TREE_TEMPLATE = `
  <div id="algo-dominator-tree-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🏛️</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">DAG 支配树 (Dominator Tree)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="domtree-preset-btn active" data-preset="CLASSIC_IF_ELSE_CFG" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">If-Else 菱形控制流</button>
          <button class="domtree-preset-btn" data-preset="MULTI_CONVERGE_GRAPH" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">多分支汇聚流图</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="domtree-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-domtree-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-domtree-autoplay" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(16,185,129,0.25);">▶️ 自动构建</button>
        <button id="btn-domtree-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-domtree-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #166534;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>🏛️ 直接支配点关系: <b id="domtree-idom-badge" style="color: #059669; font-size: 12px;">初始根节点 1</b></span>
      </div>
      <div id="domtree-narration-box" style="font-weight: 700; color: #14532d;">
        💡 准备就绪：拓扑序推进，计算前驱节点在支配树上的 LCA，增量挂载支配边！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：CFG 与 支配树 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="domtree-canvas" width="460" height="200" style="width: 460px; height: 200px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          左侧为 CFG 控制流图 | 右侧为动态生成的支配树 | 🟡 金色节点为 LCA 汇聚直接支配点 (idom)
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="domtree-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'dominator-tree',
  name: '支配树 (Dominator Tree)',
  viewId: 'algo-dominator-tree-view',
  category: 'graph',
  description: '编译原理与进阶图论算法：控制流图支配关系 (idom)、DAG 前驱节点支配树 LCA 定理、增量倍增支配树构建 (洛谷 P5180)',
  icon: '🏛️',
  template: DOMINATOR_TREE_TEMPLATE,
  Visualizer: DominatorTreeVisualizer,
  difficulty: 3,
  levelOrder: 56,
  learningGoal: '掌握支配关系数学定义、DAG 上 idom[u] = LCA_tree(preds) 定理证明与编译器 SSA 形式支配边界应用',
});
