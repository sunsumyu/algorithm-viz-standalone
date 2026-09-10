/**
 * LeetCode 53: 最大子数组和 (Maximum Subarray)
 * 领域知识与题解精讲配置声明
 */

export const MAX_SUBARRAY_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 53</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">最大子数组和 (Maximum Subarray)</h2>
    </div>
    <p style="margin: 0;">给你一个整数数组 <code style="color: #fde047; font-family: monospace;">nums</code> ，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。</p>
    <p style="margin: 0;"><strong>子数组</strong> 是数组中的一个连续部分。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: nums = [-2,1,-3,4,-1,2,1,-5,4]</div>
      <div>输出: 6</div>
      <div>解释: 连续子数组 [4,-1,2,1] 的和最大，为 6 。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: nums = [1]</div>
      <div>输出: 1</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 3:</div>
      <div>输入: nums = [5,4,-1,7,8]</div>
      <div>输出: 23</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; nums.length &le; 10^5</div>
      <div>• -10^4 &le; nums[i] &le; 10^4</div>
    </div>
  </div>
`;

export const MAX_SUBARRAY_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 贪心核心：负数累加和只会拖累后续求和
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 局部最优：当连续和 count < 0 时果断放弃</div>
        <p style="margin: 0; color: #94a3b8;">如果当前连续和 <code style="color: #fb7185; font-family: monospace;">count &lt; 0</code>，那么任何后续元素加上这个负数连续和，结果一定会比该元素自身<strong>更小</strong>！因此一旦 <code style="color: #fb7185; font-family: monospace;">count &lt; 0</code>，应立即重置 <code style="color: #7dd3fc; font-family: monospace;">count = 0</code>，从下一个元素重新起跑。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 全局最优：随时记录历史最大和</div>
        <p style="margin: 0; color: #94a3b8;">每遍历一个数字并加入 <code style="color: #7dd3fc; font-family: monospace;">count</code> 后，立即执行 <code style="color: #34d399; font-family: monospace;">res = Math.max(res, count)</code>，确保捕获出现过的最高峰值。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 单次线性遍历 O(N)</div>
        <p style="margin: 0; color: #94a3b8;">无需暴力 $O(N^2)$ 枚举所有子数组起止点，仅需单指针一遍扫描，空间复杂度为常数级 <code style="color: #7dd3fc; font-family: monospace;">O(1)</code>。</p>
      </div>
    </div>
  </div>
`;

export const MAX_SUBARRAY_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int maxSubArray(int[] nums) {',
    '    if (nums.length == 0) return 0;',
    '    int res = Integer.MIN_VALUE;',
    '    int count = 0;',
    '    for (int i = 0; i < nums.length; i++) {',
    '        count += nums[i];',
    '        if (count > res) {',
    '            res = count; // 取区间累计的最大值（相当于不断确定最大子序终止位置）',
    '        }',
    '        if (count < 0) {',
    '            count = 0; // 相当于重置最大子序起始位置，因为遇到负数一定是拉低总和',
    '        }',
    '    }',
    '    return res;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int maxSubArray(vector<int>& nums) {',
    '        int result = INT_MIN;',
    '        int count = 0;',
    '        for (int i = 0; i < nums.size(); i++) {',
    '            count += nums[i];',
    '            if (count > result) {',
    '                result = count;',
    '            }',
    '            if (count < 0) {',
    '                count = 0;',
    '            }',
    '        }',
    '        return result;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def maxSubArray(self, nums: List[int]) -> int:',
    '        result = float("-inf")',
    '        count = 0',
    '        for num in nums:',
    '            count += num',
    '            if count > result:',
    '                result = count',
    '            if count < 0:',
    '                count = 0',
    '        return result',
  ],
  javascript: [
    'var maxSubArray = function(nums) {',
    '    let result = -Infinity;',
    '    let count = 0;',
    '    for (let i = 0; i < nums.length; i++) {',
    '        count += nums[i];',
    '        if (count > result) {',
    '            result = count;',
    '        }',
    '        if (count < 0) {',
    '            count = 0;',
    '        }',
    '    }',
    '    return result;',
    '};',
  ],
};
