/**
 * Class 084: 计数 DP 与错排问题 (Derangement & Counting DP) CanvasAdapter
 * 职责：挂载与更新错排递推看板及数学公式卡
 */

import { Counting084Step } from './counting-dp-inclusion-exclusion-084-step-compiler';
import { renderCountingDpBoard } from '../../../algorithms/categories/dynamic-programming/dp-084-088/dp-084-088-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export class CountingDp084CanvasAdapter {
  render(container: HTMLElement, step: Counting084Step): void {
    composeUnifiedCanvas(container, {
      mainBoardHtml: renderCountingDpBoard(
        step.n,
        step.curI,
        step.history,
        step.curAns
      ),
      formula: {
        title: '经典错排递推方程与容斥定理',
        equation: 'D(n) = (n - 1) \\times [D(n - 1) + D(n - 2)], \\quad D(n) = n! \\sum_{k=0}^{n} \\frac{(-1)^k}{k!}',
        explanation: '将第 $n$ 个元素的落点分为与目标位置元素对换（归约为 $D(n-2)$）以及不对换（归约为 $D(n-1)$）两类互斥情形，满足不重不漏计数原理。',
      },
    });
  }
}

export const countingDp084CanvasAdapter = new CountingDp084CanvasAdapter();
