/**
 * 火星词典与拓扑排序判环 (Alien Dictionary Topo Sort) 可视化引擎
 * 参考左程云《算法通关课》【必备篇】class059: 字符偏序依赖建图、非法前缀陷阱与拓扑排序判环 (LeetCode 269 / 剑指 Offer II 114)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  ALIEN_DICT_CODE_LANGUAGES,
  ALIEN_DICT_PROBLEM_HTML,
  ALIEN_DICT_ANALYSIS_HTML,
} from './alien-dict-problem-content';

export interface CharNode {
  ch: string;
  x: number;
  y: number;
}

export interface CharEdge {
  u: string;
  v: string;
}

export interface AlienStep {
  type: 'COMPARE_WORDS' | 'ADD_EDGE' | 'PREFIX_ERROR' | 'INIT_QUEUE' | 'POP_CHAR' | 'CYCLE_ERROR' | 'SUCCESS';
  wordIdx1?: number;
  wordIdx2?: number;
  charIdx?: number;
  edge?: [string, string];
  poppedChar?: string;
  inDegreeSnapshot: Record<string, number>;
  graphEdges: Array<[string, string]>;
  queueSnapshot: string[];
  resultStr: string;
  isError: boolean;
  message: string;
}

class AlienAudio {
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

  public static playCompare(): void {
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

  public static playAddEdge(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  public static playError(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
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

export class AlienDictVisualizer extends StepVisualizer<any> {
  // 数据源
  private words: string[] = ['wrt', 'wrf', 'er', 'ett', 'rftt'];
  private charPositions: Map<string, { x: number; y: number }> = new Map();

  // 推演步骤
  private traceSteps: AlienStep[] = [];
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
    this.codeLanguages = ALIEN_DICT_CODE_LANGUAGES;
    this.codeLines = ALIEN_DICT_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '火星词典拓扑判环算法引擎 (LeetCode 269)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '火星词典与拓扑排序判环' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_ALIEN');
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

    if (presetKey === 'CLASSIC_ALIEN') {
      this.words = ['wrt', 'wrf', 'er', 'ett', 'rftt'];
    } else if (presetKey === 'PREFIX_INVALID') {
      this.words = ['abc', 'ab'];
    } else if (presetKey === 'CYCLE_CONFLICT') {
      this.words = ['z', 'x', 'z'];
    } else if (presetKey === 'SIMPLE_TWO') {
      this.words = ['z', 'x'];
    }

    this.layoutCharPositions();
    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private layoutCharPositions(): void {
    const allChars = Array.from(new Set(this.words.join('').split('')));
    this.charPositions.clear();

    const count = allChars.length;
    const centerX = 230;
    const centerY = 115;
    const radiusX = Math.min(170, count * 35);
    const radiusY = 70;

    allChars.forEach((ch, idx) => {
      const angle = (idx / count) * Math.PI * 2 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radiusX;
      const y = centerY + Math.sin(angle) * radiusY;
      this.charPositions.set(ch, { x, y });
    });
  }

  private computeTraceSteps(): void {
    const steps: AlienStep[] = [];
    const inDegree: Record<string, number> = {};
    const graph: Record<string, Set<string>> = {};
    const words = this.words;

    // 收集全部字符
    for (const w of words) {
      for (const ch of w) {
        inDegree[ch] = 0;
        if (!graph[ch]) graph[ch] = new Set();
      }
    }

    const currentEdges: Array<[string, string]> = [];
    const cloneInDegree = () => ({ ...inDegree });
    const cloneEdges = () => [...currentEdges];

    steps.push({
      type: 'COMPARE_WORDS',
      inDegreeSnapshot: cloneInDegree(),
      graphEdges: cloneEdges(),
      queueSnapshot: [],
      resultStr: '',
      isError: false,
      message: `🚀 开始分析火星单词列表，逐对提取相邻单词的首个不同字符...`,
    });

    let hasPrefixError = false;

    // 第一阶段：比对相邻单词建图
    for (let i = 0; i < words.length - 1; i++) {
      const w1 = words[i];
      const w2 = words[i + 1];
      const minLen = Math.min(w1.length, w2.length);
      let j = 0;

      while (j < minLen && w1[j] === w2[j]) {
        j++;
      }

      if (j < minLen) {
        const u = w1[j];
        const v = w2[j];

        if (!graph[u].has(v)) {
          graph[u].add(v);
          inDegree[v]++;
          currentEdges.push([u, v]);

          steps.push({
            type: 'ADD_EDGE',
            wordIdx1: i,
            wordIdx2: i + 1,
            charIdx: j,
            edge: [u, v],
            inDegreeSnapshot: cloneInDegree(),
            graphEdges: cloneEdges(),
            queueSnapshot: [],
            resultStr: '',
            isError: false,
            message: `🔤 比较 "${w1}" 与 "${w2}"：首个不同字符为 '${u}' 与 '${v}' $\\implies$ 建立偏序边 ${u} → ${v} (入度++).`,
          });
        }
      } else if (w1.length > w2.length) {
        hasPrefixError = true;
        steps.push({
          type: 'PREFIX_ERROR',
          wordIdx1: i,
          wordIdx2: i + 1,
          inDegreeSnapshot: cloneInDegree(),
          graphEdges: cloneEdges(),
          queueSnapshot: [],
          resultStr: '',
          isError: true,
          message: `🚨 非法前缀异常！"${w1}" 以 "${w2}" 为前缀但长度更长，违反字典序基本法则！判定非法返回 ""！`,
        });
        break;
      }
    }

    if (hasPrefixError) {
      this.traceSteps = steps;
      return;
    }

    // 第二阶段：拓扑排序与判环
    const queue: string[] = [];
    for (const [ch, deg] of Object.entries(inDegree)) {
      if (deg === 0) queue.push(ch);
    }

    const cloneQueue = () => [...queue];

    steps.push({
      type: 'INIT_QUEUE',
      inDegreeSnapshot: cloneInDegree(),
      graphEdges: cloneEdges(),
      queueSnapshot: cloneQueue(),
      resultStr: '',
      isError: false,
      message: `⚡ 建图完毕！所有入度为 0 的无前驱字符 [${queue.join(', ')}] 入队，准备拓扑剥离。`,
    });

    let res = '';
    const totalKinds = Object.keys(inDegree).length;

    while (queue.length > 0) {
      const u = queue.shift()!;
      res += u;

      steps.push({
        type: 'POP_CHAR',
        poppedChar: u,
        inDegreeSnapshot: cloneInDegree(),
        graphEdges: cloneEdges(),
        queueSnapshot: cloneQueue(),
        resultStr: res,
        isError: false,
        message: `📥 字符 '${u}' 拓扑出队，加入火星字母表序列：[${res}]。`,
      });

      for (const v of graph[u]) {
        inDegree[v]--;
        if (inDegree[v] === 0) {
          queue.push(v);
        }
      }
    }

    if (res.length < totalKinds) {
      steps.push({
        type: 'CYCLE_ERROR',
        inDegreeSnapshot: cloneInDegree(),
        graphEdges: cloneEdges(),
        queueSnapshot: [],
        resultStr: '',
        isError: true,
        message: `🚨 拓扑排序检测到有向环！字符偏序存在逻辑自相矛盾，判定非法返回 ""！`,
      });
    } else {
      steps.push({
        type: 'SUCCESS',
        inDegreeSnapshot: cloneInDegree(),
        graphEdges: cloneEdges(),
        queueSnapshot: [],
        resultStr: res,
        isError: false,
        message: `🎉 拓扑排序完成！成功推导出火星语言字母表字典序: "${res}"！`,
      });
    }

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#alien-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: ALIEN_DICT_CODE_LANGUAGES,
      problemHtml: ALIEN_DICT_PROBLEM_HTML,
      analysisHtml: ALIEN_DICT_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步
    const stepBtn = this.root.querySelector('#btn-alien-step') as HTMLButtonElement | null;
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());

    // 自动播放
    const autoBtn = this.root.querySelector('#btn-alien-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-alien-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设
    this.root.querySelectorAll<HTMLButtonElement>('.alien-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_ALIEN';
        this.root?.querySelectorAll('.alien-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-alien-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        AlienAudio.isMuted = !AlienAudio.isMuted;
        soundBtn.textContent = AlienAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'COMPARE_WORDS') AlienAudio.playCompare();
      else if (cur.type === 'ADD_EDGE') AlienAudio.playAddEdge();
      else if (cur.isError) AlienAudio.playError();
      else if (cur.type === 'SUCCESS') AlienAudio.playWin();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-alien-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停推演';

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
    const playBtn = this.root?.querySelector('#btn-alien-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动推演';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#alien-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#alien-status-badge') as HTMLElement | null;
    const wordsList = this.root.querySelector('#alien-words-list') as HTMLElement | null;
    const resultOrderEl = this.root.querySelector('#alien-result-order') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.isError) {
        statusBadge.textContent = '🚨 异常：无合法字典序';
        statusBadge.style.background = '#fef2f2';
        statusBadge.style.color = '#ef4444';
      } else if (cur.type === 'SUCCESS') {
        statusBadge.textContent = `🎯 成功锁定: "${cur.resultStr}"`;
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (resultOrderEl) {
      resultOrderEl.textContent = cur.resultStr || (cur.isError ? '无解 ("")' : '推导中...');
    }

    if (wordsList) {
      wordsList.innerHTML = this.words
        .map((w, idx) => {
          const isW1 = idx === cur.wordIdx1;
          const isW2 = idx === cur.wordIdx2;
          const bg = isW1 || isW2 ? '#fef08a' : '#f8fafc';
          const border = isW1 || isW2 ? '#ca8a04' : '#cbd5e1';

          return `
          <div style="padding: 2px 8px; border-radius: 4px; border: 1px solid ${border}; background: ${bg}; font-family: monospace; font-weight: bold; font-size: 11px; margin-bottom: 3px;">
            ${idx + 1}. ${w}
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

      this.pulseAnim += dt * 0.005;
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

    // 1. 深色星空背景
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // 2. 绘制当前字符依赖边
    if (cur) {
      cur.graphEdges.forEach(([u, v]) => {
        const p1 = this.charPositions.get(u);
        const p2 = this.charPositions.get(v);
        if (!p1 || !p2) return;

        const isNewEdge = cur.edge && cur.edge[0] === u && cur.edge[1] === v;

        ctx.save();
        if (isNewEdge) {
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 12;
        } else {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
          ctx.lineWidth = 1.8;
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // 箭头
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const arrowLen = 8;
        const targetX = p2.x - 20 * Math.cos(angle);
        const targetY = p2.y - 20 * Math.sin(angle);

        ctx.fillStyle = ctx.strokeStyle;
        ctx.beginPath();
        ctx.moveTo(targetX, targetY);
        ctx.lineTo(targetX - arrowLen * Math.cos(angle - Math.PI / 6), targetY - arrowLen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(targetX - arrowLen * Math.cos(angle + Math.PI / 6), targetY - arrowLen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });
    }

    // 3. 绘制字符节点
    this.charPositions.forEach((pos, ch) => {
      const inDeg = cur?.inDegreeSnapshot[ch] ?? 0;
      const isPopped = cur && cur.resultStr.includes(ch);
      const isCurPopped = cur && cur.poppedChar === ch;
      const inQueue = cur && cur.queueSnapshot.includes(ch);

      ctx.save();

      let fillColor = '#1e293b';
      let strokeColor = '#64748b';
      let radius = 19;

      if (isCurPopped) {
        fillColor = '#ca8a04';
        strokeColor = '#facc15';
        radius = 22 + Math.sin(this.pulseAnim) * 2;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
      } else if (isPopped) {
        fillColor = '#065f46';
        strokeColor = '#34d399';
      } else if (inQueue) {
        fillColor = '#0369a1';
        strokeColor = '#38bdf8';
      }

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 字符
      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ch, pos.x, pos.y);

      // 入度徽章
      ctx.fillStyle = inDeg === 0 ? '#10b981' : '#ef4444';
      ctx.beginPath();
      ctx.arc(pos.x + 14, pos.y - 14, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 8.5px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${inDeg}`, pos.x + 14, pos.y - 14);

      ctx.restore();
    });

    ctx.restore();
  }
}

export const ALIEN_DICT_TEMPLATE = `
  <div id="algo-alien-dict-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">👽</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">火星词典与拓扑排序判环 (Alien Dictionary)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="alien-preset-btn active" data-preset="CLASSIC_ALIEN" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典火星词典</button>
          <button class="alien-preset-btn" data-preset="PREFIX_INVALID" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">🚨 非法前缀异常</button>
          <button class="alien-preset-btn" data-preset="CYCLE_CONFLICT" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">🚨 有向环自相矛盾</button>
          <button class="alien-preset-btn" data-preset="SIMPLE_TWO" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">简单双词 (z, x)</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="alien-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-alien-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-alien-autoplay" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(59,130,246,0.25);">▶️ 自动推演</button>
        <button id="btn-alien-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-alien-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #1e40af;">
      <div style="display: flex; gap: 14px; align-items: center;">
        <span>🛸 推导火星字母序: <b id="alien-result-order" style="color: #2563eb; font-size: 13px; font-family: monospace;">-</b></span>
      </div>
      <div id="alien-narration-box" style="font-weight: 700; color: #1e3a8a;">
        💡 准备就绪：比对相邻单词构建字符 DAG，并用拓扑排序推断全局字典序！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：单词比对条 + 字符 DAG Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="alien-canvas" width="460" height="230" style="width: 460px; height: 230px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🔴 节点右上角红色数字为当前入度 | 🟢 绿色为已出队字符
        </div>
      </div>

      <!-- 右侧：单词列表与代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; max-height: 100px; display: flex; flex-direction: column; gap: 2px;">
          <div style="font-size: 10.5px; font-weight: 700; color: #0f172a;">📜 词典单词序列 (相邻比对):</div>
          <div id="alien-words-list" style="display: flex; flex-direction: column; overflow-y: auto;"></div>
        </div>

        <div id="alien-terminal-mount" style="flex: 1; min-height: 180px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'alien-dict',
  name: '火星词典与拓扑排序判环',
  viewId: 'algo-alien-dict-view',
  category: 'graph',
  description: '火星词典算法：左程云 class059 字符偏序依赖建图、非法前缀陷阱拦截与拓扑排序判环 (LeetCode 269)',
  icon: '👽',
  template: ALIEN_DICT_TEMPLATE,
  Visualizer: AlienDictVisualizer,
  difficulty: 2,
  levelOrder: 24,
  learningGoal: '掌握火星词典字符偏序建图逻辑、非法前缀反转异常判定与 Kahn 拓扑判环机制',
});
