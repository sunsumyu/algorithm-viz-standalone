/**
 * 四数之和可视化器 — 声明式 4-Card 标准架构
 * LeetCode 18：双层 for 循环 + 双指针 + 两级去重剪枝
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';
import {
  FOUR_SUM_PROBLEM_HTML,
  FOUR_SUM_ANALYSIS_HTML,
  FOUR_SUM_CODE_LANGUAGES,
} from './four-sum-problem-content';

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
function withMetrics(steps: FourSumStep[]): FourSumStep[] {
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

export function renderFourSumCanvas(container: HTMLElement, step: FourSumStep): void {
  const { array, i, j, left, right, results } = step;

  // 1. 排序数组与四指针
  const trackHtml = array
    .map((num, idx) => {
      const isI = i === idx;
      const isJ = j === idx;
      const isLeft = left === idx;
      const isRight = right === idx;

      let border = '#cbd5e1';
      let bg = '#ffffff';
      let shadow = 'none';
      let transform = 'none';
      if (isI) {
        border = '#3b82f6';
        bg = '#eff6ff';
        shadow = '0 0 0 2px rgba(59, 130, 246, 0.25)';
        transform = 'translateY(-3px)';
      } else if (isJ) {
        border = '#8b5cf6';
        bg = '#f5f3ff';
        shadow = '0 0 0 2px rgba(139, 92, 246, 0.25)';
        transform = 'translateY(-3px)';
      } else if (isLeft) {
        border = '#10b981';
        bg = '#f0fdf4';
        shadow = '0 0 0 2px rgba(16, 185, 129, 0.25)';
        transform = 'translateY(-3px)';
      } else if (isRight) {
        border = '#f59e0b';
        bg = '#fffbeb';
        shadow = '0 0 0 2px rgba(245, 158, 11, 0.25)';
        transform = 'translateY(-3px)';
      }

      const badgeBase =
        'padding: 1px 4px; border-radius: 4px; font-size: 8.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; white-space: nowrap;';
      const badges: string[] = [];
      if (isI) badges.push(`<span style="${badgeBase} background: #3b82f6; color: #ffffff;">i</span>`);
      if (isJ) badges.push(`<span style="${badgeBase} background: #8b5cf6; color: #ffffff;">j</span>`);
      if (isLeft) badges.push(`<span style="${badgeBase} background: #10b981; color: #ffffff;">L</span>`);
      if (isRight) badges.push(`<span style="${badgeBase} background: #f59e0b; color: #ffffff;">R</span>`);

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; position: relative;">
          <div style="position: absolute; top: -18px; display: flex; align-items: center; gap: 2px;">${badges.join('')}</div>
          <div style="width: 38px; height: 42px; border-radius: 8px; background: ${bg}; border: 2px solid ${border}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); position: relative; box-shadow: ${shadow}; transform: ${transform};">
            <span style="font-size: 14px; font-weight: 800; color: #0f172a;">${num}</span>
            <span style="font-size: 8.5px; font-weight: 700; color: #94a3b8;">[${idx}]</span>
          </div>
        </div>
      `;
    })
    .join('');

  // 2. 已捕获解
  const resultsHtml =
    results.length === 0
      ? '<span style="color: #94a3b8; font-size: 11px;">(暂无四元组解)</span>'
      : results
          .map(
            ([a, b, c, d]) => `
          <div style="padding: 2px 7px; border-radius: 6px; background: #f0fdf4; border: 1px solid #86efac; color: #15803d; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
            <span>[${a}, ${b}, ${c}, ${d}]</span>
          </div>
        `
          )
          .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; justify-content: center; gap: 18px; height: 100%; width: 100%; padding: 24px 12px 12px; box-sizing: border-box;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; width: 100%;">
        <span style="font-size: 10.5px; font-weight: 700; color: #64748b;">排序后数组</span>
        <div style="display: flex; align-items: flex-end; justify-content: center; gap: 6px; width: 100%; overflow-x: auto; padding: 4px;">
          ${trackHtml}
        </div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; width: 100%;">
        <span style="font-size: 10.5px; font-weight: 700; color: #64748b;">已找到的不重复四元组解</span>
        <div style="display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap; padding: 4px; min-height: 32px; width: 100%;">
          ${resultsHtml}
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'four-sum',
  name: '四数之和（排序+双指针）',
  category: 'hash-table',
  description: '排序后固定 i/j 再双指针求和为 target 的四元组',
  icon: '🎯',
  difficulty: 3,
  levelOrder: 3,
  learningGoal: '掌握嵌套双指针 + 多层去重的四数求和技巧',
  inputs: [
    {
      id: 'nums',
      label: '数组',
      type: 'text',
      defaultValue: '1, 0, -1, 0, -2, 2',
      placeholder: '逗号分隔',
      width: '135px',
    },
    {
      id: 'target',
      label: 'target',
      type: 'number',
      defaultValue: 0,
      width: '40px',
    },
  ],
  presets: [
    { label: '示例 1: (target=0)', values: { nums: '1, 0, -1, 0, -2, 2', target: 0 } },
    { label: '全相同: (target=8)', values: { nums: '2, 2, 2, 2, 2', target: 8 } },
    { label: '对称分布: (target=0)', values: { nums: '-3, -2, -1, 0, 0, 1, 2, 3', target: 0 } },
  ],
  metrics: [
    { id: 'ij', label: '固定 i / j', color: '#3b82f6' },
    { id: 'lr', label: '双指针 left / right', color: '#10b981' },
    { id: 'sum', label: '四数之和 sum', color: '#a855f7' },
    { id: 'target', label: '目标 target', color: '#0f172a' },
  ],
  legend: [
    { label: 'i', color: '#3b82f6' },
    { label: 'j', color: '#8b5cf6' },
    { label: 'left', color: '#10b981' },
    { label: 'right', color: '#f59e0b' },
  ],
  codeLanguages: FOUR_SUM_CODE_LANGUAGES,
  problemHtml: FOUR_SUM_PROBLEM_HTML,
  analysisHtml: FOUR_SUM_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const nums = parseFourSumArray(String(inputs.nums ?? '1, 0, -1, 0, -2, 2'));
    const target = parseInt(String(inputs.target ?? '0'), 10);
    return withMetrics(buildFourSumSteps(nums, isNaN(target) ? 0 : target));
  },
  renderCanvas: (container, step) => renderFourSumCanvas(container, step as FourSumStep),
});
