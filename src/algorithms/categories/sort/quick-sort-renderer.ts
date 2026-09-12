/**
 * 快速排序可视化器 — 声明式 4-Card 标准架构
 * 递归分治、双指针 Partition、基准值精准归位
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  QUICK_SORT_PROBLEM_HTML,
  QUICK_SORT_ANALYSIS_HTML,
  QUICK_SORT_CODE_LANGUAGES,
} from './quick-sort-problem-content';
import { parseArray } from './bubble-sort-renderer';

export interface QSStep {
  array: number[];
  left: number;
  right: number;
  pivotIdx: number;
  pivotVal: number;
  i: number;
  j: number;
  comparisons: number;
  swaps: number;
  settledIndices: number[];
  swapping: boolean;
  phase: 'init' | 'pick-pivot' | 'scan-j' | 'scan-i' | 'swap-ij' | 'pivot-settled' | 'done';
  status: 'init' | 'pick-pivot' | 'scan-j' | 'scan-i' | 'swap-ij' | 'pivot-settled' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function quickSortSteps(input: number[]): QSStep[] {
  const steps: QSStep[] = [];
  const array = [...input];
  const n = array.length;
  const settledIndices: number[] = [];
  let comparisons = 0;
  let swaps = 0;

  steps.push({
    array: [...array],
    left: -1,
    right: -1,
    pivotIdx: -1,
    pivotVal: -1,
    i: -1,
    j: -1,
    comparisons: 0,
    swaps: 0,
    settledIndices: [],
    swapping: false,
    phase: 'init',
    status: 'init',
    message: n === 0 ? '数组为空，无需排序。' : `初始化快速排序：数组长度 n = ${n}，采用双指针向内夹逼 Partition。`,
    log: n === 0 ? '空数组' : `初始化: [${array.join(', ')}]`,
    codeLine: 2,
  });

  if (n <= 1) {
    steps.push({
      array: [...array],
      left: 0,
      right: 0,
      pivotIdx: 0,
      pivotVal: array[0] ?? 0,
      i: 0,
      j: 0,
      comparisons: 0,
      swaps: 0,
      settledIndices: n === 1 ? [0] : [],
      swapping: false,
      phase: 'done',
      status: 'done',
      message: '✅ 排序完成！',
      log: '排序完成',
      codeLine: 5,
    });
    return steps;
  }

  const sort = (l: number, r: number) => {
    if (l >= r) {
      if (l === r && !settledIndices.includes(l)) settledIndices.push(l);
      return;
    }

    const pivotVal = array[l];
    let i = l;
    let j = r;

    steps.push({
      array: [...array],
      left: l,
      right: r,
      pivotIdx: l,
      pivotVal,
      i,
      j,
      comparisons,
      swaps,
      settledIndices: [...settledIndices],
      swapping: false,
      phase: 'pick-pivot',
      status: 'pick-pivot',
      message: `区间 [${l}..${r}] 划分：选定基准值 pivot = arr[${l}] (${pivotVal})，指针 i=${i}, j=${j}。`,
      log: `区间 [${l}..${r}]: pivot = ${pivotVal}`,
      codeLine: [9, 10],
    });

    while (i < j) {
      while (i < j && array[j] >= pivotVal) {
        comparisons++;
        steps.push({
          array: [...array],
          left: l,
          right: r,
          pivotIdx: l,
          pivotVal,
          i,
          j,
          comparisons,
          swaps,
          settledIndices: [...settledIndices],
          swapping: false,
          phase: 'scan-j',
          status: 'scan-j',
          message: `右指针 j 向左扫描：arr[${j}] (${array[j]}) &ge; pivot (${pivotVal})，右指针左移。`,
          log: `j 左移: arr[${j}] (${array[j]}) >= pivot`,
          codeLine: 12,
        });
        j--;
      }

      while (i < j && array[i] <= pivotVal) {
        comparisons++;
        steps.push({
          array: [...array],
          left: l,
          right: r,
          pivotIdx: l,
          pivotVal,
          i,
          j,
          comparisons,
          swaps,
          settledIndices: [...settledIndices],
          swapping: false,
          phase: 'scan-i',
          status: 'scan-i',
          message: `左指针 i 向右扫描：arr[${i}] (${array[i]}) &le; pivot (${pivotVal})，左指针右移。`,
          log: `i 右移: arr[${i}] (${array[i]}) <= pivot`,
          codeLine: 13,
        });
        i++;
      }

      if (i < j) {
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
        swaps++;

        steps.push({
          array: [...array],
          left: l,
          right: r,
          pivotIdx: l,
          pivotVal,
          i,
          j,
          comparisons,
          swaps,
          settledIndices: [...settledIndices],
          swapping: true,
          phase: 'swap-ij',
          status: 'swap-ij',
          message: `双向交换：交换 arr[${i}] 与 arr[${j}] (${temp} ⇋ ${array[i]})。`,
          log: `交换 [${i}] ⇋ [${j}] (${temp} ⇋ ${array[i]})`,
          codeLine: [14, 15, 16],
        });
      }
    }

    // 将基准值归位到相遇点 i
    array[l] = array[i];
    array[i] = pivotVal;
    if (l !== i) swaps++;
    settledIndices.push(i);

    steps.push({
      array: [...array],
      left: l,
      right: r,
      pivotIdx: i,
      pivotVal,
      i,
      j: i,
      comparisons,
      swaps,
      settledIndices: [...settledIndices],
      swapping: true,
      phase: 'pivot-settled',
      status: 'pivot-settled',
      message: `基准归位：将 pivot (${pivotVal}) 放入相遇点下标 ${i}。左侧全部 &le; ${pivotVal}，右侧全部 &ge; ${pivotVal}。`,
      log: `Pivot ${pivotVal} 就位于下标 ${i}`,
      codeLine: [18, 19],
    });

    sort(l, i - 1);
    sort(i + 1, r);
  };

  sort(0, n - 1);

  steps.push({
    array: [...array],
    left: 0,
    right: n - 1,
    pivotIdx: -1,
    pivotVal: -1,
    i: -1,
    j: -1,
    comparisons,
    swaps,
    settledIndices: Array.from({ length: n }, (_, idx) => idx),
    swapping: false,
    phase: 'done',
    status: 'done',
    message: `🎉 快速排序完成！共比较 ${comparisons} 次，交换 ${swaps} 次。最终数组：[${array.join(', ')}]。`,
    log: `✓ 排序完成: [${array.join(', ')}]`,
    codeLine: 5,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: QSStep[]): QSStep[] {
  return steps.map((s) => {
    let action = 'partition(arr, left, right)';
    if (s.swapping) action = `swap(arr[${s.i}], arr[${s.j}]) 交换`;
    else if (s.phase === 'scan-j') action = `arr[${s.j}] (${s.array[s.j]}) >= pivot (${s.pivotVal}) (j--)`;
    else if (s.phase === 'scan-i') action = `arr[${s.i}] (${s.array[s.i]}) <= pivot (${s.pivotVal}) (i++)`;
    else if (s.phase === 'pivot-settled') action = `pivot (${s.pivotVal}) 归位于下标 ${s.i}`;
    else if (s.phase === 'done') action = '快速排序完成';

    return {
      ...s,
      metrics: {
        range: s.left >= 0 && s.right >= 0 ? `[${s.left}, ${s.right}]` : '—',
        pivot: s.pivotVal >= 0 && s.phase !== 'done' ? `${s.pivotVal}` : '—',
        ij: s.i >= 0 && s.j >= 0 ? `[${s.i}, ${s.j}]` : '—',
        'comp-swap': `${s.comparisons} / ${s.swaps}`,
        action,
      },
    };
  });
}

export function renderQuickSortCanvas(container: HTMLElement, step: QSStep): void {
  const { array, left, right, pivotIdx, pivotVal, i, j, settledIndices, swapping, phase } = step;

  const maxVal = Math.max(...array, 1);
  const barsHtml = array
    .map((val, idx) => {
      const isPivot = idx === pivotIdx && phase !== 'done';
      const isIPtr = idx === i && phase !== 'done';
      const isJPtr = idx === j && phase !== 'done';
      const isSwapping =
        (idx === i || idx === j || (phase === 'pivot-settled' && (idx === left || idx === i))) && swapping;
      const isSettled = settledIndices.includes(idx) || phase === 'done';

      let bg = '#cbd5e1';
      let border = '#94a3b8';
      let color = '#334155';
      let transform = 'none';
      if (isSwapping) {
        bg = '#fef2f2';
        border = '#ef4444';
        color = '#b91c1c';
        transform = 'scale(1.06)';
      } else if (isPivot) {
        bg = '#fef9c3';
        border = '#eab308';
        color = '#854d0e';
        transform = 'scale(1.06)';
      } else if (isIPtr) {
        bg = '#eff6ff';
        border = '#3b82f6';
        color = '#1d4ed8';
      } else if (isJPtr) {
        bg = '#faf5ff';
        border = '#a855f7';
        color = '#7e22ce';
      } else if (isSettled) {
        bg = '#f0fdf4';
        border = '#22c55e';
        color = '#15803d';
      }

      const heightPct = Math.max(18, Math.round((val / maxVal) * 100));

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; max-width: 44px; height: 100%; justify-content: flex-end; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);">
          <div style="width: 100%; border-radius: 6px 6px 2px 2px; background: ${bg}; border: 1.5px solid ${border}; color: ${color}; min-height: 12px; height: ${heightPct}%; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); transform: ${transform}; display: flex; align-items: flex-start; justify-content: center; padding-top: 4px; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 800; box-sizing: border-box;">${val}</div>
          <span style="font-size: 9.5px; font-family: 'JetBrains Mono', monospace; color: #94a3b8;">${idx}</span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; align-items: flex-end; justify-content: center; gap: 10px; height: 100%; width: 100%; padding: 16px 12px 10px; box-sizing: border-box;">
      ${barsHtml}
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'quick-sort',
  name: '快速排序',
  category: 'sort',
  description: '逐步演示快速排序：基准值选择、双向扫描划分、递归分治',
  icon: '⚡',
  difficulty: 2,
  levelOrder: 6,
  learningGoal: '理解快速排序的基准划分、双指针碰撞和递归过程',
  inputs: [
    {
      id: 'array',
      label: '输入数组',
      type: 'text',
      defaultValue: '6, 1, 2, 7, 9, 3, 4, 5, 10, 8',
      placeholder: '逗号分隔数字',
    },
  ],
  presets: [
    { label: '基础示例', values: { array: '6, 1, 2, 7, 9, 3, 4, 5, 10, 8' } },
    { label: '近有序', values: { array: '1, 2, 3, 5, 4, 6, 7' } },
    { label: '逆序最坏情形', values: { array: '9, 8, 7, 6, 5, 4, 3, 2, 1' } },
    { label: '含重复元素', values: { array: '3, 1, 3, 2, 1, 3' } },
  ],
  metrics: [
    { id: 'range', label: '划分区间', color: '#2563eb' },
    { id: 'pivot', label: '基准 pivot', color: '#eab308' },
    { id: 'ij', label: '双指针 [i, j]', color: '#3b82f6' },
    { id: 'comp-swap', label: '比较 / 交换', color: '#f59e0b' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '基准 pivot', color: '#eab308' },
    { label: '左指针 i', color: '#3b82f6' },
    { label: '右指针 j', color: '#a855f7' },
    { label: '已就位', color: '#22c55e' },
  ],
  codeLanguages: QUICK_SORT_CODE_LANGUAGES,
  problemHtml: QUICK_SORT_PROBLEM_HTML,
  analysisHtml: QUICK_SORT_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(quickSortSteps(parseArray(String(inputs.array ?? '6, 1, 2, 7, 9, 3, 4, 5, 10, 8')))),
  renderCanvas: (container, step) => renderQuickSortCanvas(container, step as QSStep),
});
