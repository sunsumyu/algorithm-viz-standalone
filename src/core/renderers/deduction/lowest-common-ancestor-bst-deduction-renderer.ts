/**
 * 二叉搜索树的最近公共祖先 (LCA in BST · LeetCode 235 / Class 037 Code02)
 * 全景推演树渲染策略 (LowestCommonAncestorBstDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class LowestCommonAncestorBstDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'lowest-common-ancestor-bst';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'lowest-common-ancestor-bst' ||
      modelId === '235' ||
      modelId === 'leetcode-235' ||
      modelId === 'tree-037-lowest-common-ancestor-bst' ||
      modelId === 'bst-lca' ||
      modelId === 'lowest-common-ancestor-of-a-binary-search-tree'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 235. 二叉搜索树最近公共祖先 (LCA in BST) · 全景推演树',
      badge: '左程云 Class 037 / 代码随想录 · 分流点定理 / 数值区间剪枝 / 迭代 O(1) 空间',
      descriptionHtml: `
        相较于普通二叉树，二叉搜索树（BST）自带<strong>极其强大的分流点定理 (Bifurcation Invariant)</strong>！<br/>
        无需自底向上后序深搜左右子树！只需从根节点由上至下单向探测当前节点 <code class="font-mono bg-blue-50 text-blue-700 px-1 py-0.5 rounded font-bold">cur</code>：<br/>
        1. <strong>同在左侧</strong>：若 <code class="font-mono bg-slate-50 text-slate-800 px-1 py-0.5 rounded">cur.val &gt; p.val &amp;&amp; cur.val &gt; q.val</code>，目标必全在左侧，整棵右子树剪枝，单向向左滑行：<code class="font-mono text-blue-700 font-bold">cur = cur.left</code>；<br/>
        2. <strong>同在右侧</strong>：若 <code class="font-mono bg-slate-50 text-slate-800 px-1 py-0.5 rounded">cur.val &lt; p.val &amp;&amp; cur.val &lt; q.val</code>，目标必全在右侧，整棵左子树剪枝，单向向右滑行：<code class="font-mono text-blue-700 font-bold">cur = cur.right</code>；<br/>
        3. <strong>分水岭直接命中</strong>：若当前节点值介于 $[ \min(p,q), \max(p,q) ]$ 之间，说明 $p$ 与 $q$ 从此节点开始<strong>首次分道扬镳（或其一就是当前节点）</strong>，<strong>当前节点必是最近公共祖先</strong>！
      `,
      initialStateText: `检索入口：lowestCommonAncestor(root, p, q) ➔ 利用数值单调性单向二分滑行，首个分流点即为 LCA。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '└───',
        label: '空节点基准 (Base Null)',
        valuesStr: 'cur == null ➔ 树为空节点，返回 null',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 递归单调分流剪枝 (Recursive BST Invariant)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono text-[9px]">Recursive O(H)</span>',
      detailLines: [
        'if (root.val > p.val && root.val > q.val) return lowestCommonAncestor(root.left, p, q) ➔ 整体偏小，单侧深入左子树',
        'else if (root.val < p.val && root.val < q.val) return lowestCommonAncestor(root.right, p, q) ➔ 整体偏大，单侧深入右子树',
        'else return root ➔ 首次落入 [min(p,q), max(p,q)]，命中分水岭，直接返回当前根节点！',
      ],
      fillLine: '单侧递归分流：利用数值有序性瞬间剪掉一半可能，无需左右遍历两棵子树',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 2: 迭代常数空间极速定位 (Iterative O(1) Space)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono text-[9px]">Iterative O(1)</span>',
      detailLines: [
        'while (cur != null) ➔ 单指针原地向下循环推进，零调用栈开销',
        'if (cur.val > p.val && cur.val > q.val) cur = cur.left ➔ 目标全在左侧，指针左移',
        'else if (cur.val < p.val && cur.val < q.val) cur = cur.right ➔ 目标全在右侧，指针右移',
        'else return cur ➔ 命中分流点，立即跳出循环并返回结果',
      ],
      fillLine: '迭代极致常数空间：将 LCA 复杂度降维为单条二分路径，辅助空间严格 O(1)',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '二级演化阶梯全景推演流 (From Recursive Divide to Iterative O(1))',
      subtitle: 'LeftGod Class 037 & Programmer Carl LCA in BST In-Depth Progression',
      stepLinesHtml: step1 + step2,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return cur; // 返回分流点二叉搜索树最近公共祖先节点',
      answerDescription: '时间复杂度严格为树高 O(H)，最好 O(log N)；迭代辅助空间复杂度严格为 O(1)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
