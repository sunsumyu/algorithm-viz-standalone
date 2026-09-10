/**
 * 软件全局设置中心可视化弹窗 (AppSettingsModal Deep Module)
 * 职责：
 * 1. 提供现代深色玻璃拟态多选项卡设置交互界面；
 * 2. 实时响应与应用外观主题、代码字体大小、播放速度、面板偏好；
 * 3. 支持数据清除、出厂重置与配置 JSON 导入/导出；
 * 4. 支持 ESC 退出、快捷键呼出与外部事件响应。
 */

import { appSettingsRepo, AppSettingsRepository } from './app-settings-repository';
import {
  AppThemeId,
  DefaultRightTab,
  DefaultCodeLanguage,
  PlaybackSpeed,
  ZoomSensitivity
} from './settings-schema';
import { clearSearchHistory, getSearchHistory } from '../../plugins/algorithm-viz/search-history';
import { clearRecentAlgorithms, getRecentAlgorithmIds } from '../recent-algorithms';
import { shortcutController } from '../controllers/keyboard-shortcut-controller';

export type SettingsTabId = 'appearance' | 'playback' | 'layout' | 'data' | 'about';

interface TabDefinition {
  id: SettingsTabId;
  label: string;
  icon: string;
}

const SETTINGS_TABS: TabDefinition[] = [
  { id: 'appearance', label: '外观与主题', icon: '🎨' },
  { id: 'playback', label: '播放与演示', icon: '⏱️' },
  { id: 'layout', label: '界面与语言', icon: '📐' },
  { id: 'data', label: '数据与备份', icon: '💾' },
  { id: 'about', label: '关于软件', icon: 'ℹ️' },
];

export class AppSettingsModal {
  private static instance: AppSettingsModal | null = null;
  private backdropEl: HTMLElement | null = null;
  private isOpen: boolean = false;
  private currentTab: SettingsTabId = 'appearance';
  private toastTimer: any = null;

  private constructor() {
    this.initShortcut();
  }

  public static getInstance(): AppSettingsModal {
    if (!AppSettingsModal.instance) {
      AppSettingsModal.instance = new AppSettingsModal();
    }
    return AppSettingsModal.instance;
  }

  private initShortcut(): void {
    // 注册全局快捷键 Ctrl+, 或 Cmd+,
    shortcutController.register(
      'Ctrl+,',
      (e) => {
        e.preventDefault();
        this.toggle();
      },
      '打开软件设置面板'
    );
  }

  public getIsOpen(): boolean {
    return this.isOpen;
  }

  public open(defaultTab?: SettingsTabId): void {
    this.ensureDOM();
    this.isOpen = true;
    if (defaultTab) {
      this.currentTab = defaultTab;
    }
    if (this.backdropEl) {
      this.backdropEl.classList.add('is-open');
    }
    this.render();
  }

  public close(): void {
    this.isOpen = false;
    if (this.backdropEl) {
      this.backdropEl.classList.remove('is-open');
    }
  }

  public toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /** 显示临时 Toast 浮动提示 */
  public showToast(msg: string): void {
    if (typeof document === 'undefined') return;
    let toast = document.getElementById('settings-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'settings-toast';
      toast.className = 'settings-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('is-show');

    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => {
      toast?.classList.remove('is-show');
    }, 2200);
  }

