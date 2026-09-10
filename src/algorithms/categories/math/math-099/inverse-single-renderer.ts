/**
 * 乘法逆元单点求法 (Modular Inverse Single) - 声明式教学级沙盘渲染器
 * 核心原理：费马小定理 a^(p-1) ≡ 1 (mod p) ➔ a^(-1) ≡ a^(p-2) (mod p)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_099_PROBLEMS } from './math-099-problem-content';
import { INVERSE_SINGLE_CODES, INVERSE_SINGLE_LINES } from './math-099-stage-codes';
import { Math099Step, renderInverseCards } from './math-099-shared';

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
    codeLine: lines.returnAns,
    metrics: { '乘法逆元': `${inv}`, '模乘检验': `${verification}` },
  });

  return steps;
}

export const inverseSingleVisualizer = registerDeclarativeAlgorithm<InverseSingleStep>({
  id: 'inverse-single-099',
  name: '乘法逆元单点求法 (Modular Inverse Single)',
  category: 'math',
  icon: '➗',
  difficulty: 2,
  levelOrder: 991,
  learningGoal: '掌握质数模数下费马小定理 a^(p-2) 快速幂求逆元与除法取模转化',
  problemHtml: MATH_099_PROBLEMS.inverseSingle.html,
  analysisHtml: MATH_099_PROBLEMS.inverseSingle.html,
  inputs: [
    {
      id: 'input-a',
      label: '底数 a',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 1000000,
      step: 1,
      placeholder: '例如 3',
    },
    {
      id: 'input-p',
      label: '质数模数 p',
      type: 'number',
      defaultValue: 1000000007,
      min: 2,
      max: 1000000007,
      step: 1,
      placeholder: '例如 1000000007',
    },
  ],
  codeLanguages: INVERSE_SINGLE_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const a = Math.max(1, parseInt(String(inputs?.['input-a'] ?? '3'), 10) || 3);
    const p = Math.max(2, parseInt(String(inputs?.['input-p'] ?? '1000000007'), 10) || 1000000007);
    return buildInverseSingleSteps(a, p);
  },
  renderCanvas: (stageContainer: HTMLElement, step: InverseSingleStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 逆元卡片展示
    if (step.inversesTable) {
      renderInverseCards(root, step.inversesTable, step.activeNum, step.p);
    }

    // 2. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  },
});
