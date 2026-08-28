/**
 * LeetCode 491: 非递减子序列 (Non-decreasing Subsequences)
 * 领域知识与题解精讲配置声明
 */

export const INCREASING_SUBSEQUENCES_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 491</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">非递减子序列 (Increasing Subsequences)</h2>
    </div>
    <p style="margin: 0;">给你一个整数数组 <code style="color: #fde047; font-family: monospace;">nums</code> ，找出并返回所有该数组中不同的递增子序列，递增子序列中 <strong>至少有两个元素</strong> 。你可以按 <strong>任意顺序</strong> 返回答案。</p>
    <p style="margin: 0;">数组中可能含有重复元素，如出现两个整数相等，也可以视作递增序列的一种特殊情况。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: nums = [4,6,7,7]</div>
      <div>输出: [[4,6],[4,6,7],[4,6,7,7],[4,7],[4,7,7],[6,7],[6,7,7],[7,7]]</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: nums = [4,4,3,2,1]</div>
      <div>输出: [[4,4]]</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; nums.length &le; 15</div>
      <div>• -100 &le; nums[i] &le; 100</div>
    </div>
  </div>
`;

export const INCREASING_SUBSEQUENCES_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 不能排序！同层 HashSet / 数组去重精讲
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 为什么本题绝对不能对原数组排序？</div>
        <p style="margin: 0; color: #94a3b8;">子序列要求保持在原数组中的<strong>相对先后顺序</strong>。如果对原数组进行排序，就会改变序列顺序，导致求出的不是原数组的递增子序列。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 不能排序时如何做树层去重？</div>
        <p style="margin: 0; color: #94a3b8;">在<strong>本层递归函数体内</strong>定义一个局部 <code style="color: #7dd3fc; font-family: monospace;">HashSet&lt;Integer&gt; used = new HashSet&lt;&gt;()</code>，用来记录在当前树层已经使用过的数值。若 <code style="color: #fb7185; font-family: monospace;">used.contains(nums[i])</code>，则直接 <code style="color: #fde047; font-family: monospace;">continue</code>。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #fbbf24; margin-bottom: 4px;">③ 非递减剪枝条件</div>
        <p style="margin: 0; color: #94a3b8;">若 <code style="color: #fb7185; font-family: monospace;">!path.isEmpty() && nums[i] &lt; path.get(path.size() - 1)</code>，说明当前数字比前一个数字小，破坏了递增性，跳过。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #fb7185; margin-bottom: 4px;">④ 不返回的节点收集</div>
        <p style="margin: 0; color: #94a3b8;">只要 <code style="color: #7dd3fc; font-family: monospace;">path.size() &gt;= 2</code>，就将当前路径存入解集，且<strong>不能 return</strong>，必须继续向下递归寻找更长的递增子序列！</p>
      </div>
    </div>
  </div>
`;

export const INCREASING_SUBSEQUENCES_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public List<List<Integer>> findSubsequences(int[] nums) {',
    '    List<List<Integer>> res = new ArrayList<>();',
    '    backtrack(nums, 0, new ArrayList<>(), res);',
    '    return res;',
    '}',
    '',
    'void backtrack(int[] nums, int startIndex, List<Integer> path, List<List<Integer>> res) {',
    '    if (path.size() >= 2) {',
    '        res.add(new ArrayList<>(path)); // 满足长度即收集，但不 return！',
    '    }',
    '    Set<Integer> used = new HashSet<>(); // 局部 Set：仅用于当前树层去重',
    '    for (int i = startIndex; i < nums.length; i++) {',
    '        // 剪枝 1：非递减破坏；剪枝 2：当前层已使用过相同数值',
    '        if (!path.isEmpty() && nums[i] < path.get(path.size() - 1)) continue;',
    '        if (used.contains(nums[i])) continue;',
    '        used.add(nums[i]);',
    '        path.add(nums[i]);',
    '        backtrack(nums, i + 1, path, res);',
    '        path.remove(path.size() - 1);',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<vector<int>> findSubsequences(vector<int>& nums) {',
    '        vector<vector<int>> res;',
    '        vector<int> path;',
    '        backtrack(nums, 0, path, res);',
    '        return res;',
    '    }',
    '    void backtrack(const vector<int>& nums, int startIndex,',
    '                   vector<int>& path, vector<vector<int>>& res) {',
    '        if (path.size() >= 2) {',
    '            res.push_back(path);',
    '        }',
    '        unordered_set<int> used;',
    '        for (int i = startIndex; i < nums.size(); i++) {',
    '            if (!path.empty() && nums[i] < path.back()) continue;',
    '            if (used.count(nums[i])) continue;',
    '            used.insert(nums[i]);',
    '            path.push_back(nums[i]);',
    '            backtrack(nums, i + 1, path, res);',
    '            path.pop_back();',
    '        }',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def findSubsequences(self, nums: List[int]) -> List[List[int]]:',
    '        res = []',
    '        def backtrack(start: int, path: List[int]):',
    '            if len(path) >= 2:',
    '                res.append(list(path))',
    '            used = set()',
    '            for i in range(start, len(nums)):',
    '                if path and nums[i] < path[-1]:',
    '                    continue',
    '                if nums[i] in used:',
    '                    continue',
    '                used.add(nums[i])',
    '                path.append(nums[i])',
    '                backtrack(i + 1, path)',
    '                path.pop()',
    '        backtrack(0, [])',
    '        return res',
  ],
  javascript: [
    'var findSubsequences = function(nums) {',
    '    const res = [];',
    '    function backtrack(startIndex, path) {',
    '        if (path.length >= 2) {',
    '            res.push([...path]);',
    '        }',
    '        const used = new Set();',
    '        for (let i = startIndex; i < nums.length; i++) {',
    '            if (path.length > 0 && nums[i] < path[path.length - 1]) continue;',
    '            if (used.has(nums[i])) continue;',
    '            used.add(nums[i]);',
    '            path.push(nums[i]);',
    '            backtrack(i + 1, path);',
    '            path.pop();',
    '        }',
    '    }',
    '    backtrack(0, []);',
    '    return res;',
    '};',
  ],
};
