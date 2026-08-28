/**
 * 统一暗色代码终端表现器深模块 (DarkCodeTerminalPresenter)
 * 遵循深模块 (Deep Module) 与外观模式 (Facade Pattern) 原则：
 * 对外暴露极简高杠杆接口，彻底封装内部状态：
 *   1. Tab 切换 (代码调试 / 题目描述 / 递推精讲)
 *   2. 4 语种切换 (Java / C++ / Python / JS)
 *   3. 字号缩放器 (A- / A+) 与 macOS 红黄绿窗口圆点
 *   4. 单步代码行高亮与平滑滚动
 *   5. 力扣原题模态弹窗打开与关闭
 */

import type { HighlightTarget } from '../code-panel';

export interface DarkCodeTerminalConfig {
  /** 4 语种源码映射表，如 { java: string[], cpp: string[], python: string[], javascript: string[] } */
  codeLanguages: Record<string, string[]>;
  /** 题目完整描述 HTML 内容（支持示例、约束） */
  problemHtml?: string;
  /** 算法核心要点/回溯五部曲精讲 HTML 内容 */
  analysisHtml?: string;
  /** 默认语言（默认 'java'） */
  initialLang?: string;
  /** 默认字号（默认 12） */
  fontSize?: number;
  /** 语言切换回调（可选） */
  onLanguageChange?: (lang: string) => void;
}

export interface DarkCodeTerminalInstance {
  /** 高亮指定物理行或多行目标 */
  highlightLine(target: HighlightTarget | null | undefined): void;
  /** 手动切换编程语言 */
  switchLanguage(lang: string): void;
  /** 手动切换看板 Tab */
  switchTab(tab: 'code' | 'problem' | 'analysis'): void;
  /** 获取当前编程语言 */
  getCurrentLanguage(): string;
  /** 获取当前字号 */
  getFontSize(): number;
  /** 销毁实例并解绑事件 */
  destroy(): void;
}

export class DarkCodeTerminalPresenter {
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

    // 1. DOM 节点查询
    const btnTabCode = root.querySelector('#btn-tab-code') as HTMLElement | null;
    const btnTabProblem = root.querySelector('#btn-tab-problem') as HTMLElement | null;
    const btnTabAnalysis = root.querySelector('#btn-tab-analysis') as HTMLElement | null;

    const viewCode = root.querySelector('#code-view-container') as HTMLElement | null;
    const viewProblem = root.querySelector('#problem-view-container') as HTMLElement | null;
    const viewAnalysis = root.querySelector('#analysis-view-container') as HTMLElement | null;

    const codeWrapper = root.querySelector('#code-lines-wrapper') as HTMLElement | null;
    const langBtns = root.querySelectorAll<HTMLButtonElement>('#code-lang-tabs .co-lang-btn, #code-lang-tabs .cs-lang-btn, #code-lang-tabs .lang-btn');

    const btnFontDec = root.querySelector('#btn-code-font-dec') as HTMLElement | null;
    const btnFontInc = root.querySelector('#btn-code-font-inc') as HTMLElement | null;
    const fontIndicator = root.querySelector('#code-font-indicator') as HTMLElement | null;

    const modalProblem = root.querySelector('#modal-problem') as HTMLElement | null;
    const modalBody = root.querySelector('#modal-problem-body') as HTMLElement | null;
    const btnOpenModal = root.querySelector('#btn-open-problem-modal') as HTMLElement | null;
    const btnCloseModal = root.querySelector('#btn-close-problem-modal') as HTMLElement | null;

    // 2. 静态内容注入
    if (viewProblem && config.problemHtml) {
      viewProblem.innerHTML = config.problemHtml;
    }
    if (modalBody && config.problemHtml) {
      modalBody.innerHTML = config.problemHtml;
    }
    if (viewAnalysis && config.analysisHtml) {
      viewAnalysis.innerHTML = config.analysisHtml;
    }

