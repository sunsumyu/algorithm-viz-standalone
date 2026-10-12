import { renderEXLucasBoard } from '../../../algorithms/categories/advanced-topics/advanced-167-172/advanced-167-172-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import { EXLucasStep } from './exlucas-step-compiler';

export function renderEXLucasCanvas(container: HTMLElement, step: EXLucasStep): void {
  composeUnifiedCanvas(container, {
    metrics: [
      { label: '当前算法阶段', value: step.stage, color: '#991b1b' },
      { label: '支持模数', value: '任意正整数 (无需质数)', color: '#059669' },
    ],
    mainBoardHtml: renderEXLucasBoard(step.n, step.m, step.p, step.factors, step.ans, step.stage),
    formula: {
      title: 'EXLucas 架构方程',
      equation: `P = &prod; p_i^{k_i} | C(n, m) &equiv; a_i (mod p_i^{k_i}) | 剥离因子: cnt = &sum; &lfloor;n/p^k&rfloor; | CRT: x &equiv; &sum; a_i M_i inv(M_i) (mod P)`,
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
