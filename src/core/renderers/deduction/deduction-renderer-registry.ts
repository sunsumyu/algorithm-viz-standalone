/**
 * 全景推演树渲染策略分发中心 (DeductionRendererRegistry)
 * 采用策略模式与单一职责原则，负责匹配和调度各算法对应的推演树渲染器
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { UniquePathsDeductionRenderer } from './unique-paths-deduction-renderer';
import { LcsDeductionRenderer } from './lcs-deduction-renderer';
import { EditDistanceDeductionRenderer } from './edit-distance-deduction-renderer';
import { DistinctSubsequencesDeductionRenderer } from './distinct-subsequences-deduction-renderer';
import { AStarDeductionRenderer } from './a-star-deduction-renderer';
import { TrappingWaterIIDeductionRenderer } from './trapping-water-ii-deduction-renderer';
import { WaterFlowDeductionRenderer } from './water-flow-deduction-renderer';
import { PathMinEffortDeductionRenderer } from './path-min-effort-deduction-renderer';
import { SwimInRisingWaterDeductionRenderer } from './swim-in-rising-water-deduction-renderer';
import { IslandsDeductionRenderer } from './islands-deduction-renderer';
import { IslandsBfsDeductionRenderer } from './islands-bfs-deduction-renderer';
import { MaxIslandAreaDeductionRenderer } from './max-island-area-deduction-renderer';
import { AsFarFromLandDeductionRenderer } from './as-far-from-land-deduction-renderer';
import { MakeLargestIslandDeductionRenderer } from './make-largest-island-deduction-renderer';
import { MinimumObstaclesDeductionRenderer } from './minimum-obstacles-deduction-renderer';
import { MinimumCostValidPathDeductionRenderer } from './minimum-cost-valid-path-deduction-renderer';
import { CoastlineDeductionRenderer } from './coastline-deduction-renderer';
import { SinkIslandsDeductionRenderer } from './sink-islands-deduction-renderer';
import { TotalIslandAreaDeductionRenderer } from './total-island-area-deduction-renderer';
import { ClosedIslandsDeductionRenderer } from './closed-islands-deduction-renderer';
import { SubIslandsDeductionRenderer } from './sub-islands-deduction-renderer';
import { DistinctIslandsDeductionRenderer } from './distinct-islands-deduction-renderer';
import { DijkstraBasicDeductionRenderer } from './dijkstra-basic-deduction-renderer';
import { DijkstraHeapDeductionRenderer } from './dijkstra-heap-deduction-renderer';
import { DijkstraIndexHeapDeductionRenderer } from './dijkstra-index-heap-deduction-renderer';
import { BellmanFordDeductionRenderer } from './bellman-ford-deduction-renderer';
import { SpfaDeductionRenderer } from './spfa-deduction-renderer';
import { NegativeCycleDeductionRenderer } from './negative-cycle-deduction-renderer';
import { FloydDeductionRenderer } from './floyd-deduction-renderer';
import { NetworkDelayDeductionRenderer } from './network-delay-deduction-renderer';
import { LayeredDijkstraDeductionRenderer } from './layered-dijkstra-deduction-renderer';
import { EVChargeDeductionRenderer } from './ev-charge-deduction-renderer';
import { KShortestPathDeductionRenderer } from './k-shortest-path-deduction-renderer';
import { LimitedShortestPathDeductionRenderer } from './limited-shortest-path-deduction-renderer';
import { RedundantEdgeDeductionRenderer } from './redundant-edge-deduction-renderer';
import { RedundantEdgeIIDeductionRenderer } from './redundant-edge-ii-deduction-renderer';
import { TopologicalSortDeductionRenderer } from './topological-sort-deduction-renderer';
import { UniversalDpDeductionRenderer } from './universal-dp-deduction-renderer';
import { AlgorithmModelRepository } from '../../model-repository';
import { AlgorithmStrategyRegistry } from '../../strategies/algorithm-strategy-registry';

export class DeductionRendererRegistry {
  private static readonly dedicatedRenderers: IDeductionTreeRenderer[] = [
    new UniquePathsDeductionRenderer(),
    new LcsDeductionRenderer(),
    new EditDistanceDeductionRenderer(),
    new DistinctSubsequencesDeductionRenderer(),
    new AStarDeductionRenderer(),
    new TrappingWaterIIDeductionRenderer(),
    new WaterFlowDeductionRenderer(),
    new PathMinEffortDeductionRenderer(),
    new SwimInRisingWaterDeductionRenderer(),
    new IslandsDeductionRenderer(),
    new IslandsBfsDeductionRenderer(),
    new MaxIslandAreaDeductionRenderer(),
    new AsFarFromLandDeductionRenderer(),
    new MakeLargestIslandDeductionRenderer(),
    new MinimumObstaclesDeductionRenderer(),
    new MinimumCostValidPathDeductionRenderer(),
    new CoastlineDeductionRenderer(),
    new SinkIslandsDeductionRenderer(),
    new TotalIslandAreaDeductionRenderer(),
    new ClosedIslandsDeductionRenderer(),
    new SubIslandsDeductionRenderer(),
    new DistinctIslandsDeductionRenderer(),
    new DijkstraBasicDeductionRenderer(),
    new DijkstraHeapDeductionRenderer(),
    new DijkstraIndexHeapDeductionRenderer(),
    new BellmanFordDeductionRenderer(),
    new SpfaDeductionRenderer(),
    new NegativeCycleDeductionRenderer(),
    new FloydDeductionRenderer(),
    new NetworkDelayDeductionRenderer(),
    new LayeredDijkstraDeductionRenderer(),
    new EVChargeDeductionRenderer(),
    new KShortestPathDeductionRenderer(),
    new LimitedShortestPathDeductionRenderer(),
    new RedundantEdgeDeductionRenderer(),
    new RedundantEdgeIIDeductionRenderer(),
    new TopologicalSortDeductionRenderer(),
  ];

  private static readonly fallbackRenderer: IDeductionTreeRenderer = new UniversalDpDeductionRenderer();

  /**
   * 动态注册或扩充推演树渲染策略
   */
  public static registerRenderer(renderer: IDeductionTreeRenderer): void {
    if (!this.dedicatedRenderers.some(r => r.id === renderer.id)) {
      this.dedicatedRenderers.unshift(renderer);
    }
  }

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
