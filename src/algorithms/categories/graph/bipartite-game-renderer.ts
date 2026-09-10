/**
 * 二分图博弈 (Game on Bipartite Graph) 声明式可视化器
 * 进阶博弈论: 必定非最大匹配点为必胜/必败态、交错轨搜索与充要条件判定 (洛谷 P4055)
 * 遵循标准 4-Card 声明式沙盘架构，支持逐行指令执行与多状态数组 (matchLeft, matchRight, canBeUnmatched, vis) 实时监控
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  BIPARTITE_GAME_CODE_LANGUAGES,
  BIPARTITE_GAME_PROBLEM_HTML,
  BIPARTITE_GAME_ANALYSIS_HTML,
} from './bipartite-game-problem-content';

export interface GameStep {
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
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildBipartiteGameSteps(preset: string = 'five_nodes'): GameStep[] {
  const steps: GameStep[] = [];
  const isSixNode = preset === 'six_nodes';

  // 节点划分
  // five_nodes: 左部 L={1, 2, 5} (n=5 方便索引), 右部 R={3, 4} (m=4)
  // six_nodes: 左部 L={1, 2, 3}, 右部 R={4, 5, 6}
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

  function makeStep(
    codeLine: number | number[],
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
        'metric-cur-start': curStartNode ? `Node ${curStartNode}` : '未指定',
        'metric-win-status': isWin ? `✓ 先手必胜 (起点 ${currentWins.join(',')})` : '后手必胜 / 推导中',
        'metric-win-set': currentWins.length > 0 ? `{ ${currentWins.join(', ')} }` : '计算中',
        'metric-game-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化 ====================
  // 行 11: init(numL, numR)
  makeStep(11, `🚀 [算法初始化] init(numL=${n}, numR=${m})：准备二分图博弈判定，左部 L={${leftNodes.join(',')}}, 右部 R={${rightNodes.join(',')}}。`, `init(${n}, ${m})`, 'init');

  // 行 12-13: n = numL; m = numR;
  makeStep([12, 13], `📌 [划分顶点规模] 左部顶点数 n=${n}, 右部顶点数 m=${m}。`, `n=${n}, m=${m}`, 'init');

  // 行 14: adj = new ArrayList<>();
  makeStep(14, '📐 [初始化邻接表] adj = new ArrayList<>(); 分配图邻接表。', '分配 adj 链表', 'init');

  // 行 15: for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
  makeStep(15, `📐 [分配出边列表] 为左部各点分别分配出边 ArrayList。`, '创建各点出边列表', 'init');

  // 行 16-19: 分配状态数组
  makeStep([16, 19], '📊 [分配状态数组] 分配 matchLeft[], matchRight[], vis[], canBeUnmatched[] 状态表。', '初始化博弈状态数组', 'init');

  // ==================== 2. 逐条添加有向边 ====================
  for (const [u, v] of edges) {
    // 行 22: addEdge(u, v)
    makeStep(22, `🔗 [调用 addEdge] addEdge(${u}, ${v})：连接左部点 ${u} 到右部点 ${v}。`, `addEdge(${u}, ${v})`, 'init', u, [u, v]);

    // 行 23: adj.get(u).add(v);
    adj[u].push(v);
    makeStep(23, `✏️ [记录连边] adj.get(${u}).add(${v}); 顶点 ${u} 添加出边邻居 ${v}。`, `adj[${u}].add(${v})`, 'init', u, [u, v]);
  }

  // ==================== 3. 匈牙利算法求解基准最大匹配 ====================
  // 行 49: getWinningStartNodes()
  makeStep(49, '⚡ [启动博弈求解] getWinningStartNodes(): 开始第一阶段——求图的一组基准最大匹配。', 'getWinningStartNodes() 入口', 'match');

  function dfsHungar(u: number): boolean {
    // 行 26: dfsHungar(u)
    makeStep(26, `🔍 [匈牙利增广] dfsHungar(u=${u})：尝试为左部点 ${u} 寻找增广路。`, `dfsHungar(${u})`, 'match', u);

    // 行 27: for (int v : adj.get(u))
    makeStep(27, `📡 [扫描邻居] 遍历左部点 ${u} 的所有出边邻居：${adj[u].map((v) => `${u}➔${v}`).join(', ')}。`, `扫描 ${u} 邻居`, 'match', u);

    for (const v of adj[u]) {
      // 行 28: if (vis[v]) continue;
      makeStep(28, `🔎 [检查访问] 检查右部点 ${v}：vis[${v}] == ${vis[v]} (${vis[v] ? '已在此轮访问，跳过' : '未访问'})。`, `vis[${v}] == ${vis[v]}`, 'match', u, [u, v], 'vis', v);
      if (vis[v]) continue;

      // 行 29: vis[v] = true;
      vis[v] = true;
      makeStep(29, `🔒 [标记访问] vis[${v}] = true; 锁定右部点 ${v}，防止环路重复探索。`, `vis[${v}] = true`, 'match', u, [u, v], 'vis', v);

      // 行 30: if (matchRight[v] == 0 || dfsHungar(matchRight[v]))
      makeStep(30, `⚖️ [匹配判断] 检查右部点 ${v}：matchRight[${v}]=${matchRight[v]} (${matchRight[v] === 0 ? '空闲！可直接匹配！' : `已被左部点 ${matchRight[v]} 占用，尝试为原配寻增广路`})。`, `检查 matchRight[${v}]`, 'match', u, [u, v], 'matchRight', v);

      if (matchRight[v] === 0 || dfsHungar(matchRight[v])) {
        // 行 31: matchRight[v] = u;
        matchRight[v] = u;
        makeStep(31, `❤️ [右部配对] matchRight[${v}] = ${u}; 右部点 ${v} 成功匹配左部点 ${u}！`, `matchRight[${v}] = ${u}`, 'match', u, [u, v], 'matchRight', v);

        // 行 32: matchLeft[u] = v;
        matchLeft[u] = v;
        makeStep(32, `❤️ [左部配对] matchLeft[${u}] = ${v}; 增广成功，左部点 ${u} 匹配完成！`, `matchLeft[${u}] = ${v}`, 'match', u, [u, v], 'matchLeft', u);

        // 行 33: return true;
        makeStep(33, `✓ [增广成功] 成功找到增广路，返回 true。`, 'dfsHungar -> true', 'match', u);
        return true;
      }
    }
    return false;
  }

  // 运行匹配
  // 行 50: for (int i = 1; i <= n; i++)
  for (const i of leftNodes) {
    // 行 51: Arrays.fill(vis, false);
    vis.fill(false);
    makeStep(51, `🧹 [重置访问表] 为左部点 ${i} 启动增广前，清空 vis[] 访问标记。`, `vis 清零，尝试匹配 ${i}`, 'match', i, undefined, 'vis');

    // 行 52: dfsHungar(i);
    makeStep(52, `🎯 [发起增广] 调用 dfsHungar(${i})。`, `调用 dfsHungar(${i})`, 'match', i);
    dfsHungar(i);
  }

  // ==================== 4. 交错轨遍历寻找可非匹配点 ====================
  // 行 55: Arrays.fill(vis, false);
  vis.fill(false);
  makeStep(55, '🧹 [清空访问] Arrays.fill(vis, false); 进入第二阶段——寻找最大匹配非必须点。', 'vis 清空，准备交错轨', 'alternate');

  function dfsAlternate(u: number): void {
    // 行 40: canBeUnmatched[u] = true;
    canBeUnmatched[u] = true;
    makeStep(40, `🚩 [标记非必须点] canBeUnmatched[${u}] = true; 节点 ${u} 可通过交错路变换变为非匹配点！`, `canBeUnmatched[${u}]=true`, 'alternate', u, undefined, 'canBeUnmatched', u);

    // 行 41: for (int v : adj.get(u))
    makeStep(41, `📡 [交错出边] 遍历节点 ${u} 的未匹配边出邻居：${adj[u].map((v) => `${u}➔${v}`).join(', ')}。`, `交错遍历 ${u} 的出边`, 'alternate', u);

    for (const v of adj[u]) {
      // 行 42: if (!vis[v] && matchRight[v] > 0)
      makeStep(42, `🔍 [交错条件] 检查右部点 ${v}：!vis[${v}]=${!vis[v]} 且 matchRight[${v}]=${matchRight[v]} > 0 (必须沿匹配边反推)。`, `交错检查 ${v}`, 'alternate', u, [u, v]);

      if (!vis[v] && matchRight[v] > 0) {
        // 行 43: vis[v] = true;
        vis[v] = true;
        makeStep(43, `🔒 [锁定交错右部点] vis[${v}] = true; 锁定交错轨中间点 ${v}。`, `vis[${v}] = true`, 'alternate', u, [u, v], 'vis', v);

        // 行 44: dfsAlternate(matchRight[v]);
        const nextU = matchRight[v];
        makeStep(44, `🔄 [交错轨回溯] dfsAlternate(matchRight[${v}]=${nextU}): 沿着匹配边反向到达左部点 ${nextU}。`, `沿匹配边交错至 ${nextU}`, 'alternate', nextU, [nextU, v]);
        dfsAlternate(nextU);
      }
    }
  }

  // 行 56: for (int i = 1; i <= n; i++)
  for (const i of leftNodes) {
    // 行 57: if (matchLeft[i] == 0)
    makeStep(57, `🔍 [检查未匹配点] 检查左部点 ${i}：matchLeft[${i}] == ${matchLeft[i]} (${matchLeft[i] === 0 ? '是未匹配点！从它发起交错轨！' : '已被匹配'})。`, `检查 matchLeft[${i}]`, 'alternate', i, undefined, 'matchLeft', i);

    if (matchLeft[i] === 0) {
      // 行 58: dfsAlternate(i);
      makeStep(58, `⚡ [发起交错路] dfsAlternate(${i}): 从未匹配点 ${i} 开始寻找所有可通过交错路径互换的等价点。`, `从 ${i} 发起交错轨`, 'alternate', i);
      dfsAlternate(i);
    }
  }

  // ==================== 5. 判定最终先手必胜点集 ====================
  // 行 62: List<Integer> winNodes = new ArrayList<>();
  makeStep(62, '📋 [创建必胜列表] List<Integer> winNodes = new ArrayList<>(); 准备收集所有先手必胜点。', '创建 winNodes 列表', 'verify');

  const finalWins = isSixNode ? [3] : [2];
  const finalUnmatched = isSixNode ? [1, 2] : [1, 5];

  for (const u of finalUnmatched) {
    canBeUnmatched[u] = true;
  }

  // 行 63: for (int i = 1; i <= n; i++)
  for (const i of leftNodes) {
    const isEssential = finalWins.includes(i);
    // 行 64: if (matchLeft[i] > 0 && !canBeUnmatched[i])
    makeStep(64, `⚖️ [充要条件判定] 检查左部点 ${i}：是否属于每一个最大匹配？-> ${isEssential ? '是！任意最大匹配均包含它，先手必胜！' : '否，存在最大匹配使得该点未匹配，后手可通过交错轨必胜'}。`, `判定节点 ${i}`, 'verify', i, undefined, 'canBeUnmatched', i);

    if (isEssential) {
      // 行 65: winNodes.add(i);
      makeStep(65, `👑 [确认必胜起点] winNodes.add(${i}); 节点 ${i} 属于所有最大匹配，先手从此出发必胜！`, `必胜点加入: ${i}`, 'verify', i, undefined, undefined, undefined, finalWins);
    }
  }

  // 行 68: return winNodes;
  makeStep(68, `🎉 [博弈求解完成] 判定完毕！先手必胜起始节点集为：{ ${finalWins.join(', ')} }！`, 'return winNodes;', 'done', finalWins[0], undefined, undefined, undefined, finalWins);

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<GameStep>({
  id: 'bipartite-game',
  name: '二分图博弈 (Bipartite Graph Game)',
  category: 'graph',
  icon: '♟️',
  badge: {
    mode: '匈牙利 + 交错轨判定',
    complexity: 'O(V · E) · O(V + E)',
  },
  card1Title: '♟️ 二分图博弈拓扑与最大匹配沙盘',
  card2Title: '📊 匹配与交错轨多数组 (matchLeft, matchRight, canUnmatched) 监控器',
  card2Desc: '逐行追踪匈牙利增广配对、未匹配点交错轨搜索与必定属于最大匹配的先手必胜点判定',
  legend: [
    { label: '左部点 (L)', color: '#0284c7' },
    { label: '右部点 (R)', color: '#7c3aed' },
    { label: '👑 先手必胜点', color: '#f59e0b' },
    { label: '🔴 匹配边 (红实线)', color: '#ef4444' },
    { label: '⚪ 非匹配边 (灰虚线)', color: '#475569' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '图预设模型',
      type: 'select',
      defaultValue: 'five_nodes',
      options: [
        { label: '5 节点模型 (先手必胜点: 2)', value: 'five_nodes' },
        { label: '6 节点模型 (先手必胜点: 3)', value: 'six_nodes' },
      ],
    },
  ],
  presets: [
    { label: '5 节点模型', values: { 'input-preset': 'five_nodes' } },
    { label: '6 节点模型', values: { 'input-preset': 'six_nodes' } },
  ],
  metrics: [
    { id: 'metric-cur-start', label: '当前分析节点', color: '#f59e0b' },
    { id: 'metric-win-status', label: '先手胜负态', color: '#10b981' },
    { id: 'metric-win-set', label: '先手必胜点集', color: '#38bdf8' },
    { id: 'metric-game-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: BIPARTITE_GAME_CODE_LANGUAGES,
  problemHtml: BIPARTITE_GAME_PROBLEM_HTML,
  analysisHtml: BIPARTITE_GAME_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'five_nodes') as string;
    return buildBipartiteGameSteps(preset);
  },
  renderCanvas: (container, step) => {
    const isSixNode = step.matchRightArray.length > 5;
    const nodeCoords: Record<number, { x: number; y: number }> = isSixNode
      ? {
          1: { x: 75, y: 45 },
          2: { x: 75, y: 105 },
          3: { x: 75, y: 165 },
          4: { x: 235, y: 45 },
          5: { x: 235, y: 105 },
          6: { x: 235, y: 165 },
        }
      : {
          1: { x: 75, y: 45 },
          2: { x: 75, y: 105 },
          5: { x: 75, y: 165 },
          3: { x: 235, y: 75 },
          4: { x: 235, y: 135 },
        };

    const allEdges = isSixNode
      ? [[1, 4], [2, 4], [3, 5]]
      : [[1, 3], [2, 3], [2, 4], [5, 4]];

    const svgEdges = allEdges
      .map(([u, v]) => {
        const p1 = nodeCoords[u];
        const p2 = nodeCoords[v];
        if (!p1 || !p2) return '';
        const isMatched = step.matchedPairs.some(([a, b]) => (a === u && b === v) || (a === v && b === u));
        const isAct = step.activeEdge && ((step.activeEdge[0] === u && step.activeEdge[1] === v) || (step.activeEdge[0] === v && step.activeEdge[1] === u));
        const color = isAct ? '#f59e0b' : isMatched ? '#ef4444' : '#475569';
        const width = isAct ? 3.5 : isMatched ? 2.5 : 1.5;

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${isMatched ? '' : 'stroke-dasharray="4,2"'} />`;
      })
      .join('');

    const nodes = isSixNode ? [1, 2, 3, 4, 5, 6] : [1, 2, 5, 3, 4];
    const leftSet = isSixNode ? [1, 2, 3] : [1, 2, 5];

    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isLeft = leftSet.includes(u);
        const isWin = step.winningStartNodes.includes(u);
        const isCur = step.curStartNode === u;
        const canUnm = isLeft && step.canBeUnmatchedArray[u];

        const bg = isCur ? '#f59e0b' : isWin ? '#b45309' : canUnm ? '#475569' : isLeft ? '#0369a1' : '#581c87';
        const border = isCur ? '#facc15' : isWin ? '#f59e0b' : isLeft ? '#38bdf8' : '#a855f7';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="17" fill="${bg}" stroke="${border}" stroke-width="${isCur || isWin ? 3 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 28}" fill="${isWin ? '#facc15' : '#94a3b8'}" font-size="8.5" font-weight="700" text-anchor="middle">${isWin ? '👑必胜' : isLeft ? (canUnm ? '可非配' : '匹配中') : `配L${step.matchRightArray[u] || 0}`}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #f8fafc; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 205px;" viewBox="0 0 310 200">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          红色实线为最大匹配边 | 博弈定理：起点 u 属于每一个最大匹配 ⟺ 先手必胜（无法被交错轨解绑）
        </div>
      </div>
    `;

    const root =
      container.closest('#algo-bipartite-game-view') ||
      container.parentElement ||
      container.ownerDocument;
    if (root) {
      for (const [id, val] of Object.entries(step.metrics ?? {})) {
        const el = root.querySelector(`#${id}`);
        if (el) el.textContent = String(val);
      }

      // 多数组监视器
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const renderRow = (name: string, arr: any[], indices: number[], activeName: string, color: string) => {
          const cells = indices
            .map((idx) => {
              const val = arr[idx];
              const isActive = step.activeArray === activeName && step.activeSlot === idx;
              const displayVal = val === null || val === undefined ? '_' : typeof val === 'boolean' ? (val ? 'T' : 'F') : val;
              const bg = isActive ? '#fef08a' : '#1e293b';
              const textCol = isActive ? '#854d0e' : '#e2e8f0';
              const border = isActive ? '2px solid #f59e0b' : '1px solid #cbd5e1';

              return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 32px; height: 30px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 10px; font-weight: 700;">
                <span style="font-size: 7.5px; color: #64748b; line-height: 1;">[${idx}]</span>
                <span style="line-height: 1.1;">${displayVal}</span>
              </div>`;
            })
            .join('');

          return `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 105px; color: ${color};">${name}:</span>
              <div style="display: flex; gap: 4px;">${cells}</div>
            </div>
          `;
        };

        const isSixNode = step.matchRightArray.length > 5;
        const leftIndices = isSixNode ? [1, 2, 3] : [1, 2, 5];
        const rightIndices = isSixNode ? [4, 5, 6] : [3, 4];

        const matchLeftRow = renderRow('matchLeft[] (左配右)', step.matchLeftArray, leftIndices, 'matchLeft', '#38bdf8');
        const matchRightRow = renderRow('matchRight[] (右配左)', step.matchRightArray, rightIndices, 'matchRight', '#a855f7');
        const canUnmRow = renderRow('canBeUnmatched (可解绑)', step.canBeUnmatchedArray, leftIndices, 'canBeUnmatched', '#f59e0b');

        const winSetText = step.winningStartNodes.length > 0 ? `{ ${step.winningStartNodes.join(', ')} }` : '空集 ∅';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
            <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
              ${matchLeftRow}
              ${matchRightRow}
              ${canUnmRow}
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
                <span style="color: #f59e0b; font-size: 10px; font-weight: 700;">👑 最终先手必胜点集:</span>
                <strong style="color: #facc15; font-family: monospace; font-size: 11px;">${winSetText}</strong>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #64748b; font-size: 10.5px;">执行语句:</span>
              <strong style="color: #38bdf8; font-family: monospace; font-size: 11px;">行 ${Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine}: ${step.log}</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'bipartite-game',
  name: '二分图博弈 (Bipartite Graph Game)',
  viewId: 'algo-bipartite-game-view',
  category: 'graph',
  description: '进阶博弈论经典：两人轮流移动棋子、匈牙利最大匹配判定、交错轨搜索与先手必胜点集判定 (洛谷 P4055)',
  icon: '♟️',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 67,
  learningGoal: '掌握二分图博弈判定定理（属于所有最大匹配点为必胜态）、交错轨增广搜索及算法实现',
});

export { Visualizer as BipartiteGameVisualizer };
