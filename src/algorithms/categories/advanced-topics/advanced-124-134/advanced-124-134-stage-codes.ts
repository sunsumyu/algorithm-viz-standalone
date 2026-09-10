/**
 * 左神算法通关课 124 ~ 134 高阶遍历、动态规划优化与高斯消元多语言代码与行号映射
 */

export interface CodeMapping {
  java: number;
  cpp: number;
  python: number;
  javascript: number;
}

// ==========================================
// 1. Class 124: Morris 遍历 (Morris Traversal)
// ==========================================
export const MORRIS_CODES: Record<string, string[]> = {
  java: [
    'public List<Integer> morrisInorder(TreeNode root) {', // 1
    '    List<Integer> ans = new ArrayList<>();', // 2
    '    TreeNode cur = root;', // 3
    '    while (cur != null) {', // 4
    '        if (cur.left == null) {', // 5
    '            ans.add(cur.val); cur = cur.right;', // 6
    '        } else {', // 7
    '            TreeNode mr = cur.left;', // 8
    '            while (mr.right != null && mr.right != cur) mr = mr.right;', // 9
    '            if (mr.right == null) {', // 10
    '                mr.right = cur; cur = cur.left; // 第一次到达，建立线索', // 11
    '            } else {', // 12
    '                mr.right = null; ans.add(cur.val); cur = cur.right; // 拆除线索并访问', // 13
    '            }', // 14
    '        }', // 15
    '    }', // 16
    '    return ans;', // 17
    '}', // 18
  ],
  cpp: [
    'vector<int> morrisInorder(TreeNode* root) {', // 1
    '    vector<int> ans;', // 2
    '    TreeNode* cur = root;', // 3
    '    while (cur) {', // 4
    '        if (!cur->left) {', // 5
    '            ans.push_back(cur->val); cur = cur->right;', // 6
    '        } else {', // 7
    '            TreeNode* mr = cur->left;', // 8
    '            while (mr->right && mr->right != cur) mr = mr->right;', // 9
    '            if (!mr->right) {', // 10
    '                mr->right = cur; cur = cur->left;', // 11
    '            } else {', // 12
    '                mr->right = nullptr; ans.push_back(cur->val); cur = cur->right;', // 13
    '            }', // 14
    '        }', // 15
    '    }', // 16
    '    return ans;', // 17
    '}', // 18
  ],
  python: [
    'def morris_inorder(root):', // 1
    '    ans, cur = [], root', // 2
    '    while cur:', // 3
    '        if not cur.left:', // 4
    '            ans.append(cur.val); cur = cur.right', // 5
    '        else:', // 6
    '            mr = cur.left', // 7
    '            while mr.right and mr.right != cur: mr = mr.right', // 8
    '            if not mr.right:', // 9
    '                mr.right = cur; cur = cur.left', // 10
    '            else:', // 11
    '                mr.right = None; ans.append(cur.val); cur = cur.right', // 12
    '    return ans', // 13
  ],
  javascript: [
    'function morrisInorder(root) {', // 1
    '    const ans = []; let cur = root;', // 2
    '    while (cur) {', // 3
    '        if (!cur.left) {', // 4
    '            ans.push(cur.val); cur = cur.right;', // 5
    '        } else {', // 6
    '            let mr = cur.left;', // 7
    '            while (mr.right && mr.right !== cur) mr = mr.right;', // 8
    '            if (!mr.right) {', // 9
    '                mr.right = cur; cur = cur.left;', // 10
    '            } else {', // 11
    '                mr.right = null; ans.push(cur.val); cur = cur.right;', // 12
    '            }', // 13
    '        }', // 14
    '    }', // 15
    '    return ans;', // 16
    '}', // 17
  ],
};

