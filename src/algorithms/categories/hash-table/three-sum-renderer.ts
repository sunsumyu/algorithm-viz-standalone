/**
 * 三数之和可视化器 — 声明式 4-Card 标准架构
 * LeetCode 15：排序 + 双指针 + 去重剪枝
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';
import {
  THREE_SUM_PROBLEM_HTML,
  THREE_SUM_ANALYSIS_HTML,
  THREE_SUM_CODE_LANGUAGES,
} from './three-sum-problem-content';

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
function withMetrics(steps: ThreeSumStep[]): ThreeSumStep[] {
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

export function renderThreeSumCanvas(container: HTMLElement, step: ThreeSumStep): void {
  const { array, i, left, right, results } = step;

  // 1. 排序数组与三指针
  const trackHtml = array
    .map((num, idx) => {
      const isI = i === idx;
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

      const badges: string[] = [];
      if (isI) badges.push('<span style="padding: 1px 4px; border-radius: 4px; font-size: 8.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; white-space: nowrap; background: #3b82f6; color: #ffffff;">i</span>');
      if (isLeft) badges.push('<span style="padding: 1px 4px; border-radius: 4px; font-size: 8.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; white-space: nowrap; background: #10b981; color: #ffffff;">L</span>');
      if (isRight) badges.push('<span style="padding: 1px 4px; border-radius: 4px; font-size: 8.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; white-space: nowrap; background: #f59e0b; color: #ffffff;">R</span>');

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
      ? '<span style="color: #94a3b8; font-size: 11px;">(暂无三元组解)</span>'
      : results
          .map(
            ([a, b, c]) => `
          <div style="padding: 2px 7px; border-radius: 6px; background: #f0fdf4; border: 1px solid #86efac; color: #15803d; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
            <span>[${a}, ${b}, ${c}]</span>
          </div>
        `
          )
          .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; justify-content: center; gap: 18px; height: 100%; width: 100%; padding: 24px 12px 12px; box-sizing: border-box;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; width: 100%;">
        <span style="font-size: 11px; font-weight: 700; color: #64748b;">排序后数组</span>
        <div style="display: flex; align-items: flex-end; justify-content: center; gap: 6px; width: 100%; overflow-x: auto; padding: 4px;">
          ${trackHtml}
        </div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; width: 100%;">
        <span style="font-size: 11px; font-weight: 700; color: #64748b;">已找到的不重复三元组解</span>
        <div style="display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap; padding: 4px; min-height: 32px; width: 100%;">
          ${resultsHtml}
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'three-sum',
  name: '三数之和（排序+双指针）',
  category: 'hash-table',
  description: '排序后双指针求和为0的三元组',
  icon: '🎯',
  difficulty: 3,
  levelOrder: 2,
  learningGoal: '掌握排序 + 双指针 + 去重的三数求和技巧',
  inputs: [
    {
      id: 'nums',
      label: '数组',
      type: 'text',
      defaultValue: '-1, 0, 1, 2, -1, -4',
      placeholder: '逗号分隔',
      width: '140px',
    },
  ],
  presets: [
    { label: '示例 1: [-1,0,1,2,-1,-4]', values: { nums: '-1, 0, 1, 2, -1, -4' } },
    { label: '无合法解: [0,1,1]', values: { nums: '0, 1, 1' } },
    { label: '全零: [0,0,0]', values: { nums: '0, 0, 0' } },
    { label: '多重解: [-2,0,1,1,2]', values: { nums: '-2, 0, 1, 1, 2' } },
  ],
  metrics: [
    { id: 'i', label: '固定基准 i', color: '#3b82f6' },
    { id: 'left', label: '左指针 left', color: '#10b981' },
    { id: 'right', label: '右指针 right', color: '#f59e0b' },
    { id: 'sum', label: '三数之和 sum', color: '#a855f7' },
  ],
  legend: [
    { label: '基准 i', color: '#3b82f6' },
    { label: '左指针 left', color: '#10b981' },
    { label: '右指针 right', color: '#f59e0b' },
  ],
  codeLanguages: THREE_SUM_CODE_LANGUAGES,
  problemHtml: THREE_SUM_PROBLEM_HTML,
  analysisHtml: THREE_SUM_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(buildThreeSumSteps(parseThreeSumArray(String(inputs.nums ?? '-1, 0, 1, 2, -1, -4')))),
  renderCanvas: (container, step) => renderThreeSumCanvas(container, step as ThreeSumStep),
});
