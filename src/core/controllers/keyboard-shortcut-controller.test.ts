import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KeyboardShortcutController, shortcutController } from './keyboard-shortcut-controller';

describe('KeyboardShortcutController Deep Module Guard (Command Pattern)', () => {
  beforeEach(() => {
    shortcutController.clear();
    shortcutController.setEnabled(true);
  });

  it('should register and trigger shortcut callback on keydown', () => {
    const fn = vi.fn();
    const unreg = shortcutController.register('Space', fn, '播放/暂停');

    // 模拟按键事件
    const event = {
      key: 'Space',
      target: { tagName: 'DIV' }
    };

    shortcutController.handleKeyEvent(event);
    expect(fn).toHaveBeenCalledTimes(1);

    // 取消注册
    unreg();
    shortcutController.handleKeyEvent(event);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should ignore hotkeys when focus is on input/textarea by default', () => {
    const fn = vi.fn();
    shortcutController.register('ArrowRight', fn, '单步前进');

    const inputEvent = {
      key: 'ArrowRight',
      target: { tagName: 'INPUT' }
    };

    shortcutController.handleKeyEvent(inputEvent);
    expect(fn).not.toHaveBeenCalled();

    const normalEvent = {
      key: 'ArrowRight',
      target: { tagName: 'DIV' }
    };

    shortcutController.handleKeyEvent(normalEvent);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should allow hotkeys in input if allowInInput is true (e.g., Escape)', () => {
    const fn = vi.fn();
    shortcutController.register('Escape', fn, '关闭弹窗', true);

    const inputEvent = {
      key: 'Escape',
      target: { tagName: 'INPUT' }
    };

    shortcutController.handleKeyEvent(inputEvent);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should respect setEnabled(false) to temporarily disable all shortcuts', () => {
    const fn = vi.fn();
    shortcutController.register('m', fn, '展开目录');

    shortcutController.setEnabled(false);
    shortcutController.handleKeyEvent({ key: 'm', target: { tagName: 'DIV' } });
    expect(fn).not.toHaveBeenCalled();

    shortcutController.setEnabled(true);
    shortcutController.handleKeyEvent({ key: 'm', target: { tagName: 'DIV' } });
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
