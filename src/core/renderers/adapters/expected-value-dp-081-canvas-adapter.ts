/**
 * Class 081 期望 DP 与马尔可夫决策过程 Canvas 适配器
 */

import { renderExpectedValueDpBoard } from '../../../algorithms/categories/dynamic-programming/dp-079-083/dp-079-083-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { type ExpectedValue081Step } from './expected-value-dp-081-step-compiler';

export function renderExpectedValueDpCanvas(container: HTMLElement, step: ExpectedValue081Step): void {
  container.innerHTML = `
    <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
      ${renderExpectedValueDpBoard(
        step.grid,
        step.step,
        step.totalProb
      )}
      ${renderFormulaCard(
        '全概率转移与期望线性方程',
        'dp[k][nr][nc] \\mathrel{+}= \\frac{1}{8} \\times dp[k-1][r][c] \\quad (\\forall (nr, nc) \\in \\text{valid})',
        '马尔可夫链的无后效性保证了当前状态的概率仅依赖于上一时刻的所有可能前驱；借助动态规划顺推累加，规避了深度优先暴力递归重复状态爆炸的瓶颈。'
      )}
    </div>
  `;
}
