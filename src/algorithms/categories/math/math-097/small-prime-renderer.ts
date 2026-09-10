/**
 * 试除法判素数 (Trial Division Prime) - 声明式教学级沙盘渲染器
 * 核心原理：6k±1 步长试除，检验 2 ~ sqrt(n) 之间的因子
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_097_PROBLEMS } from './math-097-problem-content';
import { SMALL_PRIME_CODES, SMALL_PRIME_LINES } from './math-097-stage-codes';
import { Math097Step } from './math-097-shared';

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
    codeLine: lines.returnPrime,
    metrics: { '判定结果': '素数 (true)' },
  });

  return steps;
}

export const smallPrimeVisualizer = registerDeclarativeAlgorithm<SmallPrimeStep>({
  id: 'small-prime-097',
  name: '试除法判素数 (Trial Division Prime)',
  category: 'math',
  icon: '🔍',
  difficulty: 2,
  levelOrder: 971,
  learningGoal: '掌握 6k±1 试除加速与 sqrt(n) 边界剪枝数论原理',
  problemHtml: MATH_097_PROBLEMS.smallPrime.html,
  analysisHtml: MATH_097_PROBLEMS.smallPrime.html,
  inputs: [
    {
      id: 'input-n',
      label: '待测正整数 n',
      type: 'number',
      defaultValue: 97,
      min: 1,
      max: 100000,
      step: 1,
      placeholder: '例如 97 或 100',
    },
  ],
  codeLanguages: SMALL_PRIME_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(1, parseInt(String(inputs?.['input-n'] ?? '97'), 10) || 97);
    return buildSmallPrimeSteps(n);
  },
  renderCanvas: (stageContainer: HTMLElement, step: SmallPrimeStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 顶部状态
    const statusBanner = document.createElement('div');
    const isP = step.isResultPrime;
    const bg = isP === true ? '#ecfdf5' : isP === false ? '#fef2f2' : '#f8fafc';
    const border = isP === true ? '#10b981' : isP === false ? '#ef4444' : '#cbd5e1';
    const color = isP === true ? '#047857' : isP === false ? '#b91c1c' : '#334155';

    statusBanner.style.cssText = `padding: 10px 16px; background: ${bg}; border-radius: 8px; border: 1.5px solid ${border}; display: flex; align-items: center; justify-content: space-between;`;
    statusBanner.innerHTML = `
      <div style="font-weight: 800; font-size: 14px; color: ${color};">
        ${isP === true ? '✅ 质数 (Prime Number)' : isP === false ? '❌ 合数 (Composite Number)' : '⏳ 正在逐步试除检测中...'}
      </div>
      <div style="font-family: monospace; font-size: 12px; color: #64748b;">
        n = ${step.n}
      </div>
    `;
    root.appendChild(statusBanner);

    // 2. 已测试因子记录看板
    if (step.testedDivisors && step.testedDivisors.length > 0) {
      const card = document.createElement('div');
      card.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;';
      const itemsHtml = step.testedDivisors.map(d => `
        <span style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 6px; background: ${d.isFactor ? '#fee2e2' : '#f1f5f9'}; border: 1px solid ${d.isFactor ? '#ef4444' : '#cbd5e1'}; font-family: monospace; font-size: 12px;">
          ${d.divisor} ${d.isFactor ? '💥 整除' : '✕'}
        </span>
      `).join(' ');

      card.innerHTML = `
        <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">
          🔬 试除因子检验队列:
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">${itemsHtml}</div>
      `;
      root.appendChild(card);
    }

    // 3. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  },
});
