/**
 * 用栈实现队列 (Implement Queue using Stacks) - 步进编译器
 * LeetCode 232
 */

import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface MQStep {
  inStack: number[];
  outStack: number[];
  outputs: Array<{ op: string; value: number | boolean }>;
  currentOp: string;
  transferHappened: boolean;
  action: 'init' | 'push' | 'transfer' | 'pop' | 'peek' | 'empty' | 'done';
  message: string;
  codeLine: HighlightTarget;
}

export function buildImplementQueueUsingStackSteps(rawOpsInput: string): MQStep[] {
  const steps: MQStep[] = [];
  const inStack: number[] = [];
  const outStack: number[] = [];
  const outputs: Array<{ op: string; value: number | boolean }> = [];

  const lines = {
    init:     { java: 4,  cpp: 5,  python: 2,  javascript: 1 },
    push:     { java: 9,  cpp: 7,  python: 6,  javascript: 6 },
    transfer: { java: 25, cpp: 12, python: 11, javascript: 11 },
    pop:      { java: 13, cpp: 18, python: 12, javascript: 14 },
    peek:     { java: 17, cpp: 23, python: 15, javascript: 19 },
    empty:    { java: 20, cpp: 26, python: 18, javascript: 22 },
    done:     { java: 28, cpp: 28, python: 18, javascript: 23 },
  };

  const rawOps = (rawOpsInput || 'push 1, push 2, peek, pop, empty')
    .split(/[,，;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  steps.push({
    inStack: [],
    outStack: [],
    outputs: [],
    currentOp: 'init',
    transferHappened: false,
    action: 'init',
    message: '初始化：inStack (输入栈) 与 outStack (输出栈) 均为空',
    codeLine: lines.init,
  });

  for (let i = 0; i < rawOps.length; i++) {
    const opStr = rawOps[i];
    const parts = opStr.split(/\s+/);
    const op = parts[0].toLowerCase();
    const val = parts.length > 1 ? parseInt(parts[1], 10) : NaN;

    if (op === 'push') {
      const num = isNaN(val) ? 1 : val;
      inStack.push(num);

      steps.push({
        inStack: [...inStack],
        outStack: [...outStack],
        outputs: [...outputs],
        currentOp: `push(${num})`,
        transferHappened: false,
        action: 'push',
        message: `📥 执行 push(${num})：直接压入 inStack 栈顶`,
        codeLine: lines.push,
      });
    } else if (op === 'pop') {
      let transfer = false;
      if (outStack.length === 0) {
        transfer = true;
        while (inStack.length > 0) {
          outStack.push(inStack.pop()!);
        }

        steps.push({
          inStack: [...inStack],
          outStack: [...outStack],
          outputs: [...outputs],
          currentOp: 'dumpStackIn()',
          transferHappened: true,
          action: 'transfer',
          message: '🔀 outStack 为空！触发倾倒转移：将 inStack 全部元素依次弹出并压入 outStack，原顺序完全逆转为队头优先！',
          codeLine: lines.transfer,
        });
      }

      if (outStack.length > 0) {
        const popped = outStack.pop()!;
        outputs.push({ op: 'pop', value: popped });

        steps.push({
          inStack: [...inStack],
          outStack: [...outStack],
          outputs: [...outputs],
          currentOp: 'pop()',
          transferHappened: transfer,
          action: 'pop',
          message: `📤 执行 pop()：从 outStack 弹出栈顶元素 ${popped}（即队列头部）并返回`,
          codeLine: lines.pop,
        });
      } else {
        steps.push({
          inStack: [...inStack],
          outStack: [...outStack],
          outputs: [...outputs],
          currentOp: 'pop()',
          transferHappened: false,
          action: 'pop',
          message: '⚠️ 队列为空，pop() 无元素可弹出',
          codeLine: lines.pop,
        });
      }
    } else if (op === 'peek' || op === 'top') {
      let transfer = false;
      if (outStack.length === 0) {
        transfer = true;
        while (inStack.length > 0) {
          outStack.push(inStack.pop()!);
        }

        steps.push({
          inStack: [...inStack],
          outStack: [...outStack],
          outputs: [...outputs],
          currentOp: 'dumpStackIn()',
          transferHappened: true,
          action: 'transfer',
          message: '🔀 peek 操作检测到 outStack 为空，先执行倾倒转移',
          codeLine: lines.transfer,
        });
      }

      if (outStack.length > 0) {
        const peekVal = outStack[outStack.length - 1];
        outputs.push({ op: 'peek', value: peekVal });

        steps.push({
          inStack: [...inStack],
          outStack: [...outStack],
          outputs: [...outputs],
          currentOp: 'peek()',
          transferHappened: transfer,
          action: 'peek',
          message: `🔍 执行 peek()：查看到当前队头元素为 ${peekVal}（不弹出）`,
          codeLine: lines.peek,
        });
      } else {
        steps.push({
          inStack: [...inStack],
          outStack: [...outStack],
          outputs: [...outputs],
          currentOp: 'peek()',
          transferHappened: false,
          action: 'peek',
          message: '⚠️ 队列为空，peek() 无队头元素',
          codeLine: lines.peek,
        });
      }
    } else if (op === 'empty') {
      const isEmpty = inStack.length === 0 && outStack.length === 0;
      outputs.push({ op: 'empty', value: isEmpty });

      steps.push({
        inStack: [...inStack],
        outStack: [...outStack],
        outputs: [...outputs],
        currentOp: 'empty()',
        transferHappened: false,
        action: 'empty',
        message: `⚖️ 执行 empty()：inStack 与 outStack 均${isEmpty ? '为空，返回 true' : '不全为空，返回 false'}`,
        codeLine: lines.empty,
      });
    }
  }

  steps.push({
    inStack: [...inStack],
    outStack: [...outStack],
    outputs: [...outputs],
    currentOp: 'done',
    transferHappened: false,
    action: 'done',
    message: '🎉 操作序列执行完毕！',
    codeLine: lines.done,
  });

  return steps;
}
