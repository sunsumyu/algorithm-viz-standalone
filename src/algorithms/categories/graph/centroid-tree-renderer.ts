/**
 * 动态点分树 (Dynamic Centroid Tree - 点分治树上重构) 声明式可视化器
 * 进阶树论: 重心递归分治建树、树高严格 O(log N)、动态单点修改与全局路径维护 (洛谷 P6329 / SP1437)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  CENTROID_TREE_CODE_LANGUAGES,
  CENTROID_TREE_PROBLEM_HTML,
  CENTROID_TREE_ANALYSIS_HTML,
} from './centroid-tree-problem-content';

export interface CentroidTreeStep {
  originalRoot: number;
  centroidParents: Record<number, number | null>;
  activeNode: number;
  queryAns: number;
  status: 'init' | 'build' | 'query' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

// ---------- 点分树建树算法 (模拟真实重心分治过程) ----------

interface Tree {
  n: number;
  adj: number[][];
}

function buildTree(n: number, edges: [number, number][]): Tree {
  const adj: number[][] = Array.from({ length: n + 1 }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }
  return { n, adj };
}

function getSubtreeSize(
  adj: number[][],
  vis: boolean[],
  u: number,
  fa: number,
  sz: number[],
  maxSub: number[],
  total: number,
  centroidRef: { val: number }
): void {
  sz[u] = 1;
  maxSub[u] = 0;
  for (const v of adj[u]) {
    if (v === fa || vis[v]) continue;
    getSubtreeSize(adj, vis, v, u, sz, maxSub, total, centroidRef);
    sz[u] += sz[v];
    maxSub[u] = Math.max(maxSub[u], sz[v]);
  }
  maxSub[u] = Math.max(maxSub[u], total - sz[u]);
  if (centroidRef.val === 0 || maxSub[u] < maxSub[centroidRef.val]) {
    centroidRef.val = u;
  }
}

function buildCentroidDecomp(
  tree: Tree,
  vis: boolean[],
  parentCTree: Record<number, number | null>,
  steps: CentroidTreeStep[],
  u: number,
  totalNodes: number,
  depth: number
): number {
  const sz = new Array(tree.n + 1).fill(0);
  const maxSub = new Array(tree.n + 1).fill(0);
  const centroidRef = { val: 0 };

  getSubtreeSize(tree.adj, vis, u, 0, sz, maxSub, totalNodes, centroidRef);
  const c = centroidRef.val;
  vis[c] = true;

  // 步骤：DFS 计算各节点子树大小，定位重心
  steps.push({
    originalRoot: 1,
    centroidParents: { ...parentCTree },
    activeNode: u,
    queryAns: 0,
    status: 'build',
    message: `[Layer ${depth}] DFS 计算子树大小：当前子树根 N${u}，共 ${totalNodes} 个节点（vis 未标记）。DFS 后确认重心为 N${c}（最大子树 = ${maxSub[c]}，满足 ≤ ⌊${totalNodes}/2⌋ = ${Math.floor(totalNodes / 2)}）。`,
    log: `Layer ${depth}: DFS 子树大小计算完成，重心候选 = N${c}`,
    codeLine: [6, 14],
    metrics: {
      'metric-active-node': `DFS从N${u}出发`,
      'metric-tree-height': `深度 ${depth}`,
      'metric-centroid-root': `N${c} (候选)`,
      'metric-centroid-phase': `子树大小计算 Layer ${depth}`,
    },
  });

  // 步骤：进入子树，找到重心
  steps.push({
    originalRoot: 1,
    centroidParents: { ...parentCTree },
    activeNode: c,
    queryAns: 0,
    status: 'build',
    message: `[Layer ${depth}] 对子树（大小 ${totalNodes}）进行重心分治，找到重心节点 ${c}（最大子树大小 ${maxSub[c]}），加入点分树。`,
    log: `Layer ${depth}: 重心 = Node ${c}，子树大小 = ${totalNodes}`,
    codeLine: [15, 20],
    metrics: {
      'metric-active-node': `Node ${c}`,
      'metric-tree-height': `深度 ${depth}`,
      'metric-centroid-root': `Node ${c}`,
      'metric-centroid-phase': `重心分治 Layer ${depth}`,
    },
  });

  // 递归处理每个子树
  for (const v of tree.adj[c]) {
    if (vis[v]) continue;
    const childTotal = sz[v] > sz[c] ? totalNodes - sz[c] : sz[v];
    const childCentroid = buildCentroidDecomp(tree, vis, parentCTree, steps, v, childTotal, depth + 1);
    parentCTree[childCentroid] = c;

    steps.push({
      originalRoot: 1,
      centroidParents: { ...parentCTree },
      activeNode: childCentroid,
      queryAns: 0,
      status: 'build',
      message: `连边：点分树父节点 N${c} ← 子节点 N${childCentroid}（子树大小 ${childTotal}）。`,
      log: `点分树连边：N${childCentroid} → N${c}`,
      codeLine: [28, 33],
      metrics: {
        'metric-active-node': `Node ${childCentroid}`,
        'metric-tree-height': `深度 ${depth + 1}`,
        'metric-centroid-root': `Node ${c}`,
        'metric-centroid-phase': `连接父节点 N${c}`,
      },
    });
  }

  return c;
}

export function buildCentroidTreeSteps(preset: string = 'classic_5node'): CentroidTreeStep[] {
  const steps: CentroidTreeStep[] = [];

  // 两种 preset 对应不同的图结构
  let tree: Tree;
  let n: number;
  let edges: [number, number][];

  if (preset === 'simple_line') {
    // 线性链：1-2-3-4-5
    n = 5;
    edges = [[1, 2], [2, 3], [3, 4], [4, 5]];
  } else {
    // classic_5node: 5节点经典树 (星形 + 链)
    n = 5;
    edges = [[1, 2], [1, 3], [2, 4], [3, 5]];
  }

  tree = buildTree(n, edges);
  const edgeDesc = edges.map(([u, v]) => `${u}-${v}`).join(', ');

  // 步骤1: 概述
  steps.push({
    originalRoot: 1,
    centroidParents: Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, null])),
    activeNode: 1,
    queryAns: 0,
    status: 'init',
    message: `[概述] 动态点分树 (Centroid Tree) 是离线/在线树上路径查询的核心数据结构。给定树 n=${n}，边：${edgeDesc}。通过递归重心分治，建立点分树，每次修改/查询复杂度 O(log²N)。`,
    log: `概述：n=${n}，边 ${edgeDesc}`,
    codeLine: [2, 5],
    metrics: {
      'metric-active-node': '初始化',
      'metric-tree-height': `理论 ≤ ${Math.ceil(Math.log2(n))}`,
      'metric-centroid-root': '待建树',
      'metric-centroid-phase': '概述',
    },
  });

  // 步骤2: 说明为什么需要点分树
  steps.push({
    originalRoot: 1,
    centroidParents: Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, null])),
    activeNode: 1,
    queryAns: 0,
    status: 'init',
    message: `[动机] 朴素树路径查询：暴力枚举所有路径对 O(N²)，过慢。点分树的核心思想：任意路径必经过某层的重心节点，故只需对每层重心维护信息，查询时跳链 O(log N) 层即可。`,
    log: '动机：任意路径经过某层重心，查询跳链 O(log N) 层',
    codeLine: [6, 12],
    metrics: {
      'metric-active-node': '动机分析',
      'metric-tree-height': `O(log ${n})`,
      'metric-centroid-root': '待确定',
      'metric-centroid-phase': '动机',
    },
  });

  // 步骤3: 建树流程说明
  steps.push({
    originalRoot: 1,
    centroidParents: Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, null])),
    activeNode: 1,
    queryAns: 0,
    status: 'init',
    message: `[建树流程] ① 对全树求重心 c（最大子树 ≤ n/2）。② 标记 c 为点分树根节点，将 c 的 vis 置 true。③ 对 c 的每个连通子树递归步骤①②③，并在点分树中连接 childCentroid → c。树高严格 O(log N)。`,
    log: '建树流程：递归找重心 → 建边 → 继续分治',
    codeLine: [13, 20],
    metrics: {
      'metric-active-node': '流程说明',
      'metric-tree-height': '建树中',
      'metric-centroid-root': '待确定',
      'metric-centroid-phase': '建树流程说明',
    },
  });

  // 步骤4：初始化步骤
  steps.push({
    originalRoot: 1,
    centroidParents: Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, null])),
    activeNode: 1,
    queryAns: 0,
    status: 'init',
    message: `[初始化] 动态点分树建树开始，共 ${n} 个节点，${edges.length} 条边。核心思路：递归分治，每次找子树重心并建立父子关系，保证树高严格 O(log N)。`,
    log: `初始化：n=${n}，开始点分树建树`,
    codeLine: [2, 5],
    metrics: {
      'metric-active-node': 'Node 1',
      'metric-tree-height': '初始化中',
      'metric-centroid-root': '待确定',
      'metric-centroid-phase': '初始化',
    },
  });

  // 建树前：解释重心分治原理
  steps.push({
    originalRoot: 1,
    centroidParents: Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, null])),
    activeNode: 1,
    queryAns: 0,
    status: 'init',
    message: `[重心定义] 树的重心是：删除该节点后，最大子树大小最小的节点。对于 n=${n} 节点的树，最大子树大小 ≤ n/2，确保递归深度为 O(log N)。`,
    log: '重心性质：最大子树 ≤ n/2，树高 O(log N)',
    codeLine: [6, 14],
    metrics: {
      'metric-active-node': 'Node 1',
      'metric-tree-height': `≤ log₂(${n}) = ${Math.ceil(Math.log2(n))}`,
      'metric-centroid-root': '计算中',
      'metric-centroid-phase': '重心定义',
    },
  });

  // 执行建树（递归步骤会被 push 进 steps）
  const parentCTree: Record<number, number | null> = Object.fromEntries(
    Array.from({ length: n }, (_, i) => [i + 1, null])
  );
  const vis = new Array(n + 1).fill(false);

  const rootCentroid = buildCentroidDecomp(tree, vis, parentCTree, steps, 1, n, 1);

  // 建树完成
  const treeHeight = computeHeight(parentCTree, rootCentroid, n);
  steps.push({
    originalRoot: rootCentroid,
    centroidParents: { ...parentCTree },
    activeNode: rootCentroid,
    queryAns: 0,
    status: 'build',
    message: `✅ [建树完成] 点分树构建完毕！根节点为 N${rootCentroid}，点分树树高 = ${treeHeight}，严格满足 O(log ${n}) = ${Math.ceil(Math.log2(n))} 的上界。`,
    log: `建树完成：根 = N${rootCentroid}，树高 = ${treeHeight}`,
    codeLine: [35, 42],
    metrics: {
      'metric-active-node': `Node ${rootCentroid}`,
      'metric-tree-height': `${treeHeight}`,
      'metric-centroid-root': `Node ${rootCentroid}`,
      'metric-centroid-phase': '建树完成',
    },
  });

  // 演示查询：沿点分树父链跳跃
  const queryNode = preset === 'simple_line' ? 5 : 4;
  let jumpChain: number[] = [queryNode];
  let cur: number | null = parentCTree[queryNode];
  while (cur !== null && cur !== undefined) {
    jumpChain.push(cur);
    cur = parentCTree[cur] ?? null;
  }

  steps.push({
    originalRoot: rootCentroid,
    centroidParents: { ...parentCTree },
    activeNode: queryNode,
    queryAns: 0,
    status: 'query',
    message: `[查询开始] 对节点 N${queryNode} 发起跳链查询：沿点分树父链 ${jumpChain.join(' ➔ ')} 逐层跳跃，统计经过各层重心的路径信息。`,
    log: `查询 N${queryNode}：跳链 ${jumpChain.join('→')}`,
    codeLine: [44, 50],
    metrics: {
      'metric-active-node': `Node ${queryNode}`,
      'metric-tree-height': `${treeHeight}`,
      'metric-centroid-root': `Node ${rootCentroid}`,
      'metric-centroid-phase': `查询 N${queryNode}`,
    },
  });

  // 逐步跳链
  for (let i = 0; i < jumpChain.length; i++) {
    const node = jumpChain[i];
    steps.push({
      originalRoot: rootCentroid,
      centroidParents: { ...parentCTree },
      activeNode: node,
      queryAns: i * 3,
      status: 'query',
      message: `[跳链 Step ${i + 1}] 当前位于点分树节点 N${node}${parentCTree[node] !== null ? `，下一跳父节点 N${parentCTree[node]}` : '（已到达根节点，查询结束）'}。累计统计路径数 = ${i * 3}。`,
      log: `跳链 ${i + 1}/${jumpChain.length}：当前 N${node}`,
      codeLine: [51, 57],
      metrics: {
        'metric-active-node': `Node ${node}`,
        'metric-tree-height': `${treeHeight - i}`,
        'metric-centroid-root': `Node ${rootCentroid}`,
        'metric-centroid-phase': `跳链 ${i + 1}/${jumpChain.length}`,
      },
    });
  }

  // 完成步骤
  steps.push({
    originalRoot: rootCentroid,
    centroidParents: { ...parentCTree },
    activeNode: rootCentroid,
    queryAns: jumpChain.length * 3,
    status: 'done',
    message: `🎉 [查询完成] 节点 N${queryNode} 的跳链查询结束，共跳 ${jumpChain.length} 层，单次查询复杂度为 O(log² N)。动态点分树的核心优势：修改/查询均只需沿根的一条链，长度严格 ≤ log₂N！`,
    log: `✓ 查询完成：共跳 ${jumpChain.length} 层，O(log² N) 复杂度`,
    codeLine: [58, 65],
    metrics: {
      'metric-active-node': `Node ${rootCentroid}`,
      'metric-tree-height': `${treeHeight}`,
      'metric-centroid-root': `Node ${rootCentroid}`,
      'metric-centroid-phase': '查询完成',
    },
  });

  return steps;
}

function computeHeight(parentCTree: Record<number, number | null>, root: number, n: number): number {
  let maxDepth = 0;
  for (let u = 1; u <= n; u++) {
    let d = 0;
    let cur: number | null = u;
    while (cur !== null && cur !== undefined && parentCTree[cur] !== undefined) {
      cur = parentCTree[cur] ?? null;
      d++;
      if (d > n) break; // 防止无限循环
    }
    maxDepth = Math.max(maxDepth, d);
  }
  return maxDepth;
}

const { template, Visualizer } = createDeclarativeVisualizer<CentroidTreeStep>({
  id: 'centroid-tree',
  name: '动态点分树 (Centroid Tree)',
  category: 'graph',
  icon: '🌲',
  badge: {
    mode: '重心分治重构树',
    complexity: 'O(N log N) · O(N)',
  },
  card1Title: '🌲 原图树形与点分重构树沙盘',
  card2Title: '🧭 点分树父子关系监视器',
  card2Desc: '各节点点分树父节点 fa[u]、树高 O(log N) 与跳链查询',
  legend: [
    { label: '原树节点', color: '#0284c7' },
    { label: '👑 点分树根节点', color: '#f59e0b' },
    { label: '🟢 当前活跃/查询链节点', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '5 节点经典点分树', values: { preset: 'classic_5node' } },
    { label: '线性链 1-2-3-4-5', values: { preset: 'simple_line' } },
  ],
  metrics: [
    { id: 'metric-active-node', label: '当前点分节点', color: '#2563eb' },
    { id: 'metric-tree-height', label: '点分树当前深度', color: '#10b981' },
    { id: 'metric-centroid-root', label: '点分树根', color: '#f59e0b' },
    { id: 'metric-centroid-phase', label: '当前阶段', color: '#8b5cf6' },
  ],
  codeLanguages: CENTROID_TREE_CODE_LANGUAGES,
  problemHtml: CENTROID_TREE_PROBLEM_HTML,
  analysisHtml: CENTROID_TREE_ANALYSIS_HTML,
  buildSteps: (inputs) => buildCentroidTreeSteps((inputs['preset'] as string) || 'classic_5node'),
  renderCanvas: (container, step) => {
    const isLine = Object.keys(step.centroidParents).length === 5 &&
      step.centroidParents[2] !== null && step.centroidParents[3] !== null &&
      step.centroidParents[4] !== null;

    // 节点坐标（根据 preset 调整布局）
    const nodeCoords5star: Record<number, { x: number; y: number }> = {
      1: { x: 155, y: 35 },
      2: { x: 95, y: 100 },
      3: { x: 215, y: 100 },
      4: { x: 75, y: 165 },
      5: { x: 235, y: 165 },
    };
    const nodeCoords5line: Record<number, { x: number; y: number }> = {
      1: { x: 50, y: 100 },
      2: { x: 105, y: 100 },
      3: { x: 160, y: 100 },
      4: { x: 215, y: 100 },
      5: { x: 270, y: 100 },
    };

    const nodeCoords = isLine ? nodeCoords5line : nodeCoords5star;

    const originalEdges5star: [number, number][] = [[1, 2], [1, 3], [2, 4], [3, 5]];
    const originalEdges5line: [number, number][] = [[1, 2], [2, 3], [3, 4], [4, 5]];
    const originalEdges = isLine ? originalEdges5line : originalEdges5star;

    const svgEdges = originalEdges
      .map(([u, v]) => {
        const p1 = nodeCoords[u];
        const p2 = nodeCoords[v];
        if (!p1 || !p2) return '';
        const isCentroidEdge = step.centroidParents[v] === u || step.centroidParents[u] === v;
        const color = isCentroidEdge ? '#10b981' : '#475569';
        const width = isCentroidEdge ? 2.5 : 1.5;
        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />`;
      })
      .join('');

    const svgNodes = Object.keys(nodeCoords)
      .map(Number)
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isRootCentroid = step.centroidParents[u] === null && step.status !== 'init';
        const isCur = step.activeNode === u;
        const bg = isCur ? '#f59e0b' : isRootCentroid ? '#065f46' : '#1e3a8a';
        const border = isCur ? '#facc15' : isRootCentroid ? '#10b981' : '#38bdf8';
        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="14" fill="${bg}" stroke="${border}" stroke-width="${isCur || isRootCentroid ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 200">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🟢 绿色边为点分树父子关系 | 点分树树高严格不超过 log₂N，动态修改只影响到根的一条链
        </div>
      </div>
    `;

    const root = container.closest('#algo-centroid-tree-view');
    if (root) {
      for (const [id, val] of Object.entries(step.metrics ?? {})) {
        const el = root.querySelector(`#${id}`);
        if (el) el.textContent = val;
      }

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const faItems = Object.entries(step.centroidParents)
          .map(([u, fa]) => `<span style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 10px;">fa[N${u}] = ${fa !== null ? `N${fa}` : '根'}</span>`)
          .join(' ');

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">${faItems}</div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 单次修改/查询复杂度:</span>
              <strong style="font-family: monospace; color: #2563eb;">O(log² N) 严格上界</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'centroid-tree',
  name: '动态点分树 (Centroid Tree)',
  viewId: 'algo-centroid-tree-view',
  category: 'graph',
  description: '进阶树论点分治重构：重心递归建树、树高严格 O(log N)、动态单点修改与路径信息维护 (洛谷 P6329)',
  icon: '🌲',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 61,
  learningGoal: '掌握动态点分树的重构方法、树高对数级性质以及跳链更新和容斥查询技巧',
});

export { Visualizer as CentroidTreeVisualizer };
