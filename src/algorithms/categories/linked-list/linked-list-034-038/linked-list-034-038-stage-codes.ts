/**
 * 左神算法通关课 034 ~ 038 经典链表高频与递归专题 多语言代码与 1-based 行号映射
 */

export interface CodeMapping {
  java: number;
  cpp: number;
  python: number;
  javascript: number;
}

// ==========================================
// 1. Class 034: 单双链表反转
// ==========================================
export const REVERSE_LINKED_LIST_034_CODES: Record<string, string[]> = {
  java: [
    'public ListNode reverseList(ListNode head) {', // 1
    '    ListNode pre = null;', // 2
    '    ListNode next = null;', // 3
    '    while (head != null) {', // 4
    '        next = head.next; // 暂存后继节点', // 5
    '        head.next = pre;  // 反转当前指针指向', // 6
    '        pre = head;       // pre 指针前进一步', // 7
    '        head = next;      // head 推进到下一个待反转节点', // 8
    '    }', // 9
    '    return pre; // 新链表头节点', // 10
    '}', // 11
  ],
  cpp: [
    'ListNode* reverseList(ListNode* head) {', // 1
    '    ListNode* pre = nullptr;', // 2
    '    ListNode* next = nullptr;', // 3
    '    while (head != nullptr) {', // 4
    '        next = head->next;', // 5
    '        head->next = pre;', // 6
    '        pre = head;', // 7
    '        head = next;', // 8
    '    }', // 9
    '    return pre;', // 10
    '}', // 11
  ],
  python: [
    'def reverse_list(self, head: Optional[ListNode]) -> Optional[ListNode]:', // 1
    '    pre = None', // 2
    '    while head:', // 3
    '        next_node = head.next # 暂存后继', // 4
    '        head.next = pre # 反转指针', // 5
    '        pre = head # 前驱移动', // 6
    '        head = next_node # 移动至下一个', // 7
    '    return pre', // 8
  ],
  javascript: [
    'function reverseList(head) {', // 1
    '    let pre = null;', // 2
    '    let next = null;', // 3
    '    while (head !== null) {', // 4
    '        next = head.next;', // 5
    '        head.next = pre;', // 6
    '        pre = head;', // 7
    '        head = next;', // 8
    '    }', // 9
    '    return pre;', // 10
    '}', // 11
  ],
};

export const REVERSE_LINKED_LIST_034_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  initPre:     { java: 2, cpp: 2, python: 2, javascript: 2 },
  saveNext:    { java: 5, cpp: 5, python: 4, javascript: 5 },
  reverseEdge: { java: 6, cpp: 6, python: 5, javascript: 6 },
  advancePre:  { java: 7, cpp: 7, python: 6, javascript: 7 },
  advanceHead: { java: 8, cpp: 8, python: 7, javascript: 8 },
  returnHead:  { java: 10, cpp: 10, python: 8, javascript: 10 },
};

