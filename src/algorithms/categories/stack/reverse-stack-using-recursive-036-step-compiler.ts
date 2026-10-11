import { StepBase, HighlightTarget } from '../../../core/step-visualizer';

export interface ReverseStackStep extends StepBase {
  stack: number[];
  bottomItem?: number;
  currentDepth: number;
  phase: 'bottomOut' | 'reverse' | 'entry' | 'finish';
  callStackList: string[];
  decision: string;
  message: string;
  log: string;
  metrics?: Record<string, string | number>;
  codeLine?: HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const REVERSE_STACK_CODES = {
  java: `import java.util.Stack;

public class ReverseStack {
    // 递归移除并返回栈底元素，上层所有元素原序下沉
    public static int bottomOut(Stack<Integer> stack) {
        int result = stack.pop();
        if (stack.isEmpty()) {
            return result;
        } else {
            int last = bottomOut(stack);
            stack.push(result);
            return last;
        }
    }

    // 递归逆序主函数：不使用任何额外数据结构
    public static void reverse(Stack<Integer> stack) {
        if (stack.isEmpty()) {
            return;
        }
        int bottom = bottomOut(stack);
        reverse(stack);
        stack.push(bottom);
    }
}`,
  cpp: `#include <stack>
using namespace std;

class Solution {
public:
    // 移除并返回栈底元素
    static int bottomOut(stack<int>& st) {
        int result = st.top();
        st.pop();
        if (st.empty()) {
            return result;
        } else {
            int last = bottomOut(st);
            st.push(result);
            return last;
        }
    }

    // 纯递归逆序整个栈
    static void reverse(stack<int>& st) {
        if (st.empty()) return;
        int bottom = bottomOut(st);
        reverse(st);
        st.push(bottom);
    }
};`,
  python: `class Solution:
    def bottomOut(self, stack: list) -> int:
        result = stack.pop()
        if not stack:
            return result
        else:
            last = self.bottomOut(stack)
            stack.append(result)
            return last

    def reverse(self, stack: list) -> None:
        if not stack:
            return
        bottom = self.bottomOut(stack)
        self.reverse(stack)
        stack.append(bottom)`,
  typescript: `function bottomOut(stack: number[]): number {
    const result = stack.pop()!;
    if (stack.length === 0) {
        return result;
    } else {
        const last = bottomOut(stack);
        stack.push(result);
        return last;
    }
}

function reverseStack(stack: number[]): void {
    if (stack.length === 0) return;
    const bottom = bottomOut(stack);
    reverseStack(stack);
    stack.push(bottom);
}`,
};

export const REVERSE_STACK_CODE_LINES = {
  entry: { java: 17, cpp: 20, python: 11, typescript: 12 },
  bottomOutEntry: { java: 5, cpp: 7, python: 2, typescript: 1 },
  bottomFound: { java: 8, cpp: 11, python: 5, typescript: 4 },
  bottomRestore: { java: 11, cpp: 14, python: 7, typescript: 6 },
  reverseRecurse: { java: 21, cpp: 23, python: 15, typescript: 14 },
  reversePush: { java: 22, cpp: 24, python: 16, typescript: 15 },
};

export function generateReverseStackSteps(initialElements: number[] = [1, 2, 3]): ReverseStackStep[] {
  const steps: ReverseStackStep[] = [];
  const lines = REVERSE_STACK_CODE_LINES;
  const simStack = [...initialElements];

  steps.push({
    stack: [...simStack],
    currentDepth: 0,
    phase: 'entry',
    callStackList: ['reverse(stack)'],
    decision: '准备逆序栈',
    message: `初始栈底为 ${simStack[0]}，栈顶为 ${simStack[simStack.length - 1]}。要求：绝不申请任何数组或额外栈，仅靠系统递归调用栈完成逆序！`,
    log: `reverse: initial stack = [${simStack.join(', ')}]`,
    codeLine: lines.entry,
    metrics: { '栈大小': simStack.length, '额外空间': 'O(1) 数据结构' },
  });

  function simBottomOut(stack: number[], depth: number, callHistory: string[]): number {
    const top = stack.pop()!;
    steps.push({
      stack: [...stack],
      bottomItem: top,
      currentDepth: depth,
      phase: 'bottomOut',
      callStackList: [...callHistory, `bottomOut: 暂存栈顶 ${top}`],
      decision: `弹栈并暂存顶层元素 ${top}`,
      message: `在当前系统栈帧中缓存 ${top}。若栈已空，说明 ${top} 就是当初的最底层元素！`,
      log: `bottomOut: popped ${top}, remaining stack depth ${stack.length}`,
      codeLine: lines.bottomOutEntry,
      statusBadge: { text: `暂存 ${top}`, type: 'warning' },
    });

    if (stack.length === 0) {
      steps.push({
        stack: [...stack],
        bottomItem: top,
        currentDepth: depth,
        phase: 'bottomOut',
        callStackList: [...callHistory, `🎯 命中栈底元素: ${top}`],
        decision: `栈已空！成功捕获栈底元素 ${top}`,
        message: `触碰递归基：直接返回 ${top}，不把 ${top} 压回，留给上层返回！`,
        log: `bottomOut: reached bottom ${top}`,
        codeLine: lines.bottomFound,
        statusBadge: { text: `捕获栈底 ${top}`, type: 'success' },
      });
      return top;
    } else {
      const bottom = simBottomOut(stack, depth + 1, [...callHistory, `bottomOut: 暂存 ${top}`]);
      stack.push(top);

      steps.push({
        stack: [...stack],
        bottomItem: bottom,
        currentDepth: depth,
        phase: 'bottomOut',
        callStackList: [...callHistory, `回溯压回暂存元素 ${top}`],
        decision: `回溯：将暂存的 ${top} 压回栈顶，并将栈底 ${bottom} 向上交出`,
        message: `先前暂存的非底部元素 ${top} 按原次序重新回到栈中，而真实的底部元素 ${bottom} 被安全抽出！`,
        log: `bottomOut: push back ${top}, passing bottom ${bottom}`,
        codeLine: lines.bottomRestore,
        statusBadge: { text: `复位 ${top}`, type: 'info' },
      });

      return bottom;
    }
  }

  function simReverse(stack: number[], depth: number, callHistory: string[]): void {
    if (stack.length === 0) return;

    const bottom = simBottomOut(stack, depth, [...callHistory, `reverse: 抽栈底`]);

    steps.push({
      stack: [...stack],
      bottomItem: bottom,
      currentDepth: depth,
      phase: 'reverse',
      callStackList: [...callHistory, `reverse: 剥离栈底 ${bottom}, 递归逆序剩余子栈`],
      decision: `成功抽出栈底 ${bottom}，递归逆序剩余的 ${stack.length} 个元素`,
      message: `将问题规约为规模减 1 的子栈逆序问题。`,
      log: `reverse: extracted bottom ${bottom}, recurse rest`,
      codeLine: lines.reverseRecurse,
      statusBadge: { text: `逆序子栈 (size=${stack.length})`, type: 'info' },
    });

    simReverse(stack, depth + 1, [...callHistory, `reverse(size=${stack.length})`]);

    stack.push(bottom);

    steps.push({
      stack: [...stack],
      bottomItem: bottom,
      currentDepth: depth,
      phase: 'reverse',
      callStackList: [...callHistory, `reverse: 将旧栈底 ${bottom} 压至新栈顶`],
      decision: `子栈已完全逆序！将当初抽出的底部元素 ${bottom} 压入成为最新栈顶`,
      message: `曾经的绝对底部，经过递归回溯后变成了最顶端，完美实现全局逆序！`,
      log: `reverse: pushed ${bottom} to top, new top is ${bottom}`,
      codeLine: lines.reversePush,
      statusBadge: { text: `沉底变顶 ${bottom}`, type: 'success' },
    });
  }

  simReverse(simStack, 0, ['Main: reverse']);

  steps.push({
    stack: [...simStack],
    currentDepth: 0,
    phase: 'finish',
    callStackList: ['Main: 完成'],
    decision: `逆序完成！当前栈底为 ${simStack[0]}，栈顶为 ${simStack[simStack.length - 1]}`,
    message: `纯依靠系统调用栈的嵌套暂存，零额外数据结构完成栈反转！`,
    log: `reverse done: final stack = [${simStack.join(', ')}]`,
    codeLine: lines.entry,
    statusBadge: { text: '逆序达成', type: 'success' },
    metrics: { '最终元素数': simStack.length, '逆序状态': '100% 完成' },
  });

  return steps;
}
