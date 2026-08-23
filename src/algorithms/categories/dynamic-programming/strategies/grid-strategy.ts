/**
 * Grid 2D Evolution Strategy (网格寻路与矩阵类 DP 演化策略)
 * 覆盖：不同路径 (unique-paths), 最小路径和 (min-path-sum), 三角形最小路径和 (triangle) 等
 */

import { DpDemoStep, DpTreeNode } from '../dp-demo-visualizer';
import { IEvolutionStrategy, EvolutionCodeContext, EvolutionStepContext, StageCodeConfig, AlgoCategory } from './types';
import { codeStepIndexer } from '../../../../core/code-step-indexer';

function getAnchorHighlight(algoId: string, stage: string, anchor: string, fallback?: any): any {
  const key = `${algoId}:${stage}`;
  const java = codeStepIndexer.resolveHighlight(key, anchor, 'java');
  const python = codeStepIndexer.resolveHighlight(key, anchor, 'python');
  const cpp = codeStepIndexer.resolveHighlight(key, anchor, 'cpp');
  const javascript = codeStepIndexer.resolveHighlight(key, anchor, 'javascript');

  if (java != null || python != null || cpp != null || javascript != null) {
    return {
      java: java ?? fallback?.java,
      python: python ?? fallback?.python,
      cpp: cpp ?? fallback?.cpp,
      javascript: javascript ?? fallback?.javascript,
    };
  }
  return fallback;
}

export class GridEvolutionStrategy implements IEvolutionStrategy {
  canHandle(category: AlgoCategory): boolean {
    return category === 'grid-2d';
  }

