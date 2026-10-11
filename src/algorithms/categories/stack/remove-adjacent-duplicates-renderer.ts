/**
 * 删除字符串中的所有相邻重复项可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * LeetCode 1047：栈顶即当前前驱，遇到相同字符直接出栈消除，形成自然连锁反应
 * 遵循 Zero-Subbox 规范，扁平纯净沙盘
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  REMOVE_ADJACENT_DUPLICATES_PROBLEM_HTML,
  REMOVE_ADJACENT_DUPLICATES_ANALYSIS_HTML,
  REMOVE_ADJACENT_DUPLICATES_CODE_LANGUAGES,
} from './remove-adjacent-duplicates-problem-content';
import {
  type RADStep,
  buildRemoveAdjacentDuplicatesSteps,
} from './remove-adjacent-duplicates-step-compiler';
import { renderRemoveAdjacentDuplicatesCanvas } from './remove-adjacent-duplicates-canvas-adapter';

export {
  type RADStep,
  buildRemoveAdjacentDuplicatesSteps,
  renderRemoveAdjacentDuplicatesCanvas,
};

const { template, Visualizer } = createDeclarativeVisualizer<RADStep>({
  id: 'remove-adjacent-duplicates',
  name: '删除相邻重复项',
  category: 'stack',
  icon: '✨',
  badge: {
    mode: '栈消消乐·相邻对消',
    complexity: 'O(n) · O(n)',
  },
  card1Title: '🔤 字符串扫描与相邻对消栈沙盘',
  card2Title: '🧭 对消决策与化简状态监视器',
  card2Desc: '当前扫描字符、栈顶前驱与实时化简结果',
  legend: [
    { label: '正在扫描', color: '#9333ea' },
    { label: '对消消除', color: '#ef4444' },
    { label: '入栈暂存', color: '#3b82f6' },
  ],
  inputs: [
    {
      id: 'input-str',
      label: '输入字符串',
      type: 'text',
      defaultValue: 'abbaca',
      width: '130px',
      placeholder: '如 abbaca',
    },
  ],
  presets: [
    { label: '经典示例', values: { 'input-str': 'abbaca' } },
    { label: '连续连锁消除', values: { 'input-str': 'azxxzy' } },
    { label: '全消除对称串', values: { 'input-str': 'abba' } },
    { label: '无重复串', values: { 'input-str': 'abcdef' } },
  ],
  metrics: [
    { id: 'cur-result', label: '当前化简结果', color: '#9333ea' },
    { id: 'eliminated-pairs', label: '已消除对数', color: '#ef4444' },
    { id: 'stack-size', label: '栈内保留字符', color: '#3b82f6' },
  ],
  codeLanguages: REMOVE_ADJACENT_DUPLICATES_CODE_LANGUAGES,
  problemHtml: REMOVE_ADJACENT_DUPLICATES_PROBLEM_HTML,
  analysisHtml: REMOVE_ADJACENT_DUPLICATES_ANALYSIS_HTML,
  buildSteps: (inputs) => buildRemoveAdjacentDuplicatesSteps(inputs['input-str']),
  renderCanvas: (container, step) => {
    renderRemoveAdjacentDuplicatesCanvas(container, step);
  },
});

registerAlgorithm({
  id: 'remove-adjacent-duplicates',
  name: '删除相邻重复项',
  viewId: 'algo-remove-adjacent-duplicates-view',
  category: 'stack',
  description: '栈消消乐模型：栈顶即当前前驱，遇到相同字符直接出栈对消，形成连锁反应',
  icon: '✨',
  template,
  Visualizer,
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '理解栈在消除相邻元素中的经典应用，掌握利用栈顶作为动态前驱消除递归连锁重复项的设计范式',
});
