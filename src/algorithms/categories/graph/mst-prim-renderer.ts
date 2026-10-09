/**
 * Prim 最小生成树可视化器 — 声明式 Thin Domain Adapter 架构
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：加点法贪心扩充、minDist 切边维护与生成树高亮 (洛谷 P3366 / 左程云 class058)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  MST_PRIM_PROBLEM_HTML,
  MST_PRIM_ANALYSIS_HTML,
  MST_PRIM_CODE_LANGUAGES,
} from './mst-prim-problem-content';
import {
  type PrimStep,
  buildPrimSteps,
} from './mst-prim-step-compiler';
import {
  MST_NODES,
  MST_EDGES,
  MST_NODE_POSITIONS,
  PRIM_NODES,
  PRIM_EDGES,
  PRIM_NODE_POSITIONS,
} from './mst-kruskal-step-compiler';
import {
  MstPrimCanvasAdapter,
  renderMstPrimCanvas,
} from '../../../core/renderers/adapters/mst-prim-canvas-adapter';

export type { PrimStep };
export {
  MST_NODES,
  MST_EDGES,
  MST_NODE_POSITIONS,
  PRIM_NODES,
  PRIM_EDGES,
  PRIM_NODE_POSITIONS,
  buildPrimSteps,
  renderMstPrimCanvas,
};

const INF = Infinity;

const Visualizer = registerDeclarativeAlgorithm({
  id: 'mst-prim',
  aliases: ['class058-code02', 'prim-mst', 'luogu-p3366-prim', 'class027-code02'],
  name: 'Prim 最小生成树',
  category: 'graph',
  icon: '🌲',
  difficulty: 3,
  levelOrder: 30,
  hasDeductionTree: true,
  description: '左程云算法通关课 Class 058：加点法全局贪心生长最小生成树，维护切边最小距离数组 minDist (洛谷 P3366)',
  learningGoal: '掌握加点法贪心生长思想、切割性质（Cut Property）与 minDist 切边维护机制',
  metrics: [
    { id: 'metric-prim-nodes', label: '已入树节点', color: '#10b981' },
    { id: 'metric-prim-weight', label: '生成树总权值', color: '#10b981' },
    { id: 'metric-prim-edge', label: '当前切边', color: '#3b82f6' },
    { id: 'metric-prim-dist', label: 'minDist 数组', color: '#eab308' },
  ],
  legend: [
    { label: '已在生成树', state: 'discovered' },
    { label: '当前考察', state: 'pivot' },
    { label: '切边候选', color: '#f59e0b' },
    { label: '更优更新', state: 'comparing' },
  ],
  codeLanguages: MST_PRIM_CODE_LANGUAGES,
  problemHtml: MST_PRIM_PROBLEM_HTML,
  analysisHtml: MST_PRIM_ANALYSIS_HTML,
  generateSteps: () => buildPrimSteps(),
  renderCanvas: (container, step) => MstPrimCanvasAdapter.render(container, step as PrimStep),
  renderCustomMetrics: (container, rawStep) => {
    const step = rawStep as PrimStep;
    const { minDist, inMST, currentNode } = step;

    const distChipsHtml = MST_NODES.map((node) => {
      const isIn = inMST[node];
      const isCur = currentNode === node;
      const d = minDist[node];
      const dStr = d === INF ? '∞' : String(d);

      let border = '#e2e8f0';
      let bg = '#ffffff';
      let textColor = '#64748b';

      if (isCur) {
        border = '#fde047';
        bg = '#fef9c3';
        textColor = '#ca8a04';
      } else if (isIn) {
        border = '#86efac';
        bg = '#f0fdf4';
        textColor = '#16a34a';
      } else if (d !== INF) {
        border = '#93c5fd';
        bg = '#eff6ff';
        textColor = '#2563eb';
      }

      return `<div style="display:flex; flex-direction:column; align-items:center; padding:4px 8px; border-radius:6px; border:1px solid ${border}; background:${bg};">
        <span style="font-size:10px; color:#64748b; font-family:monospace;">节点 ${node}</span>
        <span style="font-size:11px; font-weight:800; color:${textColor}; font-family:monospace;">${isIn ? '已入树' : `d:${dStr}`}</span>
      </div>`;
    }).join('');

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:6px; padding:4px 0;">
        <div style="font-size:10px; font-weight:700; color:#64748b; text-align:center;">minDist 切边距离监测表</div>
        <div style="display:flex; gap:6px; justify-content:center; flex-wrap:wrap; background:#f8fafc; padding:6px; border-radius:6px; border:1px solid #e2e8f0;">
          ${distChipsHtml}
        </div>
      </div>
    `;
  },
});

export const mstPrimVisualizer = Visualizer;
export { Visualizer as MstPrimVisualizer };
