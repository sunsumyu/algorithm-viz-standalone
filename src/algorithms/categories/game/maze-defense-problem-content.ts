/**
 * 迷宫塔防·寻路破坏者 (Maze Tower Defense: Shortest Path & Graph Topology)
 * 图论最短路径算法（Dijkstra / BFS / A*）、最小割（Min-Cut）与动态图重规划教学题解
 */

export const MAZE_DEFENSE_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <queue>',
    'using namespace std;',
    '',
    'struct Point { int r, c; };',
    '',
    '// BFS / Dijkstra 在动态迷宫网格中寻找怪兽逃逸最短路径',
    'vector<Point> findShortestEscapePath(int R, int C, Point start, Point exit, const vector<vector<bool>>& isWall) {',
    '    vector<vector<int>> dist(R, vector<int>(C, 1e9));',
    '    vector<vector<Point>> parent(R, vector<Point>(C, {-1, -1}));',
    '    queue<Point> q;',
    '',
    '    dist[start.r][start.c] = 0;',
    '    q.push(start);',
    '',
    '    int dr[4] = {-1, 1, 0, 0};',
    '    int dc[4] = {0, 0, -1, 1};',
    '',
    '    while (!q.empty()) {',
    '        Point cur = q.front(); q.pop();',
    '        if (cur.r == exit.r && cur.c == exit.c) break;',
    '',
    '        for (int i = 0; i < 4; i++) {',
    '            int nr = cur.r + dr[i], nc = cur.c + dc[i];',
    '            if (nr >= 0 && nr < R && nc >= 0 && nc < C && !isWall[nr][nc]) {',
    '                if (dist[nr][nc] > dist[cur.r][cur.c] + 1) {',
    '                    dist[nr][nc] = dist[cur.r][cur.c] + 1;',
    '                    parent[nr][nc] = cur;',
    '                    q.push({nr, nc});',
    '                }',
    '            }',
    '        }',
    '    }',
    '',
    '    // 回溯最短路径',
    '    vector<Point> path;',
    '    if (dist[exit.r][exit.c] == 1e9) return path; // 路径被玩家完全封死',
    '    for (Point at = exit; at.r != -1; at = parent[at.r][at.c]) {',
    '        path.push_back(at);',
    '    }',
    '    reverse(path.begin(), path.end());',
    '    return path;',
    '}',
  ],
  java: [
    'import java.util.*;',
    '',
    'public class MazeShortestPath {',
    '    public static class Node { public int r, c; public Node(int r, int c) { this.r = r; this.c = c; } }',
    '',
    '    // Dijkstra 优先队列加权最短路',
    '    public static List<Node> solveDijkstra(int R, int C, Node start, Node end, int[][] gridWeights) {',
    '        int[][] dist = new int[R][C];',
    '        for (int[] row : dist) Arrays.fill(row, Integer.MAX_VALUE);',
    '        dist[start.r][start.c] = 0;',
    '        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));',
    '        pq.offer(new int[]{0, start.r, start.c});',
    '',
    '        while (!pq.isEmpty()) {',
    '            int[] cur = pq.poll();',
    '            int d = cur[0], r = cur[1], c = cur[2];',
    '            if (d > dist[r][c]) continue;',
    '            if (r == end.r && c == end.c) break;',
    '            // 四向扩展...',
    '        }',
    '        return new ArrayList<>();',
    '    }',
    '}',
  ],
  python: [
    'from collections import deque',
    '',
    'def maze_escape_bfs(grid, start, end):',
    '    """利用广度优先搜索求解迷宫怪兽最短路径"""',
    '    R, C = len(grid), len(grid[0])',
    '    q = deque([start])',
    '    visited = {start: None}',
    '',
    '    while q:',
    '        r, c = q.popleft()',
    '        if (r, c) == end:',
    '            break',
    '        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:',
    '            nr, nc = r + dr, c + dc',
    '            if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] == 0 and (nr, nc) not in visited:',
    '                visited[(nr, nc)] = (r, c)',
    '                q.append((nr, nc))',
    '',
    '    # 重构路径',
    '    path = []',
    '    curr = end',
    '    while curr is not None and curr in visited:',
    '        path.append(curr)',
    '        curr = visited[curr]',
    '    return path[::-1]',
  ],
  javascript: [
    '// 迷宫 A* 启发式寻路',
    'function findMazePathAStar(grid, start, goal) {',
    '  const h = (r, c) => Math.abs(r - goal.r) + Math.abs(c - goal.c);',
    '  const open = [{ ...start, g: 0, f: h(start.r, start.c), path: [start] }];',
    '  const closed = new Set();',
    '',
    '  while (open.length > 0) {',
    '    open.sort((a, b) => a.f - b.f);',
    '    const cur = open.shift();',
    '    if (cur.r === goal.r && cur.c === goal.c) return cur.path;',
    '    // 展开相邻顶点...',
    '  }',
    '  return [];',
    '}',
  ],
};

