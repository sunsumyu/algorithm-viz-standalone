/**
 * 部落冲突·战术攻防沙盘 (Clash of Algorithms)
 * 游戏 AI 算法精讲、多语言 A* 寻路与防御塔索敌核心源码
 */

export const CLASH_ALGORITHMS_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <queue>',
    '#include <cmath>',
    'using namespace std;',
    '',
    '// 兵种类型与偏好过滤器',
    'enum TargetType { ALL, DEFENSE, RESOURCE, WALL };',
    '',
    'struct Point { int r, c; };',
    'struct Node {',
    '    Point p;',
    '    double g, h;',
    '    double f() const { return g + h; }',
    '    bool operator>(const Node& o) const { return f() > o.f(); }',
    '};',
    '',
    '// A* 寻路核心：根据兵种偏好与城墙权重计算最优路线',
    'vector<Point> findTroopPath(Point start, Point target, const vector<vector<int>>& grid, TargetType pref) {',
    '    priority_queue<Node, vector<Node>, greater<Node>> pq;',
    '    vector<vector<double>> dist(grid.size(), vector<double>(grid[0].size(), 1e9));',
    '    vector<vector<Point>> parent(grid.size(), vector<Point>(grid[0].size(), {-1, -1}));',
    '',
    '    dist[start.r][start.c] = 0;',
    '    pq.push({start, 0, (double)(abs(start.r - target.r) + abs(start.c - target.c))});',
    '',
    '    while (!pq.empty()) {',
    '        Node cur = pq.top(); pq.pop();',
    '        if (cur.p.r == target.r && cur.p.c == target.c) break;',
    '',
    '        int dr[] = {-1, 1, 0, 0}, dc[] = {0, 0, -1, 1};',
    '        for (int i = 0; i < 4; i++) {',
    '            int nr = cur.p.r + dr[i], nc = cur.p.c + dc[i];',
    '            if (nr < 0 || nr >= grid.size() || nc < 0 || nc >= grid[0].size()) continue;',
    '',
    '            // 城墙惩罚：普通小兵翻墙耗时代价为 25 格行走成本',
    '            double stepCost = 1.0;',
    '            if (grid[nr][nc] == 1) stepCost = (pref == WALL) ? 0.5 : 25.0;',
    '',
    '            if (dist[cur.p.r][cur.p.c] + stepCost < dist[nr][nc]) {',
    '                dist[nr][nc] = dist[cur.p.r][cur.p.c] + stepCost;',
    '                parent[nr][nc] = cur.p;',
    '                pq.push({{nr, nc}, dist[nr][nc], (double)(abs(nr - target.r) + abs(nc - target.c))});',
    '            }',
    '        }',
    '    }',
    '    // 回溯路径...',
    '    return {};',
    '}',
  ],
  java: [
    'import java.util.*;',
    '',
    'public class ClashAStarEngine {',
    '    public static class Point {',
    '        public int r, c;',
    '        public Point(int r, int c) { this.r = r; this.c = c; }',
    '    }',
    '',
    '    // 兵种 AI 目标筛选器：巨人专打防御，哥布林专抢资源',
    '    public static Point selectBestTarget(Point troopPos, List<Building> buildings, String troopType) {',
    '        Point bestTarget = null;',
    '        double minCost = Double.MAX_VALUE;',
    '',
    '        for (Building b : buildings) {',
    '            if (b.hp <= 0) continue;',
    '            // 巨人优先筛选防御塔',
    '            if ("GIANT".equals(troopType) && !b.isDefense && hasAliveDefense(buildings)) continue;',
    '            // 哥布林优先筛选资源',
    '            if ("GOBLIN".equals(troopType) && !b.isResource && hasAliveResource(buildings)) continue;',
    '',
    '            double dist = Math.hypot(troopPos.r - b.r, troopPos.c - b.c);',
    '            if (dist < minCost) {',
    '                minCost = dist;',
    '                bestTarget = new Point(b.r, b.c);',
    '            }',
    '        }',
    '        return bestTarget;',
    '    }',
    '}',
  ],
  python: [
    'import heapq',
    '',
    'class ClashAI:',
    '    @staticmethod',
    '    def astar_path(start, target, grid, is_wall_breaker=False):',
    '        """A* 寻路计算：权衡绕路距离 vs 破墙代价"""',
    '        pq = [(0 + abs(start[0] - target[0]) + abs(start[1] - target[1]), 0, start, [])]',
    '        visited = set()',
    '',
    '        while pq:',
    '            f, g, (r, c), path = heapq.heappop(pq)',
    '            if (r, c) == target:',
    '                return path + [(r, c)]',
    '            if (r, c) in visited:',
    '                continue',
    '            visited.add((r, c))',
    '',
    '            for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:',
    '                nr, nc = r + dr, c + dc',
    '                if 0 <= nr < len(grid) and 0 <= nc < len(grid[0]):',
    '                    # 城墙权重惩罚：普通兵 20 步，炸弹人 1 步',
    '                    cost = 20 if grid[nr][nc] == "WALL" and not is_wall_breaker else 1',
    '                    h = abs(nr - target[0]) + abs(nc - target[1])',
    '                    heapq.heappush(pq, (g + cost + h, g + cost, (nr, nc), path + [(r, c)]))',
    '        return []',
  ],
  javascript: [
    '// 防御塔最近邻优先队列索敌机制',
    'function towerSelectTarget(tower, troops, maxRange) {',
    '  let lockedTroop = null;',
    '  let minDistance = Infinity;',
    '',
    '  for (const troop of troops) {',
    '    if (troop.hp <= 0) continue;',
    '    const dist = Math.hypot(tower.r - troop.r, tower.c - troop.c);',
    '    if (dist <= maxRange && dist < minDistance) {',
    '      minDistance = dist;',
    '      lockedTroop = troop;',
    '    }',
    '  }',
    '  return lockedTroop;',
    '}',
  ],
};

