/**
 * 算法模型仓储深度模块 (AlgorithmModelRepository Deep Module)
 * 遵循深度模块原则：通过极其紧凑简洁的外部接口，隐藏所有底层 YAML 解析、
 * 静态模型索引、语法高亮编译、变体锚点索引与不可变阶段缓存。
 */

import type { IYamlAlgorithmModel } from './interfaces';
import { YamlModelLoader, type CompiledStageViewConfig } from './yaml-model-loader';
import uniquePathsModel from './models/unique-paths.yaml';
import uniquePathsIiModel from './models/unique-paths-ii.yaml';
import minimumPathSumModel from './models/minimum-path-sum.yaml';
import fibonacciModel from './models/fibonacci.yaml';
import climbStairsModel from './models/climb-stairs.yaml';
import knapsack01Model from './models/knapsack-01.yaml';
import distinctSubsequencesModel from './models/distinct-subsequences.yaml';
import interleavingStringModel from './models/interleaving-string.yaml';
import minDeleteToBeSubstringModel from './models/min-delete-to-be-substring.yaml';
import deleteOperationForTwoStringsModel from './models/delete-operation-for-two-strings.yaml';
import editDistanceModel from './models/edit-distance.yaml';
import palindromicSubstringsModel from './models/palindromic-substrings.yaml';
import longestPalindromicSubsequenceModel from './models/longest-palindromic-subsequence.yaml';
import longestCommonSubsequenceModel from './models/longest-common-subsequence.yaml';
import partitionEqualSubsetSumModel from './models/partition-equal-subset-sum.yaml';
import houseRobberModel from './models/house-robber.yaml';
import houseRobber2Model from './models/house-robber-ii.yaml';
import houseRobber3Model from './models/house-robber-iii.yaml';
import stock1Model from './models/best-time-to-buy-and-sell-stock.yaml';
import stock2Model from './models/best-time-to-buy-and-sell-stock-ii.yaml';
import stock3Model from './models/best-time-to-buy-and-sell-stock-iii.yaml';
import decodeWaysModel from './models/decode-ways.yaml';
import minCostClimbingStairsModel from './models/min-cost-climbing-stairs.yaml';
import completeKnapsackModel from './models/complete-knapsack.yaml';
import integerBreakModel from './models/integer-break.yaml';
import perfectSquaresModel from './models/perfect-squares.yaml';
import coinChangeModel from './models/coin-change.yaml';
import wordBreakModel from './models/word-break.yaml';
import coinChange2Model from './models/coin-change-ii.yaml';
import lastStoneWeightIIModel from './models/last-stone-weight-ii.yaml';
import onesAndZeroesModel from './models/ones-and-zeroes.yaml';
import multipleKnapsackModel from './models/multiple-knapsack.yaml';
import profitableSchemesModel from './models/profitable-schemes.yaml';
import jumpGameIIModel from './models/jump-game-ii.yaml';
import canJumpModel from './models/can-jump.yaml';
import minTapsModel from './models/minimum-number-of-taps-to-water-a-garden.yaml';
import minArrowsModel from './models/min-arrows.yaml';
import nonOverlappingModel from './models/non-overlapping.yaml';
import mergeIntervalsModel from './models/merge-intervals.yaml';
import partitionLabelsModel from './models/partition-labels.yaml';
import candyModel from './models/candy.yaml';
import assignCookiesModel from './models/assign-cookies.yaml';
import lemonadeModel from './models/lemonade.yaml';
import monotoneDigitsModel from './models/monotone-digits.yaml';
import maximizeSumKModel from './models/maximize-sum-k.yaml';
import gasStationModel from './models/gas-station.yaml';
import wiggleSubsequenceModel from './models/wiggle-subsequence.yaml';
import reconstructQueueModel from './models/reconstruct-queue.yaml';
import maxSubarrayModel from './models/max-subarray.yaml';
import taskSchedulerModel from './models/task-scheduler.yaml';
import treeCamerasModel from './models/tree-cameras.yaml';
import dpTheoryModel from './models/dp-theory.yaml';
import dpWeekSummary1Model from './models/dp-week-summary-1.yaml';
import dpWeekSummary2Model from './models/dp-week-summary-2.yaml';
import dpWeekSummary3Model from './models/dp-week-summary-3.yaml';
import dpWeekSummary4Model from './models/dp-week-summary-4.yaml';
import dpWeekSummary5Model from './models/dp-week-summary-5.yaml';
import dpWeekSummary6Model from './models/dp-week-summary-6.yaml';
import dpWeekSummary7Model from './models/dp-week-summary-7.yaml';
import dpFinalSummaryModel from './models/dp-final-summary.yaml';
import knapsack01Theory1Model from './models/knapsack-01-theory-1.yaml';
import knapsack01Theory2Model from './models/knapsack-01-theory-2.yaml';
import completeKnapsackTheoryModel from './models/complete-knapsack-theory.yaml';
import multipleKnapsackTheoryModel from './models/multiple-knapsack-theory.yaml';
import knapsackSummaryModel from './models/knapsack-summary.yaml';
import stockSummaryModel from './models/stock-summary.yaml';
import editDistanceSummaryModel from './models/edit-distance-summary.yaml';
import treeDpTheoryModel from './models/tree-dp-theory.yaml';
import targetSumStandardModel from './models/target-sum-standard.yaml';
import { DpStepEngine } from './dp-engine/dp-step-engine';
import {
  ModelSynthesisEngine,
  bridgeSemanticLinesToAnchorMap,
  resolveSemanticLine,
} from './model-synthesis-engine';

