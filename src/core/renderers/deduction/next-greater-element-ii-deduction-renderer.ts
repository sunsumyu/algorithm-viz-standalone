/**
 * 下一个更大元素 II (Next Greater Element II · LeetCode 503)
 * 全景推演树渲染策略 (NextGreaterElementIIDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class NextGreaterElementIIDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'next-greater-element-ii';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'next-greater-element-ii' ||
      modelId === '503' ||
      modelId === 'leetcode-503' ||
      modelId === 'next-greater-element-circular'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 503. 下一个更大元素 II (Next Greater Element II) · 全景推演树',
      badge: '代码随想录经典进阶题 · 循环数组虚拟展开 (i % n 取模模拟两轮遍历) / 单调递减栈 / 零额外数组拷贝空间',
      descriptionHtml: `
        核心目标：给定一个循环数组 <code>nums</code>，返回每个元素的<strong>下一个更大元素</strong>。你可以通过在数组末尾循环遍历来寻找下一个更大数。<br/>
        <strong>《代码随想录》核心精髓——循环数组取模展开与双轮单调栈结算公理：</strong><br/>
        1. <strong>循环展开的两大解法对齐</strong>：<br/>
        • <strong>物理拼接法</strong>：将数组拼接成 <code>nums + nums</code> 形成长为 <code>2n</code> 的新数组，需要额外申请内存空间；<br/>
        • <strong>虚拟取模遍历法（推荐最优解）</strong>：不改变原数组结构，循环遍历 <code>2 * n</code> 次，下标直接通过 <code>i % n</code> 映射回原数组！<br/>
        2. <strong>单调栈循环闭环性质</strong>：<br/>
        • 栈内存储真实数组下标 <code>idx = i % n</code>，维持从栈底到栈顶<strong>单调递减</strong>；<br/>
        • 当遇到当前数值 <code>nums[i % n] &gt; nums[stack.top()]</code> 时，说明栈顶元素被<strong>环形右侧</strong>首个更大数突破；<br/>
        • 弹出栈顶 <code>prev = stack.pop()</code>，记录答案 <code>ans[prev] = nums[i % n]</code>；<br/>
        • 仅当栈顶元素被赋值时直接覆盖，若第二轮结束仍在栈中，默认保持 <code>-1</code>！
      `,
      initialStateText: `分析入口：nextGreaterElements(nums) ➔ 初始化 int[] ans = new int[n] 填充 -1，遍历上限 2n。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '初始化默认值 (Fill Default -1)',
        valuesStr: 'Arrays.fill(ans, -1); stack = new ArrayDeque<>();',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: 'i == 2 * n ➔ 双轮模拟结束，环形全景勘测完毕，直接返回 ans',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 取模双轮模拟遍历 (Virtual Loop i % n)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">2n Iterations</span>',
      detailLines: [
        'int n = nums.length;',
        'for (int i = 0; i < 2 * n; i++) {',
        '  int cur = nums[i % n]; // 虚拟环形投影',
        '  while (!stack.isEmpty() && cur > nums[stack.peek()]) {',
        '    ans[stack.pop()] = cur; // 循环击破结算',
        '  }',
        '  if (i < n) stack.push(i % n); // 仅首轮压栈或正常压栈',
        '}',
      ],
      fillLine: '环形展开：首轮压入待测元素，次轮循环绕回头部寻找跨越边界的救赎者',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 跨边界突破结算 (Cross-Boundary Breakthrough)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Break Circular</span>',
      detailLines: [
        '// 当 i >= n 时，指针重新掠过数组前半段',
        '// 若前半段有比栈中残留元素更大的数值，将成功使其出栈赋值',
      ],
      fillLine: '破镜重圆：尾部元素的更大值往往位于数组最开头的凸起峰值',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 全局最大值恒定 -1 交付 (Global Maximum Holds -1)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">O(N) Time</span>',
      detailLines: [
        '// 全局最大元素即使环形绕行两圈也无人能敌，稳居栈底保持 -1',
        'return ans;',
      ],
      fillLine: '完备覆盖：双倍遍历严格覆盖所有可能的环形视野，时间复杂度 O(N)',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '循环数组更大元素推演流 (Modulo Indexing ➔ 2n Boundary Wrap ➔ Breakthrough Settle)',
      subtitle: 'LeetCode 503 Monotonic Stack on Circular Array',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '循环数组下一个更大元素数组 ans',
      complexityStr: '时间复杂度: O(N) 仅 2N 次单调出入栈 · 空间复杂度: O(N) 仅栈空间',
    });

    return header + baseCase + round + finalReturn;
  }
}