export const CLASH_ALGORITHMS_PROBLEM_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <span style="font-size: 20px;">⚔️</span>
      <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #0f172a;">战术攻防演练场 (Clash of Algorithms)</h3>
      <span style="background: #fef2f2; color: #ef4444; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid #fecaca;">游戏 AI 算法</span>
    </div>

    <p style="font-size: 13px; color: #334155; margin-bottom: 12px;">
      在经典策略游戏《部落冲突》中，为什么巨人总是无视大本营直扑箭塔？为什么野蛮人宁愿绕远路走缺口也不愿砸面前的城墙？本沙盘带你透视真实游戏背后的 <b>A* 启发式寻路、权衡矩阵与最近邻索敌</b> 机制！
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
        <h4 style="margin: 0 0 6px 0; font-size: 12px; color: #0f172a;">🛡️ 防御建筑</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>🏰 大本营 (Town Hall)</b>: 核心枢纽 (HP 800)</li>
          <li><b>🏹 箭塔 (Archer Tower)</b>: 单体高射程 (射程 3.5, 攻 30)</li>
          <li><b>💣 迫击炮 (Mortar)</b>: 范围溅射打击 (射程 5.0, 攻 60)</li>
          <li><b>🪙 金矿 (Gold Mine)</b>: 资源设施 (HP 300)</li>
          <li><b>🧱 城墙 (Wall)</b>: 物理阻隔 (赋予 A* 高行走代价)</li>
        </ul>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
        <h4 style="margin: 0 0 6px 0; font-size: 12px; color: #0f172a;">🪓 进攻兵种 AI</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>🪓 野蛮人</b>: 最近邻 BFS，寻找距离最近的任何建筑</li>
          <li><b>🛡️ 巨人</b>: 防御过滤 A*，死磕箭塔与迫击炮</li>
          <li><b>💰 哥布林</b>: 资源贪心，2x 极速直扑金矿</li>
          <li><b>💣 炸弹人</b>: 闭合环判定，优先爆破包围核心的城墙</li>
        </ul>
      </div>
    </div>
  </div>
`;

export const CLASH_ALGORITHMS_ANALYSIS_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <h3 style="margin-top: 0; font-size: 15px; font-weight: 800; color: #0f172a;">算法揭秘：为什么「引导阵」能玩弄小兵？</h3>

    <div style="margin-bottom: 12px;">
      <h4 style="margin: 0 0 4px 0; font-size: 13px; color: #2563eb;">1. A* 寻路的「砸墙代价 vs 绕路代价」权衡公式</h4>
      <p style="font-size: 12px; color: #475569; margin: 0;">
        在 A* 启发式函数中，穿越一个正常地块的移动代价 $G_{\text{walk}} = 1$；而直接砸开一面城墙所需的时间被等价折算为 $G_{\text{wall}} \approx 20$ 步移动代价。
        <br>• 如果绕过城墙的缺口只需要走 <b>12 步</b>，那么 $12 < 20$，小兵会<b>毅然选择绕路钻洞</b>（踩中玩家预设的陷阱）；
        <br>• 只有当城墙完全封闭且绕路步数 $> 20$ 时，小兵才会停下开始砸墙！
      </p>
    </div>

    <div style="margin-bottom: 12px;">
      <h4 style="margin: 0 0 4px 0; font-size: 13px; color: #10b981;">2. 巨人兵种的「目标池剪枝」</h4>
      <p style="font-size: 12px; color: #475569; margin: 0;">
        巨人的寻路目标并非所有建筑，而是对所有存活建筑做集合求交：
        $$\text{TargetSet} = \{ b \in \text{Buildings} \mid b.\text{type} \in \{\text{ArcherTower}, \text{Mortar}\} \text{ and } b.\text{hp} > 0 \}$$
        当且仅当 $\text{TargetSet} = \emptyset$（所有防御塔全灭）时，巨人才会降级为普通攻击模式。
      </p>
    </div>
  </div>
`;
