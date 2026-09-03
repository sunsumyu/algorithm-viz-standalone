/**
 * 算法讲解074【必备】背包dp-分组背包、完全背包 核心题解与多语言源码文档 (DDD)
 * 涵盖：
 * 1. Code01_PartitionedKnapsack (洛谷 P1757 通天之分组背包 / 分组背包模版)
 * 2. Code02_MaximumValueOfKcoinsFromPiles (LeetCode 2218 从栈中取出K个硬币的最大面值和)
 * 3. Code03_UnboundedKnapsack (洛谷 P1616 疯狂的采药 / 完全背包模版)
 * 4. Code04_RegularExpressionMatching (LeetCode 10 正则表达式匹配)
 * 5. Code05_WildcardMatching (LeetCode 44 通配符匹配)
 * 6. Code06_BuyingHayMinimumCost (洛谷 P2918 购买足量干草的最小花费)
 */

// ==========================================
// 1. Code01_PartitionedKnapsack 分组背包模版
// ==========================================
export const PARTITIONED_KNAPSACK_PROBLEM_HTML = `
<div class="problem-description">
  <h3>分组背包模版 (洛谷 P1757 通天之分组背包)</h3>
  <p><strong>题目描述：</strong></p>
  <p>自 01 背包问世之后，小 A 对此深感兴趣。他发现有 <code>n</code> 个物品和一个容量为 <code>m</code> 的背包。每个物品有自己的体积 <code>c_i</code>、价值 <code>v_i</code>，并且属于某一个组 <code>g_i</code>。</p>
  <p><strong>限制规则：同一个组内的物品最多只能选择一件！</strong>所有选择的物品体积之和不得超过背包总容量 <code>m</code>。求怎么挑选物品才能使得总价值最大。</p>
  <p><strong>输入格式：</strong>第一行两个整数 <code>m, n</code>；接下来 <code>n</code> 行每行 3 个整数 <code>c_i, v_i, g_i</code>。</p>
  <p><strong>测试链接：</strong><a href="https://www.luogu.com.cn/problem/P1757" target="_blank" style="color:#60a5fa;">洛谷 P1757 通天之分组背包</a></p>
</div>
`;

export const PARTITIONED_KNAPSACK_ANALYSIS_HTML = `
<div class="problem-analysis">
  <h3>分组背包算法逻辑与组内互斥状态转移</h3>
  <ol>
    <li><strong>问题特征与排序分块：</strong>
      <p>物品被明确划分为若干个互斥组。先按组号 <code>g_i</code> 排序，以便把属于同一组的物品聚合在一起处理。</p>
    </li>
    <li><strong>状态定义与转移方程：</strong>
      <p><code>dp[i][j]</code> 表示考察完前 <code>i</code> 组物品，在背包容量不超过 <code>j</code> 的前提下的最大收益。</p>
      <ul>
        <li>情况 1：第 <code>i</code> 组中<strong>一个物品都不选</strong>：<code>dp[i][j] = dp[i-1][j]</code>；</li>
        <li>情况 2：第 <code>i</code> 组中<strong>选且仅选某一件物品 <code>k</code></strong>：<code>dp[i][j] = max(dp[i][j], dp[i-1][j - cost[k]] + val[k])</code>。</li>
      </ul>
    </li>
    <li><strong>空间压缩的核心循环顺序（极易出错）：</strong>
      <p>使用一维数组 <code>dp[j]</code> 时，必须保证<strong>容量 <code>j</code> 在组内枚举的外层倒序遍历</strong>：</p>
      <pre><code>for each group:
    for j = m downTo 0:
        for each item k in group:
            if j >= cost[k]:
                dp[j] = max(dp[j], dp[j - cost[k]] + val[k])</code></pre>
      <p><strong>注意：</strong>容量 <code>j</code> 必须在最外层倒序，内层枚举组内各个物品！这样能确保在同一个容量 <code>j</code> 下，至多只叠加一件该组物品，杜绝同组多选！</p>
    </li>
  </ol>
</div>
`;

