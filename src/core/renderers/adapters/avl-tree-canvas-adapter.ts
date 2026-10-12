/**
 * Class 142: AVL 树平衡二叉搜索树 (AVL Tree) 领域视觉适配器
 * 核心：AVL 树拓扑展板、当前键值指示卡、旋转状态卡与平衡因子维护公式卡
 */

import { AVLStep } from './avl-tree-step-compiler';
import { renderAVLTreeBoard } from '../../../algorithms/categories/advanced-topics/advanced-142-148/advanced-142-148-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderAVLTreeCanvas(container: HTMLElement, step: AVLStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderAVLTreeBoard(step.root, step.activeKey, step.rotationType),
    metrics: [
      {
        label: '当前操作键值',
        value: step.activeKey >= 0 ? `Key = ${step.activeKey}` : '调整就绪',
        color: '#4338ca',
      },
      {
        label: '平衡旋转状态',
        value: step.rotationType !== 'None' ? step.rotationType : '平衡维持良好',
        color: step.rotationType !== 'None' ? '#b45309' : '#059669',
      },
    ],
    formula: {
      title: 'AVL 严格平衡因子维护',
      equation: '平衡准则: |b| = |h(left) - h(right)| \u2264 1 | 四种失衡修正: LL(右单旋), RR(左单旋), LR(双旋), RL(双旋)',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
