/**
 * 糖果王国·双向分配大派对 (Candy Kingdom: Two-Pass Greedy Feast)
 * 经典双向贪心算法、糖果堆叠物理与左右双向扫描透视：
 * 1. 🍭 60 FPS 糖果王国工坊 (Canvas 2D 糖果堆叠弹跳、评分星标、孩子角色与冲突表情)
 * 2. ↔️ 双向扫描器透视 (绿光正向扫描满足左规则、紫光反向扫描取 max 满足右规则)
 * 3. ⚡ 实时邻居冲突检测 (评分高于邻居却糖少时触发雷云哭泣警报)
 * 4. 🎛️ 经典峰谷预设题库 (下坡挑战、平原对等、经典高峰)
 * 5. 🔊 原生 Web Audio 糖果落盘清脆声、扫描光波与通关礼炮
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  CANDY_KINGDOM_CODE_LANGUAGES,
  CANDY_KINGDOM_PROBLEM_HTML,
  CANDY_KINGDOM_ANALYSIS_HTML,
} from './candy-kingdom-problem-content';

export interface ChildNode {
  id: number;
  rating: number;
  candies: number;
  avatar: string;
}

class CandyAudio {
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

  public static playDrop(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600 + Math.random() * 200, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playSweep(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  public static playConflict(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
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
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.25);
      });
    } catch {}
  }
}

export class CandyKingdomVisualizer extends StepVisualizer<any> {
  private ratings: number[] = [1, 3, 5, 4, 3, 2, 1];
  private children: ChildNode[] = [];

  // 双向扫描状态
  private currentPass: 'IDLE' | 'LEFT_TO_RIGHT' | 'RIGHT_TO_LEFT' | 'DONE' = 'IDLE';
  private scanIndex = -1;

  // 画布
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private lastTimestamp = 0;

  constructor() {
    super();
    this.codeLanguages = CANDY_KINGDOM_CODE_LANGUAGES;
    this.codeLines = CANDY_KINGDOM_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '分发糖果双向贪心算法引擎';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '糖果王国·双向分配大派对' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset([1, 3, 5, 4, 3, 2, 1]);
    this.initGameUI();
    this.startLoop();
  }

  public destroy(): void {
    super.destroy();
    if (this.animFrameId && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private loadPreset(ratings: number[]): void {
    this.ratings = ratings;
    const avatars = ['👦', '👧', '🧒', '👶', '🧑', '👱‍♀️', '👦'];
    this.children = ratings.map((r, i) => ({
      id: i,
      rating: r,
      candies: 1, // 初始每人 1 颗
      avatar: avatars[i % avatars.length],
    }));

    this.currentPass = 'IDLE';
    this.scanIndex = -1;
    this.updateHUD();
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#candy-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.mountTerminal({
      codeLanguages: CANDY_KINGDOM_CODE_LANGUAGES,
      problemHtml: CANDY_KINGDOM_PROBLEM_HTML,
      analysisHtml: CANDY_KINGDOM_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 第一次正向扫描 (左 -> 右)
    const btnLeftPass = this.root.querySelector('#btn-candy-left-pass') as HTMLButtonElement | null;
    if (btnLeftPass) {
      btnLeftPass.addEventListener('click', () => this.runLeftToRightPass());
    }

    // 第二次反向扫描 (右 -> 左)
    const btnRightPass = this.root.querySelector('#btn-candy-right-pass') as HTMLButtonElement | null;
    if (btnRightPass) {
      btnRightPass.addEventListener('click', () => this.runRightToLeftPass());
    }

    // 一键双向贪心全自动求解
    const btnAutoGreedy = this.root.querySelector('#btn-candy-auto') as HTMLButtonElement | null;
    if (btnAutoGreedy) {
      btnAutoGreedy.addEventListener('click', () => this.runFullTwoPass());
    }

    // 关卡预设
    this.root.querySelectorAll<HTMLButtonElement>('.candy-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.preset || 'MOUNTAIN';
        this.root?.querySelectorAll('.candy-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        if (type === 'VALLEY') this.loadPreset([1, 0, 2]);
        else if (type === 'PLATEAU') this.loadPreset([1, 2, 2]);
        else if (type === 'MOUNTAIN') this.loadPreset([1, 3, 5, 4, 3, 2, 1]);
        else if (type === 'CLIFFS') this.loadPreset([1, 2, 87, 87, 87, 2, 1]);
      });
    });

    // 重置
    const resetBtn = this.root.querySelector('#btn-candy-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.loadPreset(this.ratings));
    }
  }

  // 正向扫描：左 -> 右
  private runLeftToRightPass(callback?: () => void): void {
    this.currentPass = 'LEFT_TO_RIGHT';
    this.scanIndex = 1;
    CandyAudio.playSweep();

    const step = () => {
      if (this.scanIndex >= this.children.length) {
        this.updateHUD();
        if (callback) callback();
        return;
      }

      const prev = this.children[this.scanIndex - 1];
      const cur = this.children[this.scanIndex];

      if (cur.rating > prev.rating) {
        cur.candies = prev.candies + 1;
        CandyAudio.playDrop();
      }

      this.updateHUD();
      this.scanIndex++;
      setTimeout(step, 350);
    };

    step();
  }

  // 反向扫描：右 -> 左
  private runRightToLeftPass(): void {
    this.currentPass = 'RIGHT_TO_LEFT';
    this.scanIndex = this.children.length - 2;
    CandyAudio.playSweep();

    const step = () => {
      if (this.scanIndex < 0) {
        this.currentPass = 'DONE';
        CandyAudio.playWin();
        this.updateHUD();
        return;
      }

      const next = this.children[this.scanIndex + 1];
      const cur = this.children[this.scanIndex];

      if (cur.rating > next.rating) {
        cur.candies = Math.max(cur.candies, next.candies + 1);
        CandyAudio.playDrop();
      }

      this.updateHUD();
      this.scanIndex--;
      setTimeout(step, 350);
    };

    step();
  }

  private runFullTwoPass(): void {
    this.children.forEach((c) => (c.candies = 1));
    this.runLeftToRightPass(() => {
      setTimeout(() => {
        this.runRightToLeftPass();
      }, 500);
    });
  }

  private checkConflicts(): { hasConflict: boolean; conflictIds: Set<number> } {
    const conflictIds = new Set<number>();
    const n = this.children.length;

    for (let i = 0; i < n; i++) {
      const cur = this.children[i];
      if (i > 0) {
        const left = this.children[i - 1];
        if (cur.rating > left.rating && cur.candies <= left.candies) {
          conflictIds.add(i);
        }
      }
      if (i < n - 1) {
        const right = this.children[i + 1];
        if (cur.rating > right.rating && cur.candies <= right.candies) {
          conflictIds.add(i);
        }
      }
    }

    return { hasConflict: conflictIds.size > 0, conflictIds };
  }

  private updateHUD(): void {
    if (!this.root) return;

    const totalEl = this.root.querySelector('#candy-total-sum') as HTMLElement | null;
    const statusEl = this.root.querySelector('#candy-status-badge') as HTMLElement | null;
    const passInfoEl = this.root.querySelector('#candy-pass-info') as HTMLElement | null;

    const totalCandies = this.children.reduce((acc, c) => acc + c.candies, 0);
    if (totalEl) totalEl.textContent = `🍬 糖果总数: ${totalCandies} 颗`;

    const { hasConflict } = this.checkConflicts();

    if (passInfoEl) {
      if (this.currentPass === 'LEFT_TO_RIGHT') {
        passInfoEl.innerHTML = `🟢 <b>正向扫描中 (左 ➔ 右)</b>: 满足 ratings[i] > ratings[i-1] 则 candies[i] = candies[i-1] + 1`;
      } else if (this.currentPass === 'RIGHT_TO_LEFT') {
        passInfoEl.innerHTML = `🟣 <b>反向扫描中 (右 ➔ 左)</b>: 满足 ratings[i] > ratings[i+1] 则 candies[i] = max(candies[i], candies[i+1] + 1)`;
      } else if (this.currentPass === 'DONE') {
        passInfoEl.innerHTML = `🏆 <b>双向贪心完毕！</b> 全体孩子糖果分配达到全局最小最优解！`;
      } else {
        passInfoEl.innerHTML = `💡 点击下方按钮体验两次贪心扫描如何化解复杂的左右邻居约束`;
      }
    }

    if (statusEl) {
      if (this.currentPass === 'DONE' && !hasConflict) {
        statusEl.textContent = '🏆 全局最优解达成！';
        statusEl.style.background = '#f0fdf4';
        statusEl.style.color = '#16a34a';
      } else if (hasConflict) {
        statusEl.textContent = '⚠️ 邻居约束冲突中';
        statusEl.style.background = '#fef2f2';
        statusEl.style.color = '#dc2626';
      } else {
        statusEl.textContent = '🍬 糖果派发中';
        statusEl.style.background = '#eff6ff';
        statusEl.style.color = '#2563eb';
      }
    }
  }

  private startLoop(): void {
    if (typeof requestAnimationFrame !== 'function') return;
    const loop = (timestamp: number) => {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      this.lastTimestamp = timestamp;

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
    const n = this.children.length;
    const cellW = width / (n + 1);

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. 糖果城堡工坊背景
    ctx.fillStyle = '#fdf4ff';
    ctx.fillRect(0, 0, width, height);

    // 地面软垫
    ctx.fillStyle = '#f5d0fe';
    ctx.fillRect(0, height - 40, width, 40);

    const { conflictIds } = this.checkConflicts();

    // 2. 绘制扫描光束 (Scanner Beam)
    if (this.scanIndex >= 0 && this.scanIndex < n) {
      const beamX = (this.scanIndex + 1) * cellW;
      const isLeftPass = this.currentPass === 'LEFT_TO_RIGHT';

      ctx.fillStyle = isLeftPass ? 'rgba(34, 197, 94, 0.18)' : 'rgba(168, 85, 247, 0.18)';
      ctx.fillRect(beamX - cellW * 0.45, 0, cellW * 0.9, height);

      ctx.strokeStyle = isLeftPass ? '#22c55e' : '#a855f7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(beamX, 0);
      ctx.lineTo(beamX, height);
      ctx.stroke();
    }

    // 3. 绘制孩子与堆叠糖果
    for (let i = 0; i < n; i++) {
      const c = this.children[i];
      const cx = (i + 1) * cellW;
      const cy = height - 55;
      const isConflicted = conflictIds.has(i);

      ctx.save();
      ctx.translate(cx, cy);

      // 孩子头像
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isConflicted ? '😭' : c.avatar, 0, 0);

      // 评分角标
      ctx.font = 'bold 9.5px monospace';
      ctx.fillStyle = '#701a75';
      ctx.fillText(`⭐${c.rating}`, 0, 24);

      // 向上堆叠糖果
      for (let k = 0; k < c.candies; k++) {
        const candyY = -22 - k * 16;
        ctx.font = '14px sans-serif';
        ctx.fillText('🍬', 0, candyY);
      }

      // 糖果总数标签
      ctx.font = 'bold 9.5px monospace';
      ctx.fillStyle = isConflicted ? '#ef4444' : '#16a34a';
      ctx.fillText(`x${c.candies}`, 0, -26 - c.candies * 16);

      ctx.restore();
    }

    ctx.restore();
  }
}

export const CANDY_KINGDOM_TEMPLATE = `
  <div id="algo-candy-kingdom-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏：题库预设与功能控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🍬</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">糖果王国·双向分配大派对</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="candy-preset-btn active" data-preset="MOUNTAIN" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典高峰峡谷</button>
          <button class="candy-preset-btn" data-preset="VALLEY" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">简单山谷 [1,0,2]</button>
          <button class="candy-preset-btn" data-preset="PLATEAU" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">平原对等 [1,2,2]</button>
          <button class="candy-preset-btn" data-preset="CLIFFS" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">🔥 极险断崖</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="candy-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">🍬 糖果派发中</span>
        <button id="btn-candy-left-pass" style="background: #f0fdf4; color: #166534; border: 1px solid #86efac; border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">🟢 1. 正向扫描 (左➔右)</button>
        <button id="btn-candy-right-pass" style="background: #faf5ff; color: #6b21a8; border: 1px solid #d8b4fe; border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">🟣 2. 反向扫描 (右➔左)</button>
        <button id="btn-candy-auto" style="background: linear-gradient(135deg, #a855f7, #7e22ce); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(168,85,247,0.25);">✨ 双向贪心通关</button>
        <button id="btn-candy-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 概念横幅与双向扫描提示 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #faf5ff; border: 1px solid #f3e8ff; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #6b21a8;">
      <span id="candy-pass-info">💡 核心原理：先从左向右满足左邻居规则，再从右向左满足右邻居规则取 max()！</span>
      <span id="candy-total-sum" style="font-weight: 800; color: #a21caf;">🍬 糖果总数: 7 颗</span>
    </div>

    <!-- 主交互区：左侧 60 FPS 糖果工坊 Canvas + 右侧终端 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.35fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：糖果沙盘 Canvas -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <div style="position: relative; display: flex; justify-content: center; background: #fdf4ff; border-radius: 6px; overflow: hidden; border: 1px solid #f0abfc;">
          <canvas id="candy-canvas" width="460" height="200" style="width: 460px; height: 200px;"></canvas>
        </div>
        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          💡 两次独立贪心扫描完美解决了左右邻居相互依赖的难题，时间复杂度仅为 O(N)！
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="candy-terminal-mount" style="flex: 1; min-height: 220px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'candy-kingdom',
  name: '糖果王国·双向分配大派对',
  viewId: 'algo-candy-kingdom-view',
  category: 'game',
  description: '双向贪心算法游戏：糖果堆叠物理、评分星标、正向与反向双光束扫描与峰谷全局最优分配',
  icon: '🍬',
  template: CANDY_KINGDOM_TEMPLATE,
  Visualizer: CandyKingdomVisualizer,
  difficulty: 3,
  levelOrder: 11,
  learningGoal: '掌握经典双向贪心算法如何通过拆解左右依赖，在两次 O(N) 线性遍历中解决局部峰谷最值分配问题',
});
