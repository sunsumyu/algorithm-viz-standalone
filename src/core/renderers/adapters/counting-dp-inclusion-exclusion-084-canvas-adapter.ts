/**
 * Class 084: 计数 DP 与错排问题 (Derangement & Counting DP) CanvasAdapter
 * 职责：挂载与更新错排递推看板及数学公式卡
 */

import { Counting084Step } from './counting-dp-inclusion-exclusion-084-step-compiler';
import { renderCountingDpBoard } from '../../../algorithms/categories/dynamic-programming/dp-084-088/dp-084-088-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export class CountingDp084CanvasAdapter {
  render(container: HTMLElement, step: Counting084Step): void {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderCountingDpBoard(
          step.n,
          step.curI,
          step.history,
          step.curAns
        )}
        ${renderFormulaCard(
          '经典错排递推方程与容斥定理',
          'D(n) = (n - 1) \\times [D(n - 1) + D(n - 2)], \\quad D(n) = n! \\sum_{k=0}^{n} \\frac{(-1)^k}{k!}',
          '将第 $n$ 个元素的落点分为与目标位置元素对换（归约为 $D(n-2)$）以及不对换（归约为 $D(n-1)$）两类互斥情形，满足不重不漏计数原理。'
        )}
      </div>
    `;
  }
}

export const countingDp084CanvasAdapter = new CountingDp084CanvasAdapter();
