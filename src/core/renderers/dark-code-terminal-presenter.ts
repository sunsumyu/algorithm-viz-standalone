/**
 * 统一暗色代码终端表现器深模块 (DarkCodeTerminalPresenter)
 * 遵循深模块 (Deep Module) 与外观模式 (Facade Pattern) 原则：
 * 对外暴露极简高杠杆接口，彻底封装内部状态：
 *   1. Tab 切换 (代码调试 / 题目描述 / 递推精讲)
 *   2. 4 语种切换 (Java / C++ / Python / JS)
 *   3. 字号缩放器 (A- / A+) 与 macOS 红黄绿窗口圆点
 *   4. 单步代码行高亮与平滑滚动
 *   5. 语义锚点 (@step:anchor) 跨语种自动映射与纯净源码展示
 *   6. 力扣原题模态弹窗打开与关闭
 */

import type { StepVar } from '../interfaces';
// highlightTokens / escapeHtml moved to terminal/code-line-renderer.ts
import { VariableContextResolver, type ResolvedVariable } from '../variable-context-resolver';
import {
  CodePresentationModel,
  type KeyPointsData,
  type ProblemDetail,
} from '../code-presentation-model';
import { ProblemAnalysisViewer } from '../problem-analysis-viewer';
import {
  renderCodeLines,
  highlightLineInternal as highlightLineImpl,
  updateFontSize as updateFontSizeImpl,
  copyCode as copyCodeImpl,
  updateInlineHint,
  type CodeLineRendererDeps,
  type CodeLineRendererState,
} from './terminal/code-line-renderer';
import { switchLanguage as switchLanguageImpl, type LanguageSwitcherDeps } from './terminal/language-switcher';
import { createHoverTooltipManager } from './terminal/hover-tooltip-manager';

export type SingleLangHighlightTarget =
  | number
  | number[]
  | { from: number; to: number }
  | { primary: number | number[]; context?: number | number[] }
  | { anchor: string };

export type HighlightTarget =
  | string
  | SingleLangHighlightTarget
  | Record<string, SingleLangHighlightTarget>
  | object
  | { anchor: string };

export interface DarkCodeTerminalConfig {
  /** 4 语种源码映射表，如 { java: string[], cpp: string[], python: string[], javascript: string[] } */
  codeLanguages?: Record<string, string[]>;
  /** 单一语言源码行数组（未提供 codeLanguages 时的简写） */
  codeLines?: string[];
  /** 面板标题（可选） */
  title?: string;
  /** 题目完整描述 HTML 内容（支持示例、约束） */
  problemHtml?: string;
  /** 算法核心要点/回溯五部曲精讲 HTML 内容 */
  analysisHtml?: string;
  /** 题目结构化模型数据（可选，自动生成 HTML） */
  problemDetail?: ProblemDetail;
  /** 核心要点结构化数据（可选，自动生成 HTML） */
  keyPoints?: KeyPointsData | string;
  /** 默认语言（默认 'java'） */
  initialLang?: string;
  /** 默认字号（默认 12） */
  fontSize?: number;
  /** 算法唯一标识键（用于 CodeStepIndexer 索引查找） */
  algoKey?: string;
  /** 逐行详细讲解 */
  lineExplanations?: Record<number, string> | Record<string, Record<number, string>>;
  /** 语言切换回调（可选） */
  onLanguageChange?: (lang: string) => void;
}

export interface DarkCodeTerminalInstance {
  /** 高亮指定物理行或多行目标 */
  highlightLine(target: HighlightTarget | null | undefined): void;
  /** 同步更新变量监视面板与实时调试上下文 */
  updateVars(vars?: StepVar[], stepContext?: unknown): void;
  /** 手动切换编程语言 */
  switchLanguage(lang: string): void;
  /** 手动切换看板 Tab */
  switchTab(tab: 'code' | 'problem' | 'analysis'): void;
  /** 获取当前编程语言 */
  getCurrentLanguage(): string;
  /** 获取当前字号 */
  getFontSize(): number;
  /** 复制代码到系统剪贴板 */
  copyCode(): Promise<boolean>;
  /** 语义与代码多语言模型 */
  codeModel?: CodePresentationModel;
  /** 销毁实例并解绑事件 */
  destroy(): void;
}

export interface NormalizedHighlight {
  lines: number[];
  focusLine?: number;
}

const TAB_CODE_ICON = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; flex-shrink:0;"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>';
const TAB_PROBLEM_ICON = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; flex-shrink:0;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>';
const TAB_ANALYSIS_ICON = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; flex-shrink:0;"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6h8c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z"></path></svg>';

