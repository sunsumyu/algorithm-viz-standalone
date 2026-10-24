/**
 * 变量悬停调试气泡管理器 (HoverTooltipManager) — 职责单一深模块
 *
 * 从 DarkCodeTerminalPresenter.mount 中提取的变量悬停提示关注点：
 *   - 全局单例 tooltip DOM 创建与复用
 *   - 鼠标悬停事件防抖与变量解析
 *   - 气泡定位与隐藏
 */

import { escapeHtml } from '../../code-highlighter';
import { VariableContextResolver, type ResolvedVariable } from '../../variable-context-resolver';
import { LoopIndexReconciler } from '../../loop-index-reconciler';

export interface HoverTooltipDeps {
  codeWrapper: HTMLElement | null;
  createEl: (tag: string, id?: string) => any;
}

export interface HoverTooltipState {
  currentVarsMap: Map<string, ResolvedVariable>;
  currentLang: string;
  currentStep?: unknown;
}

export interface HoverTooltipHandle {
  /** 绑定鼠标事件到 codeWrapper */
  bind(): void;
  /** 解绑所有事件并清理 */
  destroy(): void;
}

/**
 * 提取括号下标子串（支持 [k][1], [i - 1][j - arr[k][0]], [mid] 等）
 */
export function extractMatchingBrackets(str: string, maxPairs = 2): string | null {
  if (!str) return null;
  let idx = 0;
  while (idx < str.length && /\s/.test(str[idx])) idx++;
  if (str[idx] !== '[') return null;

  let result = '';
  let pairsFound = 0;

  while (idx < str.length && pairsFound < maxPairs) {
    if (str[idx] !== '[') break;
    let depth = 0;
    const start = idx;
    while (idx < str.length) {
      if (str[idx] === '[') depth++;
      else if (str[idx] === ']') {
        depth--;
        if (depth === 0) {
          idx++;
          break;
        }
      }
      idx++;
    }
    if (depth !== 0) return null; // 未闭合括号
    result += str.slice(start, idx);
    pairsFound++;
    let peek = idx;
    while (peek < str.length && /\s/.test(str[peek])) peek++;
    if (peek < str.length && str[peek] === '[' && pairsFound < maxPairs) {
      idx = peek;
    }
  }

  return pairsFound > 0 ? result : null;
}

/**
 * 提取元素后面的纯文本（优先使用 Range，环境不支持时回退至 DOM 节点遍历）
 */
export function getTrailingText(target: HTMLElement, maxChars = 60): string {
  const lineTextEl = (target.closest?.('.code-line-text') || target.closest?.('.code-line')) as HTMLElement | null;

  if (lineTextEl && typeof document !== 'undefined' && typeof document.createRange === 'function') {
    try {
      const range = document.createRange();
      range.setStartAfter(target);
      range.setEndAfter(lineTextEl);
      return range.toString();
    } catch {
      // fallback below
    }
  }

  // DOM 遍历回退
  let text = '';
  function collectAfter(node: Node): void {
    let curr: Node | null = node.nextSibling;
    let parent: Node | null = node.parentNode;

    while (text.length < maxChars) {
      while (curr && text.length < maxChars) {
        text += curr.textContent || '';
        curr = curr.nextSibling;
      }
      if (text.length >= maxChars || !parent || parent === lineTextEl || parent.nodeName === 'BODY') {
        break;
      }
      curr = parent.nextSibling;
      parent = parent.parentNode;
    }
  }

  collectAfter(target);
  return text;
}

/**
 * 从当前悬停元素提取后续下标表达式（如 arr[k][1], dp[i][j], s.charAt(l)）
 */
