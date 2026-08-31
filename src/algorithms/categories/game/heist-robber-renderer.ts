/**
 * 暗夜神偷·街区金库潜行 (Cyberpunk House Robber: Heist DP)
 * 经典动态规划算法（LeetCode 198 打家劫舍 & LeetCode 213 环形打家劫舍）：
 * 1. 🥷 60 FPS 霓虹街区潜行引擎 (Canvas 2D 拟真赛博都市夜景、金库别墅、红外激光警戒线与忍者跑酷)
 * 2. ⚡ 动态规划状态转移可视化 (dp[i] = max(dp[i-1], dp[i-2] + nums[i]) 实时二选一决策推演)
 * 3. ⏱️ 步骤动规推演与单步调试 (单步分析不偷/偷窃收益对比、最优路径追踪与全息数据流)
 * 4. 🎛️ 经典题库预设 (LeetCode 经典波段、高额悬赏街区、跳步收益对比与随机都市生成)
 * 5. 🔊 原生 Web Audio 引擎潜行脚步、金币碰撞、红外警报与通关大捷音效
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  HEIST_ROBBER_CODE_LANGUAGES,
  HEIST_ROBBER_PROBLEM_HTML,
  HEIST_ROBBER_ANALYSIS_HTML,
} from './heist-robber-problem-content';

export interface HouseItem {
  id: number;
  val: number;
  isLooted: boolean;
  isAlarmLocked: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface CoinParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
}

class HeistAudio {
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

  public static playFootstep(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {}
  }

  public static playLoot(val: number = 10): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const baseFreq = 520 + Math.min(val * 15, 600);
      const chord = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.04 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.04);
        osc.stop(ctx.currentTime + idx * 0.04 + 0.18);
      });
    } catch {}
  }

  public static playAlarm(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.setValueAtTime(480, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {}
  }

  public static playDecision(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
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
      const notes = [392, 523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.25);
      });
    } catch {}
  }
}

export class HeistRobberVisualizer extends StepVisualizer<any> {
  // 核心数据
  private rawHouses: number[] = [2, 7, 9, 3, 1];
  private houses: HouseItem[] = [];
  private dpTable: number[] = [];
  private optimalLoot = 12;
  private currentLoot = 0;

  // 动规推演状态
  private isAutoPlaying = false;
  private autoPlayTimer: any = null;
  private dpStepIndex = 0;
  private ninjaTargetIndex = 0;
  private ninjaCurrentX = 40;
  private playSpeed = 1;

  // 画布与特效
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private lastTimestamp = 0;
  private particles: CoinParticle[] = [];
  private floatingTexts: FloatingText[] = [];
  private laserPulse = 0;

  constructor() {
    super();
    this.codeLanguages = HEIST_ROBBER_CODE_LANGUAGES;
    this.codeLines = HEIST_ROBBER_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '打家劫舍动态规划状态机引擎';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '暗夜神偷·街区金库潜行' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadPreset([2, 7, 9, 3, 1]);
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

  private calculateOptimalDP(nums: number[]): { maxVal: number; dp: number[]; chosen: boolean[] } {
    const n = nums.length;
    if (n === 0) return { maxVal: 0, dp: [], chosen: [] };
    if (n === 1) return { maxVal: nums[0], dp: [nums[0]], chosen: [true] };

    const dp = new Array(n).fill(0);
    dp[0] = nums[0];
    dp[1] = Math.max(nums[0], nums[1]);

    for (let i = 2; i < n; i++) {
      dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);
    }

    // 回溯求最优选择集合
    const chosen = new Array(n).fill(false);
    let i = n - 1;
    while (i >= 0) {
      if (i === 0) {
        if (dp[0] > 0) chosen[0] = true;
        break;
      } else if (i === 1) {
        if (nums[1] > nums[0]) chosen[1] = true;
        else chosen[0] = true;
        break;
      } else {
        if (dp[i] === dp[i - 2] + nums[i]) {
          chosen[i] = true;
          i -= 2;
        } else {
          i -= 1;
        }
      }
    }

    return { maxVal: dp[n - 1], dp, chosen };
  }

  private loadPreset(nums: number[]): void {
    this.stopAutoPlay();
    this.rawHouses = nums;
    const { maxVal, dp } = this.calculateOptimalDP(nums);
    this.optimalLoot = maxVal;
    this.dpTable = new Array(nums.length).fill(0);

    const houseColors = ['#0284c7', '#0d9488', '#d97706', '#7c3aed', '#db2777', '#4f46e5', '#ea580c'];
    this.houses = nums.map((val, i) => ({
      id: i,
      val,
      isLooted: false,
      isAlarmLocked: false,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      color: houseColors[i % houseColors.length],
    }));

    this.currentLoot = 0;
    this.dpStepIndex = 0;
    this.ninjaTargetIndex = 0;
    this.particles = [];
    this.floatingTexts = [];

    this.recalculateAlarmLocks();
    this.updateHUD();
    this.logNarration(`🏙️ 街区就绪！共有 ${nums.length} 座金库别墅，理论最大收益为 $${this.optimalLoot}。点击房屋规划潜行路线！`);
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#heist-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.bindCanvasEvents();
    }

    this.mountTerminal({
      codeLanguages: HEIST_ROBBER_CODE_LANGUAGES,
      problemHtml: HEIST_ROBBER_PROBLEM_HTML,
      analysisHtml: HEIST_ROBBER_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 1. 动规单步推演按钮
    const stepBtn = this.root.querySelector('#btn-heist-step') as HTMLButtonElement | null;
    if (stepBtn) {
      stepBtn.addEventListener('click', () => this.runDPSingleStep());
    }

    // 2. 动规自动求解按钮
    const autoBtn = this.root.querySelector('#btn-heist-autoplay') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (this.isAutoPlaying) {
          this.stopAutoPlay();
        } else {
          this.startAutoPlay();
        }
      });
    }

    // 3. 一键最优潜行
    const solveBtn = this.root.querySelector('#btn-heist-solve') as HTMLButtonElement | null;
    if (solveBtn) {
      solveBtn.addEventListener('click', () => {
        const { chosen } = this.calculateOptimalDP(this.rawHouses);
        this.houses.forEach((h, idx) => {
          h.isLooted = chosen[idx];
        });
        this.recalculateAlarmLocks();
        this.currentLoot = this.houses.filter((h) => h.isLooted).reduce((sum, h) => sum + h.val, 0);
        HeistAudio.playWin();
        this.logNarration(`🏆 动态规划最优路线加载完成！总收益 $${this.currentLoot} 完美规避所有相邻红外激光警报！`);
        this.updateHUD();
      });
    }

    // 4. 预设关卡切换
    this.root.querySelectorAll<HTMLButtonElement>('.heist-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.preset || 'CLASSIC';
        this.root?.querySelectorAll('.heist-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        if (type === 'CLASSIC') this.loadPreset([2, 7, 9, 3, 1]);
        else if (type === 'ALTERNATE') this.loadPreset([1, 2, 3, 1]);
        else if (type === 'HIGH_ROLLER') this.loadPreset([20, 1, 1, 35, 2, 50, 1]);
        else if (type === 'CIRCULAR') this.loadPreset([2, 3, 2, 4, 3]);
        else if (type === 'RANDOM') this.generateRandomLevel();
      });
    });

    // 5. 重置按钮
    const resetBtn = this.root.querySelector('#btn-heist-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.loadPreset(this.rawHouses));
    }

    // 6. 静音控制
    const muteBtn = this.root.querySelector('#btn-heist-sound') as HTMLButtonElement | null;
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        HeistAudio.isMuted = !HeistAudio.isMuted;
        muteBtn.textContent = HeistAudio.isMuted ? '🔇 静音' : '🔊 音效';
      });
    }
  }

  private bindCanvasEvents(): void {
    if (!this.canvas) return;

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas!.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // 寻找被点击的房屋
      for (let i = 0; i < this.houses.length; i++) {
        const h = this.houses[i];
        if (clickX >= h.x && clickX <= h.x + h.width && clickY >= h.y && clickY <= h.y + h.height) {
          this.toggleHouseLoot(i);
          break;
        }
      }
    });
  }

  private toggleHouseLoot(index: number): void {
    const house = this.houses[index];
    if (house.isLooted) {
      // 取消偷窃
      house.isLooted = false;
      this.recalculateAlarmLocks();
      this.currentLoot = this.houses.filter((h) => h.isLooted).reduce((sum, h) => sum + h.val, 0);
      HeistAudio.playFootstep();
      this.logNarration(`🚪 撤出别墅 #${house.id}，放弃 $${house.val} 黄金。当前总收益: $${this.currentLoot}`);
    } else {
      // 检查相邻警报冲突
      const leftNeighbor = index > 0 ? this.houses[index - 1] : null;
      const rightNeighbor = index < this.houses.length - 1 ? this.houses[index + 1] : null;

      if ((leftNeighbor && leftNeighbor.isLooted) || (rightNeighbor && rightNeighbor.isLooted)) {
        HeistAudio.playAlarm();
        this.spawnFloatingText(house.x + house.width / 2, house.y + 20, '🚨 ALARM TRIPPED!', '#ef4444');
        this.logNarration(`⚠️ 警报触发！不能盗窃相邻两座别墅！必须隔开至少一栋房屋。`);
        return;
      }

      // 成功偷窃
      house.isLooted = true;
      this.recalculateAlarmLocks();
      this.currentLoot = this.houses.filter((h) => h.isLooted).reduce((sum, h) => sum + h.val, 0);
      this.ninjaTargetIndex = index;
      HeistAudio.playLoot(house.val);
      this.spawnCoinParticles(house.x + house.width / 2, house.y + house.height / 2, house.val);
      this.spawnFloatingText(house.x + house.width / 2, house.y + 20, `+$${house.val}`, '#fbbf24');
      this.logNarration(`💰 成功潜入别墅 #${house.id}，获得 $${house.val} 黄金！当前累计收益: $${this.currentLoot}`);

      if (this.currentLoot === this.optimalLoot) {
        HeistAudio.playWin();
        this.logNarration(`🌟 完美通关！你收获了 $${this.currentLoot} 黄金，达到了动态规划最优解！⭐⭐⭐`);
      }
    }

    this.updateHUD();
  }

  private recalculateAlarmLocks(): void {
    this.houses.forEach((h, idx) => {
      const left = idx > 0 ? this.houses[idx - 1] : null;
      const right = idx < this.houses.length - 1 ? this.houses[idx + 1] : null;
      h.isAlarmLocked = Boolean(!h.isLooted && ((left && left.isLooted) || (right && right.isLooted)));
    });
  }

  private runDPSingleStep(): void {
    const n = this.rawHouses.length;
    if (this.dpStepIndex >= n) {
      this.logNarration(`✨ 动态规划已遍历完全部 ${n} 座别墅！最终 dp[${n - 1}] = $${this.dpTable[n - 1]} 为全局最大收益。`);
      this.stopAutoPlay();
      return;
    }

    const i = this.dpStepIndex;
    const curVal = this.rawHouses[i];
    this.ninjaTargetIndex = i;

    if (i === 0) {
      this.dpTable[0] = curVal;
      this.houses[0].isLooted = true;
      HeistAudio.playDecision();
      this.logNarration(`📍 [Base Case dp[0]] 只有第 0 间房可选，dp[0] = nums[0] = $${curVal}`);
    } else if (i === 1) {
      this.dpTable[1] = Math.max(this.rawHouses[0], curVal);
      HeistAudio.playDecision();
      const choice = curVal > this.rawHouses[0] ? '偷第 1 间房' : '偷第 0 间房';
      this.logNarration(`📍 [Base Case dp[1]] 比较房 0 ($${this.rawHouses[0]}) 与房 1 ($${curVal})，决策: ${choice}，dp[1] = $${this.dpTable[1]}`);
    } else {
      const optA = this.dpTable[i - 1]; // 不偷
      const optB = this.dpTable[i - 2] + curVal; // 偷
      this.dpTable[i] = Math.max(optA, optB);
      HeistAudio.playDecision();

      if (optB > optA) {
        this.spawnFloatingText(this.houses[i].x + 30, this.houses[i].y + 20, `偷! +$${curVal}`, '#22c55e');
        this.logNarration(`🔍 [房屋 #${i} ($${curVal})] 比较: 不偷(dp[${i - 1}]=$${optA}) vs 偷(dp[${i - 2}]+$${curVal}=$${optB}) $\\implies$ 决策: 偷窃！dp[${i}] = $${this.dpTable[i]}`);
      } else {
        this.spawnFloatingText(this.houses[i].x + 30, this.houses[i].y + 20, `不偷 (保持 $${optA})`, '#94a3b8');
        this.logNarration(`🔍 [房屋 #${i} ($${curVal})] 比较: 不偷(dp[${i - 1}]=$${optA}) vs 偷(dp[${i - 2}]+$${curVal}=$${optB}) $\\implies$ 决策: 放弃！继承 dp[${i - 1}] = $${this.dpTable[i]}`);
      }
    }

    this.dpStepIndex++;
    this.updateHUD();
    if (this.dpStepIndex >= n) {
      this.stopAutoPlay();
      HeistAudio.playWin();
    }
  }

  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    this.isAutoPlaying = true;
    const playBtn = this.root?.querySelector('#btn-heist-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '⏸️ 暂停推演';

    const step = () => {
      if (!this.isAutoPlaying) return;
      this.runDPSingleStep();
      if (this.dpStepIndex < this.rawHouses.length) {
        this.autoPlayTimer = setTimeout(step, 850 / this.playSpeed);
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
    const playBtn = this.root?.querySelector('#btn-heist-autoplay') as HTMLButtonElement | null;
    if (playBtn) playBtn.innerHTML = '▶️ 自动求解';
  }

  private generateRandomLevel(): void {
    const count = 6 + Math.floor(Math.random() * 3);
    const nums: number[] = [];
    for (let i = 0; i < count; i++) {
      nums.push(Math.floor(Math.random() * 25) + 2);
    }
    this.loadPreset(nums);
  }

  private spawnCoinParticles(x: number, y: number, count: number): void {
    const numParticles = Math.min(24, Math.max(10, count));
    for (let i = 0; i < numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.0,
        size: 3 + Math.random() * 3,
        alpha: 1.0,
        life: 0,
        maxLife: 30 + Math.random() * 15,
        color: '#f59e0b',
      });
    }
  }

  private spawnFloatingText(x: number, y: number, text: string, color: string): void {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      alpha: 1.0,
      life: 0,
    });
  }

  private logNarration(msg: string): void {
    if (!this.root) return;
    const logBox = this.root.querySelector('#heist-narration-box') as HTMLElement | null;
    if (logBox) {
      logBox.innerHTML = `💡 ${msg}`;
    }
  }

  private updateHUD(): void {
    if (!this.root) return;

    const lootStatEl = this.root.querySelector('#heist-stat-loot') as HTMLElement | null;
    const optimalStatEl = this.root.querySelector('#heist-stat-optimal') as HTMLElement | null;
    const countStatEl = this.root.querySelector('#heist-stat-count') as HTMLElement | null;
    const dpListEl = this.root.querySelector('#heist-dp-cells') as HTMLElement | null;

    if (lootStatEl) lootStatEl.textContent = `$${this.currentLoot}`;
    if (optimalStatEl) optimalStatEl.textContent = `$${this.optimalLoot}`;
    if (countStatEl) {
      const lootedCount = this.houses.filter((h) => h.isLooted).length;
      countStatEl.textContent = `${lootedCount} 栋`;
    }

    if (dpListEl) {
      dpListEl.innerHTML = this.rawHouses
        .map((num, idx) => {
          const isDone = idx < this.dpStepIndex;
          const val = isDone ? `$${this.dpTable[idx]}` : '?';
          const isCurrent = idx === this.dpStepIndex - 1;
          const borderStyle = isCurrent ? 'border: 2px solid #ec4899; background: #fdf2f8;' : 'border: 1px solid #cbd5e1; background: #ffffff;';
          return `
          <div style="display: flex; flex-direction: column; align-items: center; padding: 3px 6px; border-radius: 6px; ${borderStyle} min-width: 46px;">
            <span style="font-size: 9.5px; color: #64748b;">#${idx} ($${num})</span>
            <span style="font-size: 11.5px; font-weight: 800; color: ${isDone ? '#2563eb' : '#94a3b8'}; font-family: monospace;">${val}</span>
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

      this.updatePhysics(dt);
      this.renderCanvas();

      if (typeof requestAnimationFrame === 'function') {
        this.animFrameId = requestAnimationFrame(loop);
      }
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private updatePhysics(dt: number): void {
    this.laserPulse += dt * 0.005;

    // 忍者平滑移动向目标房屋
    if (this.houses.length > 0) {
      const targetHouse = this.houses[this.ninjaTargetIndex] || this.houses[0];
      const targetX = targetHouse.x + targetHouse.width / 2;
      this.ninjaCurrentX += (targetX - this.ninjaCurrentX) * 0.15;
    }

    // 粒子物理
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // 浮动文字
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life++;
      ft.y -= 0.6;
      ft.alpha = Math.max(0, 1 - ft.life / 35);
      if (ft.life >= 35) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private renderCanvas(): void {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const count = this.houses.length;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. 赛博都市夜空背景
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, '#090d16');
    skyGrad.addColorStop(0.7, '#111827');
    skyGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. 地平线与街道地面
    const groundY = height - 35;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, groundY, width, 35);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();

    // 3. 计算房屋排布
    const paddingX = 18;
    const availableW = width - paddingX * 2;
    const houseW = Math.min(68, (availableW - (count - 1) * 12) / count);
    const spacing = count > 1 ? (availableW - count * houseW) / (count - 1) : 0;

    this.houses.forEach((h, i) => {
      h.width = houseW;
      h.height = 80;
      h.x = paddingX + i * (houseW + spacing);
      h.y = groundY - h.height;
    });

    // 4. 绘制相邻红外警戒激光线
    for (let i = 0; i < count - 1; i++) {
      const h1 = this.houses[i];
      const h2 = this.houses[i + 1];
      const isRedAlert = h1.isLooted || h2.isLooted;

      ctx.save();
      if (isRedAlert) {
        // 红外激光警报
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.7 + Math.sin(this.laserPulse * 5) * 0.25})`;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
      } else {
        // 安全蓝色监控
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1;
      }

      const wireY = groundY - 40;
      ctx.beginPath();
      ctx.moveTo(h1.x + h1.width, wireY);
      ctx.lineTo(h2.x, wireY);
      ctx.stroke();
      ctx.restore();
    }

    // 5. 绘制每座金库别墅
    this.houses.forEach((h) => {
      ctx.save();

      // 建筑主体背景
      if (h.isLooted) {
        ctx.fillStyle = '#065f46'; // 绿色掠夺完成
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 12;
      } else if (h.isAlarmLocked) {
        ctx.fillStyle = '#450a0a'; // 红色警戒锁定
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = '#1e293b'; // 默认建筑
        ctx.strokeStyle = h.color;
        ctx.lineWidth = 1.5;
      }

      // 房屋圆角矩形
      ctx.beginPath();
      ctx.roundRect(h.x, h.y, h.width, h.height, [6, 6, 0, 0]);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 屋顶三角帽
      ctx.fillStyle = h.color;
      ctx.beginPath();
      ctx.moveTo(h.x - 2, h.y);
      ctx.lineTo(h.x + h.width / 2, h.y - 14);
      ctx.lineTo(h.x + h.width + 2, h.y);
      ctx.closePath();
      ctx.fill();

      // 窗户网格
      ctx.fillStyle = h.isLooted ? '#fef08a' : h.isAlarmLocked ? '#7f1d1d' : '#38bdf8';
      const winW = Math.max(6, (h.width - 16) / 2);
      ctx.fillRect(h.x + 5, h.y + 12, winW, 10);
      ctx.fillRect(h.x + h.width - 5 - winW, h.y + 12, winW, 10);

      // 金库门与金额标签
      ctx.font = 'bold 11.5px monospace';
      ctx.fillStyle = h.isLooted ? '#fef08a' : '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(`💰$${h.val}`, h.x + h.width / 2, h.y + 44);

      // 房屋序号
      ctx.font = '9px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`#${h.id}`, h.x + h.width / 2, h.y + 64);

      // 警报锁定标志
      if (h.isAlarmLocked) {
        ctx.font = '12px sans-serif';
        ctx.fillText('🔒', h.x + h.width / 2, h.y + 28);
      }

      ctx.restore();
    });

    // 6. 绘制暗夜神偷忍者角色
    ctx.save();
    const ninjaY = groundY - 96;
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 8;
    ctx.fillText('🥷', this.ninjaCurrentX, ninjaY);

    // 忍者投影光束
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(this.ninjaCurrentX, ninjaY + 4);
    ctx.lineTo(this.ninjaCurrentX, groundY);
    ctx.stroke();
    ctx.restore();

    // 7. 金币粒子
    this.particles.forEach((p) => {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 8. 浮动文字
    this.floatingTexts.forEach((ft) => {
      ctx.save();
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = ft.alpha;
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    ctx.restore();
  }
}

export const HEIST_ROBBER_TEMPLATE = `
  <div id="algo-heist-robber-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏：关卡预设与控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🥷</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">暗夜神偷·街区金库潜行</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="heist-preset-btn active" data-preset="CLASSIC" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">经典街区 [2,7,9,3,1]</button>
          <button class="heist-preset-btn" data-preset="ALTERNATE" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">交替起伏 [1,2,3,1]</button>
          <button class="heist-preset-btn" data-preset="HIGH_ROLLER" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">💎 高额悬赏街区</button>
          <button class="heist-preset-btn" data-preset="CIRCULAR" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">环形示范</button>
          <button class="heist-preset-btn" data-preset="RANDOM" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">🎲 随机街区</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <button id="btn-heist-solve" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">✨ 一键最优方案</button>
        <button id="btn-heist-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">单步推演</button>
        <button id="btn-heist-autoplay" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(59,130,246,0.25);">▶️ 自动求解</button>
        <button id="btn-heist-sound" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🔊 音效</button>
        <button id="btn-heist-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 状态指示条与统计 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #1e40af;">
      <div style="display: flex; gap: 14px; align-items: center;">
        <span>💰 当前掠夺收益: <b id="heist-stat-loot" style="color: #2563eb; font-size: 12px;">$0</b></span>
        <span>⭐ 理论最大收益: <b id="heist-stat-optimal" style="color: #d97706; font-size: 12px;">$12</b></span>
        <span>🏠 已盗别墅数: <b id="heist-stat-count" style="color: #059669; font-size: 12px;">0 栋</b></span>
      </div>
      <div id="heist-narration-box" style="font-weight: 700; color: #1e3a8a;">
        💡 点击街区别墅规划路线，不能偷相邻两座相连的房屋！
      </div>
    </div>

    <!-- 主交互区：左侧 Canvas + DP 状态条，右侧终端 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.35fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：赛博街区 Canvas 与 DP 状态矩阵 -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <!-- Canvas 容器 -->
        <div style="position: relative; display: flex; justify-content: center; background: #090d16; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;">
          <canvas id="heist-canvas" width="460" height="180" style="width: 460px; height: 180px; cursor: pointer;"></canvas>
        </div>

        <!-- 实时 DP 状态数组可视化 -->
        <div style="display: flex; flex-direction: column; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; gap: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 11px; font-weight: 700; color: #334155;">📊 实时 DP 状态转移数组 (dp[i] = max(dp[i-1], dp[i-2] + nums[i]))</span>
          </div>
          <div id="heist-dp-cells" style="display: flex; gap: 6px; flex-wrap: wrap;"></div>
        </div>

        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          💡 点击任意别墅潜入；若两栋相邻别墅同时被盗将触发警报！
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="heist-terminal-mount" style="flex: 1; min-height: 220px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'heist-robber',
  name: '暗夜神偷·街区金库潜行',
  viewId: 'algo-heist-robber-view',
  category: 'game',
  description: '动态规划潜行算法游戏：60 FPS 赛博街区夜景、金库别墅激光警报、实时 DP 状态机与最优潜行决策',
  icon: '🥷',
  template: HEIST_ROBBER_TEMPLATE,
  Visualizer: HeistRobberVisualizer,
  difficulty: 2,
  levelOrder: 17,
  learningGoal: '掌握动态规划状态转移方程 dp[i] = max(dp[i-1], dp[i-2] + nums[i]) 的物理含义与二选一无后效性推导',
});
