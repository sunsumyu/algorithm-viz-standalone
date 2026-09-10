/**
 * 左神算法通关课 161 ~ 166 快速数论变换、多项式求逆、FWT、杜教筛、莫比乌斯反演与卢卡斯定理 多语言代码与 1-based 行号映射
 */

export interface CodeMapping {
  java: number;
  cpp: number;
  python: number;
  javascript: number;
}

// ==========================================
// 1. Class 161: 快速数论变换 (NTT)
// ==========================================
export const NTT_CODES: Record<string, string[]> = {
  java: [
    'public void ntt(long[] a, int n, int type) { // P=998244353, g=3, gi=332748118', // 1
    '    for (int i = 0; i < n; i++) if (i < rev[i]) swap(a, i, rev[i]); // 位逆序置换', // 2
    '    for (int mid = 1; mid < n; mid <<= 1) {', // 3
    '        long gn = power(type == 1 ? G : GI, (P - 1) / (mid << 1), P); // 原根步进', // 4
    '        for (int r = 0; r < n; r += (mid << 1)) {', // 5
    '            long g = 1;', // 6
    '            for (int l = 0; l < mid; l++, g = (g * gn) % P) {', // 7
    '                long x = a[r + l], y = (g * a[r + mid + l]) % P; // 蝶形模运算', // 8
    '                a[r + l] = (x + y) % P; a[r + mid + l] = (x - y + P) % P;', // 9
    '            }', // 10
    '        }', // 11
    '    }', // 12
    '}', // 13
  ],
  cpp: [
    'void ntt(vector<long long>& a, int n, int type) {', // 1
    '    for (int i = 0; i < n; i++) if (i < rev[i]) swap(a[i], a[rev[i]]);', // 2
    '    for (int mid = 1; mid < n; mid <<= 1) {', // 3
    '        long long gn = power(type == 1 ? G : GI, (P - 1) / (mid << 1), P);', // 4
    '        for (int r = 0; r < n; r += (mid << 1)) {', // 5
    '            long long g = 1;', // 6
    '            for (int l = 0; l < mid; l++, g = (g * gn) % P) {', // 7
    '                long long x = a[r + l], y = (g * a[r + mid + l]) % P;', // 8
    '                a[r + l] = (x + y) % P; a[r + mid + l] = (x - y + P) % P;', // 9
    '            }', // 10
    '        }', // 11
    '    }', // 12
    '}', // 13
  ],
  python: [
    'def ntt(self, a: list[int], n: int, type_flag: int):', // 1
    '    for i in range(n):', // 2
    '        if i < self.rev[i]: a[i], a[self.rev[i]] = a[self.rev[i]], a[i]', // 3
    '    mid = 1', // 4
    '    while mid < n:', // 5
    '        gn = pow(G if type_flag == 1 else GI, (P - 1) // (mid * 2), P)', // 6
    '        for r in range(0, n, mid * 2):', // 7
    '            g = 1', // 8
    '            for l in range(mid):', // 9
    '                x, y = a[r + l], (g * a[r + mid + l]) % P', // 10
    '                a[r + l] = (x + y) % P; a[r + mid + l] = (x - y + P) % P; g = (g * gn) % P', // 11
    '        mid *= 2', // 12
  ],
  javascript: [
    'function ntt(a, n, type) {', // 1
    '    for (let i = 0; i < n; i++) if (i < rev[i]) swap(a, i, rev[i]);', // 2
    '    for (let mid = 1; mid < n; mid <<= 1) {', // 3
    '        const gn = power(type === 1 ? G : GI, Math.floor((P - 1) / (mid << 1)), P);', // 4
    '        for (let r = 0; r < n; r += (mid << 1)) {', // 5
    '            let g = 1n;', // 6
    '            for (let l = 0; l < mid; l++, g = (g * gn) % P) {', // 7
    '                const x = a[r + l], y = (g * a[r + mid + l]) % P;', // 8
    '                a[r + l] = (x + y) % P; a[r + mid + l] = (x - y + P) % P;', // 9
    '            }', // 10
    '        }', // 11
    '    }', // 12
    '}', // 13
  ],
};

