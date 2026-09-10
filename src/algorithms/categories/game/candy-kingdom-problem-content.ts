/**
 * 糖果王国·双向分配大派对 (Candy Kingdom: Two-Pass Greedy Feast)
 * 经典双向贪心算法（Two-Pass Greedy）、局部邻居最优与峰谷调整多语言题解 (LeetCode 135 Hard)
 */

export const CANDY_KINGDOM_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <numeric>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 经典双向贪心算法：分发糖果 (LeetCode 135 Hard)',
    'int candy(vector<int>& ratings) {',
    '    int n = ratings.size();',
    '    vector<int> candies(n, 1); // 基础保障：每人至少 1 颗糖果',
    '',
    '    // 第一次遍历：从左向右 (若右边孩子评分高于左边，右边 = 左边 + 1)',
    '    for (int i = 1; i < n; i++) {',
    '        if (ratings[i] > ratings[i - 1]) {',
    '            candies[i] = candies[i - 1] + 1;',
    '        }',
    '    }',
    '',
    '    // 第二次遍历：从右向左 (若左边孩子评分高于右边，左边取 max(当前值, 右边 + 1))',
    '    for (int i = n - 2; i >= 0; i--) {',
    '        if (ratings[i] > ratings[i + 1]) {',
    '            candies[i] = max(candies[i], candies[i + 1] + 1);',
    '        }',
    '    }',
    '',
    '    // 累计最少糖果总数',
    '    return accumulate(candies.begin(), candies.end(), 0);',
    '}',
  ],
  java: [
    'import java.util.Arrays;',
    '',
    'public class CandyGreedy {',
    '    public static int candy(int[] ratings) {',
    '        int n = ratings.length;',
    '        int[] candies = new int[n];',
    '        Arrays.fill(candies, 1);',
    '',
    '        // 正向贪心扫描',
    '        for (int i = 1; i < n; i++) {',
    '            if (ratings[i] > ratings[i - 1]) {',
    '                candies[i] = candies[i - 1] + 1;',
    '            }',
    '        }',
    '',
    '        // 反向贪心扫描并汇总',
    '        int total = candies[n - 1];',
    '        for (int i = n - 2; i >= 0; i--) {',
    '            if (ratings[i] > ratings[i + 1]) {',
    '                candies[i] = Math.max(candies[i], candies[i + 1] + 1);',
    '            }',
    '            total += candies[i];',
    '        }',
    '        return total;',
    '    }',
    '}',
  ],
  python: [
    'def candy(ratings: list[int]) -> int:',
    '    """双向贪心：拆解左右邻居依赖"""',
    '    n = len(ratings)',
    '    candies = [1] * n',
    '',
    '    # 从左向右遍历',
    '    for i in range(1, n):',
    '        if ratings[i] > ratings[i - 1]:',
    '            candies[i] = candies[i - 1] + 1',
    '',
    '    # 从右向左遍历',
    '    for i in range(n - 2, -1, -1):',
    '        if ratings[i] > ratings[i + 1]:',
    '            candies[i] = max(candies[i], candies[i + 1] + 1)',
    '',
    '    return sum(candies)',
  ],
  javascript: [
    'function candy(ratings) {',
    '  const n = ratings.length;',
    '  const candies = new Array(n).fill(1);',
    '  for (let i = 1; i < n; i++) {',
    '    if (ratings[i] > ratings[i - 1]) candies[i] = candies[i - 1] + 1;',
    '  }',
    '  for (let i = n - 2; i >= 0; i--) {',
    '    if (ratings[i] > ratings[i + 1]) candies[i] = Math.max(candies[i], candies[i + 1] + 1);',
    '  }',
    '  return candies.reduce((a, b) => a + b, 0);',
    '}',
  ],
};

export const CANDY_KINGDOM_PROBLEM_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
      <span style="font-size: 20px;">🍬</span>
      <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #0f172a;">糖果王国·双向分配大派对 (Candy Kingdom)</h3>
      <span style="background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid #bfdbfe;">双向贪心 Hard LeetCode 135</span>
    </div>

    <p style="font-size: 12.5px; color: #334155; margin-bottom: 10px;">
      糖果王国里排着一队小朋友，每个孩子都有表现评分 $ratings[i]$。国王要求：<b>每人至少分得 1 颗糖果</b>；<b>相邻两孩子中，评分更高者必须获得更多糖果</b>。如何利用<b>正向与反向两次双向贪心扫描</b>，以最少糖果满足所有人？
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🎮 派发与工坊玩法</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>🍬 60 FPS 糖果堆叠动画</b>：糖果在孩子头顶弹跳堆高；</li>
          <li><b>↔️ 双向扫描器透视</b>：绿光向右扫描、紫光向左扫描；</li>
          <li><b>⚡ 冲突怒气检测</b>：若比邻居分高却糖少，孩子冒雷云哭泣！</li>
        </ul>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🧠 双向贪心精髓</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>拆解双向依赖</b>：同时考虑左右邻居极为复杂，拆解为「左规则」与「右规则」；</li>
          <li><b>反向取最大值</b>：$candies[i] = \\max(candies[i], candies[i+1] + 1)$ 完美兼容双侧约束。</li>
        </ul>
      </div>
    </div>
  </div>
`;

export const CANDY_KINGDOM_ANALYSIS_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <h3 style="margin-top: 0; font-size: 14px; font-weight: 800; color: #0f172a;">双向贪心拆解与证明</h3>

    <div style="margin-bottom: 10px;">
      <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #2563eb;">1. 为什么不能单次遍历完成？</h4>
      <p style="font-size: 11.5px; color: #475569; margin: 0;">
        在下坡区间（例如评分 $5, 4, 3, 2, 1$），从左往右看每个孩子都比左边小，初次分配都为 1；但从右往左看，右侧最低点为 1，向左必须依次递增为 $1, 2, 3, 4, 5$！单次遍历无法预知后方下坡深度，因此必须<b>先从左向右满足左规则，再从右向左满足右规则</b>！
      </p>
    </div>
  </div>
`;
