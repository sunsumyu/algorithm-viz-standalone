/**
 * 有序数组的平方 — 步进推演编译器
 * LeetCode 977：首尾对撞双指针
 */

import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface SSQStep {
  arr: number[];
  result: (number | null)[];
  left: number;
  right: number;
  writeIdx: number;
  status: 'init' | 'compare' | 'write-left' | 'write-right' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics: Record<string, string | number>;
  ans?: string;
}

export function parseSortedArray(input: string): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return arr.length > 0 ? arr.sort((a, b) => a - b) : [-4, -1, 0, 3, 10];
}

export function buildSortedSquaresSteps(arr: number[]): SSQStep[] {
  const steps: SSQStep[] = [];
  const n = arr.length;
  const result: (number | null)[] = new Array(n).fill(null);
  let left = 0;
  let right = n - 1;

  const lines = {
    init: { java: [3, 4], cpp: [5, 6], python: [4, 5], javascript: [3, 4] },
    compare: { java: [6, 7, 8], cpp: [8, 9, 10], python: [7, 8, 9], javascript: [6, 7, 8] },
    writeLeft: { java: [9, 10], cpp: [11, 12], python: [10, 11], javascript: [9, 10] },
    writeRight: { java: [12, 13], cpp: [14, 15], python: [13, 14], javascript: [12, 13] },
    done: { java: 16, cpp: 18, python: 15, javascript: 16 },
  };

  const getInitLsq = () => (left < n ? arr[left] ** 2 : '—');
  const getInitRsq = () => (right >= 0 ? arr[right] ** 2 : '—');

  steps.push({
    arr: [...arr],
    result: [...result],
    left,
    right,
    writeIdx: n - 1,
    status: 'init',
    message: `初始化 left=0, right=${n - 1}，结果数组从末尾 writeIdx=${n - 1} 开始向前填充。`,
    log: `初始化双指针：left=0, right=${n - 1}, writeIdx=${n - 1}`,
    codeLine: lines.init,
    metrics: {
      'left-sq': getInitLsq(),
      'right-sq': getInitRsq(),
      pointers: `[${left}, ${right}]`,
      'write-idx': `result[${n - 1}]`,
    },
  });

  for (let i = n - 1; i >= 0; i--) {
    const lsq = arr[left] * arr[left];
    const rsq = arr[right] * arr[right];

    steps.push({
      arr: [...arr],
      result: [...result],
      left,
      right,
      writeIdx: i,
      status: 'compare',
      message: `比较 nums[left=${left}]² = ${lsq} 与 nums[right=${right}]² = ${rsq}，将较大者填入 result[${i}]。`,
      log: `比较: left²=${lsq} vs right²=${rsq}`,
      codeLine: lines.compare,
      metrics: {
        'left-sq': lsq,
        'right-sq': rsq,
        pointers: `[${left}, ${right}]`,
        'write-idx': `result[${i}]`,
      },
    });

    if (lsq > rsq) {
      result[i] = lsq;
      steps.push({
        arr: [...arr],
        result: [...result],
        left,
        right,
        writeIdx: i,
        status: 'write-left',
        message: `${lsq} > ${rsq}，左侧平方更大：写入 result[${i}] = ${lsq}，left++ → ${left + 1}。`,
        log: `填入左侧平方: result[${i}] = ${lsq}，left -> ${left + 1}`,
        codeLine: lines.writeLeft,
        metrics: {
          'left-sq': lsq,
          'right-sq': rsq,
          pointers: `[${left}→${left + 1}, ${right}]`,
          'write-idx': `result[${i}]=${lsq}`,
        },
      });
      left++;
    } else {
      result[i] = rsq;
      steps.push({
        arr: [...arr],
        result: [...result],
        left,
        right,
        writeIdx: i,
        status: 'write-right',
        message: `${lsq} ≤ ${rsq}，右侧平方更大或相等：写入 result[${i}] = ${rsq}，right-- → ${right - 1}。`,
        log: `填入右侧平方: result[${i}] = ${rsq}，right -> ${right - 1}`,
        codeLine: lines.writeRight,
        metrics: {
          'left-sq': lsq,
          'right-sq': rsq,
          pointers: `[${left}, ${right}→${right - 1}]`,
          'write-idx': `result[${i}]=${rsq}`,
        },
      });
      right--;
    }
  }

  const finalFormatted = `[${result.join(', ')}]`;
  steps.push({
    arr: [...arr],
    result: [...result],
    left,
    right,
    writeIdx: -1,
    status: 'done',
    message: `🎉 计算完成！最终有序平方数组为 ${finalFormatted}。`,
    log: `✓ 完成：${finalFormatted}`,
    codeLine: lines.done,
    ans: finalFormatted,
    metrics: {
      'left-sq': '—',
      'right-sq': '—',
      pointers: '对撞相遇完成',
      'write-idx': '全部填充完毕',
      'metric-ans': finalFormatted,
    },
  });

  return steps;
}
