/**
 * Class 165: 莫比乌斯反演 (Möbius Inversion) 步进推演编译器
 * 核心：sum_{d|n} mu(d) = [n=1]、二维整除分块与互质数对极速统计
 */

import { Advanced161Step, MobiusBlockView } from '../../../algorithms/categories/advanced-topics/advanced-161-166/advanced-161-166-shared';
import { MOBIUS_INVERSION_LINES } from '../../../algorithms/categories/advanced-topics/advanced-161-166/advanced-161-166-stage-codes';

export interface MobiusStep extends Advanced161Step {
  n: number;
  m: number;
  blocks: MobiusBlockView[];
  currentSum: number;
  stage: string;
}

const MAX_N = 1000;
const isPrime = new Uint8Array(MAX_N + 1).fill(1);
const primes: number[] = [];
const mu = new Int32Array(MAX_N + 1);
const sumMu = new Int32Array(MAX_N + 1);

isPrime[0] = isPrime[1] = 0;
mu[1] = 1;
for (let i = 2; i <= MAX_N; i++) {
  if (isPrime[i]) {
    primes.push(i);
    mu[i] = -1;
  }
  for (let j = 0; j < primes.length && i * primes[j] <= MAX_N; j++) {
    isPrime[i * primes[j]] = 0;
    if (i % primes[j] === 0) {
      mu[i * primes[j]] = 0;
      break;
    } else {
      mu[i * primes[j]] = -mu[i];
    }
  }
}
for (let i = 1; i <= MAX_N; i++) {
  sumMu[i] = sumMu[i - 1] + mu[i];
}

export function buildMobiusSteps(n: number, m: number): MobiusStep[] {
  const steps: MobiusStep[] = [];
  const lines = MOBIUS_INVERSION_LINES;
  const limit = Math.min(n, m);

  // Step 0: 入口帧
  steps.push({
    n,
    m,
    blocks: [],
    currentSum: 0,
    stage: '主函数入口',
    decision: `主函数入口：统计 1<=i<=${n}, 1<=j<=${m} 范围内互质数对 gcd(i, j) == 1 的总数`,
    message: `反演展开为 sum_{d=1}^${limit} mu(d) * floor(${n}/d) * floor(${m}/d)，利用数论分块在 O(sqrt(N)+sqrt(M)) 内求和`,
    log: `enter countCoprimePairs: N=${n}, M=${m}, limit=${limit}`,
    codeLine: lines.entry,
    metrics: { '区间 N': n, '区间 M': m, '枚举上限 min(N,M)': limit, '核心反演性质': 'sum_{d|n} mu(d) = [n=1]' },
  });

  const blocks: MobiusBlockView[] = [];
  let totalAns = 0;

  for (let l = 1, r = 0; l <= limit; l = r + 1) {
    const nd = Math.floor(n / l);
    const md = Math.floor(m / l);
    r = Math.min(Math.floor(n / nd), Math.floor(m / md));

    const deltaMu = sumMu[r] - sumMu[l - 1];
    const termAns = deltaMu * nd * md;
    totalAns += termAns;

    blocks.push({
      l,
      r,
      nDiv: nd,
      mDiv: md,
      deltaMu,
      termAns,
    });

    steps.push({
      n,
      m,
      blocks: [...blocks],
      currentSum: totalAns,
      stage: `数论分块 [${l}, ${r}]`,
      decision: `整除分块 [${l}, ${r}]：在此区间内 floor(N/d)=${nd}, floor(M/d)=${md} 保持恒定`,
      message: `区间 mu 增量 = sumMu[${r}] - sumMu[${l - 1}] = ${deltaMu}，本段贡献 = ${deltaMu} * ${nd} * ${md} = ${termAns}`,
      log: `calcBlock: [${l}, ${r}], deltaMu=${deltaMu}, termAns=${termAns}, total=${totalAns}`,
      codeLine: lines.calcBlock,
      statusBadge: { text: `分块 [${l}, ${r}]`, type: deltaMu === 0 ? 'info' : (deltaMu > 0 ? 'success' : 'warning') },
      metrics: { '当前分块': `[${l}, ${r}]`, '商积 (N/l)*(M/l)': nd * md, '区间 mu 增量': deltaMu, '当前互质数对': totalAns },
    });
  }

  // Step 2: 终态返回
  steps.push({
    n,
    m,
    blocks: [...blocks],
    currentSum: totalAns,
    stage: '互质数对统计完成',
    decision: `🎉 莫比乌斯反演计算全部完成：1<=i<=${n}, 1<=j<=${m} 互质数对总计 ${totalAns} 对`,
    message: `数论分块将原本 O(N*M) 的暴力枚举压缩至 O(sqrt(N) + sqrt(M))，单次多组询问极速响应`,
    log: `returnAns: total=${totalAns}`,
    codeLine: lines.returnAns,
    statusBadge: { text: `总互质数对: ${totalAns}`, type: 'success' },
    metrics: { '最终互质数对': totalAns, '总分块数': blocks.length, '单次复杂度': 'O(sqrt(N) + sqrt(M))' },
  });

  return steps;
}
