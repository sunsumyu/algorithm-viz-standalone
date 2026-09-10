/**
 * 左神算法通关课 Class 084 ~ 088 进阶动态规划专题（第二弹）多语言源码与 1-based 行号映射
 */

export interface CodeMapping {
  java: number;
  cpp: number;
  python: number;
  javascript: number;
}

// ==========================================
// 1. Class 084: 计数 DP 与错排问题
// ==========================================
export const COUNTING_DP_084_CODES: Record<string, string[]> = {
  java: [
    'public long derangement(int n) {', // 1
    '    if (n <= 1) return 0;', // 2
    '    if (n == 2) return 1;', // 3
    '    long prev2 = 0, prev1 = 1, cur = 0;', // 4
    '    for (int i = 3; i <= n; i++) {', // 5
    '        cur = (long)(i - 1) * (prev1 + prev2); // 错排递推公式', // 6
    '        prev2 = prev1;', // 7
    '        prev1 = cur;', // 8
    '    }', // 9
    '    return cur;', // 10
    '}', // 11
  ],
  cpp: [
    'long long derangement(int n) {', // 1
    '    if (n <= 1) return 0;', // 2
    '    if (n == 2) return 1;', // 3
    '    long long prev2 = 0, prev1 = 1, cur = 0;', // 4
    '    for (int i = 3; i <= n; i++) {', // 5
    '        cur = 1LL * (i - 1) * (prev1 + prev2);', // 6
    '        prev2 = prev1;', // 7
    '        prev1 = cur;', // 8
    '    }', // 9
    '    return cur;', // 10
    '}', // 11
  ],
  python: [
    'def derangement(self, n: int) -> int:', // 1
    '    if n <= 1: return 0', // 2
    '    if n == 2: return 1', // 3
    '    prev2, prev1, cur = 0, 1, 0', // 4
    '    for i in range(3, n + 1):', // 5
    '        cur = (i - 1) * (prev1 + prev2) # 错排递推', // 6
    '        prev2, prev1 = prev1, cur', // 7
    '    return cur', // 8
  ],
  javascript: [
    'function derangement(n) {', // 1
    '    if (n <= 1) return 0;', // 2
    '    if (n == 2) return 1;', // 3
    '    let prev2 = 0, prev1 = 1, cur = 0;', // 4
    '    for (let i = 3; i <= n; i++) {', // 5
    '        cur = (i - 1) * (prev1 + prev2);', // 6
    '        prev2 = prev1; prev1 = cur;', // 7
    '    }', // 8
    '    return cur;', // 9
    '}', // 10
  ],
};

export const COUNTING_DP_084_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  baseCases:   { java: 2, cpp: 2, python: 2, javascript: 2 },
  initVars:    { java: 4, cpp: 4, python: 4, javascript: 4 },
  recurrence:  { java: 6, cpp: 6, python: 6, javascript: 6 },
  slideState:  { java: 7, cpp: 7, python: 7, javascript: 7 },
  returnAns:   { java: 10, cpp: 10, python: 8, javascript: 9 },
};

