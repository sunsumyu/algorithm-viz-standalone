/**
 * 左程云算法通关课 Class 062: 使网格图至少有一条有效路径的最小代价 (LeetCode 1368)
 * 0-1 BFS 边权判定 — 声明式 Thin Domain Adapter (LOC < 140)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_062_PROBLEMS } from './graph-062-problem-content';
import { MINIMUM_COST_VALID_PATH_062_CODES } from './graph-062-stage-codes';
import { renderDequeVisualization } from './graph-062-shared';
import { BinaryGridCanvasAdapter } from '../../../../core/renderers/adapters/binary-grid-canvas-adapter';
import {
  buildMinimumCostValidPath062Steps,
  ARROW_SYMBOLS,
  type ValidPathStep,
} from './minimum-cost-valid-path-062-step-compiler';

export { buildMinimumCostValidPath062Steps, type ValidPathStep };

export function renderValidPathCanvas(container: HTMLElement, step: ValidPathStep): void {
  const m = step.grid.length;
  const n = step.grid[0].length;

  container.innerHTML = '<div class="vp-grid-box" style="width:100%; display:flex; justify-content:center;"></div><div class="vp-deque-box" style="width:100%;"></div>';
  const gridBox = container.querySelector('.vp-grid-box') as HTMLElement;
  const dequeBox = container.querySelector('.vp-deque-box') as HTMLElement;

  BinaryGridCanvasAdapter.renderGridCanvas(gridBox, {
    rows: m,
    cols: n,
    cellSize: '56px',
    gap: '8px',
    maxWidth: '380px',
    getCell: (r, c) => {
      const isCur = step.curCoord && step.curCoord[0] === r && step.curCoord[1] === c;
      const arrow = ARROW_SYMBOLS[step.grid[r][c]];
      const d = step.distMap[r][c];
      const dStr = d === Infinity ? '—' : `${d}`;

      let bg = '#ffffff';
      let color = '#334155';
      let border = '1.5px solid #cbd5e1';
      let boxShadow = 'none';
      let transform = 'none';

      if (step.visited[r][c]) {
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
        text: `${arrow} (${dStr})`,
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
    tag: `代价:${x.dist}`,
    isFront: x.dist === (step.dequeSnapshot[0]?.dist ?? 0),
  }));

  dequeBox.innerHTML = renderDequeVisualization(dequeItems, '0-1 BFS 双端队列 (箭头修改代价流)');
}

export const minimumCostValidPath062Visualizer = registerDeclarativeAlgorithm<ValidPathStep>({
  id: 'minimum-cost-valid-path-062',
  aliases: ['minimum-cost-valid-path', 'valid-path-1368', 'leetcode-1368'],
  name: '有效路径最小代价与0-1广搜 (Class 062)',
  category: 'graph',
  icon: '🧭',
  difficulty: 3,
  levelOrder: 6204,
  learningGoal: '掌握网格箭头图到 0-1 BFS 边权的数学归约：顺向边权 0、改向边权 1，线性求解全局最小修改代价',
  problemHtml: GRAPH_062_PROBLEMS.minimumCostValidPath062.html,
  codeLanguages: MINIMUM_COST_VALID_PATH_062_CODES,
  inputs: [
    {
      id: 'preset',
      label: '网格箭头用例',
      type: 'select',
      defaultValue: 'classic_3x3',
      options: [
        { label: '3x3 经典用例 (需改 1 次箭头)', value: 'classic_3x3' },
        { label: '3x3 天然直通 (需改 0 次箭头)', value: 'zero_cost' },
      ],
    },
  ],
  presets: [
    { label: '经典需改 1 处箭头用例', values: { preset: 'classic_3x3' } },
    { label: '天然直通 0 代价用例', values: { preset: 'zero_cost' } },
  ],
  generateSteps: (inputs) => buildMinimumCostValidPath062Steps(inputs?.preset),
  renderCanvas: (container, step) => renderValidPathCanvas(container, step),
});
