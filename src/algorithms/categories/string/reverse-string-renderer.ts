/**
 * 反转字符串可视化器 — 声明式 4-Card 标准架构
 * LeetCode 344：首尾双指针对撞交换
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  REVERSE_STRING_PROBLEM_HTML,
  REVERSE_STRING_ANALYSIS_HTML,
  REVERSE_STRING_CODE_LANGUAGES,
} from './reverse-string-problem-content';
import {
  REVERSE_STRING_CODE_LINES,
  ReverseStringStep,
  buildReverseStringSteps,
  withMetrics,
} from './reverse-string-step-compiler';
import { renderReverseStringCanvas } from './reverse-string-canvas-adapter';

export type { ReverseStringStep };
export {
  REVERSE_STRING_CODE_LINES,
  buildReverseStringSteps,
  renderReverseStringCanvas,
};

registerDeclarativeAlgorithm({
  id: 'reverse-string',
  name: '反转字符串（双指针）',
  category: 'string',
  description: '首尾双指针原地反转字符数组',
  icon: '↔️',
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握原地反转字符串的双指针法',
  inputs: [
    {
      id: 's',
      label: '字符数组',
      type: 'text',
      defaultValue: 'hello',
      placeholder: '字符串',
    },
  ],
  presets: [
    { label: '示例 1: ("hello")', values: { s: 'hello' } },
    { label: '示例 2: ("Hannah")', values: { s: 'Hannah' } },
    { label: '奇数长度: ("algorithm")', values: { s: 'algorithm' } },
    { label: '回文字符串: ("radar")', values: { s: 'radar' } },
  ],
  metrics: [
    { id: 'left', label: '左指针 left', color: '#3b82f6' },
    { id: 'right', label: '右指针 right', color: '#f59e0b' },
    { id: 'swaps', label: '已交换次数', color: '#10b981' },
    { id: 'status', label: '当前执行阶段', color: '#0f172a' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: 'left 指针', color: '#2563eb' },
    { label: 'right 指针', color: '#f59e0b' },
    { label: 'swap 交换', color: '#10b981' },
  ],
  codeLanguages: REVERSE_STRING_CODE_LANGUAGES,
  problemHtml: REVERSE_STRING_PROBLEM_HTML,
  analysisHtml: REVERSE_STRING_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(buildReverseStringSteps(String(inputs.s ?? 'hello'))),
  renderCanvas: (container, step) => renderReverseStringCanvas(container, step as ReverseStringStep),
});
