/**
 * SPFA 队列优化最短路径领域适配器 (Thin Domain Adapter)
 * 队列按需触发松弛、在队标记防止重复进队与负权图高效求解 (左程云 class061)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  SPFA_PROBLEM_HTML,
  SPFA_ANALYSIS_HTML,
  SPFA_CODE_LANGUAGES,
} from './spfa-problem-content';
import {
  buildSPFASteps,
  type SPFAStep,
} from './spfa-step-compiler';
import { renderSpfaCanvas } from '../../../core/renderers/adapters/bellman-ford-canvas-adapter';

export { buildSPFASteps, type SPFAStep, renderSpfaCanvas };

export const spfaVisualizer = registerDeclarativeAlgorithm({
  id: 'spfa',
  aliases: ['spfa-061', 'class061-code04', 'queue-bellman-ford'],
  name: 'SPFA 队列优化最短路',
  category: 'graph',
  icon: '⚡',
  difficulty: 3,
  levelOrder: 24,
  hasDeductionTree: true,
  description: '左程云算法通关课 Class 061：Bellman-Ford 的队列优化算法，动态维护被更新距离的顶点，快速逼近全局最短路径',
  learningGoal: '深刻理解队列驱动松弛机制、在队标记 inQueue 的作用与负环检测原理',
  inputs: [],
  presets: [
    { label: '默认图 (5 节点)', values: {} },
  ],
  metrics: [
    { id: 'metric-spfa-queue', label: '就绪队列', color: '#a855f7' },
    { id: 'metric-spfa-cur', label: '当前出队节点', color: '#fbbf24' },
    { id: 'metric-spfa-relax', label: '松弛次数', color: '#10b981' },
    { id: 'metric-spfa-dist', label: 'dist 距离表', color: '#2563eb' },
  ],
  legend: [
    { label: '当前出队节点', state: 'pivot' },
    { label: '在队中', state: 'comparing' },
    { label: '松弛目标', state: 'discovered' },
    { label: '负权边', state: 'swapping' },
  ],
  codeLanguages: SPFA_CODE_LANGUAGES,
  problemHtml: SPFA_PROBLEM_HTML,
  analysisHtml: SPFA_ANALYSIS_HTML,
  generateSteps: () => buildSPFASteps(),
  renderCanvas: (container, step) => renderSpfaCanvas(container, step as SPFAStep),
});
