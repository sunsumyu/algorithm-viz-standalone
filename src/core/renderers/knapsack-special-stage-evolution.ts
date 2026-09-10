/**
 * 背包扩展题型四阶段演化引擎与渲染模块 (KnapsackSpecialStageEvolution)
 * 适配：
 * 1. 购买足量干草的最小花费 (洛谷 P2918 - 完全背包允许超额)
 * 2. 从栈中取出K个硬币的最大面值和 (LeetCode 2218 - 前缀和转化分组背包)
 * 
 * 核心准则：
 * - 每一行代码执行都有确定的单步映射 (逐行高亮)
 * - 4-Card 响应式自适应布局 (flex: 1, min-height: 0)
 * - 阶段 1: 暴力递归 (递归展开树、调用栈、重叠子问题监控)
 * - 阶段 2: 记忆化搜索 (备忘录缓存 Hit/Miss 追踪器、2D 缓存热力表)
 * - 阶段 3: 严格位置依赖二维 DP (严格自底向上填表，单元格依赖高亮)
 * - 阶段 4: 一维空间压缩/斜率优化 (已有高精沙盘)
 */

import { HighlightTarget } from './dark-code-terminal-presenter';
import { type RecursionStepBase, type MemoStepBase } from '../step-types';
import { getSpecialKnapsackAnchor } from './knapsack-special-stage-codes';

// ==========================================
// 1. 购买足量干草 (Buying Hay) 数据结构与步骤生成器
// ==========================================

export interface BuyingHayRecursionStep extends RecursionStepBase<{ i: number; remH: number; label: string }> {
  i: number;
  remH: number;
  h: number;
  cost: number[];
  val: number[];
}

export function buildBuyingHayRecursionSteps(
  h: number,
  cost: number[],
  val: number[]
): BuyingHayRecursionStep[] {
  const steps: BuyingHayRecursionStep[] = [];
  const n = cost.length;
  const INF = 1_000_000_000;
  const callStack: Array<{ i: number; remH: number; label: string }> = [];

  const resolveLine = (anchor: string) => getSpecialKnapsackAnchor(1, 'buying-hay', anchor);

  const pushStep = (
    action: string,
    lineKey: string,
    i: number,
    remH: number,
    msg: string,
    decision: string,
    retVal?: number
  ) => {
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: resolveLine(lineKey),
      i,
      remH,
      h,
      cost,
      val,
      callStack: [...callStack],
      decision,
      message: msg,
      log: `[递归] (i=${i}, remH=${remH}) ${action}: ${msg}`,
      returnValue: retVal,
      metrics: {
        'metric-cur-state': `dfs(i=${i}, remH=${remH})`,
        'metric-stack-depth': `${callStack.length} 层`,
        'metric-cur-supplier': i < n ? `供货商 #${i + 1} (${cost[i]}元/${val[i]}磅)` : '无更多供应商',
        'metric-rem-weight': remH <= 0 ? `已达标 (超额 ${-remH} 磅)` : `还差 ${remH} 磅`,
      },
    });
  };

  pushStep('callRoot', 'callRoot', 0, h, `🚀 启动干草采购暴力递归：dfs(i=0, remH=${h})`, '从首家供货商开始');

  function dfs(i: number, remH: number): number {
    callStack.push({ i, remH, label: `dfs(${i}, ${remH})` });
    pushStep('fnEnter', 'fnEnter', i, remH, `⚡ 进入 dfs(i=${i}, remH=${remH})，剩余需求 ${remH} 磅`, `考察供货商 #${i + 1}`);

    // 基底 1: 需求已达标
    if (remH <= 0) {
      pushStep(
        'baseCheckSatisfied',
        'baseCheckSatisfied',
        i,
        remH,
        `✅ 磅数已达标 (remH=${remH} <= 0)，无需再购买，花费 0 元`,
        '达标基底 (花费 0)',
        0
      );
      callStack.pop();
      return 0;
    }

    // 基底 2: 供货商已耗尽
    if (i === n) {
      pushStep(
        'baseCheckExhausted',
        'baseCheckExhausted',
        i,
        remH,
        `❌ 全部供应商已考察完毕但仍欠缺 ${remH} 磅，方案不可行，返回 INF`,
        '耗尽基底 (不可行)',
        INF
      );
      callStack.pop();
      return INF;
    }

    // 分支 1: 不买当前第 i 家
    pushStep('branchNoPick', 'branchNoPick', i, remH, `🌿 分支 1：放弃供货商 #${i + 1}，转向下一家 dfs(${i + 1}, ${remH})`, '不买当前家');
    const p1 = dfs(i + 1, remH);

    // 分支 2: 买 1 包当前第 i 家 (完全背包同层递推)
    pushStep(
      'branchPick',
      'branchPick',
      i,
      remH,
      `🌿 分支 2：购买 1 包供货商 #${i + 1} (${val[i]} 磅)，花费 ${cost[i]} 元，继续允许购买 dfs(${i}, ${remH - val[i]})`,
      '买 1 包当前家'
    );
    const p2 = dfs(i, remH - val[i]) + cost[i];

    const ans = Math.min(p1, p2);
    pushStep(
      'returnMin',
      'returnMin',
      i,
      remH,
      `🏁 比较两路决策：不买=${p1 >= INF ? 'INF' : p1 + '元'} vs 购买=${p2 >= INF ? 'INF' : p2 + '元'} -> 优选 ${ans >= INF ? 'INF' : ans + '元'}`,
      ans >= INF ? '两路均不可行' : `最优花费 ${ans} 元`,
      ans
    );
    callStack.pop();
    return ans;
  }

  dfs(0, h);
  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

