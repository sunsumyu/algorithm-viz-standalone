/**
 * 代码行渲染器 (CodeLineRenderer) — 职责单一深模块
 *
 * 从 DarkCodeTerminalPresenter.mount 中提取的纯代码行关注点：
 *   - 语法高亮渲染（renderCodeLines）
 *   - 多态行高亮（highlightLine / markLine / markContext）
 *   - 行末内联调试提示（updateInlineHint）
 *   - 字号缩放（updateFontSize）
 *   - 剪贴板复制（copyCode）
 */

import type { StepVar } from '../../interfaces';
import { highlightTokens, escapeHtml } from '../../code-highlighter';
import { VariableContextResolver, type ResolvedVariable } from '../../variable-context-resolver';
import { CodePresentationModel } from '../../code-presentation-model';
import type { HighlightTarget } from '../dark-code-terminal-presenter';
import { DarkCodeTerminalPresenter } from '../dark-code-terminal-presenter';

export interface CodeLineRendererDeps {
  codeWrapper: HTMLElement | null;
  codeModel: CodePresentationModel;
  fontIndicator: HTMLElement | null;
  btnCopy: HTMLElement | null;
  createEl: (tag: string, id?: string) => any;
}

export interface CodeLineRendererState {
  currentLang: string;
  codeFontSize: number;
  activeLineTarget: HighlightTarget | null | undefined;
  currentVarsMap: Map<string, ResolvedVariable>;
}

/**
 * 渲染代码行到 codeWrapper，支持语法高亮与 Mock DOM 环境
 */
export function renderCodeLines(
  deps: CodeLineRendererDeps,
  state: CodeLineRendererState,
  highlightFn: (target: HighlightTarget | null | undefined) => void,
): void {
  const { codeWrapper, codeModel, createEl } = deps;
  if (!codeWrapper) return;
  const lines = codeModel.getLines(state.currentLang);
  const linesHtml = lines
    .map((line, idx) => {
      const lineNum = idx + 1;
      const highlightedCode = highlightTokens(line, state.currentLang);
      return `
        <div class="code-line algo-code-line" data-line="${lineNum}" data-raw="${escapeHtml(line)}" style="font-size: ${state.codeFontSize}px; padding: 1px 6px; border-radius: 4px; display: flex; align-items: flex-start; gap: 12px; white-space: pre; border-left: 3px solid transparent; transition: background-color 0.15s ease, border-color 0.15s ease;">
          <span class="code-line-num algo-code-line-number" style="color: #475569; font-size: 10.5px; min-width: 20px; text-align: right; user-select: none;">${lineNum}</span>
          <span class="code-line-text algo-code-line-text">${highlightedCode}</span>
        </div>
      `;
    })
    .join('');

  codeWrapper.innerHTML = linesHtml;

  // Mock DOM 环境兼容（children 为普通 Array 时重构子节点）
  if (Array.isArray((codeWrapper as any).children)) {
    (codeWrapper as any).children = [];
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const lineEl = createEl('div');
      lineEl.className = 'code-line algo-code-line';
      lineEl.dataset.line = String(lineNum);
      lineEl.dataset.raw = line;
      lineEl.style.fontSize = `${state.codeFontSize}px`;
      lineEl.style.padding = '1px 6px';
      lineEl.style.borderRadius = '4px';
      lineEl.style.display = 'flex';
      lineEl.style.alignItems = 'flex-start';
      lineEl.style.gap = '12px';
      lineEl.style.whiteSpace = 'pre';
      lineEl.style.borderLeft = '3px solid transparent';

      const numEl = createEl('span');
      numEl.className = 'code-line-num algo-code-line-number';
      numEl.textContent = String(lineNum);
      lineEl.appendChild(numEl);

      const textEl = createEl('span');
      textEl.className = 'code-line-text algo-code-line-text';
      textEl.innerHTML = highlightTokens(line, state.currentLang);
      textEl.textContent = line;
      lineEl.appendChild(textEl);

      if (typeof codeWrapper.appendChild === 'function') {
        codeWrapper.appendChild(lineEl);
      } else {
        (codeWrapper as any).children.push(lineEl);
      }
    });
  }

  if (state.activeLineTarget != null) {
    highlightFn(state.activeLineTarget);
  }
}

/**
 * 更新行末内联调试提示（基于 VariableContextResolver）
 */
