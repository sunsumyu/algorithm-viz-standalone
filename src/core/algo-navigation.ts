/**
 * 全局算法导航组件 (Algorithm Navigation & Catalog Drawer)
 * 提供：
 * 1. 顶部集成控制栏 (返回主页、大纲目录、上一题、下一题、当前题目徽章)
 * 2. 左侧隐藏展开算法目录抽屉 (按关卡链分类、即时搜索、难度标识、当前题目高亮定位)
 * 3. 左侧悬浮轻量拉手 (快速呼出目录)
 * 4. 全局快捷键控制 ([, ], M, Escape)
 */

import { algorithmManager, AlgorithmConfig } from './algorithm-manager';
import { CATEGORY_CONFIG, getDifficultyConfig } from './category-config';
import { getRecentAlgorithmIds, clearRecentAlgorithms } from './recent-algorithms';

class AlgoNavigationManager {
  private static instance: AlgoNavigationManager;
  private topNavContainer: HTMLElement | null = null;
  private drawerBackdrop: HTMLElement | null = null;
  private drawerContainer: HTMLElement | null = null;
  private floatTab: HTMLElement | null = null;
  private isDrawerOpen: boolean = false;
  private currentAlgorithmId: string | null = null;
  private drawerSearchQuery: string = '';
  private expandedCategories: Set<string> = new Set();
  private keydownListener: ((e: KeyboardEvent) => void) | null = null;

  private constructor() {
    if (typeof document !== 'undefined') {
      this.ensureDOM();
      this.initKeydownListener();
    }
  }

  public static getInstance(): AlgoNavigationManager {
    if (!AlgoNavigationManager.instance) {
      AlgoNavigationManager.instance = new AlgoNavigationManager();
    }
    return AlgoNavigationManager.instance;
  }

  /**
   * 确保 DOM 结构已创建并挂载
   */
  private ensureDOM(): boolean {
    if (typeof document === 'undefined') return false;
    const app = document.getElementById('app');
    if (!app) return false;

    // 1. 顶部集成导航栏
    if (!this.topNavContainer || !document.getElementById('algo-global-nav')) {
      let topNav = document.getElementById('algo-global-nav');
      if (!topNav) {
        topNav = document.createElement('div');
        topNav.id = 'algo-global-nav';
        topNav.className = 'algo-global-nav';
        topNav.style.display = 'none';
        app.appendChild(topNav);
      }
      this.topNavContainer = topNav;
    }

    // 2. 抽屉遮罩层
    if (!this.drawerBackdrop || !document.getElementById('algo-catalog-backdrop')) {
      let backdrop = document.getElementById('algo-catalog-backdrop');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'algo-catalog-backdrop';
        backdrop.className = 'algo-catalog-backdrop';
        backdrop.addEventListener('click', () => this.closeDrawer());
        app.appendChild(backdrop);
      }
      this.drawerBackdrop = backdrop;
    }

    // 3. 左侧目录抽屉
    if (!this.drawerContainer || !document.getElementById('algo-catalog-drawer')) {
      let drawer = document.getElementById('algo-catalog-drawer');
      if (!drawer) {
        drawer = document.createElement('aside');
        drawer.id = 'algo-catalog-drawer';
        drawer.className = 'algo-catalog-drawer';
        app.appendChild(drawer);
      }
      this.drawerContainer = drawer;
    }

    // 4. 左侧悬浮拉手
    if (!this.floatTab || !document.getElementById('algo-catalog-float-tab')) {
      let floatTab = document.getElementById('algo-catalog-float-tab') as HTMLButtonElement | null;
      if (!floatTab) {
        floatTab = document.createElement('button');
        floatTab.id = 'algo-catalog-float-tab';
        floatTab.type = 'button';
        floatTab.className = 'algo-catalog-float-tab';
        floatTab.title = '展开算法目录 (快捷键: M)';
        floatTab.innerHTML = `<span class="float-tab-icon">📑</span><span class="float-tab-text">目录</span>`;
        floatTab.addEventListener('click', () => this.toggleDrawer());
        app.appendChild(floatTab);
      }
      this.floatTab = floatTab;
    }

