/**
 * 密码谍报·电话拨号树状解密 (Spy Cipher: Phone Dial Letter Combinations)
 * 经典回溯算法（Multi-Branch Backtracking）、电话号码字母组合（LeetCode 17）与全息状态空间树多语言题解
 */

export const SPY_DIAL_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <string>',
    'using namespace std;',
    '',
    '// 经典回溯：电话号码的字母组合 (LeetCode 17)',
    'class SpyDialSolver {',
    'private:',
    '    const vector<string> letterMap = {',
    '        "", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"',
    '    };',
    '    vector<string> result;',
    '    string currentPath;',
    '',
    '    void backtrack(const string& digits, int index) {',
    '        // 递归终止条件：已处理完所有按键数字',
    '        if (index == digits.length()) {',
    '            result.push_back(currentPath);',
    '            return;',
    '        }',
    '',
    '        int digit = digits[index] - \'0\';',
    '        const string& letters = letterMap[digit]; // 当前数字对应的所有候选字母',
    '',
    '        for (int i = 0; i < letters.length(); i++) {',
    '            currentPath.push_back(letters[i]); // 拨号选字母',
    '            backtrack(digits, index + 1);      // 递归处理下一个数字',
    '            currentPath.pop_back();            // 撤销选择 (回溯)',
    '        }',
    '    }',
    '',
    'public:',
    '    vector<string> letterCombinations(string digits) {',
    '        if (digits.empty()) return {};',
    '        result.clear();',
    '        currentPath.clear();',
    '        backtrack(digits, 0);',
    '        return result;',
    '    }',
    '};',
  ],
  java: [
    'import java.util.*;',
    '',
    'public class SpyDialCombinations {',
    '    private static final String[] MAP = {',
    '        "", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"',
    '    };',
    '',
    '    public static List<String> letterCombinations(String digits) {',
    '        List<String> res = new ArrayList<>();',
    '        if (digits.isEmpty()) return res;',
    '        dfs(digits, 0, new StringBuilder(), res);',
    '        return res;',
    '    }',
    '',
    '    private static void dfs(String digits, int idx, StringBuilder path, List<String> res) {',
    '        if (idx == digits.length()) {',
    '            res.add(path.toString());',
    '            return;',
    '        }',
    '        String letters = MAP[digits.charAt(idx) - \'0\'];',
    '        for (char c : letters.toCharArray()) {',
    '            path.append(c);',
    '            dfs(digits, idx + 1, path, res);',
    '            path.deleteCharAt(path.length() - 1);',
    '        }',
    '    }',
    '}',
  ],
  python: [
    'def letter_combinations(digits: str) -> list[str]:',
    '    """回溯生成电话号码全部密码组合"""',
    '    if not digits:',
    '        return []',
    '    phone_map = {',
    '        "2": "abc", "3": "def", "4": "ghi", "5": "jkl",',
    '        "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"',
    '    }',
    '    res = []',
    '    path = []',
    '',
    '    def backtrack(idx: int):',
    '        if idx == len(digits):',
    '            res.append("".join(path))',
    '            return',
    '        for char in phone_map[digits[idx]]:',
    '            path.append(char)',
    '            backtrack(idx + 1)',
    '            path.pop()',
    '',
    '    backtrack(0)',
    '    return res',
  ],
  javascript: [
    'function letterCombinations(digits) {',
    '  if (!digits) return [];',
    '  const map = ["", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"];',
    '  const res = [];',
    '  const path = [];',
    '  function backtrack(idx) {',
    '    if (idx === digits.length) { res.push(path.join("")); return; }',
    '    const letters = map[Number(digits[idx])];',
    '    for (let i = 0; i < letters.length; i++) {',
    '      path.push(letters[i]);',
    '      backtrack(idx + 1);',
    '      path.pop();',
    '    }',
    '  }',
    '  backtrack(0);',
    '  return res;',
    '}',
  ],
};

export const SPY_DIAL_PROBLEM_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
      <span style="font-size: 20px;">📞</span>
      <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #0f172a;">密码谍报·电话拨号树状解密 (Spy Cipher: Phone Dial)</h3>
      <span style="background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid #bfdbfe;">多分支回溯 LeetCode 17</span>
    </div>

    <p style="font-size: 12.5px; color: #334155; margin-bottom: 10px;">
      特工手提箱里截获了一串加密数字（如 <code>"23"</code>、<code>"79"</code>）。电话按键 2~9 各映射了 3~4 个可能字母。如何通过<b>多分支回溯搜索树</b>，在 $O(3^N \\times 4^M)$ 状态空间中完整解构出所有谍报明文密码？
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🎮 谍报解码玩法</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>📞 80 年代赛博拨号键盘</b>：点击按键听到拟真双音频 DTMF 提示音；</li>
          <li><b>🌳 全息回溯分支树</b>：实时在画布中绘制激光分支与密电胶囊；</li>
          <li><b>✨ 一键全景解密</b>：动态展示递归下潜至叶子节点组合明文。</li>
        </ul>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🧠 多分支搜索树核心</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>树的深度</b>：等于输入数字字符串的长度 <code>digits.length</code>；</li>
          <li><b>树的宽度</b>：等于当前数字键对应的字母个数（3 或 4 分支）；</li>
          <li><b>回溯本质</b>：DFS 前往叶子收集完整单词，返回时恢复 <code>path</code>。</li>
        </ul>
      </div>
    </div>
  </div>
`;

export const SPY_DIAL_ANALYSIS_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <h3 style="margin-top: 0; font-size: 14px; font-weight: 800; color: #0f172a;">多分支回溯搜索树拓扑解析</h3>

    <div style="margin-bottom: 10px;">
      <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #2563eb;">1. 树的层级结构与组合生成</h4>
      <p style="font-size: 11.5px; color: #475569; margin: 0;">
        以 <code>"23"</code> 为例：
        <br>• 第 0 层（根节点）：空路径 <code>""</code>；
        <br>• 第 1 层（数字 2）：产生 3 个分支 <code>['a', 'b', 'c']</code>；
        <br>• 第 2 层（数字 3）：每个分支再分裂 3 个子分支 <code>['d', 'e', 'f']</code>，共 $3 \\times 3 = 9$ 个叶子节点！
      </p>
    </div>
  </div>
`;
