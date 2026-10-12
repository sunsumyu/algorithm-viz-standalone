/**
 * 分割回文串可视化器（回溯决策树 SVG 版本）— 4-Card 标准现代架构
 * LeetCode 131：把字符串分割成若干子串，要求每个子串都是回文串
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { BacktrackTreeStep } from './backtracking-tree-helper';
import {
  PALINDROME_PARTITION_PROBLEM_HTML,
  PALINDROME_PARTITION_ANALYSIS_HTML,
  PALINDROME_PARTITION_CODE_LANGUAGES,
} from './palindrome-partition-problem-content';
import {
  isPalindrome,
  buildPalTree,
  buildPalindromePartitionSteps,
  withMetrics,
} from './palindrome-partition-step-compiler';
import { renderPalindromePartitionCanvas } from './palindrome-partition-canvas-adapter';

// 向后兼容导出
export {
  isPalindrome,
  buildPalTree,
  buildPalindromePartitionSteps,
  renderPalindromePartitionCanvas,
};

registerDeclarativeAlgorithm({
  id: 'palindrome-partition',
  name: '分割回文串',
  category: 'backtracking',
  description: '将字符串分割为若干回文子串，回文判定剪枝',
  icon: '✂️',
  difficulty: 2,
  levelOrder: 6,
  learningGoal: '理解字符串切割问题到树形回溯的建模与即时回文剪枝',
  inputs: [
    { id: 'str', label: '输入字符串', type: 'text', defaultValue: 'aab' },
  ],
  presets: [
    { label: '示例 1', values: { 's': 'aab' } },
    { label: '示例 2', values: { 's': 'efe' } },
    { label: '示例 3', values: { 's': 'cdd' } },
  ],
  metrics: [
    { id: 'path', label: '当前路径', color: '#2563eb' },
    { id: 'visited', label: '已访问节点', color: '#a855f7' },
    { id: 'results', label: '已收集方案', color: '#10b981' },
    { id: 'pruned', label: '剪枝次数', color: '#ef4444' },
  ],
  legend: [
    { label: '当前节点', color: '#2563eb' },
    { label: '已访问', color: '#a855f7' },
    { label: '收集方案', color: '#10b981' },
    { label: '剪枝', color: '#ef4444' },
  ],
  codeLanguages: PALINDROME_PARTITION_CODE_LANGUAGES,
  problemHtml: PALINDROME_PARTITION_PROBLEM_HTML,
  analysisHtml: PALINDROME_PARTITION_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    let s = String(inputs.str ?? 'aab').trim();
    if (!s) s = 'aab';
    if (s.length > 8) s = s.slice(0, 8);
    return withMetrics(buildPalindromePartitionSteps(s));
  },
  renderCanvas: (container, step) => renderPalindromePartitionCanvas(container, step as BacktrackTreeStep),
});