    return true;
  }

  /**
   * 绑定全局键盘快捷键
   */
  private initKeydownListener(): void {
    if (typeof document === 'undefined') return;
    if (this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener);
    }

    this.keydownListener = (e: KeyboardEvent) => {
      // 避免在输入框或文本域中触发快捷键
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      // Escape: 如果抽屉打开则收起抽屉
      if (e.key === 'Escape') {
        if (this.isDrawerOpen) {
          e.preventDefault();
          this.closeDrawer();
          return;
        }
      }

      if (isInput) return;

      // 仅当处于算法可视化页面时生效
      if (!this.currentAlgorithmId) return;

      // 切换目录抽屉: M 或 Alt+M
      if (e.key === 'm' || e.key === 'M' || ((e.altKey || e.metaKey) && e.key.toLowerCase() === 'm')) {
        e.preventDefault();
        this.toggleDrawer();
        return;
      }

      // 上一题: [ 或 Alt+ArrowLeft
      if (e.key === '[' || ((e.altKey || e.ctrlKey) && e.key === 'ArrowLeft')) {
        e.preventDefault();
        this.navigateToPrevious();
        return;
      }

      // 下一题: ] 或 Alt+ArrowRight
      if (e.key === ']' || ((e.altKey || e.ctrlKey) && e.key === 'ArrowRight')) {
        e.preventDefault();
        this.navigateToNext();
        return;
      }
    };

    document.addEventListener('keydown', this.keydownListener);
  }

  /**
   * 获取按关卡大纲有序排列的完整算法清单
   */
  public getOrderedAlgorithms(): AlgorithmConfig[] {
    const all = algorithmManager.getAllAlgorithms();
    return [...all].sort((a, b) => {
      const orderA = CATEGORY_CONFIG[a.category]?.order ?? 999;
      const orderB = CATEGORY_CONFIG[b.category]?.order ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return (a.levelOrder ?? 999) - (b.levelOrder ?? 999);
    });
  }

  /**
   * 获取当前算法的前后算法
   */
  public getPrevAndNext(): { prev: AlgorithmConfig | null; next: AlgorithmConfig | null; currentIndex: number; total: number } {
    const list = this.getOrderedAlgorithms();
    const total = list.length;
    if (!this.currentAlgorithmId || total === 0) {
      return { prev: null, next: null, currentIndex: -1, total };
    }

    const index = list.findIndex((a) => a.id === this.currentAlgorithmId);
    if (index === -1) {
      return { prev: null, next: null, currentIndex: -1, total };
    }

    const prev = index > 0 ? list[index - 1] : null;
    const next = index < total - 1 ? list[index + 1] : null;
    return { prev, next, currentIndex: index, total };
  }

  /**
   * 切换到上一个算法
   */
  public navigateToPrevious(): void {
    const { prev } = this.getPrevAndNext();
    if (prev) {
      algorithmManager.showAlgorithm(prev.id);
    }
  }

  /**
   * 切换到下一个算法
   */
  public navigateToNext(): void {
    const { next } = this.getPrevAndNext();
    if (next) {
      algorithmManager.showAlgorithm(next.id);
    }
  }

  /**
   * 更新当前激活的算法并刷新 UI
   */
  public updateActiveAlgorithm(algorithmId: string): void {
    this.ensureDOM();
    this.currentAlgorithmId = algorithmId;
    const currentAlgo = algorithmManager.getAlgorithm(algorithmId);
    if (currentAlgo && currentAlgo.category) {
      this.expandedCategories.add(currentAlgo.category);
    }

    this.renderTopNav();
    this.renderDrawer();
    this.showFloatingTab();
  }

  /**
   * 隐藏导航与抽屉（退回主选择器时调用）
   */
  public hide(): void {
    this.currentAlgorithmId = null;
    this.closeDrawer();
    if (typeof document !== 'undefined') {
      const app = document.getElementById('app');
      app?.classList.remove('has-catalog-drawer-open');
    }
    if (this.topNavContainer) {
      this.topNavContainer.style.display = 'none';
    }
    if (this.floatTab) {
      this.floatTab.style.display = 'none';
    }
  }

  /**
   * 打开目录抽屉
   */
  public openDrawer(): void {
    this.ensureDOM();
    this.isDrawerOpen = true;
    if (typeof document !== 'undefined') {
      const app = document.getElementById('app');
      app?.classList.add('has-catalog-drawer-open');
    }

    if (this.drawerContainer) {
      this.drawerContainer.classList.add('is-open');
    }
    if (this.drawerBackdrop) {
      this.drawerBackdrop.classList.add('is-open');
    }
    if (this.floatTab) {
      this.floatTab.classList.add('drawer-active');
    }
    this.renderTopNav();
    this.renderDrawer();
    this.scrollToActiveItem();

    // 触发窗口 resize 事件以自适应重新计算画布与布局
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('resize'));
      setTimeout(() => window.dispatchEvent(new Event('resize')), 240);
    }
  }

  /**
   * 关闭目录抽屉
   */
  public closeDrawer(): void {
    this.isDrawerOpen = false;
    if (typeof document !== 'undefined') {
      const app = document.getElementById('app');
      app?.classList.remove('has-catalog-drawer-open');
    }

    if (this.drawerContainer) {
      this.drawerContainer.classList.remove('is-open');
    }
    if (this.drawerBackdrop) {
      this.drawerBackdrop.classList.remove('is-open');
    }
    if (this.floatTab) {
      this.floatTab.classList.remove('drawer-active');
    }
    this.renderTopNav();

    // 触发窗口 resize 事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('resize'));
      setTimeout(() => window.dispatchEvent(new Event('resize')), 240);
    }
  }

  /**
   * 切换目录抽屉开闭状态
   */
  public toggleDrawer(): void {
    if (this.isDrawerOpen) {
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  }

  /**
   * 渲染顶部集成导航条
   */
  private renderTopNav(): void {
    if (!this.ensureDOM() || !this.topNavContainer) return;
    this.topNavContainer.style.display = 'flex';

    const { prev, next, currentIndex, total } = this.getPrevAndNext();
    const currentAlgo = this.currentAlgorithmId ? algorithmManager.getAlgorithm(this.currentAlgorithmId) : null;
    const catConfig = currentAlgo?.category ? CATEGORY_CONFIG[currentAlgo.category] : null;
    const diffConfig = getDifficultyConfig(currentAlgo?.difficulty);

    const prevTitle = prev ? `上一题: ${prev.name} (快捷键: [)` : '已是第一题';
    const nextTitle = next ? `下一题: ${next.name} (快捷键: ])` : '已是最后一题';

    this.topNavContainer.innerHTML = `
      <div class="algo-nav-group">
        <button id="algo-nav-back-btn" class="algo-nav-btn algo-nav-back" type="button" title="返回算法主页 (Esc)">
          <span class="nav-btn-icon">←</span>
          <span class="nav-btn-text">返回</span>
        </button>

        <button id="algo-nav-catalog-btn" class="algo-nav-btn algo-nav-catalog ${this.isDrawerOpen ? 'is-active' : ''}" type="button" title="展开/收起算法大纲目录 (快捷键: M)">
          <span class="nav-btn-icon">📑</span>
          <span class="nav-btn-text">目录</span>
          <span class="nav-progress-badge">${currentIndex >= 0 ? `${currentIndex + 1}/${total}` : `${total}`}</span>
        </button>
      </div>

      <div class="algo-nav-divider"></div>

      <div class="algo-nav-group algo-nav-stepper">
        <button id="algo-nav-prev-btn" class="algo-nav-btn algo-nav-step ${!prev ? 'is-disabled' : ''}" type="button" title="${prevTitle}" ${!prev ? 'disabled' : ''}>
          <span class="nav-step-icon">◀</span>
          <span class="nav-step-label">上一题</span>
        </button>

        <button id="algo-nav-next-btn" class="algo-nav-btn algo-nav-step ${!next ? 'is-disabled' : ''}" type="button" title="${nextTitle}" ${!next ? 'disabled' : ''}>
          <span class="nav-step-label">下一题</span>
          <span class="nav-step-icon">▶</span>
        </button>
      </div>

      ${
        currentAlgo
          ? `
        <div class="algo-nav-info-pill" title="${currentAlgo.learningGoal || currentAlgo.description}">
          <span class="nav-info-cat" style="color: ${catConfig?.color || '#89b4fa'}">${catConfig?.icon || '🏷️'} ${catConfig?.name || currentAlgo.category}</span>
          <span class="nav-info-divider">·</span>
          <span class="nav-info-name">${currentAlgo.name}</span>
          <span class="nav-info-diff" style="color: ${diffConfig.color}; background: ${diffConfig.bg}">${diffConfig.dot} ${diffConfig.label}</span>
        </div>
      `
          : ''
      }
    `;

    // 绑定事件
    const backBtn = document.getElementById('algo-nav-back-btn');
    backBtn?.addEventListener('click', () => algorithmManager.showAlgorithmSelector());

    const catalogBtn = document.getElementById('algo-nav-catalog-btn');
    catalogBtn?.addEventListener('click', () => this.toggleDrawer());

    const prevBtn = document.getElementById('algo-nav-prev-btn');
    prevBtn?.addEventListener('click', () => this.navigateToPrevious());

    const nextBtn = document.getElementById('algo-nav-next-btn');
    nextBtn?.addEventListener('click', () => this.navigateToNext());
  }

  /**
   * 显示左侧悬浮拉手
   */
  private showFloatingTab(): void {
    if (!this.ensureDOM() || !this.floatTab) return;
    this.floatTab.style.display = 'flex';
  }

  /**
   * 渲染左侧算法目录抽屉
   */
  private renderDrawer(): void {
    if (!this.ensureDOM() || !this.drawerContainer) return;

    const all = this.getOrderedAlgorithms();
    const { prev, next, total } = this.getPrevAndNext();

    // 分组
    const groups = new Map<string, AlgorithmConfig[]>();
    all.forEach((algo) => {
      const cat = algo.category || 'other';
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(algo);
    });

    // 排序分类
    const sortedCategories = Array.from(groups.keys()).sort((a, b) => {
      const orderA = CATEGORY_CONFIG[a]?.order ?? 999;
      const orderB = CATEGORY_CONFIG[b]?.order ?? 999;
      return orderA - orderB;
    });

    // 渲染抽屉 HTML
    this.drawerContainer.innerHTML = `
      <div class="drawer-header">
        <div class="drawer-title-row">
          <div class="drawer-title">
            <span class="drawer-title-icon">📑</span>
            <span>算法大纲目录</span>
            <span class="drawer-count-badge">${total} 关</span>
          </div>
          <button class="drawer-close-btn" id="drawer-close-btn" type="button" title="收起面板 (Esc)">✕</button>
        </div>

        <div class="drawer-search-bar">
          <span class="drawer-search-icon">🔍</span>
          <input type="text" id="drawer-search-input" class="drawer-search-input" placeholder="搜索算法名称、分类或描述..." value="${this.escapeHtml(
            this.drawerSearchQuery
          )}" autocomplete="off" />
          ${
            this.drawerSearchQuery
              ? `<button id="drawer-search-clear" class="drawer-search-clear" type="button" title="清空搜索">✕</button>`
              : ''
          }
        </div>

        <div class="drawer-quick-nav">
          <button id="drawer-prev-btn" class="drawer-quick-btn ${!prev ? 'is-disabled' : ''}" type="button" title="${
      prev ? `上一题: ${prev.name}` : '已是第一题'
    }" ${!prev ? 'disabled' : ''}>
            <span>◀ 上一题</span>
            ${prev ? `<span class="drawer-quick-sub">${prev.name}</span>` : ''}
          </button>
          <button id="drawer-next-btn" class="drawer-quick-btn ${!next ? 'is-disabled' : ''}" type="button" title="${
      next ? `下一题: ${next.name}` : '已是最后一题'
    }" ${!next ? 'disabled' : ''}>
            <span>下一题 ▶</span>
            ${next ? `<span class="drawer-quick-sub">${next.name}</span>` : ''}
          </button>
        </div>
      </div>

      <div class="drawer-list" id="drawer-list"></div>
    `;

    // 绑定抽屉头部按钮
    const closeBtn = document.getElementById('drawer-close-btn');
    closeBtn?.addEventListener('click', () => this.closeDrawer());

    const searchInput = document.getElementById('drawer-search-input') as HTMLInputElement | null;
    searchInput?.addEventListener('input', () => {
      this.drawerSearchQuery = searchInput.value;
      this.renderDrawerList(groups, sortedCategories);
      const clearBtn = document.getElementById('drawer-search-clear');
      if (clearBtn) clearBtn.style.display = this.drawerSearchQuery ? 'inline-flex' : 'none';
    });

    const searchClearBtn = document.getElementById('drawer-search-clear');
    searchClearBtn?.addEventListener('click', () => {
      this.drawerSearchQuery = '';
      if (searchInput) searchInput.value = '';
      this.renderDrawer();
    });

    const drawerPrevBtn = document.getElementById('drawer-prev-btn');
    drawerPrevBtn?.addEventListener('click', () => this.navigateToPrevious());

    const drawerNextBtn = document.getElementById('drawer-next-btn');
    drawerNextBtn?.addEventListener('click', () => this.navigateToNext());

    this.renderDrawerList(groups, sortedCategories);
  }

  /**
   * 渲染抽屉内的关卡树列表
   */
  private renderDrawerList(groups: Map<string, AlgorithmConfig[]>, sortedCategories: string[]): void {
    const listEl = document.getElementById('drawer-list');
    if (!listEl) return;

    listEl.innerHTML = '';
    const query = this.drawerSearchQuery.trim().toLowerCase();
    let totalMatches = 0;

    // 最近访问区域 (仅在非搜索模式下，且有访问记录时展示)
    if (!query) {
      const recentIds = getRecentAlgorithmIds();
      const recentAlgos = recentIds
        .map((id) => algorithmManager.getAlgorithm(id))
        .filter((algo): algo is AlgorithmConfig => Boolean(algo));

      if (recentAlgos.length > 0) {
        const recentGroup = document.createElement('div');
        recentGroup.className = 'drawer-recent-section';
        recentGroup.innerHTML = `
          <div class="drawer-recent-header">
            <div class="drawer-recent-title">
              <span class="drawer-recent-icon">🕒</span>
              <span>最近访问</span>
              <span class="drawer-recent-badge">${recentAlgos.length}</span>
            </div>
            <button class="drawer-recent-clear-btn" type="button" title="清空最近访问">清空</button>
          </div>
          <div class="drawer-recent-chips"></div>
        `;

        const clearBtn = recentGroup.querySelector('.drawer-recent-clear-btn');
        clearBtn?.addEventListener('click', (e) => {
          e.stopPropagation();
          clearRecentAlgorithms();
          this.renderDrawerList(groups, sortedCategories);
        });

        const chipsContainer = recentGroup.querySelector('.drawer-recent-chips');
        if (chipsContainer) {
          recentAlgos.forEach((algo) => {
            const isCurrent = algo.id === this.currentAlgorithmId;
            const catConfig = CATEGORY_CONFIG[algo.category];
            const diff = getDifficultyConfig(algo.difficulty);

            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = `drawer-recent-chip ${isCurrent ? 'is-active' : ''}`;
            chip.title = `${algo.name} (${catConfig?.name || algo.category} · ${diff.label})`;
            chip.innerHTML = `
              <span class="chip-cat-icon">${catConfig?.icon || '📄'}</span>
              <span class="chip-name">${algo.name}</span>
              <span class="chip-diff-dot" style="color: ${diff.color}">●</span>
            `;
            chip.addEventListener('click', () => {
              if (algo.id !== this.currentAlgorithmId) {
                algorithmManager.showAlgorithm(algo.id);
              }
            });
            chipsContainer.appendChild(chip);
          });
        }

        listEl.appendChild(recentGroup);
      }
    }

    sortedCategories.forEach((category) => {
      const algoList = groups.get(category) || [];
      const config = CATEGORY_CONFIG[category] || {
        name: category,
        icon: '📁',
        color: '#89b4fa',
        colorRgb: '137, 180, 250',
        order: 999,
      };

      // 搜索过滤
      const filteredList = query
        ? algoList.filter((algo) => {
            const nameMatch = algo.name.toLowerCase().includes(query);
            const descMatch = (algo.description || '').toLowerCase().includes(query);
            const catMatch = config.name.toLowerCase().includes(query);
            const goalMatch = (algo.learningGoal || '').toLowerCase().includes(query);
            return nameMatch || descMatch || catMatch || goalMatch;
          })
        : algoList;

      if (filteredList.length === 0) return;
      totalMatches += filteredList.length;

      // 搜索模式下默认全部展开；常规模式下按 expandedCategories 展开
      const isExpanded = query ? true : this.expandedCategories.has(category);
      const isCurrentCat = this.currentAlgorithmId ? algoList.some((a) => a.id === this.currentAlgorithmId) : false;

      const groupEl = document.createElement('div');
      groupEl.className = `drawer-group ${isExpanded ? 'is-expanded' : ''} ${isCurrentCat ? 'is-current-cat' : ''}`;
      groupEl.style.setProperty('--group-color', config.color);

      // 分类头部
      const headerEl = document.createElement('div');
      headerEl.className = 'drawer-group-header';
      headerEl.innerHTML = `
        <span class="drawer-group-icon">${config.icon}</span>
        <span class="drawer-group-name">${config.name}</span>
        <span class="drawer-group-count">${filteredList.length} 关</span>
        <span class="drawer-group-chevron">${isExpanded ? '▾' : '▸'}</span>
      `;
      headerEl.addEventListener('click', () => {
        if (this.expandedCategories.has(category)) {
          this.expandedCategories.delete(category);
        } else {
          this.expandedCategories.add(category);
        }
        this.renderDrawerList(groups, sortedCategories);
      });
      groupEl.appendChild(headerEl);

      // 关卡项列表
      if (isExpanded) {
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'drawer-items';

        filteredList.forEach((algo, index) => {
          const isCurrent = algo.id === this.currentAlgorithmId;
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
              <span class="drawer-item-name">${this.highlightText(algo.name, query)}</span>
            </div>
            <div class="drawer-item-right">
              ${isCurrent ? `<span class="drawer-item-active-tag">正在学习</span>` : ''}
              <span class="drawer-item-diff-badge" style="color: ${diff.color}; background: ${diff.bg}">${diff.label}</span>
            </div>
          `;

          itemEl.addEventListener('click', () => {
            if (algo.id !== this.currentAlgorithmId) {
              algorithmManager.showAlgorithm(algo.id);
            }
          });

          itemsContainer.appendChild(itemEl);
        });

        groupEl.appendChild(itemsContainer);
      }

      listEl.appendChild(groupEl);
    });

    if (totalMatches === 0) {
      listEl.innerHTML = `
        <div class="drawer-empty-state">
          <span class="drawer-empty-icon">🔍</span>
          <span class="drawer-empty-text">未找到与 "${this.escapeHtml(query)}" 相关的算法</span>
        </div>
      `;
    }
  }

  /**
   * 自动滚动当前高亮算法项到可见区域
   */
  private scrollToActiveItem(): void {
    requestAnimationFrame(() => {
      const activeItem = this.drawerContainer?.querySelector('.drawer-item.is-active') as HTMLElement | null;
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }

  private escapeHtml(str: string): string {
    const el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  }

  private highlightText(text: string, query: string): string {
    if (!query) return this.escapeHtml(text);
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text
      .split(regex)
      .map((part, i) => {
        const safe = this.escapeHtml(part);
        return i % 2 === 1 ? `<span class="drawer-highlight">${safe}</span>` : safe;
      })
      .join('');
  }
}

export const algoNavigation = AlgoNavigationManager.getInstance();
