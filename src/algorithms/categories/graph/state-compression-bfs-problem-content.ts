/**
 * 状压最短路与访问所有节点的最短路径 (Shortest Path Visiting All Nodes)
 * 参考左程云《算法通关课》class064: 状态空间扩维 (u, mask)、多源并发广搜与位掩码位运算剪枝 (LeetCode 847)
 */

export const STATE_COMPRESSION_BFS_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <queue>',
    'using namespace std;',
    '',
    '// 访问所有节点的最短路径 (LeetCode 847 / 左程云 class064)',
    '// 核心：状压 BFS (u, mask) + 多源起点并发入队',
    'int shortestPathLength(const vector<vector<int>>& graph) {',
    '    int n = graph.size();',
    '    int targetMask = (1 << n) - 1;',
    '    ',
    '    // visited[u][mask] 记录状态是否已探索',
    '    vector<vector<bool>> visited(n, vector<bool>(1 << n, false));',
    '    queue<tuple<int, int, int>> q; // {node, mask, dist}',
    '    ',
    '    // 1. 多源并发：所有节点均可作为起始点入队',
    '    for (int i = 0; i < n; ++i) {',
    '        q.push({i, 1 << i, 0});',
    '        visited[i][1 << i] = true;',
    '    }',
    '    ',
    '    // 2. 广度优先搜索展开',
    '    while (!q.empty()) {',
    '        auto [u, mask, dist] = q.front(); q.pop();',
    '        ',
    '        if (mask == targetMask) return dist; // 首次点亮全部节点即为最短路径',
    '        ',
    '        for (int v : graph[u]) {',
    '            int nextMask = mask | (1 << v);',
    '            if (!visited[v][nextMask]) {',
    '                visited[v][nextMask] = true;',
    '                q.push({v, nextMask, dist + 1});',
    '            }',
    '        }',
    '    }',
    '    return 0;',
    '}',
  ],
  java: [
    'package class064;',
    '',
    'import java.util.*;',
    '',
    '// 状压最短路 - 左程云标准多源并发 BFS 实现',
    'public class Code04_VisitedStateShortestPath {',
    '    public static int shortestPathLength(int[][] graph) {',
    '        int n = graph.length;',
    '        int target = (1 << n) - 1;',
    '        boolean[][] visited = new boolean[n][1 << n];',
    '        Queue<int[]> queue = new LinkedList<>(); // [u, mask, dist]',
    '        ',
    '        for (int i = 0; i < n; i++) {',
    '            queue.offer(new int[] { i, 1 << i, 0 });',
    '            visited[i][1 << i] = true;',
    '        }',
    '        ',
    '        while (!queue.isEmpty()) {',
    '            int[] cur = queue.poll();',
    '            int u = cur[0], mask = cur[1], dist = cur[2];',
    '            ',
    '            if (mask == target) return dist;',
    '            ',
    '            for (int v : graph[u]) {',
    '                int nextMask = mask | (1 << v);',
    '                if (!visited[v][nextMask]) {',
    '                    visited[v][nextMask] = true;',
    '                    queue.offer(new int[] { v, nextMask, dist + 1 });',
    '                }',
    '            }',
    '        }',
    '        return 0;',
    '    }',
    '}',
  ],
  python: [
    'from collections import deque',
    '',
    'def shortest_path_visiting_all_nodes(graph: list[list[int]]) -> int:',
    '    n = len(graph)',
    '    target_mask = (1 << n) - 1',
    '    visited = set()',
    '    q = deque()',
    '    ',
    '    for i in range(n):',
    '        q.append((i, 1 << i, 0))',
    '        visited.add((i, 1 << i))',
    '        ',
    '    while q:',
    '        u, mask, dist = q.popleft()',
    '        if mask == target_mask:',
    '            return dist',
    '            ',
    '        for v in graph[u]:',
    '            next_mask = mask | (1 << v)',
    '            if (v, next_mask) not in visited:',
    '                visited.add((v, next_mask))',
    '                q.append((v, next_mask, dist + 1))',
    '                ',
    '    return 0',
  ],
  javascript: [
    '// 状压最短路 (JavaScript 版)',
    'function shortestPathLength(graph) {',
    '  const n = graph.length;',
    '  const target = (1 << n) - 1;',
    '  const visited = Array.from({ length: n }, () => Array(1 << n).fill(false));',
    '  const q = [];',
    '  ',
    '  for (let i = 0; i < n; i++) {',
    '    q.push([i, 1 << i, 0]);',
    '    visited[i][1 << i] = true;',
    '  }',
    '  ',
    '  while (q.length > 0) {',
    '    const [u, mask, dist] = q.shift();',
    '    if (mask === target) return dist;',
    '    ',
    '    for (const v of graph[u]) {',
    '      const nextMask = mask | (1 << v);',
    '      if (!visited[v][nextMask]) {',
    '        visited[v][nextMask] = true;',
    '        q.push([v, nextMask, dist + 1]);',
    '      }',
    '    }',
    '  }',
    '  return 0;',
    '}',
  ],
};

export const STATE_COMPRESSION_BFS_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🧭 访问所有节点的最短路径 (LeetCode 847)</h3>
    <p>
      给定一个包含 <code>n</code> 个节点的无向连通图。返回能够<b>访问所有节点的最短路径的长度</b>。
    </p>
    <p>
      你可以从任意节点开始和停止，节点和边都可以<b>重复经过多次</b>。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">🎯 状态空间扩维 (u, mask)</div>
      <div style="font-size: 11.5px; color: #334155;">
        因为允许折返，普通基于节点的 BFS 会无限死循环。<br/>
        我们利用一个整数 <code>mask</code>（第 $i$ 位为 1 表示节点 $i$ 已被访问）来精准刻画“已访问集合”。<br/>
        状态为 <code>(当前所在节点 u, 当前已访问掩码 mask)</code>，总状态数仅为 $n \cdot 2^n$！
      </div>
    </div>
  </div>
`;

export const STATE_COMPRESSION_BFS_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 左程云多源并发与状压广搜原理解析</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 多源起点并发入队</div>
      <div style="font-size: 12px; color: #1e40af;">
        因为最优解可以从图中的任何一个节点出发，若逐个枚举起点会导致重复计算。<br/>
        在初始化时，直接将所有 <code>(i, 1 << i, 0)</code> 同时放入 BFS 队列中，相当于从所有可能起点同时发射波前！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 最优解定理</div>
      <div style="font-size: 12px; color: #15803d;">
        BFS 的步数是严格非递减递增的。当队列中<b>首次</b>弹出一个 <code>mask == (1 << n) - 1</code> 的状态时，对应的 <code>dist</code> 必然就是全局最短距离！
      </div>
    </div>
  </div>
`;
