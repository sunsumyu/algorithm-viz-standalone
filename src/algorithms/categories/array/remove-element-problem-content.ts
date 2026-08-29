/**
 * LeetCode 27: 移除元素 (Remove Element)
 * 领域知识与题解精讲配置声明
 */

export const REMOVE_ELEMENT_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 27</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">移除元素 (Remove Element)</h2>
    </div>
    <p style="margin: 0;">给你一个数组 <code style="color: #fde047; font-family: monospace;">nums</code> 和一个值 <code style="color: #fde047; font-family: monospace;">val</code>，你需要 <strong>原地</strong> 移除所有数值等于 <code style="color: #fde047; font-family: monospace;">val</code> 的元素，并返回移除后数组的新长度。</p>
    <p style="margin: 0;">不要使用额外的数组空间，你必须仅使用 <code style="color: #60a5fa; font-family: monospace;">O(1)</code> 额外空间并 <strong>原地</strong> 修改输入数组。元素的顺序可以改变。你不需要考虑数组中超出新长度后面的元素。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: nums = [3,2,2,3], val = 3</div>
      <div>输出: 2, nums = [2,2,_,_] (函数应该返回新的长度 2)</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: nums = [0,1,2,2,3,0,4,2], val = 2</div>
      <div>输出: 5, nums = [0,1,3,0,4,_,_,_] (函数应该返回新的长度 5)</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 0 &le; nums.length &le; 100</div>
      <div>• 0 &le; nums[i] &le; 50</div>
      <div>• 0 &le; val &le; 100</div>
    </div>
  </div>
`;

export const REMOVE_ELEMENT_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 快慢双指针法：一个 for 循环搞定 O(n) 原地覆盖
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 指针明确职责</div>
        <p style="margin: 0; color: #94a3b8;">
        • <code style="color: #38bdf8; font-family: monospace;">fast 快指针</code>：用于遍历整个原数组，寻找<strong>不等于 target val</strong> 的有效新元素。<br/>
        • <code style="color: #fbbf24; font-family: monospace;">slow 慢指针</code>：指向<strong>更新后的新数组下标</strong>，表示下一个有效元素要放置的位置。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 核心执行流程</div>
        <p style="margin: 0; color: #94a3b8;">
        1. 当 <code style="color: #fde047; font-family: monospace;">nums[fast] != val</code> 时：说明找到了需要保留的新元素，执行 <code style="color: #34d399; font-family: monospace;">nums[slow] = nums[fast]; slow++;</code>；<br/>
        2. 当 <code style="color: #f87171; font-family: monospace;">nums[fast] == val</code> 时：跳过该元素，快指针继续前进，慢指针原地等待；<br/>
        3. 遍历结束后，<code style="color: #a78bfa; font-family: monospace;">slow</code> 的值恰好就是最终新数组的有效长度！
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 复杂度分析</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(n)</code>，快指针仅需单次遍历数组。<br/>
        • 空间复杂度：<code style="color: #34d399; font-family: monospace;">O(1)</code>，仅使用两个整型指针，完全原地覆写。
        </p>
      </div>
    </div>
  </div>
`;

export const REMOVE_ELEMENT_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int removeElement(int[] nums, int val) {',
    '    int slow = 0;',
    '    for (int fast = 0; fast < nums.length; fast++) {',
    '        if (nums[fast] != val) {',
    '            nums[slow] = nums[fast];',
    '            slow++;',
    '        }',
    '    }',
    '    return slow;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int removeElement(vector<int>& nums, int val) {',
    '        int slow = 0;',
    '        for (int fast = 0; fast < nums.size(); fast++) {',
    '            if (nums[fast] != val) {',
    '                nums[slow] = nums[fast];',
    '                slow++;',
    '            }',
    '        }',
    '        return slow;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def removeElement(self, nums: List[int], val: int) -> int:',
    '        slow = 0',
    '        for fast in range(len(nums)):',
    '            if nums[fast] != val:',
    '                nums[slow] = nums[fast]',
    '                slow += 1',
    '        return slow',
  ],
  javascript: [
    'var removeElement = function(nums, val) {',
    '    let slow = 0;',
    '    for (let fast = 0; fast < nums.length; fast++) {',
    '        if (nums[fast] !== val) {',
    '            nums[slow] = nums[fast];',
    '            slow++;',
    '        }',
    '    }',
    '    return slow;',
    '};',
  ],
};
