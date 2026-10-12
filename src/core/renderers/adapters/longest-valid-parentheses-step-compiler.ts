import { StepBase, HighlightTarget } from '../../step-visualizer';

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
