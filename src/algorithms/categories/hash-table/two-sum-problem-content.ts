/**
 * LeetCode 1: 两数之和 (Two Sum)
 * 领域知识与题解精讲配置声明
 */

export const TWO_SUM_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 1</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">两数之和 (Two Sum)</h2>
    </div>
    <p style="margin: 0;">给定一个整数数组 <code style="color: #fde047; font-family: monospace;">nums</code> 和一个整数目标值 <code style="color: #fde047; font-family: monospace;">target</code> ，请你在该数组中找出 <strong>和为目标值 <code style="color: #fde047; font-family: monospace;">target</code></strong> 的那 <strong>两个</strong> 整数，并返回它们的数组下标。</p>
    <p style="margin: 0;">你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。你可以按任意顺序返回答案。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: nums = [2,7,11,15], target = 9</div>
      <div>输出: [0,1]</div>
      <div style="color: #94a3b8;">解释: 因为 nums[0] + nums[1] == 9 ，返回 [0, 1] 。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: nums = [3,2,4], target = 6</div>
      <div>输出: [1,2]</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 2 &le; nums.length &le; 10<sup>4</sup></div>
      <div>• -10<sup>9</sup> &le; nums[i] &le; 10<sup>9</sup></div>
      <div>• -10<sup>9</sup> &le; target &le; 10<sup>9</sup></div>
      <div>• 只会存在一个有效答案</div>
    </div>
  </div>
`;

export const TWO_SUM_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 哈希表一次遍历：以空间换时间，将 O(n²) 降至 O(n)
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 为什么需要哈希表？</div>
        <p style="margin: 0; color: #94a3b8;">
        当我们遍历到元素 <code style="color: #fde047; font-family: monospace;">nums[i]</code> 时，我们需要知道<strong>前面是否出现过一个数值为 <code style="color: #38bdf8; font-family: monospace;">target - nums[i]</code> 的元素</strong>。<br/>
        如果用暴力两重循环，查找需要 <code style="color: #f87171; font-family: monospace;">O(n)</code>。而哈希表（HashMap）可以在 <code style="color: #34d399; font-family: monospace;">O(1)</code> 平均时间内完成「是否存在」与「获取对应下标」的查询！
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 一次遍历边查边存</div>
        <p style="margin: 0; color: #94a3b8;">
        1. 维护一个哈希表 <code style="color: #a78bfa; font-family: monospace;">map</code>，键为<strong>元素值</strong>，值为<strong>元素在数组中的下标</strong>；<br/>
        2. 遍历当前位置 <code style="color: #38bdf8; font-family: monospace;">i</code>，计算补数 <code style="color: #fbbf24; font-family: monospace;">complement = target - nums[i]</code>；<br/>
        3. 若 <code style="color: #a78bfa; font-family: monospace;">map</code> 中已存在 <code style="color: #fbbf24; font-family: monospace;">complement</code>，说明找到了配对数，直接返回 <code style="color: #34d399; font-family: monospace;">[map.get(complement), i]</code>；<br/>
        4. 若不存在，则将当前键值对 <code style="color: #a78bfa; font-family: monospace;">(nums[i], i)</code> 存入哈希表，继续向后遍历。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 复杂度分析</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(n)</code>，数组仅需单次遍历，哈希查找与插入均为 O(1)。<br/>
        • 空间复杂度：<code style="color: #34d399; font-family: monospace;">O(n)</code>，哈希表最多存储 n 个键值对。
        </p>
      </div>
    </div>
  </div>
`;

export const TWO_SUM_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int[] twoSum(int[] nums, int target) {',
    '    Map<Integer, Integer> map = new HashMap<>();',
    '    for (int i = 0; i < nums.length; i++) {',
    '        int complement = target - nums[i];',
    '        if (map.containsKey(complement)) {',
    '            return new int[]{map.get(complement), i};',
    '        }',
    '        map.put(nums[i], i);',
    '    }',
    '    return new int[0];',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<int> twoSum(vector<int>& nums, int target) {',
    '        unordered_map<int, int> map;',
    '        for (int i = 0; i < nums.size(); i++) {',
    '            int complement = target - nums[i];',
    '            if (map.find(complement) != map.end()) {',
    '                return {map[complement], i};',
    '            }',
    '            map[nums[i]] = i;',
    '        }',
    '        return {};',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def twoSum(self, nums: List[int], target: int) -> List[int]:',
    '        mapping = {}',
    '        for i, num in enumerate(nums):',
    '            complement = target - num',
    '            if complement in mapping:',
    '                return [mapping[complement], i]',
    '            mapping[num] = i',
    '        return []',
  ],
  javascript: [
    'var twoSum = function(nums, target) {',
    '    const map = new Map();',
    '    for (let i = 0; i < nums.length; i++) {',
    '        const complement = target - nums[i];',
    '        if (map.has(complement)) {',
    '            return [map.get(complement), i];',
    '        }',
    '        map.set(nums[i], i);',
    '    }',
    '    return [];',
    '};',
  ],
};
