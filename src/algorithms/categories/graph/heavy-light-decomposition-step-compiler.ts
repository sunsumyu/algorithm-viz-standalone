/**
 * 树链剖分与线段树维护 (Heavy-Light Decomposition - HLD) 步骤编译器
 * 进阶树论: 重儿子 size[v] 最大、重链顶点 top[u]、两遍 DFS 连续 DFN 序映射、树上路径转化为 O(log N) 个线段树连续区间 (洛谷 P3384)
 * 提供 100% 纯中文语义日志与四语言代码行号精确联动
 */

export interface HLDStep {
  heavyEdges: Array<[number, number]>;
  topNodes: Record<number, number>;
  dfnSeq: Record<number, number>;
  sizes?: Record<number, number>;
  sons?: Record<number, number>;
  activeNodes?: number[];
  activeEdge?: [number, number];
  pathSegments?: Array<[number, number]>;
  sizeArray: number[];
  sonArray: number[];
  topArray: number[];
  dfnArray: number[];
  activeArray?: 'size' | 'son' | 'top' | 'dfn';
  activeSlot?: number;
  status: 'init' | 'dfs1' | 'dfs2' | 'hld_done' | 'query' | 'done';
  message: string;
  log: string;
  codeLine: number;
  codeLines?: {
    java: number;
    cpp: number;
    python: number;
    javascript: number;
  };
  metrics?: Record<string, string | number>;
}

