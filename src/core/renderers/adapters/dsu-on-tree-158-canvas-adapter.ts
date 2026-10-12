/**
 * Class 158: 树上启发式合并 (DSU on Tree) 领域视觉适配器
 * 核心：轻重儿子树拓扑与颜色桶沙盘、当前核心节点卡、答案求出统计卡与启发式调度引擎公式卡
 */

import { DSUStep } from './dsu-on-tree-158-step-compiler';
import { renderDSUOnTreeBoard } from '../../../algorithms/categories/advanced-topics/advanced-155-160/advanced-155-160-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderDSUOnTree158Canvas(container: HTMLElement, step: DSUStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderDSUOnTreeBoard(step.curNode, step.heavySon, step.buckets, step.ansMap),
    metrics: [
      {
        label: '当前统计核心节点',
        value: `Node ${step.curNode}`,
        color: '#4338ca',
      },
      {
        label: '已求出答案节点数',
        value: `${Object.keys(step.ansMap).length} 个节点`,
        color: '#059669',
      },
    ],
    formula: {
      title: 'DSU on Tree 启发式调度引擎',
      equation: '轻儿子策略: 递归并清空桶 (keep=false) | 重儿子策略: 递归并直接保留桶 (keep=true) | 均摊时间: O(N log N)',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
