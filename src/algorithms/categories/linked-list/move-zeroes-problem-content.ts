/**
 * 移动零 (LeetCode 283) 题目描述与多语言解法配置 (DDD 领域模型)
 */

export const MOVE_ZEROES_PROBLEM_HTML = `
<div class="problem-statement">
  <div class="problem-badge">LeetCode 283 · 简单</div>
  <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 6px; margin-bottom: 8px;">移动零 (Move Zeroes)</h3>
  <p style="font-size: 12.5px; color: #334155; line-height: 1.6; margin-bottom: 10px;">
    给定一个数组 <code>nums</code>，编写一个函数将所有 <code>0</code> 移动到数组的末尾，同时保持非零元素的相对顺序。
  </p>
  <p style="font-size: 12px; color: #dc2626; font-weight: 600; margin-bottom: 10px;">
    请注意：必须在不复制数组的情况下原地对数组进行操作。
  </p>
  
  <div style="background: #f8fafc; border-left: 3px solid #2563eb; padding: 8px 12px; border-radius: 4px; font-size: 12px; margin-bottom: 10px;">
    <strong>示例 1：</strong><br/>
    输入: nums = [0,1,0,3,12]<br/>
    输出: [1,3,12,0,0]
  </div>

  <div style="background: #f8fafc; border-left: 3px solid #64748b; padding: 8px 12px; border-radius: 4px; font-size: 12px;">
    <strong>复杂度分析：</strong><br/>
    • 时间复杂度：<code>O(n)</code>，快指针只遍历一次数组。<br/>
    • 空间复杂度：<code>O(1)</code>，原地双指针交换，空间消耗常数级。
  </div>
</div>
`;

export const MOVE_ZEROES_ANALYSIS_HTML = `
<div class="algorithm-analysis" style="font-size: 12px; color: #334155; line-height: 1.6;">
  <h4 style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">💡 核心思维：快慢双指针 (原地交换 / 覆盖)</h4>
  <p style="margin-bottom: 8px;">
    双指针中的<strong>快慢指针</strong>是解决原地数组调整的经典利器：
  </p>
  <ul style="padding-left: 18px; margin-bottom: 8px;">
    <li><strong>慢指针 (slow / dest)：</strong>指向当前已整理好的非零区间的下一个待插入位置（也就是等待接收非零值的槽位）。</li>
    <li><strong>快指针 (fast / cur)：</strong>从头到尾遍历数组，负责寻找非零元素。</li>
  </ul>
  <div style="background: #ecfdf5; border-left: 3px solid #10b981; padding: 6px 10px; border-radius: 4px; margin-bottom: 8px; color: #065f46;">
    <strong>交换法 (推荐)：</strong>当 <code>fast</code> 发现 <code>nums[fast] !== 0</code> 时，与 <code>nums[slow]</code> 进行交换，随后 <code>slow++</code>。这样不但所有非零元素按顺序前移，原来的 0 也自动被置换到了后面，只需单次遍历！
  </div>
</div>
`;

export const MOVE_ZEROES_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'class Solution {',
    '    public void moveZeroes(int[] nums) {',
    '        int slow = 0;',
    '        for (int fast = 0; fast < nums.length; fast++) {',
    '            if (nums[fast] != 0) {',
    '                int temp = nums[slow];',
    '                nums[slow] = nums[fast];',
    '                nums[fast] = temp;',
    '                slow++;',
    '            }',
    '        }',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    void moveZeroes(vector<int>& nums) {',
    '        int slow = 0;',
    '        for (int fast = 0; fast < nums.size(); fast++) {',
    '            if (nums[fast] != 0) {',
    '                swap(nums[slow], nums[fast]);',
    '                slow++;',
    '            }',
    '        }',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def moveZeroes(self, nums: List[int]) -> None:',
    '        slow = 0',
    '        for fast in range(len(nums)):',
    '            if nums[fast] != 0:',
    '                nums[slow], nums[fast] = nums[fast], nums[slow]',
    '                slow += 1',
  ],
  javascript: [
    'function moveZeroes(nums) {',
    '    let slow = 0;',
    '    for (let fast = 0; fast < nums.length; fast++) {',
    '        if (nums[fast] !== 0) {',
    '            [nums[slow], nums[fast]] = [nums[fast], nums[slow]];',
    '            slow++;',
    '        }',
    '    }',
    '}',
  ],
};
