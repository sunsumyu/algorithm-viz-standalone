/**
 * 算法讲解073【必备】背包dp-01背包、有依赖的背包 核心题解与多语言源码文档 (DDD)
 * 涵盖：
 * 1. Code01_01Knapsack (洛谷 P1048 采药 / 01背包模版)
 * 2. Code02_BuyGoodsHaveDiscount (LeetCode LCP 51 / tJau2o 夏季特惠)
 * 3. Code03_TargetSum (LeetCode 494 目标和)
 * 4. Code04_LastStoneWeightII (LeetCode 1049 最后一块石头的重量 II)
 * 5. Code05_DependentKnapsack (洛谷 P1064 金明的预算方案 / 有依赖的背包模版)
 * 6. Code06_TopKMinimumSubsequenceSum (非负数组前k个最小子序列累加和 / 堆优化)
 * 7. Code07_FindKthSum (LeetCode 2386 找出数组的第K大和)
 */

// ==========================================
// 1. Code01_01Knapsack 01背包模版
// ==========================================
export const KNAPSACK_01_PROBLEM_HTML = `
<div class="problem-description">
  <h3>01背包模版 (洛谷 P1048 采药)</h3>
  <p><strong>题目描述：</strong></p>
  <p>辰辰是个天资聪颖的孩子，他的梦想是成为世界上最伟大的医师。为此，他想拜附近最有威望的医师为师。医师为了考验他的资质，带他来到一个山洞里。洞里采草药需要消耗一定的时间，采到的每株草药也有自己的价值。</p>
  <p>在规定的总时间 <code>T</code> 内，洞里有 <code>M</code> 株草药，每株草药只能采摘一次。采摘第 <code>i</code> 株草药需要耗时 <code>costs[i]</code>，其药用价值为 <code>values[i]</code>。请帮辰辰求出在不超过总时间的情况下，能采摘草药的最大总价值。</p>
  <p><strong>输入格式：</strong>第一行两个整数 <code>T, M</code>；接下来 <code>M</code> 行，每行两个整数代表采摘耗时与价值。</p>
  <p><strong>数据约束：</strong><code>1 &le; T &le; 1000, 1 &le; M &le; 100</code>。</p>
  <p><strong>测试链接：</strong><a href="https://www.luogu.com.cn/problem/P1048" target="_blank" style="color:#60a5fa;">洛谷 P1048 [NOIP2005 普及组] 采药</a></p>
</div>
`;

export const KNAPSACK_01_ANALYSIS_HTML = `
<div class="problem-analysis">
  <h3>01背包算法剖析与空间压缩</h3>
  <ol>
    <li><strong>状态定义：</strong><code>dp[i][j]</code> 表示前 <code>i</code> 件物品，在容量限制不超过 <code>j</code> 的前提下，能够获得的最大价值。</li>
    <li><strong>状态转移方程：</strong>
      <ul>
        <li>不选第 <code>i</code> 件物品：<code>dp[i][j] = dp[i-1][j]</code></li>
        <li>选择第 <code>i</code> 件物品（需 <code>j &ge; cost[i]</code>）：<code>dp[i][j] = dp[i-1][j - cost[i]] + val[i]</code></li>
        <li>综合决策：<code>dp[i][j] = max(dp[i-1][j], dp[i-1][j - cost[i]] + val[i])</code></li>
      </ul>
    </li>
    <li><strong>滚动数组空间压缩：</strong>
      <p>每一行的 <code>dp[i][j]</code> 只依赖上一行 <code>dp[i-1][...]</code> 左侧或同列数据。因此可以使用一维数组 <code>dp[j]</code>，并且<strong>容量 <code>j</code> 必须从大到小倒序枚举</strong>（<code>for j = T downTo cost[i]</code>）。这样能确保在计算 <code>dp[j]</code> 时，所引用的 <code>dp[j - cost[i]]</code> 依然是“上一层（未包含当前物品）”的值，避免一件物品被重复使用（完全背包）。</p>
    </li>
    <li><strong>复杂度：</strong>时间复杂度 <code>O(M &middot; T)</code>，空间复杂度 <code>O(T)</code>。</li>
  </ol>
</div>
`;

export const KNAPSACK_01_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 01背包模版 (洛谷 P1048 采药)',
    'int compute01Knapsack(int t, int m, const vector<int>& cost, const vector<int>& val) {',
    '    vector<int> dp(t + 1, 0);',
    '    for (int i = 0; i < m; ++i) {',
    '        // 滚动数组倒序枚举，防止同个物品被重复选择',
    '        for (int j = t; j >= cost[i]; --j) {',
    '            dp[j] = max(dp[j], dp[j - cost[i]] + val[i]);',
    '        }',
    '    }',
    '    return dp[t];',
    '}',
  ],
  java: [
    'package class073;',
    '',
    'import java.util.Arrays;',
    '',
    '// 01背包模版 (洛谷 P1048 采药) - 左程云标准实现',
    'public class Code01_01Knapsack {',
    '    public static int compute(int t, int m, int[] cost, int[] val) {',
    '        int[] dp = new int[t + 1];',
    '        for (int i = 0; i < m; i++) {',
    '            for (int j = t; j >= cost[i]; j--) {',
    '                dp[j] = Math.max(dp[j], dp[j - cost[i]] + val[i]);',
    '            }',
    '        }',
    '        return dp[t];',
    '    }',
    '}',
  ],
  python: [
    'def compute_01_knapsack(t: int, m: int, cost: list[int], val: list[int]) -> int:',
    '    """01背包模版 - 一维滚动数组空间压缩"""',
    '    dp = [0] * (t + 1)',
    '    for c, v in zip(cost, val):',
    '        for j in range(t, c - 1, -1):',
    '            dp[j] = max(dp[j], dp[j - c] + v)',
    '    return dp[t]',
  ],
  javascript: [
    '// 01背包模版 - 滚动数组空间压缩',
    'export function compute01Knapsack(t, m, cost, val) {',
    '  const dp = new Array(t + 1).fill(0);',
    '  for (let i = 0; i < m; i++) {',
    '    const c = cost[i], v = val[i];',
    '    for (let j = t; j >= c; j--) {',
    '      dp[j] = Math.max(dp[j], dp[j - c] + v);',
    '    }',
    '  }',
    '  return dp[t];',
    '}',
  ],
};