export const NTT_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  bitReverse:{ java: 2, cpp: 2, python: 3, javascript: 2 },
  stepRoot:  { java: 4, cpp: 4, python: 6, javascript: 4 },
  butterfly: { java: 9, cpp: 9, python: 11, javascript: 9 },
  returnAns: { java: 12, cpp: 12, python: 12, javascript: 12 },
};

// ==========================================
// 2. Class 162: 多项式求逆 (Polynomial Inverse)
// ==========================================
export const POLYNOMIAL_INVERSE_CODES: Record<string, string[]> = {
  java: [
    'public void polyInv(int deg, long[] a, long[] b) { // B = B0*(2 - A*B0) mod x^deg', // 1
    '    if (deg == 1) { b[0] = power(a[0], P - 2, P); return; } // 边界常数项求逆', // 2
    '    polyInv((deg + 1) >> 1, a, b); // 倍增递归求解前半部分', // 3
    '    int limit = 1; while (limit < (deg << 1)) limit <<= 1;', // 4
    '    // 展开点值乘法：B = B0 * (2 - A * B0)', // 5
    '    ntt(tmpA, limit, 1); ntt(b, limit, 1);', // 6
    '    for (int i = 0; i < limit; i++) b[i] = b[i] * (2 - tmpA[i] * b[i] % P + P) % P;', // 7
    '    ntt(b, limit, -1);', // 8
    '    for (int i = deg; i < limit; i++) b[i] = 0; // 高阶项截断', // 9
    '}', // 10
  ],
  cpp: [
    'void polyInv(int deg, const vector<long long>& a, vector<long long>& b) {', // 1
    '    if (deg == 1) { b[0] = power(a[0], P - 2, P); return; }', // 2
    '    polyInv((deg + 1) >> 1, a, b);', // 3
    '    int limit = 1; while (limit < (deg << 1)) limit <<= 1;', // 4
    '    ntt(tmpA, limit, 1); ntt(b, limit, 1);', // 5
    '    for (int i = 0; i < limit; i++) b[i] = b[i] * (2 - tmpA[i] * b[i] % P + P) % P;', // 6
    '    ntt(b, limit, -1);', // 7
    '    for (int i = deg; i < limit; i++) b[i] = 0;', // 8
    '}', // 9
  ],
  python: [
    'def poly_inv(self, deg: int, a: list[int], b: list[int]):', // 1
    '    if deg == 1: b[0] = pow(a[0], P - 2, P); return', // 2
    '    self.poly_inv((deg + 1) // 2, a, b)', // 3
    '    limit = 1', // 4
    '    while limit < deg * 2: limit *= 2', // 5
    '    # B = B0 * (2 - A * B0)', // 6
    '    for i in range(deg, limit): b[i] = 0', // 7
  ],
  javascript: [
    'function polyInv(deg, a, b) {', // 1
    '    if (deg === 1) { b[0] = power(a[0], P - 2n, P); return; }', // 2
    '    polyInv((deg + 1) >> 1, a, b);', // 3
    '    let limit = 1; while (limit < (deg << 1)) limit <<= 1;', // 4
    '    ntt(tmpA, limit, 1); ntt(b, limit, 1);', // 5
    '    for (let i = 0; i < limit; i++) b[i] = (b[i] * (2n - tmpA[i] * b[i] % P + P)) % P;', // 6
    '    ntt(b, limit, -1);', // 7
    '    for (let i = deg; i < limit; i++) b[i] = 0n;', // 8
    '}', // 9
  ],
};

export const POLYNOMIAL_INVERSE_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  baseCase:  { java: 2, cpp: 2, python: 2, javascript: 2 },
  recurseHalf:{ java: 3, cpp: 3, python: 3, javascript: 3 },
  newtonStep:{ java: 7, cpp: 6, python: 6, javascript: 6 },
  truncate:  { java: 9, cpp: 8, python: 7, javascript: 8 },
};

