/**
 * Class 175: 匈牙利算法与二分图最大匹配 (Hungarian Matching) 领域视觉适配器
 * 核心：二分图左右部点匹配沙盘、当前算法阶段指示卡、König 定理卡与增广路公式卡
 */

import { renderHungarianBoard } from '../../../algorithms/categories/advanced-topics/advanced-173-178/advanced-173-178-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import { HungarianStep } from './hungarian-matching-175-step-compiler';

export function renderHungarianCanvas(container: HTMLElement, step: HungarianStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderHungarianBoard(step.nLeft, step.nRight, step.edges, step.matchRight, step.activeLeft, step.stage),
    metrics: [
      {
        label: '当前算法阶段',
        value: step.stage,
        color: '#15803d',
      },
      {
        label: 'König 定理',
        value: '最大匹配 = 最小点覆盖',
        color: '#059669',
      },
    ],
    formula: {
      title: '匈牙利增广路定理',
      equation: '增广路定义: 起点与终点均未匹配的交替路 | 增广反转: 匹配边与未匹配边状态对调 \u21D2 匹配数 + 1 | 充要条件: 不存在增广路即为最大匹配',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