export function buildHLDSteps(preset: string = 'classic_6node'): HLDStep[] {
  const steps: HLDStep[] = [];
  const isLine = preset === 'line_4node';
  const n = isLine ? 4 : 6;
  const root = 1;

  const edges: Array<[number, number]> = isLine
    ? [
        [1, 2],
        [2, 3],
        [3, 4],
      ]
    : [
        [1, 2],
        [1, 3],
        [2, 4],
        [2, 5],
        [3, 6],
      ];

  const adj: number[][] = Array.from({ length: n + 1 }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }

  const parent: number[] = new Array(n + 1).fill(0);
  const depth: number[] = new Array(n + 1).fill(0);
  const size: number[] = new Array(n + 1).fill(0);
  const son: number[] = new Array(n + 1).fill(0);
  const top: number[] = new Array(n + 1).fill(0);
  const dfn: number[] = new Array(n + 1).fill(0);
  const heavyEdges: Array<[number, number]> = [];
  const pathSegments: Array<[number, number]> = [];

  let timer = 0;

  // 四语言精确代码行号映射字典 (Java 必须 <= 51)
  const lineMap = {
    init: { cpp: 21, java: 11, python: 6, javascript: 6 },
    dfs1Entry: { cpp: 30, java: 12, python: 18, javascript: 15 },
    dfs1SizeAdd: { cpp: 37, java: 18, python: 24, javascript: 21 },
    dfs1HeavySon: { cpp: 39, java: 19, python: 26, javascript: 23 },
    dfs2Entry: { cpp: 47, java: 25, python: 32, javascript: 28 },
    dfs2HeavySon: { cpp: 52, java: 28, python: 36, javascript: 31 },
    dfs2LightSon: { cpp: 55, java: 30, python: 39, javascript: 34 },
    queryStart: { cpp: 61, java: 35, python: 44, javascript: 39 },
    queryJump: { cpp: 65, java: 41, python: 48, javascript: 44 },
    querySameChain: { cpp: 69, java: 47, python: 53, javascript: 49 },
    done: { cpp: 70, java: 48, python: 54, javascript: 50 },
  };

  function makeStep(
    lines: { java: number; cpp: number; python: number; javascript: number },
    message: string,
    log: string,
    status: 'init' | 'dfs1' | 'dfs2' | 'hld_done' | 'query' | 'done',
    activeNodes?: number[],
    activeArray?: 'size' | 'son' | 'top' | 'dfn',
    activeSlot?: number
  ): void {
    const topRec: Record<number, number> = {};
    const dfnRec: Record<number, number> = {};
    const szRec: Record<number, number> = {};
    const sonRec: Record<number, number> = {};
    for (let i = 1; i <= n; i++) {
      topRec[i] = top[i];
      dfnRec[i] = dfn[i];
      szRec[i] = size[i];
      sonRec[i] = son[i];
    }

    const hChainStr = top[4] ? `top[4]=${top[4]}, top[${n}]=${top[n]}` : '剖分构建中';
    const segStr = pathSegments.length > 0 ? `${pathSegments.length} 段 (${JSON.stringify(pathSegments)})` : '待查询';
    const curN = activeNodes && activeNodes.length > 0 ? `节点 ${activeNodes[0]}` : '待定';

    const phaseStr =
      status === 'done'
        ? '剖分完成'
        : status === 'query'
          ? '路径跳跃'
          : status === 'dfs2'
            ? 'DFS2 链头确立'
            : status === 'dfs1'
              ? 'DFS1 统计子树'
              : '算法初始化';

    steps.push({
      heavyEdges: heavyEdges.map(([a, b]) => [a, b]),
      topNodes: topRec,
      dfnSeq: dfnRec,
      sizes: szRec,
      sons: sonRec,
      activeNodes,
      pathSegments: pathSegments.length > 0 ? pathSegments.map(([a, b]) => [a, b]) : undefined,
      sizeArray: [...size],
      sonArray: [...son],
      topArray: [...top],
      dfnArray: [...dfn],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine: lines.java,
      codeLines: lines,
      metrics: {
        'metric-heavy-chain': hChainStr,
        'metric-path-segments': segStr,
        'metric-cur-node': curN,
        'metric-hld-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(
    lineMap.init,
    `🚀 [算法初始化] 建立包含 ${n} 个顶点的树，以 root=${root} 为根，准备进行树链剖分。`,
    `初始化 ${n} 个顶点的树结构`,
    'init',
    [root]
  );

  // 2. DFS1：统计 depth, parent, size 与重儿子 son
  function dfs1(u: number, p: number, d: number): void {
    parent[u] = p;
    depth[u] = d;
    size[u] = 1;
    makeStep(
      lineMap.dfs1Entry,
      `📐 [DFS1 进入节点] 访问节点 ${u}: depth[${u}]=${d}, parent[${u}]=${p}, 初始 size[${u}]=1。`,
      `DFS1 访问节点 ${u}`,
      'dfs1',
      [u],
      'size',
      u
    );

    for (const v of adj[u]) {
      if (v !== p) {
        dfs1(v, u, d + 1);

        size[u] += size[v];
        makeStep(
          lineMap.dfs1SizeAdd,
          `➕ [子树大小累加] 节点 ${u} 累加子树 ${v} 大小 (${size[v]}) -> 当前 size[${u}] = ${size[u]}。`,
          `累加子树大小: size[${u}] += ${size[v]}`,
          'dfs1',
          [u],
          'size',
          u
        );

        if (son[u] === 0 || size[v] > size[son[u]]) {
          son[u] = v;
          makeStep(
            lineMap.dfs1HeavySon,
            `⭐ [确立重儿子] 子树 ${v} 大小为 ${size[v]}，成为节点 ${u} 的当前重儿子 son[${u}] = ${v}！`,
            `确立重儿子: son[${u}] = ${v}`,
            'dfs1',
            [u],
            'son',
            u
          );
        }
      }
    }
  }

  dfs1(root, 0, 1);

  for (let i = 1; i <= n; i++) {
    if (son[i] > 0) {
      heavyEdges.push([i, son[i]]);
    }
  }

  // 3. DFS2：确立重链顶点 top 与连续时间戳 dfn
  function dfs2(u: number, t: number): void {
    top[u] = t;
    dfn[u] = ++timer;
    makeStep(
      lineMap.dfs2Entry,
      `🏷️ [链头与时间戳] 节点 ${u}: 归属重链头 top[${u}] = ${t}，分配连续时间戳 dfn[${u}] = ${dfn[u]}。`,
      `确立链头 top[${u}]=${t}, 分配时间戳 dfn=${timer}`,
      'dfs2',
      [u],
      'top',
      u
    );

    if (son[u] === 0) return;

    makeStep(
      lineMap.dfs2HeavySon,
      `🚀 [重儿子优先连续编排] 沿重链深入重儿子 son[${u}] = ${son[u]}，继承重链头 t = ${t}！`,
      `优先深入重儿子 ${son[u]}`,
      'dfs2',
      [son[u]],
      'top',
      son[u]
    );
    dfs2(son[u], t);

    for (const v of adj[u]) {
      if (v !== parent[u] && v !== son[u]) {
        makeStep(
          lineMap.dfs2LightSon,
          `🍃 [轻儿子开辟新链] 节点 ${v} 是轻儿子，开辟新重链，以其自身为链头 top[${v}] = ${v} 发起遍历！`,
          `轻儿子开辟新链: top[${v}]=${v}`,
          'dfs2',
          [v],
          'top',
          v
        );
        dfs2(v, v);
      }
    }
  }

  dfs2(root, root);

  // 4. 树上路径跳跃 getPathSegments
  const qU = isLine ? 1 : 6;
  const qV = isLine ? 4 : 4;
  makeStep(
    lineMap.queryStart,
    `🧭 [树上路径剖分查询] 查询从节点 ${qU} 到节点 ${qV} 的路径区间映射。`,
    `查询路径映射区间 (${qU} ➔ ${qV})`,
    'query',
    [qU, qV]
  );

  let u = qU;
  let v = qV;

  while (top[u] !== top[v]) {
    if (depth[top[u]] < depth[top[v]]) {
      const tmp = u;
      u = v;
      v = tmp;
    }
    pathSegments.push([dfn[top[u]], dfn[u]]);
    makeStep(
      lineMap.queryJump,
      `🪜 [跃迁重链区间] 收集重链区间 [dfn[top[${u}]], dfn[${u}]] = [${dfn[top[u]]}, ${dfn[u]}]，u 上跳至 parent[top[${u}]] = ${parent[top[u]]}。`,
      `跃迁重链收集区间 [${dfn[top[u]]}, ${dfn[u]}]`,
      'query',
      [u]
    );
    u = parent[top[u]];
  }

  if (depth[u] > depth[v]) {
    const tmp = u;
    u = v;
    v = tmp;
  }
  pathSegments.push([dfn[u], dfn[v]]);
  makeStep(
    lineMap.querySameChain,
    `🎯 [终末同一重链覆盖] u 与 v 汇聚于同一重链，收集连续区间 [dfn[${u}], dfn[${v}]] = [${dfn[u]}, ${dfn[v]}]！`,
    `终末同链收集区间 [${dfn[u]}, ${dfn[v]}]`,
    'query',
    [u, v]
  );

  // 终态
  makeStep(
    lineMap.done,
    `🎉 [树链剖分完成] 树上任意路径被成功转化为不超过 O(log N) 个连续的 DFN 区间集：${JSON.stringify(pathSegments)}！线段树可直接维护！`,
    '树链剖分全流程构建完成',
    'done'
  );

  return steps;
}
