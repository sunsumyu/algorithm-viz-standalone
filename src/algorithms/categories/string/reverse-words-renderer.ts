/**
 * 翻转字符串里的单词可视化器 — 4-Card 标准现代架构
 * LeetCode 151：三步原地反转法
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  REVERSE_WORDS_PROBLEM_HTML,
  REVERSE_WORDS_ANALYSIS_HTML,
  REVERSE_WORDS_CODE_LANGUAGES,
} from './reverse-words-problem-content';
import template from './reverse-words.html?raw';

export interface ReverseWordsStep {
  chars: string[];
  stage: 1 | 2 | 3;
  left: number;
  right: number;
  wordStart?: number;
  wordEnd?: number;
  swapping: boolean;
  phase: 'clean-spaces' | 'reverse-all' | 'reverse-words' | 'done';
  status: 'clean-spaces' | 'reverse-all' | 'reverse-words' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildReverseWordsSteps(inputStr: string): ReverseWordsStep[] {
  const steps: ReverseWordsStep[] = [];

  // Step 1: 移除多余空格
  const cleanedWords = inputStr.trim().split(/\s+/).filter(Boolean);
  const cleanedStr = cleanedWords.join(' ');
  const chars = cleanedStr.split('');

  steps.push({
    chars: inputStr.split(''),
    stage: 1,
    left: -1,
    right: -1,
    swapping: false,
    phase: 'clean-spaces',
    status: 'clean-spaces',
    message: `第 1 步：清除多余空格。原字符串 "${inputStr}" 清理前导、尾随及单词间连续空格。`,
    log: `清理空格: "${inputStr}" -> "${cleanedStr}"`,
    codeLine: 3,
  });

  steps.push({
    chars: [...chars],
    stage: 1,
    left: -1,
    right: -1,
    swapping: false,
    phase: 'clean-spaces',
    status: 'clean-spaces',
    message: `第 1 步完成：得到紧凑字符数组 "${cleanedStr}" (有效长度 ${chars.length})。`,
    log: `紧凑数组就绪 (长度 ${chars.length})`,
    codeLine: 3,
  });

  // Step 2: 反转整个字符串
  let left = 0;
  let right = chars.length - 1;

  steps.push({
    chars: [...chars],
    stage: 2,
    left,
    right,
    swapping: false,
    phase: 'reverse-all',
    status: 'reverse-all',
    message: `第 2 步：反转整个字符串。从 left = 0 到 right = ${right} 对撞反转。`,
    log: `开始整体反转 [0, ${right}]`,
    codeLine: 5,
  });

  while (left < right) {
    const temp = chars[left];
    chars[left] = chars[right];
    chars[right] = temp;

    steps.push({
      chars: [...chars],
      stage: 2,
      left,
      right,
      swapping: true,
      phase: 'reverse-all',
      status: 'reverse-all',
      message: `整体反转中：交换 chars[${left}] <-> chars[${right}] ('${temp}' <-> '${chars[left]}')。`,
      log: `交换 [${left}] <-> [${right}]`,
      codeLine: 5,
    });

    left++;
    right--;
  }

  steps.push({
    chars: [...chars],
    stage: 2,
    left: -1,
    right: -1,
    swapping: false,
    phase: 'reverse-all',
    status: 'reverse-all',
    message: `第 2 步完成：整体反转后为 "${chars.join('')}" (单词顺序已倒序，但单词内部字母也是倒的)。`,
    log: `整体反转完成: "${chars.join('')}"`,
    codeLine: 5,
  });

  // Step 3: 逐个单词反转
  let wordStart = 0;
  const n = chars.length;

  for (let i = 0; i <= n; i++) {
    if (i === n || chars[i] === ' ') {
      let wLeft = wordStart;
      let wRight = i - 1;
      const currentWordBefore = chars.slice(wLeft, wRight + 1).join('');

      steps.push({
        chars: [...chars],
        stage: 3,
        left: wLeft,
        right: wRight,
        wordStart: wLeft,
        wordEnd: wRight,
        swapping: false,
        phase: 'reverse-words',
        status: 'reverse-words',
        message: `第 3 步：锁定倒序单词 "${currentWordBefore}" 区间 [${wLeft}, ${wRight}]，准备局部反转恢复正常语序。`,
        log: `锁定单词区间 [${wLeft}, ${wRight}] ("${currentWordBefore}")`,
        codeLine: 7,
      });

      while (wLeft < wRight) {
        const temp = chars[wLeft];
        chars[wLeft] = chars[wRight];
        chars[wRight] = temp;

        steps.push({
          chars: [...chars],
          stage: 3,
          left: wLeft,
          right: wRight,
          wordStart,
          wordEnd: i - 1,
          swapping: true,
          phase: 'reverse-words',
          status: 'reverse-words',
          message: `单词内部交换：chars[${wLeft}] <-> chars[${wRight}] ('${temp}' <-> '${chars[wLeft]}')。`,
          log: `单词内交换 [${wLeft}] <-> [${wRight}]`,
          codeLine: 7,
        });

        wLeft++;
        wRight--;
      }

      wordStart = i + 1;
    }
  }

  steps.push({
    chars: [...chars],
    stage: 3,
    left: -1,
    right: -1,
    swapping: false,
    phase: 'done',
    status: 'done',
    message: `🎉 三步反转全部完成！最终翻转单词字符串为 "${chars.join('')}"。`,
    log: `✓ 求解完成: "${chars.join('')}"`,
    codeLine: 8,
  });

  return steps;
}

export class ReverseWordsVisualizer extends StepVisualizer<ReverseWordsStep> {
  protected codeLanguages = REVERSE_WORDS_CODE_LANGUAGES;
  protected codeLines = REVERSE_WORDS_CODE_LANGUAGES['java'];
  protected codePanelTitle = '翻转字符串里的单词 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private trackRowEl: HTMLElement | null = null;
  private pillStep1El: HTMLElement | null = null;
  private pillStep2El: HTMLElement | null = null;
  private pillStep3El: HTMLElement | null = null;
  private metricPhaseEl: HTMLElement | null = null;
  private metricLeftEl: HTMLElement | null = null;
  private metricRightEl: HTMLElement | null = null;
  private metricLengthEl: HTMLElement | null = null;
  private formulaOpEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.trackRowEl = this.root.querySelector('#rw-track-row');
    this.pillStep1El = this.root.querySelector('#pill-step-1');
    this.pillStep2El = this.root.querySelector('#pill-step-2');
    this.pillStep3El = this.root.querySelector('#pill-step-3');
    this.metricPhaseEl = this.root.querySelector('#metric-phase');
    this.metricLeftEl = this.root.querySelector('#metric-left');
    this.metricRightEl = this.root.querySelector('#metric-right');
    this.metricLengthEl = this.root.querySelector('#metric-length');
    this.formulaOpEl = this.root.querySelector('#formula-op');
    this.liveTextEl = this.root.querySelector('#rw-live-text');
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
    this.root.querySelectorAll<HTMLButtonElement>('.rw-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sInput = this.root?.querySelector('#input-s') as HTMLInputElement | null;
        if (sInput && btn.dataset.s) sInput.value = btn.dataset.s;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: REVERSE_WORDS_PROBLEM_HTML,
      analysisHtml: REVERSE_WORDS_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): ReverseWordsStep[] {
    const sInput = this.root?.querySelector('#input-s') as HTMLInputElement | null;
    const str = sInput?.value || '  the sky is blue  ';
    return buildReverseWordsSteps(str);
  }

  protected renderStep(step: ReverseWordsStep): void {
    const { chars, stage, left, right, wordStart, wordEnd, swapping, phase, message } = step;

    // 1. 渲染字符数组与高亮
    if (this.trackRowEl) {
      this.trackRowEl.innerHTML = chars
        .map((ch, idx) => {
          const isSpace = ch === ' ';
          const inWordWindow =
            wordStart !== undefined && wordEnd !== undefined && idx >= wordStart && idx <= wordEnd;
          const isLeft = idx === left && phase !== 'done';
          const isRight = idx === right && phase !== 'done';
          const isSwapping = swapping && (idx === left || idx === right);

          let cellClass = 'rw-cell-box';
          if (isSpace) cellClass += ' is-space';
          if (inWordWindow) cellClass += ' in-word-window';
          if (isSwapping) cellClass += ' is-swapping';
          else if (isLeft) cellClass += ' is-left';
          else if (isRight) cellClass += ' is-right';

          let ptrTags = '';
          if (isLeft && isRight) {
            ptrTags = '<span class="rw-ptr-badge left">L</span><span class="rw-ptr-badge right">R</span>';
          } else if (isLeft) {
            ptrTags = '<span class="rw-ptr-badge left">left</span>';
          } else if (isRight) {
            ptrTags = '<span class="rw-ptr-badge right">right</span>';
          }

          return `
            <div class="rw-cell-wrapper">
              <div class="rw-pointer-tags">${ptrTags}</div>
              <div class="${cellClass}">
                <span class="val">${isSpace ? '␣' : ch}</span>
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
      el.className = 'rw-stage-pill';
      if (currentStage === targetStage) el.classList.add('is-active');
      else if (currentStage > targetStage) el.classList.add('is-done');
    };
    updatePill(this.pillStep1El, stage, 1);
    updatePill(this.pillStep2El, stage, 2);
    updatePill(this.pillStep3El, stage, 3);

    // 3. 更新状态监视器
    if (this.metricLeftEl) this.metricLeftEl.textContent = left >= 0 && phase !== 'done' ? String(left) : '—';
    if (this.metricRightEl) this.metricRightEl.textContent = right >= 0 && phase !== 'done' ? String(right) : '—';
    if (this.metricLengthEl) this.metricLengthEl.textContent = `${chars.length}`;
    if (this.metricPhaseEl) {
      const phaseMap: Record<string, string> = {
        'clean-spaces': 'Step 1: 去空格',
        'reverse-all': 'Step 2: 整体反转',
        'reverse-words': 'Step 3: 单词反转',
        done: '完成',
      };
      this.metricPhaseEl.textContent = phaseMap[phase] || phase;
      this.metricPhaseEl.style.color = phase === 'done' ? '#10b981' : '#2563eb';
    }

    if (this.formulaOpEl) {
      if (phase === 'clean-spaces') {
        this.formulaOpEl.textContent = 'removeExtraSpaces(s)';
      } else if (phase === 'reverse-all') {
        this.formulaOpEl.textContent = 'reverse(s, 0, n - 1)';
      } else if (phase === 'reverse-words') {
        this.formulaOpEl.textContent = `reverseEachWord(s, [${wordStart}, ${wordEnd}])`;
      } else {
        this.formulaOpEl.textContent = '三步反转完成';
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
    const stepCurEl = this.root?.querySelector('#step-cur');
    const stepTotalEl = this.root?.querySelector('#step-total');
    if (stepCurEl) stepCurEl.textContent = String(this.currentStepIndex + 1);
    if (stepTotalEl) stepTotalEl.textContent = String(this.steps.length);

    const badgePhase = this.root?.querySelector('#badge-phase');
    if (badgePhase) {
      const phaseMap: Record<string, string> = {
        'clean-spaces': 'Step 1: 去空格',
        'reverse-all': 'Step 2: 整体反转',
        'reverse-words': 'Step 3: 单词反转',
        done: '完成',
      };
      badgePhase.textContent = phaseMap[phase] || phase;
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
  id: 'reverse-words',
  name: '翻转字符串里的单词（双指针）',
  viewId: 'algo-reverse-words-view',
  category: 'string',
  description: '移除多余空格并倒序拼接单词',
  icon: '🔃',
  difficulty: 2,
  levelOrder: 2,
  learningGoal: '学会分割-反转-重组的字符串处理模式',
  template,
  Visualizer: ReverseWordsVisualizer,
});