export function extractSubscriptExpr(target: HTMLElement): string | null {
  const varName = target.dataset?.var || target.textContent?.trim() || '';
  if (!varName) return null;

  const trailingText = getTrailingText(target);
  if (!trailingText) return null;

  // 1. 匹配下标索引 [expr1][expr2] 或 [expr1]
  const brackets = extractMatchingBrackets(trailingText, 2);
  if (brackets) {
    return `${varName}${brackets.replace(/\s+/g, '')}`;
  }

  // 2. 匹配方法调用: .charAt(...) 或 .get(...)
  const matchMethod = trailingText.match(/^\s*(\.[a-zA-Z_$][a-zA-Z0-9_$]*\([^)]+\))/);
  if (matchMethod) {
    return `${varName}${matchMethod[1].replace(/\s+/g, '')}`;
  }

  return null;
}

/**
 * 为数组与状态矩阵变量渲染紧凑的 Mini 可视化网格 (未填初始槽位补 0，高亮当前聚焦格)
 */
export function renderArrayPreviewHtml(resolved: ResolvedVariable, state: HoverTooltipState): string {
  // 下标访问表达式（如 dp[2], arr[k][1]）代表单个元素取值，绝不展示多维/一维数组容器预览卡片
  if (resolved.name.includes('[')) return '';
  const raw = resolved.raw;
  if (!Array.isArray(raw) || raw.length === 0) return '';

  // 1. 二维数组 / 状态矩阵 (如 dp[i][j], grid, matrix)
  if (Array.isArray(raw[0])) {
    const rows = raw.length;
    const cols = raw[0].length;
    const maxRows = 5;
    const maxCols = 6;

    // 获取当前步的聚焦坐标 (i, j) 或 (l, r)
    const curIStr = state.currentVarsMap.get('i')?.value ?? state.currentVarsMap.get('l')?.value;
    const curJStr = state.currentVarsMap.get('j')?.value ?? state.currentVarsMap.get('r')?.value;
    const focusI = curIStr != null ? parseInt(curIStr, 10) : -1;
    const focusJ = curJStr != null ? parseInt(curJStr, 10) : -1;

    let trsHtml = '';
    const displayRows = Math.min(rows, maxRows);
    const displayCols = Math.min(cols, maxCols);

    for (let r = 0; r < displayRows; r++) {
      let tdsHtml = '';
      for (let c = 0; c < displayCols; c++) {
        const rawCell = raw[r]?.[c];
        const isUnfilled = rawCell === null || rawCell === undefined;
        const cellVal = isUnfilled ? '0' : String(rawCell);
        const isFocused = r === focusI && c === focusJ;

        let cellStyle = 'padding: 2px 4px; text-align: center; border-radius: 2px; font-size: 10px; min-width: 20px;';
        if (isFocused) {
          cellStyle += ' background: rgba(56, 189, 248, 0.28); color: #38bdf8; font-weight: bold; border: 1px solid #38bdf8;';
        } else if (isUnfilled) {
          cellStyle += ' color: #64748b; background: rgba(255,255,255,0.03);';
        } else {
          cellStyle += ' color: #f8fafc; font-weight: 600; background: rgba(255,255,255,0.06);';
        }

        tdsHtml += `<td style="${cellStyle}">${escapeHtml(cellVal)}</td>`;
      }
      if (cols > maxCols) {
        tdsHtml += `<td style="color: #64748b; font-size: 9px; padding: 1px 3px;">...</td>`;
      }
      trsHtml += `<tr>${tdsHtml}</tr>`;
    }

    if (rows > maxRows) {
      trsHtml += `<tr><td colspan="${displayCols + (cols > maxCols ? 1 : 0)}" style="color: #64748b; font-size: 9px; text-align: center; padding: 2px 0;">... (共 ${rows} 行)</td></tr>`;
    }

    return `
      <div style="margin-top: 6px; padding: 6px 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.28); border-radius: 5px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; font-size: 10px;">
          <span style="color: #38bdf8; font-weight: 700; display: flex; align-items: center; gap: 4px;">
            <span style="font-size: 11px;">📊</span>
            <span>二维状态矩阵 [${rows}×${cols}]</span>
          </span>
          <span style="color: #94a3b8; font-size: 9px;">未计算填 0 ${focusI >= 0 && focusJ >= 0 ? `· 聚焦 [${focusI}][${focusJ}]` : ''}</span>
        </div>
        <table style="border-collapse: separate; border-spacing: 2px; width: 100%; table-layout: fixed;">
          <tbody>${trsHtml}</tbody>
        </table>
      </div>
    `;
  }

  // 2. 一维数组 / 滚动槽位 (如 dp[j], items, weights)
  const len = raw.length;
  const maxItems = 8;
  const displayLen = Math.min(len, maxItems);

  const curIdxStr = state.currentVarsMap.get('j')?.value ?? state.currentVarsMap.get('i')?.value;
  const focusIdx = curIdxStr != null ? parseInt(curIdxStr, 10) : -1;

  let slotsHtml = '';
  for (let idx = 0; idx < displayLen; idx++) {
    const rawVal = raw[idx];
    const isUnfilled = rawVal === null || rawVal === undefined;
    const val = isUnfilled ? '0' : String(rawVal);
    const isFocused = idx === focusIdx;

    let slotStyle = 'padding: 2px 6px; text-align: center; border-radius: 3px; font-size: 10px; min-width: 22px;';
    if (isFocused) {
      slotStyle += ' background: rgba(56, 189, 248, 0.28); color: #38bdf8; font-weight: bold; border: 1px solid #38bdf8;';
    } else if (isUnfilled) {
      slotStyle += ' color: #64748b; background: rgba(255,255,255,0.03);';
    } else {
      slotStyle += ' color: #f8fafc; font-weight: 600; background: rgba(255,255,255,0.06);';
    }

    slotsHtml += `<span style="${slotStyle}">${escapeHtml(val)}</span>`;
  }

  if (len > maxItems) {
    slotsHtml += `<span style="color: #64748b; font-size: 9px; align-self: center;">... (${len}项)</span>`;
  }

  return `
    <div style="margin-top: 6px; padding: 6px 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.28); border-radius: 5px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; font-size: 10px;">
        <span style="color: #38bdf8; font-weight: 700; display: flex; align-items: center; gap: 4px;">
          <span style="font-size: 11px;">📊</span>
          <span>一维状态数组 (长 ${len})</span>
        </span>
        <span style="color: #94a3b8; font-size: 9px;">未计算填 0 ${focusIdx >= 0 ? `· 聚焦 [${focusIdx}]` : ''}</span>
      </div>
      <div style="display: flex; gap: 3px; flex-wrap: wrap;">${slotsHtml}</div>
    </div>
  `;
}

