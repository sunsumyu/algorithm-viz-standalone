/**
 * 经典动态规划算法 · 全景静态推演展板适配器门面 (StaticDeductionTreeAdapter Facade)
 * 遵循 Matt Pocock 深模块哲学与设计模式：
 * 1. 门面模式 (Facade Pattern)：统一对外暴露 isSupported、getSkeletonHtml 与 renderDeduction，隐藏按需加载与策略解析细节。
 * 2. 虚拟代理与享元复用：按需异步调度专用/通用推演渲染器，单例享元缓存保证后续毫秒级响应。
 * 3. 极简身材红线：核心门面保持 < 60 行纯薄抽象。
 */

import { StaticDeductionRenderOptions } from './deduction/types';
import { DeductionRendererRegistry } from './deduction/deduction-renderer-registry';

export { type StaticDeductionRenderOptions };

export class StaticDeductionTreeAdapter {
  /**
   * 手工定制高保真推演树模型列表 (向后兼容契约)
   */
  public static readonly DEDICATED_MODELS = [
    'distinct-subsequences',
    'unique-paths',
    'longest-common-subsequence',
    'edit-distance',
  ] as const;

  /**
   * 注册推演树渲染策略
   */
  public static registerRenderer(renderer: any): void {
    DeductionRendererRegistry.registerRenderer(renderer);
  }

  /**
   * 纯同步 O(1) 判定任意算法是否支持全景推演树
   */
  public static isSupported(modelId: string): boolean {
    return DeductionRendererRegistry.isSupported(modelId);
  }

  /**
   * 渲染极简优雅的流光骨架屏占位
   */
  public static getSkeletonHtml(modelId?: string): string {
    return `
<div class="deduction-skeleton-root animate-pulse" style="padding: 24px; background: rgba(15, 23, 42, 0.95); border-radius: 16px; border: 1px solid rgba(51, 65, 85, 0.7); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); user-select: none; color: #cbd5e1; font-family: system-ui, -apple-system, sans-serif;">
  <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 24px;">
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="height: 24px; width: 192px; background: rgba(51, 65, 85, 0.6); border-radius: 6px;"></div>
      <div style="height: 16px; width: 288px; background: rgba(30, 41, 59, 0.8); border-radius: 6px;"></div>
    </div>
    <div style="height: 32px; width: 96px; background: rgba(99, 102, 241, 0.2); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 9999px;"></div>
  </div>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
    <div style="height: 80px; background: rgba(30, 41, 59, 0.5); border-radius: 12px; border: 1px solid rgba(51, 65, 85, 0.4);"></div>
    <div style="height: 80px; background: rgba(30, 41, 59, 0.5); border-radius: 12px; border: 1px solid rgba(51, 65, 85, 0.4);"></div>
    <div style="height: 80px; background: rgba(30, 41, 59, 0.5); border-radius: 12px; border: 1px solid rgba(51, 65, 85, 0.4);"></div>
  </div>
  <div style="height: 256px; background: rgba(30, 41, 59, 0.4); border-radius: 12px; border: 1px solid rgba(51, 65, 85, 0.3); display: flex; align-items: center; justify-content: center;">
    <div style="display: flex; align-items: center; gap: 12px; color: #94a3b8; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 14px;">
      <svg class="animate-spin" style="width: 20px; height: 20px; color: #818cf8;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      <span>正在构建全景推演树沙盘${modelId ? ` [${modelId}]` : ''}...</span>
    </div>
  </div>
</div>
    `.trim();
  }

  /**
   * 异步渲染推演展板至指定 DOM 容器 (带自动骨架屏占位与享元缓存)
   */
  public static async renderDeduction(
    container: HTMLElement,
    options: StaticDeductionRenderOptions
  ): Promise<void> {
    if (!container) return;
    if (!container.innerHTML || container.innerHTML.trim() === '') {
      container.innerHTML = this.getSkeletonHtml(options.modelId);
    }
    const html = await DeductionRendererRegistry.dispatch(options);
    container.innerHTML = html;
  }
}
