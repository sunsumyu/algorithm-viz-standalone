/**
 * 单调队列优化 DP (Monotonic Queue DP) Canvas 适配器
 */

import { MonotonicQueueDpStep } from './monotonic-queue-dp-step-compiler';
import { renderMonotonicQueueVisual } from '../../../algorithms/categories/advanced-topics/advanced-124-134/advanced-124-134-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderMonotonicQueueDpCanvas(container: HTMLElement, step: MonotonicQueueDpStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderMonotonicQueueVisual(step.val, step.dp, step.curI, step.q, step.L, step.R),
    metrics: [
      {
        label: '当前推进到位置',
        value: `i = ${step.curI}`,
        color: '#4338ca',
      },
      {
        label: '当前队头最优决策',
        value: step.q.length > 0 ? `j=${step.q[0]} (dp=${step.dp[step.q[0]]})` : '暂无',
        color: '#059669',
      },
      {
        label: '终点最大收益',
        value: step.bestAns !== undefined ? step.bestAns : step.dp[step.curI],
        color: '#d97706',
      },
    ],
    formula: {
      title: '单调队列决策排除状态',
      equation: `当前队列: [${step.q.join(', ')}] | 窗口 [i-${step.R}, i-${step.L}]`,
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
