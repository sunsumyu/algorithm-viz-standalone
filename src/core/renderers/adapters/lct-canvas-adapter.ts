/**
 * Class 155: 动态树 Link-Cut Tree (LCT) 领域视觉适配器
 * 核心：LCT 森林实链画板、当前操作节点指示卡、动态操作阶段卡与实链引擎公式卡
 */

import { LCTStep } from './lct-step-compiler';
import { renderLCTBoard } from '../../../algorithms/categories/advanced-topics/advanced-155-160/advanced-155-160-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderLCTCanvas(container: HTMLElement, step: LCTStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderLCTBoard(step.nodes, step.edges, step.activeNode, step.accessPath, step.actionName),
    metrics: [
      {
        label: '当前操作节点',
        value: step.activeNode > 0 ? `Node ${step.activeNode}` : '就绪',
        color: '#4338ca',
      },
      {
        label: '动态操作阶段',
        value: step.actionName,
        color: '#059669',
      },
    ],
    formula: {
      title: 'LCT 动态树实链引擎',
      equation: '实链准则: 每个节点至多连一条实儿子边 | Access(x): 根到 x 全打通为实链 | 均摊复杂度: O(log N)',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
