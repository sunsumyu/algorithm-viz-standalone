/**
 * LeetCode 206: 反转链表 (Reverse Linked List)
 * 领域知识与题解精讲配置声明
 */

export const REVERSE_LINKED_LIST_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 206</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">反转链表 (Reverse Linked List)</h2>
    </div>
    <p style="margin: 0;">给你单链表的头节点 <code style="color: #fde047; font-family: monospace;">head</code> ，请你反转链表，并返回反转后的链表。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: head = [1,2,3,4,5]</div>
      <div>输出: [5,4,3,2,1]</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: head = [1,2]</div>
      <div>输出: [2,1]</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 链表中节点的数目范围是 [0, 5000]</div>
      <div>• -5000 &le; Node.val &le; 5000</div>
    </div>
  </div>
`;

export const REVERSE_LINKED_LIST_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 双指针迭代法：原地改变指针指向，注意暂存 next 后继
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 双指针迭代核心四部曲</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <code style="color: #7dd3fc; font-family: monospace;">next = cur.next</code>：<strong>必须先暂存</strong>当前节点的下一个节点，否则一旦改变指向就会丢失后续整条链表！<br/>
        2. <code style="color: #34d399; font-family: monospace;">cur.next = pre</code>：将当前节点的 next 逆转指向前驱节点 <code style="color: #fbbf24; font-family: monospace;">pre</code>；<br/>
        3. <code style="color: #7dd3fc; font-family: monospace;">pre = cur</code>：<code style="color: #fbbf24; font-family: monospace;">pre</code> 指针右移一步，跟进到当前节点；<br/>
        4. <code style="color: #7dd3fc; font-family: monospace;">cur = next</code>：<code style="color: #34d399; font-family: monospace;">cur</code> 指针右移一步，移动到刚刚暂存的 <code style="color: #7dd3fc; font-family: monospace;">next</code> 节点。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 终止条件与返回值</div>
        <p style="margin: 0; color: #94a3b8;">
        当 <code style="color: #7dd3fc; font-family: monospace;">cur == null</code> 时循环结束。此时 <code style="color: #34d399; font-family: monospace;">pre</code> 恰好停留在原链表的尾节点，也就是反转后新链表的<strong>头节点</strong>，直接返回 <code style="color: #34d399; font-family: monospace;">pre</code> 即可！
        </p>
      </div>
    </div>
  </div>
`;

export const REVERSE_LINKED_LIST_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public ListNode reverseList(ListNode head) {',
    '    ListNode pre = null;',
    '    ListNode cur = head;',
    '    while (cur != null) {',
    '        ListNode next = cur.next; // 1. 暂存后继',
    '        cur.next = pre;          // 2. 反转指针',
    '        pre = cur;               // 3. pre 前进',
    '        cur = next;              // 4. cur 前进',
    '    }',
    '    return pre;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    ListNode* reverseList(ListNode* head) {',
    '        ListNode* pre = nullptr;',
    '        ListNode* cur = head;',
    '        while (cur != nullptr) {',
    '            ListNode* next = cur->next;',
    '            cur->next = pre;',
    '            pre = cur;',
    '            cur = next;',
    '        }',
    '        return pre;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:',
    '        pre = None',
    '        cur = head',
    '        while cur:',
    '            next_node = cur.next',
    '            cur.next = pre',
    '            pre = cur',
    '            cur = next_node',
    '        return pre',
  ],
  javascript: [
    'var reverseList = function(head) {',
    '    let pre = null;',
    '    let cur = head;',
    '    while (cur !== null) {',
    '        const next = cur.next;',
    '        cur.next = pre;',
    '        pre = cur;',
    '        cur = next;',
    '    }',
    '    return pre;',
    '};',
  ],
};
