/**
 * 火星词典与拓扑排序判环 (Alien Dictionary Topo Sort)
 * 参考左程云《算法通关课》【必备篇】class059: 字符偏序依赖建图、非法前缀陷阱与拓扑排序判环 (LeetCode 269 / 剑指 Offer II 114)
 */

export const ALIEN_DICT_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <string>',
    '#include <queue>',
    '#include <unordered_set>',
    'using namespace std;',
    '',
    '// 火星词典 (LeetCode 269 / 剑指 Offer II 114)',
    '// 1. 相邻单词首个不同字符建边',
    '// 2. 非法前缀拦截 (例如 ["abc", "ab"])',
    '// 3. 拓扑排序判环',
    'string alienOrder(vector<string>& words) {',
    '    vector<int> inDegree(26, -1);',
    '    vector<unordered_set<int>> graph(26);',
    '    ',
    '    for (const string& w : words) {',
    '        for (char ch : w) inDegree[ch - "a"] = 0;',
    '    }',
    '    ',
    '    int kind = 0;',
    '    for (int d : inDegree) if (d != -1) kind++;',
    '    ',
    '    for (int i = 0; i < (int)words.size() - 1; ++i) {',
    '        const string& cur = words[i], &nxt = words[i + 1];',
    '        int len = min(cur.size(), nxt.size());',
    '        int j = 0;',
    '        while (j < len && cur[j] == nxt[j]) j++;',
    '        ',
    '        if (j < len) {',
    '            int u = cur[j] - "a", v = nxt[j] - "a";',
    '            if (!graph[u].count(v)) {',
    '                graph[u].insert(v);',
    '                inDegree[v]++;',
    '            }',
    '        } else if (cur.size() > nxt.size()) {',
    '            return ""; // 非法前缀异常：较长单词排在较短前缀前面',
    '        }',
    '    }',
    '    ',
    '    queue<int> q;',
    '    for (int i = 0; i < 26; ++i) {',
    '        if (inDegree[i] == 0) q.push(i);',
    '    }',
    '    ',
    '    string ans = "";',
    '    while (!q.empty()) {',
    '        int u = q.front();',
    '        q.pop();',
    '        ans += (char)(u + "a");',
    '        ',
    '        for (int v : graph[u]) {',
    '            if (--inDegree[v] == 0) q.push(v);',
    '        }',
    '    }',
    '    ',
    '    return ans.size() == kind ? ans : ""; // 若有环则返回空串',
    '}',
  ],
  java: [
    'package class059;',
    '',
    'import java.util.*;',
    '',
    '// 火星词典 - 左程云标准字符偏序拓扑排序实现',
    'public class Code04_AlienDictionary {',
    '    public static String alienOrder(String[] words) {',
    '        int[] inDegree = new int[26];',
    '        Arrays.fill(inDegree, -1);',
    '        for (String w : words) {',
    '            for (int i = 0; i < w.length(); i++) {',
    '                inDegree[w.charAt(i) - "a"] = 0;',
    '            }',
    '        }',
    '        ',
    '        List<Integer>[] graph = new ArrayList[26];',
    '        for (int i = 0; i < 26; i++) graph[i] = new ArrayList<>();',
    '        ',
    '        int kinds = 0;',
    '        for (int d : inDegree) if (d != -1) kinds++;',
    '        ',
    '        for (int i = 0; i < words.length - 1; i++) {',
    '            String cur = words[i], next = words[i + 1];',
    '            int len = Math.min(cur.length(), next.length());',
    '            int j = 0;',
    '            while (j < len && cur.charAt(j) == next.charAt(j)) j++;',
    '            ',
    '            if (j < len) {',
    '                int u = cur.charAt(j) - "a", v = next.charAt(j) - "a";',
    '                graph[u].add(v);',
    '                inDegree[v]++;',
    '            } else if (cur.length() > next.length()) {',
    '                return ""; // 发生前缀反转错误',
    '            }',
    '        }',
    '        ',
    '        int[] queue = new int[26];',
    '        int l = 0, r = 0;',
    '        for (int i = 0; i < 26; i++) {',
    '            if (inDegree[i] == 0) queue[r++] = i;',
    '        }',
    '        ',
    '        StringBuilder ans = new StringBuilder();',
    '        while (l < r) {',
    '            int u = queue[l++];',
    '            ans.append((char) (u + "a"));',
    '            for (int v : graph[u]) {',
    '                if (--inDegree[v] == 0) queue[r++] = v;',
    '            }',
    '        }',
    '        return ans.length() == kinds ? ans.toString() : "";',
    '    }',
    '}',
  ],
  python: [
    'from collections import deque',
    '',
    'def alien_order(words: list[str]) -> str:',
    '    # 提取所有出现字符',
    '    in_degree = {c: 0 for w in words for c in w}',
    '    graph = {c: set() for c in in_degree}',
    '    ',
    '    # 比较相邻单词建立有向边',
    '    for i in range(len(words) - 1):',
    '        w1, w2 = words[i], words[i + 1]',
    '        min_len = min(len(w1), len(w2))',
    '        j = 0',
    '        while j < min_len and w1[j] == w2[j]:',
    '            j += 1',
    '        ',
    '        if j < min_len:',
    '            u, v = w1[j], w2[j]',
    '            if v not in graph[u]:',
    '                graph[u].add(v)',
    '                in_degree[v] += 1',
    '        elif len(w1) > len(w2):',
    '            return "" # 非法前缀异常',
    '            ',
    '    q = deque([c for c, d in in_degree.items() if d == 0])',
    '    res = []',
    '    ',
    '    while q:',
    '        u = q.popleft()',
    '        res.append(u)',
    '        for v in graph[u]:',
    '            in_degree[v] -= 1',
    '            if in_degree[v] == 0:',
    '                q.append(v)',
    '                ',
    '    return "".join(res) if len(res) == len(in_degree) else ""',
  ],
  javascript: [
    '// 火星词典拓扑排序 (JavaScript 版)',
    'function alienOrder(words) {',
    '  const inDegree = new Map();',
    '  const graph = new Map();',
    '  for (const w of words) {',
    '    for (const ch of w) {',
    '      if (!inDegree.has(ch)) inDegree.set(ch, 0);',
    '      if (!graph.has(ch)) graph.set(ch, new Set());',
    '    }',
    '  }',
    '',
    '  for (let i = 0; i < words.length - 1; i++) {',
    '    const w1 = words[i], w2 = words[i + 1];',
    '    const minLen = Math.min(w1.length, w2.length);',
    '    let j = 0;',
    '    while (j < minLen && w1[j] === w2[j]) j++;',
    '',
    '    if (j < minLen) {',
    '      const u = w1[j], v = w2[j];',
    '      if (!graph.get(u).has(v)) {',
    '        graph.get(u).add(v);',
    '        inDegree.set(v, inDegree.get(v) + 1);',
    '      }',
    '    } else if (w1.length > w2.length) {',
    '      return ""; // 非法前缀错误',
    '    }',
    '  }',
    '',
    '  const q = [];',
    '  for (const [ch, deg] of inDegree.entries()) {',
    '    if (deg === 0) q.push(ch);',
    '  }',
    '',
    '  const res = [];',
    '  while (q.length > 0) {',
    '    const u = q.shift();',
    '    res.push(u);',
    '    for (const v of graph.get(u)) {',
    '      inDegree.set(v, inDegree.get(v) - 1);',
    '      if (inDegree.get(v) === 0) q.push(v);',
    '    }',
    '  }',
    '',
    '  return res.length === inDegree.size ? res.join("") : "";',
    '}',
  ],
};

