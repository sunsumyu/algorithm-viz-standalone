/**
 * 左程云算法通关课 Class 062: 到达角落需要移除障碍物的最小数目 (LeetCode 2290)
 * 0-1 BFS 双端队列 (Deque) 最短路 — 声明式 Thin Domain Adapter (LOC < 140)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_062_PROBLEMS } from './graph-062-problem-content';
import { MINIMUM_OBSTACLES_062_CODES } from './graph-062-stage-codes';
import { renderDequeVisualization } from './graph-062-shared';
import { BinaryGridCanvasAdapter } from '../../../../core/renderers/adapters/binary-grid-canvas-adapter';
import {
  buildMinimumObstacles062Steps,
  type MinimumObstaclesStep,
} from './minimum-obstacles-062-step-compiler';

export { buildMinimumObstacles062Steps, type MinimumObstaclesStep };

export function renderMinimumObstaclesCanvas(container: HTMLElement, step: MinimumObstaclesStep): void {
  const m = step.grid.length;
  const n = step.grid[0].length;

  container.innerHTML = '<div class="mo-grid-box" style="width:100%; display:flex; justify-content:center;"></div><div class="mo-deque-box" style="width:100%;"></div>';
  const gridBox = container.querySelector('.mo-grid-box') as HTMLElement;
  const dequeBox = container.querySelector('.mo-deque-box') as HTMLElement;

  BinaryGridCanvasAdapter.renderGridCanvas(gridBox, {
    rows: m,
    cols: n,
    cellSize: '56px',
    gap: '8px',
    maxWidth: '380px',
    getCell: (r, c) => {
      const isCur = step.curCoord && step.curCoord[0] === r && step.curCoord[1] === c;
      const d = step.distMap[r][c];
      const isObs = step.grid[r][c] === 1;

      let bg = '#ffffff';
      let color = '#334155';
      let border = '1.5px solid #cbd5e1';
      let text = `${isObs ? '🧱' : '⬜'} ${d === Infinity ? '∞' : d}`;
      let boxShadow = 'none';
      let transform = 'none';

      if (isObs) {
        bg = '#fee2e2';
        color = '#b91c1c';
        border = '1.5px solid #fca5a5';
      } else if (step.visited[r][c]) {
        bg = '#ecfdf5';
        color = '#047857';
        border = '1.5px solid #a7f3d0';
      }

      if (isCur) {
        transform = 'scale(1.08)';
        boxShadow = '0 0 0 3px #f59e0b';
        border = '2px solid #d97706';
      }

      return {
        text,
        bg,
        color,
        border,
        boxShadow,
        transform,
        zIndex: isCur ? 10 : 1,
        fontSize: '12px',
        fontWeight: '800',
      };
    },
  });

  const dequeItems = step.dequeSnapshot.map((x) => ({
    label: `(${x.r},${x.c})`,
    tag: `d:${x.dist}`,
    isFront: x.dist === (step.dequeSnapshot[0]?.dist ?? 0),
  }));

  dequeBox.innerHTML = renderDequeVisualization(dequeItems, '0-1 BFS 双端队列 (Deque)');
}

export const minimumObstacles062Visualizer = registerDeclarativeAlgorithm<MinimumObstaclesStep>({
  id: 'minimum-obstacles-062',
  aliases: ['minimum-obstacles', 'obstacle-removal-2290', 'bfs-01-deque', 'class062-code03'],
  name: '0-1 BFS 到达角落移除障碍物 (Class 062)',
  category: 'graph',
  hasDeductionTree: true,
  icon: '🧱',
  difficulty: 3,
  levelOrder: 6203,
  learningGoal: '深刻理解 0-1 BFS 双端队列如何通过 0权插队头/1权插队尾 天然保持单调性并规避 Dijkstra 堆排开销',
  problemHtml: GRAPH_062_PROBLEMS.minimumObstacles062.html,
  codeLanguages: MINIMUM_OBSTACLES_062_CODES,
  inputs: [
    {
      id: 'preset',
      label: '网格障碍地形',
      type: 'select',
      defaultValue: 'classic_3x3',
      options: [
        { label: '3x3 经典全通 (绕道0障碍可达)', value: 'classic_3x3' },
        { label: '3x3 纵向直立障碍墙 (必破1障碍)', value: 'straight_wall' },
        { label: '3x3 终点障碍围栏 (必破1障碍)', value: 'corner_blocked' },
      ],
    },
  ],
  presets: [
    { label: '3x3 经典可绕用例 (0障碍)', values: { preset: 'classic_3x3' } },
    { label: '3x3 必穿障碍墙用例 (1障碍)', values: { preset: 'straight_wall' } },
    { label: '3x3 终点被围用例 (1障碍)', values: { preset: 'corner_blocked' } },
  ],
  generateSteps: (inputs) => buildMinimumObstacles062Steps(inputs?.preset),
  renderCanvas: (container, step) => renderMinimumObstaclesCanvas(container, step),
});
