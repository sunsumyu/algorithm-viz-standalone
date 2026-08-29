/**
 * 有序数组的平方可视化器 — 4-Card 标准现代架构
 * LeetCode 977：首尾对撞双指针
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  SQUARES_OF_SORTED_ARRAY_PROBLEM_HTML,
  SQUARES_OF_SORTED_ARRAY_ANALYSIS_HTML,
  SQUARES_OF_SORTED_ARRAY_CODE_LANGUAGES,
} from './squares-of-sorted-array-problem-content';
import template from './squares-of-sorted-array.html?raw';

export interface SSQStep {
  arr: number[];
  result: (number | null)[];
  left: number;
  right: number;
  writeIdx: number;
  status: 'init' | 'compare' | 'write-left' | 'write-right' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function parseSortedArray(input: string): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return arr.length > 0 ? arr.sort((a, b) => a - b) : [-4, -1, 0, 3, 10];
}

export function buildSortedSquaresSteps(arr: number[]): SSQStep[] {
  const steps: SSQStep[] = [];
  const n = arr.length;
  const result: (number | null)[] = new Array(n).fill(null);
  let left = 0;
  let right = n - 1;

  steps.push({
    arr: [...arr],
    result: [...result],
    left,
    right,
    writeIdx: n - 1,
    status: 'init',
    message: `初始化 left=0, right=${n - 1}，结果数组从末尾 writeIdx=${n - 1} 开始向前填充。`,
    log: `初始化双指针：left=0, right=${n - 1}, writeIdx=${n - 1}`,
    codeLine: 4,
  });

  for (let i = n - 1; i >= 0; i--) {
    const lsq = arr[left] * arr[left];
    const rsq = arr[right] * arr[right];

    steps.push({
      arr: [...arr],
      result: [...result],
      left,
      right,
      writeIdx: i,
      status: 'compare',
      message: `比较 nums[left=${left}]² = ${lsq} 与 nums[right=${right}]² = ${rsq}，将较大者填入 result[${i}]。`,
      log: `比较: left²=${lsq} vs right²=${rsq}`,
      codeLine: [6, 7],
    });

    if (lsq > rsq) {
      result[i] = lsq;
      steps.push({
        arr: [...arr],
        result: [...result],
        left,
        right,
        writeIdx: i,
        status: 'write-left',
        message: `${lsq} > ${rsq}，左侧平方更大：写入 result[${i}] = ${lsq}，left++ → ${left + 1}。`,
        log: `填入左侧平方: result[${i}] = ${lsq}，left -> ${left + 1}`,
        codeLine: [8, 9],
      });
      left++;
    } else {
      result[i] = rsq;
      steps.push({
        arr: [...arr],
        result: [...result],
        left,
        right,
        writeIdx: i,
        status: 'write-right',
        message: `${lsq} ≤ ${rsq}，右侧平方更大或相等：写入 result[${i}] = ${rsq}，right-- → ${right - 1}。`,
        log: `填入右侧平方: result[${i}] = ${rsq}，right -> ${right - 1}`,
        codeLine: [11, 12],
      });
      right--;
    }
  }

  steps.push({
    arr: [...arr],
    result: [...result],
    left,
    right,
    writeIdx: -1,
    status: 'done',
    message: `🎉 平方排序完成！最终有序平方数组为 [${result.join(', ')}]。`,
    log: `算法完成：返回 result = [${result.join(', ')}]`,
    codeLine: 15,
  });

  return steps;
}

export class SortedSquaresVisualizer extends StepVisualizer<SSQStep> {
  protected codeLanguages = SQUARES_OF_SORTED_ARRAY_CODE_LANGUAGES;
  protected codeLines = SQUARES_OF_SORTED_ARRAY_CODE_LANGUAGES['java'];
  protected codePanelTitle = '有序数组的平方 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private inputTrackEl: HTMLElement | null = null;
  private outputTrackEl: HTMLElement | null = null;
  private metricLeftEl: HTMLElement | null = null;
  private metricRightEl: HTMLElement | null = null;
  private metricWriteEl: HTMLElement | null = null;
  private metricValEl: HTMLElement | null = null;
  private cmpLeftSqEl: HTMLElement | null = null;
  private cmpRightSqEl: HTMLElement | null = null;
  private cmpOpEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.inputTrackEl = this.root.querySelector('#sq-input-track');
    this.outputTrackEl = this.root.querySelector('#sq-output-track');
    this.metricLeftEl = this.root.querySelector('#metric-left');
    this.metricRightEl = this.root.querySelector('#metric-right');
    this.metricWriteEl = this.root.querySelector('#metric-write');
    this.metricValEl = this.root.querySelector('#metric-val');
    this.cmpLeftSqEl = this.root.querySelector('#cmp-left-sq');
    this.cmpRightSqEl = this.root.querySelector('#cmp-right-sq');
    this.cmpOpEl = this.root.querySelector('#cmp-op');
    this.liveTextEl = this.root.querySelector('#sq-live-text');
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
    this.root.querySelectorAll<HTMLButtonElement>('.sq-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const numsInput = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
        if (numsInput && btn.dataset.nums) {
          numsInput.value = btn.dataset.nums;
          this.start();
        }
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: SQUARES_OF_SORTED_ARRAY_PROBLEM_HTML,
      analysisHtml: SQUARES_OF_SORTED_ARRAY_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): SSQStep[] {
    const numsInput = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
    const arr = parseSortedArray(numsInput?.value || '-4, -1, 0, 3, 10');
    return buildSortedSquaresSteps(arr);
  }

  protected renderStep(step: SSQStep): void {
    const { arr, result, left, right, writeIdx, status, message } = step;

    // 1. 渲染输入数组 (上轨)
    if (this.inputTrackEl) {
      this.inputTrackEl.innerHTML = arr
        .map((num, idx) => {
          const isLeft = left === idx && status !== 'done';
          const isRight = right === idx && status !== 'done';
          const isSelected = (status === 'write-left' && isLeft) || (status === 'write-right' && isRight);

          let boxClasses = 'sq-cell-box';
          if (isLeft) boxClasses += ' is-active-left';
          if (isRight) boxClasses += ' is-active-right';

          const badges: string[] = [];
          if (isLeft && isRight) {
            badges.push('<span class="sq-ptr-badge left">left</span>');
            badges.push('<span class="sq-ptr-badge right">right</span>');
          } else {
            if (isLeft) badges.push('<span class="sq-ptr-badge left">left</span>');
            if (isRight) badges.push('<span class="sq-ptr-badge right">right</span>');
          }

          const sqVal = num * num;

          return `
            <div class="sq-cell-wrapper">
              <div class="sq-pointer-tags">
                ${badges.join('')}
              </div>
              <div class="${boxClasses}">
                <span class="val">${num}</span>
                <span class="sq-val">${sqVal}</span>
                <span class="idx">[${idx}]</span>
              </div>
            </div>
          `;
        })
        .join('');
    }

    // 2. 渲染结果数组 (下轨)
    if (this.outputTrackEl) {
      this.outputTrackEl.innerHTML = result
        .map((num, idx) => {
          const isWrite = writeIdx === idx && status !== 'done';
          const isFilled = num !== null;

          let boxClasses = 'sq-cell-box';
          if (isWrite) boxClasses += ' is-writing';
          if (isFilled) boxClasses += ' is-filled';

          const badges: string[] = [];
          if (isWrite) badges.push('<span class="sq-ptr-badge write">write</span>');

          return `
            <div class="sq-cell-wrapper">
              <div class="sq-pointer-tags">
                ${badges.join('')}
              </div>
              <div class="${boxClasses}">
                <span class="val">${num !== null ? num : '—'}</span>
                <span class="idx">[${idx}]</span>
              </div>
            </div>
          `;
        })
        .join('');
    }

    // 3. 更新状态监视器
    if (this.metricLeftEl) this.metricLeftEl.textContent = status === 'done' ? '结束' : `nums[${left}]=${arr[left]}`;
    if (this.metricRightEl) this.metricRightEl.textContent = status === 'done' ? '结束' : `nums[${right}]=${arr[right]}`;
    if (this.metricWriteEl) this.metricWriteEl.textContent = writeIdx >= 0 ? `result[${writeIdx}]` : '完成';

    if (left < arr.length && right >= 0 && status !== 'done') {
      const lsq = arr[left] * arr[left];
      const rsq = arr[right] * arr[right];
      if (this.cmpLeftSqEl) this.cmpLeftSqEl.textContent = `nums[${left}]² = ${lsq}`;
      if (this.cmpRightSqEl) this.cmpRightSqEl.textContent = `nums[${right}]² = ${rsq}`;
      if (this.cmpOpEl) this.cmpOpEl.textContent = lsq > rsq ? '>' : lsq < rsq ? '<' : '=';
      if (this.metricValEl) this.metricValEl.textContent = `${Math.max(lsq, rsq)}`;
    } else {
      if (this.cmpLeftSqEl) this.cmpLeftSqEl.textContent = '-';
      if (this.cmpRightSqEl) this.cmpRightSqEl.textContent = '-';
      if (this.cmpOpEl) this.cmpOpEl.textContent = '—';
      if (this.metricValEl) this.metricValEl.textContent = '完成';
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 4. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background = status === 'done' ? '#f0fdf4' : status.startsWith('write') ? '#eff6ff' : '#f8fafc';
      logEntry.style.color = status === 'done' ? '#15803d' : status.startsWith('write') ? '#1d4ed8' : '#334155';
      logEntry.style.border = '1px solid ' + (status === 'done' ? '#bbf7d0' : status.startsWith('write') ? '#bfdbfe' : '#e2e8f0');
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
    const stepCurEl = this.root?.querySelector('#step-cur');
    const stepTotalEl = this.root?.querySelector('#step-total');
    if (stepCurEl) stepCurEl.textContent = String(this.currentStepIndex + 1);
    if (stepTotalEl) stepTotalEl.textContent = String(this.steps.length);

    const badgeWrite = this.root?.querySelector('#badge-write');
    if (badgeWrite) {
      badgeWrite.textContent = writeIdx >= 0 ? `写入: result[${writeIdx}]` : '排序完成';
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
  id: 'sorted-squares',
  name: '有序数组的平方（双指针）',
  viewId: 'algo-sorted-squares-view',
  category: 'array',
  description: '首尾双指针从大到小填入结果数组',
  icon: '²',
  difficulty: 1,
  levelOrder: 3,
  learningGoal: '掌握利用有序性用双指针避免排序',
  template,
  Visualizer: SortedSquaresVisualizer,
});
