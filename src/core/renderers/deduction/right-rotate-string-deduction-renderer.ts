/**
 * 右旋转字符串 (Right Rotate String · KamaCoder 55 / 剑指 Offer 58-II)
 * 全景推演树渲染策略 (RightRotateStringDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class RightRotateStringDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'right-rotate-string';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'right-rotate-string' ||
      modelId === 'kama-55' ||
      modelId === 'kamacoder-55' ||
      modelId === 'offer-58-2' ||
      modelId === 'rotate-string-right'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '右旋转字符串 (Right Rotate String) · 全景推演树',
      badge: '三次反转对称变换公理 · 零辅助额外数组 · 原地空间 O(1) · 严格 O(N)',
      descriptionHtml: `
        核心目标：把字符串尾部的若干个字符转移到字符串的前面。给定一个字符串 <code>s</code> 和一个正整数 <code>k</code>，将字符串中后面 <code>k</code> 个字符整体平移到前面。<br/>
        <strong>《代码随想录》核心教研范式——三次反转对称变换公理：</strong><br/>
        不申请额外大数组拼接，直接在原字符数组上通过三次局部反转达成目标：<br/>
        1. <strong>第一步：全局整体反转（Reverse All）</strong>：<br/>
        反转整个字符串 <code>[0, n - 1]</code>。这一步将原先在尾部的后 $k$ 个字符成功移动到数组的前半段（但字符顺序呈倒序）；<br/>
        2. <strong>第二步：局部前 k 个字符反转（Reverse First k）</strong>：<br/>
        反转区间 <code>[0, k - 1]</code>，将移到头部的目标字符顺序拨正恢复正常；<br/>
        3. <strong>第三步：局部后 n-k 个字符反转（Reverse Remaining）</strong>：<br/>
        反转区间 <code>[k, n - 1]</code>，将原先在前半段被挤到后方的字符顺序拨正恢复正常。<br/>
        三次反转后，字符串完美达成右旋转，且空间复杂度严格收敛为 $O(1)$！
      `,
      initialStateText: `旋转入口：rightRotate(s, k) ➔ 全局整体反转 [0, n-1] ➔ 前段反转 [0, k-1] ➔ 后段反转 [k, n-1]。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '整除周期特判 (Modulo Guard)',
        valuesStr: 'k = k % n ➔ 若 k == 0 则代表旋转整周，原字符串形态保持完全不变',
      },
      {
        prefix: '└───',
        label: '对称旋转公理 (Symmetric Shift Invariant)',
        valuesStr: '全局反转交换两段宏观归属 + 局部反转复原微观字母序列 = 原位无损循环平移',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 全局反转将尾部目标块颠倒跃迁至头部 (Global Reverse)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Reverse [0, n-1]</span>',
      detailLines: [
        'reverse(chars, 0, n - 1);',
      ],
      fillLine: '宏观对调：将原本处于尾部的 k 个字符颠倒搬迁至前沿，前 n-k 个字符颠倒后撤至尾部',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 局部反转头部 k 个字符恢复正序 (Reverse First k Characters)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Reverse [0, k-1]</span>',
      detailLines: [
        'reverse(chars, 0, k - 1);',
      ],
      fillLine: '前段拨正：头部 k 个字符内部进行对撞反转，使这部分新移来的字符序列恢复正常阅读顺序',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 局部反转后 n-k 个字符恢复正序 (Reverse Tail Characters)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Reverse [k, n-1]</span>',
      detailLines: [
        'reverse(chars, k, n - 1);',
      ],
      fillLine: '后段拨正：剩余字符内部进行对撞反转，同样恢复其原有的相对正序，至此全局旋转圆满落地',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '右旋转三次反转推演流 (Global Reverse ➔ Reverse Head k ➔ Reverse Tail n-k)',
      subtitle: 'KamaCoder 55 & LeetCode Offer 58-II Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '右旋转 k 位后的目标字符串',
      complexityStr: '时间复杂度: O(N) 每个字符被对撞交换两次 · 空间复杂度: O(1) 字符数组原地操作',
    });

    return header + baseCase + round + finalReturn;
  }
}
