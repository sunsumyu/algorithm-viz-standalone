import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ShortcutConfigRepository,
  shortcutConfigRepo
} from './shortcut-config-repository';

describe('ShortcutConfigRepository Guard Tests', () => {
  beforeEach(() => {
    shortcutConfigRepo.resetAll();
  });

  it('should list all predefined default actions', () => {
    const actions = shortcutConfigRepo.getAllActionsWithEffectiveConfig();
    expect(actions.length).toBeGreaterThanOrEqual(18);

    const prevAlgo = actions.find((a) => a.id === 'navigation.prevAlgo');
    expect(prevAlgo).toBeDefined();
    expect(prevAlgo?.effectiveCombo).toBe('[');

    const nextAlgo = actions.find((a) => a.id === 'navigation.nextAlgo');
    expect(nextAlgo).toBeDefined();
    expect(nextAlgo?.effectiveCombo).toBe(']');

    const playToggle = actions.find((a) => a.id === 'playback.toggle');
    expect(playToggle?.effectiveCombo).toBe('Space');
  });

  it('should support customizing a shortcut and detecting conflicts', () => {
    // 尝试将单步前进改为 Space (此时 Space 已被 playToggle 占用)
    const conflictResult = shortcutConfigRepo.setCustomCombo('playback.stepForward', 'Space');
    expect(conflictResult.success).toBe(false);
    expect(conflictResult.conflictAction?.id).toBe('playback.toggle');

    // 绑定未占用的组合键
    const validResult = shortcutConfigRepo.setCustomCombo('playback.stepForward', 'j');
    expect(validResult.success).toBe(true);
    expect(shortcutConfigRepo.getEffectiveCombo('playback.stepForward')).toBe('J');

    // 单项重置
    shortcutConfigRepo.resetAction('playback.stepForward');
    expect(shortcutConfigRepo.getEffectiveCombo('playback.stepForward')).toBe('ArrowRight');
  });

  it('should notify subscribers when configuration changes', () => {
    const listener = vi.fn();
    const unsub = shortcutConfigRepo.subscribe(listener);

    shortcutConfigRepo.setCustomCombo('playback.reset', 'x');
    expect(listener).toHaveBeenCalledTimes(1);

    shortcutConfigRepo.resetAll();
    expect(listener).toHaveBeenCalledTimes(2);

    unsub();
    shortcutConfigRepo.setCustomCombo('playback.reset', 'y');
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('should export and import configuration as JSON', () => {
    shortcutConfigRepo.setCustomCombo('playback.speedCycle', 'q');
    const exportedJson = shortcutConfigRepo.exportConfig();
    expect(exportedJson).toContain('"playback.speedCycle": "Q"');

    shortcutConfigRepo.resetAll();
    expect(shortcutConfigRepo.getEffectiveCombo('playback.speedCycle')).toBe('S');

    const imported = shortcutConfigRepo.importConfig(exportedJson);
    expect(imported).toBe(true);
    expect(shortcutConfigRepo.getEffectiveCombo('playback.speedCycle')).toBe('Q');
  });

  it('should find action by main key or alias', () => {
    // 主键匹配
    expect(shortcutConfigRepo.findActionByCombo('[')?.id).toBe('navigation.prevAlgo');
    expect(shortcutConfigRepo.findActionByCombo(']')?.id).toBe('navigation.nextAlgo');
    expect(shortcutConfigRepo.findActionByCombo('Space')?.id).toBe('playback.toggle');

    // 别名匹配 (e.g. PageUp -> prevAlgo, PageDown -> nextAlgo)
    expect(shortcutConfigRepo.findActionByCombo('PageUp')?.id).toBe('navigation.prevAlgo');
    expect(shortcutConfigRepo.findActionByCombo('PageDown')?.id).toBe('navigation.nextAlgo');
    expect(shortcutConfigRepo.findActionByCombo('Alt+ArrowLeft')?.id).toBe('navigation.prevAlgo');
    expect(shortcutConfigRepo.findActionByCombo('Alt+ArrowRight')?.id).toBe('navigation.nextAlgo');
  });
});
