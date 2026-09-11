/**
 * 有效的括号字符串 (Valid Parenthesis String)
 * LeetCode 678 (Medium / 大厂高频贪心与双端界定)
 * 核心原语:
 *  给你一个只包含三种字符的字符串：'('、')' 和 '*'，判定其是否为有效字符串。
 *  '*' 可以被视为单个 '('、单个 ')' 或空字符串 ""。
 *  经典贪心双端界定算法：
 *   维护可能存在的【未匹配左括号数量区间】[minOpen, maxOpen]。
 *   遇到 '(': minOpen++, maxOpen++
 *   遇到 ')': minOpen--, maxOpen--
 *   遇到 '*': minOpen-- (看作')'), maxOpen++ (看作'(')
 *   边界约束：
 *    1. minOpen = Math.max(minOpen, 0) （因为哪怕前面把 * 看作多余的 ')' 导致负数，也可通过看作空字符截断为 0）
 *    2. 若 maxOpen < 0，说明哪怕把所有 * 当作左括号，右括号依然过多，直接判 false！
 *   最终检测：minOpen === 0 则合法！
 *  时间复杂度 O(N)，空间复杂度 O(1)。
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';

export interface ValidStringStep extends StepBase {
  s: string;
  currentIdx: number;
  currentChar: string;
  minOpen: number;
  maxOpen: number;
  isValidSoFar: boolean;
  phase: 'init' | 'scan' | 'invalid' | 'finish';
  message: string;
  log: string;
  codeLine: number;
}

export const VALID_PARENTHESIS_STRING_CODES = {
  java: `public class Solution {
    public boolean checkValidString(String s) {
        int minOpen = 0, maxOpen = 0;
        for (char c : s.toCharArray()) {
            if (c == '(') {
                minOpen++;
                maxOpen++;
            } else if (c == ')') {
                minOpen--;
                maxOpen--;
            } else { // '*' 可充当 '(', ')' 或 ''
                minOpen--;
                maxOpen++;
            }
            if (maxOpen < 0) return false;
            minOpen = Math.max(minOpen, 0);
        }
        return minOpen == 0;
    }
}`,
  cpp: `class Solution {
public:
    bool checkValidString(string s) {
        int minOpen = 0, maxOpen = 0;
        for (char c : s) {
            if (c == '(') {
                minOpen++; maxOpen++;
            } else if (c == ')') {
                minOpen--; maxOpen--;
            } else {
                minOpen--; maxOpen++;
            }
            if (maxOpen < 0) return false;
            minOpen = max(minOpen, 0);
        }
        return minOpen == 0;
    }
};`,
  python: `class Solution:
    def checkValidString(self, s: str) -> bool:
        min_open = max_open = 0
        for c in s:
            if c == '(':
                min_open += 1
                max_open += 1
            elif c == ')':
                min_open -= 1
                max_open -= 1
            else:
                min_open -= 1
                max_open += 1
            if max_open < 0:
                return False
            min_open = max(min_open, 0)
        return min_open == 0`,
};

export function buildValidParenthesisStringSteps(s: string = '(*))'): ValidStringStep[] {
  const steps: ValidStringStep[] = [];
  let minOpen = 0;
  let maxOpen = 0;

  // Step 0: Init
  steps.push({
    s,
    currentIdx: -1,
    currentChar: '',
    minOpen: 0,
    maxOpen: 0,
    isValidSoFar: true,
    phase: 'init',
    message: `算法启动：输入字符串 "${s}"。初始化未匹配左括号数量范围 [minOpen: 0 .. maxOpen: 0]。`,
    log: `初始化双端区间 [0, 0]`,
    codeLine: 4,
  });

  for (let i = 0; i < s.length; i++) {
    const c = s[i];

    if (c === '(') {
      minOpen++;
      maxOpen++;
    } else if (c === ')') {
      minOpen--;
      maxOpen--;
    } else {
      // '*'
      minOpen--;
      maxOpen++;
    }

    if (maxOpen < 0) {
      steps.push({
        s,
        currentIdx: i,
        currentChar: c,
        minOpen,
        maxOpen,
        isValidSoFar: false,
        phase: 'invalid',
        message: `扫描到 s[${i}] = '${c}'：maxOpen 跌至 ${maxOpen} < 0！说明即使将前面所有 '*' 都当作 '('，右括号数量依然溢出，必定非法！`,
        log: `非法拦截: maxOpen < 0`,
        codeLine: 18,
      });
      return steps;
    }

    minOpen = Math.max(minOpen, 0);

    steps.push({
      s,
      currentIdx: i,
      currentChar: c,
      minOpen,
      maxOpen,
      isValidSoFar: true,
      phase: 'scan',
      message: `处理 s[${i}] = '${c}'：更新未匹配左括号的可能数量范围为 [min: ${minOpen} .. max: ${maxOpen}]。`,
      log: `处理 '${c}': 范围=[${minOpen} .. ${maxOpen}]`,
      codeLine: 19,
    });
  }

  const ans = minOpen === 0;

  // Finish
  steps.push({
    s,
    currentIdx: s.length,
    currentChar: '',
    minOpen,
    maxOpen,
    isValidSoFar: ans,
    phase: 'finish',
    message: ans
      ? `全字符串扫描完毕：最终可能存在未匹配左括号下限 minOpen === 0！字符串 "${s}" 可以被完全平衡，返回 true。`
      : `全字符串扫描完毕：最终未匹配左括号下限 minOpen = ${minOpen} > 0，无法全部消除，返回 false。`,
    log: `算法收敛: 结果=${ans}`,
    codeLine: 21,
  });

  return steps;
}

function renderValidStringCanvas(step: ValidStringStep): string {
  const { s, currentIdx, minOpen, maxOpen, isValidSoFar, phase } = step;

  const charCards = s
    .split('')
    .map((c, idx) => {
      const isCur = idx === currentIdx && phase !== 'finish';
      const isProcessed = idx <= currentIdx;

      let bg = 'rgba(255, 255, 255, 0.05)';
      let border = '1px solid rgba(255, 255, 255, 0.1)';
      let color = '#94a3b8';

      if (isCur) {
        bg = 'rgba(245, 158, 11, 0.35)';
        border = '2px solid #f59e0b';
        color = '#fbbf24';
      } else if (isProcessed) {
        bg = 'rgba(56, 189, 248, 0.15)';
        border = '1px solid rgba(56, 189, 248, 0.4)';
        color = '#bae6fd';
      }

      return `
      <div style="display: flex; flex-direction: column; align-items: center; width: 44px; margin: 0 4px;">
        <div style="
          width: 100%;
          height: 44px;
          background: ${bg};
          border: ${border};
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${color};
          font-weight: 700;
          font-size: 20px;
        ">${c}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">[${idx}]</div>
      </div>`;
    })
    .join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <!-- 上部 字符序列卡片 -->
      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">括号表达式与通配符扫描</div>
          <div style="font-size: 11px; color: ${isValidSoFar ? '#34d399' : '#ef4444'}; font-weight: 700;">
            ${isValidSoFar ? '✓ 当前状态合法' : '✗ 右括号超量（非法）'}
          </div>
        </div>
        <div style="display: flex; justify-content: center; align-items: center; min-height: 65px;">
          ${charCards}
        </div>
      </div>

      <!-- 中部 贪心动态区间展示 -->
      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 16px;">
        <div style="font-size: 12px; color: #94a3b8; font-weight: 600; margin-bottom: 12px;">
          未匹配左括号 '(' 的可能数量动态连续区间 [minOpen .. maxOpen]
        </div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 20px;">
          <div style="display: flex; flex-direction: column; align-items: center; background: rgba(56, 189, 248, 0.15); border: 2px solid #38bdf8; border-radius: 8px; padding: 8px 16px;">
            <span style="font-size: 11px; color: #94a3b8;">最少未匹配 (下限)</span>
            <span style="font-size: 22px; font-weight: 700; color: #38bdf8;">${minOpen}</span>
          </div>
          <div style="font-size: 16px; color: #64748b; font-weight: 700;">至</div>
          <div style="display: flex; flex-direction: column; align-items: center; background: rgba(245, 158, 11, 0.15); border: 2px solid #f59e0b; border-radius: 8px; padding: 8px 16px;">
            <span style="font-size: 11px; color: #94a3b8;">最多未匹配 (上限)</span>
            <span style="font-size: 22px; font-weight: 700; color: #fbbf24;">${maxOpen}</span>
          </div>
        </div>
      </div>

      <!-- 底部指标卡片 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前字符</div>
          <div style="font-size: 16px; font-weight: 700; color: #fbbf24;">${currentIdx >= 0 && currentIdx < s.length ? `'${s[currentIdx]}'` : '—'}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">通配符 '*' 角色</div>
          <div style="font-size: 13px; font-weight: 600; color: #38bdf8;">'(' / ')' / '' 三合一</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">能否完全闭合</div>
          <div style="font-size: 16px; font-weight: 700; color: ${minOpen === 0 ? '#34d399' : '#f43f5e'};">
            ${minOpen === 0 ? '✓ 可归零' : '需补右括号'}
          </div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">判定结果</div>
          <div style="font-size: 18px; font-weight: 700; color: ${isValidSoFar ? '#34d399' : '#f43f5e'};">
            ${phase === 'finish' ? (isValidSoFar ? 'TRUE' : 'FALSE') : isValidSoFar ? '有效中' : '无效'}
          </div>
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'valid-parenthesis-string',
  name: '有效的括号字符串',
  category: 'stack',
  difficulty: 2,
  learningGoal: 'LeetCode 678: 带通配符 * 的有效括号判定。利用贪心区间维护未匹配左括号范围 [minOpen, maxOpen]，在 O(N) 极速完成判定。',
  codeLanguages: VALID_PARENTHESIS_STRING_CODES,
  generateSteps: (inputs) => {
    const raw = inputs?.s as string | undefined;
    const s = typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : '(*))';
    return buildValidParenthesisStringSteps(s);
  },
  renderCanvas: (container: HTMLElement, step: ValidStringStep) => {
    container.innerHTML = renderValidStringCanvas(step);
  },
  inputs: [
    {
      id: 's',
      label: '括号与通配符序列',
      type: 'text',
      defaultValue: '(*))',
      placeholder: '例如: (*)) 或 (*)',
    },
  ],
});
