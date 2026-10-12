/**
 * Class 152: 伸展树与区间翻转 (Splay Tree) 领域视觉适配器
 * 核心：Splay 树拓扑展板、当前伸展目标键值指示卡、双旋操作阶段卡与提升准则卡
 */

import { SplayStep } from './splay-tree-step-compiler';
import { renderSplayBoard } from '../../../algorithms/categories/advanced-topics/advanced-149-154/advanced-149-154-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderSplayTreeCanvas(container: HTMLElement, step: SplayStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderSplayBoard(step.root, step.splayedVal, step.rotationName),
    metrics: [
      {
        label: '当前伸展目标节点',
        value: step.splayedVal >= 0 ? `Key = ${step.splayedVal}` : '初始化',
        color: '#6d28d9',
      },
      {
        label: '双旋操作阶段',
        value: step.rotationName,
        color: '#4338ca',
      },
    ],
    formula: {
      title: 'Splay 双旋提升引擎',
      equation: 'Zig-Zig 准则: 节点与父节点同侧时【先旋父节点再旋自身】 | Zig-Zag 准则: 异侧时连续两次自身旋转',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
