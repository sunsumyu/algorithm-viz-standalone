/**
 * 状压最短路与访问所有节点的最短路径 (Shortest Path Visiting All Nodes) 可视化引擎
 * 参考左程云《算法通关课》class064: 状态空间扩维 (u, mask)、多源并发广搜与位掩码位运算剪枝 (LeetCode 847)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  STATE_COMPRESSION_BFS_CODE_LANGUAGES,
  STATE_COMPRESSION_BFS_PROBLEM_HTML,
  STATE_COMPRESSION_BFS_ANALYSIS_HTML,
} from './state-compression-bfs-problem-content';

export interface StateBfsStep {
  type: 'MULTI_SOURCE_INIT' | 'QUEUE_POP' | 'RELAX_STATE' | 'ALL_VISITED_DONE';
  curU: number;
  curMask: number;
  curDist: number;
  nextU?: number;
  nextMask?: number;
  queueSnapshot: Array<[number, number, number]>; // [node, mask, dist]
  pathTrace?: number[];
  message: string;
}

class StateBfsAudio {
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

  public static playStep(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {}
  }

  public static playNodeLit(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
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
        gain.gain.setValueAtTime(0.16, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.3);
      });
    } catch {}
  }
}

export class StateCompressionBfsVisualizer extends StepVisualizer<any> {
  // 图数据
  private n = 4;
  private graph: number[][] = [];
  private nodePositions: Array<{ x: number; y: number }> = [];

  // 推演步骤
  private traceSteps: StateBfsStep[] = [];
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
    this.codeLanguages = STATE_COMPRESSION_BFS_CODE_LANGUAGES;
    this.codeLines = STATE_COMPRESSION_BFS_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '状压最短路与多源并发 BFS 引擎 (LeetCode 847)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '状压最短路' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('WINDMILL_4_NODES');
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

    if (presetKey === 'WINDMILL_4_NODES') {
      // 0 与 1, 2, 3 相连（小风车）
      this.n = 4;
      this.graph = [
        [1, 2, 3],
        [0],
        [0],
        [0],
      ];
      this.nodePositions = [
        { x: 230, y: 115 }, // 0 中心
        { x: 230, y: 40 },  // 1 上
        { x: 130, y: 170 }, // 2 左下
        { x: 330, y: 170 }, // 3 右下
      ];
    } else if (presetKey === 'LINEAR_5_NODES') {
      this.n = 5;
      this.graph = [
        [1],
        [0, 2],
        [1, 3],
        [2, 4],
        [3],
      ];
      this.nodePositions = [
        { x: 70, y: 115 },
        { x: 150, y: 115 },
        { x: 230, y: 115 },
        { x: 310, y: 115 },
        { x: 390, y: 115 },
      ];
    } else if (presetKey === 'PENTAGON_CYCLE') {
      this.n = 5;
      this.graph = [
        [1, 4],
        [0, 2],
        [1, 3],
        [2, 4],
        [3, 0],
      ];
      const centerX = 230;
      const centerY = 115;
      const radius = 75;
      this.nodePositions = [];
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        this.nodePositions.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        });
      }
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const n = this.n;
    const targetMask = (1 << n) - 1;
    const visited: boolean[][] = Array.from({ length: n }, () => Array(1 << n).fill(false));
    const queue: Array<[number, number, number]> = []; // [u, mask, dist]

    const steps: StateBfsStep[] = [];

    // 多源并发入队
    for (let i = 0; i < n; i++) {
      const mask = 1 << i;
      visited[i][mask] = true;
      queue.push([i, mask, 0]);
    }

    steps.push({
      type: 'MULTI_SOURCE_INIT',
      curU: 0,
      curMask: 1,
      curDist: 0,
      queueSnapshot: [...queue],
      message: `🚀 初始化：${n} 个节点全部作为潜在起始点并发入队，状态 (i, 1 << i, dist=0)。`,
    });

    while (queue.length > 0) {
      const [u, mask, dist] = queue.shift()!;

      steps.push({
        type: 'QUEUE_POP',
        curU: u,
        curMask: mask,
        curDist: dist,
        queueSnapshot: [...queue],
        message: `🔍 弹出状态：当前位于节点 ${u}，已访问掩码 ${mask.toString(2).padStart(n, '0')}，当前步数 ${dist}。`,
      });

      if (mask === targetMask) {
        steps.push({
          type: 'ALL_VISITED_DONE',
          curU: u,
          curMask: mask,
          curDist: dist,
          queueSnapshot: [...queue],
          message: `🎉 首个全节点点亮状态达成！访问所有节点的最短路径步数为 ${dist} 步！`,
        });
        break;
      }

      for (const v of this.graph[u]) {
        const nextMask = mask | (1 << v);
        if (!visited[v][nextMask]) {
          visited[v][nextMask] = true;
          queue.push([v, nextMask, dist + 1]);

          steps.push({
            type: 'RELAX_STATE',
            curU: u,
            curMask: mask,
            curDist: dist,
            nextU: v,
            nextMask,
            queueSnapshot: [...queue],
            message: `🌱 转移至节点 ${v}：新掩码 ${nextMask.toString(2).padStart(n, '0')}，步数 ${dist + 1} 入队。`,
          });
        }
      }
    }

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#state-bfs-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: STATE_COMPRESSION_BFS_CODE_LANGUAGES,
      problemHtml: STATE_COMPRESSION_BFS_PROBLEM_HTML,
      analysisHtml: STATE_COMPRESSION_BFS_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-state-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-state-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-state-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.state-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'WINDMILL_4_NODES';
        this.root?.querySelectorAll('.state-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-state-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        StateBfsAudio.isMuted = !StateBfsAudio.isMuted;
        soundBtn.textContent = StateBfsAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'QUEUE_POP') StateBfsAudio.playStep();
      else if (cur.type === 'RELAX_STATE') StateBfsAudio.playNodeLit();
      else if (cur.type === 'ALL_VISITED_DONE') StateBfsAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-state-autoplay') as HTMLButtonElement | null;
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
    const playBtn = this.root?.querySelector('#btn-state-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动推演';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#state-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#state-status-badge') as HTMLElement | null;
    const bitmaskContainer = this.root.querySelector('#state-bitmask-container') as HTMLElement | null;
    const queuePreview = this.root.querySelector('#state-queue-preview') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_VISITED_DONE') {
        statusBadge.textContent = `🎯 最短步数: ${cur.curDist} 步`;
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length} (Dist: ${cur.curDist})`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (bitmaskContainer) {
      const bits: string[] = [];
      for (let i = 0; i < this.n; i++) {
        const isVisited = (cur.curMask & (1 << i)) !== 0;
        const bg = isVisited ? '#10b981' : '#64748b';
        bits.push(`
          <span style="background: ${bg}; color: #ffffff; padding: 2px 7px; border-radius: 4px; font-weight: bold; font-family: monospace; font-size: 11px;">
            Node ${i}: ${isVisited ? '1' : '0'}
          </span>
        `);
      }
      bitmaskContainer.innerHTML = bits.join('');
    }

    if (queuePreview) {
      if (cur.queueSnapshot.length === 0) {
        queuePreview.innerHTML = '<span style="color: #94a3b8; font-size: 11px;">[队列为空]</span>';
      } else {
        queuePreview.innerHTML = cur.queueSnapshot
          .slice(0, 4)
          .map(([u, mask, dist]) => `
            <span style="background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; border-radius: 4px; padding: 1px 6px; font-size: 10.5px; margin-right: 3px;">
              [N${u}, M:${mask.toString(2).padStart(this.n, '0')}, D:${dist}]
            </span>
          `)
          .join('');
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

    // 1. 绘制边
    for (let u = 0; u < this.n; u++) {
      const p1 = this.nodePositions[u];
      if (!p1) continue;

      for (const v of this.graph[u]) {
        if (u > v) continue;
        const p2 = this.nodePositions[v];
        if (!p2) continue;

        const isTransferEdge = cur && ((cur.curU === u && cur.nextU === v) || (cur.curU === v && cur.nextU === u));

        ctx.save();
        if (isTransferEdge) {
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 12;
        } else {
          ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
          ctx.lineWidth = 2;
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 2. 绘制节点
    for (let i = 0; i < this.n; i++) {
      const pos = this.nodePositions[i];
      if (!pos) continue;

      const isCurrent = cur && cur.curU === i;
      const isNext = cur && cur.nextU === i;
      const isVisited = cur ? (cur.curMask & (1 << i)) !== 0 : false;

      ctx.save();
      let radius = 19;
      let fillColor = '#1e293b';
      let strokeColor = '#64748b';

      if (isCurrent) {
        fillColor = '#ca8a04';
        strokeColor = '#facc15';
        radius = 22 + Math.sin(this.pulseAnim) * 2;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 14;
      } else if (isNext) {
        fillColor = '#0369a1';
        strokeColor = '#38bdf8';
        radius = 21;
      } else if (isVisited) {
        fillColor = '#065f46';
        strokeColor = '#10b981';
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
      ctx.fillText(`${i}`, pos.x, pos.y);

      // 已访问绿勾
      if (isVisited && !isCurrent) {
        ctx.font = '10px sans-serif';
        ctx.fillText('✨', pos.x + 13, pos.y - 12);
      }

      ctx.restore();
    }

    ctx.restore();
  }
}

export const STATE_COMPRESSION_BFS_TEMPLATE = `
  <div id="algo-state-compression-bfs-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🧭</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">状压最短路 (State-Compressed BFS)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="state-preset-btn active" data-preset="WINDMILL_4_NODES" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">小风车 (4节点)</button>
          <button class="state-preset-btn" data-preset="LINEAR_5_NODES" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">长线连通链 (5节点)</button>
          <button class="state-preset-btn" data-preset="PENTAGON_CYCLE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">五星环网图 (5节点)</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="state-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-state-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-state-autoplay" style="background: linear-gradient(135deg, #059669, #047857); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(5,150,105,0.25);">▶️ 自动推演</button>
        <button id="btn-state-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-state-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #166534;">
      <div style="display: flex; gap: 10px; align-items: center;">
        <span>🎯 位掩码进度: <span id="state-bitmask-container" style="display: inline-flex; gap: 3px;"></span></span>
      </div>
      <div id="state-narration-box" style="font-weight: 700; color: #14532d;">
        💡 准备就绪：多源并发初始化所有起点，状态 (u, mask) 广度优先搜索！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：状压 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="state-bfs-canvas" width="460" height="230" style="width: 460px; height: 230px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🟡 金色为当前所在节点 | 🟢 绿色为当前掩码已访问节点 | 🟡 亮黄边为转移探索射线
        </div>
      </div>

      <!-- 右侧：队列预览与代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; max-height: 60px; display: flex; flex-direction: column; gap: 2px;">
          <div style="font-size: 10.5px; font-weight: 700; color: #0f172a;">📬 BFS 活跃队列状态:</div>
          <div id="state-queue-preview" style="display: flex; flex-wrap: wrap; gap: 2px; overflow-y: auto;"></div>
        </div>

        <div id="state-terminal-mount" style="flex: 1; min-height: 220px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'state-compression-bfs',
  name: '状压最短路 (State-Compressed BFS)',
  viewId: 'algo-state-compression-bfs-view',
  category: 'graph',
  description: '状压最短路算法：左程云 class064 访问所有节点的最短路径 (LeetCode 847)、状态空间扩维 (u, mask) 与多源并发广搜',
  icon: '🧭',
  template: STATE_COMPRESSION_BFS_TEMPLATE,
  Visualizer: StateCompressionBfsVisualizer,
  difficulty: 3,
  levelOrder: 32,
  learningGoal: '掌握状态空间扩维思想、位掩码 mask 刻画子集状态以及多源并发 BFS 求全局全节点遍历最短路',
});
