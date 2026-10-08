/**
 * 经典动态规划算法 · 全景静态推演展板适配器门面 (StaticDeductionTreeAdapter Facade)
 * 遵循 Matt Pocock 深模块哲学与设计模式：
 * 1. 门面模式 (Facade Pattern)：统一对外暴露 isSupported 与 renderDeduction，隐藏底层策略分发细节。
 * 2. 策略模式 (Strategy Pattern)：通过 DeductionRendererRegistry 分发至 Dedicated / Universal 渲染策略。
 * 3. 极简身材红线：核心门面由 928 行巨石精简为 ~50 行纯薄门面。
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
   * 判定任意算法是否支持全景推演树
   */
  public static isSupported(modelId: string): boolean {
    return DeductionRendererRegistry.isSupported(modelId);
  }

  /**
   * 渲染推演展板至指定 DOM 容器
   */
  public static renderDeduction(container: HTMLElement, options: StaticDeductionRenderOptions): void {
    if (!container) return;
    container.innerHTML = DeductionRendererRegistry.dispatch(options);
  }
}
