/**
 * 替换数字可视化器 — 4-Card 标准现代架构
 * KamaCoder 54：预扩容与从后向前双指针替换
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  REPLACE_DIGITS_PROBLEM_HTML,
  REPLACE_DIGITS_ANALYSIS_HTML,
  REPLACE_DIGITS_CODE_LANGUAGES,
} from './replace-digits-problem-content';
import template from './replace-digits.html?raw';

export interface ReplaceDigitsStep {
  chars: string[];
  oldIndex: number;
  newIndex: number;
  digitCount: number;
  isDigit: boolean;
  phase: 'count' | 'resize' | 'replace-letter' | 'replace-number' | 'done';
  status: 'count' | 'resize' | 'replace-letter' | 'replace-number' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildReplaceDigitsSteps(inputStr: string): ReplaceDigitsStep[] {
  const steps: ReplaceDigitsStep[] = [];
  const oldChars = inputStr.split('');
  const oldSize = oldChars.length;
  let count = 0;

  for (const c of oldChars) {
    if (c >= '0' && c <= '9') count++;
  }

  const newSize = oldSize + count * 5;
  const newChars = new Array<string>(newSize).fill('');
  for (let idx = 0; idx < oldSize; idx++) {
    newChars[idx] = oldChars[idx];
  }

  steps.push({
    chars: [...newChars],
    oldIndex: oldSize - 1,
    newIndex: newSize - 1,
    digitCount: count,
    isDigit: false,
    phase: 'count',
    status: 'count',
    message: `扫描统计数字字符：共找到 ${count} 个数字。旧长度 oldSize = ${oldSize}。`,
    log: `统计数字: ${count} 个数字字符`,
    codeLine: [4, 5, 6, 7],
  });

  steps.push({
    chars: [...newChars],
    oldIndex: oldSize - 1,
    newIndex: newSize - 1,
    digitCount: count,
    isDigit: false,
    phase: 'resize',
    status: 'resize',
    message: `执行数组预扩容：newSize = ${oldSize} + ${count} * 5 = ${newSize}。双指针 oldIndex=${oldSize - 1}, newIndex=${newSize - 1} 从后向前填充。`,
    log: `数组预扩容: ${oldSize} -> ${newSize}`,
    codeLine: [8, 9, 10],
  });

  let i = oldSize - 1;
  let j = newSize - 1;

  while (i >= 0 && j >= 0) {
    const char = newChars[i];
    const isDigitChar = char >= '0' && char <= '9';

    if (!isDigitChar) {
      newChars[j] = char;
      if (i !== j) newChars[i] = '';

      steps.push({
        chars: [...newChars],
        oldIndex: i,
        newIndex: j,
        digitCount: count,
        isDigit: false,
        phase: 'replace-letter',
        status: 'replace-letter',
        message: `非数字字符 '${char}'：直接从 oldIndex(${i}) 搬移至 newIndex(${j})。`,
        log: `复制字母 '${char}': [${i}] -> [${j}]`,
        codeLine: [11, 12],
      });

      i--;
      j--;
    } else {
      const numberToken = 'number';
      for (let k = numberToken.length - 1; k >= 0; k--) {
        newChars[j] = numberToken[k];
        j--;
      }
      if (i < j + 1) newChars[i] = '';

      steps.push({
        chars: [...newChars],
        oldIndex: i,
        newIndex: j + 1,
        digitCount: count,
        isDigit: true,
        phase: 'replace-number',
        status: 'replace-number',
        message: `数字字符 '${char}'：替换为 "number"，从 newIndex 向前连续填入 6 个字符。`,
        log: `替换数字 '${char}' -> "number"`,
        codeLine: [13, 14, 15],
      });

      i--;
    }
  }

  steps.push({
    chars: [...newChars],
    oldIndex: -1,
    newIndex: -1,
    digitCount: count,
    isDigit: false,
    phase: 'done',
    status: 'done',
    message: `🎉 替换全部完成！最终字符串为 "${newChars.join('')}"。`,
    log: `✓ 完成: "${newChars.join('')}"`,
    codeLine: 18,
  });

  return steps;
}

export class ReplaceDigitsVisualizer extends StepVisualizer<ReplaceDigitsStep> {
  protected codeLanguages = REPLACE_DIGITS_CODE_LANGUAGES;
  protected codeLines = REPLACE_DIGITS_CODE_LANGUAGES['java'];
  protected codePanelTitle = '替换数字 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private trackRowEl: HTMLElement | null = null;
  private metricOldIdxEl: HTMLElement | null = null;
  private metricNewIdxEl: HTMLElement | null = null;
  private metricDigitCountEl: HTMLElement | null = null;
  private metricPhaseEl: HTMLElement | null = null;
  private formulaResizeEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.trackRowEl = this.root.querySelector('#rd-track-row');
    this.metricOldIdxEl = this.root.querySelector('#metric-old-idx');
    this.metricNewIdxEl = this.root.querySelector('#metric-new-idx');
    this.metricDigitCountEl = this.root.querySelector('#metric-digit-count');
    this.metricPhaseEl = this.root.querySelector('#metric-phase');
    this.formulaResizeEl = this.root.querySelector('#formula-resize');
    this.liveTextEl = this.root.querySelector('#rd-live-text');
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
    this.root.querySelectorAll<HTMLButtonElement>('.rd-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sInput = this.root?.querySelector('#input-s') as HTMLInputElement | null;
        if (sInput && btn.dataset.s) sInput.value = btn.dataset.s;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: REPLACE_DIGITS_PROBLEM_HTML,
      analysisHtml: REPLACE_DIGITS_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): ReplaceDigitsStep[] {
    const sInput = this.root?.querySelector('#input-s') as HTMLInputElement | null;
    const str = sInput?.value || 'a1b2c';
    return buildReplaceDigitsSteps(str);
  }

  protected renderStep(step: ReplaceDigitsStep): void {
    const { chars, oldIndex, newIndex, digitCount, isDigit, phase, message } = step;

    // 1. 渲染扩容字符数组轨与双指针
    if (this.trackRowEl) {
      this.trackRowEl.innerHTML = chars
        .map((ch, idx) => {
          const isOld = idx === oldIndex && phase !== 'done';
          const isNew = idx === newIndex && phase !== 'done';
          const isNumberToken = !isOld && !isNew && (ch === 'n' || ch === 'u' || ch === 'm' || ch === 'b' || ch === 'e' || ch === 'r');

          let cellClass = 'rd-cell-box';
          if (isOld) cellClass += ' is-old';
          else if (isNew) cellClass += ' is-new';
          else if (isNumberToken) cellClass += ' is-number-token';

          let ptrTags = '';
          if (isOld && isNew) {
            ptrTags = '<span class="rd-ptr-badge old-ptr">old</span><span class="rd-ptr-badge new-ptr">new</span>';
          } else if (isOld) {
            ptrTags = '<span class="rd-ptr-badge old-ptr">old</span>';
          } else if (isNew) {
            ptrTags = '<span class="rd-ptr-badge new-ptr">new</span>';
          }

          return `
            <div class="rd-cell-wrapper">
              <div class="rd-pointer-tags">${ptrTags}</div>
              <div class="${cellClass}">
                <span class="val">${ch || '&nbsp;'}</span>
                <span class="idx">${idx}</span>
              </div>
            </div>
          `;
        })
        .join('');
    }

    // 2. 更新状态监视器
    if (this.metricOldIdxEl) this.metricOldIdxEl.textContent = oldIndex >= 0 ? String(oldIndex) : '—';
    if (this.metricNewIdxEl) this.metricNewIdxEl.textContent = newIndex >= 0 ? String(newIndex) : '—';
    if (this.metricDigitCountEl) this.metricDigitCountEl.textContent = `${digitCount} 个`;
    if (this.metricPhaseEl) {
      const phaseMap: Record<string, string> = {
        count: '统计数字',
        resize: '预扩容',
        'replace-letter': '搬移字母',
        'replace-number': '替换 number',
        done: '替换完成',
      };
      this.metricPhaseEl.textContent = phaseMap[phase] || phase;
      this.metricPhaseEl.style.color = phase === 'done' ? '#10b981' : isDigit ? '#2563eb' : '#0f172a';
    }

    if (this.formulaResizeEl) {
      this.formulaResizeEl.textContent = `newSize = ${chars.length - digitCount * 5} + ${digitCount} * 5 = ${chars.length}`;
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 3. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background =
        phase === 'done' ? '#f0fdf4' : isDigit ? '#eff6ff' : '#f8fafc';
      logEntry.style.color =
        phase === 'done' ? '#15803d' : isDigit ? '#1d4ed8' : '#334155';
      logEntry.style.border =
        '1px solid ' +
        (phase === 'done' ? '#bbf7d0' : isDigit ? '#bfdbfe' : '#e2e8f0');
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

    const badgePhase = this.root?.querySelector('#badge-phase');
    if (badgePhase) {
      const phaseMap: Record<string, string> = {
        init: '初始化',
        resize: '预扩容',
        'replace-letter': '搬移字母',
        'replace-number': '替换 number',
        done: '替换完成',
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
  id: 'replace-digits',
  name: '替换数字（单指针遍历）',
  viewId: 'algo-replace-digits-view',
  category: 'string',
  description: '遍历字符串，将数字字符替换为指定内容',
  icon: '🔢',
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '掌握字符串遍历中条件替换的逻辑',
  template,
  Visualizer: ReplaceDigitsVisualizer,
});
