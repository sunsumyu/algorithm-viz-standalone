/**
 * Algorithm Viz Plugin — 关卡链重构版
 * 难度标签 + 关卡排序 + 侧边栏关卡链
 */

import type { Plugin, PluginContext } from '../../core/types';
import { algorithmRegistry } from '../../core/algorithm-registry';
import { viewMountEngine } from '../../core/view-mount-engine';
import type { AlgorithmMetadata } from '../../core/registry';
import { SplitterEngine } from '../../core/splitter-engine';
import { getRecentAlgorithmIds } from '../../core/recent-algorithms';
import {
  getSearchHistory,
  addSearchHistory,
  removeSearchHistory,
  clearSearchHistory,
} from './search-history';
import { CATEGORY_CONFIG } from '../../core/category-config';
import { algoSearchCatalog } from '../../core/algo-search-catalog';
import { catalogPresenter } from '../../core/renderers/catalog-presenter';
import {
  CourseType,
  getCourseStats,
  filterAlgorithmsByCourse,
} from '../../core/curriculum-filter';

// ========== State ==========
let currentCategory: string = 'all';
let currentCourse: CourseType = 'all';
let searchQuery: string = '';
let allAlgorithms: AlgorithmMetadata[] = [];
/** 展开的分类集合 */
let expandedCategories: Set<string> = new Set();
/** 搜索键盘快捷键处理器引用，用于 destroy 时移除 */
let _searchKeydownHandler: ((e: KeyboardEvent) => void) | null = null;

// ========== DOM Helpers ==========
const $ = (id: string) => document.getElementById(id);

// ========== Course Filter UI ==========
function renderCourseFilterUI(): void {
  const contentTabs = $('content-course-tabs-container');
  const sidebarFilter = $('sidebar-course-filter-container');
  const stats = getCourseStats(allAlgorithms);

  if (contentTabs) {
    catalogPresenter.renderCourseFilterTabs(contentTabs, currentCourse, stats, (course) => {
      setCourse(course);
    });
  }

  if (sidebarFilter) {
    catalogPresenter.renderSidebarCourseFilter(sidebarFilter, currentCourse, stats, (course) => {
      setCourse(course);
    });
  }
}

function setCourse(course: CourseType): void {
  if (currentCourse === course) return;
  currentCourse = course;
  renderCourseFilterUI();
  updateContentHeader();
  renderCards();
  renderSidebarCategories();
}

// ========== Render Sidebar Categories (委托给 CatalogPresenter 深模块) ==========
function renderSidebarCategories(): void {
  const container = $('sidebar-categories');
  if (!container) return;

  const recentIds = getRecentAlgorithmIds();
  const filteredAlgos = filterAlgorithmsByCourse(allAlgorithms, currentCourse);

  catalogPresenter.renderCategoryNav(container, {
    algorithms: filteredAlgos,
    currentCategory,
    expandedCategories,
    recentCount: recentIds.length,
    onSelectCategory: (category) => selectCategory(category),
    onSelectAlgorithm: (algoId, category) => {
      selectCategory(category);
      viewMountEngine.showAlgorithm(algoId);
    },
    onToggleCategory: (category, expanded) => {
      if (expanded) {
        expandedCategories.add(category);
        selectCategory(category);
      } else {
        expandedCategories.delete(category);
        renderSidebarCategories();
      }
    },
  });

  renderSidebarRecentFooter();
}

// ========== Render Sidebar Recent Footer (最底部的最近访问 3 个算法) ==========
function renderSidebarRecentFooter(): void {
  const container = $('sidebar-recent-footer');
  if (!container) return;

  const recentIds = getRecentAlgorithmIds();
  const top3Ids = recentIds.slice(0, 3);
  const top3Algos = top3Ids
    .map((id) => allAlgorithms.find((a) => a.id === id))
    .filter((a): a is AlgorithmMetadata => Boolean(a));

  catalogPresenter.renderSidebarRecentFooter(container, {
    recentAlgorithms: top3Algos,
    totalRecentCount: recentIds.length,
    onSelectAlgorithm: (algoId) => viewMountEngine.showAlgorithm(algoId),
    onViewAllRecent: () => selectCategory('recent'),
  });
}

