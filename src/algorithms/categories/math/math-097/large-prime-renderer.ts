/**
 * Miller-Rabin 大素数测试 (Miller-Rabin Primality Test) - 声明式教学级沙盘渲染器
 * 核心原理：费马小定理与二次探测定理，将 n-1 拆解为 d * 2^s，在 2^64 范围内由确定性基底验证
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_097_PROBLEMS } from './math-097-problem-content';
import { LARGE_PRIME_CODES, LARGE_PRIME_LINES } from './math-097-stage-codes';
import { Math097Step } from './math-097-shared';

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
    codeLine: lines.returnTrue,
    metrics: { '最终判定': '素数 (true)' },
  });

  return steps;
}

export const largePrimeVisualizer = registerDeclarativeAlgorithm<MillerRabinStep>({
  id: 'large-prime-miller-rabin-097',
  name: 'Miller-Rabin 大素数测试',
  category: 'math',
  icon: '🛡️',
  difficulty: 3,
  levelOrder: 972,
  learningGoal: '掌握费马小定理、二次探测定理与确定性基底快速素数判定',
  problemHtml: MATH_097_PROBLEMS.largePrime.html,
  analysisHtml: MATH_097_PROBLEMS.largePrime.html,
  inputs: [
    {
      id: 'input-n',
      label: '待测大正整数 n',
      type: 'number',
      defaultValue: 1000000007,
      min: 2,
      max: 2000000000,
      step: 1,
      placeholder: '例如 1000000007',
    },
  ],
  codeLanguages: LARGE_PRIME_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(2, parseInt(String(inputs?.['input-n'] ?? '1000000007'), 10) || 1000000007);
    return buildMillerRabinSteps(n);
  },
  renderCanvas: (stageContainer: HTMLElement, step: MillerRabinStep) => {
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
        ${isP === true ? '✅ 确定为素数 (Prime Number)' : isP === false ? '❌ 确定为合数 (Composite Number)' : '⏳ 正在进行 Miller-Rabin 基底探测...'}
      </div>
      <div style="font-family: monospace; font-size: 12px; color: #64748b;">
        n = ${step.n} (n-1 = ${step.d} × 2^${step.s})
      </div>
    `;
    root.appendChild(statusBanner);

    // 2. 基底测试结果卡片
    if (step.millerBases && step.millerBases.length > 0) {
      const basesCard = document.createElement('div');
      basesCard.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;';

      const chipsHtml = step.millerBases.map(b => `
        <span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 6px; background: ${b.passed ? '#ecfdf5' : '#fee2e2'}; border: 1.5px solid ${b.passed ? '#10b981' : '#ef4444'}; font-family: monospace; font-size: 12px; font-weight: 700; color: ${b.passed ? '#047857' : '#b91c1c'};">
          基底 a=${b.base} ${b.passed ? '✓ 通过' : '✕ 失败'}
        </span>
      `).join(' ');

      basesCard.innerHTML = `
        <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">
          🔬 二次探测定理基底测试结果:
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">${chipsHtml}</div>
      `;
      root.appendChild(basesCard);
    }

    // 3. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  },
});
