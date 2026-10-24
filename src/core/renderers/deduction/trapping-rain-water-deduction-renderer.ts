/**
 * 接雨水 (Trapping Rain Water · LeetCode 42)
 * 全景推演树渲染策略 (TrappingRainWaterDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class TrappingRainWaterDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'trapping-rain-water';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'trapping-rain-water' ||
      modelId === '42' ||
      modelId === 'leetcode-42' ||
      modelId === 'trap-rain-water' ||
      modelId === 'trapping-rain-water-42' ||
      modelId === 'class052-water'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 42. 接雨水 (Trapping Rain Water) · 全景推演树',
      badge: '大厂压轴高频之王 & 代码随想录 · 单调递减栈横向切片法 (h * w) / 双指针两端对撞按列计算 / 严格 O(N) 复杂度',
      descriptionHtml: `
        核心目标：给定 <code>n</code> 个非负整数表示每个宽度为 1 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。<br/>
        <strong>《代码随想录》核心精髓——单调栈横向凹槽切片累加公理：</strong><br/>
        1. <strong>单调递减栈性质（由底至顶递减维护左壁）</strong>：<br/>
        • 栈内存储<strong>柱子下标 index</strong>，保持自底向上高度递减；<br/>
        • <strong>凹槽形成三要素</strong>：要想蓄水，必须形成“左壁高 - 槽底低 - 右壁高”的凹坑结构（V 形或 U 形）；<br/>
        • 当前柱子 <code>height[i] &gt; height[stack.top()]</code> 时，说明<strong>右壁出现</strong>，触发凹槽结算！<br/>
        2. <strong>横向分层水体体积计算公式（h * w 几何切片）</strong>：<br/>
        • 弹出槽底：<code>mid = stack.pop()</code>；<br/>
        • 若栈空则左边无支撑墙壁，无法蓄水直接跳过；<br/>
        • 若栈非空，栈顶即为<strong>左壁 <code>left = stack.peek()</code></strong>；<br/>
        • <strong>切片有效水高</strong>：<code>h = Math.min(height[left], height[i]) - height[mid]</code>（木桶短板扣除槽底高度）；<br/>
        • <strong>凹槽横向宽度</strong>：<code>w = i - left - 1</code>（排除左右壁本身的跨度）；<br/>
        • <strong>本层积水量</strong>：<code>volume = h * w</code>，累加至全局总蓄水量！<br/>
        3. <strong>双指针按列对撞（进阶 O(1) 空间）</strong>：左右指针双向对撞，维护 <code>leftMax</code> 与 <code>rightMax</code>，小者一侧按列结算。
      `,
      initialStateText: `接水入口：trap(height) ➔ 初始化 stack = [], totalWater = 0。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '边界退化判定 (Length <= 2)',
        valuesStr: 'height.length <= 2 ➔ 无法构成凹槽蓄水空间，直接 return 0',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '全数组扫描完成 ➔ 栈内剩余单调降序残柱无法闭合蓄水，返回 totalWater',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 遇到低洼持续压栈 (Monotonic Stack Accumulation)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Push Left Wall</span>',
      detailLines: [
        'while (!stack.isEmpty() && height[i] > height[stack.peek()]) {',
        '  // 发现右壁高于栈顶，进入阶段 2 触发横向水层结算',
        '}',
        'stack.push(i); // 维持栈底到栈顶单调递减',
      ],
      fillLine: '筑墙待蓄：连续更低或相等的柱子压入栈内作为潜在槽底或左壁',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 凹槽底出栈与横向水层面积计算 (Horizontal Layer Slicing)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-mono text-[9px]">h * w Slice</span>',
      detailLines: [
        'int mid = stack.pop(); // 弹出凹槽底部',
        'if (stack.isEmpty()) break; // 无左壁支撑，无法蓄水',
        'int left = stack.peek(); // 锁定左壁',
        'int h = Math.min(height[left], height[i]) - height[mid];',
        'int w = i - left - 1;',
        'totalWater += h * w; // 累加横向切片蓄水体积',
      ],
      fillLine: '横向蓄水：以凹槽底为基准，左右两壁较矮者扣除槽底高度作为有效水深',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 双指针对偶模型 (Dual Pointer Column Alternative)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[9px]">Dual Pointer O(1)</span>',
      detailLines: [
        'while (l < r) {',
        '  if (height[l] < height[r]) {',
        '    lMax = Math.max(lMax, height[l]);',
        '    ans += lMax - height[l]; l++;',
        '  } else { ... }',
        '}',
      ],
      fillLine: '竖向对偶：双向对撞按列累加，短板一侧蓄水量仅由自身侧最大高度决定',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '接雨水推演流 (Basin Detection ➔ Left/Right Wall Bounding ➔ Layer Water Slicing)',
      subtitle: 'LeetCode 42 Monotonic Stack & Two-Pointer Water Trapping Paradigms',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '总雨水蓄水体积 totalWater',
      complexityStr: '时间复杂度: O(N) 单趟线性扫描 · 空间复杂度: O(N) 单调栈或 O(1) 双指针',
    });

    return header + baseCase + round + finalReturn;
  }
}
