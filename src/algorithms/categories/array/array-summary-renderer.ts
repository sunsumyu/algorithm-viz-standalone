/**
 * 数组专题总结篇 可视化器 — 4-Card 标准现代架构
 * 系统回顾数组专题所有核心技巧：双指针、二分、滑动窗口、前缀和、模拟边界等
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  ARRAY_SUMMARY_PROBLEM_HTML,
  ARRAY_SUMMARY_ANALYSIS_HTML,
  ARRAY_SUMMARY_CODE_LANGUAGES,
} from './array-summary-problem-content';
import {
  ASStep,
  buildArraySummarySteps,
  withMetrics,
} from './array-summary-step-compiler';
import {
  DemoQuestion,
  DEMO_QUESTIONS,
  renderArraySummaryCanvas,
} from './array-summary-canvas-adapter';

export type { ASStep, DemoQuestion };
export {
  DEMO_QUESTIONS,
  buildArraySummarySteps,
  renderArraySummaryCanvas,
};

registerDeclarativeAlgorithm<ASStep>({
  id: 'array-summary',
  name: '数组专题总结篇',
  category: 'array',
  description: '回顾数组专题所有核心技巧',
  icon: '📝',
  difficulty: 1,
  levelOrder: 8,
  learningGoal: '系统回顾数组专题所有核心技巧',
  inputs: [],
  presets: [
    { label: '六大范式速览', values: {} },
  ],
  metrics: [
    { id: 'topic', label: '当前主题', color: '#2563eb' },
    { id: 'trick', label: '核心技巧', color: '#a855f7' },
    { id: 'problems', label: '关联例题', color: '#f59e0b' },
  ],
  legend: [
    { label: '当前范式', color: '#3b82f6' },
  ],
  codeLanguages: ARRAY_SUMMARY_CODE_LANGUAGES,
  problemHtml: ARRAY_SUMMARY_PROBLEM_HTML,
  analysisHtml: ARRAY_SUMMARY_ANALYSIS_HTML,
  generateSteps: () => withMetrics(buildArraySummarySteps()),
  renderCanvas: (container, step) => renderArraySummaryCanvas(container, step as ASStep),
});
