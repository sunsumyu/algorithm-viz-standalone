/**
 * 区间和（前缀和）可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * KamaCoder 58：一维前缀和预处理与 O(1) 差分查询
 * 遵循 Zero-Subbox 规范，扁平双轨沙盘
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import { ArrayTrackAdapter } from '../../../core/renderers/adapters/array-track-adapter';
import {
  RANGE_SUM_PROBLEM_HTML,
  RANGE_SUM_ANALYSIS_HTML,
  RANGE_SUM_CODE_LANGUAGES,
} from './range-sum-problem-content';

export interface RSumStep {
  arr: number[];
  prefix: number[];
  queries: [number, number][];
  qIndex: number;
  phase: 'build' | 'query';
  i: number;
  L: number;
  R: number;
  sum: number;
  results: number[];
  status: 'init' | 'build-prefix' | 'query-start' | 'compute' | 'query-done' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function parseRangeArray(input: string): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return arr.length > 0 ? arr : [1, 2, 3, 4, 5];
}

export function parseQueries(input: string): [number, number][] {
  const parts = input.split(/[|；;]+/).map((s) => s.trim()).filter(Boolean);
  const res: [number, number][] = [];
  for (const p of parts) {
    const [lStr, rStr] = p.split(/[,，\s]+/);
    const l = parseInt(lStr, 10);
    const r = parseInt(rStr, 10);
    if (Number.isFinite(l) && Number.isFinite(r)) {
      res.push([Math.min(l, r), Math.max(l, r)]);
    }
  }
  return res.length > 0 ? res : [[0, 2], [1, 3], [2, 4]];
}

export function buildRangeSumSteps(arr: number[], queries: [number, number][]): RSumStep[] {
  const steps: RSumStep[] = [];
  const n = arr.length;
  const prefix: number[] = new Array(n + 1).fill(0);
  const results: number[] = [];

  // 1. 初始化
  steps.push({
    arr: [...arr],
    prefix: [0],
    queries,
    qIndex: -1,
    phase: 'build',
    i: -1,
    L: -1,
    R: -1,
    sum: 0,
    results: [],
    status: 'init',
    message: `初始化前缀和数组 prefix，设置 prefix[0] = 0 作为虚拟前置元素。`,
    log: `初始化: prefix[0] = 0`,
    codeLine: [3, 4],
  });

  // 2. 构建前缀和数组
  for (let i = 0; i < n; i++) {
    prefix[i + 1] = prefix[i] + arr[i];
    steps.push({
      arr: [...arr],
      prefix: prefix.slice(0, i + 2),
      queries,
      qIndex: -1,
      phase: 'build',
      i,
      L: -1,
      R: -1,
      sum: prefix[i + 1],
      results: [],
      status: 'build-prefix',
      message: `计算前缀和 prefix[${i + 1}] = prefix[${i}] (${prefix[i]}) + arr[${i}] (${arr[i]}) = ${prefix[i + 1]}。`,
      log: `构建前缀和: prefix[${i + 1}] = ${prefix[i + 1]}`,
      codeLine: [5, 6],
    });
  }

  // 3. 执行区间查询
  for (let q = 0; q < queries.length; q++) {
    const [L, R] = queries[q];
    const validL = Math.max(0, Math.min(n - 1, L));
    const validR = Math.max(validL, Math.min(n - 1, R));
    const ans = prefix[validR + 1] - prefix[validL];
    results.push(ans);

    steps.push({
      arr: [...arr],
      prefix: [...prefix],
      queries,
      qIndex: q,
      phase: 'query',
      i: -1,
      L: validL,
      R: validR,
      sum: ans,
      results: [...results],
      status: 'compute',
      message: `区间查询 [${validL}, ${validR}]：sum = prefix[${validR + 1}] (${prefix[validR + 1]}) - prefix[${validL}] (${prefix[validL]}) = ${ans}。`,
      log: `查询 [${validL}, ${validR}]: prefix[${validR + 1}] - prefix[${validL}] = ${ans}`,
      codeLine: [8, 9, 10],
    });
  }

  steps.push({
    arr: [...arr],
    prefix: [...prefix],
    queries,
    qIndex: queries.length,
    phase: 'query',
    i: -1,
    L: -1,
    R: -1,
    sum: 0,
    results: [...results],
    status: 'done',
    message: `🎉 所有区间查询计算完毕！最终查询结果序列: [${results.join(', ')}]。`,
    log: `✓ 查询完成: [${results.join(', ')}]`,
    codeLine: 11,
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<RSumStep>({
  id: 'range-sum',
  name: '区间和（前缀和）',
  category: 'array',
  icon: '➕',
  badge: {
    mode: '一维前缀和·O(1)查询',
    complexity: 'O(n+m) · O(n)',
  },
  card1Title: '📊 原始数组与前缀和双轨沙盘',
  card2Title: '🧭 前缀和公式与区间差分监视器',
  card2Desc: '当前查询区间 [L..R]、prefix[R+1] - prefix[L] 与结果列表',
  legend: [
    { label: '查询区间覆盖', color: '#2563eb' },
    { label: '前缀和数组', color: '#0d9488' },
  ],
  inputs: [
    {
      id: 'input-array',
      label: '原始数组',
      type: 'text',
      defaultValue: '1, 2, 3, 4, 5',
      width: '130px',
      placeholder: '1, 2, 3, 4, 5',
    },
    {
      id: 'input-queries',
      label: '查询区间',
      type: 'text',
      defaultValue: '0, 2 | 1, 3 | 2, 4',
      width: '140px',
      placeholder: '0, 2 | 1, 3',
    },
  ],
  presets: [
    { label: '标准示例', values: { 'input-array': '1, 2, 3, 4, 5', 'input-queries': '0, 2 | 1, 3 | 2, 4' } },
    { label: '全区间查询', values: { 'input-array': '10, 20, 30, 40', 'input-queries': '0, 3 | 1, 2' } },
    { label: '单点查询', values: { 'input-array': '5, 8, 12, 15', 'input-queries': '0, 0 | 2, 2 | 3, 3' } },
  ],
  metrics: [
    { id: 'query-range', label: '当前查询区间 [L, R]', color: '#2563eb' },
    { id: 'diff-formula', label: '差分公式计算', color: '#f59e0b' },
    { id: 'query-result', label: '当前区间和', color: '#16a34a' },
  ],
  codeLanguages: RANGE_SUM_CODE_LANGUAGES,
  problemHtml: RANGE_SUM_PROBLEM_HTML,
  analysisHtml: RANGE_SUM_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const rawArr = inputs['input-array'] || '1, 2, 3, 4, 5';
    const rawQ = inputs['input-queries'] || '0, 2 | 1, 3 | 2, 4';
    const arr = parseRangeArray(rawArr);
    const queries = parseQueries(rawQ);
    return buildRangeSumSteps(arr, queries);
  },
  renderCanvas: (container, step) => {
    const isQuery = step.phase === 'query' && step.L >= 0;

    ArrayTrackAdapter.renderTrack(container, {
      array: step.arr,
      windowRange: isQuery ? { left: step.L, right: step.R, color: '#3b82f6' } : undefined,
      primaryTitle: '📊 原始数组 (nums):',
      secondaryArray: step.prefix,
      secondaryTitle: '📦 前缀和数组 (prefix):',
    });

    const root = container.closest('#algo-range-sum-view');
    if (root) {
      const qRangeEl = root.querySelector('#metric-query-range');
      const formulaEl = root.querySelector('#metric-diff-formula');
      const resEl = root.querySelector('#metric-query-result');

      if (qRangeEl) qRangeEl.textContent = isQuery ? `[${step.L}, ${step.R}]` : step.phase === 'build' ? '构建前缀和中' : '完成';
      if (formulaEl) {
        formulaEl.textContent = isQuery ? `prefix[${step.R + 1}] - prefix[${step.L}]` : '—';
      }
      if (resEl) resEl.textContent = isQuery ? `${step.sum}` : step.status === 'done' ? `共 ${step.results.length} 次查询` : '—';

      // 在 Card 2 中展示查询结果序列
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const resultsChips = step.results.map((ans, idx) => `<span style="padding: 1px 6px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; border-radius: 4px; font-size: 10.5px; font-family: monospace;">Q${idx + 1}: ${ans}</span>`).join(' ') || '<span style="color:#94a3b8; font-size:10.5px; font-style:italic;">等待执行查询...</span>';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 4px; padding: 4px 0;">
            <span style="font-size: 10.5px; font-weight: 700; color: #475569;">已计算查询结果列表:</span>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">${resultsChips}</div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'range-sum',
  name: '区间和（前缀和）',
  viewId: 'algo-range-sum-view',
  category: 'array',
  description: '一维前缀和预处理 O(n)，之后任意区间 [L, R] 求和只需 O(1) 差分计算 prefix[R+1] - prefix[L]',
  icon: '➕',
  template,
  Visualizer,
  difficulty: 1,
  levelOrder: 6,
  learningGoal: '掌握前缀和数组空间换时间核心设计，实现海量静态区间和快速 O(1) 查询',
});
