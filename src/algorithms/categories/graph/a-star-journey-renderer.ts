/**
 * A* 算法网格寻路与启发式搜索 (A* Grid Pathfinding Journey) 声明式可视化器
 * 核心：曼哈顿启发函数 h(x,y)、综合代价 f = g + h、优先队列小根堆定向加速寻路
 * 深度架构重构：严格解释器级全流程逐行高亮执行（初始化网格代价、起点入堆、堆非空循环、poll出堆、已访问continue、终点命中、4向邻接探索松弛、综合代价f计算均发射独立Step）、四语言行号映射
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  A_STAR_JOURNEY_CODE_LANGUAGES,
  A_STAR_JOURNEY_PROBLEM_HTML,
  A_STAR_JOURNEY_ANALYSIS_HTML,
} from './a-star-journey-problem-content';
import { HighlightTarget } from '../../../core/code-panel';

export interface AStarJourneyStep {
  grid: number[][];
  curR: number;
  curC: number;
  openSet: Array<[number, number]>;
  closedSet: Array<[number, number]>;
  path: Array<[number, number]>;
  fScore: Record<string, number>;
  distanceGrid: number[][];
  activeArray?: 'dist' | 'f' | 'open';
  activeSlot?: [number, number];
  status: 'start' | 'search' | 'reach' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export function buildAStarJourneySteps(preset: string = 'classic_3x4'): AStarJourneyStep[] {
  const steps: AStarJourneyStep[] = [];
  const isLine3x3 = preset === 'line_3x3';

  const grid: number[][] = isLine3x3
    ? [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
      ]
    : [
        [1, 1, 1, 1],
        [1, 0, 1, 1],
        [1, 1, 1, 1],
      ];

  const n = grid.length;
  const m = grid[0].length;
  const startX = 0;
  const startY = 0;
  const targetX = n - 1;
  const targetY = m - 1;

  function h(x: number, y: number): number {
    return Math.abs(x - targetX) + Math.abs(y - targetY);
  }

  const distance: number[][] = Array.from({ length: n }, () =>
    new Array(m).fill(Infinity)
  );
  const visited: boolean[][] = Array.from({ length: n }, () =>
    new Array(m).fill(false)
  );
  const parentMap: Record<string, [number, number]> = {};
  const fRecord: Record<string, number> = {};

  const heap: Array<[number, number, number, number]> = [];

  function pushHeap(x: number, y: number, g: number, f: number): void {
    heap.push([x, y, g, f]);
    heap.sort((a, b) => a[3] - b[3]);
  }

  function pollHeap(): [number, number, number, number] {
    return heap.shift()!;
  }

  let curR = startX;
  let curC = startY;
  let curG = 0;
  let curF = h(startX, startY);
  let finalPath: Array<[number, number]> = [];

  // 精准 17 处四语言映射行号字典 (cpp / java / python / javascript)
  const lines = {
    entry: { cpp: 27, java: 10, python: 8, javascript: 2 },
    initCheck: { cpp: 28, java: 11, python: 10, javascript: 3 },
    initDist: { cpp: 30, java: 13, python: 11, javascript: 6 },
    initVisited: { cpp: 31, java: 17, python: 12, javascript: 7 },
    initHeap: { cpp: 33, java: 19, python: 13, javascript: 8 },
    pushSrc: { cpp: 35, java: 20, python: 14, javascript: 9 },
    whileHeap: { cpp: 38, java: 22, python: 18, javascript: 12 },
    pollCur: { cpp: 39, java: 23, python: 19, javascript: 13 },
    checkVisited: { cpp: 43, java: 25, python: 21, javascript: 16 },
    markVisited: { cpp: 44, java: 26, python: 22, javascript: 17 },
    checkTarget: { cpp: 42, java: 27, python: 20, javascript: 15 },
    loopDirs: { cpp: 46, java: 29, python: 24, javascript: 19 },
    checkValidNeighbor: { cpp: 48, java: 31, python: 26, javascript: 21 },
    checkRelax: { cpp: 50, java: 32, python: 27, javascript: 22 },
    updateDist: { cpp: 51, java: 33, python: 28, javascript: 23 },
    pushHeap: { cpp: 52, java: 34, python: 29, javascript: 24 },
    returnFailed: { cpp: 57, java: 39, python: 33, javascript: 28 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'start' | 'search' | 'reach' | 'done',
    activeArray?: 'dist' | 'f' | 'open',
    activeSlot?: [number, number]
  ): void {
    const openSet: Array<[number, number]> = heap.map(([x, y]) => [x, y]);
    const closedSet: Array<[number, number]> = [];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < m; c++) {
        if (visited[r][c]) closedSet.push([r, c]);
      }
    }

    const pathCopy = finalPath.map(([r, c]) => [r, c] as [number, number]);
    const fMapCopy = { ...fRecord };
    const distGridCopy = distance.map((row) => [...row]);

    const coordStr = `(${curR}, ${curC})`;
    const fStr = `f=${curF} (g:${curG} + h:${h(curR, curC)})`;
    const phaseStr =
      status === 'done'
        ? '寻路完毕'
        : status === 'reach'
          ? '终点命中'
          : status === 'search'
            ? '启发式扩展中'
            : '初始化起点';

    steps.push({
      grid: grid.map((r) => [...r]),
      curR,
      curC,
      openSet,
      closedSet,
      path: pathCopy,
      fScore: fMapCopy,
      distanceGrid: distGridCopy,
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-astar-coord': coordStr,
        'metric-astar-f': fStr,
        'metric-open-size': `${openSet.length} 个波前候选`,
        'metric-astar-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, `🚀 [A* 算法启动] aStar(grid, start=(${startX},${startY}), target=(${targetX},${targetY}))：开启网格启发式寻路。`, 'aStar 入口', 'start');

  makeStep(lines.initCheck, '🔎 [起终点通路核验] 检查起点与终点是否畅通无阻。', 'check endpoints', 'start');

  makeStep(lines.initDist, `📊 [初始化距离矩阵] 分配 distance[${n}][${m}] 填充 ∞；记录实际移动代价 g。`, 'init distance[][]', 'start', 'dist');

  makeStep(lines.initVisited, `🏷️ [初始化 ClosedSet] 分配 visited[${n}][${m}] 填充 false；记录已锁定探索节点。`, 'init visited[][]', 'start');

  makeStep(lines.initHeap, '📦 [初始化 OpenSet 小根堆] PriorityQueue 按综合估价值 f = g + h 升序排序。', 'init PriorityQueue', 'start', 'open');

  distance[startX][startY] = 0;
  const startH = h(startX, startY);
  curF = 0 + startH;
  fRecord[`${startX},${startY}`] = curF;
  pushHeap(startX, startY, 0, curF);
  makeStep(lines.pushSrc, `🌱 [起点入堆] distance[0][0]=0, f = g(0) + h(${startH}) = ${curF}；起点加入 OpenSet！`, 'push start', 'start', 'open', [startX, startY]);

  // 2. A* 启发式主循环
  const move = [-1, 0, 1, 0, -1];
  let reached = false;

  while (heap.length > 0) {
    makeStep(lines.whileHeap, `🔁 [检查堆非空] while (!heap.isEmpty()) -> OpenSet 待扩展候选数: ${heap.length}。`, '!heap.isEmpty()', 'search');

    const [x, y, g, f] = pollHeap();
    curR = x;
    curC = y;
    curG = g;
    curF = f;

    makeStep(lines.pollCur, `📤 [弹出综合估价最小格] poll() -> 格子 (${x}, ${y}) [综合 f=${f}, 实际步数 g=${g}, 曼哈顿 h=${h(x, y)}]！`, `poll (${x},${y})`, 'search', 'open', [x, y]);

    makeStep(lines.checkVisited, `🔎 [检查是否已探索] if (visited[${x}][${y}]) -> (${visited[x][y]})。`, `visited[${x}][${y}]?`, 'search');
    if (visited[x][y]) {
      makeStep(lines.checkVisited, `⏭️ [跳过冗余格子] 格子 (${x}, ${y}) 已在 ClosedSet 中锁定，跳过。`, `skip visited (${x},${y})`, 'search');
      continue;
    }

    visited[x][y] = true;
    makeStep(lines.markVisited, `🔒 [加入 ClosedSet] visited[${x}][${y}] = true；锁定到达格子 (${x}, ${y}) 的最短路径！`, `visited[${x}][${y}]=true`, 'search');

    makeStep(lines.checkTarget, `🎯 [终点核验] if (x == ${targetX} && y == ${targetY}) -> (${x === targetX && y === targetY})。`, `target reached?`, 'search');
    if (x === targetX && y === targetY) {
      reached = true;
      let curr: [number, number] | undefined = [targetX, targetY];
      finalPath = [];
      while (curr) {
        finalPath.unshift(curr);
        curr = parentMap[`${curr[0]},${curr[1]}`];
      }
      makeStep(lines.checkTarget, `🏆 [抵达终点目标] 成功找到通往 (${targetX}, ${targetY}) 的最优路径！最短步数 g = ${g}！`, `return g=${g}`, 'reach', 'dist', [x, y]);
      break;
    }

    // 考察 4 个邻接方向
    for (let i = 0; i < 4; i++) {
      const nx = x + move[i];
      const ny = y + move[i + 1];

      makeStep(lines.loopDirs, `  ↳ [考察邻接方向] 方向索引 i=${i} -> 考察邻接格 (${nx}, ${ny})。`, `dir ${i} -> (${nx},${ny})`, 'search');

      const inBound = nx >= 0 && nx < n && ny >= 0 && ny < m;
      const isRoad = inBound && grid[nx][ny] === 1;
      const notVis = inBound && !visited[nx][ny];

      makeStep(lines.checkValidNeighbor, `  🔎 [可行性核验] 是否在界内(${inBound})、为通路(${isRoad})、未访问(${notVis})。`, `valid neighbor?`, 'search');

      if (inBound && isRoad && notVis) {
        makeStep(lines.checkRelax, `  🔎 [松弛检验] if (g + 1 < distance[${nx}][${ny}]) -> (${g + 1} < ${distance[nx][ny] === Infinity ? '∞' : distance[nx][ny]})。`, `check relax (${nx},${ny})`, 'search');

        if (g + 1 < distance[nx][ny]) {
          distance[nx][ny] = g + 1;
          parentMap[`${nx},${ny}`] = [x, y];
          const nextH = h(nx, ny);
          const nextF = g + 1 + nextH;
          fRecord[`${nx},${ny}`] = nextF;
          pushHeap(nx, ny, g + 1, nextF);

          makeStep(lines.updateDist, `  ⚡ [更新到达步数] 发现更优路径！distance[${nx}][${ny}] = ${g + 1}。`, `dist[${nx}][${ny}]=${g + 1}`, 'search', 'dist', [nx, ny]);

          makeStep(lines.pushHeap, `  📥 [启发式入堆] 计算综合估价 f = g(${g + 1}) + h(${nextH}) = ${nextF}；加入 OpenSet！`, `push (${nx},${ny}, f=${nextF})`, 'search', 'open', [nx, ny]);
        }
      }
    }
  }

  if (reached) {
    makeStep(lines.checkTarget, `🎉 [A* 寻路完成] 成功构建最短路径！总共经过 ${finalPath.length} 个格子，启发式引导大幅缩减搜索面积！`, `寻路完成，路径长度 ${finalPath.length}`, 'done');
  } else {
    makeStep(lines.returnFailed, '❌ [无路可达] return -1：所有通路均已尝试但无法连通目标终点。', 'return -1', 'done');
  }

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<AStarJourneyStep>({
  id: 'a-star-journey',
  name: 'A* 算法网格寻路 (A* Grid Pathfinding)',
  viewId: 'algo-a-star-journey-view',
  category: 'graph',
  icon: '🧭',
  badge: {
    mode: '启发式搜索 · f = g + h · 曼哈顿距离',
    complexity: 'O(b^d) 最坏 / 启发式大幅收敛 · O(V)',
  },
  card1Title: '🧭 A* 网格启发式寻路沙盘',
  card2Title: '📊 启发式状态监视器 (gScore, fScore, OpenSet)',
  card2Desc: '展示曼哈顿启发式 h(x,y)、实际移动代价 g(x,y) 与综合估价 f = g + h 的优先队列定向搜索',
  legend: [
    { label: '🚀 起点 / 🏁 终点', color: '#a855f7' },
    { label: '⚡ 当前出堆探索格', color: '#f59e0b' },
    { label: '📥 OpenSet 待探索波前', color: '#38bdf8' },
    { label: '🔒 ClosedSet 已锁定格', color: '#065f46' },
    { label: '🧱 障碍物阻挡格', color: '#334155' },
    { label: '🟢 最优路径轨迹', color: '#10b981' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设网格地图',
      type: 'select',
      defaultValue: 'classic_3x4',
      options: [
        { label: '3x4 经典障碍地图 (中心障碍，绕行最短步数 5)', value: 'classic_3x4' },
        { label: '3x3 对角线绕行地图 (中心障碍，对称双向，最短步数 4)', value: 'line_3x3' },
      ],
    },
  ],
  presets: [
    { label: '3x4 经典障碍', values: { 'input-preset': 'classic_3x4' } },
    { label: '3x3 对称绕行', values: { 'input-preset': 'line_3x3' } },
  ],
  metrics: [
    { id: 'metric-astar-coord', label: '当前考察坐标', color: '#f59e0b' },
    { id: 'metric-astar-f', label: '综合估价值 (f=g+h)', color: '#10b981' },
    { id: 'metric-open-size', label: 'OpenSet 规模', color: '#38bdf8' },
    { id: 'metric-astar-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: A_STAR_JOURNEY_CODE_LANGUAGES,
  problemHtml: A_STAR_JOURNEY_PROBLEM_HTML,
  analysisHtml: A_STAR_JOURNEY_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_3x4') as string;
    return buildAStarJourneySteps(preset);
  },
  renderCanvas: (container, step) => {
    const n = step.grid.length;
    const m = step.grid[0].length;

    const cellW = 55;
    const cellH = 45;
    const padX = 20;
    const padY = 20;

    const isPath = (r: number, c: number) => {
      return step.path.some(([pr, pc]) => pr === r && pc === c);
    };

    const isOpen = (r: number, c: number) => {
      return step.openSet.some(([or, oc]) => or === r && oc === c);
    };

    const isClosed = (r: number, c: number) => {
      return step.closedSet.some(([cr, cc]) => cr === r && cc === c);
    };

    const svgCells: string[] = [];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < m; c++) {
        const x = padX + c * (cellW + 6);
        const y = padY + r * (cellH + 6);

        const isWall = step.grid[r][c] === 0;
        const isCur = step.curR === r && step.curC === c && step.status !== 'done';
        const inPath = isPath(r, c);
        const inOpen = isOpen(r, c);
        const inClosed = isClosed(r, c);
        const isStart = r === 0 && c === 0;
        const isTarget = r === n - 1 && c === m - 1;

        const bg = isWall
          ? '#1e293b'
          : inPath
            ? '#065f46'
            : isCur
              ? '#b45309'
              : inClosed
                ? '#0f766e'
                : inOpen
                  ? '#1e3a8a'
                  : '#0f172a';

        const border = isWall
          ? '#334155'
          : inPath
            ? '#10b981'
            : isCur
              ? '#facc15'
              : inClosed
                ? '#14b8a6'
                : inOpen
                  ? '#38bdf8'
                  : '#334155';

        const label = isStart ? '起点 S' : isTarget ? '终点 T' : isWall ? '障碍 🧱' : `(${r},${c})`;
        const gVal = step.distanceGrid[r][c];
        const gStr = gVal === Infinity ? '∞' : `${gVal}`;
        const fVal = step.fScore[`${r},${c}`];
        const fStr = fVal !== undefined ? `f:${fVal}` : '';

        svgCells.push(`
          <g>
            <rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="6" fill="${bg}" stroke="${border}" stroke-width="${isCur || inPath ? 2.5 : 1.2}" />
            <text x="${x + cellW / 2}" y="${y + 16}" fill="#ffffff" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${label}</text>
            ${!isWall ? `<text x="${x + cellW / 2}" y="${y + 32}" fill="${inPath ? '#34d399' : '#f59e0b'}" font-size="8" font-weight="700" text-anchor="middle">g:${gStr} ${fStr}</text>` : ''}
          </g>
        `);
      }
    }

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; justify-content: flex-start; align-items: stretch; background: #0b0f19; padding: 12px; border-radius: 8px; box-sizing: border-box; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 700;">🧭 A* 启发式网格地图 (${n}x${m})</span>
          <span style="font-size: 11px; color: #e2e8f0; background: #1e293b; padding: 2px 8px; border-radius: 4px; border: 1px solid #334155;">
            当前状态: <b style="color: #10b981;">${step.status === 'done' ? `抵达终点 (路径长 ${step.path.length})` : `探索中 (${step.curR}, ${step.curC})`}</b>
          </span>
        </div>

        <div style="width: 100%; min-height: 180px; background: #0f172a; border-radius: 8px; display: flex; justify-content: center; align-items: center; border: 1px solid #334155;">
          <svg style="width: 100%; height: 180px;" viewBox="0 0 310 180">
            ${svgCells.join('')}
          </svg>
        </div>

        <!-- 底部启发式原理舱 -->
        <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 10px 14px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11.5px; font-weight: 800; color: #cbd5e1;">🧭 A* 启发估价与 Open/ClosedSet 舱</span>
            <div style="font-size: 11px; color: #38bdf8;">
              OpenSet: <b>${step.openSet.length}</b> 个 | ClosedSet: <b>${step.closedSet.length}</b> 个
            </div>
          </div>

          <div style="display: flex; gap: 8px; font-size: 11px;">
            <div style="background: rgba(3, 105, 161, 0.4); border: 1px solid #0284c7; border-radius: 4px; padding: 4px 8px; color: #bae6fd;">
              <b>估价公式:</b> f(n) = g(n) + h(n)
            </div>
            <div style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; border-radius: 4px; padding: 4px 8px; color: #a7f3d0;">
              <b>曼哈顿启发式:</b> h = |x - targetX| + |y - targetY|
            </div>
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const openBadges = step.openSet.length > 0
      ? step.openSet.map(([r, c]) => `<span style="background: #1e3a8a; border: 1px solid #38bdf8; border-radius: 4px; padding: 2px 6px; color: #38bdf8; font-family: monospace; font-size: 10px;">(${r},${c})</span>`).join(' ')
      : '空';

    const pathStr = step.path.length > 0
      ? step.path.map(([r, c]) => `(${r},${c})`).join(' ➔ ')
      : '寻路进行中';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #cbd5e1; padding: 4px 8px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 6px; background: #0f172a; padding: 10px; border-radius: 6px; border: 1px solid #334155;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-family: monospace; font-size: 11px; font-weight: 700; color: #38bdf8;">OpenSet 波前队列:</span>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">${openBadges}</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #334155; padding-top: 4px;">
            <span style="color: #10b981; font-size: 10.5px; font-weight: 700;">路径导航:</span>
            <strong style="color: #10b981; font-family: monospace; font-size: 11px;">${pathStr}</strong>
          </div>
        </div>
      </div>
    `;
  },
});

registerAlgorithm({
  id: 'a-star-journey',
  name: 'A* 算法网格寻路 (A* Grid Pathfinding)',
  viewId: 'algo-a-star-journey-view',
  category: 'graph',
  description: '左程云 Class 065 核心：综合估价函数 f = g + h、曼哈顿距离启发式剪枝、优先队列定向加速寻路 (洛谷 P1379)',
  icon: '🧭',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 27,
  learningGoal: '掌握 A* 启发式搜索的核心设计、f/g/h 估价体系与 Dijkstra 算法的本质异同',
});

export { Visualizer as AStarJourneyVisualizer };
