/**
 * 有效的字母异位词可视化器 — 4-Card 标准现代架构
 * LeetCode 242：26 字符哈希计数数组
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  ANAGRAM_PROBLEM_HTML,
  ANAGRAM_ANALYSIS_HTML,
  ANAGRAM_CODE_LANGUAGES,
} from './anagram-problem-content';
import template from './anagram.html?raw';

export interface AnagramStep {
  s: string;
  t: string;
  phase: 'check-length' | 'scan-s' | 'scan-t' | 'check-record' | 'done';
  charIndex: number;
  currentChar: string | null;
  targetSlot: number | null;
  record: number[];
  isMatch: boolean;
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildAnagramSteps(s: string, t: string): AnagramStep[] {
  const steps: AnagramStep[] = [];
  const record = new Array(26).fill(0);

  // 1. 检查长度
  if (s.length !== t.length) {
    steps.push({
      s,
      t,
      phase: 'check-length',
      charIndex: -1,
      currentChar: null,
      targetSlot: null,
      record: [...record],
      isMatch: false,
      message: `字符串 s 长度 (${s.length}) 与 t 长度 (${t.length}) 不相等，无法构成字母异位词，直接返回 false。`,
      log: `长度不一致: ${s.length} != ${t.length} => false`,
      codeLine: 2,
    });
    return steps;
  }

  steps.push({
    s,
    t,
    phase: 'check-length',
    charIndex: -1,
    currentChar: null,
    targetSlot: null,
    record: [...record],
    isMatch: true,
    message: `两字符串长度一致 (len = ${s.length})，初始化 26 长度哈希数组 record = [0, ..., 0]。`,
    log: `长度一致 (len=${s.length})，初始化 record[26]`,
    codeLine: 3,
  });

  // 2. 扫描 s
  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    const slot = char.charCodeAt(0) - 'a'.charCodeAt(0);
    record[slot]++;

    steps.push({
      s,
      t,
      phase: 'scan-s',
      charIndex: i,
      currentChar: char,
      targetSlot: slot,
      record: [...record],
      isMatch: true,
      message: `扫描 s[${i}] = '${char}'：槽位 index = '${char}' - 'a' = ${slot}，频次累加 record[${slot}]++ (变为 ${record[slot]})。`,
      log: `s[${i}]='${char}': record[${slot}]++ => ${record[slot]}`,
      codeLine: [4, 5],
    });
  }

  // 3. 扫描 t
  for (let i = 0; i < t.length; i++) {
    const char = t[i];
    const slot = char.charCodeAt(0) - 'a'.charCodeAt(0);
    record[slot]--;

    steps.push({
      s,
      t,
      phase: 'scan-t',
      charIndex: i,
      currentChar: char,
      targetSlot: slot,
      record: [...record],
      isMatch: true,
      message: `扫描 t[${i}] = '${char}'：槽位 index = '${char}' - 'a' = ${slot}，频次扣减 record[${slot}]-- (变为 ${record[slot]})。`,
      log: `t[${i}]='${char}': record[${slot}]-- => ${record[slot]}`,
      codeLine: [7, 8],
    });
  }

  // 4. 检查 record 是否全 0
  const isAnagram = record.every((count) => count === 0);
  steps.push({
    s,
    t,
    phase: 'check-record',
    charIndex: -1,
    currentChar: null,
    targetSlot: null,
    record: [...record],
    isMatch: isAnagram,
    message: isAnagram
      ? `🎉 遍历 record[26]，所有字符槽位计数全部归零！s 与 t 互为有效的字母异位词，返回 true。`
      : `⚠️ 遍历 record[26]，发现存在非零槽位计数，字符频次不完全一致，返回 false。`,
    log: `检查 record 数组 => ${isAnagram ? '全部归 0 (true)' : '存在非零项 (false)'}`,
    codeLine: [10, 11, 13],
  });

  return steps;
}

export class AnagramVisualizer extends StepVisualizer<AnagramStep> {
  protected codeLanguages = ANAGRAM_CODE_LANGUAGES;
  protected codeLines = ANAGRAM_CODE_LANGUAGES['java'];
  protected codePanelTitle = '有效的字母异位词 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private trackSEl: HTMLElement | null = null;
  private trackTEl: HTMLElement | null = null;
  private bucketsGridEl: HTMLElement | null = null;
  private metricPhaseEl: HTMLElement | null = null;
  private metricCharEl: HTMLElement | null = null;
  private metricSlotEl: HTMLElement | null = null;
  private metricResEl: HTMLElement | null = null;
  private formulaCalcEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.trackSEl = this.root.querySelector('#an-track-s');
    this.trackTEl = this.root.querySelector('#an-track-t');
    this.bucketsGridEl = this.root.querySelector('#an-buckets-grid');
    this.metricPhaseEl = this.root.querySelector('#metric-phase');
    this.metricCharEl = this.root.querySelector('#metric-char');
    this.metricSlotEl = this.root.querySelector('#metric-slot');
    this.metricResEl = this.root.querySelector('#metric-res');
    this.formulaCalcEl = this.root.querySelector('#formula-calc');
    this.liveTextEl = this.root.querySelector('#an-live-text');
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
    this.root.querySelectorAll<HTMLButtonElement>('.an-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sInput = this.root?.querySelector('#input-s') as HTMLInputElement | null;
        const tInput = this.root?.querySelector('#input-t') as HTMLInputElement | null;
        if (sInput && btn.dataset.s) sInput.value = btn.dataset.s;
        if (tInput && btn.dataset.t) tInput.value = btn.dataset.t;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: ANAGRAM_PROBLEM_HTML,
      analysisHtml: ANAGRAM_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): AnagramStep[] {
    const sInput = this.root?.querySelector('#input-s') as HTMLInputElement | null;
    const tInput = this.root?.querySelector('#input-t') as HTMLInputElement | null;
    const s = sInput?.value || 'anagram';
    const t = tInput?.value || 'nagaram';
    return buildAnagramSteps(s, t);
  }

  protected renderStep(step: AnagramStep): void {
    const { s, t, phase, charIndex, currentChar, targetSlot, record, isMatch, message } = step;

    // 1. 渲染 s 和 t 字符串
    if (this.trackSEl) {
      this.trackSEl.innerHTML = s
        .split('')
        .map((ch, idx) => {
          const isActive = phase === 'scan-s' && charIndex === idx;
          return `
            <div class="an-char-box ${isActive ? 'is-active' : ''}">
              <span>${ch}</span>
            </div>
          `;
        })
        .join('');
    }

    if (this.trackTEl) {
      this.trackTEl.innerHTML = t
        .split('')
        .map((ch, idx) => {
          const isActive = phase === 'scan-t' && charIndex === idx;
          return `
            <div class="an-char-box ${isActive ? 'is-active' : ''}">
              <span>${ch}</span>
            </div>
          `;
        })
        .join('');
    }

    // 2. 渲染 26 字符哈希桶
    if (this.bucketsGridEl) {
      this.bucketsGridEl.innerHTML = record
        .map((count, idx) => {
          const char = String.fromCharCode(97 + idx);
          const isTarget = targetSlot === idx;
          let cellClass = 'an-bucket-cell';
          if (count > 0) cellClass += ' is-pos';
          else if (count < 0) cellClass += ' is-neg';
          if (isTarget) cellClass += ' is-target';

          return `
            <div class="${cellClass}">
              <span class="an-bucket-char">${char}</span>
              <span class="an-bucket-count">${count}</span>
            </div>
          `;
        })
        .join('');
    }

    // 3. 更新状态监视器
    if (this.metricPhaseEl) {
      const phaseNames: Record<string, string> = {
        'check-length': '长度检查',
        'scan-s': 's 累加计数',
        'scan-t': 't 抵消扣减',
        'check-record': '结果判定',
        done: '完成',
      };
      this.metricPhaseEl.textContent = phaseNames[phase] || phase;
    }
    if (this.metricCharEl) this.metricCharEl.textContent = currentChar ? `'${currentChar}'` : '—';
    if (this.metricSlotEl) this.metricSlotEl.textContent = targetSlot !== null ? `[${targetSlot}]` : '—';
    if (this.metricResEl) {
      if (phase === 'check-record' || phase === 'done') {
        this.metricResEl.textContent = isMatch ? '✓ true (是)' : '✗ false (否)';
        this.metricResEl.style.color = isMatch ? '#10b981' : '#ef4444';
      } else {
        this.metricResEl.textContent = '统计中...';
        this.metricResEl.style.color = '#3b82f6';
      }
    }

    if (this.formulaCalcEl) {
      if (currentChar && targetSlot !== null) {
        this.formulaCalcEl.textContent = `'${currentChar}' - 'a' = ${targetSlot} (record[${targetSlot}] = ${record[targetSlot]})`;
      } else {
        this.formulaCalcEl.textContent = `'char' - 'a' = 槽位索引 (0~25)`;
      }
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 4. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background = phase === 'check-record' ? (isMatch ? '#f0fdf4' : '#fef2f2') : '#eff6ff';
      logEntry.style.color = phase === 'check-record' ? (isMatch ? '#15803d' : '#b91c1c') : '#1d4ed8';
      logEntry.style.border =
        '1px solid ' + (phase === 'check-record' ? (isMatch ? '#bbf7d0' : '#fecaca') : '#bfdbfe');
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
      const phaseNames: Record<string, string> = {
        'check-length': '长度检查',
        'scan-s': 's 累加计数',
        'scan-t': 't 抵消扣减',
        'check-record': '结果判定',
        done: '完成',
      };
      badgePhase.textContent = phaseNames[phase] || phase;
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
  id: 'anagram',
  name: '有效的字母异位词（哈希计数）',
  viewId: 'algo-anagram-view',
  category: 'hash-table',
  description: '长度26数组统计频次判断异位词',
  icon: '🔤',
  difficulty: 1,
  levelOrder: 3,
  learningGoal: '用字符频次统计判断字母异位词',
  template,
  Visualizer: AnagramVisualizer,
});
