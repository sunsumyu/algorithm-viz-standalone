/**
 * 阶段代码编译与语义锚点索引深模块 (StageCodeCompiler Deep Module)
 * 遵循单一职责与深模块原则：
 * 1. 提供各阶段（递归/记忆化/DP填表/空间压缩）标准 Java 源码模板生成与管理；
 * 2. 自动解析代码中的 @step:anchor 标签，构建 1-based 物理行号索引映射；
 * 3. 干净剔除代码中的 @step 标签，输出纯净的代码用于语法高亮展示。
 */

export interface CompiledStageCode {
  /** 包含 @step 锚点标记的原始代码 */
  rawCode: string;
  /** 剥离所有 @step 标记后的纯净代码 */
  cleanCode: string;
  /** 语义锚点标识 -> 1-based 物理代码行号映射 */
  anchorLineMap: Record<string, number>;
}

export class StageCodeCompiler {
  /**
   * 编译指定算法与阶段的代码与语义断点锚点
   */
  public static compile(specId: string, stage: string, fallbackCode?: string): CompiledStageCode {
    const rawCode = this.getAnnotatedTemplate(specId, stage) || fallbackCode || `class Solution {\n    // ${specId} (${stage})\n}`;
    const lines = rawCode.split('\n');
    const anchorLineMap: Record<string, number> = {};
    const cleanLines: string[] = [];

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const match = line.match(/\/\/ @step:([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        anchorLineMap[match[1]] = lineNum;
      }
      cleanLines.push(line.replace(/\s*\/\/ @step:[a-zA-Z0-9_-]+.*$/, ''));
    });

    return {
      rawCode,
      cleanCode: cleanLines.join('\n'),
      anchorLineMap
    };
  }

  /**
   * 获取阶段标准带断点标注的 Java 源码
   */
  public static getAnnotatedTemplate(specId: string, stage: string): string | null {
    switch (specId) {
      case 'fibonacci':
        return this.getFibonacciTemplate(stage);
      case 'climb-stairs':
        return this.getClimbStairsTemplate(stage);
      case 'min-cost':
      case 'min-cost-climbing-stairs':
        return this.getMinCostTemplate(stage);
      case 'integer-break':
        return this.getIntegerBreakTemplate(stage);
      case 'unique-bst':
        return this.getUniqueBstTemplate(stage);
      case 'house-robber':
        return this.getHouseRobberTemplate(stage);
      case 'house-robber-ii':
        return this.getHouseRobberIITemplate(stage);
      case 'target-sum':
        return this.getTargetSumTemplate(stage);
      case 'last-stone-weight-ii':
        return this.getLastStoneWeightIITemplate(stage);
      case 'complete-knapsack':
        return this.getCompleteKnapsackTemplate(stage);
      case 'coin-change-ii':
        return this.getCoinChangeIITemplate(stage);
      case 'coin-change':
        return this.getCoinChangeTemplate(stage);
      case 'perfect-squares':
        return this.getPerfectSquaresTemplate(stage);
      case 'combination-sum-iv':
        return this.getCombinationSumIVTemplate(stage);
      case 'longest-repeated-subarray':
        return this.getLongestRepeatedSubarrayTemplate(stage);
      case 'multiple-knapsack':
        return this.getMultipleKnapsackTemplate(stage);
      case 'ones-and-zeroes':
        return this.getOnesAndZeroesTemplate(stage);
      case 'word-break':
        return this.getWordBreakTemplate(stage);
      case 'max-path-sum':
        return this.getMaxPathSumTemplate(stage);
      case 'tree-diameter':
        return this.getTreeDiameterTemplate(stage);
      case 'binary-tree-cameras':
        return this.getBinaryTreeCamerasTemplate(stage);
      case 'party-without-boss':
        return this.getPartyWithoutBossTemplate(stage);
      case 'max-distance-in-tree':
        return this.getMaxDistanceInTreeTemplate(stage);
      case 'largest-bst-subtree':
        return this.getLargestBstSubtreeTemplate(stage);
      case 'can-i-win':
        return this.getCanIWinTemplate(stage);
      case 'matchsticks-to-square':
        return this.getMatchsticksToSquareTemplate(stage);
      case 'partition-k-equal-subsets':
        return this.getPartitionKEqualSubsetsTemplate(stage);
      case 'tsp-bitmask-dp':
        return this.getTspBitmaskDpTemplate(stage);
      case 'number-of-ways-wear-hats':
        return this.getNumberOfWaysWearHatsTemplate(stage);
      case 'optimal-account-balancing':
        return this.getOptimalAccountBalancingTemplate(stage);
      case 'good-subsets':
        return this.getGoodSubsetsTemplate(stage);
      case 'distribute-repeating-integers':
        return this.getDistributeRepeatingIntegersTemplate(stage);
      case 'predict-the-winner':
        return this.getPredictTheWinnerTemplate(stage);
      case 'burst-balloons':
        return this.getBurstBalloonsTemplate(stage);
      case 'min-score-triangulation':
        return this.getMinScoreTriangulationTemplate(stage);
      case 'merge-stones':
        return this.getMergeStonesTemplate(stage);
      case 'strange-printer':
        return this.getStrangePrinterTemplate(stage);
      case 'count-digit-one':
        return this.getCountDigitOneTemplate(stage);
      case 'non-negative-consecutive-ones':
        return this.getNonNegativeConsecutiveOnesTemplate(stage);
      default:
        return null;
    }
  }

  private static getFibonacciTemplate(stage: string): string {
    if (stage === 'stage-1') {
      return `class Solution {
    public int fib(int n) { // @step:entry
        if (n <= 1) return n; // @step:boundary
        int left = fib(n - 1); // @step:branch_left
        int right = fib(n - 2); // @step:branch_right
        return left + right; // @step:combine
    }
}`;
    }
    if (stage === 'stage-2') {
      return `class Solution {
    public int fib(int n) { // @step:entry
        int[] memo = new int[n + 1];
        return dfs(n, memo);
    }
    private int dfs(int n, int[] memo) {
        if (n <= 1) return n; // @step:boundary
        if (memo[n] != 0) return memo[n]; // @step:cache_hit
        memo[n] = dfs(n - 1, memo) + dfs(n - 2, memo); // @step:combine
        return memo[n];
    }
}`;
    }
    if (stage === 'stage-3') {
      return `class Solution {
    public int fib(int n) {
        if (n <= 1) return n; // @step:init
        int[] dp = new int[n + 1]; // @step:init
        dp[0] = 0; dp[1] = 1; // @step:init
        for (int i = 2; i <= n; i++) { // @step:loop_i
            dp[i] = dp[i - 1] + dp[i - 2]; // @step:transfer
        }
        return dp[n]; // @step:return
    }
}`;
    }
    return `class Solution {
    public int fib(int n) {
        if (n <= 1) return n; // @step:init
        int prev = 0, curr = 1; // @step:init
        for (int i = 2; i <= n; i++) { // @step:loop_i
            int next = prev + curr; // @step:transfer
            prev = curr;
            curr = next;
        }
        return curr; // @step:return
    }
}`;
  }

  private static getClimbStairsTemplate(stage: string): string {
    if (stage === 'stage-1') {
      return `class Solution {
    public int climbStairs(int n) { // @step:entry
        if (n <= 2) return n; // @step:boundary
        int step1 = climbStairs(n - 1); // @step:branch_left
        int step2 = climbStairs(n - 2); // @step:branch_right
        return step1 + step2; // @step:combine
    }
}`;
    }
    if (stage === 'stage-2') {
      return `class Solution {
    public int climbStairs(int n) { // @step:entry
        int[] memo = new int[n + 1];
        return dfs(n, memo);
    }
    private int dfs(int n, int[] memo) {
        if (n <= 2) return n; // @step:boundary
        if (memo[n] != 0) return memo[n]; // @step:cache_hit
        memo[n] = dfs(n - 1, memo) + dfs(n - 2, memo); // @step:combine
        return memo[n];
    }
}`;
    }
    if (stage === 'stage-3') {
      return `class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n; // @step:init
        int[] dp = new int[n + 1]; // @step:init
        dp[1] = 1; dp[2] = 2; // @step:init
        for (int i = 3; i <= n; i++) { // @step:loop_i
            dp[i] = dp[i - 1] + dp[i - 2]; // @step:transfer
        }
        return dp[n]; // @step:return
    }
}`;
    }
    return `class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n; // @step:init
        int prev = 1, curr = 2; // @step:init
        for (int i = 3; i <= n; i++) { // @step:loop_i
            int next = prev + curr; // @step:transfer
            prev = curr;
            curr = next;
        }
        return curr; // @step:return
    }
}`;
  }

  private static getMinCostTemplate(stage: string): string {
    if (stage === 'stage-1') {
      return `class Solution {
    public int minCostClimbingStairs(int[] cost) { // @step:entry
        return Math.min(dfs(cost, 0), dfs(cost, 1)); // @step:combine
    }
    private int dfs(int[] cost, int i) {
        if (i >= cost.length) return 0; // @step:boundary
        return cost[i] + Math.min(dfs(cost, i + 1), dfs(cost, i + 2)); // @step:branch_left
    }
}`;
    }
    if (stage === 'stage-2') {
      return `class Solution {
    public int minCostClimbingStairs(int[] cost) { // @step:entry
        int[] memo = new int[cost.length];
        return Math.min(dfs(cost, 0, memo), dfs(cost, 1, memo));
    }
    private int dfs(int[] cost, int i, int[] memo) {
        if (i >= cost.length) return 0; // @step:boundary
        if (memo[i] != 0) return memo[i]; // @step:cache_hit
        memo[i] = cost[i] + Math.min(dfs(cost, i + 1, memo), dfs(cost, i + 2, memo)); // @step:combine
        return memo[i];
    }
}`;
    }
    if (stage === 'stage-3') {
      return `class Solution {
    public int minCostClimbingStairs(int[] cost) {
        int n = cost.length;
        int[] dp = new int[n + 1]; // @step:init
        dp[0] = 0; dp[1] = 0; // @step:init
        for (int i = 2; i <= n; i++) { // @step:loop_i
            dp[i] = Math.min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2]); // @step:transfer
        }
        return dp[n]; // @step:return
    }
}`;
    }
    return `class Solution {
    public int minCostClimbingStairs(int[] cost) {
        int first = 0, second = 0; // @step:init
        for (int i = 2; i <= cost.length; i++) { // @step:loop_i
            int next = Math.min(second + cost[i - 1], first + cost[i - 2]); // @step:transfer
            first = second;
            second = next;
        }
        return second; // @step:return
    }
}`;
  }

