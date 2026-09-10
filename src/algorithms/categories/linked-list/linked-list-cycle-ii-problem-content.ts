/**
 * LeetCode 142: 环形链表 II (Linked List Cycle II)
 * 领域知识与题解精讲配置声明
 */

export const LINKED_LIST_CYCLE_II_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 142</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">环形链表 II (Linked List Cycle II)</h2>
    </div>
    <p style="margin: 0;">给定一个链表的头节点 <code style="color: #fde047; font-family: monospace;">head</code> ，返回链表开始入环的第一个节点。如果链表无环，则返回 <code style="color: #fde047; font-family: monospace;">null</code> 。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: head = [3,2,0,-4], pos = 1 (尾节点连回下标 1)</div>
      <div>输出: 返回索引为 1 的链表节点 (值 2)</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: head = [1,2], pos = 0 (尾节点连回下标 0)</div>
      <div>输出: 返回索引为 0 的链表节点 (值 1)</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 3:</div>
      <div>输入: head = [1], pos = -1 (无环)</div>
      <div>输出: null</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 链表中节点的数目范围在范围 [0, 10^4] 内</div>
      <div>• -10^5 &le; Node.val &le; 10^5</div>
      <div>• pos 的值为 -1 或者链表中的一个有效索引</div>
      <div>• 进阶：是否可以使用 O(1) 空间复杂度解决此题？</div>
    </div>
  </div>
`;

export const LINKED_LIST_CYCLE_II_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 快慢指针相遇 + x = (n-1)(y+z) + z 入口数学严谨推导
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 阶段一：判断是否有环并找到相遇点 (meet)</div>
        <p style="margin: 0; color: #94a3b8;">
        fast 每次走 2 步，slow 每次走 1 步。如果有环，fast 必定在环内以相对速度 1 步步逼近 slow 并追上相遇；若 fast 触碰 null 则无环。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 阶段二：数学等式推导出入环口</div>
        <p style="margin: 0; color: #94a3b8;">
        设从 head 到入环口距离为 <code style="color: #fbbf24; font-family: monospace;">x</code>，入环口到相遇点为 <code style="color: #34d399; font-family: monospace;">y</code>，相遇点走回入环口为 <code style="color: #7dd3fc; font-family: monospace;">z</code>：<br/>
        • slow 路程 = <code style="color: #34d399; font-family: monospace;">x + y</code><br/>
        • fast 路程 = <code style="color: #7dd3fc; font-family: monospace;">x + y + n(y + z)</code><br/>
        因为 fast 速度是 slow 的 2 倍：<br/>
        <code style="color: #fde047; font-family: monospace;">2(x + y) = x + y + n(y + z)  &rArr;  x = (n - 1)(y + z) + z</code><br/>
        当 n = 1 时：<strong style="color: #38bdf8;">x = z</strong>！<br/>
        这意味着：<strong>一个指针从 head 出发，另一个指针从相遇点出发，每次均走 1 步，两者必定在入环口处首次相遇！</strong>
        </p>
      </div>
    </div>
  </div>
`;

export const LINKED_LIST_CYCLE_II_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public ListNode detectCycle(ListNode head) {',
    '    ListNode fast = head;',
    '    ListNode slow = head;',
    '',
    '    // 1. 快慢指针判断是否有环并寻找相遇点',
    '    while (fast != null && fast.next != null) {',
    '        fast = fast.next.next;',
    '        slow = slow.next;',
    '        if (fast == slow) { // 环内相遇',
    '            // 2. 一个从 head 出发，一个从相遇点出发',
    '            ListNode index1 = head;',
    '            ListNode index2 = fast;',
    '            while (index1 != index2) {',
    '                index1 = index1.next;',
    '                index2 = index2.next;',
    '            }',
    '            return index1; // 相遇于入环口 (x = z)',
    '        }',
    '    }',
    '    return null; // 无环',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    ListNode *detectCycle(ListNode *head) {',
    '        ListNode *fast = head;',
    '        ListNode *slow = head;',
    '',
    '        while (fast != nullptr && fast->next != nullptr) {',
    '            fast = fast->next->next;',
    '            slow = slow->next;',
    '            if (fast == slow) {',
    '                ListNode *index1 = head;',
    '                ListNode *index2 = fast;',
    '                while (index1 != index2) {',
    '                    index1 = index1->next;',
    '                    index2 = index2->next;',
    '                }',
    '                return index1;',
    '            }',
    '        }',
    '        return nullptr;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def detectCycle(self, head: Optional[ListNode]) -> Optional[ListNode]:',
    '        fast = head',
    '        slow = head',
    '',
    '        while fast and fast.next:',
    '            fast = fast.next.next',
    '            slow = slow.next',
    '            if fast == slow:',
    '                index1 = head',
    '                index2 = fast',
    '                while index1 != index2:',
    '                    index1 = index1.next',
    '                    index2 = index2.next',
    '                return index1',
    '',
    '        return None',
  ],
  javascript: [
    'var detectCycle = function(head) {',
    '    let fast = head;',
    '    let slow = head;',
    '',
    '    while (fast !== null && fast.next !== null) {',
    '        fast = fast.next.next;',
    '        slow = slow.next;',
    '        if (fast === slow) {',
    '            let index1 = head;',
    '            let index2 = fast;',
    '            while (index1 !== index2) {',
    '                index1 = index1.next;',
    '                index2 = index2.next;',
    '            }',
    '            return index1;',
    '        }',
    '    }',
    '    return null;',
    '};',
  ],
};
