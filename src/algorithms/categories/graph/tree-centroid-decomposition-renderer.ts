/**
 * 树上重心点分治 (Tree Centroid Decomposition) 可视化引擎
 * 参考左程云《算法通关课》进阶图论: 树的重心定位、O(log n) 分治层数、跨重心路径双指针统计与容斥原理 (洛谷 P3806)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  TREE_CENTROID_CODE_LANGUAGES,
  TREE_CENTROID_PROBLEM_HTML,
  TREE_CENTROID_ANALYSIS_HTML,
} from './tree-centroid-decomposition-problem-content';

export interface CentroidStep {
  type: 'FIND_CENTROID' | 'COLLECT_PATHS' | 'DIVIDE_SUBTREES' | 'ALL_DONE';
  centroid?: number;
  activeComponent?: number[];
  visitedNodes?: number[]; // 已隔离的重心点
  maxSubtreeSnapshot?: Record<number, number>;
  distsSnapshot?: Array<{ node: number; dist: number; subroot: number }>;
  validPairsCount?: number;
  message: string;
}

class CentroidAudio {
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

  public static playScan(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }

  public static playCentroid(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  public static playDivide(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
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
        osc.type = 'sine';
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

export class TreeCentroidVisualizer extends StepVisualizer<any> {
  // 树数据 (1-indexed)
  private n = 7;
  private adj: Array<Array<{ to: number; w: number }>> = [];
  private nodePositions: Array<{ x: number; y: number }> = [];

  // 推演步骤
  private traceSteps: CentroidStep[] = [];
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
    this.codeLanguages = TREE_CENTROID_CODE_LANGUAGES;
    this.codeLines = TREE_CENTROID_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '点分治 Centroid 引擎 (洛谷 P3806)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '树上点分治' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_7_CENTROID');
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

    if (presetKey === 'CLASSIC_7_CENTROID') {
      this.n = 7;
      this.adj = [
        [],
        [{ to: 2, w: 2 }, { to: 3, w: 3 }],
        [{ to: 1, w: 2 }, { to: 4, w: 1 }, { to: 5, w: 4 }],
        [{ to: 1, w: 3 }, { to: 6, w: 2 }, { to: 7, w: 5 }],
        [{ to: 2, w: 1 }],
        [{ to: 2, w: 4 }],
        [{ to: 3, w: 2 }],
        [{ to: 3, w: 5 }],
      ];
      this.nodePositions = [
        { x: 0, y: 0 },
        { x: 230, y: 35 },
        { x: 120, y: 85 },
        { x: 340, y: 85 },
        { x: 70, y: 135 },
        { x: 170, y: 135 },
        { x: 290, y: 135 },
        { x: 390, y: 135 },
      ];
    } else if (presetKey === 'STAR_CHAIN_8_NODES') {
      this.n = 8;
      this.adj = [
        [],
        [{ to: 2, w: 1 }, { to: 3, w: 2 }, { to: 4, w: 3 }],
        [{ to: 1, w: 1 }, { to: 5, w: 1 }],
        [{ to: 1, w: 2 }, { to: 6, w: 2 }],
        [{ to: 1, w: 3 }, { to: 7, w: 1 }, { to: 8, w: 2 }],
        [{ to: 2, w: 1 }],
        [{ to: 3, w: 2 }],
        [{ to: 4, w: 1 }],
        [{ to: 4, w: 2 }],
      ];
      this.nodePositions = [
        { x: 0, y: 0 },
        { x: 230, y: 40 },
        { x: 110, y: 80 },
        { x: 230, y: 95 },
        { x: 350, y: 80 },
        { x: 70, y: 135 },
        { x: 230, y: 145 },
        { x: 310, y: 135 },
        { x: 390, y: 135 },
      ];
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const n = this.n;
    const vis: boolean[] = Array(n + 1).fill(false);
    const sz: number[] = Array(n + 1).fill(0);
    const maxSubtree: number[] = Array(n + 1).fill(0);

    const steps: CentroidStep[] = [];
    const visitedNodes: number[] = [];

    // 递归分治模拟
    const solveComponent = (startNode: number, compNodes: number[]) => {
      let root = 0;
      let minMaxPart = Infinity;
      const totalNodes = compNodes.length;

      // 找重心
      const getCentroid = (u: number, p: number) => {
        sz[u] = 1;
        maxSubtree[u] = 0;
        for (const edge of this.adj[u]) {
          const v = edge.to;
          if (v !== p && !vis[v] && compNodes.includes(v)) {
            getCentroid(v, u);
            sz[u] += sz[v];
            maxSubtree[u] = Math.max(maxSubtree[u], sz[v]);
          }
        }
        maxSubtree[u] = Math.max(maxSubtree[u], totalNodes - sz[u]);
        if (maxSubtree[u] < minMaxPart) {
          minMaxPart = maxSubtree[u];
          root = u;
        }
      };

      getCentroid(startNode, 0);

      const maxSubtreeMap: Record<number, number> = {};
      compNodes.forEach((node) => {
        maxSubtreeMap[node] = maxSubtree[node];
      });

      steps.push({
        type: 'FIND_CENTROID',
        centroid: root,
        activeComponent: [...compNodes],
        visitedNodes: [...visitedNodes],
        maxSubtreeSnapshot: { ...maxSubtreeMap },
        message: `👑 [定位重心] 在当前规模为 ${totalNodes} 的连通块中，节点 N${root} 的最大分裂子树为 ${minMaxPart} (≤ ${Math.floor(totalNodes / 2)})，成功锁定为分治重心！`,
      });

      // 收集距离
      const dists: Array<{ node: number; dist: number; subroot: number }> = [];
      dists.push({ node: root, dist: 0, subroot: root });

      for (const edge of this.adj[root]) {
        const v = edge.to;
        if (!vis[v] && compNodes.includes(v)) {
          const dfsDist = (cur: number, p: number, d: number) => {
            dists.push({ node: cur, dist: d, subroot: v });
            for (const nxt of this.adj[cur]) {
              if (nxt.to !== p && !vis[nxt.to] && compNodes.includes(nxt.to)) {
                dfsDist(nxt.to, cur, d + nxt.w);
              }
            }
          };
          dfsDist(v, root, edge.w);
        }
      }

      steps.push({
        type: 'COLLECT_PATHS',
        centroid: root,
        activeComponent: [...compNodes],
        visitedNodes: [...visitedNodes],
        distsSnapshot: dists,
        message: `📊 [跨重心路径统计] 遍历重心 N${root} 各分支子树，收集子树节点到重心的测地距离，并执行双指针容斥合并！`,
      });

      // 隔离当前重心
      vis[root] = true;
      visitedNodes.push(root);

      steps.push({
        type: 'DIVIDE_SUBTREES',
        centroid: root,
        activeComponent: [...compNodes],
        visitedNodes: [...visitedNodes],
        message: `✂️ [重心隔离与递归] 隔离重心 N${root}，树形结构自然分裂为若干个独立子树，进入下一层分治！`,
      });

      // 递归子树
      for (const edge of this.adj[root]) {
        const v = edge.to;
        if (!vis[v] && compNodes.includes(v)) {
          const subComp: number[] = [];
          const collectComp = (cur: number, p: number) => {
            subComp.push(cur);
            for (const nxt of this.adj[cur]) {
              if (nxt.to !== p && !vis[nxt.to] && compNodes.includes(nxt.to)) {
                collectComp(nxt.to, cur);
              }
            }
          };
          collectComp(v, root);
          if (subComp.length > 1) {
            solveComponent(v, subComp);
          } else if (subComp.length === 1) {
            visitedNodes.push(subComp[0]);
          }
        }
      }
    };

    const allNodes = Array.from({ length: n }, (_, i) => i + 1);
    solveComponent(1, allNodes);

    steps.push({
      type: 'ALL_DONE',
      visitedNodes: Array.from({ length: n }, (_, i) => i + 1),
      message: `🏁 点分治推演完毕！全树分治层数严格为 O(log n)，所有跨子树点对路径均已被高效统计完毕！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#centroid-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: TREE_CENTROID_CODE_LANGUAGES,
      problemHtml: TREE_CENTROID_PROBLEM_HTML,
      analysisHtml: TREE_CENTROID_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-centroid-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-centroid-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-centroid-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.centroid-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_7_CENTROID';
        this.root?.querySelectorAll('.centroid-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-centroid-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        CentroidAudio.isMuted = !CentroidAudio.isMuted;
        soundBtn.textContent = CentroidAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'FIND_CENTROID') CentroidAudio.playCentroid();
      else if (cur.type === 'COLLECT_PATHS') CentroidAudio.playScan();
      else if (cur.type === 'DIVIDE_SUBTREES') CentroidAudio.playDivide();
      else if (cur.type === 'ALL_DONE') CentroidAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-centroid-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停分治';

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
    const playBtn = this.root?.querySelector('#btn-centroid-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动分治';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#centroid-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#centroid-status-badge') as HTMLElement | null;
    const distPanel = this.root.querySelector('#centroid-dist-panel') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = '🎯 点分治完成 (O(N log N))';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (distPanel) {
      if (cur.distsSnapshot && cur.distsSnapshot.length > 0) {
        const items = cur.distsSnapshot
          .map((d) => `
            <div style="background: #1e293b; border: 1px solid #38bdf8; border-radius: 4px; padding: 2px 6px; font-size: 10px; color: #ffffff;">
              <b>N${d.node}</b>: dist=${d.dist}
            </div>
          `)
          .join('');
        distPanel.innerHTML = items;
      } else {
        distPanel.innerHTML = '<span style="font-size: 10px; color: #94a3b8;">暂无测地路径数据</span>';
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
    for (let u = 1; u <= this.n; u++) {
      const p1 = this.nodePositions[u];
      if (!p1) continue;

      for (const edge of this.adj[u]) {
        const v = edge.to;
        if (v <= u) continue;
        const p2 = this.nodePositions[v];
        if (!p2) continue;

        const isVisU = cur && cur.visitedNodes && cur.visitedNodes.includes(u);
        const isVisV = cur && cur.visitedNodes && cur.visitedNodes.includes(v);
        const isCut = (isVisU && !isVisV) || (!isVisU && isVisV);

        ctx.save();
        if (isCut) {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)'; // 切断红虚线
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
        } else if (isVisU && isVisV) {
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1;
        } else {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // 边权
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = isCut ? '#ef4444' : '#94a3b8';
        ctx.fillText(`${edge.w}`, midX, midY - 2);

        ctx.restore();
      }
    }

    // 2. 绘制节点
    for (let i = 1; i <= this.n; i++) {
      const pos = this.nodePositions[i];
      if (!pos) continue;

      const isCentroid = cur && cur.centroid === i;
      const isVisited = cur && cur.visitedNodes && cur.visitedNodes.includes(i);
      const inComp = cur && cur.activeComponent && cur.activeComponent.includes(i);

      ctx.save();
      let radius = 16;
      let strokeColor = '#475569';
      let fillColor = '#1e293b';

      if (isCentroid) {
        strokeColor = '#facc15';
        fillColor = '#854d0e';
        radius = 19 + Math.sin(this.pulseAnim) * 2;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 15;
      } else if (isVisited) {
        strokeColor = '#334155';
        fillColor = '#0f172a';
      } else if (inComp) {
        strokeColor = '#38bdf8';
        fillColor = '#0369a1';
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
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isCentroid ? `👑N${i}` : `N${i}`, pos.x, pos.y - 3);

      // 最大子树信息
      const maxSub = cur && cur.maxSubtreeSnapshot ? cur.maxSubtreeSnapshot[i] : null;
      ctx.font = '8px monospace';
      ctx.fillStyle = isCentroid ? '#fef08a' : '#94a3b8';
      ctx.fillText(maxSub !== undefined && maxSub !== null ? `max:${maxSub}` : '', pos.x, pos.y + 7);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const TREE_CENTROID_TEMPLATE = `
  <div id="algo-tree-centroid-decomposition-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">👑</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">树上点分治 (Centroid Decomposition)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="centroid-preset-btn active" data-preset="CLASSIC_7_CENTROID" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">7 节点标准树</button>
          <button class="centroid-preset-btn" data-preset="STAR_CHAIN_8_NODES" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">8 节点星链树</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="centroid-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-centroid-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步分治</button>
        <button id="btn-centroid-autoplay" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(2,132,199,0.25);">▶️ 自动分治</button>
        <button id="btn-centroid-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-centroid-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #0369a1;">
      <div id="centroid-narration-box" style="font-weight: 700; color: #075985;">
        💡 准备就绪：定位重心最大子树 ≤ N/2，跨重心路径双指针合并与容斥去重！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：树形网络 Canvas 与 测地路径面板 -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="centroid-canvas" width="460" height="170" style="width: 460px; height: 170px;"></canvas>
        </div>

        <!-- 测地路径与距离面板 -->
        <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px;">
          <div style="font-size: 10.5px; font-weight: 700; color: #0f172a;">📊 当前重心跨子树测地距离收集面板:</div>
          <div id="centroid-dist-panel" style="display: flex; gap: 6px; overflow-x: auto; min-height: 32px; align-items: center;"></div>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          👑 金色皇冠为当前重心 | 🔵 蓝色为当前分治连通块 | 🔴 红色虚线为已切断的跨重心连边
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="centroid-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'tree-centroid-decomposition',
  name: '树上点分治 (Centroid Decomposition)',
  viewId: 'algo-tree-centroid-decomposition-view',
  category: 'graph',
  description: '树上高效路径统计算法：左程云进阶图论树上重心寻找、O(log n) 分治层数、跨重心路径双指针合并与容斥去重 (洛谷 P3806)',
  icon: '👑',
  template: TREE_CENTROID_TEMPLATE,
  Visualizer: TreeCentroidVisualizer,
  difficulty: 3,
  levelOrder: 43,
  learningGoal: '掌握树的重心性质与定位算法、跨重心路径与子树内部路径分类、双指针容斥去重以及严格 O(n log n) 复杂度证明',
});
