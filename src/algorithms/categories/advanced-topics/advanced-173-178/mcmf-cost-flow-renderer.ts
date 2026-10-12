/**
 * Class 174: 最小费用最大流 MCMF (Minimum Cost Maximum Flow)
 * SPFA 寻找费用最短路增广 / 洛谷 P3381 【模板】最小费用最大流
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_173_178_PROBLEMS } from './advanced-173-178-problem-content';
import { MCMF_COST_FLOW_CODES } from './advanced-173-178-stage-codes';
import { buildMCMFSteps, MCMFStep } from '../../../../core/renderers/adapters/mcmf-cost-flow-174-step-compiler';
import { renderMCMFCanvas } from '../../../../core/renderers/adapters/mcmf-cost-flow-174-canvas-adapter';

export { buildMCMFSteps, type MCMFStep };

export const mcmfCostFlowVisualizer = registerDeclarativeAlgorithm<MCMFStep>({
  id: 'mcmf-cost-flow-174',
  name: '最小费用最大流 MCMF (Class 174)',
  aliases: ['class174-code01', 'mcmf-cost-flow-174', 'mcmf'],
  category: 'graph',
  icon: '💰',
  difficulty: 3,
  levelOrder: 174,
  description: '左程云算法通关课 Class 174：最小费用最大流 (MCMF)。基于 SPFA/Dijkstra 沿费用最短路多轮增广，反向边取负费用反悔，求解全局最优费用流。',
  learningGoal: '掌握费用最短路增广机制与反向边负权反悔模型，深刻理解费用流在二分图带权匹配与运输问题中的建模',
  problemHtml: ADVANCED_173_178_PROBLEMS.mcmfCostFlow.html,
  analysisHtml: ADVANCED_173_178_PROBLEMS.mcmfCostFlow.html,
  inputs: [
    {
      id: 'preset',
      label: '费用流网络拓扑',
      type: 'select',
      defaultValue: 'standard_cost_network',
      options: [
        { label: '标准 4 节点费用流 (S=1, T=4, 最大流: 3, 最小费用: 10)', value: 'standard_cost_network' },
      ],
    },
  ],
  codeLanguages: MCMF_COST_FLOW_CODES,
  generateSteps: () => buildMCMFSteps(),
  renderCanvas: (container, step) => renderMCMFCanvas(container, step),
});
