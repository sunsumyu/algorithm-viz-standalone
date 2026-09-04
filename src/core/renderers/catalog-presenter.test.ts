import { describe, it, expect, vi, beforeEach } from 'vitest';
import { catalogPresenter, CatalogPresenter } from './catalog-presenter';
import type { AlgorithmMetadata } from '../registry';
import type { CategoryGroup } from '../algo-search-catalog';

// ================= Mock DOM Implementation for Node Environment =================
class MockElement {
  public tagName: string;
  public className = '';
  public id = '';
  public dataset: Record<string, string> = {};
  public style: {
    setProperty: (k: string, v: string) => void;
    [key: string]: any;
  } = {
    setProperty: vi.fn(),
  };
  private _innerHTML = '';
  public children: MockElement[] = [];
  public parentElement: MockElement | null = null;
  private listeners: Record<string, Array<(e: any) => void>> = {};

  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
  }

  public get innerHTML(): string {
    return this._innerHTML;
  }

  public set innerHTML(val: string) {
    this._innerHTML = val;
    this.children = [];
    if (!val) return;

    const tagRegex = /<([a-zA-Z0-9]+)([^>]*)>/g;
    let match;
    while ((match = tagRegex.exec(val)) !== null) {
      const tag = match[1];
      const attrs = match[2];
      const el = new MockElement(tag);
      const classMatch = attrs.match(/class="([^"]+)"/);
      if (classMatch) el.className = classMatch[1];
      const idMatch = attrs.match(/id="([^"]+)"/);
      if (idMatch) el.id = idMatch[1];
      if (el.className.includes('search-highlight')) {
        el.textContent = '排序';
      }
      this.children.push(el);
    }
  }

  public get textContent(): string {
    return this._innerHTML.replace(/<[^>]*>/g, '');
  }

  public set textContent(val: string) {
    this._innerHTML = val;
  }

  public get classList() {
    const self = this;
    return {
      add(...cls: string[]) {
        const set = new Set(self.className.split(' ').filter(Boolean));
        cls.forEach((c) => set.add(c));
        self.className = Array.from(set).join(' ');
      },
      remove(...cls: string[]) {
        const set = new Set(self.className.split(' ').filter(Boolean));
        cls.forEach((c) => set.delete(c));
        self.className = Array.from(set).join(' ');
      },
      contains(cls: string) {
        return self.className.split(' ').includes(cls);
      },
    };
  }

  public appendChild<T extends MockElement>(child: T): T {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  public addEventListener(event: string, handler: (e: any) => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }

  public dispatchEvent(event: { type: string; preventDefault?: () => void; stopPropagation?: () => void }) {
    (this.listeners[event.type] || []).forEach((h) => h(event));
  }

  public querySelector(selector: string): MockElement | null {
    const res = this.querySelectorAll(selector);
    return res.length > 0 ? res[0] : null;
  }

  public querySelectorAll(selector: string): MockElement[] {
    const results: MockElement[] = [];

    const matchesSelector = (node: MockElement, sel: string): boolean => {
      // Attribute selector like [data-category="all"] or .category-item[data-category="all"]
      const attrMatch = sel.match(/\[([a-zA-Z0-9_-]+)="([^"]+)"\]/);
      if (attrMatch) {
        const attrKey = attrMatch[1].replace('data-', '');
        if (node.dataset[attrKey] !== attrMatch[2]) return false;
        sel = sel.replace(attrMatch[0], '');
        if (!sel) return true;
      }

      if (sel.startsWith('.')) {
        const targetClass = sel.slice(1);
        return node.className.split(' ').includes(targetClass);
      } else if (sel.startsWith('#')) {
        const targetId = sel.slice(1);
        return node.id === targetId;
      }
      return false;
    };

    const traverse = (node: MockElement) => {
      if (matchesSelector(node, selector)) {
        results.push(node);
      }
      node.children.forEach(traverse);
    };

    this.children.forEach(traverse);
    return results;
  }
}

// 注入 globalThis.document
if (typeof document === 'undefined') {
  (globalThis as any).document = {
    createElement: (tag: string) => new MockElement(tag),
  };
}

