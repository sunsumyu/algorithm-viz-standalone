/**
 * Class 052 Code03: 每日温度 (Daily Temperatures / LeetCode 739)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../../core/input-primitives';
import { STACK_052_PROBLEMS } from './stack-052-problem-content';
import {
  DAILY_TEMPERATURES_CODES,
} from './stack-052-stage-codes';
import {
  buildDailyTemperatures052Steps,
  type DailyTemp052Step,
} from './daily-temperatures-052-step-compiler';
import { renderDailyTemperatures052Canvas } from './daily-temperatures-052-canvas-adapter';

export {
  buildDailyTemperatures052Steps,
  type DailyTemp052Step,
  renderDailyTemperatures052Canvas,
};

export const dailyTemperatures052Visualizer = registerDeclarativeAlgorithm<DailyTemp052Step>({
  id: 'daily-temperatures-052',
  name: '每日温度 (Class 052 Code03)',
  category: 'monotonic-stack',
  aliases: ['daily-temperatures-052', 'class052-code03'],
  difficulty: 'medium',
  learningGoal: '掌握单调递减栈维护下一个更大元素的经典技巧，理解破坏递减时弹出天数并计算下标跨度。',
  problemContent: STACK_052_PROBLEMS.dailyTemperatures052,
  codeLanguages: DAILY_TEMPERATURES_CODES,
  inputs: [
    {
      id: 'temperatures',
      label: '每日温度',
      type: 'text',
      defaultValue: '73, 74, 75, 71, 69, 72, 76, 73',
      placeholder: '逗号分隔的温度数值',
    },
  ],
  presets: [
    { label: '示例 1 (8天经典)', values: { temperatures: '73, 74, 75, 71, 69, 72, 76, 73' } },
    { label: '示例 2 (单调递增)', values: { temperatures: '30, 40, 50, 60' } },
    { label: '示例 3 (波谷大幅反弹)', values: { temperatures: '89, 62, 70, 58, 47, 76, 100' } },
  ],
  generateSteps: (inputs) => {
    const raw = parseNumberList(inputs.temperatures, '73, 74, 75, 71, 69, 72, 76, 73');
    return buildDailyTemperatures052Steps(raw.length ? raw : [73, 74, 75, 71, 69, 72, 76, 73]);
  },
  renderCanvas: (container, step) => renderDailyTemperatures052Canvas(container, step),
});
