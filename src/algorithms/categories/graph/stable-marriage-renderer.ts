/**
 * 稳定婚姻问题与 Gale-Shapley 延迟接受算法 (Stable Marriage Problem) 可视化引擎
 * 经典博弈图论匹配: 诺贝尔奖机制设计、男士求婚女士抉择、延迟接受与 O(n^2) 强稳定匹配
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  STABLE_MARRIAGE_CODE_LANGUAGES,
  STABLE_MARRIAGE_PROBLEM_HTML,
  STABLE_MARRIAGE_ANALYSIS_HTML,
} from './stable-marriage-problem-content';

export interface MarriageStep {
  type: 'PROPOSE' | 'ENGAGE' | 'UPGRADE_SWITCH' | 'REJECT' | 'ALL_STABLE';
  curMan?: number;
  curWoman?: number;
  exMan?: number;
  husbandSnapshot: number[]; // husband[w] = m
  wifeSnapshot: number[];    // wife[m] = w
  message: string;
}

class MarriageAudio {
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

  public static playPropose(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  public static playEngage(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  public static playBreakup(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
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

export class StableMarriageVisualizer extends StepVisualizer<any> {
  // 规模与偏好表 (1-indexed)
  private n = 4;
  private menPref: number[][] = [];
  private womenPref: number[][] = [];
  private leftPositions: Array<{ x: number; y: number }> = [];
  private rightPositions: Array<{ x: number; y: number }> = [];

  // 推演步骤
  private traceSteps: MarriageStep[] = [];
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
    this.codeLanguages = STABLE_MARRIAGE_CODE_LANGUAGES;
    this.codeLines = STABLE_MARRIAGE_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '稳定婚姻 Gale-Shapley 引擎 (Nobel Prize)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '稳定婚姻' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_4X4_MARRIAGE');
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

    if (presetKey === 'CLASSIC_4X4_MARRIAGE') {
      this.n = 4;
      this.menPref = [
        [],
        [1, 2, 3, 4], // M1 偏好: W1 > W2 > W3 > W4
        [2, 1, 4, 3], // M2 偏好: W2 > W1 > W4 > W3
        [1, 3, 2, 4], // M3 偏好: W1 > W3 > W2 > W4
        [3, 2, 1, 4], // M4 偏好: W3 > W2 > W1 > W4
      ];
      this.womenPref = [
        [],
        [2, 1, 3, 4], // W1 偏好: M2 > M1 > M3 > M4
        [1, 3, 2, 4], // W2 偏好: M1 > M3 > M2 > M4
        [3, 4, 1, 2], // W3 偏好: M3 > M4 > M1 > M2
        [1, 2, 3, 4], // W4 偏好: M1 > M2 > M3 > M4
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
    } else if (presetKey === 'INTENSE_RIVAL_3X3') {
      this.n = 3;
      this.menPref = [
        [],
        [1, 2, 3],
        [1, 3, 2],
        [2, 1, 3],
      ];
      this.womenPref = [
        [],
        [2, 1, 3],
        [3, 2, 1],
        [1, 2, 3],
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
    const womenRank: number[][] = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
    for (let w = 1; w <= n; w++) {
      this.womenPref[w].forEach((m, rank) => {
        womenRank[w][m] = rank;
      });
    }

    const husband = Array(n + 1).fill(0);
    const wife = Array(n + 1).fill(0);
    const nextPropose = Array(n + 1).fill(0);
    const freeMen: number[] = Array.from({ length: n }, (_, i) => i + 1);

    const steps: MarriageStep[] = [];
    const cloneH = () => [...husband];
    const cloneW = () => [...wife];

    steps.push({
      type: 'PROPOSE',
      husbandSnapshot: cloneH(),
      wifeSnapshot: cloneW(),
      message: `🚀 初始化 Gale-Shapley 延迟接受算法：${n} 名男士与 ${n} 名女士全员单身，准备开始按偏好求婚！`,
    });

    while (freeMen.length > 0) {
      const m = freeMen.shift()!;
      const w = this.menPref[m][nextPropose[m]++];

      steps.push({
        type: 'PROPOSE',
        curMan: m,
        curWoman: w,
        husbandSnapshot: cloneH(),
        wifeSnapshot: cloneW(),
        message: `💘 男士 M${m} 向心仪女士 W${w} 射出丘比特之箭发起求婚！`,
      });

      if (husband[w] === 0) {
        husband[w] = m;
        wife[m] = w;
        steps.push({
          type: 'ENGAGE',
          curMan: m,
          curWoman: w,
          husbandSnapshot: cloneH(),
          wifeSnapshot: cloneW(),
          message: `💍 女士 W${w} 当前处于单身状态，欣然接受男士 M${m} 的求婚，订婚成功！`,
        });
      } else {
        const curHusband = husband[w];
        if (womenRank[w][m] < womenRank[w][curHusband]) {
          // 移情别恋
          husband[w] = m;
          wife[m] = w;
          wife[curHusband] = 0;
          freeMen.push(curHusband);

          steps.push({
            type: 'UPGRADE_SWITCH',
            curMan: m,
            curWoman: w,
            exMan: curHusband,
            husbandSnapshot: cloneH(),
            wifeSnapshot: cloneW(),
            message: `💔 女士 W${w} 移情别恋！比起前未婚夫 M${curHusband}，她更喜欢新追求者 M${m}！M${curHusband} 恢复单身！`,
          });
        } else {
          // 拒绝
          freeMen.push(m);
          steps.push({
            type: 'REJECT',
            curMan: m,
            curWoman: w,
            husbandSnapshot: cloneH(),
            wifeSnapshot: cloneW(),
            message: `✋ 女士 W${w} 更喜欢当前未婚夫 M${curHusband}，果断拒绝了 M${m}！M${m} 继续保持单身等待下一轮！`,
          });
        }
      }
    }

    steps.push({
      type: 'ALL_STABLE',
      husbandSnapshot: cloneH(),
      wifeSnapshot: cloneW(),
      message: `🎉 全员达成稳定婚姻匹配！不存在任何可能出轨的 Blocking Pair，男士最优强稳定匹配诞生！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#marriage-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: STABLE_MARRIAGE_CODE_LANGUAGES,
      problemHtml: STABLE_MARRIAGE_PROBLEM_HTML,
      analysisHtml: STABLE_MARRIAGE_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-marriage-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-marriage-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-marriage-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.marriage-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_4X4_MARRIAGE';
        this.root?.querySelectorAll('.marriage-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-marriage-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        MarriageAudio.isMuted = !MarriageAudio.isMuted;
        soundBtn.textContent = MarriageAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'PROPOSE') MarriageAudio.playPropose();
      else if (cur.type === 'ENGAGE') MarriageAudio.playEngage();
      else if (cur.type === 'UPGRADE_SWITCH') MarriageAudio.playBreakup();
      else if (cur.type === 'ALL_STABLE') MarriageAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-marriage-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停匹配';

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
    const playBtn = this.root?.querySelector('#btn-marriage-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动匹配';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#marriage-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#marriage-status-badge') as HTMLElement | null;
    const couplesBadge = this.root.querySelector('#marriage-couples-badge') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_STABLE') {
        statusBadge.textContent = '🎯 强稳定婚姻达成';
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (couplesBadge) {
      const pairs: string[] = [];
      for (let m = 1; m <= this.n; m++) {
        const w = cur.wifeSnapshot[m];
        if (w > 0) pairs.push(`M${m} ❤️ W${w}`);
      }
      couplesBadge.innerHTML = pairs.length > 0 ? pairs.join(' | ') : '全员单身中';
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

    // 1. 绘制订婚关系连线
    if (cur) {
      for (let m = 1; m <= this.n; m++) {
        const w = cur.wifeSnapshot[m];
        if (w > 0) {
          const p1 = this.leftPositions[m];
          const p2 = this.rightPositions[w];
          if (p1 && p2) {
            ctx.save();
            ctx.strokeStyle = '#ec4899';
            ctx.lineWidth = 3.5;
            ctx.shadowColor = '#ec4899';
            ctx.shadowBlur = 12;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            ctx.font = '12px sans-serif';
            ctx.fillText('💖', midX - 6, midY + 4);
            ctx.restore();
          }
        }
      }

      // 求婚动效虚线
      if (cur.type === 'PROPOSE' && cur.curMan && cur.curWoman) {
        const p1 = this.leftPositions[cur.curMan];
        const p2 = this.rightPositions[cur.curWoman];
        if (p1 && p2) {
          ctx.save();
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([4, 4]);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          ctx.font = '14px sans-serif';
          ctx.fillText('💘', midX - 7, midY + 5);
          ctx.restore();
        }
      }
    }

    // 2. 绘制男士节点
    for (let i = 1; i <= this.n; i++) {
      const pos = this.leftPositions[i];
      if (!pos) continue;

      const isEngaged = cur && cur.wifeSnapshot[i] > 0;
      const isCur = cur && cur.curMan === i;

      ctx.save();
      let strokeColor = isEngaged ? '#ec4899' : '#38bdf8';
      let fillColor = '#1e293b';
      let radius = 16;

      if (isCur) {
        strokeColor = '#facc15';
        fillColor = '#854d0e';
        radius = 18 + Math.sin(this.pulseAnim) * 1.5;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
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
      ctx.fillText(`M${i}`, pos.x, pos.y - 3);

      // 偏好表
      const prefStr = this.menPref[i].map((w) => `W${w}`).join('>');
      ctx.font = '8px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(prefStr, pos.x, pos.y + 7);

      ctx.restore();
    }

    // 3. 绘制女士节点
    for (let i = 1; i <= this.n; i++) {
      const pos = this.rightPositions[i];
      if (!pos) continue;

      const isEngaged = cur && cur.husbandSnapshot[i] > 0;
      const isCur = cur && cur.curWoman === i;

      ctx.save();
      let strokeColor = isEngaged ? '#ec4899' : '#c084fc';
      let fillColor = '#1e293b';
      let radius = 16;

      if (isCur) {
        strokeColor = '#facc15';
        fillColor = '#831843';
        radius = 18 + Math.sin(this.pulseAnim) * 1.5;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
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
      ctx.fillText(`W${i}`, pos.x, pos.y - 3);

      // 偏好表
      const prefStr = this.womenPref[i].map((m) => `M${m}`).join('>');
      ctx.font = '8px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(prefStr, pos.x, pos.y + 7);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const STABLE_MARRIAGE_TEMPLATE = `
  <div id="algo-stable-marriage-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">💍</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">稳定婚姻问题 (Gale-Shapley)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="marriage-preset-btn active" data-preset="CLASSIC_4X4_MARRIAGE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">4×4 经典偏好表</button>
          <button class="marriage-preset-btn" data-preset="INTENSE_RIVAL_3X3" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">3×3 激烈竞争三角恋</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="marriage-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-marriage-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步求婚</button>
        <button id="btn-marriage-autoplay" style="background: linear-gradient(135deg, #ec4899, #db2777); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(236,72,153,0.25);">▶️ 自动匹配</button>
        <button id="btn-marriage-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-marriage-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #9d174d;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>💑 当前订婚对: <b id="marriage-couples-badge" style="color: #db2777; font-size: 12px;">全员单身中</b></span>
      </div>
      <div id="marriage-narration-box" style="font-weight: 700; color: #831843;">
        💡 准备就绪：男士主动求婚、女士择优延迟接受，O(n²) 收敛强稳定匹配！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：婚姻匹配 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="marriage-canvas" width="460" height="200" style="width: 460px; height: 200px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          💘 黄色虚线为求婚箭头 | 💖 粉色实线为订婚关系 | 节点下方标注各自偏好排行榜
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="marriage-terminal-mount" style="flex: 1; min-height: 280px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'stable-marriage',
  name: '稳定婚姻问题 (Stable Marriage)',
  viewId: 'algo-stable-marriage-view',
  category: 'graph',
  description: '博弈图论与机制设计算法：诺贝尔奖 Gale-Shapley 延迟接受算法、男士求婚女士择优、Blocking Pair 消除与强稳定匹配',
  icon: '💍',
  template: STABLE_MARRIAGE_TEMPLATE,
  Visualizer: StableMarriageVisualizer,
  difficulty: 3,
  levelOrder: 48,
  learningGoal: '掌握稳定婚姻问题定义、Gale-Shapley 算法单调性收敛证明、提议方最优定理与规培匹配现实应用',
});
