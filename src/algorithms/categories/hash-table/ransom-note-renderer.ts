/**
 * 赎金信可视化器 — 4-Card 标准现代架构
 * LeetCode 383：26 字符哈希库存数组
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  RANSOM_NOTE_PROBLEM_HTML,
  RANSOM_NOTE_ANALYSIS_HTML,
  RANSOM_NOTE_CODE_LANGUAGES,
} from './ransom-note-problem-content';
import template from './ransom-note.html?raw';

export interface RansomNoteStep {
  ransomNote: string;
  magazine: string;
  phase: 'check-length' | 'stock-mag' | 'deduct-ran' | 'done';
  charIndex: number;
  currentChar: string | null;
  targetSlot: number | null;
  record: number[];
  canConstruct: boolean;
  overdraftSlot: number | null;
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildRansomNoteSteps(ransomNote: string, magazine: string): RansomNoteStep[] {
  const steps: RansomNoteStep[] = [];
  const record = new Array(26).fill(0);

  if (ransomNote.length > magazine.length) {
    steps.push({
      ransomNote,
      magazine,
      phase: 'check-length',
      charIndex: -1,
      currentChar: null,
      targetSlot: null,
      record: [...record],
      canConstruct: false,
      overdraftSlot: null,
      message: `赎金信长度 (${ransomNote.length}) 大于杂志库长度 (${magazine.length})，字符总数不足，直接返回 false。`,
      log: `长度不足: ${ransomNote.length} > ${magazine.length} => false`,
      codeLine: 2,
    });
    return steps;
  }

  steps.push({
    ransomNote,
    magazine,
    phase: 'check-length',
    charIndex: -1,
    currentChar: null,
    targetSlot: null,
    record: [...record],
    canConstruct: true,
    overdraftSlot: null,
    message: `长度校验通过 (ransomNote: ${ransomNote.length}, magazine: ${magazine.length})，初始化 26 槽位字符库存表 record。`,
    log: `初始化库存 record[26]`,
    codeLine: 3,
  });

  // 1. 扫描 magazine 进库
  for (let i = 0; i < magazine.length; i++) {
    const char = magazine[i];
    const slot = char.charCodeAt(0) - 'a'.charCodeAt(0);
    record[slot]++;

    steps.push({
      ransomNote,
      magazine,
      phase: 'stock-mag',
      charIndex: i,
      currentChar: char,
      targetSlot: slot,
      record: [...record],
      canConstruct: true,
      overdraftSlot: null,
      message: `杂志库进库 magazine[${i}] = '${char}'：槽位 [${slot}] 库存 +1 (现存 ${record[slot]})。`,
      log: `杂志入库 '${char}': record[${slot}] = ${record[slot]}`,
      codeLine: [4, 5],
    });
  }

  // 2. 扫描 ransomNote 消耗
  for (let j = 0; j < ransomNote.length; j++) {
    const char = ransomNote[j];
    const slot = char.charCodeAt(0) - 'a'.charCodeAt(0);
    record[slot]--;

    if (record[slot] < 0) {
      steps.push({
        ransomNote,
        magazine,
        phase: 'deduct-ran',
        charIndex: j,
        currentChar: char,
        targetSlot: slot,
        record: [...record],
        canConstruct: false,
        overdraftSlot: slot,
        message: `⚠️ 赎金信扣减 ransomNote[${j}] = '${char}'：槽位 [${slot}] 库存不足透支 (record[${slot}] = ${record[slot]} < 0)！无法构成赎金信，返回 false。`,
        log: `✗ 透支: 字符 '${char}' 不足 (record[${slot}] < 0)`,
        codeLine: [7, 8, 9],
      });
      return steps;
    }

    steps.push({
      ransomNote,
      magazine,
      phase: 'deduct-ran',
      charIndex: j,
      currentChar: char,
      targetSlot: slot,
      record: [...record],
      canConstruct: true,
      overdraftSlot: null,
      message: `赎金信扣减 ransomNote[${j}] = '${char}'：槽位 [${slot}] 消耗 1 (剩余库存 ${record[slot]})。`,
      log: `消耗 '${char}': record[${slot}] 剩余 ${record[slot]}`,
      codeLine: [7, 8],
    });
  }

  steps.push({
    ransomNote,
    magazine,
    phase: 'done',
    charIndex: -1,
    currentChar: null,
    targetSlot: null,
    record: [...record],
    canConstruct: true,
    overdraftSlot: null,
    message: `🎉 赎金信所有字符均已成功在杂志库中找到并扣减！可以构成赎金信，返回 true。`,
    log: `✓ 成功构成赎金信 (true)`,
    codeLine: 12,
  });

  return steps;
}

export class RansomNoteVisualizer extends StepVisualizer<RansomNoteStep> {
  protected codeLanguages = RANSOM_NOTE_CODE_LANGUAGES;
  protected codeLines = RANSOM_NOTE_CODE_LANGUAGES['java'];
  protected codePanelTitle = '赎金信 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private trackMagEl: HTMLElement | null = null;
  private trackRanEl: HTMLElement | null = null;
  private bucketsGridEl: HTMLElement | null = null;
  private metricPhaseEl: HTMLElement | null = null;
  private metricCharEl: HTMLElement | null = null;
  private metricStockEl: HTMLElement | null = null;
  private metricResEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.trackMagEl = this.root.querySelector('#rn-track-mag');
    this.trackRanEl = this.root.querySelector('#rn-track-ran');
    this.bucketsGridEl = this.root.querySelector('#rn-buckets-grid');
    this.metricPhaseEl = this.root.querySelector('#metric-phase');
    this.metricCharEl = this.root.querySelector('#metric-char');
    this.metricStockEl = this.root.querySelector('#metric-stock');
    this.metricResEl = this.root.querySelector('#metric-res');
    this.liveTextEl = this.root.querySelector('#rn-live-text');
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
    this.root.querySelectorAll<HTMLButtonElement>('.rn-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const rInput = this.root?.querySelector('#input-ransom') as HTMLInputElement | null;
        const mInput = this.root?.querySelector('#input-magazine') as HTMLInputElement | null;
        if (rInput && btn.dataset.r) rInput.value = btn.dataset.r;
        if (mInput && btn.dataset.m) mInput.value = btn.dataset.m;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: RANSOM_NOTE_PROBLEM_HTML,
      analysisHtml: RANSOM_NOTE_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): RansomNoteStep[] {
    const rInput = this.root?.querySelector('#input-ransom') as HTMLInputElement | null;
    const mInput = this.root?.querySelector('#input-magazine') as HTMLInputElement | null;
    const ransom = rInput?.value || 'aa';
    const mag = mInput?.value || 'aab';
    return buildRansomNoteSteps(ransom, mag);
  }

  protected renderStep(step: RansomNoteStep): void {
    const {
      ransomNote,
      magazine,
      phase,
      charIndex,
      currentChar,
      targetSlot,
      record,
      canConstruct,
      overdraftSlot,
      message,
    } = step;

    // 1. 渲染 magazine 和 ransomNote 字符流
    if (this.trackMagEl) {
      this.trackMagEl.innerHTML = magazine
        .split('')
        .map((ch, idx) => {
          const isActive = phase === 'stock-mag' && charIndex === idx;
          return `
            <div class="rn-char-box ${isActive ? 'is-active' : ''}">
              <span>${ch}</span>
            </div>
          `;
        })
        .join('');
    }

    if (this.trackRanEl) {
      this.trackRanEl.innerHTML = ransomNote
        .split('')
        .map((ch, idx) => {
          const isActive = phase === 'deduct-ran' && charIndex === idx;
          return `
            <div class="rn-char-box ${isActive ? 'is-active' : ''}">
              <span>${ch}</span>
            </div>
          `;
        })
        .join('');
    }

    // 2. 渲染 26 字符库存网格
    if (this.bucketsGridEl) {
      this.bucketsGridEl.innerHTML = record
        .map((count, idx) => {
          const char = String.fromCharCode(97 + idx);
          const isTarget = targetSlot === idx;
          const isOverdraft = overdraftSlot === idx;

          let cellClass = 'rn-bucket-cell';
          if (isOverdraft) cellClass += ' is-overdraft';
          else if (count > 0) cellClass += ' is-pos';
          if (isTarget) cellClass += ' is-target';

          return `
            <div class="${cellClass}">
              <span class="rn-bucket-char">${char}</span>
              <span class="rn-bucket-count">${count}</span>
            </div>
          `;
        })
        .join('');
    }

    // 3. 更新状态监视器
    if (this.metricPhaseEl) {
      const phaseNames: Record<string, string> = {
        'check-length': '长度检查',
        'stock-mag': '杂志入库',
        'deduct-ran': '赎金信扣减',
        done: '完成',
      };
      this.metricPhaseEl.textContent = phaseNames[phase] || phase;
    }
    if (this.metricCharEl) this.metricCharEl.textContent = currentChar ? `'${currentChar}'` : '—';
    if (this.metricStockEl) {
      this.metricStockEl.textContent = targetSlot !== null ? String(record[targetSlot]) : '—';
    }
    if (this.metricResEl) {
      if (overdraftSlot !== null) {
        this.metricResEl.textContent = '✗ false (不足)';
        this.metricResEl.style.color = '#ef4444';
      } else if (phase === 'done') {
        this.metricResEl.textContent = '✓ true (满足)';
        this.metricResEl.style.color = '#10b981';
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
      logEntry.style.background =
        overdraftSlot !== null ? '#fef2f2' : phase === 'done' ? '#f0fdf4' : '#eff6ff';
      logEntry.style.color =
        overdraftSlot !== null ? '#b91c1c' : phase === 'done' ? '#15803d' : '#1d4ed8';
      logEntry.style.border =
        '1px solid ' +
        (overdraftSlot !== null ? '#fecaca' : phase === 'done' ? '#bbf7d0' : '#bfdbfe');
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
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
    if (this.terminalInstance) this.terminalInstance.highlightLine(0);
  }
}

registerAlgorithm({
  id: 'ransom-note',
  name: '赎金信（字符计数）',
  viewId: 'algo-ransom-note-view',
  category: 'hash-table',
  description: '用字符频率表判断赎金信能否由杂志构造',
  icon: '📰',
  difficulty: 1,
  levelOrder: 5,
  learningGoal: '掌握用 Map 统计字符频率的方法',
  template,
  Visualizer: RansomNoteVisualizer,
});
