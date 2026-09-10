/**
 * 面板折叠协调器 (PanelCollapseCoordinator)
 * 
 * 遵循深模块 (Deep Module) 与外观/规范化器原则：
 * 1. 统一管理所有算法面板（沙盘、状态监视器、代码终端、执行日志、卡片面板等）的折叠/展开行为。
 * 2. 通过「双击标题行」实现极简高效的折叠与展开，100% 保持原有面板样式与视觉布局。
 * 3. 智能过滤交互控件：双击按钮、输入框、下拉框、Tab、语言切换胶囊等控件时不误触发折叠。
 * 4. 自动与 Splitter 拖拽条联动：折叠时隐藏对应上下/左右分割条，展开时无缝恢复原有高度/宽度设定。
 * 5. 触发 resize 广播，确保画板/Canvas/SVG 自动自适应填充空间。
 */

export class PanelCollapseCoordinator {
  private static instance: PanelCollapseCoordinator | null = null;
  private boundHeaders: WeakSet<HTMLElement> = new WeakSet();
  private headerListeners: Map<HTMLElement, (e: MouseEvent) => void> = new Map();

  public static getInstance(): PanelCollapseCoordinator {
    if (!PanelCollapseCoordinator.instance) {
      PanelCollapseCoordinator.instance = new PanelCollapseCoordinator();
    }
    return PanelCollapseCoordinator.instance;
  }

  /**
   * 为指定根容器下的所有面板标题行绑定双击折叠交互
   */
  public bind(root?: HTMLElement | null): void {
    const targetRoot = root || (typeof document !== 'undefined' ? document.body : null);
    if (!targetRoot || typeof targetRoot.querySelectorAll !== 'function') return;

    const headerSelectors = [
      '.dsp-card-header',
      '.terminal-auto-header',
      '.ct-header',
      '.dark-code-terminal-header',
      '[class*="-card-header"]',
      '.card-header',
      '.panel-header',
      '[class*="-panel-header"]',
      '.algo-panel-header',
    ].join(', ');

    const headers = Array.from(targetRoot.querySelectorAll<HTMLElement>(headerSelectors));

    // 如果 root 自身匹配 headerSelector
    if (targetRoot.matches && targetRoot.matches(headerSelectors)) {
      if (!headers.includes(targetRoot)) {
        headers.unshift(targetRoot);
      }
    }

    for (const header of headers) {
      this.bindHeader(header);
    }
  }

  /**
   * 绑定单个标题行元素的双击事件
   */
  public bindHeader(header: HTMLElement): void {
    if (!header || this.boundHeaders.has(header)) return;

    // 过滤掉顶栏导航/系统标题栏/侧边栏等非卡片面板 Header
    if (this.isTopLevelHeader(header)) return;

    const panel = this.findParentPanel(header);
    if (!panel) return;

    const handler = (e: MouseEvent) => {
      // 智能过滤交互控件（按钮、输入框、下拉框、Tab 切换项、复制按钮等）
      const target = e.target as HTMLElement | null;
      if (target && typeof target.closest === 'function') {
        const interactive = target.closest(
          'button, input, select, textarea, a, .tab-item, .lang-btn, .btn-code-copy, .three-view-toggle-btn, [role="button"], [data-no-collapse]'
        );
        if (interactive) return;
      }

      e.preventDefault();
      e.stopPropagation();
      this.toggle(panel);
    };

    if (typeof header.addEventListener === 'function') {
      header.addEventListener('dblclick', handler);
      this.boundHeaders.add(header);
      this.headerListeners.set(header, handler);
      header.style.cursor = 'default';
      header.style.userSelect = 'none';
      if (!header.title) {
        header.title = '双击折叠/展开面板';
      }
    }
  }

  /**
   * 切换面板折叠状态
   */
  public toggle(panel: HTMLElement): boolean {
    if (this.isCollapsed(panel)) {
      this.expand(panel);
      return false;
    } else {
      this.collapse(panel);
      return true;
    }
  }

  /**
   * 折叠面板
   */
  public collapse(panel: HTMLElement): void {
    if (!panel) return;

    // 保存折叠前的高度与 flex
    if (!panel.dataset.savedHeight && panel.style.height) {
      panel.dataset.savedHeight = panel.style.height;
    }
    if (!panel.dataset.savedFlex && panel.style.flex) {
      panel.dataset.savedFlex = panel.style.flex;
    }

    panel.classList.add('algo-panel-collapsed');
    panel.dataset.collapsed = 'true';

    // 隐藏相邻的分割条手柄（若有）
    const prev = panel.previousElementSibling as HTMLElement | null;
    if (prev && prev.classList && prev.classList.contains('algo-splitter')) {
      prev.style.display = 'none';
    }
    const next = panel.nextElementSibling as HTMLElement | null;
    if (next && next.classList && next.classList.contains('algo-splitter')) {
      next.style.display = 'none';
    }

    this.updateSiblingPanels(panel);
    this.notifyResize(panel);
  }

  /**
   * 展开面板
   */
  public expand(panel: HTMLElement): void {
    if (!panel) return;

    panel.classList.remove('algo-panel-collapsed');
    panel.dataset.collapsed = 'false';

    // 恢复原有 height 与 flex
    if (panel.dataset.savedHeight !== undefined) {
      panel.style.height = panel.dataset.savedHeight;
      delete panel.dataset.savedHeight;
    }
    if (panel.dataset.savedFlex !== undefined) {
      panel.style.flex = panel.dataset.savedFlex;
      delete panel.dataset.savedFlex;
    }

    // 恢复相邻的分割条手柄（若有）
    const prev = panel.previousElementSibling as HTMLElement | null;
    if (prev && prev.classList && prev.classList.contains('algo-splitter')) {
      prev.style.display = '';
    }
    const next = panel.nextElementSibling as HTMLElement | null;
    if (next && next.classList && next.classList.contains('algo-splitter')) {
      next.style.display = '';
    }

    this.updateSiblingPanels(panel);
    this.notifyResize(panel);
  }