// ==========================================
// 2. Code02_BuyGoodsHaveDiscount 夏季特惠
// ==========================================
export const BUY_GOODS_DISCOUNT_PROBLEM_HTML = `
<div class="problem-description">
  <h3>夏季特惠 (LeetCode LCP 51 / tJau2o)</h3>
  <p><strong>题目描述：</strong></p>
  <p>某公司游戏平台的夏季特惠开始了，你决定入手一些游戏。现在你一共有 <code>X</code> 元的预算，平台上所有的 <code>n</code> 个游戏均有折扣。标号为 <code>i</code> 的游戏原价 <code>a_i</code> 元，现价只要 <code>b_i</code> 元。也就是说该游戏可以优惠 <code>a_i - b_i</code> 元，购买该游戏能获得快乐值 <code>w_i</code>。</p>
  <p>由于优惠的存在，你可能做出冲动消费导致最终买游戏的总费用超过预算。<strong>只要满足：获得的总优惠金额不低于超过预算的总金额，那在心理上就不会觉得吃亏。</strong></p>
  <p>求在心理上不觉得吃亏的前提下，能获得的最多快乐值。</p>
  <p><strong>测试链接：</strong><a href="https://leetcode.cn/problems/tJau2o/" target="_blank" style="color:#60a5fa;">LeetCode LCP 51 / tJau2o 夏季特惠</a></p>
</div>
`;

export const BUY_GOODS_DISCOUNT_ANALYSIS_HTML = `
<div class="problem-analysis">
  <h3>夏季特惠的巧妙数学转化</h3>
  <ol>
    <li><strong>吃亏判别式：</strong>
      <p>设选购的游戏集合为 <code>S</code>，总花费为 <code>&sum; b_i</code>，总优惠为 <code>&sum; (a_i - b_i)</code>。不吃亏的条件是：</p>
      <p style="text-align:center;font-weight:700;color:#38bdf8;">总优惠 &ge; 超过预算的金额 &hArr; &sum; (a_i - b_i) &ge; max(0, &sum; b_i - X)</p>
      <p>如果花费没超过 <code>X</code>，天然满足。当超过 <code>X</code> 时：</p>
      <p style="text-align:center;font-weight:700;color:#38bdf8;">&sum; (a_i - b_i) &ge; &sum; b_i - X &hArr; X + &sum; (a_i - 2 &middot; b_i) &ge; 0</p>
    </li>
    <li><strong>贪心白嫖与预算增益：</strong>
      <p>定义单个游戏给整体带来的“好处值”：<code>well = (a_i - b_i) - b_i = a_i - 2 * b_i</code>。</p>
      <ul>
        <li><strong>情况 A (well &ge; 0)：</strong> 优惠比现价还多（现价 <code>b_i &le; a_i / 2</code> 折扣超过半价），买这个游戏不仅不消耗等效预算，反而让可支配额度净增加 <code>well</code>！<strong>因此所有 well &ge; 0 的游戏必须无条件直接全部买入！</strong>累加其快乐值，并将有效预算扩充 <code>X += well</code>。</li>
        <li><strong>情况 B (well &lt; 0)：</strong> 购买该游戏需要消耗等效预算 <code>-well = 2 * b_i - a_i</code>，带来快乐值 <code>w_i</code>。此时所有这部分游戏，就转化成了标准的 <strong>01 背包问题</strong>（容量为扩充后的 <code>X</code>，每件物品体积为 <code>-well</code>，价值为 <code>w_i</code>）！</li>
      </ul>
    </li>
    <li><strong>总收益：</strong>贪心必选快乐值 + 01背包最大快乐值。</li>
  </ol>
</div>
`;

export const BUY_GOODS_DISCOUNT_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 夏季特惠 (LCP 51 / tJau2o) - 转化01背包',
    'long long maxHappy(int n, long long x, const vector<long long>& a, const vector<long long>& b, const vector<long long>& w) {',
    '    long long ans = 0;',
    '    vector<long long> cost, val;',
    '    for (int i = 0; i < n; ++i) {',
    '        long long well = a[i] - 2 * b[i];',
    '        if (well >= 0) {',
    '            x += well; // 白赚游戏，有效预算扩充',
    '            ans += w[i];',
    '        } else {',
    '            cost.push_back(-well); // 真实等效花费',
    '            val.push_back(w[i]);',
    '        }',
    '    }',
    '    vector<long long> dp(x + 1, 0);',
    '    for (size_t i = 0; i < cost.size(); ++i) {',
    '        for (long long j = x; j >= cost[i]; --j) {',
    '            dp[j] = max(dp[j], dp[j - cost[i]] + val[i]);',
    '        }',
    '    }',
    '    return ans + dp[x];',
    '}',
  ],
  java: [
    'package class073;',
    '',
    'import java.util.Arrays;',
    '',
    '// 夏季特惠 - 左程云标准实现',
    'public class Code02_BuyGoodsHaveDiscount {',
    '    public static long maxHappy(int n, int x, int[] a, int[] b, int[] w) {',
    '        long ans = 0;',
    '        int m = 0;',
    '        int[] cost = new int[n];',
    '        int[] val = new int[n];',
    '        for (int i = 0; i < n; i++) {',
    '            int well = a[i] - 2 * b[i];',
    '            if (well >= 0) {',
    '                x += well; // 预算扩增',
    '                ans += w[i];',
    '            } else {',
    '                cost[m] = -well;',
    '                val[m++] = w[i];',
    '            }',
    '        }',
    '        long[] dp = new long[x + 1];',
    '        for (int i = 0; i < m; i++) {',
    '            for (int j = x; j >= cost[i]; j--) {',
    '                dp[j] = Math.max(dp[j], dp[j - cost[i]] + val[i]);',
    '            }',
    '        }',
    '        return ans + dp[x];',
    '    }',
    '}',
  ],
  python: [
    'def max_happy(n: int, x: int, a: list[int], b: list[int], w: list[int]) -> int:',
    '    """夏季特惠 - 贪心白嫖 + 01背包转化"""',
    '    ans = 0',
    '    cost, val = [], []',
    '    for ai, bi, wi in zip(a, b, w):',
    '        well = ai - 2 * bi',
    '        if well >= 0:',
    '            x += well',
    '            ans += wi',
    '        else:',
    '            cost.append(-well)',
    '            val.append(wi)',
    '    dp = [0] * (x + 1)',
    '    for c, v in zip(cost, val):',
    '        for j in range(x, c - 1, -1):',
    '            dp[j] = max(dp[j], dp[j - c] + v)',
    '    return ans + dp[x]',
  ],
  javascript: [
    '// 夏季特惠 - 贪心白嫖 + 01背包转化',
    'export function maxHappy(n, x, a, b, w) {',
    '  let ans = 0;',
    '  const cost = [], val = [];',
    '  for (let i = 0; i < n; i++) {',
    '    const well = a[i] - 2 * b[i];',
    '    if (well >= 0) {',
    '      x += well;',
    '      ans += w[i];',
    '    } else {',
    '      cost.push(-well);',
    '      val.push(w[i]);',
    '    }',
    '  }',
    '  const dp = new Array(x + 1).fill(0);',
    '  for (let i = 0; i < cost.length; i++) {',
    '    const c = cost[i], v = val[i];',
    '    for (let j = x; j >= c; j--) {',
    '      dp[j] = Math.max(dp[j], dp[j - c] + v);',
    '    }',
    '  }',
    '  return ans + dp[x];',
    '}',
  ],
};

