/**
 * Hard 10: 最长有效括号 (Longest Valid Parentheses)
 * LeetCode 32 经典高频压轴题
 * 栈底参照哨兵法与动态规划 DP 解法可视化
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../../core/step-visualizer';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

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
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
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
      codeLine: 4,
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
    codeLine: 6,
    statusBadge: { text: '初始化', type: 'info' }
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
        codeLine: 9,
        statusBadge: { text: `Push '${ch}'`, type: 'info' }
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
          codeLine: 13,
          statusBadge: { text: '新断点', type: 'danger' }
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
          codeLine: 15,
          statusBadge: { text: `匹配成功 (+${currentLen})`, type: 'success' }
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
    codeLine: 19,
    statusBadge: { text: `最长长度: ${maxLen}`, type: 'success' }
  });

  return steps;
}

export function renderParenthesesCanvas(container: HTMLElement, step: ParenthesesStep) {
  const { s, currentIndex, stack, maxLen, validRange } = step;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
      <!-- 状态看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前字符与下标</div>
          <div style="font-size: 14px; font-weight: bold; color: #38bdf8;">
            ${currentIndex >= 0 ? `'${s[currentIndex]}' (下标: ${currentIndex})` : '未启动'}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">栈顶哨兵 / 索引</div>
          <div style="font-size: 14px; font-weight: bold; color: #f59e0b;">
            ${stack.length > 0 ? stack[stack.length - 1] : '空'}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">历史最长有效长度</div>
          <div style="font-size: 14px; font-weight: bold; color: #10b981;">
            ${maxLen}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">最长子串区间</div>
          <div style="font-size: 14px; font-weight: bold; color: #ec4899;">
            ${validRange ? `[${validRange[0]}, ${validRange[1]}]` : '暂无'}
          </div>
        </div>
      </div>

      <!-- 字符串字符带条 -->
      <div style="background: rgba(15, 23, 42, 0.5); padding: 20px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); overflow-x: auto;">
        <div style="display: flex; gap: 8px; justify-content: center; align-items: flex-end; min-width: 450px;">
          ${s.split('').map((char, idx) => {
            const isCur = idx === currentIndex;
            const inValidRange = validRange && idx >= validRange[0] && idx <= validRange[1];

            let bgColor = 'rgba(51, 65, 85, 0.4)';
            let borderColor = 'rgba(255, 255, 255, 0.1)';

            if (isCur) {
              bgColor = 'rgba(56, 189, 248, 0.35)';
              borderColor = '#38bdf8';
            } else if (inValidRange) {
              bgColor = 'rgba(16, 185, 129, 0.25)';
              borderColor = '#10b981';
            }

            return `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <div style="font-size: 10px; height: 14px; color: ${isCur ? '#38bdf8' : inValidRange ? '#10b981' : '#64748b'}; font-weight: bold;">
                  ${isCur ? 'CUR' : inValidRange ? '✓' : ''}
                </div>
                <div style="
                  width: 44px;
                  height: 48px;
                  background: ${bgColor};
                  border: 2px solid ${borderColor};
                  border-radius: 6px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 18px;
                  font-weight: bold;
                  color: #f8fafc;
                  box-shadow: ${isCur ? '0 0 12px rgba(56, 189, 248, 0.4)' : inValidRange ? '0 0 8px rgba(16, 185, 129, 0.3)' : 'none'};
                  transition: all 0.2s ease;
                ">
                  ${char}
                </div>
                <div style="font-size: 10px; color: #64748b;">
                  [${idx}]
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 栈内容视图 -->
      <div style="background: rgba(30, 41, 59, 0.4); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 12px; color: #94a3b8; font-weight: bold;">栈内元素 (底 -> 顶):</div>
        <div style="display: flex; gap: 8px;">
          ${stack.map((idxVal, i) => `
            <div style="background: ${i === 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.2)'}; border: 1px solid ${i === 0 ? '#ef4444' : '#38bdf8'}; border-radius: 4px; padding: 4px 8px; font-size: 12px; color: #f8fafc;">
              ${idxVal === -1 ? '哨兵(-1)' : idxVal}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 核心原理卡片 -->
      ${renderFormulaCard(
        '栈底基准哨兵法 (Stack Sentinel Invariant)',
        '遇到 ( 压入下标；遇到 ) 弹出栈顶。若栈空则当前右括号为新的无法匹配断点；若栈不空，有效连续长度为 i - stack.top()',
        step.decision,
        step.statusBadge
      )}
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
