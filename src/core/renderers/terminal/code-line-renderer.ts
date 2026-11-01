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
import { ReturnStepDecorator } from '../../return-step-decorator';
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
  lastStepContext?: any;
}

const NON_CALL_KEYWORDS = new Set([
  'if', 'else', 'elif', 'while', 'for', 'switch', 'catch', 'return', 'sizeof', 'typeof', 'new', 'delete',
]);

/**
 * 从单行源码中提取所有真实函数调用表达式（自动跳过 if / while / for 等控制流关键字括号）
 * 例如：
 *   - "if (!isValidBST(root.left)) {" -> ["isValidBST(root.left)"]
 *   - "if not self.isValidBST(root.left):" -> ["self.isValidBST(root.left)"]
 *   - "return check(node.left, min, node.val) && check(node.right, node.val, max);"
 *     -> ["check(node.left, min, node.val)", "check(node.right, node.val, max)"]
 */
export function extractFunctionCallsFromLine(rawLine: string): string[] {
  const calls: string[] = [];
  if (!rawLine) return calls;

  const callHeaderRegex = /(?:(?:self|this)\s*(?:\.|->)\s*)?([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g;
  let match: RegExpExecArray | null;

  while ((match = callHeaderRegex.exec(rawLine)) !== null) {
    const funcName = match[1];
    if (NON_CALL_KEYWORDS.has(funcName)) {
      continue;
    }
    const callStart = match.index;
    const openParenIdx = match.index + match[0].length - 1;
    let depth = 0;
    let i = openParenIdx;
    while (i < rawLine.length) {
      if (rawLine[i] === '(') depth++;
      else if (rawLine[i] === ')') {
        depth--;
        if (depth === 0) {
          calls.push(rawLine.slice(callStart, i + 1).trim());
          break;
        }
      }
      i++;
    }
  }

  return calls;
}

/**
 * 解析当前步在活跃代码行上的局部高亮块目标 (focusTarget)
 * 支持：
 *   1. 显式 stepContext.focusTarget (字符串或多语言字典)
 *   2. stepContext.focusMode === 'recursive-call'：自动提取并锁定该行内的递归函数调用表达式
 *   3. stepContext.focusMode === 'condition'：自动提取并锁定 if (...) 内的条件判别表达式
 */
export function resolveInlineFocusTarget(
  rawLine: string,
  lang: string,
  stepContext?: any
): string | undefined {
  if (!rawLine || !stepContext || typeof stepContext !== 'object') return undefined;

  const explicitTarget = stepContext.focusTarget ?? stepContext.inlineFocus;
  if (typeof explicitTarget === 'string' && explicitTarget.trim().length > 0) {
    if (explicitTarget === '@recursive-call') {
      // 转入下方自动提取递归调用
    } else if (rawLine.includes(explicitTarget.trim())) {
      return explicitTarget.trim();
    }
  } else if (explicitTarget && typeof explicitTarget === 'object') {
    const langTarget =
      explicitTarget[lang] ??
      (lang === 'js' ? explicitTarget.javascript : undefined) ??
      (lang === 'javascript' ? explicitTarget.js : undefined) ??
      explicitTarget.java;
    if (typeof langTarget === 'string' && rawLine.includes(langTarget.trim())) {
      return langTarget.trim();
    }
  }

  const focusMode = stepContext.focusMode || (explicitTarget === '@recursive-call' ? 'recursive-call' : undefined);
  if (focusMode === 'recursive-call') {
    const calls = extractFunctionCallsFromLine(rawLine);
    if (calls.length === 1) {
      return calls[0];
    }
    if (calls.length > 1) {
      const hintText = `${stepContext.branch || ''} ${stepContext.action || ''} ${stepContext.decision || ''}`.toLowerCase();
      if (hintText.includes('right') || hintText.includes('右')) {
        const rightCall = calls.find((c) => c.toLowerCase().includes('right'));
        if (rightCall) return rightCall;
        return calls[calls.length - 1];
      }
      if (hintText.includes('left') || hintText.includes('左')) {
        const leftCall = calls.find((c) => c.toLowerCase().includes('left'));
        if (leftCall) return leftCall;
        return calls[0];
      }
      return calls[0];
    }
  }

  if (focusMode === 'condition') {
    // 提取 if (...) 或 if ...: 的条件主体
    const pyIfMatch = rawLine.match(/^\s*if\s+(.+):\s*$/);
    if (pyIfMatch) {
      return pyIfMatch[1].trim();
    }
    const cIfMatch = rawLine.match(/\bif\s*\(/);
    if (cIfMatch && cIfMatch.index !== undefined) {
      const openIdx = cIfMatch.index + cIfMatch[0].length - 1;
      let depth = 0;
      for (let i = openIdx; i < rawLine.length; i++) {
        if (rawLine[i] === '(') depth++;
        else if (rawLine[i] === ')') {
          depth--;
          if (depth === 0) {
            return rawLine.slice(openIdx + 1, i).trim();
          }
        }
      }
    }
  }

  return undefined;
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
  stepContext?: any
): void {
  const { codeWrapper, createEl } = deps;
  if (!codeWrapper) return;
  if (stepContext !== undefined) {
    state.lastStepContext = stepContext;
  }
  const effectiveStep = stepContext !== undefined ? stepContext : state.lastStepContext;

  codeWrapper.querySelectorAll?.('.algo-code-inline-hint')?.forEach((el: any) => {
    if (typeof el.remove === 'function') el.remove();
    else if (el.parentElement) el.parentElement.removeChild(el);
  });

  if (!activeLineEl) return;
  const rawLine = activeLineEl.dataset?.raw || activeLineEl.getAttribute?.('data-raw') || '';
  if (!rawLine) return;

  const textEl = (activeLineEl.querySelector?.('.algo-code-line-text') || activeLineEl) as HTMLElement;
  const focusTarget = resolveInlineFocusTarget(rawLine, state.currentLang, effectiveStep);
  if (textEl && textEl !== activeLineEl) {
    const hadFocus = Boolean(textEl.querySelector?.('.inline-token-focus')) || String(textEl.innerHTML || '').includes('inline-token-focus');
    if (focusTarget || hadFocus) {
      textEl.innerHTML = highlightTokens(rawLine, state.currentLang, focusTarget);
    }
  }

  if (state.currentVarsMap.size === 0) return;

  const hintSummary = VariableContextResolver.formatInlineSummary(state.currentVarsMap, rawLine, effectiveStep);
  if (!hintSummary) return;

  const hintEl = createEl('span');
  hintEl.className = 'algo-code-inline-hint';
  hintEl.style.cssText =
    'color: #38bdf8; opacity: 0.85; font-style: italic; font-size: 10.5px; margin-left: 14px; user-select: none; font-weight: 500; display: inline-flex; align-items: center;';
  hintEl.textContent = hintSummary;

  if (typeof textEl.appendChild === 'function') {
    textEl.appendChild(hintEl);
  }
}

/**
 * 高亮指定代码行（支持多态目标：数字、字符串、数组、区间、多语言字典）
 * 当 stepContext 为返回帧（ReturnStepDecorator 判定）时，活跃行升级为紫色 return-line 并挂载 ↩ 返回徽章。
 */
export function highlightLineInternal(
  target: HighlightTarget | null | undefined,
  deps: CodeLineRendererDeps,
  state: CodeLineRendererState,
  stepContext?: unknown,
): void {
  state.activeLineTarget = target;
  if (stepContext !== undefined) {
    state.lastStepContext = stepContext;
  }
  const isReturn = ReturnStepDecorator.isReturnStep(state.lastStepContext);
  const { codeWrapper, codeModel, createEl } = deps;
  if (!codeWrapper) return;

  // 跨步残留防护：先清除上一帧的全部返回徽章与 return-line 标记
  ReturnStepDecorator.clearReturnBadges(codeWrapper);

  codeWrapper.querySelectorAll<HTMLElement>('.code-line').forEach((el) => {
    el.classList.remove('active', 'active-line', 'is-active', 'is-context');
    el.style.backgroundColor = 'transparent';
    el.style.borderLeftColor = 'transparent';
    el.style.color = '#cbd5e1';
    el.style.fontWeight = 'normal';
    const tEl = el.querySelector?.('.algo-code-line-text') as HTMLElement | null;
    if (tEl && (tEl.querySelector?.('.inline-token-focus') || String(tEl.innerHTML || '').includes('inline-token-focus'))) {
      const rLine = el.dataset?.raw || el.getAttribute?.('data-raw') || '';
      if (rLine) {
        tEl.innerHTML = highlightTokens(rLine, state.currentLang);
      }
    }
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
    // 返回帧升级：紫色 return-line（CSS !important 覆盖蓝色底）+ 行首 ↩ 徽章
    if (isReturn) {
      lineEl.classList.add('return-line');
      ReturnStepDecorator.applyReturnBadge(lineEl);
    }
    updateInlineHint(lineEl, deps, state);
  };

  const markContext = (lineEl: HTMLElement | null) => {
    if (!lineEl) return;
    lineEl.classList.add('is-context');
    lineEl.style.backgroundColor = 'rgba(51, 65, 85, 0.25)';
    lineEl.style.borderLeftColor = '#64748b';
  };

  const scrollLineIntoVisibleArea = (lineEl: HTMLElement | null) => {
    if (!lineEl) return;
    const container = (lineEl.closest?.('.terminal-body') || lineEl.parentElement?.parentElement) as HTMLElement | null;
    if (container && typeof container.scrollTo === 'function' && container.clientHeight > 0) {
      let lineTop = lineEl.offsetTop;
      let lineHeight = lineEl.offsetHeight || 22;
      const currentScrollTop = container.scrollTop;
      const viewHeight = container.clientHeight;

      if (typeof lineEl.getBoundingClientRect === 'function' && typeof container.getBoundingClientRect === 'function') {
        const lineRect = lineEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        if (containerRect.height > 0) {
          lineTop = lineRect.top - containerRect.top + currentScrollTop;
          lineHeight = lineRect.height || lineHeight;
        }
      }

      // 上下各保留 20% (至少 35px, 至多 80px) 安全可视缓冲区，确保高亮行始终稳固处于视口舒适区
      const padding = Math.min(80, Math.max(35, Math.floor(viewHeight * 0.2)));
      if (lineTop < currentScrollTop + padding) {
        container.scrollTo({
          top: Math.max(0, lineTop - padding),
          behavior: 'smooth',
        });
      } else if (lineTop + lineHeight > currentScrollTop + viewHeight - padding) {
        container.scrollTo({
          top: lineTop + lineHeight - viewHeight + padding,
          behavior: 'smooth',
        });
      }
    } else if (typeof lineEl.scrollIntoView === 'function') {
      lineEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  };

  const applyTarget = (t: HighlightTarget | null | undefined) => {
    if (t == null) return;
    if (typeof t === 'number') {
      const lineEl = codeWrapper.querySelector(`[data-line="${t}"]`) as HTMLElement | null;
      if (lineEl) {
        markLine(lineEl);
        scrollLineIntoVisibleArea(lineEl);
      }
    } else if (typeof t === 'string') {
      const num = parseInt(t, 10);
      if (!isNaN(num)) {
        const lineEl = codeWrapper.querySelector(`[data-line="${num}"]`) as HTMLElement | null;
        if (lineEl) {
          markLine(lineEl);
          scrollLineIntoVisibleArea(lineEl);
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
        if (firstEl) {
          scrollLineIntoVisibleArea(firstEl);
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
        if (firstEl) {
          scrollLineIntoVisibleArea(firstEl);
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
