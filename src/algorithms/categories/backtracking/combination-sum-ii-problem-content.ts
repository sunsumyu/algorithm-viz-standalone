/**
 * LeetCode 40: 组合总和 II (Combination Sum II)
 * 领域知识与题解精讲配置声明
 */

export const COMBINATION_SUM_II_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 40</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">组合总和 II (Combination Sum II)</h2>
    </div>
    <p style="margin: 0;">给定一个候选人编号的集合 <code style="color: #fde047; font-family: monospace;">candidates</code> 和一个目标数 <code style="color: #fde047; font-family: monospace;">target</code> ，找出 <code style="color: #fde047; font-family: monospace;">candidates</code> 中所有可以使数字和为 <code style="color: #fde047; font-family: monospace;">target</code> 的组合。</p>
    <p style="margin: 0;"><code style="color: #7dd3fc; font-family: monospace;">candidates</code> 中的每个数字在每个组合中 <strong>只能使用一次</strong> 。</p>
    <p style="margin: 0;"><strong style="color:#f87171;">注意：</strong>解集不能包含重复的组合。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: candidates = [10,1,2,7,6,1,5], target = 8</div>
      <div>输出: [[1,1,6],[1,2,5],[1,7],[2,6]]</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: candidates = [2,5,2,1,2], target = 5</div>
      <div>输出: [[1,2,2],[5]]</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; candidates.length &le; 100</div>
      <div>• 1 &le; candidates[i] &le; 50</div>
      <div>• 1 &le; target &le; 30</div>
    </div>
  </div>
`;

export const COMBINATION_SUM_II_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 树枝去重 vs 树层去重（核心精讲）
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 为什么需要先对数组进行排序？</div>
        <p style="margin: 0; color: #94a3b8;">只有排好序，相同的数字才会相邻在一起，这样我们才能在单层循环中通过比较 <code style="color: #fde047; font-family: monospace;">candidates[i] == candidates[i - 1]</code> 精确识别重复分支。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 树层去重判定条件：i > startIndex</div>
        <p style="margin: 0; color: #94a3b8;">如果 <code style="color: #7dd3fc; font-family: monospace;">candidates[i] == candidates[i - 1]</code> 且 <code style="color: #fb7185; font-family: monospace;">i > startIndex</code>，说明在<strong>同一树层</strong>（同一个 for 循环）中已经使用过了前一个相同数字，此时必须 <code style="color: #fde047; font-family: monospace;">continue</code> 剪除重复树枝！而在<strong>树枝纵向深入</strong>（递归）中，<code style="color: #34d399; font-family: monospace;">i == startIndex</code>，允许使用重复元素。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #818cf8; margin-bottom: 4px;">③ 不可复用：下一层传入 i + 1</div>
        <p style="margin: 0; color: #94a3b8;">每个元素在组合中只能使用一次，因此递归调用时传入 <code style="color: #34d399; font-family: monospace;">i + 1</code>。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #fbbf24; margin-bottom: 4px;">④ 累加和剪枝</div>
        <p style="margin: 0; color: #94a3b8;">当 <code style="color: #fb7185; font-family: monospace;">sum + candidates[i] > target</code> 时，由于数组已排序，后续分支必然超额，直接 <code style="color: #fde047; font-family: monospace;">break</code>。</p>
      </div>
    </div>
  </div>
`;

export const COMBINATION_SUM_II_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public List<List<Integer>> combinationSum2(int[] candidates, int target) {',
    '    List<List<Integer>> res = new ArrayList<>();',
    '    Arrays.sort(candidates); // 排序是去重与剪枝的前提',
    '    backtrack(candidates, target, 0, 0, new ArrayList<>(), res);',
    '    return res;',
    '}',
    '',
    'void backtrack(int[] candidates, int target, int sum, int startIndex,',
    '               List<Integer> path, List<List<Integer>> res) {',
    '    if (sum == target) {',
    '        res.add(new ArrayList<>(path));',
    '        return;',
    '    }',
    '    for (int i = startIndex; i < candidates.length; i++) {',
    '        // 剪枝：累加和超额直接结束',
    '        if (sum + candidates[i] > target) break;',
    '        // 树层去重：同层遇到相同元素跳过',
    '        if (i > startIndex && candidates[i] == candidates[i - 1]) continue;',
    '        path.add(candidates[i]);',
    '        backtrack(candidates, target, sum + candidates[i], i + 1, path, res); // i + 1',
    '        path.remove(path.size() - 1);',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<vector<int>> combinationSum2(vector<int>& candidates, int target) {',
    '        vector<vector<int>> res;',
    '        vector<int> path;',
    '        sort(candidates.begin(), candidates.end());',
    '        backtrack(candidates, target, 0, 0, path, res);',
    '        return res;',
    '    }',
    '    void backtrack(vector<int>& candidates, int target, int sum, int startIndex,',
    '                   vector<int>& path, vector<vector<int>>& res) {',
    '        if (sum == target) {',
    '            res.push_back(path);',
    '            return;',
    '        }',
    '        for (int i = startIndex; i < candidates.size(); i++) {',
    '            if (sum + candidates[i] > target) break;',
    '            if (i > startIndex && candidates[i] == candidates[i - 1]) continue;',
    '            path.push_back(candidates[i]);',
    '            backtrack(candidates, target, sum + candidates[i], i + 1, path, res);',
    '            path.pop_back();',
    '        }',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def combinationSum2(self, candidates: List[int], target: int) -> List[List[int]]:',
    '        res = []',
    '        candidates.sort()',
    '        def backtrack(start: int, total: int, path: List[int]):',
    '            if total == target:',
    '                res.append(list(path))',
    '                return',
    '            for i in range(start, len(candidates)):',
    '                if total + candidates[i] > target:',
    '                    break',
    '                if i > start and candidates[i] == candidates[i - 1]:',
    '                    continue',
    '                path.append(candidates[i])',
    '                backtrack(i + 1, total + candidates[i], path)',
    '                path.pop()',
    '        backtrack(0, 0, [])',
    '        return res',
  ],
  javascript: [
    'var combinationSum2 = function(candidates, target) {',
    '    const res = [];',
    '    candidates.sort((a, b) => a - b);',
    '    function backtrack(startIndex, sum, path) {',
    '        if (sum === target) {',
    '            res.push([...path]);',
    '            return;',
    '        }',
    '        for (let i = startIndex; i < candidates.length; i++) {',
    '            if (sum + candidates[i] > target) break;',
    '            if (i > startIndex && candidates[i] === candidates[i - 1]) continue;',
    '            path.push(candidates[i]);',
    '            backtrack(i + 1, sum + candidates[i], path);',
    '            path.pop();',
    '        }',
    '    }',
    '    backtrack(0, 0, []);',
    '    return res;',
    '};',
  ],
};
