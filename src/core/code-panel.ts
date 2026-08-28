/**
 * 通用代码面板工具
 * 负责渲染代码行、高亮当前行、多语言 Tab 切换、变量监视面板、逐行代码精解与核心要点讲解
 *
 * 本模块是编排层，实际逻辑委托给：
 * - code-highlighter.ts  — 语法高亮
 * - variable-watch.ts    — 变量监视面板
 * - panel-splitter.ts    — 可调分隔条
 */

import type { StepVar } from './interfaces';
import { highlightTokens } from './code-highlighter';
import { VariableWatch } from './variable-watch';
import { PanelSplitter } from './panel-splitter';
import { SplitterEngine } from './splitter-engine';

export interface KeyPointItem {
  label: string;
  desc: string;
  icon?: string;
  badge?: string;
}

export interface KeyPointsData {
  title?: string;
  summary?: string;
  points: KeyPointItem[];
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ProblemDetail {
  title?: string;
  leetcodeId?: number;
  leetcodeUrl?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  description: string;
  inputDesc?: string;
  outputDesc?: string;
  examples?: ProblemExample[];
  constraints?: string[];
}

import { codeStepIndexer } from './code-step-indexer';

export interface CodePanelOptions {
  /** 默认语言的代码行数组 */
  lines: string[];
  /** 面板标题（可选） */
  title?: string;
  /** 默认语言 */
  language?: string;
  /** 多语言代码：{ 'java': [...], 'cpp': [...], 'python': [...] } */
  languages?: Record<string, string[]>;
  /** 算法唯一标识键（用于 CodeStepIndexer 索引查找，例如 'unique-paths:space-optimized'） */
  algoKey?: string;
  /** 逐行详细讲解：行号 (1-based) -> 讲解文本，或者多语言对应的行讲解 Record<lang, Record<lineNum, string>> */
  lineExplanations?: Record<number, string> | Record<string, Record<number, string>>;
  /** 算法核心要点讲解（状态定义、方程推导、初始化、遍历顺序、复杂度） */
  keyPoints?: KeyPointsData | string;
  /** 原始题目描述与示例约束（LeetCode 题面） */
  problemDetail?: ProblemDetail;
  /** 页面独立作用域（可选） */
  scope?: string;
}

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

import { CodePresentationModel } from './code-presentation-model';
import { ProblemAnalysisViewer } from './problem-analysis-viewer';

/**
 * 代码面板类 — 支持多语言 Tab、逐行代码精解 HUD 与 核心要点讲解视图
 */
export class CodePanel {
  public codeModel: CodePresentationModel;
  private container: HTMLElement;
  private title: string;
  private contentEl: HTMLElement | null = null;
  private lineElements: HTMLElement[] = [];
  private currentHighlight: Set<number> = new Set();
  private currentContextHighlight: Set<number> = new Set();
  private lastHighlightTarget: HighlightTarget | null = null;
  private tabContainer: HTMLElement | null = null;
  private algoKey?: string;

  private keyPoints?: KeyPointsData | string;
  private problemDetail?: ProblemDetail;
  private activeView: 'code' | 'walkthrough' | 'keypoints' | 'problem' = 'code';
  private scope?: string;

  private explanationEl: HTMLElement | null = null;
  private expTagPrefixEl: HTMLElement | null = null;
  private expLineNumEl: HTMLElement | null = null;
  private expBodyEl: HTMLElement | null = null;
  private walkthroughEl: HTMLElement | null = null;
  private keypointsEl: HTMLElement | null = null;
  private problemEl: HTMLElement | null = null;
  private activeExecutingLine: number = 1;

  private variableWatch: VariableWatch | null = null;
  private splitter: PanelSplitter | null = null;
  private varsSplitter: import('./splitter-engine').SplitterEngine | null = null;

  constructor(container: HTMLElement, options: CodePanelOptions) {
    ensureCodePanelStyles();
    this.container = container;
    this.title = options.title || '代码';
    this.keyPoints = options.keyPoints;
    this.problemDetail = options.problemDetail;
    this.scope = options.scope;
    this.algoKey = options.algoKey;

    this.codeModel = new CodePresentationModel({
      lines: options.lines,
      languages: options.languages,
      language: options.language,
      algoKey: options.algoKey,
      lineExplanations: options.lineExplanations,
    });

    this.render();
    this.setupSplitter();
  }

  private setupSplitter(): void {
    try {
      this.splitter = new PanelSplitter(this.container, {
        scope: this.scope,
      });
    } catch {
      // 非算法视图的容器（如侧边栏），无 aside 祖先，静默忽略
    }
  }

