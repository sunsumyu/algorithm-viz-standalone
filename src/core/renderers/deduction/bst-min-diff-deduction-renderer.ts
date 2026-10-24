/**
 * 二叉搜索树的最小绝对差 (Minimum Absolute Difference in BST · LeetCode 530 / 783)
 * 全景推演树渲染策略 (BstMinDiffDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class BstMinDiffDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'bst-min-diff';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'bst-min-diff' ||
      modelId === '530' ||
      modelId === '783' ||
      modelId === 'leetcode-530' ||
      modelId === 'leetcode-783' ||
      modelId === 'minimum-absolute-difference-in-bst'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 530 & 783. 二叉搜索树的最小绝对差 (Minimum Absolute Difference) · 全景推演树',
      badge: '代码随想录 · 中序单调展平 / 原地双指针作差 / Morris O(1) 常数空间',
      descriptionHtml: `
        二叉搜索树（BST）核心定理：<strong>中序遍历的结果是严格单调递增的有序序列</strong>！<br/>
        在任意递增序列中，<strong>两数差值的绝对极小值必定产生在相邻两项之间</strong>，绝不可能跨项产生。<br/>
        <strong>《代码随想录》核心教学洞见——原地双指针解耦：</strong><br/>
        无需额外开辟数组保存序列（省去 $O(N)$ 辅助数组空间），直接在遍历过程中维护前驱指针 <code class="font-mono bg-blue-50 text-blue-700 px-1 py-0.5 rounded font-bold">prev</code>。<br/>
        每次处理当前节点 <code class="font-mono bg-amber-50 text-amber-700 px-1 py-0.5 rounded">cur</code> 时：<br/>
        <code class="font-mono bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold">if (prev != null) minDiff = Math.min(minDiff, cur.val - prev.val); prev = cur;</code><br/>
        从递归隐式栈 ➔ 显式调用栈 ➔ Morris 线索树 $O(1)$ 空间，形成完整的进阶演化推演。
      `,
      initialStateText: `算法入口：getMinimumDifference(root) ➔ 初始化全局 minDiff = +∞，前驱指针 prev = null。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '└───',
        label: '空节点基准 (Base Null)',
        valuesStr: 'cur == null ➔ return (空节点直接返回，不参与差值计算与前驱更新)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 经典中序双指针递归 (Inorder Traversal with Prev)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono text-[9px]">Recursive Inorder</span>',
      detailLines: [
        'traversal(cur.left) ➔ 递归深潜至最左叶子节点',
        'if (prev != null) minDiff = Math.min(minDiff, cur.val - prev.val) ➔ 中序考察当前节点，与前驱原地作差刷新最小值',
        'prev = cur; traversal(cur.right) ➔ 推进全局前驱指针，并向右子树深入',
      ],
      fillLine: '原地双指针作差：利用 BST 中序递增性质，相邻元素之差即为全局最小差的候选者',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 显式单调栈迭代中序 (Iterative Explicit Stack Inorder)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-mono text-[9px]">Stack&lt;TreeNode&gt;</span>',
      detailLines: [
        'while (cur != null || !stack.isEmpty()) ➔ 显式栈模拟递归系统调用',
        'while (cur != null) { stack.push(cur); cur = cur.left; } ➔ 沿左侧链一路到底压栈',
        'cur = stack.pop() ➔ 弹栈访问中序节点，执行 minDiff = Math.min(minDiff, cur.val - prev.val)',
        'prev = cur; cur = cur.right ➔ 指针转向右孩子',
      ],
      fillLine: '显式栈模拟：规避极端退化链状树的递归调用栈溢出风险',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: Morris 空间常数遍历 (Morris Inorder Traversal · O(1) Space)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono text-[9px]">Morris O(1)</span>',
      detailLines: [
        'mostRight = cur.left; while (mostRight.right != null && mostRight.right != cur) mostRight = mostRight.right ➔ 寻找中序前驱',
        'if (mostRight.right == null) { mostRight.right = cur; cur = cur.left; } ➔ 建立临时右指针线索并左移',
        'else { mostRight.right = null; 更新 minDiff; prev = cur; cur = cur.right; } ➔ 拆除线索恢复树形，处理当前节点并右移',
      ],
      fillLine: 'Morris 神级优化：利用叶节点空闲右指针建立线索返回，空间复杂度严格达到 O(1)',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯全景推演流 (From Recursion to Stack to Morris O(1))',
      subtitle: 'Programmer Carl BST Minimum Absolute Difference Three Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return minDiff; // 返回树中任意两节点差值的绝对极小值',
      answerDescription: '时间复杂度 O(N)，每个节点最多访问两次；递归与显式栈空间 O(H)，Morris 空间严格 O(1)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
