/**
 * Algorithm Viz Plugin — 关卡链重构版
 * 难度标签 + 关卡排序 + 侧边栏关卡链
 */

import type { Plugin, PluginContext } from '../../core/types';
import { algorithmManager, AlgorithmConfig } from '../../core/algorithm-manager';
import { SplitterEngine } from '../../core/splitter-engine';
import { getRecentAlgorithmIds } from '../../core/recent-algorithms';
import {
  getSearchHistory,
  addSearchHistory,
  removeSearchHistory,
  clearSearchHistory,
} from './search-history';

// 算法的 SVG 图标 (内联)
const ALGORITHM_ICONS: Record<string, string> = {
  bracket: '📚',
  lca: '🌳',
  'tree-invert': '🔄',
  'insertion-sort': '📊',
  'quick-sort': '⚡',
  'binary-search': '🔍',
  'jump-game': '🦘',
  combination: '',
  candy: '🍬',
  'phone-letters': '📞',
  lemonade: '🥤',
  permutation: '🔀',
  'gas-station': '⛽',
  subset: '',
  interval: '📏',
  nqueen: '👑',
  fibonacci: '🔢',
  'merge-intervals': '🧩',
  'climb-stairs': '🪜',
  'palindrome-partition': '🪞',
  'greedy-theory': '📘',
  'greedy-week-summary': '🧭',
  'greedy-week-summary-2': '🧭',
  'greedy-week-summary-3': '🧭',
  'greedy-week-summary-4': '🧭',
  'greedy-final-summary': '🏁',
  // 新增贪心算法
  'assign-cookies': '🍪',
  'wiggle-subsequence': '📈',
  'max-subarray': '📊',
  'best-time-stock': '📈',
  'can-jump': '🏃',
  'maximize-sum-k': '➖',
  'reconstruct-queue': '👥',
  'queue-vector-explained': '📚',
  'min-arrows': '🏹',
  'non-overlapping': '📐',
  'partition-labels': '🔤',
  'monotone-digits': '9️⃣',
  'tree-cameras': '📹',
  // 新增树算法
  'tree-symmetric': '🪞',
  'path-sum': '🛤️',
  'build-tree': '🏗️',
  'bst-search': '🔍',
  'min-depth': '📏',
  'balanced': '⚖️',
  'left-leaves': '🍃',
  'all-paths': '🛤️',
  'count-nodes': '🔢',
  'bottom-left': '🎯',
  'max-tree': '🌲',
  'merge-trees': '🤝',
  'build-tree-2': '🔨',
  'bst-lca': '🔗',
  'bst-insert': '➕',
  'bst-min-diff': '📏',
  'bst-modes': '📊',
  'bst-delete': '🗑️',
  'bst-trim': '✂️',
  'sorted-array-to-bst': '🔄',
  'bst-to-gst': '💰',
  'replace-digits': '🔢',
  'four-sum': '🎯',
  'hash-table-theory': '📖',
  'intersection-arrays': '🔀',
  'happy-number': '😊',
  'four-sum-ii': '🧮',
  'ransom-note': '📰',
  'reverse-string-ii': '🔁',
  'right-rotate-string': '🔄',
  'str-str': '🔍',
  'repeated-substring': '🔁',
  'stack-queue-theory': '📖',
  'my-queue': '🔄',
  'my-stack': '🔃',
  'remove-adjacent-duplicates': '🧹',
  'eval-rpn': '🧮',
  'sliding-window-max': '📊',
  'top-k-frequent': '🏆',
  'array-theory': '📖',
  'sorted-squares': '²',
  'range-sum': 'Σ',
  'buy-land': '🏞️',
  'array-summary': '📝',
  'next-greater-element-i': '🔍',
  'next-greater-element-ii': '🔄',
  'largest-rectangle-histogram': '📊',
  'graph-theory': '📖',
  'dfs-theory': '🔍',
  'bfs-theory': '🌊',
  'reachable-paths': '🛤️',
  'islands-bfs': '🏝️',
  'max-island-area': '📐',
  'total-island-area': 'Σ',
  'sink-islands': '🌊',
  'water-flow': '💧',
  'make-largest-island': '🏗️',
  'coastline': '🌊',
  'string-migration': '🔄',
  'strongly-connected': '🔗',
  'union-find-theory': '🌲',
  'find-route': '🗺️',
  'redundant-edge': '✂️',
  'redundant-edge-ii': '✂️',
  'mst-prim': '🌿',
  'mst-kruskal': '🔗',
  'topological-sort': '📐',
  'dijkstra-basic': '📏',
  'dijkstra-heap': '🔮',
  'bellman-ford': '🔄',
  'spfa': '⚡',
  'negative-cycle': '⚠️',
  'floyd': '🧮',
  'a-star': '⭐',
  'limited-shortest-path': '🔢',
  'shortest-path-summary': '📝',
  'graph-summary': '🗺️',
};

