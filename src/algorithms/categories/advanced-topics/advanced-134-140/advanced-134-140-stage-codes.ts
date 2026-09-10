/**
 * 左神算法通关课 134 ~ 140 异或高斯消元、线性基与数论扩展多语言代码与行号映射
 */

export interface CodeMapping {
  java: number;
  cpp: number;
  python: number;
  javascript: number;
}

// ==========================================
// 1. Class 134: 异或高斯消元 (XOR Gaussian Elimination)
// ==========================================
export const XOR_GAUSSIAN_CODES: Record<string, string[]> = {
  java: [
    'public int[] xorGaussian(int[][] a, int n) {', // 1
    '    for (int col = 0; col < n; col++) {', // 2
    '        int pivot = col;', // 3
    '        while (pivot < n && a[pivot][col] == 0) pivot++;', // 4
    '        if (pivot == n) continue; // 自由元', // 5
    '        int[] t = a[col]; a[col] = a[pivot]; a[pivot] = t;', // 6
    '        for (int r = 0; r < n; r++) {', // 7
    '            if (r != col && a[r][col] == 1) {', // 8
    '                for (int c = col; c <= n; c++) a[r][c] ^= a[col][c]; // 异或消元', // 9
    '            }', // 10
    '        }', // 11
    '    }', // 12
    '    int[] ans = new int[n];', // 13
    '    for (int i = 0; i < n; i++) ans[i] = a[i][n];', // 14
    '    return ans;', // 15
    '}', // 16
  ],
  cpp: [
    'vector<int> xorGaussian(vector<vector<int>>& a, int n) {', // 1
    '    for (int col = 0; col < n; col++) {', // 2
    '        int pivot = col;', // 3
    '        while (pivot < n && !a[pivot][col]) pivot++;', // 4
    '        if (pivot == n) continue;', // 5
    '        swap(a[col], a[pivot]);', // 6
    '        for (int r = 0; r < n; r++) {', // 7
    '            if (r != col && a[r][col]) {', // 8
    '                for (int c = col; c <= n; c++) a[r][c] ^= a[col][c];', // 9
    '            }', // 10
    '        }', // 11
    '    }', // 12
    '    vector<int> ans(n);', // 13
    '    for (int i = 0; i < n; i++) ans[i] = a[i][n];', // 14
    '    return ans;', // 15
    '}', // 16
  ],
  python: [
    'def xor_gaussian(a: list[list[int]], n: int) -> list[int]:', // 1
    '    for col in range(n):', // 2
    '        pivot = col', // 3
    '        while pivot < n and a[pivot][col] == 0: pivot += 1', // 4
    '        if pivot == n: continue', // 5
    '        a[col], a[pivot] = a[pivot], a[col]', // 6
    '        for r in range(n):', // 7
    '            if r != col and a[r][col] == 1:', // 8
    '                for c in range(col, n + 1): a[r][c] ^= a[col][c]', // 9
    '    return [a[i][n] for i in range(n)]', // 10
  ],
  javascript: [
    'function xorGaussian(a, n) {', // 1
    '    for (let col = 0; col < n; col++) {', // 2
    '        let pivot = col;', // 3
    '        while (pivot < n && a[pivot][col] === 0) pivot++;', // 4
    '        if (pivot === n) continue;', // 5
    '        const t = a[col]; a[col] = a[pivot]; a[pivot] = t;', // 6
    '        for (let r = 0; r < n; r++) {', // 7
    '            if (r !== col && a[r][col] === 1) {', // 8
    '                for (let c = col; c <= n; c++) a[r][c] ^= a[col][c];', // 9
    '            }', // 10
    '        }', // 11
    '    }', // 12
    '    const ans = new Array(n).fill(0);', // 13
    '    for (let i = 0; i < n; i++) ans[i] = a[i][n];', // 14
    '    return ans;', // 15
    '}', // 16
  ],
};

export const XOR_GAUSSIAN_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  findPivot: { java: 4, cpp: 4, python: 4, javascript: 4 },
  swapRow:   { java: 6, cpp: 6, python: 6, javascript: 6 },
  eliminate: { java: 9, cpp: 9, python: 9, javascript: 9 },
  returnAns: { java: 15, cpp: 15, python: 10, javascript: 15 },
};

