import { AlgorithmStrategyRegistry } from './algorithm-strategy-registry';
import { GridUniquePathsStrategy } from './grid-unique-paths-strategy';
import { KnapsackPartitionSubsetStrategy } from './knapsack-partition-subset-strategy';
import { Knapsack01Strategy } from './knapsack-01-strategy';
import { KnapsackTargetSumStrategy } from './knapsack-target-sum-strategy';
import { KnapsackCombinationSum4Strategy } from './knapsack-combination-sum4-strategy';
import { KnapsackStepMatrixCompiler } from './knapsack-step-matrix-compiler';
import { SequenceDistinctSubsequencesStrategy } from './sequence-distinct-subsequences-strategy';
import { SequenceInterleavingStringStrategy } from './sequence-interleaving-string-strategy';
import { SequenceMinDeleteToBeSubstringStrategy } from './sequence-min-delete-to-be-substring-strategy';
import { SequenceEditDistanceStrategy } from './sequence-edit-distance-strategy';
import { SequenceDeleteDistanceStrategy } from './sequence-delete-distance-strategy';
import { SequenceLongestPalindromicSubsequenceStrategy } from './sequence-longest-palindromic-subsequence-strategy';
import { SequencePalindromicSubstringsStrategy } from './sequence-palindromic-substrings-strategy';
import { Linear1DStrategy } from './linear-1d-strategy';
import { LinearStepMatrixCompiler } from './linear-step-matrix-compiler';
import { PartitionDPStrategy, PartitionIntegerBreakStrategy } from './partition-integer-break-strategy';

import { KnapsackFamilyStrategy } from './knapsack-family-strategy';
import { HouseRobberStrategy } from './house-robber-strategy';
import { StockStrategy } from './stock-strategy';
import { SequenceAdvancedStrategy } from './sequence-advanced-strategy';
import { JumpGameIIStrategy } from './jump-game-ii-strategy';
import { JumpGameIIStepCompiler } from './jump-game-ii-compiler';
import { CanJumpStrategy } from './can-jump-strategy';
import { CanJumpStepCompiler } from './can-jump-compiler';
import { MinTapsStrategy } from './min-taps-strategy';
import { IntervalRelayStepCompiler } from './interval-relay-step-compiler';
import { MinArrowsStrategy } from './min-arrows-strategy';
import { NonOverlappingStrategy } from './non-overlapping-strategy';
import { MergeIntervalsStrategy } from './merge-intervals-strategy';
import { PartitionLabelsStrategy } from './partition-labels-strategy';
import { IntervalSchedulingStepCompiler } from './interval-scheduling-step-compiler';
import { CandyStrategy } from './candy-strategy';
import { TwoPassNeighborStepCompiler } from './two-pass-neighbor-step-compiler';
import { AssignCookiesStrategy } from './assign-cookies-strategy';
import { TwoSequenceGreedyStepCompiler } from './two-sequence-greedy-step-compiler';
import { LemonadeStrategy } from './lemonade-strategy';
import { ResourceGreedyStepCompiler } from './resource-greedy-step-compiler';
import { MonotoneDigitsStrategy } from './monotone-digits-strategy';
import { MaximizeSumKStrategy } from './maximize-sum-k-strategy';
import { GasStationStrategy } from './gas-station-strategy';
import { WiggleSubsequenceStrategy } from './wiggle-subsequence-strategy';
import { ReconstructQueueStrategy } from './reconstruct-queue-strategy';
import { MaxSubarrayStrategy } from './max-subarray-strategy';
import { TaskSchedulerStrategy } from './task-scheduler-strategy';
import { TreeCamerasStrategy } from './tree-cameras-strategy';
import { TwoCitySchedulingStrategy } from './two-city-scheduling-strategy';
import { MeetingRoomsIIStrategy } from './meeting-rooms-ii-strategy';
import { CourseScheduleIIIStrategy } from './course-schedule-iii-strategy';
import { LargestNumberStrategy } from './largest-number-strategy';
import { MinimumCostConnectSticksStrategy } from './minimum-cost-connect-sticks-strategy';
import { MinimumEatOrangesStrategy } from './minimum-eat-oranges-strategy';
import { AbsoluteValueAddToArrayStrategy } from './absolute-value-add-to-array-strategy';
import { CuttingBambooStrategy } from './cutting-bamboo-strategy';
import { IPOStrategy } from './ipo-strategy';
import { MaximumProductKPartsStrategy } from './maximum-product-k-parts-strategy';
import { MeetingMonopolyStrategy } from './meeting-monopoly-strategy';
import { MeetingOneDayStrategy } from './meeting-one-day-strategy';
import { SplitMinAvgSumStrategy } from './split-min-avg-sum-strategy';
import { GroupBuyTicketsStrategy } from './group-buy-tickets-strategy';
import { LongestSameZerosOnesStrategy } from './longest-same-zeros-ones-strategy';
import { MinimumInitialEnergyStrategy } from './minimum-initial-energy-strategy';
import { ShortestUnsortedSubarrayStrategy } from './shortest-unsorted-subarray-strategy';
import { SmallestRangeStrategy } from './smallest-range-strategy';
import { RabbitsInForestStrategy } from './rabbits-in-forest-strategy';
import { MinRefuelingStopsStrategy } from './min-refueling-stops-strategy';
import { SuperWashingMachinesStrategy } from './super-washing-machines-strategy';

