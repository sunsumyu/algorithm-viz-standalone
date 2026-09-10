/**
 * 左神算法通关课 167 ~ 172 扩展卢卡斯、EXCRT、EXBSGS、多项式除法、多项式开方与多项式 ln/exp 多语言代码与 1-based 行号映射
 */

export interface CodeMapping {
  java: number;
  cpp: number;
  python: number;
  javascript: number;
}

// ==========================================
// 1. Class 167: 扩展卢卡斯定理 (EXLucas)
// ==========================================
export const EXLUCAS_CODES: Record<string, string[]> = {
  java: [
    'public long exLucas(long n, long m, long p) { // 任意模数 P 质因数分解', // 1
    '    long ans = 0, tempP = p;', // 2
    '    for (long i = 2; i * i <= tempP; i++) {', // 3
    '        if (tempP % i == 0) {', // 4
    '            long pk = 1; while (tempP % i == 0) { pk *= i; tempP /= i; }', // 5
    '            long ai = solveSub(n, m, i, pk); // 剥离质因子求子同余解', // 6
    '            ans = (ans + ai * (p / pk) % p * inv(p / pk, pk)) % p; // CRT 合并', // 7
    '        }', // 8
    '    }', // 9
    '    if (tempP > 1) { /* 合并剩余质数模数 */ }', // 10
    '    return (ans % p + p) % p;', // 11
    '}', // 12
  ],
  cpp: [
    'long long exLucas(long long n, long long m, long long p) {', // 1
    '    long long ans = 0, tempP = p;', // 2
    '    for (long long i = 2; i * i <= tempP; i++) {', // 3
    '        if (tempP % i == 0) {', // 4
    '            long long pk = 1; while (tempP % i == 0) { pk *= i; tempP /= i; }', // 5
    '            long long ai = solveSub(n, m, i, pk);', // 6
    '            ans = (ans + ai * (p / pk) % p * inv(p / pk, pk)) % p;', // 7
    '        }', // 8
    '    }', // 9
    '    if (tempP > 1) { /* 合并剩余质数模数 */ }', // 10
    '    return (ans % p + p) % p;', // 11
    '}', // 12
  ],
  python: [
    'def ex_lucas(self, n: int, m: int, p: int) -> int:', // 1
    '    ans, temp_p = 0, p', // 2
    '    i = 2', // 3
    '    while i * i <= temp_p:', // 4
    '        if temp_p % i == 0:', // 5
    '            pk = 1', // 6
    '            while temp_p % i == 0: pk *= i; temp_p //= i', // 7
    '            ai = self.solve_sub(n, m, i, pk) # 剥离质因子', // 8
    '            ans = (ans + ai * (p // pk) * self.inv(p // pk, pk)) % p', // 9
    '        i += 1', // 10
    '    return (ans % p + p) % p', // 11
  ],
  javascript: [
    'function exLucas(n, m, p) {', // 1
    '    let ans = 0n, tempP = BigInt(p);', // 2
    '    for (let i = 2n; i * i <= tempP; i++) {', // 3
    '        if (tempP % i === 0n) {', // 4
    '            let pk = 1n; while (tempP % i === 0n) { pk *= i; tempP /= i; }', // 5
    '            const ai = solveSub(n, m, i, pk);', // 6
    '            ans = (ans + ai * (BigInt(p) / pk) * inv(BigInt(p) / pk, pk)) % BigInt(p);', // 7
    '        }', // 8
    '    }', // 9
    '    return Number((ans % BigInt(p) + BigInt(p)) % BigInt(p));', // 10
    '}', // 11
  ],
};

export const EXLUCAS_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  factorP:   { java: 5, cpp: 5, python: 7, javascript: 5 },
  subSolve:  { java: 6, cpp: 6, python: 8, javascript: 6 },
  crtMerge:  { java: 7, cpp: 7, python: 9, javascript: 7 },
  returnAns: { java: 11, cpp: 11, python: 11, javascript: 10 },
};

