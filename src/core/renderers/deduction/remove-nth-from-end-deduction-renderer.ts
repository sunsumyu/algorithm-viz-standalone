/**
 * 删除链表的倒数第 N 个结点 (Remove Nth Node From End of List · LeetCode 19)
 * 全景推演树渲染策略 (RemoveNthFromEndDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class RemoveNthFromEndDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'remove-nth-from-end';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'remove-nth-from-end' ||
      modelId === '19' ||
      modelId === 'leetcode-19' ||
      modelId === 'remove-nth-node'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 19. 删除链表的倒数第 N 个结点 · 全景推演树',
      badge: '代码随想录经典高频题 · 虚拟哨兵头节点 dummyHead / 双指针固定间距 (n+1) 一趟扫描 / 零头节点特判',
      descriptionHtml: `
        核心目标：给你一个链表，删除链表的倒数第 <code>n</code> 个结点，并且返回链表的头结点。<br/>
        <strong>《代码随想录》核心精髓——哨兵节点与双指针定距滑动窗口模型：</strong><br/>
        1. <strong>虚拟头节点哨兵机制（dummyHead 消除特判公理）</strong>：<br/>
        链表单向结点的删除必须依赖其<strong>直接前驱节点</strong>（<code>pre.next = pre.next.next</code>）。<br/>
        如果要删除的恰好是第一个节点（头节点 <code>head</code>），普通链表没有前驱，必须编写冗余的 <code>if (head == target)</code> 特判逻辑。<br/>
        引入 <code>dummyHead.next = head</code> 后，原链表每个节点（包括 head）都统一拥有了直接前驱，彻底消除所有头节点特判！<br/>
        2. <strong>快慢双指针固定窗口间距（n + 1 步先驱法）</strong>：<br/>
        • <strong>第 ① 步（拉开定长窗口）</strong>：<code>fast</code> 与 <code>slow</code> 均从 <code>dummyHead</code> 出发。<code>fast</code> 先行走 <code>n + 1</code> 步；<br/>
        • <strong>第 ② 步（定距同步平移）</strong>：<code>fast</code> 与 <code>slow</code> 同时每次向前移动 1 步，两指针间距恒定为 <code>n + 1</code>；<br/>
        • <strong>第 ③ 步（精准命中前驱）</strong>：当 <code>fast</code> 触及链表尽头 <code>null</code> 时，<code>slow</code> 恰好精准停在<strong>待删除结点的直接前驱</strong>上！<br/>
        • <strong>第 ④ 步（指针跨越剔除）</strong>：执行 <code>slow.next = slow.next.next</code>，瞬间将倒数第 n 个结点移出链表；返回 <code>dummyHead.next</code>！
      `,
      initialStateText: `删除入口：removeNthFromEnd(head, n) ➔ 创建 dummyHead，fast 与 slow 就位。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '哨兵头构建 (Dummy Head Invariant)',
        valuesStr: 'ListNode dummyHead = new ListNode(0, head); fast = dummyHead, slow = dummyHead',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: 'fast == null ➔ 扫描结束，slow.next 即为被斩断目标节点',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 快指针拉开间距 (Fast Advance n+1 Steps)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Gap: n+1</span>',
      detailLines: [
        'for (int i = 0; i <= n; i++) {',
        '  fast = fast.next; // fast 先行走 n + 1 步',
        '}',
      ],
      fillLine: '定距标定：让 fast 与 slow 之间拉出长度为 n+1 的固定滑动窗格',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 双指针同步滑窗平移 (Synchronous Sliding)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">O(N) One Pass</span>',
      detailLines: [
        'while (fast != null) {',
        '  fast = fast.next;',
        '  slow = slow.next; // 同速跟进，慢指针时刻比快指针落后 n+1',
        '}',
      ],
      fillLine: '窗格平移：双指针以相同速度前进，直至 fast 抵达链表末尾的 null',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 跨越缝合删除与释放 (Pointer Bypass Deletion)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[9px]">Bypass Re-wire</span>',
      detailLines: [
        'ListNode target = slow.next;',
        'slow.next = slow.next.next; // 斩断待删节点前驱指针，直连后继',
        'target.next = null;         // 隔离释放内存',
        'return dummyHead.next;      // 返回哨兵头后继',
      ],
      fillLine: '指针重挂：仅需一次 next 跳跃指针赋值，严格 O(1) 原地删除',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '倒数节点删除推演流 (Dummy Sentinel ➔ Gap Unfolding ➔ Direct Bypass)',
      subtitle: 'LeetCode 19 One-Pass Fixed Window Two-Pointer Algorithm',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '新链表头节点 (dummyHead.next)',
      complexityStr: '时间复杂度: O(N) 仅单趟扫描 · 空间复杂度: O(1) 仅需 dummy 与快慢指针',
    });

    return header + baseCase + round + finalReturn;
  }
}
