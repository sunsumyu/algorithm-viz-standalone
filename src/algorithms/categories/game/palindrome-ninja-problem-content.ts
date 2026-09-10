/**
 * 回文忍者·神速飞刀切割者 (Palindrome Ninja: Backtracking Slicer)
 * 经典回溯算法（Backtracking）、分割回文串（LeetCode 131）与双指针回文检测多语言题解
 */

export const PALINDROME_NINJA_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <string>',
    'using namespace std;',
    '',
    '// 经典回溯算法：分割回文串 (LeetCode 131)',
    'class PalindromeNinja {',
    'public:',
    '    vector<vector<string>> partition(string s) {',
    '        vector<vector<string>> result;',
    '        vector<string> path;',
    '        backtrack(s, 0, path, result);',
    '        return result;',
    '    }',
    '',
    'private:',
    '    void backtrack(const string& s, int startIndex, vector<string>& path, vector<vector<string>>& result) {',
    '        // 切割线到达字符串末尾，说明找到了一个合法分割方案',
    '        if (startIndex >= s.length()) {',
    '            result.push_back(path);',
    '            return;',
    '        }',
    '',
    '        for (int i = startIndex; i < s.length(); i++) {',
    '            // 判断当前子串 [startIndex, i] 是否为回文',
    '            if (isPalindrome(s, startIndex, i)) {',
    '                string sub = s.substr(startIndex, i - startIndex + 1);',
    '                path.push_back(sub); // 拔刀切割',
    '                backtrack(s, i + 1, path, result); // 递归切割后续子串',
    '                path.pop_back(); // 回退撤销选择 (回溯)',
    '            }',
    '        }',
    '    }',
    '',
    '    bool isPalindrome(const string& s, int start, int end) {',
    '        while (start < end) {',
    '            if (s[start++] != s[end--]) return false;',
    '        }',
    '        return true;',
    '    }',
    '};',
  ],
  java: [
    'import java.util.*;',
    '',
    'public class PalindromePartition {',
    '    public List<List<String>> partition(String s) {',
    '        List<List<String>> res = new ArrayList<>();',
    '        List<String> path = new ArrayList<>();',
    '        dfs(s, 0, path, res);',
    '        return res;',
    '    }',
    '',
    '    private void dfs(String s, int start, List<String> path, List<List<String>> res) {',
    '        if (start >= s.length()) {',
    '            res.add(new ArrayList<>(path));',
    '            return;',
    '        }',
    '        for (int i = start; i < s.length(); i++) {',
    '            if (isPalindrome(s, start, i)) {',
    '                path.add(s.substring(start, i + 1));',
    '                dfs(s, i + 1, path, res);',
    '                path.remove(path.size() - 1);',
    '            }',
    '        }',
    '    }',
    '',
    '    private boolean isPalindrome(String s, int l, int r) {',
    '        while (l < r) {',
    '            if (s.charAt(l++) != s.charAt(r--)) return false;',
    '        }',
    '        return true;',
    '    }',
    '}',
  ],
  python: [
    'def partition(s: str) -> list[list[str]]:',
    '    """回溯搜索所有回文子串分割组合"""',
    '    res = []',
    '    path = []',
    '',
    '    def backtrack(start: int):',
    '        if start >= len(s):',
    '            res.append(path.copy())',
    '            return',
    '        for i in range(start, len(s)):',
    '            sub = s[start : i + 1]',
    '            if sub == sub[::-1]: # 回文检测',
    '                path.append(sub)',
    '                backtrack(i + 1)',
    '                path.pop()',
    '',
    '    backtrack(0)',
    '    return res',
  ],
  javascript: [
    'function partition(s) {',
    '  const res = [];',
    '  const path = [];',
    '  function isPalin(str, l, r) {',
    '    while (l < r) if (str[l++] !== str[r--]) return false;',
    '    return true;',
    '  }',
    '  function backtrack(start) {',
    '    if (start >= s.length) { res.push([...path]); return; }',
    '    for (let i = start; i < s.length; i++) {',
    '      if (isPalin(s, start, i)) {',
    '        path.push(s.slice(start, i + 1));',
    '        backtrack(i + 1);',
    '        path.pop();',
    '      }',
    '    }',
    '  }',
    '  backtrack(0);',
    '  return res;',
    '}',
  ],
};

export const PALINDROME_NINJA_PROBLEM_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
      <span style="font-size: 20px;">🗡️</span>
      <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #0f172a;">回文忍者·神速飞刀切割者 (Palindrome Ninja)</h3>
      <span style="background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid #bfdbfe;">回溯经典 LeetCode 131</span>
    </div>

    <p style="font-size: 12.5px; color: #334155; margin-bottom: 10px;">
      神秘卷轴上刻着古老的字符符文（如 <code>"aab"</code>、<code>"cbbbcc"</code>、<code>"racecar"</code>）。忍者手持发光神刃，挥刀在字符间切下刀痕。要求<b>每一段被切开的子串都必须是回文串</b>！通过<b>回溯与剪枝</b>斩获全部合法切割方案！
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🎮 忍者切竹玩法</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>🗡️ 60 FPS 刀光特效</b>：点击字符间隙拔刀切割，竹简四分五裂；</li>
          <li><b>✨ 回文黄金光晕</b>：回文子串泛起金光，非回文崩裂并触发回溯；</li>
          <li><b>🖼️ 全解画廊</b>：一键自动演算并切换所有合法分割方案。</li>
        </ul>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🧠 回溯切割精髓</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>切割线当索引</b>：$[startIndex, i]$ 为当前切片，若为回文则向深层推进；</li>
          <li><b>剪枝回退</b>：若当前切片非回文，直接剪枝跳过，绝不深入递归！</li>
        </ul>
      </div>
    </div>
  </div>
`;

export const PALINDROME_NINJA_ANALYSIS_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <h3 style="margin-top: 0; font-size: 14px; font-weight: 800; color: #0f172a;">回溯分割与回文动态判定</h3>

    <div style="margin-bottom: 10px;">
      <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #2563eb;">1. 组合与分割问题的回溯本质</h4>
      <p style="font-size: 11.5px; color: #475569; margin: 0;">
        分割问题本质上是在字符串的 $N-1$ 个间隙中做选择（切与不切）。通过回溯算法，每一次决策截取一个回文前缀，剩下的后缀交给下一层递归，天然构成了回溯搜索树！
      </p>
    </div>
  </div>
`;
