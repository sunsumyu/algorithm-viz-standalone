import { DpStepEngine } from '../engine/dp-step-engine';

// Linear DP specs
export * from './linear/climb-stairs.spec';
export * from './linear/min-cost.spec';
export * from './linear/fibonacci.spec';
export * from './linear/integer-break.spec';
export * from './linear/unique-bst.spec';
export * from './linear/decode-ways.spec';
export * from './linear/max-subarray.spec';

import { ClimbStairsSpec } from './linear/climb-stairs.spec';
import { MinCostSpec } from './linear/min-cost.spec';
import { FibonacciSpec } from './linear/fibonacci.spec';
import { IntegerBreakSpec } from './linear/integer-break.spec';
import { UniqueBstSpec } from './linear/unique-bst.spec';
import { DecodeWaysSpec } from './linear/decode-ways.spec';
import { MaxSubarraySpec } from './linear/max-subarray.spec';

// Sequence DP specs
export * from './sequence/lcs.spec';
export * from './sequence/edit-distance.spec';
export * from './sequence/palindromic-substrings.spec';
export * from './sequence/uncrossed-lines.spec';
export * from './sequence/is-subsequence.spec';
export * from './sequence/distinct-subsequences.spec';
export * from './sequence/lis.spec';
export * from './sequence/lcis.spec';
export * from './sequence/longest-repeated-subarray.spec';
export * from './sequence/delete-distance.spec';
export * from './sequence/longest-palindromic-subsequence.spec';

import { LcsSpec } from './sequence/lcs.spec';
import { EditDistanceSpec } from './sequence/edit-distance.spec';
import { PalindromicSubstringsSpec } from './sequence/palindromic-substrings.spec';
import { UncrossedLinesSpec } from './sequence/uncrossed-lines.spec';
import { IsSubsequenceSpec } from './sequence/is-subsequence.spec';
import { DistinctSubsequencesSpec } from './sequence/distinct-subsequences.spec';
import { LisSpec } from './sequence/lis.spec';
import { LcisSpec } from './sequence/lcis.spec';
import { LongestRepeatedSubarraySpec } from './sequence/longest-repeated-subarray.spec';
import { DeleteDistanceSpec } from './sequence/delete-distance.spec';
import { LongestPalindromicSubsequenceSpec } from './sequence/longest-palindromic-subsequence.spec';

// Knapsack DP specs
export * from './knapsack/01-knapsack.spec';
export * from './knapsack/complete-knapsack.spec';
export * from './knapsack/coin-change.spec';
export * from './knapsack/coin-change-ii.spec';
export * from './knapsack/partition-subset.spec';
export * from './knapsack/last-stone-weight-ii.spec';
export * from './knapsack/target-sum.spec';
export * from './knapsack/ones-and-zeroes.spec';
export * from './knapsack/combination-sum-iv.spec';
export * from './knapsack/perfect-squares.spec';
export * from './knapsack/word-break.spec';
export * from './knapsack/multiple-knapsack.spec';

import { Knapsack01Spec } from './knapsack/01-knapsack.spec';
import { CompleteKnapsackSpec } from './knapsack/complete-knapsack.spec';
import { CoinChangeSpec } from './knapsack/coin-change.spec';
import { CoinChangeIiSpec } from './knapsack/coin-change-ii.spec';
import { PartitionSubsetSpec } from './knapsack/partition-subset.spec';
import { LastStoneWeightIiSpec } from './knapsack/last-stone-weight-ii.spec';
import { TargetSumSpec } from './knapsack/target-sum.spec';
import { OnesAndZeroesSpec } from './knapsack/ones-and-zeroes.spec';
import { CombinationSumIvSpec } from './knapsack/combination-sum-iv.spec';
import { PerfectSquaresSpec } from './knapsack/perfect-squares.spec';
import { WordBreakSpec } from './knapsack/word-break.spec';
import { MultipleKnapsackSpec } from './knapsack/multiple-knapsack.spec';

// Grid DP specs
export * from './grid/unique-paths.spec';
export * from './grid/unique-paths-ii.spec';
export * from './grid/minimum-path-sum.spec';
export * from './grid/triangle.spec';
export * from './grid/maximal-square.spec';

import { UniquePathsSpec } from './grid/unique-paths.spec';
import { UniquePathsIiSpec } from './grid/unique-paths-ii.spec';
import { MinimumPathSumSpec } from './grid/minimum-path-sum.spec';
import { TriangleSpec } from './grid/triangle.spec';
import { MaximalSquareSpec } from './grid/maximal-square.spec';

// Robber & Stock DP specs
export * from './robber-stock/house-robber.spec';
export * from './robber-stock/house-robber-ii.spec';
export * from './robber-stock/house-robber-iii.spec';
export * from './robber-stock/stock-i.spec';
export * from './robber-stock/stock-ii.spec';
export * from './robber-stock/stock-iii.spec';
export * from './robber-stock/stock-iv.spec';
export * from './robber-stock/stock-with-cooldown.spec';
export * from './robber-stock/stock-with-fee.spec';

