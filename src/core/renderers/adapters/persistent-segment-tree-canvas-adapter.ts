/**
 * Class 156: 可持久化线段树 / 主席树 (Persistent Segment Tree) 领域视觉适配器
 * 核心：多版本根节点与共享结构展板、当前版本卡、空间增量比率卡与前缀差分检索引擎公式卡
 */

import { PersistentSegStep } from './persistent-segment-tree-step-compiler';
import { renderPersistentSegTreeBoard } from '../../../algorithms/categories/advanced-topics/advanced-155-160/advanced-155-160-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderPersistentSegmentTreeCanvas(container: HTMLElement, step: PersistentSegStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderPersistentSegTreeBoard(step.versions, step.activeVersion, step.kthResult),
    metrics: [
      {
        label: '当前操作版本',
        value: step.activeVersion > 0 ? `Version ${step.activeVersion}` : '版本就绪',
        color: '#4338ca',
      },
      {
        label: '空间增量比率',
        value: '仅增加 O(log N) 节点',
        color: '#059669',
      },
    ],
    formula: {
      title: '主席树前缀差分检索引擎',
      equation: '区间差分公式: Count_{[L, R]} = Tree[R] - Tree[L - 1] | 若 count(左) \u2265 k 往左搜，否则往右搜第 (k - count) 小',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
