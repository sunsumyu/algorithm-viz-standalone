/**
 * 极速加油站·环岛拉力赛 (Gas Station Rally: Greedy Circuit Runner)
 * 经典贪心算法（Greedy Algorithm）、环形数组与局部最优推导全局最优多语言题解
 */

export const GAS_STATION_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    'using namespace std;',
    '',
    '// 经典贪心算法：一次遍历 O(N) 时间、O(1) 空间求解环形加油站起点',
    'int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {',
    '    int curSum = 0;   // 当前起点出发的累计净油量',
    '    int totalSum = 0; // 全局总净油量',
    '    int start = 0;    // 候选起始加油站',
    '',
    '    for (int i = 0; i < gas.size(); i++) {',
    '        int rest = gas[i] - cost[i];',
    '        curSum += rest;',
    '        totalSum += rest;',
    '',
    '        // 贪心决策：若从 start 出发在 i 处油量透支 (curSum < 0)',
    '        // 则 [start, i] 之间的任何站点都绝不可能作为合法起点！',
    '        if (curSum < 0) {',
    '            start = i + 1; // 贪心重置起点为 i + 1',
    '            curSum = 0;   // 重置当前累计油箱',
    '        }',
    '    }',
    '',
    '    // 若总加油量 < 总耗油量，则无论从哪里出发都无法绕行一周',
    '    return totalSum < 0 ? -1 : start;',
    '}',
  ],
  java: [
    'public class GasStationGreedy {',
    '    public static int canCompleteCircuit(int[] gas, int[] cost) {',
    '        int curSum = 0;',
    '        int totalSum = 0;',
    '        int start = 0;',
    '',
    '        for (int i = 0; i < gas.length; i++) {',
    '            int rest = gas[i] - cost[i];',
    '            curSum += rest;',
    '            totalSum += rest;',
    '            if (curSum < 0) {',
    '                start = i + 1;',
    '                curSum = 0;',
    '            }',
    '        }',
    '        return totalSum < 0 ? -1 : start;',
    '    }',
    '}',
  ],
  python: [
    'def can_complete_circuit(gas: list[int], cost: list[int]) -> int:',
    '    """贪心算法：局部透支即刻跳跃起点"""',
    '    cur_sum = 0',
    '    total_sum = 0',
    '    start = 0',
    '',
    '    for i in range(len(gas)):',
    '        rest = gas[i] - cost[i]',
    '        cur_sum += rest',
    '        total_sum += rest',
    '        if cur_sum < 0:',
    '            start = i + 1',
    '            cur_sum = 0',
    '',
    '    return start if total_sum >= 0 else -1',
  ],
  javascript: [
    'function canCompleteCircuit(gas, cost) {',
    '  let curSum = 0;',
    '  let totalSum = 0;',
    '  let start = 0;',
    '  for (let i = 0; i < gas.length; i++) {',
    '    const rest = gas[i] - cost[i];',
    '    curSum += rest;',
    '    totalSum += rest;',
    '    if (curSum < 0) {',
    '      start = i + 1;',
    '      curSum = 0;',
    '    }',
    '  }',
    '  return totalSum < 0 ? -1 : start;',
    '}',
  ],
};

export const GAS_STATION_PROBLEM_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
      <span style="font-size: 20px;">🏎️</span>
      <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #0f172a;">极速加油站·环岛拉力赛 (Gas Station Greedy Circuit)</h3>
      <span style="background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid #bfdbfe;">贪心经典题 LeetCode 134</span>
    </div>

    <p style="font-size: 12.5px; color: #334155; margin-bottom: 10px;">
      在一条环形赛道上有 $N$ 个加油站，每个加油站提供 $gas[i]$ 升燃油，从第 $i$ 站开往第 $i+1$ 站需要消耗 $cost[i]$ 升燃油。你驾驶赛车从油箱为空开始，寻找一个<b>能够顺时针绕行赛道一周的起始加油站</b>！
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🎮 拉力赛车玩法</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>🏎️ 60 FPS 环形赛道</b>：赛车在霓虹环道上实时行驶、加油与油箱消耗；</li>
          <li><b>⛽ 动态油箱表盘</b>：实时监控当前剩余油量、加加油站瞬时补给；</li>
          <li><b>✨ 贪心启示之眼</b>：一键高亮唯一合法起点并启动胜利巡游！</li>
        </ul>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🧠 核心贪心证明</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>局部透支剪枝</b>：若从 $start$ 走到 $k$ 抛锚（$curSum < 0$），则 $[start, k]$ 之间任意站作为起点必定都会在 $k$ 抛锚！</li>
          <li><b>直接跳跃重置</b>：直接将下一候选起点置为 $k+1$；</li>
          <li><b>全局充要条件</b>：只要 $\\sum gas \\ge \\sum cost$，就必定存在合法环行解。</li>
        </ul>
      </div>
    </div>
  </div>
`;

export const GAS_STATION_ANALYSIS_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <h3 style="margin-top: 0; font-size: 14px; font-weight: 800; color: #0f172a;">贪心最优子结构与跳跃剪枝证明</h3>

    <div style="margin-bottom: 10px;">
      <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #2563eb;">1. 为什么暴力扫描是 $O(N^2)$，贪心只需 $O(N)$？</h4>
      <p style="font-size: 11.5px; color: #475569; margin: 0;">
        假设从 $A$ 出发最远能到达 $B$ 并在驶向 $B+1$ 时油量透支。这意味着从 $A$ 到 $B$ 中间任意站点 $C$，从 $A$ 携带非负油量到达 $C$ 尚且无法到达 $B+1$；若直接以 $C$ 为起点（初始油量为 0），更不可能越过 $B$！
        <br>因此<b>直接跳过 $[A, B]$ 内的所有中间点，从 $B+1$ 重新开始</b>，保证每个加油站仅被访问 1 次！
      </p>
    </div>
  </div>
`;
