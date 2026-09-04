/**
 * 算法目录学与卡片沙盘呈现器 (Catalog Presenter Deep Module)
 * 职责：
 * 统合算法主页卡片网格 (Card Grid)、侧边分类栏 (Sidebar Category Nav) 与全局快捷抽屉 (Drawer Content) 的呈现。
 * 封装：
 * 1. 算法图标多级回退解析 (resolveAlgorithmIcon)
 * 2. 侧边栏关卡链导航与展开/折叠渲染 (renderCategoryNav)
 * 3. 侧边栏底部最近访问快捷卡片 (renderSidebarRecentFooter)
 * 4. 算法卡片沙盘网格与多态空状态渲染 (renderCardGrid)
 * 5. 全局导航抽屉树与最近访问胶囊渲染 (renderDrawerContent)
 */

import { CATEGORY_CONFIG, getDifficultyConfig } from '../category-config';
import { algoSearchCatalog, type CategoryGroup } from '../algo-search-catalog';
import type { AlgorithmMetadata } from '../registry';
import { resolveAlgorithmIcon } from './catalog-icons';

export { resolveAlgorithmIcon } from './catalog-icons';

export interface CategoryNavOptions {
  algorithms: AlgorithmMetadata[];
  currentCategory: string;
  expandedCategories: Set<string>;
  recentCount: number;
  onSelectCategory: (category: string) => void;
  onSelectAlgorithm: (algoId: string, category: string) => void;
  onToggleCategory?: (category: string, expanded: boolean) => void;
}

export interface SidebarRecentFooterOptions {
  recentAlgorithms: AlgorithmMetadata[];
  totalRecentCount: number;
  onSelectAlgorithm: (algoId: string) => void;
  onViewAllRecent: () => void;
}

export interface CardGridOptions {
  algorithms: AlgorithmMetadata[];
  searchQuery: string;
  currentCategory: string;
  onCardClick: (algo: AlgorithmMetadata) => void;
}

export interface DrawerContentOptions {
  groups: CategoryGroup[];
  totalMatches: number;
  searchQuery: string;
  currentAlgorithmId: string | null;
  expandedCategories: Set<string>;
  recentAlgorithms: AlgorithmMetadata[];
  onSelectAlgorithm: (algoId: string) => void;
  onToggleCategory: (category: string, expanded: boolean) => void;
  onClearRecent: () => void;
}

export class CatalogPresenter {
  private static instance: CatalogPresenter;

  public static getInstance(): CatalogPresenter {
    if (!CatalogPresenter.instance) {
      CatalogPresenter.instance = new CatalogPresenter();
    }
    return CatalogPresenter.instance;
  }

  /**
   * 渲染侧边栏关卡链分类导航
   */
  public renderCategoryNav(container: HTMLElement, options: CategoryNavOptions): void {
    container.innerHTML = '';

    // 1. 全部算法按钮
    const allItem = document.createElement('div');
    allItem.className = 'category-item' + (options.currentCategory === 'all' ? ' active' : '');
    allItem.dataset.category = 'all';
    allItem.innerHTML = `
      <span class="cat-icon">📋</span>
      <span class="cat-name">全部算法</span>
      <span class="cat-count">${options.algorithms.length} 个</span>
    `;
    allItem.addEventListener('click', () => options.onSelectCategory('all'));
    container.appendChild(allItem);

    // 2. 最近访问按钮
    const recentItem = document.createElement('div');
    recentItem.className = 'category-item' + (options.currentCategory === 'recent' ? ' active' : '');
    recentItem.dataset.category = 'recent';
    recentItem.innerHTML = `
      <span class="cat-icon">🕒</span>
      <span class="cat-name">最近访问</span>
      <span class="cat-count">${options.recentCount} 个</span>
    `;
    recentItem.addEventListener('click', () => options.onSelectCategory('recent'));
    container.appendChild(recentItem);

    // 3. 各分类关卡树
    const groups = algoSearchCatalog.groupCategories(options.algorithms);
    groups.forEach(({ category, config, algorithms: algoList }) => {
      const isExpanded = options.expandedCategories.has(category);
      const group = document.createElement('div');
      group.className = 'sidebar-category-group';
      group.style.setProperty('--cat-color', config.color);

      const header = document.createElement('div');
      header.className =
        'sidebar-category-header' +
        (options.currentCategory === category ? ' active' : '') +
        (isExpanded ? ' expanded' : '');
      header.innerHTML = `
        <span class="cat-icon">${config.icon}</span>
        <span class="cat-name">${config.name}</span>
        <span class="cat-count">${algoList.length} 关</span>
        <span class="category-chevron">${isExpanded ? '▾' : '▸'}</span>
      `;
      header.addEventListener('click', () => {
        if (options.onToggleCategory) {
          options.onToggleCategory(category, !isExpanded);
        } else {
          if (options.expandedCategories.has(category)) {
            options.expandedCategories.delete(category);
          } else {
            options.expandedCategories.add(category);
            options.onSelectCategory(category);
          }
        }
      });
      group.appendChild(header);

      if (isExpanded) {
        const levelList = document.createElement('div');
        levelList.className = 'sidebar-levels';
        algoList.forEach((algo, index) => {
          const diff = getDifficultyConfig(algo.difficulty);
          const levelNum = algo.levelOrder ?? index + 1;
          const levelItem = document.createElement('div');
          levelItem.className = 'sidebar-level-item';
          levelItem.style.setProperty('--level-color', diff.color);
          levelItem.innerHTML = `
            <span class="level-dot" style="color: ${diff.color}">${diff.dot}</span>
            <span class="level-number">${levelNum}</span>
            <span class="level-name">${algoSearchCatalog.escapeHtml(algo.name)}</span>
          `;
          levelItem.addEventListener('click', () => {
            options.onSelectAlgorithm(algo.id, category);
          });
          levelList.appendChild(levelItem);
        });
        group.appendChild(levelList);
      }

      container.appendChild(group);
    });
  }

