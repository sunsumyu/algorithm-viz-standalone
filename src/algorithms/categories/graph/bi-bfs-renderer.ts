/**
 * 双向广搜 (Bidirectional BFS / Word Ladder) 可视化引擎
 * 参考左程云《算法通关课》【必备篇】class063: 单词接龙与双向相向波前相遇机制
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  BI_BFS_CODE_LANGUAGES,
  BI_BFS_PROBLEM_HTML,
  BI_BFS_ANALYSIS_HTML,
} from './bi-bfs-problem-content';

export interface WordNode {
  word: string;
  x: number;
  y: number;
  forwardDist: number;
  backwardDist: number;
  isStart: boolean;
  isEnd: boolean;
}

export interface BiBFSStep {
  type: 'EXPAND_FORWARD' | 'EXPAND_BACKWARD' | 'SWAP_SETS' | 'COLLISION' | 'NO_PATH';
  smallSet: string[];
  bigSet: string[];
  currentWord?: string;
  nextWord?: string;
  activeDirection: 'FORWARD' | 'BACKWARD';
  stepCount: number;
  collisionEdge?: [string, string];
  finalPath?: string[];
  forwardVisited: string[];
  backwardVisited: string[];
  message: string;
}

class BiAudio {
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

  public static playForwardWave(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  public static playBackwardWave(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  public static playCollision(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.28);
      });
    } catch {}
  }
}

export class BiBFSVisualizer extends StepVisualizer<any> {
  // 数据与状态
  private beginWord = 'hit';
  private endWord = 'cog';
  private wordList: string[] = ['hot', 'dot', 'dog', 'lot', 'log', 'cog'];
  private nodes: Map<string, WordNode> = new Map();
  private edges: Array<[string, string]> = [];

  // 推演状态机
  private traceSteps: BiBFSStep[] = [];
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
    this.codeLanguages = BI_BFS_CODE_LANGUAGES;
    this.codeLines = BI_BFS_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '双向广搜相遇算法引擎 (LeetCode 127)';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '双向广搜' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset('CLASSIC_LADDER');
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

  private isAdjacent(w1: string, w2: string): boolean {
    if (w1.length !== w2.length) return false;
    let diff = 0;
    for (let i = 0; i < w1.length; i++) {
      if (w1[i] !== w2[i]) {
        diff++;
        if (diff > 1) return false;
      }
    }
    return diff === 1;
  }

  private loadPreset(presetKey: string): void {
    this.stopAutoPlay();

    if (presetKey === 'CLASSIC_LADDER') {
      this.beginWord = 'hit';
      this.endWord = 'cog';
      this.wordList = ['hot', 'dot', 'dog', 'lot', 'log', 'cog'];
    } else if (presetKey === 'LEAD_TO_GOLD') {
      this.beginWord = 'lead';
      this.endWord = 'gold';
      this.wordList = ['load', 'goad', 'head', 'heal', 'teal', 'tell', 'toll', 'gold'];
    } else if (presetKey === 'DUAL_BRANCH') {
      this.beginWord = 'cat';
      this.endWord = 'dog';
      this.wordList = ['cot', 'cog', 'bat', 'bag', 'bog', 'dog'];
    } else if (presetKey === 'NO_PATH') {
      this.beginWord = 'hit';
      this.endWord = 'cog';
      this.wordList = ['hot', 'dot', 'dog', 'lot', 'log']; // 缺失 cog
    }

    this.buildGraphTopology();
    this.computeTraceSteps();
    this.currentStepPtr = 0;
    this.updateHUD();
  }

  private buildGraphTopology(): void {
    const allWords = Array.from(new Set([this.beginWord, ...this.wordList]));
    this.nodes.clear();
    this.edges = [];

    // 建立所有节点与边
    for (let i = 0; i < allWords.length; i++) {
      for (let j = i + 1; j < allWords.length; j++) {
        if (this.isAdjacent(allWords[i], allWords[j])) {
          this.edges.push([allWords[i], allWords[j]]);
        }
      }
    }

    // 确定画布坐标（美观布局）
    const count = allWords.length;
    const startX = 60;
    const endX = 400;
    const centerY = 115;

    allWords.forEach((word, idx) => {
      const isStart = word === this.beginWord;
      const isEnd = word === this.endWord;

      let x = 0;
      let y = centerY;

      if (isStart) {
        x = startX;
        y = centerY;
      } else if (isEnd) {
        x = endX;
        y = centerY;
      } else {
        const ratio = (idx + 0.5) / count;
        x = startX + ratio * (endX - startX);
        const yOffset = (idx % 2 === 0 ? -1 : 1) * (35 + ((idx * 17) % 35));
        y = centerY + yOffset;
      }

      this.nodes.set(word, {
        word,
        x,
        y,
        forwardDist: -1,
        backwardDist: -1,
        isStart,
        isEnd,
      });
    });
  }

  private computeTraceSteps(): void {
    const dict = new Set(this.wordList);
    const steps: BFSStep[] = [];

    if (!dict.has(this.endWord)) {
      steps.push({
        type: 'NO_PATH',
        smallSet: [this.beginWord],
        bigSet: [],
        activeDirection: 'FORWARD',
        stepCount: 0,
        forwardVisited: [this.beginWord],
        backwardVisited: [],
        message: `🚫 目标单词 "${this.endWord}" 不在字典中，无法形成转换序列！`,
      });
      this.traceSteps = steps;
      return;
    }

    let smallLevel = new Set([this.beginWord]);
    let bigLevel = new Set([this.endWord]);
    let forwardVisited = new Set([this.beginWord]);
    let backwardVisited = new Set([this.endWord]);
    let isForwardCurrent = true; // smallLevel 是否为正向
    let len = 2;

    const parentForward: Map<string, string> = new Map();
    const parentBackward: Map<string, string> = new Map();

    const getFullIntersectionPath = (meet1: string, meet2: string, forwardNode: string, backwardNode: string): string[] => {
      const path1: string[] = [];
      let c1: string | undefined = forwardNode;
      while (c1) {
        path1.unshift(c1);
        c1 = parentForward.get(c1);
      }
      const path2: string[] = [];
      let c2: string | undefined = backwardNode;
      while (c2) {
        path2.push(c2);
        c2 = parentBackward.get(c2);
      }
      return [...path1, ...path2];
    };

    steps.push({
      type: 'EXPAND_FORWARD',
      smallSet: Array.from(smallLevel),
      bigSet: Array.from(bigLevel),
      activeDirection: 'FORWARD',
      stepCount: 1,
      forwardVisited: Array.from(forwardVisited),
      backwardVisited: Array.from(backwardVisited),
      message: `🚀 初始化：正向波前从 "${this.beginWord}" 出发，反向波前从 "${this.endWord}" 出发。`,
    });

    let found = false;

    while (smallLevel.size > 0 && !found) {
      const nextLevel = new Set<string>();
      const curDirection = isForwardCurrent ? 'FORWARD' : 'BACKWARD';

      for (const word of smallLevel) {
        for (const targetWord of dict) {
          if (this.isAdjacent(word, targetWord)) {
            // 检查是否碰撞相遇
            if (bigLevel.has(targetWord)) {
              found = true;
              const fNode = isForwardCurrent ? word : targetWord;
              const bNode = isForwardCurrent ? targetWord : word;
              const fullPath = getFullIntersectionPath(word, targetWord, fNode, bNode);

              steps.push({
                type: 'COLLISION',
                smallSet: Array.from(smallLevel),
                bigSet: Array.from(bigLevel),
                currentWord: word,
                nextWord: targetWord,
                activeDirection: curDirection,
                stepCount: len,
                collisionEdge: [word, targetWord],
                finalPath: fullPath,
                forwardVisited: Array.from(forwardVisited),
                backwardVisited: Array.from(backwardVisited),
                message: `✨ 双向波前相遇碰撞！"${word}" 与 "${targetWord}" 成功接龙！最短路径总单词数: ${len}！🎉`,
              });
              break;
            }

            // 未访问且在字典中
            const visitedTarget = isForwardCurrent ? forwardVisited : backwardVisited;
            if (!visitedTarget.has(targetWord)) {
              visitedTarget.add(targetWord);
              nextLevel.add(targetWord);
              if (isForwardCurrent) parentForward.set(targetWord, word);
              else parentBackward.set(targetWord, word);

              steps.push({
                type: isForwardCurrent ? 'EXPAND_FORWARD' : 'EXPAND_BACKWARD',
                smallSet: Array.from(smallLevel),
                bigSet: Array.from(bigLevel),
                currentWord: word,
                nextWord: targetWord,
                activeDirection: curDirection,
                stepCount: len,
                forwardVisited: Array.from(forwardVisited),
                backwardVisited: Array.from(backwardVisited),
                message: `🌊 [${isForwardCurrent ? '正向' : '反向'}扩散] "${word}" → "${targetWord}" 加入下一层波前集合。`,
              });
            }
          }
        }
        if (found) break;
      }

      if (found) break;

      if (nextLevel.size === 0) {
        steps.push({
          type: 'NO_PATH',
          smallSet: [],
          bigSet: Array.from(bigLevel),
          activeDirection: curDirection,
          stepCount: 0,
          forwardVisited: Array.from(forwardVisited),
          backwardVisited: Array.from(backwardVisited),
          message: `🚫 波前无法继续扩散，起终点不连通！`,
        });
        break;
      }

      // 小集合优先交换
      if (nextLevel.size <= bigLevel.size) {
        smallLevel = nextLevel;
      } else {
        smallLevel = bigLevel;
        bigLevel = nextLevel;
        isForwardCurrent = !isForwardCurrent; // 翻转方向
        steps.push({
          type: 'SWAP_SETS',
          smallSet: Array.from(smallLevel),
          bigSet: Array.from(bigLevel),
          activeDirection: isForwardCurrent ? 'FORWARD' : 'BACKWARD',
          stepCount: len,
          forwardVisited: Array.from(forwardVisited),
          backwardVisited: Array.from(backwardVisited),
          message: `🔄 [小集合优先] 对向集合规模更小 (${smallLevel.size} < ${bigLevel.size})，调转波前扩散方向！`,
        });
      }
      len++;
    }

    this.traceSteps = steps;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#bibfs-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: BI_BFS_CODE_LANGUAGES,
      problemHtml: BI_BFS_PROBLEM_HTML,
      analysisHtml: BI_BFS_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 单步推演
    const stepBtn = this.root.querySelector('#btn-bibfs-step') as HTMLButtonElement | null;
    if (stepBtn) {
      stepBtn.addEventListener('click', () => this.stepForward());
    }

    // 自动推演
    const autoBtn = this.root.querySelector('#btn-bibfs-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) {
          this.stopAutoPlay();
        } else {
          this.startAutoPlay();
        }
      });
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-bibfs-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.currentStepPtr = 0;
        this.updateHUD();
      });
    }

    // 预设选择
    this.root.querySelectorAll<HTMLButtonElement>('.bibfs-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset || 'CLASSIC_LADDER';
        this.root?.querySelectorAll('.bibfs-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(preset);
      });
    });

    // 音效
    const soundBtn = this.root.querySelector('#btn-bibfs-sound') as HTMLButtonElement | null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        BiAudio.isMuted = !BiAudio.isMuted;
        soundBtn.textContent = BiAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private stepForward(): void {
    if (this.currentStepPtr < this.traceSteps.length - 1) {
      this.currentStepPtr++;
      const cur = this.traceSteps[this.currentStepPtr];
      if (cur.type === 'EXPAND_FORWARD') BiAudio.playForwardWave();
      else if (cur.type === 'EXPAND_BACKWARD') BiAudio.playBackwardWave();
      else if (cur.type === 'COLLISION') BiAudio.playCollision();

      this.updateHUD();
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-bibfs-autoplay') as HTMLButtonElement | null;
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
    const playBtn = this.root?.querySelector('#btn-bibfs-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动推演';
  }

  private updateHUD(): void {
    if (!this.root || this.traceSteps.length === 0) return;

    const cur = this.traceSteps[this.currentStepPtr];
    const narrationBox = this.root.querySelector('#bibfs-narration-box') as HTMLElement | null;
    const statusBadge = this.root.querySelector('#bibfs-status-badge') as HTMLElement | null;
    const smallSetList = this.root.querySelector('#bibfs-small-set') as HTMLElement | null;
    const bigSetList = this.root.querySelector('#bibfs-big-set') as HTMLElement | null;
    const wordCountStat = this.root.querySelector('#bibfs-wordcount-stat') as HTMLElement | null;

    if (narrationBox) narrationBox.innerHTML = `💡 ${cur.message}`;

    if (statusBadge) {
      if (cur.type === 'COLLISION') {
        statusBadge.textContent = `🎯 碰头成功 (长度 ${cur.stepCount})`;
        statusBadge.style.background = '#f0fdf4';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = `步骤 ${this.currentStepPtr + 1}/${this.traceSteps.length}`;
        statusBadge.style.background = '#eff6ff';
        statusBadge.style.color = '#2563eb';
      }
    }

    if (wordCountStat) {
      wordCountStat.textContent = cur.finalPath ? `${cur.finalPath.length}` : '搜索中...';
    }

    if (smallSetList) {
      smallSetList.innerHTML = cur.smallSet.map((w) => `<span style="background: #38bdf8; color: #022c22; font-weight: bold; padding: 2px 6px; border-radius: 4px; font-size: 11px; margin-right: 4px;">${w}</span>`).join('') || '空';
    }

    if (bigSetList) {
      bigSetList.innerHTML = cur.bigSet.map((w) => `<span style="background: #ec4899; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 4px; font-size: 11px; margin-right: 4px;">${w}</span>`).join('') || '空';
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

    // 1. 深邃夜空背景
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // 2. 绘制常规拓扑边
    this.edges.forEach(([u, v]) => {
      const n1 = this.nodes.get(u);
      const n2 = this.nodes.get(v);
      if (!n1 || !n2) return;

      ctx.save();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(n1.x, n1.y);
      ctx.lineTo(n2.x, n2.y);
      ctx.stroke();
      ctx.restore();
    });

    // 3. 绘制最终碰撞相遇路径
    if (cur && cur.finalPath && cur.finalPath.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      for (let i = 0; i < cur.finalPath.length; i++) {
        const n = this.nodes.get(cur.finalPath[i]);
        if (n) {
          if (i === 0) ctx.moveTo(n.x, n.y);
          else ctx.lineTo(n.x, n.y);
        }
      }
      ctx.stroke();
      ctx.restore();
    }

    // 4. 绘制当前活跃扩散边
    if (cur && cur.currentWord && cur.nextWord) {
      const n1 = this.nodes.get(cur.currentWord);
      const n2 = this.nodes.get(cur.nextWord);
      if (n1 && n2) {
        ctx.save();
        const isF = cur.activeDirection === 'FORWARD';
        ctx.strokeStyle = isF ? '#38bdf8' : '#ec4899';
        ctx.lineWidth = 3;
        ctx.shadowColor = isF ? '#38bdf8' : '#ec4899';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 5. 绘制所有单词节点
    this.nodes.forEach((node) => {
      const isStart = node.word === this.beginWord;
      const isEnd = node.word === this.endWord;
      const inForward = cur && cur.forwardVisited.includes(node.word);
      const inBackward = cur && cur.backwardVisited.includes(node.word);
      const isCurrent = cur && cur.currentWord === node.word;

      ctx.save();

      let fillColor = '#1e293b';
      let strokeColor = '#64748b';
      let radius = 18;

      if (inForward && inBackward) {
        fillColor = '#065f46'; // 碰撞交汇翡翠绿
        strokeColor = '#34d399';
        radius = 21 + Math.sin(this.pulseAnim) * 2;
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 14;
      } else if (inForward) {
        fillColor = '#0369a1'; // 正向蓝
        strokeColor = '#38bdf8';
      } else if (inBackward) {
        fillColor = '#831843'; // 反向粉
        strokeColor = '#ec4899';
      } else if (isStart) {
        strokeColor = '#38bdf8';
      } else if (isEnd) {
        strokeColor = '#ec4899';
      }

      if (isCurrent) {
        strokeColor = '#facc15';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 10;
      } else {
        ctx.lineWidth = 2;
      }

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 单词文字
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.word, node.x, node.y);

      // 起终点徽章
      if (isStart) {
        ctx.font = '9px sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('起点', node.x, node.y - radius - 6);
      } else if (isEnd) {
        ctx.font = '9px sans-serif';
        ctx.fillStyle = '#ec4899';
        ctx.fillText('终点', node.x, node.y - radius - 6);
      }

      ctx.restore();
    });

    ctx.restore();
  }
}

export const BI_BFS_TEMPLATE = `
  <div id="algo-bi-bfs-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🔤</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">双向广搜相遇 (Bidirectional BFS)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="bibfs-preset-btn active" data-preset="CLASSIC_LADDER" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典接龙 (hit→cog)</button>
          <button class="bibfs-preset-btn" data-preset="LEAD_TO_GOLD" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">长链演化 (lead→gold)</button>
          <button class="bibfs-preset-btn" data-preset="DUAL_BRANCH" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">双分支拓扑 (cat→dog)</button>
          <button class="bibfs-preset-btn" data-preset="NO_PATH" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">不可达死胡同</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="bibfs-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">准备就绪</span>
        <button id="btn-bibfs-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-bibfs-autoplay" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(59,130,246,0.25);">▶️ 自动推演</button>
        <button id="btn-bibfs-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-bibfs-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #1e40af;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <span>🎯 最短转换单词数: <b id="bibfs-wordcount-stat" style="color: #2563eb; font-size: 12px;">搜索中...</b></span>
        <span>⚡ 空间剪枝: <b style="color: #059669;">2 × B^(d/2) 极速相遇</b></span>
      </div>
      <div id="bibfs-narration-box" style="font-weight: 700; color: #1e3a8a;">
        💡 准备就绪：观察正向波前 (蓝) 与反向波前 (粉) 的相向扩散与碰撞融合！
      </div>
    </div>

    <!-- 主展示区 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：拓扑网络 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="bibfs-canvas" width="460" height="230" style="width: 460px; height: 230px;"></canvas>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🔵 正向波前 (hit) 扩散 ➡️ 💥 碰头交汇 💥 ⬅️ 🟣 反向波前 (cog) 扩散
        </div>
      </div>

      <!-- 右侧：当前波前集合与代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; max-height: 110px; display: flex; flex-direction: column; gap: 4px;">
          <div style="font-size: 10.5px; font-weight: 700; color: #0284c7;">🔷 当前较小波前集合 (smallLevel - 优先扩散):</div>
          <div id="bibfs-small-set" style="display: flex; flex-wrap: wrap; gap: 2px;"></div>
          <div style="font-size: 10.5px; font-weight: 700; color: #db2777;">🔶 对向目标波前集合 (bigLevel):</div>
          <div id="bibfs-big-set" style="display: flex; flex-wrap: wrap; gap: 2px;"></div>
        </div>

        <div id="bibfs-terminal-mount" style="flex: 1; min-height: 180px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'bi-bfs',
  name: '双向广搜相遇 (Bidirectional BFS)',
  viewId: 'algo-bi-bfs-view',
  category: 'graph',
  description: '双向广搜算法：左程云 class063 单词接龙 (LeetCode 127)、双向相向波前相遇碰撞、小集合优先贪心扩张与指数级剪枝',
  icon: '🔤',
  template: BI_BFS_TEMPLATE,
  Visualizer: BiBFSVisualizer,
  difficulty: 2,
  levelOrder: 22,
  learningGoal: '掌握双向广搜状态空间剪枝原理（从 O(B^d) 骤降至 2*O(B^(d/2))）以及小集合优先交换技术',
});