// ==========================================
// 3. Class 163: 快速沃尔什变换 (FWT)
// ==========================================
export const FWT_WALSH_CODES: Record<string, string[]> = {
  java: [
    'public void fwtXor(long[] a, int n, int type) { // XOR 异或卷积蝶形变换', // 1
    '    for (int mid = 1; mid < n; mid <<= 1) {', // 2
    '        for (int r = 0; r < n; r += (mid << 1)) {', // 3
    '            for (int l = 0; l < mid; l++) {', // 4
    '                long x = a[r + l], y = a[r + mid + l];', // 5
    '                if (type == 1) { a[r + l] = (x + y) % P; a[r + mid + l] = (x - y + P) % P; } // 正变换', // 6
    '                else { a[r + l] = (x + y) * INV2 % P; a[r + mid + l] = (x - y + P) * INV2 % P; } // 逆变换', // 7
    '            }', // 8
    '        }', // 9
    '    }', // 10
    '}', // 11
  ],
  cpp: [
    'void fwtXor(vector<long long>& a, int n, int type) {', // 1
    '    for (int mid = 1; mid < n; mid <<= 1) {', // 2
    '        for (int r = 0; r < n; r += (mid << 1)) {', // 3
    '            for (int l = 0; l < mid; l++) {', // 4
    '                long long x = a[r + l], y = a[r + mid + l];', // 5
    '                if (type == 1) { a[r + l] = (x + y) % P; a[r + mid + l] = (x - y + P) % P; }', // 6
    '                else { a[r + l] = (x + y) * INV2 % P; a[r + mid + l] = (x - y + P) * INV2 % P; }', // 7
    '            }', // 8
    '        }', // 9
    '    }', // 10
    '}', // 11
  ],
  python: [
    'def fwt_xor(self, a: list[int], n: int, type_flag: int):', // 1
    '    mid = 1', // 2
    '    while mid < n:', // 3
    '        for r in range(0, n, mid * 2):', // 4
    '            for l in range(mid):', // 5
    '                x, y = a[r + l], a[r + mid + l]', // 6
    '                if type_flag == 1: a[r + l] = (x + y) % P; a[r + mid + l] = (x - y + P) % P', // 7
    '                else: a[r + l] = (x + y) * INV2 % P; a[r + mid + l] = (x - y + P) * INV2 % P', // 8
    '        mid *= 2', // 9
  ],
  javascript: [
    'function fwtXor(a, n, type) {', // 1
    '    for (let mid = 1; mid < n; mid <<= 1) {', // 2
    '        for (let r = 0; r < n; r += (mid << 1)) {', // 3
    '            for (let l = 0; l < mid; l++) {', // 4
    '                const x = a[r + l], y = a[r + mid + l];', // 5
    '                if (type === 1) { a[r + l] = (x + y) % P; a[r + mid + l] = (x - y + P) % P; }', // 6
    '                else { a[r + l] = ((x + y) * INV2) % P; a[r + mid + l] = ((x - y + P) * INV2) % P; }', // 7
    '            }', // 8
    '        }', // 9
    '    }', // 10
    '}', // 11
  ],
};

export const FWT_WALSH_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  blockLoop: { java: 2, cpp: 2, python: 3, javascript: 2 },
  forwardFwt:{ java: 6, cpp: 6, python: 7, javascript: 6 },
  inverseFwt:{ java: 7, cpp: 7, python: 8, javascript: 7 },
  returnAns: { java: 10, cpp: 10, python: 9, javascript: 10 },
};

