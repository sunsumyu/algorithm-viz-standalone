/**
 * 左程云算法通关课 Class 060: 最大食物链计数 (洛谷 P4017 · DAG 路径动态规划)
 * 统计从入度为 0 的生产者到出度为 0 的消费者的全局食物链总数，模 80112002
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth & Bi-Version Synthesis)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_060_PROBLEMS } from './graph-060-problem-content';
import { FOOD_CHAIN_060_CODES } from './graph-060-stage-codes';
import {
  renderGraph060SvgTopology,
  renderGraph060InDegreeGrid,
  renderGraph060QueuePills,
} from './graph-060-shared';
import {
  type FoodChainStep,
  buildFoodChain060Steps,
} from './food-chain-060-step-compiler';

export { buildFoodChain060Steps, type FoodChainStep };

export const foodChain060Visualizer = registerDeclarativeAlgorithm<FoodChainStep>({
  id: 'food-chain-060',
  aliases: ['food-chain', 'luogu-p4017', 'class060-code01'],
  name: '最大食物链计数 (洛谷 P4017) (Class 060)',
  category: 'graph',
  icon: '🌱',
  difficulty: 2,
  levelOrder: 6001,
  learningGoal: '掌握 DAG 拓扑排序消除后效性机理、路径条数累加转移方程与出度为 0 终端结算',
  problemHtml: GRAPH_060_PROBLEMS.foodChain060.html,
  codeLanguages: FOOD_CHAIN_060_CODES,
  inputs: [
    {
      id: 'preset',
      label: '生态网拓扑选择',
      type: 'select',
      defaultValue: 'classic_ecosystem',
      options: [
        { label: '5 生物经典陆地生态网 (水稻/田鼠/蝗虫/蛇/老鹰)', value: 'classic_ecosystem' },
        { label: '5 生物双生产者水生网 (浮游植物/水草/大鱼)', value: 'multi_producer' },
      ],
    },
  ],
  presets: [
    { label: '陆地生态网', values: { preset: 'classic_ecosystem' } },
    { label: '水生生态网', values: { preset: 'multi_producer' } },
  ],
  generateSteps: (inputs) => buildFoodChain060Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; gap: 10px;">
        <div style="display: flex; gap: 16px; align-items: center; font-size: 11px; color: #475569; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 14px; border-radius: 6px;">
          <span>当前完整食物链总数: <strong style="color: #10b981; font-size: 13px;">${step.total}</strong></span>
          <span>待拓展队列: <strong>${step.queue.length}</strong></span>
        </div>
        ${renderGraph060SvgTopology(step.nodes, step.edges, {
          currentNode: step.curNode,
          inQueueNodes: step.queue,
          processedNodes: step.processed,
          activeEdge: step.activeEdge,
          nodeValues: step.lines,
          valueLabel: '链数',
        })}
        <div style="display: flex; gap: 10px; width: 100%; max-width: 500px; flex-direction: column;">
          ${renderGraph060InDegreeGrid(step.inDegree.slice(1), step.curNode !== null ? step.curNode - 1 : null, undefined, '生物入度表 inDegree (归零即解除依赖)')}
          ${renderGraph060QueuePills(step.queue, '入度为 0 待处理队列')}
        </div>
      </div>
    `;
  },
});
