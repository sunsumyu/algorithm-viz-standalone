/**
 * 希尔排序可视化器 — 声明式 4-Card 标准架构
 * 增量折半、跨步分组插入、逐步粗排到精排
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  SHELL_SORT_PROBLEM_HTML,
  SHELL_SORT_ANALYSIS_HTML,
  SHELL_SORT_CODE_LANGUAGES,
} from './shell-sort-problem-content';
import { parseArray } from './bubble-sort-renderer';

export interface ShellStep {
  array: number[];
  gap: number;
  i: number;
  key: number;
  j: number;
  comparisons: number;
  shifts: number;
  phase: 'init' | 'new-gap' | 'pick-key' | 'compare' | 'shift' | 'insert' | 'done';
  status: 'init' | 'new-gap' | 'pick-key' | 'compare' | 'shift' | 'insert' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function shellSortSteps(input: number[]): ShellStep[] {
  const steps: ShellStep[] = [];
  const array = [...input];
  const n = array.length;
  let comparisons = 0;
  let shifts = 0;

  steps.push({
    array: [...array],
    gap: Math.floor(n / 2),
    i: -1,
    key: -1,
    j: -1,
    comparisons: 0,
    shifts: 0,
    phase: 'init',
    status: 'init',
    message: n === 0 ? '数组为空，无需排序。' : `初始化希尔排序：数组长度 n = ${n}，初始增量 gap = ${Math.floor(n / 2)}。`,
    log: n === 0 ? '空数组' : `初始化: [${array.join(', ')}]`,
    codeLine: 2,
  });

  if (n <= 1) {
    steps.push({
      array: [...array],
      gap: 0,
      i: 0,
      key: array[0] ?? 0,
      j: -1,
      comparisons: 0,
      shifts: 0,
      phase: 'done',
      status: 'done',
      message: '✅ 排序完成！',
      log: '排序完成',
      codeLine: 13,
    });
    return steps;
  }

  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    steps.push({
      array: [...array],
      gap,
      i: gap,
      key: -1,
      j: -1,
      comparisons,
      shifts,
      phase: 'new-gap',
      status: 'new-gap',
      message: `进入新一轮增量：gap = ${gap}，对间隔为 ${gap} 的所有子序列执行分组插入排序。`,
      log: `新增量 gap = ${gap}`,
      codeLine: 4,
    });

    for (let i = gap; i < n; i++) {
      const key = array[i];
      let j = i;

      steps.push({
        array: [...array],
        gap,
        i,
        key,
        j,
        comparisons,
        shifts,
        phase: 'pick-key',
        status: 'pick-key',
        message: `提取待插入元素：key = arr[${i}] (${key})，步长 gap = ${gap}。`,
        log: `gap=${gap}: 提取 key = arr[${i}] (${key})`,
        codeLine: [5, 6, 7],
      });

      while (j >= gap) {
        comparisons++;
        const cmp = array[j - gap] > key;

        steps.push({
          array: [...array],
          gap,
          i,
          key,
          j,
          comparisons,
          shifts,
          phase: 'compare',
          status: 'compare',
          message: `跨步比较：arr[${j - gap}] (${array[j - gap]}) vs key (${key})${
            cmp ? '，需要后移 gap 位' : '，无需移动'
          }。`,
          log: `比较 arr[${j - gap}] (${array[j - gap]}) vs key (${key})`,
          codeLine: 8,
        });

        if (!cmp) break;

        array[j] = array[j - gap];
        shifts++;

        steps.push({
          array: [...array],
          gap,
          i,
          key,
          j,
          comparisons,
          shifts,
          phase: 'shift',
          status: 'shift',
          message: `跨步后移：将 arr[${j - gap}] (${array[j]}) 移动到 arr[${j}]。`,
          log: `后移 arr[${j - gap}] -> [${j}]`,
          codeLine: 9,
        });

        j -= gap;
      }

      array[j] = key;

      steps.push({
        array: [...array],
        gap,
        i,
        key,
        j,
        comparisons,
        shifts,
        phase: 'insert',
        status: 'insert',
        message: `插入就位：将 key (${key}) 插入到 arr[${j}]。`,
        log: `插入 key (${key}) 到 [${j}]`,
        codeLine: 12,
      });
    }
  }

  steps.push({
    array: [...array],
    gap: 0,
    i: n - 1,
    key: array[n - 1],
    j: -1,
    comparisons,
    shifts,
    phase: 'done',
    status: 'done',
    message: `🎉 希尔排序完成！共比较 ${comparisons} 次，跨步移动 ${shifts} 次。最终数组：[${array.join(', ')}]。`,
    log: `✓ 排序完成: [${array.join(', ')}]`,
    codeLine: 13,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: ShellStep[]): ShellStep[] {
  return steps.map((s) => ({
    ...s,
    metrics: {
      gap: s.gap > 0 ? String(s.gap) : '—',
      i: s.i >= 0 ? String(s.i) : '—',
      key: s.key >= 0 ? String(s.key) : '—',
      'comp-shift': `${s.comparisons} / ${s.shifts}`,
      action: s.gap > 0 ? `当前增量 gap = ${s.gap}` : 'gap = gap / 2',
    },
  }));
}

export function renderShellSortCanvas(container: HTMLElement, step: ShellStep): void {
  const { array, gap, i, key, j, phase } = step;

  const maxVal = Math.max(...array, key, 1);
  const barsHtml = array
    .map((val, idx) => {
      const isKey = idx === i && phase === 'pick-key';
      const isGapPartner = j >= gap && idx === j - gap && phase === 'compare';
      const isShifting = idx === j && phase === 'shift';
      const isSorted = phase === 'done';

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
      } else if (isGapPartner) {
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
  id: 'shell-sort',
  name: '希尔排序',
  category: 'sort',
  description: '逐步演示希尔排序：缩小增量 gap，跨步插入排序',
  icon: '🐚',
  difficulty: 2,
  levelOrder: 4,
  learningGoal: '理解希尔排序的跨步插入和缩小增量过程',
  inputs: [
    {
      id: 'array',
      label: '输入数组',
      type: 'text',
      defaultValue: '9, 8, 3, 7, 5, 6, 4, 1',
      placeholder: '逗号分隔数字',
    },
  ],
  presets: [
    { label: '基础示例', values: { array: '9, 8, 3, 7, 5, 6, 4, 1' } },
    { label: '近有序', values: { array: '1, 3, 2, 5, 4, 7, 6' } },
    { label: '逆序最坏情形', values: { array: '10, 9, 8, 7, 6, 5, 4' } },
    { label: '含重复元素', values: { array: '5, 2, 5, 1, 2' } },
  ],
  metrics: [
    { id: 'gap', label: '当前增量 gap', color: '#2563eb' },
    { id: 'i', label: '当前索引 i', color: '#0f172a' },
    { id: 'key', label: '待插 key', color: '#eab308' },
    { id: 'comp-shift', label: '比较 / 后移', color: '#f59e0b' },
    { id: 'action', label: '增量策略', color: '#2563eb' },
  ],
  legend: [
    { label: '待插 key', color: '#eab308' },
    { label: 'gap跨度比对', color: '#3b82f6' },
    { label: 'gap后移搬移', color: '#ef4444' },
    { label: '最终就位', color: '#22c55e' },
  ],
  codeLanguages: SHELL_SORT_CODE_LANGUAGES,
  problemHtml: SHELL_SORT_PROBLEM_HTML,
  analysisHtml: SHELL_SORT_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(shellSortSteps(parseArray(String(inputs.array ?? '9, 8, 3, 7, 5, 6, 4, 1')))),
  renderCanvas: (container, step) => renderShellSortCanvas(container, step as ShellStep),
});
