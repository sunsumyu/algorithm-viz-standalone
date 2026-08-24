/**
 * 视觉主题管理深模块 (VisualThemeManager)
 * 职责：
 * 1. 统一维护当前主题状态，与 LocalStorage / URL 参数联动持久化；
 * 2. 动态向 DOM 根节点注入 CSS 自定义属性（CSS Variables）与 data-theme 属性；
 * 3. 动态渲染精致的顶栏主题切换控件，向外暴露极简自治接口。
 */

import { THEME_PRESETS, VisualTheme } from './theme-presets';

export interface VisualThemeManagerOptions {
  defaultTheme?: string;
  storageKey?: string;
  onThemeChange?: (theme: VisualTheme) => void;
}

export class VisualThemeManager {
  private static instance: VisualThemeManager | null = null;
  private currentThemeId: string;
  private storageKey: string;
  private listeners: Set<(theme: VisualTheme) => void> = new Set();

  constructor(options?: VisualThemeManagerOptions) {
    this.storageKey = options?.storageKey || 'algor_viz_theme';
    
    // 初始化优先级：URL query / hash > localStorage > defaultTheme > 'leetcode-light'
    const stored = this.readSavedTheme();
    const fallback = options?.defaultTheme || 'leetcode-light';
    this.currentThemeId = THEME_PRESETS[stored] ? stored : (THEME_PRESETS[fallback] ? fallback : 'leetcode-light');

    if (options?.onThemeChange) {
      this.listeners.add(options.onThemeChange);
    }
  }

  public static getInstance(options?: VisualThemeManagerOptions): VisualThemeManager {
    if (!VisualThemeManager.instance) {
      VisualThemeManager.instance = new VisualThemeManager(options);
    }
    return VisualThemeManager.instance;
  }

  public static getAvailableThemes(): VisualTheme[] {
    return Object.values(THEME_PRESETS);
  }

  public static getTheme(themeId: string): VisualTheme {
    return THEME_PRESETS[themeId] || THEME_PRESETS['leetcode-light'];
  }

  public getCurrentThemeId(): string {
    return this.currentThemeId;
  }

  public getCurrentTheme(): VisualTheme {
    return VisualThemeManager.getTheme(this.currentThemeId);
  }

  public setTheme(themeId: string, persist: boolean = true): boolean {
    if (!THEME_PRESETS[themeId]) {
      console.warn(`[VisualThemeManager] 未知主题 ID: ${themeId}，已忽略`);
      return false;
    }
    this.currentThemeId = themeId;
    if (persist) {
      this.saveTheme(themeId);
    }
    this.applyThemeToDom();
    const current = this.getCurrentTheme();
    this.listeners.forEach(fn => fn(current));
    return true;
  }

  public subscribe(listener: (theme: VisualTheme) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 将当前主题的 CSS 自定义属性与属性标签注入至 DOM (默认为 document.documentElement)
   */
  public applyThemeToDom(targetElement?: HTMLElement): void {
    if (typeof document === 'undefined') return;
    const target = targetElement || document.documentElement;
    const theme = this.getCurrentTheme();

    target.setAttribute('data-theme', theme.id);
    target.classList.toggle('dark', theme.isDark);

    // 注入 CSS Variables
    if (target.style && typeof target.style.setProperty === 'function') {
      Object.entries(theme.variables).forEach(([varName, varVal]) => {
        target.style.setProperty(varName, varVal);
      });
    }
  }

  /**
   * 在指定容器内装配主题切换下拉/药丸控件
   */
  public renderThemeSelector(container: HTMLElement): void {
    if (!container) return;
    container.innerHTML = '';

    const themes = VisualThemeManager.getAvailableThemes();
    const currentTheme = this.getCurrentTheme();

    const wrapper = document.createElement('div');
    wrapper.className = 'relative inline-block text-left theme-selector-dropdown';

    // 触发按钮
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-all border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer';
    btn.innerHTML = `
      <i class="fa-solid ${currentTheme.icon} text-amber-500"></i>
      <span class="theme-btn-label">${currentTheme.shortName}</span>
      <i class="fa-solid fa-chevron-down text-[10px] opacity-60 ml-0.5"></i>
    `;

    // 弹出菜单
    const menu = document.createElement('div');
    menu.className = 'theme-menu hidden absolute right-0 mt-1.5 w-40 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 text-xs font-medium';

    themes.forEach(t => {
      const item = document.createElement('button');
      const isActive = t.id === this.currentThemeId;
      item.className = `w-full text-left px-3 py-2 flex items-center justify-between transition hover:bg-slate-100 dark:hover:bg-slate-700/70 cursor-pointer ${
        isActive ? 'text-blue-600 dark:text-cyan-400 font-bold bg-blue-50/50 dark:bg-slate-700/40' : 'text-slate-700 dark:text-slate-300'
      }`;
      item.innerHTML = `
        <span class="flex items-center gap-2">
          <i class="fa-solid ${t.icon} w-3.5 text-center text-slate-400"></i>
          <span>${t.name}</span>
        </span>
        ${isActive ? '<i class="fa-solid fa-check text-xs"></i>' : ''}
      `;
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setTheme(t.id);
        menu.classList.add('hidden');
      });
      menu.appendChild(item);
    });

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('hidden');
    });

    // 点击页面其他区域自动关闭
    const closeMenu = (e: MouseEvent) => {
      if (!wrapper.contains(e.target as Node)) {
        menu.classList.add('hidden');
      }
    };
    document.addEventListener('click', closeMenu);

    wrapper.appendChild(btn);
    wrapper.appendChild(menu);
    container.appendChild(wrapper);

    // 监听主题变更自动刷新按钮文案与高亮
    this.subscribe((newTheme) => {
      const label = btn.querySelector('.theme-btn-label');
      const icon = btn.querySelector('i:first-child');
      if (label) label.textContent = newTheme.shortName;
      if (icon) icon.className = `fa-solid ${newTheme.icon} text-amber-500`;
      
      // 更新 menu 中的 active 项
      menu.querySelectorAll('button').forEach((b, idx) => {
        const itemTheme = themes[idx];
        const isAct = itemTheme.id === newTheme.id;
        b.className = `w-full text-left px-3 py-2 flex items-center justify-between transition hover:bg-slate-100 dark:hover:bg-slate-700/70 cursor-pointer ${
          isAct ? 'text-blue-600 dark:text-cyan-400 font-bold bg-blue-50/50 dark:bg-slate-700/40' : 'text-slate-700 dark:text-slate-300'
        }`;
        b.innerHTML = `
          <span class="flex items-center gap-2">
            <i class="fa-solid ${itemTheme.icon} w-3.5 text-center text-slate-400"></i>
            <span>${itemTheme.name}</span>
          </span>
          ${isAct ? '<i class="fa-solid fa-check text-xs"></i>' : ''}
        `;
      });
    });
  }

  private readSavedTheme(): string {
    if (typeof window === 'undefined') return '';
    try {
      // 1. URL search query
      const searchParams = new URLSearchParams(window.location.search);
      const queryTheme = searchParams.get('theme');
      if (queryTheme && THEME_PRESETS[queryTheme]) return queryTheme;

      // 2. LocalStorage
      return localStorage.getItem(this.storageKey) || '';
    } catch {
      return '';
    }
  }

  private saveTheme(themeId: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.storageKey, themeId);
    } catch {
      // ignore in restricted environments
    }
  }
}
