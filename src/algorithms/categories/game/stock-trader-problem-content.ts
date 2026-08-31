/**
 * 星际华尔街·买卖股票的波段时机 (Stock Trader Empire: Wave Harvest)
 * 经典贪心与动态规划状态机算法（LeetCode 121 买卖股票的最佳时机 & LeetCode 122 买卖股票的最佳时机 II & LeetCode 309 含冷冻期）
 * 多语言题解、斜率数学证明与交互式关卡配置
 */

export const STOCK_TRADER_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 经典贪心算法：买卖股票的最佳时机 II (LeetCode 122)',
    '// 核心思想：贪心收集所有正斜率上坡利润（今日买明日卖分解）',
    'int maxProfit(vector<int>& prices) {',
    '    int totalProfit = 0;',
    '    ',
    '    // 遍历所有相邻天数差值',
    '    for (size_t i = 1; i < prices.size(); i++) {',
    '        int dailyProfit = prices[i] - prices[i - 1];',
    '        // 只要明天价格高于今天，就在今天买入、明天卖出，锁定该段利润！',
    '        if (dailyProfit > 0) {',
    '            totalProfit += dailyProfit;',
    '        }',
    '    }',
    '    ',
    '    return totalProfit;',
    '}',
    '',
    '// 经典单次交易：买卖股票的最佳时机 I (LeetCode 121)',
    'int maxProfitSingle(vector<int>& prices) {',
    '    int minPrice = INT_MAX;',
    '    int maxProfit = 0;',
    '    for (int p : prices) {',
    '        minPrice = min(minPrice, p);               // 维护历史最低买入点',
    '        maxProfit = max(maxProfit, p - minPrice); // 贪心尝试在当前卖出',
    '    }',
    '    return maxProfit;',
    '}',
  ],
  java: [
    'public class StockTraderEmpire {',
    '    // 贪心算法：收集所有正上坡利润 (LeetCode 122)',
    '    public int maxProfit(int[] prices) {',
    '        int totalProfit = 0;',
    '        for (int i = 1; i < prices.length; i++) {',
    '            int diff = prices[i] - prices[i - 1];',
    '            if (diff > 0) {',
    '                totalProfit += diff; // 累加每一个单日上涨收益',
    '            }',
    '        }',
    '        return totalProfit;',
    '    }',
    '',
    '    // 状态机动态规划版本 (持有与未持有双状态转移)',
    '    public int maxProfitDP(int[] prices) {',
    '        if (prices.length <= 1) return 0;',
    '        int hold = -prices[0]; // 第 0 天持有股票的最大收益',
    '        int cash = 0;          // 第 0 天未持有股票的最大收益',
    '        for (int i = 1; i < prices.length; i++) {',
    '            hold = Math.max(hold, cash - prices[i]);',
    '            cash = Math.max(cash, hold + prices[i]);',
    '        }',
    '        return cash;',
    '    }',
    '}',
  ],
  python: [
    'def max_profit(prices: list[int]) -> int:',
    '    """贪心算法：累加所有正单日差值收益 (LeetCode 122)"""',
    '    total_profit = 0',
    '    for i in range(1, len(prices)):',
    '        diff = prices[i] - prices[i - 1]',
    '        if diff > 0:',
    '            total_profit += diff',
    '    return total_profit',
    '',
    'def max_profit_single(prices: list[int]) -> int:',
    '    """单次交易：维护历史最低买入价格 (LeetCode 121)"""',
    '    min_price = float("inf")',
    '    max_profit_val = 0',
    '    for p in prices:',
    '        min_price = min(min_price, p)',
    '        max_profit_val = max(max_profit_val, p - min_price)',
    '    return max_profit_val',
  ],
  javascript: [
    'function maxProfit(prices) {',
    '  let totalProfit = 0;',
    '  for (let i = 1; i < prices.length; i++) {',
    '    const diff = prices[i] - prices[i - 1];',
    '    if (diff > 0) {',
    '      totalProfit += diff;',
    '    }',
    '  }',
    '  return totalProfit;',
    '}',
  ],
};

export const STOCK_TRADER_PROBLEM_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
      <span style="font-size: 20px;">📈</span>
      <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #0f172a;">星际华尔街·买卖股票的波段时机 (Stock Trader Empire)</h3>
      <span style="background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid #bfdbfe;">贪心波段 LeetCode 122 / 121</span>
    </div>

    <p style="font-size: 12.5px; color: #334155; margin-bottom: 10px;">
      在赛博星际股票交易大厅中，某支能量晶体股票在连续 $N$ 天内的报价为 $[prices_0, prices_1, \\dots, prices_{n-1}]$。你可以在任意天买入并选择在未来某天卖出（支持当天卖出后再买入，允许多次交易）。请设计操盘策略，获得<b>全局最大的净利润</b>！
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🎮 操盘靶场玩法</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>💹 60 FPS 霓虹 K 线波段走势</b>：直观展示每日波动折线与绿色正斜率上坡区间；</li>
          <li><b>🪙 交互式买入/卖出标记</b>：点击价格节点规划交易波段，挑战自己能否跑赢贪心最优解；</li>
          <li><b>✨ 贪心单步推演与自动收割</b>：单步展示正斜率区间收益累加与理论证明！</li>
        </ul>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🧠 贪心收集正收益精髓</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>波段收益等价拆解</b>：$(prices[3] - prices[0]) = (p_1-p_0) + (p_2-p_1) + (p_3-p_2)$；</li>
          <li><b>局部最优即全局最优</b>：只需无脑抓取所有 $p_i - p_{i-1} > 0$ 的上坡，避开所有下坡，即可达到最大总收益！</li>
        </ul>
      </div>
    </div>
  </div>
`;

export const STOCK_TRADER_ANALYSIS_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <h3 style="margin-top: 0; font-size: 14px; font-weight: 800; color: #0f172a;">股票波段收益等价拆解与贪心证明</h3>

    <div style="margin-bottom: 10px;">
      <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #2563eb;">1. 为什么“天天交易”与“低买高卖长线持有”收益完全一致？</h4>
      <p style="font-size: 11.5px; color: #475569; margin: 0 0 6px 0;">
        假设在第 0 天价格 $p_0$ 买入，一直持有到第 3 天 $p_3$ 卖出，长线收益为 $p_3 - p_0$。根据代数恒等式：
      </p>
      <div style="background: #f1f5f9; padding: 6px 10px; border-radius: 4px; font-family: monospace; font-size: 11px; color: #0f172a; margin-bottom: 6px;">
        p_3 - p_0 = (p_1 - p_0) + (p_2 - p_1) + (p_3 - p_2)
      </div>
      <p style="font-size: 11.5px; color: #475569; margin: 0;">
        任何跨越多天的连续上涨波段，都能完美拆解为<b>每天单日收益的代数和</b>！因此只要遇到 $p_i - p_{i-1} > 0$ 就累加进利润，遇到 $p_i - p_{i-1} \\le 0$ 就跳过不操作，最终累加和必然等于全局所有上升波段的最大总利润！
      </p>
    </div>

    <div style="margin-bottom: 10px;">
      <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #0891b2;">2. 复杂度对比</h4>
      <p style="font-size: 11.5px; color: #475569; margin: 0;">
        <b>时间复杂度</b>：只需单次线性扫描 $O(N)$。<br/>
        <b>空间复杂度</b>：仅维护单次交易变量，空间复杂度 $O(1)$。
      </p>
    </div>
  </div>
`;
