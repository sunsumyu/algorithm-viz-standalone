/**
 * Jump Point Search (跳点搜索) 名师讲义与多阶段 4-语言代码面板
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

  <div style="background: #faf5ff; border: 1px solid #d8b4fe; padding: 12px; margin-bottom: 12px; border-radius: 10px;">
    <div style="font-size: 13px; font-weight: 700; color: #7e22ce; margin-bottom: 6px; display: flex; items-center; gap: 6px;">
      <span>💡</span> 深度拆解：究竟什么是“强迫邻居”？为什么它能决定跳点的生死？
    </div>
    <div style="font-size: 12px; color: #4b5563; line-height: 1.6;">
      <p style="margin: 0 0 6px 0;"><strong>通俗大白话：【拐角后的死角被卡住了】</strong></p>
      JPS 之所以能狂飙直冲，是因为开阔地带走哪都一样（完全对称）。但一旦路过一堵墙的<strong>转角拐弯处</strong>，墙背后就会出现一片<strong>“原本能斜切走捷径、现在却被墙挡住”</strong>的区域。<br/>
      这个区域里的格子，<strong>必须强行借道当前这个路口（J 点）才能以最短代价走过去</strong>！如果没有 J 点，你就得绕一大圈大弯路。
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; font-size: 11px;">
      <div style="background: #ffffff; padding: 8px; border-radius: 6px; border: 1px solid #e9d5ff;">
        <span style="color: #059669; font-weight: 700;">✅ 途径 J 点的捷径：</span><br/>
        ... → X(3,3) → J(5,3) → 拐角(6,4)<br/>
        <span style="color: #059669;">直接贴着墙角拐进去，步数最省！</span>
      </div>
      <div style="background: #ffffff; padding: 8px; border-radius: 6px; border: 1px solid #fecdd3;">
        <span style="color: #e11d48; font-weight: 700;">❌ 若错过 J 点：</span><br/>
        只能从大墙另一侧绕远路甚至回退<br/>
        <span style="color: #e11d48;">代价高昂，全局最优解被破坏！</span>
      </div>
    </div>
    <div style="font-size: 11px; color: #6b21a8; margin-top: 6px; font-weight: 600;">
      🌟 立交桥分流道口思想：对角线移动时，若正交子射线探测到 J 点，脚下的点 X 必须立即升格为跳点！否则主线车流就会直挺挺撞墙，错过切入支线直达终点的唯一出口！
    </div>
  </div>

  <h4 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 12px 0 6px 0;">📐 核心推导四阶段</h4>
  <ol style="font-size: 12px; color: #475569; padding-left: 18px; margin: 0 0 12px 0; line-height: 1.8;">
    <li><strong>阶段 1: A* 传统泛洪对比</strong>：标准 8-向 A* 搜索，直观暴露对称折线路径造成的节点大面积入堆问题。</li>
    <li><strong>阶段 2: 邻居对称性剪枝</strong>：定义自然邻居（NN）与强迫邻居（FN），几何证明哪些格子可直接跳过，哪些拐角必须中转。</li>
    <li><strong>阶段 3: 递归射线跳跃探测</strong>：对角线侦察原理精解，可视化呈现对角线迈进、正交子雷达与 X 升格跳点的全过程。</li>
    <li><strong>阶段 4: JPS 完整跳点搜索</strong>：整合 Open 堆循环与跳点生成器，以原版 A* 的 5%~20% 节点访问量求出严格最优解。</li>
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

// ==========================================
// 阶段 1: 传统 8-向 A* 搜索多语言代码
// ==========================================
export const STAGE1_ASTAR_CODE: Record<string, string> = {
  javascript: `// JavaScript 阶段 1: 标准 8-向 A* 搜索 (展示等价对称路径泛洪)
function aStarSearch(grid, start, goal) {
  const open = new MinPriorityQueue({ priority: n => n.f });
  open.enqueue({ x: start[0], y: start[1], g: 0, f: h(start, goal), parent: null });
  const visited = new Map();

  while (!open.isEmpty()) {
    const cur = open.dequeue().element;
    if (cur.x === goal[0] && cur.y === goal[1]) return reconstructPath(cur);
    for (const [dx, dy] of DIRS_8) {
      const nx = cur.x + dx, ny = cur.y + dy;
      if (!isWalkable(grid, nx, ny)) continue;
      const stepCost = (dx !== 0 && dy !== 0) ? Math.SQRT2 : 1.0;
      const g = cur.g + stepCost;
      const key = \`\${nx},\${ny}\`;
      if (!visited.has(key) || g < visited.get(key)) {
        visited.set(key, g);
        open.enqueue({ x: nx, y: ny, g, f: g + h([nx, ny], goal), parent: cur });
      }
    }
  }
  return null;
}`,

  python: `# Python 阶段 1: 标准 8-向 A* 搜索 (展示等价对称路径泛洪)
import heapq, math

def a_star_search(grid, start, goal):
    open_set = [(h(start, goal), 0, start[0], start[1], None)]
    visited = {}

    while open_set:
        f, g, x, y, parent = heapq.heappop(open_set)
        if (x, y) == goal:
            return reconstruct_path((x, y, parent))
        for dx, dy in DIRS_8:
            nx, ny = x + dx, y + dy
            if not is_walkable(grid, nx, ny):
                continue
            cost = math.sqrt(2) if dx != 0 and dy != 0 else 1.0
            ng = g + cost
            if (nx, ny) not in visited or ng < visited[(nx, ny)]:
                visited[(nx, ny)] = ng
                heapq.heappush(open_set, (ng + h((nx, ny), goal), ng, nx, ny, (x, y, parent)))
    return None`,

  java: `// Java 阶段 1: 标准 8-向 A* 搜索 (展示等价对称路径泛洪)
public class AStarSearch {
    public List<int[]> aStarSearch(int[][] grid, int[] start, int[] goal) {
        PriorityQueue<Node> open = new PriorityQueue<>(Comparator.comparingDouble(n -> n.f));
        open.offer(new Node(start[0], start[1], 0, h(start, goal), null));
        Map<String, Double> visited = new HashMap<>();

        while (!open.isEmpty()) {
            Node cur = open.poll();
            if (cur.x == goal[0] && cur.y == goal[1]) return reconstructPath(cur);
            for (int[] dir : DIRS_8) {
                int nx = cur.x + dir[0], ny = cur.y + dir[1];
                if (!isWalkable(grid, nx, ny)) continue;
                double stepCost = (dir[0] != 0 && dir[1] != 0) ? Math.SQRT2 : 1.0;
                double g = cur.g + stepCost;
                String key = nx + "," + ny;
                if (!visited.containsKey(key) || g < visited.get(key)) {
                    visited.put(key, g);
                    open.offer(new Node(nx, ny, g, g + h(nx, ny, goal), cur));
                }
            }
        }
        return Collections.emptyList();
    }
}`,

  cpp: `// C++ 阶段 1: 标准 8-向 A* 搜索 (展示等价对称路径泛洪)
std::vector<Point> aStarSearch(const Grid& grid, Point start, Point goal) {
    std::priority_queue<Node, std::vector<Node>, std::greater<Node>> open;
    open.push({start.x, start.y, 0.0, h(start, goal), nullptr});
    std::unordered_map<int, double> visited;

    while (!open.empty()) {
        Node cur = open.top(); open.pop();
        if (cur.x == goal.x && cur.y == goal.y) return reconstructPath(&cur);
        for (auto [dx, dy] : DIRS_8) {
            int nx = cur.x + dx, ny = cur.y + dy;
            if (!isWalkable(grid, nx, ny)) continue;
            double step = (dx != 0 && dy != 0) ? 1.41421356 : 1.0;
            double g = cur.g + step;
            int key = nx * 10000 + ny;
            if (!visited.count(key) || g < visited[key]) {
                visited[key] = g;
                open.push({nx, ny, g, g + h({nx, ny}, goal), new Node(cur)});
            }
        }
    }
    return {};
}`,
};

export const STAGE1_LINES: Record<string, Record<string, number | number[]>> = {
  init: { javascript: 4, python: 4, java: 5, cpp: 4 },
  poll: { javascript: 8, python: 9, java: 9, cpp: 8 },
  reachGoal: { javascript: 9, python: 10, java: 10, cpp: 9 },
  expandSuccessors: { javascript: 10, python: 11, java: 11, cpp: 10 },
  pushOpen: { javascript: 17, python: 19, java: 18, cpp: 17 },
};

// ==========================================
// 阶段 2: 邻居对称性剪枝多语言代码
// ==========================================
export const STAGE2_PRUNING_CODE: Record<string, string> = {
  javascript: `// JavaScript 阶段 2: 邻居对称性剪枝与强迫邻居判定
function pruneNeighbors(grid, cur, parent) {
  const [dx, dy] = [Math.sign(cur.x - parent.x), Math.sign(cur.y - parent.y)];
  const neighbors = [];

  // 直行剪枝：仅前方为自然邻居；侧面障碍物导致侧前产生强迫邻居
  if (dx === 0 || dy === 0) {
    if (isWalkable(grid, cur.x + dx, cur.y + dy)) neighbors.push([cur.x + dx, cur.y + dy]);
    const [px, py] = [dy, dx]; // 正交法向
    if (!isWalkable(grid, cur.x + px, cur.y + py) && isWalkable(grid, cur.x + px + dx, cur.y + py + dy)) {
      neighbors.push([cur.x + px + dx, cur.y + py + dy]); // 强迫邻居
    }
    if (!isWalkable(grid, cur.x - px, cur.y - py) && isWalkable(grid, cur.x - px + dx, cur.y - py + dy)) {
      neighbors.push([cur.x - px + dx, cur.y - py + dy]); // 强迫邻居
    }
  } else {
    // 对角线剪枝：正前与两正交分量为自然邻居；拐角障碍物触发强迫邻居
    if (isWalkable(grid, cur.x + dx, cur.y)) neighbors.push([cur.x + dx, cur.y]);
    if (isWalkable(grid, cur.x, cur.y + dy)) neighbors.push([cur.x, cur.y + dy]);
    if (isWalkable(grid, cur.x + dx, cur.y + dy)) neighbors.push([cur.x + dx, cur.y + dy]);
    if (!isWalkable(grid, cur.x - dx, cur.y) && isWalkable(grid, cur.x - dx, cur.y + dy)) {
      neighbors.push([cur.x - dx, cur.y + dy]); // 强迫邻居
    }
    if (!isWalkable(grid, cur.x, cur.y - dy) && isWalkable(grid, cur.x + dx, cur.y - dy)) {
      neighbors.push([cur.x + dx, cur.y - dy]); // 强迫邻居
    }
  }
  return neighbors;
}`,

  python: `# Python 阶段 2: 邻居对称性剪枝与强迫邻居判定
def prune_neighbors(grid, cx, cy, px, py):
    dx, dy = (cx - px) // max(1, abs(cx - px)), (cy - py) // max(1, abs(cy - py))
    neighbors = []

    # 直行模式：仅正前方为自然邻居；侧向障碍物触发强迫邻居
    if dx == 0 or dy == 0:
        if is_walkable(grid, cx + dx, cy + dy):
            neighbors.append((cx + dx, cy + dy))
        rx, ry = dy, dx
        if not is_walkable(grid, cx + rx, cy + ry) and is_walkable(grid, cx + rx + dx, cy + ry + dy):
            neighbors.append((cx + rx + dx, cy + ry + dy)) # 强迫邻居
        if not is_walkable(grid, cx - rx, cy - ry) and is_walkable(grid, cx - rx + dx, cy - ry + dy):
            neighbors.append((cx - rx + dx, cy - ry + dy)) # 强迫邻居
    else:
        # 对角线模式：正前与两正交分量为自然邻居
        if is_walkable(grid, cx + dx, cy): neighbors.append((cx + dx, cy))
        if is_walkable(grid, cx, cy + dy): neighbors.append((cx, cy + dy))
        if is_walkable(grid, cx + dx, cy + dy): neighbors.append((cx + dx, cy + dy))
        if not is_walkable(grid, cx - dx, cy) and is_walkable(grid, cx - dx, cy + dy):
            neighbors.append((cx - dx, cy + dy)) # 强迫邻居
        if not is_walkable(grid, cx, cy - dy) and is_walkable(grid, cx + dx, cy - dy):
            neighbors.append((cx + dx, cy - dy)) # 强迫邻居
    return neighbors`,

  java: `// Java 阶段 2: 邻居对称性剪枝与强迫邻居判定
public class NeighborPruning {
    public static List<int[]> pruneNeighbors(int[][] grid, int cx, int cy, int px, int py) {
        int dx = Integer.compare(cx, px), dy = Integer.compare(cy, py);
        List<int[]> neighbors = new ArrayList<>();

        if (dx == 0 || dy == 0) { // 直行推进
            if (isWalkable(grid, cx + dx, cy + dy)) neighbors.add(new int[]{cx + dx, cy + dy});
            int rx = dy, ry = dx; // 侧向正交分量
            if (!isWalkable(grid, cx + rx, cy + ry) && isWalkable(grid, cx + rx + dx, cy + ry + dy)) {
                neighbors.add(new int[]{cx + rx + dx, cy + ry + dy}); // 强迫邻居
            }
            if (!isWalkable(grid, cx - rx, cy - ry) && isWalkable(grid, cx - rx + dx, cy - ry + dy)) {
                neighbors.add(new int[]{cx - rx + dx, cy - ry + dy}); // 强迫邻居
            }
        } else { // 对角线推进
            if (isWalkable(grid, cx + dx, cy)) neighbors.add(new int[]{cx + dx, cy});
            if (isWalkable(grid, cx, cy + dy)) neighbors.add(new int[]{cx, cy + dy});
            if (isWalkable(grid, cx + dx, cy + dy)) neighbors.add(new int[]{cx + dx, cy + dy});
            if (!isWalkable(grid, cx - dx, cy) && isWalkable(grid, cx - dx, cy + dy)) {
                neighbors.add(new int[]{cx - dx, cy + dy}); // 强迫邻居
            }
            if (!isWalkable(grid, cx, cy - dy) && isWalkable(grid, cx + dx, cy - dy)) {
                neighbors.add(new int[]{cx + dx, cy - dy}); // 强迫邻居
            }
        }
        return neighbors;
    }
}`,

  cpp: `// C++ 阶段 2: 邻居对称性剪枝与强迫邻居判定
std::vector<Point> pruneNeighbors(const Grid& grid, Point cur, Point parent) {
    int dx = (cur.x > parent.x) - (cur.x < parent.x);
    int dy = (cur.y > parent.y) - (cur.y < parent.y);
    std::vector<Point> neighbors;

    if (dx == 0 || dy == 0) { // 直行模式
        if (isWalkable(grid, cur.x + dx, cur.y + dy)) neighbors.push_back({cur.x + dx, cur.y + dy});
        int rx = dy, ry = dx;
        if (!isWalkable(grid, cur.x + rx, cur.y + ry) && isWalkable(grid, cur.x + rx + dx, cur.y + ry + dy))
            neighbors.push_back({cur.x + rx + dx, cur.y + ry + dy});
        if (!isWalkable(grid, cur.x - rx, cur.y - ry) && isWalkable(grid, cur.x - rx + dx, cur.y - ry + dy))
            neighbors.push_back({cur.x - rx + dx, cur.y - ry + dy});
    } else { // 对角线模式
        if (isWalkable(grid, cur.x + dx, cur.y)) neighbors.push_back({cur.x + dx, cur.y});
        if (isWalkable(grid, cur.x, cur.y + dy)) neighbors.push_back({cur.x, cur.y + dy});
        if (isWalkable(grid, cur.x + dx, cur.y + dy)) neighbors.push_back({cur.x + dx, cur.y + dy});
        if (!isWalkable(grid, cur.x - dx, cur.y) && isWalkable(grid, cur.x - dx, cur.y + dy))
            neighbors.push_back({cur.x - dx, cur.y + dy});
        if (!isWalkable(grid, cur.x, cur.y - dy) && isWalkable(grid, cur.x + dx, cur.y - dy))
            neighbors.push_back({cur.x + dx, cur.y - dy});
    }
    return neighbors;
}`,
};

export const STAGE2_LINES: Record<string, Record<string, number | number[]>> = {
  fnEntry: { javascript: 2, python: 2, java: 3, cpp: 2 },
  calcDir: { javascript: 3, python: 3, java: 4, cpp: 3 },
  initList: { javascript: 4, python: 4, java: 5, cpp: 5 },
  straightBranch: { javascript: 7, python: 7, java: 7, cpp: 7 },
  straightNatural: { javascript: 8, python: 8, java: 8, cpp: 8 },
  straightCheckSide: { javascript: 9, python: 10, java: 9, cpp: 9 },
  straightCheckSide1: { javascript: 10, python: 11, java: 10, cpp: 10 },
  straightForced: { javascript: 11, python: 12, java: 11, cpp: 11 },
  straightForced1: { javascript: 11, python: 12, java: 11, cpp: 11 },
  straightCheckSide2: { javascript: 13, python: 13, java: 13, cpp: 12 },
  straightForced2: { javascript: 14, python: 14, java: 14, cpp: 13 },
  straightReturn: { javascript: 28, python: 24, java: 27, cpp: 23 },
  diagonalBranch: { javascript: 16, python: 15, java: 16, cpp: 14 },
  diagonalNaturalH: { javascript: 18, python: 17, java: 17, cpp: 15 },
  diagonalNaturalV: { javascript: 19, python: 18, java: 18, cpp: 16 },
  diagonalNaturalDiag: { javascript: 20, python: 19, java: 19, cpp: 17 },
  diagonalNatural: { javascript: 18, python: 17, java: 17, cpp: 15 },
  diagonalCheckCorner: { javascript: 21, python: 20, java: 20, cpp: 18 },
  diagonalCheckCorner1: { javascript: 21, python: 20, java: 20, cpp: 18 },
  diagonalForced: { javascript: 22, python: 21, java: 21, cpp: 19 },
  diagonalForced1: { javascript: 22, python: 21, java: 21, cpp: 19 },
  diagonalCheckCorner2: { javascript: 24, python: 22, java: 23, cpp: 20 },
  diagonalForced2: { javascript: 25, python: 23, java: 24, cpp: 21 },
  returnNeighbors: { javascript: 28, python: 24, java: 27, cpp: 23 },
};

// ==========================================
// 阶段 3: 递归射线跳跃探测多语言代码
// ==========================================
export const STAGE3_RAY_CODE: Record<string, string> = {
  javascript: `// JavaScript 阶段 3: 递归射线跳跃 (沿途零入堆，直行/对角复合穿透)
function jump(grid, x, y, dx, dy, goal) {
  const nx = x + dx, ny = y + dy;
  if (!isWalkable(grid, nx, ny)) return null;          // 撞墙或出界，光束终止
  if (nx === goal[0] && ny === goal[1]) return [nx, ny]; // 探测到目标，立即停下
  if (hasForcedNeighbor(grid, nx, ny, dx, dy)) return [nx, ny]; // 发现强迫邻居拐角

  // 对角线跳跃时，必须先递归向水平与垂直两个正交分量发射光束探测
  if (dx !== 0 && dy !== 0) {
    if (jump(grid, nx, ny, dx, 0, goal) !== null) return [nx, ny]; // 水平探测命中跳点
    if (jump(grid, nx, ny, 0, dy, goal) !== null) return [nx, ny]; // 垂直探测命中跳点
  }
  return jump(grid, nx, ny, dx, dy, goal);            // 自身沿射线继续高速滑行
}`,

  python: `# Python 阶段 3: 递归射线跳跃 (沿途零入堆，直行/对角复合穿透)
def jump(grid, x, y, dx, dy, goal):
    nx, ny = x + dx, y + dy
    if not is_walkable(grid, nx, ny):
        return None
    if (nx, ny) == goal:
        return (nx, ny)
    if has_forced_neighbor(grid, nx, ny, dx, dy):
        return (nx, ny)
    # 对角线跳跃时，递归探测正交分量
    if dx != 0 and dy != 0:
        if jump(grid, nx, ny, dx, 0, goal) is not None:
            return (nx, ny)
        if jump(grid, nx, ny, 0, dy, goal) is not None:
            return (nx, ny)
    return jump(grid, nx, ny, dx, dy, goal)`,

  java: `// Java 阶段 3: 递归射线跳跃 (沿途零入堆，直行/对角复合穿透)
public class JumpRayScanner {
    public static int[] jump(int[][] grid, int x, int y, int dx, int dy, int[] goal) {
        int nx = x + dx, ny = y + dy;
        if (!isWalkable(grid, nx, ny)) return null;          // 撞墙或出界，光束终止
        if (nx == goal[0] && ny == goal[1]) return new int[]{nx, ny}; // 探测到目标，立即停下
        if (hasForcedNeighbor(grid, nx, ny, dx, dy)) return new int[]{nx, ny}; // 发现强迫邻居拐角

        // 对角线跳跃时，必须先递归向水平与垂直两个正交分量发射光束
        if (dx != 0 && dy != 0) {
            if (jump(grid, nx, ny, dx, 0, goal) != null) return new int[]{nx, ny}; // 水平命中
            if (jump(grid, nx, ny, 0, dy, goal) != null) return new int[]{nx, ny}; // 垂直命中
        }
        return jump(grid, nx, ny, dx, dy, goal);            // 自身沿射线继续高速滑行
    }
}`,

  cpp: `// C++ 阶段 3: 递归射线跳跃 (沿途零入堆，直行/对角复合穿透)
Point* jump(const Grid& grid, int x, int y, int dx, int dy, Point goal) {
    int nx = x + dx, ny = y + dy;
    if (!isWalkable(grid, nx, ny)) return nullptr;
    if (nx == goal.x && ny == goal.y) return new Point{nx, ny};
    if (hasForcedNeighbor(grid, nx, ny, dx, dy)) return new Point{nx, ny};

    // 对角线跳跃时，正交子探测
    if (dx != 0 && dy != 0) {
        if (jump(grid, nx, ny, dx, 0, goal) != nullptr) return new Point{nx, ny};
        if (jump(grid, nx, ny, 0, dy, goal) != nullptr) return new Point{nx, ny};
    }
    return jump(grid, nx, ny, dx, dy, goal);
}`,
};

export const STAGE3_LINES: Record<string, Record<string, number | number[]>> = {
  fnEntry: { javascript: 2, python: 2, java: 3, cpp: 2 },
  jumpRayStart: { javascript: 3, python: 3, java: 4, cpp: 3 },
  checkWalkable: { javascript: 4, python: 4, java: 5, cpp: 4 },
  hitWall: { javascript: 4, python: 4, java: 5, cpp: 4 },
  checkGoal: { javascript: 5, python: 5, java: 6, cpp: 5 },
  checkForced: { javascript: 6, python: 7, java: 7, cpp: 6 },
  hitForced: { javascript: 6, python: 7, java: 7, cpp: 6 },
  diagonalBranch: { javascript: 9, python: 10, java: 10, cpp: 9 },
  subJumpH: { javascript: 10, python: 11, java: 11, cpp: 10 },
  subJumpV: { javascript: 11, python: 13, java: 12, cpp: 11 },
  subJumpHitV: { javascript: 11, python: 13, java: 12, cpp: 11 },
  diagonalSubJump: { javascript: 10, python: 11, java: 11, cpp: 10 },
  jumpRecurse: { javascript: 13, python: 15, java: 14, cpp: 13 },
};

// ==========================================
// 阶段 4: JPS 完整跳点搜索多语言代码
// ==========================================
export const STAGE4_JPS_CODE: Record<string, string> = {
  javascript: `// JavaScript 阶段 4: 完整 JPS 跳点搜索 (Open 堆仅存放关键跳点)
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

  python: `# Python 阶段 4: 完整 JPS 跳点搜索 (Open 堆仅存放关键跳点)
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
    if not is_walkable(grid, nx, ny): return None
    if (nx, ny) == goal: return (nx, ny)
    if has_forced_neighbor(grid, nx, ny, dx, dy): return (nx, ny)
    if dx != 0 and dy != 0:
        if jump(grid, nx, ny, dx, 0, goal) is not None: return (nx, ny)
        if jump(grid, nx, ny, 0, dy, goal) is not None: return (nx, ny)
    return jump(grid, nx, ny, dx, dy, goal)`,

  java: `// Java 阶段 4: 完整 JPS 跳点搜索 (Open 堆仅存放关键跳点)
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

  cpp: `// C++ 阶段 4: 完整 JPS 跳点搜索 (Open 堆仅存放关键跳点)
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

export const STAGE4_LINES: Record<string, Record<string, number | number[]>> = {
  init: { javascript: 4, python: 5, java: 4, cpp: 7 },
  poll: { javascript: 8, python: 9, java: 9, cpp: 12 },
  reachGoal: { javascript: 9, python: 10, java: 10, cpp: 13 },
  expandSuccessors: { javascript: 10, python: 12, java: 11, cpp: 14 },
  pushOpen: { javascript: 16, python: 17, java: 16, cpp: 19 },
  jumpRayStart: { javascript: 24, python: 21, java: 25, cpp: 26 },
  checkGoal: { javascript: 26, python: 23, java: 27, cpp: 28 },
  checkForced: { javascript: 27, python: 24, java: 28, cpp: 29 },
  diagonalSubJump: { javascript: 29, python: 26, java: 30, cpp: 31 },
  jumpRecurse: { javascript: 32, python: 28, java: 33, cpp: 34 },
};

// 保持向下兼容默认导出
export const JUMP_POINT_SEARCH_CODE_LANGUAGES = STAGE4_JPS_CODE;
export const JPS_CODE_LINES = STAGE4_LINES;