  private static getIntegerBreakTemplate(stage: string): string {
    if (stage === 'stage-1') {
      return `class Solution {
    public int integerBreak(int n) { // @step:entry
        if (n <= 2) return 1; // @step:boundary
        int maxProd = 0;
        for (int i = 1; i < n; i++) { // @step:loop_i
            maxProd = Math.max(maxProd, Math.max(i * (n - i), i * integerBreak(n - i))); // @step:branch_left
        }
        return maxProd; // @step:return
    }
}`;
    }
    if (stage === 'stage-2') {
      return `class Solution {
    public int integerBreak(int n) { // @step:entry
        int[] memo = new int[n + 1];
        return dfs(n, memo);
    }
    private int dfs(int n, int[] memo) {
        if (n <= 2) return 1; // @step:boundary
        if (memo[n] != 0) return memo[n]; // @step:cache_hit
        int maxProd = 0;
        for (int i = 1; i < n; i++) {
            maxProd = Math.max(maxProd, Math.max(i * (n - i), i * dfs(n - i, memo))); // @step:combine
        }
        memo[n] = maxProd;
        return maxProd; // @step:return
    }
}`;
    }
    if (stage === 'stage-3') {
      return `class Solution {
    public int integerBreak(int n) {
        int[] dp = new int[n + 1]; // @step:init
        dp[2] = 1; // @step:init
        for (int i = 3; i <= n; i++) { // @step:loop_i
            for (int j = 1; j <= i / 2; j++) { // @step:loop_j
                dp[i] = Math.max(dp[i], Math.max(j * (i - j), j * dp[i - j])); // @step:transfer
            }
        }
        return dp[n]; // @step:return
    }
}`;
    }
    return `class Solution {
    public int integerBreak(int n) {
        if (n <= 3) return n - 1; // @step:init
        int a = 1, b = 2, c = 3; // @step:init
        for (int i = 4; i <= n; i++) { // @step:loop_i
            int cur = 3 * a; // @step:transfer
            a = b;
            b = c;
            c = cur;
        }
        return c; // @step:return
    }
}`;
  }

  private static getUniqueBstTemplate(stage: string): string {
    if (stage === 'stage-1') {
      return `class Solution {
    public int numTrees(int n) { // @step:entry
        if (n <= 1) return 1; // @step:boundary
        int total = 0;
        for (int i = 1; i <= n; i++) { // @step:loop_i
            int left = numTrees(i - 1); // @step:branch_left
            int right = numTrees(n - i); // @step:branch_right
            total += left * right; // @step:combine
        }
        return total; // @step:return
    }
}`;
    }
    if (stage === 'stage-2') {
      return `class Solution {
    public int numTrees(int n) { // @step:entry
        int[] memo = new int[n + 1];
        return dfs(n, memo);
    }
    private int dfs(int n, int[] memo) {
        if (n <= 1) return 1; // @step:boundary
        if (memo[n] != 0) return memo[n]; // @step:cache_hit
        int total = 0;
        for (int i = 1; i <= n; i++) {
            total += dfs(i - 1, memo) * dfs(n - i, memo); // @step:combine
        }
        memo[n] = total;
        return total; // @step:return
    }
}`;
    }
    return `class Solution {
    public int numTrees(int n) {
        int[] dp = new int[n + 1]; // @step:init
        dp[0] = 1; dp[1] = 1; // @step:init
        for (int i = 2; i <= n; i++) { // @step:loop_i
            for (int j = 1; j <= i; j++) { // @step:loop_j
                dp[i] += dp[j - 1] * dp[i - j]; // @step:transfer 卡特兰数递推
            }
        }
        return dp[n]; // @step:return
    }
}`;
  }

  private static getHouseRobberTemplate(stage: string): string {
    if (stage === 'stage-1') {
      return `class Solution {
    public int rob(int[] nums) { // @step:entry
        return dfs(nums, nums.length - 1);
    }
    private int dfs(int[] nums, int i) {
        if (i < 0) return 0; // @step:boundary
        if (i == 0) return nums[0]; // @step:boundary
        int notRob = dfs(nums, i - 1); // @step:branch_left 不偷
        int doRob = dfs(nums, i - 2) + nums[i]; // @step:branch_right 偷
        return Math.max(notRob, doRob); // @step:combine
    }
}`;
    }
    if (stage === 'stage-2') {
      return `class Solution {
    public int rob(int[] nums) { // @step:entry
        int[] memo = new int[nums.length];
        Arrays.fill(memo, -1);
        return dfs(nums, nums.length - 1, memo);
    }
    private int dfs(int[] nums, int i, int[] memo) {
        if (i < 0) return 0; // @step:boundary
        if (i == 0) return nums[0]; // @step:boundary
        if (memo[i] != -1) return memo[i]; // @step:cache_hit
        memo[i] = Math.max(dfs(nums, i - 1, memo), dfs(nums, i - 2, memo) + nums[i]); // @step:combine
        return memo[i];
    }
}`;
    }
    if (stage === 'stage-3') {
      return `class Solution {
    public int rob(int[] nums) {
        if (nums.length == 0) return 0;
        if (nums.length == 1) return nums[0];
        int[] dp = new int[nums.length]; // @step:init
        dp[0] = nums[0]; // @step:init
        dp[1] = Math.max(nums[0], nums[1]); // @step:init
        for (int i = 2; i < nums.length; i++) { // @step:loop_i
            dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]); // @step:transfer
        }
        return dp[nums.length - 1]; // @step:return
    }
}`;
    }
    return `class Solution {
    public int rob(int[] nums) {
        if (nums.length == 0) return 0;
        int prev = 0, curr = 0; // @step:init
        for (int x : nums) { // @step:loop_i
            int next = Math.max(curr, prev + x); // @step:transfer
            prev = curr;
            curr = next;
        }
        return curr; // @step:return
    }
}`;
  }

  private static getHouseRobberIITemplate(stage: string): string {
    return `class Solution {
    public int rob(int[] nums) {
        if (nums.length == 1) return nums[0];
        return Math.max(robRange(nums, 0, nums.length - 2), robRange(nums, 1, nums.length - 1)); // @step:combine
    }
    private int robRange(int[] nums, int start, int end) {
        int prev = 0, curr = 0;
        for (int i = start; i <= end; i++) { // @step:loop_i
            int next = Math.max(curr, prev + nums[i]); // @step:transfer
            prev = curr;
            curr = next;
        }
        return curr;
    }
}`;
  }

  private static getTargetSumTemplate(stage: string): string {
    if (stage === 'stage-1') {
      return `class Solution {
    public int findTargetSumWays(int[] nums, int target) { // @step:entry
        int sum = 0;
        for (int x : nums) sum += x;
        if (Math.abs(target) > sum || (sum + target) % 2 != 0) return 0; // @step:odd_check
        int bag = (sum + target) / 2;
        return dfs(nums, 0, bag); // @step:dfs_start @step:return
    }
    private int dfs(int[] nums, int i, int remain) { // @step:dfs_entry
        if (remain == 0) return 1; // @step:base_match
        if (i >= nums.length || remain < 0) return 0; // @step:base_overflow
        int notTake = dfs(nums, i + 1, remain); // @step:branch_not_take
        int take = 0;
        if (remain >= nums[i]) { // @step:cond_take
            take = dfs(nums, i + 1, remain - nums[i]); // @step:branch_take
        }
        return notTake + take; // @step:combine
    }
}`;
    }
    if (stage === 'stage-2') {
      return `class Solution {
    public int findTargetSumWays(int[] nums, int target) { // @step:entry
        int sum = 0;
        for (int x : nums) sum += x;
        if (Math.abs(target) > sum || (sum + target) % 2 != 0) return 0; // @step:odd_check
        int bag = (sum + target) / 2;
        int[][] memo = new int[nums.length][bag + 1];
        return dfs(nums, 0, bag, memo); // @step:dfs_start @step:return
    }
    private int dfs(int[] nums, int i, int remain, int[][] memo) { // @step:dfs_entry
        if (remain == 0) return 1; // @step:base_match
        if (i >= nums.length || remain < 0) return 0; // @step:base_overflow
        if (memo[i][remain] != 0) return memo[i][remain]; // @step:cache_hit
        int notTake = dfs(nums, i + 1, remain, memo); // @step:branch_not_take
        int take = 0;
        if (remain >= nums[i]) { // @step:cond_take
            take = dfs(nums, i + 1, remain - nums[i], memo); // @step:branch_take
        }
        memo[i][remain] = notTake + take; // @step:combine
        return memo[i][remain];
    }
}`;
    }
    if (stage === 'stage-3') {
      return `class Solution {
    public int findTargetSumWays(int[] nums, int target) {
        int sum = 0;
        for (int x : nums) sum += x;
        if (Math.abs(target) > sum || (sum + target) % 2 != 0) return 0;
        int bag = (sum + target) / 2;
        int n = nums.length;
        int[][] dp = new int[n][bag + 1]; // @step:init
        dp[0][0] = 1; // @step:init_val
        if (nums[0] <= bag) dp[0][nums[0]] += 1; // @step:init_val
        for (int i = 1; i < n; i++) { // @step:loop_i
            for (int j = 0; j <= bag; j++) { // @step:loop_j
                dp[i][j] = dp[i - 1][j]; // @step:transfer
                if (j >= nums[i]) dp[i][j] += dp[i - 1][j - nums[i]]; // @step:transfer
            }
        }
        return dp[n - 1][bag]; // @step:return
    }
}`;
    }
    return `class Solution {
    public int findTargetSumWays(int[] nums, int target) {
        int sum = 0;
        for (int x : nums) sum += x;
        if (Math.abs(target) > sum || (sum + target) % 2 != 0) return 0; // @step:odd_check
        int bag = (sum + target) / 2;
        int[] dp = new int[bag + 1]; // @step:init
        dp[0] = 1; // @step:init
        for (int i = 0; i < nums.length; i++) { // @step:outer_loop
            for (int j = bag; j >= nums[i]; j--) { // @step:inner_loop
                dp[j] += dp[j - nums[i]]; // @step:transfer
            }
        }
        return dp[bag]; // @step:return
    }
}`;
  }

