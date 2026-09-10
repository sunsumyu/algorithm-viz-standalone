/**
 * 左神算法通关课 Class 079 ~ 083 进阶动态规划专题 多语言源码与 1-based 行号映射
 */

export interface CodeMapping {
  java: number;
  cpp: number;
  python: number;
  javascript: number;
}

// ==========================================
// 1. Class 079: 数位 DP 基础模型 (Digit DP)
// ==========================================
export const DIGIT_DP_079_CODES: Record<string, string[]> = {
  java: [
    'public int countDigitOne(int n) {', // 1
    '    String s = String.valueOf(n);', // 2
    '    memo = new int[s.length()][s.length()];', // 3
    '    for (int[] row : memo) Arrays.fill(row, -1);', // 4
    '    return f(0, 0, true, s.toCharArray());', // 5
    '}', // 6
    'private int f(int idx, int cnt, boolean isLimit, char[] s) {', // 7
    '    if (idx == s.length) return cnt; // 递归终点', // 8
    '    if (!isLimit && memo[idx][cnt] != -1) return memo[idx][cnt]; // 记忆化命中', // 9
    '    int up = isLimit ? (s[idx] - \'0\') : 9; // 上界限制判定', // 10
    '    int ans = 0;', // 11
    '    for (int d = 0; d <= up; d++) {', // 12
    '        ans += f(idx + 1, cnt + (d == 1 ? 1 : 0), isLimit && (d == up), s); // 转移', // 13
    '    }', // 14
    '    if (!isLimit) memo[idx][cnt] = ans; // 写入缓存', // 15
    '    return ans;', // 16
    '}', // 17
  ],
  cpp: [
    'int countDigitOne(int n) {', // 1
    '    string s = to_string(n);', // 2
    '    memset(memo, -1, sizeof(memo));', // 3
    '    return f(0, 0, true, s);', // 4
    '}', // 5
    'int f(int idx, int cnt, bool isLimit, const string& s) {', // 6
    '    if (idx == (int)s.size()) return cnt;', // 7
    '    if (!isLimit && memo[idx][cnt] != -1) return memo[idx][cnt];', // 8
    '    int up = isLimit ? (s[idx] - \'0\') : 9;', // 9
    '    int ans = 0;', // 10
    '    for (int d = 0; d <= up; d++) {', // 11
    '        ans += f(idx + 1, cnt + (d == 1 ? 1 : 0), isLimit && (d == up), s);', // 12
    '    }', // 13
    '    if (!isLimit) memo[idx][cnt] = ans;', // 14
    '    return ans;', // 15
    '}', // 16
  ],
  python: [
    'def count_digit_one(self, n: int) -> int:', // 1
    '    s = str(n)', // 2
    '    @functools.lru_cache(None)', // 3
    '    def f(idx: int, cnt: int, is_limit: bool) -> int:', // 4
    '        if idx == len(s): return cnt # 终点返回', // 5
    '        up = int(s[idx]) if is_limit else 9 # 上界', // 6
    '        ans = 0', // 7
    '        for d in range(up + 1):', // 8
    '            ans += f(idx + 1, cnt + (1 if d == 1 else 0), is_limit and (d == up))', // 9
    '        return ans', // 10
    '    return f(0, 0, True)', // 11
  ],
  javascript: [
    'function countDigitOne(n) {', // 1
    '    const s = String(n);', // 2
    '    const memo = Array.from({ length: s.length }, () => new Array(s.length).fill(-1));', // 3
    '    function f(idx, cnt, isLimit) {', // 4
    '        if (idx === s.length) return cnt;', // 5
    '        if (!isLimit && memo[idx][cnt] !== -1) return memo[idx][cnt];', // 6
    '        const up = isLimit ? Number(s[idx]) : 9;', // 7
    '        let ans = 0;', // 8
    '        for (let d = 0; d <= up; d++) {', // 9
    '            ans += f(idx + 1, cnt + (d === 1 ? 1 : 0), isLimit && (d === up));', // 10
    '        }', // 11
    '        if (!isLimit) memo[idx][cnt] = ans;', // 12
    '        return ans;', // 13
    '    }', // 14
    '    return f(0, 0, true);', // 15
    '}', // 16
  ],
};