  private ensureDOM(): void {
    if (typeof document === 'undefined') return;
    if (this.backdropEl && document.getElementById('settings-modal-backdrop')) return;

    let backdrop = document.getElementById('settings-modal-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'settings-modal-backdrop';
      backdrop.className = 'settings-modal-backdrop';
      backdrop.innerHTML = `
        <div class="settings-modal-container" id="settings-modal-container">
          <div class="settings-modal-header">
            <div class="settings-modal-title">
              <span>⚙️</span>
              <span>软件设置中心 (Preferences)</span>
            </div>
            <button class="settings-modal-close-btn" id="settings-modal-close" title="关闭设置 (Esc)">✕</button>
          </div>
          <div class="settings-modal-body">
            <nav class="settings-nav-sidebar" id="settings-nav-sidebar"></nav>
            <main class="settings-content-pane" id="settings-content-pane"></main>
          </div>
          <div class="settings-modal-footer">
            <div class="settings-footer-left">快捷键: <kbd style="background:#313244;padding:2px 6px;border-radius:4px;border:1px solid #45475a;">Ctrl + ,</kbd></div>
            <div class="settings-footer-right">
              <button class="settings-btn" id="btn-settings-export">📤 导出配置</button>
              <button class="settings-btn" id="btn-settings-import">📥 导入配置</button>
              <button class="settings-btn danger" id="btn-settings-reset">🔄 恢复默认</button>
            </div>
          </div>
        </div>
      `;

      // 遮罩点击关闭 (点击容器外部)
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          this.close();
        }
      });

      document.body.appendChild(backdrop);
    }

    this.backdropEl = backdrop;

    // 绑定事件
    const closeBtn = document.getElementById('settings-modal-close');
    closeBtn?.addEventListener('click', () => this.close());

    const exportBtn = document.getElementById('btn-settings-export');
    exportBtn?.addEventListener('click', () => this.handleExportConfig());

    const importBtn = document.getElementById('btn-settings-import');
    importBtn?.addEventListener('click', () => this.handleImportConfig());

    const resetBtn = document.getElementById('btn-settings-reset');
    resetBtn?.addEventListener('click', () => {
      if (confirm('确定要将所有设置恢复为出厂默认配置吗？')) {
        appSettingsRepo.resetToDefaults();
        this.render();
        this.showToast('✅ 已恢复出厂默认配置');
      }
    });

    // ESC 快捷键关闭
    shortcutController.register(
      'Escape',
      (e) => {
        if (this.isOpen) {
          e.preventDefault();
          this.close();
        }
      },
      '关闭设置面板',
      true
    );
  }

  /** 渲染侧边栏与当前 Tab 内容 */
  private render(): void {
    this.renderSidebar();
    this.renderContent();
  }

  private renderSidebar(): void {
    const nav = document.getElementById('settings-nav-sidebar');
    if (!nav) return;

    nav.innerHTML = SETTINGS_TABS.map((tab) => `
      <button class="settings-nav-item ${this.currentTab === tab.id ? 'active' : ''}" data-tab="${tab.id}">
        <span class="nav-icon">${tab.icon}</span>
        <span>${tab.label}</span>
      </button>
    `).join('');

    nav.querySelectorAll('.settings-nav-item').forEach((el) => {
      el.addEventListener('click', () => {
        const tabId = el.getAttribute('data-tab') as SettingsTabId;
        if (tabId) {
          this.currentTab = tabId;
          this.render();
        }
      });
    });
  }

  private renderContent(): void {
    const pane = document.getElementById('settings-content-pane');
    if (!pane) return;

    const settings = appSettingsRepo.getSettings();

    switch (this.currentTab) {
      case 'appearance':
        pane.innerHTML = this.renderAppearanceTab(settings);
        this.bindAppearanceEvents();
        break;
      case 'playback':
        pane.innerHTML = this.renderPlaybackTab(settings);
        this.bindPlaybackEvents();
        break;
      case 'layout':
        pane.innerHTML = this.renderLayoutTab(settings);
        this.bindLayoutEvents();
        break;
      case 'data':
        pane.innerHTML = this.renderDataTab(settings);
        this.bindDataEvents();
        break;
      case 'about':
        pane.innerHTML = this.renderAboutTab(settings);
        this.bindAboutEvents();
        break;
    }
  }

  /* ========== 1. 外观与主题 Tab ========== */
  private renderAppearanceTab(settings: ReturnType<typeof appSettingsRepo.getSettings>): string {
    const themes: { id: AppThemeId; name: string; desc: string; colors: string[] }[] = [
      { id: 'leetcode-light', name: '力扣经典 (Light)', desc: '清爽明亮力扣配色', colors: ['#f8fafc', '#ffffff', '#3b82f6', '#10b981'] },
      { id: 'dark-cyberpunk', name: '极客深色 (Dark)', desc: '霓虹发光极客深色', colors: ['#181825', '#1e1e2e', '#89b4fa', '#f38ba8'] },
      { id: 'academic-paper', name: '学术论文 (Paper)', desc: '高对比高清晰印刷风', colors: ['#fafaf9', '#ffffff', '#44403c', '#2563eb'] },
      { id: 'retro-arcade', name: '复古街机 (8-bit)', desc: '像素复古像素游戏风', colors: ['#0f051d', '#200b3b', '#ff007f', '#00f0ff'] },
    ];

    return `
      <div class="settings-section-title">🎨 视觉主题与色彩规范</div>
      <div class="settings-theme-grid">
        ${themes.map((t) => `
          <div class="settings-theme-card ${settings.appearance.theme === t.id ? 'active' : ''}" data-theme-id="${t.id}">
            <div class="settings-theme-card-header">
              <span class="settings-theme-name">${t.name}</span>
              ${settings.appearance.theme === t.id ? '<span class="settings-theme-badge">当前使用</span>' : ''}
            </div>
            <div class="settings-theme-palette-preview">
              ${t.colors.map((c) => `<div class="palette-swatch" style="background:${c};"></div>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="settings-section-title" style="margin-top: 1rem;">🔤 代码面板字体配置</div>
      <div class="settings-card">
        <div class="settings-row">
          <div class="settings-row-left">
            <div class="settings-row-label">代码字号 (Font Size)</div>
            <div class="settings-row-desc">调整算法视图右侧代码编辑面板的基准字号 (10px ~ 18px)</div>
          </div>
          <div class="settings-slider-wrap">
            <input type="range" min="10" max="18" step="0.5" value="${settings.appearance.codeFontSize}" id="setting-font-size-slider" class="settings-slider" />
            <span class="settings-slider-val" id="setting-font-size-val">${settings.appearance.codeFontSize}px</span>
          </div>
        </div>

        <div class="settings-row">
          <div class="settings-row-left">
            <div class="settings-row-label">平滑过渡与动画效果</div>
            <div class="settings-row-desc">开启后各类看板、树与沙盘在单步步进时具有平滑过渡动效</div>
          </div>
          <label class="settings-switch">
            <input type="checkbox" id="setting-smooth-transitions" ${settings.appearance.smoothTransitions ? 'checked' : ''} />
            <span class="settings-switch-slider"></span>
          </label>
        </div>
      </div>
    `;
  }

  private bindAppearanceEvents(): void {
    // 主题切换卡片点击
    document.querySelectorAll('.settings-theme-card').forEach((card) => {
      card.addEventListener('click', () => {
        const themeId = card.getAttribute('data-theme-id') as AppThemeId;
        if (themeId) {
          appSettingsRepo.updateAppearance({ theme: themeId });
          this.render();
          this.showToast(`🎨 已切换为 ${themeId} 主题`);
        }
      });
    });

    // 字体滑块
    const fontSlider = document.getElementById('setting-font-size-slider') as HTMLInputElement | null;
    const fontVal = document.getElementById('setting-font-size-val');
    fontSlider?.addEventListener('input', () => {
      const size = parseFloat(fontSlider.value);
      if (fontVal) fontVal.textContent = `${size}px`;
      appSettingsRepo.updateAppearance({ codeFontSize: size });
    });

    // 动画开关
    const transitionCheck = document.getElementById('setting-smooth-transitions') as HTMLInputElement | null;
    transitionCheck?.addEventListener('change', () => {
      appSettingsRepo.updateAppearance({ smoothTransitions: transitionCheck.checked });
      this.showToast(transitionCheck.checked ? '✨ 平滑动画已启用' : '⚡ 平滑动画已关闭');
    });
  }

  /* ========== 2. 播放与演示 Tab ========== */
  private renderPlaybackTab(settings: ReturnType<typeof appSettingsRepo.getSettings>): string {
    return `
      <div class="settings-section-title">⏱️ 播放速度与演示行为</div>
      <div class="settings-card">
        <div class="settings-row">
          <div class="settings-row-left">
            <div class="settings-row-label">默认播放倍速</div>
            <div class="settings-row-desc">每次启动算法演示时的初始播放速率</div>
          </div>
          <select class="settings-select" id="setting-default-speed">
            <option value="0.25" ${settings.playback.defaultSpeed === 0.25 ? 'selected' : ''}>0.25x (慢速教学)</option>
            <option value="0.5" ${settings.playback.defaultSpeed === 0.5 ? 'selected' : ''}>0.5x (舒缓步进)</option>
            <option value="1.0" ${settings.playback.defaultSpeed === 1.0 ? 'selected' : ''}>1.0x (标准速度)</option>
            <option value="1.5" ${settings.playback.defaultSpeed === 1.5 ? 'selected' : ''}>1.5x (快速演示)</option>
            <option value="2.0" ${settings.playback.defaultSpeed === 2.0 ? 'selected' : ''}>2.0x (极速掠过)</option>
            <option value="3.0" ${settings.playback.defaultSpeed === 3.0 ? 'selected' : ''}>3.0x (飞速跑完)</option>
          </select>
        </div>

        <div class="settings-row">
          <div class="settings-row-left">
            <div class="settings-row-label">进入算法页面自动播放</div>
            <div class="settings-row-desc">开启后点击任意算法卡片将自动从第一步开始演示动画</div>
          </div>
          <label class="settings-switch">
            <input type="checkbox" id="setting-autoplay" ${settings.playback.autoPlayOnMount ? 'checked' : ''} />
            <span class="settings-switch-slider"></span>
          </label>
        </div>

        <div class="settings-row">
          <div class="settings-row-left">
            <div class="settings-row-label">代码面板跟随高亮居中</div>
            <div class="settings-row-desc">单步行进时，右侧代码编辑器自动平滑滚动并将当前行居中展示</div>
          </div>
          <label class="settings-switch">
            <input type="checkbox" id="setting-autoscroll-code" ${settings.playback.autoScrollCode ? 'checked' : ''} />
            <span class="settings-switch-slider"></span>
          </label>
        </div>

        <div class="settings-row">
          <div class="settings-row-left">
            <div class="settings-row-label">执行日志自动滚底</div>
            <div class="settings-row-desc">算法产生新执行日志行时，日志容器自动滚动保持最新记录可见</div>
          </div>
          <label class="settings-switch">
            <input type="checkbox" id="setting-autoscroll-log" ${settings.playback.autoScrollLog ? 'checked' : ''} />
            <span class="settings-switch-slider"></span>
          </label>
        </div>
      </div>
    `;
  }

  private bindPlaybackEvents(): void {
    const speedSelect = document.getElementById('setting-default-speed') as HTMLSelectElement | null;
    speedSelect?.addEventListener('change', () => {
      const speed = parseFloat(speedSelect.value) as PlaybackSpeed;
      appSettingsRepo.updatePlayback({ defaultSpeed: speed });
      this.showToast(`⏱️ 默认倍速已设为 ${speed}x`);
    });

    const autoPlayCheck = document.getElementById('setting-autoplay') as HTMLInputElement | null;
    autoPlayCheck?.addEventListener('change', () => {
      appSettingsRepo.updatePlayback({ autoPlayOnMount: autoPlayCheck.checked });
      this.showToast(autoPlayCheck.checked ? '▶ 自动演练已开启' : '⏸ 自动演练已关闭');
    });

    const codeScrollCheck = document.getElementById('setting-autoscroll-code') as HTMLInputElement | null;
    codeScrollCheck?.addEventListener('change', () => {
      appSettingsRepo.updatePlayback({ autoScrollCode: codeScrollCheck.checked });
    });

    const logScrollCheck = document.getElementById('setting-autoscroll-log') as HTMLInputElement | null;
    logScrollCheck?.addEventListener('change', () => {
      appSettingsRepo.updatePlayback({ autoScrollLog: logScrollCheck.checked });
    });
  }

  /* ========== 3. 界面与语言偏好 Tab ========== */
  private renderLayoutTab(settings: ReturnType<typeof appSettingsRepo.getSettings>): string {
    return `
      <div class="settings-section-title">📐 界面布局与默认编程语言</div>
      <div class="settings-card">
        <div class="settings-row">
          <div class="settings-row-left">
            <div class="settings-row-label">默认右侧选项卡</div>
            <div class="settings-row-desc">进入算法视图时右侧控制区默认激活的主面板</div>
          </div>
          <select class="settings-select" id="setting-default-right-tab">
            <option value="code" ${settings.layout.defaultRightTab === 'code' ? 'selected' : ''}>💻 代码调试 (Code)</option>
            <option value="problem" ${settings.layout.defaultRightTab === 'problem' ? 'selected' : ''}>📋 题目描述 (Problem)</option>
            <option value="keypoints" ${settings.layout.defaultRightTab === 'keypoints' ? 'selected' : ''}>💡 核心精讲 (Analysis)</option>
          </select>
        </div>

        <div class="settings-row">
          <div class="settings-row-left">
            <div class="settings-row-label">默认代码语言</div>
            <div class="settings-row-desc">多语言代码面板首次挂载时选中的编程语言</div>
          </div>
          <select class="settings-select" id="setting-default-code-lang">
            <option value="java" ${settings.layout.defaultCodeLang === 'java' ? 'selected' : ''}>Java</option>
            <option value="cpp" ${settings.layout.defaultCodeLang === 'cpp' ? 'selected' : ''}>C++</option>
            <option value="python" ${settings.layout.defaultCodeLang === 'python' ? 'selected' : ''}>Python</option>
            <option value="javascript" ${settings.layout.defaultCodeLang === 'javascript' ? 'selected' : ''}>JavaScript</option>
          </select>
        </div>

        <div class="settings-row">
          <div class="settings-row-left">
            <div class="settings-row-label">画布滚轮缩放灵敏度</div>
            <div class="settings-row-desc">二叉树、图拓扑与 3D 体素画布的滚轮/手势缩放响应速度</div>
          </div>
          <select class="settings-select" id="setting-zoom-sensitivity">
            <option value="low" ${settings.layout.zoomSensitivity === 'low' ? 'selected' : ''}>平缓 (Low)</option>
            <option value="medium" ${settings.layout.zoomSensitivity === 'medium' ? 'selected' : ''}>适中 (Medium)</option>
            <option value="high" ${settings.layout.zoomSensitivity === 'high' ? 'selected' : ''}>迅捷 (High)</option>
          </select>
        </div>
      </div>
    `;
  }

  private bindLayoutEvents(): void {
    const tabSelect = document.getElementById('setting-default-right-tab') as HTMLSelectElement | null;
    tabSelect?.addEventListener('change', () => {
      const tab = tabSelect.value as DefaultRightTab;
      appSettingsRepo.updateLayout({ defaultRightTab: tab });
      this.showToast(`📐 默认选项卡已设为 ${tab}`);
    });

    const langSelect = document.getElementById('setting-default-code-lang') as HTMLSelectElement | null;
    langSelect?.addEventListener('change', () => {
      const lang = langSelect.value as DefaultCodeLanguage;
      appSettingsRepo.updateLayout({ defaultCodeLang: lang });
      this.showToast(`💻 默认语言已设为 ${lang}`);
    });

    const zoomSelect = document.getElementById('setting-zoom-sensitivity') as HTMLSelectElement | null;
    zoomSelect?.addEventListener('change', () => {
      const zoom = zoomSelect.value as ZoomSensitivity;
      appSettingsRepo.updateLayout({ zoomSensitivity: zoom });
    });
  }

  /* ========== 4. 数据管理与备份 Tab ========== */
  private renderDataTab(settings: ReturnType<typeof appSettingsRepo.getSettings>): string {
    const searchHistory = getSearchHistory();
    const recentAlgos = getRecentAlgorithmIds();

    return `
      <div class="settings-section-title">💾 历史缓存与存储管理</div>
      <div class="settings-card">
        <div class="settings-row">
          <div class="settings-row-left">
            <div class="settings-row-label">搜索历史记录</div>
            <div class="settings-row-desc">当前已缓存 ${searchHistory.length} 条算法搜索记录</div>
          </div>
          <button class="settings-btn danger" id="btn-clear-search-history">清空搜索历史</button>
        </div>

        <div class="settings-row">
          <div class="settings-row-left">
            <div class="settings-row-label">最近演练记录</div>
            <div class="settings-row-desc">当前已记录 ${recentAlgos.length} 个最近访问算法</div>
          </div>
          <button class="settings-btn danger" id="btn-clear-recent-algos">清空演练记录</button>
        </div>

        <div class="settings-row">
          <div class="settings-row-left">
            <div class="settings-row-label">自动记录搜索与访问</div>
            <div class="settings-row-desc">关闭后将不再向本地持久化写入新的搜索词与访问历史</div>
          </div>
          <label class="settings-switch">
            <input type="checkbox" id="setting-record-history" ${settings.data.recordSearchHistory ? 'checked' : ''} />
            <span class="settings-switch-slider"></span>
          </label>
        </div>
      </div>
    `;
  }

  private bindDataEvents(): void {
    const clearSearchBtn = document.getElementById('btn-clear-search-history');
    clearSearchBtn?.addEventListener('click', () => {
      clearSearchHistory();
      this.render();
      this.showToast('🧹 搜索历史已清空');
    });

    const clearRecentBtn = document.getElementById('btn-clear-recent-algos');
    clearRecentBtn?.addEventListener('click', () => {
      clearRecentAlgorithms();
      this.render();
      this.showToast('🧹 最近演练记录已清空');
    });

    const recordCheck = document.getElementById('setting-record-history') as HTMLInputElement | null;
    recordCheck?.addEventListener('change', () => {
      appSettingsRepo.updateData({
        recordSearchHistory: recordCheck.checked,
        recordRecentAlgorithms: recordCheck.checked,
      });
    });
  }

  /* ========== 5. 关于软件 Tab ========== */
  private renderAboutTab(settings: ReturnType<typeof appSettingsRepo.getSettings>): string {
    return `
      <div class="settings-section-title">ℹ️ 软件架构与系统信息</div>
      <div class="settings-card">
        <div class="settings-row">
          <div class="settings-row-left">
            <div class="settings-row-label">软件名称</div>
            <div class="settings-row-desc">算法动画演示平台 (Algorithm Viz Standalone)</div>
          </div>
          <span style="font-family:'JetBrains Mono',monospace;font-weight:700;color:#89b4fa;">v1.0.0</span>
        </div>

        <div class="settings-row">
          <div class="settings-row-left">
            <div class="settings-row-label">内核引擎</div>
            <div class="settings-row-desc">High-Fidelity State Space & Step Matrix Visualizer Engine</div>
          </div>
          <span style="color:#a6adc8;font-size:0.8rem;">Tauri Native Desktop</span>
        </div>

        <div class="settings-row">
          <div class="settings-row-left">
            <div class="settings-row-label">快捷键控制中枢</div>
            <div class="settings-row-desc">查看全键盘无鼠标流快捷键速查表或自定义按键绑定</div>
          </div>
          <button class="settings-btn primary" id="btn-open-shortcuts-modal">⌨️ 快捷键管理</button>
        </div>
      </div>
    `;
  }

  private bindAboutEvents(): void {
    const shortcutsBtn = document.getElementById('btn-open-shortcuts-modal');
    shortcutsBtn?.addEventListener('click', async () => {
      this.close();
      const { shortcutManagerModal } = await import('../shortcuts/shortcut-manager-modal');
      shortcutManagerModal.open();
    });
  }

  /* ========== 配置导出与导入 ========== */
  private handleExportConfig(): void {
    const jsonStr = appSettingsRepo.exportConfigJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `algorithm-viz-settings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('📤 配置已成功导出');
  }

  private handleImportConfig(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const res = appSettingsRepo.importConfigJSON(content);
        if (res.success) {
          this.render();
          this.showToast('📥 配置导入成功并已应用');
        } else {
          alert(`导入配置失败: ${res.error}`);
        }
      };
      reader.readAsText(file);
    });
    input.click();
  }
}

export const appSettingsModal = AppSettingsModal.getInstance();
