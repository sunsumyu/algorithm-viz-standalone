/**
 * 目标和 (LeetCode 494) 四阶段演化推演引擎与四语言代码映射
 * 阶段 1: 暴力递归 (递归搜索与运行时调用栈)
 * 阶段 2: 记忆化搜索 (备忘录 Cache Hit/Miss 追踪)
 * 阶段 3: 严格二维动态规划 (二维方案数表格自底向上填表)
 * 阶段 4: 空间压缩 (一维滚动数组逆序更新)
 */

import { HighlightTarget } from '../../../../core/code-panel';
import { TARGET_SUM_STAGE1_CODE_LANGUAGES, TARGET_SUM_STAGE2_CODE_LANGUAGES, TARGET_SUM_STAGE3_CODE_LANGUAGES } from './knapsack-073-templates';
import { getKnapsack073Anchor } from './knapsack-073-stage-codes';




// ==========================================
// 2. 步骤推演生成器
// ==========================================

export function buildTargetSumRecursionSteps(nums: number[], target: number, maxSteps = 800) {
  const steps: any[] = [];
  const sum = nums.reduce((a, b) => a + Math.abs(b), 0);
  const isValid = sum >= Math.abs(target) && (sum + target) % 2 === 0;
  const t = isValid ? Math.floor((sum + target) / 2) : -1;
  const n = nums.length;
  const callStack: Array<{ i: number; rem: number; label: string }> = [];

  const resolveLine = (anchor: string) => getKnapsack073Anchor(1, 'target-sum', anchor);

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
      callStack: [...callStack],
      decision,
      message,
      log: `[DFS] i=${i} rem=${rem} | ${action}: ${message}`,
      returnValue: retVal,
      metrics: {
        'metric-cur-state': i < n ? `dfs(i=${i}, rem=${rem})` : '边界回溯',
        'metric-cur-num': i < n ? `nums[${i}]=${nums[i]}` : '—',
        'metric-stack-depth': `${callStack.length}`,
      },
    });
  };

  if (!isValid || t < 0) {
    pushStep('check', 'check', 0, 0, '校验失败', `🛑 奇偶性校验失败或绝对值越界：sum=${sum}, target=${target}，无整数解，返回 0 种方案。`, 0);
    return steps;
  }

  pushStep('callRoot', 'callRoot', 0, t, '启动暴力递归', `🚀 启动目标和暴力分治：转化正子集目标和 t=${t}，nums 长度=${n}。`);

  function dfs(i: number, rem: number): number {
    if (steps.length >= maxSteps) return 0;
    const label = `dfs(i=${i}, rem=${rem})`;
    callStack.push({ i, rem, label });
    pushStep('fnEnter', 'fnEnter', i, rem, '进入栈帧', `📥 进入栈帧 ${label}。`);

    if (i === n) {
      const ans = rem === 0 ? 1 : 0;
      pushStep('baseCheck', 'baseCheck', i, rem, `触底判定: rem=${rem}`, ans === 1 ? `✅ 恰好凑齐目标和！返回 1 种有效方案。` : `❌ 未能恰好凑齐 (剩余 rem=${rem})，返回 0。`, ans);
      callStack.pop();
      return ans;
    }

    pushStep('baseCheck', 'baseCheck', i, rem, '考察元素', `🔍 考察 nums[${i}]=${nums[i]}，剩余目标和 rem=${rem}。`);

    const p1 = dfs(i + 1, rem);
    pushStep('branch1', 'branch1', i, rem, '分支 1: 不选当前数字', `🌿 分支 1：不选 nums[${i}]=${nums[i]}，后续合法方案数 = ${p1}。`);

    let p2 = 0;
    if (rem >= nums[i]) {
      p2 = dfs(i + 1, rem - nums[i]);
      pushStep('branch2', 'branch2', i, rem, '分支 2: 选入当前数字', `💎 分支 2：选入 nums[${i}]=${nums[i]}，后续合法方案数 = ${p2}。`);
    }

    const totalWays = p1 + p2;
    pushStep('returnSum', 'returnSum', i, rem, `方案累加: p1+p2=${totalWays}`, `📤 栈帧 ${label} 汇聚：返回两分支方案和 ${p1} + ${p2} = ${totalWays} 种。`, totalWays);
    callStack.pop();
    return totalWays;
  }

  dfs(0, t);
  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

