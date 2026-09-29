/**
 * Jump Point Search (跳点搜索) 名师讲义与多语言代码面板
 */

export const JUMP_POINT_SEARCH_PROBLEM_HTML = `
<div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1e293b;">
  <h3 style="margin-top: 0; color: #0f172a; font-size: 16px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
    <span>⚡</span> Jump Point Search (JPS 跳点搜索) 网格极速寻路
  </h3>
  <p style="font-size: 13px; color: #475569; margin: 6px 0 12px 0;">
    在均匀无权/等权网格地图（Uniform-cost Grid）中，经典 <strong>A* 算法</strong> 虽然具备启发式导向，但在开阔区域或大面积平原上，
    由于存在海量耗费相同的<strong>等价对称折线路径（Symmetric Paths）</strong>，会导致 Open 优先队列急剧膨胀，遍历大量毫无区分度的中间格子（即著名的“泛洪现象”）。
  </p>

  <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 12px; margin-bottom: 12px; border-radius: 0 8px 8px 0;">
    <div style="font-size: 13px; font-weight: 700; color: #1e40af; margin-bottom: 4px;">🚀 核心突破：什么是跳点（Jump Point）？</div>
    <div style="font-size: 12px; color: #334155; line-height: 1.5;">
      JPS 通过预设的对称性剪枝规则，在直行或对角线方向上以<strong>光束射线（Jump Ray）</strong>极速向前滑行，沿途完全不将中间节点压入 Open 堆！
      只有遇到<strong>终点</strong>或因障碍物拐角而必须借道转向的<strong>强迫邻居（Forced Neighbors）</strong>时，当前点才会作为<strong>跳点（Jump Point）</strong>被固化入堆。
    </div>
  </div>

  <h4 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 12px 0 6px 0;">📐 核心推导三步走</h4>
  <ol style="font-size: 12px; color: #475569; padding-left: 18px; margin: 0 0 12px 0; line-height: 1.8;">
    <li><strong>自然邻居（Natural Neighbors）</strong>：在无障碍空旷地带，从父节点向当前点前进，只有正前方（及对角线分量）是必须考察的自然方向，其余侧向或回头方向均存在更优或等价路径，直接剪除！</li>
    <li><strong>强迫邻居（Forced Neighbors）</strong>：当侧后方存在障碍物时，原本可以绕过当前点的对称路径被阻断，使得某个相邻格子<strong>必须经由当前节点中转</strong>才能以最短代价到达。该相邻格子即为强迫邻居。</li>
    <li><strong>对角线跳跃复合规则</strong>：对角线移动时，不仅自身检测强迫邻居，还要<strong>递归向水平和垂直分量发射直线跳跃探测</strong>。若正交探测发现了跳点，当前对角节点也必须立即晋升为跳点！</li>
  </ol>
</div>
`;

export const JUMP_POINT_SEARCH_ANALYSIS_HTML = `
<div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1e293b;">
  <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">📊 复杂度与算法性能降维分析</h3>
  
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 10px 0;">
    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 8px 10px;">
      <div style="font-size: 11px; font-weight: 700; color: #1d4ed8;">传统 8-向 A* 搜索</div>
      <div style="font-size: 12px; color: #1e3a8a; margin-top: 4px;">
        • 扩展节点：O(b<sup>d</sup>)，网格大面积泛洪<br/>
        • 优先队列：频繁插入/弹出，堆操作沉重<br/>
        • 内存消耗：高（记录所有格子的 g/f 值）
      </div>
    </div>
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 8px 10px;">
      <div style="font-size: 11px; font-weight: 700; color: #15803d;">Jump Point Search (JPS)</div>
      <div style="font-size: 12px; color: #14532d; margin-top: 4px;">
        • 扩展节点：通常仅占 A* 的 5% ~ 20%<br/>
        • 优先队列：极小（堆内仅存放关键跳点）<br/>
        • 路径保真：100% 严格保证欧几里得/八角最优解
      </div>
    </div>
  </div>

  <div style="font-size: 12px; color: #475569; margin-top: 8px;">
    <strong>💡 适用场景</strong>：JPS 是游戏开发（RTS 即时战略、RPG 开放世界）、机器人栅格地图导航与大型物流仓储中最经典的工业级加速范式之一。
  </div>
</div>
`;

