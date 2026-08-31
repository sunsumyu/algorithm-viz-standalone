/**
 * 背包商人·地牢探险 (Knapsack Dungeon: Action DP Crawler)
 * 具备真正游戏性、即时动作战斗与暗黑风格背包的 60 FPS 地牢探险游戏：
 * 1. 🕹️ 2.5D 实时地牢画布 (Canvas 60 FPS 走位、近战挥砍、法术弹道、Boss 危险预警红圈、受击震屏)
 * 2. 🗡️ 实装武器与防具外观 (根据当前穿戴的神兵，动态渲染巨剑火光、战斧、神枪、巨盾与狂暴光环)
 * 3. 🧪 快捷道具法术槽 (按 1 饮用狂暴药水获得 5 秒双倍暴击红光，按 2 施放冰霜卷轴冻结 Boss 2.5 秒)
 * 4. 🌀 通关传送阵机制 (Boss 斩杀后原地生成金色传送阵，走入即刻晋升下一层地牢)
 * 5. 🧠 动态规划·启示之眼 (一键计算 0-1 背包/完全背包最优解，金光闪耀穿戴神装)
 * 6. 📊 实时 DP 状态转移矩阵全景表
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  KNAPSACK_DUNGEON_CODE_LANGUAGES,
  KNAPSACK_DUNGEON_PROBLEM_HTML,
  KNAPSACK_DUNGEON_ANALYSIS_HTML,
} from './knapsack-dungeon-problem-content';

export interface DungeonItem {
  id: string;
  name: string;
  icon: string;
  weight: number;
  value: number; // 增加的攻击力 / 伤害
  hpBonus?: number; // 增加的生命值
  type: 'WEAPON' | 'ARMOR' | 'POTION' | 'SCROLL' | 'RELIC';
  desc: string;
}

export interface BossEntity {
  id: string;
  name: string;
  icon: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  attack: number;
  attackCooldown: number;
  lastAttackTime: number;
  state: 'IDLE' | 'ATTACKING' | 'TELEGRAPH' | 'HURT' | 'FROZEN' | 'DEAD';
  telegraphTimer: number;
  telegraphPos: { x: number; y: number; r: number };
  freezeTimer: number;
  animTick: number;
}

export interface HeroEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  baseAttack: number;
  speed: number;
  isAttacking: boolean;
  attackCooldown: number;
  lastAttackTime: number;
  direction: number; // 弧度
  animTick: number;
  rageTimer: number; // 狂暴药水倒计时
}

export interface AttackSlash {
  x: number;
  y: number;
  angle: number;
  life: number; // 0 ~ 1
  damage: number;
}

export interface FloatingNumber {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  opacity: number;
}

export interface DungeonFloor {
  floorId: number;
  title: string;
  modeName: string;
  capacity: number;
  items: DungeonItem[];
  bossConfig: {
    name: string;
    icon: string;
    hp: number;
    attack: number;
    cooldown: number;
  };
  concept: string;
}

const DUNGEON_FLOORS: DungeonFloor[] = [
  {
    floorId: 1,
    title: '第 1 层: 骷髅王座 (0-1 背包)',
    modeName: '0-1 背包模式',
    capacity: 10,
    concept: '🎯 0-1 背包原理：每件神器世间仅存一份，在严格限重 10kg 下通过 DP 做出最优抉择。',
    items: [
      { id: 'i1', name: '炽炎巨剑', icon: '🗡️', weight: 4, value: 40, type: 'WEAPON', desc: '沉重双手巨剑，挥砍附带烈火' },
      { id: 'i2', name: '秘银板甲', icon: '🛡️', weight: 5, value: 45, hpBonus: 40, type: 'ARMOR', desc: '大幅提升生存与生命值' },
      { id: 'i3', name: '狂暴药水', icon: '🧪', weight: 2, value: 18, type: 'POTION', desc: '短效爆发，按 1 激活 5 秒双倍暴击' },
      { id: 'i4', name: '冰霜卷轴', icon: '📜', weight: 1, value: 12, type: 'SCROLL', desc: '极轻便法术，按 2 冰冻 Boss 2.5 秒' },
      { id: 'i5', name: '精钢战斧', icon: '🪓', weight: 3, value: 25, type: 'WEAPON', desc: '平衡型近战利器' },
      { id: 'i6', name: '泰坦之戒', icon: '💍', weight: 2, value: 20, type: 'RELIC', desc: '远古神力附魔戒指' },
    ],
    bossConfig: {
      name: '💀 骷髅领主',
      icon: '💀',
      hp: 160,
      attack: 28,
      cooldown: 2.2,
    },
  },
  {
    floorId: 2,
    title: '第 2 层: 炼金迷窟 (完全背包)',
    modeName: '完全背包模式',
    capacity: 12,
    concept: '🧪 完全背包原理：炼金药剂与飞刀无限量供应，物品可重复选取，状态正序转移。',
    items: [
      { id: 'i1', name: '烈焰药剂', icon: '🧪', weight: 3, value: 30, type: 'POTION', desc: '可重复选取，伤害极高' },
      { id: 'i2', name: '淬毒飞刀', icon: '🗡️', weight: 2, value: 18, type: 'WEAPON', desc: '轻便敏捷，多把堆叠' },
      { id: 'i3', name: '奥术护符', icon: '🧿', weight: 4, value: 38, hpBonus: 30, type: 'RELIC', desc: '强化法术共鸣' },
      { id: 'i4', name: '神圣卷轴', icon: '📜', weight: 1, value: 10, type: 'SCROLL', desc: '低重量填充装配' },
    ],
    bossConfig: {
      name: '🕷️ 暗影蛛后',
      icon: '🕷️',
      hp: 240,
      attack: 35,
      cooldown: 1.8,
    },
  },
  {
    floorId: 3,
    title: '第 3 层: 远古龙窟 (终极挑战)',
    modeName: '史诗综合背包',
    capacity: 15,
    concept: '🐲 终极背包挑战：神装与药剂混合，权衡单兵重装 vs 敏捷爆发，击败远古红龙！',
    items: [
      { id: 'i1', name: '灭世龙枪', icon: '🔱', weight: 7, value: 72, type: 'WEAPON', desc: '上古神器，威力毁天灭地' },
      { id: 'i2', name: '龙鳞圣铠', icon: '🛡️', weight: 6, value: 60, hpBonus: 60, type: 'ARMOR', desc: '巨龙鳞片打造的终极防具' },
      { id: 'i3', name: '凤凰精粹', icon: '🧪', weight: 3, value: 32, type: 'POTION', desc: '涅槃爆发之火' },
      { id: 'i4', name: '雷霆卷轴', icon: '📜', weight: 2, value: 24, type: 'SCROLL', desc: '引动九天神雷' },
      { id: 'i5', name: '支配之戒', icon: '💍', weight: 2, value: 22, type: 'RELIC', desc: '全面属性跃升' },
      { id: 'i6', name: '灵巧短刃', icon: '🗡️', weight: 1, value: 12, type: 'WEAPON', desc: '轻灵近战刺杀' },
    ],
    bossConfig: {
      name: '🐲 远古红龙',
      icon: '🐲',
      hp: 360,
      attack: 52,
      cooldown: 2.0,
    },
  },
];

// Web Audio API 拟真战斗音效合成器
class DungeonAudio {
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

  public static playEquip(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {}
  }

  public static playSlash(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  public static playHit(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {}
  }

  public static playSpell(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  }

  public static playVictory(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.12 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.3);
      });
    } catch {}
  }
}

export class KnapsackDungeonVisualizer extends StepVisualizer<any> {
  private currentFloor = 1;
  private selectedItemIds = new Set<string>();

  // 60 FPS 物理游戏引擎与实体
  private animFrameId: number | null = null;
  private lastTimestamp = 0;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private screenShake = 0;

  private hero: HeroEntity = {
    x: 80,
    y: 100,
    vx: 0,
    vy: 0,
    hp: 100,
    maxHp: 100,
    baseAttack: 15,
    speed: 130,
    isAttacking: false,
    attackCooldown: 0.35,
    lastAttackTime: 0,
    direction: 0,
    animTick: 0,
    rageTimer: 0,
  };

  private boss: BossEntity = {
    id: 'boss',
    name: '💀 骷髅领主',
    icon: '💀',
    x: 320,
    y: 100,
    hp: 160,
    maxHp: 160,
    attack: 28,
    attackCooldown: 2.2,
    lastAttackTime: 0,
    state: 'IDLE',
    telegraphTimer: 0,
    telegraphPos: { x: 0, y: 0, r: 0 },
    freezeTimer: 0,
    animTick: 0,
  };

  private slashes: AttackSlash[] = [];
  private floatingNumbers: FloatingNumber[] = [];
  private keysDown = new Set<string>();

  // 传送门
  private portalPos = { x: 380, y: 100, active: false };

  // DP 演算矩阵
  private dpTable: number[][] = [];
  private dpChosenItems: DungeonItem[] = [];
  private dpOptimalValue = 0;

  constructor() {
    super();
    this.codeLanguages = KNAPSACK_DUNGEON_CODE_LANGUAGES;
    this.codeLines = KNAPSACK_DUNGEON_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '背包动态规划算法引擎';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '背包商人·地牢探险实战' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadFloor(1);
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

  private loadFloor(floorId: number): void {
    this.currentFloor = floorId;
    this.selectedItemIds.clear();
    this.slashes = [];
    this.floatingNumbers = [];
    this.screenShake = 0;
    this.portalPos.active = false;

    const floor = DUNGEON_FLOORS.find((f) => f.floorId === floorId) || DUNGEON_FLOORS[0];

    // 重置英雄与 Boss
    this.hero.x = 80;
    this.hero.y = 100;
    this.hero.vx = 0;
    this.hero.vy = 0;
    this.hero.hp = 100;
    this.hero.maxHp = 100;
    this.hero.rageTimer = 0;

    this.boss = {
      id: 'boss',
      name: floor.bossConfig.name,
      icon: floor.bossConfig.icon,
      x: 320,
      y: 100,
      hp: floor.bossConfig.hp,
      maxHp: floor.bossConfig.hp,
      attack: floor.bossConfig.attack,
      attackCooldown: floor.bossConfig.cooldown,
      lastAttackTime: Date.now() / 1000,
      state: 'IDLE',
      telegraphTimer: 0,
      telegraphPos: { x: 0, y: 0, r: 0 },
      freezeTimer: 0,
      animTick: 0,
    };

    this.computeDPOptimal();
    this.renderFloorView();
    this.renderDPTable();
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#knapsack-arena-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.bindCanvasControls();
    }

    this.mountTerminal({
      codeLanguages: KNAPSACK_DUNGEON_CODE_LANGUAGES,
      problemHtml: KNAPSACK_DUNGEON_PROBLEM_HTML,
      analysisHtml: KNAPSACK_DUNGEON_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 关卡切换
    this.root.querySelectorAll<HTMLButtonElement>('.knapsack-floor-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const floorId = parseInt(btn.dataset.floor || '1', 10);
        this.root?.querySelectorAll('.knapsack-floor-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadFloor(floorId);
      });
    });

    // 一键 DP 最优配装
    const autoDpBtn = this.root.querySelector('#btn-knapsack-auto-dp') as HTMLButtonElement | null;
    if (autoDpBtn) {
      autoDpBtn.addEventListener('click', () => {
        this.selectedItemIds.clear();
        this.dpChosenItems.forEach((it) => this.selectedItemIds.add(it.id));
        DungeonAudio.playEquip();
        this.renderFloorView();
        this.addFloatingNumber(this.hero.x, this.hero.y - 20, '✨ DP 最优配装达成!', '#38bdf8');
      });
    }

    // 清空背包
    const clearBtn = this.root.querySelector('#btn-knapsack-clear') as HTMLButtonElement | null;
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.selectedItemIds.clear();
        this.renderFloorView();
      });
    }

    // 手动攻击按钮
    const attackBtn = this.root.querySelector('#btn-knapsack-attack') as HTMLButtonElement | null;
    if (attackBtn) {
      attackBtn.addEventListener('click', () => this.heroPerformAttack());
    }

    // 快捷药水与卷轴按钮
    const potionBtn = this.root.querySelector('#btn-knapsack-potion') as HTMLButtonElement | null;
    if (potionBtn) {
      potionBtn.addEventListener('click', () => this.usePotionSkill());
    }

    const scrollBtn = this.root.querySelector('#btn-knapsack-scroll') as HTMLButtonElement | null;
    if (scrollBtn) {
      scrollBtn.addEventListener('click', () => this.useScrollSkill());
    }

    // 重置本层战局
    const resetBtn = this.root.querySelector('#btn-knapsack-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.loadFloor(this.currentFloor));
    }
  }

  private bindCanvasControls(): void {
    window.addEventListener('keydown', (e) => {
      this.keysDown.add(e.key.toLowerCase());
      if (e.code === 'Space') {
        e.preventDefault();
        this.heroPerformAttack();
      }
      if (e.key === '1') {
        this.usePotionSkill();
      }
      if (e.key === '2') {
        this.useScrollSkill();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysDown.delete(e.key.toLowerCase());
    });

    if (this.canvas) {
      this.canvas.addEventListener('click', (e) => {
        const rect = this.canvas!.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        this.hero.direction = Math.atan2(clickY - this.hero.y, clickX - this.hero.x);
        this.heroPerformAttack();
      });
    }
  }

  // 使用狂暴药水技能 (按 1)
  private usePotionSkill(): void {
    const hasPotion = Array.from(this.selectedItemIds).some((id) => id.includes('i3') || id.includes('potion'));
    if (!hasPotion && this.selectedItemIds.size === 0) {
      this.addFloatingNumber(this.hero.x, this.hero.y - 20, '⚠️ 未装备狂暴药水!', '#ef4444');
      return;
    }
    this.hero.rageTimer = 5.0;
    DungeonAudio.playSpell();
    this.addFloatingNumber(this.hero.x, this.hero.y - 20, '🔥 狂暴激化! 5秒双倍暴击', '#f97316');
  }

  // 使用冰霜卷轴技能 (按 2)
  private useScrollSkill(): void {
    const hasScroll = Array.from(this.selectedItemIds).some((id) => id.includes('i4') || id.includes('scroll'));
    if (!hasScroll && this.selectedItemIds.size === 0) {
      this.addFloatingNumber(this.hero.x, this.hero.y - 20, '⚠️ 未装备冰霜卷轴!', '#ef4444');
      return;
    }
    if (this.boss.hp <= 0) return;
    this.boss.freezeTimer = 2.5;
    this.boss.state = 'FROZEN';
    DungeonAudio.playSpell();
    this.addFloatingNumber(this.boss.x, this.boss.y - 20, '❄️ Boss 被深度冰冻 2.5 秒!', '#38bdf8');
  }

  // 英雄挥砍攻击
  private heroPerformAttack(): void {
    const now = Date.now() / 1000;
    if (now - this.hero.lastAttackTime < this.hero.attackCooldown || this.boss.hp <= 0) return;

    this.hero.lastAttackTime = now;
    this.hero.isAttacking = true;
    DungeonAudio.playSlash();

    const stats = this.getCurrentTotalStats();
    let totalDmg = this.hero.baseAttack + stats.totalValue;
    if (this.hero.rageTimer > 0) totalDmg *= 2; // 狂暴双倍伤害

    // 刀光
    this.slashes.push({
      x: this.hero.x + Math.cos(this.hero.direction) * 20,
      y: this.hero.y + Math.sin(this.hero.direction) * 20,
      angle: this.hero.direction,
      life: 1.0,
      damage: totalDmg,
    });

    // 判定是否命中 Boss
    const distToBoss = Math.hypot(this.boss.x - this.hero.x, this.boss.y - this.hero.y);
    if (distToBoss <= 65) {
      DungeonAudio.playHit();
      this.screenShake = 6;
      this.boss.hp = Math.max(0, this.boss.hp - totalDmg);
      if (this.boss.state !== 'FROZEN') this.boss.state = 'HURT';

      this.addFloatingNumber(this.boss.x, this.boss.y - 20, `-${totalDmg} ${this.hero.rageTimer > 0 ? '🔥暴击' : '🗡️'}`, this.hero.rageTimer > 0 ? '#f97316' : '#ef4444');

      if (this.boss.hp <= 0) {
        this.boss.state = 'DEAD';
        this.portalPos.active = true;
        DungeonAudio.playVictory();
        this.addFloatingNumber(this.boss.x, this.boss.y - 30, '🏆 BOSS 击杀! 传送阵开启', '#f59e0b');
      }
    }
  }

  // 主物理战斗循环 (60 FPS)
  private startLoop(): void {
    if (typeof requestAnimationFrame !== 'function') return;
    const loop = (timestamp: number) => {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
      this.lastTimestamp = timestamp;

      this.updatePhysics(dt);
      this.renderArena();

      if (typeof requestAnimationFrame === 'function') {
        this.animFrameId = requestAnimationFrame(loop);
      }
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  private updatePhysics(dt: number): void {
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    const now = Date.now() / 1000;
    this.hero.animTick += dt * 8;
    this.boss.animTick += dt * 5;

    if (this.hero.rageTimer > 0) {
      this.hero.rageTimer = Math.max(0, this.hero.rageTimer - dt);
    }

    if (this.boss.freezeTimer > 0) {
      this.boss.freezeTimer = Math.max(0, this.boss.freezeTimer - dt);
      if (this.boss.freezeTimer <= 0 && this.boss.hp > 0) {
        this.boss.state = 'IDLE';
      }
    }

    // 1. 英雄走位控制
    let moveX = 0;
    let moveY = 0;
    if (this.keysDown.has('w') || this.keysDown.has('arrowup')) moveY -= 1;
    if (this.keysDown.has('s') || this.keysDown.has('arrowdown')) moveY += 1;
    if (this.keysDown.has('a') || this.keysDown.has('arrowleft')) moveX -= 1;
    if (this.keysDown.has('d') || this.keysDown.has('arrowright')) moveX += 1;

    if (moveX !== 0 || moveY !== 0) {
      const len = Math.hypot(moveX, moveY);
      this.hero.x = Math.max(25, Math.min(395, this.hero.x + (moveX / len) * this.hero.speed * dt));
      this.hero.y = Math.max(25, Math.min(175, this.hero.y + (moveY / len) * this.hero.speed * dt));
      this.hero.direction = Math.atan2(moveY, moveX);
    } else {
      this.hero.direction = Math.atan2(this.boss.y - this.hero.y, this.boss.x - this.hero.x);
    }

    // 2. 传送门检测
    if (this.portalPos.active) {
      if (Math.hypot(this.hero.x - this.portalPos.x, this.hero.y - this.portalPos.y) <= 25) {
        const nextFloor = this.currentFloor >= DUNGEON_FLOORS.length ? 1 : this.currentFloor + 1;
        this.root?.querySelectorAll<HTMLButtonElement>('.knapsack-floor-btn').forEach((b) => {
          b.classList.toggle('active', b.dataset.floor === `${nextFloor}`);
        });
        this.loadFloor(nextFloor);
        return;
      }
    }

    // 3. Boss AI 与攻击预警
    if (this.boss.hp > 0 && this.boss.state !== 'FROZEN') {
      const dx = this.hero.x - this.boss.x;
      const dy = this.hero.y - this.boss.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 50 && this.boss.state === 'IDLE') {
        this.boss.x += (dx / dist) * 40 * dt;
        this.boss.y += (dy / dist) * 40 * dt;
      }

      if (now - this.boss.lastAttackTime >= this.boss.attackCooldown && this.boss.state === 'IDLE') {
        this.boss.state = 'TELEGRAPH';
        this.boss.telegraphTimer = 0.8;
        this.boss.telegraphPos = { x: this.hero.x, y: this.hero.y, r: 42 };
      }

      if (this.boss.state === 'TELEGRAPH') {
        this.boss.telegraphTimer -= dt;
        if (this.boss.telegraphTimer <= 0) {
          this.boss.state = 'IDLE';
          this.boss.lastAttackTime = now;

          const distToCenter = Math.hypot(this.hero.x - this.boss.telegraphPos.x, this.hero.y - this.boss.telegraphPos.y);
          if (distToCenter <= this.boss.telegraphPos.r) {
            DungeonAudio.playHit();
            this.screenShake = 12;
            const stats = this.getCurrentTotalStats();
            const dmg = Math.max(8, this.boss.attack - Math.round(stats.totalValue * 0.15));
            this.hero.hp = Math.max(0, this.hero.hp - dmg);
            this.addFloatingNumber(this.hero.x, this.hero.y - 20, `-${dmg} 💥`, '#ef4444');
          }
        }
      }
    }

    // 4. 刀光更新
    for (let i = this.slashes.length - 1; i >= 0; i--) {
      this.slashes[i].life -= dt * 4;
      if (this.slashes[i].life <= 0) this.slashes.splice(i, 1);
    }

    // 5. 飘字更新
    for (let i = this.floatingNumbers.length - 1; i >= 0; i--) {
      const fn = this.floatingNumbers[i];
      fn.y -= dt * 25;
      fn.opacity -= dt * 1.5;
      if (fn.opacity <= 0) this.floatingNumbers.splice(i, 1);
    }

    this.updateHUD();
  }

  private addFloatingNumber(x: number, y: number, text: string, color: string): void {
    this.floatingNumbers.push({
      id: `fn_${Date.now()}_${Math.random()}`,
      x,
      y,
      text,
      color,
      opacity: 1.0,
    });
  }

  // 渲染地牢竞技场画布
  private renderArena(): void {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    if (this.screenShake > 0) {
      const ox = (Math.random() - 0.5) * this.screenShake;
      const oy = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(ox, oy);
    }

    // 1. 地牢石板地面
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. 通关金色传送门
    if (this.portalPos.active) {
      ctx.save();
      ctx.translate(this.portalPos.x, this.portalPos.y);
      ctx.rotate(Date.now() / 300);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌀', 0, 0);
      ctx.restore();
    }

    // 3. Boss 攻击危险红圈预警
    if (this.boss.state === 'TELEGRAPH') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.boss.telegraphPos.x, this.boss.telegraphPos.y, this.boss.telegraphPos.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.restore();
    }

    // 4. 绘制 Boss
    ctx.save();
    ctx.translate(this.boss.x, this.boss.y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 20, 26, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    if (this.boss.hp > 0) {
      ctx.font = '38px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.boss.icon, 0, -4 + Math.sin(this.boss.animTick) * 3);

      if (this.boss.state === 'FROZEN') {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.fillRect(-22, -26, 44, 52);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(-22, -26, 44, 52);
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('❄️ 冰冻', 0, 32);
      }

      const bossHpPct = this.boss.hp / this.boss.maxHp;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-28, -32, 56, 5);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-28, -32, 56 * bossHpPct, 5);
    } else {
      ctx.font = '28px sans-serif';
      ctx.fillText('💀 击溃', 0, 0);
    }
    ctx.restore();

    // 5. 绘制勇士 Hero 与装备外观
    ctx.save();
    ctx.translate(this.hero.x, this.hero.y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 16, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 狂暴光环
    if (this.hero.rageTimer > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 10;
      ctx.stroke();
    }

    ctx.font = '26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🧙‍♂️', 0, -2 + Math.sin(this.hero.animTick) * 2);

    // 绘制手持武器 / 盾牌图标
    const hasSword = Array.from(this.selectedItemIds).some((id) => id.includes('i1') || id.includes('i5'));
    const hasShield = Array.from(this.selectedItemIds).some((id) => id.includes('i2'));

    if (hasSword) {
      ctx.font = '16px sans-serif';
      ctx.fillText('🗡️', 14, 2);
    }
    if (hasShield) {
      ctx.font = '16px sans-serif';
      ctx.fillText('🛡️', -14, 2);
    }

    const heroHpPct = this.hero.hp / this.hero.maxHp;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-18, -24, 36, 4);
    ctx.fillStyle = heroHpPct > 0.3 ? '#10b981' : '#ef4444';
    ctx.fillRect(-18, -24, 36 * heroHpPct, 4);

    ctx.restore();

    // 6. 绘制斩击刀光
    for (const slash of this.slashes) {
      ctx.save();
      ctx.translate(slash.x, slash.y);
      ctx.rotate(slash.angle);
      ctx.beginPath();
      ctx.arc(0, 0, 32, -Math.PI / 3, Math.PI / 3);
      ctx.strokeStyle = `rgba(56, 189, 248, ${slash.life})`;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    }

    // 7. 绘制飘字
    for (const fn of this.floatingNumbers) {
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = fn.color;
      ctx.globalAlpha = Math.max(0, fn.opacity);
      ctx.textAlign = 'center';
      ctx.fillText(fn.text, fn.x, fn.y);
      ctx.globalAlpha = 1.0;
    }

    ctx.restore();
  }

  // 计算 DP 最优解与回溯
  private computeDPOptimal(): void {
    const floor = DUNGEON_FLOORS.find((f) => f.floorId === this.currentFloor) || DUNGEON_FLOORS[0];
    const n = floor.items.length;
    const W = floor.capacity;

    this.dpTable = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));

    if (floor.modeName.includes('0-1') || floor.modeName.includes('终极')) {
      for (let i = 1; i <= n; i++) {
        const item = floor.items[i - 1];
        for (let w = 0; w <= W; w++) {
          if (w < item.weight) {
            this.dpTable[i][w] = this.dpTable[i - 1][w];
          } else {
            this.dpTable[i][w] = Math.max(this.dpTable[i - 1][w], this.dpTable[i - 1][w - item.weight] + item.value);
          }
        }
      }

      this.dpChosenItems = [];
      let curW = W;
      for (let i = n; i >= 1; i--) {
        if (this.dpTable[i][curW] !== this.dpTable[i - 1][curW]) {
          this.dpChosenItems.push(floor.items[i - 1]);
          curW -= floor.items[i - 1].weight;
        }
      }
    } else {
      for (let i = 1; i <= n; i++) {
        const item = floor.items[i - 1];
        for (let w = 0; w <= W; w++) {
          if (w < item.weight) {
            this.dpTable[i][w] = this.dpTable[i - 1][w];
          } else {
            this.dpTable[i][w] = Math.max(this.dpTable[i - 1][w], this.dpTable[i][w - item.weight] + item.value);
          }
        }
      }

      this.dpChosenItems = [];
      let curW = W;
      for (let i = n; i >= 1; i--) {
        while (curW >= floor.items[i - 1].weight && this.dpTable[i][curW] === this.dpTable[i][curW - floor.items[i - 1].weight] + floor.items[i - 1].value) {
          this.dpChosenItems.push(floor.items[i - 1]);
          curW -= floor.items[i - 1].weight;
        }
      }
    }

    this.dpOptimalValue = this.dpTable[n][W];
  }

  private getCurrentTotalStats(): { totalWeight: number; totalValue: number; totalHpBonus: number } {
    const floor = DUNGEON_FLOORS.find((f) => f.floorId === this.currentFloor) || DUNGEON_FLOORS[0];
    let totalWeight = 0;
    let totalValue = 0;
    let totalHpBonus = 0;

    for (const item of floor.items) {
      if (this.selectedItemIds.has(item.id)) {
        totalWeight += item.weight;
        totalValue += item.value;
        totalHpBonus += item.hpBonus || 0;
      }
    }
    return { totalWeight, totalValue, totalHpBonus };
  }

  private updateHUD(): void {
    if (!this.root) return;
    const floor = DUNGEON_FLOORS.find((f) => f.floorId === this.currentFloor) || DUNGEON_FLOORS[0];
    const stats = this.getCurrentTotalStats();
    const isOverweight = stats.totalWeight > floor.capacity;

    const weightBar = this.root.querySelector('#knapsack-weight-fill') as HTMLElement | null;
    const weightText = this.root.querySelector('#knapsack-weight-text') as HTMLElement | null;
    const powerText = this.root.querySelector('#knapsack-power-text') as HTMLElement | null;

    const pct = Math.min(100, (stats.totalWeight / floor.capacity) * 100);
    if (weightBar) {
      weightBar.style.width = `${pct}%`;
      weightBar.style.background = isOverweight ? '#ef4444' : stats.totalWeight === floor.capacity ? '#10b981' : '#3b82f6';
    }
    if (weightText) {
      weightText.innerHTML = `🎒 负重: <b>${stats.totalWeight}</b> / ${floor.capacity} kg ${isOverweight ? '<span style="color:#ef4444; font-weight:800;">(超载无法发挥威力!)</span>' : ''}`;
    }
    if (powerText) {
      powerText.innerHTML = `⚔️ 武器加成: <b>+${stats.totalValue}</b> 攻击力 | 总伤害: <b style="color:#10b981;">${this.hero.baseAttack + stats.totalValue}</b>`;
    }
  }

  private renderFloorView(): void {
    if (!this.root) return;
    const floor = DUNGEON_FLOORS.find((f) => f.floorId === this.currentFloor) || DUNGEON_FLOORS[0];

    const conceptEl = this.root.querySelector('#knapsack-concept-banner') as HTMLElement | null;
    if (conceptEl) conceptEl.textContent = floor.concept;

    // 渲染宝物库
    const chestGrid = this.root.querySelector('#knapsack-chest-grid') as HTMLElement | null;
    if (chestGrid) {
      chestGrid.innerHTML = '';
      floor.items.forEach((item) => {
        const isEquipped = this.selectedItemIds.has(item.id);
        const card = document.createElement('div');
        card.style.cssText = `
          display: flex; flex-direction: column; align-items: center; justify-content: space-between;
          background: ${isEquipped ? '#eff6ff' : '#ffffff'};
          border: 2px solid ${isEquipped ? '#3b82f6' : '#e2e8f0'};
          border-radius: 8px; padding: 6px; cursor: pointer; transition: all 0.15s ease;
          box-shadow: ${isEquipped ? '0 4px 12px rgba(59,130,246,0.2)' : '0 1px 3px rgba(0,0,0,0.04)'};
        `;

        card.innerHTML = `
          <span style="font-size: 22px;">${item.icon}</span>
          <span style="font-size: 11px; font-weight: 800; color: #0f172a; margin-top: 2px;">${item.name}</span>
          <div style="display: flex; gap: 4px; font-size: 9.5px; margin-top: 3px;">
            <span style="background: #f1f5f9; color: #475569; padding: 1px 4px; border-radius: 4px; font-weight: 700;">⚖️ ${item.weight}kg</span>
            <span style="background: #fef2f2; color: #dc2626; padding: 1px 4px; border-radius: 4px; font-weight: 700;">⚔️ +${item.value}</span>
          </div>
          <button style="margin-top: 4px; width: 100%; border: none; border-radius: 4px; padding: 3px 0; font-size: 10px; font-weight: 800; cursor: pointer; background: ${isEquipped ? '#ef4444' : '#10b981'}; color: #ffffff;">
            ${isEquipped ? '卸下' : '装配到背包'}
          </button>
        `;

        card.addEventListener('click', () => {
          if (this.selectedItemIds.has(item.id)) {
            this.selectedItemIds.delete(item.id);
          } else {
            this.selectedItemIds.add(item.id);
          }
          DungeonAudio.playEquip();
          this.renderFloorView();
        });

        chestGrid.appendChild(card);
      });
    }

    this.updateHUD();
  }

  // 渲染 DP 状态转移矩阵全景表
  private renderDPTable(): void {
    if (!this.root) return;
    const floor = DUNGEON_FLOORS.find((f) => f.floorId === this.currentFloor) || DUNGEON_FLOORS[0];
    const container = this.root.querySelector('#knapsack-dp-table-container') as HTMLElement | null;
    if (!container) return;

    let html = `
      <table style="width: 100%; border-collapse: collapse; font-size: 10px; font-family: monospace; text-align: center;">
        <thead>
          <tr style="background: #f8fafc; color: #475569;">
            <th style="border: 1px solid #e2e8f0; padding: 3px 4px;">物品 \\ 容量</th>
    `;

    for (let w = 0; w <= floor.capacity; w++) {
      html += `<th style="border: 1px solid #e2e8f0; padding: 3px;">${w}kg</th>`;
    }
    html += `</tr></thead><tbody>`;

    for (let i = 0; i <= floor.items.length; i++) {
      const itemName = i === 0 ? '0 初始' : `${floor.items[i - 1].name.substring(0, 3)}(w:${floor.items[i - 1].weight})`;
      html += `<tr><td style="border: 1px solid #e2e8f0; padding: 3px; font-weight: 700; background: #f8fafc; color: #0f172a;">${itemName}</td>`;

      for (let w = 0; w <= floor.capacity; w++) {
        const val = this.dpTable[i]?.[w] || 0;
        const isOptimal = i === floor.items.length && w === floor.capacity;
        html += `
          <td style="border: 1px solid #e2e8f0; padding: 3px; background: ${isOptimal ? '#fef08a' : val > 0 ? '#eff6ff' : '#ffffff'}; color: ${isOptimal ? '#b45309' : '#1e293b'}; font-weight: ${isOptimal ? '800' : '500'};">
            ${val}
          </td>
        `;
      }
      html += `</tr>`;
    }

    html += `</tbody></table>`;
    container.innerHTML = html;
  }
}

export const KNAPSACK_DUNGEON_TEMPLATE = `
  <div id="algo-knapsack-dungeon-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏：地牢层数选择与功能控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🎒</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">背包商人·地牢探险 (Knapsack Dungeon)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="knapsack-floor-btn active" data-floor="1" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">第 1 层 (0-1 背包)</button>
          <button class="knapsack-floor-btn" data-floor="2" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">第 2 层 (完全背包)</button>
          <button class="knapsack-floor-btn" data-floor="3" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">第 3 层 (终极巨龙)</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <button id="btn-knapsack-auto-dp" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 6px rgba(37,99,235,0.25);">✨ 启示之眼 (Auto DP)</button>
        <button id="btn-knapsack-attack" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: #ffffff; border: none; border-radius: 6px; padding: 4px 12px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(220,38,38,0.25);">🗡️ 挥砍攻击 (Space)</button>
        <button id="btn-knapsack-potion" style="background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🧪 狂暴(1)</button>
        <button id="btn-knapsack-scroll" style="background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">📜 冰冻(2)</button>
        <button id="btn-knapsack-clear" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🗑️ 清空</button>
        <button id="btn-knapsack-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 算法概念横幅 -->
    <div style="display: flex; align-items: center; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #1e40af;">
      <span id="knapsack-concept-banner">🎯 0-1 背包原理：每件神器世间仅存一份，在严格限重 10kg 下通过 DP 做出最优抉择。</span>
    </div>

    <!-- 主交互区：左侧 60 FPS 地牢动作竞技场 + 宝物库，右侧 DP 矩阵与终端 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.25fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：60 FPS 地牢动作竞技场 + 宝物库配装 -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <!-- 60 FPS 地牢动作竞技场 Canvas -->
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #334155;">
          <canvas id="knapsack-arena-canvas" width="420" height="200" style="width: 420px; height: 200px; cursor: crosshair;"></canvas>
          <div style="position: absolute; bottom: 6px; left: 8px; font-size: 10px; color: #94a3b8; background: rgba(15,23,42,0.7); padding: 2px 6px; border-radius: 4px;">
            🎮 WASD 走位，空格键挥砍，按 1 饮用狂暴药水，按 2 施放冰霜卷轴，击败 Boss 进入传送门！
          </div>
        </div>

        <!-- 背包负重状态条 -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; margin-bottom: 3px;">
            <span id="knapsack-weight-text">🎒 负重: 0 / 10 kg</span>
            <span id="knapsack-power-text">⚔️ 武器加成: +0 攻击力</span>
          </div>
          <div style="height: 7px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
            <div id="knapsack-weight-fill" style="width: 0%; height: 100%; background: #3b82f6; transition: width 0.15s ease;"></div>
          </div>
        </div>

        <!-- 宝物库网格 -->
        <div style="font-size: 11px; font-weight: 800; color: #0f172a;">🏺 地牢宝物库 (点击物品装配到背包)</div>
        <div id="knapsack-chest-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;"></div>
      </div>

      <!-- 右侧：DP 状态矩阵全景表与代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <!-- DP 状态矩阵全景表 -->
        <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px; flex: 1.1; min-height: 160px; overflow-y: auto;">
          <div style="font-size: 10.5px; font-weight: 800; color: #0f172a; margin-bottom: 3px; display: flex; justify-content: space-between;">
            <span>📊 动态规划矩阵 dp[i][w]</span>
            <span style="font-size: 9.5px; color: #2563eb;">max(dp[i-1][w], dp[i-1][w-wi]+vi)</span>
          </div>
          <div id="knapsack-dp-table-container" style="flex: 1; overflow-x: auto;"></div>
        </div>

        <!-- 暗色代码终端挂载槽位 -->
        <div id="knapsack-terminal-mount" style="flex: 1; min-height: 160px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'knapsack-dungeon',
  name: '背包商人·地牢探险',
  viewId: 'algo-knapsack-dungeon-view',
  category: 'game',
  description: '真动作即时战斗与背包规划游戏：60 FPS 走位挥砍、红圈躲避、暗黑式背包配装、大战地牢守关魔王',
  icon: '🎒',
  template: KNAPSACK_DUNGEON_TEMPLATE,
  Visualizer: KnapsackDungeonVisualizer,
  difficulty: 3,
  levelOrder: 2,
  learningGoal: '通过即时地牢动作走位、装备负重权衡与 Boss 决战，彻底掌握 0-1 背包与完全背包的最优子结构',
});
