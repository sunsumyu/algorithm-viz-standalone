/**
 * 二叉树高频递归套路 (Tree Recursion Patterns / Tree DP · Class 019)
 * 全景推演树渲染策略 (TreeRecursionPatternsDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class TreeRecursionPatternsDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'tree-recursion-patterns';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'tree-recursion-patterns' ||
      modelId === 'tree-recursion-patterns-019' ||
      modelId === 'class019-code01' ||
      modelId === 'tree-dp-patterns' ||
      modelId === 'tree-recursion'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '左程云 Class 019. 二叉树高频递归套路 (Tree DP Info Patterns) · 全景推演树',
      badge: '左程云树形 DP 递归通用范式 · 统一 Info 结构体设计 / 左右子树后序汇总 / 三种经典变体破局',
      descriptionHtml: `
        核心目标：掌握树形 DP（二叉树递归套路）的不败心法，通过<strong>统一 Info 结构体</strong>抽象横扫 95% 以上的二叉树递归深水题。<br/>
        <strong>左程云算法体系教学核心——树形递归五步心法：</strong><br/>
        1. <strong>第一步：无私假设</strong>——假设可以通过递归向左子树要到任何你需要的信息（<code>leftInfo</code>），也可以向右子树要到任何信息（<code>rightInfo</code>）；<br/>
        2. <strong>第二步：列出可能性</strong>——以当前节点 <code>cur</code> 为根的整棵树，目标解可能有哪些来源（例如：与 <code>cur</code> 有关 vs 与 <code>cur</code> 无关）；<br/>
        3. <strong>第三步：提炼 Info 结构体</strong>——合并所有可能性所需字段，设计左右子树同构的统一 <code>Info</code> 类；<br/>
        4. <strong>第四步：确立 Base Case</strong>——通常 <code>cur == null</code> 时，返回默认 Info（如 height=0，isBalanced=true）；若不好设置初始值则返回 null 交由父层特判；<br/>
        5. <strong>第五步：自底向上组装并返回</strong>——在后序遍历归约点，用左右子树 Info 闭式算出当前 <code>curInfo</code> 并向上交付！
      `,
      initialStateText: `心法总览：左右子树汇总 ➔ 统一 Info 规约 ➔ 后序自底向上推演。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空节点基准 (Base Null)',
        valuesStr: 'cur == null ➔ 基础高度 height=0，平衡性 isBalanced=true',
      },
      {
        prefix: '└───',
        label: '统一 Info 协议 (Structural Contract)',
        valuesStr: 'class Info { height, isBalanced, min, max, maxDistance }',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '变体 1: 平衡二叉树判定 (Is Balanced · LeetCode 110)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Is Balanced</span>',
      detailLines: [
        'Info: { isBalanced: boolean, height: number }',
        'isBalanced = left.isBalanced && right.isBalanced && Math.abs(left.height - right.height) <= 1',
        'height = Math.max(left.height, right.height) + 1',
      ],
      fillLine: '高度差不超过 1 且两子树均平衡，典型自底向上短路规约',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '变体 2: 搜索二叉树判定 (Is BST · LeetCode 98)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Is BST</span>',
      detailLines: [
        'Info: { isBST: boolean, min: number, max: number }',
        'isBST = left.isBST && right.isBST && (left.max < cur.val) && (right.min > cur.val)',
        'min = Math.min(cur.val, left.min, right.min); max = Math.max(cur.val, left.max, right.max)',
      ],
      fillLine: '极值边界传递：左树最大值严格小于根，右树最小值严格大于根',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '变体 3: 二叉树最大节点距离与直径 (Max Distance · LeetCode 543)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[9px]">Max Distance</span>',
      detailLines: [
        'Info: { maxDistance: number, height: number }',
        '可能性 1 (与根无关): left.maxDistance 或 right.maxDistance',
        '可能性 2 (过根节点): left.height + right.height + 1',
        'maxDistance = max(p1, p2, p3); height = max(left.height, right.height) + 1',
      ],
      fillLine: '分类讨论全覆盖：树上最长路径要么在子树内，要么经过当前根节点贯穿左右',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '统一递归套路全景推演流 (Postorder ➔ Info Gathering ➔ Bottom-up Synthesis)',
      subtitle: 'Zuoshen Class 019 Universal Tree DP Framework',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return process(root); // 自底向上递推计算出的全局最强 Info 结构体',
      answerDescription: '统一时间复杂度 O(N)，每个节点只被访问常数次，空间复杂度为递归栈深度 O(H)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
