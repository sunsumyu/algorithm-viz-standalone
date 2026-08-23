/**
 * 区间和（前缀和）可视化器
 * 预处理前缀和数组，O(1) 回答区间查询
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './range-sum.html?raw';

interface RSumStep {
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

export class RangeSumVisualizer extends StepVisualizer<RSumStep> {
  protected codeLines = [
    'public int[] rangeSum(int[] arr, int[][] queries) {',
    '    int n = arr.length;',
    '    int[] prefix = new int[n + 1];',
    '    prefix[0] = 0;',
    '    for (int i = 0; i < n; i++) {',
    '        prefix[i + 1] = prefix[i] + arr[i];',
    '    }',
    '    int[] results = new int[queries.length];',
    '    for (int q = 0; q < queries.length; q++) {',
    '        int L = queries[q][0], R = queries[q][1];',
    '        results[q] = prefix[R + 1] - prefix[L];',
    '    }',
    '    return results;',
    '}',
  ];
  protected codePanelTitle = '前缀和 Java 实现';

  private arrInput: HTMLInputElement | null = null;
  private queryInput: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private arrCellsEl: HTMLElement | null = null;
  private prefixCellsEl: HTMLElement | null = null;
  private formulaEl: HTMLElement | null = null;
  private resultsEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private qIndexEl: HTMLElement | null = null;
  private lEl: HTMLElement | null = null;
  private rEl: HTMLElement | null = null;
  private sumEl: HTMLElement | null = null;
  private prefixREl: HTMLElement | null = null;
  /** 持久化原数组 cell */
  private arrCells: HTMLElement[] = [];
  /** 持久化前缀和 cell */
  private prefixCells: HTMLElement[] = [];

  protected initDOMElements(): void {
    if (!this.root) return;
    this.arrInput = this.root.querySelector('#rsum-arr-input');
    this.queryInput = this.root.querySelector('#rsum-query-input');
    this.btnStart = this.root.querySelector('#rsum-start');
    this.exampleButtons = this.root.querySelectorAll('.rsum-example-btn');
    this.arrCellsEl = this.root.querySelector('#rsum-arr-cells');
    this.prefixCellsEl = this.root.querySelector('#rsum-prefix-cells');
    this.formulaEl = this.root.querySelector('#rsum-formula');
    this.resultsEl = this.root.querySelector('#rsum-results');
    this.logEl = this.root.querySelector('#rsum-log');
    this.qIndexEl = this.root.querySelector('#rsum-q-index');
    this.lEl = this.root.querySelector('#rsum-l');
    this.rEl = this.root.querySelector('#rsum-r');
    this.sumEl = this.root.querySelector('#rsum-sum');
    this.prefixREl = this.root.querySelector('#rsum-prefix-r');
    this.bindPlaybackControls({ message: 'step-message' });

    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => {
        if (this.arrInput) this.arrInput.value = btn.dataset.arr || '';
        if (this.queryInput) this.queryInput.value = btn.dataset.q || '';
        this.start();
      };
    });
  }

  protected buildSteps(): RSumStep[] {
    const arr = this.parseArray(this.arrInput?.value || '1,2,3,4,5');
    const queries = this.parseQueries(this.queryInput?.value || '0,2|1,3|2,4');
    const steps: RSumStep[] = [];
    const n = arr.length;
    const prefix = new Array<number>(n + 1).fill(0);

    // Init step
    steps.push({
      arr: [...arr],
      prefix: [...prefix],
      queries,
      qIndex: -1,
      phase: 'build',
      i: -1,
      L: -1,
      R: -1,
      sum: 0,
      results: [],
      status: 'init',
      message: `初始化数组长度 n=${n}，前缀和数组 prefix 大小为 n+1=${n + 1}，prefix[0]=0。`,
      log: '初始化前缀和数组 prefix[0]=0。',
      codeLine: [2, 3, 4],
    });

    // Build phase
    for (let i = 0; i < n; i++) {
      prefix[i + 1] = prefix[i] + arr[i];
      steps.push({
        arr: [...arr],
        prefix: [...prefix],
        queries,
        qIndex: -1,
        phase: 'build',
        i,
        L: -1,
        R: -1,
        sum: prefix[i + 1],
        results: [],
        status: 'build-prefix',
        message: `构建阶段 i=${i}：prefix[${i + 1}] = prefix[${i}] + arr[${i}] = ${prefix[i]} + ${arr[i]} = ${prefix[i + 1]}。`,
        log: `prefix[${i + 1}] = ${prefix[i]} + ${arr[i]} = ${prefix[i + 1]}。`,
        codeLine: [5, 6],
      });
    }

    steps.push({
      arr: [...arr],
      prefix: [...prefix],
      queries,
      qIndex: -1,
      phase: 'build',
      i: n,
      L: -1,
      R: -1,
      sum: 0,
      results: [],
      status: 'build-prefix',
      message: `前缀和数组构建完成：[${prefix.join(', ')}]。共 ${queries.length} 个查询待处理。`,
      log: `前缀和数组构建完成。`,
      codeLine: 7,
    });

    // Query phase
    const results: number[] = [];
    for (let qi = 0; qi < queries.length; qi++) {
      const [L, R] = queries[qi];
      const ans = prefix[R + 1] - prefix[L];

      steps.push({
        arr: [...arr],
        prefix: [...prefix],
        queries,
        qIndex: qi,
        phase: 'query',
        i: n,
        L,
        R,
        sum: 0,
        results: [...results],
        status: 'query-start',
        message: `查询 #${qi + 1}：区间 [${L}, ${R}]，需要计算 prefix[${R + 1}] - prefix[${L}] = ${prefix[R + 1]} - ${prefix[L]}。`,
        log: `查询 #${qi + 1}：区间 [${L}, ${R}]。`,
        codeLine: [8, 9],
      });

      steps.push({
        arr: [...arr],
        prefix: [...prefix],
        queries,
        qIndex: qi,
        phase: 'query',
        i: n,
        L,
        R,
        sum: ans,
        results: [...results],
        status: 'compute',
        message: `计算：prefix[${R + 1}]=${prefix[R + 1]} − prefix[${L}]=${prefix[L]} = ${ans}。区间 [${L},${R}] 的和为 ${ans}。`,
        log: `sum[${L},${R}] = ${prefix[R + 1]} − ${prefix[L]} = ${ans}。`,
        codeLine: 10,
      });

      results.push(ans);
      steps.push({
        arr: [...arr],
        prefix: [...prefix],
        queries,
        qIndex: qi,
        phase: 'query',
        i: n,
        L,
        R,
        sum: ans,
        results: [...results],
        status: 'query-done',
        message: `查询 #${qi + 1} 结果：sum[${L},${R}] = ${ans}。`,
        log: `查询 #${qi + 1} 结果 = ${ans}。`,
        codeLine: 10,
      });
    }

    steps.push({
      arr: [...arr],
      prefix: [...prefix],
      queries,
      qIndex: queries.length - 1,
      phase: 'query',
      i: n,
      L: -1,
      R: -1,
      sum: 0,
      results: [...results],
      status: 'done',
      message: `所有查询完成，结果：[${results.join(', ')}]。`,
      log: `返回 [${results.join(', ')}]。`,
      codeLine: 12,
    });

    return steps;
  }

  private parseArray(input: string): number[] {
    return input
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n));
  }

  private parseQueries(input: string): [number, number][] {
    const out: [number, number][] = [];
    const parts = input.split(/[|]/).map((s) => s.trim()).filter(Boolean);
    for (const p of parts) {
      const [a, b] = p.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10));
      if (Number.isFinite(a) && Number.isFinite(b)) {
        out.push([a, b]);
      }
    }
    return out;
  }

  protected renderStep(step: RSumStep): void {
    // Stats
    if (this.qIndexEl) this.qIndexEl.textContent = step.qIndex >= 0 ? `${step.qIndex + 1}/${step.queries.length}` : '-';
    if (this.lEl) this.lEl.textContent = step.L >= 0 ? String(step.L) : '-';
    if (this.rEl) this.rEl.textContent = step.R >= 0 ? String(step.R) : '-';
    if (this.sumEl) {
      if (step.status === 'init' || step.status === 'build-prefix') {
        this.sumEl.textContent = step.status === 'init' ? '-' : String(step.sum);
      } else {
        this.sumEl.textContent = String(step.sum);
      }
    }
    if (this.prefixREl) {
      if (step.R >= 0 && step.R + 1 < step.prefix.length) {
        this.prefixREl.textContent = String(step.prefix[step.R + 1]);
      } else {
        this.prefixREl.textContent = '-';
      }
    }

    // Original array row
    if (this.arrCellsEl) {
      this.ensureArrCells(step.arr.length);
      step.arr.forEach((v, i) => {
        const cell = this.arrCells[i];
        if (!cell) return;
        const inRange = step.phase === 'query' && step.L >= 0 && step.R >= 0 && i >= step.L && i <= step.R;
        const isActive =
          step.phase === 'build' && step.status === 'build-prefix' && step.i === i;
        const isSource =
          step.phase === 'build' && step.status === 'build-prefix' && step.i === i;

        cell.classList.toggle('range', !!inRange);
        cell.classList.toggle('active', isActive);
        cell.classList.toggle('source', isSource && step.i >= 0);
        if (!isSource) cell.classList.remove('source');

        cell.innerHTML = `<span class="idx">${i}</span><span class="val">${v}</span>`;
      });
    }

    // Prefix sum row
    if (this.prefixCellsEl) {
      this.ensurePrefixCells(step.prefix.length);
      const building =
        step.phase === 'build' && step.status === 'build-prefix' && step.i >= 0 && step.i < step.prefix.length - 1;
      const fillIdx = building ? step.i + 1 : -1;
      const sourceIdx = building ? step.i : -1;
      step.prefix.forEach((v, i) => {
        const cell = this.prefixCells[i];
        if (!cell) return;
        const isNewFill = step.phase === 'build' && step.status === 'build-prefix' && i === fillIdx;
        const isSource = step.phase === 'build' && step.status === 'build-prefix' && i === sourceIdx;
        const isComputed = step.phase === 'build' && step.i >= 0 && i <= step.i;
        const isRange = step.phase === 'query' && (i === step.L || i === step.R + 1);

        cell.classList.toggle('active', isNewFill);
        cell.classList.toggle('computed', isComputed && !isNewFill);
        cell.classList.toggle('range', isRange);
        cell.classList.toggle('source', isSource);

        if (isNewFill) {
          this.restartAnimation(cell, 'filling');
        } else {
          cell.classList.remove('filling');
        }
        if (isSource && !isNewFill) {
          this.restartAnimation(cell, 'filling-source');
        } else if (!isNewFill) {
          cell.classList.remove('filling-source');
        }

        cell.innerHTML = `<span class="idx">${i}</span><span class="val">${v}</span>`;
      });
    }

    // Formula display
    if (this.formulaEl) {
      if (step.phase === 'query' && step.L >= 0 && step.R >= 0) {
        const pR1 = step.prefix[step.R + 1];
        const pL = step.prefix[step.L];
        this.formulaEl.innerHTML =
          `sum[${step.L}, ${step.R}] = <span class="highlight">prefix[${step.R + 1}]</span> − <span class="highlight">prefix[${step.L}]</span> = <span class="highlight">${pR1}</span> − <span class="highlight">${pL}</span> = <span class="highlight">${step.sum}</span>`;
      } else {
        this.formulaEl.innerHTML = `sum[L, R] = <span class="highlight">prefix[R+1]</span> − <span class="highlight">prefix[L]</span>`;
      }
    }

    // Results list
    if (this.resultsEl) {
      this.resultsEl.innerHTML = '';
      if (step.results.length === 0) {
        this.resultsEl.innerHTML = '<div class="rsum-result-item" style="color:#6c7086;">尚无查询结果</div>';
      } else {
        step.results.forEach((ans, qi) => {
          const [L, R] = step.queries[qi];
          const div = document.createElement('div');
          div.className = 'rsum-result-item';
          const isLatest = qi === step.qIndex && (step.status === 'compute' || step.status === 'query-done' || step.status === 'done');
          div.innerHTML = `<span class="query">查询 #${qi + 1}：sum[${L}, ${R}] =</span><span class="answer">${ans}</span>`;
          if (isLatest) {
            div.style.borderColor = 'rgba(167, 139, 250, 0.5)';
            div.style.background = 'rgba(167, 139, 250, 0.15)';
          }
          this.resultsEl?.appendChild(div);
        });
      }
    }

    this.renderLogLine(step);
  }

  private renderLogLine(step: RSumStep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const line = document.createElement('div');
      if (i === this.currentIndex) line.className = 'active';
      line.textContent = `${String(i + 1).padStart(2, '0')}. ${s.log}`;
      this.logEl?.appendChild(line);
    });
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  /** 按需创建/回收原数组 cell */
  private ensureArrCells(n: number): void {
    if (!this.arrCellsEl) return;
    while (this.arrCells.length < n) {
      const cell = document.createElement('div');
      cell.className = 'rsum-cell';
      this.arrCells.push(cell);
      this.arrCellsEl.appendChild(cell);
    }
    while (this.arrCells.length > n) {
      const cell = this.arrCells.pop();
      if (cell && cell.parentElement === this.arrCellsEl) this.arrCellsEl.removeChild(cell);
    }
  }

  /** 按需创建/回收前缀和 cell */
  private ensurePrefixCells(n: number): void {
    if (!this.prefixCellsEl) return;
    while (this.prefixCells.length < n) {
      const cell = document.createElement('div');
      cell.className = 'rsum-cell';
      this.prefixCells.push(cell);
      this.prefixCellsEl.appendChild(cell);
    }
    while (this.prefixCells.length > n) {
      const cell = this.prefixCells.pop();
      if (cell && cell.parentElement === this.prefixCellsEl) this.prefixCellsEl.removeChild(cell);
    }
  }

  /** 重启 CSS 动画 class */
  private restartAnimation(el: HTMLElement, cls: string): void {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }
}

registerAlgorithm({
  id: 'range-sum',
  name: '区间和（前缀和）',
  viewId: 'algo-range-sum-view',
  category: 'array',
  description: '预处理前缀和数组，O(1) 回答区间查询',
  icon: 'Σ',
  template,
  Visualizer: RangeSumVisualizer,
  difficulty: 1,
  levelOrder: 6,
  learningGoal: '掌握前缀和思想与区间查询技巧',
});

export {};
