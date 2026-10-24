/**
 * 有序数组的平方 (Squares of a Sorted Array · LeetCode 977)
 * 全景推演树渲染策略 (SortedSquaresDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class SortedSquaresDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'sorted-squares';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'sorted-squares' ||
      modelId === 'squares-of-sorted-array' ||
      modelId === '977' ||
      modelId === 'leetcode-977' ||
      modelId === 'sorted-squares-two-pointers'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 977. 有序数组的平方 (Squares of a Sorted Array) · 全景推演树',
      badge: '首尾双指针向中对撞 · 两极最大逆序落盘 · 抛物线单调性 · 严格 O(N)',
      descriptionHtml: `
        核心目标：给你一个按<strong>非递减顺序</strong>排序的整数数组 <code>nums</code>，返回每个数字的平方组成的新数组，要求也按非递减顺序排序。<br/>
        <strong>《代码随想录》核心教研范式——对撞双指针与极值单调性公理：</strong><br/>
        1. <strong>抛物线两极单调性（Parabolic Extremum Property）</strong>：<br/>
        由于原数组可能包含负数，元素平方后的最大值<strong>必然只能出现在数组的两极</strong>（最左侧的极大负数或最右侧的极大正数），而不可能出现在中间！<br/>
        2. <strong>首尾向中对撞指针（Two-Way Inward Convergence）</strong>：<br/>
        初始化左指针 <code>i = 0</code>，右指针 <code>j = n - 1</code>，新数组填充指针 <code>k = n - 1</code>（从后往前倒序放置最大值）；<br/>
        3. <strong>择大逆序落盘</strong>：<br/>
        比较 <code>nums[i] * nums[i]</code> 与 <code>nums[j] * nums[j]</code>：<br/>
        • 若左端平方较大：<code>res[k--] = nums[i] * nums[i]; i++;</code><br/>
        • 否则右端平方较大：<code>res[k--] = nums[j] * nums[j]; j--;</code><br/>
        双指针单趟向中心相遇，彻底省去 $O(N \log N)$ 排序开销，达成严格 $O(N)$ 线性构造。
      `,
      initialStateText: `构造入口：sortedSquares(nums) ➔ 初始化 int i = 0, j = n - 1, k = n - 1，int[] res = new int[n]。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '单元素特判 (Single Element)',
        valuesStr: 'nums.length == 1 ➔ 直接返回 [nums[0] * nums[0]]',
      },
      {
        prefix: '└───',
        label: '对撞终止不变量 (Meeting Invariant)',
        valuesStr: '当 i > j 时循环终止，此时数组全部元素已按升序填满 res[0..n-1]',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 双向比对两端极值平方 (Compare Extremities)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Compare Ends</span>',
      detailLines: [
        'while (i <= j) {',
        '  int leftSq = nums[i] * nums[i];',
        '  int rightSq = nums[j] * nums[j];',
      ],
      fillLine: '两极争冠：抛物线极大值必在边界，瞬时比对 left 与 right 处的平方权重',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 择大者倒序落入新数组末尾 (Place Max at k & Advance)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">res[k--]</span>',
      detailLines: [
        '  if (leftSq < rightSq) {',
        '    res[k--] = rightSq; j--;',
        '  } else {',
        '    res[k--] = leftSq; i++;',
        '  }',
        '}',
      ],
      fillLine: '逆序压栈：从新数组最高索引 k 处往前安放当前最大平方，并将胜出侧指针向中推进',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 交付天然非递减平方新数组 (Return Result)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[9px]">return res</span>',
      detailLines: [
        'return res;',
      ],
      fillLine: '大功告成：整个对撞过程无任何逆序冒泡，产物严格满足非递减有序约束',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '有序数组平方对撞推演流 (Compare Ends ➔ Inverse Fill k ➔ Inward Convergence)',
      subtitle: 'LeetCode 977 Squares of a Sorted Array Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '有序平方数组 int[] res',
      complexityStr: '时间复杂度: O(N) 单趟对撞扫描 · 空间复杂度: O(1) 仅计返回值数组空间',
    });

    return header + baseCase + round + finalReturn;
  }
}
