/**
 * 下一个更大元素 I (Next Greater Element I · LeetCode 496)
 * 全景推演树渲染策略 (NextGreaterElementIDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class NextGreaterElementIDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'next-greater-element-i';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'next-greater-element-i' ||
      modelId === '496' ||
      modelId === 'leetcode-496' ||
      modelId === 'next-greater-element'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 496. 下一个更大元素 I (Next Greater Element I) · 全景推演树',
      badge: '代码随想录经典基础题 · 单调栈母集建表 (nums2 建立哈希映射) / 子集 nums1 O(1) 瞬时查询 / 空间换时间降维',
      descriptionHtml: `
        核心目标：<code>nums1</code> 中数字 <code>x</code> 的下一个更大元素是指 <code>x</code> 在 <code>nums2</code> 中对应位置右侧的第一个比 <code>x</code> 大的元素。返回一个长度为 <code>nums1.length</code> 的数组 <code>ans</code> 作为答案。<br/>
        <strong>《代码随想录》核心精髓——母集单调栈预处理建表与子集 O(1) 瞬时检索：</strong><br/>
        1. <strong>降维解耦哲学（母集全量建表）</strong>：<br/>
        若针对 <code>nums1</code> 的每个数字都在 <code>nums2</code> 中暴力寻找对应位置再向右扫描，时间复杂度为 <code>O(M * N)</code>；<br/>
        反向思维：直接在全集（母集）<code>nums2</code> 上运行一次单调栈，使用哈希表 <code>Map&lt;Integer, Integer&gt; map</code> 预存每一个元素的右侧首个更大值！<br/>
        2. <strong>单调递减栈建表三部曲</strong>：<br/>
        • 栈内存储 <code>nums2</code> 的元素数值，保持栈底到栈顶<strong>单调递减</strong>；<br/>
        • 当遇到当前元素 <code>num &gt; stack.top()</code> 时，说明 <code>num</code> 正是栈顶元素的<strong>下一个更大元素</strong>；<br/>
        • 弹出栈顶并登记：<code>map.put(stack.pop(), num)</code>；<br/>
        • 扫描结束后，栈中残留元素右侧没有更大值，全部登记为 <code>-1</code>；<br/>
        3. <strong>子集 O(1) 映射提取</strong>：遍历 <code>nums1</code>，直接执行 <code>ans[i] = map.getOrDefault(nums1[i], -1)</code>。
      `,
      initialStateText: `建表入口：nextGreaterElement(nums1, nums2) ➔ 初始化 map 与单调栈 stack = []。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '边界退化判定 (Empty Inputs)',
        valuesStr: 'nums1.length == 0 || nums2.length == 0 ➔ 直接 return new int[0]',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: 'nums2 建表完成且 nums1 提取完毕 ➔ 返回构建好的答案数组 ans',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 母集 nums2 运行单调栈建立映射 (Build Map via nums2)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Map Setup</span>',
      detailLines: [
        'Map<Integer, Integer> map = new HashMap<>();',
        'for (int num : nums2) {',
        '  while (!stack.isEmpty() && num > stack.peek()) {',
        '    map.put(stack.pop(), num); // 记录更大值',
        '  }',
        '  stack.push(num);',
        '}',
      ],
      fillLine: '全量预处理：在母集扫描中一次性算出所有元素右侧的第一个更大值',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 栈内未决元素标记 -1 (Flush Remaining -1)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Settle -1</span>',
      detailLines: [
        'while (!stack.isEmpty()) {',
        '  map.put(stack.pop(), -1); // 右侧无更高者',
        '}',
      ],
      fillLine: '孤山收尾：残留单调降序柱无右侧更大值，统一赋予 -1',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 子集 nums1 O(1) 查表输出 (O(1) Lookup for nums1)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">O(N1 + N2) Total</span>',
      detailLines: [
        'int[] ans = new int[nums1.length];',
        'for (int i = 0; i < nums1.length; i++) {',
        '  ans[i] = map.getOrDefault(nums1[i], -1);',
        '}',
        'return ans;',
      ],
      fillLine: '瞬间查询：遍历子集通过哈希表实现 O(1) 直接返回各位置结果',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '下一个更大元素推演流 (Monotonic Stack on nums2 ➔ Map Construction ➔ Subarray Query)',
      subtitle: 'LeetCode 496 Monotonic Stack & Hash Table Decoupling',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '子集对应更大元素数组 ans',
      complexityStr: '时间复杂度: O(N1 + N2) 线性建表与查询 · 空间复杂度: O(N2) 哈希表与栈空间',
    });

    return header + baseCase + round + finalReturn;
  }
}
