/**
 * LeetCode 860: 柠檬水找零 (Lemonade Change)
 * 领域知识与题解精讲配置声明
 */

export const LEMONADE_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 860</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">柠檬水找零 (Lemonade Change)</h2>
    </div>
    <p style="margin: 0;">在柠檬水摊上，每一杯柠檬水的售价为 <code style="color: #fde047; font-family: monospace;">5</code> 美元。顾客排队购买你的产品，一次购买一杯。</p>
    <p style="margin: 0;">每位顾客只买一杯柠檬水，然后向你付 <code style="color: #fde047; font-family: monospace;">5</code> 美元、<code style="color: #fde047; font-family: monospace;">10</code> 美元或 <code style="color: #fde047; font-family: monospace;">20</code> 美元。你必须给每个顾客正确找零，也就是说净交易是每位顾客向你支付 5 美元。</p>
    <p style="margin: 0;">注意，一开始你手头没有任何零钱。如果你能给每位顾客正确找零，返回 <code style="color: #34d399; font-family: monospace;">true</code> ，否则返回 <code style="color: #f87171; font-family: monospace;">false</code> 。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: bills = [5,5,5,10,20]</div>
      <div>输出: true</div>
      <div>解释: 前 3 位顾客支付 $5，收下 $5。第 4 位支付 $10，找零 $5。第 5 位支付 $20，找零 $10 和 $5。所有顾客都成功找零。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: bills = [5,5,10,10,20]</div>
      <div>输出: false</div>
      <div>解释: 第 5 位顾客支付 $20，此时手头只有两张 $10，无法凑出 $15 找零，返回 false。</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; bills.length &le; 10^5</div>
      <div>• bills[i] 不是 5 就是 10 或是 20</div>
    </div>
  </div>
`;

export const LEMONADE_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 贪心核心：$5 钞票万能，找零 $20 时优先消耗 $10
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① $5 与 $10 的通用性差异</div>
        <p style="margin: 0; color: #94a3b8;">• <code style="color: #7dd3fc; font-family: monospace;">$5</code>：既可以用来给 $10 找零，也可以用来给 $20 找零（最万能！）。<br/>
        • <code style="color: #fbbf24; font-family: monospace;">$10</code>：只能用来给 $20 找零，无法给 $10 找零。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 找零 $20 时的贪心选择</div>
        <p style="margin: 0; color: #94a3b8;">收到 $20 时需要找零 $15：<br/>
        • <strong>贪心最优</strong>：优先给出 <code style="color: #34d399; font-family: monospace;">1 张 $10 + 1 张 $5</code>（消耗专用货币，保留万能的 $5）。<br/>
        • <strong>次优备选</strong>：若没有 $10，才给出 <code style="color: #fbbf24; font-family: monospace;">3 张 $5</code>。<br/>
        • 若两种方案均不满足，则找零失败，返回 <code style="color: #f87171; font-family: monospace;">false</code>。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 无需记录 $20 数量</div>
        <p style="margin: 0; color: #94a3b8;">因为 $20 面额无法用于找零任何顾客，只需维护 <code style="color: #7dd3fc; font-family: monospace;">five</code> 和 <code style="color: #7dd3fc; font-family: monospace;">ten</code> 两个计数器即可。</p>
      </div>
    </div>
  </div>
`;

export const LEMONADE_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public boolean lemonadeChange(int[] bills) {',
    '    int five = 0, ten = 0;',
    '    for (int bill : bills) {',
    '        if (bill == 5) {',
    '            five++; // 收到 $5，无需找零',
    '        } else if (bill == 10) {',
    '            if (five <= 0) return false;',
    '            five--; ten++; // 收到 $10，找零 $5',
    '        } else if (bill == 20) {',
    '            // 收到 $20，贪心优先消耗 $10+$5',
    '            if (ten > 0 && five > 0) {',
    '                ten--; five--;',
    '            } else if (five >= 3) {',
    '                five -= 3;',
    '            } else {',
    '                return false; // 找零失败',
    '            }',
    '        }',
    '    }',
    '    return true;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    bool lemonadeChange(vector<int>& bills) {',
    '        int five = 0, ten = 0;',
    '        for (int bill : bills) {',
    '            if (bill == 5) five++;',
    '            else if (bill == 10) {',
    '                if (five <= 0) return false;',
    '                five--; ten++;',
    '            } else if (bill == 20) {',
    '                if (ten > 0 && five > 0) {',
    '                    ten--; five--;',
    '                } else if (five >= 3) {',
    '                    five -= 3;',
    '                } else return false;',
    '            }',
    '        }',
    '        return true;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def lemonadeChange(self, bills: List[int]) -> bool:',
    '        five, ten = 0, 0',
    '        for bill in bills:',
    '            if bill == 5:',
    '                five += 1',
    '            elif bill == 10:',
    '                if five <= 0:',
    '                    return False',
    '                five -= 1',
    '                ten += 1',
    '            elif bill == 20:',
    '                if ten > 0 and five > 0:',
    '                    ten -= 1',
    '                    five -= 1',
    '                elif five >= 3:',
    '                    five -= 3',
    '                else:',
    '                    return False',
    '        return True',
  ],
  javascript: [
    'var lemonadeChange = function(bills) {',
    '    let five = 0, ten = 0;',
    '    for (let bill of bills) {',
    '        if (bill === 5) {',
    '            five++;',
    '        } else if (bill === 10) {',
    '            if (five <= 0) return false;',
    '            five--; ten++;',
    '        } else if (bill === 20) {',
    '            if (ten > 0 && five > 0) {',
    '                ten--; five--;',
    '            } else if (five >= 3) {',
    '                five -= 3;',
    '            } else {',
    '                return false;',
    '            }',
    '        }',
    '    }',
    '    return true;',
    '};',
  ],
};
