import { CantorStep } from './cantor-expansion-step-compiler';
import { renderCantorBoard } from '../../../algorithms/categories/advanced-topics/advanced-142-148/advanced-142-148-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderCantorExpansionCanvas(container: HTMLElement, step: CantorStep): void {
  composeUnifiedCanvas(container, {
    metrics: [
      {
        label: '正在考察的位索引',
        value: step.curIndex >= 0 ? `位置 [${step.curIndex}] (值 ${step.perm[step.curIndex]})` : '展开就绪',
        color: '#4338ca',
      },
      {
        label: '当前累计字典序 Rank',
        value: `第 ${step.rank} 名`,
        color: '#059669',
      },
    ],
    mainBoardHtml: renderCantorBoard(
      step.perm,
      step.curIndex,
      step.smallerCounts,
      step.factorialWeights,
      step.rank
    ),
    formula: {
      title: '康托展开数码映射引擎',
      equation: `Rank = 1 + &sum;_{i=0}^{N-1} a[i] &times; (N - 1 - i)! | a[i] 为右侧比当前数小的数字个数`,
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
