/**
 * 基数排序可视化器 — 4-Card 标准现代架构
 * LSD 低位优先、按位计数统计与稳定回填
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  RADIX_SORT_PROBLEM_HTML,
  RADIX_SORT_ANALYSIS_HTML,
  RADIX_SORT_CODE_LANGUAGES,
} from './radix-sort-problem-content';
import { parseArray } from './bubble-sort-renderer';
import template from './radix-sort.html?raw';

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

export class RadixSortVisualizer extends StepVisualizer<RadixStep> {
  protected codeLanguages = RADIX_SORT_CODE_LANGUAGES;
  protected codeLines = RADIX_SORT_CODE_LANGUAGES['java'];
  protected codePanelTitle = '基数排序 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private srcTrackEl: HTMLElement | null = null;
  private countTrackEl: HTMLElement | null = null;
  private outTrackEl: HTMLElement | null = null;
  private metricExpEl: HTMLElement | null = null;
  private metricMaxValEl: HTMLElement | null = null;
  private metricCurElemEl: HTMLElement | null = null;
  private metricOutIdxEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.srcTrackEl = this.root.querySelector('#rx-src-track');
    this.countTrackEl = this.root.querySelector('#rx-count-track');
    this.outTrackEl = this.root.querySelector('#rx-out-track');
    this.metricExpEl = this.root.querySelector('#metric-exp');
    this.metricMaxValEl = this.root.querySelector('#metric-max-val');
    this.metricCurElemEl = this.root.querySelector('#metric-cur-elem');
    this.metricOutIdxEl = this.root.querySelector('#metric-out-idx');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#rx-live-text');
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
    this.root.querySelectorAll<HTMLButtonElement>('.rx-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const arrInput = this.root?.querySelector('#input-array') as HTMLInputElement | null;
        if (arrInput && btn.dataset.arr) arrInput.value = btn.dataset.arr;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: RADIX_SORT_PROBLEM_HTML,
      analysisHtml: RADIX_SORT_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): RadixStep[] {
    const arrInput = this.root?.querySelector('#input-array') as HTMLInputElement | null;
    const raw = arrInput?.value || '170, 45, 75, 90, 802, 24, 2, 66';
    const arr = parseArray(raw);
    return radixSortSteps(arr);
  }

  protected renderStep(step: RadixStep): void {
    const { array, count, output, exp, maxVal, srcIdx, digit, outIdx, curElem, phase, message } = step;

    // 1. 渲染原数组 (带数位加粗高亮)
    if (this.srcTrackEl) {
      this.srcTrackEl.innerHTML = array
        .map((val, idx) => {
          const isActive = idx === srcIdx && phase !== 'done';
          let cellClass = 'rx-cell-box';
          if (isActive) cellClass += ' is-active-elem';

          const valStr = String(val);
          const d = exp > 0 ? Math.floor(val / exp) % 10 : 0;

          return `
            <div class="${cellClass}">
              <span class="val">${valStr}</span>
              <span class="sub">${exp > 0 ? `d=${d}` : `[${idx}]`}</span>
            </div>
          `;
        })
        .join('');
    }

    // 2. 渲染 Count 计数表 [0..9]
    if (this.countTrackEl) {
      this.countTrackEl.innerHTML = count
        .map((freq, idx) => {
          const isActive = idx === digit && phase !== 'done';
          let cellClass = 'rx-cell-box';
          if (isActive) cellClass += ' is-active-digit';

          return `
            <div class="${cellClass}">
              <span class="val">${freq}</span>
              <span class="sub">[${idx}]</span>
            </div>
          `;
        })
        .join('');
    }

    // 3. 渲染 Output 缓冲
    if (this.outTrackEl) {
      this.outTrackEl.innerHTML = output
        .map((val, idx) => {
          const isFilled = val !== null;
          const isCurrentTarget = idx === outIdx && phase === 'build-out';

          let cellClass = 'rx-cell-box';
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
    if (this.metricExpEl) {
      const expName = exp === 1 ? '1 (个位)' : exp === 10 ? '10 (十位)' : exp === 100 ? '100 (百位)' : exp > 0 ? `${exp}` : '—';
      this.metricExpEl.textContent = expName;
    }
    if (this.metricMaxValEl) this.metricMaxValEl.textContent = `${maxVal}`;
    if (this.metricCurElemEl) {
      this.metricCurElemEl.textContent = curElem !== null ? `${curElem} (d='${digit}')` : '—';
    }
    if (this.metricOutIdxEl) this.metricOutIdxEl.textContent = outIdx >= 0 ? `${outIdx}` : '—';

    if (this.formulaActionEl) {
      if (phase === 'count-digit') {
        this.formulaActionEl.textContent = `count[(${curElem} / ${exp}) % 10] = count[${digit}]++ (${count[digit!]})`;
      } else if (phase === 'prefix-sum') {
        this.formulaActionEl.textContent = `count[${digit}] += count[${digit! - 1}] = ${count[digit!]}`;
      } else if (phase === 'build-out') {
        this.formulaActionEl.textContent = `output[--count[${digit}]] = output[${outIdx}] = ${curElem}`;
      } else if (phase === 'write-back') {
        this.formulaActionEl.textContent = '写回原数组 (当前权位就绪)';
      } else if (phase === 'done') {
        this.formulaActionEl.textContent = '基数排序完成';
      } else {
        this.formulaActionEl.textContent = 'digit = (x / exp) % 10';
      }
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 5. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background =
        phase === 'done' ? '#f0fdf4' : phase === 'build-out' ? '#faf5ff' : '#eff6ff';
      logEntry.style.color =
        phase === 'done' ? '#15803d' : phase === 'build-out' ? '#7e22ce' : '#1d4ed8';
      logEntry.style.border =
        '1px solid ' +
        (phase === 'done' ? '#bbf7d0' : phase === 'build-out' ? '#e9d5ff' : '#bfdbfe');
      logEntry.innerHTML = `<span style="color:#94a3b8;">[Step ${stepIndex + 1}]</span> ${step.log}`;

      this.logContainer.appendChild(logEntry);
      this.logContainer.scrollTop = this.logContainer.scrollHeight;

      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.logContainer.children.length} 条记录`;
      }
    }

    // 6. 同步代码高亮
    if (this.terminalInstance) {
      const line = Array.isArray(step.codeLine) ? step.codeLine[0] : step.codeLine;
      this.terminalInstance.highlightLine(line);
    }

    // 7. 更新底部播放控制条
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
  id: 'radix-sort',
  name: '基数排序',
  viewId: 'algo-radix-sort-view',
  category: 'sort',
  description: '逐步演示基数排序：LSD低位优先、按位计数排序与稳定收集',
  icon: '🎯',
  difficulty: 2,
  levelOrder: 10,
  learningGoal: '掌握基数排序的按位切分、桶分配与稳定收集过程',
  template,
  Visualizer: RadixSortVisualizer,
});