// ==========================================
// 3. Code03_TargetSum 目标和
// ==========================================
export const TARGET_SUM_PROBLEM_HTML = `
<div class="problem-description">
  <h3>目标和 (LeetCode 494)</h3>
  <p><strong>题目描述：</strong></p>
  <p>给你一个非负整数数组 <code>nums</code> 和一个整数 <code>target</code>。向数组中的每个整数前添加 <code>'+'</code> 或 <code>'-'</code> ，然后串联起所有整数，可以构造一个表达式。</p>
  <p>返回可以通过上述方法构造的、运算结果等于 <code>target</code> 的不同表达式的数目。</p>
  <p><strong>示例：</strong><code>nums = [1, 1, 1, 1, 1], target = 3</code>，输出为 <code>5</code>。</p>
  <p><strong>测试链接：</strong><a href="https://leetcode.cn/problems/target-sum/" target="_blank" style="color:#60a5fa;">LeetCode 494 目标和</a></p>
</div>
`;

export const TARGET_SUM_ANALYSIS_HTML = `
<div class="problem-analysis">
  <h3>目标和向01背包子集和计数的严谨归约</h3>
  <ol>
    <li><strong>正负集合划分：</strong>
      <p>设添加 <code>+</code> 号的元素集合为 <code>P</code>，添加 <code>-</code> 号的元素集合为 <code>N</code>。根据题意：</p>
      <p style="text-align:center;font-weight:700;color:#38bdf8;">sum(P) - sum(N) = target</p>
      <p>又因为数组总和为 <code>sum = sum(P) + sum(N)</code>，两式相加：</p>
      <p style="text-align:center;font-weight:700;color:#38bdf8;">2 &middot; sum(P) = target + sum &rArr; sum(P) = (target + sum) / 2</p>
    </li>
    <li><strong>无解边界判断：</strong>
      <ul>
        <li>如果 <code>sum &lt; abs(target)</code>，即便全取正号也达不到 target，方案数为 0。</li>
        <li>如果 <code>(target + sum)</code> 为奇数，无法整除 2，方案数为 0（奇偶性守恒定律）。</li>
      </ul>
    </li>
    <li><strong>01背包计数问题：</strong>
      <p>问题完全等价于：在非负数组 <code>nums</code> 中挑选元素，使其累加和恰好等于容量 <code>t = (target + sum) / 2</code> 的子序列个数！</p>
      <p>状态转移：<code>dp[j] = dp[j] + dp[j - num]</code>，初始化 <code>dp[0] = 1</code>（空集累加和为 0 算 1 种方案）。</p>
    </li>
  </ol>
</div>
`;

export const TARGET_SUM_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <vector>',
    '#include <numeric>',
    '#include <cmath>',
    'using namespace std;',
    '',
    '// 目标和 (LeetCode 494) - 转化为01背包恰好装满的方案数',
    'int findTargetSumWays(vector<int>& nums, int target) {',
    '    int sum = 0;',
    '    for (int num : nums) sum += num;',
    '    if (sum < abs(target) || ((target + sum) & 1)) return 0;',
    '    int t = (target + sum) / 2;',
    '    vector<int> dp(t + 1, 0);',
    '    dp[0] = 1;',
    '    for (int num : nums) {',
    '        for (int j = t; j >= num; --j) {',
    '            dp[j] += dp[j - num];',
    '        }',
    '    }',
    '    return dp[t];',
    '}',
  ],
  java: [
    'package class073;',
    '',
    '// 目标和 - 01背包空间压缩版本 (左程云标准实现)',
    'public class Code03_TargetSum {',
    '    public static int findTargetSumWays(int[] nums, int target) {',
    '        int sum = 0;',
    '        for (int n : nums) sum += n;',
    '        if (sum < target || ((target & 1) ^ (sum & 1)) == 1) return 0;',
    '        int t = (target + sum) >> 1;',
    '        if (t < 0) return 0;',
    '        int[] dp = new int[t + 1];',
    '        dp[0] = 1;',
    '        for (int num : nums) {',
    '            for (int j = t; j >= num; j--) {',
    '                dp[j] += dp[j - num];',
    '            }',
    '        }',
    '        return dp[t];',
    '    }',
    '}',
  ],
  python: [
    'def find_target_sum_ways(nums: list[int], target: int) -> int:',
    '    """目标和 - 集合划分转01背包求方案数"""',
    '    s = sum(nums)',
    '    if s < abs(target) or (s + target) % 2 != 0:',
    '        return 0',
    '    t = (s + target) // 2',
    '    dp = [0] * (t + 1)',
    '    dp[0] = 1',
    '    for num in nums:',
    '        for j in range(t, num - 1, -1):',
    '            dp[j] += dp[j - num]',
    '    return dp[t]',
  ],
  javascript: [
    '// 目标和 - 转化为01背包方案数',
    'export function findTargetSumWays(nums, target) {',
    '  const sum = nums.reduce((a, b) => a + b, 0);',
    '  if (sum < Math.abs(target) || (sum + target) % 2 !== 0) return 0;',
    '  const t = Math.floor((sum + target) / 2);',
    '  const dp = new Array(t + 1).fill(0);',
    '  dp[0] = 1;',
    '  for (const num of nums) {',
    '    for (let j = t; j >= num; j--) {',
    '      dp[j] += dp[j - num];',
    '    }',
    '  }',
    '  return dp[t];',
    '}',
  ],
};

