/**
 * 插入排序可视化器 — 声明式 4-Card 标准架构
 * 提取 key、向前逆序扫描、元素后移腾位、精准就位插入
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  INSERTION_SORT_PROBLEM_HTML,
  INSERTION_SORT_ANALYSIS_HTML,
  INSERTION_SORT_CODE_LANGUAGES,
} from './insertion-sort-problem-content';
import { parseArray } from './bubble-sort-renderer';

export interface ISStep {
  array: number[];
  i: number;
  key: number;
  j: number;
  shifts: number;
  sortedCount: number;
  phase: 'init' | 'pick-key' | 'compare' | 'shift' | 'insert' | 'done';
  status: 'init' | 'pick-key' | 'compare' | 'shift' | 'insert' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function insertionSortSteps(input: number[]): ISStep[] {
  const steps: ISStep[] = [];
  const array = [...input];
  const n = array.length;
  let shifts = 0;

  steps.push({
    array: [...array],
    i: -1,
    key: -1,
    j: -1,
    shifts: 0,
    sortedCount: 1,
    phase: 'init',
    status: 'init',
    message: n === 0 ? '数组为空，无需排序。' : `初始化：数组长度 n = ${n}，首元素 arr[0] 默认构成初始有序区。`,
    log: n === 0 ? '空数组' : `初始化: [${array.join(', ')}]`,
    codeLine: 2,
  });

  if (n <= 1) {
    steps.push({
      array: [...array],
      i: 0,
      key: array[0] ?? 0,
      j: -1,
      shifts: 0,
      sortedCount: n,
      phase: 'done',
      status: 'done',
      message: '✅ 排序完成！',
      log: '排序完成',
      codeLine: 12,
    });
    return steps;
  }

  for (let i = 1; i < n; i++) {
    const key = array[i];
    let j = i - 1;

    steps.push({
      array: [...array],
      i,
      key,
      j,
      shifts,
      sortedCount: i,
      phase: 'pick-key',
      status: 'pick-key',
      message: `提取待插入元素：key = arr[${i}] (${key})，准备在已排序区间 [0..${i - 1}] 中向前扫描找寻插入位置。`,
      log: `提取 key = arr[${i}] (${key})`,
      codeLine: [3, 4, 5],
    });

    while (j >= 0 && array[j] > key) {
      steps.push({
        array: [...array],
        i,
        key,
        j,
        shifts,
        sortedCount: i,
        phase: 'compare',
        status: 'compare',
        message: `比较：arr[${j}] (${array[j]}) > key (${key})，需要向后移动腾位。`,
        log: `比较: arr[${j}] (${array[j]}) > key (${key}) -> 右移`,
        codeLine: 7,
      });

      array[j + 1] = array[j];
      shifts++;

      steps.push({
        array: [...array],
        i,
        key,
        j,
        shifts,
        sortedCount: i,
        phase: 'shift',
        status: 'shift',
        message: `元素右移：将 arr[${j}] (${array[j]}) 移动到 arr[${j + 1}]。`,
        log: `右移 arr[${j}] -> [${j + 1}]`,
        codeLine: 8,
      });

      j--;
    }

    if (j >= 0) {
      steps.push({
        array: [...array],
        i,
        key,
        j,
        shifts,
        sortedCount: i,
        phase: 'compare',
        status: 'compare',
        message: `比较：arr[${j}] (${array[j]}) &le; key (${key})，找到插入边界！目标插入位置为下标 ${j + 1}。`,
        log: `找到插入位置: 下标 ${j + 1}`,
        codeLine: 7,
      });
    }

    array[j + 1] = key;

    steps.push({
      array: [...array],
      i,
      key,
      j: j + 1,
      shifts,
      sortedCount: i + 1,
      phase: 'insert',
      status: 'insert',
      message: `就位插入：将 key (${key}) 放入 arr[${j + 1}]。当前有序前缀扩展至 [0..${i}]。`,
      log: `插入 key (${key}) 到 [${j + 1}]，有序区 [0..${i}]`,
      codeLine: 11,
    });
  }

  steps.push({
    array: [...array],
    i: n - 1,
    key: array[n - 1],
    j: -1,
    shifts,
    sortedCount: n,
    phase: 'done',
    status: 'done',
    message: `🎉 插入排序完成！共执行 ${shifts} 次元素搬移。最终数组：[${array.join(', ')}]。`,
    log: `✓ 排序完成: [${array.join(', ')}]`,
    codeLine: 12,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: ISStep[]): ISStep[] {
  return steps.map((s) => {
    let action = 'insert(key, arr[0..i-1])';
    if (s.phase === 'pick-key') action = `key = arr[${s.i}] (${s.key})`;
    else if (s.phase === 'compare') {
      action = `arr[${s.j}] (${s.array[s.j]}) ${
        s.array[s.j] > s.key ? '>' : '<='
      } key (${s.key})`;
    } else if (s.phase === 'shift') action = `arr[${s.j + 1}] = arr[${s.j}] (${s.array[s.j + 1]})`;
    else if (s.phase === 'insert') action = `arr[${s.j}] = key (${s.key}) 插入`;
    else if (s.phase === 'done') action = '排序完成';

    return {
      ...s,
      metrics: {
        i: s.i >= 0 ? String(s.i) : '—',
        key: s.key >= 0 ? String(s.key) : '—',
        j: s.j >= 0 ? String(s.j) : '—',
        shifts: String(s.shifts),
        action,
      },
    };
  });
}

export function renderInsertionSortCanvas(container: HTMLElement, step: ISStep): void {
  const { array, i, key, j, sortedCount, phase } = step;

  const maxVal = Math.max(...array, key, 1);
  const barsHtml = array
    .map((val, idx) => {
      const isKey = idx === i && phase === 'pick-key';
      const isComparingJ = idx === j && phase === 'compare';
      const isShifting = idx === j + 1 && phase === 'shift';
      const isSorted = idx < sortedCount || phase === 'done';

      let bg = '#cbd5e1';
      let border = '#94a3b8';
      let color = '#334155';
      let transform = 'none';
      if (isKey) {
        bg = '#fef9c3';
        border = '#eab308';
        color = '#854d0e';
        transform = 'scale(1.05)';
      } else if (isShifting) {
        bg = '#fef2f2';
        border = '#ef4444';
        color = '#b91c1c';
      } else if (isComparingJ) {
        bg = '#eff6ff';
        border = '#3b82f6';
        color = '#1d4ed8';
      } else if (isSorted) {
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
  id: 'insertion-sort',
  name: '插入排序',
  category: 'sort',
  description: '逐步演示插入排序：元素后移、插入到有序区合适位置',
  icon: '🃏',
  difficulty: 1,
  levelOrder: 3,
  learningGoal: '理解插入排序的摸牌原理和后移腾位过程',
  inputs: [
    {
      id: 'array',
      label: '输入数组',
      type: 'text',
      defaultValue: '12, 11, 13, 5, 6',
      placeholder: '逗号分隔数字',
    },
  ],
  presets: [
    { label: '基础示例', values: { array: '12, 11, 13, 5, 6' } },
    { label: '近有序', values: { array: '2, 3, 5, 7, 4, 6' } },
    { label: '逆序最坏情形', values: { array: '9, 8, 7, 6, 5' } },
    { label: '含重复元素', values: { array: '3, 1, 3, 2, 1' } },
  ],
  metrics: [
    { id: 'i', label: '当前索引 i', color: '#2563eb' },
    { id: 'key', label: '待插 key', color: '#eab308' },
    { id: 'j', label: '扫描比较 j', color: '#3b82f6' },
    { id: 'shifts', label: '后移次数', color: '#f59e0b' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '待插 key', color: '#eab308' },
    { label: '扫描比较 j', color: '#3b82f6' },
    { label: '后移搬移', color: '#ef4444' },
    { label: '前缀有序', color: '#22c55e' },
  ],
  codeLanguages: INSERTION_SORT_CODE_LANGUAGES,
  problemHtml: INSERTION_SORT_PROBLEM_HTML,
  analysisHtml: INSERTION_SORT_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(insertionSortSteps(parseArray(String(inputs.array ?? '12, 11, 13, 5, 6')))),
  renderCanvas: (container, step) => renderInsertionSortCanvas(container, step as ISStep),
});