  private static getLastStoneWeightIITemplate(stage: string): string {
    if (stage === 'stage-1') {
      return `class Solution {
    public int lastStoneWeightII(int[] stones) { // @step:entry
        int sum = 0;
        for (int x : stones) sum += x;
        int target = sum / 2;
        int maxWeight = dfs(stones, 0, target); // @step:dfs_start @step:return
        return sum - 2 * maxWeight;
    }
    private int dfs(int[] stones, int i, int curTarget) { // @step:dfs_entry
        if (curTarget == 0) return 0; // @step:base_match
        if (i >= stones.length || curTarget < 0) return 0; // @step:base_overflow
        int notTake = dfs(stones, i + 1, curTarget); // @step:branch_not_take
        int take = 0;
        if (curTarget >= stones[i]) { // @step:cond_take
            take = dfs(stones, i + 1, curTarget - stones[i]) + stones[i]; // @step:branch_take
        }
        return Math.max(notTake, take); // @step:combine
    }
}`;
    }
    if (stage === 'stage-2') {
      return `class Solution {
    public int lastStoneWeightII(int[] stones) { // @step:entry
        int sum = 0;
        for (int x : stones) sum += x;
        int target = sum / 2;
        int[][] memo = new int[stones.length][target + 1];
        for (int[] row : memo) Arrays.fill(row, -1);
        int maxWeight = dfs(stones, 0, target, memo); // @step:dfs_start @step:return
        return sum - 2 * maxWeight;
    }
    private int dfs(int[] stones, int i, int curTarget, int[][] memo) { // @step:dfs_entry
        if (curTarget == 0) return 0; // @step:base_match
        if (i >= stones.length || curTarget < 0) return 0; // @step:base_overflow
        if (memo[i][curTarget] != -1) return memo[i][curTarget]; // @step:cache_hit
        int notTake = dfs(stones, i + 1, curTarget, memo); // @step:branch_not_take
        int take = 0;
        if (curTarget >= stones[i]) { // @step:cond_take
            take = dfs(stones, i + 1, curTarget - stones[i], memo) + stones[i]; // @step:branch_take
        }
        return memo[i][curTarget] = Math.max(notTake, take); // @step:combine
    }
}`;
    }
    if (stage === 'stage-3') {
      return `class Solution {
    public int lastStoneWeightII(int[] stones) { // @step:entry
        int sum = 0;
        for (int x : stones) sum += x;
        int target = sum / 2;
        int n = stones.length;
        int[][] dp = new int[n][target + 1]; // @step:init
        for (int j = stones[0]; j <= target; j++) { // @step:init_row
            dp[0][j] = stones[0];
        }
        for (int i = 1; i < n; i++) { // @step:loop_i
            for (int j = 0; j <= target; j++) { // @step:loop_j
                if (j < stones[i]) { // @step:cond
                    dp[i][j] = dp[i - 1][j];
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i - 1][j - stones[i]] + stones[i]); // @step:transfer_max
                }
            }
        }
        return sum - 2 * dp[n - 1][target]; // @step:return
    }
}`;
    }
    return `class Solution {
    public int lastStoneWeightII(int[] stones) { // @step:entry
        int sum = 0;
        for (int x : stones) sum += x;
        int target = sum / 2;
        int[] dp = new int[target + 1]; // @step:init
        for (int i = 0; i < stones.length; i++) { // @step:loop_i
            for (int j = target; j >= stones[i]; j--) { // @step:loop_j
                dp[j] = Math.max(dp[j], dp[j - stones[i]] + stones[i]); // @step:calc_max
            }
        }
        return sum - 2 * dp[target]; // @step:return
    }
}`;
  }

  private static getCompleteKnapsackTemplate(stage: string): string {
    if (stage === 'stage-1') {
      return `class Solution {
    public int completeKnapsack(int[] weights, int[] values, int bagWeight) { // @step:entry
        return dfs(weights, values, 0, bagWeight); // @step:dfs_start @step:return
    }
    private int dfs(int[] weights, int[] values, int i, int w) { // @step:dfs_entry
        if (i >= weights.length || w <= 0) return 0; // @step:boundary
        int notTake = dfs(weights, values, i + 1, w); // @step:branch_not_take
        int take = 0;
        if (w >= weights[i]) { // @step:cond_take
            take = values[i] + dfs(weights, values, i, w - weights[i]); // @step:branch_take
        }
        return Math.max(notTake, take); // @step:combine
    }
}`;
    }
    if (stage === 'stage-2') {
      return `class Solution {
    public int completeKnapsack(int[] weights, int[] values, int bagWeight) { // @step:entry
        int n = weights.length;
        int[][] memo = new int[n][bagWeight + 1];
        for (int[] row : memo) Arrays.fill(row, -1);
        return dfs(weights, values, 0, bagWeight, memo); // @step:dfs_start @step:return
    }
    private int dfs(int[] weights, int[] values, int i, int w, int[][] memo) { // @step:dfs_entry
        if (i >= weights.length || w <= 0) return 0; // @step:boundary
        if (memo[i][w] != -1) return memo[i][w]; // @step:cache_hit
        int notTake = dfs(weights, values, i + 1, w, memo); // @step:branch_not_take
        int take = 0;
        if (w >= weights[i]) { // @step:cond_take
            take = values[i] + dfs(weights, values, i, w - weights[i], memo); // @step:branch_take
        }
        return memo[i][w] = Math.max(notTake, take); // @step:combine
    }
}`;
    }
    if (stage === 'stage-3') {
      return `class Solution {
    public int completeKnapsack(int[] weights, int[] values, int bagWeight) { // @step:entry
        int n = weights.length;
        int[][] dp = new int[n][bagWeight + 1]; // @step:init
        for (int j = weights[0]; j <= bagWeight; j++) { // @step:init_row
            dp[0][j] = (j / weights[0]) * values[0];
        }
        for (int i = 1; i < n; i++) { // @step:loop_i
            for (int j = 0; j <= bagWeight; j++) { // @step:loop_j
                if (j < weights[i]) { // @step:cond
                    dp[i][j] = dp[i - 1][j];
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - weights[i]] + values[i]); // @step:transfer_max
                }
            }
        }
        return dp[n - 1][bagWeight]; // @step:return
    }
}`;
    }
    return `class Solution {
    public int completeKnapsack(int[] weights, int[] values, int bagWeight) { // @step:entry
        int[] dp = new int[bagWeight + 1]; // @step:init
        for (int i = 0; i < weights.length; i++) { // @step:loop_i
            for (int j = weights[i]; j <= bagWeight; j++) { // @step:loop_j
                dp[j] = Math.max(dp[j], dp[j - weights[i]] + values[i]); // @step:transfer
            }
        }
        return dp[bagWeight]; // @step:return
    }
}`;
  }

  private static getCoinChangeIITemplate(stage: string): string {
    if (stage === 'stage-1') {
      return `class Solution {
    public int change(int amount, int[] coins) { // @step:entry
        return dfs(coins, 0, amount); // @step:dfs_start @step:return
    }
    private int dfs(int[] coins, int i, int curTarget) { // @step:dfs_entry
        if (curTarget == 0) return 1; // @step:boundary
        if (i >= coins.length || curTarget < 0) return 0; // @step:boundary
        int notTake = dfs(coins, i + 1, curTarget); // @step:branch_not_take
        int take = 0;
        if (curTarget >= coins[i]) { // @step:cond_take
            take = dfs(coins, i, curTarget - coins[i]); // @step:branch_take
        }
        return notTake + take; // @step:combine
    }
}`;
    }
    if (stage === 'stage-2') {
      return `class Solution {
    public int change(int amount, int[] coins) { // @step:entry
        int n = coins.length;
        int[][] memo = new int[n][amount + 1];
        for (int[] row : memo) Arrays.fill(row, -1);
        return dfs(coins, 0, amount, memo); // @step:dfs_start @step:return
    }
    private int dfs(int[] coins, int i, int curTarget, int[][] memo) { // @step:dfs_entry
        if (curTarget == 0) return 1; // @step:boundary
        if (i >= coins.length || curTarget < 0) return 0; // @step:boundary
        if (memo[i][curTarget] != -1) return memo[i][curTarget]; // @step:cache_hit
        int notTake = dfs(coins, i + 1, curTarget, memo); // @step:branch_not_take
        int take = 0;
        if (curTarget >= coins[i]) { // @step:cond_take
            take = dfs(coins, i, curTarget - coins[i], memo); // @step:branch_take
        }
        return memo[i][curTarget] = notTake + take; // @step:combine
    }
}`;
    }
    if (stage === 'stage-3') {
      return `class Solution {
    public int change(int amount, int[] coins) { // @step:entry
        int n = coins.length;
        int[][] dp = new int[n][amount + 1]; // @step:init
        for (int j = 0; j <= amount; j++) { // @step:init_row
            if (j % coins[0] == 0) dp[0][j] = 1;
        }
        for (int i = 1; i < n; i++) { // @step:loop_i
            for (int j = 0; j <= amount; j++) { // @step:loop_j
                if (j < coins[i]) { // @step:cond
                    dp[i][j] = dp[i - 1][j];
                } else {
                    dp[i][j] = dp[i - 1][j] + dp[i][j - coins[i]]; // @step:transfer_sum
                }
            }
        }
        return dp[n - 1][amount]; // @step:return
    }
}`;
    }
    return `class Solution {
    public int change(int amount, int[] coins) { // @step:entry
        int[] dp = new int[amount + 1]; // @step:init
        dp[0] = 1; // @step:init
        for (int i = 0; i < coins.length; i++) { // @step:loop_i
            for (int j = coins[i]; j <= amount; j++) { // @step:loop_j
                dp[j] += dp[j - coins[i]]; // @step:transfer
            }
        }
        return dp[amount]; // @step:return
    }
}`;
  }

