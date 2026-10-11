/**
 * 桶排序可视化器 — 声明式 4-Card 标准架构
 * 极值范围划分、区间分桶映射、桶内单独排序、顺序归拢回填
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import {
  BUCKET_SORT_PROBLEM_HTML,
  BUCKET_SORT_ANALYSIS_HTML,
  BUCKET_SORT_CODE_LANGUAGES,
} from './bucket-sort-problem-content';
import {
  BucketStep,
  bucketSortSteps,
  withMetrics,
} from './bucket-sort-step-compiler';
import { renderBucketSortCanvas } from './bucket-sort-canvas-adapter';

export type { BucketStep };
export { bucketSortSteps, withMetrics, renderBucketSortCanvas };

registerDeclarativeAlgorithm<BucketStep>({
  id: 'bucket-sort',
  name: '桶排序',
  category: 'sort',
  description: '逐步演示桶排序：区间映射分流、桶内独立排序、顺序归拢回填',
  icon: '🪣',
  difficulty: 2,
  levelOrder: 9,
  learningGoal: '掌握分桶映射思想、数据局部有序化与归拢还原过程',
  inputs: [
    {
      id: 'array',
      label: '输入数组',
      type: 'text',
      defaultValue: '29, 25, 3, 49, 9, 37, 21, 43',
      placeholder: '逗号分隔数字',
    },
  ],
  presets: [
    { label: '基础示例', values: { array: '29, 25, 3, 49, 9, 37, 21, 43' } },
    { label: '均匀分布', values: { array: '10, 20, 30, 40, 50, 60, 70' } },
    { label: '聚集分布', values: { array: '1, 2, 3, 48, 49, 50, 25' } },
    { label: '含重复元素', values: { array: '5, 3, 5, 1, 3, 5' } },
  ],
  metrics: [
    { id: 'range', label: '值域范围', color: '#2563eb' },
    { id: 'bucket-count', label: '桶数量 k', color: '#0f172a' },
    { id: 'cur-elem', label: '当前元素', color: '#3b82f6' },
    { id: 'gather-count', label: '已归拢 / 总数', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '当前分发', color: '#3b82f6' },
    { label: '已归拢回填', color: '#22c55e' },
  ],
  codeLanguages: BUCKET_SORT_CODE_LANGUAGES,
  problemHtml: BUCKET_SORT_PROBLEM_HTML,
  analysisHtml: BUCKET_SORT_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(bucketSortSteps(parseNumberList(String(inputs.array ?? '29, 25, 3, 49, 9, 37, 21, 43'), []), 5)),
  renderCanvas: (container, step) => renderBucketSortCanvas(container, step as BucketStep),
});