export const PARTITIONED_KNAPSACK_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    'struct Item { int cost, val, group; };',
    '// 分组背包模版 (洛谷 P1757)',
    'int computePartitionedKnapsack(int m, int n, vector<Item>& items) {',
    '    sort(items.begin(), items.end(), [](const Item& a, const Item& b) { return a.group < b.group; });',
    '    vector<int> dp(m + 1, 0);',
    '    for (int start = 0, end = 1; start < n;) {',
    '        while (end < n && items[end].group == items[start].group) ++end;',
    '        // 空间压缩：容量 j 必须在组内物品的外层倒序枚举',
    '        for (int j = m; j >= 0; --j) {',
    '            for (int k = start; k < end; ++k) {',
    '                if (j >= items[k].cost) {',
    '                    dp[j] = max(dp[j], dp[j - items[k].cost] + items[k].val);',
    '                }',
    '            }',
    '        }',
    '        start = end++;',
    '    }',
    '    return dp[m];',
    '}',
  ],
  java: [
    'package class074;',
    '',
    'import java.util.Arrays;',
    '',
    '// 分组背包模版 - 左程云标准实现',
    'public class Code01_PartitionedKnapsack {',
    '    public static int compute(int m, int n, int[][] arr) {',
    '        // arr 按组号排序: arr[i][0]=cost, arr[i][1]=val, arr[i][2]=group',
    '        Arrays.sort(arr, 0, n, (a, b) -> a[2] - b[2]);',
    '        int[] dp = new int[m + 1];',
    '        for (int start = 0, end = 1; start < n;) {',
    '            while (end < n && arr[end][2] == arr[start][2]) end++;',
    '            for (int j = m; j >= 0; j--) {',
    '                for (int k = start; k < end; k++) {',
    '                    if (j >= arr[k][0]) {',
    '                        dp[j] = Math.max(dp[j], dp[j - arr[k][0]] + arr[k][1]);',
    '                    }',
    '                }',
    '            }',
    '            start = end++;',
    '        }',
    '        return dp[m];',
    '    }',
    '}',
  ],
  python: [
    'def partitioned_knapsack(m: int, n: int, items: list[dict]) -> int:',
    '    """分组背包模版 - 组内互斥决策"""',
    '    items.sort(key=lambda x: x["group"])',
    '    dp = [0] * (m + 1)',
    '    start = 0',
    '    while start < n:',
    '        end = start + 1',
    '        while end < n and items[end]["group"] == items[start]["group"]:',
    '            end += 1',
    '        for j in range(m, -1, -1):',
    '            for k in range(start, end):',
    '                c, v = items[k]["cost"], items[k]["val"]',
    '                if j >= c:',
    '                    dp[j] = max(dp[j], dp[j - c] + v)',
    '        start = end',
    '    return dp[m]',
  ],
  javascript: [
    '// 分组背包模版 - 组内互斥决策',
    'export function computePartitionedKnapsack(m, n, items) {',
    '  items.sort((a, b) => a.group - b.group);',
    '  const dp = new Array(m + 1).fill(0);',
    '  let start = 0;',
    '  while (start < n) {',
    '    let end = start + 1;',
    '    while (end < n && items[end].group === items[start].group) end++;',
    '    for (let j = m; j >= 0; j--) {',
    '      for (let k = start; k < end; k++) {',
    '        const { cost, val } = items[k];',
    '        if (j >= cost) {',
    '          dp[j] = Math.max(dp[j], dp[j - cost] + val);',
    '        }',
    '      }',
    '    }',
    '    start = end;',
    '  }',
    '  return dp[m];',
    '}',
  ],
};

// ==========================================
// 2. Code02_MaximumValueOfKcoinsFromPiles 从栈中取出K个硬币的最大面值和
// ==========================================
export const COINS_FROM_PILES_PROBLEM_HTML = `
<div class="problem-description">
  <h3>从栈中取出K个硬币的最大面值和 (LeetCode 2218)</h3>
  <p><strong>题目描述：</strong></p>
  <p>桌子上总共有 <code>n</code> 个硬币栈。每个栈包含若干个带面值的硬币。在每一次操作中，你可以从<strong>任意一个栈的顶部</strong>取出 1 个硬币并放入钱包中。</p>
  <p>给你一个二维列表 <code>piles</code>，其中 <code>piles[i]</code> 是一个整数数组，从左到右分别表示第 <code>i</code> 个栈从栈顶到栈底的硬币面值。同时给你一个正整数 <code>k</code>。</p>
  <p>请返回在<strong>恰好进行 <code>k</code> 次操作</strong>的前提下，钱包里硬币面值之和的<strong>最大值</strong>。</p>
  <p><strong>测试链接：</strong><a href="https://leetcode.cn/problems/maximum-value-of-k-coins-from-piles/" target="_blank" style="color:#60a5fa;">LeetCode 2218 从栈中取出K个硬币的最大面值和</a></p>
</div>
`;

