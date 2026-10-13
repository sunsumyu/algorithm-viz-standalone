/**
 * Class 079 数位 DP 基础模型 Canvas 适配器
 */

import { renderDigitDpBoard } from '../../../algorithms/categories/dynamic-programming/dp-079-083/dp-079-083-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import { type DigitDp079Step } from './digit-dp-basic-079-step-compiler';

export function renderDigitDpCanvas(container: HTMLElement, step: DigitDp079Step): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderDigitDpBoard(
      step.digits,
      step.curIdx,
      step.curDigit,
      step.isLimit,
      step.cnt1,
      step.memoSummary
    ),
    formula: {
      title: '数位 DP 状态转移与记忆化定理',
      equation: 'f(\\text{idx}, \\text{cnt}, \\text{isLimit}) = \\sum_{d=0}^{\\text{up}} f(\\text{idx}+1, \\text{cnt} + [d = 1], \\text{isLimit} \\land [d = \\text{up}])',
      explanation: '仅当 $\\text{isLimit} = \\text{false}$ 且无前导零约束时，子问题的解与上界无关，可安全写入 $\\text{memo}[\\text{idx}][\\text{cnt}]$ 避免指数级重复搜索。',
    },
  });
}
