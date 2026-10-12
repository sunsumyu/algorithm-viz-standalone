/**
 * Class 164: 杜教筛 (Dujiao Sieve) 领域视觉适配器
 * 核心：数论分块与前缀和沙盘、当前算法阶段卡、亚线性复杂度突破卡与狄利克雷卷积恒等式卡
 */

import { DujiaoStep } from './dujiao-sieve-step-compiler';
import { renderDujiaoBoard } from '../../../algorithms/categories/advanced-topics/advanced-161-166/advanced-161-166-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderDujiaoSieveCanvas(container: HTMLElement, step: DujiaoStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderDujiaoBoard(step.n, step.preLimit, step.blocks, step.memoCount, step.finalAns, step.stage),
    metrics: [
      {
        label: '当前算法阶段',
        value: step.stage,
        color: '#7e22ce',
      },
      {
        label: '复杂度突破',
        value: 'O(N) -> O(N<sup>2/3</sup>) 亚线性',
        color: '#059669',
      },
    ],
    formula: {
      title: '杜教筛狄利克雷卷积恒等式',
      equation: '恒等式: g(1) S(n) = \u2211_{i=1}^n (f * g)(i) - \u2211_{d=2}^n g(d) S(\u230An/d\u230B) | \u03BC * 1 = e \u21D2 S_\u03BC(n) = 1 - \u2211_{d=2}^n S_\u03BC(\u230An/d\u230B)',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
