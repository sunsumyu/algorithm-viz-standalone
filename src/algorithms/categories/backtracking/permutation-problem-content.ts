/**
 * LeetCode 46: 全排列 (Permutations)
 * 领域知识与题解精讲配置声明
 */

export const PERMUTATION_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 46</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">全排列 (Permutations)</h2>
    </div>
    <p style="margin: 0;">给定一个不含重复数字的数组 <code style="color: #fde047; font-family: monospace;">nums</code> ，返回其 <strong>所有可能的全排列</strong> 。你可以 <strong>按任意顺序</strong> 返回答案。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: nums = [1,2,3]</div>
      <div>输出: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: nums = [0,1]</div>
      <div>输出: [[0,1],[1,0]]</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; nums.length &le; 6</div>
      <div>• -10 &le; nums[i] &le; 10</div>
      <div>• nums 中的所有整数 互不相同</div>
    </div>
  </div>
`;

export const PERMUTATION_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 排列 vs 组合：used 数组与全循环
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 排列问题不需要 startIndex</div>
        <p style="margin: 0; color: #94a3b8;">在组合问题中，<code style="color: #fde047; font-family: monospace;">[1, 2]</code> 和 <code style="color: #fde047; font-family: monospace;">[2, 1]</code> 是同一个集合，因此需要 <code style="color: #7dd3fc; font-family: monospace;">startIndex</code> 保持单调递增；而在排列中，两者是不同的合法排列，因此每层循环都必须从 <code style="color: #34d399; font-family: monospace;">i = 0</code> 开始。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② used 状态数组（树枝去重）</div>
        <p style="margin: 0; color: #94a3b8;">为了避免在同一排列中重复选取同一个元素，使用 <code style="color: #7dd3fc; font-family: monospace;">boolean[] used</code> 标记。若 <code style="color: #fb7185; font-family: monospace;">used[i] == true</code>，表示当前纵向树枝中已经选过该元素，直接跳过。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #fbbf24; margin-bottom: 4px;">③ 递归与回溯对称操作</div>
        <p style="margin: 0; color: #94a3b8;">选取时：<code style="color: #7dd3fc; font-family: monospace;">path.add(nums[i]); used[i] = true;</code><br/>回溯时：<code style="color: #fb7185; font-family: monospace;">path.remove(path.size() - 1); used[i] = false;</code></p>
      </div>
    </div>
  </div>
`;

export const PERMUTATION_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public List<List<Integer>> permute(int[] nums) {',
    '    List<List<Integer>> res = new ArrayList<>();',
    '    boolean[] used = new boolean[nums.length];',
    '    backtrack(nums, used, new ArrayList<>(), res);',
    '    return res;',
    '}',
    '',
    'void backtrack(int[] nums, boolean[] used, List<Integer> path, List<List<Integer>> res) {',
    '    if (path.size() == nums.length) {',
    '        res.add(new ArrayList<>(path)); // 填满 N 个元素，收集排列',
    '        return;',
    '    }',
    '    for (int i = 0; i < nums.length; i++) {',
    '        if (used[i]) continue; // 树枝去重：已在当前排列中的元素跳过',
    '        used[i] = true;',
    '        path.add(nums[i]);',
    '        backtrack(nums, used, path, res);',
    '        path.remove(path.size() - 1);',
    '        used[i] = false;',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<vector<int>> permute(vector<int>& nums) {',
    '        vector<vector<int>> res;',
    '        vector<int> path;',
    '        vector<bool> used(nums.size(), false);',
    '        backtrack(nums, used, path, res);',
    '        return res;',
    '    }',
    '    void backtrack(const vector<int>& nums, vector<bool>& used,',
    '                   vector<int>& path, vector<vector<int>>& res) {',
    '        if (path.size() == nums.size()) {',
    '            res.push_back(path);',
    '            return;',
    '        }',
    '        for (int i = 0; i < nums.size(); i++) {',
    '            if (used[i]) continue;',
    '            used[i] = true;',
    '            path.push_back(nums[i]);',
    '            backtrack(nums, used, path, res);',
    '            path.pop_back();',
    '            used[i] = false;',
    '        }',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def permute(self, nums: List[int]) -> List[List[int]]:',
    '        res = []',
    '        used = [False] * len(nums)',
    '        def backtrack(path: List[int]):',
    '            if len(path) == len(nums):',
    '                res.append(list(path))',
    '                return',
    '            for i in range(len(nums)):',
    '                if used[i]:',
    '                    continue',
    '                used[i] = True',
    '                path.append(nums[i])',
    '                backtrack(path)',
    '                path.pop()',
    '                used[i] = False',
    '        backtrack([])',
    '        return res',
  ],
  javascript: [
    'var permute = function(nums) {',
    '    const res = [];',
    '    const used = new Array(nums.length).fill(false);',
    '    function backtrack(path) {',
    '        if (path.length === nums.length) {',
    '            res.push([...path]);',
    '            return;',
    '        }',
    '        for (let i = 0; i < nums.length; i++) {',
    '            if (used[i]) continue;',
    '            used[i] = true;',
    '            path.push(nums[i]);',
    '            backtrack(path);',
    '            path.pop();',
    '            used[i] = false;',
    '        }',
    '    }',
    '    backtrack([]);',
    '    return res;',
    '};',
  ],
};
