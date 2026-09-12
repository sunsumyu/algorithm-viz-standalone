/**
 * 语言切换控制器 (LanguageSwitcher) — 职责单一深模块
 *
 * 从 DarkCodeTerminalPresenter.mount 中提取的语言切换关注点：
 *   - 按钮激活态样式同步
 *   - 语言状态更新与回调触发
 */

import { CodePresentationModel } from '../../code-presentation-model';
import type { CodeLineRendererState, CodeLineRendererDeps } from './code-line-renderer';
import { renderCodeLines } from './code-line-renderer';

export interface LanguageSwitcherDeps {
  langBtns: NodeListOf<HTMLButtonElement> | HTMLButtonElement[];
  onLanguageChange?: (lang: string) => void;
}

/**
 * 切换编程语言并重新渲染代码行
 */
export function switchLanguage(
  lang: string,
  deps: LanguageSwitcherDeps,
  rendererDeps: CodeLineRendererDeps,
  state: CodeLineRendererState,
  highlightFn: (target: any) => void,
): void {
  state.currentLang = lang;
  rendererDeps.codeModel.setCurrentLanguage(lang);

  deps.langBtns.forEach((btn) => {
    const bLang = btn.dataset.lang;
    const isActive = bLang === lang || (lang === 'javascript' && bLang === 'js');
    if (isActive) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
    btn.style.background = isActive ? '#334155' : 'transparent';
    btn.style.color = isActive ? '#93c5fd' : '#64748b';
  });
  renderCodeLines(rendererDeps, state, highlightFn);
  if (deps.onLanguageChange) {
    deps.onLanguageChange(lang);
  }
}
