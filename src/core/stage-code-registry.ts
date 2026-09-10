/**
 * StageCodeRegistry — 消除多算法族 stage-codes 注册层样板代码的泛型工厂
 *
 * 5 个 stage-codes 文件（knapsack / bounded-knapsack / knapsack-special /
 * string-dp / knapsack-073）原本各自手写 TEMPLATE_MAP + register + getAnchor，
 * 结构完全相同，仅 key 前缀与 Kind 类型不同。
 *
 * 本模块将注册与锚点解析收拢到单一深模块，各算法族只需提供
 * `Record<kind, Record<stage, langs>>` 形式的 flat composite-key 模板映射。
 */

import { codeStepIndexer, type ResolvedHighlightTarget } from './code-step-indexer';

/** Flat composite-key 模板映射：每个 key 是 `prefix:kind:stage` */
export type StageCodeMap = Record<string, Record<string, string[]>>;

/** 锚点编译产物：4 语种各自的 1-based 物理行号 */
export interface ResolvedAnchorTarget {
  java: number;
  cpp: number;
  python: number;
  javascript: number;
}

export interface StageCodeRegistry<K extends string> {
  /** 将所有模板注册到 CodeStepIndexer（应在模块加载时调用） */
  register(): void;
  /** 根据阶段、kind、anchor 解析 4 语种物理行号（结构上兼容 HighlightTarget） */
  getAnchor(stage: number, kind: K, anchor: string): ResolvedAnchorTarget;
}

/** 将 resolveHighlight 的宽返回值归一化为单一 1-based 行号 */
function toLineNumber(resolved: ResolvedHighlightTarget | null): number | null {
  if (resolved == null) return null;
  if (typeof resolved === 'number') return resolved;
  if (Array.isArray(resolved)) return resolved[0] ?? null;
  if (typeof resolved === 'object' && 'primary' in resolved) {
    const p = resolved.primary;
    if (typeof p === 'number') return p;
    return p[0] ?? null;
  }
  return null;
}

/**
 * 创建一个 StageCodeRegistry 实例。
 *
 * @param prefix    key 前缀，如 `'bk'`, `'sk'`, `'k073'`
 * @param map       flat composite-key 模板映射，key 格式为 `${prefix}:${kind}:s${stage}`
 * @returns         带有 register() 与 getAnchor() 的注册表实例
 */
export function createStageCodeRegistry<K extends string>(
  prefix: string,
  map: StageCodeMap
): StageCodeRegistry<K> {
  return {
    register() {
      for (const [key, langs] of Object.entries(map)) {
        codeStepIndexer.register(`${prefix}:${key}`, langs);
      }
    },

    getAnchor(stage, kind, anchor) {
      const key = `${prefix}:${kind}:s${stage}`;
      const fallback: ResolvedAnchorTarget = { java: 1, cpp: 1, python: 1, javascript: 1 };

      const java = toLineNumber(codeStepIndexer.resolveHighlight(key, anchor, 'java'));
      const cpp = toLineNumber(codeStepIndexer.resolveHighlight(key, anchor, 'cpp'));
      const python = toLineNumber(codeStepIndexer.resolveHighlight(key, anchor, 'python'));
      const javascript = toLineNumber(codeStepIndexer.resolveHighlight(key, anchor, 'javascript'));

      if (java != null || cpp != null || python != null || javascript != null) {
        return {
          java: java ?? fallback.java,
          cpp: cpp ?? fallback.cpp,
          python: python ?? fallback.python,
          javascript: javascript ?? fallback.javascript,
        };
      }
      return fallback;
    },
  };
}
