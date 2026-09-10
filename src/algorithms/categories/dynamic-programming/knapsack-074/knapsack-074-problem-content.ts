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
  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
    <h3 style="margin: 0; color: #f8fafc; font-size: 16px;">分组背包模版 (洛谷 P1757 通天之分组背包)</h3>
    <span style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">洛谷 普及+/提高</span>
  </div>

  <div style="margin-bottom: 14px;">
    <h4 style="color: #38bdf8; font-size: 13px; margin: 0 0 6px 0;">📜 题目背景与描述</h4>
    <p style="margin: 0 0 8px 0;">自 01 背包问世之后，小 A 对此深感兴趣。他发现有 <code>n</code> 个物品和一个容量为 <code>m</code> 的背包。每个物品有自己的体积 <code>c_i</code>、价值 <code>v_i</code>，并且属于某一个组 <code>g_i</code>。</p>
    <p style="margin: 0;"><strong>限制规则：同一个组内的物品最多只能选择一件！</strong>所有选择的物品体积之和不得超过背包总容量 <code>m</code>。求怎么挑选物品才能使得总价值最大。</p>
  </div>

  <div style="margin-bottom: 14px; background: rgba(30, 41, 59, 0.5); border: 1px solid #334155; border-radius: 6px; padding: 10px 12px;">
    <h4 style="color: #38bdf8; font-size: 13px; margin: 0 0 6px 0;">📥 输入格式规范</h4>
    <p style="margin: 0 0 4px 0;">第一行两个整数 <code>m, n</code>，分别表示背包总容量和物品总数。</p>
    <p style="margin: 0;">接下来 <code>n</code> 行，每行 3 个整数 <code>c_i, v_i, g_i</code>，分别表示第 <code>i</code> 个物品的体积、价值和所属组号。</p>
  </div>

  <div style="margin-bottom: 14px; background: rgba(30, 41, 59, 0.5); border: 1px solid #334155; border-radius: 6px; padding: 10px 12px;">
    <h4 style="color: #38bdf8; font-size: 13px; margin: 0 0 6px 0;">📤 输出格式规范</h4>
    <p style="margin: 0;">输出一个整数，表示在满足组内互斥规则的前提下，背包所能装载的最大总价值。</p>
  </div>

  <div style="margin-bottom: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
    <div style="background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 10px;">
      <div style="color: #94a3b8; font-size: 12px; font-weight: 600; margin-bottom: 4px;">输入样例 1</div>
      <pre style="margin: 0; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #f1f5f9; background: transparent; padding: 0;">45 3
10 10 1
10 5 1
50 400 2</pre>
    </div>
    <div style="background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 10px;">
      <div style="color: #94a3b8; font-size: 12px; font-weight: 600; margin-bottom: 4px;">输出样例 1</div>
      <pre style="margin: 0; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #34d399; font-weight: 700; background: transparent; padding: 0;">10</pre>
      <div style="margin-top: 6px; font-size: 11px; color: #94a3b8;">说明：组 1 中选 (10, 10)；组 2 物品体积 50 超过背包容量 45 无法选入。总价值为 10。</div>
    </div>
  </div>

  <div style="background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px; padding: 10px 12px; margin-bottom: 12px;">
    <div style="color: #38bdf8; font-weight: 700; font-size: 12px; margin-bottom: 4px;">📊 数据规模与约定</div>
    <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #cbd5e1; line-height: 1.6;">
      <li><code>1 &le; m, n &le; 1000</code>，组号 <code>g_i &le; 100</code>。物品价值与体积均为正整数且不超过 1000。</li>
    </ul>
  </div>

  <div style="font-size: 12px;">
    <strong>测试链接：</strong>
    <a href="https://www.luogu.com.cn/problem/P1757" target="_blank" style="color: #60a5fa; text-decoration: underline;">洛谷 P1757 通天之分组背包</a>
  </div>
</div>
`;

export const PARTITIONED_KNAPSACK_ANALYSIS_HTML = `
<div class="problem-analysis">
  <div style="margin-bottom: 14px;">
    <h4 style="color: #34d399; font-size: 14px; margin: 0 0 6px 0;">🎯 分组背包算法逻辑与组内互斥状态转移</h4>
    <p style="margin: 0; color: #cbd5e1;">分组背包的核心是<strong>同一组内的物品存在排他互斥性（选 A 就不能选 B）</strong>。必须通过对组排序聚合 + 容量倒序枚举来杜绝同组多选。</p>
  </div>

  <div style="display: flex; flex-direction: column; gap: 14px;">
    <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid #334155; border-radius: 6px; padding: 12px;">
      <div style="font-weight: 700; color: #38bdf8; margin-bottom: 6px;">1. 问题特征与按组聚合排序</div>
      <p style="margin: 0; color: #cbd5e1; line-height: 1.6;">
        物品按所属组号 <code>g_i</code> 排序，使相同组的物品在内存中连续排列，便于以双指针 <code>[start, end)</code> 批量截取处理每一组。
      </p>
    </div>

    <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid #334155; border-radius: 6px; padding: 12px;">
      <div style="font-weight: 700; color: #a78bfa; margin-bottom: 6px;">2. 状态定义与组间决策转移</div>
      <p style="margin: 0 0 6px 0; color: #cbd5e1;">
        <code>dp[i][j]</code> 表示考察完前 <code>i</code> 组物品后，背包容量不超过 <code>j</code> 时的最大收益：
      </p>
      <ul style="margin: 0; padding-left: 18px; color: #cbd5e1; line-height: 1.6;">
        <li><strong>分支 1（本组全都不选）</strong>：直接继承前一组结果 <code>dp[i-1][j]</code>；</li>
        <li><strong>分支 2（本组内选且仅选某一件物品 k）</strong>：枚举组内所有可能 <code>dp[i-1][j - cost[k]] + val[k]</code>。</li>
      </ul>
    </div>

    <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid #334155; border-radius: 6px; padding: 12px;">
      <div style="font-weight: 700; color: #f59e0b; margin-bottom: 6px;">3. 空间压缩的核心三重循环顺序（致命易错点）</div>
      <p style="margin: 0 0 6px 0; color: #cbd5e1;">使用一维数组 <code>dp[j]</code> 时，<strong>容量循环与组内物品枚举的内外层顺序绝对不能颠倒</strong>：</p>
      <div style="background: #0f172a; padding: 8px 12px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; color: #f1f5f9; font-size: 12px;">
for each group:
    for j = m downTo 0:                  // 容量 j 必须在外层倒序！
        for each item k in group:        // 内层遍历组内各候选物品
            if (j &gt;= cost[k]) {
                dp[j] = max(dp[j], dp[j - cost[k]] + val[k]);
            }
      </div>
      <p style="margin: 6px 0 0 0; font-size: 12px; color: #f87171;">
        ⚠️ 若将容量倒序放在最内层，同一组内的多个物品会在不同容量之间发生连锁累加，导致“单组多选”，彻底破坏互斥性！
      </p>
    </div>
  </div>