export const COINS_FROM_PILES_ANALYSIS_HTML = `
<div class="problem-analysis">
  <h3>前缀和预处理向分组背包的完美转化</h3>
  <ol>
    <li><strong>操作次数作为容量：</strong>
      <p>题目要求恰好拿取 <code>k</code> 个硬币，我们可以把“拿取 1 个硬币的操作次数”视为消耗 <code>1</code> 点背包容量，总容量上限即为 <code>k</code>。</p>
    </li>
    <li><strong>栈顶连续性与分组互斥性：</strong>
      <p>从某个栈 <code>pile</code> 中拿取硬币，必须<strong>从顶向下连续拿</strong>。因此：</p>
      <ul>
        <li>拿 0 个硬币：消耗容量 0，获得价值 0；</li>
        <li>拿 1 个硬币：消耗容量 1，获得价值 <code>piles[i][0]</code>；</li>
        <li>拿 2 个硬币：消耗容量 2，获得价值 <code>piles[i][0] + piles[i][1]</code>（前缀和）；</li>
        <li>拿 <code>t</code> 个硬币：消耗容量 <code>t</code>，获得价值 <code>prefixSum[t]</code>。</li>
      </ul>
      <p>显然，在同一个栈中，我们<strong>只能选择一种拿取方案</strong>（例如选拿 2 个就不能同时算拿 1 个的方案）。每一个栈就是一个典型的<strong>互斥物品组</strong>！</p>
    </li>
    <li><strong>状态转移与空间压缩：</strong>
      <p>先对每个栈预处理前缀和数组 <code>preSum</code>。对每个栈组，外层容量倒序 <code>for j = k downTo 1</code>，内层枚举拿取个数 <code>for c = 1 to min(t, j)</code>：</p>
      <code>dp[j] = max(dp[j], dp[j - c] + preSum[c])</code>
    </li>
  </ol>
</div>
`;

export const COINS_FROM_PILES_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 从栈中取出K个硬币的最大面值和 (LeetCode 2218) - 转化分组背包',
    'int maxValueOfCoins(vector<vector<int>>& piles, int k) {',
    '    vector<int> dp(k + 1, 0);',
    '    for (const auto& pile : piles) {',
    '        int t = min((int)pile.size(), k);',
    '        vector<int> preSum(t + 1, 0);',
    '        for (int i = 0; i < t; ++i) preSum[i + 1] = preSum[i] + pile[i];',
    '        // 分组背包倒序更新',
    '        for (int j = k; j > 0; --j) {',
    '            for (int c = 1; c <= min(t, j); ++c) {',
    '                dp[j] = max(dp[j], dp[j - c] + preSum[c]);',
    '            }',
    '        }',
    '    }',
    '    return dp[k];',
    '}',
  ],
  java: [
    'package class074;',
    '',
    'import java.util.List;',
    '',
    '// 从栈中取出K个硬币的最大面值和 - 左程云标准实现',
    'public class Code02_MaximumValueOfKcoinsFromPiles {',
    '    public static int maxValueOfCoins(List<List<Integer>> piles, int k) {',
    '        int[] dp = new int[k + 1];',
    '        for (List<Integer> pile : piles) {',
    '            int t = Math.min(pile.size(), k);',
    '            int[] preSum = new int[t + 1];',
    '            for (int i = 0, sum = 0; i < t; i++) {',
    '                sum += pile.get(i);',
    '                preSum[i + 1] = sum;',
    '            }',
    '            for (int j = k; j > 0; j--) {',
    '                for (int c = 1; c <= Math.min(t, j); c++) {',
    '                    dp[j] = Math.max(dp[j], dp[j - c] + preSum[c]);',
    '                }',
    '            }',
    '        }',
    '        return dp[k];',
    '    }',
    '}',
  ],
  python: [
    'def max_value_of_coins(piles: list[list[int]], k: int) -> int:',
    '    """从栈中取出K个硬币的最大面值和 - 分组背包"""',
    '    dp = [0] * (k + 1)',
    '    for pile in piles:',
    '        t = min(len(pile), k)',
    '        pre_sum = [0] * (t + 1)',
    '        for i in range(t):',
    '            pre_sum[i + 1] = pre_sum[i] + pile[i]',
    '        for j in range(k, 0, -1):',
    '            for c in range(1, min(t, j) + 1):',
    '                dp[j] = max(dp[j], dp[j - c] + pre_sum[c])',
    '    return dp[k]',
  ],
  javascript: [
    '// 从栈中取出K个硬币的最大面值和 - 分组背包',
    'export function maxValueOfCoins(piles, k) {',
    '  const dp = new Array(k + 1).fill(0);',
    '  for (const pile of piles) {',
    '    const t = Math.min(pile.length, k);',
    '    const preSum = new Array(t + 1).fill(0);',
    '    for (let i = 0; i < t; i++) {',
    '      preSum[i + 1] = preSum[i] + pile[i];',
    '    }',
    '    for (let j = k; j > 0; j--) {',
    '      for (let c = 1; c <= Math.min(t, j); c++) {',
    '        dp[j] = Math.max(dp[j], dp[j - c] + preSum[c]);',
    '      }',
    '    }',
    '  }',
    '  return dp[k];',
    '}',
  ],
};