// ==========================================
// 2. Class 136: 线性基与最大异或和 (Linear Basis - Max XOR)
// ==========================================
export const LINEAR_BASIS_CODES: Record<string, string[]> = {
  java: [
    'public long getMaxXor(long[] nums) {', // 1
    '    long[] d = new long[62];', // 2
    '    for (long x : nums) {', // 3
    '        for (int i = 60; i >= 0; i--) {', // 4
    '            if ((x & (1L << i)) != 0) {', // 5
    '                if (d[i] == 0) { d[i] = x; break; }', // 6
    '                x ^= d[i]; // 异或消去高位', // 7
    '            }', // 8
    '        }', // 9
    '    }', // 10
    '    long ans = 0;', // 11
    '    for (int i = 60; i >= 0; i--) ans = Math.max(ans, ans ^ d[i]); // 贪心查询', // 12
    '    return ans;', // 13
    '}', // 14
  ],
  cpp: [
    'long long getMaxXor(const vector<long long>& nums) {', // 1
    '    long long d[62] = {0};', // 2
    '    for (long long x : nums) {', // 3
    '        for (int i = 60; i >= 0; i--) {', // 4
    '            if ((x >> i) & 1LL) {', // 5
    '                if (!d[i]) { d[i] = x; break; }', // 6
    '                x ^= d[i];', // 7
    '            }', // 8
    '        }', // 9
    '    }', // 10
    '    long long ans = 0;', // 11
    '    for (int i = 60; i >= 0; i--) ans = max(ans, ans ^ d[i]);', // 12
    '    return ans;', // 13
    '}', // 14
  ],
  python: [
    'def get_max_xor(nums: list[int]) -> int:', // 1
    '    d = [0] * 62', // 2
    '    for x in nums:', // 3
    '        for i in range(60, -1, -1):', // 4
    '            if (x >> i) & 1:', // 5
    '                if d[i] == 0: d[i] = x; break', // 6
    '                x ^= d[i]', // 7
    '    ans = 0', // 8
    '    for i in range(60, -1, -1): ans = max(ans, ans ^ d[i])', // 9
    '    return ans', // 10
  ],
  javascript: [
    'function getMaxXor(nums) {', // 1
    '    const d = new Array(62).fill(0);', // 2
    '    for (let x of nums) {', // 3
    '        for (let i = 60; i >= 0; i--) {', // 4
    '            if (x & (1 << i)) {', // 5
    '                if (!d[i]) { d[i] = x; break; }', // 6
    '                x ^= d[i];', // 7
    '            }', // 8
    '        }', // 9
    '    }', // 10
    '    let ans = 0;', // 11
    '    for (let i = 60; i >= 0; i--) ans = Math.max(ans, ans ^ d[i]);', // 12
    '    return ans;', // 13
    '}', // 14
  ],
};

export const LINEAR_BASIS_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  insertBit: { java: 5, cpp: 5, python: 5, javascript: 5 },
  addBasis:  { java: 6, cpp: 6, python: 6, javascript: 6 },
  xorElim:   { java: 7, cpp: 7, python: 7, javascript: 7 },
  queryMax:  { java: 12, cpp: 12, python: 9, javascript: 12 },
  returnAns: { java: 13, cpp: 13, python: 10, javascript: 13 },
};

