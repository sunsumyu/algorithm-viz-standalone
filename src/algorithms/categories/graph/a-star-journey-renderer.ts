/**
 * A* 算法网格寻路与启发式搜索 (A* Grid Pathfinding Journey) 声明式可视化器
 * 核心：曼哈顿启发函数 h(x,y)、综合代价 f = g + h、优先队列小根堆定向加速寻路
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  A_STAR_JOURNEY_CODE_LANGUAGES,
  A_STAR_JOURNEY_PROBLEM_HTML,
  A_STAR_JOURNEY_ANALYSIS_HTML,
} from './a-star-journey-problem-content';
import { BinaryGridCanvasAdapter } from '../../../core/renderers/adapters/binary-grid-canvas-adapter';
import type { AStarJourneyStep } from './a-star-journey-step-compiler';
import {
  buildAStarJourneySteps,
  PRESET_JOURNEY_MAPS,
} from './a-star-journey-step-compiler';

export type { AStarJourneyStep };
export { buildAStarJourneySteps };

export function renderAStarJourneyCanvas(container: HTMLElement, step: AStarJourneyStep): void {
  const { grid, path, openSet, closedSet, curR, curC, fScore, distanceGrid, status } = step;
  const n = grid.length;
  const m = grid[0].length;

  const pathSet = new Set(path.map(([r, c]) => `${r},${c}`));
  const openSetKeys = new Set(openSet.map(([r, c]) => `${r},${c}`));
  const closedSetKeys = new Set(closedSet.map(([r, c]) => `${r},${c}`));

  BinaryGridCanvasAdapter.renderGridCanvas(container, {
    rows: n,
    cols: m,
    variant: 'adventurer',
    adventurer: {
      r: curR,
      c: curC,
      state: status === 'done' ? 'cheering' : 'walking',
      isFinish: status === 'done',
    },
    targetPos: [n - 1, m - 1],
    riverBarrierText: '🌊 边界阻挡 · 曼哈顿启发式定向收敛 🧭',
    getCell: (r, c) => {
      const isWall = grid[r][c] === 0;
      const inPath = pathSet.has(`${r},${c}`);
      const inOpen = openSetKeys.has(`${r},${c}`);
      const inClosed = closedSetKeys.has(`${r},${c}`);
      const isStart = r === 0 && c === 0;
      const isTarget = r === n - 1 && c === m - 1;

      let bg = '#ffffff';
      let border = '1.5px solid #cbd5e1';
      let color = '#334155';

      if (isWall) {
        bg = '#1e293b';
        border = '1.5px solid #0f172a';
        color = '#94a3b8';
      } else if (inPath) {
        bg = '#ecfdf5';
        border = '2px solid #10b981';
        color = '#065f46';
      } else if (inClosed) {
        bg = '#f0fdfa';
        border = '1.5px solid #2dd4bf';
        color = '#0f766e';
      } else if (inOpen) {
        bg = '#eff6ff';
        border = '1.5px solid #60a5fa';
        color = '#1d4ed8';
      }

      const gVal = distanceGrid[r][c];
      const gStr = gVal === Infinity ? '∞' : `${gVal}`;
      const fVal = fScore[`${r},${c}`];
      const valText = isWall ? '🧱' : `g:${gStr}${fVal !== undefined ? ` f:${fVal}` : ''}`;

      return {
        text: valText,
        bg,
        border,
        color,
        title: `${isStart ? '起点 ' : ''}${isTarget ? '终点 ' : ''}(${r},${c})${isWall ? ' 障碍' : ''}`,
      };
    },
  });
}

const { template, Visualizer } = createDeclarativeVisualizer<AStarJourneyStep>({
  id: 'a-star-journey',
  name: 'A* 算法网格寻路 (A* Grid Pathfinding)',
  viewId: 'algo-a-star-journey-view',
  category: 'graph',
  icon: '🧭',
  hasDeductionTree: true,
  codeLanguages: A_STAR_JOURNEY_CODE_LANGUAGES,
  problemHtml: A_STAR_JOURNEY_PROBLEM_HTML,
  analysisHtml: A_STAR_JOURNEY_ANALYSIS_HTML,
  inputs: [
    {
      id: 'input-preset',
      label: '预设网格地图',
      type: 'select',
      defaultValue: 'classic_3x4',
      options: Object.entries(PRESET_JOURNEY_MAPS).map(([value, { label }]) => ({ value, label })),
    },
  ],
  presets: [
    { label: '3x4 经典障碍', values: { 'input-preset': 'classic_3x4' } },
    { label: '3x3 对称绕行', values: { 'input-preset': 'line_3x3' } },
  ],
  metrics: [
    { id: 'metric-astar-coord', label: '当前考察坐标', color: '#f59e0b' },
    { id: 'metric-astar-f', label: '综合估价值 (f=g+h)', color: '#10b981' },
    { id: 'metric-open-size', label: 'OpenSet 规模', color: '#38bdf8' },
    { id: 'metric-astar-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  generateSteps: (inputs) => buildAStarJourneySteps((inputs?.['input-preset'] || 'classic_3x4') as string),
  renderCanvas: (container, step) => renderAStarJourneyCanvas(container, step),
});

registerAlgorithm({
  id: 'a-star-journey',
  name: 'A* 算法网格寻路 (A* Grid Pathfinding)',
  viewId: 'algo-a-star-journey-view',
  category: 'graph',
  description: '左程云 Class 065 核心：综合估价函数 f = g + h、曼哈顿距离启发式剪枝、优先队列定向加速寻路 (洛谷 P1379)',
  icon: '🧭',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 27,
  aliases: ['class065-code01', 'a-star-journey-065', 'a-star-class065', 'a-star-grid-pathfinding'],
  learningGoal: '掌握 A* 启发式搜索的核心设计、f/g/h 估价体系与 Dijkstra 算法的本质异同',
});

export { Visualizer as AStarJourneyVisualizer };
