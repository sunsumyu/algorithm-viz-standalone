import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppSettingsRepository } from './app-settings-repository';
import { DEFAULT_APP_SETTINGS } from './settings-schema';

describe('AppSettingsRepository Deep Module Guard', () => {
  const TEST_STORAGE_KEY = 'test_algo_viz_settings';
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    (globalThis as any).localStorage = {
      getItem: (k: string) => mockStorage[k] || null,
      setItem: (k: string, v: string) => { mockStorage[k] = v; },
      removeItem: (k: string) => { delete mockStorage[k]; },
      clear: () => { mockStorage = {}; },
    };
    AppSettingsRepository.resetInstance();
  });

  it('should initialize with default app settings when storage is empty', () => {
    const repo = AppSettingsRepository.getInstance(TEST_STORAGE_KEY);
    const settings = repo.getSettings();

    expect(settings.appearance.theme).toBe(DEFAULT_APP_SETTINGS.appearance.theme);
    expect(settings.appearance.codeFontSize).toBe(DEFAULT_APP_SETTINGS.appearance.codeFontSize);
    expect(settings.playback.defaultSpeed).toBe(DEFAULT_APP_SETTINGS.playback.defaultSpeed);
    expect(settings.layout.defaultRightTab).toBe(DEFAULT_APP_SETTINGS.layout.defaultRightTab);
  });

  it('should update appearance settings and persist to storage', () => {
    const repo = AppSettingsRepository.getInstance(TEST_STORAGE_KEY);
    
    repo.updateAppearance({
      theme: 'dark-cyberpunk',
      codeFontSize: 14,
    });

    const updated = repo.getSettings();
    expect(updated.appearance.theme).toBe('dark-cyberpunk');
    expect(updated.appearance.codeFontSize).toBe(14);
    expect(mockStorage[TEST_STORAGE_KEY]).toContain('dark-cyberpunk');
  });

  it('should update playback settings and notify subscribers', () => {
    const repo = AppSettingsRepository.getInstance(TEST_STORAGE_KEY);
    const subscriber = vi.fn();
    const unsub = repo.subscribe(subscriber);

    repo.updatePlayback({
      defaultSpeed: 2.0,
      autoPlayOnMount: true,
    });

    expect(subscriber).toHaveBeenCalledTimes(1);
    const callArg = subscriber.mock.calls[0][0];
    expect(callArg.playback.defaultSpeed).toBe(2.0);
    expect(callArg.playback.autoPlayOnMount).toBe(true);

    unsub();
    repo.updatePlayback({ defaultSpeed: 0.5 });
    expect(subscriber).toHaveBeenCalledTimes(1); // 不再接收新通知
  });

  it('should reset all settings back to factory defaults', () => {
    const repo = AppSettingsRepository.getInstance(TEST_STORAGE_KEY);
    
    repo.updateAppearance({ theme: 'retro-arcade', codeFontSize: 16 });
    repo.updatePlayback({ defaultSpeed: 3.0 });
    repo.resetToDefaults();

    const resetSettings = repo.getSettings();
    expect(resetSettings.appearance.theme).toBe('leetcode-light');
    expect(resetSettings.appearance.codeFontSize).toBe(12);
    expect(resetSettings.playback.defaultSpeed).toBe(1.0);
  });

  it('should export and import config JSON correctly', () => {
    const repo = AppSettingsRepository.getInstance(TEST_STORAGE_KEY);
    repo.updateAppearance({ theme: 'academic-paper', codeFontSize: 15 });
    repo.updateLayout({ defaultCodeLang: 'python' });

    const exportedJSON = repo.exportConfigJSON();
    expect(exportedJSON).toContain('academic-paper');
    expect(exportedJSON).toContain('python');

    // 模拟重置后重新导入
    repo.resetToDefaults();
    expect(repo.getSettings().appearance.theme).toBe('leetcode-light');

    const result = repo.importConfigJSON(exportedJSON);
    expect(result.success).toBe(true);
    expect(repo.getSettings().appearance.theme).toBe('academic-paper');
    expect(repo.getSettings().layout.defaultCodeLang).toBe('python');
  });

  it('should defend against corrupt or invalid JSON gracefully', () => {
    mockStorage[TEST_STORAGE_KEY] = 'invalid-corrupt-json{';
    const repo = AppSettingsRepository.getInstance(TEST_STORAGE_KEY);
    const settings = repo.getSettings();

    expect(settings.appearance.theme).toBe('leetcode-light');
    expect(settings.appearance.codeFontSize).toBe(12);

    const importRes = repo.importConfigJSON('{bad json');
    expect(importRes.success).toBe(false);
    expect(importRes.error).toBeDefined();
  });
});
