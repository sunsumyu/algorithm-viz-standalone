/**
 * LeetCode 376: 摆动序列 (Wiggle Subsequence)
 * 领域知识与题解精讲配置声明
 */

export const WIGGLE_SUBSEQUENCE_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 376</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">摆动序列 (Wiggle Subsequence)</h2>
    </div>
    <p style="margin: 0;">如果连续数字之间的差严格在正数和负数之间交替，则数字序列称为 <strong>摆动序列</strong> 。第一个差（如果存在的话）可能是正数或负数。仅有一个元素或者含两个不等元素的序列也视作摆动序列。</p>
    <p style="margin: 0;">给你一个整数数组 <code style="color: #fde047; font-family: monospace;">nums</code> ，返回 <code style="color: #fde047; font-family: monospace;">nums</code> 中作为 <strong>摆动序列</strong> 的 <strong>最长子序列的长度</strong> 。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: nums = [1,7,4,9,2,5]</div>
      <div>输出: 6</div>
      <div>解释: 整个序列均为摆动序列，各元素之间的差值为 (6, -3, 5, -7, 3) 。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: nums = [1,17,5,10,13,15,10,5,16,8]</div>
      <div>输出: 7</div>
      <div>解释: 子序列 [1, 17, 10, 13, 10, 16, 8] 是摆动序列，差值为 (16, -7, 3, -3, 6, -8) 。</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; nums.length &le; 1000</div>
      <div>• 0 &le; nums[i] &le; 1000</div>
    </div>
  </div>
`;

export const WIGGLE_SUBSEQUENCE_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 贪心核心：过滤单调坡与平坡，只统计峰值与谷值
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 局部最优：删除单调坡度上的中间节点</div>
        <p style="margin: 0; color: #94a3b8;">在连续递增的斜坡上，只需保留<strong>最右侧的峰顶</strong>；在连续递减的斜坡上，只需保留<strong>最下方的谷底</strong>。局部最优为贪心选择波峰和波谷，全局最优即可构成最长的交替摆动序列。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 峰谷判定条件</div>
        <p style="margin: 0; color: #94a3b8;">记 <code style="color: #7dd3fc; font-family: monospace;">curDiff = nums[i] - nums[i - 1]</code>：<br/>
        • <strong>谷底转峰顶</strong>：<code style="color: #fbbf24; font-family: monospace;">curDiff > 0 && preDiff <= 0</code><br/>
        • <strong>峰顶转谷底</strong>：<code style="color: #fbbf24; font-family: monospace;">curDiff < 0 && preDiff >= 0</code><br/>
        一旦触发方向反转，计数 <code style="color: #34d399; font-family: monospace;">count++</code>，并更新 <code style="color: #7dd3fc; font-family: monospace;">preDiff = curDiff</code>。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ preDiff 仅在出现摆动时更新</div>
        <p style="margin: 0; color: #94a3b8;">在单调坡或平坡中（如 <code style="color: #fde047; font-family: monospace;">1, 2, 2, 2, 3</code>），不应更新 <code style="color: #7dd3fc; font-family: monospace;">preDiff</code>，只有在真正跨过波峰/波谷并计入答案时才同步更新，从而自然过滤平坡。</p>
      </div>
    </div>
  </div>
`;

export const WIGGLE_SUBSEQUENCE_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int wiggleMaxLength(int[] nums) {',
    '    if (nums.length <= 1) return nums.length;',
    '    int curDiff = 0; // 当前差值',
    '    int preDiff = 0; // 前一对差值',
    '    int count = 1;   // 默认最右端有一个峰值/谷值',
    '    for (int i = 1; i < nums.length; i++) {',
    '        curDiff = nums[i] - nums[i - 1];',
    '        // 出现峰值或谷值',
    '        if ((curDiff > 0 && preDiff <= 0) || (curDiff < 0 && preDiff >= 0)) {',
    '            count++;',
    '            preDiff = curDiff; // 只在摆动变化时更新 preDiff',
    '        }',
    '    }',
    '    return count;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int wiggleMaxLength(vector<int>& nums) {',
    '        if (nums.size() <= 1) return nums.size();',
    '        int curDiff = 0;',
    '        int preDiff = 0;',
    '        int count = 1;',
    '        for (int i = 1; i < nums.size(); i++) {',
    '            curDiff = nums[i] - nums[i - 1];',
    '            if ((curDiff > 0 && preDiff <= 0) || (curDiff < 0 && preDiff >= 0)) {',
    '                count++;',
    '                preDiff = curDiff;',
    '            }',
    '        }',
    '        return count;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def wiggleMaxLength(self, nums: List[int]) -> int:',
    '        if len(nums) <= 1:',
    '            return len(nums)',
    '        cur_diff = 0',
    '        pre_diff = 0',
    '        count = 1',
    '        for i in range(1, len(nums)):',
    '            cur_diff = nums[i] - nums[i - 1]',
    '            if (cur_diff > 0 and pre_diff <= 0) or (cur_diff < 0 and pre_diff >= 0):',
    '                count += 1',
    '                pre_diff = cur_diff',
    '        return count',
  ],
  javascript: [
    'var wiggleMaxLength = function(nums) {',
    '    if (nums.length <= 1) return nums.length;',
    '    let curDiff = 0;',
    '    let preDiff = 0;',
    '    let count = 1;',
    '    for (let i = 1; i < nums.length; i++) {',
    '        curDiff = nums[i] - nums[i - 1];',
    '        if ((curDiff > 0 && preDiff <= 0) || (curDiff < 0 && preDiff >= 0)) {',
    '            count++;',
    '            preDiff = curDiff;',
    '        }',
    '    }',
    '    return count;',
    '};',
  ],
};
