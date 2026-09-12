/**
 * 数组理论基础可视化器 — 4-Card 标准现代架构
 * 演示连续内存布局、随机寻址与插入/删除移动元素
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';
import {
  ARRAY_THEORY_PROBLEM_HTML,
  ARRAY_THEORY_ANALYSIS_HTML,
  ARRAY_THEORY_CODE_LANGUAGES,
} from './array-theory-problem-content';

export interface ATStep {
  array: (number | null)[];
  action: 'access' | 'insert' | 'delete' | 'search';
  index: number;
  value: number | null;
  shiftCount: number;
  status:
    | 'init'
    | 'access'
    | 'insert-shift'
    | 'insert-place'
    | 'delete-shift'
    | 'delete-remove'
    | 'search-found'
    | 'search-not-found'
    | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export function buildAccessSteps(idx: number): ATStep[] {
  const arr = [3, 5, 7, 11, 15];
  const i = Math.max(0, Math.min(idx, arr.length - 1));
  const hexAddr = `0x${(0x1000 + i * 4).toString(16).toUpperCase()}`;

  const lines = {
    init: { java: 3, cpp: 4, python: 3, javascript: 3 },
    access: { java: 4, cpp: 5, python: 4, javascript: 4 },
    done: { java: 4, cpp: 5, python: 4, javascript: 4 },
  };

  return [
    {
      array: [...arr],
      action: 'access',
      index: -1,
      value: null,
      shiftCount: 0,
      status: 'init',
      message: `初始化连续内存数组 arr = [${arr.join(', ')}]，基地址 Base = 0x1000。`,
      log: `初始化数组: Base = 0x1000`,
      codeLine: lines.init,
    },
    {
      array: [...arr],
      action: 'access',
      index: i,
      value: arr[i],
      shiftCount: 0,
      status: 'access',
      message: `O(1) 随机访问 arr[${i}] = ${arr[i]}：计算物理内存地址 Base + ${i} × 4B = ${hexAddr}，一次寻址直接获取！`,
      log: `访问 arr[${i}] = ${arr[i]}，地址 = ${hexAddr} (O(1))`,
      codeLine: lines.access,
    },
    {
      array: [...arr],
      action: 'access',
      index: i,
      value: arr[i],
      shiftCount: 0,
      status: 'done',
      message: `🎉 访问完成，返回值 = ${arr[i]}。`,
      log: `完成访问: 返回 ${arr[i]}`,
      codeLine: lines.done,
    },
  ];
}

export function buildSearchSteps(arr: number[], target: number): ATStep[] {
  const steps: ATStep[] = [];
  let found = false;

  const lines = {
    init: { java: 7, cpp: 8, python: 7, javascript: 8 },
    check: { java: 8, cpp: 9, python: 8, javascript: 9 },
    found: { java: 9, cpp: 10, python: [9, 10], javascript: 10 },
    notFound: { java: 11, cpp: 12, python: 11, javascript: 12 },
  };

  steps.push({
    array: [...arr],
    action: 'search',
    index: -1,
    value: target,
    shiftCount: 0,
    status: 'init',
    message: `在线性数组 [${arr.join(', ')}] 中搜索目标值 target = ${target}。`,
    log: `开始线性搜索 target = ${target}`,
    codeLine: lines.init,
  });

  for (let i = 0; i < arr.length; i++) {
    const isMatch = arr[i] === target;
    steps.push({
      array: [...arr],
      action: 'search',
      index: i,
      value: target,
      shiftCount: 0,
      status: isMatch ? 'search-found' : 'access',
      message: isMatch
        ? `检查 arr[${i}] = ${target} ✓ 匹配成功！找到目标值下标为 ${i}。`
        : `检查 arr[${i}] = ${arr[i]} ≠ ${target}，继续向后搜索。`,
      log: isMatch ? `找到目标: arr[${i}] == ${target}` : `比对 arr[${i}] != ${target}`,
      codeLine: isMatch ? lines.found : lines.check,
    });
    if (isMatch) {
      found = true;
      break;
    }
  }

  if (!found) {
    steps.push({
      array: [...arr],
      action: 'search',
      index: -1,
      value: target,
      shiftCount: 0,
      status: 'search-not-found',
      message: `遍历完成，数组中不存在元素 ${target}，返回 -1。`,
      log: `未找到目标 ${target}，返回 -1`,
      codeLine: lines.notFound,
    });
  }

  return steps;
}

export function buildInsertSteps(arr: number[], insertIdx: number, value: number): ATStep[] {
  const steps: ATStep[] = [];
  const idx = Math.max(0, Math.min(insertIdx, arr.length));
  const work: (number | null)[] = [...arr, null];

  const lines = {
    init: { java: 14, cpp: 15, python: 14, javascript: 16 },
    shift: { java: [15, 16], cpp: [16, 17], python: [15, 16], javascript: [17, 18] },
    place: { java: 18, cpp: 19, python: 17, javascript: 20 },
    done: { java: 18, cpp: 19, python: 17, javascript: 20 },
  };

  steps.push({
    array: [...work],
    action: 'insert',
    index: -1,
    value,
    shiftCount: 0,
    status: 'init',
    message: `准备在下标 ${idx} 插入元素 ${value}。需要将下标 ${idx} 及其之后的所有元素向后移动一位。`,
    log: `开始插入: 在下标 ${idx} 插入 ${value}`,
    codeLine: lines.init,
  });

  let shifts = 0;
  for (let j = work.length - 1; j > idx; j--) {
    work[j] = work[j - 1];
    shifts++;
    steps.push({
      array: [...work],
      action: 'insert',
      index: j,
      value,
      shiftCount: shifts,
      status: 'insert-shift',
      message: `后移元素：arr[${j}] = arr[${j - 1}] (${work[j - 1]})（累计移动 ${shifts} 个元素）。`,
      log: `后移: arr[${j}] = ${work[j]}`,
      codeLine: lines.shift,
    });
  }

  work[idx] = value;
  steps.push({
    array: [...work],
    action: 'insert',
    index: idx,
    value,
    shiftCount: shifts,
    status: 'insert-place',
    message: `将新元素 ${value} 放入腾出的空位 arr[${idx}]。`,
    log: `放置新值: arr[${idx}] = ${value}`,
    codeLine: lines.place,
  });

  steps.push({
    array: [...work],
    action: 'insert',
    index: idx,
    value,
    shiftCount: shifts,
    status: 'done',
    message: `🎉 插入完成！新数组为 [${work.join(', ')}]，总共移动了 ${shifts} 个元素（O(n)）。`,
    log: `插入完成: 移动次数 ${shifts}`,
    codeLine: lines.done,
  });

  return steps;
}

export function buildDeleteSteps(arr: number[], deleteIdx: number): ATStep[] {
  const steps: ATStep[] = [];
  const idx = Math.max(0, Math.min(deleteIdx, arr.length - 1));
  const work: (number | null)[] = [...arr];

  const lines = {
    init: { java: 21, cpp: 22, python: 20, javascript: 24 },
    shift: { java: [22, 23], cpp: [23, 24], python: [21, 22], javascript: [25, 26] },
    done: { java: 24, cpp: 25, python: 22, javascript: 27 },
  };

  steps.push({
    array: [...work],
    action: 'delete',
    index: idx,
    value: work[idx],
    shiftCount: 0,
    status: 'init',
    message: `准备删除下标 ${idx} 的元素 ${work[idx]}。需要将下标 ${idx + 1} 之后的所有元素向前移动一位。`,
    log: `开始删除: 删除下标 ${idx} 处元素 ${work[idx]}`,
    codeLine: lines.init,
  });

  let shifts = 0;
  for (let j = idx; j < work.length - 1; j++) {
    work[j] = work[j + 1];
    shifts++;
    steps.push({
      array: [...work],
      action: 'delete',
      index: j,
      value: null,
      shiftCount: shifts,
      status: 'delete-shift',
      message: `前移覆盖：arr[${j}] = arr[${j + 1}] (${work[j + 1]})（累计移动 ${shifts} 个元素）。`,
      log: `前移: arr[${j}] = ${work[j]}`,
      codeLine: lines.shift,
    });
  }

  work.pop();
  steps.push({
    array: [...work],
    action: 'delete',
    index: -1,
    value: null,
    shiftCount: shifts,
    status: 'done',
    message: `🎉 删除完成！新数组为 [${work.join(', ')}]，总共移动了 ${shifts} 个元素（O(n)）。`,
    log: `删除完成: 移动次数 ${shifts}`,
    codeLine: lines.done,
  });

  return steps;
}


/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: ATStep[]): ATStep[] {
  const opNames: Record<string, string> = {
    access: '下标访问',
    search: '线性搜索',
    insert: '元素插入',
    delete: '元素删除',
  };
  return steps.map((s) => ({
    ...s,
    metrics: {
      op: opNames[s.action] || s.action,
      comp: s.action === 'access' ? 'O(1)' : 'O(n)',
      addr:
        s.index >= 0
          ? `0x${(0x1000 + s.index * 4).toString(16).toUpperCase()}`
          : '0x1000 + i*4B',
      shifts: `${s.shiftCount} 次`,
      idx: s.index >= 0 ? String(s.index) : 'i',
    },
  }));
}

const CELL_BASE =
  'min-width: 42px; height: 44px; padding: 2px 4px; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: \'JetBrains Mono\', monospace; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-sizing: border-box;';

/** 主视觉：物理内存沙盘（十六进制地址 + 单元格状态） */
export function renderArrayTheoryCanvas(container: HTMLElement, step: ATStep): void {
  const { array, index, status } = step;

  const cellsHtml = array
    .map((num, idx) => {
      const hexAddr = `0x${(0x1000 + idx * 4).toString(16).toUpperCase()}`;
      const isActive = index === idx && status !== 'done';
      const isShifting = status.includes('shift') && index === idx;

      let bg = '#ffffff';
      let border = '#cbd5e1';
      let color = '#0f172a';
      let transform = 'none';
      if (isShifting) {
        bg = '#fef3c7';
        border = '#f59e0b';
        color = '#b45309';
        transform = 'translateY(-3px)';
      } else if (isActive) {
        bg = '#eff6ff';
        border = '#3b82f6';
        color = '#1d4ed8';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
          <span style="font-size: 8.5px; font-family: monospace; color: #2563eb; font-weight: 700;">${hexAddr}</span>
          <div style="${CELL_BASE} background: ${bg}; border: 1.5px solid ${border}; color: ${color}; transform: ${transform};">
            <span style="font-size: 14px; font-weight: 800;">${num !== null ? num : '—'}</span>
            <span style="font-size: 9px; color: #94a3b8;">[${idx}]</span>
          </div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px; box-sizing: border-box; flex-wrap: wrap;">
      ${cellsHtml}
    </div>
  `;
}

registerDeclarativeAlgorithm<ATStep>({
  id: 'array-theory',
  name: '数组理论基础',
  category: 'array',
  description: '数组的内存布局、基本操作和时间复杂度',
  icon: '📖',
  difficulty: 1,
  levelOrder: 0,
  learningGoal: '理解数组的连续内存特性和基本操作',
  modes: [
    { id: 'access', label: '🔍 O(1) 随机访问' },
    { id: 'search', label: '🔎 O(n) 线性搜索' },
    { id: 'insert', label: '✏️ O(n) 插入' },
    { id: 'delete', label: '🗑️ O(n) 删除' },
  ],
  inputs: [
    { id: 'array', label: '演示数组', type: 'text', defaultValue: '3, 5, 7, 11, 15' },
    { id: 'idx', label: '操作下标', type: 'number', defaultValue: '2' },
    { id: 'value', label: '插入值 / 搜索目标', type: 'number', defaultValue: '11' },
  ],
  presets: [
    { label: '访问 arr[2]', values: { array: '3, 5, 7, 11, 15', idx: '2', value: '11' } },
    { label: '搜索 11', values: { array: '3, 5, 7, 11, 15', idx: '2', value: '11' } },
    { label: '下标 1 插入 99', values: { array: '3, 5, 7, 11, 15', idx: '1', value: '99' } },
    { label: '删除下标 2', values: { array: '3, 5, 7, 11, 15', idx: '2', value: '11' } },
  ],
  metrics: [
    { id: 'op', label: '当前操作', color: '#2563eb' },
    { id: 'comp', label: '时间复杂度', color: '#10b981' },
    { id: 'addr', label: '物理地址', color: '#a855f7' },
    { id: 'shifts', label: '元素移动数', color: '#f59e0b' },
    { id: 'idx', label: '寻址下标 i', color: '#2563eb' },
  ],
  legend: [
    { label: '当前操作位', color: '#3b82f6' },
    { label: '搬移中', color: '#f59e0b' },
  ],
  codeLanguages: ARRAY_THEORY_CODE_LANGUAGES,
  problemHtml: ARRAY_THEORY_PROBLEM_HTML,
  analysisHtml: ARRAY_THEORY_ANALYSIS_HTML,
  generateSteps: (inputs, mode) => {
    const parseArr = (raw: string): number[] =>
      String(raw ?? '3, 5, 7, 11, 15')
        .split(/[,，\s]+/)
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
    const arr = parseArr(String(inputs.array ?? '3, 5, 7, 11, 15'));
    const list = arr.length ? arr : [3, 5, 7, 11, 15];
    let idx = parseInt(String(inputs.idx ?? '2'), 10);
    if (!Number.isFinite(idx)) idx = 2;
    let value = parseInt(String(inputs.value ?? '11'), 10);
    if (!Number.isFinite(value)) value = 11;

    switch (mode) {
      case 'search':
        return withMetrics(buildSearchSteps(list, value));
      case 'insert':
        return withMetrics(buildInsertSteps(list, Math.max(0, Math.min(idx, list.length)), value));
      case 'delete':
        return withMetrics(buildDeleteSteps(list, Math.max(0, Math.min(idx, list.length - 1))));
      case 'access':
      default:
        return withMetrics(buildAccessSteps(idx));
    }
  },
  renderCanvas: (container, step) => renderArrayTheoryCanvas(container, step as ATStep),
});
