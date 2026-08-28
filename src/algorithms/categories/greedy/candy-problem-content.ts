/**
 * LeetCode 135: 分发糖果 (Candy)
 * 领域知识与题解精讲配置声明
 */

export const CANDY_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(239,68,68,0.2); color: #f87171; font-weight: 700; border: 1px solid rgba(239,68,68,0.3);">LeetCode 135</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(239,68,68,0.2); color: #f87171; font-weight: 700; border: 1px solid rgba(239,68,68,0.3);">Hard</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">分发糖果 (Candy)</h2>
    </div>
    <p style="margin: 0;"><code style="color: #fde047; font-family: monospace;">n</code> 个孩子站成一排。给你一个整数数组 <code style="color: #fde047; font-family: monospace;">ratings</code> 表示每个孩子的评分。</p>
    <p style="margin: 0;">你需要按照以下要求，给这些孩子分发糖果：</p>
    <ul style="margin: 0; padding-left: 20px;">
      <li>每个孩子至少分配到 <code style="color: #fde047; font-family: monospace;">1</code> 个糖果。</li>
      <li>相邻两个孩子评分更高的孩子会获得更多的糖果。</li>
    </ul>
    <p style="margin: 0;">请你给每个孩子分发糖果，计算并返回需要准备的 <strong>最少糖果数目</strong> 。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: ratings = [1,0,2]</div>
      <div>输出: 5</div>
      <div>解释: 你可以分别给第一个、第二个、第三个孩子分发 2、1、2 颗糖果。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: ratings = [1,2,2]</div>
      <div>输出: 4</div>
      <div>解释: 分别分发 1、2、1 颗糖果。第三个孩子只得到 1 颗糖果，满足上面两个条件。</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• n == ratings.length</div>
      <div>• 1 &le; n &le; 2 * 10^4</div>
      <div>• 0 &le; ratings[i] &le; 2 * 10^4</div>
    </div>
  </div>
`;

export const CANDY_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 两次贪心：拆分「左比右」与「右比左」，各自独立推导
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 为什么不能同时兼顾两边？</div>
        <p style="margin: 0; color: #94a3b8;">如果一边遍历一边同时比较左邻和右邻，不仅逻辑极其混乱容易顾此失彼，而且局部调整会引发级联错误。<strong>核心思想是两次单向遍历</strong>！</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 第一次遍历：从左向右（处理右孩子 > 左孩子）</div>
        <p style="margin: 0; color: #94a3b8;">初始糖果全部为 1。<br/>
        从左向右扫描：若 <code style="color: #7dd3fc; font-family: monospace;">ratings[i] > ratings[i - 1]</code>，则 <code style="color: #34d399; font-family: monospace;">candy[i] = candy[i - 1] + 1</code>。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 第二次遍历：从右向左（处理左孩子 > 右孩子并取 max）</div>
        <p style="margin: 0; color: #94a3b8;">从右向左扫描：若 <code style="color: #fbbf24; font-family: monospace;">ratings[i] > ratings[i + 1]</code>，此时第 i 个孩子的糖果既要满足大于右边（<code style="color: #7dd3fc; font-family: monospace;">candy[i + 1] + 1</code>），又要保持上一轮满足大于左边的结果，因此取最大值：<br/>
        <code style="color: #f472b6; font-family: monospace;">candy[i] = Math.max(candy[i], candy[i + 1] + 1)</code>！</p>
      </div>
    </div>
  </div>
`;

export const CANDY_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int candy(int[] ratings) {',
    '    int[] candyVec = new int[ratings.length];',
    '    Arrays.fill(candyVec, 1); // 规则1：每人至少 1 颗',
    '    // 1. 从左到右遍历：右边比左边大',
    '    for (int i = 1; i < ratings.length; i++) {',
    '        if (ratings[i] > ratings[i - 1]) {',
    '            candyVec[i] = candyVec[i - 1] + 1;',
    '        }',
    '    }',
    '    // 2. 从右到左遍历：左边比右边大，取 max',
    '    for (int i = ratings.length - 2; i >= 0; i--) {',
    '        if (ratings[i] > ratings[i + 1]) {',
    '            candyVec[i] = Math.max(candyVec[i], candyVec[i + 1] + 1);',
    '        }',
    '    }',
    '    // 3. 求和',
    '    return Arrays.stream(candyVec).sum();',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int candy(vector<int>& ratings) {',
    '        vector<int> candyVec(ratings.size(), 1);',
    '        for (int i = 1; i < ratings.size(); i++) {',
    '            if (ratings[i] > ratings[i - 1]) {',
    '                candyVec[i] = candyVec[i - 1] + 1;',
    '            }',
    '        }',
    '        for (int i = ratings.size() - 2; i >= 0; i--) {',
    '            if (ratings[i] > ratings[i + 1]) {',
    '                candyVec[i] = max(candyVec[i], candyVec[i + 1] + 1);',
    '            }',
    '        }',
    '        int result = 0;',
    '        for (int c : candyVec) result += c;',
    '        return result;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def candy(self, ratings: List[int]) -> int:',
    '        candies = [1] * len(ratings)',
    '        # 从左到右',
    '        for i in range(1, len(ratings)):',
    '            if ratings[i] > ratings[i - 1]:',
    '                candies[i] = candies[i - 1] + 1',
    '        # 从右到左',
    '        for i in range(len(ratings) - 2, -1, -1):',
    '            if ratings[i] > ratings[i + 1]:',
    '                candies[i] = max(candies[i], candies[i + 1] + 1)',
    '        return sum(candies)',
  ],
  javascript: [
    'var candy = function(ratings) {',
    '    const candies = new Array(ratings.length).fill(1);',
    '    for (let i = 1; i < ratings.length; i++) {',
    '        if (ratings[i] > ratings[i - 1]) {',
    '            candies[i] = candies[i - 1] + 1;',
    '        }',
    '    }',
    '    for (let i = ratings.length - 2; i >= 0; i--) {',
    '        if (ratings[i] > ratings[i + 1]) {',
    '            candies[i] = Math.max(candies[i], candies[i + 1] + 1);',
    '        }',
    '    }',
    '    return candies.reduce((a, b) => a + b, 0);',
    '};',
  ],
};
