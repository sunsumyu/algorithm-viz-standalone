/**
 * 最近公共祖先 LCA (Binary Lifting LCA - 树上倍增 · 洛谷 P3379) 步进推演编译器
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 核心：深度对齐 depth[u] == depth[v]、二进制倍增同步上跳 up[u][i] != up[v][i]、O(log N) 极速查询
 */

export interface LCAStep {
  nodeU: number;
  nodeV: number;
  curU: number;
  curV: number;
  curPower?: number;
  lcaResult: number | null;
  treeDist?: number;
  activePath?: number[];
  depthArray: number[];
  up0Array: number[];
  up1Array: number[];
  activeArray?: 'depth' | 'up0' | 'up1';
  activeSlot?: number;
  stage: 'init' | 'dfs_up' | 'align' | 'leap' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildLCASteps(preset: string = 'classic_7node'): LCAStep[] {
  const steps: LCAStep[] = [];
  const isFork = preset === 'fork_5node';
  const n = isFork ? 5 : 7;
  const root = 1;

  // 树结构边定义
  // classic_7node: (1,2), (1,3), (2,4), (2,5), (4,6), (3,7) -> 查询 (6, 5), LCA=2, dist=3
  // fork_5node: (1,2), (1,3), (2,4), (3,5) -> 查询 (4, 5), LCA=1, dist=4
  const edges: Array<[number, number]> = isFork
    ? [
        [1, 2],
        [1, 3],
        [2, 4],
        [3, 5],
      ]
    : [
        [1, 2],
        [1, 3],
        [2, 4],
        [2, 5],
        [4, 6],
        [3, 7],
      ];

  const qU = isFork ? 4 : 6;
  const qV = isFork ? 5 : 5;

  const adj: number[][] = Array.from({ length: n + 1 }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }

  const depth: number[] = new Array(n + 1).fill(0);
  const up: number[][] = Array.from({ length: n + 1 }, () => new Array(21).fill(0));

  let curU = qU;
  let curV = qV;
  let curPower: number | undefined = undefined;
  let lcaResult: number | null = null;
  let treeDist: number | undefined = undefined;

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    stage: 'init' | 'dfs_up' | 'align' | 'leap' | 'done',
    activePath?: number[],
    activeArray?: 'depth' | 'up0' | 'up1',
    activeSlot?: number
  ): void {
    const resStr = lcaResult !== null ? `节点 ${lcaResult}` : '计算中...';
    const stateStr = lcaResult !== null ? `LCA = ${lcaResult}` : `u:${curU}, v:${curV}`;

    const phaseStr =
      stage === 'done'
        ? '查询完成'
        : stage === 'leap'
          ? '同步试跳'
          : stage === 'align'
            ? '深度对齐'
            : stage === 'dfs_up'
              ? 'DFS 预处理倍增表'
              : '算法初始化';

    const up0 = up.map((row) => row[0]);
    const up1 = up.map((row) => row[1]);

    steps.push({
      nodeU: qU,
      nodeV: qV,
      curU,
      curV,
      curPower,
      lcaResult,
      treeDist,
      activePath,
      depthArray: [...depth],
      up0Array: up0,
      up1Array: up1,
      activeArray,
      activeSlot,
      stage,
      message,
      log,
      codeLine,
      metrics: {
        'metric-lca-query': `(${qU}, ${qV})`,
        'metric-lca-res': resStr,
        'metric-cur-state': stateStr,
        'metric-lca-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化 ====================
  // 行 7: Code01_LCA_BinaryLifting
  makeStep(7, `🚀 [算法初始化] 建立包含 ${n} 个顶点的树，以 root=${root} 为根。待查询节点对为 (${qU}, ${qV})。`, `初始化(${n}节点树)`, 'init');

  // ==================== 2. DFS 预处理 depth[] 与倍增表 up[][] ====================
  function dfs(u: number, p: number, d: number): void {
    // 行 8: depth[u] = d;
    depth[u] = d;
    makeStep(8, `📏 [记录深度] depth[${u}] = ${d}; 访问节点 ${u}。`, `记录深度 depth[${u}]=${d}`, 'dfs_up', [u], 'depth', u);

    // 行 9: up[u][0] = p;
    up[u][0] = p;
    makeStep(9, `👆 [直系父节点] up[${u}][0] = ${p} (向上跳 2^0=1 步到达父节点)。`, `记录直系父节点 up[${u}][0]=${p}`, 'dfs_up', [u, p], 'up0', u);

    // 行 10-11: 倍增递推 up[u][i] = up[up[u][i-1]][i-1]
    for (let i = 1; i <= 3; i++) {
      up[u][i] = up[up[u][i - 1]][i - 1];
    }
    if (up[u][1] > 0) {
      makeStep(11, `🚀 [递推倍增祖先] up[${u}][1] = up[up[${u}][0]][0] = ${up[u][1]} (向上跳 2^1=2 步)。`, `倍增祖先递推 up[${u}][1]=${up[u][1]}`, 'dfs_up', [u, up[u][1]], 'up1', u);
    }

    for (const v of adj[u]) {
      if (v !== p) {
        dfs(v, u, d + 1);
      }
    }
  }

  dfs(root, 0, 1);

  // ==================== 3. 求解 LCA ====================
  // 行 18: getLCA(u, v)
  makeStep(18, `🧭 [启动倍增查询] getLCA(${qU}, ${qV}): 两阶段求解——阶段一深度对齐，阶段二二进制同步跃升。`, `启动倍增查询(${qU}, ${qV})`, 'align');

  // 行 19: if (depth[u] < depth[v]) swap
  if (depth[curU] < depth[curV]) {
    const t = curU;
    curU = curV;
    curV = t;
    makeStep(19, `🔄 [确保 u 更深] 交换变量使得 depth[u=${curU}] >= depth[v=${curV}]。`, `交换使u更深(u=${curU}, v=${curV})`, 'align');
  }

  // 行 20-22: 阶段一：深度对齐
  for (let i = 3; i >= 0; i--) {
    if (depth[curU] - (1 << i) >= depth[curV]) {
      curPower = i;
      const nextU = up[curU][i];
      makeStep(21, `🪜 [深度对齐跃升] depth[${curU}] - 2^${i} >= depth[${curV}] (${depth[curU] - (1 << i)} >= ${depth[curV]})：u 从 ${curU} 向上跳到 ${nextU}。`, `u跃升2^${i}步至${nextU}`, 'align', [curU, nextU]);
      curU = nextU;
    }
  }

  makeStep(20, `🎯 [深度对齐完毕] 此时 u 与 v 深度完全对齐：depth[${curU}]=${depth[curU]}, depth[${curV}]=${depth[curV]}。`, '深度对齐完毕', 'align');

  // 行 23: if (u == v) return u;
  if (curU === curV) {
    lcaResult = curU;
    makeStep(23, `👑 [直接相遇] u == v == ${curU}！二者已在同一节点相遇，LCA 判定完毕！`, `直接相遇确定LCA=${curU}`, 'done');
  } else {
    // 行 24-29: 阶段二：同步倍增试跳
    makeStep(24, `⚡ [启动同步跃升] u=${curU} 与 v=${curV} 深度相同但不同点，从大到小尝试二进制步长 2^i 跃升。`, '启动二进制同步试跳', 'leap');

    for (let i = 3; i >= 0; i--) {
      curPower = i;
      if (up[curU][i] !== up[curV][i]) {
        const nextU = up[curU][i];
        const nextV = up[curV][i];
        makeStep(26, `🚀 [同步向上跃升] up[${curU}][${i}] (${nextU}) != up[${curV}][${i}] (${nextV})：未跨过 LCA，u 跃升至 ${nextU}，v 跃升至 ${nextV}！`, `同步跃升2^${i}步至(${nextU}, ${nextV})`, 'leap', [nextU, nextV]);
        curU = nextU;
        curV = nextV;
      } else {
        makeStep(25, `⚠️ [尝试跨过 LCA] 若跳 2^${i} 步将到达相同祖先 ${up[curU][i]} (可能越过 LCA)，保持当前位置不跳。`, `步长2^${i}已跨过LCA放弃`, 'leap');
      }
    }

    // 行 30: return up[u][0];
    lcaResult = up[curU][0];
    makeStep(30, `👑 [停在 LCA 正下方] 当前 u=${curU}, v=${curV} 位于 LCA 的两个不同分支正下方！其共同父亲 up[u][0] = ${lcaResult} 即为所求 LCA！`, `停于LCA正下方确定LCA=${lcaResult}`, 'done');
  }

  // ==================== 4. 计算树上两点距离 ====================
  // 行 33-35: getDist
  treeDist = depth[qU] + depth[qV] - 2 * depth[lcaResult];
  makeStep(35, `📏 [树上两点距离] dist(${qU}, ${qV}) = depth[${qU}] (${depth[qU]}) + depth[${qV}] (${depth[qV]}) - 2 * depth[${lcaResult}] (${2 * depth[lcaResult]}) = ${treeDist}！`, `计算树上两点距离=${treeDist}`, 'done');

  return steps;
}
