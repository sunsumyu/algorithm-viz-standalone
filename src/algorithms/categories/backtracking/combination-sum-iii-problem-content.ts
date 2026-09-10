/**
 * LeetCode 216: 组合总和 III (Combination Sum III)
 * 领域知识与题解精讲配置声明
 */

export const COMBINATION_SUM_III_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 216</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">组合总和 III (Combination Sum III)</h2>
    </div>
    <p style="margin: 0;">找出所有相加之和为 <code style="color: #fde047; font-family: monospace;">n</code> 的 <code style="color: #fde047; font-family: monospace;">k</code> 个数的组合，且满足下列条件：</p>
    <p style="margin: 0;">• 只使用数字 <code style="color: #7dd3fc; font-family: monospace;">1</code> 到 <code style="color: #7dd3fc; font-family: monospace;">9</code></p>
    <p style="margin: 0;">• 每个数字 <strong>最多使用一次</strong></p>
    <p style="margin: 0;">返回 <em>所有可能的有效组合的列表</em> 。你可以按任何顺序返回答案。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: k = 3, n = 7</div>
      <div>输出: [[1,2,4]]</div>
      <div style="color: #94a3b8; font-size: 10.5px;">解释: 1 + 2 + 4 = 7，没有其他符合条件的 3 个数的组合。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: k = 3, n = 9</div>
      <div>输出: [[1,2,6], [1,3,5], [2,3,4]]</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 2 &le; k &le; 9</div>
      <div>• 1 &le; n &le; 60</div>
    </div>
  </div>
`;

export const COMBINATION_SUM_III_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 双重剪枝优化（累加和超额 + 剩余元素不足）
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 递归函数设计</div>
        <p style="margin: 0; color: #94a3b8;">定义 <code style="color: #7dd3fc; font-family: monospace;">backtrack(targetSum, k, sum, startIndex, path, res)</code>，固定只枚举数字 1 到 9。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 递归终止条件</div>
        <p style="margin: 0; color: #94a3b8;">当 <code style="color: #7dd3fc; font-family: monospace;">path.size() == k</code> 时：若 <code style="color: #34d399; font-family: monospace;">sum == targetSum</code>，收集结果；无论是否满足和均直接 <code style="color: #fde047; font-family: monospace;">return</code>。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #fbbf24; margin-bottom: 4px;">③ 剪枝 1：累加和已超额</div>
        <p style="margin: 0; color: #94a3b8;">如果当前 <code style="color: #fb7185; font-family: monospace;">sum + i > targetSum</code>，由于数字递增，后续分支必定超额，直接 <code style="color: #fde047; font-family: monospace;">break</code>。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #fb7185; margin-bottom: 4px;">④ 剪枝 2：剩余可选数字不足</div>
        <p style="margin: 0; color: #94a3b8;">至多枚举到 <code style="color: #7dd3fc; font-family: monospace;">9 - (k - path.size()) + 1</code>。如果当前剩余数字不足以填满 k 个槽位，直接终止循环。</p>
      </div>
    </div>
  </div>
`;

export const COMBINATION_SUM_III_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public List<List<Integer>> combinationSum3(int k, int n) {',
    '    List<List<Integer>> res = new ArrayList<>();',
    '    backtrack(n, k, 0, 1, new ArrayList<>(), res);',
    '    return res;',
    '}',
    '',
    'void backtrack(int targetSum, int k, int sum, int startIndex,',
    '               List<Integer> path, List<List<Integer>> res) {',
    '    // 剪枝 1：累加和超额',
    '    if (sum > targetSum) return;',
    '    // 终止条件：选够 k 个数',
    '    if (path.size() == k) {',
    '        if (sum == targetSum) res.add(new ArrayList<>(path));',
    '        return;',
    '    }',
    '    // 剪枝 2：剩余数字不足 + 和超额',
    '    for (int i = startIndex; i <= 9 - (k - path.size()) + 1; i++) {',
    '        if (sum + i > targetSum) break;',
    '        path.add(i);',
    '        backtrack(targetSum, k, sum + i, i + 1, path, res);',
    '        path.remove(path.size() - 1);',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<vector<int>> combinationSum3(int k, int n) {',
    '        vector<vector<int>> res;',
    '        vector<int> path;',
    '        backtrack(n, k, 0, 1, path, res);',
    '        return res;',
    '    }',
    '    void backtrack(int targetSum, int k, int sum, int startIndex,',
    '                   vector<int>& path, vector<vector<int>>& res) {',
    '        if (sum > targetSum) return;',
    '        if (path.size() == k) {',
    '            if (sum == targetSum) res.push_back(path);',
    '            return;',
    '        }',
    '        for (int i = startIndex; i <= 9 - (k - (int)path.size()) + 1; i++) {',
    '            if (sum + i > targetSum) break;',
    '            path.push_back(i);',
    '            backtrack(targetSum, k, sum + i, i + 1, path, res);',
    '            path.pop_back();',
    '        }',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def combinationSum3(self, k: int, n: int) -> List[List[int]]:',
    '        res = []',
    '        def backtrack(target: int, k: int, total: int, start: int, path: List[int]):',
    '            if total > target:',
    '                return',
    '            if len(path) == k:',
    '                if total == target:',
    '                    res.append(list(path))',
    '                return',
    '            for i in range(start, 9 - (k - len(path)) + 2):',
    '                if total + i > target:',
    '                    break',
    '                path.append(i)',
    '                backtrack(target, k, total + i, i + 1, path)',
    '                path.pop()',
    '        backtrack(n, k, 0, 1, [])',
    '        return res',
  ],
  javascript: [
    'var combinationSum3 = function(k, n) {',
    '    const res = [];',
    '    function backtrack(targetSum, k, sum, startIndex, path) {',
    '        if (sum > targetSum) return;',
    '        if (path.length === k) {',
    '            if (sum === targetSum) res.push([...path]);',
    '            return;',
    '        }',
    '        for (let i = startIndex; i <= 9 - (k - path.length) + 1; i++) {',
    '            if (sum + i > targetSum) break;',
    '            path.push(i);',
    '            backtrack(targetSum, k, sum + i, i + 1, path);',
    '            path.pop();',
    '        }',
    '    }',
    '    backtrack(n, k, 0, 1, []);',
    '    return res;',
    '};',
  ],
};
