/**
 * 四数相加 II 可视化器 — 4-Card 标准现代架构
 * LeetCode 454：分组哈希 (2+2 拆分)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  FOUR_SUM_II_PROBLEM_HTML,
  FOUR_SUM_II_ANALYSIS_HTML,
  FOUR_SUM_II_CODE_LANGUAGES,
} from './four-sum-ii-problem-content';
import template from './four-sum-ii.html?raw';

export interface FourSumIIStep {
  a: number[];
  b: number[];
  c: number[];
  d: number[];
  phase: 'group1-init' | 'group1-add' | 'group2-init' | 'group2-search' | 'done';
  status: 'group1-init' | 'group1-add' | 'group2-init' | 'group2-search' | 'done';
  idxA: number;
  idxB: number;
  idxC: number;
  idxD: number;
  sumAB?: number;
  sumCD?: number;
  target?: number;
  increment: number;
  count: number;
  mapEntries: [number, number][];
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildFourSumIISteps(
  nums1: number[],
  nums2: number[],
  nums3: number[],
  nums4: number[]
): FourSumIIStep[] {
  const steps: FourSumIIStep[] = [];
  const map = new Map<number, number>();
  let count = 0;

  // 1. Group 1 初始化
  steps.push({
    a: nums1,
    b: nums2,
    c: nums3,
    d: nums4,
    phase: 'group1-init',
    status: 'group1-init',
    idxA: -1,
    idxB: -1,
    idxC: -1,
    idxD: -1,
    increment: 0,
    count: 0,
    mapEntries: [],
    message: '初始化哈希表 Map，进入 Phase 1：统计 nums1 与 nums2 所有两数之和出现的频次。',
    log: 'Phase 1: 统计 A+B 频次',
    codeLine: 2,
  });

  // Group 1: A + B
  for (let i = 0; i < nums1.length; i++) {
    for (let j = 0; j < nums2.length; j++) {
      const sumAB = nums1[i] + nums2[j];
      const prevFreq = map.get(sumAB) || 0;
      map.set(sumAB, prevFreq + 1);

      steps.push({
        a: nums1,
        b: nums2,
        c: nums3,
        d: nums4,
        phase: 'group1-add',
        status: 'group1-add',
        idxA: i,
        idxB: j,
        idxC: -1,
        idxD: -1,
        sumAB,
        increment: 0,
        count: 0,
        mapEntries: Array.from(map.entries()),
        message: `枚举 nums1[${i}] (${nums1[i]}) + nums2[${j}] (${nums2[j]}) = ${sumAB}。将和 ${sumAB} 存入 Map，频次更新为 ${map.get(sumAB)}。`,
        log: `A[${i}]+B[${j}] = ${sumAB} -> Map[${sumAB}] = ${map.get(sumAB)}`,
        codeLine: [4, 5, 6],
      });
    }
  }

  // 2. Group 2 初始化
  steps.push({
    a: nums1,
    b: nums2,
    c: nums3,
    d: nums4,
    phase: 'group2-init',
    status: 'group2-init',
    idxA: -1,
    idxB: -1,
    idxC: -1,
    idxD: -1,
    increment: 0,
    count: 0,
    mapEntries: Array.from(map.entries()),
    message: '进入 Phase 2：遍历 nums3 与 nums4，寻找 0 - (c + d) 是否在 Map 中存在。',
    log: 'Phase 2: 查找 0 - (C+D)',
    codeLine: 9,
  });

  // Group 2: C + D
  for (let k = 0; k < nums3.length; k++) {
    for (let l = 0; l < nums4.length; l++) {
      const sumCD = nums3[k] + nums4[l];
      const target = 0 - sumCD;
      const matched = map.get(target) || 0;
      count += matched;

      steps.push({
        a: nums1,
        b: nums2,
        c: nums3,
        d: nums4,
        phase: 'group2-search',
        status: 'group2-search',
        idxA: -1,
        idxB: -1,
        idxC: k,
        idxD: l,
        sumCD,
        target,
        increment: matched,
        count,
        mapEntries: Array.from(map.entries()),
        message:
          matched > 0
            ? `🎉 nums3[${k}] (${nums3[k]}) + nums4[${l}] (${nums4[l]}) = ${sumCD}，目标 target = 0 - (${sumCD}) = ${target}。在 Map 中找到匹配频次 ${matched} 次，累计 count += ${matched} (现为 ${count})。`
            : `nums3[${k}] (${nums3[k]}) + nums4[${l}] (${nums4[l]}) = ${sumCD}，目标 target = ${target} 未在 Map 中找到，继续扫描。`,
        log: `C[${k}]+D[${l}] = ${sumCD}, 找 ${target} -> 命中 +${matched} (总计: ${count})`,
        codeLine: [10, 11],
      });
    }
  }

  steps.push({
    a: nums1,
    b: nums2,
    c: nums3,
    d: nums4,
    phase: 'done',
    status: 'done',
    idxA: -1,
    idxB: -1,
    idxC: -1,
    idxD: -1,
    increment: 0,
    count,
    mapEntries: Array.from(map.entries()),
    message: `🎉 搜索完成！共找到 ${count} 个满足条件的四元组。`,
    log: `求解完成: 共 ${count} 个合法四元组`,
    codeLine: 14,
  });

  return steps;
}

export class FourSumIIVisualizer extends StepVisualizer<FourSumIIStep> {
  protected codeLanguages = FOUR_SUM_II_CODE_LANGUAGES;
  protected codeLines = FOUR_SUM_II_CODE_LANGUAGES['java'];
  protected codePanelTitle = '四数相加 II 代码调试';

  private currentDemo = 1;
  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private rowAEl: HTMLElement | null = null;
  private rowBEl: HTMLElement | null = null;
  private rowCEl: HTMLElement | null = null;
  private rowDEl: HTMLElement | null = null;
  private mapWrapEl: HTMLElement | null = null;
  private metricPhaseEl: HTMLElement | null = null;
  private metricTargetEl: HTMLElement | null = null;
  private metricIncEl: HTMLElement | null = null;
  private metricCountEl: HTMLElement | null = null;
  private formulaCalcEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.rowAEl = this.root.querySelector('#fs2-row-a');
    this.rowBEl = this.root.querySelector('#fs2-row-b');
    this.rowCEl = this.root.querySelector('#fs2-row-c');
    this.rowDEl = this.root.querySelector('#fs2-row-d');
    this.mapWrapEl = this.root.querySelector('#fs2-map-wrap');
    this.metricPhaseEl = this.root.querySelector('#metric-phase');
    this.metricTargetEl = this.root.querySelector('#metric-target');
    this.metricIncEl = this.root.querySelector('#metric-inc');
    this.metricCountEl = this.root.querySelector('#metric-count');
    this.formulaCalcEl = this.root.querySelector('#formula-calc');
    this.liveTextEl = this.root.querySelector('#fs2-live-text');
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
    this.root.querySelectorAll<HTMLButtonElement>('.fs2-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.currentDemo = parseInt(btn.dataset.demo || '1', 10);
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: FOUR_SUM_II_PROBLEM_HTML,
      analysisHtml: FOUR_SUM_II_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): FourSumIIStep[] {
    if (this.currentDemo === 2) {
      return buildFourSumIISteps([0, 0], [0, 0], [0, 0], [0, 0]);
    } else if (this.currentDemo === 3) {
      return buildFourSumIISteps([1, 1], [-1, 2], [0, 1], [0, -2]);
    }
    return buildFourSumIISteps([1, 2], [-2, -1], [-1, 2], [0, 2]);
  }

  protected renderStep(step: FourSumIIStep): void {
    const { a, b, c, d, phase, idxA, idxB, idxC, idxD, sumAB, sumCD, target, increment, count, mapEntries, message } =
      step;

    // 1. 渲染 4 数组
    const renderRow = (arr: number[], activeIdx: number) =>
      arr
        .map(
          (num, idx) => `
        <div class="fs2-val-cell ${idx === activeIdx ? 'is-active' : ''}">
          <span>${num}</span>
        </div>
      `
        )
        .join('');

    if (this.rowAEl) this.rowAEl.innerHTML = renderRow(a, idxA);
    if (this.rowBEl) this.rowBEl.innerHTML = renderRow(b, idxB);
    if (this.rowCEl) this.rowCEl.innerHTML = renderRow(c, idxC);
    if (this.rowDEl) this.rowDEl.innerHTML = renderRow(d, idxD);

    // 2. 渲染 Map
    if (this.mapWrapEl) {
      if (mapEntries.length === 0) {
        this.mapWrapEl.innerHTML = '<span style="color: #94a3b8; font-size: 10.5px;">(Map 当前为空)</span>';
      } else {
        this.mapWrapEl.innerHTML = mapEntries
          .map(([k, v]) => {
            const isTarget = target !== undefined && k === target;
            return `
              <div class="fs2-map-chip ${isTarget ? 'is-target' : ''}">
                <span style="color: #3b82f6; font-weight: 700;">sum=${k}</span>
                <span style="color: #94a3b8;">:</span>
                <span style="color: #10b981; font-weight: 700;">freq=${v}</span>
              </div>
            `;
          })
          .join('');
      }
    }

    // 3. 更新状态监视器
    if (this.metricPhaseEl) {
      this.metricPhaseEl.textContent = phase.startsWith('group1') ? 'Group 1 (A+B)' : 'Group 2 (C+D)';
    }
    if (this.metricTargetEl) {
      this.metricTargetEl.textContent = target !== undefined ? String(target) : '—';
    }
    if (this.metricIncEl) {
      this.metricIncEl.textContent = `+${increment}`;
      this.metricIncEl.style.color = increment > 0 ? '#10b981' : '#64748b';
    }
    if (this.metricCountEl) this.metricCountEl.textContent = String(count);

    if (this.formulaCalcEl) {
      if (sumAB !== undefined) {
        this.formulaCalcEl.textContent = `nums1[${idxA}] + nums2[${idxB}] = ${a[idxA]} + ${b[idxB]} = ${sumAB}`;
      } else if (sumCD !== undefined && target !== undefined) {
        this.formulaCalcEl.textContent = `target = 0 - (${c[idxC]} + ${d[idxD]}) = ${target}`;
      } else {
        this.formulaCalcEl.textContent = 'target = 0 - (c + d)';
      }
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 4. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background = increment > 0 ? '#f0fdf4' : '#eff6ff';
      logEntry.style.color = increment > 0 ? '#15803d' : '#1d4ed8';
      logEntry.style.border = '1px solid ' + (increment > 0 ? '#bbf7d0' : '#bfdbfe');
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

    const badgePhase = this.root?.querySelector('#badge-phase');
    if (badgePhase) {
      badgePhase.textContent = phase.startsWith('group1') ? 'Group 1 (A+B)' : 'Group 2 (C+D)';
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
  id: 'four-sum-ii',
  name: '四数相加II（分组哈希）',
  viewId: 'algo-four-sum-ii-view',
  category: 'hash-table',
  description: '将四数组分为两组，用哈希表统计和为0的元组数',
  icon: '🧮',
  difficulty: 2,
  levelOrder: 4,
  learningGoal: '掌握分组降维 + 哈希表计数优化四重循环',
  template,
  Visualizer: FourSumIIVisualizer,
});
