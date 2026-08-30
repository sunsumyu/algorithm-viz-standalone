/**
 * 两个数组的交集可视化器 — 4-Card 标准现代架构
 * LeetCode 349：哈希集合 HashSet
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  INTERSECTION_ARRAYS_PROBLEM_HTML,
  INTERSECTION_ARRAYS_ANALYSIS_HTML,
  INTERSECTION_ARRAYS_CODE_LANGUAGES,
} from './intersection-of-two-arrays-problem-content';
import template from './intersection-of-two-arrays.html?raw';

export interface IntersectionStep {
  nums1: number[];
  nums2: number[];
  phase: 'build-set1' | 'scan-nums2' | 'done';
  idx1: number;
  idx2: number;
  currentVal: number | null;
  set1: number[];
  resultSet: number[];
  isHit: boolean;
  message: string;
  log: string;
  codeLine: number | number[];
}

export function parseNumArray(input: string, defaultArr: number[]): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return arr.length > 0 ? arr : defaultArr;
}

export function buildIntersectionSteps(nums1: number[], nums2: number[]): IntersectionStep[] {
  const steps: IntersectionStep[] = [];
  const set1 = new Set<number>();
  const resultSet = new Set<number>();

  // 1. 将 nums1 存入 set1
  for (let i = 0; i < nums1.length; i++) {
    const val = nums1[i];
    set1.add(val);

    steps.push({
      nums1,
      nums2,
      phase: 'build-set1',
      idx1: i,
      idx2: -1,
      currentVal: val,
      set1: Array.from(set1),
      resultSet: [],
      isHit: false,
      message: `遍历 nums1[${i}] = ${val}，将其存入集合 set1。set1 当前大小为 ${set1.size}。`,
      log: `set1.add(${val}) -> [${Array.from(set1).join(', ')}]`,
      codeLine: [7, 8],
    });
  }

  // 2. 遍历 nums2 查询 set1
  for (let j = 0; j < nums2.length; j++) {
    const val = nums2[j];
    const hit = set1.has(val);
    if (hit) {
      resultSet.add(val);
    }

    steps.push({
      nums1,
      nums2,
      phase: 'scan-nums2',
      idx1: -1,
      idx2: j,
      currentVal: val,
      set1: Array.from(set1),
      resultSet: Array.from(resultSet),
      isHit: hit,
      message: hit
        ? `🎉 检查 nums2[${j}] = ${val}：在 set1 中存在！将其存入交集结果集 resultSet (现为 [${Array.from(resultSet).join(', ')}])。`
        : `检查 nums2[${j}] = ${val}：不在 set1 中，跳过。`,
      log: hit ? `✓ 命中交集: ${val}` : `比对 nums2[${j}]=${val} (未命中)`,
      codeLine: hit ? [10, 11] : 10,
    });
  }

  steps.push({
    nums1,
    nums2,
    phase: 'done',
    idx1: -1,
    idx2: -1,
    currentVal: null,
    set1: Array.from(set1),
    resultSet: Array.from(resultSet),
    isHit: false,
    message: `🎉 交集求解完成！最终交集为 [${Array.from(resultSet).join(', ')}]。`,
    log: `求解完成: 交集共 ${resultSet.size} 个元素`,
    codeLine: 14,
  });

  return steps;
}

export class IntersectionOfTwoArraysVisualizer extends StepVisualizer<IntersectionStep> {
  protected codeLanguages = INTERSECTION_ARRAYS_CODE_LANGUAGES;
  protected codeLines = INTERSECTION_ARRAYS_CODE_LANGUAGES['java'];
  protected codePanelTitle = '两个数组的交集 代码调试';

  private row1El: HTMLElement | null = null;
  private row2El: HTMLElement | null = null;
  private set1ChipsEl: HTMLElement | null = null;
  private resultChipsEl: HTMLElement | null = null;
  private metricPhaseEl: HTMLElement | null = null;
  private metricCurValEl: HTMLElement | null = null;
  private metricHitEl: HTMLElement | null = null;
  private metricResCountEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.row1El = this.root.querySelector('#ia-row-1');
    this.row2El = this.root.querySelector('#ia-row-2');
    this.set1ChipsEl = this.root.querySelector('#ia-set1-chips');
    this.resultChipsEl = this.root.querySelector('#ia-result-chips');
    this.metricPhaseEl = this.root.querySelector('#metric-phase');
    this.metricCurValEl = this.root.querySelector('#metric-val, #metric-cur-val');
    this.metricHitEl = this.root.querySelector('#metric-hit');
    this.metricResCountEl = this.root.querySelector('#metric-res-count');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.ia-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const n1Input = this.root?.querySelector('#input-nums1') as HTMLInputElement | null;
        const n2Input = this.root?.querySelector('#input-nums2') as HTMLInputElement | null;
        if (n1Input && btn.dataset.n1) n1Input.value = btn.dataset.n1;
        if (n2Input && btn.dataset.n2) n2Input.value = btn.dataset.n2;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: INTERSECTION_ARRAYS_PROBLEM_HTML,
      analysisHtml: INTERSECTION_ARRAYS_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): IntersectionStep[] {
    const n1Input = this.root?.querySelector('#input-nums1') as HTMLInputElement | null;
    const n2Input = this.root?.querySelector('#input-nums2') as HTMLInputElement | null;
    const nums1 = parseNumArray(n1Input?.value || '1, 2, 2, 1', [1, 2, 2, 1]);
    const nums2 = parseNumArray(n2Input?.value || '2, 2', [2, 2]);
    return buildIntersectionSteps(nums1, nums2);
  }

  protected renderStep(step: IntersectionStep): void {
    const { nums1, nums2, phase, idx1, idx2, currentVal, set1, resultSet, isHit } = step;

    // 1. 渲染 nums1 和 nums2 数组卡槽
    const renderCells = (arr: number[], activeIdx: number, ptrLabel: string) =>
      arr
        .map((num, idx) => {
          const isCur = idx === activeIdx;
          const isHitCell = isCur && isHit;
          return `
            <div class="ia-cell-unit">
              <div class="ia-cell-box ${isHitCell ? 'is-hit' : isCur ? 'is-current' : ''}">
                <span class="val">${num}</span>
                <span class="idx">[${idx}]</span>
              </div>
              <span class="ia-cell-ptr-tag">${isCur ? (isHitCell ? '🎯命中' : `▼${ptrLabel}`) : ''}</span>
            </div>
          `;
        })
        .join('');

    if (this.row1El) this.row1El.innerHTML = renderCells(nums1, idx1, 'i');
    if (this.row2El) this.row2El.innerHTML = renderCells(nums2, idx2, 'j');

    // 2. 渲染 set1 与 resultSet
    if (this.set1ChipsEl) {
      this.set1ChipsEl.innerHTML =
        set1.length === 0
          ? '<span style="color:#94a3b8; font-size:11px; padding: 4px 8px;">(空集合 ∅)</span>'
          : set1
              .map((num) => {
                const isNew = phase === 'build-set1' && num === currentVal;
                return `<div class="ia-set-chip ${isNew ? 'is-new' : ''}"><span style="color:#3b82f6;">#</span> ${num}</div>`;
              })
              .join('');
    }

    if (this.resultChipsEl) {
      this.resultChipsEl.innerHTML =
        resultSet.length === 0
          ? '<span style="color:#94a3b8; font-size:11px; padding: 4px 8px;">(暂无交集)</span>'
          : resultSet
              .map((num) => {
                const isNew = phase === 'scan-nums2' && isHit && num === currentVal;
                return `<div class="ia-set-chip is-res ${isNew ? 'is-new' : ''}"><span>✨</span> ${num}</div>`;
              })
              .join('');
    }

    // 3. 更新状态监视器
    if (this.metricPhaseEl) {
      this.metricPhaseEl.textContent =
        phase === 'build-set1' ? '构建 set1' : phase === 'scan-nums2' ? '遍历 nums2 匹配' : '完成';
    }
    if (this.metricCurValEl) {
      this.metricCurValEl.textContent = currentVal !== null ? String(currentVal) : '—';
    }
    if (this.metricHitEl) {
      if (phase === 'scan-nums2') {
        this.metricHitEl.textContent = isHit ? '✓ 命中' : '✗ 未命中';
        this.metricHitEl.style.color = isHit ? '#10b981' : '#64748b';
      } else {
        this.metricHitEl.textContent = '—';
        this.metricHitEl.style.color = '#64748b';
      }
    }
    if (this.metricResCountEl) {
      this.metricResCountEl.textContent = `${resultSet.length} 个`;
    }

    // 4. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background = isHit || phase === 'done' ? '#f0fdf4' : '#eff6ff';
      logEntry.style.color = isHit || phase === 'done' ? '#15803d' : '#1d4ed8';
      logEntry.style.border = '1px solid ' + (isHit || phase === 'done' ? '#bbf7d0' : '#bfdbfe');
      logEntry.innerHTML = `<span style="color:#94a3b8;">[Step ${stepIndex + 1}]</span> ${step.log}`;

      this.logContainer.appendChild(logEntry);
      this.logContainer.scrollTop = this.logContainer.scrollHeight;

      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.logContainer.children.length} 条记录`;
      }
    }

    const badgePhase = this.root?.querySelector('#badge-phase');
    if (badgePhase) {
      badgePhase.textContent =
        phase === 'build-set1' ? '构建 set1' : phase === 'scan-nums2' ? '遍历 nums2 匹配' : '完成';
    }
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
  }
}

registerAlgorithm({
  id: 'intersection-arrays',
  name: '两个数组的交集（哈希集合）',
  viewId: 'algo-intersection-arrays-view',
  category: 'hash-table',
  description: '用哈希集合求两个数组的交集元素',
  icon: '🔀',
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握用 Set 去重后高效求交集的思路',
  template,
  Visualizer: IntersectionOfTwoArraysVisualizer,
});
