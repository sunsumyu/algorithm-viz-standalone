/**
 * 全局键盘快捷键控制中枢深度模块 (KeyboardShortcutController Deep Module)
 * 遵循命令模式 (Command Pattern) 与中介者模式 (Mediator Pattern)：
 * 提供集中的热键注册、按键分发、输入框焦点避让与生命周期管理。
 */

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
  private shortcuts: Map<string, ShortcutDefinition[]> = new Map();
  private keydownListener: ((e: KeyboardEvent) => void) | null = null;
  private isEnabled: boolean = true;

  private constructor() {
    this.initListener();
  }

  public static getInstance(): KeyboardShortcutController {
    if (!KeyboardShortcutController.instance) {
      KeyboardShortcutController.instance = new KeyboardShortcutController();
    }
    return KeyboardShortcutController.instance;
  }

  /**
   * 注册快捷键命令
   * @param combo 按键定义 (如 'Space', 'ArrowRight', 'Escape', 'm', '[')
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
    const normalized = combo.toLowerCase();
    if (!this.shortcuts.has(normalized)) {
      this.shortcuts.set(normalized, []);
    }

    const def: ShortcutDefinition = {
      combo,
      handler,
      description,
      allowInInput
    };

    this.shortcuts.get(normalized)!.push(def);

    return () => {
      this.unregister(combo, handler);
    };
  }

  /**
   * 取消指定快捷键注册
   */
  public unregister(combo: KeyCombo, handler: ShortcutHandler): void {
    const normalized = combo.toLowerCase();
    const list = this.shortcuts.get(normalized);
    if (list) {
      const idx = list.findIndex((item) => item.handler === handler);
      if (idx !== -1) {
        list.splice(idx, 1);
      }
      if (list.length === 0) {
        this.shortcuts.delete(normalized);
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
   * 清空所有快捷键注册
   */
  public clear(): void {
    this.shortcuts.clear();
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
  public handleKeyEvent(e: { key: string; target?: any; preventDefault?: () => void }): void {
    if (!this.isEnabled) return;

    const target = e.target as HTMLElement | null;
    const isInput =
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        Boolean(target.isContentEditable));

    const key = (e.key || '').toLowerCase();
    const defs = this.shortcuts.get(key);

    if (defs && defs.length > 0) {
      for (const def of defs) {
        if (isInput && !def.allowInInput) {
          continue;
        }
        def.handler(e as KeyboardEvent);
      }
    }
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
