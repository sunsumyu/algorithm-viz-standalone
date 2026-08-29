/**
 * LeetCode 454: 四数相加 II (4Sum II)
 * 领域知识与题解精讲配置声明
 */

export const FOUR_SUM_II_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 454</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">四数相加 II (4Sum II)</h2>
    </div>
    <p style="margin: 0;">给你四个整数数组 <code style="color: #fde047; font-family: monospace;">nums1</code>、<code style="color: #fde047; font-family: monospace;">nums2</code>、<code style="color: #fde047; font-family: monospace;">nums3</code> 和 <code style="color: #fde047; font-family: monospace;">nums4</code> ，数组长度都是 <code style="color: #fde047; font-family: monospace;">n</code> ，请你计算有多少个元组 <code style="color: #fde047; font-family: monospace;">(i, j, k, l)</code> 能满足：</p>
    <p style="margin: 0;">• <code style="color: #fde047; font-family: monospace;">0 &le; i, j, k, l < n</code><br/>• <code style="color: #fde047; font-family: monospace;">nums1[i] + nums2[j] + nums3[k] + nums4[l] == 0</code></p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: nums1 = [1,2], nums2 = [-2,-1], nums3 = [-1,2], nums4 = [0,2]</div>
      <div>输出: 2</div>
      <div style="color: #94a3b8;">解释: 两个满足条件的元组: 1. (0, 0, 0, 1) -> nums1[0] + nums2[0] + nums3[0] + nums4[1] = 1 + (-2) + (-1) + 2 = 0; 2. (1, 1, 0, 0) -> nums1[1] + nums2[1] + nums3[0] + nums4[0] = 2 + (-1) + (-1) + 0 = 0</div>
    </div>
  </div>
`;

export const FOUR_SUM_II_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 分组哈希：将 4 数组拆分为 2 + 2，从 O(n⁴) 降至 O(n²)
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 为什么拆分成两两分组？</div>
        <p style="margin: 0; color: #94a3b8;">
        如果暴力枚举 4 个数组需要 <code style="color: #f87171; font-family: monospace;">O(n⁴)</code>；<br/>
        若拆分为 1 + 3 分组，需要 <code style="color: #fbbf24; font-family: monospace;">O(n³)</code>；<br/>
        最佳方案是<strong>对半拆分为 2 + 2 分组</strong>：前两个数组 <code style="color: #38bdf8; font-family: monospace;">nums1, nums2</code> 组合复杂度为 <code style="color: #34d399; font-family: monospace;">O(n²)</code>，后两个数组 <code style="color: #a78bfa; font-family: monospace;">nums3, nums4</code> 查找复杂度也是 <code style="color: #34d399; font-family: monospace;">O(n²)</code>，整体总时间为 <code style="color: #34d399; font-family: monospace;">O(n²)</code>！
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 算法执行步骤</div>
        <p style="margin: 0; color: #94a3b8;">
        1. 维护哈希表 <code style="color: #38bdf8; font-family: monospace;">map</code>：<strong>Key 为 a + b 的和，Value 为该和出现的次数</strong>；<br/>
        2. 双层循环遍历 <code style="color: #38bdf8; font-family: monospace;">nums1</code> 和 <code style="color: #38bdf8; font-family: monospace;">nums2</code>，统计所有 <code style="color: #38bdf8; font-family: monospace;">a + b</code> 出现次数；<br/>
        3. 初始化统计变量 <code style="color: #fde047; font-family: monospace;">count = 0</code>；<br/>
        4. 双层循环遍历 <code style="color: #a78bfa; font-family: monospace;">nums3</code> 和 <code style="color: #a78bfa; font-family: monospace;">nums4</code>，计算目标值 <code style="color: #fbbf24; font-family: monospace;">target = 0 - (c + d)</code>；<br/>
        5. 若 <code style="color: #38bdf8; font-family: monospace;">map</code> 中存在该 key，则将对应频次累加到 <code style="color: #fde047; font-family: monospace;">count += map.get(target)</code>。
        </p>
      </div>
    </div>
  </div>
`;

export const FOUR_SUM_II_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int fourSumCount(int[] nums1, int[] nums2, int[] nums3, int[] nums4) {',
    '    Map<Integer, Integer> map = new HashMap<>();',
    '    int count = 0;',
    '    for (int a : nums1) {',
    '        for (int b : nums2) {',
    '            map.put(a + b, map.getOrDefault(a + b, 0) + 1);',
    '        }',
    '    }',
    '    for (int c : nums3) {',
    '        for (int d : nums4) {',
    '            count += map.getOrDefault(0 - (c + d), 0);',
    '        }',
    '    }',
    '    return count;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int fourSumCount(vector<int>& nums1, vector<int>& nums2, vector<int>& nums3, vector<int>& nums4) {',
    '        unordered_map<int, int> map;',
    '        for (int a : nums1) {',
    '            for (int b : nums2) {',
    '                map[a + b]++;',
    '            }',
    '        }',
    '        int count = 0;',
    '        for (int c : nums3) {',
    '            for (int d : nums4) {',
    '                if (map.find(0 - (c + d)) != map.end()) {',
    '                    count += map[0 - (c + d)];',
    '                }',
    '            }',
    '        }',
    '        return count;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def fourSumCount(self, nums1: List[int], nums2: List[int], nums3: List[int], nums4: List[int]) -> int:',
    '        record = defaultdict(int)',
    '        for a in nums1:',
    '            for b in nums2:',
    '                record[a + b] += 1',
    '        count = 0',
    '        for c in nums3:',
    '            for d in nums4:',
    '                count += record[-(c + d)]',
    '        return count',
  ],
  javascript: [
    'var fourSumCount = function(nums1, nums2, nums3, nums4) {',
    '    const map = new Map();',
    '    for (const a of nums1) {',
    '        for (const b of nums2) {',
    '            map.set(a + b, (map.get(a + b) || 0) + 1);',
    '        }',
    '    }',
    '    let count = 0;',
    '    for (const c of nums3) {',
    '        for (const d of nums4) {',
    '            count += map.get(0 - (c + d)) || 0;',
    '        }',
    '    }',
    '    return count;',
    '};',
  ],
};
