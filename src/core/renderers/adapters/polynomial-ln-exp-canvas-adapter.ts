import { renderPolyLnExpBoard } from '../../../algorithms/categories/advanced-topics/advanced-167-172/advanced-167-172-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import { PolyLnExpStep } from './polynomial-ln-exp-step-compiler';

export function renderPolyLnExpCanvas(container: HTMLElement, step: PolyLnExpStep): void {
  composeUnifiedCanvas(container, {
    metrics: [
      { label: '当前算法阶段', value: step.stage, color: '#1d4ed8' },
      { label: '代数理论深度', value: 'EGF 指数型生成函数', color: '#059669' },
    ],
    mainBoardHtml: renderPolyLnExpBoard(step.polyA, step.polyLn, step.polyExp, step.stage),
    formula: {
      title: '多项式 ln / exp 微积分与牛顿迭代引擎',
      equation: `ln A(x) = &int; (A'(x) / A(x)) dx | exp: B &equiv; B_0(1 - ln B_0 + A) (mod x^n) | 复杂度: O(n log n)`,
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
