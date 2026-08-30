/**
 * 部落冲突·战术攻防沙盘 (Clash of Algorithms) 游戏化可视化器
 * 核心特性：
 * 1. 10x10 战术等轴/俯视沙盘网格与建筑实体系统 (大本营、箭塔、迫击炮、金矿、城墙)
 * 2. 4 大兵种独立 AI 寻路 (野蛮人-最近邻BFS, 巨人-防御过滤A*, 哥布林-资源贪心, 炸弹人-闭合墙破拆)
 * 3. 算法 X-Ray 透视层：实时 A* 寻路路径、防御塔攻击射程圆与锁定激光
 * 4. 经典阵型预设与战况摧毁率动态结算 (0% ~ 100% ⭐⭐⭐)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  CLASH_ALGORITHMS_CODE_LANGUAGES,
  CLASH_ALGORITHMS_PROBLEM_HTML,
  CLASH_ALGORITHMS_ANALYSIS_HTML,
} from './clash-of-algorithms-problem-content';

export type BuildingType = 'TOWNHALL' | 'ARCHER_TOWER' | 'MORTAR' | 'GOLD_MINE' | 'WALL';
export type TroopType = 'BARBARIAN' | 'GIANT' | 'GOBLIN' | 'WALL_BREAKER';

export interface BuildingState {
  id: string;
  type: BuildingType;
  r: number;
  c: number;
  hp: number;
  maxHp: number;
  range?: number;
  damage?: number;
  targetTroopId?: string | null;
}

export interface TroopState {
  id: string;
  type: TroopType;
  r: number;
  c: number;
  hp: number;
  maxHp: number;
  targetBuildingId?: string | null;
  path: [number, number][];
  status: 'walking' | 'attacking' | 'dead';
}

export interface ClashStep {
  tick: number;
  gridSize: number;
  buildings: BuildingState[];
  troops: TroopState[];
  destructionRate: number; // 0 ~ 100
  stars: number; // 0 ~ 3
  activeAiLog: string;
  activeTroopFocus: TroopState | null;
  activeTowerFocus: BuildingState | null;
  message: string;
  log: string;
  codeLine: number;
}

// 启发式曼哈顿距离
function manhattanDist(r1: number, c1: number, r2: number, c2: number): number {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}

// 欧式距离
function euclideanDist(r1: number, c1: number, r2: number, c2: number): number {
  return Math.hypot(r1 - r2, c1 - c2);
}

// A* 寻路算法实现：计算从 (sr, sc) 到目标建筑的最优路径 (考虑城墙惩罚)
function computeAStarPath(
  sr: number,
  sc: number,
  tr: number,
  tc: number,
  buildings: BuildingState[],
  gridSize: number,
  isWallBreaker: boolean = false
): [number, number][] {
  // 构建城墙阻碍矩阵
  const wallMap = new Set<string>();
  buildings.forEach((b) => {
    if (b.type === 'WALL' && b.hp > 0) {
      wallMap.add(`${b.r},${b.c}`);
    }
  });

  interface QNode {
    r: number;
    c: number;
    g: number;
    f: number;
    path: [number, number][];
  }

  const open: QNode[] = [{ r: sr, c: sc, g: 0, f: manhattanDist(sr, sc, tr, tc), path: [[sr, sc]] }];
  const visited = new Map<string, number>();
  visited.set(`${sr},${sc}`, 0);

  let bestPath: [number, number][] = [];
  let minF = Infinity;

  while (open.length > 0) {
    // 取 f 最小节点
    open.sort((a, b) => a.f - b.f);
    const cur = open.shift()!;

    if (manhattanDist(cur.r, cur.c, tr, tc) <= 1) {
      return cur.path;
    }

    if (cur.path.length > 25) continue; // 限制搜索深度

    const dirs = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    for (const [dr, dc] of dirs) {
      const nr = cur.r + dr;
      const nc = cur.c + dc;
      if (nr < 0 || nr >= gridSize || nc < 0 || nc >= gridSize) continue;

      const key = `${nr},${nc}`;
      const isWall = wallMap.has(key);
      // 城墙惩罚：普通小兵相当于 15 步行走代价，炸弹人仅 1 步
      const stepCost = isWall ? (isWallBreaker ? 1 : 15) : 1;
      const newG = cur.g + stepCost;

      if (!visited.has(key) || newG < visited.get(key)!) {
        visited.set(key, newG);
        const h = manhattanDist(nr, nc, tr, tc);
        const nextNode: QNode = {
          r: nr,
          c: nc,
          g: newG,
          f: newG + h,
          path: [...cur.path, [nr, nc]],
        };
        open.push(nextNode);

        if (h < minF) {
          minF = h;
          bestPath = nextNode.path;
        }
      }
    }
  }

  return bestPath.length > 0 ? bestPath : [[sr, sc]];
}

export function buildClashBattleSteps(presetType: string = 'open_trap'): ClashStep[] {
  const gridSize = 10;
  let initialBuildings: BuildingState[] = [];
  let initialTroops: TroopState[] = [];

  if (presetType === 'loop_box') {
    // 预设 1：经典回字阵
    initialBuildings = [
      { id: 'th', type: 'TOWNHALL', r: 4, c: 4, hp: 600, maxHp: 600 },
      { id: 'at1', type: 'ARCHER_TOWER', r: 3, c: 3, hp: 250, maxHp: 250, range: 3.5, damage: 30 },
      { id: 'at2', type: 'ARCHER_TOWER', r: 5, c: 5, hp: 250, maxHp: 250, range: 3.5, damage: 30 },
      { id: 'mor', type: 'MORTAR', r: 3, c: 5, hp: 200, maxHp: 200, range: 4.5, damage: 45 },
      { id: 'gm1', type: 'GOLD_MINE', r: 5, c: 3, hp: 180, maxHp: 180 },
      // 封闭回字形城墙
      { id: 'w1', type: 'WALL', r: 2, c: 2, hp: 150, maxHp: 150 },
      { id: 'w2', type: 'WALL', r: 2, c: 3, hp: 150, maxHp: 150 },
      { id: 'w3', type: 'WALL', r: 2, c: 4, hp: 150, maxHp: 150 },
      { id: 'w4', type: 'WALL', r: 2, c: 5, hp: 150, maxHp: 150 },
      { id: 'w5', type: 'WALL', r: 2, c: 6, hp: 150, maxHp: 150 },
      { id: 'w6', type: 'WALL', r: 6, c: 2, hp: 150, maxHp: 150 },
      { id: 'w7', type: 'WALL', r: 6, c: 3, hp: 150, maxHp: 150 },
      { id: 'w8', type: 'WALL', r: 6, c: 4, hp: 150, maxHp: 150 },
      { id: 'w9', type: 'WALL', r: 6, c: 5, hp: 150, maxHp: 150 },
      { id: 'w10', type: 'WALL', r: 6, c: 6, hp: 150, maxHp: 150 },
    ];
    initialTroops = [
      { id: 'g1', type: 'GIANT', r: 0, c: 4, hp: 500, maxHp: 500, path: [], status: 'walking' },
      { id: 'b1', type: 'BARBARIAN', r: 0, c: 2, hp: 180, maxHp: 180, path: [], status: 'walking' },
      { id: 'wb1', type: 'WALL_BREAKER', r: 0, c: 5, hp: 90, maxHp: 90, path: [], status: 'walking' },
    ];
  } else {
    // 预设 2：开孔引导陷阱阵 (最经典：验证小兵为什么绕路钻洞)
    initialBuildings = [
      { id: 'th', type: 'TOWNHALL', r: 4, c: 4, hp: 600, maxHp: 600 },
      { id: 'at1', type: 'ARCHER_TOWER', r: 3, c: 4, hp: 250, maxHp: 250, range: 3.5, damage: 35 },
      { id: 'mor', type: 'MORTAR', r: 5, c: 4, hp: 200, maxHp: 200, range: 4.5, damage: 45 },
      { id: 'gm1', type: 'GOLD_MINE', r: 4, c: 6, hp: 180, maxHp: 180 },
      // 带有缺口的城墙 (右侧留出缺口)
      { id: 'w1', type: 'WALL', r: 2, c: 2, hp: 150, maxHp: 150 },
      { id: 'w2', type: 'WALL', r: 2, c: 3, hp: 150, maxHp: 150 },
      { id: 'w3', type: 'WALL', r: 2, c: 4, hp: 150, maxHp: 150 },
      { id: 'w4', type: 'WALL', r: 2, c: 5, hp: 150, maxHp: 150 },
      { id: 'w5', type: 'WALL', r: 3, c: 2, hp: 150, maxHp: 150 },
      { id: 'w6', type: 'WALL', r: 4, c: 2, hp: 150, maxHp: 150 },
      { id: 'w7', type: 'WALL', r: 5, c: 2, hp: 150, maxHp: 150 },
      { id: 'w8', type: 'WALL', r: 6, c: 2, hp: 150, maxHp: 150 },
      { id: 'w9', type: 'WALL', r: 6, c: 3, hp: 150, maxHp: 150 },
      { id: 'w10', type: 'WALL', r: 6, c: 4, hp: 150, maxHp: 150 },
      { id: 'w11', type: 'WALL', r: 6, c: 5, hp: 150, maxHp: 150 },
    ];
    initialTroops = [
      { id: 'g1', type: 'GIANT', r: 0, c: 3, hp: 500, maxHp: 500, path: [], status: 'walking' },
      { id: 'b1', type: 'BARBARIAN', r: 0, c: 1, hp: 180, maxHp: 180, path: [], status: 'walking' },
      { id: 'gob1', type: 'GOBLIN', r: 8, c: 1, hp: 120, maxHp: 120, path: [], status: 'walking' },
    ];
  }

  const steps: ClashStep[] = [];
  let buildings = initialBuildings.map((b) => ({ ...b }));
  let troops = initialTroops.map((t) => ({ ...t }));
  const totalCoreBuildings = buildings.filter((b) => b.type !== 'WALL').length;

  // 初始战备帧
  steps.push({
    tick: 0,
    gridSize,
    buildings: buildings.map((b) => ({ ...b })),
    troops: troops.map((t) => ({ ...t })),
    destructionRate: 0,
    stars: 0,
    activeAiLog: '战前侦察：双方阵营就绪，兵种准备运行 A* 启发式目标检索与寻路',
    activeTroopFocus: null,
    activeTowerFocus: null,
    message: '【战备阶段】网格沙盘加载完毕。请点击播放或单步步进，观看兵种 AI 与防御塔交互对决！',
    log: `战备就绪: 防御建筑 ${totalCoreBuildings} 座, 城墙 ${buildings.filter((b) => b.type === 'WALL').length} 堵, 进攻兵力 ${troops.length} 队`,
    codeLine: 18,
  });

  // 战斗模拟 Tick 循环 (最多 16 步)
  for (let tick = 1; tick <= 14; tick++) {
    let tickMessage = '';
    let tickLog = '';

    // 1. 兵种 AI 决策与移动
    for (const troop of troops) {
      if (troop.hp <= 0) continue;

      // 目标筛选器
      let candidateBuildings = buildings.filter((b) => b.hp > 0 && b.type !== 'WALL');
      if (troop.type === 'GIANT') {
        const defenses = candidateBuildings.filter((b) => b.type === 'ARCHER_TOWER' || b.type === 'MORTAR');
        if (defenses.length > 0) candidateBuildings = defenses;
      } else if (troop.type === 'GOBLIN') {
        const resources = candidateBuildings.filter((b) => b.type === 'GOLD_MINE');
        if (resources.length > 0) candidateBuildings = resources;
      }

      if (candidateBuildings.length === 0) {
        candidateBuildings = buildings.filter((b) => b.hp > 0 && b.type !== 'WALL');
      }

      if (candidateBuildings.length === 0) break; // 全部摧毁

      // 寻找最近目标
      candidateBuildings.sort((a, b) => manhattanDist(troop.r, troop.c, a.r, a.c) - manhattanDist(troop.r, troop.c, b.r, b.c));
      const target = candidateBuildings[0];
      troop.targetBuildingId = target.id;

      // A* 寻路
      const path = computeAStarPath(troop.r, troop.c, target.r, target.c, buildings, gridSize, troop.type === 'WALL_BREAKER');
      troop.path = path;

      const distToTarget = manhattanDist(troop.r, troop.c, target.r, target.c);
      if (distToTarget <= 1) {
        // 贴身攻击目标
        troop.status = 'attacking';
        const dmg = troop.type === 'GIANT' ? 40 : troop.type === 'GOBLIN' ? 50 : 30;
        target.hp = Math.max(0, target.hp - dmg);
        tickMessage = `⚔️ ${troop.type} 正在猛攻 ${target.type} (剩余 HP: ${target.hp}/${target.maxHp})`;
        tickLog = `${troop.type} 攻击 ${target.id} - 造成 ${dmg} 点伤害`;
      } else if (path.length >= 2) {
        // 沿 A* 路径移动一步
        const nextStep = path[1];
        // 检查前面是否有城墙阻挡
        const blockingWall = buildings.find((b) => b.type === 'WALL' && b.hp > 0 && b.r === nextStep[0] && b.c === nextStep[1]);
        if (blockingWall) {
          troop.status = 'attacking';
          const wallDmg = troop.type === 'WALL_BREAKER' ? 200 : 35;
          blockingWall.hp = Math.max(0, blockingWall.hp - wallDmg);
          tickMessage = `🧱 ${troop.type} 路径被城墙阻挡，正在砸墙 (城墙 HP: ${blockingWall.hp})`;
          tickLog = `${troop.type} 破拆城墙 ${blockingWall.id} (造成 ${wallDmg} 伤害)`;
          if (troop.type === 'WALL_BREAKER') troop.hp = 0; // 炸弹人自爆
        } else {
          troop.r = nextStep[0];
          troop.c = nextStep[1];
          troop.status = 'walking';
          tickMessage = `🏃 ${troop.type} 运行 A* 算法，向目标 ${target.type} 推进`;
          tickLog = `${troop.type} 沿 A* 路径前进至 (${troop.r}, ${troop.c})`;
        }
      }
    }

    // 2. 防御塔索敌与射击
    for (const building of buildings) {
      if (building.hp <= 0 || (building.type !== 'ARCHER_TOWER' && building.type !== 'MORTAR')) continue;

      const range = building.range || 3.5;
      const damage = building.damage || 30;

      // 寻找射程内最近的存活小兵
      let inRangeTroops = troops.filter((t) => t.hp > 0 && euclideanDist(building.r, building.c, t.r, t.c) <= range);
      if (inRangeTroops.length > 0) {
        inRangeTroops.sort((a, b) => euclideanDist(building.r, building.c, a.r, a.c) - euclideanDist(building.r, building.c, b.r, b.c));
        const targetTroop = inRangeTroops[0];
        building.targetTroopId = targetTroop.id;
        targetTroop.hp = Math.max(0, targetTroop.hp - damage);
        if (targetTroop.hp <= 0) targetTroop.status = 'dead';
        tickLog += ` | ${building.type} 锁定并击中 ${targetTroop.type} (-${damage} HP)`;
      } else {
        building.targetTroopId = null;
      }
    }

    // 3. 计算摧毁率与星级
    const destroyedCores = buildings.filter((b) => b.type !== 'WALL' && b.hp <= 0).length;
    const rate = Math.round((destroyedCores / totalCoreBuildings) * 100);
    const thDestroyed = buildings.find((b) => b.type === 'TOWNHALL')?.hp === 0;
    let stars = 0;
    if (thDestroyed) stars++;
    if (rate >= 50) stars++;
    if (rate >= 100) stars = 3;

    steps.push({
      tick,
      gridSize,
      buildings: buildings.map((b) => ({ ...b })),
      troops: troops.map((t) => ({ ...t, path: [...t.path] })),
      destructionRate: rate,
      stars,
      activeAiLog: tickMessage || '战场交火中...',
      activeTroopFocus: troops.find((t) => t.hp > 0) || null,
      activeTowerFocus: buildings.find((b) => b.hp > 0 && b.targetTroopId) || null,
      message: `【第 ${tick} 秒战况】摧毁进度 ${rate}% | ${tickMessage}`,
      log: `[Tick ${tick}] ${tickLog}`,
      codeLine: 24,
    });

    if (rate >= 100 || troops.every((t) => t.hp <= 0)) {
      break;
    }
  }

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<ClashStep>({
  id: 'clash-of-algorithms',
  name: '部落冲突·战术攻防沙盘',
  category: 'game',
  icon: '⚔️',
  badge: {
    mode: 'A*寻路·权重权衡·索敌机制',
    complexity: 'A* O(E) · 空间 O(V)',
  },
  card1Title: '🏰 部落冲突·战术攻防网格沙盘 (Clash Battlefield)',
  card2Title: '🧭 战术 AI 指针与战况监视器',
  card2Desc: '兵种 A* 寻路路径、城墙砸墙代价权衡与防御塔索敌追踪',
  legend: [
    { label: '🏰 核心基地', color: '#2563eb' },
    { label: '🏹 防御设施', color: '#ef4444' },
    { label: '🪙 资源建筑', color: '#f59e0b' },
    { label: '🛡️ 进攻兵种', color: '#10b981' },
    { label: '🧱 物理城墙', color: '#64748b' },
  ],
  modes: [
    { id: 'open_trap', label: '🕳️ 开孔引导陷阱阵' },
    { id: 'loop_box', label: '📦 经典封闭回字阵' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '防守阵型',
      type: 'select',
      defaultValue: 'open_trap',
      options: [
        { label: '开孔引导陷阱阵 (小兵绕路钻洞)', value: 'open_trap' },
        { label: '经典封闭回字阵 (小兵强行砸墙)', value: 'loop_box' },
      ],
      width: '180px',
    },
  ],
  presets: [
    { label: '引导缺口阵', values: { 'input-preset': 'open_trap' } },
    { label: '封闭回字阵', values: { 'input-preset': 'loop_box' } },
  ],
  metrics: [
    { id: 'destruction-rate', label: '摧毁进度', color: '#ef4444' },
    { id: 'alive-troops', label: '存活兵力', color: '#10b981' },
    { id: 'alive-defenses', label: '剩余防御', color: '#2563eb' },
  ],
  codeLanguages: CLASH_ALGORITHMS_CODE_LANGUAGES,
  problemHtml: CLASH_ALGORITHMS_PROBLEM_HTML,
  analysisHtml: CLASH_ALGORITHMS_ANALYSIS_HTML,
  buildSteps: (inputs, mode) => {
    const p = (mode || inputs['input-preset'] || 'open_trap') as string;
    return buildClashBattleSteps(p);
  },
  renderCanvas: (container, step) => {
    const { gridSize, buildings, troops, destructionRate, stars } = step;

    // 绘制 10x10 等轴网格沙盘
    const cellSize = 28;
    const boardWidth = gridSize * cellSize;
    const boardHeight = gridSize * cellSize;

    // 生成网格线与地块
    let gridCellsHtml = '';
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const isGrass = (r + c) % 2 === 0;
        const bg = isGrass ? '#ecfdf5' : '#f0fdf4';
        gridCellsHtml += `
          <div style="position: absolute; left: ${c * cellSize}px; top: ${r * cellSize}px; width: ${cellSize}px; height: ${cellSize}px; background: ${bg}; border: 0.5px solid #d1fae5; box-sizing: border-box;"></div>
        `;
      }
    }

    // 绘制建筑
    let buildingsHtml = '';
    buildings.forEach((b) => {
      const isDead = b.hp <= 0;
      let icon = '🏰';
      let bgColor = '#eff6ff';
      let borderColor = '#3b82f6';
      let label = '大本营';

      if (b.type === 'ARCHER_TOWER') {
        icon = '🏹';
        bgColor = '#fef2f2';
        borderColor = '#ef4444';
        label = '箭塔';
      } else if (b.type === 'MORTAR') {
        icon = '💣';
        bgColor = '#fff7ed';
        borderColor = '#f97316';
        label = '迫击炮';
      } else if (b.type === 'GOLD_MINE') {
        icon = '🪙';
        bgColor = '#fefce8';
        borderColor = '#eab308';
        label = '金矿';
      } else if (b.type === 'WALL') {
        icon = '🧱';
        bgColor = '#f1f5f9';
        borderColor = '#64748b';
        label = '墙';
      }

      if (isDead) {
        bgColor = '#f8fafc';
        borderColor = '#cbd5e1';
        icon = '💥';
      }

      const hpPercent = Math.round((b.hp / b.maxHp) * 100);

      // 防御塔攻击连线 (激光锁定)
      let laserLineHtml = '';
      if (!isDead && b.targetTroopId) {
        const targetTroop = troops.find((t) => t.id === b.targetTroopId);
        if (targetTroop && targetTroop.hp > 0) {
          const x1 = b.c * cellSize + cellSize / 2;
          const y1 = b.r * cellSize + cellSize / 2;
          const x2 = targetTroop.c * cellSize + cellSize / 2;
          const y2 = targetTroop.r * cellSize + cellSize / 2;
          laserLineHtml = `
            <svg style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none; z-index: 15;">
              <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ef4444" stroke-width="2" stroke-dasharray="3 3" />
              <circle cx="${x2}" cy="${y2}" r="5" fill="#ef4444" />
            </svg>
          `;
        }
      }

      buildingsHtml += `
        ${laserLineHtml}
        <div style="position: absolute; left: ${b.c * cellSize + 2}px; top: ${b.r * cellSize + 2}px; width: ${cellSize - 4}px; height: ${cellSize - 4}px; background: ${bgColor}; border: 1.5px solid ${borderColor}; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 11px; z-index: 10; box-shadow: 0 1px 2px rgba(0,0,0,0.05); opacity: ${isDead ? '0.35' : '1'};">
          <span style="line-height: 1;">${icon}</span>
          ${!isDead && b.type !== 'WALL' ? `
            <div style="position: absolute; bottom: -3px; left: 2px; right: 2px; height: 2px; background: #e2e8f0; border-radius: 1px; overflow: hidden;">
              <div style="width: ${hpPercent}%; height: 100%; background: ${hpPercent > 40 ? '#10b981' : '#ef4444'};"></div>
            </div>
          ` : ''}
        </div>
      `;
    });

    // 绘制小兵及其 A* 路径
    let troopsHtml = '';
    troops.forEach((t) => {
      if (t.hp <= 0) return;

      let tIcon = '🪓';
      let tBorder = '#10b981';
      if (t.type === 'GIANT') {
        tIcon = '🛡️';
        tBorder = '#2563eb';
      } else if (t.type === 'GOBLIN') {
        tIcon = '💰';
        tBorder = '#eab308';
      } else if (t.type === 'WALL_BREAKER') {
        tIcon = '💣';
        tBorder = '#f97316';
      }

      // A* 虚线路径绘制
      let pathSvg = '';
      if (t.path && t.path.length > 1) {
        const pointsStr = t.path.map(([pr, pc]) => `${pc * cellSize + cellSize / 2},${pr * cellSize + cellSize / 2}`).join(' ');
        pathSvg = `
          <svg style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none; z-index: 8;">
            <polyline points="${pointsStr}" fill="none" stroke="${tBorder}" stroke-width="2" stroke-dasharray="4 2" opacity="0.65" />
          </svg>
        `;
      }

      const hpPct = Math.round((t.hp / t.maxHp) * 100);

      troopsHtml += `
        ${pathSvg}
        <div style="position: absolute; left: ${t.c * cellSize + 2}px; top: ${t.r * cellSize + 2}px; width: ${cellSize - 4}px; height: ${cellSize - 4}px; background: #ffffff; border: 1.5px solid ${tBorder}; border-radius: 999px; display: flex; align-items: center; justify-content: center; font-size: 11px; z-index: 20; box-shadow: 0 2px 4px rgba(0,0,0,0.15);">
          <span>${tIcon}</span>
          <div style="position: absolute; top: -4px; left: 1px; right: 1px; height: 2px; background: #e2e8f0; border-radius: 1px; overflow: hidden;">
            <div style="width: ${hpPct}%; height: 100%; background: #10b981;"></div>
          </div>
        </div>
      `;
    });

    // 渲染整体沙盘
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 220px; gap: 10px; width: 100%; height: 100%; box-sizing: border-box; align-items: stretch;">
        <!-- 左侧：10x10 网格战场沙盘 -->
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; overflow: hidden; position: relative;">
          <div style="position: relative; width: ${boardWidth}px; height: ${boardHeight}px; border: 1.5px solid #a7f3d0; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.08);">
            ${gridCellsHtml}
            ${buildingsHtml}
            ${troopsHtml}
          </div>
        </div>

        <!-- 右侧：战场战报与 AI 目标监控 -->
        <div style="display: flex; flex-direction: column; gap: 6px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; overflow-y: auto;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
            <span style="font-size: 11px; font-weight: 800; color: #0f172a;">⚔️ 战况结算</span>
            <span style="font-size: 13px; color: #f59e0b;">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 10.5px;">
            <div style="display: flex; justify-content: space-between; color: #475569;">
              <span>摧毁百分比:</span>
              <strong style="color: #ef4444; font-family: monospace; font-size: 12px;">${destructionRate}%</strong>
            </div>
            <div style="display: flex; justify-content: space-between; color: #475569;">
              <span>进攻方存活兵力:</span>
              <strong style="color: #10b981; font-family: monospace;">${troops.filter((t) => t.hp > 0).length} 队</strong>
            </div>
            <div style="display: flex; justify-content: space-between; color: #475569;">
              <span>防守方存活建筑:</span>
              <strong style="color: #2563eb; font-family: monospace;">${buildings.filter((b) => b.type !== 'WALL' && b.hp > 0).length} 座</strong>
            </div>
          </div>

          <div style="border-top: 1px dashed #e2e8f0; margin: 2px 0;"></div>

          <div style="font-size: 10px; font-weight: 700; color: #64748b;">🎯 兵种 AI 寻路透视:</div>
          <div style="display: flex; flex-direction: column; gap: 3px; font-size: 9.5px; color: #334155;">
            ${troops.map((t) => `
              <div style="display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 2px 4px;">
                <span>${t.type === 'GIANT' ? '🛡️ 巨人' : t.type === 'GOBLIN' ? '💰 哥布林' : t.type === 'WALL_BREAKER' ? '💣 炸弹人' : '🪓 野蛮人'}</span>
                <span style="color: ${t.hp > 0 ? '#059669' : '#94a3b8'}; font-weight: 700;">${t.hp > 0 ? (t.status === 'attacking' ? '⚔️ 攻击中' : '🏃 寻路中') : '💀 战死'}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // 更新 Card 2 监控指标
    const root = container.closest('#algo-clash-of-algorithms-view');
    if (root) {
      const rateEl = root.querySelector('#metric-destruction-rate');
      const troopsEl = root.querySelector('#metric-alive-troops');
      const defEl = root.querySelector('#metric-alive-defenses');

      if (rateEl) rateEl.textContent = `${destructionRate}% (${'⭐'.repeat(stars)})`;
      if (troopsEl) troopsEl.textContent = `${troops.filter((t) => t.hp > 0).length} 队`;
      if (defEl) defEl.textContent = `${buildings.filter((b) => b.type !== 'WALL' && b.hp > 0).length} 座`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; color: #334155; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 3px 8px;">
              <span>AI 寻路策略:</span>
              <strong style="font-family: monospace; color: #2563eb; font-size: 12px;">A* 启发式 (权衡步数vs破墙)</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 3px 8px;">
              <span>防御索敌机制:</span>
              <strong style="font-family: monospace; color: #ef4444; font-size: 12px;">欧式距离最近邻锁定</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'clash-of-algorithms',
  name: '部落冲突·战术攻防沙盘',
  viewId: 'algo-clash-of-algorithms-view',
  category: 'game',
  description: '还原《部落冲突》核心玩法：兵种 A* 寻路偏好、开孔引导阵破障权衡与防御塔索敌机制',
  icon: '⚔️',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 1,
  learningGoal: '通过策略游戏直观理解工业级 A* 寻路权重配置、目标过滤剪枝与空间索敌算法',
});

export { Visualizer as ClashOfAlgorithmsVisualizer };
