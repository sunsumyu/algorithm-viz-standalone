/**
 * 算法模型仓储深度模块 (AlgorithmModelRepository Deep Module)
 * 遵循深度模块原则：通过极其紧凑简洁的外部接口，隐藏所有底层 YAML 解析、
 * 静态模型索引、语法高亮编译、变体锚点索引与不可变阶段缓存。
 */

import type { IYamlAlgorithmModel } from './interfaces';
import { YamlModelLoader, type CompiledStageViewConfig } from './yaml-model-loader';
import uniquePathsModel from '../algorithms/specs/models/unique-paths.yaml';
import uniquePathsIiModel from '../algorithms/specs/models/unique-paths-ii.yaml';
import minimumPathSumModel from '../algorithms/specs/models/minimum-path-sum.yaml';
import fibonacciModel from '../algorithms/specs/models/fibonacci.yaml';
import climbStairsModel from '../algorithms/specs/models/climb-stairs.yaml';
import knapsack01Model from '../algorithms/specs/models/knapsack-01.yaml';
import distinctSubsequencesModel from '../algorithms/specs/models/distinct-subsequences.yaml';
import deleteOperationForTwoStringsModel from '../algorithms/specs/models/delete-operation-for-two-strings.yaml';
import editDistanceModel from '../algorithms/specs/models/edit-distance.yaml';
import palindromicSubstringsModel from '../algorithms/specs/models/palindromic-substrings.yaml';
import longestPalindromicSubsequenceModel from '../algorithms/specs/models/longest-palindromic-subsequence.yaml';
import partitionEqualSubsetSumModel from '../algorithms/specs/models/partition-equal-subset-sum.yaml';
import { DpStepEngine } from '../algorithms/categories/dynamic-programming/engine/dp-step-engine';
import {
  ModelSynthesisEngine,
  bridgeSemanticLinesToAnchorMap,
  resolveSemanticLine,
} from './model-synthesis-engine';
import '../algorithms/categories/dynamic-programming/specs';

export { bridgeSemanticLinesToAnchorMap, resolveSemanticLine };

export class AlgorithmModelRepository {
  private static registry = new Map<string, IYamlAlgorithmModel>([
    ['unique-paths', uniquePathsModel as IYamlAlgorithmModel],
    ['unique-paths-ii', uniquePathsIiModel as IYamlAlgorithmModel],
    ['min-path-sum', minimumPathSumModel as IYamlAlgorithmModel],
    ['fibonacci', fibonacciModel as IYamlAlgorithmModel],
    ['climb-stairs', climbStairsModel as IYamlAlgorithmModel],
    ['01-knapsack', knapsack01Model as IYamlAlgorithmModel],
    ['knapsack-01', knapsack01Model as IYamlAlgorithmModel],
    ['distinct-subsequences', distinctSubsequencesModel as IYamlAlgorithmModel],
    ['delete-operation-for-two-strings', deleteOperationForTwoStringsModel as IYamlAlgorithmModel],
    ['delete-distance', deleteOperationForTwoStringsModel as IYamlAlgorithmModel],
    ['edit-distance', editDistanceModel as IYamlAlgorithmModel],
    ['palindromic-substrings', palindromicSubstringsModel as IYamlAlgorithmModel],
    ['longest-palindromic-subsequence', longestPalindromicSubsequenceModel as IYamlAlgorithmModel],
    ['partition-equal-subset-sum', partitionEqualSubsetSumModel as IYamlAlgorithmModel],
    ['partition-subset', partitionEqualSubsetSumModel as IYamlAlgorithmModel],
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