export const MORRIS_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  noLeft:    { java: 6, cpp: 6, python: 5, javascript: 5 },
  findRight: { java: 9, cpp: 9, python: 8, javascript: 8 },
  addThread: { java: 11, cpp: 11, python: 10, javascript: 10 },
  delThread: { java: 13, cpp: 13, python: 12, javascript: 12 },
  returnAns: { java: 17, cpp: 17, python: 13, javascript: 16 },
};

// ==========================================
// 2. Class 125: 轮廓线 DP (Profile DP)
// ==========================================
export const PROFILE_DP_CODES: Record<string, string[]> = {
  java: [
    'public long profileDpDomino(int n, int m) {', // 1
    '    long[] dp = new long[1 << m]; dp[0] = 1;', // 2
    '    for (int i = 0; i < n; i++) {', // 3
    '        for (int j = 0; j < m; j++) {', // 4
    '            long[] nxt = new long[1 << m];', // 5
    '            for (int mask = 0; mask < (1 << m); mask++) {', // 6
    '                if (dp[mask] == 0) continue;', // 7
    '                if ((mask & (1 << j)) != 0) {', // 8
    '                    nxt[mask ^ (1 << j)] += dp[mask]; // 上插头向下合并', // 9
    '                } else {', // 10
    '                    nxt[mask | (1 << j)] += dp[mask]; // 坚放向下延伸插头', // 11
    '                    if (j + 1 < m && (mask & (1 << (j + 1))) == 0) {', // 12
    '                        nxt[mask | (1 << (j + 1))] += dp[mask]; // 横放向右延伸', // 13
    '                    }', // 14
    '                }', // 15
    '            }', // 16
    '            dp = nxt;', // 17
    '        }', // 18
    '    }', // 19
    '    return dp[0];', // 20
    '}', // 21
  ],
  cpp: [
    'long long profileDpDomino(int n, int m) {', // 1
    '    vector<long long> dp(1 << m, 0); dp[0] = 1;', // 2
    '    for (int i = 0; i < n; i++) {', // 3
    '        for (int j = 0; j < m; j++) {', // 4
    '            vector<long long> nxt(1 << m, 0);', // 5
    '            for (int mask = 0; mask < (1 << m); mask++) {', // 6
    '                if (!dp[mask]) continue;', // 7
    '                if (mask & (1 << j)) {', // 8
    '                    nxt[mask ^ (1 << j)] += dp[mask];', // 9
    '                } else {', // 10
    '                    nxt[mask | (1 << j)] += dp[mask];', // 11
    '                    if (j + 1 < m && !(mask & (1 << (j + 1)))) nxt[mask | (1 << (j + 1))] += dp[mask];', // 12
    '                }', // 13
    '            }', // 14
    '            dp = move(nxt);', // 15
    '        }', // 16
    '    }', // 17
    '    return dp[0];', // 18
    '}', // 19
  ],
  python: [
    'def profile_dp_domino(n: int, m: int) -> int:', // 1
    '    dp = [0] * (1 << m); dp[0] = 1', // 2
    '    for i in range(n):', // 3
    '        for j in range(m):', // 4
    '            nxt = [0] * (1 << m)', // 5
    '            for mask in range(1 << m):', // 6
    '                if not dp[mask]: continue', // 7
    '                if mask & (1 << j):', // 8
    '                    nxt[mask ^ (1 << j)] += dp[mask]', // 9
    '                else:', // 10
    '                    nxt[mask | (1 << j)] += dp[mask]', // 11
    '                    if j + 1 < m and not (mask & (1 << (j + 1))):', // 12
    '                        nxt[mask | (1 << (j + 1))] += dp[mask]', // 13
    '            dp = nxt', // 14
    '    return dp[0]', // 15
  ],
  javascript: [
    'function profileDpDomino(n, m) {', // 1
    '    let dp = new Array(1 << m).fill(0); dp[0] = 1;', // 2
    '    for (let i = 0; i < n; i++) {', // 3
    '        for (let j = 0; j < m; j++) {', // 4
    '            const nxt = new Array(1 << m).fill(0);', // 5
    '            for (let mask = 0; mask < (1 << m); mask++) {', // 6
    '                if (!dp[mask]) continue;', // 7
    '                if (mask & (1 << j)) {', // 8
    '                    nxt[mask ^ (1 << j)] += dp[mask];', // 9
    '                } else {', // 10
    '                    nxt[mask | (1 << j)] += dp[mask];', // 11
    '                    if (j + 1 < m && !(mask & (1 << (j + 1)))) {', // 12
    '                        nxt[mask | (1 << (j + 1))] += dp[mask];', // 13
    '                    }', // 14
    '                }', // 15
    '            }', // 16
    '            dp = nxt;', // 17
    '        }', // 18
    '    }', // 19
    '    return dp[0];', // 20
    '}', // 21
  ],
};

