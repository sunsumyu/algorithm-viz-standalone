/**
 * 二分查找可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * 左闭右闭区间折半、中点动态定位、边界收缩与目标命中
 * 遵循 Zero-Subbox 规范，扁平纯净沙盘
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import { ArrayTrackAdapter } from '../../../core/renderers/adapters/array-track-adapter';
import {
  BINARY_SEARCH_PROBLEM_HTML,
  BINARY_SEARCH_ANALYSIS_HTML,
  BINARY_SEARCH_CODE_LANGUAGES,
} from './binary-search-problem-content';

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
  codeLine: number | number[];
}

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
    codeLine: 3,
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
      codeLine: 2,
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
      codeLine: [4, 5, 6],
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
        codeLine: 7,
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
        codeLine: [8, 9],
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
        codeLine: [10, 11],
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
    codeLine: 13,
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<BSStep>({
  id: 'binary-search',
  name: '二分查找',
  category: 'search',
  icon: '🎯',
  badge: {
    mode: '左闭右闭区间折半',
    complexity: 'O(log n) · O(1)',
  },
  card1Title: '📊 有序数组条带与折半区间沙盘',
  card2Title: '🧭 中点比对与收缩决策监视器',
  card2Desc: '当前区间 [left..right]、中点 mid 与比对比较结论',
  legend: [
    { label: '命中目标', color: '#16a34a' },
    { label: '中点 mid', color: '#fbbf24' },
    { label: '有效搜索区间', color: '#3b82f6' },
  ],
  inputs: [
    {
      id: 'input-array',
      label: '有序数组',
      type: 'text',
      defaultValue: '-1, 0, 3, 5, 9, 12',
      width: '150px',
      placeholder: '-1, 0, 3, 5, 9, 12',
    },
    {
      id: 'input-target',
      label: '目标值 target',
      type: 'number',
      defaultValue: 9,
      width: '45px',
    },
  ],
  presets: [
    { label: '命中示例 (target=9)', values: { 'input-array': '-1, 0, 3, 5, 9, 12', 'input-target': 9 } },
    { label: '不存在值 (target=2)', values: { 'input-array': '-1, 0, 3, 5, 9, 12', 'input-target': 2 } },
    { label: '首尾边界 (target=12)', values: { 'input-array': '-1, 0, 3, 5, 9, 12', 'input-target': 12 } },
  ],
  metrics: [
    { id: 'mid-val', label: '中点 nums[mid]', color: '#f59e0b' },
    { id: 'compare-count', label: '比较次数', color: '#2563eb' },
    { id: 'search-result', label: '查找结论', color: '#16a34a' },
  ],
  codeLanguages: BINARY_SEARCH_CODE_LANGUAGES,
  problemHtml: BINARY_SEARCH_PROBLEM_HTML,
  analysisHtml: BINARY_SEARCH_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const raw = inputs['input-array'] || '-1, 0, 3, 5, 9, 12';
    const arr = parseSearchArray(raw);
    const target = parseInt(inputs['input-target'] || '9', 10);
    return binarySearchSteps(arr, target);
  },
  renderCanvas: (container, step) => {
    const isFound = step.phase === 'found';
    const hasMid = step.mid >= 0;

    const highlights = new Map<number, { bg?: string; border?: string; color?: string }>();
    if (isFound) {
      highlights.set(step.mid, { bg: '#f0fdf4', border: '#86efac', color: '#166534' });
    } else if (hasMid) {
      highlights.set(step.mid, { bg: '#fffbeb', border: '#fde68a', color: '#b45309' });
    }

    const pointers = [];
    if (step.left <= step.right && step.left >= 0) {
      pointers.push({ name: 'L', index: step.left, color: '#2563eb', position: 'top' as const });
      pointers.push({ name: 'R', index: step.right, color: '#0d9488', position: 'top' as const });
    }
    if (hasMid) {
      pointers.push({ name: 'mid', index: step.mid, color: '#f59e0b', position: 'bottom' as const });
    }

    ArrayTrackAdapter.renderTrack(container, {
      array: step.array,
      pointers,
      windowRange:
        step.left <= step.right && step.left >= 0
          ? { left: step.left, right: step.right, color: '#3b82f6' }
          : undefined,
      itemHighlights: highlights,
      primaryTitle: '📊 升序排布数组条带 (nums):',
    });

    const root = container.closest('#algo-binary-search-view');
    if (root) {
      const midEl = root.querySelector('#metric-mid-val');
      const countEl = root.querySelector('#metric-compare-count');
      const resEl = root.querySelector('#metric-search-result');

      if (midEl) midEl.textContent = hasMid ? `nums[${step.mid}] = ${step.array[step.mid]}` : '—';
      if (countEl) countEl.textContent = `${step.comparisons} 次`;
      if (resEl) {
        resEl.textContent = isFound ? `命中下标 [${step.foundIndex}]` : step.phase === 'not-found' ? '未找到 (-1)' : '折半查找中';
        resEl.style.color = isFound ? '#16a34a' : step.phase === 'not-found' ? '#ef4444' : '#2563eb';
      }

      // 在 Card 2 中展示折半区间关系
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #475569; padding: 4px 0;">
            <div style="display: flex; justify-content: space-between;">
              <span>当前有效搜索范围:</span>
              <strong style="color: #2563eb;">[${step.left} .. ${step.right}]</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>中点折半公式:</span>
              <strong style="font-family: monospace; color: #f59e0b;">mid = L + (R - L) / 2</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'binary-search',
  name: '二分查找',
  viewId: 'algo-binary-search-view',
  category: 'search',
  description: '经典折半查找：每次与中点比较，对半剔除不可能区间，对数级 O(log n) 时间复杂度',
  icon: '🎯',
  template,
  Visualizer,
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握左闭右闭区间折半查找的不变量设计与防溢出中点计算公式',
});