  private static getCoinChangeTemplate(stage: string): string {
    if (stage === 'stage-1') {
      return `class Solution {
    public int coinChange(int[] coins, int amount) { // @step:entry
        int ans = dfs(coins, 0, amount); // @step:dfs_start
        return ans >= 1000000 ? -1 : ans; // @step:return
    }
    private int dfs(int[] coins, int i, int curTarget) { // @step:dfs_entry
        if (curTarget == 0) return 0; // @step:boundary
        if (i >= coins.length || curTarget < 0) return 1000000; // @step:boundary
        int notTake = dfs(coins, i + 1, curTarget); // @step:branch_not_take
        int take = 1000000;
        if (curTarget >= coins[i]) { // @step:cond_take
            take = 1 + dfs(coins, i, curTarget - coins[i]); // @step:branch_take
        }
        return Math.min(notTake, take); // @step:combine
    }
}`;
    }
    if (stage === 'stage-2') {
      return `class Solution {
    public int coinChange(int[] coins, int amount) { // @step:entry
        int n = coins.length;
        int[][] memo = new int[n][amount + 1];
        for (int[] row : memo) Arrays.fill(row, -1);
        int ans = dfs(coins, 0, amount, memo); // @step:dfs_start
        return ans >= 1000000 ? -1 : ans; // @step:return
    }
    private int dfs(int[] coins, int i, int curTarget, int[][] memo) { // @step:dfs_entry
        if (curTarget == 0) return 0; // @step:boundary
        if (i >= coins.length || curTarget < 0) return 1000000; // @step:boundary
        if (memo[i][curTarget] != -1) return memo[i][curTarget]; // @step:cache_hit
        int notTake = dfs(coins, i + 1, curTarget, memo); // @step:branch_not_take
        int take = 1000000;
        if (curTarget >= coins[i]) { // @step:cond_take
            take = 1 + dfs(coins, i, curTarget - coins[i], memo); // @step:branch_take
        }
        return memo[i][curTarget] = Math.min(notTake, take); // @step:combine
    }
}`;
    }
    if (stage === 'stage-3') {
      return `class Solution {
    public int coinChange(int[] coins, int amount) { // @step:entry
        int n = coins.length;
        int[][] dp = new int[n][amount + 1]; // @step:init
        for (int[] row : dp) Arrays.fill(row, 1000000);
        for (int j = 0; j <= amount; j++) { // @step:init_row
            if (j % coins[0] == 0) dp[0][j] = j / coins[0];
        }
        for (int i = 1; i < n; i++) { // @step:loop_i
            for (int j = 0; j <= amount; j++) { // @step:loop_j
                if (j < coins[i]) { // @step:cond
                    dp[i][j] = dp[i - 1][j];
                } else {
                    dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - coins[i]] + 1); // @step:transfer_min
                }
            }
        }
        return dp[n - 1][amount] >= 1000000 ? -1 : dp[n - 1][amount]; // @step:return
    }
}`;
    }
    return `class Solution {
    public int coinChange(int[] coins, int amount) { // @step:entry
        int[] dp = new int[amount + 1]; // @step:init
        Arrays.fill(dp, 1000000);
        dp[0] = 0; // @step:init
        for (int i = 0; i < coins.length; i++) { // @step:loop_i
            for (int j = coins[i]; j <= amount; j++) { // @step:loop_j
                dp[j] = Math.min(dp[j], dp[j - coins[i]] + 1); // @step:transfer
            }
        }
        return dp[amount] >= 1000000 ? -1 : dp[amount]; // @step:return
    }
}`;
  }

  private static getPerfectSquaresTemplate(stage: string): string {
    if (stage === 'stage-1') {
      return `class Solution {
    public int numSquares(int n) { // @step:entry
        int m = (int) Math.sqrt(n);
        int[] squares = new int[m];
        for (int i = 1; i <= m; i++) squares[i - 1] = i * i;
        int ans = dfs(squares, 0, n); // @step:dfs_start
        return ans >= 1000000 ? -1 : ans; // @step:return
    }
    private int dfs(int[] squares, int i, int curTarget) { // @step:dfs_entry
        if (curTarget == 0) return 0; // @step:boundary
        if (i >= squares.length || curTarget < 0) return 1000000; // @step:boundary
        int notTake = dfs(squares, i + 1, curTarget); // @step:branch_not_take
        int take = 1000000;
        if (curTarget >= squares[i]) { // @step:cond_take
            take = 1 + dfs(squares, i, curTarget - squares[i]); // @step:branch_take
        }
        return Math.min(notTake, take); // @step:combine
    }
}`;
    }
    if (stage === 'stage-2') {
      return `class Solution {
    public int numSquares(int n) { // @step:entry
        int m = (int) Math.sqrt(n);
        int[] squares = new int[m];
        for (int i = 1; i <= m; i++) squares[i - 1] = i * i;
        int[][] memo = new int[m][n + 1];
        for (int[] row : memo) Arrays.fill(row, -1);
        int ans = dfs(squares, 0, n, memo); // @step:dfs_start
        return ans >= 1000000 ? -1 : ans; // @step:return
    }
    private int dfs(int[] squares, int i, int curTarget, int[][] memo) { // @step:dfs_entry
        if (curTarget == 0) return 0; // @step:boundary
        if (i >= squares.length || curTarget < 0) return 1000000; // @step:boundary
        if (memo[i][curTarget] != -1) return memo[i][curTarget]; // @step:cache_hit
        int notTake = dfs(squares, i + 1, curTarget, memo); // @step:branch_not_take
        int take = 1000000;
        if (curTarget >= squares[i]) { // @step:cond_take
            take = 1 + dfs(squares, i, curTarget - squares[i], memo); // @step:branch_take
        }
        return memo[i][curTarget] = Math.min(notTake, take); // @step:combine
    }
}`;
    }
    if (stage === 'stage-3') {
      return `class Solution {
    public int numSquares(int n) { // @step:entry
        int m = (int) Math.sqrt(n);
        int[] squares = new int[m];
        for (int i = 1; i <= m; i++) squares[i - 1] = i * i;
        int[][] dp = new int[m][n + 1]; // @step:init
        for (int[] row : dp) Arrays.fill(row, 1000000);
        for (int j = 0; j <= n; j++) { // @step:init_row
            if (j % squares[0] == 0) dp[0][j] = j / squares[0];
        }
        for (int i = 1; i < m; i++) { // @step:loop_i
            for (int j = 0; j <= n; j++) { // @step:loop_j
                if (j < squares[i]) { // @step:cond
                    dp[i][j] = dp[i - 1][j];
                } else {
                    dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - squares[i]] + 1); // @step:transfer_min
                }
            }
        }
        return dp[m - 1][n]; // @step:return
    }
}`;
    }
    return `class Solution {
    public int numSquares(int n) { // @step:entry
        int[] dp = new int[n + 1]; // @step:init
        Arrays.fill(dp, 1000000);
        dp[0] = 0; // @step:init
        for (int i = 1; i * i <= n; i++) { // @step:loop_i
            int sq = i * i;
            for (int j = sq; j <= n; j++) { // @step:loop_j
                dp[j] = Math.min(dp[j], dp[j - sq] + 1); // @step:transfer
            }
        }
        return dp[n]; // @step:return
    }
}`;
  }

  private static getCombinationSumIVTemplate(stage: string): string {
    if (stage === 'stage-1') {
      return `class Solution {
    public int combinationSum4(int[] nums, int target) { // @step:entry
        return dfs(nums, target); // @step:dfs_start
    }
    private int dfs(int[] nums, int remain) { // @step:dfs_start
        if (remain == 0) return 1; // @step:base_match
        if (remain < 0) return 0;  // @step:base_overflow
        int res = 0;
        for (int num : nums) { // @step:branch_take
            if (remain >= num) {
                res += dfs(nums, remain - num); // @step:combine
            }
        }
        return res; // @step:return
    }
}`;
    }
    if (stage === 'stage-2') {
      return `class Solution {
    public int combinationSum4(int[] nums, int target) { // @step:entry
        int[] memo = new int[target + 1];
        Arrays.fill(memo, -1);
        return dfs(nums, target, memo); // @step:dfs_start
    }
    private int dfs(int[] nums, int remain, int[] memo) { // @step:dfs_start
        if (remain == 0) return 1; // @step:base_match
        if (remain < 0) return 0;  // @step:base_overflow
        if (memo[remain] != -1) return memo[remain]; // @step:cache_hit
        int res = 0;
        for (int num : nums) { // @step:branch_take
            if (remain >= num) {
                res += dfs(nums, remain - num, memo); // @step:combine
            }
        }
        memo[remain] = res;
        return res; // @step:return
    }
}`;
    }
    if (stage === 'stage-3') {
      return `class Solution {
    public int combinationSum4(int[] nums, int target) {
        int[] dp = new int[target + 1]; // @step:init
        dp[0] = 1; // @step:init
        for (int i = 1; i <= target; i++) { // @step:outer_loop
            for (int j = 0; j < nums.length; j++) { // @step:inner_loop
                if (i >= nums[j]) {
                    dp[i] += dp[i - nums[j]]; // @step:transfer
                }
            }
        }
        return dp[target]; // @step:return
    }
}`;
    }
    return `class Solution {
    public int combinationSum4(int[] nums, int target) {
        int[] dp = new int[target + 1]; // @step:init
        dp[0] = 1; // @step:init
        for (int i = 1; i <= target; i++) { // @step:outer_loop
            for (int x : nums) { // @step:inner_loop
                if (i >= x) {
                    dp[i] += dp[i - x]; // @step:transfer
                }
            }
        }
        return dp[target]; // @step:return
    }
}`;
  }