export { bridgeSemanticLinesToAnchorMap, resolveSemanticLine };

export class AlgorithmModelRepository {
  private static registry = new Map<string, IYamlAlgorithmModel>([
    ['unique-paths', uniquePathsModel as IYamlAlgorithmModel],
    ['unique-paths-ii', uniquePathsIiModel as IYamlAlgorithmModel],
    ['min-path-sum', minimumPathSumModel as IYamlAlgorithmModel],
    ['fibonacci', fibonacciModel as IYamlAlgorithmModel],
    ['climb-stairs', climbStairsModel as IYamlAlgorithmModel],
    ['min-cost-climbing-stairs', minCostClimbingStairsModel as IYamlAlgorithmModel],
    ['min-cost', minCostClimbingStairsModel as IYamlAlgorithmModel],
    ['decode-ways', decodeWaysModel as IYamlAlgorithmModel],
    ['01-knapsack', knapsack01Model as IYamlAlgorithmModel],
    ['knapsack-01', knapsack01Model as IYamlAlgorithmModel],
    ['knapsack-01-2d', {
      ...(knapsack01Model as IYamlAlgorithmModel),
      id: 'knapsack-01-2d',
      name: '0-1背包问题（二维）',
      defaultStage: 'stage-3'
    }],
    ['knapsack-01-1d', {
      ...(knapsack01Model as IYamlAlgorithmModel),
      id: 'knapsack-01-1d',
      name: '0-1背包问题（一维）',
      defaultStage: 'stage-4'
    }],
    ['complete-knapsack', completeKnapsackModel as IYamlAlgorithmModel],
    ['unbounded-knapsack', completeKnapsackModel as IYamlAlgorithmModel],
    ['distinct-subsequences', distinctSubsequencesModel as IYamlAlgorithmModel],
    ['interleaving-string', interleavingStringModel as IYamlAlgorithmModel],
    ['min-delete-to-be-substring', minDeleteToBeSubstringModel as IYamlAlgorithmModel],
    ['delete-operation-for-two-strings', deleteOperationForTwoStringsModel as IYamlAlgorithmModel],
    ['delete-distance', deleteOperationForTwoStringsModel as IYamlAlgorithmModel],
    ['edit-distance', editDistanceModel as IYamlAlgorithmModel],
    ['palindromic-substrings', palindromicSubstringsModel as IYamlAlgorithmModel],
    ['longest-palindromic-subsequence', longestPalindromicSubsequenceModel as IYamlAlgorithmModel],
    ['longest-common-subsequence', longestCommonSubsequenceModel as IYamlAlgorithmModel],
    ['partition-equal-subset-sum', partitionEqualSubsetSumModel as IYamlAlgorithmModel],
    ['partition-subset', partitionEqualSubsetSumModel as IYamlAlgorithmModel],
    ['house-robber', houseRobberModel as IYamlAlgorithmModel],
    ['house-robber-ii', houseRobber2Model as IYamlAlgorithmModel],
    ['house-robber-iii', houseRobber3Model as IYamlAlgorithmModel],
    ['best-time-to-buy-and-sell-stock', stock1Model as IYamlAlgorithmModel],
    ['best-time-to-buy-and-sell-stock-ii', stock2Model as IYamlAlgorithmModel],
    ['best-time-stock', stock2Model as IYamlAlgorithmModel],
    ['best-time-to-buy-and-sell-stock-iii', stock3Model as IYamlAlgorithmModel],
    ['integer-break', integerBreakModel as IYamlAlgorithmModel],
    ['perfect-squares', perfectSquaresModel as IYamlAlgorithmModel],
    ['coin-change', coinChangeModel as IYamlAlgorithmModel],
    ['word-break', wordBreakModel as IYamlAlgorithmModel],
    ['coin-change-ii', coinChange2Model as IYamlAlgorithmModel],
    ['last-stone-weight-ii', lastStoneWeightIIModel as IYamlAlgorithmModel],
    ['last-stone-weight-2', lastStoneWeightIIModel as IYamlAlgorithmModel],
    ['ones-and-zeroes', onesAndZeroesModel as IYamlAlgorithmModel],
    ['ones-and-zeros', onesAndZeroesModel as IYamlAlgorithmModel],
    ['multiple-knapsack', multipleKnapsackModel as IYamlAlgorithmModel],
    ['profitable-schemes', profitableSchemesModel as IYamlAlgorithmModel],
    ['jump-game-ii', jumpGameIIModel as IYamlAlgorithmModel],
    ['jump-game', jumpGameIIModel as IYamlAlgorithmModel],
    ['can-jump', canJumpModel as IYamlAlgorithmModel],
    ['minimum-number-of-taps-to-water-a-garden', minTapsModel as IYamlAlgorithmModel],
    ['min-taps', minTapsModel as IYamlAlgorithmModel],
    ['min-arrows', minArrowsModel as IYamlAlgorithmModel],
    ['non-overlapping', nonOverlappingModel as IYamlAlgorithmModel],
    ['merge-intervals', mergeIntervalsModel as IYamlAlgorithmModel],
    ['partition-labels', partitionLabelsModel as IYamlAlgorithmModel],
    ['candy', candyModel as IYamlAlgorithmModel],
    ['assign-cookies', assignCookiesModel as IYamlAlgorithmModel],
    ['lemonade', lemonadeModel as IYamlAlgorithmModel],
    ['monotone-digits', monotoneDigitsModel as IYamlAlgorithmModel],
    ['maximize-sum-k', maximizeSumKModel as IYamlAlgorithmModel],
    ['gas-station', gasStationModel as IYamlAlgorithmModel],
    ['wiggle-subsequence', wiggleSubsequenceModel as IYamlAlgorithmModel],
    ['reconstruct-queue', reconstructQueueModel as IYamlAlgorithmModel],
    ['max-subarray', maxSubarrayModel as IYamlAlgorithmModel],
    ['task-scheduler', taskSchedulerModel as IYamlAlgorithmModel],
    ['tree-cameras', treeCamerasModel as IYamlAlgorithmModel],
    // 理论/总结类模型
    ['dp-theory', dpTheoryModel as IYamlAlgorithmModel],
    ['dp-week-summary-1', dpWeekSummary1Model as IYamlAlgorithmModel],
    ['dp-week-summary-2', dpWeekSummary2Model as IYamlAlgorithmModel],
    ['dp-week-summary-3', dpWeekSummary3Model as IYamlAlgorithmModel],
    ['dp-week-summary-4', dpWeekSummary4Model as IYamlAlgorithmModel],
    ['dp-week-summary-5', dpWeekSummary5Model as IYamlAlgorithmModel],
    ['dp-week-summary-6', dpWeekSummary6Model as IYamlAlgorithmModel],
    ['dp-week-summary-7', dpWeekSummary7Model as IYamlAlgorithmModel],
    ['dp-final-summary', dpFinalSummaryModel as IYamlAlgorithmModel],
    ['knapsack-01-theory-1', knapsack01Theory1Model as IYamlAlgorithmModel],
    ['knapsack-01-theory-2', knapsack01Theory2Model as IYamlAlgorithmModel],
    ['complete-knapsack-theory', completeKnapsackTheoryModel as IYamlAlgorithmModel],
    ['multiple-knapsack-theory', multipleKnapsackTheoryModel as IYamlAlgorithmModel],
    ['knapsack-summary', knapsackSummaryModel as IYamlAlgorithmModel],
    ['stock-summary', stockSummaryModel as IYamlAlgorithmModel],
    ['edit-distance-summary', editDistanceSummaryModel as IYamlAlgorithmModel],
    ['tree-dp-theory', treeDpTheoryModel as IYamlAlgorithmModel],
    ['target-sum-standard', targetSumStandardModel as IYamlAlgorithmModel],
  ]);

