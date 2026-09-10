/**
 * LeetCode 1005: K 次取反后最大化的数组和 (Maximize Sum of Array After K Negations)
 * 领域知识与题解精讲配置声明
 */

export const MAXIMIZE_SUM_K_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 1005</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">K 次取反后最大化的数组和 (Maximize Sum of Array After K Negations)</h2>
    </div>
    <p style="margin: 0;">给你一个整数数组 <code style="color: #fde047; font-family: monospace;">nums</code> 和一个整数 <code style="color: #fde047; font-family: monospace;">k</code> ，按以下方法修改该数组：</p>
    <ul style="margin: 0; padding-left: 20px;">
      <li>选择某个下标 <code style="color: #fde047; font-family: monospace;">i</code> 并将 <code style="color: #fde047; font-family: monospace;">nums[i]</code> 替换为 <code style="color: #fde047; font-family: monospace;">-nums[i]</code> 。</li>
      <li>重复这个过程恰好 <code style="color: #fde047; font-family: monospace;">k</code> 次。可以多次选择同一个下标 <code style="color: #fde047; font-family: monospace;">i</code> 。</li>
    </ul>
    <p style="margin: 0;">以这种方式修改数组后，返回数组 <strong>可能的最大和</strong> 。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: nums = [4,2,3], k = 1</div>
      <div>输出: 5</div>
      <div>解释: 选择下标 1 ，nums 变为 [4,-2,3] 。最大和为 4 + (-2) + 3 = 5 。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: nums = [3,-1,0,2], k = 3</div>
      <div>输出: 6</div>
      <div>解释: 选择下标 (1, 2, 2) ，nums 变为 [3,1,0,2] 。最大和为 3 + 1 + 0 + 2 = 6 。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 3:</div>
      <div>输入: nums = [2,-3,-1,5,-4], k = 2</div>
      <div>输出: 13</div>
      <div>解释: 选择下标 (1, 4) ，nums 变为 [2,3,-1,5,4] 。最大和为 2 + 3 + (-1) + 5 + 4 = 13 。</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; nums.length &le; 10^4</div>
      <div>• -100 &le; nums[i] &le; 100</div>
      <div>• 1 &le; k &le; 10^4</div>
    </div>
  </div>
`;

export const MAXIMIZE_SUM_K_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 两次贪心：绝对值降序排序 + 负数优先翻转
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 为什么按绝对值从大到小排序？</div>
        <p style="margin: 0; color: #94a3b8;">把绝对值大的负数变成正数（例如 <code style="color: #fb7185; font-family: monospace;">-5 &rarr; +5</code>），对总和的增益最大（<code style="color: #34d399; font-family: monospace;">+10</code>）；而把绝对值小的负数变正（例如 <code style="color: #fb7185; font-family: monospace;">-1 &rarr; +1</code>），增益只有 <code style="color: #34d399; font-family: monospace;">+2</code>。因此<strong>优先翻转绝对值大的负数</strong>是第一贪心！</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 负数全部转正后，k 还有剩余怎么办？</div>
        <p style="margin: 0; color: #94a3b8;">• 若剩余 <code style="color: #7dd3fc; font-family: monospace;">k % 2 == 0</code>（偶数次）：在同一个数上反复翻转两次即抵消，总和不变。<br/>
        • 若剩余 <code style="color: #fbbf24; font-family: monospace;">k % 2 == 1</code>（奇数次）：只需翻转<strong>绝对值最小的那个正数</strong>（即排序后数组末尾元素），对总和的损害最小！这是第二贪心！</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 复杂度分析</div>
        <p style="margin: 0; color: #94a3b8;">• 时间复杂度: <code style="color: #7dd3fc; font-family: monospace;">O(N log N)</code>（排序）+ <code style="color: #34d399; font-family: monospace;">O(N)</code>（单次扫描遍历）。<br/>
        • 空间复杂度: <code style="color: #7dd3fc; font-family: monospace;">O(1)</code> 或 <code style="color: #7dd3fc; font-family: monospace;">O(log N)</code>。</p>
      </div>
    </div>
  </div>
`;

export const MAXIMIZE_SUM_K_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int largestSumAfterKNegations(int[] nums, int k) {',
    '    // 1. 将数组按照绝对值大小从大到小排序',
    '    nums = IntStream.of(nums)',
    '        .boxed()',
    '        .sorted((a, b) -> Math.abs(b) - Math.abs(a))',
    '        .mapToInt(Integer::intValue).toArray();',
    '    // 2. 第一步贪心：遍历数组，遇到负数将其转为正数，同时 k--',
    '    for (int i = 0; i < nums.length; i++) {',
    '        if (nums[i] < 0 && k > 0) {',
    '            nums[i] = -nums[i];',
    '            k--;',
    '        }',
    '    }',
    '    // 3. 第二步贪心：如果 k 还大于 0 且为奇数，反复翻转绝对值最小的元素',
    '    if (k % 2 == 1) nums[nums.length - 1] = -nums[nums.length - 1];',
    '    // 4. 求和',
    '    return Arrays.stream(nums).sum();',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int largestSumAfterKNegations(vector<int>& nums, int k) {',
    '        // 按绝对值从大到小排序',
    '        sort(nums.begin(), nums.end(), [](int a, int b) {',
    '            return abs(a) > abs(b);',
    '        });',
    '        for (int i = 0; i < nums.size(); i++) {',
    '            if (nums[i] < 0 && k > 0) {',
    '                nums[i] = -nums[i];',
    '                k--;',
    '            }',
    '        }',
    '        if (k % 2 == 1) nums[nums.size() - 1] = -nums[nums.size() - 1];',
    '        int result = 0;',
    '        for (int a : nums) result += a;',
    '        return result;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def largestSumAfterKNegations(self, nums: List[int], k: int) -> int:',
    '        # 按绝对值降序排序',
    '        nums.sort(key=lambda x: abs(x), reverse=True)',
    '        for i in range(len(nums)):',
    '            if nums[i] < 0 and k > 0:',
    '                nums[i] = -nums[i]',
    '                k -= 1',
    '        if k % 2 == 1:',
    '            nums[-1] = -nums[-1]',
    '        return sum(nums)',
  ],
  javascript: [
    'var largestSumAfterKNegations = function(nums, k) {',
    '    nums.sort((a, b) => Math.abs(b) - Math.abs(a));',
    '    for (let i = 0; i < nums.length; i++) {',
    '        if (nums[i] < 0 && k > 0) {',
    '            nums[i] = -nums[i];',
    '            k--;',
    '        }',
    '    }',
    '    if (k % 2 === 1) nums[nums.length - 1] = -nums[nums.length - 1];',
    '    return nums.reduce((a, b) => a + b, 0);',
    '};',
  ],
};
