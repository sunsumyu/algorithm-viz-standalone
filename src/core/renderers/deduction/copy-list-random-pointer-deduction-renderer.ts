/**
 * 复杂链表的深拷贝 (Copy List with Random Pointer · LeetCode 138 / Class 035 & 042)
 * 全景推演树渲染策略 (CopyListRandomPointerDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class CopyListRandomPointerDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'copy-list-random-pointer';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'copy-list-random-pointer' ||
      modelId === 'copy-list-random-pointer-042' ||
      modelId === 'copy-random-list-035' ||
      modelId === 'copy-random-list' ||
      modelId === '138' ||
      modelId === 'leetcode-138' ||
      modelId === 'class035-code01' ||
      modelId === 'class042-code01'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 138. 复杂链表的深拷贝 (Copy List with Random Pointer) · 全景推演树',
      badge: '左程云 Class 035 & 042 · 原地插桩交错映射 / random 指针精准投射 cur.next.random = cur.random.next / 极致 O(1) 空间',
      descriptionHtml: `
        核心目标：给你一个长度为 <code>n</code> 的链表，每个节点包含一个额外增加的随机指针 <code>random</code>，该指针可以指向链表中的任何节点或空节点。构造这个链表的<strong>深拷贝</strong>。<br/>
        <strong>左程云算法体系教学核心——原地插桩三步法与摆脱哈希表的 O(1) 空间精髓：</strong><br/>
        1. <strong>传统解法的空间痛点</strong>：<br/>
        如果使用 <code>Map&lt;Node, Node&gt;</code> 记录原节点到克隆节点的对应关系，空间复杂度为 <code>O(N)</code>，无法体现高阶指针操控艺术。<br/>
        2. <strong>左神原地交错插桩三步法（极致 O(1) 空间）</strong>：<br/>
        • <strong>第 ① 步（节点裂变插桩）</strong>：遍历原链表，在每个节点 <code>cur</code> 身后紧跟插入克隆节点 <code>cur.next = new Node(cur.val);</code>。<br/>
          链表拓扑形如：<code>1 ➔ 1' ➔ 2 ➔ 2' ➔ 3 ➔ 3'</code>。原节点的克隆体天然位于 <code>cur.next</code>，形成隐式 O(1) 寻址哈希！<br/>
        • <strong>第 ② 步（random 指针投射）</strong>：对于每个原节点 <code>cur</code>，令 <code>cur.next.random = (cur.random != null) ? cur.random.next : null</code>！<br/>
          克隆节点 <code>cur.next</code> 的随机目标，恰好是原目标 <code>cur.random</code> 紧随其后的克隆体！<br/>
        • <strong>第 ③ 步（奇偶分离解耦）</strong>：将交错链表拆分为原链表与克隆新链表，原链表完全复原，新链表独立返回！
      `,
      initialStateText: `克隆入口：copyRandomList(head) ➔ 启动原地交错插桩三步走流程。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '边界判空退化 (Empty Input)',
        valuesStr: 'head == null ➔ 链表为空，直接 return null',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '原链表与新链表解耦完成 ➔ 原链表恢复原状，返回 copyHead',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 原地裂变插桩新节点 (Interleaving Clone Nodes)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Step 1: Interleave</span>',
      detailLines: [
        'Node cur = head;',
        'while (cur != null) {',
        '  Node next = cur.next;',
        '  cur.next = new Node(cur.val); // 原地插入克隆体',
        '  cur.next.next = next;',
        '  cur = next;',
        '}',
      ],
      fillLine: '交替排布：构造 1 -> 1\' -> 2 -> 2\' 结构，克隆体永远位于原节点正后方',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 随机指针精准投射 (Project Random Pointers)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Step 2: Connect Random</span>',
      detailLines: [
        'cur = head;',
        'while (cur != null) {',
        '  if (cur.random != null) {',
        '    cur.next.random = cur.random.next; // 投射克隆随机指针',
        '  }',
        '  cur = cur.next.next;',
        '}',
      ],
      fillLine: '对偶映射：利用原节点与克隆节点的相对位移，无哈希表完成 random 直连',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 奇偶分离拆链与复原 (Decouple & Restore Original)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Step 3: Split Chains</span>',
      detailLines: [
        'Node copyHead = head.next;',
        'cur = head; Node curCopy = head.next;',
        'while (cur != null) {',
        '  cur.next = cur.next.next;',
        '  curCopy.next = (curCopy.next != null) ? curCopy.next.next : null;',
        '  cur = cur.next; curCopy = curCopy.next;',
        '}',
        'return copyHead; // 返回独立深拷贝新链表',
      ],
      fillLine: '解耦复原：两链拉链式拆解分离，原链表恢复如初，克隆链表自成一体',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '复杂链表克隆推演流 (Interleave ➔ Project Random ➔ Decouple Restore)',
      subtitle: 'LeetCode 138 & Zuoshen Class 035/042 Copy List Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '克隆链表头节点 (copyHead)',
      complexityStr: '时间复杂度: O(N) 仅历经三次轻量遍历 · 空间复杂度: O(1) 零哈希表开销',
    });

    return header + baseCase + round + finalReturn;
  }
}
