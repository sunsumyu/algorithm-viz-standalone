/**
 * 快乐数可视化器 — 声明式 4-Card 标准架构
 * LeetCode 202：HashSet 判环
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  HAPPY_NUMBER_PROBLEM_HTML,
  HAPPY_NUMBER_ANALYSIS_HTML,
  HAPPY_NUMBER_CODE_LANGUAGES,
} from './happy-number-problem-content';
import {
  HappyNumberStep,
  getNextSquareSum,
  buildHappyNumberSteps,
  withHappyNumberMetrics,
} from './happy-number-step-compiler';
import { renderHappyNumberCanvas } from './happy-number-canvas-adapter';

export type { HappyNumberStep };
export {
  getNextSquareSum,
  buildHappyNumberSteps,
  withHappyNumberMetrics,
  renderHappyNumberCanvas,
};

registerDeclarativeAlgorithm({
  id: 'happy-number',
  name: '快乐数（哈希集合判环）',
  category: 'hash-table',
  description: '用哈希集合检测平方和循环，判断快乐数',
  icon: '😊',
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '掌握用 Set 检测循环的方法',
  inputs: [
    {
      id: 'n',
      label: 'n',
      type: 'number',
      defaultValue: 19,
      placeholder: '正整数 n',
      width: '50px',
    },
  ],
  presets: [
    { label: '示例 1: (n = 19 ➔ 快乐数)', values: { n: 19 } },
    { label: '示例 2: (n = 2 ➔ 死循环)', values: { n: 2 } },
    { label: '快乐数: (n = 7)', values: { n: 7 } },
    { label: '死循环: (n = 11)', values: { n: 11 } },
  ],
  metrics: [
    { id: 'n', label: '当前数值 n', color: '#2563eb' },
    { id: 'next', label: '下一平方和', color: '#9333ea' },
    { id: 'set-size', label: '已记录数大小', color: '#f59e0b' },
    { id: 'res', label: '判定结果', color: '#10b981' },
  ],
  legend: [
    { label: '1 (快乐数)', color: '#10b981' },
    { label: '重复出现 (死循环)', color: '#ef4444' },
  ],
  codeLanguages: HAPPY_NUMBER_CODE_LANGUAGES,
  problemHtml: HAPPY_NUMBER_PROBLEM_HTML,
  analysisHtml: HAPPY_NUMBER_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const n = parseInt(String(inputs.n ?? '19'), 10);
    return withHappyNumberMetrics(buildHappyNumberSteps(isNaN(n) || n <= 0 ? 19 : n));
  },
  renderCanvas: (container, step) => renderHappyNumberCanvas(container, step as HappyNumberStep),
});
