import type { IVisualRenderer } from './visual-renderer';
import { ThreeGridVisualAdapter } from './three-grid-visual-adapter';
import { DOMGridVisualAdapter } from './dom-grid-visual-adapter';

export type RendererKind = '3d-voxel' | '2d-grid' | string;

/**
 * 视觉渲染器工厂深度模块 (VisualRendererFactory Deep Module) - 工厂方法模式 (Factory Pattern)
 * 遵循 GoF 工厂模式与深模块原则：
 * 统一管理 2D DOM 渲染器、3D WebGL 体素渲染器与自定义扩展渲染器的实例化与生命周期缓存。
 */
export class VisualRendererFactory {
  private static renderers: Map<string, IVisualRenderer> = new Map();

  /**
   * 创建或获取已存在的渲染器单例/实例
   */
  public static getRenderer(kind: RendererKind): IVisualRenderer {
    if (this.renderers.has(kind)) {
      return this.renderers.get(kind)!;
    }

    let renderer: IVisualRenderer;
    switch (kind) {
      case '3d-voxel':
        renderer = ThreeGridVisualAdapter.getInstance();
        break;
      case '2d-grid':
        renderer = new DOMGridVisualAdapter();
        break;
      default:
        renderer = new DOMGridVisualAdapter();
        break;
    }

    this.renderers.set(kind, renderer);
    return renderer;
  }

  /**
   * 注册自定义第三方渲染器适配器
   */
  public static registerCustomRenderer(kind: string, renderer: IVisualRenderer): void {
    this.renderers.set(kind, renderer);
  }

  /**
   * 清理与释放所有渲染器缓存
   */
  public static clear(): void {
    this.renderers.forEach((renderer) => {
      if (typeof renderer.dispose === 'function') {
        renderer.dispose();
      }
    });
    this.renderers.clear();
  }
}
