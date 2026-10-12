/**
 * Class 188: Tarjan SCC 缩点 (Strongly Connected Components) 领域视觉适配器
 * 核心：DFS 搜索树与栈沙盘、当前算法阶段指示卡、缩点 DAG 转化卡与根判定定理卡
 */

import { renderTarjanSCCBoard } from '../../../algorithms/categories/advanced-topics/advanced-185-190/advanced-185-190-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import { TarjanSCCStep } from './tarjan-scc-condensation-188-step-compiler';

export function renderTarjanSCCCanvas(container: HTMLElement, step: TarjanSCCStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderTarjanSCCBoard(
      step.nodes,
      step.dfn,
      step.low,
      step.inStack,
      step.sccs,
      step.stage
    ),
    metrics: [
      {
        label: '当前算法阶段',
        value: step.stage,
        color: '#be185d',
      },
      {
        label: '缩点转化',
        value: '有向有环图 => 有向无环图 (DAG)',
        color: '#059669',
      },
    ],
    formula: {
      title: 'Tarjan SCC 根判定准则',
      equation: 'dfn[u] == low[u] <=> u 为其所属极大强连通分量在搜索树上的最早根节点',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
