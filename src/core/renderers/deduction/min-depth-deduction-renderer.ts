/**
 * 二叉树的最小深度 (Minimum Depth of Binary Tree · LeetCode 111 / Class 036)
 * 全景推演树渲染策略 (MinDepthDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class MinDepthDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'min-depth';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'min-depth' ||
      modelId === '111' ||
      modelId === 'leetcode-111' ||
      modelId === 'minimum-depth-of-binary-tree' ||
      modelId === 'min-depth-tree' ||
      modelId === 'minimum-depth'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 111. 二叉树的最小深度 (Minimum Depth of Binary Tree) · 全景推演树',
      badge: '代码随想录 · 单侧子树避坑 / 层次遍历 BFS 首个叶子提前退出 / 静态数组队列',
      descriptionHtml: `
        二叉树的最小深度定义：<strong>从根节点到最近叶子节点的最短路径上的节点数</strong>。<br/>
        <strong>《代码随想录》教学破局点——单侧子树避坑指南：</strong><br/>
        很多人容易草率写出 <code>return 1 + Math.min(left, right)</code>，这在单侧链（如根节点只有右孩子）时会发生致命逻辑错误！<br/>
        若左子树为空，左子树深度返回 0，草率取 min 会得出深度为 1，但根节点并非叶子节点（<strong>叶子节点的定义是：左右孩子都为空的节点</strong>）。<br/>
        因此，必须显式判定：当单侧为空时，最小深度取决于非空一侧子树的叶子深度！
      `,
      initialStateText: `计算入口：minDepth(root) ➔ 从根节点向下递归发散或入队层序推进。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空节点基准 (Base Null)',
        valuesStr: 'root == null ➔ return 0 (空树高度与深度均为 0)',
      },
      {
        prefix: '└───',
        label: '单侧子树特判 (Single Child Trap)',
        valuesStr: 'left == null && right != null ➔ 1 + minDepth(right)；反之 1 + minDepth(left)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 递归后序遍历与叶子节点特判 (Postorder DFS with Leaf Conditions)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Postorder DFS</span>',
      detailLines: [
        'if (root.left == null && root.right != null) return 1 + minDepth(root.right) ➔ 避坑：左空右不空，深入右子树叶子',
        'if (root.right == null && root.left != null) return 1 + minDepth(root.left) ➔ 避坑：右空左不空，深入左子树叶子',
        'return 1 + Math.min(minDepth(root.left), minDepth(root.right)) ➔ 左右皆非空，取较小路径并加上当前节点',
      ],
      fillLine: '后序自底向上规约：时间复杂度 O(N)，空间复杂度 O(H)，严谨守卫叶子节点定义',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 层次遍历 BFS 首遇叶子提前终止 (Breadth-First Search Early Exit)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Levelorder BFS</span>',
      detailLines: [
        'queue.push(root); depth = 1 ➔ 根节点入队，初始深度置为 1',
        'while (queue.length > 0) { size = queue.length; for (i = 0; i < size; i++) { ... } depth++; } ➔ 逐层扫描',
        'if (node.left == null && node.right == null) return depth; ➔ 核心优势：首次遇到叶子节点立即返回 depth！',
      ],
      fillLine: '广度优先最短路剪枝：无需遍历整棵树，浅层叶子节点处立即截断，平均时空性能远优于 DFS',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 左程云 Class 036 静态数组模拟队列 (Static Array Fast Queue)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Zero-GC Fast Queue</span>',
      detailLines: [
        'TreeNode[] queue = new TreeNode[MAXN]; int l = 0, r = 0; queue[r++] = root ➔ 预分配平坦内存，指针入队',
        'while (l < r) { int size = r - l; for (int i = 0; i < size; i++) { ... } depth++; } ➔ 指针滑动窗口',
        'if (cur.left == null && cur.right == null) return depth; ➔ 命中叶子直接跳出，零 GC 开销与极致常数性能',
      ],
      fillLine: '工业级算法调优：连续内存布局杜绝动态分配碎片，首遇叶子直接 O(1) 瞬时截断',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯全景推演流 (Postorder DFS ➔ Early-Exit BFS ➔ Zero-GC Fast Queue)',
      subtitle: 'Programmer Carl Minimum Depth Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return depth; // 根节点到最近叶子节点的最短路径节点数',
      answerDescription: '时间复杂度: BFS 最优/平均 O(K) ≤ O(N), DFS O(N)；空间复杂度: DFS O(H) / BFS O(W)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
