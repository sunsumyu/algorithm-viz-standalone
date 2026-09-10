/**
 * 左神算法通关课 第 098 课 - 快速幂与矩阵快速幂题目背景与理论
 */

export const MATH_098_PROBLEMS = {
  quickPower: {
    title: '二进制快速幂 (Quick Power / Exponentiation by Squaring)',
    source: 'LeetCode 50 / 经典数论快速幂',
    timeComplexity: 'O(log b)',
    spaceComplexity: 'O(1)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【算法原理】</h4>
        <p>计算 <code>a^b % mod</code>。将指数 <code>b</code> 按二进制拆分：<code>b = c_k * 2^k + ... + c_1 * 2^1 + c_0 * 2^0</code>。</p>
        <p>每一轮循环检查 <code>b</code> 的末位是否为 1（若为 1 则将当前底数累乘至答案 <code>ans</code>），随后底数自身平方 <code>a = (a * a) % mod</code>，指数右移一位 <code>b >>= 1</code>。时间复杂度仅需 <code>O(log b)</code>！</p>
      </div>
    `,
  },
  fibonacciMatrix: {
    title: '斐波那契数矩阵快速幂 (Fibonacci Matrix Power)',
    source: 'LeetCode 509 / 剑指 Offer 10',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【矩阵状态转移】</h4>
        <p>递推式 <code>F(n) = F(n-1) + F(n-2)</code>。构造状态向量 <code>[F(n), F(n-1)]</code> 与转移矩阵 <code>M</code>：</p>
        <pre style="background: #f1f5f9; padding: 8px; border-radius: 6px; font-family: monospace;">
[F(n), F(n-1)] = [F(n-1), F(n-2)] * [ 1, 1 ]
                                     [ 1, 0 ]</pre>
        <p>通过对 <code>M</code> 进行 <code>n - 2</code> 次矩阵快速幂，可在 <code>O(log n)</code> 时间内直接得出第 <code>n</code> 项斐波那契数！</p>
      </div>
    `,
  },
  climbingStairsMatrix: {
    title: '爬楼梯矩阵快速幂 (Climbing Stairs Matrix Power)',
    source: 'LeetCode 70 / 斐波那契同构',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【问题描述】</h4>
        <p>假设你正在爬楼梯，需要 <code>n</code> 阶才能到达楼顶。每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶？</p>
        <p>转移方程：<code>dp[n] = dp[n-1] + dp[n-2]</code>，边界 <code>dp[1]=1, dp[2]=2</code>。与斐波那契矩阵同构，采用矩阵快速幂加速求解。</p>
      </div>
    `,
  },
  tribonacciMatrix: {
    title: '泰波那契数矩阵快速幂 (Tribonacci Matrix Power)',
    source: 'LeetCode 1137 / 3阶线性齐次递推',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【3阶状态矩阵】</h4>
        <p>递推式：<code>T(n) = T(n-1) + T(n-2) + T(n-3)</code>，初始值 <code>T(0)=0, T(1)=1, T(2)=1</code>。</p>
        <p>构造状态转移矩阵 <code>M</code> (3x3)：</p>
        <pre style="background: #f1f5f9; padding: 8px; border-radius: 6px; font-family: monospace;">
[ 1, 1, 0 ]
[ 1, 0, 1 ]
[ 1, 0, 0 ]</pre>
        <p>通过 3x3 矩阵快速幂在 <code>O(log n)</code> 内计算 <code>T(n)</code>。</p>
      </div>
    `,
  },
  dominoTromino: {
    title: '多米诺和托米诺平铺矩阵快速幂 (Domino and Tromino Tiling)',
    source: 'LeetCode 790 / 矩阵状态机加速',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【状态递推】</h4>
        <p>两种骨牌：2x1 多米诺骨牌与 L 形托米诺骨牌。平铺 2xn 面板。</p>
        <p>线性递推关系式：<code>dp[n] = 2 * dp[n-1] + dp[n-3]</code>。构造 3x3 矩阵通过快速幂求解。</p>
      </div>
    `,
  },
  countVowels: {
    title: '元音排列矩阵快速幂 (Count Vowels Permutation)',
    source: 'LeetCode 1220 / 5元状态机矩阵',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【元音状态转移】</h4>
        <p>定义 5 种状态对应结尾字符为 'a', 'e', 'i', 'o', 'u'。规则对应的 5x5 邻接转移矩阵，矩阵 n-1 次幂乘以全 1 向量即为答案。</p>
      </div>
    `,
  },
  attendanceRecord: {
    title: '出勤记录 II 矩阵快速幂 (Student Attendance Record II)',
    source: 'LeetCode 552 / 6状态有限状态机',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【6状态转移图】</h4>
        <p>状态定义 <code>(countA, consecutiveL)</code>，共 6 种合法状态：<code>(0,0), (0,1), (0,2), (1,0), (1,1), (1,2)</code>。</p>
        <p>构造 6x6 状态转移矩阵，利用矩阵快速幂计算长度为 <code>n</code> 的所有合法出勤奖励序列数量！</p>
      </div>
    `,
  },
};
