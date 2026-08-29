/**
 * LeetCode 15: 三数之和 (Three Sum)
 * 领域知识与题解精讲配置声明
 */

export const THREE_SUM_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 15</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">三数之和 (3Sum)</h2>
    </div>
    <p style="margin: 0;">给你一个整数数组 <code style="color: #fde047; font-family: monospace;">nums</code> ，判断是否存在三元组 <code style="color: #fde047; font-family: monospace;">[nums[i], nums[j], nums[k]]</code> 满足 <code style="color: #fde047; font-family: monospace;">i != j</code>、<code style="color: #fde047; font-family: monospace;">i != k</code> 且 <code style="color: #fde047; font-family: monospace;">j != k</code> ，同时还满足 <code style="color: #fde047; font-family: monospace;">nums[i] + nums[j] + nums[k] == 0</code> 。</p>
    <p style="margin: 0;">请你返回所有和为 <code style="color: #fde047; font-family: monospace;">0</code> 且 <strong>不重复</strong> 的三元组。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: nums = [-1,0,1,2,-1,-4]</div>
      <div>输出: [[-1,-1,2],[-1,0,1]]</div>
      <div style="color: #94a3b8;">解释: nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0 。nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0 。nums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0 。不重复的三元组是 [-1,0,1] 和 [-1,-1,2] 。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: nums = [0,1,1]</div>
      <div>输出: []</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 3 &le; nums.length &le; 3000</div>
      <div>• -10<sup>5</sup> &le; nums[i] &le; 10<sup>5</sup></div>
    </div>
  </div>
`;

export const THREE_SUM_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 排序 + 双指针 + 去重剪枝：高效击破三数之和
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 为什么不用哈希表而用双指针？</div>
        <p style="margin: 0; color: #94a3b8;">
        两数之和用哈希表非常容易，但三数之和要求<strong>答案三元组不能重复</strong>。如果用哈希表，复杂的去重逻辑非常繁琐容易超时；而<strong>先对数组排序，再使用首尾双指针</strong>能够极其优雅、高效地处理去重问题！
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 核心双指针与去重逻辑</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>数组升序排序</strong>；<br/>
        2. 固定第一个数 <code style="color: #38bdf8; font-family: monospace;">nums[i]</code>：若 <code style="color: #f87171; font-family: monospace;">nums[i] > 0</code>，后面的数更大，三数之和不可能为 0，直接 break；<br/>
        3. <strong>i 的去重：</strong> 若 <code style="color: #fbbf24; font-family: monospace;">i > 0 && nums[i] == nums[i-1]</code>，说明当前数值已经完全处理过，直接 continue；<br/>
        4. 双指针初始化：<code style="color: #a78bfa; font-family: monospace;">left = i + 1, right = n - 1</code>；<br/>
        5. 计算 <code style="color: #fde047; font-family: monospace;">sum = nums[i] + nums[left] + nums[right]</code>：<br/>
        &nbsp;&nbsp;• <code style="color: #38bdf8; font-family: monospace;">sum > 0</code>: 说明和太大，<code style="color: #38bdf8; font-family: monospace;">right--</code>；<br/>
        &nbsp;&nbsp;• <code style="color: #38bdf8; font-family: monospace;">sum < 0</code>: 说明和太小，<code style="color: #38bdf8; font-family: monospace;">left++</code>；<br/>
        &nbsp;&nbsp;• <code style="color: #34d399; font-family: monospace;">sum == 0</code>: 记录答案，并分别对 <code style="color: #34d399; font-family: monospace;">left</code> 和 <code style="color: #34d399; font-family: monospace;">right</code> 持续跳过重复项（<code style="color: #34d399; font-family: monospace;">nums[left] == nums[left+1]</code>, <code style="color: #34d399; font-family: monospace;">nums[right] == nums[right-1]</code>）。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 复杂度分析</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(n²)</code>，排序 O(n log n)，外层 for 循环配合双指针扫描总共 O(n²)。<br/>
        • 空间复杂度：<code style="color: #34d399; font-family: monospace;">O(1)</code> 或 O(log n) 排序开销。
        </p>
      </div>
    </div>
  </div>
`;