import {
  CATEGORY_CONFIG,
  getDifficultyConfig,
  type CategoryConfig,
} from '../../core/category-config';

const CATEGORY_ICON_CLASS: Record<string, string> = {
  stack: 'stack',
  tree: 'tree',
  sort: 'sort',
  search: 'search',
  greedy: 'greedy',
  backtracking: 'backtracking',
  'dynamic-programming': 'dynamic-programming',
  array: 'array',
  'linked-list': 'linked-list',
  'hash-table': 'hash-table',
  string: 'string',
  'two-pointers': 'two-pointers',
  'monotonic-stack': 'monotonic-stack',
  graph: 'graph',
};

// ========== State ==========
let currentCategory: string = 'all';
let searchQuery: string = '';
let allAlgorithms: AlgorithmConfig[] = [];
/** 展开的分类集合 */
let expandedCategories: Set<string> = new Set();
/** 搜索键盘快捷键处理器引用，用于 destroy 时移除 */
let _searchKeydownHandler: ((e: KeyboardEvent) => void) | null = null;

// ========== DOM Helpers ==========
const $ = (id: string) => document.getElementById(id);

// ========== Group & Sort Algorithms ==========
function groupByCategory(algorithms: AlgorithmConfig[]): Map<string, AlgorithmConfig[]> {
  const groups = new Map<string, AlgorithmConfig[]>();
  algorithms.forEach(algo => {
    const category = algo.category || 'other';
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category)!.push(algo);
  });
  // 按 levelOrder 排序
  groups.forEach(list => list.sort((a, b) => (a.levelOrder ?? 999) - (b.levelOrder ?? 999)));
  return groups;
}

// ========== Helpers ==========
function escapeHtml(str: string): string {
  const el = document.createElement('span');
  el.textContent = str;
  return el.innerHTML;
}

// ========== Highlight Text ==========
function highlightText(text: string, query: string): string {
  if (!query.trim()) return escapeHtml(text);
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text
    .split(regex)
    .map((part, i) => {
      const safe = escapeHtml(part);
      return i % 2 === 1 ? `<span class="search-highlight">${safe}</span>` : safe;
    })
    .join('');
}

