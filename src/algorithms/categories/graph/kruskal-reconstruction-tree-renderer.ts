/**
 * Kruskal 重构树 (Kruskal Reconstruction Tree) 声明式可视化器
 * 进阶树论: 边权转化为新节点点权、大根堆性质、瓶颈路径转化为 LCA 点权、子树对应连通块 (洛谷 P4768 / P4197)
 * 遵循标准 4-Card 声明式沙盘架构，支持逐行指令执行与多状态数组 (father, val, 重构树边) 实时监控
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  KRUSKAL_TREE_CODE_LANGUAGES,
  KRUSKAL_TREE_PROBLEM_HTML,
  KRUSKAL_TREE_ANALYSIS_HTML,
} from './kruskal-reconstruction-tree-problem-content';

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
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildKruskalTreeSteps(preset: string = 'classic_4node'): KruskalTreeStep[] {
  const steps: KruskalTreeStep[] = [];
  const is3Node = preset === 'star_3node';
  const n = is3Node ? 3 : 4;

  // 原始边集 [u, v, w]
  // classic_4node: (1,2,2), (2,3,3), (3,4,4), (1,4,5)
  // star_3node: (1,2,3), (2,3,5)
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

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'init' | 'sort' | 'merge' | 'skip' | 'tree_done' | 'query' | 'done',
    newNodeId?: number,
    activeNodes?: number[],
    activeArray?: 'father' | 'val',
    activeSlot?: number
  ): void {
    const rootNode = nodeCount;
    const rootStr = `Node ${rootNode} (权值: ${val[rootNode] || 0})`;
    const edgeStr = curEdge ? `${curEdge.u}-${curEdge.v} (w:${curEdge.w})` : '无';
    const lcaStr = queryLCA ? `LCA(${queryLCA.u}, ${queryLCA.v}) = ${queryLCA.lca} (瓶颈: ${queryLCA.val})` : '构建中';

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
      codeLine,
      metrics: {
        'metric-kruskal-root': rootStr,
        'metric-lca-bottleneck': lcaStr,
        'metric-cur-edge': edgeStr,
        'metric-kruskal-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化 ====================
  // 行 12: father = new int[2 * n + 1];
  makeStep(12, `🚀 [算法初始化] father = new int[${2 * n + 1}]; 为 2*n 个节点分配并查集。`, '分配 father 数组', 'init', undefined, undefined, 'father');

  // 行 13: val = new int[2 * n + 1];
  makeStep(13, '📊 [分配点权数组] val = new int[2 * n + 1]; 记录重构树虚节点的边权点权。', '分配 val 数组', 'init', undefined, undefined, 'val');

  // 行 14: tree 邻接表
  makeStep(14, '📐 [分配重构树表] tree = new ArrayList<>(); 准备容纳有向重构树边。', '分配 tree 邻接表', 'init');

  // 行 15: father[i] = i
  for (let i = 1; i <= n; i++) father[i] = i;
  makeStep(15, `📌 [实体点自环初始化] 初始化前 n=${n} 个实体点 father[i] = i，初始代表元为自身。`, '初始化 father 1..n', 'init');

  // 行 19: nodeCount = n;
  makeStep(19, `🔢 [确立初始节点计数] nodeCount = ${n}；后续每合并一条边将新增一个虚节点。`, `nodeCount = ${n}`, 'init');

  // ==================== 2. 边权升序排序 ====================
  // 行 20: edges.sort(...)
  edges.sort((a, b) => a.w - b.w);
  makeStep(20, `🔤 [边权升序排序] 将图中的边按权值升序排序：[${edges.map((e) => `(${e.u},${e.v},w:${e.w})`).join(', ')}]。`, '边权升序排序', 'sort');

  // ==================== 3. 逐条考察并构建重构树 ====================
  for (const e of edges) {
    curEdge = e;
    // 行 22: for (Edge e : edges)
    makeStep(22, `🔍 [考察边] 检验边 (${e.u} ➔ ${e.v}, w=${e.w})。`, `考察 (${e.u}, ${e.v})`, 'merge');

    // 行 23: int fu = find(e.u), fv = find(e.v);
    const fu = find(e.u);
    const fv = find(e.v);
    makeStep(23, `🔎 [查找连通分量] find(${e.u}) = ${fu}, find(${e.v}) = ${fv}。`, `fu=${fu}, fv=${fv}`, 'merge', undefined, [fu, fv]);

    // 行 24: if (fu != fv)
    if (fu !== fv) {
      // 行 25: nodeCount++;
      nodeCount++;
      const nc = nodeCount;
      makeStep(25, `➕ [新建重构虚点] 产生新虚节点 Node ${nc} 代表边 (${e.u}, ${e.v})！`, `nodeCount++ -> ${nc}`, 'merge', nc);

      // 行 26: val[nodeCount] = e.w;
      val[nc] = e.w;
      nodeWeights[nc] = e.w;
      makeStep(26, `💎 [赋予点权] val[${nc}] = ${e.w}；重构树点权满足大根堆性质！`, `val[${nc}] = ${e.w}`, 'merge', nc, undefined, 'val', nc);

      // 行 27-29: 并查集重定向
      father[nc] = nc;
      father[fu] = nc;
      father[fv] = nc;
      makeStep([27, 29], `🔗 [代表元重定向] father[${fu}] = ${nc}, father[${fv}] = ${nc}；两子连通块归属新虚点！`, `father 合并至 ${nc}`, 'merge', nc, [fu, fv], 'father', nc);

      // 行 30-31: 重构树连边
      treeEdges.push({ u: nc, v: fu });
      treeEdges.push({ u: nc, v: fv });
      makeStep([30, 31], `🌲 [添加树边] 虚点 ${nc} 分别连向两子树根 ${fu} 与 ${fv}！`, `树边 (${nc}->${fu}), (${nc}->${fv})`, 'merge', nc);
    } else {
      makeStep(24, `⚪ [环路跳过] 节点 ${e.u} 与 ${e.v} 已在同一连通块 (公共祖先 ${fu})，无需新虚点。`, `跳过环边 (${e.u}, ${e.v})`, 'skip');
    }
  }

  // ==================== 4. 瓶颈路查询定理展示 ====================
  // 行 36: queryBottleneck
  const qU = 1;
  const qV = is3Node ? 3 : 4;
  const lcaNode = nodeCount;
  queryLCA = { u: qU, v: qV, lca: lcaNode, val: val[lcaNode] };
  makeStep(36, `🎯 [LCA 瓶颈路径查询] 询问节点 ${qU} 与 ${qV} 之间的瓶颈路边权：二者在重构树上的 LCA 为 Node ${lcaNode}，点权恰为 ${val[lcaNode]}！`, `queryBottleneck(${lcaNode}) = ${val[lcaNode]}`, 'query');

  // 终态
  makeStep(36, `🎉 [Kruskal 重构树构建完毕] 总共产生 ${nodeCount} 个节点 (${n} 实体点 + ${nodeCount - n} 虚点)，任意两点最大边权等价于重构树 LCA 点权！`, '重构树构建完成', 'done', nodeCount);

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<KruskalTreeStep>({
  id: 'kruskal-reconstruction-tree',
  name: 'Kruskal 重构树 (Kruskal Reconstruction Tree)',
  viewId: 'algo-kruskal-reconstruction-tree-view',
  category: 'graph',
  icon: '🌲',
  badge: {
    mode: '边权转点权 + LCA 瓶颈查询',
    complexity: 'O(M log M + Q log N) · O(N + M)',
  },
  card1Title: '🌲 原图拓扑与 Kruskal 重构二叉树沙盘',
  card2Title: '📊 重构树多数组 (father, val, 树边) 监控器',
  card2Desc: '逐行对齐边权升序排序、新建虚点挂载代表元、点权大根堆性质与 LCA 瓶颈路等价转换',
  legend: [
    { label: '原图实体节点 (1..n)', color: '#1e3a8a' },
    { label: '💎 边权虚节点 (n+1..2n-1)', color: '#f59e0b' },
    { label: '👑 重构树根节点', color: '#10b981' },
    { label: '🟢 重构树边 (实线)', color: '#10b981' },
    { label: '⚪ 原图边 (灰虚线)', color: '#475569' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设图拓扑',
      type: 'select',
      defaultValue: 'classic_4node',
      options: [
        { label: '4 节点经典图 (虚点 5, 6, 7，树边 6 条)', value: 'classic_4node' },
        { label: '3 节点简单图 (虚点 4, 5，树边 4 条)', value: 'star_3node' },
      ],
    },
  ],
  presets: [
    { label: '4 节点经典图', values: { 'input-preset': 'classic_4node' } },
    { label: '3 节点简单图', values: { 'input-preset': 'star_3node' } },
  ],
  metrics: [
    { id: 'metric-kruskal-root', label: '当前重构树根', color: '#10b981' },
    { id: 'metric-lca-bottleneck', label: 'LCA 瓶颈路径查询', color: '#f59e0b' },
    { id: 'metric-cur-edge', label: '当前考察边', color: '#38bdf8' },
    { id: 'metric-kruskal-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: KRUSKAL_TREE_CODE_LANGUAGES,
  problemHtml: KRUSKAL_TREE_PROBLEM_HTML,
  analysisHtml: KRUSKAL_TREE_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_4node') as string;
    return buildKruskalTreeSteps(preset);
  },
  renderCanvas: (container, step) => {
    const is3Node = Object.keys(step.nodeWeights).length <= 2;
    // 节点布局坐标
    const nodeCoords: Record<number, { x: number; y: number }> = is3Node
      ? {
          1: { x: 60, y: 165 },
          2: { x: 155, y: 165 },
          3: { x: 250, y: 165 },
          4: { x: 105, y: 105 },
          5: { x: 180, y: 45 },
        }
      : {
          1: { x: 45, y: 170 },
          2: { x: 115, y: 170 },
          3: { x: 185, y: 170 },
          4: { x: 255, y: 170 },
          5: { x: 80, y: 120 },
          6: { x: 135, y: 75 },
          7: { x: 195, y: 35 },
        };

    const svgEdges = step.treeEdges
      .map(({ u, v }) => {
        const p1 = nodeCoords[u];
        const p2 = nodeCoords[v];
        if (!p1 || !p2) return '';
        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#10b981" stroke-width="2" />`;
      })
      .join('');

    const allKeys = Object.keys(nodeCoords).map(Number);
    const svgNodes = allKeys
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isVirtual = u > (is3Node ? 3 : 4);
        const wVal = step.nodeWeights[u] ?? 0;
        const isNew = step.newNodeId === u;

        const bg = isNew ? '#b45309' : isVirtual ? '#581c87' : '#1e3a8a';
        const border = isNew ? '#facc15' : isVirtual ? '#a855f7' : '#38bdf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${isNew ? 3 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 25}" fill="${isVirtual ? '#f59e0b' : '#94a3b8'}" font-size="7.5" font-weight="700" text-anchor="middle">${isVirtual ? `w:${wVal}` : `原${u}`}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 205px;" viewBox="0 0 310 200">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          紫色为边权转化虚节点，满足大根堆性质 | 重构树上 LCA(u, v) 的点权严格等于原图 u 到 v 的最小瓶颈边权！
        </div>
      </div>
    `;

    const rootEl =
      container.closest('#algo-kruskal-reconstruction-tree-view') ||
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
        const totalIndices = allKeys;
        const renderRow = (name: string, arr: any[], activeName: string, color: string) => {
          const cells = totalIndices
            .map((idx) => {
              const val = arr[idx] ?? 0;
              const isActive = step.activeArray === activeName && step.activeSlot === idx;
              const bg = isActive ? '#fef08a' : '#1e293b';
              const textCol = isActive ? '#854d0e' : '#e2e8f0';
              const border = isActive ? '2px solid #eab308' : '1px solid #475569';

              return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 30px; height: 30px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 10px; font-weight: 700;">
                <span style="font-size: 7.5px; color: #64748b; line-height: 1;">[${idx}]</span>
                <span style="line-height: 1.1;">${val}</span>
              </div>`;
            })
            .join('');

          return `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 95px; color: ${color};">${name}:</span>
              <div style="display: flex; gap: 3px;">${cells}</div>
            </div>
          `;
        };

        const fatherRow = renderRow('father[] (并查集)', step.fatherArray, 'father', '#38bdf8');
        const valRow = renderRow('val[] (虚节点权)', step.valArray, 'val', '#f59e0b');

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #cbd5e1; padding: 2px 0;">
            <div style="display: flex; flex-direction: column; gap: 4px; background: #0f172a; padding: 8px; border-radius: 6px; border: 1px solid #334155;">
              ${fatherRow}
              ${valRow}
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #334155; padding-top: 4px;">
                <span style="color: #10b981; font-size: 10px; font-weight: 700;">已生成重构树边数:</span>
                <strong style="color: #10b981; font-family: monospace; font-size: 10.5px;">${step.treeEdges.length} 条 (连通 ${Object.keys(step.nodeWeights).length} 个虚点)</strong>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: #1e293b; border: 1px solid #334155; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #94a3b8; font-size: 10.5px;">执行语句:</span>
              <strong style="color: #38bdf8; font-family: monospace; font-size: 11px;">行 ${Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine}: ${step.log}</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'kruskal-reconstruction-tree',
  name: 'Kruskal 重构树 (Kruskal Reconstruction Tree)',
  viewId: 'algo-kruskal-reconstruction-tree-view',
  category: 'graph',
  description: '进阶图论经典：边权转化为重构树虚点点权、点权满足大根堆性质、路径瓶颈边权等价于 LCA 点权 (洛谷 P4768)',
  icon: '🌲',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 81,
  learningGoal: '掌握 Kruskal 重构树构造原理、大根堆单调性定理及倍增查询瓶颈边权技巧',
});

export { Visualizer as KruskalReconstructionTreeVisualizer };