export class DarkCodeTerminalPresenter {
  /**
   * 纯函数：将多态高亮目标（数字、字符串、数组、区间、多语言字典）统一归一化为物理行号数组
   */
  public static normalizeHighlightTarget(
    target: HighlightTarget | null | undefined,
    currentLang: string = 'java',
    codeModel?: CodePresentationModel
  ): NormalizedHighlight {
    if (target == null) return { lines: [] };

    if (typeof target === 'number') {
      return { lines: [target], focusLine: target };
    }
    if (typeof target === 'string') {
      const parsed = parseInt(target, 10);
      if (!isNaN(parsed)) {
        return { lines: [parsed], focusLine: parsed };
      }
      if (codeModel) {
        const anchorLine = codeModel.resolveAnchorLine(target, currentLang);
        if (anchorLine != null) {
          return this.normalizeHighlightTarget(anchorLine, currentLang, codeModel);
        }
      }
      return { lines: [] };
    }
    if (Array.isArray(target)) {
      const valid = target
        .map((t) => (typeof t === 'number' ? t : parseInt(t, 10)))
        .filter((n) => !isNaN(n));
      return { lines: valid, focusLine: valid[0] };
    }
    if (typeof target === 'object') {
      if ('anchor' in target && typeof (target as any).anchor === 'string') {
        if (codeModel) {
          const anchorLine = codeModel.resolveAnchorLine((target as any).anchor, currentLang);
          if (anchorLine != null) {
            return this.normalizeHighlightTarget(anchorLine, currentLang, codeModel);
          }
        }
      }
      if ('from' in target && 'to' in target && typeof target.from === 'number' && typeof target.to === 'number') {
        const range: number[] = [];
        for (let i = target.from; i <= target.to; i++) range.push(i);
        return { lines: range, focusLine: target.from };
      }
      if ('primary' in target) {
        const p = (target as any).primary;
        return this.normalizeHighlightTarget(p, currentLang, codeModel);
      }
      // 多语言字典解包
      const dict = target as Record<string, any>;
      let resolved = dict[currentLang];
      if (resolved == null && (currentLang === 'js' || currentLang === 'javascript')) {
        resolved = dict['javascript'] ?? dict['js'];
      }
      if (resolved == null && (currentLang === 'python' || currentLang === 'py')) {
        resolved = dict['python'] ?? dict['py'];
      }
      if (resolved == null && currentLang.includes('cpp')) {
        resolved = dict['cpp'] ?? dict['c++'];
      }
      if (resolved == null) {
        resolved = dict['java'] ?? Object.values(dict)[0];
      }
      return this.normalizeHighlightTarget(resolved, currentLang, codeModel);
    }
    return { lines: [] };
  }

