/**
 * 算法分类学与多维检索领域模型 (AlgoSearchCatalog) - 领域模型与深模块 (Deep Module)
 * 纯领域模型，不依赖任何 DOM 或浏览器上下文，提供：
 * 1. 关卡大纲全局有序拓扑排序 (Curriculum Topological Ordering)
 * 2. 算法前驱与后继双向链表寻址 (Bidirectional Navigation State Computation)
 * 3. 算法名称、描述、分类与学习目标的多维分词倒排检索 (Multi-Field Search & Inverted Indexing)
 * 4. 分类学树形分组与排序聚类 (Taxonomy Category Grouping & Hierarchy)
 * 5. 关键词高亮片段安全切分 (Highlight Segmentation)
 */

import { algorithmManager, AlgorithmConfig } from './algorithm-manager';
import { CATEGORY_CONFIG, CategoryConfig } from './category-config';

export interface CategoryGroup {
  category: string;
  config: CategoryConfig;
  algorithms: AlgorithmConfig[];
}

export interface HighlightSegment {
  text: string;
  isMatch: boolean;
}

export interface SearchCatalogResult {
  query: string;
  totalMatches: number;
  groups: CategoryGroup[];
  matchedAlgorithms: AlgorithmConfig[];
}

export interface NavigationLinkState {
  prev: AlgorithmConfig | null;
  next: AlgorithmConfig | null;
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
  public getOrderedAlgorithms(algorithms?: AlgorithmConfig[]): AlgorithmConfig[] {
    const list = algorithms || algorithmManager.getAllAlgorithms();
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
    algorithms?: AlgorithmConfig[]
  ): NavigationLinkState {
    const list = this.getOrderedAlgorithms(algorithms);
    const total = list.length;
    if (!currentAlgorithmId || total === 0) {
      return { prev: null, next: null, currentIndex: -1, total };
    }

    const index = list.findIndex((a) => a.id === currentAlgorithmId);
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
  public groupCategories(algorithms?: AlgorithmConfig[]): CategoryGroup[] {
    const list = algorithms || this.getOrderedAlgorithms();
    const map = new Map<string, AlgorithmConfig[]>();

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
   * 多维即时分词检索
   * 匹配范围：算法名称 (name)、分类名称 (category name)、详细描述 (description)、学习目标 (learningGoal)
   */
  public search(query: string, algorithms?: AlgorithmConfig[]): SearchCatalogResult {
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

    const matchedAlgorithms = rawList.filter((algo) => {
      const catConfig = CATEGORY_CONFIG[algo.category];
      const nameMatch = (algo.name || '').toLowerCase().includes(cleanQuery);
      const descMatch = (algo.description || '').toLowerCase().includes(cleanQuery);
      const catMatch = (catConfig?.name || algo.category || '').toLowerCase().includes(cleanQuery);
      const goalMatch = (algo.learningGoal || '').toLowerCase().includes(cleanQuery);
      return nameMatch || descMatch || catMatch || goalMatch;
    });

    const groups = this.groupCategories(matchedAlgorithms);
    return {
      query: cleanQuery,
      totalMatches: matchedAlgorithms.length,
      groups,
      matchedAlgorithms
    };
  }

  /**
   * 将文本拆分为高亮与非高亮结构化片段
   */
  public splitHighlightSegments(text: string, query: string): HighlightSegment[] {
    if (!text) return [];
    const cleanQuery = query ? query.trim() : '';
    if (!cleanQuery) {
      return [{ text, isMatch: false }];
    }

    const escaped = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    return parts
      .filter((p) => p.length > 0)
      .map((part) => ({
        text: part,
        isMatch: part.toLowerCase() === cleanQuery.toLowerCase()
      }));
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
