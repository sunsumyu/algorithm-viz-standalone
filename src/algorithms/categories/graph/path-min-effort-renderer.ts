/**
 * 最小体力消耗路径 (Path With Minimum Effort - LeetCode 1631) 声明式可视化器
 * 核心：2D 网格 Dijkstra 瓶颈最短路、max(effort, |h1 - h2|) 状态松弛、小根堆贪心搜索
 * 架构规范：轻量领域适配器 (Thin Domain Adapter, LOC < 60) 委托核心深模块
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  PATH_MIN_EFFORT_CODE_LANGUAGES,
  PATH_MIN_EFFORT_PROBLEM_HTML,
  PATH_MIN_EFFORT_ANALYSIS_HTML,
} from './path-min-effort-problem-content';
import {
  PathMinEffortCanvasAdapter,
  renderPathMinEffortCanvas,
} from '../../../core/renderers/adapters/path-min-effort-canvas-adapter';
import { BinaryGridCanvasAdapter } from '../../../core/renderers/adapters/binary-grid-canvas-adapter';
import type { EffortStep } from './path-min-effort-step-compiler';
import {
  buildPathMinEffortSteps,
  PRESET_EFFORT_GRIDS,
} from './path-min-effort-step-compiler';

export type { EffortStep };
export { buildPathMinEffortSteps, renderPathMinEffortCanvas, BinaryGridCanvasAdapter };

export const { Visualizer: PathMinEffortVisualizer } = registerDeclarativeAlgorithm<EffortStep>({
  id: 'path-min-effort',
  name: '最小体力消耗路径 (Path With Minimum Effort)',
  aliases: ['path-min-effort-064', 'class064-code02', 'leetcode-1631', 'minimum-effort-path'],
  category: 'graph',
  description: '左程云算法通关课 Class 064 Code02：网格图瓶颈最短路、max(|h1 - h2|) 松弛、Dijkstra 优先队列贪心扩展 (LeetCode 1631)',
  icon: '🧗',
  difficulty: 3,
  levelOrder: 75,
  hasDeductionTree: true,
  learningGoal: '深刻理解瓶颈最短路模型转化、网格图 Dijkstra 堆优化松弛与 MiniMax 问题求解',
  codeLanguages: PATH_MIN_EFFORT_CODE_LANGUAGES,
  problemHtml: PATH_MIN_EFFORT_PROBLEM_HTML,
  analysisHtml: PATH_MIN_EFFORT_ANALYSIS_HTML,
  presets: Object.entries(PRESET_EFFORT_GRIDS).map(([value, { label }]) => ({ label, values: { preset: value } })),
  metrics: [
    { id: 'metric-cur-coord', label: '当前探索格', color: '#f59e0b' },
    { id: 'metric-min-effort', label: '最小瓶颈体力', color: '#10b981' },
    { id: 'metric-cur-height', label: '当前高度', color: '#3b82f6' },
    { id: 'metric-effort-phase', label: '阶段状态', color: '#8b5cf6' },
  ],
  generateSteps: (inputs) => buildPathMinEffortSteps(String(inputs?.preset || 'classic_mountain_3x3')),
  renderCanvas: (container, step) => PathMinEffortCanvasAdapter.render(container, step),
});
