/**
 * 移动零 (LeetCode 283) 题目描述与多语言解法配置 (DDD 领域模型)
 */

export const MOVE_ZEROES_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 283</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">简单</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">移动零 (Move Zeroes)</h2>
    </div>
    <p style="margin: 0;">给定一个数组 <code style="color: #fde047; font-family: monospace;">nums</code>，编写一个函数将所有 <code style="color: #fde047; font-family: monospace;">0</code> 移动到数组的末尾，同时保持非零元素的相对顺序。</p>
    <p style="margin: 0; color: #f87171; font-weight: 600;">请注意：必须在不复制数组的情况下原地对数组进行操作。</p>
    
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: nums = [0,1,0,3,12]</div>
      <div>输出: [1,3,12,0,0]</div>
    </div>

    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: nums = [0]</div>
      <div>输出: [0]</div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">复杂度分析：</div>
      <div>• 时间复杂度：<code style="color: #34d399;">O(n)</code>，快指针只遍历一次数组。</div>
      <div>• 空间复杂度：<code style="color: #34d399;">O(1)</code>，原地双指针交换，空间消耗常数级。</div>
    </div>
  </div>
`;

export const MOVE_ZEROES_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 核心思维：快慢双指针 (原地交换 / 覆盖)
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 双指针职责分工</div>
        <p style="margin: 0; color: #94a3b8;">
        • <strong style="color: #fbbf24;">慢指针 (slow)：</strong>指向当前已整理好的非零区间的下一个待插入位置（等待接收非零值的槽位）。<br/>
        • <strong style="color: #38bdf8;">快指针 (fast)：</strong>从头到尾遍历数组，负责寻找非零元素。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 原地交换法 (单趟遍历)</div>
        <p style="margin: 0; color: #94a3b8;">
        当 <code style="color: #38bdf8; font-family: monospace;">fast</code> 发现 <code style="color: #fde047; font-family: monospace;">nums[fast] !== 0</code> 时，与 <code style="color: #fbbf24; font-family: monospace;">nums[slow]</code> 进行交换，随后 <code style="color: #34d399; font-family: monospace;">slow++</code>。这样所有非零元素按顺序前移，原来的 0 自动被置换到了后面，只需单次遍历！
        </p>
      </div>
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
