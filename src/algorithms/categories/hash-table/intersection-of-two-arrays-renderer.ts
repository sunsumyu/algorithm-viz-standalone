/**
 * 两个数组的交集可视化器 — 声明式 4-Card 标准架构
 * LeetCode 349：哈希集合 HashSet
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  INTERSECTION_ARRAYS_PROBLEM_HTML,
  INTERSECTION_ARRAYS_ANALYSIS_HTML,
  INTERSECTION_ARRAYS_CODE_LANGUAGES,
} from './intersection-of-two-arrays-problem-content';
import {
  IntersectionStep,
  parseNumArray,
  buildIntersectionSteps,
  withIntersectionMetrics,
} from './intersection-of-two-arrays-step-compiler';
import { renderIntersectionCanvas } from './intersection-of-two-arrays-canvas-adapter';

export type { IntersectionStep };
export {
  parseNumArray,
  buildIntersectionSteps,
  withIntersectionMetrics,
  renderIntersectionCanvas,
};

registerDeclarativeAlgorithm({
  id: 'intersection-arrays',
  name: '两个数组的交集（哈希集合）',
  category: 'hash-table',
  description: '用哈希集合求两个数组的交集元素',
  icon: '🔀',
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握用 Set 去重后高效求交集的思路',
  inputs: [
    {
      id: 'nums1',
      label: 'nums1',
      type: 'text',
      defaultValue: '1, 2, 2, 1',
      placeholder: '逗号分隔',
      width: '80px',
    },
    {
      id: 'nums2',
      label: 'nums2',
      type: 'text',
      defaultValue: '2, 2',
      placeholder: '逗号分隔',
      width: '60px',
    },
  ],
  presets: [
    { label: '示例 1: [1,2,2,1] & [2,2] ➔ [2]', values: { nums1: '1, 2, 2, 1', nums2: '2, 2' } },
    { label: '示例 2: [4,9,5] & [9,4..] ➔ [9,4]', values: { nums1: '4, 9, 5', nums2: '9, 4, 9, 8, 4' } },
    { label: '无交集: [1,2,3] & [4,5,6] ➔ []', values: { nums1: '1, 2, 3', nums2: '4, 5, 6' } },
    { label: '全重复: [7,7,7] & [7,7] ➔ [7]', values: { nums1: '7, 7, 7', nums2: '7, 7' } },
  ],
  metrics: [
    { id: 'phase', label: '当前阶段', color: '#2563eb' },
    { id: 'cur-val', label: '当前元素', color: '#9333ea' },
    { id: 'hit', label: '是否命中 set1', color: '#f59e0b' },
    { id: 'res-count', label: '交集结果数', color: '#10b981' },
  ],
  legend: [
    { label: 'set1 (nums1去重)', color: '#2563eb' },
    { label: 'resultSet (交集结果)', color: '#10b981' },
  ],
  codeLanguages: INTERSECTION_ARRAYS_CODE_LANGUAGES,
  problemHtml: INTERSECTION_ARRAYS_PROBLEM_HTML,
  analysisHtml: INTERSECTION_ARRAYS_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withIntersectionMetrics(
      buildIntersectionSteps(
        parseNumArray(String(inputs.nums1 ?? '1, 2, 2, 1'), [1, 2, 2, 1]),
        parseNumArray(String(inputs.nums2 ?? '2, 2'), [2, 2])
      )
    ),
  renderCanvas: (container, step) => renderIntersectionCanvas(container, step as IntersectionStep),
});
