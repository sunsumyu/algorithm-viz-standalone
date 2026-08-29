/**
 * 四数之和可视化器 — 4-Card 标准现代架构
 * LeetCode 18：双层 for 循环 + 双指针 + 两级去重剪枝
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  FOUR_SUM_PROBLEM_HTML,
  FOUR_SUM_ANALYSIS_HTML,
  FOUR_SUM_CODE_LANGUAGES,
} from './four-sum-problem-content';
import template from './four-sum.html?raw';

export interface FourSumStep {
  array: number[];
  i: number;
  j: number;
  left: number;
  right: number;
  sum: number | null;
  target: number;
  results: [number, number, number, number][];
  status:
    | 'init'
    | 'sort'
    | 'i-check'
    | 'i-skip'
    | 'j-check'
    | 'j-skip'
    | 'compare'
    | 'found'
    | 'left-advance'
    | 'right-advance'
    | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function parseFourSumArray(input: string): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return arr.length >= 4 ? arr : [1, 0, -1, 0, -2, 2];
}

export function buildFourSumSteps(rawNums: number[], target: number): FourSumStep[] {
  const steps: FourSumStep[] = [];
  const nums = [...rawNums];
  const results: [number, number, number, number][] = [];

  steps.push({
    array: [...nums],
    i: -1,
    j: -1,
    left: -1,
    right: -1,
    sum: null,
    target,
    results: [],
    status: 'init',
    message: `初始数组: [${nums.join(', ')}]，目标 target = ${target}。`,
    log: `初始化原始数组，target = ${target}`,
    codeLine: 1,
  });

  nums.sort((a, b) => a - b);
  steps.push({
    array: [...nums],
    i: -1,
    j: -1,
    left: -1,
    right: -1,
    sum: null,
    target,
    results: [],
    status: 'sort',
    message: `对数组进行升序排序: [${nums.join(', ')}]。接下来使用外层循环 i、内层循环 j，配合双指针 left、right 扫描。`,
    log: `完成升序排序: [${nums.join(', ')}]`,
    codeLine: 3,
  });

  const n = nums.length;
  for (let i = 0; i < n - 3; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) {
      steps.push({
        array: [...nums],
        i,
        j: -1,
        left: -1,
        right: -1,
        sum: null,
        target,
        results: [...results],
        status: 'i-skip',
        message: `nums[${i}] = ${nums[i]} 与 nums[${i - 1}] 重复，跳过当前 i 以避免重复（第一级去重）。`,
        log: `跳过重复 i: nums[${i}]=${nums[i]}`,
        codeLine: 6,
      });
      continue;
    }

    for (let j = i + 1; j < n - 2; j++) {
      if (j > i + 1 && nums[j] === nums[j - 1]) {
        steps.push({
          array: [...nums],
          i,
          j,
          left: -1,
          right: -1,
          sum: null,
          target,
          results: [...results],
          status: 'j-skip',
          message: `nums[${j}] = ${nums[j]} 与 nums[${j - 1}] 重复，跳过当前 j（第二级去重）。`,
          log: `跳过重复 j: nums[${j}]=${nums[j]}`,
          codeLine: 8,
        });
        continue;
      }

      let left = j + 1;
      let right = n - 1;

      steps.push({
        array: [...nums],
        i,
        j,
        left,
        right,
        sum: nums[i] + nums[j] + nums[left] + nums[right],
        target,
        results: [...results],
        status: 'j-check',
        message: `固定 i=${i}(${nums[i]}), j=${j}(${nums[j]})，初始化双指针 left=${left}(${nums[left]}), right=${right}(${nums[right]})。`,
        log: `固定 i=${i}, j=${j}, left=${left}, right=${right}`,
        codeLine: 9,
      });

      while (left < right) {
        const sum = nums[i] + nums[j] + nums[left] + nums[right];

        if (sum === target) {
          results.push([nums[i], nums[j], nums[left], nums[right]]);
          steps.push({
            array: [...nums],
            i,
            j,
            left,
            right,
            sum,
            target,
            results: [...results],
            status: 'found',
            message: `🎉 找到解！nums[${i}] (${nums[i]}) + nums[${j}] (${nums[j]}) + nums[${left}] (${nums[left]}) + nums[${right}] (${nums[right]}) = ${target}。记录四元组 [${nums[i]}, ${nums[j]}, ${nums[left]}, ${nums[right]}]。`,
            log: `✓ 命中四元组: [${nums[i]}, ${nums[j]}, ${nums[left]}, ${nums[right]}]`,
            codeLine: [12, 13],
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
              j,
              left,
              right,
              sum: nums[i] + nums[j] + nums[left] + nums[right],
              target,
              results: [...results],
              status: 'compare',
              message: `去重后双指针内缩：left 移至 ${left}，right 移至 ${right}。`,
              log: `双指针内缩: left=${left}, right=${right}`,
              codeLine: 16,
            });
          }
        } else if (sum < target) {
          steps.push({
            array: [...nums],
            i,
            j,
            left,
            right,
            sum,
            target,
            results: [...results],
            status: 'left-advance',
            message: `四数之和 sum = ${sum} < target (${target})，和偏小，left++ 右移以增大总和。`,
            log: `sum=${sum} < ${target}, left++ (${left} -> ${left + 1})`,
            codeLine: 18,
          });
          left++;
        } else {
          steps.push({
            array: [...nums],
            i,
            j,
            left,
            right,
            sum,
            target,
            results: [...results],
            status: 'right-advance',
            message: `四数之和 sum = ${sum} > target (${target})，和偏大，right-- 左移以减小总和。`,
            log: `sum=${sum} > ${target}, right-- (${right} -> ${right - 1})`,
            codeLine: 20,
          });
          right--;
        }
      }
    }
  }

  steps.push({
    array: [...nums],
    i: -1,
    j: -1,
    left: -1,
    right: -1,
    sum: null,
    target,
    results: [...results],
    status: 'done',
    message: `🎉 搜索完成！共找到 ${results.length} 个不重复的四元组解：${JSON.stringify(results)}。`,
    log: `四数之和求解完毕，共 ${results.length} 组解`,
    codeLine: 26,
  });

  return steps;
}

export class FourSumVisualizer extends StepVisualizer<FourSumStep> {
  protected codeLanguages = FOUR_SUM_CODE_LANGUAGES;
  protected codeLines = FOUR_SUM_CODE_LANGUAGES['java'];
  protected codePanelTitle = '四数之和 代码调试';

  private trackRowEl: HTMLElement | null = null;
  private resultsGridEl: HTMLElement | null = null;
  private metricIjEl: HTMLElement | null = null;
  private metricLrEl: HTMLElement | null = null;
  private metricSumEl: HTMLElement | null = null;
  private metricTargetEl: HTMLElement | null = null;
  private formulaIEl: HTMLElement | null = null;
  private formulaJEl: HTMLElement | null = null;
  private formulaLeftEl: HTMLElement | null = null;
  private formulaRightEl: HTMLElement | null = null;
  private formulaSumEl: HTMLElement | null = null;
  private formulaTargetEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.trackRowEl = this.root.querySelector('#fs-track-row');
    this.resultsGridEl = this.root.querySelector('#fs-results-grid');
    this.metricIjEl = this.root.querySelector('#metric-ij');
    this.metricLrEl = this.root.querySelector('#metric-lr');
    this.metricSumEl = this.root.querySelector('#metric-sum');
    this.metricTargetEl = this.root.querySelector('#metric-target');
    this.formulaIEl = this.root.querySelector('#formula-i');
    this.formulaJEl = this.root.querySelector('#formula-j');
    this.formulaLeftEl = this.root.querySelector('#formula-left');
    this.formulaRightEl = this.root.querySelector('#formula-right');
    this.formulaSumEl = this.root.querySelector('#formula-sum');
    this.formulaTargetEl = this.root.querySelector('#formula-target');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.fs-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const numsInput = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
        const targetInput = this.root?.querySelector('#input-target') as HTMLInputElement | null;
        if (numsInput && btn.dataset.nums) numsInput.value = btn.dataset.nums;
        if (targetInput && btn.dataset.target) targetInput.value = btn.dataset.target;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: FOUR_SUM_PROBLEM_HTML,
      analysisHtml: FOUR_SUM_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): FourSumStep[] {
    const numsInput = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
    const targetInput = this.root?.querySelector('#input-target') as HTMLInputElement | null;
    const nums = parseFourSumArray(numsInput?.value || '1, 0, -1, 0, -2, 2');
    const target = parseInt(targetInput?.value || '0', 10);
    return buildFourSumSteps(nums, isNaN(target) ? 0 : target);
  }

  protected renderStep(step: FourSumStep): void {
    const { array, i, j, left, right, sum, target, results, status, message } = step;

    // 1. 渲染排序数组与四指针
    if (this.trackRowEl) {
      this.trackRowEl.innerHTML = array
        .map((num, idx) => {
          const isI = i === idx;
          const isJ = j === idx;
          const isLeft = left === idx;
          const isRight = right === idx;

          let boxClasses = 'fs-cell-box';
          if (isI) boxClasses += ' is-i';
          if (isJ) boxClasses += ' is-j';
          if (isLeft) boxClasses += ' is-left';
          if (isRight) boxClasses += ' is-right';

          const badges: string[] = [];
          if (isI) badges.push('<span class="fs-ptr-badge i">i</span>');
          if (isJ) badges.push('<span class="fs-ptr-badge j">j</span>');
          if (isLeft) badges.push('<span class="fs-ptr-badge left">L</span>');
          if (isRight) badges.push('<span class="fs-ptr-badge right">R</span>');

          return `
            <div class="fs-cell-wrapper">
              <div class="fs-pointer-tags">${badges.join('')}</div>
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
        this.resultsGridEl.innerHTML = '<span style="color: #94a3b8; font-size: 11px;">(暂无四元组解)</span>';
      } else {
        this.resultsGridEl.innerHTML = results
          .map(
            ([a, b, c, d]) => `
          <div class="fs-result-chip">
            <span>[${a}, ${b}, ${c}, ${d}]</span>
          </div>
        `
          )
          .join('');
      }
    }

    // 3. 更新状态监视器
    if (this.metricIjEl) {
      this.metricIjEl.textContent = i >= 0 && j >= 0 ? `i=${array[i]}, j=${array[j]}` : '—';
    }
    if (this.metricLrEl) {
      this.metricLrEl.textContent = left >= 0 && right >= 0 ? `L=${array[left]}, R=${array[right]}` : '—';
    }
    if (this.metricSumEl) {
      this.metricSumEl.textContent = sum !== null ? String(sum) : '—';
      this.metricSumEl.style.color =
        sum === target ? '#10b981' : sum !== null && sum < target ? '#3b82f6' : '#f59e0b';
    }
    if (this.metricTargetEl) this.metricTargetEl.textContent = String(target);

    if (this.formulaIEl) this.formulaIEl.textContent = i >= 0 ? String(array[i]) : 'nums[i]';
    if (this.formulaJEl) this.formulaJEl.textContent = j >= 0 ? String(array[j]) : 'nums[j]';
    if (this.formulaLeftEl) this.formulaLeftEl.textContent = left >= 0 ? String(array[left]) : 'nums[left]';
    if (this.formulaRightEl) this.formulaRightEl.textContent = right >= 0 ? String(array[right]) : 'nums[right]';
    if (this.formulaSumEl) this.formulaSumEl.textContent = sum !== null ? String(sum) : 'sum';
    if (this.formulaTargetEl) this.formulaTargetEl.textContent = String(target);

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
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
  }
}

registerAlgorithm({
  id: 'four-sum',
  name: '四数之和（排序+双指针）',
  viewId: 'algo-four-sum-view',
  category: 'hash-table',
  description: '排序后固定 i/j 再双指针求和为 target 的四元组',
  icon: '🎯',
  difficulty: 3,
  levelOrder: 3,
  learningGoal: '掌握嵌套双指针 + 多层去重的四数求和技巧',
  template,
  Visualizer: FourSumVisualizer,
});
