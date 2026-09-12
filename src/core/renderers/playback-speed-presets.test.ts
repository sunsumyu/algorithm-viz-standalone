import { describe, it, expect } from 'vitest';
import {
  PLAYBACK_SPEED_PRESETS,
  DEFAULT_SPEED_MS,
} from './playback-speed-presets';

describe('PlaybackSpeedPresets 配置 SSOT', () => {
  it('应提供非空预设且毫秒值唯一、为正', () => {
    expect(PLAYBACK_SPEED_PRESETS.length).toBeGreaterThan(0);
    const msList = PLAYBACK_SPEED_PRESETS.map((p) => p.ms);
    expect(new Set(msList).size).toBe(msList.length);
    for (const ms of msList) {
      expect(ms).toBeGreaterThan(0);
    }
  });

  it('应有且仅有一个默认预设，且 DEFAULT_SPEED_MS 与之一致', () => {
    const defaults = PLAYBACK_SPEED_PRESETS.filter((p) => p.default);
    expect(defaults.length).toBe(1);
    expect(DEFAULT_SPEED_MS).toBe(defaults[0].ms);
  });

  it('每个预设都应有展示文案', () => {
    for (const preset of PLAYBACK_SPEED_PRESETS) {
      expect(preset.label.trim().length).toBeGreaterThan(0);
    }
  });
});