export const PROFILE_DP_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  cellLoop:  { java: 4, cpp: 4, python: 4, javascript: 4 },
  mergeUp:   { java: 9, cpp: 9, python: 9, javascript: 9 },
  placeVert: { java: 11, cpp: 11, python: 11, javascript: 11 },
  placeHorz: { java: 13, cpp: 12, python: 13, javascript: 13 },
  returnAns: { java: 20, cpp: 18, python: 15, javascript: 20 },
};

// ==========================================
// 3. Class 126: 三进制状压 DP (Ternary DP)
// ==========================================
export const TERNARY_DP_CODES: Record<string, string[]> = {
  java: [
    'public int ternaryDpMaxCover(int n, int m) {', // 1
    '    int totalStates = (int) Math.pow(3, m);', // 2
    '    int[] dp = new int[totalStates]; Arrays.fill(dp, -1); dp[0] = 0;', // 3
    '    for (int r = 0; r < n; r++) {', // 4
    '        int[] nxt = new int[totalStates]; Arrays.fill(nxt, -1);', // 5
    '        for (int s = 0; s < totalStates; s++) {', // 6
    '            if (dp[s] < 0) continue;', // 7
    '            dfsRow(r, 0, s, 0, dp[s], nxt, m); // 行内生成合法下一行状态', // 8
    '        }', // 9
    '        dp = nxt;', // 10
    '    }', // 11
    '    int ans = 0; for (int v : dp) ans = Math.max(ans, v);', // 12
    '    return ans;', // 13
    '}', // 14
  ],
  cpp: [
    'int ternaryDpMaxCover(int n, int m) {', // 1
    '    int totalStates = pow(3, m);', // 2
    '    vector<int> dp(totalStates, -1); dp[0] = 0;', // 3
    '    for (int r = 0; r < n; r++) {', // 4
    '        vector<int> nxt(totalStates, -1);', // 5
    '        for (int s = 0; s < totalStates; s++) {', // 6
    '            if (dp[s] < 0) continue;', // 7
    '            dfsRow(r, 0, s, 0, dp[s], nxt, m);', // 8
    '        }', // 9
    '        dp = move(nxt);', // 10
    '    }', // 11
    '    int ans = 0; for (int v : dp) ans = max(ans, v);', // 12
    '    return ans;', // 13
    '}', // 14
  ],
  python: [
    'def ternary_dp_max_cover(n: int, m: int) -> int:', // 1
    '    total_states = 3 ** m', // 2
    '    dp = [-1] * total_states; dp[0] = 0', // 3
    '    for r in range(n):', // 4
    '        nxt = [-1] * total_states', // 5
    '        for s in range(total_states):', // 6
    '            if dp[s] < 0: continue', // 7
    '            dfs_row(r, 0, s, 0, dp[s], nxt, m)', // 8
    '        dp = nxt', // 9
    '    return max(0, max(dp))', // 10
  ],
  javascript: [
    'function ternaryDpMaxCover(n, m) {', // 1
    '    const totalStates = Math.pow(3, m);', // 2
    '    let dp = new Array(totalStates).fill(-1); dp[0] = 0;', // 3
    '    for (let r = 0; r < n; r++) {', // 4
    '        const nxt = new Array(totalStates).fill(-1);', // 5
    '        for (let s = 0; s < totalStates; s++) {', // 6
    '            if (dp[s] < 0) continue;', // 7
    '            dfsRow(r, 0, s, 0, dp[s], nxt, m);', // 8
    '        }', // 9
    '        dp = nxt;', // 10
    '    }', // 11
    '    return Math.max(0, ...dp);', // 12
    '}', // 13
  ],
};

