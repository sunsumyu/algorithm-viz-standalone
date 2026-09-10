/**
 * Class 171: 多项式开方 (Polynomial Sqrt)
 * 牛顿迭代法倍增开方 / 洛谷 P5205 【模板】多项式开方
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_167_172_PROBLEMS } from './advanced-167-172-problem-content';
import { POLYNOMIAL_SQRT_CODES, POLYNOMIAL_SQRT_LINES } from './advanced-167-172-stage-codes';
import { Advanced167Step, renderPolySqrtBoard } from './advanced-167-172-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface PolySqrtStep extends Advanced167Step {
  polyA: number[];
  polyB: number[];
  targetDeg: number;
  currDeg: number;
  stage: string;
}

const MOD = 998244353;
const INV2 = 499122177; // 2 在模 998244353 下的乘法逆元

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

export function buildPolySqrtSteps(a: number[], deg: number): PolySqrtStep[] {
  const steps: PolySqrtStep[] = [];
  const lines = POLYNOMIAL_SQRT_LINES;

  // Step 0: 入口帧
  steps.push({
    polyA: [...a],
    polyB: [],
    targetDeg: deg,
    currDeg: 0,
    stage: '算法调用入口',
    decision: `主函数入口：准备在 mod x^${deg} 下对多项式 A(x)=[${a.slice(0, deg).join(', ')}] 求解多项式开方 B(x)`,
    message: `满足 B(x)^2 = A(x) (mod x^${deg})，且常数项 a[0]=1，利用牛顿迭代法倍增求解`,
    log: `enter polySqrt: deg=${deg}`,
    codeLine: lines.entry,
    metrics: { '开方项数界': deg, '常数项 a0': a[0], '逆元 INV2': INV2 },
  });

  // Step 1: 递归边界 deg = 1
  let b = [1];
  steps.push({
    polyA: [...a],
    polyB: [...b],
    targetDeg: deg,
    currDeg: 1,
    stage: '边界条件 (deg=1)',
    decision: `边界条件 deg=1：a[0]=1，平方根为 b[0]=sqrt(1)=1`,
    message: `此时 B0(x) = 1 满足 B0^2 = A (mod x^1)`,
    log: `baseCase: deg=1, b[0]=1`,
    codeLine: lines.baseCase,
    statusBadge: { text: 'deg=1 基础解: 1', type: 'info' },
    metrics: { '当前模数界': 'mod x^1', '常数项根': 1 },
  });

  // Step 2..k: 倍增过程
  let cur = 1;
  while (cur < deg) {
    const nextCur = Math.min(cur << 1, deg);
    // B = (B0^2 + A) / (2 B0) = B0 / 2 + A / (2 B0) mod x^(nextCur)
    // 1. 求 B0 的逆元
    const invB0 = polyInvSimple(nextCur, b);
    // 2. A * invB0 mod x^nextCur
    const aDivB0: number[] = new Array(nextCur).fill(0);
    for (let i = 0; i < nextCur; i++) {
      for (let j = 0; j < nextCur && i + j < nextCur; j++) {
        aDivB0[i + j] = (aDivB0[i + j] + (a[i] || 0) * invB0[j]) % MOD;
      }
    }
    // 3. (B0 + A/B0) * INV2 mod x^nextCur
    const nextB: number[] = new Array(nextCur).fill(0);
    for (let i = 0; i < nextCur; i++) {
      const valB0 = i < b.length ? b[i] : 0;
      nextB[i] = Number((BigInt(valB0 + aDivB0[i]) * BigInt(INV2)) % BigInt(MOD));
    }

    steps.push({
      polyA: [...a],
      polyB: [...b],
      targetDeg: deg,
      currDeg: cur,
      stage: `倍增划分 (${cur} -> ${nextCur})`,
      decision: `倍增递推：由 mod x^${cur} 解 B0 倍增推导 mod x^${nextCur} 解`,
      message: `公式: B = B0/2 + A / (2 B0) (mod x^${nextCur})，结合多项式求逆与点值卷积加速`,
      log: `recurHalf: cur=${cur} -> next=${nextCur}`,
      codeLine: lines.recurHalf,
      statusBadge: { text: `模界倍增至 x^${nextCur}`, type: 'warning' },
      metrics: { '原模界': `x^${cur}`, '新模界': `x^${nextCur}` },
    });

    b = nextB;
    cur = nextCur;

    steps.push({
      polyA: [...a],
      polyB: [...b],
      targetDeg: deg,
      currDeg: cur,
      stage: `牛顿迭代合并 (mod x^${cur})`,
      decision: `牛顿迭代合并完成：获得在 mod x^${cur} 意义下的开方多项式 B(x) = [${b.join(', ')}]`,
      message: `验证: B(x)^2 mod x^${cur} = A(x) mod x^${cur}，精度二次收敛`,
      log: `newtonStep: cur=${cur}, B=[${b.join(',')}]`,
      codeLine: lines.newtonStep,
      statusBadge: { text: `收敛至 mod x^${cur}`, type: 'info' },
      metrics: { '当前开方多项式': b.slice(0, Math.min(b.length, 4)).join(', '), '收敛阶数': cur },
    });
  }

  // 终态返回
  steps.push({
    polyA: [...a],
    polyB: [...b],
    targetDeg: deg,
    currDeg: deg,
    stage: '开方求解全部完成',
    decision: `🎉 多项式开方完成：在 mod x^${deg} 下的开方多项式为 B(x) = [${b.join(', ')}]`,
    message: `总时间复杂度 T(n) = T(n/2) + O(n log n) = O(n log n)，广泛应用于组合生成函数代数求解`,
    log: `returnAns: B=[${b.join(',')}]`,
    codeLine: lines.newtonStep,
    statusBadge: { text: '开方成功', type: 'success' },
    metrics: { '开方项数界': deg, '时间复杂度': 'O(n log n)' },
  });

  return steps;
}

export const polynomialSqrtVisualizer = registerDeclarativeAlgorithm<PolySqrtStep>({
  id: 'polynomial-sqrt-171',
  name: '多项式开方 (Class 171)',
  category: 'math',
  icon: '√',
  difficulty: 3,
  levelOrder: 171,
  description: '左程云算法通关课 Class 171：多项式开方。利用牛顿迭代法倍增推导 B = (B0 + A/B0)/2 mod x^n，结合多项式求逆，O(n log n) 极速求出平方根多项式。',
  learningGoal: '掌握牛顿迭代法在多项式二次开方方程 F(B) = B^2 - A = 0 上的展开应用，深刻理解精度倍增机制',
  problemHtml: ADVANCED_167_172_PROBLEMS.polynomialSqrt.html,
  analysisHtml: ADVANCED_167_172_PROBLEMS.polynomialSqrt.html,
  inputs: [
    {
      id: 'preset',
      label: '输入多项式与截断界',
      type: 'select',
      defaultValue: 'sqrt_quad',
      options: [
        { label: 'A=[1, 2, 1], deg=3 ((1+x)^2 完美开方为 [1, 1, 0])', value: 'sqrt_quad' },
        { label: 'A=[1, 4, 4], deg=3 ((1+2x)^2 完美开方为 [1, 2, 0])', value: 'sqrt_quad2' },
        { label: 'A=[1, 1, 1], deg=4 (1/(1-x) 展开开方示例)', value: 'sqrt_geom' },
      ],
    },
  ],
  codeLanguages: POLYNOMIAL_SQRT_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'sqrt_quad');
    if (preset === 'sqrt_quad2') return buildPolySqrtSteps([1, 4, 4], 3);
    if (preset === 'sqrt_geom') return buildPolySqrtSteps([1, 1, 1, 0], 4);
    return buildPolySqrtSteps([1, 2, 1], 3);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderPolySqrtBoard(step.polyA, step.polyB, step.targetDeg, step.currDeg, step.stage)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
            <div style="font-size: 17px; font-weight: 700; color: #047857;">${step.stage}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">迭代收敛比</div>
            <div style="font-size: 15px; font-weight: 700; color: #059669;">B &equiv; B<sub>0</sub>/2 + A/(2B<sub>0</sub>)</div>
          </div>
        </div>

        ${renderFormulaCard(
          '多项式牛顿倍增开方引擎',
          `牛顿迭代公式: B(x) &equiv; (B_0^2(x) + A(x)) / (2 B_0(x)) (mod x^n) | 边界: b_0 = &radic;a_0 | 复杂度: O(n log n)`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
