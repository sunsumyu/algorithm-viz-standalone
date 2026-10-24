/**
 * 验证二叉搜索树 (Validate BST · LeetCode 98 / Class 037 Code05)
 * 全景推演树渲染策略 (ValidBstDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class ValidBstDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'valid-bst';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'valid-bst' ||
      modelId === '98' ||
      modelId === 'leetcode-98' ||
      modelId === 'tree-037-validate-bst' ||
      modelId === 'class037-code05' ||
      modelId === 'class023-code01'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 98. 验证二叉搜索树 (Validate BST) · 全景推演树',
      badge: '代码随想录 · 中序单调递增 / 先序区间定界 / 显式栈模拟',
      descriptionHtml: `
        二叉搜索树核心定理：若左子树不空，其上所有节点值均小于根节点值；若右子树不空，其上所有节点值均大于根节点值；左右子树亦分别为 BST。<br/>
        <strong>《代码随想录》避坑警示——警惕“局部合法但全局违规”陷阱：</strong><br/>
        绝对不能单纯只比较 <code class="font-mono bg-amber-50 text-amber-800 px-1 py-0.5 rounded">root.val &gt; root.left.val &amp;&amp; root.val &lt; root.right.val</code>！<br/>
        例如序列 <code class="font-mono bg-rose-50 text-rose-700 px-1 py-0.5 rounded font-bold">[10, 5, 15, null, null, 6, 20]</code>，节点 6 虽小于其父 15，但却跨层小于了根节点 10！局部均合法，整树却违规。<br/>
        <strong>教学解题金律：</strong>二叉搜索树的<strong>中序遍历必然是严格单调递增的序列</strong>！
      `,
      initialStateText: `递归校验入口：isValidBST(root) ➔ 维护全局前驱节点指针 prev = null 或开区间 (-∞, +∞)。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '└───',
        label: '空节点递归基底 (Base Null)',
        valuesStr: 'root == null ➔ return true (空树天然满足二叉搜索树性质)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 中序递归单调性校验 (Recursive Inorder Monotonicity)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono text-[9px]">Inorder Prev DFS</span>',
      detailLines: [
        'left = isValidBST(root.left) ➔ 先序探针深入左子树，若左子树失衡则提前熔断返回 false',
        'if (prev != null && root.val <= prev.val) return false ➔ 核心校验点：当前节点值必须严格大于前驱节点 prev.val',
        'prev = root; return isValidBST(root.right) ➔ 推进前驱指针并继续深入探测右子树',
      ],
      fillLine: '中序遍历将二叉树自然展平为一维投影流，借助前驱指针 prev 保证严格单调递增律',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 上下界区间约束先序定界 (Boundary Range Pruning)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono text-[9px]">(min, max) Range Pruning</span>',
      detailLines: [
        'check(root, min, max) ➔ 自顶向下传递当前子树节点允许落入的合法开区间 (min, max)',
        'if (root.val <= min || root.val >= max) return false ➔ 穿甲弹剪枝：任何节点越界立即提前终止递归',
        'return check(root.left, min, root.val) && check(root.right, root.val, max) ➔ 左子树上界收紧为根值，右子树下界收紧为根值',
      ],
      fillLine: '先序定界自顶向下传播开区间约束，彻底化解“跨层违规”隐蔽陷阱',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 迭代显式栈模拟中序遍历 (Iterative Explicit Stack Inorder)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-mono text-[9px]">Stack&lt;TreeNode&gt;</span>',
      detailLines: [
        'while (cur != null || !stack.isEmpty()) ➔ 沿左侧链一路压栈 (stack.push(cur), cur = cur.left)',
        'cur = stack.pop() ➔ 弹栈访问当前节点，此时左子树全部节点已成功处理',
        'if (prev != null && cur.val <= prev.val) return false ➔ 比较单调递增性并更新前驱指针 prev = cur',
        'cur = cur.right ➔ 指针转向右孩子，开启下一轮左侧链压栈',
      ],
      fillLine: '显式栈模拟递归调用：消除语言隐式调用栈开销，防极端退化单链树爆栈',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯全景推演流 (Three Evolution Paradigms)',
      subtitle: 'Programmer Carl Validate Binary Search Tree In-Depth Deduction',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return true; // 整棵二叉搜索树通过严格单调性或区间约束检验',
      answerDescription: '时间复杂度 O(N)，每个节点仅访问一次；空间复杂度 O(H)，取决于树高递归深度或显式栈深度。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
