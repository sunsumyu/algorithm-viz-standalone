/**
 * 基环树与环套树 DP (Pseudotree / Cycle-With-Trees DP) 声明式可视化器
 * 进阶树论: 拓扑找环、子树树形 DP 浓缩至环、断环为链 / 两次 DP 破环求解 (洛谷 P1453 / P2607 骑士)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  PSEUDOTREE_DP_CODE_LANGUAGES,
  PSEUDOTREE_DP_PROBLEM_HTML,
  PSEUDOTREE_DP_ANALYSIS_HTML,
} from './pseudotree-dp-problem-content';

export interface PseudotreeStep {
  cycleNodes: number[];
  treeRoots: number[];
  brokenEdge: [number, number] | null;
  dpRes: number;
  status: 'find_cycle' | 'tree_dp' | 'break_cycle' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildPseudotreeSteps(): PseudotreeStep[] {
  const steps: PseudotreeStep[] = [];

  steps.push({
    cycleNodes: [1, 2, 3],
    treeRoots: [1, 2, 3],
    brokenEdge: null,
    dpRes: 0,
    status: 'find_cycle',
    message: '1. [拓扑剥叶找环] 通过反向拓扑排序排除外围叶子，锁定基环树的唯一核心环 {1, 2, 3}！',
    log: '拓扑排序剥除外围树枝，定位核心环：{1, 2, 3}',
    codeLine: [15, 22],
  });

  steps.push({
    cycleNodes: [1, 2, 3],
    treeRoots: [1, 2, 3],
    brokenEdge: null,
    dpRes: 15,
    status: 'tree_dp',
    message: '2. [外围挂接子树 DP] 分别以环上节点 1, 2, 3 为根对其挂载子树运行常规树形 DP，权值汇聚至环上！',
    log: '外围子树 DP 浓缩完成：f[1], f[2], f[3] 聚合',
    codeLine: [24, 30],
  });

  steps.push({
    cycleNodes: [1, 2, 3],
    treeRoots: [1, 2, 3],
    brokenEdge: [1, 2],
    dpRes: 24,
    status: 'break_cycle',
    message: '3. [破环为链与两次 DP] 任意断开环上一条边 (1, 2)，分别强制“不选 1”和“不选 2”运行两次树形 DP！',
    log: '断开边 (1, 2)：分别强制不选 1 与不选 2 破环为链',
    codeLine: [32, 40],
  });

  steps.push({
    cycleNodes: [1, 2, 3],
    treeRoots: [1, 2, 3],
    brokenEdge: [1, 2],
    dpRes: 24,
    status: 'done',
    message: '🎉 [基环树最大独立集求解完成] 取两次 DP 的最大值，全图最大独立权值 = 24！严格 O(N) 线性时间！',
    log: '✓ 基环树 DP 完成：最优解 = max(DP1, DP2) = 24',
    codeLine: [42, 46],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<PseudotreeStep>({
  id: 'pseudotree-dp',
  name: '基环树与环套树 DP (Pseudotree DP)',
  category: 'graph',
  icon: '🚲',
  badge: {
    mode: '拓扑找环 + 断环为链',
    complexity: 'O(N) · O(N)',
  },
  card1Title: '🚲 基环拓扑与外围子树沙盘',
  card2Title: '🧭 核心环状态与断环 DP 监视器',
  card2Desc: '核心环节点集、外围子树 DP 浓缩与断环两次 DP 状态',
  legend: [
    { label: '核心环上节点', color: '#f59e0b' },
    { label: '外围子树节点', color: '#0284c7' },
    { label: '🔴 断开的环边', color: '#ef4444' },
    { label: '🟢 环上保留树边', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '5 节点经典基环树 (P1453)', values: {} },
  ],
  metrics: [
    { id: 'metric-cycle-nodes', label: '核心环节点集', color: '#f59e0b' },
    { id: 'metric-dp-optimal', label: '基环树 DP 最优解', color: '#10b981' },
  ],
  codeLanguages: PSEUDOTREE_DP_CODE_LANGUAGES,
  problemHtml: PSEUDOTREE_DP_PROBLEM_HTML,
  analysisHtml: PSEUDOTREE_DP_ANALYSIS_HTML,
  buildSteps: () => buildPseudotreeSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number; isCycle?: boolean }> = {
      1: { x: 155, y: 65, isCycle: true },
      2: { x: 95, y: 145, isCycle: true },
      3: { x: 215, y: 145, isCycle: true },
      4: { x: 55, y: 185 },
      5: { x: 255, y: 185 },
    };

    const edges = [
      { u: 1, v: 2, isCycle: true },
      { u: 2, v: 3, isCycle: true },
      { u: 3, v: 1, isCycle: true },
      { u: 2, v: 4, isCycle: false },
      { u: 3, v: 5, isCycle: false },
    ];

    const isBroken = (u: number, v: number) => step.brokenEdge && ((step.brokenEdge[0] === u && step.brokenEdge[1] === v) || (step.brokenEdge[0] === v && step.brokenEdge[1] === u));

    const svgEdges = edges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const broken = isBroken(e.u, e.v);
        const color = broken ? '#ef4444' : e.isCycle ? '#f59e0b' : '#475569';
        const width = broken ? 3 : e.isCycle ? 2.5 : 1.5;
        const dash = broken ? 'stroke-dasharray="4,4"' : '';

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${dash} />`;
      })
      .join('');

    const nodes = [1, 2, 3, 4, 5];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isCycle = p.isCycle;
        const bg = isCycle ? '#b45309' : '#0369a1';
        const border = isCycle ? '#facc15' : '#38bdf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="2" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 210">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🟡 金色环为基环拓扑 | 🔴 红色虚线为断开的环边 | 环上各点分别挂载子树树形 DP
        </div>
      </div>
    `;

    const root = container.closest('#algo-pseudotree-dp-view');
    if (root) {
      const cycEl = root.querySelector('#metric-cycle-nodes');
      const optEl = root.querySelector('#metric-dp-optimal');

      if (cycEl) cycEl.textContent = `{ ${step.cycleNodes.join(', ')} }`;
      if (optEl) optEl.textContent = step.dpRes > 0 ? `${step.dpRes}` : '计算中...';

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 基环树 DP 求解两部曲:</span>
              <strong style="font-family: monospace; color: #2563eb;">1. 子树树形 DP 浓缩至环 ➔ 2. 断环为链跑两次树形 DP 取 max</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'pseudotree-dp',
  name: '基环树与环套树 DP (Pseudotree DP)',
  viewId: 'algo-pseudotree-dp-view',
  category: 'graph',
  description: '进阶树论经典：拓扑排序找环、外围子树树形 DP 浓缩至环、断环为链两次 DP 求解最大独立集 (洛谷 P1453 / P2607)',
  icon: '🚲',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 47,
  learningGoal: '掌握基环树与内向/外向基环树的性质、找环算法及断环为链的 DP 状态分类讨论',
});

export { Visualizer as PseudotreeVisualizer };