  // 不可变阶段编译缓存表
  private static stageCache = new Map<string, CompiledStageViewConfig>();

  /**
   * 从 DpStepEngine 的声明式 Spec 动态合成标准 5A 级 IYamlAlgorithmModel
   */
  private static synthesizeFromSpec(id: string): IYamlAlgorithmModel | null {
    return ModelSynthesisEngine.synthesizeFromSpec(id);
  }

  /**
   * 注册算法模型
   */
  public static register(id: string, model: IYamlAlgorithmModel): void {
    if (!id || !model) {
      throw new Error('[AlgorithmModelRepository] 注册参数无效');
    }
    this.registry.set(id, model);
    // 清除该模型相关的编译缓存
    for (const key of this.stageCache.keys()) {
      if (key.startsWith(`${id}:`)) {
        this.stageCache.delete(key);
      }
    }
  }

  /**
   * 获取算法模型原始对象
   */
  public static getModel(id: string): IYamlAlgorithmModel {
    let model = this.registry.get(id);
    if (!model) {
      const canonical = DpStepEngine.getCanonicalId(id);
      if (canonical && this.registry.has(canonical)) {
        model = this.registry.get(canonical)!;
        this.registry.set(id, model);
        return model;
      }
      const synthesized = this.synthesizeFromSpec(id);
      if (synthesized) {
        this.register(id, synthesized);
        return synthesized;
      }
      throw new Error(`[AlgorithmModelRepository] 未找到算法模型: ${id}`);
    }
    return model;
  }