// ========== Select Category ==========
function selectCategory(category: string): void {
  currentCategory = category;

  // Update sidebar active state
  const items = document.querySelectorAll('.category-item');
  items.forEach(item => {
    if (item instanceof HTMLElement) {
      item.classList.toggle('active', item.dataset.category === category);
    }
  });

  // Update title
  updateContentHeader();
  renderCards();
  renderSidebarCategories();
}

// ========== Update Content Header ==========
function updateContentHeader(): void {
  const titleEl = $('content-title');
  const countEl = $('result-count');
  if (!titleEl || !countEl) return;

  const visibleCards = getVisibleCards();
  const courseFiltered = filterAlgorithmsByCourse(allAlgorithms, currentCourse);

  if (searchQuery.trim()) {
    titleEl.innerHTML = `搜索结果`;
    countEl.textContent = `(${visibleCards.length} 个匹配)`;
  } else if (currentCategory === 'all') {
    if (currentCourse === 'zuo') {
      titleEl.innerHTML = `🎓 算法通关课`;
      countEl.textContent = `(${courseFiltered.length} 关)`;
    } else if (currentCourse === 'standard') {
      titleEl.innerHTML = `📘 经典题库`;
      countEl.textContent = `(${courseFiltered.length} 关)`;
    } else {
      titleEl.innerHTML = `全部算法`;
      countEl.textContent = `(${allAlgorithms.length} 个)`;
    }
  } else if (currentCategory === 'recent') {
    const recentCount = getRecentAlgorithmIds().length;
    titleEl.innerHTML = `🕒 最近访问`;
    countEl.textContent = `(${recentCount} 个记录)`;
  } else {
    const config = CATEGORY_CONFIG[currentCategory] || { name: currentCategory, icon: '📁' };
    const count = courseFiltered.filter((a) => a.category === currentCategory).length;
    titleEl.innerHTML = `${config.icon} ${config.name}`;
    countEl.textContent = `(${count} 关)`;
  }
}

// ========== Get Visible Cards ==========
function getVisibleCards(): AlgorithmMetadata[] {
  const courseFiltered = filterAlgorithmsByCourse(allAlgorithms, currentCourse);

  if (currentCategory === 'recent') {
    const recentIds = getRecentAlgorithmIds();
    let recentAlgos = recentIds
      .map(id => courseFiltered.find(a => a.id === id))
      .filter((a): a is AlgorithmMetadata => Boolean(a));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      recentAlgos = recentAlgos.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        (a.category && CATEGORY_CONFIG[a.category]?.name.toLowerCase().includes(q))
      );
    }
    return recentAlgos;
  }

  let filtered = courseFiltered;

  // Filter by category
  if (currentCategory !== 'all') {
    filtered = filtered.filter(a => a.category === currentCategory);
  }

  // Filter by search
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      (a.category && CATEGORY_CONFIG[a.category]?.name.toLowerCase().includes(q))
    );
  }

  // Sort by levelOrder (primary) then by category order
  filtered.sort((a, b) => {
    if (a.category !== b.category) {
      const orderA = CATEGORY_CONFIG[a.category]?.order ?? 999;
      const orderB = CATEGORY_CONFIG[b.category]?.order ?? 999;
      return orderA - orderB;
    }
    return (a.levelOrder ?? 999) - (b.levelOrder ?? 999);
  });

  return filtered;
}

// ========== Render Cards (委托给 CatalogPresenter 深模块) ==========
function renderCards(): void {
  const grid = $('cards-grid');
  if (!grid) return;

  const cards = getVisibleCards();
  catalogPresenter.renderCardGrid(grid, {
    algorithms: cards,
    searchQuery,
    currentCategory,
    onCardClick: (algo) => {
      if (searchQuery.trim()) {
        addSearchHistory(searchQuery.trim());
      }
      viewMountEngine.showAlgorithm(algo.id);
    },
  });
}

// ========== Search History UI ==========
function hideSearchHistory(): void {
  const dropdown = $('search-history-dropdown');
  if (dropdown) dropdown.style.display = 'none';
}

