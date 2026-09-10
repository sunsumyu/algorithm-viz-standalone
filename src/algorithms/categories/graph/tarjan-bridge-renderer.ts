/**
 * 无向图割点与桥 (Tarjan Cut Vertices & Bridges) 声明式可视化器
 * 图论经典: 时间戳 dfn[u] 与追溯值 low[u]、割点判定 low[v] >= dfn[u]、桥/割边判定 low[v] > dfn[u] (洛谷 P3388)
 * 深度架构重构：严格解释器级全流程逐行高亮执行（DFS递归、父边跳过、树边深入、割点与桥判定、返祖边环路更新均发射独立Step）、四语言行号映射
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TARJAN_BRIDGE_CODE_LANGUAGES,
  TARJAN_BRIDGE_PROBLEM_HTML,
  TARJAN_BRIDGE_ANALYSIS_HTML,
} from './tarjan-bridge-problem-content';
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
  makeStep(lines.entry, `🚀 [算法初始化] solve(n=${n})：准备在 ${n} 节点无向连通图中寻找所有割点与桥。`, `solve(${n})`, 'init');
  makeStep(lines.initTimer, '📌 [重置时间戳] timer = 0; DFS 遍历序号归零。', 'timer = 0', 'init');
  makeStep(lines.initArrays, '📊 [分配状态数组] 分配 dfn[1..n], low[1..n], isCut[1..n] 并清空桥列表。', '分配状态数组', 'init');

  // 2. Tarjan 递归搜点与判割
  function runTarjan(u: number, father: number): void {
    makeStep(lines.tarjanEnter, `🎯 [进入 tarjan] tarjan(u=${u}, father=${father})：访问节点 ${u}。`, `tarjan(${u}, ${father})`, 'dfs', u);

    timer++;
    dfn[u] = timer;
    low[u] = timer;
    makeStep(lines.stampDfnLow, `⏱️ [打时间戳] dfn[${u}] = low[${u}] = ++timer = ${timer}; 赋予 DFS 序号。`, `dfn[${u}]=low[${u}]=${timer}`, 'dfs', u, undefined, 'dfn', u);

    let children = 0;
    makeStep(lines.initChildren, `👶 [初始化子树计数] int children = 0; 记录 ${u} 在 DFS 生成树中的独立分支数。`, 'children = 0', 'dfs', u);

    for (const v of graph[u]) {
      makeStep(lines.loopNeighbors, `📡 [扫描无向邻居] for (int v : graph[${u}]) -> 考察边 (${u}, ${v})。`, `visit (${u}, ${v})`, 'dfs', u, [u, v]);

      makeStep(lines.checkFather, `🔎 [检查是否为父边] if (v == father) -> (${v} == ${father})。`, `v == father?`, 'dfs', u, [u, v]);
      if (v === father) {
        makeStep(lines.checkFather, `↩️ [跳过父边] 邻居 ${v} == father (${father})，防止无向边直接走原路回退 (continue)。`, `skip father edge (${u}, ${v})`, 'dfs', u, [u, v]);
        continue;
      }

      makeStep(lines.checkUnvisited, `🔎 [检查是否已访问] if (dfn[${v}] == 0) -> 节点 ${v} 当前 dfn = ${dfn[v]}。`, `dfn[${v}] == 0?`, 'dfs', u, [u, v]);

      if (dfn[v] === 0) {
        children++;
        makeStep(lines.incChildren, `👶 [DFS 树分支计数] children++; 节点 ${u} 的独立树边分支数增至 ${children}。`, `children = ${children}`, 'dfs', u);

        makeStep(lines.recurseDfs, `🌲 [递归树边深入] 节点 ${v} 尚未访问，作为树边递归调用 tarjan(${v}, ${u})。`, `recurse tarjan(${v}, ${u})`, 'dfs', v, [u, v]);
        runTarjan(v, u);

        const oldLow = low[u];
        low[u] = Math.min(low[u], low[v]);
        makeStep(lines.updateLowTree, `🔄 [回溯更新追溯值] 从子树 ${v} 回溯至 ${u}: low[${u}] = min(${oldLow}, low[${v}]=${low[v]}) = ${low[u]}。`, `low[${u}]=min(${oldLow},${low[v]})`, 'dfs', u, [u, v], 'low', u);

        makeStep(lines.checkNonRootCut, `⚖️ [非根割点检验] if (father != 0 && low[${v}] >= dfn[${u}]) -> (${father} != 0 && ${low[v]} >= ${dfn[u]})。`, `check cut ${u}`, 'check_cut', u, [u, v]);
        if (father !== 0 && low[v] >= dfn[u]) {
          isCut[u] = true;
          makeStep(lines.markCutNode, `🚩 [发现割点] isCut[${u}] = true; 子树 ${v} 无法绕过节点 ${u} 连回更早祖先，移除 ${u} 将导致原图不连通！`, `isCut[${u}] = true`, 'check_cut', u, undefined, 'isCut', u);
        }

        makeStep(lines.checkBridge, `⚖️ [割边/桥检验] if (low[${v}] > dfn[${u}]) -> (${low[v]} > ${dfn[u]})。`, `check bridge (${u}, ${v})`, 'check_bridge', u, [u, v]);
        if (low[v] > dfn[u]) {
          const edge: [number, number] = u < v ? [u, v] : [v, u];
          bridges.push(edge);
          makeStep(lines.markBridge, `🌉 [发现桥边] 严格大于成立！边 (${u}, ${v}) 是桥！砍断该边将导致图分裂为两个连通分量！`, `bridge (${u}, ${v})`, 'check_bridge', u, [u, v]);
        }
      } else {
        const oldLow = low[u];
        low[u] = Math.min(low[u], dfn[v]);
        makeStep(lines.updateLowBack, `⚡ [返祖回边环路] 发现祖先 ${v}: 更新 low[${u}] = min(${oldLow}, dfn[${v}]=${dfn[v]}) = ${low[u]}！`, `low[${u}]=min(${oldLow},${dfn[v]})`, 'back_edge', u, [u, v], 'low', u);
      }
    }

    makeStep(lines.checkRootCut, `⚖️ [根节点割点检验] if (father == 0 && children >= 2) -> (${father} == 0 && ${children} >= 2)。`, `check root cut ${u}`, 'check_cut', u);
    if (father === 0 && children >= 2) {
      isCut[u] = true;
      makeStep(lines.markRootCut, `🚩 [发现根割点] isCut[${u}] = true; 根节点 ${u} 在 DFS 树中拥有 ${children} 个独立分支，是图的割点！`, `isCut[${u}] = true`, 'check_cut', u, undefined, 'isCut', u);
    }
  }

  for (let i = 1; i <= n; i++) {
    makeStep(lines.outerLoop, `🔁 [外层遍历判定] for (int i = ${i}; i <= ${n}; i++)。`, `for i=${i}`, 'dfs', i);
    makeStep(lines.outerCheckDfn, `🔎 [检查根节点是否访问] if (dfn[${i}] == 0) -> (${dfn[i]} == 0)。`, `dfn[${i}]==0?`, 'dfs', i);
    if (dfn[i] === 0) {
      runTarjan(i, 0);
    }
  }

  const cutCount = isCut.filter(Boolean).length;
  makeStep(lines.returnDone, `🎉 [割点与桥判定完成] 找到 ${cutCount} 个割点 [${isCut.map((c, idx) => c ? idx : 0).filter(Boolean).join(', ')}]，${bridges.length} 条桥边！`, 'solve 完成', 'done');

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<BridgeStep>({
  id: 'tarjan-bridge',
  name: 'Tarjan 割点与桥 (Cut Vertices & Bridges)',
  category: 'graph',
  icon: '🌉',
  badge: {
    mode: 'Tarjan 递归回溯 · 树边与返祖边判定',
    complexity: 'O(V + E) · O(V)',
  },
  card1Title: '🌉 无向图拓扑与割裂结构沙盘',
  card2Title: '📊 Tarjan 判定监视器 (dfn, low, isCut, bridges)',
  card2Desc: '展示时间戳 dfn 与追溯值 low、割点条件 low[v] >= dfn[u] 与割边桥条件 low[v] > dfn[u]',
  legend: [
    { label: '🚩 关键割点', color: '#ef4444' },
    { label: '🌉 关键割边 (桥)', color: '#f59e0b' },
    { label: '⚡ 当前 DFS 访问节点', color: '#38bdf8' },
    { label: '⚪ 普通节点', color: '#1e293b' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设图结构',
      type: 'select',
      defaultValue: 'classic_5node',
      options: [
        { label: '5 节点含环与双桥 (割点 3, 4 | 桥 (3,4), (4,5))', value: 'classic_5node' },
        { label: '4 节点含环与单桥 (割点 3 | 桥 (3,4))', value: 'simple_4node' },
      ],
    },
  ],
  presets: [
    { label: '5 节点环桥图', values: { 'input-preset': 'classic_5node' } },
    { label: '4 节点环桥图', values: { 'input-preset': 'simple_4node' } },
  ],
  metrics: [
    { id: 'metric-cut-count', label: '已确认割点数', color: '#ef4444' },
    { id: 'metric-bridge-count', label: '已确认桥边数', color: '#f59e0b' },
    { id: 'metric-cur-node', label: '当前 DFS 节点', color: '#38bdf8' },
    { id: 'metric-tarjan-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: TARJAN_BRIDGE_CODE_LANGUAGES,
  problemHtml: TARJAN_BRIDGE_PROBLEM_HTML,
  analysisHtml: TARJAN_BRIDGE_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_5node') as string;
    return buildTarjanBridgeSteps(preset);
  },
  renderCanvas: (container, step) => {
    const is5Node = Object.keys(step.dfnMap).length === 5;
    const n = is5Node ? 5 : 4;

    const nodeCoords: Record<number, { x: number; y: number }> = is5Node
      ? {
          1: { x: 55, y: 55 },
          2: { x: 135, y: 55 },
          3: { x: 95, y: 125 },
          4: { x: 195, y: 125 },
          5: { x: 275, y: 125 },
        }
      : {
          1: { x: 65, y: 55 },
          2: { x: 145, y: 55 },
          3: { x: 105, y: 125 },
          4: { x: 235, y: 125 },
        };

    const undirectedEdges = is5Node
      ? [[1, 2], [2, 3], [3, 1], [3, 4], [4, 5]]
      : [[1, 2], [2, 3], [3, 1], [3, 4]];

    const isBridgeEdge = (u: number, v: number) =>
      step.bridgeEdges.some(([a, b]) => (a === u && b === v) || (a === v && b === u));

    let svgEdges = '';
    for (const [u, v] of undirectedEdges) {
      const p1 = nodeCoords[u];
      const p2 = nodeCoords[v];
      if (!p1 || !p2) continue;

      const isAct = step.activeEdge && ((step.activeEdge[0] === u && step.activeEdge[1] === v) || (step.activeEdge[0] === v && step.activeEdge[1] === u));
      const isBridge = isBridgeEdge(u, v);

      const color = isAct ? '#facc15' : isBridge ? '#f59e0b' : '#64748b';
      const width = isBridge ? 3.5 : isAct ? 3 : 1.5;

      svgEdges += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${isBridge ? 'stroke-dasharray="4,2"' : ''} />`;
    }

    let svgNodes = '';
    for (let u = 1; u <= n; u++) {
      const p = nodeCoords[u];
      if (!p) continue;

      const isCur = step.curNode === u;
      const isCut = step.cutNodes.includes(u);

      const bg = isCur ? '#b45309' : isCut ? '#831843' : '#1e293b';
      const border = isCur ? '#facc15' : isCut ? '#ef4444' : '#475569';

      svgNodes += `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="16" fill="${bg}" stroke="${border}" stroke-width="${isCur || isCut ? 3 : 1.5}" />
          <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
          <text x="${p.x}" y="${p.y + 24}" fill="#94a3b8" font-size="7.5" font-weight="700" text-anchor="middle">d:${step.dfnMap[u] || 0} l:${step.lowMap[u] || 0}</text>
        </g>
      `;
    }

    const cutBadges = step.cutNodes.length > 0
      ? step.cutNodes.map((u) => `<span style="background:rgba(153, 27, 27, 0.4); border:1px solid #ef4444; border-radius:4px; padding:2px 8px; font-size:10.5px; color:#fca5a5; font-weight:700;">🚩 割点 Node ${u}</span>`).join(' ')
      : '<span style="font-size:10.5px; color:#64748b;">(暂未发现割点)</span>';

    const bridgeBadges = step.bridgeEdges.length > 0
      ? step.bridgeEdges.map(([u, v]) => `<span style="background:rgba(180, 83, 9, 0.4); border:1px solid #f59e0b; border-radius:4px; padding:2px 8px; font-size:10.5px; color:#fde047; font-weight:700;">🌉 桥边 (${u}, ${v})</span>`).join(' ')
      : '<span style="font-size:10.5px; color:#64748b;">(暂未发现桥边)</span>';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; justify-content: flex-start; align-items: stretch; background: #f8fafc; padding: 12px; border-radius: 8px; box-sizing: border-box; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
          <span style="font-size: 12px; color: #374151; font-weight: 700;">🌉 无向图拓扑与连通瓶颈</span>
          <span style="font-size: 11px; color: #1e293b; background: #eff6ff; padding: 2px 8px; border-radius: 4px; border: 1px solid #e2e8f0;">
            当前探索节点: <b style="color: #38bdf8;">Node ${step.curNode || '无'}</b>
          </span>
        </div>

        <div style="width: 100%; min-height: 150px; background: #0f172a; border-radius: 8px; display: flex; justify-content: center; align-items: center; border: 1px solid #334155;">
          <svg style="width: 100%; height: 150px;" viewBox="0 0 310 150">
            ${svgEdges}
            ${svgNodes}
          </svg>
        </div>

        <!-- 底部关键割裂舱 -->
        <div style="background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11.5px; font-weight: 800; color: #374151;">🛡️ 割点与割边关键割裂舱</span>
            <div style="font-size: 11px; color: #38bdf8;">
              割点: <b>${step.cutNodes.length}</b> 个 | 桥边: <b>${step.bridgeEdges.length}</b> 条
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 10.5px; color: #64748b; width: 60px; font-weight: 700;">割点列表:</span>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">${cutBadges}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 10.5px; color: #64748b; width: 60px; font-weight: 700;">割边列表:</span>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">${bridgeBadges}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container: HTMLElement, step: BridgeStep) => {
    const n = Object.keys(step.dfnMap).length;
    const indices = Array.from({ length: n }, (_, i) => i + 1);

    const renderRow = (name: string, map: Record<number, any>, activeName: string, color: string) => {
      const cells = indices
        .map((idx) => {
          const val = map[idx];
          const isActive = step.activeArray === activeName && step.activeSlot === idx;
          const displayVal = val === null || val === undefined ? '_' : typeof val === 'boolean' ? (val ? 'T' : 'F') : val;
          const bg = isActive ? '#fef3c7' : '#ffffff';
          const textCol = isActive ? '#b45309' : '#0f172a';
          const border = isActive ? '2px solid #f59e0b' : '1px solid #cbd5e1';

          return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 34px; height: 32px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 11px; font-weight: 700;">
              <span style="font-size: 8px; color: #64748b; line-height: 1;">N[${idx}]</span>
              <span style="line-height: 1.1;">${displayVal}</span>
            </div>
          `;
        })
        .join('');

      return `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 135px; color: ${color};">${name}:</span>
          <div style="display: flex; gap: 4px;">${cells}</div>
        </div>
      `;
    };

    const dfnRow = renderRow('dfn[] (时间戳)', step.dfnMap, 'dfn', '#38bdf8');
    const lowRow = renderRow('low[] (追溯值)', step.lowMap, 'low', '#f59e0b');

    const cutMap: Record<number, boolean> = {};
    for (const idx of indices) cutMap[idx] = step.cutNodes.includes(idx);
    const cutRow = renderRow('isCut[] (割点)', cutMap, 'isCut', '#ef4444');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #374151; padding: 4px 8px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 6px; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
          ${dfnRow}
          ${lowRow}
          ${cutRow}
        </div>
      </div>
    `;
  },
});

registerAlgorithm({
  id: 'tarjan-bridge',
  name: 'Tarjan 割点与桥 (Cut Vertices & Bridges)',
  viewId: 'algo-tarjan-bridge-view',
  category: 'graph',
  description: '进阶图论连通度分析：深度优先搜索求割点与割边、返祖回边维护、双连通性判定 (洛谷 P3388)',
  icon: '🌉',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 68,
  learningGoal: '掌握无向图 DFS 生成树性质、low/dfn 判定割点与桥定理及双连通分量思想',
});

export { Visualizer as TarjanBridgeVisualizer };
