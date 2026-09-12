/**
 * 归并排序可视化器 — 声明式 4-Card 标准架构
 * 递归分治、双指针归并、临时缓冲区与写回
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  MERGE_SORT_PROBLEM_HTML,
  MERGE_SORT_ANALYSIS_HTML,
  MERGE_SORT_CODE_LANGUAGES,
} from './merge-sort-problem-content';
import { parseArray } from './bubble-sort-renderer';

export interface MSStep {
  array: number[];
  temp: (number | null)[];
  left: number;
  mid: number;
  right: number;
  p1: number;
  p2: number;
  t: number;
  comparisons: number;
  copies: number;
  phase: 'init' | 'divide' | 'compare' | 'take-left' | 'take-right' | 'copy-back' | 'done';
  status: 'init' | 'divide' | 'compare' | 'take-left' | 'take-right' | 'copy-back' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function mergeSortSteps(input: number[]): MSStep[] {
  const steps: MSStep[] = [];
  const array = [...input];
  const n = array.length;
  const temp: (number | null)[] = new Array(n).fill(null);
  let comparisons = 0;
  let copies = 0;

  steps.push({
    array: [...array],
    temp: [...temp],
    left: -1,
    mid: -1,
    right: -1,
    p1: -1,
    p2: -1,
    t: -1,
    comparisons: 0,
    copies: 0,
    phase: 'init',
    status: 'init',
    message: n === 0 ? '数组为空，无需排序。' : `初始化归并排序：数组长度 n = ${n}，准备进行分治递归。`,
    log: n === 0 ? '空数组' : `初始化: [${array.join(', ')}]`,
    codeLine: 2,
  });

  if (n <= 1) {
    steps.push({
      array: [...array],
      temp: [...temp],
      left: 0,
      mid: 0,
      right: 0,
      p1: -1,
      p2: -1,
      t: -1,
      comparisons: 0,
      copies: 0,
      phase: 'done',
      status: 'done',
      message: '✅ 排序完成！',
      log: '排序完成',
      codeLine: 6,
    });
    return steps;
  }

  const sort = (l: number, r: number) => {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);

    steps.push({
      array: [...array],
      temp: [...temp],
      left: l,
      mid: m,
      right: r,
      p1: -1,
      p2: -1,
      t: -1,
      comparisons,
      copies,
      phase: 'divide',
      status: 'divide',
      message: `分治拆解：划分区间 [${l}..${r}] 为左半段 [${l}..${m}] 和右半段 [${m + 1}..${r}]。`,
      log: `Divide: [${l}..${r}] -> [${l}..${m}] + [${m + 1}..${r}]`,
      codeLine: [3, 4, 5],
    });

    sort(l, m);
    sort(m + 1, r);
    merge(l, m, r);
  };

  const merge = (l: number, m: number, r: number) => {
    let p1 = l;
    let p2 = m + 1;
    let t = l;

    // 清空当前区间的 temp
    for (let k = l; k <= r; k++) temp[k] = null;

    while (p1 <= m && p2 <= r) {
      comparisons++;
      const pickLeft = array[p1] <= array[p2];

      steps.push({
        array: [...array],
        temp: [...temp],
        left: l,
        mid: m,
        right: r,
        p1,
        p2,
        t,
        comparisons,
        copies,
        phase: 'compare',
        status: 'compare',
        message: `比较双指针元素：arr[${p1}] (${array[p1]}) vs arr[${p2}] (${array[p2]})${
          pickLeft ? '，左侧较小' : '，右侧较小'
        }。`,
        log: `比较: arr[${p1}] (${array[p1]}) vs arr[${p2}] (${array[p2]})`,
        codeLine: 11,
      });

      if (pickLeft) {
        temp[t] = array[p1];
        steps.push({
          array: [...array],
          temp: [...temp],
          left: l,
          mid: m,
          right: r,
          p1,
          p2,
          t,
          comparisons,
          copies,
          phase: 'take-left',
          status: 'take-left',
          message: `选取左段元素：temp[${t}] = arr[${p1}] (${array[p1]})，p1 向右移动。`,
          log: `temp[${t}] = arr[${p1}] (${array[p1]})`,
          codeLine: 12,
        });
        p1++;
      } else {
        temp[t] = array[p2];
        steps.push({
          array: [...array],
          temp: [...temp],
          left: l,
          mid: m,
          right: r,
          p1,
          p2,
          t,
          comparisons,
          copies,
          phase: 'take-right',
          status: 'take-right',
          message: `选取右段元素：temp[${t}] = arr[${p2}] (${array[p2]})，p2 向右移动。`,
          log: `temp[${t}] = arr[${p2}] (${array[p2]})`,
          codeLine: 13,
        });
        p2++;
      }
      t++;
    }

    while (p1 <= m) {
      temp[t] = array[p1];
      steps.push({
        array: [...array],
        temp: [...temp],
        left: l,
        mid: m,
        right: r,
        p1,
        p2,
        t,
        comparisons,
        copies,
        phase: 'take-left',
        status: 'take-left',
        message: `左段剩余补齐：temp[${t}] = arr[${p1}] (${array[p1]})。`,
        log: `补齐左段: temp[${t}] = ${array[p1]}`,
        codeLine: 15,
      });
      p1++;
      t++;
    }

    while (p2 <= r) {
      temp[t] = array[p2];
      steps.push({
        array: [...array],
        temp: [...temp],
        left: l,
        mid: m,
        right: r,
        p1,
        p2,
        t,
        comparisons,
        copies,
        phase: 'take-right',
        status: 'take-right',
        message: `右段剩余补齐：temp[${t}] = arr[${p2}] (${array[p2]})。`,
        log: `补齐右段: temp[${t}] = ${array[p2]}`,
        codeLine: 16,
      });
      p2++;
      t++;
    }

    // 写回原数组
    for (let k = l; k <= r; k++) {
      array[k] = temp[k] as number;
      copies++;
    }

    steps.push({
      array: [...array],
      temp: [...temp],
      left: l,
      mid: m,
      right: r,
      p1: -1,
      p2: -1,
      t: -1,
      comparisons,
      copies,
      phase: 'copy-back',
      status: 'copy-back',
      message: `区间 [${l}..${r}] 归并完成并回填原数组！该区间已完全有序。`,
      log: `Merge 完成: [${l}..${r}] 写回原数组`,
      codeLine: 17,
    });
  };

  sort(0, n - 1);

  steps.push({
    array: [...array],
    temp: new Array(n).fill(null),
    left: 0,
    mid: Math.floor((n - 1) / 2),
    right: n - 1,
    p1: -1,
    p2: -1,
    t: -1,
    comparisons,
    copies,
    phase: 'done',
    status: 'done',
    message: `🎉 归并排序完成！共比较 ${comparisons} 次，回填 ${copies} 次。最终数组：[${array.join(', ')}]。`,
    log: `✓ 排序完成: [${array.join(', ')}]`,
    codeLine: 6,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: MSStep[]): MSStep[] {
  return steps.map((s) => {
    let action = 'merge(left, mid, right)';
    if (s.phase === 'divide') action = `mid = (${s.left} + ${s.right}) / 2 = ${s.mid}`;
    else if (s.phase === 'compare') {
      action = `arr[${s.p1}] (${s.array[s.p1]}) ${
        s.array[s.p1] <= s.array[s.p2] ? '<=' : '>'
      } arr[${s.p2}] (${s.array[s.p2]})`;
    } else if (s.phase === 'copy-back') action = `copyBack(temp[${s.left}..${s.right}] -> arr)`;
    else if (s.phase === 'done') action = '归并排序完成';

    return {
      ...s,
      metrics: {
        range: s.left >= 0 && s.right >= 0 ? `[${s.left}, ${s.mid}, ${s.right}]` : '—',
        p1: s.p1 >= 0 ? `${s.p1} (${s.array[s.p1]})` : '—',
        p2: s.p2 >= 0 ? `${s.p2} (${s.array[s.p2]})` : '—',
        'comp-copy': `${s.comparisons} / ${s.copies}`,
        action,
      },
    };
  });
}

const CELL_BASE =
  'width: 38px; height: 38px; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: \'JetBrains Mono\', monospace; font-size: 13px; font-weight: 800; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-sizing: border-box;';

function msCell(val: string, idx: string, bg: string, border: string, color: string): string {
  return `
    <div style="${CELL_BASE} background: ${bg}; border: 1.5px solid ${border}; color: ${color};">
      <span>${val}</span>
      <span style="font-size: 8.5px; font-weight: 600; color: #94a3b8;">${idx}</span>
    </div>
  `;
}

export function renderMergeSortCanvas(container: HTMLElement, step: MSStep): void {
  const { array, temp, left, mid, right, p1, p2, phase } = step;

  const mainHtml = array
    .map((val, idx) => {
      const inLeftSeg = left >= 0 && mid >= 0 && idx >= left && idx <= mid;
      const inRightSeg = mid >= 0 && right >= 0 && idx > mid && idx <= right;
      const isP1 = idx === p1;
      const isP2 = idx === p2;
      const isCopiedBack = phase === 'copy-back' && idx >= left && idx <= right;

      if (isCopiedBack) return msCell(String(val), `${idx}`, '#faf5ff', '#a855f7', '#7e22ce');
      if (isP1) return msCell(String(val), `${idx}`, '#eff6ff', '#3b82f6', '#1d4ed8');
      if (isP2) return msCell(String(val), `${idx}`, '#faf5ff', '#a855f7', '#7e22ce');
      if (inLeftSeg) return msCell(String(val), `${idx}`, '#eff6ff', '#93c5fd', '#1e40af');
      if (inRightSeg) return msCell(String(val), `${idx}`, '#faf5ff', '#d8b4fe', '#6b21a8');
      return msCell(String(val), `${idx}`, '#ffffff', '#cbd5e1', '#0f172a');
    })
    .join('');

  const tempHtml = temp
    .map((val, idx) =>
      val !== null
        ? msCell(String(val), `${idx}`, '#f0fdf4', '#22c55e', '#15803d')
        : msCell('—', `${idx}`, '#ffffff', '#cbd5e1', '#cbd5e1'),
    )
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 14px; padding: 16px 12px; box-sizing: border-box; overflow-y: auto;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <div style="font-size: 10px; font-weight: 700; color: #64748b;">原数组 arr (分治区间 [L..R]):</div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; flex-wrap: wrap;">${mainHtml}</div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <div style="font-size: 10px; font-weight: 700; color: #64748b;">辅助 temp 归并缓冲区:</div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; flex-wrap: wrap;">${tempHtml}</div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'merge-sort',
  name: '归并排序',
  category: 'sort',
  description: '逐步演示归并排序：递归分治、双指针合并',
  icon: '🧩',
  difficulty: 2,
  levelOrder: 5,
  learningGoal: '掌握分治思想和双指针有序归并的过程',
  inputs: [
    {
      id: 'array',
      label: '输入数组',
      type: 'text',
      defaultValue: '38, 27, 43, 3, 9, 82, 10',
      placeholder: '逗号分隔数字',
    },
  ],
  presets: [
    { label: '基础示例', values: { array: '38, 27, 43, 3, 9, 82, 10' } },
    { label: '近有序', values: { array: '1, 3, 2, 5, 4, 7, 6' } },
    { label: '逆序最坏情形', values: { array: '9, 8, 7, 6, 5, 4, 3' } },
    { label: '含重复元素', values: { array: '5, 2, 5, 1, 2, 5' } },
  ],
  metrics: [
    { id: 'range', label: '分治区间 [L, M, R]', color: '#2563eb' },
    { id: 'p1', label: '左段指针 p1', color: '#3b82f6' },
    { id: 'p2', label: '右段指针 p2', color: '#a855f7' },
    { id: 'comp-copy', label: '比较 / 回填', color: '#f59e0b' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '左段 p1', color: '#3b82f6' },
    { label: '右段 p2', color: '#a855f7' },
    { label: '归并缓冲区', color: '#22c55e' },
  ],
  codeLanguages: MERGE_SORT_CODE_LANGUAGES,
  problemHtml: MERGE_SORT_PROBLEM_HTML,
  analysisHtml: MERGE_SORT_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(mergeSortSteps(parseArray(String(inputs.array ?? '38, 27, 43, 3, 9, 82, 10')))),
  renderCanvas: (container, step) => renderMergeSortCanvas(container, step as MSStep),
});
