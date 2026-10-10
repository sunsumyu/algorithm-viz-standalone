/**
 * DAG 支配树 (Dominator Tree · 洛谷 P2597) 步骤编译器
 * 进阶图论: DAG 拓扑排序自顶向下、多前驱在支配树上的 LCA 汇聚定理、idom[u] 唯一直接支配点确立
 * 提供 100% 纯中文语义日志与四语言代码行号精确联动
 */

export interface DominatorStep {
  curNode: number;
  idomMap: Record<number, number | null>;
  dominatorTreeEdges: Array<{ u: number; v: number }>;
  topoQueue: number[];
  inDegreeMap: Record<number, number>;
  depthMap: Record<number, number>;
  activeArray?: 'inDegree' | 'idom' | 'depth';
  activeSlot?: number;
  status: 'init' | 'topo' | 'lca' | 'done';
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

export function buildDominatorTreeSteps(preset: string = 'classic_diamond'): DominatorStep[] {
  const steps: DominatorStep[] = [];
  const isLinear = preset === 'linear_bypass';
  const n = 4;
  const root = 1;

  // 有向边定义
  const directedEdges: Array<[number, number]> = isLinear
    ? [
        [1, 2],
        [2, 3],
        [3, 4],
        [1, 4],
      ]
    : [
        [1, 2],
        [1, 3],
        [2, 4],
        [3, 4],
      ];

  const adj: number[][] = Array.from({ length: n + 1 }, () => []);
  const revAdj: number[][] = Array.from({ length: n + 1 }, () => []);
  const inDegree: number[] = new Array(n + 1).fill(0);
  const depth: number[] = new Array(n + 1).fill(0);
  const idom: Array<number | null> = new Array(n + 1).fill(null);
  const up: number[][] = Array.from({ length: n + 1 }, () => new Array(19).fill(0));
  const domTreeEdges: Array<{ u: number; v: number }> = [];
  const q: number[] = [];

  function makeStep(
    lines: { java: number; cpp: number; python: number; javascript: number },
    message: string,
    log: string,
    status: 'init' | 'topo' | 'lca' | 'done',
    curNode: number = root,
    lcaDesc?: string,
    activeArray?: 'inDegree' | 'idom' | 'depth',
    activeSlot?: number
  ): void {
    const idomRecord: Record<number, number | null> = {};
    const inDegRecord: Record<number, number> = {};
    const depthRecord: Record<number, number> = {};
    for (let i = 1; i <= n; i++) {
      idomRecord[i] = idom[i];
      inDegRecord[i] = inDegree[i];
      depthRecord[i] = depth[i];
    }

    const phaseStr =
      status === 'done'
        ? '支配树构建完成'
        : status === 'lca'
          ? '前驱公共祖先 LCA 汇聚'
          : status === 'topo'
            ? '拓扑排序递推推进'
            : '初始化图结构';

    steps.push({
      curNode,
      idomMap: idomRecord,
      dominatorTreeEdges: domTreeEdges.map((e) => ({ ...e })),
      topoQueue: [...q],
      inDegreeMap: inDegRecord,
      depthMap: depthRecord,
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine: lines.java,
      codeLines: lines,
      metrics: {
        'metric-cur-node': `节点 ${curNode}`,
        'metric-dom-lca': lcaDesc || (idom[curNode] ? `直接支配点 idom[${curNode}] = ${idom[curNode]}` : '根节点无需支配点'),
        'metric-dom-edges': `${domTreeEdges.length} 条支配边`,
        'metric-dom-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(
    { java: 17, cpp: 23, python: 10, javascript: 6 },
    `算法初始化：准备在包含 ${n} 个顶点的有向无环图上建立支配树，以节点 ${root} 为源点。`,
    `初始化 DAG 支配树求解器与状态数组`,
    'init'
  );

  makeStep(
    { java: 28, cpp: 24, python: 12, javascript: 8 },
    `分配入度数组 inDegree、支配树深度 depth、直接支配点 idom 以及倍增祖先数组 up。`,
    `分配入度、深度与倍增支配祖先数组`,
    'init'
  );

  // 2. 逐条加边与入度统计
  for (const [u, v] of directedEdges) {
    makeStep(
      { java: 34, cpp: 28, python: 22, javascript: 19 },
      `读取原图有向边：添加边 ${u} ➔ ${v}，更新邻接表与反向依赖。`,
      `录入原图有向边约束`,
      'init',
      u
    );

    adj[u].push(v);
    revAdj[v].push(u);
    inDegree[v]++;
    makeStep(
      { java: 35, cpp: 29, python: 23, javascript: 20 },
      `更新入度与反向依赖：节点 ${v} 入度增至 ${inDegree[v]}，反向邻接表记录其前驱节点 ${u}。`,
      `累加终点入度并维护反向邻接前驱`,
      'init',
      u,
      undefined,
      'inDegree',
      v
    );
  }

  // 3. 支配树倍增 LCA 函数
  function getLCA(u: number, v: number): number {
    if (depth[u] < depth[v]) {
      const t = u;
      u = v;
      v = t;
    }
    for (let i = 18; i >= 0; i--) {
      if (depth[u] - (1 << i) >= depth[v]) {
        u = up[u][i];
      }
    }
    if (u === v) return u;
    for (let i = 18; i >= 0; i--) {
      if (up[u][i] !== up[v][i]) {
        u = up[u][i];
        v = up[v][i];
      }
    }
    return up[u][0];
  }

  // 4. 拓扑排序与支配树构建
  makeStep(
    { java: 52, cpp: 49, python: 40, javascript: 37 },
    `启动支配树拓扑构建：按拓扑顺序自顶向下依次确立各节点的直接支配点。`,
    `启动拓扑排序构建支配树主流程`,
    'topo'
  );

  q.push(root);
  depth[root] = 1;
  makeStep(
    { java: 53, cpp: 51, python: 41, javascript: 38 },
    `根节点入队：源点 ${root} 深度设为 1，根节点不受任何外部节点支配。`,
    `根节点入队并标定支配树深度`,
    'topo',
    root,
    '根节点自身无需计算',
    'depth',
    root
  );

  while (q.length > 0) {
    const u = q.shift()!;
    makeStep(
      { java: 58, cpp: 55, python: 43, javascript: 41 },
      `队首出队：节点 ${u} 拓扑就绪，出队进行直接支配点汇聚计算。`,
      `拓扑队首节点出队准备求取支配点`,
      'topo',
      u
    );

    if (u !== root && revAdj[u].length > 0) {
      makeStep(
        { java: 59, cpp: 58, python: 44, javascript: 42 },
        `前驱集合考察：节点 ${u} 的所有前驱为 { ${revAdj[u].join(', ')} }，将在已建好的支配树上求最近公共祖先 LCA！`,
        `获取节点全部前驱准备汇聚公共祖先`,
        'lca',
        u
      );

      let pLCA = revAdj[u][0];
      makeStep(
        { java: 60, cpp: 60, python: 45, javascript: 43 },
        `初始化前驱祖先：首个前驱为节点 ${pLCA}，初始 LCA 设定为 ${pLCA}。`,
        `设定初始前驱节点为基准祖先`,
        'lca',
        u
      );

      for (let i = 1; i < revAdj[u].length; i++) {
        const pred = revAdj[u][i];
        const oldLCA = pLCA;
        pLCA = getLCA(pLCA, pred);
        makeStep(
          { java: 61, cpp: 62, python: 46, javascript: 44 },
          `迭代合并前驱 LCA：在支配树上计算 LCA(${oldLCA}, ${pred}) = ${pLCA}，求取前驱支配交集。`,
          `在支配树上迭代计算前驱公共祖先`,
          'lca',
          u,
          `前驱 LCA(${oldLCA}, ${pred}) = ${pLCA}`
        );
      }

      idom[u] = pLCA;
      makeStep(
        { java: 64, cpp: 64, python: 48, javascript: 47 },
        `确立直接支配点：节点 ${u} 的唯一直接支配点 idom[${u}] = ${pLCA}！任何到达 ${u} 的路径必须必经 ${pLCA}。`,
        `确立节点唯一直接支配点`,
        'lca',
        u,
        `直接支配点 idom[${u}] = ${pLCA}`,
        'idom',
        u
      );

      domTreeEdges.push({ u: pLCA, v: u });
      makeStep(
        { java: 65, cpp: 65, python: 49, javascript: 48 },
        `添加支配树有向边：在支配树中连接 ${pLCA} ➔ ${u}。`,
        `在支配树中连边确立树形父子层级`,
        'lca',
        u
      );

      depth[u] = depth[pLCA] + 1;
      up[u][0] = pLCA;
      for (let i = 1; i <= 18; i++) {
        up[u][i] = up[up[u][i - 1]][i - 1];
      }
      makeStep(
        { java: 66, cpp: 66, python: 50, javascript: 49 },
        `更新支配树深度：depth[${u}] = ${depth[u]}，倍增祖先数组更新就绪。`,
        `更新支配树节点深度与倍增跳转表`,
        'lca',
        u,
        undefined,
        'depth',
        u
      );
    }

    makeStep(
      { java: 70, cpp: 71, python: 54, javascript: 55 },
      `遍历后继节点：检查从节点 ${u} 出发的所有有向边。`,
      `遍历当前节点的所有出边后继`,
      'topo',
      u
    );

    for (const v of adj[u]) {
      inDegree[v]--;
      makeStep(
        { java: 71, cpp: 71, python: 55, javascript: 56 },
        `后继入度递减：节点 ${v} 入度减为 ${inDegree[v]} (${inDegree[v] === 0 ? '入度归零，加入拓扑队列！' : '仍有前驱未就绪'})。`,
        `后继节点入度减 1 并检查是否可拓扑入队`,
        'topo',
        u,
        undefined,
        'inDegree',
        v
      );
      if (inDegree[v] === 0) {
        q.push(v);
        makeStep(
          { java: 71, cpp: 72, python: 57, javascript: 57 },
          `新节点入队：节点 ${v} 入度归零，进入拓扑队列等待计算支配点。`,
          `入度归零节点进入拓扑排序队列`,
          'topo',
          v
        );
      }
    }
  }

  // 终态
  makeStep(
    { java: 76, cpp: 75, python: 58, javascript: 58 },
    `DAG 支配树构建完成！各节点直接支配点全部确立完毕，支配关系树形拓扑完全就绪！`,
    `DAG 支配树推导与支配关系完全构建完成`,
    'done',
    root
  );

  return steps;
}