</div>
`;

export const PARTITIONED_KNAPSACK_STAGE1_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    'struct Item { int cost, val, group; };',
    '// 阶段 1: 暴力递归分组背包 (每组至多选 1 件或不选，递归推进至下一组 g + 1)',
    'int dfs(int g, int remCap, int numGroups, const vector<vector<Item>>& groups) {',
    '    if (g >= numGroups || remCap <= 0) return 0;',
    '    // 分支 0: 本组任何物品都不选',
    '    int maxVal = dfs(g + 1, remCap, numGroups, groups);',
    '    // 分支 k: 在第 g 组中尝试且仅选择一件物品 k',
    '    for (const auto& item : groups[g]) {',
    '        if (remCap >= item.cost) {',
    '            maxVal = max(maxVal, dfs(g + 1, remCap - item.cost, numGroups, groups) + item.val);',
    '        }',
    '    }',
    '    return maxVal;',
    '}',
  ],
  java: [
    'package class074;',
    '',
    'import java.util.List;',
    '',
    '// 阶段 1: 暴力递归分组背包',
    'public class Code01_PartitionedKnapsackStage1 {',
    '    public static int dfs(int g, int remCap, int numGroups, List<List<int[]>> groups) {',
    '        if (g >= numGroups || remCap <= 0) return 0;',
    '        // 分支 0: 本组全都不选',
    '        int maxVal = dfs(g + 1, remCap, numGroups, groups);',
    '        // 分支 k: 本组内互斥选择一件',
    '        for (int[] item : groups.get(g)) {',
    '            int cost = item[0], val = item[1];',
    '            if (remCap >= cost) {',
    '                maxVal = Math.max(maxVal, dfs(g + 1, remCap - cost, numGroups, groups) + val);',
    '            }',
    '        }',
    '        return maxVal;',
    '    }',
    '}',
  ],
  python: [
    'def dfs_partitioned(g: int, rem_cap: int, groups: list[list[dict]]) -> int:',
    '    """阶段 1: 暴力递归分组背包"""',
    '    if g >= len(groups) or rem_cap <= 0:',
    '        return 0',
    '    # 分支 0: 本组不选任何物品',
    '    max_val = dfs_partitioned(g + 1, rem_cap, groups)',
    '    # 分支 k: 本组互斥选择一件',
    '    for item in groups[g]:',
    '        if rem_cap >= item["cost"]:',
    '            max_val = max(max_val, dfs_partitioned(g + 1, rem_cap - item["cost"], groups) + item["val"])',
    '    return max_val',
  ],
  javascript: [
    '// 阶段 1: 暴力递归分组背包',
    'export function dfsPartitioned(g, remCap, groups) {',
    '  if (g >= groups.length || remCap <= 0) return 0;',
    '  let maxVal = dfsPartitioned(g + 1, remCap, groups);',
    '  for (const item of groups[g]) {',
    '    if (remCap >= item.cost) {',
    '      maxVal = Math.max(maxVal, dfsPartitioned(g + 1, remCap - item.cost, groups) + item.val);',
    '    }',
    '  }',
    '  return maxVal;',
    '}',
  ],
};

export const PARTITIONED_KNAPSACK_STAGE2_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    'struct Item { int cost, val, group; };',
    '// 阶段 2: 记忆化搜索分组背包 memo[g][remCap]',
    'int dfsMemo(int g, int remCap, int numGroups, const vector<vector<Item>>& groups, vector<vector<int>>& memo) {',
    '    if (g >= numGroups || remCap <= 0) return 0;',
    '    if (memo[g][remCap] != -1) return memo[g][remCap]; // 命中缓存',
    '    int maxVal = dfsMemo(g + 1, remCap, numGroups, groups, memo);',
    '    for (const auto& item : groups[g]) {',
    '        if (remCap >= item.cost) {',
    '            maxVal = max(maxVal, dfsMemo(g + 1, remCap - item.cost, numGroups, groups, memo) + item.val);',
    '        }',
    '    }',
    '    return memo[g][remCap] = maxVal;',
    '}',
  ],
  java: [
    'package class074;',
    '',
    'import java.util.List;',
    '',
    '// 阶段 2: 记忆化搜索分组背包',
    'public class Code01_PartitionedKnapsackStage2 {',
    '    public static int dfsMemo(int g, int remCap, int numGroups, List<List<int[]>> groups, int[][] memo) {',
    '        if (g >= numGroups || remCap <= 0) return 0;',
    '        if (memo[g][remCap] != -1) return memo[g][remCap];',
    '        int maxVal = dfsMemo(g + 1, remCap, numGroups, groups, memo);',
    '        for (int[] item : groups.get(g)) {',
    '            int cost = item[0], val = item[1];',
    '            if (remCap >= cost) {',
    '                maxVal = Math.max(maxVal, dfsMemo(g + 1, remCap - cost, numGroups, groups, memo) + val);',
    '            }',
    '        }',
    '        return memo[g][remCap] = maxVal;',
    '    }',
    '}',
  ],
  python: [
    'def partitioned_knapsack_memo(m: int, groups: list[list[dict]]) -> int:',
    '    """阶段 2: 记忆化搜索分组背包"""',
    '    memo = [[-1] * (m + 1) for _ in range(len(groups))]',
    '    def dfs(g: int, rem_cap: int) -> int:',
    '        if g >= len(groups) or rem_cap <= 0:',
    '            return 0',
    '        if memo[g][rem_cap] != -1:',
    '            return memo[g][rem_cap]',
    '        res = dfs(g + 1, rem_cap)',
    '        for item in groups[g]:',
    '            if rem_cap >= item["cost"]:',
    '                res = max(res, dfs(g + 1, rem_cap - item["cost"]) + item["val"])',
    '        memo[g][rem_cap] = res',
    '        return res',
    '    return dfs(0, m)',
  ],
  javascript: [
    '// 阶段 2: 记忆化搜索分组背包',
    'export function partitionedKnapsackMemo(m, groups) {',
    '  const memo = Array.from({ length: groups.length }, () => new Array(m + 1).fill(-1));',
    '  function dfs(g, remCap) {',
    '    if (g >= groups.length || remCap <= 0) return 0;',
    '    if (memo[g][remCap] !== -1) return memo[g][remCap];',
    '    let res = dfs(g + 1, remCap);',
    '    for (const item of groups[g]) {',
    '      if (remCap >= item.cost) {',
    '        res = Math.max(res, dfs(g + 1, remCap - item.cost) + item.val);',
    '      }',
    '    }',
    '    return (memo[g][remCap] = res);',
    '  }',
    '  return dfs(0, m);',
    '}',
  ],
};

export const PARTITIONED_KNAPSACK_STAGE3_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    'struct Item { int cost, val, group; };',
    '// 阶段 3: 严格二维动态规划分组背包',
    '// dp[g][j]: 考察完前 g 组后在容量限制为 j 时的最大收益',
    'int computePartitionedKnapsack2D(int m, int numGroups, const vector<vector<Item>>& groups) {',
    '    vector<vector<int>> dp(numGroups + 1, vector<int>(m + 1, 0));',
    '    for (int g = 1; g <= numGroups; ++g) {',
    '        for (int j = 0; j <= m; ++j) {',
    '            // 分支 0: 本组全都不选，继承上一组',
    '            dp[g][j] = dp[g - 1][j];',
    '            // 分支 k: 在第 g 组挑选一件物品 k',
    '            for (const auto& item : groups[g - 1]) {',
    '                if (j >= item.cost) {',
    '                    dp[g][j] = max(dp[g][j], dp[g - 1][j - item.cost] + item.val);',
    '                }',
    '            }',
    '        }',
    '    }',
    '    return dp[numGroups][m];',
    '}',
  ],
  java: [
    'package class074;',
    '',
    'import java.util.List;',
    '',
    '// 阶段 3: 严格二维动态规划分组背包',
    'public class Code01_PartitionedKnapsackStage3 {',
    '    public static int compute(int m, int numGroups, List<List<int[]>> groups) {',
    '        int[][] dp = new int[numGroups + 1][m + 1];',
    '        for (int g = 1; g <= numGroups; g++) {',
    '            for (int j = 0; j <= m; j++) {',
    '                dp[g][j] = dp[g - 1][j];',
    '                for (int[] item : groups.get(g - 1)) {',
    '                    int cost = item[0], val = item[1];',
    '                    if (j >= cost) {',
    '                        dp[g][j] = Math.max(dp[g][j], dp[g - 1][j - cost] + val);',
    '                    }',
    '                }',
    '            }',
    '        }',
    '        return dp[numGroups][m];',
    '    }',
    '}',
  ],
  python: [
    'def partitioned_knapsack_2d(m: int, groups: list[list[dict]]) -> int:',
    '    """阶段 3: 严格二维动态规划分组背包"""',
    '    num_groups = len(groups)',
    '    dp = [[0] * (m + 1) for _ in range(num_groups + 1)]',
    '    for g in range(1, num_groups + 1):',
    '        for j in range(m + 1):',
    '            dp[g][j] = dp[g - 1][j]',
    '            for item in groups[g - 1]:',
    '                if j >= item["cost"]:',
    '                    dp[g][j] = max(dp[g][j], dp[g - 1][j - item["cost"]] + item["val"])',
    '    return dp[num_groups][m]',
  ],
  javascript: [
    '// 阶段 3: 严格二维动态规划分组背包',
    'export function partitionedKnapsack2D(m, groups) {',
    '  const numGroups = groups.length;',
    '  const dp = Array.from({ length: numGroups + 1 }, () => new Array(m + 1).fill(0));',
    '  for (let g = 1; g <= numGroups; g++) {',
    '    for (let j = 0; j <= m; j++) {',
    '      dp[g][j] = dp[g - 1][j];',
    '      for (const item of groups[g - 1]) {',
    '        if (j >= item.cost) {',
    '          dp[g][j] = Math.max(dp[g][j], dp[g - 1][j - item.cost] + item.val);',
    '        }',
    '      }',
    '    }',
    '  }',
    '  return dp[numGroups][m];',
    '}',
  ],
};

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

export const COINS_FROM_PILES_STAGE1_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 阶段 1: 暴力递归 - 深度优先尝试每个栈拿 0..c 枚硬币',
    'int dfs(int i, int remK, const vector<vector<int>>& piles) { // @step:callRoot @step:fnEnter',
    '    if (i == piles.size() || remK == 0) return 0; // @step:baseCheck',
    '    // 分支 0: 当前栈拿 0 枚',
    '    int maxVal = dfs(i + 1, remK, piles); // @step:branch0',
    '    // 分支 c: 当前栈从顶向下连续拿 c 枚',
    '    int sum = 0;',
    '    int t = min((int)piles[i].size(), remK);',
    '    for (int c = 1; c <= t; ++c) { // @step:loopCoins',
    '        sum += piles[i][c - 1];',
    '        maxVal = max(maxVal, dfs(i + 1, remK - c, piles) + sum);',
    '    }',
    '    return maxVal; // @step:returnMax',
    '}',
  ],
  java: [
    'package class074;',
    '',
    'import java.util.List;',
    '',
    '// 阶段 1: 暴力递归',
    'public class Code02_CoinsFromPilesStage1 {',
    '    public static int dfs(int i, int remK, List<List<Integer>> piles) { // @step:callRoot @step:fnEnter',
    '        if (i == piles.size() || remK == 0) return 0; // @step:baseCheck',
    '        int maxVal = dfs(i + 1, remK, piles); // @step:branch0',
    '        int sum = 0;',
    '        int t = Math.min(piles.get(i).size(), remK);',
    '        for (int c = 1; c <= t; c++) { // @step:loopCoins',
    '            sum += piles.get(i).get(c - 1);',
    '            maxVal = Math.max(maxVal, dfs(i + 1, remK - c, piles) + sum);',
    '        }',
    '        return maxVal; // @step:returnMax',
    '    }',
    '}',
  ],
  python: [
    'def dfs_coins(i: int, rem_k: int, piles: list[list[int]]) -> int: # @step:callRoot @step:fnEnter',
    '    """阶段 1: 暴力递归"""',
    '    if i == len(piles) or rem_k == 0: # @step:baseCheck',
    '        return 0',
    '    max_val = dfs_coins(i + 1, rem_k, piles) # @step:branch0',
    '    s = 0',
    '    t = min(len(piles[i]), rem_k)',
    '    for c in range(1, t + 1): # @step:loopCoins',
    '        s += piles[i][c - 1]',
    '        max_val = max(max_val, dfs_coins(i + 1, rem_k - c, piles) + s)',
    '    return max_val # @step:returnMax',
  ],
  javascript: [
    '// 阶段 1: 暴力递归',
    'export function dfsCoins(i, remK, piles) { // @step:callRoot @step:fnEnter',
    '  if (i === piles.length || remK === 0) return 0; // @step:baseCheck',
    '  let maxVal = dfsCoins(i + 1, remK, piles); // @step:branch0',
    '  let sum = 0;',
    '  const t = Math.min(piles[i].length, remK);',
    '  for (let c = 1; c <= t; c++) { // @step:loopCoins',
    '    sum += piles[i][c - 1];',
    '    maxVal = Math.max(maxVal, dfsCoins(i + 1, remK - c, piles) + sum);',
    '  }',
    '  return maxVal; // @step:returnMax',
    '}',
  ],
};

export const COINS_FROM_PILES_STAGE2_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 阶段 2: 记忆化搜索 memo[i][remK]',
    'int dfsMemo(int i, int remK, const vector<vector<int>>& piles, vector<vector<int>>& memo) { // @step:callRoot @step:fnEnter',
    '    if (i == piles.size() || remK == 0) return 0; // @step:baseCheck',
    '    if (memo[i][remK] != -1) return memo[i][remK]; // 命中缓存 // @step:memoCheck',
    '    int maxVal = dfsMemo(i + 1, remK, piles, memo);',
    '    int sum = 0;',
    '    int t = min((int)piles[i].size(), remK);',
    '    for (int c = 1; c <= t; ++c) { // @step:loopCoins',
    '        sum += piles[i][c - 1];',
    '        maxVal = max(maxVal, dfsMemo(i + 1, remK - c, piles, memo) + sum);',
    '    }',
    '    return memo[i][remK] = maxVal; // @step:memoStore',
    '}',
  ],
  java: [
    'package class074;',
    '',
    'import java.util.List;',
    '',
    '// 阶段 2: 记忆化搜索',
    'public class Code02_CoinsFromPilesStage2 {',
    '    public static int dfsMemo(int i, int remK, List<List<Integer>> piles, int[][] memo) { // @step:callRoot @step:fnEnter',
    '        if (i == piles.size() || remK == 0) return 0; // @step:baseCheck',
    '        if (memo[i][remK] != -1) return memo[i][remK]; // @step:memoCheck',
    '        int maxVal = dfsMemo(i + 1, remK, piles, memo);',
    '        int sum = 0;',
    '        int t = Math.min(piles.get(i).size(), remK);',
    '        for (int c = 1; c <= t; c++) { // @step:loopCoins',
    '            sum += piles.get(i).get(c - 1);',
    '            maxVal = Math.max(maxVal, dfsMemo(i + 1, remK - c, piles, memo) + sum);',
    '        }',
    '        return memo[i][remK] = maxVal; // @step:memoStore',
    '    }',
    '}',
  ],
  python: [
    'def coins_memo(piles: list[list[int]], k: int) -> int: # @step:callRoot @step:fnEnter',
    '    """阶段 2: 记忆化搜索"""',
    '    memo = [[-1] * (k + 1) for _ in range(len(piles))]',
    '    def dfs(i: int, rem_k: int) -> int:',
    '        if i == len(piles) or rem_k == 0: # @step:baseCheck',
    '            return 0',
    '        if memo[i][rem_k] != -1: # @step:memoCheck',
    '            return memo[i][rem_k] # @step:memoStore',
    '        res = dfs(i + 1, rem_k) # @step:branch0',
    '        s = 0',
    '        t = min(len(piles[i]), rem_k)',
    '        for c in range(1, t + 1): # @step:loopCoins',
    '            s += piles[i][c - 1]',
    '            res = max(res, dfs(i + 1, rem_k - c) + s)',
    '        memo[i][rem_k] = res # @step:memoStore',
    '        return res',
    '    return dfs(0, k)',
  ],
  javascript: [
    '// 阶段 2: 记忆化搜索',
    'export function coinsMemo(piles, k) { // @step:callRoot @step:fnEnter',
    '  const memo = Array.from({ length: piles.length }, () => new Array(k + 1).fill(-1));',
    '  function dfs(i, remK) {',
    '    if (i === piles.length || remK === 0) return 0; // @step:baseCheck',
    '    if (memo[i][remK] !== -1) return memo[i][remK]; // @step:memoCheck',
    '    let res = dfs(i + 1, remK); // @step:branch0',
    '    let s = 0;',
    '    const t = Math.min(piles[i].length, remK);',
    '    for (let c = 1; c <= t; c++) { // @step:loopCoins',
    '      s += piles[i][c - 1];',
    '      res = Math.max(res, dfs(i + 1, remK - c) + s);',
    '    }',
    '    return (memo[i][remK] = res); // @step:memoStore',
    '  }',
    '  return dfs(0, k);',
    '}',
  ],
};

export const COINS_FROM_PILES_STAGE3_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 阶段 3: 严格二维动态规划 dp[i][j]',
    'int maxValueOfCoins2D(vector<vector<int>>& piles, int k) {',
    '    int n = piles.size();',
    '    vector<vector<int>> dp(n + 1, vector<int>(k + 1, 0)); // @step:initDp',
    '    for (int i = 1; i <= n; ++i) { // @step:outerLoop',
    '        int t = min((int)piles[i - 1].size(), k);',
    '        vector<int> preSum(t + 1, 0);',
    '        for (int p = 0; p < t; ++p) preSum[p + 1] = preSum[p] + piles[i - 1][p];',
    '        for (int j = 0; j <= k; ++j) { // @step:innerCap',
    '            dp[i][j] = dp[i - 1][j]; // 拿 0 枚 // @step:transition',
    '            for (int c = 1; c <= min(t, j); ++c) {',
    '                dp[i][j] = max(dp[i][j], dp[i - 1][j - c] + preSum[c]);',
    '            }',
    '        }',
    '    }',
    '    return dp[n][k]; // @step:returnAns',
    '}',
  ],
  java: [
    'package class074;',
    '',
    'import java.util.List;',
    '',
    '// 阶段 3: 二维动态规划',
    'public class Code02_CoinsFromPilesStage3 {',
    '    public static int maxValueOfCoins2D(List<List<Integer>> piles, int k) {',
    '        int n = piles.size();',
    '        int[][] dp = new int[n + 1][k + 1]; // @step:initDp',
    '        for (int i = 1; i <= n; i++) { // @step:outerLoop',
    '            int t = Math.min(piles.get(i - 1).size(), k);',
    '            int[] preSum = new int[t + 1];',
    '            for (int p = 0; p < t; p++) preSum[p + 1] = preSum[p] + piles.get(i - 1).get(p);',
    '            for (int j = 0; j <= k; j++) { // @step:innerCap',
    '                dp[i][j] = dp[i - 1][j]; // @step:transition',
    '                for (int c = 1; c <= Math.min(t, j); c++) {',
    '                    dp[i][j] = Math.max(dp[i][j], dp[i - 1][j - c] + preSum[c]);',
    '                }',
    '            }',
    '        }',
    '        return dp[n][k]; // @step:returnAns',
    '    }',
    '}',
  ],
  python: [
    'def coins_2d(piles: list[list[int]], k: int) -> int:',
    '    """阶段 3: 二维动态规划"""',
    '    n = len(piles)',
    '    dp = [[0] * (k + 1) for _ in range(n + 1)] # @step:initDp',
    '    for i in range(1, n + 1): # @step:outerLoop',
    '        t = min(len(piles[i - 1]), k)',
    '        pre_sum = [0] * (t + 1)',
    '        for p in range(t):',
    '            pre_sum[p + 1] = pre_sum[p] + piles[i - 1][p]',
    '        for j in range(k + 1): # @step:innerCap',
    '            dp[i][j] = dp[i - 1][j] # @step:transition',
    '            for c in range(1, min(t, j) + 1):',
    '                dp[i][j] = max(dp[i][j], dp[i - 1][j - c] + pre_sum[c])',
    '    return dp[n][k] # @step:returnAns',
  ],
  javascript: [
    '// 阶段 3: 二维动态规划',
    'export function coins2D(piles, k) {',
    '  const n = piles.length;',
    '  const dp = Array.from({ length: n + 1 }, () => new Array(k + 1).fill(0)); // @step:initDp',
    '  for (let i = 1; i <= n; i++) { // @step:outerLoop',
    '    const t = Math.min(piles[i - 1].length, k);',
    '    const preSum = new Array(t + 1).fill(0);',
    '    for (let p = 0; p < t; p++) preSum[p + 1] = preSum[p] + piles[i - 1][p];',
    '    for (let j = 0; j <= k; j++) { // @step:innerCap',
    '      dp[i][j] = dp[i - 1][j]; // @step:transition',
    '      for (let c = 1; c <= Math.min(t, j); c++) {',
    '        dp[i][j] = Math.max(dp[i][j], dp[i - 1][j - c] + preSum[c]);',
    '      }',
    '    }',
    '  }',
    '  return dp[n][k]; // @step:returnAns',
    '}',
  ],
};

// ==========================================
// 3. Code03_UnboundedKnapsack 完全背包模版
// ==========================================
export const UNBOUNDED_KNAPSACK_PROBLEM_HTML = `
<div class="problem-description">
  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
    <h3 style="margin: 0; color: #f8fafc; font-size: 16px;">完全背包模版 (洛谷 P1616 疯狂的采药)</h3>
    <span style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">洛谷 普及+/提高</span>
  </div>

  <div style="margin-bottom: 14px;">
    <h4 style="color: #38bdf8; font-size: 13px; margin: 0 0 6px 0;">📜 题目背景与描述</h4>
    <p style="margin: 0 0 8px 0;">辰辰是个天资聪颖的孩子，他的梦想是成为世界上最伟大的医师。在完成了上次采药的试炼后，医师带他来到药草更加丰富的大峡谷。</p>
    <p style="margin: 0 0 8px 0;">在规定的总时间 <code>T</code> 内，山谷里生长着 <code>M</code> 种不同药效的草药。与普通 01 采药试炼不同的是：<strong>这里的每种草药储量极大，可以无限制地采摘任意多次（0 次、1 次、2 次……直至耗尽背包时间）！</strong></p>
    <p style="margin: 0;">采摘第 <code>i</code> 种草药需要花费采摘时间 <code>costs[i]</code>，同时获得草药价值 <code>values[i]</code>。请帮辰辰计算，在不超过总时间 <code>T</code> 的前提下，能够采摘到的草药的最大总价值。</p>
  </div>

  <div style="margin-bottom: 14px; background: rgba(30, 41, 59, 0.5); border: 1px solid #334155; border-radius: 6px; padding: 10px 12px;">
    <h4 style="color: #38bdf8; font-size: 13px; margin: 0 0 6px 0;">📥 输入格式规范</h4>
    <p style="margin: 0 0 4px 0;">第一行输入两个正整数 <code>T</code> 和 <code>M</code>，分别表示采药的总时间限制和山谷中药草的种类数。</p>
    <p style="margin: 0;">接下来的 <code>M</code> 行，每行包含两个正整数，第 <code>i</code> 行的两个数分别表示采摘第 <code>i</code> 种药草的时间 <code>costs[i]</code> 和该草药的价值 <code>values[i]</code>。</p>
  </div>

  <div style="margin-bottom: 14px; background: rgba(30, 41, 59, 0.5); border: 1px solid #334155; border-radius: 6px; padding: 10px 12px;">
    <h4 style="color: #38bdf8; font-size: 13px; margin: 0 0 6px 0;">📤 输出格式规范</h4>
    <p style="margin: 0;">输出一个整数，表示在规定的时间 <code>T</code> 内可以采到的草药的最大总价值。</p>
  </div>

  <div style="margin-bottom: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
    <div style="background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 10px;">
      <div style="color: #94a3b8; font-size: 12px; font-weight: 600; margin-bottom: 4px;">输入样例 1</div>
      <pre style="margin: 0; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #f1f5f9; background: transparent; padding: 0;">70 3
