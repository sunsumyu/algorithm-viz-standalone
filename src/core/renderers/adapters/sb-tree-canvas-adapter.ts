/**
 * Class 149: Size Balanced Tree (SB 树) 领域视觉适配器
 * 核心：SB 树沙盘、当前键值状态指标卡、Maintain 状态指示与平衡公式卡
 */

import { SBStep } from './sb-tree-step-compiler';
import { renderSBTreeBoard } from '../../../algorithms/categories/advanced-topics/advanced-149-154/advanced-149-154-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderSBTreeCanvas(container: HTMLElement, step: SBStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderSBTreeBoard(step.root, step.activeKey, step.maintainType),
    metrics: [
      {
        label: '当前操作键值',
        value: step.activeKey >= 0 ? `Key = ${step.activeKey}` : '操作就绪',
        color: '#4338ca',
      },
      {
        label: 'Maintain 状态',
        value: step.maintainType !== 'None' ? step.maintainType : '子树平衡良好',
        color: step.maintainType !== 'None' ? '#b45309' : '#059669',
      },
    ],
    formula: {
      title: 'SB 树 Maintain 平衡引擎',
      equation: '平衡公理: size(t.left) \u2265 max(size(t.right.left), size(t.right.right)) | 仅插入调整，删除 0 旋转',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
