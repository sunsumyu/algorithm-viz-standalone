/**
 * Class 153: 替罪羊树 (Scapegoat Tree) 领域视觉适配器
 * 核心：替罪羊树拓扑展板、alpha 阈值指示卡、暴力拍扁重建状态卡与不自旋重构引擎卡
 */

import { ScapegoatStep } from './scapegoat-tree-step-compiler';
import { renderScapegoatBoard } from '../../../algorithms/categories/advanced-topics/advanced-149-154/advanced-149-154-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderScapegoatTreeCanvas(container: HTMLElement, step: ScapegoatStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderScapegoatBoard(step.root, step.flattenBuffer, step.isRebuilding),
    metrics: [
      {
        label: '失衡判定阈值 alpha',
        value: `\u03b1 = ${step.alpha}`,
        color: '#4338ca',
      },
      {
        label: '当前重构状态',
        value: step.isRebuilding ? '正在暴力拍扁重建' : '树形维持稳定',
        color: step.isRebuilding ? '#ea580c' : '#059669',
      },
    ],
    formula: {
      title: '替罪羊树不自旋重构引擎',
      equation: '失衡充要条件: max(sz_L, sz_R) > \u03b1 * sz | 修复手段: 0 旋转，中序扁平化数组 + 分治二分构建',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