export function updateInlineHint(
  activeLineEl: HTMLElement | null,
  deps: CodeLineRendererDeps,
  state: CodeLineRendererState,
): void {
  const { codeWrapper, createEl } = deps;
  if (!codeWrapper) return;
  codeWrapper.querySelectorAll?.('.algo-code-inline-hint')?.forEach((el: any) => {
    if (typeof el.remove === 'function') el.remove();
    else if (el.parentElement) el.parentElement.removeChild(el);
  });

  if (!activeLineEl || state.currentVarsMap.size === 0) return;
  const rawLine = activeLineEl.dataset?.raw || activeLineEl.getAttribute?.('data-raw') || '';
  if (!rawLine) return;

  const hintSummary = VariableContextResolver.formatInlineSummary(state.currentVarsMap, rawLine);
  if (!hintSummary) return;

  const hintEl = createEl('span');
  hintEl.className = 'algo-code-inline-hint';
  hintEl.style.cssText =
    'color: #38bdf8; opacity: 0.85; font-style: italic; font-size: 10.5px; margin-left: 14px; user-select: none; font-weight: 500; display: inline-flex; align-items: center;';
  hintEl.textContent = hintSummary;

  const textEl = activeLineEl.querySelector?.('.algo-code-line-text') || activeLineEl;
  if (typeof textEl.appendChild === 'function') {
    textEl.appendChild(hintEl);
  }
}

/**
 * 高亮指定代码行（支持多态目标：数字、字符串、数组、区间、多语言字典）
 */