  getCodeConfig(ctx: EvolutionCodeContext): StageCodeConfig | null {
    const { stage, direction, algoId } = ctx;
    const isBackward = direction !== 'forward';

    if (stage === 'naive-recursive') {
      const java = isBackward ? [
        'class Solution {',
        '    public int uniquePaths(int m, int n) { // @step:entry',
        '        // 1. 倒序朴素递归：从终点 (m-1, n-1) 逆推回起点 (0, 0)',
        '        return dfs(m - 1, n - 1);',
        '    }',
        '    private int dfs(int i, int j) {',
        '        // 1. 边界特判：到达第 0 行或第 0 列，仅有唯一 1 种直达路径',
        '        if (i == 0 || j == 0) { // @step:base-case',
        '            return 1;',
        '        }',
        '        // 2. 倒序分治：到达当前格 (i, j) 只能来自左方 (i, j-1) 或上方 (i-1, j)',
        '        int left = dfs(i, j - 1); // @step:branch-left',
        '        int up = dfs(i - 1, j); // @step:branch-up',
        '        return left + up; // @step:return',
        '    }',
        '}',
      ] : [
        'class Solution {',
        '    public int uniquePaths(int m, int n) { // @step:entry',
        '        // 1. 朴素递归：探险家从起点 (0, 0) 出发自顶向下探索',
        '        return dfs(0, 0, m, n);',
        '    }',
        '    private int dfs(int i, int j, int m, int n) {',
        '        if (i == m - 1 && j == n - 1) return 1; // 🏆 到达终点，找到 1 条有效路径 @step:base-case',
        '        if (i >= m || j >= n) return 0;         // 越界无法通行',
        '        // 指数级分治展开：向下走一步 + 向右走一步',
        '        int down = dfs(i + 1, j, m, n); // @step:branch-down',
        '        int right = dfs(i, j + 1, m, n); // @step:branch-right',
        '        return down + right; // @step:return',
        '    }',
        '}',
      ];
      const py = isBackward ? [
        'class Solution:',
        '    def uniquePaths(self, m: int, n: int) -> int: # @step:entry',
        '        # 倒序递归：从终点 (m-1, n-1) 逆推回起点 (0, 0)',
        '        def dfs(i: int, j: int) -> int:',
        '            if i == 0 or j == 0: # @step:base-case',
        '                return 1',
        '            left = dfs(i, j - 1) # @step:branch-left',
        '            up = dfs(i - 1, j) # @step:branch-up',
        '            return left + up # @step:return',
        '        return dfs(m - 1, n - 1)',
      ] : [
        'class Solution:',
        '    def uniquePaths(self, m: int, n: int) -> int: # @step:entry',
        '        # 1. 朴素递归 (Top-Down 分治：从起点 (0, 0) 出发)',
        '        def dfs(i: int, j: int) -> int:',
        '            if i == m - 1 and j == n - 1: return 1 # @step:base-case',
        '            if i >= m or j >= n: return 0',
        '            return dfs(i + 1, j) + dfs(i, j + 1) # @step:return',
        '        return dfs(0, 0)',
      ];
      const cpp = isBackward ? [
        'class Solution {',
        'public:',
        '    int uniquePaths(int m, int n) { // @step:entry',
        '        return dfs(m - 1, n - 1);',
        '    }',
        '    int dfs(int i, int j) {',
        '        if (i == 0 || j == 0) return 1; // @step:base-case',
        '        int left = dfs(i, j - 1); // @step:branch-left',
        '        int up = dfs(i - 1, j); // @step:branch-up',
        '        return left + up; // @step:return',
        '    }',
        '};',
      ] : [
        'class Solution {',
        'public:',
        '    int uniquePaths(int m, int n) { // @step:entry',
        '        return dfs(0, 0, m, n);',
        '    }',
        '    int dfs(int i, int j, int m, int n) {',
        '        if (i == m - 1 && j == n - 1) return 1; // @step:base-case',
        '        if (i >= m || j >= n) return 0;',
        '        return dfs(i + 1, j, m, n) + dfs(i, j + 1, m, n); // @step:return',
        '    }',
        '};',
      ];
      const js = isBackward ? [
        'function uniquePaths(m, n) { // @step:entry',
        '    function dfs(i, j) {',
        '        if (i === 0 || j === 0) return 1; // @step:base-case',
        '        const left = dfs(i, j - 1); // @step:branch-left',
        '        const up = dfs(i - 1, j); // @step:branch-up',
        '        return left + up; // @step:return',
        '    }',
        '    return dfs(m - 1, n - 1);',
        '}',
      ] : [
        'function uniquePaths(m, n) { // @step:entry',
        '    function dfs(i, j) {',
        '        if (i === m - 1 && j === n - 1) return 1; // @step:base-case',
        '        if (i >= m || j >= n) return 0;',
        '        return dfs(i + 1, j) + dfs(i, j + 1); // @step:return',
        '    }',
        '    return dfs(0, 0);',
        '}',
      ];

      const lineExplanations: Record<number, string> = isBackward ? {
        1: '🎯 <strong>类定义</strong>',
        2: '🚀 <strong>主函数入口 uniquePaths(m, n)</strong>：接收网格行数 m 与列数 n。',
        4: '🏁 <strong>发起倒序顶层递归</strong>：从右下角终点 (m - 1, n - 1) 发起逆向推导！',
        6: '🔄 <strong>递归辅助函数 dfs(i, j)</strong>：计算到达 (i, j) 的路径数。',
        8: '🎬 <strong>Base Case 边界特判</strong>：到达第 0 行或第 0 列，仅有唯一 1 种直达路径，返回 1。',
        12: '⬅️ <strong>向左逆推分支 dfs(i, j - 1)</strong>：探求到达左侧邻居的路径数。',
        13: '⬆️ <strong>向上逆推分支 dfs(i - 1, j)</strong>：探求到达上侧邻居的路径数。',
        14: '✨ <strong>加和合并子问题解</strong>：当前格子路径数 = 左方路径数 + 上方路径数。',
      } : {
        1: '🎯 <strong>类定义</strong>',
        2: '🚀 <strong>主函数入口 uniquePaths(m, n)</strong>：接收网格行数 m 与列数 n。',
        4: '🚩 <strong>发起顶层递归</strong>：探险家从起点 (0, 0) 出发向前探索。',
        6: '🔄 <strong>递归辅助函数 dfs(i, j, m, n)</strong>：计算从 (i, j) 出发到达终点的路径数。',
        7: '🏆 <strong>Base Case 抵达终点</strong>：成功抵达 (m - 1, n - 1)，找到 1 条合法路径，返回 1。',
        8: '🚧 <strong>越界判断</strong>：走出网格边界时直接返回 0。',
        10: '⬇️ <strong>向下探索分支 dfs(i + 1, j)</strong>：探险家向下迈进一步。',
        11: '➡️ <strong>向右探索分支 dfs(i, j + 1)</strong>：探险家向右迈进一步。',
        12: '✨ <strong>合并子问题解</strong>：两路可行路径数相加并返回。',
      };

      const res: StageCodeConfig = {
        lines: java,
        languages: { java, python: py, cpp, javascript: js },
        lineExplanations,
        keyPoints: {
          title: '🎯 不同路径 · 朴素递归深度剖析',
          summary: isBackward
            ? '倒序逆向推导：从终点 (m-1, n-1) 逆推回起点 (0, 0)，直接对应动态规划转移方程的本源！'
            : '自顶向下分治：探险家从 (0, 0) 出发向下和向右探索，但存在大量指数级重叠递归！',
          points: isBackward ? [
            { label: '一、倒序逆推思想', desc: '到达 <code>(i, j)</code> 的最后一步只能来自左方 <code>(i, j-1)</code> 或上方 <code>(i-1, j)</code>。', icon: '🧭', badge: '终点逆推' },
            { label: '二、与递推方程的呼应', desc: '倒序递归式 <code>dfs(i, j) = dfs(i, j-1) + dfs(i-1, j)</code> 直接演化出 DP 递推方程 <code>dp[i][j] = dp[i][j-1] + dp[i-1][j]</code>！', icon: '⚡', badge: '状态转移' },
            { label: '三、指数级重叠子问题', desc: '同一个坐标 <code>(i, j)</code> 会被两路子分支重复展开，时间复杂度高达 <code>O(2^(m+n))</code>。', icon: '⚠️', badge: '需记忆化' },
          ] : [
            { label: '一、递归分治思想', desc: '从起点 <code>(0, 0)</code> 出发，每一步只能向下 <code>(i+1, j)</code> 或向右 <code>(i, j+1)</code>。', icon: '🧭', badge: '起点出发' },
            { label: '二、指数级重叠子问题', desc: '同一个坐标 <code>(i, j)</code> 会被不同路径重复访问，造成大量指数级算力浪费。', icon: '⚠️', badge: '复杂度 O(2^(m+n))' },
            { label: '三、优化方向', desc: '引入备忘录（Memoization）缓存每个坐标的历史计算结果，彻底剪除重复子树。', icon: '💡', badge: '记忆化' },
          ],
        },
      };
      codeStepIndexer.register(`${algoId || 'algo'}:${stage}`, res.languages);
      return res;
    }

    if (stage === 'memo-topdown') {
      const java = isBackward ? [
        'class Solution {',
        '    private int[][] memo;',
        '    public int uniquePaths(int m, int n) { // @step:entry',
        '        memo = new int[m][n]; // @step:init',
        '        return dfs(m - 1, n - 1);',
        '    }',
        '    private int dfs(int i, int j) {',
        '        // 1. 先判断越界与边界：第 0 行或第 0 列只有 1 种直达路径',
        '        if (i == 0 || j == 0) { // @step:base-case',
        '            return 1;',
        '        }',
        '        // 2. 备忘录命中剪枝',
        '        if (memo[i][j] != 0) { // @step:memo-hit',
        '            return memo[i][j];',
        '        }',
        '        // 3. 倒序递归子问题：来自左方 + 来自上方',
        '        int left = dfs(i, j - 1); // @step:branch-left',
        '        int up = dfs(i - 1, j); // @step:branch-up',
        '        return memo[i][j] = left + up; // @step:memo-write',
        '    }',
        '}',
      ] : [
        'class Solution {',
        '    private Integer[][] memo;',
        '    public int uniquePaths(int m, int n) { // @step:entry',
        '        memo = new Integer[m][n]; // @step:init',
        '        return dfs(0, 0, m, n);',
        '    }',
        '    private int dfs(int i, int j, int m, int n) {',
        '        if (i == m - 1 && j == n - 1) return 1; // 🏆 抵达终点返回 1 @step:base-case',
        '        if (i >= m || j >= n) return 0;',
        '        if (memo[i][j] != null) return memo[i][j]; // ⚡ O(1) 备忘录命中剪枝 @step:memo-hit',
        '        int down = dfs(i + 1, j, m, n); // @step:branch-down',
        '        int right = dfs(i, j + 1, m, n); // @step:branch-right',
        '        return memo[i][j] = down + right;          // 💾 写入缓存并返回 @step:memo-write',
        '    }',
        '}',
      ];
      const py = isBackward ? [
        'class Solution:',
        '    def uniquePaths(self, m: int, n: int) -> int: # @step:entry',
        '        memo = {} # @step:init',
        '        def dfs(i: int, j: int) -> int:',
        '            if i == 0 or j == 0: # @step:base-case',
        '                return 1',
        '            if (i, j) in memo: # @step:memo-hit',
        '                return memo[(i, j)]',
        '            left = dfs(i, j - 1) # @step:branch-left',
        '            up = dfs(i - 1, j) # @step:branch-up',
        '            memo[(i, j)] = left + up # @step:memo-write',
        '            return memo[(i, j)]',
        '        return dfs(m - 1, n - 1)',
      ] : [
        'class Solution:',
        '    def uniquePaths(self, m: int, n: int) -> int: # @step:entry',
        '        memo = {} # @step:init',
        '        def dfs(i: int, j: int) -> int:',
        '            if i == m - 1 and j == n - 1: return 1 # @step:base-case',
        '            if i >= m or j >= n: return 0',
        '            if (i, j) in memo: return memo[(i, j)] # @step:memo-hit',
        '            memo[(i, j)] = dfs(i + 1, j) + dfs(i, j + 1) # @step:memo-write',
        '            return memo[(i, j)]',
        '        return dfs(0, 0)',
      ];
      const cpp = isBackward ? [
        'class Solution {',
        '    vector<vector<int>> memo;',
        'public:',
        '    int uniquePaths(int m, int n) { // @step:entry',
        '        memo.assign(m, vector<int>(n, 0)); // @step:init',
        '        return dfs(m - 1, n - 1);',
        '    }',
        '    int dfs(int i, int j) {',
        '        if (i == 0 || j == 0) return 1; // @step:base-case',
        '        if (memo[i][j] != 0) return memo[i][j]; // @step:memo-hit',
        '        int left = dfs(i, j - 1); // @step:branch-left',
        '        int up = dfs(i - 1, j); // @step:branch-up',
        '        return memo[i][j] = left + up; // @step:memo-write',
        '    }',
        '};',
      ] : [
        'class Solution {',
        '    vector<vector<int>> memo;',
        'public:',
        '    int uniquePaths(int m, int n) { // @step:entry',
        '        memo.assign(m, vector<int>(n, -1)); // @step:init',
        '        return dfs(0, 0, m, n);',
        '    }',
        '    int dfs(int i, int j, int m, int n) {',
        '        if (i == m - 1 && j == n - 1) return 1; // @step:base-case',
        '        if (i >= m || j >= n) return 0;',
        '        if (memo[i][j] != -1) return memo[i][j]; // @step:memo-hit',
        '        return memo[i][j] = dfs(i + 1, j, m, n) + dfs(i, j + 1, m, n); // @step:memo-write',
        '    }',
        '};',
      ];
      const js = isBackward ? [
        'function uniquePaths(m, n) { // @step:entry',
        '    const memo = Array.from({ length: m }, () => new Array(n).fill(0)); // @step:init',
        '    function dfs(i, j) {',
        '        if (i === 0 || j === 0) return 1; // @step:base-case',
        '        if (memo[i][j] !== 0) return memo[i][j]; // @step:memo-hit',
        '        const left = dfs(i, j - 1); // @step:branch-left',
        '        const up = dfs(i - 1, j); // @step:branch-up',
        '        return (memo[i][j] = left + up); // @step:memo-write',
        '    }',
        '    return dfs(m - 1, n - 1);',
        '}',
      ] : [
        'function uniquePaths(m, n) { // @step:entry',
        '    const memo = Array.from({ length: m }, () => new Array(n).fill(null)); // @step:init',
        '    function dfs(i, j) {',
        '        if (i === m - 1 && j === n - 1) return 1; // @step:base-case',
        '        if (i >= m || j >= n) return 0;',
        '        if (memo[i][j] !== null) return memo[i][j]; // @step:memo-hit',
        '        return memo[i][j] = dfs(i + 1, j) + dfs(i, j + 1); // @step:memo-write',
        '    }',
        '    return dfs(0, 0);',
        '}',
      ];

      const lineExplanations: Record<number, string> = isBackward ? {
        2: '🗺️ <strong>开辟备忘录</strong>：二维数组 memo[m][n] 缓存各坐标到达路径数。',
        5: '🏁 <strong>发起倒序顶层递归</strong>：从右下角终点 (m - 1, n - 1) 发起逆向推导。',
        7: '🔄 <strong>递归辅助函数 dfs(i, j)</strong>：计算到达 (i, j) 的路径数。',
        9: '🎬 <strong>Base Case 边界特判</strong>：第一行或第一列直达路径数恒为 1。',
        13: '⚡ <strong>O(1) 备忘录命中剪枝</strong>：若 memo[i][j] 已计算过，直接查表返回，跳过整棵子树！',
        17: '⬅️ <strong>递归左方子问题</strong>：left = dfs(i, j - 1)。',
        18: '⬆️ <strong>递归上方子问题</strong>：up = dfs(i - 1, j)。',
        19: '💾 <strong>写入备忘录并返回</strong>：记录 memo[i][j] = left + up。',
      } : {
        2: '🗺️ <strong>开辟备忘录</strong>：二维数组 memo[m][n] 缓存已计算坐标。',
        5: '🚩 <strong>发起顶层递归</strong>：探险家从起点 (0, 0) 递归探索。',
        8: '🏆 <strong>抵达终点</strong>：找到 1 条合法路径返回 1。',
        10: '⚡ <strong>O(1) 查表剪枝</strong>：若 memo[i][j] 已计算，直接查表返回，跳过整颗子树！',
        13: '💾 <strong>写入缓存</strong>：记录两路之和到 memo[i][j]。',
      };

      const res: StageCodeConfig = {
        lines: java,
        languages: { java, python: py, cpp, javascript: js },
        lineExplanations,
        keyPoints: {
          title: '🎯 不同路径 · 记忆化搜索核心要点',
          summary: isBackward
            ? '倒序逆推 + 二维备忘录：每个网格坐标 (i, j) 仅深度计算一次，与递推填表法完美对称！'
            : '自顶向下 + 二维备忘录：每个网格坐标 (i, j) 仅被深度计算一次，将指数复杂度骤降至线性 O(m×n)。',
          points: [
            { label: '一、空间换时间', desc: '借助二维备忘录缓存每个坐标状态，彻底斩断重复递归分支。', icon: '📝', badge: '查表剪枝' },
            { label: '二、时空复杂度', desc: '时间复杂度 <code>O(m×n)</code>，空间复杂度 <code>O(m×n)</code> 缓存 + 递归栈。', icon: '⚡', badge: 'O(m*n)' },
          ],
        },
      };
      codeStepIndexer.register(`${algoId || 'algo'}:${stage}`, res.languages);
      return res;
    }

    if (stage === 'space-optimized') {
      const java = [
        'class Solution {',
        '    public int uniquePaths(int m, int n) { // @step:entry',
        '        // 4. 空间压缩优化：O(n) 一维滚动数组',
        '        int[] dp = new int[n]; // @step:alloc',
        '        Arrays.fill(dp, 1); // @step:init 初始化第一行全为 1',
        '        for (int i = 1; i < m; i++) { // @step:loop-outer',
        '            for (int j = 1; j < n; j++) { // @step:loop-inner',
        '                dp[j] += dp[j - 1]; // @step:update dp[j]旧值代表上方，dp[j-1]新值代表左方',
        '            }',
        '        }',
        '        return dp[n - 1]; // @step:return',
        '    }',
        '}',
      ];
      const py = [
        'class Solution:',
        '    def uniquePaths(self, m: int, n: int) -> int: # @step:entry',
        '        # 4. 空间压缩：一维滚动数组',
        '        dp = [1] * n # @step:init',
        '        for i in range(1, m): # @step:loop-outer',
        '            for j in range(1, n): # @step:loop-inner',
        '                dp[j] += dp[j - 1] # @step:update',
        '        return dp[n - 1] # @step:return',
      ];
      const cpp = [
        'class Solution {',
        'public:',
        '    int uniquePaths(int m, int n) { // @step:entry',
        '        vector<int> dp(n, 1); // @step:init',
        '        for (int i = 1; i < m; i++) { // @step:loop-outer',
        '            for (int j = 1; j < n; j++) { // @step:loop-inner',
        '                dp[j] += dp[j - 1]; // @step:update',
        '            }',
        '        }',
        '        return dp[n - 1]; // @step:return',
        '    }',
        '};',
      ];
      const js = [
        'function uniquePaths(m, n) { // @step:entry',
        '    const dp = new Array(n).fill(1); // @step:init',
        '    for (let i = 1; i < m; i++) { // @step:loop-outer',
        '        for (let j = 1; j < n; j++) { // @step:loop-inner',
        '            dp[j] += dp[j - 1]; // @step:update',
        '        }',
        '    }',
        '    return dp[n - 1]; // @step:return',
        '}',
      ];
      const res = {
        lines: java,
        languages: { java, python: py, cpp, javascript: js },
        lineExplanations: {
          4: '🎬 <strong>一维数组初始化</strong>：创建长度为 n 的一维数组并全置 1。',
          6: '🔄 <strong>逐行滚动遍历</strong>：外层遍历行 i，内层遍历列 j。',
          8: '⚡ <strong>滚动状态累加</strong>：dp[j] += dp[j - 1]，左方新值加和上方旧值。',
          11: '🏁 <strong>返回终点答案</strong>：dp[n - 1] 存储右下角累计路径总数。',
        },
        keyPoints: {
          title: '🎯 不同路径 · 一维空间压缩核心要点',
          summary: '从二维矩阵 O(m×n) 极致压缩为一维行数组 O(n)，空间利用率提升数十倍！',
          points: [
            { label: '一、滚动复用原理', desc: '在计算第 i 行时，仅依赖第 i-1 行的上方值和当前行的左方值，历史行无需保存。', icon: '💾', badge: '空间 O(n)' },
            { label: '二、时空复杂度', desc: '时间复杂度 <code>O(m×n)</code>，空间复杂度降至 <code>O(n)</code>。', icon: '⏱️', badge: '最优解' },
          ],
        },
      };
      codeStepIndexer.register(`${algoId || 'algo'}:${stage}`, res.languages);
      return res;
    }

    return null;
  }

