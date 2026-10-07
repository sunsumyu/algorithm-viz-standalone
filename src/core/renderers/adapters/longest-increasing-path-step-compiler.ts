/**
 * 矩阵中的最长递增路径 (LeetCode 329) 步骤编译器深模块 (LongestIncreasingPathStepCompiler)
 * 遵循 Matt Pocock 深模块哲学与严格一行一步代码行号联动规范
 */

import { captureScope } from '../../strategies/scope-capture';
import { snapshotGrid2D } from '../../strategies/grid-snapshot';
import { parseGridInput } from '../../input-primitives';
import {
  getDp067Anchor,
  type ResolvedLineTarget,
} from '../../../algorithms/categories/dynamic-programming/dp-067/dp-067-stage-codes';
import { DpCellDep } from '../../../algorithms/categories/dynamic-programming/dp-067/dp-067-shared';

export { type ResolvedLineTarget, type DpCellDep };

export function parseMatrix(raw: unknown): number[][] {
  return parseGridInput(raw, [
    [9, 9, 4],
    [6, 6, 8],
    [2, 1, 1],
  ]);
}

function createLipStepsArray<T extends { scope?: Record<string, any> }>(
  extractScope?: (item: T) => Record<string, any>
): [T[], T[]] {
  const rawSteps: T[] = [];
  const steps: T[] = new Proxy(rawSteps, {
    get(target, prop, receiver) {
      if (prop === 'push') {
        return (...items: T[]) => {
          for (const item of items) {
            if (!item.scope) {
              const baseVars = extractScope ? extractScope(item) : {};
              item.scope = captureScope({
                ...baseVars,
                ...item,
              });
            }
          }
          return target.push(...items);
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  });
  return [steps, rawSteps];
}

// ==========================================
// 1. Stage 1: 暴力四向 DFS
// ==========================================

export interface LipRecStep {
  currentCall: string;
  i: number;
  j: number;
  matrix: number[][];
  callStack: Array<{ label: string }>;
  decision: string;
  message: string;
  log: string;
  codeLine: ResolvedLineTarget;
  metrics?: Record<string, any>;
  scope?: Record<string, any>;
}

export function buildLipStage1Steps(inputs: Record<string, any>): LipRecStep[] {
  const matrix = parseMatrix(inputs?.['input-matrix']);
  const m = matrix.length;
  const n = matrix[0].length;
  const [steps, rawSteps] = createLipStepsArray<LipRecStep>((item) => ({
    val: item.matrix?.[item.i]?.[item.j],
  }));
  const stack: Array<{ label: string }> = [];

  const lines = {
    entry: getDp067Anchor(1, 'longest-increasing-path', 'entry'),
    enter: getDp067Anchor(1, 'longest-increasing-path', 'enter'),
    dirsLoop: getDp067Anchor(1, 'longest-increasing-path', 'dirsLoop'),
    returnAns: getDp067Anchor(1, 'longest-increasing-path', 'returnAns'),
  };

  steps.push({
    currentCall: `dfs(entry): longestIncreasingPath1(matrix)`,
    i: 0,
    j: 0,
    matrix,
    callStack: [],
    decision: `主函数入口：求解 ${m}×${n} 矩阵的最长递增路径`,
    message: `遍历矩阵中的每个坐标作为起点开展四向 DFS 探索`,
    log: `enter longestIncreasingPath1`,
    codeLine: lines.entry,
    metrics: { 'metric-pos': `矩阵 ${m}×${n}`, 'metric-val': '入口' },
  });

  function dfs(i: number, j: number): number {
    stack.push({ label: `dfs(${i}, ${j})[val=${matrix[i][j]}]` });
    steps.push({
      currentCall: `dfs(${i}, ${j})`,
      i,
      j,
      matrix,
      callStack: [...stack],
      decision: `探查坐标 (${i}, ${j})，高度数值 = ${matrix[i][j]}`,
      message: `向四方寻找严格大于 ${matrix[i][j]} 的相邻单元格`,
      log: `dfs(${i}, ${j})`,
      codeLine: lines.enter,
      metrics: { 'metric-pos': `(${i}, ${j})`, 'metric-val': `${matrix[i][j]}` },
    });

    let maxSub = 0;
    const dirs = [
      [-1, 0],
      [0, 1],
      [1, 0],
      [0, -1],
    ];

    for (const [di, dj] of dirs) {
      const ni = i + di;
      const nj = j + dj;
      if (ni >= 0 && ni < m && nj >= 0 && nj < n && matrix[ni][nj] > matrix[i][j]) {
        steps.push({
          currentCall: `dfs(${i}, ${j})`,
          i,
          j,
          matrix,
          callStack: [...stack],
          decision: `发现更高相邻格 (${ni}, ${nj}) 值 ${matrix[ni][nj]} > ${matrix[i][j]}，严格递增推进`,
          message: `深入递归探查更高的单元格`,
          log: `advance (${ni}, ${nj})`,
          codeLine: lines.dirsLoop,
          metrics: { 'metric-pos': `(${i}, ${j}) -> (${ni}, ${nj})` },
        });

        const subLen = dfs(ni, nj);
        maxSub = Math.max(maxSub, subLen);
      }
    }

    const ans = 1 + maxSub;
    steps.push({
      currentCall: `dfs(${i}, ${j})`,
      i,
      j,
      matrix,
      callStack: [...stack],
      decision: `坐标 (${i}, ${j}) 探查结束，以自身为起点的最长递增路径长度 = ${ans}`,
      message: `1 (当前格自身) + 后续最大延伸 ${maxSub} = ${ans}`,
      log: `return dfs(${i}, ${j}) = ${ans}`,
      codeLine: lines.returnAns,
      metrics: { 'metric-pos': `(${i}, ${j})`, 'metric-ans': `${ans}` },
    });

    stack.pop();
    return ans;
  }

  // 演示从最小值或起点开始的探索
  let startI = 0;
  let startJ = 0;
  let minVal = Infinity;
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (matrix[r][c] < minVal) {
        minVal = matrix[r][c];
        startI = r;
        startJ = c;
      }
    }
  }

  dfs(startI, startJ);
  return rawSteps;
}

// ==========================================
// 2. Stage 2: 记忆化搜索
// ==========================================

export interface LipMemoStep {
  currentCall: string;
  i: number;
  j: number;
  memoHit: boolean;
  hitCount: number;
  missCount: number;
  decision: string;
  message: string;
  log: string;
  codeLine: ResolvedLineTarget;
  memoGrid: number[][];
  cachedVal?: number;
  matrix: number[][];
  metrics?: Record<string, any>;
  scope?: Record<string, any>;
}

export function buildLipStage2Steps(inputs: Record<string, any>): LipMemoStep[] {
  const lines2 = {
    entry: getDp067Anchor(2, 'longest-increasing-path', 'entry'),
    checkMemo: getDp067Anchor(2, 'longest-increasing-path', 'checkMemo'),
    missExpand: getDp067Anchor(2, 'longest-increasing-path', 'missExpand'),
    memoStore: getDp067Anchor(2, 'longest-increasing-path', 'memoStore'),
  };
  const matrix = parseMatrix(inputs?.['input-matrix']);
  const m = matrix.length;
  const n = matrix[0].length;
  const [steps, rawSteps] = createLipStepsArray<LipMemoStep>((item) => ({
    val: item.matrix?.[item.i]?.[item.j],
    memoVal: item.memoGrid?.[item.i]?.[item.j],
  }));
  const dp: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
  let hitCount = 0;
  let missCount = 0;

  steps.push({
    currentCall: `longestIncreasingPath2(matrix)`,
    i: 0,
    j: 0,
    memoHit: false,
    hitCount: 0,
    missCount: 0,
    decision: `主函数入口：初始化 ${m}×${n} 记忆化备忘录 dp`,
    message: `以 dp[i][j] 缓存由 (i, j) 出发的最长递增步数`,
    log: `enter longestIncreasingPath2`,
    codeLine: lines2.entry,
    memoGrid: snapshotGrid2D(dp),
    matrix,
    metrics: { 'metric-status': '函数入口', 'metric-hits': '0' },
  });

  function dfsMemo(i: number, j: number): number {
    if (dp[i][j] !== 0) {
      hitCount++;
      steps.push({
        currentCall: `dfsMemo(${i}, ${j})`,
        i,
        j,
        memoHit: true,
        hitCount,
        missCount,
        cachedVal: dp[i][j],
        decision: `🎯 命中备忘录: dp[${i}][${j}] = ${dp[i][j]}`,
        message: `坐标 (${i}, ${j}) 曾被探查过，直接复用其作为起点的最长延伸步数！`,
        log: `hit dp[${i}][${j}] = ${dp[i][j]}`,
        codeLine: lines2.checkMemo,
        memoGrid: snapshotGrid2D(dp),
        matrix,
        metrics: { 'metric-status': '命中剪枝', 'metric-hits': `${hitCount}` },
      });
      return dp[i][j];
    }

    missCount++;
    steps.push({
      currentCall: `dfsMemo(${i}, ${j})`,
      i,
      j,
      memoHit: false,
      hitCount,
      missCount,
      decision: `⚠️ 未命中备忘录: 首次探查 (${i}, ${j})[值=${matrix[i][j]}]`,
      message: `向四方寻找严格更高格位展开搜索`,
      log: `miss dp[${i}][${j}]`,
      codeLine: lines2.missExpand,
      memoGrid: snapshotGrid2D(dp),
      matrix,
      metrics: { 'metric-status': '展开探索', 'metric-misses': `${missCount}` },
    });

    let maxSub = 0;
    const dirs = [
      [-1, 0],
      [0, 1],
      [1, 0],
      [0, -1],
    ];
    for (const [di, dj] of dirs) {
      const ni = i + di;
      const nj = j + dj;
      if (ni >= 0 && ni < m && nj >= 0 && nj < n && matrix[ni][nj] > matrix[i][j]) {
        maxSub = Math.max(maxSub, dfsMemo(ni, nj));
      }
    }

    dp[i][j] = 1 + maxSub;
    steps.push({
      currentCall: `dfsMemo(${i}, ${j})`,
      i,
      j,
      memoHit: false,
      hitCount,
      missCount,
      cachedVal: dp[i][j],
      decision: `💾 计算完成存入备忘录: dp[${i}][${j}] = ${dp[i][j]}`,
      message: `以 (${i}, ${j}) 为起点的最长递增路径长度 ${dp[i][j]} 写入 memo`,
      log: `store dp[${i}][${j}] = ${dp[i][j]}`,
      codeLine: lines2.memoStore,
      memoGrid: snapshotGrid2D(dp),
      matrix,
      metrics: { 'metric-status': '写入备忘录', 'metric-val': `${dp[i][j]}` },
    });

    return dp[i][j];
  }

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      dfsMemo(r, c);
    }
  }

  return rawSteps;
}

