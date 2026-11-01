/**
 * 算法分类学与多维检索领域模型 (AlgoSearchCatalog) - 领域模型与深模块 (Deep Module)
 * 纯领域模型，不依赖任何 DOM 或浏览器上下文，提供：
 * 1. 关卡大纲全局有序拓扑排序 (Curriculum Topological Ordering)
 * 2. 算法前驱与后继双向链表寻址 (Bidirectional Navigation State Computation)
 * 3. 算法名称、描述、分类与学习目标的多维分词倒排检索 (Multi-Field Search & Inverted Indexing)
 * 4. 分类学树形分组与排序聚类 (Taxonomy Category Grouping & Hierarchy)
 * 5. 关键词高亮片段安全切分 (Highlight Segmentation)
 */

import { algorithmRegistry } from './algorithm-registry';
import type { AlgorithmMetadata } from './registry';
import { CATEGORY_CONFIG, CategoryConfig } from './category-config';

export interface CategoryGroup {
  category: string;
  config: CategoryConfig;
  algorithms: AlgorithmMetadata[];
}

export interface HighlightSegment {
  text: string;
  isMatch: boolean;
}

export interface SearchCatalogResult {
  query: string;
  totalMatches: number;
  groups: CategoryGroup[];
  matchedAlgorithms: AlgorithmMetadata[];
}

export interface NavigationLinkState {
  prev: AlgorithmMetadata | null;
  next: AlgorithmMetadata | null;
  currentIndex: number;
  total: number;
}

export class AlgoSearchCatalog {
  private static instance: AlgoSearchCatalog;

  public static getInstance(): AlgoSearchCatalog {
    if (!AlgoSearchCatalog.instance) {
      AlgoSearchCatalog.instance = new AlgoSearchCatalog();
    }
    return AlgoSearchCatalog.instance;
  }

  /**
   * 获取按关卡大纲有序排列的算法清单
   * 遵循先按分类预设优先级，再按关卡序号 (levelOrder) 严格排序
   */
  public getOrderedAlgorithms(algorithms?: AlgorithmMetadata[]): AlgorithmMetadata[] {
    const list = algorithms || algorithmRegistry.getAllMetadata();
    return [...list].sort((a, b) => {
      const orderA = CATEGORY_CONFIG[a.category]?.order ?? 999;
      const orderB = CATEGORY_CONFIG[b.category]?.order ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return (a.levelOrder ?? 999) - (b.levelOrder ?? 999);
    });
  }

  /**
   * 计算指定算法的前驱与后继算法及导航索引
   */
  public getPrevAndNext(
    currentAlgorithmId: string | null,
    algorithms?: AlgorithmMetadata[]
  ): NavigationLinkState {
    const list = this.getOrderedAlgorithms(algorithms);
    const total = list.length;
    if (!currentAlgorithmId || total === 0) {
      return { prev: null, next: null, currentIndex: -1, total };
    }

    let index = list.findIndex((a) => a.id === currentAlgorithmId);
    if (index === -1) {
      index = list.findIndex((a) => a.aliases && a.aliases.includes(currentAlgorithmId));
    }
    if (index === -1) {
      return { prev: null, next: null, currentIndex: -1, total };
    }

    const prev = index > 0 ? list[index - 1] : null;
    const next = index < total - 1 ? list[index + 1] : null;
    return { prev, next, currentIndex: index, total };
  }

  /**
   * 将算法列表聚类为有序分类组
   */
  public groupCategories(algorithms?: AlgorithmMetadata[]): CategoryGroup[] {
    const list = algorithms || this.getOrderedAlgorithms();
    const map = new Map<string, AlgorithmMetadata[]>();

    list.forEach((algo) => {
      const cat = algo.category || 'other';
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(algo);
    });

    const sortedCategoryKeys = Array.from(map.keys()).sort((a, b) => {
      const orderA = CATEGORY_CONFIG[a]?.order ?? 999;
      const orderB = CATEGORY_CONFIG[b]?.order ?? 999;
      return orderA - orderB;
    });

    return sortedCategoryKeys.map((catKey) => {
      const config = CATEGORY_CONFIG[catKey] || {
        name: catKey,
        icon: '📁',
        color: '#89b4fa',
        colorRgb: '137, 180, 250',
        order: 999
      };
      return {
        category: catKey,
        config,
        algorithms: map.get(catKey)!
      };
    });
  }

