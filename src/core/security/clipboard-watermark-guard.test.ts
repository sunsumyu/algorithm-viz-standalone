// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  handleClipboardCopy,
  setupClipboardWatermarkGuard,
  teardownClipboardWatermarkGuard,
  isClipboardGuardActive,
} from './clipboard-watermark-guard';
import { decodeFromZeroWidth } from './zero-width-watermark';
import { clientActivationModal } from './client-activation-modal';

describe('Clipboard Watermark Guard (方案 A 剪贴板盲水印陷阱)', () => {
  beforeEach(() => {
    teardownClipboardWatermarkGuard();
    clientActivationModal.resetForTesting();
  });

  afterEach(() => {
    teardownClipboardWatermarkGuard();
  });

  it('当用户划词复制算法文本时，应自动向剪贴板写入不可见买家盲水印', () => {
    const rawSelectedText = '二叉树最近公共祖先 (LCA) 算法的核心在于自底向上的递归回溯探测。';

    // 模拟 window.getSelection
    const getSelectionMock = vi.fn().mockReturnValue({
      toString: () => rawSelectedText,
    });
    vi.stubGlobal('getSelection', getSelectionMock);

    let writtenText = '';
    const preventDefaultMock = vi.fn();
    const setDataMock = vi.fn((format: string, data: string) => {
      if (format === 'text/plain') {
        writtenText = data;
      }
    });

    const mockEvent = {
      clipboardData: {
        setData: setDataMock,
      },
      preventDefault: preventDefaultMock,
    } as unknown as ClipboardEvent;

    handleClipboardCopy(mockEvent);

    expect(preventDefaultMock).toHaveBeenCalled();
    expect(setDataMock).toHaveBeenCalledWith('text/plain', expect.any(String));

    // 验证写入剪贴板的文本中深埋着盲水印，且解码后能够提取出买家标识
    const extractedBuyer = decodeFromZeroWidth(writtenText);
    expect(extractedBuyer).toBeTruthy();
    expect(writtenText).toContain('二叉树最近公共祖先');

    vi.unstubAllGlobals();
  });

  it('复制极短文本（小于 4 个字符）时不应触发水印注入或阻止默认事件', () => {
    const getSelectionMock = vi.fn().mockReturnValue({
      toString: () => 'ab',
    });
    vi.stubGlobal('getSelection', getSelectionMock);

    const preventDefaultMock = vi.fn();
    const setDataMock = vi.fn();

    const mockEvent = {
      clipboardData: {
        setData: setDataMock,
      },
      preventDefault: preventDefaultMock,
    } as unknown as ClipboardEvent;

    handleClipboardCopy(mockEvent);

    expect(preventDefaultMock).not.toHaveBeenCalled();
    expect(setDataMock).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it('setup 与 teardown 能正确控制全局事件监听器的生命周期', () => {
    expect(isClipboardGuardActive()).toBe(false);

    const cleanup = setupClipboardWatermarkGuard();
    expect(isClipboardGuardActive()).toBe(true);

    cleanup();
    expect(isClipboardGuardActive()).toBe(false);
  });
});
