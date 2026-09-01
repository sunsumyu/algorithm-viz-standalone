/**
 * 二分图最大匹配与匈牙利算法 (Hungarian Algorithm for Maximum Bipartite Matching)
 * 参考左程云《算法通关课》增广路理论、DFS 递归让位与匹配边反转
 */

export const HUNGARIAN_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    'using namespace std;',
    '',
    '// 匈牙利算法 (Hungarian Algorithm) - DFS 增广路让位实现',
    'bool dfs(int u, const vector<vector<int>>& graph, vector<int>& match, vector<bool>& visited) {',
    '    for (int v : graph[u]) {',
    '        if (visited[v]) continue;',
    '        visited[v] = true;',
    '        ',
    '        // 若 v 未匹配，或 v 的原配 match[v] 可以让位找到新伴侣',
    '        if (match[v] == -1 || dfs(match[v], graph, match, visited)) {',
    '            match[v] = u; // 建立新的匹配对 (反转增广路)',
    '            return true;',
    '        }',
    '    }',
    '    return false;',
    '}',
    '',
    'int maxBipartiteMatching(int nLeft, int nRight, const vector<vector<int>>& graph) {',
    '    vector<int> match(nRight, -1); // 右部节点的匹配对象',
    '    int maxMatch = 0;',
    '    ',
    '    for (int u = 0; u < nLeft; ++u) {',
    '        vector<bool> visited(nRight, false);',
    '        if (dfs(u, graph, match, visited)) {',
    '            maxMatch++;',
    '        }',
    '    }',
    '    return maxMatch;',
    '}',
  ],
  java: [
    'package class069;',
    '',
    'import java.util.Arrays;',
    'import java.util.List;',
    '',
    '// 二分图最大匹配 - 左程云标准匈牙利增广路算法',
    'public class Code01_HungarianBipartiteMatching {',
    '    public static boolean dfs(int u, List<Integer>[] graph, int[] match, boolean[] visited) {',
    '        for (int v : graph[u]) {',
    '            if (visited[v]) continue;',
    '            visited[v] = true;',
    '            ',
    '            if (match[v] == -1 || dfs(match[v], graph, match, visited)) {',
    '                match[v] = u;',
    '                return true;',
    '            }',
    '        }',
    '        return false;',
    '    }',
    '    ',
    '    public static int maxMatching(int nLeft, int nRight, List<Integer>[] graph) {',
    '        int[] match = new int[nRight];',
    '        Arrays.fill(match, -1);',
    '        int count = 0;',
    '        ',
    '        for (int u = 0; u < nLeft; u++) {',
    '            boolean[] visited = new boolean[nRight];',
    '            if (dfs(u, graph, match, visited)) {',
    '                count++;',
    '            }',
    '        }',
    '        return count;',
    '    }',
    '}',
  ],
  python: [
    'def max_bipartite_matching(n_left: int, n_right: int, graph: list[list[int]]) -> int:',
    '    match = [-1] * n_right',
    '    ',
    '    def dfs(u: int, visited: list[bool]) -> bool:',
    '        for v in graph[u]:',
    '            if visited[v]:',
    '                continue',
    '            visited[v] = True',
    '            ',
    '            # 若未匹配或原配可以腾出空间',
    '            if match[v] == -1 or dfs(match[v], visited):',
    '                match[v] = u',
    '                return True',
    '        return False',
    '        ',
    '    max_match = 0',
    '    for u in range(n_left):',
    '        visited = [False] * n_right',
    '        if dfs(u, visited):',
    '            max_match += 1',
    '            ',
    '    return max_match',
  ],
  javascript: [
    '// 匈牙利算法二分图最大匹配 (JavaScript 版)',
    'function maxBipartiteMatching(nLeft, nRight, graph) {',
    '  const match = Array(nRight).fill(-1);',
    '  ',
    '  function dfs(u, visited) {',
    '    for (const v of graph[u]) {',
    '      if (visited[v]) continue;',
    '      visited[v] = true;',
    '      ',
    '      if (match[v] === -1 || dfs(match[v], visited)) {',
    '        match[v] = u;',
    '        return true;',
    '      }',
    '    }',
    '    return false;',
    '  }',
    '  ',
    '  let count = 0;',
    '  for (let u = 0; u < nLeft; u++) {',
    '    const visited = Array(nRight).fill(false);',
    '    if (dfs(u, visited)) count++;',
    '  }',
    '  return count;',
    '}',
  ],
};

export const HUNGARIAN_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💘 二分图最大匹配与匈牙利算法 (Hungarian Algorithm)</h3>
    <p>
      给定一个二分图，左部包含 <code>nLeft</code> 个节点（如工人/任务），右部包含 <code>nRight</code> 个节点（如机器/资源）。
      每条边表示左部节点与右部节点的意向关联。
    </p>
    <p>
      一个<b>匹配 (Matching)</b> 是边的集合，其中任意两条边都没有公共顶点。请利用 <b>匈牙利算法 (增广路定理)</b> 计算该二分图所能达到的<b>最大匹配数</b>。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">🎯 增广路定理核心 (Augmenting Path)</div>
      <div style="font-size: 11.5px; color: #475569;">
        若能找到一条起点和终点均为未匹配顶点的交替路径（非匹配边 $\to$ 匹配边 $\to \dots \to$ 非匹配边），
        将该路径上的边状态全部取反，即可使<b>匹配边总数严格增加 1</b>！
      </div>
    </div>
  </div>
`;

export const HUNGARIAN_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 左程云匈牙利算法原理解析：协商让位与状态翻转</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. DFS 递归让位的本质</div>
      <div style="font-size: 12px; color: #1e40af;">
        当左部节点 $u$ 想选右部节点 $v$ 时：<br/>
        • 若 $v$ 尚未匹配 $\implies$ 双方皆大欢喜，直接配对！<br/>
        • 若 $v$ 已经与 $match[v]$ 配对 $\implies$ 递归唤醒 $match[v]$，询问其是否能挑选自己的其他备选伴侣。<br/>
        • 若 $match[v]$ 成功协商找到新归宿，则 $v$ 腾出名额与 $u$ 成功牵手！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 复杂度与时间上限</div>
      <div style="font-size: 12px; color: #15803d;">
        左部共 $V_1$ 个节点，每次 DFS 最多遍历全部 $E$ 条边，整体时间复杂度为 $O(V \cdot E)$。空间复杂度仅需 $O(V)$ 记录匹配表与访问数组。
      </div>
    </div>
  </div>
`;

export const HUNGARIAN_MATCHING_CODE_LANGUAGES = HUNGARIAN_CODE_LANGUAGES;
export const HUNGARIAN_MATCHING_PROBLEM_HTML = HUNGARIAN_PROBLEM_HTML;
export const HUNGARIAN_MATCHING_ANALYSIS_HTML = HUNGARIAN_ANALYSIS_HTML;
