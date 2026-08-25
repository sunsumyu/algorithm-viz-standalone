/**
 * 算法模型仓储深度模块 (AlgorithmModelRepository Deep Module)
 * 遵循深度模块原则：通过极其紧凑简洁的外部接口，隐藏所有底层 YAML 解析、
 * 静态模型索引、语法高亮编译与变体锚点索引。
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

  /**
   * 注册算法模型
   */
  public static register(id: string, model: IYamlAlgorithmModel): void {
    if (!id || !model) {
      throw new Error('[AlgorithmModelRepository] 注册参数无效');
    }
    this.registry.set(id, model);
  }

  /**
   * 获取算法模型原始对象
   */
  public static getModel(id: string): IYamlAlgorithmModel {
    const model = this.registry.get(id);
    if (!model) {
      throw new Error(`[AlgorithmModelRepository] 未找到算法模型: ${id}`);
    }
    return model;
  }

  /**
   * 检查模型是否存在
   */
  public static hasModel(id: string): boolean {
    return this.registry.has(id);
  }

  /**
   * 获取已注册的所有算法模型 ID 列表
   */
  public static getAllIds(): string[] {
    return Array.from(this.registry.keys());
  }

  /**
   * 获取指定阶段与方向的已编译视图与代码高亮配置
   */
  public static getCompiledStage(
    id: string,
    stageKey: string,
    direction: 'forward' | 'reverse' = 'forward'
  ): CompiledStageViewConfig {
    const model = this.getModel(id);
    return YamlModelLoader.getCompiledStageConfig(model, stageKey, direction);
  }

  /**
   * 语法高亮行工具方法
   */
  public static highlightSyntax(codeLine: string): string {
    return YamlModelLoader.highlightSyntax(codeLine);
  }
}
