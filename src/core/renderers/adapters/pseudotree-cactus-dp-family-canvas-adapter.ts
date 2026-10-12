import {
  renderPseudotreeDPBoard,
  renderCactusGraphDPBoard,
} from '../../../algorithms/categories/advanced-topics/advanced-196-200/advanced-196-200-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import {
  PseudotreeDPStep,
  CactusGraphDPStep,
} from './pseudotree-cactus-dp-family-compiler';

export function renderPseudotreeDPCanvas(container: HTMLElement, step: PseudotreeDPStep): void {
  container.innerHTML = `
    <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
      ${renderPseudotreeDPBoard(
        step.nodes,
        step.cycleNodes,
        step.brokenEdge,
        step.schemes,
        step.phase
      )}
      ${renderFormulaCard(
        '基环树最大权独立集断边破环定理',
        '\\text{Ans} = \\max\\Big( \\text{DP}_{\\text{chain}}(\\text{forceNot } u), \\; \\text{DP}_{\\text{chain}}(\\text{forceNot } v) \\Big)',
        '环上相邻两点 $u, v$ 必然不能同时被选中，因此断开边 $(u, v)$ 破坏环形约束后，分别强制 $u$ 不选或 $v$ 不选，即可覆盖所有合法最优配置。'
      )}
    </div>
  `;
}

export function renderCactusGraphDPCanvas(container: HTMLElement, step: CactusGraphDPStep): void {
  container.innerHTML = `
    <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
      ${renderCactusGraphDPBoard(
        step.dfsStates,
        step.currentCycle,
        step.monotonicQueue,
        step.globalDiameter,
        step.phase
      )}
      ${renderFormulaCard(
        '仙人掌图环上单调队列 DP 状态转移方程',
        '\\text{Diameter}_{\\text{cycle}} = \\max_{1 \\le j < i \\le 2L, \\; i - j \\le \\lfloor L/2 \\rfloor} \\Big( f[i] + f[j] + (i - j) \\Big)',
        '每个简单环倍长为 $2L$ 展开为线段，在滑动窗口内使用单调队列维护 $f[j] - j$ 的最大值，将环上环形 DP 从 $O(L^2)$ 压制为严格的 $O(L)$ 线性复杂度！'
      )}
    </div>
  `;
}
