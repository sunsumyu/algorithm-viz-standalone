/**
 * Miller-Rabin 大素数测试 StepCompiler
 * 核心原理：费马小定理与二次探测定理，将 n-1 拆解为 d * 2^s，在 2^64 范围内由确定性基底验证
 */

import { LARGE_PRIME_LINES } from '../../../algorithms/categories/math/math-097/math-097-stage-codes';
import { Math097Step } from '../../../algorithms/categories/math/math-097/math-097-shared';

export interface MillerRabinStep extends Math097Step {
  n: number;
  d?: number;
  s?: number;
  curBase?: number;
}

// 快速模幂辅助函数 (使用 BigInt 防止乘法在超过 2^53 时精度溢出)
function powerMod(base: number, exp: number, mod: number): number {
  let res = 1n;
  let b = BigInt(base) % BigInt(mod);
  let e = BigInt(exp);
  const m = BigInt(mod);
  while (e > 0n) {
    if (e % 2n === 1n) res = (res * b) % m;
    b = (b * b) % m;
    e /= 2n;
  }
  return Number(res);
}

export function buildMillerRabinSteps(n: number): MillerRabinStep[] {
  const steps: MillerRabinStep[] = [];
  const lines = LARGE_PRIME_LINES;

  // Step 0: 入口
  steps.push({
    n,
    decision: `主函数入口：接收大数 n=${n} 进行 Miller-Rabin 质数测试`,
    message: '基于费马小定理 a^(n-1) ≡ 1 (mod n) 与二次探测定理 x^2 ≡ 1 (mod n) 唯一解为 ±1',
    log: `enter millerRabin(n=${n})`,
    line: lines.entry.javascript,
    codeLine: lines.entry,
    metrics: { '目标数字 n': `${n}` },
  });

  // Step 1: 小数与偶数特判
  if (n <= 1) {
    steps.push({
      n,
      isResultPrime: false,
      decision: `边界特判：n=${n} <= 1，非素数，返回 false`,
      message: '素数必须大于 1',
      log: 'n <= 1, return false',
      line: lines.guard.javascript,
      codeLine: lines.guard,
      metrics: { '判定结果': '非素数 (false)' },
    });
    return steps;
  }
  if (n <= 3) {
    steps.push({
      n,
      isResultPrime: true,
      decision: `基底特判：n=${n} 为 2 或 3，直接判定为素数，返回 true`,
      message: '2 和 3 为质数基底',
      log: 'n is 2 or 3, return true',
      line: lines.guard.javascript,
      codeLine: lines.guard,
      metrics: { '判定结果': '素数 (true)' },
    });
    return steps;
  }
  if (n % 2 === 0) {
    steps.push({
      n,
      isResultPrime: false,
      decision: `偶数特判：n=${n} 为大于 2 的偶数，必定为合数，返回 false`,
      message: '偶数能被 2 整除',
      log: 'even number, return false',
      line: lines.guard.javascript,
      codeLine: lines.guard,
      metrics: { '判定结果': '合数 (false)' },
    });
    return steps;
  }

  // Step 2: 二进制因子提取 n - 1 = d * 2^s
  let d = n - 1;
  let s = 0;
  while (d % 2 === 0) {
    d = Math.floor(d / 2);
    s++;
  }

  steps.push({
    n,
    d,
    s,
    decision: `因子分解：将 n - 1 = ${n - 1} 分解为奇数 d 与 2 的幂次 ➔ d = ${d}, s = ${s} (${n - 1} = ${d} × 2^${s})`,
    message: '准备使用预设素数基底进行二次探测测试',
    log: `decomposed n-1 = ${d} * 2^${s}`,
    line: lines.decompose.javascript,
    codeLine: lines.decompose,
    metrics: { '奇数部分 d': `${d}`, '2的幂次 s': `${s}` },
  });

  // Step 3: 基底测试
  const bases = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];
  const millerBases: { base: number; passed: boolean }[] = [];

  for (const a of bases) {
    if (n <= a) break;

    // 计算 a^d % n
    let x = powerMod(a, d, n);
    let passed = false;

    if (x === 1 || x === n - 1) {
      passed = true;
    } else {
      for (let r = 1; r < s; r++) {
        x = Number((BigInt(x) * BigInt(x)) % BigInt(n));
        if (x === n - 1) {
          passed = true;
          break;
        }
      }
    }

    millerBases.push({ base: a, passed });

    steps.push({
      n,
      d,
      s,
      curBase: a,
      millerBases: [...millerBases],
      decision: passed
        ? `基底 a=${a} 二次探测检验：成功通过二次探测！`
        : `基底 a=${a} 检验失败：未能满足二次探测或费马小定理 ➔ 确认 n=${n} 为合数！`,
      message: passed ? `基底 ${a} 判定为强伪素数` : `基底 ${a} 揭示了非平凡因子`,
      log: `test base a=${a}: ${passed ? 'PASS' : 'FAIL'}`,
      line: passed ? lines.testBase.javascript : lines.checkFails.javascript,
      codeLine: passed ? lines.testBase : lines.checkFails,
      metrics: { '当前基底 a': `${a}`, '该基底结论': passed ? '通过' : '失败' },
    });

    if (!passed) {
      steps.push({
        n,
        d,
        s,
        curBase: a,
        millerBases: [...millerBases],
        isResultPrime: false,
        decision: `❌ 判定结论：基底 a=${a} 验证失败，n=${n} 100% 确定为合数！返回 false`,
        message: '合数判定完成',
        log: `composite confirmed at base ${a}`,
        line: lines.checkFails.javascript,
        codeLine: lines.checkFails,
        metrics: { '最终判定': '合数 (false)' },
      });
      return steps;
    }
  }

  // Step 4: 通过全部基底
  steps.push({
    n,
    d,
    s,
    millerBases: [...millerBases],
    isResultPrime: true,
    decision: `🎉 全部基底 [${millerBases.map(m => m.base).join(', ')}] 均通过二次探测！在 2^64 范围内 100% 确定 n=${n} 为素数！返回 true`,
    message: '素数判定完成',
    log: `prime confirmed, all bases passed`,
    line: lines.returnTrue.javascript,
    codeLine: lines.returnTrue,
    metrics: { '最终判定': '素数 (true)' },
  });

  return steps;
}