  private get currentLang(): string {
    return this.codeModel.getCurrentLanguage();
  }

  private get langOrder(): string[] {
    return this.codeModel.getAvailableLanguages();
  }

  private get currentLines(): string[] {
    return this.codeModel.getLines();
  }

  /** 语言显示名映射 */
  public static get LANG_NAMES(): Record<string, string> {
    return CodePresentationModel.LANG_NAMES;
  }

  /** 获取指定行的详细讲解文本 */
  private getLineExplanation(lineNum: number): string {
    return this.codeModel.getLineExplanation(lineNum);
  }

  /**
   * 渲染代码面板 DOM 结构
   */
  private render(): void {
    this.container.innerHTML = '';
    this.lineElements = [];
    this.currentHighlight.clear();

    const panel = document.createElement('div');
    panel.className = 'algo-code-panel';

    // Header with view switcher & tabs
    const header = document.createElement('div');
    header.className = 'algo-code-header';

    // Left side: View Switcher (Tabs: 调试 | 逐行精讲 | 5步要点 | 题目描述)
    const leftHeader = document.createElement('div');
    leftHeader.style.display = 'flex';
    leftHeader.style.alignItems = 'center';
    leftHeader.style.gap = '8px';

    const viewTabs = document.createElement('div');
    viewTabs.className = 'algo-code-view-tabs';

    const btnCode = document.createElement('button');
    btnCode.className = `algo-code-view-tab ${this.activeView === 'code' ? 'is-active' : ''}`;
    btnCode.innerHTML = '💻 单步调试';
    btnCode.title = '单步执行并实时高亮代码行与精解';
    btnCode.addEventListener('click', () => {
      this.switchView('code');
    });

    const btnWalkthrough = document.createElement('button');
    btnWalkthrough.className = `algo-code-view-tab ${this.activeView === 'walkthrough' ? 'is-active' : ''}`;
    btnWalkthrough.innerHTML = '📖 逐行精讲';
    btnWalkthrough.title = '全景展开所有代码行，查看保姆级教学解析';
    btnWalkthrough.addEventListener('click', () => {
      this.switchView('walkthrough');
    });

    viewTabs.appendChild(btnCode);
    viewTabs.appendChild(btnWalkthrough);

    if (this.keyPoints) {
      const btnPoints = document.createElement('button');
      btnPoints.className = `algo-code-view-tab ${this.activeView === 'keypoints' ? 'is-active' : ''}`;
      const title = typeof this.keyPoints === 'object' && this.keyPoints.title ? this.keyPoints.title : '💡 核心要点';
      btnPoints.innerHTML = title;
      btnPoints.title = `查看 ${title}`;
      btnPoints.addEventListener('click', () => {
        this.switchView('keypoints');
      });
      viewTabs.appendChild(btnPoints);
    }

    const btnProblem = document.createElement('button');
    btnProblem.className = `algo-code-view-tab ${this.activeView === 'problem' ? 'is-active' : ''}`;
    btnProblem.innerHTML = '📋 题目描述';
    btnProblem.title = '查看 LeetCode 原始题目题面、输入输出格式与测试示例';
    btnProblem.addEventListener('click', () => {
      this.switchView('problem');
    });
    viewTabs.appendChild(btnProblem);

    leftHeader.appendChild(viewTabs);
    header.appendChild(leftHeader);

    // Right side: Language tabs
    if (this.langOrder.length > 1) {
      this.tabContainer = document.createElement('div');
      this.tabContainer.className = 'algo-code-tabs';
      this.langOrder.forEach((lang) => {
        const tab = document.createElement('button');
        tab.className = 'algo-code-tab';
        tab.textContent = CodePanel.LANG_NAMES[lang] || lang;
        tab.dataset.lang = lang;
        if (lang === this.currentLang) {
          tab.classList.add('is-active');
        }
        tab.addEventListener('click', () => {
          this.switchLanguage(lang);
        });
        this.tabContainer!.appendChild(tab);
      });
      header.appendChild(this.tabContainer);
    }

    panel.appendChild(header);

    // 1. Code content container (单步调试模式)
    this.contentEl = document.createElement('div');
    this.contentEl.className = 'algo-code-content';
    if (this.activeView !== 'code') this.contentEl.style.display = 'none';

    // 鼠标移出代码区域时，恢复为当前正在执行的行精解
    this.contentEl.addEventListener('mouseleave', () => {
      this.setExplanation(this.activeExecutingLine, undefined, 'executing');
    });

    const lines = this.currentLines;
    const lang = this.currentLang;
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const lineEl = document.createElement('div');
      lineEl.className = 'algo-code-line';
      lineEl.dataset.line = String(lineNum);
      const expText = this.getLineExplanation(lineNum);
      lineEl.title = `第 ${lineNum} 行：${expText.replace(/<[^>]+>/g, '')}`;

      const lineNumber = document.createElement('span');
      lineNumber.className = 'algo-code-line-number';
      lineNumber.textContent = String(lineNum);

      const lineText = document.createElement('span');
      lineText.className = 'algo-code-line-text';
      lineText.innerHTML = highlightTokens(line, lang);

      lineEl.appendChild(lineNumber);
      lineEl.appendChild(lineText);

      // 交互：点击或悬浮代码行，展示该行的逐行精解（标记为正在查看）
      lineEl.addEventListener('mouseenter', () => {
        this.setExplanation(lineNum, undefined, 'inspecting');
      });
      lineEl.addEventListener('click', () => {
        this.setExplanation(lineNum, undefined, 'inspecting');
      });

      if (this.contentEl) {
        this.contentEl.appendChild(lineEl);
      }
      this.lineElements.push(lineEl);
    });