  private static getLongestRepeatedSubarrayTemplate(stage: string): string {
    if (stage === 'stage-1') {
      return `class Solution {
    public int findLength(int[] nums1, int[] nums2) {
        int maxLen = 0;
        for (int i = 0; i < nums1.length; i++) { // @step:entry
            for (int j = 0; j < nums2.length; j++) {
                maxLen = Math.max(maxLen, dfs(nums1, nums2, i, j)); // @step:dfs_call
            }
        }
        return maxLen; // @step:return
    }
    private int dfs(int[] A, int[] B, int i, int j) { // @step:dfs_start
        if (i >= A.length || j >= B.length || A[i] != B[j]) return 0; // @step:base_diff
        return 1 + dfs(A, B, i + 1, j + 1); // @step:combine
    }
}`;
    }
    if (stage === 'stage-2') {
      return `class Solution {
    public int findLength(int[] nums1, int[] nums2) {
        int maxLen = 0;
        int[][] memo = new int[nums1.length][nums2.length];
        for (int[] row : memo) Arrays.fill(row, -1);
        for (int i = 0; i < nums1.length; i++) {
            for (int j = 0; j < nums2.length; j++) {
                maxLen = Math.max(maxLen, dfs(nums1, nums2, i, j, memo)); // @step:dfs_call
            }
        }
        return maxLen; // @step:return
    }
    private int dfs(int[] A, int[] B, int i, int j, int[][] memo) {
        if (i >= A.length || j >= B.length || A[i] != B[j]) return 0;
        if (memo[i][j] != -1) return memo[i][j]; // @step:cache_hit
        memo[i][j] = 1 + dfs(A, B, i + 1, j + 1, memo); // @step:combine
        return memo[i][j];
    }
}`;
    }
    if (stage === 'stage-3') {
      return `class Solution {
    public int findLength(int[] nums1, int[] nums2) {
        int m = nums1.length, n = nums2.length;
        int[][] dp = new int[m + 1][n + 1]; // @step:init
        int maxLen = 0;
        for (int i = 1; i <= m; i++) { // @step:loop_i
            for (int j = 1; j <= n; j++) { // @step:loop_j
                if (nums1[i - 1] == nums2[j - 1]) { // @step:check_match
                    dp[i][j] = dp[i - 1][j - 1] + 1; // @step:transfer
                    maxLen = Math.max(maxLen, dp[i][j]); // @step:update_max
                }
            }
        }
        return maxLen; // @step:return
    }
}`;
    }
    return `class Solution {
    public int findLength(int[] nums1, int[] nums2) {
        int m = nums1.length, n = nums2.length;
        int[] dp = new int[n + 1]; // @step:init
        int maxLen = 0;
        for (int i = 1; i <= m; i++) {
            for (int j = n; j >= 1; j--) { // @step:inner_loop
                if (nums1[i - 1] == nums2[j - 1]) {
                    dp[j] = dp[j - 1] + 1; // @step:transfer
                    maxLen = Math.max(maxLen, dp[j]);
                } else {
                    dp[j] = 0; // @step:reset
                }
            }
        }
        return maxLen; // @step:return
    }
}`;
  }

  private static getMultipleKnapsackTemplate(stage: string): string {
    if (stage === 'stage-1') {
      return `class Solution {
    public int multipleKnapsack(int[] weights, int[] values, int[] nums, int bagWeight) { // @step:entry
        return dfs(weights, values, nums, 0, bagWeight); // @step:dfs_start @step:return
    }
    private int dfs(int[] weights, int[] values, int[] nums, int i, int w) { // @step:dfs_entry
        if (i >= weights.length || w <= 0) return 0; // @step:boundary
        int maxVal = 0;
        for (int k = 0; k <= nums[i] && k * weights[i] <= w; k++) { // @step:loop_count
            int val = k * values[i] + dfs(weights, values, nums, i + 1, w - k * weights[i]); // @step:branch_take
            maxVal = Math.max(maxVal, val); // @step:combine
        }
        return maxVal; // @step:return
    }
}`;
    }
    if (stage === 'stage-2') {
      return `class Solution {
    public int multipleKnapsack(int[] weights, int[] values, int[] nums, int bagWeight) { // @step:entry
        int n = weights.length;
        int[][] memo = new int[n][bagWeight + 1];
        for (int[] row : memo) Arrays.fill(row, -1);
        return dfs(weights, values, nums, 0, bagWeight, memo); // @step:dfs_start @step:return
    }
    private int dfs(int[] weights, int[] values, int[] nums, int i, int w, int[][] memo) { // @step:dfs_entry
        if (i >= weights.length || w <= 0) return 0; // @step:boundary
        if (memo[i][w] != -1) return memo[i][w]; // @step:cache_hit
        int maxVal = 0;
        for (int k = 0; k <= nums[i] && k * weights[i] <= w; k++) { // @step:loop_count
            int val = k * values[i] + dfs(weights, values, nums, i + 1, w - k * weights[i], memo); // @step:branch_take
            maxVal = Math.max(maxVal, val); // @step:combine
        }
        return memo[i][w] = maxVal; // @step:return
    }
}`;
    }
    if (stage === 'stage-3') {
      return `class Solution {
    public int multipleKnapsack(int[] weights, int[] values, int[] nums, int bagWeight) { // @step:entry
        int n = weights.length;
        int[][] dp = new int[n][bagWeight + 1]; // @step:init
        for (int j = 0; j <= bagWeight; j++) { // @step:init_row
            int k = Math.min(nums[0], j / weights[0]);
            dp[0][j] = k * values[0];
        }
        for (int i = 1; i < n; i++) { // @step:loop_i
            for (int j = 0; j <= bagWeight; j++) { // @step:loop_j
                dp[i][j] = dp[i - 1][j]; // @step:cond
                for (int k = 1; k <= nums[i] && k * weights[i] <= j; k++) { // @step:loop_count
                    dp[i][j] = Math.max(dp[i][j], dp[i - 1][j - k * weights[i]] + k * values[i]); // @step:transfer
                }
            }
        }
        return dp[n - 1][bagWeight]; // @step:return
    }
}`;
    }
    return `class Solution {
    public int multipleKnapsack(int[] weights, int[] values, int[] nums, int bagWeight) { // @step:entry
        int[] dp = new int[bagWeight + 1]; // @step:init
        for (int i = 0; i < weights.length; i++) { // @step:loop_i
            for (int j = bagWeight; j >= weights[i]; j--) { // @step:loop_j
                for (int k = 1; k <= nums[i] && k * weights[i] <= j; k++) { // @step:loop_count
                    dp[j] = Math.max(dp[j], dp[j - k * weights[i]] + k * values[i]); // @step:transfer
                }
            }
        }
        return dp[bagWeight]; // @step:return
    }
}`;
  }

  private static getOnesAndZeroesTemplate(stage: string): string {
    if (stage === 'stage-1') {
      return `class Solution {
    public int findMaxForm(String[] strs, int m, int n) { // @step:entry
        return dfs(strs, 0, m, n); // @step:dfs_start @step:return
    }
    private int dfs(String[] strs, int i, int zeros, int ones) { // @step:dfs_entry
        if (i >= strs.length) return 0; // @step:boundary
        int notTake = dfs(strs, i + 1, zeros, ones); // @step:branch_not_take
        int take = 0;
        int[] cost = count(strs[i]); // @step:count
        if (zeros >= cost[0] && ones >= cost[1]) { // @step:cond_take
            take = 1 + dfs(strs, i + 1, zeros - cost[0], ones - cost[1]); // @step:branch_take
        }
        return Math.max(notTake, take); // @step:combine @step:return
    }
    private int[] count(String s) {
        int[] c = new int[2];
        for (char ch : s.toCharArray()) c[ch - '0']++;
        return c;
    }
}`;
    }
    if (stage === 'stage-2') {
      return `class Solution {
    public int findMaxForm(String[] strs, int m, int n) { // @step:entry
        int[][][] memo = new int[strs.length][m + 1][n + 1];
        for (int[][] mat : memo) {
            for (int[] row : mat) Arrays.fill(row, -1);
        }
        return dfs(strs, 0, m, n, memo); // @step:dfs_start @step:return
    }
    private int dfs(String[] strs, int i, int zeros, int ones, int[][][] memo) { // @step:dfs_entry
        if (i >= strs.length) return 0; // @step:boundary
        if (memo[i][zeros][ones] != -1) return memo[i][zeros][ones]; // @step:cache_hit
        int notTake = dfs(strs, i + 1, zeros, ones, memo); // @step:branch_not_take
        int take = 0;
        int[] cost = count(strs[i]); // @step:count
        if (zeros >= cost[0] && ones >= cost[1]) { // @step:cond_take
            take = 1 + dfs(strs, i + 1, zeros - cost[0], ones - cost[1], memo); // @step:branch_take
        }
        return memo[i][zeros][ones] = Math.max(notTake, take); // @step:combine @step:return
    }
    private int[] count(String s) {
        int[] c = new int[2];
        for (char ch : s.toCharArray()) c[ch - '0']++;
        return c;
    }
}`;
    }
    if (stage === 'stage-3') {
      return `class Solution {
    public int findMaxForm(String[] strs, int m, int n) { // @step:entry
        int len = strs.length;
        int[][][] dp = new int[len + 1][m + 1][n + 1]; // @step:init
        for (int i = 1; i <= len; i++) { // @step:loop_i
            int[] cost = count(strs[i - 1]); // @step:count
            for (int z = 0; z <= m; z++) { // @step:loop_zeros
                for (int o = 0; o <= n; o++) { // @step:loop_ones
                    dp[i][z][o] = dp[i - 1][z][o]; // @step:cond_skip
                    if (z >= cost[0] && o >= cost[1]) { // @step:cond_take
                        dp[i][z][o] = Math.max(dp[i][z][o], dp[i - 1][z - cost[0]][o - cost[1]] + 1); // @step:transfer
                    }
                }
            }
        }
        return dp[len][m][n]; // @step:return
    }
    private int[] count(String s) {
        int[] c = new int[2];
        for (char ch : s.toCharArray()) c[ch - '0']++;
        return c;
    }
}`;
    }
    return `class Solution {
    public int findMaxForm(String[] strs, int m, int n) { // @step:entry
        int[][] dp = new int[m + 1][n + 1]; // @step:init
        for (String s : strs) { // @step:loop_i
            int[] cost = count(s); // @step:count
            for (int z = m; z >= cost[0]; z--) { // @step:loop_zeros
                for (int o = n; o >= cost[1]; o--) { // @step:loop_ones
                    dp[z][o] = Math.max(dp[z][o], dp[z - cost[0]][o - cost[1]] + 1); // @step:transfer
                }
            }
        }
        return dp[m][n]; // @step:return
    }
    private int[] count(String s) {
        int[] c = new int[2];
        for (char ch : s.toCharArray()) c[ch - '0']++;
        return c;
    }
}`;
  }

