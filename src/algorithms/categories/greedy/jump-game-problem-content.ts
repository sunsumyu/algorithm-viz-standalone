/**
 * LeetCode 45: 跳跃游戏 II (Jump Game II)
 * 领域知识与题解精讲配置声明
 */

export const JUMP_GAME_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 45</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">跳跃游戏 II (Jump Game II)</h2>
    </div>
    <p style="margin: 0;">给定一个长度为 <code style="color: #fde047; font-family: monospace;">n</code> 的 0 索引整数数组 <code style="color: #fde047; font-family: monospace;">nums</code>。初始位置为 <code style="color: #fde047; font-family: monospace;">nums[0]</code>。</p>
    <p style="margin: 0;">每个元素 <code style="color: #fde047; font-family: monospace;">nums[i]</code> 表示从索引 <code style="color: #fde047; font-family: monospace;">i</code> 向前跳转的最大长度。换句话说，如果你在 <code style="color: #fde047; font-family: monospace;">nums[i]</code> 处，你可以跳转到任意 <code style="color: #fde047; font-family: monospace;">nums[i + j]</code> 处：</p>
    <ul style="margin: 0; padding-left: 20px;">
      <li><code style="color: #fde047; font-family: monospace;">0 &le; j &le; nums[i]</code> 且 <code style="color: #fde047; font-family: monospace;">i + j &lt; n</code></li>
    </ul>
    <p style="margin: 0;">返回到达 <code style="color: #fde047; font-family: monospace;">nums[n - 1]</code> 的 <strong>最小跳跃次数</strong> 。生成的测试用例可以保证可以到达 <code style="color: #fde047; font-family: monospace;">nums[n - 1]</code>。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: nums = [2,3,1,1,4]</div>
      <div>输出: 2</div>
      <div>解释: 跳到最后一个位置的最小跳跃数是 2。从下标为 0 跳到下标为 1 的位置，跳 1 步，然后跳 3 步到达数组的最后一个位置。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: nums = [2,3,0,1,4]</div>
      <div>输出: 2</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; nums.length &le; 10^4</div>
      <div>• 0 &le; nums[i] &le; 1000</div>
      <div>• 题目保证可以到达 nums[n-1]</div>
    </div>
  </div>
`;

export const JUMP_GAME_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 贪心核心：以最小步数跨越当前覆盖边界
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 当前覆盖边界 vs 下一步最远边界</div>
        <p style="margin: 0; color: #94a3b8;">• <code style="color: #7dd3fc; font-family: monospace;">curDistance</code>：当前步数所能覆盖的最远右边界。<br/>
        • <code style="color: #fbbf24; font-family: monospace;">nextDistance</code>：在当前步数覆盖范围内起跳，再走一步所能达到的全局最远边界。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 触碰边界即刻发生跳跃 (jumps++)</div>
        <p style="margin: 0; color: #94a3b8;">遍历指针 <code style="color: #7dd3fc; font-family: monospace;">i</code> 向右扫描并不断更新 <code style="color: #fbbf24; font-family: monospace;">nextDistance = Math.max(nextDistance, i + nums[i])</code>。<br/>
        当 <code style="color: #7dd3fc; font-family: monospace;">i == curDistance</code> 时，说明必须使用新的一步了：<code style="color: #34d399; font-family: monospace;">jumps++</code>，并将当前边界推至 <code style="color: #7dd3fc; font-family: monospace;">curDistance = nextDistance</code>。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 循环只需遍历到 nums.length - 2</div>
        <p style="margin: 0; color: #94a3b8;">如果当前边界已经覆盖终点，无需再在终点处多跳一次，因此循环只需遍历到倒数第二个元素。</p>
      </div>
    </div>
  </div>
`;

export const JUMP_GAME_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int jump(int[] nums) {',
    '    if (nums.length == 1) return 0;',
    '    int curDistance = 0;  // 当前跳跃覆盖的最远下标',
    '    int jumps = 0;        // 记录跳跃步数',
    '    int nextDistance = 0; // 下一步跳跃覆盖的最远下标',
    '    for (int i = 0; i < nums.length - 1; i++) {',
    '        nextDistance = Math.max(nextDistance, i + nums[i]); // 更新下一步最远',
    '        if (i == curDistance) { // 遇到当前覆盖最远距离下标',
    '            curDistance = nextDistance; // 推进到下一步覆盖最远',
    '            jumps++; // 步数加 1',
    '        }',
    '    }',
    '    return jumps;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int jump(vector<int>& nums) {',
    '        if (nums.size() == 1) return 0;',
    '        int curDistance = 0;',
    '        int jumps = 0;',
    '        int nextDistance = 0;',
    '        for (int i = 0; i < nums.size() - 1; i++) {',
    '            nextDistance = max(nextDistance, i + nums[i]);',
    '            if (i == curDistance) {',
    '                curDistance = nextDistance;',
    '                jumps++;',
    '            }',
    '        }',
    '        return jumps;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def jump(self, nums: List[int]) -> int:',
    '        if len(nums) == 1:',
    '            return 0',
    '        cur_distance = 0',
    '        jumps = 0',
    '        next_distance = 0',
    '        for i in range(len(nums) - 1):',
    '            next_distance = max(next_distance, i + nums[i])',
    '            if i == cur_distance:',
    '                cur_distance = next_distance',
    '                jumps += 1',
    '        return jumps',
  ],
  javascript: [
    'var jump = function(nums) {',
    '    if (nums.length === 1) return 0;',
    '    let curDistance = 0;',
    '    let jumps = 0;',
    '    let nextDistance = 0;',
    '    for (let i = 0; i < nums.length - 1; i++) {',
    '        nextDistance = Math.max(nextDistance, i + nums[i]);',
    '        if (i === curDistance) {',
    '            curDistance = nextDistance;',
    '            jumps++;',
    '        }',
    '    }',
    '    return jumps;',
    '};',
  ],
};
