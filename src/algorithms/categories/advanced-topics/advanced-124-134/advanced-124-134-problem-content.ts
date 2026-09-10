/**
 * 左神算法通关课 124 ~ 134 高阶遍历、动态规划优化与高斯消元专题题目与解析
 */

export const ADVANCED_124_134_PROBLEMS = {
  morris: {
    title: 'Morris 遍历 (Class 124)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (LeetCode 94 / 144 / 145 / 洛谷 B3642)</h2>
        <p>在二叉树遍历中，常规递归和栈需要 <code>O(H)</code> 栈空间。Morris 遍历利用叶子节点的空闲右指针临时建立线索（Thread），实现<strong>时间 O(N) 且额外空间严格 O(1)</strong> 的遍历奇迹。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">Morris 核心跳转规则</h3>
        <p>设当前节点为 <code>cur</code>：</p>
        <ol>
          <li>若 <code>cur.left == null</code>，访问 <code>cur</code>，<code>cur = cur.right</code>。</li>
          <li>若 <code>cur.left != null</code>，找到 <code>cur</code> 左子树的最右节点 <code>mostRight</code>：
            <ul>
              <li>若 <code>mostRight.right == null</code>：说明是第一次到达，令 <code>mostRight.right = cur</code>（搭线），<code>cur = cur.left</code>。</li>
              <li>若 <code>mostRight.right == cur</code>：说明是第二次到达（左子树已遍历完），令 <code>mostRight.right = null</code>（拆线恢复原树结构），访问 <code>cur</code>（中序），<code>cur = cur.right</code>。</li>
            </ul>
          </li>
        </ol>
      </div>
    `,
  },

  profileDp: {
    title: '轮廓线 DP (Class 125)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (POJ 2411 蒙德里安的梦想 / 骨牌铺满棋盘)</h2>
        <p>求在 <code>N x M</code> 的网格中，用 <code>1 x 2</code> 的多米诺骨牌无重叠完全铺满棋盘的方案数。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">轮廓线状态设计与逐格转移</h3>
        <p>不同于整行状压 <code>O(2^(2M))</code> 的高开销，轮廓线 DP 采用<strong>逐格 (Cell by Cell) 推进</strong>：</p>
        <ul>
          <li>轮廓线由 <code>M</code> 条线段构成，将未决策格子与已决策格子隔开。</li>
          <li>处理格子 <code>(i, j)</code> 时，状态仅需 <code>M</code> 位二进制掩码：第 <code>j</code> 位代表上方格是否有插头向下延伸，第 <code>j-1</code> 位代表左侧格是否有插头向右延伸。</li>
          <li>单格状态转移：不放骨牌、坚放向上合并插头、横放向左合并插头，转移复杂度仅为 <code>O(N x M x 2^M)</code>。</li>
        </ul>
      </div>
    `,
  },

  ternaryDp: {
    title: '三进制状压 DP (Class 126)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (POJ 2151 / 洛谷 P2704 炮兵阵地扩展)</h2>
        <p>当网格或图上节点的约束跨越 2 步（例如距离小于等于 2 的网格不能同时放装置），二进制状压无法表达“空置”、“受上一行影响”、“受上上行影响”三种语义，需要使用三进制状态压缩。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">三进制位权与跨行转移</h3>
        <p>1. 状态编码：<code>0</code> 代表空闲可放置，<code>1</code> 代表受到距离 1 的覆盖（不可放但下行自由），<code>2</code> 代表受到距离 2 的覆盖。</p>
        <p>2. 利用预处理三进制幂次数组 <code>pow3[k] = 3^k</code> 快速提取与修改三进制位：<code>(state / pow3[k]) % 3</code>。</p>
      </div>
    `,
  },

  binaryLiftingDp: {
    title: '倍增优化 DP (Class 129)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (洛谷 P1613 跑路 / 环形转移倍增)</h2>
        <p>当动态规划状态转移步数极大（例如跳转 <code>K = 10^18</code> 步）或存在环形图上步数跨越时，常规递推 <code>O(K)</code> 必定超时，倍增优化可将转移降至 <code>O(log K)</code>。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">二进制跨步状态设计</h3>
        <p>1. 定义 <code>dp[u][k]</code> 为从状态 <code>u</code> 出发，转移 <code>2^k</code> 步到达的目标状态或获得的最优累计贡献。</p>
        <p>2. 状态转移方程：<code>dp[u][k] = dp[ dp[u][k-1] ][k-1]</code>。前一半跳 <code>2^(k-1)</code> 步到达中转点，再从该中转点跳 <code>2^(k-1)</code> 步到达终点！</p>
      </div>
    `,
  },

  monotonicQueueDp: {
    title: '单调队列优化 DP (Class 130)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (洛谷 P1725 琪露诺 / P3957 跳房子)</h2>
        <p>求解形如 <code>dp[i] = max_{i-R <= j <= i-L} { dp[j] } + val[i]</code> 的滑动窗口极值转移方程。若朴素枚举前驱 <code>j</code> 耗时 <code>O(N x (R - L))</code>，单调队列可将复杂度压缩至严格 <code>O(N)</code>！</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">双端单调队列决策排除法</h3>
        <ol>
          <li><strong>新决策入队</strong>：当右侧合法窗口扩大时，待入队决策 <code>newJ</code> 与队尾比较，若 <code>dp[newJ] >= dp[tail]</code>，则 <code>tail</code> 在价值更低且生存周期更短的前提下被彻底淘汰，出队！</li>
          <li><strong>队头过期淘汰</strong>：检查队头 <code>head</code> 的下标是否小于 <code>i - R</code>，若过期则弹出。</li>
          <li><strong>O(1) 状态转移</strong>：队头元素必定是当前窗口内 <code>dp[j]</code> 的最大值，直接执行 <code>dp[i] = dp[head] + val[i]</code>！</li>
        </ol>
      </div>
    `,
  },

  gaussianElimination: {
    title: '高斯消元法 (Class 133)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (洛谷 P3389 【模板】高斯消元法 / P2455 线性方程组)</h2>
        <p>求解包含 <code>N</code> 个未知数的 <code>N</code> 元一次方程组，求出每个未知数的精确解，或判定无解、无穷多解。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">初等行变换与上三角矩阵</h3>
        <ol>
          <li><strong>选主元</strong>：在当前列中选出绝对值最大的行与当前行交换，保证数值稳定性避免除以接近 0 的小量。</li>
          <li><strong>主元归一</strong>：将当前行除以主元系数，使对角线系数变为 1。</li>
          <li><strong>消元下方</strong>：用当前行消除下方所有行在当前列的系数，最终将增广矩阵化为上三角矩阵。</li>
          <li><strong>回代求解 (Back Substitution)</strong>：自底向上将已知解逐个回代消去上方的未知数，在 <code>O(N^3)</code> 时间内求出所有解向量。</li>
        </ol>
      </div>
    `,
  },
};
