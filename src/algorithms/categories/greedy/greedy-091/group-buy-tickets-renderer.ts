/**
 * 组团买票 (Group Buy Tickets) - 声明式教学级沙盘渲染器
 * 核心贪心：大顶堆维护边际增益 Delta = B - K * (2x + 1)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { GREEDY_091_PROBLEMS } from './greedy-091-problem-content';
import { GROUP_BUY_TICKETS_CODES } from './greedy-091-stage-codes';
import {
  type GameDeltaItem,
  type GroupBuyTicketsStep,
  buildGroupBuyTicketsSteps,
} from './group-buy-tickets-step-compiler';
import { renderGroupBuyTicketsCanvas } from './group-buy-tickets-canvas-adapter';

export type { GameDeltaItem, GroupBuyTicketsStep };
export { buildGroupBuyTicketsSteps, renderGroupBuyTicketsCanvas };

const { template } = createDeclarativeVisualizer<GroupBuyTicketsStep>({
  id: 'group-buy-tickets',
  name: '组团买票 (Group Buy Tickets)',
  category: 'greedy',
  icon: '🎟️',
  difficulty: 3,
  levelOrder: 913,
  learningGoal: '掌握大顶堆维护边际增益 Delta = B - K*(2x+1) 的离散极值贪心分配机制',
  problemHtml: GREEDY_091_PROBLEMS.groupBuyTickets.html,
  analysisHtml: GREEDY_091_PROBLEMS.groupBuyTickets.html,
  inputs: [
    {
      id: 'input-n',
      label: '总员工人数 n',
      type: 'text',
      defaultValue: '8',
      placeholder: '如 8',
    },
    {
      id: 'input-games',
      label: '项目参数列表 [Ki, Bi]',
      type: 'text',
      defaultValue: '2,10; 1,15; 3,20',
      placeholder: '2,10; 1,15; 3,20',
    },
  ],
  codeLanguages: GROUP_BUY_TICKETS_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(1, parseInt(String(inputs?.['input-n'] || '8'), 10) || 1);
    const rawGames = String(inputs?.['input-games'] || '2,10; 1,15; 3,20');
    const games = rawGames.split(';').map(g => {
      const parts = g.trim().split(/[,，\s]+/).map(s => parseInt(s.trim(), 10));
      return [parts[0] || 0, parts[1] || 0] as [number, number];
    }).filter(([k, b]) => k > 0 || b > 0);
    return buildGroupBuyTicketsSteps(n, games);
  },
  renderCanvas: renderGroupBuyTicketsCanvas,
});

export const groupBuyTicketsVisualizer = UniversalStageVisualizer;
export const groupBuyTicketsRenderer = UniversalStageVisualizer;

registerAlgorithm({
  id: 'group-buy-tickets',
  name: '组团买票 (Group Buy Tickets)',
  viewId: 'algo-group-buy-tickets-view',
  category: 'greedy',
  icon: '🎟️',
  difficulty: 3,
  levelOrder: 913,
  description: '每个项目购票费用为 Bx - Kx^2，利用二阶导小于 0 的凹函数性质，通过大根堆维护边际增益进行贪心调度。',
  learningGoal: '掌握大顶堆维护边际增益 Delta = B - K*(2x+1) 的离散极值贪心分配机制',
  aliases: ['class091-code03', 'meituan-group-buy-tickets', 'group-buy-tickets-meituan'],
  template,
  Visualizer: UniversalStageVisualizer,
});