// ==========================================
// 4. Code04_LastStoneWeightII 最后一块石头的重量 II
// ==========================================
export const LAST_STONE_WEIGHT_II_PROBLEM_HTML = `
<div class="problem-description">
  <h3>最后一块石头的重量 II (LeetCode 1049)</h3>
  <p><strong>题目描述：</strong></p>
  <p>有一堆石头，用整数数组 <code>stones</code> 表示，其中 <code>stones[i]</code> 表示第 <code>i</code> 块石头的重量。</p>
  <p>每一回合，从中选出任意两块石头进行碰撞粉碎。假设重量分别为 <code>x</code> 和 <code>y</code> (<code>x &le; y</code>)：</p>
  <ul>
    <li>若 <code>x == y</code>，两块石头完全粉碎；</li>
    <li>若 <code>x != y</code>，重量为 <code>x</code> 的石头粉碎，重量为 <code>y</code> 的石头新重量变为 <code>y - x</code>。</li>
  </ul>
  <p>最后最多只会剩下一块石头。求最后剩下的石头<strong>最小的可能重量</strong>。如果没有石头剩下，就返回 <code>0</code>。</p>
  <p><strong>测试链接：</strong><a href="https://leetcode.cn/problems/last-stone-weight-ii/" target="_blank" style="color:#60a5fa;">LeetCode 1049 最后一块石头的重量 II</a></p>
</div>
`;

export const LAST_STONE_WEIGHT_II_ANALYSIS_HTML = `
<div class="problem-analysis">
  <h3>碰撞粉碎对消转化为最接近 sum / 2 的 01 背包</h3>
  <ol>
    <li><strong>本质透视：</strong>
      <p>每一回合 <code>y - x</code> 实际上就是为石头附上正负号，多次碰撞最终留下的石头重量，可以表达为原石头集合加上正负符号后的总和：<code>&sum; (&plusmn; stones[i])</code>。</p>
      <p>为了让剩余重量最小，实际上就是要把石头分成总重量尽量相近的两堆 <code>A</code> 和 <code>B</code>，剩余最小重量即为 <code>|sum(A) - sum(B)|</code>。</p>
    </li>
    <li><strong>转化为容量为 sum / 2 的 01背包：</strong>
      <p>令背包容量为 <code>t = sum / 2</code>。从石头中挑选若干块，使其累加和不超过 <code>t</code> 但尽量接近 <code>t</code>（设求得的最大子序列和为 <code>near</code>）。</p>
      <p>那么另一堆的重量就是 <code>sum - near</code>。两堆碰撞后的最小差值必然是：</p>
      <p style="text-align:center;font-weight:700;color:#38bdf8;">(sum - near) - near = sum - 2 &middot; near</p>
    </li>
    <li><strong>状态转移：</strong><code>dp[j] = max(dp[j], dp[j - num] + num)</code>，空间压缩后倒序遍历。</li>
  </ol>
</div>
`;

export const LAST_STONE_WEIGHT_II_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <vector>',
    '#include <numeric>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 最后一块石头的重量 II (LeetCode 1049)',
    'int lastStoneWeightII(vector<int>& stones) {',
    '    int sum = accumulate(stones.begin(), stones.end(), 0);',
    '    int t = sum / 2;',
    '    vector<int> dp(t + 1, 0);',
    '    for (int num : stones) {',
    '        for (int j = t; j >= num; --j) {',
    '            dp[j] = max(dp[j], dp[j - num] + num);',
    '        }',
    '    }',
    '    int near = dp[t];',
    '    return sum - 2 * near;',
    '}',
  ],
  java: [
    'package class073;',
    '',
    '// 最后一块石头的重量 II - 左程云标准实现',
    'public class Code04_LastStoneWeightII {',
    '    public static int lastStoneWeightII(int[] nums) {',
    '        int sum = 0;',
    '        for (int num : nums) sum += num;',
    '        int near = near(nums, sum / 2);',
    '        return sum - 2 * near;',
    '    }',
    '    public static int near(int[] nums, int t) {',
    '        int[] dp = new int[t + 1];',
    '        for (int num : nums) {',
    '            for (int j = t; j >= num; j--) {',
    '                dp[j] = Math.max(dp[j], dp[j - num] + num);',
    '            }',
    '        }',
    '        return dp[t];',
    '    }',
    '}',
  ],
  python: [
    'def last_stone_weight_ii(stones: list[int]) -> int:',
    '    """最后一块石头的重量 II - 寻找 <= sum/2 的最接近值"""',
    '    total = sum(stones)',
    '    t = total // 2',
    '    dp = [0] * (t + 1)',
    '    for num in stones:',
    '        for j in range(t, num - 1, -1):',
    '            dp[j] = max(dp[j], dp[j - num] + num)',
    '    near = dp[t]',
    '    return total - 2 * near',
  ],
  javascript: [
    '// 最后一块石头的重量 II',
    'export function lastStoneWeightII(stones) {',
    '  const sum = stones.reduce((a, b) => a + b, 0);',
    '  const t = Math.floor(sum / 2);',
    '  const dp = new Array(t + 1).fill(0);',
    '  for (const num of stones) {',
    '    for (let j = t; j >= num; j--) {',
    '      dp[j] = Math.max(dp[j], dp[j - num] + num);',
    '    }',
    '  }',
    '  const near = dp[t];',
    '  return sum - 2 * near;',
    '}',
  ],
};

