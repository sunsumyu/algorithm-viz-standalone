/**
 * 找出知晓秘密的所有专家与时序图论 (Find All People With Secret) 可视化引擎
 * 参考左程云《算法通关课》【必备篇】class057: 同一时刻瞬时传递、并查集状态传播与未获知者时间窗口回退 (LeetCode 2092)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  PEOPLE_SECRET_CODE_LANGUAGES,
  PEOPLE_SECRET_PROBLEM_HTML,
  PEOPLE_SECRET_ANALYSIS_HTML,
} from './people-secret-problem-content';

export interface SecretMeeting {
  u: number;
  v: number;
  time: number;
}

export interface SecretStep {
  type: 'TIME_BATCH_START' | 'UNION_MEETING' | 'SECRET_CASCADE' | 'ROLLBACK_UNCONNECTED' | 'ALL_DONE';
  time: number;
  currentEdge?: [number, number];
  activeMeetings: SecretMeeting[];
  parentSnapshot: number[];
  secretHolders: number[];
  rolledBackNodes: number[];
  message: string;
}

class SecretAudio {
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

  public static playSpread(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  public static playRollback(): void {
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
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.16, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.25);
      });
    } catch {}
  }
}

export class PeopleSecretVisualizer extends StepVisualizer<any> {
  // 数据源
  private n = 6;
  private firstPerson = 1;
  private meetings: SecretMeeting[] = [
    { u: 1, v: 2, time: 5 },
    { u: 2, v: 3, time: 5 },
    { u: 0, v: 1, time: 5 },
    { u: 4, v: 5, time: 5 },
  ];
  private nodePositions: Map<number, { x: number; y: number }> = new Map();

  // 推演步骤
  private traceSteps: SecretStep[] = [];
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
    this.codeLanguages = PEOPLE_SECRET_CODE_LANGUAGES;
    this.codeLines = PEOPLE_SECRET_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '秘密时序图论与并查集引擎 (LeetCode 2092)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '找出知晓秘密的所有专家' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_CASCADE');
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

    if (presetKey === 'CLASSIC_CASCADE') {
      this.n = 6;
      this.firstPerson = 1;
      this.meetings = [
        { u: 1, v: 2, time: 5 },
        { u: 2, v: 3, time: 5 },
        { u: 0, v: 1, time: 5 },
        { u: 4, v: 5, time: 5 },
      ];
    } else if (presetKey === 'MULTI_TIME_WAVE') {
      this.n = 6;
      this.firstPerson = 2;
      this.meetings = [
        { u: 0, v: 2, time: 1 },
        { u: 2, v: 3, time: 2 },
        { u: 3, v: 4, time: 3 },
        { u: 1, v: 5, time: 2 },
      ];
    } else if (presetKey === 'ROLLBACK_TRAP') {
      this.n = 6;
      this.firstPerson = 1;
      this.meetings = [
        { u: 3, v: 4, time: 2 },
        { u: 4, v: 5, time: 2 },
        { u: 0, v: 1, time: 3 },
        { u: 1, v: 3, time: 5 },
      ];
    }

    this.layoutNodes();
    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private layoutNodes(): void {
    this.nodePositions.clear();
    const count = this.n;
    const centerX = 230;
    const centerY = 115;
    const radius = Math.min(85, count * 16);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      this.nodePositions.set(i, { x, y });
    }
  }

  private computeTraceSteps(): void {
    const n = this.n;
    const parent: number[] = Array.from({ length: n }, (_, i) => i);
    const sortedMeetings = [...this.meetings].sort((a, b) => a.time - b.time);

    const find = (i: number): number => {
      if (parent[i] !== i) parent[i] = find(parent[i]);
      return parent[i];
    };

    const union = (x: number, y: number) => {
      const fx = find(x);
      const fy = find(y);
      if (fx !== fy) parent[fx] = fy;
    };

    const getSecretHolders = (): number[] => {
      const root0 = find(0);
      const res: number[] = [];
      for (let i = 0; i < n; i++) {
        if (find(i) === root0) res.push(i);
      }
      return res;
    };

    const steps: SecretStep[] = [];
    const cloneParent = () => [...parent];

    // 初始状态
    union(0, this.firstPerson);

    steps.push({
      type: 'TIME_BATCH_START',
      time: 0,
      activeMeetings: [],
      parentSnapshot: cloneParent(),
      secretHolders: getSecretHolders(),
      rolledBackNodes: [],
      message: `🚀 初始化：时刻 T=0，专家 0 将秘密分享给专家 ${this.firstPerson} (二者已并查集锁定)。`,
    });

    const m = sortedMeetings.length;
    let l = 0;

    while (l < m) {
      let r = l;
      const curTime = sortedMeetings[l].time;
      while (r < m && sortedMeetings[r].time === curTime) r++;

      const batch = sortedMeetings.slice(l, r);

      steps.push({
        type: 'TIME_BATCH_START',
        time: curTime,
        activeMeetings: batch,
        parentSnapshot: cloneParent(),
        secretHolders: getSecretHolders(),
        rolledBackNodes: [],
        message: `⏰ 推进至时刻 T=${curTime}：共有 ${batch.length} 场瞬时会议同时召开！`,
      });

      // 1. 同一时间步内会议合并
      for (let i = l; i < r; i++) {
        const { u, v, time } = sortedMeetings[i];
        union(u, v);

        steps.push({
          type: 'UNION_MEETING',
          time,
          currentEdge: [u, v],
          activeMeetings: batch,
          parentSnapshot: cloneParent(),
          secretHolders: getSecretHolders(),
          rolledBackNodes: [],
          message: `🤝 [时刻 T=${time}] 专家 ${u} 与 专家 ${v} 会议连通。`,
        });
      }

      // 瞬时级联判定
      const currentHolders = getSecretHolders();
      steps.push({
        type: 'SECRET_CASCADE',
        time: curTime,
        activeMeetings: batch,
        parentSnapshot: cloneParent(),
        secretHolders: currentHolders,
        rolledBackNodes: [],
        message: `⚡ [瞬时级联] 时刻 T=${curTime} 结束，知晓秘密的专家扩展为: [${currentHolders.join(', ')}]！`,
      });

      // 2. 撤销未与 0 连通的孤立节点
      const rolledBack: number[] = [];
      const root0 = find(0);
      for (let i = l; i < r; i++) {
        const { u, v } = sortedMeetings[i];
        if (find(u) !== root0 && parent[u] !== u) {
          parent[u] = u;
          rolledBack.push(u);
        }
        if (find(v) !== root0 && parent[v] !== v) {
          parent[v] = v;
          rolledBack.push(v);
        }
      }

      if (rolledBack.length > 0) {
        steps.push({
          type: 'ROLLBACK_UNCONNECTED',
          time: curTime,
          activeMeetings: batch,
          parentSnapshot: cloneParent(),
          secretHolders: getSecretHolders(),
          rolledBackNodes: rolledBack,
          message: `✂️ [时间步撤销] 专家 [${Array.from(new Set(rolledBack)).join(', ')}] 当前时刻未接触到秘密，重置并查集防止跨时间虚假感染！`,
        });
      }

      l = r;
    }

    const finalHolders = getSecretHolders();
    steps.push({
      type: 'ALL_DONE',
      time: 999,
      activeMeetings: [],
      parentSnapshot: cloneParent(),
      secretHolders: finalHolders,
      rolledBackNodes: [],
      message: `🏁 全部时序会议结束！最终知晓秘密的专家共有 ${finalHolders.length} 位：[${finalHolders.join(', ')}]！`,
    });

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#secret-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: PEOPLE_SECRET_CODE_LANGUAGES,
      problemHtml: PEOPLE_SECRET_PROBLEM_HTML,
      analysisHtml: PEOPLE_SECRET_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-secret-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-secret-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-secret-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.secret-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_CASCADE';
        this.root?.querySelectorAll('.secret-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-secret-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        SecretAudio.isMuted = !SecretAudio.isMuted;
        soundBtn.textContent = SecretAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'SECRET_CASCADE') SecretAudio.playSpread();
      else if (cur.type === 'ROLLBACK_UNCONNECTED') SecretAudio.playRollback();
      else if (cur.type === 'ALL_DONE') SecretAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-secret-autoplay') as HTMLButtonElement | null;
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
    const playBtn = this.root?.querySelector('#btn-secret-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动推演';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#secret-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#secret-status-badge') as HTMLElement | null;
    const meetingsContainer = this.root.querySelector('#secret-meetings-container') as HTMLElement | null;
    const holdersList = this.root.querySelector('#secret-holders-list') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'ALL_DONE') {
        statusBadge.textContent = `🎯 锁定 ${cur.secretHolders.length} 位知密者`;
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length} (T=${cur.time})`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (holdersList) {
      holdersList.innerHTML = cur.secretHolders
        .map((id) => `<span style="background: #facc15; color: #78350f; font-weight: bold; padding: 2px 7px; border-radius: 4px; font-size: 11px; margin-right: 4px;">🕵️‍♂️ 专家 ${id}</span>`)
        .join('');
    }

    if (meetingsContainer) {
      meetingsContainer.innerHTML = this.meetings
        .map((m) => {
          const isActive = cur.time === m.time;
          const bg = isActive ? '#eff6ff' : '#f8fafc';
          const border = isActive ? '#3b82f6' : '#cbd5e1';

          return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 2px 6px; border-radius: 4px; background: ${bg}; border: 1px solid ${border}; font-size: 10.5px; margin-bottom: 2px;">
              <span>专家 ${m.u} ↔ 专家 ${m.v}</span>
              <span style="font-weight: bold; color: ${isActive ? '#2563eb' : '#64748b'}; font-family: monospace;">T = ${m.time}</span>
            </div>
          `;
        })
        .join('');
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

    // 1. 绘制当前时刻活跃的会议边
    if (cur) {
      cur.activeMeetings.forEach((m) => {
        const p1 = this.nodePositions.get(m.u);
        const p2 = this.nodePositions.get(m.v);
        if (!p1 || !p2) return;

        const isCurrentEdge = cur.currentEdge && cur.currentEdge[0] === m.u && cur.currentEdge[1] === m.v;

        ctx.save();
        if (isCurrentEdge) {
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 12;
        } else {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
          ctx.lineWidth = 2;
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      });
    }

    // 2. 绘制专家节点
    for (let i = 0; i < this.n; i++) {
      const pos = this.nodePositions.get(i);
      if (!pos) continue;

      const isHolder = cur ? cur.secretHolders.includes(i) : false;
      const isRolledBack = cur ? cur.rolledBackNodes.includes(i) : false;

      ctx.save();
      let fillColor = '#1e293b';
      let strokeColor = '#64748b';
      let radius = 20;

      if (isHolder) {
        fillColor = '#ca8a04';
        strokeColor = '#facc15';
        radius = 23 + Math.sin(this.pulseAnim) * 2;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
      } else if (isRolledBack) {
        fillColor = '#7f1d1d';
        strokeColor = '#ef4444';
      }

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 专家编号
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`P${i}`, pos.x, pos.y - 2);

      // 图标
      ctx.font = '10px sans-serif';
      ctx.fillText(isHolder ? '🕵️‍♂️' : '👤', pos.x, pos.y + 11);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const PEOPLE_SECRET_TEMPLATE = `
  <div id="algo-people-secret-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🕵️</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">知晓秘密的专家 (Find People With Secret)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="secret-preset-btn active" data-preset="CLASSIC_CASCADE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典瞬时级联</button>
          <button class="secret-preset-btn" data-preset="MULTI_TIME_WAVE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">跨时序波次</button>
          <button class="secret-preset-btn" data-preset="ROLLBACK_TRAP" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">撤销防漏验证</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="secret-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-secret-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-secret-autoplay" style="background: linear-gradient(135deg, #eab308, #ca8a04); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(234,179,8,0.25);">▶️ 自动推演</button>
        <button id="btn-secret-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-secret-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #fefce8; border: 1px solid #fef08a; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #854d0e;">
      <div style="display: flex; gap: 14px; align-items: center;">
        <span>🕵️ 已知秘密专家名单: <span id="secret-holders-list" style="display: inline-flex; gap: 2px;"></span></span>
      </div>
      <div id="secret-narration-box" style="font-weight: 700; color: #713f12;">
        💡 准备就绪：观察同时刻瞬时多跳级联传播与时间步结束撤销！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：专家拓扑 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="secret-canvas" width="460" height="230" style="width: 460px; height: 230px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🟡 金色为知晓秘密者 | 🔴 红色为当前时间步未获知且执行并查集回退者
        </div>
      </div>

      <!-- 右侧：时序会议列表与代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; max-height: 105px; display: flex; flex-direction: column; gap: 2px;">
          <div style="font-size: 10.5px; font-weight: 700; color: #0f172a;">📅 时序会议列表 (按时间升序):</div>
          <div id="secret-meetings-container" style="display: flex; flex-direction: column; overflow-y: auto;"></div>
        </div>

        <div id="secret-terminal-mount" style="flex: 1; min-height: 175px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'people-secret',
  name: '知晓秘密的专家 (People With Secret)',
  viewId: 'algo-people-secret-view',
  category: 'graph',
  description: '时序图论与并查集时间步回退算法：左程云 class057 找出知晓秘密的所有专家 (LeetCode 2092)、瞬时级联传递与未获知者状态撤销',
  icon: '🕵️',
  template: PEOPLE_SECRET_TEMPLATE,
  Visualizer: PeopleSecretVisualizer,
  difficulty: 3,
  levelOrder: 28,
  learningGoal: '掌握时序图按时间批处理方法、同一时刻瞬时多跳级联传播机制以及并查集在时空跨越时的撤销重置技术',
});
