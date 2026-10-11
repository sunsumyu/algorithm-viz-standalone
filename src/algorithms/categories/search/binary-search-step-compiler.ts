/**
 * 二分查找 - 步进编译器
 * 左闭右闭区间折半、中点动态定位、边界收缩与目标命中
 */

export interface BSStep {
  array: number[];
  left: number;
  right: number;
  mid: number;
  target: number;
  phase: 'init' | 'check-mid' | 'narrow-left' | 'narrow-right' | 'found' | 'not-found';
  status: 'init' | 'check-mid' | 'narrow-left' | 'narrow-right' | 'found' | 'not-found';
  comparisons: number;
  foundIndex: number;
  message: string;
  log: string;
  codeLine?: number | number[] | Record<string, number | number[]>;
}

export const BINARY_SEARCH_CODE_LINES: Record<string, Record<string, number | number[]>> = {
  init: { java: 3, cpp: 4, python: 3, javascript: 2 },
  empty: { java: 2, cpp: 4, python: 3, javascript: 2 },
  checkMid: { java: [4, 5, 6], cpp: [5, 6, 7], python: [4, 5, 6], javascript: [3, 4, 5] },
  found: { java: 7, cpp: 8, python: 7, javascript: 6 },
  narrowLeft: { java: [10, 11], cpp: [11, 12], python: [10, 11], javascript: [9, 10] },
  narrowRight: { java: [8, 9], cpp: [9, 10], python: [8, 9], javascript: [7, 8] },
  notFound: { java: 14, cpp: 15, python: 12, javascript: 13 },
};

export function parseSearchArray(input: string): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return arr.length > 0 ? arr.sort((a, b) => a - b) : [-1, 0, 3, 5, 9, 12];
}

export function binarySearchSteps(raw: number[], target: number): BSStep[] {
  const steps: BSStep[] = [];
  const array = [...raw].sort((a, b) => a - b);
  const n = array.length;
  let left = 0;
  let right = n - 1;
  let comparisons = 0;

  steps.push({
    array: [...array],
    left: 0,
    right: n - 1,
    mid: -1,
    target,
    phase: 'init',
    status: 'init',
    comparisons: 0,
    foundIndex: -1,
    message: n === 0 ? '数组为空，无法查找。' : `初始化二分查找：L = 0, R = ${n - 1}，目标 target = ${target}。`,
    log: n === 0 ? '空数组' : `初始化: L=0, R=${n - 1}, target=${target}`,
    codeLine: BINARY_SEARCH_CODE_LINES.init,
  });

  if (n === 0) {
    steps.push({
      array: [],
      left: -1,
      right: -1,
      mid: -1,
      target,
      phase: 'not-found',
      status: 'not-found',
      comparisons: 0,
      foundIndex: -1,
      message: '❌ 数组为空，未找到目标值，返回 -1。',
      log: '未找到 target -> 返回 -1',
      codeLine: BINARY_SEARCH_CODE_LINES.empty,
    });
    return steps;
  }

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    const midVal = array[mid];
    comparisons++;

    steps.push({
      array: [...array],
      left,
      right,
      mid,
      target,
      phase: 'check-mid',
      status: 'check-mid',
      comparisons,
      foundIndex: -1,
      message: `计算中点：mid = ${left} + (${right} - ${left}) / 2 = ${mid}，nums[${mid}] = ${midVal}。与 target (${target}) 比较。`,
      log: `计算 mid=${mid} (nums[${mid}]=${midVal})`,
      codeLine: BINARY_SEARCH_CODE_LINES.checkMid,
    });

    if (midVal === target) {
      steps.push({
        array: [...array],
        left,
        right,
        mid,
        target,
        phase: 'found',
        status: 'found',
        comparisons,
        foundIndex: mid,
        message: `🎯 命中目标！nums[${mid}] == ${target}，成功在下标 ${mid} 处找到目标值！`,
        log: `✓ 命中目标: 下标 ${mid}`,
        codeLine: BINARY_SEARCH_CODE_LINES.found,
      });
      return steps;
    } else if (midVal < target) {
      steps.push({
        array: [...array],
        left: mid + 1,
        right,
        mid,
        target,
        phase: 'narrow-left',
        status: 'narrow-left',
        comparisons,
        foundIndex: -1,
        message: `nums[mid=${mid}]=${midVal} < target(${target})，目标在右半区，调整左边界：left = mid + 1 = ${mid + 1}。`,
        log: `${midVal} < ${target} -> 调整 left = ${mid + 1}`,
        codeLine: BINARY_SEARCH_CODE_LINES.narrowLeft,
      });
      left = mid + 1;
    } else {
      steps.push({
        array: [...array],
        left,
        right: mid - 1,
        mid,
        target,
        phase: 'narrow-right',
        status: 'narrow-right',
        comparisons,
        foundIndex: -1,
        message: `nums[mid=${mid}]=${midVal} > target(${target})，目标在左半区，调整右边界：right = mid - 1 = ${mid - 1}。`,
        log: `${midVal} > ${target} -> 调整 right = ${mid - 1}`,
        codeLine: BINARY_SEARCH_CODE_LINES.narrowRight,
      });
      right = mid - 1;
    }
  }

  steps.push({
    array: [...array],
    left,
    right,
    mid: -1,
    target,
    phase: 'not-found',
    status: 'not-found',
    comparisons,
    foundIndex: -1,
    message: `❌ 查找结束：left (${left}) > right (${right})，区间为空，未找到目标值，返回 -1。`,
    log: `✓ 结束：未找到 target (${target}) -> -1`,
    codeLine: BINARY_SEARCH_CODE_LINES.notFound,
  });

  return steps;
}
