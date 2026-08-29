/**
 * 软件全局设置数据契约与默认值定义 (AppSettings Schema)
 */

export type AppThemeId = 'leetcode-light' | 'dark-cyberpunk' | 'academic-paper' | 'retro-arcade';
export type DefaultRightTab = 'code' | 'problem' | 'keypoints';
export type DefaultCodeLanguage = 'java' | 'cpp' | 'python' | 'javascript';
export type ZoomSensitivity = 'low' | 'medium' | 'high';
export type PlaybackSpeed = 0.25 | 0.5 | 1.0 | 1.5 | 2.0 | 3.0;

export interface AppSettings {
  /** 外观与主题 */
  appearance: {
    theme: AppThemeId;
    codeFontSize: number; // 10 ~ 18px (默认 12)
    codeFontFamily: string; // 默认 'JetBrains Mono', Consolas, monospace
    smoothTransitions: boolean; // 平滑过渡与动效 (默认 true)
  };

  /** 播放与演练 */
  playback: {
    defaultSpeed: PlaybackSpeed; // 默认 1.0x
    autoPlayOnMount: boolean; // 进入算法页面是否自动播放 (默认 false)
    autoScrollCode: boolean; // 代码行自动跟随居中 (默认 true)
    autoScrollLog: boolean; // 执行日志自动滚底 (默认 true)
  };

  /** 布局与代码偏好 */
  layout: {
    defaultRightTab: DefaultRightTab; // 默认右侧面板 Tab (默认 'code')
    defaultCodeLang: DefaultCodeLanguage; // 默认编程语言 (默认 'java')
    zoomSensitivity: ZoomSensitivity; // 画布缩放灵敏度 (默认 'medium')
  };

  /** 数据与隐私 */
  data: {
    recordSearchHistory: boolean; // 记录搜索历史 (默认 true)
    recordRecentAlgorithms: boolean; // 记录最近演练记录 (默认 true)
  };

  /** 配置元数据版本 */
  version: number;
}

export const DEFAULT_APP_SETTINGS: Readonly<AppSettings> = {
  appearance: {
    theme: 'leetcode-light' as AppThemeId,
    codeFontSize: 12,
    codeFontFamily: "'JetBrains Mono', Consolas, monospace",
    smoothTransitions: true,
  },
  playback: {
    defaultSpeed: 1.0 as PlaybackSpeed,
    autoPlayOnMount: false,
    autoScrollCode: true,
    autoScrollLog: true,
  },
  layout: {
    defaultRightTab: 'code' as DefaultRightTab,
    defaultCodeLang: 'java' as DefaultCodeLanguage,
    zoomSensitivity: 'medium' as ZoomSensitivity,
  },
  data: {
    recordSearchHistory: true,
    recordRecentAlgorithms: true,
  },
  version: 1,
};

export const APP_SETTINGS_STORAGE_KEY = 'algo_viz_app_settings';