// ==========================================
// 3. Code03_UnboundedKnapsack 完全背包模版
// ==========================================
export const UNBOUNDED_KNAPSACK_PROBLEM_HTML = `
<div class="problem-description">
  <h3>完全背包模版 (洛谷 P1616 疯狂的采药)</h3>
  <p><strong>题目描述：</strong></p>
  <p>辰辰是个天资聪颖的孩子，他的梦想是成为世界上最伟大的医师。在完成了上次的试炼后，医师带他来到药草更加丰富的大峡谷。</p>
  <p>在规定的时间 <code>T</code> 内，山谷里有 <code>M</code> 种草药，<strong>每种草药可以无限制地采摘任意多次！</strong>采摘第 <code>i</code> 种草药需要耗时 <code>costs[i]</code>，获得的价值为 <code>values[i]</code>。求在不超过总时间的情况下，能采到的草药最大总价值。</p>
  <p><strong>测试链接：</strong><a href="https://www.luogu.com.cn/problem/P1616" target="_blank" style="color:#60a5fa;">洛谷 P1616 疯狂的采药</a></p>
</div>
`;

export const UNBOUNDED_KNAPSACK_ANALYSIS_HTML = `
<div class="problem-analysis">
  <h3>完全背包与 01 背包空间压缩的本质区别：正序枚举</h3>
  <ol>
    <li><strong>状态定义与原始方程：</strong>
      <p><code>dp[i][j]</code> 表示前 <code>i</code> 种草药，在容量 <code>j</code> 下的最大价值。因为草药可无限次采摘：</p>
      <code>dp[i][j] = max(dp[i-1][j], dp[i][j - cost[i]] + val[i])</code>
      <p><strong>关键观察：</strong>第二项是 <code>dp[i][j - cost[i]]</code>（第 <code>i</code> 层自身），而不是 01 背包的 <code>dp[i-1][j - cost[i]]</code>！这表示一旦选了该物品，后续还允许在该层继续选！</p>
    </li>
    <li><strong>空间压缩的神奇逆转（从倒序到正序）：</strong>
      <p>在 01 背包中，为了防止同一件物品被多次选择，我们必须<strong>从大到小倒序枚举 <code>j</code></strong>；而在完全背包中，我们恰恰需要利用“刚才已经选过当前物品累加出来的最新值”来继续选择！</p>
      <p style="text-align:center;font-weight:700;color:#10b981;">因此完全背包空间压缩：容量 j 必须从小到大正序枚举！</p>
      <code>for j = cost[i] to T: dp[j] = max(dp[j], dp[j - cost[i]] + val[i])</code>
    </li>
    <li><strong>复杂度：</strong>时间复杂度 <code>O(M &middot; T)</code>，空间复杂度 <code>O(T)</code>。</li>
  </ol>
</div>
`;

export const UNBOUNDED_KNAPSACK_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 完全背包模版 (洛谷 P1616 疯狂的采药)',
    'long long unboundedKnapsack(int t, int m, const vector<int>& cost, const vector<int>& val) {',
    '    vector<long long> dp(t + 1, 0);',
    '    for (int i = 0; i < m; ++i) {',
    '        // 关键：完全背包从小到大正序枚举，允许物品多次叠加',
    '        for (int j = cost[i]; j <= t; ++j) {',
    '            dp[j] = max(dp[j], dp[j - cost[i]] + val[i]);',
    '        }',
    '    }',
    '    return dp[t];',
    '}',
  ],
  java: [
    'package class074;',
    '',
    'import java.util.Arrays;',
    '',
    '// 完全背包模版 - 左程云标准实现',
    'public class Code03_UnboundedKnapsack {',
    '    public static long compute(int t, int m, int[] cost, int[] val) {',
    '        long[] dp = new long[t + 1];',
    '        for (int i = 0; i < m; i++) {',
    '            // 正序枚举',
    '            for (int j = cost[i]; j <= t; j++) {',
    '                dp[j] = Math.max(dp[j], dp[j - cost[i]] + val[i]);',
    '            }',
    '        }',
    '        return dp[t];',
    '    }',
    '}',
  ],
  python: [
    'def unbounded_knapsack(t: int, m: int, cost: list[int], val: list[int]) -> int:',
    '    """完全背包模版 - 正序枚举空间压缩"""',
    '    dp = [0] * (t + 1)',
    '    for c, v in zip(cost, val):',
    '        for j in range(c, t + 1):',
    '            dp[j] = max(dp[j], dp[j - c] + v)',
    '    return dp[t]',
  ],
  javascript: [
    '// 完全背包模版 - 正序遍历压缩空间',
    'export function computeUnboundedKnapsack(t, m, cost, val) {',
    '  const dp = new Array(t + 1).fill(0);',
    '  for (let i = 0; i < m; i++) {',
    '    const c = cost[i], v = val[i];',
    '    for (let j = c; j <= t; j++) {',
    '      dp[j] = Math.max(dp[j], dp[j - c] + v);',
    '    }',
    '  }',
    '  return dp[t];',
    '}',
  ],
};

