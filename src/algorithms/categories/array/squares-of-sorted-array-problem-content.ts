/**
 * LeetCode 977: 有序数组的平方 (Squares of a Sorted Array)
 * 领域知识与题解精讲配置声明
 */

export const SQUARES_OF_SORTED_ARRAY_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 977</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">有序数组的平方 (Squares of a Sorted Array)</h2>
    </div>
    <p style="margin: 0;">给你一个按 <strong>非递减顺序</strong> 排序的整数数组 <code style="color: #fde047; font-family: monospace;">nums</code>，返回 <strong>每个数字的平方</strong> 组成的新数组，要求也按 <strong>非递减顺序</strong> 排序。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: nums = [-4,-1,0,3,10]</div>
      <div>输出: [0,1,9,16,100]</div>
      <div style="color: #94a3b8;">解释: 平方后为 [16,1,0,9,100]，排序后为 [0,1,9,16,100]</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: nums = [-7,-3,2,3,11]</div>
      <div>输出: [4,9,9,49,121]</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; nums.length &le; 10<sup>4</sup></div>
      <div>• -10<sup>4</sup> &le; nums[i] &le; 10<sup>4</sup></div>
      <div>• nums 已按非递减顺序排序</div>
    </div>
  </div>
`;

export const SQUARES_OF_SORTED_ARRAY_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 首尾对撞双指针法：从两端向中间归并平方最大值
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 数组特性与关键洞察</div>
        <p style="margin: 0; color: #94a3b8;">
        原数组是有序的，但由于存在负数，<strong>负数平方后可能非常大</strong>。<br/>
        因此，数组平方后的<strong>最大值一定只可能出现在原数组的最左端或最右端</strong>，绝不可能出现在中间！
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 双指针从后向前填充新数组</div>
        <p style="margin: 0; color: #94a3b8;">
        1. 定义指针 <code style="color: #38bdf8; font-family: monospace;">left = 0</code> 和 <code style="color: #f59e0b; font-family: monospace;">right = n - 1</code>；<br/>
        2. 定义新数组写入指针 <code style="color: #a78bfa; font-family: monospace;">k = n - 1</code>（从后往前写最大值）；<br/>
        3. 若 <code style="color: #38bdf8; font-family: monospace;">nums[left]² &gt; nums[right]²</code>，将 <code style="color: #38bdf8; font-family: monospace;">nums[left]²</code> 写入 <code style="color: #a78bfa; font-family: monospace;">result[k--]</code>，并 <code style="color: #38bdf8; font-family: monospace;">left++</code>；<br/>
        4. 否则将 <code style="color: #f59e0b; font-family: monospace;">nums[right]²</code> 写入 <code style="color: #a78bfa; font-family: monospace;">result[k--]</code>，并 <code style="color: #f59e0b; font-family: monospace;">right--</code>；<br/>
        5. 直到 <code style="color: #fde047; font-family: monospace;">left &gt; right</code> 结束，时间复杂度严格 <code style="color: #60a5fa; font-family: monospace;">O(n)</code>！
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 复杂度对比</div>
        <p style="margin: 0; color: #94a3b8;">
        • 暴力法（先平方再排序）：<code style="color: #f87171; font-family: monospace;">O(n log n)</code><br/>
        • 双指针法：<code style="color: #34d399; font-family: monospace;">O(n)</code> 时间 + <code style="color: #60a5fa; font-family: monospace;">O(1)</code> 辅助空间（不计输出结果数组空间）
        </p>
      </div>
    </div>
  </div>
`;

export const SQUARES_OF_SORTED_ARRAY_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int[] sortedSquares(int[] nums) {',
    '    int n = nums.length;',
    '    int[] result = new int[n];',
    '    int left = 0, right = n - 1;',
    '    for (int i = n - 1; i >= 0; i--) {',
    '        int lsq = nums[left] * nums[left];',
    '        int rsq = nums[right] * nums[right];',
    '        if (lsq > rsq) {',
    '            result[i] = lsq;',
    '            left++;',
    '        } else {',
    '            result[i] = rsq;',
    '            right--;',
    '        }',
    '    }',
    '    return result;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<int> sortedSquares(vector<int>& nums) {',
    '        int n = nums.size();',
    '        vector<int> result(n);',
    '        int left = 0, right = n - 1;',
    '        for (int i = n - 1; i >= 0; i--) {',
    '            int lsq = nums[left] * nums[left];',
    '            int rsq = nums[right] * nums[right];',
    '            if (lsq > rsq) {',
    '                result[i] = lsq;',
    '                left++;',
    '            } else {',
    '                result[i] = rsq;',
    '                right--;',
    '            }',
    '        }',
    '        return result;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def sortedSquares(self, nums: List[int]) -> List[int]:',
    '        n = len(nums)',
    '        result = [0] * n',
    '        left, right = 0, n - 1',
    '        for i in range(n - 1, -1, -1):',
    '            lsq = nums[left] ** 2',
    '            rsq = nums[right] ** 2',
    '            if lsq > rsq:',
    '                result[i] = lsq',
    '                left += 1',
    '            else:',
    '                result[i] = rsq',
    '                right -= 1',
    '        return result',
  ],
  javascript: [
    'var sortedSquares = function(nums) {',
    '    const n = nums.length;',
    '    const result = new Array(n);',
    '    let left = 0, right = n - 1;',
    '    for (let i = n - 1; i >= 0; i--) {',
    '        const lsq = nums[left] * nums[left];',
    '        const rsq = nums[right] * nums[right];',
    '        if (lsq > rsq) {',
    '            result[i] = lsq;',
    '            left++;',
    '        } else {',
    '            result[i] = rsq;',
    '            right--;',
    '        }',
    '    }',
    '    return result;',
    '};',
  ],
};
