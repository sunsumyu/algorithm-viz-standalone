/**
 * 旋转字符串 / 字符串迁移 (LC 796)
 * 4-Card 标准现代架构可视化器
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  STRING_MIGRATION_PROBLEM_HTML,
  STRING_MIGRATION_ANALYSIS_HTML,
  STRING_MIGRATION_CODE_LANGUAGES,
} from './string-migration-problem-content';
import template from './string-migration.html?raw';

export interface SCStep extends StepBase {
  str1: string;
  str2: string;
  concat: string;
  windowStart: number;
  windowEnd: number;
  shift: number;
  matched: boolean;
  matchPos: number | null;
  phase: 'init' | 'length-check' | 'concat' | 'slide' | 'found' | 'done';
  statusText: string;
  log: string;
  codeLine: number | number[];
}

export function buildStringMigrationSteps(str1 = 'abcde', str2 = 'cdeab'): SCStep[] {
  const steps: SCStep[] = [];
  const n = str1.length;
  const concat = str1 + str1;

  steps.push({
    str1,
    str2,
    concat,
    windowStart: 0,
    windowEnd: 0,
    shift: 0,
    matched: false,
    matchPos: null,
    phase: 'init',
    statusText: `初始化：源串 s="${str1}"（长度 ${n}），目标串 goal="${str2}"（长度 ${str2.length}）。`,
    log: `初始化: s="${str1}", goal="${str2}"`,
    codeLine: 1,
  });

  if (n !== str2.length) {
    steps.push({
      str1,
      str2,
      concat,
      windowStart: 0,
      windowEnd: 0,
      shift: 0,
      matched: false,
      matchPos: null,
      phase: 'length-check',
      statusText: `❌ 两字符串长度不等（${n} ≠ ${str2.length}），goal 绝不可能通过 s 旋转得到，直接返回 false。`,
      log: `长度不等: ${n} ≠ ${str2.length} -> false`,
      codeLine: 2,
    });
    return steps;
  }

  steps.push({
    str1,
    str2,
    concat,
    windowStart: 0,
    windowEnd: n,
    shift: 0,
    matched: false,
    matchPos: null,
    phase: 'concat',
    statusText: `构建双倍拼接串 concat = s + s = "${concat}"。只要 goal 是其子串，则满足旋转等价性。`,
    log: `双倍拼接: "${concat}"`,
    codeLine: 3,
  });

  let foundMatch = false;
  let finalShift = -1;

  for (let i = 0; i <= n; i++) {
    const windowStr = concat.substring(i, i + n);
    const isMatch = windowStr === str2;

    steps.push({
      str1,
      str2,
      concat,
      windowStart: i,
      windowEnd: i + n,
      shift: i,
      matched: isMatch,
      matchPos: isMatch ? i : null,
      phase: isMatch ? 'found' : 'slide',
      statusText: `滑动窗口 [${i}, ${i + n}): "${windowStr}" ${
        isMatch ? '=== goal！匹配成功！' : `≠ "${str2}"`
      }。当前左旋偏移量 shift=${i}。`,
      log: `位移 shift=${i}: "${windowStr}" ${isMatch ? '✓ 匹配' : '✗ 不匹配'}`,
      codeLine: 4,
    });

    if (isMatch) {
      foundMatch = true;
      finalShift = i;
      break;
    }
  }

  steps.push({
    str1,
    str2,
    concat,
    windowStart: finalShift >= 0 ? finalShift : 0,
    windowEnd: finalShift >= 0 ? finalShift + n : n,
    shift: finalShift >= 0 ? finalShift : 0,
    matched: foundMatch,
    matchPos: finalShift >= 0 ? finalShift : null,
    phase: 'done',
    statusText: foundMatch
      ? `🎉 判定成功！goal 是 s 经过左旋 ${finalShift} 步后的旋转字符串（返回 true）。`
      : `❌ 遍历完毕未找到匹配，goal 不是 s 的旋转字符串（返回 false）。`,
    log: `✓ 判定完成: 结果 = ${foundMatch}${foundMatch ? ` (偏移量=${finalShift})` : ''}`,
    codeLine: 5,
  });

  return steps;
}

export class StringMigrationVisualizer extends StepVisualizer<SCStep> {
  protected codeLanguages = STRING_MIGRATION_CODE_LANGUAGES;
  protected codeLines = STRING_MIGRATION_CODE_LANGUAGES['java'];
  protected codePanelTitle = '旋转字符串 (LC 796) 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private goalStripEl: HTMLElement | null = null;
  private concatStripEl: HTMLElement | null = null;
  private metricShiftEl: HTMLElement | null = null;
  private metricWindowStrEl: HTMLElement | null = null;
  private metricMatchPosEl: HTMLElement | null = null;
  private metricResultEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.goalStripEl = this.root.querySelector('#sm-goal-strip');
    this.concatStripEl = this.root.querySelector('#sm-concat-strip');
    this.metricShiftEl = this.root.querySelector('#metric-shift');
    this.metricWindowStrEl = this.root.querySelector('#metric-window-str');
    this.metricMatchPosEl = this.root.querySelector('#metric-match-pos');
    this.metricResultEl = this.root.querySelector('#metric-result');
    this.liveTextEl = this.root.querySelector('#sm-live-text');
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
        this.playbackSpeed = parseInt(speedSelect.value, 10) || 500;
      });
    }

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: STRING_MIGRATION_PROBLEM_HTML,
      analysisHtml: STRING_MIGRATION_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): SCStep[] {
    return buildStringMigrationSteps();
  }

  protected renderStep(step: SCStep): void {
    const { str2, concat, windowStart, windowEnd, shift, matched, matchPos, statusText, phase } = step;

    // 1. 渲染 goal 字符串
    if (this.goalStripEl) {
      let goalHtml = '';
      for (let i = 0; i < str2.length; i++) {
        goalHtml += `<div class="sm-char-box"><span>${str2[i]}</span></div>`;
      }
      this.goalStripEl.innerHTML = goalHtml;
    }

    // 2. 渲染 concat 字符串与滑动窗口高亮
    if (this.concatStripEl) {
      let concatHtml = '';
      for (let i = 0; i < concat.length; i++) {
        const inWindow = i >= windowStart && i < windowEnd;
        let cls = 'sm-char-box';
        if (inWindow) {
          cls += matched ? ' is-match' : ' is-in-window';
        }
        concatHtml += `<div class="${cls}">
          <span style="font-size:10px; color:#94a3b8; margin-bottom:-2px;">${i}</span>
          <span>${concat[i]}</span>
        </div>`;
      }
      this.concatStripEl.innerHTML = concatHtml;
    }

    // 3. 更新状态监视器
    if (this.metricShiftEl) {
      this.metricShiftEl.textContent = `${shift}`;
    }
    if (this.metricWindowStrEl) {
      this.metricWindowStrEl.textContent = phase === 'init' || phase === 'length-check' ? '—' : `"${concat.substring(windowStart, windowEnd)}"`;
    }
    if (this.metricMatchPosEl) {
      this.metricMatchPosEl.textContent = matchPos !== null ? `${matchPos}` : '—';
    }
    if (this.metricResultEl) {
      this.metricResultEl.textContent = phase === 'done' ? (matched ? 'True (有效)' : 'False (无效)') : '匹配中...';
      this.metricResultEl.style.color = phase === 'done' ? (matched ? '#16a34a' : '#dc2626') : '#2563eb';
    }

    if (this.liveTextEl) this.liveTextEl.textContent = statusText;

    // 4. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background =
        phase === 'done' && matched
          ? '#f0fdf4'
          : phase === 'done' && !matched
          ? '#fef2f2'
          : phase === 'found'
          ? '#eff6ff'
          : '#f8fafc';
      logEntry.style.color =
        phase === 'done' && matched
          ? '#15803d'
          : phase === 'done' && !matched
          ? '#dc2626'
          : phase === 'found'
          ? '#1d4ed8'
          : '#64748b';
      logEntry.style.border =
        '1px solid ' +
        (phase === 'done' && matched
          ? '#bbf7d0'
          : phase === 'done' && !matched
          ? '#fecaca'
          : phase === 'found'
          ? '#bfdbfe'
          : '#e2e8f0');
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

    const badgeStatus = this.root?.querySelector('#badge-match-status');
    if (badgeStatus) {
      badgeStatus.textContent = phase === 'done' ? (matched ? '匹配成功 (True)' : '匹配失败 (False)') : '匹配中...';
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
  id: 'string-migration',
  name: '旋转字符串 (LC 796)',
  viewId: 'algo-string-migration-view',
  category: 'graph',
  description: '双倍拼接与滑动窗口子串匹配：验证 goal 是否为源字符串 s 的循环旋转移位',
  icon: '🔤',
  difficulty: 1,
  levelOrder: 24,
  learningGoal: '掌握经典字符串循环旋转的双倍拼接 (s + s) 判定定理与滑动窗口单步匹配',
  template,
  Visualizer: StringMigrationVisualizer,
});
