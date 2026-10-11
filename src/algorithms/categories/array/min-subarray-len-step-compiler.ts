/**
 * 长度最小的子数组 — 步进推演编译器
 * LeetCode 209：滑动窗口双指针
 */

import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface SWStep {
  array: number[];
  left: number;
  right: number;
  sum: number;
  minLen: number;
  target: number;
  status: 'expand' | 'shrink' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
}

export function parsePositiveArray(input: string): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
  return arr.length > 0 ? arr : [2, 3, 1, 2, 4, 3];
}

export function buildMinSubarrayLenSteps(nums: number[], target: number): SWStep[] {
  const steps: SWStep[] = [];
  let left = 0;
  let sum = 0;
  let minLen = Infinity;

  const lines = {
    init: { java: 2, cpp: 4, python: [3, 4, 5], javascript: 2 },
    expand: { java: [3, 4], cpp: [5, 6], python: [6, 7], javascript: [3, 4] },
    record: { java: [5, 6], cpp: [7, 8], python: [8, 9], javascript: [5, 6] },
    shrink: { java: [7, 8], cpp: [9, 10], python: [10, 11], javascript: [7, 8] },
    done: { java: 11, cpp: 13, python: 12, javascript: 11 },
  };

  steps.push({
    array: [...nums],
    left: 0,
    right: 0,
    sum: 0,
    minLen,
    target,
    status: 'expand',
    message: `初始化 left=0, right=0, sum=0, minLen=∞，目标 target=${target}。准备向右扩展窗口。`,
    log: `初始化滑动窗口：target=${target}`,
    codeLine: lines.init,
  });

  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];
    steps.push({
      array: [...nums],
      left,
      right,
      sum,
      minLen,
      target,
      status: 'expand',
      message: `右边界扩展 right=${right}：加入 nums[${right}]=${nums[right]}，当前窗口和 sum=${sum}。`,
      log: `扩展 right=${right}，nums[${right}]=${nums[right]}，sum -> ${sum}`,
      codeLine: lines.expand,
    });

    while (sum >= target) {
      const currentLen = right - left + 1;
      minLen = Math.min(minLen, currentLen);
      steps.push({
        array: [...nums],
        left,
        right,
        sum,
        minLen,
        target,
        status: 'shrink',
        message: `sum=${sum} ≥ target(${target})，发现满足条件的窗口 [${left}..${right}]，长度 ${currentLen}，更新 minLen=${minLen}。准备收缩左边界。`,
        log: `达标！窗口长度 ${currentLen}，minLen 更新为 ${minLen}`,
        codeLine: lines.record,
      });

      sum -= nums[left];
      left++;
      steps.push({
        array: [...nums],
        left,
        right,
        sum,
        minLen,
        target,
        status: 'shrink',
        message: `收缩左边界：移出 nums[${left - 1}]=${nums[left - 1]}，left 右移至 ${left}，当前窗口和 sum=${sum}。`,
        log: `收缩 left -> ${left}，移出 ${nums[left - 1]}，sum -> ${sum}`,
        codeLine: lines.shrink,
      });
    }
  }

  steps.push({
    array: [...nums],
    left,
    right: nums.length - 1,
    sum,
    minLen,
    target,
    status: 'done',
    message:
      minLen === Infinity
        ? `🎉 遍历完成！未找到满足 sum >= ${target} 的连续子数组，返回 0。`
        : `🎉 遍历完成！最小子数组长度为 minLen = ${minLen}。`,
    log: minLen === Infinity ? '✓ 完成：未找到 (返回 0)' : `✓ 完成：minLen = ${minLen}`,
    codeLine: lines.done,
  });

  return steps;
}
