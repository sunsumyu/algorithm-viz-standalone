/**
 * Class 162: 多项式求逆 (Polynomial Inverse) 领域视觉适配器
 * 核心：多项式系数与逆元展板、当前阶段卡、牛顿迭代二次收敛特性卡与倍增引擎卡
 */

import { PolyInvStep } from './polynomial-inverse-step-compiler';
import { renderPolyInvBoard } from '../../../algorithms/categories/advanced-topics/advanced-161-166/advanced-161-166-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderPolynomialInverseCanvas(container: HTMLElement, step: PolyInvStep): void {
  composeUnifiedCanvas(container, {
    metrics: [
      { label: '当前算法阶段', value: step.stage, color: '#b45309' },
      { label: '牛顿迭代特性', value: '二次收敛: 精度每轮翻倍', color: '#059669' },
    ],
    mainBoardHtml: renderPolyInvBoard(step.polyA, step.polyB, step.targetDeg, step.currDeg, step.stage),
    formula: {
      title: '多项式牛顿迭代倍增引擎',
      equation: `牛顿迭代公式: B(x) &equiv; B_0(x) &middot; (2 - A(x) &middot; B_0(x)) (mod x^n) | 边界: b_0 = a_0^{-1} mod P | 复杂度: T(n) = T(n/2) + O(n log n) = O(n log n)`,
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