export const DIGIT_DP_079_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  initMemo:    { java: 4, cpp: 3, python: 3, javascript: 3 },
  baseCase:    { java: 8, cpp: 7, python: 5, javascript: 5 },
  memoHit:     { java: 9, cpp: 8, python: 3, javascript: 6 },
  calcUpBound: { java: 10, cpp: 9, python: 6, javascript: 7 },
  recurseLoop: { java: 13, cpp: 12, python: 9, javascript: 10 },
  memoSave:    { java: 15, cpp: 14, python: 10, javascript: 12 },
};

// ==========================================
// 2. Class 080: 换根 DP (Rerooting DP)
// ==========================================
export const REROOTING_TREE_DP_080_CODES: Record<string, string[]> = {
  java: [
    'public int[] sumOfDistancesInTree(int n, int[][] edges) {', // 1
    '    buildGraph(n, edges);', // 2
    '    dfs1(0, -1); // 1. 自底向上统计子树大小与根0的距离和', // 3
    '    dfs2(0, -1, n); // 2. 自顶向下换根转移全树答案', // 4
    '    return ans;', // 5
    '}', // 6
    'void dfs1(int u, int p) {', // 7
    '    size[u] = 1;', // 8
    '    for (int v : adj[u]) if (v != p) {', // 9
    '        dfs1(v, u); size[u] += size[v];', // 10
    '        ans[0] += ans[v] + size[v]; // 累加初根距离贡献', // 11
    '    }', // 12
    '}', // 13
    'void dfs2(int u, int p, int n) {', // 14
    '    for (int v : adj[u]) if (v != p) {', // 15
    '        ans[v] = ans[u] + n - 2 * size[v]; // 换根转移公式', // 16
    '        dfs2(v, u, n); // 递归向下转移', // 17
    '    }', // 18
    '}', // 19
  ],
  cpp: [
    'vector<int> sumOfDistancesInTree(int n, vector<vector<int>>& edges) {', // 1
    '    buildGraph(n, edges);', // 2
    '    dfs1(0, -1);', // 3
    '    dfs2(0, -1, n);', // 4
    '    return ans;', // 5
    '}', // 6
    'void dfs1(int u, int p) {', // 7
    '    size[u] = 1;', // 8
    '    for (int v : adj[u]) if (v != p) {', // 9
    '        dfs1(v, u); size[u] += size[v];', // 10
    '        ans[0] += ans[v] + size[v];', // 11
    '    }', // 12
    '}', // 13
    'void dfs2(int u, int p, int n) {', // 14
    '    for (int v : adj[u]) if (v != p) {', // 15
    '        ans[v] = ans[u] + n - 2 * size[v]; // 换根转移', // 16
    '        dfs2(v, u, n);', // 17
    '    }', // 18
    '}', // 19
  ],
  python: [
    'def sum_of_distances_in_tree(self, n: int, edges: list) -> list:', // 1
    '    adj = [[] for _ in range(n)]; size = [0] * n; ans = [0] * n', // 2
    '    for u, v in edges: adj[u].append(v); adj[v].append(u)', // 3
    '    def dfs1(u: int, p: int): # DFS 1: 自底向上', // 4
    '        size[u] = 1', // 5
    '        for v in adj[u]:', // 6
    '            if v != p: dfs1(v, u); size[u] += size[v]; ans[0] += ans[v] + size[v]', // 7
    '    def dfs2(u: int, p: int): # DFS 2: 换根转移', // 8
    '        for v in adj[u]:', // 9
    '            if v != p: ans[v] = ans[u] + n - 2 * size[v]; dfs2(v, u)', // 10
    '    dfs1(0, -1); dfs2(0, -1); return ans', // 11
  ],
  javascript: [
    'function sumOfDistancesInTree(n, edges) {', // 1
    '    const adj = Array.from({ length: n }, () => []);', // 2
    '    const size = new Array(n).fill(0); const ans = new Array(n).fill(0);', // 3
    '    for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }', // 4
    '    function dfs1(u, p) {', // 5
    '        size[u] = 1;', // 6
    '        for (const v of adj[u]) if (v !== p) { dfs1(v, u); size[u] += size[v]; ans[0] += ans[v] + size[v]; }', // 7
    '    }', // 8
    '    function dfs2(u, p) {', // 9
    '        for (const v of adj[u]) if (v !== p) { ans[v] = ans[u] + n - 2 * size[v]; dfs2(v, u); }', // 10
    '    }', // 11
    '    dfs1(0, -1); dfs2(0, -1); return ans;', // 12
    '}', // 13
  ],
};