describe('CatalogPresenter Deep Module', () => {
  let container: MockElement;

  const mockAlgorithms: AlgorithmMetadata[] = [
    {
      id: 'quick-sort',
      name: '快速排序',
      category: 'sort',
      difficulty: 2,
      description: '经典分治排序算法',
      learningGoal: '掌握双指针分区思想',
      levelOrder: 1,
      viewId: 'quick-sort-view',
      icon: '⚡',
    },
    {
      id: 'binary-search',
      name: '二分查找',
      category: 'search',
      difficulty: 1,
      description: '折半查找有序数组',
      learningGoal: '理解区间开闭原则',
      levelOrder: 1,
      viewId: 'binary-search-view',
      icon: '🔍',
    },
    {
      id: 'custom-algo',
      name: '自定义演示',
      category: 'other',
      difficulty: 3,
      description: '高级复杂算法',
      levelOrder: 2,
      viewId: 'custom-algo-view',
      icon: '📄',
    },
  ];

  beforeEach(() => {
    container = new MockElement('div');
  });

  it('should be a singleton instance', () => {
    expect(catalogPresenter).toBeInstanceOf(CatalogPresenter);
    expect(CatalogPresenter.getInstance()).toBe(catalogPresenter);
  });

  describe('renderCategoryNav', () => {
    it('should render all, recent and category items', () => {
      const onSelectCategory = vi.fn();
      const onSelectAlgorithm = vi.fn();
      const onToggleCategory = vi.fn();
      const expandedCategories = new Set<string>(['sort']);

      catalogPresenter.renderCategoryNav(container as any, {
        algorithms: mockAlgorithms,
        currentCategory: 'all',
        expandedCategories,
        recentCount: 5,
        onSelectCategory,
        onSelectAlgorithm,
        onToggleCategory,
      });

      // All and Recent buttons
      const allItem = container.querySelector('.category-item[data-category="all"]');
      expect(allItem).toBeTruthy();
      expect(allItem?.classList.contains('active')).toBe(true);
      expect(allItem?.textContent).toContain('全部算法');
      expect(allItem?.textContent).toContain('3 个');

      const recentItem = container.querySelector('.category-item[data-category="recent"]');
      expect(recentItem).toBeTruthy();
      expect(recentItem?.textContent).toContain('最近访问');
      expect(recentItem?.textContent).toContain('5 个');

      // Click all/recent
      allItem?.dispatchEvent({ type: 'click' });
      expect(onSelectCategory).toHaveBeenCalledWith('all');

      recentItem?.dispatchEvent({ type: 'click' });
      expect(onSelectCategory).toHaveBeenCalledWith('recent');

      // Category groups
      const groups = container.querySelectorAll('.sidebar-category-group');
      expect(groups.length).toBeGreaterThan(0);

      // Expanded group levels
      const levels = container.querySelectorAll('.sidebar-level-item');
      expect(levels.length).toBe(1); // sort has 1 item
      expect(levels[0].textContent).toContain('快速排序');

      // Click level
      levels[0].dispatchEvent({ type: 'click' });
      expect(onSelectAlgorithm).toHaveBeenCalledWith('quick-sort', 'sort');

      // Toggle category
      const sortHeader = container.querySelector('.sidebar-category-header');
      sortHeader?.dispatchEvent({ type: 'click' });
      expect(onToggleCategory).toHaveBeenCalled();
    });
  });

  describe('renderSidebarRecentFooter', () => {
    it('should render empty state when recent list is empty', () => {
      catalogPresenter.renderSidebarRecentFooter(container as any, {
        recentAlgorithms: [],
        totalRecentCount: 0,
        onSelectAlgorithm: vi.fn(),
        onViewAllRecent: vi.fn(),
      });

      expect(container.innerHTML).toContain('sidebar-recent-empty');
      expect(container.textContent).toContain('暂无访问记录');
    });

    it('should render top 3 recent items and trigger callbacks', () => {
      const onSelectAlgorithm = vi.fn();
      const onViewAllRecent = vi.fn();

      catalogPresenter.renderSidebarRecentFooter(container as any, {
        recentAlgorithms: mockAlgorithms,
        totalRecentCount: 10,
        onSelectAlgorithm,
        onViewAllRecent,
      });

      const items = container.querySelectorAll('.sidebar-recent-item');
      expect(items.length).toBe(3);

      items[0].dispatchEvent({ type: 'click' });
      expect(onSelectAlgorithm).toHaveBeenCalledWith('quick-sort');
    });
  });

  describe('renderCardGrid', () => {
    it('should render cards with icons, tags and learning goals', () => {
      const onCardClick = vi.fn();

      catalogPresenter.renderCardGrid(container as any, {
        algorithms: mockAlgorithms,
        searchQuery: '排序',
        currentCategory: 'all',
        onCardClick,
      });

      const cards = container.querySelectorAll('.algo-card');
      expect(cards.length).toBe(3);

      const firstCard = cards[0];
      expect(firstCard.innerHTML).toContain('⚡'); // quick-sort icon
      expect(firstCard.innerHTML).toContain('search-highlight');
      expect(firstCard.innerHTML).toContain('双指针');

      firstCard.dispatchEvent({ type: 'click' });
      expect(onCardClick).toHaveBeenCalledWith(mockAlgorithms[0]);
    });

    it('should render search empty state when no results', () => {
      catalogPresenter.renderCardGrid(container as any, {
        algorithms: [],
        searchQuery: '不存在的词',
        currentCategory: 'all',
        onCardClick: vi.fn(),
      });

      expect(container.innerHTML).toContain('no-results');
      expect(container.textContent).toContain('没有找到匹配的算法');
    });

    it('should render recent empty state when recent has 0 items', () => {
      catalogPresenter.renderCardGrid(container as any, {
        algorithms: [],
        searchQuery: '',
        currentCategory: 'recent',
        onCardClick: vi.fn(),
      });

      expect(container.innerHTML).toContain('empty-state');
      expect(container.textContent).toContain('暂无最近访问记录');
    });
  });

  describe('renderDrawerContent', () => {
    it('should render recent chips and category groups in drawer', () => {
      const onSelectAlgorithm = vi.fn();
      const onToggleCategory = vi.fn();
      const onClearRecent = vi.fn();

      const groups: CategoryGroup[] = [
        {
          category: 'sort',
          config: { name: '排序算法', icon: '📊', color: '#f38ba8', colorRgb: '243, 139, 168', order: 1 },
          algorithms: [mockAlgorithms[0]],
        },
      ];

      catalogPresenter.renderDrawerContent(container as any, {
        groups,
        totalMatches: 1,
        searchQuery: '',
        currentAlgorithmId: 'quick-sort',
        expandedCategories: new Set(['sort']),
        recentAlgorithms: [mockAlgorithms[0]],
        onSelectAlgorithm,
        onToggleCategory,
        onClearRecent,
      });

      // Recent chips
      const chips = container.querySelectorAll('.drawer-recent-chip');
      expect(chips.length).toBe(1);
      expect(chips[0].className).toContain('is-active');

      // Category group
      const drawerItem = container.querySelector('.drawer-item');
      expect(drawerItem?.className).toContain('is-active');
      expect(drawerItem?.innerHTML).toContain('正在学习');

      drawerItem?.dispatchEvent({ type: 'click' });
      expect(onSelectAlgorithm).toHaveBeenCalledWith('quick-sort');
    });

    it('should render drawer empty state when totalMatches is 0', () => {
      catalogPresenter.renderDrawerContent(container as any, {
        groups: [],
        totalMatches: 0,
        searchQuery: '找不到',
        currentAlgorithmId: null,
        expandedCategories: new Set(),
        recentAlgorithms: [],
        onSelectAlgorithm: vi.fn(),
        onToggleCategory: vi.fn(),
        onClearRecent: vi.fn(),
      });

      expect(container.innerHTML).toContain('drawer-empty-state');
      expect(container.textContent).toContain('未找到与 "找不到" 相关的算法');
    });
  });
});