export const ALIEN_DICT_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">👽 火星词典 (LeetCode 269 / 剑指 Offer II 114)</h3>
    <p>
      现有一种使用英语小写字母的火星语言，其字母间的先后顺序是未知的。
      给你一个按该外星语言字典序排列的字符串列表 <code>words</code>。
    </p>
    <p>
      请推断并返回该外星语言的<b>字母字典序顺序</b>。如果偏序关系存在矛盾（存在有向环）或违反基本字典序规则（非法前缀），则返回空字符串 <code>""</code>。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">📥 输入示例</div>
      <div style="font-family: monospace; font-size: 12px; color: #0f172a;">
        words = ["wrt", "wrf", "er", "ett", "rftt"]
      </div>
      <div style="font-weight: 700; color: #15803d; margin-top: 6px;">📤 输出示例: <code>"wertf"</code></div>
      <div style="font-size: 11px; color: #64748b;">
        解释：
        <br/>• "wrt" 与 "wrf" 比较 $\\implies t \\to f$
        <br/>• "wrt" 与 "er" 比较 $\\implies w \\to e$
        <br/>• "er" 与 "ett" 比较 $\\implies r \\to t$
        <br/>• "ett" 与 "rftt" 比较 $\\implies e \\to r$
        <br/>拓扑排序结果为: $w \\to e \\to r \\to t \\to f$，即 <code>"wertf"</code>！
      </div>
    </div>
  </div>
`;

export const ALIEN_DICT_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 左程云火星词典建图与判环要点</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 提取偏序：为什么只比对相邻单词的首个不同字符？</div>
      <div style="font-size: 12px; color: #1e40af;">
        字典序中，决定两个单词先后排位的<b>仅是第一个不相等的字符</b>（例如 "abc" 与 "abz" 的比较仅能确定 $c < z$，无法得知后面的关系）。
        因此遍历相邻单词对 $(w_i, w_{i+1})$，找到首个不匹配字符即建立一条有向边 $w_i[k] \to w_{i+1}[k]$。
      </div>
    </div>

    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #991b1b; margin-bottom: 4px;">2. 两大致命异常拦截</div>
      <div style="font-size: 12px; color: #b91c1c;">
        • <b>非法前缀陷阱</b>：若 $w_i$ 为 "abc" 且 $w_{i+1}$ 为 "ab"，较短的前缀必须排在较长单词前面，当前排列直接违规，必须立即返回 <code>""</code>！<br/>
        • <b>拓扑环（自相矛盾）</b>：若出现 $a \to b \to a$，拓扑排序出队节点数必定小于字符总种类数 $kind$，直接判定有环并返回 <code>""</code>。
      </div>
    </div>
  </div>
`;
