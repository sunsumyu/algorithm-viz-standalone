import { renderPolySqrtBoard } from '../../../algorithms/categories/advanced-topics/advanced-167-172/advanced-167-172-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import { PolySqrtStep } from './polynomial-sqrt-step-compiler';

export function renderPolySqrtCanvas(container: HTMLElement, step: PolySqrtStep): void {
  composeUnifiedCanvas(container, {
    metrics: [
      { label: '当前算法阶段', value: step.stage, color: '#047857' },
      { label: '迭代收敛比', value: 'B &equiv; B0/2 + A/(2B0)', color: '#059669' },
    ],
    mainBoardHtml: renderPolySqrtBoard(step.polyA, step.polyB, step.targetDeg, step.currDeg, step.stage),
    formula: {
      title: '多项式牛顿倍增开方引擎',
      equation: `牛顿迭代公式: B(x) &equiv; (B_0^2(x) + A(x)) / (2 B_0(x)) (mod x^n) | 边界: b_0 = &radic;a_0 | 复杂度: O(n log n)`,
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