  /**
   * 多维即时粗匹配检索 (Fuzzy Multi-Field Search)
   * 匹配范围：算法名称 (name)、id、别名 (aliases)、分类名称 (category name)、详细描述 (description)、学习目标 (learningGoal)
   * 粗匹配能力：分词 AND（乱序）、全角/罗马数字归一化、驼峰拆分、中文子序列（容忍虚词省略）
   */
  public search(query: string, algorithms?: AlgorithmMetadata[]): SearchCatalogResult {
    const rawList = algorithms || this.getOrderedAlgorithms();
    const cleanQuery = query.trim().toLowerCase();

    if (!cleanQuery) {
      const groups = this.groupCategories(rawList);
      return {
        query: '',
        totalMatches: rawList.length,
        groups,
        matchedAlgorithms: rawList
      };
    }

    const tokens = AlgoSearchCatalog.tokenizeQuery(query);
    const matchedAlgorithms =
      tokens.length === 0
        ? []
        : rawList.filter((algo) => tokens.every((token) => AlgoSearchCatalog.tokenMatches(token, algo)));

    const groups = this.groupCategories(matchedAlgorithms);
    return {
      query: cleanQuery,
      totalMatches: matchedAlgorithms.length,
      groups,
      matchedAlgorithms
    };
  }

  /**
   * 全角 → 半角、罗马数字 → 阿拉伯数字归一化
   */
  private static romanToInt(s: string): number {
    const map: Record<string, number> = { i: 1, v: 5, x: 10, l: 50, c: 100, d: 500, m: 1000 };
    let n = 0;
    for (let i = 0; i < s.length; i++) {
      const v = map[s[i]] ?? 0;
      const nv = map[s[i + 1]] ?? 0;
      n += v < nv ? -v : v;
    }
    return n;
  }