// ==========================================
// 2. Class 035: 复杂链表的深拷贝
// ==========================================
export const COPY_RANDOM_LIST_035_CODES: Record<string, string[]> = {
  java: [
    'public Node copyRandomList(Node head) {', // 1
    '    if (head == null) return null;', // 2
    '    Node cur = head;', // 3
    '    while (cur != null) { // 1. 原地插入克隆节点 1->1\'->2->2\'', // 4
    '        Node next = cur.next;', // 5
    '        cur.next = new Node(cur.val);', // 6
    '        cur.next.next = next; cur = next;', // 7
    '    }', // 8
    '    cur = head;', // 9
    '    while (cur != null) { // 2. 拷贝随机指针', // 10
    '        if (cur.random != null) cur.next.random = cur.random.next;', // 11
    '        cur = cur.next.next;', // 12
    '    }', // 13
    '    Node copyHead = head.next; cur = head;', // 14
    '    while (cur != null) { // 3. 剥离拆分两链表', // 15
    '        Node copy = cur.next; cur.next = copy.next; cur = cur.next;', // 16
    '        copy.next = cur != null ? cur.next : null;', // 17
    '    }', // 18
    '    return copyHead;', // 19
    '}', // 20
  ],
  cpp: [
    'Node* copyRandomList(Node* head) {', // 1
    '    if (!head) return nullptr;', // 2
    '    Node* cur = head;', // 3
    '    while (cur) {', // 4
    '        Node* nxt = cur->next;', // 5
    '        cur->next = new Node(cur->val);', // 6
    '        cur->next->next = nxt; cur = nxt;', // 7
    '    }', // 8
    '    cur = head;', // 9
    '    while (cur) {', // 10
    '        if (cur->random) cur->next->random = cur->random->next;', // 11
    '        cur = cur->next->next;', // 12
    '    }', // 13
    '    Node* copyHead = head->next; cur = head;', // 14
    '    while (cur) {', // 15
    '        Node* copy = cur->next; cur->next = copy->next; cur = cur->next;', // 16
    '        copy->next = cur ? cur->next : nullptr;', // 17
    '    }', // 18
    '    return copyHead;', // 19
    '}', // 20
  ],
  python: [
    'def copy_random_list(self, head: Optional[Node]) -> Optional[Node]:', // 1
    '    if not head: return None', // 2
    '    cur = head', // 3
    '    while cur: # 插入克隆节点', // 4
    '        nxt = cur.next; cur.next = Node(cur.val); cur.next.next = nxt; cur = nxt', // 5
    '    cur = head', // 6
    '    while cur: # 配对随机指针', // 7
    '        if cur.random: cur.next.random = cur.random.next', // 8
    '        cur = cur.next.next', // 9
    '    copy_head = head.next; cur = head', // 10
    '    while cur: # 拆分两链表', // 11
    '        copy = cur.next; cur.next = copy.next; cur = cur.next', // 12
    '        copy.next = cur.next if cur else None', // 13
    '    return copy_head', // 14
  ],
  javascript: [
    'function copyRandomList(head) {', // 1
    '    if (!head) return null;', // 2
    '    let cur = head;', // 3
    '    while (cur) {', // 4
    '        const nxt = cur.next;', // 5
    '        cur.next = new Node(cur.val);', // 6
    '        cur.next.next = nxt; cur = nxt;', // 7
    '    }', // 8
    '    cur = head;', // 9
    '    while (cur) {', // 10
    '        if (cur.random) cur.next.random = cur.random.next;', // 11
    '        cur = cur.next.next;', // 12
    '    }', // 13
    '    const copyHead = head.next; cur = head;', // 14
    '    while (cur) {', // 15
    '        const copy = cur.next; cur.next = copy.next; cur = cur.next;', // 16
    '        copy.next = cur ? cur.next : null;', // 17
    '    }', // 18
    '    return copyHead;', // 19
    '}', // 20
  ],
};

export const COPY_RANDOM_LIST_035_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  cloneInsert: { java: 6, cpp: 6, python: 5, javascript: 6 },
  copyRandom:  { java: 11, cpp: 11, python: 8, javascript: 11 },
  splitLists:  { java: 16, cpp: 16, python: 12, javascript: 16 },
  returnResult:{ java: 19, cpp: 19, python: 14, javascript: 19 },
};

