/**
 * 左神算法通关课 100 ~ 105 高阶字符串专题题目描述与原理解析
 */

export const STRING_100_105_PROBLEMS = {
  kmp: {
    title: 'KMP 算法核心原理 (Class 100)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (洛谷 P3375 / LeetCode 28)</h2>
        <p>给定文本串 <code>s1</code> 和模式串 <code>s2</code>，要求在 <code>O(N + M)</code> 线性时间内找出 <code>s2</code> 在 <code>s1</code> 中首次出现的位置（下标从 0 开始）。若未出现则返回 -1。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">左神核心思想</h3>
        <p>1. <strong>不回退文本串指针 i1</strong>：传统暴力匹配失配时 <code>i1</code> 会回退到起点下一位，导致最差 <code>O(N*M)</code>。KMP 通过维护 <code>next</code> 数组，保证 <code>i1</code> 永远只增不减。</p>
        <p>2. <strong>利用 next 数组加速模式串指针 i2</strong>：<code>next[i2]</code> 表示模式串前缀子串 <code>s2[0..i2-1]</code> 的<strong>最长公共前后缀长度</strong>。当 <code>s1[i1] != s2[i2]</code> 时，说明 <code>s2[0..i2-1]</code> 已经与 <code>s1</code> 对应部分完全匹配，可直接跳跃至 <code>i2 = next[i2]</code> 继续比对！</p>
      </div>
    `,
  },

  kmpPeriod: {
    title: 'KMP 循环节与周期串检测 (Class 101)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (洛谷 P4391 / POJ 2406)</h2>
        <p>给定一个长度为 <code>n</code> 的字符串 <code>s</code>，求其<strong>最小正循环节</strong>的长度。即求最小的 <code>k</code>，使得 <code>s</code> 由某个长度为 <code>k</code> 的子串重复构成（允许最后一个周期不完整）。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">周期定理与推导</h3>
        <p>根据 KMP 的 <code>next</code> 数组性质：字符串 <code>s</code> 的最长相等真前后缀长度为 <code>len = next[n]</code>。</p>
        <p>根据周期定理：若 <code>period = n - len</code>，当且仅当 <code>n % period == 0</code> 时，字符串具有完美整除的周期，最小周期长度即为 <code>period</code>；否则无完美周期。</p>
      </div>
    `,
  },

  acAutomaton: {
    title: 'AC 自动机多模式串匹配 (Class 102)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (洛谷 P3808 / P3796)</h2>
        <p>给定 <code>k</code> 个模式串和一个主文本串 <code>text</code>，求有多少个模式串在文本串中出现过？</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">AC 自动机 = Trie + KMP</h3>
        <p>1. <strong>字典树结构</strong>：将所有模式串插入到一棵 Trie 树中。</p>
        <p>2. <strong>Fail 指针（失配指针）</strong>：利用 BFS 层序遍历建立类似于 KMP 的 fail 指针，指向其他分支中具有相同最长后缀的节点。</p>
        <p>3. <strong>单次线性扫描</strong>：主文本串只需在 AC 自动机上走一次，失配顺着 fail 指针滑行，时间复杂度为 <code>O(|text| + Σ|pattern|)</code>。</p>
      </div>
    `,
  },

  manacher: {
    title: 'Manacher 最长回文子串算法 (Class 103)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (洛谷 P3805 / LeetCode 5)</h2>
        <p>给定一个字符串 <code>s</code>，在 <code>O(N)</code> 线性时间内找出其中的最长回文子串长度。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">马拉车算法三大神技</h3>
        <p>1. <strong>插入占位符 <code>#</code></strong>：在字符两端和每个间隔插入 <code>#</code>，奇偶回文统一转化为奇回文处理。</p>
        <p>2. <strong>维护全局最右回文边界 R 与中心 C</strong>：考察当前位置 <code>i</code> 时，若 <code>i < R</code>，其关于 <code>C</code> 的对称点 <code>i' = 2*C - i</code> 的回文半径已知！</p>
        <p>3. <strong>镜像加速与分类讨论</strong>：
          <ul>
            <li>情况 1：<code>i'</code> 的回文完全在 <code>[2C-R, R]</code> 内部，则 <code>p[i] = p[i']</code> 直接确定。</li>
            <li>情况 2：<code>i'</code> 的回文超出了左边界，则 <code>p[i] = R - i</code> 触底确定。</li>
            <li>情况 3：<code>i'</code> 的回文刚好落在左边界上，从 <code>R</code> 开始继续向外暴力外扩。</li>
          </ul>
        </p>
      </div>
    `,
  },

  zAlgorithm: {
    title: '扩展 KMP / Z 算法 (Class 104)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (洛谷 P5410)</h2>
        <p>给定长度为 <code>n</code> 的字符串 <code>s</code>，求 <code>s</code> 的每一个后缀与 <code>s</code> 本身的最长公共前缀 (LCP) 长度，记为 <code>z[i]</code>。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">Z-Box 匹配盒机制</h3>
        <p>维护当前到达最远右端的匹配盒区间 <code>[l, r]</code>（其中 <code>s[l..r] == s[0..r-l]</code>）：</p>
        <p>当考察 <code>i</code> 时：若 <code>i < r</code>，已知 <code>s[i..r] == s[i-l..r-l]</code>，因此 <code>z[i]</code> 至少可以继承 <code>min(r - i, z[i - l])</code>，之后再向外暴力延展，整体均摊时间复杂度为严密的 <code>O(N)</code>。</p>
      </div>
    `,
  },

  stringHash: {
    title: '字符串哈希与滚动哈希 (Class 105)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (洛谷 P3370 / LeetCode 187)</h2>
        <p>将任意长度的字符串映射为一个固定大小的整数，使得可以在 <code>O(1)</code> 时间内比对两个子串是否完全一致。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">前缀哈希公式与常数级子串比对</h3>
        <p>1. <strong>前缀哈希</strong>：<code>H[i] = (H[i-1] * P + s[i]) % MOD</code>，将字符串看成 <code>P</code> 进制数。</p>
        <p>2. <strong>区间子串哈希提取</strong>：<code>Hash(l..r) = (H[r] - H[l-1] * P^(r - l + 1)) % MOD</code>。</p>
        <p>3. <strong>双哈希防碰撞</strong>：同时使用两套不同质数进制与模数（如 P1=131, M1=10^9+7; P2=13331, M2=10^9+9），理论碰撞概率低至 10^(-18)。</p>
      </div>
    `,
  },
};
