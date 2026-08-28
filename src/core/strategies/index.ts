import { AlgorithmStrategyRegistry } from './algorithm-strategy-registry';
import { GridUniquePathsStrategy } from './grid-unique-paths-strategy';
import { KnapsackPartitionSubsetStrategy } from './knapsack-partition-subset-strategy';
import { Knapsack01Strategy } from './knapsack-01-strategy';
import { KnapsackTargetSumStrategy } from './knapsack-target-sum-strategy';
import { KnapsackCombinationSum4Strategy } from './knapsack-combination-sum4-strategy';
import { KnapsackStepMatrixCompiler } from './knapsack-step-matrix-compiler';
import { SequenceDistinctSubsequencesStrategy } from './sequence-distinct-subsequences-strategy';
import { SequenceEditDistanceStrategy } from './sequence-edit-distance-strategy';
import { SequenceDeleteDistanceStrategy } from './sequence-delete-distance-strategy';
import { SequenceLongestPalindromicSubsequenceStrategy } from './sequence-longest-palindromic-subsequence-strategy';
import { SequencePalindromicSubstringsStrategy } from './sequence-palindromic-substrings-strategy';
import { Linear1DStrategy } from './linear-1d-strategy';
import { LinearStepMatrixCompiler } from './linear-step-matrix-compiler';

import { KnapsackFamilyStrategy } from './knapsack-family-strategy';
import { HouseRobberStrategy } from './house-robber-strategy';
import { StockStrategy } from './stock-strategy';
import { SequenceAdvancedStrategy } from './sequence-advanced-strategy';

export function registerBuiltinStrategies(): void {
  // Grid DP
  AlgorithmStrategyRegistry.register(new GridUniquePathsStrategy('unique-paths'));
  AlgorithmStrategyRegistry.register(new GridUniquePathsStrategy('unique-paths-ii'));
  AlgorithmStrategyRegistry.register(new GridUniquePathsStrategy('min-path-sum'));

  // Knapsack DP
  AlgorithmStrategyRegistry.register(new KnapsackPartitionSubsetStrategy());
  AlgorithmStrategyRegistry.register(new Knapsack01Strategy());
  AlgorithmStrategyRegistry.register(new KnapsackTargetSumStrategy());
  AlgorithmStrategyRegistry.register(new KnapsackCombinationSum4Strategy());
  AlgorithmStrategyRegistry.register(new KnapsackFamilyStrategy('last-stone-weight-ii'));
  AlgorithmStrategyRegistry.register(new KnapsackFamilyStrategy('complete-knapsack'));
  AlgorithmStrategyRegistry.register(new KnapsackFamilyStrategy('coin-change-ii'));
  AlgorithmStrategyRegistry.register(new KnapsackFamilyStrategy('coin-change'));
  AlgorithmStrategyRegistry.register(new KnapsackFamilyStrategy('perfect-squares'));
  AlgorithmStrategyRegistry.register(new KnapsackFamilyStrategy('ones-and-zeroes'));
  AlgorithmStrategyRegistry.register(new KnapsackFamilyStrategy('word-break'));
  AlgorithmStrategyRegistry.register(new KnapsackFamilyStrategy('multiple-knapsack'));

  // House Robber Family
  AlgorithmStrategyRegistry.register(new HouseRobberStrategy('house-robber'));
  AlgorithmStrategyRegistry.register(new HouseRobberStrategy('house-robber-ii'));
  AlgorithmStrategyRegistry.register(new HouseRobberStrategy('house-robber-iii'));

  // Stock Trading Family
  AlgorithmStrategyRegistry.register(new StockStrategy('best-time-to-buy-and-sell-stock'));
  AlgorithmStrategyRegistry.register(new StockStrategy('best-time-to-buy-and-sell-stock-ii'));
  AlgorithmStrategyRegistry.register(new StockStrategy('best-time-to-buy-and-sell-stock-iii'));
  AlgorithmStrategyRegistry.register(new StockStrategy('best-time-to-buy-and-sell-stock-iv'));
  AlgorithmStrategyRegistry.register(new StockStrategy('best-time-to-buy-and-sell-stock-with-cooldown'));
  AlgorithmStrategyRegistry.register(new StockStrategy('best-time-to-buy-and-sell-stock-with-transaction-fee'));

  // Sequence & Interval DP
  AlgorithmStrategyRegistry.register(new SequenceDistinctSubsequencesStrategy());
  AlgorithmStrategyRegistry.register(new SequenceEditDistanceStrategy());
  AlgorithmStrategyRegistry.register(new SequenceDeleteDistanceStrategy());
  AlgorithmStrategyRegistry.register(new SequenceLongestPalindromicSubsequenceStrategy());
  AlgorithmStrategyRegistry.register(new SequencePalindromicSubstringsStrategy());
  AlgorithmStrategyRegistry.register(new SequenceAdvancedStrategy('longest-increasing-subsequence'));
  AlgorithmStrategyRegistry.register(new SequenceAdvancedStrategy('longest-continuous-increasing-subsequence'));
  AlgorithmStrategyRegistry.register(new SequenceAdvancedStrategy('longest-repeated-subarray'));
  AlgorithmStrategyRegistry.register(new SequenceAdvancedStrategy('longest-common-subsequence'));
  AlgorithmStrategyRegistry.register(new SequenceAdvancedStrategy('uncrossed-lines'));
  AlgorithmStrategyRegistry.register(new SequenceAdvancedStrategy('is-subsequence'));
  AlgorithmStrategyRegistry.register(new SequenceAdvancedStrategy('max-subarray-dp'));

  // Linear 1D DP
  AlgorithmStrategyRegistry.register(new Linear1DStrategy('fibonacci'));
  AlgorithmStrategyRegistry.register(new Linear1DStrategy('climb-stairs'));
  AlgorithmStrategyRegistry.register(new Linear1DStrategy('min-cost'));
  AlgorithmStrategyRegistry.register(new Linear1DStrategy('min-cost-climbing-stairs'));
  AlgorithmStrategyRegistry.register(new Linear1DStrategy('integer-break'));
  AlgorithmStrategyRegistry.register(new Linear1DStrategy('unique-bst'));
  AlgorithmStrategyRegistry.register(new Linear1DStrategy('decode-ways'));
}

AlgorithmStrategyRegistry.setDefaultInitializer(registerBuiltinStrategies);

export {
  AlgorithmStrategyRegistry,
  GridUniquePathsStrategy,
  KnapsackPartitionSubsetStrategy,
  Knapsack01Strategy,
  KnapsackTargetSumStrategy,
  KnapsackCombinationSum4Strategy,
  KnapsackFamilyStrategy,
  HouseRobberStrategy,
  StockStrategy,
  SequenceAdvancedStrategy,
  KnapsackStepMatrixCompiler,
  SequenceDistinctSubsequencesStrategy,
  SequenceEditDistanceStrategy,
  SequenceDeleteDistanceStrategy,
  SequenceLongestPalindromicSubsequenceStrategy,
  SequencePalindromicSubstringsStrategy,
  Linear1DStrategy,
  LinearStepMatrixCompiler
};

export * from './strategy-helpers';
export type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