import { TreeDpStrategy } from './tree-dp-strategy';
import { BitmaskDpStrategy } from './bitmask-dp-strategy';
import { IntervalDpStrategy } from './interval-dp-strategy';
import { DigitDpStrategy } from './digit-dp-strategy';
import { UniversalStringDpStrategy } from './universal-string-dp-strategy';
import { TargetSumStandardStrategy } from './target-sum-standard-strategy';

export { UniversalStringDpStrategy, IntervalDpStrategy, DigitDpStrategy };

export function registerBuiltinStrategies(): void {
  // Digit DP (数位 DP 专题 — 第084讲、第085讲)
  AlgorithmStrategyRegistry.register(new DigitDpStrategy('count-digit-one'));
  AlgorithmStrategyRegistry.register(new DigitDpStrategy('non-negative-consecutive-ones'));

  // Interval DP (区间 DP 专题 — 第083讲至第085讲)
  AlgorithmStrategyRegistry.register(new IntervalDpStrategy('predict-the-winner'));
  AlgorithmStrategyRegistry.register(new IntervalDpStrategy('burst-balloons'));
  AlgorithmStrategyRegistry.register(new IntervalDpStrategy('min-score-triangulation'));
  AlgorithmStrategyRegistry.register(new IntervalDpStrategy('merge-stones'));
  AlgorithmStrategyRegistry.register(new IntervalDpStrategy('strange-printer'));

  // Tree DP (树型 DP 专题 — 第078讲、第079讲)
  AlgorithmStrategyRegistry.register(new TreeDpStrategy('max-distance-in-tree'));
  AlgorithmStrategyRegistry.register(new TreeDpStrategy('largest-bst-subtree'));
  AlgorithmStrategyRegistry.register(new TreeDpStrategy('max-path-sum'));
  AlgorithmStrategyRegistry.register(new TreeDpStrategy('tree-diameter'));
  AlgorithmStrategyRegistry.register(new TreeDpStrategy('binary-tree-cameras'));
  AlgorithmStrategyRegistry.register(new TreeDpStrategy('course-selection'));
  AlgorithmStrategyRegistry.register(new TreeDpStrategy('minimum-fuel-cost'));
  AlgorithmStrategyRegistry.register(new TreeDpStrategy('longest-path-different-characters'));
  AlgorithmStrategyRegistry.register(new TreeDpStrategy('party-without-boss'));
  AlgorithmStrategyRegistry.register(new TreeDpStrategy('height-removal-queries'));
  AlgorithmStrategyRegistry.register(new TreeDpStrategy('minimum-score-after-removals'));

  // Bitmask DP (状压 DP 专题 — 第080讲、第081讲)
  AlgorithmStrategyRegistry.register(new BitmaskDpStrategy('can-i-win'));
  AlgorithmStrategyRegistry.register(new BitmaskDpStrategy('matchsticks-to-square'));
  AlgorithmStrategyRegistry.register(new BitmaskDpStrategy('partition-k-equal-subsets'));
  AlgorithmStrategyRegistry.register(new BitmaskDpStrategy('tsp-bitmask-dp'));
  AlgorithmStrategyRegistry.register(new BitmaskDpStrategy('number-of-ways-wear-hats'));
  AlgorithmStrategyRegistry.register(new BitmaskDpStrategy('optimal-account-balancing'));
  AlgorithmStrategyRegistry.register(new BitmaskDpStrategy('good-subsets'));
  AlgorithmStrategyRegistry.register(new BitmaskDpStrategy('distribute-repeating-integers'));

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
  AlgorithmStrategyRegistry.register(new PartitionDPStrategy('coin-change-ii'));
  AlgorithmStrategyRegistry.register(new PartitionDPStrategy('coin-change'));
  AlgorithmStrategyRegistry.register(new PartitionDPStrategy('perfect-squares'));
  AlgorithmStrategyRegistry.register(new KnapsackFamilyStrategy('last-stone-weight-ii'));
  AlgorithmStrategyRegistry.register(new KnapsackFamilyStrategy('ones-and-zeroes'));
  AlgorithmStrategyRegistry.register(new PartitionDPStrategy('word-break'));
  AlgorithmStrategyRegistry.register(new KnapsackFamilyStrategy('multiple-knapsack'));
  AlgorithmStrategyRegistry.register(new KnapsackFamilyStrategy('profitable-schemes'));

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
  AlgorithmStrategyRegistry.register(new SequenceInterleavingStringStrategy());
  AlgorithmStrategyRegistry.register(new SequenceMinDeleteToBeSubstringStrategy());
  AlgorithmStrategyRegistry.register(new SequenceEditDistanceStrategy());
  AlgorithmStrategyRegistry.register(new SequenceDeleteDistanceStrategy());
  AlgorithmStrategyRegistry.register(new SequenceLongestPalindromicSubsequenceStrategy());
  AlgorithmStrategyRegistry.register(new SequencePalindromicSubstringsStrategy());
  AlgorithmStrategyRegistry.register(new SequenceAdvancedStrategy('longest-increasing-subsequence'));
  AlgorithmStrategyRegistry.register(new SequenceAdvancedStrategy('longest-continuous-increasing-subsequence'));
  AlgorithmStrategyRegistry.register(new SequenceAdvancedStrategy('longest-repeated-subarray'));
  AlgorithmStrategyRegistry.register(new UniversalStringDpStrategy('longest-common-subsequence'));
  AlgorithmStrategyRegistry.register(new SequenceAdvancedStrategy('uncrossed-lines'));
  AlgorithmStrategyRegistry.register(new SequenceAdvancedStrategy('is-subsequence'));
  AlgorithmStrategyRegistry.register(new SequenceAdvancedStrategy('max-subarray-dp'));

  // Linear 1D DP
  AlgorithmStrategyRegistry.register(new Linear1DStrategy('fibonacci'));
  AlgorithmStrategyRegistry.register(new Linear1DStrategy('climb-stairs'));
  AlgorithmStrategyRegistry.register(new Linear1DStrategy('min-cost'));
  AlgorithmStrategyRegistry.register(new Linear1DStrategy('min-cost-climbing-stairs'));
  AlgorithmStrategyRegistry.register(new PartitionDPStrategy('integer-break'));
  AlgorithmStrategyRegistry.register(new Linear1DStrategy('unique-bst'));
  AlgorithmStrategyRegistry.register(new Linear1DStrategy('decode-ways'));
  AlgorithmStrategyRegistry.register(new JumpGameIIStrategy());
  AlgorithmStrategyRegistry.register(new CanJumpStrategy());
  AlgorithmStrategyRegistry.register(new MinTapsStrategy());
  AlgorithmStrategyRegistry.register(new MinArrowsStrategy());
  AlgorithmStrategyRegistry.register(new NonOverlappingStrategy());
  AlgorithmStrategyRegistry.register(new MergeIntervalsStrategy());
  AlgorithmStrategyRegistry.register(new PartitionLabelsStrategy());
  AlgorithmStrategyRegistry.register(new CandyStrategy());
  AlgorithmStrategyRegistry.register(new AssignCookiesStrategy());
  AlgorithmStrategyRegistry.register(new LemonadeStrategy());
  AlgorithmStrategyRegistry.register(new MonotoneDigitsStrategy());
  AlgorithmStrategyRegistry.register(new MaximizeSumKStrategy());
  AlgorithmStrategyRegistry.register(new GasStationStrategy());
  AlgorithmStrategyRegistry.register(new WiggleSubsequenceStrategy());
  AlgorithmStrategyRegistry.register(new ReconstructQueueStrategy());
  AlgorithmStrategyRegistry.register(new MaxSubarrayStrategy());
  AlgorithmStrategyRegistry.register(new TaskSchedulerStrategy());
  AlgorithmStrategyRegistry.register(new TreeCamerasStrategy());
  AlgorithmStrategyRegistry.register(new TwoCitySchedulingStrategy());
  AlgorithmStrategyRegistry.register(new MeetingRoomsIIStrategy());
  AlgorithmStrategyRegistry.register(new CourseScheduleIIIStrategy());
  AlgorithmStrategyRegistry.register(new LargestNumberStrategy());
  AlgorithmStrategyRegistry.register(new MinimumCostConnectSticksStrategy());
  AlgorithmStrategyRegistry.register(new MinimumEatOrangesStrategy());
  AlgorithmStrategyRegistry.register(new AbsoluteValueAddToArrayStrategy());
  AlgorithmStrategyRegistry.register(new CuttingBambooStrategy());
  AlgorithmStrategyRegistry.register(new IPOStrategy());
  AlgorithmStrategyRegistry.register(new MaximumProductKPartsStrategy());
  AlgorithmStrategyRegistry.register(new MeetingMonopolyStrategy());
  AlgorithmStrategyRegistry.register(new MeetingOneDayStrategy());
  AlgorithmStrategyRegistry.register(new SplitMinAvgSumStrategy());
  AlgorithmStrategyRegistry.register(new GroupBuyTicketsStrategy());
  AlgorithmStrategyRegistry.register(new LongestSameZerosOnesStrategy());
  AlgorithmStrategyRegistry.register(new MinimumInitialEnergyStrategy());
  AlgorithmStrategyRegistry.register(new ShortestUnsortedSubarrayStrategy());
  AlgorithmStrategyRegistry.register(new SmallestRangeStrategy());
  AlgorithmStrategyRegistry.register(new RabbitsInForestStrategy());
  AlgorithmStrategyRegistry.register(new MinRefuelingStopsStrategy());
  AlgorithmStrategyRegistry.register(new SuperWashingMachinesStrategy());

  // Target Sum Standard (第 73 课标准版)
  AlgorithmStrategyRegistry.register(new TargetSumStandardStrategy());
}