export const REROOTING_TREE_DP_080_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  startDfs1:   { java: 3, cpp: 3, python: 4, javascript: 5 },
  dfs1Compute: { java: 11, cpp: 11, python: 7, javascript: 7 },
  startDfs2:   { java: 4, cpp: 4, python: 8, javascript: 9 },
  rerootTrans: { java: 16, cpp: 16, python: 10, javascript: 10 },
  returnAns:   { java: 5, cpp: 5, python: 11, javascript: 12 },
};

// ==========================================
// 3. Class 081: 期望 DP 与马尔可夫决策
// ==========================================
export const EXPECTED_VALUE_DP_081_CODES: Record<string, string[]> = {
  java: [
    'public double knightProbability(int n, int k, int row, int column) {', // 1
    '    double[][][] dp = new double[k + 1][n][n];', // 2
    '    dp[0][row][column] = 1.0; // 起点初始概率为 1.0', // 3
    '    int[][] dirs = {{-2,-1},{-2,1},{-1,-2},{-1,2},{1,-2},{1,2},{2,-1},{2,1}};', // 4
    '    for (int step = 1; step <= k; step++) {', // 5
    '        for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) {', // 6
    '            if (dp[step - 1][r][c] > 0) {', // 7
    '                for (int[] d : dirs) {', // 8
    '                    int nr = r + d[0], nc = c + d[1];', // 9
    '                    if (nr >= 0 && nr < n && nc >= 0 && nc < n) {', // 10
    '                        dp[step][nr][nc] += dp[step - 1][r][c] / 8.0; // 概率等权转移', // 11
    '                    }', // 12
    '                }', // 13
    '            }', // 14
    '        }', // 15
    '    }', // 16
    '    double ans = 0;', // 17
    '    for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) ans += dp[k][r][c];', // 18
    '    return ans;', // 19
    '}', // 20
  ],
  cpp: [
    'double knightProbability(int n, int k, int row, int column) {', // 1
    '    vector<vector<double>> dp(n, vector<double>(n, 0.0));', // 2
    '    dp[row][column] = 1.0;', // 3
    '    int dirs[8][2] = {{-2,-1},{-2,1},{-1,-2},{-1,2},{1,-2},{1,2},{2,-1},{2,1}};', // 4
    '    for (int step = 1; step <= k; step++) {', // 5
    '        vector<vector<double>> nextDp(n, vector<double>(n, 0.0));', // 6
    '        for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) {', // 7
    '            if (dp[r][c] > 0) {', // 8
    '                for (auto& d : dirs) {', // 9
    '                    int nr = r + d[0], nc = c + d[1];', // 10
    '                    if (nr >= 0 && nr < n && nc >= 0 && nc < n) nextDp[nr][nc] += dp[r][c] / 8.0;', // 11
    '                }', // 12
    '            }', // 13
    '        }', // 14
    '        dp = nextDp;', // 15
    '    }', // 16
    '    double ans = 0; for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) ans += dp[r][c];', // 17
    '    return ans;', // 18
    '}', // 19
  ],
  python: [
    'def knight_probability(self, n: int, k: int, row: int, column: int) -> float:', // 1
    '    dp = [[0.0] * n for _ in range(n)]; dp[row][column] = 1.0', // 2
    '    dirs = [(-2,-1),(-2,1),(-1,-2),(-1,2),(1,-2),(1,2),(2,-1),(2,1)]', // 3
    '    for step in range(k):', // 4
    '        nxt = [[0.0] * n for _ in range(n)]', // 5
    '        for r in range(n):', // 6
    '            for c in range(n):', // 7
    '                if dp[r][c] > 0:', // 8
    '                    for dr, dc in dirs:', // 9
    '                        nr, nc = r + dr, c + dc', // 10
    '                        if 0 <= nr < n and 0 <= nc < n: nxt[nr][nc] += dp[r][c] / 8.0', // 11
    '        dp = nxt', // 12
    '    return sum(map(sum, dp))', // 13
  ],
  javascript: [
    'function knightProbability(n, k, row, column) {', // 1
    '    let dp = Array.from({ length: n }, () => new Array(n).fill(0.0));', // 2
    '    dp[row][column] = 1.0;', // 3
    '    const dirs = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];', // 4
    '    for (let step = 1; step <= k; step++) {', // 5
    '        const nextDp = Array.from({ length: n }, () => new Array(n).fill(0.0));', // 6
    '        for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {', // 7
    '            if (dp[r][c] > 0) {', // 8
    '                for (const [dr, dc] of dirs) {', // 9
    '                    const nr = r + dr, nc = c + dc;', // 10
    '                    if (nr >= 0 && nr < n && nc >= 0 && nc < n) nextDp[nr][nc] += dp[r][c] / 8.0;', // 11
    '                }', // 12
    '            }', // 13
    '        }', // 14
    '        dp = nextDp;', // 15
    '    }', // 16
    '    let ans = 0; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) ans += dp[r][c];', // 17
    '    return ans;', // 18
    '}', // 19
  ],
};

