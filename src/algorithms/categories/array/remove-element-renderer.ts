/**
 * 移除元素可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * LeetCode 27：快慢双指针原地覆盖
 * 遵循 Zero-Subbox 规范，扁平纯净沙盘
 */

import { parseNumberList } from '../../../core/input-primitives';
import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  REMOVE_ELEMENT_PROBLEM_HTML,
  REMOVE_ELEMENT_ANALYSIS_HTML,
  REMOVE_ELEMENT_CODE_LANGUAGES,
} from './remove-element-problem-content';
import {
  RemoveStep,
  buildRemoveElementSteps,
} from './remove-element-step-compiler';
import { renderRemoveElementCanvas } from './remove-element-canvas-adapter';

export type { RemoveStep };
export { buildRemoveElementSteps, renderRemoveElementCanvas };

const { template, Visualizer } = createDeclarativeVisualizer<RemoveStep>({
  id: 'remove-element',
  name: '移除元素',
  category: 'array',
  icon: '✂️',
  badge: {
    mode: '快慢双指针原地覆写',
    complexity: 'O(n) · O(1)',
  },
  card1Title: '📊 数组条带与快慢双指针沙盘',
  card2Title: '🧭 指针状态与有效保留区间监视器',
  card2Desc: '快慢指针索引、当前覆写动作与有效数组前缀',
  legend: [
    { label: '快指针 fast', color: '#2563eb' },
    { label: '慢指针 slow', color: '#0d9488' },
    { label: '待移除目标 val', color: '#ef4444' },
  ],
  inputs: [
    {
      id: 'input-array',
      label: '输入数组',
      type: 'text',
      defaultValue: '3, 2, 2, 3',
      width: '140px',
      placeholder: '3, 2, 2, 3',
    },
    {
      id: 'input-val',
      label: '移除值 val',
      type: 'number',
      defaultValue: 3,
      width: '45px',
    },
  ],
  presets: [
    { label: '示例 1 (val=3)', values: { 'input-array': '3, 2, 2, 3', 'input-val': 3 } },
    { label: '示例 2 (val=2)', values: { 'input-array': '0, 1, 2, 2, 3, 0, 4, 2', 'input-val': 2 } },
    { label: '无匹配项 (val=5)', values: { 'input-array': '1, 2, 3, 4', 'input-val': 5 } },
  ],
  metrics: [
    { id: 'fast-idx', label: '快指针 fast', color: '#2563eb' },
    { id: 'slow-idx', label: '慢指针 slow (有效长)', color: '#0d9488' },
    { id: 'action-state', label: '当前动作', color: '#16a34a' },
  ],
  codeLanguages: REMOVE_ELEMENT_CODE_LANGUAGES,
  problemHtml: REMOVE_ELEMENT_PROBLEM_HTML,
  analysisHtml: REMOVE_ELEMENT_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const raw = inputs['input-array'] || '3, 2, 2, 3';
    const arr = parseNumberList(raw, [3, 2, 2, 3]);
    const val = parseInt(inputs['input-val'] || '3', 10);
    return buildRemoveElementSteps(arr, val);
  },
  renderCanvas: (container, step) => {
    renderRemoveElementCanvas(container, step);
  },
});

registerAlgorithm({
  id: 'remove-element',
  aliases: ['27', 'leetcode-27', 'remove-element-fast-slow'],
  hasDeductionTree: true,
  name: '移除元素',
  viewId: 'algo-remove-element-view',
  category: 'array',
  description: '快慢双指针原地覆写：快指针寻找新元素，慢指针指向新数组位置，O(1) 额外空间',
  icon: '✂️',
  template,
  Visualizer,
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '掌握利用快慢双指针在单数组中原地覆写元素以消除特定目标的经典范式',
});
