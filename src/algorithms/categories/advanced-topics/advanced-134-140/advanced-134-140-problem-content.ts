/**
 * 左神算法通关课 134 ~ 140 异或高斯消元、线性基与数论扩展专题题目与解析
 */

export const ADVANCED_134_140_PROBLEMS = {
  xorGaussian: {
    title: '异或高斯消元 (Class 134)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (POJ 1830 开关问题 / 洛谷 P2447 外星千足虫)</h2>
        <p>求解系数与变量仅在有限域 <code>GF(2)</code> 取值（0 或 1）的线性方程组。方程组中加法对应<strong>异或 (XOR)</strong>，乘法对应<strong>与 (AND)</strong>。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">位运算加速消元</h3>
        <p>1. <strong>主元选取</strong>：寻找第 <code>col</code> 列系数为 1 的行，交换至第 <code>col</code> 行。</p>
        <p>2. <strong>整行异或消元</strong>：对所有在第 <code>col</code> 位也为 1 的其他行，直接执行 <code>row[r] ^= row[col]</code>。单次初等行变换可通过整数或 Bitset 位运算以 <code>O(1)</code> 或 <code>O(N/64)</code> 极速完成！</p>
        <p>3. <strong>回代判定</strong>：若出现 <code>0 = 1</code> 则方程组无解；若主元数小于未知数则存在自由元（无穷多解）；否则回代求出唯一确定解。</p>
      </div>
    `,
  },

  linearBasis: {
    title: '线性基与最大异或和 (Class 136)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (洛谷 P3812 【模板】线性基)</h2>
        <p>给定 <code>N</code> 个正整数，求从中任选若干个数进行异或，所能得到的<strong>最大异或和</strong>。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">贪心插入与基向量性质</h3>
        <p>1. <strong>定义</strong>：线性基是一组数 <code>d[60]</code>，满足原数集中任意子集异或和均能由线性基的唯一子集异或表示，且基内元素异或和不为 0。</p>
        <p>2. <strong>插入元素 x</strong>：从最高位 <code>i = 60</code> 到 0，若 <code>(x >> i) & 1</code> 为 1：</p>
        <ul>
          <li>若 <code>d[i] == 0</code>：令 <code>d[i] = x</code>，插入成功，终止。</li>
          <li>若 <code>d[i] != 0</code>：令 <code>x ^= d[i]</code>，消除第 <code>i</code> 位的 1，继续向更低位探测。</li>
        </ul>
        <p>3. <strong>求最大异或和</strong>：初始 <code>ans = 0</code>，从最高位向下遍历，若 <code>(ans ^ d[i]) > ans</code> 则令 <code>ans ^= d[i]</code>。</p>
      </div>
    `,
  },

  linearBasisKth: {
    title: '线性基重构与第 K 小异或和 (Class 137)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (HDU 3949 / 洛谷 P3857 彩灯)</h2>
        <p>求集合所有子集异或和去重排序后的<strong>第 K 小异或和</strong>。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">高位消低位与二进制映射</h3>
        <p>1. <strong>简化基底 (高位消低位)</strong>：对插入完毕的线性基，自底向上消元：若 <code>(d[i] >> j) & 1</code> 且 <code>d[j] != 0</code>，则 <code>d[i] ^= d[j]</code>，使得每个基向量独占一个二进制位，互不干扰。</p>
        <p>2. <strong>第 K 小查询</strong>：将非零基向量收集为数组 <code>p[]</code>。将 <code>K</code> 进行二进制拆分，若 <code>(K >> i) & 1</code>，则异或累加 <code>p[i]</code>，单次查询时间严格为 <code>O(log V)</code>！</p>
      </div>
    `,
  },

  fractionalProgramming: {
    title: '01 分数规划 (Class 138)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (POJ 2976 Dropping Tests / 洛谷 P4377 Talent Show)</h2>
        <p>给定 <code>N</code> 个物品，每个物品有收益 <code>a[i]</code> 和代价 <code>b[i]</code>，选出满足约束的子集使得性价比 <code>sum(a) / sum(b)</code> 最大化。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">Dinkelbach 二分判定转化</h3>
        <p>1. 假设答案为 <code>mid</code>，判断是否存在解使得：<code>sum(a_i) / sum(b_i) >= mid</code>。</p>
        <p>2. 移项等价于：<code>sum(a_i - mid * b_i) >= 0</code>。</p>
        <p>3. 将每个物品权值重新赋为 <code>w_i = a_i - mid * b_i</code>，按 <code>w_i</code> 降序排序贪心或套用背包 DP。若最大总权值 <code>>= 0</code> 说明目标性价比可达，二分向右收敛；否则向左收敛。</p>
      </div>
    `,
  },

  exgcd: {
    title: '扩展欧几里得算法 (Class 139)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (洛谷 P1082 同余方程 / Bézout 定理)</h2>
        <p>求整数 <code>x, y</code> 满足裴蜀等式 <code>a * x + b * y = gcd(a, b)</code>。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">递推回溯与辗转相除</h3>
        <p>1. 边界：当 <code>b == 0</code> 时，<code>gcd(a, 0) = a</code>，显式解为 <code>x = 1, y = 0</code>。</p>
        <p>2. 递推：设子问题解为 <code>b * x' + (a % b) * y' = gcd</code>。利用 <code>a % b = a - floor(a / b) * b</code>，代入整理得：</p>
        <p style="text-align: center; font-weight: 700;"><code>a * y' + b * (x' - floor(a / b) * y') = gcd</code></p>
        <p>3. 故当前层的解为：<code>x = y', y = x' - floor(a / b) * y'</code>。时间复杂度等同欧几里得辗转相除 <code>O(log(min(a, b)))</code>。</p>
      </div>
    `,
  },

  diophantineEquation: {
    title: '二元一次不定方程 (Class 140)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (洛谷 P5656 【模板】二元一次不定方程)</h2>
        <p>给定整数 <code>a, b, c</code>，求解不定方程 <code>a * x + b * y = c</code> 的最小正整数解与通解结构。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">解的存在性与通解周期</h3>
        <p>1. <strong>有解判定</strong>：设 <code>g = gcd(a, b)</code>，若 <code>c % g != 0</code>，由裴蜀定理方程必定无整数解！</p>
        <p>2. <strong>特解放大</strong>：利用 exgcd 求出 <code>a * x0 + b * y0 = g</code> 的解后，乘以 <code>c / g</code> 得到原方程特解 <code>x_spec = x0 * (c / g)</code>。</p>
        <p>3. <strong>通解形式与周期模化</strong>：方程通解为 <code>x = x_spec + k * (b / g)</code>。令周期 <code>dx = b / g</code>，则最小正整数特解为 <code>(x_spec % dx + dx - 1) % dx + 1</code>。</p>
      </div>
    `,
  },
};
