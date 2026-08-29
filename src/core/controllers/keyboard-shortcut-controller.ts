/**
 * 全局键盘快捷键控制中枢深度模块 (KeyboardShortcutController Deep Module)
 * 遵循命令模式 (Command Pattern) 与中介者模式 (Mediator Pattern)：
 * 整合配置式按键仓储 (ShortcutConfigRepository)、组合键规范化 (KeyComboMatcher) 与动作调度器 (ShortcutActionDispatcher)
 */

import {
  normalizeKeyCombo,
  eventToKeyCombo
} from '../shortcuts/key-combo-matcher';
import {
  shortcutConfigRepo,
  ShortcutConfigRepository
} from '../shortcuts/shortcut-config-repository';
import {
  shortcutDispatcher,
  ShortcutActionDispatcher
} from '../shortcuts/shortcut-action-dispatcher';
import { ShortcutActionDefinition } from '../shortcuts/shortcut-schema';

export type KeyCombo = string;
export type ShortcutHandler = (e: KeyboardEvent) => void;

export interface ShortcutDefinition {
  combo: KeyCombo;
  handler: ShortcutHandler;
  description?: string;
  allowInInput?: boolean;
}

export class KeyboardShortcutController {
  private static instance: KeyboardShortcutController | null = null;
  private customHandlers: Map<string, ShortcutDefinition[]> = new Map();
  private keydownListener: ((e: KeyboardEvent) => void) | null = null;
  private isEnabled: boolean = true;
  private configRepo: ShortcutConfigRepository;
  private dispatcher: ShortcutActionDispatcher;

  private constructor() {
    this.configRepo = shortcutConfigRepo;
    this.dispatcher = shortcutDispatcher;
    this.initListener();
  }

  public static getInstance(): KeyboardShortcutController {
    if (!KeyboardShortcutController.instance) {
      KeyboardShortcutController.instance = new KeyboardShortcutController();
    }
    return KeyboardShortcutController.instance;
  }

  /**
   * 手动编程式注册快捷键命令（向后兼容接口）
   * @param combo 按键定义 (如 'Space', 'ArrowRight', 'Ctrl+K', '[')
   * @param handler 触发回调
   * @param description 功能描述
   * @param allowInInput 是否允许在输入框中触发 (默认 false)
   * @returns 取消注册函数 (UnregisterFn)
   */
  public register(
    combo: KeyCombo,
    handler: ShortcutHandler,
    description?: string,
    allowInInput: boolean = false
  ): () => void {
    const normalized = normalizeKeyCombo(combo);
    if (!this.customHandlers.has(normalized)) {
      this.customHandlers.set(normalized, []);
    }

    const def: ShortcutDefinition = {
      combo: normalized,
      handler,
      description,
      allowInInput
    };

    this.customHandlers.get(normalized)!.push(def);

    return () => {
      this.unregister(combo, handler);
    };
  }

  /**
   * 取消指定手动快捷键注册
   */
  public unregister(combo: KeyCombo, handler: ShortcutHandler): void {
    const normalized = normalizeKeyCombo(combo);
    const list = this.customHandlers.get(normalized);
    if (list) {
      const idx = list.findIndex((item) => item.handler === handler);
      if (idx !== -1) {
        list.splice(idx, 1);
      }
      if (list.length === 0) {
        this.customHandlers.delete(normalized);
      }
    }
  }

  /**
   * 暂停/启用快捷键监听
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * 清空所有手动编程式注册的快捷键
   */
  public clear(): void {
    this.customHandlers.clear();
  }

  /**
   * 销毁并移除全局监听器
   */
  public dispose(): void {
    this.clear();
    if (typeof document !== 'undefined' && this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener);
      this.keydownListener = null;
    }
  }

  /**
   * 触发按键事件调度处理 (供原生 DOM 监听器与无头单测直接调度)
   */
  public handleKeyEvent(e: {
    key?: string;
    code?: string;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
    target?: any;
    preventDefault?: () => void;
  }): boolean {
    if (!this.isEnabled) return false;

    const target = e.target as HTMLElement | null;
    const isInput =
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        Boolean((target as any).isContentEditable));

    // 1. 将按键转换为规范化组合键
    const combo = eventToKeyCombo(e);
    if (!combo) return false;

    let handled = false;

    // 2. 先检查是否有手动编程式注册的处理函数 (Custom Handlers)
    const customList = this.customHandlers.get(combo);
    if (customList && customList.length > 0) {
      for (const def of customList) {
        if (isInput && !def.allowInInput) {
          continue;
        }
        def.handler(e as KeyboardEvent);
        handled = true;
      }
    }

    if (handled) {
      return true;
    }

    // 3. 检查系统配置动作表 (Declarative Action Registry)
    const action = this.configRepo.findActionByCombo(combo);
    if (action) {
      if (isInput && !action.allowInInput) {
        return false;
      }

      if (typeof e.preventDefault === 'function') {
        e.preventDefault();
      }

      return this.dispatcher.dispatch(action.id, e as unknown as Event);
    }

    return false;
  }

  private initListener(): void {
    this.keydownListener = (e: KeyboardEvent) => {
      this.handleKeyEvent(e);
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', this.keydownListener);
    }
  }
}

export const shortcutController = KeyboardShortcutController.getInstance();