// ==========================================
// 5. Code05_DependentKnapsack 有依赖的背包模版
// ==========================================
export const DEPENDENT_KNAPSACK_PROBLEM_HTML = `
<div class="problem-description">
  <h3>有依赖的背包模版 (洛谷 P1064 金明的预算方案)</h3>
  <p><strong>题目描述：</strong></p>
  <p>金明有 <code>N</code> 元钱的预算，想买 <code>m</code> 件商品。商品分为两大类：<strong>主件</strong> 与 <strong>附件</strong>。</p>
  <ul>
    <li>主件的购买没有限制；</li>
    <li>附件有限制：<strong>必须先购买该附件归属的主件，才能购买这个附件</strong>；</li>
    <li>每个主件最多有 <code>2</code> 个附件，且附件不会再有自己的附件。</li>
  </ul>
  <p>每件商品有价格 <code>v</code>（花费）、重要度 <code>p</code>（收益系数），其收益为 <code>v &times; p</code>，以及所属主件编号 <code>q</code>（<code>q=0</code> 表示为主件）。求在不超过预算 <code>N</code> 的前提下能获得的最大总收益。</p>
  <p><strong>测试链接：</strong><a href="https://www.luogu.com.cn/problem/P1064" target="_blank" style="color:#60a5fa;">洛谷 P1064 [NOIP2006 提高组] 金明的预算方案</a></p>
</div>
`;

export const DEPENDENT_KNAPSACK_ANALYSIS_HTML = `
<div class="problem-analysis">
  <h3>主附件依赖展开为分组背包的优雅解法</h3>
  <ol>
    <li><strong>问题本质转化：</strong>
      <p>因为每个主件最多只有 2 个附件，所以对于每一个主件及其归属的所有附件，我们在购买决策上只有<strong>至多 4 种互斥的选择策略</strong>：</p>
      <ol>
        <li>方案 1：只买主件自身（花费 <code>v0</code>，收益 <code>p0</code>）</li>
        <li>方案 2：买主件 + 附件 1（花费 <code>v0 + v1</code>，收益 <code>p0 + p1</code>）</li>
        <li>方案 3：买主件 + 附件 2（花费 <code>v0 + v2</code>，收益 <code>p0 + p2</code>）</li>
        <li>方案 4：买主件 + 附件 1 + 附件 2（花费 <code>v0 + v1 + v2</code>，收益 <code>p0 + p1 + p2</code>）</li>
      </ol>
      <p>这 4 种方案在一个主件组内是<strong>互斥的</strong>（即每组至多只能挑选其中一种方案生效），这就是标准的<strong>分组背包（Grouped Knapsack）</strong>！</p>
    </li>
    <li><strong>状态转移（空间压缩）：</strong>
      <p>外层遍历每一个主件，中间层倒序枚举容量 <code>j = N downTo cost[main]</code>，内层比较该组允许的 4 种方案并取最大值：</p>
      <code>dp[j] = max(dp[j], dp[j - combo.cost] + combo.val)</code>
    </li>
  </ol>
</div>
`;