export const TERNARY_DP_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  initPower: { java: 2, cpp: 2, python: 2, javascript: 2 },
  rowLoop:   { java: 4, cpp: 4, python: 4, javascript: 4 },
  dfsRow:    { java: 8, cpp: 8, python: 8, javascript: 8 },
  returnAns: { java: 13, cpp: 13, python: 10, javascript: 12 },
};

// ==========================================
// 4. Class 129: 倍增优化 DP (Binary Lifting DP)
// ==========================================
export const BINARY_LIFTING_DP_CODES: Record<string, string[]> = {
  java: [
    'public int queryLiftingDP(int start, long steps, int maxK) {', // 1
    '    int cur = start;', // 2
    '    // 利用二进制位拆分高次步数', // 3
    '    for (int k = maxK; k >= 0; k--) {', // 4
    '        if ((steps & (1L << k)) != 0) {', // 5
    '            cur = to[cur][k]; // 瞬间跳跃 2^k 步', // 6
    '        }', // 7
    '    }', // 8
    '    return cur;', // 9
    '}', // 10
  ],
  cpp: [
    'int queryLiftingDP(int start, long long steps, int maxK) {', // 1
    '    int cur = start;', // 2
    '    for (int k = maxK; k >= 0; k--) {', // 3
    '        if ((steps >> k) & 1LL) {', // 4
    '            cur = to[cur][k];', // 5
    '        }', // 6
    '    }', // 7
    '    return cur;', // 8
    '}', // 9
  ],
  python: [
    'def query_lifting_dp(start: int, steps: int, max_k: int) -> int:', // 1
    '    cur = start', // 2
    '    for k in range(max_k, -1, -1):', // 3
    '        if (steps >> k) & 1:', // 4
    '            cur = to[cur][k]', // 5
    '    return cur', // 6
  ],
  javascript: [
    'function queryLiftingDP(start, steps, maxK) {', // 1
    '    let cur = start;', // 2
    '    for (let k = maxK; k >= 0; k--) {', // 3
    '        if ((steps & (1 << k)) !== 0) {', // 4
    '            cur = to[cur][k];', // 5
    '        }', // 6
    '    }', // 7
    '    return cur;', // 8
    '}', // 9
  ],
};

export const BINARY_LIFTING_DP_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  checkBit:  { java: 5, cpp: 4, python: 4, javascript: 4 },
  jumpPower: { java: 6, cpp: 5, python: 5, javascript: 5 },
  returnAns: { java: 9, cpp: 8, python: 6, javascript: 8 },
};

