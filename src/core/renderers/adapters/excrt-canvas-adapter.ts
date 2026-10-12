import { renderEXCRTBoard } from '../../../algorithms/categories/advanced-topics/advanced-167-172/advanced-167-172-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import { EXCRTStep } from './excrt-step-compiler';

export function renderEXCRTCanvas(container: HTMLElement, step: EXCRTStep): void {
  composeUnifiedCanvas(container, {
    metrics: [
      { label: '当前算法阶段', value: step.stage, color: '#b45309' },
      { label: '算法泛化能力', value: '不要求模数互质 (真超集)', color: '#059669' },
    ],
    mainBoardHtml: renderEXCRTBoard(step.equations, step.mergedCount, step.currM, step.currR, step.stage),
    formula: {
      title: 'EXCRT 双方程合并方程',
      equation: `合并方程: M &middot; t &equiv; r_k - R (mod m_k) | 可解判定: (r_k - R) mod gcd(M, m_k) == 0 | 模数更新: M' = lcm(M, m_k) = M / gcd * m_k`,
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
