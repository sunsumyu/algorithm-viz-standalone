/**
 * 数组理论基础可视化器 — 4-Card 标准现代架构
 * 演示连续内存布局、随机寻址与插入/删除移动元素
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  ARRAY_THEORY_PROBLEM_HTML,
  ARRAY_THEORY_ANALYSIS_HTML,
  ARRAY_THEORY_CODE_LANGUAGES,
} from './array-theory-problem-content';
import {
  ATStep,
  buildAccessSteps,
  buildSearchSteps,
  buildInsertSteps,
  buildDeleteSteps,
  withMetrics,
} from './array-theory-step-compiler';
import { renderArrayTheoryCanvas } from './array-theory-canvas-adapter';

export type { ATStep };
export {
  buildAccessSteps,
  buildSearchSteps,
  buildInsertSteps,
  buildDeleteSteps,
  renderArrayTheoryCanvas,
};

registerDeclarativeAlgorithm<ATStep>({
  id: 'array-theory',
  name: '数组理论基础',
  category: 'array',
  description: '数组的内存布局、基本操作和时间复杂度',
  icon: '📖',
  difficulty: 1,
  levelOrder: 0,
  learningGoal: '理解数组的连续内存特性和基本操作',
  modes: [
    { id: 'access', label: '🔍 O(1) 随机访问' },
    { id: 'search', label: '🔎 O(n) 线性搜索' },
    { id: 'insert', label: '✏️ O(n) 插入' },
    { id: 'delete', label: '🗑️ O(n) 删除' },
  ],
  inputs: [
    { id: 'array', label: '演示数组', type: 'text', defaultValue: '3, 5, 7, 11, 15' },
    { id: 'idx', label: '操作下标', type: 'number', defaultValue: '2' },
    { id: 'value', label: '插入值 / 搜索目标', type: 'number', defaultValue: '11' },
  ],
  presets: [
    { label: '访问 arr[2]', values: { array: '3, 5, 7, 11, 15', idx: '2', value: '11' } },
    { label: '搜索 11', values: { array: '3, 5, 7, 11, 15', idx: '2', value: '11' } },
    { label: '下标 1 插入 99', values: { array: '3, 5, 7, 11, 15', idx: '1', value: '99' } },
    { label: '删除下标 2', values: { array: '3, 5, 7, 11, 15', idx: '2', value: '11' } },
  ],
  metrics: [
    { id: 'op', label: '当前操作', color: '#2563eb' },
    { id: 'comp', label: '时间复杂度', color: '#10b981' },
    { id: 'addr', label: '物理地址', color: '#a855f7' },
    { id: 'shifts', label: '元素移动数', color: '#f59e0b' },
    { id: 'idx', label: '寻址下标 i', color: '#2563eb' },
  ],
  legend: [
    { label: '当前操作位', color: '#3b82f6' },
    { label: '搬移中', color: '#f59e0b' },
  ],
  codeLanguages: ARRAY_THEORY_CODE_LANGUAGES,
  problemHtml: ARRAY_THEORY_PROBLEM_HTML,
  analysisHtml: ARRAY_THEORY_ANALYSIS_HTML,
  generateSteps: (inputs, mode) => {
    const parseArr = (raw: string): number[] =>
      String(raw ?? '3, 5, 7, 11, 15')
        .split(/[,，\s]+/)
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
    const arr = parseArr(String(inputs.array ?? '3, 5, 7, 11, 15'));
    const list = arr.length ? arr : [3, 5, 7, 11, 15];
    let idx = parseInt(String(inputs.idx ?? '2'), 10);
    if (!Number.isFinite(idx)) idx = 2;
    let value = parseInt(String(inputs.value ?? '11'), 10);
    if (!Number.isFinite(value)) value = 11;

    switch (mode) {
      case 'search':
        return withMetrics(buildSearchSteps(list, value));
      case 'insert':
        return withMetrics(buildInsertSteps(list, Math.max(0, Math.min(idx, list.length)), value));
      case 'delete':
        return withMetrics(buildDeleteSteps(list, Math.max(0, Math.min(idx, list.length - 1))));
      case 'access':
      default:
        return withMetrics(buildAccessSteps(idx));
    }
  },
  renderCanvas: (container, step) => renderArrayTheoryCanvas(container, step as ATStep),
});
