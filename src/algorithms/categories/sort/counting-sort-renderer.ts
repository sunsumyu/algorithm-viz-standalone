/**
 * 计数排序可视化器 — 4-Card 标准现代架构
 * 统计频次、前缀和累加、倒序稳定回填
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  COUNTING_SORT_PROBLEM_HTML,
  COUNTING_SORT_ANALYSIS_HTML,
  COUNTING_SORT_CODE_LANGUAGES,
} from './counting-sort-problem-content';
import { parseArray } from './bubble-sort-renderer';
import template from './counting-sort.html?raw';

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

export class CountingSortVisualizer extends StepVisualizer<CSStep> {
  protected codeLanguages = COUNTING_SORT_CODE_LANGUAGES;
  protected codeLines = COUNTING_SORT_CODE_LANGUAGES['java'];
  protected codePanelTitle = '计数排序 代码调试';

  private srcTrackEl: HTMLElement | null = null;
  private countTrackEl: HTMLElement | null = null;
  private outTrackEl: HTMLElement | null = null;
  private metricRangeEl: HTMLElement | null = null;
  private metricKEl: HTMLElement | null = null;
  private metricCurElemEl: HTMLElement | null = null;
  private metricOutIdxEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.srcTrackEl = this.root.querySelector('#cs-src-track');
    this.countTrackEl = this.root.querySelector('#cs-count-track');
    this.outTrackEl = this.root.querySelector('#cs-out-track');
    this.metricRangeEl = this.root.querySelector('#metric-range');
    this.metricKEl = this.root.querySelector('#metric-k');
    this.metricCurElemEl = this.root.querySelector('#metric-cur-elem');
    this.metricOutIdxEl = this.root.querySelector('#metric-out-idx');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#cs-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.cs-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const arrInput = this.root?.querySelector('#input-array') as HTMLInputElement | null;
        if (arrInput && btn.dataset.arr) arrInput.value = btn.dataset.arr;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: COUNTING_SORT_PROBLEM_HTML,
      analysisHtml: COUNTING_SORT_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): CSStep[] {
    const arrInput = this.root?.querySelector('#input-array') as HTMLInputElement | null;
    const raw = arrInput?.value || '4, 2, 2, 8, 3, 3, 1';
    const arr = parseArray(raw);
    return countingSortSteps(arr);
  }

  protected renderStep(step: CSStep): void {
    const { array, count, output, minVal, maxVal, k, srcIdx, countIdx, outIdx, curElem, phase, message } = step;

    // 1. 渲染原数组
    if (this.srcTrackEl) {
      this.srcTrackEl.innerHTML = array
        .map((val, idx) => {
          const isActive = idx === srcIdx && phase !== 'done';
          let cellClass = 'cs-cell-box';
          if (isActive) cellClass += ' is-active-src';

          return `
            <div class="${cellClass}">
              <span class="val">${val}</span>
              <span class="sub">[${idx}]</span>
            </div>
          `;
        })
        .join('');
    }

    // 2. 渲染 Count 计数表
    if (this.countTrackEl) {
      this.countTrackEl.innerHTML = count
        .map((freq, idx) => {
          const isActive = idx === countIdx && phase !== 'done';
          let cellClass = 'cs-cell-box';
          if (isActive) cellClass += ' is-active-count';

          return `
            <div class="${cellClass}">
              <span class="val">${freq}</span>
              <span class="sub">${idx + minVal}</span>
            </div>
          `;
        })
        .join('');
    }

    // 3. 渲染 Output 数组
    if (this.outTrackEl) {
      this.outTrackEl.innerHTML = output
        .map((val, idx) => {
          const isFilled = val !== null;
          const isCurrentTarget = idx === outIdx && phase === 'build-out';

          let cellClass = 'cs-cell-box';
          if (isFilled) cellClass += ' is-filled-out';

          return `
            <div class="${cellClass}" ${isCurrentTarget ? 'style="box-shadow: 0 0 0 2px rgba(16,185,129,0.5); transform:scale(1.08);"' : ''}>
              <span class="val">${val !== null ? val : '—'}</span>
              <span class="sub">[${idx}]</span>
            </div>
          `;
        })
        .join('');
    }

    // 4. 更新状态监视器
    if (this.metricRangeEl) this.metricRangeEl.textContent = `[${minVal}, ${maxVal}]`;
    if (this.metricKEl) this.metricKEl.textContent = `${k}`;
    if (this.metricCurElemEl) this.metricCurElemEl.textContent = curElem !== null ? `${curElem}` : '—';
    if (this.metricOutIdxEl) this.metricOutIdxEl.textContent = outIdx >= 0 ? `${outIdx}` : '—';

    if (this.formulaActionEl) {
      if (phase === 'count-freq') {
        this.formulaActionEl.textContent = `count[${curElem} - ${minVal}]++ (${count[countIdx]})`;
      } else if (phase === 'prefix-sum') {
        this.formulaActionEl.textContent = `count[${countIdx}] += count[${countIdx - 1}] = ${count[countIdx]}`;
      } else if (phase === 'build-out') {
        this.formulaActionEl.textContent = `output[--count[${curElem} - ${minVal}]] = output[${outIdx}] = ${curElem}`;
      } else if (phase === 'done') {
        this.formulaActionEl.textContent = '计数排序完成';
      } else {
        this.formulaActionEl.textContent = 'output[--count[x - min]] = x';
      }
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 5. 更新日志流
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let bg =
          st.phase === 'done' ? '#f0fdf4' : st.phase === 'build-out' ? '#faf5ff' : '#eff6ff';
        let color =
          st.phase === 'done' ? '#15803d' : st.phase === 'build-out' ? '#7e22ce' : '#1d4ed8';
        let border =
          st.phase === 'done' ? '#bbf7d0' : st.phase === 'build-out' ? '#e9d5ff' : '#bfdbfe';
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

    const badgeRange = this.root?.querySelector('#badge-range');
    if (badgeRange) badgeRange.textContent = `值域: [${minVal}..${maxVal}]`;
  }
}

registerAlgorithm({
  id: 'counting-sort',
  name: '计数排序',
  viewId: 'algo-counting-sort-view',
  category: 'sort',
  description: '逐步演示计数排序：统计频次、前缀和累加、倒序稳定输出',
  icon: '🔢',
  difficulty: 1,
  levelOrder: 8,
  learningGoal: '理解非比较排序思想、计数数组与前缀和定位原理',
  template,
  Visualizer: CountingSortVisualizer,
});
