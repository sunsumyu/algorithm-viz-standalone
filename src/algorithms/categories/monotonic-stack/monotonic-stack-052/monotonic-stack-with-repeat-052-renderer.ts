/**
 * Class 052 Code02: 单调栈有重复值进阶模板 (链表压栈与批量清算)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../../core/input-primitives';
import { STACK_052_PROBLEMS } from './stack-052-problem-content';
import {
  MONOTONIC_WITH_REPEAT_CODES,
} from './stack-052-stage-codes';
import {
  renderMonotonicStackBoard,
} from './stack-052-shared';
import {
  buildMonotonicWithRepeatSteps,
  type MonotonicWithRepeatStep,
} from './monotonic-stack-with-repeat-052-step-compiler';

export {
  buildMonotonicWithRepeatSteps,
  type MonotonicWithRepeatStep,
};

export const monotonicStackWithRepeat052Visualizer = registerDeclarativeAlgorithm<MonotonicWithRepeatStep>({
  id: 'monotonic-stack-with-repeat-052',
  name: '单调栈有重复值进阶模板 (Class 052 Code02)',
  category: 'monotonic-stack',
  aliases: ['monotonic-stack-with-repeat', 'class052-code02'],
  difficulty: 'hard',
  learningGoal: '掌握重复元素单调栈的链表压入与批量清算技术，消除重复值引发的判断盲区。',
  problemContent: STACK_052_PROBLEMS.monotonicStackWithRepeat052,
  codeLanguages: MONOTONIC_WITH_REPEAT_CODES,
  inputs: [
    {
      id: 'arr',
      label: '输入数组(含重复值)',
      type: 'text',
      defaultValue: '3, 1, 3, 4, 3, 5, 3, 2, 2',
      placeholder: '逗号分隔的整数列表',
    },
  ],
  presets: [
    { label: '示例 1: 经典多重峰谷 [3,1,3,4,3,5,3,2,2]', values: { arr: '3, 1, 3, 4, 3, 5, 3, 2, 2' } },
    { label: '示例 2: 相邻重复波浪 [2,2,4,4,1,1,3,3]', values: { arr: '2, 2, 4, 4, 1, 1, 3, 3' } },
    { label: '示例 3: 全部相同 [5,5,5,5,5]', values: { arr: '5, 5, 5, 5, 5' } },
  ],
  generateSteps: (inputs) => {
    const raw = parseNumberList(inputs.arr, '3, 1, 3, 4, 3, 5, 3, 2, 2');
    return buildMonotonicWithRepeatSteps(raw.length ? raw : [3, 1, 3, 4, 3, 5, 3, 2, 2]);
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
        titleBadge: '含重复值列表单调递增栈',
        ruleText: '🔺 相同值追加在列表末尾，遇更小值整表弹出结算',
      }
    );
  },
});
