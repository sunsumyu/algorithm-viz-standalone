/**
 * 基数排序可视化器 — 声明式 4-Card 标准架构
 * LSD 低位优先、按位计数统计与稳定回填
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  RADIX_SORT_PROBLEM_HTML,
  RADIX_SORT_ANALYSIS_HTML,
  RADIX_SORT_CODE_LANGUAGES,
} from './radix-sort-problem-content';
import { parseArray } from './bubble-sort-renderer';

export interface RadixStep {
  array: number[];
  count: number[];
  output: (number | null)[];
  exp: number;
  maxVal: number;
  srcIdx: number;
  digit: number | null;
  outIdx: number;
  curElem: number | null;
  phase: 'init' | 'new-exp' | 'count-digit' | 'prefix-sum' | 'build-out' | 'write-back' | 'done';
  status: 'init' | 'new-exp' | 'count-digit' | 'prefix-sum' | 'build-out' | 'write-back' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function radixSortSteps(input: number[]): RadixStep[] {
  const steps: RadixStep[] = [];
  const array = [...input];
  const n = array.length;

  if (n === 0) {
    steps.push({
      array: [],
      count: new Array(10).fill(0),
      output: [],
      exp: 1,
      maxVal: 0,
      srcIdx: -1,
      digit: null,
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

  const maxVal = Math.max(...array);

  steps.push({
    array: [...array],
    count: new Array(10).fill(0),
    output: new Array(n).fill(null),
    exp: 1,
    maxVal,
    srcIdx: -1,
    digit: null,
    outIdx: -1,
    curElem: null,
    phase: 'init',
    status: 'init',
    message: `初始化基数排序：数组长度 n = ${n}，最大值 max = ${maxVal}，准备从个位 (exp = 1) 开始排序。`,
    log: `初始化: max = ${maxVal}`,
    codeLine: 2,
  });

  if (n <= 1) {
    steps.push({
      array: [...array],
      count: new Array(10).fill(0),
      output: [...array],
      exp: 1,
      maxVal,
      srcIdx: -1,
      digit: null,
      outIdx: -1,
      curElem: null,
      phase: 'done',
      status: 'done',
      message: '✅ 排序完成！',
      log: '排序完成',
      codeLine: 5,
    });
    return steps;
  }

  for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
    const count = new Array(10).fill(0);
    const output: (number | null)[] = new Array(n).fill(null);
    const expName = exp === 1 ? '个位' : exp === 10 ? '十位' : exp === 100 ? '百位' : `${exp}位`;

    steps.push({
      array: [...array],
      count: [...count],
      output: [...output],
      exp,
      maxVal,
      srcIdx: -1,
      digit: null,
      outIdx: -1,
      curElem: null,
      phase: 'new-exp',
      status: 'new-exp',
      message: `进入新权位排序：exp = ${exp} (${expName})。初始化 0..9 计数桶。`,
      log: `权位 exp = ${exp} (${expName})`,
      codeLine: 6,
    });

    // 1. 统计当前位频次
    for (let i = 0; i < n; i++) {
      const val = array[i];
      const d = Math.floor(val / exp) % 10;
      count[d]++;

      steps.push({
        array: [...array],
        count: [...count],
        output: [...output],
        exp,
        maxVal,
        srcIdx: i,
        digit: d,
        outIdx: -1,
        curElem: val,
        phase: 'count-digit',
        status: 'count-digit',
        message: `数位提取：arr[${i}] = ${val}，其 ${expName} 数字为 ${d}，在 count[${d}] 处计数累加至 ${count[d]}。`,
        log: `arr[${i}]=${val} -> ${expName}数位 '${d}' (count[${d}]=${count[d]})`,
        codeLine: 13,
      });
    }

    // 2. 前缀和累加
    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];

      steps.push({
        array: [...array],
        count: [...count],
        output: [...output],
        exp,
        maxVal,
        srcIdx: -1,
        digit: i,
        outIdx: -1,
        curElem: null,
        phase: 'prefix-sum',
        status: 'prefix-sum',
        message: `前缀累加：count[${i}] += count[${i - 1}] = ${count[i]} (表示 ${expName} &le; ${i} 的元素总数)。`,
        log: `前缀和 count[${i}] = ${count[i]}`,
        codeLine: 14,
      });
    }

    // 3. 倒序稳定回填
    for (let i = n - 1; i >= 0; i--) {
      const val = array[i];
      const d = Math.floor(val / exp) % 10;
      count[d]--;
      const outIdx = count[d];
      output[outIdx] = val;

      steps.push({
        array: [...array],
        count: [...count],
        output: [...output],
        exp,
        maxVal,
        srcIdx: i,
        digit: d,
        outIdx,
        curElem: val,
        phase: 'build-out',
        status: 'build-out',
        message: `稳定回填：arr[${i}] = ${val} (${expName}数位 ${d})，目标下标为 --count[${d}] = ${outIdx}，写入 output[${outIdx}]。`,
        log: `回填: ${val} -> output[${outIdx}]`,
        codeLine: [15, 16, 17],
      });
    }

    // 4. 写回原数组
    for (let i = 0; i < n; i++) {
      array[i] = output[i] as number;
    }

    steps.push({
      array: [...array],
      count: [...count],
      output: [...output],
      exp,
      maxVal,
      srcIdx: -1,
      digit: null,
      outIdx: -1,
      curElem: null,
      phase: 'write-back',
      status: 'write-back',
      message: `${expName} (exp = ${exp}) 计数排序完毕，写回原数组。当前数组已按低 ${expName} 有序。`,
      log: `${expName} 排序完成并写回原数组`,
      codeLine: 19,
    });
  }

  steps.push({
    array: [...array],
    count: new Array(10).fill(0),
    output: [...array],
    exp: 0,
    maxVal,
    srcIdx: -1,
    digit: null,
    outIdx: -1,
    curElem: null,
    phase: 'done',
    status: 'done',
    message: `🎉 基数排序完成！最终排序结果：[${array.join(', ')}]。`,
    log: `✓ 排序完成: [${array.join(', ')}]`,
    codeLine: 8,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: RadixStep[]): RadixStep[] {
  return steps.map((s) => {
    const expName =
      s.exp === 1 ? '1 (个位)' : s.exp === 10 ? '10 (十位)' : s.exp === 100 ? '100 (百位)' : s.exp > 0 ? `${s.exp}` : '—';

    let action = 'digit = (x / exp) % 10';
    if (s.phase === 'count-digit' && s.digit !== null) action = `count[(${s.curElem} / ${s.exp}) % 10] = count[${s.digit}]++ (${s.count[s.digit]})`;
    else if (s.phase === 'prefix-sum' && s.digit !== null) action = `count[${s.digit}] += count[${s.digit - 1}] = ${s.count[s.digit]}`;
    else if (s.phase === 'build-out') action = `output[--count[${s.digit}]] = output[${s.outIdx}] = ${s.curElem}`;
    else if (s.phase === 'write-back') action = '写回原数组 (当前权位就绪)';
    else if (s.phase === 'done') action = '基数排序完成';

    return {
      ...s,
      metrics: {
        exp: expName,
        'max-val': String(s.maxVal),
        'cur-elem': s.curElem !== null ? `${s.curElem} (d='${s.digit}')` : '—',
        'out-idx': s.outIdx >= 0 ? `${s.outIdx}` : '—',
        action,
      },
    };
  });
}

const CELL_BASE =
  'min-width: 34px; height: 32px; padding: 0 4px; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: \'JetBrains Mono\', monospace; font-size: 11.5px; font-weight: 800; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-sizing: border-box;';

function rxCell(val: string, sub: string, bg: string, border: string, color: string, extraStyle = ''): string {
  return `
    <div style="${CELL_BASE} background: ${bg}; border: 1.5px solid ${border}; color: ${color}; ${extraStyle}">
      <span>${val}</span>
      <span style="font-size: 8.5px; font-weight: 600; color: #94a3b8;">${sub}</span>
    </div>
  `;
}

export function renderRadixSortCanvas(container: HTMLElement, step: RadixStep): void {
  const { array, count, output, exp, srcIdx, digit, outIdx, phase } = step;

  const srcHtml = array
    .map((val, idx) => {
      const isActive = idx === srcIdx && phase !== 'done';
      const d = exp > 0 ? Math.floor(val / exp) % 10 : 0;
      return rxCell(
        String(val),
        exp > 0 ? `d=${d}` : `[${idx}]`,
        isActive ? '#eff6ff' : '#ffffff',
        isActive ? '#3b82f6' : '#cbd5e1',
        '#0f172a',
      );
    })
    .join('');

  const countHtml = count
    .map((freq, idx) => {
      const isActive = idx === digit && phase !== 'done';
      return rxCell(String(freq), `[${idx}]`, isActive ? '#faf5ff' : '#ffffff', isActive ? '#a855f7' : '#cbd5e1', '#0f172a');
    })
    .join('');

  const outHtml = output
    .map((val, idx) => {
      const isFilled = val !== null;
      const isCurrentTarget = idx === outIdx && phase === 'build-out';
      return rxCell(
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
        <div style="font-size: 10px; font-weight: 700; color: #64748b;">原数组 arr (下划线高亮当前 exp 位):</div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; flex-wrap: wrap;">${srcHtml}</div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <div style="font-size: 10px; font-weight: 700; color: #64748b;">10 进制数位计数表 count[0..9]:</div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; flex-wrap: wrap;">${countHtml}</div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <div style="font-size: 10px; font-weight: 700; color: #64748b;">当前轮次排序输出 output:</div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; flex-wrap: wrap;">${outHtml}</div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'radix-sort',
  name: '基数排序',
  category: 'sort',
  description: '逐步演示基数排序：LSD低位优先、按位计数排序与稳定收集',
  icon: '🎯',
  difficulty: 2,
  levelOrder: 10,
  learningGoal: '掌握基数排序的按位切分、桶分配与稳定收集过程',
  inputs: [
    {
      id: 'array',
      label: '输入数组',
      type: 'text',
      defaultValue: '170, 45, 75, 90, 802, 24, 2, 66',
      placeholder: '逗号分隔非负整数',
    },
  ],
  presets: [
    { label: '基础示例', values: { array: '170, 45, 75, 90, 802, 24, 2, 66' } },
    { label: '单位数', values: { array: '5, 3, 9, 1, 7' } },
    { label: '宽位数差异', values: { array: '1, 22, 333, 4, 5555, 66' } },
    { label: '含重复数字', values: { array: '12, 21, 12, 21, 11' } },
  ],
  metrics: [
    { id: 'exp', label: '当前权位 exp', color: '#2563eb' },
    { id: 'max-val', label: '最大值 max', color: '#0f172a' },
    { id: 'cur-elem', label: '当前元素 (数位)', color: '#a855f7' },
    { id: 'out-idx', label: '输出下标', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '当前元素', color: '#3b82f6' },
    { label: '数位桶统计', color: '#a855f7' },
    { label: '输出回填', color: '#22c55e' },
  ],
  codeLanguages: RADIX_SORT_CODE_LANGUAGES,
  problemHtml: RADIX_SORT_PROBLEM_HTML,
  analysisHtml: RADIX_SORT_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(radixSortSteps(parseArray(String(inputs.array ?? '170, 45, 75, 90, 802, 24, 2, 66')))),
  renderCanvas: (container, step) => renderRadixSortCanvas(container, step as RadixStep),
});
