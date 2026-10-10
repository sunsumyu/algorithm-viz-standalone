/**
 * Kruskal 重构树 (Kruskal Reconstruction Tree) 步骤编译器
 * 进阶树论: 边权转化为新节点点权、大根堆性质、瓶颈路径转化为 LCA 点权、子树对应连通块 (洛谷 P4768 / P4197)
 * 提供 100% 纯中文语义日志与四语言代码行号精确联动
 */

export interface KruskalTreeStep {
  curEdge?: { u: number; v: number; w: number };
  newNodeId?: number;
  nodeWeights: Record<number, number>;
  treeEdges: Array<{ u: number; v: number }>;
  activeNodes?: number[];
  queryLCA?: { u: number; v: number; lca: number; val: number };
  fatherArray: number[];
  valArray: number[];
  activeArray?: 'father' | 'val';
  activeSlot?: number;
  status: 'init' | 'sort' | 'merge' | 'skip' | 'tree_done' | 'query' | 'done';
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

export function buildKruskalTreeSteps(preset: string = 'classic_4node'): KruskalTreeStep[] {
  const steps: KruskalTreeStep[] = [];
  const is3Node = preset === 'star_3node';
  const n = is3Node ? 3 : 4;

  const edges: Array<{ u: number; v: number; w: number }> = is3Node
    ? [
        { u: 1, v: 2, w: 3 },
        { u: 2, v: 3, w: 5 },
      ]
    : [
        { u: 1, v: 2, w: 2 },
        { u: 2, v: 3, w: 3 },
        { u: 3, v: 4, w: 4 },
        { u: 1, v: 4, w: 5 },
      ];

  const maxTotalNodes = 2 * n;
  const father: number[] = new Array(maxTotalNodes + 1).fill(0);
  const val: number[] = new Array(maxTotalNodes + 1).fill(0);
  const nodeWeights: Record<number, number> = {};
  const treeEdges: Array<{ u: number; v: number }> = [];

  let nodeCount = n;
  let curEdge: { u: number; v: number; w: number } | undefined = undefined;
  let queryLCA: { u: number; v: number; lca: number; val: number } | undefined = undefined;

  function find(i: number): number {
    if (father[i] !== i) father[i] = find(father[i]);
    return father[i];
  }

  // 精确四语言代码行映射字典 (Java 必须 <= 49)
  const lineMap = {
    initDesc: { cpp: 27, java: 21, python: 16, javascript: 6 },
    allocFather: { cpp: 27, java: 22, python: 19, javascript: 7 },
    allocVal: { cpp: 27, java: 23, python: 20, javascript: 8 },
    allocTree: { cpp: 27, java: 24, python: 21, javascript: 9 },
    initFather: { cpp: 28, java: 26, python: 19, javascript: 7 },
    initNodeCount: { cpp: 27, java: 29, python: 18, javascript: 6 },
    sortEdges: { cpp: 37, java: 30, python: 31, javascript: 18 },
    examineEdge: { cpp: 39, java: 32, python: 32, javascript: 19 },
    findRoots: { cpp: 40, java: 33, python: 33, javascript: 20 },
    skipCycle: { cpp: 41, java: 34, python: 34, javascript: 21 },
    newNode: { cpp: 42, java: 35, python: 35, javascript: 22 },
    assignWeight: { cpp: 43, java: 36, python: 37, javascript: 24 },
    redirectFather: { cpp: 45, java: 38, python: 39, javascript: 26 },
    addTreeEdges: { cpp: 47, java: 40, python: 41, javascript: 28 },
    queryLCA: { cpp: 54, java: 46, python: 46, javascript: 33 },
    done: { cpp: 55, java: 47, python: 46, javascript: 34 },
  };

  function makeStep(
    lines: { java: number; cpp: number; python: number; javascript: number },
    message: string,
    log: string,
    status: 'init' | 'sort' | 'merge' | 'skip' | 'tree_done' | 'query' | 'done',
    newNodeId?: number,
    activeNodes?: number[],
    activeArray?: 'father' | 'val',
    activeSlot?: number
  ): void {
    const rootNode = nodeCount;
    const rootStr = `节点 ${rootNode} (权值: ${val[rootNode] || 0})`;
    const edgeStr = curEdge ? `${curEdge.u}-${curEdge.v} (权值:${curEdge.w})` : '无';
    const lcaStr = queryLCA ? `最近公共祖先(${queryLCA.u}, ${queryLCA.v}) = 节点 ${queryLCA.lca} (瓶颈权: ${queryLCA.val})` : '构建中';

    const phaseStr =
      status === 'done'
        ? '重构树构建完成'
        : status === 'query'
          ? 'LCA 瓶颈路径查询'
          : status === 'merge'
            ? '边权虚点建立'
            : status === 'skip'
              ? '跳过环边'
              : status === 'sort'
                ? '边集升序排序'
                : '初始化并查集';

    steps.push({
      curEdge: curEdge ? { ...curEdge } : undefined,
      newNodeId,
      nodeWeights: { ...nodeWeights },
      treeEdges: treeEdges.map((e) => ({ ...e })),
      activeNodes,
      queryLCA: queryLCA ? { ...queryLCA } : undefined,
      fatherArray: [...father],
      valArray: [...val],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine: lines.java,
      codeLines: lines,
      metrics: {
        'metric-kruskal-root': rootStr,
        'metric-lca-bottleneck': lcaStr,
        'metric-cur-edge': edgeStr,
        'metric-kruskal-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(
    lineMap.initDesc,
    `🚀 [算法初始化] 建立包含 ${n} 个实体节点的网络，准备运行 Kruskal 算法并转化边权构建重构树。`,
    `初始化网络: ${n} 个实体节点`,
    'init'
  );

  makeStep(
    lineMap.allocFather,
    `📊 [分配并查集数组] father = new int[${2 * n + 1}]; 为 2n 个节点分配代表元空间。`,
    '分配 father 数组',
    'init',
    undefined,
    undefined,
    'father'
  );

  makeStep(
    lineMap.allocVal,
    `💎 [分配点权数组] val = new int[${2 * n + 1}]; 记录重构树虚节点的边权转化点权。`,
    '分配 val 数组',
    'init',
    undefined,
    undefined,
    'val'
  );

  makeStep(
    lineMap.allocTree,
    '📐 [分配重构树邻接表] tree = new ArrayList<>(); 准备容纳重构树有向边。',
    '分配 tree 邻接表',
    'init'
  );

  for (let i = 1; i <= n; i++) father[i] = i;
  makeStep(
    lineMap.initFather,
    `📌 [实体点自环初始化] 初始化前 n=${n} 个实体点 father[i] = i，初始代表元为自身。`,
    '初始化实体点并查集',
    'init'
  );

  makeStep(
    lineMap.initNodeCount,
    `🔢 [确立初始节点计数] nodeCount = ${n}；后续每合并一条有效边将新增一个虚节点。`,
    `设定初始节点计数: ${n}`,
    'init'
  );

  // 2. 边权升序排序
  edges.sort((a, b) => a.w - b.w);
  makeStep(
    lineMap.sortEdges,
    `🔤 [边权升序排序] 将图中的边按权值升序排序：[${edges.map((e) => `(${e.u},${e.v},w:${e.w})`).join(', ')}]。`,
    '边权升序排序完成',
    'sort'
  );

  // 3. 逐条考察并构建重构树
  for (const e of edges) {
    curEdge = e;
    makeStep(
      lineMap.examineEdge,
      `🔍 [考察边] 检验边 (${e.u} ➔ ${e.v}, 边权=${e.w})。`,
      `考察边 (${e.u}, ${e.v}, 权值=${e.w})`,
      'merge'
    );

    const fu = find(e.u);
    const fv = find(e.v);
    makeStep(
      lineMap.findRoots,
      `🔎 [查找连通分量] 查找集合代表元: find(${e.u}) = ${fu}, find(${e.v}) = ${fv}。`,
      `查询代表元: fu=${fu}, fv=${fv}`,
      'merge',
      undefined,
      [fu, fv]
    );

    if (fu !== fv) {
      nodeCount++;
      const nc = nodeCount;
      makeStep(
        lineMap.newNode,
        `➕ [新建重构虚点] 分配新虚节点 Node ${nc} 代表边 (${e.u}, ${e.v})！`,
        `新建虚节点 Node ${nc}`,
        'merge',
        nc
      );

      val[nc] = e.w;
      nodeWeights[nc] = e.w;
      makeStep(
        lineMap.assignWeight,
        `💎 [赋予点权] val[${nc}] = ${e.w}；重构树点权满足大根堆单调递增性质！`,
        `赋予虚点点权 val[${nc}]=${e.w}`,
        'merge',
        nc,
        undefined,
        'val',
        nc
      );

      father[nc] = nc;
      father[fu] = nc;
      father[fv] = nc;
      makeStep(
        lineMap.redirectFather,
        `🔗 [代表元重定向] father[${fu}] = ${nc}, father[${fv}] = ${nc}；两子连通块归属新虚点！`,
        `并查集代表元重定向至 ${nc}`,
        'merge',
        nc,
        [fu, fv],
        'father',
        nc
      );

      treeEdges.push({ u: nc, v: fu });
      treeEdges.push({ u: nc, v: fv });
      makeStep(
        lineMap.addTreeEdges,
        `🌲 [添加树边] 虚点 ${nc} 分别连向两子树根 ${fu} 与 ${fv}！`,
        `重构树添加树边 (${nc}➔${fu}), (${nc}➔${fv})`,
        'merge',
        nc
      );
    } else {
      makeStep(
        lineMap.skipCycle,
        `⚪ [环路跳过] 节点 ${e.u} 与 ${e.v} 已在同一连通块 (公共代表元 ${fu})，跳过成环边。`,
        `跳过形成环路的边 (${e.u}, ${e.v})`,
        'skip'
      );
    }
  }

  // 4. 瓶颈路查询定理展示
  const qU = 1;
  const qV = is3Node ? 3 : 4;
  const lcaNode = nodeCount;
  queryLCA = { u: qU, v: qV, lca: lcaNode, val: val[lcaNode] };
  makeStep(
    lineMap.queryLCA,
    `🎯 [LCA 瓶颈路径查询] 询问节点 ${qU} 与 ${qV} 之间的最小瓶颈路：二者在重构树上的 LCA 为节点 ${lcaNode}，点权恰为 ${val[lcaNode]}！`,
    `LCA 瓶颈路径查询: 瓶颈权值 ${val[lcaNode]}`,
    'query'
  );

  // 终态
  makeStep(
    lineMap.done,
    `🎉 [Kruskal 重构树构建完毕] 总共产生 ${nodeCount} 个节点 (${n} 实体点 + ${nodeCount - n} 虚点)，任意两点最大边权等价于重构树 LCA 点权！`,
    'Kruskal 重构树构建完成',
    'done',
    nodeCount
  );

  return steps;
}
