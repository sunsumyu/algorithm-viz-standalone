/**
 * 虚树与树形 DP (Virtual Tree / Auxiliary Tree) 声明式可视化器
 * 进阶树论: 关键点按 Dfn 序排序、单调栈维护极浅 LCA 链、虚树浓缩规模至 O(K) (洛谷 P2495 消耗战)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
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
  status: 'dfn' | 'stack' | 'built' | 'dp' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildVirtualTreeSteps(): VirtualTreeStep[] {
  const steps: VirtualTreeStep[] = [];

  const keys = [4, 5, 7];

  steps.push({
    keyNodes: keys,
    virtualTreeEdges: [],
    virtualTreeNodes: keys,
    monoStack: [1],
    dpVal: {},
    status: 'dfn',
    message: '1. [关键点提取与 DFN 序排序] 关键点集合为 {4, 5, 7}，按 DFS 序排好，单调栈初始压入根节点 1。',
    log: '关键点按 DFN 排序：[4, 5, 7]，栈顶压入根节点 1',
    codeLine: [18, 24],
  });

  steps.push({
    keyNodes: keys,
    virtualTreeEdges: [
      { u: 2, v: 4 },
      { u: 2, v: 5 },
    ],
    virtualTreeNodes: [1, 2, 4, 5],
    monoStack: [1, 2, 5],
    dpVal: {},
    status: 'stack',
    message: '2. [单调栈插入关键点] 插入关键点 4 与 5，计算 LCA(4, 5) = 2，连边 2➔4 与 2➔5。',
    log: '单调栈构建：加入 LCA 节点 2，连边 2->4, 2->5',
    codeLine: [26, 35],
  });

  const allVTreeEdges = [
    { u: 1, v: 2 },
    { u: 2, v: 4 },
    { u: 2, v: 5 },
    { u: 1, v: 7 },
  ];

  steps.push({
    keyNodes: keys,
    virtualTreeEdges: allVTreeEdges,
    virtualTreeNodes: [1, 2, 4, 5, 7],
    monoStack: [],
    dpVal: {},
    status: 'built',
    message: '3. [虚树构建完成] 栈内剩余节点逐一退栈并连边，虚树节点规模由全树 N 浓缩至 O(K) = 5 个点！',
    log: '虚树浓缩构建完毕：规模 O(K) = 5 节点',
    codeLine: [38, 42],
  });

  steps.push({
    keyNodes: keys,
    virtualTreeEdges: allVTreeEdges,
    virtualTreeNodes: [1, 2, 4, 5, 7],
    monoStack: [],
    dpVal: { 4: 3, 5: 2, 2: 4, 7: 5, 1: 9 },
    status: 'done',
    message: '🎉 [虚树树形 DP 完成] 仅在 5 个虚树节点上运行树形 DP，最小割断代价 = dp[1] = 9！耗时严格 O(K log N)！',
    log: '✓ 虚树 DP 求解完毕：dp[1] = 9，复杂度 O(K log N)',
    codeLine: [45, 52],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<VirtualTreeStep>({
  id: 'virtual-tree',
  name: '虚树与树形 DP (Virtual Tree)',
  category: 'graph',
  icon: '🌲',
  badge: {
    mode: '单调栈浓缩 O(K log N)',
    complexity: 'O(K log N) · O(K)',
  },
  card1Title: '🌲 原树与关键点浓缩虚树沙盘',
  card2Title: '🧭 虚树单调栈与 DP 状态监视器',
  card2Desc: '关键点集按 DFN 序、单调栈维护 LCA 链与 O(K) 虚树 DP',
  legend: [
    { label: '原树非关键点 (已浓缩略去)', color: '#334155' },
    { label: '⭐ 关键点 (Query Keys)', color: '#f59e0b' },
    { label: '👑 虚树 LCA 汇聚点', color: '#6366f1' },
    { label: '🟢 虚树边 (Virtual Edge)', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '7 节点原树浓缩 3 个关键点 (P2495)', values: {} },
  ],
  metrics: [
    { id: 'metric-key-count', label: '关键点数量 K', color: '#f59e0b' },
    { id: 'metric-vtree-nodes', label: '虚树总节点数', color: '#2563eb' },
    { id: 'metric-dp-ans', label: '虚树 DP 最优解', color: '#10b981' },
  ],
  codeLanguages: VIRTUAL_TREE_CODE_LANGUAGES,
  problemHtml: VIRTUAL_TREE_PROBLEM_HTML,
  analysisHtml: VIRTUAL_TREE_ANALYSIS_HTML,
  buildSteps: () => buildVirtualTreeSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      1: { x: 155, y: 35 },
      2: { x: 90, y: 95 },
      3: { x: 220, y: 95 },
      4: { x: 60, y: 165 },
      5: { x: 120, y: 165 },
      6: { x: 190, y: 165 },
      7: { x: 250, y: 165 },
    };

    const origEdges = [
      { u: 1, v: 2 },
      { u: 1, v: 3 },
      { u: 2, v: 4 },
      { u: 2, v: 5 },
      { u: 3, v: 6 },
      { u: 3, v: 7 },
    ];

    const isVEdge = (u: number, v: number) => step.virtualTreeEdges.some((e) => (e.u === u && e.v === v) || (e.u === v && e.v === u));

    const svgEdges = origEdges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const inV = isVEdge(e.u, e.v);
        const color = inV ? '#10b981' : '#334155';
        const width = inV ? 3 : 1;

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />`;
      })
      .join('');

    const nodes = [1, 2, 3, 4, 5, 6, 7];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isKey = step.keyNodes.includes(u);
        const inVTree = step.virtualTreeNodes.includes(u);
        const isLCA = inVTree && !isKey && u !== 1;
        const bg = isKey ? '#f59e0b' : isLCA ? '#6366f1' : inVTree ? '#0284c7' : '#1e293b';
        const border = isKey ? '#facc15' : inVTree ? '#10b981' : '#475569';
        const dp = step.dpVal[u] !== undefined ? `dp:${step.dpVal[u]}` : '';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="${inVTree ? 14 : 11}" fill="${bg}" stroke="${border}" stroke-width="${inVTree ? 2 : 1}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 24}" fill="#34d399" font-size="8.5" font-weight="700" text-anchor="middle">${dp}</text>
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
          🟡 金色为关键点 | 🟣 紫色为两两 LCA | 🟢 绿色高亮粗线为建立的 O(K) 规模虚树
        </div>
      </div>
    `;

    const root = container.closest('#algo-virtual-tree-view');
    if (root) {
      const kEl = root.querySelector('#metric-key-count');
      const vEl = root.querySelector('#metric-vtree-nodes');
      const dpEl = root.querySelector('#metric-dp-ans');

      if (kEl) kEl.textContent = `${step.keyNodes.length}`;
      if (vEl) vEl.textContent = `${step.virtualTreeNodes.length}`;
      if (dpEl) dpEl.textContent = step.dpVal[1] !== undefined ? `${step.dpVal[1]}` : '计算中...';

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const stackStr = step.monoStack.length > 0 ? `[${step.monoStack.join(' ➔ ')}]` : '(空)';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>当前单调栈 LCA 链:</span>
              <strong style="color: #6366f1; font-family: monospace;">${stackStr}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 虚树复杂度定理:</span>
              <strong style="font-family: monospace; color: #2563eb;">虚树点数 ≤ 2K - 1，树形 DP 严格降至 O(K log N)</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'virtual-tree',
  name: '虚树与树形 DP (Virtual Tree)',
  viewId: 'algo-virtual-tree-view',
  category: 'graph',
  description: '进阶树论规模浓缩：关键点按 DFN 序排序、单调栈维护极浅 LCA 链、树形 DP 由 O(N) 降至 O(K log N) (洛谷 P2495 消耗战)',
  icon: '🌲',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 60,
  learningGoal: '掌握虚树的单调栈构建算法、关键点与 LCA 浓缩性质以及在海量询问树形 DP 中的应用',
});

export { Visualizer as VirtualTreeVisualizer };
