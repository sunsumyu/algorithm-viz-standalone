/**
 * Class 088: 树上背包 DP 与泛化物品优化 (Tree Knapsack DP) CanvasAdapter
 * 职责：挂载与更新树形依赖背包看板及数学公式卡
 */

import { TreeKnapsack088Step } from './tree-knapsack-dp-088-step-compiler';
import { renderTreeKnapsackBoard } from '../../../algorithms/categories/dynamic-programming/dp-084-088/dp-084-088-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export class TreeKnapsackDp088CanvasAdapter {
  render(container: HTMLElement, step: TreeKnapsack088Step): void {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderTreeKnapsackBoard(
          step.nodes,
          step.m,
          step.curU,
          step.dpRow
        )}
        ${renderFormulaCard(
          '树上背包泛化物品合并方程',
          'dp[u][j] = \\max_{0 \\le k < j} \\{ dp[u][j - k] + dp[v][k] \\}',
          '将每棵子树抽象为一个权值随占用体积变化的泛化物品。先强制扣除根节点自身的占用体积（保证拓扑依赖合规），剩余容量以分组背包的形式在各子树间进行最优资源切分。'
        )}
      </div>
    `;
  }
}

export const treeKnapsackDp088CanvasAdapter = new TreeKnapsackDp088CanvasAdapter();
