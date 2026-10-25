/**
 * 螺旋矩阵 II 可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * LeetCode 59：四边界收缩模拟
 * 遵循 Zero-Subbox 规范，扁平 2D 网格沙盘
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  SPIRAL_MATRIX_II_PROBLEM_HTML,
  SPIRAL_MATRIX_II_ANALYSIS_HTML,
  SPIRAL_MATRIX_II_CODE_LANGUAGES,
} from './spiral-matrix-ii-problem-content';
import {
  SpiralStep,
  buildSpiralSteps,
} from './spiral-matrix-ii-step-compiler';
import { renderSpiralMatrixIICanvas } from './spiral-matrix-ii-canvas-adapter';

export type { SpiralStep };
export { buildSpiralSteps };

const { template, Visualizer } = createDeclarativeVisualizer<SpiralStep>({
  id: 'spiral-matrix-ii',
  name: '螺旋矩阵 II',
  category: 'array',
  icon: '🌀',
  badge: {
    mode: '四边界收缩模拟',
    complexity: 'O(n²) · O(1)',
  },
  card1Title: '📊 螺旋矩阵 2D 网格填充沙盘',
  card2Title: '🧭 填充方向与四边界坐标监视器',
  card2Desc: '当前填充坐标 (r, c)、前进方向与 [top, bottom, left, right] 边界',
  legend: [
    { label: '当前填充格', color: '#fbbf24' },
    { label: '已填充数字', color: '#10b981' },
    { label: '待填充空格', color: '#cbd5e1' },
  ],
  inputs: [
    {
      id: 'input-n',
      label: '矩阵阶数 n',
      type: 'number',
      defaultValue: 3,
      width: '45px',
    },
  ],
  presets: [
    { label: '3×3 标准矩阵', values: { 'input-n': 3 } },
    { label: '4×4 偶数阶', values: { 'input-n': 4 } },
    { label: '5×5 奇数阶', values: { 'input-n': 5 } },
  ],
  metrics: [
    { id: 'cur-pos', label: '当前填充坐标 (r, c)', color: '#2563eb' },
    { id: 'fill-dir', label: '当前填充方向', color: '#f59e0b' },
    { id: 'fill-progress', label: '填充进度', color: '#16a34a' },
  ],
  codeLanguages: SPIRAL_MATRIX_II_CODE_LANGUAGES,
  problemHtml: SPIRAL_MATRIX_II_PROBLEM_HTML,
  analysisHtml: SPIRAL_MATRIX_II_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const n = Math.min(6, Math.max(1, parseInt(inputs['input-n'] || '3', 10)));
    return buildSpiralSteps(n);
  },
  renderCanvas: (container, step) => {
    renderSpiralMatrixIICanvas(container, step);
  },
});

registerAlgorithm({
  id: 'spiral-matrix-ii',
  aliases: ['59', 'leetcode-59', 'spiral-matrix-2'],
  hasDeductionTree: true,
  name: '螺旋矩阵 II',
  viewId: 'algo-spiral-matrix-ii-view',
  category: 'array',
  description: '四边界顺时针模拟：右下左上依次填充，每完成一条边立刻收缩对应边界',
  icon: '🌀',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 5,
  learningGoal: '掌握二维矩阵模拟中四边界收缩法的高效无差错边界控制思想',
});
