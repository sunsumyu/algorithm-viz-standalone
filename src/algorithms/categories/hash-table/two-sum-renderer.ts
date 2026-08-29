/**
 * 两数之和可视化器 — 4-Card 标准现代架构
 * LeetCode 1：哈希表一次遍历
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  TWO_SUM_PROBLEM_HTML,
  TWO_SUM_ANALYSIS_HTML,
  TWO_SUM_CODE_LANGUAGES,
} from './two-sum-problem-content';
import template from './two-sum.html?raw';

export interface TwoSumStep {
  array: number[];
  currentIndex: number;
  currentVal: number;
  complement: number;
  mapEntries: [number, number][]; // [key, value]
  matchedIndices: [number, number] | null;
  status: 'init' | 'check' | 'found' | 'insert' | 'not-found';
  result?: [number, number];
  message: string;
  log: string;
  codeLine: number | number[];
}

export function parseArray(input: string): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return arr.length > 0 ? arr : [2, 7, 11, 15];
}

export function buildTwoSumSteps(nums: number[], target: number): TwoSumStep[] {
  const steps: TwoSumStep[] = [];
  const map = new Map<number, number>();

  steps.push({
    array: [...nums],
    currentIndex: -1,
    currentVal: 0,
    complement: 0,
    mapEntries: [],
    matchedIndices: null,
    status: 'init',
    message: `初始化哈希表 Map，准备单次遍历寻找两数之和等于 target = ${target}。`,
    log: `初始化 HashMap，target = ${target}`,
    codeLine: 2,
  });

  for (let i = 0; i < nums.length; i++) {
    const cur = nums[i];
    const complement = target - cur;

    steps.push({
      array: [...nums],
      currentIndex: i,
      currentVal: cur,
      complement,
      mapEntries: Array.from(map.entries()),
      matchedIndices: null,
      status: 'check',
      message: `遍历到 i=${i} (nums[${i}]=${cur})，需要补数 complement = ${target} - ${cur} = ${complement}。查询哈希表中是否存在键 ${complement}。`,
      log: `i=${i}: nums[${i}]=${cur}, 查找补数 ${complement}`,
      codeLine: [3, 4],
    });

    if (map.has(complement)) {
      const prevIdx = map.get(complement)!;
      steps.push({
        array: [...nums],
        currentIndex: i,
        currentVal: cur,
        complement,
        mapEntries: Array.from(map.entries()),
        matchedIndices: [prevIdx, i],
        status: 'found',
        result: [prevIdx, i],
        message: `🎉 在哈希表中找到补数 ${complement} (位于下标 ${prevIdx})！成功配对：nums[${prevIdx}] (${complement}) + nums[${i}] (${cur}) = ${target}。返回下标 [${prevIdx}, ${i}]。`,
        log: `✓ 命中！找到配对 [${prevIdx}, ${i}]`,
        codeLine: [5, 6],
      });
      return steps;
    }

    map.set(cur, i);
    steps.push({
      array: [...nums],
      currentIndex: i,
      currentVal: cur,
      complement,
      mapEntries: Array.from(map.entries()),
      matchedIndices: null,
      status: 'insert',
      message: `哈希表中未找到 ${complement}，将当前键值对 (${cur} -> ${i}) 存入哈希表，继续向后扫描。`,
      log: `存入 HashMap: { ${cur} => ${i} }`,
      codeLine: 8,
    });
  }

  steps.push({
    array: [...nums],
    currentIndex: nums.length,
    currentVal: 0,
    complement: 0,
    mapEntries: Array.from(map.entries()),
    matchedIndices: null,
    status: 'not-found',
    message: `遍历结束，未找到和为 ${target} 的两数对。`,
    log: `未找到有效解`,
    codeLine: 10,
  });

  return steps;
}

export class TwoSumVisualizer extends StepVisualizer<TwoSumStep> {
  protected codeLanguages = TWO_SUM_CODE_LANGUAGES;
  protected codeLines = TWO_SUM_CODE_LANGUAGES['java'];
  protected codePanelTitle = '两数之和 代码调试';

  private trackRowEl: HTMLElement | null = null;
  private mapGridEl: HTMLElement | null = null;
  private metricIEl: HTMLElement | null = null;
  private metricCurValEl: HTMLElement | null = null;
  private metricCompEl: HTMLElement | null = null;
  private metricStatusEl: HTMLElement | null = null;
  private formulaTargetEl: HTMLElement | null = null;
  private formulaNumEl: HTMLElement | null = null;
  private formulaCompEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.trackRowEl = this.root.querySelector('#ts-track-row');
    this.mapGridEl = this.root.querySelector('#ts-map-grid');
    this.metricIEl = this.root.querySelector('#metric-i');
    this.metricCurValEl = this.root.querySelector('#metric-cur-val');
    this.metricCompEl = this.root.querySelector('#metric-comp');
    this.metricStatusEl = this.root.querySelector('#metric-status');
    this.formulaTargetEl = this.root.querySelector('#formula-target');
    this.formulaNumEl = this.root.querySelector('#formula-num');
    this.formulaCompEl = this.root.querySelector('#formula-comp');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.ts-chip').forEach((btn) => {
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
      problemHtml: TWO_SUM_PROBLEM_HTML,
      analysisHtml: TWO_SUM_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): TwoSumStep[] {
    const numsInput = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
    const targetInput = this.root?.querySelector('#input-target') as HTMLInputElement | null;
    const nums = parseArray(numsInput?.value || '2, 7, 11, 15');
    const target = parseInt(targetInput?.value || '9', 10);
    return buildTwoSumSteps(nums, isNaN(target) ? 9 : target);
  }

  protected renderStep(step: TwoSumStep): void {
    const { array, currentIndex, currentVal, complement, mapEntries, matchedIndices, status, message } = step;

    // 1. 渲染原数组与指针
    if (this.trackRowEl) {
      this.trackRowEl.innerHTML = array
        .map((num, idx) => {
          const isCurrent = currentIndex === idx && status !== 'found';
          const isMatched = matchedIndices && (matchedIndices[0] === idx || matchedIndices[1] === idx);

          let boxClasses = 'ts-cell-box';
          if (isMatched) boxClasses += ' is-matched';
          else if (isCurrent) boxClasses += ' is-current';

          const badges: string[] = [];
          if (isMatched) {
            badges.push('<span class="ts-ptr-badge" style="background:#22c55e;">Match</span>');
          } else if (isCurrent) {
            badges.push('<span class="ts-ptr-badge">i</span>');
          }

          return `
            <div class="ts-cell-wrapper">
              ${badges.join('')}
              <div class="${boxClasses}">
                <span class="val">${num}</span>
                <span class="idx">[${idx}]</span>
              </div>
            </div>
          `;
        })
        .join('');
    }

    // 2. 渲染 HashMap 键值对
    if (this.mapGridEl) {
      if (mapEntries.length === 0) {
        this.mapGridEl.innerHTML = '<span style="color: #94a3b8; font-size: 11px;">(哈希表当前为空)</span>';
      } else {
        this.mapGridEl.innerHTML = mapEntries
          .map(([key, valIdx]) => {
            const isTarget = (status === 'check' || status === 'found') && key === complement;
            let chipClass = 'ts-map-chip';
            if (isTarget) chipClass += ' is-target-key';

            return `
              <div class="${chipClass}">
                <span style="color: #3b82f6; font-weight: 700;">Key: ${key}</span>
                <span style="color: #94a3b8;">&rarr;</span>
                <span style="color: #059669; font-weight: 700;">Idx: ${valIdx}</span>
              </div>
            `;
          })
          .join('');
      }
    }

    // 3. 更新状态监视器
    if (this.metricIEl) this.metricIEl.textContent = currentIndex >= 0 ? String(currentIndex) : '—';
    if (this.metricCurValEl) this.metricCurValEl.textContent = currentIndex >= 0 ? String(currentVal) : '—';
    if (this.metricCompEl) this.metricCompEl.textContent = currentIndex >= 0 ? String(complement) : '—';
    if (this.metricStatusEl) {
      this.metricStatusEl.textContent =
        status === 'found' ? '✓ 命中配对！' : status === 'check' ? '查找中...' : status === 'insert' ? '存入 Map' : '等待';
      this.metricStatusEl.style.color = status === 'found' ? '#10b981' : '#3b82f6';
    }

    const targetInput = this.root?.querySelector('#input-target') as HTMLInputElement | null;
    const target = targetInput?.value || '9';
    if (this.formulaTargetEl) this.formulaTargetEl.textContent = target;
    if (this.formulaNumEl) this.formulaNumEl.textContent = currentIndex >= 0 ? String(currentVal) : 'nums[i]';
    if (this.formulaCompEl) this.formulaCompEl.textContent = currentIndex >= 0 ? String(complement) : 'target - nums[i]';

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

    const badgeStatus = this.root?.querySelector('#badge-status');
    if (badgeStatus) {
      badgeStatus.textContent =
        status === 'found' ? '✓ 命中配对！' : status === 'check' ? '查找中...' : status === 'insert' ? '存入 Map' : '等待';
    }
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
  }
}

registerAlgorithm({
  id: 'two-sum',
  name: '两数之和（哈希表）',
  viewId: 'algo-two-sum-view',
  category: 'hash-table',
  description: '哈希表一次遍历求两数之和',
  icon: '🔗',
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '理解哈希表如何替代暴力枚举降低时间复杂度',
  template,
  Visualizer: TwoSumVisualizer,
});
