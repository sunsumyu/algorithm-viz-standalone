/**
 * LeetCode 55: 跳跃游戏 (Jump Game)
 * 领域知识与题解精讲配置声明
 */

export const CAN_JUMP_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 55</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">跳跃游戏 (Jump Game)</h2>
    </div>
    <p style="margin: 0;">给你一个非负整数数组 <code style="color: #fde047; font-family: monospace;">nums</code> ，你最初位于数组的 <strong>第一个下标</strong> 。数组中的每个元素代表你在该位置可以跳跃的最大长度。</p>
    <p style="margin: 0;">判断你是否能够到达最后一个下标，如果可以，返回 <code style="color: #34d399; font-family: monospace;">true</code> ；否则，返回 <code style="color: #f87171; font-family: monospace;">false</code> 。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: nums = [2,3,1,1,4]</div>
      <div>输出: true</div>
      <div>解释: 可以先跳 1 步，从下标 0 到达下标 1, 然后再从下标 1 跳 3 步到达最后一个下标。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: nums = [3,2,1,0,4]</div>
      <div>输出: false</div>
      <div>解释: 无论怎样，总会到达下标为 3 的位置。但该下标的最大跳跃长度是 0 ， 所以永远不可能到达最后一个下标。</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; nums.length &le; 10^4</div>
      <div>• 0 &le; nums[i] &le; 10^5</div>
    </div>
  </div>
`;

export const CAN_JUMP_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 贪心核心：无需纠结具体跳几步，关键看「覆盖范围」
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 转化问题为「最大覆盖范围」</div>
        <p style="margin: 0; color: #94a3b8;">刚接触这道题很容易陷入思考「第 1 步跳 1 还是跳 2」的递归陷阱。实际上，每个位置上的数字代表的是<strong>最大能跳多远</strong>，而不是必须跳那么远。因此只要某个范围被覆盖，其中的每一个格子都可作为跳板！</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 局部最优与全局最优</div>
        <p style="margin: 0; color: #94a3b8;">• <strong>局部最优</strong>：在当前覆盖范围 <code style="color: #fbbf24; font-family: monospace;">cover</code> 内，遍历每个位置并尝试延伸最大覆盖范围 <code style="color: #7dd3fc; font-family: monospace;">cover = Math.max(cover, i + nums[i])</code>。<br/>
        • <strong>全局最优</strong>：只要最大覆盖范围能达到或超过终点下标（<code style="color: #34d399; font-family: monospace;">cover >= nums.length - 1</code>），即可断定必定可达！</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 线性单循环 O(N)</div>
        <p style="margin: 0; color: #94a3b8;">仅在 <code style="color: #7dd3fc; font-family: monospace;">i <= cover</code> 的合法区间内移动。若 <code style="color: #fb7185; font-family: monospace;">cover</code> 无法进一步推进且未到终点，循环自然终止返回 <code style="color: #fb7185; font-family: monospace;">false</code>。</p>
      </div>
    </div>
  </div>
`;

export const CAN_JUMP_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public boolean canJump(int[] nums) {',
    '    if (nums.length == 1) return true;',
    '    int cover = 0; // 记录当前能覆盖到的最远下标',
    '    for (int i = 0; i <= cover; i++) { // 只在覆盖范围内移动',
    '        cover = Math.max(cover, i + nums[i]); // 贪心扩展最大覆盖范围',
    '        if (cover >= nums.length - 1) return true; // 覆盖到终点立即返回成功',
    '    }',
    '    return false; // 遍历完覆盖范围仍未到达终点',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    bool canJump(vector<int>& nums) {',
    '        int cover = 0;',
    '        if (nums.size() == 1) return true;',
    '        for (int i = 0; i <= cover; i++) {',
    '            cover = max(i + nums[i], cover);',
    '            if (cover >= nums.size() - 1) return true;',
    '        }',
    '        return false;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def canJump(self, nums: List[int]) -> bool:',
    '        cover = 0',
    '        if len(nums) == 1:',
    '            return True',
    '        i = 0',
    '        while i <= cover:',
    '            cover = max(i + nums[i], cover)',
    '            if cover >= len(nums) - 1:',
    '                return True',
    '            i += 1',
    '        return False',
  ],
  javascript: [
    'var canJump = function(nums) {',
    '    if (nums.length === 1) return true;',
    '    let cover = 0;',
    '    for (let i = 0; i <= cover; i++) {',
    '        cover = Math.max(cover, i + nums[i]);',
    '        if (cover >= nums.length - 1) return true;',
    '    }',
    '    return false;',
    '};',
  ],
};
