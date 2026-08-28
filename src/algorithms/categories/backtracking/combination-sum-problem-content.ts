/**
 * LeetCode 39: 组合总和 (Combination Sum)
 * 领域知识与题解精讲配置声明
 */

export const COMBINATION_SUM_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 39</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">组合总和 (Combination Sum)</h2>
    </div>
    <p style="margin: 0;">给你一个 <strong>无重复元素</strong> 的整数数组 <code style="color: #fde047; font-family: monospace;">candidates</code> 和一个目标整数 <code style="color: #fde047; font-family: monospace;">target</code>，找出 <code style="color: #fde047; font-family: monospace;">candidates</code> 中可以使数字和为目标数 <code style="color: #fde047; font-family: monospace;">target</code> 的 所有 <strong>不同组合</strong> ，并以列表形式返回。你可以按 <strong>任意顺序</strong> 返回这些组合。</p>
    <p style="margin: 0;"><code style="color: #7dd3fc; font-family: monospace;">candidates</code> 中的 <strong>同一个</strong> 数字可以 <strong>无限制重复被选取</strong> 。如果至少一个数字的被选数量不同，则两种组合是不同的。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: candidates = [2,3,6,7], target = 7</div>
      <div>输出: [[2,2,3],[7]]</div>
      <div style="color: #94a3b8; font-size: 10.5px;">解释: 2 和 3 可以形成一组候选，2 + 2 + 3 = 7。7 也是一个候选，7 = 7。仅有这两种组合。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: candidates = [2,3,5], target = 8</div>
      <div>输出: [[2,2,2,2],[2,3,3],[3,5]]</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; candidates.length &le; 30</div>
      <div>• 2 &le; candidates[i] &le; 40</div>
      <div>• candidates 中的所有元素 <strong>互不相同</strong></div>
      <div>• 1 &le; target &le; 40</div>
    </div>
  </div>
`;

export const COMBINATION_SUM_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 回溯五部曲与剪枝深度推导
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 递归函数签名与参数</div>
        <p style="margin: 0; color: #94a3b8;">定义 <code style="color: #7dd3fc; font-family: monospace;">backtrack(candidates, target, sum, startIndex, path, res)</code>，其中 <code style="color: #fde047; font-family: monospace;">sum</code> 记录当前路径累加和，<code style="color: #fde047; font-family: monospace;">startIndex</code> 保证组合不重复且避免逆序冗余。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 递归终止条件</div>
        <p style="margin: 0; color: #94a3b8;">当 <code style="color: #7dd3fc; font-family: monospace;">sum == target</code> 时，找到合法组合，收集并 <code style="color: #fde047; font-family: monospace;">return</code>；若 <code style="color: #fb7185; font-family: monospace;">sum > target</code> 则直接返回。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #818cf8; margin-bottom: 4px;">③ 为什么下一层递归传 i 而不是 i + 1</div>
        <p style="margin: 0; color: #94a3b8;">题目允许数字<strong>无限制重复被选取</strong>，因此进入下一层递归时传入 <code style="color: #34d399; font-family: monospace;">i</code>，表示本层选了当前数字，下一层仍然可以继续选择同一个数字。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #fbbf24; margin-bottom: 4px;">④ 排序后的关键剪枝优化</div>
        <p style="margin: 0; color: #94a3b8;">先对数组升序排序。在 for 循环中，若 <code style="color: #fb7185; font-family: monospace;">sum + candidates[i] > target</code>，由于后续元素更大，必定超额，直接 <code style="color: #fde047; font-family: monospace;">break</code> 结束本层横向遍历，大幅削减无效子树分支！</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #fb7185; margin-bottom: 4px;">⑤ 回溯撤销现场对称性</div>
        <p style="margin: 0; color: #94a3b8;"><code style="color: #7dd3fc; font-family: monospace;">path.add(c[i])</code> 与 <code style="color: #fb7185; font-family: monospace;">path.remove(path.size() - 1)</code> 严格配对，保证递归返回后路径现场完全恢复。</p>
      </div>
    </div>
  </div>
`;

export const COMBINATION_SUM_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public List<List<Integer>> combinationSum(int[] candidates, int target) {',
    '    List<List<Integer>> res = new ArrayList<>();',
    '    Arrays.sort(candidates); // 排序为剪枝做准备',
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
    '    // 剪枝：若当前 sum + candidates[i] > target，后序元素必大于 target，直接 break',
    '    for (int i = startIndex; i < candidates.length; i++) {',
    '        if (sum + candidates[i] > target) break;',
    '        path.add(candidates[i]);',
    '        backtrack(candidates, target, sum + candidates[i], i, path, res); // 传入 i 支持重复',
    '        path.remove(path.size() - 1); // 回溯撤销现场',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {',
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
    '        for (int i = startIndex; i < candidates.size() && sum + candidates[i] <= target; i++) {',
    '            path.push_back(candidates[i]);',
    '            backtrack(candidates, target, sum + candidates[i], i, path, res);',
    '            path.pop_back();',
    '        }',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:',
    '        res = []',
    '        candidates.sort()',
    '        def backtrack(start: int, total: int, path: List[int]):',
    '            if total == target:',
    '                res.append(list(path))',
    '                return',
    '            for i in range(start, len(candidates)):',
    '                if total + candidates[i] > target:',
    '                    break',
    '                path.append(candidates[i])',
    '                backtrack(i, total + candidates[i], path)',
    '                path.pop()',
    '        backtrack(0, 0, [])',
    '        return res',
  ],
  javascript: [
    'var combinationSum = function(candidates, target) {',
    '    const res = [];',
    '    candidates.sort((a, b) => a - b);',
    '    function backtrack(startIndex, sum, path) {',
    '        if (sum === target) {',
    '            res.push([...path]);',
    '            return;',
    '        }',
    '        for (let i = startIndex; i < candidates.length; i++) {',
    '            if (sum + candidates[i] > target) break;',
    '            path.push(candidates[i]);',
    '            backtrack(i, sum + candidates[i], path);',
    '            path.pop();',
    '        }',
    '    }',
    '    backtrack(0, 0, []);',
    '    return res;',
    '};',
  ],
};
