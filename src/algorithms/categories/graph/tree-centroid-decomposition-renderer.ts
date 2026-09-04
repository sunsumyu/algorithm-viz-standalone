/**
 * 树分治与点分治 (Tree Centroid Decomposition - 静态点分治) 声明式可视化器
 * 进阶树论: 递归寻找子树重心、最大子树不超过 size/2、路径经过重心与子树容斥 (POJ 1741 / 洛谷 P3806)
 * 遵循标准 4-Card 声明式沙盘架构，支持逐行指令执行与多状态数组 (sz, maxSubtree, vis) 实时监控
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TREE_CENTROID_CODE_LANGUAGES,
  TREE_CENTROID_PROBLEM_HTML,
  TREE_CENTROID_ANALYSIS_HTML,
} from './tree-centroid-decomposition-problem-content';

export interface StaticCentroidStep {
  curCentroid: number;
  maxSubtreeSize: number;
  subtreeSizes: Record<number, number>;
  visitedNodes: number[];
  activeNodes?: number[];
  pathInfo?: { u: number; v: number; dist: number; isCross: boolean };
  layer: number;
  szArray: number[];
  maxSubtreeArray: number[];
  visArray: boolean[];
  activeArray?: 'sz' | 'maxSubtree' | 'vis';
  activeSlot?: number;
  status: 'init' | 'find_root' | 'calc_path' | 'inclusion_exclusion' | 'isolate' | 'recurse' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildStaticCentroidSteps(preset: string = 'classic_7node'): StaticCentroidStep[] {
  const steps: StaticCentroidStep[] = [];
  const isLine = preset === 'line_5node';
  const n = isLine ? 5 : 7;

  // 树边定义 [u, v, w]
  const edges: Array<[number, number, number]> = isLine
    ? [
        [1, 2, 1],
        [2, 3, 1],
        [3, 4, 1],
        [4, 5, 1],
      ]
    : [
        [1, 2, 2],
        [1, 3, 3],
        [2, 4, 1],
        [2, 5, 2],
        [3, 6, 1],
        [3, 7, 2],
      ];

  const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of edges) {
    adj[u].push({ to: v, w });
    adj[v].push({ to: u, w });
  }

  const sz: number[] = new Array(n + 1).fill(0);
  const maxSubtree: number[] = new Array(n + 1).fill(0);
  const vis: boolean[] = new Array(n + 1).fill(false);
  const visitedNodes: number[] = [];

  let curCentroid = 1;
  let maxSubtreeSize = 0;
  let layer = 1;
  let root = 1;
  let maxPart = Infinity;
  let totalNodes = n;

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'init' | 'find_root' | 'calc_path' | 'inclusion_exclusion' | 'isolate' | 'recurse' | 'done',
    activeNodes?: number[],
    activeArray?: 'sz' | 'maxSubtree' | 'vis',
    activeSlot?: number
  ): void {
    const szRec: Record<number, number> = {};
    for (let i = 1; i <= n; i++) szRec[i] = sz[i];

    const phaseStr =
      status === 'done'
        ? '分治结束'
        : status === 'recurse'
          ? '子块分治递归'
          : status === 'isolate'
            ? '隔离当前重心'
            : status === 'calc_path'
              ? '跨重心路径统计'
              : status === 'find_root'
                ? '寻找树重心'
                : '算法初始化';

    steps.push({
      curCentroid,
      maxSubtreeSize,
      subtreeSizes: szRec,
      visitedNodes: [...visitedNodes],
      activeNodes,
      layer,
      szArray: [...sz],
      maxSubtreeArray: [...maxSubtree],
      visArray: [...vis],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-cur-centroid': `Node ${curCentroid} (层 ${layer})`,
        'metric-max-subtree': `${maxSubtreeSize} ≤ ${Math.floor(totalNodes / 2)}`,
        'metric-path-count': `已分治重心: { ${visitedNodes.join(', ') || '无'} }`,
        'metric-centroid-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化 ====================
  // 行 7: Code01_CentroidDecomposition
  makeStep(7, `🚀 [算法初始化] 建立包含 ${n} 个顶点的树，准备进行树上重心点分治。`, `init(${n})`, 'init');

  // ==================== 2. 寻找树重心 getCentroid ====================
  function getCentroid(u: number, p: number): void {
    // 行 8: sz[u] = 1; maxSubtree[u] = 0;
    sz[u] = 1;
    maxSubtree[u] = 0;
    makeStep(8, `📐 [子树初始化] 探查 Node ${u}: 初始 sz[${u}]=1, maxSubtree[${u}]=0。`, `getCentroid(${u})`, 'find_root', [u], 'sz', u);

    // 行 10: 遍历邻居
    for (const e of adj[u]) {
      const v = e.to;
      if (v !== p && !vis[v]) {
        getCentroid(v, u);
        sz[u] += sz[v];
        maxSubtree[u] = Math.max(maxSubtree[u], sz[v]);
        makeStep(14, `➕ [子树累加] Node ${u} 累加子节点 ${v} (大小 ${sz[v]}) -> sz[${u}]=${sz[u]}, 最大分支 maxSubtree[${u}]=${maxSubtree[u]}。`, `sz[${u}]+=${sz[v]}`, 'find_root', [u], 'maxSubtree', u);
      }
    }

    // 行 18: maxSubtree[u] = Math.max(maxSubtree[u], totalNodes - sz[u]);
    maxSubtree[u] = Math.max(maxSubtree[u], totalNodes - sz[u]);
    makeStep(18, `⚖️ [计算上方断开块] 扣除自身后上方分块大小 totalNodes - sz[${u}] = ${totalNodes - sz[u]}；最终最大割块 maxSubtree[${u}]=${maxSubtree[u]}。`, `maxSubtree[${u}]=${maxSubtree[u]}`, 'find_root', [u], 'maxSubtree', u);

    // 行 19: if (maxSubtree[u] < maxPart)
    if (maxSubtree[u] < maxPart) {
      maxPart = maxSubtree[u];
      root = u;
      makeStep(19, `⭐ [更新候选重心] Node ${u} 最大子树 ${maxPart} <= ${Math.floor(totalNodes / 2)}！选定 Node ${u} 为当前连通块重心！`, `候选重心 -> Node ${u}`, 'find_root', [u]);
    }
  }

  // ==================== 3. 点分治主逻辑 solve ====================
  function solve(u: number, curLayer: number): void {
    layer = curLayer;
    // 行 38: vis[u] = true;
    vis[u] = true;
    visitedNodes.push(u);
    curCentroid = u;
    maxSubtreeSize = maxSubtree[u];
    makeStep(38, `👑 [确立并隔离重心] 在分治第 ${curLayer} 层确立重心 Node ${u}！设置 vis[${u}]=true，切断该点将全树分裂为若干更小子树！`, `确立重心 Node ${u}`, 'isolate', [u], 'vis', u);

    // 行 27: 统计跨重心路径 getDists
    makeStep(27, `📊 [统计跨重心路径] 遍历重心 Node ${u} 的所有子树，收集深度分布并进行容斥统计。`, `统计跨 ${u} 路径`, 'calc_path', [u]);

    // 行 39: 递归子分块
    for (const e of adj[u]) {
      const v = e.to;
      if (!vis[v]) {
        maxPart = Infinity;
        totalNodes = sz[v];
        makeStep(42, `🔁 [分治子分块] 递归处理以 Node ${v} 为入口的连通子树 (规模 ${totalNodes})。`, `准备分治子块 ${v}`, 'recurse', [v]);
        getCentroid(v, 0);
        solve(root, curLayer + 1);
      }
    }
  }

  // 首次运行
  totalNodes = n;
  maxPart = Infinity;
  getCentroid(1, 0);
  solve(root, 1);

  // 终态
  makeStep(49, `🎉 [点分治完成] 所有分治重心已全部递归完毕！遍历重心序列：{ ${visitedNodes.join(', ')} }，树高严格降至 O(log N)！`, '点分治完成', 'done');

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<StaticCentroidStep>({
  id: 'tree-centroid-decomposition',
  name: '树分治与点分治 (Tree Centroid Decomposition)',
  category: 'graph',
  icon: '⚖️',
  badge: {
    mode: '重心寻找 + O(log N) 树高分治',
    complexity: 'O(N log² N) · O(N)',
  },
  card1Title: '⚖️ 树形拓扑、重心隔离与分治层级沙盘',
  card2Title: '📊 重心状态分析器 (sz, maxSubtree, vis, 路径统计)',
  card2Desc: '逐行对齐 DFS 计算各点最大子树 maxSubtree[u]、确立重心并隔离 (vis=true) 与递归分治子连通块',
  legend: [
    { label: '普通图节点', color: '#1e3a8a' },
    { label: '👑 当前分治重心', color: '#f59e0b' },
    { label: '🔒 已隔离重心 (Vis)', color: '#065f46' },
    { label: '⚪ 普通树边', color: '#38bdf8' },
    { label: '❌ 隔离切断边 (虚线)', color: '#475569' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设树拓扑',
      type: 'select',
      defaultValue: 'classic_7node',
      options: [
        { label: '7 节点经典平衡树 (重心为 1, 2, 3)', value: 'classic_7node' },
        { label: '5 节点单链树 (首层重心为 3)', value: 'line_5node' },
      ],
    },
  ],
  presets: [
    { label: '7 节点经典平衡树', values: { 'input-preset': 'classic_7node' } },
    { label: '5 节点单链树', values: { 'input-preset': 'line_5node' } },
  ],
  metrics: [
    { id: 'metric-cur-centroid', label: '当前分治重心', color: '#f59e0b' },
    { id: 'metric-max-subtree', label: '最大分支大小', color: '#10b981' },
    { id: 'metric-path-count', label: '已分治重心序列', color: '#38bdf8' },
    { id: 'metric-centroid-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: TREE_CENTROID_CODE_LANGUAGES,
  problemHtml: TREE_CENTROID_PROBLEM_HTML,
  analysisHtml: TREE_CENTROID_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_7node') as string;
    return buildStaticCentroidSteps(preset);
  },
  renderCanvas: (container, step) => {
    const isLine = step.szArray.length === 6;
    const nodeCoords: Record<number, { x: number; y: number }> = isLine
      ? {
          1: { x: 45, y: 105 },
          2: { x: 100, y: 105 },
          3: { x: 155, y: 105 },
          4: { x: 210, y: 105 },
          5: { x: 265, y: 105 },
        }
      : {
          1: { x: 155, y: 35 },
          2: { x: 95, y: 95 },
          3: { x: 215, y: 95 },
          4: { x: 65, y: 165 },
          5: { x: 125, y: 165 },
          6: { x: 185, y: 165 },
          7: { x: 245, y: 165 },
        };

    const treeEdges = isLine
      ? [
          [1, 2],
          [2, 3],
          [3, 4],
          [4, 5],
        ]
      : [
          [1, 2],
          [1, 3],
          [2, 4],
          [2, 5],
          [3, 6],
          [3, 7],
        ];

    const svgEdges = treeEdges
      .map(([u, v]) => {
        const p1 = nodeCoords[u];
        const p2 = nodeCoords[v];
        if (!p1 || !p2) return '';
        const isCut = (step.visitedNodes.includes(u) && !step.visitedNodes.includes(v)) || (step.visitedNodes.includes(v) && !step.visitedNodes.includes(u));
        const color = isCut ? '#475569' : '#38bdf8';
        const width = isCut ? 1.5 : 2;

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${isCut ? 'stroke-dasharray="3,2"' : ''} />`;
      })
      .join('');

    const nodes = isLine ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 7];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isCentroid = step.curCentroid === u;
        const isVis = step.visitedNodes.includes(u);
        const isAct = step.activeNodes && step.activeNodes.includes(u);

        const bg = isCentroid ? '#b45309' : isVis ? '#065f46' : isAct ? '#0369a1' : '#1e3a8a';
        const border = isCentroid ? '#facc15' : isVis ? '#10b981' : isAct ? '#38bdf8' : '#475569';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${isCentroid || isVis ? 3 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 25}" fill="${isCentroid ? '#facc15' : '#94a3b8'}" font-size="7.5" font-weight="700" text-anchor="middle">${isCentroid ? '👑重心' : `sz:${step.szArray[u] || 0}`}</text>
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
          金色皇冠为当前连通块重心 | 绿色为已隔离重心 | 重心定理：删除重心后每个子树大小不超过总大小的一半 (≤ N/2)
        </div>
      </div>
    `;

    const rootEl =
      container.closest('#algo-tree-centroid-decomposition-view') ||
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
        const totalIndices = nodes;
        const renderRow = (name: string, arr: any[], activeName: string, color: string) => {
          const cells = totalIndices
            .map((idx) => {
              const val = arr[idx] ?? 0;
              const isActive = step.activeArray === activeName && step.activeSlot === idx;
              const displayVal = typeof val === 'boolean' ? (val ? 'T' : 'F') : val;
              const bg = isActive ? '#fef08a' : '#1e293b';
              const textCol = isActive ? '#854d0e' : '#e2e8f0';
              const border = isActive ? '2px solid #eab308' : '1px solid #475569';

              return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 30px; height: 30px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 10px; font-weight: 700;">
                <span style="font-size: 7.5px; color: #64748b; line-height: 1;">[${idx}]</span>
                <span style="line-height: 1.1;">${displayVal}</span>
              </div>`;
            })
            .join('');

          return `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 105px; color: ${color};">${name}:</span>
              <div style="display: flex; gap: 3px;">${cells}</div>
            </div>
          `;
        };

        const szRow = renderRow('sz[] (子树大小)', step.szArray, 'sz', '#38bdf8');
        const maxSubRow = renderRow('maxSubtree[] (最大块)', step.maxSubtreeArray, 'maxSubtree', '#f59e0b');
        const visRow = renderRow('vis[] (重心隔离)', step.visArray, 'vis', '#10b981');

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #cbd5e1; padding: 2px 0;">
            <div style="display: flex; flex-direction: column; gap: 4px; background: #0f172a; padding: 8px; border-radius: 6px; border: 1px solid #334155;">
              ${szRow}
              ${maxSubRow}
              ${visRow}
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #334155; padding-top: 4px;">
                <span style="color: #10b981; font-size: 10px; font-weight: 700;">当前已隔离重心集合:</span>
                <strong style="color: #10b981; font-family: monospace; font-size: 10.5px;">{ ${step.visitedNodes.join(', ') || '无'} }</strong>
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
  id: 'tree-centroid-decomposition',
  name: '树分治与点分治 (Tree Centroid Decomposition)',
  viewId: 'algo-tree-centroid-decomposition-view',
  category: 'graph',
  description: '进阶树论经典：寻找树重心使最大子树不超过一半、树高压缩至 O(log N)、跨重心路径容斥统计 (POJ 1741)',
  icon: '⚖️',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 85,
  learningGoal: '掌握树重心判定与计算方法、点分治递归层数证明及跨重心路径统计容斥技巧',
});

export { Visualizer as TreeCentroidDecompositionVisualizer };
