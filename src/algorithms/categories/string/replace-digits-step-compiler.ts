/**
 * 替换数字 — 步进推演编译器
 * KamaCoder 54：预扩容与从后向前双指针替换
 */

import { HighlightTarget } from '../../../core/code-panel';

export const REPLACE_DIGITS_CODE_LINES: Record<string, Record<string, number | number[]>> = {
  count: { java: [3, 4], cpp: [4, 5, 6], python: [3, 4], javascript: [3, 4] },
  resize: { java: 2, cpp: 7, python: 2, javascript: 2 },
  replaceLetter: { java: [5, 8], cpp: [10, 11], python: [6, 7], javascript: [7, 8] },
  replaceNumber: { java: [5, 6], cpp: [12, 13, 14], python: [4, 5], javascript: [5, 6] },
  done: { java: 11, cpp: 17, python: 8, javascript: 11 },
};

const lines = REPLACE_DIGITS_CODE_LINES;

export interface ReplaceDigitsStep {
  chars: string[];
  oldIndex: number;
  newIndex: number;
  digitCount: number;
  isDigit: boolean;
  phase: 'count' | 'resize' | 'replace-letter' | 'replace-number' | 'done';
  status: 'count' | 'resize' | 'replace-letter' | 'replace-number' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export function buildReplaceDigitsSteps(inputStr: string): ReplaceDigitsStep[] {
  const steps: ReplaceDigitsStep[] = [];
  const oldChars = inputStr.split('');
  const oldSize = oldChars.length;
  let count = 0;

  for (const c of oldChars) {
    if (c >= '0' && c <= '9') count++;
  }

  const newSize = oldSize + count * 5;
  const newChars = new Array<string>(newSize).fill('');
  for (let idx = 0; idx < oldSize; idx++) {
    newChars[idx] = oldChars[idx];
  }

  steps.push({
    chars: [...newChars],
    oldIndex: oldSize - 1,
    newIndex: newSize - 1,
    digitCount: count,
    isDigit: false,
    phase: 'count',
    status: 'count',
    message: `扫描统计数字字符：共找到 ${count} 个数字。旧长度 oldSize = ${oldSize}。`,
    log: `统计数字: ${count} 个数字字符`,
    codeLine: lines.count,
  });

  steps.push({
    chars: [...newChars],
    oldIndex: oldSize - 1,
    newIndex: newSize - 1,
    digitCount: count,
    isDigit: false,
    phase: 'resize',
    status: 'resize',
    message: `执行数组预扩容：newSize = ${oldSize} + ${count} * 5 = ${newSize}。双指针 oldIndex=${oldSize - 1}, newIndex=${newSize - 1} 从后向前填充。`,
    log: `数组预扩容: ${oldSize} -> ${newSize}`,
    codeLine: lines.resize,
  });

  let i = oldSize - 1;
  let j = newSize - 1;

  while (i >= 0 && j >= 0) {
    const char = newChars[i];
    const isDigitChar = char >= '0' && char <= '9';

    if (!isDigitChar) {
      newChars[j] = char;
      if (i !== j) newChars[i] = '';

      steps.push({
        chars: [...newChars],
        oldIndex: i,
        newIndex: j,
        digitCount: count,
        isDigit: false,
        phase: 'replace-letter',
        status: 'replace-letter',
        message: `非数字字符 '${char}'：直接从 oldIndex(${i}) 搬移至 newIndex(${j})。`,
        log: `复制字母 '${char}': [${i}] -> [${j}]`,
        codeLine: lines.replaceLetter,
      });

      i--;
      j--;
    } else {
      const numberToken = 'number';
      for (let k = numberToken.length - 1; k >= 0; k--) {
        newChars[j] = numberToken[k];
        j--;
      }
      if (i < j + 1) newChars[i] = '';

      steps.push({
        chars: [...newChars],
        oldIndex: i,
        newIndex: j + 1,
        digitCount: count,
        isDigit: true,
        phase: 'replace-number',
        status: 'replace-number',
        message: `数字字符 '${char}'：替换为 "number"，从 newIndex 向前连续填入 6 个字符。`,
        log: `替换数字 '${char}' -> "number"`,
        codeLine: lines.replaceNumber,
      });

      i--;
    }
  }

  steps.push({
    chars: [...newChars],
    oldIndex: -1,
    newIndex: -1,
    digitCount: count,
    isDigit: false,
    phase: 'done',
    status: 'done',
    message: `🎉 替换全部完成！最终字符串为 "${newChars.join('')}"。`,
    log: `✓ 完成: "${newChars.join('')}"`,
    codeLine: lines.done,
  });

  return steps;
}

export function withMetrics(steps: ReplaceDigitsStep[]): ReplaceDigitsStep[] {
  const phaseMap: Record<string, string> = {
    count: '统计数字',
    resize: '预扩容',
    'replace-letter': '搬移字母',
    'replace-number': '替换 number',
    done: '替换完成',
  };
  return steps.map((step) => ({
    ...step,
    metrics: {
      'old-idx': step.oldIndex >= 0 ? String(step.oldIndex) : '—',
      'new-idx': step.newIndex >= 0 ? String(step.newIndex) : '—',
      digits: `${step.digitCount} 个`,
      phase: phaseMap[step.phase] || step.phase,
      action: `newSize = ${step.chars.length - step.digitCount * 5} + ${step.digitCount} * 5 = ${step.chars.length}`,
    },
  }));
}