    // 3. 辅助函数：HTML 转义
    const escapeHtml = (str: string): string => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };

    // 4. 渲染代码行
    const renderCodeLines = () => {
      if (!codeWrapper) return;
      const lines = config.codeLanguages[currentLang] || config.codeLanguages['java'] || [];
      codeWrapper.innerHTML = lines
        .map((line, idx) => {
          const lineNum = idx + 1;
          return `
            <div class="code-line" data-line="${lineNum}" style="font-size: ${codeFontSize}px;">
              <span class="code-line-num">${lineNum}</span>
              <span class="code-line-text">${escapeHtml(line)}</span>
            </div>
          `;
        })
        .join('');

      if (activeLineTarget != null) {
        highlightLineInternal(activeLineTarget);
      }
    };

    // 5. 高亮代码行逻辑
    const highlightLineInternal = (target: HighlightTarget | null | undefined) => {
      activeLineTarget = target;
      if (!codeWrapper) return;

      codeWrapper.querySelectorAll('.code-line').forEach((el) => el.classList.remove('active'));

      if (target == null) return;

      if (typeof target === 'number') {
        const lineEl = codeWrapper.querySelector(`.code-line[data-line="${target}"]`) as HTMLElement | null;
        if (lineEl) {
          lineEl.classList.add('active');
          if (typeof lineEl.scrollIntoView === 'function') {
            lineEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        }
      } else if (typeof target === 'string') {
        const num = parseInt(target, 10);
        if (!isNaN(num)) {
          const lineEl = codeWrapper.querySelector(`.code-line[data-line="${num}"]`) as HTMLElement | null;
          if (lineEl) {
            lineEl.classList.add('active');
            if (typeof lineEl.scrollIntoView === 'function') {
              lineEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
          }
        }
      } else if (typeof target === 'object') {
        if ('from' in target && 'to' in target && typeof target.from === 'number' && typeof target.to === 'number') {
          for (let l = target.from; l <= target.to; l++) {
            const lineEl = codeWrapper.querySelector(`.code-line[data-line="${l}"]`);
            lineEl?.classList.add('active');
          }
          const firstEl = codeWrapper.querySelector(`.code-line[data-line="${target.from}"]`) as HTMLElement | null;
          if (firstEl && typeof firstEl.scrollIntoView === 'function') {
            firstEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        } else if (Array.isArray(target)) {
          target.forEach((l) => {
            const lineEl = codeWrapper.querySelector(`.code-line[data-line="${l}"]`);
            lineEl?.classList.add('active');
          });
          if (target.length > 0) {
            const firstEl = codeWrapper.querySelector(`.code-line[data-line="${target[0]}"]`) as HTMLElement | null;
            if (firstEl && typeof firstEl.scrollIntoView === 'function') {
              firstEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
          }
        }
      }
    };

    // 6. Tab 切换函数
    const switchTabInternal = (tab: 'code' | 'problem' | 'analysis') => {
      [btnTabCode, btnTabProblem, btnTabAnalysis].forEach((b) => b?.classList.remove('active'));
      [viewCode, viewProblem, viewAnalysis].forEach((v) => {
        if (v) v.style.display = 'none';
      });

      if (tab === 'code') {
        btnTabCode?.classList.add('active');
        if (viewCode) viewCode.style.display = 'flex';
      } else if (tab === 'problem') {
        btnTabProblem?.classList.add('active');
        if (viewProblem) viewProblem.style.display = 'flex';
      } else if (tab === 'analysis') {
        btnTabAnalysis?.classList.add('active');
        if (viewAnalysis) viewAnalysis.style.display = 'flex';
      }
    };

    // 7. 语言切换函数
    const switchLanguageInternal = (lang: string) => {
      currentLang = lang;
      langBtns.forEach((btn) => {
        if (btn.dataset.lang === lang) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      renderCodeLines();
      if (config.onLanguageChange) {
        config.onLanguageChange(lang);
      }
    };

    // 8. 绑定事件监听器
    const onTabCodeClick = () => switchTabInternal('code');
    const onTabProblemClick = () => switchTabInternal('problem');
    const onTabAnalysisClick = () => switchTabInternal('analysis');

    btnTabCode?.addEventListener('click', onTabCodeClick);
    btnTabProblem?.addEventListener('click', onTabProblemClick);
    btnTabAnalysis?.addEventListener('click', onTabAnalysisClick);

    const onLangClick = (e: Event) => {
      const target = (e.currentTarget as HTMLElement)?.dataset.lang;
      if (target) switchLanguageInternal(target);
    };
    langBtns.forEach((btn) => btn.addEventListener('click', onLangClick));

    // 字号缩放事件
    const onFontDecClick = () => {
      codeFontSize = Math.max(9, codeFontSize - 1);
      if (fontIndicator) fontIndicator.textContent = String(codeFontSize);
      codeWrapper?.querySelectorAll<HTMLElement>('.code-line').forEach((el) => {
        el.style.fontSize = `${codeFontSize}px`;
      });
    };
    const onFontIncClick = () => {
      codeFontSize = Math.min(18, codeFontSize + 1);
      if (fontIndicator) fontIndicator.textContent = String(codeFontSize);
      codeWrapper?.querySelectorAll<HTMLElement>('.code-line').forEach((el) => {
        el.style.fontSize = `${codeFontSize}px`;
      });
    };
    btnFontDec?.addEventListener('click', onFontDecClick);
    btnFontInc?.addEventListener('click', onFontIncClick);

    // 模态弹窗事件
    const onOpenModalClick = () => modalProblem?.classList.remove('hidden');
    const onCloseModalClick = () => modalProblem?.classList.add('hidden');
    btnOpenModal?.addEventListener('click', onOpenModalClick);
    btnCloseModal?.addEventListener('click', onCloseModalClick);

    // 初始渲染
    if (fontIndicator) fontIndicator.textContent = String(codeFontSize);
    renderCodeLines();

    return {
      highlightLine: (target) => highlightLineInternal(target),
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
        btnOpenModal?.removeEventListener('click', onOpenModalClick);
        btnCloseModal?.removeEventListener('click', onCloseModalClick);
      },
    };
  }
}
