/**
 * 最小区间 (LeetCode 632) - 声明式教学级沙盘渲染器
 * 核心贪心：小顶堆维护多路游标 + 动态最大值追踪最小跨度
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { GREEDY_091_PROBLEMS } from './greedy-091-problem-content';
import { SMALLEST_RANGE_CODES } from './greedy-091-stage-codes';
import {
  type HeapItem,
  type SmallestRangeStep,
  buildSmallestRangeSteps,
} from './smallest-range-step-compiler';
import { renderSmallestRangeCanvas } from './smallest-range-canvas-adapter';

export type { HeapItem, SmallestRangeStep };
export { buildSmallestRangeSteps, renderSmallestRangeCanvas };

const { template } = createDeclarativeVisualizer<SmallestRangeStep>({
  id: 'smallest-range-covering-elements-from-k-lists',
  name: '最小区间 (Smallest Range)',
  category: 'greedy',
  icon: '🎯',
  difficulty: 3,
  levelOrder: 912,
  learningGoal: '掌握小顶堆维护多路有序游标与动态更新最大值的贪心滑动窗口原理',
  problemHtml: GREEDY_091_PROBLEMS.smallestRange.html,
  analysisHtml: GREEDY_091_PROBLEMS.smallestRange.html,
  inputs: [
    {
      id: 'input-lists',
      label: '有序列表集合 (分号隔开各行)',
      type: 'text',
      defaultValue: '4,10,15,24,26; 0,9,12,20; 5,18,22,30',
      placeholder: '4,10,15,24,26; 0,9,12,20; 5,18,22,30',
    },
  ],
  codeLanguages: SMALLEST_RANGE_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-lists'] || '4,10,15,24,26; 0,9,12,20; 5,18,22,30');
    const lists = raw.split(';').map(line =>
      line.trim().split(/[,，\s]+/).map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
    ).filter(l => l.length > 0);
    return buildSmallestRangeSteps(lists);
  },
  renderCanvas: renderSmallestRangeCanvas,
});

export const smallestRangeVisualizer = UniversalStageVisualizer;
export const smallestRangeRenderer = UniversalStageVisualizer;

registerAlgorithm({
  id: 'smallest-range-covering-elements-from-k-lists',
  name: '最小区间 (Smallest Range Covering Elements from K Lists)',
  viewId: 'algo-smallest-range-covering-elements-from-k-lists-view',
  category: 'greedy',
  icon: '🎯',
  difficulty: 3,
  levelOrder: 912,
  description: 'k 个非递减排列的整数列表，通过小根堆维护多路游标并实时追踪当前最大值，贪心收敛能覆盖每个列表至少一个数的最小区间。',
  learningGoal: '掌握多路归并小根堆与滑动窗口结合的局部贪心单调性收敛原理',
  aliases: ['class091-code02', 'smallest-range-632', 'leetcode-632', 'smallest-range'],
  template,
  Visualizer: UniversalStageVisualizer,
});