export const DEPENDENT_KNAPSACK_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    'struct Item { int cost, val, q; };',
    '// 金明的预算方案 (洛谷 P1064) - 主附件组合转分组背包',
    'int dependentKnapsack(int n, int m, const vector<Item>& items) {',
    '    vector<bool> isKing(m + 1, false);',
    '    vector<vector<int>> fans(m + 1);',
    '    for (int i = 1; i <= m; ++i) {',
    '        if (items[i].q == 0) isKing[i] = true;',
    '        else fans[items[i].q].push_back(i);',
    '    }',
    '    vector<int> dp(n + 1, 0);',
    '    for (int i = 1; i <= m; ++i) {',
    '        if (!isKing[i]) continue;',
    '        int c0 = items[i].cost, v0 = items[i].val;',
    '        int f1 = fans[i].size() >= 1 ? fans[i][0] : -1;',
    '        int f2 = fans[i].size() >= 2 ? fans[i][1] : -1;',
    '        for (int j = n; j >= c0; --j) {',
    '            // 方案1: 仅主件',
    '            dp[j] = max(dp[j], dp[j - c0] + v0);',
    '            // 方案2: 主 + 附1',
    '            if (f1 != -1 && j >= c0 + items[f1].cost)',
    '                dp[j] = max(dp[j], dp[j - c0 - items[f1].cost] + v0 + items[f1].val);',
    '            // 方案3: 主 + 附2',
    '            if (f2 != -1 && j >= c0 + items[f2].cost)',
    '                dp[j] = max(dp[j], dp[j - c0 - items[f2].cost] + v0 + items[f2].val);',
    '            // 方案4: 主 + 附1 + 附2',
    '            if (f1 != -1 && f2 != -1 && j >= c0 + items[f1].cost + items[f2].cost)',
    '                dp[j] = max(dp[j], dp[j - c0 - items[f1].cost - items[f2].cost] + v0 + items[f1].val + items[f2].val);',
    '        }',
    '    }',
    '    return dp[n];',
    '}',
  ],
  java: [
    'package class073;',
    '',
    'import java.util.Arrays;',
    '',
    '// 有依赖的背包(模版) - 洛谷 P1064 金明的预算方案 (左程云标准实现)',
    'public class Code05_DependentKnapsack {',
    '    public static int compute(int n, int m, int[] cost, int[] val, boolean[] king, int[] fans, int[][] follows) {',
    '        int[] dp = new int[n + 1];',
    '        for (int i = 1, fan1, fan2; i <= m; i++) {',
    '            if (king[i]) {',
    '                fan1 = fans[i] >= 1 ? follows[i][0] : -1;',
    '                fan2 = fans[i] >= 2 ? follows[i][1] : -1;',
    '                for (int j = n; j >= cost[i]; j--) {',
    '                    dp[j] = Math.max(dp[j], dp[j - cost[i]] + val[i]);',
    '                    if (fan1 != -1 && j - cost[i] - cost[fan1] >= 0) {',
    '                        dp[j] = Math.max(dp[j], dp[j - cost[i] - cost[fan1]] + val[i] + val[fan1]);',
    '                    }',
    '                    if (fan2 != -1 && j - cost[i] - cost[fan2] >= 0) {',
    '                        dp[j] = Math.max(dp[j], dp[j - cost[i] - cost[fan2]] + val[i] + val[fan2]);',
    '                    }',
    '                    if (fan1 != -1 && fan2 != -1 && j - cost[i] - cost[fan1] - cost[fan2] >= 0) {',
    '                        dp[j] = Math.max(dp[j], dp[j - cost[i] - cost[fan1] - cost[fan2]] + val[i] + val[fan1] + val[fan2]);',
    '                    }',
    '                }',
    '            }',
    '        }',
    '        return dp[n];',
    '    }',
    '}',
  ],
  python: [
    'def dependent_knapsack(n: int, m: int, items: list[dict]) -> int:',
    '    """金明的预算方案 - 主附件展开为分组背包"""',
    '    dp = [0] * (n + 1)',
    '    for item in items:',
    '        if item.get("q", 0) != 0: continue',
    '        c0, v0 = item["cost"], item["val"]',
    '        f = item.get("fans", [])',
    '        f1 = f[0] if len(f) >= 1 else None',
    '        f2 = f[1] if len(f) >= 2 else None',
    '        for j in range(n, c0 - 1, -1):',
    '            dp[j] = max(dp[j], dp[j - c0] + v0)',
    '            if f1 and j >= c0 + f1["cost"]:',
    '                dp[j] = max(dp[j], dp[j - c0 - f1["cost"]] + v0 + f1["val"])',
    '            if f2 and j >= c0 + f2["cost"]:',
    '                dp[j] = max(dp[j], dp[j - c0 - f2["cost"]] + v0 + f2["val"])',
    '            if f1 and f2 and j >= c0 + f1["cost"] + f2["cost"]:',
    '                dp[j] = max(dp[j], dp[j - c0 - f1["cost"] - f2["cost"]] + v0 + f1["val"] + f2["val"])',
    '    return dp[n]',
  ],
  javascript: [
    '// 有依赖的背包(模版) - 分组背包转化',
    'export function dependentKnapsack(n, m, items) {',
    '  const dp = new Array(n + 1).fill(0);',
    '  for (let i = 1; i <= m; i++) {',
    '    const it = items[i];',
    '    if (!it || it.q !== 0) continue;',
    '    const c0 = it.cost, v0 = it.val;',
    '    const f1 = it.fans?.[0] || null;',
    '    const f2 = it.fans?.[1] || null;',
    '    for (let j = n; j >= c0; j--) {',
    '      dp[j] = Math.max(dp[j], dp[j - c0] + v0);',
    '      if (f1 && j >= c0 + f1.cost) {',
    '        dp[j] = Math.max(dp[j], dp[j - c0 - f1.cost] + v0 + f1.val);',
    '      }',
    '      if (f2 && j >= c0 + f2.cost) {',
    '        dp[j] = Math.max(dp[j], dp[j - c0 - f2.cost] + v0 + f2.val);',
    '      }',
    '      if (f1 && f2 && j >= c0 + f1.cost + f2.cost) {',
    '        dp[j] = Math.max(dp[j], dp[j - c0 - f1.cost - f2.cost] + v0 + f1.val + f2.val);',
    '      }',
    '    }',
    '  }',
    '  return dp[n];',
    '}',
  ],
};

// ==========================================
// 6. Code06_TopKMinimumSubsequenceSum 非负数组前k个最小的子序列累加和
// ==========================================
export const TOP_K_SUBSEQUENCE_SUM_PROBLEM_HTML = `
<div class="problem-description">
  <h3>非负数组前k个最小子序列累加和 (堆优化扩展)</h3>
  <p><strong>题目描述：</strong></p>
  <p>给定一个数组 <code>nums</code>，含有 <code>n</code> 个数字，全部为非负数。给定一个正整数 <code>k</code>，返回所有可能子序列中<strong>累加和最小的前 k 个累加和</strong>。</p>
  <p>注意：空子序列的和视作 <code>0</code>。子序列允许出现相同的累加和。</p>
  <p><strong>数据范围：</strong><code>1 &le; n &le; 10^5, 1 &le; nums[i] &le; 10^6, 1 &le; k &le; 10^5</code>。</p>
  <p><strong>难点提示：</strong>因为 <code>n</code> 与 <code>nums[i]</code> 很大，可能的子序列累加和规模极大，常规 01 背包计数 DP 复杂度 <code>O(n &middot; sum)</code> 必然严重超时（TLE）甚至超内存（MLE）！必须使用优先队列（小根堆）进行状态转移。</p>
</div>
`;