// ==========================================
// 2. Class 168: 扩展中国剩余定理 (EXCRT)
// ==========================================
export const EXCRT_CODES: Record<string, string[]> = {
  java: [
    'public long excrt(long[] m, long[] r, int n) { // 合并模数不互质线性同余方程', // 1
    '    long M = m[0], R = r[0];', // 2
    '    for (int i = 1; i < n; i++) {', // 3
    '        long c = (r[i] - R % m[i] + m[i]) % m[i]; // M * t = r_i - R (mod m_i)', // 4
    '        long gcd = exgcd(M, m[i]); if (c % gcd != 0) return -1; // 无解', // 5
    '        long t = mul(x, c / gcd, m[i] / gcd); // 最小非负特解', // 6
    '        R += M * t; M = M / gcd * m[i]; R = (R % M + M) % M; // 更新模数与余数', // 7
    '    }', // 8
    '    return R;', // 9
    '}', // 10
  ],
  cpp: [
    'long long excrt(const vector<long long>& m, const vector<long long>& r, int n) {', // 1
    '    long long M = m[0], R = r[0];', // 2
    '    for (int i = 1; i < n; i++) {', // 3
    '        long long c = (r[i] - R % m[i] + m[i]) % m[i];', // 4
    '        long long gcd = exgcd(M, m[i]); if (c % gcd != 0) return -1;', // 5
    '        long long t = mul(x, c / gcd, m[i] / gcd);', // 6
    '        R += M * t; M = M / gcd * m[i]; R = (R % M + M) % M;', // 7
    '    }', // 8
    '    return R;', // 9
    '}', // 10
  ],
  python: [
    'def excrt(self, m: list[int], r: list[int], n: int) -> int:', // 1
    '    M, R = m[0], r[0]', // 2
    '    for i in range(1, n):', // 3
    '        c = (r[i] - R % m[i] + m[i]) % m[i]', // 4
    '        gcd, x, _ = self.exgcd(M, m[i])', // 5
    '        if c % gcd != 0: return -1 # 无解', // 6
    '        t = (x * (c // gcd)) % (m[i] // gcd)', // 7
    '        R += M * t; M = (M // gcd) * m[i]; R %= M', // 8
    '    return R', // 9
  ],
  javascript: [
    'function excrt(m, r, n) {', // 1
    '    let M = BigInt(m[0]), R = BigInt(r[0]);', // 2
    '    for (let i = 1; i < n; i++) {', // 3
    '        const mi = BigInt(m[i]), ri = BigInt(r[i]);', // 4
    '        const c = (ri - R % mi + mi) % mi;', // 5
    '        const { gcd, x } = exgcd(M, mi); if (c % gcd !== 0n) return -1;', // 6
    '        const t = ((x % (mi / gcd)) * (c / gcd)) % (mi / gcd);', // 7
    '        R += M * t; M = (M / gcd) * mi; R = (R % M + M) % M;', // 8
    '    }', // 9
    '    return Number(R);', // 10
    '}', // 11
  ],
};

export const EXCRT_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  diffCheck: { java: 4, cpp: 4, python: 4, javascript: 5 },
  exgcdSolve:{ java: 5, cpp: 5, python: 5, javascript: 6 },
  mergeStep: { java: 7, cpp: 7, python: 8, javascript: 8 },
  returnAns: { java: 9, cpp: 9, python: 9, javascript: 10 },
};

