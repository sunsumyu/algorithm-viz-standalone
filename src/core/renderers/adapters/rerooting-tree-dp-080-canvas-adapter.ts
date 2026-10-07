/**
 * Class 080 换根 DP 专题 Canvas 适配器
 */

import { renderRerootingDpBoard } from '../../../algorithms/categories/dynamic-programming/dp-079-083/dp-079-083-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { type Rerooting080Step } from './rerooting-tree-dp-080-step-compiler';

export function renderRerootingDpCanvas(container: HTMLElement, step: Rerooting080Step): void {
  container.innerHTML = `
    <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
      ${renderRerootingDpBoard(
        step.nodes,
        step.curRoot,
        step.phase
      )}
      ${renderFormulaCard(
        '换根 DP 经典微积分转移定理',
        'ans[v] = ans[u] - size[v] + (N - size[v]) = ans[u] + N - 2 \\times size[v]',
        '当根由父节点 $u$ 滑动到相邻子节点 $v$ 时，以 $v$ 为根的子树距离全部减少 1（共 $size[v]$ 个点），其余外部所有节点距离全部增加 1（共 $N - size[v]$ 个点），从而实现 $O(1)$ 换根推进。'
      )}
    </div>
  `;
}