// ==========================================
// 4. Code04_RegularExpressionMatching 正则表达式匹配
// ==========================================
export const REGEX_MATCHING_PROBLEM_HTML = `
<div class="problem-description">
  <h3>正则表达式匹配 (LeetCode 10)</h3>
  <p><strong>题目描述：</strong></p>
  <p>给你字符串 <code>s</code> 和字符规律 <code>p</code>。请你实现一个支持 <code>'.'</code> 和 <code>'*'</code> 的正则表达式匹配：</p>
  <ul>
    <li><code>'.'</code> 匹配任意单个字符；</li>
    <li><code>'*'</code> 匹配零个或多个前面的那一个元素。</li>
  </ul>
  <p>所谓匹配，是要涵盖<strong>整个字符串 <code>s</code></strong> 的，而不是部分字符串。</p>
  <p><strong>测试链接：</strong><a href="https://leetcode.cn/problems/regular-expression-matching/" target="_blank" style="color:#60a5fa;">LeetCode 10 正则表达式匹配</a></p>
</div>
`;

export const REGEX_MATCHING_ANALYSIS_HTML = `
<div class="problem-analysis">
  <h3>星号通配的完全背包模型与斜率优化推导</h3>
  <ol>
    <li><strong>星号 '*' 的完全背包本质：</strong>
      <p>当 <code>p[j+1] == '*'</code> 时，<code>p[j]</code> 可以使用 0 次、1 次、2 次、3 次... 直到无法匹配。这本质上就是<strong>完全背包（物品数量不限）</strong>！</p>
    </li>
    <li><strong>朴素枚举与斜率优化化简：</strong>
      <p>朴素枚举需要循环判断匹配多少个字符。但根据动态规划斜率优化代数恒等变形：</p>
      <code>dp[i][j] = dp[i][j+2] || ((s[i] == p[j] || p[j] == '.') && dp[i+1][j])</code>
      <p>即：</p>
      <ul>
        <li><strong>分支 1（让 * 匹配 0 次）：</strong>直接跳过 <code>p[j..j+1]</code> 考察 <code>dp[i][j+2]</code>；</li>
        <li><strong>分支 2（让 * 匹配至少 1 次）：</strong>若首字符匹配成功，字符串 <code>s</code> 消耗 1 个字符（到 <code>i+1</code>），但 <code>p</code> 依然保留当前规则 <code>j</code>，继续承担后续匹配！</li>
      </ul>
    </li>
    <li><strong>复杂度：</strong>时间复杂度 <code>O(N &middot; M)</code>，严格消除任何多余的 while 循环！</li>
  </ol>
</div>
`;

export const REGEX_MATCHING_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <string>',
    '#include <vector>',
    'using namespace std;',
    '',
    '// 正则表达式匹配 (LeetCode 10) - 完全背包斜率优化',
    'bool isMatch(string s, string p) {',
    '    int n = s.length(), m = p.length();',
    '    vector<vector<bool>> dp(n + 1, vector<bool>(m + 1, false));',
    '    dp[n][m] = true;',
    '    for (int j = m - 1; j >= 0; --j) {',
    '        dp[n][j] = j + 1 < m && p[j + 1] == \'*\' && dp[n][j + 2];',
    '    }',
    '    for (int i = n - 1; i >= 0; --i) {',
    '        for (int j = m - 1; j >= 0; --j) {',
    '            if (j + 1 == m || p[j + 1] != \'*\') {',
    '                dp[i][j] = (s[i] == p[j] || p[j] == \'.\') && dp[i + 1][j + 1];',
    '            } else {',
    '                // 斜率优化：匹配0次 vs 匹配>=1次',
    '                dp[i][j] = dp[i][j + 2] || ((s[i] == p[j] || p[j] == \'.\') && dp[i + 1][j]);',
    '            }',
    '        }',
    '    }',
    '    return dp[0][0];',
    '}',
  ],
  java: [
    'package class074;',
    '',
    '// 正则表达式匹配 - 左程云标准实现',
    'public class Code04_RegularExpressionMatching {',
    '    public static boolean isMatch(String str, String pat) {',
    '        char[] s = str.toCharArray();',
    '        char[] p = pat.toCharArray();',
    '        int n = s.length, m = p.length;',
    '        boolean[][] dp = new boolean[n + 1][m + 1];',
    '        dp[n][m] = true;',
    '        for (int j = m - 1; j >= 0; j--) {',
    '            dp[n][j] = j + 1 < m && p[j + 1] == \'*\' && dp[n][j + 2];',
    '        }',
    '        for (int i = n - 1; i >= 0; i--) {',
    '            for (int j = m - 1; j >= 0; j--) {',
    '                if (j + 1 == m || p[j + 1] != \'*\') {',
    '                    dp[i][j] = (s[i] == p[j] || p[j] == \'.\') && dp[i + 1][j + 1];',
    '                } else {',
    '                    dp[i][j] = dp[i][j + 2] || ((s[i] == p[j] || p[j] == \'.\') && dp[i + 1][j]);',
    '                }',
    '            }',
    '        }',
    '        return dp[0][0];',
    '    }',
    '}',
  ],
  python: [
    'def is_match(s: str, p: str) -> bool:',
    '    """正则表达式匹配 - 完全背包斜率优化"""',
    '    n, m = len(s), len(p)',
    '    dp = [[False] * (m + 1) for _ in range(n + 1)]',
    '    dp[n][m] = True',
    '    for j in range(m - 1, -1, -1):',
    '        dp[n][j] = j + 1 < m and p[j + 1] == "*" and dp[n][j + 2]',
    '    for i in range(n - 1, -1, -1):',
    '        for j in range(m - 1, -1, -1):',
    '            if j + 1 == m or p[j + 1] != "*":',
    '                dp[i][j] = (s[i] == p[j] or p[j] == ".") and dp[i + 1][j + 1]',
    '            else:',
    '                dp[i][j] = dp[i][j + 2] or ((s[i] == p[j] or p[j] == ".") and dp[i + 1][j])',
    '    return dp[0][0]',
  ],
  javascript: [
    '// 正则表达式匹配 - 严格位置依赖 DP',
    'export function isMatch(s, p) {',
    '  const n = s.length, m = p.length;',
    '  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(false));',
    '  dp[n][m] = true;',
    '  for (let j = m - 1; j >= 0; j--) {',
    '    dp[n][j] = j + 1 < m && p[j + 1] === "*" && dp[n][j + 2];',
    '  }',
    '  for (let i = n - 1; i >= 0; i--) {',
    '    for (let j = m - 1; j >= 0; j--) {',
    '      if (j + 1 === m || p[j + 1] !== "*") {',
    '        dp[i][j] = (s[i] === p[j] || p[j] === ".") && dp[i + 1][j + 1];',
    '      } else {',
    '        dp[i][j] = dp[i][j + 2] || ((s[i] === p[j] || p[j] === ".") && dp[i + 1][j]);',
    '      }',
    '    }',
    '  }',
    '  return dp[0][0];',
    '}',
  ],
};