// ==========================================
// 3. Class 169: 扩展 BSGS (EXBSGS)
// ==========================================
export const EXBSGS_CODES: Record<string, string[]> = {
  java: [
    'public long exbsgs(long a, long b, long p) { // a^x = b (mod p), gcd(a, p) 可能 > 1', // 1
    '    if (b == 1 || p == 1) return 0; // 0 次幂恒为 1', // 2
    '    long g, d = 1, cnt = 0;', // 3
    '    while ((g = gcd(a, p)) > 1) { // 提取消去公因子', // 4
    '        if (b % g != 0) return -1; // 无解', // 5
    '        cnt++; b /= g; p /= g; d = (d * (a / g)) % p;', // 6
    '        if (d == b) return cnt;', // 7
    '    }', // 8
    '    long ans = standardBSGS(a, b, p, d); // 转化为互质 BSGS', // 9
    '    return ans == -1 ? -1 : ans + cnt;', // 10
    '}', // 11
  ],
  cpp: [
    'long long exbsgs(long long a, long long b, long long p) {', // 1
    '    if (b == 1 || p == 1) return 0;', // 2
    '    long long g, d = 1, cnt = 0;', // 3
    '    while ((g = gcd(a, p)) > 1) {', // 4
    '        if (b % g != 0) return -1;', // 5
    '        cnt++; b /= g; p /= g; d = (d * (a / g)) % p;', // 6
    '        if (d == b) return cnt;', // 7
    '    }', // 8
    '    long long ans = standardBSGS(a, b, p, d);', // 9
    '    return ans == -1 ? -1 : ans + cnt;', // 10
    '}', // 11
  ],
  python: [
    'def exbsgs(self, a: int, b: int, p: int) -> int:', // 1
    '    if b == 1 or p == 1: return 0', // 2
    '    d, cnt = 1, 0', // 3
    '    while True:', // 4
    '        g = math.gcd(a, p)', // 5
    '        if g == 1: break', // 6
    '        if b % g != 0: return -1', // 7
    '        cnt += 1; b //= g; p //= g; d = (d * (a // g)) % p', // 8
    '        if d == b: return cnt', // 9
    '    ans = self.standard_bsgs(a, b, p, d)', // 10
    '    return -1 if ans == -1 else ans + cnt', // 11
  ],
  javascript: [
    'function exbsgs(a, b, p) {', // 1
    '    if (b === 1 || p === 1) return 0;', // 2
    '    let d = 1, cnt = 0;', // 3
    '    while (true) {', // 4
    '        const g = gcd(a, p); if (g === 1) break;', // 5
    '        if (b % g !== 0) return -1;', // 6
    '        cnt++; b = Math.floor(b / g); p = Math.floor(p / g); d = (d * Math.floor(a / g)) % p;', // 7
    '        if (d === b) return cnt;', // 8
    '    }', // 9
    '    const ans = standardBSGS(a, b, p, d);', // 10
    '    return ans === -1 ? -1 : ans + cnt;', // 11
    '}', // 12
  ],
};

export const EXBSGS_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  baseCheck: { java: 2, cpp: 2, python: 2, javascript: 2 },
  extractGCD:{ java: 4, cpp: 4, python: 5, javascript: 5 },
  divFactor: { java: 6, cpp: 6, python: 8, javascript: 7 },
  returnAns: { java: 10, cpp: 10, python: 11, javascript: 11 },
};

// ==========================================
// 4. Class 170: 多项式除法与取模 (Polynomial Division)
// ==========================================
export const POLYNOMIAL_DIVISION_CODES: Record<string, string[]> = {
  java: [
    'public void polyDiv(long[] a, int n, long[] b, int m, long[] q, long[] r) {', // 1
    '    reverse(a, n); reverse(b, m); // 构造反转系数 A^R 与 B^R', // 2
    '    polyInv(n - m + 1, b, invB); // 对 B^R 求模 x^(n-m+1) 乘法逆元', // 3
    '    nttMul(a, n - m + 1, invB, n - m + 1, q); // Q^R = A^R * (B^R)^(-1)', // 4
    '    reverse(q, n - m + 1); // 还原商式 Q(x)', // 5
    '    reverse(a, n); reverse(b, m); // 还原 A 与 B', // 6
    '    // R(x) = A(x) - Q(x) * B(x)', // 7
    '    nttMul(q, n - m + 1, b, m, qb);', // 8
    '    for (int i = 0; i < m - 1; i++) r[i] = (a[i] - qb[i] + P) % P; // 余式', // 9
    '}', // 10
  ],
  cpp: [
    'void polyDiv(vector<long long>& a, int n, vector<long long>& b, int m, vector<long long>& q, vector<long long>& r) {', // 1
    '    reverse(a.begin(), a.begin() + n); reverse(b.begin(), b.begin() + m);', // 2
    '    polyInv(n - m + 1, b, invB);', // 3
    '    nttMul(a, n - m + 1, invB, n - m + 1, q);', // 4
    '    reverse(q.begin(), q.begin() + (n - m + 1));', // 5
    '    reverse(a.begin(), a.begin() + n); reverse(b.begin(), b.begin() + m);', // 6
    '    nttMul(q, n - m + 1, b, m, qb);', // 7
    '    for (int i = 0; i < m - 1; i++) r[i] = (a[i] - qb[i] + P) % P;', // 8
    '}', // 9
  ],
  python: [
    'def poly_div(self, a: list[int], n: int, b: list[int], m: int):', // 1
    '    a_rev = a[:n][::-1]; b_rev = b[:m][::-1] # 翻转系数', // 2
    '    inv_b = self.poly_inv(n - m + 1, b_rev)', // 3
    '    q_rev = self.ntt_mul(a_rev[:n - m + 1], inv_b[:n - m + 1])', // 4
    '    q = q_rev[:n - m + 1][::-1] # 还原商式', // 5
    '    qb = self.ntt_mul(q, b[:m])', // 6
    '    r = [(a[i] - qb[i] + P) % P for i in range(m - 1)] # 余式 R = A - Q*B', // 7
    '    return q, r', // 8
  ],
  javascript: [
    'function polyDiv(a, n, b, m) {', // 1
    '    const aRev = a.slice(0, n).reverse(); const bRev = b.slice(0, m).reverse();', // 2
    '    const invB = polyInv(n - m + 1, bRev);', // 3
    '    const qRev = nttMul(aRev.slice(0, n - m + 1), invB.slice(0, n - m + 1));', // 4
    '    const q = qRev.slice(0, n - m + 1).reverse();', // 5
    '    const qb = nttMul(q, b.slice(0, m));', // 6
    '    const r = []; for (let i = 0; i < m - 1; i++) r.push((a[i] - qb[i] + P) % P);', // 7
    '    return { q, r };', // 8
    '}', // 9
  ],
};

