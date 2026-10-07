/**
 * 两个 0 和 1 数量相等区间的最大长度 - 顶层抽象架构全功能沙盘渲染器
 * 核心贪心：抽屉原理与两端极值边界比较 (arr[0] == arr[n-1] ? n-1 : n-2)
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { GREEDY_091_PROBLEMS } from './greedy-091-problem-content';
import { LONGEST_SAME_ZEROS_ONES_CODES } from './greedy-091-stage-codes';
import {
  type IntervalDef,
  type LongestSameZerosOnesStep,
  buildLongestSameZerosOnesSteps,
} from './longest-same-zeros-ones-step-compiler';
import { renderLongestSameZerosOnesCanvas } from './longest-same-zeros-ones-canvas-adapter';

export type { IntervalDef, LongestSameZerosOnesStep };
export { buildLongestSameZerosOnesSteps, renderLongestSameZerosOnesCanvas };

const { template } = createDeclarativeVisualizer<LongestSameZerosOnesStep>({
  id: 'longest-same-zeros-ones-intervals',
  name: '两个0和1数量相等区间的最大长度',
  category: 'greedy',
  icon: '⚖️',
  difficulty: 3,
  levelOrder: 916,
  learningGoal: '掌握首尾字符相等与不相等的抽屉原理推导及 n-1 与 n-2 极值贪心',
  problemHtml: GREEDY_091_PROBLEMS.longestSameZerosOnes.html,
  analysisHtml: GREEDY_091_PROBLEMS.longestSameZerosOnes.html,
  inputs: [
    {
      id: 'input-arr',
      label: '01 数组 arr',
      type: 'text',
      defaultValue: '0, 1, 0, 0, 1, 0',
      placeholder: '0, 1, 0, 0, 1, 0',
    },
  ],
  codeLanguages: LONGEST_SAME_ZEROS_ONES_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-arr'] || '0, 1, 0, 0, 1, 0');
    const arr = raw.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    return buildLongestSameZerosOnesSteps(arr);
  },
  renderCanvas: renderLongestSameZerosOnesCanvas,
});

export const longestSameZerosOnesVisualizer = UniversalStageVisualizer;
export const longestSameZerosOnesRenderer = UniversalStageVisualizer;

registerAlgorithm({
  id: 'longest-same-zeros-ones-intervals',
  name: '两个0和1数量相等区间的最大长度',
  viewId: 'algo-longest-same-zeros-ones-view',
  category: 'greedy',
  icon: '⚖️',
  difficulty: 3,
  levelOrder: 916,
  description: '找出两个不完全重合且0与1数量分别相等的最大区间，通过首尾字符比较与鸽巢原理直接在O(1)内确定最大长度为n-1或n-2。',
  learningGoal: '掌握首尾字符相等与不相等的抽屉原理推导及 n-1 与 n-2 极值贪心',
  aliases: ['class091-code06', 'longest-same-zeros-ones', 'two-intervals-equal-zeros-ones'],
  template,
  Visualizer: UniversalStageVisualizer,
});
