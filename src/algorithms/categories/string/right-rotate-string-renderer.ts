/**
 * 右旋转字符串可视化器 — 4-Card 标准现代架构
 * KamaCoder 55：三次反转法
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  RIGHT_ROTATE_STRING_PROBLEM_HTML,
  RIGHT_ROTATE_STRING_ANALYSIS_HTML,
  RIGHT_ROTATE_STRING_CODE_LANGUAGES,
} from './right-rotate-string-problem-content';
import template from './right-rotate-string.html?raw';

export interface RightRotateStep {
  chars: string[];
  stage: 1 | 2 | 3;
  windowStart: number;
  windowEnd: number;
  left: number;
  right: number;
  k: number;
  swapping: boolean;
  phase: 'init' | 'stage1' | 'stage2' | 'stage3' | 'done';
  status: 'init' | 'stage1' | 'stage2' | 'stage3' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildRightRotateSteps(inputStr: string, kInput: number): RightRotateStep[] {
  const steps: RightRotateStep[] = [];
  const chars = inputStr.split('');
  const n = chars.length;
  const k = kInput % n;

  steps.push({
    chars: [...chars],
    stage: 1,
    windowStart: 0,
    windowEnd: n - 1,
    left: -1,
    right: -1,
    k,
    swapping: false,
    phase: 'init',
    status: 'init',
    message: `初始化右旋转：字符串 "${inputStr}" (长度 n=${n})，向右旋转 k=${k} 位。采用三次反转法。`,
    log: `开始右旋转 (n=${n}, k=${k})`,
    codeLine: 2,
  });

  const runReverse = (
    wStart: number,
    wEnd: number,
    stageNum: 1 | 2 | 3,
    phaseKey: 'stage1' | 'stage2' | 'stage3',
    stageName: string,
    codeLine: number | number[]
  ) => {
    let l = wStart;
    let r = wEnd;

    steps.push({
      chars: [...chars],
      stage: stageNum,
      windowStart: wStart,
      windowEnd: wEnd,
      left: l,
      right: r,
      k,
      swapping: false,
      phase: phaseKey,
      status: phaseKey,
      message: `Stage ${stageNum}：${stageName}，区间 [${wStart}, ${wEnd}]。`,
      log: `Stage ${stageNum}: 准备反转 [${wStart}, ${wEnd}]`,
      codeLine,
    });

    while (l < r) {
      const temp = chars[l];
      chars[l] = chars[r];
      chars[r] = temp;

      steps.push({
        chars: [...chars],
        stage: stageNum,
        windowStart: wStart,
        windowEnd: wEnd,
        left: l,
        right: r,
        k,
        swapping: true,
        phase: phaseKey,
        status: phaseKey,
        message: `${stageName}：交换 chars[${l}] <-> chars[${r}] ('${temp}' <-> '${chars[l]}')。`,
        log: `交换 [${l}] <-> [${r}]`,
        codeLine,
      });

      l++;
      r--;
    }
  };

  // 1. 反转全部
  runReverse(0, n - 1, 1, 'stage1', '反转整个字符串 [0, n-1]', 5);

  // 2. 反转前 k 个
  if (k > 1) {
    runReverse(0, k - 1, 2, 'stage2', `反转前 k 个字符 [0, ${k - 1}]`, 7);
  }

  // 3. 反转剩余 n - k 个
  if (n - k > 1) {
    runReverse(k, n - 1, 3, 'stage3', `反转后 n - k 个字符 [${k}, ${n - 1}]`, 9);
  }

  steps.push({
    chars: [...chars],
    stage: 3,
    windowStart: -1,
    windowEnd: -1,
    left: -1,
    right: -1,
    k,
    swapping: false,
    phase: 'done',
    status: 'done',
    message: `🎉 三次反转全部完成！右旋转 ${k} 位后的最终字符串为 "${chars.join('')}"。`,
    log: `✓ 求解完成: "${chars.join('')}"`,
    codeLine: 10,
  });

  return steps;
}

export class RightRotateStringVisualizer extends StepVisualizer<RightRotateStep> {
  protected codeLanguages = RIGHT_ROTATE_STRING_CODE_LANGUAGES;
  protected codeLines = RIGHT_ROTATE_STRING_CODE_LANGUAGES['java'];
  protected codePanelTitle = '右旋转字符串 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private trackRowEl: HTMLElement | null = null;
  private pillStage1El: HTMLElement | null = null;
  private pillStage2El: HTMLElement | null = null;
  private pillStage3El: HTMLElement | null = null;
  private metricStageEl: HTMLElement | null = null;
  private metricWindowEl: HTMLElement | null = null;
  private metricKEl: HTMLElement | null = null;
  private metricStatusEl: HTMLElement | null = null;
  private formulaOpEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.trackRowEl = this.root.querySelector('#rr-track-row');
    this.pillStage1El = this.root.querySelector('#pill-stage-1');
    this.pillStage2El = this.root.querySelector('#pill-stage-2');
    this.pillStage3El = this.root.querySelector('#pill-stage-3');
    this.metricStageEl = this.root.querySelector('#metric-stage');
    this.metricWindowEl = this.root.querySelector('#metric-window');
    this.metricKEl = this.root.querySelector('#metric-k');
    this.metricStatusEl = this.root.querySelector('#metric-status');
    this.formulaOpEl = this.root.querySelector('#formula-op');
    this.liveTextEl = this.root.querySelector('#rr-live-text');
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
    this.root.querySelectorAll<HTMLButtonElement>('.rr-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sInput = this.root?.querySelector('#input-s') as HTMLInputElement | null;
        const kInput = this.root?.querySelector('#input-k') as HTMLInputElement | null;
        if (sInput && btn.dataset.s) sInput.value = btn.dataset.s;
        if (kInput && btn.dataset.k) kInput.value = btn.dataset.k;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: RIGHT_ROTATE_STRING_PROBLEM_HTML,
      analysisHtml: RIGHT_ROTATE_STRING_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): RightRotateStep[] {
    const sInput = this.root?.querySelector('#input-s') as HTMLInputElement | null;
    const kInput = this.root?.querySelector('#input-k') as HTMLInputElement | null;
    const str = sInput?.value || 'abcdefg';
    const k = parseInt(kInput?.value || '2', 10);
    return buildRightRotateSteps(str, isNaN(k) || k <= 0 ? 2 : k);
  }

  protected renderStep(step: RightRotateStep): void {
    const { chars, stage, windowStart, windowEnd, left, right, k, swapping, phase, message } = step;

    // 1. 渲染字符数组与区间高亮
    if (this.trackRowEl) {
      this.trackRowEl.innerHTML = chars
        .map((ch, idx) => {
          const inSubWindow =
            windowStart >= 0 && windowEnd >= 0 && idx >= windowStart && idx <= windowEnd && phase !== 'done';
          const isLeft = idx === left && phase !== 'done';
          const isRight = idx === right && phase !== 'done';
          const isSwapping = swapping && (idx === left || idx === right);

          let cellClass = 'rr-cell-box';
          if (inSubWindow) cellClass += ' in-sub-window';
          if (isSwapping) cellClass += ' is-swapping';
          else if (isLeft) cellClass += ' is-left';
          else if (isRight) cellClass += ' is-right';

          let ptrTags = '';
          if (isLeft && isRight) {
            ptrTags = '<span class="rr-ptr-badge left">L</span><span class="rr-ptr-badge right">R</span>';
          } else if (isLeft) {
            ptrTags = '<span class="rr-ptr-badge left">left</span>';
          } else if (isRight) {
            ptrTags = '<span class="rr-ptr-badge right">right</span>';
          }

          return `
            <div class="rr-cell-wrapper">
              <div class="rr-pointer-tags">${ptrTags}</div>
              <div class="${cellClass}">
                <span class="val">${ch}</span>
                <span class="idx">${idx}</span>
              </div>
            </div>
          `;
        })
        .join('');
    }

    // 2. 渲染 Stage Pills
    const updatePill = (el: HTMLElement | null, currentStage: number, targetStage: number) => {
      if (!el) return;
      el.className = 'rr-stage-pill';
      if (currentStage === targetStage) el.classList.add('is-active');
      else if (currentStage > targetStage) el.classList.add('is-done');
    };
    updatePill(this.pillStage1El, stage, 1);
    updatePill(this.pillStage2El, stage, 2);
    updatePill(this.pillStage3El, stage, 3);

    // 3. 更新状态监视器
    if (this.metricStageEl) this.metricStageEl.textContent = `Stage ${stage}`;
    if (this.metricWindowEl) {
      this.metricWindowEl.textContent =
        windowStart >= 0 && windowEnd >= 0 && phase !== 'done' ? `[${windowStart}, ${windowEnd}]` : '—';
    }
    if (this.metricKEl) this.metricKEl.textContent = `${k}`;
    if (this.metricStatusEl) {
      const statusMap: Record<string, string> = {
        init: '初始化',
        stage1: '反转整体',
        stage2: '反转前部',
        stage3: '反转后部',
        done: '旋转完成',
      };
      this.metricStatusEl.textContent = statusMap[phase] || phase;
      this.metricStatusEl.style.color = phase === 'done' ? '#10b981' : '#2563eb';
    }

    if (this.formulaOpEl) {
      if (phase === 'stage1') {
        this.formulaOpEl.textContent = `reverse(0, ${chars.length - 1})`;
      } else if (phase === 'stage2') {
        this.formulaOpEl.textContent = `reverse(0, ${k - 1})`;
      } else if (phase === 'stage3') {
        this.formulaOpEl.textContent = `reverse(${k}, ${chars.length - 1})`;
      } else {
        this.formulaOpEl.textContent = '三次反转全部完成';
      }
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 4. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background =
        phase === 'done' ? '#f0fdf4' : swapping ? '#eff6ff' : '#f8fafc';
      logEntry.style.color =
        phase === 'done' ? '#15803d' : swapping ? '#1d4ed8' : '#334155';
      logEntry.style.border =
        '1px solid ' +
        (phase === 'done' ? '#bbf7d0' : swapping ? '#bfdbfe' : '#e2e8f0');
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
  id: 'right-rotate-string',
  name: '右旋转字符串（三次反转）',
  viewId: 'algo-right-rotate-view',
  category: 'string',
  description: '通过三次反转实现字符串右旋转 k 位',
  icon: '🔄',
  difficulty: 1,
  levelOrder: 5,
  learningGoal: '掌握通过分段反转实现字符串旋转的技巧',
  template,
  Visualizer: RightRotateStringVisualizer,
});
