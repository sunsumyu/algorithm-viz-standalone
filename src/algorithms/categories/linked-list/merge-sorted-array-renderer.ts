/**
 * 合并两个有序数组可视化器（逆向双指针）
 * LeetCode 88
 */

import { parseNumberList } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  MERGE_SORTED_ARRAY_PROBLEM_HTML,
  MERGE_SORTED_ARRAY_ANALYSIS_HTML,
  MERGE_SORTED_ARRAY_CODE_LANGUAGES,
} from './merge-sorted-array-problem-content';
import {
  MSAStep,
  buildMSASteps,
  withMergeSortedArrayMetrics,
} from './merge-sorted-array-step-compiler';
import { renderMergeSortedArrayCanvas } from './merge-sorted-array-canvas-adapter';

export type { MSAStep };
export { buildMSASteps, withMergeSortedArrayMetrics, renderMergeSortedArrayCanvas };

registerDeclarativeAlgorithm({
  id: 'merge-sorted-array',
  name: '合并两个有序数组（双指针）',
  category: 'linked-list',
  description: '逆向双指针从后向前填充，O(m+n) 时间 O(1) 额外空间',
  icon: '🔀',
  difficulty: 1,
  levelOrder: 6,
  learningGoal: '学会从后向前的逆向双指针合并技术，避免元素后移与额外空间消耗',
  inputs: [
    { id: 'n1', label: 'nums1 有效元素', type: 'text', defaultValue: '1, 2, 3' },
    { id: 'n2', label: 'nums2', type: 'text', defaultValue: '2, 5, 6' },
  ],
  presets: [
    { label: '示例 1', values: { n1: '1, 2, 3, 0, 0, 0', m: '3', n2: '2, 5, 6', n: '3' } },
    { label: '单元素', values: { n1: '1', m: '1', n2: '', n: '0' } },
    { label: 'nums1 全空位', values: { n1: '0, 0, 0', m: '0', n2: '1, 2, 3', n: '3' } },
  ],
  metrics: [
    { id: 'p1', label: 'nums1 指针 p1', color: '#3b82f6' },
    { id: 'p2', label: 'nums2 指针 p2', color: '#10b981' },
    { id: 'k', label: '写入位置 k', color: '#f59e0b' },
    { id: 'phase', label: '当前阶段', color: '#2563eb' },
  ],
  legend: [
    { label: 'p1 比较指针', color: '#3b82f6' },
    { label: 'p2 来源指针', color: '#10b981' },
    { label: 'k 写入位置', color: '#f59e0b' },
  ],
  codeLanguages: MERGE_SORTED_ARRAY_CODE_LANGUAGES,
  problemHtml: MERGE_SORTED_ARRAY_PROBLEM_HTML,
  analysisHtml: MERGE_SORTED_ARRAY_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const n1 = parseNumberList(String(inputs.n1 ?? '1, 2, 3'), []).sort((a, b) => a - b);
    const n2 = parseNumberList(String(inputs.n2 ?? '2, 5, 6'), []).sort((a, b) => a - b);
    return withMergeSortedArrayMetrics(buildMSASteps(n1.length ? n1 : [1, 2, 3], n2));
  },
  renderCanvas: (container, step) => renderMergeSortedArrayCanvas(container, step as MSAStep),
});