  /**
   * 将暗色终端挂载到指定容器并绑定所有交互行为
   */
  public static mount(
    root: HTMLElement | null,
    config: DarkCodeTerminalConfig
  ): DarkCodeTerminalInstance {
    if (!root) {
      return {
        highlightLine: () => {},
        updateVars: () => {},
        switchLanguage: () => {},
        switchTab: () => {},
        getCurrentLanguage: () => config.initialLang || 'java',
        getFontSize: () => config.fontSize || 12,
        copyCode: async () => false,
        destroy: () => {},
      };
    }

    let currentLang = config.initialLang || 'java';
    let codeFontSize = config.fontSize || 12;
    let activeLineTarget: HighlightTarget | null | undefined = null;
    let currentVarsMap = new Map<string, ResolvedVariable>();

    // 0. 规范化多语言代码与语义模型
    const initialLangs =
      config.codeLanguages && Object.keys(config.codeLanguages).length > 0
        ? config.codeLanguages
        : config.codeLines
        ? { [currentLang]: config.codeLines }
        : { java: [] };

    const codeModel = new CodePresentationModel({
      languages: initialLangs,
      language: currentLang,
      algoKey: config.algoKey,
      lineExplanations: config.lineExplanations,
      problemDetail: config.problemDetail,
      keyPoints: typeof config.keyPoints === 'object' ? config.keyPoints : undefined,
    });

    // 1. 自动检测并注入暗色终端骨架（若模板未预置 DOM）
    this.ensureTerminalSkeleton(root);

    // 2. DOM 节点查询 (支持多种命名空间和统一样式)
    const btnTabCode = root.querySelector('#btn-tab-code') as HTMLElement | null;
    const btnTabProblem = root.querySelector('#btn-tab-problem') as HTMLElement | null;
    const btnTabAnalysis = root.querySelector('#btn-tab-analysis') as HTMLElement | null;

    // 强制同步 Tab 按钮的模板标准（对齐不同路径，包含矢量图标与内嵌底槽）
    if (btnTabCode) {
      if (!btnTabCode.querySelector('svg') && !btnTabCode.querySelector('i')) {
        btnTabCode.innerHTML = `${TAB_CODE_ICON}<span>代码调试</span>`;
      }
      btnTabCode.style.cssText =
        'background: #2563eb; border: none; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 6px; cursor: pointer; transition: all 0.15s; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 1px 2px rgba(0,0,0,0.25);';
    }
    if (btnTabProblem) {
      if (!btnTabProblem.querySelector('svg') && !btnTabProblem.querySelector('i')) {
        btnTabProblem.innerHTML = `${TAB_PROBLEM_ICON}<span>题目描述</span>`;
      }
      btnTabProblem.style.cssText =
        'background: transparent; border: none; color: #94a3b8; font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 6px; cursor: pointer; transition: all 0.15s; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px;';
    }
    if (btnTabAnalysis) {
      if (!btnTabAnalysis.querySelector('svg') && !btnTabAnalysis.querySelector('i')) {
        btnTabAnalysis.innerHTML = `${TAB_ANALYSIS_ICON}<span>递推精讲</span>`;
      }
      btnTabAnalysis.style.cssText =
        'background: transparent; border: none; color: #94a3b8; font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 6px; cursor: pointer; transition: all 0.15s; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px;';
    }
    const tabGroupEl = btnTabCode?.parentElement;
    if (tabGroupEl) {
      tabGroupEl.style.cssText =
        'display: flex; align-items: center; gap: 2px; background: #020617; padding: 2px; border-radius: 8px; border: 1px solid #1e293b; flex-shrink: 0;';
    }

    const viewCode = root.querySelector('#code-view-container') as HTMLElement | null;
    const viewProblem = root.querySelector('#problem-view-container') as HTMLElement | null;
    const viewAnalysis = root.querySelector('#analysis-view-container') as HTMLElement | null;

    const codeWrapper = root.querySelector('#code-lines-wrapper') as HTMLElement | null;
    const langBtns = root.querySelectorAll<HTMLButtonElement>(
      '#code-lang-tabs .co-lang-btn, #code-lang-tabs .cs-lang-btn, #code-lang-tabs .lang-btn, #code-lang-tabs .fr-lang-btn, #code-lang-tabs [data-lang]'
    );

    const btnFontDec = root.querySelector('#btn-code-font-dec') as HTMLElement | null;
    const btnFontInc = root.querySelector('#btn-code-font-inc') as HTMLElement | null;
    const fontIndicator = root.querySelector('#code-font-indicator') as HTMLElement | null;

    let btnCopy = root.querySelector('#btn-code-copy') as HTMLElement | null;
    if (!btnCopy) {
      const fontContainer = (root.querySelector('#code-font-container') || root.querySelector('.font-tools')) as HTMLElement | null;
      if (fontContainer && typeof fontContainer.appendChild === 'function') {
        const createdBtn = DarkCodeTerminalPresenter.createSafeElement('button', 'btn-code-copy') as HTMLElement;
        createdBtn.className = 'btn-code-copy';
        createdBtn.title = '复制当前完整代码';
        createdBtn.style.cssText =
          'background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 2px 7px; color: #94a3b8; font-size: 10px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; transition: all 0.15s ease; white-space: nowrap; user-select: none;';
        createdBtn.innerHTML = `
          <span class="copy-icon" style="display: inline-flex; align-items: center;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </span>
          <span class="copy-text">复制</span>
        `;
        if (typeof fontContainer.insertBefore === 'function' && fontContainer.firstChild) {
          fontContainer.insertBefore(createdBtn, fontContainer.firstChild);
        } else {
          fontContainer.appendChild(createdBtn);
        }
        btnCopy = createdBtn;
      }
    }

    const modalProblem = root.querySelector('#modal-problem') as HTMLElement | null;
    if (modalProblem) {
      modalProblem.style.display = 'none';
      if (!modalProblem.classList.contains('hidden')) {
        modalProblem.classList.add('hidden');
      }
    }
    const modalBody = root.querySelector('#modal-problem-body') as HTMLElement | null;
    const modalTitle = root.querySelector(
      '#modal-problem [class*="modal-title"], [class*="-modal-title"]'
    ) as HTMLElement | null;
    if (modalTitle) {
      modalTitle.innerHTML = '<span>📋 算法原理与题目说明</span>';
    }
    const btnOpenModals = root.querySelectorAll<HTMLElement>(
      '#btn-open-problem-modal, #btn-problem-info, .btn-problem, [class*="-btn-problem"]'
    );
    const btnCloseModal = root.querySelector('#btn-close-problem-modal') as HTMLElement | null;

    // 3. 静态与结构化内容注入
    if (viewProblem) {
      if (config.problemHtml) {
        viewProblem.innerHTML = config.problemHtml;
      } else if (config.problemDetail) {
        ProblemAnalysisViewer.renderProblemDetail(viewProblem, config.problemDetail);
      }
    }
    if (modalBody) {
      const hasProblem = Boolean(config.problemHtml || config.problemDetail);
      const hasAnalysis = Boolean(config.analysisHtml || config.keyPoints);

      if (hasProblem && hasAnalysis) {
        let probHtml = '';
        if (config.problemHtml) {
          probHtml = config.problemHtml;
        } else if (config.problemDetail) {
          const temp = DarkCodeTerminalPresenter.createSafeElement('div');
          ProblemAnalysisViewer.renderProblemDetail(temp, config.problemDetail);
          probHtml = temp.innerHTML;
        }

        let analysisHtml = '';
        if (config.analysisHtml) {
          analysisHtml = config.analysisHtml;
        } else if (config.keyPoints) {
          const temp = DarkCodeTerminalPresenter.createSafeElement('div');
          ProblemAnalysisViewer.renderKeyPoints(temp, config.keyPoints);
          analysisHtml = temp.innerHTML;
        }

        modalBody.innerHTML = `
          <div class="modal-combined-container" style="display: flex; flex-direction: column; gap: 20px;">
            <section class="modal-section-problem" style="background: rgba(15, 23, 42, 0.65); border: 1px solid #334155; border-radius: 10px; padding: 18px 20px;">
              <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 10px; margin-bottom: 14px;">
                <span style="font-weight: 700; font-size: 15px; color: #38bdf8; display: flex; align-items: center; gap: 6px;">
                  📖 题目规格与说明
                </span>
                <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);">
                  Problem Spec
                </span>
              </div>
              <div class="modal-section-body" style="font-size: 13px; line-height: 1.7; color: #cbd5e1;">
                ${probHtml}
              </div>
            </section>

            <section class="modal-section-analysis" style="background: rgba(15, 23, 42, 0.65); border: 1px solid #334155; border-radius: 10px; padding: 18px 20px;">
              <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 10px; margin-bottom: 14px;">
                <span style="font-weight: 700; font-size: 15px; color: #34d399; display: flex; align-items: center; gap: 6px;">
                  💡 核心算法原理与状态推导
                </span>
                <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: rgba(52, 211, 153, 0.15); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3);">
                  Algorithm Principles
                </span>
              </div>
              <div class="modal-section-body" style="font-size: 13px; line-height: 1.7; color: #cbd5e1;">
                ${analysisHtml}
              </div>
            </section>
          </div>
        `;
      } else if (hasProblem) {
        if (config.problemHtml) {
          modalBody.innerHTML = config.problemHtml;
        } else if (config.problemDetail) {
          ProblemAnalysisViewer.renderProblemDetail(modalBody, config.problemDetail);
        }
      } else if (hasAnalysis) {
        if (config.analysisHtml) {
          modalBody.innerHTML = config.analysisHtml;
        } else if (config.keyPoints) {
          ProblemAnalysisViewer.renderKeyPoints(modalBody, config.keyPoints);
        }
      }
    }
    if (viewAnalysis) {
      if (config.analysisHtml) {
        viewAnalysis.innerHTML = config.analysisHtml;
      } else if (config.keyPoints) {
        ProblemAnalysisViewer.renderKeyPoints(viewAnalysis, config.keyPoints);
      }
    }



    // ── 4. 提取模块：代码行渲染 ──────────────────────────────
    const rendererDeps: CodeLineRendererDeps = {
      codeWrapper,
      codeModel,
      fontIndicator,
      btnCopy,
      createEl: DarkCodeTerminalPresenter.createSafeElement.bind(DarkCodeTerminalPresenter),
    };
    const rendererState: CodeLineRendererState = {
      get currentLang() { return currentLang; },
      set currentLang(v) { currentLang = v; },
      get codeFontSize() { return codeFontSize; },
      set codeFontSize(v) { codeFontSize = v; },
      activeLineTarget,
      currentVarsMap,
    };

    const hl = (target: HighlightTarget | null | undefined) => {
      rendererState.activeLineTarget = target;
      activeLineTarget = target;
      highlightLineImpl(target, rendererDeps, rendererState);
    };

    // ── 5. Tab 切换（内联，逻辑极简） ───────────────────────
    const switchTabInternal = (tab: 'code' | 'problem' | 'analysis') => {
      const setTabStyle = (btn: HTMLElement | null, isActive: boolean) => {
        if (!btn) return;
        if (isActive) {
          btn.classList.add('active');
          btn.style.background = '#2563eb';
          btn.style.color = '#ffffff';
          btn.style.fontWeight = '700';
          btn.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.25)';
        } else {
          btn.classList.remove('active');
          btn.style.background = 'transparent';
          btn.style.color = '#94a3b8';
          btn.style.fontWeight = '500';
          btn.style.boxShadow = 'none';
        }
      };
      setTabStyle(btnTabCode, tab === 'code');
      setTabStyle(btnTabProblem, tab === 'problem');
      setTabStyle(btnTabAnalysis, tab === 'analysis');
      if (viewCode) viewCode.style.display = tab === 'code' ? 'flex' : 'none';
      if (viewProblem) viewProblem.style.display = tab === 'problem' ? 'flex' : 'none';
      if (viewAnalysis) viewAnalysis.style.display = tab === 'analysis' ? 'flex' : 'none';
    };

