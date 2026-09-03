/**
 * 好路径的数目 (Number of Good Paths - LeetCode 2421) 声明式可视化器
 * 核心：按边端点最大权值升序排序加边、并查集连通块维护同值最大点计数、乘法原理累加组合数 count[u] * count[v]
 * 架构重构：引入四语言代码高亮字典、双层树形网络与好路径收集舱沙盘、并查集状态监视器
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  GOOD_PATHS_CODE_LANGUAGES,
  GOOD_PATHS_PROBLEM_HTML,
  GOOD_PATHS_ANALYSIS_HTML,
} from './good-paths-problem-content';
import { HighlightTarget } from '../../../core/code-panel';

export interface GoodPathsStep {
  curVal: number;
  activeEdges: Array<[number, number]>;
  totalGoodPaths: number;
  curEdge?: [number, number];
  parentArray: number[];
  countArray: number[];
  valsArray: number[];
  activeArray?: 'parent' | 'count' | 'vals';
  activeSlot?: number;
  newPathsCount?: number;
  status: 'init' | 'sort' | 'merge_val' | 'pair' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export function buildGoodPathsSteps(preset: string = 'classic_4node'): GoodPathsStep[] {
  const steps: GoodPathsStep[] = [];
  const isStar = preset === 'star_5node';

  const vals: number[] = isStar ? [1, 3, 2, 1, 3] : [1, 3, 2, 3];
  const edges: Array<[number, number]> = isStar
    ? [
        [0, 1],
        [0, 2],
        [2, 3],
        [2, 4],
      ]
    : [
        [0, 1],
        [0, 2],
        [2, 3],
      ];

  const n = vals.length;
  const parent: number[] = new Array(n).fill(0);
  const count: number[] = new Array(n).fill(1);

  for (let i = 0; i < n; i++) parent[i] = i;

  function find(i: number): number {
    if (parent[i] !== i) parent[i] = find(parent[i]);
    return parent[i];
  }

  let totalGoodPaths = n;
  let curVal = 0;
  const activeEdges: Array<[number, number]> = [];
  let curEdge: [number, number] | undefined = undefined;

  const lines = {
    init: { cpp: 16, java: 32, python: 13, javascript: 19 },
    sort: { cpp: 30, java: 37, python: 18, javascript: 24 },
    edgeLoop: { cpp: 36, java: 45, python: 21, javascript: 27 },
    sameValPair: { cpp: 40, java: 49, python: 25, javascript: 31 },
    mergeRoot: { cpp: 45, java: 53, python: 30, javascript: 36 },
    done: { cpp: 50, java: 59, python: 34, javascript: 41 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'init' | 'sort' | 'merge_val' | 'pair' | 'done',
    activeArray?: 'parent' | 'count' | 'vals',
    activeSlot?: number,
    newPathsCount?: number
  ): void {
    const valStr = status === 'done' ? '全部边连通完毕' : `val ≤ ${curVal}`;
    const pathsStr = `${totalGoodPaths} 条`;
    const edgeStr = `${activeEdges.length} / ${edges.length} 条`;

    const phaseStr =
      status === 'done'
        ? '好路径计算完成'
        : status === 'pair'
          ? '同权端点产生好路径'
          : status === 'merge_val'
            ? '并查集升序合并'
            : status === 'sort'
              ? '边权升序排序'
              : '算法初始化';

    steps.push({
      curVal,
      activeEdges: [...activeEdges],
      totalGoodPaths,
      curEdge,
      parentArray: [...parent],
      countArray: [...count],
      valsArray: [...vals],
      activeArray,
      activeSlot,
      newPathsCount,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-active-val': valStr,
        'metric-good-paths': pathsStr,
        'metric-active-edges': edgeStr,
        'metric-paths-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.init, `🚀 [算法初始化] 树包含 ${n} 个节点，各点点权为: [${vals.join(', ')}]。每个单节点天然自成 1 条好路径，初始基数 = ${n} 条。`, 'numberOfGoodPaths 入口', 'init');

  for (let i = 0; i < n; i++) {
    makeStep(lines.init, `📌 [并查集初始化] parent[${i}]=${i}，同大权频次 count[${i}]=1。`, `parent[${i}]=${i}`, 'init', 'parent', i);
  }

  // 2. 边权排序
  const sortedEdges = [...edges].sort(
    (a, b) => Math.max(vals[a[0]], vals[a[1]]) - Math.max(vals[b[0]], vals[b[1]])
  );
  makeStep(lines.sort, `📐 [边权排序] 按照边两端 max(vals[u], vals[v]) 升序加边。排序后顺序为: ${sortedEdges.map((e) => `(${e[0]}-${e[1]}: 权${Math.max(vals[e[0]], vals[e[1]])})`).join(', ')}。`, '边升序排序', 'sort');

  // 3. 逐条加边推演
  for (const [u, v] of sortedEdges) {
    curEdge = [u, v];
    curVal = Math.max(vals[u], vals[v]);
    activeEdges.push([u, v]);

    makeStep(lines.edgeLoop, `🔗 [考察连通边] 正在接入 Edge (${u}, ${v})，计算边两端端点最大点权 val = max(${vals[u]}, ${vals[v]}) = ${curVal}。`, `edge (${u},${v})`, 'merge_val');

    const rootU = find(u);
    makeStep(lines.edgeLoop, `🔍 [查询代表元] Node ${u} 所在集合根代表元 rootU = ${rootU}，当前该集合最大点权为 vals[${rootU}] = ${vals[rootU]}，频次 count[${rootU}] = ${count[rootU]}。`, `find(${u})=${rootU}`, 'merge_val', 'parent', rootU);

    const rootV = find(v);
    makeStep(lines.edgeLoop, `🔍 [查询代表元] Node ${v} 所在集合根代表元 rootV = ${rootV}，当前该集合最大点权为 vals[${rootV}] = ${vals[rootV]}，频次 count[${rootV}] = ${count[rootV]}。`, `find(${v})=${rootV}`, 'merge_val', 'parent', rootV);

    makeStep(lines.sameValPair, `⚖️ [权值对决判定] 比较两端代表元点权：vals[${rootU}]=${vals[rootU]} vs vals[${rootV}]=${vals[rootV]}。`, `compare vals[${rootU}] & vals[${rootV}]`, 'merge_val');

    if (vals[rootU] === vals[rootV]) {
      const added = count[rootU] * count[rootV];
      totalGoodPaths += added;

      makeStep(
        lines.sameValPair,
        `✨ [产生新好路径] 发现两端分量最大点权相等 (均为 ${vals[rootU]})！\n应用乘法原理组合：count[${rootU}] (${count[rootU]}) × count[${rootV}] (${count[rootV]}) = 新增 ${added} 条好路径！总数增至 ${totalGoodPaths} 条！`,
        `goodPaths += ${added}`,
        'pair',
        'count',
        rootU,
        added
      );

      parent[rootV] = rootU;
      makeStep(lines.mergeRoot, `🔗 [合并集合代表元] 将 rootV (Node ${rootV}) 的代表元指向 rootU (Node ${rootU})。`, `parent[${rootV}]=${rootU}`, 'merge_val', 'parent', rootV);

      count[rootU] += count[rootV];
      makeStep(lines.sameValPair, `📈 [累计频次相加] rootU (Node ${rootU}) 的最大点权出现频次累加为 count[${rootU}] = ${count[rootU]}。`, `count[${rootU}]+=${count[rootV]}`, 'merge_val', 'count', rootU);
    } else if (vals[rootU] > vals[rootV]) {
      parent[rootV] = rootU;
      makeStep(lines.mergeRoot, `🛡️ [归属大权值根] vals[${rootU}] (${vals[rootU]}) > vals[${rootV}] (${vals[rootV]})，点权大者 Node ${rootU} 作为新根，小者直接并入，不产生新好路径。`, `parent[${rootV}]=${rootU}`, 'merge_val', 'parent', rootV);
    } else {
      parent[rootU] = rootV;
      makeStep(lines.mergeRoot, `🛡️ [归属大权值根] vals[${rootV}] (${vals[rootV]}) > vals[${rootU}] (${vals[rootU]})，点权大者 Node ${rootV} 作为新根，小者直接并入，不产生新好路径。`, `parent[${rootU}]=${rootV}`, 'merge_val', 'parent', rootU);
    }
  }

  curEdge = undefined;
  makeStep(lines.done, `🎉 [好路径统计完毕] 全图所有边已完全并查集连通，满足条件的所有好路径总计为 ${totalGoodPaths} 条！`, `done: totalGoodPaths=${totalGoodPaths}`, 'done');

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<GoodPathsStep>({
  id: 'good-paths',
  name: '好路径的数目 (Number of Good Paths)',
  category: 'graph',
  badge: {
    mode: '点权升序并查集 · 乘法原理组合',
    complexity: 'O(N log N) · O(N)',
  },
  card1Title: '树形网络拓扑与好路径实时收集舱',
  card2Title: '并查集状态监视器 (parent, count, vals)',
  card2Desc: '展示按边端点最大点权升序加边过程，利用并查集维护各分量中当前最大点权的频次并计算组合数',
  legend: [
    { label: '普通树边 (虚线)', color: '#475569' },
    { label: '已激活加边 (绿实线)', color: '#10b981' },
    { label: '当前连接边 (金色)', color: '#facc15' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设树形结构',
      type: 'select',
      defaultValue: 'classic_4node',
      options: [
        { label: '4 节点经典树 (好路径 5 条)', value: 'classic_4node' },
        { label: '5 节点星形树 (好路径 6 条)', value: 'star_5node' },
      ],
    },
  ],
  presets: [
    { label: '4 节点经典树', values: { 'input-preset': 'classic_4node' } },
    { label: '5 节点星形树', values: { 'input-preset': 'star_5node' } },
  ],
  metrics: [
    { id: 'metric-active-val', label: '当前边权上限', color: '#38bdf8' },
    { id: 'metric-good-paths', label: '当前好路径总数', color: '#10b981' },
    { id: 'metric-active-edges', label: '已激活连接边', color: '#f59e0b' },
    { id: 'metric-paths-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: GOOD_PATHS_CODE_LANGUAGES,
  problemHtml: GOOD_PATHS_PROBLEM_HTML,
  analysisHtml: GOOD_PATHS_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_4node') as string;
    return buildGoodPathsSteps(preset);
  },
  renderCanvas: (container, step) => {
    const isStar = step.valsArray.length === 5;
    const n = isStar ? 5 : 4;

    const nodeCoords: Record<number, { x: number; y: number }> = isStar
      ? {
          0: { x: 75, y: 55 },
          1: { x: 45, y: 125 },
          2: { x: 155, y: 85 },
          3: { x: 235, y: 45 },
          4: { x: 255, y: 125 },
        }
      : {
          0: { x: 75, y: 85 },
          1: { x: 75, y: 35 },
          2: { x: 175, y: 85 },
          3: { x: 255, y: 85 },
        };

    const allEdges = isStar
      ? [
          [0, 1],
          [0, 2],
          [2, 3],
          [2, 4],
        ]
      : [
          [0, 1],
          [0, 2],
          [2, 3],
        ];

    const isActivated = (u: number, v: number) =>
      step.activeEdges.some(([a, b]) => (a === u && b === v) || (a === v && b === u));

    let svgEdges = '';
    for (const [u, v] of allEdges) {
      const p1 = nodeCoords[u];
      const p2 = nodeCoords[v];
      if (!p1 || !p2) continue;

      const act = isActivated(u, v);
      const isCur =
        step.curEdge &&
        ((step.curEdge[0] === u && step.curEdge[1] === v) ||
          (step.curEdge[0] === v && step.curEdge[1] === u));

      const color = isCur ? '#facc15' : act ? '#10b981' : '#475569';
      const width = isCur ? 3.5 : act ? 2.5 : 1.5;

      svgEdges += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${act ? '' : 'stroke-dasharray="3,2"'} />`;
    }

    let svgNodes = '';
    for (let i = 0; i < n; i++) {
      const p = nodeCoords[i];
      if (!p) continue;
      const vVal = step.valsArray[i];
      const root = step.parentArray[i];
      const isRoot = root === i;

      svgNodes += `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="15" fill="${isRoot ? '#0369a1' : '#1e3a8a'}" stroke="${isRoot ? '#38bdf8' : '#64748b'}" stroke-width="${isRoot ? 2.5 : 1.5}" />
          <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${i}</text>
          <text x="${p.x}" y="${p.y + 24}" fill="#f59e0b" font-size="8" font-weight="700" text-anchor="middle">v:${vVal}</text>
        </g>
      `;
    }

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:10px; width:100%; height:100%; justify-content:flex-start; align-items:stretch; background:#0b0f19; padding:12px; border-radius:8px; box-sizing:border-box; overflow-y:auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #1e293b; padding-bottom:6px;">
          <span style="font-size:12px; color:#94a3b8; font-weight:700;">🛣️ 树形点权拓扑与连通加边</span>
          <span style="font-size:11px; color:#e2e8f0; background:#1e293b; padding:2px 8px; border-radius:4px; border:1px solid #334155;">
            已激活边: <b style="color:#10b981;">${step.activeEdges.length}</b> / ${allEdges.length}
          </span>
        </div>

        <div style="width:100%; min-height:150px; background:#0f172a; border-radius:8px; display:flex; justify-content:center; align-items:center; border:1px solid #334155;">
          <svg style="width:100%; height:150px;" viewBox="0 0 310 150">
            ${svgEdges}
            ${svgNodes}
          </svg>
        </div>

        <!-- 底部好路径实时收集舱 -->
        <div style="background:#0f172a; border:1px solid #334155; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11.5px; font-weight:800; color:#cbd5e1;">🛤️ 好路径实时收集舱</span>
            <div style="display:flex; gap:16px; font-size:11px;">
              <span>当前好路径总数: <b style="color:#10b981; font-size:13px;">${step.totalGoodPaths} 条</b></span>
            </div>
          </div>

          <div style="font-size:11px; color:#94a3b8; background:#1e293b; border-radius:6px; padding:6px 10px; border:1px solid #334155;">
            ${
              step.newPathsCount
                ? `<span style="color:#34d399; font-weight:700;">✨ 触发同值端点配对！本次产生 +${step.newPathsCount} 条新好路径！</span>`
                : `<span>单点基数好路径: <b>${n} 条</b>。随着边两端最大点权升序加边，逐步联通更多同权端点。</span>`
            }
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const n = step.parentArray.length;
    const indices = Array.from({ length: n }, (_, i) => i);

    const renderRow = (name: string, arr: any[], activeName: string, color: string) => {
      const cells = indices
        .map((u) => {
          const val = arr[u] ?? 0;
          const isActive = step.activeArray === activeName && step.activeSlot === u;
          const bg = isActive ? '#78350f' : '#1e293b';
          const textCol = isActive ? '#fde047' : '#e2e8f0';
          const border = isActive ? '2px solid #eab308' : '1px solid #475569';

          return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 34px; height: 32px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 11px; font-weight: 700;">
              <span style="font-size: 8px; color: #94a3b8; line-height: 1;">N[${u}]</span>
              <span style="line-height: 1.1;">${val}</span>
            </div>
          `;
        })
        .join('');

      return `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 140px; color: ${color};">${name}:</span>
          <div style="display: flex; gap: 4px;">${cells}</div>
        </div>
      `;
    };

    const parentRow = renderRow('parent[] (代表元)', step.parentArray, 'parent', '#38bdf8');
    const countRow = renderRow('count[] (同大权频次)', step.countArray, 'count', '#10b981');
    const valsRow = renderRow('vals[] (节点点权)', step.valsArray, 'vals', '#f59e0b');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #cbd5e1; padding: 4px 8px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 6px; background: #0f172a; padding: 10px; border-radius: 6px; border: 1px solid #334155;">
          ${parentRow}
          ${countRow}
          ${valsRow}
        </div>
      </div>
    `;
  },
});

registerAlgorithm({
  id: 'good-paths',
  name: '好路径的数目 (Number of Good Paths)',
  viewId: 'algo-good-paths-view',
  category: 'graph',
  description: '并查集贪心加边经典：边端点最大权值升序排序、连通块同最大值频次维护 count[u] * count[v] 乘法组合 (LeetCode 2421)',
  icon: '🛣️',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 103,
  learningGoal: '掌握按权值升序离线加边技巧、并查集动态维护最大点计数及乘法原理统计路径',
});

export { Visualizer as GoodPathsVisualizer };
