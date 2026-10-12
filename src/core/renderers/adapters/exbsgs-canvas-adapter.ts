import { renderEXBSGSBoard } from '../../../algorithms/categories/advanced-topics/advanced-167-172/advanced-167-172-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import { EXBSGSStep } from './exbsgs-step-compiler';

export function renderEXBSGSCanvas(container: HTMLElement, step: EXBSGSStep): void {
  composeUnifiedCanvas(container, {
    metrics: [
      { label: '当前算法阶段', value: step.stage, color: '#0369a1' },
      { label: '公因子降模', value: `累计剥离 ${step.cnt} 次因子`, color: '#059669' },
    ],
    mainBoardHtml: renderEXBSGSBoard(
      step.a,
      step.b,
      step.p,
      step.reducedA,
      step.reducedB,
      step.reducedP,
      step.d,
      step.cnt,
      step.ans,
      step.stage
    ),
    formula: {
      title: 'EXBSGS 降模核心方程',
      equation: `提取公因子: g = gcd(a, p) > 1 | 转化方程: d &middot; a^{x-cnt} &equiv; b' (mod p') | 互质后标准 BSGS: m = &lceil;&radic;p'&rceil;`,
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
