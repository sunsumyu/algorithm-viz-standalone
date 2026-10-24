/**
 * 有序链表合并 (Merge Two Sorted Lists · LeetCode 21 / Class 038)
 * 全景推演树渲染策略 (MergeSortedListsDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class MergeSortedListsDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'merge-sorted-lists';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'merge-sorted-lists' ||
      modelId === 'merge-sorted-lists-038' ||
      modelId === 'merge-two-sorted-lists' ||
      modelId === 'merge-two-sorted-lists-21' ||
      modelId === '21' ||
      modelId === 'leetcode-21' ||
      modelId === 'class038-code01' ||
      modelId === 'class007-code01'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 21. 合并两个有序链表 (Merge Two Sorted Lists) · 全景推演树',
      badge: '左程云 Class 038 & 代码随想录 · 虚拟头节点哨兵机制 / 双指针贪心归并 / 尾部剩余段常数时间直连 / 极致 O(1) 空间',
      descriptionHtml: `
        核心目标：将两个升序链表合并为一个新的<strong>升序</strong>链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。<br/>
        <strong>左程云算法体系教学核心——哨兵假头与双指针贪心缝合：</strong><br/>
        1. <strong>虚拟头节点（dummyHead 简化尾插公理）</strong>：<br/>
        初始化 <code>dummyHead = new ListNode(0)</code>，并将尾指针 <code>tail = dummyHead</code>。<br/>
        每次比较两个待归并链表的当前头部 <code>p1</code> 与 <code>p2</code>，将较小者接在 <code>tail.next</code> 上，并推进对应指针与 <code>tail</code>！<br/>
        2. <strong>剩余链条直接挂接（消除逐一搬运）</strong>：<br/>
        当某一个链表先触底遍历完毕时，另一链表后续必然也是单调递增的，无须继续循环拆解，直接执行 <code>tail.next = (p1 != null) ? p1 : p2;</code> 即可完成整段接入！<br/>
        3. <strong>O(1) 原地归并</strong>：全过程不申请任何新节点，仅重构指针指向。
      `,
      initialStateText: `合并入口：mergeTwoLists(l1, l2) ➔ 创建 dummyHead，tail 指向 dummyHead 就绪。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '边界判空退化 (Null Inputs)',
        valuesStr: 'l1 == null ? return l2 : (l2 == null ? return l1 : proceed)',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: 'p1 == null || p2 == null ➔ 循环结束，剩余单链一次性直连',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 哨兵头与指针就位 (Dummy Sentinel Init)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Init Sentinel</span>',
      detailLines: [
        'ListNode dummyHead = new ListNode(0);',
        'ListNode tail = dummyHead;',
        'ListNode p1 = l1, p2 = l2;',
      ],
      fillLine: '哨兵机制：以 dummy 消除首节点赋值特判，统一尾插操作模型',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 双指针贪心选择较小者 (Greedy Selection)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">O(N+M) Merge</span>',
      detailLines: [
        'while (p1 != null && p2 != null) {',
        '  if (p1.val <= p2.val) {',
        '    tail.next = p1; p1 = p1.next;',
        '  } else {',
        '    tail.next = p2; p2 = p2.next;',
        '  }',
        '  tail = tail.next;',
        '}',
      ],
      fillLine: '贪心比对：步步为营，每次吸纳数值更小的前沿节点进入主链',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 尾部未尽链表直挂接 (Bypass Remainder)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[9px]">O(1) Remainder</span>',
      detailLines: [
        'tail.next = (p1 != null) ? p1 : p2; // 剩余未尽段整链拼接',
        'return dummyHead.next;',
      ],
      fillLine: '高效连接：剩余链表本身有序，一步指针赋值完成合并',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '有序链表合并推演流 (Sentinel Setup ➔ Greedy Dual Merge ➔ Tail Connection)',
      subtitle: 'LeetCode 21 & Zuoshen Class 038 Merge Two Sorted Lists Paradigms',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '新有序链表头节点 (dummyHead.next)',
      complexityStr: '时间复杂度: O(N + M) 线性扫描 · 空间复杂度: O(1) 严格原地常数内存',
    });

    return header + baseCase + round + finalReturn;
  }
}
