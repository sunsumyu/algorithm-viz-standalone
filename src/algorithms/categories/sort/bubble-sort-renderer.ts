/**
 * 冒泡排序可视化器 — 声明式 4-Card 标准架构
 * 相邻比较、元素交换、末尾冒泡到位、早停优化
 */

import { parseNumberList } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  BUBBLE_SORT_PROBLEM_HTML,
  BUBBLE_SORT_ANALYSIS_HTML,
  BUBBLE_SORT_CODE_LANGUAGES,
} from './bubble-sort-problem-content';
import {
  BSStep,
  bubbleSortSteps,
  withMetrics,
} from './bubble-sort-step-compiler';
import { renderBubbleSortCanvas } from './bubble-sort-canvas-adapter';

export type { BSStep };
export { bubbleSortSteps, withMetrics, renderBubbleSortCanvas };

registerDeclarativeAlgorithm<BSStep>({
  id: 'bubble-sort',
  aliases: ['bubble-sort', 'bubble-sort-standard', 'bubble'],
  hasDeductionTree: true,
  name: '冒泡排序',
  category: 'sort',
  description: '逐步演示冒泡排序：相邻元素比较、交换、冒泡到位',
  icon: '🌪️',
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '理解冒泡排序的相邻比较和元素冒泡过程',
  inputs: [
    {
      id: 'array',
      label: '输入数组',
      type: 'text',
      defaultValue: '5, 2, 9, 1, 5, 6',
      placeholder: '逗号分隔数字',
    },
  ],
  presets: [
    { label: '基础示例', values: { array: '5, 2, 9, 1, 5, 6' } },
    { label: '近有序 (早停)', values: { array: '1, 2, 3, 5, 4, 6, 7' } },
    { label: '逆序最坏情形', values: { array: '9, 8, 7, 6, 5, 4, 3, 2, 1' } },
    { label: '含重复元素', values: { array: '4, 4, 2, 2, 8, 8, 1' } },
  ],
  metrics: [
    { id: 'pass', label: '当前轮次', color: '#2563eb' },
    { id: 'j-pair', label: '比较指针 [j, j+1]', color: '#a855f7' },
    { id: 'comp-swap', label: '比较 / 交换', color: '#f59e0b' },
    { id: 'sorted-count', label: '已就位', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '比较中', color: '#3b82f6' },
    { label: '交换中', color: '#ef4444' },
    { label: '已就位', color: '#22c55e' },
  ],
  codeLanguages: BUBBLE_SORT_CODE_LANGUAGES,
  problemHtml: BUBBLE_SORT_PROBLEM_HTML,
  analysisHtml: BUBBLE_SORT_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(bubbleSortSteps(parseNumberList(String(inputs.array ?? '5, 2, 9, 1, 5, 6'), [5, 2, 9, 1, 5, 6]))),
  renderCanvas: (container, step) => renderBubbleSortCanvas(container, step as BSStep),
});
