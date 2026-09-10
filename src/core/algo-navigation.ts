/**
 * 全局算法导航组件 (Algorithm Navigation & Catalog Drawer)
 * 提供：
 * 1. 顶部集成控制栏 (返回主页、大纲目录、上一题、下一题、当前题目徽章)
 * 2. 左侧隐藏展开算法目录抽屉 (按关卡链分类、即时搜索、难度标识、当前题目高亮定位)
 * 3. 左侧悬浮轻量拉手 (快速呼出目录)
 * 4. 全局快捷键控制 ([, ], M, Escape)
 */

import { algorithmRegistry } from './algorithm-registry';
import { viewMountEngine } from './view-mount-engine';
import type { AlgorithmMetadata } from './registry';
import { CATEGORY_CONFIG, getDifficultyConfig } from './category-config';
import { getRecentAlgorithmIds, clearRecentAlgorithms } from './recent-algorithms';
import { algoSearchCatalog, CategoryGroup } from './algo-search-catalog';
import { catalogPresenter } from './renderers/catalog-presenter';

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

  private constructor() {
    if (typeof document !== 'undefined') {
      this.ensureDOM();
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('algo:mounted', (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail?.algorithmId) {
          this.updateActiveAlgorithm(detail.algorithmId);
        }
      });
      window.addEventListener('algo:selector-shown', () => {
        this.hide();
      });
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
   * 获取按关卡大纲有序排列的完整算法清单 (委托给 algoSearchCatalog 领域模型)
   */
  public getOrderedAlgorithms(): AlgorithmMetadata[] {
    return algoSearchCatalog.getOrderedAlgorithms();
  }

  /**
   * 获取当前算法的前后算法及导航状态 (委托给 algoSearchCatalog 领域模型)
   */
  public getPrevAndNext(): { prev: AlgorithmMetadata | null; next: AlgorithmMetadata | null; currentIndex: number; total: number } {
    return algoSearchCatalog.getPrevAndNext(this.currentAlgorithmId);
  }

  /**
   * 切换到上一个算法
   */
  public navigateToPrevious(): void {
    const { prev } = this.getPrevAndNext();
    if (prev) {
      viewMountEngine.showAlgorithm(prev.id);
    }
  }

  /**
   * 切换到下一个算法
   */
  public navigateToNext(): void {
    const { next } = this.getPrevAndNext();
    if (next) {
      viewMountEngine.showAlgorithm(next.id);
    }
  }

  /**
   * 更新当前激活的算法并刷新 UI
   */
  public updateActiveAlgorithm(algorithmId: string): void {
    this.ensureDOM();
    this.currentAlgorithmId = algorithmId;
    const currentAlgo = algorithmRegistry.getMetadata(algorithmId);
    if (currentAlgo && currentAlgo.category) {
      this.expandedCategories.add(currentAlgo.category);
    }

    if (typeof document !== 'undefined') {
      const app = document.getElementById('app');
      app?.classList.add('has-active-algo');
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
      app?.classList.remove('has-active-algo');
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
    const currentAlgo = this.currentAlgorithmId ? algorithmRegistry.getMetadata(this.currentAlgorithmId) : null;
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
    backBtn?.addEventListener('click', () => viewMountEngine.showSelector());

    const prevBtn = document.getElementById('algo-nav-prev-btn');
    prevBtn?.addEventListener('click', () => this.navigateToPrevious());

    const nextBtn = document.getElementById('algo-nav-next-btn');
    nextBtn?.addEventListener('click', () => this.navigateToNext());
  }

  /**
   * 显示并更新左侧悬浮拉手
   */
  private showFloatingTab(): void {
    if (!this.ensureDOM() || !this.floatTab) return;
    const { currentIndex, total } = this.getPrevAndNext();
    const progressText = currentIndex >= 0 ? `${currentIndex + 1}/${total}` : `${total}`;
    this.floatTab.innerHTML = `
      <span class="float-tab-icon">📑</span>
      <span class="float-tab-text">目录</span>
      <span class="float-tab-badge">${progressText}</span>
      <span class="float-tab-key">M</span>
    `;
    this.floatTab.style.display = 'flex';
  }

  /**
   * 渲染左侧算法目录抽屉
   */
  /**
   * 渲染左侧算法目录抽屉
   */
  private renderDrawer(): void {
    if (!this.ensureDOM() || !this.drawerContainer) return;

    const { prev, next, total } = this.getPrevAndNext();
    const searchResult = algoSearchCatalog.search(this.drawerSearchQuery);

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
          <input type="text" id="drawer-search-input" class="drawer-search-input" placeholder="搜索算法名称、分类或描述..." value="${algoSearchCatalog.escapeHtml(
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
      const res = algoSearchCatalog.search(this.drawerSearchQuery);
      this.renderDrawerList(res.groups, res.totalMatches);
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

    this.renderDrawerList(searchResult.groups, searchResult.totalMatches);
  }

  /**
   * 渲染抽屉内的关卡树列表 (委托给 CatalogPresenter 深模块统一呈现)
   */
  private renderDrawerList(groups: CategoryGroup[], totalMatches: number): void {
    const listEl = document.getElementById('drawer-list');
    if (!listEl) return;

    const recentIds = getRecentAlgorithmIds();
    const recentAlgos = recentIds
      .map((id) => algorithmRegistry.getMetadata(id))
      .filter((a): a is AlgorithmMetadata => a !== undefined);

    catalogPresenter.renderDrawerContent(listEl, {
      groups,
      totalMatches,
      searchQuery: this.drawerSearchQuery,
      currentAlgorithmId: this.currentAlgorithmId,
      expandedCategories: this.expandedCategories,
      recentAlgorithms: recentAlgos,
      onSelectAlgorithm: (algoId) => {
        if (algoId !== this.currentAlgorithmId) {
          viewMountEngine.showAlgorithm(algoId);
        }
      },
      onToggleCategory: (category, expanded) => {
        if (expanded) {
          this.expandedCategories.add(category);
        } else {
          this.expandedCategories.delete(category);
        }
        const res = algoSearchCatalog.search(this.drawerSearchQuery);
        this.renderDrawerList(res.groups, res.totalMatches);
      },
      onClearRecent: () => {
        clearRecentAlgorithms();
        const res = algoSearchCatalog.search(this.drawerSearchQuery);
        this.renderDrawerList(res.groups, res.totalMatches);
      },
    });
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
}

export const algoNavigation = AlgoNavigationManager.getInstance();