// ==========================================
// 3. Stage 3: 严格值排序拓扑序 DP
// ==========================================

export interface Lip2DStep {
  curI: number;
  curJ: number;
  currentCell: string;
  currentVal: number;
  dpTable: number[][];
  depCells: DpCellDep[];
  decision: string;
  message: string;
  log: string;
  codeLine: ResolvedLineTarget;
  matrix: number[][];
  metrics?: Record<string, any>;
  scope?: Record<string, any>;
}

export function buildLipStage3Steps(inputs: Record<string, any>): Lip2DStep[] {
  const matrix = parseMatrix(inputs?.['input-matrix']);
  const m = matrix.length;
  const n = matrix[0].length;
  const [steps, rawSteps] = createLipStepsArray<Lip2DStep>((item) => ({
    matrixVal: item.matrix?.[item.curI]?.[item.curJ],
    dpVal: item.dpTable?.[item.curI]?.[item.curJ],
  }));
  const dp: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
  const outdegree: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));

  const lines3 = {
    entry: getDp067Anchor(3, 'longest-increasing-path', 'entry'),
    initOut: getDp067Anchor(3, 'longest-increasing-path', 'initOut'),
    calcOut: getDp067Anchor(3, 'longest-increasing-path', 'calcOut'),
    initQueue: getDp067Anchor(3, 'longest-increasing-path', 'initQueue'),
    whileQueue: getDp067Anchor(3, 'longest-increasing-path', 'whileQueue'),
    incLevel: getDp067Anchor(3, 'longest-increasing-path', 'incLevel'),
    pollNode: getDp067Anchor(3, 'longest-increasing-path', 'pollNode'),
    relaxNeighbor: getDp067Anchor(3, 'longest-increasing-path', 'relaxNeighbor'),
    returnLevel: getDp067Anchor(3, 'longest-increasing-path', 'returnLevel'),
  };

  steps.push({
    curI: 0,
    curJ: 0,
    currentCell: '入口初始化',
    currentVal: 0,
    dpTable: snapshotGrid2D(dp),
    depCells: [],
    decision: '🌐 拓扑序与拓扑排序分层推演启动: longestIncreasingPath3(matrix)',
    message: '统计每个单元格的出度（走向严格更大邻居的边数），从出度为 0 的局部汇点开始分层剥洋葱！',
    log: 'start topological sorting',
    codeLine: lines3.entry,
    matrix,
    metrics: { 'metric-status': '初始化出度', 'metric-val': '0' },
  });

  const dirs = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1],
  ];

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      for (const [di, dj] of dirs) {
        const ni = i + di;
        const nj = j + dj;
        if (ni >= 0 && ni < m && nj >= 0 && nj < n && matrix[ni][nj] > matrix[i][j]) {
          outdegree[i][j]++;
        }
      }
    }
  }

  steps.push({
    curI: 0,
    curJ: 0,
    currentCell: '出度统计完毕',
    currentVal: 0,
    dpTable: snapshotGrid2D(dp),
    depCells: [],
    decision: '📊 全局出度表统计完成：出度为 0 的格子是局部极大值（无法再向更高邻居延伸）',
    message: '出度为 0 的单元格即拓扑汇点，路径长度底线为 1',
    log: 'outdegree initialized',
    codeLine: lines3.calcOut,
    matrix,
    metrics: { 'metric-status': '出度就绪', 'metric-val': '0' },
  });

  let queue: Array<[number, number]> = [];
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (outdegree[i][j] === 0) {
        queue.push([i, j]);
      }
    }
  }

  steps.push({
    curI: queue[0]?.[0] ?? 0,
    curJ: queue[0]?.[1] ?? 0,
    currentCell: `队列就绪: ${queue.length} 个汇点`,
    currentVal: 1,
    dpTable: snapshotGrid2D(dp),
    depCells: [],
    decision: `📥 将全部出度为 0 的极大值点加入 BFS 队列，共 ${queue.length} 个汇点`,
    message: `这批单元格是所有最长递增路径的终点，从第 1 层开始反向拓扑推进`,
    log: `queue init with ${queue.length} nodes`,
    codeLine: lines3.initQueue,
    matrix,
    metrics: { 'metric-status': '首批汇点入队', 'metric-val': `${queue.length}` },
  });

  let level = 0;
  while (queue.length > 0) {
    level++;
    steps.push({
      curI: queue[0][0],
      curJ: queue[0][1],
      currentCell: `进入第 ${level} 层拓扑分层`,
      currentVal: level,
      dpTable: snapshotGrid2D(dp),
      depCells: [],
      decision: `🌊 BFS 分层拓扑推演：当前拓扑层级 level = ${level}，队列含 ${queue.length} 个节点`,
      message: `本层节点能形成的最大递增路径长度至少为 ${level}`,
      log: `level = ${level}`,
      codeLine: lines3.incLevel,
      matrix,
      metrics: { 'metric-status': `第 ${level} 层推演`, 'metric-val': `${level}` },
    });

    const nextQueue: Array<[number, number]> = [];
    for (const [r, c] of queue) {
      dp[r][c] = level;
      const deps: DpCellDep[] = [];

      steps.push({
        curI: r,
        curJ: c,
        currentCell: `dp[${r}][${c}]`,
        currentVal: level,
        dpTable: snapshotGrid2D(dp),
        depCells: deps,
        decision: `弹出汇点 (${r}, ${c})[值=${matrix[r][c]}]，确定其路径长度 dp[${r}][${c}] = ${level}`,
        message: `向四方更小邻居反向推进拓扑偏序`,
        log: `poll (${r}, ${c}), dp = ${level}`,
        codeLine: lines3.pollNode,
        matrix,
        metrics: { 'metric-status': `拓扑定序 (${r},${c})`, 'metric-val': `${level}` },
      });

      for (const [di, dj] of dirs) {
        const ni = r + di;
        const nj = c + dj;
        if (ni >= 0 && ni < m && nj >= 0 && nj < n && matrix[r][c] > matrix[ni][nj]) {
          outdegree[ni][nj]--;
          if (outdegree[ni][nj] === 0) {
            nextQueue.push([ni, nj]);
            deps.push({
              r: ni,
              c: nj,
              label: `邻居 [${ni}][${nj}](出度减至0入队)`,
              color: 'rgba(52, 211, 153, 0.3)',
            });
            steps.push({
              curI: ni,
              curJ: nj,
              currentCell: `邻居 (${ni}, ${nj})`,
              currentVal: level + 1,
              dpTable: snapshotGrid2D(dp),
              depCells: deps,
              decision: `邻居 (${ni}, ${nj})[值=${matrix[ni][nj]} < ${matrix[r][c]}] 出度减至 0，入队加入下一层！`,
              message: `消除入边依赖，进入下一拓扑层级`,
              log: `outdegree[${ni}][${nj}] = 0 -> push next`,
              codeLine: lines3.relaxNeighbor,
              matrix,
              metrics: { 'metric-status': `出度归零入队`, 'metric-val': `${level + 1}` },
            });
          }
        }
      }
    }
    queue = nextQueue;
  }

  steps.push({
    curI: 0,
    curJ: 0,
    currentCell: '拓扑推演完成',
    currentVal: level,
    dpTable: snapshotGrid2D(dp),
    depCells: [],
    decision: `🎉 拓扑排序完成，矩阵中最长递增路径长度为 ${level}`,
    message: `最大拓扑层级即为最长递增链的长度`,
    log: `return level = ${level}`,
    codeLine: lines3.returnLevel,
    matrix,
    metrics: { 'metric-status': '求解完毕', 'metric-val': `${level}` },
  });

  return rawSteps;
}