    // ── 6. 提取模块：语言切换 ────────────────────────────────
    const switchLangDeps: LanguageSwitcherDeps = {
      langBtns,
      onLanguageChange: config.onLanguageChange,
    };
    const switchLanguageInternal = (lang: string) => {
      switchLanguageImpl(lang, switchLangDeps, rendererDeps, rendererState, hl);
    };

    // ── 7. 事件绑定 ──────────────────────────────────────────
    const onTabCodeClick = () => switchTabInternal('code');
    const onTabProblemClick = () => switchTabInternal('problem');
    const onTabAnalysisClick = () => switchTabInternal('analysis');

    btnTabCode?.addEventListener('click', onTabCodeClick);
    btnTabProblem?.addEventListener('click', onTabProblemClick);
    btnTabAnalysis?.addEventListener('click', onTabAnalysisClick);

    const onLangClick = (e: Event) => {
      const btn = (e.currentTarget || e.target) as HTMLElement;
      const lang = btn?.dataset?.lang;
      if (lang) switchLanguageInternal(lang);
    };
    langBtns.forEach((btn) => btn.addEventListener('click', onLangClick));

    const onFontDecClick = () => updateFontSizeImpl(-1, rendererDeps, rendererState, hl);
    const onFontIncClick = () => updateFontSizeImpl(1, rendererDeps, rendererState, hl);

    btnFontDec?.addEventListener('click', onFontDecClick);
    btnFontInc?.addEventListener('click', onFontIncClick);

    const onCopyClick = () => { void copyCodeImpl(rendererDeps, rendererState); };
    btnCopy?.addEventListener('click', onCopyClick);

