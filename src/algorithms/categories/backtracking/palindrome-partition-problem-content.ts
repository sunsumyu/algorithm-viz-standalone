/**
 * LeetCode 131: 分割回文串 (Palindrome Partitioning)
 * 领域知识与题解精讲配置声明
 */

export const PALINDROME_PARTITION_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 131</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">分割回文串 (Palindrome Partitioning)</h2>
    </div>
    <p style="margin: 0;">给你一个字符串 <code style="color: #fde047; font-family: monospace;">s</code>，请你将 <code style="color: #fde047; font-family: monospace;">s</code> 分割成一些子串，使每个子串都是 <strong>回文串</strong> 。返回 <code style="color: #fde047; font-family: monospace;">s</code> 所有可能的分割方案。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: s = "aab"</div>
      <div>输出: [["a","a","b"],["aa","b"]]</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: s = "a"</div>
      <div>输出: [["a"]]</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; s.length &le; 16</div>
      <div>• s 仅由小写英文字母组成</div>
    </div>
  </div>
`;

export const PALINDROME_PARTITION_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 分割问题本质与回文判定剪枝
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 分割问题等价于组合问题</div>
        <p style="margin: 0; color: #94a3b8;">字符串长度为 n，共有 <code style="color: #7dd3fc; font-family: monospace;">n - 1</code> 个切割缝隙。每次从 <code style="color: #fde047; font-family: monospace;">startIndex</code> 开始枚举切割终点 <code style="color: #fde047; font-family: monospace;">i</code>，截取子串 <code style="color: #34d399; font-family: monospace;">s[startIndex..i]</code>。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 递归终止条件</div>
        <p style="margin: 0; color: #94a3b8;">当 <code style="color: #7dd3fc; font-family: monospace;">startIndex >= s.length()</code> 时，说明切割线已经到达字符串末尾，找到了一组全回文切割方案，将当前 <code style="color: #fde047; font-family: monospace;">path</code> 收集并 <code style="color: #fde047; font-family: monospace;">return</code>。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #fbbf24; margin-bottom: 4px;">③ 非回文即时剪枝</div>
        <p style="margin: 0; color: #94a3b8;">若截取的子串 <code style="color: #fb7185; font-family: monospace;">!isPalindrome(s, startIndex, i)</code>，则该切割无效，直接 <code style="color: #fde047; font-family: monospace;">continue</code> 跳过该分支，不再向下递归。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #fb7185; margin-bottom: 4px;">④ 回溯撤销现场</div>
        <p style="margin: 0; color: #94a3b8;"><code style="color: #7dd3fc; font-family: monospace;">path.add(substring)</code> 与 <code style="color: #fb7185; font-family: monospace;">path.remove(path.size() - 1)</code> 成对执行。</p>
      </div>
    </div>
  </div>
`;

export const PALINDROME_PARTITION_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public List<List<String>> partition(String s) {',
    '    List<List<String>> res = new ArrayList<>();',
    '    backtrack(s, 0, new ArrayList<>(), res);',
    '    return res;',
    '}',
    '',
    'void backtrack(String s, int startIndex, List<String> path, List<List<String>> res) {',
    '    // 切割线到达字符串末尾，收集方案',
    '    if (startIndex >= s.length()) {',
    '        res.add(new ArrayList<>(path));',
    '        return;',
    '    }',
    '    for (int i = startIndex; i < s.length(); i++) {',
    '        if (isPalindrome(s, startIndex, i)) {',
    '            String str = s.substring(startIndex, i + 1);',
    '            path.add(str);',
    '            backtrack(s, i + 1, path, res); // 切割下一段',
    '            path.remove(path.size() - 1); // 撤销现场',
    '        }',
    '    }',
    '}',
    '',
    'boolean isPalindrome(String s, int start, int end) {',
    '    while (start < end) {',
    '        if (s.charAt(start++) != s.charAt(end--)) return false;',
    '    }',
    '    return true;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<vector<string>> partition(string s) {',
    '        vector<vector<string>> res;',
    '        vector<string> path;',
    '        backtrack(s, 0, path, res);',
    '        return res;',
    '    }',
    '    void backtrack(const string& s, int startIndex, vector<string>& path, vector<vector<string>>& res) {',
    '        if (startIndex >= s.size()) {',
    '            res.push_back(path);',
    '            return;',
    '        }',
    '        for (int i = startIndex; i < s.size(); i++) {',
    '            if (isPalindrome(s, startIndex, i)) {',
    '                path.push_back(s.substr(startIndex, i - startIndex + 1));',
    '                backtrack(s, i + 1, path, res);',
    '                path.pop_back();',
    '            }',
    '        }',
    '    }',
    '    bool isPalindrome(const string& s, int start, int end) {',
    '        while (start < end) {',
    '            if (s[start++] != s[end--]) return false;',
    '        }',
    '        return true;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def partition(self, s: str) -> List[List[str]]:',
    '        res = []',
    '        def is_palindrome(sub: str) -> bool:',
    '            return sub == sub[::-1]',
    '        def backtrack(start: int, path: List[str]):',
    '            if start >= len(s):',
    '                res.append(list(path))',
    '                return',
    '            for i in range(start, len(s)):',
    '                sub = s[start:i+1]',
    '                if is_palindrome(sub):',
    '                    path.append(sub)',
    '                    backtrack(i + 1, path)',
    '                    path.pop()',
    '        backtrack(0, [])',
    '        return res',
  ],
  javascript: [
    'var partition = function(s) {',
    '    const res = [];',
    '    function isPalindrome(str, l, r) {',
    '        while (l < r) {',
    '            if (str[l++] !== str[r--]) return false;',
    '        }',
    '        return true;',
    '    }',
    '    function backtrack(start, path) {',
    '        if (start >= s.length) {',
    '            res.push([...path]);',
    '            return;',
    '        }',
    '        for (let i = start; i < s.length; i++) {',
    '            if (isPalindrome(s, start, i)) {',
    '                path.push(s.slice(start, i + 1));',
    '                backtrack(i + 1, path);',
    '                path.pop();',
    '            }',
    '        }',
    '    }',
    '    backtrack(0, []);',
    '    return res;',
    '};',
  ],
};
