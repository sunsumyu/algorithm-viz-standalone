/**
 * Class 151: 跳表 (SkipList) 领域视觉适配器
 * 核心：跳表多层拓扑网格、当前操作值指示卡、总节点数指标卡与概率索引引擎卡
 */

import { SkipListStep } from './skiplist-step-compiler';
import { renderSkipListBoard } from '../../../algorithms/categories/advanced-topics/advanced-149-154/advanced-149-154-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderSkipListCanvas(container: HTMLElement, step: SkipListStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderSkipListBoard(step.nodes, step.maxLevel, step.activeVal),
    metrics: [
      {
        label: '当前操作节点值',
        value: step.activeVal >= 0 ? `Val = ${step.activeVal}` : '构建完成',
        color: '#4338ca',
      },
      {
        label: '跳表总节点数',
        value: `${step.nodes.length} 个`,
        color: '#059669',
      },
    ],
    formula: {
      title: '跳表多层概率索引引擎',
      equation: '期望指针数: 1 / (1 - p) | 查找策略: 右侧更小则右跃，否则下降一层 | 期望复杂度: O(log N)',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
