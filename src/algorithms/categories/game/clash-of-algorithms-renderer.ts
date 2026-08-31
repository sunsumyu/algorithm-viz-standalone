/**
 * 部落冲突·战术攻防实战游戏 (Clash of Algorithms: High-Fidelity 2.5D Tactical Game & Algorithm Lab)
 * 深度算法教学实验室 + 2.5D 精细矢量策略游戏：
 * 1. 🔬 算法参数实验室 (Algorithm Knob Controls)：
 *    - 实时调节城墙惩罚权重 W_wall (1~50)，即刻观察 A* 寻路路径骤变
 *    - 实时切换启发式函数 h(n)：曼哈顿 (Manhattan) / 欧式 (Euclidean) / Dijkstra (h=0)
 * 2. 🔍 单兵 A* 算路实时监视器 (Troop Algorithm Inspector)：
 *    - 点击任意小兵，即刻透视 f(n) = g(n) + h(n)、目标池过滤打分与 Open/Closed 节点统计
 * 3. ⏸️ 慢动作与单步调试引擎 (Time Control & Step Debugger)：
 *    - 支持正常 / 0.3x 慢速 / 暂停 / 单步演算，逐帧剖析寻路与索敌
 * 4. 🏰 拟真 2.5D 矢量画风、飞行双翼飞龙、雷电法术、真实 Web Audio 物理打击感
 * 5. 6 大战役关卡 + 自由沙盒布阵
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  CLASH_ALGORITHMS_CODE_LANGUAGES,
  CLASH_ALGORITHMS_PROBLEM_HTML,
  CLASH_ALGORITHMS_ANALYSIS_HTML,
} from './clash-of-algorithms-problem-content';

export type BuildingType = 'TOWNHALL' | 'ARCHER_TOWER' | 'MORTAR' | 'GOLD_MINE' | 'WALL';
export type TroopType = 'BARBARIAN' | 'ARCHER' | 'GIANT' | 'GOBLIN' | 'WALL_BREAKER' | 'DRAGON' | 'LIGHTNING_SPELL';
export type HeuristicType = 'MANHATTAN' | 'EUCLIDEAN' | 'DIJKSTRA';

export interface GameBuilding {
  id: string;
  type: BuildingType;
  r: number;
  c: number;
  hp: number;
  maxHp: number;
  range?: number;
  attackCooldown?: number;
  lastAttackTime?: number;
}

export interface GameTroop {
  id: string;
  type: TroopType;
  x: number; // 网格浮点坐标
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  range: number;
  attackCooldown: number;
  lastAttackTime: number;
  targetId: string | null;
  path: [number, number][];
  pathIndex: number;
  isDead: boolean;
  isFlying?: boolean;
  animTick: number; // 动作动画周期
  direction: number; // 朝向角 (弧度)
  // 算法诊断数据
  lastAStarStats?: {
    gCost: number;
    hCost: number;
    fCost: number;
    openCount: number;
    closedCount: number;
    heuristic: HeuristicType;
    wallWeight: number;
  };
}

export interface Projectile {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number; // 0 ~ 1
  damage: number;
  isAoE: boolean;
  targetTroopId: string;
  type: 'ARROW' | 'BOMB';
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  opacity: number;
}

export interface ParticleEffect {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
}

export interface LightningStrikeEffect {
  id: string;
  x: number;
  y: number;
  duration: number; // 持续时间 (秒)
  points: [number, number][];
}

interface LevelConfig {
  id: number;
  name: string;
  desc: string;
  tip: string;
  algorithmConcept: string;
  buildings: GameBuilding[];
}

const PRESET_LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: '第 1 关: 哥布林劫掠金矿',
    desc: '资源贪心教学：金矿散落各处，下哥布林极速洗劫！',
    tip: '💡 哥布林移动速度极快且对金矿造成双倍伤害，但血量脆弱，避开箭塔射程！',
    algorithmConcept: '🎯 贪心目标选择 (Greedy Target Selection): 哥布林在目标池中通过 O(K) 过滤出所有金矿，并选取欧氏距离最近的目标。',
    buildings: [
      { id: 'th', type: 'TOWNHALL', r: 4, c: 4, hp: 500, maxHp: 500 },
      { id: 'gm1', type: 'GOLD_MINE', r: 2, c: 2, hp: 150, maxHp: 150 },
      { id: 'gm2', type: 'GOLD_MINE', r: 6, c: 6, hp: 150, maxHp: 150 },
      { id: 'gm3', type: 'GOLD_MINE', r: 2, c: 6, hp: 150, maxHp: 150 },
      { id: 'at1', type: 'ARCHER_TOWER', r: 4, c: 2, hp: 200, maxHp: 200, range: 3.2, attackCooldown: 1.0 },
    ],
  },
  {
    id: 2,
    name: '第 2 关: 巨石攻坚双箭塔',
    desc: '防御过滤教学：用巨人前排扛伤，后排弓箭手隔墙输出！',
    tip: '💡 巨人只攻击防御塔，箭塔会锁定最近目标。先放巨人吸引仇恨，再在后方下弓箭手！',
    algorithmConcept: '🛡️ 状态过滤与仇恨机制 (Priority Filter & Nearest Aggro): 防御建筑根据最近邻优先队列索敌，巨人过滤掉大本营只锁定箭塔。',
    buildings: [
      { id: 'th', type: 'TOWNHALL', r: 4, c: 5, hp: 600, maxHp: 600 },
      { id: 'at1', type: 'ARCHER_TOWER', r: 3, c: 3, hp: 250, maxHp: 250, range: 3.5, attackCooldown: 0.9 },
      { id: 'at2', type: 'ARCHER_TOWER', r: 5, c: 3, hp: 250, maxHp: 250, range: 3.5, attackCooldown: 0.9 },
      { id: 'w1', type: 'WALL', r: 2, c: 2, hp: 150, maxHp: 150 },
      { id: 'w2', type: 'WALL', r: 3, c: 2, hp: 150, maxHp: 150 },
      { id: 'w3', type: 'WALL', r: 4, c: 2, hp: 150, maxHp: 150 },
      { id: 'w4', type: 'WALL', r: 5, c: 2, hp: 150, maxHp: 150 },
      { id: 'w5', type: 'WALL', r: 6, c: 2, hp: 150, maxHp: 150 },
    ],
  },
  {
    id: 3,
    name: '第 3 关: 开孔引导阵与炸弹人',
    desc: '破阵权衡教学：用炸弹人炸开封闭城墙，防止主力钻入右侧陷阱！',
    tip: '💡 阵型右侧有缺口，普通小兵会根据 A* 绕远路钻洞。先放炸弹人炸破左侧城墙，打通直达核心捷径！',
    algorithmConcept: '⚖️ A* 启发式权衡 (A* Cost Tradeoff): 绕路步数 vs 破墙权重 W_wall。当绕路步数 < W_wall 时小兵绕行；用炸弹人砸墙可瞬间降低阻隔边权！',
    buildings: [
      { id: 'th', type: 'TOWNHALL', r: 4, c: 4, hp: 600, maxHp: 600 },
      { id: 'at1', type: 'ARCHER_TOWER', r: 3, c: 4, hp: 250, maxHp: 250, range: 3.5, attackCooldown: 1.0 },
      { id: 'mor1', type: 'MORTAR', r: 5, c: 4, hp: 200, maxHp: 200, range: 4.5, attackCooldown: 2.2 },
      { id: 'w1', type: 'WALL', r: 2, c: 2, hp: 160, maxHp: 160 },
      { id: 'w2', type: 'WALL', r: 2, c: 3, hp: 160, maxHp: 160 },
      { id: 'w3', type: 'WALL', r: 2, c: 4, hp: 160, maxHp: 160 },
      { id: 'w4', type: 'WALL', r: 3, c: 2, hp: 160, maxHp: 160 },
      { id: 'w5', type: 'WALL', r: 4, c: 2, hp: 160, maxHp: 160 },
      { id: 'w6', type: 'WALL', r: 5, c: 2, hp: 160, maxHp: 160 },
      { id: 'w7', type: 'WALL', r: 6, c: 2, hp: 160, maxHp: 160 },
      { id: 'w8', type: 'WALL', r: 6, c: 3, hp: 160, maxHp: 160 },
      { id: 'w9', type: 'WALL', r: 6, c: 4, hp: 160, maxHp: 160 },
    ],
  },
  {
    id: 4,
    name: '第 4 关: 飞龙跨墙与雷电奇袭',
    desc: '高阶战术：使用飞龙宝宝跨越重重城墙，雷电法术秒杀核心箭塔！',
    tip: '💡 飞龙宝宝作为飞行单位完全无视城墙阻挡！使用 ⚡ 雷电法术直接劈中箭塔削减大半血量！',
    algorithmConcept: '🛫 拓扑维度降阶 (Graph Dimensionality Reduction): 飞行单位相当于将网格图所有城墙顶点的障碍权重置 1.0，直接沿直线启发式推进。',
    buildings: [
      { id: 'th', type: 'TOWNHALL', r: 4, c: 4, hp: 700, maxHp: 700 },
      { id: 'at1', type: 'ARCHER_TOWER', r: 3, c: 4, hp: 260, maxHp: 260, range: 3.5, attackCooldown: 0.8 },
      { id: 'mor1', type: 'MORTAR', r: 5, c: 4, hp: 220, maxHp: 220, range: 4.5, attackCooldown: 2.0 },
      { id: 'gm1', type: 'GOLD_MINE', r: 4, c: 6, hp: 180, maxHp: 180 },
      { id: 'w1', type: 'WALL', r: 2, c: 2, hp: 200, maxHp: 200 },
      { id: 'w2', type: 'WALL', r: 2, c: 3, hp: 200, maxHp: 200 },
      { id: 'w3', type: 'WALL', r: 2, c: 4, hp: 200, maxHp: 200 },
      { id: 'w4', type: 'WALL', r: 2, c: 5, hp: 200, maxHp: 200 },
      { id: 'w5', type: 'WALL', r: 3, c: 2, hp: 200, maxHp: 200 },
      { id: 'w6', type: 'WALL', r: 4, c: 2, hp: 200, maxHp: 200 },
      { id: 'w7', type: 'WALL', r: 5, c: 2, hp: 200, maxHp: 200 },
      { id: 'w8', type: 'WALL', r: 6, c: 2, hp: 200, maxHp: 200 },
      { id: 'w9', type: 'WALL', r: 6, c: 3, hp: 200, maxHp: 200 },
      { id: 'w10', type: 'WALL', r: 6, c: 4, hp: 200, maxHp: 200 },
      { id: 'w11', type: 'WALL', r: 6, c: 5, hp: 200, maxHp: 200 },
    ],
  },
  {
    id: 5,
    name: '第 5 关: 终极部落大要塞',
    desc: '全军出击：大本营被箭塔、迫击炮与完整回字城墙重重保护！',
    tip: '💡 综合运用：雷电先手劈塔 $\\to$ 炸弹人破外墙 $\\to$ 巨人吸收火力 $\\to$ 飞龙与哥布林收割全场！',
    algorithmConcept: '🌐 多算法协同融合 (Multi-Agent Algorithm Fusion): 并发执行 A* 动态重规划、范围 AoE 空间判定与多兵种分工。',
    buildings: [
      { id: 'th', type: 'TOWNHALL', r: 4, c: 4, hp: 900, maxHp: 900 },
      { id: 'at1', type: 'ARCHER_TOWER', r: 3, c: 3, hp: 300, maxHp: 300, range: 3.5, attackCooldown: 0.9 },
      { id: 'at2', type: 'ARCHER_TOWER', r: 5, c: 5, hp: 300, maxHp: 300, range: 3.5, attackCooldown: 0.9 },
      { id: 'mor1', type: 'MORTAR', r: 3, c: 5, hp: 240, maxHp: 240, range: 4.8, attackCooldown: 2.2 },
      { id: 'gm1', type: 'GOLD_MINE', r: 5, c: 3, hp: 200, maxHp: 200 },
      { id: 'w1', type: 'WALL', r: 2, c: 2, hp: 180, maxHp: 180 },
      { id: 'w2', type: 'WALL', r: 2, c: 3, hp: 180, maxHp: 180 },
      { id: 'w3', type: 'WALL', r: 2, c: 4, hp: 180, maxHp: 180 },
      { id: 'w4', type: 'WALL', r: 2, c: 5, hp: 180, maxHp: 180 },
      { id: 'w5', type: 'WALL', r: 2, c: 6, hp: 180, maxHp: 180 },
      { id: 'w6', type: 'WALL', r: 3, c: 6, hp: 180, maxHp: 180 },
      { id: 'w7', type: 'WALL', r: 4, c: 6, hp: 180, maxHp: 180 },
      { id: 'w8', type: 'WALL', r: 5, c: 6, hp: 180, maxHp: 180 },
      { id: 'w9', type: 'WALL', r: 6, c: 6, hp: 180, maxHp: 180 },
      { id: 'w10', type: 'WALL', r: 6, c: 5, hp: 180, maxHp: 180 },
      { id: 'w11', type: 'WALL', r: 6, c: 4, hp: 180, maxHp: 180 },
      { id: 'w12', type: 'WALL', r: 6, c: 3, hp: 180, maxHp: 180 },
      { id: 'w13', type: 'WALL', r: 6, c: 2, hp: 180, maxHp: 180 },
      { id: 'w14', type: 'WALL', r: 5, c: 2, hp: 180, maxHp: 180 },
      { id: 'w15', type: 'WALL', r: 4, c: 2, hp: 180, maxHp: 180 },
      { id: 'w16', type: 'WALL', r: 3, c: 2, hp: 180, maxHp: 180 },
    ],
  },
];

// Web Audio API 简易原生音效合成器
class SoundFX {
  private static audioCtx: AudioContext | null = null;

  private static getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioClass) this.audioCtx = new AudioClass();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public static playSpawn(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  public static playExplosion(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  }

  public static playLightning(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  }

  public static playVictory(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.3);
      });
    } catch {}
  }
}

export class ClashOfAlgorithmsGameVisualizer extends StepVisualizer<any> {
  private gridSize = 10;
  private currentLevel = 1;
  private isBuildMode = false;
  private selectedBuildTool: BuildingType = 'WALL';
  private selectedTroopType: TroopType = 'BARBARIAN';
  private showAStarPath = true;

  // 🔬 算法实验室实时调节参数
  private wallPenaltyWeight = 16.0; // 城墙阻隔代价 W_wall (1~50)
  private currentHeuristic: HeuristicType = 'MANHATTAN'; // 启发式函数
  private timeScale = 1.0; // 播放速率 (1.0 = 正常, 0.3 = 慢速, 0.0 = 暂停)
  private isPaused = false;
  private selectedTroopId: string | null = null; // 当前被选中小兵

  // 游戏运行状态
  private isRunning = false;
  private isGameOver = false;
  private animFrameId: number | null = null;
  private lastTimestamp = 0;
  private elixir = 7.0;
  private maxElixir = 10.0;
  private battleTimer = 120;
  private destructionRate = 0;
  private stars = 0;
  private screenShake = 0;

  // 实体
  private buildings: GameBuilding[] = [];
  private troops: GameTroop[] = [];
  private projectiles: Projectile[] = [];
  private floatingTexts: FloatingText[] = [];
  private particles: ParticleEffect[] = [];
  private lightningEffects: LightningStrikeEffect[] = [];
  private totalCoreBuildings = 0;

  // DOM
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor() {
    super();
    this.codeLanguages = CLASH_ALGORITHMS_CODE_LANGUAGES;
    this.codeLines = CLASH_ALGORITHMS_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '部落冲突 A* 寻路与索敌引擎';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '部落冲突战术攻防实战沙盘' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadLevel(1);
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

  private loadLevel(levelId: number): void {
    this.currentLevel = levelId;
    this.isBuildMode = false;
    this.isRunning = false;
    this.isGameOver = false;
    this.elixir = 7.0;
    this.battleTimer = 120;
    this.destructionRate = 0;
    this.stars = 0;
    this.screenShake = 0;
    this.troops = [];
    this.projectiles = [];
    this.floatingTexts = [];
    this.particles = [];
    this.lightningEffects = [];
    this.selectedTroopId = null;

    const config = PRESET_LEVELS.find((l) => l.id === levelId) || PRESET_LEVELS[0];
    this.buildings = config.buildings.map((b) => ({ ...b }));
    this.totalCoreBuildings = this.buildings.filter((b) => b.type !== 'WALL').length;

    const modal = this.root?.querySelector('#clash-victory-modal') as HTMLElement | null;
    if (modal) modal.style.display = 'none';

    // 更新关卡算法提示
    const conceptEl = this.root?.querySelector('#clash-level-concept') as HTMLElement | null;
    if (conceptEl) {
      conceptEl.textContent = config.algorithmConcept;
    }

    this.updateHUD();
    this.updateInspectorUI();
    this.logEvent(`🏰 进入【${config.name}】: ${config.desc}`);
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#clash-game-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.bindCanvasInteraction();
    }

    this.mountTerminal({
      codeLanguages: CLASH_ALGORITHMS_CODE_LANGUAGES,
      problemHtml: CLASH_ALGORITHMS_PROBLEM_HTML,
      analysisHtml: CLASH_ALGORITHMS_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 关卡选择
    this.root.querySelectorAll<HTMLButtonElement>('.clash-lvl-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const lvl = parseInt(btn.dataset.level || '1', 10);
        this.root?.querySelectorAll('.clash-lvl-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadLevel(lvl);
      });
    });

    // 兵种卡牌选择
    this.root.querySelectorAll<HTMLDivElement>('.clash-troop-card').forEach((card) => {
      card.addEventListener('click', () => {
        this.root?.querySelectorAll('.clash-troop-card').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        this.selectedTroopType = (card.dataset.troop || 'BARBARIAN') as TroopType;
      });
    });

    // 🔬 算法参数控制：城墙代价滑块
    const wallSlider = this.root.querySelector('#slider-wall-penalty') as HTMLInputElement | null;
    const wallLabel = this.root.querySelector('#label-wall-penalty') as HTMLElement | null;
    if (wallSlider) {
      wallSlider.addEventListener('input', () => {
        this.wallPenaltyWeight = parseFloat(wallSlider.value);
        if (wallLabel) wallLabel.textContent = `${this.wallPenaltyWeight.toFixed(0)} 步行走代价`;
        // 立即触发全场小兵 A* 重算
        this.troops.forEach((t) => this.updateTroopAStar(t));
        this.logEvent(`🔬 调节城墙通行代价 W_wall = ${this.wallPenaltyWeight}！全场小兵实时重新寻路！`);
      });
    }

    // 🔬 启发式函数选择
    const heuristicSelect = this.root.querySelector('#select-heuristic') as HTMLSelectElement | null;
    if (heuristicSelect) {
      heuristicSelect.addEventListener('change', () => {
        this.currentHeuristic = heuristicSelect.value as HeuristicType;
        this.troops.forEach((t) => this.updateTroopAStar(t));
        this.logEvent(`🧭 切换启发式函数为【${this.currentHeuristic}】！`);
      });
    }

    // ⏸️ 慢动作与时间控制
    const pauseBtn = this.root.querySelector('#btn-clash-pause') as HTMLButtonElement | null;
    const slowBtn = this.root.querySelector('#btn-clash-slow') as HTMLButtonElement | null;
    const stepBtn = this.root.querySelector('#btn-clash-step') as HTMLButtonElement | null;

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        this.isPaused = !this.isPaused;
        pauseBtn.textContent = this.isPaused ? '▶️ 继续' : '⏸️ 暂停';
        pauseBtn.style.background = this.isPaused ? '#10b981' : '#f1f5f9';
        pauseBtn.style.color = this.isPaused ? '#ffffff' : '#475569';
      });
    }

    if (slowBtn) {
      slowBtn.addEventListener('click', () => {
        this.timeScale = this.timeScale === 1.0 ? 0.3 : 1.0;
        slowBtn.textContent = this.timeScale < 1.0 ? '🐢 慢放 0.3x' : '⚡ 正常 1.0x';
        slowBtn.style.background = this.timeScale < 1.0 ? '#fef3c7' : '#f1f5f9';
      });
    }

    if (stepBtn) {
      stepBtn.addEventListener('click', () => {
        this.isPaused = true;
        if (pauseBtn) {
          pauseBtn.textContent = '▶️ 继续';
          pauseBtn.style.background = '#10b981';
          pauseBtn.style.color = '#ffffff';
        }
        this.updateGame(0.08);
      });
    }

    // 布阵与实战切换
    const modeBtn = this.root.querySelector('#btn-toggle-build') as HTMLButtonElement | null;
    if (modeBtn) {
      modeBtn.addEventListener('click', () => {
        this.isBuildMode = !this.isBuildMode;
        modeBtn.textContent = this.isBuildMode ? '⚔️ 退出布阵·进攻' : '🔨 进入自由布阵';
        modeBtn.style.background = this.isBuildMode ? '#f59e0b' : '#2563eb';
        const buildBar = this.root?.querySelector('#clash-build-bar') as HTMLElement | null;
        if (buildBar) buildBar.style.display = this.isBuildMode ? 'flex' : 'none';
        this.logEvent(this.isBuildMode ? '🔨 开启自由布阵模式：点击地图任意地块摆放/擦除建筑' : '⚔️ 开启实战攻防模式：选择下方兵种点击地图下兵');
      });
    }

    // 建造工具
    this.root.querySelectorAll<HTMLButtonElement>('.clash-build-tool').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.root?.querySelectorAll('.clash-build-tool').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedBuildTool = (btn.dataset.building || 'WALL') as BuildingType;
      });
    });

    const resetBtn = this.root.querySelector('#btn-clash-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.loadLevel(this.currentLevel));
    }

    const nextLvlBtn = this.root.querySelector('#btn-modal-next-level') as HTMLButtonElement | null;
    if (nextLvlBtn) {
      nextLvlBtn.addEventListener('click', () => {
        const nextId = this.currentLevel >= PRESET_LEVELS.length ? 1 : this.currentLevel + 1;
        this.root?.querySelectorAll<HTMLButtonElement>('.clash-lvl-btn').forEach((b) => {
          b.classList.toggle('active', b.dataset.level === `${nextId}`);
        });
        this.loadLevel(nextId);
      });
    }

    const pathToggle = this.root.querySelector('#chk-astar-path') as HTMLInputElement | null;
    if (pathToggle) {
      pathToggle.addEventListener('change', () => {
        this.showAStarPath = pathToggle.checked;
      });
    }
  }

  private bindCanvasInteraction(): void {
    if (!this.canvas) return;

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas!.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const cellSize = this.canvas!.width / this.gridSize;
      const c = Math.floor(clickX / cellSize);
      const r = Math.floor(clickY / cellSize);

      if (r < 0 || r >= this.gridSize || c < 0 || c >= this.gridSize) return;

      // 优先检测是否点击了现有小兵 (点击小兵打开 A* 诊断面板)
      const clickedTroop = this.troops.find((t) => !t.isDead && Math.hypot(t.x * cellSize - clickX, t.y * cellSize - clickY) <= cellSize * 0.45);
      if (clickedTroop) {
        this.selectedTroopId = clickedTroop.id;
        this.updateInspectorUI();
        this.logEvent(`🔍 选中了 ${clickedTroop.type}，已开启 A* 寻路与打分实时透视！`);
        return;
      }

      if (this.isBuildMode) {
        const existingIdx = this.buildings.findIndex((b) => b.r === r && b.c === c);
        if (existingIdx >= 0) {
          const removed = this.buildings.splice(existingIdx, 1)[0];
          this.logEvent(`🗑️ 移除地块 (${r}, ${c}) 的 ${removed.type}`);
        } else {
          const newB: GameBuilding = {
            id: `b_${Date.now()}`,
            type: this.selectedBuildTool,
            r,
            c,
            hp: this.selectedBuildTool === 'TOWNHALL' ? 600 : this.selectedBuildTool === 'WALL' ? 180 : 250,
            maxHp: this.selectedBuildTool === 'TOWNHALL' ? 600 : this.selectedBuildTool === 'WALL' ? 180 : 250,
            range: this.selectedBuildTool === 'ARCHER_TOWER' ? 3.5 : this.selectedBuildTool === 'MORTAR' ? 4.5 : undefined,
            attackCooldown: this.selectedBuildTool === 'ARCHER_TOWER' ? 1.0 : this.selectedBuildTool === 'MORTAR' ? 2.2 : undefined,
          };
          this.buildings.push(newB);
          this.logEvent(`🔨 在 (${r}, ${c}) 建造 ${this.selectedBuildTool}`);
        }
        this.totalCoreBuildings = this.buildings.filter((b) => b.type !== 'WALL').length;
      } else {
        if (this.selectedTroopType === 'LIGHTNING_SPELL') {
          this.castLightningSpell(r, c);
        } else {
          this.deployTroop(this.selectedTroopType, r, c);
        }
      }
    });
  }

  // 施放拟真雷电法术
  private castLightningSpell(r: number, c: number): void {
    if (this.elixir < 3) {
      this.addFloatingText(c, r, `💧 圣水不足 (雷电需 3)`, '#ef4444');
      return;
    }

    this.elixir -= 3;
    this.isRunning = true;
    this.screenShake = 14;
    SoundFX.playLightning();

    this.addFloatingText(c, r, `⚡ 雷霆万钧!`, '#38bdf8');
    this.spawnParticles(c + 0.5, r + 0.5, '#38bdf8', 25);

    const branchPoints: [number, number][] = [
      [c + 0.5 + (Math.random() - 0.5) * 0.4, 0],
      [c + 0.5 + (Math.random() - 0.5) * 0.8, r * 0.3],
      [c + 0.5 + (Math.random() - 0.5) * 0.6, r * 0.6],
      [c + 0.5 + (Math.random() - 0.5) * 0.4, r * 0.8],
      [c + 0.5, r + 0.5],
    ];
    this.lightningEffects.push({
      id: `lt_${Date.now()}`,
      x: c + 0.5,
      y: r + 0.5,
      duration: 0.35,
      points: branchPoints,
    });

    let hitCount = 0;
    this.buildings.forEach((b) => {
      if (b.hp > 0 && Math.hypot(b.c - c, b.r - r) <= 1.8) {
        b.hp = Math.max(0, b.hp - 260);
        hitCount++;
        this.addFloatingText(b.c, b.r, `-260 ⚡`, '#38bdf8');
        if (b.hp <= 0) {
          this.logEvent(`⚡ 雷电法术直接劈碎了 ${b.type} (${b.r}, ${b.c})！`);
        }
      }
    });

    this.logEvent(`⚡ 施放雷电法术！命中 (${r}, ${c}) 周围 ${hitCount} 座设施！`);
    this.troops.forEach((t) => this.updateTroopAStar(t));
  }

  // 部署拟真小兵
  private deployTroop(type: TroopType, r: number, c: number): void {
    const costMap: Record<TroopType, number> = {
      BARBARIAN: 1,
      ARCHER: 2,
      GIANT: 5,
      GOBLIN: 1,
      WALL_BREAKER: 2,
      DRAGON: 4,
      LIGHTNING_SPELL: 3,
    };

    const cost = costMap[type] || 1;
    if (this.elixir < cost) {
      this.addFloatingText(c, r, `💧 圣水不足 (需 ${cost})`, '#ef4444');
      return;
    }

    this.elixir -= cost;
    this.isRunning = true;
    SoundFX.playSpawn();

    const hpMap: Record<TroopType, number> = {
      BARBARIAN: 200,
      ARCHER: 120,
      GIANT: 600,
      GOBLIN: 110,
      WALL_BREAKER: 90,
      DRAGON: 360,
      LIGHTNING_SPELL: 0,
    };
    const dmgMap: Record<TroopType, number> = {
      BARBARIAN: 25,
      ARCHER: 22,
      GIANT: 45,
      GOBLIN: 40,
      WALL_BREAKER: 300,
      DRAGON: 45,
      LIGHTNING_SPELL: 260,
    };
    const speedMap: Record<TroopType, number> = {
      BARBARIAN: 1.2,
      ARCHER: 1.0,
      GIANT: 0.7,
      GOBLIN: 2.2,
      WALL_BREAKER: 1.8,
      DRAGON: 1.5,
      LIGHTNING_SPELL: 0,
    };
    const rangeMap: Record<TroopType, number> = {
      BARBARIAN: 0.8,
      ARCHER: 3.2,
      GIANT: 0.8,
      GOBLIN: 0.8,
      WALL_BREAKER: 0.8,
      DRAGON: 1.8,
      LIGHTNING_SPELL: 0,
    };

    const troop: GameTroop = {
      id: `t_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type,
      x: c + 0.5,
      y: r + 0.5,
      hp: hpMap[type],
      maxHp: hpMap[type],
      speed: speedMap[type],
      damage: dmgMap[type],
      range: rangeMap[type],
      attackCooldown: 1.0,
      lastAttackTime: 0,
      targetId: null,
      path: [],
      pathIndex: 0,
      isDead: false,
      isFlying: type === 'DRAGON',
      animTick: 0,
      direction: 0,
    };

    this.troops.push(troop);
    this.selectedTroopId = troop.id;
    this.addFloatingText(c, r, `+1 ${type}`, '#10b981');
    this.spawnParticles(c + 0.5, r + 0.5, '#10b981', 10);
    this.logEvent(`🪓 消耗 💧${cost} 在 (${r}, ${c}) 投放 ${type}，触发实时 A* 寻路！`);
    this.updateTroopAStar(troop);
    this.updateInspectorUI();
  }

  // 运行 A* 启发式寻路为小兵规划路径，并记录算法诊断数据
  private updateTroopAStar(troop: GameTroop): void {
    if (troop.isDead) return;

    let validTargets = this.buildings.filter((b) => b.hp > 0 && b.type !== 'WALL');
    if (troop.type === 'GIANT') {
      const defs = validTargets.filter((b) => b.type === 'ARCHER_TOWER' || b.type === 'MORTAR');
      if (defs.length > 0) validTargets = defs;
    } else if (troop.type === 'GOBLIN') {
      const resources = validTargets.filter((b) => b.type === 'GOLD_MINE');
      if (resources.length > 0) validTargets = resources;
    }

    if (validTargets.length === 0) {
      validTargets = this.buildings.filter((b) => b.hp > 0);
    }
    if (validTargets.length === 0) {
      troop.targetId = null;
      troop.path = [];
      return;
    }

    validTargets.sort((a, b) => Math.hypot(troop.x - (a.c + 0.5), troop.y - (a.r + 0.5)) - Math.hypot(troop.x - (b.c + 0.5), troop.y - (b.r + 0.5)));
    const target = validTargets[0];
    troop.targetId = target.id;

    const sr = Math.floor(troop.y);
    const sc = Math.floor(troop.x);
    const tr = target.r;
    const tc = target.c;

    const wallSet = new Set<string>();
    this.buildings.forEach((b) => {
      if (b.type === 'WALL' && b.hp > 0) wallSet.add(`${b.r},${b.c}`);
    });

    const calcH = (r1: number, c1: number, r2: number, c2: number): number => {
      if (this.currentHeuristic === 'DIJKSTRA') return 0;
      if (this.currentHeuristic === 'EUCLIDEAN') return Math.hypot(r1 - r2, c1 - c2);
      return Math.abs(r1 - r2) + Math.abs(c1 - c2); // MANHATTAN
    };

    interface Node {
      r: number;
      c: number;
      g: number;
      h: number;
      f: number;
      path: [number, number][];
    }

    const startH = calcH(sr, sc, tr, tc);
    const open: Node[] = [{ r: sr, c: sc, g: 0, h: startH, f: startH, path: [[sr, sc]] }];
    const closed = new Map<string, number>();
    closed.set(`${sr},${sc}`, 0);

    let finalPath: [number, number][] = [];
    let openCount = 0;
    let closedCount = 0;
    let reachedNode: Node | null = null;

    while (open.length > 0) {
      open.sort((a, b) => a.f - b.f);
      const cur = open.shift()!;
      openCount++;

      if (Math.hypot(cur.r - tr, cur.c - tc) <= troop.range) {
        finalPath = cur.path;
        reachedNode = cur;
        break;
      }

      if (cur.path.length > 35) continue;

      const dirs = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      for (const [dr, dc] of dirs) {
        const nr = cur.r + dr;
        const nc = cur.c + dc;
        if (nr < 0 || nr >= this.gridSize || nc < 0 || nc >= this.gridSize) continue;

        const key = `${nr},${nc}`;
        const isWall = wallSet.has(key);
        // 城墙权重惩罚使用实时滑块配置
        const stepCost = troop.isFlying ? 1.0 : isWall ? (troop.type === 'WALL_BREAKER' ? 1.0 : this.wallPenaltyWeight) : 1.0;
        const newG = cur.g + stepCost;

        if (!closed.has(key) || newG < closed.get(key)!) {
          closed.set(key, newG);
          closedCount++;
          const h = calcH(nr, nc, tr, tc);
          open.push({
            r: nr,
            c: nc,
            g: newG,
            h,
            f: newG + h,
            path: [...cur.path, [nr, nc]],
          });
        }
      }
    }

    troop.path = finalPath.length > 0 ? finalPath : [[sr, sc]];
    troop.pathIndex = 0;

    // 记录算法诊断
    troop.lastAStarStats = {
      gCost: reachedNode ? parseFloat(reachedNode.g.toFixed(1)) : 0,
      hCost: reachedNode ? parseFloat(reachedNode.h.toFixed(1)) : 0,
      fCost: reachedNode ? parseFloat(reachedNode.f.toFixed(1)) : 0,
      openCount,
      closedCount,
      heuristic: this.currentHeuristic,
      wallWeight: this.wallPenaltyWeight,
    };
  }

  // 更新算法透视检查器 HUD
  private updateInspectorUI(): void {
    if (!this.root) return;

    const troop = this.troops.find((t) => t.id === this.selectedTroopId && !t.isDead);
    const inspectEl = this.root.querySelector('#clash-inspector-content') as HTMLElement | null;
    if (!inspectEl) return;

    if (!troop) {
      inspectEl.innerHTML = `<div style="font-size: 11px; color: #94a3b8; text-align: center; padding: 12px 0;">👉 点击地图上的任意小兵，透视其实时 A* 计算公式与启发式打分</div>`;
      return;
    }

    const stats = troop.lastAStarStats;
    const targetBuilding = this.buildings.find((b) => b.id === troop.targetId);

    inspectEl.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #1e293b;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
          <strong style="color: #0f172a; font-size: 12px;">兵种: ${troop.type}</strong>
          <span style="background: #dbeafe; color: #1e40af; padding: 1px 6px; border-radius: 4px; font-weight: 700; font-size: 10px;">HP: ${troop.hp}/${troop.maxHp}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>🎯 锁定目标:</span>
          <strong style="color: #2563eb;">${targetBuilding ? `${targetBuilding.type} (${targetBuilding.r},${targetBuilding.c})` : '无'}</strong>
        </div>
        <div style="background: #f1f5f9; border-radius: 4px; padding: 6px; font-family: monospace; font-size: 10.5px;">
          <div style="color: #475569; margin-bottom: 2px;">📐 A* 估价公式: f(n) = g(n) + h(n)</div>
          <div style="color: #0f172a; font-weight: 700;">${stats?.fCost || 0} = ${stats?.gCost || 0} (行走代价) + ${stats?.hCost || 0} (预估)</div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 10px; color: #64748b;">
          <div>Open 表展开: <strong style="color: #0f172a;">${stats?.openCount || 0} 个</strong></div>
          <div>Closed 表访问: <strong style="color: #0f172a;">${stats?.closedCount || 0} 个</strong></div>
          <div>启发函数: <strong style="color: #10b981;">${stats?.heuristic}</strong></div>
          <div>城墙权重 W: <strong style="color: #f59e0b;">${stats?.wallWeight}</strong></div>
        </div>
      </div>
    `;
  }

  // 主游戏物理与战斗循环
  private startLoop(): void {
    if (typeof requestAnimationFrame !== 'function') return;
    const loop = (timestamp: number) => {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
      this.lastTimestamp = timestamp;

      if (this.isRunning && !this.isBuildMode && !this.isGameOver && !this.isPaused) {
        this.updateGame(dt * this.timeScale);
      }

      this.renderCanvas();
      if (typeof requestAnimationFrame === 'function') {
        this.animFrameId = requestAnimationFrame(loop);
      }
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  private updateGame(dt: number): void {
    this.elixir = Math.min(this.maxElixir, this.elixir + 0.8 * dt);
    this.battleTimer = Math.max(0, this.battleTimer - dt);

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    const now = Date.now() / 1000;

    // 1. 更新小兵移动与攻击
    for (const troop of this.troops) {
      if (troop.isDead) continue;
      troop.animTick += dt * 6.0;

      const target = this.buildings.find((b) => b.id === troop.targetId && b.hp > 0);
      if (!target) {
        this.updateTroopAStar(troop);
        continue;
      }

      const distToTarget = Math.hypot(troop.x - (target.c + 0.5), troop.y - (target.r + 0.5));
      troop.direction = Math.atan2(target.r + 0.5 - troop.y, target.c + 0.5 - troop.x);

      const nextStep = troop.path[troop.pathIndex + 1];
      let blockingWall: GameBuilding | undefined;

      if (nextStep && !troop.isFlying) {
        blockingWall = this.buildings.find((b) => b.type === 'WALL' && b.hp > 0 && b.r === nextStep[0] && b.c === nextStep[1]);
      }

      if (blockingWall) {
        if (now - troop.lastAttackTime >= troop.attackCooldown) {
          troop.lastAttackTime = now;
          const dmg = troop.type === 'WALL_BREAKER' ? 300 : troop.damage;
          blockingWall.hp = Math.max(0, blockingWall.hp - dmg);
          this.addFloatingText(blockingWall.c, blockingWall.r, `-${dmg}`, '#f59e0b');
          if (blockingWall.hp <= 0) {
            this.screenShake = 6;
            SoundFX.playExplosion();
            this.spawnParticles(blockingWall.c + 0.5, blockingWall.r + 0.5, '#64748b', 16);
            this.logEvent(`💥 城墙 (${blockingWall.r}, ${blockingWall.c}) 被攻破！通道打开！`);
            this.troops.forEach((t) => this.updateTroopAStar(t));
          }
          if (troop.type === 'WALL_BREAKER') {
            troop.hp = 0;
            troop.isDead = true;
          }
        }
      } else if (distToTarget <= troop.range) {
        if (now - troop.lastAttackTime >= troop.attackCooldown) {
          troop.lastAttackTime = now;
          let dmg = troop.damage;
          if (troop.type === 'GOBLIN' && target.type === 'GOLD_MINE') dmg *= 2;
          target.hp = Math.max(0, target.hp - dmg);
          this.addFloatingText(target.c, target.r, `-${dmg}`, '#ef4444');

          if (target.hp <= 0) {
            this.screenShake = 10;
            SoundFX.playExplosion();
            this.spawnParticles(target.c + 0.5, target.r + 0.5, '#ef4444', 24);
            this.logEvent(`🏆 摧毁目标建筑 ${target.type} (${target.r}, ${target.c})！`);
            this.troops.forEach((t) => this.updateTroopAStar(t));
          }
        }
      } else {
        if (troop.path && troop.path.length > troop.pathIndex + 1) {
          const nextPt = troop.path[troop.pathIndex + 1];
          const targetX = nextPt[1] + 0.5;
          const targetY = nextPt[0] + 0.5;

          const dx = targetX - troop.x;
          const dy = targetY - troop.y;
          const moveDist = troop.speed * dt;
          const stepDist = Math.hypot(dx, dy);

          if (stepDist <= moveDist) {
            troop.x = targetX;
            troop.y = targetY;
            troop.pathIndex++;
          } else {
            troop.x += (dx / stepDist) * moveDist;
            troop.y += (dy / stepDist) * moveDist;
          }
        } else {
          this.updateTroopAStar(troop);
        }
      }
    }

    // 2. 防御塔索敌与射击
    for (const building of this.buildings) {
      if (building.hp <= 0 || (building.type !== 'ARCHER_TOWER' && building.type !== 'MORTAR')) continue;

      const range = building.range || 3.5;
      const cooldown = building.attackCooldown || 1.0;

      if (now - (building.lastAttackTime || 0) >= cooldown) {
        const inRangeTroops = this.troops.filter((t) => !t.isDead && Math.hypot(building.c + 0.5 - t.x, building.r + 0.5 - t.y) <= range);

        if (inRangeTroops.length > 0) {
          inRangeTroops.sort((a, b) => Math.hypot(building.c + 0.5 - a.x, building.r + 0.5 - a.y) - Math.hypot(building.c + 0.5 - b.x, building.r + 0.5 - b.y));
          const targetTroop = inRangeTroops[0];
          building.lastAttackTime = now;

          this.projectiles.push({
            id: `p_${Date.now()}_${Math.random()}`,
            startX: building.c + 0.5,
            startY: building.r + 0.5,
            targetX: targetTroop.x,
            targetY: targetTroop.y,
            progress: 0,
            damage: building.type === 'MORTAR' ? 45 : 30,
            isAoE: building.type === 'MORTAR',
            targetTroopId: targetTroop.id,
            type: building.type === 'MORTAR' ? 'BOMB' : 'ARROW',
          });
        }
      }
    }

    // 3. 飞行弹道推进
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.progress += dt * 3.8;

      if (p.progress >= 1) {
        if (p.isAoE) {
          this.screenShake = 8;
          SoundFX.playExplosion();
          this.spawnParticles(p.targetX, p.targetY, '#f97316', 16);
          this.troops.forEach((t) => {
            if (!t.isDead && Math.hypot(t.x - p.targetX, t.y - p.targetY) <= 1.8) {
              t.hp = Math.max(0, t.hp - p.damage);
              this.addFloatingText(t.x, t.y, `-${p.damage} 💥`, '#ef4444');
              if (t.hp <= 0) t.isDead = true;
            }
          });
        } else {
          const targetTroop = this.troops.find((t) => t.id === p.targetTroopId);
          if (targetTroop && !targetTroop.isDead) {
            targetTroop.hp = Math.max(0, targetTroop.hp - p.damage);
            this.addFloatingText(targetTroop.x, targetTroop.y, `-${p.damage}`, '#ef4444');
            if (targetTroop.hp <= 0) targetTroop.isDead = true;
          }
        }
        this.projectiles.splice(i, 1);
      }
    }

    // 4. 更新飘字、粒子与雷电特效
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= dt * 0.8;
      ft.opacity -= dt * 1.2;
      if (ft.opacity <= 0) this.floatingTexts.splice(i, 1);
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.alpha -= dt * 1.5;
      if (pt.alpha <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.lightningEffects.length - 1; i >= 0; i--) {
      const lt = this.lightningEffects[i];
      lt.duration -= dt;
      if (lt.duration <= 0) this.lightningEffects.splice(i, 1);
    }

    // 5. 战局结算与胜利检测
    const destroyedCores = this.buildings.filter((b) => b.type !== 'WALL' && b.hp <= 0).length;
    this.destructionRate = this.totalCoreBuildings > 0 ? Math.round((destroyedCores / this.totalCoreBuildings) * 100) : 0;

    const th = this.buildings.find((b) => b.type === 'TOWNHALL');
    let stars = 0;
    if (th && th.hp <= 0) stars++;
    if (this.destructionRate >= 50) stars++;
    if (this.destructionRate >= 100) stars = 3;
    this.stars = stars;

    if (this.destructionRate >= 100 && !this.isGameOver) {
      this.isGameOver = true;
      SoundFX.playVictory();
      this.showVictoryModal();
    }

    this.updateHUD();
    this.updateInspectorUI();
  }

  private showVictoryModal(): void {
    const modal = this.root?.querySelector('#clash-victory-modal') as HTMLElement | null;
    if (modal) {
      modal.style.display = 'flex';
      const starText = modal.querySelector('#modal-stars');
      const rateText = modal.querySelector('#modal-rate');
      if (starText) starText.textContent = `${'⭐'.repeat(this.stars)}`;
      if (rateText) rateText.textContent = `摧毁率: ${this.destructionRate}% | 耗时: ${120 - Math.round(this.battleTimer)} 秒`;
    }
  }

  private spawnParticles(x: number, y: number, color: string, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2.5;
      this.particles.push({
        id: `p_${Date.now()}_${Math.random()}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 2.5 + Math.random() * 3.5,
        alpha: 1.0,
      });
    }
  }

  private addFloatingText(x: number, y: number, text: string, color: string): void {
    this.floatingTexts.push({
      id: `ft_${Date.now()}_${Math.random()}`,
      x,
      y,
      text,
      color,
      opacity: 1.0,
    });
  }

  private updateHUD(): void {
    if (!this.root) return;

    const elixirFill = this.root.querySelector('#clash-elixir-fill') as HTMLElement | null;
    const elixirText = this.root.querySelector('#clash-elixir-text') as HTMLElement | null;
    if (elixirFill) elixirFill.style.width = `${(this.elixir / this.maxElixir) * 100}%`;
    if (elixirText) elixirText.textContent = `💧 圣水: ${this.elixir.toFixed(1)} / ${this.maxElixir}`;

    const rateEl = this.root.querySelector('#clash-destruction-rate') as HTMLElement | null;
    const starEl = this.root.querySelector('#clash-star-display') as HTMLElement | null;
    if (rateEl) rateEl.textContent = `${this.destructionRate}%`;
    if (starEl) starEl.textContent = `${'⭐'.repeat(this.stars)}${'☆'.repeat(3 - this.stars)}`;

    const timerEl = this.root.querySelector('#clash-timer-display') as HTMLElement | null;
    if (timerEl) {
      const m = Math.floor(this.battleTimer / 60);
      const s = Math.floor(this.battleTimer % 60);
      timerEl.textContent = `⏱️ ${m}:${s < 10 ? '0' : ''}${s}`;
    }

    const aliveTroopsEl = this.root.querySelector('#clash-alive-troops') as HTMLElement | null;
    const aliveBuildingsEl = this.root.querySelector('#clash-alive-buildings') as HTMLElement | null;
    if (aliveTroopsEl) aliveTroopsEl.textContent = `${this.troops.filter((t) => !t.isDead).length} 队`;
    if (aliveBuildingsEl) aliveBuildingsEl.textContent = `${this.buildings.filter((b) => b.type !== 'WALL' && b.hp > 0).length} 座`;
  }

  private logEvent(msg: string): void {
    const logList = this.root?.querySelector('#clash-event-log') as HTMLElement | null;
    if (logList) {
      const item = document.createElement('div');
      item.style.cssText = 'padding: 3px 6px; border-bottom: 1px solid #f1f5f9; font-size: 10px; color: #334155;';
      item.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
      logList.insertBefore(item, logList.firstChild);
      if (logList.children.length > 40) logList.removeChild(logList.lastChild!);
    }
  }

  // 绘制 2.5D 精致拟真建筑
  private drawRealisticBuilding(ctx: CanvasRenderingContext2D, b: GameBuilding, cellSize: number): void {
    const bx = b.c * cellSize;
    const by = b.r * cellSize;
    const cx = bx + cellSize / 2;
    const cy = by + cellSize / 2;
    const isDead = b.hp <= 0;

    if (isDead) {
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.ellipse(cx, cy + cellSize * 0.2, cellSize * 0.35, cellSize * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#334155';
      ctx.fillRect(cx - cellSize * 0.2, cy, cellSize * 0.15, cellSize * 0.15);
      ctx.fillRect(cx + cellSize * 0.05, cy - cellSize * 0.1, cellSize * 0.2, cellSize * 0.15);
      return;
    }

    ctx.fillStyle = 'rgba(15, 23, 42, 0.16)';
    ctx.beginPath();
    ctx.ellipse(cx + 3, cy + cellSize * 0.32, cellSize * 0.42, cellSize * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    if (b.type === 'TOWNHALL') {
      ctx.fillStyle = '#475569';
      ctx.fillRect(bx + 4, by + cellSize * 0.3, cellSize - 8, cellSize * 0.55);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(bx + 6, by + cellSize * 0.32, cellSize - 12, cellSize * 0.5);

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx, by + cellSize * 0.8, cellSize * 0.14, Math.PI, 0);
      ctx.fill();

      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.moveTo(bx + 2, by + cellSize * 0.35);
      ctx.lineTo(cx, by + 4);
      ctx.lineTo(bx + cellSize - 2, by + cellSize * 0.35);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(bx + 5, by + cellSize * 0.33);
      ctx.lineTo(cx, by + 6);
      ctx.lineTo(bx + cellSize - 5, by + cellSize * 0.33);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(cx - 2, by + 2, 4, 6);
    } else if (b.type === 'ARCHER_TOWER') {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(bx + 6, by + cellSize * 0.3, 4, cellSize * 0.55);
      ctx.fillRect(bx + cellSize - 10, by + cellSize * 0.3, 4, cellSize * 0.55);

      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx + 8, by + cellSize * 0.45);
      ctx.lineTo(bx + cellSize - 8, by + cellSize * 0.75);
      ctx.moveTo(bx + cellSize - 8, by + cellSize * 0.45);
      ctx.lineTo(bx + 8, by + cellSize * 0.75);
      ctx.stroke();

      ctx.fillStyle = '#b45309';
      ctx.fillRect(bx + 3, by + cellSize * 0.18, cellSize - 6, cellSize * 0.18);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(bx + 5, by + cellSize * 0.16, cellSize - 10, 4);

      ctx.fillStyle = '#16a34a';
      ctx.fillRect(cx - 3, by + cellSize * 0.1, 6, 6);
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(cx, by + cellSize * 0.08, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (b.type === 'MORTAR') {
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.ellipse(cx, cy + cellSize * 0.15, cellSize * 0.35, cellSize * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-Math.PI / 4);
      ctx.fillRect(-cellSize * 0.12, -cellSize * 0.35, cellSize * 0.24, cellSize * 0.45);
      ctx.fillStyle = '#334155';
      ctx.fillRect(-cellSize * 0.1, -cellSize * 0.33, cellSize * 0.2, cellSize * 0.4);
      ctx.restore();
    } else if (b.type === 'GOLD_MINE') {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(bx + 5, by + cellSize * 0.15, cellSize - 10, 5);
      ctx.fillRect(bx + 5, by + cellSize * 0.15, 5, cellSize * 0.5);
      ctx.fillRect(bx + cellSize - 10, by + cellSize * 0.15, 5, cellSize * 0.5);

      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(bx + 10, by + cellSize * 0.25, cellSize - 20, cellSize * 0.45);

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy + 2);
      ctx.lineTo(cx, cy - 6);
      ctx.lineTo(cx + 6, cy + 2);
      ctx.lineTo(cx, cy + 8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(cx - 2, cy - 2, 4, 4);
    } else if (b.type === 'WALL') {
      ctx.fillStyle = '#334155';
      ctx.fillRect(bx + 3, by + cellSize * 0.3, cellSize - 6, cellSize * 0.6);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(bx + 3, by + cellSize * 0.15, cellSize - 6, cellSize * 0.35);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(bx + 4, by + cellSize * 0.16, cellSize - 8, 3);
      ctx.fillStyle = '#475569';
      ctx.fillRect(bx + 5, by + cellSize * 0.08, 6, cellSize * 0.1);
      ctx.fillRect(bx + cellSize - 11, by + cellSize * 0.08, 6, cellSize * 0.1);
    }

    if ((b.type === 'ARCHER_TOWER' || b.type === 'MORTAR') && b.range) {
      ctx.beginPath();
      ctx.arc(cx, cy, b.range * cellSize, 0, Math.PI * 2);
      ctx.strokeStyle = b.type === 'MORTAR' ? 'rgba(249,115,22,0.12)' : 'rgba(239,68,68,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    if (b.type !== 'WALL') {
      const hpPct = b.hp / b.maxHp;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(bx + 4, by + cellSize - 6, cellSize - 8, 4);
      ctx.fillStyle = hpPct > 0.4 ? '#10b981' : '#ef4444';
      ctx.fillRect(bx + 4, by + cellSize - 6, (cellSize - 8) * hpPct, 4);
    }
  }

  // 绘制 2.5D 精致拟真小兵
  private drawRealisticTroop(ctx: CanvasRenderingContext2D, t: GameTroop, cellSize: number): void {
    const tx = t.x * cellSize;
    const ty = t.y * cellSize;
    const bobOffset = Math.sin(t.animTick) * 2.5;
    const isSelected = t.id === this.selectedTroopId;

    ctx.save();
    ctx.translate(tx, ty + (t.isFlying ? -12 : bobOffset));

    // 选中高亮光环
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(0, 0, cellSize * 0.45, 0, Math.PI * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 地面软阴影
    ctx.fillStyle = t.isFlying ? 'rgba(15, 23, 42, 0.18)' : 'rgba(15, 23, 42, 0.28)';
    ctx.beginPath();
    ctx.ellipse(0, t.isFlying ? 14 : cellSize * 0.2, cellSize * 0.26, cellSize * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();

    if (t.type === 'BARBARIAN') {
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-6, -4, 12, 10);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, -9, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.rotate(Math.sin(t.animTick * 1.5) * 0.6);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(4, -14, 4, 14);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(5, -13, 2, 12);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(2, -2, 8, 3);
      ctx.restore();
    } else if (t.type === 'ARCHER') {
      ctx.fillStyle = '#15803d';
      ctx.fillRect(-5, -3, 10, 9);
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(0, -8, 6.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(6, -2, 7, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    } else if (t.type === 'GIANT') {
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(-10, -8, 20, 16, 4);
      ctx.fill();

      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0, -14, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ea580c';
      ctx.fillRect(-12, -2, 6, 8);
      ctx.fillRect(6, -2, 6, 8);
    } else if (t.type === 'GOBLIN') {
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(0, -7, 5.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.moveTo(-6, -7);
      ctx.lineTo(-11, -11);
      ctx.lineTo(-5, -4);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(-5, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-4, -1, 3, 3);
    } else if (t.type === 'WALL_BREAKER') {
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(0, -8, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#78350f';
      ctx.fillRect(-6, -13, 12, 5);

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(4, 1, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f97316';
      ctx.fillRect(8, -8, 3, 3);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(9, -9, 2, 2);
    } else if (t.type === 'DRAGON') {
      const wingFlap = Math.sin(t.animTick * 3.0) * 8;
      ctx.fillStyle = '#9333ea';
      ctx.beginPath();
      ctx.ellipse(0, 0, 9, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(7, -4, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(-2, -2);
      ctx.lineTo(-8, -14 - wingFlap);
      ctx.lineTo(4, -4);
      ctx.closePath();
      ctx.fill();
    }

    const hpPct = t.hp / t.maxHp;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-cellSize * 0.25, -cellSize * 0.45, cellSize * 0.5, 3);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(-cellSize * 0.25, -cellSize * 0.45, cellSize * 0.5 * hpPct, 3);

    ctx.restore();
  }

  // 渲染 60 FPS Canvas 沙盘
  private renderCanvas(): void {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const cellSize = width / this.gridSize;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    if (this.screenShake > 0) {
      const ox = (Math.random() - 0.5) * this.screenShake;
      const oy = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(ox, oy);
    }

    // 1. 绘制草地网格与石板路
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        const isGrass = (r + c) % 2 === 0;
        ctx.fillStyle = isGrass ? '#dcfce7' : '#d1fae5';
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        ctx.strokeStyle = '#bbf7d0';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }

    // 2. 绘制小兵 A* 虚线轨迹
    if (this.showAStarPath) {
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      for (const troop of this.troops) {
        if (troop.isDead || !troop.path || troop.path.length < 2) continue;

        ctx.strokeStyle = troop.type === 'GIANT' ? 'rgba(37,99,235,0.6)' : troop.type === 'DRAGON' ? 'rgba(168,85,247,0.7)' : troop.type === 'GOBLIN' ? 'rgba(234,179,8,0.7)' : 'rgba(16,185,129,0.7)';
        ctx.beginPath();
        ctx.moveTo(troop.x * cellSize, troop.y * cellSize);
        for (let i = troop.pathIndex + 1; i < troop.path.length; i++) {
          const pt = troop.path[i];
          ctx.lineTo((pt[1] + 0.5) * cellSize, (pt[0] + 0.5) * cellSize);
        }
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // 3. 绘制 2.5D 拟真建筑
    for (const b of this.buildings) {
      this.drawRealisticBuilding(ctx, b, cellSize);
    }

    // 4. 绘制 2.5D 拟真小兵
    for (const troop of this.troops) {
      if (!troop.isDead) {
        this.drawRealisticTroop(ctx, troop, cellSize);
      }
    }

    // 5. 绘制飞行投掷物
    for (const p of this.projectiles) {
      const curX = (p.startX + (p.targetX - p.startX) * p.progress) * cellSize;
      const curY = (p.startY + (p.targetY - p.startY) * p.progress) * cellSize;

      ctx.save();
      ctx.translate(curX, curY);

      if (p.type === 'ARROW') {
        const angle = Math.atan2(p.targetY - p.startY, p.targetX - p.startX);
        ctx.rotate(angle);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-8, -1, 16, 2);
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(3, -3);
        ctx.lineTo(3, 3);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(-8, -3, 3, 6);
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f97316';
        ctx.fillRect(-2, -2, 4, 4);
      }
      ctx.restore();
    }

    // 6. 绘制雷电分叉特效
    for (const lt of this.lightningEffects) {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#0ea5e9';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      lt.points.forEach((pt, idx) => {
        const px = pt[0] * cellSize;
        const py = pt[1] * cellSize;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // 7. 绘制粒子
    for (const pt of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.alpha);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x * cellSize, pt.y * cellSize, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 8. 绘制飘字
    for (const ft of this.floatingTexts) {
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(0, ft.opacity);
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, (ft.x + 0.5) * cellSize, (ft.y + 0.2) * cellSize);
      ctx.globalAlpha = 1.0;
    }

    ctx.restore();
  }
}

// 导出完整游戏页面 HTML 模板
export const CLASH_GAME_TEMPLATE = `
  <div id="algo-clash-of-algorithms-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 胜利结算全屏大弹窗 -->
    <div id="clash-victory-modal" style="display: none; position: absolute; inset: 0; background: rgba(15,23,42,0.75); z-index: 999; backdrop-filter: blur(4px); align-items: center; justify-content: center;">
      <div style="background: #ffffff; border-radius: 12px; padding: 24px 32px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 20px 40px rgba(0,0,0,0.3); border: 2px solid #f59e0b; text-align: center;">
        <span style="font-size: 40px; margin-bottom: 4px;">🏆</span>
        <h2 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 800; color: #0f172a;">战役大捷 · 基地全歼！</h2>
        <div id="modal-stars" style="font-size: 28px; color: #f59e0b; margin-bottom: 8px;">⭐⭐⭐</div>
        <p id="modal-rate" style="margin: 0 0 16px 0; font-size: 13px; color: #475569; font-weight: 700;">摧毁率: 100% | 耗时: 35 秒</p>
        <div style="display: flex; gap: 10px;">
          <button id="btn-modal-next-level" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border: none; border-radius: 8px; padding: 8px 18px; font-size: 13px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(16,185,129,0.3);">🌟 进入下一关</button>
        </div>
      </div>
    </div>

    <!-- 顶栏：关卡选择与游戏状态 HUD -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">⚔️</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">部落冲突·算法实战演练场</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="clash-lvl-btn active" data-level="1" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">第 1 关</button>
          <button class="clash-lvl-btn" data-level="2" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">第 2 关</button>
          <button class="clash-lvl-btn" data-level="3" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">第 3 关</button>
          <button class="clash-lvl-btn" data-level="4" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">第 4 关</button>
          <button class="clash-lvl-btn" data-level="5" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">第 5 关</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <!-- 时间控制器 -->
        <button id="btn-clash-pause" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 3px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">⏸️ 暂停</button>
        <button id="btn-clash-slow" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 3px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">🐢 慢放</button>
        <button id="btn-clash-step" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 3px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">⏭️ 单步</button>

        <span id="clash-timer-display" style="font-size: 12px; font-weight: 700; color: #475569; font-family: monospace;">⏱️ 2:00</span>
        <div style="display: flex; align-items: center; gap: 4px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 2px 8px;">
          <span style="font-size: 11px; color: #991b1b; font-weight: 700;">摧毁率:</span>
          <strong id="clash-destruction-rate" style="font-size: 13px; color: #dc2626; font-family: monospace;">0%</strong>
          <span id="clash-star-display" style="font-size: 13px; color: #f59e0b;">☆☆☆</span>
        </div>
        <button id="btn-toggle-build" style="background: #2563eb; color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔨 进入自由布阵</button>
        <button id="btn-clash-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 关卡算法思想横幅 -->
    <div style="display: flex; align-items: center; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #166534;">
      <span style="font-weight: 800; margin-right: 6px;">🧠 本关算法模型:</span>
      <span id="clash-level-concept">🎯 贪心目标选择 (Greedy Target Selection): 哥布林在目标池中通过 O(K) 过滤出所有金矿，并选取欧氏距离最近的目标。</span>
    </div>

    <!-- 主交互区：左侧 60 FPS 游戏沙盘 + 右侧算法透视与战报 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：游戏沙盘 + 底部圣水与下兵卡组 -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; overflow: hidden;">
        <!-- 布阵工具栏 -->
        <div id="clash-build-bar" style="display: none; align-items: center; gap: 6px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; padding: 4px 8px; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 800; color: #b45309;">建造工具:</span>
          <button class="clash-build-tool active" data-building="WALL" style="padding: 2px 6px; font-size: 10.5px; border-radius: 4px; border: 1px solid #cbd5e1; cursor: pointer;">🧱 城墙</button>
          <button class="clash-build-tool" data-building="ARCHER_TOWER" style="padding: 2px 6px; font-size: 10.5px; border-radius: 4px; border: 1px solid #cbd5e1; cursor: pointer;">🏹 箭塔</button>
          <button class="clash-build-tool" data-building="MORTAR" style="padding: 2px 6px; font-size: 10.5px; border-radius: 4px; border: 1px solid #cbd5e1; cursor: pointer;">💣 迫击炮</button>
          <button class="clash-build-tool" data-building="GOLD_MINE" style="padding: 2px 6px; font-size: 10.5px; border-radius: 4px; border: 1px solid #cbd5e1; cursor: pointer;">🪙 金矿</button>
          <button class="clash-build-tool" data-building="TOWNHALL" style="padding: 2px 6px; font-size: 10.5px; border-radius: 4px; border: 1px solid #cbd5e1; cursor: pointer;">🏰 大本营</button>
        </div>

        <!-- Canvas 画布 -->
        <div style="flex: 1; display: flex; align-items: center; justify-content: center; position: relative; min-height: 0; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
          <canvas id="clash-game-canvas" width="380" height="380" style="width: 380px; height: 380px; cursor: crosshair; box-shadow: 0 4px 16px rgba(16,185,129,0.1); border-radius: 6px;"></canvas>
        </div>

        <!-- 圣水槽 -->
        <div style="display: flex; flex-direction: column; margin-top: 6px; gap: 2px;">
          <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700;">
            <span id="clash-elixir-text" style="color: #9333ea;">💧 圣水: 7.0 / 10.0</span>
            <label style="display: flex; align-items: center; gap: 4px; font-size: 10px; color: #475569; cursor: pointer;">
              <input type="checkbox" id="chk-astar-path" checked /> 显示 A* 寻路轨迹
            </label>
          </div>
          <div style="height: 7px; background: #f3e8ff; border-radius: 4px; overflow: hidden; border: 1px solid #e9d5ff;">
            <div id="clash-elixir-fill" style="width: 70%; height: 100%; background: linear-gradient(90deg, #c084fc, #9333ea); transition: width 0.1s linear;"></div>
          </div>
        </div>

        <!-- 底部兵种与法术卡组 -->
        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; margin-top: 6px;">
          <div class="clash-troop-card active" data-troop="BARBARIAN" style="display: flex; flex-direction: column; align-items: center; background: #f8fafc; border: 1.5px solid #2563eb; border-radius: 6px; padding: 4px 2px; cursor: pointer;">
            <span style="font-size: 14px;">🪓</span>
            <span style="font-size: 9.5px; font-weight: 700; color: #0f172a;">野蛮人</span>
            <span style="font-size: 8.5px; font-weight: 800; color: #9333ea;">💧1</span>
          </div>
          <div class="clash-troop-card" data-troop="ARCHER" style="display: flex; flex-direction: column; align-items: center; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 6px; padding: 4px 2px; cursor: pointer;">
            <span style="font-size: 14px;">🏹</span>
            <span style="font-size: 9.5px; font-weight: 700; color: #0f172a;">弓箭手</span>
            <span style="font-size: 8.5px; font-weight: 800; color: #9333ea;">💧2</span>
          </div>
          <div class="clash-troop-card" data-troop="GIANT" style="display: flex; flex-direction: column; align-items: center; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 6px; padding: 4px 2px; cursor: pointer;">
            <span style="font-size: 14px;">🛡️</span>
            <span style="font-size: 9.5px; font-weight: 700; color: #0f172a;">巨人</span>
            <span style="font-size: 8.5px; font-weight: 800; color: #9333ea;">💧5</span>
          </div>
          <div class="clash-troop-card" data-troop="DRAGON" style="display: flex; flex-direction: column; align-items: center; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 6px; padding: 4px 2px; cursor: pointer;">
            <span style="font-size: 14px;">🐉</span>
            <span style="font-size: 9.5px; font-weight: 700; color: #0f172a;">飞龙(跨墙)</span>
            <span style="font-size: 8.5px; font-weight: 800; color: #9333ea;">💧4</span>
          </div>
          <div class="clash-troop-card" data-troop="GOBLIN" style="display: flex; flex-direction: column; align-items: center; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 6px; padding: 4px 2px; cursor: pointer;">
            <span style="font-size: 14px;">💰</span>
            <span style="font-size: 9.5px; font-weight: 700; color: #0f172a;">哥布林</span>
            <span style="font-size: 8.5px; font-weight: 800; color: #9333ea;">💧1</span>
          </div>
          <div class="clash-troop-card" data-troop="LIGHTNING_SPELL" style="display: flex; flex-direction: column; align-items: center; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 6px; padding: 4px 2px; cursor: pointer;">
            <span style="font-size: 14px;">⚡</span>
            <span style="font-size: 9.5px; font-weight: 700; color: #0f172a;">雷电法术</span>
            <span style="font-size: 8.5px; font-weight: 800; color: #9333ea;">💧3</span>
          </div>
        </div>
      </div>

      <!-- 右侧：算法实验室控制台 + 单兵算路检查器 + 代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <!-- 🔬 算法参数控制台 -->
        <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; gap: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: 800; color: #0f172a;">
            <span>🔬 A* 寻路实验室 (Knob Controls)</span>
            <select id="select-heuristic" style="font-size: 10px; padding: 1px 4px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc;">
              <option value="MANHATTAN">曼哈顿距离 (|dx|+|dy|)</option>
              <option value="EUCLIDEAN">欧几里得距离 (sqrt)</option>
              <option value="DIJKSTRA">Dijkstra 模式 (h=0)</option>
            </select>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10.5px;">
            <span style="color: #475569;">城墙惩罚权重 W:</span>
            <span id="label-wall-penalty" style="font-weight: 700; color: #f59e0b;">16 步行走代价</span>
          </div>
          <input type="range" id="slider-wall-penalty" min="1" max="40" value="16" style="width: 100%; height: 4px; cursor: pointer;" />
        </div>

        <!-- 🔍 单兵算路透视监视器 -->
        <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px;">
          <div style="font-size: 11px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">🔍 单兵算法透视 (Troop Live Inspector)</div>
          <div id="clash-inspector-content">
            <div style="font-size: 11px; color: #94a3b8; text-align: center; padding: 6px 0;">👉 点击地图上的任意小兵，透视其实时 A* 估价公式与搜索统计</div>
          </div>
        </div>

        <!-- 暗色代码终端挂载槽位 -->
        <div id="clash-terminal-mount" style="flex: 1.2; min-height: 160px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>

        <!-- 战局实时事件流 -->
        <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; flex: 0.8; min-height: 80px;">
          <div style="font-size: 10px; font-weight: 700; color: #475569; margin-bottom: 2px; display: flex; justify-content: space-between;">
            <span>📜 战场即时战报 (Live Combat Log)</span>
            <span style="font-size: 9.5px; color: #10b981;">60 FPS 实时演算</span>
          </div>
          <div id="clash-event-log" style="flex: 1; overflow-y: auto; border: 1px solid #f1f5f9; border-radius: 4px; background: #f8fafc;"></div>
        </div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'clash-of-algorithms',
  name: '部落冲突·战术攻防沙盘',
  viewId: 'algo-clash-of-algorithms-view',
  category: 'game',
  description: '真交互即时策略游戏与算法实验室：调节城墙代价滑块、切换启发式函数、点击小兵透视 A* 算路打分',
  icon: '⚔️',
  template: CLASH_GAME_TEMPLATE,
  Visualizer: ClashOfAlgorithmsGameVisualizer,
  difficulty: 3,
  levelOrder: 1,
  learningGoal: '通过调节 A* 惩罚权重与启发式函数，亲自观察小兵在绕路与破墙之间的动态决策边界',
});

export { ClashOfAlgorithmsGameVisualizer as ClashOfAlgorithmsVisualizer };