export const TOP_K_SUBSEQUENCE_SUM_ANALYSIS_HTML = `
<div class="problem-analysis">
  <h3>小根堆高效生成前 K 个最小子序列和</h3>
  <ol>
    <li><strong>升序预排序：</strong>首先将 <code>nums</code> 升序排序。第 1 小的子序列和永远是空集，和为 <code>0</code>。</li>
    <li><strong>堆节点状态三元组设计：</strong>
      <p>小根堆中维护二元组 <code>(right, sum)</code>，其中 <code>sum</code> 为当前子序列和，<code>right</code> 为该子序列包含的最大元素下标。</p>
    </li>
    <li><strong>分支扩展与状态分裂（零冗余产生）：</strong>
      <p>从堆中弹出当前最小和 <code>(right, sum)</code>，并记录到结果列表中。若 <code>right + 1 &lt; n</code>，它能够且仅能分裂出两个后续候选状态入堆：</p>
      <ul>
        <li><strong>分支 1（替换末尾）：</strong><code>(right + 1, sum - nums[right] + nums[right + 1])</code>，即把最右侧的数替换为稍大一点的下一个数。</li>
        <li><strong>分支 2（追加新数）：</strong><code>(right + 1, sum + nums[right + 1])</code>，即在保留当前所有数的基础上，追加下一个数。</li>
      </ul>
      <p>通过这两种分裂规则，保证了所有子序列互不重复且单调递增地被有序发现！</p>
    </li>
    <li><strong>复杂度：</strong>时间复杂度 <code>O(n &middot; log n + k &middot; log k)</code>，空间复杂度 <code>O(k)</code>，即使 <code>k = 10^5</code> 也能在毫秒内完成！</li>
  </ol>
</div>
`;

export const TOP_K_SUBSEQUENCE_SUM_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <vector>',
    '#include <queue>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 非负数组前k个最小的子序列累加和 - 小根堆高效算法',
    'vector<long long> topKSum(vector<int>& nums, int k) {',
    '    sort(nums.begin(), nums.end());',
    '    // (累加和, 最右下标)',
    '    using Element = pair<long long, int>;',
    '    priority_queue<Element, vector<Element>, greater<Element>> heap;',
    '    heap.push({nums[0], 0});',
    '    vector<long long> ans(k, 0); // ans[0] 为空集和 0',
    '    for (int i = 1; i < k; ++i) {',
    '        auto [sum, right] = heap.top();',
    '        heap.pop();',
    '        ans[i] = sum;',
    '        if (right + 1 < (int)nums.size()) {',
    '            // 分支1: 替换',
    '            heap.push({sum - nums[right] + nums[right + 1], right + 1});',
    '            // 分支2: 追加',
    '            heap.push({sum + nums[right + 1], right + 1});',
    '        }',
    '    }',
    '    return ans;',
    '}',
  ],
  java: [
    'package class073;',
    '',
    'import java.util.Arrays;',
    'import java.util.PriorityQueue;',
    '',
    '// 非负数组前k个最小子序列和 - 左程云标准实现',
    'public class Code06_TopKMinimumSubsequenceSum {',
    '    public static int[] topKSum(int[] nums, int k) {',
    '        Arrays.sort(nums);',
    '        // (最右下标, 累加和)',
    '        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> a[1] - b[1]);',
    '        heap.add(new int[] { 0, nums[0] });',
    '        int[] ans = new int[k]; // ans[0] = 0 (空集)',
    '        for (int i = 1; i < k; i++) {',
    '            int[] cur = heap.poll();',
    '            int right = cur[0];',
    '            int sum = cur[1];',
    '            ans[i] = sum;',
    '            if (right + 1 < nums.length) {',
    '                heap.add(new int[] { right + 1, sum - nums[right] + nums[right + 1] });',
    '                heap.add(new int[] { right + 1, sum + nums[right + 1] });',
    '            }',
    '        }',
    '        return ans;',
    '    }',
    '}',
  ],
  python: [
    'import heapq',
    '',
    'def top_k_sum(nums: list[int], k: int) -> list[int]:',
    '    """非负数组前k个最小子序列和 - 小根堆状态机"""',
    '    nums.sort()',
    '    # (sum, right_idx)',
    '    heap = [(nums[0], 0)]',
    '    ans = [0] * k',
    '    for i in range(1, k):',
    '        s, r = heapq.heappop(heap)',
    '        ans[i] = s',
    '        if r + 1 < len(nums):',
    '            heapq.heappush(heap, (s - nums[r] + nums[r + 1], r + 1))',
    '            heapq.heappush(heap, (s + nums[r + 1], r + 1))',
    '    return ans',
  ],
  javascript: [
    '// 非负数组前k个最小子序列和 - 堆状态机',
    'export function topKSum(nums, k) {',
    '  nums.sort((a, b) => a - b);',
    '  const ans = new Array(k).fill(0);',
    '  // 简易优先队列/排序数组模拟（小根堆机制）',
    '  const heap = [{ right: 0, sum: nums[0] }];',
    '  for (let i = 1; i < k; i++) {',
    '    heap.sort((a, b) => a.sum - b.sum);',
    '    const cur = heap.shift();',
    '    ans[i] = cur.sum;',
    '    if (cur.right + 1 < nums.length) {',
    '      const nextVal = nums[cur.right + 1];',
    '      heap.push({ right: cur.right + 1, sum: cur.sum - nums[cur.right] + nextVal });',
    '      heap.push({ right: cur.right + 1, sum: cur.sum + nextVal });',
    '    }',
    '  }',
    '  return ans;',
    '}',
  ],
};

// ==========================================
// 7. Code07_FindKthSum 找出数组的第K大和
// ==========================================
export const FIND_KTH_SUM_PROBLEM_HTML = `
<div class="problem-description">
  <h3>找出数组的第K大和 (LeetCode 2386)</h3>
  <p><strong>题目描述：</strong></p>
  <p>给你一个整数数组 <code>nums</code> 和一个正整数 <code>k</code>。你可以选择数组的任何子序列并对其元素求和。</p>
  <p>请返回可以求得的<strong>第 k 大的子序列和</strong>。子序列和允许重复，空子序列的和视作 <code>0</code>。注意数组中的元素可正、可负、可为 <code>0</code>。</p>
  <p><strong>测试链接：</strong><a href="https://leetcode.cn/problems/find-the-k-sum-of-an-array/description/" target="_blank" style="color:#60a5fa;">LeetCode 2386 找出数组的第 K 大和</a></p>
</div>
`;

