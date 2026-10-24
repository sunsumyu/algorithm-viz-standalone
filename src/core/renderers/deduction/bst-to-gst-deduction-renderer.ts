/**
 * 把二叉搜索树转换为累加树 (Convert BST to Greater Tree · LeetCode 538 / 1038)
 * 全景推演树渲染策略 (BstToGstDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class BstToGstDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'bst-to-gst';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'bst-to-gst' ||
      modelId === '538' ||
      modelId === '1038' ||
      modelId === 'leetcode-538' ||
      modelId === 'leetcode-1038' ||
      modelId === 'convert-bst-to-greater-tree' ||
      modelId === 'binary-search-tree-to-greater-sum-tree'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 538 & 1038. 二叉搜索树转累加树 (Convert BST to Greater Tree) · 全景推演树',
      badge: '代码随想录 · 反向中序（右-根-左）/ 原地后缀累加 / Morris O(1) 空间',
      descriptionHtml: `
        累加树（Greater Tree）核心法则：每个节点的新值等于原树中<strong>所有大于等于该节点值的节点值之和</strong>。<br/>
        普通中序遍历（左-根-右）按升序排列；若将其颠倒为<strong>“右子树 ➔ 根节点 ➔ 左子树”</strong>，访问序列则是<strong>严格单调递减</strong>的！<br/>
        <strong>《代码随想录》教学破局点——反向中序后缀和模型：</strong><br/>
        维护单变量累加和 <code class="font-mono bg-blue-50 text-blue-700 px-1 py-0.5 rounded font-bold">preSum</code>：<br/>
        1. 优先深潜到最大值所在的最右侧节点；<br/>
        2. 中序处理：<code class="font-mono bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold">preSum += cur.val; cur.val = preSum;</code><br/>
        3. 再转向左子树深潜，完成由大到小的后缀和连续注入！原地修改，零额外数据结构。
      `,
      initialStateText: `转换入口：convertBST(root) ➔ 初始化前驱后缀累加器 preSum = 0，开启右-根-左反向递归。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '└───',
        label: '空节点基准 (Base Null)',
        valuesStr: 'cur == null ➔ return (空节点直接返回，不参与累加与节点值重写)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 反向中序递归遍历 (Right -> Root -> Left)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono text-[9px]">Reverse Inorder DFS</span>',
      detailLines: [
        'traversal(cur.right) ➔ 优先递归深入最右子树，寻找全局最大值',
        'preSum += cur.val; cur.val = preSum ➔ 核心累加：将当前节点值叠加入后缀总和，并原地重写当前节点值',
        'traversal(cur.left) ➔ 携带当前累计的后缀总和深入左子树',
      ],
      fillLine: '反向中序逆流：将 BST 逆序为递减流，从大到小依次累加，天然等价于数组后缀和',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 显式单调栈迭代反向中序 (Iterative Explicit Stack)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-mono text-[9px]">Stack&lt;TreeNode&gt;</span>',
      detailLines: [
        'while (cur != null || !stack.isEmpty()) ➔ 显式调用栈控制生命周期',
        'while (cur != null) { stack.push(cur); cur = cur.right; } ➔ 沿右侧链一路到底压栈',
        'cur = stack.pop() ➔ 弹栈元素为当前未处理的最大值节点，执行 preSum 累加与原地重写',
        'cur = cur.left ➔ 指针转向左孩子开启下一轮压栈',
      ],
      fillLine: '显式栈模拟反向流程：消除深层递归函数栈开销，步进流程与状态完全透明',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: Morris 空间常数反向遍历 (Morris Reverse Inorder · O(1) Space)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono text-[9px]">Morris O(1)</span>',
      detailLines: [
        'mostLeft = cur.right; while (mostLeft.left != null && mostLeft.left != cur) mostLeft = mostLeft.left ➔ 寻找反向中序前驱',
        'if (mostLeft.left == null) { mostLeft.left = cur; cur = cur.right; } ➔ 建立向左临时线索',
        'else { mostLeft.left = null; preSum += cur.val; cur.val = preSum; cur = cur.left; } ➔ 拆除线索并处理节点',
      ],
      fillLine: 'Morris 反向线索树：利用左孩子空闲指针建立回溯路标，空间复杂度严格降至 O(1)',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯全景推演流 (From Reverse DFS to Stack to Morris O(1))',
      subtitle: 'Programmer Carl Convert BST to Greater Tree Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return root; // 返回原地转换完成的累加二叉搜索树根节点',
      answerDescription: '时间复杂度严格 O(N)，每个节点至多访问两次；递归与显式栈空间 O(H)，Morris 空间严格 O(1)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
