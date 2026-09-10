import { highlightTokens } from '../code-highlighter';

export interface RightPanelTabOptions {
  modelId: string;
  currentStage: string;
  hasMultipleVariants?: boolean;
  onRenderProblem?: () => void;
  onRenderAnalysis?: () => void;
  onHighlightCode?: () => void;
}

export interface CodePanelUpdateOptions {
  modelId: string;
  currentStage: string;
  currentVariant: string;
  onSelectVariant: (variantKey: string) => void;
}

/**
 * 右侧多看板选项卡与代码面板协调深模块 (RightPanelTabCoordinator)
 * 
 * 职责：
 * 1. 协调代码面板 (Code)、题目描述 (Problem)、递推精讲 (Analysis) 之间的显示切换与高亮状态
 * 2. 协调代码多变体选项卡 (Variant Bar) 的渲染、激活与偏好持久化
 * 3. 协调变体切换时代码内容与标题的动态注入与容器滚动重置
 */
export class RightPanelTabCoordinator {
  /**
   * 切换右侧面板展示视图
   */
  public static switchRightTab(
    tab: 'code' | 'problem' | 'analysis',
    options: RightPanelTabOptions
  ): void {
    if (typeof document === 'undefined') return;

    const btnCode = document.getElementById('btn-tab-code');
    const btnProblem = document.getElementById('btn-tab-problem');
    const btnAnalysis = document.getElementById('btn-tab-analysis');

    const setActiveClass = (btn: HTMLElement | null, isActive: boolean) => {
      if (!btn) return;
      btn.className = isActive
        ? 'tab-btn active px-2.5 py-0.5 rounded text-[11px] font-bold transition bg-blue-600 text-white shadow-2xs flex items-center gap-1.5'
        : 'tab-btn px-2.5 py-0.5 rounded text-[11px] font-medium transition text-slate-400 hover:text-slate-200 hover:bg-slate-800 flex items-center gap-1.5';
    };

    setActiveClass(btnCode, tab === 'code');
    setActiveClass(btnProblem, tab === 'problem');
    setActiveClass(btnAnalysis, tab === 'analysis');

    const viewCode = document.getElementById('code-view-container');
    const viewProblem = document.getElementById('problem-view-container');
    const viewAnalysis = document.getElementById('analysis-view-container');
    const variantBar = document.getElementById('code-variant-bar');
    const fontControls = document.getElementById('code-font-container') || document.getElementById('btn-code-font-dec')?.parentElement?.parentElement;

    if (viewCode) {
      if (tab === 'code') viewCode.classList.remove('hidden');
      else viewCode.classList.add('hidden');
    }
    if (viewProblem) {
      if (tab === 'problem') viewProblem.classList.remove('hidden');
      else viewProblem.classList.add('hidden');
    }
    if (viewAnalysis) {
      if (tab === 'analysis') viewAnalysis.classList.remove('hidden');
      else viewAnalysis.classList.add('hidden');
    }

    // 变体选择器与字号缩放只在代码视图显示（且仅当存在 2 个及以上变体可选时才显示）
    if (variantBar) {
      if (tab === 'code' && options.hasMultipleVariants) {
        variantBar.classList.remove('hidden');
      } else {
        variantBar.classList.add('hidden');
      }
    }
    if (fontControls) {
      if (tab === 'code') fontControls.classList.remove('hidden');
      else fontControls.classList.add('hidden');
    }

    if (tab === 'problem') {
      options.onRenderProblem?.();
    } else if (tab === 'analysis') {
      options.onRenderAnalysis?.();
    } else if (tab === 'code') {
      options.onHighlightCode?.();
    }
  }

