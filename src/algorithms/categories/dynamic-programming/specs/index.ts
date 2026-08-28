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
