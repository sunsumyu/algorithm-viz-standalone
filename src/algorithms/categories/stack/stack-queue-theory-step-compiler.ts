import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface SQStep {
  mode: 'stack' | 'queue';
  data: number[];
  action: 'init' | 'push' | 'pop' | 'enqueue' | 'dequeue' | 'peek' | 'done';
  value: number | null;
  message: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
  log?: string;
}

export function buildStackSteps(): SQStep[] {
  const steps: SQStep[] = [];
  const data: number[] = [];

  const stackLines = {
    init:     { java: 2, cpp: 2, python: 2, javascript: 2 },
    push1:    { java: 3, cpp: 3, python: 3, javascript: 3 },
    pushNext: { java: 4, cpp: 4, python: 4, javascript: 4 },
    peek:     { java: 5, cpp: 5, python: 5, javascript: 5 },
    pop:      { java: 6, cpp: 6, python: 6, javascript: 6 },
    done:     { java: 6, cpp: 6, python: 6, javascript: 6 },
  };

  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'init',
    value: null,
    message: '初始化空栈：栈为空，仅允许在栈顶一端进行 push 和 pop',
    codeLine: stackLines.init,
  });

  // push 1
  data.push(1);
  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'push',
    value: 1,
    message: 'push(1)：将元素 1 压入栈顶。栈内容: [1]',
    codeLine: stackLines.push1,
  });

  // push 2
  data.push(2);
  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'push',
    value: 2,
    message: 'push(2)：将元素 2 压入栈顶。栈内容: [1, 2]',
    codeLine: stackLines.pushNext,
  });

  // push 3
  data.push(3);
  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'push',
    value: 3,
    message: 'push(3)：将元素 3 压入栈顶。栈内容: [1, 2, 3]',
    codeLine: stackLines.pushNext,
  });

  // peek
  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'peek',
    value: 3,
    message: 'peek()：查看栈顶元素为 3（不改变栈状态）',
    codeLine: stackLines.peek,
  });

  // pop 3
  data.pop();
  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'pop',
    value: 3,
    message: 'pop()：弹出栈顶元素 3。后进先出 (LIFO)，栈剩余: [1, 2]',
    codeLine: stackLines.pop,
  });

  // pop 2
  data.pop();
  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'pop',
    value: 2,
    message: 'pop()：弹出栈顶元素 2。栈剩余: [1]',
    codeLine: stackLines.pop,
  });

  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'done',
    value: null,
    message: '🎉 栈操作演示完成！完美展示 LIFO (后入先出) 行为',
    codeLine: stackLines.done,
  });

  return steps;
}

export function buildQueueSteps(): SQStep[] {
  const steps: SQStep[] = [];
  const data: number[] = [];

  const queueLines = {
    init:        { java: 9,  cpp: 9,  python: 10, javascript: 9 },
    enqueue1:    { java: 10, cpp: 10, python: 11, javascript: 10 },
    enqueueNext: { java: 11, cpp: 11, python: 12, javascript: 11 },
    peek:        { java: 12, cpp: 12, python: 13, javascript: 12 },
    dequeue:     { java: 13, cpp: 13, python: 14, javascript: 13 },
    done:        { java: 13, cpp: 13, python: 14, javascript: 13 },
  };

  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'init',
    value: null,
    message: '初始化空队列：队列为空，在一端（队尾）入队，另一端（队头）出队',
    codeLine: queueLines.init,
  });

  // offer 10
  data.push(10);
  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'enqueue',
    value: 10,
    message: 'offer(10)：元素 10 进入队尾。队列: [10]',
    codeLine: queueLines.enqueue1,
  });

  // offer 20
  data.push(20);
  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'enqueue',
    value: 20,
    message: 'offer(20)：元素 20 进入队尾。队列: [10, 20]',
    codeLine: queueLines.enqueueNext,
  });

  // offer 30
  data.push(30);
  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'enqueue',
    value: 30,
    message: 'offer(30)：元素 30 进入队尾。队列: [10, 20, 30]',
    codeLine: queueLines.enqueueNext,
  });

  // peek
  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'peek',
    value: 10,
    message: 'peek()：查看队头元素为 10（最早进入的元素）',
    codeLine: queueLines.peek,
  });

  // poll 10
  data.shift();
  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'dequeue',
    value: 10,
    message: 'poll()：队头元素 10 出队。先进先出 (FIFO)，队列剩余: [20, 30]',
    codeLine: queueLines.dequeue,
  });

  // poll 20
  data.shift();
  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'dequeue',
    value: 20,
    message: 'poll()：队头元素 20 出队。队列剩余: [30]',
    codeLine: queueLines.dequeue,
  });

  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'done',
    value: null,
    message: '🎉 队列操作演示完成！完美展示 FIFO (先入先出) 行为',
    codeLine: queueLines.done,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withMetrics(steps: SQStep[]): SQStep[] {
  return steps.map((s) => {
    const isStack = s.mode === 'stack';
    const topOrFront = s.data.length > 0 ? (isStack ? s.data[s.data.length - 1] : s.data[0]) : null;

    return {
      ...s,
      log: s.message,
      metrics: {
        'cur-mode': isStack ? '栈 (Stack - LIFO)' : '队列 (Queue - FIFO)',
        'top-or-front': topOrFront !== null ? String(topOrFront) : '（空）',
        action: s.action.toUpperCase(),
        size: String(s.data.length),
      },
    };
  });
}