  /**
   * 检查模型是否存在
   */
  public static hasModel(id: string): boolean {
    if (this.registry.has(id)) return true;
    const canonical = DpStepEngine.getCanonicalId(id);
    if (canonical && this.registry.has(canonical)) return true;
    return DpStepEngine.get(id) !== undefined;
  }

  /**
   * 获取已注册的所有算法模型 ID 列表
   */
  public static getAllIds(): string[] {
    return Array.from(this.registry.keys());
  }

  /**
   * 获取指定阶段与方向的已编译视图与代码高亮配置 (带 O(1) 瞬时缓存加速)
   */
  public static getCompiledStage(
    id: string,
    stageKey: string,
    direction: 'forward' | 'reverse' = 'forward'
  ): CompiledStageViewConfig {
    const cacheKey = `${id}:${stageKey}:${direction}`;
    const cached = this.stageCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const model = this.getModel(id);
    const compiled = YamlModelLoader.getCompiledStageConfig(model, stageKey, direction);

    // 兜底桥接：若某阶段或其变体的 anchorMap 为空，自动通过 spec.semanticLines 注入
    const spec = DpStepEngine.get(id);
    if (spec && spec.semanticLines) {
      const fallbackAnchorMap = bridgeSemanticLinesToAnchorMap(spec.semanticLines, 'java');
      if (!compiled.anchorMap || Object.keys(compiled.anchorMap).length === 0) {
        compiled.anchorMap = { ...fallbackAnchorMap, ...(compiled.anchorMap || {}) };
      }
      if (compiled.variants) {
        for (const variant of Object.values(compiled.variants)) {
          if (!variant.anchorMap || Object.keys(variant.anchorMap).length === 0) {
            variant.anchorMap = { ...fallbackAnchorMap, ...(variant.anchorMap || {}) };
          }
        }
      }
    }

    this.stageCache.set(cacheKey, compiled);
    return compiled;
  }

  /**
   * 预热编译所有已注册模型的全部阶段，实现零延迟运行时切换
   */
  public static warmup(targetModelId?: string): void {
    const ids = targetModelId ? [targetModelId] : this.getAllIds();
    for (const id of ids) {
      const model = this.registry.get(id);
      if (!model || !model.stages) continue;
      const stageKeys = Object.keys(model.stages);
      for (const stageKey of stageKeys) {
        this.getCompiledStage(id, stageKey, 'forward');
        this.getCompiledStage(id, stageKey, 'reverse');
      }
    }
  }

  /**
   * 清除编译缓存
   */
  public static clearCache(): void {
    this.stageCache.clear();
  }

  /**
   * 语法高亮行工具方法
   */
  public static highlightSyntax(codeLine: string): string {
    return YamlModelLoader.highlightSyntax(codeLine);
  }
}
