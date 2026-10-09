/**
 * Kruskal 最小生成树可视化器 — 声明式 Thin Domain Adapter 架构
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：边权升序排序、并查集判环与加边法贪心合并 (洛谷 P3366 / 左程云 class058)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  MST_KRUSKAL_PROBLEM_HTML,
  MST_KRUSKAL_ANALYSIS_HTML,
  MST_KRUSKAL_CODE_LANGUAGES,
} from './mst-kruskal-problem-content';
import {
  type KruskalStep,
  MST_NODES,
  MST_EDGES,
  MST_NODE_POSITIONS,
  PRIM_NODES,
  PRIM_EDGES,
  PRIM_NODE_POSITIONS,
  buildKruskalSteps,
} from './mst-kruskal-step-compiler';
import {
  MstKruskalCanvasAdapter,
  renderMstKruskalCanvas,
} from '../../../core/renderers/adapters/mst-kruskal-canvas-adapter';

export type { KruskalStep };
export {
  MST_NODES,
  MST_EDGES,
  MST_NODE_POSITIONS,
  PRIM_NODES,
  PRIM_EDGES,
  PRIM_NODE_POSITIONS,
  buildKruskalSteps,
  renderMstKruskalCanvas,
};

const Visualizer = registerDeclarativeAlgorithm({
  id: 'mst-kruskal',
  aliases: ['class058-code01', 'kruskal-mst', 'luogu-p3366-kruskal', 'class027-code01'],
  name: 'Kruskal 最小生成树',
  category: 'graph',
  icon: '🌲',
  difficulty: 3,
  levelOrder: 29,
  hasDeductionTree: true,
  description: '左程云算法通关课 Class 058：加边法全局贪心求解最小生成树，边权升序排列配合并查集判环 (洛谷 P3366)',
  learningGoal: '掌握加边法全局贪心思想、并查集回路检测与连通分量合并机制',
  metrics: [
    { id: 'metric-kruskal-edges', label: '已加入 MST 边数', color: '#10b981' },
    { id: 'metric-kruskal-weight', label: '生成树总权值', color: '#10b981' },
    { id: 'metric-kruskal-edge', label: '当前考察边', color: '#3b82f6' },
    { id: 'metric-kruskal-uf', label: '并查集 parent', color: '#a855f7' },
  ],
  legend: [
    { label: '已加入 MST', state: 'discovered' },
    { label: '当前考察边', state: 'comparing' },
    { label: '环路舍弃', state: 'swapping' },
  ],
  codeLanguages: MST_KRUSKAL_CODE_LANGUAGES,
  problemHtml: MST_KRUSKAL_PROBLEM_HTML,
  analysisHtml: MST_KRUSKAL_ANALYSIS_HTML,
  generateSteps: () => buildKruskalSteps(),
  renderCanvas: (container, step) => MstKruskalCanvasAdapter.render(container, step as KruskalStep),
  renderCustomMetrics: (container, rawStep) => {
    const step = rawStep as KruskalStep;
    const { allEdges, mstEdges, rejectedEdges, currentEdgeIndex } = step;

    const edgeChipsHtml = allEdges.map((e, idx) => {
      const isMst = mstEdges.some((me) => (me.u === e.u && me.v === e.v) || (me.u === e.v && me.v === e.u));
      const isRejected = rejectedEdges.some((re) => (re.u === e.u && re.v === e.v) || (re.u === e.v && re.v === e.u));
      const isCur = currentEdgeIndex === idx;

      let border = '#e2e8f0';
      let bg = '#ffffff';
      let statusText = '⚪ 待考量';
      let textColor = '#64748b';

      if (isMst) {
        border = '#86efac';
        bg = '#f0fdf4';
        statusText = '✅ 已入选';
        textColor = '#16a34a';
      } else if (isRejected) {
        border = '#fca5a5';
        bg = '#fef2f2';
        statusText = '❌ 环路';
        textColor = '#dc2626';
      } else if (isCur) {
        border = '#93c5fd';
        bg = '#eff6ff';
        statusText = '⏳ 判定中';
        textColor = '#2563eb';
      }

      return `<div style="display:flex; flex-direction:column; align-items:center; padding:4px 8px; border-radius:6px; border:1px solid ${border}; background:${bg};">
        <span style="font-size:11px; font-weight:700; color:#1e293b; font-family:monospace;">${e.u}↔${e.v} (w:${e.w})</span>
        <span style="font-size:9.5px; font-weight:700; color:${textColor};">${statusText}</span>
      </div>`;
    }).join('');

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:6px; padding:4px 0;">
        <div style="font-size:10px; font-weight:700; color:#64748b; text-align:center;">边权升序队列 (并查集判环)</div>
        <div style="display:flex; gap:6px; justify-content:center; flex-wrap:wrap; background:#f8fafc; padding:6px; border-radius:6px; border:1px solid #e2e8f0;">
          ${edgeChipsHtml}
        </div>
      </div>
    `;
  },
});

export const mstKruskalVisualizer = Visualizer;
export { Visualizer as MstKruskalVisualizer };