export const EXPECTED_VALUE_DP_081_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  initStart:   { java: 3, cpp: 3, python: 2, javascript: 3 },
  stepLoop:    { java: 5, cpp: 5, python: 4, javascript: 5 },
  dirExpand:   { java: 9, cpp: 10, python: 10, javascript: 10 },
  probDist:    { java: 11, cpp: 11, python: 11, javascript: 11 },
  sumResult:   { java: 18, cpp: 17, python: 13, javascript: 17 },
};

// ==========================================
// 4. Class 082: 斜率优化 DP (Slope Optimization)
// ==========================================
export const SLOPE_OPTIMIZATION_DP_082_CODES: Record<string, string[]> = {
  java: [
    'public long taskSchedule(int[] t, int[] f, int s, int n) {', // 1
    '    long[] sumT = new long[n + 1], sumF = new long[n + 1];', // 2
    '    for (int i = 1; i <= n; i++) { sumT[i] = sumT[i - 1] + t[i]; sumF[i] = sumF[i - 1] + f[i]; }', // 3
    '    int[] q = new int[n + 1]; int head = 0, tail = 0; q[0] = 0; // 凸包单调队列', // 4
    '    long[] dp = new long[n + 1];', // 5
    '    for (int i = 1; i <= n; i++) {', // 6
    '        while (head < tail && slope(q[head], q[head + 1]) <= sumT[i] + s) head++; // 队头切线淘汰', // 7
    '        int j = q[head]; // 最优决策点', // 8
    '        dp[i] = dp[j] + sumT[i] * (sumF[i] - sumF[j]) + (long)s * (sumF[n] - sumF[j]);', // 9
    '        while (head < tail && slope(q[tail - 1], q[tail]) >= slope(q[tail], i)) tail--; // 维护下凸性', // 10
    '        q[++tail] = i; // 新点入队', // 11
    '    }', // 12
    '    return dp[n];', // 13
    '}', // 14
  ],
  cpp: [
    'long long taskSchedule(const vector<int>& t, const vector<int>& f, int s, int n) {', // 1
    '    vector<long long> sumT(n + 1, 0), sumF(n + 1, 0);', // 2
    '    for (int i = 1; i <= n; i++) { sumT[i] = sumT[i - 1] + t[i]; sumF[i] = sumF[i - 1] + f[i]; }', // 3
    '    vector<int> q(n + 1); int head = 0, tail = 0; q[0] = 0;', // 4
    '    vector<long long> dp(n + 1, 0);', // 5
    '    for (int i = 1; i <= n; i++) {', // 6
    '        while (head < tail && slope(q[head], q[head + 1]) <= sumT[i] + s) head++;', // 7
    '        int j = q[head];', // 8
    '        dp[i] = dp[j] + sumT[i] * (sumF[i] - sumF[j]) + 1LL * s * (sumF[n] - sumF[j]);', // 9
    '        while (head < tail && slope(q[tail - 1], q[tail]) >= slope(q[tail], i)) tail--;', // 10
    '        q[++tail] = i;', // 11
    '    }', // 12
    '    return dp[n];', // 13
    '}', // 14
  ],
  python: [
    'def task_schedule(self, t: list, f: list, s: int, n: int) -> int:', // 1
    '    sum_t = [0] * (n + 1); sum_f = [0] * (n + 1)', // 2
    '    for i in range(1, n + 1): sum_t[i] = sum_t[i - 1] + t[i]; sum_f[i] = sum_f[i - 1] + f[i]', // 3
    '    q = [0] * (n + 1); head, tail = 0, 0; dp = [0] * (n + 1)', // 4
    '    for i in range(1, n + 1):', // 5
    '        while head < tail and slope(q[head], q[head + 1]) <= sum_t[i] + s: head += 1', // 6
    '        j = q[head]', // 7
    '        dp[i] = dp[j] + sum_t[i] * (sum_f[i] - sum_f[j]) + s * (sum_f[n] - sum_f[j])', // 8
    '        while head < tail and slope(q[tail - 1], q[tail]) >= slope(q[tail], i): tail -= 1', // 9
    '        tail += 1; q[tail] = i', // 10
    '    return dp[n]', // 11
  ],
  javascript: [
    'function taskSchedule(t, f, s, n) {', // 1
    '    const sumT = new Array(n + 1).fill(0); const sumF = new Array(n + 1).fill(0);', // 2
    '    for (let i = 1; i <= n; i++) { sumT[i] = sumT[i - 1] + t[i]; sumF[i] = sumF[i - 1] + f[i]; }', // 3
    '    const q = new Array(n + 1).fill(0); let head = 0, tail = 0; const dp = new Array(n + 1).fill(0);', // 4
    '    for (let i = 1; i <= n; i++) {', // 5
    '        while (head < tail && slope(q[head], q[head + 1]) <= sumT[i] + s) head++;', // 6
    '        const j = q[head];', // 7
    '        dp[i] = dp[j] + sumT[i] * (sumF[i] - sumF[j]) + s * (sumF[n] - sumF[j]);', // 8
    '        while (head < tail && slope(q[tail - 1], q[tail]) >= slope(q[tail], i)) tail--;', // 9
    '        q[++tail] = i;', // 10
    '    }', // 11
    '    return dp[n];', // 12
    '}', // 13
  ],
};

