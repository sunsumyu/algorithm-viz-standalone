/**
 * 重复的子字符串可视化器 — 声明式 4-Card 标准架构
 * LeetCode 459：KMP 前缀表周期性整除推导
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  REPEATED_SUBSTRING_PROBLEM_HTML,
  REPEATED_SUBSTRING_ANALYSIS_HTML,
  REPEATED_SUBSTRING_CODE_LANGUAGES,
} from './repeated-substring-problem-content';
import {
  REPEATED_SUBSTRING_CODE_LINES,
  RPSStep,
  buildRPSSteps,
  withMetrics,
} from './repeated-substring-step-compiler';
import { renderRepeatedSubstringCanvas } from './repeated-substring-canvas-adapter';

export type { RPSStep };
export {
  REPEATED_SUBSTRING_CODE_LINES,
  buildRPSSteps,
  renderRepeatedSubstringCanvas,
};

registerDeclarativeAlgorithm({
  id: 'repeated-substring',
  name: '重复的子字符串',
  category: 'string',
  description: '判断字符串是否可由重复子串构成',
  icon: '🔁',
  difficulty: 2,
  levelOrder: 7,
  learningGoal: '掌握用 KMP 前缀表判断重复子串的数学原理',
  inputs: [
    {
      id: 's',
      label: '输入字符串',
      type: 'text',
      defaultValue: 'abab',
      placeholder: '字符串',
    },
  ],
  presets: [
    { label: '示例 1: ("abab" -> true)', values: { s: 'abab' } },
    { label: '示例 2: ("aba" -> false)', values: { s: 'aba' } },
    { label: '示例 3: ("abcabcabcabc" -> true)', values: { s: 'abcabcabcabc' } },
    { label: '纯单字符: ("aaaa" -> true)', values: { s: 'aaaa' } },
  ],
  metrics: [
    { id: 'n', label: '总长度 n', color: '#0f172a' },
    { id: 'lps', label: '最长相等前后缀', color: '#9333ea' },
    { id: 'period', label: '周期元长度 len', color: '#2563eb' },
    { id: 'res', label: '判定结果', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '最小周期子串', color: '#2563eb' },
    { label: 'next[n-1] 尾项', color: '#9333ea' },
  ],
  codeLanguages: REPEATED_SUBSTRING_CODE_LANGUAGES,
  problemHtml: REPEATED_SUBSTRING_PROBLEM_HTML,
  analysisHtml: REPEATED_SUBSTRING_ANALYSIS_HTML,
  generateSteps: (inputs) => withMetrics(buildRPSSteps(String(inputs.s ?? 'abab'))),
  renderCanvas: (container, step) =>
    renderRepeatedSubstringCanvas(container, step as RPSStep),
});
