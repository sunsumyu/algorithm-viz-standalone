/**
 * 质因子分解 (Prime Factorization) - 声明式教学级沙盘渲染器
 * 核心原理：算术基本定理，自小到大剥离质因子，剩余数 > 1 必为大质数
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_097_PROBLEMS } from './math-097-problem-content';
import { PRIME_FACTORS_CODES, PRIME_FACTORS_LINES } from './math-097-stage-codes';
import { Math097Step, renderFactorEquation } from './math-097-shared';

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
    codeLine: lines.returnAns,
    metrics: { '算术分解式': factors.map(f => `${f.prime}^${f.power}`).join(' × ') },
  });

  return steps;
}

export const primeFactorsVisualizer = registerDeclarativeAlgorithm<PrimeFactorsStep>({
  id: 'prime-factors-097',
  name: '质因子分解 (Prime Factorization)',
  category: 'math',
  icon: '🌱',
  difficulty: 2,
  levelOrder: 973,
  learningGoal: '理解算术基本定理唯一性，掌握 sqrt(n) 试除与末尾剩余大质因子提取',
  problemHtml: MATH_097_PROBLEMS.primeFactors.html,
  analysisHtml: MATH_097_PROBLEMS.primeFactors.html,
  inputs: [
    {
      id: 'input-n',
      label: '待分解正整数 n',
      type: 'number',
      defaultValue: 360,
      min: 2,
      max: 1000000,
      step: 1,
      placeholder: '例如 360 或 999',
    },
  ],
  codeLanguages: PRIME_FACTORS_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(2, parseInt(String(inputs?.['input-n'] ?? '360'), 10) || 360);
    return buildPrimeFactorsSteps(n);
  },
  renderCanvas: (stageContainer: HTMLElement, step: PrimeFactorsStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 算术基本定理表达式看板
    renderFactorEquation(root, step.originalN, step.factors || [], step.currentRemainder);

    // 2. 质因子卡片瀑布流
    if (step.factors && step.factors.length > 0) {
      const cardsBox = document.createElement('div');
      cardsBox.style.cssText = 'display: flex; gap: 10px; flex-wrap: wrap; padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;';

      step.factors.forEach(f => {
        const item = document.createElement('div');
        item.style.cssText = 'padding: 8px 14px; border-radius: 6px; background: #eff6ff; border: 1.5px solid #3b82f6; display: flex; flex-direction: column; align-items: center;';
        item.innerHTML = `
          <span style="font-size: 11px; color: #64748b; font-weight: 700;">质因数</span>
          <span style="font-size: 18px; font-weight: 800; color: #1d4ed8; font-family: monospace;">${f.prime}</span>
          <span style="font-size: 11px; color: #0284c7; font-weight: 700; margin-top: 2px;">出现 ${f.power} 次</span>
        `;
        cardsBox.appendChild(item);
      });
      root.appendChild(cardsBox);
    }

    // 3. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  },
});
