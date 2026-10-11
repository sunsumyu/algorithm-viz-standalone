/**
 * 翻转字符串里的单词 — 步进推演编译器
 * LeetCode 151：三步原地反转法
 */

import { HighlightTarget } from '../../../core/code-panel';

export const REVERSE_WORDS_CODE_LINES: Record<string, Record<string, number | number[]>> = {
  cleanSpaces: { java: [3, 11], cpp: [4, 14], python: 4, javascript: 3 },
  reverseAll: { java: [5, 13], cpp: 16, python: 4, javascript: 5 },
  reverseWords: { java: [7, 18], cpp: [18, 23], python: 4, javascript: 7 },
  done: { java: 8, cpp: 24, python: 4, javascript: 9 },
};

const lines = REVERSE_WORDS_CODE_LINES;

export interface ReverseWordsStep {
  chars: string[];
  stage: 1 | 2 | 3;
  left: number;
  right: number;
  wordStart?: number;
  wordEnd?: number;
  swapping: boolean;
  phase: 'clean-spaces' | 'reverse-all' | 'reverse-words' | 'done';
  status: 'clean-spaces' | 'reverse-all' | 'reverse-words' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export function buildReverseWordsSteps(inputStr: string): ReverseWordsStep[] {
  const steps: ReverseWordsStep[] = [];

  // Step 1: 移除多余空格
  const cleanedWords = inputStr.trim().split(/\s+/).filter(Boolean);
  const cleanedStr = cleanedWords.join(' ');
  const chars = cleanedStr.split('');

  steps.push({
    chars: inputStr.split(''),
    stage: 1,
    left: -1,
    right: -1,
    swapping: false,
    phase: 'clean-spaces',
    status: 'clean-spaces',
    message: `第 1 步：清除多余空格。原字符串 "${inputStr}" 清理前导、尾随及单词间连续空格。`,
    log: `清理空格: "${inputStr}" -> "${cleanedStr}"`,
    codeLine: lines.cleanSpaces,
  });

  steps.push({
    chars: [...chars],
    stage: 1,
    left: -1,
    right: -1,
    swapping: false,
    phase: 'clean-spaces',
    status: 'clean-spaces',
    message: `第 1 步完成：得到紧凑字符数组 "${cleanedStr}" (有效长度 ${chars.length})。`,
    log: `紧凑数组就绪 (长度 ${chars.length})`,
    codeLine: lines.cleanSpaces,
  });

  // Step 2: 反转整个字符串
  let left = 0;
  let right = chars.length - 1;

  steps.push({
    chars: [...chars],
    stage: 2,
    left,
    right,
    swapping: false,
    phase: 'reverse-all',
    status: 'reverse-all',
    message: `第 2 步：反转整个字符串。从 left = 0 到 right = ${right} 对撞反转。`,
    log: `开始整体反转 [0, ${right}]`,
    codeLine: lines.reverseAll,
  });

  while (left < right) {
    const temp = chars[left];
    chars[left] = chars[right];
    chars[right] = temp;

    steps.push({
      chars: [...chars],
      stage: 2,
      left,
      right,
      swapping: true,
      phase: 'reverse-all',
      status: 'reverse-all',
      message: `整体反转中：交换 chars[${left}] <-> chars[${right}] ('${temp}' <-> '${chars[left]}')。`,
      log: `交换 [${left}] <-> [${right}]`,
      codeLine: lines.reverseAll,
    });

    left++;
    right--;
  }

  steps.push({
    chars: [...chars],
    stage: 2,
    left: -1,
    right: -1,
    swapping: false,
    phase: 'reverse-all',
    status: 'reverse-all',
    message: `第 2 步完成：整体反转后为 "${chars.join('')}" (单词顺序已倒序，但单词内部字母也是倒的)。`,
    log: `整体反转完成: "${chars.join('')}"`,
    codeLine: lines.reverseAll,
  });

  // Step 3: 逐个单词反转
  let wordStart = 0;
  const n = chars.length;

  for (let i = 0; i <= n; i++) {
    if (i === n || chars[i] === ' ') {
      let wLeft = wordStart;
      let wRight = i - 1;
      const currentWordBefore = chars.slice(wLeft, wRight + 1).join('');

      steps.push({
        chars: [...chars],
        stage: 3,
        left: wLeft,
        right: wRight,
        wordStart: wLeft,
        wordEnd: wRight,
        swapping: false,
        phase: 'reverse-words',
        status: 'reverse-words',
        message: `第 3 步：锁定倒序单词 "${currentWordBefore}" 区间 [${wLeft}, ${wRight}]，准备局部反转恢复正常语序。`,
        log: `锁定单词区间 [${wLeft}, ${wRight}] ("${currentWordBefore}")`,
        codeLine: lines.reverseWords,
      });

      while (wLeft < wRight) {
        const temp = chars[wLeft];
        chars[wLeft] = chars[wRight];
        chars[wRight] = temp;

        steps.push({
          chars: [...chars],
          stage: 3,
          left: wLeft,
          right: wRight,
          wordStart,
          wordEnd: i - 1,
          swapping: true,
          phase: 'reverse-words',
          status: 'reverse-words',
          message: `单词内部交换：chars[${wLeft}] <-> chars[${wRight}] ('${temp}' <-> '${chars[wLeft]}')。`,
          log: `单词内交换 [${wLeft}] <-> [${wRight}]`,
          codeLine: lines.reverseWords,
        });

        wLeft++;
        wRight--;
      }

      wordStart = i + 1;
    }
  }

  steps.push({
    chars: [...chars],
    stage: 3,
    left: -1,
    right: -1,
    swapping: false,
    phase: 'done',
    status: 'done',
    message: `🎉 三步反转全部完成！最终翻转单词字符串为 "${chars.join('')}"。`,
    log: `✓ 求解完成: "${chars.join('')}"`,
    codeLine: lines.done,
  });

  return steps;
}

export function withMetrics(steps: ReverseWordsStep[]): ReverseWordsStep[] {
  const phaseMap: Record<string, string> = {
    'clean-spaces': 'Step 1: 去空格',
    'reverse-all': 'Step 2: 整体反转',
    'reverse-words': 'Step 3: 单词反转',
    done: '完成',
  };
  return steps.map((s) => {
    let action = '三步反转完成';
    if (s.phase === 'clean-spaces') action = 'removeExtraSpaces(s)';
    else if (s.phase === 'reverse-all') action = 'reverse(s, 0, n - 1)';
    else if (s.phase === 'reverse-words')
      action = `reverseEachWord(s, [${s.wordStart ?? -1}, ${s.wordEnd ?? -1}])`;

    return {
      ...s,
      metrics: {
        left: s.left >= 0 && s.phase !== 'done' ? String(s.left) : '—',
        right: s.right >= 0 && s.phase !== 'done' ? String(s.right) : '—',
        length: `${s.chars.length}`,
        phase: phaseMap[s.phase] || s.phase,
        action,
      },
    };
  });
}
