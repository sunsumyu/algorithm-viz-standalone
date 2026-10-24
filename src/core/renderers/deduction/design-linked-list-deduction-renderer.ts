/**
 * 设计链表 (Design Linked List · LeetCode 707)
 * 全景推演树渲染策略 (DesignLinkedListDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class DesignLinkedListDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'design-linked-list';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'design-linked-list' ||
      modelId === '707' ||
      modelId === 'leetcode-707' ||
      modelId === 'my-linked-list'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 707. 设计链表 (Design Linked List) · 全景推演树',
      badge: '代码随想录核心基石 · 哨兵虚拟头节点 dummyHead / 统一增删查改 (CRUD) 前驱定位模型 / 严格边界守卫',
      descriptionHtml: `
        核心目标：设计链表的实现。您可以选择使用单链表或双链表。单链表中的节点应该具有两个属性：<code>val</code> 和 <code>next</code>。<br/>
        <strong>《代码随想录》教学核心——哨兵假头统一一切 CRUD 操作的前驱公理：</strong><br/>
        1. <strong>哨兵假头（dummyHead 守卫一切索引操作）</strong>：<br/>
        • 内部维护 <code>dummyHead = new Node(0)</code> 和计数器 <code>size = 0</code>；<br/>
        • <strong>统一前驱定理</strong>：链表中的第 <code>index</code> 个节点（从 0 开始计数），其<strong>直接前驱节点</strong>恰好是从 <code>dummyHead</code> 出发向后走 <code>index</code> 步！<br/>
        2. <strong>四项标准 CRUD 原语</strong>：<br/>
        • <strong>查找 <code>get(index)</code></strong>：越界检查 <code>index < 0 || index >= size</code> 返回 -1；从 <code>dummyHead.next</code> 步进 <code>index</code> 步；<br/>
        • <strong>插入 <code>addAtIndex(index, val)</code></strong>：定位前驱 <code>pred</code>（走 <code>index</code> 步），<code>newNode.next = pred.next; pred.next = newNode; size++;</code>；<br/>
        • <strong>删除 <code>deleteAtIndex(index)</code></strong>：定位前驱 <code>pred</code>（走 <code>index</code> 步），<code>pred.next = pred.next.next; size--;</code>；<br/>
        • <strong>头尾插入衍生</strong>：<code>addAtHead(val) = addAtIndex(0, val)</code>，<code>addAtTail(val) = addAtIndex(size, val)</code>。
      `,
      initialStateText: `系统入口：MyLinkedList() ➔ 初始化 dummyHead 与 size = 0。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '合法性边界防御 (Index Boundary Guard)',
        valuesStr: 'index < 0 || index >= size ➔ 非法越界直接防御拦截，避免空指针崩溃',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: 'pred 定位完成 ➔ O(1) 指针穿插完成增删，维护 size 计数器一致性',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 哨兵头索引寻址 (Predecessor Seek via dummyHead)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Seek pred</span>',
      detailLines: [
        'Node pred = dummyHead;',
        'for (int i = 0; i < index; i++) {',
        '  pred = pred.next; // 从 dummyHead 向前走 index 步必为前驱',
        '}',
      ],
      fillLine: '前驱定理：无论操作第 0 个节点还是尾部，dummyHead 确保前驱恒存在',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 原地插入新节点 (addAtIndex Pointer Wiring)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Insert O(1)</span>',
      detailLines: [
        'Node toAdd = new Node(val);',
        'toAdd.next = pred.next; // 先连后继',
        'pred.next = toAdd;      // 再接前驱',
        'size++;                 // 维护长度',
      ],
      fillLine: '先连后断：新节点 next 指向原后继，前驱 next 指向新节点，严防断链',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 跨越剔除节点 (deleteAtIndex Bypass)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[9px]">Delete O(1)</span>',
      detailLines: [
        'pred.next = pred.next.next; // 跨越被删节点',
        'size--;                     // 减少长度',
      ],
      fillLine: '架空释放：前驱直接连接待删节点的下下个节点，直接脱壳剔除',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '设计链表 CRUD 推演流 (Dummy Sentinel ➔ Predecessor Navigation ➔ Atomic Pointer Wiring)',
      subtitle: 'LeetCode 707 Design Linked List Architecture',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '链表 CRUD 操作执行成功或查询值',
      complexityStr: '时间复杂度: 头增 O(1), 其余按索引 O(Index) · 空间复杂度: O(1) 仅需局部指针',
    });

    return header + baseCase + round + finalReturn;
  }
}
