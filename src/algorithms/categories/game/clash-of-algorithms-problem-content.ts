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
    'vector<Point> findTroopPath(Point start, Point target, const vector<vector<int>>& grid, TargetType pref, double wallPenalty) {',
    '    priority_queue<Node, vector<Node>, greater<Node>> pq;',
    '    vector<vector<double>> dist(grid.size(), vector<double>(grid[0].size(), 1e9));',
    '    vector<vector<Point>> parent(grid.size(), vector<Point>(grid[0].size(), {-1, -1}));',
    '',
    '    dist[start.r][start.c] = 0;',
    '    double startH = abs(start.r - target.r) + abs(start.c - target.c); // 曼哈顿启发式',
    '    pq.push({start, 0, startH});',
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
    '            // 城墙惩罚：普通小兵根据滑块配置 W_wall 权衡绕路还是破墙',
    '            double stepCost = 1.0;',
    '            if (grid[nr][nc] == 1) stepCost = (pref == WALL) ? 1.0 : wallPenalty;',
    '',
    '            if (dist[cur.p.r][cur.p.c] + stepCost < dist[nr][nc]) {',
    '                dist[nr][nc] = dist[cur.p.r][cur.p.c] + stepCost;',
    '                parent[nr][nc] = cur.p;',
    '                double h = abs(nr - target.r) + abs(nc - target.c);',
    '                pq.push({{nr, nc}, dist[nr][nc], h});',
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
    '    def astar_path(start, target, grid, wall_penalty=16.0, is_wall_breaker=False):',
    '        """A* 寻路计算：权衡绕路距离 vs 破墙代价 f(n) = g(n) + h(n)"""',
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
    '            for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:',
    '                nr, nc = r + dr, c + dc',
    '                if 0 <= nr < len(grid) and 0 <= nc < len(grid[0]):',
    '                    cost = wall_penalty if grid[nr][nc] == "WALL" and not is_wall_breaker else 1.0',
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
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
      <span style="font-size: 20px;">⚔️</span>
      <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #0f172a;">如何通过《部落冲突》学习算法？</h3>
      <span style="background: #ecfdf5; color: #059669; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid #a7f3d0;">算法学习指南</span>
    </div>

    <p style="font-size: 12.5px; color: #334155; margin-bottom: 10px;">
      本游戏并非单纯的娱乐，而是将<b>图论、搜索算法、空间计算与状态机</b>具象化的交互式算法沙盘。通过本沙盘，你将亲身掌握 4 大计算机核心算法：
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">1. 🧭 A* 启发式寻路 (A-Star)</h4>
        <p style="margin: 0; font-size: 11px; color: #475569;">
          掌握估价函数 $f(n) = g(n) + h(n)$。通过右侧滑块调节城墙代价 $W_{\\text{wall}}$，观察小兵在<b>直接砸墙</b>与<b>绕路钻洞</b>之间的临界决策！
        </p>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">2. 🎯 贪心与目标池剪枝</h4>
        <p style="margin: 0; font-size: 11px; color: #475569;">
          哥布林利用集合过滤直扑金矿（贪心资源）；巨人过滤所有非防御建筑（优先级队列）；体验不同兵种的局部最优选择。
        </p>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">3. 📐 空间范围与最近邻索敌</h4>
        <p style="margin: 0; font-size: 11px; color: #475569;">
          防御塔基于欧几里得距离 $O(N)$ 扫描锁定最近单位；迫击炮与雷电法术计算欧氏距离半径的范围伤害 (AoE)。
        </p>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">4. 🔄 图论拓扑动态重规划</h4>
        <p style="margin: 0; font-size: 11px; color: #475569;">
          当城墙被炸药包爆破或建筑坍塌时，整个网格图的邻接权值矩阵发生动态变化，触发全场小兵实时重新 A* 算路！
        </p>
      </div>
    </div>
  </div>
`;

export const CLASH_ALGORITHMS_ANALYSIS_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <h3 style="margin-top: 0; font-size: 14px; font-weight: 800; color: #0f172a;">实验方法：如何在沙盘中探索算法？</h3>

    <div style="margin-bottom: 10px;">
      <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #2563eb;">实验一：调节 $W_{\\text{wall}}$ 观察小兵走位临界点</h4>
      <p style="font-size: 11.5px; color: #475569; margin: 0;">
        在第 3 关（开孔引导阵）中：
        <br>• 将城墙代价滑块拉到 <b>1</b>：小兵会直奔大本营，直接砸开左侧城墙；
        <br>• 将城墙代价滑块拉到 <b>35</b>：小兵会放弃砸墙，全体绕大半圈钻入右侧缺口（踩中迫击炮射程）。
      </p>
    </div>

    <div style="margin-bottom: 10px;">
      <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #10b981;">实验二：切换启发式函数比较搜索效率</h4>
      <p style="font-size: 11.5px; color: #475569; margin: 0;">
        • <b>曼哈顿距离</b>：$|dx| + |dy|$，对网格 4 方向移动最紧致，Open 表展开节点极少；
        <br>• <b>Dijkstra 模式 ($h=0$)</b>：失去方向引导，Open 表展开节点数将激增 3~4 倍！点击小兵可即时对比节点统计数据。
      </p>
    </div>
  </div>
`;