// ==========================================
// 5. Class 130: 单调队列优化 DP (Monotonic Queue DP)
// ==========================================
export const MONOTONIC_QUEUE_DP_CODES: Record<string, string[]> = {
  java: [
    'public int maxCostDP(int[] val, int L, int R) {', // 1
    '    int n = val.length; int[] dp = new int[n];', // 2
    '    Deque<Integer> q = new ArrayDeque<>(); // 维护单调递减的最优决策下标', // 3
    '    for (int i = 1; i < n; i++) {', // 4
    '        int newJ = i - L;', // 5
    '        if (newJ >= 0) {', // 6
    '            while (!q.isEmpty() && dp[q.peekLast()] <= dp[newJ]) q.pollLast();', // 7
    '            q.offerLast(newJ);', // 8
    '        }', // 9
    '        while (!q.isEmpty() && q.peekFirst() < i - R) q.pollFirst(); // 淘汰过期决策', // 10
    '        dp[i] = (q.isEmpty() ? 0 : dp[q.peekFirst()]) + val[i];', // 11
    '    }', // 12
    '    return dp[n - 1];', // 13
    '}', // 14
  ],
  cpp: [
    'int maxCostDP(const vector<int>& val, int L, int R) {', // 1
    '    int n = val.size(); vector<int> dp(n, 0);', // 2
    '    deque<int> q;', // 3
    '    for (int i = 1; i < n; i++) {', // 4
    '        int newJ = i - L;', // 5
    '        if (newJ >= 0) {', // 6
    '            while (!q.empty() && dp[q.back()] <= dp[newJ]) q.pop_back();', // 7
    '            q.push_back(newJ);', // 8
    '        }', // 9
    '        while (!q.empty() && q.front() < i - R) q.pop_front();', // 10
    '        dp[i] = (q.empty() ? 0 : dp[q.front()]) + val[i];', // 11
    '    }', // 12
    '    return dp[n - 1];', // 13
    '}', // 14
  ],
  python: [
    'def max_cost_dp(val: list[int], L: int, R: int) -> int:', // 1
    '    n = len(val); dp = [0] * n', // 2
    '    q = deque()', // 3
    '    for i in range(1, n):', // 4
    '        new_j = i - L', // 5
    '        if new_j >= 0:', // 6
    '            while q and dp[q[-1]] <= dp[new_j]: q.pop()', // 7
    '            q.append(new_j)', // 8
    '        while q and q[0] < i - R: q.popleft()', // 9
    '        dp[i] = (dp[q[0]] if q else 0) + val[i]', // 10
    '    return dp[-1]', // 11
  ],
  javascript: [
    'function maxCostDP(val, L, R) {', // 1
    '    const n = val.length; const dp = new Array(n).fill(0);', // 2
    '    const q = [];', // 3
    '    for (let i = 1; i < n; i++) {', // 4
    '        const newJ = i - L;', // 5
    '        if (newJ >= 0) {', // 6
    '            while (q.length && dp[q[q.length - 1]] <= dp[newJ]) q.pop();', // 7
    '            q.push(newJ);', // 8
    '        }', // 9
    '        while (q.length && q[0] < i - R) q.shift();', // 10
    '        dp[i] = (q.length ? dp[q[0]] : 0) + val[i];', // 11
    '    }', // 12
    '    return dp[n - 1];', // 13
    '}', // 14
  ],
};

export const MONOTONIC_QUEUE_DP_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  pushQueue: { java: 7, cpp: 7, python: 7, javascript: 7 },
  popExpire: { java: 10, cpp: 10, python: 9, javascript: 10 },
  calcDp:    { java: 11, cpp: 11, python: 10, javascript: 11 },
  returnAns: { java: 13, cpp: 13, python: 11, javascript: 13 },
};

