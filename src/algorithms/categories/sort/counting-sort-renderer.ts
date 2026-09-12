/**
 * 计数排序可视化器 — 声明式 4-Card 标准架构
 * 统计频次、前缀和累加、倒序稳定回填
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  COUNTING_SORT_PROBLEM_HTML,
  COUNTING_SORT_ANALYSIS_HTML,
  COUNTING_SORT_CODE_LANGUAGES,
} from './counting-sort-problem-content';
import { parseArray } from './bubble-sort-renderer';

export interface CSStep {
  array: number[];
  count: number[];
  output: (number | null)[];
  minVal: number;
  maxVal: number;
  k: number;
  srcIdx: number;
  countIdx: number;
  outIdx: number;
  curElem: number | null;
  phase: 'init' | 'find-minmax' | 'count-freq' | 'prefix-sum' | 'build-out' | 'done';
  status: 'init' | 'find-minmax' | 'count-freq' | 'prefix-sum' | 'build-out' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function countingSortSteps(input: number[]): CSStep[] {
  const steps: CSStep[] = [];
  const array = [...input];
  const n = array.length;

  if (n === 0) {
    steps.push({
      array: [],
      count: [],
      output: [],
      minVal: 0,
      maxVal: 0,
      k: 0,
      srcIdx: -1,
      countIdx: -1,
      outIdx: -1,
      curElem: null,
      phase: 'done',
      status: 'done',
      message: '数组为空，无需排序。',
      log: '空数组',
      codeLine: 2,
    });
    return steps;
  }

  const minVal = Math.min(...array);
  const maxVal = Math.max(...array);
  const k = maxVal - minVal + 1;
  const count = new Array(k).fill(0);
  const output: (number | null)[] = new Array(n).fill(null);

  steps.push({
    array: [...array],
    count: [...count],
    output: [...output],
    minVal,
    maxVal,
    k,
    srcIdx: -1,
    countIdx: -1,
    outIdx: -1,
    curElem: null,
    phase: 'find-minmax',
    status: 'find-minmax',
    message: `扫描极值：min = ${minVal}, max = ${maxVal}，值域跨度 k = ${k}。创建长度为 ${k} 的计数数组。`,
    log: `极值范围 [${minVal}..${maxVal}], k = ${k}`,
    codeLine: [3, 4, 5, 6, 7, 8, 9],
  });

  // 1. 统计频次
  for (let i = 0; i < n; i++) {
    const val = array[i];
    const cIdx = val - minVal;
    count[cIdx]++;

    steps.push({
      array: [...array],
      count: [...count],
      output: [...output],
      minVal,
      maxVal,
      k,
      srcIdx: i,
      countIdx: cIdx,
      outIdx: -1,
      curElem: val,
      phase: 'count-freq',
      status: 'count-freq',
      message: `频次统计：读取 arr[${i}] = ${val}，在 count[${val} - ${minVal}] (${cIdx}) 处计数累加至 ${count[cIdx]}。`,
      log: `统计 val=${val} -> count[${cIdx}]=${count[cIdx]}`,
      codeLine: 10,
    });
  }

  // 2. 前缀和累加
  for (let i = 1; i < k; i++) {
    count[i] += count[i - 1];

    steps.push({
      array: [...array],
      count: [...count],
      output: [...output],
      minVal,
      maxVal,
      k,
      srcIdx: -1,
      countIdx: i,
      outIdx: -1,
      curElem: null,
      phase: 'prefix-sum',
      status: 'prefix-sum',
      message: `前缀和累加：count[${i}] += count[${i - 1}] = ${count[i]} (表示 &le; ${i + minVal} 的元素总数)。`,
      log: `前缀和: count[${i}] = ${count[i]}`,
      codeLine: 11,
    });
  }

  // 3. 倒序稳定回填
  for (let i = n - 1; i >= 0; i--) {
    const val = array[i];
    const cIdx = val - minVal;
    count[cIdx]--;
    const outIdx = count[cIdx];
    output[outIdx] = val;

    steps.push({
      array: [...array],
      count: [...count],
      output: [...output],
      minVal,
      maxVal,
      k,
      srcIdx: i,
      countIdx: cIdx,
      outIdx,
      curElem: val,
      phase: 'build-out',
      status: 'build-out',
      message: `稳定回填：读取 arr[${i}] = ${val}，目标下标为 --count[${cIdx}] = ${outIdx}，写入 output[${outIdx}] = ${val}。`,
      log: `回填: arr[${i}]=${val} -> output[${outIdx}]`,
      codeLine: [13, 14, 15],
    });
  }

  steps.push({
    array: [...array],
    count: [...count],
    output: [...output],
    minVal,
    maxVal,
    k,
    srcIdx: -1,
    countIdx: -1,
    outIdx: -1,
    curElem: null,
    phase: 'done',
    status: 'done',
    message: `🎉 计数排序完成！输出结果：[${output.join(', ')}]。`,
    log: `✓ 排序完成: [${output.join(', ')}]`,
    codeLine: 16,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: CSStep[]): CSStep[] {
  return steps.map((s) => {
    let action = 'output[--count[x - min]] = x';
    if (s.phase === 'count-freq') action = `count[${s.curElem} - ${s.minVal}]++ (${s.count[s.countIdx]})`;
    else if (s.phase === 'prefix-sum') action = `count[${s.countIdx}] += count[${s.countIdx - 1}] = ${s.count[s.countIdx]}`;
    else if (s.phase === 'build-out') action = `output[--count[${s.curElem} - ${s.minVal}]] = ${s.curElem}`;
    else if (s.phase === 'done') action = '计数排序完成';

    return {
      ...s,
      metrics: {
        range: `[${s.minVal}, ${s.maxVal}]`,
        k: String(s.k),
        'cur-elem': s.curElem !== null ? `${s.curElem}` : '—',
        'out-idx': s.outIdx >= 0 ? `${s.outIdx}` : '—',
        action,
      },
    };
  });
}

const CELL_BASE =
  'min-width: 32px; height: 32px; padding: 0 4px; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: \'JetBrains Mono\', monospace; font-size: 11.5px; font-weight: 800; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-sizing: border-box;';

function cellBox(val: string, sub: string, bg: string, border: string, color: string, extraStyle = ''): string {
  return `
    <div style="${CELL_BASE} background: ${bg}; border: 1.5px solid ${border}; color: ${color}; ${extraStyle}">
      <span>${val}</span>
      <span style="font-size: 8.5px; font-weight: 600; color: #94a3b8;">${sub}</span>
    </div>
  `;
}

export function renderCountingSortCanvas(container: HTMLElement, step: CSStep): void {
  const { array, count, output, minVal, srcIdx, countIdx, outIdx, phase } = step;

  const srcHtml = array
    .map((val, idx) => {
      const isActive = idx === srcIdx && phase !== 'done';
      return cellBox(String(val), `[${idx}]`, isActive ? '#eff6ff' : '#ffffff', isActive ? '#3b82f6' : '#cbd5e1', '#0f172a');
    })
    .join('');

  const countHtml = count
    .map((freq, idx) => {
      const isActive = idx === countIdx && phase !== 'done';
      return cellBox(String(freq), `${idx + minVal}`, isActive ? '#fef9c3' : '#ffffff', isActive ? '#eab308' : '#cbd5e1', '#0f172a');
    })
    .join('');

  const outHtml = output
    .map((val, idx) => {
      const isFilled = val !== null;
      const isCurrentTarget = idx === outIdx && phase === 'build-out';
      return cellBox(
        val !== null ? String(val) : '—',
        `[${idx}]`,
        isFilled ? '#f0fdf4' : '#ffffff',
        isFilled ? '#22c55e' : '#cbd5e1',
        '#0f172a',
        isCurrentTarget ? 'box-shadow: 0 0 0 2px rgba(16,185,129,0.5); transform: scale(1.08);' : '',
      );
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 14px; padding: 16px 12px; box-sizing: border-box; overflow-y: auto;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <div style="font-size: 10px; font-weight: 700; color: #64748b;">原输入数组 arr:</div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; flex-wrap: wrap;">${srcHtml}</div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <div style="font-size: 10px; font-weight: 700; color: #64748b;">计数/前缀和数组 count:</div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; flex-wrap: wrap;">${countHtml}</div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <div style="font-size: 10px; font-weight: 700; color: #64748b;">排序输出数组 output:</div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; flex-wrap: wrap;">${outHtml}</div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'counting-sort',
  name: '计数排序',
  category: 'sort',
  description: '逐步演示计数排序：统计频次、前缀和累加、倒序稳定输出',
  icon: '🔢',
  difficulty: 1,
  levelOrder: 8,
  learningGoal: '理解非比较排序思想、计数数组与前缀和定位原理',
  inputs: [
    {
      id: 'array',
      label: '输入数组',
      type: 'text',
      defaultValue: '4, 2, 2, 8, 3, 3, 1',
      placeholder: '逗号分隔非负整数',
    },
  ],
  presets: [
    { label: '基础示例', values: { array: '4, 2, 2, 8, 3, 3, 1' } },
    { label: '窄值域密集重复', values: { array: '1, 1, 2, 2, 1, 2, 1' } },
    { label: '含较大值域跳跃', values: { array: '1, 5, 9, 3, 5, 9, 1' } },
    { label: '已有序', values: { array: '1, 2, 3, 4, 5, 6' } },
  ],
  metrics: [
    { id: 'range', label: '值域范围', color: '#2563eb' },
    { id: 'k', label: '值域跨度 k', color: '#0f172a' },
    { id: 'cur-elem', label: '当前元素', color: '#3b82f6' },
    { id: 'out-idx', label: '输出下标', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '当前原项', color: '#3b82f6' },
    { label: '计数统计', color: '#eab308' },
    { label: '输出就位', color: '#22c55e' },
  ],
  codeLanguages: COUNTING_SORT_CODE_LANGUAGES,
  problemHtml: COUNTING_SORT_PROBLEM_HTML,
  analysisHtml: COUNTING_SORT_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(countingSortSteps(parseArray(String(inputs.array ?? '4, 2, 2, 8, 3, 3, 1')))),
  renderCanvas: (container, step) => renderCountingSortCanvas(container, step as CSStep),
});
