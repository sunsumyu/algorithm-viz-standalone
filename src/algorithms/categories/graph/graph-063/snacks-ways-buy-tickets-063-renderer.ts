/**
 * 左程云算法通关课 Class 063: 牛牛的背包问题 / 世界冰球锦标赛 (洛谷 P4799 · Snacks Ways / Buy Tickets)
 * 领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_063_PROBLEMS } from './graph-063-problem-content';
import { SNACKS_WAYS_063_CODES } from './graph-063-stage-codes';
import { renderMeetInTheMiddleArrayView } from './graph-063-shared';
import {
  SnacksWaysStep,
  buildSnacksWays063Steps,
} from './snacks-ways-buy-tickets-063-step-compiler';

export type { SnacksWaysStep };
export { buildSnacksWays063Steps };

export const snacksWaysBuyTickets063Visualizer = registerDeclarativeAlgorithm<SnacksWaysStep>({
  id: 'snacks-ways-buy-tickets-063',
  name: '牛牛的背包问题 (折半搜索)',
  category: 'graph',
  difficulty: '中等',
  description: '左程云 Class 063 Code02：超大背包容量折半搜索 Meet in the Middle，两路生成 + 二分累计 (洛谷 P4799)',
  aliases: ['class063-code02', 'snacks-ways-buy-tickets-063', 'snacks-ways-063', 'luogu-p4799', 'meet-in-the-middle-backpack'],
  problemHtml: GRAPH_063_PROBLEMS['snacks-ways-buy-tickets-063'].problemHtml,
  analysisHtml: GRAPH_063_PROBLEMS['snacks-ways-buy-tickets-063'].complexityHtml,
  codeLanguages: SNACKS_WAYS_063_CODES,
  inputs: [
    {
      id: 'preset',
      label: '用例选择',
      type: 'select',
      defaultValue: 'standard_3_snacks',
      options: [
        { label: '标准用例 (3袋零食, 容量10)', value: 'standard_3_snacks' },
        { label: '进阶用例 (6袋零食, 容量12)', value: 'medium_6_snacks' },
        { label: '紧缩容量 (4袋零食, 容量5)', value: 'tight_capacity' },
      ],
    },
  ],
  presets: [
    { label: '标准用例 (3袋零食, 容量10)', values: { preset: 'standard_3_snacks' } },
    { label: '进阶用例 (6袋零食, 容量12)', values: { preset: 'medium_6_snacks' } },
    { label: '紧缩容量 (4袋零食, 容量5)', values: { preset: 'tight_capacity' } },
  ],
  generateSteps: (inputs: Record<string, any>) => buildSnacksWays063Steps(inputs?.preset),
  renderCanvas: (container: HTMLElement, step: SnacksWaysStep) => {
    container.innerHTML = renderMeetInTheMiddleArrayView({
      lsum: step.lsum,
      rsum: step.rsum,
      activeLeftIdx: step.activeLeftIdx,
      activeRightIdx: step.activeRightIdx,
      curLeftVal: step.curLeftVal,
      curRightVal: step.curRightVal,
      targetOrGoal: step.capacity,
      currentAns: step.totalWays,
      modeTitle: '牛牛的背包问题 · 折半二分计数沙盘',
    });
  },
});
