/**
 * Class 178: 圆方树与仙人掌图算法 (Block-Cut Tree) 领域视觉适配器
 * 核心：圆方树拓扑与双连通块沙盘、当前算法阶段指示卡、降维打击能力卡与圆方树映射公式卡
 */

import { renderBlockCutBoard } from '../../../algorithms/categories/advanced-topics/advanced-173-178/advanced-173-178-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import { BlockCutStep } from './block-cut-tree-178-step-compiler';

export function renderBlockCutCanvas(container: HTMLElement, step: BlockCutStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderBlockCutBoard(step.origNodes, step.blocks, step.stage),
    metrics: [
      {
        label: '当前算法阶段',
        value: step.stage,
        color: '#047857',
      },
      {
        label: '降维打击能力',
        value: '仙人掌/一般图 \u2192 树上倍增',
        color: '#059669',
      },
    ],
    formula: {
      title: '圆方树拓扑与路径映射定理',
      equation: '圆点: 原图所有顶点 | 方点: 原图极大点双连通分量 (BCC) | 连边: 方点向所属 BCC 内所有圆点连边 | 简单路径交集 \u2261 树上圆点路径',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
