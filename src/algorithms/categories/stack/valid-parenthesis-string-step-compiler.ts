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
  codeLine: number | Record<string, number>;
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

export const VALID_PARENTHESIS_STRING_CODE_LINES: Record<string, Record<string, number>> = {
  init: { java: 3, cpp: 4, python: 3 },
  scanOpen: { java: 6, cpp: 7, python: 6 },
  scanClose: { java: 9, cpp: 9, python: 9 },
  scanStar: { java: 12, cpp: 11, python: 12 },
  invalid: { java: 15, cpp: 13, python: 15 },
  scanUpdate: { java: 16, cpp: 14, python: 16 },
  finish: { java: 18, cpp: 16, python: 17 },
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
    codeLine: VALID_PARENTHESIS_STRING_CODE_LINES.init,
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
        codeLine: VALID_PARENTHESIS_STRING_CODE_LINES.invalid,
      });
      return steps;
    }

    minOpen = Math.max(minOpen, 0);

    const lineTarget =
      c === '('
        ? VALID_PARENTHESIS_STRING_CODE_LINES.scanOpen
        : c === ')'
        ? VALID_PARENTHESIS_STRING_CODE_LINES.scanClose
        : VALID_PARENTHESIS_STRING_CODE_LINES.scanStar;

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
      codeLine: lineTarget,
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
    codeLine: VALID_PARENTHESIS_STRING_CODE_LINES.finish,
  });

  return steps;
}
