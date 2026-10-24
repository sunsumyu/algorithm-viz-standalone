/**
 * 环形链表 II (Linked List Cycle II · LeetCode 142 / Class 041)
 * 全景推演树渲染策略 (LinkedListCycleIIDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class LinkedListCycleIIDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'linked-list-cycle-ii';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'linked-list-cycle-ii' ||
      modelId === '142' ||
      modelId === 'leetcode-142' ||
      modelId === 'linked-list-cycle-ii-041' ||
      modelId === 'class041-code01' ||
      modelId === 'detect-cycle'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 142. 环形链表 II (Linked List Cycle II) · 全景推演树',
      badge: 'Floyd 判圈算法 & 左程云 Class 041 · 快慢指针相遇定理 / 严格数学规约 a = (k-1)L + c / 零额外空间',
      descriptionHtml: `
        核心目标：给定一个链表的头节点 <code>head</code>，返回链表开始入环的第一个节点。如果链表无环，则返回 <code>null</code>。<br/>
        <strong>《代码随想录》与经典算法之数学证明核心——Floyd 判圈相遇定理：</strong><br/>
        1. <strong>两阶段快慢指针工作流</strong>：<br/>
        • <strong>阶段 1（判环与相遇）</strong>：初始化 <code>slow = head, fast = head</code>。每次 <code>slow</code> 走 1 步，<code>fast</code> 走 2 步。<br/>
          若 <code>fast == null || fast.next == null</code>，说明链表存在尽头，直接判定<strong>无环返回 null</strong>。<br/>
          若 <code>slow == fast</code>，证明两指针在环内某处<strong>首次相遇</strong>，链表必有环！<br/>
        • <strong>阶段 2（双针对偶同速寻入环口）</strong>：相遇后，令 <code>index1 = head, index2 = meetNode</code>。<br/>
          两指针各自以<strong>每次 1 步</strong>的速度同时前进，它们<strong>相遇的节点即为入环起始节点</strong>！<br/>
        2. <strong>严谨数学推导规约（为什么 index1 与 index2 一定在入环口相遇？）</strong>：<br/>
        设头节点到入环点的距离为 <code>a</code>，入环点到首次相遇点的距离为 <code>b</code>，相遇点顺时针回到入环点的距离为 <code>c</code>（环长 <code>L = b + c</code>）。<br/>
        • <code>slow</code> 走的步数：<code>S = a + b</code>；<br/>
        • <code>fast</code> 走的步数：<code>F = a + b + k(b + c)</code>（<code>k ≥ 1</code> 为 fast 在环内比 slow 多转的圈数）；<br/>
        • 因为 fast 速度是 slow 的 2 倍：<code>F = 2S ⟹ a + b + k(b + c) = 2(a + b)</code>；<br/>
        • 移项化简得：<code>a = k(b + c) - b = (k - 1)(b + c) + c = (k - 1)L + c</code>！<br/>
        • <strong>当 k = 1 时：<code>a = c</code></strong>。从 head 走 <code>a</code> 步，恰好与从相遇点走 <code>c</code> 步同时抵达入环节点！
      `,
      initialStateText: `判环入口：detectCycle(head) ➔ slow = head, fast = head 启动二倍速追赶探测。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '边界判空退化 (Null or Single Node)',
        valuesStr: 'head == null || head.next == null ➔ 链表无法构成自环闭环，直接 return null',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: 'fast == null || fast.next == null ➔ 无环退出；或 index1 == index2 ➔ 锁定入环口返回',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 快慢指针二倍速追逐 (Fast 2x / Slow 1x)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Phase 1: Floyd Cycle</span>',
      detailLines: [
        'while (fast != null && fast.next != null) {',
        '  slow = slow.next;         // 慢指针步长 1',
        '  fast = fast.next.next;    // 快指针步长 2',
        '  if (slow == fast) break;  // 环内相遇，进入阶段 2',
        '}',
      ],
      fillLine: '相对运动：在环内 fast 相对 slow 每次以 1 的相对速度靠近，绝对不会发生跨越跳过',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 数学对偶映射 (Mathematical Congruence: a = c)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Proof: a = (k-1)L + c</span>',
      detailLines: [
        '2 * (a + b) = a + b + k * (b + c)',
        'a + b = k * L  ===>  a = k * L - b',
        'a = (k - 1) * L + (L - b) = (k - 1) * L + c',
        '结论：从 head 出发的 index1 走 a 步，恰与从相遇点出发的 index2 相遇在入环点！',
      ],
      fillLine: '几何闭环：无论快指针在环内转了多少圈 (k>=1)，两指针必同步收敛于入环起点',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 双指针同速推进寻找入环点 (Linear Convergence)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[9px]">Phase 2: Find Entrance</span>',
      detailLines: [
        'ListNode index1 = head;',
        'ListNode index2 = slow; // slow 正好停在首次相遇点',
        'while (index1 != index2) {',
        '  index1 = index1.next;',
        '  index2 = index2.next;',
        '}',
        'return index1; // 返回入环第一个节点',
      ],
      fillLine: '入环锁定：两指针同步单步前行，碰面之刻即为入环节点，算法完美收官',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '环形链表推演流 (Fast/Slow Chasing ➔ Ring Collision ➔ Entrance Convergence)',
      subtitle: 'LeetCode 142 & Zuoshen Class 041 Linked List Cycle II Invariants',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '入环节点指针 (Cycle Entrance Node) 或 null (No Cycle)',
      complexityStr: '时间复杂度: O(N) 线性遍历 · 空间复杂度: O(1) 仅需两对指针变量',
    });

    return header + baseCase + round + finalReturn;
  }
}