  buildSteps(ctx: EvolutionStepContext): DpDemoStep[] | null {
    const { algoId, stage, baseSteps, params } = ctx;
    const lastStep = baseSteps[baseSteps.length - 1];
    const dp2d = lastStep.dp2d || [[1, 1], [1, 2]];
    const m = dp2d.length;
    const n = dp2d[0]?.length || 1;

    const hasObstacles = (algoId || '').includes('unique-paths-ii') || (algoId || '').includes('obstacle');
    const obstacles: Array<[number, number]> = [];
    if (params?.grid && Array.isArray(params.grid)) {
      params.grid.forEach((row: number[], r: number) => {
        row.forEach((v: number, c: number) => {
          if (v === 1) obstacles.push([r, c]);
        });
      });
    } else if (params?.obstacleGrid && Array.isArray(params.obstacleGrid)) {
      params.obstacleGrid.forEach((row: number[], r: number) => {
        row.forEach((v: number, c: number) => {
          if (v === 1) obstacles.push([r, c]);
        });
      });
    } else if (hasObstacles) {
      obstacles.push([1, 1]);
      if (m > 2 && n > 2) {
        obstacles.push([m - 1, Math.max(0, n - 2)]);
      }
    }

    if (stage === 'space-optimized') {
      const steps: DpDemoStep[] = [];
      const dpRow: number[] = new Array(n).fill(1);

      // Step 1: 初始化一维滚动数组（遇到障碍物则后续全置 0）
      for (let j = 0; j < n; j++) {
        if (obstacles.some(([or, oc]) => or === 0 && oc === j)) {
          for (let k = j; k < n; k++) dpRow[k] = 0;
          break;
        }
        dpRow[j] = 1;
      }

      steps.push({
        thematicMeta: { type: 'grid', grid: { rows: m, cols: n, curRow: 0, curCol: 0, obstacles, status: 'init' } },
        current: { i: 0, j: 0 },
        dp1d: [...dpRow],
        message: hasObstacles
          ? `🚀 【初始化一维滚动数组】根据首行障碍物分布初始化 dp[0..${n - 1}] = [${dpRow.join(', ')}]。`
          : `🚀 【初始化一维滚动数组】分配并填充 dp[0..${n - 1}] 全为 1（代表第一行初始路径数）。`,
        log: `init: dp=[${dpRow.join(', ')}]`,
        anchor: 'init',
        codeLine: getAnchorHighlight(algoId, stage, 'init', {
          java: { primary: [4, 5], context: [2, 3] },
          python: { primary: 4, context: 2 },
          cpp: { primary: 4, context: 3 },
          javascript: { primary: 2, context: 1 },
        }),
        metrics: { '当前行 i': 0, '一维滚动空间': `O(${n})`, '计算状态': '初始化' },
        vars: [
          { name: 'i (当前行)', value: '0', type: 'number' },
          { name: 'j (当前列)', value: '0', type: 'number' },
          { name: '一维数组 dp', value: `[${dpRow.join(', ')}]`, type: 'array', changed: true },
          { name: 'm (网格行数)', value: String(m), type: 'number' },
          { name: 'n (网格列数)', value: String(n), type: 'number' },
        ],
      });

      for (let i = 1; i < m; i++) {
        // 首列单向受阻处理
        if (obstacles.some(([or, oc]) => or === i && oc === 0)) {
          dpRow[0] = 0;
        }

        // Step 2: 外层循环行推进
        steps.push({
          thematicMeta: { type: 'grid', grid: { rows: m, cols: n, curRow: i, curCol: 0, obstacles, status: 'enter' } },
          current: { i, j: 0 },
          dp1d: [...dpRow],
          message: `🔄 【外层循环】行索引 i = ${i} (< ${m})，开始处理第 ${i} 行的滚动更新。`,
          log: `for i = ${i}`,
          anchor: 'loop-outer',
          codeLine: getAnchorHighlight(algoId, stage, 'loop-outer', {
            java: { primary: 6, context: [4, 5] },
            python: { primary: 5, context: 4 },
            cpp: { primary: 5, context: 4 },
            javascript: { primary: 3, context: 2 },
          }),
          metrics: { '当前行 i': i, '网格行数 m': m, '状态': '遍历行' },
          vars: [
            { name: 'i (当前行)', value: String(i), type: 'number', changed: true },
            { name: 'm (网格行数)', value: String(m), type: 'number' },
            { name: '一维数组 dp', value: `[${dpRow.join(', ')}]`, type: 'array' },
          ],
        });

        for (let j = 1; j < n; j++) {
          const isObs = obstacles.some(([or, oc]) => or === i && oc === j);
          const oldVal = dpRow[j];
          const leftVal = dpRow[j - 1];
          const newVal = isObs ? 0 : oldVal + leftVal;

          // Step 3: 内层循环判断/定位列单元
          steps.push({
            thematicMeta: { type: 'grid', grid: { rows: m, cols: n, curRow: i, curCol: j, obstacles, status: isObs ? 'eval-obstacle' : 'enter' } },
            current: { i, j },
            dp1d: [...dpRow],
            message: isObs
              ? `🚧 【定位障碍物】进入坐标 (${i}, ${j})，检测到此处为障碍物 🚧，准备置 0。`
              : `📍 【定位列单元】进入内层循环 j = ${j} (< ${n})，准备更新 dp[${j}]。上方旧值 dp[${j}] = ${oldVal}，左方新值 dp[${j - 1}] = ${leftVal}。`,
            log: `for j = ${j}`,
            anchor: 'loop-inner',
            codeLine: getAnchorHighlight(algoId, stage, 'loop-inner', {
              java: { primary: 7, context: 6 },
              python: { primary: 6, context: 5 },
              cpp: { primary: 6, context: 5 },
              javascript: { primary: 4, context: 3 },
            }),
            metrics: { '当前行 i': i, '当前列 j': j, '上方旧值 (dp[j])': oldVal, '左方新值 (dp[j-1])': leftVal },
            vars: [
              { name: 'i (当前行)', value: String(i), type: 'number' },
              { name: 'j (当前列)', value: String(j), type: 'number', changed: true },
              { name: '上方旧值 (原dp[j])', value: String(oldVal), type: 'number' },
              { name: '左方新值 (dp[j-1])', value: String(leftVal), type: 'number' },
              { name: 'm (网格行数)', value: String(m), type: 'number' },
              { name: 'n (网格列数)', value: String(n), type: 'number' },
            ],
          });

          // Step 4: 真正执行核心累加行：dp[j] += dp[j - 1] (Line 8 in Java)
          dpRow[j] = newVal;

          steps.push({
            thematicMeta: { type: 'grid', grid: { rows: m, cols: n, curRow: i, curCol: j, obstacles, status: isObs ? 'eval-obstacle' : 'update' } },
            current: { i, j },
            dp1d: [...dpRow],
            message: isObs
              ? `🚧 【障碍物置零】坐标 (${i}, ${j}) 遇障碍，执行 dp[${j}] = 0。`
              : `⚡ 【执行累加状态转移】执行 dp[j] += dp[j - 1]：dp[${j}] = ${oldVal} + ${leftVal} = ${newVal}。`,
            log: `execute: dp[${j}] = ${newVal}`,
            anchor: 'update',
            codeLine: getAnchorHighlight(algoId, stage, 'update', {
              java: { primary: 8, context: [6, 7] },
              python: { primary: 7, context: [5, 6] },
              cpp: { primary: 7, context: [5, 6] },
              javascript: { primary: 5, context: [3, 4] },
            }),
            metrics: { '当前行 i': i, '当前列 j': j, 'dp[j]': newVal, '空间复杂度': `O(${n})` },
            vars: [
              { name: 'i (当前行)', value: String(i), type: 'number' },
              { name: 'j (当前列)', value: String(j), type: 'number' },
              { name: '上方旧值 (原dp[j])', value: String(oldVal), type: 'number' },
              { name: '左方新值 (dp[j-1])', value: String(leftVal), type: 'number' },
              { name: '更新后 dp[j]', value: String(newVal), type: 'number', changed: true },
              { name: 'm (网格行数)', value: String(m), type: 'number' },
              { name: 'n (网格列数)', value: String(n), type: 'number' },
            ],
          });
        }
      }

      // Step 5: 返回语句 return dp[n - 1]
      steps.push({
        thematicMeta: { type: 'grid', grid: { rows: m, cols: n, curRow: m - 1, curCol: n - 1, obstacles, status: 'completed' } },
        current: { i: m - 1, j: n - 1 },
        dp1d: [...dpRow],
        message: `🏁 【计算完毕返回】执行 return dp[n - 1]，到达右下角终点 (${m - 1}, ${n - 1}) 的不同路径总数为 dp[${n - 1}] = ${dpRow[n - 1]} 条。`,
        log: `return: dp[${n - 1}] = ${dpRow[n - 1]}`,
        anchor: 'return',
        codeLine: getAnchorHighlight(algoId, stage, 'return', {
          java: { primary: 11, context: 2 },
          python: { primary: 8, context: 2 },
          cpp: { primary: 10, context: 3 },
          javascript: { primary: 8, context: 1 },
        }),
        metrics: { '最终路径数': dpRow[n - 1], '空间复杂度': `O(${n})` },
        vars: [
          { name: '最终路径总数', value: String(dpRow[n - 1]), type: 'number', changed: true },
          { name: '空间压缩收益', value: `由 O(${m}×${n}) 降至 O(${n})`, type: 'string' },
        ],
      });

      return steps;
    }

    if (stage === 'naive-recursive' || stage === 'memo-topdown') {
      let resolvedDir = 'backward';
      if (params) {
        if (params.direction) {
          resolvedDir = params.direction;
        } else if (typeof HTMLElement !== 'undefined' && params instanceof HTMLElement) {
          const dirEl = params.querySelector<HTMLSelectElement | HTMLInputElement>('#dp-input-direction');
          if (dirEl?.value) resolvedDir = dirEl.value;
        } else if (params.root && typeof HTMLElement !== 'undefined' && params.root instanceof HTMLElement) {
          const rootEl = params.root as HTMLElement;
          const dirEl = rootEl.querySelector<HTMLSelectElement | HTMLInputElement>('#dp-input-direction');
          if (dirEl?.value) resolvedDir = dirEl.value;
        }
      }
      const isBackward = resolvedDir !== 'forward';
      const steps: DpDemoStep[] = [];
      const isMemo = stage === 'memo-topdown';
      let nodeIdCounter = 0;
      let calls = 0;
      const memoCache = new Map<string, number>();

      function createTreeNode(r: number, c: number): DpTreeNode {
        return {
          id: 'grid_node_' + (nodeIdCounter++),
          val: `(${r},${c})`,
          status: 'current',
          children: [],
        };
      }

      function cloneTree(node: DpTreeNode | null): DpTreeNode | null {
        if (!node) return null;
        return {
          id: node.id,
          val: node.val,
          status: node.status,
          tag: node.tag,
          children: node.children ? node.children.map(cloneTree).filter((child): child is DpTreeNode => child !== null) : [],
        };
      }

      if (isBackward) {
        const rootRow = m - 1;
        const rootCol = n - 1;
        const rootTree = createTreeNode(rootRow, rootCol);
        const pathStack: Array<[number, number]> = [];
        const visitedCoords = new Set<string>();

        // Step 0: Main entry
        steps.push({
          thematicMeta: {
            type: 'grid',
            grid: {
              rows: m,
              cols: n,
              curRow: m - 1,
              curCol: n - 1,
              parentRow: m - 1,
              parentCol: n - 1,
              pathStack: [[m - 1, n - 1]],
              visitedCells: [[m - 1, n - 1]],
              pathCount: 1,
              status: 'enter',
            },
          },
          current: { i: m - 1, j: n - 1 },
          tree: cloneTree(rootTree),
          message: `🚀 【主函数入口】调用 uniquePaths(${m}, ${n})，初始化 memo[${m}][${n}]，从终点 (${m - 1}, ${n - 1}) 🏆 发起倒序递归逆推！`,
          log: `entry: uniquePaths(m=${m}, n=${n}), start dfs(${m - 1}, ${n - 1})`,
          codeLine: isMemo
            ? { java: 5, python: 10, cpp: 5, javascript: 9 }
            : { java: 4, python: 8, cpp: 4, javascript: 7 },
          metrics: { '当前阶段': '🚀 主函数入口', '倒序起点': `(${m - 1}, ${n - 1})`, '逆推目标': '(0, 0)', '总递归调用': 0 },
          vars: [
            { name: 'i (当前行)', value: String(m - 1), type: 'number' },
            { name: 'j (当前列)', value: String(n - 1), type: 'number' },
            { name: '推导方向', value: '倒序逆推 (终点 ➔ 起点)', type: 'string' },
            { name: 'm (总行数)', value: String(m), type: 'number' },
            { name: 'n (总列数)', value: String(n), type: 'number' },
          ],
        });

        function recurseGridBackward(
          r: number,
          c: number,
          currentSubtree: DpTreeNode,
          depth: number,
          parentR: number = m - 1,
          parentC: number = n - 1
        ): number {
          calls++;
          const key = `${r},${c}`;
          currentSubtree.status = 'current';

          const isInBounds = r >= 0 && r < m && c >= 0 && c < n;
          if (isInBounds) {
            pathStack.push([r, c]);
            visitedCoords.add(key);
          }

          const makeGridMeta = (status: any, pathCountVal: number = 1) => ({
            rows: m,
            cols: n,
            curRow: r,
            curCol: c,
            parentRow: parentR,
            parentCol: parentC,
            obstacles,
            pathStack: [...pathStack],
            visitedCells: Array.from(visitedCoords).map((k) => k.split(',').map(Number) as [number, number]),
            pathCount: pathCountVal,
            status,
          });

          // 1. Enter function header
          steps.push({
            thematicMeta: { type: 'grid', grid: makeGridMeta('enter', 1) },
            current: { i: r, j: c },
            tree: cloneTree(rootTree),
            message: `📥 【进入 dfs 函数】执行 dfs(i = ${r}, j = ${c})，倒序探索从起点到达 (${r}, ${c}) 的所有可行路径。`,
            log: `dfs(${r}, ${c}) [调用 #${calls}]`,
            codeLine: isMemo
              ? { java: 7, python: 4, cpp: 7, javascript: 2 }
              : { java: 6, python: 4, cpp: 6, javascript: 2 },
            metrics: { '当前格子': `(${r}, ${c})`, '递归深度': depth, '总递归调用': calls },
            vars: [
              { name: 'i (当前行)', value: String(r), type: 'number', changed: true },
              { name: 'j (当前列)', value: String(c), type: 'number', changed: true },
              { name: '递归深度', value: `第 ${depth} 层`, type: 'string' },
              { name: 'm (总行数)', value: String(m), type: 'number' },
              { name: 'n (总列数)', value: String(n), type: 'number' },
            ],
          });

          // Obstacle check
          if (obstacles.some(([or, oc]) => or === r && oc === c)) {
            currentSubtree.tag = '=0 (🚧 障碍)';
            currentSubtree.status = 'visited';
            steps.push({
              thematicMeta: { type: 'grid', grid: makeGridMeta('eval-obstacle', 0) },
              current: { i: r, j: c },
              tree: cloneTree(rootTree),
              message: `🚧 【遇到障碍物】坐标 (${r}, ${c}) 为障碍物 🚧，机器人无法站立通行，直接返回 0！`,
              log: `obstacle: (${r}, ${c}) ➔ return 0`,
              codeLine: isMemo
                ? { java: 8, python: 6, cpp: 8, javascript: 3 }
                : { java: 7, python: 5, cpp: 7, javascript: 3 },
              metrics: { '当前格子': `(${r}, ${c})`, '返回值': 0, '状态': '🚧 遇到障碍物' },
              vars: [
                { name: 'i (当前行)', value: String(r), type: 'number' },
                { name: 'j (当前列)', value: String(c), type: 'number' },
                { name: '障碍拦截', value: '0 (不可通行)', type: 'string', changed: true },
                { name: 'm (总行数)', value: String(m), type: 'number' },
                { name: 'n (总列数)', value: String(n), type: 'number' },
              ],
            });
            pathStack.pop();
            return 0;
          }

          // 2. Base Case: Reached row 0 or col 0 (i == 0 || j == 0)
          if (r === 0 || c === 0) {
            currentSubtree.tag = '=1';
            currentSubtree.status = 'visited';
            steps.push({
              thematicMeta: { type: 'grid', grid: makeGridMeta('eval-border', 1) },
              current: { i: r, j: c },
              tree: cloneTree(rootTree),
              message: `🎬 【Base Case 命中】i (${r}) == 0 或 j (${c}) == 0！到达第 0 行或第 0 列（最上行或最左列），从起点 (0,0) 单向直达仅有 1 种路径，return 1！`,
              log: `base: reach border (${r}, ${c}) ➔ 1`,
              codeLine: isMemo
                ? { java: 9, python: 5, cpp: 8, javascript: 3 }
                : { java: 8, python: 5, cpp: 7, javascript: 3 },
              metrics: { '当前格子': `(${r}, ${c})`, '返回值': 1, '总递归调用': calls },
              vars: [
                { name: 'i (当前行)', value: String(r), type: 'number' },
                { name: 'j (当前列)', value: String(c), type: 'number' },
                { name: 'Base Case 结果', value: '1 (单向直达路径 🏁)', type: 'string', changed: true },
                { name: 'm (总行数)', value: String(m), type: 'number' },
                { name: 'n (总列数)', value: String(n), type: 'number' },
              ],
            });
            pathStack.pop();
            return 1;
          }

          // 3. Memo check
          if (isMemo && memoCache.has(key)) {
            const cached = memoCache.get(key)!;
            currentSubtree.tag = `=${cached} (HIT)`;
            currentSubtree.status = 'visited';
            steps.push({
              thematicMeta: { type: 'grid', grid: makeGridMeta('memo-hit', cached) },
              current: { i: r, j: c },
              tree: cloneTree(rootTree),
              message: `⚡ 【备忘录命中剪枝】memo[${r}][${c}] 命中历史缓存 ${cached}！直接 O(1) 查表返回，彻底跳过重复递归子树！`,
              log: `memo hit: memo[${r}][${c}] = ${cached}`,
              codeLine: { java: 13, python: 7, cpp: 9, javascript: 4 },
              metrics: { '当前格子': `(${r}, ${c})`, '备忘录命中': cached, '剪枝效率': 'O(1)' },
              vars: [
                { name: 'i (当前行)', value: String(r), type: 'number' },
                { name: 'j (当前列)', value: String(c), type: 'number' },
                { name: 'memo 缓存命中', value: String(cached), type: 'number', changed: true },
                { name: '剪枝效益', value: '省去重复子树展开', type: 'string' },
              ],
            });
            pathStack.pop();
            return cached;
          }

          // 4. Branch 1: Left branch (dfs(i, j - 1))
          steps.push({
            thematicMeta: { type: 'grid', grid: makeGridMeta('explore-right', 1) },
            current: { i: r, j: c },
            tree: cloneTree(rootTree),
            message: `⬅️ 【发起向左逆推】在 (${r}, ${c}) 执行 int left = dfs(i, j - 1) ➔ 向左递归到达前驱坐标 (${r}, ${c - 1})。`,
            log: `call left: dfs(${r}, ${c - 1})`,
            codeLine: isMemo
              ? { java: 17, python: 8, cpp: 10, javascript: 5 }
              : { java: 12, python: 7, cpp: 8, javascript: 4 },
            metrics: { '当前格子': `(${r}, ${c})`, '执行动作': '⬅️ 向左逆推' },
            vars: [
              { name: 'i (当前行)', value: String(r), type: 'number' },
              { name: 'j (当前列)', value: String(c), type: 'number' },
              { name: '向左分支调用', value: `dfs(${r}, ${c - 1})`, type: 'string', changed: true },
            ],
          });

          const leftNode = createTreeNode(r, c - 1);
          currentSubtree.children = [leftNode];
          const leftVal = recurseGridBackward(r, c - 1, leftNode, depth + 1, r, c);

          // 5. Branch 2: Up branch (dfs(i - 1, j))
          steps.push({
            thematicMeta: { type: 'grid', grid: makeGridMeta('explore-down', leftVal) },
            current: { i: r, j: c },
            tree: cloneTree(rootTree),
            message: `⬆️ 【发起向上逆推】在 (${r}, ${c}) 执行 int up = dfs(i - 1, j) ➔ 向上递归到达前驱坐标 (${r - 1}, ${c})。`,
            log: `call up: dfs(${r - 1}, ${c})`,
            codeLine: isMemo
              ? { java: 18, python: 9, cpp: 11, javascript: 6 }
              : { java: 13, python: 8, cpp: 9, javascript: 5 },
            metrics: { '当前格子': `(${r}, ${c})`, '执行动作': '⬆️ 向上逆推' },
            vars: [
              { name: 'i (当前行)', value: String(r), type: 'number' },
              { name: 'j (当前列)', value: String(c), type: 'number' },
              { name: '向上分支调用', value: `dfs(${r - 1}, ${c})`, type: 'string', changed: true },
            ],
          });

          const upNode = createTreeNode(r - 1, c);
          if (!currentSubtree.children) currentSubtree.children = [];
          currentSubtree.children.push(upNode);
          const upVal = recurseGridBackward(r - 1, c, upNode, depth + 1, r, c);

          // 6. Merge & Return (or Memo Write)
          const total = leftVal + upVal;
          if (isMemo) memoCache.set(key, total);

          currentSubtree.tag = `=${total}`;
          currentSubtree.status = 'visited';

          steps.push({
            thematicMeta: { type: 'grid', grid: makeGridMeta('backtrack', total) },
            current: { i: r, j: c },
            tree: cloneTree(rootTree),
            message: isMemo
              ? `💾 【回溯归并与写缓存】回溯至 (${r}, ${c})：左方解 left (${leftVal}) + 上方解 up (${upVal}) ➔ 写入 memo[${r}][${c}] = ${total}，return ${total}。`
              : `🔄 【回溯归并】回溯至 (${r}, ${c})：左方解 left (${leftVal}) + 上方解 up (${upVal}) ➔ 归并 return ${total} 条路径。`,
            log: `return: dfs(${r}, ${c}) = ${total}`,
            codeLine: isMemo
              ? { java: 19, python: 10, cpp: 12, javascript: 7 }
              : { java: 14, python: 9, cpp: 10, javascript: 6 },
            metrics: { '当前格子': `(${r}, ${c})`, '计算结果': total, '总递归调用': calls },
            vars: [
              { name: 'i (当前行)', value: String(r), type: 'number' },
              { name: 'j (当前列)', value: String(c), type: 'number' },
              { name: '左方路径 (left)', value: String(leftVal), type: 'number' },
              { name: '上方路径 (up)', value: String(upVal), type: 'number' },
              { name: '合并路径数 (left+up)', value: String(total), type: 'number', changed: true },
            ],
          });

          pathStack.pop();
          return total;
        }

        const ans = recurseGridBackward(rootRow, rootCol, rootTree, 1);

        steps.push({
          thematicMeta: {
            type: 'grid',
            grid: {
              rows: m,
              cols: n,
              curRow: 0,
              curCol: 0,
              pathStack: [],
              visitedCells: Array.from(visitedCoords).map((k) => k.split(',').map(Number) as [number, number]),
              pathCount: ans,
              status: 'completed',
            },
          },
          current: { i: 0, j: 0 },
          tree: cloneTree(rootTree),
          message: `🏁 【递归全景搜索完毕】最终计算出从起点 (0, 0) 到终点 (${m - 1}, ${n - 1}) 的不同路径总数为 ${ans} 条。总递归调用次数：${calls} 次！`,
          log: `finish: total paths = ${ans}, total calls = ${calls}`,
          codeLine: isMemo
            ? { java: 5, python: 11, cpp: 5, javascript: 9 }
            : { java: 4, python: 9, cpp: 4, javascript: 7 },
          metrics: { '最终路径数': ans, '总递归调用': calls, '时空复杂度': isMemo ? `O(${m}×${n})` : 'O(2^(m+n))' },
          vars: [
            { name: '最终路径总数', value: String(ans), type: 'number', changed: true },
            { name: '总递归调用次数', value: `${calls} 次`, type: 'string' },
            { name: '状态剪枝分析', value: isMemo ? 'O(m×n) 线性剪枝 ⚡' : '重叠子问题指数级膨胀 ⚠️', type: 'string' },
          ],
        });
      } else {
        // =========================================================
        // 正向递归 (从起点 (0, 0) 向前探索到终点 (m-1, n-1))
        // =========================================================
        const rootRow = 0;
        const rootCol = 0;
        const rootTree = createTreeNode(rootRow, rootCol);
        const pathStack: Array<[number, number]> = [];
        const visitedCoords = new Set<string>();

        // Step 0: Main entry
        steps.push({
          thematicMeta: {
            type: 'grid',
            grid: {
              rows: m,
              cols: n,
              curRow: 0,
              curCol: 0,
              parentRow: 0,
              parentCol: 0,
              pathStack: [[0, 0]],
              visitedCells: [[0, 0]],
              pathCount: 1,
              status: 'enter',
            },
          },
          current: { i: 0, j: 0 },
          tree: cloneTree(rootTree),
          message: `🚀 【主函数入口】调用 uniquePaths(${m}, ${n})，探险家从左上角起点 (0, 0) 🚩 出发自顶向下递归探索。`,
          log: `entry: uniquePaths(m=${m}, n=${n})`,
          codeLine: isMemo
            ? { java: 5, python: 10, cpp: 6, javascript: 9 }
            : { java: 4, python: 8, cpp: 4, javascript: 7 },
          metrics: { '当前阶段': '🚀 主函数入口', '当前起点': '(0, 0)', '终点目标': `(${m - 1}, ${n - 1})`, '总递归调用': 0 },
          vars: [
            { name: 'i (当前行)', value: '0', type: 'number' },
            { name: 'j (当前列)', value: '0', type: 'number' },
            { name: '终点目标', value: `(${m - 1}, ${n - 1})`, type: 'string' },
            { name: 'm (总行数)', value: String(m), type: 'number' },
            { name: 'n (总列数)', value: String(n), type: 'number' },
          ],
        });

        function recurseGrid(
          r: number,
          c: number,
          currentSubtree: DpTreeNode,
          depth: number,
          parentR: number = 0,
          parentC: number = 0
        ): number {
          calls++;
          const key = `${r},${c}`;
          currentSubtree.status = 'current';

          const isInBounds = r >= 0 && r < m && c >= 0 && c < n;
          if (isInBounds) {
            pathStack.push([r, c]);
            visitedCoords.add(key);
          }

          const makeGridMeta = (status: any, pathCountVal: number = 1) => ({
            rows: m,
            cols: n,
            curRow: r,
            curCol: c,
            parentRow: parentR,
            parentCol: parentC,
            obstacles,
            pathStack: [...pathStack],
            visitedCells: Array.from(visitedCoords).map((k) => k.split(',').map(Number) as [number, number]),
            pathCount: pathCountVal,
            status,
          });

          // 1. Enter function header
          steps.push({
            thematicMeta: { type: 'grid', grid: makeGridMeta('enter', 1) },
            current: { i: r, j: c },
            tree: cloneTree(rootTree),
            message: `📥 【进入 dfs 函数】执行 dfs(i = ${r}, j = ${c}, m = ${m}, n = ${n})，探索从 (${r}, ${c}) 通往终点的路径。`,
            log: `dfs(${r}, ${c}, ${m}, ${n}) [调用 #${calls}]`,
            codeLine: isMemo
              ? { java: 7, python: 4, cpp: 8, javascript: 3 }
              : { java: 6, python: 4, cpp: 6, javascript: 2 },
            metrics: { '当前格子': `(${r}, ${c})`, '递归深度': depth, '总递归调用': calls },
            vars: [
              { name: 'i (当前行)', value: String(r), type: 'number', changed: true },
              { name: 'j (当前列)', value: String(c), type: 'number', changed: true },
              { name: '递归深度', value: `第 ${depth} 层`, type: 'string' },
              { name: 'm (总行数)', value: String(m), type: 'number' },
              { name: 'n (总列数)', value: String(n), type: 'number' },
            ],
          });

          // Obstacle check
          if (obstacles.some(([or, oc]) => or === r && oc === c)) {
            currentSubtree.tag = '=0 (🚧 障碍)';
            currentSubtree.status = 'visited';
            steps.push({
              thematicMeta: { type: 'grid', grid: makeGridMeta('eval-obstacle', 0) },
              current: { i: r, j: c },
              tree: cloneTree(rootTree),
              message: `🚧 【遇到障碍物】坐标 (${r}, ${c}) 为障碍物 🚧，机器人无法站立通行，返回 0！`,
              log: `obstacle: (${r}, ${c}) ➔ return 0`,
              codeLine: isMemo
                ? { java: 8, python: 5, cpp: 8, javascript: 3 }
                : { java: 7, python: 5, cpp: 7, javascript: 3 },
              metrics: { '当前格子': `(${r}, ${c})`, '返回值': 0, '状态': '🚧 遇到障碍物' },
              vars: [
                { name: 'i (当前行)', value: String(r), type: 'number' },
                { name: 'j (当前列)', value: String(c), type: 'number' },
                { name: '障碍拦截', value: '0 (不可通行)', type: 'string', changed: true },
                { name: 'm (总行数)', value: String(m), type: 'number' },
                { name: 'n (总列数)', value: String(n), type: 'number' },
              ],
            });
            pathStack.pop();
            return 0;
          }

          // 2. Base Case: Reached goal (m-1, n-1)
          if (r === m - 1 && c === n - 1) {
            currentSubtree.tag = '=1';
            currentSubtree.status = 'visited';
            steps.push({
              thematicMeta: { type: 'grid', grid: makeGridMeta('eval-goal', 1) },
              current: { i: r, j: c },
              tree: cloneTree(rootTree),
              message: `🏆 【Base Case 命中】i (${r}) == m - 1 (${m - 1}) 且 j (${c}) == n - 1 (${n - 1})！成功抵达终点 (${r}, ${c})！返回 1。`,
              log: `base: reach goal (${r}, ${c}) ➔ 1`,
              codeLine: isMemo
                ? { java: 8, python: 5, cpp: 9, javascript: 4 }
                : { java: 7, python: 5, cpp: 7, javascript: 3 },
              metrics: { '当前格子': `(${r}, ${c})`, '返回值': 1, '总递归调用': calls },
              vars: [
                { name: 'i (当前行)', value: String(r), type: 'number' },
                { name: 'j (当前列)', value: String(c), type: 'number' },
                { name: '有效通路', value: '1 (已通达终点 🏆)', type: 'string', changed: true },
                { name: 'm (总行数)', value: String(m), type: 'number' },
                { name: 'n (总列数)', value: String(n), type: 'number' },
              ],
            });
            pathStack.pop();
            return 1;
          }

          // 3. Out of bounds check
          if (r >= m || c >= n) {
            currentSubtree.tag = '=0';
            currentSubtree.status = 'visited';
            steps.push({
              thematicMeta: { type: 'grid', grid: makeGridMeta('out-of-bounds', 0) },
              current: { i: r, j: c },
              tree: cloneTree(rootTree),
              message: `🚧 【越界判断】坐标 (${r}, ${c}) 超出网格范围 (m = ${m}, n = ${n})，不可通行，执行 return 0。`,
              log: `out of bounds: (${r}, ${c}) ➔ 0`,
              codeLine: isMemo
                ? { java: 9, python: 6, cpp: 10, javascript: 5 }
                : { java: 8, python: 6, cpp: 8, javascript: 4 },
              metrics: { '当前格子': `(${r}, ${c})`, '返回值': 0, '总递归调用': calls },
              vars: [
                { name: 'i (当前行)', value: String(r), type: 'number' },
                { name: 'j (当前列)', value: String(c), type: 'number' },
                { name: '越界拦截', value: '不可通行 (0)', type: 'string', changed: true },
                { name: 'm (总行数)', value: String(m), type: 'number' },
                { name: 'n (总列数)', value: String(n), type: 'number' },
              ],
            });
            return 0;
          }

          // 4. Memo check
          if (isMemo && memoCache.has(key)) {
            const cached = memoCache.get(key)!;
            currentSubtree.tag = `=${cached} (HIT)`;
            currentSubtree.status = 'visited';
            steps.push({
              thematicMeta: { type: 'grid', grid: makeGridMeta('memo-hit', cached) },
              current: { i: r, j: c },
              tree: cloneTree(rootTree),
              message: `⚡ 【备忘录命中剪枝】memo[${r}][${c}] 命中历史缓存 ${cached}！直接 O(1) 查表返回，彻底跳过重复递归子树！`,
              log: `memo hit: memo[${r}][${c}] = ${cached}`,
              codeLine: { java: 10, python: 7, cpp: 10, javascript: 5 },
              metrics: { '当前格子': `(${r}, ${c})`, '备忘录命中': cached, '剪枝效率': 'O(1)' },
              vars: [
                { name: 'i (当前行)', value: String(r), type: 'number' },
                { name: 'j (当前列)', value: String(c), type: 'number' },
                { name: 'memo 缓存命中', value: String(cached), type: 'number', changed: true },
                { name: '剪枝效益', value: '省去重复子树展开', type: 'string' },
              ],
            });
            return cached;
          }

          // 5. Down branch
          steps.push({
            thematicMeta: { type: 'grid', grid: makeGridMeta('explore-down', 1) },
            current: { i: r, j: c },
            tree: cloneTree(rootTree),
            message: `⬇️ 【向下探索】探险家从 (${r}, ${c}) 向下迈进一步 ➔ dfs(${r + 1}, ${c})。`,
            log: `call down: dfs(${r + 1}, ${c})`,
            codeLine: isMemo
              ? { java: 11, python: 8, cpp: 11, javascript: 6 }
              : { java: 10, python: 6, cpp: 8, javascript: 4 },
            metrics: { '当前格子': `(${r}, ${c})`, '执行动作': '⬇️ 向下探索' },
            vars: [
              { name: 'i (当前行)', value: String(r), type: 'number' },
              { name: 'j (当前列)', value: String(c), type: 'number' },
              { name: '向下分支调用', value: `dfs(${r + 1}, ${c})`, type: 'string', changed: true },
            ],
          });

          const downNode = createTreeNode(r + 1, c);
          currentSubtree.children = [downNode];
          const downVal = recurseGrid(r + 1, c, downNode, depth + 1, r, c);

          // 6. Right branch
          steps.push({
            thematicMeta: { type: 'grid', grid: makeGridMeta('explore-right', downVal) },
            current: { i: r, j: c },
            tree: cloneTree(rootTree),
            message: `➡️ 【向右探索】探险家从 (${r}, ${c}) 向右迈进一步 ➔ dfs(${r}, ${c + 1})。`,
            log: `call right: dfs(${r}, ${c + 1})`,
            codeLine: isMemo
              ? { java: 12, python: 8, cpp: 11, javascript: 6 }
              : { java: 11, python: 6, cpp: 8, javascript: 4 },
            metrics: { '当前格子': `(${r}, ${c})`, '执行动作': '➡️ 向右探索' },
            vars: [
              { name: 'i (当前行)', value: String(r), type: 'number' },
              { name: 'j (当前列)', value: String(c), type: 'number' },
              { name: '向右分支调用', value: `dfs(${r}, ${c + 1})`, type: 'string', changed: true },
            ],
          });

          const rightNode = createTreeNode(r, c + 1);
          if (!currentSubtree.children) currentSubtree.children = [];
          currentSubtree.children.push(rightNode);
          const rightVal = recurseGrid(r, c + 1, rightNode, depth + 1, r, c);

          // 7. Merge & return
          const total = downVal + rightVal;
          if (isMemo) memoCache.set(key, total);

          currentSubtree.tag = `=${total}`;
          currentSubtree.status = 'visited';

          steps.push({
            thematicMeta: { type: 'grid', grid: makeGridMeta('backtrack', total) },
            current: { i: r, j: c },
            tree: cloneTree(rootTree),
            message: isMemo
              ? `💾 【回溯与写缓存】回溯至 (${r}, ${c})：下路 (${downVal}) + 右路 (${rightVal}) ➔ 写入 memo[${r}][${c}] = ${total}，return ${total}。`
              : `🔄 【回溯归并】回溯至 (${r}, ${c})：下路 (${downVal}) + 右路 (${rightVal}) ➔ 归并 return ${total}。`,
            log: `return: (${r}, ${c}) = ${total}`,
            codeLine: isMemo
              ? { java: 13, python: 9, cpp: 12, javascript: 7 }
              : { java: 12, python: 7, cpp: 9, javascript: 5 },
            metrics: { '当前格子': `(${r}, ${c})`, '向下路径': downVal, '向右路径': rightVal, '合计路径': total },
            vars: [
              { name: 'i (当前行)', value: String(r), type: 'number' },
              { name: 'j (当前列)', value: String(c), type: 'number' },
              { name: '向下 down', value: String(downVal), type: 'number' },
              { name: '向右 right', value: String(rightVal), type: 'number' },
              { name: isMemo ? '写入 memo 缓存' : '当前可行路径', value: String(total), type: 'number', changed: true },
              { name: 'm (总行数)', value: String(m), type: 'number' },
              { name: 'n (总列数)', value: String(n), type: 'number' },
            ],
          });

          pathStack.pop();
          return total;
        }

        const totalAns = recurseGrid(rootRow, rootCol, rootTree, 1, 0, 0);

        steps.push({
          thematicMeta: {
            type: 'grid',
            grid: {
              rows: m,
              cols: n,
              curRow: 0,
              curCol: 0,
              pathStack: [],
              visitedCells: Array.from(visitedCoords).map((k) => k.split(',').map(Number) as [number, number]),
              pathCount: totalAns,
              status: 'completed',
            },
          },
          current: { i: 0, j: 0 },
          tree: cloneTree(rootTree),
          message: `🏁 【正向递归推演完毕】探险家完成所有路径探索！终点可达路径总数为 ${totalAns} 条，总递归调用：${calls} 次。`,
          log: `completed: totalPaths=${totalAns}, calls=${calls}`,
          codeLine: isMemo
            ? { java: 5, python: 10, cpp: 6, javascript: 9 }
            : { java: 4, python: 8, cpp: 4, javascript: 7 },
          metrics: { '最终路径总数': totalAns, '总递归调用': calls, '计算状态': '✅ 演化演示完毕' },
          vars: [
            { name: '最终路径总数', value: String(totalAns), type: 'number', changed: true },
            { name: '总函数调用次数', value: String(calls), type: 'number' },
          ],
        });
      }

      return steps;
    }

    return null;
  }
}