AlgorithmStrategyRegistry.setDefaultInitializer(registerBuiltinStrategies);

export {
  AlgorithmStrategyRegistry,
  TreeDpStrategy,
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
  SequenceInterleavingStringStrategy,
  SequenceMinDeleteToBeSubstringStrategy,
  SequenceEditDistanceStrategy,
  SequenceDeleteDistanceStrategy,
  SequenceLongestPalindromicSubsequenceStrategy,
  SequencePalindromicSubstringsStrategy,
  Linear1DStrategy,
  LinearStepMatrixCompiler,
  PartitionDPStrategy,
  PartitionIntegerBreakStrategy,
  JumpGameIIStrategy,
  JumpGameIIStepCompiler,
  CanJumpStrategy,
  CanJumpStepCompiler,
  MinTapsStrategy,
  IntervalRelayStepCompiler,
  MinArrowsStrategy,
  NonOverlappingStrategy,
  MergeIntervalsStrategy,
  PartitionLabelsStrategy,
  IntervalSchedulingStepCompiler,
  CandyStrategy,
  TwoPassNeighborStepCompiler,
  AssignCookiesStrategy,
  TwoSequenceGreedyStepCompiler,
  LemonadeStrategy,
  ResourceGreedyStepCompiler,
  MonotoneDigitsStrategy,
  MaximizeSumKStrategy,
  GasStationStrategy,
  WiggleSubsequenceStrategy,
  ReconstructQueueStrategy,
  MaxSubarrayStrategy,
  TaskSchedulerStrategy,
  TreeCamerasStrategy,
  TwoCitySchedulingStrategy,
  MeetingRoomsIIStrategy,
  CourseScheduleIIIStrategy,
  LargestNumberStrategy,
  MinimumCostConnectSticksStrategy,
  MinimumEatOrangesStrategy,
  AbsoluteValueAddToArrayStrategy,
  CuttingBambooStrategy,
  IPOStrategy,
  MaximumProductKPartsStrategy,
  MeetingMonopolyStrategy,
  MeetingOneDayStrategy,
  SplitMinAvgSumStrategy,
  GroupBuyTicketsStrategy,
  LongestSameZerosOnesStrategy,
  MinimumInitialEnergyStrategy,
  ShortestUnsortedSubarrayStrategy,
  SmallestRangeStrategy,
  RabbitsInForestStrategy,
  MinRefuelingStopsStrategy,
  SuperWashingMachinesStrategy
};

export * from './strategy-helpers';
export * from './spatial-compression-primitives';
export type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