export const JUMP_POINT_SEARCH_CODE_LANGUAGES: Record<string, string> = {
  javascript: `// JavaScript 严格 JPS 核心实现
function jpsSearch(grid, start, goal) {
  const openSet = new MinPriorityQueue({ priority: n => n.f });
  openSet.enqueue({ x: start[0], y: start[1], g: 0, f: h(start, goal), px: -1, py: -1 });
  const visited = new Map();

  while (!openSet.isEmpty()) {
    const cur = openSet.dequeue().element;
    if (cur.x === goal[0] && cur.y === goal[1]) return reconstructPath(cur);
    const successors = identifySuccessors(grid, cur, goal);
    for (const s of successors) {
      const g = cur.g + dist(cur, s);
      const key = \`\${s.x},\${s.y}\`;
      if (!visited.has(key) || g < visited.get(key)) {
        visited.set(key, g);
        openSet.enqueue({ x: s.x, y: s.y, g, f: g + h([s.x, s.y], goal), parent: cur });
      }
    }
  }
  return null;
}

function jump(grid, x, y, dx, dy, goal) {
  const nx = x + dx, ny = y + dy;
  if (!isWalkable(grid, nx, ny)) return null;
  if (nx === goal[0] && ny === goal[1]) return [nx, ny];
  if (hasForcedNeighbor(grid, nx, ny, dx, dy)) return [nx, ny];
  if (dx !== 0 && dy !== 0) {
    if (jump(grid, nx, ny, dx, 0, goal) !== null) return [nx, ny];
    if (jump(grid, nx, ny, 0, dy, goal) !== null) return [nx, ny];
  }
  return jump(grid, nx, ny, dx, dy, goal);
}`,

  python: `# Python 严格 JPS 核心实现
import heapq

def jps_search(grid, start, goal):
    open_set = [(h(start, goal), 0, start[0], start[1], -1, -1, None)]
    visited = {}

    while open_set:
        f, g, x, y, px, py, parent = heapq.heappop(open_set)
        if (x, y) == goal:
            return reconstruct_path(x, y, parent)
        successors = identify_successors(grid, x, y, px, py, goal)
        for sx, sy in successors:
            ng = g + dist((x, y), (sx, sy))
            if (sx, sy) not in visited or ng < visited[(sx, sy)]:
                visited[(sx, sy)] = ng
                heapq.heappush(open_set, (ng + h((sx, sy), goal), ng, sx, sy, x, y, (x, y, parent)))
    return None

def jump(grid, x, y, dx, dy, goal):
    nx, ny = x + dx, y + dy
    if not is_walkable(grid, nx, ny):
        return None
    if (nx, ny) == goal:
        return (nx, ny)
    if has_forced_neighbor(grid, nx, ny, dx, dy):
        return (nx, ny)
    if dx != 0 and dy != 0:
        if jump(grid, nx, ny, dx, 0, goal) is not None:
            return (nx, ny)
        if jump(grid, nx, ny, 0, dy, goal) is not None:
            return (nx, ny)
    return jump(grid, nx, ny, dx, dy, goal)`,

  java: `// Java 严格 JPS 核心实现
public class JumpPointSearch {
    public List<int[]> jpsSearch(int[][] grid, int[] start, int[] goal) {
        PriorityQueue<Node> open = new PriorityQueue<>(Comparator.comparingDouble(n -> n.f));
        open.offer(new Node(start[0], start[1], 0, h(start, goal), null));
        Map<String, Double> visited = new HashMap<>();

        while (!open.isEmpty()) {
            Node cur = open.poll();
            if (cur.x == goal[0] && cur.y == goal[1]) return reconstructPath(cur);
            List<int[]> successors = identifySuccessors(grid, cur, goal);
            for (int[] s : successors) {
                double g = cur.g + dist(cur.x, cur.y, s[0], s[1]);
                String key = s[0] + "," + s[1];
                if (!visited.containsKey(key) || g < visited.get(key)) {
                    visited.put(key, g);
                    open.offer(new Node(s[0], s[1], g, g + h(s, goal), cur));
                }
            }
        }
        return Collections.emptyList();
    }

    private int[] jump(int[][] grid, int x, int y, int dx, int dy, int[] goal) {
        int nx = x + dx, ny = y + dy;
        if (!isWalkable(grid, nx, ny)) return null;
        if (nx == goal[0] && ny == goal[1]) return new int[]{nx, ny};
        if (hasForcedNeighbor(grid, nx, ny, dx, dy)) return new int[]{nx, ny};
        if (dx != 0 && dy != 0) {
            if (jump(grid, nx, ny, dx, 0, goal) != null) return new int[]{nx, ny};
            if (jump(grid, nx, ny, 0, dy, goal) != null) return new int[]{nx, ny};
        }
        return jump(grid, nx, ny, dx, dy, goal);
    }
}`,

  cpp: `// C++ 严格 JPS 核心实现
#include <vector>
#include <queue>
#include <unordered_map>

std::vector<Point> jpsSearch(const Grid& grid, Point start, Point goal) {
    std::priority_queue<Node, std::vector<Node>, std::greater<Node>> open;
    open.push({start.x, start.y, 0.0, h(start, goal), nullptr});
    std::unordered_map<int, double> visited;

    while (!open.empty()) {
        Node cur = open.top(); open.pop();
        if (cur.x == goal.x && cur.y == goal.y) return reconstructPath(&cur);
        auto successors = identifySuccessors(grid, cur, goal);
        for (const auto& s : successors) {
            double g = cur.g + dist(cur.x, cur.y, s.x, s.y);
            int key = s.x * 10000 + s.y;
            if (!visited.count(key) || g < visited[key]) {
                visited[key] = g;
                open.push({s.x, s.y, g, g + h(s, goal), new Node(cur)});
            }
        }
    }
    return {};
}

Point* jump(const Grid& grid, int x, int y, int dx, int dy, Point goal) {
    int nx = x + dx, ny = y + dy;
    if (!isWalkable(grid, nx, ny)) return nullptr;
    if (nx == goal.x && ny == goal.y) return new Point{nx, ny};
    if (hasForcedNeighbor(grid, nx, ny, dx, dy)) return new Point{nx, ny};
    if (dx != 0 && dy != 0) {
        if (jump(grid, nx, ny, dx, 0, goal) != nullptr) return new Point{nx, ny};
        if (jump(grid, nx, ny, 0, dy, goal) != nullptr) return new Point{nx, ny};
    }
    return jump(grid, nx, ny, dx, dy, goal);
}`,
};

