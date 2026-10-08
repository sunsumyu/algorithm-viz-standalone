/**
 * 最小体力消耗路径 (Path With Minimum Effort - LeetCode 1631) 声明式可视化器
 * 核心：2D 网格 Dijkstra 瓶颈最短路、max(effort, |h1 - h2|) 状态松弛、小根堆贪心搜索
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  PATH_MIN_EFFORT_CODE_LANGUAGES,
  PATH_MIN_EFFORT_PROBLEM_HTML,
  PATH_MIN_EFFORT_ANALYSIS_HTML,
} from './path-min-effort-problem-content';
import { BinaryGridCanvasAdapter } from '../../../core/renderers/adapters/binary-grid-canvas-adapter';
import type { EffortStep } from './path-min-effort-step-compiler';
import {
  buildPathMinEffortSteps,
  PRESET_EFFORT_GRIDS,
} from './path-min-effort-step-compiler';

export type { EffortStep };
export { buildPathMinEffortSteps };

export function renderPathMinEffortCanvas(container: HTMLElement, step: EffortStep): void {
  const { grid, dist, visited, curR, curC, pathNodes, pqList } = step;
  const rows = grid.length;
  const cols = grid[0].length;
  const pathSet = new Set(pathNodes.map(([r, c]) => `${r},${c}`));

  BinaryGridCanvasAdapter.renderGridCanvas(container, {
    rows,
    cols,
    cellSize: '1fr',
    maxWidth: '480px',
    getCell: (r, c) => {
      const isCur = r === curR && c === curC;
      const isPath = pathSet.has(`${r},${c}`);
      const isTarget = r === rows - 1 && c === cols - 1;
      const isStart = r === 0 && c === 0;
      const d = dist[r][c];

      let bg = '#ffffff';
      let border = '1.5px solid #cbd5e1';
      let color = '#334155';
      if (isPath) {
        bg = '#ecfdf5';
        border = '2px solid #10b981';
        color = '#065f46';
      } else if (visited[r][c]) {
        bg = '#f1f5f9';
        border = '1.5px solid #94a3b8';
        color = '#64748b';
      }

      return {
        text: `${grid[r][c]}m (落差:${d === Infinity ? '∞' : d})`,
        bg,
        border: isCur ? '2px solid #f59e0b' : border,
        color,
        boxShadow: isCur ? '0 0 0 3px rgba(245, 158, 11, 0.35)' : 'none',
        transform: isCur ? 'scale(1.06)' : 'none',
        zIndex: isCur ? 10 : 1,
        title: `${isStart ? '起点 ' : ''}${isTarget ? '终点 ' : ''}(${r},${c}) 高度:${grid[r][c]} 瓶颈:${d === Infinity ? '∞' : d}`,
      };
    },
  });
}

const { template, Visualizer } = createDeclarativeVisualizer<EffortStep>({
  id: 'path-min-effort',
  title: '最小体力消耗路径 (Path With Minimum Effort)',
  category: 'graph',
  codeLanguages: PATH_MIN_EFFORT_CODE_LANGUAGES,
  problemHtml: PATH_MIN_EFFORT_PROBLEM_HTML,
  analysisHtml: PATH_MIN_EFFORT_ANALYSIS_HTML,
  generateSteps: (inputs) => buildPathMinEffortSteps(String(inputs?.preset || 'classic_mountain_3x3')),
  inputs: [
    {
      id: 'preset',
      label: '地形预设',
      type: 'select',
      defaultValue: 'classic_mountain_3x3',
      options: Object.entries(PRESET_EFFORT_GRIDS).map(([value, { label }]) => ({ value, label })),
    },
  ],
  metrics: [
    { id: 'metric-cur-coord', label: '当前探索格', color: '#f59e0b' },
    { id: 'metric-min-effort', label: '最小瓶颈体力', color: '#10b981' },
    { id: 'metric-cur-height', label: '当前高度', color: '#3b82f6' },
    { id: 'metric-effort-phase', label: '阶段状态', color: '#8b5cf6' },
  ],
  renderCanvas: (container, step) => renderPathMinEffortCanvas(container, step),
});

registerAlgorithm({
  id: 'path-min-effort',
  name: '最小体力消耗路径 (Path With Minimum Effort)',
  viewId: 'algo-path-min-effort-view',
  icon: '🧗',
  category: 'graph',
  description: '左程云算法通关课 Class 064 Code02：网格图瓶颈最短路、max(|h1 - h2|) 松弛、Dijkstra 优先队列贪心扩展 (LeetCode 1631)',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 75,
  learningGoal: '深刻理解瓶颈最短路模型转化、网格图 Dijkstra 堆优化松弛与 MiniMax 问题求解',
});

export { Visualizer as PathMinEffortVisualizer };
