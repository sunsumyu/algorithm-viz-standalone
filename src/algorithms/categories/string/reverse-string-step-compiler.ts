/**
 * 反转字符串 — 步进推演编译器
 * LeetCode 344：首尾双指针对撞交换
 */

import { HighlightTarget } from '../../../core/code-panel';

export const REVERSE_STRING_CODE_LINES: Record<string, Record<string, number | number[]>> = {
  init: { java: 2, cpp: 4, python: 3, javascript: 2 },
  inspect: { java: 3, cpp: 5, python: 4, javascript: 3 },
  swap: { java: [4, 5, 6], cpp: 6, python: 5, javascript: [4, 5, 6] },
  move: { java: [7, 8], cpp: [7, 8], python: [6, 7], javascript: [7, 8] },
  done: { java: 10, cpp: 9, python: 7, javascript: 10 },
};

const lines = REVERSE_STRING_CODE_LINES;

export interface ReverseStringStep {
  s: string[];
  left: number;
  right: number;
  swapping: boolean;
  swapCount: number;
  status: 'init' | 'inspect' | 'swap' | 'move' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export function buildReverseStringSteps(inputStr: string): ReverseStringStep[] {
  const steps: ReverseStringStep[] = [];
  const s = inputStr.split('');
  let left = 0;
  let right = s.length - 1;
  let swapCount = 0;

  steps.push({
    s: [...s],
    left,
    right,
    swapping: false,
    swapCount: 0,
    status: 'init',
    message: `初始化双指针：left = 0 指向首字符 '${s[0] || ''}'，right = ${right} 指向尾字符 '${s[right] || ''}'。`,
    log: `初始化双指针: left=0, right=${right}`,
    codeLine: lines.init,
  });

  while (left < right) {
    steps.push({
      s: [...s],
      left,
      right,
      swapping: false,
      swapCount,
      status: 'inspect',
      message: `检查指针：left(${left}) < right(${right})，准备交换 s[${left}] ('${s[left]}') 和 s[${right}] ('${s[right]}')。`,
      log: `比对指针: left(${left}) < right(${right})`,
      codeLine: lines.inspect,
    });

    const temp = s[left];
    s[left] = s[right];
    s[right] = temp;
    swapCount++;

    steps.push({
      s: [...s],
      left,
      right,
      swapping: true,
      swapCount,
      status: 'swap',
      message: `交换完成：s[${left}] 变为 '${s[left]}'，s[${right}] 变为 '${s[right]}'。`,
      log: `交换 s[${left}] <-> s[${right}] ('${temp}' <-> '${s[left]}')`,
      codeLine: lines.swap,
    });

    left++;
    right--;

    steps.push({
      s: [...s],
      left,
      right,
      swapping: false,
      swapCount,
      status: 'move',
      message: `双指针向中间靠拢：left 移动至 ${left}，right 移动至 ${right}。`,
      log: `指针步进: left=${left}, right=${right}`,
      codeLine: lines.move,
    });
  }

  steps.push({
    s: [...s],
    left,
    right,
    swapping: false,
    swapCount,
    status: 'done',
    message: `🎉 反转完成！left(${left}) >= right(${right})，字符串成功原地反转为 "${s.join('')}"。`,
    log: `✓ 反转结束: "${s.join('')}" (共交换 ${swapCount} 次)`,
    codeLine: lines.done,
  });

  return steps;
}

export function withMetrics(steps: ReverseStringStep[]): ReverseStringStep[] {
  const statusMap: Record<string, string> = {
    init: '初始化',
    inspect: '对撞检查',
    swap: '交换中...',
    move: '指针移动',
    done: '反转完成',
  };
  return steps.map((step) => {
    let action = 'swap(s[left], s[right])';
    if (step.swapping) action = `swap(s[${step.left}], s[${step.right}]) 交换`;
    else if (step.status === 'done') action = '反转完成';

    return {
      ...step,
      metrics: {
        left: step.status === 'done' ? '—' : String(step.left),
        right: step.status === 'done' ? '—' : String(step.right),
        swaps: `${step.swapCount} 次`,
        status: statusMap[step.status] || step.status,
        action,
      },
    };
  });
}