71 100
69 1
1 2</pre>
    </div>
    <div style="background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 10px;">
      <div style="color: #94a3b8; font-size: 12px; font-weight: 600; margin-bottom: 4px;">输出样例 1</div>
      <pre style="margin: 0; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #34d399; font-weight: 700; background: transparent; padding: 0;">140</pre>
      <div style="margin-top: 6px; font-size: 11px; color: #94a3b8;">说明：第 3 种草药耗时 1、价值 2，采摘 70 次获得最大价值 70 &times; 2 = 140。</div>
    </div>
  </div>

  <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; padding: 10px 12px; margin-bottom: 12px;">
    <div style="color: #f87171; font-weight: 700; font-size: 12px; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
      <span>⚠️ 考点与数据规模约定 (大厂/竞赛核心避坑项)</span>
    </div>
    <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #cbd5e1; line-height: 1.6;">
      <li>对于 100% 的数据：<code>1 &le; T &le; 10^7</code>，<code>1 &le; M &le; 10^4</code>，草药耗时与价值 <code>costs[i], values[i] &le; 10^4</code>。</li>
      <li><strong>64 位整型溢出陷阱</strong>：理论最大总价值可达 <code>10^7 &times; 10^4 = 10^{11}</code>，远超 32 位 signed int 上界（约 <code>2.14 &times; 10^9</code>）。因此 <strong>DP 数组与最大价值累加器必须采用 64 位整数（C++ long long / Java long）</strong>，否则在平台测评时会因数值溢出直接爆负数判定为 WA！</li>
    </ul>
  </div>

  <div style="font-size: 12px;">
    <strong>测试链接：</strong>
    <a href="https://www.luogu.com.cn/problem/P1616" target="_blank" style="color: #60a5fa; text-decoration: underline;">洛谷 P1616 疯狂的采药</a>
  </div>
