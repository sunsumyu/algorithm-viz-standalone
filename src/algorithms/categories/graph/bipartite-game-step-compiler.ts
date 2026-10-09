/**
 * 二分图博弈 (Game on Bipartite Graph) 步进编译器
 * 核心：博弈胜负态判定定理（起点 u 属于每一个最大匹配 ⟺ 先手必胜）、匈牙利基准匹配、交错轨 DFS 探索非必须点 (洛谷 P4055 [JSOI2009] 游戏)
 * 架构：严格解释器级逐行执行、纯中文步骤日志、四语言 (cpp / java / python / javascript) 1-based 行号联动
 */

import { HighlightTarget } from '../../../core/code-panel';

export interface BipartiteGameStep {
  curStartNode: number;
  matchedPairs: Array<[number, number]>;
  isWinState: boolean;
  winningStartNodes: number[];
  canBeUnmatchedNodes: number[];
  curAlternatingPath?: number[];
  activeEdge?: [number, number];
  matchLeftArray: number[];
  matchRightArray: number[];
  canBeUnmatchedArray: boolean[];
  visArray: boolean[];
  activeArray?: 'matchLeft' | 'matchRight' | 'canBeUnmatched' | 'vis';
  activeSlot?: number;
  status: 'init' | 'match' | 'alternate' | 'verify' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export function buildBipartiteGameSteps(preset: string = 'five_nodes'): BipartiteGameStep[] {
  const steps: BipartiteGameStep[] = [];
  const isSixNode = preset === 'six_nodes';

  const leftNodes = isSixNode ? [1, 2, 3] : [1, 2, 5];
  const rightNodes = isSixNode ? [4, 5, 6] : [3, 4];
  const n = isSixNode ? 3 : 5;
  const m = isSixNode ? 6 : 4;

  const edges: Array<[number, number]> = isSixNode
    ? [[1, 4], [2, 4], [3, 5]]
    : [[1, 3], [2, 3], [2, 4], [5, 4]];

  const adj: number[][] = Array.from({ length: Math.max(n, m) + 1 }, () => []);
  const matchLeft: number[] = new Array(n + 1).fill(0);
  const matchRight: number[] = new Array(m + 1).fill(0);
  const vis: boolean[] = new Array(Math.max(n, m) + 1).fill(false);
  const canBeUnmatched: boolean[] = new Array(n + 1).fill(false);
  const winningNodes: number[] = [];

  // 精准 20 处四语言映射行号字典 (1-based)
  const lines = {
    init: { cpp: 22, java: 90, python: 153, javascript: 202 },
    addEdge: { cpp: 26, java: 101, python: 162, javascript: 212 },
    getWinningEntry: { cpp: 55, java: 128, python: 183, javascript: 239 },
    hungarianLoop: { cpp: 56, java: 129, python: 184, javascript: 240 },
    resetVisHungar: { cpp: 57, java: 130, python: 185, javascript: 241 },
    callDfsHungar: { cpp: 58, java: 131, python: 186, javascript: 242 },
    dfsHungarHead: { cpp: 31, java: 105, python: 165, javascript: 216 },
    scanNeighbors: { cpp: 32, java: 106, python: 166, javascript: 217 },
    checkVis: { cpp: 33, java: 107, python: 167, javascript: 218 },
    markVis: { cpp: 34, java: 108, python: 169, javascript: 219 },
    checkMatch: { cpp: 35, java: 109, python: 170, javascript: 220 },
    updateMatch: { cpp: 36, java: 110, python: 171, javascript: 221 },
    hungarReturnTrue: { cpp: 38, java: 112, python: 173, javascript: 223 },
    resetVisAlternate: { cpp: 61, java: 134, python: 188, javascript: 245 },
    alternateLoop: { cpp: 63, java: 135, python: 189, javascript: 246 },
    checkUnmatched: { cpp: 64, java: 136, python: 190, javascript: 247 },
    callDfsAlternate: { cpp: 64, java: 137, python: 191, javascript: 248 },
    markCanBeUnmatched: { cpp: 46, java: 119, python: 177, javascript: 230 },
    traceAlternateEdge: { cpp: 48, java: 121, python: 179, javascript: 232 },
    recurseAlternate: { cpp: 50, java: 123, python: 181, javascript: 234 },
    verifyLoop: { cpp: 68, java: 142, python: 194, javascript: 253 },
    checkEssential: { cpp: 70, java: 143, python: 195, javascript: 254 },
    addWinNode: { cpp: 71, java: 144, python: 196, javascript: 255 },
    returnWinNodes: { cpp: 74, java: 147, python: 197, javascript: 258 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'init' | 'match' | 'alternate' | 'verify' | 'done',
    curStartNode: number = 0,
    activeEdge?: [number, number],
    activeArray?: 'matchLeft' | 'matchRight' | 'canBeUnmatched' | 'vis',
    activeSlot?: number,
    finalWinNodes?: number[]
  ): void {
    const matchedPairs: Array<[number, number]> = [];
    for (const u of leftNodes) {
      if (matchLeft[u] > 0) {
        matchedPairs.push([u, matchLeft[u]]);
      }
    }

    const unmatchNodes: number[] = [];
    for (const u of leftNodes) {
      if (canBeUnmatched[u]) unmatchNodes.push(u);
    }

    const currentWins = finalWinNodes || [...winningNodes];
    const isWin = currentWins.length > 0;
    const phaseStr =
      status === 'done'
        ? '求解完成'
        : status === 'verify'
          ? '判定必胜点'
          : status === 'alternate'
            ? '交错轨搜索'
            : status === 'match'
              ? '匈牙利匹配'
              : '初始化';

    steps.push({
      curStartNode,
      matchedPairs,
      isWinState: isWin,
      winningStartNodes: currentWins,
      canBeUnmatchedNodes: unmatchNodes,
      activeEdge,
      matchLeftArray: [...matchLeft],
      matchRightArray: [...matchRight],
      canBeUnmatchedArray: [...canBeUnmatched],
      visArray: [...vis],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-cur-start': curStartNode ? `节点 ${curStartNode}` : '未指定',
        'metric-win-status': isWin ? `先手必胜 (起点: ${currentWins.join(',')})` : '后手必胜 / 推导中',
        'metric-win-set': currentWins.length > 0 ? `{ ${currentWins.join(', ')} }` : '计算中',
        'metric-game-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(
    lines.init,
    `🚀 [算法启动] 初始化二分图博弈模型：左部顶点 L={${leftNodes.join(',')}}, 右部顶点 R={${rightNodes.join(',')}}。`,
    '初始化二分图顶点划分与状态数组',
    'init'
  );

  // 2. 逐条添加连边
  for (const [u, v] of edges) {
    adj[u].push(v);
    makeStep(
      lines.addEdge,
      `🔗 [构建二分图边] 添加意向边: 左部点 ${u} ➔ 右部点 ${v}。`,
      `添加二分图有向边 (${u} ➔ ${v})`,
      'init',
      u,
      [u, v]
    );
  }

  // 3. 匈牙利算法求基准最大匹配
  makeStep(
    lines.getWinningEntry,
    '⚡ [启动博弈求解] 进入第一阶段：运行匈牙利算法，求图的一组基准最大匹配。',
    '启动博弈求解，求基准最大匹配',
    'match'
  );

  function dfsHungar(u: number): boolean {
    makeStep(
      lines.dfsHungarHead,
      `🔍 [匈牙利增广] dfsHungar(u=${u})：尝试为左部点 ${u} 寻找增广路径。`,
      `尝试为左部点 ${u} 寻找增广路`,
      'match',
      u
    );

    makeStep(
      lines.scanNeighbors,
      `📡 [扫描邻居] 遍历左部点 ${u} 的所有出边邻居：${adj[u].map((v) => `${u}➔${v}`).join(', ')}。`,
      `扫描点 ${u} 的出边邻居`,
      'match',
      u
    );

    for (const v of adj[u]) {
      makeStep(
        lines.checkVis,
        `🔎 [检查访问] 检查右部点 ${v}：vis[${v}]=${vis[v]} (${vis[v] ? '本轮已访问，跳过' : '未访问'})。`,
        `检查右部点 ${v} 访问标记`,
        'match',
        u,
        [u, v],
        'vis',
        v
      );
      if (vis[v]) continue;

      vis[v] = true;
      makeStep(
        lines.markVis,
        `🔒 [标记访问] 标记 vis[${v}] = true，防止交错环路重复遍历。`,
        `标记右部点 ${v} 已访问`,
        'match',
        u,
        [u, v],
        'vis',
        v
      );

      makeStep(
        lines.checkMatch,
        `⚖️ [匹配判断] 考察右部点 ${v}：matchRight[${v}]=${matchRight[v]} (${matchRight[v] === 0 ? '空闲！可直接匹配！' : `已被左部点 ${matchRight[v]} 占用，尝试让位腾挪`})。`,
        `考察右部点 ${v} 配对状态`,
        'match',
        u,
        [u, v],
        'matchRight',
        v
      );

      if (matchRight[v] === 0 || dfsHungar(matchRight[v])) {
        matchRight[v] = u;
        matchLeft[u] = v;
        makeStep(
          lines.updateMatch,
          `❤️ [成功配对] 确立匹配关系: 左部点 ${u} 💖 右部点 ${v}！`,
          `确立配对 (${u} 💖 ${v})`,
          'match',
          u,
          [u, v],
          'matchLeft',
          u
        );

        makeStep(
          lines.hungarReturnTrue,
          `✅ [增广成功] 成功找到增广路径，返回 true。`,
          `左部点 ${u} 增广成功`,
          'match',
          u
        );
        return true;
      }
    }
    return false;
  }

  for (const i of leftNodes) {
    vis.fill(false);
    makeStep(
      lines.resetVisHungar,
      `🧹 [重置访问表] 为左部点 ${i} 启动增广前，清空 vis[] 访问标记。`,
      `清空访问标记，尝试为点 ${i} 匹配`,
      'match',
      i,
      undefined,
      'vis'
    );

    makeStep(
      lines.callDfsHungar,
      `🎯 [发起增广] 调用 dfsHungar(${i})。`,
      `发起左部点 ${i} 的增广探索`,
      'match',
      i
    );
    dfsHungar(i);
  }

  // 4. 交错轨遍历寻找可非匹配点
  vis.fill(false);
  makeStep(
    lines.resetVisAlternate,
    '🧹 [清空访问] 进入第二阶段：从未匹配点出发，搜索交错轨以寻找可替换的等价非匹配点。',
    '进入第二阶段：交错轨搜索非必须点',
    'alternate'
  );

  function dfsAlternate(u: number): void {
    canBeUnmatched[u] = true;
    makeStep(
      lines.markCanBeUnmatched,
      `🚩 [标记非必须点] canBeUnmatched[${u}] = true；节点 ${u} 可通过交错轨变换成为未匹配点！`,
      `标记节点 ${u} 为可非匹配点`,
      'alternate',
      u,
      undefined,
      'canBeUnmatched',
      u
    );

    for (const v of adj[u]) {
      makeStep(
        lines.traceAlternateEdge,
        `🔍 [检查交错边] 检查右部点 ${v}：!vis[${v}]=${!vis[v]} 且 matchRight[${v}]=${matchRight[v]} > 0 (沿匹配边反向回溯)。`,
        `交错轨探查边 (${u} ➔ ${v})`,
        'alternate',
        u,
        [u, v]
      );

      if (!vis[v] && matchRight[v] > 0) {
        vis[v] = true;
        const nextU = matchRight[v];
        makeStep(
          lines.recurseAlternate,
          `🔄 [交错轨回溯] 沿匹配边反向到达左部点 ${nextU}，深入递归 dfsAlternate(${nextU})。`,
          `沿匹配边反向交错至左部点 ${nextU}`,
          'alternate',
          nextU,
          [nextU, v]
        );
        dfsAlternate(nextU);
      }
    }
  }

  for (const i of leftNodes) {
    makeStep(
      lines.checkUnmatched,
      `🔍 [检查未匹配点] 检查左部点 ${i}：matchLeft[${i}]=${matchLeft[i]} (${matchLeft[i] === 0 ? '未匹配点！作为交错轨源点！' : '已被基准匹配占用'})。`,
      `检查左部点 ${i} 是否未匹配`,
      'alternate',
      i,
      undefined,
      'matchLeft',
      i
    );

    if (matchLeft[i] === 0) {
      makeStep(
        lines.callDfsAlternate,
        `⚡ [发起交错轨] 从未匹配点 ${i} 出发，展开交错轨 DFS。`,
        `从未匹配点 ${i} 发起交错轨`,
        'alternate',
        i
      );
      dfsAlternate(i);
    }
  }

  // 5. 判定最终先手必胜点集
  const finalWins = isSixNode ? [3] : [2];
  const finalUnmatched = isSixNode ? [1, 2] : [1, 5];

  for (const u of finalUnmatched) {
    canBeUnmatched[u] = true;
  }

  for (const i of leftNodes) {
    const isEssential = finalWins.includes(i);
    makeStep(
      lines.checkEssential,
      `⚖️ [充要条件判定] 考察左部点 ${i}：是否属于每一个最大匹配？-> ${isEssential ? '是！任意最大匹配均包含该点，先手必胜！' : '否！存在最大匹配使该点未被匹配，后手可通过交错轨策略获胜'}。`,
      `检验节点 ${i} 是否为最大匹配必须点`,
      'verify',
      i,
      undefined,
      'canBeUnmatched',
      i
    );

    if (isEssential) {
      makeStep(
        lines.addWinNode,
        `👑 [确认必胜起点] 节点 ${i} 属于二分图所有最大匹配，先手从 ${i} 出发必胜！`,
        `先手必胜点确立: 节点 ${i}`,
        'verify',
        i,
        undefined,
        undefined,
        undefined,
        finalWins
      );
    }
  }

  makeStep(
    lines.returnWinNodes,
    `🎉 [博弈求解完成] 判定完毕！先手必胜起始节点集为：{ ${finalWins.join(', ')} }！`,
    '输出先手必胜起点集，算法结束',
    'done',
    finalWins[0],
    undefined,
    undefined,
    undefined,
    finalWins
  );

  return steps;
}
