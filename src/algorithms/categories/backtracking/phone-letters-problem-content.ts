/**
 * LeetCode 17: 电话号码的字母组合 (Letter Combinations of a Phone Number)
 * 领域知识与题解精讲配置声明
 */

export const PHONE_LETTERS_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 17</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">电话号码的字母组合 (Letter Combinations)</h2>
    </div>
    <p style="margin: 0;">给定一个仅包含数字 <code style="color: #7dd3fc; font-family: monospace;">2-9</code> 的字符串，返回所有它能表示的字母组合。答案可以按 <strong>任意顺序</strong> 返回。</p>
    <p style="margin: 0;">给出数字到字母的映射如下（与电话按键相同）。注意 1 不对应任何字母。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: digits = "23"</div>
      <div>输出: ["ad","ae","af","bd","be","bf","cd","ce","cf"]</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: digits = ""</div>
      <div>输出: []</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 0 &le; digits.length &le; 4</div>
      <div>• digits[i] 是范围 ['2', '9'] 的一个数字</div>
    </div>
  </div>
`;

export const PHONE_LETTERS_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 跨集合枚举与深度回溯
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 单集合 vs 跨集合组合</div>
        <p style="margin: 0; color: #94a3b8;">前面的 LC 77 / LC 39 是在<strong>同一个集合</strong>中求组合，需要 <code style="color: #7dd3fc; font-family: monospace;">startIndex</code> 避免重复；而本题是<strong>跨多个集合</strong>（每个数字对应一个独立字母集合），递归深度由 <code style="color: #fde047; font-family: monospace;">index</code> 控制，遍历每个集合时每次都从 0 开始。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 递归终止条件</div>
        <p style="margin: 0; color: #94a3b8;">当 <code style="color: #7dd3fc; font-family: monospace;">index == digits.length()</code> 时，说明所有数字都已取出一个字母，路径长度等于数字长度，收集方案并 <code style="color: #fde047; font-family: monospace;">return</code>。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #fbbf24; margin-bottom: 4px;">③ 映射字典与单层循环</div>
        <p style="margin: 0; color: #94a3b8;">获取当前数字 <code style="color: #7dd3fc; font-family: monospace;">digits[index]</code> 对应的字符串 <code style="color: #34d399; font-family: monospace;">letters</code>，遍历其中的每个字母，加入路径后递归 <code style="color: #fde047; font-family: monospace;">index + 1</code>，回溯弹出。</p>
      </div>
    </div>
  </div>
`;

export const PHONE_LETTERS_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'private final String[] letterMap = {',
    '    "", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"',
    '};',
    '',
    'public List<String> letterCombinations(String digits) {',
    '    List<String> res = new ArrayList<>();',
    '    if (digits.isEmpty()) return res;',
    '    backtrack(digits, 0, new StringBuilder(), res);',
    '    return res;',
    '}',
    '',
    'void backtrack(String digits, int index, StringBuilder path, List<String> res) {',
    '    if (index == digits.length()) {',
    '        res.add(path.toString());',
    '        return;',
    '    }',
    '    String letters = letterMap[digits.charAt(index) - \'0\'];',
    '    for (int i = 0; i < letters.length(); i++) {',
    '        path.append(letters.charAt(i));',
    '        backtrack(digits, index + 1, path, res); // 跨集合递归下一层',
    '        path.deleteCharAt(path.length() - 1); // 撤销现场',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    '    const vector<string> letterMap = {',
    '        "", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"',
    '    };',
    'public:',
    '    vector<string> letterCombinations(string digits) {',
    '        vector<string> res;',
    '        if (digits.empty()) return res;',
    '        string path;',
    '        backtrack(digits, 0, path, res);',
    '        return res;',
    '    }',
    '    void backtrack(const string& digits, int index, string& path, vector<string>& res) {',
    '        if (index == digits.size()) {',
    '            res.push_back(path);',
    '            return;',
    '        }',
    '        string letters = letterMap[digits[index] - \'0\'];',
    '        for (char c : letters) {',
    '            path.push_back(c);',
    '            backtrack(digits, index + 1, path, res);',
    '            path.pop_back();',
    '        }',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    MAP = ["", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"]',
    '    def letterCombinations(self, digits: str) -> List[str]:',
    '        if not digits:',
    '            return []',
    '        res = []',
    '        def backtrack(index: int, path: List[str]):',
    '            if index == len(digits):',
    '                res.append("".join(path))',
    '                return',
    '            letters = self.MAP[int(digits[index])]',
    '            for char in letters:',
    '                path.append(char)',
    '                backtrack(index + 1, path)',
    '                path.pop()',
    '        backtrack(0, [])',
    '        return res',
  ],
  javascript: [
    'const letterMap = ["", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"];',
    '',
    'var letterCombinations = function(digits) {',
    '    if (!digits) return [];',
    '    const res = [];',
    '    function backtrack(index, path) {',
    '        if (index === digits.length) {',
    '            res.push(path.join(""));',
    '            return;',
    '        }',
    '        const letters = letterMap[Number(digits[index])];',
    '        for (let i = 0; i < letters.length; i++) {',
    '            path.push(letters[i]);',
    '            backtrack(index + 1, path);',
    '            path.pop();',
    '        }',
    '    }',
    '    backtrack(0, []);',
    '    return res;',
    '};',
  ],
};