// ========== Render Sidebar Categories (关卡链版) ==========
function renderSidebarCategories(): void {
  const container = $('sidebar-categories');
  if (!container) return;

  container.innerHTML = '';
  const groups = groupByCategory(allAlgorithms);

  // Sort categories
  const sortedCategories = Array.from(groups.keys()).sort((a, b) => {
    const orderA = CATEGORY_CONFIG[a]?.order ?? 999;
    const orderB = CATEGORY_CONFIG[b]?.order ?? 999;
    return orderA - orderB;
  });

  // "All" button
  const allItem = document.createElement('div');
  allItem.className = 'category-item' + (currentCategory === 'all' ? ' active' : '');
  allItem.dataset.category = 'all';
  allItem.innerHTML = `
    <span class="cat-icon">📋</span>
    <span class="cat-name">全部算法</span>
    <span class="cat-count">${allAlgorithms.length} 个</span>
  `;
  allItem.addEventListener('click', () => selectCategory('all'));
  container.appendChild(allItem);

  // "Recent" button
  const recentIds = getRecentAlgorithmIds();
  const recentItem = document.createElement('div');
  recentItem.className = 'category-item' + (currentCategory === 'recent' ? ' active' : '');
  recentItem.dataset.category = 'recent';
  recentItem.innerHTML = `
    <span class="cat-icon">🕒</span>
    <span class="cat-name">最近访问</span>
    <span class="cat-count">${recentIds.length} 个</span>
  `;
  recentItem.addEventListener('click', () => selectCategory('recent'));
  container.appendChild(recentItem);

  // Each category as expandable group
  sortedCategories.forEach(category => {
    const algoList = groups.get(category)!;
    const config = CATEGORY_CONFIG[category] || { name: category, icon: '📁', color: '#6c7086', colorRgb: '108, 112, 134', order: 999, theme: '#1e1e2e' };
    const isExpanded = expandedCategories.has(category);

    const group = document.createElement('div');
    group.className = 'sidebar-category-group';
    group.style.setProperty('--cat-color', config.color);

    // Category header (clickable to expand/collapse)
    const header = document.createElement('div');
    header.className = 'sidebar-category-header' + (currentCategory === category ? ' active' : '') + (isExpanded ? ' expanded' : '');
    header.innerHTML = `
      <span class="cat-icon">${config.icon}</span>
      <span class="cat-name">${config.name}</span>
      <span class="cat-count">${algoList.length} 关</span>
      <span class="category-chevron">${isExpanded ? '▾' : '▸'}</span>
    `;
    header.addEventListener('click', () => {
      if (expandedCategories.has(category)) {
        // 已展开：只折叠，不切换分类选中状态
        expandedCategories.delete(category);
        renderSidebarCategories();
      } else {
        // 未展开：展开，并选中该分类
        expandedCategories.add(category);
        selectCategory(category);
      }
    });
    group.appendChild(header);

    // Level list (shown when expanded or selected)
    if (isExpanded) {
      const levelList = document.createElement('div');
      levelList.className = 'sidebar-levels';

      algoList.forEach((algo, index) => {
        const diff = getDifficultyConfig(algo.difficulty);
        const levelNum = index + 1;
        const levelItem = document.createElement('div');
        levelItem.className = 'sidebar-level-item';
        levelItem.style.setProperty('--level-color', diff.color);
        levelItem.innerHTML = `
          <span class="level-dot" style="color: ${diff.color}">${diff.dot}</span>
          <span class="level-number">${levelNum}</span>
          <span class="level-name">${algo.name}</span>
        `;
        levelItem.addEventListener('click', () => {
          selectCategory(category);
          // Navigate to the algorithm
          algorithmManager.showAlgorithm(algo.id);
        });
        levelList.appendChild(levelItem);
      });

      group.appendChild(levelList);
    }

    container.appendChild(group);
  });

  // 渲染侧边栏最底部的最近访问 3 个算法快捷卡片
  renderSidebarRecentFooter();
}

