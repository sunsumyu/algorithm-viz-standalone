/**
 * Class 177: 弦图与最大势算法 (Chordal Graph & MCS) 领域视觉适配器
 * 核心：PEO 完美消除序列与诱导子图沙盘、当前阶段指示卡、完美图性质卡与 PEO 判定公式卡
 */

import { renderChordalMCSBoard } from '../../../algorithms/categories/advanced-topics/advanced-173-178/advanced-173-178-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import { ChordalMCSStep } from './chordal-graph-mcs-177-step-compiler';

export function renderChordalMCSCanvas(container: HTMLElement, step: ChordalMCSStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderChordalMCSBoard(step.nodes, step.peo, step.deg, step.activePick, step.stage),
    metrics: [
      {
        label: '当前算法阶段',
        value: step.stage,
        color: '#6d28d9',
      },
      {
        label: '完美图性质',
        value: '最大团 = 团数 = 色数',
        color: '#059669',
      },
    ],
    formula: {
      title: '弦图与 PEO 完美消除序列定理',
      equation: 'PEO 准则: &forall; v_i，其在序列后继中相连邻居诱导子图为团 (完全图) | 最大团 \u03C9(G) = 色数 \u03C7(G) | MCS 复杂度: O(N + M)',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
