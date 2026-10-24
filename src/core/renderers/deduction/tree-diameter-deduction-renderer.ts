/**
 * 树的直径 (Tree Diameter · SP1437 / LeetCode 1245 / Class 123)
 * 全景推演树渲染策略 (TreeDiameterDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class TreeDiameterDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'tree-diameter';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'tree-diameter' ||
      modelId === 'tree-diameter-123' ||
      modelId === 'class123-code01' ||
      modelId === 'sp1437' ||
      modelId === 'leetcode-1245' ||
      modelId === 'longest-path-in-a-tree'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 1245 / SP1437. 树的直径 (Tree Diameter) · 全景推演树',
      badge: '左程云 Class 123 · 两遍 BFS/DFS 贪心双探 / 树形 DP 左右最大深度拼接 / 严格 O(V + E) 线性极限',
      descriptionHtml: `
        核心目标：给定一棵无向无环无权树（树上任意两点间距离为边数），求出树中相距最远的两个节点之间的距离（即<strong>树的直径</strong>）。<br/>
        <strong>左程云算法体系教学核心——两遍 BFS 贪心极值探测定理：</strong><br/>
        1. <strong>两遍 BFS 求解公理（适用所有非负权树）</strong>：<br/>
        • <strong>第一遍 BFS</strong>：任选一个节点 $s$（通常为根节点 1）出发，通过广度优先搜索找到离 $s$ <strong>最远的一个节点 $u$</strong>；<br/>
        • <strong>定理断言</strong>：点 $u$ <strong>必定是整棵树某一条直径的其中一个端点</strong>（反证法数学闭合）！<br/>
        • <strong>第二遍 BFS</strong>：从点 $u$ 出发再次进行广度优先搜索，找到离 $u$ <strong>最远的一个节点 $v$</strong>；<br/>
        • 路径 $u \\leftrightarrow v$ 即为树的一条直径，两者之间的距离即为<strong>树的最大直径</strong>！<br/>
        2. <strong>树形 DP 备选范式（适用包含负权边的树）</strong>：<br/>
        对于任意节点 <code>cur</code>，向其所有子节点搜集最大深度；保留前两名最大深度 $d_1$ 和 $d_2$，则过当前节点的最长链为 $d_1 + d_2$；全局维护 $\\max(d_1 + d_2)$ 即可。
      `,
      initialStateText: `树直径初始化：加载无向树邻接表，任选初始节点 s = 1 启动首轮 BFS 探底。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空树与单节点基准 (Base Tree)',
        valuesStr: '节点数 N <= 1 ➔ 边数为 0，树直径为 0',
      },
      {
        prefix: '└───',
        label: '端点极值定理 (Endpoint Theorem)',
        valuesStr: '从任意节点出发的最远点 u，必然属于某条直径的端点集合',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 第一遍 BFS 探测首个直径端点 u (First Search for End 1)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">O(N) BFS 1</span>',
      detailLines: [
        'int[] dist = new int[n + 1]; Arrays.fill(dist, -1);',
        'bfs(1): 从起点 1 逐层发散，找到 dist 最大的节点 u',
        '数学推导：假设 u 不是直径端点，则存在更长路径，与树的无环连通性矛盾',
      ],
      fillLine: '端点锁定：锁定点 u，树上最遥远的路径必定以 u 为一侧尽头',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 第二遍 BFS 沿端点 u 探查对偶端点 v (Second Search for End 2)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">O(N) BFS 2</span>',
      detailLines: [
        'Arrays.fill(dist, -1); dist[u] = 0;',
        'bfs(u): 以 u 为根重新逐层扫描整树，找到距离 u 最远的点 v',
        '此时 dist[v] 即为整棵树的最大直径长度！',
      ],
      fillLine: '全幅展开：从端点 u 贯穿全树，直击对侧最深谷底点 v',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 树形 DP 自底向上汇总对照 (Tree DP Alternative)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Tree DP</span>',
      detailLines: [
        'for (int child : cur.children) {',
        '  h = dfs(child) + 1;',
        '  if (h > max1) { max2 = max1; max1 = h; } else if (h > max2) { max2 = h; }',
        '}',
        'maxDiameter = Math.max(maxDiameter, max1 + max2); return max1;',
      ],
      fillLine: '双保险：树形 DP 一遍 DFS 后序归约，同样在 O(N) 得到完全一致的直径答案',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '树的直径两遍搜索与树形 DP 全景推演流 (BFS 1 ➔ End 1 ➔ BFS 2 ➔ Diameter)',
      subtitle: 'LeetCode 1245 & Zuoshen Class 123 Tree Diameter Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return maxDiameter; // 树中两点间的最长简单路径长度',
      answerDescription: '两遍 BFS/DFS 时间复杂度为严格 O(V + E)，空间复杂度为 O(V)，简洁优雅效率极高。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
