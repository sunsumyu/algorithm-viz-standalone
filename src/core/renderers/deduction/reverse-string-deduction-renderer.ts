/**
 * 反转字符串 (Reverse String · LeetCode 344)
 * 全景推演树渲染策略 (ReverseStringDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class ReverseStringDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'reverse-string';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'reverse-string' ||
      modelId === '344' ||
      modelId === 'leetcode-344' ||
      modelId === 'reverse-string-two-pointers'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 344. 反转字符串 (Reverse String) · 全景推演树',
      badge: '首尾对撞双指针 · 原地对称交换 · 零额外辅助空间 · 严格 O(N)',
      descriptionHtml: `
        核心目标：将输入的字符数组 <code>s</code> 原地反转，必须使用 $O(1)$ 的额外空间解决这一问题。<br/>
        <strong>《代码随想录》核心教研范式——首尾对撞双指针对称反转：</strong><br/>
        1. <strong>首尾双向对撞指针（Bilateral Inward Pointers）</strong>：<br/>
        设定左指针 <code>left = 0</code> 锚定首部，右指针 <code>right = s.length - 1</code> 锚定尾部；<br/>
        2. <strong>对称交换与单步向中聚拢（Symmetric Swap & Advance）</strong>：<br/>
        当 <code>left < right</code> 时：<br/>
        • 暂存左字符并互换：<code>char temp = s[left]; s[left] = s[right]; s[right] = temp;</code><br/>
        • 左右指针同步向中间聚拢一位：<code>left++, right--;</code><br/>
        3. <strong>奇偶尺寸自适应</strong>：<br/>
        奇数长度中心独占元素天然无需反转，偶数长度指针交叉立即刹车，时间复杂度严格为 $O(N)$，空间严格为 $O(1)$。
      `,
      initialStateText: `反转入口：reverseString(s) ➔ 初始化 int left = 0, right = s.length - 1。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '单字符与空串特判 (Length Guard)',
        valuesStr: 's == null || s.length <= 1 ➔ 原地不变，无需任何交换',
      },
      {
        prefix: '└───',
        label: '对撞相遇终止 (Meeting Termination)',
        valuesStr: '当 left >= right 时对撞完成，所有对称槽位完成 100% 交换',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 双指针定位对称槽位字符 (Locate Symmetric Slots)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Pointers</span>',
      detailLines: [
        'while (left < right) {',
        '  // 锁定 s[left] 与 s[right] 两端对称字符',
      ],
      fillLine: '精准锚定：left 与 right 遥相呼应，分别锁定当前尚未翻转的最外层两端字符',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 暂存变量原地对称交换 (In-Place Swap)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Swap</span>',
      detailLines: [
        '  char temp = s[left];',
        '  s[left] = s[right];',
        '  s[right] = temp;',
      ],
      fillLine: '乾坤挪移：借助标量 temp 瞬间对调两端字符，完成一对待翻转槽位的镜像置换',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 双指针同步向中心聚拢 (Advance Inward)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[9px]">left++ right--</span>',
      detailLines: [
        '  left++;',
        '  right--;',
        '}',
      ],
      fillLine: '步步为营：双向收缩区间，直到相会或错位，保证每个字符恰好仅被处理一次',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '字符串双指针对撞推演流 (Locate Symmetry ➔ In-Place Swap ➔ Advance Inward)',
      subtitle: 'LeetCode 344 Reverse String Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '原地完成反转的字符数组 char[] s',
      complexityStr: '时间复杂度: O(N) 仅需 N/2 次字符交换 · 空间复杂度: O(1) 仅用两个指针与一个 temp',
    });

    return header + baseCase + round + finalReturn;
  }
}
