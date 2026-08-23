/**
 * 插件加载器
 * 负责动态加载和管理插件
 */

import type { Plugin, PluginContext, PluginMetadata } from './types';

class PluginLoader {
  private plugins: Map<string, Plugin> = new Map();
  private loadedPlugins: Set<string> = new Set();

  private createContext(plugin: Plugin): PluginContext {
    return { pluginId: plugin.id };
  }

  private validatePlugin(plugin: Plugin): void {
    if (!plugin.id.trim()) {
      throw new Error('Plugin id is required');
    }

    if (!/^[a-z0-9-]+$/.test(plugin.id)) {
      throw new Error(`Plugin id "${plugin.id}" must use lowercase letters, numbers, or dashes`);
    }
  }

  /**
   * 注册插件
   */
  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin ${plugin.id} already registered`);
      return;
    }

    this.validatePlugin(plugin);
    this.plugins.set(plugin.id, plugin);
    console.log(`[PluginLoader] Registered plugin: ${plugin.name} v${plugin.version}`);
  }

  /**
   * 加载插件
   */
  async load(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);

    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (this.loadedPlugins.has(pluginId)) {
      console.warn(`Plugin ${pluginId} already loaded`);
      return;
    }

    try {
      await plugin.initialize(this.createContext(plugin));
      this.loadedPlugins.add(pluginId);
      console.log(`[PluginLoader] Loaded plugin: ${plugin.name}`);
    } catch (error) {
      console.error(`[PluginLoader] Failed to load plugin ${pluginId}:`, error);
      throw error;
    }
  }

  /**
   * 卸载插件
   */
  async unload(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);

    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (!this.loadedPlugins.has(pluginId)) {
      console.warn(`Plugin ${pluginId} not loaded`);
      return;
    }

    try {
      if (plugin.destroy) {
        await plugin.destroy();
      }
      this.loadedPlugins.delete(pluginId);
      console.log(`[PluginLoader] Unloaded plugin: ${plugin.name}`);
    } catch (error) {
      console.error(`[PluginLoader] Failed to unload plugin ${pluginId}:`, error);
      throw error;
    }
  }

  /**
   * 获取所有已注册的插件
   */
  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 获取已加载的插件
   */
  getLoaded(): Plugin[] {
    return Array.from(this.loadedPlugins)
      .map(id => this.plugins.get(id))
      .filter((p): p is Plugin => p !== undefined);
  }

  getMetadata(): PluginMetadata[] {
    return this.getAll().map((plugin) => ({
      author: 'unknown',
      capabilities: plugin.capabilities,
      description: plugin.description || '',
      entry: '',
      id: plugin.id,
      name: plugin.name,
      version: plugin.version,
    }));
  }

  /**
   * 检查插件是否已加载
   */
  isLoaded(pluginId: string): boolean {
    return this.loadedPlugins.has(pluginId);
  }
}

// 导出单例
export const pluginLoader = new PluginLoader();