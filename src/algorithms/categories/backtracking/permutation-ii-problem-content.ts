/**
 * LeetCode 47: 全排列 II (Permutations II)
 * 领域知识与题解精讲配置声明
 */

export const PERMUTATION_II_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 47</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">全排列 II (Permutations II)</h2>
    </div>
    <p style="margin: 0;">给定一个可包含重复数字的序列 <code style="color: #fde047; font-family: monospace;">nums</code> ，<em>按任意顺序</em> 返回所有不重复的全排列。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: nums = [1,1,2]</div>
      <div>输出: [[1,1,2],[1,2,1],[2,1,1]]</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: nums = [1,2,3]</div>
      <div>输出: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; nums.length &le; 8</div>
      <div>• -10 &le; nums[i] &le; 10</div>
    </div>
  </div>
`;

export const PERMUTATION_II_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 树枝去重 vs 树层去重 (used[i-1] == false 深度剖析)
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 树枝去重：used[i] == true</div>
        <p style="margin: 0; color: #94a3b8;">排列问题中每个位置必须且只能使用一次，若当前元素在当前路径中已被占用，直接 <code style="color: #fde047; font-family: monospace;">continue</code>。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 树层去重：nums[i] == nums[i-1] && !used[i-1]</div>
        <p style="margin: 0; color: #94a3b8;">当当前元素与前一个相同：<br/>• 若 <code style="color: #fb7185; font-family: monospace;">used[i-1] == false</code>，说明前一个相同的元素已经在<strong>同一树层</strong>被使用并已回溯结束，此时选当前元素会产生完全重复的分支，必须剪枝！<br/>• 若 <code style="color: #34d399; font-family: monospace;">used[i-1] == true</code>，说明前一个相同元素正在<strong>树枝上作为父节点</strong>使用，此时允许选取。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #fbbf24; margin-bottom: 4px;">③ 为什么必须先排序？</div>
        <p style="margin: 0; color: #94a3b8;">排序后相同的元素紧挨在一起，才能通过与前一个相邻元素比较进行高效树层剪枝。</p>
      </div>
    </div>
  </div>
`;

export const PERMUTATION_II_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public List<List<Integer>> permuteUnique(int[] nums) {',
    '    List<List<Integer>> res = new ArrayList<>();',
    '    Arrays.sort(nums); // 排序是同层去重的前提',
    '    boolean[] used = new boolean[nums.length];',
    '    backtrack(nums, used, new ArrayList<>(), res);',
    '    return res;',
    '}',
    '',
    'void backtrack(int[] nums, boolean[] used, List<Integer> path, List<List<Integer>> res) {',
    '    if (path.size() == nums.length) {',
    '        res.add(new ArrayList<>(path));',
    '        return;',
    '    }',
    '    for (int i = 0; i < nums.length; i++) {',
    '        // 树枝去重：当前元素在当前排列中已使用',
    '        if (used[i]) continue;',
    '        // 树层去重：同层遇到重复元素且前一个已回溯',
    '        if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1]) continue;',
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
    '    vector<vector<int>> permuteUnique(vector<int>& nums) {',
    '        vector<vector<int>> res;',
    '        vector<int> path;',
    '        sort(nums.begin(), nums.end());',
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
    '            if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1]) continue;',
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
    '    def permuteUnique(self, nums: List[int]) -> List[List[int]]:',
    '        res = []',
    '        nums.sort()',
    '        used = [False] * len(nums)',
    '        def backtrack(path: List[int]):',
    '            if len(path) == len(nums):',
    '                res.append(list(path))',
    '                return',
    '            for i in range(len(nums)):',
    '                if used[i]:',
    '                    continue',
    '                if i > 0 and nums[i] == nums[i - 1] and not used[i - 1]:',
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
    'var permuteUnique = function(nums) {',
    '    const res = [];',
    '    nums.sort((a, b) => a - b);',
    '    const used = new Array(nums.length).fill(false);',
    '    function backtrack(path) {',
    '        if (path.length === nums.length) {',
    '            res.push([...path]);',
    '            return;',
    '        }',
    '        for (let i = 0; i < nums.length; i++) {',
    '            if (used[i]) continue;',
    '            if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) continue;',
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
