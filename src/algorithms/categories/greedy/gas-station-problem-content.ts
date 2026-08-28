/**
 * LeetCode 134: 加油站 (Gas Station)
 * 领域知识与题解精讲配置声明
 */

export const GAS_STATION_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 134</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">加油站 (Gas Station)</h2>
    </div>
    <p style="margin: 0;">在一条环路上有 <code style="color: #fde047; font-family: monospace;">n</code> 个加油站，其中第 <code style="color: #fde047; font-family: monospace;">i</code> 个加油站有汽油 <code style="color: #fde047; font-family: monospace;">gas[i]</code> 升。</p>
    <p style="margin: 0;">你有一辆油箱容量无限的汽车，从第 <code style="color: #fde047; font-family: monospace;">i</code> 个加油站开往第 <code style="color: #fde047; font-family: monospace;">i+1</code> 个加油站需要消耗汽油 <code style="color: #fde047; font-family: monospace;">cost[i]</code> 升。你从其中的一个加油站出发，开始时油箱为空。</p>
    <p style="margin: 0;">给定两个整数数组 <code style="color: #fde047; font-family: monospace;">gas</code> 和 <code style="color: #fde047; font-family: monospace;">cost</code> ，如果你可以按顺时针方向绕环路行驶一周，则返回出发时加油站的编号，否则返回 <code style="color: #fde047; font-family: monospace;">-1</code> 。如果存在解，则保证它是 <strong>唯一</strong> 的。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: gas = [1,2,3,4,5], cost = [3,4,5,1,2]</div>
      <div>输出: 3</div>
      <div>解释: 从 3 号加油站(索引为 3 处)出发，可获得 4 升汽油。油箱有 4 升油。开往 4 号加油站，此时油箱有 4 - 1 + 5 = 8 升油...顺时针绕行一周回到 3 号加油站。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: gas = [2,3,4], cost = [3,4,3]</div>
      <div>输出: -1</div>
      <div>解释: 开往下一站的净消耗总是亏空，总汽油量 9 &lt; 总消耗量 10，无法环行一周。</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• n == gas.length == cost.length</div>
      <div>• 1 &le; n &le; 10^5</div>
      <div>• 0 &le; gas[i], cost[i] &le; 10^4</div>
    </div>
  </div>
`;

export const GAS_STATION_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 贪心核心：局部净油量一旦亏空，区间内所有点均不可为起点
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 全局总油量判定</div>
        <p style="margin: 0; color: #94a3b8;">如果总加油量 <code style="color: #fb7185; font-family: monospace;">totalSum &lt; 0</code>（即 <code style="color: #fb7185; font-family: monospace;">&sum; gas[i] &lt; &sum; cost[i]</code>），无论从哪个加油站出发，汽车必然无法绕行一圈，直接返回 <code style="color: #fb7185; font-family: monospace;">-1</code>。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 贪心跳跃：起点直接移至 i + 1</div>
        <p style="margin: 0; color: #94a3b8;">维护从候选起点出发的当前剩余油量 <code style="color: #7dd3fc; font-family: monospace;">curSum += gas[i] - cost[i]</code>。<br/>
        若遍历到第 <code style="color: #fbbf24; font-family: monospace;">i</code> 个站时 <code style="color: #fb7185; font-family: monospace;">curSum &lt; 0</code>，意味着从之前的候选起点 <code style="color: #7dd3fc; font-family: monospace;">start</code> 到 <code style="color: #fbbf24; font-family: monospace;">i</code> 之间的<strong>任何一个站出发，都在到达 i+1 之前必然断油</strong>！<br/>
        因此贪心地将新起点直接更新为 <code style="color: #34d399; font-family: monospace;">start = i + 1</code>，并重置 <code style="color: #34d399; font-family: monospace;">curSum = 0</code>！</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 单次遍历 O(N)</div>
        <p style="margin: 0; color: #94a3b8;">无需两层嵌套循环模拟，只需单次遍历同时累积 <code style="color: #7dd3fc; font-family: monospace;">totalSum</code> 和 <code style="color: #7dd3fc; font-family: monospace;">curSum</code>，即可在 <code style="color: #34d399; font-family: monospace;">O(N)</code> 时间与 <code style="color: #34d399; font-family: monospace;">O(1)</code> 空间内锁定唯一解！</p>
      </div>
    </div>
  </div>
`;

export const GAS_STATION_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int canCompleteCircuit(int[] gas, int[] cost) {',
    '    int curSum = 0;   // 当前从 start 出发的净剩余油量',
    '    int totalSum = 0; // 全局所有站点的总净油量',
    '    int start = 0;    // 贪心候选起点',
    '    for (int i = 0; i < gas.length; i++) {',
    '        int net = gas[i] - cost[i];',
    '        curSum += net;',
    '        totalSum += net;',
    '        if (curSum < 0) { // 当前累积油量断油',
    '            start = i + 1; // 起点直接移至 i + 1',
    '            curSum = 0;   // 重置当前油量',
    '        }',
    '    }',
    '    if (totalSum < 0) return -1; // 全局总油量不足，无解',
    '    return start;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {',
    '        int curSum = 0;',
    '        int totalSum = 0;',
    '        int start = 0;',
    '        for (int i = 0; i < gas.size(); i++) {',
    '            curSum += gas[i] - cost[i];',
    '            totalSum += gas[i] - cost[i];',
    '            if (curSum < 0) {',
    '                start = i + 1;',
    '                curSum = 0;',
    '            }',
    '        }',
    '        if (totalSum < 0) return -1;',
    '        return start;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def canCompleteCircuit(self, gas: List[int], cost: List[int]) -> int:',
    '        cur_sum = 0',
    '        total_sum = 0',
    '        start = 0',
    '        for i in range(len(gas)):',
    '            cur_sum += gas[i] - cost[i]',
    '            total_sum += gas[i] - cost[i]',
    '            if cur_sum < 0:',
    '                start = i + 1',
    '                cur_sum = 0',
    '        if total_sum < 0:',
    '            return -1',
    '        return start',
  ],
  javascript: [
    'var canCompleteCircuit = function(gas, cost) {',
    '    let curSum = 0;',
    '    let totalSum = 0;',
    '    let start = 0;',
    '    for (let i = 0; i < gas.length; i++) {',
    '        curSum += gas[i] - cost[i];',
    '        totalSum += gas[i] - cost[i];',
    '        if (curSum < 0) {',
    '            start = i + 1;',
    '            curSum = 0;',
    '        }',
    '    }',
    '    if (totalSum < 0) return -1;',
    '    return start;',
    '};',
  ],
};
