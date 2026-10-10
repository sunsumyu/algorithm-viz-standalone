/**
 * 树上差分与子树求和 (Tree Difference · 洛谷 P3128 / P3258) 步进推演编译器
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 进阶树论: 点差分 (diff[u]++, diff[v]++, diff[lca]--, diff[fa[lca]]--) 与 边差分 (diff[u]++, diff[v]++, diff[lca]-=2)
 */

export interface TreeDiffStep {
  mode: 'node' | 'edge';
  diffArray: Record<number, number>;
  recoveredCounts: Record<number, number>;
  depthArray: Record<number, number>;
  activeLca: number;
  activeNode: number;
  activeArray?: 'diff' | 'val' | 'depth';
  activeSlot?: number;
  status: 'init' | 'lca' | 'tag' | 'dfs' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildTreeDifferenceSteps(preset: string = 'node_diff_5node'): TreeDiffStep[] {
  const steps: TreeDiffStep[] = [];
  const isNodeDiff = preset === 'node_diff_5node';
  const mode: 'node' | 'edge' = isNodeDiff ? 'node' : 'edge';
  const n = 5;

  // 经典 5 节点树: 1 为根, 1-2, 1-3, 2-4, 2-5
  const treeEdges: Array<[number, number]> = [
    [1, 2],
    [1, 3],
    [2, 4],
    [2, 5],
  ];

  const adj: number[][] = Array.from({ length: n + 1 }, () => []);
  for (const [u, v] of treeEdges) {
    adj[u].push(v);
    adj[v].push(u);
  }

  const depth: number[] = new Array(n + 1).fill(0);
  const up: number[][] = Array.from({ length: n + 1 }, () => new Array(21).fill(0));
  const diff: number[] = new Array(n + 1).fill(0);
  const val: number[] = new Array(n + 1).fill(0);

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'init' | 'lca' | 'tag' | 'dfs' | 'done',
    activeNode: number = 1,
    activeLca: number = 0,
    activeArray?: 'diff' | 'val' | 'depth',
    activeSlot?: number
  ): void {
    const diffMap: Record<number, number> = {};
    const valMap: Record<number, number> = {};
    const depthMap: Record<number, number> = {};
    for (let i = 1; i <= n; i++) {
      diffMap[i] = diff[i];
      valMap[i] = val[i];
      depthMap[i] = depth[i];
    }

    const formulaStr = isNodeDiff
      ? 'diff[u]++, diff[v]++, diff[lca]--, diff[fa[lca]]--'
      : 'diff[u]++, diff[v]++, diff[lca] -= 2';

    const maxVal = Math.max(...Object.values(valMap));

    const phaseStr =
      status === 'done'
        ? '差分汇总完成'
        : status === 'dfs'
          ? '自底向上求子树和'
          : status === 'tag'
            ? '打差分端点标记'
            : status === 'lca'
              ? 'LCA 最近公共祖先'
              : '树结构初始化';

    steps.push({
      mode,
      diffArray: diffMap,
      recoveredCounts: valMap,
      depthArray: depthMap,
      activeLca,
      activeNode,
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-active-lca': activeLca ? `LCA 节点 ${activeLca}` : '未计算',
        'metric-max-cover': status === 'done' || status === 'dfs' ? `最大覆盖值: ${maxVal}` : '计算中',
        'metric-diff-formula': formulaStr,
        'metric-diff-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化 ====================
  // 行 17: Solver(n)
  makeStep(17, `🚀 [算法初始化] 初始化求解器(n=${n})：准备在 5 节点树上执行${isNodeDiff ? '点差分 (路径 4 ➔ 5 点权 +1)' : '边差分 (路径 4 ➔ 5 边权 +1)'}。`, `初始化求解器(n=${n})`, 'init', 1);

  // 行 20-24: 分配数组
  makeStep([20, 24], '📊 [分配状态数组] 分配 adj, up[][], depth[], diff[], val[] 数组。', '分配状态数组', 'init', 1);

  // 逐条建边
  for (const [u, v] of treeEdges) {
    // 行 27-29: addEdge(u, v)
    makeStep([27, 29], `🔗 [添加树边] addEdge(${u}, ${v})：连接无向边 (${u}, ${v})。`, `添加树边(${u}, ${v})`, 'init', u);
  }

  // ==================== 2. 预处理深度与倍增 LCA ====================
  function dfsLCA(u: number, p: number, d: number): void {
    // 行 33: dfsLCA(u, p, d)
    depth[u] = d;
    up[u][0] = p;
    makeStep([33, 35], `📏 [设置深度与祖先] 节点 ${u}: depth[${u}]=${d}, up[${u}][0]=${p}。`, `设置深度与祖先 depth[${u}]=${d}`, 'init', u, 0, 'depth', u);

    // 行 36: 倍增递推
    for (let i = 1; i <= 4; i++) {
      up[u][i] = up[up[u][i - 1]][i - 1];
    }

    // 行 37: 遍历子树
    for (const v of adj[u]) {
      if (v !== p) {
        dfsLCA(v, u, d + 1);
      }
    }
  }

  dfsLCA(1, 0, 1);

  // ==================== 3. 计算 LCA(4, 5) ====================
  // 行 42: getLCA(u, v)
  makeStep(42, '🎯 [查询 LCA] 调用 getLCA(u=4, v=5)：计算修改路径两端点的最近公共祖先。', '查询最近公共祖先(4, 5)', 'lca', 4);

  // 行 43-51: 倍增得出 LCA
  const lca = 2;
  makeStep([43, 51], `⭐ [锁定 LCA] 倍增求得 4 与 5 的最近公共祖先为节点 2 (LCA=2)！深度为 2。`, '锁定最近公共祖先LCA=2', 'lca', 2, 2);

  // ==================== 4. 打差分标记 ====================
  if (isNodeDiff) {
    // 点差分：addPathNode(4, 5, 1)
    // 行 55: addPathNode(u, v, w)
    makeStep(55, '✏️ [进入点差分] addPathNode(u=4, v=5, w=1)：覆盖路径 4 ➔ 2 ➔ 5 上所有点。', '启动点差分覆盖(4➔2➔5)', 'tag', 4, 2);

    // 行 57: diff[u] += w;
    diff[4] += 1;
    makeStep(57, '➕ [端点打标] diff[4] += 1; 路径起点 4 权值差分 +1。', '起点差分标记 diff[4]+=1', 'tag', 4, 2, 'diff', 4);

    // 行 58: diff[v] += w;
    diff[5] += 1;
    makeStep(58, '➕ [端点打标] diff[5] += 1; 路径终点 5 权值差分 +1。', '终点差分标记 diff[5]+=1', 'tag', 5, 2, 'diff', 5);

    // 行 59: diff[lca] -= w;
    diff[lca] -= 1;
    makeStep(59, `➖ [LCA 抵消] diff[${lca}] -= 1; LCA 节点 2 被两端点重复计入，抵消 1 次。`, `LCA节点抵消 diff[${lca}]-=1`, 'tag', lca, 2, 'diff', lca);

    // 行 60: if (up[lca][0] > 0) diff[up[lca][0]] -= w;
    const faLca = up[lca][0]; // 1
    diff[faLca] -= 1;
    makeStep(60, `➖ [父节点截断] diff[${faLca}] -= 1; 防止子树和继续向上溢出至祖先。`, `父节点截断 diff[${faLca}]-=1`, 'tag', faLca, 2, 'diff', faLca);
  } else {
    // 边差分：addPathEdge(4, 5, 1)
    // 行 64: addPathEdge(u, v, w)
    makeStep(64, '✏️ [进入边差分] addPathEdge(u=4, v=5, w=1)：覆盖路径边 (4,2) 与 (2,5)。', '启动边差分覆盖((4,2), (2,5))', 'tag', 4, 2);

    // 行 66: diff[u] += w;
    diff[4] += 1;
    makeStep(66, '➕ [端点打标] diff[4] += 1; 边 (4, 2) 对应点 4 差分 +1。', '边端点差分标记 diff[4]+=1', 'tag', 4, 2, 'diff', 4);

    // 行 67: diff[v] += w;
    diff[5] += 1;
    makeStep(67, '➕ [端点打标] diff[5] += 1; 边 (5, 2) 对应点 5 差分 +1。', '边端点差分标记 diff[5]+=1', 'tag', 5, 2, 'diff', 5);

    // 行 68: diff[lca] -= 2 * w;
    diff[lca] -= 2;
    makeStep(68, `➖ [LCA 截断] diff[${lca}] -= 2; 两条树边向上汇总至 LCA 节点 2 时在此完全抵消！`, `LCA完全抵消 diff[${lca}]-=2`, 'tag', lca, 2, 'diff', lca);
  }

  // ==================== 5. 自底向上 DFS 子树和汇总 ====================
  // 行 72: dfsSum(1, 0)
  makeStep(72, '⚡ [发起子树求和] dfsSum(u=1, p=0): 从根节点向下递归，并在后序回溯时自底向上汇总差分前缀和！', '启动后序自底向上求和', 'dfs', 1, 2);

  function dfsSum(u: number, p: number): void {
    // 行 73: val[u] = diff[u];
    val[u] = diff[u];
    makeStep(73, `📍 [初始自身差分] val[${u}] = diff[${u}] = ${diff[u]}; 先载入节点自身的差分标记。`, `载入自身差分 val[${u}]=${diff[u]}`, 'dfs', u, 2, 'val', u);

    // 行 74: for (int v : adj.get(u))
    for (const v of adj[u]) {
      // 行 75: if (v != p)
      if (v !== p) {
        // 行 76: dfsSum(v, u);
        dfsSum(v, u);

        // 行 77: val[u] += val[v];
        val[u] += val[v];
        makeStep(77, `➕ [汇总子树和] val[${u}] += val[${v}] (${val[v]}) -> val[${u}] = ${val[u]}; 累加子树贡献。`, `汇总子树和 val[${u}]=${val[u]}`, 'dfs', u, 2, 'val', u);
      }
    }
  }

  dfsSum(1, 0);

  // 行 80: 完成
  makeStep(80, `🎉 [差分还原完成] 自底向上求和完毕！各节点最终还原值：${Array.from({ length: n }, (_, i) => `val[${i + 1}]=${val[i + 1]}`).join(', ')}！`, '树上差分全部完成', 'done', 1, 2);

  return steps;
}
