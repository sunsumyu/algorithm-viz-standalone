/**
 * 暗夜神偷·街区金库潜行 (Cyberpunk House Robber: Heist DP)
 * 经典动态规划算法（LeetCode 198 打家劫舍 & LeetCode 213 环形打家劫舍）
 * 多语言题解、状态机推导与交互式关卡配置
 */

export const HEIST_ROBBER_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 经典线性动态规划：打家劫舍 (LeetCode 198)',
    'int rob(vector<int>& nums) {',
    '    int n = nums.size();',
    '    if (n == 0) return 0;',
    '    if (n == 1) return nums[0];',
    '',
    '    // dp[i] 表示偷窃前 i 间房屋能获得的最大金额',
    '    vector<int> dp(n, 0);',
    '    dp[0] = nums[0];',
    '    dp[1] = max(nums[0], nums[1]);',
    '',
    '    // 状态转移方程：dp[i] = max(不偷当前房: dp[i-1], 偷窃当前房: dp[i-2] + nums[i])',
    '    for (int i = 2; i < n; i++) {',
    '        dp[i] = max(dp[i - 1], dp[i - 2] + nums[i]);',
    '    }',
    '',
    '    return dp[n - 1];',
    '}',
    '',
    '// 空间优化 O(1) 滚动变量版本',
    'int robOptimized(vector<int>& nums) {',
    '    int prev2 = 0, prev1 = 0;',
    '    for (int num : nums) {',
    '        int cur = max(prev1, prev2 + num);',
    '        prev2 = prev1;',
    '        prev1 = cur;',
    '    }',
    '    return prev1;',
    '}',
  ],
  java: [
    'public class HouseRobberHeist {',
    '    // 线性动态规划：打家劫舍',
    '    public int rob(int[] nums) {',
    '        if (nums == null || nums.length == 0) return 0;',
    '        if (nums.length == 1) return nums[0];',
    '',
    '        int[] dp = new int[nums.length];',
    '        dp[0] = nums[0];',
    '        dp[1] = Math.max(nums[0], nums[1]);',
    '',
    '        for (int i = 2; i < nums.length; i++) {',
    '            // 核心决策：放弃当前房屋 vs 偷窃当前房屋(需结合前前房最优解)',
    '            dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);',
    '        }',
    '',
    '        return dp[nums.length - 1];',
    '    }',
    '}',
  ],
  python: [
    'def rob(nums: list[int]) -> int:',
    '    """线性动态规划：打家劫舍最大收益"""',
    '    if not nums:',
    '        return 0',
    '    if len(nums) == 1:',
    '        return nums[0]',
    '    ',
    '    # dp 数组记录前 i 个房屋的最大偷窃金额',
    '    dp = [0] * len(nums)',
    '    dp[0] = nums[0]',
    '    dp[1] = max(nums[0], nums[1])',
    '    ',
    '    for i in range(2, len(nums)):',
    '        # 状态转移方程：max(不偷此房, 偷此房+前前房最大值)',
    '        dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])',
    '        ',
    '    return dp[-1]',
  ],
  javascript: [
    'function rob(nums) {',
    '  if (!nums.length) return 0;',
    '  if (nums.length === 1) return nums[0];',
    '  ',
    '  const dp = new Array(nums.length).fill(0);',
    '  dp[0] = nums[0];',
    '  dp[1] = Math.max(nums[0], nums[1]);',
    '  ',
    '  for (let i = 2; i < nums.length; i++) {',
    '    dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);',
    '  }',
    '  ',
    '  return dp[nums.length - 1];',
    '}',
  ],
};

export const HEIST_ROBBER_PROBLEM_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
      <span style="font-size: 20px;">🥷</span>
      <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #0f172a;">暗夜神偷·街区金库潜行 (House Robber Heist)</h3>
      <span style="background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid #bfdbfe;">动态规划经典 LeetCode 198 / 213</span>
    </div>

    <p style="font-size: 12.5px; color: #334155; margin-bottom: 10px;">
      你是一名潜入赛博都市的顶级夜行神偷。整条街区排列着若干座豪华别墅，每座房屋存放着特定金额的黄金 $[nums_0, nums_1, \\dots, nums_{n-1}]$。然而相邻两栋房屋之间连接着<b>高度敏感的防盗红外激光警报器</b>——如果<b>两栋相邻的房屋在同一晚被盗，系统将立即触发全城警报并封锁街区</b>！
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🎮 街区潜行玩法</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>🥷 60 FPS 霓虹街区跑酷</b>：点击别墅规划潜入路线，相邻房屋自动点亮红色激光锁死；</li>
          <li><b>💰 实时金库收益与评级</b>：挑战自己的潜行路线，看能否达到动态规划理论最大收益；</li>
          <li><b>✨ 动规状态机单步推演</b>：实时观察 $dp[i]$ 决策计算与金色最佳转移路径！</li>
        </ul>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🧠 动态规划精髓</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>无后效性子问题</b>：第 $i$ 间房的最大收益仅取决于前一间与前前间的最优解；</li>
          <li><b>二选一状态转移</b>：$dp[i] = \\max(dp[i-1], dp[i-2] + nums[i])$。</li>
        </ul>
      </div>
    </div>
  </div>
`;

export const HEIST_ROBBER_ANALYSIS_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <h3 style="margin-top: 0; font-size: 14px; font-weight: 800; color: #0f172a;">动态规划状态转移与环形扩展解析</h3>

    <div style="margin-bottom: 10px;">
      <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #2563eb;">1. 状态定义与转移方程推导</h4>
      <p style="font-size: 11.5px; color: #475569; margin: 0 0 6px 0;">
        设 $dp[i]$ 表示在前 $i$ 间房屋（下标 $0 \\sim i$）中潜行能获得的最大金额：
      </p>
      <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
        <li><b>情况 1（不偷第 $i$ 间房）</b>：此时第 $i-1$ 间房偷或不偷皆可，最大收益直接继承为 $dp[i-1]$；</li>
        <li><b>情况 2（偷窃第 $i$ 间房）</b>：由于相邻警报约束，第 $i-1$ 间房绝对不能偷，因此最大收益为 $dp[i-2] + nums[i]$。</li>
      </ul>
      <p style="font-size: 11.5px; color: #475569; margin: 6px 0 0 0;">
        综合两种情况取最大值即得：<b>$dp[i] = \\max(dp[i-1], dp[i-2] + nums[i])$</b>。
      </p>
    </div>

    <div style="margin-bottom: 10px;">
      <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #0891b2;">2. 环形街区扩展 (LeetCode 213 打家劫舍 II)</h4>
      <p style="font-size: 11.5px; color: #475569; margin: 0;">
        若街区首尾相连成环（第一间与最后一间相邻），则首尾两间房屋不能同时被盗！我们可以将环拆解为两条独立的线性子街区：<br/>
        1. 考虑区间 $[0, n-2]$（包含首间，排除尾间）；<br/>
        2. 考虑区间 $[1, n-1]$（排除首间，包含尾间）；<br/>
        最终全局最优解即为：$\\max(rob(0, n-2), rob(1, n-1))$！
      </p>
    </div>
  </div>
`;
