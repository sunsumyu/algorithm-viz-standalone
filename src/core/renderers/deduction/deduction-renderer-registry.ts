/**
 * 全景推演树渲染策略分发中心 (DeductionRendererRegistry)
 * 采用策略模式与单一职责原则，负责匹配和调度各算法对应的推演树渲染器
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { UniquePathsDeductionRenderer } from './unique-paths-deduction-renderer';
import { LcsDeductionRenderer } from './lcs-deduction-renderer';
import { EditDistanceDeductionRenderer } from './edit-distance-deduction-renderer';
import { DistinctSubsequencesDeductionRenderer } from './distinct-subsequences-deduction-renderer';
import { UniversalDpDeductionRenderer } from './universal-dp-deduction-renderer';
import { AlgorithmModelRepository } from '../../model-repository';
import { AlgorithmStrategyRegistry } from '../../strategies/algorithm-strategy-registry';

export class DeductionRendererRegistry {
  private static readonly dedicatedRenderers: IDeductionTreeRenderer[] = [
    new UniquePathsDeductionRenderer(),
    new LcsDeductionRenderer(),
    new EditDistanceDeductionRenderer(),
    new DistinctSubsequencesDeductionRenderer(),
  ];

  private static readonly fallbackRenderer: IDeductionTreeRenderer = new UniversalDpDeductionRenderer();

  /**
   * 判定任意算法是否支持全景推演树
   */
  public static isSupported(modelId: string): boolean {
    if (!modelId) return false;
    return (
      this.dedicatedRenderers.some(r => r.canHandle(modelId)) ||
      AlgorithmModelRepository.hasModel(modelId) ||
      AlgorithmStrategyRegistry.has(modelId)
    );
  }

  /**
   * 分发并执行推演树渲染
   */
  public static dispatch(options: StaticDeductionRenderOptions): string {
    const handler = this.dedicatedRenderers.find(r => r.canHandle(options.modelId)) || this.fallbackRenderer;
    return handler.render(options);
  }
}