// ==========================================
// 2. Class 085: 博弈概率 DP (Game DP)
// ==========================================
export const GAME_PROBABILITY_085_CODES: Record<string, string[]> = {
  java: [
    'public boolean predictTheWinner(int[] nums) {', // 1
    '    int n = nums.length; int[][] dp = new int[n][n];', // 2
    '    for (int i = 0; i < n; i++) dp[i][i] = nums[i]; // 边界单元素', // 3
    '    for (int len = 2; len <= n; len++) {', // 4
    '        for (int i = 0; i <= n - len; i++) {', // 5
    '            int j = i + len - 1;', // 6
    '            dp[i][j] = Math.max(nums[i] - dp[i + 1][j], nums[j] - dp[i][j - 1]); // 极大极小博弈', // 7
    '        }', // 8
    '    }', // 9
    '    return dp[0][n - 1] >= 0; // 先手相对净胜分非负即胜', // 10
    '}', // 11
  ],
  cpp: [
    'bool predictTheWinner(const vector<int>& nums) {', // 1
    '    int n = nums.size(); vector<vector<int>> dp(n, vector<int>(n, 0));', // 2
    '    for (int i = 0; i < n; i++) dp[i][i] = nums[i];', // 3
    '    for (int len = 2; len <= n; len++) {', // 4
    '        for (int i = 0; i <= n - len; i++) {', // 5
    '            int j = i + len - 1;', // 6
    '            dp[i][j] = max(nums[i] - dp[i + 1][j], nums[j] - dp[i][j - 1]);', // 7
    '        }', // 8
    '    }', // 9
    '    return dp[0][n - 1] >= 0;', // 10
    '}', // 11
  ],
  python: [
    'def predict_the_winner(self, nums: list) -> bool:', // 1
    '    n = len(nums); dp = [[0] * n for _ in range(n)]', // 2
    '    for i in range(n): dp[i][i] = nums[i]', // 3
    '    for length in range(2, n + 1):', // 4
    '        for i in range(n - length + 1):', // 5
    '            j = i + length - 1', // 6
    '            dp[i][j] = max(nums[i] - dp[i + 1][j], nums[j] - dp[i][j - 1]) # 博弈转移', // 7
    '    return dp[0][n - 1] >= 0', // 8
  ],
  javascript: [
    'function predictTheWinner(nums) {', // 1
    '    const n = nums.length; const dp = Array.from({ length: n }, () => new Array(n).fill(0));', // 2
    '    for (let i = 0; i < n; i++) dp[i][i] = nums[i];', // 3
    '    for (let len = 2; len <= n; len++) {', // 4
    '        for (let i = 0; i <= n - len; i++) {', // 5
    '            const j = i + len - 1;', // 6
    '            dp[i][j] = Math.max(nums[i] - dp[i + 1][j], nums[j] - dp[i][j - 1]);', // 7
    '        }', // 8
    '    }', // 9
    '    return dp[0][n - 1] >= 0;', // 10
    '}', // 11
  ],
};

export const GAME_PROBABILITY_085_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  initBase:    { java: 3, cpp: 3, python: 3, javascript: 3 },
  lenLoop:     { java: 4, cpp: 4, python: 4, javascript: 4 },
  minimaxTrans:{ java: 7, cpp: 7, python: 7, javascript: 7 },
  returnJudge: { java: 10, cpp: 10, python: 8, javascript: 10 },
};

// ==========================================
// 3. Class 086: 高阶状压 DP 与 SOS DP
// ==========================================
export const SOS_DP_086_CODES: Record<string, string[]> = {
  java: [
    'public int[] sumOverSubsets(int[] a, int n) {', // 1
    '    int total = 1 << n; int[] dp = Arrays.copyOf(a, total);', // 2
    '    for (int i = 0; i < n; i++) { // 枚举高维立方体维度', // 3
    '        for (int mask = 0; mask < total; mask++) {', // 4
    '            if ((mask & (1 << i)) != 0) { // 若 mask 包含第 i 位', // 5
    '                dp[mask] += dp[mask ^ (1 << i)]; // 累加第 i 位为 0 的子集和', // 6
    '            }', // 7
    '        }', // 8
    '    }', // 9
    '    return dp;', // 10
    '}', // 11
  ],
  cpp: [
    'vector<int> sumOverSubsets(const vector<int>& a, int n) {', // 1
    '    int total = 1 << n; vector<int> dp = a;', // 2
    '    for (int i = 0; i < n; i++) {', // 3
    '        for (int mask = 0; mask < total; mask++) {', // 4
    '            if (mask & (1 << i)) {', // 5
    '                dp[mask] += dp[mask ^ (1 << i)];', // 6
    '            }', // 7
    '        }', // 8
    '    }', // 9
    '    return dp;', // 10
    '}', // 11
  ],
  python: [
    'def sum_over_subsets(self, a: list, n: int) -> list:', // 1
    '    total = 1 << n; dp = list(a)', // 2
    '    for i in range(n): # 逐维前缀和', // 3
    '        for mask in range(total):', // 4
    '            if mask & (1 << i):', // 5
    '                dp[mask] += dp[mask ^ (1 << i)] # 包含第 i 位为 0 的子集', // 6
    '    return dp', // 7
  ],
  javascript: [
    'function sumOverSubsets(a, n) {', // 1
    '    const total = 1 << n; const dp = [...a];', // 2
    '    for (let i = 0; i < n; i++) {', // 3
    '        for (let mask = 0; mask < total; mask++) {', // 4
    '            if (mask & (1 << i)) {', // 5
    '                dp[mask] += dp[mask ^ (1 << i)];', // 6
    '            }', // 7
    '        }', // 8
    '    }', // 9
    '    return dp;', // 10
    '}', // 11
  ],
};