function renderSearchHistoryDropdown(): void {
  const dropdown = $('search-history-dropdown');
  const list = $('search-history-list');
  const input = $('search-input') as HTMLInputElement | null;
  if (!dropdown || !list) return;

  const currentVal = input?.value.trim().toLowerCase() || '';
  let history = getSearchHistory();

  // 如果输入框有搜索词，匹配包含该词的历史项；如果为空，展示全部历史
  if (currentVal) {
    history = history.filter((item) => item.toLowerCase().includes(currentVal));
  }

  if (history.length === 0) {
    if (!currentVal && getSearchHistory().length === 0) {
      list.innerHTML = '<div class="search-history-empty">暂无搜索历史</div>';
      dropdown.style.display = 'flex';
    } else {
      dropdown.style.display = 'none';
    }
    return;
  }

  dropdown.style.display = 'flex';
  list.innerHTML = '';

  history.forEach((itemText) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'search-history-item';
    itemEl.dataset.query = itemText;
    itemEl.innerHTML = `
      <span class="search-history-icon">🕒</span>
      <span class="search-history-text">${algoSearchCatalog.escapeHtml(itemText)}</span>
      <button class="search-history-delete" type="button" title="删除此记录" aria-label="删除">×</button>
    `;

    // 点击历史项进行搜索
    itemEl.addEventListener('click', (e) => {
      e.stopPropagation();
      executeSearch(itemText);
    });

    // 单项删除
    const delBtn = itemEl.querySelector('.search-history-delete');
    delBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      removeSearchHistory(itemText);
      renderSearchHistoryDropdown();
    });

    list.appendChild(itemEl);
  });
}

function executeSearch(query: string): void {
  const input = $('search-input') as HTMLInputElement | null;
  const clearBtn = $('search-clear');
  const searchBox = $('search-box');
  if (!input) return;

  input.value = query;
  searchQuery = query;
  addSearchHistory(query);
  hideSearchHistory();

  clearBtn?.classList.toggle('visible', searchQuery.length > 0);
  searchBox?.classList.toggle('has-value', searchQuery.length > 0);

  if (searchQuery.trim() && currentCategory !== 'all') {
    currentCategory = 'all';
    document.querySelectorAll('.category-item').forEach((item) => {
      if (item instanceof HTMLElement) {
        item.classList.toggle('active', item.dataset.category === 'all');
      }
    });
  }

  updateContentHeader();
  renderCards();
  renderSidebarCategories();
}

let _searchDocClickHandler: ((e: MouseEvent) => void) | null = null;

// ========== Search ==========
function setupSearch(): void {
  const input = $('search-input') as HTMLInputElement;
  const clearBtn = $('search-clear');
  const searchBox = $('search-box');
  const clearAllBtn = $('search-history-clear-all');

  if (!input) return;

  // 清空所有历史
  clearAllBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    clearSearchHistory();
    renderSearchHistoryDropdown();
  });

  // Focus & Click 显示历史
  input.addEventListener('focus', () => {
    renderSearchHistoryDropdown();
  });
  input.addEventListener('click', (e) => {
    e.stopPropagation();
    renderSearchHistoryDropdown();
  });

  // Input handler
  input.addEventListener('input', () => {
    searchQuery = input.value;
    clearBtn?.classList.toggle('visible', searchQuery.length > 0);
    searchBox?.classList.toggle('has-value', searchQuery.length > 0);

    // If searching, switch to "all" view to show cross-category results
    if (searchQuery.trim() && currentCategory !== 'all') {
      currentCategory = 'all';
      document.querySelectorAll('.category-item').forEach((item) => {
        if (item instanceof HTMLElement) {
          item.classList.toggle('active', item.dataset.category === 'all');
        }
      });
    }

    updateContentHeader();
    renderCards();
    renderSidebarCategories();
    renderSearchHistoryDropdown();
  });

  // 回车键保存搜索历史并收起下拉框
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      addSearchHistory(input.value.trim());
      hideSearchHistory();
    }
  });

  // Clear button
  clearBtn?.addEventListener('click', () => {
    input.value = '';
    searchQuery = '';
    clearBtn.classList.remove('visible');
    searchBox?.classList.remove('has-value');
    hideSearchHistory();
    input.focus();
    updateContentHeader();
    renderCards();
    renderSidebarCategories();
  });

  // 点击外部关闭下拉菜单
  if (_searchDocClickHandler) {
    document.removeEventListener('click', _searchDocClickHandler);
  }
  _searchDocClickHandler = (e: MouseEvent) => {
    if (!searchBox?.contains(e.target as Node)) {
      hideSearchHistory();
    }
  };
  document.addEventListener('click', _searchDocClickHandler);

  // 清除旧的键盘监听器（防止重复绑定）
  if (_searchKeydownHandler) {
    document.removeEventListener('keydown', _searchKeydownHandler);
  }

  // Keyboard shortcut Ctrl+K
  _searchKeydownHandler = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      input.focus();
      input.select();
      renderSearchHistoryDropdown();
    }

    // Escape to clear search or close history dropdown
    if (e.key === 'Escape') {
      hideSearchHistory();
      if (document.activeElement === input) {
        if (searchQuery) {
          input.value = '';
          searchQuery = '';
          clearBtn?.classList.remove('visible');
          searchBox?.classList.remove('has-value');
          updateContentHeader();
          renderCards();
          renderSidebarCategories();
        } else {
          input.blur();
        }
      }
    }
  };
  document.addEventListener('keydown', _searchKeydownHandler);
}