export const POLYNOMIAL_DIVISION_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  revCoeffs: { java: 2, cpp: 2, python: 2, javascript: 2 },
  invDiv:    { java: 3, cpp: 3, python: 3, javascript: 3 },
  computeQ:  { java: 5, cpp: 5, python: 5, javascript: 5 },
  calcRemainder:{ java: 9, cpp: 8, python: 7, javascript: 7 },
};

// ==========================================
// 5. Class 171: 多项式开方 (Polynomial Sqrt)
// ==========================================
export const POLYNOMIAL_SQRT_CODES: Record<string, string[]> = {
  java: [
    'public void polySqrt(int deg, long[] a, long[] b) { // B^2 = A (mod x^deg)', // 1
    '    if (deg == 1) { b[0] = 1; return; } // 边界 a0 = 1', // 2
    '    polySqrt((deg + 1) >> 1, a, b); // 倍增求解前半部分 B0', // 3
    '    polyInv(deg, b, invB); // 求 2*B0 的模逆元', // 4
    '    // 牛顿迭代: B = (B0^2 + A) / (2 B0) = B0 / 2 + A / (2 B0)', // 5
    '    nttMul(a, deg, invB, deg, tmp);', // 6
    '    for (int i = 0; i < deg; i++) b[i] = (b[i] + tmp[i]) * INV2 % P; // 均值折半', // 7
    '}', // 8
  ],
  cpp: [
    'void polySqrt(int deg, const vector<long long>& a, vector<long long>& b) {', // 1
    '    if (deg == 1) { b[0] = 1; return; }', // 2
    '    polySqrt((deg + 1) >> 1, a, b);', // 3
    '    polyInv(deg, b, invB);', // 4
    '    nttMul(a, deg, invB, deg, tmp);', // 5
    '    for (int i = 0; i < deg; i++) b[i] = (b[i] + tmp[i]) * INV2 % P;', // 6
    '}', // 7
  ],
  python: [
    'def poly_sqrt(self, deg: int, a: list[int], b: list[int]):', // 1
    '    if deg == 1: b[0] = 1; return', // 2
    '    self.poly_sqrt((deg + 1) // 2, a, b)', // 3
    '    inv_b = self.poly_inv(deg, b)', // 4
    '    tmp = self.ntt_mul(a[:deg], inv_b[:deg]) # A / B0', // 5
    '    for i in range(deg): b[i] = (b[i] + tmp[i]) * INV2 % P', // 6
  ],
  javascript: [
    'function polySqrt(deg, a, b) {', // 1
    '    if (deg === 1) { b[0] = 1n; return; }', // 2
    '    polySqrt((deg + 1) >> 1, a, b);', // 3
    '    const invB = polyInv(deg, b);', // 4
    '    const tmp = nttMul(a.slice(0, deg), invB.slice(0, deg));', // 5
    '    for (let i = 0; i < deg; i++) b[i] = ((b[i] + tmp[i]) * INV2) % P;', // 6
    '}', // 7
  ],
};

