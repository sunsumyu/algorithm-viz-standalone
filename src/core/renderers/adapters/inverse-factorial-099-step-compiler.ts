/**
 * 阶乘逆元与组合数快速计算 (Factorial Inverses & nCr) StepCompiler
 * 核心原理：O(n) 预处理阶乘与倒推阶乘逆元，单次 O(1) 求解组合数 C(n, m)
 */

import { INVERSE_FACTORIAL_LINES } from '../../../algorithms/categories/math/math-099/math-099-stage-codes';
import { Math099Step } from '../../../algorithms/categories/math/math-099/math-099-shared';

export interface FactorialStep extends Math099Step {
  n: number;
  m: number;
  factN?: number;
  invFactM?: number;
  invFactNM?: number;
}

function powerBigInt(base: bigint, exp: bigint, mod: bigint): bigint {
  let res = 1n;
  let b = base % mod;
  let e = exp;
  while (e > 0n) {
    if (e % 2n === 1n) res = (res * b) % mod;
    b = (b * b) % mod;
    e /= 2n;
  }
  return res;
}

export function buildFactorialSteps(n: number, m: number, p: number = 1000000007): FactorialStep[] {
  const steps: FactorialStep[] = [];
  const lines = INVERSE_FACTORIAL_LINES;

  // 1. 预处理阶乘与阶乘逆元
  const fact = new Array(n + 1).fill(1n);
  for (let i = 1; i <= n; i++) {
    fact[i] = (fact[i - 1] * BigInt(i)) % BigInt(p);
  }

  const invFact = new Array(n + 1).fill(1n);
  invFact[n] = powerBigInt(fact[n], BigInt(p) - 2n, BigInt(p));
  for (let i = n; i >= 1; i--) {
    invFact[i - 1] = (invFact[i] * BigInt(i)) % BigInt(p);
  }

  // Step 0: 入口
  steps.push({
    n,
    m,
    decision: `主函数入口：求解组合数 C(${n}, ${m}) % ${p}`,
    message: '利用公式 C(n, m) = n! × (m!)⁻¹ × ((n-m)!)⁻¹ (mod p)，实现 O(1) 极速查询',
    log: `enter c(n=${n}, m=${m})`,
    line: lines.entry.javascript,
    codeLine: lines.entry,
    metrics: { '总数 n': `${n}`, '选出 m': `${m}`, '模数 p': `${p}` },
  });

  // Step 1: 合法性特判
  if (m < 0 || m > n) {
    steps.push({
      n,
      m,
      decision: `边界特判：m=${m} 超出范围 [0, ${n}]，返回 0`,
      message: '非法组合数',
      log: 'm out of range, return 0',
      line: lines.guard.javascript,
      codeLine: lines.guard,
      metrics: { '结果': '0' },
      finalValue: 0,
    });
    return steps;
  }

  // Step 2: 查表与计算
  const bigP = BigInt(p);
  const fnBig = BigInt(fact[n]);
  const ifmBig = BigInt(invFact[m]);
  const ifnmBig = BigInt(invFact[n - m]);
  const fn = Number(fnBig);
  const ifm = Number(ifmBig);
  const ifnm = Number(ifnmBig);
  const ans = Number((((fnBig * ifmBig) % bigP) * ifnmBig) % bigP);

  steps.push({
    n,
    m,
    factN: fn,
    invFactM: ifm,
    invFactNM: ifnm,
    finalValue: ans,
    decision: `🎉 O(1) 查表并完成乘法：C(${n}, ${m}) = ${fn} × ${ifm} × ${ifnm} % ${p} = ${ans}！`,
    message: `fact[${n}]=${fn}, invFact[${m}]=${ifm}, invFact[${n - m}]=${ifnm}`,
    log: `computed C(${n},${m}) = ${ans}`,
    line: lines.returnAns.javascript,
    codeLine: lines.returnAns,
    metrics: { [`C(${n}, ${m})`]: `${ans}` },
  });

  return steps;
}
