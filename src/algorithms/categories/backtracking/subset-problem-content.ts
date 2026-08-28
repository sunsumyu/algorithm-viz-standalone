/**
 * LeetCode 78: 子集 (Subsets)
 * 领域知识与题解精讲配置声明
 */

export const SUBSET_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 78</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">子集 (Subsets)</h2>
    </div>
    <p style="margin: 0;">给你一个整数数组 <code style="color: #fde047; font-family: monospace;">nums</code> ，数组中的元素 <strong>互不相同</strong> 。返回该数组所有可能的子集（幂集）。</p>
    <p style="margin: 0;">解集 <strong>不能</strong> 包含重复的子集。你可以按 <strong>任意顺序</strong> 返回解集。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: nums = [1,2,3]</div>
      <div>输出: [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]</div>
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
      <div>• nums 中的所有元素 互不相同</div>
    </div>
  </div>
`;

export const SUBSET_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 子集问题核心：全树节点收集
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 组合问题 vs 子集问题</div>
        <p style="margin: 0; color: #94a3b8;"><strong>组合问题/分割问题</strong>是收集树的<strong>叶子节点</strong>（满足固定大小或终止条件时收集）；而<strong>子集问题</strong>是收集树上的<strong>所有节点</strong>！树中每一个节点对应的路径都是一个合法子集。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 收集位置：函数入口处</div>
        <p style="margin: 0; color: #94a3b8;">在进入 <code style="color: #7dd3fc; font-family: monospace;">backtrack</code> 函数的第一行，不加任何条件，直接执行 <code style="color: #fde047; font-family: monospace;">res.add(new ArrayList<>(path))</code>，包括根节点的空子集 <code style="color: #34d399; font-family: monospace;">[]</code>。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #fbbf24; margin-bottom: 4px;">③ 递归与回溯设计</div>
        <p style="margin: 0; color: #94a3b8;">通过 <code style="color: #7dd3fc; font-family: monospace;">startIndex</code> 推进，递归时传入 <code style="color: #34d399; font-family: monospace;">i + 1</code>（元素不可重复选取），当 <code style="color: #fb7185; font-family: monospace;">startIndex >= nums.length</code> 时循环自然结束返回。</p>
      </div>
    </div>
  </div>
`;

export const SUBSET_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public List<List<Integer>> subsets(int[] nums) {',
    '    List<List<Integer>> res = new ArrayList<>();',
    '    backtrack(nums, 0, new ArrayList<>(), res);',
    '    return res;',
    '}',
    '',
    'void backtrack(int[] nums, int startIndex, List<Integer> path, List<List<Integer>> res) {',
    '    // 子集问题：每一个节点都要收集！',
    '    res.add(new ArrayList<>(path));',
    '    ',
    '    for (int i = startIndex; i < nums.length; i++) {',
    '        path.add(nums[i]);',
    '        backtrack(nums, i + 1, path, res); // 递归下一层',
    '        path.remove(path.size() - 1); // 回溯撤销',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<vector<int>> subsets(vector<int>& nums) {',
    '        vector<vector<int>> res;',
    '        vector<int> path;',
    '        backtrack(nums, 0, path, res);',
    '        return res;',
    '    }',
    '    void backtrack(const vector<int>& nums, int startIndex,',
    '                   vector<int>& path, vector<vector<int>>& res) {',
    '        res.push_back(path); // 收集每个节点',
    '        for (int i = startIndex; i < nums.size(); i++) {',
    '            path.push_back(nums[i]);',
    '            backtrack(nums, i + 1, path, res);',
    '            path.pop_back();',
    '        }',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def subsets(self, nums: List[int]) -> List[List[int]]:',
    '        res = []',
    '        def backtrack(start: int, path: List[int]):',
    '            res.append(list(path)) # 收集每个节点',
    '            for i in range(start, len(nums)):',
    '                path.append(nums[i])',
    '                backtrack(i + 1, path)',
    '                path.pop()',
    '        backtrack(0, [])',
    '        return res',
  ],
  javascript: [
    'var subsets = function(nums) {',
    '    const res = [];',
    '    function backtrack(startIndex, path) {',
    '        res.push([...path]); // 收集每个节点',
    '        for (let i = startIndex; i < nums.length; i++) {',
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
