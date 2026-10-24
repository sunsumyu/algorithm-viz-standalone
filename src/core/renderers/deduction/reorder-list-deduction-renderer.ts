/**
 * 重排链表 (Reorder List · LeetCode 143 / Class 034)
 * 全景推演树渲染策略 (ReorderListDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class ReorderListDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'reorder-list';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'reorder-list' ||
      modelId === '143' ||
      modelId === 'leetcode-143' ||
      modelId === 'reorder-list-034' ||
      modelId === 'class034-code03'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 143. 重排链表 (Reorder List) · 全景推演树',
      badge: '大厂综合真题王 & 左程云 Class 034 · 快慢指针寻中点 / 原地反转后半段 / 穿针引线交错合并 / 极致 O(1) 空间',
      descriptionHtml: `
        核心目标：给定一个单链表 <code>L: L0 ➔ L1 ➔ … ➔ Ln-1 ➔ Ln</code>，将其重新排列后变为：<code>L0 ➔ Ln ➔ L1 ➔ Ln-1 ➔ L2 ➔ Ln-2 ➔ …</code>。<br/>
        <strong>左程云【必备篇】Class 034 核心精髓——链表三大经典操作集大成者：</strong><br/>
        1. <strong>阶段 1（快慢指针寻中点并分链）</strong>：<br/>
        • 慢指针走 1 步，快指针走 2 步，精准定位链表上中点 <code>mid</code>；<br/>
        • 将链表从中点断开：<code>head2 = mid.next; mid.next = null;</code>，分割为左右两个独立子链表！<br/>
        2. <strong>阶段 2（后半段链表原地反转）</strong>：<br/>
        • 对 <code>head2</code> 启动四步指针掉头反转，将 <code>Ln ➔ Ln-1 ➔ ...</code> 原地反转；<br/>
        3. <strong>阶段 3（双指针穿针引线交叉缝合）</strong>：<br/>
        • <code>p1 = head, p2 = reversedHead2</code>；<br/>
        • 暂存后继：<code>next1 = p1.next; next2 = p2.next;</code>；<br/>
        • 交叉重挂：<code>p1.next = p2; p2.next = next1;</code>；<br/>
        • 同步滑步：<code>p1 = next1; p2 = next2;</code>；<br/>
        • 重复上述交叉插入，直至链表完全重排完成！
      `,
      initialStateText: `重排入口：reorderList(head) ➔ 启动分链、反转与交叉重织三部曲。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '边界判空退化 (Length <= 2)',
        valuesStr: 'head == null || head.next == null || head.next.next == null ➔ 拓扑结构无须重排，直接返回',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: 'p2 == null ➔ 右半部分节点全部穿插完毕，重排大功告成',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 快慢指针寻中点并切断 (Find Mid & Split)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Step 1: Split</span>',
      detailLines: [
        'ListNode slow = head, fast = head;',
        'while (fast.next != null && fast.next.next != null) {',
        '  slow = slow.next; fast = fast.next.next;',
        '}',
        'ListNode head2 = slow.next;',
        'slow.next = null; // 斩断一分为二',
      ],
      fillLine: '拦腰截断：前半段保留 [L0..Lmid]，后半段提取 [Lmid+1..Ln]',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 后半段原地指针反转 (Reverse Second Half)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Step 2: Reverse</span>',
      detailLines: [
        'ListNode pre = null, cur = head2;',
        'while (cur != null) {',
        '  ListNode next = cur.next; cur.next = pre; pre = cur; cur = next;',
        '}',
        'head2 = pre; // 后半段变为 [Ln, Ln-1, ...]',
      ],
      fillLine: '掉头反向：后半段倒置，尾部元素 Ln 成为第二链表的头节点',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 双指针穿针引线交叉合并 (Zipper Interleave)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Step 3: Interleave</span>',
      detailLines: [
        'ListNode p1 = head, p2 = head2;',
        'while (p2 != null) {',
        '  ListNode next1 = p1.next; ListNode next2 = p2.next;',
        '  p1.next = p2; p2.next = next1; // 交叉插入',
        '  p1 = next1; p2 = next2;',
        '}',
      ],
      fillLine: '拉链咬合：左一个、右一个依次交替穿插，构建拉链式完美结构',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '重排链表推演流 (Mid Split ➔ Half Reversal ➔ Zipper Interleaving)',
      subtitle: 'LeetCode 143 & Zuoshen Class 034 Reorder List Synthesis',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '就地重排后的原链表 (In-place Reordered List)',
      complexityStr: '时间复杂度: O(N) 严格三趟线性扫描 · 空间复杂度: O(1) 仅需指针原地重连',
    });

    return header + baseCase + round + finalReturn;
  }
}
