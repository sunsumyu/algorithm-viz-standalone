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
      case 'combination-sum-iv':
        return this.getCombinationSumIVTemplate(stage);
      case 'longest-repeated-subarray':
        return this.getLongestRepeatedSubarrayTemplate(stage);
      case 'multiple-knapsack':
        return this.getMultipleKnapsackTemplate(stage);
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
        if (Math.abs(target) > sum || (sum + target) % 2 != 0) return 0;
        int bag = (sum + target) / 2;
        return dfs(nums, 0, bag); // @step:dfs_start
    }
    private int dfs(int[] nums, int i, int remain) { // @step:dfs_start
        if (remain == 0) return 1; // @step:base_match
        if (i >= nums.length || remain < 0) return 0; // @step:base_overflow
        int notTake = dfs(nums, i + 1, remain); // @step:branch_not_take
        int take = dfs(nums, i + 1, remain - nums[i]); // @step:branch_take
        return notTake + take; // @step:combine
    }
}`;
    }
    if (stage === 'stage-2') {
      return `class Solution {
    public int findTargetSumWays(int[] nums, int target) { // @step:entry
        int sum = 0;
        for (int x : nums) sum += x;
        if (Math.abs(target) > sum || (sum + target) % 2 != 0) return 0;
        int bag = (sum + target) / 2;
        int[][] memo = new int[nums.length][bag + 1];
        return dfs(nums, 0, bag, memo); // @step:dfs_start
    }
    private int dfs(int[] nums, int i, int remain, int[][] memo) { // @step:dfs_start
        if (remain == 0) return 1; // @step:base_match
        if (i >= nums.length || remain < 0) return 0; // @step:base_overflow
        if (memo[i][remain] != 0) return memo[i][remain]; // @step:cache_hit
        int notTake = dfs(nums, i + 1, remain, memo); // @step:branch_not_take
        int take = dfs(nums, i + 1, remain - nums[i], memo); // @step:branch_take
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

  private static getMultipleKnapsackTemplate(_stage: string): string {
    return `class Solution {
    public int multipleKnapsack(int[] weights, int[] values, int[] nums, int bagWeight) {
        int[] dp = new int[bagWeight + 1]; // @step:init
        for (int i = 0; i < weights.length; i++) { // @step:loop_item
            for (int j = bagWeight; j >= weights[i]; j--) { // @step:loop_bag
                for (int k = 1; k <= nums[i] && (j - k * weights[i]) >= 0; k++) { // @step:loop_count
                    dp[j] = Math.max(dp[j], dp[j - k * weights[i]] + k * values[i]); // @step:transfer
                }
            }
        }
        return dp[bagWeight]; // @step:return
    }
}`;
  }
}