    panel.appendChild(this.contentEl);

    // 实时代码教学精解卡片 (Live Line Teaching Card)
    this.explanationEl = document.createElement('div');
    this.explanationEl.className = 'algo-code-explanation';
    if (this.activeView !== 'code') this.explanationEl.style.display = 'none';

    const expHeader = document.createElement('div');
    expHeader.className = 'algo-code-exp-header';

    const expTag = document.createElement('span');
    expTag.className = 'algo-code-exp-tag';

    this.expTagPrefixEl = document.createElement('span');
    this.expTagPrefixEl.textContent = '💡 正在执行：第 ';

    this.expLineNumEl = document.createElement('strong');
    this.expLineNumEl.className = 'exp-line-num';
    this.expLineNumEl.textContent = '1';

    const expTagSuffix = document.createElement('span');
    expTagSuffix.textContent = ' 行';

    expTag.appendChild(this.expTagPrefixEl);
    expTag.appendChild(this.expLineNumEl);
    expTag.appendChild(expTagSuffix);

    const expHint = document.createElement('span');
    expHint.className = 'algo-code-exp-hint';
    expHint.textContent = '悬浮/点击任意行查看';

    expHeader.appendChild(expTag);
    expHeader.appendChild(expHint);
    this.explanationEl.appendChild(expHeader);

    this.expBodyEl = document.createElement('div');
    this.expBodyEl.className = 'algo-code-exp-body';
    this.expBodyEl.innerHTML = this.getLineExplanation(1);
    this.explanationEl.appendChild(this.expBodyEl);

    panel.appendChild(this.explanationEl);

    // 2. 逐行精讲全景视图 (Full Walkthrough View)
    this.walkthroughEl = document.createElement('div');
    this.walkthroughEl.className = 'algo-code-walkthrough-container';
    if (this.activeView !== 'walkthrough') this.walkthroughEl.style.display = 'none';
    this.renderWalkthroughContent(this.walkthroughEl);
    panel.appendChild(this.walkthroughEl);

    // 3. 核心要点讲解视图 (5-Step DP Method Takeaways View)
    if (this.keyPoints) {
      this.keypointsEl = document.createElement('div');
      this.keypointsEl.className = 'algo-code-keypoints-container';
      if (this.activeView !== 'keypoints') this.keypointsEl.style.display = 'none';
      this.renderKeyPointsContent(this.keypointsEl);
      panel.appendChild(this.keypointsEl);
    }

    // 4. 原始题目描述视图 (Problem Statement View)
    this.problemEl = document.createElement('div');
    this.problemEl.className = 'algo-problem-container';
    if (this.activeView !== 'problem') this.problemEl.style.display = 'none';
    this.renderProblemContent(this.problemEl);
    panel.appendChild(this.problemEl);

    // Variable watch panel
    const varsEl = document.createElement('div');
    varsEl.className = 'algo-code-vars';
    if (this.activeView !== 'code') varsEl.style.display = 'none';
    panel.appendChild(varsEl);
    this.variableWatch = new VariableWatch(varsEl);

    // 内部纵向拖拽调节手柄：调整变量监视器高度
    try {
      this.varsSplitter = new SplitterEngine({
        id: 'code-vars-height',
        direction: 'vertical',
        targetElement: varsEl,
        containerElement: panel,
        defaultSize: 180,
        minSize: 100,
        maxSize: 380,
        maxRatio: 0.6,
        scope: this.scope,
        mode: 'dimension',
        attachPosition: 'before',
        invert: true,
        className: 'algo-code-vars-splitter',
        title: '上下拖拽调整变量监视面板高度，双击恢复默认',
        onResize: (size) => {
          if (size > 36) {
            varsEl.classList.remove('is-collapsed');
          }
        },
      });
    } catch {
      // 容错处理
    }

