/**
 * Class 087: 环形区间 DP 与破环成链 (Circular Interval DP) CanvasAdapter
 * 职责：挂载与更新环形项链倍长能量看板及数学公式卡
 */

import { CircularInterval087Step } from './circular-interval-dp-087-step-compiler';
import { renderCircularIntervalBoard } from '../../../algorithms/categories/dynamic-programming/dp-084-088/dp-084-088-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export class CircularIntervalDp087CanvasAdapter {
  render(container: HTMLElement, step: CircularInterval087Step): void {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderCircularIntervalBoard(
          step.a,
          step.n,
          step.bestStart,
          step.maxEnergy
        )}
        ${renderFormulaCard(
          '破环成链与环形区间转移定理',
          'dp[i][j] = \\max_{i \\le k < j} \\{ dp[i][k] + dp[k+1][j] + a[i] \\cdot a[k+1] \\cdot a[j+1] \\}, \\quad ans = \\max_{0 \\le i < N} dp[i][i + N - 1]',
          '通过将环形数组倍长拼接为 $2N$ 的线性数组，环上的任意旋转断开情形都一一对应为线性数组中长度为 $N$ 的连续子区间，从而在一次线性区间 DP 框架下枚举出全环最优解。'
        )}
      </div>
    `;
  }
}

export const circularIntervalDp087CanvasAdapter = new CircularIntervalDp087CanvasAdapter();
