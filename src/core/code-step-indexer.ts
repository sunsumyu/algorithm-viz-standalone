/**
 * CodeStepIndexer (代码语义锚点索引编译器深模块)
 * 
 * 核心职责：
 * 1. 解析多语言代码模板中的 @step:anchor 语义锚点标签
 * 2. 自动计算各语言（Java/Python/C++/JavaScript）精确的 1-based 物理行号索引
 * 3. 自动剥离内联锚点注释，为视图层输出 100% 纯净源码
 * 4. 运行时提供高内聚、零漂移的 resolveHighlightTarget 统一查询接缝
 */

export type ResolvedHighlightTarget =
  | number
  | number[]
  | { primary: number | number[]; context?: number | number[] };

export interface CodeAnchorTarget {
  primary: number | number[];
  context?: number | number[];
}

export interface CompiledCodeModel {
  cleanCode: Record<string, string[]>;
  anchorIndex: Record<string, Record<string, CodeAnchorTarget>>;
}

export class CodeStepIndexer {
  private static instance: CodeStepIndexer;
  private registry = new Map<string, CompiledCodeModel>();

  public static getInstance(): CodeStepIndexer {
    if (!CodeStepIndexer.instance) {
      CodeStepIndexer.instance = new CodeStepIndexer();
    }
    return CodeStepIndexer.instance;
  }

  /**
   * 编译并注册多语言代码模板
   * @param key 唯一标识（如 'unique-paths:space-optimized' 或 'climb-stairs:naive-recursive'）
   * @param rawLanguages 多语言原始代码行数组
   */
  public register(key: string, rawLanguages: Record<string, string[]>): CompiledCodeModel {
    const cleanCode: Record<string, string[]> = {};
    const anchorIndex: Record<string, Record<string, CodeAnchorTarget>> = {};

    for (const [lang, lines] of Object.entries(rawLanguages)) {
      const parsed = this.parseLanguageLines(lines);
      cleanCode[lang] = parsed.cleanLines;
      anchorIndex[lang] = parsed.anchors;
    }

    const compiled: CompiledCodeModel = { cleanCode, anchorIndex };
    this.registry.set(key, compiled);
    return compiled;
  }

  /**
   * 解析单语言代码行数组，提取锚点并清洗源码
   */
  public parseLanguageLines(rawLines: string[]): { cleanLines: string[]; anchors: Record<string, CodeAnchorTarget> } {
    const cleanLines: string[] = [];
    const anchors: Record<string, CodeAnchorTarget> = {};

    // 锚点正则匹配：支持任意位置出现的 @step:name 或 @step:name(ctx:...)
    const anchorRegex = /@step:([a-zA-Z0-9_-]+)(?:\(([^)]+)\))?/g;

    rawLines.forEach((rawLine, index) => {
      const lineNum = index + 1; // 1-based 行号
      let lineClean = rawLine;
      let match: RegExpExecArray | null;

      // 提取本行所有 @step 标签
      const matches: Array<{ name: string; ctxStr?: string }> = [];
      while ((match = anchorRegex.exec(rawLine)) !== null) {
        matches.push({
          name: match[1],
          ctxStr: match[2],
        });
      }

      if (matches.length > 0) {
        matches.forEach(({ name, ctxStr }) => {
          const target: CodeAnchorTarget = { primary: lineNum };
          if (ctxStr) {
            // 解析 ctx 参数，例如 ctx:loop-outer 或 ctx:5,6
            const ctxParts = ctxStr.split(',').map((s) => s.trim());
            const numericContext: number[] = [];
            ctxParts.forEach((part) => {
              if (part.startsWith('ctx:')) {
                part = part.slice(4).trim();
              }
              const num = parseInt(part, 10);
              if (!isNaN(num)) {
                numericContext.push(num);
              }
            });
            if (numericContext.length > 0) {
              target.context = numericContext.length === 1 ? numericContext[0] : numericContext;
            }
          }
          anchors[name] = target;
        });

        // 清洗行内锚点标签：移除 @step:xxx 注释
        lineClean = rawLine.replace(/@step:[a-zA-Z0-9_-]+(?:\([^)]+\))?/g, '');
        // 如果清洗后只留下尾部空格或空的单行注释标记，做修剪
        lineClean = lineClean.replace(/\/\/\s*$/, '').replace(/#\s*$/, '').replace(/\/\*\s*\*\//, '').trimEnd();
      }

      cleanLines.push(lineClean);
    });

    return { cleanLines, anchors };
  }

  /**
   * 解析某个算法阶段在特定语言下的高亮目标
   */
  public resolveHighlight(key: string, anchor: string, lang = 'java'): ResolvedHighlightTarget | null {
    const compiled = this.registry.get(key);
    if (!compiled) return null;

    const langAnchors = compiled.anchorIndex[lang] || compiled.anchorIndex['java'] || compiled.anchorIndex['javascript'];
    if (!langAnchors) return null;

    const target = langAnchors[anchor];
    if (!target) return null;

    if (target.context !== undefined) {
      return {
        primary: target.primary,
        context: target.context,
      };
    }
    return target.primary;
  }

  /**
   * 获取某算法某语言清洗后的源码数组
   */
  public getCleanCode(key: string, lang = 'java'): string[] | null {
    const compiled = this.registry.get(key);
    if (!compiled) return null;
    return compiled.cleanCode[lang] || compiled.cleanCode['java'] || null;
  }

  /**
   * 检查指定锚点是否存在
   */
  public hasAnchor(key: string, anchor: string, lang = 'java'): boolean {
    const compiled = this.registry.get(key);
    if (!compiled) return false;
    const langAnchors = compiled.anchorIndex[lang] || compiled.anchorIndex['java'];
    return Boolean(langAnchors && langAnchors[anchor]);
  }

  /**
   * 清除所有已注册的编译模型（用于测试重置）
   */
  public clear(): void {
    this.registry.clear();
  }
}

export const codeStepIndexer = CodeStepIndexer.getInstance();