  private static getWordBreakTemplate(stage: string): string {
    if (stage === 'stage-1') {
      return `class Solution {
    public boolean wordBreak(String s, List<String> wordDict) { // @step:entry
        Set<String> set = new HashSet<>(wordDict); // @step:init_set
        return dfs(s, set, 0); // @step:dfs_start @step:return
    }
    private boolean dfs(String s, Set<String> set, int start) { // @step:dfs_entry
        if (start == s.length()) return true; // @step:boundary
        for (int end = start + 1; end <= s.length(); end++) { // @step:loop_end
            String prefix = s.substring(start, end); // @step:substring
            if (set.contains(prefix)) { // @step:cond_match
                boolean match = dfs(s, set, end); // @step:branch_take
                if (match) return true; // @step:branch_return @step:return
            }
        }
        return false; // @step:fail_return @step:return
    }
}`;
    }
    if (stage === 'stage-2') {
      return `class Solution {
    public boolean wordBreak(String s, List<String> wordDict) { // @step:entry
        Set<String> set = new HashSet<>(wordDict); // @step:init_set
        int[] memo = new int[s.length() + 1]; // @step:init_memo
        return dfs(s, set, 0, memo); // @step:dfs_start @step:return
    }
    private boolean dfs(String s, Set<String> set, int start, int[] memo) { // @step:dfs_entry
        if (start == s.length()) return true; // @step:boundary
        if (memo[start] != 0) return memo[start] == 1; // @step:cache_hit
        for (int end = start + 1; end <= s.length(); end++) { // @step:loop_end
            String prefix = s.substring(start, end); // @step:substring
            if (set.contains(prefix)) { // @step:cond_match
                boolean match = dfs(s, set, end, memo); // @step:branch_take
                if (match) {
                    memo[start] = 1; // @step:cache_set
                    return true; // @step:branch_return @step:return
                }
            }
        }
        memo[start] = -1; // @step:cache_set
        return false; // @step:fail_return @step:return
    }
}`;
    }
    if (stage === 'stage-3') {
      return `class Solution {
    public boolean wordBreak(String s, List<String> wordDict) { // @step:entry
        Set<String> wordSet = new HashSet<>(wordDict); // @step:init_set
        int n = s.length();
        boolean[] dp = new boolean[n + 1]; // @step:init
        dp[0] = true; // @step:base
        for (int i = 1; i <= n; i++) { // @step:loop_i
            for (int j = 0; j < i; j++) { // @step:loop_j
                if (dp[j] && wordSet.contains(s.substring(j, i))) { // @step:cond
                    dp[i] = true; // @step:transfer
                    break; // @step:break
                }
            }
        }
        return dp[n]; // @step:return
    }
}`;
    }
    return `class Solution {
    public boolean wordBreak(String s, List<String> wordDict) { // @step:entry
        Set<String> wordSet = new HashSet<>(wordDict); // @step:init_set
        int n = s.length();
        int maxLen = 0;
        for (String w : wordDict) maxLen = Math.max(maxLen, w.length()); // @step:calc_maxlen
        boolean[] dp = new boolean[n + 1]; // @step:init
        dp[0] = true; // @step:base
        for (int i = 1; i <= n; i++) { // @step:loop_i
            for (int j = Math.max(0, i - maxLen); j < i; j++) { // @step:loop_j
                if (dp[j] && wordSet.contains(s.substring(j, i))) { // @step:cond
                    dp[i] = true; // @step:transfer
                    break; // @step:break
                }
            }
        }
        return dp[n]; // @step:return
    }
}`;
  }

  private static getMaxPathSumTemplate(stage: string): string {
    return `class Solution {
    private int maxSum = Integer.MIN_VALUE;
    public int maxPathSum(TreeNode root) { // @step:entry
        maxGain(root); // @step:init
        return maxSum; // @step:return
    }
    private int maxGain(TreeNode node) { // @step:dfs_entry
        if (node == null) return 0; // @step:boundary
        int leftGain = Math.max(maxGain(node.left), 0); // @step:branch_left
        int rightGain = Math.max(maxGain(node.right), 0); // @step:branch_right
        int currentPathSum = node.val + leftGain + rightGain; // @step:transfer
        maxSum = Math.max(maxSum, currentPathSum); // @step:update_max
        return node.val + Math.max(leftGain, rightGain); // @step:combine
    }
}`;
  }

  private static getTreeDiameterTemplate(stage: string): string {
    return `class Solution {
    private int maxDiameter = 0;
    public int diameterOfBinaryTree(TreeNode root) { // @step:entry
        maxDepth(root); // @step:init
        return maxDiameter; // @step:return
    }
    private int maxDepth(TreeNode node) { // @step:dfs_entry
        if (node == null) return 0; // @step:boundary
        int left = maxDepth(node.left); // @step:branch_left
        int right = maxDepth(node.right); // @step:branch_right
        maxDiameter = Math.max(maxDiameter, left + right); // @step:transfer
        return Math.max(left, right) + 1; // @step:combine
    }
}`;
  }

  private static getBinaryTreeCamerasTemplate(stage: string): string {
    return `class Solution {
    private int cameras = 0;
    public int minCameraCover(TreeNode root) { // @step:entry
        if (dfs(root) == 0) { // @step:init
            cameras++; // @step:root_camera
        }
        return cameras; // @step:return
    }
    // 0: 无覆盖, 1: 有覆盖无相机, 2: 安放相机
    private int dfs(TreeNode node) { // @step:dfs_entry
        if (node == null) return 1; // @step:boundary
        int left = dfs(node.left); // @step:branch_left
        int right = dfs(node.right); // @step:branch_right
        if (left == 0 || right == 0) { // @step:cond_camera
            cameras++; // @step:add_camera
            return 2; // @step:return_camera
        }
        if (left == 2 || right == 2) return 1; // @step:return_covered
        return 0; // @step:return_uncovered
    }
}`;
  }

  private static getPartyWithoutBossTemplate(stage: string): string {
    return `class Solution {
    public int maxHappy(int[][] edges, int[] happy) { // @step:entry
        int root = findRoot(edges, happy.length); // @step:find_root
        int[] res = dfs(root); // @step:init
        return Math.max(res[0], res[1]); // @step:return
    }
    // 返回 [notComeHappy, comeHappy]
    private int[] dfs(int u) { // @step:dfs_entry
        int notCome = 0; // @step:init_not_come
        int come = happy[u]; // @step:init_come
        for (int next : adj[u]) { // @step:loop_child
            int[] sub = dfs(next); // @step:branch_call
            notCome += Math.max(sub[0], sub[1]); // @step:accum_not_come
            come += sub[0]; // @step:accum_come
        }
        return new int[]{notCome, come}; // @step:combine
    }
}`;
  }

  private static getMaxDistanceInTreeTemplate(stage: string): string {
    return `class Solution {
    public static class Info {
        public int maxDistance;
        public int height;
        public Info(int dis, int h) {
            maxDistance = dis;
            height = h;
        }
    }
    public int maxDistance(TreeNode root) { // @step:entry
        Info info = process(root); // @step:init
        return info.maxDistance; // @step:return
    }
    private Info process(TreeNode node) { // @step:dfs_entry
        if (node == null) return new Info(0, 0); // @step:boundary
        Info left = process(node.left); // @step:branch_left
        Info right = process(node.right); // @step:branch_right
        int height = Math.max(left.height, right.height) + 1; // @step:calc_height
        int crossDist = left.height + right.height; // @step:calc_cross
        int maxDist = Math.max(crossDist, Math.max(left.maxDistance, right.maxDistance)); // @step:transfer
        return new Info(maxDist, height); // @step:combine
    }
}`;
  }

  private static getLargestBstSubtreeTemplate(stage: string): string {
    return `class Solution {
    public static class Info {
        public int maxBSTSize;
        public int size;
        public int min;
        public int max;
        public Info(int m, int s, int mi, int ma) {
            maxBSTSize = m;
            size = s;
            min = mi;
            max = ma;
        }
    }
    public int largestBSTSubtree(TreeNode root) { // @step:entry
        Info info = process(root); // @step:init
        return info != null ? info.maxBSTSize : 0; // @step:return
    }
    private Info process(TreeNode node) { // @step:dfs_entry
        if (node == null) return null; // @step:boundary
        Info left = process(node.left); // @step:branch_left
        Info right = process(node.right); // @step:branch_right
        int min = node.val, max = node.val, size = 1; // @step:init_node
        if (left != null) {
            min = Math.min(min, left.min);
            max = Math.max(max, left.max);
            size += left.size;
        }
        if (right != null) {
            min = Math.min(min, right.min);
            max = Math.max(max, right.max);
            size += right.size;
        }
        boolean leftBST = left == null || (left.maxBSTSize == left.size && left.max < node.val); // @step:cond_bst
        boolean rightBST = right == null || (right.maxBSTSize == right.size && right.min > node.val);
        int maxBSTSize = 0;
        if (leftBST && rightBST) {
            maxBSTSize = (left == null ? 0 : left.size) + (right == null ? 0 : right.size) + 1; // @step:transfer_bst
        } else {
            maxBSTSize = Math.max(left == null ? 0 : left.maxBSTSize, right == null ? 0 : right.maxBSTSize); // @step:transfer_not_bst
        }
        return new Info(maxBSTSize, size, min, max); // @step:combine
    }
}`;
  }

