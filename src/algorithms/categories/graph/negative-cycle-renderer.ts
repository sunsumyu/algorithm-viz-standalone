/**
 * Bellman-Ford 负权回路检测领域适配器 (Thin Domain Adapter)
 * 4-Card 标准现代架构可视化器 (左程云 class061 / 洛谷 P3385)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  NEGATIVE_CYCLE_PROBLEM_HTML,
  NEGATIVE_CYCLE_ANALYSIS_HTML,
  NEGATIVE_CYCLE_CODE_LANGUAGES,
} from './negative-cycle-problem-content';
import {
  NC_NODES,
  NC_EDGES,
  NC_NODE_POS,
  buildNCSteps,
  type NCStep,
} from './negative-cycle-step-compiler';
import { renderNegativeCycleCanvas } from '../../../core/renderers/adapters/bellman-ford-canvas-adapter';

export { NC_NODES, NC_EDGES, NC_NODE_POS, buildNCSteps, type NCStep, renderNegativeCycleCanvas };

export const negativeCycleVisualizer = registerDeclarativeAlgorithm({
  id: 'negative-cycle',
  aliases: ['negative-cycle-061', 'class061-code06', 'spfa-negative-cycle'],
  name: '负权回路检测 (Negative Cycle)',
  category: 'graph',
  icon: '🔄',
  difficulty: 3,
  levelOrder: 26,
  hasDeductionTree: true,
  description: '左程云算法通关课 Class 061：基于 Bellman-Ford 的第 N 轮松弛判定准则，识别图中使得最短路无下界的负权环 (洛谷 P3385)',
  learningGoal: '掌握负权回路判定定理、第 N 轮额外松弛扫描机制以及无限递减状态识别',
  inputs: [],
  presets: [
    { label: '默认图 (含负环)', values: {} },
  ],
  metrics: [
    { id: 'metric-nc-round', label: '当前轮次', color: '#2563eb' },
    { id: 'metric-nc-edge', label: '考察边 (u➔v, w)', color: '#eab308' },
    { id: 'metric-nc-cycle', label: '负环判定', color: '#10b981' },
    { id: 'metric-nc-dist', label: 'dist 距离表', color: '#16a34a' },
  ],
  legend: [
    { label: '正在松弛边', color: '#2563eb' },
    { label: '正常松弛', color: '#16a34a' },
    { label: '负权回路边', color: '#dc2626' },
    { label: '负环节点', color: '#fee2e2' },
  ],
  codeLanguages: NEGATIVE_CYCLE_CODE_LANGUAGES,
  problemHtml: NEGATIVE_CYCLE_PROBLEM_HTML,
  analysisHtml: NEGATIVE_CYCLE_ANALYSIS_HTML,
  generateSteps: () => buildNCSteps(),
  renderCanvas: (container, step) => renderNegativeCycleCanvas(container, step as NCStep),
});