    this.container.appendChild(panel);
  }

  /** 渲染逐行精讲卡片内容 */
  private renderWalkthroughContent(container: HTMLElement): void {
    container.innerHTML = '';
    const lines = this.currentLines;
    const lang = this.currentLang;

    const banner = document.createElement('div');
    banner.className = 'algo-walkthrough-banner';
    banner.innerHTML = `
      <div style="font-weight: 800; font-size: 13px; color: #89b4fa; display: flex; align-items: center; gap: 6px;">
        <span>📖 代码逐行教学精讲 (${CodePanel.LANG_NAMES[lang] || lang})</span>
      </div>
      <div style="font-size: 11.5px; color: #a6adc8; margin-top: 3px; line-height: 1.4;">
        以下为本算法所有代码行的教学级拆解。点击任意卡片可切换至单步调试并高亮该行。
      </div>
    `;
    container.appendChild(banner);

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const expText = this.getLineExplanation(lineNum);
      const card = document.createElement('div');
      card.className = 'algo-walkthrough-card';

      const codeRow = document.createElement('div');
      codeRow.className = 'algo-walkthrough-code-row';
      codeRow.innerHTML = `
        <span class="algo-walkthrough-badge">Line ${lineNum}</span>
        <span class="algo-walkthrough-code-text">${highlightTokens(line, lang)}</span>
      `;

      const expBody = document.createElement('div');
      expBody.className = 'algo-walkthrough-exp-body';
      expBody.innerHTML = expText;

      card.appendChild(codeRow);
      card.appendChild(expBody);

      // 点击可跳转回单步调试并高亮该行
      card.addEventListener('click', () => {
        this.switchView('code');
        this.highlight(lineNum);
      });

      container.appendChild(card);
    });
  }

  /** 渲染核心要点讲解卡片内容 - 委托 ProblemAnalysisViewer 深模块 */
  private renderKeyPointsContent(container: HTMLElement): void {
    if (!this.keyPoints) return;
    ProblemAnalysisViewer.renderKeyPoints(container, this.keyPoints);
  }

  /** 渲染原题描述与题目要求 (Problem Statement) - 委托 ProblemAnalysisViewer 深模块 */
  private renderProblemContent(container: HTMLElement): void {
    const p = this.problemDetail;
    if (!p) {
      container.innerHTML = `
        <div class="algo-problem-banner">
          <div style="font-weight: 800; font-size: 13.5px; color: #38bdf8; display: flex; align-items: center; gap: 6px;">
            <span>📋 原题题面与题目描述</span>
          </div>
          <div style="font-size: 12px; color: #94a3b8; margin-top: 4px; line-height: 1.5;">
            当前演示题目：<strong>${this.title}</strong>。<br/>
            请结合左侧可视化舞台进行交互观察与单步推演。
          </div>
        </div>
      `;
      return;
    }
    ProblemAnalysisViewer.renderProblemDetail(container, p);
  }

  /** 动态更新原题描述 */
  public updateProblemDetail(problem: ProblemDetail): void {
    this.problemDetail = problem;
    if (this.problemEl) {
      this.renderProblemContent(this.problemEl);
    }
  }

  /** 切换 [代码实现 / 逐行精讲 / 核心要点 / 题目描述] 视图 */
  public switchView(view: 'code' | 'walkthrough' | 'keypoints' | 'problem'): void {
    if (this.activeView === view) return;
    this.activeView = view;

    const tabs = this.container.querySelectorAll('.algo-code-view-tab');
    tabs.forEach((tab) => {
      const txt = tab.textContent || '';
      const isCode = txt.includes('单步调试');
      const isWalk = txt.includes('逐行精讲');
      const isKey = txt.includes('5步动规法') || txt.includes('核心要点');
      const isProb = txt.includes('题目描述');

      if (view === 'code') tab.classList.toggle('is-active', isCode);
      else if (view === 'walkthrough') tab.classList.toggle('is-active', isWalk);
      else if (view === 'keypoints') tab.classList.toggle('is-active', isKey);
      else if (view === 'problem') tab.classList.toggle('is-active', isProb);
    });

    if (this.contentEl) this.contentEl.style.display = view === 'code' ? 'block' : 'none';
    if (this.explanationEl) this.explanationEl.style.display = view === 'code' ? 'flex' : 'none';
    if (this.walkthroughEl) this.walkthroughEl.style.display = view === 'walkthrough' ? 'flex' : 'none';
    if (this.keypointsEl) this.keypointsEl.style.display = view === 'keypoints' ? 'flex' : 'none';
    if (this.problemEl) this.problemEl.style.display = view === 'problem' ? 'flex' : 'none';

    const varsEl = this.container.querySelector('.algo-code-vars') as HTMLElement | null;
    if (varsEl) varsEl.style.display = view === 'code' ? '' : 'none';
  }

  /** 更新逐行精解 HUD 内容 */
  public setExplanation(lineNum: number, text?: string, mode: 'executing' | 'inspecting' = 'executing'): void {
    if (this.expTagPrefixEl) {
      this.expTagPrefixEl.textContent = mode === 'inspecting' ? '🔍 查看精解：第 ' : '💡 正在执行：第 ';
    }
    if (this.expLineNumEl) this.expLineNumEl.textContent = String(lineNum);
    if (this.expBodyEl) {
      this.expBodyEl.innerHTML = text || this.getLineExplanation(lineNum);
    }
  }

  /** 切换语言 */
  private switchLanguage(lang: string): void {
    if (lang === this.currentLang) return;
    this.codeModel.setCurrentLanguage(lang);

    if (this.tabContainer) {
      this.tabContainer.querySelectorAll('.algo-code-tab').forEach((tab) => {
        tab.classList.toggle('is-active', (tab as HTMLElement).dataset.lang === lang);
      });
    }

    if (this.contentEl) {
      this.contentEl.innerHTML = '';
    }
    this.lineElements = [];

    const lines = this.currentLines;
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const lineEl = document.createElement('div');
      lineEl.className = 'algo-code-line';
      lineEl.dataset.line = String(lineNum);
      const expText = this.getLineExplanation(lineNum);
      lineEl.title = `第 ${lineNum} 行：${expText.replace(/<[^>]+>/g, '')}`;

      const lineNumber = document.createElement('span');
      lineNumber.className = 'algo-code-line-number';
      lineNumber.textContent = String(lineNum);

      const lineText = document.createElement('span');
      lineText.className = 'algo-code-line-text';
      lineText.innerHTML = highlightTokens(line, lang);

      lineEl.appendChild(lineNumber);
      lineEl.appendChild(lineText);

      lineEl.addEventListener('mouseenter', () => {
        this.setExplanation(lineNum, undefined, 'inspecting');
      });
      lineEl.addEventListener('click', () => {
        this.setExplanation(lineNum, undefined, 'inspecting');
      });

      if (this.contentEl) {
        this.contentEl.appendChild(lineEl);
      }
      this.lineElements.push(lineEl);
    });

    if (this.lastHighlightTarget != null) {
      this.highlight(this.lastHighlightTarget);
    } else {
      this.activeExecutingLine = 1;
      this.setExplanation(1, undefined, 'executing');
    }

    if (this.walkthroughEl) {
      this.renderWalkthroughContent(this.walkthroughEl);
    }
  }

  /**
   * 高亮指定的代码行
   * @param target 可以是单行号、行号数组、{ from, to } 范围、{ primary, context } 对象，或多语言映射字典 { java: ..., cpp: ..., python: ..., javascript: ... }
   * 当传入多行（如 [12, 14]）时，最后一行 14 将作为核心执行行（主高亮），前置行 12 作为循环/作用域上下文（浅亮条）
   */
  highlight(target: HighlightTarget): void {
    this.lastHighlightTarget = target;

    // 0. 语义锚点目标解析 (Semantic Anchor resolution via CodeStepIndexer)
    let anchorName: string | null = null;
    if (typeof target === 'string') {
      anchorName = target;
    } else if (typeof target === 'object' && target !== null && 'anchor' in target && typeof (target as any).anchor === 'string') {
      anchorName = (target as any).anchor;
    }

    if (anchorName && this.algoKey) {
      const resolved = codeStepIndexer.resolveHighlight(this.algoKey, anchorName, this.currentLang);
      if (resolved != null) {
        effectiveTargetResolution: {
          target = resolved;
        }
      }
    }

    // 1. 多语言字典目标解析 (Multi-language dictionary resolution)
    let effectiveTarget: SingleLangHighlightTarget = target as SingleLangHighlightTarget;
    if (typeof target === 'object' && target !== null && !Array.isArray(target)) {
      const obj = target as Record<string, unknown>;
      const hasStructureKeys = 'primary' in obj || 'from' in obj || 'to' in obj;
      if (!hasStructureKeys) {
        const langKey = this.currentLang;
        if (obj[langKey] != null) {
          effectiveTarget = obj[langKey] as SingleLangHighlightTarget;
        } else if (obj.java != null && this.currentLang.includes('java')) {
          effectiveTarget = obj.java as SingleLangHighlightTarget;
        } else if (obj.javascript != null && (this.currentLang === 'js' || this.currentLang === 'javascript')) {
          effectiveTarget = obj.javascript as SingleLangHighlightTarget;
        } else if (obj.cpp != null && this.currentLang.includes('cpp')) {
          effectiveTarget = obj.cpp as SingleLangHighlightTarget;
        } else if (obj.python != null && (this.currentLang === 'python' || this.currentLang === 'py')) {
          effectiveTarget = obj.python as SingleLangHighlightTarget;
        } else {
          effectiveTarget = (Object.values(obj)[0] as SingleLangHighlightTarget) || 1;
        }
      }
    }

    let primaryLines: number[] = [];
    let contextLines: number[] = [];

    if (typeof effectiveTarget === 'number') {
      primaryLines = [effectiveTarget];
    } else if (Array.isArray(effectiveTarget)) {
      if (effectiveTarget.length === 1) {
        primaryLines = [effectiveTarget[0]];
      } else if (effectiveTarget.length > 1) {
        primaryLines = [effectiveTarget[effectiveTarget.length - 1]];
        contextLines = effectiveTarget.slice(0, effectiveTarget.length - 1);
      }
    } else if ('primary' in effectiveTarget) {
      primaryLines = Array.isArray(effectiveTarget.primary) ? effectiveTarget.primary : [effectiveTarget.primary];
      if (effectiveTarget.context != null) {
        contextLines = Array.isArray(effectiveTarget.context) ? effectiveTarget.context : [effectiveTarget.context];
      }
    } else if ('from' in effectiveTarget && 'to' in effectiveTarget) {
      const { from, to } = effectiveTarget;
      if (from === to) {
        primaryLines = [from];
      } else {
        primaryLines = [to];
        for (let i = from; i < to; i++) {
          contextLines.push(i);
        }
      }
    }

    const clamp = (lineNum: number) => Math.max(1, Math.min(this.lineElements.length, lineNum));
    const unique = (arr: number[]) => arr.map(clamp).filter((val, idx, a) => a.indexOf(val) === idx);

    primaryLines = unique(primaryLines);
    const primarySet = new Set(primaryLines);
    contextLines = unique(contextLines).filter((num) => !primarySet.has(num));

    this.currentHighlight.forEach((lineNum) => {
      const idx = lineNum - 1;
      if (idx >= 0 && idx < this.lineElements.length) {
        this.lineElements[idx].classList.remove('is-active');
      }
    });
    this.currentHighlight.clear();

    this.currentContextHighlight.forEach((lineNum) => {
      const idx = lineNum - 1;
      if (idx >= 0 && idx < this.lineElements.length) {
        this.lineElements[idx].classList.remove('is-context');
      }
    });
    this.currentContextHighlight.clear();

    contextLines.forEach((lineNum) => {
      const idx = lineNum - 1;
      if (idx >= 0 && idx < this.lineElements.length) {
        this.lineElements[idx].classList.add('is-context');
        this.currentContextHighlight.add(lineNum);
      }
    });

    primaryLines.forEach((lineNum) => {
      const idx = lineNum - 1;
      if (idx >= 0 && idx < this.lineElements.length) {
        const el = this.lineElements[idx];
        el.classList.add('is-active');
        // 重新触发脉冲呼吸动效
        el.classList.remove('is-flashing');
        void el.offsetWidth; // 触发 reflow 重置动画
        el.classList.add('is-flashing');
        this.currentHighlight.add(lineNum);
      }
    });

    if (primaryLines.length > 0) {
      this.activeExecutingLine = primaryLines[0];
      this.setExplanation(primaryLines[0], undefined, 'executing');
    } else if (contextLines.length > 0) {
      this.activeExecutingLine = contextLines[0];
      this.setExplanation(contextLines[0], undefined, 'executing');
    }

    const scrollTarget = primaryLines[0] ?? contextLines[0];
    if (scrollTarget != null) {
      const idx = scrollTarget - 1;
      if (idx >= 0 && idx < this.lineElements.length) {
        this.lineElements[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  clearHighlight(): void {
    this.currentHighlight.forEach((lineNum) => {
      const idx = lineNum - 1;
      if (idx >= 0 && idx < this.lineElements.length) {
        this.lineElements[idx].classList.remove('is-active');
      }
    });
    this.currentHighlight.clear();

    this.currentContextHighlight.forEach((lineNum) => {
      const idx = lineNum - 1;
      if (idx >= 0 && idx < this.lineElements.length) {
        this.lineElements[idx].classList.remove('is-context');
      }
    });
    this.currentContextHighlight.clear();
  }

  updateLines(lines: string[], lang?: string): void {
    const targetLang = lang || this.currentLang;
    this.codeModel.updateLines(lines, targetLang);
    if (targetLang === this.currentLang) {
      this.render();
    }
  }

  updateVars(vars: StepVar[]): void {
    this.variableWatch?.update(vars);
  }

  destroy(): void {
    this.splitter?.destroy();
    this.splitter = null;
    this.varsSplitter?.destroy();
    this.varsSplitter = null;
    this.variableWatch?.destroy();
    this.variableWatch = null;
    this.container.innerHTML = '';
    this.lineElements = [];
    this.currentHighlight.clear();
    this.currentContextHighlight.clear();
    this.contentEl = null;
    this.explanationEl = null;
    this.keypointsEl = null;
    this.tabContainer = null;
  }
}

/** 注入代码面板与变量监视器的全局现代暗黑风格样式 */
function ensureCodePanelStyles(): void {
  if (typeof document === 'undefined' || typeof document.getElementById !== 'function' || !document.head) return;
  if (document.getElementById('algo-code-panel-global-styles')) return;

  const style = document.createElement('style');
  style.id = 'algo-code-panel-global-styles';
  style.textContent = `
    .algo-code-panel {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    }
    .algo-code-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 7px 12px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      flex-shrink: 0;
      gap: 8px;
      flex-wrap: wrap;
    }
    .algo-code-view-tabs {
      display: flex;
      align-items: center;
      gap: 3px;
      background: #ffffff;
      padding: 2px 4px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .algo-code-view-tab {
      background: transparent;
      border: none;
      color: #64748b;
      font-size: 11px;
      font-weight: 600;
      padding: 3.5px 9px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .algo-code-view-tab:hover {
      color: #0f172a;
      background: #f1f5f9;
    }
    .algo-code-view-tab.is-active {
      background: #eff6ff;
      color: #2563eb;
      font-weight: 700;
      box-shadow: 0 1px 3px rgba(37, 99, 235, 0.15);
    }
    .algo-code-tabs {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .algo-code-tab {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .algo-code-tab:hover {
      color: #0f172a;
      border-color: #cbd5e1;
      background: #f8fafc;
    }
    .algo-code-tab.is-active {
      background: #eff6ff;
      color: #2563eb;
      border-color: #93c5fd;
      font-weight: 700;
    }
    .algo-code-content {
      flex: 1;
      min-height: 100px;
      overflow-y: auto;
      overflow-x: auto;
      padding: 8px 0;
      font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12.5px;
      line-height: 1.6;
      background: #ffffff;
    }
    .algo-code-line {
      display: flex;
      align-items: flex-start;
      padding: 1px 12px;
      transition: background 0.15s ease, border-color 0.15s ease;
      position: relative;
      color: #1e293b;
    }
    .algo-code-line:hover {
      background: #f8fafc;
    }
    .algo-code-line.is-active {
      background: #fef3c7;
      border-left: 3.5px solid #f59e0b;
      color: #78350f;
      font-weight: 600;
    }
    .algo-code-line.is-context {
      background: #eff6ff;
      border-left: 3px solid #3b82f6;
    }
    .algo-code-line-number {
      width: 32px;
      color: #94a3b8;
      font-size: 11px;
      text-align: right;
      padding-right: 12px;
      user-select: none;
      flex-shrink: 0;
    }
    .algo-code-line.is-active .algo-code-line-number {
      color: #d97706;
      font-weight: 700;
    }
    .algo-code-line-text {
      flex: 1;
      white-space: pre-wrap;
      word-break: break-word;
      color: #1e293b;
    }
    .algo-code-explanation {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
      padding: 8px 14px;
      font-size: 12px;
      color: #334155;
      flex-shrink: 0;
      max-height: 130px;
      overflow-y: auto;
    }
    .algo-code-exp-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .algo-code-exp-tag {
      font-size: 11px;
      font-weight: 700;
      color: #0284c7;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .algo-code-exp-body {
      line-height: 1.5;
      color: #334155;
    }
    .algo-code-vars {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      height: 190px;
      min-height: 80px;
      overflow: hidden;
      flex-shrink: 0;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.03);
    }
    .algo-code-vars.is-collapsed {
      height: 34px !important;
      min-height: 34px !important;
    }
    .algo-code-vars.is-collapsed .algo-code-vars-body {
      display: none !important;
    }
    .algo-code-vars.is-collapsed .algo-code-vars-toggle {
      transform: rotate(-90deg);
    }
    .algo-code-vars-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 12px;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      cursor: pointer;
      user-select: none;
      font-size: 11.5px;
      font-weight: 700;
      color: #0284c7;
      flex-shrink: 0;
    }
    .algo-code-vars-header:hover {
      background: #f1f5f9;
    }
    .algo-code-vars-title {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .algo-code-vars-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #0284c7;
    }
    .algo-code-vars-count {
      font-size: 10px;
      background: #e0f2fe;
      color: #0284c7;
      padding: 1px 6px;
      border-radius: 999px;
      font-weight: 700;
    }
    .algo-code-vars-toggle {
      font-size: 10px;
      color: #94a3b8;
      transition: transform 0.2s ease;
    }
    .algo-code-vars-body {
      flex: 1;
      overflow-y: auto;
      padding: 8px 10px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
      gap: 6px;
      align-content: start;
    }
    .algo-code-var-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 5px 9px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 7px;
      font-size: 12px;
      gap: 8px;
      transition: all 0.25s ease;
    }
    .algo-code-var-row:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }
    .algo-code-var-row.is-changed {
      animation: algo-var-flash 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes algo-var-flash {
      0% {
        background: #fef3c7;
        border-color: #f59e0b;
        box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
        transform: scale(1.02);
      }
      100% {
        background: #ffffff;
        border-color: #e2e8f0;
        box-shadow: none;
        transform: scale(1);
      }
    }
    .algo-code-var-name-box {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
      flex: 1;
    }
    .algo-code-var-name {
      color: #475569;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 11.5px;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .algo-code-var-value {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-weight: 800;
      font-size: 12.5px;
      color: #0f172a;
      background: #f1f5f9;
      padding: 2px 7px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
      flex-shrink: 0;
    }
    .algo-code-var-value[data-type="number"] {
      color: #059669;
    }
    .algo-code-var-value[data-type="boolean"] {
      color: #db2777;
    }
    .algo-code-var-value[data-type="string"] {
      color: #d97706;
    }
    .algo-code-var-value[data-type="array"] {
      color: #2563eb;
    }

    /* 原始题目描述视图样式 (Problem Statement Styles) */
    .algo-problem-container {
      flex: 1;
      overflow-y: auto;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #f8fafc;
    }
    .algo-problem-banner {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 9px;
      padding: 10px 12px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
    }
    .algo-problem-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
    }
    .algo-problem-section-title {
      font-size: 12px;
      font-weight: 800;
      color: #0284c7;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .algo-problem-text {
      font-size: 12px;
      line-height: 1.65;
      color: #334155;
    }
    .algo-problem-text code,
    .algo-problem-example-row code {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 11.5px;
      background: #f1f5f9;
      color: #d97706;
      padding: 1.5px 5px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }
    .algo-problem-example-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 7px;
      padding: 8px 11px;
      font-size: 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .algo-problem-example-title {
      font-size: 11.5px;
      font-weight: 700;
      color: #7c3aed;
      margin-bottom: 2px;
    }
    .algo-problem-example-row {
      display: flex;
      align-items: baseline;
      gap: 6px;
      font-size: 11.5px;
      line-height: 1.5;
    }
    .algo-problem-label {
      color: #64748b;
      font-weight: 700;
      flex-shrink: 0;
      font-size: 11px;
    }

    /* 逐行精讲卡片与 5 步动规法样式 */
    .algo-walkthrough-container,
    .algo-code-keypoints-container {
      flex: 1;
      overflow-y: auto;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: #f8fafc;
    }
    .algo-walkthrough-banner,
    .algo-keypoint-summary-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 9px 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }
    .algo-walkthrough-card,
    .algo-keypoint-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 7px;
      padding: 8px 10px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .algo-walkthrough-card:hover,
    .algo-keypoint-card:hover {
      background: #f1f5f9;
      border-color: #3b82f6;
    }
    .algo-walkthrough-code-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    .algo-walkthrough-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 4px;
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
    }
    .algo-walkthrough-code-text {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 11.5px;
      color: #0f172a;
    }
    .algo-walkthrough-exp-body {
      font-size: 11.5px;
      line-height: 1.5;
      color: #475569;
    }
    .algo-keypoint-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      color: #0284c7;
      margin-bottom: 4px;
    }
    .algo-keypoint-desc {
      font-size: 11.5px;
      line-height: 1.5;
      color: #cbd5e1;
    }
  `;
  document.head.appendChild(style);
}
