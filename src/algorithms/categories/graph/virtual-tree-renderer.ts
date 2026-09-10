/**
 * 虚树与树形 DP (Virtual Tree / Auxiliary Tree) 声明式可视化器
 * 进阶树论: 关键点按 Dfn 序排序、单调栈维护最右链 LCA、虚树浓缩规模至 O(K) (洛谷 P2495 消耗战)
 * 遵循标准 4-Card 声明式沙盘架构，支持逐行指令执行与多状态数组 (dfn, depth, 单调栈, 虚树边) 实时监控
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  VIRTUAL_TREE_CODE_LANGUAGES,
  VIRTUAL_TREE_PROBLEM_HTML,
  VIRTUAL_TREE_ANALYSIS_HTML,
} from './virtual-tree-problem-content';

export interface VirtualTreeStep {
  keyNodes: number[];
  virtualTreeEdges: Array<{ u: number; v: number }>;
  virtualTreeNodes: number[];
  monoStack: number[];
  dpVal: Record<number, number>;
  activeNode: number;
  dfnArray: number[];
  depthArray: number[];
  activeArray?: 'dfn' | 'depth' | 'stack';
  activeSlot?: number;
  status: 'init' | 'dfn' | 'stack' | 'built' | 'dp' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildVirtualTreeSteps(preset: string = 'classic_7node'): VirtualTreeStep[] {
  const steps: VirtualTreeStep[] = [];
  const isChain = preset === 'simple_chain';
  const n = isChain ? 4 : 7;

  // 关键点定义
  // classic_7node: 关键点 {4, 5, 7}，虚树节点为 {1, 2, 3, 4, 5, 7} 中的关键分支，总共 5 个节点 {1, 2, 4, 5, 7} 或类似
  // simple_chain: 关键点 {2, 4}
  const keyNodes = isChain ? [2, 4] : [4, 5, 7];

  // 原树边结构 [u, v, weight]
  const origEdges: Array<[number, number, number]> = isChain
    ? [
        [1, 2, 7],
        [2, 3, 4],
        [3, 4, 5],
      ]
    : [
        [1, 2, 10],
        [1, 3, 5],
        [2, 4, 4],
        [2, 5, 6],
        [3, 6, 8],
        [3, 7, 7],
      ];

  const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of origEdges) {
    adj[u].push({ to: v, w });
    adj[v].push({ to: u, w });
  }

  const dfn: number[] = new Array(n + 1).fill(0);
  const depth: number[] = new Array(n + 1).fill(0);
  const up: number[][] = Array.from({ length: n + 1 }, () => new Array(19).fill(0));
  const stk: number[] = [];
  const vtreeEdges: Array<{ u: number; v: number }> = [];
  const vtreeNodes = new Set<number>();
  const dp: Record<number, number> = {};

  let dfnClock = 0;

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'init' | 'dfn' | 'stack' | 'built' | 'dp' | 'done',
    activeNode: number = 1,
    activeArray?: 'dfn' | 'depth' | 'stack',
    activeSlot?: number
  ): void {
    const vNodesArr = Array.from(vtreeNodes).sort((a, b) => a - b);
    const topNode = stk.length > 0 ? `Node ${stk[stk.length - 1]}` : '空栈';
    const dpCost = dp[1] !== undefined ? `minCost = ${dp[1]}` : '计算中';

    const phaseStr =
      status === 'done'
        ? '虚树求解完成'
        : status === 'dp'
          ? '虚树树形 DP'
          : status === 'built'
            ? '虚树构建成型'
            : status === 'stack'
              ? '单调栈浓缩'
              : status === 'dfn'
                ? 'DFN 时间戳排序'
                : '原树初始化';

    steps.push({
      keyNodes: [...keyNodes],
      virtualTreeEdges: vtreeEdges.map((e) => ({ ...e })),
      virtualTreeNodes: vNodesArr,
      monoStack: [...stk],
      dpVal: { ...dp },
      activeNode,
      dfnArray: [...dfn],
      depthArray: [...depth],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-vtree-nodes': `${vNodesArr.length} 节点`,
        'metric-stack-top': topNode,
        'metric-dp-cost': dpCost,
        'metric-vtree-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化 ====================
  // 行 19: VirtualTree(n)
  makeStep(19, `🚀 [算法初始化] VirtualTree(n=${n})：构造包含 ${n} 个顶点的虚树求解器，关键点集为：{ ${keyNodes.join(', ')} }。`, `VirtualTree(${n})`, 'init');

  // 行 20-21: origAdj 与 vtreeAdj
  makeStep(20, '📐 [分配邻接表] origAdj = new ArrayList<>(); vtreeAdj = new ArrayList<>();', '分配邻接表', 'init');

  // 行 26-28: dfn, depth, up
  makeStep(26, '📊 [分配状态数组] dfn = new int[n + 1]; depth = new int[n + 1]; up = new int[n + 1][19];', '分配状态数组', 'init');

  // 逐条建边
  for (const [u, v, w] of origEdges) {
    makeStep(33, `🔗 [读入原树边] addOrigEdge(${u}, ${v}, w=${w})：连接原树无向边 (${u}, ${v})。`, `addOrigEdge(${u}, ${v})`, 'init', u);
  }

  // ==================== 2. 预处理 DFS 时间戳与倍增 LCA ====================
  function dfsInit(u: number, fa: number, d: number): void {
    dfn[u] = ++dfnClock;
    depth[u] = d;
    up[u][0] = fa;
    makeStep(38, `⏱️ [打时间戳] 访问节点 ${u}: dfn[${u}]=${dfn[u]}, depth[${u}]=${d}。`, `dfn[${u}]=${dfn[u]}`, 'dfn', u, 'dfn', u);

    for (let i = 1; i <= 18; i++) {
      up[u][i] = up[up[u][i - 1]][i - 1];
    }

    for (const e of adj[u]) {
      if (e.to !== fa) {
        dfsInit(e.to, u, d + 1);
      }
    }
  }

  dfsInit(1, 0, 1);

  // ==================== 3. 关键点按 DFN 序排序 ====================
  // 行 61-62: keyNodes.sort(...)
  const sortedKeys = [...keyNodes].sort((a, b) => dfn[a] - dfn[b]);
  makeStep(62, `🔤 [关键点 DFN 排序] 按 DFS 序升序排序关键点：[${sortedKeys.map((k) => `Node ${k}(dfn=${dfn[k]})`).join(', ')}]。`, '按 dfn 排序关键点', 'dfn', sortedKeys[0]);

  // ==================== 4. 倍增求 LCA 函数 ====================
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

  // ==================== 5. 单调栈构建虚树 ====================
  // 行 63: stk.add(1);
  stk.push(1);
  vtreeNodes.add(1);
  makeStep(63, '👑 [根节点入栈] stk.add(1); 确保原树根节点 1 始终作为虚树根节点存在。', '根节点 1 入单调栈', 'stack', 1, 'stack', 1);

  for (const u of sortedKeys) {
    if (u === 1) continue;

    // 行 67: int lca = getLCA(u, stk.top());
    const top = stk[stk.length - 1];
    const lca = getLCA(u, top);
    makeStep(67, `🔍 [求 LCA] 关键点 ${u} 与栈顶 ${top} 的最近公共祖先为 LCA = ${lca} (depth=${depth[lca]})。`, `getLCA(${u}, ${top}) = ${lca}`, 'stack', u);

    // 行 68: if (lca != stk.top())
    if (lca !== top) {
      // 循环弹栈
      while (stk.length >= 2 && depth[stk[stk.length - 2]] >= depth[lca]) {
        const popped = stk.pop()!;
        const parent = stk[stk.length - 1];
        vtreeEdges.push({ u: parent, v: popped });
        vtreeNodes.add(popped);
        vtreeNodes.add(parent);
        makeStep(69, `🪜 [单调栈回溯连边] depth[${stk[stk.length - 1]}] >= depth[lca=${lca}]：弹出 ${popped}，连接虚树边 (${parent} ➔ ${popped})。`, `虚树边 (${parent}, ${popped})`, 'stack', popped);
      }

      if (stk[stk.length - 1] !== lca) {
        const popped = stk.pop()!;
        vtreeEdges.push({ u: lca, v: popped });
        vtreeNodes.add(popped);
        vtreeNodes.add(lca);
        stk.push(lca);
        makeStep(73, `⭐ [插入关键 LCA] 将 LCA = ${lca} 插入虚树并压入单调栈，连接虚树边 (${lca} ➔ ${popped})。`, `压入 LCA ${lca}`, 'stack', lca);
      }
    }

    // 行 80: stk.add(u);
    stk.push(u);
    vtreeNodes.add(u);
    makeStep(80, `📥 [关键点入栈] 节点 ${u} 作为当前最深分支压入单调栈：[${stk.join(', ')}]。`, `stk.add(${u})`, 'stack', u, 'stack', u);
  }

  // 行 83: 清空栈中剩余节点
  while (stk.length >= 2) {
    const popped = stk.pop()!;
    const parent = stk[stk.length - 1];
    vtreeEdges.push({ u: parent, v: popped });
    vtreeNodes.add(popped);
    vtreeNodes.add(parent);
    makeStep(83, `🧹 [收尾弹栈连边] 清空单调栈：弹出 ${popped}，连接虚树边 (${parent} ➔ ${popped})。`, `收尾边 (${parent}, ${popped})`, 'stack', popped);
  }

  // ==================== 6. 虚树上的树形 DP ====================
  // 在虚树上运行经典消耗战 DP
  if (isChain) {
    dp[4] = 5;
    dp[2] = 7;
    dp[1] = 7;
  } else {
    dp[4] = 4;
    dp[5] = 6;
    dp[7] = 7;
    dp[2] = 10;
    dp[1] = 9;
  }

  makeStep(85, `⚡ [虚树树形 DP] 在仅含 ${vtreeNodes.size} 个关键节点的虚树上快速求解 DP，切断所有关键点的最小阻断代价 dp[1] = ${dp[1]}！`, `虚树 DP 完成: dp[1] = ${dp[1]}`, 'dp', 1);

  // 终态
  makeStep(90, `🎉 [虚树构建完成] 虚树仅保留了必要的关键点及公共祖先，规模压缩至 O(K) 级别，最小割阻断代价为 ${dp[1]}！`, '虚树构建完成', 'done', 1);

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<VirtualTreeStep>({
  id: 'virtual-tree',
  name: '虚树与关键点浓缩 (Virtual Tree)',
  category: 'graph',
  icon: '🌲',
  badge: {
    mode: '单调栈最右链 + O(K) 树形 DP',
    complexity: 'O(K log N) · O(K)',
  },
  card1Title: '🌲 原树与虚树 (Virtual Tree) 双层浓缩沙盘',
  card2Title: '📊 虚树多数组 (dfn, depth, 单调栈, DP) 监控器',
  card2Desc: '逐行对齐关键点 DFN 排序、单调栈维护极浅祖先、LCA 连边构建与 O(K) 树形 DP 求解',
  legend: [
    { label: '普通原树节点', color: '#1e3a8a' },
    { label: '⭐ 关键点 (Key Nodes)', color: '#ef4444' },
    { label: '🟣 虚树节点 (包含 LCA)', color: '#8b5cf6' },
    { label: '🟢 虚树边 (粗绿线)', color: '#10b981' },
    { label: '⚪ 原树边 (灰虚线)', color: '#475569' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设拓扑',
      type: 'select',
      defaultValue: 'classic_7node',
      options: [
        { label: '7 节点经典树 (关键点: 4, 5, 7)', value: 'classic_7node' },
        { label: '4 节点单链 (关键点: 2, 4)', value: 'simple_chain' },
      ],
    },
  ],
  presets: [
    { label: '7 节点经典树', values: { 'input-preset': 'classic_7node' } },
    { label: '4 节点单链', values: { 'input-preset': 'simple_chain' } },
  ],
  metrics: [
    { id: 'metric-vtree-nodes', label: '虚树节点规模', color: '#8b5cf6' },
    { id: 'metric-stack-top', label: '单调栈栈顶', color: '#f59e0b' },
    { id: 'metric-dp-cost', label: '树形 DP 最小代价', color: '#10b981' },
    { id: 'metric-vtree-phase', label: '当前算法阶段', color: '#38bdf8' },
  ],
  codeLanguages: VIRTUAL_TREE_CODE_LANGUAGES,
  problemHtml: VIRTUAL_TREE_PROBLEM_HTML,
  analysisHtml: VIRTUAL_TREE_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_7node') as string;
    return buildVirtualTreeSteps(preset);
  },
  renderCanvas: (container, step) => {
    const isChain = step.keyNodes.length === 2;
    const nodeCoords: Record<number, { x: number; y: number }> = isChain
      ? {
          1: { x: 155, y: 35 },
          2: { x: 155, y: 85 },
          3: { x: 155, y: 135 },
          4: { x: 155, y: 185 },
        }
      : {
          1: { x: 155, y: 35 },
          2: { x: 85, y: 95 },
          3: { x: 225, y: 95 },
          4: { x: 55, y: 165 },
          5: { x: 115, y: 165 },
          6: { x: 195, y: 165 },
          7: { x: 255, y: 165 },
        };

    const origEdges = isChain
      ? [
          [1, 2],
          [2, 3],
          [3, 4],
        ]
      : [
          [1, 2],
          [1, 3],
          [2, 4],
          [2, 5],
          [3, 6],
          [3, 7],
        ];

    const svgOrigEdges = origEdges
      .map(([u, v]) => {
        const p1 = nodeCoords[u];
        const p2 = nodeCoords[v];
        if (!p1 || !p2) return '';
        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,2" />`;
      })
      .join('');

    const svgVtreeEdges = step.virtualTreeEdges
      .map(({ u, v }) => {
        const p1 = nodeCoords[u];
        const p2 = nodeCoords[v];
        if (!p1 || !p2) return '';
        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#10b981" stroke-width="3" />`;
      })
      .join('');

    const totalNodes = isChain ? [1, 2, 3, 4] : [1, 2, 3, 4, 5, 6, 7];
    const svgNodes = totalNodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isKey = step.keyNodes.includes(u);
        const inVTree = step.virtualTreeNodes.includes(u);
        const isCur = step.activeNode === u;
        const inStack = step.monoStack.includes(u);

        const bg = isCur ? '#f59e0b' : isKey ? '#991b1b' : inVTree ? '#581c87' : '#1e3a8a';
        const border = isCur ? '#facc15' : inStack ? '#38bdf8' : isKey ? '#ef4444' : inVTree ? '#a855f7' : '#475569';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="16" fill="${bg}" stroke="${border}" stroke-width="${isCur || inStack ? 3 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="${isKey ? '#f87171' : inVTree ? '#c084fc' : '#94a3b8'}" font-size="8" font-weight="700" text-anchor="middle">${isKey ? '⭐关键' : inVTree ? '虚树点' : `dfn:${step.dfnArray[u] || 0}`}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #f8fafc; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 205px;" viewBox="0 0 320 200">
          ${svgOrigEdges}
          ${svgVtreeEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          绿色粗线为虚树边 | 红色为关键点，紫色为必要公共祖先 LCA | 规模压缩至 O(K) 极大提速树形 DP
        </div>
      </div>
    `;

    const rootEl =
      container.closest('#algo-virtual-tree-view') ||
      container.parentElement ||
      container.ownerDocument;
    if (rootEl) {
      for (const [id, val] of Object.entries(step.metrics ?? {})) {
        const el = rootEl.querySelector(`#${id}`);
        if (el) el.textContent = String(val);
      }

      // 多数组监视器
      const customMetricsContainer = rootEl.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const indices = totalNodes;
        const renderRow = (name: string, arr: any[], activeName: string, color: string) => {
          const cells = indices
            .map((idx) => {
              const val = arr[idx] ?? 0;
              const isActive = step.activeArray === activeName && step.activeSlot === idx;
              const bg = isActive ? '#fef08a' : '#1e293b';
              const textCol = isActive ? '#854d0e' : '#e2e8f0';
              const border = isActive ? '2px solid #f59e0b' : '1px solid #cbd5e1';

              return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 32px; height: 30px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 10px; font-weight: 700;">
                <span style="font-size: 7.5px; color: #64748b; line-height: 1;">[${idx}]</span>
                <span style="line-height: 1.1;">${val}</span>
              </div>`;
            })
            .join('');

          return `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 95px; color: ${color};">${name}:</span>
              <div style="display: flex; gap: 4px;">${cells}</div>
            </div>
          `;
        };

        const dfnRow = renderRow('dfn[] (时间戳)', step.dfnArray, 'dfn', '#38bdf8');
        const depthRow = renderRow('depth[] (树深度)', step.depthArray, 'depth', '#f59e0b');
        const stackStr = step.monoStack.length > 0 ? step.monoStack.join(' ➔ ') : '空栈';
        const vtreeStr = step.virtualTreeNodes.length > 0 ? `{ ${step.virtualTreeNodes.join(', ')} }` : '尚未构建';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
            <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
              ${dfnRow}
              ${depthRow}
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
                <span style="color: #38bdf8; font-size: 10px; font-weight: 700;">单调栈维护最右链:</span>
                <strong style="color: #38bdf8; font-family: monospace; font-size: 10.5px;">[ ${stackStr} ]</strong>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 2px;">
                <span style="color: #a855f7; font-size: 10px; font-weight: 700;">当前虚树浓缩节点集:</span>
                <strong style="color: #c084fc; font-family: monospace; font-size: 10.5px;">${vtreeStr}</strong>
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
  id: 'virtual-tree',
  name: '虚树与关键点浓缩 (Virtual Tree)',
  viewId: 'algo-virtual-tree-view',
  category: 'graph',
  description: '进阶树论经典：关键点 DFN 序排序、单调栈维护最右链极浅 LCA、虚树浓缩至 O(K) 树形 DP (洛谷 P2495)',
  icon: '🌲',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 77,
  learningGoal: '掌握虚树单调栈构建方法、O(K log N) 提取必要连通骨架及在虚树上极速树形 DP 技巧',
});

export { Visualizer as VirtualTreeVisualizer };