// ==========================================
// 5. Code05_WildcardMatching 通配符匹配
// ==========================================
export const WILDCARD_MATCHING_PROBLEM_HTML = `
<div class="problem-description">
  <h3>通配符匹配 (LeetCode 44)</h3>
  <p><strong>题目描述：</strong></p>
  <p>给你输入一个字符串 <code>s</code> 和一个字符模式 <code>p</code>，实现一个支持 <code>'?'</code> 和 <code>'*'</code> 的通配符匹配：</p>
  <ul>
    <li><code>'?'</code> 可以匹配任何单个有效字符；</li>
    <li><code>'*'</code> 可以匹配任意字符序列（包括空字符序列）。</li>
  </ul>
  <p>判定字符串 <code>s</code> 和字符模式 <code>p</code> 是否完全匹配。</p>
  <p><strong>测试链接：</strong><a href="https://leetcode.cn/problems/wildcard-matching/" target="_blank" style="color:#60a5fa;">LeetCode 44 通配符匹配</a></p>
</div>
`;

export const WILDCARD_MATCHING_ANALYSIS_HTML = `
<div class="problem-analysis">
  <h3>通配符 '*' 的任意字符串展开与斜率优化</h3>
  <ol>
    <li><strong>通配符 '*' 的两种决策：</strong>
      <p>当 <code>p[j] == '*'</code> 时：</p>
      <ul>
        <li><strong>选择 1（匹配空串）：</strong>让 <code>*</code> 不消耗 <code>s</code> 的任何字符，直接匹配 <code>p</code> 的下一个位置：<code>dp[i][j+1]</code>；</li>
        <li><strong>选择 2（匹配至少 1 个字符）：</strong>让 <code>*</code> 吃掉当前字符 <code>s[i]</code>，并且 <code>*</code> 依然保留在模式串中继续生效：<code>dp[i+1][j]</code>！</li>
      </ul>
    </li>
    <li><strong>优美的状态转移方程：</strong>
      <code>dp[i][j] = dp[i][j+1] || dp[i+1][j]</code>
      <p>与正则表达式匹配相比，通配符匹配无需检查 <code>p[j]</code> 前驱字符，转移极其简捷！</p>
    </li>
  </ol>
</div>
`;

