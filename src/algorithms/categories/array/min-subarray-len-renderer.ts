/**
 * 长度最小的子数组可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * LeetCode 209：滑动窗口双指针
 * 遵循 Zero-Subbox 规范，扁平纯净沙盘
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import { ArrayTrackAdapter } from '../../../core/renderers/adapters/array-track-adapter';
import {
  MIN_SUBARRAY_LEN_PROBLEM_HTML,
  MIN_SUBARRAY_LEN_ANALYSIS_HTML,
  MIN_SUBARRAY_LEN_CODE_LANGUAGES,
} from './min-subarray-len-problem-content';

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
  codeLine: number | number[];
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
    codeLine: 2,
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
      codeLine: [4, 5],
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
        codeLine: [6, 7],
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
        codeLine: [8, 9],
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
    message: minLen === Infinity
      ? `🎉 遍历完成！未找到满足 sum >= ${target} 的连续子数组，返回 0。`
      : `🎉 遍历完成！最小子数组长度为 minLen = ${minLen}。`,
    log: minLen === Infinity ? '✓ 完成：未找到 (返回 0)' : `✓ 完成：minLen = ${minLen}`,
    codeLine: 11,
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<SWStep>({
  id: 'min-subarray-len',
  name: '长度最小的子数组',
  category: 'array',
  icon: '🪟',
  badge: {
    mode: '滑动窗口双指针',
    complexity: 'O(n) · O(1)',
  },
  card1Title: '📊 数组条带与动态滑动窗口沙盘',
  card2Title: '🧭 窗口和与最小长度监视器',
  card2Desc: '当前窗口范围 [left..right]、累加和 sum 与历史最小长度',
  legend: [
    { label: '滑动窗口覆盖', color: '#3b82f6' },
    { label: '左边界 left', color: '#0d9488' },
    { label: '右边界 right', color: '#2563eb' },
  ],
  inputs: [
    {
      id: 'input-target',
      label: '目标和 target',
      type: 'number',
      defaultValue: 7,
      width: '45px',
    },
    {
      id: 'input-array',
      label: '正整数数组',
      type: 'text',
      defaultValue: '2, 3, 1, 2, 4, 3',
      width: '140px',
      placeholder: '2, 3, 1, 2, 4, 3',
    },
  ],
  presets: [
    { label: '示例 1 (target=7)', values: { 'input-target': 7, 'input-array': '2, 3, 1, 2, 4, 3' } },
    { label: '单元素达标 (target=4)', values: { 'input-target': 4, 'input-array': '1, 4, 4' } },
    { label: '无达标子数组 (target=11)', values: { 'input-target': 11, 'input-array': '1, 1, 1, 1, 1, 1, 1, 1' } },
  ],
  metrics: [
    { id: 'cur-sum', label: '当前窗口和 sum', color: '#2563eb' },
    { id: 'window-len', label: '当前窗口长度', color: '#0d9488' },
    { id: 'min-len', label: '历史最小长度 minLen', color: '#16a34a' },
  ],
  codeLanguages: MIN_SUBARRAY_LEN_CODE_LANGUAGES,
  problemHtml: MIN_SUBARRAY_LEN_PROBLEM_HTML,
  analysisHtml: MIN_SUBARRAY_LEN_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const raw = inputs['input-array'] || '2, 3, 1, 2, 4, 3';
    const arr = parsePositiveArray(raw);
    const target = parseInt(inputs['input-target'] || '7', 10);
    return buildMinSubarrayLenSteps(arr, target);
  },
  renderCanvas: (container, step) => {
    const isDone = step.status === 'done';
    const isOverTarget = step.sum >= step.target;

    ArrayTrackAdapter.renderTrack(container, {
      array: step.array,
      pointers: isDone
        ? []
        : [
            { name: 'R', index: step.right, color: '#2563eb', position: 'top' },
            { name: 'L', index: step.left, color: '#0d9488', position: 'bottom' },
          ],
      windowRange: isDone ? undefined : { left: step.left, right: step.right, color: isOverTarget ? '#10b981' : '#3b82f6' },
      primaryTitle: '📊 数组与动态窗口覆盖 (nums):',
    });

    const root = container.closest('#algo-min-subarray-len-view');
    if (root) {
      const sumEl = root.querySelector('#metric-cur-sum');
      const lenEl = root.querySelector('#metric-window-len');
      const minEl = root.querySelector('#metric-min-len');

      const curLen = step.right >= step.left ? step.right - step.left + 1 : 0;

      if (sumEl) sumEl.textContent = `${step.sum} / ${step.target}`;
      if (lenEl) lenEl.textContent = `${curLen}`;
      if (minEl) minEl.textContent = step.minLen === Infinity ? '∞' : `${step.minLen}`;

      // 在 Card 2 中展示当前窗口详情
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #475569; padding: 4px 0;">
            <div style="display: flex; justify-content: space-between;">
              <span>活动窗口范围:</span>
              <strong style="color: #2563eb;">[${step.left} .. ${step.right}]</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>窗口状态:</span>
              <strong style="color: ${isOverTarget ? '#16a34a' : '#64748b'};">${isOverTarget ? '✓ 满足 sum ≥ target (收缩左边界)' : '向右扩展右边界'}</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'min-subarray-len',
  name: '长度最小的子数组',
  viewId: 'algo-min-subarray-len-view',
  category: 'array',
  description: '滑动窗口双指针：right 扩展累加，sum ≥ target 时更新最小长度并收缩 left',
  icon: '🪟',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 4,
  learningGoal: '掌握滑动窗口在连续子数组条件最值问题中的右扩左缩单调收敛机制',
});
