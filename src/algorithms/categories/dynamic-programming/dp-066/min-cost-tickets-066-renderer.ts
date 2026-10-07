/**
 * 左程云算法通关课 Class 066: 最低票价 (Minimum Cost For Tickets · LeetCode 983)
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_066_PROBLEMS } from './dp-066-problem-content';
import { MIN_COST_TICKETS_066_CODES } from './dp-066-stage-codes';
import {
  type MinCostTicketsStep,
  parseMinCostTicketsInputs,
  buildMinCostTickets066Steps,
} from '../../../../core/renderers/adapters/min-cost-tickets-step-compiler';
import {
  renderTravelJumpSandbox,
  renderMinCostTicketsStage3Metrics,
  createMinCostTicketsStages,
} from '../../../../core/renderers/adapters/min-cost-tickets-canvas-adapter';

// 向后兼容导出
export {
  type MinCostTicketsStep,
  parseMinCostTicketsInputs,
  buildMinCostTickets066Steps,
  renderTravelJumpSandbox,
};

registerDeclarativeAlgorithm<any>({
  id: 'min-cost-tickets-066',
  name: '最低票价 (一维DP跳跃)',
  category: 'dynamic-programming',
  difficulty: '中等',
  description: '左程云 Class 066 Code02：旅行日逆向一维动态规划，1/7/30天通行证跨度跳跃自底向上递推 (LeetCode 983)',
  aliases: ['class066-code02', 'min-cost-tickets-983', 'leetcode-983', 'min-cost-tickets-class066'],
  problemHtml: DP_066_PROBLEMS['min-cost-tickets-066'].problemHtml,
  analysisHtml: DP_066_PROBLEMS['min-cost-tickets-066'].complexityHtml,
  codeLanguages: MIN_COST_TICKETS_066_CODES,
  inputs: [
    {
      id: 'days',
      label: '旅行日 (逗号分隔)',
      type: 'text',
      defaultValue: '1, 4, 6, 7, 8, 20',
    },
    {
      id: 'costs',
      label: '通行证费用 (1天, 7天, 30天)',
      type: 'text',
      defaultValue: '2, 7, 15',
    },
  ],
  presets: [
    { label: '标准用例 (6个旅行日)', values: { days: '1, 4, 6, 7, 8, 20', costs: '2, 7, 15', preset: 'standard' } },
    { label: '密集连号用例 (12个旅行日)', values: { days: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 30, 31', costs: '2, 7, 15', preset: 'dense_days' } },
    { label: '稀疏跨月用例 (6个跨月旅行日)', values: { days: '1, 10, 20, 30, 40, 50', costs: '3, 10, 25', preset: 'sparse_days' } },
  ],
  card1Title: '🚀 旅行日跳跃跨度与分支决策沙盘',
  card2Title: '📐 一维动态规划状态表 dp[i]',
  defaultStage: 'stage-3',
  stages: createMinCostTicketsStages(),
  generateSteps: (inputs: Record<string, any>) => {
    const { days, costs } = parseMinCostTicketsInputs(inputs);
    return buildMinCostTickets066Steps(days, costs);
  },
  renderCanvas: (container: HTMLElement, step: MinCostTicketsStep) => {
    container.innerHTML = renderTravelJumpSandbox(step);
  },
  renderCustomMetrics: (container: HTMLElement, step: MinCostTicketsStep) => {
    renderMinCostTicketsStage3Metrics(container, step);
  },
});