// ==========================================
// 3. Class 137: 线性基第 K 小异或和 (Linear Basis - Kth XOR)
// ==========================================
export const LINEAR_BASIS_KTH_CODES: Record<string, string[]> = {
  java: [
    'public long getKthXor(long[] d, long k) {', // 1
    '    // 1. 高位消低位重构基底', // 2
    '    for (int i = 0; i <= 60; i++) {', // 3
    '        for (int j = 0; j < i; j++) {', // 4
    '            if ((d[i] & (1L << j)) != 0) d[i] ^= d[j];', // 5
    '        }', // 6
    '    }', // 7
    '    // 2. 收集非零基向量', // 8
    '    List<Long> p = new ArrayList<>();', // 9
    '    for (int i = 0; i <= 60; i++) if (d[i] != 0) p.add(d[i]);', // 10
    '    // 3. 二进制拆分求解第 K 小', // 11
    '    long ans = 0;', // 12
    '    for (int i = 0; i < p.size(); i++) {', // 13
    '        if ((k & (1L << i)) != 0) ans ^= p.get(i);', // 14
    '    }', // 15
    '    return ans;', // 16
    '}', // 17
  ],
  cpp: [
    'long long getKthXor(vector<long long>& d, long long k) {', // 1
    '    for (int i = 0; i <= 60; i++) {', // 2
    '        for (int j = 0; j < i; j++) {', // 3
    '            if ((d[i] >> j) & 1LL) d[i] ^= d[j];', // 4
    '        }', // 5
    '    }', // 6
    '    vector<long long> p;', // 7
    '    for (int i = 0; i <= 60; i++) if (d[i]) p.push_back(d[i]);', // 8
    '    long long ans = 0;', // 9
    '    for (size_t i = 0; i < p.size(); i++) {', // 10
    '        if ((k >> i) & 1LL) ans ^= p[i];', // 11
    '    }', // 12
    '    return ans;', // 13
    '}', // 14
  ],
  python: [
    'def get_kth_xor(d: list[int], k: int) -> int:', // 1
    '    for i in range(61):', // 2
    '        for j in range(i):', // 3
    '            if (d[i] >> j) & 1: d[i] ^= d[j]', // 4
    '    p = [x for x in d if x > 0]', // 5
    '    ans = 0', // 6
    '    for i in range(len(p)):', // 7
    '        if (k >> i) & 1: ans ^= p[i]', // 8
    '    return ans', // 9
  ],
  javascript: [
    'function getKthXor(d, k) {', // 1
    '    for (let i = 0; i <= 60; i++) {', // 2
    '        for (let j = 0; j < i; j++) {', // 3
    '            if (d[i] & (1 << j)) d[i] ^= d[j];', // 4
    '        }', // 5
    '    }', // 6
    '    const p = d.filter(x => x > 0);', // 7
    '    let ans = 0;', // 8
    '    for (let i = 0; i < p.length; i++) {', // 9
    '        if (k & (1 << i)) ans ^= p[i];', // 10
    '    }', // 11
    '    return ans;', // 12
    '}', // 13
  ],
};

export const LINEAR_BASIS_KTH_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  rebuild:   { java: 5, cpp: 4, python: 4, javascript: 4 },
  collectP:  { java: 10, cpp: 8, python: 5, javascript: 7 },
  combineK:  { java: 14, cpp: 11, python: 8, javascript: 10 },
  returnAns: { java: 16, cpp: 13, python: 9, javascript: 12 },
};

// ==========================================
// 4. Class 138: 01 分数规划 (Fractional Programming)
// ==========================================
export const FRACTIONAL_PROGRAMMING_CODES: Record<string, string[]> = {
  java: [
    'public double maxRatio(double[] a, double[] b, int k) {', // 1
    '    double l = 0.0, r = 1000.0;', // 2
    '    for (int iter = 0; iter < 50; iter++) { // 二分答案', // 3
    '        double mid = (l + r) / 2.0;', // 4
    '        if (check(a, b, k, mid)) l = mid; // 存在收益 >= 0 的选法', // 5
    '        else r = mid;', // 6
    '    }', // 7
    '    return l;', // 8
    '}', // 9
  ],
  cpp: [
    'double maxRatio(const vector<double>& a, const vector<double>& b, int k) {', // 1
    '    double l = 0.0, r = 1000.0;', // 2
    '    for (int iter = 0; iter < 50; iter++) {', // 3
    '        double mid = (l + r) / 2.0;', // 4
    '        if (check(a, b, k, mid)) l = mid;', // 5
    '        else r = mid;', // 6
    '    }', // 7
    '    return l;', // 8
    '}', // 9
  ],
  python: [
    'def max_ratio(a: list[float], b: list[float], k: int) -> float:', // 1
    '    l, r = 0.0, 1000.0', // 2
    '    for _ in range(50):', // 3
    '        mid = (l + r) / 2.0', // 4
    '        if check(a, b, k, mid): l = mid', // 5
    '        else: r = mid', // 6
    '    return l', // 7
  ],
  javascript: [
    'function maxRatio(a, b, k) {', // 1
    '    let l = 0.0, r = 1000.0;', // 2
    '    for (let iter = 0; iter < 50; iter++) {', // 3
    '        const mid = (l + r) / 2.0;', // 4
    '        if (check(a, b, k, mid)) l = mid;', // 5
    '        else r = mid;', // 6
    '    }', // 7
    '    return l;', // 8
    '}', // 9
  ],
};

export const FRACTIONAL_PROGRAMMING_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  calcMid:   { java: 4, cpp: 4, python: 4, javascript: 4 },
  checkTrue: { java: 5, cpp: 5, python: 5, javascript: 5 },
  returnAns: { java: 8, cpp: 8, python: 7, javascript: 8 },
};