export const POLYNOMIAL_SQRT_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  baseCase:  { java: 2, cpp: 2, python: 2, javascript: 2 },
  recurHalf: { java: 3, cpp: 3, python: 3, javascript: 3 },
  invSolve:  { java: 4, cpp: 4, python: 4, javascript: 4 },
  newtonStep:{ java: 7, cpp: 6, python: 6, javascript: 6 },
};

// ==========================================
// 6. Class 172: 多项式对数与指数 (Polynomial Ln & Exp)
// ==========================================
export const POLYNOMIAL_LN_EXP_CODES: Record<string, string[]> = {
  java: [
    'public void polyLn(int n, long[] a, long[] res) { // ln A(x) = integral(A\'(x) / A(x))', // 1
    '    for (int i = 1; i < n; i++) da[i - 1] = i * a[i] % P; // 逐项求导 A\'(x)', // 2
    '    polyInv(n, a, invA); // 多项式求逆', // 3
    '    nttMul(da, n, invA, n, tmp); // 点值相乘求导商', // 4
    '    res[0] = 0; for (int i = 1; i < n; i++) res[i] = tmp[i - 1] * inv[i] % P; // 不定积分', // 5
    '}', // 6
    'public void polyExp(int deg, long[] a, long[] b) { // B = B0*(1 - ln(B0) + A) mod x^deg', // 7
    '    if (deg == 1) { b[0] = 1; return; }', // 8
    '    polyExp((deg + 1) >> 1, a, b); polyLn(deg, b, lnB); // 递归倍增并计算对数', // 9
    '    // 牛顿迭代倍增递推 exp', // 10
    '}', // 11
  ],
  cpp: [
    'void polyLn(int n, const vector<long long>& a, vector<long long>& res) {', // 1
    '    for (int i = 1; i < n; i++) da[i - 1] = i * a[i] % P;', // 2
    '    polyInv(n, a, invA);', // 3
    '    nttMul(da, n, invA, n, tmp);', // 4
    '    res[0] = 0; for (int i = 1; i < n; i++) res[i] = tmp[i - 1] * inv[i] % P;', // 5
    '}', // 6
    'void polyExp(int deg, const vector<long long>& a, vector<long long>& b) {', // 7
    '    if (deg == 1) { b[0] = 1; return; }', // 8
    '    polyExp((deg + 1) >> 1, a, b); polyLn(deg, b, lnB);', // 9
    '}', // 10
  ],
  python: [
    'def poly_ln(self, n: int, a: list[int]) -> list[int]:', // 1
    '    da = [(i * a[i]) % P for i in range(1, n)] # 逐项求导', // 2
    '    inv_a = self.poly_inv(n, a)', // 3
    '    tmp = self.ntt_mul(da, inv_a[:n])', // 4
    '    res = [0] + [(tmp[i - 1] * self.inv[i]) % P for i in range(1, n)] # 不定积分', // 5
    '    return res', // 6
    'def poly_exp(self, deg: int, a: list[int], b: list[int]):', // 7
    '    if deg == 1: b[0] = 1; return', // 8
    '    self.poly_exp((deg + 1) // 2, a, b)', // 9
  ],
  javascript: [
    'function polyLn(n, a) {', // 1
    '    const da = []; for (let i = 1; i < n; i++) da.push((BigInt(i) * BigInt(a[i])) % P);', // 2
    '    const invA = polyInv(n, a);', // 3
    '    const tmp = nttMul(da, invA.slice(0, n));', // 4
    '    const res = [0n]; for (let i = 1; i < n; i++) res.push((tmp[i - 1] * inv(BigInt(i), P)) % P);', // 5
    '    return res.map(Number);', // 6
    '}', // 7
    'function polyExp(deg, a, b) {', // 8
    '    if (deg === 1) { b[0] = 1; return; }', // 9
    '    polyExp((deg + 1) >> 1, a, b);', // 10
    '}', // 11
  ],
};

export const POLYNOMIAL_LN_EXP_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  derivStep: { java: 2, cpp: 2, python: 2, javascript: 2 },
  invStep:   { java: 3, cpp: 3, python: 3, javascript: 3 },
  integralStep:{ java: 5, cpp: 5, python: 5, javascript: 5 },
  expNewton: { java: 9, cpp: 9, python: 9, javascript: 10 },
};
