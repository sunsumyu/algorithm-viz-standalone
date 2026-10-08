/**
 * 左程云算法通关课 Class 061: 堆优化 Dijkstra 算法 (Dijkstra Heap · O(E log V))
 * 领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_061_PROBLEMS } from './graph-061-problem-content';
import { DIJKSTRA_HEAP_061_CODES } from './graph-061-stage-codes';
import {
  renderGraph061SvgTopology,
  renderGraph061DistGrid,
  renderGraph061PriorityQueue,
} from './graph-061-shared';
import {
  DijkstraHeapStep,
  buildDijkstraHeap061Steps,
} from './dijkstra-heap-061-step-compiler';

export type { DijkstraHeapStep };
export { buildDijkstraHeap061Steps };

export const dijkstraHeap061Visualizer = registerDeclarativeAlgorithm<DijkstraHeapStep>({
  id: 'dijkstra-heap-061',
  aliases: ['dijkstra-heap', 'class061-code02', 'dijkstra-priority-queue'],
  name: 'Dijkstra 堆优化最短路算法 (Class 061)',
  category: 'graph',
  icon: '⛰️',
  difficulty: 2,
  levelOrder: 6102,
  learningGoal: '掌握优先队列小根堆维护波前、惰性删除策略与稀疏图高效求解',
  problemHtml: GRAPH_061_PROBLEMS.dijkstraHeap061.html,
  codeLanguages: DIJKSTRA_HEAP_061_CODES,
  inputs: [
    {
      id: 'preset',
      label: '拓扑预设选择',
      type: 'select',
      defaultValue: 'sparse_5nodes',
      options: [
        { label: '5 节点稀疏拓扑图 (典型稀疏网)', value: 'sparse_5nodes' },
        { label: '6 节点双分支网络 (双通道寻优)', value: 'branch_6nodes' },
      ],
    },
  ],
  presets: [
    { label: '5 节点稀疏图', values: { preset: 'sparse_5nodes' } },
    { label: '6 节点双分支图', values: { preset: 'branch_6nodes' } },
  ],
  generateSteps: (inputs) => buildDijkstraHeap061Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    const pqItems = step.pqSnapshot.map((x) => ({
      label: `Node ${x.u}`,
      priority: `${x.d}`,
      highlight: step.curNode === x.u,
    }));

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; gap: 10px;">
        ${renderGraph061SvgTopology(step.nodes, step.edges, {
          currentNode: step.curNode,
          visitedNodes: step.visited,
          activeEdge: step.activeEdge,
          distMap: step.dist,
        })}
        <div style="display: flex; gap: 10px; width: 100%; max-width: 520px; flex-wrap: wrap; justify-content: center;">
          ${renderGraph061DistGrid(step.dist, step.visited, step.curNode, '全网节点距离表 dist[]')}
          <div style="width: 100%;">
            ${renderGraph061PriorityQueue(pqItems, '小根堆优先队列波前')}
          </div>
        </div>
      </div>
    `;
  },
});