// ========== Render Sidebar Recent Footer (最底部的最近访问 3 个算法) ==========
function renderSidebarRecentFooter(): void {
  const container = $('sidebar-recent-footer');
  if (!container) return;

  const recentIds = getRecentAlgorithmIds();
  const top3Ids = recentIds.slice(0, 3);
  const top3Algos = top3Ids
    .map(id => allAlgorithms.find(a => a.id === id))
    .filter((a): a is AlgorithmConfig => Boolean(a));

  if (top3Algos.length === 0) {
    container.innerHTML = `
      <div class="sidebar-recent-header">
        <span class="sidebar-recent-title">🕒 最近访问</span>
      </div>
      <div class="sidebar-recent-empty">暂无访问记录</div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="sidebar-recent-header">
      <span class="sidebar-recent-title">🕒 最近访问</span>
      <button class="sidebar-recent-more-btn" id="btn-sidebar-recent-more" type="button" title="查看全部最近访问记录">全部 ${recentIds.length} 个 →</button>
    </div>
    <div class="sidebar-recent-list" id="sidebar-recent-list"></div>
  `;

  const moreBtn = $('btn-sidebar-recent-more');
  moreBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    selectCategory('recent');
  });

  const listEl = $('sidebar-recent-list');
  if (!listEl) return;

  top3Algos.forEach(algo => {
    const diff = getDifficultyConfig(algo.difficulty);
    const catConfig = CATEGORY_CONFIG[algo.category] || { name: algo.category || '算法', icon: '✨', color: '#6366f1' };
    const icon = algo.icon || ALGORITHM_ICONS[algo.id] || catConfig.icon || '✨';

    const itemEl = document.createElement('div');
    itemEl.className = 'sidebar-recent-item';
    itemEl.dataset.algoId = algo.id;
    itemEl.title = `${algo.name} (${catConfig.name}) - 点击直接进入演示`;
    itemEl.innerHTML = `
      <span class="sidebar-recent-icon">${icon}</span>
      <div class="sidebar-recent-info">
        <span class="sidebar-recent-name">${escapeHtml(algo.name)}</span>
        <span class="sidebar-recent-cat" style="color: ${catConfig.color}">${catConfig.name}</span>
      </div>
      <span class="sidebar-recent-dot" style="color: ${diff.color}" title="${diff.label}">${diff.dot}</span>
    `;

    itemEl.addEventListener('click', () => {
      algorithmManager.showAlgorithm(algo.id);
    });

    listEl.appendChild(itemEl);
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

  if (searchQuery.trim()) {
    titleEl.innerHTML = `搜索结果`;
    countEl.textContent = `(${visibleCards.length} 个匹配)`;
  } else if (currentCategory === 'all') {
    titleEl.innerHTML = `全部算法`;
    countEl.textContent = `(${allAlgorithms.length} 个)`;
  } else if (currentCategory === 'recent') {
    const recentCount = getRecentAlgorithmIds().length;
    titleEl.innerHTML = `🕒 最近访问`;
    countEl.textContent = `(${recentCount} 个记录)`;
  } else {
    const config = CATEGORY_CONFIG[currentCategory] || { name: currentCategory, icon: '📁' };
    const count = groupByCategory(allAlgorithms).get(currentCategory)?.length || 0;
    titleEl.innerHTML = `${config.icon} ${config.name}`;
    countEl.textContent = `(${count} 关)`;
  }
}

// ========== Get Visible Cards ==========
function getVisibleCards(): AlgorithmConfig[] {
  if (currentCategory === 'recent') {
    const recentIds = getRecentAlgorithmIds();
    let recentAlgos = recentIds
      .map(id => allAlgorithms.find(a => a.id === id))
      .filter((a): a is AlgorithmConfig => Boolean(a));

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

  let filtered = allAlgorithms;

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

// ========== Render Cards ==========
function renderCards(): void {
  const grid = $('cards-grid');
  if (!grid) return;

  const cards = getVisibleCards();

  if (cards.length === 0) {
    if (searchQuery.trim()) {
      grid.innerHTML = `
        <div class="no-results" style="grid-column: 1 / -1;">
          <div class="no-results-icon">🔍</div>
          <div class="no-results-text">没有找到匹配的算法</div>
          <div class="no-results-hint">尝试更换关键词</div>
        </div>
      `;
    } else if (currentCategory === 'recent') {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon">🕒</div>
          <div class="empty-text">暂无最近访问记录</div>
          <div class="empty-hint">点击任意算法开始演示后将自动记录在此</div>
        </div>
      `;
    } else {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon"></div>
          <div class="empty-text">此分类下暂无算法</div>
        </div>
      `;
    }
    return;
  }

  grid.innerHTML = '';

  cards.forEach(algo => {
    const card = document.createElement('div');
    card.className = 'algo-card';
    card.dataset.algoId = algo.id;

    const icon = algo.icon || ALGORITHM_ICONS[algo.id] || '✨';
    const iconClass = CATEGORY_ICON_CLASS[algo.category] || algo.category || '';
    const catName = CATEGORY_CONFIG[algo.category]?.name || algo.category || '其他';
    const diff = getDifficultyConfig(algo.difficulty);

    const nameHtml = highlightText(algo.name, searchQuery);
    const descHtml = highlightText(algo.description, searchQuery);
    const goalHtml = algo.learningGoal
      ? `<div class="card-learning-goal">💡 ${highlightText(algo.learningGoal, searchQuery)}</div>`
      : '';

    card.innerHTML = `
      <div class="card-header">
        <div class="card-icon ${iconClass}">${icon}</div>
        <div class="card-name">${nameHtml}</div>
      </div>
      <div class="card-description">${descHtml}</div>
      ${goalHtml}
      <div class="card-footer">
        <span class="difficulty-badge" style="color: ${diff.color}; background: ${diff.bg}">${diff.dot} ${diff.label}</span>
        <span class="card-category">${catName}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      if (searchQuery.trim()) {
        addSearchHistory(searchQuery.trim());
      }
      algorithmManager.showAlgorithm(algo.id);
    });

    grid.appendChild(card);
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
      <span class="search-history-text">${escapeHtml(itemText)}</span>
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
    allAlgorithms = algorithmManager.getAllAlgorithms();
    console.log(`[AlgorithmVizPlugin] Loaded ${allAlgorithms.length} algorithms`);

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
    searchQuery = '';
    expandedCategories.clear();
    console.log('[AlgorithmVizPlugin] Destroyed');
  },
};
