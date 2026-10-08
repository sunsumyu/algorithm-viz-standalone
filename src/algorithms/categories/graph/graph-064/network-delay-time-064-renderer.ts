/**
 * 左程云算法通关课 Class 064: 网络延迟时间 (Network Delay Time · LeetCode 743)
 * 领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_064_PROBLEMS } from './graph-064-problem-content';
import { NETWORK_DELAY_064_CODES } from './graph-064-stage-codes';
import {
  renderGraph064NodeStatusMatrix,
  renderGraph064PriorityQueue,
} from './graph-064-shared';
import {
  NetworkDelayStep,
  buildNetworkDelay064Steps,
} from './network-delay-time-064-step-compiler';

export type { NetworkDelayStep };
export { buildNetworkDelay064Steps };

export const networkDelayTime064Visualizer = registerDeclarativeAlgorithm<NetworkDelayStep>({
  id: 'network-delay-time-064',
  aliases: ['network-delay-time', 'class064-code01', 'leetcode-743'],
  name: '网络延迟时间与堆优化最短路 (Class 064)',
  category: 'graph',
  icon: '📡',
  difficulty: 2,
  levelOrder: 6401,
  learningGoal: '掌握经典堆优化 Dijkstra 模板实现、单源最短路波前广播与不可达全网检测',
  problemHtml: GRAPH_064_PROBLEMS.networkDelayTime064.html,
  codeLanguages: NETWORK_DELAY_064_CODES,
  inputs: [
    {
      id: 'preset',
      label: '拓扑预设选择',
      type: 'select',
      defaultValue: 'classic_4nodes',
      options: [
        { label: '4 节点经典拓扑 (源点 2, 覆盖时间=2ms)', value: 'classic_4nodes' },
        { label: '3 节点链状广播 (源点 1, 覆盖时间=7ms)', value: 'line_chain' },
        { label: '存在孤立不可达节点 (返回 -1)', value: 'disconnected_nodes' },
      ],
    },
  ],
  presets: [
    { label: '4 节点经典拓扑 (LeetCode 743)', values: { preset: 'classic_4nodes' } },
    { label: '3 节点链状拓扑', values: { preset: 'line_chain' } },
    { label: '不可达节点特判 (-1)', values: { preset: 'disconnected_nodes' } },
  ],
  generateSteps: (inputs) => buildNetworkDelay064Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    const nodeItems = [];
    for (let i = 1; i <= step.n; i++) {
      nodeItems.push({
        id: i,
        label: `Node ${i}${i === step.k ? ' (源)' : ''}`,
        dist: step.distList[i],
        visited: step.visitedList[i],
        isCurrent: step.curNode === i,
      });
    }

    const pqItems = step.pqSnapshot.map((x) => ({
      label: `Node ${x.u}`,
      priority: `${x.d}ms`,
      highlight: step.curNode === x.u,
    }));

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 16px; gap: 12px;">
        ${renderGraph064NodeStatusMatrix(nodeItems, '全网节点延迟状态表')}
        <div style="width: 100%; max-width: 520px;">
          ${renderGraph064PriorityQueue(pqItems, '小根堆优先队列波前')}
        </div>
      </div>
    `;
  },
});
