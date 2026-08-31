/**
 * 背包商人·地牢探险 (0-1 Knapsack Dungeon Crawler)
 * 动态规划经典背包问题精讲、多语言 DP 求解算法与状态转移表源码
 */

export const KNAPSACK_DUNGEON_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    'struct Item { string name; int weight; int value; };',
    '',
    '// 0-1 背包核心动态规划算法：求在背包承重 capacity 下的最大战斗力配装',
    'int solveKnapsack01(int capacity, const vector<Item>& items, vector<bool>& selected) {',
    '    int n = items.size();',
    '    vector<vector<int>> dp(n + 1, vector<int>(capacity + 1, 0));',
    '',
    '    // 状态转移：dp[i][w] = max(不选当前物品, 选当前物品)',
    '    for (int i = 1; i <= n; i++) {',
    '        int w = items[i - 1].weight;',
    '        int v = items[i - 1].value;',
    '        for (int j = 0; j <= capacity; j++) {',
    '            if (j < w) {',
    '                dp[i][j] = dp[i - 1][j];',
    '            } else {',
    '                dp[i][j] = max(dp[i - 1][j], dp[i - 1][j - w] + v);',
    '            }',
    '        }',
    '    }',
    '',
    '    // 逆向回溯最优选装方案',
    '    selected.assign(n, false);',
    '    int curW = capacity;',
    '    for (int i = n; i >= 1; i--) {',
    '        if (dp[i][curW] != dp[i - 1][curW]) {',
    '            selected[i - 1] = true;',
    '            curW -= items[i - 1].weight;',
    '        }',
    '    }',
    '    return dp[n][capacity];',
    '}',
  ],
  java: [
    'import java.util.*;',
    '',
    'public class KnapsackSolver {',
    '    public static class Item {',
    '        public String name; public int weight; public int value;',
    '        public Item(String name, int weight, int value) {',
    '            this.name = name; this.weight = weight; this.value = value;',
    '        }',
    '    }',
    '',
    '    // 一维空间优化 0-1 背包 (倒序遍历防止重复选择)',
    '    public static int solveKnapsackOptimized(int capacity, List<Item> items) {',
    '        int[] dp = new int[capacity + 1];',
    '        for (Item item : items) {',
    '            for (int w = capacity; w >= item.weight; w--) {',
    '                dp[w] = Math.max(dp[w], dp[w - item.weight] + item.value);',
    '            }',
    '        }',
    '        return dp[capacity];',
    '    }',
    '}',
  ],
  python: [
    'def knapsack_01(capacity: int, weights: list[int], values: list[int]):',
    '    """0-1 背包动态规划：返回最大价值与最优装配索引"""',
    '    n = len(weights)',
    '    dp = [[0] * (capacity + 1) for _ in range(n + 1)]',
    '',
    '    for i in range(1, n + 1):',
    '        w, v = weights[i - 1], values[i - 1]',
    '        for j in range(capacity + 1):',
    '            if j < w:',
    '                dp[i][j] = dp[i - 1][j]',
    '            else:',
    '                dp[i][j] = max(dp[i - 1][j], dp[i - 1][j - w] + v)',
    '',
    '    # 回溯最优解',
    '    chosen = []',
    '    cur_w = capacity',
    '    for i in range(n, 0, -1):',
    '        if dp[i][cur_w] != dp[i - 1][cur_w]:',
    '            chosen.append(i - 1)',
    '            cur_w -= weights[i - 1]',
    '    return dp[n][capacity], chosen',
  ],
  javascript: [
    '// 完全背包动态规划 (正序遍历允许同一物品多次选择)',
    'function completeKnapsack(capacity, items) {',
    '  const dp = new Array(capacity + 1).fill(0);',
    '  for (const item of items) {',
    '    for (let w = item.weight; w <= capacity; w++) {',
    '      dp[w] = Math.max(dp[w], dp[w - item.weight] + item.value);',
    '    }',
    '  }',
    '  return dp[capacity];',
    '}',
  ],
};

export const KNAPSACK_DUNGEON_PROBLEM_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
      <span style="font-size: 20px;">🎒</span>
      <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #0f172a;">背包商人·地牢探险 (0-1 Knapsack Dungeon)</h3>
      <span style="background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid #bfdbfe;">动态规划核心</span>
    </div>

    <p style="font-size: 12.5px; color: #334155; margin-bottom: 10px;">
      你是深入远古地下城的冒险者，每个地牢房间都散落着神兵利刃、魔法卷轴与增益药水。然而你的旅行背包具有<b>严格负重上限 $W$</b>！如何利用<b>动态规划</b>挑选出攻击力/生存力最高的组合击败守关魔王？
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🗡️ 核心玩法</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>手动配装</b>：点击宝物放入背包，实时监控负重槽；</li>
          <li><b>DP 启示</b>：一键生成全状态转移矩阵，直观对比贪心与 DP 全局最优解；</li>
          <li><b>Boss 决战</b>：携带最强装备与地牢 Boss 展开实时回合制决斗！</li>
        </ul>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">📚 算法模式</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>0-1 背包</b>：每件稀有神器仅此一件（选/不选）；</li>
          <li><b>完全背包</b>：炼金药水无限量供应（正序遍历）；</li>
          <li><b>多维背包</b>：同时考量【重量 $W$】与【体积 $V$】双重限制。</li>
        </ul>
      </div>
    </div>
  </div>
`;

export const KNAPSACK_DUNGEON_ANALYSIS_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <h3 style="margin-top: 0; font-size: 14px; font-weight: 800; color: #0f172a;">动态规划状态转移解析</h3>

    <div style="margin-bottom: 10px;">
      <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #2563eb;">1. 状态定义与转移方程</h4>
      <p style="font-size: 11.5px; color: #475569; margin: 0;">
        设 $dp[i][j]$ 表示前 $i$ 件物品在背包限重 $j$ 时的最大战斗力：
        $$dp[i][j] = \\begin{cases} dp[i-1][j] & \\text{若 } j < w_i \\\\ \\max(dp[i-1][j], dp[i-1][j-w_i] + v_i) & \\text{若 } j \\ge w_i \\end{cases}$$
      </p>
    </div>

    <div style="margin-bottom: 10px;">
      <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #10b981;">2. 为什么贪心策略（性价比最大）在地牢中会翻车？</h4>
      <p style="font-size: 11.5px; color: #475569; margin: 0;">
        贪心法只看单位重量价值 $v_i / w_i$。例如背包容量为 6，有物品 A (重4, 价值40, 比值10) 和物品 B (重3, 价值27, 比值9) 与 C (重3, 价值27, 比值9)。
        <br>• 贪心法选择 A 后剩余容量 2，无法再装任何物品，总价值为 <b>40</b>；
        <br>• DP 最优解选择 B + C，总重量刚好 6，总价值高达 <b>54</b>！
      </p>
    </div>
  </div>
`;
