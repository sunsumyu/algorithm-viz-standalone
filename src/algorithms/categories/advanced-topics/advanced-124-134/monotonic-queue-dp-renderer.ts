/**
 * Class 130: 单调队列优化 DP (Monotonic Queue DP)
 * 洛谷 P1725 琪露诺 / P3957 跳房子
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_124_134_PROBLEMS } from './advanced-124-134-problem-content';
import { MONOTONIC_QUEUE_DP_CODES } from './advanced-124-134-stage-codes';
import {
  MonotonicQueueDpStep,
  buildMonotonicQueueDpSteps,
} from '../../../../core/renderers/adapters/monotonic-queue-dp-step-compiler';
import { renderMonotonicQueueDpCanvas } from '../../../../core/renderers/adapters/monotonic-queue-dp-canvas-adapter';

export type { MonotonicQueueDpStep };
export { buildMonotonicQueueDpSteps };

export const monotonicQueueDpVisualizer = registerDeclarativeAlgorithm<MonotonicQueueDpStep>({
  id: 'monotonic-queue-dp-130',
  name: '单调队列优化 DP (Class 130)',
  aliases: ['class130-code01', 'monotonic-queue-dp', 'monotonic-queue-dp-130', 'sliding-window-dp'],
  category: 'dynamic-programming',
  icon: '🎢',
  difficulty: 3,
  levelOrder: 130,
  learningGoal: '深刻理解双端队列维护单调性与滑动窗口极值、在 O(1) 内完成状态转移优化 O(N x K) 为 O(N) 的核心思想',
  problemHtml: ADVANCED_124_134_PROBLEMS.monotonicQueueDp.html,
  analysisHtml: ADVANCED_124_134_PROBLEMS.monotonicQueueDp.html,
  inputs: [
    {
      id: 'valList',
      label: '格点收益数组 (逗号分隔)',
      type: 'text',
      defaultValue: '0,2,-3,5,1,4,-2,6',
      placeholder: '请输入各点收益数值',
    },
    {
      id: 'L',
      label: '最小跳跃跨度 L',
      type: 'number',
      defaultValue: 1,
      min: 1,
      max: 5,
    },
    {
      id: 'R',
      label: '最大跳跃跨度 R',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 6,
    },
  ],
  codeLanguages: MONOTONIC_QUEUE_DP_CODES,
  generateSteps: (input) => {
    const raw = String(input.valList || '0,2,-3,5,1,4,-2,6');
    const val = raw.split(',').map(Number);
    const L = Math.max(1, Number(input.L) || 1);
    const R = Math.max(L, Number(input.R) || 3);
    return buildMonotonicQueueDpSteps(val, L, R);
  },
  renderCanvas: (container, step) => {
    renderMonotonicQueueDpCanvas(container, step);
  },
});
