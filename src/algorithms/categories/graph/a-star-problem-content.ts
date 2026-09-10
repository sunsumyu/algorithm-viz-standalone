/**
 * A* 启发式搜索算法 (A* Search Algorithm)
 * 领域知识与题解精讲配置声明
 */

export const A_STAR_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">Heuristic Search</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">A* 启发式寻路算法 (A* Search Algorithm)</h2>
    </div>
    <p style="margin: 0;">在网格地图或拓扑图中寻找从起点 <code style="color: #38bdf8; font-family: monospace;">Start</code> 到终点 <code style="color: #fbbf24; font-family: monospace;">Goal</code> 的最优路径。结合 Dijkstra 的 <strong>实际代价 g(n)</strong> 与贪心最佳优先搜索的 <strong>预估启发代价 h(n)</strong>，大幅减少无效搜索空间。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">评估函数:</div>
      <div><strong style="color: #38bdf8;">f(n) = g(n) + h(n)</strong></div>
      <div>• <code style="color: #60a5fa;">g(n)</code>：从起点到当前节点 n 的实际代价；</div>
      <div>• <code style="color: #fbbf24;">h(n)</code>：当前节点 n 到目标节点的启发式预估距离（如曼哈顿距离或欧氏距离）。</div>
    </div>
  </div>
`;

export const A_STAR_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> Open / Closed 集合与启发式引导
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① A* 状态流转</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>Open Set：</strong> 待考察节点优先队列（小顶堆按 <code style="color: #38bdf8; font-family: monospace;">f(n)</code> 排序）；<br/>
        2. <strong>Closed Set：</strong> 已考察完成的最优节点集合；<br/>
        3. <strong>每次弹出：</strong> 选取 Open Set 中 <code style="color: #38bdf8; font-family: monospace;">f(n)</code> 最小者移入 Closed Set；<br/>
        4. <strong>启发可容许性（Admissibility）：</strong> 只要 <code style="color: #34d399; font-family: monospace;">h(n) <= 实际剩余最短距离</code>，A* 算法必然能求得全局最优解。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度分析</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：取决于启发函数的精确度。最坏 <code style="color: #f87171; font-family: monospace;">O(b^d)</code>，优良启发下接近线性。<br/>
        • 空间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(V)</code>（Open / Closed 列表）。
        </p>
      </div>
    </div>
  </div>
`;

export const A_STAR_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public List<int[]> aStar(int[][] grid, int[] start, int[] goal) {',
    '        PriorityQueue<Node> openSet = new PriorityQueue<>((a, b) -> Double.compare(a.f, b.f));',
    '        openSet.offer(new Node(start[0], start[1], 0, heuristic(start, goal), null));',
    '        boolean[][] closedSet = new boolean[grid.length][grid[0].length];',
    '        while (!openSet.isEmpty()) {',
    '            Node cur = openSet.poll();',
    '            if (cur.r == goal[0] && cur.c == goal[1]) return reconstructPath(cur);',
    '            closedSet[cur.r][cur.c] = true;',
    '            for (int[] d : dirs) {',
    '                int nr = cur.r + d[0], nc = cur.c + d[1];',
    '                if (isValid(grid, nr, nc) && !closedSet[nr][nc]) {',
    '                    double g = cur.g + 1;',
    '                    double h = heuristic(new int[]{nr, nc}, goal);',
    '                    openSet.offer(new Node(nr, nc, g, h, cur));',
    '                }',
    '            }',
    '        }',
    '        return Collections.emptyList();',
    '    }',
    '}',
  ],
  cpp: [
    'vector<pair<int, int>> aStar(vector<vector<int>>& grid, pair<int,int> start, pair<int,int> goal) {',
    '    priority_queue<Node, vector<Node>, greater<Node>> openSet;',
    '    openSet.push({start.first, start.second, 0, heuristic(start, goal), nullptr});',
    '    vector<vector<bool>> closedSet(grid.size(), vector<bool>(grid[0].size(), false));',
    '    while (!openSet.empty()) {',
    '        Node cur = openSet.top(); openSet.pop();',
    '        if (cur.r == goal.first && cur.c == goal.second) return reconstructPath(cur);',
    '        closedSet[cur.r][cur.c] = true;',
    '        for (auto& d : dirs) {',
    '            int nr = cur.r + d[0], nc = cur.c + d[1];',
    '            if (isValid(grid, nr, nc) && !closedSet[nr][nc]) {',
    '                openSet.push({nr, nc, cur.g + 1, heuristic({nr, nc}, goal), &cur});',
    '            }',
    '        }',
    '    }',
    '    return {};',
    '}',
  ],
  python: [
    'def a_star(grid: list[list[int]], start: tuple[int, int], goal: tuple[int, int]):',
    '    open_set = [(0 + heuristic(start, goal), 0, start, [start])]',
    '    closed_set = set()',
    '    while open_set:',
    '        f, g, (r, c), path = heapq.heappop(open_set)',
    '        if (r, c) == goal: return path',
    '        if (r, c) in closed_set: continue',
    '        closed_set.add((r, c))',
    '        for dr, dc in [(0,1),(1,0),(0,-1),(-1,0)]:',
    '            nr, nc = r + dr, c + dc',
    '            if is_valid(grid, nr, nc) and (nr, nc) not in closed_set:',
    '                heapq.heappush(open_set, (g + 1 + heuristic((nr, nc), goal), g + 1, (nr, nc), path + [(nr, nc)]))',
    '    return []',
  ],
  javascript: [
    'function aStar(grid, start, goal) {',
    '    const openSet = [{ r: start[0], c: start[1], g: 0, h: heuristic(start, goal), f: heuristic(start, goal), path: [start] }];',
    '    const closedSet = new Set();',
    '    while (openSet.length > 0) {',
    '        openSet.sort((a, b) => a.f - b.f);',
    '        const cur = openSet.shift();',
    '        if (cur.r === goal[0] && cur.c === goal[1]) return cur.path;',
    '        closedSet.add(`${cur.r},${cur.c}`);',
    '        for (const [dr, dc] of [[0,1],[1,0],[0,-1],[-1,0]]) {',
    '            const nr = cur.r + dr, nc = cur.c + dc;',
    '            if (isValid(grid, nr, nc) && !closedSet.has(`${nr},${nc}`)) {',
    '                const g = cur.g + 1, h = heuristic([nr, nc], goal);',
    '                openSet.push({ r: nr, c: nc, g, h, f: g + h, path: [...cur.path, [nr, nc]] });',
    '            }',
    '        }',
    '    }',
    '    return [];',
    '}',
  ],
};
