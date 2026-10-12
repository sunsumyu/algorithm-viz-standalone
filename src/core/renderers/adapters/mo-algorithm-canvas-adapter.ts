/**
 * Class 159: 莫队算法 (Mo's Algorithm) 领域视觉适配器
 * 核心：分块数组双指针沙盘、当前指针范围卡、相异种类指示卡与莫队分块引擎公式卡
 */

import { MoStep } from './mo-algorithm-step-compiler';
import { renderMoBoard } from '../../../algorithms/categories/advanced-topics/advanced-155-160/advanced-155-160-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderMoCanvas(container: HTMLElement, step: MoStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderMoBoard(
      step.arr,
      step.blockSize,
      step.curL,
      step.curR,
      step.targetL,
      step.targetR,
      step.curAns
    ),
    metrics: [
      {
        label: '当前指针范围 [L, R]',
        value: `[${step.curL}, ${step.curR}]`,
        color: '#4338ca',
      },
      {
        label: '相异元素种类总数',
        value: `${step.curAns} 种`,
        color: '#059669',
      },
    ],
    formula: {
      title: '莫队离线分块双指针引擎',
      equation: '最优块长: B = N / sqrt(Q) | 奇偶优化: 奇数块 R 升序，偶数块 R 降序 | 总移动复杂度: O(N sqrt(Q))',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
