/**
 * 用队列实现栈 (Implement Stack using Queues) - 步进编译器
 * LeetCode 225
 */

import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface MSStep {
  queue: number[];
  outputs: Array<{ op: string; value: number | boolean }>;
  currentOp: string;
  rotatingItem: number | null;
  rotateStep: number;
  totalRotate: number;
  action: 'init' | 'push_offer' | 'rotate_step' | 'pop' | 'top' | 'empty' | 'done';
  message: string;
  codeLine: HighlightTarget;
}

export function buildImplementStackUsingQueueSteps(rawOpsInput: string): MSStep[] {
  const steps: MSStep[] = [];
  const queue: number[] = [];
  const outputs: Array<{ op: string; value: number | boolean }> = [];

  const lines = {
    init:   { java: 4,  cpp: 4,  python: 4,  javascript: 1 },
    push:   { java: 7,  cpp: 6,  python: 7,  javascript: 5 },
    rotate: { java: 11, cpp: 9,  python: 9,  javascript: 7 },
    pop:    { java: 15, cpp: 16, python: 11, javascript: 11 },
    top:    { java: 18, cpp: 19, python: 13, javascript: 14 },
    empty:  { java: 21, cpp: 22, python: 15, javascript: 17 },
    done:   { java: 23, cpp: 24, python: 15, javascript: 18 },
  };

  const rawOps = (rawOpsInput || 'push 1, push 2, top, pop, empty')
    .split(/[,，;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  steps.push({
    queue: [],
    outputs: [],
    currentOp: 'init',
    rotatingItem: null,
    rotateStep: 0,
    totalRotate: 0,
    action: 'init',
    message: '初始化：单队列为空，采用入队后循环旋转 (size - 1) 次策略',
    codeLine: lines.init,
  });

  for (let i = 0; i < rawOps.length; i++) {
    const opStr = rawOps[i];
    const parts = opStr.split(/\s+/);
    const op = parts[0].toLowerCase();
    const val = parts.length > 1 ? parseInt(parts[1], 10) : NaN;

    if (op === 'push') {
      const num = isNaN(val) ? 1 : val;
      const prevSize = queue.length;

      queue.push(num);

      steps.push({
        queue: [...queue],
        outputs: [...outputs],
        currentOp: `push(${num})`,
        rotatingItem: null,
        rotateStep: 0,
        totalRotate: prevSize,
        action: 'push_offer',
        message: `📥 执行 push(${num})：首先进入队尾，准备将前面的 ${prevSize} 个元素循环旋转排到其后`,
        codeLine: lines.push,
      });

      // 旋转前面 prevSize 个元素
      for (let r = 0; r < prevSize; r++) {
        const rot = queue.shift()!;
        queue.push(rot);

        steps.push({
          queue: [...queue],
          outputs: [...outputs],
          currentOp: `rotate(${r + 1}/${prevSize})`,
          rotatingItem: rot,
          rotateStep: r + 1,
          totalRotate: prevSize,
          action: 'rotate_step',
          message: `🔄 旋转中 (${r + 1}/${prevSize})：将队头元素 ${rot} 出队并重新推到队尾，使最新元素 ${num} 逐步移向队头`,
          codeLine: lines.rotate,
        });
      }
    } else if (op === 'pop') {
      if (queue.length > 0) {
        const popped = queue.shift()!;
        outputs.push({ op: 'pop', value: popped });

        steps.push({
          queue: [...queue],
          outputs: [...outputs],
          currentOp: 'pop()',
          rotatingItem: null,
          rotateStep: 0,
          totalRotate: 0,
          action: 'pop',
          message: `📤 执行 pop()：队头即当前栈顶元素 ${popped}，直接 O(1) 出队并返回`,
          codeLine: lines.pop,
        });
      } else {
        steps.push({
          queue: [...queue],
          outputs: [...outputs],
          currentOp: 'pop()',
          rotatingItem: null,
          rotateStep: 0,
          totalRotate: 0,
          action: 'pop',
          message: '⚠️ 队列为空，pop() 无元素可出栈',
          codeLine: lines.pop,
        });
      }
    } else if (op === 'top' || op === 'peek') {
      if (queue.length > 0) {
        const topVal = queue[0];
        outputs.push({ op: 'top', value: topVal });

        steps.push({
          queue: [...queue],
          outputs: [...outputs],
          currentOp: 'top()',
          rotatingItem: null,
          rotateStep: 0,
          totalRotate: 0,
          action: 'top',
          message: `🔍 执行 top()：查看当前队头（即栈顶）元素为 ${topVal}（不弹出）`,
          codeLine: lines.top,
        });
      } else {
        steps.push({
          queue: [...queue],
          outputs: [...outputs],
          currentOp: 'top()',
          rotatingItem: null,
          rotateStep: 0,
          totalRotate: 0,
          action: 'top',
          message: '⚠️ 队列为空，top() 无栈顶元素',
          codeLine: lines.top,
        });
      }
    } else if (op === 'empty') {
      const isEmpty = queue.length === 0;
      outputs.push({ op: 'empty', value: isEmpty });

      steps.push({
        queue: [...queue],
        outputs: [...outputs],
        currentOp: 'empty()',
        rotatingItem: null,
        rotateStep: 0,
        totalRotate: 0,
        action: 'empty',
        message: `⚖️ 执行 empty()：队列${isEmpty ? '为空，返回 true' : '非空，返回 false'}`,
        codeLine: lines.empty,
      });
    }
  }

  steps.push({
    queue: [...queue],
    outputs: [...outputs],
    currentOp: 'done',
    rotatingItem: null,
    rotateStep: 0,
    totalRotate: 0,
    action: 'done',
    message: '🎉 操作序列执行完毕！',
    codeLine: lines.done,
  });

  return steps;
}