export function highlightLineInternal(
  target: HighlightTarget | null | undefined,
  deps: CodeLineRendererDeps,
  state: CodeLineRendererState,
): void {
  state.activeLineTarget = target;
  const { codeWrapper, codeModel, createEl } = deps;
  if (!codeWrapper) return;

  codeWrapper.querySelectorAll<HTMLElement>('.code-line').forEach((el) => {
    el.classList.remove('active', 'active-line', 'is-active', 'is-context');
    el.style.backgroundColor = 'transparent';
    el.style.borderLeftColor = 'transparent';
    el.style.color = '#cbd5e1';
    el.style.fontWeight = 'normal';
  });

  codeWrapper.querySelectorAll?.('.algo-code-inline-hint')?.forEach((el: any) => {
    if (typeof el.remove === 'function') el.remove();
    else if (el.parentElement) el.parentElement.removeChild(el);
  });

  if (target == null) return;

  const markLine = (lineEl: HTMLElement | null) => {
    if (!lineEl) return;
    lineEl.classList.add('active', 'active-line', 'is-active');
    lineEl.style.backgroundColor = 'rgba(37, 99, 235, 0.25)';
    lineEl.style.borderLeftColor = '#2563eb';
    lineEl.style.color = '#ffffff';
    lineEl.style.fontWeight = '700';
    updateInlineHint(lineEl, deps, state);
  };

  const markContext = (lineEl: HTMLElement | null) => {
    if (!lineEl) return;
    lineEl.classList.add('is-context');
    lineEl.style.backgroundColor = 'rgba(51, 65, 85, 0.25)';
    lineEl.style.borderLeftColor = '#64748b';
  };

  const applyTarget = (t: HighlightTarget | null | undefined) => {
    if (t == null) return;
    if (typeof t === 'number') {
      const lineEl = codeWrapper.querySelector(`[data-line="${t}"]`) as HTMLElement | null;
      if (lineEl) {
        markLine(lineEl);
        if (typeof lineEl.scrollIntoView === 'function') {
          lineEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    } else if (typeof t === 'string') {
      const num = parseInt(t, 10);
      if (!isNaN(num)) {
        const lineEl = codeWrapper.querySelector(`[data-line="${num}"]`) as HTMLElement | null;
        if (lineEl) {
          markLine(lineEl);
          if (typeof lineEl.scrollIntoView === 'function') {
            lineEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        }
      } else {
        const anchorLine = codeModel.resolveAnchorLine(t, state.currentLang);
        if (anchorLine != null) {
          applyTarget(anchorLine);
        }
      }
    } else if (Array.isArray(t)) {
      t.forEach((l) => {
        const lineEl = codeWrapper.querySelector(`[data-line="${l}"]`) as HTMLElement | null;
        markLine(lineEl);
      });
      if (t.length > 0) {
        const firstEl = codeWrapper.querySelector(`[data-line="${t[0]}"]`) as HTMLElement | null;
        if (firstEl && typeof firstEl.scrollIntoView === 'function') {
          firstEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    } else if (typeof t === 'object') {
      if ('anchor' in t && typeof (t as any).anchor === 'string') {
        const anchorLine = codeModel.resolveAnchorLine((t as any).anchor, state.currentLang);
        if (anchorLine != null) {
          applyTarget(anchorLine);
        }
      } else if ('from' in t && 'to' in t && typeof t.from === 'number' && typeof t.to === 'number') {
        for (let l = t.from; l <= t.to; l++) {
          const lineEl = codeWrapper.querySelector(`[data-line="${l}"]`) as HTMLElement | null;
          markLine(lineEl);
        }
        const firstEl = codeWrapper.querySelector(`[data-line="${t.from}"]`) as HTMLElement | null;
        if (firstEl && typeof firstEl.scrollIntoView === 'function') {
          firstEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      } else if ('primary' in t) {
        const p = (t as any).primary;
        const c = (t as any).context;
        if (p != null) applyTarget(p);
        if (c != null) {
          const ctxList = Array.isArray(c) ? c : [c];
          ctxList.forEach((cl) => {
            const clEl = codeWrapper.querySelector(`[data-line="${cl}"]`) as HTMLElement | null;
            markContext(clEl);
          });
        }
      } else {
        const dict = t as Record<string, any>;
        let resolved = dict[state.currentLang];
        if (resolved == null && (state.currentLang === 'js' || state.currentLang === 'javascript')) {
          resolved = dict['javascript'] ?? dict['js'];
        }
        if (resolved == null && (state.currentLang === 'python' || state.currentLang === 'py')) {
          resolved = dict['python'] ?? dict['py'];
        }
        if (resolved == null && state.currentLang.includes('cpp')) {
          resolved = dict['cpp'] ?? dict['c++'];
        }
        if (resolved == null) {
          resolved = dict['java'] ?? Object.values(dict)[0];
        }
        if (resolved != null) {
          applyTarget(resolved);
        }
      }
    }
  };

  applyTarget(target);
}

/**
 * 调整字号并重新渲染
 */
export function updateFontSize(
  delta: number,
  deps: CodeLineRendererDeps,
  state: CodeLineRendererState,
  highlightFn: (target: HighlightTarget | null | undefined) => void,
): void {
  state.codeFontSize = Math.max(9, Math.min(20, state.codeFontSize + delta));
  if (deps.fontIndicator) deps.fontIndicator.textContent = String(state.codeFontSize);
  renderCodeLines(deps, state, highlightFn);
}

/**
 * 复制当前语言代码到剪贴板
 */
export async function copyCode(
  deps: CodeLineRendererDeps,
  state: CodeLineRendererState,
): Promise<boolean> {
  const { codeModel, btnCopy } = deps;
  const lines = codeModel.getLines(state.currentLang);
  const fullText = lines.join('\n');
  let success = false;

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(fullText);
      success = true;
    } else if (typeof document !== 'undefined') {
      const ta = document.createElement('textarea');
      ta.value = fullText;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      success = document.execCommand('copy');
      document.body.removeChild(ta);
    }
  } catch (e) {
    console.warn('[DarkCodeTerminalPresenter] Clipboard write failed, falling back to execCommand:', e);
    try {
      if (typeof document !== 'undefined') {
        const ta = document.createElement('textarea');
        ta.value = fullText;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        success = document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch {}
  }

  if (btnCopy) {
    const copyText = btnCopy.querySelector('.copy-text') || btnCopy;
    const copyIcon = btnCopy.querySelector('.copy-icon');

    btnCopy.classList.add('copied');
    btnCopy.style.borderColor = 'rgba(52, 211, 153, 0.5)';
    btnCopy.style.color = '#34d399';
    btnCopy.style.background = 'rgba(6, 78, 59, 0.4)';
    if (copyText) copyText.textContent = '已复制';
    if (copyIcon) {
      copyIcon.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    }

    const targetBtn = btnCopy;
    setTimeout(() => {
      targetBtn.classList.remove('copied');
      targetBtn.style.borderColor = '#334155';
      targetBtn.style.color = '#94a3b8';
      targetBtn.style.background = '#0f172a';
      if (copyText) copyText.textContent = '复制';
      if (copyIcon) {
        copyIcon.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
      }
    }, 1800);
  }

  return success;
}
