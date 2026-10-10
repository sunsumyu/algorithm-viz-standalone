/**
 * 树分治与点分治 (Tree Centroid Decomposition - 静态点分治 · POJ 1741 / 洛谷 P3806) 步进编译器
 * 进阶树论: 递归寻找子树重心、最大子树不超过 size/2、路径经过重心与子树容斥
 * 遵循 Matt Pocock 深模块规范，保持单一事实来源与纯中文交互日志
 */

export interface StaticCentroidStep {
  curCentroid: number;
  maxSubtreeSize: number;
  subtreeSizes: Record<number, number>;
  visitedNodes: number[];
  activeNodes?: number[];
  pathInfo?: { u: number; v: number; dist: number; isCross: boolean };
  layer: number;
  szArray: number[];
  maxSubtreeArray: number[];
  visArray: boolean[];
  activeArray?: 'sz' | 'maxSubtree' | 'vis';
  activeSlot?: number;
  status: 'init' | 'find_root' | 'calc_path' | 'inclusion_exclusion' | 'isolate' | 'recurse' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildStaticCentroidSteps(preset: string = 'classic_7node'): StaticCentroidStep[] {
  const steps: StaticCentroidStep[] = [];
  const isLine = preset === 'line_5node';
  const n = isLine ? 5 : 7;

  // 树边定义 [u, v, w]
  const edges: Array<[number, number, number]> = isLine
    ? [
        [1, 2, 1],
        [2, 3, 1],
        [3, 4, 1],
        [4, 5, 1],
      ]
    : [
        [1, 2, 2],
        [1, 3, 3],
        [2, 4, 1],
        [2, 5, 2],
        [3, 6, 1],
        [3, 7, 2],
      ];

  const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of edges) {
    adj[u].push({ to: v, w });
    adj[v].push({ to: u, w });
  }

  const sz: number[] = new Array(n + 1).fill(0);
  const maxSubtree: number[] = new Array(n + 1).fill(0);
  const vis: boolean[] = new Array(n + 1).fill(false);
  const visitedNodes: number[] = [];

  let curCentroid = 1;
  let maxSubtreeSize = 0;
  let layer = 1;
  let root = 1;
  let maxPart = Infinity;
  let totalNodes = n;

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'init' | 'find_root' | 'calc_path' | 'inclusion_exclusion' | 'isolate' | 'recurse' | 'done',
    activeNodes?: number[],
    activeArray?: 'sz' | 'maxSubtree' | 'vis',
    activeSlot?: number
  ): void {
    const szRec: Record<number, number> = {};
    for (let i = 1; i <= n; i++) szRec[i] = sz[i];

    const phaseStr =
      status === 'done'
        ? '分治结束'
        : status === 'recurse'
          ? '子块分治递归'
          : status === 'isolate'
            ? '隔离当前重心'
            : status === 'calc_path'
              ? '跨重心路径统计'
              : status === 'find_root'
                ? '寻找树重心'
                : '算法初始化';

    steps.push({
      curCentroid,
      maxSubtreeSize,
      subtreeSizes: szRec,
      visitedNodes: [...visitedNodes],
      activeNodes,
      layer,
      szArray: [...sz],
      maxSubtreeArray: [...maxSubtree],
      visArray: [...vis],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-cur-centroid': `Node ${curCentroid} (层 ${layer})`,
        'metric-max-subtree': `${maxSubtreeSize} ≤ ${Math.floor(totalNodes / 2)}`,
        'metric-path-count': `已分治重心: { ${visitedNodes.join(', ') || '无'} }`,
        'metric-centroid-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化 ====================
  // 行 7: Code01_CentroidDecomposition
  makeStep(7, `🚀 [算法初始化] 建立包含 ${n} 个顶点的树，准备进行树上重心点分治。`, `init(${n})`, 'init');

  // ==================== 2. 寻找树重心 getCentroid ====================
  function getCentroid(u: number, p: number): void {
    // 行 8: sz[u] = 1; maxSubtree[u] = 0;
    sz[u] = 1;
    maxSubtree[u] = 0;
    makeStep(8, `📐 [子树初始化] 探查 Node ${u}: 初始 sz[${u}]=1, maxSubtree[${u}]=0。`, `getCentroid(${u})`, 'find_root', [u], 'sz', u);

    // 行 10: 遍历邻居
    for (const e of adj[u]) {
      const v = e.to;
      if (v !== p && !vis[v]) {
        getCentroid(v, u);
        sz[u] += sz[v];
        maxSubtree[u] = Math.max(maxSubtree[u], sz[v]);
        makeStep(14, `➕ [子树累加] Node ${u} 累加子节点 ${v} (大小 ${sz[v]}) -> sz[${u}]=${sz[u]}, 最大分支 maxSubtree[${u}]=${maxSubtree[u]}。`, `sz[${u}]+=${sz[v]}`, 'find_root', [u], 'maxSubtree', u);
      }
    }

    // 行 18: maxSubtree[u] = Math.max(maxSubtree[u], totalNodes - sz[u]);
    maxSubtree[u] = Math.max(maxSubtree[u], totalNodes - sz[u]);
    makeStep(18, `⚖️ [计算上方断开块] 扣除自身后上方分块大小 totalNodes - sz[${u}] = ${totalNodes - sz[u]}；最终最大割块 maxSubtree[${u}]=${maxSubtree[u]}。`, `maxSubtree[${u}]=${maxSubtree[u]}`, 'find_root', [u], 'maxSubtree', u);

    // 行 19: if (maxSubtree[u] < maxPart)
    if (maxSubtree[u] < maxPart) {
      maxPart = maxSubtree[u];
      root = u;
      makeStep(19, `⭐ [更新候选重心] Node ${u} 最大子树 ${maxPart} <= ${Math.floor(totalNodes / 2)}！选定 Node ${u} 为当前连通块重心！`, `候选重心 -> Node ${u}`, 'find_root', [u]);
    }
  }

  // ==================== 3. 点分治主逻辑 solve ====================
  function solve(u: number, curLayer: number): void {
    layer = curLayer;
    // 行 38: vis[u] = true;
    vis[u] = true;
    visitedNodes.push(u);
    curCentroid = u;
    maxSubtreeSize = maxSubtree[u];
    makeStep(38, `👑 [确立并隔离重心] 在分治第 ${curLayer} 层确立重心 Node ${u}！设置 vis[${u}]=true，切断该点将全树分裂为若干更小子树！`, `确立重心 Node ${u}`, 'isolate', [u], 'vis', u);

    // 行 27: 统计跨重心路径 getDists
    makeStep(27, `📊 [统计跨重心路径] 遍历重心 Node ${u} 的所有子树，收集深度分布并进行容斥统计。`, `统计跨 ${u} 路径`, 'calc_path', [u]);

    // 行 39: 递归子分块
    for (const e of adj[u]) {
      const v = e.to;
      if (!vis[v]) {
        maxPart = Infinity;
        totalNodes = sz[v];
        makeStep(42, `🔁 [分治子分块] 递归处理以 Node ${v} 为入口的连通子树 (规模 ${totalNodes})。`, `准备分治子块 ${v}`, 'recurse', [v]);
        getCentroid(v, 0);
        solve(root, curLayer + 1);
      }
    }
  }

  // 首次运行
  totalNodes = n;
  maxPart = Infinity;
  getCentroid(1, 0);
  solve(root, 1);

  // 终态
  makeStep(49, `🎉 [点分治完成] 所有分治重心已全部递归完毕！遍历重心序列：{ ${visitedNodes.join(', ')} }，树高严格降至 O(log N)！`, '点分治完成', 'done');

  return steps;
}
