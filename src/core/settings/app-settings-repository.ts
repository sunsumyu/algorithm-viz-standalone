/**
 * 软件全局配置仓储中枢 (AppSettingsRepository Deep Module)
 * 职责：
 * 1. 统一维护 AppSettings 状态，与 LocalStorage 联动持久化；
 * 2. 具备结构防御与坏数据修复机制，自动合并增量默认值；
 * 3. 动态将字体、主题等视觉配置注入至 document.documentElement CSS 变量与 VisualThemeManager；
 * 4. 向全应用提供 Pub/Sub 订阅机制、配置重置与 JSON 导入/导出能力。
 */

import {
  AppSettings,
  DEFAULT_APP_SETTINGS,
  APP_SETTINGS_STORAGE_KEY,
  AppThemeId,
  DefaultRightTab,
  DefaultCodeLanguage,
  PlaybackSpeed,
  ZoomSensitivity
} from './settings-schema';
import { VisualThemeManager } from '../theme/visual-theme-manager';
import { eventHub } from '../controllers/visualizer-event-hub';

export type SettingsChangeListener = (settings: Readonly<AppSettings>) => void;

export class AppSettingsRepository {
  private static instance: AppSettingsRepository | null = null;
  private currentSettings: AppSettings;
  private storageKey: string;
  private listeners: Set<SettingsChangeListener> = new Set();

  private constructor(storageKey: string = APP_SETTINGS_STORAGE_KEY) {
    this.storageKey = storageKey;
    this.currentSettings = this.loadFromStorage();
    this.applySettingsToRuntime(this.currentSettings);
  }

  public static getInstance(storageKey?: string): AppSettingsRepository {
    if (!AppSettingsRepository.instance) {
      AppSettingsRepository.instance = new AppSettingsRepository(storageKey);
    }
    return AppSettingsRepository.instance;
  }

  /** 重置单例实例 (主要用于单元测试环境隔离) */
  public static resetInstance(): void {
    AppSettingsRepository.instance = null;
  }

  /** 获取当前不可变配置快照 */
  public getSettings(): Readonly<AppSettings> {
    return JSON.parse(JSON.stringify(this.currentSettings));
  }

  /** 获取外观设置 */
  public getAppearance(): Readonly<AppSettings['appearance']> {
    return { ...this.currentSettings.appearance };
  }

  /** 获取播放设置 */
  public getPlayback(): Readonly<AppSettings['playback']> {
    return { ...this.currentSettings.playback };
  }

  /** 获取布局偏好 */
  public getLayout(): Readonly<AppSettings['layout']> {
    return { ...this.currentSettings.layout };
  }

  /** 获取数据设置 */
  public getData(): Readonly<AppSettings['data']> {
    return { ...this.currentSettings.data };
  }

  /** 更新外观配置 */
  public updateAppearance(patch: Partial<AppSettings['appearance']>): void {
    this.currentSettings.appearance = {
      ...this.currentSettings.appearance,
      ...patch,
    };
    this.persistAndNotify();
  }

  /** 更新播放与演示配置 */
  public updatePlayback(patch: Partial<AppSettings['playback']>): void {
    this.currentSettings.playback = {
      ...this.currentSettings.playback,
      ...patch,
    };
    this.persistAndNotify();
  }

  /** 更新布局与语言偏好 */
  public updateLayout(patch: Partial<AppSettings['layout']>): void {
    this.currentSettings.layout = {
      ...this.currentSettings.layout,
      ...patch,
    };
    this.persistAndNotify();
  }

  /** 更新数据偏好 */
  public updateData(patch: Partial<AppSettings['data']>): void {
    this.currentSettings.data = {
      ...this.currentSettings.data,
      ...patch,
    };
    this.persistAndNotify();
  }

  /** 全量更新配置 */
  public setSettings(newSettings: Partial<AppSettings>): void {
    this.currentSettings = this.mergeWithDefaults(newSettings);
    this.persistAndNotify();
  }

  /** 恢复所有设置为出厂默认 */
  public resetToDefaults(): void {
    this.currentSettings = JSON.parse(JSON.stringify(DEFAULT_APP_SETTINGS));
    this.persistAndNotify();
  }

  /** 导出当前配置为 JSON 字符串 */
  public exportConfigJSON(): string {
    return JSON.stringify(this.currentSettings, null, 2);
  }

