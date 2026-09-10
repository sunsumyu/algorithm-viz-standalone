/**
 * 最小路径和 (LeetCode 64) - 声明式 4-Card 沙盘渲染器
 * 涵盖：
 * 阶段 1: 暴力递归 f(i, j) = grid[i][j] + min(f(i-1, j), f(i, j-1))
 * 阶段 2: 记忆化搜索 memo[i][j] 缓存消除重叠子问题
 * 阶段 3: 严格二维表 dp[i][j] 按行自左向右递推
 * 阶段 4: 空间压缩 dp[j] 一维滚动优化
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { DP_067_PROBLEMS } from './dp-067-problem-content';
import {
  MIN_PATH_SUM_STAGE1_CODE_LANGUAGES,
  MIN_PATH_SUM_STAGE2_CODE_LANGUAGES,
  MIN_PATH_SUM_STAGE3_CODE_LANGUAGES,
  MIN_PATH_SUM_STAGE4_CODE_LANGUAGES,
} from './dp-067-stage-codes';
import {
  renderRecursionCard1,
  renderMemoCard1,
  renderMemoGridCard,
  renderDp2DCard1,
  renderDp2DCard2,
  renderSpaceOptCard2,
  DpCellDep,
} from './dp-067-shared';

// ==========================================
// 1. 输入解析与类型定义
// ==========================================

export function parseGridInput(inputs: Record<string, any>): number[][] {
  const raw = inputs?.['input-grid'];
  if (!raw) {
    return [
      [1, 3, 1],
      [1, 5, 1],
      [4, 2, 1],
    ];
  }
  try {
    const parsed = JSON.parse(String(raw));
    if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
      return parsed;
    }
  } catch {
    // fallback
  }
  return [
    [1, 3, 1],
    [1, 5, 1],
    [4, 2, 1],
  ];
}

// ==========================================
// 2. Stage 1: 暴力递归推演步骤生成
// ==========================================

export interface MinPathRecStep {
  currentCall: string;
  i: number;
  j: number;
  callStack: Array<{ label: string }>;
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  grid: number[][];
  metrics?: Record<string, any>;
}

export function buildMinPathSumStage1Steps(inputs: Record<string, any>): MinPathRecStep[] {
  const grid = parseGridInput(inputs);
  const m = grid.length;
  const n = grid[0].length;
  const steps: MinPathRecStep[] = [];
  const stack: Array<{ label: string }> = [];

  const lines = {
    enter: { java: 6, cpp: 2, python: 3, javascript: 3 },
    baseOrigin: { java: 7, cpp: 3, python: 4, javascript: 4 },
    baseRow0: { java: 8, cpp: 4, python: 5, javascript: 5 },
    baseCol0: { java: 9, cpp: 5, python: 6, javascript: 6 },
    returnMin: { java: 10, cpp: 6, python: 7, javascript: 7 },
  };

  function f(i: number, j: number): number {
    stack.push({ label: `f(${i}, ${j})` });
    steps.push({
      currentCall: `f(${i}, ${j})`,
      i,
      j,
      callStack: [...stack],
      decision: `探查坐标 (${i}, ${j})，格子权值 = ${grid[i][j]}`,
      message: `调用 f(${i}, ${j})，尝试求从 (0,0) 到达 (${i}, ${j}) 的最小路径和`,
      log: `enter f(${i}, ${j})`,
      codeLine: lines.enter,
      grid,
      metrics: { 'metric-pos': `(${i}, ${j})`, 'metric-status': '递归入栈' },
    });

    if (i === 0 && j === 0) {
      steps.push({
        currentCall: `f(${i}, ${j})`,
        i,
        j,
        callStack: [...stack],
        decision: `到达起点 (0, 0)，路径和即为起点权值 ${grid[0][0]}`,
        message: `Base Case: 到达网格起点，直接返回 ${grid[0][0]}`,
        log: `base f(0, 0) = ${grid[0][0]}`,
        codeLine: lines.baseOrigin,
        grid,
        metrics: { 'metric-pos': `(0, 0)`, 'metric-status': '起点返回' },
      });
      stack.pop();
      return grid[0][0];
    }

    if (i === 0) {
      steps.push({
        currentCall: `f(${i}, ${j})`,
        i,
        j,
        callStack: [...stack],
        decision: `位于第 0 行，只能从左侧 (0, ${j - 1}) 水平走来`,
        message: `边界分支: i=0，只能向左递归 f(0, ${j - 1}) + ${grid[0][j]}`,
        log: `row 0: f(0, ${j})`,
        codeLine: lines.baseRow0,
        grid,
        metrics: { 'metric-pos': `(0, ${j})`, 'metric-status': '边界左推' },
      });
      const left = f(0, j - 1);
      const res = left + grid[0][j];
      stack.pop();
      return res;
    }

    if (j === 0) {
      steps.push({
        currentCall: `f(${i}, ${j})`,
        i,
        j,
        callStack: [...stack],
        decision: `位于第 0 列，只能从上方 (${i - 1}, 0) 垂直走来`,
        message: `边界分支: j=0，只能向上递归 f(${i - 1}, 0) + ${grid[i][0]}`,
        log: `col 0: f(${i}, 0)`,
        codeLine: lines.baseCol0,
        grid,
        metrics: { 'metric-pos': `(${i}, 0)`, 'metric-status': '边界上推' },
      });
      const up = f(i - 1, 0);
      const res = up + grid[i][0];
      stack.pop();
      return res;
    }

    const upVal = f(i - 1, j);
    const leftVal = f(i, j - 1);
    const ans = grid[i][j] + Math.min(upVal, leftVal);

    steps.push({
      currentCall: `f(${i}, ${j})`,
      i,
      j,
      callStack: [...stack],
      decision: `合并决策: grid[${i}][${j}] + min(上=${upVal}, 左=${leftVal}) = ${ans}`,
      message: `从上方与左方中挑选较小者并加上当前格值 ${grid[i][j]}，得到 ${ans}`,
      log: `return f(${i}, ${j}) = ${ans}`,
      codeLine: lines.returnMin,
      grid,
      metrics: { 'metric-pos': `(${i}, ${j})`, 'metric-ans': `${ans}` },
    });

    stack.pop();
    return ans;
  }

  f(m - 1, n - 1);
  return steps;
}

// ==========================================
// 3. Stage 2: 记忆化搜索步骤生成
// ==========================================

export interface MinPathMemoStep {
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
  grid: number[][];
  metrics?: Record<string, any>;
}

export function buildMinPathSumStage2Steps(inputs: Record<string, any>): MinPathMemoStep[] {
  const grid = parseGridInput(inputs);
  const m = grid.length;
  const n = grid[0].length;
  const steps: MinPathMemoStep[] = [];
  const memo: number[][] = Array.from({ length: m }, () => new Array(n).fill(-1));
  let hitCount = 0;
  let missCount = 0;

  const lines = {
    init: { java: 6, cpp: 12, python: 12, javascript: 12 },
    checkMemo: { java: 9, cpp: 6, python: 5, javascript: 6 },
    baseOrigin: { java: 10, cpp: 7, python: 6, javascript: 7 },
    baseRow0: { java: 11, cpp: 8, python: 7, javascript: 8 },
    baseCol0: { java: 12, cpp: 9, python: 8, javascript: 9 },
    memoStore: { java: 13, cpp: 10, python: 10, javascript: 10 },
  };

  steps.push({
    currentCall: `minPathSum2(grid)`,
    i: m - 1,
    j: n - 1,
    memoHit: false,
    hitCount: 0,
    missCount: 0,
    decision: `🚀 初始化备忘录与启动递归: f(grid, ${m - 1}, ${n - 1}, memo)`,
    message: `创建 ${m}×${n} 的备忘录矩阵并全部初始化为 -1，从右下角 (${m - 1}, ${n - 1}) 启动带缓存求解`,
    log: `call f(grid, ${m - 1}, ${n - 1})`,
    codeLine: lines.init,
    memoGrid: memo.map((r) => [...r]),
    grid,
    metrics: { 'metric-memo-hit': '0', 'metric-status': '启动递归' },
  });

  function fMemo(i: number, j: number): number {
    if (memo[i][j] !== -1) {
      hitCount++;
      steps.push({
        currentCall: `f(${i}, ${j})`,
        i,
        j,
        memoHit: true,
        hitCount,
        missCount,
        cachedVal: memo[i][j],
        decision: `🎯 命中备忘录！memo[${i}][${j}] = ${memo[i][j]}`,
        message: `坐标 (${i}, ${j}) 此前已被探查并计算过，直接复用缓存值 ${memo[i][j]}，剪掉整棵子树！`,
        log: `hit memo[${i}][${j}] = ${memo[i][j]}`,
        codeLine: lines.checkMemo,
        memoGrid: memo.map((r) => [...r]),
        grid,
        metrics: { 'metric-memo-hit': `${hitCount}`, 'metric-status': '命中剪枝' },
      });
      return memo[i][j];
    }

    missCount++;
    steps.push({
      currentCall: `f(${i}, ${j})`,
      i,
      j,
      memoHit: false,
      hitCount,
      missCount,
      decision: `⚠️ 未命中备忘录！需展开递归探查`,
      message: `首次访问 (${i}, ${j})，继续向下求解`,
      log: `miss memo[${i}][${j}]`,
      codeLine: lines.checkMemo,
      memoGrid: memo.map((r) => [...r]),
      grid,
      metrics: { 'metric-memo-miss': `${missCount}`, 'metric-status': '展开探索' },
    });

    let res: number;
    if (i === 0 && j === 0) {
      res = grid[0][0];
      steps.push({
        currentCall: `f(${i}, ${j})`,
        i,
        j,
        memoHit: false,
        hitCount,
        missCount,
        cachedVal: res,
        decision: `基准条件 (0,0): 起点网格代价为 ${res}`,
        message: `到达终点/起点 (0, 0)，直接获取底线代价 ${res}`,
        log: `base (0,0) = ${res}`,
        codeLine: lines.baseOrigin,
        memoGrid: memo.map((r) => [...r]),
        grid,
        metrics: { 'metric-pos': `(0,0)`, 'metric-status': '起点基准' },
      });
    } else if (i === 0) {
      steps.push({
        currentCall: `f(${i}, ${j})`,
        i,
        j,
        memoHit: false,
        hitCount,
        missCount,
        decision: `边界递归: 行 0 只能从左侧 (0, ${j - 1}) 走来`,
        message: `位于第一行，只能沿着左边界推进，递归求解左侧单元格并累加当前格值 ${grid[i][j]}`,
        log: `base row0 (${i}, ${j}) -> (${i}, ${j - 1})`,
        codeLine: lines.baseRow0,
        memoGrid: memo.map((r) => [...r]),
        grid,
        metrics: { 'metric-pos': `(${i}, ${j})`, 'metric-status': '左侧推进' },
      });
      res = fMemo(0, j - 1) + grid[0][j];
    } else if (j === 0) {
      steps.push({
        currentCall: `f(${i}, ${j})`,
        i,
        j,
        memoHit: false,
        hitCount,
        missCount,
        decision: `边界递归: 列 0 只能从上方 (${i - 1}, 0) 走来`,
        message: `位于第一列，只能沿着上边界下推，递归求解上方单元格并累加当前格值 ${grid[i][j]}`,
        log: `base col0 (${i}, ${j}) -> (${i - 1}, ${j})`,
        codeLine: lines.baseCol0,
        memoGrid: memo.map((r) => [...r]),
        grid,
        metrics: { 'metric-pos': `(${i}, ${j})`, 'metric-status': '上方推进' },
      });
      res = fMemo(i - 1, 0) + grid[i][0];
    } else {
      res = grid[i][j] + Math.min(fMemo(i - 1, j), fMemo(i, j - 1));
    }

    memo[i][j] = res;
    steps.push({
      currentCall: `f(${i}, ${j})`,
      i,
      j,
      memoHit: false,
      hitCount,
      missCount,
      cachedVal: res,
      decision: `💾 计算完毕写入备忘录: memo[${i}][${j}] = ${res}`,
      message: `子问题 (${i}, ${j}) 求解完成，将结果 ${res} 存入备忘录供后续共享`,
      log: `store memo[${i}][${j}] = ${res}`,
      codeLine: lines.memoStore,
      memoGrid: memo.map((r) => [...r]),
      grid,
      metrics: { 'metric-memo-store': `[${i}][${j}]=${res}` },
    });

    return res;
  }

  fMemo(m - 1, n - 1);
  return steps;
}

// ==========================================
// 4. Stage 3: 严格二维表递推步骤生成
// ==========================================

export interface MinPath2DStep {
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
  grid: number[][];
  metrics?: Record<string, any>;
}

export function buildMinPathSumStage3Steps(inputs: Record<string, any>): MinPath2DStep[] {
  const grid = parseGridInput(inputs);
  const m = grid.length;
  const n = grid[0].length;
  const steps: MinPath2DStep[] = [];
  const dp: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));

  const lines = {
    origin: { java: 5, cpp: 5, python: 5, javascript: 5 },
    firstRow: { java: 6, cpp: 6, python: 6, javascript: 6 },
    firstCol: { java: 7, cpp: 7, python: 7, javascript: 7 },
    innerLoop: { java: 10, cpp: 10, python: 10, javascript: 10 },
    returnAns: { java: 13, cpp: 13, python: 11, javascript: 13 },
  };

  // 1. 起点
  dp[0][0] = grid[0][0];
  steps.push({
    curI: 0,
    curJ: 0,
    currentCell: 'dp[0][0]',
    currentVal: dp[0][0],
    dpTable: dp.map((r) => [...r]),
    depCells: [],
    decision: `初始化起点: dp[0][0] = grid[0][0] = ${grid[0][0]}`,
    message: `起点只有自身权值，无需前驱累加`,
    log: `dp[0][0] = ${dp[0][0]}`,
    codeLine: lines.origin,
    grid,
    metrics: { 'metric-cur-cell': 'dp[0][0]', 'metric-val': `${dp[0][0]}` },
  });

  // 2. 第一行
  for (let j = 1; j < n; j++) {
    dp[0][j] = dp[0][j - 1] + grid[0][j];
    steps.push({
      curI: 0,
      curJ: j,
      currentCell: `dp[0][${j}]`,
      currentVal: dp[0][j],
      dpTable: dp.map((r) => [...r]),
      depCells: [{ r: 0, c: j - 1, label: '左方单元格', color: 'rgba(56, 189, 248, 0.2)' }],
      decision: `第一行递推: dp[0][${j}] = dp[0][${j - 1}] + grid[0][${j}] = ${dp[0][j]}`,
      message: `在第 0 行只能向右走，路径累加左侧值 ${dp[0][j - 1]} 与当前权值 ${grid[0][j]}`,
      log: `dp[0][${j}] = ${dp[0][j]}`,
      codeLine: lines.firstRow,
      grid,
      metrics: { 'metric-cur-cell': `dp[0][${j}]`, 'metric-val': `${dp[0][j]}` },
    });
  }

  // 3. 第一列
  for (let i = 1; i < m; i++) {
    dp[i][0] = dp[i - 1][0] + grid[i][0];
    steps.push({
      curI: i,
      curJ: 0,
      currentCell: `dp[${i}][0]`,
      currentVal: dp[i][0],
      dpTable: dp.map((r) => [...r]),
      depCells: [{ r: i - 1, c: 0, label: '上方单元格', color: 'rgba(129, 140, 248, 0.2)' }],
      decision: `第一列递推: dp[${i}][0] = dp[${i - 1}][0] + grid[${i}][0] = ${dp[i][0]}`,
      message: `在第 0 列只能向下走，路径累加上方值 ${dp[i - 1][0]} 与当前权值 ${grid[i][0]}`,
      log: `dp[${i}][0] = ${dp[i][0]}`,
      codeLine: lines.firstCol,
      grid,
      metrics: { 'metric-cur-cell': `dp[${i}][0]`, 'metric-val': `${dp[i][0]}` },
    });
  }

  // 4. 普通格子
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      const up = dp[i - 1][j];
      const left = dp[i][j - 1];
      dp[i][j] = Math.min(up, left) + grid[i][j];
      steps.push({
        curI: i,
        curJ: j,
        currentCell: `dp[${i}][${j}]`,
        currentVal: dp[i][j],
        dpTable: dp.map((r) => [...r]),
        depCells: [
          { r: i - 1, c: j, label: '上方 [i-1][j]', color: 'rgba(129, 140, 248, 0.2)' },
          { r: i, c: j - 1, label: '左方 [i][j-1]', color: 'rgba(56, 189, 248, 0.2)' },
        ],
        decision: `状态转移: min(上=${up}, 左=${left}) + grid[${i}][${j}](${grid[i][j]}) = ${dp[i][j]}`,
        message: `在坐标 (${i}, ${j})，比较上方 ${up} 与左方 ${left}，挑选更小路径到达本格`,
        log: `dp[${i}][${j}] = ${dp[i][j]}`,
        codeLine: lines.innerLoop,
        grid,
        metrics: { 'metric-cur-cell': `dp[${i}][${j}]`, 'metric-val': `${dp[i][j]}` },
      });
    }
  }

  // 最终完成
  steps.push({
    curI: m - 1,
    curJ: n - 1,
    currentCell: `dp[${m - 1}][${n - 1}]`,
    currentVal: dp[m - 1][n - 1],
    dpTable: dp.map((r) => [...r]),
    depCells: [],
    decision: `🎉 填表结束！右下角终点最小路径和 = ${dp[m - 1][n - 1]}`,
    message: `整个二维表格自上而下、自左向右递推完成`,
    log: `ans = ${dp[m - 1][n - 1]}`,
    codeLine: lines.returnAns,
    grid,
    metrics: { 'metric-cur-cell': `dp[${m - 1}][${n - 1}]`, 'metric-val': `${dp[m - 1][n - 1]}` },
  });

  return steps;
}

// ==========================================
// 5. Stage 4: 空间压缩一维优化步骤生成
// ==========================================

export interface MinPathSpaceOptStep {
  curI: number;
  curJ: number;
  dp: number[];
  grid: number[][];
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  metrics?: Record<string, any>;
  path?: Array<[number, number]>;
}

export function buildMinPathSumStage4Steps(inputs: Record<string, any>): MinPathSpaceOptStep[] {
  const grid = parseGridInput(inputs);
  const m = grid.length;
  const n = grid[0].length;
  const steps: MinPathSpaceOptStep[] = [];
  const dp = new Array(n).fill(0);

  const lines = {
    init: { java: 5, cpp: 5, python: 5, javascript: 5 },
    firstRow: { java: 6, cpp: 6, python: 6, javascript: 6 },
    rowLoop: { java: 7, cpp: 7, python: 7, javascript: 7 },
    firstCol: { java: 8, cpp: 8, python: 8, javascript: 8 },
    colLoop: { java: 10, cpp: 10, python: 10, javascript: 10 },
    returnAns: { java: 13, cpp: 13, python: 11, javascript: 13 },
  };

  dp[0] = grid[0][0];
  steps.push({
    curI: 0,
    curJ: 0,
    dp: [...dp],
    grid,
    decision: `初始化压缩向量起点: dp[0] = ${grid[0][0]}`,
    message: `空间复杂度从 O(M×N) 优化到 O(N)，仅维护一条长度为 ${n} 的一维数组`,
    log: `dp[0] = ${dp[0]}`,
    codeLine: lines.init,
    metrics: { 'metric-space': `O(${n})`, 'metric-val': `${dp[0]}` },
  });

  for (let j = 1; j < n; j++) {
    dp[j] = dp[j - 1] + grid[0][j];
    steps.push({
      curI: 0,
      curJ: j,
      dp: [...dp],
      grid,
      decision: `初始化第 0 行: dp[${j}] = dp[${j - 1}] + ${grid[0][j]} = ${dp[j]}`,
      message: `第 0 行前缀和初始化`,
      log: `dp[${j}] = ${dp[j]}`,
      codeLine: lines.firstRow,
      metrics: { 'metric-space': `O(${n})`, 'metric-val': `${dp[j]}` },
    });
  }

  for (let i = 1; i < m; i++) {
    dp[0] += grid[i][0];
    steps.push({
      curI: i,
      curJ: 0,
      dp: [...dp],
      grid,
      decision: `第 ${i} 行第 0 列更新: dp[0] += grid[${i}][0](${grid[i][0]}) => ${dp[0]}`,
      message: `第 0 列只能由上一行的同一位置垂直向下转移`,
      log: `dp[0] = ${dp[0]}`,
      codeLine: lines.firstCol,
      metrics: { 'metric-space': `O(${n})`, 'metric-val': `${dp[0]}` },
    });

    for (let j = 1; j < n; j++) {
      const prevUp = dp[j];
      const prevLeft = dp[j - 1];
      dp[j] = Math.min(prevUp, prevLeft) + grid[i][j];
      steps.push({
        curI: i,
        curJ: j,
        dp: [...dp],
        grid,
        decision: `滚动覆盖更新 dp[${j}] = min(上一行同列=${prevUp}, 本行左侧=${prevLeft}) + ${grid[i][j]} = ${dp[j]}`,
        message: `旧 dp[${j}] 代表上方值，新 dp[${j-1}] 代表左方值，完美原地更新`,
        log: `dp[${j}] = ${dp[j]}`,
        codeLine: lines.colLoop,
        metrics: { 'metric-space': `O(${n})`, 'metric-val': `${dp[j]}` },
      });
    }
  }

  steps.push({
    curI: m - 1,
    curJ: n - 1,
    dp: [...dp],
    grid,
    decision: `🎉 空间压缩递推完毕！最终最小路径和为 dp[${n - 1}] = ${dp[n - 1]}`,
    message: `成功使用一维数组计算出最小路径和`,
    log: `return dp[${n - 1}] = ${dp[n - 1]}`,
    codeLine: lines.returnAns,
    metrics: { 'metric-space': `O(${n})`, 'metric-val': `${dp[n - 1]}` },
  });

  return steps;
}

// ==========================================
// 6. 声明式 Visualizer 构建与注册
// ==========================================

const { template, Visualizer } = createDeclarativeVisualizer<any>({
  id: 'min-path-sum',
  name: '最小路径和 (LeetCode 64)',
  category: 'dynamic-programming',
  badge: {
    mode: '二维网格 DP · 空间压缩',
    complexity: 'O(M×N) · O(min(M,N))',
  },
  card1Title: '🗺️ 网格地图实时探索与足迹',
  card2Title: '📈 动态规划状态推导表与向量',
  card2Desc: '展示从左上角到右下角的路径优化推导过程',
  legend: [
    { label: '当前网格', color: '#10b981' },
    { label: '已计算格子', color: '#3b82f6' },
    { label: '待探索格子', color: '#475569' },
  ],
  inputs: [
    {
      id: 'input-grid',
      label: '网格矩阵:',
      type: 'text',
      defaultValue: '[[1,3,1],[1,5,1],[4,2,1]]',
      width: '240px',
    },
  ],
  presets: [
    {
      label: 'LeetCode 样例 1 (3x3 Ans=7)',
      values: { 'input-grid': '[[1,3,1],[1,5,1],[4,2,1]]' },
    },
    {
      label: 'LeetCode 样例 2 (3x2 Ans=8)',
      values: { 'input-grid': '[[1,2,3],[4,5,6]]' },
    },
  ],
  metrics: [
    { id: 'metric-pos', label: '当前网格坐标', color: '#38bdf8' },
    { id: 'metric-val', label: '当前路径和 / 权值', color: '#10b981' },
    { id: 'metric-space', label: '空间占用', color: '#f59e0b' },
  ],
  codeLanguages: DP_067_PROBLEMS['min-path-sum'].codeLanguages,
  problemHtml: DP_067_PROBLEMS['min-path-sum'].problemHtml,
  analysisHtml: DP_067_PROBLEMS['min-path-sum'].analysisHtml,
  defaultStage: 'stage-1',
  buildSteps: buildMinPathSumStage1Steps,

  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力递归',
      shortName: '递归',
      num: 1,
      timeBadge: 'O(2^(M+N))',
      theme: 'bg-blue',
      badge: {
        mode: '二维网格 · 暴力递归',
        complexity: 'O(2^(M+N)) · O(M+N) 栈深',
      },
      card1Title: '🌿 递归调用栈与坐标探查',
      card2Title: '🗺️ 原生网格与当前递归位置',
      legend: [
        { label: '当前探查 (i,j)', color: '#10b981' },
        { label: '已扫网格', color: '#0284c7' },
        { label: '未达网格', color: '#94a3b8' },
      ],
      codeLanguages: MIN_PATH_SUM_STAGE1_CODE_LANGUAGES,
      buildSteps: buildMinPathSumStage1Steps,
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
        renderGridMap(container, step.grid, step.i, step.j);
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
        mode: '二维网格 · 记忆化搜索',
        complexity: 'O(M×N) · O(M×N) 备忘录',
      },
      card1Title: '💾 备忘录缓存命中与剪枝率',
      card2Title: '🎯 2D 备忘录缓存矩阵 memo[i][j]',
      legend: [
        { label: '缓存命中 (Hit)', color: '#10b981' },
        { label: '未命中算值 (Miss)', color: '#ef4444' },
        { label: '未计算 (-1)', color: '#94a3b8' },
      ],
      codeLanguages: MIN_PATH_SUM_STAGE2_CODE_LANGUAGES,
      buildSteps: buildMinPathSumStage2Steps,
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
          '备忘录矩阵 memo[i][j]',
          step.memoGrid,
          step.i,
          step.j
        );
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: 严格二维表',
      shortName: '二维DP',
      num: 3,
      timeBadge: 'O(M×N)',
      theme: 'bg-emerald',
      badge: {
        mode: '二维网格 · 严格二维表递推',
        complexity: 'O(M×N) · O(M×N)',
      },
      card1Title: '📐 状态转移推导与前驱依赖',
      card2Title: '📊 严格二维状态依赖表 dp[i][j]',
      legend: [
        { label: '当前填表单元格', color: '#10b981' },
        { label: '上方前驱 [i-1][j]', color: '#6366f1' },
        { label: '左方前驱 [i][j-1]', color: '#0ea5e9' },
        { label: '已计算', color: '#64748b' },
      ],
      codeLanguages: MIN_PATH_SUM_STAGE3_CODE_LANGUAGES,
      buildSteps: buildMinPathSumStage3Steps,
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
      name: '阶段 4: 空间压缩',
      shortName: '空间优化',
      num: 4,
      timeBadge: 'O(min(M,N)) 空间',
      theme: 'bg-amber',
      badge: {
        mode: '二维网格 · 空间压缩一维滚动',
        complexity: 'O(M×N) · O(N) 空间',
      },
      card1Title: '🗺️ 原生网格动态足迹与最优路径',
      card2Title: '📈 动态规划一维压缩向量 dp[j]',
      legend: [
        { label: '当前处理网格', color: '#10b981' },
        { label: '当前更新 dp[j]', color: '#f59e0b' },
        { label: '历史一维值', color: '#0284c7' },
      ],
      codeLanguages: MIN_PATH_SUM_STAGE4_CODE_LANGUAGES,
      buildSteps: buildMinPathSumStage4Steps,
      renderCanvas: (container, step) => {
        renderGridMap(container, step.grid, step.curI, step.curJ);
      },
      renderCustomMetrics: (container, step) => {
        renderSpaceOptCard2(
          container,
          `一维滚动压缩向量 dp[0..${step.dp.length - 1}]`,
          step.dp,
          step.curJ
        );
      },
    },
  ],
  renderCanvas: (container, step) => {
    renderGridMap(container, step.grid, step.curI, step.curJ);
  },
  renderCustomMetrics: (container, step) => {
    renderSpaceOptCard2(
      container,
      `一维滚动压缩向量 dp[0..${step.dp.length - 1}]`,
      step.dp,
      step.curJ
    );
  },
});

function renderGridMap(
  container: HTMLElement,
  grid: number[][],
  activeI: number,
  activeJ: number
): void {
  if (!container) return;
  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  const cellsHtml = grid.map((row, r) => {
    const tds = row.map((val, c) => {
      const isCur = r === activeI && c === activeJ;
      const isPassed = r <= activeI && c <= activeJ;

      let bg = '#ffffff';
      let border = '1px solid #e2e8f0';
      let textCol = '#475569';
      let shadow = 'none';

      if (isCur) {
        bg = '#dcfce7';
        border = '2px solid #16a34a';
        textCol = '#166534';
        shadow = '0 2px 6px rgba(22, 163, 74, 0.15)';
      } else if (isPassed) {
        bg = '#f0f9ff';
        border = '1.5px solid #bae6fd';
        textCol = '#0369a1';
      }

      return `
        <td style="
          padding: 8px 14px;
          text-align: center;
          font-family: monospace;
          font-size: 14px;
          font-weight: 700;
          background: ${bg};
          color: ${textCol};
          border: ${border};
          box-shadow: ${shadow};
          border-radius: 8px;
          transition: all 0.2s ease;
        ">
          <div>${val}</div>
          <div style="font-size: 10px; font-weight: 500; color: ${isCur ? '#15803d' : isPassed ? '#0284c7' : '#94a3b8'}; margin-top: 2px;">(${r},${c})</div>
        </td>
      `;
    }).join('');

    return `<tr>${tds}</tr>`;
  }).join('');

  container.innerHTML = `
    <div style="
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 10px;
      box-sizing: border-box;
      overflow: auto;
    ">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 12px; font-weight: 700; color: #334155;">网格尺寸: ${rows} × ${cols}</span>
        <span style="font-size: 11px; color: #0284c7; background: #e0f2fe; padding: 2px 8px; border-radius: 9999px; font-family: monospace; font-weight: 700;">当前游标: (${activeI}, ${activeJ})</span>
      </div>
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; overflow: auto;">
        <table style="border-spacing: 8px; border-collapse: separate;">
          <tbody>
            ${cellsHtml}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export const MinPathSumVisualizer = Visualizer;

registerAlgorithm({
  id: 'min-path-sum',
  name: '最小路径和 (LeetCode 64)',
  viewId: 'algo-min-path-sum-view',
  category: 'dynamic-programming',
  description: '左程云算法讲解067 Code01：LeetCode 64 最小路径和，从递归到二维DP与空间压缩完整演化',
  icon: '📉',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 101,
  learningGoal: '掌握二维网格DP的递归抽象、状态转移方程推导及一维滚动数组空间压缩技巧',
});
