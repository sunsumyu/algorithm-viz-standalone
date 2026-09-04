/**
 * 树链剖分与线段树维护 (Heavy-Light Decomposition - 树剖 HLD) 声明式可视化器
 * 进阶树论: 重儿子 size[v] 最大、重链顶点 top[u]、两遍 DFS 连续 DFN 序映射、树上路径转化为 O(log N) 个线段树连续区间 (洛谷 P3384)
 * 遵循标准 4-Card 声明式沙盘架构，支持逐行指令执行与多状态数组 (size, son, top, dfn) 实时监控
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  HLD_CODE_LANGUAGES,
  HLD_PROBLEM_HTML,
  HLD_ANALYSIS_HTML,
} from './heavy-light-decomposition-problem-content';

export interface HLDStep {
  heavyEdges: Array<[number, number]>;
  topNodes: Record<number, number>;
  dfnSeq: Record<number, number>;
  sizes?: Record<number, number>;
  sons?: Record<number, number>;
  activeNodes?: number[];
  activeEdge?: [number, number];
  pathSegments?: Array<[number, number]>;
  sizeArray: number[];
  sonArray: number[];
  topArray: number[];
  dfnArray: number[];
  activeArray?: 'size' | 'son' | 'top' | 'dfn';
  activeSlot?: number;
  status: 'init' | 'dfs1' | 'dfs2' | 'hld_done' | 'query' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildHLDSteps(preset: string = 'classic_6node'): HLDStep[] {
  const steps: HLDStep[] = [];
  const isLine = preset === 'line_4node';
  const n = isLine ? 4 : 6;
  const root = 1;

  // 边定义
  // classic_6node: (1,2), (1,3), (2,4), (2,5), (3,6)
  // line_4node: (1,2), (2,3), (3,4)
  const edges: Array<[number, number]> = isLine
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
      ];

  const adj: number[][] = Array.from({ length: n + 1 }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }

  const parent: number[] = new Array(n + 1).fill(0);
  const depth: number[] = new Array(n + 1).fill(0);
  const size: number[] = new Array(n + 1).fill(0);
  const son: number[] = new Array(n + 1).fill(0);
  const top: number[] = new Array(n + 1).fill(0);
  const dfn: number[] = new Array(n + 1).fill(0);
  const heavyEdges: Array<[number, number]> = [];
  const pathSegments: Array<[number, number]> = [];

  let timer = 0;

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'init' | 'dfs1' | 'dfs2' | 'hld_done' | 'query' | 'done',
    activeNodes?: number[],
    activeArray?: 'size' | 'son' | 'top' | 'dfn',
    activeSlot?: number
  ): void {
    const topRec: Record<number, number> = {};
    const dfnRec: Record<number, number> = {};
    const szRec: Record<number, number> = {};
    const sonRec: Record<number, number> = {};
    for (let i = 1; i <= n; i++) {
      topRec[i] = top[i];
      dfnRec[i] = dfn[i];
      szRec[i] = size[i];
      sonRec[i] = son[i];
    }

    const hChainStr = top[4] ? `top[4]=${top[4]}, top[${n}]=${top[n]}` : '剖分构建中';
    const segStr = pathSegments.length > 0 ? `${pathSegments.length} 段 (${JSON.stringify(pathSegments)})` : '待查询';
    const curN = activeNodes && activeNodes.length > 0 ? `Node ${activeNodes[0]}` : '待定';

    const phaseStr =
      status === 'done'
        ? '剖分完成'
        : status === 'query'
          ? '路径跳跃'
          : status === 'dfs2'
            ? 'DFS2 链头确立'
            : status === 'dfs1'
              ? 'DFS1 统计子树'
              : '算法初始化';

    steps.push({
      heavyEdges: heavyEdges.map(([a, b]) => [a, b]),
      topNodes: topRec,
      dfnSeq: dfnRec,
      sizes: szRec,
      sons: sonRec,
      activeNodes,
      pathSegments: pathSegments.length > 0 ? pathSegments.map(([a, b]) => [a, b]) : undefined,
      sizeArray: [...size],
      sonArray: [...son],
      topArray: [...top],
      dfnArray: [...dfn],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-heavy-chain': hChainStr,
        'metric-path-segments': segStr,
        'metric-cur-node': curN,
        'metric-hld-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化 ====================
  // 行 6: Code01_HeavyLightDecomposition
  makeStep(6, `🚀 [算法初始化] 建立包含 ${n} 个顶点的树，以 root=${root} 为根，准备进行树链剖分。`, `init(${n})`, 'init', [root]);

  // ==================== 2. DFS1：统计 depth, parent, size 与重儿子 son ====================
  function dfs1(u: number, p: number, d: number): void {
    // 行 7-9: parent, depth, size 初始化
    parent[u] = p;
    depth[u] = d;
    size[u] = 1;
    makeStep([7, 9], `📐 [DFS1 进入节点] 访问 Node ${u}: depth[${u}]=${d}, parent[${u}]=${p}, 初始 size[${u}]=1。`, `DFS1 访问 ${u}`, 'dfs1', [u], 'size', u);

    // 行 10: 遍历邻居
    for (const v of adj[u]) {
      if (v !== p) {
        dfs1(v, u, d + 1);

        // 行 13: size[u] += size[v];
        size[u] += size[v];
        makeStep(13, `➕ [子树大小累加] Node ${u} 累加子树 ${v} 大小 (${size[v]}) -> 当前 size[${u}] = ${size[u]}。`, `size[${u}] += ${size[v]}`, 'dfs1', [u], 'size', u);

        // 行 14: if (son[u] == 0 || size[v] > size[son[u]]) son[u] = v;
        if (son[u] === 0 || size[v] > size[son[u]]) {
          son[u] = v;
          makeStep(14, `⭐ [确立重儿子] 子树 ${v} 大小为 ${size[v]}，成为 Node ${u} 的当前重儿子 son[${u}] = ${v}！`, `son[${u}] = ${v}`, 'dfs1', [u], 'son', u);
        }
      }
    }
  }

  dfs1(root, 0, 1);

  // 收集重边
  for (let i = 1; i <= n; i++) {
    if (son[i] > 0) {
      heavyEdges.push([i, son[i]]);
    }
  }

  // ==================== 3. DFS2：确立重链顶点 top 与连续时间戳 dfn ====================
  function dfs2(u: number, t: number): void {
    // 行 20-21: top[u] = t; dfn[u] = ++timer;
    top[u] = t;
    dfn[u] = ++timer;
    makeStep([20, 21], `🏷️ [链头与时间戳] Node ${u}: 归属重链头 top[${u}] = ${t}，分配连续时间戳 dfn[${u}] = ${dfn[u]}。`, `top[${u}]=${t}, dfn=${timer}`, 'dfs2', [u], 'top', u);

    // 行 22: if (son[u] == 0) return;
    if (son[u] === 0) return;

    // 行 23: dfs2(son[u], t); 重儿子优先遍历！
    makeStep(23, `🚀 [重儿子优先连续编排] 沿重链深入重儿子 son[${u}] = ${son[u]}，继承重链头 t = ${t}！`, `深入重儿子 ${son[u]}`, 'dfs2', [son[u]], 'top', son[u]);
    dfs2(son[u], t);

    // 行 24-26: 轻儿子自成新重链
    for (const v of adj[u]) {
      if (v !== parent[u] && v !== son[u]) {
        makeStep(25, `🍃 [轻儿子开辟新链] Node ${v} 是轻儿子，开辟新重链，以其自身为链头 top[${v}] = ${v} 发起遍历！`, `轻链头 top[${v}]=${v}`, 'dfs2', [v], 'top', v);
        dfs2(v, v);
      }
    }
  }

  dfs2(root, root);

  // ==================== 4. 树上路径跳跃 getPathSegments ====================
  // 行 30: getPathSegments
  const qU = isLine ? 1 : 6;
  const qV = isLine ? 4 : 4;
  makeStep(30, `🧭 [树上路径剖分查询] 查询从 Node ${qU} 到 Node ${qV} 的路径区间映射。`, `getPathSegments(${qU}, ${qV})`, 'query', [qU, qV]);

  let u = qU;
  let v = qV;

  // 行 32: while (top[u] != top[v])
  while (top[u] !== top[v]) {
    // 行 33: if (depth[top[u]] < depth[top[v]]) swap(u, v)
    if (depth[top[u]] < depth[top[v]]) {
      const tmp = u;
      u = v;
      v = tmp;
    }
    // 行 36: segments.add({dfn[top[u]], dfn[u]})
    pathSegments.push([dfn[top[u]], dfn[u]]);
    makeStep(36, `🪜 [跃迁重链区间] 收集重链区间 [dfn[top[${u}]], dfn[${u}]] = [${dfn[top[u]]}, ${dfn[u]}]，u 上跳至 parent[top[${u}]] = ${parent[top[u]]}。`, `收集区间 [${dfn[top[u]]}, ${dfn[u]}]`, 'query', [u]);
    u = parent[top[u]];
  }

  // 行 39: 收集最后同一重链上的区间
  if (depth[u] > depth[v]) {
    const tmp = u;
    u = v;
    v = tmp;
  }
  pathSegments.push([dfn[u], dfn[v]]);
  makeStep(42, `🎯 [终末同一重链覆盖] u 与 v 汇聚于同一重链，收集连续区间 [dfn[${u}], dfn[${v}]] = [${dfn[u]}, ${dfn[v]}]！`, `最后区间 [${dfn[u]}, ${dfn[v]}]`, 'query', [u, v]);

  // 终态
  makeStep(45, `🎉 [树链剖分完成] 树上任意路径被成功转化为不超过 O(log N) 个连续的 DFN 区间集：${JSON.stringify(pathSegments)}！线段树可直接维护！`, '剖分完成', 'done');

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<HLDStep>({
  id: 'heavy-light-decomposition',
  name: '树链剖分 (Heavy-Light Decomposition)',
  viewId: 'algo-heavy-light-decomposition-view',
  category: 'graph',
  icon: '🪓',
  badge: {
    mode: '两遍 DFS + O(log N) 链跳跃',
    complexity: 'O(N) · O(log² N)',
  },
  card1Title: '🪓 树形拓扑、重链剖分与连续 DFN 序沙盘',
  card2Title: '📊 树剖状态分析器 (size, son, top, dfn, 路径区间)',
  card2Desc: '逐行对齐 DFS1 统计子树大小确立重儿子、DFS2 重儿子优先确立重链连续 DFN 及树上路径快速跳跃',
  legend: [
    { label: '图节点', color: '#1e3a8a' },
    { label: '⭐ 重链顶点 (Top)', color: '#f59e0b' },
    { label: '👑 根节点 (Root)', color: '#10b981' },
    { label: '🟡 重边 (实线)', color: '#facc15' },
    { label: '⚪ 轻边 (虚线)', color: '#475569' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设树拓扑',
      type: 'select',
      defaultValue: 'classic_6node',
      options: [
        { label: '6 节点经典树 (top[4]=1, top[6]=3)', value: 'classic_6node' },
        { label: '4 节点单链 (整树单链 top[4]=1)', value: 'line_4node' },
      ],
    },
  ],
  presets: [
    { label: '6 节点经典树', values: { 'input-preset': 'classic_6node' } },
    { label: '4 节点单链', values: { 'input-preset': 'line_4node' } },
  ],
  metrics: [
    { id: 'metric-heavy-chain', label: '重链头状态 top[]', color: '#f59e0b' },
    { id: 'metric-path-segments', label: '路径转化区间数', color: '#10b981' },
    { id: 'metric-cur-node', label: '当前分析节点', color: '#38bdf8' },
    { id: 'metric-hld-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: HLD_CODE_LANGUAGES,
  problemHtml: HLD_PROBLEM_HTML,
  analysisHtml: HLD_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_6node') as string;
    return buildHLDSteps(preset);
  },
  renderCanvas: (container, step) => {
    const isLine = Object.keys(step.topNodes).length === 4;
    const nodeCoords: Record<number, { x: number; y: number }> = isLine
      ? {
          1: { x: 155, y: 35 },
          2: { x: 155, y: 85 },
          3: { x: 155, y: 135 },
          4: { x: 155, y: 185 },
        }
      : {
          1: { x: 155, y: 35 },
          2: { x: 95, y: 95 },
          3: { x: 215, y: 95 },
          4: { x: 65, y: 165 },
          5: { x: 125, y: 165 },
          6: { x: 215, y: 165 },
        };

    const treeEdges = isLine
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
        ];

    const svgEdges = treeEdges
      .map(([u, v]) => {
        const p1 = nodeCoords[u];
        const p2 = nodeCoords[v];
        if (!p1 || !p2) return '';
        const isHeavy = step.heavyEdges.some(([a, b]) => (a === u && b === v) || (a === v && b === u));
        const color = isHeavy ? '#facc15' : '#475569';
        const width = isHeavy ? 3.5 : 1.5;

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${isHeavy ? '' : 'stroke-dasharray="4,2"'} />`;
      })
      .join('');

    const nodes = isLine ? [1, 2, 3, 4] : [1, 2, 3, 4, 5, 6];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isTop = step.topNodes[u] === u;
        const isAct = step.activeNodes && step.activeNodes.includes(u);
        const topVal = step.topNodes[u] ?? 0;
        const dfnVal = step.dfnSeq[u] ?? 0;

        const bg = isAct ? '#065f46' : isTop ? '#b45309' : '#1e3a8a';
        const border = isAct ? '#10b981' : isTop ? '#facc15' : '#38bdf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${isTop || isAct ? 3 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 25}" fill="#94a3b8" font-size="7.5" font-weight="700" text-anchor="middle">top:${topVal} dfn:${dfnVal}</text>
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
          金色实线为重边 (Heavy Edge) | 节点底部为 top 链头与连续 dfn 序 | 树上任意路径被转为至多 O(log N) 个连续线段树区间
        </div>
      </div>
    `;

    const rootEl =
      container.closest('#algo-heavy-light-decomposition-view') ||
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

        const sizeRow = renderRow('size[] (子树大小)', step.sizeArray, 'size', '#38bdf8');
        const sonRow = renderRow('son[] (重儿子)', step.sonArray, 'son', '#f59e0b');
        const topRow = renderRow('top[] (重链链头)', step.topArray, 'top', '#10b981');
        const dfnRow = renderRow('dfn[] (时间戳)', step.dfnArray, 'dfn', '#a855f7');

        const segStr = step.pathSegments ? JSON.stringify(step.pathSegments) : '待查询';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #cbd5e1; padding: 2px 0;">
            <div style="display: flex; flex-direction: column; gap: 4px; background: #0f172a; padding: 8px; border-radius: 6px; border: 1px solid #334155;">
              ${sizeRow}
              ${sonRow}
              ${topRow}
              ${dfnRow}
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #334155; padding-top: 4px;">
                <span style="color: #10b981; font-size: 10px; font-weight: 700;">转化线段树区间集:</span>
                <strong style="color: #10b981; font-family: monospace; font-size: 10.5px;">${segStr}</strong>
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
  id: 'heavy-light-decomposition',
  name: '树链剖分 (Heavy-Light Decomposition)',
  viewId: 'algo-heavy-light-decomposition-view',
  category: 'graph',
  description: '进阶树论经典：两遍 DFS 划分重链、重儿子优先连续 DFN 序编排、树上路径转化为连续线段树区间 (洛谷 P3384)',
  icon: '🪓',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 83,
  learningGoal: '掌握重儿子判定与轻重链划分原理、两遍 DFS 连续 DFN 序映射及 O(log N) 树上路径跳跃技巧',
});

export { Visualizer as HeavyLightDecompositionVisualizer };
