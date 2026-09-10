/**
 * 左程云《算法讲解067【必备】从递归入手二维动态规划》教学数据仓 (DDD)
 * 涵盖：
 * 1. Code01_MinimumPathSum (LeetCode 64 最小路径和)
 * 2. Code02_WordSearch (LeetCode 79 单词搜索 - 递归反例/无后效性辨析)
 * 3. Code03_LongestCommonSubsequence (LeetCode 1143 最长公共子序列)
 * 4. Code04_LongestPalindromicSubsequence (LeetCode 516 最长回文子序列)
 * 5. Code05_NodenHeightNotLargerThanm (节点数为n高度不大于m的二叉树结构数)
 * 6. Code06_LongestIncreasingPath (LeetCode 329 矩阵中的最长递增路径)
 */

export interface Dp067ProblemData {
  id: string;
  name: string;
  subtitle: string;
  leetcodeNumber?: number;
  leetcodeUrl?: string;
  problemHtml: string;
  analysisHtml: string;
  codeLanguages: Record<string, string[]>;
}

export const DP_067_PROBLEMS: Record<string, Dp067ProblemData> = {
  'min-path-sum': {
    id: 'min-path-sum',
    name: '最小路径和 (Minimum Path Sum)',
    subtitle: 'LeetCode 64 · 从左上到右下的网格路径优化基准',
    leetcodeNumber: 64,
    leetcodeUrl: 'https://leetcode.cn/problems/minimum-path-sum/',
    problemHtml: `
      <div class="problem-content">
        <h3>LeetCode 64. 最小路径和</h3>
        <p>给定一个包含非负整数的 <code>m x n</code> 网格 <code>grid</code> ，请找出一条从左上角到右下角的路径，使得路径上的数字总和为最小。</p>
        <p><strong>说明：</strong>每次只能向下或者向右移动一步。</p>
        <h4>输入样例</h4>
        <pre><code>grid = [
  [1, 3, 1],
  [1, 5, 1],
  [4, 2, 1]
]</code></pre>
        <h4>输出样例</h4>
        <pre><code>7
解释：路径 1 → 3 → 1 → 1 → 1 的总和最小，值为 7。</code></pre>
      </div>
    `,
    analysisHtml: `
      <div class="analysis-content">
        <h3>左程云 算法讲解067 最小路径和推演核心</h3>
        <h4>1. 递归尝试思路</h4>
        <p>定义 <code>f(i, j)</code> 为从 <code>(0, 0)</code> 走到 <code>(i, j)</code> 的最小路径和。到达 <code>(i, j)</code> 只能从上方 <code>(i-1, j)</code> 或左方 <code>(i, j-1)</code> 走来：</p>
        <pre><code>f(i, j) = grid[i][j] + min(f(i-1, j), f(i, j-1))</code></pre>
        <h4>2. 记忆化搜索</h4>
        <p>可变参数为行 <code>i</code> 和列 <code>j</code>，完全决定返回值。引入 <code>memo[i][j]</code> 避免重复遍历重叠子问题。</p>
        <h4>3. 严格二维表</h4>
        <p>第一行只能从左往右走，第一列只能从上往下走。普通格子依赖其上方和左方的已知结果，按行从左到右填表。</p>
        <h4>4. 空间压缩优化</h4>
        <p>由于计算第 <code>i</code> 行仅依赖上一行 <code>dp[j]</code> 和当前行左侧 <code>dp[j-1]</code>，可以压缩为一维长度为 <code>min(m, n)</code> 的数组滚动更新，空间复杂度降至 <code>O(min(m, n))</code>。</p>
      </div>
    `,
    codeLanguages: {
      java: [
        '// 最小路径和 - 空间压缩版 (左程云 class067 Code01)',
        'public static int minPathSum(int[][] grid) {',
        '    int m = grid.length, n = grid[0].length;',
        '    int[] dp = new int[n];',
        '    dp[0] = grid[0][0];',
        '    for (int j = 1; j < n; j++) dp[j] = dp[j - 1] + grid[0][j];',
        '    for (int i = 1; i < m; i++) {',
        '        dp[0] += grid[i][0];',
        '        for (int j = 1; j < n; j++) {',
        '            dp[j] = Math.min(dp[j], dp[j - 1]) + grid[i][j];',
        '        }',
        '    }',
        '    return dp[n - 1];',
        '}',
      ],
      cpp: [
        '// 最小路径和 - C++ 空间压缩',
        'int minPathSum(vector<vector<int>>& grid) {',
        '    int m = grid.size(), n = grid[0].size();',
        '    vector<int> dp(n);',
        '    dp[0] = grid[0][0];',
        '    for (int j = 1; j < n; ++j) dp[j] = dp[j - 1] + grid[0][j];',
        '    for (int i = 1; i < m; ++i) {',
        '        dp[0] += grid[i][0];',
        '        for (int j = 1; j < n; ++j) {',
        '            dp[j] = min(dp[j], dp[j - 1]) + grid[i][j];',
        '        }',
        '    }',
        '    return dp[n - 1];',
        '}',
      ],
      python: [
        '# 最小路径和 - Python 空间压缩',
        'def minPathSum(grid: list[list[int]]) -> int:',
        '    m, n = len(grid), len(grid[0])',
        '    dp = [0] * n',
        '    dp[0] = grid[0][0]',
        '    for j in range(1, n):',
        '        dp[j] = dp[j - 1] + grid[0][j]',
        '    for i in range(1, m):',
        '        dp[0] += grid[i][0]',
        '        for j in range(1, n):',
        '            dp[j] = min(dp[j], dp[j - 1]) + grid[i][j]',
        '    return dp[-1]',
      ],
      rust: [
        '// 最小路径和 - Rust 空间压缩',
        'pub fn min_path_sum(grid: Vec<Vec<i32>>) -> i32 {',
        '    let (m, n) = (grid.len(), grid[0].len());',
        '    let mut dp = vec![0; n];',
        '    dp[0] = grid[0][0];',
        '    for j in 1..n { dp[j] = dp[j - 1] + grid[0][j]; }',
        '    for i in 1..m {',
        '        dp[0] += grid[i][0];',
        '        for j in 1..n {',
        '            dp[j] = dp[j].min(dp[j - 1]) + grid[i][j];',
        '        }',
        '    }',
        '    dp[n - 1]',
        '}',
      ],
    },
  },

  'word-search': {
    id: 'word-search',
    name: '单词搜索 (Word Search)',
    subtitle: 'LeetCode 79 · 递归路径回溯与无后效性辨析反例',
    leetcodeNumber: 79,
    leetcodeUrl: 'https://leetcode.cn/problems/word-search/',
    problemHtml: `
      <div class="problem-content">
        <h3>LeetCode 79. 单词搜索</h3>
        <p>给定一个 <code>m x n</code> 二维字符网格 <code>board</code> 和一个字符串单词 <code>word</code> 。如果 <code>word</code> 存在于网格中，返回 <code>true</code> ；否则，返回 <code>false</code> 。</p>
        <p><strong>规则：</strong>单词必须按照字母顺序，通过相邻的单元格内的字母构成，其中“相邻”单元格是那些水平相邻或垂直相邻的单元格。同一个单元格内的字母不允许被重复使用。</p>
        <h4>输入样例</h4>
        <pre><code>board = [
  ["A","B","C","E"],
  ["S","F","C","S"],
  ["A","D","E","E"]
], word = "ABCCED"</code></pre>
        <h4>输出样例</h4>
        <pre><code>true</code></pre>
      </div>
    `,
    analysisHtml: `
      <div class="analysis-content">
        <h3>左程云 算法讲解067 单词搜索：为什么不能直接改动态规划？</h3>
        <h4>1. 递归尝试与现场恢复</h4>
        <p>定义 <code>f(i, j, k)</code> 表示当前来到网格 <code>(i, j)</code>，匹配单词第 <code>k</code> 个字符。为防止同一个格子被走多次，探索当前格子时将其原地修改（如设为 <code>0</code>），递归四个方向，最后<strong>恢复现场</strong>。</p>
        <h4>2. 无后效性的破坏</h4>
        <p>动态规划的核心前提是<strong>无后效性（未来决策不依赖历史路径具体是怎样到达当前状态的）</strong>。</p>
        <p>而在单词搜索中，到达 <code>(i, j, k)</code> 时，哪些格子被访问过属于历史路径信息。如果把 <code>visited</code> 状态也加入缓存，状态维度暴增到 $O(M \\times N \\times L \\times 2^{M \\times N})$，完全失去记忆化的意义！</p>
        <h4>3. 教学启示</h4>
        <p>左神在 067 课中通过本题重点阐释：<strong>不是所有带重叠形式的递归都能转 DP</strong>，必须严格核验是否具备无后效性！</p>
      </div>
    `,
    codeLanguages: {
      java: [
        '// 单词搜索 - 经典回溯现场恢复 (左程云 class067 Code02)',
        'public static boolean exist(char[][] board, String word) {',
        '    char[] w = word.toCharArray();',
        '    for (int i = 0; i < board.length; i++) {',
        '        for (int j = 0; j < board[0].length; j++) {',
        '            if (dfs(board, i, j, w, 0)) return true;',
        '        }',
        '    }',
        '    return false;',
        '}',
        'private static boolean dfs(char[][] b, int i, int j, char[] w, int k) {',
        '    if (k == w.length) return true;',
        '    if (i < 0 || i >= b.length || j < 0 || j >= b[0].length || b[i][j] != w[k]) return false;',
        '    char tmp = b[i][j];',
        '    b[i][j] = 0; // 标记访问',
        '    boolean ans = dfs(b, i + 1, j, w, k + 1) || dfs(b, i - 1, j, w, k + 1) ||',
        '                  dfs(b, i, j + 1, w, k + 1) || dfs(b, i, j - 1, w, k + 1);',
        '    b[i][j] = tmp; // 恢复现场',
        '    return ans;',
        '}',
      ],
      cpp: [
        '// 单词搜索 - C++ 回溯现场恢复',
        'bool exist(vector<vector<char>>& board, string word) {',
        '    int m = board.size(), n = board[0].size();',
        '    auto dfs = [&](auto& self, int i, int j, int k) -> bool {',
        '        if (k == word.size()) return true;',
        '        if (i < 0 || i >= m || j < 0 || j >= n || board[i][j] != word[k]) return false;',
        '        char tmp = board[i][j];',
        '        board[i][j] = 0;',
        '        bool ans = self(self, i + 1, j, k + 1) || self(self, i - 1, j, k + 1) ||',
        '                   self(self, i, j + 1, k + 1) || self(self, i, j - 1, k + 1);',
        '        board[i][j] = tmp;',
        '        return ans;',
        '    };',
        '    for (int i = 0; i < m; ++i)',
        '        for (int j = 0; j < n; ++j)',
        '            if (dfs(dfs, i, j, 0)) return true;',
        '    return false;',
        '}',
      ],
      python: [
        '# 单词搜索 - Python 回溯现场恢复',
        'def exist(board: list[list[str]], word: str) -> bool:',
        '    m, n, l = len(board), len(board[0]), len(word)',
        '    def dfs(i: int, j: int, k: int) -> bool:',
        '        if k == l: return True',
        '        if not (0 <= i < m and 0 <= j < n) or board[i][j] != word[k]: return False',
        '        tmp = board[i][j]',
        '        board[i][j] = "#"',
        '        res = (dfs(i + 1, j, k + 1) or dfs(i - 1, j, k + 1) or',
        '               dfs(i, j + 1, k + 1) or dfs(i, j - 1, k + 1))',
        '        board[i][j] = tmp',
        '        return res',
        '    return any(dfs(i, j, 0) for i in range(m) for j in range(n))',
      ],
      rust: [
        '// 单词搜索 - Rust 回溯现场恢复',
        'pub fn exist(mut board: Vec<Vec<char>>, word: String) -> bool {',
        '    let w: Vec<char> = word.chars().collect();',
        '    let (m, n) = (board.len(), board[0].len());',
        '    fn dfs(b: &mut Vec<Vec<char>>, i: usize, j: usize, w: &[char], k: usize) -> bool {',
        '        if k == w.len() { return true; }',
        '        if b[i][j] != w[k] { return false; }',
        '        if k + 1 == w.len() { return true; }',
        '        let tmp = b[i][j];',
        '        b[i][j] = \'#\';',
        '        let mut res = false;',
        '        let dirs = [(0, 1), (1, 0), (0, !0), (!0, 0)];',
        '        for (di, dj) in dirs {',
        '            let (ni, nj) = (i.wrapping_add(di), j.wrapping_add(dj));',
        '            if ni < b.len() && nj < b[0].len() && dfs(b, ni, nj, w, k + 1) {',
        '                res = true; break;',
        '            }',
        '        }',
        '        b[i][j] = tmp;',
        '        res',
        '    }',
        '    for i in 0..m { for j in 0..n { if dfs(&mut board, i, j, &w, 0) { return true; } } }',
        '    false',
        '}',
      ],
    },
  },

  'longest-common-subsequence': {
    id: 'longest-common-subsequence',
    name: '最长公共子序列 (LCS)',
    subtitle: 'LeetCode 1143 · 双串二维模型之母与对角线转移',
    leetcodeNumber: 1143,
    leetcodeUrl: 'https://leetcode.cn/problems/longest-common-subsequence/',
    problemHtml: `
      <div class="problem-content">
        <h3>LeetCode 1143. 最长公共子序列</h3>
        <p>给定两个字符串 <code>text1</code> 和 <code>text2</code>，返回这两个字符串的最长 <strong>公共子序列</strong> 的长度。如果不存在公共子序列，返回 <code>0</code> 。</p>
        <p><strong>子序列：</strong>由原字符串在不改变字符相对顺序的情况下删除某些字符（也可以不删除任何字符）后组成的新字符串。</p>
        <h4>输入样例</h4>
        <pre><code>text1 = "abcde", text2 = "ace"</code></pre>
        <h4>输出样例</h4>
        <pre><code>3
解释：最长公共子序列是 "ace" ，它的长度为 3 。</code></pre>
      </div>
    `,
    analysisHtml: `
      <div class="analysis-content">
        <h3>左程云 算法讲解067 最长公共子序列状态转移推演</h3>
        <h4>1. 递归样本对应模型</h4>
        <p>定义 <code>f(i, j)</code> 为 <code>text1[0..i]</code> 与 <code>text2[0..j]</code> 的最长公共子序列长度：</p>
        <ul>
          <li>如果 <code>text1[i] == text2[j]</code>：必然共同作为公共子序列末尾，<code>f(i, j) = 1 + f(i-1, j-1)</code>。</li>
          <li>如果 <code>text1[i] != text2[j]</code>：末尾不可能同时选，<code>f(i, j) = max(f(i-1, j), f(i, j-1))</code>。</li>
        </ul>
        <h4>2. 严格二维位置依赖</h4>
        <p><code>dp[i][j]</code> 依赖左上方 <code>dp[i-1][j-1]</code>、上方 <code>dp[i-1][j]</code> 和左方 <code>dp[i][j-1]</code>。按行从左向右推进。</p>
        <h4>3. 空间压缩技巧</h4>
        <p>由于依赖对角线 <code>dp[i-1][j-1]</code>，用滚动数组压缩至一维时，需要引入局部变量 <code>leftUp</code> 在覆盖前将旧的 <code>dp[j]</code> 保存下来供下一列使用。</p>
      </div>
    `,
    codeLanguages: {
      java: [
        '// 最长公共子序列 - 空间压缩版 (左程云 class067 Code03)',
        'public static int longestCommonSubsequence(String s1, String s2) {',
        '    char[] a = s1.toCharArray(), b = s2.toCharArray();',
        '    int n = a.length, m = b.length;',
        '    int[] dp = new int[m + 1];',
        '    for (int i = 1; i <= n; i++) {',
        '        int leftUp = 0;',
        '        for (int j = 1; j <= m; j++) {',
        '            int backup = dp[j];',
        '            if (a[i - 1] == b[j - 1]) {',
        '                dp[j] = leftUp + 1;',
        '            } else {',
        '                dp[j] = Math.max(dp[j], dp[j - 1]);',
        '            }',
        '            leftUp = backup;',
        '        }',
        '    }',
        '    return dp[m];',
        '}',
      ],
      cpp: [
        '// 最长公共子序列 - C++ 空间压缩',
        'int longestCommonSubsequence(string s1, string s2) {',
        '    int n = s1.size(), m = s2.size();',
        '    vector<int> dp(m + 1, 0);',
        '    for (int i = 1; i <= n; ++i) {',
        '        int leftUp = 0;',
        '        for (int j = 1; j <= m; ++j) {',
        '            int backup = dp[j];',
        '            if (s1[i - 1] == s2[j - 1]) dp[j] = leftUp + 1;',
        '            else dp[j] = max(dp[j], dp[j - 1]);',
        '            leftUp = backup;',
        '        }',
        '    }',
        '    return dp[m];',
        '}',
      ],
      python: [
        '# 最长公共子序列 - Python 空间压缩',
        'def longestCommonSubsequence(text1: str, text2: str) -> int:',
        '    n, m = len(text1), len(text2)',
        '    dp = [0] * (m + 1)',
        '    for i in range(1, n + 1):',
        '        leftUp = 0',
        '        for j in range(1, m + 1):',
        '            backup = dp[j]',
        '            if text1[i - 1] == text2[j - 1]:',
        '                dp[j] = leftUp + 1',
        '            else:',
        '                dp[j] = max(dp[j], dp[j - 1])',
        '            leftUp = backup',
        '    return dp[m]',
      ],
      rust: [
        '// 最长公共子序列 - Rust 空间压缩',
        'pub fn longest_common_subsequence(text1: String, text2: String) -> i32 {',
        '    let (a, b) = (text1.as_bytes(), text2.as_bytes());',
        '    let (n, m) = (a.len(), b.len());',
        '    let mut dp = vec![0; m + 1];',
        '    for i in 1..=n {',
        '        let mut left_up = 0;',
        '        for j in 1..=m {',
        '            let backup = dp[j];',
        '            dp[j] = if a[i - 1] == b[j - 1] { left_up + 1 } else { dp[j].max(dp[j - 1]) };',
        '            left_up = backup;',
        '        }',
        '    }',
        '    dp[m]',
        '}',
      ],
    },
  },

  'longest-palindromic-subsequence': {
    id: 'longest-palindromic-subsequence',
    name: '最长回文子序列 (LPS)',
    subtitle: 'LeetCode 516 · 区间 DP 经典与半三角矩阵填表',
    leetcodeNumber: 516,
    leetcodeUrl: 'https://leetcode.cn/problems/longest-palindromic-subsequence/',
    problemHtml: `
      <div class="problem-content">
        <h3>LeetCode 516. 最长回文子序列</h3>
        <p>给你一个字符串 <code>s</code> ，找出其中最长的回文子序列，并返回该序列的长度。</p>
        <p><strong>子序列：</strong>不改变剩余字符相对位置的情况下，可以删除某些字符或不删除字符形成的一个序列。</p>
        <h4>输入样例</h4>
        <pre><code>s = "bbbab"</code></pre>
        <h4>输出样例</h4>
        <pre><code>4
解释：一个可能的最长回文子序列为 "bbbb" 。</code></pre>
      </div>
    `,
    analysisHtml: `
      <div class="analysis-content">
        <h3>左程云 算法讲解067 最长回文子序列区间DP推演</h3>
        <h4>1. 区间递归模型</h4>
        <p>定义 <code>f(l, r)</code> 为子串 <code>s[l..r]</code> 的最长回文子序列长度：</p>
        <ul>
          <li>Base Case：<code>l == r</code> 时返回 1；<code>l == r - 1</code> 时，若字符相等返回 2，否则返回 1。</li>
          <li>如果 <code>s[l] == s[r]</code>：首尾共同构成回文外层，<code>f(l, r) = 2 + f(l+1, r-1)</code>。</li>
          <li>如果 <code>s[l] != s[r]</code>：不可能同时选，<code>f(l, r) = max(f(l+1, r), f(l, r-1))</code>。</li>
        </ul>
        <h4>2. 填表顺序 (自底向上或按区间长度)</h4>
        <p>状态表为右上三角半矩阵。<code>dp[l][r]</code> 依赖左方 <code>dp[l][r-1]</code>、下方 <code>dp[l+1][r]</code> 和左下方 <code>dp[l+1][r-1]</code>。因此必须<strong>行从大到小（自底向上）、列从小到大</strong>填表。</p>
      </div>
    `,
    codeLanguages: {
      java: [
        '// 最长回文子序列 - 空间压缩 (左程云 class067 Code04)',
        'public static int longestPalindromeSubseq(String s) {',
        '    char[] str = s.toCharArray();',
        '    int n = str.length;',
        '    int[] dp = new int[n];',
        '    for (int l = n - 1; l >= 0; l--) {',
        '        dp[l] = 1;',
        '        if (l + 1 < n) {',
        '            int leftDown = 0;',
        '            for (int r = l + 1; r < n; r++) {',
        '                int backup = dp[r];',
        '                if (str[l] == str[r]) {',
        '                    dp[r] = 2 + leftDown;',
        '                } else {',
        '                    dp[r] = Math.max(dp[r], dp[r - 1]);',
        '                }',
        '                leftDown = backup;',
        '            }',
        '        }',
        '    }',
        '    return dp[n - 1];',
        '}',
      ],
      cpp: [
        '// 最长回文子序列 - C++ 空间压缩',
        'int longestPalindromeSubseq(string s) {',
        '    int n = s.size();',
        '    vector<int> dp(n, 0);',
        '    for (int l = n - 1; l >= 0; --l) {',
        '        dp[l] = 1;',
        '        if (l + 1 < n) {',
        '            int leftDown = 0;',
        '            for (int r = l + 1; r < n; ++r) {',
        '                int backup = dp[r];',
        '                if (s[l] == s[r]) dp[r] = 2 + leftDown;',
        '                else dp[r] = max(dp[r], dp[r - 1]);',
        '                leftDown = backup;',
        '            }',
        '        }',
        '    }',
        '    return dp[n - 1];',
        '}',
      ],
      python: [
        '# 最长回文子序列 - Python 空间压缩',
        'def longestPalindromeSubseq(s: str) -> int:',
        '    n = len(s)',
        '    dp = [0] * n',
        '    for l in range(n - 1, -1, -1):',
        '        dp[l] = 1',
        '        leftDown = 0',
        '        for r in range(l + 1, n):',
        '            backup = dp[r]',
        '            if s[l] == s[r]:',
        '                dp[r] = 2 + leftDown',
        '            else:',
        '                dp[r] = max(dp[r], dp[r - 1])',
        '            leftDown = backup',
        '    return dp[n - 1]',
      ],
      rust: [
        '// 最长回文子序列 - Rust 空间压缩',
        'pub fn longest_palindrome_subseq(s: String) -> i32 {',
        '    let b = s.as_bytes();',
        '    let n = b.len();',
        '    let mut dp = vec![0; n];',
        '    for l in (0..n).rev() {',
        '        dp[l] = 1;',
        '        let mut left_down = 0;',
        '        for r in (l + 1)..n {',
        '            let backup = dp[r];',
        '            dp[r] = if b[l] == b[r] { 2 + left_down } else { dp[r].max(dp[r - 1]) };',
        '            left_down = backup;',
        '        }',
        '    }',
        '    dp[n - 1]',
        '}',
      ],
    },
  },

  'tree-count-height-m': {
    id: 'tree-count-height-m',
    name: '节点数为n高度不大于m的二叉树结构数',
    subtitle: '牛客网经典题 · 树形规模拆分与二维位置依赖计数DP',
    problemHtml: `
      <div class="problem-content">
        <h3>牛客网: 节点数为 n 高度不大于 m 的二叉树结构数</h3>
        <p>求有多少种不同的二叉树形态，满足：</p>
        <ul>
          <li>二叉树的节点总数恰好为 <code>n</code></li>
          <li>二叉树的高度不超过 <code>m</code></li>
        </ul>
        <p>结果对 <code>1000000007</code> 取模。</p>
        <h4>输入样例</h4>
        <pre><code>n = 5, m = 3</code></pre>
        <h4>输出样例</h4>
        <pre><code>6</code></pre>
      </div>
    `,
    analysisHtml: `
      <div class="analysis-content">
        <h3>左程云 算法讲解067 二叉树结构数核心转移分析</h3>
        <h4>1. 规模拆分递归</h4>
        <p>固定 1 个节点作为根节点，剩下 <code>n - 1</code> 个节点分配给左子树与右子树。</p>
        <p>设左子树分配 <code>k</code> 个节点（$0 \\le k \\le n - 1$），则右子树分配 <code>n - 1 - k</code> 个节点。左右子树高度均不得超过 <code>m - 1</code>：</p>
        <pre><code>dp[i][j] = sum( dp[k][j-1] * dp[i-1-k][j-1] ) (0 <= k < i)</code></pre>
        <h4>2. 填表与优化</h4>
        <p>当计算 <code>dp[i][j]</code> 时，只需要 <code>j-1</code> 列的所有值，即每一列只依赖上一列。时间复杂度为 $O(m \\cdot n^2)$，空间压缩后只需两列数组交互滚动。</p>
      </div>
    `,
    codeLanguages: {
      java: [
        '// 节点数为n高度不大于m的二叉树结构数 (左程云 class067 Code05)',
        'public static int compute(int n, int m) {',
        '    int MOD = 1000000007;',
        '    long[][] dp = new long[n + 1][m + 1];',
        '    for (int j = 0; j <= m; j++) dp[0][j] = 1; // 空树算1种形态且高度为0',
        '    for (int j = 1; j <= m; j++) {',
        '        for (int i = 1; i <= n; i++) {',
        '            long sum = 0;',
        '            for (int k = 0; k < i; k++) {',
        '                sum = (sum + dp[k][j - 1] * dp[i - 1 - k][j - 1]) % MOD;',
        '            }',
        '            dp[i][j] = sum;',
        '        }',
        '    }',
        '    return (int) dp[n][m];',
        '}',
      ],
      cpp: [
        '// C++ 二叉树结构数',
        'int compute(int n, int m) {',
        '    const int MOD = 1000000007;',
        '    vector<vector<long long>> dp(n + 1, vector<long long>(m + 1, 0));',
        '    for (int j = 0; j <= m; ++j) dp[0][j] = 1;',
        '    for (int j = 1; j <= m; ++j) {',
        '        for (int i = 1; i <= n; ++i) {',
        '            long long sum = 0;',
        '            for (int k = 0; k < i; ++k) {',
        '                sum = (sum + dp[k][j - 1] * dp[i - 1 - k][j - 1]) % MOD;',
        '            }',
        '            dp[i][j] = sum;',
        '        }',
        '    }',
        '    return dp[n][m];',
        '}',
      ],
      python: [
        '# Python 二叉树结构数',
        'def compute(n: int, m: int) -> int:',
        '    MOD = 10**9 + 7',
        '    dp = [[0] * (m + 1) for _ in range(n + 1)]',
        '    for j in range(m + 1): dp[0][j] = 1',
        '    for j in range(1, m + 1):',
        '        for i in range(1, n + 1):',
        '            total = 0',
        '            for k in range(i):',
        '                total = (total + dp[k][j - 1] * dp[i - 1 - k][j - 1]) % MOD',
        '            dp[i][j] = total',
        '    return dp[n][m]',
      ],
      rust: [
        '// Rust 二叉树结构数',
        'pub fn compute(n: usize, m: usize) -> i32 {',
        '    const MOD: i64 = 1_000_000_007;',
        '    let mut dp = vec![vec![0i64; m + 1]; n + 1];',
        '    for j in 0..=m { dp[0][j] = 1; }',
        '    for j in 1..=m {',
        '        for i in 1..=n {',
        '            let mut total = 0;',
        '            for k in 0..i {',
        '                total = (total + dp[k][j - 1] * dp[i - 1 - k][j - 1]) % MOD;',
        '            }',
        '            dp[i][j] = total;',
        '        }',
        '    }',
        '    dp[n][m] as i32',
        '}',
      ],
    },
  },

  'longest-increasing-path': {
    id: 'longest-increasing-path',
    name: '矩阵中的最长递增路径 (Longest Increasing Path)',
    subtitle: 'LeetCode 329 · 天然有向无环图 (DAG) 与记忆化搜索典范',
    leetcodeNumber: 329,
    leetcodeUrl: 'https://leetcode.cn/problems/longest-increasing-path-in-a-matrix/',
    problemHtml: `
      <div class="problem-content">
        <h3>LeetCode 329. 矩阵中的最长递增路径</h3>
        <p>给定一个 <code>m x n</code> 整数矩阵 <code>matrix</code> ，找出其中 <strong>最长递增路径</strong> 的长度。</p>
        <p>对于每个单元格，你可以往上，下，左，右四个方向移动。 你 <strong>不能</strong> 在对角线方向上移动或移动到边界外（即不允许环绕）。</p>
        <h4>输入样例</h4>
        <pre><code>matrix = [
  [9, 9, 4],
  [6, 6, 8],
  [2, 1, 1]
]</code></pre>
        <h4>输出样例</h4>
        <pre><code>4
解释：最长递增路径为 [1, 2, 6, 9]。</code></pre>
      </div>
    `,
    analysisHtml: `
      <div class="analysis-content">
        <h3>左程云 算法讲解067 矩阵最长递增路径精讲</h3>
        <h4>1. 为什么无需 visited 数组？</h4>
        <p>因为每一步都必须走向<strong>严格大于</strong>当前格子的相邻单元格！数值严格递增的偏序关系天然阻断了成环可能，整个矩阵在逻辑上构成了一个<strong>有向无环图 (DAG)</strong>，因而具有完美的无后效性！</p>
        <h4>2. 记忆化搜索</h4>
        <p>定义 <code>memo[i][j]</code> 为以 <code>(i, j)</code> 为起点的最长递增路径长度。任意一次计算后存入 <code>memo[i][j]</code>，后续再次访问直接返回，全局时间复杂度从指数级骤降为 $O(M \\times N)$。</p>
      </div>
    `,
    codeLanguages: {
      java: [
        '// 矩阵中的最长递增路径 - 记忆化搜索 (左程云 class067 Code06)',
        'public static int longestIncreasingPath(int[][] matrix) {',
        '    int m = matrix.length, n = matrix[0].length, max = 0;',
        '    int[][] dp = new int[m][n];',
        '    for (int i = 0; i < m; i++) {',
        '        for (int j = 0; j < n; j++) {',
        '            max = Math.max(max, dfs(matrix, i, j, dp));',
        '        }',
        '    }',
        '    return max;',
        '}',
        'private static int dfs(int[][] g, int i, int j, int[][] dp) {',
        '    if (dp[i][j] != 0) return dp[i][j];',
        '    int ans = 1, m = g.length, n = g[0].length;',
        '    int[] dirs = {-1, 0, 1, 0, -1};',
        '    for (int d = 0; d < 4; d++) {',
        '        int ni = i + dirs[d], nj = j + dirs[d + 1];',
        '        if (ni >= 0 && ni < m && nj >= 0 && nj < n && g[ni][nj] > g[i][j]) {',
        '            ans = Math.max(ans, 1 + dfs(g, ni, nj, dp));',
        '        }',
        '    }',
        '    return dp[i][j] = ans;',
        '}',
      ],
      cpp: [
        '// C++ 记忆化搜索',
        'int longestIncreasingPath(vector<vector<int>>& matrix) {',
        '    int m = matrix.size(), n = matrix[0].size(), maxLen = 0;',
        '    vector<vector<int>> dp(m, vector<int>(n, 0));',
        '    int dirs[5] = {-1, 0, 1, 0, -1};',
        '    auto dfs = [&](auto& self, int i, int j) -> int {',
        '        if (dp[i][j]) return dp[i][j];',
        '        int ans = 1;',
        '        for (int d = 0; d < 4; ++d) {',
        '            int ni = i + dirs[d], nj = j + dirs[d + 1];',
        '            if (ni >= 0 && ni < m && nj >= 0 && nj < n && matrix[ni][nj] > matrix[i][j]) {',
        '                ans = max(ans, 1 + self(self, ni, nj));',
        '            }',
        '        }',
        '        return dp[i][j] = ans;',
        '    };',
        '    for (int i = 0; i < m; ++i) {',
        '        for (int j = 0; j < n; ++j) {',
        '            maxLen = max(maxLen, dfs(dfs, i, j));',
        '        }',
        '    }',
        '    return maxLen;',
        '}',
      ],
      python: [
        '# Python 记忆化搜索',
        'def longestIncreasingPath(matrix: list[list[int]]) -> int:',
        '    m, n = len(matrix), len(matrix[0])',
        '    dp = [[0] * n for _ in range(m)]',
        '    def dfs(i: int, j: int) -> int:',
        '        if dp[i][j]: return dp[i][j]',
        '        ans = 1',
        '        for di, dj in ((-1, 0), (1, 0), (0, -1), (0, 1)):',
        '            ni, nj = i + di, j + dj',
        '            if 0 <= ni < m and 0 <= nj < n and matrix[ni][nj] > matrix[i][j]:',
        '                ans = max(ans, 1 + dfs(ni, nj))',
        '        dp[i][j] = ans',
        '        return ans',
        '    return max(dfs(i, j) for i in range(m) for j in range(n))',
      ],
      rust: [
        '// Rust 记忆化搜索',
        'pub fn longest_increasing_path(matrix: Vec<Vec<i32>>) -> i32 {',
        '    let (m, n) = (matrix.len(), matrix[0].len());',
        '    let mut dp = vec![vec![0; n]; m];',
        '    fn dfs(g: &Vec<Vec<i32>>, i: usize, j: usize, dp: &mut Vec<Vec<i32>>) -> i32 {',
        '        if dp[i][j] != 0 { return dp[i][j]; }',
        '        let mut ans = 1;',
        '        let (m, n) = (g.len(), g[0].len());',
        '        let dirs = [(0, 1), (1, 0), (0, !0), (!0, 0)];',
        '        for (di, dj) in dirs {',
        '            let (ni, nj) = (i.wrapping_add(di), j.wrapping_add(dj));',
        '            if ni < m && nj < n && g[ni][nj] > g[i][j] {',
        '                ans = ans.max(1 + dfs(g, ni, nj, dp));',
        '            }',
        '        }',
        '        dp[i][j] = ans;',
        '        ans',
        '    }',
        '    let mut max_len = 0;',
        '    for i in 0..m {',
        '        for j in 0..n {',
        '            max_len = max_len.max(dfs(&matrix, i, j, &mut dp));',
        '        }',
        '    }',
        '    max_len',
        '}',
      ],
    },
  },
};
