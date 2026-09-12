/**
 * 统一暗色代码终端 — 数据契约与图标常量 (DarkCodeTerminalTypes)
 * 从 dark-code-terminal-presenter 拆出的纯类型层：零行为。
 */

import type { StepVar } from '../interfaces';
import type { CodePresentationModel, KeyPointsData, ProblemDetail } from '../code-presentation-model';

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

export const TAB_CODE_ICON = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; flex-shrink:0;"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>';
export const TAB_PROBLEM_ICON = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; flex-shrink:0;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>';
export const TAB_ANALYSIS_ICON = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; flex-shrink:0;"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6h8c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z"></path></svg>';
