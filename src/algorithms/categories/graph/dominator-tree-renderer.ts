/**
 * DAG 支配树 (Dominator Tree - 拓扑排序与支配关系) 声明式可视化器
 * 进阶图论: DAG 拓扑反向递推、多前驱 LCA 汇聚、idom[u] 唯一直接支配点
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  DOMINATOR_TREE_CODE_LANGUAGES,
  DOMINATOR_TREE_PROBLEM_HTML,
  DOMINATOR_TREE_ANALYSIS_HTML,
} from './dominator-tree-problem-content';

export interface DominatorStep {
  curNode: number;
  idomMap: Record<number, number | null>;
  dominatorTreeEdges: Array<{ u: number; v: number }>;
  status: 'start' | 'topo' | 'lca' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildDominatorTreeSteps(): DominatorStep[] {
  const steps: DominatorStep[] = [];

  steps.push({
    curNode: 1,
    idomMap: { 1: null, 2: null, 3: null, 4: null },
    dominatorTreeEdges: [],
    status: 'start',
    message: '1. [源点初始支配] 源点 1 的直接支配点 idom[1] 为根。',
    log: '源点 1 初始化：idom[1] = Root',
    codeLine: [15, 20],
  });

  steps.push({
    curNode: 2,
    idomMap: { 1: null, 2: 1, 3: null, 4: null },
    dominatorTreeEdges: [{ u: 1, v: 2 }],
    status: 'topo',
    message: '2. [前驱仅有源点 1] 节点 2 的唯一前驱为 1，直接支配点 idom[2] = 1！',
    log: '拓扑处理节点 2：idom[2] = 1',
    codeLine: [22, 28],
  });

  steps.push({
    curNode: 3,
    idomMap: { 1: null, 2: 1, 3: 1, 4: null },
    dominatorTreeEdges: [
      { u: 1, v: 2 },
      { u: 1, v: 3 },
    ],
    status: 'topo',
    message: '3. [前驱仅有源点 1] 节点 3 的唯一前驱为 1，直接支配点 idom[3] = 1！',
    log: '拓扑处理节点 3：idom[3] = 1',
    codeLine: [22, 28],
  });

  steps.push({
    curNode: 4,
    idomMap: { 1: null, 2: 1, 3: 1, 4: 1 },
    dominatorTreeEdges: [
      { u: 1, v: 2 },
      { u: 1, v: 3 },
      { u: 1, v: 4 },
    ],
    status: 'done',
    message: '🎉 [多前驱求 LCA 支配] 节点 4 的前驱为 2 与 3，在支配树上计算 LCA(2, 3) = 1，直接支配点 idom[4] = 1！',
    log: '✓ 节点 4 汇聚前驱 LCA(2, 3) = 1，全图支配树构建完成',
    codeLine: [30, 36],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<DominatorStep>({
  id: 'dominator-tree',
  name: 'DAG 支配树 (Dominator Tree)',
  category: 'graph',
  icon: '🏛️',
  badge: {
    mode: 'DAG 拓扑倍增 LCA',
    complexity: 'O((V + E) log V) · O(V + E)',
  },
  card1Title: '🏛️ 原 DAG 流程与支配树沙盘',
  card2Title: '🧭 直接支配点 idom[u] 监视器',
  card2Desc: '各节点前驱集在支配树上的公共 LCA、不可绕过路径与支配树连边',
  legend: [
    { label: '原 DAG 节点', color: '#0284c7' },
    { label: '👑 支配树根节点', color: '#f59e0b' },
    { label: '🟢 支配树直连边 (idom)', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '4 节点菱形 DAG 支配树', values: {} },
  ],
  metrics: [
    { id: 'metric-cur-node', label: '当前处理节点', color: '#2563eb' },
    { id: 'metric-idom-res', label: '直接支配点 idom', color: '#10b981' },
  ],
  codeLanguages: DOMINATOR_TREE_CODE_LANGUAGES,
  problemHtml: DOMINATOR_TREE_PROBLEM_HTML,
  analysisHtml: DOMINATOR_TREE_ANALYSIS_HTML,
  buildSteps: () => buildDominatorTreeSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      1: { x: 75, y: 110 },
      2: { x: 155, y: 55 },
      3: { x: 155, y: 165 },
      4: { x: 235, y: 110 },
    };

    const dagEdges = [
      { u: 1, v: 2 },
      { u: 1, v: 3 },
      { u: 2, v: 4 },
      { u: 3, v: 4 },
    ];

    const svgEdges = dagEdges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const isDom = step.dominatorTreeEdges.some((de) => de.u === e.u && de.v === e.v);
        const color = isDom ? '#10b981' : '#475569';
        const width = isDom ? 2.5 : 1.5;

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />`;
      })
      .join('');

    const nodes = [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isCur = step.curNode === u;
        const bg = u === 1 ? '#f59e0b' : isCur ? '#065f46' : '#1e3a8a';
        const border = isCur ? '#10b981' : '#38bdf8';
        const idomVal = step.idomMap[u];

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${isCur ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="#34d399" font-size="9" font-weight="700" text-anchor="middle">idom:${idomVal ?? '—'}</text>
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
          🟢 绿色连线为支配树直接支配边 idom | 节点 4 的两驱汇聚为 LCA(2, 3) = 1
        </div>
      </div>
    `;

    const root = container.closest('#algo-dominator-tree-view');
    if (root) {
      const nodeEl = root.querySelector('#metric-cur-node');
      const idomEl = root.querySelector('#metric-idom-res');

      if (nodeEl) nodeEl.textContent = `Node ${step.curNode}`;
      if (idomEl) idomEl.textContent = step.idomMap[step.curNode] ? `Node ${step.idomMap[step.curNode]}` : 'Root';

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const idomItems = Object.entries(step.idomMap)
          .map(([u, idom]) => `<span style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 10px;">idom[N${u}] = ${idom !== null ? `N${idom}` : 'Root'}</span>`)
          .join(' ');

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>直接支配点表 idom[u]:</span>
              <div style="display: flex; gap: 4px;">${idomItems}</div>
            </div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 DAG 支配转移定理:</span>
              <strong style="font-family: monospace; color: #2563eb;">idom[u] = LCA_{v ∈ pre[u]}(idom[v])</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'dominator-tree',
  name: 'DAG 支配树 (Dominator Tree)',
  viewId: 'algo-dominator-tree-view',
  category: 'graph',
  description: '进阶编译图论经典：DAG 拓扑反向递推、多前驱在支配树上倍增求 LCA、O((V+E)log V) 高效构建支配树 (洛谷 P2597 灾难)',
  icon: '🏛️',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 57,
  learningGoal: '掌握 DAG 支配树的拓扑+倍增 LCA 构造算法以及支配关系在控制流死锁与级联影响分析中的应用',
});

export { Visualizer as DominatorTreeVisualizer };
