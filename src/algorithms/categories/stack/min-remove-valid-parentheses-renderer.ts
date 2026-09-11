/**
 * Hard 28: 移除无效的括号 (Minimum Remove to Make Valid Parentheses)
 * LeetCode 1249 (Medium-Hard / 经典栈与字符串高频题)
 * 核心机制:
 *  用栈维护左括号的索引，遇到未匹配的右括号直接标记删除
 *  遍历结束后，栈中残余的左括号也是多余的，标记删除
 *  第二遍线性扫描根据布尔标记表跳过无效字符，构造出最短平衡括号字符串
 *  时间复杂度严格 O(N)，空间复杂度 O(N)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';

export interface ParenthesesStep extends StepBase {
  s: string;
  currentIndex: number | null;
  stack: number[];
  invalidIndices: number[];
  resultStr: string;
  phase: 'init' | 'scanning' | 'clean_unmatched_left' | 'reconstruct' | 'finish';
  message: string;
  log: string;
  codeLine: number;
}

export const MIN_REMOVE_PARENTHESES_CODES = {
  java: `public class Solution {
    public String minRemoveToMakeValid(String s) {
        boolean[] invalid = new boolean[s.length()];
        Deque<Integer> stack = new ArrayDeque<>();

        // 1. 扫描标记无效右括号，并记录左括号索引
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '(') {
                stack.push(i);
            } else if (c == ')') {
                if (stack.isEmpty()) {
                    invalid[i] = true; // 多余右括号
                } else {
                    stack.pop(); // 成功匹配一对
                }
            }
        }

        // 2. 栈中残留的均为多余左括号
        while (!stack.isEmpty()) {
            invalid[stack.pop()] = true;
        }

        // 3. 线性重构合法串
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            if (!invalid[i]) sb.append(s.charAt(i));
        }
        return sb.toString();
    }
}`,
  cpp: `class Solution {
public:
    string minRemoveToMakeValid(string s) {
        vector<bool> invalid(s.size(), false);
        stack<int> st;
        for (int i = 0; i < s.size(); i++) {
            if (s[i] == '(') st.push(i);
            else if (s[i] == ')') {
                if (st.empty()) invalid[i] = true;
                else st.pop();
            }
        }
        while (!st.empty()) {
            invalid[st.top()] = true;
            st.pop();
        }
        string res = "";
        for (int i = 0; i < s.size(); i++) {
            if (!invalid[i]) res += s[i];
        }
        return res;
    }
};`,
  python: `class Solution:
    def minRemoveToMakeValid(self, s: str) -> str:
        invalid = [False] * len(s)
        stack = []
        for i, c in enumerate(s):
            if c == '(':
                stack.append(i)
            elif c == ')':
                if not stack:
                    invalid[i] = True
                else:
                    stack.pop()
        for i in stack:
            invalid[i] = True
        return "".join([c for i, c in enumerate(s) if not invalid[i]])`,
};

export function buildMinRemoveSteps(s: string = 'lee(t(c)o)de)'): ParenthesesStep[] {
  const steps: ParenthesesStep[] = [];
  const invalid = new Array(s.length).fill(false);
  const stack: number[] = [];

  // Step 0: Init
  steps.push({
    s,
    currentIndex: null,
    stack: [],
    invalidIndices: [],
    resultStr: '',
    phase: 'init',
    message: `算法启动：待修复字符串 s = "${s}"。准备通过索引栈与布尔标记表完成一趟线性平衡筛选。`,
    log: `初始化有效括号移除器: len=${s.length}`,
    codeLine: 4,
  });

  // Phase 1: Scan
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(') {
      stack.push(i);
      steps.push({
        s,
        currentIndex: i,
        stack: [...stack],
        invalidIndices: invalid.map((v, idx) => (v ? idx : -1)).filter((idx) => idx !== -1),
        resultStr: '',
        phase: 'scanning',
        message: `遇到左括号 '(' [索引 ${i}]：压入索引栈等待后续匹配。当前栈内左括号数: ${stack.length}。`,
        log: `压栈左括号: 索引 ${i}`,
        codeLine: 10,
      });
    } else if (c === ')') {
      if (stack.length === 0) {
        invalid[i] = true;
        steps.push({
          s,
          currentIndex: i,
          stack: [...stack],
          invalidIndices: invalid.map((v, idx) => (v ? idx : -1)).filter((idx) => idx !== -1),
          resultStr: '',
          phase: 'scanning',
          message: `⚠️ 遇到多余右括号 ')' [索引 ${i}]：此时栈为空无匹配左括号！标记 invalid[${i}] = true（将被删除）。`,
          log: `标记删除多余右括号: 索引 ${i}`,
          codeLine: 13,
        });
      } else {
        const matchedLeft = stack.pop()!;
        steps.push({
          s,
          currentIndex: i,
          stack: [...stack],
          invalidIndices: invalid.map((v, idx) => (v ? idx : -1)).filter((idx) => idx !== -1),
          resultStr: '',
          phase: 'scanning',
          message: `✅ 遇到右括号 ')' [索引 ${i}]：与栈顶左括号 [索引 ${matchedLeft}] 成功配对！弹出匹配。`,
          log: `成功配对: [${matchedLeft}] 与 [${i}]`,
          codeLine: 15,
        });
      }
    }
  }

  // Phase 2: Unmatched left
  while (stack.length > 0) {
    const leftIdx = stack.pop()!;
    invalid[leftIdx] = true;
  }

  const allInvalid = invalid.map((v, idx) => (v ? idx : -1)).filter((idx) => idx !== -1);

  steps.push({
    s,
    currentIndex: null,
    stack: [],
    invalidIndices: [...allInvalid],
    resultStr: '',
    phase: 'clean_unmatched_left',
    message: `扫描结束：清点栈中残留的未匹配左括号。所有孤立左括号均被标记为无效：[ ${allInvalid.join(', ')} ]。`,
    log: `标记孤立左括号完毕: 无效索引总计 ${allInvalid.length} 个`,
    codeLine: 21,
  });

  // Phase 3: Reconstruct
  let result = '';
  for (let i = 0; i < s.length; i++) {
    if (!invalid[i]) result += s[i];
  }

  steps.push({
    s,
    currentIndex: null,
    stack: [],
    invalidIndices: [...allInvalid],
    resultStr: result,
    phase: 'reconstruct',
    message: `线性重构：跳过所有无效索引，拼接输出最终合法括号串："${result}"。`,
    log: `输出合法字符串: "${result}"`,
    codeLine: 27,
  });

  // Finish
  steps.push({
    s,
    currentIndex: null,
    stack: [],
    invalidIndices: [...allInvalid],
    resultStr: result,
    phase: 'finish',
    message: `🎉 括号清理完毕！移除了 ${allInvalid.length} 个无效括号，返回最长有效平衡串："${result}"。`,
    log: `算法终结: 结果="${result}"`,
    codeLine: 30,
  });

  return steps;
}

export function renderMinRemoveCanvas(container: HTMLElement, step: ParenthesesStep) {
  const charsHtml = step.s
    .split('')
    .map((c, i) => {
      const isCur = step.currentIndex === i;
      const isInvalid = step.invalidIndices.includes(i);
      const inStack = step.stack.includes(i);

      let border = 'border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(30, 41, 59, 0.7);';
      if (isInvalid) {
        border = 'border: 2px solid #f43f5e; background: rgba(225, 29, 72, 0.3); text-decoration: line-through;';
      } else if (isCur) {
        border = 'border: 2px solid #fbbf24; background: rgba(120, 53, 15, 0.5);';
      } else if (inStack) {
        border = 'border: 2px solid #38bdf8; background: rgba(2, 132, 199, 0.3);';
      }

      return `
      <div style="
        padding: 8px 12px;
        border-radius: 6px;
        ${border}
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 38px;
        transition: all 0.2s;
      ">
        <div style="font-size: 16px; font-weight: bold; color: ${isInvalid ? '#f87171' : '#f8fafc'}; font-family: monospace;">${c}</div>
        <div style="font-size: 9px; color: #64748b;">${i}</div>
      </div>
    `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 12px; padding: 16px; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08);">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 14px; font-weight: bold; color: #e2e8f0;">括号有效性索引栈与标记重构沙盘</span>
          <span style="padding: 2px 6px; font-size: 11px; border-radius: 4px; background: #1e293b; color: #94a3b8; font-family: monospace;">
            阶段: ${step.phase}
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; font-size: 12px;">
          <span style="color: #f43f5e;">无效括号数: ${step.invalidIndices.length}</span>
          ${
            step.resultStr
              ? `<span style="padding: 2px 8px; border-radius: 4px; font-weight: bold; background: rgba(52, 211, 153, 0.2); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3);">最终串: "${step.resultStr}"</span>`
              : ''
          }
        </div>
      </div>

      <!-- 字符点阵卡片 -->
      <div style="display: flex; gap: 6px; flex-wrap: wrap; padding: 14px; background: rgba(2, 6, 23, 0.4); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
        ${charsHtml}
      </div>

      <!-- 核心原理说明卡 -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: auto;">
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.3); background: rgba(14, 165, 233, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #38bdf8;">1. 存索引而非字符</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">栈内只压入左括号的下标索引，遇到右括号弹顶，空栈遇右括号立即锁死无效下标。</div>
        </div>
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3); background: rgba(251, 191, 36, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #fde047;">2. 残留左括号清算</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">遍历结束后留在栈内的左括号必无后继匹配，全量标记为无效，彻底消灭孤立括号。</div>
        </div>
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(52, 211, 153, 0.3); background: rgba(16, 185, 129, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #34d399;">3. 线性重构 O(N)</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">第二遍扫描跳过 invalid 标记，单次重组输出结果，严格 O(N) 极速通过。</div>
        </div>
      </div>
    </div>
  `;
}

export const minRemoveValidParenthesesVisualizer = registerDeclarativeAlgorithm<ParenthesesStep>({
  id: 'min-remove-valid-parentheses',
  name: 'Hard 28: 移除无效的括号 (LeetCode 1249)',
  category: 'stack',
  icon: '🧹',
  difficulty: 3,
  levelOrder: 1249,
  learningGoal: '掌握利用索引栈标记未匹配括号的线性重构技巧，理解布尔数组在字符串原地/单趟过滤中的核心应用',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 1249 - Medium-Hard)</h3>
      <p>给你一个由 <code>'('</code>、<code>')'</code> 和小写字母组成的字符串 <code>s</code>。你需要从字符串中删除最少数目的 <code>'('</code> 或 <code>')'</code> （可以删除任意位置的括号），使得剩下的括号字符串有效：</p>
      <ul>
        <li><strong>核心解题套路</strong>：
          <br/>1. 用栈存储左括号的下标。当遇到右括号时，如果栈非空则弹出一个匹配；如果栈为空，说明该右括号必定是多余的，在 <code>invalid</code> 标记数组中打标；
          <br/>2. 遍历结束后，栈中残余的所有下标对应的左括号也是多余的，全部在 <code>invalid</code> 中打标；
          <br/>3. 第二趟线性扫描跳过所有 <code>invalid[i] == true</code> 的字符，即可拼装出最长有效括号字符串！</li>
      </ul>
    </div>
  `,
  codeLanguages: MIN_REMOVE_PARENTHESES_CODES,
  inputs: [
    {
      id: 'case',
      label: '预设字符串',
      type: 'select',
      defaultValue: 'case1',
      options: [
        { label: 'lee(t(c)o)de) (多余末尾右括号)', value: 'case1' },
        { label: 'a)b(c)d (多余开头右括号)', value: 'case2' },
        { label: '))(( (全无效反向括号)', value: 'case3' },
      ],
    },
  ],
  generateSteps: (input) => {
    const c = input?.case || 'case1';
    const s = c === 'case2' ? 'a)b(c)d' : c === 'case3' ? '))((' : 'lee(t(c)o)de)';
    return buildMinRemoveSteps(s);
  },
  renderCanvas: (container, step) => {
    renderMinRemoveCanvas(container, step);
  },
});
