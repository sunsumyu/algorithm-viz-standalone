/**
 * 将有序数组转换为二叉搜索树 (Convert Sorted Array to BST · LeetCode 108)
 * 全景推演树渲染策略 (SortedArrayToBstDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class SortedArrayToBstDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'sorted-array-to-bst';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'sorted-array-to-bst' ||
      modelId === '108' ||
      modelId === 'leetcode-108' ||
      modelId === 'convert-sorted-array-to-binary-search-tree'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 108. 有序数组转二叉搜索树 (Convert Sorted Array to BST) · 全景推演树',
      badge: '代码随想录 · 二分区间黄金中点 / 左右严格平衡 / 三队列 BFS 迭代',
      descriptionHtml: `
        高度平衡二叉搜索树（Balanced BST）要求：<strong>任何节点的左右两棵子树高度差绝对值不超过 1</strong>。<br/>
        给定单调递增有序数组 <code class="font-mono bg-blue-50 text-blue-700 px-1 py-0.5 rounded font-bold">nums</code>，如何构造才能保证高度天然平衡？<br/>
        <strong>《代码随想录》教学破局点——二分选根分治思想：</strong><br/>
        必须每次选定当前区间的<strong>正中位置元素作为局部根节点</strong>（<code class="font-mono bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold">mid = left + (right - left) / 2</code>）！<br/>
        这样左侧子区间元素数量与右侧子区间元素数量相差绝不超过 1，递归构造出的左子树与右子树高度差天然 $\le 1$！<br/>
        与二分查找一脉相承：以<strong>左闭右闭区间 [left, right]</strong> 贯穿到底，越界条件为 <code class="font-mono bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-bold">left &gt; right</code>。
      `,
      initialStateText: `构造入口：sortedArrayToBST(nums) ➔ 初始化二分范围 traversal(nums, 0, nums.length - 1)。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '└───',
        label: '区间越界基底 (Base Range Empty)',
        valuesStr: 'left > right ➔ 闭区间内已无元素，返回空节点 return null',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 偏左中点二分分治递归 (Floor Mid Partitioning)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono text-[9px]">Mid = L + (R-L)/2</span>',
      detailLines: [
        'mid = left + (right - left) / 2 ➔ 锁定中间偏左索引作为根节点数值',
        'root = new TreeNode(nums[mid]) ➔ 创建当前二叉树根节点',
        'root.left = traversal(nums, left, mid - 1) ➔ 递归切分左半区间构造左子树',
        'root.right = traversal(nums, mid + 1, right) ➔ 递归切分右半区间构造右子树',
      ],
      fillLine: '二分居中选根：平分左右元素集合，天然达成左右子树节点数均衡与严格平衡',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 偏右中点二分分治递归 (Ceil Mid Partitioning)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-mono text-[9px]">Mid = L + (R-L+1)/2</span>',
      detailLines: [
        'mid = left + (right - left + 1) / 2 ➔ 当区间长度为偶数时选定右中点',
        '呈现平衡二叉树解法的对称多态性（形态各异但均满足 AVL 平衡树约束）',
      ],
      fillLine: '对称中点探索：揭示 BST 构造的多样合法形态与同构平衡属性',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 三队列 BFS 显式迭代构建 (Three-Queue BFS Iteration)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono text-[9px]">Three-Queue BFS</span>',
      detailLines: [
        'nodeQueue, leftQueue, rightQueue ➔ 同步维护树节点、左界与右界三个并行队列',
        '每次出队计算 mid 并生成左子节点 (入队 [left, mid - 1]) 与右子节点 (入队 [mid + 1, right])',
        '父子指针在层序入队出队中直接连接完成',
      ],
      fillLine: '广度优先层序解法：显式模拟树形分层构建，消除深层递归系统调用栈',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯全景推演流 (Binary Partitioning to Three-Queue BFS)',
      subtitle: 'Programmer Carl Sorted Array to Balanced BST Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return root; // 返回构造出的高度平衡二叉搜索树根节点',
      answerDescription: '时间复杂度严格 O(N)，每个元素仅构建一次；递归与队列空间复杂度为树高 O(log N)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
