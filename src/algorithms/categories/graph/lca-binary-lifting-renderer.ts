/**
 * 最近公共祖先 LCA (Binary Lifting LCA - 树上倍增) 声明式可视化器
 * 进阶树论: 深度对齐 depth[u] == depth[v]、二进制倍增同步上跳 up[u][i] != up[v][i]、O(log N) 极速查询 (洛谷 P3379)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  LCA_BINARY_LIFTING_CODE_LANGUAGES,
  LCA_BINARY_LIFTING_PROBLEM_HTML,
  LCA_BINARY_LIFTING_ANALYSIS_HTML,
} from './lca-binary-lifting-problem-content';

export interface LCAStep {
  nodeU: number;
  nodeV: number;
  curU: number;
  curV: number;
  curPower: number;
  lcaResult: number | null;
  status: 'align' | 'lift' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildLCASteps(): LCAStep[] {
  const steps: LCAStep[] = [];

  steps.push({
    nodeU: 4,
    nodeV: 5,
    curU: 4,
    curV: 5,
    curPower: 2,
    lcaResult: null,
    status: 'align',
    message: '1. [深度对齐阶段] 查询 LCA(4, 5)，双方深度同为 depth = 2，无需单侧上跳对齐！',
    log: '深度相同：depth[4]=2, depth[5]=2',
    codeLine: [18, 24],
  });

  steps.push({
    nodeU: 4,
    nodeV: 5,
    curU: 4,
    curV: 5,
    curPower: 0,
    lcaResult: null,
    status: 'lift',
    message: '2. [倍增试跳阶段] 尝试跳 2^1=2 步到达根 1 (相同不跳)；尝试跳 2^0=1 步到达 2 与 3 (不同跳上)！',
    log: '二进制试跳：跳 2^0 步未相交，同步上跳至 2 与 3',
    codeLine: [26, 32],
  });

  steps.push({
    nodeU: 4,
    nodeV: 5,
    curU: 2,
    curV: 3,
    curPower: 0,
    lcaResult: 1,
    status: 'done',
    message: '🎉 [LCA 查询完成] 当前节点的直接父节点 up[2][0] = 1 即为 LCA(4, 5) = 1！单次查询耗时严格 O(log N)！',
    log: '✓ LCA 查询成功：LCA(4, 5) = up[2][0] = 1',
    codeLine: [34, 38],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<LCAStep>({
  id: 'lca-binary-lifting',
  name: '最近公共祖先 (LCA Binary Lifting)',
  category: 'graph',
  icon: '🪜',
  badge: {
    mode: '树上二进制倍增',
    complexity: 'O(N log N) 预处理 · O(log N) 查询',
  },
  card1Title: '🪜 树形拓扑与二进制倍增上跳沙盘',
  card2Title: '🧭 节点深度与倍增表 up[u][i] 监视器',
  card2Desc: '节点深度对齐、2^i 级祖先指针与最近公共祖先汇聚',
  legend: [
    { label: '查询节点 (u, v)', color: '#f59e0b' },
    { label: '普通树节点', color: '#0284c7' },
    { label: '🟢 最近公共祖先 LCA', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '5 节点二叉树 LCA 查询 (P3379)', values: {} },
  ],
  metrics: [
    { id: 'metric-lca-query', label: '查询对 (u, v)', color: '#f59e0b' },
    { id: 'metric-lca-res', label: 'LCA 结果', color: '#10b981' },
  ],
  codeLanguages: LCA_BINARY_LIFTING_CODE_LANGUAGES,
  problemHtml: LCA_BINARY_LIFTING_PROBLEM_HTML,
  analysisHtml: LCA_BINARY_LIFTING_ANALYSIS_HTML,
  buildSteps: () => buildLCASteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number; depth: number }> = {
      1: { x: 155, y: 35, depth: 0 },
      2: { x: 95, y: 100, depth: 1 },
      3: { x: 215, y: 100, depth: 1 },
      4: { x: 75, y: 165, depth: 2 },
      5: { x: 235, y: 165, depth: 2 },
    };

    const treeEdges = [
      { u: 1, v: 2 },
      { u: 1, v: 3 },
      { u: 2, v: 4 },
      { u: 3, v: 5 },
    ];

    const svgEdges = treeEdges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#475569" stroke-width="1.5" />`;
      })
      .join('');

    const nodes = [1, 2, 3, 4, 5];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isQuery = step.nodeU === u || step.nodeV === u;
        const isLCA = step.lcaResult === u;
        const bg = isLCA ? '#065f46' : isQuery ? '#b45309' : '#0369a1';
        const border = isLCA ? '#10b981' : isQuery ? '#facc15' : '#38bdf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${isQuery || isLCA ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="#94a3b8" font-size="8.5" font-weight="700" text-anchor="middle">d:${p.depth}</text>
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
          🟡 金色为查询节点对 (4, 5) | 🟢 绿色为公共祖先 LCA = 1 | 预处理 $O(N \log N)$，单次查询 $O(\log N)$
        </div>
      </div>
    `;

    const root = container.closest('#algo-lca-binary-lifting-view');
    if (root) {
      const qEl = root.querySelector('#metric-lca-query');
      const lcaEl = root.querySelector('#metric-lca-res');

      if (qEl) qEl.textContent = `(${step.nodeU}, ${step.nodeV})`;
      if (lcaEl) lcaEl.textContent = step.lcaResult ? `Node ${step.lcaResult}` : '查询中...';

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 倍增递推核心方程:</span>
              <strong style="font-family: monospace; color: #2563eb;">up[u][i] = up[up[u][i - 1]][i - 1] (2^i 步由两段 2^(i-1) 步拼合)</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'lca-binary-lifting',
  name: '最近公共祖先 (LCA Binary Lifting)',
  viewId: 'algo-lca-binary-lifting-view',
  category: 'graph',
  description: '经典树论核心基础：深度对齐、2^i 步二进制倍增试跳、O(N log N) 预处理与 O(log N) 在线查询 (洛谷 P3379)',
  icon: '🪜',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 46,
  learningGoal: '掌握树上倍增表 up[u][i] 的状态转移构建、深度对齐技巧以及跳步终止条件的推导',
});

export { Visualizer as LCABinaryLiftingVisualizer };
