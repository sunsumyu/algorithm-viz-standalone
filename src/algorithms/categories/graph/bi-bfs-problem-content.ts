/**
 * 双向广搜 (Bidirectional BFS / Word Ladder) - 题目描述、算法分析与多语言实现
 * 参考左程云《算法通关课》【必备篇】class063: 单词接龙与双向广搜小集合优先扩展机制
 */

export const BI_BFS_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <string>',
    '#include <unordered_set>',
    'using namespace std;',
    '',
    '// 双向广搜 (Bidirectional BFS) - 单词接龙 (LeetCode 127)',
    '// 核心优化：每次始终选择【节点数更小的一侧】进行下一层波前扩散',
    'int ladderLength(string beginWord, string endWord, vector<string>& wordList) {',
    '    unordered_set<string> dict(wordList.begin(), wordList.end());',
    '    if (dict.find(endWord) == dict.end()) return 0;',
    '    ',
    '    unordered_set<string> smallLevel = {beginWord};',
    '    unordered_set<string> bigLevel = {endWord};',
    '    unordered_set<string> visited;',
    '    ',
    '    int len = 2;',
    '    ',
    '    while (!smallLevel.empty()) {',
    '        unordered_set<string> nextLevel;',
    '        ',
    '        for (const string& word : smallLevel) {',
    '            string cur = word;',
    '            for (int i = 0; i < cur.size(); ++i) {',
    '                char old = cur[i];',
    '                for (char ch = "a"; ch <= "z"; ++ch) {',
    '                    if (ch == old) continue;',
    '                    cur[i] = ch;',
    '                    // 若在对向波前集合中出现，两波相遇！',
    '                    if (bigLevel.count(cur)) return len;',
    '                    // 否则若在字典中且未访问',
    '                    if (dict.count(cur) && !visited.count(cur)) {',
    '                        nextLevel.insert(cur);',
    '                        visited.insert(cur);',
    '                    }',
    '                }',
    '                cur[i] = old;',
    '            }',
    '        }',
    '        ',
    '        // 选取更小的一侧作为下一轮扩张集合',
    '        if (nextLevel.size() <= bigLevel.size()) {',
    '            smallLevel = move(nextLevel);',
    '        } else {',
    '            smallLevel = move(bigLevel);',
    '            bigLevel = move(nextLevel);',
    '        }',
    '        len++;',
    '    }',
    '    return 0;',
    '}',
  ],
  java: [
    'package class063;',
    '',
    'import java.util.HashSet;',
    'import java.util.List;',
    '',
    '// 单词接龙 (LeetCode 127) - 左程云标准双向广搜',
    'public class Code01_WordLadder {',
    '    public static int ladderLength(String begin, String end, List<String> wordList) {',
    '        HashSet<String> dict = new HashSet<>(wordList);',
    '        if (!dict.contains(end)) return 0;',
    '        ',
    '        HashSet<String> smallLevel = new HashSet<>();',
    '        HashSet<String> bigLevel = new HashSet<>();',
    '        HashSet<String> visited = new HashSet<>();',
    '        ',
    '        smallLevel.add(begin);',
    '        bigLevel.add(end);',
    '        ',
    '        for (int len = 2; !smallLevel.isEmpty(); len++) {',
    '            HashSet<String> nextLevel = new HashSet<>();',
    '            ',
    '            for (String word : smallLevel) {',
    '                char[] w = word.toCharArray();',
    '                for (int i = 0; i < w.length; i++) {',
    '                    char old = w[i];',
    '                    for (char ch = "a"; ch <= "z"; ch++) {',
    '                        if (ch == old) continue;',
    '                        w[i] = ch;',
    '                        String next = String.valueOf(w);',
    '                        if (bigLevel.contains(next)) {',
    '                            return len; // 双向波前相遇碰撞！',
    '                        }',
    '                        if (dict.contains(next) && !visited.contains(next)) {',
    '                            nextLevel.add(next);',
    '                            visited.add(next);',
    '                        }',
    '                    }',
    '                    w[i] = old;',
    '                }',
    '            }',
    '            ',
    '            // 始终将小集合作为下一次的 smallLevel',
    '            if (nextLevel.size() <= bigLevel.size()) {',
    '                smallLevel = nextLevel;',
    '            } else {',
    '                smallLevel = bigLevel;',
    '                bigLevel = nextLevel;',
    '            }',
    '        }',
    '        return 0;',
    '    }',
    '}',
  ],
  python: [
    'def ladder_length(begin_word: str, end_word: str, word_list: list[str]) -> int:',
    '    words = set(word_list)',
    '    if end_word not in words:',
    '        return 0',
    '    ',
    '    small_set = {begin_word}',
    '    big_set = {end_word}',
    '    visited = set()',
    '    step = 2',
    '    ',
    '    while small_set:',
    '        next_set = set()',
    '        for word in small_set:',
    '            for i in range(len(word)):',
    '                for c in "abcdefghijklmnopqrstuvwxyz":',
    '                    if c == word[i]:',
    '                        continue',
    '                    nxt = word[:i] + c + word[i+1:]',
    '                    if nxt in big_set:',
    '                        return step  # 双向波前相遇',
    '                    if nxt in words and nxt not in visited:',
    '                        next_set.add(nxt)',
    '                        visited.add(nxt)',
    '        ',
    '        # 数量少的一侧作为下一轮扩散前沿',
    '        if len(next_set) <= len(big_set):',
    '            small_set = next_set',
    '        else:',
    '            small_set = big_set',
    '            big_set = next_set',
    '        step += 1',
    '        ',
    '    return 0',
  ],
  javascript: [
    '// 双向广搜 (JavaScript 实现)',
    'function ladderLength(beginWord, endWord, wordList) {',
    '  const dict = new Set(wordList);',
    '  if (!dict.has(endWord)) return 0;',
    '',
    '  let smallLevel = new Set([beginWord]);',
    '  let bigLevel = new Set([endWord]);',
    '  const visited = new Set();',
    '',
    '  let len = 2;',
    '',
    '  while (smallLevel.size > 0) {',
    '    const nextLevel = new Set();',
    '',
    '    for (const word of smallLevel) {',
    '      for (let i = 0; i < word.length; i++) {',
    '        for (let c = 97; c <= 122; c++) {',
    '          const ch = String.fromCharCode(c);',
    '          if (ch === word[i]) continue;',
    '          const next = word.slice(0, i) + ch + word.slice(i + 1);',
    '          if (bigLevel.has(next)) {',
    '            return len; // 碰头成功！',
    '          }',
    '          if (dict.has(next) && !visited.has(next)) {',
    '            nextLevel.add(next);',
    '            visited.add(next);',
    '          }',
    '        }',
    '      }',
    '    }',
    '',
    '    if (nextLevel.size <= bigLevel.size) {',
    '      smallLevel = nextLevel;',
    '    } else {',
    '      smallLevel = bigLevel;',
    '      bigLevel = nextLevel;',
    '    }',
    '    len++;',
    '  }',
    '  return 0;',
    '}',
  ],
};

