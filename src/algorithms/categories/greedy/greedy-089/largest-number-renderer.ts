/**
 * 最大数 (LeetCode 179) - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { GREEDY_089_PROBLEMS } from './greedy-089-problem-content';
import {
  LARGEST_NUMBER_STAGE1_CODES,
  LARGEST_NUMBER_STAGE2_CODES,
  LARGEST_NUMBER_STAGE3_CODES,
} from './greedy-089-stage-codes';
import {
  LargestNumberStep,
  buildLargestNumberStage1Steps,
  buildLargestNumberStage2Steps,
  buildLargestNumberStage3Steps,
  parseLargestNumberInput,
} from './largest-number-step-compiler';
import {
  renderLargestNumberCanvas,
  renderLargestNumberMetrics,
} from './largest-number-canvas-adapter';
import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';

export type {
  LargestNumberStep,
};
export {
  buildLargestNumberStage1Steps,
  buildLargestNumberStage2Steps,
  buildLargestNumberStage3Steps,
  parseLargestNumberInput,
};

const { template, Visualizer } = createDeclarativeVisualizer<LargestNumberStep>({
  id: 'largest-number',
  name: '最大数 (Largest Number)',
  category: 'greedy',
  icon: '🔢',
  badge: { mode: '拼接排序贪心', complexity: 'O(N log N) · O(N)' },
  card1Title: '🎴 数字卡片排序与当前序列沙盘',
  card2Title: '⚖️ 贪心拼接天平与反证对比',
  card2Desc: '展示 (b+a) 与 (a+b) 拼接结果的比对天平与前导 0 校验',
  legend: [
    { label: '考察元素对', color: '#3b82f6' },
    { label: '优选高位前移', color: '#10b981' },
    { label: '常规元素', color: '#64748b' },
  ],
  inputs: [
    {
      id: 'input-nums',
      label: '输入数组',
      type: 'text',
      defaultValue: '10, 2',
      width: '160px',
      placeholder: '以逗号分隔非负整数',
    },
  ],
  presets: [
    { label: '示例 1: [10, 2]', values: { 'input-nums': '10, 2' } },
    { label: '示例 2: [3, 30, 34, 5, 9]', values: { 'input-nums': '3, 30, 34, 5, 9' } },
    { label: '全零特判: [0, 0]', values: { 'input-nums': '0, 0' } },
  ],
  metrics: [
    { id: 'array-len', label: '元素个数', color: '#64748b' },
    { id: 'current-max', label: '当前最高位', color: '#3b82f6' },
    { id: 'final-ans', label: '最大数结果', color: '#10b981' },
  ],
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力穷举对比',
      shortName: '暴力穷举',
      card2Desc: '生成所有 N! 种排列串，展示阶乘级时间复杂度与排列爆炸',
      codeLanguages: LARGEST_NUMBER_STAGE1_CODES,
      buildSteps: (inputs) => parseLargestNumberInput(inputs, 1),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 贪心拼接推演',
      shortName: '贪心排序',
      card2Desc: '按 (b+a) > (a+b) 规则排序，展示前导 0 特判与拼接成最大数过程',
      codeLanguages: LARGEST_NUMBER_STAGE2_CODES,
      buildSteps: (inputs) => parseLargestNumberInput(inputs, 2),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 邻项交换法证明',
      shortName: '贪心证明',
      card2Desc: '代数证明任意相邻逆序对交换必导致数值增加，贪心解收敛至全局最优',
      codeLanguages: LARGEST_NUMBER_STAGE3_CODES,
      buildSteps: (inputs) => parseLargestNumberInput(inputs, 3),
    },
  ],
  codeLanguages: LARGEST_NUMBER_STAGE2_CODES,
  problemHtml: GREEDY_089_PROBLEMS.largestNumber.html,
  buildSteps: (inputs) => parseLargestNumberInput(inputs, 2),
  renderCanvas: renderLargestNumberCanvas,
  renderCustomMetrics: renderLargestNumberMetrics,
});

export const LargestNumberVisualizer = UniversalStageVisualizer;

registerAlgorithm({
  id: 'largest-number',
  name: '最大数 (Largest Number)',
  viewId: 'algo-largest-number-view',
  category: 'greedy',
  description: '左程云算法讲解089 Code01：LeetCode 179 最大数，自定义字符串拼接比较器贪心排序与前导0特判',
  icon: '🔢',
  template,
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 891,
  learningGoal: '掌握自定义拼接比较器 (b+a).compareTo(a+b) 的全序性证明与邻项交换法反证逻辑',
  aliases: ['class089-code01', 'largest-number-179', 'leetcode-179'],
});
