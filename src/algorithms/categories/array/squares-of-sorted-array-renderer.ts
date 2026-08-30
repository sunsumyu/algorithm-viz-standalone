/**
 * 有序数组的平方可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * LeetCode 977：首尾对撞双指针
 * 遵循 Zero-Subbox 规范，扁平双轨沙盘
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import { ArrayTrackAdapter } from '../../../core/renderers/adapters/array-track-adapter';
import {
  SQUARES_OF_SORTED_ARRAY_PROBLEM_HTML,
  SQUARES_OF_SORTED_ARRAY_ANALYSIS_HTML,
  SQUARES_OF_SORTED_ARRAY_CODE_LANGUAGES,
} from './squares-of-sorted-array-problem-content';

export interface SSQStep {
  arr: number[];
  result: (number | null)[];
  left: number;
  right: number;
  writeIdx: number;
  status: 'init' | 'compare' | 'write-left' | 'write-right' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
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

  steps.push({
    arr: [...arr],
    result: [...result],
    left,
    right,
    writeIdx: n - 1,
    status: 'init',
    message: `初始化 left=0, right=${n - 1}，结果数组从末尾 writeIdx=${n - 1} 开始向前填充。`,
    log: `初始化双指针：left=0, right=${n - 1}, writeIdx=${n - 1}`,
    codeLine: 4,
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
      codeLine: [6, 7],
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
        codeLine: [8, 9],
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
        codeLine: [11, 12],
      });
      right--;
    }
  }

  steps.push({
    arr: [...arr],
    result: [...result],
    left,
    right,
    writeIdx: -1,
    status: 'done',
    message: `🎉 计算完成！最终有序平方数组为 [${result.join(', ')}]。`,
    log: `✓ 完成：[${result.join(', ')}]`,
    codeLine: 14,
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<SSQStep>({
  id: 'sorted-squares',
  name: '有序数组的平方',
  category: 'array',
  icon: '📐',
  badge: {
    mode: '首尾对撞双指针',
    complexity: 'O(n) · O(n)',
  },
  card1Title: '📊 原始数组与结果数组双轨沙盘',
  card2Title: '🧭 对撞指针与平方比较监视器',
  card2Desc: '左右指针位置、当前平方值对比与写入索引',
  legend: [
    { label: '左指针 left', color: '#2563eb' },
    { label: '右指针 right', color: '#0d9488' },
    { label: '写入位置 writeIdx', color: '#f59e0b' },
  ],
  inputs: [
    {
      id: 'input-array',
      label: '有序数组',
      type: 'text',
      defaultValue: '-4, -1, 0, 3, 10',
      width: '150px',
      placeholder: '-4, -1, 0, 3, 10',
    },
  ],
  presets: [
    { label: '示例 1 (含负数)', values: { 'input-array': '-4, -1, 0, 3, 10' } },
    { label: '示例 2 (全负数)', values: { 'input-array': '-7, -3, 2, 3, 11' } },
    { label: '全正数', values: { 'input-array': '1, 2, 3, 4, 5' } },
  ],
  metrics: [
    { id: 'left-sq', label: '左侧 nums[left]²', color: '#2563eb' },
    { id: 'right-sq', label: '右侧 nums[right]²', color: '#0d9488' },
    { id: 'write-idx', label: '当前写入索引', color: '#f59e0b' },
  ],
  codeLanguages: SQUARES_OF_SORTED_ARRAY_CODE_LANGUAGES,
  problemHtml: SQUARES_OF_SORTED_ARRAY_PROBLEM_HTML,
  analysisHtml: SQUARES_OF_SORTED_ARRAY_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const raw = inputs['input-array'] || '-4, -1, 0, 3, 10';
    const arr = parseSortedArray(raw);
    return buildSortedSquaresSteps(arr);
  },
  renderCanvas: (container, step) => {
    const isDone = step.status === 'done';
    const safeDisplayResult = step.result.map((v) => (v === null ? '—' : v));

    const primaryHighlights = new Map<number, { bg?: string; border?: string; color?: string }>();
    if (!isDone) {
      primaryHighlights.set(step.left, { bg: '#eff6ff', border: '#93c5fd', color: '#1d4ed8' });
      primaryHighlights.set(step.right, { bg: '#f0fdf4', border: '#86efac', color: '#166534' });
    }

    const secondaryHighlights = new Map<number, { bg?: string; border?: string; color?: string }>();
    if (step.writeIdx >= 0 && !isDone) {
      secondaryHighlights.set(step.writeIdx, { bg: '#fffbeb', border: '#fde68a', color: '#b45309' });
    }

    ArrayTrackAdapter.renderTrack(container, {
      array: step.arr,
      pointers: isDone
        ? []
        : [
            { name: 'left', index: step.left, color: '#2563eb', position: 'top' },
            { name: 'right', index: step.right, color: '#0d9488', position: 'bottom' },
          ],
      itemHighlights: primaryHighlights,
      primaryTitle: '📊 原始数组 (原序列):',
      secondaryArray: safeDisplayResult,
      secondaryTitle: '📦 平方结果数组 (倒序填充):',
    });

    const root = container.closest('#algo-sorted-squares-view') || container.closest('#algo-squares-of-sorted-array-view');
    if (root) {
      const lSqEl = root.querySelector('#metric-left-sq');
      const rSqEl = root.querySelector('#metric-right-sq');
      const wIdxEl = root.querySelector('#metric-write-idx');

      const lsq = step.left < step.arr.length ? step.arr[step.left] ** 2 : '—';
      const rsq = step.right >= 0 ? step.arr[step.right] ** 2 : '—';

      if (lSqEl) lSqEl.textContent = `${lsq}`;
      if (rSqEl) rSqEl.textContent = `${rsq}`;
      if (wIdxEl) wIdxEl.textContent = step.writeIdx >= 0 ? `result[${step.writeIdx}]` : '完成';

      // 在 Card 2 中展示当前比较关系
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #475569; padding: 4px 0;">
            <div style="display: flex; justify-content: space-between;">
              <span>对撞指针状态:</span>
              <strong style="color: #2563eb;">left = ${step.left}, right = ${step.right}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>比较结论:</span>
              <strong style="color: #16a34a;">${typeof lsq === 'number' && typeof rsq === 'number' ? (lsq > rsq ? `左侧 ${lsq} > 右侧 ${rsq} (取左)` : `右侧 ${rsq} ≥ 左侧 ${lsq} (取右)`) : '完成'}</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'sorted-squares',
  name: '有序数组的平方',
  viewId: 'algo-sorted-squares-view',
  category: 'array',
  description: '首尾双指针向中间对撞：两端平方最大，每次选取较大者倒序写入新数组末尾',
  icon: '📐',
  template,
  Visualizer,
  difficulty: 1,
  levelOrder: 3,
  learningGoal: '掌握首尾对撞双指针在非递减含负数数组平方排序中的线性 O(n) 解法',
});

registerAlgorithm({
  id: 'squares-of-sorted-array',
  name: '有序数组的平方',
  viewId: 'algo-squares-of-sorted-array-view',
  category: 'array',
  description: '首尾双指针向中间对撞：两端平方最大，每次选取较大者倒序写入新数组末尾',
  icon: '📐',
  template,
  Visualizer,
  difficulty: 1,
  levelOrder: 3,
  learningGoal: '掌握首尾对撞双指针在非递减含负数数组平方排序中的线性 O(n) 解法',
});