export const WILDCARD_MATCHING_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <string>',
    '#include <vector>',
    'using namespace std;',
    '',
    '// 通配符匹配 (LeetCode 44)',
    'bool isMatch(string s, string p) {',
    '    int n = s.length(), m = p.length();',
    '    vector<vector<bool>> dp(n + 1, vector<bool>(m + 1, false));',
    '    dp[n][m] = true;',
    '    for (int j = m - 1; j >= 0 && p[j] == \'*\'; --j) dp[n][j] = true;',
    '    for (int i = n - 1; i >= 0; --i) {',
    '        for (int j = m - 1; j >= 0; --j) {',
    '            if (p[j] != \'*\') {',
    '                dp[i][j] = (s[i] == p[j] || p[j] == \'?\') && dp[i + 1][j + 1];',
    '            } else {',
    '                dp[i][j] = dp[i + 1][j] || dp[i][j + 1];',
    '            }',
    '        }',
    '    }',
    '    return dp[0][0];',
    '}',
  ],
  java: [
    'package class074;',
    '',
    '// 通配符匹配 - 左程云标准实现',
    'public class Code05_WildcardMatching {',
    '    public static boolean isMatch(String str, String pat) {',
    '        char[] s = str.toCharArray();',
    '        char[] p = pat.toCharArray();',
    '        int n = s.length, m = p.length;',
    '        boolean[][] dp = new boolean[n + 1][m + 1];',
    '        dp[n][m] = true;',
    '        for (int j = m - 1; j >= 0 && p[j] == \'*\'; j--) {',
    '            dp[n][j] = true;',
    '        }',
    '        for (int i = n - 1; i >= 0; i--) {',
    '            for (int j = m - 1; j >= 0; j--) {',
    '                if (p[j] != \'*\') {',
    '                    dp[i][j] = (s[i] == p[j] || p[j] == \'?\') && dp[i + 1][j + 1];',
    '                } else {',
    '                    dp[i][j] = dp[i + 1][j] || dp[i][j + 1];',
    '                }',
    '            }',
    '        }',
    '        return dp[0][0];',
    '    }',
    '}',
  ],
  python: [
    'def is_match(s: str, p: str) -> bool:',
    '    """通配符匹配 - 完全背包斜率优化"""',
    '    n, m = len(s), len(p)',
    '    dp = [[False] * (m + 1) for _ in range(n + 1)]',
    '    dp[n][m] = True',
    '    for j in range(m - 1, -1, -1):',
    '        if p[j] == "*":',
    '            dp[n][j] = True',
    '        else:',
    '            break',
    '    for i in range(n - 1, -1, -1):',
    '        for j in range(m - 1, -1, -1):',
    '            if p[j] != "*":',
    '                dp[i][j] = (s[i] == p[j] or p[j] == "?") and dp[i + 1][j + 1]',
    '            else:',
    '                dp[i][j] = dp[i + 1][j] or dp[i][j + 1]',
    '    return dp[0][0]',
  ],
  javascript: [
    '// 通配符匹配',
    'export function isMatch(s, p) {',
    '  const n = s.length, m = p.length;',
    '  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(false));',
    '  dp[n][m] = true;',
    '  for (let j = m - 1; j >= 0 && p[j] === "*"; j--) dp[n][j] = true;',
    '  for (let i = n - 1; i >= 0; i--) {',
    '    for (let j = m - 1; j >= 0; j--) {',
    '      if (p[j] !== "*") {',
    '        dp[i][j] = (s[i] === p[j] || p[j] === "?") && dp[i + 1][j + 1];',
    '      } else {',
    '        dp[i][j] = dp[i + 1][j] || dp[i][j + 1];',
    '      }',
    '    }',
    '  }',
    '  return dp[0][0];',
    '}',
  ],
};

// ==========================================
// 6. Code06_BuyingHayMinimumCost 购买足量干草的最小花费
// ==========================================
export const BUYING_HAY_MIN_COST_PROBLEM_HTML = `
<div class="problem-description">
  <h3>购买足量干草的最小花费 (洛谷 P2918 [USACO08NOV] Buying Hay S)</h3>
  <p><strong>题目描述：</strong></p>
  <p>约翰想买<strong>至少 <code>H</code> 磅干草</strong>给奶牛。市场上有 <code>n</code> 个供应商，每个供应商的产品都可以无限次购买。购买第 <code>i</code> 家的产品 1 次需要花 <code>cost[i]</code> 元，可以获得 <code>val[i]</code> 磅干草。</p>
  <p>求满足干草需求总量<strong>不少于 <code>H</code> 磅</strong>的前提下，约翰需要花费的<strong>最少金额</strong>（允许购买超过 <code>H</code> 磅干草，只要更划算）。</p>
  <p><strong>测试链接：</strong><a href="https://www.luogu.com.cn/problem/P2918" target="_blank" style="color:#60a5fa;">洛谷 P2918 [USACO08NOV] Buying Hay S</a></p>
</div>
`;

