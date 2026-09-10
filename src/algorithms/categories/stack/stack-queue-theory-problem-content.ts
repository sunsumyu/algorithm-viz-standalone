/**
 * 栈与队列理论基础 (Stack & Queue Theory)
 * 领域知识与精讲配置声明
 */

export const STACK_QUEUE_THEORY_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">Theory</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Foundation</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">栈与队列理论基础 (Stack & Queue)</h2>
    </div>
    <p style="margin: 0;"><strong>栈 (Stack)</strong> 是一种 <strong>后入先出 (LIFO, Last In First Out)</strong> 的线性数据结构；<strong>队列 (Queue)</strong> 是一种 <strong>先入先出 (FIFO, First In First Out)</strong> 的线性数据结构。</p>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 4px;">
        <div style="color: #60a5fa; font-weight: 700;">🥞 栈 (Stack - LIFO)</div>
        <div style="font-size: 11px; color: #94a3b8;">• 操作限制：仅允许在一端（栈顶 Top）进行插入与删除</div>
        <div style="font-size: 11px; color: #94a3b8;">• 核心操作：push(x), pop(), peek(), isEmpty()</div>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 4px;">
        <div style="color: #34d399; font-weight: 700;">🔄 队列 (Queue - FIFO)</div>
        <div style="font-size: 11px; color: #94a3b8;">• 操作限制：在一端（队尾 Rear）插入，另一端（队头 Front）删除</div>
        <div style="font-size: 11px; color: #94a3b8;">• 核心操作：offer(x)/enqueue, poll()/dequeue, peek()</div>
      </div>
    </div>
  </div>
`;

export const STACK_QUEUE_THEORY_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 工业级实现底层考点：C++ STL 与 Java Collections 机制
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① C++ STL 考点（容器适配器）</div>
        <p style="margin: 0; color: #94a3b8;">
        • <code style="color: #7dd3fc; font-family: monospace;">std::stack</code> 和 <code style="color: #7dd3fc; font-family: monospace;">std::queue</code> <strong>不是容器</strong>，而是<strong>容器适配器 (Container Adapter)</strong>！<br/>
        • 默认底层容器为 <code style="color: #34d399; font-family: monospace;">std::deque</code>（双端队列），也可指定为 <code style="color: #fbbf24; font-family: monospace;">std::vector</code> 或 <code style="color: #fbbf24; font-family: monospace;">std::list</code>。<br/>
        • 栈和队列<strong>不提供迭代器 (iterator)</strong>，以保证严格的 LIFO / FIFO 访问受控语义！
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② Java 考点（推荐使用 ArrayDeque）</div>
        <p style="margin: 0; color: #94a3b8;">
        • Java 中继承自 Vector 的 <code style="color: #f87171; font-family: monospace;">Stack</code> 类有全量 synchronized 锁性能较差，官方<strong>推荐使用 Deque 接口</strong>（如 <code style="color: #34d399; font-family: monospace;">ArrayDeque</code> 或 <code style="color: #34d399; font-family: monospace;">LinkedList</code>）来实现栈与队列！
        </p>
      </div>
    </div>
  </div>
`;

export const STACK_QUEUE_THEORY_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    '// 1. 栈操作演示 (使用 ArrayDeque)',
    'Deque<Integer> stack = new ArrayDeque<>();',
    'stack.push(1); // 压栈 [1]',
    'stack.push(2); // 压栈 [2, 1] (栈顶在左)',
    'int top = stack.peek(); // 查看栈顶 2',
    'int popped = stack.pop(); // 出栈 2，剩余 [1]',
    '',
    '// 2. 队列操作演示',
    'Queue<Integer> queue = new ArrayDeque<>();',
    'queue.offer(10); // 入队 [10]',
    'queue.offer(20); // 入队 [10, 20]',
    'int front = queue.peek(); // 查看队头 10',
    'int polled = queue.poll(); // 出队 10，剩余 [20]',
  ],
  cpp: [
    '// 1. 栈操作演示 (std::stack)',
    'stack<int> st;',
    'st.push(1); // 压栈',
    'st.push(2); // 压栈',
    'int topVal = st.top(); // 访问栈顶 2',
    'st.pop(); // 弹出栈顶 2',
    '',
    '// 2. 队列操作演示 (std::queue)',
    'queue<int> que;',
    'que.push(10); // 入队',
    'que.push(20); // 入队',
    'int frontVal = que.front(); // 访问队头 10',
    'que.pop(); // 弹出队头 10',
  ],
  python: [
    '# 1. 栈操作演示 (List / deque)',
    'stack = []',
    'stack.append(1) # 压栈',
    'stack.append(2) # 压栈',
    'top = stack[-1] # 栈顶 2',
    'popped = stack.pop() # 出栈 2',
    '',
    '# 2. 队列操作演示 (collections.deque)',
    'from collections import deque',
    'queue = deque()',
    'queue.append(10) # 入队',
    'queue.append(20) # 入队',
    'front = queue[0] # 队头 10',
    'polled = queue.popleft() # 出队 10',
  ],
  javascript: [
    '// 1. 栈操作演示 (数组模拟)',
    'const stack = [];',
    'stack.push(1); // 压栈',
    'stack.push(2); // 压栈',
    'const top = stack[stack.length - 1]; // 栈顶 2',
    'const popped = stack.pop(); // 出栈 2',
    '',
    '// 2. 队列操作演示 (数组模拟)',
    'const queue = [];',
    'queue.push(10); // 入队',
    'queue.push(20); // 入队',
    'const front = queue[0]; // 队头 10',
    'const polled = queue.shift(); // 出队 10',
  ],
};
