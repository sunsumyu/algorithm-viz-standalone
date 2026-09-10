/**
 * 左神算法通关课 第 097 课 - 质数、筛法与质因数分解题目背景与理论
 */

export const MATH_097_PROBLEMS = {
  smallPrime: {
    title: '试除法判素数 (Trial Division Prime)',
    source: '经典数论基础',
    timeComplexity: 'O(sqrt(n))',
    spaceComplexity: 'O(1)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【算法原理】</h4>
        <p>若一个数 <code>n > 1</code> 是合数，则必存在因数 <code>d</code> 满足 <code>2 <= d <= sqrt(n)</code>。因此只需检验 <code>2 ~ sqrt(n)</code> 之间的整数是否能整除 <code>n</code> 即可。</p>
        <p><strong>优化</strong>：先特判 <code>n <= 1</code>（非素数），再特判偶数（若 <code>n == 2</code> 为素数，其余偶数非素数）；随后只检查形如 <code>6k±1</code> 或奇数步长，大幅减少试除次数。</p>
      </div>
    `,
  },
  largePrime: {
    title: 'Miller-Rabin 大素数测试 (Miller-Rabin Primality Test)',
    source: '洛谷 P3383 / 概率型大素数判定',
    timeComplexity: 'O(k * log^3 n)',
    spaceComplexity: 'O(1)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【理论基础】</h4>
        <ol>
          <li><strong>费马小定理</strong>：若 <code>p</code> 是质数且 <code>gcd(a, p) = 1</code>，则 <code>a^(p-1) ≡ 1 (mod p)</code>；</li>
          <li><strong>二次探测定理</strong>：若 <code>p</code> 是质数且 <code>0 < x < p</code>，则方程 <code>x^2 ≡ 1 (mod p)</code> 的唯一解为 <code>x = 1</code> 或 <code>x = p - 1</code>。</li>
        </ol>
        <p>将 <code>n - 1</code> 拆解为 <code>d * 2^s</code> (其中 <code>d</code> 为奇数)。随机或固定选取基底测试集（如 <code>2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37</code>），在 <code>2^64</code> 范围内可达到 100% 确定性准确判定！</p>
      </div>
    `,
  },
  primeFactors: {
    title: '质因子分解 (Prime Factorization)',
    source: '算术基本定理 / 经典质因子分解',
    timeComplexity: 'O(sqrt(n))',
    spaceComplexity: 'O(log n)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【算术基本定理】</h4>
        <p>任何大于 1 的正整数 <code>n</code> 都可以唯一分解为质数幂次的乘积：</p>
        <p><code>n = p1^c1 * p2^c2 * ... * pk^ck</code></p>
        <p>从最小质数 <code>i = 2</code> 开始试除，若 <code>n % i == 0</code>，则不断除以 <code>i</code> 并累计计数 <code>count</code>；当 <code>i * i > n</code> 时若 <code>n > 1</code>，剩余的 <code>n</code> 本身必定是一个大于 <code>sqrt(原n)</code> 的大质数！</p>
      </div>
    `,
  },
  ehrlichEulerSieve: {
    title: '埃氏筛与欧拉线性筛 (Eratosthenes vs Euler Sieve)',
    source: '洛谷 P3383 / 经典素数筛法对比',
    timeComplexity: '埃氏筛 O(n log log n), 欧拉筛 O(n)',
    spaceComplexity: 'O(n)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【双算法对比机制】</h4>
        <ul>
          <li><strong>埃拉托斯特尼筛 (埃氏筛)</strong>：找到质数 <code>p</code> 后，标记其所有倍数 <code>2p, 3p, ...</code>。缺陷：某个合数会被多个质因子重复标记（如 12 被 2 和 3 重复筛掉）；</li>
          <li><strong>欧拉线性筛</strong>：保证每个合数<strong>仅被其最小质因子标记一次</strong>！在 <code>i % primes[j] == 0</code> 时及时 break 剪枝，确保严格 <code>O(n)</code> 线性时间复杂度。</li>
        </ul>
      </div>
    `,
  },
};
