/**
 * Tarjan 强连通分量与 DAG 缩点 (Tarjan SCC & DAG Condensation) 声明式可视化器
 * 进阶图论: 时间戳 dfn[u] 与追溯值 low[u]、栈维护强连通节点、缩点重建 DAG (洛谷 P3387)
 * 深度架构重构：严格解释器级全流程逐行高亮执行（DFS递归、入栈、返祖边判定、弹栈结算、缩点建边均发射独立Step）、四语言行号映射
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TARJAN_SCC_DAG_CODE_LANGUAGES,
  TARJAN_SCC_DAG_PROBLEM_HTML,
  TARJAN_SCC_DAG_ANALYSIS_HTML,
} from './tarjan-scc-dag-problem-content';
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

  // 精准四语言映射行号字典 (cpp / java / python / javascript)
  const lines = {
    tarjanDef: { cpp: 20, java: 12, python: 19, javascript: 10 },
    stampDfnLow: { cpp: 21, java: 13, python: 22, javascript: 11 },
    pushStack: { cpp: 22, java: 14, python: 23, javascript: 12 },
    setInStack: { cpp: 23, java: 15, python: 24, javascript: 13 },
    loopNeighbors: { cpp: 25, java: 17, python: 26, javascript: 15 },
    checkUnvisited: { cpp: 26, java: 18, python: 27, javascript: 16 },
    recurseDfs: { cpp: 27, java: 19, python: 28, javascript: 17 },
    updateLowTree: { cpp: 28, java: 19, python: 29, javascript: 18 },
    checkInStack: { cpp: 29, java: 21, python: 30, javascript: 19 },
    updateLowBack: { cpp: 30, java: 21, python: 31, javascript: 20 },
    checkSccRoot: { cpp: 35, java: 25, python: 33, javascript: 23 },
    incSccCount: { cpp: 36, java: 26, python: 34, javascript: 24 },
    popLoop: { cpp: 37, java: 27, python: 35, javascript: 25 },
    popNode: { cpp: 38, java: 28, python: 36, javascript: 26 },
    unsetInStack: { cpp: 39, java: 29, python: 37, javascript: 27 },
    setSccId: { cpp: 40, java: 30, python: 38, javascript: 28 },
    breakIfRoot: { cpp: 41, java: 31, python: 39, javascript: 29 },
    buildDagEntry: { cpp: 47, java: 36, python: 48, javascript: 34 },
    dagLoopU: { cpp: 49, java: 39, python: 50, javascript: 35 },
    dagLoopV: { cpp: 50, java: 40, python: 51, javascript: 36 },
    dagCheckCross: { cpp: 51, java: 41, python: 52, javascript: 37 },
    dagAddEdge: { cpp: 52, java: 42, python: 53, javascript: 38 },
    returnDag: { cpp: 56, java: 46, python: 54, javascript: 40 },
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
    makeStep(lines.tarjanDef, `🚀 [进入 Tarjan DFS] 进入节点 ${u} 的深度优先搜索函数。`, `tarjan(${u})`, 'dfs', u);

    timer++;
    dfn[u] = timer;
    low[u] = timer;
    makeStep(lines.stampDfnLow, `⏱️ [打上时间戳与初始追溯值] dfn[${u}] = low[${u}] = ++timer = ${timer}。`, `dfn[${u}]=low[${u}]=${timer}`, 'dfs', u, undefined, 'dfn', u);

    stack.push(u);
    makeStep(lines.pushStack, `📥 [压入 Tarjan 辅助栈] stack.push(${u})，当前栈内节点: [${stack.join(', ')}]。`, `stack.push(${u})`, 'dfs', u);

    inStack[u] = true;
    makeStep(lines.setInStack, `🏷️ [标记在栈状态] inStack[${u}] = true。`, `inStack[${u}]=true`, 'dfs', u, undefined, 'inStack', u);

    for (const v of graph[u]) {
      makeStep(lines.loopNeighbors, `  ↳ [遍历出边邻居] for (int v : graph[${u}]) -> 考察出边 (${u} ➔ ${v})。`, `visit edge (${u}, ${v})`, 'dfs', u, [u, v]);

      makeStep(lines.checkUnvisited, `  🔎 [检查是否已访问] if (dfn[${v}] == 0) -> 节点 ${v} 当前 dfn = ${dfn[v]}。`, `dfn[${v}]==0?`, 'dfs', u, [u, v]);

      if (dfn[v] === 0) {
        makeStep(lines.recurseDfs, `  🌲 [递归树边深入] 节点 ${v} 尚未访问，作为树边递归调用 tarjan(${v})。`, `recurse tarjan(${v})`, 'dfs', v, [u, v]);
        dfs(v);

        low[u] = Math.min(low[u], low[v]);
        makeStep(lines.updateLowTree, `  🔄 [回溯更新追溯值] 子节点 ${v} 返回，更新 low[${u}] = min(low[${u}], low[${v}]) = ${low[u]}。`, `low[${u}]=min(${low[u]},${low[v]})`, 'dfs', u, [u, v], 'low', u);
      } else {
        makeStep(lines.checkInStack, `  🔎 [检查在栈返祖边] 节点 ${v} 已访问，检验 else if (inStack[${v}]) -> (${inStack[v]})。`, `inStack[${v}]?`, 'back_edge', u, [u, v]);

        if (inStack[v]) {
          low[u] = Math.min(low[u], dfn[v]);
          makeStep(lines.updateLowBack, `  ⚡ [返祖边形成环路] 节点 ${v} 仍在栈中，发现强连通环路！更新 low[${u}] = min(low[${u}], dfn[${v}]) = ${low[u]}！`, `low[${u}]=min(low[${u}],dfn[${v}])`, 'back_edge', u, [u, v], 'low', u);
        }
      }
    }

    makeStep(lines.checkSccRoot, `⚖️ [强连通分量根判定] 检查 if (low[${u}] == dfn[${u}]) -> (${low[u]} == ${dfn[u]})。`, `check root ${u}`, 'dfs', u);

    if (low[u] === dfn[u]) {
      sccCount++;
      makeStep(lines.incSccCount, `🎉 [锁定强连通分量] low[${u}] == dfn[${u}]，节点 ${u} 是一个强连通分量的根！sccCount 增至 ${sccCount}！`, `sccCount=${sccCount}`, 'pop_scc', u);

      const currentScc: number[] = [];
      makeStep(lines.popLoop, '🔄 [启动连续弹栈循环] while (true) 开始弹出属于本分量的所有节点。', 'while(true) pop', 'pop_scc', u);

      while (true) {
        const node = stack.pop()!;
        currentScc.push(node);
        makeStep(lines.popNode, `  📤 [弹栈出栈] int node = stack.pop() -> 弹出节点 ${node}。`, `pop ${node}`, 'pop_scc', node);

        inStack[node] = false;
        makeStep(lines.unsetInStack, `  🏷️ [取消在栈标记] inStack[${node}] = false。`, `inStack[${node}]=false`, 'pop_scc', node, undefined, 'inStack', node);

        sccId[node] = sccCount;
        makeStep(lines.setSccId, `  🏷️ [赋予分量编号] sccId[${node}] = ${sccCount}。`, `sccId[${node}]=${sccCount}`, 'pop_scc', node, undefined, 'sccId', node);

        makeStep(lines.breakIfRoot, `  🔎 [判定是否到达根] if (node == ${u}) -> (${node} == ${u})。`, `node==${u}?`, 'pop_scc', node);
        if (node === u) break;
      }
      sccList.push(currentScc);
      makeStep(lines.popLoop, `✨ [本强连通分量结算完毕] SCC #${sccCount} 包含节点: [${currentScc.join(', ')}]！`, `SCC#${sccCount}=[${currentScc.join(',')}]`, 'pop_scc', u);
    }
  }

  for (let i = 1; i <= n; i++) {
    if (dfn[i] === 0) {
      dfs(i);
    }
  }

  // 2. 缩点建 DAG
  makeStep(lines.buildDagEntry, '🏗️ [开始缩点重构 DAG] 遍历原图的所有有向边，若两端属于不同强连通分量，建立 DAG 跨分量边。', 'buildDAG 入口', 'condense');

  for (let u = 1; u <= n; u++) {
    makeStep(lines.dagLoopU, `🔁 [缩点外层遍历] for (int u = ${u}; u <= ${n}; u++)。`, `for u=${u}`, 'condense', u);

    for (const v of graph[u]) {
      makeStep(lines.dagLoopV, `  ↳ [缩点考察出边] 考察原图边 (${u} ➔ ${v})，对应分量 sccId[${u}]=${sccId[u]} vs sccId[${v}]=${sccId[v]}。`, `edge (${u},${v})`, 'condense', u, [u, v]);

      makeStep(lines.dagCheckCross, `  🔎 [跨分量判定] if (sccId[${u}] != sccId[${v}]) -> (${sccId[u]} != ${sccId[v]})。`, `sccId[${u}]!=sccId[${v}]`, 'condense', u, [u, v]);

      if (sccId[u] !== sccId[v]) {
        const fromScc = sccId[u];
        const toScc = sccId[v];
        if (!condensedEdges.some(([fu, fv]) => fu === fromScc && fv === toScc)) {
          condensedEdges.push([fromScc, toScc]);
          makeStep(lines.dagAddEdge, `  🚀 [建立 DAG 缩点边] 发现跨分量转移！新增有向边 SCC #${fromScc} ➔ SCC #${toScc}！`, `DAG edge ${fromScc}->${toScc}`, 'condense', u, [u, v]);
        }
      }
    }
  }

  makeStep(lines.returnDag, `🎉 [DAG 缩点完成] 全图划分为 ${sccCount} 个强连通分量，重构为具备严格拓扑序的有向无环图！`, 'return dag', 'done');

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<TarjanSCCStep>({
  id: 'tarjan-scc-dag',
  name: 'Tarjan 强连通分量与 DAG 缩点 (Tarjan SCC)',
  category: 'graph',
  icon: '🧬',
  badge: {
    mode: 'Tarjan 栈深度优先 · 缩点有向无环图',
    complexity: 'O(V + E) · O(V)',
  },
  card1Title: '🧬 原图拓扑与 DAG 缩点重构舱',
  card2Title: '📊 Tarjan 状态监视器 (dfn, low, inStack, sccId)',
  card2Desc: '展示时间戳 dfn 与追溯值 low 的回溯更新、栈维护强连通节点与跨分量 DAG 缩点重建',
  legend: [
    { label: 'SCC #1 强连通分量', color: '#10b981' },
    { label: 'SCC #2 强连通分量', color: '#a855f7' },
    { label: '⚡ 当前递归节点', color: '#f59e0b' },
    { label: '📥 处于辅助栈中', color: '#38bdf8' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设图拓扑结构',
      type: 'select',
      defaultValue: 'classic_5node',
      options: [
        { label: '5 节点拓扑 (两个环 1-2-3-1 与 4-5-4，缩点为 2 个 SCC)', value: 'classic_5node' },
        { label: '4 节点拓扑 (一个环 1-2-3-1 与出度点 4，缩点为 2 个 SCC)', value: 'simple_4node' },
      ],
    },
  ],
  presets: [
    { label: '5 节点经典拓扑', values: { 'input-preset': 'classic_5node' } },
    { label: '4 节点经典拓扑', values: { 'input-preset': 'simple_4node' } },
  ],
  metrics: [
    { id: 'metric-scc-count', label: '强连通分量数', color: '#10b981' },
    { id: 'metric-stack-len', label: '当前在栈节点数', color: '#38bdf8' },
    { id: 'metric-cur-node', label: '当前 DFS 节点', color: '#f59e0b' },
    { id: 'metric-tarjan-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: TARJAN_SCC_DAG_CODE_LANGUAGES,
  problemHtml: TARJAN_SCC_DAG_PROBLEM_HTML,
  analysisHtml: TARJAN_SCC_DAG_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_5node') as string;
    return buildTarjanSCCSteps(preset);
  },
  renderCanvas: (container, step) => {
    const is5Node = Object.keys(step.dfnMap).length === 5;
    const n = is5Node ? 5 : 4;

    const nodeCoords: Record<number, { x: number; y: number }> = is5Node
      ? {
          1: { x: 55, y: 45 },
          2: { x: 125, y: 110 },
          3: { x: 55, y: 110 },
          4: { x: 215, y: 75 },
          5: { x: 275, y: 75 },
        }
      : {
          1: { x: 65, y: 45 },
          2: { x: 135, y: 105 },
          3: { x: 65, y: 105 },
          4: { x: 235, y: 75 },
        };

    const allEdges = is5Node
      ? [[1, 2], [2, 3], [3, 1], [3, 4], [4, 5], [5, 4]]
      : [[1, 2], [2, 3], [3, 1], [3, 4]];

    const svgEdges = allEdges
      .map(([u, v]) => {
        const p1 = nodeCoords[u];
        const p2 = nodeCoords[v];
        if (!p1 || !p2) return '';

        const isAct = step.activeEdge && step.activeEdge[0] === u && step.activeEdge[1] === v;
        const color = isAct ? '#facc15' : '#64748b';
        const width = isAct ? 3 : 1.5;

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const mx = (p1.x + p2.x) / 2 - dy * 0.15;
        const my = (p1.y + p2.y) / 2 + dx * 0.15;

        return `
          <g>
            <path d="M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}" fill="none" stroke="${color}" stroke-width="${width}" marker-end="url(#scc-arrow)" />
          </g>
        `;
      })
      .join('');

    const nodes = is5Node ? [1, 2, 3, 4, 5] : [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isCur = step.curNode === u;
        const inStk = step.inStackMap[u];
        const sccVal = step.sccIdMap[u] || 0;
        const bg = isCur ? '#f59e0b' : sccVal === 1 ? '#065f46' : sccVal === 2 ? '#581c87' : '#1e3a8a';
        const border = isCur ? '#facc15' : inStk ? '#38bdf8' : sccVal === 1 ? '#10b981' : sccVal === 2 ? '#a855f7' : '#475569';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${isCur || inStk ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 24}" fill="#94a3b8" font-size="7.5" font-weight="700" text-anchor="middle">d:${step.dfnMap[u] || 0} l:${step.lowMap[u] || 0}</text>
          </g>
        `;
      })
      .join('');

    // 缩点分量舱
    const sccCardsHtml = step.sccList.map((comp, idx) => {
      const sccNum = idx + 1;
      const color = sccNum === 1 ? '#10b981' : '#a855f7';
      return `
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid ${color}; border-radius: 6px; padding: 6px 10px; display: flex; flex-direction: column; gap: 2px; min-width: 100px;">
          <div style="font-size: 11px; font-weight: 700; color: ${color};">SCC #${sccNum}</div>
          <div style="font-size: 10px; color: #cbd5e1; font-family: monospace;">包含: [${comp.join(', ')}]</div>
        </div>
      `;
    }).join('');

    const dagEdgesHtml = step.condensedEdges.length > 0
      ? step.condensedEdges.map(([fu, fv]) => `
          <span style="background: #1e293b; border: 1px solid #38bdf8; border-radius: 4px; padding: 2px 8px; font-size: 10.5px; color: #38bdf8; font-weight: 700;">
            SCC #${fu} ➔ SCC #${fv}
          </span>
        `).join(' ')
      : '<span style="font-size: 10.5px; color: #64748b;">(缩点跨分量有向边推导中...)</span>';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; justify-content: flex-start; align-items: stretch; background: #0b0f19; padding: 12px; border-radius: 8px; box-sizing: border-box; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 700;">🧬 有向图原拓扑与强连通环路</span>
          <span style="font-size: 11px; color: #e2e8f0; background: #1e293b; padding: 2px 8px; border-radius: 4px; border: 1px solid #334155;">
            已生成强连通分量: <b style="color: #10b981;">${step.sccList.length}</b> 个
          </span>
        </div>

        <div style="width: 100%; min-height: 140px; background: #0f172a; border-radius: 8px; display: flex; justify-content: center; align-items: center; border: 1px solid #334155;">
          <svg style="width: 100%; height: 140px;" viewBox="0 0 310 140">
            <defs>
              <marker id="scc-arrow" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
              </marker>
            </defs>
            ${svgEdges}
            ${svgNodes}
          </svg>
        </div>

        <!-- 底部 DAG 缩点重构舱 -->
        <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 10px 14px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11.5px; font-weight: 800; color: #cbd5e1;">📦 强连通分量与 DAG 缩点重构舱</span>
            <div style="font-size: 11px; color: #38bdf8;">
              辅助栈状态: <b>[ ${step.tarjanStack.join(' ➔ ') || '空'} ]</b>
            </div>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
            ${sccCardsHtml || '<span style="font-size: 10.5px; color: #64748b;">(暂未产生结算分量)</span>'}
          </div>

          <div style="display: flex; align-items: center; gap: 8px; border-top: 1px dashed #334155; padding-top: 6px;">
            <span style="font-size: 10.5px; color: #94a3b8; font-weight: 700;">缩点 DAG 跨分量边:</span>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">${dagEdgesHtml}</div>
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container: HTMLElement, step: TarjanSCCStep) => {
    const n = Object.keys(step.dfnMap).length;
    const indices = Array.from({ length: n }, (_, i) => i + 1);

    const renderRow = (name: string, map: Record<number, any>, activeName: string, color: string) => {
      const cells = indices
        .map((idx) => {
          const val = map[idx];
          const isActive = step.activeArray === activeName && step.activeSlot === idx;
          const displayVal = val === null || val === undefined ? '_' : typeof val === 'boolean' ? (val ? 'T' : 'F') : val;
          const bg = isActive ? '#78350f' : '#1e293b';
          const textCol = isActive ? '#fde047' : '#e2e8f0';
          const border = isActive ? '2px solid #eab308' : '1px solid #475569';

          return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 34px; height: 32px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 11px; font-weight: 700;">
              <span style="font-size: 8px; color: #94a3b8; line-height: 1;">N[${idx}]</span>
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
    const inStackRow = renderRow('inStack[] (在栈)', step.inStackMap, 'inStack', '#10b981');
    const sccIdRow = renderRow('sccId[] (分量号)', step.sccIdMap, 'sccId', '#a855f7');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #cbd5e1; padding: 4px 8px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 6px; background: #0f172a; padding: 10px; border-radius: 6px; border: 1px solid #334155;">
          ${dfnRow}
          ${lowRow}
          ${inStackRow}
          ${sccIdRow}
        </div>
      </div>
    `;
  },
});

registerAlgorithm({
  id: 'tarjan-scc-dag',
  name: 'Tarjan 强连通分量与 DAG 缩点 (Tarjan SCC)',
  viewId: 'algo-tarjan-scc-dag-view',
  category: 'graph',
  description: '进阶图论 Tarjan 算法：深度优先搜索求强连通分量、时间戳与追溯值维护、缩点重构 DAG (洛谷 P3387)',
  icon: '🧬',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 62,
  learningGoal: '掌握 Tarjan 算法求强连通分量原理、dfn/low 数组性质及缩点建 DAG 方法',
});

export { Visualizer as TarjanSCCDAGVisualizer };
