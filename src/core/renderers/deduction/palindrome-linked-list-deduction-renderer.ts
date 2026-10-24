/**
 * 回文链表 (Palindrome Linked List · LeetCode 234 / Class 034)
 * 全景推演树渲染策略 (PalindromeLinkedListDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class PalindromeLinkedListDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'palindrome-linked-list';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'palindrome-linked-list' ||
      modelId === 'palindrome-linked-list-034' ||
      modelId === '234' ||
      modelId === 'leetcode-234' ||
      modelId === 'class034-code02' ||
      modelId === 'palindrome-list'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 234. 回文链表 (Palindrome Linked List) · 全景推演树',
      badge: '左程云 Class 034 & 代码随想录 · 极致 O(1) 空间四步法 / 快慢指针找中点 / 原地反转后半段 / 无损拓扑复原',
      descriptionHtml: `
        核心目标：给你一个单链表的头节点 <code>head</code>，请你判断该链表是否为<strong>回文链表</strong>。如果是，返回 <code>true</code>；否则，返回 <code>false</code>。<br/>
        <strong>左程云【必备篇】Class 034 核心精髓——面试标杆级 O(1) 空间四步法：</strong><br/>
        1. <strong>阶段 1（快慢指针精准定位中点）</strong>：<br/>
        • <code>slow = head, fast = head</code>；<br/>
        • 循环条件：<code>while (fast.next != null && fast.next.next != null)</code>；<br/>
        • <code>slow = slow.next; fast = fast.next.next;</code>；<br/>
        • 循环退出时，对于奇数长度链表，<code>slow</code> 停在正中点；对于偶数长度，<code>slow</code> 停在<strong>上中点</strong>！<br/>
        2. <strong>阶段 2（后半段链表原地反转）</strong>：<br/>
        • 以 <code>slow.next</code> 为起点执行反向掉头反转；<br/>
        • 令后半段末尾节点成为新的头节点 <code>tail</code>，并断开 <code>slow.next = null</code>；<br/>
        3. <strong>阶段 3（双向向中对撞比对）</strong>：<br/>
        • <code>p1 = head, p2 = tail</code> 同时向中间滑动比对；<br/>
        • 若 <code>p1.val != p2.val</code>，判定不是回文；<br/>
        4. <strong>阶段 4（工程级无副作用复原）</strong>：<br/>
        • <strong>面试绝杀考点</strong>：查询方法严禁破坏原数据结构！再次反转后半段，将 <code>slow.next</code> 接回原后半段，彻底复原链表原始拓扑结构后返回结果。
      `,
      initialStateText: `回文入口：isPalindrome(head) ➔ slow/fast 就位探寻中点。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '边界退化基准 (Single or Empty)',
        valuesStr: 'head == null || head.next == null ➔ 天然回文，直接 return true',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: 'p2 == null ➔ 后半部分与前半部分比对完毕，无任何失配则为回文',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 快慢指针寻中点 (Locate Mid / Upper-Mid)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Step 1: Mid</span>',
      detailLines: [
        'ListNode slow = head, fast = head;',
        'while (fast.next != null && fast.next.next != null) {',
        '  slow = slow.next;      // 慢指针走 1 步',
        '  fast = fast.next.next; // 快指针走 2 步',
        '}',
      ],
      fillLine: '精准制导：快指针抵达尾部或尾前驱时，慢指针精准锁定分水岭中点',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 后半段原地指针反转 (In-place Reverse Second Half)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Step 2: Reverse</span>',
      detailLines: [
        'ListNode cur = slow.next, pre = null;',
        'while (cur != null) {',
        '  ListNode next = cur.next;',
        '  cur.next = pre; pre = cur; cur = next;',
        '}',
        'slow.next = null; // 斩断中点后继，分割前后链',
      ],
      fillLine: '拓扑折叠：让后半段所有指针全部倒转朝向中点，pre 成为右端点头节点',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 3: 双向向中比对 (Bilateral Inward Compare)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Step 3: Compare</span>',
      detailLines: [
        'ListNode p1 = head, p2 = pre; boolean isPalin = true;',
        'while (p2 != null) {',
        '  if (p1.val != p2.val) { isPalin = false; break; }',
        '  p1 = p1.next; p2 = p2.next;',
        '}',
      ],
      fillLine: '镜像核对：左指针由首至中、右指针由尾至中，逐位数值严格比对',
    });

    const step4 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 4: 拓扑无损复原与返回 (Non-destructive Restoration)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[9px]">Step 4: Restore</span>',
      detailLines: [
        'cur = pre; pre = null;',
        'while (cur != null) { // 再次反转后半段',
        '  ListNode next = cur.next; cur.next = pre; pre = cur; cur = next;',
        '}',
        'slow.next = pre; // 恢复连接，链表完好如初',
        'return isPalin;',
      ],
      fillLine: '工程严谨：反转后半段复原链表原始形态，对外不产生任何副作用',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '回文链表推演流 (Mid Finding ➔ Half Reversal ➔ Symmetrical Compare ➔ Invariant Restore)',
      subtitle: 'LeetCode 234 & Zuoshen Class 034 Palindrome Linked List Masterclass',
      innerStepsHtml: step1 + step2 + step3 + step4,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '判定布尔值 (true / false) 并保证原链表结构完全复原',
      complexityStr: '时间复杂度: O(N) 仅历经两次遍历 · 空间复杂度: O(1) 严格原地常数空间',
    });

    return header + baseCase + round + finalReturn;
  }
}
