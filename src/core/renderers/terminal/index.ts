/**
 * 代码终端子模块聚合 (Terminal Sub-modules)
 *
 * 从 DarkCodeTerminalPresenter.mount (800行上帝函数) 提取的职责单一模块。
 * mount 重构为薄编排器，委托本目录下的聚焦模块处理具体关注点。
 */

export { renderCodeLines, highlightLineInternal, updateInlineHint, updateFontSize, copyCode } from './code-line-renderer';
export type { CodeLineRendererDeps, CodeLineRendererState } from './code-line-renderer';
export { switchLanguage } from './language-switcher';
export type { LanguageSwitcherDeps } from './language-switcher';
export { createHoverTooltipManager } from './hover-tooltip-manager';
export type { HoverTooltipHandle, HoverTooltipDeps, HoverTooltipState } from './hover-tooltip-manager';
