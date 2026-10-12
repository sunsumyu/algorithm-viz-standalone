import { renderPolyDivBoard } from '../../../algorithms/categories/advanced-topics/advanced-167-172/advanced-167-172-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import { PolyDivStep } from './polynomial-division-step-compiler';

export function renderPolyDivCanvas(container: HTMLElement, step: PolyDivStep): void {
  composeUnifiedCanvas(container, {
    metrics: [
      { label: '当前算法阶段', value: step.stage, color: '#7e22ce' },
      { label: '消除余式技巧', value: '翻转系数 mod x^{n-m+1}', color: '#059669' },
    ],
    mainBoardHtml: renderPolyDivBoard(step.polyA, step.polyB, step.polyQ, step.polyR, step.stage),
    formula: {
      title: '多项式除法翻转核心方程',
      equation: `A(x) = Q(x) B(x) + R(x) &rArr; A^R(x) &equiv; Q^R(x) &middot; B^R(x) (mod x^{n-m+1}) | Q^R = A^R &middot; (B^R)^{-1} | R = A - Q &middot; B`,
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
