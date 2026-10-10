/**
 * 欧拉回路与欧拉路径 (Eulerian Circuit & Path - Hierholzer 算法) 步骤编译器
 * 进阶图论: Hierholzer 深度优先搜索 + 当前弧优化删边 + 死胡同回溯压栈倒序输出 (洛谷 P7771 / LeetCode 332)
 * 提供 100% 纯中文语义日志与四语言代码行号精确联动
 */

export interface EulerianStep {
  curNode: number;
  circuitPath: number[];
  visitedEdges: Array<[number, number]>;
  activeStack: number[];
  activeEdge?: [number, number];
  headArray: number[];
  degArray: number[];
  pathArray: number[];
  activeArray?: 'head' | 'deg' | 'path';
  activeSlot?: number;
  status: 'check' | 'traverse' | 'backtrack' | 'done';
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

export function buildEulerianCircuitSteps(preset: string = 'classic_4node'): EulerianStep[] {
  const steps: EulerianStep[] = [];
  const isTriangle = preset === 'simple_triangle';
  const n = isTriangle ? 3 : 4;

  const edges: Array<[number, number]> = isTriangle
    ? [[1, 2], [2, 3], [3, 1]]
    : [[1, 2], [2, 3], [3, 4], [4, 1]];

  const graph: number[][] = Array.from({ length: n + 1 }, () => []);
  for (const [u, v] of edges) {
    graph[u].push(v);
  }

  const head: number[] = new Array(n + 1).fill(0);
  const inDeg: number[] = new Array(n + 1).fill(0);
  const outDeg: number[] = new Array(n + 1).fill(0);
  for (const [u, v] of edges) {
    outDeg[u]++;
    inDeg[v]++;
  }

  const path: number[] = [];
  const visitedEdges: Array<[number, number]> = [];
  const dfsStack: number[] = [];

  // 精准四语言映射行号字典 (cpp / java / python / javascript)
  const lineMap = {
    solverInit: { cpp: 17, java: 7, python: 6, javascript: 5 },
    allocGraph: { cpp: 17, java: 10, python: 7, javascript: 6 },
    allocHead: { cpp: 17, java: 11, python: 10, javascript: 9 },
    entry: { cpp: 32, java: 28, python: 34, javascript: 34 },
    sortLoop: { cpp: 34, java: 29, python: 36, javascript: 35 },
    sortAction: { cpp: 35, java: 29, python: 37, javascript: 35 },
    startDfsCall: { cpp: 37, java: 30, python: 38, javascript: 36 },
    dfsDef: { cpp: 23, java: 19, python: 26, javascript: 28 },
    whileHead: { cpp: 25, java: 21, python: 28, javascript: 30 },
    popEdge: { cpp: 26, java: 22, python: 29, javascript: 31 },
    recurseDfs: { cpp: 27, java: 23, python: 31, javascript: 32 },
    pushPath: { cpp: 29, java: 25, python: 32, javascript: 34 },
    reversePath: { cpp: 38, java: 31, python: 39, javascript: 37 },
    returnPath: { cpp: 39, java: 32, python: 39, javascript: 38 },
  };

  function makeStep(
    lines: { java: number; cpp: number; python: number; javascript: number },
    message: string,
    log: string,
    status: 'check' | 'traverse' | 'backtrack' | 'done',
    curNode: number,
    activeEdge?: [number, number],
    activeArray?: 'head' | 'deg' | 'path',
    activeSlot?: number,
    finalPath?: number[]
  ): void {
    const currentPath = finalPath || [...path];
    const pathStr = currentPath.length > 0 ? `[${currentPath.join(' ➔ ')}]` : '构建中...';
    const stackStr = dfsStack.length > 0 ? `[${dfsStack.join(', ')}]` : '[]';

    steps.push({
      curNode,
      circuitPath: currentPath,
      visitedEdges: [...visitedEdges],
      activeStack: [...dfsStack],
      activeEdge,
      headArray: [...head],
      degArray: [...outDeg],
      pathArray: [...path],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine: lines.java,
      codeLines: lines,
      metrics: {
        'metric-euler-status': '✓ 度数守恒 (In=Out)',
        'metric-euler-path': pathStr,
        'metric-euler-cur': `节点 ${curNode}`,
        'metric-euler-stack': stackStr,
      },
    });
  }

  // 1. 初始化
  makeStep(lineMap.solverInit, `算法初始化：构造 Hierholzer 求解器，准备在包含 ${n} 个顶点的有向图中寻找欧拉回路。`, `初始化 Hierholzer 求解器与图结构`, 'check', 1);
  makeStep(lineMap.allocGraph, '初始化邻接表：分配图边表，完成各点有向边的装载与出入度统计。', '分配邻接表与图存储结构', 'check', 1);
  makeStep(lineMap.allocHead, '初始化当前弧指针数组：head 数组初始全 0，用于 O(1) 跳过已访问边。', '初始化当前弧优化数组', 'check', 1);

  // 2. 启动入口
  makeStep(lineMap.entry, '调用入口：启动欧拉回路计算流程，确立遍历起始源点 1。', '启动欧拉路径与回路求解', 'check', 1);

  for (let i = 1; i <= n; i++) {
    makeStep(lineMap.sortLoop, `循环检查出边表：遍历节点 ${i} 的邻接表。`, `循环遍历各点邻接表`, 'check', i);
    graph[i].sort((a, b) => a - b);
    makeStep(lineMap.sortAction, `对节点 ${i} 的出边按目标编号排序，确保按最小字典序优先探索。`, `按字典序对各顶点出边进行排序`, 'check', i);
  }

  makeStep(lineMap.startDfsCall, '发起深度优先搜索：从起点 1 开始深度优先遍历所有有向边。', '从起点开始发起深度优先遍历', 'traverse', 1);

  // 3. Hierholzer 递归 DFS
  function dfs(u: number): void {
    makeStep(lineMap.dfsDef, `进入递归函数：当前位于顶点 ${u}。`, `进入当前顶点开始搜索未访问出边`, 'traverse', u);
    dfsStack.push(u);

    while (head[u] < graph[u].length) {
      makeStep(lineMap.whileHead, `当前弧扫描：节点 ${u} 的当前弧指针为 ${head[u]}，总出边数为 ${graph[u].length}。`, `检查当前弧指针是否仍有未遍历边`, 'traverse', u, undefined, 'head', u);

      const v = graph[u][head[u]];
      head[u]++;
      makeStep(lineMap.popEdge, `沿当前弧推进：选取有向边 (${u} ➔ ${v})，当前弧指针递增为 ${head[u]} (实现 O(1) 动态删边)！`, `沿当前弧推进并递增指针删边`, 'traverse', u, [u, v], 'head', u);

      visitedEdges.push([u, v]);

      makeStep(lineMap.recurseDfs, `深入遍历：沿着有向边 (${u} ➔ ${v}) 递归调用深度优先搜索。`, `沿着有向边递归深入邻居节点`, 'traverse', v, [u, v]);
      dfs(v);
    }

    makeStep(lineMap.whileHead, `死胡同无路可走：节点 ${u} 的所有出边均已遍历消耗完毕，开始死胡同回溯！`, `当前点所有出边已消耗，触发死胡同回溯`, 'backtrack', u);

    dfsStack.pop();
    path.push(u);
    makeStep(lineMap.pushPath, `后序压入结果栈：节点 ${u} 出边完全遍历后压入后序栈，当前后序序列: [${path.join(', ')}]。`, `死胡同回溯时压入节点到后序栈`, 'backtrack', u, undefined, 'path', path.length - 1);
  }

  dfs(1);

  makeStep(lineMap.reversePath, '序列逆序反转：将死胡同回溯序列翻转，得到正向一笔画欧拉回路！', '死胡同后序遍历序列逆序反转', 'done', 1, undefined, undefined, undefined, [...path].reverse());

  const finalCircuit = [...path].reverse();
  makeStep(lineMap.returnPath, `输出欧拉回路：最终回路为 [${finalCircuit.join(' ➔ ')}]，每条边恰好且仅经过一次，一笔画闭环构建成功！`, '输出完整一笔画欧拉回路序列', 'done', 1, undefined, undefined, undefined, finalCircuit);

  return steps;
}
