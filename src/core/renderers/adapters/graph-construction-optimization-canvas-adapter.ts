import {
  renderEBCCConstructionBoard,
  renderVirtualNodesBoard,
} from '../../../algorithms/categories/advanced-topics/advanced-191-195/advanced-191-195-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import {
  EBCCConstructionStep,
  VirtualNodesStep,
} from './graph-construction-optimization-compiler';

export function renderEBCCConstructionCanvas(container: HTMLElement, step: EBCCConstructionStep): void {
  composeUnifiedCanvas(container, {
    metrics: [
      { label: '当前算法阶段', value: step.stage, color: '#1d4ed8' },
      { label: '最优添边定理', value: '一加两消：ceil(L / 2)', color: '#059669' },
    ],
    mainBoardHtml: renderEBCCConstructionBoard(
      step.bccs,
      step.bccDegrees,
      step.leafBCCs,
      step.addedEdges,
      step.minAdded,
      step.stage
    ),
    formula: {
      title: '边双连通改造核心定理',
      equation: '\\text{最少添加边数} = \\lceil \\frac{L}{2} \\rceil = \\lfloor \\frac{L + 1}{2} \\rfloor',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}

export function renderVirtualNodesCanvas(container: HTMLElement, step: VirtualNodesStep): void {
  composeUnifiedCanvas(container, {
    metrics: [
      { label: '当前算法阶段', value: step.stage, color: '#be185d' },
      { label: '复杂度降维', value: 'O(|A| * |B|) => O(|A| + |B|)', color: '#059669' },
    ],
    mainBoardHtml: renderVirtualNodesBoard(
      step.setA,
      step.setB,
      step.vMid,
      step.edgeCountOld,
      step.edgeCountNew,
      step.stage
    ),
    formula: {
      title: '虚点建图降维核心准则',
      equation: 'E_{naive} = |A| \\times |B| \\implies E_{virtual} = |A| + |B|, \\quad \\text{节省 } (|A|-1)(|B|-1) \\text{ 条边}',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
