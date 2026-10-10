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
import { MstKruskalDeductionRenderer } from './mst-kruskal-deduction-renderer';
import { MstPrimDeductionRenderer } from './mst-prim-deduction-renderer';
import { TopoDPDeductionRenderer } from './topo-dp-deduction-renderer';
import { SecondMstDeductionRenderer } from './second-mst-deduction-renderer';
import { NumberOfProvincesDeductionRenderer } from './number-of-provinces-deduction-renderer';
import { BFS01DeductionRenderer } from './bfs-01-deduction-renderer';
import { BiBFSDeductionRenderer } from './bi-bfs-deduction-renderer';
import { ForwardStarDeductionRenderer } from './forward-star-deduction-renderer';
import { MalwareSpreadIIDeductionRenderer } from './malware-spread-ii-deduction-renderer';
import { TwoSATDeductionRenderer } from './two-sat-deduction-renderer';
import { DinicMaxFlowDeductionRenderer } from './dinic-max-flow-deduction-renderer';
import { AlienDictDeductionRenderer } from './alien-dict-deduction-renderer';
import { TarjanSCCDagDeductionRenderer } from './tarjan-scc-dag-deduction-renderer';
import { TarjanBridgeDeductionRenderer } from './tarjan-bridge-deduction-renderer';
import { HungarianMatchingDeductionRenderer } from './hungarian-matching-deduction-renderer';
import { DiffConstraintsDeductionRenderer } from './diff-constraints-deduction-renderer';
import { BipartiteGameDeductionRenderer } from './bipartite-game-deduction-renderer';
import { MinCostMaxFlowDeductionRenderer } from './min-cost-max-flow-deduction-renderer';
import { KonigMinVertexCoverDeductionRenderer } from './konig-min-vertex-cover-deduction-renderer';
import { KMAlgorithmDeductionRenderer } from './km-algorithm-deduction-renderer';
import { MinPathCoverDeductionRenderer } from './min-path-cover-deduction-renderer';
import { MaxWeightClosureDeductionRenderer } from './max-weight-closure-deduction-renderer';
import { BoundedFlowDeductionRenderer } from './bounded-flow-deduction-renderer';
import { DominatorTreeDeductionRenderer } from './dominator-tree-deduction-renderer';
import { EulerianCircuitDeductionRenderer } from './eulerian-circuit-deduction-renderer';
import { BlockCutTreeDeductionRenderer } from './block-cut-tree-deduction-renderer';
import { KruskalReconstructionTreeDeductionRenderer } from './kruskal-reconstruction-tree-deduction-renderer';
import { HeavyLightDecompositionDeductionRenderer } from './heavy-light-decomposition-deduction-renderer';
import { VirtualTreeDeductionRenderer } from './virtual-tree-deduction-renderer';
import { DSUOnTreeDeductionRenderer } from './dsu-on-tree-deduction-renderer';
import { LCABinaryLiftingDeductionRenderer } from './lca-binary-lifting-deduction-renderer';
import { PruferSequenceDeductionRenderer } from './prufer-sequence-deduction-renderer';
import { TreeDifferenceDeductionRenderer } from './tree-difference-deduction-renderer';
import { TreeKnapsackDPDeductionRenderer } from './tree-knapsack-dp-deduction-renderer';
import { CentroidTreeDeductionRenderer } from './centroid-tree-deduction-renderer';
import { ChordalGraphDeductionRenderer } from './chordal-graph-deduction-renderer';
import { PseudotreeDPDeductionRenderer } from './pseudotree-dp-deduction-renderer';
import { MinMeanCycleDeductionRenderer } from './min-mean-cycle-deduction-renderer';
import { TreeCentroidDecompositionDeductionRenderer } from './tree-centroid-decomposition-deduction-renderer';
import { PlanarGraphDualDeductionRenderer } from './planar-graph-dual-deduction-renderer';
import { StableMarriageDeductionRenderer } from './stable-marriage-deduction-renderer';
import { CycleCountingDeductionRenderer } from './cycle-counting-deduction-renderer';
import { GoodPathsDeductionRenderer } from './good-paths-deduction-renderer';
import { PeopleSecretDeductionRenderer } from './people-secret-deduction-renderer';
import { CouplesHoldingHandsDeductionRenderer } from './couples-holding-hands-deduction-renderer';
import { CourseScheduleIVDeductionRenderer } from './course-schedule-iv-deduction-renderer';
import { StringMigrationDeductionRenderer } from './string-migration-deduction-renderer';
import { StronglyConnectedDeductionRenderer } from './strongly-connected-deduction-renderer';
import { FindRouteDeductionRenderer } from './find-route-deduction-renderer';
import { ReachablePathsDeductionRenderer } from './reachable-paths-deduction-renderer';
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
    new MstKruskalDeductionRenderer(),
    new MstPrimDeductionRenderer(),
    new TopoDPDeductionRenderer(),
    new SecondMstDeductionRenderer(),
    new NumberOfProvincesDeductionRenderer(),
    new BFS01DeductionRenderer(),
    new BiBFSDeductionRenderer(),
    new ForwardStarDeductionRenderer(),
    new MalwareSpreadIIDeductionRenderer(),
    new TwoSATDeductionRenderer(),
    new DinicMaxFlowDeductionRenderer(),
    new AlienDictDeductionRenderer(),
    new TarjanSCCDagDeductionRenderer(),
    new TarjanBridgeDeductionRenderer(),
    new HungarianMatchingDeductionRenderer(),
    new DiffConstraintsDeductionRenderer(),
    new BipartiteGameDeductionRenderer(),
    new MinCostMaxFlowDeductionRenderer(),
    new KonigMinVertexCoverDeductionRenderer(),
    new KMAlgorithmDeductionRenderer(),
    new MinPathCoverDeductionRenderer(),
    new MaxWeightClosureDeductionRenderer(),
    new BoundedFlowDeductionRenderer(),
    new DominatorTreeDeductionRenderer(),
    new EulerianCircuitDeductionRenderer(),
    new BlockCutTreeDeductionRenderer(),
    new KruskalReconstructionTreeDeductionRenderer(),
    new HeavyLightDecompositionDeductionRenderer(),
    new VirtualTreeDeductionRenderer(),
    new DSUOnTreeDeductionRenderer(),
    new LCABinaryLiftingDeductionRenderer(),
    new PruferSequenceDeductionRenderer(),
    new TreeDifferenceDeductionRenderer(),
    new TreeKnapsackDPDeductionRenderer(),
    new CentroidTreeDeductionRenderer(),
    new ChordalGraphDeductionRenderer(),
    new PseudotreeDPDeductionRenderer(),
    new MinMeanCycleDeductionRenderer(),
    new TreeCentroidDecompositionDeductionRenderer(),
    new PlanarGraphDualDeductionRenderer(),
    new StableMarriageDeductionRenderer(),
    new CycleCountingDeductionRenderer(),
    new GoodPathsDeductionRenderer(),
    new PeopleSecretDeductionRenderer(),
    new CouplesHoldingHandsDeductionRenderer(),
    new CourseScheduleIVDeductionRenderer(),
    new StringMigrationDeductionRenderer(),
    new StronglyConnectedDeductionRenderer(),
    new FindRouteDeductionRenderer(),
    new ReachablePathsDeductionRenderer(),
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