// ==========================================
// 4. Stage 4: 最长递增路径全景回溯沙盘
// ==========================================

export interface LipStage4Step {
  curI: number;
  curJ: number;
  dpTable: number[][];
  matrix: number[][];
  maxLen: number;
  bestPath: Array<[number, number]>;
  decision: string;
  message: string;
  log: string;
  codeLine: ResolvedLineTarget;
  metrics?: Record<string, any>;
  scope?: Record<string, any>;
}

export function buildLipStage4Steps(inputs: Record<string, any>): LipStage4Step[] {
  const matrix = parseMatrix(inputs?.['input-matrix']);
  const m = matrix.length;
  const n = matrix[0].length;
  const [steps, rawSteps] = createLipStepsArray<LipStage4Step>((item) => ({
    matrixVal: item.matrix?.[item.curI]?.[item.curJ],
    dpVal: item.dpTable?.[item.curI]?.[item.curJ],
    pathLen: item.bestPath?.length,
  }));
  const dp: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));

  function dfs(i: number, j: number): number {
    if (dp[i][j] !== 0) return dp[i][j];
    let ans = 1;
    const dirs = [
      [-1, 0],
      [0, 1],
      [1, 0],
      [0, -1],
    ];
    for (const [di, dj] of dirs) {
      const ni = i + di;
      const nj = j + dj;
      if (ni >= 0 && ni < m && nj >= 0 && nj < n && matrix[ni][nj] > matrix[i][j]) {
        ans = Math.max(ans, 1 + dfs(ni, nj));
      }
    }
    return (dp[i][j] = ans);
  }

  let globalMax = 0;
  let bestStart: [number, number] = [0, 0];

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      const len = dfs(r, c);
      if (len > globalMax) {
        globalMax = len;
        bestStart = [r, c];
      }
    }
  }

  const lines4 = {
    entry: getDp067Anchor(4, 'longest-increasing-path', 'entry'),
    findMax: getDp067Anchor(4, 'longest-increasing-path', 'findMax'),
    initPath: getDp067Anchor(4, 'longest-increasing-path', 'initPath'),
    whileLoop: getDp067Anchor(4, 'longest-increasing-path', 'whileLoop'),
    findNext: getDp067Anchor(4, 'longest-increasing-path', 'findNext'),
    stepNext: getDp067Anchor(4, 'longest-increasing-path', 'stepNext'),
    returnPath: getDp067Anchor(4, 'longest-increasing-path', 'returnPath'),
  };

  steps.push({
    curI: 0,
    curJ: 0,
    dpTable: snapshotGrid2D(dp),
    matrix,
    maxLen: 0,
    bestPath: [],
    decision: `主函数入口：reconstructLongestPath(matrix, dp)`,
    message: `从全局 dp 最大值点开始，沿着严格递增方向提取最长路径坐标序列`,
    log: `enter reconstructLongestPath`,
    codeLine: lines4.entry,
    metrics: { 'metric-max': '0', 'metric-path': '初始化' },
  });

  steps.push({
    curI: bestStart[0],
    curJ: bestStart[1],
    dpTable: snapshotGrid2D(dp),
    matrix,
    maxLen: globalMax,
    bestPath: [],
    decision: `寻找全局峰顶起点: 坐标 (${bestStart[0]}, ${bestStart[1]}), 权值 ${matrix[bestStart[0]][bestStart[1]]}, dp = ${globalMax}`,
    message: `以该点作为最长递增链的源头`,
    log: `find max at (${bestStart[0]}, ${bestStart[1]})`,
    codeLine: lines4.findMax,
    metrics: { 'metric-max': `${globalMax}`, 'metric-path': `(${bestStart[0]},${bestStart[1]})` },
  });

  const path: Array<[number, number]> = [bestStart];
  steps.push({
    curI: bestStart[0],
    curJ: bestStart[1],
    dpTable: snapshotGrid2D(dp),
    matrix,
    maxLen: globalMax,
    bestPath: [...path],
    decision: `将起点加入路径序列: path.add([${bestStart[0]}, ${bestStart[1]}])`,
    message: `当前路径节点: [${matrix[bestStart[0]][bestStart[1]]}]`,
    log: `path add (${bestStart[0]}, ${bestStart[1]})`,
    codeLine: lines4.initPath,
    metrics: { 'metric-max': `${globalMax}`, 'metric-path': `(${bestStart[0]},${bestStart[1]})` },
  });

  let cur = bestStart;
  while (true) {
    const [cr, cc] = cur;
    steps.push({
      curI: cr,
      curJ: cc,
      dpTable: snapshotGrid2D(dp),
      matrix,
      maxLen: globalMax,
      bestPath: [...path],
      decision: `循环判定: dp[${cr}][${cc}] = ${dp[cr][cc]} > 1，继续探寻更小的后继格`,
      message: `遍历四方寻找满足高度递减、dp 恰好减 1 的相邻格`,
      log: `while dp > 1 at (${cr}, ${cc})`,
      codeLine: lines4.whileLoop,
      metrics: { 'metric-max': `${globalMax}`, 'metric-path': path.map(([r, c]) => `(${r},${c})`).join('->') },
    });

    let next: [number, number] | null = null;
    const dirs = [
      [-1, 0],
      [0, 1],
      [1, 0],
      [0, -1],
    ];
    for (const [di, dj] of dirs) {
      const ni = cr + di;
      const nj = cc + dj;
      if (
        ni >= 0 &&
        ni < m &&
        nj >= 0 &&
        nj < n &&
        matrix[ni][nj] > matrix[cr][cc] &&
        dp[ni][nj] === dp[cr][cc] - 1
      ) {
        next = [ni, nj];
        steps.push({
          curI: ni,
          curJ: nj,
          dpTable: snapshotGrid2D(dp),
          matrix,
          maxLen: globalMax,
          bestPath: [...path],
          decision: `四向检验命中: 找到严格递增后继 (${ni}, ${nj})，数值 ${matrix[ni][nj]} > ${matrix[cr][cc]}`,
          message: `满足 dp[${ni}][${nj}] == dp[${cr}][${cc}] - 1，确定为最长链的一部分`,
          log: `found next (${ni}, ${nj})`,
          codeLine: lines4.findNext,
          metrics: { 'metric-max': `${globalMax}`, 'metric-path': path.map(([r, c]) => `(${r},${c})`).join('->') },
        });
        break;
      }
    }

    if (next) {
      path.push(next);
      cur = next;
      steps.push({
        curI: next[0],
        curJ: next[1],
        dpTable: snapshotGrid2D(dp),
        matrix,
        maxLen: globalMax,
        bestPath: [...path],
        decision: `移动指针并加入路径: path.add([${next[0]}, ${next[1]}])`,
        message: `当前路径为: ${path.map(([pr, pc]) => matrix[pr][pc]).join(' ➔ ')}`,
        log: `step to (${next[0]}, ${next[1]})`,
        codeLine: lines4.stepNext,
        metrics: { 'metric-max': `${globalMax}`, 'metric-path': path.map(([r, c]) => `(${r},${c})`).join('->') },
      });
    } else {
      break;
    }
  }

  steps.push({
    curI: bestStart[0],
    curJ: bestStart[1],
    dpTable: snapshotGrid2D(dp),
    matrix,
    maxLen: globalMax,
    bestPath: path,
    decision: `🎉 矩阵最长递增路径探查完成！全局最长长度 = ${globalMax}`,
    message: `最优递增路径为: ${path.map(([pr, pc]) => matrix[pr][pc]).join(' ➔ ')}`,
    log: `max len = ${globalMax}`,
    codeLine: lines4.returnPath,
    metrics: { 'metric-max': `${globalMax}`, 'metric-path': path.map(([r, c]) => `(${r},${c})`).join('->') },
  });

  return steps;
}
