/**
 * Class 036: 用一个辅助栈或递归对栈进行排序 (Sort Stack)
 * 左程云算法通关课【必备篇】Class 036 / 程序员代码面试指南
 * 核心原语：
 * 方法一（辅助栈经典法）：借助一个单调辅助栈 help，将 stack 栈顶与 help 栈顶对比，如果不满足单调性则将 help 元素腾挪回 stack，cur 归位
 * 方法二（纯递归无辅助数据结构法）：通过递归 deep 深度过程找到栈内最大值并沉底
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase, HighlightTarget } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

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

export function renderSortStackCanvas(container: HTMLElement, step: SortStackStep): void {
  const renderStackColumn = (items: number[], title: string, color: string, isHelper: boolean) => {
    const renderedItems = items.map((val, idx) => {
      const isTop = idx === items.length - 1;
      return `
        <div style="background: ${isTop ? `${color}33` : 'rgba(30, 41, 59, 0.8)'}; border: 1px solid ${isTop ? color : 'rgba(255, 255, 255, 0.08)'}; border-radius: 6px; padding: 8px 14px; margin: 4px 0; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 700; color: ${isTop ? color : '#e2e8f0'}; font-size: 15px;">${val}</span>
          <span style="font-size: 10px; color: ${isTop ? color : '#64748b'};">${isTop ? 'TOP' : `idx ${idx}`}</span>
        </div>
      `;
    }).reverse().join('');

    return `
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; flex: 1;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <span style="font-weight: 700; color: ${color}; font-size: 13px;">${title}</span>
          <span style="font-size: 11px; color: #94a3b8;">${items.length} 元素</span>
        </div>
        <div style="border-left: 2px solid #475569; border-right: 2px solid #475569; border-bottom: 3px solid ${color}; border-radius: 0 0 8px 8px; padding: 8px; min-height: 220px; display: flex; flex-direction: column; justify-content: flex-end;">
          ${items.length > 0 ? renderedItems : `<div style="text-align: center; color: #64748b; font-size: 12px; margin: auto;">(${isHelper ? '辅助栈当前为空' : '原栈已清空'})</div>`}
        </div>
      </div>
    `;
  };

  container.innerHTML = `
    <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif; color: #e2e8f0; display: flex; flex-direction: column; gap: 14px;">
      <!-- 状态条 -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px 16px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 13px; font-weight: 700; color: #94a3b8;">当前动作:</span>
          <span style="background: #0284c7; color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 700;">
            ${step.phase === 'popCur' ? '📤 弹出待排元素' : step.phase === 'backtrackHelp' ? '↩️ help 元素腾挪回栈' : step.phase === 'pushHelp' ? '📥 入辅助栈' : '📦 倒回原栈'}
          </span>
        </div>
        ${step.curVal !== undefined ? `
          <div style="font-size: 13px; color: #f59e0b;">
            当前待归位元素 cur: <strong style="font-size: 16px; color: #fbbf24;">${step.curVal}</strong>
          </div>
        ` : ''}
      </div>

      <!-- 双栈沙盘 -->
      <div style="display: flex; gap: 14px;">
        ${renderStackColumn(step.stack, '📥 待排序原栈 (Stack)', '#38bdf8', false)}
        ${renderStackColumn(step.helpStack, '🛡️ 单调辅助栈 (Help)', '#10b981', true)}
      </div>

      <!-- 公式说明卡 -->
      ${renderFormulaCard(
        '辅助栈单调腾挪不变量',
        '\\forall x \\in \\text{help}, \\quad \\text{bottom}(x) \\le \\text{top}(x) \\quad (\\text{若 } \\text{help.top}() > cur, \\text{ 弹出倒回 } stack)',
        '每次从原栈取出一个数 cur，将辅助栈中所有大于 cur 的元素暂时退回原栈，使 cur 能够沉降到属于它的升序位置；最终所有元素汇聚于 help 栈并一次性倒回原栈。'
      )}
    </div>
  `;
}

export const sortStackVisualizer = registerDeclarativeAlgorithm<SortStackStep>({
  id: 'sort-stack-using-recursive-036',
  aliases: ['class036-code02', 'sort-stack', 'sort-stack-by-stack', 'sort-stack-using-helper'],
  name: 'Class 036: 使用一个辅助栈对栈进行排序 (Sort Stack)',
  category: 'stack',
  icon: '📶',
  difficulty: 2,
  levelOrder: 36,
  learningGoal: '掌握仅用一个辅助栈进行单调腾挪排序的核心思想与腾挪归位机制',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 036 / 程序员代码面试指南)</h3>
      <p>一个栈中元素的类型为整型，现在想将该栈从顶到底按<strong>从大到小</strong>的顺序排序，<strong>只许申请一个额外的辅助栈</strong>。除此之外，可以申请变量，但不能申请额外的数据结构。</p>
      <h4>算法核心规则：</h4>
      <ol>
        <li>从原栈 <code>stack</code> 弹出一个元素记为 <code>cur</code>；</li>
        <li>如果辅助栈 <code>help</code> 不为空且 <code>help</code> 栈顶元素大于 <code>cur</code>，则将 <code>help</code> 的元素逐个弹出并压回 <code>stack</code>；</li>
        <li>直到 <code>help</code> 栈顶小于或等于 <code>cur</code> 时，将 <code>cur</code> 压入 <code>help</code>；</li>
        <li>重复上述步骤直到 <code>stack</code> 为空，最后将 <code>help</code> 中的元素倒回 <code>stack</code>。</li>
      </ol>
    </div>
  `,
  codeLanguages: SORT_STACK_CODES,
  inputs: [
    {
      id: 'elements',
      label: '栈初始元素 (自底向顶逗号分隔)',
      type: 'select',
      defaultValue: '3,1,4,2',
      options: [
        { label: '乱序: 3, 1, 4, 2', value: '3,1,4,2' },
        { label: '逆序: 5, 4, 3, 2, 1', value: '5,4,3,2,1' },
        { label: '含重复值: 2, 5, 2, 1, 3', value: '2,5,2,1,3' },
      ],
    },
  ],
  generateSteps: (input) => {
    const raw = String(input.elements || '3,1,4,2');
    const nums = raw.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    return generateSortStackSteps(nums.length > 0 ? nums : [3, 1, 4, 2]);
  },
  renderCanvas: (container, step) => {
    renderSortStackCanvas(container, step);
  },
});