  /**
   * 协调同栏/同容器内同级面板的弹性空间分配，彻底消除折叠后留下的底部大片空白
   */
  private updateSiblingPanels(panel: HTMLElement): void {
    const parent = panel.parentElement;
    if (!parent) return;

    const panelSelector =
      '.dsp-card, .dsp-log-card, .dsp-terminal-card, .code-terminal-card, .dark-terminal-auto-frame, [class*="-card"], .card, .panel, [class*="-panel"]';

    const allPanels = Array.from(parent.children).filter((child): child is HTMLElement => {
      if (!child) return false;
      if (child.matches && typeof child.matches === 'function') {
        return child.matches(panelSelector);
      }
      return false;
    });

    if (allPanels.length <= 1) return;

    const uncollapsedPanels = allPanels.filter((p) => !this.isCollapsed(p));

    // 如果只剩下一个未折叠面板，且它原本具有固定高度/flex，则让它临时弹性填满整个容器高度
    if (uncollapsedPanels.length === 1) {
      const remainingPanel = uncollapsedPanels[0];
      if (!remainingPanel.dataset.siblingSavedHeight && remainingPanel.style.height) {
        remainingPanel.dataset.siblingSavedHeight = remainingPanel.style.height;
      }
      if (!remainingPanel.dataset.siblingSavedFlex && remainingPanel.style.flex) {
        remainingPanel.dataset.siblingSavedFlex = remainingPanel.style.flex;
      }
      remainingPanel.style.height = 'auto';
      remainingPanel.style.flex = '1 1 0';
    } else {
      // 恢复所有未折叠面板原本的高度与 flex
      for (const p of uncollapsedPanels) {
        if (p.dataset.siblingSavedHeight !== undefined) {
          p.style.height = p.dataset.siblingSavedHeight;
          delete p.dataset.siblingSavedHeight;
        }
        if (p.dataset.siblingSavedFlex !== undefined) {
          p.style.flex = p.dataset.siblingSavedFlex;
          delete p.dataset.siblingSavedFlex;
        }
      }
    }

    // 若同级中最后一个面板（底部辅助/监控/日志面板）处于折叠状态，确保其自动沉底收起到底部
    const lastPanel = allPanels[allPanels.length - 1];
    if (this.isCollapsed(lastPanel)) {
      lastPanel.style.marginTop = 'auto';
    } else {
      lastPanel.style.marginTop = '';
    }
  }

  /**
   * 判断面板当前是否处于折叠状态
   */
  public isCollapsed(panel: HTMLElement): boolean {
    if (!panel) return false;
    return (
      (panel.classList && panel.classList.contains('algo-panel-collapsed')) ||
      panel.dataset.collapsed === 'true'
    );
  }

  /**
   * 解绑指定根容器下所有已绑定的标题行
   */
  public unbind(root?: HTMLElement | null): void {
    const targetRoot = root || (typeof document !== 'undefined' ? document.body : null);
    if (!targetRoot || typeof targetRoot.querySelectorAll !== 'function') return;

    const headers = Array.from(
      targetRoot.querySelectorAll<HTMLElement>('.dsp-card-header, .terminal-auto-header, .ct-header, .dark-code-terminal-header, [class*="-card-header"], .card-header, .panel-header, [class*="-panel-header"], .algo-panel-header')
    );

    for (const header of headers) {
      const handler = this.headerListeners.get(header);
      if (handler && typeof header.removeEventListener === 'function') {
        header.removeEventListener('dblclick', handler);
      }
      this.headerListeners.delete(header);
      this.boundHeaders.delete(header);
    }
  }

  /**
   * 根据标题行向上查找所属面板卡片容器
   */
  private findParentPanel(header: HTMLElement): HTMLElement | null {
    if (!header) return null;
    const parent = header.parentElement as HTMLElement | null;
    if (!parent) return null;

    if (typeof parent.closest === 'function') {
      const panel = parent.closest<HTMLElement>(
        '.dsp-card, .dsp-log-card, .dsp-terminal-card, .code-terminal-card, .dark-terminal-auto-frame, [class*="-card"], .card, .panel, [class*="-panel"]'
      );

      if (panel && !this.isTopLevelHeader(panel)) {
        return panel;
      }
    }

    return parent;
  }

  /**
   * 判断是否为顶栏/导航栏/系统栏
   */
  private isTopLevelHeader(el: HTMLElement): boolean {
    if (!el) return false;
    const id = el.id || '';

    if (
      id === 'titlebar' ||
      id === 'sidebar' ||
      id === 'sidebar-header'
    ) {
      return true;
    }

    if (el.classList && typeof el.classList.contains === 'function') {
      if (
        el.classList.contains('dsp-header') ||
        el.classList.contains('titlebar') ||
        el.classList.contains('sidebar-header')
      ) {
        return true;
      }
    }

    if (typeof el.closest === 'function') {
      if (el.closest('.dsp-header, #titlebar, .titlebar, #sidebar-header')) {
        return true;
      }
    }

    return false;
  }

  /**
   * 广播 resize 与自定义面板折叠事件
   */
  private notifyResize(panel: HTMLElement): void {
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new Event('resize'));
        window.dispatchEvent(
          new CustomEvent('algo:panel-collapse-changed', {
            detail: { panel, isCollapsed: this.isCollapsed(panel) },
          })
        );
      } catch {}
    }
  }
}

export const panelCollapseCoordinator = PanelCollapseCoordinator.getInstance();
