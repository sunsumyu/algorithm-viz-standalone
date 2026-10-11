/**
 * Class 052 Code05: 柱状图中最大的矩形 (Largest Rectangle in Histogram / LeetCode 84)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../../core/input-primitives';
import { STACK_052_PROBLEMS } from './stack-052-problem-content';
import {
  LARGEST_RECTANGLE_CODES,
} from './stack-052-stage-codes';
import { renderHistogramVisualizer } from './stack-052-shared';
import {
  buildLargestRectangle052Steps,
  type LargestRectangle052Step,
} from './largest-rectangle-histogram-052-step-compiler';

export {
  buildLargestRectangle052Steps,
  type LargestRectangle052Step,
};

export const largestRectangleHistogram052Visualizer = registerDeclarativeAlgorithm<LargestRectangle052Step>({
  id: 'largest-rectangle-histogram-052',
  name: '柱状图中最大的矩形 (Class 052 Code05)',
  category: 'monotonic-stack',
  aliases: ['largest-rectangle-histogram-052', 'class052-code05'],
  difficulty: 'hard',
  learningGoal: '掌握以每个柱子作为瓶颈高度的单调栈极值扩展思想，理解左右边界界定矩形宽度的数学原理。',
  problemContent: STACK_052_PROBLEMS.largestRectangleHistogram052,
  codeLanguages: LARGEST_RECTANGLE_CODES,
  inputs: [
    {
      id: 'heights',
      label: '柱子高度',
      type: 'text',
      defaultValue: '2, 1, 5, 6, 2, 3',
      placeholder: '逗号分隔的非负整数',
    },
  ],
  presets: [
    { label: '示例 1: 官方例题 [2,1,5,6,2,3]', values: { heights: '2, 1, 5, 6, 2, 3' } },
    { label: '示例 2: 单调递增阶梯 [1,2,3,4,5]', values: { heights: '1, 2, 3, 4, 5' } },
    { label: '示例 3: 相同高度平顶 [4,4,4,4]', values: { heights: '4, 4, 4, 4' } },
    { label: '示例 4: 两头高中间低凹槽 [6,2,1,2,5]', values: { heights: '6, 2, 1, 2, 5' } },
  ],
  generateSteps: (inputs) => {
    const raw = parseNumberList(inputs.heights, '2, 1, 5, 6, 2, 3');
    return buildLargestRectangle052Steps(raw.length ? raw : [2, 1, 5, 6, 2, 3]);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = renderHistogramVisualizer(
      step.heights,
      step.stack,
      step.curI,
      step.activeRect,
      step.maxArea,
      false
    );
  },
});