let _sidebarSplitter: SplitterEngine | null = null;

function setupSidebarSplitter(): void {
  const sidebar = document.querySelector('#main-layout > .sidebar') as HTMLElement | null;
  const mainLayout = document.getElementById('main-layout');
  if (!sidebar || !mainLayout) return;

  _sidebarSplitter?.destroy();
  _sidebarSplitter = new SplitterEngine({
    id: 'sidebar-width',
    direction: 'horizontal',
    targetElement: sidebar,
    containerElement: mainLayout,
    defaultSize: 280,
    minSize: 180,
    maxSize: 480,
    maxRatio: 0.42,
    mode: 'flex',
    attachPosition: 'after',
    invert: false,
    className: 'algo-sidebar-splitter',
    title: '左右拖拽调整侧边栏宽度，双击恢复默认',
  });
}

let _recentUpdatedHandler: (() => void) | null = null;
let _selectorShownHandler: (() => void) | null = null;

// ========== Plugin Export ==========
export const algorithmVizPlugin: Plugin = {
  id: 'algorithm-viz',
  name: 'Algorithm Visualization',
  version: '2.1.0',
  description: 'Interactive algorithm visualization with level chain navigation and difficulty badges',
  capabilities: {
    usesGlobalActions: true,
    windowActionNamespace: 'algorithmViz',
  },

  async initialize(context?: PluginContext): Promise<void> {
    console.log('[AlgorithmVizPlugin] Initializing v2.1...');

    // 加载所有算法
    allAlgorithms = algorithmRegistry.getAllMetadata();
    console.log(`[AlgorithmVizPlugin] Loaded ${allAlgorithms.length} algorithms`);

    // 渲染课程体系过滤栏
    renderCourseFilterUI();

    // 渲染侧边栏关卡链与底部最近访问
    renderSidebarCategories();

    // 渲染卡片
    updateContentHeader();
    renderCards();

    // 设置搜索
    setupSearch();

    // 设置侧边栏可拖拽分栏
    setupSidebarSplitter();

    // 监听最近访问更新与返回选择器事件，即时同步刷新侧边栏
    if (typeof window !== 'undefined') {
      _recentUpdatedHandler = () => {
        renderSidebarRecentFooter();
      };
      _selectorShownHandler = () => {
        renderCourseFilterUI();
        renderSidebarCategories();
        renderSidebarRecentFooter();
      };
      window.addEventListener('algo:recent-updated', _recentUpdatedHandler);
      window.addEventListener('algo:selector-shown', _selectorShownHandler);
    }

    console.log('[AlgorithmVizPlugin] Initialized successfully');
  },

  destroy(): void {
    console.log('[AlgorithmVizPlugin] Destroying...');
    if (_searchKeydownHandler) {
      document.removeEventListener('keydown', _searchKeydownHandler);
      _searchKeydownHandler = null;
    }
    if (_searchDocClickHandler) {
      document.removeEventListener('click', _searchDocClickHandler);
      _searchDocClickHandler = null;
    }
    if (_recentUpdatedHandler && typeof window !== 'undefined') {
      window.removeEventListener('algo:recent-updated', _recentUpdatedHandler);
      _recentUpdatedHandler = null;
    }
    if (_selectorShownHandler && typeof window !== 'undefined') {
      window.removeEventListener('algo:selector-shown', _selectorShownHandler);
      _selectorShownHandler = null;
    }
    if (_sidebarSplitter) {
      _sidebarSplitter.destroy();
      _sidebarSplitter = null;
    }
    currentCategory = 'all';
    currentCourse = 'all';
    searchQuery = '';
    expandedCategories.clear();
    console.log('[AlgorithmVizPlugin] Destroyed');
  },
};