// ==========================================
// 5. Class 139: 扩展欧几里得算法 (ExGCD)
// ==========================================
export const EXGCD_CODES: Record<string, string[]> = {
  java: [
    'public long[] exgcd(long a, long b) {', // 1
    '    if (b == 0) return new long[]{1, 0, a}; // x=1, y=0, gcd=a', // 2
    '    long[] nxt = exgcd(b, a % b);', // 3
    '    long x = nxt[1];', // 4
    '    long y = nxt[0] - (a / b) * nxt[1]; // 核心回溯公式', // 5
    '    return new long[]{x, y, nxt[2]};', // 6
    '}', // 7
  ],
  cpp: [
    'tuple<long long, long long, long long> exgcd(long long a, long long b) {', // 1
    '    if (!b) return {1, 0, a};', // 2
    '    auto [x1, y1, g] = exgcd(b, a % b);', // 3
    '    long long x = y1;', // 4
    '    long long y = x1 - (a / b) * y1;', // 5
    '    return {x, y, g};', // 6
    '}', // 7
  ],
  python: [
    'def exgcd(a: int, b: int):', // 1
    '    if b == 0: return 1, 0, a', // 2
    '    x1, y1, g = exgcd(b, a % b)', // 3
    '    x = y1', // 4
    '    y = x1 - (a // b) * y1', // 5
    '    return x, y, g', // 6
  ],
  javascript: [
    'function exgcd(a, b) {', // 1
    '    if (b === 0) return { x: 1, y: 0, gcd: a };', // 2
    '    const nxt = exgcd(b, a % b);', // 3
    '    const x = nxt.y;', // 4
    '    const y = nxt.x - Math.floor(a / b) * nxt.y;', // 5
    '    return { x, y, gcd: nxt.gcd };', // 6
    '}', // 7
  ],
};

export const EXGCD_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  baseCase:  { java: 2, cpp: 2, python: 2, javascript: 2 },
  recursive: { java: 3, cpp: 3, python: 3, javascript: 3 },
  calcXY:    { java: 5, cpp: 5, python: 5, javascript: 5 },
  returnAns: { java: 6, cpp: 6, python: 6, javascript: 6 },
};

// ==========================================
// 6. Class 140: 二元一次不定方程 (Diophantine Equation)
// ==========================================
export const DIOPHANTINE_CODES: Record<string, string[]> = {
  java: [
    'public long minPositiveX(long a, long b, long c) {', // 1
    '    long[] res = exgcd(a, b); long g = res[2];', // 2
    '    if (c % g != 0) return -1; // 裴蜀定理无整数解', // 3
    '    long x0 = res[0] * (c / g); // 特解', // 4
    '    long dx = Math.abs(b / g); // 解的周期步长', // 5
    '    return (x0 % dx + dx - 1) % dx + 1; // 最小正整数解', // 6
    '}', // 7
  ],
  cpp: [
    'long long minPositiveX(long long a, long long b, long long c) {', // 1
    '    auto [x0, y0, g] = exgcd(a, b);', // 2
    '    if (c % g) return -1;', // 3
    '    x0 *= (c / g);', // 4
    '    long long dx = llabs(b / g);', // 5
    '    return (x0 % dx + dx - 1) % dx + 1;', // 6
    '}', // 7
  ],
  python: [
    'def min_positive_x(a: int, b: int, c: int) -> int:', // 1
    '    x0, _, g = exgcd(a, b)', // 2
    '    if c % g != 0: return -1', // 3
    '    x0 *= (c // g)', // 4
    '    dx = abs(b // g)', // 5
    '    return (x0 % dx + dx - 1) % dx + 1', // 6
  ],
  javascript: [
    'function minPositiveX(a, b, c) {', // 1
    '    const res = exgcd(a, b); const g = res.gcd;', // 2
    '    if (c % g !== 0) return -1;', // 3
    '    let x0 = res.x * Math.floor(c / g);', // 4
    '    const dx = Math.abs(Math.floor(b / g));', // 5
    '    return (x0 % dx + dx - 1) % dx + 1;', // 6
    '}', // 7
  ],
};

export const DIOPHANTINE_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  callExgcd: { java: 2, cpp: 2, python: 2, javascript: 2 },
  checkMod:  { java: 3, cpp: 3, python: 3, javascript: 3 },
  scaleSpec: { java: 4, cpp: 4, python: 4, javascript: 4 },
  returnAns: { java: 6, cpp: 6, python: 6, javascript: 6 },
};
