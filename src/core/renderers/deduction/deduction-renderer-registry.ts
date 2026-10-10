/**
 * 全景推演树渲染策略分发中心 (DeductionRendererRegistry)
 * 遵循 Matt Pocock 深模块哲学与设计模式：
 * 1. 享元模式 (Flyweight Pattern)：已加载实例在内存中单例缓存复用，零重复实例化开销。
 * 2. 虚拟代理 / 惰性路由 (Virtual Proxy / Lazy Router)：切断 88+ 个专用渲染器与通用 DP 模型的静态导入级联，按需动态加载。
 * 3. 责任链 / 优雅降级 (Chain of Responsibility / Fallback)：优先专用渲染器 -> 次选通用 DP -> 兜底。
 * 4. 纯静态 O(1) 判定：依赖 DeductionManifest，避免启动时构建庞大依赖树。
 */

import type { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import {
  DEDICATED_MODEL_FILE_MAP,
  UNIVERSAL_DP_MODEL_IDS,
  isDeductionSupported,
} from './deduction-manifest';

export class DeductionRendererRegistry {
  /**
   * 手工/动态注册的高优先级渲染器
   */
  private static readonly customRenderers: IDeductionTreeRenderer[] = [];

  /**
   * 享元实例缓存池 (Flyweight Cache)
   */
  private static readonly instanceCache = new Map<string, IDeductionTreeRenderer>();

  /**
   * 通用 DP 推演渲染器惰性单例
   */
  private static universalDpRenderer: IDeductionTreeRenderer | null = null;

  /**
   * Vite 动态模块加载映射表 (保持轻量按需路由)
   */
  private static readonly moduleLoaders: Record<string, () => Promise<any>> = import.meta.glob(
    './*-deduction-renderer.ts'
  );

  /**
   * 动态注册推演树渲染策略 (高优先级)
   */
  public static registerRenderer(renderer: IDeductionTreeRenderer): void {
    if (!this.customRenderers.some(r => r.id === renderer.id)) {
      this.customRenderers.unshift(renderer);
    }
  }

  /**
   * 纯同步 O(1) 判定任意算法是否支持全景推演树
   */
  public static isSupported(modelId: string): boolean {
    if (!modelId) return false;
    if (this.customRenderers.some(r => r.canHandle(modelId))) return true;
    return isDeductionSupported(modelId);
  }

  /**
   * 按需解析并获取目标推演树渲染策略 (Virtual Proxy Resolver)
   */
  public static async resolveRenderer(modelId: string): Promise<IDeductionTreeRenderer | null> {
    if (!modelId) return null;

    // 1. 优先检查自定义注册策略
    const custom = this.customRenderers.find(r => r.canHandle(modelId));
    if (custom) return custom;

    // 2. 检查享元缓存
    const cached = this.instanceCache.get(modelId);
    if (cached) return cached;

    // 3. 专用推演渲染器按需动态加载
    const fileName = DEDICATED_MODEL_FILE_MAP[modelId];
    if (fileName) {
      const loaderKey = `./${fileName}`;
      const loader = this.moduleLoaders[loaderKey];
      if (loader) {
        try {
          const mod = await loader();
          const renderer = this.instantiateRenderer(mod);
          if (renderer) {
            this.instanceCache.set(modelId, renderer);
            if (renderer.id && renderer.id !== modelId) {
              this.instanceCache.set(renderer.id, renderer);
            }
            return renderer;
          }
        } catch (err) {
          console.warn(`[DeductionRendererRegistry] 加载专用推演渲染器失败: ${fileName}`, err);
        }
      }
    }

    // 4. 通用动态规划推演渲染器惰性降级
    if (UNIVERSAL_DP_MODEL_IDS.has(modelId)) {
      if (!this.universalDpRenderer) {
        try {
          const { UniversalDpDeductionRenderer } = await import('./universal-dp-deduction-renderer');
          this.universalDpRenderer = new UniversalDpDeductionRenderer();
        } catch (err) {
          console.warn('[DeductionRendererRegistry] 加载通用 DP 推演渲染器失败:', err);
        }
      }
      if (this.universalDpRenderer && this.universalDpRenderer.canHandle(modelId)) {
        return this.universalDpRenderer;
      }
    }

    return null;
  }

  /**
   * 分发并执行推演树异步渲染
   */
  public static async dispatch(options: StaticDeductionRenderOptions): Promise<string> {
    const handler = await this.resolveRenderer(options.modelId);
    if (!handler) {
      return `<div class="p-4 text-amber-500 font-mono text-sm">暂未找到算法 [${options.modelId}] 的全景推演树配置</div>`;
    }
    return handler.render(options);
  }

  /**
   * 从动态模块导出中探测并实例化渲染器 (反射与鸭子类型适配)
   */
  private static instantiateRenderer(mod: any): IDeductionTreeRenderer | null {
    if (!mod || typeof mod !== 'object') return null;

    for (const key of Object.keys(mod)) {
      const ExportedItem = mod[key];
      if (typeof ExportedItem === 'function') {
        try {
          const instance = new ExportedItem();
          if (instance && typeof instance.render === 'function' && typeof instance.canHandle === 'function') {
            return instance as IDeductionTreeRenderer;
          }
        } catch {
          // 忽略非构造函数导出
        }
      }
    }
    return null;
  }
}
