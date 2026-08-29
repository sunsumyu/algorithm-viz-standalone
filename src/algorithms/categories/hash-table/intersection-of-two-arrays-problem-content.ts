/**
 * LeetCode 349: 两个数组的交集 (Intersection of Two Arrays)
 * 领域知识与题解精讲配置声明
 */

export const INTERSECTION_ARRAYS_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 349</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">两个数组的交集 (Intersection of Two Arrays)</h2>
    </div>
    <p style="margin: 0;">给定两个数组 <code style="color: #fde047; font-family: monospace;">nums1</code> 和 <code style="color: #fde047; font-family: monospace;">nums2</code> ，返回 <em>它们的交集</em> 。输出结果中的每个元素一定是 <strong>唯一</strong> 的。我们可以 <strong>不考虑输出结果的顺序</strong> 。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: nums1 = [1,2,2,1], nums2 = [2,2]</div>
      <div>输出: [2]</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: nums1 = [4,9,5], nums2 = [9,4,9,8,4]</div>
      <div>输出: [9,4] (或 [4,9])</div>
    </div>
  </div>
`;

export const INTERSECTION_ARRAYS_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 哈希集合 HashSet 去重与高效求交集
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 为什么使用 HashSet？</div>
        <p style="margin: 0; color: #94a3b8;">
        由于题目要求交集结果中的元素必须<strong>唯一</strong>，天然契合 <code style="color: #38bdf8; font-family: monospace;">HashSet</code> 自带去重且查询复杂度为 <code style="color: #34d399; font-family: monospace;">O(1)</code> 的特性。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 算法执行流程</div>
        <p style="margin: 0; color: #94a3b8;">
        1. 将 <code style="color: #38bdf8; font-family: monospace;">nums1</code> 所有元素存入哈希集合 <code style="color: #38bdf8; font-family: monospace;">set1</code> 中（完成自动去重）；<br/>
        2. 维护结果集合 <code style="color: #34d399; font-family: monospace;">resultSet</code>；<br/>
        3. 遍历 <code style="color: #fde047; font-family: monospace;">nums2</code> 中的每个元素 <code style="color: #fde047; font-family: monospace;">num</code>：<br/>
        &nbsp;&nbsp;• 若 <code style="color: #38bdf8; font-family: monospace;">set1.contains(num)</code> 为 true，则将该元素加入 <code style="color: #34d399; font-family: monospace;">resultSet</code>；<br/>
        4. 将 <code style="color: #34d399; font-family: monospace;">resultSet</code> 转换为数组返回。
        </p>
      </div>
    </div>
  </div>
`;

export const INTERSECTION_ARRAYS_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int[] intersection(int[] nums1, int[] nums2) {',
    '    if (nums1 == null || nums1.length == 0 || nums2 == null || nums2.length == 0) {',
    '        return new int[0];',
    '    }',
    '    Set<Integer> set1 = new HashSet<>();',
    '    Set<Integer> resultSet = new HashSet<>();',
    '    for (int num : nums1) {',
    '        set1.add(num);',
    '    }',
    '    for (int num : nums2) {',
    '        if (set1.contains(num)) {',
    '            resultSet.add(num);',
    '        }',
    '    }',
    '    return resultSet.stream().mapToInt(x -> x).toArray();',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<int> intersection(vector<int>& nums1, vector<int>& nums2) {',
    '        unordered_set<int> set1(nums1.begin(), nums1.end());',
    '        unordered_set<int> resultSet;',
    '        for (int num : nums2) {',
    '            if (set1.count(num)) {',
    '                resultSet.insert(num);',
    '            }',
    '        }',
    '        return vector<int>(resultSet.begin(), resultSet.end());',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def intersection(self, nums1: List[int], nums2: List[int]) -> List[int]:',
    '        return list(set(nums1) & set(nums2))',
  ],
  javascript: [
    'var intersection = function(nums1, nums2) {',
    '    const set1 = new Set(nums1);',
    '    const resultSet = new Set();',
    '    for (const num of nums2) {',
    '        if (set1.has(num)) {',
    '            resultSet.add(num);',
    '        }',
    '    }',
    '    return Array.from(resultSet);',
    '};',
  ],
};
