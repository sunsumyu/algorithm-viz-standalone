/**
 * 水位上升的泳池中游泳 (Swim In Rising Water - LeetCode 778) 声明式可视化器
 * 左程云《算法通关课》Class 064 Code03
 * 核心：网格图瓶颈最短路、max(dis, grid[nx][ny]) 松弛、Dijkstra 小根堆定向淹没
 * 深度架构重构：严格解释器级全流程逐行高亮执行（初始化网格、起点入堆、堆非空循环、poll出队、已访问continue、终点命中、4向邻接探索松弛、瓶颈方程计算均发射独立Step）、四语言行号映射
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  SWIM_IN_RISING_WATER_CODE_LANGUAGES,
  SWIM_IN_RISING_WATER_PROBLEM_HTML,
  SWIM_IN_RISING_WATER_ANALYSIS_HTML,
} from './swim-in-rising-water-problem-content';
import { HighlightTarget } from '../../../core/code-panel';

export interface SwimStep {
  grid: number[][];
  r: number;
  c: number;
  curWaterLevel: number;
  distGrid: number[][];
  visitedGrid: boolean[][];
  pqSnapshot: Array<{ r: number; c: number; t: number }>;
  bestPath?: Array<{ r: number; c: number }>;
  status: 'init' | 'pop' | 'relax' | 'reach' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

const PRESET_GRIDS: Record<string, number[][]> = {
  leetcode5: [
    [0, 2, 1, 3, 4],
    [10, 11, 14, 12, 5],
    [23, 22, 21, 15, 16],
    [18, 17, 19, 20, 24],
    [9, 8, 7, 6, 13],
  ],
  simple3: [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
  ],
  cliff4: [
    [0, 3, 2, 1],
    [12, 13, 14, 4],
    [11, 15, 10, 5],
    [9, 8, 7, 6],
  ],
};

export function buildSwimInRisingWaterSteps(gridType: string = 'leetcode5'): SwimStep[] {
  const grid = PRESET_GRIDS[gridType] || PRESET_GRIDS.leetcode5;
  const n = grid.length;
  const m = grid[0].length;
  const steps: SwimStep[] = [];

  const dist: number[][] = Array.from({ length: n }, () => Array(m).fill(Infinity));
  const visited: boolean[][] = Array.from({ length: n }, () => Array(m).fill(false));
  const parent: Record<string, { r: number; c: number }> = {};

  let curR = 0;
  let curC = 0;
  let curWaterLevel = grid[0][0];
  let finalPath: Array<{ r: number; c: number }> | undefined = undefined;

  const pq: Array<{ r: number; c: number; t: number }> = [];

  // 精准 18 处四语言映射行号字典 (cpp / java / python / javascript)
  const lines = {
    entry: { cpp: 15, java: 18, python: 4, javascript: 2 },
    initDist: { cpp: 17, java: 21, python: 6, javascript: 4 },
    initDistSrc: { cpp: 21, java: 27, python: 9, javascript: 9 },
    initVisited: { cpp: 18, java: 28, python: 7, javascript: 5 },
    initHeap: { cpp: 19, java: 30, python: 10, javascript: 8 },
    pushSrc: { cpp: 22, java: 31, python: 10, javascript: 8 },
    whileHeap: { cpp: 25, java: 34, python: 13, javascript: 12 },
    pollRecord: { cpp: 26, java: 35, python: 14, javascript: 14 },
    checkVisited: { cpp: 27, java: 40, python: 15, javascript: 15 },
    continueVisited: { cpp: 27, java: 41, python: 16, javascript: 15 },
    markVisited: { cpp: 28, java: 43, python: 17, javascript: 16 },
    checkTarget: { cpp: 29, java: 44, python: 18, javascript: 17 },
    returnCost: { cpp: 29, java: 45, python: 19, javascript: 17 },
    forDirs: { cpp: 31, java: 48, python: 21, javascript: 19 },
    checkValidNeighbor: { cpp: 33, java: 51, python: 23, javascript: 21 },
    calcBottleneck: { cpp: 34, java: 53, python: 24, javascript: 22 },
    checkRelax: { cpp: 35, java: 54, python: 25, javascript: 23 },
    updateDist: { cpp: 36, java: 55, python: 26, javascript: 24 },
    pushHeap: { cpp: 37, java: 56, python: 27, javascript: 25 },
    returnFail: { cpp: 42, java: 61, python: 28, javascript: 30 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'init' | 'pop' | 'relax' | 'reach' | 'done',
    r: number = curR,
    c: number = curC,
    t: number = curWaterLevel
  ): void {
    const pqSnap = pq.map((item) => ({ ...item }));
    const distSnap = dist.map((row) => [...row]);
    const visSnap = visited.map((row) => [...row]);
    const pathSnap = finalPath ? finalPath.map((p) => ({ ...p })) : undefined;

    steps.push({
      grid,
      r,
      c,
      curWaterLevel: t,
      distGrid: distSnap,
      visitedGrid: visSnap,
      pqSnapshot: pqSnap,
      bestPath: pathSnap,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-cur-time': `${t}`,
        'metric-cur-pos': `(${r}, ${c})`,
        'metric-pq-size': `${pq.length} 个候选`,
        'metric-swim-phase': status === 'done' ? '搜索完成' : status === 'reach' ? '抵达终点' : status === 'relax' ? '松弛邻格' : status === 'pop' ? '出堆探索' : '初始化',
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, `🚀 [算法初始化] swimInWater(grid ${n}x${m})：开启水位上升瓶颈最短路寻路。`, 'swimInWater 入口', 'init');

  makeStep(lines.initDist, `📊 [初始化距离矩阵] 分配 distance[${n}][${m}] 填充 ∞；记录到达各格子所需最小水位。`, 'init distance[][]', 'init');

  dist[0][0] = grid[0][0];
  makeStep(lines.initDistSrc, `🌱 [起点水位初始化] distance[0][0] = grid[0][0] = ${grid[0][0]}；从起点平台高度开始起算。`, `dist[0][0]=${grid[0][0]}`, 'init');

  makeStep(lines.initVisited, `🏷️ [初始化访问标记] boolean[][] visited 记录已最终确定水位的锁定方格。`, 'init visited[][]', 'init');

  makeStep(lines.initHeap, '📦 [初始化小根堆] PriorityQueue 按到达所需最少水位 t 升序排序。', 'init PriorityQueue', 'init');

  pq.push({ r: 0, c: 0, t: grid[0][0] });
  makeStep(lines.pushSrc, `📥 [起点入堆] heap.add([0, 0, ${grid[0][0]}])；起点加入 Dijkstra 前沿！`, `push (0,0,${grid[0][0]})`, 'init', 0, 0, grid[0][0]);

  const dr = [-1, 0, 1, 0];
  const dc = [0, 1, 0, -1];
  let foundTarget = false;

  while (pq.length > 0) {
    makeStep(lines.whileHeap, `🔁 [检查堆非空] while (!heap.isEmpty()) -> 小根堆待选候选数: ${pq.length}。`, '!heap.isEmpty()', 'pop');

    pq.sort((a, b) => a.t - b.t);
    const top = pq.shift()!;
    const { r, c, t } = top;
    curR = r;
    curC = c;
    curWaterLevel = t;

    makeStep(lines.pollRecord, `📤 [弹出最少水位平台] poll() -> (${r}, ${c}) [平台高度 ${grid[r][c]}, 所需最少水位 t=${t}]！`, `poll (${r},${c},t=${t})`, 'pop', r, c, t);

    makeStep(lines.checkVisited, `🔎 [检查是否已探索] if (visited[${r}][${c}]) -> (${visited[r][c]})。`, `visited[${r}][${c}]?`, 'pop', r, c, t);
    if (visited[r][c]) {
      makeStep(lines.continueVisited, `⏭️ [跳过冗余平台] 平台 (${r}, ${c}) 之前已被更低水位锁定，跳过。`, `skip visited (${r},${c})`, 'pop', r, c, t);
      continue;
    }

    visited[r][c] = true;
    makeStep(lines.markVisited, `🔒 [锁定水位状态] visited[${r}][${c}] = true；到达 (${r}, ${c}) 瓶颈水位固定为 ${t}！`, `visited[${r}][${c}]=true`, 'pop', r, c, t);

    makeStep(lines.checkTarget, `🎯 [终点核验] if (r == ${n - 1} && c == ${m - 1}) -> (${r === n - 1 && c === m - 1})。`, 'check target', 'pop', r, c, t);
    if (r === n - 1 && c === m - 1) {
      foundTarget = true;
      const bestPath: Array<{ r: number; c: number }> = [];
      let curr: { r: number; c: number } | undefined = { r, c };
      while (curr) {
        bestPath.push(curr);
        if (curr.r === 0 && curr.c === 0) break;
        curr = parent[`${curr.r},${curr.c}`];
      }
      bestPath.reverse();
      finalPath = bestPath;

      makeStep(lines.returnCost, `🏆 [抵达终点目标] return cost = ${t}！首次弹出右下角，全局瓶颈最小等待时间锁定为 ${t}！`, `return ${t}`, 'reach', r, c, t);
      break;
    }

    // 探索四周 4 个邻接平台
    for (let i = 0; i < 4; ++i) {
      const nr = r + dr[i];
      const nc = c + dc[i];

      makeStep(lines.forDirs, `  ↳ [考察出边] 考察方向 ${i} -> 邻接平台 (${nr}, ${nc})。`, `dir ${i} -> (${nr},${nc})`, 'relax', r, c, t);

      const inBound = nr >= 0 && nr < n && nc >= 0 && nc < m;
      const notVis = inBound && !visited[nr][nc];

      makeStep(lines.checkValidNeighbor, `  🔎 [界内与未访问核验] 界内(${inBound})、未访问(${notVis})。`, `valid (${nr},${nc})?`, 'relax', r, c, t);

      if (inBound && notVis) {
        const nextTime = Math.max(t, grid[nr][nc]);
        makeStep(lines.calcBottleneck, `  🌊 [瓶颈方程计算] ncCost = Math.max(${t}, grid[${nr}][${nc}]=${grid[nr][nc]}) = ${nextTime}。`, `max(${t},${grid[nr][nc]})=${nextTime}`, 'relax', r, c, t);

        makeStep(lines.checkRelax, `  🔎 [松弛检验] if (${nextTime} < distance[${nr}][${nc}]=${dist[nr][nc] === Infinity ? '∞' : dist[nr][nc]})。`, `check relax (${nr},${nc})`, 'relax', r, c, t);

        if (nextTime < dist[nr][nc]) {
          dist[nr][nc] = nextTime;
          parent[`${nr},${nc}`] = { r, c };
          pq.push({ r: nr, c: nc, t: nextTime });

          makeStep(lines.updateDist, `  ⚡ [更新最短水位] distance[${nr}][${nc}] = ${nextTime}。`, `dist[${nr}][${nc}]=${nextTime}`, 'relax', nr, nc, nextTime);

          makeStep(lines.pushHeap, `  📥 [候选入堆] heap.add([${nr}, ${nc}, ${nextTime}])；加入优先队列！`, `push (${nr},${nc},${nextTime})`, 'relax', nr, nc, nextTime);
        }
      }
    }
  }

  if (foundTarget) {
    makeStep(lines.returnCost, `🎉 [寻路完成] 成功构建瓶颈最短路！最少等待时间 t = ${curWaterLevel}，路径长度 ${finalPath?.length} 步！`, `完成: t=${curWaterLevel}`, 'done');
  } else {
    makeStep(lines.returnFail, '❌ [无路可达] return -1：无法连通终点。', 'return -1', 'done');
  }

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<SwimStep>({
  id: 'swim-in-rising-water',
  name: '水位上升的泳池中游泳',
  category: 'graph',
  icon: '🏊',
  badge: {
    mode: 'Dijkstra 小根堆瓶颈最短路',
    complexity: 'O(N² log N) · O(N²)',
  },
  card1Title: '🏊 泳池高程网格与动态淹没沙盘',
  card2Title: '🧭 水位与优先队列状态监视器',
  card2Desc: '当前探索平台、淹没水位 t 与 Dijkstra 小根堆前沿',
  legend: [
    { label: '未淹没平台', color: '#1e293b' },
    { label: '🌊 已淹没水面', color: '#0369a1' },
    { label: '🏊 当前探索节点', color: '#facc15' },
    { label: '🟢 最优瓶颈路径', color: '#10b981' },
  ],
  inputs: [
    {
      id: 'input-grid-type',
      label: '矩阵用例',
      type: 'select',
      defaultValue: 'leetcode5',
      options: [
        { label: '经典 5x5 (LeetCode 778)', value: 'leetcode5' },
        { label: '基础 3x3 (阶梯高度)', value: 'simple3' },
        { label: '断崖 4x4 (中央高墙)', value: 'cliff4' },
      ],
      width: '160px',
    },
  ],
  presets: [
    { label: '经典 5x5 (ans=20)', values: { 'input-grid-type': 'leetcode5' } },
    { label: '基础 3x3 (ans=8)', values: { 'input-grid-type': 'simple3' } },
    { label: '断崖 4x4 (ans=15)', values: { 'input-grid-type': 'cliff4' } },
  ],
  metrics: [
    { id: 'metric-cur-time', label: '当前水位 t', color: '#2563eb' },
    { id: 'metric-cur-pos', label: '当前探索坐标', color: '#0d9488' },
    { id: 'metric-pq-size', label: '小根堆待选数', color: '#d97706' },
    { id: 'metric-swim-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: SWIM_IN_RISING_WATER_CODE_LANGUAGES,
  problemHtml: SWIM_IN_RISING_WATER_PROBLEM_HTML,
  analysisHtml: SWIM_IN_RISING_WATER_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const gridType = (inputs['input-grid-type'] || 'leetcode5') as string;
    return buildSwimInRisingWaterSteps(gridType);
  },
  renderCanvas: (container, step) => {
    const grid = step.grid;
    const n = grid.length;
    const m = grid[0].length;

    const cellSize = n <= 3 ? 56 : n <= 4 ? 46 : 38;
    let gridHtml = '';

    for (let r = 0; r < n; r++) {
      gridHtml += '<div style="display: flex; gap: 4px; justify-content: center;">';
      for (let c = 0; c < m; c++) {
        const val = grid[r][c];
        const isVisited = step.visitedGrid[r]?.[c] ?? false;
        const isCur = step.r === r && step.c === c;
        const isSubmerged = val <= step.curWaterLevel;
        const isPath = step.bestPath?.some((p) => p.r === r && p.c === c) ?? false;

        let bg = '#1e293b';
        let border = '#334155';
        let textColor = '#ffffff';

        if (isPath) {
          bg = '#065f46';
          border = '#10b981';
        } else if (isCur) {
          bg = '#854d0e';
          border = '#facc15';
        } else if (isVisited) {
          bg = '#1e3a8a';
          border = '#38bdf8';
        } else if (isSubmerged) {
          bg = '#0369a1';
          border = '#38bdf8';
        }

        const tag = r === 0 && c === 0 ? '<span style="font-size: 7.5px; color: #fde047; position: absolute; top: 2px;">START</span>' : r === n - 1 && c === m - 1 ? '<span style="font-size: 7.5px; color: #34d399; position: absolute; top: 2px;">END</span>' : '';

        gridHtml += `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; width: ${cellSize}px; height: ${cellSize}px; background: ${bg}; border: ${isCur || isPath ? '2.5px' : '1.5px'} solid ${border}; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); transition: all 0.2s;">
            ${tag}
            <span style="font-size: ${cellSize > 40 ? '14px' : '12px'}; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: ${textColor};">${val}</span>
            ${isSubmerged ? '<span style="font-size: 8px; color: #7dd3fc; margin-top: -2px;">🌊</span>' : ''}
          </div>
        `;
      }
      gridHtml += '</div>';
    }

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; justify-content: flex-start; align-items: stretch; background: #f8fafc; padding: 12px; border-radius: 8px; box-sizing: border-box; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
          <span style="font-size: 12px; color: #374151; font-weight: 700;">🏊 泳池高程网格与淹没水面 (${n}x${m})</span>
          <span style="font-size: 11px; color: #1e293b; background: #eff6ff; padding: 2px 8px; border-radius: 4px; border: 1px solid #e2e8f0;">
            当前探索: <b style="color: #f59e0b;">(${step.r}, ${step.c})</b> | 水位: <b style="color: #38bdf8;">t = ${step.curWaterLevel}</b>
          </span>
        </div>

        <div style="width: 100%; min-height: 200px; background: #0f172a; border-radius: 8px; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 1px solid #334155; padding: 12px; box-sizing: border-box; gap: 4px;">
          ${gridHtml}
        </div>

        <!-- 底部瓶颈转移舱 -->
        <div style="background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11.5px; font-weight: 800; color: #374151;">🌊 瓶颈最短路松弛转移舱</span>
            <div style="font-size: 11px; color: #38bdf8;">
              转移方程: <b>ncCost = max(cost, grid[nr][nc])</b>
            </div>
          </div>

          <div style="display: flex; gap: 8px; font-size: 11px;">
            <div style="background: rgba(3, 105, 161, 0.4); border: 1px solid #0284c7; border-radius: 4px; padding: 4px 8px; color: #bae6fd;">
              <b>小根堆前沿规模:</b> ${step.pqSnapshot.length} 个候选平台
            </div>
            <div style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; border-radius: 4px; padding: 4px 8px; color: #a7f3d0;">
              <b>最优性保证:</b> 首次弹出右下角平台必定为全局最小瓶颈
            </div>
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const top3 = step.pqSnapshot.slice(0, 4);
    const top3Html = top3.length > 0
      ? top3.map((it, idx) => `<span style="background: #1e3a8a; border: 1px solid #38bdf8; padding: 2px 6px; border-radius: 4px; font-size: 10.5px; color: #bae6fd; font-family: monospace;">#${idx + 1}: (${it.r},${it.c}) t=${it.t}</span>`).join(' ')
      : '<span style="color: #64748b; font-size: 10.5px;">队列为空</span>';

    const pathStr = step.bestPath && step.bestPath.length > 0
      ? step.bestPath.map((p) => `(${p.r},${p.c})`).join(' ➔ ')
      : '寻路进行中';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #374151; padding: 4px 8px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 6px; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-family: monospace; font-size: 11px; font-weight: 700; color: #38bdf8;">小根堆前沿 Top4:</span>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">${top3Html}</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
            <span style="color: #10b981; font-size: 10.5px; font-weight: 700;">最优瓶颈路径:</span>
            <strong style="color: #10b981; font-family: monospace; font-size: 11px;">${pathStr}</strong>
          </div>
        </div>
      </div>
    `;
  },
});

registerAlgorithm({
  id: 'swim-in-rising-water',
  name: '水位上升的泳池中游泳',
  viewId: 'algo-swim-in-rising-water-view',
  icon: '🏊',
  category: 'graph',
  description: '左程云算法通关课 Class 064 Code03：网格图瓶颈最短路、max(t, grid[nr][nc]) 松弛、Dijkstra 小根堆 (LeetCode 778)',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 76,
  learningGoal: '掌握瓶颈最短路模型转化、网格图 Dijkstra 小根堆松弛技巧与二分+BFS/并查集等价判定',
});

export { Visualizer as SwimInRisingWaterVisualizer };
