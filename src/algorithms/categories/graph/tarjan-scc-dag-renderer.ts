/**
 * 有向图强连通分量 (SCC) 与 Tarjan 缩点建 DAG (Strongly Connected Components) 可视化引擎
 * 参考左程云《算法通关课》class066: DFN/LOW 追溯、栈维护分量、缩点转化为 DAG (洛谷 P3387)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  TARJAN_SCC_DAG_CODE_LANGUAGES,
  TARJAN_SCC_DAG_PROBLEM_HTML,
  TARJAN_SCC_DAG_ANALYSIS_HTML,
} from './tarjan-scc-dag-problem-content';

export interface TarjanSCCStep {
  type: 'VISIT_NODE' | 'UPDATE_LOW_TREE' | 'UPDATE_LOW_BACK' | 'POP_SCC' | 'ALL_DONE';
  curNode?: number;
  neighbor?: number;
  dfnSnapshot: number[];
  lowSnapshot: number[];
  stackSnapshot: number[];
  sccIdSnapshot: number[];
  poppedNodes?: number[];
  sccCount: number;
  message: string;
}

const SCC_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

class TarjanSCCAudio {
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

  public static playDfs(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {}
  }

  public static playPop(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(987.77, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  public static playWin(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.3);
      });
    } catch {}
  }
}

export class TarjanSCCDAGVisualizer extends StepVisualizer<any> {
  // 图数据 (1-indexed)
  private n = 6;
  private adj: number[][] = [];
  private nodePositions: Array<{ x: number; y: number }> = [];

  // 推演步骤
  private traceSteps: TarjanSCCStep[] = [];
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
    this.codeLanguages = TARJAN_SCC_DAG_CODE_LANGUAGES;
    this.codeLines = TARJAN_SCC_DAG_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = 'Tarjan 强连通分量与 DAG 缩点引擎 (洛谷 P3387)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: 'Tarjan SCC 缩点' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_TWO_SCC');
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

    if (presetKey === 'CLASSIC_TWO_SCC') {
      // 1 -> 2 -> 3 -> 1 (SCC 1), 2 -> 4 -> 5 -> 6 -> 4 (SCC 2: 4,5,6)
      this.n = 6;
      this.adj = [
        [],
        [2],       // 1 -> 2
        [3, 4],    // 2 -> 3, 4
        [1],       // 3 -> 1
        [5],       // 4 -> 5
        [6],       // 5 -> 6
        [4],       // 6 -> 4
      ];
      this.nodePositions = [
        { x: 0, y: 0 },
        { x: 70, y: 70 },   // 1
        { x: 170, y: 70 },  // 2
        { x: 120, y: 160 }, // 3
        { x: 270, y: 70 },  // 4
        { x: 370, y: 70 },  // 5
        { x: 320, y: 160 }, // 6
      ];
    } else if (presetKey === 'BIG_CYCLE_NEST') {
      this.n = 5;
      this.adj = [
        [],
        [2],
        [3],
        [4, 1],
        [5],
        [4],
      ];
      this.nodePositions = [
        { x: 0, y: 0 },
        { x: 80, y: 115 },
        { x: 180, y: 55 },
        { x: 260, y: 115 },
        { x: 350, y: 70 },
        { x: 350, y: 160 },
      ];
    } else if (presetKey === 'PURE_DAG') {
      this.n = 4;
      this.adj = [
        [],
        [2, 3],
        [4],
        [4],
        [],
      ];
      this.nodePositions = [
        { x: 0, y: 0 },
        { x: 80, y: 115 },
        { x: 200, y: 65 },
        { x: 200, y: 165 },
        { x: 340, y: 115 },
      ];
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const n = this.n;
    let timer = 0;
    let sccCount = 0;
    const dfn: number[] = Array(n + 1).fill(0);
    const low: number[] = Array(n + 1).fill(0);
    const sccId: number[] = Array(n + 1).fill(0);
    const inStack: boolean[] = Array(n + 1).fill(false);
    const stk: number[] = [];

    const steps: TarjanSCCStep[] = [];

    const cloneDfn = () => [...dfn];
    const cloneLow = () => [...low];
    const cloneStk = () => [...stk];
    const cloneScc = () => [...sccId];

    const tarjan = (u: number) => {
      timer++;
      dfn[u] = low[u] = timer;
      stk.push(u);
      inStack[u] = true;

      steps.push({
        type: 'VISIT_NODE',
        curNode: u,
        dfnSnapshot: cloneDfn(),
        lowSnapshot: cloneLow(),
        stackSnapshot: cloneStk(),
        sccIdSnapshot: cloneScc(),
        sccCount,
        message: `🧭 访问节点 N${u}：压入活动调用栈，分配时间戳 dfn[${u}] = low[${u}] = ${timer}。`,
      });

      for (const v of this.adj[u]) {
        if (!dfn[v]) {
          tarjan(v);
          low[u] = Math.min(low[u], low[v]);
          steps.push({
            type: 'UPDATE_LOW_TREE',
            curNode: u,
            neighbor: v,
            dfnSnapshot: cloneDfn(),
            lowSnapshot: cloneLow(),
            stackSnapshot: cloneStk(),
            sccIdSnapshot: cloneScc(),
            sccCount,
            message: `🌲 从树边 N${v} 回溯到 N${u}：更新 low[${u}] = min(low[${u}], low[${v}]) = ${low[u]}。`,
          });
        } else if (inStack[v]) {
          low[u] = Math.min(low[u], dfn[v]);
          steps.push({
            type: 'UPDATE_LOW_BACK',
            curNode: u,
            neighbor: v,
            dfnSnapshot: cloneDfn(),
            lowSnapshot: cloneLow(),
            stackSnapshot: cloneStk(),
            sccIdSnapshot: cloneScc(),
            sccCount,
            message: `↩️ 发现回向边 N${u} → N${v}（仍在栈中形成环）：更新 low[${u}] = min(low[${u}], dfn[${v}]) = ${low[u]}。`,
          });
        }
      }

      if (low[u] === dfn[u]) {
        sccCount++;
        const popped: number[] = [];
        while (true) {
          const node = stk.pop()!;
          inStack[node] = false;
          sccId[node] = sccCount;
          popped.push(node);
          if (node === u) break;
        }

        steps.push({
          type: 'POP_SCC',
          curNode: u,
          poppedNodes: popped,
          dfnSnapshot: cloneDfn(),
          lowSnapshot: cloneLow(),
          stackSnapshot: cloneStk(),
          sccIdSnapshot: cloneScc(),
          sccCount,
          message: `🎉 [触发 SCC 闭环！] 节点 N${u} 满足 low == dfn == ${dfn[u]}！弹出栈内节点 [${popped.map((p) => 'N' + p).join(', ')}]，凝聚为超级分量 SCC #${sccCount}！`,
        });
      }
    };

    for (let i = 1; i <= n; i++) {
      if (!dfn[i]) tarjan(i);
    }

    steps.push({
      type: 'ALL_DONE',
      dfnSnapshot: cloneDfn(),
      lowSnapshot: cloneLow(),
      stackSnapshot: cloneStk(),
      sccIdSnapshot: cloneScc(),
      sccCount,
      message: `🏁 Tarjan SCC 缩点完成！全图共凝聚出 ${sccCount} 个强连通分量，成功转化为严格 DAG！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#tarjan-scc-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: TARJAN_SCC_DAG_CODE_LANGUAGES,
      problemHtml: TARJAN_SCC_DAG_PROBLEM_HTML,
      analysisHtml: TARJAN_SCC_DAG_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-scc-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-scc-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-scc-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.scc-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_TWO_SCC';
        this.root?.querySelectorAll('.scc-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-scc-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        TarjanSCCAudio.isMuted = !TarjanSCCAudio.isMuted;
        soundBtn.textContent = TarjanSCCAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'VISIT_NODE' || cur.type === 'UPDATE_LOW_TREE') TarjanSCCAudio.playDfs();
      else if (cur.type === 'POP_SCC') TarjanSCCAudio.playPop();
      else if (cur.type === 'ALL_DONE') TarjanSCCAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-scc-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停推演';

    const step = () => {
      if (!this.isAutoPlaying) return;
      if (this.currentStepPtr < this.traceSteps.length - 1) {
        this.stepForward();
        this.autoPlayTimer = setTimeout(step, 750 / this.playSpeed);
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
    const playBtn = this.root?.querySelector('#btn-scc-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动推演';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#scc-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#scc-status-badge') as HTMLElement | null;
    const stackBox = this.root.querySelector('#scc-stack-box') as HTMLElement | null;
    const sccCountBadge = this.root.querySelector('#scc-count-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = `🎯 缩点完成 (${cur.sccCount} 个 SCC)`;
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (sccCountBadge) {
      sccCountBadge.textContent = `${cur.sccCount} 个`;
    }

    if (stackBox) {
      stackBox.innerHTML = cur.stackSnapshot.length === 0
        ? '<span style="color: #94a3b8; font-size: 11px;">[空栈]</span>'
        : cur.stackSnapshot
            .map((node) => `<span style="background: #1e293b; color: #38bdf8; font-weight: bold; padding: 2px 6px; border-radius: 4px; font-size: 11px; border: 1px solid #334155;">N${node}</span>`)
            .join(' ➔ ');
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

    // 1. 绘制有向边
    for (let u = 1; u <= this.n; u++) {
      const p1 = this.nodePositions[u];
      if (!p1) continue;

      for (const v of this.adj[u]) {
        const p2 = this.nodePositions[v];
        if (!p2) continue;

        const isCurrentRay = cur && cur.curNode === u && cur.neighbor === v;

        ctx.save();
        if (isCurrentRay) {
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 12;
        } else {
          ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
          ctx.lineWidth = 2;
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // 绘制箭头
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const arrowDist = 22;
        const arrowX = p2.x - Math.cos(angle) * arrowDist;
        const arrowY = p2.y - Math.sin(angle) * arrowDist;

        ctx.fillStyle = isCurrentRay ? '#facc15' : '#64748b';
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - 8 * Math.cos(angle - Math.PI / 6), arrowY - 8 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(arrowX - 8 * Math.cos(angle + Math.PI / 6), arrowY - 8 * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }
    }

    // 2. 绘制节点
    for (let i = 1; i <= this.n; i++) {
      const pos = this.nodePositions[i];
      if (!pos) continue;

      const dfnVal = cur ? cur.dfnSnapshot[i] : 0;
      const lowVal = cur ? cur.lowSnapshot[i] : 0;
      const scc = cur ? cur.sccIdSnapshot[i] : 0;
      const isCur = cur && cur.curNode === i;

      ctx.save();
      let radius = 20;
      let fillColor = '#1e293b';
      let strokeColor = '#475569';

      if (scc > 0) {
        fillColor = SCC_COLORS[(scc - 1) % SCC_COLORS.length];
        strokeColor = '#ffffff';
      }

      if (isCur) {
        strokeColor = '#facc15';
        radius = 23 + Math.sin(this.pulseAnim) * 2;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 14;
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
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`N${i}`, pos.x, pos.y - 4);

      // dfn/low
      ctx.font = '8.5px monospace';
      ctx.fillStyle = dfnVal > 0 ? '#38bdf8' : '#64748b';
      ctx.fillText(dfnVal > 0 ? `[${dfnVal}/${lowVal}]` : '[--/--]', pos.x, pos.y + 8);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const TARJAN_SCC_DAG_TEMPLATE = `
  <div id="algo-tarjan-scc-dag-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🔄</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">Tarjan 强连通分量与 DAG 缩点 (SCC)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="scc-preset-btn active" data-preset="CLASSIC_TWO_SCC" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典双环图</button>
          <button class="scc-preset-btn" data-preset="BIG_CYCLE_NEST" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">环套环拓扑</button>
          <button class="scc-preset-btn" data-preset="PURE_DAG" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">纯无环 DAG</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="scc-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-scc-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步 DFS</button>
        <button id="btn-scc-autoplay" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(59,130,246,0.25);">▶️ 自动推演</button>
        <button id="btn-scc-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-scc-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #1e40af;">
      <div style="display: flex; gap: 14px; align-items: center;">
        <span>🎯 已生成 SCC: <b id="scc-count-badge" style="color: #2563eb; font-size: 12px;">0 个</b></span>
        <span>📥 活动栈: <span id="scc-stack-box"></span></span>
      </div>
      <div id="scc-narration-box" style="font-weight: 700; color: #1e3a8a;">
        💡 准备就绪：DFS 遍历有向图，追溯 DFN 与 LOW 值，闭合强连通分量即时出栈缩点！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：网络拓扑 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="tarjan-scc-canvas" width="460" height="230" style="width: 460px; height: 230px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🔵 节点角标为 [dfn/low] 时间戳与追溯值 | 🌈 相同背景色节点属于同一 SCC 超级分量
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="scc-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'tarjan-scc-dag',
  name: 'Tarjan 强连通分量与 DAG 缩点 (Tarjan SCC)',
  viewId: 'algo-tarjan-scc-dag-view',
  category: 'graph',
  description: '有向图强连通分量与缩点算法：左程云 class066 Tarjan SCC 算法、DFN/LOW 追溯、栈维护分量与 DAG 缩点转化 (洛谷 P3387)',
  icon: '🔄',
  template: TARJAN_SCC_DAG_TEMPLATE,
  Visualizer: TarjanSCCDAGVisualizer,
  difficulty: 3,
  levelOrder: 36,
  learningGoal: '掌握有向图 Tarjan SCC 算法的栈维护机制、inStack 判定法则以及缩点将任意有向图转化为纯净 DAG 的工程应用',
});
