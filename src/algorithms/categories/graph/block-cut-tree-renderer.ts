/**
 * 圆方树与点双连通分量 (Block-Cut Tree / Cactus Graph) 可视化引擎
 * 进阶图论: Tarjan 求点双连通分量 (v-BCC)、新建方点构建圆方二分树、所有简单路径并集转化 (洛谷 P4320 / P5236)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  BLOCK_CUT_TREE_CODE_LANGUAGES,
  BLOCK_CUT_TREE_PROBLEM_HTML,
  BLOCK_CUT_TREE_ANALYSIS_HTML,
} from './block-cut-tree-problem-content';

export interface BCTStep {
  type: 'DFS_VISIT' | 'DISCOVER_BCC' | 'BUILD_DONE' | 'QUERY_PATH';
  curNode?: number;
  squareId?: number;
  bccNodes?: number[];
  treeEdges: Array<{ u: number; v: number }>;
  pathNodes?: number[];
  message: string;
}

class BCTAudio {
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

  public static playDFS(): void {
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

  public static playSquareNode(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  public static playPathFound(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const chord = [523.25, 659.25, 783.99, 1046.5];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.14, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.25);
      });
    } catch {}
  }
}

export class BlockCutTreeVisualizer extends StepVisualizer<any> {
  // 原图与节点坐标 (1-indexed)
  private n = 5;
  private origEdges: Array<{ u: number; v: number }> = [];
  private origPositions: Array<{ x: number; y: number }> = [];
  private bctPositions: Record<number, { x: number; y: number }> = {};

  // 推演步骤
  private traceSteps: BCTStep[] = [];
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
    this.codeLanguages = BLOCK_CUT_TREE_CODE_LANGUAGES;
    this.codeLines = BLOCK_CUT_TREE_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '圆方树构建引擎 (Block-Cut Tree)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '圆方树构建' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CACTUS_DOUBLE_RING');
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

    if (presetKey === 'CACTUS_DOUBLE_RING') {
      this.n = 5;
      // 环 1: (1-2-3-1), 环 2: (3-4-5-3)，3 是割点
      this.origEdges = [
        { u: 1, v: 2 },
        { u: 2, v: 3 },
        { u: 3, v: 1 },
        { u: 3, v: 4 },
        { u: 4, v: 5 },
        { u: 5, v: 3 },
      ];
      this.origPositions = [
        { x: 0, y: 0 },
        { x: 40, y: 50 },  // 1
        { x: 40, y: 140 }, // 2
        { x: 100, y: 95 }, // 3 (割点)
        { x: 160, y: 50 }, // 4
        { x: 160, y: 140 },// 5
      ];
      this.bctPositions = {
        1: { x: 260, y: 35 },
        2: { x: 260, y: 155 },
        3: { x: 345, y: 95 }, // 割点圆点
        4: { x: 430, y: 35 },
        5: { x: 430, y: 155 },
        6: { x: 300, y: 95 }, // 方点 B1 (连 1, 2, 3)
        7: { x: 390, y: 95 }, // 方点 B2 (连 3, 4, 5)
      };
    } else if (presetKey === 'COMPLEX_BCC_GRAPH') {
      this.n = 6;
      // 块 1: (1-2-3-4-1, 1-3 cross), 割点 4, 块 2: (4-5-6-4)
      this.origEdges = [
        { u: 1, v: 2 },
        { u: 2, v: 3 },
        { u: 3, v: 4 },
        { u: 4, v: 1 },
        { u: 1, v: 3 },
        { u: 4, v: 5 },
        { u: 5, v: 6 },
        { u: 6, v: 4 },
      ];
      this.origPositions = [
        { x: 0, y: 0 },
        { x: 40, y: 50 },  // 1
        { x: 90, y: 40 },  // 2
        { x: 90, y: 140 }, // 3
        { x: 40, y: 130 }, // 4 (割点)
        { x: 150, y: 60 }, // 5
        { x: 150, y: 140 },// 6
      ];
      this.bctPositions = {
        1: { x: 250, y: 35 },
        2: { x: 280, y: 35 },
        3: { x: 250, y: 155 },
        4: { x: 340, y: 95 }, // 割点 4
        5: { x: 430, y: 50 },
        6: { x: 430, y: 140 },
        7: { x: 290, y: 95 }, // 方点 B1 (连 1,2,3,4)
        8: { x: 390, y: 95 }, // 方点 B2 (连 4,5,6)
      };
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const n = this.n;
    const adj: number[][] = Array.from({ length: n + 1 }, () => []);
    this.origEdges.forEach((e) => {
      adj[e.u].push(e.v);
      adj[e.v].push(e.u);
    });

    let dfnCnt = 0;
    let squareCnt = n;
    const dfn = Array(n + 1).fill(0);
    const low = Array(n + 1).fill(0);
    const st: number[] = [];
    const treeEdges: Array<{ u: number; v: number }> = [];

    const steps: BCTStep[] = [];

    steps.push({
      type: 'DFS_VISIT',
      curNode: 1,
      treeEdges: [],
      message: `🚀 初始化 Tarjan 算法：从节点 1 开始 DFS 遍历，探测无向图所有点双连通分量 (v-BCC)！`,
    });

    const tarjan = (u: number) => {
      dfn[u] = low[u] = ++dfnCnt;
      st.push(u);

      steps.push({
        type: 'DFS_VISIT',
        curNode: u,
        treeEdges: [...treeEdges],
        message: `🔍 DFS 访问圆点 ${u}，设置 dfn[${u}]=${dfn[u]}, low[${u}]=${low[u]}，压入回溯栈！`,
      });

      for (const v of adj[u]) {
        if (!dfn[v]) {
          tarjan(v);
          low[u] = Math.min(low[u], low[v]);

          if (low[v] >= dfn[u]) {
            squareCnt++;
            const sq = squareCnt;
            const bcc: number[] = [];

            while (true) {
              const top = st.pop()!;
              bcc.push(top);
              treeEdges.push({ u: top, v: sq });
              if (top === v) break;
            }
            bcc.push(u);
            treeEdges.push({ u: u, v: sq });

            steps.push({
              type: 'DISCOVER_BCC',
              curNode: u,
              squareId: sq,
              bccNodes: bcc,
              treeEdges: [...treeEdges],
              message: `🟩 发现点双连通块！low[${v}](${low[v]}) >= dfn[${u}](${dfn[u]})。新建方点 B${sq - n}，连接圆点 [${bcc.join(', ')}]！`,
            });
          }
        } else {
          low[u] = Math.min(low[u], dfn[v]);
        }
      }
    };

    for (let i = 1; i <= n; i++) {
      if (!dfn[i]) tarjan(i);
    }

    steps.push({
      type: 'BUILD_DONE',
      treeEdges: [...treeEdges],
      message: `🌳 圆方树构建完成！全图成功转化为圆点(⚪)与方点(🟩)严格交替的无环二分树！`,
    });

    // 路径查询演示：从 1 到 5
    const path = this.n === 5 ? [1, 6, 3, 7, 5] : [1, 7, 4, 8, 5];
    steps.push({
      type: 'QUERY_PATH',
      treeEdges: [...treeEdges],
      pathNodes: path,
      message: `✨ 路径查询演示：从节点 1 到 5。圆方树路径经过割点 3/4，代表原图中 1 到 5 的所有简单路径必经此割点！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#bct-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: BLOCK_CUT_TREE_CODE_LANGUAGES,
      problemHtml: BLOCK_CUT_TREE_PROBLEM_HTML,
      analysisHtml: BLOCK_CUT_TREE_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-bct-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-bct-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-bct-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.bct-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CACTUS_DOUBLE_RING';
        this.root?.querySelectorAll('.bct-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-bct-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        BCTAudio.isMuted = !BCTAudio.isMuted;
        soundBtn.textContent = BCTAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'DFS_VISIT') BCTAudio.playDFS();
      else if (cur.type === 'DISCOVER_BCC') BCTAudio.playSquareNode();
      else if (cur.type === 'QUERY_PATH') BCTAudio.playPathFound();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-bct-autoplay') as HTMLButtonElement | null;
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
    const playBtn = this.root?.querySelector('#btn-bct-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动构建';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#bct-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#bct-status-badge') as HTMLElement | null;
    const squareBadge = this.root.querySelector('#bct-square-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'BUILD_DONE' || cur.type === 'QUERY_PATH') {
        statusBadge.textContent = '🌳 圆方树构建就绪';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (squareBadge) {
      const squareCount = cur.treeEdges.reduce((acc, e) => Math.max(acc, e.u > this.n ? e.u - this.n : e.v > this.n ? e.v - this.n : 0), 0);
      squareBadge.textContent = `${squareCount} 个`;
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

    // 中间分割线
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
    ctx.fillText('🌵 原图 (Cactus / Graph)', 10, 20);
    ctx.fillText('🌳 圆方树 (Block-Cut Tree)', 220, 20);

    // 1. 绘制左侧原图连线
    this.origEdges.forEach((e) => {
      const p1 = this.origPositions[e.u];
      const p2 = this.origPositions[e.v];
      if (!p1 || !p2) return;

      ctx.save();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
    });

    // 2. 绘制左侧原图节点
    for (let i = 1; i <= this.n; i++) {
      const pos = this.origPositions[i];
      if (!pos) continue;

      const isCur = cur && cur.curNode === i;
      const isCut = i === (this.n === 5 ? 3 : 4);

      ctx.save();
      ctx.fillStyle = isCut ? '#f59e0b' : '#1e293b';
      ctx.strokeStyle = isCur ? '#38bdf8' : isCut ? '#fbbf24' : '#64748b';
      ctx.lineWidth = isCur ? 3 : 2;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${i}`, pos.x, pos.y);
      ctx.restore();
    }

    // 3. 绘制右侧圆方树连线
    if (cur) {
      cur.treeEdges.forEach((e) => {
        const p1 = this.bctPositions[e.u];
        const p2 = this.bctPositions[e.v];
        if (!p1 || !p2) return;

        const isPathEdge = cur.pathNodes && cur.pathNodes.includes(e.u) && cur.pathNodes.includes(e.v);

        ctx.save();
        ctx.strokeStyle = isPathEdge ? '#facc15' : '#38bdf8';
        ctx.lineWidth = isPathEdge ? 3.5 : 2;
        if (isPathEdge) {
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 10;
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      });

      // 4. 绘制右侧圆方树节点 (圆点与方点)
      for (const [idStr, pos] of Object.entries(this.bctPositions)) {
        const id = parseInt(idStr, 10);
        const isSquare = id > this.n;
        const squareIdx = id - this.n;
        const isPath = cur.pathNodes && cur.pathNodes.includes(id);

        ctx.save();
        if (isSquare) {
          // 方点 🟩
          ctx.fillStyle = isPath ? '#15803d' : '#166534';
          ctx.strokeStyle = isPath ? '#facc15' : '#22c55e';
          ctx.lineWidth = 2.5;

          ctx.beginPath();
          ctx.rect(pos.x - 12, pos.y - 12, 24, 24);
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`B${squareIdx}`, pos.x, pos.y);
        } else {
          // 圆点 ⚪
          ctx.fillStyle = isPath ? '#1e3a8a' : '#1e293b';
          ctx.strokeStyle = isPath ? '#facc15' : '#38bdf8';
          ctx.lineWidth = 2.5;

          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 13, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${id}`, pos.x, pos.y);
        }
        ctx.restore();
      }
    }

    ctx.restore();
  }
}

export const BLOCK_CUT_TREE_TEMPLATE = `
  <div id="algo-block-cut-tree-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🌵</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">圆方树与点双缩点 (Block-Cut Tree)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="bct-preset-btn active" data-preset="CACTUS_DOUBLE_RING" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">仙人掌双环图</button>
          <button class="bct-preset-btn" data-preset="COMPLEX_BCC_GRAPH" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">复杂点双连通图</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="bct-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-bct-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-bct-autoplay" style="background: linear-gradient(135deg, #059669, #10b981); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(16,185,129,0.25);">▶️ 自动构建</button>
        <button id="btn-bct-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-bct-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #166534;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>🟩 方点数量: <b id="bct-square-badge" style="color: #059669; font-size: 12px;">0 个</b></span>
      </div>
      <div id="bct-narration-box" style="font-weight: 700; color: #14532d;">
        💡 准备就绪：Tarjan 点双缩点，圆点(⚪)与方点(🟩)构建二分树！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：原图与圆方树 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="bct-canvas" width="460" height="200" style="width: 460px; height: 200px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          ⚪ 圆形为原图节点 | 🟩 方形为点双连通块虚拟方点 | 🌟 金色为路径必经点
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="bct-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'block-cut-tree',
  name: '圆方树 (Block-Cut Tree)',
  viewId: 'algo-block-cut-tree-view',
  category: 'graph',
  description: '进阶图论仙人掌与一般图转化算法：Tarjan 点双连通分量 (v-BCC)、方点创建、圆方二分树构建与两点简单路径并集查询 (洛谷 P4320 / P5236)',
  icon: '🌵',
  template: BLOCK_CUT_TREE_TEMPLATE,
  Visualizer: BlockCutTreeVisualizer,
  difficulty: 3,
  levelOrder: 49,
  learningGoal: '掌握点双连通分量概念、Tarjan low[v] >= dfn[u] 缩点判定、圆方树几何路径等价性质与静态仙人掌 DP 转换思路',
});
