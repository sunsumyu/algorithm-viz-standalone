/**
 * 二分图博弈论与最大匹配必胜点 (Bipartite Graph Game) 可视化引擎
 * 进阶博弈图论: 轮流移动棋子判定、先手必胜当且仅当起点属于所有最大匹配、交错轨 DFS 标记 (洛谷 P4055 [JSOI2009] 游戏)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  BIPARTITE_GAME_CODE_LANGUAGES,
  BIPARTITE_GAME_PROBLEM_HTML,
  BIPARTITE_GAME_ANALYSIS_HTML,
} from './bipartite-game-problem-content';

export interface GameStep {
  type: 'HUNGARIAN_MATCH' | 'ALTERNATE_DFS' | 'IDENTIFY_WINNERS' | 'ALL_DONE';
  matchedEdges: Array<{ u: number; v: number }>;
  curExploring?: number;
  visitedInDFS?: number[];
  canBeUnmatched: boolean[];
  winningNodes: number[];
  message: string;
}

class GameAudio {
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

  public static playMatch(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  public static playExplore(): void {
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

export class BipartiteGameVisualizer extends StepVisualizer<any> {
  // 二分图左右节点与边 (1-indexed)
  private n = 4;
  private m = 4;
  private edges: Array<{ u: number; v: number }> = [];
  private leftPositions: Array<{ x: number; y: number }> = [];
  private rightPositions: Array<{ x: number; y: number }> = [];

  // 推演步骤
  private traceSteps: GameStep[] = [];
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
    this.codeLanguages = BIPARTITE_GAME_CODE_LANGUAGES;
    this.codeLines = BIPARTITE_GAME_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '二分图博弈必胜点计算引擎 (Bipartite Game)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '二分图博弈' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_4X4_GAME');
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

    if (presetKey === 'CLASSIC_4X4_GAME') {
      this.n = 4;
      this.m = 4;
      this.edges = [
        { u: 1, v: 1 },
        { u: 1, v: 2 },
        { u: 2, v: 2 },
        { u: 2, v: 3 },
        { u: 3, v: 3 },
        { u: 4, v: 3 },
      ];
      this.leftPositions = [
        { x: 0, y: 0 },
        { x: 100, y: 35 },
        { x: 100, y: 80 },
        { x: 100, y: 125 },
        { x: 100, y: 170 },
      ];
      this.rightPositions = [
        { x: 0, y: 0 },
        { x: 300, y: 35 },
        { x: 300, y: 80 },
        { x: 300, y: 125 },
        { x: 300, y: 170 },
      ];
    } else {
      this.n = 3;
      this.m = 3;
      this.edges = [
        { u: 1, v: 1 },
        { u: 2, v: 2 },
        { u: 3, v: 3 },
        { u: 1, v: 2 },
        { u: 2, v: 3 },
      ];
      this.leftPositions = [
        { x: 0, y: 0 },
        { x: 100, y: 45 },
        { x: 100, y: 105 },
        { x: 100, y: 165 },
      ];
      this.rightPositions = [
        { x: 0, y: 0 },
        { x: 300, y: 45 },
        { x: 300, y: 105 },
        { x: 300, y: 165 },
      ];
    }

    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private computeTraceSteps(): void {
    const n = this.n;
    const m = this.m;

    const adj: number[][] = Array.from({ length: n + 1 }, () => []);
    this.edges.forEach((e) => adj[e.u].push(e.v));

    const matchLeft = Array(n + 1).fill(0);
    const matchRight = Array(m + 1).fill(0);
    const vis = Array(Math.max(n, m) + 1).fill(false);

    const dfsHungar = (u: number): boolean => {
      for (const v of adj[u]) {
        if (vis[v]) continue;
        vis[v] = true;
        if (!matchRight[v] || dfsHungar(matchRight[v])) {
          matchRight[v] = u;
          matchLeft[u] = v;
          return true;
        }
      }
      return false;
    };

    for (let i = 1; i <= n; i++) {
      vis.fill(false);
      dfsHungar(i);
    }

    const matchedEdges: Array<{ u: number; v: number }> = [];
    for (let u = 1; u <= n; u++) {
      if (matchLeft[u] > 0) matchedEdges.push({ u, v: matchLeft[u] });
    }

    const steps: GameStep[] = [];

    steps.push({
      type: 'HUNGARIAN_MATCH',
      matchedEdges: [...matchedEdges],
      canBeUnmatched: Array(n + 1).fill(false),
      winningNodes: [],
      message: `💖 [阶段 1: 匈牙利最大匹配] 求出一组基准最大匹配，共 ${matchedEdges.length} 对匹配！`,
    });

    // 2. 从未匹配点交错轨 DFS
    const canBeUnmatched = Array(n + 1).fill(false);
    const visitedInDFS: number[] = [];

    const dfsAlternate = (u: number) => {
      canBeUnmatched[u] = true;
      visitedInDFS.push(u);
      for (const v of adj[u]) {
        if (!vis[v] && matchRight[v] > 0) {
          vis[v] = true;
          dfsAlternate(matchRight[v]);
        }
      }
    };

    vis.fill(false);
    for (let i = 1; i <= n; i++) {
      if (!matchLeft[i]) {
        steps.push({
          type: 'ALTERNATE_DFS',
          curExploring: i,
          matchedEdges: [...matchedEdges],
          visitedInDFS: [...visitedInDFS],
          canBeUnmatched: [...canBeUnmatched],
          winningNodes: [],
          message: `🔍 [交错轨 DFS] 从未匹配节点 X${i} 出发探索交错路，寻找可被替换的非必须匹配点！`,
        });
        dfsAlternate(i);
      }
    }

    // 3. 筛选必胜点
    const winningNodes: number[] = [];
    for (let i = 1; i <= n; i++) {
      if (matchLeft[i] && !canBeUnmatched[i]) {
        winningNodes.push(i);
      }
    }

    steps.push({
      type: 'IDENTIFY_WINNERS',
      matchedEdges: [...matchedEdges],
      visitedInDFS: [...visitedInDFS],
      canBeUnmatched: [...canBeUnmatched],
      winningNodes: [...winningNodes],
      message: `👑 [锁定先手必胜点] 排除交错轨可达点后，节点 [${winningNodes.map((x) => 'X' + x).join(', ')}] 属于所有可能的最大匹配，为先手必胜起点！`,
    });

    steps.push({
      type: 'ALL_DONE',
      matchedEdges: [...matchedEdges],
      visitedInDFS: [...visitedInDFS],
      canBeUnmatched: [...canBeUnmatched],
      winningNodes: [...winningNodes],
      message: `🎉 [博弈分析完成] 先手选择 [${winningNodes.map((x) => 'X' + x).join(', ')}] 任意点开局均有必胜策略！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#bpgame-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: BIPARTITE_GAME_CODE_LANGUAGES,
      problemHtml: BIPARTITE_GAME_PROBLEM_HTML,
      analysisHtml: BIPARTITE_GAME_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-bpgame-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-bpgame-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-bpgame-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.bpgame-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_4X4_GAME';
        this.root?.querySelectorAll('.bpgame-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-bpgame-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        GameAudio.isMuted = !GameAudio.isMuted;
        soundBtn.textContent = GameAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'HUNGARIAN_MATCH') GameAudio.playMatch();
      else if (cur.type === 'ALTERNATE_DFS') GameAudio.playExplore();
      else if (cur.type === 'IDENTIFY_WINNERS' || cur.type === 'ALL_DONE') GameAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-bpgame-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停判定';

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
    const playBtn = this.root?.querySelector('#btn-bpgame-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动判定';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#bpgame-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#bpgame-status-badge') as HTMLElement | null;
    const winnersBadge = this.root.querySelector('#bpgame-winners-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = '🏁 博弈判定就绪';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (winnersBadge) {
      if (cur.winningNodes.length > 0) {
        winnersBadge.innerHTML = cur.winningNodes.map((u) => `X${u}`).join(', ');
      } else {
        winnersBadge.textContent = '判定中...';
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

    // 1. 绘制普通边
    this.edges.forEach((e) => {
      const p1 = this.leftPositions[e.u];
      const p2 = this.rightPositions[e.v];
      if (!p1 || !p2) return;

      const isMatched = cur && cur.matchedEdges.some((me) => me.u === e.u && me.v === e.v);

      ctx.save();
      ctx.strokeStyle = isMatched ? '#ec4899' : 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = isMatched ? 3.5 : 1.5;
      if (isMatched) {
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 10;
      }

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
    });

    // 2. 绘制左部节点
    for (let i = 1; i <= this.n; i++) {
      const pos = this.leftPositions[i];
      if (!pos) continue;

      const isWinner = cur && cur.winningNodes.includes(i);
      const isExploring = cur && cur.curExploring === i;

      ctx.save();
      let fillColor = '#1e293b';
      let strokeColor = '#38bdf8';
      let radius = 16;

      if (isWinner) {
        strokeColor = '#facc15';
        fillColor = '#854d0e';
        radius = 18 + Math.sin(this.pulseAnim) * 1.5;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 14;
      } else if (isExploring) {
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

      // 标签
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`X${i}`, pos.x, pos.y);

      if (isWinner) {
        ctx.font = '13px sans-serif';
        ctx.fillText('👑', pos.x - 16, pos.y - 10);
      }

      ctx.restore();
    }

    // 3. 绘制右部节点
    for (let i = 1; i <= this.m; i++) {
      const pos = this.rightPositions[i];
      if (!pos) continue;

      ctx.save();
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Y${i}`, pos.x, pos.y);
      ctx.restore();
    }

    ctx.restore();
  }
}

export const BIPARTITE_GAME_TEMPLATE = `
  <div id="algo-bipartite-game-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">♟️</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">二分图博弈必胜点 (Bipartite Game)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="bpgame-preset-btn active" data-preset="CLASSIC_4X4_GAME" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">4×4 经典交错图</button>
          <button class="bpgame-preset-btn" data-preset="PERFECT_MATCHING_GRAPH" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">3×3 完美匹配全必胜</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="bpgame-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-bpgame-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-bpgame-autoplay" style="background: linear-gradient(135deg, #ec4899, #db2777); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(236,72,153,0.25);">▶️ 自动判定</button>
        <button id="btn-bpgame-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-bpgame-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #9d174d;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>👑 先手必胜起点: <b id="bpgame-winners-badge" style="color: #db2777; font-size: 12px;">判定中...</b></span>
      </div>
      <div id="bpgame-narration-box" style="font-weight: 700; color: #831843;">
        💡 准备就绪：匈牙利最大匹配 + 未匹配点交错轨探索，锁定先手必胜起点！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：二分图 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="bpgame-canvas" width="460" height="200" style="width: 460px; height: 200px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          💖 粉色实线为匹配边 | 👑 皇冠金色节点为先手必胜起点 (属于所有最大匹配)
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="bpgame-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'bipartite-game',
  name: '二分图博弈 (Bipartite Game)',
  viewId: 'algo-bipartite-game-view',
  category: 'graph',
  description: '进阶博弈图论算法：轮流移动棋子判定、先手必胜当且仅当起点属于所有最大匹配、交错轨 DFS 标记非必须匹配点 (洛谷 P4055 [JSOI2009] 游戏)',
  icon: '♟️',
  template: BIPARTITE_GAME_TEMPLATE,
  Visualizer: BipartiteGameVisualizer,
  difficulty: 3,
  levelOrder: 54,
  learningGoal: '掌握二分图博弈先手必胜充要条件证明、残量图交错轨 DFS 判定非必须匹配点的算法逻辑与工程实现',
});
