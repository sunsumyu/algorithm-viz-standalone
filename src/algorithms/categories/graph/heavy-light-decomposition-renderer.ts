/**
 * 树链剖分与线段树维护 (Heavy-Light Decomposition - 树剖 HLD) 声明式可视化器
 * 进阶树论: 重儿子 size[v] 最大、重链顶点 top[u]、两遍 DFS 连续 DFN 序映射、树上路径转化为 O(log N) 个线段树连续区间 (洛谷 P3384)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
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
  activePath: [number, number];
  status: 'dfs1' | 'dfs2' | 'query' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildHLDSteps(): HLDStep[] {
  const steps: HLDStep[] = [];

  steps.push({
    heavyEdges: [
      [1, 2],
      [2, 4],
    ],
    topNodes: { 1: 1, 2: 1, 4: 1, 3: 3, 5: 3 },
    dfnSeq: { 1: 1, 2: 2, 4: 3, 3: 4, 5: 5 },
    activePath: [4, 5],
    status: 'dfs1',
    message: '1. [DFS1 确定重儿子] 计算各子树大小，1 的重儿子为 2 (size:3)，2 的重儿子为 4 (size:1)！',
    log: 'DFS1 完成：重边 (1, 2), (2, 4)',
    codeLine: [18, 26],
  });

  steps.push({
    heavyEdges: [
      [1, 2],
      [2, 4],
    ],
    topNodes: { 1: 1, 2: 1, 4: 1, 3: 3, 5: 3 },
    dfnSeq: { 1: 1, 2: 2, 4: 3, 3: 4, 5: 5 },
    activePath: [4, 5],
    status: 'dfs2',
    message: '2. [DFS2 剖分重链与分配 DFN] 优先走重儿子，使每条重链内部 DFN 连续：重链 1-2-4 的 DFN 为 [1, 2, 3]，轻链 3-5 为 [4, 5]！',
    log: 'DFS2 完成：重链 1-2-4 顶端 top=1，轻链 3-5 顶端 top=3',
    codeLine: [28, 38],
  });

  steps.push({
    heavyEdges: [
      [1, 2],
      [2, 4],
    ],
    topNodes: { 1: 1, 2: 1, 4: 1, 3: 3, 5: 3 },
    dfnSeq: { 1: 1, 2: 2, 4: 3, 3: 4, 5: 5 },
    activePath: [4, 5],
    status: 'done',
    message: '🎉 [跳重链树上路径修改/查询] 修改 (4 ➔ 5)，两端按 top 深度向上跳，转化为线段树上连续区间 [4, 5] 与 [1, 3]，严格至多 O(log N) 段！',
    log: '✓ 树剖查询完成：跳重链至 LCA，转换为 O(log N) 个连续线段树区间',
    codeLine: [40, 48],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<HLDStep>({
  id: 'heavy-light-decomposition',
  name: '树链剖分 (Heavy-Light Decomposition)',
  category: 'graph',
  icon: '🪓',
  badge: {
    mode: '重链优先 DFN 连续映射',
    complexity: 'O(N) 预处理 · O(log² N) 查询',
  },
  card1Title: '🪓 重链粗线拓扑与轻重边划分沙盘',
  card2Title: '🧭 重链顶端 top[u] 与连续 DFN 序监视器',
  card2Desc: '重边 heavy[u]、重链顶点 top[u] 与路径区间线段树映射',
  legend: [
    { label: '重链节点 (Heavy Path)', color: '#0284c7' },
    { label: '轻链节点 (Light Node)', color: '#6366f1' },
    { label: '🟢 重边 (Heavy Edge)', color: '#10b981' },
    { label: '普通轻边', color: '#475569' },
  ],
  inputs: [],
  presets: [
    { label: '5 节点经典重链树 (P3384)', values: {} },
  ],
  metrics: [
    { id: 'metric-heavy-chain', label: '主重链顶点 top', color: '#2563eb' },
    { id: 'metric-path-segments', label: '线段树区间段数', color: '#10b981' },
  ],
  codeLanguages: HLD_CODE_LANGUAGES,
  problemHtml: HLD_PROBLEM_HTML,
  analysisHtml: HLD_ANALYSIS_HTML,
  buildSteps: () => buildHLDSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      1: { x: 155, y: 35 },
      2: { x: 95, y: 100 },
      3: { x: 215, y: 100 },
      4: { x: 75, y: 165 },
      5: { x: 235, y: 165 },
    };

    const treeEdges = [
      { u: 1, v: 2 },
      { u: 1, v: 3 },
      { u: 2, v: 4 },
      { u: 3, v: 5 },
    ];

    const isHeavy = (u: number, v: number) => step.heavyEdges.some(([hu, hv]) => (hu === u && hv === v) || (hu === v && hv === u));

    const svgEdges = treeEdges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const heavy = isHeavy(e.u, e.v);
        const color = heavy ? '#10b981' : '#475569';
        const width = heavy ? 3.5 : 1.5;

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />`;
      })
      .join('');

    const nodes = [1, 2, 3, 4, 5];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const top = step.topNodes[u] || u;
        const dfn = step.dfnSeq[u] || u;
        const isMainChain = top === 1;
        const bg = isMainChain ? '#0369a1' : '#4338ca';
        const border = isMainChain ? '#38bdf8' : '#818cf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="2" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="#34d399" font-size="8.5" font-weight="700" text-anchor="middle">dfn:${dfn} (t:${top})</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 200">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🟢 绿色粗线为重链 (1-2-4) | 优先 DFS 重儿子确保重链内 DFN 连续，支持线段树快速区间修改
        </div>
      </div>
    `;

    const root = container.closest('#algo-heavy-light-decomposition-view');
    if (root) {
      const topEl = root.querySelector('#metric-heavy-chain');
      const segEl = root.querySelector('#metric-path-segments');

      if (topEl) topEl.textContent = 'top[4]=1, top[5]=3';
      if (segEl) segEl.textContent = '≤ 2 log N 段';

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 树链剖分核心性质:</span>
              <strong style="font-family: monospace; color: #2563eb;">任意两点简单路径至多被切割为 O(log N) 条重链，单次修改 O(log² N)</strong>
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
  description: '高级树上数据结构之王：DFS1 找重儿子、DFS2 重链优先连续 DFN 映射、跳重链将树上路径操作转化为至多 O(log N) 段线段树连续区间 (洛谷 P3384)',
  icon: '🪓',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 43,
  learningGoal: '掌握树链剖分的轻重边定义、两遍 DFS 序连续映射原理以及跳重链 LCA 与线段树结合模板',
});

export { Visualizer as HeavyLightDecompositionVisualizer };