</div>
`;

export const UNBOUNDED_KNAPSACK_ANALYSIS_HTML = `
<div class="problem-analysis">
  <div style="margin-bottom: 14px;">
    <h4 style="color: #34d399; font-size: 14px; margin: 0 0 6px 0;">🎯 核心机制：从 01 背包逆序到完全背包正序的数学逆转</h4>
    <p style="margin: 0; color: #cbd5e1;">完全背包与 01 背包在模型上的唯一区别是<strong>物品是否可以无限制地重复选取</strong>。然而在空间压缩为一维数组后，循环遍历方向发生根本性转变：从“倒序防重”变成了“正序叠加”。</p>
  </div>

  <div style="display: flex; flex-direction: column; gap: 14px;">
    <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid #334155; border-radius: 6px; padding: 12px;">
      <div style="font-weight: 700; color: #38bdf8; margin-bottom: 6px;">1. 状态定义与二维原始方程推导</div>
      <p style="margin: 0 0 6px 0;">设 <code>dp[i][j]</code> 为：仅考虑前 <code>i</code> 种草药，在时间预算不超过 <code>j</code> 时的最大总价值。</p>
      <ul style="margin: 0; padding-left: 18px; color: #cbd5e1; line-height: 1.6;">
        <li><strong>不采摘第 <code>i</code> 种草药</strong>：完全继承前 <code>i - 1</code> 种草药在容量 <code>j</code> 下的最优决策，即 <code>dp[i - 1][j]</code>；</li>
        <li><strong>采摘至少 1 次第 <code>i</code> 种草药</strong>：付出 <code>costs[i]</code> 的时间代价换取 <code>values[i]</code> 的价值回报。<strong>关键差异点</strong>：由于该草药之后仍允许继续采摘，剩余可用时间 <code>j - costs[i]</code> 依然停留在第 <code>i</code> 层继续递归决策，即 <code>dp[i][j - costs[i]] + values[i]</code>！</li>
      </ul>
      <div style="margin-top: 8px; background: #0f172a; padding: 8px 12px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; color: #34d399; font-size: 12px;">
dp[i][j] = max(dp[i - 1][j], dp[i][j - costs[i]] + values[i])
      </div>
      <p style="margin: 6px 0 0 0; font-size: 12px; color: #f59e0b;">
        🔍 <strong>对照 01 背包</strong>：01 背包第二项为 <code>dp[i - 1][j - costs[i]]</code>（下标为 <code>i - 1</code>），而完全背包第二项为 <code>dp[i][j - costs[i]]</code>（下标为 <code>i</code>），这就是无限复选的数学根源！
      </p>
    </div>

    <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid #334155; border-radius: 6px; padding: 12px;">
      <div style="font-weight: 700; color: #a78bfa; margin-bottom: 6px;">2. 空间压缩魔法：为什么容量 j 必须正序遍历？</div>
      <p style="margin: 0 0 6px 0;">当我们把二维表 <code>dp[i][j]</code> 压缩为一维滚动数组 <code>dp[j]</code> 时：</p>
      <ul style="margin: 0; padding-left: 18px; color: #cbd5e1; line-height: 1.6;">
        <li><strong>在 01 背包中</strong>：我们必须<strong>从大到小倒序更新</strong>（<code>j = T downTo costs[i]</code>），目的就是防止更新 <code>dp[j]</code> 时用到的 <code>dp[j - costs[i]]</code> 已经在这一轮被篡改过，保证每件物品至多生效 1 次；</li>
        <li><strong>在完全背包中</strong>：我们恰恰需要<strong>从小到大正序更新</strong>（<code>j = costs[i] to T</code>）！当遍历到较大的 <code>j</code> 时，前面较小容量 <code>j - costs[i]</code> 已经写入了“本轮纳入第 <code>i</code> 种草药后的最新更优解”，从而自动实现了 <strong>1 次、2 次、3 次乃至无限次同种草药的滚雪球累加</strong>！</li>
      </ul>
      <div style="margin-top: 8px; background: #0f172a; padding: 8px 12px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; color: #f1f5f9; font-size: 12px;">
for (int i = 0; i &lt; M; ++i) {
    for (int j = costs[i]; j &lt;= T; ++j) { // 正序从小到大遍历！
        dp[j] = max(dp[j], dp[j - costs[i]] + values[i]);
    }
}
      </div>
    </div>

    <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid #334155; border-radius: 6px; padding: 12px;">
      <div style="font-weight: 700; color: #f59e0b; margin-bottom: 6px;">3. 算法复杂度与工程性能</div>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid #334155; color: #94a3b8;">
            <th style="padding: 6px 8px;">考量维度</th>
            <th style="padding: 6px 8px;">理论复杂度</th>
            <th style="padding: 6px 8px;">底层原理剖析</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid rgba(51, 65, 85, 0.5);">
            <td style="padding: 6px 8px; color: #38bdf8;">时间复杂度</td>
            <td style="padding: 6px 8px; font-family: 'JetBrains Mono', monospace; color: #34d399;">O(M &times; T)</td>
            <td style="padding: 6px 8px; color: #cbd5e1;">外层循环遍历 M 种草药，内层遍历总容量 T。状态转移为 O(1) 代数比较。</td>
          </tr>
          <tr>
            <td style="padding: 6px 8px; color: #38bdf8;">空间复杂度</td>
            <td style="padding: 6px 8px; font-family: 'JetBrains Mono', monospace; color: #34d399;">O(T)</td>
            <td style="padding: 6px 8px; color: #cbd5e1;">仅需维护一维大小为 T + 1 的收益向量，完全消除 M &times; T 的巨额二维内存开销。</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
