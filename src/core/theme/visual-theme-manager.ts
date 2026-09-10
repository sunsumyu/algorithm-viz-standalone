/**
 * 视觉主题管理深模块 (VisualThemeManager)
 * 职责：
 * 1. 统一维护当前主题状态，与 LocalStorage / URL 参数联动持久化；
 * 2. 动态向 DOM 根节点注入 CSS 自定义属性（CSS Variables）与 data-theme 属性；
 * 3. 动态渲染精致的顶栏主题切换控件，向外暴露极简自治接口。
 */

import { THEME_PRESETS, VisualTheme, VoxelThemePalette, getVoxelPaletteForTheme } from './theme-presets';
import { eventHub } from '../controllers/visualizer-event-hub';

export interface VisualThemeManagerOptions {
  defaultTheme?: string;
  storageKey?: string;
  onThemeChange?: (theme: VisualTheme) => void;
}

export interface SettingsDropdownOptions {
  currentMode?: 'lite' | 'full';
  onSwitchMode?: (targetMode: 'lite' | 'full') => void;
  currentSpeed?: number;
  onSpeedChange?: (speedMs: number) => void;
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

  public static getVoxelPalette(themeId: string = 'leetcode-light'): VoxelThemePalette {
    const theme = this.getTheme(themeId);
    return getVoxelPaletteForTheme(theme);
  }

  public getCurrentThemeId(): string {
    return this.currentThemeId;
  }

  public getCurrentTheme(): VisualTheme {
    return VisualThemeManager.getTheme(this.currentThemeId);
  }

  public getCurrentVoxelPalette(): VoxelThemePalette {
    return getVoxelPaletteForTheme(this.getCurrentTheme());
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
    eventHub.emit('theme:change', { themeId });
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
   * 在指定容器内装配紧凑设置与主题切换下拉控件
   */
  public renderThemeSelector(container: HTMLElement, options: SettingsDropdownOptions = {}): void {
    if (!container) return;
    container.innerHTML = '';

    const themes = VisualThemeManager.getAvailableThemes();
    const currentTheme = this.getCurrentTheme();

    const wrapper = document.createElement('div');
    wrapper.className = 'relative inline-block text-left theme-selector-dropdown';

    // 触发按钮 (极简 32px 图标按钮，与左侧目录按钮严格对称)
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'btn-settings-dropdown';
    btn.title = '偏好设置与主题';
    btn.className = 'inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-all border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer flex-shrink-0';
    btn.innerHTML = `
      <i class="fa-solid fa-gear text-slate-600 dark:text-slate-300 text-xs sm:text-sm"></i>
    `;

    // 弹出菜单
    const menu = document.createElement('div');
    menu.className = 'theme-menu hidden absolute right-0 mt-1.5 w-48 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50 text-xs font-medium divide-y divide-slate-100 dark:divide-slate-700/60 animate-in fade-in zoom-in-95 duration-100';

    // 1. 主题分栏
    const themeSection = document.createElement('div');
    themeSection.className = 'py-1';
    themeSection.innerHTML = `
      <div class="px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
        <i class="fa-solid fa-palette text-[9px]"></i> 界面主题
      </div>
    `;

    themes.forEach(t => {
      const item = document.createElement('button');
      const isActive = t.id === this.currentThemeId;
      item.className = `w-full text-left px-2.5 py-1.5 flex items-center justify-between transition hover:bg-slate-100 dark:hover:bg-slate-700/70 cursor-pointer ${
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
      themeSection.appendChild(item);
    });
    menu.appendChild(themeSection);

    // 2. 视图模式分栏 (Lite <-> Full)
    if (options.onSwitchMode) {
      const modeSection = document.createElement('div');
      modeSection.className = 'py-1';
      const isLite = options.currentMode === 'lite';
      modeSection.innerHTML = `
        <div class="px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <i class="fa-solid fa-layer-group text-[9px]"></i> 视图模式
        </div>
        <button class="btn-switch-mode-action w-full text-left px-2.5 py-1.5 flex items-center justify-between transition hover:bg-slate-100 dark:hover:bg-slate-700/70 cursor-pointer text-slate-700 dark:text-slate-300">
          <span class="flex items-center gap-2">
            <i class="fa-solid ${isLite ? 'fa-book-open' : 'fa-bolt'} w-3.5 text-center text-amber-500"></i>
            <span>${isLite ? '切换到全景精讲版' : '切换到极简专注版'}</span>
          </span>
          <i class="fa-solid fa-arrow-right text-[10px] text-slate-400"></i>
        </button>
      `;

      const switchBtn = modeSection.querySelector('.btn-switch-mode-action');
      if (switchBtn) {
        switchBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          menu.classList.add('hidden');
          options.onSwitchMode!(isLite ? 'full' : 'lite');
        });
      }
      menu.appendChild(modeSection);
    }

    // 3. 播放速度分栏
    if (options.onSpeedChange) {
      const speedSection = document.createElement('div');
      speedSection.className = 'py-1 px-2.5';
      const curSpeed = options.currentSpeed || 900;
      speedSection.innerHTML = `
        <div class="py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <i class="fa-solid fa-gauge-high text-[9px]"></i> 演示速度
        </div>
        <div class="grid grid-cols-3 gap-1 mt-0.5 pb-0.5">
          <button data-speed="1500" class="speed-btn px-1 py-1 rounded text-[11px] font-semibold border ${curSpeed === 1500 ? 'bg-blue-500 text-white border-blue-500' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'}">0.5x</button>
          <button data-speed="900" class="speed-btn px-1 py-1 rounded text-[11px] font-semibold border ${curSpeed === 900 ? 'bg-blue-500 text-white border-blue-500' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'}">1.0x</button>
          <button data-speed="450" class="speed-btn px-1 py-1 rounded text-[11px] font-semibold border ${curSpeed === 450 ? 'bg-blue-500 text-white border-blue-500' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'}">2.0x</button>
        </div>
      `;

      speedSection.querySelectorAll('.speed-btn').forEach(sBtn => {
        sBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const speed = Number((sBtn as HTMLElement).dataset.speed);
          options.onSpeedChange!(speed);
          speedSection.querySelectorAll('.speed-btn').forEach(b => {
            b.className = 'speed-btn px-1 py-1 rounded text-[11px] font-semibold border bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200';
          });
          sBtn.className = 'speed-btn px-1 py-1 rounded text-[11px] font-semibold border bg-blue-500 text-white border-blue-500';
        });
      });
      menu.appendChild(speedSection);
    }

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

    // 监听主题变更自动刷新 menu 中的 active 项
    this.subscribe((newTheme) => {
      themeSection.querySelectorAll('button').forEach((b, idx) => {
        const itemTheme = themes[idx];
        if (!itemTheme) return;
        const isAct = itemTheme.id === newTheme.id;
        b.className = `w-full text-left px-2.5 py-1.5 flex items-center justify-between transition hover:bg-slate-100 dark:hover:bg-slate-700/70 cursor-pointer ${
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