export interface BuyingHayMemoStep extends MemoStepBase {
  remH: number;
  h: number;
  cost: number[];
  val: number[];
  memo: number[][];
  cacheHit: boolean;
}

export function buildBuyingHayMemoSteps(
  h: number,
  cost: number[],
  val: number[]
): BuyingHayMemoStep[] {
  const steps: BuyingHayMemoStep[] = [];
  const n = cost.length;
  const INF = 1_000_000_000;
  const memo: number[][] = Array.from({ length: n }, () => new Array(h + 1).fill(-1));
  let hitCount = 0;
  let missCount = 0;

  const resolveLine = (anchor: string) => getSpecialKnapsackAnchor(2, 'buying-hay', anchor);

  const pushStep = (
    action: string,
    lineKey: string,
    i: number,
    remH: number,
    isHit: boolean,
    msg: string,
    decision: string
  ) => {
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: resolveLine(lineKey),
      i,
      remH,
      h,
      cost,
      val,
      memo: memo.map((r) => [...r]),
      cacheHit: isHit,
      hitCount,
      missCount,
      decision,
      message: msg,
      log: `[记忆化] (i=${i}, remH=${remH}) ${action}: ${msg}`,
      metrics: {
        'metric-cur-state': `memo[${i >= 0 ? i : '—'}][${remH >= 0 ? remH : '—'}]`,
        'metric-hit-rate': `${hitCount + missCount > 0 ? ((hitCount / (hitCount + missCount)) * 100).toFixed(1) : '0'}%`,
        'metric-cache-hits': `${hitCount} 次`,
        'metric-cache-miss': `${missCount} 次`,
      },
    });
  };

  pushStep('memoInit', 'memoInit', -1, -1, false, `🚀 初始化备忘录 memo[${n}][${h + 1}]，初始置 -1 (未访问)`, '建立备忘录缓存');

  function dfsMemo(i: number, remH: number): number {
    if (remH <= 0) return 0;
    if (i === n) return INF;

    pushStep('fnEnter', 'fnEnter', i, remH, false, `⚡ 进入 dfsMemo(i=${i}, remH=${remH})`, '探查备忘录缓存');

    if (memo[i][remH] !== -1) {
      hitCount++;
      const cached = memo[i][remH];
      pushStep(
        'memoCheck',
        'memoCheck',
        i,
        remH,
        true,
        `🎯 命中缓存！memo[${i}][${remH}] 已有结果 ${cached >= INF ? 'INF' : cached + '元'}，立即剪枝返回！`,
        'Cache Hit'
      );
      return cached;
    }

    missCount++;
    pushStep('memoCheck', 'memoCheck', i, remH, false, `💨 缓存未命中：memo[${i}][${remH}] === -1，准备递归求解`, 'Cache Miss');

    const p1 = dfsMemo(i + 1, remH);
    const p2 = dfsMemo(i, remH - val[i]) + cost[i];
    const ans = Math.min(p1, p2);

    memo[i][remH] = ans;
    pushStep(
      'memoStore',
      'memoStore',
      i,
      remH,
      false,
      `💾 存入备忘录：memo[${i}][${remH}] = ${ans >= INF ? 'INF' : ans + '元'}，后续同状态直接复用`,
      '写入缓存'
    );
    return ans;
  }

  dfsMemo(0, h);
  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

export interface BuyingHay2DStep {
  stepIndex: number;
  totalSteps: number;
  action: string;
  codeLine: HighlightTarget;
  i: number;
  j: number;
  h: number;
  m: number;
  dp: number[][];
  depCells: Array<{ r: number; c: number; label: string; val: number }>;
  decision: string;
  message: string;
  log: string;
  metrics: Record<string, string>;
}

