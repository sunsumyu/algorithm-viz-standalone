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
import { highlightTokens } from '../code-highlighter';

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
    const langBtns = root.querySelectorAll<HTMLButtonElement>('#code-lang-tabs .co-lang-btn, #code-lang-tabs .cs-lang-btn, #code-lang-tabs .lang-btn, #code-lang-tabs .fr-lang-btn, #code-lang-tabs [data-lang]');

    const btnFontDec = root.querySelector('#btn-code-font-dec') as HTMLElement | null;
    const btnFontInc = root.querySelector('#btn-code-font-inc') as HTMLElement | null;
    const fontIndicator = root.querySelector('#code-font-indicator') as HTMLElement | null;

    const modalProblem = root.querySelector('#modal-problem') as HTMLElement | null;
    const modalBody = root.querySelector('#modal-problem-body') as HTMLElement | null;
    const modalTitle = root.querySelector('#modal-problem [class*="modal-title"], [class*="-modal-title"]') as HTMLElement | null;
    if (modalTitle) {
      modalTitle.innerHTML = '<span>📋 算法原理与题目说明</span>';
    }
    const btnOpenModals = root.querySelectorAll<HTMLElement>('#btn-open-problem-modal, #btn-problem-info, .btn-problem, [class*="-btn-problem"]');
    const btnCloseModal = root.querySelector('#btn-close-problem-modal') as HTMLElement | null;

    // 3. 静态内容注入
    if (viewProblem && config.problemHtml) {
      viewProblem.innerHTML = config.problemHtml;
    }
    if (modalBody && config.problemHtml) {
      modalBody.innerHTML = config.problemHtml;
    }
    if (viewAnalysis && config.analysisHtml) {
      viewAnalysis.innerHTML = config.analysisHtml;
    }

    // 4. 渲染代码行 (结合单趟词法扫描进行 Token 级语法高亮)
    const renderCodeLines = () => {
      if (!codeWrapper) return;
      const lines = config.codeLanguages[currentLang] || config.codeLanguages['java'] || [];
      codeWrapper.innerHTML = lines
        .map((line, idx) => {
          const lineNum = idx + 1;
          const highlightedCode = highlightTokens(line, currentLang);
          return `
            <div class="code-line" data-line="${lineNum}" style="font-size: ${codeFontSize}px; padding: 1px 6px; border-radius: 4px; display: flex; align-items: flex-start; gap: 12px; white-space: pre; border-left: 3px solid transparent; transition: background-color 0.15s ease, border-color 0.15s ease;">
              <span class="code-line-num" style="color: #475569; font-size: 10.5px; min-width: 20px; text-align: right; user-select: none;">${lineNum}</span>
              <span class="code-line-text">${highlightedCode}</span>
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

      codeWrapper.querySelectorAll<HTMLElement>('.code-line').forEach((el) => {
        el.classList.remove('active');
        el.classList.remove('active-line');
        el.style.backgroundColor = 'transparent';
        el.style.borderLeftColor = 'transparent';
        el.style.color = '#cbd5e1';
        el.style.fontWeight = 'normal';
      });

      if (target == null) return;

      const markLine = (lineEl: HTMLElement | null) => {
        if (!lineEl) return;
        lineEl.classList.add('active');
        lineEl.classList.add('active-line');
        lineEl.style.backgroundColor = 'rgba(37, 99, 235, 0.25)';
        lineEl.style.borderLeftColor = '#2563eb';
        lineEl.style.color = '#ffffff';
        lineEl.style.fontWeight = '700';
      };

      if (typeof target === 'number') {
        const lineEl = codeWrapper.querySelector(`.code-line[data-line="${target}"]`) as HTMLElement | null;
        if (lineEl) {
          markLine(lineEl);
          if (typeof lineEl.scrollIntoView === 'function') {
            lineEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        }
      } else if (typeof target === 'string') {
        const num = parseInt(target, 10);
        if (!isNaN(num)) {
          const lineEl = codeWrapper.querySelector(`.code-line[data-line="${num}"]`) as HTMLElement | null;
          if (lineEl) {
            markLine(lineEl);
            if (typeof lineEl.scrollIntoView === 'function') {
              lineEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
          }
        }
      } else if (typeof target === 'object') {
        if ('from' in target && 'to' in target && typeof target.from === 'number' && typeof target.to === 'number') {
          for (let l = target.from; l <= target.to; l++) {
            const lineEl = codeWrapper.querySelector(`.code-line[data-line="${l}"]`) as HTMLElement | null;
            markLine(lineEl);
          }
          const firstEl = codeWrapper.querySelector(`.code-line[data-line="${target.from}"]`) as HTMLElement | null;
          if (firstEl && typeof firstEl.scrollIntoView === 'function') {
            firstEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        } else if (Array.isArray(target)) {
          target.forEach((l) => {
            const lineEl = codeWrapper.querySelector(`.code-line[data-line="${l}"]`) as HTMLElement | null;
            markLine(lineEl);
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
      [btnTabCode, btnTabProblem, btnTabAnalysis].forEach((b) => {
        if (!b) return;
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = '#94a3b8';
      });
      [viewCode, viewProblem, viewAnalysis].forEach((v) => {
        if (v) v.style.display = 'none';
      });

      if (tab === 'code') {
        if (btnTabCode) {
          btnTabCode.classList.add('active');
          btnTabCode.style.background = '#2563eb';
          btnTabCode.style.color = '#ffffff';
        }
        if (viewCode) viewCode.style.display = 'flex';
      } else if (tab === 'problem') {
        if (btnTabProblem) {
          btnTabProblem.classList.add('active');
          btnTabProblem.style.background = '#2563eb';
          btnTabProblem.style.color = '#ffffff';
        }
        if (viewProblem) viewProblem.style.display = 'flex';
      } else if (tab === 'analysis') {
        if (btnTabAnalysis) {
          btnTabAnalysis.classList.add('active');
          btnTabAnalysis.style.background = '#2563eb';
          btnTabAnalysis.style.color = '#ffffff';
        }
        if (viewAnalysis) viewAnalysis.style.display = 'flex';
      }
    };

    // 7. 语言切换函数
    const switchLanguageInternal = (lang: string) => {
      currentLang = lang;
      langBtns.forEach((btn) => {
        if (btn.dataset.lang === lang) {
          btn.classList.add('active');
          btn.style.background = '#334155';
          btn.style.color = '#93c5fd';
        } else {
          btn.classList.remove('active');
          btn.style.background = 'transparent';
          btn.style.color = '#64748b';
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
        btnOpenModals.forEach((btn) => btn.removeEventListener('click', onOpenModalClick));
        btnCloseModal?.removeEventListener('click', onCloseModalClick);
      },
    };
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
    let targetContainer = root.querySelector(
      '#dsp-terminal-container, #code-terminal-card, .dark-code-terminal-container, [data-code-terminal]'
    ) as HTMLElement | null;

    if (!targetContainer) {
      if (
        root.id === 'dsp-terminal-container' ||
        root.id === 'code-terminal-card' ||
        root.classList?.contains('dark-code-terminal-container') ||
        root.hasAttribute?.('data-code-terminal')
      ) {
        targetContainer = root;
      }
    }

    // 如果仍未找到，尝试在右侧布局区域开头自动创建并插入
    if (!targetContainer) {
      const rightSection = root.querySelector('.mz-right-section, .fr-right-section, [class*="-right-section"], [class*="right-column"]') as HTMLElement | null;
      if (rightSection) {
        targetContainer = document.createElement('div');
        targetContainer.id = 'code-terminal-card';
        targetContainer.style.flex = '1 1 62%';
        targetContainer.style.minHeight = '0';
        targetContainer.style.display = 'flex';
        targetContainer.style.flexDirection = 'column';
        rightSection.insertBefore(targetContainer, rightSection.firstChild);
      }
    }

    if (!targetContainer) {
      return;
    }

    // 注入标准暗色终端 DOM
    targetContainer.innerHTML = `
      <div class="dark-terminal-auto-frame" style="background: #0f172a; border-radius: 16px; border: 1px solid #1e293b; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; width: 100%; height: 100%;">
        <div class="terminal-auto-header" style="background: #1e293b; padding: 4px 8px; display: flex; align-items: center; justify-content: space-between; gap: 6px; border-bottom: 1px solid #334155; flex-shrink: 0; min-width: 0; overflow-x: auto; width: 100%; box-sizing: border-box;">
          <!-- 1. 主 Tab 切换器 (源码 / 题目 / 精讲) -->
          <div class="tab-group" style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
            <button id="btn-tab-code" class="tab-item active" style="background: #2563eb; border: none; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; cursor: pointer; transition: all 0.15s; white-space: nowrap;">💻 代码调试</button>
            <button id="btn-tab-problem" class="tab-item" style="background: transparent; border: none; color: #94a3b8; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; cursor: pointer; transition: all 0.15s; white-space: nowrap;">📋 题目描述</button>
            <button id="btn-tab-analysis" class="tab-item" style="background: transparent; border: none; color: #94a3b8; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; cursor: pointer; transition: all 0.15s; white-space: nowrap;">💡 算法精讲</button>
          </div>

          <!-- 2. 多语言切换器 -->
          <div class="lang-group" id="code-lang-tabs" style="display: flex; align-items: center; background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 2px; flex-shrink: 0;">
            <button class="lang-btn active" data-lang="java" style="background: #334155; border: none; color: #93c5fd; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; cursor: pointer;">Java</button>
            <button class="lang-btn" data-lang="cpp" style="background: transparent; border: none; color: #64748b; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; cursor: pointer;">C++</button>
            <button class="lang-btn" data-lang="python" style="background: transparent; border: none; color: #64748b; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; cursor: pointer;">Python</button>
            <button class="lang-btn" data-lang="javascript" style="background: transparent; border: none; color: #64748b; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; cursor: pointer;">JS</button>
          </div>

          <!-- 3. 字号缩放器与 macOS 窗口微控制 -->
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

        <!-- 容器 1: 源码高亮与单步追踪视图 -->
        <div id="code-view-container" style="flex: 1; min-height: 0; min-width: 0; width: 100%; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box;">
          <div class="terminal-body" style="flex: 1; min-height: 0; min-width: 0; width: 100%; padding: 10px; overflow-y: auto; overflow-x: auto; font-family: 'JetBrains Mono', Consolas, Monaco, monospace; font-size: 12px; line-height: 1.6; color: #cbd5e1; box-sizing: border-box;">
            <div id="code-lines-wrapper" style="min-width: 0; width: 100%;"></div>
          </div>
        </div>

        <!-- 容器 2: 题目完整描述视图 -->
        <div id="problem-view-container" style="display: none; flex: 1; min-height: 0; padding: 14px; overflow-y: auto; background: #0f172a; color: #cbd5e1; font-size: 12px; line-height: 1.6;"></div>

        <!-- 容器 3: 算法精讲视图 -->
        <div id="analysis-view-container" style="display: none; flex: 1; min-height: 0; padding: 14px; overflow-y: auto; background: #0f172a; color: #cbd5e1; font-size: 12px; line-height: 1.6;"></div>
      </div>
    `;

    // 确保全局/模态弹窗也存在
    if (!root.querySelector('#modal-problem') && typeof document !== 'undefined') {
      const modalEl = document.createElement('div');
      modalEl.id = 'modal-problem';
      modalEl.className = 'modal-backdrop hidden';
      modalEl.style.cssText = 'position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: none; align-items: center; justify-content: center; z-index: 9999;';
      modalEl.innerHTML = `
        <div class="modal-content" style="background: #0f172a; border-radius: 16px; border: 1px solid #334155; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); width: 90%; max-width: 580px; max-height: 80%; display: flex; flex-direction: column; overflow: hidden;">
          <div class="modal-header" style="background: #1e293b; padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155;">
            <div class="modal-title" style="font-size: 13px; font-weight: 800; color: #f8fafc;">
              <span>📋 算法原理与题目说明</span>
            </div>
            <button id="btn-close-problem-modal" style="background: transparent; border: none; color: #94a3b8; font-size: 14px; cursor: pointer;" title="关闭 (Esc)">✕</button>
          </div>
          <div id="modal-problem-body" style="padding: 16px; overflow-y: auto; color: #cbd5e1; font-size: 12px; line-height: 1.6;"></div>
        </div>
      `;
      root.appendChild(modalEl);
    }
  }
}

