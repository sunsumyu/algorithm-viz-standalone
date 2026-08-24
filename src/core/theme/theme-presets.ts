/**
 * 视觉主题配置与设计令牌预设 (Visual Theme Presets & Design Tokens)
 * 包含 4 套精心定制的算法演示器调色板与视觉规范：
 * 1. leetcode-light: 力扣经典明亮风
 * 2. dark-cyberpunk: 极客深色霓虹发光风
 * 3. academic-paper: 学术论文极简高对比印刷风
 * 4. retro-arcade: 复古 8-bit 街机游戏风
 */

export interface VisualTheme {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  isDark: boolean;
  accentColor: string;
  variables: Record<string, string>;
}

export const THEME_PRESETS: Record<string, VisualTheme> = {
  'leetcode-light': {
    id: 'leetcode-light',
    name: '力扣经典 (Light)',
    shortName: '经典浅色',
    icon: 'fa-sun',
    isDark: false,
    accentColor: '#f59e0b',
    variables: {
      '--viz-app-bg': '#f8fafc',
      '--viz-card-bg': '#ffffff',
      '--viz-card-border': '#e2e8f0',
      '--viz-card-shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      '--viz-text-main': '#0f172a',
      '--viz-text-muted': '#64748b',
      '--viz-primary': '#3b82f6',
      '--viz-primary-light': '#eff6ff',
      '--viz-cell-bg': '#ffffff',
      '--viz-cell-border': '#e2e8f0',
      '--viz-cell-text': '#94a3b8',
      '--viz-cell-active-bg': '#dbeafe',
      '--viz-cell-active-border': '#3b82f6',
      '--viz-cell-active-text': '#1e40af',
      '--viz-cell-active-shadow': '0 4px 6px -1px rgba(59, 130, 246, 0.25)',
      '--viz-cell-top-bg': '#f3e8ff',
      '--viz-cell-top-border': '#c084fc',
      '--viz-cell-top-text': '#6b21a8',
      '--viz-cell-left-bg': '#fef3c7',
      '--viz-cell-left-border': '#fbbf24',
      '--viz-cell-left-text': '#92400e',
      '--viz-cell-done-bg': '#ecfdf5',
      '--viz-cell-done-border': '#6ee7b7',
      '--viz-cell-done-text': '#047857',
      '--viz-cell-obstacle-bg': '#e2e8f0',
      '--viz-cell-obstacle-border': '#94a3b8',
      '--viz-code-bg': '#0f172a',
      '--viz-code-text': '#f8fafc',
      '--viz-code-active-line': 'rgba(59, 130, 246, 0.25)',
      '--viz-code-active-border': '#3b82f6',
    }
  },

  'dark-cyberpunk': {
    id: 'dark-cyberpunk',
    name: '赛博霓虹 (Cyberpunk)',
    shortName: '极客暗黑',
    icon: 'fa-moon',
    isDark: true,
    accentColor: '#00f0ff',
    variables: {
      '--viz-app-bg': '#090d16',
      '--viz-card-bg': '#0f172a',
      '--viz-card-border': '#1e293b',
      '--viz-card-shadow': '0 4px 20px -2px rgba(0, 240, 255, 0.08)',
      '--viz-text-main': '#f1f5f9',
      '--viz-text-muted': '#94a3b8',
      '--viz-primary': '#00f0ff',
      '--viz-primary-light': 'rgba(0, 240, 255, 0.15)',
      '--viz-cell-bg': '#131d33',
      '--viz-cell-border': '#1e293b',
      '--viz-cell-text': '#64748b',
      '--viz-cell-active-bg': 'rgba(0, 240, 255, 0.22)',
      '--viz-cell-active-border': '#00f0ff',
      '--viz-cell-active-text': '#00f0ff',
      '--viz-cell-active-shadow': '0 0 16px rgba(0, 240, 255, 0.45)',
      '--viz-cell-top-bg': 'rgba(217, 70, 239, 0.22)',
      '--viz-cell-top-border': '#d946ef',
      '--viz-cell-top-text': '#f0abfc',
      '--viz-cell-left-bg': 'rgba(250, 204, 21, 0.22)',
      '--viz-cell-left-border': '#facc15',
      '--viz-cell-left-text': '#fef08a',
      '--viz-cell-done-bg': 'rgba(16, 185, 129, 0.18)',
      '--viz-cell-done-border': '#10b981',
      '--viz-cell-done-text': '#6ee7b7',
      '--viz-cell-obstacle-bg': '#1e293b',
      '--viz-cell-obstacle-border': '#475569',
      '--viz-code-bg': '#070a12',
      '--viz-code-text': '#e2e8f0',
      '--viz-code-active-line': 'rgba(0, 240, 255, 0.2)',
      '--viz-code-active-border': '#00f0ff',
    }
  },

  'academic-paper': {
    id: 'academic-paper',
    name: '学术极简 (Paper)',
    shortName: '学术黑白',
    icon: 'fa-book-open',
    isDark: false,
    accentColor: '#18181b',
    variables: {
      '--viz-app-bg': '#fcfcfc',
      '--viz-card-bg': '#ffffff',
      '--viz-card-border': '#d4d4d8',
      '--viz-card-shadow': 'none',
      '--viz-text-main': '#18181b',
      '--viz-text-muted': '#71717a',
      '--viz-primary': '#18181b',
      '--viz-primary-light': '#f4f4f5',
      '--viz-cell-bg': '#ffffff',
      '--viz-cell-border': '#d4d4d8',
      '--viz-cell-text': '#a1a1aa',
      '--viz-cell-active-bg': '#27272a',
      '--viz-cell-active-border': '#09090b',
      '--viz-cell-active-text': '#ffffff',
      '--viz-cell-active-shadow': '0 2px 4px rgba(0,0,0,0.15)',
      '--viz-cell-top-bg': '#f4f4f5',
      '--viz-cell-top-border': '#71717a',
      '--viz-cell-top-text': '#18181b',
      '--viz-cell-left-bg': '#f4f4f5',
      '--viz-cell-left-border': '#71717a',
      '--viz-cell-left-text': '#18181b',
      '--viz-cell-done-bg': '#f4f4f5',
      '--viz-cell-done-border': '#a1a1aa',
      '--viz-cell-done-text': '#27272a',
      '--viz-cell-obstacle-bg': '#e4e4e7',
      '--viz-cell-obstacle-border': '#a1a1aa',
      '--viz-code-bg': '#18181b',
      '--viz-code-text': '#f4f4f5',
      '--viz-code-active-line': 'rgba(255, 255, 255, 0.15)',
      '--viz-code-active-border': '#ffffff',
    }
  },

  'retro-arcade': {
    id: 'retro-arcade',
    name: '复古街机 (Retro)',
    shortName: '复古像素',
    icon: 'fa-gamepad',
    isDark: true,
    accentColor: '#f97316',
    variables: {
      '--viz-app-bg': '#140c24',
      '--viz-card-bg': '#1e1238',
      '--viz-card-border': '#3b206e',
      '--viz-card-shadow': '3px 3px 0px 0px #090412',
      '--viz-text-main': '#ffedd5',
      '--viz-text-muted': '#c084fc',
      '--viz-primary': '#fb923c',
      '--viz-primary-light': 'rgba(251, 146, 60, 0.2)',
      '--viz-cell-bg': '#28174a',
      '--viz-cell-border': '#4c2882',
      '--viz-cell-text': '#7e57c2',
      '--viz-cell-active-bg': '#f97316',
      '--viz-cell-active-border': '#fdba74',
      '--viz-cell-active-text': '#ffffff',
      '--viz-cell-active-shadow': '2px 2px 0px #7c2d12',
      '--viz-cell-top-bg': '#9333ea',
      '--viz-cell-top-border': '#c084fc',
      '--viz-cell-top-text': '#faf5ff',
      '--viz-cell-left-bg': '#eab308',
      '--viz-cell-left-border': '#fde047',
      '--viz-cell-left-text': '#422006',
      '--viz-cell-done-bg': '#10b981',
      '--viz-cell-done-border': '#6ee7b7',
      '--viz-cell-done-text': '#ffffff',
      '--viz-cell-obstacle-bg': '#3b206e',
      '--viz-cell-obstacle-border': '#6b21a8',
      '--viz-code-bg': '#0d0718',
      '--viz-code-text': '#fdba74',
      '--viz-code-active-line': 'rgba(249, 115, 22, 0.3)',
      '--viz-code-active-border': '#f97316',
    }
  }
};
