import { snapshotGrid2D } from '../../../../core/strategies/grid-snapshot';
import { AS_FAR_FROM_LAND_062_LINES } from './graph-062-stage-codes';
import { Graph062StepBase } from './graph-062-shared';

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
  const grid = snapshotGrid2D(g);
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
    grid: snapshotGrid2D(grid),
    curCoord: null,
    distMap: snapshotGrid2D(distMap),
    visited: snapshotGrid2D(visited),
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
      grid: snapshotGrid2D(grid),
      curCoord: null,
      distMap: snapshotGrid2D(distMap),
      visited: snapshotGrid2D(visited),
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
    grid: snapshotGrid2D(grid),
    curCoord: null,
    distMap: snapshotGrid2D(distMap),
    visited: snapshotGrid2D(visited),
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
        grid: snapshotGrid2D(grid),
        curCoord: [r, c],
        distMap: snapshotGrid2D(distMap),
        visited: snapshotGrid2D(visited),
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
            grid: snapshotGrid2D(grid),
            curCoord: [nr, nc],
            distMap: snapshotGrid2D(distMap),
            visited: snapshotGrid2D(visited),
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
    grid: snapshotGrid2D(grid),
    curCoord: null,
    distMap: snapshotGrid2D(distMap),
    visited: snapshotGrid2D(visited),
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
