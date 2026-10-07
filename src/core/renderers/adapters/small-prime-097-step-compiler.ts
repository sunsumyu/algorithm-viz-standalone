/**
 * 试除法判素数 (Small Prime) StepCompiler
 * 核心原理：6k±1 步长试除，检验 2 ~ sqrt(n) 之间的因子
 */

import { SMALL_PRIME_LINES } from '../../../algorithms/categories/math/math-097/math-097-stage-codes';
import { Math097Step } from '../../../algorithms/categories/math/math-097/math-097-shared';

export interface SmallPrimeStep extends Math097Step {
  n: number;
}

export function buildSmallPrimeSteps(n: number): SmallPrimeStep[] {
  const steps: SmallPrimeStep[] = [];
  const lines = SMALL_PRIME_LINES;

  // Step 0: 入口
  steps.push({
    n,
    decision: `主函数入口：接收待检验数 n=${n}`,
    message: `准备利用试除法判断是否为素数，理论只需检验至 sqrt(${n}) ≈ ${Math.floor(Math.sqrt(Math.max(0, n)))}`,
    log: `enter isPrime(n=${n})`,
    line: lines.entry.javascript,
    codeLine: lines.entry,
    metrics: { '目标数字 n': `${n}`, 'sqrt(n)': `${Math.floor(Math.sqrt(Math.max(0, n)))}` },
  });

  // Step 1: n <= 1
  if (n <= 1) {
    steps.push({
      n,
      isResultPrime: false,
      decision: `边界特判：n=${n} <= 1，负数、0 与 1 均非素数，返回 false`,
      message: '素数定义为大于 1 的自然数',
      log: 'n <= 1, return false',
      line: lines.guardSmall.javascript,
      codeLine: lines.guardSmall,
      metrics: { '判定结果': '非素数 (false)' },
    });
    return steps;
  }

  // Step 2: n == 2 || n == 3
  if (n === 2 || n === 3) {
    steps.push({
      n,
      isResultPrime: true,
      decision: `特判基底素数：n=${n} 为最小质数之一，直接返回 true`,
      message: '2 和 3 为天然质数',
      log: 'n is 2 or 3, return true',
      line: lines.guardTwoThree.javascript,
      codeLine: lines.guardTwoThree,
      metrics: { '判定结果': '素数 (true)' },
    });
    return steps;
  }

  // Step 3: 能否被 2 或 3 整除
  if (n % 2 === 0 || n % 3 === 0) {
    const factor = n % 2 === 0 ? 2 : 3;
    steps.push({
      n,
      isResultPrime: false,
      decision: `快速整除校验：n=${n} 能被 ${factor} 整除 (${n} % ${factor} = 0) ➔ 合数，返回 false`,
      message: `找到非平凡因子 ${factor}`,
      log: `n % ${factor} == 0, return false`,
      line: lines.guardMod23.javascript,
      codeLine: lines.guardMod23,
      metrics: { '首个因子': `${factor}`, '判定结果': '合数 (false)' },
    });
    return steps;
  }

  // Step 4: 6k±1 步长试除
  const tested: { divisor: number; isFactor: boolean }[] = [];
  let foundFactor: number | null = null;

  for (let i = 5; i * i <= n; i += 6) {
    tested.push({ divisor: i, isFactor: n % i === 0 });
    tested.push({ divisor: i + 2, isFactor: n % (i + 2) === 0 });

    steps.push({
      n,
      curTesting: i,
      testedDivisors: [...tested],
      decision: `试除 6k±1 候选因子：测试 i=${i} 与 i+2=${i + 2}`,
      message: `检验 ${n} % ${i} = ${n % i}，${n} % ${i + 2} = ${n % (i + 2)}`,
      log: `test i=${i}, i+2=${i + 2}`,
      line: lines.loopStep.javascript,
      codeLine: lines.loopStep,
      metrics: { '当前检测因子': `${i}, ${i + 2}` },
    });

    if (n % i === 0) {
      foundFactor = i;
      break;
    }
    if (n % (i + 2) === 0) {
      foundFactor = i + 2;
      break;
    }
  }

  if (foundFactor !== null) {
    steps.push({
      n,
      testedDivisors: [...tested],
      isResultPrime: false,
      decision: `❌ 发现因子：n=${n} 能被 ${foundFactor} 整除 ➔ 确认是合数，返回 false`,
      message: `${n} = ${foundFactor} * ${n / foundFactor}`,
      log: `found factor ${foundFactor}, return false`,
      line: lines.foundFactor.javascript,
      codeLine: lines.foundFactor,
      metrics: { '非质数因子': `${foundFactor}`, '判定结果': '合数 (false)' },
    });
    return steps;
  }

  // Step 5: 成功通过所有试除
  steps.push({
    n,
    testedDivisors: [...tested],
    isResultPrime: true,
    decision: `🎉 试除完成！在 2 ~ sqrt(${n}) 范围内未发现任何因子 ➔ 确认 n=${n} 为素数！返回 true`,
    message: '全部试除通过',
    log: `isPrime(${n}) = true`,
    line: lines.returnPrime.javascript,
    codeLine: lines.returnPrime,
    metrics: { '判定结果': '素数 (true)' },
  });

  return steps;
}
