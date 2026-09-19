/**
 * Hard 10: 最长有效括号 (Longest Valid Parentheses)
 * LeetCode 32 经典高频压轴题
 * 栈底参照哨兵法与动态规划 DP 解法可视化
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase, HighlightTarget } from '../../../../core/step-visualizer';

export interface ParenthesesStep extends StepBase {
  stepIndex?: number;
  s: string;
  currentIndex: number;
  stack: number[];
  maxLen: number;
  validRange?: [number, number];
  decision: string;
  message: string;
  log: string;
  codeLine?: number | HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
  ans?: string;
}

export const LONGEST_VALID_PARENTHESES_CODES = {
  java: `public class LongestValidParentheses {
    // 栈底参照基准法 O(N) 时间，O(N) 空间
    public static int longestValidParentheses(String s) {
        int maxLen = 0;
        Stack<Integer> stack = new Stack<>();
        stack.push(-1); // 栈底哨兵：记录最后一个无法匹配的右括号位置

        for (int i = 0; i < s.length(); i++) {
            if (s.charAt(i) == '(') {
                stack.push(i);
            } else {
                stack.pop();
                if (stack.isEmpty()) {
                    stack.push(i); // 当前右括号成为新的未匹配基准
                } else {
                    maxLen = Math.max(maxLen, i - stack.peek());
                }
            }
        }
        return maxLen;
    }
}`,
  cpp: `class LongestValidParentheses {
public:
    static int longestValidParentheses(const string& s) {
        int maxLen = 0;
        stack<int> st;
        st.push(-1);

        for (int i = 0; i < (int)s.size(); ++i) {
            if (s[i] == '(') {
                st.push(i);
            } else {
                st.pop();
                if (st.empty()) {
                    st.push(i);
                } else {
                    maxLen = max(maxLen, i - st.top());
                }
            }
        }
        return maxLen;
    }
};`,
  python: `class LongestValidParentheses:
    @staticmethod
    def longest_valid_parentheses(s: str) -> int:
        max_len = 0
        stack = [-1]

        for i, char in enumerate(s):
            if char == '(':
                stack.append(i)
            else:
                stack.pop()
                if not stack:
                    stack.append(i)
                else:
                    max_len = max(max_len, i - stack[-1])
        return max_len`,
  typescript: `export class LongestValidParentheses {
  static longestValidParentheses(s: string): number {
    let maxLen = 0;
    const stack: number[] = [-1];

    for (let i = 0; i < s.length; i++) {
      if (s[i] === '(') {
        stack.push(i);
      } else {
        stack.pop();
        if (stack.length === 0) {
          stack.push(i);
        } else {
          maxLen = Math.max(maxLen, i - stack[stack.length - 1]);
        }
      }
    }
    return maxLen;
  }
}`
};

export const LONGEST_VALID_PARENTHESES_CODE_LINES = {
  empty: { java: 4, cpp: 4, python: 4, typescript: 3 },
  init: { java: 5, cpp: 5, python: 5, typescript: 4 },
  pushOpen: { java: 9, cpp: 9, python: 8, typescript: 8 },
  popEmpty: { java: 12, cpp: 12, python: 12, typescript: 12 },
  match: { java: 14, cpp: 14, python: 14, typescript: 14 },
  finish: { java: 18, cpp: 18, python: 16, typescript: 18 },
};

export function generateParenthesesSteps(s: string): ParenthesesStep[] {
  const steps: ParenthesesStep[] = [];
  const n = s.length;

  if (n === 0) {
    steps.push({
      stepIndex: 0,
      s: '',
      currentIndex: -1,
      stack: [-1],
      maxLen: 0,
      decision: '字符串为空，有效括号长度为 0',
      message: '空输入',
      log: '空字符串',
      codeLine: LONGEST_VALID_PARENTHESES_CODE_LINES.empty,
      statusBadge: { text: '空输入', type: 'info' }
    });
    return steps;
  }

  const stack: number[] = [-1];
  let maxLen = 0;
  let bestRange: [number, number] | undefined = undefined;
  let stepIdx = 0;

  steps.push({
    stepIndex: stepIdx++,
    s,
    currentIndex: -1,
    stack: [...stack],
    maxLen: 0,
    decision: '初始化栈，压入基准哨兵 -1（代表未匹配断点的起始参照）',
    message: '栈已就绪',
    log: '初始化 stack: [-1]',
    codeLine: LONGEST_VALID_PARENTHESES_CODE_LINES.init,
    statusBadge: { text: '初始化', type: 'info' },
    metrics: {
      currentChar: '初始状态',
      stackTop: '哨兵(-1)',
      maxLen: 0,
      validRange: '暂无',
    },
    ans: '0',
  });

  for (let i = 0; i < n; i++) {
    const ch = s[i];

    if (ch === '(') {
      stack.push(i);
      steps.push({
        stepIndex: stepIdx++,
        s,
        currentIndex: i,
        stack: [...stack],
        maxLen,
        validRange: bestRange,
        decision: `遇到左括号 '(' 下标 ${i}，压入栈等待后续右括号匹配`,
        message: `入栈下标 ${i}`,
        log: `Push ${i}`,
        codeLine: LONGEST_VALID_PARENTHESES_CODE_LINES.pushOpen,
        statusBadge: { text: `Push '${ch}'`, type: 'info' },
        metrics: {
          currentChar: `'(' (#${i})`,
          stackTop: i,
          maxLen,
          validRange: bestRange ? `[${bestRange[0]}, ${bestRange[1]}]` : '暂无',
        },
        ans: String(maxLen),
      });
    } else {
      // ')'
      stack.pop();
      if (stack.length === 0) {
        stack.push(i);
        steps.push({
          stepIndex: stepIdx++,
          s,
          currentIndex: i,
          stack: [...stack],
          maxLen,
          validRange: bestRange,
          decision: `遇到右括号 ')' 下标 ${i}，弹栈后栈变空，说明该右括号无法匹配，将其作为新的基准哨兵入栈`,
          message: `新基准下标 ${i}`,
          log: `栈空，新断点 ${i}`,
          codeLine: LONGEST_VALID_PARENTHESES_CODE_LINES.popEmpty,
          statusBadge: { text: '新断点', type: 'danger' },
          metrics: {
            currentChar: `')' (#${i})`,
            stackTop: `断点(${i})`,
            maxLen,
            validRange: bestRange ? `[${bestRange[0]}, ${bestRange[1]}]` : '暂无',
          },
          ans: String(maxLen),
        });
      } else {
        const top = stack[stack.length - 1];
        const currentLen = i - top;
        if (currentLen > maxLen) {
          maxLen = currentLen;
          bestRange = [top + 1, i];
        }

        steps.push({
          stepIndex: stepIdx++,
          s,
          currentIndex: i,
          stack: [...stack],
          maxLen,
          validRange: bestRange,
          decision: `遇到右括号 ')' 下标 ${i}，成功匹配！以栈顶 ${top} 为界，当前有效连续长度 = ${i} - (${top}) = ${currentLen}。当前最高记录 = ${maxLen}`,
          message: `匹配成功，有效长度 ${currentLen}`,
          log: `Match: [${top + 1}..${i}], maxLen=${maxLen}`,
          codeLine: LONGEST_VALID_PARENTHESES_CODE_LINES.match,
          statusBadge: { text: `匹配成功 (+${currentLen})`, type: 'success' },
          metrics: {
            currentChar: `')' (#${i})`,
            stackTop: top === -1 ? '哨兵(-1)' : top,
            maxLen,
            validRange: bestRange ? `[${bestRange[0]}, ${bestRange[1]}]` : '暂无',
          },
          ans: String(maxLen),
        });
      }
    }
  }

  steps.push({
    stepIndex: stepIdx++,
    s,
    currentIndex: n - 1,
    stack: [...stack],
    maxLen,
    validRange: bestRange,
    decision: `遍历结束！整个串中最长有效连续括号子串长度为 ${maxLen}${bestRange ? `，对应区间 [${bestRange[0]}..${bestRange[1]}]: "${s.slice(bestRange[0], bestRange[1] + 1)}"` : ''}`,
    message: `最终最长长度: ${maxLen}`,
    log: `扫描结束，maxLen=${maxLen}`,
    codeLine: LONGEST_VALID_PARENTHESES_CODE_LINES.finish,
    statusBadge: { text: `最长长度: ${maxLen}`, type: 'success' },
    metrics: {
      currentChar: '遍历结束',
      stackTop: stack.length > 0 ? (stack[stack.length - 1] === -1 ? '哨兵(-1)' : stack[stack.length - 1]) : '空',
      maxLen,
      validRange: bestRange ? `[${bestRange[0]}, ${bestRange[1]}]` : '暂无',
    },
    ans: String(maxLen),
  });

  return steps;
}

export function renderParenthesesCanvas(container: HTMLElement, step: ParenthesesStep) {
  const { s, currentIndex, stack, validRange } = step;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; justify-content: space-around; gap: 14px; width: 100%; height: 100%; padding: 12px 16px; box-sizing: border-box;">
      <!-- 1. 括号字符序列与游标扫描轨 -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 620px;">
          <span style="font-size: 12px; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 6px;">
            <span>🔤</span> 括号序列扫描轨 (长度: ${s.length})
          </span>
          ${
            validRange
              ? `<span style="font-size: 11px; font-weight: 700; color: #059669; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 999px;">
                  连续有效区间: [${validRange[0]}..${validRange[1]}] (长度: ${validRange[1] - validRange[0] + 1})
                </span>`
              : `<span style="font-size: 11px; color: #94a3b8;">暂无连续匹配区间</span>`
          }
        </div>

        <div style="display: flex; gap: 8px; justify-content: center; align-items: flex-end; flex-wrap: wrap; padding: 8px 0; min-height: 85px;">
          ${s.split('').map((char, idx) => {
            const isCur = idx === currentIndex;
            const inValidRange = validRange && idx >= validRange[0] && idx <= validRange[1];

            let bgColor = '#ffffff';
            let borderColor = '#cbd5e1';
            let textColor = '#334155';
            let shadow = '0 1px 3px rgba(0, 0, 0, 0.04)';

            if (isCur) {
              bgColor = '#eff6ff';
              borderColor = '#0284c7';
              textColor = '#0369a1';
              shadow = '0 0 0 3px rgba(2, 132, 199, 0.18), 0 2px 6px rgba(2, 132, 199, 0.15)';
            } else if (inValidRange) {
              bgColor = '#ecfdf5';
              borderColor = '#10b981';
              textColor = '#047857';
              shadow = '0 0 0 2px rgba(16, 185, 129, 0.16)';
            }

            return `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
                <div style="font-size: 10px; height: 16px; font-weight: 800; display: flex; align-items: center;">
                  ${isCur ? '<span style="color: #0284c7; background: #e0f2fe; padding: 1px 5px; border-radius: 4px;">CUR</span>' : inValidRange ? '<span style="color: #059669; background: #dcfce7; padding: 1px 5px; border-radius: 4px;">✓</span>' : ''}
                </div>
                <div style="
                  width: 44px;
                  height: 48px;
                  background: ${bgColor};
                  border: 2px solid ${borderColor};
                  border-radius: 8px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 22px;
                  font-weight: 800;
                  font-family: 'JetBrains Mono', monospace;
                  color: ${textColor};
                  box-shadow: ${shadow};
                  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                ">
                  ${char}
                </div>
                <div style="font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #64748b; font-weight: 600;">
                  #${idx}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 2. 匹配基准栈 (真实索引栈架) -->
      <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 620px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 6px;">
            <span>📚</span> 匹配基准栈 (底 ➔ 顶)
          </span>
          <span style="font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #64748b; font-weight: 600;">
            栈内深度: ${stack.length}
          </span>
        </div>

        <div style="
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
          min-height: 46px;
          padding: 8px 12px;
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: 8px;
        ">
          ${
            stack.length === 0
              ? '<span style="font-size: 12px; color: #94a3b8; font-style: italic;">（栈当前为空）</span>'
              : stack.map((idxVal, i) => {
                  const isTop = i === stack.length - 1;
                  if (idxVal === -1) {
                    return `
                      <div style="
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        background: #fef2f2;
                        border: 1px solid #f87171;
                        border-radius: 6px;
                        padding: 5px 10px;
                        font-size: 12px;
                        font-family: 'JetBrains Mono', monospace;
                        font-weight: 700;
                        color: #991b1b;
                        box-shadow: 0 1px 2px rgba(0,0,0,0.03);
                      ">
                        <span style="font-size: 9px; background: #ef4444; color: #ffffff; padding: 1px 4px; border-radius: 3px;">哨兵</span>
                        <span>-1 (初始断点)</span>
                        ${isTop ? '<span style="font-size: 9px; background: #0284c7; color: #ffffff; padding: 1px 4px; border-radius: 3px;">TOP</span>' : ''}
                      </div>
                    `;
                  }
                  return `
                    <div style="
                      display: flex;
                      align-items: center;
                      gap: 6px;
                      background: #eff6ff;
                      border: 1px solid #60a5fa;
                      border-radius: 6px;
                      padding: 5px 10px;
                      font-size: 12px;
                      font-family: 'JetBrains Mono', monospace;
                      font-weight: 700;
                      color: #1e40af;
                      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
                    ">
                      <span style="font-size: 9px; background: #3b82f6; color: #ffffff; padding: 1px 4px; border-radius: 3px;">左括号</span>
                      <span>#${idxVal} ('${s[idxVal]}')</span>
                      ${isTop ? '<span style="font-size: 9px; background: #0284c7; color: #ffffff; padding: 1px 4px; border-radius: 3px;">TOP</span>' : ''}
                    </div>
                  `;
                }).join('')
          }
        </div>
      </div>
    </div>
  `;
}

export const longestValidParenthesesVisualizer = registerDeclarativeAlgorithm<ParenthesesStep>({
  id: 'longest-valid-parentheses',
  name: '大厂高频真题: 最长有效括号 (Longest Valid Parentheses)',
  category: 'stack',
  icon: '🧶',
  difficulty: 3,
  levelOrder: 32,
  learningGoal: '掌握 LeetCode 32 最长有效连续括号的栈底基准哨兵法与动态规划状态转移技巧',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 32)</h3>
      <p>给你一个只包含 <code>'('</code> 和 <code>')'</code> 的字符串，找出最长有效（格式正确且连续）括号子串的长度：</p>
      <ul>
        <li><strong>栈底哨兵思想</strong>：初始压入 <code>-1</code>，保证任何合法闭合的子串左端点都可以通过 <code>i - stack.top()</code> 正确减出距离。</li>
        <li><strong>边界重置</strong>：一旦栈空，说明当前 <code>)</code> 无法匹配任何前序 <code>(</code>，必须重置为新的断点哨兵。</li>
      </ul>
    </div>
  `,
  codeLanguages: LONGEST_VALID_PARENTHESES_CODES,
  metrics: [
    { id: 'currentChar', label: '当前字符/下标', color: '#38bdf8' },
    { id: 'stackTop', label: '栈顶基准哨兵', color: '#f59e0b' },
    { id: 'maxLen', label: '最长有效长度', color: '#10b981' },
    { id: 'validRange', label: '最长有效区间', color: '#ec4899' },
  ],
  inputs: [
    {
      id: 's',
      label: '括号字符串',
      type: 'text',
      defaultValue: ')()())',
    },
  ],
  generateSteps: (input) => {
    const s = String(input.s || ')()())');
    return generateParenthesesSteps(s);
  },
  renderCanvas: (container, step) => {
    renderParenthesesCanvas(container, step);
  },
});
