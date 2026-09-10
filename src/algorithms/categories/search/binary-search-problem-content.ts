/**
 * 二分查找 (Binary Search · LeetCode 704)
 * 领域知识与题解精讲配置声明
 */

export const BINARY_SEARCH_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 704</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">二分查找 (Binary Search)</h2>
    </div>
    <p style="margin: 0;">给定一个 <code style="color: #38bdf8; font-family: monospace;">n</code> 个元素升序整型数组 <code style="color: #fde047; font-family: monospace;">nums</code> 和一个目标值 <code style="color: #fde047; font-family: monospace;">target</code> ，写一个函数搜索 <code style="color: #fde047; font-family: monospace;">nums</code> 中的 <code style="color: #fde047; font-family: monospace;">target</code>，如果目标值存在返回下标，否则返回 <code style="color: #f87171; font-family: monospace;">-1</code>。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: nums = [-1, 0, 3, 5, 9, 12], target = 9</div>
      <div>输出: 4 (9 出现在 nums 中并且下标为 4)</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: nums = [-1, 0, 3, 5, 9, 12], target = 2</div>
      <div>输出: -1 (2 不存在 nums 中因此返回 -1)</div>
    </div>
  </div>
`;

export const BINARY_SEARCH_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 区间不变性（Loop Invariant）与左闭右闭区间模型
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 左闭右闭区间 [left, right]</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>循环条件：</strong> <code style="color: #38bdf8; font-family: monospace;">while (left <= right)</code>（因为 left == right 时区间 [left, right] 依然有效合法）；<br/>
        2. <strong>防溢出中点计算：</strong> <code style="color: #fde047; font-family: monospace;">int mid = left + (right - left) / 2</code>；<br/>
        3. <strong>分支判断与边界收缩：</strong><br/>
        &nbsp;&nbsp;• 若 <code style="color: #34d399; font-family: monospace;">nums[mid] == target</code>，命中直接返回 <code style="color: #34d399; font-family: monospace;">mid</code>；<br/>
        &nbsp;&nbsp;• 若 <code style="color: #fbbf24; font-family: monospace;">nums[mid] > target</code>，说明目标在左侧，收缩右界 <code style="color: #fbbf24; font-family: monospace;">right = mid - 1</code>；<br/>
        &nbsp;&nbsp;• 若 <code style="color: #fbbf24; font-family: monospace;">nums[mid] < target</code>，说明目标在右侧，收缩左界 <code style="color: #fbbf24; font-family: monospace;">left = mid + 1</code>。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度与优势</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：严格对数级 <code style="color: #34d399; font-family: monospace;">O(log n)</code>（每次将搜索空间对半折减）。<br/>
        • 空间复杂度：<code style="color: #34d399; font-family: monospace;">O(1)</code>（常数级辅助指针）。
        </p>
      </div>
    </div>
  </div>
`;

export const BINARY_SEARCH_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int search(int[] nums, int target) {',
    '    if (nums == null || nums.length == 0) return -1;',
    '    int left = 0, right = nums.length - 1;',
    '    while (left <= right) {',
    '        int mid = left + (right - left) / 2;',
    '        if (nums[mid] == target) {',
    '            return mid; // 命中目标',
    '        } else if (nums[mid] > target) {',
    '            right = mid - 1; // 目标在左侧',
    '        } else {',
    '            left = mid + 1;  // 目标在右侧',
    '        }',
    '    }',
    '    return -1;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int search(vector<int>& nums, int target) {',
    '        int left = 0, right = nums.size() - 1;',
    '        while (left <= right) {',
    '            int mid = left + (right - left) / 2;',
    '            if (nums[mid] == target) {',
    '                return mid;',
    '            } else if (nums[mid] > target) {',
    '                right = mid - 1;',
    '            } else {',
    '                left = mid + 1;',
    '            }',
    '        }',
    '        return -1;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def search(self, nums: List[int], target: int) -> int:',
    '        left, right = 0, len(nums) - 1',
    '        while left <= right:',
    '            mid = left + (right - left) // 2',
    '            if nums[mid] == target:',
    '                return mid',
    '            elif nums[mid] > target:',
    '                right = mid - 1',
    '            else:',
    '                left = mid + 1',
    '        return -1',
  ],
  javascript: [
    'var search = function(nums, target) {',
    '    let left = 0, right = nums.length - 1;',
    '    while (left <= right) {',
    '        const mid = left + Math.floor((right - left) / 2);',
    '        if (nums[mid] === target) {',
    '            return mid;',
    '        } else if (nums[mid] > target) {',
    '            right = mid - 1;',
    '        } else {',
    '            left = mid + 1;',
    '        }',
    '    }',
    '    return -1;',
    '};',
  ],
};