export function buildTargetSumMemoSteps(nums: number[], target: number, maxSteps = 800) {
  const steps: any[] = [];
  const sum = nums.reduce((a, b) => a + Math.abs(b), 0);
  const isValid = sum >= Math.abs(target) && (sum + target) % 2 === 0;
  const t = isValid ? Math.floor((sum + target) / 2) : -1;
  const n = nums.length;

  const resolveLine = (anchor: string) => getKnapsack073Anchor(2, 'target-sum', anchor);

  if (!isValid || t < 0) {
    steps.push({
      stepIndex: 1,
      totalSteps: 1,
      action: 'check',
      codeLine: lineMap.check,
      i: 0,
      remCap: 0,
      memoHit: false,
      memoGrid: [[0]],
      hitCount: 0,
      missCount: 0,
      decision: '无整数解',
      message: `🛑 奇偶性或越界无解，直接返回 0。`,
      log: 'check: invalid',
    });
    return steps;
  }

  const memo: (number | null)[][] = Array.from({ length: n + 1 }, () => new Array(t + 1).fill(null));
  let hitCount = 0;
  let missCount = 0;

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
      log: `[MEMO] i=${i} rem=${rem} | ${action}: ${message}`,
      cachedVal,
      metrics: {
        'metric-cur-state': i < n ? `dfs(i=${i}, rem=${rem})` : '边界触底',
        'metric-cache-status': memoHit ? '🎯 Cache HIT' : '⚪ Cache MISS',
        'metric-hit-count': `${hitCount}`,
        'metric-miss-count': `${missCount}`,
      },
    });
  };

  pushStep('callRoot', 'callRoot', 0, t, false, '启动记忆化搜索', `🚀 启动记忆化搜索：创建备忘录表格 memo[${n + 1}][${t + 1}]。`);

  function dfsMemo(i: number, rem: number): number {
    if (steps.length >= maxSteps) return 0;
    pushStep('fnEnter', 'fnEnter', i, rem, false, '进入栈帧', `📥 进入栈帧 dfs(i=${i}, rem=${rem})。`);

    if (i === n) {
      const ans = rem === 0 ? 1 : 0;
      pushStep('baseCheck', 'baseCheck', i, rem, false, '触底结算', ans === 1 ? `✅ 凑齐目标！返回 1。` : `❌ 未凑齐，返回 0。`, ans);
      return ans;
    }

    if (memo[i][rem] !== null) {
      hitCount++;
      const val = memo[i][rem]!;
      pushStep('memoCheck', 'memoCheck', i, rem, true, `命中缓存 memo[${i}][${rem}] = ${val}`, `🎯 缓存命中！复用已求方案数 ${val}，直接剪枝！`, val);
      return val;
    }

    missCount++;
    pushStep('memoCheck', 'memoCheck', i, rem, false, `未命中缓存 memo[${i}][${rem}]`, `⚪ 缓存未命中：首次探访，计算分支。`);

    const p1 = dfsMemo(i + 1, rem);
    pushStep('branch1', 'branch1', i, rem, false, '分支 1: 不选', `🌿 分支 1：不选 nums[${i}]=${nums[i]}，后续方案数 ${p1}。`);

    let p2 = 0;
    if (rem >= nums[i]) {
      p2 = dfsMemo(i + 1, rem - nums[i]);
      pushStep('branch2', 'branch2', i, rem, false, '分支 2: 选入', `💎 分支 2：选入 nums[${i}]=${nums[i]}，后续方案数 ${p2}。`);
    }

    const res = p1 + p2;
    memo[i][rem] = res;
    pushStep('memoStore', 'memoStore', i, rem, false, `写入缓存 memo[${i}][${rem}] = ${res}`, `💾 写入缓存：memo[${i}][${rem}] = ${res} 种方案，O(1) 向上返回。`, res);
    return res;
  }

  dfsMemo(0, t);
  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

export function buildTargetSum2DSteps(nums: number[], target: number) {
  const steps: any[] = [];
  const sum = nums.reduce((a, b) => a + Math.abs(b), 0);
  const isValid = sum >= Math.abs(target) && (sum + target) % 2 === 0;
  const t = isValid ? Math.floor((sum + target) / 2) : 0;
  const n = nums.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(t + 1).fill(0));

  const resolveLine = (anchor: string) => getKnapsack073Anchor(3, 'target-sum', anchor);

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
        'metric-cell-val': `${dp[curI][curJ]} 种`,
        'metric-dep-info': depCells.map((d) => `${d.label}=${d.val}`).join(', ') || '基底 1',
      },
    });
  };

  if (!isValid) {
    pushStep('initDp', 'initDp', 0, 0, [], '无解返回 0', `🛑 奇偶性或绝对值不满足，无法凑出 target，直接返回 0。`);
    return steps;
  }

  dp[0][0] = 1;
  pushStep('initDp', 'initDp', 0, 0, [], '基底初始化 dp[0][0]=1', `🚀 初始化二维状态表 dp[${n + 1}][${t + 1}]，dp[0][0]=1 表示空集凑和为 0 有且仅有 1 种方案。`);

  for (let i = 1; i <= n; i++) {
    const num = nums[i - 1];
    pushStep('outerLoopI', 'outerLoopI', i, 0, [], `外层循环：考察 nums[${i - 1}]=${num}`, `📦 外层考察第 ${i} 个数字 nums[${i - 1}]=${num}。`);

    for (let j = 0; j <= t; j++) {
      dp[i][j] = dp[i - 1][j];
      const baseDep = { label: `dp[${i - 1}][${j}]`, val: dp[i - 1][j], r: i - 1, c: j };

      if (j < num) {
        pushStep('inheritNoPick', 'inheritNoPick', i, j, [baseDep], `容量不足，继承上行: dp[${i}][${j}]=${dp[i][j]}`, `⏸️ 容量 j=${j} < ${num}，无法选入，方案数继承上一行同列 ${dp[i - 1][j]} 种。`);
      } else {
        const prevCap = j - num;
        const addWays = dp[i - 1][prevCap];
        dp[i][j] += addWays;
        const pickDep = { label: `dp[${i - 1}][${prevCap}]`, val: addWays, r: i - 1, c: prevCap };

        pushStep('updatePick', 'updatePick', i, j, [baseDep, pickDep], `累加方案: dp[${i}][${j}] = ${baseDep.val} + ${addWays} = ${dp[i][j]}`, `✨ 状态累加：选入 nums[${i - 1}]=${num} 增加 ${addWays} 种方案，dp[${i}][${j}] 增至 ${dp[i][j]} 种！`);
      }
    }
  }

  pushStep('returnAns', 'returnAns', n, t, [{ label: `dp[${n}][${t}]`, val: dp[n][t], r: n, c: t }], `最终方案数: dp[${n}][${t}]=${dp[n][t]}`, `🎉 二维动态规划填表完毕！恰好凑齐正子集和 ${t} 的方案数（即目标和 ${target} 的表达式总数）为 ${dp[n][t]} 种！`);

  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}
