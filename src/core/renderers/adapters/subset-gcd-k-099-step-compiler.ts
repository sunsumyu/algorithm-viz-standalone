/**
 * 子集 GCD 为 K 的方案数 (Subset GCD K) StepCompiler
 * 核心原理：倍数计数 + 容斥原理倒序消除，dp[x] = (2^cnt[x] - 1) - sum(dp[2x, 3x, ...])
 */

import { SUBSET_GCD_K_LINES } from '../../../algorithms/categories/math/math-099/math-099-stage-codes';
import { Math099Step } from '../../../algorithms/categories/math/math-099/math-099-shared';

export interface SubsetGcdStep extends Math099Step {
  nums: number[];
  k: number;
}

export function buildSubsetGcdSteps(nums: number[], k: number): SubsetGcdStep[] {
  const steps: SubsetGcdStep[] = [];
  const lines = SUBSET_GCD_K_LINES;
  const MOD = 1000000007n;

  const maxVal = Math.max(...nums);
  const dp = new Array(maxVal + 1).fill(0n);

  // Step 0: 入口
  steps.push({
    nums: [...nums],
    k,
    decision: `主函数入口：计算数组 [${nums.join(', ')}] 中有多少个子集的最大公约数恰好为 k=${k}`,
    message: '最大值 maxVal=' + maxVal + '，采用倒序容斥消除倍数重叠',
    log: `enter countSubsetGcdK(nums, k=${k})`,
    line: lines.entry.javascript,
    codeLine: lines.entry,
    metrics: { '目标 gcd': `${k}`, '数组元素数': `${nums.length}`, '最大元素': `${maxVal}` },
  });

  // Step 1: 内存分配
  steps.push({
    nums: [...nums],
    k,
    decision: `分配 dp 数组空间：long[] dp = new long[${maxVal + 1}]`,
    message: '准备从 maxVal 倒序循环至 1 进行容斥计算',
    log: 'allocate dp array',
    line: lines.initDp.javascript,
    codeLine: lines.initDp,
    metrics: { 'dp 长度': `${maxVal + 1}` },
  });

  // 快速幂辅助
  function power2(exp: number): bigint {
    let res = 1n;
    let b = 2n;
    let e = BigInt(exp);
    while (e > 0n) {
      if (e % 2n === 1n) res = (res * b) % MOD;
      b = (b * b) % MOD;
      e /= 2n;
    }
    return res;
  }

  // Step 2: 倒序容斥递推
  for (let x = maxVal; x >= 1; x--) {
    let cnt = 0;
    for (const num of nums) {
      if (num % x === 0) cnt++;
    }

    steps.push({
      nums: [...nums],
      k,
      decision: `外层扫描 x=${x}：数组中有 ${cnt} 个数为 ${x} 的倍数`,
      message: `这 ${cnt} 个数可构成 (2^${cnt} - 1) 个倍数子集`,
      log: `scan x=${x}, count multiples=${cnt}`,
      line: lines.outerLoop.javascript,
      codeLine: lines.outerLoop,
      metrics: { '当前数值 x': `${x}`, '倍数个数 cnt': `${cnt}` },
    });

    let subsets = (power2(cnt) - 1n + MOD) % MOD;
    for (let mult = 2 * x; mult <= maxVal; mult += x) {
      subsets = (subsets - dp[mult] + MOD) % MOD;
    }

    dp[x] = subsets;

    steps.push({
      nums: [...nums],
      k,
      decision: `容斥消除：dp[${x}] 扣除所有严格倍数 ${2 * x}, ${3 * x}... 的贡献后，最终恰好 GCD=${x} 的子集数为 ${dp[x]}`,
      message: `记录 dp[${x}] = ${dp[x]}`,
      log: `dp[${x}] = ${dp[x]}`,
      line: lines.saveDp.javascript,
      codeLine: lines.saveDp,
      metrics: { [`dp[${x}]`]: `${dp[x]}` },
    });
  }

  // Step 3: 返回
  const ans = Number(k <= maxVal ? dp[k] : 0n);
  steps.push({
    nums: [...nums],
    k,
    decision: `🎉 计算完毕！最大公约数恰好等于 ${k} 的非空子集共有 dp[${k}] = ${ans} 个！`,
    message: '收敛返回',
    log: `return dp[${k}] = ${ans}`,
    line: lines.returnAns.javascript,
    codeLine: lines.returnAns,
    metrics: { [`最终答案 (GCD=${k})`]: `${ans}` },
    finalValue: ans,
  });

  return steps;
}
