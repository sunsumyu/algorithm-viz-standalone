/**
 * 右旋转字符串可视化器 — 声明式 4-Card 标准架构
 * KamaCoder 55：三次反转法
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  RIGHT_ROTATE_STRING_PROBLEM_HTML,
  RIGHT_ROTATE_STRING_ANALYSIS_HTML,
  RIGHT_ROTATE_STRING_CODE_LANGUAGES,
} from './right-rotate-string-problem-content';
import {
  RIGHT_ROTATE_STRING_CODE_LINES,
  RightRotateStep,
  buildRightRotateSteps,
  withMetrics,
} from './right-rotate-string-step-compiler';
import { renderRightRotateStringCanvas } from './right-rotate-string-canvas-adapter';

export type { RightRotateStep };
export {
  RIGHT_ROTATE_STRING_CODE_LINES,
  buildRightRotateSteps,
  renderRightRotateStringCanvas,
};

registerDeclarativeAlgorithm({
  id: 'right-rotate-string',
  name: '右旋转字符串（三次反转）',
  viewId: 'algo-right-rotate-view',
  category: 'string',
  description: '通过三次反转实现字符串右旋转 k 位',
  icon: '🔄',
  difficulty: 1,
  levelOrder: 5,
  learningGoal: '掌握通过分段反转实现字符串旋转的技巧',
  inputs: [
    {
      id: 's',
      label: '输入字符串',
      type: 'text',
      defaultValue: 'abcdefg',
      placeholder: '字符串',
    },
    {
      id: 'k',
      label: '旋转位数 k',
      type: 'number',
      defaultValue: 2,
      min: 1,
      max: 10,
    },
  ],
  presets: [
    { label: '示例 1: ("abcdefg", k=2)', values: { s: 'abcdefg', k: 2 } },
    { label: '示例 2: ("lrloseumgh", k=6)', values: { s: 'lrloseumgh', k: 6 } },
    { label: '对半旋转: ("helloworld", k=5)', values: { s: 'helloworld', k: 5 } },
    { label: '短字符串: ("abc", k=1)', values: { s: 'abc', k: 1 } },
  ],
  metrics: [
    { id: 'stage', label: '当前阶段', color: '#2563eb' },
    { id: 'window', label: '反转区间 [L, R]', color: '#9333ea' },
    { id: 'k', label: '旋转量 k', color: '#f59e0b' },
    { id: 'status', label: '执行状态', color: '#0f172a' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '反转区间', color: '#818cf8' },
    { label: 'left 指针', color: '#2563eb' },
    { label: 'right 指针', color: '#f59e0b' },
    { label: '交换中', color: '#10b981' },
  ],
  codeLanguages: RIGHT_ROTATE_STRING_CODE_LANGUAGES,
  problemHtml: RIGHT_ROTATE_STRING_PROBLEM_HTML,
  analysisHtml: RIGHT_ROTATE_STRING_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const k = parseInt(String(inputs.k ?? '2'), 10);
    return withMetrics(
      buildRightRotateSteps(String(inputs.s ?? 'abcdefg'), isNaN(k) || k <= 0 ? 2 : k)
    );
  },
  renderCanvas: (container, step) =>
    renderRightRotateStringCanvas(container, step as RightRotateStep),
});
