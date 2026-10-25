/**
 * 复原 IP 地址可视化器（回溯决策树 SVG 版本）— 4-Card 标准现代架构
 * LeetCode 93：给定数字字符串，返回所有有效的 IP 地址
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { BacktrackTreeStep } from './backtracking-tree-helper';
import {
  RESTORE_IP_PROBLEM_HTML,
  RESTORE_IP_ANALYSIS_HTML,
  RESTORE_IP_CODE_LANGUAGES,
} from './restore-ip-problem-content';
import {
  buildIPTree,
  buildRestoreIPSteps,
  withMetrics,
} from './restore-ip-step-compiler';
import { renderRestoreIpCanvas } from './restore-ip-canvas-adapter';

// 向后兼容导出
export {
  buildIPTree,
  buildRestoreIPSteps,
  renderRestoreIpCanvas,
};

registerDeclarativeAlgorithm({
  id: 'restore-ip',
  aliases: ['93', 'leetcode-93', 'restore-ip-addresses'],
  hasDeductionTree: true,
  name: '复原 IP 地址',
  category: 'backtracking',
  description: '在数字串中插入点号复原合法有效 IP 地址',
  icon: '🌐',
  difficulty: 2,
  levelOrder: 7,
  learningGoal: '掌握 4 段式点分十进制切割与前导零、255 上限等全方位剪枝',
  inputs: [
    { id: 'str', label: '数字字符串', type: 'text', defaultValue: '25525511135' },
  ],
  presets: [
    { label: '示例 1', values: { 's': '25525511135' } },
    { label: '示例 2', values: { 's': '0000' } },
    { label: '示例 3', values: { 's': '101023' } },
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
  codeLanguages: RESTORE_IP_CODE_LANGUAGES,
  problemHtml: RESTORE_IP_PROBLEM_HTML,
  analysisHtml: RESTORE_IP_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    let s = String(inputs.str ?? '25525511135').trim().replace(/[^0-9]/g, '');
    if (!s) s = '25525511135';
    if (s.length > 12) s = s.slice(0, 12);
    return withMetrics(buildRestoreIPSteps(s));
  },
  renderCanvas: (container, step) => renderRestoreIpCanvas(container, step as BacktrackTreeStep),
});
