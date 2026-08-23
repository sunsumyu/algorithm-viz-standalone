/**
 * 核心类型定义
 */

export interface PluginCapabilities {
  usesGlobalActions?: boolean;
  windowActionNamespace?: string;
}

export interface PluginContext {
  pluginId: string;
}

// 插件接口
export interface Plugin {
  id: string;
  name: string;
  version: string;
  description?: string;
  capabilities?: PluginCapabilities;
  initialize(context?: PluginContext): Promise<void>;
  destroy?(): void | Promise<void>;
}

// 插件元数据
export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  entry: string;
  capabilities?: PluginCapabilities;
}

export interface PluginDiagnostic extends PluginMetadata {
  loaded: boolean;
  usesNamespace: boolean;
}