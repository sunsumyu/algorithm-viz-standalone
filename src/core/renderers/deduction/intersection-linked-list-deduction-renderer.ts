/**
 * 链表相交 (Intersection of Two Linked Lists · LeetCode 160 / Class 036)
 * 全景推演树渲染策略 (IntersectionLinkedListDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class IntersectionLinkedListDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'intersection-linked-list';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'intersection-linked-list' ||
      modelId === '160' ||
      modelId === 'leetcode-160' ||
      modelId === 'intersection-linked-list-036' ||
      modelId === 'class036-code01' ||
      modelId === 'class008-code01' ||
      modelId === 'intersection-of-two-linked-lists'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 160. 相交链表 (Intersection of Two Linked Lists) · 全景推演树',
      badge: '双指针浪漫换道相遇 & 左程云 Class 036 · 严格数学对称 a + c + b = b + c + a / 有环无环终极判定',
      descriptionHtml: `
        核心目标：给你两个单链表的头节点 <code>headA</code> 和 <code>headB</code>，请你找出并返回两个单链表相交的起始节点。如果两个链表不存在相交，返回 <code>null</code>。<br/>
        <strong>《代码随想录》与左程云算法体系教学核心——对称换道与长度差对齐公理：</strong><br/>
        1. <strong>双指针浪漫换道算法（核心考点 · LC 160）</strong>：<br/>
        • 设指针 <code>pA = headA, pB = headB</code> 同步前进；<br/>
        • 当 <code>pA</code> 走到末尾 <code>null</code> 时，换道重定向至 <code>headB</code> 继续走；<br/>
        • 当 <code>pB</code> 走到末尾 <code>null</code> 时，换道重定向至 <code>headA</code> 继续走；<br/>
        • <strong>数学对称公理（消除长度差）</strong>：<br/>
          设 A 独有长度为 <code>a</code>，B 独有长度为 <code>b</code>，公共共享段长度为 <code>c</code>。<br/>
          <code>pA</code> 走的完整轨迹：<code>a + c + b</code>；<code>pB</code> 走的完整轨迹：<code>b + c + a</code>。<br/>
          因为 <code>(a + c) + b == (b + c) + a</code>，两指针走过的总路程严格相等！<br/>
          若两链表相交，它们必在<strong>第二轮换道后于相交首节点同步相遇</strong>（<code>pA == pB != null</code>）；<br/>
          若两链表不相交（<code>c = 0</code>），两指针走完 <code>a + b</code> 后<strong>同步触达 null 相遇</strong>（<code>pA == pB == null</code>）！<br/>
        2. <strong>左程云 Class 036：链表相交终极判定（有环/无环全覆盖）</strong>：<br/>
        • <strong>双无环分支</strong>：统计两链表长度差 <code>Δ = |lenA - lenB|</code>，长链表先走 <code>Δ</code> 步，随后同步前进；<br/>
        • <strong>一有一无分支</strong>：一个有环另一个无环，根据单链表节点唯一 <code>next</code> 特性，绝不可能相交；<br/>
        • <strong>双有环分支</strong>：若 <code>loopA == loopB</code>，入环前已相交；若 <code>loopA != loopB</code>，让指针绕环一周探测是否能触达 <code>loopB</code>。
      `,
      initialStateText: `相交入口：getIntersectionNode(headA, headB) ➔ 初始化 pA = headA, pB = headB。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '边界判空退化 (Null Check)',
        valuesStr: 'headA == null || headB == null ➔ 至少一链为空，绝无相交可能，直接 return null',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: 'pA == pB ➔ 若非空则为交点节点，若为 null 则证明全链无交点',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 双指针自走首轮链表 (First Pass Exploration)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Pass 1</span>',
      detailLines: [
        'while (pA != pB) {',
        '  pA = (pA == null) ? headB : pA.next; // A 到头后移至 B',
        '  pB = (pB == null) ? headA : pB.next; // B 到头后移至 A',
        '}',
      ],
      fillLine: '异步前行：各走各的路，较短链表的指针会更早抵达末尾的 null',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 换道对称性抵消长度差 (Track Exchange: a+c+b = b+c+a)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Proof: Symmetry</span>',
      detailLines: [
        'Dis(pA) = a (A独有) + c (相交段) + b (B独有) = a + b + c',
        'Dis(pB) = b (B独有) + c (相交段) + a (A独有) = a + b + c',
        '结论：长度差 |a - b| 在彼此走过对方的独占路径后被完全抹平！',
      ],
      fillLine: '浪漫相遇：彼此走过对方走过的路，步数完全对齐，并肩同步走向交点',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 锁定首个相交节点或双空终点 (Collision Detection)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[9px]">Intersection Lock</span>',
      detailLines: [
        'if (pA != null) {',
        '  return pA; // 锁定相交首节点 (引用内存地址严格一致)',
        '} else {',
        '  return null; // 两个指针同时抵触 null 结束',
        '}',
      ],
      fillLine: '精准收敛：不论相交与否，循环必定在最多 a + b + c 步内自然终结',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '链表相交推演流 (Single Traversing ➔ Mutual Track Swap ➔ Synchronous Collision)',
      subtitle: 'LeetCode 160 & Zuoshen Class 036 Intersection Paradigms',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '相交起始节点引用 (Intersection Node) 或 null',
      complexityStr: '时间复杂度: O(M + N) 线性时间 · 空间复杂度: O(1) 仅需两只指针',
    });

    return header + baseCase + round + finalReturn;
  }
}
