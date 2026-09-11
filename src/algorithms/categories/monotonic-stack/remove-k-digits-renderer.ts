/**
 * 移掉 K 位数字 (Remove K Digits)
 * LeetCode 402 (Medium / 单调栈贪心与高位逆序剥离经典)
 * 核心原语:
 *  给定一个以字符串表示的非负整数 num 和一个整数 k，移除这个数中的 k 位数字，使得剩下的数字最小。
 *  贪心策略与单调递增栈：
 *   从左至右观察数字，高位越小，整个数值越小。
 *   若当前字符比栈顶字符小且 k > 0，说明把栈顶较大数字弹出能让高位变得更小，果断贪心弹出栈顶（k--）。
 *   遍历完成后若 k 仍大于 0，从栈顶继续弹出多余位。
 *   最后剥离所有前导零；若结果为空，返回 "0"。
 *  时间复杂度 O(N)，空间复杂度 O(N)。
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
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
  codeLine: number;
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
    codeLine: 4,
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
        codeLine: 7,
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
      codeLine: 10,
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
      codeLine: 14,
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
    codeLine: 23,
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
    codeLine: 24,
  });

  return steps;
}

function renderRemoveKDigitsCanvas(step: RemoveKDigitsStep): string {
  const { num, currentIdx, stack, poppedChar, remainingK, finalResult, phase } = step;

  // 渲染输入字符序列
  const charCards = num
    .split('')
    .map((ch, idx) => {
      const isCur = idx === currentIdx && phase !== 'finish' && phase !== 'strip-zero';
      const isProcessed = idx < currentIdx;

      let bg = 'rgba(255, 255, 255, 0.05)';
      let border = '1px solid rgba(255, 255, 255, 0.1)';
      let color = '#94a3b8';

      if (isCur) {
        bg = 'rgba(245, 158, 11, 0.35)';
        border = '2px solid #f59e0b';
        color = '#fbbf24';
      } else if (isProcessed) {
        bg = 'rgba(56, 189, 248, 0.1)';
        border = '1px solid rgba(56, 189, 248, 0.3)';
        color = '#bae6fd';
      }

      return `
      <div style="display: flex; flex-direction: column; align-items: center; width: 40px; margin: 0 4px;">
        <div style="
          width: 100%;
          height: 40px;
          background: ${bg};
          border: ${border};
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${color};
          font-weight: 700;
          font-size: 16px;
        ">${ch}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">[${idx}]</div>
      </div>`;
    })
    .join('');

  // 渲染单调栈槽位
  const stackCells = stack
    .map((ch, idx) => {
      return `
      <div style="
        min-width: 44px;
        height: 44px;
        background: rgba(16, 185, 129, 0.25);
        border: 2px solid #10b981;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #34d399;
        font-weight: 700;
        font-size: 18px;
        margin: 0 4px;
      ">${ch}</div>`;
    })
    .join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <!-- 上部 原始数字序列与当前扫描游标 -->
      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">原始数字扫描带与当前考察位</div>
          <div style="font-size: 11px; color: #fbbf24;">当前考察: ${currentIdx >= 0 && currentIdx < num.length ? `[${currentIdx}] = '${num[currentIdx]}'` : '扫描完毕'}</div>
        </div>
        <div style="display: flex; justify-content: center; align-items: center; min-height: 55px;">
          ${charCards}
        </div>
      </div>

      <!-- 中部 单调栈与弹出指示 -->
      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">单调递增栈 (Monotonic Stack)</div>
          ${poppedChar ? `<div style="font-size: 11px; color: #ef4444; font-weight: 700;">刚刚弹出较大位: '${poppedChar}' ✗</div>` : ''}
        </div>
        <div style="display: flex; align-items: center; justify-content: center; min-height: 55px; background: rgba(0,0,0,0.2); border-radius: 6px; padding: 8px;">
          ${stackCells || '<span style="color: #64748b; font-size: 12px;">栈为空</span>'}
        </div>
      </div>

      <!-- 底部指标卡片 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">待移除名额 remainingK</div>
          <div style="font-size: 16px; font-weight: 700; color: #f43f5e;">${remainingK}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">栈内字符数</div>
          <div style="font-size: 16px; font-weight: 700; color: #38bdf8;">${stack.length}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前栈状态</div>
          <div style="font-size: 15px; font-weight: 700; color: #34d399;">"${stack.join('') || '空'}"</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">最终收敛最小数</div>
          <div style="font-size: 18px; font-weight: 700; color: #fbbf24;">${finalResult || '计算中...'}</div>
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'remove-k-digits',
  name: '移掉 K 位数字',
  category: 'monotonic-stack',
  difficulty: 2,
  learningGoal: 'LeetCode 402: 移掉 k 位数字使得剩下的数字最小。利用单调递增栈在 O(N) 时间内贪心剔除逆序高位，并剥离前导零。',
  codeLanguages: REMOVE_K_DIGITS_CODES,
  generateSteps: (inputs) => {
    const rawNum = inputs?.num as string | undefined;
    const rawK = Number(inputs?.k ?? 3);
    const num = typeof rawNum === 'string' && rawNum.trim().length > 0 ? rawNum.trim() : '1432219';
    const k = isNaN(rawK) || rawK < 0 ? 3 : Math.min(rawK, num.length);
    return buildRemoveKDigitsSteps(num, k);
  },
  renderCanvas: (container: HTMLElement, step: RemoveKDigitsStep) => {
    container.innerHTML = renderRemoveKDigitsCanvas(step);
  },
  inputs: [
    {
      id: 'num',
      label: '输入数字字符串',
      type: 'text',
      defaultValue: '1432219',
      placeholder: '例如: 1432219',
    },
    {
      id: 'k',
      label: '移除位数 k',
      type: 'number',
      defaultValue: 3,
      placeholder: '需移除的数字个数',
    },
  ],
});
