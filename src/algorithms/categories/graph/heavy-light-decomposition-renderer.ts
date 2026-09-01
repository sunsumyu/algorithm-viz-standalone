/**
 * 树链剖分 (Heavy-Light Decomposition - HLD) 可视化引擎
 * 参考左程云《算法通关课》进阶图论: 重儿子划分、重链顶端 top[]、DFS 序连续拍平与 O(log^2 n) 树上路径跳跃 (洛谷 P3384)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  HLD_CODE_LANGUAGES,
  HLD_PROBLEM_HTML,
  HLD_ANALYSIS_HTML,
} from './heavy-light-decomposition-problem-content';

export interface HLDStep {
  type: 'DFS1_SIZE' | 'DFS2_TOP' | 'JUMP_PATH' | 'ALL_DONE';
  curNode?: number;
  depthSnapshot: number[];
  sizeSnapshot: number[];
  sonSnapshot: number[];
  topSnapshot: number[];
  dfnSnapshot: number[];
  activeSegments?: Array<[number, number]>;
  activePath?: number[];
  message: string;
}

const CHAIN_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4'];

class HLDAudio {
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
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {}
  }

  public static playJump(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
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
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.25);
      });
    } catch {}
  }
}

export class HeavyLightDecompositionVisualizer extends StepVisualizer<any> {
  // 树数据 (1-indexed)
  private n = 7;
  private adj: number[][] = [];
  private nodePositions: Array<{ x: number; y: number }> = [];

  // 推演步骤
  private traceSteps: HLDStep[] = [];
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
    this.codeLanguages = HLD_CODE_LANGUAGES;
    this.codeLines = HLD_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '树链剖分 HLD 引擎 (洛谷 P3384)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '树链剖分' }];
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
      this.adj = [
        [],
        [2, 3],       // 1 -> 2, 3
        [1, 4, 5],    // 2 -> 1, 4, 5
        [1, 6, 7],    // 3 -> 1, 6, 7
        [2],          // 4
        [2],          // 5
        [3],          // 6
        [3],          // 7
      ];
      this.nodePositions = [
        { x: 0, y: 0 },
        { x: 230, y: 35 },  // 1 (根)
        { x: 120, y: 85 },  // 2
        { x: 340, y: 85 },  // 3
        { x: 70, y: 135 },  // 4
        { x: 170, y: 135 }, // 5
        { x: 290, y: 135 }, // 6
        { x: 390, y: 135 }, // 7
      ];
    } else if (presetKey === 'DEEP_SLANTED_TREE') {
      this.n = 6;
      this.adj = [
        [],
        [2, 3],
        [1, 4],
        [1],
        [2, 5],
        [4, 6],
        [5],
      ];
      this.nodePositions = [
        { x: 0, y: 0 },
        { x: 200, y: 30 },
        { x: 150, y: 70 },
        { x: 300, y: 70 },
        { x: 150, y: 110 },
        { x: 150, y: 145 },
        { x: 150, y: 175 },
      ];
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const n = this.n;
    const parent: number[] = Array(n + 1).fill(0);
    const depth: number[] = Array(n + 1).fill(0);
    const size: number[] = Array(n + 1).fill(0);
    const son: number[] = Array(n + 1).fill(0);
    const top: number[] = Array(n + 1).fill(0);
    const dfn: number[] = Array(n + 1).fill(0);
    let timer = 0;

    const steps: HLDStep[] = [];

    const cloneD = () => [...depth];
    const cloneSz = () => [...size];
    const cloneSon = () => [...son];
    const cloneTop = () => [...top];
    const cloneDfn = () => [...dfn];

    // DFS 1: 统计 size, depth, son
    const dfs1 = (u: number, p: number, d: number) => {
      parent[u] = p;
      depth[u] = d;
      size[u] = 1;

      for (const v of this.adj[u]) {
        if (v !== p) {
          dfs1(v, u, d + 1);
          size[u] += size[v];
          if (son[u] === 0 || size[v] > size[son[u]]) {
            son[u] = v;
          }
        }
      }

      steps.push({
        type: 'DFS1_SIZE',
        curNode: u,
        depthSnapshot: cloneD(),
        sizeSnapshot: cloneSz(),
        sonSnapshot: cloneSon(),
        topSnapshot: cloneTop(),
        dfnSnapshot: cloneDfn(),
        message: `🧭 [第一次 DFS] 节点 N${u}：子树大小 size = ${size[u]}，重儿子锁定为 N${son[u] || '无'}。`,
      });
    };

    dfs1(1, 0, 1);

    // DFS 2: 确定 top 与 dfn
    const dfs2 = (u: number, t: number) => {
      top[u] = t;
      timer++;
      dfn[u] = timer;

      steps.push({
        type: 'DFS2_TOP',
        curNode: u,
        depthSnapshot: cloneD(),
        sizeSnapshot: cloneSz(),
        sonSnapshot: cloneSon(),
        topSnapshot: cloneTop(),
        dfnSnapshot: cloneDfn(),
        message: `🎋 [第二次 DFS] 节点 N${u}：分配连续 DFS 序 dfn = ${dfn[u]}，重链头指向 N${t}。`,
      });

      if (son[u] === 0) return;
      dfs2(son[u], t); // 优先重儿子

      for (const v of this.adj[u]) {
        if (v !== parent[u] && v !== son[u]) {
          dfs2(v, v); // 轻儿子开新链
        }
      }
    };

    dfs2(1, 1);

    // 路径跳跃演示 (从 N4 到 N7)
    let u = 4;
    let v = 7;
    const segments: Array<[number, number]> = [];
    const pathNodes: number[] = [4, 2, 1, 3, 7];

    while (top[u] !== top[v]) {
      if (depth[top[u]] < depth[top[v]]) {
        const tmp = u; u = v; v = tmp;
      }
      segments.push([dfn[top[u]], dfn[u]]);
      u = parent[top[u]];
    }
    if (depth[u] > depth[v]) {
      const tmp = u; u = v; v = tmp;
    }
    segments.push([dfn[u], dfn[v]]);

    steps.push({
      type: 'JUMP_PATH',
      depthSnapshot: cloneD(),
      sizeSnapshot: cloneSz(),
      sonSnapshot: cloneSon(),
      topSnapshot: cloneTop(),
      dfnSnapshot: cloneDfn(),
      activeSegments: segments,
      activePath: pathNodes,
      message: `⚡ [路径跳跃演示] 查询 N4 ↔ N7：沿重链跳跃拆分为连续 DFS 区间 [${segments.map(([l, r]) => `${l}..${r}`).join(', ')}]，线段树 O(log² n) 直达！`,
    });

    steps.push({
      type: 'ALL_DONE',
      depthSnapshot: cloneD(),
      sizeSnapshot: cloneSz(),
      sonSnapshot: cloneSon(),
      topSnapshot: cloneTop(),
      dfnSnapshot: cloneDfn(),
      message: `🏁 树链剖分完成！重链在拍平数组中完全连续，任意树上路径与子树操作均已具备 O(log² n) / O(log n) 极速查询能力！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#hld-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: HLD_CODE_LANGUAGES,
      problemHtml: HLD_PROBLEM_HTML,
      analysisHtml: HLD_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-hld-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-hld-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-hld-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.hld-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_7_NODE_TREE';
        this.root?.querySelectorAll('.hld-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-hld-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        HLDAudio.isMuted = !HLDAudio.isMuted;
        soundBtn.textContent = HLDAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'DFS1_SIZE' || cur.type === 'DFS2_TOP') HLDAudio.playDfs();
      else if (cur.type === 'JUMP_PATH') HLDAudio.playJump();
      else if (cur.type === 'ALL_DONE') HLDAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-hld-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停剖分';

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
    const playBtn = this.root?.querySelector('#btn-hld-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动剖分';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#hld-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#hld-status-badge') as HTMLElement | null;
    const dfnArrayBox = this.root.querySelector('#hld-dfn-array') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = '🎯 剖分就绪 (O(log²n) 路径查询)';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (dfnArrayBox) {
      const arrayItems = Array.from({ length: this.n }, (_, i) => i + 1)
        .map((u) => {
          const d = cur.dfnSnapshot[u];
          const t = cur.topSnapshot[u];
          const color = t > 0 ? CHAIN_COLORS[(t - 1) % CHAIN_COLORS.length] : '#64748b';

          return `
            <div style="display: flex; flex-direction: column; align-items: center; background: #1e293b; border: 1px solid ${color}; border-radius: 4px; padding: 2px 6px; min-width: 38px;">
              <span style="color: #94a3b8; font-size: 8px;">dfn:${d || '-'}</span>
              <span style="color: #ffffff; font-weight: bold; font-size: 11px;">N${u}</span>
              <span style="color: ${color}; font-size: 8.5px; font-weight: 600;">top:N${t || '-'}</span>
            </div>
          `;
        })
        .join('');

      dfnArrayBox.innerHTML = arrayItems;
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

    // 1. 绘制树边 (重边加粗金色，轻边细蓝虚线)
    for (let u = 1; u <= this.n; u++) {
      const p1 = this.nodePositions[u];
      if (!p1) continue;

      for (const v of this.adj[u]) {
        if (v <= u) continue; // 避免重复
        const p2 = this.nodePositions[v];
        if (!p2) continue;

        const isHeavyEdge = cur && (cur.sonSnapshot[u] === v || cur.sonSnapshot[v] === u);
        const isPathEdge = cur && cur.activePath && cur.activePath.includes(u) && cur.activePath.includes(v);

        ctx.save();
        if (isPathEdge) {
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 4;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 12;
        } else if (isHeavyEdge) {
          ctx.strokeStyle = '#f59e0b'; // 重边实线金色
          ctx.lineWidth = 3.5;
        } else {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)'; // 轻边蓝色
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 2. 绘制节点
    for (let i = 1; i <= this.n; i++) {
      const pos = this.nodePositions[i];
      if (!pos) continue;

      const t = cur ? cur.topSnapshot[i] : 0;
      const isCur = cur && cur.curNode === i;
      const isPath = cur && cur.activePath && cur.activePath.includes(i);

      ctx.save();
      let radius = 17;
      let fillColor = '#1e293b';
      let strokeColor = t > 0 ? CHAIN_COLORS[(t - 1) % CHAIN_COLORS.length] : '#475569';

      if (isCur || isPath) {
        strokeColor = '#facc15';
        radius = 20 + Math.sin(this.pulseAnim) * 2;
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
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`N${i}`, pos.x, pos.y - 3);

      // dfn 序
      const d = cur ? cur.dfnSnapshot[i] : 0;
      ctx.font = '8px monospace';
      ctx.fillStyle = d > 0 ? '#38bdf8' : '#64748b';
      ctx.fillText(d > 0 ? `#${d}` : 'sz:' + (cur ? cur.sizeSnapshot[i] || '-' : '-'), pos.x, pos.y + 7);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const HLD_TEMPLATE = `
  <div id="algo-heavy-light-decomposition-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🎋</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">树链剖分 (Heavy-Light Decomposition)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="hld-preset-btn active" data-preset="CLASSIC_7_NODE_TREE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">7 节点经典树</button>
          <button class="hld-preset-btn" data-preset="DEEP_SLANTED_TREE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">深层单侧重链</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="hld-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-hld-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步剖分</button>
        <button id="btn-hld-autoplay" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(245,158,11,0.25);">▶️ 自动剖分</button>
        <button id="btn-hld-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-hld-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #fefce8; border: 1px solid #fef08a; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #854d0e;">
      <div id="hld-narration-box" style="font-weight: 700; color: #713f12;">
        💡 准备就绪：两次 DFS 剖分重边与重链，树上路径快速跳跃！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：树形网络 Canvas 与 DFS 序拍平面板 -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="hld-canvas" width="460" height="170" style="width: 460px; height: 170px;"></canvas>
        </div>

        <!-- 拍平 DFS 序数组 -->
        <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px;">
          <div style="font-size: 10.5px; font-weight: 700; color: #0f172a;">📊 拍平 1D 连续 DFS 序数组 [dfn / top 链头]:</div>
          <div id="hld-dfn-array" style="display: flex; gap: 6px; overflow-x: auto; min-height: 38px; align-items: center;"></div>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🟡 金色粗实线为重边 (Heavy Edge) | 🔵 蓝色虚线为轻边 (Light Edge) | 相同边框色属于同一重链
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="hld-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'heavy-light-decomposition',
  name: '树链剖分 (Heavy-Light Decomposition)',
  viewId: 'algo-heavy-light-decomposition-view',
  category: 'graph',
  description: '树上高级数据结构算法：左程云进阶图论树链剖分、重儿子划分、重链顶端 top[]、DFS 序连续拍平与 O(log^2 n) 路径跳跃 (洛谷 P3384)',
  icon: '🎋',
  template: HLD_TEMPLATE,
  Visualizer: HeavyLightDecompositionVisualizer,
  difficulty: 3,
  levelOrder: 42,
  learningGoal: '掌握重儿子与轻边判定、重链连续性保证、两次 DFS 实现以及树上路径跨链跳跃求 LCA 与线段树结合的工程实践',
});