/**
 * 创建变量悬停调试气泡管理器
 */
export function createHoverTooltipManager(
  deps: HoverTooltipDeps,
  state: HoverTooltipState,
): HoverTooltipHandle {
  const { codeWrapper, createEl } = deps;

  let hoverTooltip: HTMLElement | null = null;
  if (typeof document !== 'undefined' && typeof document.createElement === 'function' && typeof document.getElementById === 'function') {
    hoverTooltip = document.getElementById('algo-debug-hover-tooltip');
    if (!hoverTooltip && document.body) {
      hoverTooltip = document.createElement('div');
      hoverTooltip.id = 'algo-debug-hover-tooltip';
      hoverTooltip.className = 'algo-debug-hover-tooltip';
      hoverTooltip.style.cssText =
        'display: none; position: fixed; z-index: 99999; pointer-events: none; background: rgba(15, 23, 42, 0.96); border: 1px solid #38bdf8; box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.6); border-radius: 6px; padding: 6px 10px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; backdrop-filter: blur(8px); transition: opacity 0.12s ease; opacity: 0; color: #cbd5e1; line-height: 1.4; max-width: 420px; word-break: break-all;';
      document.body.appendChild(hoverTooltip);
    }
  }

  let hoverDebounceTimer: any = null;
  let activeHoveredSpan: HTMLElement | null = null;

  const hideHoverTooltip = () => {
    if (hoverDebounceTimer) clearTimeout(hoverDebounceTimer);
    if (activeHoveredSpan) {
      activeHoveredSpan.style.backgroundColor = '';
      activeHoveredSpan.style.boxShadow = '';
      activeHoveredSpan = null;
    }
    if (hoverTooltip) {
      hoverTooltip.style.opacity = '0';
      hoverTooltip.style.display = 'none';
    }
  };

  const onCodeWrapperMouseMove = (e: any) => {
    if (!hoverTooltip) return;
    const target = (e.target?.closest?.('.algo-code-ident') || (e.target?.classList?.contains?.('algo-code-ident') ? e.target : null)) as HTMLElement | null;

    if (!target || !codeWrapper || (typeof codeWrapper.contains === 'function' && !codeWrapper.contains(target))) {
      hideHoverTooltip();
      return;
    }

    if (target === activeHoveredSpan) return;

    if (activeHoveredSpan) {
      activeHoveredSpan.style.backgroundColor = '';
      activeHoveredSpan.style.boxShadow = '';
    }
    activeHoveredSpan = target;
    target.style.backgroundColor = 'rgba(56, 189, 248, 0.2)';
    target.style.borderRadius = '2px';
    target.style.boxShadow = '0 0 0 1px rgba(56, 189, 248, 0.35)';

    if (hoverDebounceTimer) clearTimeout(hoverDebounceTimer);
    hoverDebounceTimer = setTimeout(() => {
      if (!hoverTooltip || activeHoveredSpan !== target) return;
      const varName = target.dataset?.var || target.textContent?.trim() || '';
      if (!varName) {
        hideHoverTooltip();
        return;
      }

      const IGNORED_SYSTEM_TYPES = new Set([
        'Main', 'Solution', 'String', 'System', 'IOException', 'Exception',
        'BufferedReader', 'InputStreamReader', 'OutputStreamWriter', 'PrintWriter', 'StreamTokenizer',
        'Arrays', 'Math', 'Collections', 'List', 'ArrayList', 'Map', 'HashMap', 'Set', 'HashSet',
        'Integer', 'Long', 'Double', 'Boolean', 'Character', 'Object',
        'vector', 'string', 'cin', 'cout', 'endl', 'std',
        'print', 'range', 'len', 'int', 'float', 'str', 'list', 'dict', 'set',
        'console', 'window', 'document',
      ]);

      const IGNORED_KEYWORDS = new Set([
        'public', 'private', 'protected', 'static', 'final', 'const', 'class', 'void', 'new', 'return',
        'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'default',
        'throws', 'throw', 'try', 'catch', 'finally', 'import', 'package',
      ]);

      if (IGNORED_KEYWORDS.has(varName)) {
        hideHoverTooltip();
        return;
      }

      if (IGNORED_SYSTEM_TYPES.has(varName)) {
        hoverTooltip.innerHTML = `
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="color: #fbbf24; font-size: 10px; font-weight: 600;">type / class</span>
            <span style="color: #f8fafc; font-weight: 700;">${escapeHtml(varName)}</span>
          </div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 3px;">标准库类型 / 结构定义 (非运行时状态变量)</div>
        `;
      } else {
        const subscriptExpr = extractSubscriptExpr(target);
        let resolved = subscriptExpr
          ? VariableContextResolver.getVariable(state.currentVarsMap, subscriptExpr, state.currentStep)
          : undefined;

        if (!resolved) {
          resolved = VariableContextResolver.getVariable(state.currentVarsMap, varName, state.currentStep);
        }
        if (resolved) {
          const activeLineEl = (target.closest?.('.code-line') || target) as HTMLElement | null;
          const lineCode = activeLineEl?.dataset?.raw || activeLineEl?.getAttribute?.('data-raw') || '';
          const reconciled = LoopIndexReconciler.reconcileVariableValue(varName, resolved.value, undefined, lineCode);
          const displayValue = reconciled.value;
          const detailHtml = resolved.detail
            ? `<div style="font-size: 10px; color: #a5b4fc; margin-top: 4px; border-top: 1px dashed rgba(255,255,255,0.14); padding-top: 4px; display: flex; align-items: center; gap: 4px;"><span style="color: #818cf8; font-size: 10px;">💡</span><span>${escapeHtml(resolved.detail)}</span></div>`
            : '';
          const arrayPreviewHtml = renderArrayPreviewHtml(resolved, state);
          hoverTooltip.innerHTML = `
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="color: #94a3b8; font-size: 10px;">${resolved.type || 'var'}</span>
              <span style="color: #f8fafc; font-weight: 700;">${escapeHtml(resolved.name)}</span>
              <span style="color: #64748b;">=</span>
              <span style="color: #38bdf8; font-weight: 700;">${escapeHtml(displayValue)}</span>
            </div>
            ${detailHtml}
            ${arrayPreviewHtml}
          `;
        } else if (/^[A-Z][a-z0-9_]+/.test(varName)) {
          // 类名定义 (PascalCase)
          hoverTooltip.innerHTML = `
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="color: #fbbf24; font-size: 10px; font-weight: 600;">class</span>
              <span style="color: #f8fafc; font-weight: 700;">${escapeHtml(varName)}</span>
            </div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 3px;">类定义 / 类型标识符</div>
          `;
        } else {
          const desc = VariableContextResolver.getDescription(varName, state.currentStep);
          if (desc) {
            hoverTooltip.innerHTML = `
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="color: #94a3b8; font-size: 10px;">var</span>
                <span style="color: #38bdf8; font-weight: 700;">${escapeHtml(varName)}</span>
                <span style="color: #64748b; font-size: 10px;">(当前作用域已定义)</span>
              </div>
              <div style="font-size: 10px; color: #a5b4fc; margin-top: 4px; border-top: 1px dashed rgba(255,255,255,0.14); padding-top: 4px; display: flex; align-items: center; gap: 4px;"><span style="color: #818cf8; font-size: 10px;">💡</span><span>${escapeHtml(desc)}</span></div>
            `;
          } else {
            hoverTooltip.innerHTML = `
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="color: #94a3b8; font-size: 10px;">var</span>
                <span style="color: #cbd5e1; font-weight: 600;">${escapeHtml(varName)}</span>
                <span style="color: #64748b; font-size: 10px;">(当前步未捕获)</span>
              </div>
            `;
          }
        }
      }

      if (typeof target.getBoundingClientRect === 'function') {
        const rect = target.getBoundingClientRect();
        hoverTooltip.style.display = 'block';
        hoverTooltip.style.opacity = '1';

        let top = rect.top - (hoverTooltip.offsetHeight || 28) - 6;
        let left = rect.left;
        if (top < 10) {
          top = rect.bottom + 6;
        }
        if (typeof window !== 'undefined') {
          if (left + (hoverTooltip.offsetWidth || 150) > window.innerWidth - 10) {
            left = window.innerWidth - (hoverTooltip.offsetWidth || 150) - 10;
          }
        }
        if (left < 10) left = 10;

        hoverTooltip.style.top = `${top}px`;
        hoverTooltip.style.left = `${left}px`;
      }
    }, 100);
  };

  const onCodeWrapperMouseLeave = () => {
    hideHoverTooltip();
  };

  return {
    bind() {
      if (codeWrapper && typeof codeWrapper.addEventListener === 'function') {
        codeWrapper.addEventListener('mousemove', onCodeWrapperMouseMove);
        codeWrapper.addEventListener('mouseleave', onCodeWrapperMouseLeave);
      }
    },
    destroy() {
      if (hoverDebounceTimer) clearTimeout(hoverDebounceTimer);
      hideHoverTooltip();
      if (codeWrapper && typeof codeWrapper.removeEventListener === 'function') {
        codeWrapper.removeEventListener('mousemove', onCodeWrapperMouseMove);
        codeWrapper.removeEventListener('mouseleave', onCodeWrapperMouseLeave);
      }
    },
  };
}
