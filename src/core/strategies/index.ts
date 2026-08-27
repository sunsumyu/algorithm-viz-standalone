import { AlgorithmStrategyRegistry } from './algorithm-strategy-registry';
import { GridUniquePathsStrategy } from './grid-unique-paths-strategy';
import { KnapsackPartitionSubsetStrategy } from './knapsack-partition-subset-strategy';
import { KnapsackStepMatrixCompiler } from './knapsack-step-matrix-compiler';
import { SequenceDistinctSubsequencesStrategy } from './sequence-distinct-subsequences-strategy';
import { SequenceEditDistanceStrategy } from './sequence-edit-distance-strategy';
import { SequenceDeleteDistanceStrategy } from './sequence-delete-distance-strategy';
import { SequenceLongestPalindromicSubsequenceStrategy } from './sequence-longest-palindromic-subsequence-strategy';
import { SequencePalindromicSubstringsStrategy } from './sequence-palindromic-substrings-strategy';
import { Linear1DStrategy } from './linear-1d-strategy';

export function registerBuiltinStrategies(): void {
  // Grid DP
  AlgorithmStrategyRegistry.register(new GridUniquePathsStrategy('unique-paths'));
  AlgorithmStrategyRegistry.register(new GridUniquePathsStrategy('unique-paths-ii'));
  AlgorithmStrategyRegistry.register(new GridUniquePathsStrategy('min-path-sum'));

  // Knapsack DP
  AlgorithmStrategyRegistry.register(new KnapsackPartitionSubsetStrategy());

  // Sequence & Interval DP
  AlgorithmStrategyRegistry.register(new SequenceDistinctSubsequencesStrategy());
  AlgorithmStrategyRegistry.register(new SequenceEditDistanceStrategy());
  AlgorithmStrategyRegistry.register(new SequenceDeleteDistanceStrategy());
  AlgorithmStrategyRegistry.register(new SequenceLongestPalindromicSubsequenceStrategy());
  AlgorithmStrategyRegistry.register(new SequencePalindromicSubstringsStrategy());

  // Linear 1D DP
  AlgorithmStrategyRegistry.register(new Linear1DStrategy('fibonacci'));
  AlgorithmStrategyRegistry.register(new Linear1DStrategy('climb-stairs'));
}

AlgorithmStrategyRegistry.setDefaultInitializer(registerBuiltinStrategies);

export {
  AlgorithmStrategyRegistry,
  GridUniquePathsStrategy,
  KnapsackPartitionSubsetStrategy,
  KnapsackStepMatrixCompiler,
  SequenceDistinctSubsequencesStrategy,
  SequenceEditDistanceStrategy,
  SequenceDeleteDistanceStrategy,
  SequenceLongestPalindromicSubsequenceStrategy,
  SequencePalindromicSubstringsStrategy,
  Linear1DStrategy
};

export * from './strategy-helpers';
export type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