export function buildBuyingHay2DSteps(
  h: number,
  cost: number[],
  val: number[]
): BuyingHay2DStep[] {
  const steps: BuyingHay2DStep[] = [];
  const n = cost.length;
  const maxv = Math.max(...val);
  const m = h + maxv;
  const INF = 1_000_000_000;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(INF));

  const resolveLine = (anchor: string) => getSpecialKnapsackAnchor(3, 'buying-hay', anchor);

  const pushStep = (
    action: string,
    lineKey: string,
    i: number,
    j: number,
    depCells: Array<{ r: number; c: number; label: string; val: number }>,
    msg: string,
    decision: string
  ) => {
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: resolveLine(lineKey),
      i,
      j,
      h,
      m,
      dp: dp.map((r) => [...r]),
      depCells,
      decision,
      message: msg,
      log: `[二维DP] (i=${i}, j=${j}) ${action}: ${msg}`,
      metrics: {
        'metric-cur-cell': `dp[${i >= 0 ? i : '—'}][${j >= 0 ? j : '—'}]`,
        'metric-cell-val': i >= 0 && j >= 0 ? (dp[i][j] >= INF ? 'INF' : `${dp[i][j]} 元`) : '—',
        'metric-target-h': `${h} 磅 (上限 ${m} 磅)`,
      },
    });
  };

  pushStep('initDp', 'initDp', -1, -1, [], `🚀 初始化二维 DP 数组：dp[${n + 1}][${m + 1}] 全部置为 INF`, '初始化 DP 矩阵');
  dp[0][0] = 0;
  pushStep('baseZero', 'baseZero', 0, 0, [], `✨ 基底：0 个供应商凑 0 磅花费 0 元，dp[0][0] = 0`, '基底赋值');

  for (let i = 1; i <= n; i++) {
    const c = cost[i - 1], v = val[i - 1];
    pushStep('outerLoop', 'outerLoop', i, -1, [], `🔄 考察供货商 #${i}：售价 ${c} 元，单包 ${v} 磅`, `供货商 #${i}`);

    for (let j = 0; j <= m; j++) {
      dp[i][j] = dp[i - 1][j];
      const noPickDep = { r: i - 1, c: j, label: `不选(dp[${i - 1}][${j}])`, val: dp[i - 1][j] };

      if (j >= v && dp[i][j - v] !== INF) {
        const pickCandidate = dp[i][j - v] + c;
        const pickDep = { r: i, c: j - v, label: `选购(dp[${i}][${j - v}]+${c})`, val: pickCandidate };
        const updated = pickCandidate < dp[i][j];
        dp[i][j] = Math.min(dp[i][j], pickCandidate);

        pushStep(
          'transition',
          'transition',
          i,
          j,
          [noPickDep, pickDep],
          `⚖️ 比较转移：不买=${noPickDep.val >= INF ? 'INF' : noPickDep.val + '元'} vs 选购=${pickCandidate} 元 -> dp[${i}][${j}] = ${dp[i][j]} 元`,
          updated ? '选购成功降低花费' : '保持上一行最优'
        );
      } else {
        pushStep(
          'transition',
          'transition',
          i,
          j,
          [noPickDep],
          `⚖️ 无法选购 (容量 j=${j} < ${v} 或前驱不可达)，继承上一行 dp[${i - 1}][${j}] = ${dp[i][j] >= INF ? 'INF' : dp[i][j] + '元'}`,
          '继承上一行'
        );
      }
    }
  }

  // 找答案
  let ans = INF;
  let bestJ = h;
  for (let j = h; j <= m; j++) {
    if (dp[n][j] < ans) {
      ans = dp[n][j];
      bestJ = j;
    }
  }

  pushStep(
    'returnAns',
    'returnAns',
    n,
    bestJ,
    [],
    `🎉 二维填表完成！在 [H=${h}, m=${m}] 区间寻找全局最小花费：达到 ${bestJ} 磅时花费最少，ans = ${ans} 元！`,
    `全局最低花费 ${ans} 元`
  );

  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

// ==========================================
// 2. 从栈中取出K个硬币 (Coins From Piles) 步骤生成器
// ==========================================

export interface CoinsFromPilesRecursionStep extends RecursionStepBase<{ i: number; remK: number; label: string }> {
  i: number;
  remK: number;
  k: number;
  piles: number[][];
}

