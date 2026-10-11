/**
 * 删除相邻重复项 (Remove All Adjacent Duplicates In String) - 步进编译器
 * LeetCode 1047
 */

import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface RADStep {
  rawString: string;
  currentIndex: number;
  currentChar: string | null;
  stack: string[];
  eliminatedPairs: number;
  eliminatedChar: string | null;
  currentString: string;
  action: 'init' | 'scan' | 'eliminate' | 'push' | 'done';
  message: string;
  codeLine: HighlightTarget;
}

export function buildRemoveAdjacentDuplicatesSteps(rawInput: string): RADStep[] {
  const steps: RADStep[] = [];
  const s = (rawInput || 'abbaca').trim();
  const n = s.length;

  const lines = {
    init:      { java: 2,  cpp: 4,  python: 3, javascript: 2 },
    eliminate: { java: 5,  cpp: 7,  python: 6, javascript: 5 },
    push:      { java: 7,  cpp: 9,  python: 8, javascript: 7 },
    done:      { java: 10, cpp: 12, python: 9, javascript: 10 },
  };

  if (n === 0) {
    steps.push({
      rawString: '',
      currentIndex: -1,
      currentChar: null,
      stack: [],
      eliminatedPairs: 0,
      eliminatedChar: null,
      currentString: '',
      action: 'done',
      message: '输入为空字符串，化简结果为空',
      codeLine: lines.done,
    });
    return steps;
  }

  const stack: string[] = [];
  let eliminatedPairs = 0;

  steps.push({
    rawString: s,
    currentIndex: -1,
    currentChar: null,
    stack: [],
    eliminatedPairs: 0,
    eliminatedChar: null,
    currentString: '',
    action: 'init',
    message: `初始化：输入字符串 "${s}" (长度 ${n})，准备从左向右扫描，利用栈顶作为相邻前驱对消重复项`,
    codeLine: lines.init,
  });

  for (let i = 0; i < n; i++) {
    const ch = s[i];

    if (stack.length > 0 && stack[stack.length - 1] === ch) {
      const popped = stack.pop()!;
      eliminatedPairs++;

      steps.push({
        rawString: s,
        currentIndex: i,
        currentChar: ch,
        stack: [...stack],
        eliminatedPairs,
        eliminatedChar: ch,
        currentString: stack.join(''),
        action: 'eliminate',
        message: `💥 触发相邻对消！当前字符 '${ch}' 与栈顶 '${popped}' 相同，双双抵消！已消除 ${eliminatedPairs} 对，当前结果: "${stack.join('')}"`,
        codeLine: lines.eliminate,
      });
    } else {
      stack.push(ch);

      steps.push({
        rawString: s,
        currentIndex: i,
        currentChar: ch,
        stack: [...stack],
        eliminatedPairs,
        eliminatedChar: null,
        currentString: stack.join(''),
        action: 'push',
        message: `📥 字符 '${ch}' 与栈顶不重复，压入栈顶暂存。当前栈: "${stack.join('')}"`,
        codeLine: lines.push,
      });
    }
  }

  const resStr = stack.join('');
  steps.push({
    rawString: s,
    currentIndex: n,
    currentChar: null,
    stack: [...stack],
    eliminatedPairs,
    eliminatedChar: null,
    currentString: resStr,
    action: 'done',
    message: `🎉 字符串扫描完毕！共对消 ${eliminatedPairs} 对相邻重复项，最终化简结果为: "${resStr || '(空)'}"`,
    codeLine: lines.done,
  });

  return steps;
}
