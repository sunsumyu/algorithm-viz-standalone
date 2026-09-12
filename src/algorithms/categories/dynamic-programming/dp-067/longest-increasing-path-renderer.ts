/**
 * 矩阵中的最长递增路径 (LeetCode 329) - 声明式 4-Card 沙盘渲染器
 * 核心：天然有向无环图 (DAG)、偏序关系无环性、记忆化搜索与值拓扑排序填表
 * 涵盖：
 * 阶段 1: 暴力四向 DFS 搜索 (无需 visited 数组证明)
 * 阶段 2: 记忆化搜索 memo[i][j]
 * 阶段 3: 严格按值拓扑序递推 (从大到小填表)
 * 阶段 4: 最长递增路径全景回溯与地貌热力图
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { DP_067_PROBLEMS } from './dp-067-problem-content';
import {
  LIP_STAGE1_CODE_LANGUAGES,
  LIP_STAGE2_CODE_LANGUAGES,
  LIP_STAGE3_CODE_LANGUAGES,
  LIP_STAGE4_CODE_LANGUAGES,
} from './dp-067-stage-codes';
import {
  renderRecursionCard1,
  renderMemoCard1,
  renderMemoGridCard,
  renderDp2DCard1,
  renderDp2DCard2,
  DpCellDep,
} from './dp-067-shared';
import { renderUniversalDpGrid } from '../dp-shared';
import { parseGridInput } from '../../../core/input-primitives';

function parseMatrix(raw: unknown): number[][] {
  return parseGridInput(raw, [[9,9,4],[6,6,8],[2,1,1]]);
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
  codeLine: Record<string, number>;
  metrics?: Record<string, any>;
}

export function buildLipStage1Steps(inputs: Record<string, any>): LipRecStep[] {
  const matrix = parseMatrix(inputs?.['input-matrix']);
  const m = matrix.length;
  const n = matrix[0].length;
  const steps: LipRecStep[] = [];
  const stack: Array<{ label: string }> = [];

  const lines = {
    entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
    enter: { java: 11, cpp: 2, python: 2, javascript: 2 },
    dirsLoop: { java: 16, cpp: 7, python: 6, javascript: 7 },
    returnAns: { java: 20, cpp: 11, python: 8, javascript: 11 },
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
  return steps;
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
  codeLine: Record<string, number>;
  memoGrid: number[][];
  cachedVal?: number;
  matrix: number[][];
  metrics?: Record<string, any>;
}

export function buildLipStage2Steps(inputs: Record<string, any>): LipMemoStep[] {
  const matrix = parseMatrix(inputs?.['input-matrix']);
  const m = matrix.length;
  const n = matrix[0].length;
  const steps: LipMemoStep[] = [];
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
    codeLine: { java: 2, cpp: 2, python: 2, javascript: 2 },
    memoGrid: dp.map((r) => [...r]),
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
        codeLine: { java: 13, cpp: 3, python: 3, javascript: 3 },
        memoGrid: dp.map((r) => [...r]),
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
      codeLine: { java: 14, cpp: 4, python: 4, javascript: 4 },
      memoGrid: dp.map((r) => [...r]),
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
      codeLine: { java: 22, cpp: 12, python: 9, javascript: 12 },
      memoGrid: dp.map((r) => [...r]),
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

  return steps;
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
  codeLine: Record<string, number>;
  matrix: number[][];
  metrics?: Record<string, any>;
}


export function buildLipStage3Steps(inputs: Record<string, any>): Lip2DStep[] {
  const matrix = parseMatrix(inputs?.['input-matrix']);
  const m = matrix.length;
  const n = matrix[0].length;
  const steps: Lip2DStep[] = [];
  const dp: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
  const outdegree: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));

  const lines3 = {
    entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
    initOut: { java: 4, cpp: 4, python: 3, javascript: 4 },
    calcOut: { java: 10, cpp: 10, python: 9, javascript: 10 },
    initQueue: { java: 15, cpp: 15, python: 10, javascript: 15 },
    whileQueue: { java: 17, cpp: 17, python: 12, javascript: 17 },
    incLevel: { java: 18, cpp: 18, python: 13, javascript: 18 },
    pollNode: { java: 21, cpp: 21, python: 16, javascript: 20 },
    relaxNeighbor: { java: 25, cpp: 25, python: 20, javascript: 24 },
    returnLevel: { java: 30, cpp: 30, python: 22, javascript: 30 },
  };

  steps.push({
    curI: 0,
    curJ: 0,
    currentCell: '入口初始化',
    currentVal: 0,
    dpTable: dp.map((r) => [...r]),
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
    dpTable: dp.map((r) => [...r]),
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
    dpTable: dp.map((r) => [...r]),
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
      dpTable: dp.map((r) => [...r]),
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
        dpTable: dp.map((row) => [...row]),
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
              dpTable: dp.map((row) => [...row]),
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
    dpTable: dp.map((r) => [...r]),
    depCells: [],
    decision: `🎉 拓扑排序完成，矩阵中最长递增路径长度为 ${level}`,
    message: `最大拓扑层级即为最长递增链的长度`,
    log: `return level = ${level}`,
    codeLine: lines3.returnLevel,
    matrix,
    metrics: { 'metric-status': '求解完毕', 'metric-val': `${level}` },
  });

  return steps;
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
  codeLine: Record<string, number>;
  metrics?: Record<string, any>;
}

export function buildLipStage4Steps(inputs: Record<string, any>): LipStage4Step[] {
  const matrix = parseMatrix(inputs?.['input-matrix']);
  const m = matrix.length;
  const n = matrix[0].length;
  const steps: LipStage4Step[] = [];
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
    entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
    findMax: { java: 7, cpp: 7, python: 7, javascript: 7 },
    initPath: { java: 11, cpp: 11, python: 8, javascript: 11 },
    whileLoop: { java: 13, cpp: 13, python: 10, javascript: 13 },
    findNext: { java: 16, cpp: 16, python: 13, javascript: 16 },
    stepNext: { java: 18, cpp: 18, python: 15, javascript: 18 },
    returnPath: { java: 23, cpp: 23, python: 17, javascript: 23 },
  };

  steps.push({
    curI: 0,
    curJ: 0,
    dpTable: dp.map((r) => [...r]),
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
    dpTable: dp.map((r) => [...r]),
    matrix,
    maxLen: globalMax,
    bestPath: [],
    decision: `寻找全局峰顶起点: 坐标 (${bestStart[0]}, ${bestStart[1]}), 权值 ${matrix[bestStart[0]][bestStart[1]]}, dp = ${globalMax}`,
    message: `以该点作为最长递增链的源头`,
    log: `find max at (${bestStart[0]}, ${bestStart[1]})`,
    codeLine: lines4.findMax,
    metrics: { 'metric-max': `${globalMax}`, 'metric-path': `(${bestStart[0]},${bestStart[1]})` },
  });

  // 重构最优路径
  const path: Array<[number, number]> = [bestStart];
  steps.push({
    curI: bestStart[0],
    curJ: bestStart[1],
    dpTable: dp.map((r) => [...r]),
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
      dpTable: dp.map((r) => [...r]),
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
          dpTable: dp.map((r) => [...r]),
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
        dpTable: dp.map((r) => [...r]),
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
    dpTable: dp.map((r) => [...r]),
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

// ==========================================
// 5. 声明式 Visualizer
// ==========================================

const { template, Visualizer } = createDeclarativeVisualizer<any>({
  id: 'longest-increasing-path',
  name: '矩阵中的最长递增路径 (LeetCode 329)',
  category: 'dynamic-programming',
  badge: {
    mode: 'DAG 记忆化搜索 · 偏序无环',
    complexity: 'O(M×N) · O(M×N)',
  },
  card1Title: '⛰️ 矩阵地势高度图与最优递增链',
  card2Title: '📈 动态规划记忆化状态表与 DAG 拓扑',
  card2Desc: '展示天然有向无环图、无 visited 数组证明与按值拓扑序递推',
  legend: [
    { label: '最优路径链', color: '#10b981' },
    { label: '当前访问格', color: '#38bdf8' },
    { label: '待探索格子', color: '#475569' },
  ],
  inputs: [
    {
      id: 'input-matrix',
      label: '矩阵:',
      type: 'text',
      defaultValue: '[[9,9,4],[6,6,8],[2,1,1]]',
      width: '240px',
    },
  ],
  presets: [
    {
      label: 'LeetCode 样例 1 (3x3 Ans=4: [1,2,6,9])',
      values: { 'input-matrix': '[[9,9,4],[6,6,8],[2,1,1]]' },
    },
    {
      label: 'LeetCode 样例 2 (3x3 Ans=4: [3,4,5,6])',
      values: { 'input-matrix': '[[3,4,5],[3,2,6],[2,2,1]]' },
    },
  ],
  metrics: [
    { id: 'metric-pos', label: '当前网格坐标', color: '#38bdf8' },
    { id: 'metric-val', label: '格子数值', color: '#10b981' },
    { id: 'metric-max', label: '最长递增长度', color: '#f59e0b' },
  ],
  codeLanguages: DP_067_PROBLEMS['longest-increasing-path'].codeLanguages,
  problemHtml: DP_067_PROBLEMS['longest-increasing-path'].problemHtml,
  analysisHtml: DP_067_PROBLEMS['longest-increasing-path'].analysisHtml,
  defaultStage: 'stage-1',
  buildSteps: buildLipStage1Steps,

  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力 DFS',
      shortName: 'DFS搜索',
      num: 1,
      timeBadge: 'O(4^(M×N))',
      theme: 'bg-blue',
      badge: {
        mode: '天然 DAG · 暴力四向探查',
        complexity: 'O(4^(M×N)) · O(M×N) 栈深',
      },
      card1Title: '🌿 递归分支展开与调用栈',
      card2Title: '⛰️ 矩阵地势高度与当前位置',
      legend: [
        { label: '当前探查 (i,j)', color: '#0284c7' },
        { label: '地势较低格', color: '#93c5fd' },
        { label: '地势较高格', color: '#1e3a8a' },
      ],
      codeLanguages: LIP_STAGE1_CODE_LANGUAGES,
      buildSteps: buildLipStage1Steps,
      renderCanvas: (container, step) => {
        renderRecursionCard1(
          container,
          step.currentCall,
          step.callStack,
          `<div style="font-size:12px; font-weight:700; color:#0284c7;">${step.decision}</div>
           <div style="font-size:11px; color:#64748b; margin-top:4px;">${step.message}</div>`
        );
      },
      renderCustomMetrics: (container, step) => {
        renderMatrixTerrain(container, step.matrix, step.i, step.j);
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 记忆化搜索',
      shortName: '记忆化',
      num: 2,
      timeBadge: 'O(M×N)',
      theme: 'bg-blue',
      badge: {
        mode: '天然 DAG · 记忆化搜索',
        complexity: 'O(M×N) · O(M×N) 备忘录',
      },
      card1Title: '💾 备忘录缓存追踪 (Hit / Miss)',
      card2Title: '🎯 2D 最长路径备忘录 memo[i][j]',
      legend: [
        { label: '缓存命中 (Hit)', color: '#10b981' },
        { label: '未命中算值 (Miss)', color: '#ef4444' },
        { label: '未计算 (-1)', color: '#94a3b8' },
      ],
      codeLanguages: LIP_STAGE2_CODE_LANGUAGES,
      buildSteps: buildLipStage2Steps,
      renderCanvas: (container, step) => {
        renderMemoCard1(
          container,
          step.currentCall,
          step.memoHit,
          step.hitCount,
          step.missCount,
          step.decision,
          step.message,
          step.cachedVal
        );
      },
      renderCustomMetrics: (container, step) => {
        renderMemoGridCard(
          container,
          '路径备忘录 memo[i][j]',
          step.memoGrid,
          step.i,
          step.j
        );
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: 严格值拓扑序 DP',
      shortName: '拓扑序DP',
      num: 3,
      timeBadge: 'O(MN log(MN))',
      theme: 'bg-emerald',
      badge: {
        mode: '严格按值从大到小递推',
        complexity: 'O(MN log(MN)) · O(M×N)',
      },
      card1Title: '📐 偏序拓扑序状态推导',
      card2Title: '📊 严格二维状态表 dp[i][j]',
      legend: [
        { label: '当前拓扑递推', color: '#10b981' },
        { label: '四向递增前驱', color: '#6366f1' },
        { label: '已计算', color: '#64748b' },
      ],
      codeLanguages: LIP_STAGE3_CODE_LANGUAGES,
      buildSteps: buildLipStage3Steps,
      renderCanvas: (container, step) => {
        renderDp2DCard1(
          container,
          step.currentCell,
          step.currentVal,
          step.depCells,
          step.decision,
          step.message
        );
      },
      renderCustomMetrics: (container, step) => {
        renderDp2DCard2(
          container,
          '二维状态表 dp[i][j]',
          step.dpTable,
          step.curI,
          step.curJ,
          step.depCells.map((d: DpCellDep) => ({ r: d.r, c: d.c }))
        );
      },
    },
    {
      id: 'stage-4',
      name: '阶段 4: 最长路径全景沙盘',
      shortName: '最优路径',
      num: 4,
      timeBadge: 'O(M×N) 最优',
      theme: 'bg-amber',
      badge: {
        mode: '全局最长递增路径高亮',
        complexity: 'O(M×N) · O(M×N)',
      },
      card1Title: '⛰️ 矩阵地势高度图与最优路径链',
      card2Title: '📈 全局路径长度矩阵 dp[i][j]',
      legend: [
        { label: '全局最优递增链', color: '#16a34a' },
        { label: '链当前格/光标', color: '#0284c7' },
        { label: '地势基准格', color: '#94a3b8' },
      ],
      codeLanguages: LIP_STAGE4_CODE_LANGUAGES,
      buildSteps: buildLipStage4Steps,
      renderCanvas: (container, step) => {
        renderMatrixTerrain(container, step.matrix, step.curI, step.curJ, step.bestPath);
      },
      renderCustomMetrics: (container, step) => {
        renderDp2DCard2(
          container,
          '全局最长路径矩阵 dp[i][j]',
          step.dpTable,
          step.curI,
          step.curJ,
          []
        );
      },
    },
  ],
  renderCanvas: (container, step) => {
    renderMatrixTerrain(container, step.matrix, step.curI, step.curJ, step.bestPath);
  },
  renderCustomMetrics: (container, step) => {
    renderDp2DCard2(
      container,
      '全局最长路径矩阵 dp[i][j]',
      step.dpTable,
      step.curI,
      step.curJ,
      []
    );
  },
});

function renderMatrixTerrain(
  container: HTMLElement,
  matrix: number[][],
  activeI: number,
  activeJ: number,
  bestPath?: Array<[number, number]>
): void {
  if (!container) return;
  const rows = matrix.length;
  const cols = matrix[0]?.length || 0;

  let min = Infinity;
  let max = -Infinity;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (matrix[r][c] < min) min = matrix[r][c];
      if (matrix[r][c] > max) max = matrix[r][c];
    }
  }

  const activeStack = bestPath ? bestPath.map(([pr, pc]) => `${pr},${pc}`) : [];

  renderUniversalDpGrid(container, {
    title: `⛰️ 地势矩阵: ${rows} × ${cols}`,
    badgeText: bestPath ? `最长递增步数: ${bestPath.length}` : `当前坐标: (${activeI}, ${activeJ})`,
    subTitle: `地势范围 ${min} ~ ${max}`,
    grid: matrix,
    activeI,
    activeJ,
    activeStack,
    rowLabels: Array.from({ length: rows }, (_, r) => `r${r}`),
    colLabels: Array.from({ length: cols }, (_, c) => `c${c}`),
    legend: [
      { label: '探险家 🤠', color: '#2563eb' },
      { label: '最优链 👣', color: '#0284c7' },
      { label: '地势网格', color: '#059669' },
    ],
    modelId: 'longest-increasing-path',
  });
}

export const LongestIncreasingPathVisualizer = Visualizer;

registerAlgorithm({
  id: 'longest-increasing-path',
  name: '矩阵中的最长递增路径 (LeetCode 329)',
  viewId: 'algo-longest-increasing-path-view',
  category: 'dynamic-programming',
  description: '左程云算法讲解067 Code06：LeetCode 329 矩阵最长递增路径，严格偏序天然有向无环图 (DAG) 与记忆化搜索',
  icon: '⛰️',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 106,
  learningGoal: '理解偏序关系带来的天然无环性、为什么无需 visited 标记以及按值拓扑序递推填表本质',
});