export const THREE_SUM_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public List<List<Integer>> threeSum(int[] nums) {',
    '    List<List<Integer>> res = new ArrayList<>();',
    '    Arrays.sort(nums);',
    '    for (int i = 0; i < nums.length - 2; i++) {',
    '        if (nums[i] > 0) break;',
    '        if (i > 0 && nums[i] == nums[i - 1]) continue;',
    '        int left = i + 1, right = nums.length - 1;',
    '        while (left < right) {',
    '            int sum = nums[i] + nums[left] + nums[right];',
    '            if (sum == 0) {',
    '                res.add(Arrays.asList(nums[i], nums[left], nums[right]));',
    '                while (left < right && nums[left] == nums[left + 1]) left++;',
    '                while (left < right && nums[right] == nums[right - 1]) right--;',
    '                left++; right--;',
    '            } else if (sum < 0) {',
    '                left++;',
    '            } else {',
    '                right--;',
    '            }',
    '        }',
    '    }',
    '    return res;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<vector<int>> threeSum(vector<int>& nums) {',
    '        vector<vector<int>> res;',
    '        sort(nums.begin(), nums.end());',
    '        for (int i = 0; i < (int)nums.size() - 2; i++) {',
    '            if (nums[i] > 0) break;',
    '            if (i > 0 && nums[i] == nums[i - 1]) continue;',
    '            int left = i + 1, right = nums.size() - 1;',
    '            while (left < right) {',
    '                int sum = nums[i] + nums[left] + nums[right];',
    '                if (sum == 0) {',
    '                    res.push_back({nums[i], nums[left], nums[right]});',
    '                    while (left < right && nums[left] == nums[left + 1]) left++;',
    '                    while (left < right && nums[right] == nums[right - 1]) right--;',
    '                    left++; right--;',
    '                } else if (sum < 0) {',
    '                    left++;',
    '                } else {',
    '                    right--;',
    '                }',
    '            }',
    '        }',
    '        return res;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def threeSum(self, nums: List[int]) -> List[List[int]]:',
    '        nums.sort()',
    '        res = []',
    '        for i in range(len(nums) - 2):',
    '            if nums[i] > 0:',
    '                break',
    '            if i > 0 and nums[i] == nums[i - 1]:',
    '                continue',
    '            left, right = i + 1, len(nums) - 1',
    '            while left < right:',
    '                s = nums[i] + nums[left] + nums[right]',
    '                if s == 0:',
    '                    res.append([nums[i], nums[left], nums[right]])',
    '                    while left < right and nums[left] == nums[left + 1]:',
    '                        left += 1',
    '                    while left < right and nums[right] == nums[right - 1]:',
    '                        right -= 1',
    '                    left += 1',
    '                    right -= 1',
    '                elif s < 0:',
    '                    left += 1',
    '                else:',
    '                    right -= 1',
    '        return res',
  ],
  javascript: [
    'var threeSum = function(nums) {',
    '    const res = [];',
    '    nums.sort((a, b) => a - b);',
    '    for (let i = 0; i < nums.length - 2; i++) {',
    '        if (nums[i] > 0) break;',
    '        if (i > 0 && nums[i] === nums[i - 1]) continue;',
    '        let left = i + 1, right = nums.length - 1;',
    '        while (left < right) {',
    '            const sum = nums[i] + nums[left] + nums[right];',
    '            if (sum === 0) {',
    '                res.push([nums[i], nums[left], nums[right]]);',
    '                while (left < right && nums[left] === nums[left + 1]) left++;',
    '                while (left < right && nums[right] === nums[right - 1]) right--;',
    '                left++; right--;',
    '            } else if (sum < 0) {',
    '                left++;',
    '            } else {',
    '                right--;',
    '            }',
    '        }',
    '    }',
    '    return res;',
    '};',
  ],
};
