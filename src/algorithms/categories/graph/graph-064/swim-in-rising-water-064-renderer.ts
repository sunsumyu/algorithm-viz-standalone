/**
 * 左程云算法通关课 Class 064: 水位上升的泳池中游泳 (Swim In Rising Water · LeetCode 778)
 * 领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_064_PROBLEMS } from './graph-064-problem-content';
import { SWIM_IN_WATER_064_CODES } from './graph-064-stage-codes';
import {
  renderGraph064GridSandbox,
  renderGraph064PriorityQueue,
} from './graph-064-shared';
import {
  SwimStep,
  buildSwimInRisingWater064Steps,
} from './swim-in-rising-water-064-step-compiler';

export type { SwimStep };
export { buildSwimInRisingWater064Steps };

export const swimInRisingWater064Visualizer = registerDeclarativeAlgorithm<SwimStep>({
  id: 'swim-in-rising-water-064',
  aliases: ['swim-in-rising-water', 'class064-code03', 'leetcode-778'],
  name: '水位上升的泳池中游泳与定向淹没 (Class 064)',
  category: 'graph',
  icon: '🏊',
  difficulty: 3,
  levelOrder: 6403,
  learningGoal: '掌握优先队列定向淹没与最短路模拟、理解无后效性瓶颈状态转移',
  problemHtml: GRAPH_064_PROBLEMS.swimInRisingWater064.html,
  codeLanguages: SWIM_IN_WATER_064_CODES,
  inputs: [
    {
      id: 'gridType',
      label: '泳池地形预设',
      type: 'select',
      defaultValue: 'leetcode5',
      options: [
        { label: '5x5 LeetCode 经典水池 (最少用时=20)', value: 'leetcode5' },
        { label: '3x3 递增水阶 (最少用时=8)', value: 'simple3' },
        { label: '4x4 断崖水池 (最少用时=6)', value: 'cliff4' },
      ],
    },
  ],
  presets: [
    { label: '5x5 官方经典泳池 (LeetCode 778)', values: { gridType: 'leetcode5' } },
    { label: '3x3 简单阶梯', values: { gridType: 'simple3' } },
    { label: '4x4 断崖迷宫', values: { gridType: 'cliff4' } },
  ],
  generateSteps: (inputs) => buildSwimInRisingWater064Steps(inputs?.gridType),
  renderCanvas: (container, step) => {
    const pqItems = step.pqSnapshot.map((x) => ({
      label: `(${x.r},${x.c})`,
      priority: `水深${x.t}`,
      highlight: Boolean(step.curCoord && step.curCoord[0] === x.r && step.curCoord[1] === x.c),
    }));

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; gap: 8px;">
        ${renderGraph064GridSandbox(step.grid, step.curCoord, step.visitedGrid, {
          distGrid: step.distGrid,
          pathNodes: step.bestPath,
          customBg: (r, c) => {
            const isCur = step.curCoord && step.curCoord[0] === r && step.curCoord[1] === c;
            if (isCur) return '#fef3c7';
            const isPath = step.bestPath?.some(([pr, pc]) => pr === r && pc === c);
            if (isPath) return '#a7f3d0';
            if (step.visitedGrid[r][c]) return '#bae6fd';
            return '#ffffff';
          },
        })}
        <div style="width: 100%; max-width: 480px;">
          ${renderGraph064PriorityQueue(pqItems, '小根堆水位波前 (按最低水位优先)')}
        </div>
      </div>
    `;
  },
});
