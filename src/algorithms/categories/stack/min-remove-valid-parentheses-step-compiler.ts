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
  codeLine: number | Record<string, number>;
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

const CODE_LINES: Record<string, Record<string, number>> = {
  init: { java: 3, cpp: 4, python: 3 },
  pushLeft: { java: 10, cpp: 7, python: 7 },
  invalidRight: { java: 13, cpp: 9, python: 10 },
  matchPop: { java: 15, cpp: 10, python: 12 },
  cleanUnmatched: { java: 21, cpp: 14, python: 14 },
  reconstruct: { java: 27, cpp: 19, python: 15 },
  finish: { java: 30, cpp: 21, python: 15 },
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
    codeLine: CODE_LINES.init,
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
        codeLine: CODE_LINES.pushLeft,
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
          codeLine: CODE_LINES.invalidRight,
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
          codeLine: CODE_LINES.matchPop,
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
    codeLine: CODE_LINES.cleanUnmatched,
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
    codeLine: CODE_LINES.reconstruct,
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
    codeLine: CODE_LINES.finish,
  });

  return steps;
}