  private static getCanIWinTemplate(stage: string): string {
    return `class Solution {
    public boolean canIWin(int n, int m) { // @step:entry
        if (m <= 0) return true; // @step:guard_win
        if (n * (n + 1) / 2 < m) return false; // @step:guard_lose
        int[] dp = new int[1 << (n + 1)]; // @step:init
        return dfs(0, m, n, dp); // @step:start_dfs
    }
    // status: 二进制第 i 位为 1 表示数字 i 已被选用
    private boolean dfs(int status, int rest, int n, int[] dp) { // @step:dfs_entry
        if (dp[status] != 0) return dp[status] == 1; // @step:cache_hit
        boolean ans = false; // @step:init_ans
        for (int i = 1; i <= n; i++) { // @step:loop_num
            if ((status & (1 << i)) == 0) { // @step:cond_available
                if (i >= rest || !dfs(status | (1 << i), rest - i, n, dp)) { // @step:branch_call
                    ans = true; // @step:mark_win
                    break; // @step:break
                }
            }
        }
        dp[status] = ans ? 1 : -1; // @step:record
        return ans; // @step:return
    }
}`;
  }

  private static getMatchsticksToSquareTemplate(stage: string): string {
    return `class Solution {
    public boolean makesquare(int[] matchsticks) { // @step:entry
        int sum = 0;
        for (int len : matchsticks) sum += len; // @step:calc_sum
        if (sum % 4 != 0) return false; // @step:guard_sum
        int side = sum / 4; // @step:calc_side
        Arrays.sort(matchsticks); // @step:sort
        int[] dp = new int[1 << matchsticks.length]; // @step:init
        return dfs(0, 0, side, matchsticks, dp); // @step:start_dfs
    }
    private boolean dfs(int status, int cur, int side, int[] nums, int[] dp) { // @step:dfs_entry
        if (status == (1 << nums.length) - 1) return true; // @step:boundary
        if (dp[status] != 0) return dp[status] == 1; // @step:cache_hit
        boolean ans = false; // @step:init_ans
        for (int i = nums.length - 1; i >= 0; i--) { // @step:loop_match
            if ((status & (1 << i)) == 0 && cur + nums[i] <= side) { // @step:cond_fit
                int nextCur = (cur + nums[i]) % side; // @step:calc_next
                if (dfs(status | (1 << i), nextCur, side, nums, dp)) { // @step:branch_call
                    ans = true; // @step:mark_win
                    break; // @step:break
                }
            }
        }
        dp[status] = ans ? 1 : -1; // @step:record
        return ans; // @step:return
    }
}`;
  }

  private static getPartitionKEqualSubsetsTemplate(stage: string): string {
    return `class Solution {
    public boolean canPartitionKSubsets(int[] nums, int k) { // @step:entry
        int sum = 0;
        for (int v : nums) sum += v; // @step:calc_sum
        if (sum % k != 0) return false; // @step:guard_sum
        int target = sum / k; // @step:calc_target
        Arrays.sort(nums); // @step:sort
        int[] dp = new int[1 << nums.length]; // @step:init
        return dfs(0, 0, target, nums, dp); // @step:start_dfs
    }
    private boolean dfs(int status, int cur, int target, int[] nums, int[] dp) { // @step:dfs_entry
        if (status == (1 << nums.length) - 1) return true; // @step:boundary
        if (dp[status] != 0) return dp[status] == 1; // @step:cache_hit
        boolean ans = false; // @step:init_ans
        for (int i = nums.length - 1; i >= 0; i--) { // @step:loop_num
            if ((status & (1 << i)) == 0 && cur + nums[i] <= target) { // @step:cond_fit
                int nextCur = (cur + nums[i]) % target; // @step:calc_next
                if (dfs(status | (1 << i), nextCur, target, nums, dp)) { // @step:branch_call
                    ans = true; // @step:mark_win
                    break; // @step:break
                }
            }
        }
        dp[status] = ans ? 1 : -1; // @step:record
        return ans; // @step:return
    }
}`;
  }

  private static getTspBitmaskDpTemplate(stage: string): string {
    return `class Solution {
    public int tsp(int[][] dist) { // @step:entry
        int n = dist.length; // @step:init_n
        int full = (1 << n) - 1; // @step:init_full
        int[][] dp = new int[1 << n][n]; // @step:init_dp
        for (int[] row : dp) Arrays.fill(row, Integer.MAX_VALUE / 2); // @step:fill_inf
        dp[1][0] = 0; // @step:base
        for (int s = 1; s <= full; s++) { // @step:loop_status
            for (int i = 0; i < n; i++) { // @step:loop_curr
                if ((s & (1 << i)) == 0 || dp[s][i] >= Integer.MAX_VALUE / 2) continue; // @step:cond_valid
                for (int j = 0; j < n; j++) { // @step:loop_next
                    if ((s & (1 << j)) == 0) { // @step:cond_not_visited
                        int nextS = s | (1 << j); // @step:calc_next_s
                        dp[nextS][j] = Math.min(dp[nextS][j], dp[s][i] + dist[i][j]); // @step:transfer
                    }
                }
            }
        }
        int ans = Integer.MAX_VALUE; // @step:init_ans
        for (int i = 1; i < n; i++) { // @step:loop_final
            ans = Math.min(ans, dp[full][i] + dist[i][0]); // @step:update_ans
        }
        return ans; // @step:return
    }
}`;
  }

  private static getNumberOfWaysWearHatsTemplate(stage: string): string {
    return `class Solution {
    public int numberWays(List<List<Integer>> hats) { // @step:entry
        int mod = 1000000007; // @step:init_mod
        int n = hats.size(); // @step:init_n
        int full = (1 << n) - 1; // @step:init_full
        List<Integer>[] hatToPersons = new ArrayList[41]; // @step:init_map
        for (int i = 1; i <= 40; i++) hatToPersons[i] = new ArrayList<>(); // @step:alloc_map
        for (int p = 0; p < n; p++) { // @step:loop_person
            for (int h : hats.get(p)) hatToPersons[h].add(p); // @step:fill_map
        }
        int[] dp = new int[1 << n]; // @step:init_dp
        dp[0] = 1; // @step:base
        for (int h = 1; h <= 40; h++) { // @step:loop_hat
            for (int s = full; s >= 0; s--) { // @step:loop_status
                if (dp[s] == 0) continue; // @step:cond_skip
                for (int p : hatToPersons[h]) { // @step:loop_p
                    if ((s & (1 << p)) == 0) { // @step:cond_available
                        int nextS = s | (1 << p); // @step:calc_next_s
                        dp[nextS] = (dp[nextS] + dp[s]) % mod; // @step:transfer
                    }
                }
            }
        }
        return dp[full]; // @step:return
    }
}`;
  }

  private static getOptimalAccountBalancingTemplate(stage: string): string {
    return `class Solution {
    public int minTransfers(int[][] transactions) { // @step:entry
        Map<Integer, Integer> map = new HashMap<>(); // @step:init_map
        for (int[] t : transactions) { // @step:loop_trans
            map.put(t[0], map.getOrDefault(t[0], 0) - t[2]); // @step:record_from
            map.put(t[1], map.getOrDefault(t[1], 0) + t[2]); // @step:record_to
        }
        List<Integer> list = new ArrayList<>(); // @step:init_list
        for (int d : map.values()) if (d != 0) list.add(d); // @step:filter_zero
        int m = list.size(); // @step:init_m
        if (m == 0) return 0; // @step:guard_zero
        int[] debts = new int[m]; // @step:alloc_debts
        for (int i = 0; i < m; i++) debts[i] = list.get(i); // @step:fill_debts
        int full = (1 << m) - 1; // @step:init_full
        int[] sum = new int[1 << m]; // @step:alloc_sum
        for (int s = 1; s <= full; s++) { // @step:loop_sum_s
            for (int i = 0; i < m; i++) { // @step:loop_sum_i
                if ((s & (1 << i)) != 0) { // @step:cond_sum_has
                    sum[s] = sum[s ^ (1 << i)] + debts[i]; // @step:calc_sum
                    break; // @step:break_sum
                }
            }
        }
        int[] dp = new int[1 << m]; // @step:alloc_dp
        for (int s = 1; s <= full; s++) { // @step:loop_dp_s
            for (int i = 0; i < m; i++) { // @step:loop_dp_i
                if ((s & (1 << i)) != 0) { // @step:cond_dp_has
                    dp[s] = Math.max(dp[s], dp[s ^ (1 << i)]); // @step:transfer_sub
                }
            }
            if (sum[s] == 0) { // @step:cond_zero_sum
                dp[s]++; // @step:increment_zero_subset
            }
        }
        return m - dp[full]; // @step:return
    }
}`;
  }

  private static getGoodSubsetsTemplate(stage: string): string {
    return `class Solution {
    public int numberOfGoodSubsets(int[] nums) { // @step:entry
        int mod = 1000000007; // @step:init_mod
        int[] primes = {2, 3, 5, 7, 11, 13, 17, 19, 23, 29}; // @step:init_primes
        int[] cnt = new int[31]; // @step:alloc_cnt
        for (int x : nums) cnt[x]++; // @step:count_freq
        int[] masks = new int[31]; // @step:alloc_masks
        for (int i = 2; i <= 30; i++) { // @step:loop_calc_mask
            int m = 0, x = i; // @step:init_x
            for (int j = 0; j < 10; j++) { // @step:loop_prime
                if (x % primes[j] == 0) { // @step:cond_div
                    x /= primes[j]; // @step:div_prime
                    if (x % primes[j] == 0) { m = -1; break; } // @step:check_sq
                    m |= (1 << j); // @step:set_bit
                }
            }
            masks[i] = m; // @step:save_mask
        }
        int[] dp = new int[1 << 10]; // @step:alloc_dp
        dp[0] = 1; // @step:base
        for (int i = 2; i <= 30; i++) { // @step:loop_num
            if (cnt[i] == 0 || masks[i] == -1) continue; // @step:cond_skip_num
            int m = masks[i]; // @step:get_mask
            for (int s = (1 << 10) - 1; s >= 0; s--) { // @step:loop_status
                if ((s & m) == 0 && dp[s] > 0) { // @step:cond_disjoint
                    dp[s | m] = (int)((dp[s | m] + 1L * dp[s] * cnt[i]) % mod); // @step:transfer
                }
            }
        }
        long ans = 0; // @step:init_ans
        for (int s = 1; s < (1 << 10); s++) ans = (ans + dp[s]) % mod; // @step:sum_ans
        for (int i = 0; i < cnt[1]; i++) ans = (ans * 2) % mod; // @step:mult_ones
        return (int)ans; // @step:return
    }
}`;
  }

