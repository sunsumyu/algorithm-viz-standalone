/**
 * LeetCode 707: 设计链表 (Design Linked List)
 * 领域知识与题解精讲配置声明
 */

export const DESIGN_LINKED_LIST_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 707</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">设计链表 (Design Linked List)</h2>
    </div>
    <p style="margin: 0;">你可以选择使用单链表或者双链表。单链表中的节点应该具有两个属性：<code style="color: #fde047; font-family: monospace;">val</code> 和 <code style="color: #fde047; font-family: monospace;">next</code>。<code style="color: #fde047; font-family: monospace;">val</code> 是当前节点的值，<code style="color: #fde047; font-family: monospace;">next</code> 是指向下一个节点的指针/引用。</p>
    <p style="margin: 0;">在链表类中实现这些功能：</p>
    <ul style="margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 4px;">
      <li><code style="color: #60a5fa; font-family: monospace;">get(index)</code>：获取链表中第 index 个节点的值。如果索引无效，则返回 -1。</li>
      <li><code style="color: #34d399; font-family: monospace;">addAtHead(val)</code>：在链表第一个元素之前添加一个值为 val 的节点。</li>
      <li><code style="color: #34d399; font-family: monospace;">addAtTail(val)</code>：将值为 val 的节点追加到链表的最后一个元素。</li>
      <li><code style="color: #34d399; font-family: monospace;">addAtIndex(index, val)</code>：在链表中的第 index 个节点之前添加值为 val 的节点。</li>
      <li><code style="color: #f87171; font-family: monospace;">deleteAtIndex(index)</code>：如果索引 index 有效，则删除链表中的第 index 个节点。</li>
    </ul>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 所有 val 值都在 [1, 1000] 之内</div>
      <div>• 最多调用 2000 次 get, addAtHead, addAtTail, addAtIndex, deleteAtIndex</div>
    </div>
  </div>
`;

export const DESIGN_LINKED_LIST_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 虚拟头节点 (dummyHead) 在增删改查中的核心优势
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 统一头节点与中间节点的插入/删除逻辑</div>
        <p style="margin: 0; color: #94a3b8;">
        设置虚拟头节点 <code style="color: #fbbf24; font-family: monospace;">dummyHead</code>，其 <code style="color: #34d399; font-family: monospace;">next</code> 指向真实头节点 <code style="color: #60a5fa; font-family: monospace;">head</code>。<br/>
        插入或删除目标位置 <code style="color: #fde047; font-family: monospace;">index</code> 时，指针只需从 <code style="color: #fbbf24; font-family: monospace;">dummyHead</code> 出发移动 <code style="color: #fde047; font-family: monospace;">index</code> 次，到达目标节点的前驱节点 <code style="color: #a78bfa; font-family: monospace;">pre</code>，统一执行：<br/>
        • 插入：<code style="color: #34d399; font-family: monospace;">newNode.next = pre.next; pre.next = newNode;</code><br/>
        • 删除：<code style="color: #f87171; font-family: monospace;">pre.next = pre.next.next;</code>
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 维护 size 变量大幅精简越界判定</div>
        <p style="margin: 0; color: #94a3b8;">
        维护 <code style="color: #38bdf8; font-family: monospace;">size</code> 属性记录节点总数：<br/>
        • <code style="color: #fde047; font-family: monospace;">get(index)</code>：若 <code style="color: #fde047; font-family: monospace;">index < 0 || index >= size</code> 直接返回 -1；<br/>
        • <code style="color: #fde047; font-family: monospace;">deleteAtIndex(index)</code>：若 <code style="color: #fde047; font-family: monospace;">index < 0 || index >= size</code> 直接返回；<br/>
        • <code style="color: #fde047; font-family: monospace;">addAtIndex(index, val)</code>：若 <code style="color: #fde047; font-family: monospace;">index > size</code> 直接返回，若 <code style="color: #fde047; font-family: monospace;">index < 0</code> 重置为 0。
        </p>
      </div>
    </div>
  </div>
`;

