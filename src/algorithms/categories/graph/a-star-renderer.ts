/**
 * A* 启发式搜索可视化器 — 4-Card 标准现代架构
 * 评估函数 f(n) = g(n) + h(n)、Open/Closed 列表演变与最优路径重构
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  A_STAR_PROBLEM_HTML,
  A_STAR_ANALYSIS_HTML,
  A_STAR_CODE_LANGUAGES,
} from './a-star-problem-content';
import { BinaryGridCanvasAdapter } from '../../../core/renderers/adapters/binary-grid-canvas-adapter';
import type { AStarNode, AStarStep } from './a-star-step-compiler';
import {
  ASTAR_GRID,
  ASTAR_START,
  ASTAR_GOAL,
  ASTAR_CODE_LINES,
  buildAStarSteps,
  withMetrics,
} from './a-star-step-compiler';

export type { AStarNode, AStarStep };
export {
  ASTAR_GRID,
  ASTAR_START,
  ASTAR_GOAL,
  ASTAR_CODE_LINES,
  buildAStarSteps,
};

export function renderAStarCanvas(container: HTMLElement, step: AStarStep): void {
  const { grid, start, goal, currentNode, openSet, closedSet, finalPath } = step;
  const m = grid.length;
  const n = grid[0].length;

  const openMap = new Set(openSet.map(([r, c]) => `${r},${c}`));
  const closedMap = new Set(closedSet.map(([r, c]) => `${r},${c}`));
  const pathMap = new Set(finalPath.map(([r, c]) => `${r},${c}`));

  BinaryGridCanvasAdapter.renderGridCanvas(container, {
    rows: m,
    cols: n,
    variant: 'adventurer',
    adventurer: currentNode
      ? {
          r: currentNode[0],
          c: currentNode[1],
          state: step.action === 'reach-goal' ? 'cheering' : 'walking',
        }
      : null,
    targetPos: goal,
    getCell: (r, c) => {
      const isStart = start[0] === r && start[1] === c;
      const isGoal = goal[0] === r && goal[1] === c;
      const isWall = grid[r][c] === 1;
      const isPath = pathMap.has(`${r},${c}`);
      const isOpen = openMap.has(`${r},${c}`);
      const isClosed = closedMap.has(`${r},${c}`);

      let bg = '#ffffff';
      let border = '1.5px solid #cbd5e1';
      let color = '#64748b';
      let label = isClosed ? '·' : '';

      if (isStart) {
        bg = '#dbeafe';
        color = '#1d4ed8';
        border = '2px solid #3b82f6';
        label = 'S';
      } else if (isGoal) {
        bg = '#dcfce7';
        color = '#15803d';
        border = '2px solid #22c55e';
        label = 'G';
      } else if (isWall) {
        bg = '#334155';
        color = '#e2e8f0';
        border = '1.5px solid #1e293b';
        label = '■';
      } else if (isPath) {
        bg = '#10b981';
        color = '#ffffff';
        border = '2px solid #059669';
        label = '★';
      } else if (isOpen) {
        bg = '#fef9c3';
        color = '#a16207';
        border = '1.5px solid #ca8a04';
        label = 'o';
      }

      return {
        text: label,
        bg,
        border,
        color,
        title: `(${r},${c})${isStart ? ' 起点' : ''}${isGoal ? ' 终点' : ''}${isWall ? ' 障碍' : ''}`,
      };
    },
  });
}

registerDeclarativeAlgorithm({
  id: 'a-star',
  name: 'A* 启发式搜索',
  category: 'graph',
  description: '结合实际路径代价与曼哈顿启发距离在网格中快速寻找最优路径',
  icon: '⭐',
  difficulty: 2,
  levelOrder: 9,
  learningGoal: '掌握评估函数 f(n)=g(n)+h(n) 的设计与 Open/Closed 优先队列管理',
  hasDeductionTree: true,
  inputs: [],
  presets: [{ label: '默认网格 (5×6 含障碍)', values: {} }],
  metrics: [
    { id: 'metric-as-cur', label: '当前考察节点', color: '#ea580c' },
    { id: 'metric-as-f', label: 'f 值 (估计总代价)', color: '#3b82f6' },
    { id: 'metric-as-gh', label: 'g / h 值', color: '#10b981' },
    { id: 'metric-as-closed', label: 'Closed 集合数', color: '#64748b' },
  ],
  legend: [
    { label: '起点 (S)', color: '#3b82f6' },
    { label: '终点 (G)', color: '#22c55e' },
    { label: '障碍物 (■)', color: '#334155' },
    { label: '待选 Open (o)', color: '#ca8a04' },
    { label: '当前考察', color: '#ea580c' },
    { label: '最优路径 (★)', color: '#10b981' },
  ],
  codeLanguages: A_STAR_CODE_LANGUAGES,
  problemHtml: A_STAR_PROBLEM_HTML,
  analysisHtml: A_STAR_ANALYSIS_HTML,
  generateSteps: () => withMetrics(buildAStarSteps()),
  renderCanvas: (container, step) => renderAStarCanvas(container, step as AStarStep),
});