export function buildCoinsFromPilesRecursionSteps(
  piles: number[][],
  k: number
): CoinsFromPilesRecursionStep[] {
  const steps: CoinsFromPilesRecursionStep[] = [];
  const n = piles.length;
  const callStack: Array<{ i: number; remK: number; label: string }> = [];

  const resolveLine = (anchor: string) => getSpecialKnapsackAnchor(1, 'coins-from-piles', anchor);

  const pushStep = (
    action: string,
    lineKey: string,
    i: number,
    remK: number,
    msg: string,
    decision: string,
    retVal?: number
  ) => {
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: resolveLine(lineKey),
      i,
      remK,
      k,
      piles,
      callStack: [...callStack],
      decision,
      message: msg,
      log: `[递归] (pile=${i}, remK=${remK}) ${action}: ${msg}`,
      returnValue: retVal,
      metrics: {
        'metric-cur-state': `dfs(i=${i}, remK=${remK})`,
        'metric-stack-depth': `${callStack.length} 层`,
        'metric-cur-pile': i < n ? `硬币栈 #${i + 1} (${piles[i].length}枚)` : '栈已耗尽',
        'metric-rem-k': `还需拿取 ${remK} 枚`,
      },
    });
  };

  pushStep('callRoot', 'callRoot', 0, k, `🚀 启动硬币挑选暴力递归：dfs(i=0, remK=${k})`, '从首个硬币栈探索');

  function dfs(i: number, remK: number): number {
    callStack.push({ i, remK, label: `dfs(${i}, ${remK})` });
    pushStep('fnEnter', 'fnEnter', i, remK, `⚡ 进入 dfs(i=${i}, remK=${remK})，剩余需取 ${remK} 枚`, `考察栈 #${i + 1}`);

    if (i === n || remK === 0) {
      pushStep('baseCheck', 'baseCheck', i, remK, `✅ 基础条件满足 (栈已完或 remK=0)，返回收益 0`, 'Base Case 0', 0);
      callStack.pop();
      return 0;
    }

    // 分支 0: 当前栈拿 0 枚
    pushStep('branch0', 'branch0', i, remK, `🌿 组内互斥分支 0：从栈 #${i + 1} 拿 0 枚，直接看下一栈 dfs(${i + 1}, ${remK})`, '拿 0 枚');
    let maxVal = dfs(i + 1, remK);

    // 分支 c: 当前栈拿 c 枚 (1..min(len, remK))
    let sum = 0;
    const t = Math.min(piles[i].length, remK);
    for (let c = 1; c <= t; c++) {
      sum += piles[i][c - 1];
      pushStep(
        'loopCoins',
        'loopCoins',
        i,
        remK,
        `🪙 组内互斥分支 ${c}：从栈 #${i + 1} 拿 ${c} 枚 (累计面值 ${sum})，余量 ${remK - c} 转入 dfs(${i + 1}, ${remK - c})`,
        `拿取 ${c} 枚`
      );
      const sub = dfs(i + 1, remK - c) + sum;
      maxVal = Math.max(maxVal, sub);
    }

    pushStep('returnMax', 'returnMax', i, remK, `🏁 栈 #${i + 1} 互斥选择完毕，该状态最高可得面值 ${maxVal}！`, `最优面值 ${maxVal}`, maxVal);
    callStack.pop();
    return maxVal;
  }

  dfs(0, k);
  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

export interface CoinsFromPilesMemoStep extends MemoStepBase {
  remK: number;
  k: number;
  piles: number[][];
  memo: number[][];
  cacheHit: boolean;
}

