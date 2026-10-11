/**
 * 开发商购买土地可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * KamaCoder 44：二维前缀和构建与子矩阵枚举
 * 遵循 Zero-Subbox 规范，扁平 2D 网格沙盘
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  BUY_LAND_PROBLEM_HTML,
  BUY_LAND_ANALYSIS_HTML,
  BUY_LAND_CODE_LANGUAGES,
} from './buy-land-problem-content';
import {
  BLStep,
  parseGrid,
  buildBuyLandSteps,
} from './buy-land-step-compiler';
import { renderBuyLandCanvas } from './buy-land-canvas-adapter';

export type { BLStep };
export { parseGrid, buildBuyLandSteps };

const { template, Visualizer } = createDeclarativeVisualizer<BLStep>({
  id: 'buy-land',
  name: '开发商购买土地',
  category: 'array',
  icon: '🏞️',
  badge: {
    mode: '二维前缀和·子矩阵枚举',
    complexity: 'O(m²n²) · O(mn)',
  },
  card1Title: '📊 土地价值 2D 网格与候选矩形沙盘',
  card2Title: '🧭 二维容斥公式与最大面积监视器',
  card2Desc: '当前考察矩形 [r1,c1]..[r2,c2]、开销与最佳面积',
  legend: [
    { label: '最佳购买区域', color: '#10b981' },
    { label: '当前考察矩形', color: '#3b82f6' },
  ],
  inputs: [
    {
      id: 'input-grid',
      label: '土地价值网格',
      type: 'text',
      defaultValue: '1, 2, 3; 4, 5, 6; 7, 8, 9',
      width: '160px',
      placeholder: '行以分号隔开',
    },
    {
      id: 'input-budget',
      label: '预算 budget',
      type: 'number',
      defaultValue: 20,
      width: '45px',
    },
  ],
  presets: [
    { label: '示例 1 (budget=20)', values: { 'input-grid': '1, 2, 3; 4, 5, 6; 7, 8, 9', 'input-budget': 20 } },
    { label: '小网格 (budget=10)', values: { 'input-grid': '1, 2; 3, 4', 'input-budget': 10 } },
    { label: '大预算 (budget=50)', values: { 'input-grid': '2, 3, 1; 1, 4, 2; 3, 2, 5', 'input-budget': 50 } },
  ],
  metrics: [
    { id: 'cur-cost', label: '当前矩形开销', color: '#2563eb' },
    { id: 'cur-area', label: '当前面积', color: '#f59e0b' },
    { id: 'best-area', label: '最佳最大面积', color: '#16a34a' },
  ],
  codeLanguages: BUY_LAND_CODE_LANGUAGES,
  problemHtml: BUY_LAND_PROBLEM_HTML,
  analysisHtml: BUY_LAND_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const rawGrid = inputs['input-grid'] || '1, 2, 3; 4, 5, 6; 7, 8, 9';
    const grid = parseGrid(rawGrid);
    const budget = parseInt(inputs['input-budget'] || '20', 10);
    return buildBuyLandSteps(grid, budget);
  },
  renderCanvas: (container, step) => {
    renderBuyLandCanvas(container, step);
  },
});

registerAlgorithm({
  id: 'buy-land',
  name: '开发商购买土地',
  viewId: 'algo-buy-land-view',
  category: 'array',
  description: '二维前缀和构建 O(mn)，容斥原理 O(1) 快速计算任意子矩阵开销并在预算内求解最大连续面积',
  icon: '🏞️',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 7,
  learningGoal: '掌握二维前缀和数组的容斥原理建模与高维连续子区间开销的常数级查询算法',
});
