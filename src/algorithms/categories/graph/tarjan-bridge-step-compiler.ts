/**
 * 无向图割点与桥 (Tarjan Cut Vertices & Bridges) 步进编译器
 * 图论经典: 时间戳 dfn[u] 与追溯值 low[u]、割点判定 low[v] >= dfn[u]、桥/割边判定 low[v] > dfn[u] (洛谷 P3388 / 左程云 class068)
 * 架构：严格解释器级全流程逐行高亮执行、纯中文步骤日志、四语言行号映射
 */

import { HighlightTarget } from '../../../core/code-panel';

export interface BridgeStep {
  dfnMap: Record<number, number>;
  lowMap: Record<number, number>;
  cutNodes: number[];
  bridgeEdges: Array<[number, number]>;
  curNode?: number;
  activeEdge?: [number, number];
  activeArray?: 'dfn' | 'low' | 'isCut';
  activeSlot?: number;
  status: 'init' | 'dfs' | 'back_edge' | 'check_bridge' | 'check_cut' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export function buildTarjanBridgeSteps(preset: string = 'classic_5node'): BridgeStep[] {
  const steps: BridgeStep[] = [];
  const is5Node = preset === 'classic_5node';
  const n = is5Node ? 5 : 4;

  const undirectedEdges: Array<[number, number]> = is5Node
    ? [[1, 2], [2, 3], [3, 1], [3, 4], [4, 5]]
    : [[1, 2], [2, 3], [3, 1], [3, 4]];

  const graph: number[][] = Array.from({ length: n + 1 }, () => []);
  for (const [u, v] of undirectedEdges) {
    graph[u].push(v);
    graph[v].push(u);
  }

  let timer = 0;
  const dfn: number[] = new Array(n + 1).fill(0);
  const low: number[] = new Array(n + 1).fill(0);
  const isCut: boolean[] = new Array(n + 1).fill(false);
  const bridges: Array<[number, number]> = [];

  // 精准 22 处四语言映射行号字典 (cpp / java / python / javascript)
  const lines = {
    entry: { cpp: 36, java: 33, python: 5, javascript: 9 },
    initTimer: { cpp: 37, java: 34, python: 6, javascript: 10 },
    initArrays: { cpp: 38, java: 35, python: 7, javascript: 11 },
    outerLoop: { cpp: 42, java: 39, python: 35, javascript: 35 },
    outerCheckDfn: { cpp: 43, java: 40, python: 36, javascript: 36 },
    tarjanEnter: { cpp: 12, java: 12, python: 12, javascript: 16 },
    stampDfnLow: { cpp: 13, java: 13, python: 15, javascript: 17 },
    initChildren: { cpp: 14, java: 14, python: 16, javascript: 18 },
    loopNeighbors: { cpp: 16, java: 16, python: 18, javascript: 20 },
    checkFather: { cpp: 17, java: 17, python: 19, javascript: 21 },
    checkUnvisited: { cpp: 19, java: 19, python: 21, javascript: 22 },
    incChildren: { cpp: 20, java: 20, python: 22, javascript: 23 },
    recurseDfs: { cpp: 21, java: 21, python: 23, javascript: 24 },
    updateLowTree: { cpp: 22, java: 22, python: 24, javascript: 25 },
    checkNonRootCut: { cpp: 25, java: 24, python: 25, javascript: 26 },
    markCutNode: { cpp: 25, java: 24, python: 26, javascript: 26 },
    checkBridge: { cpp: 28, java: 25, python: 27, javascript: 27 },
    markBridge: { cpp: 28, java: 25, python: 28, javascript: 27 },
    updateLowBack: { cpp: 30, java: 27, python: 30, javascript: 29 },
    checkRootCut: { cpp: 33, java: 30, python: 32, javascript: 32 },
    markRootCut: { cpp: 33, java: 30, python: 33, javascript: 32 },
    returnDone: { cpp: 45, java: 42, python: 38, javascript: 38 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'init' | 'dfs' | 'back_edge' | 'check_bridge' | 'check_cut' | 'done',
    curNode?: number,
    activeEdge?: [number, number],
    activeArray?: 'dfn' | 'low' | 'isCut',
    activeSlot?: number
  ): void {
    const dfnMap: Record<number, number> = {};
    const lowMap: Record<number, number> = {};
    const cutNodes: number[] = [];
    for (let i = 1; i <= n; i++) {
      dfnMap[i] = dfn[i];
      lowMap[i] = low[i];
      if (isCut[i]) cutNodes.push(i);
    }

    const phaseStr =
      status === 'done'
        ? '判定完成'
        : status === 'check_bridge'
          ? '割边确认'
          : status === 'check_cut'
            ? '割点判定'
            : status === 'back_edge'
              ? '返祖边更新'
              : 'DFS 深入探索';

    steps.push({
      dfnMap,
      lowMap,
      cutNodes,
      bridgeEdges: bridges.map((e) => [...e]),
      curNode,
      activeEdge,
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-cut-count': `${cutNodes.length} 个`,
        'metric-bridge-count': `${bridges.length} 条`,
        'metric-cur-node': curNode ? `Node ${curNode}` : '就绪',
        'metric-tarjan-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, `🚀 [算法初始化] solve(n=${n})：准备在 ${n} 节点无向连通图中寻找所有割点与桥。`, `进入求解函数 solve(${n})`, 'init');
  makeStep(lines.initTimer, '📌 [重置时间戳] timer = 0; DFS 遍历序号归零。', '重置全局时间戳 timer = 0', 'init');
  makeStep(lines.initArrays, '📊 [分配状态数组] 分配 dfn[1..n], low[1..n], isCut[1..n] 并清空桥列表。', '初始化 dfn、low 与 isCut 状态数组', 'init');

  // 2. Tarjan 递归搜点与判割
  function runTarjan(u: number, father: number): void {
    makeStep(lines.tarjanEnter, `🎯 [进入 tarjan] tarjan(u=${u}, father=${father})：访问节点 ${u}。`, `执行 tarjan(${u}, 父节点=${father})`, 'dfs', u);

    timer++;
    dfn[u] = timer;
    low[u] = timer;
    makeStep(lines.stampDfnLow, `⏱️ [打时间戳] dfn[${u}] = low[${u}] = ++timer = ${timer}; 赋予 DFS 序号。`, `节点 ${u} 盖时间戳 dfn=low=${timer}`, 'dfs', u, undefined, 'dfn', u);

    let children = 0;
    makeStep(lines.initChildren, `👶 [初始化子树计数] int children = 0; 记录 ${u} 在 DFS 生成树中的独立分支数。`, `初始化独立子树分支计数 children = 0`, 'dfs', u);

    for (const v of graph[u]) {
      makeStep(lines.loopNeighbors, `📡 [扫描无向邻居] 考察无向边 (${u}, ${v})。`, `考察无向边 (${u}, ${v})`, 'dfs', u, [u, v]);

      makeStep(lines.checkFather, `🔎 [检查是否为父边] 判别邻居是否为父节点 v == father (${v} == ${father})。`, `检验父边回退: ${v} == ${father}`, 'dfs', u, [u, v]);
      if (v === father) {
        makeStep(lines.checkFather, `↩️ [跳过父边] 邻居 ${v} == father (${father})，防止无向边走原路回退。`, `跳过通往父节点的原路边 (${u}, ${v})`, 'dfs', u, [u, v]);
        continue;
      }

      makeStep(lines.checkUnvisited, `🔎 [检查是否已访问] 节点 ${v} 当前访问状态 dfn = ${dfn[v]}。`, `检验邻居 ${v} 访问时间戳: dfn=${dfn[v]}`, 'dfs', u, [u, v]);

      if (dfn[v] === 0) {
        children++;
        makeStep(lines.incChildren, `👶 [DFS 树分支计数] 节点 ${u} 的独立树边分支数增至 ${children}。`, `独立子树分支计数增加至 children=${children}`, 'dfs', u);

        makeStep(lines.recurseDfs, `🌲 [递归树边深入] 节点 ${v} 尚未访问，作为树边递归调用 tarjan(${v}, ${u})。`, `深入递归树边: tarjan(${v}, ${u})`, 'dfs', v, [u, v]);
        runTarjan(v, u);

        const oldLow = low[u];
        low[u] = Math.min(low[u], low[v]);
        makeStep(lines.updateLowTree, `🔄 [回溯更新追溯值] 从子树 ${v} 回溯至 ${u}: low[${u}] = min(${oldLow}, low[${v}]=${low[v]}) = ${low[u]}。`, `树边回溯更新追溯值: low[${u}]=${low[u]}`, 'dfs', u, [u, v], 'low', u);

        makeStep(lines.checkNonRootCut, `⚖️ [非根割点检验] 检查 father != 0 && low[${v}] >= dfn[${u}] (${father} != 0 && ${low[v]} >= ${dfn[u]})。`, `检验非根割点条件: low[${v}]>=dfn[${u}]`, 'check_cut', u, [u, v]);
        if (father !== 0 && low[v] >= dfn[u]) {
          isCut[u] = true;
          makeStep(lines.markCutNode, `🚩 [发现割点] isCut[${u}] = true; 子树 ${v} 无法绕过 ${u} 连回更早祖先，移除 ${u} 将导致原图不连通！`, `确认割点: 节点 ${u} 标记为割点`, 'check_cut', u, undefined, 'isCut', u);
        }

        makeStep(lines.checkBridge, `⚖️ [割边/桥检验] 检查 low[${v}] > dfn[${u}] (${low[v]} > ${dfn[u]})。`, `检验桥边割裂条件: low[${v}]>dfn[${u}]`, 'check_bridge', u, [u, v]);
        if (low[v] > dfn[u]) {
          const edge: [number, number] = u < v ? [u, v] : [v, u];
          bridges.push(edge);
          makeStep(lines.markBridge, `🌉 [发现桥边] 严格大于成立！边 (${u}, ${v}) 是桥！移除该边将导致图分裂为两个连通分量！`, `确认桥边: 发现割边 (${edge[0]}, ${edge[1]})`, 'check_bridge', u, [u, v]);
        }
      } else {
        const oldLow = low[u];
        low[u] = Math.min(low[u], dfn[v]);
        makeStep(lines.updateLowBack, `⚡ [返祖回边环路] 发现祖先 ${v}: 更新 low[${u}] = min(${oldLow}, dfn[${v}]=${dfn[v]}) = ${low[u]}！`, `返祖回边闭环更新: low[${u}]=${low[u]}`, 'back_edge', u, [u, v], 'low', u);
      }
    }

    makeStep(lines.checkRootCut, `⚖️ [根节点割点检验] 检查 father == 0 && children >= 2 (${father} == 0 && ${children} >= 2)。`, `检验根节点割点条件: children>=2`, 'check_cut', u);
    if (father === 0 && children >= 2) {
      isCut[u] = true;
      makeStep(lines.markRootCut, `🚩 [发现根割点] isCut[${u}] = true; 根节点 ${u} 在 DFS 树中拥有 ${children} 个独立分支，是图的割点！`, `确认根割点: 根节点 ${u} 标记为割点`, 'check_cut', u, undefined, 'isCut', u);
    }
  }

  for (let i = 1; i <= n; i++) {
    makeStep(lines.outerLoop, `🔁 [外层遍历判定] 扫描连通分量源点 i = ${i}。`, `外层循环检查源点 i=${i}`, 'dfs', i);
    makeStep(lines.outerCheckDfn, `🔎 [检查根节点是否访问] dfn[${i}] == 0 (${dfn[i]} == 0)。`, `检查源点 ${i} 访问状态`, 'dfs', i);
    if (dfn[i] === 0) {
      runTarjan(i, 0);
    }
  }

  const cutCount = isCut.filter(Boolean).length;
  makeStep(lines.returnDone, `🎉 [割点与桥判定完成] 找到 ${cutCount} 个割点 [${isCut.map((c, idx) => c ? idx : 0).filter(Boolean).join(', ')}]，${bridges.length} 条桥边！`, '割点与割边判定全流程完成', 'done');

  return steps;
}