export function buildCoinsFromPilesMemoSteps(
  piles: number[][],
  k: number
): CoinsFromPilesMemoStep[] {
  const steps: CoinsFromPilesMemoStep[] = [];
  const n = piles.length;
  const memo: number[][] = Array.from({ length: n }, () => new Array(k + 1).fill(-1));
  let hitCount = 0;
  let missCount = 0;

  const resolveLine = (anchor: string) => getSpecialKnapsackAnchor(2, 'coins-from-piles', anchor);

  const pushStep = (
    action: string,
    lineKey: string,
    i: number,
    remK: number,
    isHit: boolean,
    msg: string,
    decision: string
  ) => {
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: resolveLine(lineKey),
      i,
      remK,
      k,
      piles,
      memo: memo.map((r) => [...r]),
      cacheHit: isHit,
      hitCount,
      missCount,
      decision,
      message: msg,
      log: `[记忆化] (i=${i}, remK=${remK}) ${action}: ${msg}`,
      metrics: {
        'metric-cur-state': `memo[${i >= 0 ? i : '—'}][${remK >= 0 ? remK : '—'}]`,
        'metric-hit-rate': `${hitCount + missCount > 0 ? ((hitCount / (hitCount + missCount)) * 100).toFixed(1) : '0'}%`,
        'metric-cache-hits': `${hitCount} 次`,
        'metric-cache-miss': `${missCount} 次`,
      },
    });
  };

  pushStep('memoInit', 'memoInit', -1, -1, false, `🚀 初始化备忘录 memo[${n}][${k + 1}]，初始填充 -1`, '建立缓存');

  function dfsMemo(i: number, remK: number): number {
    if (i === n || remK === 0) return 0;
    pushStep('fnEnter', 'fnEnter', i, remK, false, `⚡ 进入 dfsMemo(i=${i}, remK=${remK})`, '探查备忘录');

    if (memo[i][remK] !== -1) {
      hitCount++;
      const cached = memo[i][remK];
      pushStep('memoCheck', 'memoCheck', i, remK, true, `🎯 命中缓存！memo[${i}][${remK}] = ${cached}，立即剪枝返回！`, 'Cache Hit');
      return cached;
    }

    missCount++;
    pushStep('memoCheck', 'memoCheck', i, remK, false, `💨 缓存未命中：memo[${i}][${remK}] === -1，展开组内互斥尝试`, 'Cache Miss');

    let maxVal = dfsMemo(i + 1, remK);
    let sum = 0;
    const t = Math.min(piles[i].length, remK);
    for (let c = 1; c <= t; c++) {
      sum += piles[i][c - 1];
      maxVal = Math.max(maxVal, dfsMemo(i + 1, remK - c) + sum);
    }

    memo[i][remK] = maxVal;
    pushStep('memoStore', 'memoStore', i, remK, false, `💾 写入备忘录：memo[${i}][${remK}] = ${maxVal}，供后续剪枝`, '写入缓存');
    return maxVal;
  }

  dfsMemo(0, k);
  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

export interface CoinsFromPiles2DStep {
  stepIndex: number;
  totalSteps: number;
  action: string;
  codeLine: HighlightTarget;
  i: number;
  j: number;
  k: number;
  dp: number[][];
  preSum: number[];
  depCells: Array<{ r: number; c: number; label: string; val: number }>;
  decision: string;
  message: string;
  log: string;
  metrics: Record<string, string>;
}

export function buildCoinsFromPiles2DSteps(
  piles: number[][],
  k: number
): CoinsFromPiles2DStep[] {
  const steps: CoinsFromPiles2DStep[] = [];
  const n = piles.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(k + 1).fill(0));

  const resolveLine = (anchor: string) => getSpecialKnapsackAnchor(3, 'coins-from-piles', anchor);

  const pushStep = (
    action: string,
    lineKey: string,
    i: number,
    j: number,
    preSum: number[],
    depCells: Array<{ r: number; c: number; label: string; val: number }>,
    msg: string,
    decision: string
  ) => {
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: resolveLine(lineKey),
      i,
      j,
      k,
      dp: dp.map((r) => [...r]),
      preSum: [...preSum],
      depCells,
      decision,
      message: msg,
      log: `[二维DP] (i=${i}, j=${j}) ${action}: ${msg}`,
      metrics: {
        'metric-cur-cell': `dp[${i >= 0 ? i : '—'}][${j >= 0 ? j : '—'}]`,
        'metric-cell-val': i >= 0 && j >= 0 ? `${dp[i][j]}` : '—',
        'metric-target-k': `总容量 K = ${k}`,
      },
    });
  };

  pushStep('initDp', 'initDp', -1, -1, [], [], `🚀 初始化严格二维 DP 矩阵：dp[${n + 1}][${k + 1}] 全部为 0`, '初始化 DP 矩阵');

  for (let i = 1; i <= n; i++) {
    const pile = piles[i - 1];
    const t = Math.min(pile.length, k);
    const preSum = new Array(t + 1).fill(0);
    for (let p = 0; p < t; p++) preSum[p + 1] = preSum[p] + pile[p];

    pushStep('outerLoop', 'outerLoop', i, -1, preSum, [], `🔄 考察硬币栈 #${i}：前缀和预处理 preSum[0..${t}]`, `考察硬币栈 #${i}`);

    for (let j = 0; j <= k; j++) {
      dp[i][j] = dp[i - 1][j]; // 拿 0 枚
      const noPickDep = { r: i - 1, c: j, label: `拿0枚(dp[${i - 1}][${j}])`, val: dp[i - 1][j] };

      let bestCandidate = dp[i][j];
      let bestPickDep = noPickDep;

      for (let c = 1; c <= Math.min(t, j); c++) {
        const candidate = dp[i - 1][j - c] + preSum[c];
        if (candidate > bestCandidate) {
          bestCandidate = candidate;
          bestPickDep = { r: i - 1, c: j - c, label: `拿${c}枚(dp[${i - 1}][${j - c}]+${preSum[c]})`, val: candidate };
        }
      }

      dp[i][j] = bestCandidate;
      pushStep(
        'transition',
        'transition',
        i,
        j,
        preSum,
        [noPickDep, bestPickDep],
        `🪙 容量 j=${j}：组内互斥比较结果 dp[${i}][${j}] = ${bestCandidate} (优选${bestPickDep.label})`,
        bestCandidate > noPickDep.val ? '选入硬币增加面值' : '保持上一行'
      );
    }
  }

  pushStep('returnAns', 'returnAns', n, k, [], [], `🎉 二维 DP 递推完成！考虑全部 ${n} 个栈在容量限制 ${k} 下，最大面值为 dp[${n}][${k}] = ${dp[n][k]}！`, `最终最大面值 ${dp[n][k]}`);

  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

