/**
 * 拓扑排序 (Kahn 算法) 可视化器 — 声明式 Thin Domain Adapter 架构
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：入度统计、零入度队列进出、邻边消除与 DAG 拓扑序列重构 (LeetCode 210)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  TOPOLOGICAL_SORT_PROBLEM_HTML,
  TOPOLOGICAL_SORT_ANALYSIS_HTML,
  TOPOLOGICAL_SORT_CODE_LANGUAGES,
} from './topological-sort-problem-content';
import {
  type TopoStep,
  TOPO_NODES,
  TOPO_EDGES,
  TOPO_NODE_POSITIONS,
  buildTopoSteps,
} from './topological-sort-step-compiler';
import {
  TopologicalSortCanvasAdapter,
  renderTopologicalSortCanvas,
} from '../../../core/renderers/adapters/topological-sort-canvas-adapter';

export type { TopoStep };
export {
  TOPO_NODES,
  TOPO_EDGES,
  TOPO_NODE_POSITIONS,
  buildTopoSteps,
  renderTopologicalSortCanvas,
};

const Visualizer = registerDeclarativeAlgorithm({
  id: 'topological-sort',
  aliases: ['class059-code02', 'class026-code01', 'course-schedule-ii-210', 'topo-sort-kahn'],
  name: '拓扑排序 (Topological Sort)',
  category: 'graph',
  description: '左程云算法通关课 Class 059 / 060：基于入度削减的 Kahn 算法，实现有向无环图（DAG）的线性拓扑序列求解与环路检测 (LeetCode 210)',
  icon: '🔀',
  difficulty: 2,
  levelOrder: 22,
  hasDeductionTree: true,
  learningGoal: '深入理解入度统计、零入度队列进出、邻边消除与有向环判定原理',
  metrics: [
    { id: 'metric-cur-node', label: '当前出队点 u', color: '#2563eb' },
    { id: 'metric-queue-elements', label: '就绪队列', color: '#10b981' },
    { id: 'metric-topo-len', label: '拓扑序列长度', color: '#a855f7' },
    { id: 'metric-cycle-status', label: '环路检测', color: '#16a34a' },
  ],
  legend: [
    { label: '当前出队点 u', state: 'pivot' },
    { label: '入度已为 0（队列中）', state: 'comparing' },
    { label: '已加入排序', state: 'sorted' },
  ],
  codeLanguages: TOPOLOGICAL_SORT_CODE_LANGUAGES,
  problemHtml: TOPOLOGICAL_SORT_PROBLEM_HTML,
  analysisHtml: TOPOLOGICAL_SORT_ANALYSIS_HTML,
  generateSteps: () => buildTopoSteps(),
  renderCanvas: (container, step) => TopologicalSortCanvasAdapter.render(container, step as TopoStep),
  renderCustomMetrics: (container, rawStep) => {
    const step = rawStep as TopoStep;
    const { inDegree, order } = step;

    const pillsHtml = TOPO_NODES.map((node) => {
      const deg = inDegree[node];
      const isZero = deg === 0;
      return `<div style="display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:6px; background:${
        isZero ? '#ecfdf5' : '#f8fafc'
      }; border:1px solid ${isZero ? '#a7f3d0' : '#e2e8f0'}; font-size:11px;">
        <span style="font-weight:700; color:#334155;">节点 ${node}:</span>
        <span style="font-family:monospace; font-weight:800; color:${
          isZero ? '#059669' : '#2563eb'
        };">${deg}</span>
      </div>`;
    }).join('');

    const orderHtml =
      order.length > 0
        ? order
            .map(
              (v) =>
                `<span style="display:inline-block; padding:2px 7px; border-radius:4px; background:#dcfce7; color:#15803d; font-family:monospace; font-weight:800; border:1px solid #bbf7d0;">${v}</span>`
            )
            .join('<span style="color:#94a3b8; font-weight:bold; margin:0 4px;">➔</span>')
        : '<span style="color:#94a3b8; font-size:12px;">尚未产生元素</span>';

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:8px; padding:4px 0;">
        <div style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center; background:#f8fafc; padding:6px; border-radius:6px; border:1px solid #e2e8f0;">
          ${pillsHtml}
        </div>
        <div style="display:flex; flex-wrap:wrap; align-items:center; gap:2px; justify-content:center; min-height:26px; background:#f8fafc; padding:4px; border-radius:6px; border:1px solid #e2e8f0;">
          <span style="font-size:11px; font-weight:700; color:#475569; margin-right:6px;">拓扑序列:</span>
          ${orderHtml}
        </div>
      </div>
    `;
  },
});

export const topologicalSortVisualizer = Visualizer;
export { Visualizer as TopologicalSortVisualizer };