  /**
   * 渲染侧边栏最底部的最近访问 3 个算法快捷卡片
   */
  public renderSidebarRecentFooter(container: HTMLElement, options: SidebarRecentFooterOptions): void {
    container.innerHTML = '';
    const top3Algos = options.recentAlgorithms.slice(0, 3);

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
        <button class="sidebar-recent-more-btn" id="btn-sidebar-recent-more" type="button" title="查看全部最近访问记录">全部 ${options.totalRecentCount} 个 →</button>
      </div>
      <div class="sidebar-recent-list" id="sidebar-recent-list"></div>
    `;

    const moreBtn = container.querySelector('#btn-sidebar-recent-more');
    moreBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      options.onViewAllRecent();
    });

    const listEl = container.querySelector('#sidebar-recent-list');
    if (!listEl) return;

    top3Algos.forEach((algo) => {
      const diff = getDifficultyConfig(algo.difficulty);
      const catConfig = CATEGORY_CONFIG[algo.category] || {
        name: algo.category || '算法',
        icon: '✨',
        color: '#6366f1',
      };
      const icon = resolveAlgorithmIcon(algo);

      const itemEl = document.createElement('div');
      itemEl.className = 'sidebar-recent-item';
      itemEl.dataset.algoId = algo.id;
      itemEl.title = `${algo.name} (${catConfig.name}) - 点击直接进入演示`;
      itemEl.innerHTML = `
        <span class="sidebar-recent-icon">${icon}</span>
        <div class="sidebar-recent-info">
          <span class="sidebar-recent-name">${algoSearchCatalog.escapeHtml(algo.name)}</span>
          <span class="sidebar-recent-cat" style="color: ${catConfig.color}">${catConfig.name}</span>
        </div>
        <span class="sidebar-recent-dot" style="color: ${diff.color}" title="${diff.label}">${diff.dot}</span>
      `;

      itemEl.addEventListener('click', () => {
        options.onSelectAlgorithm(algo.id);
      });

      listEl.appendChild(itemEl);
    });
  }

  /**
   * 渲染主视口算法卡片网格
   */
  public renderCardGrid(container: HTMLElement, options: CardGridOptions): void {
    container.innerHTML = '';

    if (options.algorithms.length === 0) {
      if (options.searchQuery.trim()) {
        container.innerHTML = `
          <div class="no-results" style="grid-column: 1 / -1;">
            <div class="no-results-icon">🔍</div>
            <div class="no-results-text">没有找到匹配的算法</div>
            <div class="no-results-hint">尝试更换关键词</div>
          </div>
        `;
      } else if (options.currentCategory === 'recent') {
        container.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-icon">🕒</div>
            <div class="empty-text">暂无最近访问记录</div>
            <div class="empty-hint">点击任意算法开始演示后将自动记录在此</div>
          </div>
        `;
      } else {
        container.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-icon"></div>
            <div class="empty-text">此分类下暂无算法</div>
          </div>
        `;
      }
      return;
    }

    options.algorithms.forEach((algo) => {
      const card = document.createElement('div');
      card.className = 'algo-card';
      card.dataset.algoId = algo.id;

      const icon = resolveAlgorithmIcon(algo);
      const iconClass = algo.category || '';
      const catName = CATEGORY_CONFIG[algo.category]?.name || algo.category || '其他';
      const diff = getDifficultyConfig(algo.difficulty);

      const nameHtml = algoSearchCatalog.highlightHtml(algo.name, options.searchQuery, 'search-highlight');
      const descHtml = algoSearchCatalog.highlightHtml(algo.description, options.searchQuery, 'search-highlight');
      const goalHtml = algo.learningGoal
        ? `<div class="card-learning-goal">💡 ${algoSearchCatalog.highlightHtml(
            algo.learningGoal,
            options.searchQuery,
            'search-highlight'
          )}</div>`
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
        options.onCardClick(algo);
      });

      container.appendChild(card);
    });
  }

  /**
   * 渲染快捷目录抽屉列表内容
   */
  public renderDrawerContent(container: HTMLElement, options: DrawerContentOptions): void {
    container.innerHTML = '';
    const query = options.searchQuery.trim();

    // 1. 最近访问胶囊区域 (仅在非搜索模式且有历史时展示)
    if (!query && options.recentAlgorithms.length > 0) {
      const recentGroup = document.createElement('div');
      recentGroup.className = 'drawer-recent-section';
      recentGroup.innerHTML = `
        <div class="drawer-recent-header">
          <span class="drawer-recent-title">🕒 最近访问</span>
          <button class="drawer-recent-clear-btn" type="button" title="清空最近访问记录">清空</button>
        </div>
        <div class="drawer-recent-chips"></div>
      `;

      const clearBtn = recentGroup.querySelector('.drawer-recent-clear-btn');
      clearBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        options.onClearRecent();
      });

      const chipsContainer = recentGroup.querySelector('.drawer-recent-chips');
      if (chipsContainer) {
        options.recentAlgorithms.forEach((algo) => {
          const isCurrent = algo.id === options.currentAlgorithmId;
          const diff = getDifficultyConfig(algo.difficulty);
          const catConfig = CATEGORY_CONFIG[algo.category];
          const icon = resolveAlgorithmIcon(algo);

          const chip = document.createElement('button');
          chip.type = 'button';
          chip.className = `drawer-recent-chip ${isCurrent ? 'is-active' : ''}`;
          chip.title = `${algo.name} (${catConfig?.name || algo.category} · ${diff.label})`;
          chip.innerHTML = `
            <span class="chip-cat-icon">${icon}</span>
            <span class="chip-name">${algoSearchCatalog.escapeHtml(algo.name)}</span>
            <span class="chip-diff-dot" style="color: ${diff.color}">●</span>
          `;
          chip.addEventListener('click', () => {
            options.onSelectAlgorithm(algo.id);
          });
          chipsContainer.appendChild(chip);
        });
      }

      container.appendChild(recentGroup);
    }

    // 2. 分类关卡树
    options.groups.forEach(({ category, config, algorithms: algoList }) => {
      if (algoList.length === 0) return;

      const isExpanded = query ? true : options.expandedCategories.has(category);
      const isCurrentCat = options.currentAlgorithmId
        ? algoList.some((a) => a.id === options.currentAlgorithmId)
        : false;

      const groupEl = document.createElement('div');
      groupEl.className = `drawer-group ${isExpanded ? 'is-expanded' : ''} ${isCurrentCat ? 'is-current-cat' : ''}`;
      groupEl.style.setProperty('--group-color', config.color);

      const headerEl = document.createElement('div');
      headerEl.className = 'drawer-group-header';
      headerEl.innerHTML = `
        <span class="drawer-group-icon">${config.icon}</span>
        <span class="drawer-group-name">${config.name}</span>
        <span class="drawer-group-count">${algoList.length} 关</span>
        <span class="drawer-group-chevron">${isExpanded ? '▾' : '▸'}</span>
      `;
      headerEl.addEventListener('click', () => {
        options.onToggleCategory(category, !isExpanded);
      });
      groupEl.appendChild(headerEl);

      if (isExpanded) {
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'drawer-items';

        algoList.forEach((algo, index) => {
          const isCurrent = algo.id === options.currentAlgorithmId;
          const diff = getDifficultyConfig(algo.difficulty);
          const levelNum = algo.levelOrder ?? index + 1;

          const itemEl = document.createElement('div');
          itemEl.className = `drawer-item ${isCurrent ? 'is-active' : ''}`;
          itemEl.dataset.algoId = algo.id;
          itemEl.style.setProperty('--diff-color', diff.color);
          itemEl.style.setProperty('--diff-bg', diff.bg);

          itemEl.innerHTML = `
            <div class="drawer-item-left">
              <span class="drawer-item-dot" style="color: ${diff.color}" title="${diff.label}">${diff.dot}</span>
              <span class="drawer-item-num">${levelNum}</span>
              <span class="drawer-item-name">${algoSearchCatalog.highlightHtml(algo.name, query)}</span>
            </div>
            <div class="drawer-item-right">
              ${isCurrent ? `<span class="drawer-item-active-tag">正在学习</span>` : ''}
              <span class="drawer-item-diff-badge" style="color: ${diff.color}; background: ${diff.bg}">${diff.label}</span>
            </div>
          `;

          itemEl.addEventListener('click', () => {
            options.onSelectAlgorithm(algo.id);
          });

          itemsContainer.appendChild(itemEl);
        });

        groupEl.appendChild(itemsContainer);
      }

      container.appendChild(groupEl);
    });

    // 3. 空状态
    if (options.totalMatches === 0) {
      container.innerHTML = `
        <div class="drawer-empty-state">
          <span class="drawer-empty-icon">🔍</span>
          <span class="drawer-empty-text">未找到与 "${algoSearchCatalog.escapeHtml(query)}" 相关的算法</span>
        </div>
      `;
    }
  }
}

export const catalogPresenter = CatalogPresenter.getInstance();