export const FIND_KTH_SUM_ANALYSIS_HTML = `
<div class="problem-analysis">
  <h3>正负绝对值映射与求第 K 小和的双射归约</h3>
  <ol>
    <li><strong>最大子序列和基准：</strong>
      <p>首先将数组中所有的正数全部相加，得到 <code>maxSum</code>。显然，<code>maxSum</code> 是全局第 1 大的子序列和。</p>
    </li>
    <li><strong>第 2 大、第 3 大 ... 的产生方式：</strong>
      <p>要想让和变小一点，我们有两种手段：</p>
      <ul>
        <li>手段 1：从 <code>maxSum</code> 中去掉一个正数 <code>x</code>，和减少 <code>x</code>；</li>
        <li>手段 2：在 <code>maxSum</code> 的基础上选入一个负数 <code>y</code>，和减少 <code>|y|</code>。</li>
      </ul>
      <p>这惊人地说明：<strong>无论去掉正数还是选入负数，本质上都是从 <code>maxSum</code> 中减去一个非负数值 <code>|nums[i]|</code>！</strong></p>
    </li>
    <li><strong>绝对值数组归约定理：</strong>
      <p>我们将原数组每一个元素全部取绝对值，得到非负数组 <code>absNums</code>。那么：</p>
      <p style="text-align:center;font-weight:700;color:#38bdf8;">原数组的第 k 大子序列和 = maxSum - absNums 的第 k 小子序列和</p>
      <p>求 <code>absNums</code> 的第 <code>k</code> 小子序列和，正好对应 <strong>Code06</strong> 的经典小根堆解法！</p>
    </li>
  </ol>
</div>
`;

export const FIND_KTH_SUM_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <vector>',
    '#include <queue>',
    '#include <cmath>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 找出数组的第K大和 (LeetCode 2386)',
    'long long kSum(vector<int>& nums, int k) {',
    '    int n = nums.size();',
    '    long long sum = 0;',
    '    for (int i = 0; i < n; ++i) {',
    '        if (nums[i] > 0) sum += nums[i];',
    '        else nums[i] = -nums[i]; // 取绝对值',
    '    }',
    '    sort(nums.begin(), nums.end());',
    '    using Node = pair<long long, int>;',
    '    priority_queue<Node, vector<Node>, greater<Node>> heap;',
    '    // 空集，下标 -1，和 0',
    '    heap.push({0, -1});',
    '    for (int i = 1; i < k; ++i) {',
    '        auto [val, idx] = heap.top();',
    '        heap.pop();',
    '        if (idx + 1 < n) {',
    '            heap.push({val + nums[idx + 1], idx + 1});',
    '            if (idx >= 0) {',
    '                heap.push({val - nums[idx] + nums[idx + 1], idx + 1});',
    '            }',
    '        }',
    '    }',
    '    return sum - heap.top().first;',
    '}',
  ],
  java: [
    'package class073;',
    '',
    'import java.util.Arrays;',
    'import java.util.PriorityQueue;',
    '',
    '// 找出数组的第K大和 - 左程云标准实现',
    'public class Code07_FindKthSum {',
    '    public static long kSum(int[] nums, int k) {',
    '        int n = nums.length;',
    '        long sum = 0;',
    '        for (int i = 0; i < n; i++) {',
    '            if (nums[i] > 0) {',
    '                sum += nums[i];',
    '            } else {',
    '                nums[i] = -nums[i];',
    '            }',
    '        }',
    '        Arrays.sort(nums);',
    '        PriorityQueue<long[]> heap = new PriorityQueue<>((a, b) -> Long.compare(a[1], b[1]));',
    '        heap.add(new long[] { -1, 0L });',
    '        for (int i = 1; i < k; i++) {',
    '            long[] cur = heap.poll();',
    '            int idx = (int) cur[0];',
    '            long val = cur[1];',
    '            if (idx + 1 < n) {',
    '                heap.add(new long[] { idx + 1, val + nums[idx + 1] });',
    '                if (idx >= 0) {',
    '                    heap.add(new long[] { idx + 1, val - nums[idx] + nums[idx + 1] });',
    '                }',
    '            }',
    '        }',
    '        return sum - heap.peek()[1];',
    '    }',
    '}',
  ],
  python: [
    'import heapq',
    '',
    'def k_sum(nums: list[int], k: int) -> int:',
    '    """第K大子序列和 - 绝对值转化与小根堆求第k小"""',
    '    total = sum(x for x in nums if x > 0)',
    '    abs_nums = sorted(abs(x) for x in nums)',
    '    # (sum, idx)',
    '    heap = [(0, -1)]',
    '    for _ in range(k - 1):',
    '        val, idx = heapq.heappop(heap)',
    '        if idx + 1 < len(abs_nums):',
    '            heapq.heappush(heap, (val + abs_nums[idx + 1], idx + 1))',
    '            if idx >= 0:',
    '                heapq.heappush(heap, (val - abs_nums[idx] + abs_nums[idx + 1], idx + 1))',
    '    return total - heap[0][0]',
  ],
  javascript: [
    '// 找出数组的第K大和',
    'export function kSum(nums, k) {',
    '  let sum = 0;',
    '  const absNums = [];',
    '  for (const x of nums) {',
    '    if (x > 0) sum += x;',
    '    absNums.push(Math.abs(x));',
    '  }',
    '  absNums.sort((a, b) => a - b);',
    '  const heap = [{ idx: -1, val: 0 }];',
    '  for (let i = 1; i < k; i++) {',
    '    heap.sort((a, b) => a.val - b.val);',
    '    const cur = heap.shift();',
    '    if (cur.idx + 1 < absNums.length) {',
    '      heap.push({ idx: cur.idx + 1, val: cur.val + absNums[cur.idx + 1] });',
    '      if (cur.idx >= 0) {',
    '        heap.push({ idx: cur.idx + 1, val: cur.val - absNums[cur.idx] + absNums[cur.idx + 1] });',
    '      }',
    '    }',
    '  }',
    '  heap.sort((a, b) => a.val - b.val);',
    '  return sum - heap[0].val;',
    '}',
  ],
};
