/**
 * Class 170: 多项式除法与取模 (Polynomial Division & Modulo)
 * 系数翻转消去余式 / 洛谷 P4512 【模板】多项式除法
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_167_172_PROBLEMS } from './advanced-167-172-problem-content';
import { POLYNOMIAL_DIVISION_CODES, POLYNOMIAL_DIVISION_LINES } from './advanced-167-172-stage-codes';
import { Advanced167Step, renderPolyDivBoard } from './advanced-167-172-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface PolyDivStep extends Advanced167Step {
  polyA: number[];
  polyB: number[];
  polyQ?: number[];
  polyR?: number[];
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

// 辅助求逆（截断至 deg 项）
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

export function buildPolyDivSteps(a: number[], b: number[]): PolyDivStep[] {
  const steps: PolyDivStep[] = [];
  const lines = POLYNOMIAL_DIVISION_LINES;

  const n = a.length;
  const m = b.length;
  const qLen = n - m + 1;

  // Step 0: 入口帧
  steps.push({
    polyA: [...a],
    polyB: [...b],
    stage: '主函数入口',
    decision: `主函数入口：准备进行多项式除法 A(x) = Q(x) * B(x) + R(x)`,
    message: `A(x) 最高次数为 ${n - 1}，B(x) 最高次数为 ${m - 1}，目标求商式 Q(x) (次数 ${n - m}) 与余式 R(x) (次数 < ${m - 1})`,
    log: `enter polyDiv: degA=${n - 1}, degB=${m - 1}`,
    codeLine: lines.entry,
    metrics: { '被除式项数': n, '除式项数': m, '商式项数': qLen },
  });

  // Step 1: 系数翻转
  const aRev = [...a].reverse();
  const bRev = [...b].reverse();

  steps.push({
    polyA: [...a],
    polyB: [...b],
    stage: '构造反转系数 A^R 与 B^R',
    decision: `系数反转：构造 A^R(x) = [${aRev.join(', ')}] 与 B^R(x) = [${bRev.join(', ')}]`,
    message: `代入 1/x 并乘以 x^n，原式变为 A^R(x) = Q^R(x) * B^R(x) + x^(n-m+1) R^R(x)，在 mod x^${qLen} 意义下余式项被完美消除！`,
    log: `revCoeffs: A_rev=[${aRev.join(',')}], B_rev=[${bRev.join(',')}]`,
    codeLine: lines.revCoeffs,
    statusBadge: { text: '反转消去余式', type: 'info' },
    metrics: { '截断模项': `mod x^${qLen}`, '翻转长度': qLen },
  });

  // Step 2: 多项式求逆与商式求解
  const invB = polyInvSimple(qLen, bRev);
  // Q^R = (A^R * invB) mod x^qLen
  const qRev: number[] = new Array(qLen).fill(0);
  for (let i = 0; i < qLen; i++) {
    for (let j = 0; j < qLen && i + j < qLen; j++) {
      qRev[i + j] = (qRev[i + j] + aRev[i] * invB[j]) % MOD;
    }
  }
  const q = [...qRev].reverse();

  steps.push({
    polyA: [...a],
    polyB: [...b],
    polyQ: [...q],
    stage: '求逆并还原商式 Q(x)',
    decision: `商式求解成功：Q^R = A^R * (B^R)^(-1) mod x^${qLen}，再翻转还原得到商式 Q(x) = [${q.join(', ')}]`,
    message: `整个商式求解在 O(n log n) 内完成，彻底规避了高斯消元 O(n^3) 复杂度`,
    log: `computeQ: Q=[${q.join(',')}]`,
    codeLine: lines.computeQ,
    statusBadge: { text: `求得商式 Q(x)`, type: 'warning' },
    metrics: { '商式 Q(x)': q.join(', '), '商式次数': q.length - 1 },
  });

  // Step 3: 回代计算余式 R(x) = A(x) - Q(x) * B(x)
  const qb: number[] = new Array(n).fill(0);
  for (let i = 0; i < q.length; i++) {
    for (let j = 0; j < b.length && i + j < n; j++) {
      qb[i + j] = (qb[i + j] + q[i] * b[j]) % MOD;
    }
  }
  const r: number[] = [];
  for (let i = 0; i < m - 1; i++) {
    r.push((a[i] - qb[i] + MOD) % MOD);
  }
  if (r.length === 0) r.push(0);

  steps.push({
    polyA: [...a],
    polyB: [...b],
    polyQ: [...q],
    polyR: [...r],
    stage: '回代计算余式 R(x)',
    decision: `回代减法：余式 R(x) = A(x) - Q(x) * B(x) = [${r.join(', ')}]`,
    message: `余式次数严格小于除式最高次数 ${m - 1}，除法与取模计算全部完毕`,
    log: `calcRemainder: R=[${r.join(',')}]`,
    codeLine: lines.calcRemainder,
    statusBadge: { text: `求得余式 R(x)`, type: 'info' },
    metrics: { '余式 R(x)': r.join(', '), '余式次数': r.length - 1 },
  });

  // Step 4: 终态
  steps.push({
    polyA: [...a],
    polyB: [...b],
    polyQ: [...q],
    polyR: [...r],
    stage: '除法与取模全部完成',
    decision: `🎉 多项式除法全部完成：商式 Q(x)=[${q.join(', ')}]，余式 R(x)=[${r.join(', ')}]`,
    message: `多项式除法是多项式多点求值、快速插值与常系数线性递推的基础底座`,
    log: `returnAns: complete`,
    codeLine: lines.calcRemainder,
    statusBadge: { text: '除法取模完成', type: 'success' },
    metrics: { '商式 Q': q.join(', '), '余式 R': r.join(', '), '时间复杂度': 'O(n log n)' },
  });

  return steps;
}

export const polynomialDivisionVisualizer = registerDeclarativeAlgorithm<PolyDivStep>({
  id: 'polynomial-division-170',
  name: '多项式除法与取模 (Class 170)',
  category: 'math',
  icon: '➗',
  difficulty: 3,
  levelOrder: 170,
  description: '左程云算法通关课 Class 170：多项式除法与取模。通过代入 1/x 系数翻转消去余式，结合多项式求逆，O(n log n) 极速求出商式与余式。',
  learningGoal: '掌握反转系数消去未定余式项的核心代数手法，理解多项式求逆与回代相消求余全流程',
  problemHtml: ADVANCED_167_172_PROBLEMS.polynomialDivision.html,
  analysisHtml: ADVANCED_167_172_PROBLEMS.polynomialDivision.html,
  inputs: [
    {
      id: 'preset',
      label: '被除式与除式参数',
      type: 'select',
      defaultValue: 'div_cubic_linear',
      options: [
        { label: 'A=[4, 3, 2, 1] (x^3+2x^2+3x+4), B=[1, 1] (x+1) (商: x^2+x+2, 余: 2)', value: 'div_cubic_linear' },
        { label: 'A=[1, 2, 1], B=[1, 1] ((x+1)^2 / (x+1) 整除示例)', value: 'div_exact' },
      ],
    },
  ],
  codeLanguages: POLYNOMIAL_DIVISION_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'div_cubic_linear');
    if (preset === 'div_exact') return buildPolyDivSteps([1, 2, 1], [1, 1]);
    return buildPolyDivSteps([4, 3, 2, 1], [1, 1]);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderPolyDivBoard(step.polyA, step.polyB, step.polyQ, step.polyR, step.stage)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
            <div style="font-size: 17px; font-weight: 700; color: #7e22ce;">${step.stage}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">消除余式技巧</div>
            <div style="font-size: 15px; font-weight: 700; color: #059669;">翻转系数 mod x<sup>n-m+1</sup></div>
          </div>
        </div>

        ${renderFormulaCard(
          '多项式除法翻转核心方程',
          `A(x) = Q(x) B(x) + R(x) &rArr; A^R(x) &equiv; Q^R(x) &middot; B^R(x) (mod x^{n-m+1}) | Q^R = A^R &middot; (B^R)^{-1} | R = A - Q &middot; B`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
