/**
 * 左程云算法通关课 Class 061: 朴素 Dijkstra 算法 (Dijkstra Naive · O(V²))
 * 领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_061_PROBLEMS } from './graph-061-problem-content';
import { DIJKSTRA_BASIC_061_CODES } from './graph-061-stage-codes';
import { renderGraph061SvgTopology, renderGraph061DistGrid } from './graph-061-shared';
import {
  DijkstraBasicStep,
  buildDijkstraBasic061Steps,
} from './dijkstra-basic-061-step-compiler';

export type { DijkstraBasicStep };
export { buildDijkstraBasic061Steps };

export const dijkstraBasic061Visualizer = registerDeclarativeAlgorithm<DijkstraBasicStep>({
  id: 'dijkstra-basic-061',
  aliases: ['dijkstra-basic', 'class061-code01', 'dijkstra-naive'],
  name: 'Dijkstra 朴素最短路算法 (Class 061)',
  category: 'graph',
  icon: '📍',
  difficulty: 2,
  levelOrder: 6101,
  learningGoal: '掌握贪心选点、最短路锁定准则以及边松弛操作的核心本质与 O(V²) 稠密图优势',
  problemHtml: GRAPH_061_PROBLEMS.dijkstraBasic061.html,
  codeLanguages: DIJKSTRA_BASIC_061_CODES,
  inputs: [
    {
      id: 'preset',
      label: '拓扑预设选择',
      type: 'select',
      defaultValue: 'default_5nodes',
      options: [
        { label: '5 节点经典拓扑图 (带交叉连通)', value: 'default_5nodes' },
        { label: '4 节点稠密测试图 (多路径松弛)', value: 'dense_4nodes' },
      ],
    },
  ],
  presets: [
    { label: '5 节点经典图', values: { preset: 'default_5nodes' } },
    { label: '4 节点稠密图', values: { preset: 'dense_4nodes' } },
  ],
  generateSteps: (inputs) => buildDijkstraBasic061Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; gap: 12px;">
        ${renderGraph061SvgTopology(step.nodes, step.edges, {
          currentNode: step.curNode,
          visitedNodes: step.visited,
          activeEdge: step.activeEdge,
          distMap: step.dist,
        })}
        ${renderGraph061DistGrid(step.dist, step.visited, step.curNode, '全网节点距离表 dist[]')}
      </div>
    `;
  },
});
