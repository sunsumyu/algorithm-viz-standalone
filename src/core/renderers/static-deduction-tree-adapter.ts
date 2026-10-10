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
<div class="p-6 bg-slate-900/90 rounded-2xl border border-slate-700/60 shadow-2xl backdrop-blur-md animate-pulse select-none text-slate-300">
  <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
    <div class="space-y-2">
      <div class="h-6 w-48 bg-slate-700/60 rounded-md"></div>
      <div class="h-4 w-72 bg-slate-800/80 rounded-md"></div>
    </div>
    <div class="h-8 w-24 bg-indigo-500/20 border border-indigo-500/40 rounded-full"></div>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div class="h-20 bg-slate-800/50 rounded-xl border border-slate-700/40"></div>
    <div class="h-20 bg-slate-800/50 rounded-xl border border-slate-700/40"></div>
    <div class="h-20 bg-slate-800/50 rounded-xl border border-slate-700/40"></div>
  </div>
  <div class="h-64 bg-slate-800/40 rounded-xl border border-slate-700/30 flex items-center justify-center">
    <div class="flex items-center space-x-3 text-slate-400 font-mono text-sm">
      <svg class="animate-spin h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
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
