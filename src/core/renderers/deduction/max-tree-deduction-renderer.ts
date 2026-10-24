/**
 * 最大二叉树 (Maximum Binary Tree · LeetCode 654)
 * 全景推演树渲染策略 (MaxTreeDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class MaxTreeDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'max-tree';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'max-tree' ||
      modelId === '654' ||
      modelId === 'leetcode-654' ||
      modelId === 'maximum-binary-tree'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 654. 最大二叉树 (Maximum Binary Tree) · 全景推演树',
      badge: '代码随想录 · 分治扫描构造 / 单调栈笛卡尔树 / 显式任务栈',
      descriptionHtml: `
        给定一个不含重复元素的整数数组，构建最大二叉树：<br/>
        1. 二叉树的根是数组中的最大元素；<br/>
        2. 左子树是通过最大元素左边部分子数组递归构造的最大二叉树；<br/>
        3. 右子树是通过最大元素右边部分子数组递归构造的最大二叉树。<br/>
        <strong>《代码随想录》教学洞见：</strong> 树的构造题本质皆是分治切分！前序位置定根（寻找极值点），分治左右区间递归构建，注意区间“左闭右闭”或“左闭右开”的不变量一致性。
      `,
      initialStateText: `根调用入口：constructMaximumBinaryTree(nums) ➔ 初始有效区间 [0 .. nums.length - 1]。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空区间越界基准 (Empty Range)',
        valuesStr: 'left > right ➔ return null (区间无元素，返回空子树)',
      },
      {
        prefix: '└───',
        label: '单元素叶子快速构建 (Single Leaf Node)',
        valuesStr: 'left == right ➔ return new TreeNode(nums[left]) (无需再次寻找极值，直接返回叶节点)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 递归分治与区间线性扫描 (Recursive Divide & Conquer · LC 654 经典)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono text-[9px]">O(N²) Scan</span>',
      detailLines: [
        'maxIdx = argmax(nums[left..right]) ➔ 线性扫描获取当前子区间最大值及其索引',
        'root = new TreeNode(nums[maxIdx]) ➔ 实例化当前子树根节点',
        'root.left = construct(nums, left, maxIdx - 1) ➔ 切割左半区间并递归构建左子树',
        'root.right = construct(nums, maxIdx + 1, right) ➔ 切割右半区间并递归构建右子树',
      ],
      fillLine: '清晰呈现分治切分三部曲：扫描定根 ➔ 切割左半 ➔ 切割右半，直观展现树形拓扑结构递归生长',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 单调栈 O(N) 笛卡尔树构建 (Monotonic Stack Cartesian Tree)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-mono text-[9px]">O(N) Cartesian Tree</span>',
      detailLines: [
        'while (!stack.isEmpty() && stack.peek().val < cur.val) lastPop = stack.pop() ➔ 较小元素弹栈',
        'cur.left = lastPop ➔ 弹出的小元素必位于 cur 左侧且是其中的最大者，直接挂为 cur 的左孩子',
        'if (!stack.isEmpty()) stack.peek().right = cur ➔ 栈顶大元素位于 cur 左侧，cur 挂为栈顶右孩子',
        'stack.push(cur) ➔ 当前节点入栈维持单调递减链；最终栈底元素即为整棵树的最大根节点',
      ],
      fillLine: '算法进阶：将 O(N²) 的重复扫描降维为 O(N) 单调栈线性建树，揭示二叉树与笛卡尔树的本质同构',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 显式任务栈迭代构建 (Explicit TaskStack Iteration)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-mono text-[9px]">Explicit Stack</span>',
      detailLines: [
        'Stack<Task> taskStack ➔ 自定义显式任务结构，封装父节点引用、挂载方向(LEFT/RIGHT)与区间范围',
        'Task cur = taskStack.pop() ➔ 弹出当前待构造子树任务，线性定位极值后挂载至父节点',
        'taskStack.push(rightTask), taskStack.push(leftTask) ➔ 分治子区间任务显式入栈调度',
      ],
      fillLine: '工程防御级进阶：利用堆内存任务栈彻底规避深度单链倾斜树引发的系统调用栈溢出 (StackOverflow)',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯状态推演流 (From Basic to Advanced)',
      subtitle: 'Programmer Carl Divide & Conquer Progression',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return root; // 返回构建完成的最大二叉树根节点',
      answerDescription: '分治法平均时间 O(N log N)，最坏退化为单链 O(N²)；单调栈法稳定 O(N)。空间复杂度均为 O(N)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
