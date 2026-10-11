/**
 * 移掉 K 位数字 (Remove K Digits) - 步进编译器
 * LeetCode 402 (Medium / 单调栈贪心与高位逆序剥离经典)
 */

import { StepBase } from '../../../core/step-visualizer';

export interface RemoveKDigitsStep extends StepBase {
  num: string;
  k: number;
  remainingK: number;
  currentIdx: number;
  stack: string[];
  poppedChar: string | null;
  phase: 'init' | 'push' | 'pop-greater' | 'truncate-remaining' | 'strip-zero' | 'finish';
  finalResult: string;
  message: string;
  log: string;
  codeLine: number | Record<string, number>;
}

export const REMOVE_K_DIGITS_CODES = {
  java: `public class Solution {
    public String removeKdigits(String num, int k) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : num.toCharArray()) {
            // 贪心维护单调递增栈：高位逆序立刻剔除
            while (!stack.isEmpty() && k > 0 && stack.peekLast() > c) {
                stack.pollLast();
                k--;
            }
            stack.offerLast(c);
        }
        // 若 k 仍有剩余，从末尾削减
        while (k > 0 && !stack.isEmpty()) {
            stack.pollLast();
            k--;
        }
        // 剥离前导零
        StringBuilder sb = new StringBuilder();
        boolean leadingZero = true;
        for (char c : stack) {
            if (leadingZero && c == '0') continue;
            leadingZero = false;
            sb.append(c);
        }
        return sb.length() == 0 ? "0" : sb.toString();
    }
}`,
  cpp: `class Solution {
public:
    string removeKdigits(string num, int k) {
        string stk = "";
        for (char c : num) {
            while (!stk.empty() && k > 0 && stk.back() > c) {
                stk.pop_back();
                k--;
            }
            stk.push_back(c);
        }
        while (k > 0 && !stk.empty()) {
            stk.pop_back();
            k--;
        }
        int i = 0;
        while (i < stk.size() && stk[i] == '0') i++;
        string ans = stk.substr(i);
        return ans.empty() ? "0" : ans;
    }
};`,
  python: `class Solution:
    def removeKdigits(self, num: str, k: int) -> str:
        stk = []
        for c in num:
            while stk and k > 0 and stk[-1] > c:
                stk.pop()
                k -= 1
            stk.append(c)
        if k > 0:
            stk = stk[:-k]
        ans = ''.join(stk).lstrip('0')
        return ans if ans else "0"`,
};

export const REMOVE_K_DIGITS_CODE_LINES: Record<string, Record<string, number>> = {
  init: { java: 3, cpp: 4, python: 3 },
  popGreater: { java: 7, cpp: 7, python: 6 },
  push: { java: 10, cpp: 10, python: 8 },
  truncateRemaining: { java: 14, cpp: 13, python: 10 },
  stripZero: { java: 21, cpp: 17, python: 11 },
  finish: { java: 25, cpp: 19, python: 12 },
};

export function buildRemoveKDigitsSteps(num: string = '1432219', k: number = 3): RemoveKDigitsStep[] {
  const steps: RemoveKDigitsStep[] = [];
  const stack: string[] = [];
  let remK = k;

  // Step 0: Init
  steps.push({
    num,
    k,
    remainingK: remK,
    currentIdx: -1,
    stack: [],
    poppedChar: null,
    phase: 'init',
    finalResult: '',
    message: `算法启动：原数字 "${num}"，需移除 k = ${k} 位数字以得到最小数值。创建单调递增栈。`,
    log: `初始化单调栈: num="${num}", k=${k}`,
    codeLine: REMOVE_K_DIGITS_CODE_LINES.init,
  });

  for (let i = 0; i < num.length; i++) {
    const c = num[i];

    // 弹栈
    while (stack.length > 0 && remK > 0 && stack[stack.length - 1] > c) {
      const top = stack.pop()!;
      remK--;
      steps.push({
        num,
        k,
        remainingK: remK,
        currentIdx: i,
        stack: [...stack],
        poppedChar: top,
        phase: 'pop-greater',
        finalResult: '',
        message: `贪心弹栈：当前字符 '${c}' 比栈顶 '${top}' 更小！弹出栈顶以使高位数值降低。剩余需移除位数 k = ${remK}。`,
        log: `弹出较大高位 '${top}', 剩余 k=${remK}`,
        codeLine: REMOVE_K_DIGITS_CODE_LINES.popGreater,
      });
    }

    stack.push(c);
    steps.push({
      num,
      k,
      remainingK: remK,
      currentIdx: i,
      stack: [...stack],
      poppedChar: null,
      phase: 'push',
      finalResult: '',
      message: `压入当前位：'${c}' 入栈。当前栈内数字为 [${stack.join('')}]。`,
      log: `压入 '${c}' -> 栈: ${stack.join('')}`,
      codeLine: REMOVE_K_DIGITS_CODE_LINES.push,
    });
  }

  // 截断多余 k
  while (remK > 0 && stack.length > 0) {
    const popped = stack.pop()!;
    remK--;
    steps.push({
      num,
      k,
      remainingK: remK,
      currentIdx: num.length,
      stack: [...stack],
      poppedChar: popped,
      phase: 'truncate-remaining',
      finalResult: '',
      message: `处理剩余 k：由于已单调递增，直接从末尾弹出多余高位 '${popped}'。剩余 k = ${remK}。`,
      log: `从末尾截断 '${popped}'`,
      codeLine: REMOVE_K_DIGITS_CODE_LINES.truncateRemaining,
    });
  }

  // 剥离前导 0
  let resStr = stack.join('').replace(/^0+/, '');
  if (resStr === '') resStr = '0';

  steps.push({
    num,
    k,
    remainingK: 0,
    currentIdx: num.length,
    stack: [...stack],
    poppedChar: null,
    phase: 'strip-zero',
    finalResult: resStr,
    message: `清理前导零：栈内拼接为 "${stack.join('')}"，去除前导零后得到最小数字 "${resStr}"。`,
    log: `剥离前导零 -> 最终结果 "${resStr}"`,
    codeLine: REMOVE_K_DIGITS_CODE_LINES.stripZero,
  });

  // Finish
  steps.push({
    num,
    k,
    remainingK: 0,
    currentIdx: num.length,
    stack: [...stack],
    poppedChar: null,
    phase: 'finish',
    finalResult: resStr,
    message: `算法完成！移除 ${k} 位后剩下的最小可能数值为 "${resStr}"。`,
    log: `收敛完成，返回 "${resStr}"`,
    codeLine: REMOVE_K_DIGITS_CODE_LINES.finish,
  });

  return steps;
}
