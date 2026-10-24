/**
 * 反转字符串 II (Reverse String II · LeetCode 541)
 * 全景推演树渲染策略 (ReverseStringIIDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class ReverseStringIIDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'reverse-string-ii';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'reverse-string-ii' ||
      modelId === '541' ||
      modelId === 'leetcode-541' ||
      modelId === 'reverse-string-2'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 541. 反转字符串 II (Reverse String II) · 全景推演树',
      badge: '步长 2k 跨步跳跃 · 前 k 个字符局部反转 · 动态边界截断 · 严格 O(N)',
      descriptionHtml: `
        核心目标：给定一个字符串 <code>s</code> 和一个整数 <code>k</code>，每隔 $2k$ 个字符，就反转这 $2k$ 字符中的前 $k$ 个字符。<br/>
        若剩余少于 $k$ 个字符，则全部反转；若在 $k \sim 2k$ 之间，则反转前 $k$ 个字符。<br/>
        <strong>《代码随想录》核心教研范式——步长 2k 跃迁与动态截断：</strong><br/>
        1. <strong>告别低效计数器，采用步长跃迁</strong>：<br/>
        不需要逐个字符递增计数，直接采用 <code>for (int i = 0; i < n; i += 2 * k)</code> 进行分段跳跃，从根源上简化循环状态机；<br/>
        2. <strong>动态右边界计算公式</strong>：<br/>
        反转窗口的左边界为 <code>left = i</code>，右边界为 <code>right = Math.min(i + k - 1, n - 1)</code>。<br/>
        • 若 <code>i + k - 1 < n</code>：恰好反转满 $k$ 个字符；<br/>
        • 若 <code>i + k - 1 >= n</code>：说明尾部剩余不足 $k$ 个，<code>Math.min</code> 自动收缩至尾端 <code>n - 1</code>，将剩余部分全额反转；<br/>
        3. <strong>复用双指针原地反转</strong>：<br/>
        对每一个有效子区间 <code>[left, right]</code>，直接复用经典对撞双指针进行对称交换。
      `,
      initialStateText: `反转入口：reverseStr(s, k) ➔ char[] a = s.toCharArray()，主循环 i += 2 * k。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '单字符与 k 特判 (Boundary Guard)',
        valuesStr: 'k == 1 || s.length <= 1 ➔ 原串不变或退化为全串反转',
      },
      {
        prefix: '└───',
        label: '跨度跃迁终止 (Step Invariant)',
        valuesStr: '每次推进 2k，当 i >= n 时跳出循环，尾部余量已由 Math.min 完整覆盖',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 步长 2k 跳跃与动态右边界裁切 (2k Step & Min Right)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">i += 2k</span>',
      detailLines: [
        'for (int i = 0; i < a.length; i += 2 * k) {',
        '  int start = i;',
        '  int end = Math.min(i + k - 1, a.length - 1); // 自动截断越界',
      ],
      fillLine: '定界开窗：以 2k 为一个周期锚定窗口起点，右界取 i + k - 1 与数组末尾的较小值',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 局部区间双指针对称交换 (Local Inward Swap)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Local Swap</span>',
      detailLines: [
        '  while (start < end) {',
        '    char temp = a[start]; a[start] = a[end]; a[end] = temp;',
        '    start++; end--;',
        '  }',
        '}',
      ],
      fillLine: '精准反转：对前 k 个（或末尾残存）字符执行原地对撞反转，后 k 个字符自然保持原序',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 重组字符数组交付目标字符串 (Construct Result)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[9px]">new String</span>',
      detailLines: [
        'return new String(a);',
      ],
      fillLine: '圆满交付：将原地置换完成的字符数组包裹为全新 String 交付',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '分段反转推演流 (Step 2k ➔ Min Right Bound ➔ Local Swap ➔ Settle)',
      subtitle: 'LeetCode 541 Reverse String II Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '分段反转后的字符串',
      complexityStr: '时间复杂度: O(N) 每个字符最多被交换一次 · 空间复杂度: O(1) 仅复用字符数组',
    });

    return header + baseCase + round + finalReturn;
  }
}
