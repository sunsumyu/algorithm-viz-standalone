/**
 * 电话号码字母组合可视化器（回溯决策树 SVG 版本）— 4-Card 标准现代架构
 * LeetCode 17：给定数字字符串，返回所有可能的字母组合
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { BacktrackTreeStep } from './backtracking-tree-helper';
import {
  PHONE_LETTERS_PROBLEM_HTML,
  PHONE_LETTERS_ANALYSIS_HTML,
  PHONE_LETTERS_CODE_LANGUAGES,
} from './phone-letters-problem-content';
import {
  PHONE_MAP,
  buildPhoneTree,
  buildPhoneLettersSteps,
  withMetrics,
} from './phone-letters-step-compiler';
import { renderPhoneLettersCanvas } from './phone-letters-canvas-adapter';

// 向后兼容导出
export {
  PHONE_MAP,
  buildPhoneTree,
  buildPhoneLettersSteps,
  renderPhoneLettersCanvas,
};

registerDeclarativeAlgorithm({
  id: 'phone-letters',
  aliases: ['17', 'leetcode-17', 'letter-combinations', 'letter-combinations-of-a-phone-number'],
  hasDeductionTree: true,
  name: '电话号码的字母组合',
  category: 'backtracking',
  description: '经典电话按键九宫格跨集合字母回溯组合',
  icon: '📱',
  difficulty: 2,
  levelOrder: 8,
  learningGoal: '理解跨多个独立集合枚举与深度递进的回溯遍历范式',
  inputs: [
    { id: 'digits', label: '数字串 (2-9)', type: 'text', defaultValue: '23' },
  ],
  presets: [
    { label: '示例 1', values: { 'digits': '23' } },
    { label: '示例 2', values: { 'digits': '2' } },
    { label: '示例 3', values: { 'digits': '79' } },
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
  codeLanguages: PHONE_LETTERS_CODE_LANGUAGES,
  problemHtml: PHONE_LETTERS_PROBLEM_HTML,
  analysisHtml: PHONE_LETTERS_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    let digits = String(inputs.digits ?? '23').trim().replace(/[^2-9]/g, '');
    if (!digits) digits = '23';
    if (digits.length > 4) digits = digits.slice(0, 4);
    return withMetrics(buildPhoneLettersSteps(digits));
  },
  renderCanvas: (container, step) => renderPhoneLettersCanvas(container, step as BacktrackTreeStep),
});
