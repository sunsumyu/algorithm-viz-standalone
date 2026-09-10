/**
 * 夏季特惠 (LeetCode LCP 51 / tJau2o) 四阶段演化推演引擎与四语言代码映射
 * 阶段 1: 暴力递归 (白赚贪心过滤后对普通游戏开展 01 背包暴力递归)
 * 阶段 2: 记忆化搜索 (备忘录 Cache Hit/Miss 追踪)
 * 阶段 3: 严格二维动态规划 (二维表格填表推导)
 * 阶段 4: 空间压缩 (白赚贪心收割 + 一维滚动数组逆序更新)
 */

import { HighlightTarget } from '../../../../core/code-panel';
import { BUY_GOODS_STAGE1_CODE_LANGUAGES, BUY_GOODS_STAGE2_CODE_LANGUAGES, BUY_GOODS_STAGE3_CODE_LANGUAGES } from './knapsack-073-templates';
import { getKnapsack073Anchor } from './knapsack-073-stage-codes';




// ==========================================
// 步骤推演生成器
// ==========================================

export function parseBuyGoodsNormalGames(initialBudget: number, a: number[], b: number[], w: number[]) {
  let greedyHappy = 0;
  let curBudget = initialBudget;
  const normalGames: { id: number; cost: number; val: number }[] = [];

  for (let i = 0; i < a.length; i++) {
    const well = a[i] - 2 * b[i];
    if (well >= 0) {
      greedyHappy += w[i];
      curBudget += well;
    } else {
      normalGames.push({ id: i + 1, cost: -well, val: w[i] });
    }
  }

  return { greedyHappy, curBudget, normalGames };
}

export function buildBuyGoodsRecursionSteps(initialBudget: number, a: number[], b: number[], w: number[], maxSteps = 800) {
  const { greedyHappy, curBudget, normalGames } = parseBuyGoodsNormalGames(initialBudget, a, b, w);
  const steps: any[] = [];
  const n = normalGames.length;
  const callStack: Array<{ i: number; rem: number; label: string }> = [];

  const resolveLine = (anchor: string) => getKnapsack073Anchor(1, 'buy-goods', anchor);

  const pushStep = (action: string, codeKey: string, i: number, rem: number, decision: string, message: string, retVal?: number) => {
    if (steps.length >= maxSteps) return;
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: resolveLine(codeKey),
      i,
      remCap: rem,
      n,
      normalGames: [...normalGames],
      callStack: [...callStack],
      decision,
      message,
      log: `[DFS] i=${i} remBudget=${rem} | ${action}: ${message}`,
      returnValue: retVal,
      metrics: {
        'metric-cur-state': i < n ? `dfs(i=${i}, rem=${rem})` : '边界触底',
        'metric-cur-game': i < n ? `游戏 #${normalGames[i].id} (花:${normalGames[i].cost}, 乐:${normalGames[i].val})` : '—',
        'metric-stack-depth': `${callStack.length}`,
      },
    });
  };

  pushStep('callRoot', 'callRoot', 0, curBudget, '贪心收割完毕，启动01递归', `🚀 贪心白嫖收割 ${greedyHappy} 快乐值，结余预算 ${curBudget}。共 ${n} 款普通游戏进入递归。`);

  function dfs(i: number, rem: number): number {
    if (steps.length >= maxSteps) return 0;
    const label = `dfs(i=${i}, rem=${rem})`;
    callStack.push({ i, rem, label });
    pushStep('fnEnter', 'fnEnter', i, rem, '进入栈帧', `📥 进入栈帧 ${label}。`);

    if (i === n || rem <= 0) {
      pushStep('baseCheck', 'baseCheck', i, rem, '触底终止', `🛑 边界触底 (i>=${n} 或 rem<=0)，返回 0。`);
      callStack.pop();
      return 0;
    }

    const g = normalGames[i];
    pushStep('baseCheck', 'baseCheck', i, rem, '考察游戏', `🔍 考察普通游戏 #${g.id} (花费:${g.cost}, 快乐:${g.val})，结余预算 rem=${rem}。`);

    const p1 = dfs(i + 1, rem);
    pushStep('branch1', 'branch1', i, rem, '分支 1: 不买当前游戏', `🌿 分支 1：不买游戏 #${g.id}，后续收益 = ${p1}。`);

    let p2 = 0;
    if (rem >= g.cost) {
      p2 = dfs(i + 1, rem - g.cost) + g.val;
      pushStep('branch2', 'branch2', i, rem, '分支 2: 购买当前游戏', `💎 分支 2：购买游戏 #${g.id} (花:${g.cost}, 乐:${g.val})，总快乐 = ${p2}。`);
    }

    const res = Math.max(p1, p2);
    pushStep('returnMax', 'returnMax', i, rem, `返回最优解 max(${p1}, ${p2}) = ${res}`, `📤 栈帧 ${label} 汇聚：返回两分支最优值 ${res}。`, res);
    callStack.pop();
    return res;
  }

  dfs(0, curBudget);
  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

