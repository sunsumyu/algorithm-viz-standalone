/**
 * 移除元素可视化器 — 4-Card 标准现代架构
 * LeetCode 27：快慢双指针原地覆盖
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  REMOVE_ELEMENT_PROBLEM_HTML,
  REMOVE_ELEMENT_ANALYSIS_HTML,
  REMOVE_ELEMENT_CODE_LANGUAGES,
} from './remove-element-problem-content';
import template from './remove-element.html?raw';

export interface RemoveStep {
  array: number[];
  fast: number;
  slow: number;
  val: number;
  status: 'check' | 'skip' | 'copy' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function parseArray(input: string): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return arr.length > 0 ? arr : [3, 2, 2, 3];
}

export function buildRemoveElementSteps(arr: number[], val: number): RemoveStep[] {
  const steps: RemoveStep[] = [];
  let slow = 0;
  const work = [...arr];

  steps.push({
    array: [...work],
    fast: 0,
    slow: 0,
    val,
    status: 'check',
    message: `初始化 slow = 0，fast 从 0 开始遍历，待移除的目标值 val = ${val}。`,
    log: `初始化快慢指针：slow=0, fast=0, val=${val}`,
    codeLine: 2,
  });

  for (let fast = 0; fast < work.length; fast++) {
    steps.push({
      array: [...work],
      fast,
      slow,
      val,
      status: 'check',
      message: `快指针 fast=${fast}，检查 nums[${fast}]=${work[fast]} 是否等于 val=${val}。`,
      log: `检查 nums[${fast}] = ${work[fast]}`,
      codeLine: 3,
    });

    if (work[fast] !== val) {
      const prevVal = work[slow];
      work[slow] = work[fast];
      steps.push({
        array: [...work],
        fast,
        slow,
        val,
        status: 'copy',
        message: `nums[fast]=${work[fast]} ≠ val，保留此元素：覆写到 nums[slow=${slow}]（原值 ${prevVal}），slow++ → ${slow + 1}。`,
        log: `保留元素: nums[${slow}] = ${work[fast]}，slow 右移至 ${slow + 1}`,
        codeLine: [4, 5],
      });
      slow++;
    } else {
      steps.push({
        array: [...work],
        fast,
        slow,
        val,
        status: 'skip',
        message: `nums[fast]=${work[fast]} == val，遇到待移除元素，跳过不复制，慢指针 slow 保持在 ${slow}。`,
        log: `跳过目标值: nums[${fast}] == ${val}`,
        codeLine: 3,
      });
    }
  }

  steps.push({
    array: [...work],
    fast: work.length,
    slow,
    val,
    status: 'done',
    message: `🎉 遍历完成！新数组有效长度为 slow = ${slow}，前 ${slow} 个元素为最终保留结果 [${work.slice(0, slow).join(', ')}]。`,
    log: `算法结束：返回有效长度 slow = ${slow}`,
    codeLine: 8,
  });

  return steps;
}

export class RemoveElementVisualizer extends StepVisualizer<RemoveStep> {
  protected codeLanguages = REMOVE_ELEMENT_CODE_LANGUAGES;
  protected codeLines = REMOVE_ELEMENT_CODE_LANGUAGES['java'];
  protected codePanelTitle = '移除元素 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private trackRowEl: HTMLElement | null = null;
  private metricSlowEl: HTMLElement | null = null;
  private metricFastEl: HTMLElement | null = null;
  private metricCurrEl: HTMLElement | null = null;
  private metricKeptEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.trackRowEl = this.root.querySelector('#rm-track-row');
    this.metricSlowEl = this.root.querySelector('#metric-slow');
    this.metricFastEl = this.root.querySelector('#metric-fast');
    this.metricCurrEl = this.root.querySelector('#metric-curr');
    this.metricKeptEl = this.root.querySelector('#metric-kept');
    this.liveTextEl = this.root.querySelector('#rm-live-text');
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
    this.root.querySelectorAll<HTMLButtonElement>('.rm-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const numsInput = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
        const valInput = this.root?.querySelector('#input-val') as HTMLInputElement | null;
        if (numsInput && btn.dataset.nums) numsInput.value = btn.dataset.nums;
        if (valInput && btn.dataset.val) valInput.value = btn.dataset.val;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: REMOVE_ELEMENT_PROBLEM_HTML,
      analysisHtml: REMOVE_ELEMENT_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): RemoveStep[] {
    const numsInput = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
    const valInput = this.root?.querySelector('#input-val') as HTMLInputElement | null;
    const arr = parseArray(numsInput?.value || '3, 2, 2, 3, 4, 3, 5');
    const val = parseInt(valInput?.value || '3', 10);
    return buildRemoveElementSteps(arr, isNaN(val) ? 3 : val);
  }

  protected renderStep(step: RemoveStep): void {
    const { array, fast, slow, val, status, message } = step;

    // 1. 渲染沙盘 Cell 数组
    if (this.trackRowEl) {
      this.trackRowEl.innerHTML = array
        .map((num, idx) => {
          const isFast = fast === idx;
          const isSlow = slow === idx;
          const isTargetVal = num === val;
          const isKept = idx < slow && status !== 'done';
          const isFinalKept = status === 'done' && idx < slow;

          let boxClasses = 'rm-cell-box';
          if (isFast) boxClasses += ' is-active-fast';
          if (isSlow && !isFast) boxClasses += ' is-active-slow';
          if (isFinalKept || isKept) boxClasses += ' is-kept';
          else if (isTargetVal && isFast) boxClasses += ' is-target';

          const badges: string[] = [];
          if (isSlow && isFast) {
            badges.push('<span class="rm-ptr-badge slow">slow</span>');
            badges.push('<span class="rm-ptr-badge fast">fast</span>');
          } else {
            if (isSlow && idx < array.length) badges.push('<span class="rm-ptr-badge slow">slow</span>');
            if (isFast && idx < array.length) badges.push('<span class="rm-ptr-badge fast">fast</span>');
          }

          return `
            <div class="rm-cell-wrapper">
              <div class="rm-pointer-tags">
                ${badges.join('')}
              </div>
              <div class="${boxClasses}">
                <span class="val">${num}</span>
                <span class="idx">[${idx}]</span>
              </div>
            </div>
          `;
        })
        .join('');
    }

    // 2. 更新状态监视器
    if (this.metricSlowEl) this.metricSlowEl.textContent = String(slow);
    if (this.metricFastEl) this.metricFastEl.textContent = fast < array.length ? String(fast) : '结束';
    if (this.metricCurrEl) {
      this.metricCurrEl.textContent = fast < array.length ? `nums[${fast}]=${array[fast]}` : '-';
    }
    if (this.metricKeptEl) this.metricKeptEl.textContent = String(slow);
    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 3. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background = status === 'done' ? '#f0fdf4' : status === 'copy' ? '#eff6ff' : '#f8fafc';
      logEntry.style.color = status === 'done' ? '#15803d' : status === 'copy' ? '#1d4ed8' : '#334155';
      logEntry.style.border = '1px solid ' + (status === 'done' ? '#bbf7d0' : status === 'copy' ? '#bfdbfe' : '#e2e8f0');
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
    const stepCurEl = this.root?.querySelector('#step-cur');
    const stepTotalEl = this.root?.querySelector('#step-total');
    if (stepCurEl) stepCurEl.textContent = String(this.currentStepIndex + 1);
    if (stepTotalEl) stepTotalEl.textContent = String(this.steps.length);

    const badgeSlow = this.root?.querySelector('#badge-slow');
    if (badgeSlow) {
      badgeSlow.textContent = status === 'done' ? `最终新长度: ${slow}` : `新长度: slow = ${slow}`;
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
  id: 'remove-element',
  name: '移除元素（双指针）',
  viewId: 'algo-remove-element-view',
  category: 'array',
  description: '快慢指针原地移除指定值的元素',
  icon: '🧹',
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握快慢双指针原地修改数组的思路',
  template,
  Visualizer: RemoveElementVisualizer,
});
