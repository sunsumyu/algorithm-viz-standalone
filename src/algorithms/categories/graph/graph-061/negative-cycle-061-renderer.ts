/**
 * 左程云算法通关课 Class 061: 负权环判定算法 (洛谷 P3385 · SPFA 计数法)
 * 领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_061_PROBLEMS } from './graph-061-problem-content';
import { NEGATIVE_CYCLE_061_CODES } from './graph-061-stage-codes';
import {
  renderGraph061SvgTopology,
  renderNegativeCycleGrid,
} from './graph-061-shared';
import {
  NegativeCycleStep,
  buildNegativeCycle061Steps,
} from './negative-cycle-061-step-compiler';

export type { NegativeCycleStep };
export { buildNegativeCycle061Steps };

export const negativeCycle061Visualizer = registerDeclarativeAlgorithm<NegativeCycleStep>({
  id: 'negative-cycle-061',
  aliases: ['negative-cycle', 'class061-code06', 'spfa-negative-cycle'],
  name: '负权环判定算法 (Class 061)',
  category: 'graph',
  icon: '🔁',
  difficulty: 3,
  levelOrder: 6106,
  learningGoal: '掌握超级源点入队机制、最短路径抽屉原理与 count[v] >= n 负环判定准则',
  problemHtml: GRAPH_061_PROBLEMS.negativeCycle061.html,
  codeLanguages: NEGATIVE_CYCLE_061_CODES,
  inputs: [
    {
      id: 'preset',
      label: '图拓扑预设',
      type: 'select',
      defaultValue: 'has_cycle',
      options: [
        { label: '含负权回路图 (1➔2➔3➔1 权重为 -3)', value: 'has_cycle' },
        { label: '安全无负环图 (回路权重和为正数 +4)', value: 'no_cycle' },
      ],
    },
  ],
  presets: [
    { label: '含负权环图', values: { preset: 'has_cycle' } },
    { label: '无负环安全图', values: { preset: 'no_cycle' } },
  ],
  generateSteps: (inputs) => buildNegativeCycle061Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; gap: 12px;">
        ${renderGraph061SvgTopology(step.nodes, step.edges, {
          currentNode: step.curNode,
          activeEdge: step.activeEdge,
          distMap: step.dist,
        })}
        ${renderNegativeCycleGrid(step.dist, step.count, step.nodes.length, step.inQueue, step.curNode)}
      </div>
    `;
  },
});
