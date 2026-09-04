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
import { highlightTokens } from '../code-highlighter';
import {
  CodePresentationModel,
  type KeyPointsData,
  type ProblemDetail,
} from '../code-presentation-model';
import { ProblemAnalysisViewer } from '../problem-analysis-viewer';

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
  /** 同步更新变量监视面板 */
  updateVars(vars?: StepVar[]): void;
  /** 手动切换编程语言 */
  switchLanguage(lang: string): void;
  /** 手动切换看板 Tab */
  switchTab(tab: 'code' | 'problem' | 'analysis'): void;
  /** 获取当前编程语言 */
  getCurrentLanguage(): string;
  /** 获取当前字号 */
  getFontSize(): number;
  /** 语义与代码多语言模型 */
  codeModel?: CodePresentationModel;
  /** 销毁实例并解绑事件 */
  destroy(): void;
}

export interface NormalizedHighlight {
  lines: number[];
  focusLine?: number;
}

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
        destroy: () => {},
      };
    }

    let currentLang = config.initialLang || 'java';
    let codeFontSize = config.fontSize || 12;
    let activeLineTarget: HighlightTarget | null | undefined = null;

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
      if (config.problemHtml) {
        modalBody.innerHTML = config.problemHtml;
      } else if (config.problemDetail) {
        ProblemAnalysisViewer.renderProblemDetail(modalBody, config.problemDetail);
      }
    }
    if (viewAnalysis) {
      if (config.analysisHtml) {
        viewAnalysis.innerHTML = config.analysisHtml;
      } else if (config.keyPoints) {
        ProblemAnalysisViewer.renderKeyPoints(viewAnalysis, config.keyPoints);
      }
    }

    // 4. 渲染代码行 (结合单趟词法扫描进行 Token 级语法高亮)
    const renderCodeLines = () => {
      if (!codeWrapper) return;
      const lines = codeModel.getLines(currentLang);
      const linesHtml = lines
        .map((line, idx) => {
          const lineNum = idx + 1;
          const highlightedCode = highlightTokens(line, currentLang);
          return `
            <div class="code-line algo-code-line" data-line="${lineNum}" style="font-size: ${codeFontSize}px; padding: 1px 6px; border-radius: 4px; display: flex; align-items: flex-start; gap: 12px; white-space: pre; border-left: 3px solid transparent; transition: background-color 0.15s ease, border-color 0.15s ease;">
              <span class="code-line-num algo-code-line-number" style="color: #475569; font-size: 10.5px; min-width: 20px; text-align: right; user-select: none;">${lineNum}</span>
              <span class="code-line-text algo-code-line-text">${highlightedCode}</span>
            </div>
          `;
        })
        .join('');

      codeWrapper.innerHTML = linesHtml;

      // 若处于 Mock DOM 环境（children 为普通 Array），同步重构子节点供 querySelectorAll 查询
      if (Array.isArray((codeWrapper as any).children)) {
        (codeWrapper as any).children = [];
        lines.forEach((line, idx) => {
          const lineNum = idx + 1;
          const lineEl = DarkCodeTerminalPresenter.createSafeElement('div');
          lineEl.className = 'code-line algo-code-line';
          lineEl.dataset.line = String(lineNum);
          lineEl.style.fontSize = `${codeFontSize}px`;
          lineEl.style.padding = '1px 6px';
          lineEl.style.borderRadius = '4px';
          lineEl.style.display = 'flex';
          lineEl.style.alignItems = 'flex-start';
          lineEl.style.gap = '12px';
          lineEl.style.whiteSpace = 'pre';
          lineEl.style.borderLeft = '3px solid transparent';

          const numEl = DarkCodeTerminalPresenter.createSafeElement('span');
          numEl.className = 'code-line-num algo-code-line-number';
          numEl.textContent = String(lineNum);
          lineEl.appendChild(numEl);

          const textEl = DarkCodeTerminalPresenter.createSafeElement('span');
          textEl.className = 'code-line-text algo-code-line-text';
          textEl.innerHTML = highlightTokens(line, currentLang);
          textEl.textContent = line;
          lineEl.appendChild(textEl);

          if (typeof codeWrapper.appendChild === 'function') {
            codeWrapper.appendChild(lineEl);
          } else {
            (codeWrapper as any).children.push(lineEl);
          }
        });
      }

      if (activeLineTarget != null) {
        highlightLineInternal(activeLineTarget);
      }
    };

    // 5. 高亮代码行逻辑
    const highlightLineInternal = (target: HighlightTarget | null | undefined) => {
      activeLineTarget = target;
      if (!codeWrapper) return;

      codeWrapper.querySelectorAll<HTMLElement>('.code-line').forEach((el) => {
        el.classList.remove('active', 'active-line', 'is-active', 'is-context');
        el.style.backgroundColor = 'transparent';
        el.style.borderLeftColor = 'transparent';
        el.style.color = '#cbd5e1';
        el.style.fontWeight = 'normal';
      });

      if (target == null) return;

      const markLine = (lineEl: HTMLElement | null) => {
        if (!lineEl) return;
        lineEl.classList.add('active', 'active-line', 'is-active');
        lineEl.style.backgroundColor = 'rgba(37, 99, 235, 0.25)';
        lineEl.style.borderLeftColor = '#2563eb';
        lineEl.style.color = '#ffffff';
        lineEl.style.fontWeight = '700';
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
            const anchorLine = codeModel.resolveAnchorLine(t, currentLang);
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
            const anchorLine = codeModel.resolveAnchorLine((t as any).anchor, currentLang);
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
            // 多语言字典解包：根据当前激活语言优先匹配
            const dict = t as Record<string, any>;
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
            if (resolved != null) {
              applyTarget(resolved);
            }
          }
        }
      };

      applyTarget(target);
    };

    // 6. 切换语言
    const switchLanguageInternal = (lang: string) => {
      currentLang = lang;
      codeModel.setCurrentLanguage(lang);
      langBtns.forEach((btn) => {
        const bLang = btn.dataset.lang;
        const isActive = bLang === currentLang || (currentLang === 'javascript' && bLang === 'js');
        if (isActive) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
        btn.style.background = isActive ? '#334155' : 'transparent';
        btn.style.color = isActive ? '#93c5fd' : '#64748b';
      });
      renderCodeLines();
      if (config.onLanguageChange) {
        config.onLanguageChange(currentLang);
      }
    };

    // 7. 切换 Tab 看板
    const switchTabInternal = (tab: 'code' | 'problem' | 'analysis') => {
      const setTabStyle = (btn: HTMLElement | null, isActive: boolean) => {
        if (!btn) return;
        if (isActive) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
        btn.style.background = isActive ? '#2563eb' : 'transparent';
        btn.style.color = isActive ? '#ffffff' : '#94a3b8';
      };

      setTabStyle(btnTabCode, tab === 'code');
      setTabStyle(btnTabProblem, tab === 'problem');
      setTabStyle(btnTabAnalysis, tab === 'analysis');

      if (viewCode) viewCode.style.display = tab === 'code' ? 'flex' : 'none';
      if (viewProblem) viewProblem.style.display = tab === 'problem' ? 'flex' : 'none';
      if (viewAnalysis) viewAnalysis.style.display = tab === 'analysis' ? 'flex' : 'none';
    };

    // 8. 调整代码字号
    const updateFontSize = (delta: number) => {
      codeFontSize = Math.max(9, Math.min(20, codeFontSize + delta));
      if (fontIndicator) fontIndicator.textContent = String(codeFontSize);
      renderCodeLines();
    };

    // 事件绑定
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

    const onFontDecClick = () => updateFontSize(-1);
    const onFontIncClick = () => updateFontSize(1);

    btnFontDec?.addEventListener('click', onFontDecClick);
    btnFontInc?.addEventListener('click', onFontIncClick);

    // 模态弹窗打开与关闭
    const onOpenModalClick = () => {
      if (modalProblem) {
        modalProblem.classList.remove('hidden');
        modalProblem.style.display = 'flex';
      }
    };
    const onCloseModalClick = () => {
      if (modalProblem) {
        modalProblem.classList.add('hidden');
        modalProblem.style.display = 'none';
      }
    };

    btnOpenModals.forEach((btn) => btn.addEventListener('click', onOpenModalClick));
    btnCloseModal?.addEventListener('click', onCloseModalClick);
    modalProblem?.addEventListener('click', (e) => {
      if (e.target === modalProblem) {
        onCloseModalClick();
      }
    });
    const onModalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalProblem && modalProblem.style.display !== 'none') {
        onCloseModalClick();
      }
    };
    if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
      document.addEventListener('keydown', onModalKeyDown);
    }

    // 首次渲染代码
    renderCodeLines();

    return {
      codeModel,
      highlightLine: (target) => highlightLineInternal(target),
      updateVars: (vars?: StepVar[]) => {
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
          .map((v) => {
            return `
              <div class="var-badge" style="display: inline-flex; align-items: center; gap: 4px; background: #1e293b; border: 1px solid #334155; padding: 1px 6px; border-radius: 4px;">
                <span class="var-name" style="color: #94a3b8; font-family: monospace;">${v.name}:</span>
                <span class="var-val" style="color: #38bdf8; font-weight: 700; font-family: monospace;">${v.value}</span>
              </div>
            `;
          })
          .join('');
      },
      switchLanguage: (lang) => switchLanguageInternal(lang),
      switchTab: (tab) => switchTabInternal(tab),
      getCurrentLanguage: () => currentLang,
      getFontSize: () => codeFontSize,
      destroy: () => {
        btnTabCode?.removeEventListener('click', onTabCodeClick);
        btnTabProblem?.removeEventListener('click', onTabProblemClick);
        btnTabAnalysis?.removeEventListener('click', onTabAnalysisClick);
        langBtns.forEach((btn) => btn.removeEventListener('click', onLangClick));
        btnFontDec?.removeEventListener('click', onFontDecClick);
        btnFontInc?.removeEventListener('click', onFontIncClick);
        btnOpenModals.forEach((btn) => btn.removeEventListener('click', onOpenModalClick));
        btnCloseModal?.removeEventListener('click', onCloseModalClick);
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
        add: function (...cls: string[]) {
          cls.forEach((c) => this._classes.add(c));
          el.className = Array.from(this._classes).join(' ');
        },
        remove: function (...cls: string[]) {
          cls.forEach((c) => this._classes.delete(c));
          el.className = Array.from(this._classes).join(' ');
        },
        contains: function (c: string) {
          return this._classes.has(c);
        },
        toggle: function (c: string, force?: boolean) {
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
        if (sel.startsWith('.') && this.classList.contains(sel.slice(1))) return this;
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
        if (sel.startsWith('.') && this.classList.contains(sel.slice(1))) res.push(this);
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
    const btnTabCode = DarkCodeTerminalPresenter.createSafeElement('button', 'btn-tab-code');
    btnTabCode.className = 'tab-item active';
    btnTabCode.textContent = '💻 代码调试';
    const btnTabProblem = DarkCodeTerminalPresenter.createSafeElement('button', 'btn-tab-problem');
    btnTabProblem.className = 'tab-item';
    btnTabProblem.textContent = '📋 题目描述';
    const btnTabAnalysis = DarkCodeTerminalPresenter.createSafeElement('button', 'btn-tab-analysis');
    btnTabAnalysis.className = 'tab-item';
    btnTabAnalysis.textContent = '💡 算法精讲';
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
      <div class="dark-terminal-auto-frame" style="background: #0f172a; border-radius: 16px; border: 1px solid #1e293b; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; width: 100%; height: 100%;">
        <div class="terminal-auto-header" style="background: #1e293b; padding: 4px 8px; display: flex; align-items: center; justify-content: space-between; gap: 6px; border-bottom: 1px solid #334155; flex-shrink: 0; min-width: 0; overflow-x: auto; width: 100%; box-sizing: border-box;">
          <div class="tab-group" style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
            <button id="btn-tab-code" class="tab-item active" style="background: #2563eb; border: none; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; cursor: pointer; transition: all 0.15s; white-space: nowrap;">💻 代码调试</button>
            <button id="btn-tab-problem" class="tab-item" style="background: transparent; border: none; color: #94a3b8; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; cursor: pointer; transition: all 0.15s; white-space: nowrap;">📋 题目描述</button>
            <button id="btn-tab-analysis" class="tab-item" style="background: transparent; border: none; color: #94a3b8; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; cursor: pointer; transition: all 0.15s; white-space: nowrap;">💡 算法精讲</button>
          </div>
          <div class="lang-group" id="code-lang-tabs" style="display: flex; align-items: center; background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 2px; flex-shrink: 0;">
            <button class="lang-btn active" data-lang="java" style="background: #334155; border: none; color: #93c5fd; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; cursor: pointer;">Java</button>
            <button class="lang-btn" data-lang="cpp" style="background: transparent; border: none; color: #64748b; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; cursor: pointer;">C++</button>
            <button class="lang-btn" data-lang="python" style="background: transparent; border: none; color: #64748b; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; cursor: pointer;">Python</button>
            <button class="lang-btn" data-lang="javascript" style="background: transparent; border: none; color: #64748b; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; cursor: pointer;">JS</button>
          </div>
          <div class="font-tools" style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
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
        <div id="code-view-container" style="flex: 1; min-height: 0; min-width: 0; width: 100%; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box;">
          <div class="terminal-body" style="flex: 1; min-height: 0; min-width: 0; width: 100%; padding: 10px; overflow-y: auto; overflow-x: auto; font-family: 'JetBrains Mono', Consolas, Monaco, monospace; font-size: 12px; line-height: 1.6; color: #cbd5e1; box-sizing: border-box;">
            <div id="code-lines-wrapper" style="min-width: 0; width: 100%;"></div>
          </div>
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
      root.appendChild(modalEl);
    }
  }
}
