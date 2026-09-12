/**
 * 冒泡排序可视化器 — 声明式 4-Card 标准架构
 * 相邻比较、元素交换、末尾冒泡到位、早停优化
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { BarsCanvasAdapter } from '../../../core/renderers/bars-canvas-adapter';
import type { VisualStateId } from '../../../core/renderers/visual-state-tokens';
import {
  BUBBLE_SORT_PROBLEM_HTML,
  BUBBLE_SORT_ANALYSIS_HTML,
  BUBBLE_SORT_CODE_LANGUAGES,
} from './bubble-sort-problem-content';

export interface BSStep {
  array: number[];
  pass: number;
  j: number;
  jNext: number;
  comparisons: number;
  swaps: number;
  sortedTail: number;
  phase: 'init' | 'compare' | 'swap' | 'pass-done' | 'done';
  status: 'init' | 'compare' | 'swap' | 'pass-done' | 'done';
  swapping: boolean;
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function parseArray(input: string): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return arr.length > 0 ? arr : [5, 2, 9, 1, 5, 6];
}

export function bubbleSortSteps(input: number[]): BSStep[] {
  const steps: BSStep[] = [];
  const array = [...input];
  const n = array.length;
  let comparisons = 0;
  let swaps = 0;
  let swapped: boolean;

  steps.push({
    array: [...array],
    pass: -1,
    j: -1,
    jNext: -1,
    comparisons: 0,
    swaps: 0,
    sortedTail: 0,
    phase: 'init',
    status: 'init',
    swapping: false,
    message: n === 0 ? '数组为空，无需排序。' : `初始化：数组长度 n = ${n}，共需最多 ${n - 1} 轮冒泡。`,
    log: n === 0 ? '空数组' : `初始化: [${array.join(', ')}]`,
    codeLine: 2,
  });

  if (n <= 1) {
    steps.push({
      array: [...array],
      pass: 0,
      j: -1,
      jNext: -1,
      comparisons: 0,
      swaps: 0,
      sortedTail: n,
      phase: 'done',
      status: 'done',
      swapping: false,
      message: '✅ 排序完成！',
      log: '排序完成',
      codeLine: 12,
    });
    return steps;
  }

  for (let i = 0; i < n - 1; i++) {
    swapped = false;

    for (let j = 0; j < n - 1 - i; j++) {
      comparisons++;
      const cmp = array[j] > array[j + 1];

      steps.push({
        array: [...array],
        pass: i + 1,
        j,
        jNext: j + 1,
        comparisons,
        swaps,
        sortedTail: i,
        phase: 'compare',
        status: 'compare',
        swapping: false,
        message: `第 ${i + 1} 轮：比较 arr[${j}] (${array[j]}) 与 arr[${j + 1}] (${array[j + 1]})${
          cmp ? '，需要交换' : '，无需交换'
        }。`,
        log: `比较 [${j}] (${array[j]}) vs [${j + 1}] (${array[j + 1]})`,
        codeLine: 6,
      });

      if (cmp) {
        const temp = array[j];
        array[j] = array[j + 1];
        array[j + 1] = temp;
        swaps++;
        swapped = true;

        steps.push({
          array: [...array],
          pass: i + 1,
          j,
          jNext: j + 1,
          comparisons,
          swaps,
          sortedTail: i,
          phase: 'swap',
          status: 'swap',
          swapping: true,
          message: `交换 arr[${j}] 与 arr[${j + 1}]：${temp} ⇋ ${array[j]}。`,
          log: `交换 [${j}] ⇋ [${j + 1}] (${temp} ⇋ ${array[j]})`,
          codeLine: [7, 8, 9, 10],
        });
      }
    }

    const settledVal = array[n - 1 - i];
    steps.push({
      array: [...array],
      pass: i + 1,
      j: -1,
      jNext: -1,
      comparisons,
      swaps,
      sortedTail: i + 1,
      phase: 'pass-done',
      status: 'pass-done',
      swapping: false,
      message: `第 ${i + 1} 轮结束：当前最大值 ${settledVal} 已冒泡沉底至下标 ${n - 1 - i}。`,
      log: `第 ${i + 1} 轮结束，末尾 ${settledVal} 就位`,
      codeLine: 12,
    });

    if (!swapped) {
      steps.push({
        array: [...array],
        pass: i + 1,
        j: -1,
        jNext: -1,
        comparisons,
        swaps,
        sortedTail: n,
        phase: 'done',
        status: 'done',
        swapping: false,
        message: '⚡ 早停触发：本轮未发生任何交换，数组已完全有序！',
        log: '早停退出: 数组已有序',
        codeLine: 12,
      });
      return steps;
    }
  }

  steps.push({
    array: [...array],
    pass: n - 1,
    j: -1,
    jNext: -1,
    comparisons,
    swaps,
    sortedTail: n,
    phase: 'done',
    status: 'done',
    swapping: false,
    message: `🎉 冒泡排序完成！共比较 ${comparisons} 次，交换 ${swaps} 次。最终数组：[${array.join(', ')}]。`,
    log: `✓ 排序完成: [${array.join(', ')}]`,
    codeLine: 14,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: BSStep[]): BSStep[] {
  return steps.map((s) => {
    let action = 'compare(arr[j], arr[j+1])';
    if (s.swapping) action = `swap(arr[${s.j}], arr[${s.jNext}]) 交换`;
    else if (s.phase === 'pass-done') action = `第 ${s.pass} 轮结束，末尾就位`;
    else if (s.phase === 'done') action = '排序完成';

    return {
      ...s,
      metrics: {
        pass: s.pass >= 0 ? String(s.pass) : '—',
        'j-pair': s.j >= 0 && s.jNext >= 0 ? `[${s.j}, ${s.jNext}]` : '—',
        'comp-swap': `${s.comparisons} / ${s.swaps}`,
        'sorted-count': `${s.sortedTail} / ${s.array.length}`,
        action,
      },
    };
  });
}

export function renderBubbleSortCanvas(container: HTMLElement, step: BSStep): void {
  const { array, j, jNext, sortedTail, phase, swapping } = step;

  const states: VisualStateId[] = array.map((_, idx) => {
    const isSwapping = (idx === j || idx === jNext) && swapping;
    if (isSwapping) return 'swapping';
    const isComparing = (idx === j || idx === jNext) && !swapping && phase === 'compare';
    if (isComparing) return 'comparing';
    const isSorted = idx >= array.length - sortedTail || phase === 'done';
    if (isSorted) return 'sorted';
    return 'idle';
  });

  BarsCanvasAdapter.render(container, { values: array, states, valuePosition: 'above', emphasisScale: 1.05 });
}

registerDeclarativeAlgorithm({
  id: 'bubble-sort',
  name: '冒泡排序',
  category: 'sort',
  description: '逐步演示冒泡排序：相邻元素比较、交换、冒泡到位',
  icon: '🌪️',
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '理解冒泡排序的相邻比较和元素冒泡过程',
  inputs: [
    {
      id: 'array',
      label: '输入数组',
      type: 'text',
      defaultValue: '5, 2, 9, 1, 5, 6',
      placeholder: '逗号分隔数字',
    },
  ],
  presets: [
    { label: '基础示例', values: { array: '5, 2, 9, 1, 5, 6' } },
    { label: '近有序 (早停)', values: { array: '1, 2, 3, 5, 4, 6, 7' } },
    { label: '逆序最坏情形', values: { array: '9, 8, 7, 6, 5, 4, 3, 2, 1' } },
    { label: '含重复元素', values: { array: '4, 4, 2, 2, 8, 8, 1' } },
  ],
  metrics: [
    { id: 'pass', label: '当前轮次', color: '#2563eb' },
    { id: 'j-pair', label: '比较指针 [j, j+1]', color: '#a855f7' },
    { id: 'comp-swap', label: '比较 / 交换', color: '#f59e0b' },
    { id: 'sorted-count', label: '已就位', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '比较中', color: '#3b82f6' },
    { label: '交换中', color: '#ef4444' },
    { label: '已就位', color: '#22c55e' },
  ],
  codeLanguages: BUBBLE_SORT_CODE_LANGUAGES,
  problemHtml: BUBBLE_SORT_PROBLEM_HTML,
  analysisHtml: BUBBLE_SORT_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(bubbleSortSteps(parseArray(String(inputs.array ?? '5, 2, 9, 1, 5, 6')))),
  renderCanvas: (container, step) => renderBubbleSortCanvas(container, step as BSStep),
});
