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

// SRP 拆分：类型契约 / 高亮归一化 / DOM 骨架见同目录 dark-code-terminal-*.ts
export * from './dark-code-terminal-types';
import {
  createSafeElement as createSafeElementImpl,
  ensureTerminalSkeleton,
} from './dark-code-terminal-dom';
import { normalizeHighlightTarget as normalizeHighlightTargetImpl } from './dark-code-terminal-highlight';
import type { DarkCodeTerminalConfig, DarkCodeTerminalInstance, HighlightTarget, NormalizedHighlight } from './dark-code-terminal-types';
import { TAB_CODE_ICON, TAB_PROBLEM_ICON, TAB_ANALYSIS_ICON } from './dark-code-terminal-types';

export class DarkCodeTerminalPresenter {
  /**
   * 纯函数：将多态高亮目标（数字、字符串、数组、区间、多语言字典）统一归一化为物理行号数组
   */
  public static normalizeHighlightTarget(
    target: HighlightTarget | null | undefined,
    currentLang: string = 'java',
    codeModel?: CodePresentationModel
  ): NormalizedHighlight {
    return normalizeHighlightTargetImpl(target, currentLang, codeModel);
  }

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
  ensureTerminalSkeleton(root);

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
    return createSafeElementImpl(tag, id);
  }
}
