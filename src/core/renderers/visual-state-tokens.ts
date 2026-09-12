/**
 * VisualStateTokens (视觉状态语义令牌层)
 *
 * 全库渲染器「状态 → 颜色」语义词汇的唯一权威出处（Single Source of Truth）。
 * 渲染器只引用语义状态名（comparing / swapping / sorted …），
 * 主题配置负责把令牌解析为具体色值 —— 暗色主题因此从
 * 「修改上万处内联 hex」退化为「新增一份主题配置」。
 *
 * 设计约束：100% 零 DOM 依赖（纯数据 + 纯函数），可无头单元测试。
 */

/** 视觉状态语义词汇（全库统一，禁止渲染器自造色值表达状态） */
export type VisualStateId =
  | 'idle' /** 默认 / 未触及 */
  | 'comparing' /** 比较中 / 主指针 */
  | 'scanning' /** 扫描中 / 次级探测 */
  | 'swapping' /** 交换 / 搬移（强调态） */
  | 'sorted' /** 已就位 / 已完成 */
  | 'pivot' /** 基准 / 当前极值（强调态） */
  | 'secondary'; /** 次级指针 / 反向段 */

/** 单个语义状态的完整视觉样式 */
export interface VisualStateStyle {
  bg: string;
  border: string;
  text: string;
  /**
   * 强调态缩放系数占位：非 null 表示该状态有强调放大语义。
   * 实际缩放值由画布适配器的 emphasisScale 选项提供（各家族 1.05 / 1.06）。
   */
  scale: number | null;
}

export type VisualThemeId = 'light';

export interface VisualTheme {
  id: VisualThemeId;
  states: Record<VisualStateId, VisualStateStyle>;
}

/** 亮色主题（当前唯一主题；暗色主题 = 新增一份 VisualTheme 配置） */
const LIGHT_THEME: VisualTheme = {
  id: 'light',
  states: {
    idle: { bg: '#cbd5e1', border: '#94a3b8', text: '#334155', scale: null },
    comparing: { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8', scale: null },
    scanning: { bg: '#f0fdf4', border: '#38bdf8', text: '#0369a1', scale: null },
    swapping: { bg: '#fef2f2', border: '#ef4444', text: '#b91c1c', scale: 1.05 },
    sorted: { bg: '#f0fdf4', border: '#22c55e', text: '#15803d', scale: null },
    pivot: { bg: '#fef9c3', border: '#eab308', text: '#854d0e', scale: 1.05 },
    secondary: { bg: '#faf5ff', border: '#a855f7', text: '#7e22ce', scale: null },
  },
};

const THEMES: Record<VisualThemeId, VisualTheme> = {
  light: LIGHT_THEME,
};

let currentThemeId: VisualThemeId = 'light';

/** 切换当前视觉主题（未来暗色主题的接缝） */
export function setVisualTheme(themeId: VisualThemeId): void {
  currentThemeId = themeId;
}

export function getVisualThemeId(): VisualThemeId {
  return currentThemeId;
}

/** 解析语义状态为当前主题下的具体样式；未知状态安全回退 idle */
export function visualState(state: VisualStateId, themeId: VisualThemeId = currentThemeId): VisualStateStyle {
  const theme = THEMES[themeId] ?? THEMES.light;
  return theme.states[state] ?? theme.states.idle;
}

/** 一次性取整个状态词汇表（供画布适配器批量消费） */
export function visualStateTable(themeId: VisualThemeId = currentThemeId): Record<VisualStateId, VisualStateStyle> {
  return THEMES[themeId]?.states ?? THEMES.light.states;
}