  /** 从 JSON 字符串导入配置 */
  public importConfigJSON(jsonStr: string): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (typeof parsed !== 'object' || parsed === null) {
        return { success: false, error: '无效的 JSON 对象' };
      }
      this.currentSettings = this.mergeWithDefaults(parsed);
      this.persistAndNotify();
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'JSON 解析失败' };
    }
  }

  /** 订阅配置变更 */
  public subscribe(listener: SettingsChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** 持久化并通知所有订阅者及外部子系统 */
  private persistAndNotify(): void {
    this.saveToStorage(this.currentSettings);
    this.applySettingsToRuntime(this.currentSettings);
    const snapshot = this.getSettings();
    this.listeners.forEach((fn) => {
      try {
        fn(snapshot);
      } catch (err) {
        console.error('[AppSettingsRepository] 订阅者执行异常:', err);
      }
    });
    eventHub.emit('settings:change', snapshot);
  }

  /** 将配置同步至 DOM / CSS Variables / VisualThemeManager */
  public applySettingsToRuntime(settings: AppSettings): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // 1. 同步字体大小 CSS 变量
    if (settings.appearance.codeFontSize) {
      root.style.setProperty('--viz-code-font-size', `${settings.appearance.codeFontSize}px`);
    }

    // 2. 同步字体系列
    if (settings.appearance.codeFontFamily) {
      root.style.setProperty('--viz-code-font-family', settings.appearance.codeFontFamily);
    }

    // 3. 同步主题管理器 (如果当前主题不同则切换)
    try {
      const themeMgr = VisualThemeManager.getInstance();
      if (themeMgr.getCurrentThemeId() !== settings.appearance.theme) {
        themeMgr.setTheme(settings.appearance.theme, true);
      }
    } catch {
      // 忽略非浏览器或预热环境异常
    }

    // 4. 同步默认右侧选项卡持久化记忆
    if (typeof localStorage !== 'undefined' && settings.layout.defaultRightTab) {
      localStorage.setItem('algo-right-tab', settings.layout.defaultRightTab);
    }
  }

  /** 从 LocalStorage 加载并合并防御默认值 */
  private loadFromStorage(): AppSettings {
    if (typeof localStorage === 'undefined') {
      return JSON.parse(JSON.stringify(DEFAULT_APP_SETTINGS));
    }
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return JSON.parse(JSON.stringify(DEFAULT_APP_SETTINGS));
      }
      const parsed = JSON.parse(raw);
      return this.mergeWithDefaults(parsed);
    } catch {
      return JSON.parse(JSON.stringify(DEFAULT_APP_SETTINGS));
    }
  }

  /** 安全保存至 LocalStorage */
  private saveToStorage(settings: AppSettings): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(settings));
    } catch (err) {
      console.warn('[AppSettingsRepository] LocalStorage 写入失败:', err);
    }
  }

  /** 深度安全合并 */
  private mergeWithDefaults(raw: Partial<AppSettings>): AppSettings {
    const d = DEFAULT_APP_SETTINGS;
    const rawApp: Partial<AppSettings['appearance']> = (raw && raw.appearance) ? raw.appearance : {};
    const rawPb: Partial<AppSettings['playback']> = (raw && raw.playback) ? raw.playback : {};
    const rawLay: Partial<AppSettings['layout']> = (raw && raw.layout) ? raw.layout : {};
    const rawDat: Partial<AppSettings['data']> = (raw && raw.data) ? raw.data : {};

    const validThemes: AppThemeId[] = ['leetcode-light', 'dark-cyberpunk', 'academic-paper', 'retro-arcade'];
    const validTabs: DefaultRightTab[] = ['code', 'problem', 'keypoints'];
    const validLangs: DefaultCodeLanguage[] = ['java', 'cpp', 'python', 'javascript'];
    const validSpeeds: PlaybackSpeed[] = [0.25, 0.5, 1.0, 1.5, 2.0, 3.0];
    const validZooms: ZoomSensitivity[] = ['low', 'medium', 'high'];

    const theme = validThemes.includes(rawApp.theme as AppThemeId) ? rawApp.theme! : d.appearance.theme;
    const codeFontSize = typeof rawApp.codeFontSize === 'number' && rawApp.codeFontSize >= 10 && rawApp.codeFontSize <= 20
      ? rawApp.codeFontSize
      : d.appearance.codeFontSize;
    const codeFontFamily = typeof rawApp.codeFontFamily === 'string' && rawApp.codeFontFamily.trim()
      ? rawApp.codeFontFamily
      : d.appearance.codeFontFamily;
    const smoothTransitions = typeof rawApp.smoothTransitions === 'boolean'
      ? rawApp.smoothTransitions
      : d.appearance.smoothTransitions;

    const defaultSpeed = validSpeeds.includes(rawPb.defaultSpeed as PlaybackSpeed) ? rawPb.defaultSpeed! : d.playback.defaultSpeed;
    const autoPlayOnMount = typeof rawPb.autoPlayOnMount === 'boolean' ? rawPb.autoPlayOnMount : d.playback.autoPlayOnMount;
    const autoScrollCode = typeof rawPb.autoScrollCode === 'boolean' ? rawPb.autoScrollCode : d.playback.autoScrollCode;
    const autoScrollLog = typeof rawPb.autoScrollLog === 'boolean' ? rawPb.autoScrollLog : d.playback.autoScrollLog;

    const defaultRightTab = validTabs.includes(rawLay.defaultRightTab as DefaultRightTab) ? rawLay.defaultRightTab! : d.layout.defaultRightTab;
    const defaultCodeLang = validLangs.includes(rawLay.defaultCodeLang as DefaultCodeLanguage) ? rawLay.defaultCodeLang! : d.layout.defaultCodeLang;
    const zoomSensitivity = validZooms.includes(rawLay.zoomSensitivity as ZoomSensitivity) ? rawLay.zoomSensitivity! : d.layout.zoomSensitivity;

    const recordSearchHistory = typeof rawDat.recordSearchHistory === 'boolean' ? rawDat.recordSearchHistory : d.data.recordSearchHistory;
    const recordRecentAlgorithms = typeof rawDat.recordRecentAlgorithms === 'boolean' ? rawDat.recordRecentAlgorithms : d.data.recordRecentAlgorithms;

    return {
      appearance: {
        theme,
        codeFontSize,
        codeFontFamily,
        smoothTransitions,
      },
      playback: {
        defaultSpeed,
        autoPlayOnMount,
        autoScrollCode,
        autoScrollLog,
      },
      layout: {
        defaultRightTab,
        defaultCodeLang,
        zoomSensitivity,
      },
      data: {
        recordSearchHistory,
        recordRecentAlgorithms,
      },
      version: typeof raw.version === 'number' ? raw.version : d.version,
    };
  }
}

export const appSettingsRepo = AppSettingsRepository.getInstance();
