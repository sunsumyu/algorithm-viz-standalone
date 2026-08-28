/**
 * LeetCode 122: 买卖股票的最佳时机 II (Best Time to Buy and Sell Stock II)
 * 领域知识与题解精讲配置声明
 */

export const BEST_TIME_STOCK_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 122</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">买卖股票的最佳时机 II (Best Time to Buy and Sell Stock II)</h2>
    </div>
    <p style="margin: 0;">给你一个整数数组 <code style="color: #fde047; font-family: monospace;">prices</code> ，其中 <code style="color: #fde047; font-family: monospace;">prices[i]</code> 表示某支股票第 <code style="color: #fde047; font-family: monospace;">i</code> 天的价格。</p>
    <p style="margin: 0;">在每一天，你可以决定是否购买和/或出售股票。你在任何时候 <strong>最多</strong> 只能持有 <strong>一股</strong> 股票。你也可以先购买，然后在 <strong>同一天</strong> 出售。返回你能获得的 <strong>最大利润</strong> 。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: prices = [7,1,5,3,6,4]</div>
      <div>输出: 7</div>
      <div>解释: 在第 2 天（股票价格 = 1）买入，在第 3 天（价格 = 5）卖出，利润 = 5 - 1 = 4 。随后在第 4 天（价格 = 3）买入，在第 5 天（价格 = 6）卖出，利润 = 6 - 3 = 3 。最大总利润为 4 + 3 = 7 。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: prices = [1,2,3,4,5]</div>
      <div>输出: 4</div>
      <div>解释: 在第 1 天（股票价格 = 1）买入，在第 5 天（价格 = 5）卖出，利润 = 5 - 1 = 4 。最大总利润为 4 。</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; prices.length &le; 3 * 10^4</div>
      <div>• 0 &le; prices[i] &le; 10^4</div>
    </div>
  </div>
`;

export const BEST_TIME_STOCK_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 贪心核心：利润跨天拆解，只收集所有正向日收益
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 利润跨天拆解公式</div>
        <p style="margin: 0; color: #94a3b8;">设第 0 天买入、第 3 天卖出，利润为：<br/>
        <code style="color: #7dd3fc; font-family: monospace;">prices[3] - prices[0] = (prices[3]-prices[2]) + (prices[2]-prices[1]) + (prices[1]-prices[0])</code><br/>
        这表明<strong>跨越任意多天的利润，都可以等价拆解为每天相邻两天的差值之和</strong>！</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 局部最优与全局最优</div>
        <p style="margin: 0; color: #94a3b8;">• <strong>局部最优</strong>：只收集每天的正收益（即 <code style="color: #fbbf24; font-family: monospace;">prices[i] - prices[i-1] > 0</code>）。<br/>
        • <strong>全局最优</strong>：收集所有正收益后累加即为最大总利润，彻底避开任何下跌亏损日。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 代码极致简洁 O(N)</div>
        <p style="margin: 0; color: #94a3b8;">只需一次线性扫描累加正差值，时间复杂度 <code style="color: #7dd3fc; font-family: monospace;">O(N)</code>，空间复杂度 <code style="color: #34d399; font-family: monospace;">O(1)</code>。</p>
      </div>
    </div>
  </div>
`;

export const BEST_TIME_STOCK_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int maxProfit(int[] prices) {',
    '    int result = 0;',
    '    for (int i = 1; i < prices.length; i++) {',
    '        // 贪心：只收集每天的正利润',
    '        result += Math.max(prices[i] - prices[i - 1], 0);',
    '    }',
    '    return result;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int maxProfit(vector<int>& prices) {',
    '        int result = 0;',
    '        for (int i = 1; i < prices.size(); i++) {',
    '            result += max(prices[i] - prices[i - 1], 0);',
    '        }',
    '        return result;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def maxProfit(self, prices: List[int]) -> int:',
    '        result = 0',
    '        for i in range(1, len(prices)):',
    '            result += max(prices[i] - prices[i - 1], 0)',
    '        return result',
  ],
  javascript: [
    'var maxProfit = function(prices) {',
    '    let result = 0;',
    '    for (let i = 1; i < prices.length; i++) {',
    '        result += Math.max(prices[i] - prices[i - 1], 0);',
    '    }',
    '    return result;',
    '};',
  ],
};
