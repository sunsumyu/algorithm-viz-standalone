/**
 * 合并两个有序数组 (LeetCode 88) 题目描述与多语言解法配置 (DDD 领域模型)
 */

export const MERGE_SORTED_ARRAY_PROBLEM_HTML = `
<div class="problem-statement">
  <div class="problem-badge">LeetCode 88 · 简单</div>
  <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 6px; margin-bottom: 8px;">合并两个有序数组 (Merge Sorted Array)</h3>
  <p style="font-size: 12.5px; color: #334155; line-height: 1.6; margin-bottom: 10px;">
    给你两个按 <strong>非递减顺序</strong> 排列的整数数组 <code>nums1</code> 和 <code>nums2</code>，另有两个整数 <code>m</code> 和 <code>n</code> ，分别表示 <code>nums1</code> 和 <code>nums2</code> 中的有效元素数目。
  </p>
  <p style="font-size: 12.5px; color: #334155; line-height: 1.6; margin-bottom: 10px;">
    请你 <strong>合并</strong> <code>nums2</code> 到 <code>nums1</code> 中，使合并后的数组同样按 <strong>非递减顺序</strong> 排列。
  </p>
  <p style="font-size: 12px; color: #64748b; margin-bottom: 10px;">
    <strong>注意：</strong>最终合并后数组不应由函数返回，而是存储在数组 <code>nums1</code> 中。为了应对这种情况，<code>nums1</code> 的初始长度为 <code>m + n</code>，其中前 <code>m</code> 个元素表示应合并的元素，后 <code>n</code> 个元素为 <code>0</code> ，应忽略。
  </p>
  
  <div style="background: #f8fafc; border-left: 3px solid #2563eb; padding: 8px 12px; border-radius: 4px; font-size: 12px; margin-bottom: 10px;">
    <strong>示例 1：</strong><br/>
    输入：nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3<br/>
    输出：[1,2,2,3,5,6]<br/>
    解释：需要合并 [1,2,3] 和 [2,5,6] ，合并结果是 [1,2,2,3,5,6] 。
  </div>

  <div style="background: #f8fafc; border-left: 3px solid #64748b; padding: 8px 12px; border-radius: 4px; font-size: 12px;">
    <strong>复杂度分析：</strong><br/>
    • 时间复杂度：<code>O(m + n)</code>，指针从后向前只遍历一次两个数组。<br/>
    • 空间复杂度：<code>O(1)</code>，原地修改 <code>nums1</code>，无需额外内存开销。
  </div>
</div>
`;

export const MERGE_SORTED_ARRAY_ANALYSIS_HTML = `
<div class="algorithm-analysis" style="font-size: 12px; color: #334155; line-height: 1.6;">
  <h4 style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">💡 核心思维：逆向双指针 (从后向前填充)</h4>
  <p style="margin-bottom: 8px;">
    如果从前往后合并，每次将 <code>nums2</code> 的元素放入 <code>nums1</code> 头部都会覆盖 <code>nums1</code> 中原有的有效数据，导致必须额外使用 <code>O(m)</code> 辅助数组或者多次元素后移。
  </p>
  <div style="background: #ecfdf5; border-left: 3px solid #10b981; padding: 6px 10px; border-radius: 4px; margin-bottom: 8px; color: #065f46;">
    <strong>破局点：</strong><code>nums1</code> 的后半部分 (索引 <code>m</code> 到 <code>m+n-1</code>) 原本就是空的占位区 (全为 0)。因此，若<strong>从后向前</strong>选两数组中较大的元素填入 <code>nums1[k]</code> (其中 <code>k = m + n - 1</code>)，永远不会覆盖未被读取的 <code>nums1</code> 前序有效数据！
  </div>
  <h4 style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">🚀 算法三指针操作步骤：</h4>
  <ol style="padding-left: 18px; margin-bottom: 8px;">
    <li>设置 <code>p1 = m - 1</code> (指向 nums1 有效末尾)，<code>p2 = n - 1</code> (指向 nums2 末尾)，<code>k = m + n - 1</code> (指向 nums1 物理末尾)。</li>
    <li>每次比较 <code>nums1[p1]</code> 与 <code>nums2[p2]</code>，将较大者放入 <code>nums1[k]</code>，对应指针向前移动。</li>
    <li>若 <code>p2 >= 0</code> 且 <code>p1 < 0</code>，将剩余的 <code>nums2</code> 元素直接填入 <code>nums1[k]</code>；若 <code>p1 >= 0</code> 且 <code>p2 < 0</code>，说明 nums1 剩余元素已在正确位置，算法自然结束。</li>
  </ol>
</div>
`;

export const MERGE_SORTED_ARRAY_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'class Solution {',
    '    public void merge(int[] nums1, int m, int[] nums2, int n) {',
    '        int p1 = m - 1;',
    '        int p2 = n - 1;',
    '        int k = m + n - 1;',
    '        while (p2 >= 0) {',
    '            if (p1 >= 0 && nums1[p1] > nums2[p2]) {',
    '                nums1[k--] = nums1[p1--];',
    '            } else {',
    '                nums1[k--] = nums2[p2--];',
    '            }',
    '        }',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {',
    '        int p1 = m - 1;',
    '        int p2 = n - 1;',
    '        int k = m + n - 1;',
    '        while (p2 >= 0) {',
    '            if (p1 >= 0 && nums1[p1] > nums2[p2]) {',
    '                nums1[k--] = nums1[p1--];',
    '            } else {',
    '                nums1[k--] = nums2[p2--];',
    '            }',
    '        }',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def merge(self, nums1: List[int], m: int, nums2: List[int], n: int) -> None:',
    '        p1, p2, k = m - 1, n - 1, m + n - 1',
    '        while p2 >= 0:',
    '            if p1 >= 0 and nums1[p1] > nums2[p2]:',
    '                nums1[k] = nums1[p1]',
    '                p1 -= 1',
    '            else:',
    '                nums1[k] = nums2[p2]',
    '                p2 -= 1',
    '            k -= 1',
  ],
  javascript: [
    'function merge(nums1, m, nums2, n) {',
    '    let p1 = m - 1;',
    '    let p2 = n - 1;',
    '    let k = m + n - 1;',
    '    while (p2 >= 0) {',
    '        if (p1 >= 0 && nums1[p1] > nums2[p2]) {',
    '            nums1[k--] = nums1[p1--];',
    '        } else {',
    '            nums1[k--] = nums2[p2--];',
    '        }',
    '    }',
    '}',
  ],
};