  private static toHalfWidth(text: string): string {
    return text.replace(/[\uff01-\uff5e]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
  }

  private static normalizeText(text: string): string {
    return AlgoSearchCatalog.toHalfWidth(text || '')
      .toLowerCase()
      .replace(/\b[ivxlcdm]+\b/g, (m) => String(AlgoSearchCatalog.romanToInt(m)))
      .replace(/[^0-9a-z\u4e00-\u9fff]+/g, '');
  }

  /**
   * 查询分词：空白与常用分隔符切分；保留原始大小写做驼峰拆分（maxDepth → max + Depth）；
   * lc/leetcode+数字简写展开为 leetcode<N> 标记（lc77 / LC77 / leetcode77 → leetcode77）
   */
  private static tokenizeQuery(query: string): string[] {
    const half = AlgoSearchCatalog.toHalfWidth(query || '');
    const chunks = half.split(/[\s,，。；;、:：()（）\[\]【】#|'"]+/).filter(Boolean);
    const tokens: string[] = [];
    for (const chunk of chunks) {
      const lcNum = chunk.match(/^(?:lc|leetcode)(\d+)$/i);
      if (lcNum) {
        tokens.push(`leetcode${lcNum[1]}`);
        continue;
      }
      for (const part of chunk.split(/(?<=[a-z])(?=[A-Z])|(?<=[A-Za-z])(?=\d)|_+/)) {
        if (AlgoSearchCatalog.normalizeText(part)) tokens.push(part);
      }
    }
    return tokens;
  }

  /**
   * 单标记 × 单算法匹配：任一字段命中即可；中文标记额外支持子序列粗匹配（容忍「的/之」等虚词省略）
   */
  private static tokenMatches(token: string, algo: AlgorithmMetadata): boolean {
    const norm = AlgoSearchCatalog.normalizeText(token);
    if (!norm) return true;
    const catConfig = CATEGORY_CONFIG[algo.category];
    const fields = [
      algo.name,
      algo.id,
      ...(algo.aliases ?? []),
      catConfig?.name ?? algo.category,
      algo.description,
      algo.learningGoal
    ].map((field) => AlgoSearchCatalog.normalizeText(field ?? ''));

    const isCjk = /[\u4e00-\u9fff]/.test(norm);
    return fields.some(
      (field) =>
        field.includes(norm) || (isCjk && norm.length >= 2 && AlgoSearchCatalog.isSubsequence(norm, field))
    );
  }

  private static isSubsequence(needle: string, haystack: string): boolean {
    let i = 0;
    for (let j = 0; j < haystack.length && i < needle.length; j++) {
      if (haystack[j] === needle[i]) i++;
    }
    return i === needle.length;
  }

  /**
   * 将文本拆分为高亮与非高亮结构化片段
   * 全查询为字面子串时精确高亮（既有契约）；否则回退按分词逐词高亮（粗匹配回显）
   */
  public splitHighlightSegments(text: string, query: string): HighlightSegment[] {
    if (!text) return [];
    const cleanQuery = query ? query.trim() : '';
    if (!cleanQuery) {
      return [{ text, isMatch: false }];
    }

    const escaped = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    if (parts.some((p) => p.toLowerCase() === cleanQuery.toLowerCase())) {
      return parts
        .filter((p) => p.length > 0)
        .map((part) => ({
          text: part,
          isMatch: part.toLowerCase() === cleanQuery.toLowerCase()
        }));
    }

    const tokens = [...new Set(AlgoSearchCatalog.tokenizeQuery(cleanQuery))]
      .filter((t) => AlgoSearchCatalog.normalizeText(t))
      .sort((a, b) => b.length - a.length);
    if (tokens.length === 0) {
      return [{ text, isMatch: false }];
    }

    // 命中掩码：字面命中的词直接标记；中文词字面未命中时退化为子序列逐字标记
    const lowerText = text.toLowerCase();
    const mask = new Array<boolean>(text.length).fill(false);
    const literallyFound = new Set<string>();
    for (const token of tokens) {
      const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      let found = false;
      for (const m of lowerText.matchAll(new RegExp(escapedToken, 'gi'))) {
        for (let i = m.index; i < m.index + token.length; i++) mask[i] = true;
        found = true;
      }
      if (found) literallyFound.add(token);
    }
    for (const token of tokens) {
      if (literallyFound.has(token) || !/[\u4e00-\u9fff]/.test(token)) continue;
      let i = 0;
      for (let j = 0; j < text.length && i < token.length; j++) {
        if (lowerText[j] === token.toLowerCase()[i]) {
          mask[j] = true;
          i++;
        }
      }
    }

    const segments: HighlightSegment[] = [];
    for (let i = 0; i < text.length; i++) {
      if (segments.length > 0 && segments[segments.length - 1].isMatch === mask[i]) {
        segments[segments.length - 1].text += text[i];
      } else {
        segments.push({ text: text[i], isMatch: mask[i] });
      }
    }
    return segments;
  }

  /**
   * 生成安全的高亮 HTML 字符串
   */
  public highlightHtml(text: string, query: string, highlightClass: string = 'drawer-highlight'): string {
    const segments = this.splitHighlightSegments(text, query);
    return segments
      .map((seg) => {
        const safeText = this.escapeHtml(seg.text);
        return seg.isMatch ? `<span class="${highlightClass}">${safeText}</span>` : safeText;
      })
      .join('');
  }

  /**
   * 纯字符串级别的 HTML 实体转义
   */
  public escapeHtml(str: string): string {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

export const algoSearchCatalog = AlgoSearchCatalog.getInstance();
