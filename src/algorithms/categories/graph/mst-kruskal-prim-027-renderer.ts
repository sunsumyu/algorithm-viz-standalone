/**
 * Class 027: 最小生成树算法 (MST - Kruskal & Prim)
 * 洛谷 P3366 【模板】最小生成树
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

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
}`
};

export function buildMst027Steps(
  n: number = 4,
  rawEdges?: EdgeDef[]
): Mst027Step[] {
  const steps: Mst027Step[] = [];
  const edges: EdgeDef[] = rawEdges || [
    { u: 1, v: 2, w: 1 },
    { u: 2, v: 3, w: 2 },
    { u: 1, v: 3, w: 4 },
    { u: 2, v: 4, w: 3 },
    { u: 3, v: 4, w: 5 },
  ];

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
    codeLine: 1,
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
      message: canSelect ? `两端点属于不同连通分量，选入该边不会成环！` : `两端点已在同一连通分量中，若加入该边将产生环路，必须果断舍弃！`,
      log: `check edge (${edge.u}, ${edge.v}, w=${edge.w}) -> ${canSelect ? 'ACCEPT' : 'REJECT'}`,
      codeLine: 6,
      statusBadge: canSelect ? { text: `采纳边 w=${edge.w}`, type: 'success' } : { text: '跳过成环边', type: 'danger' },
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
        codeLine: 7,
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
    codeLine: 12,
    statusBadge: { text: `MST 总权值 = ${totalW}`, type: 'success' },
  });

  return steps;
}

export const mst027Visualizer = registerDeclarativeAlgorithm<Mst027Step>({
  id: 'mst-kruskal-prim-027',
  name: '最小生成树 (Kruskal & Prim) (Class 027)',
  category: 'graph',
  icon: '🌐',
  difficulty: 2,
  levelOrder: 27,
  learningGoal: '掌握 Kruskal 贪心加边与并查集防环机制，理解 Prim 节点集割边扩展定理与最小生成树应用',
  problemHtml: `
    <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
      <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">题目描述</h3>
      <p>给定一个无向带权连通图，求出图的最小生成树 (Minimum Spanning Tree) 的所有边的边权之和。</p>
      <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0;">
        <strong>默认图拓扑：</strong>4 个顶点，边权为 (1-2:1), (2-3:2), (1-3:4), (2-4:3), (3-4:5)。<br/>
        <strong>MST 选取边：</strong>(1-2:1) + (2-3:2) + (2-4:3) = 6。
      </div>
    </div>
  `,
  inputs: [
    {
      id: 'nodes',
      label: '顶点个数 (N)',
      type: 'number',
      defaultValue: 4,
      min: 2,
      max: 6,
    },
  ],
  codeLanguages: MST_027_CODES,
  generateSteps: (inputs) => {
    const n = Math.max(2, parseInt(String(inputs.nodes || 4), 10));
    return buildMst027Steps(n);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        <!-- 顶部指标卡 -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">算法策略</div>
            <div style="font-size: 16px; font-weight: 700; color: #0284c7; margin-top: 4px;">Kruskal 并查集贪心</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">当前探测边</div>
            <div style="font-size: 18px; font-weight: 700; color: #8b5cf6; margin-top: 4px;">
              ${step.activeEdge ? `(${step.activeEdge.u}↔${step.activeEdge.v}: ${step.activeEdge.w})` : '-'}
            </div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">已选中边数</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669; margin-top: 4px;">${step.selectedEdges.length} / ${step.nodeCount - 1}</div>
          </div>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #166534;">MST 累计总权值</div>
            <div style="font-size: 22px; font-weight: 800; color: #15803d; margin-top: 4px;">${step.totalWeight}</div>
          </div>
        </div>

        <!-- 边集与生成树候选展板 -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
          <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 8px;">
            🌐 边权升序队列 (按权值贪心考量)
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${step.edges.map((e) => {
              const isSelected = step.selectedEdges.some((se) => se.u === e.u && se.v === e.v);
              const isActive = step.activeEdge?.u === e.u && step.activeEdge?.v === e.v;
              let border = '#cbd5e1';
              let bg = '#ffffff';
              if (isSelected) { border = '#22c55e'; bg = '#dcfce7'; }
              else if (isActive) { border = '#f59e0b'; bg = '#fef3c7'; }

              return `
                <div style="padding: 8px 14px; border: 2px solid ${border}; background: ${bg}; border-radius: 6px; text-align: center;">
                  <div style="font-size: 13px; font-weight: 700; color: #1e293b;">${e.u} ↔ ${e.v}</div>
                  <div style="font-size: 11px; color: #64748b; font-family: monospace; margin-top: 2px;">权值: ${e.w}</div>
                  <div style="font-size: 10px; margin-top: 4px; font-weight: 700; color: ${isSelected ? '#15803d' : isActive ? '#b45309' : '#94a3b8'};">
                    ${isSelected ? '✅ 已入选' : isActive ? '⏳ 判定中' : '⚪ 待考量'}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 决策卡片 -->
        ${renderFormulaCard(
          'Kruskal 判定核心逻辑',
          `if (find(u) != find(v)) { union(u, v); total += w; }`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