import { HouseRobberSpec } from './robber-stock/house-robber.spec';
import { HouseRobberIiSpec } from './robber-stock/house-robber-ii.spec';
import { HouseRobberIiiSpec } from './robber-stock/house-robber-iii.spec';
import { StockISpec } from './robber-stock/stock-i.spec';
import { StockIiSpec } from './robber-stock/stock-ii.spec';
import { StockIiiSpec } from './robber-stock/stock-iii.spec';
import { StockIvSpec } from './robber-stock/stock-iv.spec';
import { StockWithCooldownSpec } from './robber-stock/stock-with-cooldown.spec';
import { StockWithFeeSpec } from './robber-stock/stock-with-fee.spec';

// Auto-register specs to DpStepEngine
DpStepEngine.register(ClimbStairsSpec);
DpStepEngine.register(MinCostSpec);
DpStepEngine.register(FibonacciSpec);
DpStepEngine.register(IntegerBreakSpec);
DpStepEngine.register(UniqueBstSpec);
DpStepEngine.register(DecodeWaysSpec);
DpStepEngine.register(MaxSubarraySpec);

DpStepEngine.register(LcsSpec);
DpStepEngine.register(EditDistanceSpec);
DpStepEngine.register(PalindromicSubstringsSpec);
DpStepEngine.register(UncrossedLinesSpec);
DpStepEngine.register(IsSubsequenceSpec);
DpStepEngine.register(DistinctSubsequencesSpec);
DpStepEngine.register(LisSpec);
DpStepEngine.register(LcisSpec);
DpStepEngine.register(LongestRepeatedSubarraySpec);
DpStepEngine.register(DeleteDistanceSpec);
DpStepEngine.register(LongestPalindromicSubsequenceSpec);

DpStepEngine.register(Knapsack01Spec);
DpStepEngine.register(CompleteKnapsackSpec);
DpStepEngine.register(CoinChangeSpec);
DpStepEngine.register(CoinChangeIiSpec);
DpStepEngine.register(PartitionSubsetSpec);
DpStepEngine.register(LastStoneWeightIiSpec);
DpStepEngine.register(TargetSumSpec);
DpStepEngine.register(OnesAndZeroesSpec);
DpStepEngine.register(CombinationSumIvSpec);
DpStepEngine.register(PerfectSquaresSpec);
DpStepEngine.register(WordBreakSpec);
DpStepEngine.register(MultipleKnapsackSpec);

DpStepEngine.register(UniquePathsSpec);
DpStepEngine.register(UniquePathsIiSpec);
DpStepEngine.register(MinimumPathSumSpec);
DpStepEngine.register(TriangleSpec);
DpStepEngine.register(MaximalSquareSpec);

DpStepEngine.register(HouseRobberSpec);
DpStepEngine.register(HouseRobberIiSpec);
DpStepEngine.register(HouseRobberIiiSpec);
DpStepEngine.register(StockISpec);
DpStepEngine.register(StockIiSpec);
DpStepEngine.register(StockIiiSpec);
DpStepEngine.register(StockIvSpec);
DpStepEngine.register(StockWithCooldownSpec);
DpStepEngine.register(StockWithFeeSpec);

// Tree DP specs (树型 DP 专题 — 第078讲、第079讲)
export * from './tree/tree-diameter.spec';
export * from './tree/max-path-sum.spec';
export * from './tree/binary-tree-cameras.spec';
export * from './tree/course-selection.spec';
export * from './tree/largest-bst-subtree.spec';
export * from './tree/max-distance-in-tree.spec';
export * from './tree/minimum-fuel-cost.spec';
export * from './tree/longest-path-different-characters.spec';
export * from './tree/party-without-boss.spec';
export * from './tree/height-removal-queries.spec';
export * from './tree/minimum-score-after-removals.spec';

import { TreeDiameterSpec } from './tree/tree-diameter.spec';
import { MaxPathSumSpec } from './tree/max-path-sum.spec';
import { BinaryTreeCamerasSpec } from './tree/binary-tree-cameras.spec';
import { CourseSelectionSpec } from './tree/course-selection.spec';
import { LargestBstSubtreeSpec } from './tree/largest-bst-subtree.spec';
import { MaxDistanceInTreeSpec } from './tree/max-distance-in-tree.spec';
import { MinimumFuelCostSpec } from './tree/minimum-fuel-cost.spec';
import { LongestPathDifferentCharactersSpec } from './tree/longest-path-different-characters.spec';
import { PartyWithoutBossSpec } from './tree/party-without-boss.spec';
import { HeightRemovalQueriesSpec } from './tree/height-removal-queries.spec';
import { MinimumScoreAfterRemovalsSpec } from './tree/minimum-score-after-removals.spec';

