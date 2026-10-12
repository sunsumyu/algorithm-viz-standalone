import {
  renderSegmentTreeGraphBoard,
  renderCDQGraphBoard,
} from '../../../algorithms/categories/advanced-topics/advanced-196-200/advanced-196-200-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import {
  SegmentTreeGraphStep,
  CDQGraphStep,
} from './advanced-graph-opt-family-compiler';

export function renderSegmentTreeGraphCanvas(container: HTMLElement, step: SegmentTreeGraphStep): void {
  container.innerHTML = `
    <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
      ${renderSegmentTreeGraphBoard(
        step.inTreeNodes,
        step.outTreeNodes,
        step.leaves,
        step.activeEdge,
        step.edgeCountStats
      )}
      ${renderFormulaCard(
        '线段树优化建图边数复杂度定理',
        'M \\text{ 次区间连边总边数} = O(M \\log N), \\quad \\text{暴力全连边为 } O(M \\cdot N)',
        '每个区间被拆解为线段树上最多 2\\log N 个不相交线段节点，使得建图时空从 $O(N^2)$ 降低到 $O(M \\log N)$。'
      )}
    </div>
  `;
}

export function renderCDQGraphCanvas(container: HTMLElement, step: CDQGraphStep): void {
  container.innerHTML = `
    <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
      ${renderCDQGraphBoard(
        step.l,
        step.r,
        step.mid,
        step.leftElements,
        step.rightElements,
        step.prefixNodes,
        step.activeConnections,
        step.stats
      )}
      ${renderFormulaCard(
        'CDQ 分治优化建图时空定理',
        'T(N) = 2T(N/2) + O(N) = O(N \\log N), \\quad \\text{总边数 } E = O(N \\log N)',
        '利用分治在时间/第一维上的天然偏序，将跨区间多维建边转化为序列前缀建边，不仅不需要昂贵的动态树结构，更具有优秀的常数与缓存命中率。'
      )}
    </div>
  `;
}