export const SOS_DP_086_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  initDp:      { java: 2, cpp: 2, python: 2, javascript: 2 },
  dimLoop:     { java: 3, cpp: 3, python: 3, javascript: 3 },
  bitCheck:    { java: 5, cpp: 5, python: 5, javascript: 5 },
  addSubset:   { java: 6, cpp: 6, python: 6, javascript: 6 },
  returnDp:    { java: 10, cpp: 10, python: 7, javascript: 10 },
};

// ==========================================
// 4. Class 087: 环形区间 DP 与破环成链
// ==========================================
export const CIRCULAR_INTERVAL_087_CODES: Record<string, string[]> = {
  java: [
    'public int energyNecklace(int[] head, int n) {', // 1
    '    int[] a = new int[2 * n];', // 2
    '    for (int i = 0; i < n; i++) { a[i] = a[i + n] = head[i]; } // 1. 破环成链倍长', // 3
    '    int[][] dp = new int[2 * n][2 * n];', // 4
    '    for (int len = 2; len <= n; len++) { // 枚举区间合并长度', // 5
    '        for (int i = 0; i <= 2 * n - len; i++) {', // 6
    '            int j = i + len - 1;', // 7
    '            for (int k = i; k < j; k++) {', // 8
    '                dp[i][j] = Math.max(dp[i][j], dp[i][k] + dp[k + 1][j] + a[i] * a[k + 1] * a[j + 1]); // 能量聚合', // 9
    '            }', // 10
    '        }', // 11
    '    }', // 12
    '    int ans = 0; for (int i = 0; i < n; i++) ans = Math.max(ans, dp[i][i + n - 1]); // 遍历断点', // 13
    '    return ans;', // 14
    '}', // 15
  ],
  cpp: [
    'int energyNecklace(const vector<int>& head, int n) {', // 1
    '    vector<int> a(2 * n);', // 2
    '    for (int i = 0; i < n; i++) a[i] = a[i + n] = head[i];', // 3
    '    vector<vector<int>> dp(2 * n, vector<int>(2 * n, 0));', // 4
    '    for (int len = 2; len <= n; len++) {', // 5
    '        for (int i = 0; i <= 2 * n - len; i++) {', // 6
    '            int j = i + len - 1;', // 7
    '            for (int k = i; k < j; k++) {', // 8
    '                dp[i][j] = max(dp[i][j], dp[i][k] + dp[k + 1][j] + a[i] * a[k + 1] * a[j + 1]);', // 9
    '            }', // 10
    '        }', // 11
    '    }', // 12
    '    int ans = 0; for (int i = 0; i < n; i++) ans = max(ans, dp[i][i + n - 1]);', // 13
    '    return ans;', // 14
    '}', // 15
  ],
  python: [
    'def energy_necklace(self, head: list, n: int) -> int:', // 1
    '    a = head + head # 破环成链倍长', // 2
    '    dp = [[0] * (2 * n) for _ in range(2 * n)]', // 3
    '    for length in range(2, n + 1):', // 4
    '        for i in range(2 * n - length + 1):', // 5
    '            j = i + length - 1', // 6
    '            for k in range(i, j):', // 7
    '                dp[i][j] = max(dp[i][j], dp[i][k] + dp[k + 1][j] + a[i] * a[k + 1] * a[j + 1])', // 8
    '    return max(dp[i][i + n - 1] for i in range(n))', // 9
  ],
  javascript: [
    'function energyNecklace(head, n) {', // 1
    '    const a = [...head, ...head]; const dp = Array.from({ length: 2 * n }, () => new Array(2 * n).fill(0));', // 2
    '    for (let len = 2; len <= n; len++) {', // 3
    '        for (let i = 0; i <= 2 * n - len; i++) {', // 4
    '            const j = i + len - 1;', // 5
    '            for (let k = i; k < j; k++) {', // 6
    '                dp[i][j] = Math.max(dp[i][j], dp[i][k] + dp[k + 1][j] + a[i] * a[k + 1] * a[j + 1]);', // 7
    '            }', // 8
    '        }', // 9
    '    }', // 10
    '    let ans = 0; for (let i = 0; i < n; i++) ans = Math.max(ans, dp[i][i + n - 1]);', // 11
    '    return ans;', // 12
    '}', // 13
  ],
};

