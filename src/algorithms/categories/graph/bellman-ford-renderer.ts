/**
 * Bellman-Ford 负权最短路径领域适配器 (Thin Domain Adapter)
 * V-1 轮全边遍历松弛、早停检测与负权回路判定 (左程云 class061)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  BELLMAN_FORD_PROBLEM_HTML,
  BELLMAN_FORD_ANALYSIS_HTML,
  BELLMAN_FORD_CODE_LANGUAGES,
} from './bellman-ford-problem-content';
import {
  BF_NODES,
  BF_EDGES,
  BF_NODE_POSITIONS,
  buildBFSteps,
  type BFStep,
} from './bellman-ford-step-compiler';
import { renderBellmanFordCanvas } from '../../../core/renderers/adapters/bellman-ford-canvas-adapter';

export { BF_NODES, BF_EDGES, BF_NODE_POSITIONS, buildBFSteps, type BFStep, renderBellmanFordCanvas };

export const bellmanFordVisualizer = registerDeclarativeAlgorithm({
  id: 'bellman-ford',
  aliases: ['bellman-ford-061', 'class061-code03'],
  name: 'Bellman-Ford 最短路',
  category: 'graph',
  icon: '🛤️',
  difficulty: 3,
  levelOrder: 23,
  hasDeductionTree: true,
  description: '左程云算法通关课 Class 061：支持负权边的单源最短路径算法，V-1 轮全边松弛与负权回路判定',
  learningGoal: '深刻理解全边松弛原理、早停判定机制以及负权回路的代数检测法则',
  inputs: [],
  presets: [
    { label: '默认图 (5 节点)', values: {} },
  ],
  metrics: [
    { id: 'metric-bf-round', label: '当前轮次 Round', color: '#dc2626' },
    { id: 'metric-bf-relax', label: '累计松弛次数', color: '#10b981' },
    { id: 'metric-bf-edge', label: '考察边 (u ➔ v, w)', color: '#3b82f6' },
    { id: 'metric-bf-dist', label: 'dist 距离表', color: '#2563eb' },
  ],
  legend: [
    { label: '当前考察边', state: 'comparing' },
    { label: '松弛成功', state: 'discovered' },
    { label: '无需更新', color: '#cbd5e1' },
    { label: '负权边', state: 'swapping' },
  ],
  codeLanguages: BELLMAN_FORD_CODE_LANGUAGES,
  problemHtml: BELLMAN_FORD_PROBLEM_HTML,
  analysisHtml: BELLMAN_FORD_ANALYSIS_HTML,
  generateSteps: () => buildBFSteps(),
  renderCanvas: (container, step) => renderBellmanFordCanvas(container, step as BFStep),
});
