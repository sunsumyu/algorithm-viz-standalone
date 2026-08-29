/**
 * LeetCode 209: 长度最小的子数组 (Minimum Size Subarray Sum)
 * 领域知识与题解精讲配置声明
 */

export const MIN_SUBARRAY_LEN_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 209</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">长度最小的子数组 (Minimum Size Subarray Sum)</h2>
    </div>
    <p style="margin: 0;">给定一个含有 <code style="color: #fde047; font-family: monospace;">n</code> 个正整数的数组和一个正整数 <code style="color: #fde047; font-family: monospace;">target</code> 。</p>
    <p style="margin: 0;">找出该数组中满足其总和 <strong>&ge; target</strong> 的长度最小的 <strong>连续子数组</strong> <code style="color: #60a5fa; font-family: monospace;">[nums<sub>l</sub>, nums<sub>l+1</sub>, ..., nums<sub>r-1</sub>, nums<sub>r</sub>]</code> ，并返回其长度。如果不存在符合条件的子数组，返回 <code style="color: #f87171; font-family: monospace;">0</code> 。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: target = 7, nums = [2,3,1,2,4,3]</div>
      <div>输出: 2</div>
      <div style="color: #94a3b8;">解释: 子数组 [4,3] 是该条件下的长度最小的子数组。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: target = 4, nums = [1,4,4]</div>
      <div>输出: 1</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 3:</div>
      <div>输入: target = 11, nums = [1,1,1,1,1,1,1,1]</div>
      <div>输出: 0</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; target &le; 10<sup>9</sup></div>
      <div>• 1 &le; nums.length &le; 10<sup>5</sup></div>
      <div>• 1 &le; nums[i] &le; 10<sup>4</sup></div>
    </div>
  </div>
`;

export const MIN_SUBARRAY_LEN_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 滑动窗口（双指针）：动态调整窗口边界，O(n) 最优解
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 滑动窗口核心三要素</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>窗口内是什么？</strong> 满足 <code style="color: #fde047; font-family: monospace;">总和 &ge; target</code> 的连续正整数子数组；<br/>
        2. <strong>如何移动窗口的起始位置（左边界 left）？</strong> 当窗口内元素和 <code style="color: #34d399; font-family: monospace;">sum &ge; target</code> 时，记录当前长度，并不断右移 <code style="color: #fbbf24; font-family: monospace;">left</code> 收缩窗口，寻找更短的可能性！<br/>
        3. <strong>如何移动窗口的结束位置（右边界 right）？</strong> 遍历数组，不断右移 <code style="color: #38bdf8; font-family: monospace;">right</code> 扩大窗口加入新元素。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 为什么时间复杂度是 O(n)？</div>
        <p style="margin: 0; color: #94a3b8;">
        虽然代码中有 <code style="color: #f87171; font-family: monospace;">for</code> 循环嵌套 <code style="color: #f87171; font-family: monospace;">while</code> 循环，但每个元素在整个过程中<strong>最多只进入窗口一次（right++），移出窗口一次（left++）</strong>。<br/>
        每个元素最多操作 2 次，总操作次数为 <code style="color: #60a5fa; font-family: monospace;">2n</code>，因此时间复杂度是严格的 <code style="color: #34d399; font-family: monospace;">O(n)</code>。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 常见陷阱</div>
        <p style="margin: 0; color: #94a3b8;">
        • 忘记如果不存在满足条件的子数组，应该返回 <code style="color: #f87171; font-family: monospace;">0</code> 而不是初始的无限大值；<br/>
        • 必须用 <code style="color: #34d399; font-family: monospace;">while (sum &ge; target)</code> 连续收缩左边界，而不能只用 <code style="color: #f87171; font-family: monospace;">if</code> 一次性判断！
        </p>
      </div>
    </div>
  </div>
`;

export const MIN_SUBARRAY_LEN_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int minSubArrayLen(int target, int[] nums) {',
    '    int left = 0, sum = 0, minLen = Integer.MAX_VALUE;',
    '    for (int right = 0; right < nums.length; right++) {',
    '        sum += nums[right];',
    '        while (sum >= target) {',
    '            minLen = Math.min(minLen, right - left + 1);',
    '            sum -= nums[left];',
    '            left++;',
    '        }',
    '    }',
    '    return minLen == Integer.MAX_VALUE ? 0 : minLen;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int minSubArrayLen(int target, vector<int>& nums) {',
    '        int left = 0, sum = 0, minLen = INT_MAX;',
    '        for (int right = 0; right < nums.size(); right++) {',
    '            sum += nums[right];',
    '            while (sum >= target) {',
    '                minLen = min(minLen, right - left + 1);',
    '                sum -= nums[left];',
    '                left++;',
    '            }',
    '        }',
    '        return minLen == INT_MAX ? 0 : minLen;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def minSubArrayLen(self, target: int, nums: List[int]) -> int:',
    '        left = 0',
    '        sum_val = 0',
    '        min_len = float("inf")',
    '        for right in range(len(nums)):',
    '            sum_val += nums[right]',
    '            while sum_val >= target:',
    '                min_len = min(min_len, right - left + 1)',
    '                sum_val -= nums[left]',
    '                left += 1',
    '        return 0 if min_len == float("inf") else min_len',
  ],
  javascript: [
    'var minSubArrayLen = function(target, nums) {',
    '    let left = 0, sum = 0, minLen = Infinity;',
    '    for (let right = 0; right < nums.length; right++) {',
    '        sum += nums[right];',
    '        while (sum >= target) {',
    '            minLen = Math.min(minLen, right - left + 1);',
    '            sum -= nums[left];',
    '            left++;',
    '        }',
    '    }',
    '    return minLen === Infinity ? 0 : minLen;',
    '};',
  ],
};
