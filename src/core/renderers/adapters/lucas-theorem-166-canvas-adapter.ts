/**
 * Class 166: 卢卡斯定理 (Lucas Theorem) 领域视觉适配器
 * 核心：p 进制数位分解展板、数位分治机制卡与核心公式卡
 */

import { LucasStep } from './lucas-theorem-166-step-compiler';
import { renderLucasBoard } from '../../../algorithms/categories/advanced-topics/advanced-161-166/advanced-161-166-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderLucasTheorem166Canvas(container: HTMLElement, step: LucasStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderLucasBoard(step.n, step.m, step.p, step.digits, step.ans, step.stage),
    metrics: [
      {
        label: '当前算法阶段',
        value: step.stage,
        color: '#b91c1c',
      },
      {
        label: '数位分治机制',
        value: 'p 进制数位独立乘积',
        color: '#059669',
      },
    ],
    formula: {
      title: '卢卡斯定理核心公式',
      equation: 'C(n, m) \u2261 C(\u230An/p\u230B, \u230Am/p\u230B) \u00D7 C(n mod p, m mod p) (mod p) | \u220F C(n_i, m_i) mod p | 复杂度: O(p + log_p n)',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
