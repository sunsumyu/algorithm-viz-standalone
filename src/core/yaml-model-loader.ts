/**
 * YAML 算法模型加载与语法高亮编译深模块 (YamlModelLoader Deep Module)
 * 遵循 OCP（开闭原则）与 DIP（依赖倒置原则）：
 * 外部只依赖标准 YAML 文本或编译后的 IYamlAlgorithmModel 契约，
 * 内部封装 YAML 反序列化、多语言语法分词高亮、语义锚点行映射编译。
 */

import * as jsYaml from 'js-yaml';
import { highlightTokens, escapeHtml } from './code-highlighter';
import type {
  IYamlAlgorithmModel,
  IYamlStageSpec,
  IYamlDirectionDef,
  IYamlCodeSnippet,
  IYamlStageVariant
} from './interfaces';

function safeLoadYaml(content: string): any {
  if (typeof jsYaml.load === 'function') {
    return jsYaml.load(content);
  }
  const defaultExport = (jsYaml as any).default;
  if (defaultExport && typeof defaultExport.load === 'function') {
    return defaultExport.load(content);
  }
  if (typeof defaultExport === 'function') {
    return defaultExport(content);
  }
  throw new Error('[YamlModelLoader] 未找到有效的 js-yaml load 解析方法');
}

export interface CompiledCodeResult {
  title: string;
  cleanSource: string;
  codeHtml: string;
  lineCount: number;
  anchorMap: Record<string, number>;
}

export interface CompiledStageViewConfig {
  name: string;
  desc: string;
  timeBadge: string;
  badgeBg: string;
  card2Title: string;
  card2Desc: string;
  codeTitle?: string;
  codeHtml?: string;
  anchorMap?: Record<string, number>;
  variants?: Record<string, {
    variantLabel?: string;
    title: string;
    codeTitle: string;
    codeHtml: string;
    anchorMap: Record<string, number>;
  }>;
}

export class YamlModelLoader {
  /**
   * 解析 YAML 字符串为强类型算法模型对象
   */
  public static load(yamlContent: string): IYamlAlgorithmModel {
    if (!yamlContent || typeof yamlContent !== 'string') {
      throw new Error('[YamlModelLoader] YAML 内容不能为空');
    }
    const raw = safeLoadYaml(yamlContent) as any;
    if (!raw || typeof raw !== 'object') {
      throw new Error('[YamlModelLoader] 无法解析 YAML 结构');
    }
    if (!raw.id || !raw.name || !raw.directions || !raw.stages) {
      throw new Error('[YamlModelLoader] YAML 缺少核心字段 (id, name, directions, stages)');
    }
    return raw as IYamlAlgorithmModel;
  }

  /**
   * 提取字符串字段的多方向值（支持对象 `{ forward: '...', reverse: '...' }` 或单纯字符串）
   */
  public static resolveDirectionalText(
    field: { forward: string; reverse: string } | string | undefined,
    direction: 'forward' | 'reverse',
    defaultVal: string = ''
  ): string {
    if (!field) return defaultVal;
    if (typeof field === 'string') return field;
    return field[direction] || field.forward || defaultVal;
  }

  /**
   * 编译单段带有 @step:anchor 标签的源码，生成纯净代码、行号高亮 HTML 与语义锚点索引表
   */
  public static compileSource(snippet: IYamlCodeSnippet | undefined, lang: string = 'java'): CompiledCodeResult {
    if (!snippet || !snippet.source) {
      return {
        title: snippet?.title || '',
        cleanSource: '',
        codeHtml: '',
        lineCount: 0,
        anchorMap: {}
      };
    }

    const lines = snippet.source.trimEnd().split('\n');
    const cleanLines: string[] = [];
    const htmlLines: string[] = [];
    const anchorMap: Record<string, number> = {};

    lines.forEach((rawLine, idx) => {
      const lineNum = idx + 1;
      let lineText = rawLine;

      // 全局提取本行所有 @step:anchor 标签
      const anchorMatches = Array.from(lineText.matchAll(/@step:([a-zA-Z0-9_\-]+)/g));
      if (anchorMatches.length > 0) {
        anchorMatches.forEach((m) => {
          anchorMap[m[1]] = lineNum;
        });
        // 剥离所有 @step:anchor 注释标签
        lineText = lineText.replace(/@step:[a-zA-Z0-9_\-]+/g, '');
        // 清理可能产生的重复 // 注释符号及行尾多余空注释
        lineText = lineText.replace(/\/\/\s*\/\//g, '//');
        lineText = lineText.replace(/\/\/\s*$/, '').trimEnd();
      }

      cleanLines.push(lineText);
      const highlightedCode = highlightTokens(lineText, lang);
      htmlLines.push(`<span class="code-line" data-line="${lineNum}" data-raw-code="${escapeHtml(lineText)}">${highlightedCode}</span>`);
    });

    return {
      title: snippet.title || '',
      cleanSource: cleanLines.join('\n'),
      codeHtml: htmlLines.join(''),
      lineCount: lines.length,
      anchorMap
    };
  }

  /**
   * 委托给词法分词高亮器 (CodeHighlighter.highlightTokens)
   */
  public static highlightSyntax(codeLine: string, lang: string = 'java'): string {
    return highlightTokens(codeLine, lang);
  }

  /**
   * 获取指定阶段在指定方向（顺推 / 逆推）下的全部已编译视图配置
   */
  public static getCompiledStageConfig(
    model: IYamlAlgorithmModel,
    stageKey: string,
    direction: 'forward' | 'reverse'
  ): CompiledStageViewConfig {
    const stage = model.stages[stageKey];
    if (!stage) {
      throw new Error(`[YamlModelLoader] 未知阶段配置: ${stageKey}`);
    }

    const name = YamlModelLoader.resolveDirectionalText(stage.name, direction);
    const desc = YamlModelLoader.resolveDirectionalText(stage.desc, direction);
    const card2Title = YamlModelLoader.resolveDirectionalText(stage.card2Title, direction);
    const card2Desc = YamlModelLoader.resolveDirectionalText(stage.card2Desc, direction);
    const timeBadge = stage.timeBadge || 'O(n)';
    const badgeBg = stage.badgeBg || 'bg-slate-100 text-slate-700';

    const result: CompiledStageViewConfig = {
      name,
      desc,
      timeBadge,
      badgeBg,
      card2Title,
      card2Desc
    };

    // 编译主代码片段
    if (stage.code) {
      const codeSnippet = stage.code[direction] || stage.code.forward;
      if (codeSnippet) {
        const compiled = YamlModelLoader.compileSource(codeSnippet);
        result.codeTitle = compiled.title;
        result.codeHtml = compiled.codeHtml;
        result.anchorMap = compiled.anchorMap;
      }
    }

    // 编译变体代码库（如 stage-4 中的 if / for 变体）
    if (stage.variants) {
      result.variants = {};
      for (const [vKey, variant] of Object.entries(stage.variants)) {
        const vTitle = YamlModelLoader.resolveDirectionalText(variant.title, direction);
        const snippet = variant.code[direction] || variant.code.forward;
        if (snippet) {
          const compiled = YamlModelLoader.compileSource(snippet);
          result.variants[vKey] = {
            variantLabel: variant.variantLabel || vTitle,
            title: vTitle,
            codeTitle: compiled.title,
            codeHtml: compiled.codeHtml,
            anchorMap: compiled.anchorMap
          };
        }
      }
    }

    return result;
  }
}
