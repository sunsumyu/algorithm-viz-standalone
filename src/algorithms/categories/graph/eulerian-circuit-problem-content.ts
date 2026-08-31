/**
 * 欧拉路径与欧拉回路 Hierholzer 算法 (Eulerian Path & Circuit)
 * 参考左程云《算法通关课》class067: 一笔画判定、度数平衡、当前弧优化与后序压栈 (洛谷 P7771 / LeetCode 332)
 */

export const EULERIAN_CIRCUIT_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 欧拉路径与 Hierholzer 算法 (洛谷 P7771 / LeetCode 332)',
    '// 核心：当前弧优化 (head[u]) + DFS 深入 + 后序压栈逆序',
    'void hierholzer(int u, vector<vector<int>>& graph, vector<int>& head, vector<int>& path) {',
    '    while (head[u] < graph[u].size()) {',
    '        int v = graph[u][head[u]++]; // 当前弧优化：直接跳过已走的边',
    '        hierholzer(v, graph, head, path);',
    '    }',
    '    path.push_back(u); // 后序压入节点',
    '}',
    '',
    'vector<int> getEulerianPath(int n, vector<vector<int>>& graph, int startNode) {',
    '    // 对每条邻接表排序以保证字典序最小',
    '    for (int i = 0; i < n; ++i) sort(graph[i].begin(), graph[i].end());',
    '    ',
    '    vector<int> head(n, 0);',
    '    vector<int> path;',
    '    hierholzer(startNode, graph, head, path);',
    '    reverse(path.begin(), path.end()); // 逆序得到正向欧拉路径',
    '    return path;',
    '}',
  ],
  java: [
    'package class067;',
    '',
    'import java.util.*;',
    '',
    '// 欧拉路径与回路 - 左程云标准 Hierholzer 当前弧优化实现',
    'public class Code01_EulerianCircuit {',
    '    public static void dfs(int u, List<Integer>[] graph, int[] head, List<Integer> path) {',
    '        while (head[u] < graph[u].size()) {',
    '            int v = graph[u].get(head[u]++);',
    '            dfs(v, graph, head, path);',
    '        }',
    '        path.add(u);',
    '    }',
    '    ',
    '    public static List<Integer> findEulerianPath(int n, List<Integer>[] graph, int start) {',
    '        for (int i = 0; i < n; i++) Collections.sort(graph[i]);',
    '        int[] head = new int[n];',
    '        List<Integer> path = new ArrayList<>();',
    '        dfs(start, graph, head, path);',
    '        Collections.reverse(path);',
    '        return path;',
    '    }',
    '}',
  ],
  python: [
    'def find_eulerian_path(n: int, graph: list[list[int]], start_node: int) -> list[int]:',
    '    for u in range(n):',
    '        graph[u].sort()',
    '        ',
    '    head = [0] * n',
    '    path = []',
    '    ',
    '    def dfs(u: int):',
    '        while head[u] < len(graph[u]):',
    '            v = graph[u][head[u]]',
    '            head[u] += 1',
    '            dfs(v)',
    '        path.append(u)',
    '        ',
    '    dfs(start_node)',
    '    return path[::-1]',
  ],
  javascript: [
    '// 欧拉回路与路径 Hierholzer 算法 (JavaScript 版)',
    'function findEulerianPath(n, graph, startNode) {',
    '  for (let i = 0; i < n; i++) graph[i].sort((a, b) => a - b);',
    '  const head = Array(n).fill(0);',
    '  const path = [];',
    '  ',
    '  function dfs(u) {',
    '    while (head[u] < graph[u].length) {',
    '      const v = graph[u][head[u]++];',
    '      dfs(v);',
    '    }',
    '    path.push(u);',
    '  }',
    '  ',
    '  dfs(startNode);',
    '  return path.reverse();',
    '}',
  ],
};

export const EULERIAN_CIRCUIT_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🎨 欧拉回路与一笔画 (Eulerian Circuit & Path)</h3>
    <p>
      给定一个连通图，请找到一条<b>恰好经过每一条边一次</b>的路径（一笔画问题）。
    </p>
    <ul>
      <li><b>欧拉回路 (Eulerian Circuit)</b>：起点与终点相同的欧拉路径。</li>
      <li><b>欧拉路径 (Eulerian Path)</b>：起点与终点不同的欧拉路径。</li>
    </ul>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">📐 欧拉图充分必要判定准则</div>
      <div style="font-size: 11.5px; color: #334155;">
        • <b>无向图</b>：连通且<b>奇度数节点数量为 0</b>（存在欧拉回路）或<b>恰好为 2</b>（存在以这两个奇点为端点的欧拉路径）。<br/>
        • <b>有向图</b>：所有节点入度等于出度（回路），或仅有起点 <code>out - in = 1</code> 与终点 <code>in - out = 1</code>，其余 <code>in == out</code>。
      </div>
    </div>
  </div>
`;

export const EULERIAN_CIRCUIT_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 左程云 Hierholzer 算法与当前弧优化解析</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 为什么必须后序入栈并最终逆序？</div>
      <div style="font-size: 12px; color: #1e40af;">
        当 DFS 走到死胡同（无法继续向前扩展）时，该节点必然是路径的终点部分。<br/>
        在回溯时将走投无路的节点依次压入栈中，保证了“分支环路”被完整嵌入主环路中，最终逆序输出即为完美的一笔画路线！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 当前弧优化 (Current Arc Optimization)</div>
      <div style="font-size: 12px; color: #15803d;">
        使用 <code>head[u]</code> 记录节点 $u$ 当前处理到的邻接边下标，每次直接自增跳过已遍历的边，保证每条边仅被访问一次，将复杂度压至极速的 $O(V + E)$！
      </div>
    </div>
  </div>
`;