// ==========================================
// 3. 通用渲染组件 (针对 Buying Hay & Coins From Piles & 混合背包)
// ==========================================

export function renderSpecialRecursionCard1(
  container: HTMLElement,
  title: string,
  callStack: Array<{ label: string }>,
  customInfoHtml: string
): void {
  const stackHtml = callStack
    .map((frame, idx) => {
      const isTop = idx === callStack.length - 1;
      return `
        <div style="background:${isTop ? '#eff6ff' : '#f8fafc'}; border:1px solid ${isTop ? '#93c5fd' : '#e2e8f0'}; border-radius:8px; padding:6px 12px; display:flex; justify-content:space-between; align-items:center; transition:all 0.15s ease;">
          <span style="font-family:'JetBrains Mono', monospace; font-size:11.5px; color:${isTop ? '#1d4ed8' : '#334155'}; font-weight:${isTop ? '800' : '600'};">
            #${idx} ${frame.label}
          </span>
          <span style="font-size:10.5px; font-weight:600; color:${isTop ? '#2563eb' : '#94a3b8'}; background:${isTop ? '#dbeafe' : 'transparent'}; padding:${isTop ? '2px 6px' : '0'}; border-radius:4px;">
            ${isTop ? '⚡ 当前执行帧' : '等待返回'}
          </span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:8px; height:100%; width:100%; box-sizing:border-box;">
      ${customInfoHtml}
      <div style="flex:1; min-height:0; display:flex; flex-direction:column; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:10px 12px; box-shadow:0 1px 2px rgba(0,0,0,0.03); overflow:hidden;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-shrink:0;">
          <span style="font-size:12px; font-weight:700; color:#0f172a;">📚 运行时调用栈 (${title})</span>
          <span style="font-size:11px; font-weight:600; color:#64748b; background:#f1f5f9; padding:2px 8px; border-radius:9999px;">深度: ${callStack.length} 层</span>
        </div>
        <div style="flex:1; min-height:0; overflow-y:auto; display:flex; flex-direction:column-reverse; gap:5px; padding-right:4px;">
          ${stackHtml || '<div style="color:#94a3b8; font-size:11px; text-align:center; padding:20px 0;">栈为空</div>'}
        </div>
      </div>
    </div>
  `;
}

export function renderSpecialMemoCard1(
  container: HTMLElement,
  stateStr: string,
  cacheHit: boolean,
  param4: string | number,
  param5?: string | number,
  param6?: number | string,
  param7?: number | string,
  cachedVal?: number
): void {
  let decision = '';
  let message = '';
  let hitCount = 0;
  let missCount = 0;

  if (typeof param4 === 'string') {
    decision = param4;
    message = typeof param5 === 'string' ? param5 : '';
    hitCount = typeof param6 === 'number' ? param6 : 0;
    missCount = typeof param7 === 'number' ? param7 : 0;
  } else {
    hitCount = typeof param4 === 'number' ? param4 : 0;
    missCount = typeof param5 === 'number' ? Number(param5) : 0;
    decision = typeof param6 === 'string' ? param6 : '';
    message = typeof param7 === 'string' ? param7 : '';
  }

  const totalChecks = hitCount + missCount;
  const hitRate = totalChecks > 0 ? ((hitCount / totalChecks) * 100).toFixed(0) : '0';

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:8px; height:100%; width:100%; box-sizing:border-box;">
      <div style="background:#ffffff; border:1px solid ${
        cacheHit ? '#86efac' : '#e2e8f0'
      }; border-radius:12px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
        <div>
          <div style="font-size:11px; color:#64748b; font-weight:600; margin-bottom:2px;">当前探查状态</div>
          <div style="font-family:'JetBrains Mono', monospace; font-size:15px; font-weight:800; color:#0f172a;">
            ${stateStr}
          </div>
        </div>
        <div style="padding:5px 12px; border-radius:8px; font-size:12px; font-weight:700; ${
          cacheHit
            ? 'background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0;'
            : 'background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe;'
        }">
          ${cacheHit ? '⚡ CACHE HIT (直接剪枝)' : '💨 CACHE MISS (递归求解)'}
        </div>
      </div>

      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:4px; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
        <div style="font-size:11px; color:#64748b; font-weight:700;">决策说明</div>
        <div style="font-size:13px; font-weight:700; color:#0f172a;">${decision}</div>
        <div style="font-size:11.5px; color:#475569; line-height:1.5;">${message}</div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-top:auto;">
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:10px; text-align:center;">
          <div style="font-size:11px; color:#64748b; font-weight:600;">缓存命中</div>
          <div style="font-size:18px; font-weight:800; color:#16a34a; margin-top:2px;">${hitCount}</div>
        </div>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:10px; text-align:center;">
          <div style="font-size:11px; color:#64748b; font-weight:600;">实际求解</div>
          <div style="font-size:18px; font-weight:800; color:#2563eb; margin-top:2px;">${missCount}</div>
        </div>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:10px; text-align:center;">
          <div style="font-size:11px; color:#64748b; font-weight:600;">剪枝率</div>
          <div style="font-size:18px; font-weight:800; color:#d97706; margin-top:2px;">
            ${hitRate}%
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderSpecialMemoCard2(
  container: HTMLElement,
  title: string,
  memo: number[][],
  curI: number,
  curJ: number,
  isHit: boolean = false
): void {
  const rows = memo?.length || 0;
  const cols = memo?.[0]?.length || 0;

  let tableHtml = '<table style="border-collapse:collapse; width:100%; font-family:\'JetBrains Mono\', monospace; font-size:11px;">';
  tableHtml += '<thead><tr><th style="padding:6px; color:#64748b; border:1px solid #e2e8f0; background:#f8fafc; font-weight:700;">i \\ j</th>';
  for (let j = 0; j < cols; j++) {
    const isColActive = j === curJ;
    tableHtml += `<th style="padding:6px; color:${isColActive ? '#d97706' : '#64748b'}; border:1px solid #e2e8f0; background:${
      isColActive ? '#fef3c7' : '#f8fafc'
    }; font-weight:700;">${j}</th>`;
  }
  tableHtml += '</tr></thead><tbody>';

  for (let i = 0; i < rows; i++) {
    const isRowActive = i === curI;
    tableHtml += `<tr><td style="padding:6px; color:${isRowActive ? '#2563eb' : '#64748b'}; border:1px solid #e2e8f0; background:${
      isRowActive ? '#eff6ff' : '#f8fafc'
    }; font-weight:700; text-align:center;">#${i + 1}</td>`;
    for (let j = 0; j < cols; j++) {
      const val = memo[i][j];
      const isCur = i === curI && j === curJ;
      let bg = '#ffffff';
      let textColor = '#cbd5e1';
      let text = '·';
      let border = '#e2e8f0';

      if (val !== -1) {
        bg = '#f0fdf4';
        textColor = '#16a34a';
        text = val >= 1_000_000_000 ? 'INF' : `${val}`;
      }
      if (isCur) {
        bg = isHit ? '#dcfce7' : '#dbeafe';
        border = isHit ? '#16a34a' : '#2563eb';
        textColor = isHit ? '#15803d' : '#1d4ed8';
      }

      tableHtml += `<td style="padding:6px; text-align:center; border:1px solid ${border}; background:${bg}; color:${textColor}; font-weight:${isCur || val !== -1 ? 700 : 400};">${text}</td>`;
    }
    tableHtml += '</tr>';
  }
  tableHtml += '</tbody></table>';

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; height:100%; width:100%; box-sizing:border-box;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; flex-shrink:0;">
        <span style="font-size:12px; font-weight:700; color:#0f172a;">🎯 ${title}</span>
        <span style="font-size:11px; color:#64748b;">· = 未探查, 数值 = 缓存结果</span>
      </div>
      <div style="flex:1; min-height:0; overflow:auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:6px; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
        ${tableHtml}
      </div>
    </div>
  `;
}

export function renderSpecial2DCard1(
  container: HTMLElement,
  cellName: string,
  cellValStr: string,
  depCells: Array<{ label: string; val: number }>,
  decision: string,
  message: string
): void {
  const depsHtml =
    depCells.length === 0
      ? '<div style="color:#94a3b8; font-size:11px;">无前驱依赖（基底直接赋值）</div>'
      : depCells
          .map(
            (dep) => `
        <div style="display:inline-flex; align-items:center; gap:6px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:4px 8px; font-family:'JetBrains Mono', monospace; font-size:11px;">
          <span style="color:#64748b;">${dep.label}:</span>
          <span style="color:#16a34a; font-weight:700;">${dep.val >= 1_000_000_000 ? 'INF' : dep.val}</span>
        </div>
      `
          )
          .join(' ');

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:8px; height:100%; width:100%; box-sizing:border-box;">
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
        <div>
          <div style="font-size:11px; color:#64748b; font-weight:600;">当前递推单元格</div>
          <div style="font-family:'JetBrains Mono', monospace; font-size:17px; font-weight:800; color:#2563eb;">
            ${cellName}
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px; color:#64748b; font-weight:600;">单元格赋值结果</div>
          <div style="font-size:18px; font-weight:800; color:#16a34a;">
            ${cellValStr}
          </div>
        </div>
      </div>

      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:6px; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
        <div style="font-size:11px; color:#64748b; font-weight:700;">🔗 转移依赖来源</div>
        <div style="display:flex; flex-wrap:wrap; gap:6px;">
          ${depsHtml}
        </div>
      </div>

      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:4px; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
        <div style="font-size:11px; color:#64748b; font-weight:700;">递推说明</div>
        <div style="font-size:13px; font-weight:700; color:#0f172a;">${decision}</div>
        <div style="font-size:11.5px; color:#475569; line-height:1.5;">${message}</div>
      </div>
    </div>
  `;
}

export function renderSpecial2DCard2(
  container: HTMLElement,
  title: string,
  dp: number[][],
  curI: number,
  curJ: number,
  depCells: Array<{ r: number; c: number }>
): void {
  const rows = dp?.length || 0;
  const cols = dp?.[0]?.length || 0;

  let tableHtml = '<table style="border-collapse:collapse; width:100%; font-family:\'JetBrains Mono\', monospace; font-size:11px;">';
  tableHtml += '<thead><tr><th style="padding:6px; color:#64748b; border:1px solid #e2e8f0; background:#f8fafc; font-weight:700;">i \\ j</th>';
  for (let j = 0; j < cols; j++) {
    const isColActive = j === curJ;
    tableHtml += `<th style="padding:6px; color:${isColActive ? '#d97706' : '#64748b'}; border:1px solid #e2e8f0; background:${
      isColActive ? '#fef3c7' : '#f8fafc'
    }; font-weight:700;">${j}</th>`;
  }
  tableHtml += '</tr></thead><tbody>';

  for (let i = 0; i < rows; i++) {
    const isRowActive = i === curI;
    tableHtml += `<tr><td style="padding:6px; color:${isRowActive ? '#2563eb' : '#64748b'}; border:1px solid #e2e8f0; background:${
      isRowActive ? '#eff6ff' : '#f8fafc'
    }; font-weight:700; text-align:center;">#${i}</td>`;
    for (let j = 0; j < cols; j++) {
      const val = dp[i][j];
      const isCur = i === curI && j === curJ;
      const isDep = depCells.some((dep) => dep.r === i && dep.c === j);

      let bg = val >= 1_000_000_000 ? '#f8fafc' : '#ffffff';
      let textColor = val >= 1_000_000_000 ? '#94a3b8' : (val > 0 ? '#16a34a' : '#475569');
      let border = '#e2e8f0';

      if (isDep) {
        border = '#f59e0b';
        bg = '#fef3c7';
        textColor = '#b45309';
      }
      if (isCur) {
        border = '#2563eb';
        bg = '#dbeafe';
        textColor = '#1d4ed8';
      }

      const text = val >= 1_000_000_000 ? 'INF' : `${val}`;
      tableHtml += `<td style="padding:6px; text-align:center; border:1px solid ${border}; background:${bg}; color:${textColor}; font-weight:${
        isCur || isDep || (val < 1_000_000_000 && val > 0) ? 700 : 400
      };">${text}</td>`;
    }
    tableHtml += '</tr>';
  }
  tableHtml += '</tbody></table>';

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; height:100%; width:100%; box-sizing:border-box;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; flex-shrink:0;">
        <span style="font-size:12px; font-weight:700; color:#0f172a;">📐 ${title}</span>
        <span style="font-size:11px; color:#64748b;">
          <span style="display:inline-block; width:8px; height:8px; background:#2563eb; border-radius:2px; margin-right:4px;"></span>当前格
          <span style="display:inline-block; width:8px; height:8px; background:#f59e0b; border-radius:2px; margin-left:8px; margin-right:4px;"></span>依赖格
        </span>
      </div>
      <div style="flex:1; min-height:0; overflow:auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:6px; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
        ${tableHtml}
      </div>
    </div>
  `;
}
