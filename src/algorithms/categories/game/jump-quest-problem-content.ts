/**
 * 弹簧鞋大冒险·跳跃覆盖范围 (Spring Jump Quest: Greedy Maximum Reach)
 * 经典贪心算法（Greedy Maximum Reach）、跳跃游戏 I & II (LeetCode 55 & 45) 多语言题解
 */

export const JUMP_QUEST_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 跳跃游戏 I (LeetCode 55)：判断是否能到达最后下标 (维护最大覆盖范围)',
    'bool canJump(const vector<int>& nums) {',
    '    int maxReach = 0;',
    '    for (int i = 0; i <= maxReach; i++) {',
    '        maxReach = max(maxReach, i + nums[i]);',
    '        if (maxReach >= nums.size() - 1) return true; // 已覆盖终点',
    '    }',
    '    return false; // 无法跨越死胡同',
    '}',
    '',
    '// 跳跃游戏 II (LeetCode 45)：以最少跳跃次数到达终点',
    'int jump(const vector<int>& nums) {',
    '    if (nums.size() <= 1) return 0;',
    '    int curEnd = 0;   // 当前这一步所能覆盖的最远右边界',
    '    int nextMax = 0;  // 在当前区间内起跳所能达到的下一步全局最大范围',
    '    int stepCount = 0; // 最少跳跃步数',
    '',
    '    for (int i = 0; i < nums.size() - 1; i++) {',
    '        nextMax = max(nextMax, i + nums[i]); // 持续更新下一步最大潜力',
    '        if (i == curEnd) { // 走到当前步数的极限边界，必须再跳一次',
    '            curEnd = nextMax;',
    '            stepCount++;',
    '            if (curEnd >= nums.size() - 1) break;',
    '        }',
    '    }',
    '    return stepCount;',
    '}',
  ],
  java: [
    'public class JumpGameGreedy {',
    '    // 跳跃游戏 I: O(N) 贪心最大覆盖范围',
    '    public static boolean canJump(int[] nums) {',
    '        int maxReach = 0;',
    '        for (int i = 0; i <= maxReach; i++) {',
    '            maxReach = Math.max(maxReach, i + nums[i]);',
    '            if (maxReach >= nums.length - 1) return true;',
    '        }',
    '        return false;',
    '    }',
    '',
    '    // 跳跃游戏 II: 最少步数到达终点',
    '    public static int jump(int[] nums) {',
    '        int curEnd = 0, nextMax = 0, steps = 0;',
    '        for (int i = 0; i < nums.length - 1; i++) {',
    '            nextMax = Math.max(nextMax, i + nums[i]);',
    '            if (i == curEnd) {',
    '                curEnd = nextMax;',
    '                steps++;',
    '                if (curEnd >= nums.length - 1) break;',
    '            }',
    '        }',
    '        return steps;',
    '    }',
    '}',
  ],
  python: [
    'def jump_game_greedy(nums: list[int]) -> tuple[bool, int]:',
    '    """贪心覆盖范围与最少跳跃步数求解"""',
    '    max_reach = 0',
    '    cur_end = 0',
    '    steps = 0',
    '    n = len(nums)',
    '    if n <= 1:',
    '        return True, 0',
    '    ',
    '    for i in range(n - 1):',
    '        max_reach = max(max_reach, i + nums[i])',
    '        if i == cur_end:',
    '            cur_end = max_reach',
    '            steps += 1',
    '            if cur_end >= n - 1:',
    '                break',
    '    return cur_end >= n - 1, steps',
  ],
  javascript: [
    'function solveJumpGame(nums) {',
    '  let maxReach = 0, curEnd = 0, steps = 0;',
    '  for (let i = 0; i < nums.length - 1; i++) {',
    '    maxReach = Math.max(maxReach, i + nums[i]);',
    '    if (i === curEnd) {',
    '      curEnd = maxReach;',
    '      steps++;',
    '      if (curEnd >= nums.length - 1) break;',
    '    }',
    '  }',
    '  return { canReach: curEnd >= nums.length - 1, minSteps: steps };',
    '}',
  ],
};

export const JUMP_QUEST_PROBLEM_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
      <span style="font-size: 20px;">🦘</span>
      <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #0f172a;">弹簧鞋大冒险·跳跃覆盖范围 (Spring Jump Quest)</h3>
      <span style="background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid #bfdbfe;">贪心经典 LeetCode 55 & 45</span>
    </div>

    <p style="font-size: 12.5px; color: #334155; margin-bottom: 10px;">
      勇士穿着高科技弹簧跳跳鞋，面对悬空的霓虹跳台序列。每个跳台赋予不同的弹跳动力 $nums[i]$。我们<b>不纠结于每一步具体跳到哪一个格子</b>，而是<b>关注当前跳跃所能覆盖的最大范围（Max Reach）</b>！如何以最少步数飞跃深渊抵达终点？
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🎮 平台飞跃玩法</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>🦘 60 FPS 抛物线飞跃</b>：点击跳台弹跳飞跃，留下火箭推进光迹；</li>
          <li><b>🟢 动态覆盖光场</b>：实时呈现当前跳跃能量辐射的绿色覆盖区；</li>
          <li><b>✨ 最少步数通关</b>：一键演算 LeetCode 45 贪心最少步数黄金路线！</li>
        </ul>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🧠 核心贪心思想</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>看覆盖范围而非具体落点</b>：只要最大覆盖范围能越过终点，就必定可达；</li>
          <li><b>最少步数区间更新</b>：在当前步数极限 $curEnd$ 内搜寻下一步的最大潜力 $nextMax$，到达边界时步数 $+1$。</li>
        </ul>
      </div>
    </div>
  </div>
`;

export const JUMP_QUEST_ANALYSIS_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <h3 style="margin-top: 0; font-size: 14px; font-weight: 800; color: #0f172a;">跳跃覆盖范围的贪心最优证明</h3>

    <div style="margin-bottom: 10px;">
      <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #2563eb;">1. 为什么无需动态规划，仅需 O(N) 贪心？</h4>
      <p style="font-size: 11.5px; color: #475569; margin: 0;">
        在区间 $[start, curEnd]$ 内部起跳的所有方案中，必然存在一个使得后续跳跃覆盖最远的位置 $nextMax$。我们只需在该区间内以贪心方式记录 $nextMax = \\max(nextMax, i + nums[i])$，当遍历指针推进到 $curEnd$ 时，必须且仅需消耗 1 步并将边界拓展为 $nextMax$！
      </p>
    </div>
  </div>
`;
