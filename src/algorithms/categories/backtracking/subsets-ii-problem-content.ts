/**
 * LeetCode 90: 子集 II (Subsets II)
 * 领域知识与题解精讲配置声明
 */

export const SUBSETS_II_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 90</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">子集 II (Subsets II)</h2>
    </div>
    <p style="margin: 0;">给你一个整数数组 <code style="color: #fde047; font-family: monospace;">nums</code> ，其中可能包含重复元素，请你返回该数组所有可能的子集（幂集）。</p>
    <p style="margin: 0;">解集 <strong>不能</strong> 包含重复的子集。返回的解集中，子集可以按 <strong>任意顺序</strong> 排列。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: nums = [1,2,2]</div>
      <div>输出: [[],[1],[1,2],[1,2,2],[2],[2,2]]</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: nums = [0]</div>
      <div>输出: [[],[0]]</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; nums.length &le; 10</div>
      <div>• -10 &le; nums[i] &le; 10</div>
    </div>
  </div>
`;

export const SUBSETS_II_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 排序预处理与树层去重原理
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 为什么必须先排序？</div>
        <p style="margin: 0; color: #94a3b8;">如果不排序，重复数字散落在数组各处（如 <code style="color: #fde047; font-family: monospace;">[2, 1, 2]</code>），同层循环无法只通过判断相邻元素去重。排序后相同数字紧邻，才能用 <code style="color: #34d399; font-family: monospace;">nums[i] == nums[i-1]</code> 进行树层去重。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 树层去重条件：i > startIndex</div>
        <p style="margin: 0; color: #94a3b8;">当 <code style="color: #fb7185; font-family: monospace;">i > startIndex && nums[i] == nums[i - 1]</code> 时，说明在当前同一层递归中，已经用过一个相同的数字展开了完整子树，此时继续使用会产生完全重复的子集分支，必须 <code style="color: #fde047; font-family: monospace;">continue</code>！</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #fbbf24; margin-bottom: 4px;">③ 全节点收集</div>
        <p style="margin: 0; color: #94a3b8;">与 LC 78 相同，所有合法未剪枝节点在进入函数的第一步执行 <code style="color: #7dd3fc; font-family: monospace;">res.add(new ArrayList<>(path))</code> 收集。</p>
      </div>
    </div>
  </div>
`;

export const SUBSETS_II_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public List<List<Integer>> subsetsWithDup(int[] nums) {',
    '    List<List<Integer>> res = new ArrayList<>();',
    '    Arrays.sort(nums); // 排序是同层去重的前提',
    '    backtrack(nums, 0, new ArrayList<>(), res);',
    '    return res;',
    '}',
    '',
    'void backtrack(int[] nums, int startIndex, List<Integer> path, List<List<Integer>> res) {',
    '    res.add(new ArrayList<>(path)); // 收集每个节点',
    '    ',
    '    for (int i = startIndex; i < nums.length; i++) {',
    '        // 树层去重：同层遇到重复元素直接跳过',
    '        if (i > startIndex && nums[i] == nums[i - 1]) continue;',
    '        path.add(nums[i]);',
    '        backtrack(nums, i + 1, path, res); // 递归下一层',
    '        path.remove(path.size() - 1); // 撤销现场',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<vector<int>> subsetsWithDup(vector<int>& nums) {',
    '        vector<vector<int>> res;',
    '        vector<int> path;',
    '        sort(nums.begin(), nums.end());',
    '        backtrack(nums, 0, path, res);',
    '        return res;',
    '    }',
    '    void backtrack(const vector<int>& nums, int startIndex,',
    '                   vector<int>& path, vector<vector<int>>& res) {',
    '        res.push_back(path);',
    '        for (int i = startIndex; i < nums.size(); i++) {',
    '            if (i > startIndex && nums[i] == nums[i - 1]) continue;',
    '            path.push_back(nums[i]);',
    '            backtrack(nums, i + 1, path, res);',
    '            path.pop_back();',
    '        }',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def subsetsWithDup(self, nums: List[int]) -> List[List[int]]:',
    '        res = []',
    '        nums.sort()',
    '        def backtrack(start: int, path: List[int]):',
    '            res.append(list(path))',
    '            for i in range(start, len(nums)):',
    '                if i > start and nums[i] == nums[i - 1]:',
    '                    continue',
    '                path.append(nums[i])',
    '                backtrack(i + 1, path)',
    '                path.pop()',
    '        backtrack(0, [])',
    '        return res',
  ],
  javascript: [
    'var subsetsWithDup = function(nums) {',
    '    const res = [];',
    '    nums.sort((a, b) => a - b);',
    '    function backtrack(startIndex, path) {',
    '        res.push([...path]);',
    '        for (let i = startIndex; i < nums.length; i++) {',
    '            if (i > startIndex && nums[i] === nums[i - 1]) continue;',
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
