/**
 * 四数之和 — 步进推演编译器
 * LeetCode 18：双层 for 循环 + 双指针 + 两级去重剪枝
 */

import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface FourSumStep {
  array: number[];
  i: number;
  j: number;
  left: number;
  right: number;
  sum: number | null;
  target: number;
  results: [number, number, number, number][];
  status:
    | 'init'
    | 'sort'
    | 'i-check'
    | 'i-skip'
    | 'j-check'
    | 'j-skip'
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

export function parseFourSumArray(input: string): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return arr.length >= 4 ? arr : [1, 0, -1, 0, -2, 2];
}

export function buildFourSumSteps(rawNums: number[], target: number): FourSumStep[] {
  const steps: FourSumStep[] = [];
  const nums = [...rawNums];
  const results: [number, number, number, number][] = [];

  const lines = {
    init: { java: 2, cpp: 4, python: 4, javascript: 2 },
    sort: { java: 3, cpp: 5, python: 3, javascript: 3 },
    iSkip: { java: 6, cpp: 8, python: [7, 8], javascript: 6 },
    jSkip: { java: 8, cpp: 10, python: [10, 11], javascript: 8 },
    jCheck: { java: 9, cpp: 11, python: 12, javascript: 9 },
    found: { java: [12, 13], cpp: [14, 15], python: [15, 16], javascript: [12, 13] },
    shrink: { java: 16, cpp: 18, python: [21, 22], javascript: 16 },
    leftAdvance: { java: 18, cpp: 20, python: 24, javascript: 18 },
    rightAdvance: { java: 20, cpp: 22, python: 26, javascript: 20 },
    done: { java: 25, cpp: 27, python: 27, javascript: 25 },
  };

  steps.push({
    array: [...nums],
    i: -1,
    j: -1,
    left: -1,
    right: -1,
    sum: null,
    target,
    results: [],
    status: 'init',
    message: `初始数组: [${nums.join(', ')}]，目标 target = ${target}。`,
    log: `初始化原始数组，target = ${target}`,
    codeLine: lines.init,
  });

  nums.sort((a, b) => a - b);
  steps.push({
    array: [...nums],
    i: -1,
    j: -1,
    left: -1,
    right: -1,
    sum: null,
    target,
    results: [],
    status: 'sort',
    message: `对数组进行升序排序: [${nums.join(', ')}]。接下来使用外层循环 i、内层循环 j，配合双指针 left、right 扫描。`,
    log: `完成升序排序: [${nums.join(', ')}]`,
    codeLine: lines.sort,
  });

  const n = nums.length;
  for (let i = 0; i < n - 3; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) {
      steps.push({
        array: [...nums],
        i,
        j: -1,
        left: -1,
        right: -1,
        sum: null,
        target,
        results: [...results],
        status: 'i-skip',
        message: `nums[${i}] = ${nums[i]} 与 nums[${i - 1}] 重复，跳过当前 i 以避免重复（第一级去重）。`,
        log: `跳过重复 i: nums[${i}]=${nums[i]}`,
        codeLine: lines.iSkip,
      });
      continue;
    }

    for (let j = i + 1; j < n - 2; j++) {
      if (j > i + 1 && nums[j] === nums[j - 1]) {
        steps.push({
          array: [...nums],
          i,
          j,
          left: -1,
          right: -1,
          sum: null,
          target,
          results: [...results],
          status: 'j-skip',
          message: `nums[${j}] = ${nums[j]} 与 nums[${j - 1}] 重复，跳过当前 j（第二级去重）。`,
          log: `跳过重复 j: nums[${j}]=${nums[j]}`,
          codeLine: lines.jSkip,
        });
        continue;
      }

      let left = j + 1;
      let right = n - 1;

      steps.push({
        array: [...nums],
        i,
        j,
        left,
        right,
        sum: nums[i] + nums[j] + nums[left] + nums[right],
        target,
        results: [...results],
        status: 'j-check',
        message: `固定 i=${i}(${nums[i]}), j=${j}(${nums[j]})，初始化双指针 left=${left}(${nums[left]}), right=${right}(${nums[right]})。`,
        log: `固定 i=${i}, j=${j}, left=${left}, right=${right}`,
        codeLine: lines.jCheck,
      });

      while (left < right) {
        const sum = nums[i] + nums[j] + nums[left] + nums[right];

        if (sum === target) {
          results.push([nums[i], nums[j], nums[left], nums[right]]);
          steps.push({
            array: [...nums],
            i,
            j,
            left,
            right,
            sum,
            target,
            results: [...results],
            status: 'found',
            message: `🎉 找到解！nums[${i}] (${nums[i]}) + nums[${j}] (${nums[j]}) + nums[${left}] (${nums[left]}) + nums[${right}] (${nums[right]}) = ${target}。记录四元组 [${nums[i]}, ${nums[j]}, ${nums[left]}, ${nums[right]}]。`,
            log: `✓ 命中四元组: [${nums[i]}, ${nums[j]}, ${nums[left]}, ${nums[right]}]`,
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
              j,
              left,
              right,
              sum: nums[i] + nums[j] + nums[left] + nums[right],
              target,
              results: [...results],
              status: 'compare',
              message: `去重后双指针内缩：left 移至 ${left}，right 移至 ${right}。`,
              log: `双指针内缩: left=${left}, right=${right}`,
              codeLine: lines.shrink,
            });
          }
        } else if (sum < target) {
          steps.push({
            array: [...nums],
            i,
            j,
            left,
            right,
            sum,
            target,
            results: [...results],
            status: 'left-advance',
            message: `四数之和 sum = ${sum} < target (${target})，和偏小，left++ 右移以增大总和。`,
            log: `sum=${sum} < ${target}, left++ (${left} -> ${left + 1})`,
            codeLine: lines.leftAdvance,
          });
          left++;
        } else {
          steps.push({
            array: [...nums],
            i,
            j,
            left,
            right,
            sum,
            target,
            results: [...results],
            status: 'right-advance',
            message: `四数之和 sum = ${sum} > target (${target})，和偏大，right-- 左移以减小总和。`,
            log: `sum=${sum} > ${target}, right-- (${right} -> ${right - 1})`,
            codeLine: lines.rightAdvance,
          });
          right--;
        }
      }
    }
  }

  steps.push({
    array: [...nums],
    i: -1,
    j: -1,
    left: -1,
    right: -1,
    sum: null,
    target,
    results: [...results],
    status: 'done',
    message: `🎉 搜索完成！共找到 ${results.length} 个不重复的四元组解：${JSON.stringify(results)}。`,
    log: `四数之和求解完毕，共 ${results.length} 组解`,
    codeLine: lines.done,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withFourSumMetrics(steps: FourSumStep[]): FourSumStep[] {
  return steps.map((s) => {
    return {
      ...s,
      metrics: {
        ij: s.i >= 0 && s.j >= 0 ? `i=${s.array[s.i]}, j=${s.array[s.j]}` : '—',
        lr: s.left >= 0 && s.right >= 0 ? `L=${s.array[s.left]}, R=${s.array[s.right]}` : '—',
        sum: s.sum !== null ? String(s.sum) : '—',
        target: String(s.target),
      },
    };
  });
}
