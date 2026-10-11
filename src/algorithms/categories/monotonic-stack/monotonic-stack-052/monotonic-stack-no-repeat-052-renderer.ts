/**
 * Class 052 Code01: 单调栈无重复值标准模板 (求解左右最近较小值)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../../core/input-primitives';
import { STACK_052_PROBLEMS } from './stack-052-problem-content';
import {
  MONOTONIC_NO_REPEAT_CODES,
} from './stack-052-stage-codes';
import {
  renderMonotonicStackBoard,
} from './stack-052-shared';
import {
  buildMonotonicNoRepeatSteps,
  type MonotonicNoRepeatStep,
} from './monotonic-stack-no-repeat-052-step-compiler';

export {
  buildMonotonicNoRepeatSteps,
  type MonotonicNoRepeatStep,
};

export const monotonicStackNoRepeat052Visualizer = registerDeclarativeAlgorithm<MonotonicNoRepeatStep>({
  id: 'monotonic-stack-no-repeat-052',
  name: '单调栈无重复值标准模板 (Class 052 Code01)',
  category: 'monotonic-stack',
  aliases: ['monotonic-stack-no-repeat', 'class052-code01', 'luogu-p5788'],
  difficulty: 'medium',
  learningGoal: '掌握底到顶单调递增栈原理，理解破坏单调性时的出栈结算机制与清算阶段。',
  problemContent: STACK_052_PROBLEMS.monotonicStackNoRepeat052,
  codeLanguages: MONOTONIC_NO_REPEAT_CODES,
  inputs: [
    {
      id: 'arr',
      label: '输入数组',
      type: 'text',
      defaultValue: '3, 4, 1, 5, 2',
      placeholder: '逗号分隔的无重复整数',
    },
  ],
  presets: [
    { label: '示例 1: 经典乱序 [3,4,1,5,2]', values: { arr: '3, 4, 1, 5, 2' } },
    { label: '示例 2: 单调递增 [1,2,3,4,5]', values: { arr: '1, 2, 3, 4, 5' } },
    { label: '示例 3: 单调递减 [5,4,3,2,1]', values: { arr: '5, 4, 3, 2, 1' } },
    { label: '示例 4: 山峰与山谷 [4,7,2,8,1,6]', values: { arr: '4, 7, 2, 8, 1, 6' } },
  ],
  generateSteps: (inputs) => {
    const raw = parseNumberList(inputs.arr, '3, 4, 1, 5, 2');
    return buildMonotonicNoRepeatSteps(raw.length ? raw : [3, 4, 1, 5, 2]);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = renderMonotonicStackBoard(
      step.arr,
      step.stack,
      step.settled,
      step.curI,
      step.popped,
      {
        type: 'less',
        titleBadge: '无重复值标准单调递增栈',
        ruleText: '🔺 底到顶单调递增（遇小出栈结算）',
      }
    );
  },
});