  private static getDistributeRepeatingIntegersTemplate(stage: string): string {
    return `class Solution {
    public boolean canDistribute(int[] nums, int[] quantity) { // @step:entry
        Map<Integer, Integer> map = new HashMap<>(); // @step:init_map
        for (int x : nums) map.put(x, map.getOrDefault(x, 0) + 1); // @step:count_freq
        List<Integer> counts = new ArrayList<>(map.values()); // @step:get_counts
        int m = quantity.length; // @step:init_m
        int full = (1 << m) - 1; // @step:init_full
        int[] sum = new int[1 << m]; // @step:alloc_sum
        for (int s = 1; s <= full; s++) { // @step:loop_sum_s
            for (int i = 0; i < m; i++) { // @step:loop_sum_i
                if ((s & (1 << i)) != 0) { // @step:cond_sum_bit
                    sum[s] = sum[s ^ (1 << i)] + quantity[i]; // @step:calc_sum
                    break; // @step:break_sum
                }
            }
        }
        boolean[] dp = new boolean[1 << m]; // @step:alloc_dp
        dp[0] = true; // @step:base
        for (int c : counts) { // @step:loop_count
            for (int s = full; s > 0; s--) { // @step:loop_status
                for (int sub = s; sub > 0; sub = (sub - 1) & s) { // @step:loop_submask
                    if (sum[sub] <= c && dp[s ^ sub]) { // @step:cond_valid_sub
                        dp[s] = true; // @step:mark_achieved
                        break; // @step:break_submask
                    }
                }
            }
        }
        return dp[full]; // @step:return
    }
}`;
  }

  private static getPredictTheWinnerTemplate(stage: string): string {
    return `class Solution {
    public boolean predictTheWinner(int[] nums) { // @step:entry
        int n = nums.length; // @step:init_n
        if (n % 2 == 0) return true; // @step:guard_even
        int[][] dp = new int[n][n]; // @step:init_dp
        for (int i = 0; i < n; i++) dp[i][i] = nums[i]; // @step:init_base
        for (int len = 2; len <= n; len++) { // @step:loop_len
            for (int i = 0; i <= n - len; i++) { // @step:loop_i
                int j = i + len - 1; // @step:calc_j
                int chooseLeft = nums[i] - dp[i + 1][j]; // @step:branch_left
                int chooseRight = nums[j] - dp[i][j - 1]; // @step:branch_right
                dp[i][j] = Math.max(chooseLeft, chooseRight); // @step:transfer
            }
        }
        return dp[0][n - 1] >= 0; // @step:return
    }
}`;
  }

  private static getBurstBalloonsTemplate(stage: string): string {
    return `class Solution {
    public int maxCoins(int[] nums) { // @step:entry
        int n = nums.length; // @step:init_n
        int[] val = new int[n + 2]; // @step:init_val
        val[0] = 1; val[n + 1] = 1; // @step:set_border
        for (int i = 0; i < n; i++) val[i + 1] = nums[i]; // @step:fill_val
        int[][] dp = new int[n + 2][n + 2]; // @step:init_dp
        for (int len = 2; len <= n + 1; len++) { // @step:loop_len
            for (int i = 0; i <= n + 1 - len; i++) { // @step:loop_i
                int j = i + len; // @step:calc_j
                int best = 0; // @step:init_best
                for (int k = i + 1; k < j; k++) { // @step:loop_k
                    int gain = val[i] * val[k] * val[j]; // @step:calc_gain
                    int coins = dp[i][k] + dp[k][j] + gain; // @step:calc_coins
                    best = Math.max(best, coins); // @step:update_best
                }
                dp[i][j] = best; // @step:transfer
            }
        }
        return dp[0][n + 1]; // @step:return
    }
}`;
  }

  private static getMinScoreTriangulationTemplate(stage: string): string {
    return `class Solution {
    public int minScoreTriangulation(int[] values) { // @step:entry
        int n = values.length; // @step:init_n
        if (n < 3) return 0; // @step:guard_less
        int[][] dp = new int[n][n]; // @step:init_dp
        for (int len = 3; len <= n; len++) { // @step:loop_len
            for (int i = 0; i <= n - len; i++) { // @step:loop_i
                int j = i + len - 1; // @step:calc_j
                int minScore = Integer.MAX_VALUE; // @step:init_min
                for (int k = i + 1; k < j; k++) { // @step:loop_k
                    int triangle = values[i] * values[k] * values[j]; // @step:calc_tri
                    int score = dp[i][k] + dp[k][j] + triangle; // @step:calc_score
                    minScore = Math.min(minScore, score); // @step:update_min
                }
                dp[i][j] = minScore; // @step:transfer
            }
        }
        return dp[0][n - 1]; // @step:return
    }
}`;
  }

  private static getMergeStonesTemplate(stage: string): string {
    return `class Solution {
    public int mergeStones(int[] stones) { // @step:entry
        int n = stones.length; // @step:init_n
        if (n <= 1) return 0; // @step:guard_less
        int[] sum = new int[n + 1]; // @step:init_sum
        for (int i = 0; i < n; i++) sum[i + 1] = sum[i] + stones[i]; // @step:fill_sum
        int[][] dp = new int[n][n]; // @step:init_dp
        for (int len = 2; len <= n; len++) { // @step:loop_len
            for (int i = 0; i <= n - len; i++) { // @step:loop_i
                int j = i + len - 1; // @step:calc_j
                int minCost = Integer.MAX_VALUE; // @step:init_min
                for (int k = i; k < j; k++) { // @step:loop_k
                    int cost = dp[i][k] + dp[k + 1][j]; // @step:calc_cost
                    minCost = Math.min(minCost, cost); // @step:update_min
                }
                dp[i][j] = minCost + (sum[j + 1] - sum[i]); // @step:transfer
            }
        }
        return dp[0][n - 1]; // @step:return
    }
}`;
  }

  private static getStrangePrinterTemplate(stage: string): string {
    return `class Solution {
    public int strangePrinter(String s) { // @step:entry
        int n = s.length(); // @step:init_n
        if (n <= 1) return n; // @step:guard_less
        int[][] dp = new int[n][n]; // @step:init_dp
        for (int i = 0; i < n; i++) dp[i][i] = 1; // @step:init_base
        for (int len = 2; len <= n; len++) { // @step:loop_len
            for (int i = 0; i <= n - len; i++) { // @step:loop_i
                int j = i + len - 1; // @step:calc_j
                if (s.charAt(i) == s.charAt(j)) { // @step:cond_same
                    dp[i][j] = dp[i][j - 1]; // @step:transfer_same
                } else { // @step:cond_diff
                    int minTurns = Integer.MAX_VALUE; // @step:init_min
                    for (int k = i; k < j; k++) { // @step:loop_k
                        int turns = dp[i][k] + dp[k + 1][j]; // @step:calc_turns
                        minTurns = Math.min(minTurns, turns); // @step:update_min
                    }
                    dp[i][j] = minTurns; // @step:transfer_diff
                }
            }
        }
        return dp[0][n - 1]; // @step:return
    }
}`;
  }

  private static getCountDigitOneTemplate(stage: string): string {
    return `class Solution {
    public int countDigitOne(int n) { // @step:entry
        String s = String.valueOf(n); // @step:convert_str
        int len = s.length(); // @step:init_len
        int[][] memo = new int[len][len + 1]; // @step:init_memo
        for (int[] row : memo) Arrays.fill(row, -1); // @step:fill_memo
        return dfs(s, 0, 0, true, memo); // @step:call_dfs_root
    }
    private int dfs(String s, int idx, int count, boolean isLimit, int[][] memo) { // @step:dfs_entry
        if (idx == s.length()) return count; // @step:base
        if (!isLimit && memo[idx][count] != -1) return memo[idx][count]; // @step:memo_hit
        int up = isLimit ? (s.charAt(idx) - '0') : 9; // @step:calc_up
        int ans = 0; // @step:init_ans
        for (int d = 0; d <= up; d++) { // @step:loop_digit
            ans += dfs(s, idx + 1, count + (d == 1 ? 1 : 0), isLimit && (d == up), memo); // @step:call_dfs
        }
        if (!isLimit) memo[idx][count] = ans; // @step:memo_save
        return ans; // @step:return
    }
}`;
  }

  private static getNonNegativeConsecutiveOnesTemplate(stage: string): string {
    return `class Solution {
    public int findIntegers(int n) { // @step:entry
        String s = Integer.toBinaryString(n); // @step:convert_binary
        int len = s.length(); // @step:init_len
        int[][] memo = new int[len][2]; // @step:init_memo
        for (int[] row : memo) Arrays.fill(row, -1); // @step:fill_memo
        return dfs(s, 0, 0, true, memo); // @step:call_dfs_root
    }
    private int dfs(String s, int idx, int pre, boolean isLimit, int[][] memo) { // @step:dfs_entry
        if (idx == s.length()) return 1; // @step:base
        if (!isLimit && memo[idx][pre] != -1) return memo[idx][pre]; // @step:memo_hit
        int up = isLimit ? (s.charAt(idx) - '0') : 1; // @step:calc_up
        int ans = 0; // @step:init_ans
        for (int d = 0; d <= up; d++) { // @step:loop_digit
            if (pre == 1 && d == 1) continue; // @step:check_consecutive
            ans += dfs(s, idx + 1, d, isLimit && (d == up), memo); // @step:call_dfs
        }
        if (!isLimit) memo[idx][pre] = ans; // @step:memo_save
        return ans; // @step:return
    }
}`;
  }
}

