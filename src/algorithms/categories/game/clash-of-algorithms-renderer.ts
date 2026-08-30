/**
 * 部落冲突·战术攻防实战游戏 (Clash of Algorithms: Real-Time Tactical Game)
 * 具备完整可玩性的即时策略与算法沙盒游戏：
 * 1. 实时下兵与圣水循环系统 (Elixir + Troop Deck)
 * 2. 真实即时战斗引擎 (60 FPS 物理移动、飞行弹道、范围溅射、飘字伤害)
 * 3. 实时 A* 寻路动态重规划 (破墙开辟新路、兵种目标池动态剪枝)
 * 4. 4 大关卡挑战 + 自由沙盒布阵建造器
 * 5. 战局结算、三星评级与算法实时透视
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  CLASH_ALGORITHMS_CODE_LANGUAGES,
  CLASH_ALGORITHMS_PROBLEM_HTML,
  CLASH_ALGORITHMS_ANALYSIS_HTML,
} from './clash-of-algorithms-problem-content';

export type BuildingType = 'TOWNHALL' | 'ARCHER_TOWER' | 'MORTAR' | 'GOLD_MINE' | 'WALL';
export type TroopType = 'BARBARIAN' | 'ARCHER' | 'GIANT' | 'GOBLIN' | 'WALL_BREAKER';

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
  x: number; // 精确浮点坐标 (网格单位)
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
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  opacity: number;
}

// 关卡配置
interface LevelConfig {
  id: number;
  name: string;
  desc: string;
  tip: string;
  buildings: GameBuilding[];
}

const PRESET_LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: '关卡 1: 哥布林劫掠金矿',
    desc: '资源贪心教学：金矿散落各处，下哥布林极速洗劫！',
    tip: '💡 哥布林移动速度极快且对金矿造成双倍伤害，但血量脆弱，避开箭塔射程！',
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
    name: '关卡 2: 巨石攻坚双箭塔',
    desc: '防御过滤教学：用巨人前排扛伤，后排弓箭手隔墙输出！',
    tip: '💡 巨人只攻击防御塔，箭塔会锁定最近目标。先放巨人吸引仇恨，再在后方下弓箭手！',
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
    name: '关卡 3: 开孔引导阵与炸弹人',
    desc: '破阵权衡教学：用炸弹人炸开封闭城墙，防止主力钻入陷阱！',
    tip: '💡 阵型右侧有缺口，普通小兵会根据 A* 绕远路钻洞。先放炸弹人炸破左侧城墙，打通直达核心捷径！',
    buildings: [
      { id: 'th', type: 'TOWNHALL', r: 4, c: 4, hp: 600, maxHp: 600 },
      { id: 'at1', type: 'ARCHER_TOWER', r: 3, c: 4, hp: 250, maxHp: 250, range: 3.5, attackCooldown: 1.0 },
      { id: 'mor1', type: 'MORTAR', r: 5, c: 4, hp: 200, maxHp: 200, range: 4.5, attackCooldown: 2.2 },
      // 封闭左、上、下，留出右侧缺口
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
    name: '关卡 4: 终极部落大要塞',
    desc: '全兵种联合作战：大本营被箭塔、迫击炮与回字城墙严密保护！',
    tip: '💡 综合运用：炸弹人破外墙 $\\to$ 巨人吸引迫击炮 $\\to$ 哥布林清边 $\\to$ 弓箭手与野蛮人直捣黄龙！',
    buildings: [
      { id: 'th', type: 'TOWNHALL', r: 4, c: 4, hp: 800, maxHp: 800 },
      { id: 'at1', type: 'ARCHER_TOWER', r: 3, c: 3, hp: 280, maxHp: 280, range: 3.5, attackCooldown: 0.9 },
      { id: 'at2', type: 'ARCHER_TOWER', r: 5, c: 5, hp: 280, maxHp: 280, range: 3.5, attackCooldown: 0.9 },
      { id: 'mor1', type: 'MORTAR', r: 3, c: 5, hp: 220, maxHp: 220, range: 4.8, attackCooldown: 2.2 },
      { id: 'gm1', type: 'GOLD_MINE', r: 5, c: 3, hp: 200, maxHp: 200 },
      // 完整回字墙
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

export class ClashOfAlgorithmsGameVisualizer extends StepVisualizer<any> {
  private gridSize = 10;
  private currentLevel = 1;
  private isBuildMode = false;
  private selectedBuildTool: BuildingType = 'WALL';
  private selectedTroopType: TroopType = 'BARBARIAN';
  private showAStarPath = true;

  // 游戏运行状态
  private isRunning = false;
  private animFrameId: number | null = null;
  private lastTimestamp = 0;
  private elixir = 7.0; // 圣水
  private maxElixir = 10.0;
  private battleTimer = 120; // 秒
  private destructionRate = 0;
  private stars = 0;

  // 实体
  private buildings: GameBuilding[] = [];
  private troops: GameTroop[] = [];
  private projectiles: Projectile[] = [];
  private floatingTexts: FloatingText[] = [];
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

  protected initDOMElements(): void {
    // 游戏引擎直接通过 canvas 实时渲染与自包含 UI 驱动
  }

  protected buildSteps(): any[] {
    return [{ message: '部落冲突战术攻防实战沙盘' }];
  }

  protected renderStep(): void {
    // 游戏使用 requestAnimationFrame 60 FPS 实时更新
  }

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
    this.elixir = 7.0;
    this.battleTimer = 120;
    this.destructionRate = 0;
    this.stars = 0;
    this.troops = [];
    this.projectiles = [];
    this.floatingTexts = [];

    const config = PRESET_LEVELS.find((l) => l.id === levelId) || PRESET_LEVELS[0];
    this.buildings = config.buildings.map((b) => ({ ...b }));
    this.totalCoreBuildings = this.buildings.filter((b) => b.type !== 'WALL').length;

    this.updateHUD();
    this.logEvent(`🏰 进入【${config.name}】: ${config.desc}`);
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#clash-game-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.bindCanvasInteraction();
    }

    // 挂载代码调试终端
    this.mountTerminal({
      codeLanguages: CLASH_ALGORITHMS_CODE_LANGUAGES,
      problemHtml: CLASH_ALGORITHMS_PROBLEM_HTML,
      analysisHtml: CLASH_ALGORITHMS_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 关卡切换 Chips
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

    // 布阵与战斗模式切换
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

    // 建筑建造工具选择
    this.root.querySelectorAll<HTMLButtonElement>('.clash-build-tool').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.root?.querySelectorAll('.clash-build-tool').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedBuildTool = (btn.dataset.building || 'WALL') as BuildingType;
      });
    });

    // 重置战场
    const resetBtn = this.root.querySelector('#btn-clash-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.loadLevel(this.currentLevel));
    }

    // A* 寻路透视开关
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

      if (this.isBuildMode) {
        // 布阵模式：摆放或删除建筑
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
        // 实战模式：实时下兵
        this.deployTroop(this.selectedTroopType, r, c);
      }
    });
  }

  // 部署小兵
  private deployTroop(type: TroopType, r: number, c: number): void {
    const costMap: Record<TroopType, number> = {
      BARBARIAN: 1,
      ARCHER: 2,
      GIANT: 5,
      GOBLIN: 1,
      WALL_BREAKER: 2,
    };

    const cost = costMap[type] || 1;
    if (this.elixir < cost) {
      this.addFloatingText(c, r, `💧 圣水不足 (需 ${cost})`, '#ef4444');
      return;
    }

    this.elixir -= cost;
    this.isRunning = true;

    const hpMap: Record<TroopType, number> = {
      BARBARIAN: 200,
      ARCHER: 120,
      GIANT: 600,
      GOBLIN: 110,
      WALL_BREAKER: 90,
    };
    const dmgMap: Record<TroopType, number> = {
      BARBARIAN: 25,
      ARCHER: 22,
      GIANT: 45,
      GOBLIN: 40,
      WALL_BREAKER: 250,
    };
    const speedMap: Record<TroopType, number> = {
      BARBARIAN: 1.2,
      ARCHER: 1.0,
      GIANT: 0.7,
      GOBLIN: 2.2,
      WALL_BREAKER: 1.8,
    };
    const rangeMap: Record<TroopType, number> = {
      BARBARIAN: 0.8,
      ARCHER: 3.2,
      GIANT: 0.8,
      GOBLIN: 0.8,
      WALL_BREAKER: 0.8,
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
    };

    this.troops.push(troop);
    this.addFloatingText(c, r, `+1 ${type}`, '#10b981');
    this.logEvent(`🪓 消耗 💧${cost} 在 (${r}, ${c}) 投放 ${type}，触发实时 A* 寻路！`);
    this.updateTroopAStar(troop);
  }

  // 运行 A* 启发式寻路为小兵规划路径
  private updateTroopAStar(troop: GameTroop): void {
    if (troop.isDead) return;

    // 1. 目标筛选器
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

    // 寻找最近目标
    validTargets.sort((a, b) => Math.hypot(troop.x - (a.c + 0.5), troop.y - (a.r + 0.5)) - Math.hypot(troop.x - (b.c + 0.5), troop.y - (b.r + 0.5)));
    const target = validTargets[0];
    troop.targetId = target.id;

    // 2. A* 网格搜索
    const sr = Math.floor(troop.y);
    const sc = Math.floor(troop.x);
    const tr = target.r;
    const tc = target.c;

    const wallSet = new Set<string>();
    this.buildings.forEach((b) => {
      if (b.type === 'WALL' && b.hp > 0) wallSet.add(`${b.r},${b.c}`);
    });

    interface Node {
      r: number;
      c: number;
      g: number;
      f: number;
      path: [number, number][];
    }

    const open: Node[] = [{ r: sr, c: sc, g: 0, f: Math.abs(sr - tr) + Math.abs(sc - tc), path: [[sr, sc]] }];
    const closed = new Map<string, number>();
    closed.set(`${sr},${sc}`, 0);

    let finalPath: [number, number][] = [];

    while (open.length > 0) {
      open.sort((a, b) => a.f - b.f);
      const cur = open.shift()!;

      if (Math.hypot(cur.r - tr, cur.c - tc) <= troop.range) {
        finalPath = cur.path;
        break;
      }

      if (cur.path.length > 30) continue;

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
        // 炸弹人破墙权重为 1，普通小兵破墙权重为 16 (权衡钻洞 vs 砸墙)
        const stepCost = isWall ? (troop.type === 'WALL_BREAKER' ? 1.0 : 16.0) : 1.0;
        const newG = cur.g + stepCost;

        if (!closed.has(key) || newG < closed.get(key)!) {
          closed.set(key, newG);
          const h = Math.abs(nr - tr) + Math.abs(nc - tc);
          open.push({
            r: nr,
            c: nc,
            g: newG,
            f: newG + h,
            path: [...cur.path, [nr, nc]],
          });
        }
      }
    }

    troop.path = finalPath.length > 0 ? finalPath : [[sr, sc]];
    troop.pathIndex = 0;
  }

  // 主游戏物理与战斗循环
  private startLoop(): void {
    if (typeof requestAnimationFrame !== 'function') return;
    const loop = (timestamp: number) => {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
      this.lastTimestamp = timestamp;

      if (this.isRunning && !this.isBuildMode) {
        this.updateGame(dt);
      }

      this.renderCanvas();
      if (typeof requestAnimationFrame === 'function') {
        this.animFrameId = requestAnimationFrame(loop);
      }
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  private updateGame(dt: number): void {
    // 圣水自然恢复 (每秒 +0.8 滴)
    this.elixir = Math.min(this.maxElixir, this.elixir + 0.8 * dt);

    // 战斗倒计时
    this.battleTimer = Math.max(0, this.battleTimer - dt);

    const now = Date.now() / 1000;

    // 1. 更新小兵移动与攻击
    for (const troop of this.troops) {
      if (troop.isDead) continue;

      const target = this.buildings.find((b) => b.id === troop.targetId && b.hp > 0);
      if (!target) {
        // 目标已死，重新 A* 寻路
        this.updateTroopAStar(troop);
        continue;
      }

      const distToTarget = Math.hypot(troop.x - (target.c + 0.5), troop.y - (target.r + 0.5));

      // 判断前方是否有未摧毁城墙阻隔
      const curR = Math.floor(troop.y);
      const curC = Math.floor(troop.x);
      const nextStep = troop.path[troop.pathIndex + 1];
      let blockingWall: GameBuilding | undefined;

      if (nextStep) {
        blockingWall = this.buildings.find((b) => b.type === 'WALL' && b.hp > 0 && b.r === nextStep[0] && b.c === nextStep[1]);
      }

      if (blockingWall) {
        // 攻击阻碍的城墙
        if (now - troop.lastAttackTime >= troop.attackCooldown) {
          troop.lastAttackTime = now;
          const dmg = troop.type === 'WALL_BREAKER' ? 300 : troop.damage;
          blockingWall.hp = Math.max(0, blockingWall.hp - dmg);
          this.addFloatingText(blockingWall.c, blockingWall.r, `-${dmg}`, '#f59e0b');
          if (blockingWall.hp <= 0) {
            this.logEvent(`💥 城墙 (${blockingWall.r}, ${blockingWall.c}) 被攻破！通道打开！`);
            // 城墙破开，全员重算 A* 寻路！
            this.troops.forEach((t) => this.updateTroopAStar(t));
          }
          if (troop.type === 'WALL_BREAKER') {
            troop.hp = 0;
            troop.isDead = true;
          }
        }
      } else if (distToTarget <= troop.range) {
        // 攻击目标建筑
        if (now - troop.lastAttackTime >= troop.attackCooldown) {
          troop.lastAttackTime = now;
          let dmg = troop.damage;
          if (troop.type === 'GOBLIN' && target.type === 'GOLD_MINE') dmg *= 2; // 哥布林双倍拆金矿
          target.hp = Math.max(0, target.hp - dmg);
          this.addFloatingText(target.c, target.r, `-${dmg}`, '#ef4444');

          if (target.hp <= 0) {
            this.logEvent(`🏆 摧毁目标建筑 ${target.type} (${target.r}, ${target.c})！`);
            // 重新寻找下一个目标
            this.troops.forEach((t) => this.updateTroopAStar(t));
          }
        }
      } else {
        // 沿 A* 路径平滑移动
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
        // 寻找射程内最近存活小兵
        const inRangeTroops = this.troops.filter((t) => !t.isDead && Math.hypot(building.c + 0.5 - t.x, building.r + 0.5 - t.y) <= range);

        if (inRangeTroops.length > 0) {
          inRangeTroops.sort((a, b) => Math.hypot(building.c + 0.5 - a.x, building.r + 0.5 - a.y) - Math.hypot(building.c + 0.5 - b.x, building.r + 0.5 - b.y));
          const targetTroop = inRangeTroops[0];
          building.lastAttackTime = now;

          // 生成飞行弹道
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
          });
        }
      }
    }

    // 3. 飞行弹道推进
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.progress += dt * 3.5; // 弹道飞行速度

      if (p.progress >= 1) {
        // 命中目标
        if (p.isAoE) {
          // 迫击炮范围溅射 (1.8 格半径)
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

    // 4. 更新飘字
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= dt * 0.8;
      ft.opacity -= dt * 1.2;
      if (ft.opacity <= 0) this.floatingTexts.splice(i, 1);
    }

    // 5. 战局结算
    const destroyedCores = this.buildings.filter((b) => b.type !== 'WALL' && b.hp <= 0).length;
    this.destructionRate = this.totalCoreBuildings > 0 ? Math.round((destroyedCores / this.totalCoreBuildings) * 100) : 0;

    const th = this.buildings.find((b) => b.type === 'TOWNHALL');
    let stars = 0;
    if (th && th.hp <= 0) stars++;
    if (this.destructionRate >= 50) stars++;
    if (this.destructionRate >= 100) stars = 3;
    this.stars = stars;

    this.updateHUD();
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

    // 圣水水滴与进度条
    const elixirFill = this.root.querySelector('#clash-elixir-fill') as HTMLElement | null;
    const elixirText = this.root.querySelector('#clash-elixir-text') as HTMLElement | null;
    if (elixirFill) elixirFill.style.width = `${(this.elixir / this.maxElixir) * 100}%`;
    if (elixirText) elixirText.textContent = `💧 圣水: ${this.elixir.toFixed(1)} / ${this.maxElixir}`;

    // 摧毁率与星级
    const rateEl = this.root.querySelector('#clash-destruction-rate') as HTMLElement | null;
    const starEl = this.root.querySelector('#clash-star-display') as HTMLElement | null;
    if (rateEl) rateEl.textContent = `${this.destructionRate}%`;
    if (starEl) starEl.textContent = `${'⭐'.repeat(this.stars)}${'☆'.repeat(3 - this.stars)}`;

    // 倒计时
    const timerEl = this.root.querySelector('#clash-timer-display') as HTMLElement | null;
    if (timerEl) {
      const m = Math.floor(this.battleTimer / 60);
      const s = Math.floor(this.battleTimer % 60);
      timerEl.textContent = `⏱️ ${m}:${s < 10 ? '0' : ''}${s}`;
    }

    // 存活兵力与建筑
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

  // 渲染 60 FPS Canvas 沙盘
  private renderCanvas(): void {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const cellSize = width / this.gridSize;

    ctx.clearRect(0, 0, width, height);

    // 1. 绘制草地网格
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? '#ecfdf5' : '#f0fdf4';
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        ctx.strokeStyle = '#d1fae5';
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

        ctx.strokeStyle = troop.type === 'GIANT' ? 'rgba(37,99,235,0.6)' : troop.type === 'GOBLIN' ? 'rgba(234,179,8,0.7)' : 'rgba(16,185,129,0.7)';
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

    // 3. 绘制建筑
    for (const b of this.buildings) {
      const bx = b.c * cellSize;
      const by = b.r * cellSize;
      const isDead = b.hp <= 0;

      // 建筑底座
      ctx.fillStyle = isDead ? '#f1f5f9' : b.type === 'TOWNHALL' ? '#eff6ff' : b.type === 'ARCHER_TOWER' ? '#fef2f2' : b.type === 'MORTAR' ? '#fff7ed' : b.type === 'GOLD_MINE' ? '#fefce8' : '#e2e8f0';
      ctx.strokeStyle = isDead ? '#cbd5e1' : b.type === 'TOWNHALL' ? '#3b82f6' : b.type === 'ARCHER_TOWER' ? '#ef4444' : b.type === 'MORTAR' ? '#f97316' : b.type === 'GOLD_MINE' ? '#eab308' : '#64748b';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.roundRect(bx + 2, by + 2, cellSize - 4, cellSize - 4, 4);
      ctx.fill();
      ctx.stroke();

      // 图标
      ctx.font = `${cellSize * 0.45}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const icon = isDead ? '💥' : b.type === 'TOWNHALL' ? '🏰' : b.type === 'ARCHER_TOWER' ? '🏹' : b.type === 'MORTAR' ? '💣' : b.type === 'GOLD_MINE' ? '🪙' : '🧱';
      ctx.fillText(icon, bx + cellSize / 2, by + cellSize / 2);

      // 防御塔攻击范围指示圆
      if (!isDead && (b.type === 'ARCHER_TOWER' || b.type === 'MORTAR') && b.range) {
        ctx.beginPath();
        ctx.arc(bx + cellSize / 2, by + cellSize / 2, b.range * cellSize, 0, Math.PI * 2);
        ctx.strokeStyle = b.type === 'MORTAR' ? 'rgba(249,115,22,0.12)' : 'rgba(239,68,68,0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 血条
      if (!isDead && b.type !== 'WALL') {
        const hpPct = b.hp / b.maxHp;
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(bx + 4, by + cellSize - 6, cellSize - 8, 3);
        ctx.fillStyle = hpPct > 0.4 ? '#10b981' : '#ef4444';
        ctx.fillRect(bx + 4, by + cellSize - 6, (cellSize - 8) * hpPct, 3);
      }
    }

    // 4. 绘制小兵
    for (const troop of this.troops) {
      if (troop.isDead) continue;
      const tx = troop.x * cellSize;
      const ty = troop.y * cellSize;

      ctx.save();
      ctx.beginPath();
      ctx.arc(tx, ty, cellSize * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = troop.type === 'GIANT' ? '#2563eb' : troop.type === 'GOBLIN' ? '#eab308' : troop.type === 'ARCHER' ? '#ec4899' : '#10b981';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = `${cellSize * 0.38}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const tIcon = troop.type === 'GIANT' ? '🛡️' : troop.type === 'GOBLIN' ? '💰' : troop.type === 'ARCHER' ? '🏹' : troop.type === 'WALL_BREAKER' ? '💣' : '🪓';
      ctx.fillText(tIcon, tx, ty);

      // 小兵血条
      const hpPct = troop.hp / troop.maxHp;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(tx - cellSize * 0.3, ty - cellSize * 0.45, cellSize * 0.6, 2.5);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(tx - cellSize * 0.3, ty - cellSize * 0.45, cellSize * 0.6 * hpPct, 2.5);
      ctx.restore();
    }

    // 5. 绘制飞行弹道 (箭矢与迫击炮弹)
    for (const p of this.projectiles) {
      const curX = (p.startX + (p.targetX - p.startX) * p.progress) * cellSize;
      const curY = (p.startY + (p.targetY - p.startY) * p.progress) * cellSize;

      ctx.beginPath();
      if (p.isAoE) {
        ctx.arc(curX, curY, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#f97316';
        ctx.fill();
      } else {
        ctx.arc(curX, curY, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
      }
    }

    // 6. 绘制飘字
    for (const ft of this.floatingTexts) {
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(0, ft.opacity);
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, (ft.x + 0.5) * cellSize, (ft.y + 0.2) * cellSize);
      ctx.globalAlpha = 1.0;
    }
  }
}

// 导出 HTML 模板
export const CLASH_GAME_TEMPLATE = `
  <div id="algo-clash-of-algorithms-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <!-- 顶栏：关卡选择与游戏状态 HUD -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">⚔️</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">部落冲突·算法实战演练场</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="clash-lvl-btn active" data-level="1" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">第 1 关</button>
          <button class="clash-lvl-btn" data-level="2" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">第 2 关</button>
          <button class="clash-lvl-btn" data-level="3" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">第 3 关</button>
          <button class="clash-lvl-btn" data-level="4" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">第 4 关</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 12px;">
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

    <!-- 主交互区：左侧 60 FPS 游戏沙盘 + 右侧算法透视与战报 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：游戏沙盘 + 底部圣水与下兵卡组 -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; overflow: hidden;">
        <!-- 布阵工具栏 (自由布阵模式时显示) -->
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

        <!-- 底部兵种卡组 (点击卡牌选中，再点击地图任意处即时下兵) -->
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-top: 6px;">
          <div class="clash-troop-card active" data-troop="BARBARIAN" style="display: flex; flex-direction: column; align-items: center; background: #f8fafc; border: 1.5px solid #2563eb; border-radius: 6px; padding: 4px 2px; cursor: pointer;">
            <span style="font-size: 15px;">🪓</span>
            <span style="font-size: 10px; font-weight: 700; color: #0f172a;">野蛮人</span>
            <span style="font-size: 9px; font-weight: 800; color: #9333ea;">💧1 圣水</span>
          </div>
          <div class="clash-troop-card" data-troop="ARCHER" style="display: flex; flex-direction: column; align-items: center; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 6px; padding: 4px 2px; cursor: pointer;">
            <span style="font-size: 15px;">🏹</span>
            <span style="font-size: 10px; font-weight: 700; color: #0f172a;">弓箭手</span>
            <span style="font-size: 9px; font-weight: 800; color: #9333ea;">💧2 圣水</span>
          </div>
          <div class="clash-troop-card" data-troop="GIANT" style="display: flex; flex-direction: column; align-items: center; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 6px; padding: 4px 2px; cursor: pointer;">
            <span style="font-size: 15px;">🛡️</span>
            <span style="font-size: 10px; font-weight: 700; color: #0f172a;">巨人 (抗伤)</span>
            <span style="font-size: 9px; font-weight: 800; color: #9333ea;">💧5 圣水</span>
          </div>
          <div class="clash-troop-card" data-troop="GOBLIN" style="display: flex; flex-direction: column; align-items: center; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 6px; padding: 4px 2px; cursor: pointer;">
            <span style="font-size: 15px;">💰</span>
            <span style="font-size: 10px; font-weight: 700; color: #0f172a;">哥布林</span>
            <span style="font-size: 9px; font-weight: 800; color: #9333ea;">💧1 圣水</span>
          </div>
          <div class="clash-troop-card" data-troop="WALL_BREAKER" style="display: flex; flex-direction: column; align-items: center; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 6px; padding: 4px 2px; cursor: pointer;">
            <span style="font-size: 15px;">💣</span>
            <span style="font-size: 10px; font-weight: 700; color: #0f172a;">炸弹人</span>
            <span style="font-size: 9px; font-weight: 800; color: #9333ea;">💧2 圣水</span>
          </div>
        </div>
      </div>

      <!-- 右侧：战况监视 + 代码终端与战局事件流 -->
      <div style="display: flex; flex-direction: column; gap: 8px; min-height: 0;">
        <!-- 实时战况指标 -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px; font-size: 10.5px;">
            <span>存活兵力:</span>
            <strong id="clash-alive-troops" style="color: #10b981; font-family: monospace;">0 队</strong>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px; font-size: 10.5px;">
            <span>剩余防御:</span>
            <strong id="clash-alive-buildings" style="color: #2563eb; font-family: monospace;">0 座</strong>
          </div>
        </div>

        <!-- 战局实时事件流 -->
        <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; flex: 1; min-height: 0;">
          <div style="font-size: 10.5px; font-weight: 700; color: #475569; margin-bottom: 4px; display: flex; justify-content: space-between;">
            <span>📜 战场即时战报 (Live Combat Log)</span>
            <span style="font-size: 9.5px; color: #10b981;">60 FPS 实时演算</span>
          </div>
          <div id="clash-event-log" style="flex: 1; overflow-y: auto; border: 1px solid #f1f5f9; border-radius: 4px; background: #f8fafc;"></div>
        </div>

        <!-- 暗色代码终端挂载槽位 -->
        <div id="clash-terminal-mount" style="flex: 1.2; min-height: 180px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'clash-of-algorithms',
  name: '部落冲突·战术攻防沙盘',
  viewId: 'algo-clash-of-algorithms-view',
  category: 'game',
  description: '真交互即时策略游戏：实时下兵、圣水循环、A* 寻路权重与防御塔索敌对决',
  icon: '⚔️',
  template: CLASH_GAME_TEMPLATE,
  Visualizer: ClashOfAlgorithmsGameVisualizer,
  difficulty: 3,
  levelOrder: 1,
  learningGoal: '通过真实的策略对战操作，亲身体验 A* 寻路权衡、目标池剪枝与空间索敌算法的魅力',
});

export { ClashOfAlgorithmsGameVisualizer as ClashOfAlgorithmsVisualizer };
