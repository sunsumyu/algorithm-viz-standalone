/**
 * 快乐数可视化器 — 4-Card 标准现代架构
 * LeetCode 202：HashSet 判环
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  HAPPY_NUMBER_PROBLEM_HTML,
  HAPPY_NUMBER_ANALYSIS_HTML,
  HAPPY_NUMBER_CODE_LANGUAGES,
} from './happy-number-problem-content';
import template from './happy-number.html?raw';

export interface HappyNumberStep {
  n: number;
  nextN: number;
  formula: string;
  seen: number[];
  cycleNode: number | null;
  status: 'init' | 'compute' | 'check' | 'happy' | 'cycle';
  isHappy: boolean;
  message: string;
  log: string;
  codeLine: number | number[];
}

export function getNextSquareSum(n: number): { sum: number; formula: string } {
  let sum = 0;
  let temp = n;
  const parts: string[] = [];

  while (temp > 0) {
    const d = temp % 10;
    sum += d * d;
    parts.unshift(`${d}²`);
    temp = Math.floor(temp / 10);
  }

  const formula = parts.join(' + ') + ` = ${sum}`;
  return { sum, formula };
}

export function buildHappyNumberSteps(initialN: number): HappyNumberStep[] {
  const steps: HappyNumberStep[] = [];
  const seen = new Set<number>();
  let cur = initialN;

  steps.push({
    n: cur,
    nextN: cur,
    formula: '',
    seen: [],
    cycleNode: null,
    status: 'init',
    isHappy: false,
    message: `初始数字 n = ${cur}，初始化空哈希集合 HashSet seen。`,
    log: `开始计算 n = ${cur}`,
    codeLine: 2,
  });

  while (cur !== 1 && !seen.has(cur)) {
    const { sum, formula } = getNextSquareSum(cur);
    seen.add(cur);

    steps.push({
      n: cur,
      nextN: sum,
      formula,
      seen: Array.from(seen),
      cycleNode: null,
      status: 'compute',
      isHappy: false,
      message: `将 ${cur} 加入 seen 集合。计算各位平方和: ${formula}。`,
      log: `${cur} -> ${formula}`,
      codeLine: [4, 5],
    });

    cur = sum;
  }

  if (cur === 1) {
    steps.push({
      n: 1,
      nextN: 1,
      formula: '1² = 1',
      seen: Array.from(seen),
      cycleNode: null,
      status: 'happy',
      isHappy: true,
      message: `🎉 平方和收敛到 1！数字 ${initialN} 是快乐数，返回 true。`,
      log: `✓ 收敛到 1，是快乐数！`,
      codeLine: 7,
    });
  } else {
    steps.push({
      n: cur,
      nextN: cur,
      formula: `已存在于 HashSet 中`,
      seen: Array.from(seen),
      cycleNode: cur,
      status: 'cycle',
      isHappy: false,
      message: `⚠️ 检测到死循环！数字 ${cur} 之前已经在 seen 集合中出现过，陷入死循环，不是快乐数，返回 false。`,
      log: `✗ 检测到循环节点 ${cur}，返回 false`,
      codeLine: 7,
    });
  }

  return steps;
}

export class HappyNumberVisualizer extends StepVisualizer<HappyNumberStep> {
  protected codeLanguages = HAPPY_NUMBER_CODE_LANGUAGES;
  protected codeLines = HAPPY_NUMBER_CODE_LANGUAGES['java'];
  protected codePanelTitle = '快乐数 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private curNumEl: HTMLElement | null = null;
  private formulaTextEl: HTMLElement | null = null;
  private setTrackEl: HTMLElement | null = null;
  private metricNEl: HTMLElement | null = null;
  private metricNextEl: HTMLElement | null = null;
  private metricSetSizeEl: HTMLElement | null = null;
  private metricResEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.curNumEl = this.root.querySelector('#hn-cur-num');
    this.formulaTextEl = this.root.querySelector('#hn-formula-text');
    this.setTrackEl = this.root.querySelector('#hn-set-track');
    this.metricNEl = this.root.querySelector('#metric-n');
    this.metricNextEl = this.root.querySelector('#metric-next');
    this.metricSetSizeEl = this.root.querySelector('#metric-set-size');
    this.metricResEl = this.root.querySelector('#metric-res');
    this.liveTextEl = this.root.querySelector('#hn-live-text');
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
    this.root.querySelectorAll<HTMLButtonElement>('.hn-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nInput = this.root?.querySelector('#input-n') as HTMLInputElement | null;
        if (nInput && btn.dataset.n) nInput.value = btn.dataset.n;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: HAPPY_NUMBER_PROBLEM_HTML,
      analysisHtml: HAPPY_NUMBER_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): HappyNumberStep[] {
    const nInput = this.root?.querySelector('#input-n') as HTMLInputElement | null;
    const n = parseInt(nInput?.value || '19', 10);
    return buildHappyNumberSteps(isNaN(n) || n <= 0 ? 19 : n);
  }

  protected renderStep(step: HappyNumberStep): void {
    const { n, nextN, formula, seen, cycleNode, status, isHappy, message } = step;

    // 1. 渲染数字拆解
    if (this.curNumEl) this.curNumEl.textContent = String(n);
    if (this.formulaTextEl) this.formulaTextEl.textContent = formula || '等待计算...';

    // 2. 渲染 HashSet
    if (this.setTrackEl) {
      if (seen.length === 0) {
        this.setTrackEl.innerHTML = '<span style="color: #94a3b8; font-size: 11px;">(HashSet 当前为空)</span>';
      } else {
        this.setTrackEl.innerHTML = seen
          .map((num) => {
            const isCycle = cycleNode === num;
            const isOne = num === 1 || (status === 'happy' && num === seen[seen.length - 1]);
            let chipClass = 'hn-set-chip';
            if (isCycle) chipClass += ' is-cycle';
            else if (isOne) chipClass += ' is-one';

            return `
              <div class="${chipClass}">
                <span>${num}</span>
              </div>
            `;
          })
          .join('');
      }
    }

    // 3. 更新状态监视器
    if (this.metricNEl) this.metricNEl.textContent = String(n);
    if (this.metricNextEl) this.metricNextEl.textContent = String(nextN);
    if (this.metricSetSizeEl) this.metricSetSizeEl.textContent = `${seen.length} 个`;
    if (this.metricResEl) {
      if (status === 'happy') {
        this.metricResEl.textContent = '✓ 快乐数';
        this.metricResEl.style.color = '#10b981';
      } else if (status === 'cycle') {
        this.metricResEl.textContent = '✗ 死循环';
        this.metricResEl.style.color = '#ef4444';
      } else {
        this.metricResEl.textContent = '计算中...';
        this.metricResEl.style.color = '#3b82f6';
      }
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 4. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background = status === 'happy' ? '#f0fdf4' : status === 'cycle' ? '#fef2f2' : '#eff6ff';
      logEntry.style.color = status === 'happy' ? '#15803d' : status === 'cycle' ? '#b91c1c' : '#1d4ed8';
      logEntry.style.border =
        '1px solid ' + (status === 'happy' ? '#bbf7d0' : status === 'cycle' ? '#fecaca' : '#bfdbfe');
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

    const badgeStatus = this.root?.querySelector('#badge-status');
    if (badgeStatus) {
      badgeStatus.textContent =
        status === 'happy' ? '✓ 快乐数' : status === 'cycle' ? '✗ 死循环' : '计算中...';
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
  id: 'happy-number',
  name: '快乐数（哈希集合判环）',
  viewId: 'algo-happy-number-view',
  category: 'hash-table',
  description: '用哈希集合检测平方和循环，判断快乐数',
  icon: '😊',
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '掌握用 Set 检测循环的方法',
  template,
  Visualizer: HappyNumberVisualizer,
});