    const onOpenModalClick = () => {
      if (modalProblem) { modalProblem.classList.remove('hidden'); modalProblem.style.display = 'flex'; }
    };
    const onCloseModalClick = () => {
      if (modalProblem) { modalProblem.classList.add('hidden'); modalProblem.style.display = 'none'; }
    };
    btnOpenModals.forEach((btn) => btn.addEventListener('click', onOpenModalClick));
    btnCloseModal?.addEventListener('click', onCloseModalClick);
    modalProblem?.addEventListener('click', (e) => { if (e.target === modalProblem) onCloseModalClick(); });
    const onModalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalProblem && modalProblem.style.display !== 'none') onCloseModalClick();
    };
    if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
      document.addEventListener('keydown', onModalKeyDown);
    }

    // ── 8. 提取模块：变量悬停气泡 ────────────────────────────
    const hoverMgr = createHoverTooltipManager(
      { codeWrapper, createEl: DarkCodeTerminalPresenter.createSafeElement.bind(DarkCodeTerminalPresenter) },
      { get currentVarsMap() { return currentVarsMap; }, get currentLang() { return currentLang; } },
    );
    hoverMgr.bind();

    // ── 9. 首次渲染 ──────────────────────────────────────────
    renderCodeLines(rendererDeps, rendererState, hl);

    // ── 10. 返回实例 ─────────────────────────────────────────
    return {
      codeModel,
      highlightLine: (target) => hl(target),
      updateVars: (vars?: StepVar[], stepContext?: unknown) => {
        currentVarsMap = VariableContextResolver.resolve(stepContext || { vars }, currentLang);
        rendererState.currentVarsMap = currentVarsMap;

        if (codeWrapper) {
          const activeLineEl = (codeWrapper.querySelector?.('.code-line.active') ||
            codeWrapper.querySelector?.('.code-line.is-active')) as HTMLElement | null;
          if (activeLineEl) {
            updateInlineHint(activeLineEl, rendererDeps, rendererState);
          }
        }

        let varsWatch = root.querySelector('#code-vars-watch') as any;
        if (!varsWatch) {
          const body = (root.querySelector('.terminal-body') || root.querySelector('#code-view-container')) as any;
          if (body) {
            varsWatch = DarkCodeTerminalPresenter.createSafeElement('div');
            varsWatch.id = 'code-vars-watch';
            varsWatch.className = 'code-vars-watch-container';
            varsWatch.style.cssText =
              'border-top: 1px solid #1e293b; padding: 6px 12px; background: rgba(15, 23, 42, 0.95); display: flex; flex-wrap: wrap; gap: 8px; font-size: 11px; flex-shrink: 0; min-height: 28px; align-items: center;';
            body.appendChild(varsWatch);
          }
        }
        if (!varsWatch) return;

        if (!vars || vars.length === 0) {
          varsWatch.style.display = 'none';
          varsWatch.innerHTML = '<span style="color: #475569; font-style: italic;">暂无活动变量</span>';
          return;
        }

        varsWatch.style.display = 'flex';
        varsWatch.innerHTML = vars
          .map((v) => `
            <div class="var-badge" style="display: inline-flex; align-items: center; gap: 4px; background: #1e293b; border: 1px solid #334155; padding: 1px 6px; border-radius: 4px;">
              <span class="var-name" style="color: #94a3b8; font-family: monospace;">${v.name}:</span>
              <span class="var-val" style="color: #38bdf8; font-weight: 700; font-family: monospace;">${v.value}</span>
            </div>
          `)
          .join('');
      },
      switchLanguage: (lang) => switchLanguageInternal(lang),
      switchTab: (tab) => switchTabInternal(tab),
      getCurrentLanguage: () => currentLang,
      getFontSize: () => codeFontSize,
      copyCode: () => copyCodeImpl(rendererDeps, rendererState),
      destroy: () => {
        hoverMgr.destroy();
        btnCopy?.removeEventListener('click', onCopyClick);
        btnTabCode?.removeEventListener('click', onTabCodeClick);
        btnTabProblem?.removeEventListener('click', onTabProblemClick);
        btnTabAnalysis?.removeEventListener('click', onTabAnalysisClick);
        langBtns.forEach((btn) => btn.removeEventListener('click', onLangClick));
        btnFontDec?.removeEventListener('click', onFontDecClick);
        btnFontInc?.removeEventListener('click', onFontIncClick);
        btnOpenModals.forEach((btn) => btn.removeEventListener('click', onOpenModalClick));
        btnCloseModal?.removeEventListener('click', onCloseModalClick);
        if (typeof document !== 'undefined' && typeof document.removeEventListener === 'function') {
          document.removeEventListener('keydown', onModalKeyDown);
        }
      },
    };
  }

  /**
   * 安全创建 DOM 元素，兼容无全局 document 的 Node.js 内存测试环境与真实浏览器 DOM
   */
  public static createSafeElement(tag: string, id: string = ''): any {
    const d = typeof document !== 'undefined' ? document : (globalThis as any).document;
    if (d && typeof d.createElement === 'function') {
      const el = d.createElement(tag);
      if (id) el.id = id;
      return el;
    }
    const el: any = {
      id,
      tagName: tag.toUpperCase(),
      className: '',
      textContent: '',
      _innerHTML: '',
      dataset: {},
      style: {},
      children: [],
      listeners: {},
      classList: {
        _classes: new Set<string>(),
        _sync: function () {
          if (el.className) {
            el.className.split(/\s+/).forEach((c: string) => {
              if (c) this._classes.add(c);
            });
          }
        },
        add: function (...cls: string[]) {
          this._sync();
          cls.forEach((c) => this._classes.add(c));
          el.className = Array.from(this._classes).join(' ');
        },
        remove: function (...cls: string[]) {
          this._sync();
          cls.forEach((c) => this._classes.delete(c));
          el.className = Array.from(this._classes).join(' ');
        },
        contains: function (c: string) {
          this._sync();
          return this._classes.has(c);
        },
        toggle: function (c: string, force?: boolean) {
          this._sync();
          const has = this._classes.has(c);
          const shouldAdd = force !== undefined ? force : !has;
          if (shouldAdd) this._classes.add(c);
          else this._classes.delete(c);
          el.className = Array.from(this._classes).join(' ');
          return shouldAdd;
        },
      },
      get innerHTML() {
        return this._innerHTML;
      },
      set innerHTML(val: string) {
        this._innerHTML = val;
        if (val === '') this.children = [];
      },
      appendChild: function (child: any) {
        child.parentElement = this;
        this.children.push(child);
        return child;
      },
      removeChild: function (child: any) {
        const i = this.children.indexOf(child);
        if (i !== -1) this.children.splice(i, 1);
        return child;
      },
      addEventListener: function (ev: string, fn: any) {
        if (!this.listeners[ev]) this.listeners[ev] = [];
        this.listeners[ev].push(fn);
      },
      removeEventListener: function (ev: string, fn: any) {
        if (!this.listeners[ev]) return;
        this.listeners[ev] = this.listeners[ev].filter((f: any) => f !== fn);
      },
      querySelector: function (sel: string) {
        if (sel.startsWith('#') && this.id === sel.slice(1)) return this;
        if (sel.startsWith('.')) {
          const classes = sel.split('.').filter(Boolean);
          if (classes.length > 0 && classes.every((c: string) => this.classList.contains(c))) return this;
        }
        if (sel.startsWith('[')) {
          const match = sel.match(/\[([a-zA-Z0-9_-]+)(?:=["']?([^"']*)["']?)?\]/);
          if (match) {
            const attr = match[1];
            const val = match[2];
            if (attr.startsWith('data-')) {
              const key = attr.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
              if (val === undefined && this.dataset[key] !== undefined) return this;
              if (this.dataset[key] === val) return this;
            }
          }
        }
        for (const child of this.children) {
          const found = child.querySelector ? child.querySelector(sel) : null;
          if (found) return found;
        }
        return null;
      },
      querySelectorAll: function (sel: string) {
        const res: any[] = [];
        if (sel.startsWith('#') && this.id === sel.slice(1)) res.push(this);
        if (sel.startsWith('.')) {
          const classes = sel.split('.').filter(Boolean);
          if (classes.length > 0 && classes.every((c: string) => this.classList.contains(c))) res.push(this);
        }
        if (sel.startsWith('[')) {
          const match = sel.match(/\[([a-zA-Z0-9_-]+)(?:=["']?([^"']*)["']?)?\]/);
          if (match) {
            const attr = match[1];
            const val = match[2];
            if (attr.startsWith('data-')) {
              const key = attr.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
              if (val === undefined && this.dataset[key] !== undefined) res.push(this);
              if (this.dataset[key] === val) res.push(this);
            }
          }
        }
        for (const child of this.children) {
          if (child.querySelectorAll) res.push(...child.querySelectorAll(sel));
        }
        return res;
      },
      scrollIntoView: function () {},
    };
    return el;
  }

  /**
   * 自动检测并注入暗色代码终端完整 DOM 骨架
   */
  private static ensureTerminalSkeleton(root: HTMLElement): void {
    if (!root) return;

    // 如果已经存在代码行容器，说明已在 HTML 模板中手写预置，无需再次注入
    if (root.querySelector('#code-lines-wrapper')) {
      return;
    }

    // 查找目标挂载容器（按优先级匹配常见占位符）
    let targetContainer: any = root.querySelector(
      '#dsp-terminal-container, #code-terminal-card, .dark-code-terminal-container, [data-code-terminal], [data-code-panel], [id$="-terminal-mount"], [id*="terminal-mount"], [id*="terminal-container"]'
    );

    if (!targetContainer) {
      const rootId = root.id || '';
      if (
        rootId === 'dsp-terminal-container' ||
        rootId === 'code-terminal-card' ||
        rootId.includes('terminal-mount') ||
        rootId.includes('terminal-container') ||
        root.classList?.contains?.('dark-code-terminal-container') ||
        (typeof root.hasAttribute === 'function' &&
          (root.hasAttribute('data-code-terminal') || root.hasAttribute('data-code-panel')))
      ) {
        targetContainer = root;
      }
    }

    // 如果仍未找到，尝试在右侧布局区域开头自动创建并插入
    if (!targetContainer) {
      const rightSection = root.querySelector(
        '.mz-right-section, .fr-right-section, [class*="-right-section"], [class*="right-column"]'
      ) as any;
      if (rightSection) {
        targetContainer = DarkCodeTerminalPresenter.createSafeElement('div', 'code-terminal-card');
        targetContainer.style.flex = '1 1 62%';
        targetContainer.style.minHeight = '0';
        targetContainer.style.display = 'flex';
        targetContainer.style.flexDirection = 'column';
        rightSection.insertBefore(targetContainer, rightSection.firstChild);
      }
    }

    // 兜底：如果 root 自身无子节点或为独立容器，直接注入 root
    if (!targetContainer) {
      targetContainer = root;
    }

    // 注入标准暗色终端 DOM (采用原生 DOM API 构建，无缝兼容真实 DOM 与轻量单元测试环境)
    const autoFrame = DarkCodeTerminalPresenter.createSafeElement('div');
    autoFrame.className = 'dark-terminal-auto-frame';

    const header = DarkCodeTerminalPresenter.createSafeElement('div');
    header.className = 'terminal-auto-header';

    const tabGroup = DarkCodeTerminalPresenter.createSafeElement('div');
    tabGroup.className = 'tab-group';
    tabGroup.style.cssText =
      'display: flex; align-items: center; gap: 2px; background: #020617; padding: 2px; border-radius: 8px; border: 1px solid #1e293b; flex-shrink: 0;';

    const btnTabCode = DarkCodeTerminalPresenter.createSafeElement('button', 'btn-tab-code');
    btnTabCode.className = 'tab-item active';
    btnTabCode.innerHTML = `${TAB_CODE_ICON}<span>代码调试</span>`;
    btnTabCode.style.cssText =
      'background: #2563eb; border: none; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 6px; cursor: pointer; transition: all 0.15s; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 1px 2px rgba(0,0,0,0.25);';

    const btnTabProblem = DarkCodeTerminalPresenter.createSafeElement('button', 'btn-tab-problem');
    btnTabProblem.className = 'tab-item';
    btnTabProblem.innerHTML = `${TAB_PROBLEM_ICON}<span>题目描述</span>`;
    btnTabProblem.style.cssText =
      'background: transparent; border: none; color: #94a3b8; font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 6px; cursor: pointer; transition: all 0.15s; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px;';

    const btnTabAnalysis = DarkCodeTerminalPresenter.createSafeElement('button', 'btn-tab-analysis');
    btnTabAnalysis.className = 'tab-item';
    btnTabAnalysis.innerHTML = `${TAB_ANALYSIS_ICON}<span>递推精讲</span>`;
    btnTabAnalysis.style.cssText =
      'background: transparent; border: none; color: #94a3b8; font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 6px; cursor: pointer; transition: all 0.15s; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px;';

    tabGroup.appendChild(btnTabCode);
    tabGroup.appendChild(btnTabProblem);
    tabGroup.appendChild(btnTabAnalysis);
    header.appendChild(tabGroup);

    const langGroup = DarkCodeTerminalPresenter.createSafeElement('div', 'code-lang-tabs');
    langGroup.className = 'lang-group';
    const langs = [
      { id: 'java', label: 'Java' },
      { id: 'cpp', label: 'C++' },
      { id: 'python', label: 'Python' },
      { id: 'javascript', label: 'JS' },
    ];
    langs.forEach((l, idx) => {
      const btn = DarkCodeTerminalPresenter.createSafeElement('button');
      btn.className = `lang-btn ${idx === 0 ? 'active' : ''}`;
      btn.dataset.lang = l.id;
      btn.textContent = l.label;
      langGroup.appendChild(btn);
    });
    header.appendChild(langGroup);

    const fontTools = DarkCodeTerminalPresenter.createSafeElement('div');
    fontTools.className = 'font-tools';
    fontTools.style.display = 'flex';
    fontTools.style.alignItems = 'center';
    fontTools.style.gap = '6px';
    fontTools.style.flexShrink = '0';

    const btnCopy = DarkCodeTerminalPresenter.createSafeElement('button', 'btn-code-copy');
    btnCopy.className = 'btn-code-copy';
    btnCopy.title = '复制当前完整代码';
    btnCopy.textContent = '复制';
    fontTools.appendChild(btnCopy);

    const fontScaler = DarkCodeTerminalPresenter.createSafeElement('div');
    fontScaler.className = 'font-scaler';
    const btnFontDec = DarkCodeTerminalPresenter.createSafeElement('button', 'btn-code-font-dec');
    btnFontDec.textContent = 'A-';
    const fontIndicator = DarkCodeTerminalPresenter.createSafeElement('span', 'code-font-indicator');
    fontIndicator.className = 'font-indicator';
    fontIndicator.textContent = '12';
    const btnFontInc = DarkCodeTerminalPresenter.createSafeElement('button', 'btn-code-font-inc');
    btnFontInc.textContent = 'A+';
    fontScaler.appendChild(btnFontDec);
    fontScaler.appendChild(fontIndicator);
    fontScaler.appendChild(btnFontInc);
    fontTools.appendChild(fontScaler);

    const macDots = DarkCodeTerminalPresenter.createSafeElement('div');
    macDots.className = 'mac-dots';
    macDots.style.display = 'flex';
    macDots.style.alignItems = 'center';
    macDots.style.gap = '4px';
    ['#ef4444', '#eab308', '#22c55e'].forEach((col) => {
      const dot = DarkCodeTerminalPresenter.createSafeElement('span');
      dot.style.width = '7px';
      dot.style.height = '7px';
      dot.style.borderRadius = '999px';
      dot.style.background = col;
      dot.style.display = 'inline-block';
      macDots.appendChild(dot);
    });
    fontTools.appendChild(macDots);
    header.appendChild(fontTools);

    autoFrame.appendChild(header);

    const codeView = DarkCodeTerminalPresenter.createSafeElement('div', 'code-view-container');
    const terminalBody = DarkCodeTerminalPresenter.createSafeElement('div');
    terminalBody.className = 'terminal-body';
    const codeLinesWrapper = DarkCodeTerminalPresenter.createSafeElement('div', 'code-lines-wrapper');
    terminalBody.appendChild(codeLinesWrapper);
    codeView.appendChild(terminalBody);
    autoFrame.appendChild(codeView);

    const problemView = DarkCodeTerminalPresenter.createSafeElement('div', 'problem-view-container');
    problemView.style.display = 'none';
    autoFrame.appendChild(problemView);

    const analysisView = DarkCodeTerminalPresenter.createSafeElement('div', 'analysis-view-container');
    analysisView.style.display = 'none';
    autoFrame.appendChild(analysisView);

    const varsWatch = DarkCodeTerminalPresenter.createSafeElement('div', 'vars-watch');
    varsWatch.style.display = 'none';
    autoFrame.appendChild(varsWatch);

    const skeletonHtml = `
      <div class="dark-terminal-auto-frame" style="background: #0f172a; border-radius: 16px; border: 1px solid #1e293b; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); display: flex; flex-direction: column; overflow: hidden; width: 100%; height: 100%; min-height: 0; flex: 1;">
        <div class="terminal-auto-header" style="background: #1e293b; padding: 4px 8px; display: flex; align-items: center; justify-content: space-between; gap: 6px; border-bottom: 1px solid #334155; flex-shrink: 0; min-width: 0; overflow-x: auto; width: 100%; box-sizing: border-box;">
          <div class="tab-group" style="display: flex; align-items: center; gap: 2px; background: #020617; padding: 2px; border-radius: 8px; border: 1px solid #1e293b; flex-shrink: 0;">
            <button id="btn-tab-code" class="tab-item active" style="background: #2563eb; border: none; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 6px; cursor: pointer; transition: all 0.15s; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);">${TAB_CODE_ICON}<span>代码调试</span></button>
            <button id="btn-tab-problem" class="tab-item" style="background: transparent; border: none; color: #94a3b8; font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 6px; cursor: pointer; transition: all 0.15s; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px;">${TAB_PROBLEM_ICON}<span>题目描述</span></button>
            <button id="btn-tab-analysis" class="tab-item" style="background: transparent; border: none; color: #94a3b8; font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 6px; cursor: pointer; transition: all 0.15s; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px;">${TAB_ANALYSIS_ICON}<span>递推精讲</span></button>
          </div>
          <div class="lang-group" id="code-lang-tabs" style="display: flex; align-items: center; background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 2px; flex-shrink: 0;">
            <button class="lang-btn active" data-lang="java" style="background: #334155; border: none; color: #93c5fd; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; cursor: pointer;">Java</button>
            <button class="lang-btn" data-lang="cpp" style="background: transparent; border: none; color: #64748b; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; cursor: pointer;">C++</button>
            <button class="lang-btn" data-lang="python" style="background: transparent; border: none; color: #64748b; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; cursor: pointer;">Python</button>
            <button class="lang-btn" data-lang="javascript" style="background: transparent; border: none; color: #64748b; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; cursor: pointer;">JS</button>
          </div>
          <div class="font-tools" style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
            <button id="btn-code-copy" title="复制当前完整代码" style="background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 2px 7px; color: #94a3b8; font-size: 10px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; transition: all 0.15s ease; white-space: nowrap; user-select: none;">
              <span class="copy-icon" style="display: inline-flex; align-items: center;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </span>
              <span class="copy-text">复制</span>
            </button>
            <div class="font-scaler" style="display: flex; align-items: center; gap: 2px; background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 1px 4px;">
              <button id="btn-code-font-dec" title="缩小代码字号" style="background: transparent; border: none; color: #94a3b8; font-size: 9px; font-weight: 700; cursor: pointer; padding: 1px 3px;">A-</button>
              <span id="code-font-indicator" class="font-indicator" style="font-size: 9.5px; font-family: monospace; color: #93c5fd; min-width: 14px; text-align: center;">12</span>
              <button id="btn-code-font-inc" title="放大代码字号" style="background: transparent; border: none; color: #94a3b8; font-size: 9px; font-weight: 700; cursor: pointer; padding: 1px 3px;">A+</button>
            </div>
            <div class="window-dots" style="display: flex; align-items: center; gap: 4px;">
              <span style="width: 7px; height: 7px; border-radius: 999px; background: #ef4444; display: inline-block;"></span>
              <span style="width: 7px; height: 7px; border-radius: 999px; background: #eab308; display: inline-block;"></span>
              <span style="width: 7px; height: 7px; border-radius: 999px; background: #22c55e; display: inline-block;"></span>
            </div>
          </div>
        </div>
        <div id="code-view-container" style="display: flex; flex-direction: column; overflow: hidden; width: 100%; flex: 1; min-height: 0; box-sizing: border-box;">
          <div class="terminal-body" style="flex: 1; min-height: 0; width: 100%; padding: 10px 10px 4px 10px; overflow-y: auto; overflow-x: auto; font-family: 'JetBrains Mono', Consolas, Monaco, monospace; font-size: 12px; line-height: 1.6; color: #cbd5e1; box-sizing: border-box;">
            <div id="code-lines-wrapper" style="min-width: 0; width: 100%;"></div>
          </div>
          <div id="code-vars-watch" class="code-vars-watch-container" style="display: none; border-top: 1px solid rgba(51, 65, 85, 0.5); padding: 5px 12px; background: rgba(15, 23, 42, 0.95); flex-wrap: wrap; gap: 6px; font-size: 11px; flex-shrink: 0; min-height: 28px; align-items: center;"></div>
        </div>
        <div id="problem-view-container" style="display: none; flex: 1; min-height: 0; padding: 14px; overflow-y: auto; background: #0f172a; color: #cbd5e1; font-size: 12px; line-height: 1.6;"></div>
        <div id="analysis-view-container" style="display: none; flex: 1; min-height: 0; padding: 14px; overflow-y: auto; background: #0f172a; color: #cbd5e1; font-size: 12px; line-height: 1.6;"></div>
        <div id="vars-watch" style="display: none;"></div>
      </div>
    `;
    targetContainer.innerHTML = skeletonHtml;

    if (typeof targetContainer.appendChild === 'function') {
      const testWrapper = targetContainer.querySelector ? targetContainer.querySelector('#code-lines-wrapper') : null;
      if (!testWrapper) {
        targetContainer.appendChild(autoFrame);
      }
    }

    if (!root.querySelector('#modal-problem')) {
      const modalEl = DarkCodeTerminalPresenter.createSafeElement('div', 'modal-problem');
      modalEl.className = 'modal-backdrop hidden';
      modalEl.style.cssText =
        'position: fixed; inset: 0; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); z-index: 99999; display: none; align-items: center; justify-content: center; box-sizing: border-box; padding: 20px;';

      const modalContent = DarkCodeTerminalPresenter.createSafeElement('div');
      modalContent.className = 'modal-content';
      modalContent.style.cssText =
        'background: #1e293b; border: 1px solid #334155; border-radius: 12px; max-width: 800px; width: 90%; max-height: 85vh; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); overflow: hidden; color: #f8fafc;';

      const modalHeader = DarkCodeTerminalPresenter.createSafeElement('div');
      modalHeader.className = 'modal-header';
      modalHeader.style.cssText =
        'display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid #334155; color: #f8fafc; font-weight: 600; font-size: 15px; flex-shrink: 0;';

      const modalTitle = DarkCodeTerminalPresenter.createSafeElement('div');
      modalTitle.className = 'modal-title';
      modalTitle.textContent = '📋 算法原理与题目说明';

      const btnClose = DarkCodeTerminalPresenter.createSafeElement('button', 'btn-close-problem-modal');
      btnClose.textContent = '✕';
      btnClose.style.cssText =
        'background: transparent; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 4px; line-height: 1; transition: color 0.15s;';
      btnClose.onmouseenter = () => (btnClose.style.color = '#ffffff');
      btnClose.onmouseleave = () => (btnClose.style.color = '#94a3b8');

      modalHeader.appendChild(modalTitle);
      modalHeader.appendChild(btnClose);
      modalContent.appendChild(modalHeader);

      const modalBody = DarkCodeTerminalPresenter.createSafeElement('div', 'modal-problem-body');
      modalBody.style.cssText =
        'padding: 20px; overflow-y: auto; color: #cbd5e1; font-size: 13px; line-height: 1.6; flex: 1; min-height: 0;';

      modalContent.appendChild(modalBody);
      modalEl.appendChild(modalContent);
      if (typeof root.appendChild === 'function') {
        root.appendChild(modalEl);
      }
    }
  }
}