  /**
   * 更新代码面板内容与变体选项卡
   */
  public static updateCodePanel(
    stageConfig: any,
    options: CodePanelUpdateOptions
  ): void {
    if (typeof document === 'undefined' || !stageConfig) return;

    const variantBar = document.getElementById('code-variant-bar');
    const variantKeys = stageConfig.variants ? Object.keys(stageConfig.variants) : [];

    if (stageConfig.variants && variantKeys.length > 1) {
      if (variantBar) {
        variantBar.classList.remove('hidden');
        variantBar.classList.add('flex-shrink-0', 'whitespace-nowrap');
        variantBar.innerHTML = '';

        variantKeys.forEach(varKey => {
          const v = stageConfig.variants[varKey];
          const btn = document.createElement('button');
          const isActive = varKey === options.currentVariant;
          btn.dataset.variant = varKey;
          btn.className = `variant-btn whitespace-nowrap px-2 py-0.5 rounded text-[10px] transition ${
            isActive
              ? 'font-bold bg-blue-600 text-white shadow-2xs'
              : 'font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`;
          btn.textContent = v.variantLabel || v.title || varKey;
          btn.addEventListener('click', () => {
            options.onSelectVariant(varKey);
          });
          variantBar.appendChild(btn);
        });
      }
      const variantConfig = stageConfig.variants ? (stageConfig.variants[options.currentVariant] || Object.values(stageConfig.variants)[0]) : null;
      const codeTitleEl = document.getElementById('code-file-title') || document.getElementById('code-lang-title');
      if (codeTitleEl) codeTitleEl.textContent = variantConfig?.title || stageConfig.codeTitle || '';
      const codeBox = document.getElementById('code-content') || document.getElementById('code-display-container');
      if (codeBox) codeBox.innerHTML = variantConfig?.codeHtml || (variantConfig as any)?.html || stageConfig.codeHtml || '';
    } else {
      if (variantBar) variantBar.classList.add('hidden');
      const variantConfig = stageConfig.variants ? (stageConfig.variants[options.currentVariant] || Object.values(stageConfig.variants)[0]) : null;
      const codeTitleEl = document.getElementById('code-file-title') || document.getElementById('code-lang-title');
      if (codeTitleEl) codeTitleEl.textContent = variantConfig?.title || stageConfig.codeTitle || '';
      const codeBox = document.getElementById('code-content') || document.getElementById('code-display-container');
      if (codeBox) codeBox.innerHTML = variantConfig?.codeHtml || (variantConfig as any)?.html || stageConfig.codeHtml || '';
    }

    const codeContainer = document.getElementById('code-container-box') || document.getElementById('code-display-container');
    if (codeContainer) codeContainer.scrollTop = 0;
  }

  /**
   * 初始化代码字号配置
   */
  public static initCodeFontSize(defaultSize: number = 11.5): number {
    let size = defaultSize;
    if (typeof localStorage !== 'undefined') {
      const saved = parseFloat(localStorage.getItem('algo-code-font-size') || '');
      if (Number.isFinite(saved) && saved >= 9 && saved <= 18) {
        size = saved;
      }
    }
    this.applyCodeFontSize(size);
    return size;
  }

  /**
   * 动态设置并持久化代码面板字号
   */
  public static setCodeFontSize(size: number): number {
    const clamped = Math.min(Math.max(size, 9.5), 16);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('algo-code-font-size', String(clamped));
    }
    this.applyCodeFontSize(clamped);
    return clamped;
  }

  /**
   * 应用代码面板字号到 DOM
   */
  public static applyCodeFontSize(size: number): void {
    if (typeof document === 'undefined') return;
    const rounded = Math.round(size * 10) / 10;
    if (document.documentElement) {
      document.documentElement.style.setProperty('--viz-code-font-size', `${rounded}px`);
    }
    const indicator = document.getElementById('code-font-indicator');
    if (indicator) {
      indicator.textContent = String(rounded);
    }
    const codeBox = document.getElementById('code-container-box');
    if (codeBox) {
      codeBox.style.fontSize = `${rounded}px`;
    }
  }

  /**
   * 逐行代码高亮与行内局部表达式聚焦
   */
  public static updateCodeHighlight(
    container: HTMLElement | null,
    line?: number,
    highlightText?: string,
    language: string = 'java'
  ): void {
    if (!container || line === undefined) return;

    // 1. 清理上一高亮行与局部聚焦状态（基于纯文本源码单向恢复）
    container.querySelectorAll('.code-line').forEach(el => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.dataset.isDirty === 'true' && htmlEl.dataset.rawCode) {
        htmlEl.innerHTML = highlightTokens(htmlEl.dataset.rawCode, language);
        delete htmlEl.dataset.isDirty;
      }
      htmlEl.classList.remove('active-line');
    });

    const activeLineEl = container.querySelector(`.code-line[data-line="${line}"]`) as HTMLElement | null;
    if (activeLineEl) {
      activeLineEl.classList.add('active-line');

      // 2. 若存在行内目标子串，通过纯文本 Lexer 重新生成带聚焦状态的 HTML（单向数据流，零 DOM 破坏）
      const rawCode = activeLineEl.dataset.rawCode;
      if (rawCode && highlightText) {
        activeLineEl.innerHTML = highlightTokens(rawCode, language, highlightText);
        activeLineEl.dataset.isDirty = 'true';
      }

      // 3. 自动滚动居中
      if (line <= 6) {
        if (typeof container.scrollTo === 'function') {
          container.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          container.scrollTop = 0;
        }
      } else {
        const lineOffsetTop = activeLineEl.offsetTop || 0;
        const currentScroll = container.scrollTop || 0;

        if (lineOffsetTop < currentScroll + 32) {
          const targetTop = Math.max(0, lineOffsetTop - 40);
          if (typeof container.scrollTo === 'function') {
            container.scrollTo({ top: targetTop, behavior: 'smooth' });
          } else {
            container.scrollTop = targetTop;
          }
        }
      }
    }
  }
}


