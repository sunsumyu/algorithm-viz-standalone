/**
 * Class 162: 多项式求逆 (Polynomial Inverse) 步进推演编译器
 * 核心：常数项费马小定理逆元、牛顿迭代法倍增 B = B0(2 - A*B0) mod x^n 与高阶项截断
 */

import { Advanced161Step } from '../../../algorithms/categories/advanced-topics/advanced-161-166/advanced-161-166-shared';
import { POLYNOMIAL_INVERSE_LINES } from '../../../algorithms/categories/advanced-topics/advanced-161-166/advanced-161-166-stage-codes';

export interface PolyInvStep extends Advanced161Step {
  polyA: number[];
  polyB: number[];
  targetDeg: number;
  currDeg: number;
  stage: string;
}

const MOD = 998244353;

function power(base: number, exp: number): number {
  let res = 1n;
  let b = BigInt(base) % BigInt(MOD);
  let e = BigInt(exp);
  const m = BigInt(MOD);
  while (e > 0n) {
    if (e & 1n) res = (res * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return Number(res);
}

export function buildPolyInvSteps(a: number[], deg: number): PolyInvStep[] {
  const steps: PolyInvStep[] = [];
  const lines = POLYNOMIAL_INVERSE_LINES;

  // Step 0: 入口帧
  steps.push({
    polyA: [...a],
    polyB: [],
    targetDeg: deg,
    currDeg: 0,
    stage: '算法调用入口',
    decision: `主函数入口：准备对多项式 A(x)=[${a.slice(0, deg).join(', ')}] 在 mod x^${deg} 下求模逆多项式 B(x)`,
    message: `需满足 A(x) * B(x) = 1 (mod x^${deg})，利用牛顿迭代法倍增求解`,
    log: `enter polyInv: deg=${deg}`,
    codeLine: lines.entry,
    metrics: { '目标次数界': deg, '常数项 a0': a[0], '模数 P': MOD },
  });

  // Step 1: 递归边界 deg = 1
  const b0 = power(a[0], MOD - 2);
  let b = [b0];
  steps.push({
    polyA: [...a],
    polyB: [...b],
    targetDeg: deg,
    currDeg: 1,
    stage: '边界常数项求逆 (deg=1)',
    decision: `边界条件 deg=1：常数项 a[0]=${a[0]}，利用费马小定理求乘法逆元 b[0] = ${a[0]}^(P-2) mod P = ${b0}`,
    message: `此时 B0(x) = ${b0} 满足 A(x) * B0(x) = 1 (mod x^1)`,
    log: `baseCase: deg=1, b[0]=${b0}`,
    codeLine: lines.baseCase,
    statusBadge: { text: `deg=1 逆元: ${b0}`, type: 'info' },
    metrics: { '当前模数界': 'mod x^1', '常数项逆元': b0 },
  });

  // Step 2..k: 倍增过程
  let cur = 1;
  while (cur < deg) {
    const nextCur = Math.min(cur << 1, deg);
    const nextB: number[] = new Array(nextCur).fill(0);
    const ab0: number[] = new Array(nextCur).fill(0);
    for (let i = 0; i < nextCur; i++) {
      for (let j = 0; j < b.length && i + j < nextCur; j++) {
        ab0[i + j] = (ab0[i + j] + (a[i] || 0) * b[j]) % MOD;
      }
    }
    const twoMinus: number[] = new Array(nextCur).fill(0);
    twoMinus[0] = (2 - ab0[0] + MOD) % MOD;
    for (let i = 1; i < nextCur; i++) {
      twoMinus[i] = (MOD - ab0[i]) % MOD;
    }
    for (let i = 0; i < b.length; i++) {
      for (let j = 0; j < nextCur && i + j < nextCur; j++) {
        nextB[i + j] = (nextB[i + j] + b[i] * twoMinus[j]) % MOD;
      }
    }

    steps.push({
      polyA: [...a],
      polyB: [...b],
      targetDeg: deg,
      currDeg: cur,
      stage: `倍增递归划分 (${cur} -> ${nextCur})`,
      decision: `倍增递推：由 mod x^${cur} 解 B0 倍增推导 mod x^${nextCur} 解`,
      message: `公式: B(x) = B0(x) * (2 - A(x) * B0(x)) (mod x^${nextCur})，利用 NTT 在 O(len log len) 内完成点值相乘`,
      log: `recurseHalf: cur=${cur} -> next=${nextCur}`,
      codeLine: lines.recurseHalf,
      statusBadge: { text: `模界倍增至 x^${nextCur}`, type: 'warning' },
      metrics: { '原模界': `x^${cur}`, '新模界': `x^${nextCur}` },
    });

    b = nextB;
    cur = nextCur;

    steps.push({
      polyA: [...a],
      polyB: [...b],
      targetDeg: deg,
      currDeg: cur,
      stage: `牛顿迭代点值合并 (mod x^${cur})`,
      decision: `牛顿迭代合并完成：获得在 mod x^${cur} 意义下的逆多项式 B(x) = [${b.join(', ')}]`,
      message: `验证: A(x) * B(x) mod x^${cur} = 1，误差阶数从 O(x^${cur >> 1}) 二次收敛至 O(x^${cur})`,
      log: `newtonStep: cur=${cur}, B=[${b.join(',')}]`,
      codeLine: lines.newtonStep,
      statusBadge: { text: `收敛至 mod x^${cur}`, type: 'info' },
      metrics: { '当前逆元多项式': b.slice(0, Math.min(b.length, 4)).join(', '), '收敛阶数': cur },
    });
  }

  // 截断与终态
  steps.push({
    polyA: [...a],
    polyB: [...b],
    targetDeg: deg,
    currDeg: deg,
    stage: '高阶项截断与结果返回',
    decision: `🎉 多项式求逆完成：在 mod x^${deg} 下的乘法逆元多项式为 B(x) = [${b.join(', ')}]`,
    message: `总时间复杂度 T(n) = T(n/2) + O(n log n) = O(n log n)，支撑后续多项式除法与开方`,
    log: `returnAns: B=[${b.join(',')}]`,
    codeLine: lines.truncate,
    statusBadge: { text: '求逆成功', type: 'success' },
    metrics: { '逆多项式阶数': deg, '时间复杂度': 'O(n log n)' },
  });

  return steps;
}
