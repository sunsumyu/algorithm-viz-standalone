/**
 * 二叉搜索树中的众数 (Find Mode in BST · LeetCode 501)
 * 全景推演树渲染策略 (BstModesDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class BstModesDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'bst-modes';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'bst-modes' ||
      modelId === '501' ||
      modelId === 'leetcode-501' ||
      modelId === 'find-mode-in-binary-search-tree'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 501. 二叉搜索树中的众数 (Find Mode in BST) · 全景推演树',
      badge: '代码随想录 · 中序连续性在线统计 / 动态清空重置法 / Morris O(1) 空间',
      descriptionHtml: `
        二叉搜索树（BST）核心属性：<strong>中序遍历下相同节点值必定连续相邻出现</strong>（等价于在有序数组中统计众数）！<br/>
        <strong>《代码随想录》教学破局点——动态清空重置法 (Dynamic Reset Strategy)：</strong><br/>
        无需开辟哈希表统计全局词频（省去 $O(N)$ 字典空间），也无需进行两趟遍历！在单趟遍历过程中维护双指针：<br/>
        1. <strong>频次累加</strong>：若 <code class="font-mono bg-blue-50 text-blue-700 px-1 py-0.5 rounded">cur.val == prev.val</code>，则 <code class="font-mono bg-blue-50 text-blue-700 px-1 py-0.5 rounded">count++</code>；否则重置 <code class="font-mono bg-blue-50 text-blue-700 px-1 py-0.5 rounded">count = 1</code>；<br/>
        2. <strong>并列众数收集</strong>：若 <code class="font-mono bg-slate-50 text-slate-800 px-1 py-0.5 rounded">count == maxCount</code>，将当前元素加入答案集 <code class="font-mono bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded font-bold">result.push(cur.val)</code>；<br/>
        3. <strong>更高频新众数突破</strong>：若 <code class="font-mono bg-slate-50 text-slate-800 px-1 py-0.5 rounded">count &gt; maxCount</code>，更新 <code class="font-mono bg-purple-50 text-purple-700 px-1 py-0.5 rounded font-bold">maxCount = count</code>，并<strong>果断清空原数组</strong>：<code class="font-mono bg-rose-50 text-rose-700 px-1 py-0.5 rounded font-bold">result = [cur.val]</code>！
      `,
      initialStateText: `检索入口：findMode(root) ➔ 初始 count = 0, maxCount = 0, prev = null, result = []。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '└───',
        label: '空节点基准 (Base Null)',
        valuesStr: 'cur == null ➔ return (空节点直接返回，不参与频次统计与结果集更新)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 经典中序双指针在线动态结算递归 (Recursive Inorder)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono text-[9px]">Recursive Inorder</span>',
      detailLines: [
        'traversal(cur.left) ➔ 递归探针深潜左子树',
        'if (prev == null || cur.val != prev.val) count = 1; else count++ ➔ 统计连续相同值频次',
        'if (count == maxCount) result.push(cur.val) ➔ 并列众数追加',
        'if (count > maxCount) { maxCount = count; result = [cur.val]; } ➔ 动态清空重置，确立新众数',
        'prev = cur; traversal(cur.right) ➔ 推进前驱指针并深潜右子树',
      ],
      fillLine: '在线一趟遍历法：依靠动态清空机制，省去两趟遍历开销与哈希表额外内存',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 显式单调栈迭代中序 (Iterative Explicit Stack Inorder)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-mono text-[9px]">Stack&lt;TreeNode&gt;</span>',
      detailLines: [
        'while (cur != null || !stack.isEmpty()) ➔ 显式栈控制遍历生命周期',
        'while (cur != null) { stack.push(cur); cur = cur.left; } ➔ 沿左侧链一路压栈到底',
        'cur = stack.pop() ➔ 弹栈访问中序节点，执行相同的频次统计与动态清空逻辑',
        'prev = cur; cur = cur.right ➔ 指针转向右孩子',
      ],
      fillLine: '显式栈模拟中序流程：消除隐式调用栈，保持精准一行一步状态可观测性',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: Morris 空间常数遍历 (Morris Inorder Traversal · O(1) Space)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono text-[9px]">Morris O(1)</span>',
      detailLines: [
        'mostRight = cur.left; while (mostRight.right != null && mostRight.right != cur) mostRight = mostRight.right ➔ 寻找前驱',
        'if (mostRight.right == null) { mostRight.right = cur; cur = cur.left; } ➔ 建立右向临时线索',
        'else { mostRight.right = null; 统计当前节点频次并更新众数集合; prev = cur; cur = cur.right; } ➔ 拆除线索恢复原树',
      ],
      fillLine: 'Morris 极致优化：利用叶子空闲右指针回溯，除返回答案数组外空间严格 O(1)',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯全景推演流 (From Dynamic Reset to Morris O(1))',
      subtitle: 'Programmer Carl BST Find Mode Paradigms Progression',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return result; // 返回树中所有并列出现频次最高的众数数组',
      answerDescription: '时间复杂度 O(N)，每个节点最多访问两次；递归与显式栈空间 O(H)，Morris 空间除输出数组外严格 O(1)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
