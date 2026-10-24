/**
 * 反转链表 (Reverse Linked List · LeetCode 206 / Class 034)
 * 全景推演树渲染策略 (ReverseLinkedListDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class ReverseLinkedListDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'reverse-linked-list';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'reverse-linked-list' ||
      modelId === '206' ||
      modelId === 'leetcode-206' ||
      modelId === 'reverse-linked-list-034' ||
      modelId === 'class034-code01' ||
      modelId === 'reverse-list'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 206. 反转链表 (Reverse Linked List) · 全景推演树',
      badge: '代码随想录 & 左程云 Class 034 · 双指针迭代反转 / 后序递归回溯换向 / 双向链表镜像互换 / 严格 O(1) 原地空间',
      descriptionHtml: `
        核心目标：给你单链表的头节点 <code>head</code>，请你反转链表，并返回反转后的链表头节点。<br/>
        <strong>《代码随想录》与左程云算法体系教学核心——指针换向四部曲与防止断链公理：</strong><br/>
        1. <strong>双指针迭代换向四部曲（核心考点 · Stage 1）</strong>：<br/>
        指针一旦掉头指向前驱 <code>cur.next = pre</code>，原链表后续所有节点将会瞬间失去索引从内存中凭空丢失（断链）！<br/>
        因此每一次迭代必须严格遵循<strong>不可逆四步心法</strong>：<br/>
        • <strong>第 ① 步（暂存后继）</strong>：<code>next = cur.next</code>（死死锁住后继节点）；<br/>
        • <strong>第 ② 步（指针掉头）</strong>：<code>cur.next = pre</code>（实现局部指针原地掉头反向指向）；<br/>
        • <strong>第 ③ 步（前驱推进）</strong>：<code>pre = cur</code>（前驱指针滑步到当前位置）；<br/>
        • <strong>第 ④ 步（当前推进）</strong>：<code>cur = next</code>（当前指针无缝进入下一个待反转节点）。<br/>
        当 <code>cur == null</code> 触及链表末尾出界时，<code>pre</code> 恰好精准停在原链表最后一个节点，即为<strong>反转后的新头节点</strong>！<br/>
        2. <strong>后序递归回溯法（自底向上 · Stage 2）</strong>：<br/>
        递归深潜至链表最后一个有效节点 <code>newHead</code> 并作为全局根保留返回；在归约出栈过程中，令 <code>head.next.next = head</code>，并断开原指针 <code>head.next = null</code>！<br/>
        3. <strong>双向链表镜像反转（Class 034 拓展）</strong>：<br/>
        每个节点同时拥有 <code>prev</code> 与 <code>next</code>，每次仅需原地交换两指针：<code>temp = cur.next; cur.next = cur.prev; cur.prev = temp;</code>。
      `,
      initialStateText: `反转入口：reverseList(head) ➔ 初始化 pre = null, cur = head, 启动指针滑动反转。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '边界退化基准 (Base Null/Single)',
        valuesStr: 'head == null || head.next == null ➔ 无须反转，直接 return head',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: 'cur == null ➔ 全链所有节点均已成功反转，pre 晋升为新链表头节点',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 双指针滑动换向四部曲 (Two-Pointer Iterative)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Iterative O(1)</span>',
      detailLines: [
        'ListNode next = cur.next; // ① 暂存后继防止断链',
        'cur.next = pre;          // ② 原地换向，掉头指向 pre',
        'pre = cur;               // ③ pre 前驱滑步前进',
        'cur = next;              // ④ cur 当前指针滑步前进',
      ],
      fillLine: '步步为营：双指针同步向右滑步，每次仅重连一条指针，严格 O(1) 辅助空间',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 后序递归回溯接驳 (Postorder Recursion)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Recursion O(N)</span>',
      detailLines: [
        'ListNode newHead = reverseList(head.next); // 探底搜集新头节点',
        'head.next.next = head; // 归约：令后继节点反向指回当前节点',
        'head.next = null;      // 斩断原正向指针，彻底消除环形死锁',
        'return newHead;',
      ],
      fillLine: '自底向上：利用系统调用栈先探底再反向缝合，代码极其凝练',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 双向链表前后驱镜像互换 (Doubly Linked Reverse)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[9px]">Doubly List</span>',
      detailLines: [
        'next = cur.next;',
        'cur.next = cur.prev; cur.prev = next; // 交换前后指针',
        'pre = cur; cur = next;',
      ],
      fillLine: '前后镜像：双向指针完全对称交换，单次遍历直接完成双向翻转',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '反转链表推演流 (Two-Pointer Sliding ➔ Recursive Unfolding ➔ Doubly Flip)',
      subtitle: 'LeetCode 206 & Zuoshen Class 034 Reverse Linked List Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return pre; // 已经完全调转方向的新单向链表头节点',
      answerDescription: '时间复杂度严格为 O(N)，迭代法空间复杂度为 O(1)，是算法面试与链表操作的基石中的基石。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
