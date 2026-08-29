import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KeyboardShortcutController, shortcutController } from './keyboard-shortcut-controller';
import { shortcutConfigRepo } from '../shortcuts/shortcut-config-repository';
import { shortcutDispatcher } from '../shortcuts/shortcut-action-dispatcher';
import { algoNavigation } from '../algo-navigation';

describe('KeyboardShortcutController Deep Module Guard', () => {
  beforeEach(() => {
    shortcutController.clear();
    shortcutController.setEnabled(true);
    shortcutConfigRepo.resetAll();
  });

  it('should dispatch declarative actions like navigation.prevAlgo and navigation.nextAlgo', () => {
    const prevSpy = vi.spyOn(algoNavigation, 'navigateToPrevious').mockImplementation(() => {});
    const nextSpy = vi.spyOn(algoNavigation, 'navigateToNext').mockImplementation(() => {});

    // 按下 [ (上一题)
    shortcutController.handleKeyEvent({ key: '[' });
    expect(prevSpy).toHaveBeenCalledTimes(1);

    // 按下 ] (下一题)
    shortcutController.handleKeyEvent({ key: ']' });
    expect(nextSpy).toHaveBeenCalledTimes(1);

    // 按下 PageUp (别名上一题)
    shortcutController.handleKeyEvent({ key: 'PageUp' });
    expect(prevSpy).toHaveBeenCalledTimes(2);

    // 按下 PageDown (别名下一题)
    shortcutController.handleKeyEvent({ key: 'PageDown' });
    expect(nextSpy).toHaveBeenCalledTimes(2);

    prevSpy.mockRestore();
    nextSpy.mockRestore();
  });

  it('should support customized remapped keys dynamically', () => {
    const nextSpy = vi.spyOn(algoNavigation, 'navigateToNext').mockImplementation(() => {});

    // 将下一题改键为 'n'
    shortcutConfigRepo.setCustomCombo('navigation.nextAlgo', 'n');

    shortcutController.handleKeyEvent({ key: 'n' });
    expect(nextSpy).toHaveBeenCalledTimes(1);

    nextSpy.mockRestore();
  });

  it('should support manual programmatic hotkey registrations for backwards compatibility', () => {
    const fn = vi.fn();
    const unreg = shortcutController.register('Ctrl+Shift+Z', fn, '测试命令');

    const event = {
      key: 'z',
      ctrlKey: true,
      shiftKey: true
    };

    shortcutController.handleKeyEvent(event);
    expect(fn).toHaveBeenCalledTimes(1);

    unreg();
    shortcutController.handleKeyEvent(event);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should ignore non-allowInInput hotkeys when focused on an input element', () => {
    const prevSpy = vi.spyOn(algoNavigation, 'navigateToPrevious').mockImplementation(() => {});

    const inputEvent = {
      key: '[',
      target: { tagName: 'INPUT' }
    };

    shortcutController.handleKeyEvent(inputEvent);
    expect(prevSpy).not.toHaveBeenCalled();

    prevSpy.mockRestore();
  });

  it('should allow hotkeys with allowInInput: true even in input elements', () => {
    const dispatchSpy = vi.spyOn(shortcutDispatcher, 'dispatch').mockImplementation(() => true);

    const escEvent = {
      key: 'Escape',
      target: { tagName: 'INPUT' },
      preventDefault: vi.fn()
    };

    const handled = shortcutController.handleKeyEvent(escEvent);
    expect(handled).toBe(true);
    expect(dispatchSpy).toHaveBeenCalledWith('general.closeModal', expect.anything());

    dispatchSpy.mockRestore();
  });

  it('should respect setEnabled(false) to disable all keyboard processing', () => {
    const nextSpy = vi.spyOn(algoNavigation, 'navigateToNext').mockImplementation(() => {});

    shortcutController.setEnabled(false);
    shortcutController.handleKeyEvent({ key: ']' });
    expect(nextSpy).not.toHaveBeenCalled();

    shortcutController.setEnabled(true);
    shortcutController.handleKeyEvent({ key: ']' });
    expect(nextSpy).toHaveBeenCalledTimes(1);

    nextSpy.mockRestore();
  });
});
