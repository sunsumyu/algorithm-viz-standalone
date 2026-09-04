/**
 * 通用代码面板适配器 (CodePanel Thin Adapter)
 * 遵循深模块与外观/适配器模式 (Adapter Pattern)：
 * 将遗留的 CodePanel 接口无缝桥接至唯一的 DarkCodeTerminalPresenter 核心终端深模块。
 * 消除 1200+ 行重复样板代码，实现代码高亮与多语言联动的单轨收敛。
 */

import type { StepVar } from './interfaces';
import {
  DarkCodeTerminalPresenter,
  type DarkCodeTerminalInstance,
  type HighlightTarget,
  type SingleLangHighlightTarget,
} from './renderers/dark-code-terminal-presenter';
import {
  CodePresentationModel,
  type KeyPointItem,
  type KeyPointsData,
  type ProblemExample,
  type ProblemDetail,
} from './code-presentation-model';

export type {
  HighlightTarget,
  SingleLangHighlightTarget,
  KeyPointItem,
  KeyPointsData,
  ProblemExample,
  ProblemDetail,
};

export interface CodePanelOptions {
  /** 默认语言的代码行数组 */
  lines?: string[];
  /** 面板标题（可选） */
  title?: string;
  /** 默认语言 */
  language?: string;
  /** 多语言代码：{ 'java': [...], 'cpp': [...], 'python': [...] } */
  languages?: Record<string, string[]>;
  /** 算法唯一标识键 */
  algoKey?: string;
  /** 逐行详细讲解 */
  lineExplanations?: Record<number, string> | Record<string, Record<number, string>>;
  /** 算法核心要点讲解 */
  keyPoints?: KeyPointsData | string;
  /** 原始题目描述与示例约束 */
  problemDetail?: ProblemDetail;
  /** 页面独立作用域（可选） */
  scope?: string;
}

export class CodePanel {
  public static readonly LANG_NAMES: Record<string, string> = CodePresentationModel.LANG_NAMES;

  public container: HTMLElement;
  public terminal: DarkCodeTerminalInstance;
  public codeModel: CodePresentationModel;

  constructor(
    container: HTMLElement,
    options: CodePanelOptions,
    existingTerminal?: DarkCodeTerminalInstance
  ) {
    this.container = container;

    if (existingTerminal) {
      this.terminal = existingTerminal;
      this.codeModel =
        existingTerminal.codeModel ||
        new CodePresentationModel({
          lines: options.lines,
          languages: options.languages,
          language: options.language,
          algoKey: options.algoKey,
          lineExplanations: options.lineExplanations,
          problemDetail: options.problemDetail,
        });
    } else {
      const codeLanguages =
        options.languages && Object.keys(options.languages).length > 0
          ? options.languages
          : options.lines
          ? { [options.language || 'java']: options.lines }
          : { java: [] };

      this.terminal = DarkCodeTerminalPresenter.mount(container, {
        codeLanguages,
        title: options.title,
        initialLang: options.language || 'java',
        algoKey: options.algoKey,
        lineExplanations: options.lineExplanations,
        keyPoints: options.keyPoints,
        problemDetail: options.problemDetail,
      });

      this.codeModel =
        this.terminal.codeModel ||
        new CodePresentationModel({
          languages: codeLanguages,
          language: options.language || 'java',
          algoKey: options.algoKey,
          lineExplanations: options.lineExplanations,
          problemDetail: options.problemDetail,
        });
    }
  }

  /** 高亮单行或多语言高亮目标 */
  public highlight(target: HighlightTarget | null | undefined): void {
    this.terminal.highlightLine(target);
  }

  /** 同步变量监视面板 */
  public updateVars(vars?: StepVar[]): void {
    this.terminal.updateVars(vars);
  }

  /** 手动切换编程语言 */
  public switchLanguage(lang: string): void {
    this.terminal.switchLanguage(lang);
  }

  /** 获取当前语言 */
  public getCurrentLanguage(): string {
    return this.terminal.getCurrentLanguage();
  }

  /** 切换视图 */
  public switchView(view: 'code' | 'walkthrough' | 'keypoints' | 'problem'): void {
    if (view === 'problem') {
      this.terminal.switchTab('problem');
    } else if (view === 'keypoints' || view === 'walkthrough') {
      this.terminal.switchTab('analysis');
    } else {
      this.terminal.switchTab('code');
    }
  }

  /** 动态更新代码行（例如降维/升维动态切换源码） */
  public updateLines(lines: string[], lang?: string): void {
    const targetLang = lang || this.getCurrentLanguage();
    this.codeModel.updateLines(lines, targetLang);
    this.terminal.switchLanguage(targetLang);
  }

  /** 设置逐行讲解（兼容旧接口） */
  public setLineExplanation(lineNum: number, text: string): void {
    if (this.codeModel) {
      this.codeModel.setLineExplanation(lineNum, text);
    }
  }

  /** 设置活动讲解行（兼容旧接口） */
  public setExplanation(lineNum: number, text?: string, _mode?: 'executing' | 'inspecting'): void {
    if (text) {
      this.setLineExplanation(lineNum, text);
    }
    this.terminal.highlightLine(lineNum);
  }

  /** 销毁面板 */
  public destroy(): void {
    this.terminal.destroy();
  }
}
