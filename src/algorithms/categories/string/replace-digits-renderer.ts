/**
 * 替换数字可视化器 — 声明式 4-Card 标准架构
 * KamaCoder 54：预扩容与从后向前双指针替换
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  REPLACE_DIGITS_PROBLEM_HTML,
  REPLACE_DIGITS_ANALYSIS_HTML,
  REPLACE_DIGITS_CODE_LANGUAGES,
} from './replace-digits-problem-content';
import {
  REPLACE_DIGITS_CODE_LINES,
  ReplaceDigitsStep,
  buildReplaceDigitsSteps,
  withMetrics,
} from './replace-digits-step-compiler';
import { renderReplaceDigitsCanvas } from './replace-digits-canvas-adapter';

export type { ReplaceDigitsStep };
export {
  REPLACE_DIGITS_CODE_LINES,
  buildReplaceDigitsSteps,
  renderReplaceDigitsCanvas,
};

registerDeclarativeAlgorithm({
  id: 'replace-digits',
  name: '替换数字（单指针遍历）',
  category: 'string',
  description: '遍历字符串，将数字字符替换为指定内容',
  icon: '🔢',
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '掌握字符串遍历中条件替换的逻辑',
  inputs: [
    {
      id: 's',
      label: '字符串',
      type: 'text',
      defaultValue: 'a1b2c',
      placeholder: '字符串',
    },
  ],
  presets: [
    { label: '示例 1: ("a1b2c")', values: { s: 'a1b2c' } },
    { label: '纯数字: ("123")', values: { s: '123' } },
    { label: '纯字母: ("hello")', values: { s: 'hello' } },
    { label: '单个数字: ("a9b")', values: { s: 'a9b' } },
  ],
  metrics: [
    { id: 'old-idx', label: '读取指针 oldIndex', color: '#3b82f6' },
    { id: 'new-idx', label: '写入指针 newIndex', color: '#f59e0b' },
    { id: 'digits', label: '数字个数 count', color: '#10b981' },
    { id: 'phase', label: '当前阶段', color: '#0f172a' },
    { id: 'action', label: '扩容公式', color: '#2563eb' },
  ],
  legend: [
    { label: 'oldIndex (读)', color: '#2563eb' },
    { label: 'newIndex (写)', color: '#f59e0b' },
    { label: '"number"', color: '#10b981' },
  ],
  codeLanguages: REPLACE_DIGITS_CODE_LANGUAGES,
  problemHtml: REPLACE_DIGITS_PROBLEM_HTML,
  analysisHtml: REPLACE_DIGITS_ANALYSIS_HTML,
  generateSteps: (inputs) => withMetrics(buildReplaceDigitsSteps(String(inputs.s ?? 'a1b2c'))),
  renderCanvas: (container, step) => renderReplaceDigitsCanvas(container, step as ReplaceDigitsStep),
});
