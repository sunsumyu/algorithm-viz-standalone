/**
 * 左程云算法通关课 Class 064: 最小体力消耗路径 (Path With Minimum Effort · LeetCode 1631)
 * 领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_064_PROBLEMS } from './graph-064-problem-content';
import { PATH_MIN_EFFORT_064_CODES } from './graph-064-stage-codes';
import {
  renderGraph064GridSandbox,
  renderGraph064PriorityQueue,
} from './graph-064-shared';
import {
  PathMinEffortStep,
  buildPathMinEffort064Steps,
} from './path-min-effort-064-step-compiler';

export type { PathMinEffortStep };
export { buildPathMinEffort064Steps };

export const pathMinEffort064Visualizer = registerDeclarativeAlgorithm<PathMinEffortStep>({
  id: 'path-min-effort-064',
  aliases: ['path-min-effort', 'class064-code02', 'leetcode-1631'],
  name: '最小体力消耗路径与瓶颈最短路 (Class 064)',
  category: 'graph',
  icon: '🧗',
  difficulty: 3,
  levelOrder: 6402,
  learningGoal: '深刻理解瓶颈最短路模型转化、网格图 Dijkstra 堆优化松弛与 MiniMax 问题求解',
  problemHtml: GRAPH_064_PROBLEMS.pathMinEffort064.html,
  codeLanguages: PATH_MIN_EFFORT_064_CODES,
  inputs: [
    {
      id: 'preset',
      label: '地形用例选择',
      type: 'select',
      defaultValue: 'classic_mountain_3x3',
      options: [
        { label: '3x3 经典山脉地图 (右侧绕行, 体力=2)', value: 'classic_mountain_3x3' },
        { label: '3x3 险峻山谷地图 (体力=1)', value: 'valley_3x3' },
        { label: '2x2 平坦地形特判 (体力=0)', value: 'flat_2x2' },
      ],
    },
  ],
  presets: [
    { label: '3x3 经典山脉 (LeetCode 1631)', values: { preset: 'classic_mountain_3x3' } },
    { label: '3x3 险峻山谷', values: { preset: 'valley_3x3' } },
    { label: '2x2 平坦地形', values: { preset: 'flat_2x2' } },
  ],
  generateSteps: (inputs) => buildPathMinEffort064Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    const pqItems = step.pqSnapshot.map((x) => ({
      label: `(${x.r},${x.c})`,
      priority: `落差${x.effort}`,
      highlight: Boolean(step.curCoord && step.curCoord[0] === x.r && step.curCoord[1] === x.c),
    }));

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; gap: 8px;">
        ${renderGraph064GridSandbox(step.grid, step.curCoord, step.visited, {
          distGrid: step.distGrid,
          pathNodes: step.pathNodes,
        })}
        <div style="width: 100%; max-width: 480px;">
          ${renderGraph064PriorityQueue(pqItems, '小根堆波前 (按落差排序)')}
        </div>
      </div>
    `;
  },
});
