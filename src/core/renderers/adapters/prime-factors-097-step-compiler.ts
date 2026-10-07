/**
 * 质因子分解 (Prime Factorization) StepCompiler
 * 核心原理：算术基本定理，自小到大剥离质因子，剩余数 > 1 必为大质数
 */

import { PRIME_FACTORS_LINES } from '../../../algorithms/categories/math/math-097/math-097-stage-codes';
import { Math097Step } from '../../../algorithms/categories/math/math-097/math-097-shared';

export interface PrimeFactorsStep extends Math097Step {
  originalN: number;
}

export function buildPrimeFactorsSteps(originalN: number): PrimeFactorsStep[] {
  const steps: PrimeFactorsStep[] = [];
  const lines = PRIME_FACTORS_LINES;

  let n = originalN;
  const factors: { prime: number; power: number }[] = [];

  // Step 0: 入口
  steps.push({
    originalN,
    currentRemainder: n,
    factors: [],
    decision: `主函数入口：接收待分解数 n=${originalN}`,
    message: '根据算术基本定理，准备自小到大试除质数并统计幂次',
    log: `enter getFactors(n=${originalN})`,
    line: lines.entry.javascript,
    codeLine: lines.entry,
    metrics: { '原始数值': `${originalN}`, '当前商': `${n}` },
  });

  // Step 1: 初始化
  steps.push({
    originalN,
    currentRemainder: n,
    factors: [],
    decision: '初始化因子哈希表：Map<Long, Integer> factors = new LinkedHashMap<>()',
    message: '从最小质数 i=2 开始试除',
    log: 'init factors map',
    line: lines.init.javascript,
    codeLine: lines.init,
    metrics: { '试除起点': 'i=2' },
  });

  // Step 2: 循环试除
  for (let i = 2; i * i <= n; i++) {
    steps.push({
      originalN,
      currentRemainder: n,
      curTesting: i,
      factors: factors.map(f => ({ ...f })),
      decision: `考察候选因子 i=${i} (当前商 n=${n}, i*i=${i * i} <= ${n})`,
      message: n % i === 0 ? `发现质因子 ${i}！准备连续除尽` : `${n} 不能被 ${i} 整除，继续探测`,
      log: `check i=${i}`,
      line: lines.loopHeader.javascript,
      codeLine: lines.loopHeader,
      metrics: { '当前候选因子': `${i}`, '当前商': `${n}` },
    });

    if (n % i === 0) {
      let count = 0;
      const startN = n;
      while (n % i === 0) {
        count++;
        n = Math.floor(n / i);
      }

      steps.push({
        originalN,
        currentRemainder: n,
        curTesting: i,
        factors: factors.map(f => ({ ...f })),
        decision: `剥离因子：${startN} 连续被 ${i} 整除 ${count} 次 ➔ 商变为 ${n}`,
        message: `累计质因子 ${i} 的指数为 ${count}`,
        log: `extracted factor ${i}^${count}, remainder=${n}`,
        line: lines.extractFactor.javascript,
        codeLine: lines.extractFactor,
        metrics: { '质因子': `${i}`, '指数': `${count}`, '剩余商': `${n}` },
      });

      factors.push({ prime: i, power: count });

      steps.push({
        originalN,
        currentRemainder: n,
        curTesting: i,
        factors: factors.map(f => ({ ...f })),
        decision: `记录因子项：factors.put(${i}, ${count})`,
        message: `当前已分解部分: ${factors.map(f => `${f.prime}^${f.power}`).join(' × ')}`,
        log: `save factor ${i}^${count}`,
        line: lines.saveFactor.javascript,
        codeLine: lines.saveFactor,
        metrics: { '已收录项数': `${factors.length}` },
      });
    }
  }

  // Step 3: 剩余商检查
  if (n > 1) {
    factors.push({ prime: n, power: 1 });
    steps.push({
      originalN,
      currentRemainder: 1,
      factors: factors.map(f => ({ ...f })),
      decision: `剩余商 n=${n} > 1：大于 sqrt(原数) 的剩余商自身必为大质数！记录因子 ${n}^1`,
      message: '定理保证：合数不可能包含两个大于 sqrt(n) 的不同质因子',
      log: `remainder prime factor ${n}^1`,
      line: lines.remainderPrime.javascript,
      codeLine: lines.remainderPrime,
      metrics: { '末尾大质数': `${n}` },
    });
  }

  // Step 4: 返回
  steps.push({
    originalN,
    currentRemainder: 1,
    factors: factors.map(f => ({ ...f })),
    decision: `🎉 质因数分解完成！${originalN} = ${factors.map(f => `${f.prime}^${f.power}`).join(' × ')}`,
    message: '返回完整质因数分解结果',
    log: `done prime factorization`,
    line: lines.returnAns.javascript,
    codeLine: lines.returnAns,
    metrics: { '算术分解式': factors.map(f => `${f.prime}^${f.power}`).join(' × ') },
  });

  return steps;
}