export const DESIGN_LINKED_LIST_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'class MyLinkedList {',
    '    int size;',
    '    ListNode dummyHead;',
    '',
    '    public MyLinkedList() {',
    '        size = 0;',
    '        dummyHead = new ListNode(0);',
    '    }',
    '',
    '    public int get(int index) {',
    '        if (index < 0 || index >= size) return -1;',
    '        ListNode cur = dummyHead;',
    '        for (int i = 0; i <= index; i++) cur = cur.next;',
    '        return cur.val;',
    '    }',
    '',
    '    public void addAtHead(int val) {',
    '        addAtIndex(0, val);',
    '    }',
    '',
    '    public void addAtTail(int val) {',
    '        addAtIndex(size, val);',
    '    }',
    '',
    '    public void addAtIndex(int index, int val) {',
    '        if (index > size) return;',
    '        if (index < 0) index = 0;',
    '        size++;',
    '        ListNode pred = dummyHead;',
    '        for (int i = 0; i < index; i++) pred = pred.next;',
    '        ListNode toAdd = new ListNode(val);',
    '        toAdd.next = pred.next;',
    '        pred.next = toAdd;',
    '    }',
    '',
    '    public void deleteAtIndex(int index) {',
    '        if (index < 0 || index >= size) return;',
    '        size--;',
    '        ListNode pred = dummyHead;',
    '        for (int i = 0; i < index; i++) pred = pred.next;',
    '        pred.next = pred.next.next;',
    '    }',
    '}',
  ],
  cpp: [
    'class MyLinkedList {',
    'public:',
    '    struct LinkedNode {',
    '        int val;',
    '        LinkedNode* next;',
    '        LinkedNode(int val):val(val), next(nullptr){}',
    '    };',
    '    LinkedNode* _dummyHead;',
    '    int _size;',
    '    MyLinkedList() {',
    '        _dummyHead = new LinkedNode(0);',
    '        _size = 0;',
    '    }',
    '    int get(int index) {',
    '        if (index > (_size - 1) || index < 0) return -1;',
    '        LinkedNode* cur = _dummyHead->next;',
    '        while(index--) cur = cur->next;',
    '        return cur->val;',
    '    }',
    '    void addAtHead(int val) { addAtIndex(0, val); }',
    '    void addAtTail(int val) { addAtIndex(_size, val); }',
    '    void addAtIndex(int index, int val) {',
    '        if (index > _size) return;',
    '        if (index < 0) index = 0;',
    '        LinkedNode* newNode = new LinkedNode(val);',
    '        LinkedNode* cur = _dummyHead;',
    '        while(index--) cur = cur->next;',
    '        newNode->next = cur->next;',
    '        cur->next = newNode;',
    '        _size++;',
    '    }',
    '    void deleteAtIndex(int index) {',
    '        if (index >= _size || index < 0) return;',
    '        LinkedNode* cur = _dummyHead;',
    '        while(index--) cur = cur->next;',
    '        LinkedNode* tmp = cur->next;',
    '        cur->next = cur->next->next;',
    '        delete tmp;',
    '        _size--;',
    '    }',
    '};',
  ],
  python: [
    'class ListNode:',
    '    def __init__(self, val=0, next=None):',
    '        self.val = val',
    '        self.next = next',
    '',
    'class MyLinkedList:',
    '    def __init__(self):',
    '        self.dummy_head = ListNode()',
    '        self.size = 0',
    '',
    '    def get(self, index: int) -> int:',
    '        if index < 0 or index >= self.size:',
    '            return -1',
    '        cur = self.dummy_head.next',
    '        for _ in range(index):',
    '            cur = cur.next',
    '        return cur.val',
    '',
    '    def addAtHead(self, val: int) -> None:',
    '        self.addAtIndex(0, val)',
    '',
    '    def addAtTail(self, val: int) -> None:',
    '        self.addAtIndex(self.size, val)',
    '',
    '    def addAtIndex(self, index: int, val: int) -> None:',
    '        if index > self.size:',
    '            return',
    '        if index < 0:',
    '            index = 0',
    '        self.size += 1',
    '        pred = self.dummy_head',
    '        for _ in range(index):',
    '            pred = pred.next',
    '        to_add = ListNode(val)',
    '        to_add.next = pred.next',
    '        pred.next = to_add',
    '',
    '    def deleteAtIndex(self, index: int) -> None:',
    '        if index < 0 or index >= self.size:',
    '            return',
    '        self.size -= 1',
    '        pred = self.dummy_head',
    '        for _ in range(index):',
    '            pred = pred.next',
    '        pred.next = pred.next.next',
  ],
  javascript: [
    'var MyLinkedList = function() {',
    '    this.size = 0;',
    '    this.dummyHead = { val: 0, next: null };',
    '};',
    '',
    'MyLinkedList.prototype.get = function(index) {',
    '    if (index < 0 || index >= this.size) return -1;',
    '    let cur = this.dummyHead.next;',
    '    for (let i = 0; i < index; i++) cur = cur.next;',
    '    return cur.val;',
    '};',
    '',
    'MyLinkedList.prototype.addAtHead = function(val) {',
    '    this.addAtIndex(0, val);',
    '};',
    '',
    'MyLinkedList.prototype.addAtTail = function(val) {',
    '    this.addAtIndex(this.size, val);',
    '};',
    '',
    'MyLinkedList.prototype.addAtIndex = function(index, val) {',
    '    if (index > this.size) return;',
    '    if (index < 0) index = 0;',
    '    this.size++;',
    '    let pred = this.dummyHead;',
    '    for (let i = 0; i < index; i++) pred = pred.next;',
    '    let toAdd = { val: val, next: pred.next };',
    '    pred.next = toAdd;',
    '};',
    '',
    'MyLinkedList.prototype.deleteAtIndex = function(index) {',
    '    if (index < 0 || index >= this.size) return;',
    '    this.size--;',
    '    let pred = this.dummyHead;',
    '    for (let i = 0; i < index; i++) pred = pred.next;',
    '    pred.next = pred.next.next;',
    '};',
  ],
};
