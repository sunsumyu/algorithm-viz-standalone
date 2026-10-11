/**
 * 翻转字符串里的单词可视化器 — 声明式 4-Card 标准架构
 * LeetCode 151：三步原地反转法
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  REVERSE_WORDS_PROBLEM_HTML,
  REVERSE_WORDS_ANALYSIS_HTML,
  REVERSE_WORDS_CODE_LANGUAGES,
} from './reverse-words-problem-content';
import {
  REVERSE_WORDS_CODE_LINES,
  ReverseWordsStep,
  buildReverseWordsSteps,
  withMetrics,
} from './reverse-words-step-compiler';
import { renderReverseWordsCanvas } from './reverse-words-canvas-adapter';

export type { ReverseWordsStep };
export {
  REVERSE_WORDS_CODE_LINES,
  buildReverseWordsSteps,
  renderReverseWordsCanvas,
};

registerDeclarativeAlgorithm({
  id: 'reverse-words',
  name: '翻转字符串里的单词（双指针）',
  category: 'string',
  description: '移除多余空格并倒序拼接单词',
  icon: '🔃',
  difficulty: 2,
  levelOrder: 2,
  learningGoal: '学会分割-反转-重组的字符串处理模式',
  inputs: [
    {
      id: 's',
      label: '输入字符串',
      type: 'text',
      defaultValue: '  the sky is blue  ',
      placeholder: '字符串',
    },
  ],
  presets: [
    { label: '示例 1: ("  the sky is blue  ")', values: { s: '  the sky is blue  ' } },
    { label: '首尾多空格: ("  hello world  ")', values: { s: '  hello world  ' } },
    { label: '词间多空格: ("a good   example")', values: { s: 'a good   example' } },
    { label: '单单词: ("word")', values: { s: 'word' } },
  ],
  metrics: [
    { id: 'left', label: '左指针 left', color: '#3b82f6' },
    { id: 'right', label: '右指针 right', color: '#f59e0b' },
    { id: 'length', label: '字符数组有效长度', color: '#10b981' },
    { id: 'phase', label: '当前阶段', color: '#2563eb' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: 'left 指针', color: '#2563eb' },
    { label: 'right 指针', color: '#f59e0b' },
    { label: '交换中', color: '#10b981' },
    { label: '单词窗口', color: '#818cf8' },
  ],
  codeLanguages: REVERSE_WORDS_CODE_LANGUAGES,
  problemHtml: REVERSE_WORDS_PROBLEM_HTML,
  analysisHtml: REVERSE_WORDS_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(buildReverseWordsSteps(String(inputs.s ?? '  the sky is blue  '))),
  renderCanvas: (container, step) =>
    renderReverseWordsCanvas(container, step as ReverseWordsStep),
});
