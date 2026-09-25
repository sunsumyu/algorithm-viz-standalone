/**
 * 左程云算法通关课 Class 062: 地图分析 (As Far from Land as Possible · LeetCode 1162)
 * 多源 BFS 波前同心圆扩散求最大曼哈顿距离
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_062_PROBLEMS } from './graph-062-problem-content';
import {
  AS_FAR_FROM_LAND_062_CODES,
  AS_FAR_FROM_LAND_062_LINES,
} from './graph-062-stage-codes';
import { Graph062StepBase, renderGridSandbox } from './graph-062-shared';

export interface AsFarFromLandStep extends Graph062StepBase {
  grid: number[][];
  curCoord: [number, number] | null;
  distMap: number[][];
  visited: boolean[][];
  currentWave: number;
  queueSnapshot: Array<[number, number]>;
}

export function buildAsFarFromLand062Steps(preset: string = 'classic_3x3'): AsFarFromLandStep[] {
  const steps: AsFarFromLandStep[] = [];
  const lines = AS_FAR_FROM_LAND_062_LINES;

  let g: number[][];
  if (preset === 'corner_land') {
    g = [
      [1, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
  } else if (preset === 'all_sea') {
    g = [
      [0, 0],
      [0, 0],
    ];
  } else {
    // classic_3x3: 四角陆地，中心水域最远 (距离 = 2)
    g = [
      [1, 0, 1],
      [0, 0, 0],
      [1, 0, 1],
    ];
  }

  const n = g.length;
  const grid = g.map((row) => [...row]);
  const distMap = Array.from({ length: n }, () => new Array(n).fill(-1));
  const visited = Array.from({ length: n }, () => new Array(n).fill(false));

  const queue: Array<[number, number]> = [];
  let lands = 0;
  let seas = 0;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] === 1) {
        queue.push([i, j]);
        visited[i][j] = true;
        distMap[i][j] = 0;
        lands++;
      } else {
        seas++;
      }
    }
  }

  // Step 0: 入口与初始化
  steps.push({
    grid: grid.map((r) => [...r]),
    curCoord: null,
    distMap: distMap.map((r) => [...r]),
    visited: visited.map((r) => [...r]),
    currentWave: 0,
    queueSnapshot: queue.map((c) => [...c] as [number, number]),
    decision: '算法启动：识别陆地与海洋格子，构建多源 BFS 初始队列表',
    message: `网格尺寸 ${n}x${n}，统计发现陆地 ${lands} 格，海洋 ${seas} 格。采用多源并发 BFS。`,
    log: `enter maxDistance: lands=${lands}, seas=${seas}`,
    codeLine: lines.entry,
    metrics: { '陆地格数': lands, '海洋格数': seas, '初始波前': 0, '队列规模': queue.length },
    statusBadge: { text: '多源启动', type: 'info' },
  });

  if (lands === 0 || seas === 0) {
    steps.push({
      grid: grid.map((r) => [...r]),
      curCoord: null,
      distMap: distMap.map((r) => [...r]),
      visited: visited.map((r) => [...r]),
      currentWave: -1,
      queueSnapshot: [],
      decision: '特判全陆地或全海洋异常用例',
      message: `网格全为${lands === 0 ? '海洋' : '陆地'}，不存在海洋到陆地的有效距离，直接返回 -1。`,
      log: 'edge case: return -1',
      codeLine: lines.checkAllSeaOrLand,
      metrics: { '全图状态': lands === 0 ? '全海洋' : '全陆地', '计算结果': -1 },
      statusBadge: { text: '无有效距离: -1', type: 'warning' },
    });
    return steps;
  }

  // Step 1: 所有陆地并发入队
  steps.push({
    grid: grid.map((r) => [...r]),
    curCoord: null,
    distMap: distMap.map((r) => [...r]),
    visited: visited.map((r) => [...r]),
    currentWave: 0,
    queueSnapshot: queue.map((c) => [...c] as [number, number]),
    decision: '多源并发：将所有陆地单元格同时作为第 0 层源点入队',
    message: `将 ${queue.length} 个陆地格子全部入队并标记距离为 0，准备同心圆波前向外扩散。`,
    log: `init multi-source queue with ${queue.length} lands`,
    codeLine: lines.initQueue,
    metrics: { '波前层数': 0, '活跃队列': queue.length, '搜索模式': '多源波前' },
    statusBadge: { text: '第 0 层源点就绪', type: 'info' },
  });

  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  let dist = -1;

  while (queue.length > 0) {
    dist++;
    const size = queue.length;

    for (let k = 0; k < size; k++) {
      const cur = queue.shift()!;
      const [r, c] = cur;

      steps.push({
        grid: grid.map((row) => [...row]),
        curCoord: [r, c],
        distMap: distMap.map((row) => [...row]),
        visited: visited.map((row) => [...row]),
        currentWave: dist,
        queueSnapshot: queue.map((coord) => [...coord] as [number, number]),
        decision: `探查当前波前格 (${r}, ${c})，当前到最近陆地距离为 ${dist}`,
        message: `从队列弹出格 (${r}, ${c})，向四周四邻 (上下左右) 进行同心圆波前探测。`,
        log: `pop cell (${r}, ${c}), wave=${dist}`,
        codeLine: lines.pollCell,
        metrics: { '当前单元格': `(${r}, ${c})`, '离陆地距离': dist, '待扩散队列': queue.length },
        statusBadge: { text: `波前扩散: 距离 ${dist}`, type: 'info' },
      });

      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < n && nc >= 0 && nc < n && !visited[nr][nc]) {
          visited[nr][nc] = true;
          grid[nr][nc] = 1; // 染为已到达
          distMap[nr][nc] = dist + 1;
          queue.push([nr, nc]);

          steps.push({
            grid: grid.map((row) => [...row]),
            curCoord: [nr, nc],
            distMap: distMap.map((row) => [...row]),
            visited: visited.map((row) => [...row]),
            currentWave: dist + 1,
            queueSnapshot: queue.map((coord) => [...coord] as [number, number]),
            decision: `波前漫延至海洋格 (${nr}, ${nc})，登记曼哈顿距离为 ${dist + 1}`,
            message: `成功将海洋格 (${nr}, ${nc}) 纳入第 ${dist + 1} 层波前，入队等待下一轮扩散。`,
            log: `expand to sea (${nr}, ${nc}), dist=${dist + 1}`,
            codeLine: lines.expandNeighbor,
            metrics: { '波前新达': `(${nr}, ${nc})`, '登记距离': dist + 1, '队列扩增至': queue.length },
            statusBadge: { text: `标记距离: ${dist + 1}`, type: 'info' },
          });
        }
      }
    }
  }

  // 终态
  steps.push({
    grid: grid.map((row) => [...row]),
    curCoord: null,
    distMap: distMap.map((row) => [...row]),
    visited: visited.map((row) => [...row]),
    currentWave: dist,
    queueSnapshot: [],
    decision: `多源 BFS 搜索完毕：全局离陆地最远海洋格的最大距离为 ${dist}`,
    message: `全部海洋格子已被波前访问完毕，最后被访问的海洋格子与陆地的最短曼哈顿距离为 ${dist}。`,
    log: `BFS complete -> maxDistance=${dist}`,
    codeLine: lines.returnDist,
    metrics: { '离陆地最远距离': dist, '网格覆盖率': '100%', '时间复杂度': 'O(N²)' },
    statusBadge: { text: `最大距离: ${dist}`, type: 'success' },
  });

  return steps;
}

export const asFarFromLand062Visualizer = registerDeclarativeAlgorithm<AsFarFromLandStep>({
  id: 'as-far-from-land-062',
  aliases: ['as-far-from-land', 'map-analysis-1162'],
  name: '地图分析与多源广搜 (Class 062)',
  category: 'graph',
  icon: '🗺️',
  difficulty: 2,
  levelOrder: 6201,
  learningGoal: '掌握多源 BFS 逆向思维：将所有陆地并发入队，通过波前扩散在 O(N²) 线性时间内求解全局最大最短距离',
  problemHtml: GRAPH_062_PROBLEMS.asFarFromLand062.html,
  codeLanguages: AS_FAR_FROM_LAND_062_CODES,
  inputs: [
    {
      id: 'preset',
      label: '地形用例选择',
      type: 'select',
      defaultValue: 'classic_3x3',
      options: [
        { label: '3x3 四角陆地中心水域 (距离=2)', value: 'classic_3x3' },
        { label: '3x3 左上角单点陆地 (距离=4)', value: 'corner_land' },
        { label: '2x2 全海洋特判用例 (-1)', value: 'all_sea' },
      ],
    },
  ],
  presets: [
    { label: '3x3 四角陆地中心水域 (经典)', values: { preset: 'classic_3x3' } },
    { label: '3x3 单角陆地扩散', values: { preset: 'corner_land' } },
    { label: '全海洋特判用例', values: { preset: 'all_sea' } },
  ],
  generateSteps: (inputs) => buildAsFarFromLand062Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    const customBg = (r: number, c: number) => {
      const isCur = step.curCoord && step.curCoord[0] === r && step.curCoord[1] === c;
      if (isCur) return '#fef3c7'; // 高亮当前
      const d = step.distMap[r][c];
      if (d === 0) return '#dcfce7'; // 初始陆地 (绿色)
      if (d > 0) {
        // 海洋距离渐变色
        return d === 1 ? '#e0f2fe' : d === 2 ? '#bae6fd' : d === 3 ? '#7dd3fc' : '#38bdf8';
      }
      return '#f1f5f9'; // 未访问海洋 (灰色)
    };

    const customText = (r: number, c: number) => {
      const d = step.distMap[r][c];
      if (d === 0) return '🏝️ 陆';
      if (d > 0) return `🌊 ${d}`;
      return '🌊 海';
    };

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px;">
        ${renderGridSandbox(step.grid, step.curCoord, step.visited, {
          customBg,
          customText,
        })}
      </div>
    `;
  },
});
