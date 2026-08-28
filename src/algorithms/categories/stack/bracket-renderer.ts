/**
 * 括号匹配可视化器 — 4-Card 标准现代架构
 * LeetCode 20：遇左括号压入对应右括号，遇右括号只需 O(1) 比对并弹出栈顶
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  BRACKET_PROBLEM_HTML,
  BRACKET_ANALYSIS_HTML,
  BRACKET_CODE_LANGUAGES,
} from './bracket-problem-content';
import template from './bracket.html?raw';

export interface BracketStep {
  rawString: string;
  currentIndex: number;
  currentChar: string | null;
  stack: string[]; // 存入的是期望的右括号 ')' | ']' | '}'
  matchedPairs: number;
  isValid: boolean;
  action: 'init' | 'push_expected' | 'match_pop' | 'mismatch' | 'done';
  message: string;
  codeLine: number;
}

export function buildBracketSteps(rawInput: string): BracketStep[] {
  const steps: BracketStep[] = [];
  const s = rawInput.trim();
  const n = s.length;

  if (n === 0) {
    steps.push({
      rawString: '',
      currentIndex: -1,
      currentChar: null,
      stack: [],
      matchedPairs: 0,
      isValid: true,
      action: 'done',
      message: '输入为空字符串，判定为有效括号',
      codeLine: 10,
    });
    return steps;
  }

  if (n % 2 !== 0) {
    steps.push({
      rawString: s,
      currentIndex: 0,
      currentChar: s[0],
      stack: [],
      matchedPairs: 0,
      isValid: false,
      action: 'mismatch',
      message: `❌ 长度为 ${n}（奇数），不可能成对闭合，直接判定为无效 (False)`,
      codeLine: 2,
    });
    return steps;
  }

  const stack: string[] = [];
  let matchedPairs = 0;

  steps.push({
    rawString: s,
    currentIndex: -1,
    currentChar: null,
    stack: [],
    matchedPairs: 0,
    isValid: true,
    action: 'init',
    message: `初始化：字符串长度 ${n}（偶数），准备从左往右扫描，使用「遇左压右」单调匹配策略`,
    codeLine: 3,
  });

  for (let i = 0; i < n; i++) {
    const c = s[i];

    if (c === '(') {
      stack.push(')');
      steps.push({
        rawString: s,
        currentIndex: i,
        currentChar: c,
        stack: [...stack],
        matchedPairs,
        isValid: true,
        action: 'push_expected',
        message: `📥 遇到左圆括号 '('，将期望的右括号 ')' 压入栈顶`,
        codeLine: 6,
      });
    } else if (c === '[') {
      stack.push(']');
      steps.push({
        rawString: s,
        currentIndex: i,
        currentChar: c,
        stack: [...stack],
        matchedPairs,
        isValid: true,
        action: 'push_expected',
        message: `📥 遇到左方括号 '['，将期望的右括号 ']' 压入栈顶`,
        codeLine: 7,
      });
    } else if (c === '{') {
      stack.push('}');
      steps.push({
        rawString: s,
        currentIndex: i,
        currentChar: c,
        stack: [...stack],
        matchedPairs,
        isValid: true,
        action: 'push_expected',
        message: `📥 遇到左花括号 '{'，将期望的右括号 '}' 压入栈顶`,
        codeLine: 8,
      });
    } else {
      // 右括号
      if (stack.length === 0) {
        steps.push({
          rawString: s,
          currentIndex: i,
          currentChar: c,
          stack: [],
          matchedPairs,
          isValid: false,
          action: 'mismatch',
          message: `❌ 遇到右括号 '${c}'，但栈已空（右括号多余），匹配失败！`,
          codeLine: 9,
        });
        return steps;
      }

      const expected = stack.pop()!;
      if (expected !== c) {
        steps.push({
          rawString: s,
          currentIndex: i,
          currentChar: c,
          stack: [...stack],
          matchedPairs,
          isValid: false,
          action: 'mismatch',
          message: `❌ 遇到右括号 '${c}'，但栈顶期望的是 '${expected}'，类型不匹配！`,
          codeLine: 9,
        });
        return steps;
      }

      matchedPairs++;
      steps.push({
        rawString: s,
        currentIndex: i,
        currentChar: c,
        stack: [...stack],
        matchedPairs,
        isValid: true,
        action: 'match_pop',
        message: `✓ 成功闭合！当前字符 '${c}' 与栈顶期望 '${expected}' 完全吻合，弹出栈顶！已匹配 ${matchedPairs} 对`,
        codeLine: 9,
      });
    }
  }

  const finalValid = stack.length === 0;

  if (!finalValid) {
    steps.push({
      rawString: s,
      currentIndex: n - 1,
      currentChar: null,
      stack: [...stack],
      matchedPairs,
      isValid: false,
      action: 'mismatch',
      message: `❌ 遍历完毕，但栈内仍剩余 ${stack.length} 个未闭合的左括号 (期望 [${stack.join(', ')}])，判定为无效！`,
      codeLine: 11,
    });
  } else {
    steps.push({
      rawString: s,
      currentIndex: n - 1,
      currentChar: null,
      stack: [],
      matchedPairs,
      isValid: true,
      action: 'done',
      message: `🎉 全部字符扫描完毕且栈已清空！所有括号均已完美成对闭合，判定为有效 (True)`,
      codeLine: 11,
    });
  }

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class BracketVisualizer extends StepVisualizer<BracketStep> {
  protected codeLanguages = BRACKET_CODE_LANGUAGES;
  protected codeLines = BRACKET_CODE_LANGUAGES['java'];
  protected codePanelTitle = '有效的括号 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private sandboxContainer: HTMLElement | null = null;
  private charContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#bracket-sandbox-container');
    this.charContainer = this.root.querySelector('#bracket-char-container');
    this.decisionMonitorContainer = this.root.querySelector('#bracket-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#bracket-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 绑定播放控制
    this.bindPlaybackControls();

    // 绑定运行与重置
    this.root.querySelector('#btn-generate')?.addEventListener('click', () => this.start());
    this.root.querySelector('#btn-reset')?.addEventListener('click', () => this.reset());

    // 绑定 Scrubber 进度条
    const slider = this.root.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        if (!isNaN(val) && val >= 0 && val < this.steps.length) {
          this.goToStep(val);
        }
      });
    }

    // 绑定前进后退按钮
    this.root.querySelector('#btn-step-prev')?.addEventListener('click', () => this.prevStep());
    this.root.querySelector('#btn-step-next')?.addEventListener('click', () => this.nextStep());
    this.root.querySelector('#btn-play-pause')?.addEventListener('click', () => this.togglePlay());

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.bracket-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const strEl = this.root?.querySelector('#input-brackets') as HTMLInputElement | null;
        if (strEl && btn.dataset.val) strEl.value = btn.dataset.val;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: BRACKET_PROBLEM_HTML,
      analysisHtml: BRACKET_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): BracketStep[] {
    const strEl = this.root?.querySelector('#input-brackets') as HTMLInputElement | null;
    const rawInput = strEl?.value ?? '()[]{}';
    return buildBracketSteps(rawInput);
  }

  protected renderStep(step: BracketStep): void {
    const s = step.rawString;
    const stack = step.stack;
    const curIdx = step.currentIndex;
    const isDone = step.action === 'done';
    const isMismatch = step.action === 'mismatch';

    // 1. 渲染字符串流与期望括号栈沙盘 (Card 1)
    if (this.sandboxContainer) {
      const charsHtml = s
        .split('')
        .map((ch, idx) => {
          const isCurrent = idx === curIdx && !isDone;
          const isProcessed = idx < curIdx || (isDone && idx <= curIdx);

          let bg = '#ffffff';
          let border = '#e2e8f0';
          let textColor = '#0f172a';

          if (isCurrent) {
            if (isMismatch) {
              bg = '#fef2f2';
              border = '#ef4444';
              textColor = '#ef4444';
            } else {
              bg = '#ecfdf5';
              border = '#059669';
              textColor = '#059669';
            }
          } else if (isProcessed) {
            bg = '#f8fafc';
            border = '#cbd5e1';
            textColor = '#64748b';
          }

          return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
              <span style="font-size: 8.5px; color: ${isCurrent ? '#059669' : '#94a3b8'}; font-weight: 700;">
                [${idx}]
              </span>
              <div style="width: 36px; height: 36px; border-radius: 8px; background: ${bg}; border: 2px solid ${border}; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                ${ch}
              </div>
            </div>
          `;
        })
        .join('');

      // 栈内展示 (从栈底到栈顶)
      const stackItemsHtml = stack
        .map((expCh) => {
          return `
            <div style="padding: 2px 10px; border-radius: 6px; background: #fffbeb; border: 1.5px solid #fde68a; color: #b45309; font-size: 13px; font-weight: 800; font-family: 'JetBrains Mono', monospace;">
              ${expCh}
            </div>
          `;
        })
        .join('');

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <!-- 字符串序列 -->
          <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #475569;">
            <span>🔤 待匹配括号序列 (字符串流):</span>
            <span style="color: #059669;">已匹配: ${step.matchedPairs} 对</span>
          </div>
          <div style="display: flex; gap: 6px; overflow-x: auto; padding: 2px 0;">
            ${charsHtml}
          </div>

          <!-- 单调期望右括号栈 -->
          <div style="display: flex; align-items: center; gap: 8px; padding-top: 4px; border-top: 1px dashed #e2e8f0;">
            <span style="font-size: 10.5px; font-weight: 700; color: #475569; white-space: nowrap;">🥞 期望右括号栈 (栈底 &rarr; 栈顶):</span>
            <div style="display: flex; gap: 4px; overflow-x: auto; flex: 1; align-items: center; min-height: 28px;">
              ${stack.length > 0 ? stackItemsHtml : '<span style="font-size: 10.5px; color: #94a3b8;">栈空（全部已闭合）</span>'}
            </div>
          </div>
        </div>
      `;
    }

    // 2. 渲染当前字符与栈顶期望 (Card 2 Left)
    if (this.charContainer) {
      const topExpected = stack.length > 0 ? stack[stack.length - 1] : null;

      this.charContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>当前扫描字符:</span>
            <span style="font-family: monospace; font-weight:800; color: #059669; font-size: 13.5px;">
              ${step.currentChar !== null ? `'${step.currentChar}'` : '（结束）'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>栈顶期望闭合符:</span>
            <span style="font-family: monospace; font-weight:700; color: #d97706; font-size: 13.5px;">
              ${topExpected !== null ? `'${topExpected}'` : '（无）'}
            </span>
          </div>
        </div>
      `;
    }

    // 3. 渲染匹配有效性决策监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      const isPush = step.action === 'push_expected';
      const isPop = step.action === 'match_pop';

      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>匹配动作:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isMismatch ? '#fef2f2' : isPop ? '#ecfdf5' : isPush ? '#fffbeb' : '#f8fafc'}; color: ${isMismatch ? '#ef4444' : isPop ? '#059669' : isPush ? '#d97706' : '#64748b'}; border: 1px solid ${isMismatch ? '#fecaca' : isPop ? '#a7f3d0' : isPush ? '#fde68a' : '#e2e8f0'};">
              ${isMismatch ? '❌ 匹配失败 / 括号失配' : isPop ? '✓ 吻合出栈' : isPush ? '📥 压入对应右括号' : '🔍 准备就绪'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 策略: <code style="color:#059669; font-family:monospace;">遇到 '(' 压 ')', 遇到 '[' 压 ']', 遇到 '{' 压 '}'</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染最终结论看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>当前判定状态: <strong style="color: ${step.isValid ? '#059669' : '#ef4444'}; font-size: 13.5px;">${step.isValid ? '有效 (Valid)' : '无效 (Invalid)'}</strong></span>
            <span style="font-family: monospace; font-weight: 700; color: #059669;">成功闭合 ${step.matchedPairs} 对括号</span>
          </div>
        </div>
      `;
    }

    const badgeStatus = this.root?.querySelector('#badge-valid-status') as HTMLElement | null;
    if (badgeStatus) {
      badgeStatus.textContent = step.isValid ? (isDone ? '判定有效 (True)' : '匹配正常') : '判定无效 (False)';
      badgeStatus.style.color = step.isValid ? '#059669' : '#ef4444';
      badgeStatus.style.background = step.isValid ? '#ecfdf5' : '#fef2f2';
      badgeStatus.style.borderColor = step.isValid ? '#a7f3d0' : '#fecaca';
    }

    // 5. 更新 Scrubber 进度条
    const slider = this.root?.querySelector('#slider-progress') as HTMLInputElement | null;
    const stepCur = this.root?.querySelector('#step-cur') as HTMLElement | null;
    const stepTotal = this.root?.querySelector('#step-total') as HTMLElement | null;
    const playIcon = this.root?.querySelector('#play-icon') as HTMLElement | null;

    if (slider) {
      slider.max = String(Math.max(0, this.steps.length - 1));
      slider.value = String(this.currentIndex);
    }
    if (stepCur) stepCur.textContent = String(this.currentIndex + 1);
    if (stepTotal) stepTotal.textContent = String(this.steps.length);
    if (playIcon) {
      playIcon.className = this.isPlaying ? 'fa-solid fa-pause text-[12px]' : 'fa-solid fa-play text-[12px]';
    }

    // 6. 暗色终端代码行高亮
    this.terminalInstance?.highlightLine(step.codeLine);

    // 7. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '扫描';

        if (st.action === 'push_expected') {
          badgeColor = '#d97706';
          badgeBg = '#fffbeb';
          badgeText = '压栈';
        } else if (st.action === 'match_pop') {
          badgeColor = '#059669';
          badgeBg = '#ecfdf5';
          badgeText = '闭合';
        } else if (st.action === 'mismatch') {
          badgeColor = '#ef4444';
          badgeBg = '#fef2f2';
          badgeText = '失配';
        } else if (st.action === 'done') {
          badgeColor = '#10b981';
          badgeBg = '#ecfdf5';
          badgeText = '完成';
        }

        return `
          <div style="display: flex; align-items: flex-start; gap: 6px; padding: 3px 0; border-bottom: 1px solid #f8fafc; font-size: 11px;">
            <span style="color: #94a3b8; font-family: monospace; font-size: 10px; min-width: 24px;">#${idx + 1}</span>
            <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 1px 5px; border-radius: 4px; font-weight: 700; font-size: 10px;">${badgeText}</span>
            <span style="color: #334155; flex: 1;">${st.message}</span>
          </div>
        `;
      });

      this.logContainer.innerHTML = logs.join('');
      this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }
    if (this.logCountEl) {
      this.logCountEl.textContent = `${this.currentIndex + 1} / ${this.steps.length} 记录`;
    }
  }

  public reset(): void {
    super.reset();
    if (this.sandboxContainer) this.sandboxContainer.innerHTML = '';
  }
}

registerAlgorithm({
  id: 'bracket',
  name: '有效的括号',
  viewId: 'algo-bracket-view',
  category: 'stack',
  description: '遇左括号压入对应右括号，遇右括号只需 O(1) 比对并弹出栈顶元素',
  icon: '🎯',
  template,
  Visualizer: BracketVisualizer,
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握经典栈匹配思想与“遇左压右”简化比对逻辑的巧妙设计技巧',
});
