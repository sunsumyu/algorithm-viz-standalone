/**
 * 反转字符串 II 可视化器 — 声明式 4-Card 标准架构
 * LeetCode 541：每 2k 步长反转前 k 个字符
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  REVERSE_STRING_II_PROBLEM_HTML,
  REVERSE_STRING_II_ANALYSIS_HTML,
  REVERSE_STRING_II_CODE_LANGUAGES,
} from './reverse-string-ii-problem-content';
import {
  REVERSE_STRING_II_CODE_LINES,
  ReverseStringIIStep,
  buildReverseStringIISteps,
  withMetrics,
} from './reverse-string-ii-step-compiler';
import { renderReverseStringIICanvas } from './reverse-string-ii-canvas-adapter';

export type { ReverseStringIIStep };
export {
  REVERSE_STRING_II_CODE_LINES,
  buildReverseStringIISteps,
  renderReverseStringIICanvas,
};

registerDeclarativeAlgorithm({
  id: 'reverse-string-ii',
  aliases: ['541', 'leetcode-541', 'reverse-string-2'],
  hasDeductionTree: true,
  name: '反转字符串II（分段反转）',
  category: 'string',
  description: '每隔 2k 个字符反转前 k 个字符',
  icon: '🔁',
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '掌握分段处理 + 边界条件的双指针反转',
  inputs: [
    { id: 's', label: '字符串 s', type: 'text', defaultValue: 'abcdefg', placeholder: '例如: abcdefg' },
    { id: 'k', label: '反转长度 k', type: 'number', defaultValue: 2, min: 1, max: 10 },
  ],
  presets: [
    { label: '示例 1: ("abcdefg", k=2)', values: { s: 'abcdefg', k: 2 } },
    { label: '示例 2: ("abcd", k=2)', values: { s: 'abcd', k: 2 } },
    { label: '长字符串: ("abcdefghijk", k=3)', values: { s: 'abcdefghijk', k: 3 } },
    { label: '单字符: ("a", k=2)', values: { s: 'a', k: 2 } },
  ],
  metrics: [
    { id: 'i', label: '步长下标 i', color: '#9333ea' },
    { id: 'window', label: '反转区间 [left, right]', color: '#2563eb' },
    { id: 'k', label: 'k / 2k 步长', color: '#f59e0b' },
    { id: 'phase', label: '当前阶段', color: '#0f172a' },
    { id: 'action', label: '边界计算', color: '#2563eb' },
  ],
  legend: [
    { label: 'i 步长 (+2k)', color: '#9333ea' },
    { label: '[left, right] 反转窗口', color: '#2563eb' },
  ],
  codeLanguages: REVERSE_STRING_II_CODE_LANGUAGES,
  problemHtml: REVERSE_STRING_II_PROBLEM_HTML,
  analysisHtml: REVERSE_STRING_II_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const str = String(inputs.s ?? 'abcdefg');
    const rawK = Number(inputs.k ?? 2);
    const k = isNaN(rawK) || rawK <= 0 ? 2 : rawK;
    return withMetrics(buildReverseStringIISteps(str, k));
  },
  renderCanvas: (container, step) => renderReverseStringIICanvas(container, step as ReverseStringIIStep),
});