export const CIRCULAR_INTERVAL_087_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  doubleArray: { java: 3, cpp: 3, python: 2, javascript: 2 },
  lenLoop:     { java: 5, cpp: 5, python: 4, javascript: 3 },
  mergeSplit:  { java: 9, cpp: 9, python: 8, javascript: 7 },
  findMaxRing: { java: 13, cpp: 13, python: 9, javascript: 11 },
};

// ==========================================
// 5. Class 088: 树上背包 DP 与泛化物品
// ==========================================
export const TREE_KNAPSACK_088_CODES: Record<string, string[]> = {
  java: [
    'public int courseSchedule(int n, int m, int[] cost, int[] score, List<Integer>[] tree) {', // 1
    '    int[][] dp = new int[n + 1][m + 1];', // 2
    '    dfs(0, m, dp, score, tree); // 从虚拟根 0 启动树上背包', // 3
    '    return dp[0][m];', // 4
    '}', // 5
    'void dfs(int u, int m, int[][] dp, int[] score, List<Integer>[] tree) {', // 6
    '    dp[u][1] = score[u]; // 选择自身', // 7
    '    for (int v : tree[u]) {', // 8
    '        dfs(v, m, dp, score, tree);', // 9
    '        for (int j = m; j >= 1; j--) { // 倒序背包容量', // 10
    '            for (int k = 0; k < j; k++) { // 分配给子树 v 的容量', // 11
    '                dp[u][j] = Math.max(dp[u][j], dp[u][j - k] + dp[v][k]); // 树形泛化物品合并', // 12
    '            }', // 13
    '        }', // 14
    '    }', // 15
    '}', // 16
  ],
  cpp: [
    'int courseSchedule(int n, int m, const vector<int>& score, const vector<vector<int>>& tree) {', // 1
    '    vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));', // 2
    '    dfs(0, m, dp, score, tree);', // 3
    '    return dp[0][m];', // 4
    '}', // 5
    'void dfs(int u, int m, vector<vector<int>>& dp, const vector<int>& score, const vector<vector<int>>& tree) {', // 6
    '    dp[u][1] = score[u];', // 7
    '    for (int v : tree[u]) {', // 8
    '        dfs(v, m, dp, score, tree);', // 9
    '        for (int j = m; j >= 1; j--) {', // 10
    '            for (int k = 0; k < j; k++) {', // 11
    '                dp[u][j] = max(dp[u][j], dp[u][j - k] + dp[v][k]);', // 12
    '            }', // 13
    '        }', // 14
    '    }', // 15
    '}', // 16
  ],
  python: [
    'def course_schedule(self, n: int, m: int, score: list, tree: list) -> int:', // 1
    '    dp = [[0] * (m + 1) for _ in range(n + 1)]', // 2
    '    def dfs(u: int):', // 3
    '        dp[u][1] = score[u]', // 4
    '        for v in tree[u]:', // 5
    '            dfs(v)', // 6
    '            for j in range(m, 0, -1): # 倒序容量', // 7
    '                for k in range(j):', // 8
    '                    dp[u][j] = max(dp[u][j], dp[u][j - k] + dp[v][k]) # 子树背包合并', // 9
    '    dfs(0); return dp[0][m]', // 10
  ],
  javascript: [
    'function courseSchedule(n, m, score, tree) {', // 1
    '    const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));', // 2
    '    function dfs(u) {', // 3
    '        dp[u][1] = score[u];', // 4
    '        for (const v of tree[u]) {', // 5
    '            dfs(v);', // 6
    '            for (let j = m; j >= 1; j--) {', // 7
    '                for (let k = 0; k < j; k++) {', // 8
    '                    dp[u][j] = Math.max(dp[u][j], dp[u][j - k] + dp[v][k]);', // 9
    '                }', // 10
    '            }', // 11
    '        }', // 12
    '    }', // 13
    '    dfs(0); return dp[0][m];', // 14
    '}', // 15
  ],
};

export const TREE_KNAPSACK_088_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  startRoot:   { java: 3, cpp: 3, python: 3, javascript: 3 },
  pickSelf:    { java: 7, cpp: 7, python: 4, javascript: 4 },
  capLoop:     { java: 10, cpp: 10, python: 7, javascript: 7 },
  mergeChild:  { java: 12, cpp: 12, python: 9, javascript: 9 },
  returnMax:   { java: 4, cpp: 4, python: 10, javascript: 14 },
};
