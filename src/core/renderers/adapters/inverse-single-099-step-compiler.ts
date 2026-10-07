/**
 * 乘法逆元单点求法 (Modular Inverse Single) StepCompiler
 * 核心原理：费马小定理 a^(p-1) ≡ 1 (mod p) ➔ a^(-1) ≡ a^(p-2) (mod p)
 */

import { INVERSE_SINGLE_LINES } from '../../../algorithms/categories/math/math-099/math-099-stage-codes';
import { Math099Step } from '../../../algorithms/categories/math/math-099/math-099-shared';

export interface InverseSingleStep extends Math099Step {
  a: number;
  p: number;
  inv: number;
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

export function buildInverseSingleSteps(a: number, p: number = 1000000007): InverseSingleStep[] {
  const steps: InverseSingleStep[] = [];
  const lines = INVERSE_SINGLE_LINES;

  const inv = Number(powerBigInt(BigInt(a), BigInt(p) - 2n, BigInt(p)));

  // Step 0: 入口
  steps.push({
    a,
    p,
    inv: 0,
    decision: `主函数入口：求解 a=${a} 在质数模数 p=${p} 下的乘法逆元 a⁻¹`,
    message: '利用费马小定理：当 p 为质数时，a^(p-2) % p 即为乘法逆元',
    log: `enter inverse(a=${a}, p=${p})`,
    line: lines.entry.javascript,
    codeLine: lines.entry,
    metrics: { '数值 a': `${a}`, '模数 p': `${p}` },
  });

  // Step 1: 结果与乘法验证
  const verification = Number((BigInt(a) * BigInt(inv)) % BigInt(p));
  steps.push({
    a,
    p,
    inv,
    finalValue: inv,
    inversesTable: [{ num: a, inv }],
    activeNum: a,
    decision: `🎉 快速幂计算完成！a⁻¹ = ${a}^(${p - 2}) % ${p} = ${inv}！`,
    message: `验证乘法恒等性：(${a} × ${inv}) % ${p} = ${verification} (严格等于 1！)`,
    log: `inverse of ${a} mod ${p} is ${inv}`,
    line: lines.returnAns.javascript,
    codeLine: lines.returnAns,
    metrics: { '乘法逆元': `${inv}`, '模乘检验': `${verification}` },
  });

  return steps;
}
