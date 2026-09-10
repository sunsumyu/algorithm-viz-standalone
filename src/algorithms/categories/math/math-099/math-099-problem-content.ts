/**
 * 左神算法通关课 第 099 课 - 逆元、容斥与组合数学题目背景与理论
 */

export const MATH_099_PROBLEMS = {
  inverseSingle: {
    title: '乘法逆元单点求法 (Modular Inverse Single)',
    source: '费马小定理与扩展欧几里得 (Fermat & Exgcd)',
    timeComplexity: 'O(log p)',
    spaceComplexity: 'O(1)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【逆元定义】</h4>
        <p>若 <code>(a * x) ≡ 1 (mod p)</code>，则称 <code>x</code> 为 <code>a</code> 在模 <code>p</code> 意义下的<strong>乘法逆元</strong>，记作 <code>a^(-1)</code>。用于将除法转换为乘法：<code>(A / a) % p = (A * a^(-1)) % p</code>。</p>
        <p><strong>费马小定理</strong>：当 <code>p</code> 为质数时，<code>a^(p-1) ≡ 1 (mod p)</code> ➔ <code>a * a^(p-2) ≡ 1 (mod p)</code> ➔ 逆元即为 <code>a^(p-2) % p</code>，可通过快速幂在 <code>O(log p)</code> 内求解！</p>
      </div>
    `,
  },
  inverseSerial: {
    title: '线性递推求逆元 (Linear Inverses 1 to n)',
    source: '洛谷 P3811 / 线性求逆元',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【线性递推式】</h4>
        <p>设 <code>p = k * i + r</code> (其中 <code>k = floor(p / i), r = p % i</code>)。在模 <code>p</code> 意义下：</p>
        <p><code>k * i + r ≡ 0 (mod p)</code> ➔ 两边同乘以 <code>i^(-1) * r^(-1)</code>：</p>
        <p><code>k * r^(-1) + i^(-1) ≡ 0</code> ➔ <code>i^(-1) ≡ -k * r^(-1) ≡ (p - floor(p / i)) * inv[p % i] (mod p)</code>！</p>
        <p>边界 <code>inv[1] = 1</code>。自小到大递推即可在 <code>O(n)</code> 内求出 <code>1 ~ n</code> 的全部逆元！</p>
      </div>
    `,
  },
  inverseFactorial: {
    title: '阶乘逆元与组合数快速计算 (Factorial Inverses & nCr)',
    source: '组合计数核心模板',
    timeComplexity: '预处理 O(n + log p)，单次查询 O(1)',
    spaceComplexity: 'O(n)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【阶乘倒推逆元】</h4>
        <ol>
          <li>先计算阶乘 <code>fact[i] = (fact[i-1] * i) % p</code>；</li>
          <li>用快速幂单独求出最大阶乘的逆元 <code>invFact[n] = (fact[n])^(p-2) % p</code>；</li>
          <li>倒推：因为 <code>((i - 1)!)^(-1) ≡ (i!)^(-1) * i (mod p)</code>，可 <code>O(n)</code> 倒推所有阶乘逆元；</li>
          <li>随后可 <code>O(1)</code> 快速回答任意组合数：<code>C(n, m) = fact[n] * invFact[m] * invFact[n - m] % p</code>！</li>
        </ol>
      </div>
    `,
  },
  subsetGcdK: {
    title: '子集 GCD 为 K 的方案数 (Subset GCD K / Inclusion-Exclusion)',
    source: 'Codeforces / 容斥原理倒序消重',
    timeComplexity: 'O(maxV * log(maxV))',
    spaceComplexity: 'O(maxV)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【容斥原理分析】</h4>
        <p>统计数组中所有非空子集使得其最大公约数恰好为 <code>k</code> 的子集个数。</p>
        <p>设 <code>cnt[x]</code> 为数组中是 <code>x</code> 的倍数的元素个数。则所有 GCD 为 <code>x</code> 的倍数的子集数为 <code>2^cnt[x] - 1</code>。从最大值倒序循环，通过容斥原理减去所有 <code>2x, 3x, ...</code> 真实 GCD 方案，即可精准剥离出恰好为 <code>k</code> 的方案数！</p>
      </div>
    `,
  },
  coinBuyWays: {
    title: '硬币购物方案数 (Coin Buy Ways / 容斥背包)',
    source: 'HAOI 2008 / 洛谷 P1450',
    timeComplexity: '背包预处理 O(S)，单次询问 O(2^4)',
    spaceComplexity: 'O(S)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【容斥与完全背包组合】</h4>
        <p>4 种硬币面额 <code>c1, c2, c3, c4</code>，每次购买支付总额 <code>s</code>，每种硬币最多使用 <code>d_i</code> 枚。</p>
        <p>先无限制完全背包预处理出 <code>dp[s]</code>。随后对 4 种硬币的“超限使用”应用容斥原理：枚举 <code>2^4 = 16</code> 种超额子集，强制让某几种硬币超额使用至少 <code>d_i + 1</code> 枚，奇减偶加得到最终满足限制的合法方案数！</p>
      </div>
    `,
  },
  musicPlaylists: {
    title: '音乐播放列表 (Number of Music Playlists)',
    source: 'LeetCode 920 / 斯特林数与动态规划',
    timeComplexity: 'O(goal * n)',
    spaceComplexity: 'O(goal * n)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【动态规划状态转移】</h4>
        <p>播放列表总长 <code>goal</code>，歌曲库共 <code>n</code> 首不同歌。每首歌至少放 1 次，且同一首歌再次播放前至少相隔 <code>k</code> 首歌。</p>
        <p>定义 <code>dp[i][j]</code> 为长度为 <code>i</code>、包含 <code>j</code> 种不同歌的方案数：</p>
        <ul>
          <li><strong>播放一首全新歌曲</strong>：<code>dp[i-1][j-1] * (n - (j - 1))</code>；</li>
          <li><strong>重播一首旧歌曲</strong>（要求 <code>j > k</code>）：<code>dp[i-1][j] * (j - k)</code>。</li>
        </ul>
      </div>
    `,
  },
};
