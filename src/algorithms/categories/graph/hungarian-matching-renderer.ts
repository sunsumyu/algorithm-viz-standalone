/**
 * 二分图最大匹配与匈牙利算法 (Hungarian Algorithm for Maximum Bipartite Matching) 可视化引擎
 * 参考左程云《算法通关课》增广路理论、DFS 递归让位与匹配边反转
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  HUNGARIAN_CODE_LANGUAGES,
  HUNGARIAN_PROBLEM_HTML,
  HUNGARIAN_ANALYSIS_HTML,
} from './hungarian-matching-problem-content';

export interface BipartiteEdge {
  u: number;
  v: number;
}

export interface HungarianStep {
  type: 'START_U' | 'PROBE_V' | 'ASK_YIELD' | 'AUGMENT_SUCCESS' | 'AUGMENT_FAIL' | 'DONE';
  curU: number;
  curV?: number;
  yieldFrom?: number;
  augmentingPath?: Array<[number, number]>;
  matchSnapshot: number[]; // match[v] = u
  visitedRight: boolean[];
  matchCount: number;
  message: string;
}

class HungarianAudio {
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

  public static playProbe(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playYield(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  public static playFlip(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const notes = [523.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.2);
      });
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
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.35);
      });
    } catch {}
  }
}

export class HungarianMatchingVisualizer extends StepVisualizer<any> {
  // 二分图配置
  private nLeft = 4;
  private nRight = 4;
  private graph: number[][] = []; // graph[u] = [v1, v2...]

  // 坐标
  private leftPositions: Array<{ x: number; y: number }> = [];
  private rightPositions: Array<{ x: number; y: number }> = [];

  // 推演步骤
  private traceSteps: HungarianStep[] = [];
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
    this.codeLanguages = HUNGARIAN_CODE_LANGUAGES;
    this.codeLines = HUNGARIAN_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '二分图最大匹配匈牙利算法引擎 (class069)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '二分图最大匹配与匈牙利算法' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_4V4');
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

    if (presetKey === 'CLASSIC_4V4') {
      this.nLeft = 4;
      this.nRight = 4;
      this.graph = [
        [0, 1], // L0 -> R0, R1
        [1, 2], // L1 -> R1, R2
        [0, 2, 3], // L2 -> R0, R2, R3
        [2, 3], // L3 -> R2, R3
      ];
    } else if (presetKey === 'DENSE_NEGOTIATION') {
      this.nLeft = 3;
      this.nRight = 3;
      this.graph = [
        [0, 1],
        [0, 1, 2],
        [0],
      ];
    } else if (presetKey === 'PERFECT_5V5') {
      this.nLeft = 5;
      this.nRight = 5;
      this.graph = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 0],
      ];
    } else if (presetKey === 'BOTTLENECK_3V4') {
      this.nLeft = 3;
      this.nRight = 4;
      this.graph = [
        [0],
        [0],
        [0],
      ];
    }

    this.layoutNodes();
    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private layoutNodes(): void {
    this.leftPositions = [];
    this.rightPositions = [];

    const leftX = 90;
    const rightX = 370;
    const topY = 40;
    const bottomY = 190;

    for (let i = 0; i < this.nLeft; i++) {
      const y = this.nLeft === 1 ? (topY + bottomY) / 2 : topY + (i / (this.nLeft - 1)) * (bottomY - topY);
      this.leftPositions.push({ x: leftX, y });
    }

    for (let i = 0; i < this.nRight; i++) {
      const y = this.nRight === 1 ? (topY + bottomY) / 2 : topY + (i / (this.nRight - 1)) * (bottomY - topY);
      this.rightPositions.push({ x: rightX, y });
    }
  }

  private computeTraceSteps(): void {
    const nLeft = this.nLeft;
    const nRight = this.nRight;
    const match: number[] = Array(nRight).fill(-1);
    let matchCount = 0;

    const steps: HungarianStep[] = [];
    const cloneMatch = () => [...match];

    steps.push({
      type: 'START_U',
      curU: 0,
      matchSnapshot: cloneMatch(),
      visitedRight: Array(nRight).fill(false),
      matchCount: 0,
      message: `🚀 初始化：左部 ${nLeft} 个节点，右部 ${nRight} 个节点，准备依次通过增广路寻找最大匹配。`,
    });

    for (let u = 0; u < nLeft; u++) {
      const visitedRight: boolean[] = Array(nRight).fill(false);
      const curPath: Array<[number, number]> = [];

      steps.push({
        type: 'START_U',
        curU: u,
        matchSnapshot: cloneMatch(),
        visitedRight: [...visitedRight],
        matchCount,
        message: `🔍 开始为左部节点 L${u} 寻找匹配对...`,
      });

      const dfs = (currU: number): boolean => {
        for (const v of this.graph[currU]) {
          if (visitedRight[v]) continue;
          visitedRight[v] = true;

          steps.push({
            type: 'PROBE_V',
            curU: currU,
            curV: v,
            matchSnapshot: cloneMatch(),
            visitedRight: [...visitedRight],
            matchCount,
            message: `👉 L${currU} 尝试连接 R${v}...`,
          });

          if (match[v] === -1) {
            // 找到单身节点，增广成功！
            curPath.push([currU, v]);
            match[v] = currU;

            steps.push({
              type: 'AUGMENT_SUCCESS',
              curU: currU,
              curV: v,
              augmentingPath: [...curPath],
              matchSnapshot: cloneMatch(),
              visitedRight: [...visitedRight],
              matchCount: matchCount + 1,
              message: `🎉 R${v} 当前单身！成功匹配 L${currU} 💖 R${v}，增广路翻转达成！`,
            });
            return true;
          } else {
            // 已有伴侣，尝试让原配让位
            const prevU = match[v];
            steps.push({
              type: 'ASK_YIELD',
              curU: currU,
              curV: v,
              yieldFrom: prevU,
              matchSnapshot: cloneMatch(),
              visitedRight: [...visitedRight],
              matchCount,
              message: `🤝 R${v} 已与 L${prevU} 匹配，递归询问 L${prevU} 能否让位寻找新伴侣...`,
            });

            curPath.push([currU, v]);
            if (dfs(prevU)) {
              match[v] = currU;
              steps.push({
                type: 'AUGMENT_SUCCESS',
                curU: currU,
                curV: v,
                augmentingPath: [...curPath],
                matchSnapshot: cloneMatch(),
                visitedRight: [...visitedRight],
                matchCount: matchCount + 1,
                message: `✨ L${prevU} 成功让位！R${v} 改与 L${currU} 配对！`,
              });
              return true;
            }
            curPath.pop();
          }
        }
        return false;
      };

      if (dfs(u)) {
        matchCount++;
      } else {
        steps.push({
          type: 'AUGMENT_FAIL',
          curU: u,
          matchSnapshot: cloneMatch(),
          visitedRight: [...visitedRight],
          matchCount,
          message: `⚠️ L${u} 未能找到可行增广路（无法完成让位协商）。`,
        });
      }
    }

    steps.push({
      type: 'DONE',
      curU: -1,
      matchSnapshot: cloneMatch(),
      visitedRight: Array(nRight).fill(false),
      matchCount,
      message: `🏁 匈牙利算法执行完毕！该二分图的最大匹配数为 ${matchCount} 对！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#hungarian-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: HUNGARIAN_CODE_LANGUAGES,
      problemHtml: HUNGARIAN_PROBLEM_HTML,
      analysisHtml: HUNGARIAN_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-hungarian-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-hungarian-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-hungarian-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.hungarian-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_4V4';
        this.root?.querySelectorAll('.hungarian-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-hungarian-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        HungarianAudio.isMuted = !HungarianAudio.isMuted;
        soundBtn.textContent = HungarianAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'PROBE_V') HungarianAudio.playProbe();
      else if (cur.type === 'ASK_YIELD') HungarianAudio.playYield();
      else if (cur.type === 'AUGMENT_SUCCESS') HungarianAudio.playFlip();
      else if (cur.type === 'DONE') HungarianAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-hungarian-autoplay') as HTMLButtonElement | null;
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
    const playBtn = this.root?.querySelector('#btn-hungarian-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动推演';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#hungarian-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#hungarian-status-badge') as HTMLElement | null;
    const matchCountStat = this.root.querySelector('#hungarian-match-count') as HTMLElement | null;
    const pairsContainer = this.root.querySelector('#hungarian-pairs-container') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'DONE') {
        statusBadge.textContent = `🎯 最大匹配: ${cur.matchCount} 对`;
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (matchCountStat) {
      matchCountStat.textContent = `${cur.matchCount} 对`;
    }

    if (pairsContainer) {
      const activePairs: string[] = [];
      cur.matchSnapshot.forEach((u, v) => {
        if (u !== -1) {
          activePairs.push(`L${u} 💖 R${v}`);
        }
      });

      if (activePairs.length === 0) {
        pairsContainer.innerHTML = '<span style="font-size: 10.5px; color: #94a3b8;">暂无匹配</span>';
      } else {
        pairsContainer.innerHTML = activePairs
          .map((p) => `<span style="background: #fdf2f8; color: #db2777; border: 1px solid #fbcfe8; font-weight: bold; padding: 2px 7px; border-radius: 4px; font-size: 11px; margin-right: 4px;">${p}</span>`)
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

    // 1. 绘制潜在备选边 (虚线)
    for (let u = 0; u < this.nLeft; u++) {
      const p1 = this.leftPositions[u];
      if (!p1) continue;

      for (const v of this.graph[u]) {
        const p2 = this.rightPositions[v];
        if (!p2) continue;

        ctx.save();
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 2. 绘制当前匹配边 (实线粉红)
    if (cur) {
      cur.matchSnapshot.forEach((u, v) => {
        if (u !== -1) {
          const p1 = this.leftPositions[u];
          const p2 = this.rightPositions[v];
          if (!p1 || !p2) return;

          ctx.save();
          ctx.strokeStyle = '#ec4899';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#f472b6';
          ctx.shadowBlur = 10;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
          ctx.restore();
        }
      });
    }

    // 3. 绘制当前正在探测的边 (金色激光)
    if (cur && cur.curU >= 0 && cur.curV !== undefined) {
      const p1 = this.leftPositions[cur.curU];
      const p2 = this.rightPositions[cur.curV];
      if (p1 && p2) {
        ctx.save();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 4. 绘制左部节点 (蓝色)
    for (let u = 0; u < this.nLeft; u++) {
      const pos = this.leftPositions[u];
      if (!pos) continue;

      const isCurrent = cur && cur.curU === u;
      const isMatched = cur && cur.matchSnapshot.includes(u);

      ctx.save();
      let radius = 18;
      let fillColor = '#1e3a8a';
      let strokeColor = '#3b82f6';

      if (isCurrent) {
        fillColor = '#ca8a04';
        strokeColor = '#facc15';
        radius = 21 + Math.sin(this.pulseAnim) * 2;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
      } else if (isMatched) {
        fillColor = '#0369a1';
        strokeColor = '#38bdf8';
      }

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`L${u}`, pos.x, pos.y);

      ctx.restore();
    }

    // 5. 绘制右部节点 (粉色)
    for (let v = 0; v < this.nRight; v++) {
      const pos = this.rightPositions[v];
      if (!pos) continue;

      const isCurrent = cur && cur.curV === v;
      const isMatched = cur && cur.matchSnapshot[v] !== -1;
      const isVisited = cur && cur.visitedRight[v];

      ctx.save();
      let radius = 18;
      let fillColor = '#831843';
      let strokeColor = '#ec4899';

      if (isCurrent) {
        fillColor = '#ca8a04';
        strokeColor = '#facc15';
        radius = 21 + Math.sin(this.pulseAnim) * 2;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
      } else if (isMatched) {
        fillColor = '#be185d';
        strokeColor = '#f472b6';
      } else if (isVisited) {
        fillColor = '#475569';
        strokeColor = '#94a3b8';
      }

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`R${v}`, pos.x, pos.y);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const HUNGARIAN_TEMPLATE = `
  <div id="algo-hungarian-matching-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">💘</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">二分图最大匹配 (Hungarian Matching)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="hungarian-preset-btn active" data-preset="CLASSIC_4V4" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典 4v4 任务</button>
          <button class="hungarian-preset-btn" data-preset="DENSE_NEGOTIATION" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">多级让位协商 (3v3)</button>
          <button class="hungarian-preset-btn" data-preset="PERFECT_5V5" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">完全环匹配 (5v5)</button>
          <button class="hungarian-preset-btn" data-preset="BOTTLENECK_3V4" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">单点争抢瓶颈</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="hungarian-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-hungarian-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步增广</button>
        <button id="btn-hungarian-autoplay" style="background: linear-gradient(135deg, #ec4899, #be185d); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(236,72,153,0.25);">▶️ 自动增广</button>
        <button id="btn-hungarian-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-hungarian-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #9d174d;">
      <div style="display: flex; gap: 14px; align-items: center;">
        <span>🎯 当前最大匹配数: <b id="hungarian-match-count" style="color: #db2777; font-size: 12.5px;">0 对</b></span>
        <span>💖 匹配对列表: <span id="hungarian-pairs-container"></span></span>
      </div>
      <div id="hungarian-narration-box" style="font-weight: 700; color: #831843;">
        💡 准备就绪：依次为左部节点寻找增广路，协商让位并翻转匹配边！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：二分图 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="hungarian-canvas" width="460" height="230" style="width: 460px; height: 230px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🔵 左侧蓝色节点 (L) | 🌸 右侧粉色节点 (R) | 💖 粉色粗实线为当前匹配对 | 🟡 金色为增广协商光束
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="hungarian-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'hungarian-matching',
  name: '二分图最大匹配 (Hungarian Matching)',
  viewId: 'algo-hungarian-matching-view',
  category: 'graph',
  description: '匈牙利算法：左程云 class069 二分图最大匹配、增广路交替轨、DFS 递归让位协商与匹配边状态翻转',
  icon: '💘',
  template: HUNGARIAN_TEMPLATE,
  Visualizer: HungarianMatchingVisualizer,
  difficulty: 3,
  levelOrder: 29,
  learningGoal: '掌握二分图最大匹配模型、增广路定理的数学证明与 DFS 递归让位协商机制',
});