export function buildBuyGoodsMemoSteps(initialBudget: number, a: number[], b: number[], w: number[], maxSteps = 800) {
  const { greedyHappy, curBudget, normalGames } = parseBuyGoodsNormalGames(initialBudget, a, b, w);
  const steps: any[] = [];
  const n = normalGames.length;
  const memo: (number | null)[][] = Array.from({ length: n + 1 }, () => new Array(curBudget + 1).fill(null));
  let hitCount = 0;
  let missCount = 0;

  const resolveLine = (anchor: string) => getKnapsack073Anchor(2, 'buy-goods', anchor);

  const pushStep = (action: string, codeKey: string, i: number, rem: number, memoHit: boolean, decision: string, message: string, cachedVal?: number) => {
    if (steps.length >= maxSteps) return;
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: resolveLine(codeKey),
      i,
      remCap: rem,
      memoHit,
      memoGrid: memo.map((row) => [...row]),
      hitCount,
      missCount,
      decision,
      message,
      log: `[MEMO] i=${i} remBudget=${rem} | ${action}: ${message}`,
      cachedVal,
      metrics: {
        'metric-cur-state': i < n ? `dfs(i=${i}, rem=${rem})` : '边界触底',
        'metric-cache-status': memoHit ? '🎯 Cache HIT' : '⚪ Cache MISS',
        'metric-hit-count': `${hitCount}`,
        'metric-miss-count': `${missCount}`,
      },
    });
  };

  pushStep('callRoot', 'callRoot', 0, curBudget, false, '启动记忆化搜索', `🚀 启动夏季特惠记忆化搜索：初始化备忘录 memo[${n + 1}][${curBudget + 1}]。`);

  function dfsMemo(i: number, rem: number): number {
    if (steps.length >= maxSteps) return 0;
    pushStep('fnEnter', 'fnEnter', i, rem, false, '进入栈帧', `📥 进入栈帧 dfs(i=${i}, rem=${rem})。`);

    if (i === n || rem <= 0) {
      pushStep('baseCheck', 'baseCheck', i, rem, false, '触底终止', `🛑 边界触底，返回 0。`);
      return 0;
    }

    if (memo[i][rem] !== null) {
      hitCount++;
      const val = memo[i][rem]!;
      pushStep('memoCheck', 'memoCheck', i, rem, true, `命中缓存 memo[${i}][${rem}] = ${val}`, `🎯 缓存命中！直接复用结果 ${val}，剪除冗余分支！`, val);
      return val;
    }

    missCount++;
    pushStep('memoCheck', 'memoCheck', i, rem, false, `未命中缓存 memo[${i}][${rem}]`, `⚪ 缓存未命中：首次计算，展开分支。`);

    const g = normalGames[i];
    const p1 = dfsMemo(i + 1, rem);
    pushStep('branch1', 'branch1', i, rem, false, '分支 1: 不买', `🌿 分支 1：不买游戏 #${g.id}，后续快乐 ${p1}。`);

    let p2 = 0;
    if (rem >= g.cost) {
      p2 = dfsMemo(i + 1, rem - g.cost) + g.val;
      pushStep('branch2', 'branch2', i, rem, false, '分支 2: 购买', `💎 分支 2：购买游戏 #${g.id}，总快乐 ${p2}。`);
    }

    const res = Math.max(p1, p2);
    memo[i][rem] = res;
    pushStep('memoStore', 'memoStore', i, rem, false, `写入缓存 memo[${i}][${rem}] = ${res}`, `💾 写入缓存：memo[${i}][${rem}] = ${res}，O(1) 返回。`, res);
    return res;
  }

  dfsMemo(0, curBudget);
  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