// ==========================================
// 3. Class 036: 相交链表与有环无环终极判定
// ==========================================
export const INTERSECTION_LIST_036_CODES: Record<string, string[]> = {
  java: [
    'public ListNode getIntersectNode(ListNode headA, ListNode headB) {', // 1
    '    ListNode loopA = getLoopNode(headA); // 1. 快慢指针找环入口', // 2
    '    ListNode loopB = getLoopNode(headB);', // 3
    '    if (loopA == null && loopB == null) {', // 4
    '        return noLoopIntersect(headA, headB); // 2. 两无环链表相交判定 (差值对齐)', // 5
    '    }', // 6
    '    if (loopA != null && loopB != null) {', // 7
    '        return bothLoopIntersect(headA, loopA, headB, loopB); // 3. 两有环链表相交判定', // 8
    '    }', // 9
    '    return null; // 一个有环一个无环必不相交', // 10
    '}', // 11
  ],
  cpp: [
    'ListNode* getIntersectNode(ListNode* headA, ListNode* headB) {', // 1
    '    ListNode* loopA = getLoopNode(headA);', // 2
    '    ListNode* loopB = getLoopNode(headB);', // 3
    '    if (!loopA && !loopB) return noLoopIntersect(headA, headB);', // 4
    '    if (loopA && loopB) return bothLoopIntersect(headA, loopA, headB, loopB);', // 5
    '    return nullptr;', // 6
    '}', // 7
  ],
  python: [
    'def get_intersect_node(self, headA: ListNode, headB: ListNode) -> Optional[ListNode]:', // 1
    '    loopA = self.get_loop_node(headA) # 快慢指针找入环口', // 2
    '    loopB = self.get_loop_node(headB)', // 3
    '    if not loopA and not loopB: return self.no_loop_intersect(headA, headB)', // 4
    '    if loopA and loopB: return self.both_loop_intersect(headA, loopA, headB, loopB)', // 5
    '    return None', // 6
  ],
  javascript: [
    'function getIntersectNode(headA, headB) {', // 1
    '    const loopA = getLoopNode(headA);', // 2
    '    const loopB = getLoopNode(headB);', // 3
    '    if (!loopA && !loopB) return noLoopIntersect(headA, headB);', // 4
    '    if (loopA && loopB) return bothLoopIntersect(headA, loopA, headB, loopB);', // 5
    '    return null;', // 6
    '}', // 7
  ],
};

export const INTERSECTION_LIST_036_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  findLoopA:   { java: 2, cpp: 2, python: 2, javascript: 2 },
  noLoopCheck: { java: 5, cpp: 4, python: 4, javascript: 4 },
  bothLoopCheck:{ java: 8, cpp: 5, python: 5, javascript: 5 },
  oneLoopNull: { java: 10, cpp: 6, python: 6, javascript: 6 },
};

// ==========================================
// 4. Class 037: K 个一组翻转链表
// ==========================================
export const REVERSE_K_GROUP_037_CODES: Record<string, string[]> = {
  java: [
    'public ListNode reverseKGroup(ListNode head, int k) {', // 1
    '    ListNode start = head; ListNode end = getKGroupEnd(start, k);', // 2
    '    if (end == null) return head; // 不足 k 个直接返回', // 3
    '    head = end; reverse(start, end); // 第一组翻转，确立全局新头', // 4
    '    ListNode lastTeamEnd = start;', // 5
    '    while (lastTeamEnd.next != null) {', // 6
    '        start = lastTeamEnd.next; end = getKGroupEnd(start, k);', // 7
    '        if (end == null) return head; // 剩余不足 k 个，终止', // 8
    '        reverse(start, end);', // 9
    '        lastTeamEnd.next = end; lastTeamEnd = start; // 组间首尾桥接', // 10
    '    }', // 11
    '    return head;', // 12
    '}', // 13
  ],
  cpp: [
    'ListNode* reverseKGroup(ListNode* head, int k) {', // 1
    '    ListNode* start = head; ListNode* end = getKGroupEnd(start, k);', // 2
    '    if (!end) return head;', // 3
    '    head = end; reverse(start, end);', // 4
    '    ListNode* lastTeamEnd = start;', // 5
    '    while (lastTeamEnd->next) {', // 6
    '        start = lastTeamEnd->next; end = getKGroupEnd(start, k);', // 7
    '        if (!end) return head;', // 8
    '        reverse(start, end);', // 9
    '        lastTeamEnd->next = end; lastTeamEnd = start;', // 10
    '    }', // 11
    '    return head;', // 12
    '}', // 13
  ],
  python: [
    'def reverse_k_group(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:', // 1
    '    start = head; end = self.get_k_group_end(start, k)', // 2
    '    if not end: return head', // 3
    '    head = end; self.reverse(start, end)', // 4
    '    last_team_end = start', // 5
    '    while last_team_end.next:', // 6
    '        start = last_team_end.next; end = self.get_k_group_end(start, k)', // 7
    '        if not end: return head', // 8
    '        self.reverse(start, end)', // 9
    '        last_team_end.next = end; last_team_end = start', // 10
    '    return head', // 11
  ],
  javascript: [
    'function reverseKGroup(head, k) {', // 1
    '    let start = head; let end = getKGroupEnd(start, k);', // 2
    '    if (!end) return head;', // 3
    '    head = end; reverse(start, end);', // 4
    '    let lastTeamEnd = start;', // 5
    '    while (lastTeamEnd.next) {', // 6
    '        start = lastTeamEnd.next; end = getKGroupEnd(start, k);', // 7
    '        if (!end) return head;', // 8
    '        reverse(start, end);', // 9
    '        lastTeamEnd.next = end; lastTeamEnd = start;', // 10
    '    }', // 11
    '    return head;', // 12
    '}', // 13
  ],
};

