/**
 * Class 036: 用一个辅助栈或递归对栈进行排序 (Sort Stack) - 步进编译器
 * 左程云算法通关课【必备篇】Class 036 / 程序员代码面试指南
 */

import { StepBase, HighlightTarget } from '../../../core/step-visualizer';

export interface SortStackStep extends StepBase {
  stack: number[];
  helpStack: number[];
  curVal?: number;
  phase: 'popCur' | 'backtrackHelp' | 'pushHelp' | 'pourBack' | 'finish';
  decision: string;
  message: string;
  log: string;
  metrics?: Record<string, string | number>;
  codeLine?: HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const SORT_STACK_CODES = {
  java: `import java.util.Stack;

public class SortStackByStack {
    // 借助一个额外栈 help 实现对原栈从大到小排序
    public static void sort(Stack<Integer> stack) {
        Stack<Integer> help = new Stack<>();
        while (!stack.isEmpty()) {
            int cur = stack.pop();
            // 如果 help 栈顶大于 cur，必须将 help 元素腾挪倒回 stack
            while (!help.isEmpty() && help.peek() > cur) {
                stack.push(help.pop());
            }
            help.push(cur);
        }
        // 倒回原栈，使得栈顶到栈底为降序
        while (!help.isEmpty()) {
            stack.push(help.pop());
        }
    }
}`,
  cpp: `#include <stack>
using namespace std;

class Solution {
public:
    static void sortStack(stack<int>& st) {
        stack<int> help;
        while (!st.empty()) {
            int cur = st.top();
            st.pop();
            while (!help.empty() && help.top() > cur) {
                st.push(help.top());
                help.pop();
            }
            help.push(cur);
        }
        while (!help.empty()) {
            st.push(help.top());
            help.pop();
        }
    }
};`,
  python: `class Solution:
    def sortStack(self, stack: list) -> None:
        help_stack = []
        while stack:
            cur = stack.pop()
            while help_stack and help_stack[-1] > cur:
                stack.append(help_stack.pop())
            help_stack.append(cur)
        while help_stack:
            stack.append(help_stack.pop())`,
  typescript: `function sortStack(stack: number[]): void {
    const help: number[] = [];
    while (stack.length > 0) {
        const cur = stack.pop()!;
        while (help.length > 0 && help[help.length - 1] > cur) {
            stack.push(help.pop()!);
        }
        help.push(cur);
    }
    while (help.length > 0) {
        stack.push(help.pop()!);
    }
}`
};

export const SORT_STACK_CODE_LINES = {
  entry: { java: 6, cpp: 8, python: 3, typescript: 2 },
  popCur: { java: 8, cpp: 10, python: 5, typescript: 4 },
  backtrack: { java: 10, cpp: 12, python: 6, typescript: 5 },
  pushHelp: { java: 13, cpp: 16, python: 8, typescript: 8 },
  pourBack: { java: 16, cpp: 19, python: 9, typescript: 10 },
  finish: { java: 17, cpp: 20, python: 10, typescript: 11 },
};

export function generateSortStackSteps(initArr: number[] = [3, 1, 4, 2]): SortStackStep[] {
  const steps: SortStackStep[] = [];
  const lines = SORT_STACK_CODE_LINES;

  const stack = [...initArr];
  const help: number[] = [];

  steps.push({
    stack: [...stack],
    helpStack: [...help],
    phase: 'popCur',
    decision: '开始执行辅助栈单调排序',
    message: `待排序栈 stack=[${stack.join(', ')}]，仅使用一个辅助栈 help。目标：将原栈元素按自顶向下严格降序排列。`,
    log: `sortStack: initial stack=[${stack.join(', ')}]`,
    codeLine: lines.entry,
    metrics: { '原始栈大小': stack.length, '辅助栈大小': 0 },
  });

  while (stack.length > 0) {
    const cur = stack.pop()!;
    steps.push({
      stack: [...stack],
      helpStack: [...help],
      curVal: cur,
      phase: 'popCur',
      decision: `从 stack 弹栈得到当前元素 cur = ${cur}`,
      message: `准备将 ${cur} 插入到保持有序的辅助栈 help 中。`,
      log: `pop cur = ${cur}`,
      codeLine: lines.popCur,
      statusBadge: { text: `暂存 cur=${cur}`, type: 'warning' },
      metrics: { '当前待排元素': cur, 'help栈顶': help.length > 0 ? help[help.length - 1] : '空' },
    });

  while (help.length > 0 && help[help.length - 1] > cur) {
      const moved = help.pop()!;
      stack.push(moved);
      steps.push({
        stack: [...stack],
        helpStack: [...help],
        curVal: cur,
        phase: 'backtrackHelp',
        decision: `help 栈顶 ${moved} 大于 cur (${cur})，腾挪！将 ${moved} 倒回 stack`,
        message: `为了保证 help 栈自底向顶单调递增，必须将比 ${cur} 大的元素暂时让位倒回 stack！`,
        log: `help.top ${moved} > cur ${cur}, move back to stack`,
        codeLine: lines.backtrack,
        statusBadge: { text: `腾挪回栈: ${moved}`, type: 'danger' },
      });
    }

    help.push(cur);
    steps.push({
      stack: [...stack],
      helpStack: [...help],
      curVal: cur,
      phase: 'pushHelp',
      decision: `单调条件满足，将 cur = ${cur} 压入 help 栈`,
      message: `此时 help 栈内部所有元素严格自底向顶升序：[${help.join(', ')}]`,
      log: `pushed ${cur} to help: help=[${help.join(', ')}]`,
      codeLine: lines.pushHelp,
      statusBadge: { text: `进入help: ${cur}`, type: 'success' },
    });
  }

  // 倒回原栈
  while (help.length > 0) {
    const val = help.pop()!;
    stack.push(val);
    steps.push({
      stack: [...stack],
      helpStack: [...help],
      phase: 'pourBack',
      decision: `将 help 栈顶 ${val} 倒回原栈 stack`,
      message: `因为 help 中自底向顶是升序，弹出倒回后，原栈 stack 自底向顶将是降序（栈顶最大）！`,
      log: `pour back ${val} from help to stack`,
      codeLine: lines.pourBack,
      statusBadge: { text: `倒回: ${val}`, type: 'info' },
    });
  }

  steps.push({
    stack: [...stack],
    helpStack: [],
    phase: 'finish',
    decision: '排序完成！原栈已有序',
    message: `栈排序达成：自顶向下为 [${[...stack].reverse().join(', ')}]！`,
    log: `sort done: stack = [${stack.join(', ')}]`,
    codeLine: lines.finish,
    statusBadge: { text: '排序达成', type: 'success' },
    metrics: { '最终元素数': stack.length, '排序状态': '完成' },
  });

  return steps;
}