export function buildBuyGoods2DSteps(initialBudget: number, a: number[], b: number[], w: number[]) {
  const { greedyHappy, curBudget, normalGames } = parseBuyGoodsNormalGames(initialBudget, a, b, w);
  const steps: any[] = [];
  const n = normalGames.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(curBudget + 1).fill(0));

  const resolveLine = (anchor: string) => getKnapsack073Anchor(3, 'buy-goods', anchor);

  const pushStep = (action: string, codeKey: string, curI: number, curJ: number, depCells: Array<{ label: string; val: number; r: number; c: number }>, decision: string, message: string) => {
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: resolveLine(codeKey),
      curI,
      curJ,
      dpTable: dp.map((row) => [...row]),
      depCells,
      decision,
      message,
      log: `[2D DP] i=${curI} j=${curJ} | ${action}: ${message}`,
      metrics: {
        'metric-cur-cell': `dp[${curI}][${curJ}]`,
        'metric-cell-val': `${dp[curI][curJ]}`,
        'metric-dep-info': depCells.map((d) => `${d.label}=${d.val}`).join(', ') || '基底 0',
      },
    });
  };

  pushStep('initDp', 'initDp', 0, 0, [], '初始化二维 DP 状态表', `🚀 初始化二维动态规划表格 dp[${n + 1}][${curBudget + 1}]，基底为 0。`);

  for (let i = 1; i <= n; i++) {
    const g = normalGames[i - 1];
    pushStep('outerLoopI', 'outerLoopI', i, 0, [], `考察普通游戏 #${g.id}`, `📦 外层考察普通游戏 #${g.id} (花费:${g.cost}, 快乐:${g.val})。`);

    for (let j = 0; j <= curBudget; j++) {
      dp[i][j] = dp[i - 1][j];
      const baseDep = { label: `dp[${i - 1}][${j}]`, val: dp[i - 1][j], r: i - 1, c: j };

      if (j < g.cost) {
        pushStep('inheritNoPick', 'inheritNoPick', i, j, [baseDep], `预算不足，继承上行: dp[${i}][${j}]=${dp[i][j]}`, `⏸️ 结余预算 j=${j} < ${g.cost}，无法购买，继承上行 ${dp[i - 1][j]}。`);
      } else {
        const prevBudget = j - g.cost;
        const candidate = dp[i - 1][prevBudget] + g.val;
        const isBetter = candidate > dp[i][j];
        if (isBetter) dp[i][j] = candidate;
        const pickDep = { label: `dp[${i - 1}][${prevBudget}] + ${g.val}`, val: candidate, r: i - 1, c: prevBudget };

        pushStep('updatePick', 'updatePick', i, j, [baseDep, pickDep], `试算购买: max(${dp[i - 1][j]}, ${candidate}) = ${dp[i][j]}`, isBetter ? `✨ 购买该游戏更优，快乐提升至 ${dp[i][j]}！` : `⏸️ 保持原值 ${dp[i][j]}。`);
      }
    }
  }

  const dpMax = dp[n][curBudget];
  const finalTotal = greedyHappy + dpMax;
  pushStep('returnAns', 'returnAns', n, curBudget, [{ label: `dp[${n}][${curBudget}]`, val: dpMax, r: n, c: curBudget }], `最终快乐值: ${greedyHappy} + ${dpMax} = ${finalTotal}`, `🎉 二维 DP 填表完毕！贪心白嫖 ${greedyHappy} + 背包获得 ${dpMax} = 总快乐值 ${finalTotal}！`);

  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}
