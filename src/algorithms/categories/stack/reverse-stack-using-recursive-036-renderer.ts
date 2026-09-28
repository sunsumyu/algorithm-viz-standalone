/**
 * Class 036: 不申请额外数据结构逆序一个栈 (Reverse Stack Using Recursive)
 * 左程云算法通关课【必备篇】Class 036 / 程序员代码面试指南
 * 核心原语：两个相互嵌套的递归过程
 * 1. bottomOut(stack)：递归移除并返回栈底元素，其余元素原序下落
 * 2. reverse(stack)：主递归，拿出栈底后递归逆序剩余栈，最后将该栈底压入栈顶
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase, HighlightTarget } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

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
}`
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

export function renderReverseStackCanvas(container: HTMLElement, step: ReverseStackStep): void {
  const stackItems = step.stack.map((val, idx) => {
    const isTop = idx === step.stack.length - 1;
    const isBottom = idx === 0;
    return `
      <div style="background: ${isTop ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.8)'}; border: 1px solid ${isTop ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'}; border-radius: 6px; padding: 10px 16px; margin: 4px 0; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 700; color: ${isTop ? '#38bdf8' : '#e2e8f0'}; font-size: 16px;">${val}</span>
        <span style="font-size: 11px; color: ${isTop ? '#38bdf8' : isBottom ? '#a78bfa' : '#64748b'}; font-weight: 600;">
          ${isTop ? '🔝 TOP (栈顶)' : isBottom ? '⚓ BOTTOM (栈底)' : `Index ${idx}`}
        </span>
      </div>
    `;
  }).reverse().join('');

  container.innerHTML = `
    <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif; color: #e2e8f0; display: flex; flex-direction: column; gap: 14px;">
      <!-- 顶部状态指示栏 -->
      <div style="display: flex; gap: 12px; align-items: center; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px 16px;">
        <span style="font-size: 13px; font-weight: 700; color: #94a3b8;">🎯 当前执行阶段:</span>
        <span style="background: #0284c7; color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 700;">
          ${step.phase === 'bottomOut' ? '🔍 bottomOut (递归抽取栈底)' : step.phase === 'reverse' ? '🔄 reverse (主递归逆序)' : '🚀 入口就绪'}
        </span>
        ${step.bottomItem !== undefined ? `
          <span style="margin-left: auto; font-size: 13px; color: #fbbf24;">
            暂存/抽取值: <strong style="font-size: 16px; color: #f59e0b;">${step.bottomItem}</strong>
          </span>
        ` : ''}
      </div>

      <!-- 主视图：物理栈 vs 系统调用栈 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <!-- 物理栈可视化容器 -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-weight: 700; color: #38bdf8; font-size: 13px;">📥 目标数据栈 (Stack)</span>
            <span style="font-size: 11px; color: #94a3b8;">容量: ${step.stack.length} 个元素</span>
          </div>
          <div style="border-left: 2px solid #475569; border-right: 2px solid #475569; border-bottom: 3px solid #38bdf8; border-radius: 0 0 8px 8px; padding: 8px; min-height: 200px; display: flex; flex-direction: column; justify-content: flex-end;">
            ${step.stack.length > 0 ? stackItems : '<div style="text-align: center; color: #64748b; font-size: 13px; margin: auto;">(栈目前为空，元素已全部暂存于系统递归栈帧中)</div>'}
          </div>
        </div>

        <!-- 系统调用栈可视化 -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-weight: 700; color: #a78bfa; font-size: 13px;">🥞 系统调用栈追踪 (Call Stack)</span>
            <span style="font-size: 11px; background: #6d28d9; color: white; padding: 2px 6px; border-radius: 4px;">深度: ${step.currentDepth}</span>
          </div>
          <div style="font-family: monospace; font-size: 12px; color: #c4b5fd; line-height: 1.6; background: rgba(0, 0, 0, 0.3); padding: 10px; border-radius: 6px; flex: 1; overflow-y: auto;">
            ${step.callStackList.map((entry, idx) => `
              <div style="padding: 2px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.04);">
                ${idx === step.callStackList.length - 1 ? '👉 ' : '   '}${entry}
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- 核心教学公式卡 -->
      ${renderFormulaCard(
        '左程云栈逆序双层递归模型',
        '\\text{reverse}(st) \\iff \\text{bottom} = \\text{bottomOut}(st); \\quad \\text{reverse}(st); \\quad st.\\text{push}(\\text{bottom});',
        'bottomOut 过程将栈底抽离并将上面所有元素原封不动放回；主函数拿到栈底后，递归逆序规模为 N-1 的剩余栈；最后把拿到的原栈底压回栈顶，实现无额外数据结构下的栈逆序。'
      )}
    </div>
  `;
}

export const reverseStackVisualizer = registerDeclarativeAlgorithm<ReverseStackStep>({
  id: 'reverse-stack-using-recursive-036',
  aliases: ['class036-code01', 'reverse-stack', 'reverse-stack-recursive', 'reverse-stack-using-recursive'],
  name: 'Class 036: 不申请额外数据结构逆序一个栈 (Reverse Stack)',
  category: 'stack',
  icon: '🔄',
  difficulty: 2,
  levelOrder: 36,
  learningGoal: '深刻理解递归的嵌套调用与系统调用栈天然暂存状态的能力，掌握 bottomOut 与 reverse 组合原语',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 036 / 程序员代码面试指南)</h3>
      <p>给你一个栈，请你将这个栈<strong>完全逆序</strong>。要求：</p>
      <ul>
        <li><strong>严禁申请额外的数据结构</strong>（严禁使用数组、队列、其他辅助栈）；</li>
        <li><strong>只能使用递归函数</strong>与系统调用栈本身的局部变量来完成。</li>
      </ul>
      <h4>双递归分治精髓：</h4>
      <ol>
        <li><code>bottomOut(stack)</code>：递归找到栈底元素并将其从栈中真正拔除，同时在回溯时将所有上方元素原样重新压入；</li>
        <li><code>reverse(stack)</code>：调用 <code>bottomOut</code> 抽取栈底暂存于当前栈帧，递归调用自己逆序剩余栈，最后将抽出的栈底压入成为最新栈顶！</li>
      </ol>
    </div>
  `,
  codeLanguages: REVERSE_STACK_CODES,
  inputs: [
    {
      id: 'elements',
      label: '栈初始元素 (自底向顶逗号分隔)',
      type: 'select',
      defaultValue: '1,2,3',
      options: [
        { label: '3个元素: 1, 2, 3 (底=1, 顶=3)', value: '1,2,3' },
        { label: '4个元素: 10, 20, 30, 40', value: '10,20,30,40' },
        { label: '逆序对用例: 5, 4, 3, 2, 1', value: '5,4,3,2,1' },
      ],
    },
  ],
  generateSteps: (input) => {
    const raw = String(input.elements || '1,2,3');
    const nums = raw.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    return generateReverseStackSteps(nums.length > 0 ? nums : [1, 2, 3]);
  },
  renderCanvas: (container, step) => {
    renderReverseStackCanvas(container, step);
  },
});
