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

export interface HoverTooltipDeps {
  codeWrapper: HTMLElement | null;
  createEl: (tag: string, id?: string) => any;
}

export interface HoverTooltipState {
  currentVarsMap: Map<string, ResolvedVariable>;
  currentLang: string;
}

export interface HoverTooltipHandle {
  /** 绑定鼠标事件到 codeWrapper */
  bind(): void;
  /** 解绑所有事件并清理 */
  destroy(): void;
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
        'display: none; position: fixed; z-index: 99999; pointer-events: none; background: rgba(15, 23, 42, 0.96); border: 1px solid #38bdf8; box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.6); border-radius: 6px; padding: 5px 10px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; backdrop-filter: blur(8px); transition: opacity 0.12s ease; opacity: 0; color: #cbd5e1; line-height: 1.4; max-width: 360px; word-break: break-all;';
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

      const resolved = VariableContextResolver.getVariable(state.currentVarsMap, varName);
      if (resolved) {
        hoverTooltip.innerHTML = `
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="color: #94a3b8; font-size: 10px;">${resolved.type || 'var'}</span>
            <span style="color: #f8fafc; font-weight: 700;">${escapeHtml(resolved.name)}</span>
            <span style="color: #64748b;">=</span>
            <span style="color: #38bdf8; font-weight: 700;">${escapeHtml(resolved.value)}</span>
          </div>
        `;
      } else {
        hoverTooltip.innerHTML = `
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="color: #94a3b8; font-size: 10px;">var</span>
            <span style="color: #cbd5e1; font-weight: 600;">${escapeHtml(varName)}</span>
            <span style="color: #64748b; font-style: italic; font-size: 10px;">(当前步骤未捕获)</span>
          </div>
        `;
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
