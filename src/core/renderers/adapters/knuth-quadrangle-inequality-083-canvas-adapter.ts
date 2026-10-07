/**
 * Class 083 四边形不等式与决策单调性优化 Canvas 适配器
 */

import { renderKnuthQuadrangleBoard } from '../../../algorithms/categories/dynamic-programming/dp-079-083/dp-079-083-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { type Knuth083Step } from './knuth-quadrangle-inequality-083-step-compiler';

export function renderKnuthQuadrangleCanvas(container: HTMLElement, step: Knuth083Step): void {
  container.innerHTML = `
    <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
      ${renderKnuthQuadrangleBoard(
        step.stones,
        step.i,
        step.j,
        step.optL,
        step.optR,
        step.bestK,
        step.minCost
      )}
      ${renderFormulaCard(
        'Knuth 决策单调性夹逼定理',
        'opt[i][j-1] \\le opt[i][j] \\le opt[i+1][j]',
        '代价函数满足四边形不等式使得决策点单调递增，计算 $dp[i][j]$ 时 $k$ 的枚举范围被左右两端子区间的决策点紧紧夹逼。所有区间的决策枚举跨度累加相消，将原本 $O(N^3)$ 的区间 DP 严格降至 $O(N^2)$。'
      )}
    </div>
  `;
}
