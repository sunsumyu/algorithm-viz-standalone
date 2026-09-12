/**
 * 步进播放速度预设配置 (PlaybackSpeedPresets)
 * 声明式舞台模板中播放节奏选项的唯一数据源 (SSOT)，
 * 模板禁止私写裸毫秒选项列表。
 */

export interface PlaybackSpeedPreset {
  /** 每步间隔毫秒数 */
  ms: number;
  /** 选项展示文案 */
  label: string;
  /** 是否默认选中 */
  default?: boolean;
}

export const PLAYBACK_SPEED_PRESETS: readonly PlaybackSpeedPreset[] = Object.freeze([
  { ms: 1200, label: '慢速' },
  { ms: 500, label: '正常', default: true },
  { ms: 200, label: '快速' },
]);

/** 默认选中的每步间隔毫秒数（无 default 标记时兜底 500ms） */
export const DEFAULT_SPEED_MS: number =
  PLAYBACK_SPEED_PRESETS.find((preset) => preset.default)?.ms ?? 500;
