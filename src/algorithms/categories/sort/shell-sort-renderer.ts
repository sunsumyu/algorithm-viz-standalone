/**
 * 希尔排序可视化器 — 4-Card 标准现代架构
 * 增量折半、跨步分组插入、逐步粗排到精排
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  SHELL_SORT_PROBLEM_HTML,
  SHELL_SORT_ANALYSIS_HTML,
  SHELL_SORT_CODE_LANGUAGES,
} from './shell-sort-problem-content';
import { parseArray } from './bubble-sort-renderer';
import template from './shell-sort.html?raw';

export interface ShellStep {
  array: number[];
  gap: number;
  i: number;
  key: number;
  j: number;
  comparisons: number;
  shifts: number;
  phase: 'init' | 'new-gap' | 'pick-key' | 'compare' | 'shift' | 'insert' | 'done';
  status: 'init' | 'new-gap' | 'pick-key' | 'compare' | 'shift' | 'insert' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function shellSortSteps(input: number[]): ShellStep[] {
  const steps: ShellStep[] = [];
  const array = [...input];
  const n = array.length;
  let comparisons = 0;
  let shifts = 0;

  steps.push({
    array: [...array],
    gap: Math.floor(n / 2),
    i: -1,
    key: -1,
    j: -1,
    comparisons: 0,
    shifts: 0,
    phase: 'init',
    status: 'init',
    message: n === 0 ? '数组为空，无需排序。' : `初始化希尔排序：数组长度 n = ${n}，初始增量 gap = ${Math.floor(n / 2)}。`,
    log: n === 0 ? '空数组' : `初始化: [${array.join(', ')}]`,
    codeLine: 2,
  });

  if (n <= 1) {
    steps.push({
      array: [...array],
      gap: 0,
      i: 0,
      key: array[0] ?? 0,
      j: -1,
      comparisons: 0,
      shifts: 0,
      phase: 'done',
      status: 'done',
      message: '✅ 排序完成！',
      log: '排序完成',
      codeLine: 13,
    });
    return steps;
  }

  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    steps.push({
      array: [...array],
      gap,
      i: gap,
      key: -1,
      j: -1,
      comparisons,
      shifts,
      phase: 'new-gap',
      status: 'new-gap',
      message: `进入新一轮增量：gap = ${gap}，对间隔为 ${gap} 的所有子序列执行分组插入排序。`,
      log: `新增量 gap = ${gap}`,
      codeLine: 4,
    });

    for (let i = gap; i < n; i++) {
      const key = array[i];
      let j = i;

      steps.push({
        array: [...array],
        gap,
        i,
        key,
        j,
        comparisons,
        shifts,
        phase: 'pick-key',
        status: 'pick-key',
        message: `提取待插入元素：key = arr[${i}] (${key})，步长 gap = ${gap}。`,
        log: `gap=${gap}: 提取 key = arr[${i}] (${key})`,
        codeLine: [5, 6, 7],
      });

      while (j >= gap) {
        comparisons++;
        const cmp = array[j - gap] > key;

        steps.push({
          array: [...array],
          gap,
          i,
          key,
          j,
          comparisons,
          shifts,
          phase: 'compare',
          status: 'compare',
          message: `跨步比较：arr[${j - gap}] (${array[j - gap]}) vs key (${key})${
            cmp ? '，需要后移 gap 位' : '，无需移动'
          }。`,
          log: `比较 arr[${j - gap}] (${array[j - gap]}) vs key (${key})`,
          codeLine: 8,
        });

        if (!cmp) break;

        array[j] = array[j - gap];
        shifts++;

        steps.push({
          array: [...array],
          gap,
          i,
          key,
          j,
          comparisons,
          shifts,
          phase: 'shift',
          status: 'shift',
          message: `跨步后移：将 arr[${j - gap}] (${array[j]}) 移动到 arr[${j}]。`,
          log: `后移 arr[${j - gap}] -> [${j}]`,
          codeLine: 9,
        });

        j -= gap;
      }

      array[j] = key;

      steps.push({
        array: [...array],
        gap,
        i,
        key,
        j,
        comparisons,
        shifts,
        phase: 'insert',
        status: 'insert',
        message: `插入就位：将 key (${key}) 插入到 arr[${j}]。`,
        log: `插入 key (${key}) 到 [${j}]`,
        codeLine: 12,
      });
    }
  }

  steps.push({
    array: [...array],
    gap: 0,
    i: n - 1,
    key: array[n - 1],
    j: -1,
    comparisons,
    shifts,
    phase: 'done',
    status: 'done',
    message: `🎉 希尔排序完成！共比较 ${comparisons} 次，跨步移动 ${shifts} 次。最终数组：[${array.join(', ')}]。`,
    log: `✓ 排序完成: [${array.join(', ')}]`,
    codeLine: 13,
  });

  return steps;
}

export class ShellSortVisualizer extends StepVisualizer<ShellStep> {
  protected codeLanguages = SHELL_SORT_CODE_LANGUAGES;
  protected codeLines = SHELL_SORT_CODE_LANGUAGES['java'];
  protected codePanelTitle = '希尔排序 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private barsContainerEl: HTMLElement | null = null;
  private metricGapEl: HTMLElement | null = null;
  private metricIEl: HTMLElement | null = null;
  private metricKeyEl: HTMLElement | null = null;
  private metricCompShiftEl: HTMLElement | null = null;
  private formulaGapEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.barsContainerEl = this.root.querySelector('#sh-bars-container');
    this.metricGapEl = this.root.querySelector('#metric-gap');
    this.metricIEl = this.root.querySelector('#metric-i');
    this.metricKeyEl = this.root.querySelector('#metric-key');
    this.metricCompShiftEl = this.root.querySelector('#metric-comp-shift');
    this.formulaGapEl = this.root.querySelector('#formula-gap');
    this.liveTextEl = this.root.querySelector('#sh-live-text');
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
    this.root.querySelectorAll<HTMLButtonElement>.bind(this.root)('.sh-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const arrInput = this.root?.querySelector('#input-array') as HTMLInputElement | null;
        if (arrInput && btn.dataset.arr) arrInput.value = btn.dataset.arr;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: SHELL_SORT_PROBLEM_HTML,
      analysisHtml: SHELL_SORT_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): ShellStep[] {
    const arrInput = this.root?.querySelector('#input-array') as HTMLInputElement | null;
    const raw = arrInput?.value || '9, 8, 3, 7, 5, 6, 4, 1';
    const arr = parseArray(raw);
    return shellSortSteps(arr);
  }

  protected renderStep(step: ShellStep): void {
    const { array, gap, i, key, j, comparisons, shifts, phase, message } = step;

    // 1. 渲染柱状图
    if (this.barsContainerEl) {
      const maxVal = Math.max(...array, key, 1);
      this.barsContainerEl.innerHTML = array
        .map((val, idx) => {
          const isKey = idx === i && phase === 'pick-key';
          const isGapPartner = j >= gap && idx === j - gap && phase === 'compare';
          const isShifting = idx === j && phase === 'shift';
          const isSorted = phase === 'done';

          let pillarClass = 'sh-bar-pillar';
          if (isKey) pillarClass += ' is-key';
          else if (isShifting) pillarClass += ' is-shifting';
          else if (isGapPartner) pillarClass += ' is-gap-partner';
          else if (isSorted) pillarClass += ' is-sorted';

          const heightPct = Math.max(18, Math.round((val / maxVal) * 100));

          return `
            <div class="bs-bar-wrapper">
              <div class="${pillarClass}" style="height: ${heightPct}%;">
                <span>${val}</span>
              </div>
              <span class="bs-bar-idx">${idx}</span>
            </div>
          `;
        })
        .join('');
    }

    // 2. 更新状态监视器
    if (this.metricGapEl) this.metricGapEl.textContent = gap > 0 ? String(gap) : '—';
    if (this.metricIEl) this.metricIEl.textContent = i >= 0 ? String(i) : '—';
    if (this.metricKeyEl) this.metricKeyEl.textContent = key >= 0 ? String(key) : '—';
    if (this.metricCompShiftEl) {
      this.metricCompShiftEl.textContent = `${comparisons} / ${shifts}`;
    }

    if (this.formulaGapEl) {
      if (gap > 0) {
        this.formulaGapEl.textContent = `当前增量 gap = ${gap}`;
      } else {
        this.formulaGapEl.textContent = 'gap = gap / 2';
      }
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 3. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background =
        phase === 'done' ? '#f0fdf4' : phase === 'shift' ? '#fff1f2' : '#eff6ff';
      logEntry.style.color =
        phase === 'done' ? '#15803d' : phase === 'shift' ? '#e11d48' : '#1d4ed8';
      logEntry.style.border =
        '1px solid ' +
        (phase === 'done' ? '#bbf7d0' : phase === 'shift' ? '#fecdd3' : '#bfdbfe');
      logEntry.innerHTML = `<span style="color:#94a3b8;">[Step ${stepIndex + 1}]</span> ${step.log}`;

      this.logContainer.appendChild(logEntry);
      this.logContainer.scrollTop = this.logContainer.scrollHeight;

      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.logContainer.children.length} 条记录`;
      }
    }

    // 4. 同步代码高亮
    if (this.terminalInstance) {
      const line = Array.isArray(step.codeLine) ? step.codeLine[0] : step.codeLine;
      this.terminalInstance.highlightLine(line);
    }

    // 5. 更新底部播放控制条
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
  id: 'shell-sort',
  name: '希尔排序',
  viewId: 'algo-shell-sort-view',
  category: 'sort',
  description: '逐步演示希尔排序：缩小增量 gap，跨步插入排序',
  icon: '🐚',
  difficulty: 2,
  levelOrder: 4,
  learningGoal: '理解希尔排序的跨步插入和缩小增量过程',
  template,
  Visualizer: ShellSortVisualizer,
});
