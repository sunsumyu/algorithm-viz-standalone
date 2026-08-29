/**
 * 删除字符串中的所有相邻重复项可视化器 — 4-Card 标准现代架构
 * LeetCode 1047：栈顶即当前前驱，遇到相同字符直接出栈消除，形成自然连锁反应
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  REMOVE_ADJACENT_DUPLICATES_PROBLEM_HTML,
  REMOVE_ADJACENT_DUPLICATES_ANALYSIS_HTML,
  REMOVE_ADJACENT_DUPLICATES_CODE_LANGUAGES,
} from './remove-adjacent-duplicates-problem-content';
import template from './remove-adjacent-duplicates.html?raw';

export interface RADStep {
  rawString: string;
  currentIndex: number;
  currentChar: string | null;
  stack: string[];
  eliminatedPairs: number;
  eliminatedChar: string | null;
  currentString: string;
  action: 'init' | 'scan' | 'eliminate' | 'push' | 'done';
  message: string;
  codeLine: number;
}

export function buildRemoveAdjacentDuplicatesSteps(rawInput: string): RADStep[] {
  const steps: RADStep[] = [];
  const s = rawInput.trim();
  const n = s.length;

  if (n === 0) {
    steps.push({
      rawString: '',
      currentIndex: -1,
      currentChar: null,
      stack: [],
      eliminatedPairs: 0,
      eliminatedChar: null,
      currentString: '',
      action: 'done',
      message: '输入为空字符串，化简结果为空',
      codeLine: 8,
    });
    return steps;
  }

  const stack: string[] = [];
  let eliminatedPairs = 0;

  steps.push({
    rawString: s,
    currentIndex: -1,
    currentChar: null,
    stack: [],
    eliminatedPairs: 0,
    eliminatedChar: null,
    currentString: '',
    action: 'init',
    message: `初始化：输入字符串 "${s}" (长度 ${n})，准备从左向右扫描，利用栈顶作为相邻前驱对消重复项`,
    codeLine: 2,
  });

  for (let i = 0; i < n; i++) {
    const ch = s[i];

    if (stack.length > 0 && stack[stack.length - 1] === ch) {
      const popped = stack.pop()!;
      eliminatedPairs++;

      steps.push({
        rawString: s,
        currentIndex: i,
        currentChar: ch,
        stack: [...stack],
        eliminatedPairs,
        eliminatedChar: ch,
        currentString: stack.join(''),
        action: 'eliminate',
        message: `💥 触发相邻对消！当前字符 '${ch}' 与栈顶 '${popped}' 相同，双双抵消！已消除 ${eliminatedPairs} 对，当前结果: "${stack.join('')}"`,
        codeLine: 4,
      });
    } else {
      stack.push(ch);

      steps.push({
        rawString: s,
        currentIndex: i,
        currentChar: ch,
        stack: [...stack],
        eliminatedPairs,
        eliminatedChar: null,
        currentString: stack.join(''),
        action: 'push',
        message: `📥 字符 '${ch}' 与栈顶不重复，压入栈顶暂存。当前栈: "${stack.join('')}"`,
        codeLine: 6,
      });
    }
  }

  const finalString = stack.join('');

  steps.push({
    rawString: s,
    currentIndex: n - 1,
    currentChar: null,
    stack: [...stack],
    eliminatedPairs,
    eliminatedChar: null,
    currentString: finalString,
    action: 'done',
    message: `🎉 扫描化简完成！共消除 ${eliminatedPairs} 对相邻重复字符，最终剩余字符串为 "${finalString || '(空字符串)'}"`,
    codeLine: 8,
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class RemoveAdjacentDuplicatesVisualizer extends StepVisualizer<RADStep> {
  protected codeLanguages = REMOVE_ADJACENT_DUPLICATES_CODE_LANGUAGES;
  protected codeLines = REMOVE_ADJACENT_DUPLICATES_CODE_LANGUAGES['java'];
  protected codePanelTitle = '删除相邻重复项 代码调试';

  private sandboxContainer: HTMLElement | null = null;
  private charContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#rad-sandbox-container');
    this.charContainer = this.root.querySelector('#rad-char-container');
    this.decisionMonitorContainer = this.root.querySelector('#rad-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#rad-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.rad-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const strEl = this.root?.querySelector('#input-str') as HTMLInputElement | null;
        if (strEl && btn.dataset.val) strEl.value = btn.dataset.val;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: REMOVE_ADJACENT_DUPLICATES_PROBLEM_HTML,
      analysisHtml: REMOVE_ADJACENT_DUPLICATES_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): RADStep[] {
    const strEl = this.root?.querySelector('#input-str') as HTMLInputElement | null;
    const rawInput = strEl?.value ?? 'abbaca';
    return buildRemoveAdjacentDuplicatesSteps(rawInput);
  }

  protected renderStep(step: RADStep): void {
    const s = step.rawString;
    const stack = step.stack;
    const curIdx = step.currentIndex;
    const isDone = step.action === 'done';
    const isEliminate = step.action === 'eliminate';

    // 1. 渲染字符流与对消栈沙盘 (Card 1)
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
            if (isEliminate) {
              bg = '#fef2f2';
              border = '#ef4444';
              textColor = '#ef4444';
            } else {
              bg = '#faf5ff';
              border = '#9333ea';
              textColor = '#9333ea';
            }
          } else if (isProcessed) {
            bg = '#f8fafc';
            border = '#cbd5e1';
            textColor = '#64748b';
          }

          return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
              <span style="font-size: 8.5px; color: ${isCurrent ? '#9333ea' : '#94a3b8'}; font-weight: 700;">
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
        .map((ch) => {
          return `
            <div style="padding: 2px 10px; border-radius: 6px; background: #faf5ff; border: 1.5px solid #d8b4fe; color: #7e22ce; font-size: 13px; font-weight: 800; font-family: 'JetBrains Mono', monospace;">
              ${ch}
            </div>
          `;
        })
        .join('');

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <!-- 字符串序列 -->
          <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #475569;">
            <span>🔤 扫描字符流 (原始字符串):</span>
            <span style="color: #9333ea;">当前保留: "${step.currentString || '(空)'}"</span>
          </div>
          <div style="display: flex; gap: 6px; overflow-x: auto; padding: 2px 0;">
            ${charsHtml}
          </div>

          <!-- 单调消除栈 -->
          <div style="display: flex; align-items: center; gap: 8px; padding-top: 4px; border-top: 1px dashed #e2e8f0;">
            <span style="font-size: 10.5px; font-weight: 700; color: #475569; white-space: nowrap;">🥞 栈内保留字符 (栈底 &rarr; 栈顶):</span>
            <div style="display: flex; gap: 4px; overflow-x: auto; flex: 1; align-items: center; min-height: 28px;">
              ${stack.length > 0 ? stackItemsHtml : '<span style="font-size: 10.5px; color: #94a3b8;">栈空</span>'}
            </div>
          </div>
        </div>
      `;
    }

    // 2. 渲染当前字符与栈顶字符 (Card 2 Left)
    if (this.charContainer) {
      const topCh = stack.length > 0 ? stack[stack.length - 1] : null;

      this.charContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>当前扫描字符:</span>
            <span style="font-family: monospace; font-weight:800; color: #9333ea; font-size: 13.5px;">
              ${step.currentChar !== null ? `'${step.currentChar}'` : '（结束）'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>当前栈顶前驱:</span>
            <span style="font-family: monospace; font-weight:700; color: #d97706; font-size: 13.5px;">
              ${topCh !== null ? `'${topCh}'` : '（栈空）'}
            </span>
          </div>
        </div>
      `;
    }

    // 3. 渲染对消决策监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      const isPush = step.action === 'push';

      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>操作状态:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isEliminate ? '#fef2f2' : isPush ? '#faf5ff' : '#f8fafc'}; color: ${isEliminate ? '#ef4444' : isPush ? '#9333ea' : '#64748b'}; border: 1px solid ${isEliminate ? '#fecaca' : isPush ? '#e9d5ff' : '#e2e8f0'};">
              ${isEliminate ? `💥 相邻字符 '${step.eliminatedChar}' 相同对消！` : isPush ? '📥 字符不同，压入栈顶暂存' : '🔍 准备就绪'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 准则: <code style="color:#9333ea; font-family:monospace;">ch === stack.top() ? stack.pop() : stack.push(ch)</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染最终化简字符串看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>化简结果: <strong style="color: #9333ea; font-family: monospace; font-size: 13.5px;">"${step.currentString || '(空)'}"</strong></span>
            <span style="font-family: monospace; font-weight: 700; color: #059669;">已成功对消 ${step.eliminatedPairs} 对</span>
          </div>
        </div>
      `;
    }

    const badgeCount = this.root?.querySelector('#badge-eliminated-count');
    if (badgeCount) {
      badgeCount.textContent = `已对消: ${step.eliminatedPairs} 对`;
    }

    // 5. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '扫描';

        if (st.action === 'eliminate') {
          badgeColor = '#ef4444';
          badgeBg = '#fef2f2';
          badgeText = '对消';
        } else if (st.action === 'push') {
          badgeColor = '#9333ea';
          badgeBg = '#faf5ff';
          badgeText = '入栈';
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
  id: 'remove-adjacent-duplicates',
  name: '删除相邻重复项',
  viewId: 'algo-remove-adjacent-duplicates-view',
  category: 'stack',
  description: '栈消消乐模型：栈顶即当前前驱，遇到相同字符直接出栈对消，形成连锁反应',
  icon: '✨',
  template,
  Visualizer: RemoveAdjacentDuplicatesVisualizer,
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '理解栈在消除相邻元素中的经典应用，掌握利用栈顶作为动态前驱消除递归连锁重复项的设计范式',
});
