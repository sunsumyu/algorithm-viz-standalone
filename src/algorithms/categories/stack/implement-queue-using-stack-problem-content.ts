/**
 * LeetCode 232: 用栈实现队列 (Implement Queue using Stacks)
 * 领域知识与题解精讲配置声明
 */

export const IMPLEMENT_QUEUE_USING_STACK_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 232</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">用栈实现队列 (Implement Queue using Stacks)</h2>
    </div>
    <p style="margin: 0;">请你仅使用两个栈实现先入先出（FIFO）队列。队列应当支持一般队列支持的所有操作（<code style="color: #fde047; font-family: monospace;">push</code>、<code style="color: #fde047; font-family: monospace;">pop</code>、<code style="color: #fde047; font-family: monospace;">peek</code>、<code style="color: #fde047; font-family: monospace;">empty</code>）：</p>
    <div style="display: flex; flex-direction: column; gap: 4px; padding-left: 8px; color: #94a3b8;">
      <div>• <code style="color: #7dd3fc; font-family: monospace;">void push(int x)</code> 将元素 x 推到队列的末尾</div>
      <div>• <code style="color: #7dd3fc; font-family: monospace;">int pop()</code> 从队列的开头移除并返回元素</div>
      <div>• <code style="color: #7dd3fc; font-family: monospace;">int peek()</code> 返回队列开头的元素</div>
      <div>• <code style="color: #7dd3fc; font-family: monospace;">boolean empty()</code> 如果队列为空返回 true，否则返回 false</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例:</div>
      <div>MyQueue myQueue = new MyQueue();</div>
      <div>myQueue.push(1); // queue is: [1]</div>
      <div>myQueue.push(2); // queue is: [1, 2]</div>
      <div>myQueue.peek(); // return 1</div>
      <div>myQueue.pop(); // return 1, queue is [2]</div>
      <div>myQueue.empty(); // return false</div>
    </div>
  </div>
`;

export const IMPLEMENT_QUEUE_USING_STACK_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 双栈架构设计：负负得正，两次 LIFO 逆序实现 FIFO 顺序！
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 角色分工明确</div>
        <p style="margin: 0; color: #94a3b8;">
        • <strong>输入栈 (stackIn)</strong>：负责处理 <code style="color: #7dd3fc; font-family: monospace;">push</code> 操作，直接无脑压栈。<br/>
        • <strong>输出栈 (stackOut)</strong>：负责处理 <code style="color: #7dd3fc; font-family: monospace;">pop</code> 和 <code style="color: #7dd3fc; font-family: monospace;">peek</code> 操作。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 倾倒转移的核心条件（绝不提前转移）</div>
        <p style="margin: 0; color: #94a3b8;">
        当需要出队或查看队头时：<br/>
        • 若 <code style="color: #34d399; font-family: monospace;">stackOut</code> 不为空，直接从 <code style="color: #34d399; font-family: monospace;">stackOut.pop()</code> 即可，时间复杂度 O(1)！<br/>
        • <strong>仅当 stackOut 为空时</strong>，才将 <code style="color: #fbbf24; font-family: monospace;">stackIn</code> 中的<strong>全部元素一次性倾倒转移</strong>到 <code style="color: #34d399; font-family: monospace;">stackOut</code> 中，原顺序被彻底反转，栈顶恰好成为最早进入队列的元素！<br/>
        • 均摊时间复杂度：每个元素仅进出栈各 2 次，均摊为 <strong>O(1)</strong>！
        </p>
      </div>
    </div>
  </div>
`;

export const IMPLEMENT_QUEUE_USING_STACK_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'class MyQueue {',
    '    Stack<Integer> stackIn;',
    '    Stack<Integer> stackOut;',
    '    public MyQueue() {',
    '        stackIn = new Stack<>();',
    '        stackOut = new Stack<>();',
    '    }',
    '    public void push(int x) {',
    '        stackIn.push(x);',
    '    }',
    '    public int pop() {',
    '        dumpStackIn();',
    '        return stackOut.pop();',
    '    }',
    '    public int peek() {',
    '        dumpStackIn();',
    '        return stackOut.peek();',
    '    }',
    '    public boolean empty() {',
    '        return stackIn.isEmpty() && stackOut.isEmpty();',
    '    }',
    '    private void dumpStackIn() {',
    '        if (!stackOut.isEmpty()) return;',
    '        while (!stackIn.isEmpty()) {',
    '            stackOut.push(stackIn.pop());',
    '        }',
    '    }',
    '}',
  ],
  cpp: [
    'class MyQueue {',
    'public:',
    '    stack<int> stIn;',
    '    stack<int> stOut;',
    '    MyQueue() {}',
    '    void push(int x) {',
    '        stIn.push(x);',
    '    }',
    '    int pop() {',
    '        if (stOut.empty()) {',
    '            while (!stIn.empty()) {',
    '                stOut.push(stIn.top());',
    '                stIn.pop();',
    '            }',
    '        }',
    '        int result = stOut.top();',
    '        stOut.pop();',
    '        return result;',
    '    }',
    '    int peek() {',
    '        int res = this->pop();',
    '        stOut.push(res);',
    '        return res;',
    '    }',
    '    bool empty() {',
    '        return stIn.empty() && stOut.empty();',
    '    }',
    '};',
  ],
  python: [
    'class MyQueue:',
    '    def __init__(self):',
    '        self.stack_in = []',
    '        self.stack_out = []',
    '    def push(self, x: int) -> None:',
    '        self.stack_in.append(x)',
    '    def pop(self) -> int:',
    '        if self.empty(): return None',
    '        if not self.stack_out:',
    '            while self.stack_in:',
    '                self.stack_out.append(self.stack_in.pop())',
    '        return self.stack_out.pop()',
    '    def peek(self) -> int:',
    '        ans = self.pop()',
    '        self.stack_out.append(ans)',
    '        return ans',
    '    def empty(self) -> bool:',
    '        return not self.stack_in and not self.stack_out',
  ],
  javascript: [
    'var MyQueue = function() {',
    '    this.stackIn = [];',
    '    this.stackOut = [];',
    '};',
    'MyQueue.prototype.push = function(x) {',
    '    this.stackIn.push(x);',
    '};',
    'MyQueue.prototype.pop = function() {',
    '    if (!this.stackOut.length) {',
    '        while (this.stackIn.length) {',
    '            this.stackOut.push(this.stackIn.pop());',
    '        }',
    '    }',
    '    return this.stackOut.pop();',
    '};',
    'MyQueue.prototype.peek = function() {',
    '    const x = this.pop();',
    '    this.stackOut.push(x);',
    '    return x;',
    '};',
    'MyQueue.prototype.empty = function() {',
    '    return !this.stackIn.length && !this.stackOut.length;',
    '};',
  ],
};
