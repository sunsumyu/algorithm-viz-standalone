/**
 * LeetCode 面试题 02.07: 链表相交 (Intersection of Two Linked Lists)
 * 领域知识与题解精讲配置声明
 */

export const INTERSECTION_LINKED_LIST_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">面试题 02.07 / LC 160</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">链表相交 (Intersection of Two Linked Lists)</h2>
    </div>
    <p style="margin: 0;">给你两个单链表的头节点 <code style="color: #fde047; font-family: monospace;">headA</code> 和 <code style="color: #fde047; font-family: monospace;">headB</code> ，请你找出并返回两个单链表相交的起始节点。如果两个链表没有交点，返回 <code style="color: #fde047; font-family: monospace;">null</code> 。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: intersectVal = 8, listA = [4,1,8,4,5], listB = [5,6,1,8,4,5], skipA = 2, skipB = 3</div>
      <div>输出: Intersected at '8' (两链表在节点 8 处相交)</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: intersectVal = 0, listA = [2,6,4], listB = [1,5], skipA = 3, skipB = 2</div>
      <div>输出: null (不相交)</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• listA 中节点数目为 m ，listB 中节点数目为 n</div>
      <div>• 1 &le; m, n &le; 3 * 10^4</div>
      <div>• 评测标准：注意相交是基于<strong>节点引用 (内存指针)</strong> 相同，而非数值相同！</div>
      <div>• 要求：时间复杂度 O(M + N)，空间复杂度 O(1)</div>
    </div>
  </div>
`;

export const INTERSECTION_LINKED_LIST_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 双指针换道消除路程差 (a + c + b = b + c + a)
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 数学等式与浪漫相遇原理</div>
        <p style="margin: 0; color: #94a3b8;">
        设链表 A 独立段长为 a，链表 B 独立段长为 b，公共相交段长为 c：<br/>
        • 指针 pA 走完 A 后切换到 headB：总路程 = <code style="color: #34d399; font-family: monospace;">a + c + b</code>；<br/>
        • 指针 pB 走完 B 后切换到 headA：总路程 = <code style="color: #7dd3fc; font-family: monospace;">b + c + a</code>；<br/>
        因为 <code style="color: #fbbf24; font-family: monospace;">a + c + b == b + c + a</code>，所以第二轮走相同步数时，<strong>两个指针必定在交点处首次相遇 (pA == pB)</strong>！
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 如果两链表不相交？</div>
        <p style="margin: 0; color: #94a3b8;">
        若两链表无交点 (c = 0)，则 pA 走过 <code style="color: #34d399; font-family: monospace;">a + b</code> 步到达 null，pB 走过 <code style="color: #7dd3fc; font-family: monospace;">b + a</code> 步也到达 null。此时 <code style="color: #fbbf24; font-family: monospace;">pA == pB == null</code>，循环优雅退出并返回 null！
        </p>
      </div>
    </div>
  </div>
`;

export const INTERSECTION_LINKED_LIST_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public ListNode getIntersectionNode(ListNode headA, ListNode headB) {',
    '    if (headA == null || headB == null) return null;',
    '    ListNode pA = headA;',
    '    ListNode pB = headB;',
    '',
    '    // pA 和 pB 各走完自己的链表后，换道走对方的链表',
    '    while (pA != pB) {',
    '        pA = (pA == null) ? headB : pA.next;',
    '        pB = (pB == null) ? headA : pB.next;',
    '    }',
    '',
    '    return pA; // 若相交返回交点，若不相交返回 null',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    ListNode *getIntersectionNode(ListNode *headA, ListNode *headB) {',
    '        if (!headA || !headB) return nullptr;',
    '        ListNode *pA = headA;',
    '        ListNode *pB = headB;',
    '',
    '        while (pA != pB) {',
    '            pA = (pA == nullptr) ? headB : pA->next;',
    '            pB = (pB == nullptr) ? headA : pB->next;',
    '        }',
    '',
    '        return pA;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> Optional[ListNode]:',
    '        if not headA or not headB:',
    '            return None',
    '        pA, pB = headA, headB',
    '',
    '        while pA != pB:',
    '            pA = headB if pA is None else pA.next',
    '            pB = headA if pB is None else pB.next',
    '',
    '        return pA',
  ],
  javascript: [
    'var getIntersectionNode = function(headA, headB) {',
    '    if (!headA || !headB) return null;',
    '    let pA = headA;',
    '    let pB = headB;',
    '',
    '    while (pA !== pB) {',
    '        pA = pA === null ? headB : pA.next;',
    '        pB = pB === null ? headA : pB.next;',
    '    }',
    '',
    '    return pA;',
    '};',
  ],
};
