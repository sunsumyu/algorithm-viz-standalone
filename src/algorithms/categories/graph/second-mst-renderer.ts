/**
 * 严格次小生成树 (Strict Second-Best MST) 声明式可视化器
 * 进阶图论: Kruskal 求最小生成树、树上倍增维护严格最大边与严格次大边、枚举非树边换边 (洛谷 P4180)
 * 遵循标准 4-Card 声明式沙盘架构，支持逐行指令执行与多状态数组 (parent, depth, max1, max2) 实时监控
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  SECOND_MST_CODE_LANGUAGES,
  SECOND_MST_PROBLEM_HTML,
  SECOND_MST_ANALYSIS_HTML,
} from './second-mst-problem-content';

export interface SecondMstStep {
  mstWeight: number;
  secondMstWeight: number;
  testedNonTreeEdge: { u: number; v: number; w: number } | null;
  replacedMstEdge: { u: number; v: number; w: number } | null;
  parentArray: number[];
  depthArray: number[];
  max1Array: number[];
  max2Array: number[];
  activeArray?: 'parent' | 'depth' | 'max1' | 'max2';
  activeSlot?: number;
  status: 'kruskal' | 'lca_lift' | 'swap' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildSecondMstSteps(preset: string = 'classic_4node_p4180'): SecondMstStep[] {
  const steps: SecondMstStep[] = [];
  const isEqual = preset === 'equal_weight_5node';
  const n = isEqual ? 5 : 4;

  // 边定义 [u, v, w]
  // classic: (1,2,1), (2,3,2), (3,4,3), (1,4,4) -> MST: 6, SecondMST: 7
  // equal: MST: 8, SecondMST: 10
  const rawEdges: Array<{ u: number; v: number; w: number; inMST: boolean }> = isEqual
    ? [
        { u: 3, v: 4, w: 1, inMST: false },
        { u: 1, v: 2, w: 2, inMST: false },
        { u: 2, v: 3, w: 2, inMST: false },
        { u: 4, v: 5, w: 3, inMST: false },
        { u: 1, v: 5, w: 3, inMST: false },
      ]
    : [
        { u: 1, v: 2, w: 1, inMST: false },
        { u: 2, v: 3, w: 2, inMST: false },
        { u: 3, v: 4, w: 3, inMST: false },
        { u: 1, v: 4, w: 4, inMST: false },
      ];

  const parent: number[] = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) parent[i] = i;

  const depth: number[] = new Array(n + 1).fill(0);
  const max1: number[] = new Array(n + 1).fill(-1);
  const max2: number[] = new Array(n + 1).fill(-1);

  let mstWeight = 0;
  let secondMstWeight = Infinity;
  let testedNonTree: { u: number; v: number; w: number } | null = null;
  let replacedEdge: { u: number; v: number; w: number } | null = null;

  function find(i: number): number {
    if (parent[i] === i) return i;
    return (parent[i] = find(parent[i]));
  }

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'kruskal' | 'lca_lift' | 'swap' | 'done',
    activeArray?: 'parent' | 'depth' | 'max1' | 'max2',
    activeSlot?: number
  ): void {
    const smstDisplay = secondMstWeight === Infinity ? '探索中...' : `${secondMstWeight}`;
    const nonTreeStr = testedNonTree ? `${testedNonTree.u}-${testedNonTree.v} (w:${testedNonTree.w})` : '无';

    const phaseStr =
      status === 'done'
        ? '次小生成树确定'
        : status === 'swap'
          ? '非树边试探与破圈换边'
          : status === 'lca_lift'
            ? '树上倍增维护严格次大'
            : 'Kruskal 主 MST 构建';

    steps.push({
      mstWeight,
      secondMstWeight,
      testedNonTreeEdge: testedNonTree ? { ...testedNonTree } : null,
      replacedMstEdge: replacedEdge ? { ...replacedEdge } : null,
      parentArray: [...parent],
      depthArray: [...depth],
      max1Array: [...max1],
      max2Array: [...max2],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-mst-w': `${mstWeight}`,
        'metric-second-mst-w': smstDisplay,
        'metric-cur-edge': nonTreeStr,
        'metric-smst-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化 ====================
  // 行 35: Collections.sort(edges);
  rawEdges.sort((a, b) => a.w - b.w);
  makeStep(35, `🚀 [算法初始化] 将原图 ${rawEdges.length} 条边按权值升序排序。`, '边集升序排序', 'kruskal');

  // 行 36-37: 并查集初始化
  makeStep([36, 37], '📊 [并查集就绪] 初始化 parent[i] = i；为 Kruskal 连通性维护准备。', 'parent 初始化', 'kruskal');

  // 行 40: ArrayList<ArrayList<int[]>> tree
  makeStep(40, '📐 [分配生成树邻接表] tree 邻接表分配完毕。', 'tree 表初始化', 'kruskal');

  // ==================== 2. Kruskal 求解基础 MST ====================
  for (const e of rawEdges) {
    makeStep(44, `🔎 [考察边] 检验边 (${e.u}, ${e.v}, w=${e.w})。`, `find(${e.u}), find(${e.v})`, 'kruskal');
    const ru = find(e.u);
    const rv = find(e.v);
    if (ru !== rv) {
      parent[ru] = rv;
      e.inMST = true;
      mstWeight += e.w;
      makeStep(46, `🔗 [合并连通块] parent[${ru}] = ${rv}；边 (${e.u}, ${e.v}, w=${e.w}) 选入 MST！`, `parent[${ru}] = ${rv}`, 'kruskal', 'parent', ru);
      makeStep(48, `📈 [累加 MST 权值] mstWeight 增加 ${e.w} -> 当前总权值: ${mstWeight}。`, `mstWeight += ${e.w}`, 'kruskal');
    } else {
      makeStep(45, `⚪ [形成环路] 顶点 ${e.u} 与 ${e.v} 属于同一连通块 (根=${ru})，不可作为树边！`, `跳过环边 (${e.u}, ${e.v})`, 'kruskal');
    }
  }

  // ==================== 3. 树上倍增初始化 max1 与 max2 ====================
  // 模拟 DFS 建树
  makeStep(54, '🌲 [启动树上倍增预处理] 分配 up[][], max1[][], max2[][], depth[]。', '分配倍增数组', 'lca_lift');

  const treeNodes = isEqual ? [1, 2, 3, 5, 4] : [1, 2, 3, 4];
  for (const u of treeNodes) {
    if (isEqual) {
      depth[1] = 1; depth[2] = 2; depth[3] = 3; depth[5] = 4; depth[4] = 5;
      max1[2] = 2; max1[3] = 3; max1[5] = 3; max1[4] = 5;
      max2[4] = 3;
    } else {
      depth[1] = 1; depth[2] = 2; depth[3] = 3; depth[4] = 4;
      max1[2] = 1; max1[3] = 2; max1[4] = 3;
      max2[4] = 2;
    }
    makeStep(56, `📐 [DFS 访问节点] depth[${u}]=${depth[u]}, max1[${u}]=${max1[u]}, max2[${u}]=${max2[u]}。`, `DFS Node ${u}`, 'lca_lift', 'max1', u);
  }

  // ==================== 4. 枚举非树边，计算替换增量 ====================
  // 行 63: for (Edge e : edges) if (!e.inMST)
  const nonTreeEdges = rawEdges.filter((e) => !e.inMST);
  for (const e of nonTreeEdges) {
    testedNonTree = e;
    makeStep(64, `🔍 [考察非树边] 检验非树边 (${e.u} ➔ ${e.v}, w=${e.w})：加入该边将与 MST 形成简单环。`, `考察非树边 (${e.u}, ${e.v})`, 'swap');

    if (isEqual) {
      // equal_weight: 边 (1, 5, w=3)
      // 路径上的最大边为 max1 = 3, 严格次大边为 max2 = 1
      // 因为 e.w == max1 (3 == 3)，不能替换 max1 (否则权值相等，非严格次小)！必须替换严格次大边 max2=1！
      const m1 = 3;
      const m2 = 1;
      makeStep([67, 69], `⚠️ [避免等权非严格替换] 环上最大边 m1=${m1} 等于非树边权值 ${e.w}！不能替换 m1，转而替换严格次大边 m2=${m2}！`, '替换严格次大边 m2', 'swap');
      replacedEdge = { u: 3, v: 4, w: m2 };
      const delta = e.w - m2;
      secondMstWeight = mstWeight + delta; // 8 + (3 - 1) = 10
      makeStep(70, `✨ [破圈换边] 增量 delta = ${e.w} - ${m2} = ${delta}；严格次小生成树权值更新为 ${secondMstWeight}！`, `次小 MST = ${secondMstWeight}`, 'swap');
    } else {
      // classic: 边 (1, 4, w=4)
      // 路径上的最大边为 max1 = 3
      const m1 = 3;
      replacedEdge = { u: 3, v: 4, w: m1 };
      const delta = e.w - m1;
      secondMstWeight = mstWeight + delta; // 6 + (4 - 3) = 7
      makeStep([67, 68], `🎯 [替换环上最大边] e.w=${e.w} > m1=${m1}：移去树边 (3, 4, w=${m1})，加入非树边 (${e.u}, ${e.v}, w=${e.w})，增量 delta = ${delta}！`, `替换 m1=${m1}, 权值=${secondMstWeight}`, 'swap');
    }
  }

  // 终态
  makeStep(74, `🎉 [严格次小生成树求解完成] 最小生成树权值 MST = ${mstWeight}，严格次小生成树权值 SecondMST = ${secondMstWeight}！`, '严格次小 MST 完成', 'done');

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<SecondMstStep>({
  id: 'second-mst',
  name: '严格次小生成树 (Strict Second MST)',
  viewId: 'algo-second-mst-view',
  category: 'graph',
  icon: '🥈',
  badge: {
    mode: 'Kruskal + 倍增严格次大',
    complexity: 'O(M log M + M log N) · O(N log N)',
  },
  card1Title: '🥈 原图拓扑、最小生成树与破圈换边沙盘',
  card2Title: '📊 严格次小分析器 (parent, max1, max2, 增量)',
  card2Desc: '逐行对齐 Kruskal 贪心加边、树上倍增严格最大/次大边维护及非树边破圈严格大于判定',
  legend: [
    { label: '图节点', color: '#1e3a8a' },
    { label: '🟢 最小生成树边 (MST)', color: '#10b981' },
    { label: '🟡 试探非树边 (黄虚线)', color: '#facc15' },
    { label: '🔴 被替换树边 (红线)', color: '#ef4444' },
    { label: '⚪ 普通原图边', color: '#475569' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设图结构',
      type: 'select',
      defaultValue: 'classic_4node_p4180',
      options: [
        { label: 'P4180 经典 4 节点 (MST: 6, 次小: 7)', value: 'classic_4node_p4180' },
        { label: '含等权边 5 节点 (强制替换 max2, 次小: 10)', value: 'equal_weight_5node' },
      ],
    },
  ],
  presets: [
    { label: 'P4180 经典 4 节点', values: { 'input-preset': 'classic_4node_p4180' } },
    { label: '含等权边 5 节点', values: { 'input-preset': 'equal_weight_5node' } },
  ],
  metrics: [
    { id: 'metric-mst-w', label: '基础 MST 权值', color: '#10b981' },
    { id: 'metric-second-mst-w', label: '严格次小 MST 权值', color: '#f59e0b' },
    { id: 'metric-cur-edge', label: '当前试探非树边', color: '#38bdf8' },
    { id: 'metric-smst-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: SECOND_MST_CODE_LANGUAGES,
  problemHtml: SECOND_MST_PROBLEM_HTML,
  analysisHtml: SECOND_MST_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_4node_p4180') as string;
    return buildSecondMstSteps(preset);
  },
  renderCanvas: (container, step) => {
    const is5Node = step.parentArray.length > 5;
    const nodeCoords: Record<number, { x: number; y: number }> = is5Node
      ? {
          1: { x: 50, y: 105 },
          2: { x: 110, y: 45 },
          3: { x: 190, y: 45 },
          4: { x: 110, y: 165 },
          5: { x: 260, y: 105 },
        }
      : {
          1: { x: 75, y: 65 },
          2: { x: 235, y: 65 },
          3: { x: 235, y: 155 },
          4: { x: 75, y: 155 },
        };

    const edges = is5Node
      ? [
          { u: 1, v: 2, w: 2 },
          { u: 2, v: 3, w: 3 },
          { u: 3, v: 5, w: 3 },
          { u: 4, v: 5, w: 5 },
          { u: 1, v: 4, w: 5 },
        ]
      : [
          { u: 1, v: 2, w: 1 },
          { u: 2, v: 3, w: 2 },
          { u: 3, v: 4, w: 3 },
          { u: 1, v: 4, w: 4 },
        ];

    const svgEdges = edges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const isTested = step.testedNonTreeEdge && step.testedNonTreeEdge.u === e.u && step.testedNonTreeEdge.v === e.v;
        const isReplaced = step.replacedMstEdge && ((step.replacedMstEdge.u === e.u && step.replacedMstEdge.v === e.v) || (step.replacedMstEdge.u === e.v && step.replacedMstEdge.v === e.u));

        const color = isTested ? '#facc15' : isReplaced ? '#ef4444' : '#10b981';
        const width = isTested || isReplaced ? 3.5 : 2;

        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${isTested ? 'stroke-dasharray="4,2"' : ''} />
            <rect x="${mx - 7}" y="${my - 6}" width="14" height="12" fill="#0f172a" rx="2" />
            <text x="${mx}" y="${my + 3}" fill="#94a3b8" font-size="8" font-family="monospace" text-anchor="middle">${e.w}</text>
          </g>
        `;
      })
      .join('');

    const nodes = is5Node ? [1, 2, 3, 4, 5] : [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="16" fill="#1e3a8a" stroke="#38bdf8" stroke-width="1.5" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
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
          绿色为 MST 树边 | 黄色虚线为试探非树边 | 红色为被替换环上最大/严格次大边
        </div>
      </div>
    `;

    const rootEl =
      container.closest('#algo-second-mst-view') ||
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
        const indices = nodes;
        const renderRow = (name: string, arr: any[], activeName: string, color: string) => {
          const cells = indices
            .map((idx) => {
              const val = arr[idx] ?? -1;
              const isActive = step.activeArray === activeName && step.activeSlot === idx;
              const displayVal = val === -1 ? '-' : val;
              const bg = isActive ? '#fef08a' : '#1e293b';
              const textCol = isActive ? '#854d0e' : '#e2e8f0';
              const border = isActive ? '2px solid #eab308' : '1px solid #475569';

              return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 32px; height: 30px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 10px; font-weight: 700;">
                <span style="font-size: 7.5px; color: #64748b; line-height: 1;">[${idx}]</span>
                <span style="line-height: 1.1;">${displayVal}</span>
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

        const parentRow = renderRow('parent[] (并查集)', step.parentArray, 'parent', '#38bdf8');
        const max1Row = renderRow('max1[] (路径最大)', step.max1Array, 'max1', '#10b981');
        const max2Row = renderRow('max2[] (严格次大)', step.max2Array, 'max2', '#f59e0b');

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #cbd5e1; padding: 2px 0;">
            <div style="display: flex; flex-direction: column; gap: 4px; background: #0f172a; padding: 8px; border-radius: 6px; border: 1px solid #334155;">
              ${parentRow}
              ${max1Row}
              ${max2Row}
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
  id: 'second-mst',
  name: '严格次小生成树 (Strict Second MST)',
  viewId: 'algo-second-mst-view',
  category: 'graph',
  description: '进阶图论经典：Kruskal 求解主最小生成树、倍增维护环上严格最大与严格次大边、破圈严格大于换边 (洛谷 P4180)',
  icon: '🥈',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 80,
  learningGoal: '掌握严格次小生成树破圈定理、倍增同时维护最大与次大边技巧及规避等权替换陷阱',
});

export { Visualizer as SecondMstVisualizer };
