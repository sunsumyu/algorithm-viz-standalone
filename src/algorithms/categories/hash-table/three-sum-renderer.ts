/**
 * 三数之和可视化器 — 4-Card 标准现代架构
 * LeetCode 15：排序 + 双指针 + 去重剪枝
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  THREE_SUM_PROBLEM_HTML,
  THREE_SUM_ANALYSIS_HTML,
  THREE_SUM_CODE_LANGUAGES,
} from './three-sum-problem-content';
import template from './three-sum.html?raw';

export interface ThreeSumStep {
  array: number[];
  i: number;
  left: number;
  right: number;
  sum: number | null;
  results: [number, number, number][];
  status:
    | 'init'
    | 'sort'
    | 'i-check'
    | 'i-skip'
    | 'compare'
    | 'found'
    | 'left-advance'
    | 'right-advance'
    | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function parseThreeSumArray(input: string): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return arr.length >= 3 ? arr : [-1, 0, 1, 2, -1, -4];
}

export function buildThreeSumSteps(rawNums: number[]): ThreeSumStep[] {
  const steps: ThreeSumStep[] = [];
  const nums = [...rawNums];
  const results: [number, number, number][] = [];

  steps.push({
    array: [...nums],
    i: -1,
    left: -1,
    right: -1,
    sum: null,
    results: [],
    status: 'init',
    message: `初始数组: [${nums.join(', ')}]，准备进行升序排序。`,
    log: `初始化原始数组: [${nums.join(', ')}]`,
    codeLine: 1,
  });

  nums.sort((a, b) => a - b);
  steps.push({
    array: [...nums],
    i: -1,
    left: -1,
    right: -1,
    sum: null,
    results: [],
    status: 'sort',
    message: `对数组进行升序排序: [${nums.join(', ')}]。接下来使用外层循环固定 i，配合双指针 left、right 寻找三数之和为 0。`,
    log: `完成升序排序: [${nums.join(', ')}]`,
    codeLine: 3,
  });

  const n = nums.length;
  for (let i = 0; i < n - 2; i++) {
    if (nums[i] > 0) {
      steps.push({
        array: [...nums],
        i,
        left: -1,
        right: -1,
        sum: null,
        results: [...results],
        status: 'i-skip',
        message: `nums[${i}] = ${nums[i]} > 0，因为数组已升序排序，后续所有数字均大于 0，三数之和不可能为 0，提前终止搜索（剪枝）。`,
        log: `nums[${i}]=${nums[i]} > 0，剪枝终止`,
        codeLine: 5,
      });
      break;
    }

    if (i > 0 && nums[i] === nums[i - 1]) {
      steps.push({
        array: [...nums],
        i,
        left: -1,
        right: -1,
        sum: null,
        results: [...results],
        status: 'i-skip',
        message: `nums[${i}] = ${nums[i]} 与前一个元素 nums[${i - 1}] = ${nums[i - 1]} 重复，跳过当前 i 以避免产生重复三元组解（去重）。`,
        log: `跳过重复元素 nums[${i}]=${nums[i]}`,
        codeLine: 6,
      });
      continue;
    }

    let left = i + 1;
    let right = n - 1;

    steps.push({
      array: [...nums],
      i,
      left,
      right,
      sum: nums[i] + nums[left] + nums[right],
      results: [...results],
      status: 'i-check',
      message: `固定 i=${i} (nums[${i}]=${nums[i]})，初始化双指针 left=${left} (nums[${left}]=${nums[left]})，right=${right} (nums[${right}]=${nums[right]})。`,
      log: `固定 i=${i}, left=${left}, right=${right}`,
      codeLine: 7,
    });

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];

      if (sum === 0) {
        results.push([nums[i], nums[left], nums[right]]);
        steps.push({
          array: [...nums],
          i,
          left,
          right,
          sum: 0,
          results: [...results],
          status: 'found',
          message: `🎉 找到解！nums[${i}] (${nums[i]}) + nums[${left}] (${nums[left]}) + nums[${right}] (${nums[right]}) = 0。记录三元组 [${nums[i]}, ${nums[left]}, ${nums[right]}]。`,
          log: `✓ 命中三元组: [${nums[i]}, ${nums[left]}, ${nums[right]}]`,
          codeLine: [10, 11],
        });

        // 去重 left 和 right
        while (left < right && nums[left] === nums[left + 1]) {
          left++;
        }
        while (left < right && nums[right] === nums[right - 1]) {
          right--;
        }

        left++;
        right--;

        if (left < right) {
          steps.push({
            array: [...nums],
            i,
            left,
            right,
            sum: nums[i] + nums[left] + nums[right],
            results: [...results],
            status: 'compare',
            message: `去重后双指针同时内缩：left 移至 ${left}，right 移至 ${right}，继续寻找。`,
            log: `双指针内缩: left=${left}, right=${right}`,
            codeLine: 14,
          });
        }
      } else if (sum < 0) {
        steps.push({
          array: [...nums],
          i,
          left,
          right,
          sum,
          results: [...results],
          status: 'left-advance',
          message: `三数之和 sum = ${nums[i]} + ${nums[left]} + ${nums[right]} = ${sum} < 0，和偏小，将 left 右移以增大和。`,
          log: `sum=${sum} < 0, left++ (${left} -> ${left + 1})`,
          codeLine: 16,
        });
        left++;
      } else {
        steps.push({
          array: [...nums],
          i,
          left,
          right,
          sum,
          results: [...results],
          status: 'right-advance',
          message: `三数之和 sum = ${nums[i]} + ${nums[left]} + ${nums[right]} = ${sum} > 0，和偏大，将 right 左移以减小和。`,
          log: `sum=${sum} > 0, right-- (${right} -> ${right - 1})`,
          codeLine: 18,
        });
        right--;
      }
    }
  }

  steps.push({
    array: [...nums],
    i: -1,
    left: -1,
    right: -1,
    sum: null,
    results: [...results],
    status: 'done',
    message: `🎉 搜索完成！共找到 ${results.length} 个不重复的三元组解：${JSON.stringify(results)}。`,
    log: `三数之和求解完毕，共 ${results.length} 组解`,
    codeLine: 23,
  });

  return steps;
}

export class ThreeSumVisualizer extends StepVisualizer<ThreeSumStep> {
  protected codeLanguages = THREE_SUM_CODE_LANGUAGES;
  protected codeLines = THREE_SUM_CODE_LANGUAGES['java'];
  protected codePanelTitle = '三数之和 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private trackRowEl: HTMLElement | null = null;
  private resultsGridEl: HTMLElement | null = null;
  private metricIEl: HTMLElement | null = null;
  private metricLeftEl: HTMLElement | null = null;
  private metricRightEl: HTMLElement | null = null;
  private metricSumEl: HTMLElement | null = null;
  private formulaIEl: HTMLElement | null = null;
  private formulaLeftEl: HTMLElement | null = null;
  private formulaRightEl: HTMLElement | null = null;
  private formulaSumEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.trackRowEl = this.root.querySelector('#th-track-row');
    this.resultsGridEl = this.root.querySelector('#th-results-grid');
    this.metricIEl = this.root.querySelector('#metric-i');
    this.metricLeftEl = this.root.querySelector('#metric-left');
    this.metricRightEl = this.root.querySelector('#metric-right');
    this.metricSumEl = this.root.querySelector('#metric-sum');
    this.formulaIEl = this.root.querySelector('#formula-i');
    this.formulaLeftEl = this.root.querySelector('#formula-left');
    this.formulaRightEl = this.root.querySelector('#formula-right');
    this.formulaSumEl = this.root.querySelector('#formula-sum');
    this.liveTextEl = this.root.querySelector('#th-live-text');
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
    this.root.querySelectorAll<HTMLButtonElement>.bind(this.root)('.th-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const numsInput = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
        if (numsInput && btn.dataset.nums) numsInput.value = btn.dataset.nums;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: THREE_SUM_PROBLEM_HTML,
      analysisHtml: THREE_SUM_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): ThreeSumStep[] {
    const numsInput = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
    const nums = parseThreeSumArray(numsInput?.value || '-1, 0, 1, 2, -1, -4');
    return buildThreeSumSteps(nums);
  }

  protected renderStep(step: ThreeSumStep): void {
    const { array, i, left, right, sum, results, status, message } = step;

    // 1. 渲染排序数组与三指针
    if (this.trackRowEl) {
      this.trackRowEl.innerHTML = array
        .map((num, idx) => {
          const isI = i === idx;
          const isLeft = left === idx;
          const isRight = right === idx;

          let boxClasses = 'th-cell-box';
          if (isI) boxClasses += ' is-i';
          if (isLeft) boxClasses += ' is-left';
          if (isRight) boxClasses += ' is-right';

          const badges: string[] = [];
          if (isI) badges.push('<span class="th-ptr-badge i">i</span>');
          if (isLeft) badges.push('<span class="th-ptr-badge left">L</span>');
          if (isRight) badges.push('<span class="th-ptr-badge right">R</span>');

          return `
            <div class="th-cell-wrapper">
              <div class="th-pointer-tags">${badges.join('')}</div>
              <div class="${boxClasses}">
                <span class="val">${num}</span>
                <span class="idx">[${idx}]</span>
              </div>
            </div>
          `;
        })
        .join('');
    }

    // 2. 渲染已捕获解
    if (this.resultsGridEl) {
      if (results.length === 0) {
        this.resultsGridEl.innerHTML = '<span style="color: #94a3b8; font-size: 11px;">(暂无三元组解)</span>';
      } else {
        this.resultsGridEl.innerHTML = results
          .map(
            ([a, b, c]) => `
          <div class="th-result-chip">
            <span>[${a}, ${b}, ${c}]</span>
          </div>
        `
          )
          .join('');
      }
    }

    // 3. 更新状态监视器
    if (this.metricIEl) {
      this.metricIEl.textContent = i >= 0 ? `[${i}]=${array[i]}` : '—';
    }
    if (this.metricLeftEl) {
      this.metricLeftEl.textContent = left >= 0 ? `[${left}]=${array[left]}` : '—';
    }
    if (this.metricRightEl) {
      this.metricRightEl.textContent = right >= 0 ? `[${right}]=${array[right]}` : '—';
    }
    if (this.metricSumEl) {
      this.metricSumEl.textContent = sum !== null ? String(sum) : '—';
      this.metricSumEl.style.color = sum === 0 ? '#10b981' : sum !== null && sum < 0 ? '#3b82f6' : '#f59e0b';
    }

    if (this.formulaIEl) this.formulaIEl.textContent = i >= 0 ? String(array[i]) : 'nums[i]';
    if (this.formulaLeftEl) this.formulaLeftEl.textContent = left >= 0 ? String(array[left]) : 'nums[left]';
    if (this.formulaRightEl) this.formulaRightEl.textContent = right >= 0 ? String(array[right]) : 'nums[right]';
    if (this.formulaSumEl) this.formulaSumEl.textContent = sum !== null ? String(sum) : 'sum';

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 4. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background = status === 'found' ? '#f0fdf4' : '#eff6ff';
      logEntry.style.color = status === 'found' ? '#15803d' : '#1d4ed8';
      logEntry.style.border = '1px solid ' + (status === 'found' ? '#bbf7d0' : '#bfdbfe');
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
  id: 'three-sum',
  name: '三数之和（排序+双指针）',
  viewId: 'algo-three-sum-view',
  category: 'hash-table',
  description: '排序后双指针求和为0的三元组',
  icon: '🎯',
  difficulty: 3,
  levelOrder: 2,
  learningGoal: '掌握排序 + 双指针 + 去重的三数求和技巧',
  template,
  Visualizer: ThreeSumVisualizer,
});
