/**
 * 贪吃蛇·滑动窗口大吞噬 (Sliding Window Snake: Dynamic Window Quest)
 * 经典滑动窗口算法（Sliding Window）、无重复字符最长子串（LeetCode 3）与双指针收缩多语言题解
 */

export const SLIDING_SNAKE_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <string>',
    '#include <unordered_map>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 经典滑动窗口：无重复字符的最长子串 (LeetCode 3)',
    'int lengthOfLongestSubstring(string s) {',
    '    unordered_map<char, int> charMap; // 记录字符最近出现的下标',
    '    int maxLen = 0;',
    '    int left = 0; // 窗口左边界 (蛇尾)',
    '',
    '    // 窗口右边界 (蛇头) 持续向前延伸吞噬',
    '    for (int right = 0; right < s.length(); right++) {',
    '        char ch = s[right];',
    '',
    '        // 若发现窗口内已有重复字符，收缩左边界',
    '        if (charMap.find(ch) != charMap.end() && charMap[ch] >= left) {',
    '            left = charMap[ch] + 1; // 蛇尾收缩至重复字符之后',
    '        }',
    '',
    '        charMap[ch] = right; // 更新该字符最新位置',
    '        maxLen = max(maxLen, right - left + 1); // 记录窗口最大长度',
    '    }',
    '',
    '    return maxLen;',
    '}',
  ],
  java: [
    'import java.util.*;',
    '',
    'public class SlidingWindowSnake {',
    '    public static int lengthOfLongestSubstring(String s) {',
    '        Map<Character, Integer> map = new HashMap<>();',
    '        int maxLen = 0;',
    '        int left = 0;',
    '        for (int right = 0; right < s.length(); right++) {',
    '            char c = s.charAt(right);',
    '            if (map.containsKey(c) && map.get(c) >= left) {',
    '                left = map.get(c) + 1;',
    '            }',
    '            map.put(c, right);',
    '            maxLen = Math.max(maxLen, right - left + 1);',
    '        }',
    '        return maxLen;',
    '    }',
    '}',
  ],
  python: [
    'def length_of_longest_substring(s: str) -> int:',
    '    """滑动窗口：蛇头右移延伸，遇重复蛇尾左移收缩"""',
    '    char_map = {}',
    '    left = 0',
    '    max_len = 0',
    '    for right, ch in enumerate(s):',
    '        if ch in char_map and char_map[ch] >= left:',
    '            left = char_map[ch] + 1',
    '        char_map[ch] = right',
    '        max_len = max(max_len, right - left + 1)',
    '    return max_len',
  ],
  javascript: [
    'function lengthOfLongestSubstring(s) {',
    '  const map = new Map();',
    '  let left = 0;',
    '  let maxLen = 0;',
    '  for (let right = 0; right < s.length; right++) {',
    '    const ch = s[right];',
    '    if (map.has(ch) && map.get(ch) >= left) {',
    '      left = map.get(ch) + 1;',
    '    }',
    '    map.set(ch, right);',
    '    maxLen = Math.max(maxLen, right - left + 1);',
    '  }',
    '  return maxLen;',
    '}',
  ],
};

export const SLIDING_SNAKE_PROBLEM_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
      <span style="font-size: 20px;">🐍</span>
      <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #0f172a;">贪吃蛇·滑动窗口大吞噬 (Sliding Window Snake)</h3>
      <span style="background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid #bfdbfe;">滑动窗口核心 LeetCode 3</span>
    </div>

    <p style="font-size: 12.5px; color: #334155; margin-bottom: 10px;">
      一条霓虹赛博贪吃蛇在字符符文传送带上前进。<b>蛇的身体就是滑动窗口区间 $[left, right]$</b>！蛇头（$right$）向前吞噬字符使身体变长；一旦窗口内出现重复字符，蛇尾（$left$）必须立即收缩排异，求贪吃蛇在无重复符文状态下的<b>历史最大长度</b>！
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🎮 贪吃蛇互动玩法</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>🐍 60 FPS 霓虹贪吃蛇</b>：蛇身随滑动窗口区间动态伸展与收缩；</li>
          <li><b>🍎 符文排异机制</b>：吞入重复字符时蛇尾收缩脱节；</li>
          <li><b>✨ 启示之眼</b>：一键全速吞噬完整字符串并记录最大长度。</li>
        </ul>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🧠 滑动窗口核心原理</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>右边界扩展</b>：主动扩大窗口探索更多解；</li>
          <li><b>左边界收缩</b>：当窗口违反约束（出现重复）时被动收缩恢复合法性；</li>
          <li><b>时间复杂度</b>：$O(N)$ 线性时间（每个字符最多进出窗口各 1 次）。</li>
        </ul>
      </div>
    </div>
  </div>
`;

export const SLIDING_SNAKE_ANALYSIS_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <h3 style="margin-top: 0; font-size: 14px; font-weight: 800; color: #0f172a;">滑动窗口与双指针时空复杂度</h3>

    <div style="margin-bottom: 10px;">
      <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #2563eb;">1. 为什么滑动窗口优于双重暴力循环？</h4>
      <p style="font-size: 11.5px; color: #475569; margin: 0;">
        暴力查找所有子串需要 $O(N^2)$ 遍历与 $O(N)$ 查重，总复杂度 $O(N^3)$。滑动窗口利用了<b>双指针单调向右移动</b>的性质，避免了大量无效子串的重复比对，将复杂度直接降至 $O(N)$！
      </p>
    </div>
  </div>
`;
