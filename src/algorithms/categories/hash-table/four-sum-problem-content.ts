/**
 * LeetCode 18: 四数之和 (Four Sum)
 * 领域知识与题解精讲配置声明
 */

export const FOUR_SUM_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 18</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">四数之和 (4Sum)</h2>
    </div>
    <p style="margin: 0;">给你一个由 <code style="color: #fde047; font-family: monospace;">n</code> 个整数组成的数组 <code style="color: #fde047; font-family: monospace;">nums</code> ，和一个目标值 <code style="color: #fde047; font-family: monospace;">target</code> 。请你找出并返回满足下述全部条件且 <strong>不重复</strong> 的四元组 <code style="color: #fde047; font-family: monospace;">[nums[a], nums[b], nums[c], nums[d]]</code> ：</p>
    <p style="margin: 0;">• <code style="color: #fde047; font-family: monospace;">0 &le; a, b, c, d < n</code><br/>• <code style="color: #fde047; font-family: monospace;">a, b, c, d</code> 互不相同<br/>• <code style="color: #fde047; font-family: monospace;">nums[a] + nums[b] + nums[c] + nums[d] == target</code></p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: nums = [1,0,-1,0,-2,2], target = 0</div>
      <div>输出: [[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: nums = [2,2,2,2,2], target = 8</div>
      <div>输出: [[2,2,2,2]]</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; nums.length &le; 200</div>
      <div>• -10<sup>9</sup> &le; nums[i] &le; 10<sup>9</sup></div>
      <div>• -10<sup>9</sup> &le; target &le; 10<sup>9</sup></div>
    </div>
  </div>
`;

export const FOUR_SUM_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 双层 for 循环 + 双指针 + 两级去重剪枝
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 从三数之和到四数之和的通法归纳</div>
        <p style="margin: 0; color: #94a3b8;">
        三数之和是<strong>一层 for 循环固定 i + 双指针 left/right</strong>；<br/>
        四数之和同样思路：<strong>两层 for 循环分别固定 i 和 j + 双指针 left/right</strong>，将四重暴力枚举降至 <code style="color: #60a5fa; font-family: monospace;">O(n³)</code>。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 两级精细去重与剪枝</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>第一层 i 去重：</strong> <code style="color: #fbbf24; font-family: monospace;">i > 0 && nums[i] == nums[i-1]</code> 则 continue；<br/>
        2. <strong>第二层 j 去重：</strong> <code style="color: #fbbf24; font-family: monospace;">j > i + 1 && nums[j] == nums[j-1]</code> 则 continue；<br/>
        3. <strong>双指针收缩：</strong> <code style="color: #34d399; font-family: monospace;">left = j + 1, right = n - 1</code>，四数求和与 target 比较，命中后对 left/right 持续跳过重复值；<br/>
        4. <strong>注意防止溢出：</strong> 求和时使用 long 类型防止超出 32 位整型界限。
        </p>
      </div>
    </div>
  </div>
`;

export const FOUR_SUM_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public List<List<Integer>> fourSum(int[] nums, int target) {',
    '    List<List<Integer>> res = new ArrayList<>();',
    '    Arrays.sort(nums);',
    '    int n = nums.length;',
    '    for (int i = 0; i < n - 3; i++) {',
    '        if (i > 0 && nums[i] == nums[i - 1]) continue;',
    '        for (int j = i + 1; j < n - 2; j++) {',
    '            if (j > i + 1 && nums[j] == nums[j - 1]) continue;',
    '            int left = j + 1, right = n - 1;',
    '            while (left < right) {',
    '                long sum = (long) nums[i] + nums[j] + nums[left] + nums[right];',
    '                if (sum == target) {',
    '                    res.add(Arrays.asList(nums[i], nums[j], nums[left], nums[right]));',
    '                    while (left < right && nums[left] == nums[left + 1]) left++;',
    '                    while (left < right && nums[right] == nums[right - 1]) right--;',
    '                    left++; right--;',
    '                } else if (sum < target) {',
    '                    left++;',
    '                } else {',
    '                    right--;',
    '                }',
    '            }',
    '        }',
    '    }',
    '    return res;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<vector<int>> fourSum(vector<int>& nums, int target) {',
    '        vector<vector<int>> res;',
    '        sort(nums.begin(), nums.end());',
    '        int n = nums.size();',
    '        for (int i = 0; i < n - 3; i++) {',
    '            if (i > 0 && nums[i] == nums[i - 1]) continue;',
    '            for (int j = i + 1; j < n - 2; j++) {',
    '                if (j > i + 1 && nums[j] == nums[j - 1]) continue;',
    '                int left = j + 1, right = n - 1;',
    '                while (left < right) {',
    '                    long long sum = (long long)nums[i] + nums[j] + nums[left] + nums[right];',
    '                    if (sum == target) {',
    '                        res.push_back({nums[i], nums[j], nums[left], nums[right]});',
    '                        while (left < right && nums[left] == nums[left + 1]) left++;',
    '                        while (left < right && nums[right] == nums[right - 1]) right--;',
    '                        left++; right--;',
    '                    } else if (sum < target) {',
    '                        left++;',
    '                    } else {',
    '                        right--;',
    '                    }',
    '                }',
    '            }',
    '        }',
    '        return res;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def fourSum(self, nums: List[int], target: int) -> List[List[int]]:',
    '        nums.sort()',
    '        res = []',
    '        n = len(nums)',
    '        for i in range(n - 3):',
    '            if i > 0 and nums[i] == nums[i - 1]:',
    '                continue',
    '            for j in range(i + 1, n - 2):',
    '                if j > i + 1 and nums[j] == nums[j - 1]:',
    '                    continue',
    '                left, right = j + 1, n - 1',
    '                while left < right:',
    '                    s = nums[i] + nums[j] + nums[left] + nums[right]',
    '                    if s == target:',
    '                        res.append([nums[i], nums[j], nums[left], nums[right]])',
    '                        while left < right and nums[left] == nums[left + 1]:',
    '                            left += 1',
    '                        while left < right and nums[right] == nums[right - 1]:',
    '                            right -= 1',
    '                        left += 1',
    '                        right -= 1',
    '                    elif s < target:',
    '                        left += 1',
    '                    else:',
    '                        right -= 1',
    '        return res',
  ],
  javascript: [
    'var fourSum = function(nums, target) {',
    '    const res = [];',
    '    nums.sort((a, b) => a - b);',
    '    const n = nums.length;',
    '    for (let i = 0; i < n - 3; i++) {',
    '        if (i > 0 && nums[i] === nums[i - 1]) continue;',
    '        for (let j = i + 1; j < n - 2; j++) {',
    '            if (j > i + 1 && nums[j] === nums[j - 1]) continue;',
    '            let left = j + 1, right = n - 1;',
    '            while (left < right) {',
    '                const sum = nums[i] + nums[j] + nums[left] + nums[right];',
    '                if (sum === target) {',
    '                    res.push([nums[i], nums[j], nums[left], nums[right]]);',
    '                    while (left < right && nums[left] === nums[left + 1]) left++;',
    '                    while (left < right && nums[right] === nums[right - 1]) right--;',
    '                    left++; right--;',
    '                } else if (sum < target) {',
    '                    left++;',
    '                } else {',
    '                    right--;',
    '                }',
    '            }',
    '        }',
    '    }',
    '    return res;',
    '};',
  ],
};