DpStepEngine.register(TreeDiameterSpec);
DpStepEngine.register(MaxPathSumSpec);
DpStepEngine.register(BinaryTreeCamerasSpec);
DpStepEngine.register(CourseSelectionSpec);
DpStepEngine.register(LargestBstSubtreeSpec);
DpStepEngine.register(MaxDistanceInTreeSpec);
DpStepEngine.register(MinimumFuelCostSpec);
DpStepEngine.register(LongestPathDifferentCharactersSpec);
DpStepEngine.register(PartyWithoutBossSpec);
DpStepEngine.register(HeightRemovalQueriesSpec);
DpStepEngine.register(MinimumScoreAfterRemovalsSpec);

// Bitmask DP specs (状压 DP 专题 — 第080讲、第081讲)
export * from './bitmask/can-i-win.spec';
export * from './bitmask/matchsticks-to-square.spec';
export * from './bitmask/partition-k-equal-subsets.spec';
export * from './bitmask/tsp-bitmask-dp.spec';
export * from './bitmask/number-of-ways-wear-hats.spec';
export * from './bitmask/optimal-account-balancing.spec';
export * from './bitmask/good-subsets.spec';
export * from './bitmask/distribute-repeating-integers.spec';

import { CanIWinSpec } from './bitmask/can-i-win.spec';
import { MatchsticksToSquareSpec } from './bitmask/matchsticks-to-square.spec';
import { PartitionToKEqualSumSubsetsSpec } from './bitmask/partition-k-equal-subsets.spec';
import { TspSpec } from './bitmask/tsp-bitmask-dp.spec';
import { NumberOfWaysWearHatsSpec } from './bitmask/number-of-ways-wear-hats.spec';
import { OptimalAccountBalancingSpec } from './bitmask/optimal-account-balancing.spec';
import { GoodSubsetsSpec } from './bitmask/good-subsets.spec';
import { DistributeRepeatingIntegersSpec } from './bitmask/distribute-repeating-integers.spec';

DpStepEngine.register(CanIWinSpec);
DpStepEngine.register(MatchsticksToSquareSpec);
DpStepEngine.register(PartitionToKEqualSumSubsetsSpec);
DpStepEngine.register(TspSpec);
DpStepEngine.register(NumberOfWaysWearHatsSpec);
DpStepEngine.register(OptimalAccountBalancingSpec);
DpStepEngine.register(GoodSubsetsSpec);
DpStepEngine.register(DistributeRepeatingIntegersSpec);

// Three-Dimension DP specs (三维 DP 专题 — 第069讲)
export * from './three-dimension/knight-probability.spec';
export * from './three-dimension/out-of-boundary-paths.spec';
export * from './three-dimension/profitable-schemes.spec';

import { KnightProbabilitySpec } from './three-dimension/knight-probability.spec';
import { OutOfBoundaryPathsSpec } from './three-dimension/out-of-boundary-paths.spec';
import { ProfitableSchemesSpec } from './three-dimension/profitable-schemes.spec';

DpStepEngine.register(KnightProbabilitySpec);
DpStepEngine.register(OutOfBoundaryPathsSpec);
DpStepEngine.register(ProfitableSchemesSpec);

// Digit DP specs (数位 DP 专题 — 第084讲、第085讲)
export * from './digit/count-digit-one.spec';
export * from './digit/non-negative-consecutive-ones.spec';

import { CountDigitOneSpec } from './digit/count-digit-one.spec';
import { NonNegativeConsecutiveOnesSpec } from './digit/non-negative-consecutive-ones.spec';

DpStepEngine.register(CountDigitOneSpec);
DpStepEngine.register(NonNegativeConsecutiveOnesSpec);

// Subarray & LIS Extension DP specs (子数组与 LIS 扩展 DP 专题 — 第070~072讲)
export * from './subarray-extension/max-circular-subarray.spec';
export * from './subarray-extension/max-product-subarray.spec';
export * from './subarray-extension/magic-scroll.spec';
export * from './subarray-extension/russian-doll-envelopes.spec';

import { MaxCircularSubarraySpec } from './subarray-extension/max-circular-subarray.spec';
import { MaxProductSubarraySpec } from './subarray-extension/max-product-subarray.spec';
import { MagicScrollSpec } from './subarray-extension/magic-scroll.spec';
import { RussianDollEnvelopesSpec } from './subarray-extension/russian-doll-envelopes.spec';

DpStepEngine.register(MaxCircularSubarraySpec);
DpStepEngine.register(MaxProductSubarraySpec);
DpStepEngine.register(MagicScrollSpec);
DpStepEngine.register(RussianDollEnvelopesSpec);

// Optimization & Observation DP specs (优化与观察 DP 专题 — 第083讲、第130讲)
export * from './optimization/super-egg-drop.spec';
export * from './optimization/sliding-window-dp.spec';

import { SuperEggDropSpec } from './optimization/super-egg-drop.spec';
import { SlidingWindowDpSpec } from './optimization/sliding-window-dp.spec';

DpStepEngine.register(SuperEggDropSpec);
DpStepEngine.register(SlidingWindowDpSpec);

