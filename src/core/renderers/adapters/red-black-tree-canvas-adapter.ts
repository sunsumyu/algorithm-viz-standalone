/**
 * Class 150: 红黑树 (Red-Black Tree) 领域视觉适配器
 * 核心：红黑二叉树拓扑沙盘、当前键值指示卡、修复阶段卡与黑高五大公理卡
 */

import { RBStep } from './red-black-tree-step-compiler';
import { renderRBTreeBoard } from '../../../algorithms/categories/advanced-topics/advanced-149-154/advanced-149-154-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderRBTreeCanvas(container: HTMLElement, step: RBStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderRBTreeBoard(step.root, step.activeKey, step.actionType),
    metrics: [
      {
        label: '当前操作键值',
        value: step.activeKey >= 0 ? `Key = ${step.activeKey}` : '调整就绪',
        color: '#4338ca',
      },
      {
        label: '当前修复阶段',
        value: step.actionType,
        color: '#059669',
      },
    ],
    formula: {
      title: '红黑树着色与黑高维护引擎',
      equation: '公理4: 红色不能相连 | 公理5: 各路径黑色节点数相等 | 修复三部曲: 叔叔为红变色上推，叔叔为黑一字/之字旋转',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