// ==========================================
// 4. Class 164: 杜教筛 (Dujiao Sieve)
// ==========================================
export const DUJIAO_SIEVE_CODES: Record<string, string[]> = {
  java: [
    'public long getSumMu(long n) { // 杜教筛求 mu 前缀和', // 1
    '    if (n <= MAX_PRE) return sumMu[(int) n]; // 线性筛预处理边界', // 2
    '    if (memoMu.containsKey(n)) return memoMu.get(n);', // 3
    '    long ans = 1; // 卷积 (mu * 1)(n) = e(n) 的前缀和恒为 1', // 4
    '    for (long l = 2, r; l <= n; l = r + 1) { // 数论分块', // 5
    '        r = n / (n / l); ans -= (r - l + 1) * getSumMu(n / l);', // 6
    '    }', // 7
    '    memoMu.put(n, ans); return ans;', // 8
    '}', // 9
  ],
  cpp: [
    'long long getSumMu(long long n) {', // 1
    '    if (n <= MAX_PRE) return sumMu[n];', // 2
    '    if (memoMu.count(n)) return memoMu[n];', // 3
    '    long long ans = 1;', // 4
    '    for (long long l = 2, r; l <= n; l = r + 1) {', // 5
    '        r = n / (n / l); ans -= (r - l + 1) * getSumMu(n / l);', // 6
    '    }', // 7
    '    return memoMu[n] = ans;', // 8
    '}', // 9
  ],
  python: [
    'def get_sum_mu(self, n: int) -> int:', // 1
    '    if n <= MAX_PRE: return self.sum_mu[n]', // 2
    '    if n in self.memo_mu: return self.memo_mu[n]', // 3
    '    ans = 1', // 4
    '    l = 2', // 5
    '    while l <= n:', // 6
    '        r = n // (n // l); ans -= (r - l + 1) * self.get_sum_mu(n // l); l = r + 1', // 7
    '    self.memo_mu[n] = ans; return ans', // 8
  ],
  javascript: [
    'function getSumMu(n) {', // 1
    '    if (n <= MAX_PRE) return sumMu[n];', // 2
    '    if (memoMu.has(n)) return memoMu.get(n);', // 3
    '    let ans = 1;', // 4
    '    for (let l = 2, r; l <= n; l = r + 1) {', // 5
    '        r = Math.floor(n / Math.floor(n / l)); ans -= (r - l + 1) * getSumMu(Math.floor(n / l));', // 6
    '    }', // 7
    '    memoMu.set(n, ans); return ans;', // 8
    '}', // 9
  ],
};

export const DUJIAO_SIEVE_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  preCheck:  { java: 2, cpp: 2, python: 2, javascript: 2 },
  divBlock:  { java: 5, cpp: 5, python: 6, javascript: 5 },
  recurBlock:{ java: 6, cpp: 6, python: 7, javascript: 6 },
  returnAns: { java: 8, cpp: 8, python: 8, javascript: 8 },
};

// ==========================================
// 5. Class 165: 莫比乌斯反演 (Möbius Inversion)
// ==========================================
export const MOBIUS_INVERSION_CODES: Record<string, string[]> = {
  java: [
    'public long countCoprimePairs(int n, int m) { // sum_{d} mu(d) * floor(n/d) * floor(m/d)', // 1
    '    long ans = 0; int limit = Math.min(n, m);', // 2
    '    for (int l = 1, r; l <= limit; l = r + 1) { // 双元数论整除分块', // 3
    '        r = Math.min(n / (n / l), m / (m / l));', // 4
    '        ans += (long) (sumMu[r] - sumMu[l - 1]) * (n / l) * (m / l);', // 5
    '    }', // 6
    '    return ans;', // 7
    '}', // 8
  ],
  cpp: [
    'long long countCoprimePairs(int n, int m) {', // 1
    '    long long ans = 0; int limit = min(n, m);', // 2
    '    for (int l = 1, r; l <= limit; l = r + 1) {', // 3
    '        r = min(n / (n / l), m / (m / l));', // 4
    '        ans += (long long)(sumMu[r] - sumMu[l - 1]) * (n / l) * (m / l);', // 5
    '    }', // 6
    '    return ans;', // 7
    '}', // 8
  ],
  python: [
    'def count_coprime_pairs(self, n: int, m: int) -> int:', // 1
    '    ans = 0; limit = min(n, m); l = 1', // 2
    '    while l <= limit:', // 3
    '        r = min(n // (n // l), m // (m // l))', // 4
    '        ans += (self.sum_mu[r] - self.sum_mu[l - 1]) * (n // l) * (m // l)', // 5
    '        l = r + 1', // 6
    '    return ans', // 7
  ],
  javascript: [
    'function countCoprimePairs(n, m) {', // 1
    '    let ans = 0; const limit = Math.min(n, m);', // 2
    '    for (let l = 1, r; l <= limit; l = r + 1) {', // 3
    '        r = Math.min(Math.floor(n / Math.floor(n / l)), Math.floor(m / Math.floor(m / l)));', // 4
    '        ans += (sumMu[r] - sumMu[l - 1]) * Math.floor(n / l) * Math.floor(m / l);', // 5
    '    }', // 6
    '    return ans;', // 7
    '}', // 8
  ],
};

