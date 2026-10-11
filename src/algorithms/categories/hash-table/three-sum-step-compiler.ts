/**
 * 三数之和 — 步进推演编译器
 * LeetCode 15：排序 + 双指针 + 去重剪枝
 */

import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface ThreeSumStep {
  array: number[];
  i: number;
  left: number;
  right: number;
  sum: number | null;
  results: [number, number, number][];
  status:
    | 'init'
    | 'sort'
    | 'i-check'
    | 'i-skip'
    | 'compare'
    | 'found'
    | 'left-advance'
    | 'right-advance'
    | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export function parseThreeSumArray(input: string): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return arr.length >= 3 ? arr : [-1, 0, 1, 2, -1, -4];
}

export function buildThreeSumSteps(rawNums: number[]): ThreeSumStep[] {
  const steps: ThreeSumStep[] = [];
  const nums = [...rawNums];
  const results: [number, number, number][] = [];

  const lines = {
    init: { java: 2, cpp: 4, python: 4, javascript: 2 },
    sort: { java: 3, cpp: 5, python: 3, javascript: 3 },
    iBreak: { java: 5, cpp: 7, python: [6, 7], javascript: 5 },
    iSkip: { java: 6, cpp: 8, python: [8, 9], javascript: 6 },
    iCheck: { java: 7, cpp: 9, python: 10, javascript: 7 },
    found: { java: [10, 11], cpp: [12, 13], python: [13, 14], javascript: [10, 11] },
    shrink: { java: 14, cpp: 16, python: [19, 20], javascript: 14 },
    leftAdvance: { java: 16, cpp: 18, python: 22, javascript: 16 },
    rightAdvance: { java: 18, cpp: 20, python: 24, javascript: 18 },
    done: { java: 22, cpp: 24, python: 25, javascript: 22 },
  };

  steps.push({
    array: [...nums],
    i: -1,
    left: -1,
    right: -1,
    sum: null,
    results: [],
    status: 'init',
    message: `初始数组: [${nums.join(', ')}]，准备进行升序排序。`,
    log: `初始化原始数组: [${nums.join(', ')}]`,
    codeLine: lines.init,
  });

  nums.sort((a, b) => a - b);
  steps.push({
    array: [...nums],
    i: -1,
    left: -1,
    right: -1,
    sum: null,
    results: [],
    status: 'sort',
    message: `对数组进行升序排序: [${nums.join(', ')}]。接下来使用外层循环固定 i，配合双指针 left、right 寻找三数之和为 0。`,
    log: `完成升序排序: [${nums.join(', ')}]`,
    codeLine: lines.sort,
  });

  const n = nums.length;
  for (let i = 0; i < n - 2; i++) {
    if (nums[i] > 0) {
      steps.push({
        array: [...nums],
        i,
        left: -1,
        right: -1,
        sum: null,
        results: [...results],
        status: 'i-skip',
        message: `nums[${i}] = ${nums[i]} > 0，因为数组已升序排序，后续所有数字均大于 0，三数之和不可能为 0，提前终止搜索（剪枝）。`,
        log: `nums[${i}]=${nums[i]} > 0，剪枝终止`,
        codeLine: lines.iBreak,
      });
      break;
    }

    if (i > 0 && nums[i] === nums[i - 1]) {
      steps.push({
        array: [...nums],
        i,
        left: -1,
        right: -1,
        sum: null,
        results: [...results],
        status: 'i-skip',
        message: `nums[${i}] = ${nums[i]} 与前一个元素 nums[${i - 1}] = ${nums[i - 1]} 重复，跳过当前 i 以避免产生重复三元组解（去重）。`,
        log: `跳过重复元素 nums[${i}]=${nums[i]}`,
        codeLine: lines.iSkip,
      });
      continue;
    }

    let left = i + 1;
    let right = n - 1;

    steps.push({
      array: [...nums],
      i,
      left,
      right,
      sum: nums[i] + nums[left] + nums[right],
      results: [...results],
      status: 'i-check',
      message: `固定 i=${i} (nums[${i}]=${nums[i]})，初始化双指针 left=${left} (nums[${left}]=${nums[left]})，right=${right} (nums[${right}]=${nums[right]})。`,
      log: `固定 i=${i}, left=${left}, right=${right}`,
      codeLine: lines.iCheck,
    });

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];

      if (sum === 0) {
        results.push([nums[i], nums[left], nums[right]]);
        steps.push({
          array: [...nums],
          i,
          left,
          right,
          sum: 0,
          results: [...results],
          status: 'found',
          message: `🎉 找到解！nums[${i}] (${nums[i]}) + nums[${left}] (${nums[left]}) + nums[${right}] (${nums[right]}) = 0。记录三元组 [${nums[i]}, ${nums[left]}, ${nums[right]}]。`,
          log: `✓ 命中三元组: [${nums[i]}, ${nums[left]}, ${nums[right]}]`,
          codeLine: lines.found,
        });

        // 去重 left 和 right
        while (left < right && nums[left] === nums[left + 1]) {
          left++;
        }
        while (left < right && nums[right] === nums[right - 1]) {
          right--;
        }

        left++;
        right--;

        if (left < right) {
          steps.push({
            array: [...nums],
            i,
            left,
            right,
            sum: nums[i] + nums[left] + nums[right],
            results: [...results],
            status: 'compare',
            message: `去重后双指针同时内缩：left 移至 ${left}，right 移至 ${right}，继续寻找。`,
            log: `双指针内缩: left=${left}, right=${right}`,
            codeLine: lines.shrink,
          });
        }
      } else if (sum < 0) {
        steps.push({
          array: [...nums],
          i,
          left,
          right,
          sum,
          results: [...results],
          status: 'left-advance',
          message: `三数之和 sum = ${nums[i]} + ${nums[left]} + ${nums[right]} = ${sum} < 0，和偏小，将 left 右移以增大和。`,
          log: `sum=${sum} < 0, left++ (${left} -> ${left + 1})`,
          codeLine: lines.leftAdvance,
        });
        left++;
      } else {
        steps.push({
          array: [...nums],
          i,
          left,
          right,
          sum,
          results: [...results],
          status: 'right-advance',
          message: `三数之和 sum = ${nums[i]} + ${nums[left]} + ${nums[right]} = ${sum} > 0，和偏大，将 right 左移以减小和。`,
          log: `sum=${sum} > 0, right-- (${right} -> ${right - 1})`,
          codeLine: lines.rightAdvance,
        });
        right--;
      }
    }
  }

  steps.push({
    array: [...nums],
    i: -1,
    left: -1,
    right: -1,
    sum: null,
    results: [...results],
    status: 'done',
    message: `🎉 搜索完成！共找到 ${results.length} 个不重复的三元组解：${JSON.stringify(results)}。`,
    log: `三数之和求解完毕，共 ${results.length} 组解`,
    codeLine: lines.done,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withThreeSumMetrics(steps: ThreeSumStep[]): ThreeSumStep[] {
  return steps.map((s) => {
    return {
      ...s,
      metrics: {
        i: s.i >= 0 ? `[${s.i}]=${s.array[s.i]}` : '—',
        left: s.left >= 0 ? `[${s.left}]=${s.array[s.left]}` : '—',
        right: s.right >= 0 ? `[${s.right}]=${s.array[s.right]}` : '—',
        sum: s.sum !== null ? String(s.sum) : '—',
      },
    };
  });
}
