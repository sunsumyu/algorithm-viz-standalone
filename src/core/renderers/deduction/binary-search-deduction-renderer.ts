/**
 * 二分查找 (Binary Search · LeetCode 704)
 * 全景推演树渲染策略 (BinarySearchDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class BinarySearchDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'binary-search';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'binary-search' ||
      modelId === '704' ||
      modelId === 'leetcode-704' ||
      modelId === 'binary-search-closed-interval'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 704. 二分查找 (Binary Search) · 全景推演树',
      badge: '左闭右闭区间不变量 · 防溢出中点公式 · 对半剔除不可能区间 · O(log N)',
      descriptionHtml: `
        核心目标：在升序无重复整数数组 <code>nums</code> 中查找 <code>target</code>，存在返回下标，否则返回 <code>-1</code>。<br/>
        <strong>《代码随想录》核心教研范式——区间定义即循环不变量：</strong><br/>
        1. <strong>左闭右闭 [left, right]</strong>：初始 <code>right = n - 1</code>，因 <code>left == right</code> 时区间仍合法，循环条件必须写 <code>while (left &lt;= right)</code>；<br/>
        2. <strong>防溢出中点</strong>：<code>mid = left + ((right - left) &gt;&gt; 1)</code>，杜绝 <code>left + right</code> 整型溢出；<br/>
        3. <strong>收缩时剔除 mid</strong>：<code>nums[mid] &gt; target</code> 时 mid 已被证伪，<code>right = mid - 1</code>；反之 <code>left = mid + 1</code>。每轮区间严格缩小，保证终止。
      `,
      initialStateText: `查找入口：search(nums, target) ➔ 初始化 left = 0, right = n - 1（左闭右闭）。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '命中返回 (Hit)',
        valuesStr: 'nums[mid] == target ➔ 直接 return mid',
      },
      {
        prefix: '└───',
        label: '区间耗尽 (Exhausted)',
        valuesStr: 'left > right ➔ 区间为空，target 不存在，return -1',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 计算防溢出中点 (Compute Mid)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">mid</span>',
      detailLines: [
        'while (left <= right) {',
        '  int mid = left + ((right - left) >> 1);',
      ],
      fillLine: '折半定位：取当前合法区间的中点作为本轮唯一探针',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 三分支比较与区间剔除 (Compare & Discard Half)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Discard</span>',
      detailLines: [
        '  if (nums[mid] > target) right = mid - 1;',
        '  else if (nums[mid] < target) left = mid + 1;',
        '  else return mid;',
        '}',
      ],
      fillLine: '对半剔除：mid 已被比较过，收缩边界时必须越过 mid，否则可能死循环',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 区间为空宣告未命中 (Not Found)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-mono text-[9px]">-1</span>',
      detailLines: ['return -1;'],
      fillLine: '不变量兜底：left 越过 right，说明所有可能位置均已排除',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '二分折半推演流 (Mid ➔ Compare ➔ Discard Half ➔ Repeat)',
      subtitle: 'LeetCode 704 Binary Search Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '目标下标 mid 或 -1',
      complexityStr: '时间复杂度: O(log N) 每轮区间减半 · 空间复杂度: O(1)',
    });

    return header + baseCase + round + finalReturn;
  }
}
