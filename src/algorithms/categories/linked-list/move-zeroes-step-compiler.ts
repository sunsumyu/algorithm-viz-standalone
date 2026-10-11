/**
 * 移动零 — 步进推演编译器
 * LeetCode 283：快慢双指针原地交换
 */

import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface MoveZeroesStep {
  nums: number[];
  slow: number;
  fast: number;
  action: 'init' | 'check_zero' | 'check_nonzero' | 'swap' | 'done';
  message: string;
  codeLine: HighlightTarget;
  log?: string;
  metrics?: Record<string, string>;
}

export function buildMoveZeroesSteps(initialNums: number[]): MoveZeroesStep[] {
  const steps: MoveZeroesStep[] = [];
  const nums = [...initialNums];
  let slow = 0;

  const lines = {
    init: { java: 3, cpp: 4, python: 3, javascript: 2 },
    checkZero: { java: 4, cpp: 5, python: 4, javascript: 3 },
    checkNonzero: { java: 5, cpp: 6, python: 5, javascript: 4 },
    swap: { java: [6, 7, 8, 9], cpp: [7, 8], python: [6, 7], javascript: [5, 6] },
    done: { java: 11, cpp: 10, python: 4, javascript: 8 },
  };

  steps.push({
    nums: [...nums],
    slow: 0,
    fast: 0,
    action: 'init',
    message: `初始化：slow=0, fast=0。慢指针 slow 指向待填槽位，快指针 fast 扫描非零元素。`,
    codeLine: lines.init,
  });

  for (let fast = 0; fast < nums.length; fast++) {
    const val = nums[fast];
    if (val !== 0) {
      steps.push({
        nums: [...nums],
        slow,
        fast,
        action: 'check_nonzero',
        message: `fast=${fast} 处 nums[${fast}]=${val} ≠ 0，命中非零值，准备与 slow=${slow} 处元素交换。`,
        codeLine: lines.checkNonzero,
      });

      // 交换
      const temp = nums[slow];
      nums[slow] = nums[fast];
      nums[fast] = temp;

      steps.push({
        nums: [...nums],
        slow,
        fast,
        action: 'swap',
        message: `交换 nums[${slow}] (${temp}) 与 nums[${fast}] (${val})。slow++ 递增至 ${slow + 1}。`,
        codeLine: lines.swap,
      });

      slow++;
    } else {
      steps.push({
        nums: [...nums],
        slow,
        fast,
        action: 'check_zero',
        message: `fast=${fast} 处 nums[${fast}]=0，跳过继续探测。`,
        codeLine: lines.checkZero,
      });
    }
  }

  steps.push({
    nums: [...nums],
    slow,
    fast: nums.length,
    action: 'done',
    message: `🎉 扫描完毕！所有非零元素已按序排在前部，末尾全为 0。最终数组: [${nums.join(', ')}]。`,
    codeLine: lines.done,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withMoveZeroesMetrics(steps: MoveZeroesStep[]): MoveZeroesStep[] {
  return steps.map((s) => {
    let phase = '初始化';
    if (s.action === 'check_nonzero') phase = '命中非零';
    else if (s.action === 'swap') phase = '原地交换';
    else if (s.action === 'check_zero') phase = '遇到 0 跳过';
    else if (s.action === 'done') phase = '移动完成';

    return {
      ...s,
      log: s.message,
      metrics: {
        slow: `[${s.slow}]`,
        fast: s.fast < s.nums.length ? `[${s.fast}]` : '扫描结束',
        'cur-val': s.fast < s.nums.length ? String(s.nums[s.fast]) : '—',
        phase,
      },
    };
  });
}