export const BI_BFS_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🔤 单词接龙 (LeetCode 127 / 双向广搜经典)</h3>
    <p>
      字典 <code>wordList</code> 中从起始单词 <code>beginWord</code> 到目标单词 <code>endWord</code> 的<b>转换序列</b>满足：
      <br/>1. 每一对相邻单词之间<b>恰好只有一个字母不同</b>。
      <br/>2. 转换过程中的每个中间单词都必须在 <code>wordList</code> 中。
    </p>
    <p>
      请计算从 <code>beginWord</code> 到 <code>endWord</code> 的<b>最短转换序列中的单词数目</b>。若无法转换则返回 <code>0</code>。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">📥 输入示例</div>
      <div style="font-family: monospace; font-size: 12px; color: #0f172a;">
        beginWord = "hit", endWord = "cog"<br/>
        wordList = ["hot","dot","dog","lot","log","cog"]
      </div>
      <div style="font-weight: 700; color: #15803d; margin-top: 6px;">📤 输出示例: <code>5</code></div>
      <div style="font-size: 11px; color: #64748b;">
        解释：一个最短转换序列是 "hit" → "hot" → "dot" → "dog" → "cog"，总共包含 5 个单词！
      </div>
    </div>
  </div>
`;

export const BI_BFS_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 左程云双向广搜原理：指数级搜索空间剪枝</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 单向 BFS vs 双向 BFS 的指数差距</div>
      <div style="font-size: 12px; color: #1e40af;">
        设状态图的分支因子（平均邻居数）为 $B$，最短路径长度为 $d$：
        <br/>• <b>单向 BFS</b>：搜索空间按几何级数爆炸，末层需遍历 $B^d$ 个节点。
        <br/>• <b>双向 BFS</b>：从起点与终点<b>同时相向扩张</b>，两波在中间 $d/2$ 处相遇，搜索空间仅为 $2 \times B^{d/2}$！
        <br/>例如若 $B = 10, d = 6$，单向需探索 $10^6 = 1,000,000$ 个状态，而双向仅需 $2 \times 10^3 = 2,000$ 个状态，<b>性能提升 500 倍</b>！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 左程云小集合优先贪心法则</div>
      <div style="font-size: 12px; color: #15803d;">
        在每轮迭代中，<b>永远选择当前节点数较少的一侧集合（<code>smallLevel</code>）进行扩散</b>，如果对向集合（<code>bigLevel</code>）更小则立即交换角色。这保证了波前始终从阻力最小、分支最少的一端推进！
      </div>
    </div>
  </div>
`;
