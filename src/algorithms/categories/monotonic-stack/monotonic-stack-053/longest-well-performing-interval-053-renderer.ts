import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  LONGEST_WPI_CODES,
} from './stack-053-stage-codes';
import {
  LONGEST_WPI_PROBLEM_HTML,
  LONGEST_WPI_EXPLANATION,
} from './stack-053-problem-content';
import { type Step053 } from './stack-053-shared';
import {
  buildLongestWPISteps,
} from './longest-well-performing-interval-053-step-compiler';

export {
  buildLongestWPISteps,
};

export const longestWPI053Visualizer = registerDeclarativeAlgorithm<Step053>({
  id: 'longest-well-performing-interval-053',
  name: '表现良好的最长时间段 (Class 053 Code05)',
  category: 'monotonic-stack',
  difficulty: 'medium',
  aliases: ['longest-well-performing-interval', '1124', '表现良好的最长时间段', 'class053-code05'],
  hasDeductionTree: true,
  learningGoal:
    '掌握 +1/-1 差值前缀和归一化建模，理解单调递减栈维护最优左候选端点与右端点倒序贪心消除。',
  problemContent: {
    title: '表现良好的最长时间段',
    source: 'LeetCode 1124 / 算法通关课 Class 053 Code05',
    description: '寻找劳累天数严格大于不劳累天数的最长连续工作天数。',
    problemHtml: LONGEST_WPI_PROBLEM_HTML,
    analysisHtml: LONGEST_WPI_EXPLANATION,
  },
  codeLanguages: LONGEST_WPI_CODES,
  inputs: [
    {
      id: 'hours',
      label: '每日工作小时数',
      type: 'text',
      defaultValue: '9, 9, 6, 0, 6, 6, 9',
      placeholder: '逗号分隔的各天小时数',
    },
  ],
  presets: [
    { label: '示例 1: 官方经典 (9, 9, 6, 0, 6, 6, 9 ➔ 3天)', values: { hours: '9, 9, 6, 0, 6, 6, 9' } },
    { label: '示例 2: 全劳累天数 (9, 10, 11, 12 ➔ 4天)', values: { hours: '9, 10, 11, 12' } },
    { label: '示例 3: 全平淡天数 (6, 6, 6 ➔ 0天)', values: { hours: '6, 6, 6' } },
    { label: '示例 4: 先平淡后爆发 (6, 6, 9, 9, 9 ➔ 5天)', values: { hours: '6, 6, 9, 9, 9' } },
  ],
  generateSteps: (inputs) => {
    const raw = typeof inputs?.hours === 'string' ? inputs.hours : '9, 9, 6, 0, 6, 6, 9';
    return buildLongestWPISteps(raw);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = step.sandboxes[0]?.customHtml ?? '';
  },
});
