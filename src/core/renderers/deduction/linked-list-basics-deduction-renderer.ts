/**
 * 单双链表基本功与栈队列实现 (Linked List Basics · Class 006)
 * 全景推演树渲染策略 (LinkedListBasicsDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class LinkedListBasicsDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'linked-list-basics';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'linked-list-basics' ||
      modelId === 'linked-list-basics-006' ||
      modelId === 'class006-code01' ||
      modelId === 'class006-code02'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '左程云 Class 006. 单双链表基本功与栈队列实现 · 全景推演树',
      badge: '左程云算法入门必备篇 Class 006 · 单双链表就地反转 / 删除指定值节点 / 双向链表实现 FIFO 队列与 LIFO 栈',
      descriptionHtml: `
        核心目标：掌握单链表与双向链表核心底层数据结构三大基本功与操作原语。<br/>
        <strong>左程云算法通关课入门篇 Class 006 教学核心：</strong><br/>
        1. <strong>单双链表就地反转公理</strong>：<br/>
        • 单链表反转：<code>next = cur.next; cur.next = pre; pre = cur; cur = next;</code>；<br/>
        • 双链表反转：每个节点同时交换 <code>cur.next</code> 与 <code>cur.prev</code>；<br/>
        2. <strong>删除指定值节点（头部连续退化与中间剔除）</strong>：<br/>
        • <strong>阶段 ①（越过头部连续待删点）</strong>：<code>while (head != null && head.val == val) head = head.next;</code>；<br/>
        • <strong>阶段 ②（遍历中间并剔除）</strong>：维护 <code>pre</code> 与 <code>cur</code>，命中时 <code>pre.next = cur.next</code>，否则 <code>pre = cur</code>；<br/>
        3. <strong>双向链表实现队列与栈</strong>：<br/>
        • 维护 <code>head</code> 与 <code>tail</code>；头部入队/尾部出队均为 <code>O(1)</code>，天然支持双端队列 (Deque)。
      `,
      initialStateText: `基础入口：初始化单链表与双向链表操作上下文。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空链表基底判定 (Empty Base)',
        valuesStr: 'head == null ➔ 链表无须任何操作，直接返回 null',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: 'cur == null ➔ 单向指针完成整链遍历，所有操作就地闭环',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 单链表与双向链表原地掉头反转 (In-place Reversal)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Reversal O(1)</span>',
      detailLines: [
        'while (cur != null) {',
        '  next = cur.next;',
        '  cur.next = pre;',
        '  // 若为双向链表同时赋: cur.prev = next;',
        '  pre = cur; cur = next;',
        '}',
      ],
      fillLine: '指针对调：不申请任何额外节点，三指针滑动实现指针掉头',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 过滤并删除指定目标值节点 (Delete Target Value)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Delete Val</span>',
      detailLines: [
        'while (head != null && head.val == num) head = head.next; // 跳过头部目标',
        'Node pre = head, cur = head != null ? head.next : null;',
        'while (cur != null) {',
        '  if (cur.val == num) pre.next = cur.next; else pre = cur;',
        '  cur = cur.next;',
        '}',
      ],
      fillLine: '双段清洗：先确定有效头节点，再单趟扫描剔除中间所有目标值节点',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 双向链表构建 FIFO 队列与 LIFO 栈 (Queue & Stack)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">O(1) Push/Pop</span>',
      detailLines: [
        'push / offer: tail.next = node; node.prev = tail; tail = node;',
        'pop / poll:   head = head.next; if (head != null) head.prev = null;',
        '严格 O(1) 尾部追加与头部弹出，零扩容拷贝开销',
      ],
      fillLine: '高阶复用：以常数时间代价构建任意标准线性容器',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '链表基本功推演流 (In-Place Reversal ➔ Value Deletion ➔ Double-Ended Queue)',
      subtitle: 'Zuoshen Class 006 Core Linked List Fundamentals',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '新链表头节点 (New Head) 或容器出队元素',
      complexityStr: '时间复杂度: O(N) 线性遍历 · 空间复杂度: O(1) 纯指针操作',
    });

    return header + baseCase + round + finalReturn;
  }
}
