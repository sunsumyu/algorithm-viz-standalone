/**
 * LeetCode 225: 用队列实现栈 (Implement Stack using Queues)
 * 领域知识与题解精讲配置声明
 */

export const IMPLEMENT_STACK_USING_QUEUE_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 225</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">用队列实现栈 (Implement Stack using Queues)</h2>
    </div>
    <p style="margin: 0;">请你仅使用标准队列操作，实现一个后入先出（LIFO）的栈。栈应当支持一般栈支持的所有操作（<code style="color: #fde047; font-family: monospace;">push</code>、<code style="color: #fde047; font-family: monospace;">top</code>、<code style="color: #fde047; font-family: monospace;">pop</code> 和 <code style="color: #fde047; font-family: monospace;">empty</code>）：</p>
    <div style="display: flex; flex-direction: column; gap: 4px; padding-left: 8px; color: #94a3b8;">
      <div>• <code style="color: #7dd3fc; font-family: monospace;">void push(int x)</code> 将元素 x 压入栈顶</div>
      <div>• <code style="color: #7dd3fc; font-family: monospace;">int pop()</code> 移除并返回栈顶元素</div>
      <div>• <code style="color: #7dd3fc; font-family: monospace;">int top()</code> 返回栈顶元素</div>
      <div>• <code style="color: #7dd3fc; font-family: monospace;">boolean empty()</code> 如果栈是空的返回 true，否则返回 false</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例:</div>
      <div>MyStack myStack = new MyStack();</div>
      <div>myStack.push(1);</div>
      <div>myStack.push(2);</div>
      <div>myStack.top(); // 返回 2</div>
      <div>myStack.pop(); // 返回 2</div>
      <div>myStack.empty(); // 返回 false</div>
    </div>
  </div>
`;

export const IMPLEMENT_STACK_USING_QUEUE_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 单队列循环旋转法：入队后把前面的元素全部重新排到队尾
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 核心机制：一个队列即可实现</div>
        <p style="margin: 0; color: #94a3b8;">
        很多教科书使用两个队列互相倒，但其实<strong>单个队列</strong>就能以最简洁优雅的方式实现栈！<br/>
        因为队列是环形结构，只需在 <code style="color: #7dd3fc; font-family: monospace;">push(x)</code> 时将 <code style="color: #7dd3fc; font-family: monospace;">x</code> 放入队尾，然后将前面原本存在的 <code style="color: #fbbf24; font-family: monospace;">size - 1</code> 个元素依次出队再入队重新排到队尾！
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 完美的 O(1) 栈顶读取</div>
        <p style="margin: 0; color: #94a3b8;">
        旋转完毕后，最新插入的元素 <code style="color: #34d399; font-family: monospace;">x</code> 就自然来到了<strong>队头</strong>！<br/>
        后续的 <code style="color: #34d399; font-family: monospace;">pop()</code> 和 <code style="color: #34d399; font-family: monospace;">top()</code> 只需要直接操作队头即可，时间复杂度均为真正的 <strong>O(1)</strong>！
        </p>
      </div>
    </div>
  </div>
`;

export const IMPLEMENT_STACK_USING_QUEUE_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'class MyStack {',
    '    Queue<Integer> queue;',
    '    public MyStack() {',
    '        queue = new LinkedList<>();',
    '    }',
    '    public void push(int x) {',
    '        queue.offer(x);',
    '        int size = queue.size();',
    '        // 将前面 size - 1 个元素出队并重新入队到末尾',
    '        while (size-- > 1) {',
    '            queue.offer(queue.poll());',
    '        }',
    '    }',
    '    public int pop() {',
    '        return queue.poll();',
    '    }',
    '    public int top() {',
    '        return queue.peek();',
    '    }',
    '    public boolean empty() {',
    '        return queue.isEmpty();',
    '    }',
    '}',
  ],
  cpp: [
    'class MyStack {',
    'public:',
    '    queue<int> que;',
    '    MyStack() {}',
    '    void push(int x) {',
    '        que.push(x);',
    '        int size = que.size();',
    '        while (size-- > 1) {',
    '            que.push(que.front());',
    '            que.pop();',
    '        }',
    '    }',
    '    int pop() {',
    '        int res = que.front();',
    '        que.pop();',
    '        return res;',
    '    }',
    '    int top() {',
    '        return que.front();',
    '    }',
    '    bool empty() {',
    '        return que.empty();',
    '    }',
    '};',
  ],
  python: [
    'from collections import deque',
    '',
    'class MyStack:',
    '    def __init__(self):',
    '        self.queue = deque()',
    '    def push(self, x: int) -> None:',
    '        self.queue.append(x)',
    '        for _ in range(len(self.queue) - 1):',
    '            self.queue.append(self.queue.popleft())',
    '    def pop(self) -> int:',
    '        return self.queue.popleft()',
    '    def top(self) -> int:',
    '        return self.queue[0]',
    '    def empty(self) -> bool:',
    '        return not self.queue',
  ],
  javascript: [
    'var MyStack = function() {',
    '    this.queue = [];',
    '};',
    'MyStack.prototype.push = function(x) {',
    '    this.queue.push(x);',
    '    for (let i = 0; i < this.queue.length - 1; i++) {',
    '        this.queue.push(this.queue.shift());',
    '    }',
    '};',
    'MyStack.prototype.pop = function() {',
    '    return this.queue.shift();',
    '};',
    'MyStack.prototype.top = function() {',
    '    return this.queue[0];',
    '};',
    'MyStack.prototype.empty = function() {',
    '    return this.queue.length === 0;',
    '};',
  ],
};
