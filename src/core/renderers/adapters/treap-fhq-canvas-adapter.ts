/**
 * Class 154: 非旋 Treap / FHQ-Treap 领域视觉适配器
 * 核心：分裂合并双树展板、当前分裂操作卡、范式指示卡与极简无旋引擎卡
 */

import { FHQStep } from './treap-fhq-step-compiler';
import { renderFHQTreapBoard } from '../../../algorithms/categories/advanced-topics/advanced-149-154/advanced-149-154-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderFHQTreapCanvas(container: HTMLElement, step: FHQStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderFHQTreapBoard(step.rootL, step.rootR, step.mergedRoot, step.splitKey),
    metrics: [
      {
        label: '当前操作类型',
        value: step.splitKey !== undefined ? `按 Key \u2264 ${step.splitKey} 分裂` : '合并 / 就绪',
        color: '#4338ca',
      },
      {
        label: '核心操作范式',
        value: '无旋 Split / Merge',
        color: '#059669',
      },
    ],
    formula: {
      title: 'FHQ-Treap 极简无旋引擎',
      equation: '二叉搜索律: val(L) \u2264 key < val(R) | 随机堆序律: pri(root) \u2264 min(pri(L), pri(R)) | 0 旋转自平衡',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