export const MAZE_DEFENSE_PROBLEM_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
      <span style="font-size: 20px;">🏰</span>
      <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #0f172a;">迷宫塔防·寻路破坏者 (Maze Tower Defense)</h3>
      <span style="background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid #bfdbfe;">图论动态拓扑</span>
    </div>

    <p style="font-size: 12.5px; color: #334155; margin-bottom: 10px;">
      源源不断的虚空怪兽从左侧入口涌入，企图沿<b>最短路径（Dijkstra / BFS）</b>逃逸至右侧出口！玩家手握金币，通过在网格中修建<b>石墙迷宫、箭塔与减速冰塔</b>，实时改变图论拓扑，<b>最大化怪兽的行进路径距离与滞空承伤时间</b>！
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🎮 塔防布阵机制</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>🧱 建造石墙</b>：改变网格连通性，迫使怪兽绕远路走 S 型蛇形迷宫；</li>
          <li><b>🏹 箭塔输出</b>：自动锁定射程内欧氏距离最近的怪兽；</li>
          <li><b>❄️ 冰霜陷阱</b>：降低怪兽 50% 移动速度，延长受击窗口！</li>
        </ul>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🧠 核心算法模型</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>动态图最短路</b>：每次落子实时触发 $O(V+E)$ BFS 重新规划；</li>
          <li><b>完全阻断惩罚 (Min-Cut)</b>：若将路径全部封死，怪兽会狂暴直接砸墙破障；</li>
          <li><b>路径长度最大化</b>：通过最少防御塔成本使得 $\\max \\text{dist}(\\text{Start}, \\text{Exit})$。</li>
        </ul>
      </div>
    </div>
  </div>
`;

export const MAZE_DEFENSE_ANALYSIS_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <h3 style="margin-top: 0; font-size: 14px; font-weight: 800; color: #0f172a;">迷宫拓扑与寻路对抗算法解析</h3>

    <div style="margin-bottom: 10px;">
      <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #2563eb;">1. 动态图拓扑重规划 (Dynamic Graph Re-planning)</h4>
      <p style="font-size: 11.5px; color: #475569; margin: 0;">
        在经典即时战略与迷宫塔防中，玩家每放置一座建筑，相当于在网格邻接图 $G=(V, E)$ 中移除了该顶点及关联边。怪兽根据全局最短路径场（Distance Field / Dijkstra Potential Map）向势能梯度最低的邻居节点推进。
      </p>
    </div>

    <div style="margin-bottom: 10px;">
      <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #10b981;">2. 蛇形导流迷宫 (Mazing Optimization)</h4>
      <p style="font-size: 11.5px; color: #475569; margin: 0;">
        直线距离只有 $C-1$ 步，但通过上下交错设置石墙，可以将怪兽路径长度从 $O(C)$ 扩展至 $O(R \\times C)$，成倍提升防御塔的输出效率！
      </p>
    </div>
  </div>
`;
