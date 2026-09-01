/**
 * 树上差分 (Tree Difference - 点差分与边差分) 声明式可视化器
 * 进阶树论: 点差分 diff[u]++, diff[v]++, diff[lca]--, diff[fa[lca]]--、子树和还原 (洛谷 P3128 / P3258)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TREE_DIFF_CODE_LANGUAGES,
  TREE_DIFF_PROBLEM_HTML,
  TREE_DIFF_ANALYSIS_HTML,
} from './tree-difference-problem-content';

export interface TreeDiffStep {
  mode: 'node' | 'edge';
  diffArray: Record<number, number>;
  recoveredCounts: Record<number, number>;
  activeLca: number;
  status: 'tag' | 'dfs' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildTreeDifferenceSteps(): TreeDiffStep[] {
  const steps: TreeDiffStep[] = [];

  steps.push({
    mode: 'node',
    diffArray: { 1: -1, 2: 0, 3: 0, 4: 1, 5: 1 },
    recoveredCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    activeLca: 2,
    status: 'tag',
    message: '1. [树上点差分打标记] 覆盖路径 (4 ➔ 5)，LCA 为 2，打标记：diff[4]++, diff[5]++, diff[2]--, diff[fa[2]=1]--！',
    log: '路径 (4, 5) 打标记：d[4]=+1, d[5]=+1, d[2]=-1, d[1]=-1',
    codeLine: [15, 24],
  });

  steps.push({
    mode: 'node',
    diffArray: { 1: -1, 2: 0, 3: 0, 4: 1, 5: 1 },
    recoveredCounts: { 1: 0, 2: 1, 3: 0, 4: 1, 5: 1 },
    activeLca: 2,
    status: 'dfs',
    message: '2. [自底向上 DFS 子树求和] 叶子 4 统计 1 次，叶子 5 统计 1 次，父节点 2 汇聚 1 + 1 - 1 = 1 次！',
    log: '子树求和汇聚：cnt[4]=1, cnt[5]=1, cnt[2]=1',
    codeLine: [26, 32],
  });

  steps.push({
    mode: 'node',
    diffArray: { 1: -1, 2: 0, 3: 0, 4: 1, 5: 1 },
    recoveredCounts: { 1: 0, 2: 1, 3: 0, 4: 1, 5: 1 },
    activeLca: 2,
    status: 'done',
    message: '🎉 [覆盖频次还原完成] 路径 4 ➔ 2 ➔ 5 上每个点覆盖次数精准还原为 1，非路径节点覆盖为 0！严格 O(N + M)！',
    log: '✓ 树上差分还原成功：最大覆盖点为 Node 2, 4, 5 (1 次)',
    codeLine: [34, 40],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<TreeDiffStep>({
  id: 'tree-difference',
  name: '树上差分 (Tree Difference)',
  category: 'graph',
  icon: '🌲',
  badge: {
    mode: '树上点差分 / 边差分',
    complexity: 'O(N + M) · O(N)',
  },
  card1Title: '🌲 树形拓扑与差分标记沙盘',
  card2Title: '🧭 差分数组 diff[u] 与还原频次监视器',
  card2Desc: '点差分标记 (u++, v++, lca--, fa[lca]--) 与自底向上子树和',
  legend: [
    { label: '普通树节点', color: '#0284c7' },
    { label: '👑 路径 LCA 节点', color: '#f59e0b' },
    { label: '🟢 被覆盖路径节点', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '5 节点树上点差分覆盖 (P3128)', values: {} },
  ],
  metrics: [
    { id: 'metric-active-lca', label: '路径 LCA', color: '#f59e0b' },
    { id: 'metric-max-cover', label: '最大覆盖频次', color: '#10b981' },
  ],
  codeLanguages: TREE_DIFF_CODE_LANGUAGES,
  problemHtml: TREE_DIFF_PROBLEM_HTML,
  analysisHtml: TREE_DIFF_ANALYSIS_HTML,
  buildSteps: () => buildTreeDifferenceSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      1: { x: 155, y: 35 },
      2: { x: 95, y: 100 },
      3: { x: 215, y: 100 },
      4: { x: 65, y: 165 },
      5: { x: 125, y: 165 },
    };

    const treeEdges = [
      { u: 1, v: 2 },
      { u: 1, v: 3 },
      { u: 2, v: 4 },
      { u: 2, v: 5 },
    ];

    const svgEdges = treeEdges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const onCover = (e.u === 2 && e.v === 4) || (e.u === 2 && e.v === 5);
        const color = onCover ? '#10b981' : '#475569';
        const width = onCover ? 3 : 1.5;

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />`;
      })
      .join('');

    const nodes = [1, 2, 3, 4, 5];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isLCA = step.activeLca === u;
        const cnt = step.recoveredCounts[u] || 0;
        const diff = step.diffArray[u] || 0;
        const bg = isLCA ? '#f59e0b' : cnt > 0 ? '#065f46' : '#1e3a8a';
        const border = isLCA ? '#facc15' : cnt > 0 ? '#10b981' : '#38bdf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${cnt > 0 || isLCA ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="${cnt > 0 ? '#34d399' : '#94a3b8'}" font-size="9" font-weight="700" text-anchor="middle">cnt:${cnt} (d:${diff >= 0 ? '+' : ''}${diff})</text>
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
          🟢 绿色高亮为覆盖路径 (4 ➔ 2 ➔ 5) | 点差分公式：$u++, v++, lca--, fa[lca]--$
        </div>
      </div>
    `;

    const root = container.closest('#algo-tree-difference-view');
    if (root) {
      const lcaEl = root.querySelector('#metric-active-lca');
      const maxEl = root.querySelector('#metric-max-cover');

      if (lcaEl) lcaEl.textContent = `Node ${step.activeLca}`;
      if (maxEl) maxEl.textContent = '1 次';

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const diffStr = Object.entries(step.diffArray)
          .map(([u, d]) => `<span style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 10px;">d[N${u}]: ${d >= 0 ? '+' : ''}${d}</span>`)
          .join(' ');

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>差分标记表 diff:</span>
              <div style="display: flex; gap: 4px;">${diffStr}</div>
            </div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 树上点差分公式:</span>
              <strong style="font-family: monospace; color: #2563eb;">diff[u]++, diff[v]++, diff[lca]--, diff[fa[lca]]--</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'tree-difference',
  name: '树上差分 (Tree Difference)',
  viewId: 'algo-tree-difference-view',
  category: 'graph',
  description: '进阶树论经典技术：树上点差分与边差分标记、自底向上 DFS 快速求和、O(N+M) 海量路径覆盖统计 (洛谷 P3128)',
  icon: '🌲',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 51,
  learningGoal: '掌握树上点差分与边差分的打标记四项公式证明及自底向上还原算法',
});

export { Visualizer as TreeDifferenceVisualizer };