// ==========================================
// 6. Class 133: 高斯消元法 (Gaussian Elimination)
// ==========================================
export const GAUSSIAN_ELIMINATION_CODES: Record<string, string[]> = {
  java: [
    'public double[] gaussianElimination(double[][] a, int n) {', // 1
    '    for (int col = 0; col < n; col++) {', // 2
    '        int pivot = col;', // 3
    '        for (int r = col + 1; r < n; r++) {', // 4
    '            if (Math.abs(a[r][col]) > Math.abs(a[pivot][col])) pivot = r;', // 5
    '        }', // 6
    '        if (pivot != col) { double[] tmp = a[col]; a[col] = a[pivot]; a[pivot] = tmp; }', // 7
    '        // 主元消去下方所有行', // 8
    '        for (int r = col + 1; r < n; r++) {', // 9
    '            double factor = a[r][col] / a[col][col];', // 10
    '            for (int c = col; c <= n; c++) a[r][c] -= factor * a[col][c];', // 11
    '        }', // 12
    '    }', // 13
    '    // 回代求解', // 14
    '    double[] x = new double[n];', // 15
    '    for (int r = n - 1; r >= 0; r--) {', // 16
    '        double s = a[r][n];', // 17
    '        for (int c = r + 1; c < n; c++) s -= a[r][c] * x[c];', // 18
    '        x[r] = s / a[r][r];', // 19
    '    }', // 20
    '    return x;', // 21
    '}', // 22
  ],
  cpp: [
    'vector<double> gaussianElimination(vector<vector<double>>& a, int n) {', // 1
    '    for (int col = 0; col < n; col++) {', // 2
    '        int pivot = col;', // 3
    '        for (int r = col + 1; r < n; r++) {', // 4
    '            if (fabs(a[r][col]) > fabs(a[pivot][col])) pivot = r;', // 5
    '        }', // 6
    '        swap(a[col], a[pivot]);', // 7
    '        for (int r = col + 1; r < n; r++) {', // 8
    '            double factor = a[r][col] / a[col][col];', // 9
    '            for (int c = col; c <= n; c++) a[r][c] -= factor * a[col][c];', // 10
    '        }', // 11
    '    }', // 12
    '    vector<double> x(n, 0);', // 13
    '    for (int r = n - 1; r >= 0; r--) {', // 14
    '        double s = a[r][n];', // 15
    '        for (int c = r + 1; c < n; c++) s -= a[r][c] * x[c];', // 16
    '        x[r] = s / a[r][r];', // 17
    '    }', // 18
    '    return x;', // 19
    '}', // 20
  ],
  python: [
    'def gaussian_elimination(a: list[list[float]], n: int) -> list[float]:', // 1
    '    for col in range(n):', // 2
    '        pivot = max(range(col, n), key=lambda r: abs(a[r][col]))', // 3
    '        a[col], a[pivot] = a[pivot], a[col]', // 4
    '        for r in range(col + 1, n):', // 5
    '            factor = a[r][col] / a[col][col]', // 6
    '            for c in range(col, n + 1): a[r][c] -= factor * a[col][c]', // 7
    '    x = [0.0] * n', // 8
    '    for r in range(n - 1, -1, -1):', // 9
    '        s = a[r][n] - sum(a[r][c] * x[c] for c in range(r + 1, n))', // 10
    '        x[r] = s / a[r][r]', // 11
    '    return x', // 12
  ],
  javascript: [
    'function gaussianElimination(a, n) {', // 1
    '    for (let col = 0; col < n; col++) {', // 2
    '        let pivot = col;', // 3
    '        for (let r = col + 1; r < n; r++) {', // 4
    '            if (Math.abs(a[r][col]) > Math.abs(a[pivot][col])) pivot = r;', // 5
    '        }', // 6
    '        const tmp = a[col]; a[col] = a[pivot]; a[pivot] = tmp;', // 7
    '        for (let r = col + 1; r < n; r++) {', // 8
    '            const factor = a[r][col] / a[col][col];', // 9
    '            for (let c = col; c <= n; c++) a[r][c] -= factor * a[col][c];', // 10
    '        }', // 11
    '    }', // 12
    '    const x = new Array(n).fill(0);', // 13
    '    for (let r = n - 1; r >= 0; r--) {', // 14
    '        let s = a[r][n];', // 15
    '        for (let c = r + 1; c < n; c++) s -= a[r][c] * x[c];', // 16
    '        x[r] = s / a[r][r];', // 17
    '    }', // 18
    '    return x;', // 19
    '}', // 20
  ],
};

export const GAUSSIAN_ELIMINATION_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  selectPivot:{ java: 5, cpp: 5, python: 3, javascript: 5 },
  swapRow:   { java: 7, cpp: 7, python: 4, javascript: 7 },
  eliminate: { java: 11, cpp: 10, python: 7, javascript: 10 },
  backSub:   { java: 19, cpp: 17, python: 11, javascript: 17 },
  returnAns: { java: 21, cpp: 19, python: 12, javascript: 19 },
};