export const JPS_CODE_LINES: Record<string, Record<string, number | number[]>> = {
  init: {
    javascript: [3, 4, 5],
    python: [5, 6],
    java: [4, 5, 6],
    cpp: [7, 8, 9],
  },
  poll: {
    javascript: 8,
    python: 9,
    java: 9,
    cpp: 12,
  },
  reachGoal: {
    javascript: 9,
    python: [10, 11],
    java: 10,
    cpp: 13,
  },
  expandSuccessors: {
    javascript: [10, 11],
    python: [12, 13],
    java: [11, 12],
    cpp: [14, 15],
  },
  pushOpen: {
    javascript: [15, 16, 17],
    python: [16, 17],
    java: [16, 17],
    cpp: [19, 20],
  },
  jumpRayStart: {
    javascript: [24, 25],
    python: [21, 22, 23],
    java: [25, 26],
    cpp: [28, 29],
  },
  checkGoal: {
    javascript: 26,
    python: [24, 25],
    java: 27,
    cpp: 30,
  },
  checkForced: {
    javascript: 27,
    python: [26, 27],
    java: 28,
    cpp: 31,
  },
  diagonalSubJump: {
    javascript: [28, 29, 30],
    python: [28, 29, 30, 31, 32],
    java: [29, 30, 31],
    cpp: [32, 33, 34],
  },
  jumpRecurse: {
    javascript: 32,
    python: 33,
    java: 33,
    cpp: 36,
  },
};
