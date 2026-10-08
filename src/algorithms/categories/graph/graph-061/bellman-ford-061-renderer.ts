/**
 * 左程云算法通关课 Class 061: Bellman-Ford 最短路算法 (V-1 轮全边松弛)
 * 领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_061_PROBLEMS } from './graph-061-problem-content';
import { BELLMAN_FORD_061_CODES } from './graph-061-stage-codes';
import { renderGraph061SvgTopology, renderGraph061DistGrid } from './graph-061-shared';
import {
  BellmanFordStep,
  buildBellmanFord061Steps,
} from './bellman-ford-061-step-compiler';

export type { BellmanFordStep };
export { buildBellmanFord061Steps };

export const bellmanFord061Visualizer = registerDeclarativeAlgorithm<BellmanFordStep>({
  id: 'bellman-ford-061',
  aliases: ['bellman-ford', 'class061-code03'],
  name: 'Bellman-Ford 最短路算法 (Class 061)',
  category: 'graph',
  icon: '⚡',
  difficulty: 2,
  levelOrder: 6103,
  learningGoal: '掌握负权边处理能力、V-1 轮全边暴力松弛与提前收敛早停优化机制',
  problemHtml: GRAPH_061_PROBLEMS.bellmanFord061.html,
  codeLanguages: BELLMAN_FORD_061_CODES,
  inputs: [
    {
      id: 'preset',
      label: '拓扑预设选择',
      type: 'select',
      defaultValue: 'negative_weight',
      options: [
        { label: '含负权边经典图 (5 节点 · 负权松弛)', value: 'negative_weight' },
        { label: '正权标准图 (4 节点 · 快速早停)', value: 'positive_simple' },
      ],
    },
  ],
  presets: [
    { label: '含负权边图', values: { preset: 'negative_weight' } },
    { label: '正权标准图', values: { preset: 'positive_simple' } },
  ],
  generateSteps: (inputs) => buildBellmanFord061Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; gap: 12px;">
        ${renderGraph061SvgTopology(step.nodes, step.edges, {
          activeEdge: step.activeEdge,
          distMap: step.dist,
        })}
        ${renderGraph061DistGrid(step.dist, undefined, null, `第 ${step.round}/${step.maxRounds} 轮距离表 dist[]`)}
      </div>
    `;
  },
});
