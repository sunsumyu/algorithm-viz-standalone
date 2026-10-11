/**
 * 括号匹配 (Valid Parentheses) - 步进编译器
 * LeetCode 20
 */

import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface BracketStep {
  rawString: string;
  currentIndex: number;
  currentChar: string | null;
  stack: string[];
  matchedPairs: number;
  isValid: boolean;
  action: 'init' | 'push_expected' | 'match_pop' | 'mismatch' | 'done';
  message: string;
  codeLine: HighlightTarget;
}

export function buildBracketSteps(rawInput: string): BracketStep[] {
  const steps: BracketStep[] = [];
  const s = (rawInput || '()[]{}').trim();
  const n = s.length;

  const lines = {
    checkOdd:    { java: 2,  cpp: 4,  python: 3,  javascript: 2 },
    init:        { java: 3,  cpp: 5,  python: 5,  javascript: 3 },
    pushParen:   { java: 6,  cpp: 7,  python: 9,  javascript: 5 },
    pushBracket: { java: 7,  cpp: 8,  python: 9,  javascript: 6 },
    pushBrace:   { java: 8,  cpp: 9,  python: 9,  javascript: 7 },
    matchPop:    { java: 9,  cpp: 11, python: 10, javascript: 8 },
    mismatch:    { java: 9,  cpp: 10, python: 11, javascript: 8 },
    done:        { java: 11, cpp: 13, python: 12, javascript: 10 },
  };

  if (n === 0) {
    steps.push({
      rawString: '',
      currentIndex: -1,
      currentChar: null,
      stack: [],
      matchedPairs: 0,
      isValid: true,
      action: 'done',
      message: '输入为空字符串，判定为有效括号',
      codeLine: lines.done,
    });
    return steps;
  }

  if (n % 2 !== 0) {
    steps.push({
      rawString: s,
      currentIndex: 0,
      currentChar: s[0],
      stack: [],
      matchedPairs: 0,
      isValid: false,
      action: 'mismatch',
      message: `❌ 长度为 ${n}（奇数），不可能成对闭合，直接判定为无效 (False)`,
      codeLine: lines.checkOdd,
    });
    return steps;
  }

  const stack: string[] = [];
  let matchedPairs = 0;

  steps.push({
    rawString: s,
    currentIndex: -1,
    currentChar: null,
    stack: [],
    matchedPairs: 0,
    isValid: true,
    action: 'init',
    message: `初始化：字符串长度 ${n}（偶数），准备从左往右扫描，使用「遇左压右」单调匹配策略`,
    codeLine: lines.init,
  });

  for (let i = 0; i < n; i++) {
    const c = s[i];

    if (c === '(') {
      stack.push(')');
      steps.push({
        rawString: s,
        currentIndex: i,
        currentChar: c,
        stack: [...stack],
        matchedPairs,
        isValid: true,
        action: 'push_expected',
        message: `📥 遇到左圆括号 '('，将期望的右括号 ')' 压入栈顶`,
        codeLine: lines.pushParen,
      });
    } else if (c === '[') {
      stack.push(']');
      steps.push({
        rawString: s,
        currentIndex: i,
        currentChar: c,
        stack: [...stack],
        matchedPairs,
        isValid: true,
        action: 'push_expected',
        message: `📥 遇到左方括号 '['，将期望的右括号 ']' 压入栈顶`,
        codeLine: lines.pushBracket,
      });
    } else if (c === '{') {
      stack.push('}');
      steps.push({
        rawString: s,
        currentIndex: i,
        currentChar: c,
        stack: [...stack],
        matchedPairs,
        isValid: true,
        action: 'push_expected',
        message: `📥 遇到左花括号 '{'，将期望的右括号 '}' 压入栈顶`,
        codeLine: lines.pushBrace,
      });
    } else {
      if (stack.length === 0) {
        steps.push({
          rawString: s,
          currentIndex: i,
          currentChar: c,
          stack: [],
          matchedPairs,
          isValid: false,
          action: 'mismatch',
          message: `❌ 扫描到右括号 '${c}' 但栈已为空！右括号多于左括号，判定无效 (False)`,
          codeLine: lines.mismatch,
        });
        return steps;
      }

      const expected = stack[stack.length - 1];
      if (expected !== c) {
        steps.push({
          rawString: s,
          currentIndex: i,
          currentChar: c,
          stack: [...stack],
          matchedPairs,
          isValid: false,
          action: 'mismatch',
          message: `❌ 括号类型不匹配：当前为 '${c}'，而栈顶期望闭合符为 '${expected}'，判定无效 (False)`,
          codeLine: lines.mismatch,
        });
        return steps;
      }

      stack.pop();
      matchedPairs++;
      steps.push({
        rawString: s,
        currentIndex: i,
        currentChar: c,
        stack: [...stack],
        matchedPairs,
        isValid: true,
        action: 'match_pop',
        message: `✓ 成功闭合！'${c}' 与期望符吻合，弹出栈顶期望符，已闭合 ${matchedPairs} 对`,
        codeLine: lines.matchPop,
      });
    }
  }

  const allMatched = stack.length === 0;
  steps.push({
    rawString: s,
    currentIndex: n,
    currentChar: null,
    stack: [...stack],
    matchedPairs,
    isValid: allMatched,
    action: allMatched ? 'done' : 'mismatch',
    message: allMatched
      ? `🎉 遍历结束！栈为空，全部括号完美闭合，判定为有效 (True)！`
      : `❌ 遍历结束但栈仍有剩余 [${stack.join(', ')}]，左括号多于右括号，判定无效 (False)`,
    codeLine: lines.done,
  });

  return steps;
}
