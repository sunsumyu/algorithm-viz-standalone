/**
 * 修剪二叉搜索树 (Trim a Binary Search Tree · LeetCode 669 / Class 037 Code06)
 * 全景推演树渲染策略 (TrimBstDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class TrimBstDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'trim-bst';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'trim-bst' ||
      modelId === '669' ||
      modelId === 'leetcode-669' ||
      modelId === 'tree-037-trim-bst' ||
      modelId === 'bst-trim' ||
      modelId === 'trim-a-binary-search-tree' ||
      modelId === 'class037-code06'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 669. 修剪二叉搜索树 (Trim BST) · 全景推演树',
      badge: '代码随想录 & 左程云 Class 037 · 单侧越界整枝修剪 / 子树提升替代父节点 / BST 单调性剪枝',
      descriptionHtml: `
        目标：给你二叉搜索树的根节点 <code>root</code>，同时给定最小边界 <code>low</code> 和最大边界 <code>high</code>。通过修剪二叉搜索树，使得所有节点的值在 <code>[low, high]</code> 中。<br/>
        <strong>《代码随想录》与左程云算法体系教学核心——为什么不需要重构整树：</strong><br/>
        1. <strong>下界单侧越界修剪公理（cur.val < low）</strong>：<br/>
        由于二叉搜索树中序有序性，<code>cur</code> 的整个左子树所有节点值必严格小于 <code>cur.val < low</code>，因此 <strong><code>cur</code> 节点本身及其整棵左子树必须全部丢弃</strong>！但 <code>cur</code> 的右子树可能仍有落在 <code>[low, high]</code> 内的合法节点，因此直接<strong>将修剪后的右子树 <code>trimBST(cur.right)</code> 向上提升</strong>替代当前 <code>cur</code> 返回给父层。<br/>
        2. <strong>上界单侧越界修剪公理（cur.val > high）</strong>：<br/>
        同理，<code>cur</code> 的整个右子树所有节点值必严格大于 <code>cur.val > high</code>，<strong><code>cur</code> 及其整棵右子树必须全部丢弃</strong>！直接<strong>将修剪后的左子树 <code>trimBST(cur.left)</code> 向上提升</strong>替代当前 <code>cur</code> 返回给父层。<br/>
        3. <strong>合法区间递归接力（low <= cur.val <= high）</strong>：<br/>
        当前节点得以保留，向下分头修剪：<code>cur.left = trimBST(cur.left)</code>，<code>cur.right = trimBST(cur.right)</code>，最后返回原 <code>cur</code>。
      `,
      initialStateText: `修剪入口：trimBST(root, low, high) ➔ 递归遍历 BST 节点，根据节点值与 [low, high] 的关系动态重挂指针。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空节点基准 (Base Null)',
        valuesStr: 'root == null ➔ return null (空子树修剪后仍为空)',
      },
      {
        prefix: '└───',
        label: '有效值域区间 (Target Range)',
        valuesStr: '[low, high] 闭区间，所有保留节点的 node.val 必须满足 low <= val <= high',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '判定 1: 节点值小于下界 ➔ 左树连坐丢弃，提升右子树 (cur.val < low)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-mono text-[9px]">Discard Left & Root</span>',
      detailLines: [
        'if (root.val < low) return trimBST(root.right, low, high);',
        '数学保证：左子树所有节点均 <= root.val < low，必定全部出界，整枝剪除',
        '指针提升：右子树可能包含 >= low 的节点，递归修剪右子树并向上返回',
      ],
      fillLine: '整枝剪除：当前节点及其整个左子树从结果拓扑中瞬间抹除，右子树直接向上提升',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '判定 2: 节点值大于上界 ➔ 右树连坐丢弃，提升左子树 (cur.val > high)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-mono text-[9px]">Discard Right & Root</span>',
      detailLines: [
        'if (root.val > high) return trimBST(root.left, low, high);',
        '数学保证：右子树所有节点均 >= root.val > high，必定全部出界，整枝剪除',
        '指针提升：左子树可能包含 <= high 的节点，递归修剪左子树并向上返回',
      ],
      fillLine: '整枝剪除：当前节点及其整个右子树从结果拓扑中抹除，左子树直接向上提升',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '判定 3: 节点值在区间内 ➔ 保留当前节点，分头修剪重挂 (low <= cur.val <= high)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Keep & Rewire</span>',
      detailLines: [
        'root.left = trimBST(root.left, low, high); // 递归修剪左子树并接回',
        'root.right = trimBST(root.right, low, high); // 递归修剪右子树并接回',
        'return root; // 当前节点保留为合法子树根',
      ],
      fillLine: '指针重连：左右指针分别承接子树修剪后的新根节点，自底向上完成拓扑重组',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: 'BST 递归单侧提升推演流 (Exclusion ➔ Hoisting ➔ Pointer Rewiring)',
      subtitle: 'Programmer Carl & Zuoshen Class 037 Trim BST Paradigm',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return root; // 修剪后符合 [low, high] 规范的 BST 新根节点',
      answerDescription: '每个节点最多访问一次，时间复杂度 O(N)，空间复杂度 O(H)，保持了 BST 固有的中序有序性。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
