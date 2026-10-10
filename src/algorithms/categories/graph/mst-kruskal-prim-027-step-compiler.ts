/**
 * 最小生成树算法 (MST - Kruskal & Prim) (Class 027 / 洛谷 P3366) — 步进推演编译器
 * 职责：Kruskal 边权排序、并查集防环判定与 MST 构建步骤生成
 */

import { StepBase } from '../../../core/step-visualizer';

export interface EdgeDef {
  u: number;
  v: number;
  w: number;
}

export interface Mst027Step extends StepBase {
  algorithm: 'kruskal' | 'prim';
  edges: EdgeDef[];
  activeEdge?: EdgeDef;
  selectedEdges: EdgeDef[];
  totalWeight: number;
  nodeCount: number;
  decision: string;
  message: string;
  log: string;
  codeLine: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const MST_027_CODES = {
  java: `public class MST {
    // 1. Kruskal 算法：边权升序排序 + 并查集判环
    public static int kruskal(int n, int[][] edges) {
        Arrays.sort(edges, (a, b) -> a[2] - b[2]);
        UnionFind uf = new UnionFind(n);
        int totalWeight = 0, edgeCount = 0;
        for (int[] e : edges) {
            if (uf.union(e[0], e[1])) {
                totalWeight += e[2];
                if (++edgeCount == n - 1) break;
            }
        }
        return edgeCount == n - 1 ? totalWeight : -1;
    }
    // 2. Prim 算法：小根堆解锁邻接切分边
    public static int prim(int n, List<int[]>[] graph) {
        boolean[] visited = new boolean[n + 1];
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);
        visited[1] = true;
        for (int[] next : graph[1]) pq.offer(next);
        int totalWeight = 0, nodeCount = 1;
        while (!pq.isEmpty() && nodeCount < n) {
            int[] edge = pq.poll();
            int to = edge[0], w = edge[1];
            if (visited[to]) continue;
            visited[to] = true;
            totalWeight += w;
            nodeCount++;
            for (int[] next : graph[to]) {
                if (!visited[next[0]]) pq.offer(next);
            }
        }
        return nodeCount == n ? totalWeight : -1;
    }
}`,
  cpp: `int kruskal(int n, vector<vector<int>>& edges) {
    sort(edges.begin(), edges.end(), [](auto& a, auto& b) { return a[2] < b[2]; });
    UnionFind uf(n);
    int total = 0, count = 0;
    for (auto& e : edges) {
        if (uf.unite(e[0], e[1])) {
            total += e[2];
            if (++count == n - 1) break;
        }
    }
    return count == n - 1 ? total : -1;
}
int prim(int n, const vector<vector<pair<int, int>>>& g) {
    vector<bool> vis(n + 1, false);
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;
    vis[1] = true;
    for (auto& edge : g[1]) pq.push({edge.second, edge.first});
    int total = 0, count = 1;
    while (!pq.empty() && count < n) {
        auto [w, to] = pq.top(); pq.pop();
        if (vis[to]) continue;
        vis[to] = true; total += w; count++;
        for (auto& next : g[to]) if (!vis[next.first]) pq.push({next.second, next.first});
    }
    return count == n ? total : -1;
}`,
  python: `def kruskal(n, edges):
    edges.sort(key=lambda x: x[2])
    parent = list(range(n + 1))
    def find(i):
        if parent[i] == i: return i
        parent[i] = find(parent[i]); return parent[i]
    total, count = 0, 0
    for u, v, w in edges:
        ru, rv = find(u), find(v)
        if ru != rv:
            parent[ru] = rv
            total += w; count += 1
            if count == n - 1: break
    return total if count == n - 1 else -1`,
  typescript: `export function kruskal(n: number, edges: number[][]): number {
    edges.sort((a, b) => a[2] - b[2]);
    const parent = Array.from({ length: n + 1 }, (_, i) => i);
    function find(i: number): number {
        return parent[i] === i ? i : (parent[i] = find(parent[i]));
    }
    let total = 0, count = 0;
    for (const [u, v, w] of edges) {
        const ru = find(u), rv = find(v);
        if (ru !== rv) {
            parent[ru] = rv;
            total += w;
            if (++count === n - 1) break;
        }
    }
    return count === n - 1 ? total : -1;
}`,
};

const lines: Record<string, number> = {
  enter: 3,
  checkEdge: 8,
  unionEdge: 9,
  mstDone: 13,
};

export const DEFAULT_MST_027_EDGES: EdgeDef[] = [
  { u: 1, v: 2, w: 1 },
  { u: 2, v: 3, w: 2 },
  { u: 1, v: 3, w: 4 },
  { u: 2, v: 4, w: 3 },
  { u: 3, v: 4, w: 5 },
];

export function buildMst027Steps(n: number = 4, rawEdges?: EdgeDef[]): Mst027Step[] {
  const steps: Mst027Step[] = [];
  const edges: EdgeDef[] = rawEdges || DEFAULT_MST_027_EDGES;

  // 1. 入口
  steps.push({
    algorithm: 'kruskal',
    edges: [...edges],
    selectedEdges: [],
    totalWeight: 0,
    nodeCount: n,
    decision: `主函数入口：图共有 ${n} 个顶点，${edges.length} 条无向带权边。准备启动 Kruskal 算法贪心加边构造最小生成树`,
    message: 'Kruskal 原理：按边权由小到大排序，利用并查集逐条判定，不形成环则加入生成树',
    log: `enter kruskal(n=${n})`,
    codeLine: lines.enter,
    statusBadge: { text: '初始化', type: 'info' },
  });

  const sortedEdges = [...edges].sort((a, b) => a.w - b.w);
  const parent = Array.from({ length: n + 1 }, (_, i) => i);
  function find(i: number): number {
    return parent[i] === i ? i : (parent[i] = find(parent[i]));
  }

  const selected: EdgeDef[] = [];
  let totalW = 0;

  for (const edge of sortedEdges) {
    const ru = find(edge.u);
    const rv = find(edge.v);
    const canSelect = ru !== rv;

    steps.push({
      algorithm: 'kruskal',
      edges: sortedEdges,
      activeEdge: edge,
      selectedEdges: [...selected],
      totalWeight: totalW,
      nodeCount: n,
      decision: `探测候选边 (${edge.u} ↔ ${edge.v}, 权值 ${edge.w})：顶点 ${edge.u} 属于集合 [${ru}]，顶点 ${edge.v} 属于集合 [${rv}]`,
      message: canSelect
        ? `两端点属于不同连通分量，选入该边不会成环！`
        : `两端点已在同一连通分量中，若加入该边将产生环路，必须果断舍弃！`,
      log: `check edge (${edge.u}, ${edge.v}, w=${edge.w}) -> ${canSelect ? 'ACCEPT' : 'REJECT'}`,
      codeLine: lines.checkEdge,
      statusBadge: canSelect
        ? { text: `采纳边 w=${edge.w}`, type: 'success' }
        : { text: '跳过成环边', type: 'danger' },
    });

    if (canSelect) {
      parent[ru] = rv;
      selected.push(edge);
      totalW += edge.w;

      steps.push({
        algorithm: 'kruskal',
        edges: sortedEdges,
        activeEdge: edge,
        selectedEdges: [...selected],
        totalWeight: totalW,
        nodeCount: n,
        decision: `边 (${edge.u} ↔ ${edge.v}) 固化加入生成树！当前生成树总边权累加为: ${totalW}`,
        message: `已选中 ${selected.length} / ${n - 1} 条边`,
        log: `union(${edge.u}, ${edge.v}), total=${totalW}`,
        codeLine: lines.unionEdge,
        statusBadge: { text: `已选边 ${selected.length}/${n - 1}`, type: 'warning' },
      });

      if (selected.length === n - 1) {
        break;
      }
    }
  }

  steps.push({
    algorithm: 'kruskal',
    edges: sortedEdges,
    selectedEdges: [...selected],
    totalWeight: totalW,
    nodeCount: n,
    decision: `🎉 最小生成树构建完成！恰好选出 ${selected.length} 条边，联通全部 ${n} 个顶点，最小生成树总权值之和为: ${totalW}`,
    message: '全部顶点已连通',
    log: `MST completed, totalWeight=${totalW}`,
    codeLine: lines.mstDone,
    statusBadge: { text: `MST 总权值 = ${totalW}`, type: 'success' },
  });

  return steps;
}
