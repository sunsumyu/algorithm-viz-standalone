/**
 * 区间和（前缀和）可视化器 — 4-Card 标准现代架构
 * KamaCoder 58：一维前缀和预处理与 O(1) 差分查询
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  RANGE_SUM_PROBLEM_HTML,
  RANGE_SUM_ANALYSIS_HTML,
  RANGE_SUM_CODE_LANGUAGES,
} from './range-sum-problem-content';
import template from './range-sum.html?raw';

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
    const [rawL, rawR] = queries[q];
    const L = Math.max(0, Math.min(rawL, n - 1));
    const R = Math.max(0, Math.min(rawR, n - 1));

    steps.push({
      arr: [...arr],
      prefix: [...prefix],
      queries,
      qIndex: q,
      phase: 'query',
      i: -1,
      L,
      R,
      sum: 0,
      results: [...results],
      status: 'query-start',
      message: `开始第 ${q + 1} 次查询：区间 [${L}, ${R}]。`,
      log: `查询 #${q + 1}: 范围 [${L}, ${R}]`,
      codeLine: 8,
    });

    const sumVal = prefix[R + 1] - prefix[L];
    results.push(sumVal);

    steps.push({
      arr: [...arr],
      prefix: [...prefix],
      queries,
      qIndex: q,
      phase: 'query',
      i: -1,
      L,
      R,
      sum: sumVal,
      results: [...results],
      status: 'compute',
      message: `公式计算: prefix[R+1=${R + 1}] (${prefix[R + 1]}) - prefix[L=${L}] (${prefix[L]}) = ${sumVal}。`,
      log: `查询结果: prefix[${R + 1}] - prefix[${L}] = ${sumVal}`,
      codeLine: 9,
    });
  }

  // 4. 完成
  steps.push({
    arr: [...arr],
    prefix: [...prefix],
    queries,
    qIndex: queries.length - 1,
    phase: 'query',
    i: -1,
    L: -1,
    R: -1,
    sum: 0,
    results: [...results],
    status: 'done',
    message: `🎉 所有 ${queries.length} 次区间和查询全部完成！输出结果集: [${results.join(', ')}]。`,
    log: `算法完成: 所有查询结果 [${results.join(', ')}]`,
    codeLine: 11,
  });

  return steps;
}

export class RangeSumVisualizer extends StepVisualizer<RSumStep> {
  protected codeLanguages = RANGE_SUM_CODE_LANGUAGES;
  protected codeLines = RANGE_SUM_CODE_LANGUAGES['java'];
  protected codePanelTitle = '前缀和 代码调试';

  private arrTrackEl: HTMLElement | null = null;
  private prefixTrackEl: HTMLElement | null = null;
  private metricQueryEl: HTMLElement | null = null;
  private metricLrEl: HTMLElement | null = null;
  private metricDiffEl: HTMLElement | null = null;
  private metricSumEl: HTMLElement | null = null;
  private formulaPrEl: HTMLElement | null = null;
  private formulaPlEl: HTMLElement | null = null;
  private formulaResEl: HTMLElement | null = null;
  private resultsBarEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.arrTrackEl = this.root.querySelector('#rs-arr-track');
    this.prefixTrackEl = this.root.querySelector('#rs-prefix-track');
    this.metricQueryEl = this.root.querySelector('#metric-query');
    this.metricLrEl = this.root.querySelector('#metric-lr');
    this.metricDiffEl = this.root.querySelector('#metric-diff');
    this.metricSumEl = this.root.querySelector('#metric-sum');
    this.formulaPrEl = this.root.querySelector('#formula-pr');
    this.formulaPlEl = this.root.querySelector('#formula-pl');
    this.formulaResEl = this.root.querySelector('#formula-res');
    this.resultsBarEl = this.root.querySelector('#rs-results-bar');
    this.liveTextEl = this.root.querySelector('#rs-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.rs-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const arrInput = this.root?.querySelector('#input-arr') as HTMLInputElement | null;
        const qInput = this.root?.querySelector('#input-queries') as HTMLInputElement | null;
        if (arrInput && btn.dataset.arr) arrInput.value = btn.dataset.arr;
        if (qInput && btn.dataset.q) qInput.value = btn.dataset.q;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: RANGE_SUM_PROBLEM_HTML,
      analysisHtml: RANGE_SUM_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): RSumStep[] {
    const arrInput = this.root?.querySelector('#input-arr') as HTMLInputElement | null;
    const qInput = this.root?.querySelector('#input-queries') as HTMLInputElement | null;
    const arr = parseRangeArray(arrInput?.value || '1, 2, 3, 4, 5');
    const queries = parseQueries(qInput?.value || '0,2|1,3|2,4');
    return buildRangeSumSteps(arr, queries);
  }

  protected renderStep(step: RSumStep): void {
    const { arr, prefix, qIndex, phase, L, R, sum, results, status, message } = step;

    // 1. 渲染原数组 arr (上轨)
    if (this.arrTrackEl) {
      this.arrTrackEl.innerHTML = arr
        .map((num, idx) => {
          const inRange = phase === 'query' && idx >= L && idx <= R && L >= 0;
          let boxClasses = 'rs-cell-box';
          if (inRange) boxClasses += ' is-query-range';

          return `
            <div class="rs-cell-wrapper">
              <div class="${boxClasses}">
                <span class="val">${num}</span>
                <span class="idx">[${idx}]</span>
              </div>
            </div>
          `;
        })
        .join('');
    }

    // 2. 渲染前缀和数组 prefix (下轨)
    if (this.prefixTrackEl) {
      this.prefixTrackEl.innerHTML = Array.from({ length: arr.length + 1 })
        .map((_, idx) => {
          const val = idx < prefix.length ? prefix[idx] : null;
          const isPL = phase === 'query' && L >= 0 && idx === L;
          const isPR = phase === 'query' && R >= 0 && idx === R + 1;

          let boxClasses = 'rs-cell-box';
          if (isPL) boxClasses += ' is-prefix-l';
          if (isPR) boxClasses += ' is-prefix-r';

          const badges: string[] = [];
          if (isPL) badges.push('<span class="rs-ptr-badge pl">prefix[L]</span>');
          if (isPR) badges.push('<span class="rs-ptr-badge pr">prefix[R+1]</span>');

          return `
            <div class="rs-cell-wrapper">
              ${badges.join('')}
              <div class="${boxClasses}">
                <span class="val">${val !== null ? val : '—'}</span>
                <span class="idx">[${idx}]</span>
              </div>
            </div>
          `;
        })
        .join('');
    }

    // 3. 更新状态监视器
    if (this.metricQueryEl) this.metricQueryEl.textContent = qIndex >= 0 ? `#${qIndex + 1}` : '预处理';
    if (this.metricLrEl) this.metricLrEl.textContent = L >= 0 && R >= 0 ? `[${L}, ${R}]` : '—';
    if (this.metricDiffEl) {
      this.metricDiffEl.textContent =
        phase === 'query' && L >= 0 && R >= 0 && R + 1 < prefix.length
          ? `${prefix[R + 1]} - ${prefix[L]}`
          : '—';
    }
    if (this.metricSumEl) this.metricSumEl.textContent = phase === 'query' && status === 'compute' ? String(sum) : '—';

    if (this.formulaPrEl) this.formulaPrEl.textContent = R >= 0 && R + 1 < prefix.length ? `prefix[${R + 1}] (${prefix[R + 1]})` : 'prefix[R+1]';
    if (this.formulaPlEl) this.formulaPlEl.textContent = L >= 0 && L < prefix.length ? `prefix[${L}] (${prefix[L]})` : 'prefix[L]';
    if (this.formulaResEl) this.formulaResEl.textContent = phase === 'query' && status === 'compute' ? String(sum) : '—';

    // 历史结果徽标
    if (this.resultsBarEl) {
      let html = '<span style="font-size: 11px; font-weight: 700; color: #64748b;">历史查询结果:</span> ';
      if (results.length === 0) {
        html += '<span style="color: #94a3b8; font-size: 11px;">(暂无)</span>';
      } else {
        html += results
          .map(
            (res, idx) => `
          <span style="padding: 2px 6px; border-radius: 4px; background: #eff6ff; color: #2563eb; font-weight: 700; border: 1px solid #bfdbfe; font-family: monospace; font-size: 11px;">
            Q${idx + 1}: ${res}
          </span>
        `
          )
          .join('');
      }
      this.resultsBarEl.innerHTML = html;
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 4. 更新日志流
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let bg = st.status === 'done' ? '#f0fdf4' : st.phase === 'query' ? '#eff6ff' : '#f8fafc';
        let color = st.status === 'done' ? '#15803d' : st.phase === 'query' ? '#1d4ed8' : '#334155';
        let border = st.status === 'done' ? '#bbf7d0' : st.phase === 'query' ? '#bfdbfe' : '#e2e8f0';
        return `<div style="padding: 4px 8px; border-radius: 6px; background: ${bg}; color: ${color}; border: 1px solid ${border}; margin-bottom: 4px;">
          <span style="color:#94a3b8;">[Step ${idx + 1}]</span> ${st.log}
        </div>`;
      });
      this.logContainer.innerHTML = logs.join('');
      this.logContainer.scrollTop = this.logContainer.scrollHeight;

      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.currentIndex + 1} 条记录`;
      }
    }

    const badgePhase = this.root?.querySelector('#badge-phase');
    if (badgePhase) {
      badgePhase.textContent = status === 'done' ? '全部查询完成' : phase === 'build' ? '阶段: 构建前缀和' : '阶段: O(1) 差分查询';
    }
  }
}

registerAlgorithm({
  id: 'range-sum',
  name: '区间和（前缀和）',
  viewId: 'algo-range-sum-view',
  category: 'array',
  description: '预处理前缀和数组，O(1) 回答区间查询',
  icon: 'Σ',
  difficulty: 1,
  levelOrder: 6,
  learningGoal: '掌握前缀和思想与区间查询技巧',
  template,
  Visualizer: RangeSumVisualizer,
});
