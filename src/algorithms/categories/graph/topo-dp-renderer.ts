/**
 * 拓扑排序与 DAG 动态规划 (Topological DP - 最长路与关键路径) 声明式可视化器
 * 核心：DAG 无后效性、拓扑序线性递推 dp[v] = max(dp[v], dp[u] + w)、工程关键路径 CPM
 * 深度架构重构：严格解释器级全流程逐行高亮执行（零入度扫描、队列入队出队、松弛转移、新零入度解锁均发射独立Step）、四语言行号映射
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TOPO_DP_CODE_LANGUAGES,
  TOPO_DP_PROBLEM_HTML,
  TOPO_DP_ANALYSIS_HTML,
} from './topo-dp-problem-content';
import { HighlightTarget } from '../../../core/code-panel';

export interface TopoDPStep {
  curNode: number;
  dpDist: Record<number, number>;
  inDegrees: Record<number, number>;
  topoQueue: number[];
  activeEdge?: { u: number; v: number; w: number };
  criticalPath?: number[];
  dpArray: number[];
  inDegreeArray: number[];
  activeArray?: 'dp' | 'inDegree' | 'queue';
  activeSlot?: number;
  status: 'init' | 'pop' | 'relax' | 'push' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export function buildTopoDPSteps(preset: string = 'classic_5node'): TopoDPStep[] {
  const steps: TopoDPStep[] = [];
  const is5Node = preset === 'classic_5node';
  const n = is5Node ? 5 : 4;

  const edges: Array<{ u: number; v: number; w: number }> = is5Node
    ? [
        { u: 1, v: 2, w: 3 },
        { u: 1, v: 3, w: 2 },
        { u: 2, v: 4, w: 4 },
        { u: 3, v: 4, w: 1 },
        { u: 4, v: 5, w: 2 },
      ]
    : [
        { u: 1, v: 2, w: 3 },
        { u: 1, v: 3, w: 2 },
        { u: 2, v: 4, w: 4 },
        { u: 3, v: 4, w: 3 },
      ];

  const inDegree: number[] = new Array(n + 1).fill(0);
  const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n + 1 }, () => []);
  for (const e of edges) {
    adj[e.u].push({ to: e.v, w: e.w });
    inDegree[e.v]++;
  }

  const dp: number[] = new Array(n + 1).fill(0);
  const pre: number[] = new Array(n + 1).fill(0);
  const queue: number[] = [];
  let curNode = 1;
  let activeEdge: { u: number; v: number; w: number } | undefined = undefined;

  // 精准 18 处四语言映射行号字典 (cpp / java / python / javascript)
  const lines = {
    entry: { cpp: 16, java: 7, python: 11, javascript: 11 },
    initGraph: { cpp: 17, java: 8, python: 12, javascript: 12 },
    initInDeg: { cpp: 18, java: 11, python: 13, javascript: 13 },
    loopRelations: { cpp: 21, java: 12, python: 15, javascript: 14 },
    incInDeg: { cpp: 23, java: 14, python: 17, javascript: 16 },
    initCostQueue: { cpp: 26, java: 17, python: 19, javascript: 19 },
    loopFindZero: { cpp: 27, java: 21, python: 21, javascript: 21 },
    checkZeroDeg: { cpp: 28, java: 22, python: 22, javascript: 22 },
    initCostZero: { cpp: 29, java: 23, python: 23, javascript: 23 },
    pushZeroQueue: { cpp: 30, java: 24, python: 24, javascript: 24 },
    whileQueue: { cpp: 35, java: 29, python: 27, javascript: 29 },
    popNode: { cpp: 36, java: 30, python: 28, javascript: 30 },
    updateAns: { cpp: 38, java: 31, python: 29, javascript: 31 },
    loopNeighbors: { cpp: 40, java: 33, python: 31, javascript: 33 },
    relaxCost: { cpp: 41, java: 34, python: 32, javascript: 34 },
    decInDeg: { cpp: 42, java: 35, python: 33, javascript: 35 },
    pushNextQueue: { cpp: 43, java: 36, python: 35, javascript: 37 },
    returnAns: { cpp: 47, java: 40, python: 37, javascript: 41 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'init' | 'pop' | 'relax' | 'push' | 'done',
    activeArray?: 'dp' | 'inDegree' | 'queue',
    activeSlot?: number
  ): void {
    const dpRec: Record<number, number> = {};
    const inDegRec: Record<number, number> = {};
    for (let i = 1; i <= n; i++) {
      dpRec[i] = dp[i];
      inDegRec[i] = inDegree[i];
    }

    const curStr = status === 'done' ? '全部拓扑递推完毕' : `Node ${curNode}`;
    const maxVal = Math.max(...dp.slice(1));
    const qStr = queue.length > 0 ? `[ ${queue.map((x) => `Node ${x}`).join(', ')} ]` : '空队列';

    const phaseStr =
      status === 'done'
        ? 'DAG 最长路确立'
        : status === 'relax'
          ? '拓扑状态转移 max(dp)'
          : status === 'push'
            ? '零入度节点入队'
            : status === 'pop'
              ? '拓扑出队推进'
              : '算法初始化';

    let criticalPath: number[] | undefined = undefined;
    if (status === 'done') {
      const pathNodes: number[] = [];
      let bestEnd = 1;
      let maxD = 0;
      for (let i = 1; i <= n; i++) {
        if (dp[i] > maxD) {
          maxD = dp[i];
          bestEnd = i;
        }
      }
      let curr = bestEnd;
      while (curr !== 0) {
        pathNodes.push(curr);
        curr = pre[curr];
      }
      criticalPath = pathNodes.reverse();
    }

    steps.push({
      curNode,
      dpDist: dpRec,
      inDegrees: inDegRec,
      topoQueue: [...queue],
      activeEdge: activeEdge ? { ...activeEdge } : undefined,
      criticalPath,
      dpArray: [...dp],
      inDegreeArray: [...inDegree],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-topodp-cur': curStr,
        'metric-topodp-max': `${maxVal} 长度`,
        'metric-topo-queue': qStr,
        'metric-topodp-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, `🚀 [算法初始化] minimumTime(n=${n})：建立 DAG 图结构，计算各节点入度与最长关键路径。`, `minimumTime(${n})`, 'init');
  makeStep(lines.initGraph, '📐 [初始化边表] 分配图边表，完成各点有向边的装载。', '分配 graph 边表', 'init');
  makeStep(lines.initInDeg, '📊 [初始化入度数组] inDegree = new int[n + 1] (统计各点前驱数量)。', 'inDegree = new int[n+1]', 'init');

  // 构建依赖与入度
  for (const e of edges) {
    makeStep(lines.loopRelations, `  ↳ [遍历依赖边] 检查边 (${e.u} ➔ ${e.v}, 权值=${e.w})。`, `edge (${e.u},${e.v})`, 'init');
    makeStep(lines.incInDeg, `  📌 [累加入度] inDegree[${e.v}]++ 增至 ${inDegree[e.v]}。`, `inDegree[${e.v}]++`, 'init', 'inDegree', e.v);
  }

  makeStep(lines.initCostQueue, '📦 [分配状态数组] cost = new int[n + 1]; 建立辅助拓扑队列 queue。', '分配 cost 与 queue', 'init');

  // 零入度入队
  for (let i = 1; i <= n; i++) {
    makeStep(lines.loopFindZero, `🔁 [扫描零入度起点] for (int i = ${i}; i <= ${n}; i++)。`, `for i=${i}`, 'init');
    makeStep(lines.checkZeroDeg, `🔎 [检查入度] if (inDegree[${i}] == 0) -> (${inDegree[i]} == 0)。`, `inDegree[${i}] == 0?`, 'init');
    if (inDegree[i] === 0) {
      dp[i] = 0;
      makeStep(lines.initCostZero, `🌱 [设置起点基础开销] 节点 ${i} 无前驱依赖，dp[${i}] = 0 作为源点！`, `dp[${i}] = 0`, 'init', 'dp', i);
      queue.push(i);
      makeStep(lines.pushZeroQueue, `📥 [源点入队] queue[r++] = ${i}；当前队列: [${queue.join(', ')}]。`, `queue.push(${i})`, 'push', 'queue', queue.length - 1);
    }
  }

  // 2. 拓扑排序与 DP 状态转移
  let totalMax = 0;
  while (queue.length > 0) {
    makeStep(lines.whileQueue, `🔁 [拓扑队列循环] while (l < r) -> 队列非空 (余 ${queue.length} 个节点)。`, `while queue`, 'pop');

    curNode = queue.shift()!;
    makeStep(lines.popNode, `📤 [弹出队首拓扑节点] int u = queue[l++] -> 弹出 Node ${curNode}！`, `pop Node ${curNode}`, 'pop', 'queue', 0);

    totalMax = Math.max(totalMax, dp[curNode]);
    makeStep(lines.updateAns, `📈 [更新全局最长路] totalMax = max(${totalMax}, dp[${curNode}]=${dp[curNode]}) = ${totalMax}。`, `totalMax = ${totalMax}`, 'pop');

    for (const e of adj[curNode]) {
      const v = e.to;
      const w = e.w;
      activeEdge = { u: curNode, v, w };

      makeStep(lines.loopNeighbors, `  ↳ [考察后继边] for (int v : graph[${curNode}]) -> 边 (${curNode} ➔ ${v}, 耗时 ${w})。`, `visit (${curNode}, ${v})`, 'relax');

      const oldDp = dp[v];
      if (dp[curNode] + w > dp[v]) {
        dp[v] = dp[curNode] + w;
        pre[v] = curNode;
      }
      makeStep(lines.relaxCost, `  🔄 [拓扑状态转移] dp[${v}] = max(${oldDp}, dp[${curNode}]+${w}) = ${dp[v]}！`, `dp[${v}]=${dp[v]}`, 'relax', 'dp', v);

      inDegree[v]--;
      makeStep(lines.decInDeg, `  📉 [消除依赖度] if (--inDegree[${v}] == 0) -> 入度减为 ${inDegree[v]}。`, `inDegree[${v}]--`, 'relax', 'inDegree', v);

      if (inDegree[v] === 0) {
        queue.push(v);
        makeStep(lines.pushNextQueue, `  🎉 [后继入度清零] 节点 ${v} 的所有前驱均已推演完毕！queue[r++] = ${v} 入队！`, `queue.push(${v})`, 'push', 'queue', queue.length - 1);
      }
    }
    activeEdge = undefined;
  }

  makeStep(lines.returnAns, `🎉 [DAG 最长路确立] return totalMax = ${totalMax}！关键路径长度为 ${totalMax}，全图无后效性拓扑推进圆满完成！`, `return ${totalMax}`, 'done');

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<TopoDPStep>({
  id: 'topo-dp',
  name: '拓扑排序与动态规划 (Topological DP)',
  viewId: 'algo-topo-dp-view',
  category: 'graph',
  icon: '📈',
  badge: {
    mode: 'DAG 拓扑线性递推 · 最长关键路径 CPM',
    complexity: 'O(V + E) · O(V + E)',
  },
  card1Title: '📈 DAG 网络拓扑与关键路径舱',
  card2Title: '📊 拓扑 DP 监视器 (dp, 入度, 队列, 关键路径)',
  card2Desc: '展示拓扑序入度递减、dp[v] = max(dp[v], dp[u] + w) 动态规划转移与最长路重构',
  legend: [
    { label: '⚡ 当前出队拓扑节点', color: '#f59e0b' },
    { label: '🏆 最长关键路径节点/边', color: '#10b981' },
    { label: '📥 队列中待处理', color: '#38bdf8' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设 DAG 网络结构',
      type: 'select',
      defaultValue: 'classic_5node',
      options: [
        { label: '5 节点工程网络 (关键路径 1->2->4->5，长度 9)', value: 'classic_5node' },
        { label: '4 节点经典网络 (关键路径 1->2->4，长度 7)', value: 'simple_4node' },
      ],
    },
  ],
  presets: [
    { label: '5 节点工程网络', values: { 'input-preset': 'classic_5node' } },
    { label: '4 节点经典网络', values: { 'input-preset': 'simple_4node' } },
  ],
  metrics: [
    { id: 'metric-topodp-cur', label: '当前拓扑节点', color: '#f59e0b' },
    { id: 'metric-topodp-max', label: '当前最长路径', color: '#10b981' },
    { id: 'metric-topo-queue', label: '当前拓扑就绪队列', color: '#38bdf8' },
    { id: 'metric-topodp-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: TOPO_DP_CODE_LANGUAGES,
  problemHtml: TOPO_DP_PROBLEM_HTML,
  analysisHtml: TOPO_DP_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_5node') as string;
    return buildTopoDPSteps(preset);
  },
  renderCanvas: (container, step) => {
    const is5Node = Object.keys(step.dpDist).length === 5;
    const n = is5Node ? 5 : 4;

    const nodeCoords: Record<number, { x: number; y: number }> = is5Node
      ? {
          1: { x: 45, y: 85 },
          2: { x: 115, y: 45 },
          3: { x: 115, y: 125 },
          4: { x: 195, y: 85 },
          5: { x: 265, y: 85 },
        }
      : {
          1: { x: 55, y: 85 },
          2: { x: 135, y: 45 },
          3: { x: 135, y: 125 },
          4: { x: 245, y: 85 },
        };

    const edges = is5Node
      ? [
          { u: 1, v: 2, w: 3 },
          { u: 1, v: 3, w: 2 },
          { u: 2, v: 4, w: 4 },
          { u: 3, v: 4, w: 1 },
          { u: 4, v: 5, w: 2 },
        ]
      : [
          { u: 1, v: 2, w: 3 },
          { u: 1, v: 3, w: 2 },
          { u: 2, v: 4, w: 4 },
          { u: 3, v: 4, w: 3 },
        ];

    const isCriticalEdge = (u: number, v: number) => {
      if (!step.criticalPath) return false;
      const idx = step.criticalPath.indexOf(u);
      return idx !== -1 && step.criticalPath[idx + 1] === v;
    };

    const svgEdges = edges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';

        const isAct = step.activeEdge && step.activeEdge.u === e.u && step.activeEdge.v === e.v;
        const isCrit = isCriticalEdge(e.u, e.v);

        const color = isAct ? '#facc15' : isCrit ? '#10b981' : '#64748b';
        const width = isCrit ? 3.5 : isAct ? 3 : 1.5;

        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" marker-end="url(#topo-arrow)" />
            <rect x="${mx - 7}" y="${my - 7}" width="14" height="12" rx="3" fill="#0f172a" stroke="#334155" />
            <text x="${mx}" y="${my + 2}" fill="#94a3b8" font-size="8" font-weight="700" text-anchor="middle">${e.w}</text>
          </g>
        `;
      })
      .join('');

    const nodes = is5Node ? [1, 2, 3, 4, 5] : [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';

        const isCur = step.curNode === u && step.status !== 'done';
        const inQueue = step.topoQueue.includes(u);
        const isCritNode = step.criticalPath && step.criticalPath.includes(u);

        const bg = isCur ? '#b45309' : isCritNode ? '#065f46' : inQueue ? '#1e3a8a' : '#1e293b';
        const border = isCur ? '#facc15' : isCritNode ? '#10b981' : inQueue ? '#38bdf8' : '#475569';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="16" fill="${bg}" stroke="${border}" stroke-width="${isCur || isCritNode ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 24}" fill="#94a3b8" font-size="7.5" font-weight="700" text-anchor="middle">dp:${step.dpDist[u] || 0}</text>
          </g>
        `;
      })
      .join('');

    const critPathBadges = step.criticalPath && step.criticalPath.length > 0
      ? step.criticalPath.map((u, idx) => `<span style="background: rgba(6, 95, 70, 0.5); border: 1px solid #10b981; border-radius: 4px; padding: 2px 8px; font-size: 11px; color: #a7f3d0; font-family: monospace; font-weight: 700;">${idx === 0 ? '' : '➔ '}Node ${u}</span>`).join(' ')
      : '<span style="font-size: 10.5px; color: #64748b;">(拓扑递推计算中...)</span>';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; justify-content: flex-start; align-items: stretch; background: #0b0f19; padding: 12px; border-radius: 8px; box-sizing: border-box; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 700;">📈 DAG 有向无环工程网络</span>
          <span style="font-size: 11px; color: #e2e8f0; background: #1e293b; padding: 2px 8px; border-radius: 4px; border: 1px solid #334155;">
            就绪入队节点: <b style="color: #38bdf8;">${step.topoQueue.length}</b> 个
          </span>
        </div>

        <div style="width: 100%; min-height: 150px; background: #0f172a; border-radius: 8px; display: flex; justify-content: center; align-items: center; border: 1px solid #334155;">
          <svg style="width: 100%; height: 150px;" viewBox="0 0 310 150">
            <defs>
              <marker id="topo-arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
              </marker>
            </defs>
            ${svgEdges}
            ${svgNodes}
          </svg>
        </div>

        <!-- 底部关键路径舱 -->
        <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 10px 14px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11.5px; font-weight: 800; color: #cbd5e1;">🏆 工程最长关键路径舱 (CPM)</span>
            <div style="font-size: 11px; color: #10b981;">
              最长耗时: <b>${Math.max(...Object.values(step.dpDist))}</b>
            </div>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
            ${critPathBadges}
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const is5Node = Object.keys(step.dpDist).length === 5;
    const n = is5Node ? 5 : 4;
    const indices = Array.from({ length: n }, (_, i) => i + 1);

    const renderRow = (name: string, arr: number[], activeName: string, color: string) => {
      const cells = indices
        .map((idx) => {
          const val = arr[idx] ?? 0;
          const isActive = step.activeArray === activeName && step.activeSlot === idx;
          const bg = isActive ? '#78350f' : '#1e293b';
          const textCol = isActive ? '#fde047' : '#e2e8f0';
          const border = isActive ? '2px solid #eab308' : '1px solid #475569';

          return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 34px; height: 32px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 11px; font-weight: 700;">
              <span style="font-size: 8px; color: #94a3b8; line-height: 1;">N[${idx}]</span>
              <span style="line-height: 1.1;">${val}</span>
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

    const dpRow = renderRow('dp[] (最长路)', step.dpArray, 'dp', '#10b981');
    const inDegRow = renderRow('inDegree[] (入度)', step.inDegreeArray, 'inDegree', '#f59e0b');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #cbd5e1; padding: 4px 8px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 6px; background: #0f172a; padding: 10px; border-radius: 6px; border: 1px solid #334155;">
          ${dpRow}
          ${inDegRow}
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #334155; padding-top: 4px;">
            <span style="color: #38bdf8; font-size: 10.5px; font-weight: 700;">拓扑队列:</span>
            <strong style="color: #38bdf8; font-family: monospace; font-size: 11px;">[ ${step.topoQueue.join(', ') || '空'} ]</strong>
          </div>
        </div>
      </div>
    `;
  },
});

registerAlgorithm({
  id: 'topo-dp',
  name: '拓扑排序与动态规划 (Topological DP)',
  viewId: 'algo-topo-dp-view',
  category: 'graph',
  description: '经典 DAG 动态规划：拓扑排序保证无后效性、dp[v] = max(dp[v], dp[u] + w) 递推最长路 (洛谷 P4017 / LeetCode 2050)',
  icon: '📈',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 60,
  learningGoal: '掌握 DAG 拓扑排序消除后效性机理、有向无环图最长路与关键路径算法 (CPM)',
});

export { Visualizer as TopoDPVisualizer };