export const MOBIUS_INVERSION_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  blockStep: { java: 3, cpp: 3, python: 3, javascript: 3 },
  calcBlock: { java: 5, cpp: 5, python: 5, javascript: 5 },
  returnAns: { java: 7, cpp: 7, python: 7, javascript: 7 },
};

// ==========================================
// 6. Class 166: 卢卡斯定理 (Lucas Theorem)
// ==========================================
export const LUCAS_THEOREM_CODES: Record<string, string[]> = {
  java: [
    'public long lucas(long n, long m, long p) { // C(n, m) = C(n/p, m/p) * C(n%p, m%p) mod p', // 1
    '    if (m == 0) return 1;', // 2
    '    return lucas(n / p, m / p, p) * comb(n % p, m % p, p) % p;', // 3
    '}', // 4
    'public long comb(long n, long m, long p) {', // 5
    '    if (n < m) return 0;', // 6
    '    return fact[(int) n] * invFact[(int) m] % p * invFact[(int) (n - m)] % p;', // 7
    '}', // 8
  ],
  cpp: [
    'long long lucas(long long n, long long m, long long p) {', // 1
    '    if (m == 0) return 1;', // 2
    '    return lucas(n / p, m / p, p) * comb(n % p, m % p, p) % p;', // 3
    '}', // 4
    'long long comb(long long n, long long m, long long p) {', // 5
    '    if (n < m) return 0;', // 6
    '    return fact[n] * invFact[m] % p * invFact[n - m] % p;', // 7
    '}', // 8
  ],
  python: [
    'def lucas(self, n: int, m: int, p: int) -> int:', // 1
    '    if m == 0: return 1', // 2
    '    return (self.lucas(n // p, m // p, p) * self.comb(n % p, m % p, p)) % p', // 3
    '', // 4
    'def comb(self, n: int, m: int, p: int) -> int:', // 5
    '    if n < m: return 0', // 6
    '    return (self.fact[n] * self.inv_fact[m] % p * self.inv_fact[n - m]) % p', // 7
  ],
  javascript: [
    'function lucas(n, m, p) {', // 1
    '    if (m === 0) return 1;', // 2
    '    return (lucas(Math.floor(n / p), Math.floor(m / p), p) * comb(n % p, m % p, p)) % p;', // 3
    '}', // 4
    'function comb(n, m, p) {', // 5
    '    if (n < m) return 0;', // 6
    '    return ((fact[n] * invFact[m]) % p * invFact[n - m]) % p;', // 7
    '}', // 8
  ],
};

export const LUCAS_THEOREM_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  baseCheck: { java: 2, cpp: 2, python: 2, javascript: 2 },
  lucasRecur:{ java: 3, cpp: 3, python: 3, javascript: 3 },
  combSmall: { java: 7, cpp: 7, python: 7, javascript: 7 },
  returnAns: { java: 3, cpp: 3, python: 3, javascript: 3 },
};
