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
    '/**',
    ' * 状压最短路 - 左程云标准多源并发 BFS 实现',
    ' * 时间复杂度: O(N * 2^N)，空间复杂度: O(N * 2^N)',
    ' * 核心思想: 状态扩维为 (u, mask)，每个 mask 对应一个独立的状态图层',
    ' */',
    'public class Code04_VisitedStateShortestPath {',
    '    public static int shortestPathLength(int[][] graph) {',
    '        int n = graph.length;',
    '        int target = (1 << n) - 1;',
    '        // visited[u][mask] 记录节点 u 在访问状态 mask 下是否已处理',
    '        boolean[][] visited = new boolean[n][1 << n];',
    '        Queue<int[]> queue = new LinkedList<>(); // [u, mask, dist]',
    '        ',
    '        // 1. 多源并发：所有节点作为单独起点入队',
    '        for (int i = 0; i < n; i++) {',
    '            queue.offer(new int[] { i, 1 << i, 0 });',
    '            visited[i][1 << i] = true;',
    '        }',
    '        ',
    '        // 2. BFS 分层搜索，首次达到目标掩码必定为全局最短路径',
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
    '# 状态压缩 BFS (Python 标准实现)',
    '# 核心原理: 状态扩维 (r, c, key_mask)，使用二进制位记录收集到的钥匙',
    '# 转移规则: 拾取钥匙 key_mask | (1 << k)；遇到门锁必须 (key_mask >> k) & 1 == 1 才能通行',
    'from collections import deque',
    '',
    '# 1. 获取所有钥匙的最短路径 (LeetCode 864)',
    'def shortest_path_all_keys(grid: list[str]) -> int:',
    '    m, n = len(grid), len(grid[0])',
    '    start_r = start_c = total_keys = 0',
    '    for r in range(m):',
    '        for c in range(n):',
    '            ch = grid[r][c]',
    '            if ch == "@": start_r, start_c = r, c',
    '            elif "a" <= ch <= "f": total_keys += 1',
    '            ',
    '    target_mask = (1 << total_keys) - 1',
    '    q = deque([(start_r, start_c, 0, 0)]) # (r, c, mask, dist)',
    '    visited = {(start_r, start_c, 0)}',
    '    dirs = [(-1, 0), (1, 0), (0, -1), (0, 1)]',
    '    ',
    '    while q:',
    '        r, c, mask, dist = q.popleft()',
    '        if mask == target_mask:',
    '            return dist',
    '            ',
    '        for dr, dc in dirs:',
    '            nr, nc = r + dr, c + dc',
    '            if 0 <= nr < m and 0 <= nc < n:',
    '                ch = grid[nr][nc]',
    '                if ch == "#": continue',
    '                # 门禁校验',
    '                if "A" <= ch <= "F" and not (mask & (1 << (ord(ch) - ord("A")))):',
    '                    continue',
    '                # 钥匙拾取',
    '                next_mask = mask',
    '                if "a" <= ch <= "f":',
    '                    next_mask |= (1 << (ord(ch) - ord("a")))',
    '                if (nr, nc, next_mask) not in visited:',
    '                    visited.add((nr, nc, next_mask))',
    '                    q.append((nr, nc, next_mask, dist + 1))',
    '                    ',
    '    return -1',
  ],
  javascript: [
    '/**',
    ' * 状态压缩 BFS (JavaScript 版) - 获取所有钥匙的最短路径 (LeetCode 864)',
    ' * 三维状态空间：(r, c, mask)，位运算判重 visited[r][c][mask]',
    ' */',
    'function shortestPathAllKeys(grid) {',
    '  const m = grid.length, n = grid[0].length;',
    '  let sr = 0, sc = 0, totalKeys = 0;',
    '  for (let r = 0; r < m; r++) {',
    '    for (let c = 0; c < n; c++) {',
    '      const ch = grid[r][c];',
    '      if (ch === "@") { sr = r; sc = c; }',
    '      else if (ch >= "a" && ch <= "f") totalKeys++;',
    '    }',
    '  }',
    '',
    '  const target = (1 << totalKeys) - 1;',
    '  const q = [[sr, sc, 0, 0]]; // [r, c, mask, dist]',
    '  const visited = new Set([`${sr},${sc},0`]);',
    '  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];',
    '',
    '  while (q.length > 0) {',
    '    const [r, c, mask, dist] = q.shift();',
    '    if (mask === target) return dist;',
    '',
    '    for (const [dr, dc] of dirs) {',
    '      const nr = r + dr, nc = c + dc;',
    '      if (nr >= 0 && nr < m && nc >= 0 && nc < n) {',
    '        const ch = grid[nr][nc];',
    '        if (ch === "#") continue;',
    '        // 门锁需对应钥匙',
    '        if (ch >= "A" && ch <= "F") {',
    '          const k = ch.charCodeAt(0) - 65;',
    '          if (!(mask & (1 << k))) continue;',
    '        }',
    '        let nmask = mask;',
    '        if (ch >= "a" && ch <= "f") {',
    '          nmask |= (1 << (ch.charCodeAt(0) - 97));',
    '        }',
    '        const key = `${nr},${nc},${nmask}`;',
    '        if (!visited.has(key)) {',
    '          visited.add(key);',
    '          q.push([nr, nc, nmask, dist + 1]);',
    '        }',
    '      }',
    '    }',
    '  }',
    '  return -1;',
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
