/**
 * 桶排序可视化器 — 4-Card 标准现代架构
 * 极值范围划分、区间分桶映射、桶内单独排序、顺序归拢回填
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  BUCKET_SORT_PROBLEM_HTML,
  BUCKET_SORT_ANALYSIS_HTML,
  BUCKET_SORT_CODE_LANGUAGES,
} from './bucket-sort-problem-content';
import { parseArray } from './bubble-sort-renderer';
import template from './bucket-sort.html?raw';

export interface BucketStep {
  array: (number | null)[];
  buckets: number[][];
  minVal: number;
  maxVal: number;
  bucketCount: number;
  activeBucket: number;
  activeElem: number | null;
  gatherCount: number;
  phase: 'init' | 'find-minmax' | 'scatter' | 'sort-buckets' | 'gather' | 'done';
  status: 'init' | 'find-minmax' | 'scatter' | 'sort-buckets' | 'gather' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function bucketSortSteps(input: number[], bucketCount = 5): BucketStep[] {
  const steps: BucketStep[] = [];
  const array = [...input];
  const n = array.length;

  if (n === 0) {
    steps.push({
      array: [],
      buckets: Array.from({ length: bucketCount }, () => []),
      minVal: 0,
      maxVal: 0,
      bucketCount,
      activeBucket: -1,
      activeElem: null,
      gatherCount: 0,
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
  const buckets: number[][] = Array.from({ length: bucketCount }, () => []);

  steps.push({
    array: [...array],
    buckets: buckets.map((b) => [...b]),
    minVal,
    maxVal,
    bucketCount,
    activeBucket: -1,
    activeElem: null,
    gatherCount: 0,
    phase: 'find-minmax',
    status: 'find-minmax',
    message: `极值统计：min = ${minVal}, max = ${maxVal}。初始化 ${bucketCount} 个空桶容器。`,
    log: `极值 [${minVal}..${maxVal}], 创建 ${bucketCount} 个桶`,
    codeLine: [3, 4, 5, 6, 7],
  });

  if (minVal === maxVal) {
    steps.push({
      array: [...array],
      buckets: buckets.map((b) => [...b]),
      minVal,
      maxVal,
      bucketCount,
      activeBucket: -1,
      activeElem: null,
      gatherCount: n,
      phase: 'done',
      status: 'done',
      message: `所有元素完全相同 (${minVal})，无需额外分桶排序。`,
      log: '元素完全相同 -> 完成',
      codeLine: 5,
    });
    return steps;
  }

  // 1. Scatter 分桶
  for (let i = 0; i < n; i++) {
    const val = array[i];
    const bIdx = Math.floor(((val - minVal) * (bucketCount - 1)) / (maxVal - minVal));
    buckets[bIdx].push(val);

    steps.push({
      array: [...array],
      buckets: buckets.map((b) => [...b]),
      minVal,
      maxVal,
      bucketCount,
      activeBucket: bIdx,
      activeElem: val,
      gatherCount: 0,
      phase: 'scatter',
      status: 'scatter',
      message: `分桶映射：元素 arr[${i}] = ${val} 根据线性映射分配至桶 [${bIdx}]。`,
      log: `映射 val=${val} -> 桶 [${bIdx}]`,
      codeLine: [9, 10, 11, 12],
    });
  }

  // 2. Sort 桶内排序
  for (let b = 0; b < bucketCount; b++) {
    buckets[b].sort((x, y) => x - y);
  }

  steps.push({
    array: new Array(n).fill(null),
    buckets: buckets.map((b) => [...b]),
    minVal,
    maxVal,
    bucketCount,
    activeBucket: -1,
    activeElem: null,
    gatherCount: 0,
    phase: 'sort-buckets',
    status: 'sort-buckets',
    message: `桶内排序：已完成各个非空桶内部的单独排序。准备开始顺序归拢回填。`,
    log: `各桶内部排序完毕`,
    codeLine: 16,
  });

  // 3. Gather 归拢回填
  const outArr: (number | null)[] = new Array(n).fill(null);
  let writeIdx = 0;

  for (let b = 0; b < bucketCount; b++) {
    for (let k = 0; k < buckets[b].length; k++) {
      const val = buckets[b][k];
      outArr[writeIdx] = val;
      writeIdx++;

      steps.push({
        array: [...outArr],
        buckets: buckets.map((bkt) => [...bkt]),
        minVal,
        maxVal,
        bucketCount,
        activeBucket: b,
        activeElem: val,
        gatherCount: writeIdx,
        phase: 'gather',
        status: 'gather',
        message: `归拢回填：从桶 [${b}] 取出已排序项 ${val}，写入主数组下标 ${writeIdx - 1}。`,
        log: `归拢: 桶 [${b}] (${val}) -> arr[${writeIdx - 1}]`,
        codeLine: [14, 15, 16, 17, 18],
      });
    }
  }

  steps.push({
    array: [...outArr],
    buckets: buckets.map((b) => [...b]),
    minVal,
    maxVal,
    bucketCount,
    activeBucket: -1,
    activeElem: null,
    gatherCount: n,
    phase: 'done',
    status: 'done',
    message: `🎉 桶排序完成！最终输出数组：[${outArr.join(', ')}]。`,
    log: `✓ 排序完成: [${outArr.join(', ')}]`,
    codeLine: 19,
  });

  return steps;
}

export class BucketSortVisualizer extends StepVisualizer<BucketStep> {
  protected codeLanguages = BUCKET_SORT_CODE_LANGUAGES;
  protected codeLines = BUCKET_SORT_CODE_LANGUAGES['java'];
  protected codePanelTitle = '桶排序 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private bucketsRowEl: HTMLElement | null = null;
  private mainTrackEl: HTMLElement | null = null;
  private metricRangeEl: HTMLElement | null = null;
  private metricBucketCountEl: HTMLElement | null = null;
  private metricCurElemEl: HTMLElement | null = null;
  private metricGatherCountEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.bucketsRowEl = this.root.querySelector('#bks-buckets-row');
    this.mainTrackEl = this.root.querySelector('#bks-main-track');
    this.metricRangeEl = this.root.querySelector('#metric-range');
    this.metricBucketCountEl = this.root.querySelector('#metric-bucket-count');
    this.metricCurElemEl = this.root.querySelector('#metric-cur-elem');
    this.metricGatherCountEl = this.root.querySelector('#metric-gather-count');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#bks-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 绑定播放控制
    this.bindPlaybackControls();

    // 运行与重置
    this.root.querySelector('#btn-generate')?.addEventListener('click', () => this.start());
    this.root.querySelector('#btn-reset')?.addEventListener('click', () => this.reset());

    // 进度条 Scrubber
    const slider = this.root.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        if (!isNaN(val) && val >= 0 && val < this.steps.length) {
          this.goToStep(val);
        }
      });
    }

    // 步进控制
    this.root.querySelector('#btn-step-prev')?.addEventListener('click', () => this.prevStep());
    this.root.querySelector('#btn-step-next')?.addEventListener('click', () => this.nextStep());
    this.root.querySelector('#btn-play-pause')?.addEventListener('click', () => this.togglePlay());

    // 速度选择
    const speedSelect = this.root.querySelector('#select-speed') as HTMLSelectElement | null;
    if (speedSelect) {
      speedSelect.addEventListener('change', () => {
        this.playbackSpeed = parseInt(speedSelect.value, 10) || 600;
      });
    }

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>.bind(this.root)('.bks-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const arrInput = this.root?.querySelector('#input-array') as HTMLInputElement | null;
        if (arrInput && btn.dataset.arr) arrInput.value = btn.dataset.arr;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: BUCKET_SORT_PROBLEM_HTML,
      analysisHtml: BUCKET_SORT_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): BucketStep[] {
    const arrInput = this.root?.querySelector('#input-array') as HTMLInputElement | null;
    const raw = arrInput?.value || '29, 25, 3, 49, 9, 37, 21, 43';
    const arr = parseArray(raw);
    return bucketSortSteps(arr, 5);
  }

  protected renderStep(step: BucketStep): void {
    const { array, buckets, minVal, maxVal, bucketCount, activeBucket, activeElem, gatherCount, phase, message } = step;

    // 1. 渲染 5 个桶容器
    if (this.bucketsRowEl) {
      this.bucketsRowEl.innerHTML = buckets
        .map((items, bIdx) => {
          const isActive = bIdx === activeBucket && phase !== 'done';
          const itemsHtml = items
            .map((item) => `<span class="bks-item-tag">${item}</span>`)
            .join('');

          return `
            <div class="bks-bucket-box ${isActive ? 'is-active-bucket' : ''}">
              <div class="bks-bucket-head">Bucket [${bIdx}]</div>
              <div class="bks-bucket-items">${itemsHtml || '<span style="font-size:9px;color:#94a3b8;">(空)</span>'}</div>
            </div>
          `;
        })
        .join('');
    }

    // 2. 渲染主数组
    if (this.mainTrackEl) {
      this.mainTrackEl.innerHTML = array
        .map((val, idx) => {
          const isGathered = val !== null && (phase === 'gather' || phase === 'done');
          const isActiveElem = idx === gatherCount - 1 && phase === 'gather';

          let cellClass = 'bks-cell-box';
          if (isActiveElem) cellClass += ' is-active-elem';
          else if (isGathered) cellClass += ' is-gathered';

          return `
            <div class="${cellClass}">
              <span class="val">${val !== null ? val : '—'}</span>
            </div>
          `;
        })
        .join('');
    }

    // 3. 更新状态监视器
    if (this.metricRangeEl) this.metricRangeEl.textContent = `[${minVal}, ${maxVal}]`;
    if (this.metricBucketCountEl) this.metricBucketCountEl.textContent = `${bucketCount}`;
    if (this.metricCurElemEl) this.metricCurElemEl.textContent = activeElem !== null ? `${activeElem}` : '—';
    if (this.metricGatherCountEl) this.metricGatherCountEl.textContent = `${gatherCount} / ${array.length}`;

    if (this.formulaActionEl) {
      if (phase === 'scatter') {
        this.formulaActionEl.textContent = `bIdx = (${activeElem} - ${minVal}) * ${bucketCount - 1} / ${maxVal - minVal} = ${activeBucket}`;
      } else if (phase === 'sort-buckets') {
        this.formulaActionEl.textContent = 'sort(bucket[0..k-1]) 桶内排序';
      } else if (phase === 'gather') {
        this.formulaActionEl.textContent = `arr[${gatherCount - 1}] = ${activeElem} (来自桶 [${activeBucket}])`;
      } else if (phase === 'done') {
        this.formulaActionEl.textContent = '桶排序完成';
      } else {
        this.formulaActionEl.textContent = 'bIdx = (val - min) * (k - 1) / (max - min)';
      }
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 4. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background =
        phase === 'done' ? '#f0fdf4' : phase === 'gather' ? '#faf5ff' : '#eff6ff';
      logEntry.style.color =
        phase === 'done' ? '#15803d' : phase === 'gather' ? '#7e22ce' : '#1d4ed8';
      logEntry.style.border =
        '1px solid ' +
        (phase === 'done' ? '#bbf7d0' : phase === 'gather' ? '#e9d5ff' : '#bfdbfe');
      logEntry.innerHTML = `<span style="color:#94a3b8;">[Step ${stepIndex + 1}]</span> ${step.log}`;

      this.logContainer.appendChild(logEntry);
      this.logContainer.scrollTop = this.logContainer.scrollHeight;

      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.logContainer.children.length} 条记录`;
      }
    }

    // 5. 同步代码高亮
    if (this.terminalInstance) {
      const line = Array.isArray(step.codeLine) ? step.codeLine[0] : step.codeLine;
      this.terminalInstance.highlightLine(line);
    }

    // 6. 更新底部播放控制条
    const slider = this.root?.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.max = String(this.steps.length - 1);
      slider.value = String(this.currentStepIndex);
    }
    const indicator = this.root?.querySelector('#step-indicator');
    if (indicator) {
      indicator.textContent = `步骤 ${this.currentStepIndex + 1} / ${this.steps.length}`;
    }
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
    if (this.terminalInstance) this.terminalInstance.highlightLine(0);
  }
}

registerAlgorithm({
  id: 'bucket-sort',
  name: '桶排序',
  viewId: 'algo-bucket-sort-view',
  category: 'sort',
  description: '逐步演示桶排序：区间映射分流、桶内独立排序、顺序归拢回填',
  icon: '🪣',
  difficulty: 2,
  levelOrder: 9,
  learningGoal: '掌握分桶映射思想、数据局部有序化与归拢还原过程',
  template,
  Visualizer: BucketSortVisualizer,
});
