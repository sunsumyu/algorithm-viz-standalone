/**
 * Class 164: 杜教筛 (Dujiao Sieve) 步进推演编译器
 * 核心：狄利克雷卷积恒等式、数论分块与哈希记忆化剪枝
 */

import { Advanced161Step, DujiaoBlockInfo } from '../../../algorithms/categories/advanced-topics/advanced-161-166/advanced-161-166-shared';
import { DUJIAO_SIEVE_LINES } from '../../../algorithms/categories/advanced-topics/advanced-161-166/advanced-161-166-stage-codes';

export interface DujiaoStep extends Advanced161Step {
  n: number;
  preLimit: number;
  blocks: DujiaoBlockInfo[];
  memoCount: number;
  finalAns?: number;
  stage: string;
}

const MAX_PRE = 1000;
const isPrime = new Uint8Array(MAX_PRE + 1).fill(1);
const primes: number[] = [];
const mu = new Int32Array(MAX_PRE + 1);
const sumMu = new Int32Array(MAX_PRE + 1);

isPrime[0] = isPrime[1] = 0;
mu[1] = 1;
for (let i = 2; i <= MAX_PRE; i++) {
  if (isPrime[i]) {
    primes.push(i);
    mu[i] = -1;
  }
  for (let j = 0; j < primes.length && i * primes[j] <= MAX_PRE; j++) {
    isPrime[i * primes[j]] = 0;
    if (i % primes[j] === 0) {
      mu[i * primes[j]] = 0;
      break;
    } else {
      mu[i * primes[j]] = -mu[i];
    }
  }
}
for (let i = 1; i <= MAX_PRE; i++) {
  sumMu[i] = sumMu[i - 1] + mu[i];
}

export function buildDujiaoSteps(targetN: number): DujiaoStep[] {
  const steps: DujiaoStep[] = [];
  const lines = DUJIAO_SIEVE_LINES;
  const memo = new Map<number, number>();

  const preLimit = Math.min(20, targetN);

  function getSum(n: number): number {
    if (n <= preLimit) return sumMu[n];
    if (memo.has(n)) return memo.get(n)!;

    let ans = 1;
    for (let l = 2, r = 0; l <= n; l = r + 1) {
      const q = Math.floor(n / l);
      r = Math.floor(n / q);
      ans -= (r - l + 1) * getSum(q);
    }
    memo.set(n, ans);
    return ans;
  }

  // Step 0: 入口帧
  steps.push({
    n: targetN,
    preLimit,
    blocks: [],
    memoCount: 0,
    stage: '主函数入口',
    decision: `主函数入口：准备使用杜教筛亚线性求莫比乌斯函数前缀和 S(${targetN}) = sum_{i=1}^${targetN} mu(i)`,
    message: `线性筛预处理边界为 ${preLimit}，对于超出部分采用数论分块与哈希记忆化递归`,
    log: `enter getSumMu: n=${targetN}`,
    codeLine: lines.entry,
    metrics: { '询问规模 N': targetN, '线性筛预处理项数': preLimit, '狄利克雷卷积方程': 'mu * 1 = e' },
  });

  // Step 1: 检查预处理边界
  steps.push({
    n: targetN,
    preLimit,
    blocks: [],
    memoCount: 0,
    stage: '检查预处理边界',
    decision: `前 ${preLimit} 项直接查表 O(1) 命中：sumMu[${preLimit}] = ${sumMu[preLimit]}`,
    message: `利用狄利克雷卷积恒等式：g(1)*S(n) = sum_{i=1}^n (f*g)(i) - sum_{d=2}^n g(d)*S(floor(n/d))`,
    log: `preCheck: limit=${preLimit}`,
    codeLine: lines.preCheck,
    statusBadge: { text: `前缀预处理边界: ${preLimit}`, type: 'info' },
    metrics: { '预处理 sumMu[20]': sumMu[preLimit], '预处理时间': 'O(n^(2/3))' },
  });

  // Step 2: 顶层数论分块枚举
  const blocks: DujiaoBlockInfo[] = [];
  let currentAns = 1;

  for (let l = 2, r = 0; l <= targetN; l = r + 1) {
    const q = Math.floor(targetN / l);
    r = Math.floor(targetN / q);
    const subSum = getSum(q);
    const contribution = (r - l + 1) * subSum;
    currentAns -= contribution;

    blocks.push({
      l,
      r,
      nDiv: q,
      subSum,
      contribution,
    });

    steps.push({
      n: targetN,
      preLimit,
      blocks: [...blocks],
      memoCount: memo.size,
      stage: `数论分块区间 [${l}, ${r}]`,
      decision: `整除分块 [${l}, ${r}]：floor(N/d) 恒为 ${q}，区间长度 ${r - l + 1}`,
      message: `递归计算子问题 S(${q}) = ${subSum}，抵消项贡献减去 ${(r - l + 1)} * ${subSum} = ${contribution}`,
      log: `divBlock: [${l}, ${r}], q=${q}, subSum=${subSum}`,
      codeLine: lines.divBlock,
      statusBadge: { text: `分块区间 [${l}, ${r}]`, type: 'warning' },
      metrics: { '当前分块': `[${l}, ${r}]`, '商 floor(N/d)': q, '子问题答案': subSum, '当前累减值': currentAns },
    });
  }

  // Step 3: 终态返回
  memo.set(targetN, currentAns);
  steps.push({
    n: targetN,
    preLimit,
    blocks: [...blocks],
    memoCount: memo.size,
    finalAns: currentAns,
    stage: '前缀和计算全部完成',
    decision: `🎉 杜教筛计算完成：莫比乌斯函数前缀和 S(${targetN}) = ${currentAns}`,
    message: `哈希表共缓存 ${memo.size} 个关键商状态，总计算量严格保证在 O(n^(2/3)) 亚线性级别`,
    log: `returnAns: S(${targetN})=${currentAns}`,
    codeLine: lines.returnAns,
    statusBadge: { text: `S(${targetN}) = ${currentAns}`, type: 'success' },
    metrics: { '最终结果 S(N)': currentAns, '缓存状态数': memo.size, '理论时间复杂度': 'O(n^(2/3))' },
  });

  return steps;
}
