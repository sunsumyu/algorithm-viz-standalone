/**
 * 除自身以外数组的乘积 (Product of Array Except Self · LeetCode 238)
 * 全景推演树渲染策略 (ProductExceptSelfDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class ProductExceptSelfDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'product-except-self-238';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'product-except-self-238' ||
      modelId === 'product-except-self' ||
      modelId === '238' ||
      modelId === 'leetcode-238'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 238. 除自身以外数组的乘积 (Product of Array Except Self) · 全景推演树',
      badge: '前后缀积双向折叠 · 结果数组复用优化 · 零除法与 O(1) 额外空间 · 严格 O(N)',
      descriptionHtml: `
        核心目标：给你一个整数数组 <code>nums</code>，返回数组 <code>answer</code>，其中 <code>answer[i]</code> 等于 <code>nums</code> 中除 <code>nums[i]</code> 之外其余各元素的乘积。<strong>题目严禁使用除法，且要求在 O(N) 时间复杂度内完成</strong>。<br/>
        <strong>前后缀积双向折叠核心教研范式：</strong><br/>
        1. <strong>左右拆解公理（Bilateral Factorization Axiom）</strong>：<br/>
        任何位置 <code>i</code> 的“除自身外的乘积”，数学上恒等于其<strong>左侧所有元素的乘积（前缀积）</strong>乘以其<strong>右侧所有元素的乘积（后缀积）</strong>：<br/>
        <code>answer[i] = (nums[0] * ... * nums[i-1]) * (nums[i+1] * ... * nums[n-1])</code>；<br/>
        2. <strong>第一趟正向扫描（构建左侧前缀积）</strong>：<br/>
        直接复用返回数组 <code>res</code>。令 <code>res[0] = 1</code>，随后 <code>res[i] = res[i - 1] * nums[i - 1]</code>。此时 <code>res[i]</code> 恰好保存了 <code>i</code> 左侧全部乘积；<br/>
        3. <strong>第二趟反向扫描（滚动累乘右侧后缀积）</strong>：<br/>
        使用一个标量 <code>R = 1</code> 代表右侧后缀积。从右向左倒序遍历：<br/>
        • <code>res[i] = res[i] * R</code>（左积乘以右积）；<br/>
        • <code>R = R * nums[i]</code>（将当前元素纳入右积，供前一位消费）；<br/>
        4. <strong>空间极致压缩</strong>：除了输出数组外，仅用常数级标量 <code>R</code>，空间复杂度降至真正极致的 $O(1)$。
      `,
      initialStateText: `乘积入口：productExceptSelf(nums) ➔ int[] res = new int[n]，res[0] = 1，定义滚动后缀积 R = 1。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '基底前缀积初始化 (Base Prefix Product)',
        valuesStr: 'res[0] = 1 ➔ 下标 0 左侧无元素，前缀乘积中立元为 1',
      },
      {
        prefix: '└───',
        label: '基底后缀积初始化 (Base Suffix Product)',
        valuesStr: 'R = 1 ➔ 最右端元素右侧无元素，后缀乘积中立元为 1',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 正向单趟构建左侧前缀乘积 (Forward Prefix Accumulation)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Prefix Scan</span>',
      detailLines: [
        'res[0] = 1;',
        'for (int i = 1; i < n; i++) {',
        '  res[i] = res[i - 1] * nums[i - 1]; // 汇集左侧所有数字之积',
        '}',
      ],
      fillLine: '顺流铺垫：res[i] 完美承载 nums[0..i-1] 之连乘积，就位等待右半部对撞',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 逆向滚动累乘右侧后缀乘积 (Backward Suffix Rolling)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Suffix Roll</span>',
      detailLines: [
        'int R = 1;',
        'for (int i = n - 1; i >= 0; i--) {',
        '  res[i] = res[i] * R; // 左积 × 右积 = 除自身外全积',
        '  R *= nums[i]; // 更新右侧连乘积',
        '}',
      ],
      fillLine: '逆向交融：标量 R 携右翼连乘积瞬时与左翼前缀积交汇，完成原位精准折叠',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 交付除自身以外全乘积数组 (Return Final Products)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[9px]">Return res</span>',
      detailLines: [
        'return res;',
      ],
      fillLine: '功成身退：两趟线性扫描，零除法，零额外大数组分配，交付完美结果',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '除自身外乘积双向折叠推演流 (Forward Prefix Scan ➔ Backward Suffix Rolling ➔ Full Product)',
      subtitle: 'LeetCode 238 Product of Array Except Self Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '全乘积数组 int[] res',
      complexityStr: '时间复杂度: O(N) 两次单向线性扫描 · 空间复杂度: O(1) 仅复用返回数组与标量 R',
    });

    return header + baseCase + round + finalReturn;
  }
}
