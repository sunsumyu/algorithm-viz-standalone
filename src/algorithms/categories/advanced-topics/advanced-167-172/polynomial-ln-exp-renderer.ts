/**
 * Class 172: 多项式对数与指数 (Polynomial Ln & Exp)
 * ln A(x) = integral(A'/A) dx 与 exp 牛顿迭代 / 洛谷 P4725 / P4726
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_167_172_PROBLEMS } from './advanced-167-172-problem-content';
import { POLYNOMIAL_LN_EXP_CODES, POLYNOMIAL_LN_EXP_LINES } from './advanced-167-172-stage-codes';
import { Advanced167Step, renderPolyLnExpBoard } from './advanced-167-172-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface PolyLnExpStep extends Advanced167Step {
  polyA: number[];
  polyLn?: number[];
  polyExp?: number[];
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

function invMod(n: number): number {
  return power(n, MOD - 2);
}

// 辅助求逆
function polyInvSimple(deg: number, a: number[]): number[] {
  let b = [power(a[0], MOD - 2)];
  let cur = 1;
  while (cur < deg) {
    const nextCur = Math.min(cur << 1, deg);
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
    const nextB: number[] = new Array(nextCur).fill(0);
    for (let i = 0; i < b.length; i++) {
      for (let j = 0; j < nextCur && i + j < nextCur; j++) {
        nextB[i + j] = (nextB[i + j] + b[i] * twoMinus[j]) % MOD;
      }
    }
    b = nextB;
    cur = nextCur;
  }
  return b;
}

export function buildPolyLnExpSteps(a: number[], deg: number): PolyLnExpStep[] {
  const steps: PolyLnExpStep[] = [];
  const lines = POLYNOMIAL_LN_EXP_LINES;

  // Step 0: 入口帧
  steps.push({
    polyA: [...a],
    stage: '主函数入口',
    decision: `主函数入口：准备对形式幂级数 A(x)=[${a.slice(0, deg).join(', ')}] 计算 ln A(x) 与 exp A(x)`,
    message: `形式幂级数常数项 a[0]=1，微积分求导、求逆、卷积与不定积分是生成函数的核心纽带`,
    log: `enter polyLnExp: deg=${deg}`,
    codeLine: lines.entry,
    metrics: { '多项式项数': deg, '常数项 a0': a[0], '算法模式': '微积分 + 牛顿迭代' },
  });

  // Step 1: 逐项求导 A'(x)
  const da: number[] = [];
  for (let i = 1; i < deg; i++) {
    da.push(Number((BigInt(i) * BigInt(a[i])) % BigInt(MOD)));
  }

  steps.push({
    polyA: [...a],
    stage: '形式求导 A\'(x)',
    decision: `逐项求导：A'(x) = [${da.join(', ')}]`,
    message: `(a_i * x^i)' = i * a_i * x^(i-1)，消除常数项，次数降一阶`,
    log: `derivStep: da=[${da.join(',')}]`,
    codeLine: lines.derivStep,
    statusBadge: { text: '求导完成', type: 'info' },
    metrics: { '求导多项式': da.join(', '), '导数项数': da.length },
  });

  // Step 2: 多项式求逆 A^(-1)(x)
  const invA = polyInvSimple(deg, a);
  steps.push({
    polyA: [...a],
    stage: '多项式求逆 A^(-1)(x)',
    decision: `牛顿迭代求逆：A^(-1)(x) = [${invA.join(', ')}]`,
    message: `作为微积分分母项，满足 A(x) * A^(-1)(x) = 1 (mod x^${deg})`,
    log: `invStep: invA=[${invA.join(',')}]`,
    codeLine: lines.invStep,
    statusBadge: { text: '求逆完成', type: 'warning' },
    metrics: { '逆元多项式': invA.join(', ') },
  });

  // Step 3: 点值相乘并逐项积分求得 ln A(x)
  const tmpMul: number[] = new Array(deg).fill(0);
  for (let i = 0; i < da.length; i++) {
    for (let j = 0; j < invA.length && i + j < deg; j++) {
      tmpMul[i + j] = (tmpMul[i + j] + da[i] * invA[j]) % MOD;
    }
  }
  const lnA = [0];
  for (let i = 1; i < deg; i++) {
    lnA.push(Number((BigInt(tmpMul[i - 1]) * BigInt(invMod(i))) % BigInt(MOD)));
  }

  steps.push({
    polyA: [...a],
    polyLn: [...lnA],
    stage: '不定积分还原 ln A(x)',
    decision: `逐项不定积分：ln A(x) = integral(A'/A) dx = [${lnA.join(', ')}]`,
    message: `根据复合函数链式法则，导数与逆元相乘后通过乘法逆元 inv(i) 积分还原，常数项 ln(1)=0`,
    log: `integralStep: lnA=[${lnA.join(',')}]`,
    codeLine: lines.integralStep,
    statusBadge: { text: 'ln A(x) 计算完成', type: 'success' },
    metrics: { '对数多项式': lnA.join(', '), '常数项': 0 },
  });

  // Step 4: exp A(x) 牛顿迭代
  // 简易计算 exp 系数 (Taylor 展开或牛顿迭代近似)
  // 当 a=[0, 1] 即 A(x)=x 时，exp(x) = [1, 1, 1/2, 1/6, 1/24, ...]
  const expA: number[] = new Array(deg).fill(0);
  expA[0] = 1;
  // 利用 B' = A' * B 关系递推 exp 前几项系数
  for (let i = 1; i < deg; i++) {
    let sum = 0n;
    for (let j = 1; j <= i; j++) {
      const aj = j < a.length ? a[j] : 0;
      sum = (sum + BigInt(j) * BigInt(aj) * BigInt(expA[i - j])) % BigInt(MOD);
    }
    expA[i] = Number((sum * BigInt(invMod(i))) % BigInt(MOD));
  }

  steps.push({
    polyA: [...a],
    polyLn: [...lnA],
    polyExp: [...expA],
    stage: 'exp A(x) 牛顿迭代求解',
    decision: `牛顿迭代递推：exp A(x) = [${expA.join(', ')}]`,
    message: `利用 F(B) = ln(B) - A = 0 建立牛顿倍增式 B = B0(1 - ln(B0) + A)，或利用微分方程递推`,
    log: `expNewton: expA=[${expA.join(',')}]`,
    codeLine: lines.expNewton,
    statusBadge: { text: 'exp A(x) 计算完成', type: 'success' },
    metrics: { '指数多项式': expA.join(', '), '时间复杂度': 'O(n log n)' },
  });

  // 终态返回
  steps.push({
    polyA: [...a],
    polyLn: [...lnA],
    polyExp: [...expA],
    stage: '对数与指数全部完成',
    decision: `🎉 多项式 ln 与 exp 计算全部完成：ln A(x)=[${lnA.join(', ')}]，exp A(x)=[${expA.join(', ')}]`,
    message: `在组合计数中，ln 实现无向连通图与一般图的相互转换，exp 实现集族到图的欧拉变换，是生成函数理论的巅峰`,
    log: `returnAns: complete`,
    codeLine: lines.expNewton,
    statusBadge: { text: 'ln / exp 求解成功', type: 'success' },
    metrics: { '对数多项式': lnA.join(', '), '指数多项式': expA.join(', ') },
  });

  return steps;
}

export const polynomialLnExpVisualizer = registerDeclarativeAlgorithm<PolyLnExpStep>({
  id: 'polynomial-ln-exp-172',
  name: '多项式对数与指数 ln/exp (Class 172)',
  category: 'math',
  icon: '📈',
  difficulty: 3,
  levelOrder: 172,
  description: '左程云算法通关课 Class 172：多项式对数函数 ln 与指数函数 exp。ln A = integral(A\'/A) dx 与 exp 牛顿迭代倍增，组合生成函数巅峰利器。',
  learningGoal: '掌握微积分在形式幂级数上的映射规则，深刻理解 ln/exp 在无向连通图计数与有标号集合划分中的代数威力',
  problemHtml: ADVANCED_167_172_PROBLEMS.polynomialLnExp.html,
  analysisHtml: ADVANCED_167_172_PROBLEMS.polynomialLnExp.html,
  inputs: [
    {
      id: 'preset',
      label: '输入多项式与阶数界',
      type: 'select',
      defaultValue: 'ln_exp_linear',
      options: [
        { label: 'A=[1, 1, 0, 0] (1+x, Taylor 展开 ln(1+x))', value: 'ln_exp_linear' },
        { label: 'A=[1, 2, 1, 0] ((1+x)^2, 2*ln(1+x))', value: 'ln_exp_quad' },
      ],
    },
  ],
  codeLanguages: POLYNOMIAL_LN_EXP_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'ln_exp_linear');
    if (preset === 'ln_exp_quad') return buildPolyLnExpSteps([1, 2, 1, 0], 4);
    return buildPolyLnExpSteps([1, 1, 0, 0], 4);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderPolyLnExpBoard(step.polyA, step.polyLn, step.polyExp, step.stage)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
            <div style="font-size: 17px; font-weight: 700; color: #1d4ed8;">${step.stage}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">代数理论深度</div>
            <div style="font-size: 15px; font-weight: 700; color: #059669;">EGF 指数型生成函数</div>
          </div>
        </div>

        ${renderFormulaCard(
          '多项式 ln / exp 微积分与牛顿迭代引擎',
          `ln A(x) = &int; (A'(x) / A(x)) dx | exp: B &equiv; B_0(1 - ln B_0 + A) (mod x^n) | 复杂度: O(n log n)`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
