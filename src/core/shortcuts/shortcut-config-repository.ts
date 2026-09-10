/**
 * 快捷键配置持久化与仓储管理深模块 (ShortcutConfigRepository)
 * 遵循仓储模式 (Repository Pattern) 与观察者模式 (Observer Pattern)：
 * 负责管理默认动作表、用户改键映射、LocalStorage 持久化、按键冲突检测与导出/导入。
 */

import {
  DEFAULT_SHORTCUT_DEFINITIONS,
  ShortcutActionDefinition,
  ShortcutCategory
} from './shortcut-schema';
import { normalizeKeyCombo } from './key-combo-matcher';

const STORAGE_KEY = 'algo_viz_custom_shortcuts_v2';

export interface ActionWithEffectiveConfig extends ShortcutActionDefinition {
  effectiveCombo: string;
  isCustom: boolean;
}

export type ShortcutConfigChangeListener = () => void;

export class ShortcutConfigRepository {
  private static instance: ShortcutConfigRepository | null = null;
  private customBindings: Map<string, string> = new Map(); // actionId -> normalized combo
  private listeners: Set<ShortcutConfigChangeListener> = new Set();

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): ShortcutConfigRepository {
    if (!ShortcutConfigRepository.instance) {
      ShortcutConfigRepository.instance = new ShortcutConfigRepository();
    }
    return ShortcutConfigRepository.instance;
  }

  /**
   * 从 LocalStorage 加载用户自定义按键
   */
  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          this.customBindings.clear();
          Object.entries(parsed).forEach(([actionId, combo]) => {
            if (typeof combo === 'string' && combo.trim()) {
              this.customBindings.set(actionId, normalizeKeyCombo(combo));
            }
          });
        }
      }
    } catch (err) {
      console.warn('[ShortcutConfigRepository] 加载用户快捷键配置失败:', err);
    }
  }

  /**
   * 持久化到 LocalStorage
   */
  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const obj: Record<string, string> = {};
      this.customBindings.forEach((combo, actionId) => {
        obj[actionId] = combo;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (err) {
      console.warn('[ShortcutConfigRepository] 保存快捷键配置失败:', err);
    }
  }

  /**
   * 订阅配置变更事件
   */
  public subscribe(listener: ShortcutConfigChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyChange(): void {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('[ShortcutConfigRepository] 监听回调异常:', err);
      }
    });
  }

  /**
   * 获取所有系统内置动作定义
   */
  public getAllDefinitions(): ShortcutActionDefinition[] {
    return [...DEFAULT_SHORTCUT_DEFINITIONS];
  }

  /**
   * 根据动作 ID 获取定义
   */
  public getDefinition(actionId: string): ShortcutActionDefinition | undefined {
    return DEFAULT_SHORTCUT_DEFINITIONS.find((def) => def.id === actionId);
  }

  /**
   * 获取某个动作当前实际生效的快捷键
   */
  public getEffectiveCombo(actionId: string): string {
    const custom = this.customBindings.get(actionId);
    if (custom) return custom;

    const def = this.getDefinition(actionId);
    return def ? normalizeKeyCombo(def.defaultCombo) : '';
  }

  /**
   * 获取附带当前生效快捷键的完整动作清单
   */
  public getAllActionsWithEffectiveConfig(): ActionWithEffectiveConfig[] {
    return DEFAULT_SHORTCUT_DEFINITIONS.map((def) => {
      const isCustom = this.customBindings.has(def.id);
      const effectiveCombo = this.getEffectiveCombo(def.id);
      return {
        ...def,
        effectiveCombo,
        isCustom
      };
    });
  }

  /**
   * 检查某个组合键是否与其他动作冲突
   * @param targetActionId 当前准备绑定的动作 ID
   * @param newCombo 新按键
   */
  public checkConflict(
    targetActionId: string,
    newCombo: string
  ): { hasConflict: boolean; conflictAction?: ShortcutActionDefinition } {
    const normalized = normalizeKeyCombo(newCombo);
    if (!normalized) return { hasConflict: false };

    for (const def of DEFAULT_SHORTCUT_DEFINITIONS) {
      if (def.id === targetActionId) continue;

      const effective = this.getEffectiveCombo(def.id);
      if (effective === normalized) {
        return { hasConflict: true, conflictAction: def };
      }
    }

    return { hasConflict: false };
  }

  /**
   * 设置某个动作的自定义快捷键
   */
  public setCustomCombo(
    actionId: string,
    combo: string,
    force: boolean = false
  ): { success: boolean; conflictAction?: ShortcutActionDefinition; error?: string } {
    const def = this.getDefinition(actionId);
    if (!def) {
      return { success: false, error: `未找到动作: ${actionId}` };
    }

    const normalized = normalizeKeyCombo(combo);
    if (!normalized) {
      return { success: false, error: '无效的快捷键组合' };
    }

    // 冲突检查
    const conflict = this.checkConflict(actionId, normalized);
    if (conflict.hasConflict && !force) {
      return {
        success: false,
        conflictAction: conflict.conflictAction,
        error: `该快捷键已绑定到「${conflict.conflictAction?.name}」`
      };
    }

    // 如果与默认值一致，则清除自定义项以保持精简
    if (normalized === normalizeKeyCombo(def.defaultCombo)) {
      this.customBindings.delete(actionId);
    } else {
      this.customBindings.set(actionId, normalized);
    }

    this.saveToStorage();
    this.notifyChange();
    return { success: true };
  }

  /**
   * 重置单项为默认值
   */
  public resetAction(actionId: string): void {
    if (this.customBindings.has(actionId)) {
      this.customBindings.delete(actionId);
      this.saveToStorage();
      this.notifyChange();
    }
  }

  /**
   * 恢复全部快捷键为系统默认值
   */
  public resetAll(): void {
    this.customBindings.clear();
    this.saveToStorage();
    this.notifyChange();
  }

  /**
   * 导出当前用户自定义配置为 JSON 字符串
   */
  public exportConfig(): string {
    const obj: Record<string, string> = {};
    this.customBindings.forEach((combo, actionId) => {
      obj[actionId] = combo;
    });
    return JSON.stringify(obj, null, 2);
  }

  /**
   * 从 JSON 导入自定义配置
   */
  public importConfig(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        this.customBindings.clear();
        Object.entries(parsed).forEach(([actionId, combo]) => {
          if (typeof combo === 'string' && this.getDefinition(actionId)) {
            this.customBindings.set(actionId, normalizeKeyCombo(combo));
          }
        });
        this.saveToStorage();
        this.notifyChange();
        return true;
      }
    } catch (err) {
      console.error('[ShortcutConfigRepository] 导入快捷键配置失败:', err);
    }
    return false;
  }

  /**
   * 根据当前触发的规范化组合键，查找应当调度的动作定义
   */
  public findActionByCombo(normalizedCombo: string): ShortcutActionDefinition | undefined {
    if (!normalizedCombo) return undefined;

    // 1. 优先匹配生效的主快捷键
    for (const def of DEFAULT_SHORTCUT_DEFINITIONS) {
      const effective = this.getEffectiveCombo(def.id);
      if (effective === normalizedCombo) {
        return def;
      }
    }

    // 2. 其次匹配别名 (只有在没有自定义覆盖时别名才生效)
    for (const def of DEFAULT_SHORTCUT_DEFINITIONS) {
      if (this.customBindings.has(def.id)) continue;
      if (def.aliases && def.aliases.length > 0) {
        const matchAlias = def.aliases.some((a) => normalizeKeyCombo(a) === normalizedCombo);
        if (matchAlias) {
          return def;
        }
      }
    }

    return undefined;
  }
}

export const shortcutConfigRepo = ShortcutConfigRepository.getInstance();
