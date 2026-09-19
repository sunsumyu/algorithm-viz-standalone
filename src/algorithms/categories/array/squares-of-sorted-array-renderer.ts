/**
 * 有序数组的平方可视化器 — 顶层声明式黄金规约架构 (Declarative Visualizer)
 * LeetCode 977：首尾对撞双指针
 * 遵循 Zero-Subbox 规范，扁平双轨沙盘与纯数据驱动 4-Card 结构
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import { ArrayTrackAdapter } from '../../../core/renderers/adapters/array-track-adapter';
import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';
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
  codeLine: HighlightTarget;
  metrics: Record<string, string | number>;
  ans?: string;
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

  const lines = {
    init: { java: [3, 4], cpp: [5, 6], python: [4, 5], javascript: [3, 4] },
    compare: { java: [6, 7, 8], cpp: [8, 9, 10], python: [7, 8, 9], javascript: [6, 7, 8] },
    writeLeft: { java: [9, 10], cpp: [11, 12], python: [10, 11], javascript: [9, 10] },
    writeRight: { java: [12, 13], cpp: [14, 15], python: [13, 14], javascript: [12, 13] },
    done: { java: 16, cpp: 18, python: 15, javascript: 16 },
  };

  const getInitLsq = () => (left < n ? arr[left] ** 2 : '—');
  const getInitRsq = () => (right >= 0 ? arr[right] ** 2 : '—');

  steps.push({
    arr: [...arr],
    result: [...result],
    left,
    right,
    writeIdx: n - 1,
    status: 'init',
    message: `初始化 left=0, right=${n - 1}，结果数组从末尾 writeIdx=${n - 1} 开始向前填充。`,
    log: `初始化双指针：left=0, right=${n - 1}, writeIdx=${n - 1}`,
    codeLine: lines.init,
    metrics: {
      'left-sq': getInitLsq(),
      'right-sq': getInitRsq(),
      pointers: `[${left}, ${right}]`,
      'write-idx': `result[${n - 1}]`,
    },
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
      codeLine: lines.compare,
      metrics: {
        'left-sq': lsq,
        'right-sq': rsq,
        pointers: `[${left}, ${right}]`,
        'write-idx': `result[${i}]`,
      },
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
        codeLine: lines.writeLeft,
        metrics: {
          'left-sq': lsq,
          'right-sq': rsq,
          pointers: `[${left}→${left + 1}, ${right}]`,
          'write-idx': `result[${i}]=${lsq}`,
        },
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
        codeLine: lines.writeRight,
        metrics: {
          'left-sq': lsq,
          'right-sq': rsq,
          pointers: `[${left}, ${right}→${right - 1}]`,
          'write-idx': `result[${i}]=${rsq}`,
        },
      });
      right--;
    }
  }

  const finalFormatted = `[${result.join(', ')}]`;
  steps.push({
    arr: [...arr],
    result: [...result],
    left,
    right,
    writeIdx: -1,
    status: 'done',
    message: `🎉 计算完成！最终有序平方数组为 ${finalFormatted}。`,
    log: `✓ 完成：${finalFormatted}`,
    codeLine: lines.done,
    ans: finalFormatted,
    metrics: {
      'left-sq': '—',
      'right-sq': '—',
      pointers: '对撞相遇完成',
      'write-idx': '全部填充完毕',
      'metric-ans': finalFormatted,
    },
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
    { id: 'pointers', label: '双指针位置 [L, R]', color: '#8b5cf6' },
    { id: 'write-idx', label: '当前写入目标', color: '#f59e0b' },
  ],
  auxiliaryVisual: {
    title: '🧭 对撞指针与平方比较监视器',
    desc: '左右指针位置、当前平方值对比与写入索引',
    render: (container, step) => {
      const isDone = step.status === 'done';
      const lsq = step.left < step.arr.length ? step.arr[step.left] ** 2 : '—';
      const rsq = step.right >= 0 ? step.arr[step.right] ** 2 : '—';
      const decisionText = isDone
        ? '✓ 全部元素平方已倒序写入完成'
        : typeof lsq === 'number' && typeof rsq === 'number'
          ? lsq > rsq
            ? `左侧 ${lsq} > 右侧 ${rsq} (选取左侧平方，左指针右移)`
            : `右侧 ${rsq} ≥ 左侧 ${lsq} (选取右侧平方，右指针左移)`
          : '—';

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11.5px; color: #334155; padding: 4px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600; color: #64748b;">双指针状态:</span>
            <strong style="color: #2563eb; font-family: monospace;">left=${step.left}, right=${step.right}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600; color: #64748b;">比较决策:</span>
            <strong style="color: #16a34a; font-weight: 700;">${decisionText}</strong>
          </div>
        </div>
      `;
    },
  },
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
  aliases: ['squares-of-sorted-array'],
});

