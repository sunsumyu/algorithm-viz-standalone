/**
 * 柠檬水摊贩·贪心收银大亨 (Lemonade Tycoon: Greedy Cashier Simulation)
 * 经典贪心算法（Greedy Choice Property）、硬币找零与局部最优策略多语言题解
 */

export const LEMONADE_TYCOON_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    'using namespace std;',
    '',
    '// 经典贪心找零算法：每杯柠檬水 5 美元，顾客支付 5/10/20 美元',
    'bool lemonadeChange(const vector<int>& bills) {',
    '    int five = 0; // 5 美元钞票数量 (最通用硬币)',
    '    int ten = 0;  // 10 美元钞票数量',
    '',
    '    for (int bill : bills) {',
    '        if (bill == 5) {',
    '            five++; // 无需找零，直接收下',
    '        } else if (bill == 10) {',
    '            if (five == 0) return false; // 无法找零 5 元',
    '            five--;',
    '            ten++;',
    '        } else { // bill == 20，需找零 15 美元',
    '            // 贪心策略：优先消耗 1 张 10 元 + 1 张 5 元',
    '            // 因为 5 元不仅能给 20 找零，还能给 10 找零，比 10 元更珍贵！',
    '            if (ten > 0 && five > 0) {',
    '                ten--;',
    '                five--;',
    '            } else if (five >= 3) {',
    '                five -= 3;',
    '            } else {',
    '                return false;',
    '            }',
    '        }',
    '    }',
    '    return true;',
    '}',
  ],
  java: [
    'public class LemonadeChangeGreedy {',
    '    public static boolean lemonadeChange(int[] bills) {',
    '        int five = 0, ten = 0;',
    '        for (int bill : bills) {',
    '            if (bill == 5) {',
    '                five++;',
    '            } else if (bill == 10) {',
    '                if (five == 0) return false;',
    '                five--;',
    '                ten++;',
    '            } else {',
    '                if (ten > 0 && five > 0) {',
    '                    ten--;',
    '                    five--;',
    '                } else if (five >= 3) {',
    '                    five -= 3;',
    '                } else {',
    '                    return false;',
    '                }',
    '            }',
    '        }',
    '        return true;',
    '    }',
    '}',
  ],
  python: [
    'def lemonade_change(bills: list[int]) -> bool:',
    '    """贪心策略：找零 20 优先使用 10 + 5，保留万能 5 块"""',
    '    five = 0',
    '    ten = 0',
    '    for bill in bills:',
    '        if bill == 5:',
    '            five += 1',
    '        elif bill == 10:',
    '            if five == 0:',
    '                return False',
    '            five -= 1',
    '            ten += 1',
    '        else:',
    '            if ten > 0 and five > 0:',
    '                ten -= 1',
    '                five -= 1',
    '            elif five >= 3:',
    '                five -= 3',
    '            else:',
    '                return False',
    '    return True',
  ],
  javascript: [
    'function lemonadeChange(bills) {',
    '  let five = 0, ten = 0;',
    '  for (const bill of bills) {',
    '    if (bill === 5) five++;',
    '    else if (bill === 10) {',
    '      if (five === 0) return false;',
    '      five--; ten++;',
    '    } else {',
    '      if (ten > 0 && five > 0) { ten--; five--; }',
    '      else if (five >= 3) { five -= 3; }',
    '      else return false;',
    '    }',
    '  }',
    '  return true;',
    '}',
  ],
};

export const LEMONADE_TYCOON_PROBLEM_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
      <span style="font-size: 20px;">🍹</span>
      <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #0f172a;">柠檬水摊贩·贪心收银大亨 (Lemonade Tycoon)</h3>
      <span style="background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid #bfdbfe;">贪心经典 LeetCode 860</span>
    </div>

    <p style="font-size: 12.5px; color: #334155; margin-bottom: 10px;">
      你在热闹的海滩边经营一家柠檬水小摊，每杯柠檬水售价 <b>$5</b>。排队的顾客手中持有 <b>$5、$10 或 $20</b> 的钞票。你初始手头没有任何零钱，如何通过<b>贪心找零策略</b>确保每位顾客都能顺利拿到正确找零？
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🎮 摊贩经营玩法</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>🍹 60 FPS 海滩小摊</b>：顾客排队买水并递上大钞；</li>
          <li><b>💵 拟真收银抽屉</b>：实时存放 $5、$10 与 $20 钞票；</li>
          <li><b>✨ 贪心找零启示</b>：一键演示面对 $20 优先消耗 10+5 的最优策略。</li>
        </ul>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🧠 核心贪心选择性质</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>通用性权衡</b>：$5 既能找零 $10 也能找零 $20，而 $10 只能用于 $20；</li>
          <li><b>局部最优即全局最优</b>：遇到 $20 时，<b>无条件优先支出 10+5，尽量保留 5 元</b>！</li>
        </ul>
      </div>
    </div>
  </div>
`;

export const LEMONADE_TYCOON_ANALYSIS_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <h3 style="margin-top: 0; font-size: 14px; font-weight: 800; color: #0f172a;">贪心选择性质与证明</h3>

    <div style="margin-bottom: 10px;">
      <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #2563eb;">1. 为什么必须优先使用 $10 而不是三张 $5？</h4>
      <p style="font-size: 11.5px; color: #475569; margin: 0;">
        找零 $15 有两种方式：
        <br>• 方案 A：支出 1 张 $10 + 1 张 $5
        <br>• 方案 B：支出 3 张 $5
        <br>由于 $5 钞票是为后续 $10 顾客找零的<b>唯一手段</b>，而 $10 钞票功能受限。保留更多的 $5 钞票可以应对未来更加严苛的顾客组合，因此方案 A 严格优于方案 B！
      </p>
    </div>
  </div>
`;