export const BUYING_HAY_MIN_COST_ANALYSIS_HTML = `
<div class="problem-analysis">
  <h3>容量上界扩充与求最小值的完全背包</h3>
  <ol>
    <li><strong>为什么不能只算到 H？</strong>
      <p>题目允许“购买量超出 <code>H</code> 磅”。可能存在某大捆商品单价极其便宜，买下它后总重达到了 <code>H + 3</code> 磅，但总价却比恰好凑出 <code>H</code> 磅更低！</p>
    </li>
    <li><strong>容量扩充上限证明：</strong>
      <p>设所有商品中单次购买能够获得的最大干草量为 <code>maxVal = max(val)</code>。最坏情况下，我们最多只会在购买量达到 <code>H - 1</code> 时再买一次单次最大包裹，总重达到 <code>H - 1 + maxVal</code>。因此：</p>
      <p style="text-align:center;font-weight:700;color:#10b981;">背包容量只需扩充至上限 m = H + maxVal 即可保证包含所有最优解！</p>
    </li>
    <li><strong>完全背包转移：</strong>
      <p>初值置无穷大 <code>dp[0] = 0, dp[1..m] = &infin;</code>。正序遍历 <code>for j = val[i] to m: dp[j] = min(dp[j], dp[j - val[i]] + cost[i])</code>。</p>
      <p>最终答案在 <code>[H, m]</code> 区间中求最小值：<code>ans = min(dp[H..m])</code>。</p>
    </li>
  </ol>
</div>
`;

export const BUYING_HAY_MIN_COST_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 购买足量干草的最小花费 (洛谷 P2918)',
    'int minCostBuyingHay(int n, int h, const vector<int>& cost, const vector<int>& val) {',
    '    int maxv = *max_element(val.begin(), val.end());',
    '    int m = h + maxv;',
    '    const int INF = 1e9;',
    '    vector<int> dp(m + 1, INF);',
    '    dp[0] = 0;',
    '    for (int i = 0; i < n; ++i) {',
    '        for (int j = val[i]; j <= m; ++j) {',
    '            if (dp[j - val[i]] != INF) {',
    '                dp[j] = min(dp[j], dp[j - val[i]] + cost[i]);',
    '            }',
    '        }',
    '    }',
    '    int ans = INF;',
    '    for (int j = h; j <= m; ++j) ans = min(ans, dp[j]);',
    '    return ans;',
    '}',
  ],
  java: [
    'package class074;',
    '',
    'import java.util.Arrays;',
    '',
    '// 购买足量干草的最小花费 - 左程云标准实现',
    'public class Code06_BuyingHayMinimumCost {',
    '    public static int minCost(int n, int h, int[] cost, int[] val) {',
    '        int maxv = 0;',
    '        for (int v : val) maxv = Math.max(maxv, v);',
    '        int m = h + maxv;',
    '        int[] dp = new int[m + 1];',
    '        Arrays.fill(dp, 1, m + 1, Integer.MAX_VALUE);',
    '        for (int i = 0; i < n; i++) {',
    '            for (int j = val[i]; j <= m; j++) {',
    '                if (dp[j - val[i]] != Integer.MAX_VALUE) {',
    '                    dp[j] = Math.min(dp[j], dp[j - val[i]] + cost[i]);',
    '                }',
    '            }',
    '        }',
    '        int ans = Integer.MAX_VALUE;',
    '        for (int j = h; j <= m; j++) {',
    '            ans = Math.min(ans, dp[j]);',
    '        }',
    '        return ans;',
    '    }',
    '}',
  ],
  python: [
    'def min_cost_buying_hay(n: int, h: int, cost: list[int], val: list[int]) -> int:',
    '    """购买足量干草的最小花费 - 完全背包上界扩充"""',
    '    maxv = max(val)',
    '    m = h + maxv',
    '    INF = float("inf")',
    '    dp = [INF] * (m + 1)',
    '    dp[0] = 0',
    '    for c, v in zip(cost, val):',
    '        for j in range(v, m + 1):',
    '            if dp[j - v] != INF:',
    '                dp[j] = min(dp[j], dp[j - v] + c)',
    '    return min(dp[h : m + 1])',
  ],
  javascript: [
    '// 购买足量干草的最小花费',
    'export function minCostBuyingHay(n, h, cost, val) {',
    '  const maxv = Math.max(...val);',
    '  const m = h + maxv;',
    '  const INF = 1e9;',
    '  const dp = new Array(m + 1).fill(INF);',
    '  dp[0] = 0;',
    '  for (let i = 0; i < n; i++) {',
    '    const c = cost[i], v = val[i];',
    '    for (let j = v; j <= m; j++) {',
    '      if (dp[j - v] !== INF) {',
    '        dp[j] = Math.min(dp[j], dp[j - v] + c);',
    '      }',
    '    }',
    '  }',
    '  let ans = INF;',
    '  for (let j = h; j <= m; j++) {',
    '    ans = Math.min(ans, dp[j]);',
    '  }',
    '  return ans;',
    '}',
  ],
};
