/**
 * 选择排序可视化器 — 声明式 4-Card 标准架构
 * 极值扫描、最小值锁定、原地单次交换、前缀有序扩展
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { BarsCanvasAdapter } from '../../../core/renderers/bars-canvas-adapter';
import type { VisualStateId } from '../../../core/renderers/visual-state-tokens';
import {
  SELECTION_SORT_PROBLEM_HTML,
  SELECTION_SORT_ANALYSIS_HTML,
  SELECTION_SORT_CODE_LANGUAGES,
} from './selection-sort-problem-content';
import { parseArray } from './bubble-sort-renderer';

export interface SSStep {
  array: number[];
  i: number;
  minIdx: number;
  j: number;
  comparisons: number;
  swaps: number;
  sortedCount: number;
  phase: 'init' | 'scan' | 'compare' | 'update-min' | 'swap' | 'pass-done' | 'done';
  status: 'init' | 'scan' | 'compare' | 'update-min' | 'swap' | 'pass-done' | 'done';
  swapping: boolean;
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function selectionSortSteps(inputArr: number[]): SSStep[] {
  const steps: SSStep[] = [];
  const array = [...inputArr];
  const n = array.length;
  let comparisons = 0;
  let swaps = 0;

  steps.push({
    array: [...array],
    i: 0,
    minIdx: 0,
    j: -1,
    comparisons: 0,
    swaps: 0,
    sortedCount: 0,
    phase: 'init',
    status: 'init',
    swapping: false,
    message: `准备开始选择排序，待排序数组长度为 ${n}。`,
    log: `初始化数组: [${array.join(', ')}]`,
    codeLine: 2,
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    steps.push({
      array: [...array],
      i,
      minIdx,
      j: -1,
      comparisons,
      swaps,
      sortedCount: i,
      phase: 'scan',
      status: 'scan',
      swapping: false,
      message: `第 ${i + 1} 轮：假设当前区间 [${i}..${n - 1}] 的最小值为下标 ${i} 处的元素 (${array[i]})。`,
      log: `第 ${i + 1} 轮: 设初始最小值 minIdx = ${i} (${array[i]})`,
      codeLine: 4,
    });

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      const isSmaller = array[j] < array[minIdx];

      steps.push({
        array: [...array],
        i,
        minIdx,
        j,
        comparisons,
        swaps,
        sortedCount: i,
        phase: 'compare',
        status: 'compare',
        swapping: false,
        message: `比较 arr[${j}] (${array[j]}) 与当前已知最小值 arr[${minIdx}] (${array[minIdx]})${
          isSmaller ? '，发现更小值！' : '，未打破最小值。'
        }`,
        log: `比较 [${j}] (${array[j]}) vs 最小 [${minIdx}] (${array[minIdx]})`,
        codeLine: 6,
      });

      if (isSmaller) {
        minIdx = j;

        steps.push({
          array: [...array],
          i,
          minIdx,
          j,
          comparisons,
          swaps,
          sortedCount: i,
          phase: 'update-min',
          status: 'update-min',
          swapping: false,
          message: `更新最小值索引：minIdx = ${minIdx} (值 ${array[minIdx]})。`,
          log: `更新 minIdx = ${minIdx} (${array[minIdx]})`,
          codeLine: 7,
        });
      }
    }

    if (minIdx !== i) {
      const temp = array[i];
      array[i] = array[minIdx];
      array[minIdx] = temp;
      swaps++;

      steps.push({
        array: [...array],
        i,
        minIdx,
        j: -1,
        comparisons,
        swaps,
        sortedCount: i,
        phase: 'swap',
        status: 'swap',
        swapping: true,
        message: `将本轮找到的最小值 ${array[i]} 与 arr[${i}] (${temp}) 进行交换，归位到已排序区末尾。`,
        log: `交换 [${i}] ⇋ [${minIdx}] (${temp} ⇋ ${array[i]})`,
        codeLine: [9, 10, 11],
      });
    }

    steps.push({
      array: [...array],
      i,
      minIdx: i,
      j: -1,
      comparisons,
      swaps,
      sortedCount: i + 1,
      phase: 'pass-done',
      status: 'pass-done',
      swapping: false,
      message: `第 ${i + 1} 轮结束：下标 ${i} (值 ${array[i]}) 已就位，左侧已排序区扩充至 [0..${i}]。`,
      log: `第 ${i + 1} 轮结束，[0..${i}] 已有序`,
      codeLine: 13,
    });
  }

  steps.push({
    array: [...array],
    i: n - 1,
    minIdx: n - 1,
    j: -1,
    comparisons,
    swaps,
    sortedCount: n,
    phase: 'done',
    status: 'done',
    swapping: false,
    message: `🎉 选择排序完成！共比较 ${comparisons} 次，仅执行 ${swaps} 次交换。最终数组：[${array.join(', ')}]。`,
    log: `✓ 排序完成: [${array.join(', ')}]`,
    codeLine: 14,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: SSStep[]): SSStep[] {
  return steps.map((s) => {
    let action = 'findMin(arr[i..n-1])';
    if (s.swapping) action = `swap(arr[${s.i}], arr[${s.minIdx}]) 归位`;
    else if (s.phase === 'compare') {
      action = `arr[${s.j}] (${s.array[s.j]}) ${
        s.array[s.j] < s.array[s.minIdx] ? '<' : '>='
      } arr[${s.minIdx}] (${s.array[s.minIdx]})`;
    } else if (s.phase === 'update-min') action = `minIdx = ${s.minIdx} (${s.array[s.minIdx]})`;
    else if (s.phase === 'pass-done') action = `第 ${s.i + 1} 轮就位完毕`;
    else if (s.phase === 'done') action = '排序完成';

    return {
      ...s,
      metrics: {
        i: s.i >= 0 ? String(s.i) : '—',
        'min-idx': s.minIdx >= 0 ? `${s.minIdx} (${s.array[s.minIdx]})` : '—',
        j: s.j >= 0 ? String(s.j) : '—',
        'comp-swap': `${s.comparisons} / ${s.swaps}`,
        action,
      },
    };
  });
}

export function renderSelectionSortCanvas(container: HTMLElement, step: SSStep): void {
  const { array, i, minIdx, j, sortedCount, phase, swapping } = step;

  const states: VisualStateId[] = array.map((_, idx) => {
    if ((idx === i || idx === minIdx) && swapping) return 'swapping';
    if (idx === minIdx && phase !== 'done') return 'pivot';
    if (idx === j && !swapping && phase === 'compare') return 'scanning';
    if (idx < sortedCount || phase === 'done') return 'sorted';
    return 'comparing';
  });

  BarsCanvasAdapter.render(container, { values: array, states, emphasisScale: 1.06 });
}

registerDeclarativeAlgorithm({
  id: 'selection-sort',
  name: '选择排序',
  category: 'sort',
  description: '逐步演示选择排序：未排序区间选出最小值并交换',
  icon: '🎯',
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握选择排序的最小值选取和交换机制',
  inputs: [
    {
      id: 'array',
      label: '输入数组',
      type: 'text',
      defaultValue: '29, 10, 14, 37, 13',
      placeholder: '逗号分隔数字',
    },
  ],
  presets: [
    { label: '基础示例', values: { array: '29, 10, 14, 37, 13' } },
    { label: '近有序', values: { array: '2, 4, 6, 8, 1, 3' } },
    { label: '逆序最坏情形', values: { array: '9, 8, 7, 6, 5, 4, 3' } },
    { label: '含重复元素', values: { array: '5, 3, 5, 1, 3, 5' } },
  ],
  metrics: [
    { id: 'i', label: '归位目标索引 i', color: '#2563eb' },
    { id: 'min-idx', label: '当前最小值 minIdx', color: '#eab308' },
    { id: 'j', label: '扫描指针 j', color: '#38bdf8' },
    { id: 'comp-swap', label: '比较 / 交换', color: '#f59e0b' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '目标位 i', color: '#2563eb' },
    { label: '最小值 min', color: '#eab308' },
    { label: '扫描中 j', color: '#38bdf8' },
    { label: '前缀已就位', color: '#22c55e' },
  ],
  codeLanguages: SELECTION_SORT_CODE_LANGUAGES,
  problemHtml: SELECTION_SORT_PROBLEM_HTML,
  analysisHtml: SELECTION_SORT_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(selectionSortSteps(parseArray(String(inputs.array ?? '29, 10, 14, 37, 13')))),
  renderCanvas: (container, step) => renderSelectionSortCanvas(container, step as SSStep),
});
