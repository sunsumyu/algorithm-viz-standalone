/**
 * 左神算法通关课 161 ~ 166 快速数论变换、多项式求逆、FWT、杜教筛、莫比乌斯反演与卢卡斯定理 题目与解析
 */

export const ADVANCED_161_166_PROBLEMS = {
  nttTransform: {
    title: '快速数论变换 NTT (Class 161)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P3803 【模板】多项式乘法 NTT)</h2>
        <p><strong>快速数论变换 (NTT)</strong> 是在有限域模运算下实现的 FFT。利用特殊素数 $P = 998244353 = 119 \times 2^{23} + 1$ 的原根 $g = 3$，将其单位根性质在模意义下完全同构映射，彻底消除浮点数三角函数精度误差，是大整数运算与算法竞赛多项式全家桶的标准基石。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">原根步进与单位根同构</h3>
        <p>1. <strong>单位根等价替换</strong>：令 $\omega_n \equiv g^{(P-1)/n} \pmod P$。原根 $g$ 的幂次序列具备与复数单位根 $e^{2\pi i / n}$ 严格相同的周期性、折半引理与消去引理。</p>
        <p>2. <strong>逆变换 IDFT</strong>：逆变换步长为原根在模 $P$ 下的乘法逆元 $g^{-1} \equiv 332748118 \pmod P$。</p>
      </div>
    `,
  },

  polynomialInverse: {
    title: '多项式求逆 (Class 162)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P4238 【模板】多项式乘法逆)</h2>
        <p>给定多项式 $A(x)$，求多项式 $B(x)$ 满足 $A(x) B(x) \equiv 1 \pmod{x^n}$。多项式求逆是多项式除法、多项式开方、多项式 $\ln$ 与 $\exp$ 等高阶操作的基础底座。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">牛顿迭代与倍增递推</h3>
        <p>1. <strong>牛顿迭代式</strong>：设已求出模 $x^{\lceil n/2 \rceil}$ 意义下的逆元 $B_0(x)$，即 $A B_0 \equiv 1 \pmod{x^{\lceil n/2 \rceil}}$。两边平方展开移项整理可得：</p>
        <p style="text-align: center; font-weight: 700;"><code>B(x) &equiv; B_0(x) * (2 - A(x) * B_0(x)) (mod x^n)</code></p>
        <p>2. <strong>复杂度分析</strong>：根据主定理递推式 $T(n) = T(n/2) + O(n \log n) = O(n \log n)$，倍增求解总时间复杂度保持拟线性。</p>
      </div>
    `,
  },

  fwtWalsh: {
    title: '快速沃尔什变换 FWT (Class 163)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P4717 【模板】快速沃尔什变换)</h2>
        <p><strong>快速沃尔什变换 (FWT)</strong> 能够在 $O(N \log N)$ 时间内计算位运算卷积 $C_k = \sum_{i \oplus j = k} A_i B_j$（其中 $\oplus$ 为按位或 OR、按位与 AND、按位异或 XOR）。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">三种位运算基变换法则</h3>
        <ul>
          <li><strong>OR 卷积</strong>：正变换 $(A_0, A_0 + A_1)$，逆变换 $(A_0, A_1 - A_0)$。</li>
          <li><strong>AND 卷积</strong>：正变换 $(A_0 + A_1, A_1)$，逆变换 $(A_0 - A_1, A_1)$。</li>
          <li><strong>XOR 卷积</strong>：正变换 $(A_0 + A_1, A_0 - A_1)$，逆变换 $((A_0 + A_1)/2, (A_0 - A_1)/2)$。</li>
        </ul>
      </div>
    `,
  },

  dujiaoSieve: {
    title: '杜教筛 (Class 164)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (杜瑜皓发明 / 洛谷 P4213 【模板】杜教筛)</h2>
        <p><strong>杜教筛</strong> 是一种以亚线性时间 $O(n^{2/3})$ 求解积性函数前缀和 $S(n) = \sum_{i=1}^n f(i)$ 的强大数论工具（如莫比乌斯函数前缀和 $\sum \mu(i)$ 与欧拉函数前缀和 $\sum \varphi(i)$）。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">狄利克雷卷积构造方程</h3>
        <p>构造积性函数 $g$ 使得 $h = f * g$ 的前缀和容易求得。由卷积展开推导：</p>
        <p style="text-align: center; font-weight: 700;"><code>g(1) * S(n) = &sum;_{i=1}^n (f * g)(i) - &sum;_{d=2}^n g(d) * S(floor(n / d))</code></p>
        <p>利用线性筛预处理前 $n^{2/3}$ 项，后续项使用数论分块加哈希记忆化递归，将计算量从 $O(n)$ 飞跃压缩至 $O(n^{2/3})$。</p>
      </div>
    `,
  },

  mobiusInversion: {
    title: '莫比乌斯反演 (Class 165)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P3455 [POI2007] ZAP-Queries)</h2>
        <p>莫比乌斯反演是数论中用于解决互质约束计数与因数相关统计的核心武器。它利用莫比乌斯函数 $\mu(n)$ 的核心容斥性质 $\sum_{d|n} \mu(d) = [n = 1]$，将复杂的互质条件代换为因数枚举。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">数论分块与区间加速</h3>
        <p>求解 $\sum_{i=1}^N \sum_{j=1}^M [\gcd(i, j) = 1]$：反演后化简为 $\sum_{d=1}^{\min(N, M)} \mu(d) \lfloor \frac{N}{d} \rfloor \lfloor \frac{M}{d} \rfloor$。配合前缀和与数论分块（整除分块），单次询问时间复杂度仅为 $O(\sqrt{N} + \sqrt{M})$！</p>
      </div>
    `,
  },

  lucasTheorem: {
    title: '卢卡斯定理 Lucas Theorem (Class 166)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P3807 【模板】卢卡斯定理)</h2>
        <p>当组合数 $C(n, m)$ 的上下标极大（如 $n, m \le 10^{18}$），但模数 $p$ 为较小素数（如 $p \le 10^5$）时，经典阶乘逆元失效（分母含 $p$ 的倍数）。卢卡斯定理将大组合数按 $p$ 进制逐位拆分，递归分解为小规模组合数相乘。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">定理核心公式</h3>
        <p style="text-align: center; font-weight: 700;"><code>C(n, m) &equiv; C(floor(n / p), floor(m / p)) * C(n % p, m % p) (mod p)</code></p>
        <p>由于 $n \bmod p < p$ 且 $m \bmod p < p$，小规模组合数可直接利用线性预处理阶乘逆元在 $O(1)$ 内求出，总时间复杂度仅为 $O(p + \log_p n)$。</p>
      </div>
    `,
  },
};
