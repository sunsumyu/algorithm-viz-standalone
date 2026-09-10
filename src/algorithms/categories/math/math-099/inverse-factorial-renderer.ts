/**
 * 阶乘逆元与组合数快速计算 (Factorial Inverses & nCr) - 声明式教学级沙盘渲染器
 * 核心原理：O(n) 预处理阶乘与倒推阶乘逆元，单次 O(1) 求解组合数 C(n, m)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_099_PROBLEMS } from './math-099-problem-content';
import { INVERSE_FACTORIAL_CODES, INVERSE_FACTORIAL_LINES } from './math-099-stage-codes';
import { Math099Step } from './math-099-shared';

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
    codeLine: lines.returnAns,
    metrics: { [`C(${n}, ${m})`]: `${ans}` },
  });

  return steps;
}

export const inverseFactorialVisualizer = registerDeclarativeAlgorithm<FactorialStep>({
  id: 'inverse-factorial-099',
  name: '阶乘逆元与组合数快速计算 (Factorial Inverses & nCr)',
  category: 'math',
  icon: '🎲',
  difficulty: 3,
  levelOrder: 993,
  learningGoal: '掌握阶乘倒推逆元全量预处理，达成 O(1) 极速回答任意组合数',
  problemHtml: MATH_099_PROBLEMS.inverseFactorial.html,
  analysisHtml: MATH_099_PROBLEMS.inverseFactorial.html,
  inputs: [
    {
      id: 'input-n',
      label: '总元素数 n',
      type: 'number',
      defaultValue: 10,
      min: 0,
      max: 100000,
      step: 1,
      placeholder: '例如 10',
    },
    {
      id: 'input-m',
      label: '选取数 m',
      type: 'number',
      defaultValue: 3,
      min: 0,
      max: 100000,
      step: 1,
      placeholder: '例如 3',
    },
  ],
  codeLanguages: INVERSE_FACTORIAL_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(0, parseInt(String(inputs?.['input-n'] ?? '10'), 10) || 10);
    const m = Math.max(0, parseInt(String(inputs?.['input-m'] ?? '3'), 10) || 3);
    return buildFactorialSteps(n, m);
  },
  renderCanvas: (stageContainer: HTMLElement, step: FactorialStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 组合数计算公式卡片
    const card = document.createElement('div');
    card.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.6;';
    card.innerHTML = `
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px;">
        📐 组合数逆元计算公式:
      </div>
      <div style="font-family: monospace; font-size: 14px; color: #1e293b; background: #f8fafc; padding: 8px 12px; border-radius: 6px; border-left: 3px solid #3b82f6; margin-bottom: 8px;">
        C(${step.n}, ${step.m}) = fact[${step.n}] × invFact[${step.m}] × invFact[${step.n - step.m}] % mod
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <span style="padding: 4px 8px; border-radius: 4px; background: #eff6ff; border: 1px solid #3b82f6; font-family: monospace; font-size: 11px;">
          fact[${step.n}] = ${step.factN ?? '...'}
        </span>
        <span style="padding: 4px 8px; border-radius: 4px; background: #eff6ff; border: 1px solid #3b82f6; font-family: monospace; font-size: 11px;">
          invFact[${step.m}] = ${step.invFactM ?? '...'}
        </span>
        <span style="padding: 4px 8px; border-radius: 4px; background: #eff6ff; border: 1px solid #3b82f6; font-family: monospace; font-size: 11px;">
          invFact[${step.n - step.m}] = ${step.invFactNM ?? '...'}
        </span>
      </div>
    `;
    root.appendChild(card);

    // 2. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  },
});
