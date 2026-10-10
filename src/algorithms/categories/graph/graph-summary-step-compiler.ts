/**
 * 图论总结篇 (Graph Algorithms Summary) — 步进推演编译器
 * 职责：按图论五大核心领域输出解释器级全景推演步进
 */

import type { HighlightTarget } from '../../../core/code-panel';

export interface GSCategory {
  id: string;
  icon: string;
  name: string;
  enName: string;
  desc: string;
  algos: string[];
  complexity: string;
  detail: string;
  color: string;
}

export interface GSStep {
  activeCategory: string;
  categories: GSCategory[];
  detail: string | null;
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics: Record<string, string | number>;
}

export const GS_CATEGORIES: GSCategory[] = [
  {
    id: 'traversal',
    icon: '🔄',
    name: '遍历搜索',
    enName: 'Traversal',
    desc: 'DFS 深度优先 + BFS 广度优先，图论基石。所有复杂算法的基础。',
    algos: ['DFS', 'BFS', '连通分量', '双向 BFS'],
    complexity: 'O(V + E) · O(V)',
    detail: '<strong>遍历搜索</strong>：DFS 深入优先，用于拓扑排序与强连通；BFS 层序扩散，用于无权图最短路。visited 数组防止死循环。',
    color: '#10b981',
  },
  {
    id: 'union-find',
    icon: '🔗',
    name: '并查集',
    enName: 'Disjoint Set',
    desc: '高效维护不相交集合。路径压缩 + 按秩合并后单次操作均摊接近 O(1)。',
    algos: ['find 路径压缩', 'union 按秩合并', '带权并查集', '判环'],
    complexity: 'O(α(n)) · O(n)',
    detail: '<strong>并查集 (Union-Find)</strong>：维护集合代表元。应用包括动态连通性、二分图判定、Kruskal 算法判环。',
    color: '#3b82f6',
  },
  {
    id: 'mst',
    icon: '🌲',
    name: '最小生成树',
    enName: 'MST',
    desc: '连接全部节点的最小权重边集。Kruskal + Prim 两大经典贪心算法。',
    algos: ['Kruskal (加边)', 'Prim (加点)', 'Boruvka', '次小生成树'],
    complexity: 'O(E log E) / O(E + V log V)',
    detail: '<strong>最小生成树 (MST)</strong>：n 个节点的连通图恰取 n-1 条边。Kruskal 依赖排序+并查集；Prim 依赖优先队列割定理。',
    color: '#a855f7',
  },
  {
    id: 'topological',
    icon: '📋',
    name: '拓扑排序',
    enName: 'Topological Sort',
    desc: '有向无环图 (DAG) 的线性序列，保证每条有向边从前驱指向后继。',
    algos: ['Kahn 算法 (入度削减)', 'DFS 后序逆序', '关键路径 CPM', '拓扑 DP'],
    complexity: 'O(V + E) · O(V)',
    detail: '<strong>拓扑排序</strong>：Kahn 算法基于队列削减入度为 0 节点；若出队节点数 < V 说明存在环路。',
    color: '#eab308',
  },
  {
    id: 'shortest-path',
    icon: '📏',
    name: '最短路径',
    enName: 'Shortest Path',
    desc: '计算两点或全源最小加权路径。单源非负权、负权松弛与全源动态规划。',
    algos: ['Dijkstra', 'Bellman-Ford', 'SPFA', 'Floyd-Warshall', 'A*'],
    complexity: 'Dijkstra: O((V+E)logV) | Floyd: O(V³)',
    detail: '<strong>最短路径</strong>：Dijkstra 堆优化适用于非负权；Bellman-Ford/SPFA 支持负权与负环检测；Floyd 计算全源最短路。',
    color: '#ef4444',
  },
];

export function buildGraphSummarySteps(): GSStep[] {
  const steps: GSStep[] = [];

  const lineOverview: HighlightTarget = { java: 2, cpp: 2, python: 2, javascript: 2 };
  const lineSummaryDone: HighlightTarget = { java: 13, cpp: 13, python: 12, javascript: 13 };

  const lineMap: Record<string, HighlightTarget> = {
    traversal: { java: 4, cpp: 4, python: 4, javascript: 4 },
    'union-find': { java: 6, cpp: 6, python: 6, javascript: 6 },
    mst: { java: 8, cpp: 8, python: 8, javascript: 8 },
    topological: { java: 10, cpp: 10, python: 10, javascript: 10 },
    'shortest-path': { java: 12, cpp: 12, python: 12, javascript: 12 },
  };

  // 1. 全景总览初始步
  steps.push({
    activeCategory: '',
    categories: GS_CATEGORIES,
    detail: null,
    message: '图论核心知识体系全景总览：涵盖遍历搜索、并查集、最小生成树、拓扑排序与最短路径五大支柱。',
    log: '图论全景总览初始化：加载五大领域基石模块',
    codeLine: lineOverview,
    metrics: {
      'metric-gs-domain': '全景总览 (Overview)',
      'metric-gs-status': '全局脉络扫描',
      'metric-gs-algos': '18+ 经典算法全覆盖',
    },
  });

  // 2. 依次深入五大核心支柱
  for (const cat of GS_CATEGORIES) {
    steps.push({
      activeCategory: cat.id,
      categories: GS_CATEGORIES,
      detail: cat.detail,
      message: `聚焦「${cat.name}」(${cat.enName})：包含 ${cat.algos.join('、')}，时空复杂度 ${cat.complexity}。`,
      log: `深入解析 [${cat.name}] 核心机制与典型应用`,
      codeLine: lineMap[cat.id] || lineOverview,
      metrics: {
        'metric-gs-domain': `${cat.icon} ${cat.name}`,
        'metric-gs-status': cat.complexity,
        'metric-gs-algos': cat.algos.slice(0, 3).join(' / '),
      },
    });
  }

  // 3. 终态步：知识体系融会贯通
  steps.push({
    activeCategory: 'done',
    categories: GS_CATEGORIES,
    detail: null,
    message: '图论五大核心领域融会贯通完成！掌握各算法适用边界与时空权衡是攻克图论高难问题的关键。',
    log: '图论知识图谱总览完成：全知识体系构建就绪',
    codeLine: lineSummaryDone,
    metrics: {
      'metric-gs-domain': '🎉 图论体系完备',
      'metric-gs-status': '全图谱贯通',
      'metric-gs-algos': '5 大领域 · 18+ 算法',
    },
  });

  return steps;
}
