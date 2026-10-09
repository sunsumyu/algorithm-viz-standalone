/**
 * Tarjan 强连通分量与 DAG 缩点 (Tarjan SCC & DAG Condensation) 步进编译器
 * 进阶图论: 时间戳 dfn[u] 与追溯值 low[u]、栈维护强连通节点、缩点重建 DAG (洛谷 P3387 / 左程云 class066)
 * 架构：严格解释器级全流程逐行高亮执行、纯中文步骤日志、四语言行号映射
 */

import { HighlightTarget } from '../../../core/code-panel';

export interface TarjanSCCStep {
  dfnMap: Record<number, number>;
  lowMap: Record<number, number>;
  sccIdMap: Record<number, number>;
  tarjanStack: number[];
  inStackMap: Record<number, boolean>;
  sccList: Array<number[]>;
  condensedEdges: Array<[number, number]>;
  curNode?: number;
  activeEdge?: [number, number];
  activeArray?: 'dfn' | 'low' | 'sccId' | 'inStack';
  activeSlot?: number;
  status: 'init' | 'dfs' | 'back_edge' | 'pop_scc' | 'condense' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export function buildTarjanSCCSteps(preset: string = 'classic_5node'): TarjanSCCStep[] {
  const steps: TarjanSCCStep[] = [];
  const is5Node = preset === 'classic_5node';
  const n = is5Node ? 5 : 4;

  const allEdges: Array<[number, number]> = is5Node
    ? [[1, 2], [2, 3], [3, 1], [3, 4], [4, 5], [5, 4]]
    : [[1, 2], [2, 3], [3, 1], [3, 4]];

  const graph: number[][] = Array.from({ length: n + 1 }, () => []);
  for (const [u, v] of allEdges) {
    graph[u].push(v);
  }

  let timer = 0;
  let sccCount = 0;
  const dfn: number[] = new Array(n + 1).fill(0);
  const low: number[] = new Array(n + 1).fill(0);
  const sccId: number[] = new Array(n + 1).fill(0);
  const inStack: boolean[] = new Array(n + 1).fill(false);
  const stack: number[] = [];
  const sccList: Array<number[]> = [];
  const condensedEdges: Array<[number, number]> = [];

  // 精准四语言映射行号字典 (cpp / java / python / javascript 1-based)
  const lines = {
    tarjanDef: { cpp: 20, java: 12, python: 10, javascript: 10 },
    stampDfnLow: { cpp: 21, java: 13, python: 13, javascript: 11 },
    pushStack: { cpp: 22, java: 14, python: 14, javascript: 12 },
    setInStack: { cpp: 23, java: 15, python: 15, javascript: 13 },
    loopNeighbors: { cpp: 25, java: 17, python: 17, javascript: 15 },
    checkUnvisited: { cpp: 26, java: 18, python: 18, javascript: 16 },
    recurseDfs: { cpp: 27, java: 19, python: 19, javascript: 17 },
    updateLowTree: { cpp: 28, java: 19, python: 20, javascript: 18 },
    checkInStack: { cpp: 29, java: 21, python: 21, javascript: 19 },
    updateLowBack: { cpp: 30, java: 21, python: 22, javascript: 20 },
    checkSccRoot: { cpp: 35, java: 25, python: 24, javascript: 23 },
    incSccCount: { cpp: 36, java: 26, python: 25, javascript: 24 },
    popLoop: { cpp: 37, java: 27, python: 26, javascript: 25 },
    popNode: { cpp: 38, java: 28, python: 27, javascript: 26 },
    unsetInStack: { cpp: 39, java: 29, python: 28, javascript: 27 },
    setSccId: { cpp: 40, java: 30, python: 29, javascript: 28 },
    breakIfRoot: { cpp: 41, java: 31, python: 30, javascript: 29 },
    buildDagEntry: { cpp: 47, java: 36, python: 39, javascript: 34 },
    dagLoopU: { cpp: 49, java: 39, python: 41, javascript: 35 },
    dagLoopV: { cpp: 50, java: 40, python: 42, javascript: 36 },
    dagCheckCross: { cpp: 51, java: 41, python: 43, javascript: 37 },
    dagAddEdge: { cpp: 52, java: 42, python: 44, javascript: 38 },
    returnDag: { cpp: 56, java: 46, python: 45, javascript: 40 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'init' | 'dfs' | 'back_edge' | 'pop_scc' | 'condense' | 'done',
    curNode?: number,
    activeEdge?: [number, number],
    activeArray?: 'dfn' | 'low' | 'sccId' | 'inStack',
    activeSlot?: number
  ): void {
    const dfnMap: Record<number, number> = {};
    const lowMap: Record<number, number> = {};
    const sccIdMap: Record<number, number> = {};
    const inStackMap: Record<number, boolean> = {};
    for (let i = 1; i <= n; i++) {
      dfnMap[i] = dfn[i];
      lowMap[i] = low[i];
      sccIdMap[i] = sccId[i];
      inStackMap[i] = inStack[i];
    }

    const phaseStr =
      status === 'done'
        ? 'DAG 缩点完成'
        : status === 'condense'
          ? '重构 DAG 边'
          : status === 'pop_scc'
            ? '弹栈结算分量'
            : 'Tarjan DFS 遍历';

    steps.push({
      dfnMap,
      lowMap,
      sccIdMap,
      tarjanStack: [...stack],
      inStackMap,
      sccList: sccList.map((comp) => [...comp]),
      condensedEdges: condensedEdges.map((e) => [...e]),
      curNode,
      activeEdge,
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-scc-count': `${sccCount} 个强连通块`,
        'metric-stack-len': `${stack.length} 个节点在栈`,
        'metric-cur-node': curNode ? `节点 ${curNode}` : '无',
        'metric-tarjan-phase': phaseStr,
      },
    });
  }

  // 1. DFS 遍历与追溯
  function dfs(u: number): void {
    makeStep(lines.tarjanDef, `🚀 [进入 Tarjan DFS] 进入节点 ${u} 的深度优先搜索函数。`, `执行 tarjan(${u}) 深度遍历`, 'dfs', u);

    timer++;
    dfn[u] = timer;
    low[u] = timer;
    makeStep(lines.stampDfnLow, `⏱️ [打上时间戳与追溯值] dfn[${u}] = low[${u}] = ++timer = ${timer}。`, `盖时间戳: dfn[${u}]=${timer}, low[${u}]=${timer}`, 'dfs', u, undefined, 'dfn', u);

    stack.push(u);
    makeStep(lines.pushStack, `📥 [压入辅助栈] stack.push(${u})，当前栈内节点: [${stack.join(', ')}]。`, `节点 ${u} 压入 Tarjan 辅助栈`, 'dfs', u);

    inStack[u] = true;
    makeStep(lines.setInStack, `🏷️ [标记在栈状态] inStack[${u}] = true。`, `标记节点 ${u} 在栈状态 inStack=true`, 'dfs', u, undefined, 'inStack', u);

    for (const v of graph[u]) {
      makeStep(lines.loopNeighbors, `  ↳ [考察出边邻居] 考察有向边 (${u} ➔ ${v})。`, `考察出边邻居 (${u} ➔ ${v})`, 'dfs', u, [u, v]);

      makeStep(lines.checkUnvisited, `  🔎 [检查是否已访问] 节点 ${v} 当前 dfn = ${dfn[v]}。`, `判别邻居 ${v} 访问状态: dfn=${dfn[v]}`, 'dfs', u, [u, v]);

      if (dfn[v] === 0) {
        makeStep(lines.recurseDfs, `  🌲 [递归树边深入] 节点 ${v} 尚未访问，作为树枝深入调用 tarjan(${v})。`, `深入递归树边: tarjan(${v})`, 'dfs', v, [u, v]);
        dfs(v);

        low[u] = Math.min(low[u], low[v]);
        makeStep(lines.updateLowTree, `  🔄 [回溯更新追溯值] 子节点 ${v} 回溯，更新 low[${u}] = min(low[${u}], low[${v}]) = ${low[u]}。`, `树边回溯更新: low[${u}]=min(${low[u]}, low[${v}])`, 'dfs', u, [u, v], 'low', u);
      } else {
        makeStep(lines.checkInStack, `  🔎 [检查在栈返祖边] 节点 ${v} 已访问，检验 inStack[${v}] = ${inStack[v]}。`, `检验返祖边在栈标志: inStack[${v}]=${inStack[v]}`, 'back_edge', u, [u, v]);

        if (inStack[v]) {
          low[u] = Math.min(low[u], dfn[v]);
          makeStep(lines.updateLowBack, `  ⚡ [返祖边形成环路] 节点 ${v} 仍活跃在栈中，形成强连通环路！更新 low[${u}] = min(low[${u}], dfn[${v}]) = ${low[u]}！`, `返祖边闭环更新: low[${u}]=min(${low[u]}, dfn[${v}])`, 'back_edge', u, [u, v], 'low', u);
        }
      }
    }

    makeStep(lines.checkSccRoot, `⚖️ [强连通分量根判定] 检查 low[${u}] == dfn[${u}] (${low[u]} == ${dfn[u]})。`, `检验强连通根: low[${u}]==dfn[${u}] (${low[u]}==${dfn[u]})`, 'dfs', u);

    if (low[u] === dfn[u]) {
      sccCount++;
      makeStep(lines.incSccCount, `🎉 [锁定强连通分量] low[${u}] == dfn[${u}]，节点 ${u} 是一个极大强连通分量的根！sccCount 增至 ${sccCount}！`, `锁定强连通分量 #${sccCount} (根节点 ${u})`, 'pop_scc', u);

      const currentScc: number[] = [];
      makeStep(lines.popLoop, '🔄 [启动连续弹栈循环] 开始连续弹栈直至节点自身，搜集完整强连通分量。', '启动连续弹栈归集分量节点', 'pop_scc', u);

      while (true) {
        const node = stack.pop()!;
        currentScc.push(node);
        makeStep(lines.popNode, `  📤 [弹栈出栈] stack.pop() 弹出节点 ${node}。`, `弹出栈顶节点 ${node}`, 'pop_scc', node);

        inStack[node] = false;
        makeStep(lines.unsetInStack, `  🏷️ [取消在栈标记] inStack[${node}] = false。`, `节点 ${node} 退出辅助栈 (inStack=false)`, 'pop_scc', node, undefined, 'inStack', node);

        sccId[node] = sccCount;
        makeStep(lines.setSccId, `  🏷️ [赋予分量编号] sccId[${node}] = ${sccCount}。`, `节点 ${node} 归属分量 sccId=${sccCount}`, 'pop_scc', node, undefined, 'sccId', node);

        makeStep(lines.breakIfRoot, `  🔎 [判定是否到达根] 检验节点是否为当前根 node == ${u} (${node} == ${u})。`, `检验弹栈终点: node == ${u}`, 'pop_scc', node);
        if (node === u) break;
      }
      sccList.push(currentScc);
      makeStep(lines.popLoop, `✨ [本强连通分量结算完毕] SCC #${sccCount} 包含节点: [${currentScc.join(', ')}]！`, `强连通分量 SCC #${sccCount} 归集完成: [${currentScc.join(', ')}]`, 'pop_scc', u);
    }
  }

  for (let i = 1; i <= n; i++) {
    if (dfn[i] === 0) {
      dfs(i);
    }
  }

  // 2. 缩点建 DAG
  makeStep(lines.buildDagEntry, '🏗️ [开始缩点重构 DAG] 遍历原图的所有有向边，若两端属于不同强连通分量，建立 DAG 跨分量边。', '遍历原图跨分量边重构 DAG', 'condense');

  for (let u = 1; u <= n; u++) {
    makeStep(lines.dagLoopU, `🔁 [缩点外层遍历] 考察起始节点 u = ${u}。`, `缩点外层扫描源点 u=${u}`, 'condense', u);

    for (const v of graph[u]) {
      makeStep(lines.dagLoopV, `  ↳ [缩点考察出边] 考察原图边 (${u} ➔ ${v})，分量对应 sccId[${u}]=${sccId[u]} 与 sccId[${v}]=${sccId[v]}。`, `考察缩点出边 (${u} ➔ ${v})`, 'condense', u, [u, v]);

      makeStep(lines.dagCheckCross, `  🔎 [跨分量判定] 检查两端分量编号 sccId[${u}] != sccId[${v}] (${sccId[u]} != ${sccId[v]})。`, `判定跨分量转移: sccId[${u}] != sccId[${v}]`, 'condense', u, [u, v]);

      if (sccId[u] !== sccId[v]) {
        const fromScc = sccId[u];
        const toScc = sccId[v];
        if (!condensedEdges.some(([fu, fv]) => fu === fromScc && fv === toScc)) {
          condensedEdges.push([fromScc, toScc]);
          makeStep(lines.dagAddEdge, `  🚀 [建立 DAG 缩点边] 发现跨分量转移！新增有向边 SCC #${fromScc} ➔ SCC #${toScc}！`, `新增 DAG 缩点跨分量边: SCC #${fromScc} ➔ SCC #${toScc}`, 'condense', u, [u, v]);
        }
      }
    }
  }

  makeStep(lines.returnDag, `🎉 [DAG 缩点完成] 全图划分为 ${sccCount} 个强连通分量，重构为具备严格拓扑序的有向无环图！`, `Tarjan 强连通缩点全流程完成，输出 DAG 拓扑`, 'done');

  return steps;
}