`;

export const UNBOUNDED_KNAPSACK_STAGE1_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 阶段 1: 暴力递归完全背包',
    '// 每种草药可选无限次：若选当前草药，停留在第 i 种继续选；若不选，跳到第 i + 1 种',
    'long long dfs(int i, int remCap, int m, const vector<int>& cost, const vector<int>& val) {',
    '    if (i >= m || remCap <= 0) return 0;',
    '    // 分支 1: 不选当前草药，考察下一个物种',
    '    long long p1 = dfs(i + 1, remCap, m, cost, val);',
    '    // 分支 2: 选入当前草药，容量扣减，依然停留在第 i 种（支持无限次累选）',
    '    long long p2 = 0;',
    '    if (remCap >= cost[i]) {',
    '        p2 = dfs(i, remCap - cost[i], m, cost, val) + val[i];',
    '    }',
    '    return max(p1, p2);',
    '}',
  ],
  java: [
    'package class074;',
    '',
    '// 阶段 1: 暴力递归完全背包',
    'public class Code03_UnboundedKnapsackStage1 {',
    '    public static long compute(int t, int m, int[] cost, int[] val) {',
    '        return dfs(0, t, m, cost, val);',
    '    }',
    '    private static long dfs(int i, int remCap, int m, int[] cost, int[] val) {',
    '        if (i >= m || remCap <= 0) return 0;',
    '        long p1 = dfs(i + 1, remCap, m, cost, val);',
    '        long p2 = 0;',
    '        if (remCap >= cost[i]) {',
    '            p2 = dfs(i, remCap - cost[i], m, cost, val) + val[i];',
    '        }',
    '        return Math.max(p1, p2);',
    '    }',
    '}',
  ],
  python: [
    'def dfs_unbounded(i: int, rem_cap: int, cost: list[int], val: list[int]) -> int:',
    '    """阶段 1: 暴力递归完全背包"""',
    '    if i >= len(cost) or rem_cap <= 0:',
    '        return 0',
    '    p1 = dfs_unbounded(i + 1, rem_cap, cost, val)',
    '    p2 = 0',
    '    if rem_cap >= cost[i]:',
    '        p2 = dfs_unbounded(i, rem_cap - cost[i], cost, val) + val[i]',
    '    return max(p1, p2)',
  ],
  javascript: [
    '// 阶段 1: 暴力递归完全背包',
    'export function dfsUnbounded(i, remCap, cost, val) {',
    '  if (i >= cost.length || remCap <= 0) return 0;',
    '  const p1 = dfsUnbounded(i + 1, remCap, cost, val);',
    '  let p2 = 0;',
    '  if (remCap >= cost[i]) {',
    '    p2 = dfsUnbounded(i, remCap - cost[i], cost, val) + val[i];',
    '  }',
    '  return Math.max(p1, p2);',
    '}',
  ],
};

export const UNBOUNDED_KNAPSACK_STAGE2_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 阶段 2: 记忆化搜索完全背包 memo[i][remCap]',
    'long long dfsMemo(int i, int remCap, int m, const vector<int>& cost, const vector<int>& val, vector<vector<long long>>& memo) {',
    '    if (i >= m || remCap <= 0) return 0;',
    '    if (memo[i][remCap] != -1) return memo[i][remCap]; // 命中缓存',
    '    long long p1 = dfsMemo(i + 1, remCap, m, cost, val, memo);',
    '    long long p2 = 0;',
    '    if (remCap >= cost[i]) {',
    '        p2 = dfsMemo(i, remCap - cost[i], m, cost, val, memo) + val[i];',
    '    }',
    '    return memo[i][remCap] = max(p1, p2);',
    '}',
  ],
  java: [
    'package class074;',
    '',
    'import java.util.Arrays;',
    '',
    '// 阶段 2: 记忆化搜索完全背包',
    'public class Code03_UnboundedKnapsackStage2 {',
    '    public static long compute(int t, int m, int[] cost, int[] val) {',
    '        long[][] memo = new long[m][t + 1];',
    '        for (long[] row : memo) Arrays.fill(row, -1);',
    '        return dfsMemo(0, t, m, cost, val, memo);',
    '    }',
    '    private static long dfsMemo(int i, int remCap, int m, int[] cost, int[] val, long[][] memo) {',
    '        if (i >= m || remCap <= 0) return 0;',
    '        if (memo[i][remCap] != -1) return memo[i][remCap];',
    '        long p1 = dfsMemo(i + 1, remCap, m, cost, val, memo);',
    '        long p2 = 0;',
    '        if (remCap >= cost[i]) {',
    '            p2 = dfsMemo(i, remCap - cost[i], m, cost, val, memo) + val[i];',
    '        }',
    '        return memo[i][remCap] = Math.max(p1, p2);',
    '    }',
    '}',
  ],
  python: [
    'def unbounded_knapsack_memo(t: int, m: int, cost: list[int], val: list[int]) -> int:',
    '    """阶段 2: 记忆化搜索完全背包"""',
    '    memo = [[-1] * (t + 1) for _ in range(m)]',
    '    def dfs(i: int, rem_cap: int) -> int:',
    '        if i >= m or rem_cap <= 0:',
    '            return 0',
    '        if memo[i][rem_cap] != -1:',
    '            return memo[i][rem_cap]',
    '        p1 = dfs(i + 1, rem_cap)',
    '        p2 = dfs(i, rem_cap - cost[i]) + val[i] if rem_cap >= cost[i] else 0',
    '        memo[i][rem_cap] = max(p1, p2)',
    '        return memo[i][rem_cap]',
    '    return dfs(0, t)',
  ],
  javascript: [
    '// 阶段 2: 记忆化搜索完全背包',
    'export function unboundedKnapsackMemo(t, m, cost, val) {',
    '  const memo = Array.from({ length: m }, () => new Array(t + 1).fill(-1));',
    '  function dfs(i, remCap) {',
    '    if (i >= m || remCap <= 0) return 0;',
    '    if (memo[i][remCap] !== -1) return memo[i][remCap];',
    '    const p1 = dfs(i + 1, remCap);',
    '    const p2 = remCap >= cost[i] ? dfs(i, remCap - cost[i]) + val[i] : 0;',
    '    return (memo[i][remCap] = Math.max(p1, p2));',
    '  }',
    '  return dfs(0, t);',
    '}',
  ],
};

export const UNBOUNDED_KNAPSACK_STAGE3_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 阶段 3: 严格二维动态规划完全背包',
    '// dp[i][j]: 前 i 种草药在容量不超过 j 时的最大收益',
    'long long unboundedKnapsack2D(int t, int m, const vector<int>& cost, const vector<int>& val) {',
    '    vector<vector<long long>> dp(m + 1, vector<long long>(t + 1, 0));',
    '    for (int i = 1; i <= m; ++i) {',
    '        for (int j = 0; j <= t; ++j) {',
    '            // 不选当前草药: 继承上一行',
    '            dp[i][j] = dp[i - 1][j]; // @step:transition',
    '            // 选入当前草药: 依赖【当前行】左侧 (支持同种草药无限次累加)',
    '            if (j >= cost[i - 1]) {',
    '                dp[i][j] = max(dp[i][j], dp[i][j - cost[i - 1]] + val[i - 1]);',
    '            }',
    '        }',
    '    }',
    '    return dp[m][t];',
    '}',
  ],
  java: [
    'package class074;',
    '',
    '// 阶段 3: 严格二维动态规划完全背包',
    'public class Code03_UnboundedKnapsackStage3 {',
    '    public static long compute(int t, int m, int[] cost, int[] val) {',
    '        long[][] dp = new long[m + 1][t + 1];',
    '        for (int i = 1; i <= m; i++) {',
    '            for (int j = 0; j <= t; j++) {',
    '                dp[i][j] = dp[i - 1][j]; // @step:transition',
    '                if (j >= cost[i - 1]) {',
    '                    dp[i][j] = Math.max(dp[i][j], dp[i][j - cost[i - 1]] + val[i - 1]);',
    '                }',
    '            }',
    '        }',
    '        return dp[m][t];',
    '    }',
    '}',
  ],
  python: [
    'def unbounded_knapsack_2d(t: int, m: int, cost: list[int], val: list[int]) -> int:',
    '    """阶段 3: 二维动态规划完全背包"""',
    '    dp = [[0] * (t + 1) for _ in range(m + 1)]',
    '    for i in range(1, m + 1):',
    '        for j in range(t + 1):',
    '            dp[i][j] = dp[i - 1][j] # @step:transition',
    '            if j >= cost[i - 1]:',
    '                dp[i][j] = max(dp[i][j], dp[i][j - cost[i - 1]] + val[i - 1])',
    '    return dp[m][t]',
  ],
  javascript: [
    '// 阶段 3: 二维动态规划完全背包',
    'export function unboundedKnapsack2D(t, m, cost, val) {',
    '  const dp = Array.from({ length: m + 1 }, () => new Array(t + 1).fill(0));',
    '  for (let i = 1; i <= m; i++) {',
    '    for (let j = 0; j <= t; j++) {',
    '      dp[i][j] = dp[i - 1][j]; // @step:transition',
    '      if (j >= cost[i - 1]) {',
    '        dp[i][j] = Math.max(dp[i][j], dp[i][j - cost[i - 1]] + val[i - 1]);',
    '      }',
    '    }',
    '  }',
    '  return dp[m][t];',
    '}',
  ],
};

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

export const REGEX_MATCHING_STAGE1_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    '// 阶段 1: 暴力递归',
    'public static boolean isMatch(String s, String p) {',
    '    return dfs(s.toCharArray(), p.toCharArray(), 0, 0);',
    '}',
    'private static boolean dfs(char[] s, char[] p, int i, int j) {',
    '    if (j == p.length) return i == s.length;',
    '    boolean first = i < s.length && (s[i] == p[j] || p[j] == \'.\');',
    '    if (j + 1 < p.length && p[j + 1] == \'*\') {',
    '        return dfs(s, p, i, j + 2) // 分支 0: * 匹配 0 次',
    '            || (first && dfs(s, p, i + 1, j)); // 分支 1: * 匹配 >= 1 次',
    '    }',
    '    return first && dfs(s, p, i + 1, j + 1); // 普通单字符匹配',
    '}',
  ],
  cpp: [
    '// 阶段 1: 暴力递归',
    'bool isMatch(string s, string p) {',
    '    return dfs(s, p, 0, 0);',
    '}',
    'bool dfs(const string& s, const string& p, int i, int j) {',
    '    if (j == p.length()) return i == s.length();',
    '    bool first = i < s.length() && (s[i] == p[j] || p[j] == \'.\');',
    '    if (j + 1 < p.length() && p[j + 1] == \'*\') {',
    '        return dfs(s, p, i, j + 2) // 分支 0: * 匹配 0 次',
    '            || (first && dfs(s, p, i + 1, j)); // 分支 1: * 匹配 >= 1 次',
    '    }',
    '    return first && dfs(s, p, i + 1, j + 1); // 普通单字符匹配',
    '}',
  ],
  python: [
    '# 阶段 1: 暴力递归',
    'def is_match_stage1(s: str, p: str) -> bool:',
    '    return dfs(s, p, 0, 0)',
    '# end is_match',
    'def dfs(s: str, p: str, i: int, j: int) -> bool:',
    '    if j == len(p): return i == len(s)',
    '    first = i < len(s) and (s[i] == p[j] or p[j] == ".")',
    '    if j + 1 < len(p) and p[j + 1] == "*":',
    '        return dfs(s, p, i, j + 2) \\',
    '            or (first and dfs(s, p, i + 1, j)) # 分支 0 / 1',
    '    # end if',
    '    return first and dfs(s, p, i + 1, j + 1) # 普通单字符匹配',
    '# end dfs',
  ],
  javascript: [
    '// 阶段 1: 暴力递归',
    'export function isMatchStage1(s, p) {',
    '  return dfs(s, p, 0, 0);',
    '}',
    'function dfs(s, p, i, j) {',
    '  if (j === p.length) return i === s.length;',
    '  const first = i < s.length && (s[i] === p[j] || p[j] === ".");',
    '  if (j + 1 < p.length && p[j + 1] === "*") {',
    '    return dfs(s, p, i, j + 2) // 分支 0: * 匹配 0 次',
    '        || (first && dfs(s, p, i + 1, j)); // 分支 1: * 匹配 >= 1 次',
    '  }',
    '  return first && dfs(s, p, i + 1, j + 1); // 普通单字符匹配',
    '}',
  ],
};

export const REGEX_MATCHING_STAGE2_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <string>',
    '#include <vector>',
    'using namespace std;',
    '',
    '// 阶段 2: 记忆化搜索 memo[i][j]',
    'bool dfsMemo(const string& s, const string& p, int i, int j, vector<vector<int>>& memo) {',
    '    if (memo[i][j] != -1) return memo[i][j] == 1;',
    '    if (j == p.length()) {',
    '        memo[i][j] = (i == s.length()) ? 1 : 0;',
    '        return memo[i][j] == 1;',
    '    }',
    '    bool first = i < s.length() && (s[i] == p[j] || p[j] == \'.\');',
    '    bool ans;',
    '    if (j + 1 < p.length() && p[j + 1] == \'*\') {',
    '        ans = dfsMemo(s, p, i, j + 2, memo) || (first && dfsMemo(s, p, i + 1, j, memo));',
    '    } else {',
    '        ans = first && dfsMemo(s, p, i + 1, j + 1, memo);',
    '    }',
    '    memo[i][j] = ans ? 1 : 0;',
    '    return ans;',
    '}',
  ],
  java: [
    'package class074;',
    '',
    '// 阶段 2: 记忆化搜索',
    'public class Code04_RegexStage2 {',
    '    public static boolean isMatch(String str, String pat) {',
    '        char[] s = str.toCharArray();',
    '        char[] p = pat.toCharArray();',
    '        int[][] memo = new int[s.length + 1][p.length + 1];',
    '        return dfsMemo(s, p, 0, 0, memo);',
    '    }',
    '',
    '    public static boolean dfsMemo(char[] s, char[] p, int i, int j, int[][] memo) {',
    '        if (memo[i][j] != 0) return memo[i][j] == 2;',
    '        if (j == p.length) {',
    '            memo[i][j] = (i == s.length) ? 2 : 1;',
    '            return memo[i][j] == 2;',
    '        }',
    '        boolean first = i < s.length && (s[i] == p[j] || p[j] == \'.\');',
    '        boolean ans;',
    '        if (j + 1 < p.length && p[j + 1] == \'*\') {',
    '            ans = dfsMemo(s, p, i, j + 2, memo) || (first && dfsMemo(s, p, i + 1, j, memo));',
    '        } else {',
    '            ans = first && dfsMemo(s, p, i + 1, j + 1, memo);',
    '        }',
    '        memo[i][j] = ans ? 2 : 1;',
    '        return ans;',
    '    }',
    '}',
  ],
  python: [
    'def is_match_stage2(s: str, p: str) -> bool:',
    '    """阶段 2: 记忆化搜索"""',
    '    memo = [[-1] * (len(p) + 1) for _ in range(len(s) + 1)]',
    '    def dfs(i: int, j: int) -> bool:',
    '        if memo[i][j] != -1:',
    '            return memo[i][j] == 1',
    '        if j == len(p):',
    '            memo[i][j] = 1 if i == len(s) else 0',
    '            return memo[i][j] == 1',
    '        first = i < len(s) and (s[i] == p[j] or p[j] == ".")',
    '        if j + 1 < len(p) and p[j + 1] == "*":',
    '            ans = dfs(i, j + 2) or (first and dfs(i + 1, j))',
    '        else:',
    '            ans = first and dfs(i + 1, j + 1)',
    '        memo[i][j] = 1 if ans else 0',
    '        return ans',
    '    return dfs(0, 0)',
  ],
  javascript: [
    '// 阶段 2: 记忆化搜索',
    'export function isMatchStage2(s, p) {',
    '  const memo = Array.from({ length: s.length + 1 }, () => new Array(p.length + 1).fill(-1));',
    '  function dfs(i, j) {',
    '    if (memo[i][j] !== -1) return memo[i][j] === 1;',
    '    if (j === p.length) {',
    '      memo[i][j] = i === s.length ? 1 : 0;',
    '      return memo[i][j] === 1;',
    '    }',
    '    const first = i < s.length && (s[i] === p[j] || p[j] === ".");',
    '    let ans = false;',
    '    if (j + 1 < p.length && p[j + 1] === "*") {',
    '      ans = dfs(i, j + 2) || (first && dfs(i + 1, j));',
    '    } else {',
    '      ans = first && dfs(i + 1, j + 1);',
    '    }',
    '    memo[i][j] = ans ? 1 : 0;',
    '    return ans;',
    '  }',
    '  return dfs(0, 0);',
    '}',
  ],
};

export const REGEX_MATCHING_STAGE3_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <string>',
    '#include <vector>',
    'using namespace std;',
    '',
    '// 阶段 3: 严格位置依赖二维 DP',
    'bool isMatch2D(string s, string p) {',
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
    '// 阶段 3: 严格位置依赖二维 DP',
    'public class Code04_RegexStage3 {',
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
    'def is_match_stage3(s: str, p: str) -> bool:',
    '    """阶段 3: 严格二维动态规划"""',
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
    '// 阶段 3: 严格二维动态规划',
    'export function isMatchStage3(s, p) {',
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

export const WILDCARD_MATCHING_STAGE1_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    '// 阶段 1: 暴力递归',
    'public static boolean isMatch(String str, String pat) {',
    '    return dfs(str.toCharArray(), pat.toCharArray(), 0, 0);',
    '}',
    'public static boolean dfs(char[] s, char[] p, int i, int j) {',
    '    if (j == p.length) return i == s.length;',
    '    if (p[j] == \'*\') {',
    '        return dfs(s, p, i, j + 1) // 分支 0: * 匹配空串',
    '            || (i < s.length && dfs(s, p, i + 1, j)); // 分支 1: * 匹配 >= 1 个字符',
    '    }',
    '    boolean match = i < s.length && (s[i] == p[j] || p[j] == \'?\');',
    '    return match && dfs(s, p, i + 1, j + 1);',
    '}',
  ],
  cpp: [
    '// 阶段 1: 暴力递归',
    'bool isMatch(string s, string p) {',
    '    return dfs(s, p, 0, 0);',
    '}',
    'bool dfs(const string& s, const string& p, int i, int j) {',
    '    if (j == p.length()) return i == s.length();',
    '    if (p[j] == \'*\') {',
    '        return dfs(s, p, i, j + 1) // 分支 0: * 匹配空串',
    '            || (i < s.length() && dfs(s, p, i + 1, j)); // 分支 1: * 匹配 >= 1 个字符',
    '    }',
    '    bool match = i < s.length() && (s[i] == p[j] || p[j] == \'?\');',
    '    return match && dfs(s, p, i + 1, j + 1);',
    '}',
  ],
  python: [
    '# 阶段 1: 暴力递归',
    'def is_match_stage1(s: str, p: str) -> bool:',
    '    return dfs(s, p, 0, 0)',
    '# end is_match',
    'def dfs(s: str, p: str, i: int, j: int) -> bool:',
    '    if j == len(p): return i == len(s)',
    '    if p[j] == "*":',
    '        return dfs(s, p, i, j + 1) \\',
    '            or (i < len(s) and dfs(s, p, i + 1, j)) # 分支 0 / 1',
    '    # end if',
    '    match = i < len(s) and (s[i] == p[j] or p[j] == "?")',
    '    return match and dfs(s, p, i + 1, j + 1)',
    '# end dfs',
  ],
  javascript: [
    '// 阶段 1: 暴力递归',
    'export function isMatchStage1(s, p) {',
    '  return dfs(s, p, 0, 0);',
    '}',
    'function dfs(s, p, i, j) {',
    '  if (j === p.length) return i === s.length;',
    '  if (p[j] === "*") {',
    '    return dfs(s, p, i, j + 1) // 分支 0: * 匹配空串',
    '        || (i < s.length && dfs(s, p, i + 1, j)); // 分支 1: * 匹配 >= 1 个字符',
    '  }',
    '  const match = i < s.length && (s[i] === p[j] || p[j] === "?");',
    '  return match && dfs(s, p, i + 1, j + 1);',
    '}',
  ],
};

export const WILDCARD_MATCHING_STAGE2_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <string>',
    '#include <vector>',
    'using namespace std;',
    '',
    '// 阶段 2: 记忆化搜索 memo[i][j]',
    'bool dfsMemo(const string& s, const string& p, int i, int j, vector<vector<int>>& memo) {',
    '    if (memo[i][j] != -1) return memo[i][j] == 1;',
    '    if (j == p.length()) {',
    '        memo[i][j] = (i == s.length()) ? 1 : 0;',
    '        return memo[i][j] == 1;',
    '    }',
    '    bool ans = false;',
    '    if (p[j] == \'*\') {',
    '        ans = dfsMemo(s, p, i, j + 1, memo) || (i < s.length() && dfsMemo(s, p, i + 1, j, memo));',
    '    } else {',
    '        bool match = i < s.length() && (s[i] == p[j] || p[j] == \'?\');',
    '        ans = match && dfsMemo(s, p, i + 1, j + 1, memo);',
    '    }',
    '    memo[i][j] = ans ? 1 : 0;',
    '    return ans;',
    '}',
  ],
  java: [
    'package class074;',
    '',
    '// 阶段 2: 记忆化搜索',
    'public class Code05_WildcardStage2 {',
    '    public static boolean isMatch(String str, String pat) {',
    '        char[] s = str.toCharArray();',
    '        char[] p = pat.toCharArray();',
    '        int[][] memo = new int[s.length + 1][p.length + 1];',
    '        return dfsMemo(s, p, 0, 0, memo);',
    '    }',
    '',
    '    public static boolean dfsMemo(char[] s, char[] p, int i, int j, int[][] memo) {',
    '        if (memo[i][j] != 0) return memo[i][j] == 2;',
    '        if (j == p.length) {',
    '            memo[i][j] = (i == s.length) ? 2 : 1;',
    '            return memo[i][j] == 2;',
    '        }',
    '        boolean ans = false;',
    '        if (p[j] == \'*\') {',
    '            ans = dfsMemo(s, p, i, j + 1, memo) || (i < s.length && dfsMemo(s, p, i + 1, j, memo));',
    '        } else {',
    '            boolean match = i < s.length && (s[i] == p[j] || p[j] == \'?\');',
    '            ans = match && dfsMemo(s, p, i + 1, j + 1, memo);',
    '        }',
    '        memo[i][j] = ans ? 2 : 1;',
    '        return ans;',
    '    }',
    '}',
  ],
  python: [
    'def is_match_stage2(s: str, p: str) -> bool:',
    '    """阶段 2: 记忆化搜索"""',
    '    memo = [[-1] * (len(p) + 1) for _ in range(len(s) + 1)]',
    '    def dfs(i: int, j: int) -> bool:',
    '        if memo[i][j] != -1:',
    '            return memo[i][j] == 1',
    '        if j == len(p):',
    '            memo[i][j] = 1 if i == len(s) else 0',
    '            return memo[i][j] == 1',
    '        if p[j] == "*":',
    '            ans = dfs(i, j + 1) or (i < len(s) and dfs(i + 1, j))',
    '        else:',
    '            match = i < len(s) and (s[i] == p[j] or p[j] == "?")',
    '            ans = match and dfs(i + 1, j + 1)',
    '        memo[i][j] = 1 if ans else 0',
    '        return ans',
    '    return dfs(0, 0)',
  ],
  javascript: [
    '// 阶段 2: 记忆化搜索',
    'export function isMatchStage2(s, p) {',
    '  const memo = Array.from({ length: s.length + 1 }, () => new Array(p.length + 1).fill(-1));',
    '  function dfs(i, j) {',
    '    if (memo[i][j] !== -1) return memo[i][j] === 1;',
    '    if (j === p.length) {',
    '      memo[i][j] = i === s.length ? 1 : 0;',
    '      return memo[i][j] === 1;',
    '    }',
    '    let ans = false;',
    '    if (p[j] === "*") {',
    '      ans = dfs(i, j + 1) || (i < s.length && dfs(i + 1, j));',
    '    } else {',
    '      const match = i < s.length && (s[i] === p[j] || p[j] === "?");',
    '      ans = match && dfs(i + 1, j + 1);',
    '    }',
    '    memo[i][j] = ans ? 1 : 0;',
    '    return ans;',
    '  }',
    '  return dfs(0, 0);',
    '}',
  ],
};

export const WILDCARD_MATCHING_STAGE3_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <string>',
    '#include <vector>',
    'using namespace std;',
    '',
    '// 阶段 3: 严格位置依赖二维 DP',
    'bool isMatch2D(string s, string p) {',
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
    '// 阶段 3: 严格位置依赖二维 DP',
    'public class Code05_WildcardStage3 {',
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
    '}',
  ],
  python: [
    'def is_match_stage3(s: str, p: str) -> bool:',
    '    """阶段 3: 严格二维动态规划"""',
    '    n, m = len(s), len(p)',
    '    dp = [[False] * (m + 1) for _ in range(n + 1)]',
    '    dp[n][m] = True',
    '    for j in range(m - 1, -1, -1):',
    '        if p[j] == "*": dp[n][j] = True',
    '        else: break',
    '    for i in range(n - 1, -1, -1):',
    '        for j in range(m - 1, -1, -1):',
    '            if p[j] != "*":',
    '                dp[i][j] = (s[i] == p[j] or p[j] == "?") and dp[i + 1][j + 1]',
    '            else:',
    '                dp[i][j] = dp[i + 1][j] or dp[i][j + 1]',
    '    return dp[0][0]',
  ],
  javascript: [
    '// 阶段 3: 严格二维动态规划',
    'export function isMatchStage3(s, p) {',
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

export const BUYING_HAY_STAGE1_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 阶段 1: 暴力递归',
    'const int INF = 1e9;',
    'int dfs(int i, int remH, int n, const vector<int>& cost, const vector<int>& val) { // @step:callRoot @step:fnEnter',
    '    if (remH <= 0) return 0; // 已满足磅数需求 // @step:baseCheckSatisfied',
    '    if (i == n) return INF;  // 供货商已耗尽但仍未满足 // @step:baseCheckExhausted',
    '    // 分支 0: 不买当前第 i 家',
    '    int p1 = dfs(i + 1, remH, n, cost, val); // @step:branchNoPick',
    '    // 分支 1: 买 1 包第 i 家 (完全背包可继续买第 i 家)',
    '    int p2 = dfs(i, remH - val[i], n, cost, val) + cost[i]; // @step:branchPick',
    '    return min(p1, p2); // @step:returnMin',
    '}',
  ],
  java: [
    'package class074;',
    '',
    '// 阶段 1: 暴力递归',
    'public class Code06_BuyingHayStage1 {',
    '    public static final int INF = 1_000_000_000;',
    '    public static int dfs(int i, int remH, int n, int[] cost, int[] val) { // @step:callRoot @step:fnEnter',
    '        if (remH <= 0) return 0; // @step:baseCheckSatisfied',
    '        if (i == n) return INF; // @step:baseCheckExhausted',
    '        int p1 = dfs(i + 1, remH, n, cost, val); // @step:branchNoPick',
    '        int p2 = dfs(i, remH - val[i], n, cost, val) + cost[i]; // @step:branchPick',
    '        return Math.min(p1, p2); // @step:returnMin',
    '    }',
    '}',
  ],
  python: [
    'def buying_hay_stage1(h: int, cost: list[int], val: list[int]) -> int:',
    '    """阶段 1: 暴力递归"""',
    '    n = len(cost)',
    '    INF = float("inf")',
    '    def dfs(i: int, rem_h: int) -> int: # @step:callRoot @step:fnEnter',
    '        if rem_h <= 0: # @step:baseCheckSatisfied',
    '            return 0',
    '        if i == n: # @step:baseCheckExhausted',
    '            return INF',
    '        p1 = dfs(i + 1, rem_h) # @step:branchNoPick',
    '        p2 = dfs(i, rem_h - val[i]) + cost[i] # @step:branchPick',
    '        return min(p1, p2) # @step:returnMin',
    '    return dfs(0, h)',
  ],
  javascript: [
    '// 阶段 1: 暴力递归',
    'export function buyingHayStage1(h, cost, val) {',
    '  const n = cost.length;',
    '  const INF = 1e9;',
    '  function dfs(i, remH) { // @step:callRoot @step:fnEnter',
    '    if (remH <= 0) return 0; // @step:baseCheckSatisfied',
    '    if (i === n) return INF; // @step:baseCheckExhausted',
    '    const p1 = dfs(i + 1, remH); // @step:branchNoPick',
    '    const p2 = dfs(i, remH - val[i]) + cost[i]; // @step:branchPick',
    '    return Math.min(p1, p2); // @step:returnMin',
    '  }',
    '  return dfs(0, h);',
    '}',
  ],
};

export const BUYING_HAY_STAGE2_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 阶段 2: 记忆化搜索 memo[i][remH]',
    'const int INF = 1e9;',
    'int dfsMemo(int i, int remH, int n, const vector<int>& cost, const vector<int>& val, vector<vector<int>>& memo) { // @step:callRoot @step:fnEnter',
    '    if (remH <= 0) return 0; // @step:baseCheck',
    '    if (i == n) return INF;',
    '    if (memo[i][remH] != -1) return memo[i][remH]; // 命中缓存 // @step:memoCheck',
    '    int p1 = dfsMemo(i + 1, remH, n, cost, val, memo);',
    '    int p2 = dfsMemo(i, remH - val[i], n, cost, val, memo) + cost[i]; // @step:compute',
    '    return memo[i][remH] = min(p1, p2); // @step:memoStore',
    '}',
  ],
  java: [
    'package class074;',
    '',
    '// 阶段 2: 记忆化搜索',
    'public class Code06_BuyingHayStage2 {',
    '    public static final int INF = 1_000_000_000;',
    '    public static int dfsMemo(int i, int remH, int n, int[] cost, int[] val, int[][] memo) { // @step:callRoot @step:fnEnter',
    '        if (remH <= 0) return 0; // @step:baseCheck',
    '        if (i == n) return INF;',
    '        if (memo[i][remH] != -1) return memo[i][remH]; // @step:memoCheck',
    '        int p1 = dfsMemo(i + 1, remH, n, cost, val, memo);',
    '        int p2 = dfsMemo(i, remH - val[i], n, cost, val, memo) + cost[i]; // @step:compute',
    '        return memo[i][remH] = Math.min(p1, p2); // @step:memoStore',
    '    }',
    '}',
  ],
  python: [
    'def buying_hay_stage2(h: int, cost: list[int], val: list[int]) -> int: # @step:callRoot @step:fnEnter',
    '    """阶段 2: 记忆化搜索"""',
    '    n = len(cost)',
    '    INF = float("inf")',
    '    memo = [[-1] * (h + 1) for _ in range(n)]',
    '    def dfs(i: int, rem_h: int) -> int: # @step:fnEnter',
    '        if rem_h <= 0: # @step:baseCheck',
    '            return 0',
    '        if i == n:',
    '            return INF',
    '        if memo[i][rem_h] != -1: # @step:memoCheck',
    '            return memo[i][rem_h]',
    '        p1 = dfs(i + 1, rem_h)',
    '        p2 = dfs(i, rem_h - val[i]) + cost[i] # @step:compute',
    '        memo[i][rem_h] = min(p1, p2) # @step:memoStore',
    '        return memo[i][rem_h]',
    '    return dfs(0, h)',
  ],
  javascript: [
    '// 阶段 2: 记忆化搜索',
    'export function buyingHayStage2(h, cost, val) { // @step:callRoot @step:fnEnter',
    '  const n = cost.length;',
    '  const INF = 1e9;',
    '  const memo = Array.from({ length: n }, () => new Array(h + 1).fill(-1));',
    '  function dfs(i, remH) { // @step:fnEnter',
    '    if (remH <= 0) return 0; // @step:baseCheck',
    '    if (i === n) return INF; // @step:baseCheck',
    '    if (memo[i][remH] !== -1) return memo[i][remH]; // @step:memoCheck',
    '    const p1 = dfs(i + 1, remH);',
    '    const p2 = dfs(i, remH - val[i]) + cost[i]; // @step:compute',
    '    return (memo[i][remH] = Math.min(p1, p2)); // @step:memoStore',
    '  }',
    '  return dfs(0, h);',
    '}',
  ],
};

export const BUYING_HAY_STAGE3_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 阶段 3: 严格二维动态规划 dp[i][j]',
    'int minCostBuyingHay2D(int n, int h, const vector<int>& cost, const vector<int>& val) {',
    '    int maxv = *max_element(val.begin(), val.end());',
    '    int m = h + maxv;',
    '    const int INF = 1e9;',
    '    vector<vector<int>> dp(n + 1, vector<int>(m + 1, INF)); // @step:initDp',
    '    dp[0][0] = 0; // @step:baseZero',
    '    for (int i = 1; i <= n; ++i) { // @step:outerLoop',
    '        int c = cost[i - 1], v = val[i - 1];',
    '        for (int j = 0; j <= m; ++j) { // @step:innerLoop',
    '            dp[i][j] = dp[i - 1][j]; // 不选第 i 家 // @step:transition',
    '            if (j >= v && dp[i][j - v] != INF) {',
    '                dp[i][j] = min(dp[i][j], dp[i][j - v] + c); // 完全背包同层转移',
    '            }',
    '        }',
    '    }',
    '    int ans = INF;',
    '    for (int j = h; j <= m; ++j) ans = min(ans, dp[n][j]);',
    '    return ans; // @step:returnAns',
    '}',
  ],
  java: [
    'package class074;',
    '',
    'import java.util.Arrays;',
    '',
    '// 阶段 3: 严格二维动态规划',
    'public class Code06_BuyingHayStage3 {',
    '    public static int minCost2D(int n, int h, int[] cost, int[] val) {',
    '        int maxv = 0;',
    '        for (int v : val) maxv = Math.max(maxv, v);',
    '        int m = h + maxv;',
    '        final int INF = 1_000_000_000;',
    '        int[][] dp = new int[n + 1][m + 1]; // @step:initDp',
    '        for (int i = 0; i <= n; i++) Arrays.fill(dp[i], INF);',
    '        dp[0][0] = 0; // @step:baseZero',
    '        for (int i = 1; i <= n; i++) { // @step:outerLoop',
    '            int c = cost[i - 1], v = val[i - 1];',
    '            for (int j = 0; j <= m; j++) { // @step:innerLoop',
    '                dp[i][j] = dp[i - 1][j]; // @step:transition',
    '                if (j >= v && dp[i][j - v] != INF) {',
    '                    dp[i][j] = Math.min(dp[i][j], dp[i][j - v] + c);',
    '                }',
    '            }',
    '        }',
    '        int ans = INF;',
    '        for (int j = h; j <= m; j++) ans = Math.min(ans, dp[n][j]);',
    '        return ans; // @step:returnAns',
    '    }',
    '}',
  ],
  python: [
    'def buying_hay_2d(n: int, h: int, cost: list[int], val: list[int]) -> int:',
    '    """阶段 3: 严格二维动态规划"""',
    '    maxv = max(val)',
    '    m = h + maxv',
    '    INF = float("inf")',
    '    dp = [[INF] * (m + 1) for _ in range(n + 1)] # @step:initDp',
    '    dp[0][0] = 0 # @step:baseZero',
    '    for i in range(1, n + 1): # @step:outerLoop',
    '        c, v = cost[i - 1], val[i - 1]',
    '        for j in range(m + 1): # @step:innerLoop',
    '            dp[i][j] = dp[i - 1][j] # @step:transition',
    '            if j >= v and dp[i][j - v] != INF:',
    '                dp[i][j] = min(dp[i][j], dp[i][j - v] + c)',
    '    return min(dp[n][h : m + 1]) # @step:returnAns',
  ],
  javascript: [
    '// 阶段 3: 严格二维动态规划',
    'export function buyingHay2D(n, h, cost, val) {',
    '  const maxv = Math.max(...val);',
    '  const m = h + maxv;',
    '  const INF = 1e9;',
    '  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(INF)); // @step:initDp',
    '  dp[0][0] = 0; // @step:baseZero',
    '  for (let i = 1; i <= n; i++) { // @step:outerLoop',
    '    const c = cost[i - 1], v = val[i - 1];',
    '    for (let j = 0; j <= m; j++) { // @step:innerLoop',
    '      dp[i][j] = dp[i - 1][j]; // @step:transition',
    '      if (j >= v && dp[i][j - v] !== INF) {',
    '        dp[i][j] = Math.min(dp[i][j], dp[i][j - v] + c);',
    '      }',
    '    }',
    '  }',
    '  let ans = INF;',
    '  for (let j = h; j <= m; j++) ans = Math.min(ans, dp[n][j]);',
    '  return ans; // @step:returnAns',
    '}',
  ],
};
