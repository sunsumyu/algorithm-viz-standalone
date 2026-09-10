/**
 * 左神算法通关课 167 ~ 172 扩展卢卡斯、EXCRT、EXBSGS、多项式除法、多项式开方与多项式 ln/exp 题目与解析
 */

export const ADVANCED_167_172_PROBLEMS = {
  exLucas: {
    title: '扩展卢卡斯定理 EXLucas (Class 167)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P4720 【模板】扩展卢卡斯定理 / EXLucas)</h2>
        <p><strong>扩展卢卡斯定理 (EXLucas)</strong> 用于解决当模数 $P$ <strong>不是素数</strong>、而是任意合数时的大组合数求模问题：$C(n, m) \pmod P$（$n, m \le 10^{18}, P \le 10^6$）。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">四步核心求解架构</h3>
        <ul>
          <li>1. <strong>质因数分解模数</strong>：$P = p_1^{k_1} p_2^{k_2} \cdots p_r^{k_r}$。</li>
          <li>2. <strong>剥离质因子阶乘</strong>：对每个素数幂模数 $p_i^{k_i}$，将 $n!, m!, (n-m)!$ 中所含因子 $p_i$ 彻底提取分离，剩余与 $p_i$ 互质部分递归循环节周期求积。</li>
          <li>3. <strong>扩展欧几里得求逆元</strong>：对提取后的互质乘积，利用 exgcd 求模 $p_i^{k_i}$ 下的乘法逆元，补回因子 $p_i^{cnt_n - cnt_m - cnt_{n-m}}$ 得到余数 $a_i$。</li>
          <li>4. <strong>中国剩余定理 (CRT) 合并</strong>：将各 $C(n, m) \equiv a_i \pmod{p_i^{k_i}}$ 通过 CRT 唯一合并为最终模 $P$ 解。</li>
        </ul>
      </div>
    `,
  },

  excrt: {
    title: '扩展中国剩余定理 EXCRT (Class 168)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P4777 【模板】扩展中国剩余定理 / EXCRT)</h2>
        <p><strong>扩展中国剩余定理 (EXCRT)</strong> 用于求解模数<strong>不保证两两互质</strong>的同余方程组：$x \equiv r_i \pmod{m_i}$（$1 \le i \le n, m_i \le 10^{12}$）。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">双方程递推合并法</h3>
        <p>假设已求出前 $k-1$ 个方程的通解 $x \equiv R \pmod M$（其中 $M = \text{lcm}(m_1, \dots, m_{k-1})$）。考虑加入第 $k$ 个方程：</p>
        <p style="text-align: center; font-weight: 700;"><code>x = M * t + R &equiv; r_k (mod m_k) &rArr; M * t &equiv; r_k - R (mod m_k)</code></p>
        <p>若 $(r_k - R) \pmod{\gcd(M, m_k)} \ne 0$ 则方程组无解；否则利用 exgcd 求解出特解 $t_0$，更新总模数 $M' = \text{lcm}(M, m_k)$，新余数 $R' = (M \cdot t_0 + R) \bmod M'$。</p>
      </div>
    `,
  },

  exbsgs: {
    title: '扩展 BSGS (Class 169)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P4195 【模板】扩展 BSGS / EXBSGS)</h2>
        <p>求解离散对数方程 $a^x \equiv b \pmod p$ 的最小非负整数解 $x$。经典 BSGS 依赖欧拉定理求逆元，要求 $\gcd(a, p) = 1$。当 $\gcd(a, p) > 1$ 时，必须使用 <strong>扩展 BSGS</strong>。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">消去公因子与降模转化</h3>
        <p>1. 设 $g = \gcd(a, p)$。若 $g > 1$：若 $b \bmod g \ne 0$（且 $b \ne 1$）则原方程无解。</p>
        <p>2. 两边同除以 $g$：$a \cdot \frac{a^{x-1}}{g} \cdot \frac{a}{g} \equiv \frac{b}{g} \pmod{\frac{p}{g}}$。累计提取因子直至 $\gcd(a, p') = 1$。</p>
        <p>3. 转化为 $D \cdot a^{x - cnt} \equiv b' \pmod{p'}$，此时 $\gcd(a, p') = 1$，将常数项 $D$ 移项求逆后运行标准 BSGS 大步小步法。</p>
      </div>
    `,
  },

  polynomialDivision: {
    title: '多项式除法与取模 (Class 170)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P4512 【模板】多项式除法与取模)</h2>
        <p>给定 $n$ 次多项式 $A(x)$ 和 $m$ 次多项式 $B(x)$（$n \ge m$），求多项式 $Q(x)$（商式，次数 $n-m$）与 $R(x)$（余式，次数 $< m$）满足：$A(x) = Q(x) B(x) + R(x)$。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">反转系数法消去余式</h3>
        <p>代入 $1/x$ 并乘以 $x^n$，构造系数反转多项式 $A^R(x) = x^n A(1/x)$。等式转化为：</p>
        <p style="text-align: center; font-weight: 700;"><code>A^R(x) &equiv; Q^R(x) &middot; B^R(x) (mod x^{n - m + 1})</code></p>
        <p>由于余式项次数 $< m$，在模 $x^{n-m+1}$ 下被完美消去！此时直接对 $B^R(x)$ 进行多项式求逆，在 $O(n \log n)$ 内求出商式 $Q^R(x)$，翻转得到 $Q(x)$，最后回代 $R(x) = A(x) - Q(x) B(x)$。</p>
      </div>
    `,
  },

  polynomialSqrt: {
    title: '多项式开方 (Class 171)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P5205 【模板】多项式开方)</h2>
        <p>给定多项式 $A(x)$（$a_0 = 1$），求多项式 $B(x)$ 满足 $B(x)^2 \equiv A(x) \pmod{x^n}$。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">牛顿迭代二次倍增开方</h3>
        <p>设在模 $x^{\lceil n/2 \rceil}$ 下已求得逆元 $B_0(x)$，即 $B_0^2 \equiv A \pmod{x^{\lceil n/2 \rceil}}$。由牛顿迭代：</p>
        <p style="text-align: center; font-weight: 700;"><code>B(x) &equiv; (B_0^2(x) + A(x)) / (2 B_0(x)) &equiv; B_0(x) / 2 + A(x) / (2 B_0(x)) (mod x^n)</code></p>
        <p>结合多项式求逆计算 $B_0^{-1}(x)$，根据递推式 $T(n) = T(n/2) + O(n \log n) = O(n \log n)$，整体时间复杂度为拟线性 $O(n \log n)$。</p>
      </div>
    `,
  },

  polynomialLnExp: {
    title: '多项式对数与指数 ln/exp (Class 172)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P4725 / P4726 【模板】多项式对数与指数函数)</h2>
        <p>在形式幂级数代数中，$A(x)$（$a_0 = 1$）的对数函数 $\ln A(x)$ 与指数函数 $\exp A(x)$ 是组合生成函数 (EGF) 与图连通性计数的最高峰。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">微积分导数法与牛顿迭代</h3>
        <ul>
          <li><strong>多项式 ln</strong>：$\ln A(x) = \int \frac{A'(x)}{A(x)} dx$。求导 $A'(x)$ 与求逆 $A^{-1}(x)$ 卷积后逐项不定积分，一次求逆在 $O(n \log n)$ 完成。</li>
          <li><strong>多项式 exp</strong>：令 $F(B) = \ln B - A \equiv 0$。牛顿迭代倍增式：$B \equiv B_0(1 - \ln B_0 + A) \pmod{x^n}$，时间复杂度同样为 $O(n \log n)$。</li>
        </ul>
      </div>
    `,
  },
};