export const REVERSE_K_GROUP_037_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  findEnd:     { java: 2, cpp: 2, python: 2, javascript: 2 },
  firstReverse:{ java: 4, cpp: 4, python: 4, javascript: 4 },
  loopGroups:  { java: 7, cpp: 7, python: 7, javascript: 7 },
  bridgeNext:  { java: 10, cpp: 10, python: 10, javascript: 10 },
};

// ==========================================
// 5. Class 038: 有序链表合并
// ==========================================
export const MERGE_SORTED_LISTS_038_CODES: Record<string, string[]> = {
  java: [
    'public ListNode mergeTwoLists(ListNode list1, ListNode list2) {', // 1
    '    ListNode dummy = new ListNode(0); // 虚拟哨兵节点', // 2
    '    ListNode cur = dummy;', // 3
    '    while (list1 != null && list2 != null) {', // 4
    '        if (list1.val <= list2.val) { cur.next = list1; list1 = list1.next; }', // 5
    '        else { cur.next = list2; list2 = list2.next; }', // 6
    '        cur = cur.next;', // 7
    '    }', // 8
    '    cur.next = list1 != null ? list1 : list2; // 嫁接剩余部分', // 9
    '    return dummy.next;', // 10
    '}', // 11
  ],
  cpp: [
    'ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {', // 1
    '    ListNode dummy(0); ListNode* cur = &dummy;', // 2
    '    while (list1 && list2) {', // 3
    '        if (list1->val <= list2->val) { cur->next = list1; list1 = list1->next; }', // 4
    '        else { cur->next = list2; list2 = list2->next; }', // 5
    '        cur = cur->next;', // 6
    '    }', // 7
    '    cur->next = list1 ? list1 : list2;', // 8
    '    return dummy.next;', // 9
    '}', // 10
  ],
  python: [
    'def merge_two_lists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:', // 1
    '    dummy = ListNode(0); cur = dummy', // 2
    '    while list1 and list2:', // 3
    '        if list1.val <= list2.val: cur.next = list1; list1 = list1.next', // 4
    '        else: cur.next = list2; list2 = list2.next', // 5
    '        cur = cur.next', // 6
    '    cur.next = list1 if list1 else list2', // 7
    '    return dummy.next', // 8
  ],
  javascript: [
    'function mergeTwoLists(list1, list2) {', // 1
    '    const dummy = new ListNode(0); let cur = dummy;', // 2
    '    while (list1 && list2) {', // 3
    '        if (list1.val <= list2.val) { cur.next = list1; list1 = list1.next; }', // 4
    '        else { cur.next = list2; list2 = list2.next; }', // 5
    '        cur = cur.next;', // 6
    '    }', // 7
    '    cur.next = list1 ? list1 : list2;', // 8
    '    return dummy.next;', // 9
    '}', // 10
  ],
};

export const MERGE_SORTED_LISTS_038_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  initDummy:   { java: 2, cpp: 2, python: 2, javascript: 2 },
  compareNodes:{ java: 5, cpp: 4, python: 4, javascript: 4 },
  advanceCur:  { java: 7, cpp: 6, python: 6, javascript: 6 },
  appendRest:  { java: 9, cpp: 8, python: 7, javascript: 8 },
  returnHead:  { java: 10, cpp: 9, python: 8, javascript: 9 },
};
