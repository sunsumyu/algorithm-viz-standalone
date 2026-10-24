/**
 * 二叉树迭代遍历与显式栈模拟 (Iterative Tree Traversals · LeetCode 144 / 94 / 145 / Class 020)
 * 全景推演树渲染策略 (TreeTraversalIterativeDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class TreeTraversalIterativeDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'tree-traversal-iterative';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'tree-traversal-iterative' ||
      modelId === 'tree-traversal-iterative-020' ||
      modelId === 'class020-code01' ||
      modelId === 'iterative-traversal' ||
      modelId === 'tree-traversal-stack'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '左程云 Class 020. 二叉树迭代与双栈遍历 (Iterative Traversals) · 全景推演树',
      badge: 'LeetCode 144/94/145 · 先序弹出即打印 / 中序左边界全压栈 / 后序双栈反转时序',
      descriptionHtml: `
        核心目标：摆脱对系统递归调用栈的依赖，用显式数据结构模拟二叉树的<strong>先序、中序与后序遍历</strong>。<br/>
        <strong>左程云算法体系教学核心——栈帧时序三大定理：</strong><br/>
        1. <strong>先序迭代定理（Preorder: 根左右）</strong>：<br/>
        准备一个栈，根节点先入栈；只要栈不为空，<strong>弹出一个打印一个</strong>！然后<strong>先压右孩子，后压左孩子</strong>（后进先出，左孩子必先出栈），天然保证「中 ➔ 左 ➔ 右」时序。<br/>
        2. <strong>中序迭代定理（Inorder: 左根右）</strong>：<br/>
        二叉树的任何一棵子树，都可以被整条左边界完美分解！<br/>
        指针 <code>cur</code> 不断下潜，<strong>将整条左边界全部压入栈中</strong>；当 <code>cur == null</code> 无法下潜时，从栈顶弹出一个节点访问打印，然后令 <code>cur = cur.right</code> 转向其右子树（右子树继续重复压入其整条左边界）。<br/>
        3. <strong>后序双栈反转定理（Postorder: 左右根）</strong>：<br/>
        若将先序的压栈顺序稍加改造——先压左孩子再压右孩子，则弹出顺序变为 <strong>中 ➔ 右 ➔ 左</strong>！<br/>
        每弹出一个节点不直接打印，而是压入第二个辅助收集栈 <code>s2</code> 中。当遍历结束时，从 <code>s2</code> 依次弹出的序列恰好反转为 <strong>左 ➔ 右 ➔ 中</strong>！
      `,
      initialStateText: `显式栈状态模拟：模拟递归函数调用栈，掌握压栈与出栈的显式边界控制。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空树基准 (Base Null)',
        valuesStr: 'root == null ➔ 直接返回空列表 []',
      },
      {
        prefix: '└───',
        label: '循环驱动条件 (Loop Invariant)',
        valuesStr: '单栈判定：!stack.isEmpty()；中序扩展：cur != null || !stack.isEmpty()',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 先序非递归 —— 弹出即打印，先压右再压左 (Preorder: Root-Left-Right)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">LC 144</span>',
      detailLines: [
        'stack.push(root); while(!stack.isEmpty()) {',
        '  cur = stack.pop(); print(cur.val);',
        '  if (cur.right != null) stack.push(cur.right);',
        '  if (cur.left != null) stack.push(cur.left);',
        '}',
      ],
      fillLine: '弹出一个打印一个：先压右后压左，后进先出促使左子树比右子树先弹出处理',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 中序非递归 —— 整条左边界全压栈，无法下潜再弹栈转向 (Inorder: Left-Root-Right)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">LC 94</span>',
      detailLines: [
        'while (cur != null || !stack.isEmpty()) {',
        '  if (cur != null) { stack.push(cur); cur = cur.left; }',
        '  else { cur = stack.pop(); print(cur.val); cur = cur.right; }',
        '}',
      ],
      fillLine: '左边界分解法：整条左边界逐一深入到底，触底出栈后访问当前根，再无缝切换进右子树',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 双栈后序非递归 —— 中右左收集 ➔ 二次弹出反转为左右中 (Postorder: Left-Right-Root)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[9px]">LC 145</span>',
      detailLines: [
        's1.push(root); while(!s1.isEmpty()) {',
        '  cur = s1.pop(); s2.push(cur); // 收集顺序: 中 ➔ 右 ➔ 左',
        '  if (cur.left != null) s1.push(cur.left);',
        '  if (cur.right != null) s1.push(cur.right);',
        '}',
        'while(!s2.isEmpty()) print(s2.pop().val); // 弹出反转: 左 ➔ 右 ➔ 中',
      ],
      fillLine: '双栈对偶反转：利用辅助栈将前序的变体中右左自然逆序为经典后序左右中',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '迭代遍历显式栈时序全景推演流 (Preorder ➔ Inorder Left Boundary ➔ Postorder Double Stack)',
      subtitle: 'Zuoshen Class 020 Iterative Traversal Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return resultList; // 显式单栈/双栈迭代推演出的最终遍历序列',
      answerDescription: '三种迭代遍历时间复杂度均为 O(N)，空间复杂度为栈容量 O(H)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