export const SLOPE_OPTIMIZATION_DP_082_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  prefixSums:  { java: 3, cpp: 3, python: 3, javascript: 3 },
  popHead:     { java: 7, cpp: 7, python: 6, javascript: 6 },
  transOpt:    { java: 9, cpp: 9, python: 8, javascript: 8 },
  popTailHull: { java: 10, cpp: 10, python: 9, javascript: 9 },
  pushHull:    { java: 11, cpp: 11, python: 10, javascript: 10 },
  returnAns:   { java: 13, cpp: 13, python: 11, javascript: 12 },
};

// ==========================================
// 5. Class 083: 四边形不等式优化 (Knuth's Quadrangle Inequality)
// ==========================================
export const KNUTH_QUADRANGLE_083_CODES: Record<string, string[]> = {
  java: [
    'public int mergeStones(int[] stones) {', // 1
    '    int n = stones.length; int[] sum = new int[n + 1];', // 2
    '    for (int i = 0; i < n; i++) sum[i + 1] = sum[i] + stones[i];', // 3
    '    int[][] dp = new int[n][n]; int[][] opt = new int[n][n];', // 4
    '    for (int i = 0; i < n; i++) opt[i][i] = i; // 长度为1决策基准', // 5
    '    for (int len = 2; len <= n; len++) {', // 6
    '        for (int i = 0; i <= n - len; i++) {', // 7
    '            int j = i + len - 1; dp[i][j] = Integer.MAX_VALUE;', // 8
    '            for (int k = opt[i][j - 1]; k <= opt[i + 1][j]; k++) { // 决策区间剪枝', // 9
    '                int cost = dp[i][k] + dp[k + 1][j] + sum[j + 1] - sum[i];', // 10
    '                if (cost < dp[i][j]) { dp[i][j] = cost; opt[i][j] = k; }', // 11
    '            }', // 12
    '        }', // 13
    '    }', // 14
    '    return dp[0][n - 1];', // 15
    '}', // 16
  ],
  cpp: [
    'int mergeStones(vector<int>& stones) {', // 1
    '    int n = stones.size(); vector<int> sum(n + 1, 0);', // 2
    '    for (int i = 0; i < n; i++) sum[i + 1] = sum[i] + stones[i];', // 3
    '    vector<vector<int>> dp(n, vector<int>(n, 0)), opt(n, vector<int>(n, 0));', // 4
    '    for (int i = 0; i < n; i++) opt[i][i] = i;', // 5
    '    for (int len = 2; len <= n; len++) {', // 6
    '        for (int i = 0; i <= n - len; i++) {', // 7
    '            int j = i + len - 1; dp[i][j] = 1e9;', // 8
    '            for (int k = opt[i][j - 1]; k <= opt[i + 1][j]; k++) { // 决策剪枝', // 9
    '                int cost = dp[i][k] + dp[k + 1][j] + sum[j + 1] - sum[i];', // 10
    '                if (cost < dp[i][j]) { dp[i][j] = cost; opt[i][j] = k; }', // 11
    '            }', // 12
    '        }', // 13
    '    }', // 14
    '    return dp[0][n - 1];', // 15
    '}', // 16
  ],
  python: [
    'def merge_stones(self, stones: list) -> int:', // 1
    '    n = len(stones); sum_val = [0] * (n + 1)', // 2
    '    for i in range(n): sum_val[i + 1] = sum_val[i] + stones[i]', // 3
    '    dp = [[0] * n for _ in range(n)]; opt = [[i] * n for i in range(n)]', // 4
    '    for length in range(2, n + 1):', // 5
    '        for i in range(n - length + 1):', // 6
    '            j = i + length - 1; dp[i][j] = float(\'inf\')', // 7
    '            for k in range(opt[i][j - 1], opt[i + 1][j] + 1): # 限制范围', // 8
    '                cost = dp[i][k] + dp[k + 1][j] + sum_val[j + 1] - sum_val[i]', // 9
    '                if cost < dp[i][j]: dp[i][j] = cost; opt[i][j] = k', // 10
    '    return dp[0][n - 1]', // 11
  ],
  javascript: [
    'function mergeStones(stones) {', // 1
    '    const n = stones.length; const sum = new Array(n + 1).fill(0);', // 2
    '    for (let i = 0; i < n; i++) sum[i + 1] = sum[i] + stones[i];', // 3
    '    const dp = Array.from({ length: n }, () => new Array(n).fill(0));', // 4
    '    const opt = Array.from({ length: n }, (_, i) => new Array(n).fill(i));', // 5
    '    for (let len = 2; len <= n; len++) {', // 6
    '        for (let i = 0; i <= n - len; i++) {', // 7
    '            const j = i + len - 1; dp[i][j] = Infinity;', // 8
    '            for (let k = opt[i][j - 1]; k <= opt[i + 1][j]; k++) {', // 9
    '                const cost = dp[i][k] + dp[k + 1][j] + sum[j + 1] - sum[i];', // 10
    '                if (cost < dp[i][j]) { dp[i][j] = cost; opt[i][j] = k; }', // 11
    '            }', // 12
    '        }', // 13
    '    }', // 14
    '    return dp[0][n - 1];', // 15
    '}', // 16
  ],
};

export const KNUTH_QUADRANGLE_083_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  initOptBase: { java: 5, cpp: 5, python: 4, javascript: 5 },
  lenLoop:     { java: 6, cpp: 6, python: 5, javascript: 6 },
  knuthRange:  { java: 9, cpp: 9, python: 8, javascript: 9 },
  updateOpt:   { java: 11, cpp: 11, python: 10, javascript: 11 },
  returnAns:   { java: 15, cpp: 15, python: 11, javascript: 15 },
};
