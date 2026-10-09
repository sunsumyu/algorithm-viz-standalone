/**
 * 冗余连接 (LC 684) 领域适配器
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：声明式元数据配置、预设案例定义与委托挂载 (LOC < 120)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  REDUNDANT_EDGE_PROBLEM_HTML,
  REDUNDANT_EDGE_ANALYSIS_HTML,
  REDUNDANT_EDGE_CODE_LANGUAGES,
} from './redundant-edge-problem-content';
import {
  type RedundantStep,
  RE_NODES,
  RE_EDGES,
  RE_NODE_POSITIONS,
  buildRedundantSteps,
} from './redundant-edge-step-compiler';
import {
  RedundantEdgeCanvasAdapter,
  renderRedundantEdgeCanvas,
} from '../../../core/renderers/adapters/redundant-edge-canvas-adapter';

export type { RedundantStep };
export {
  RE_NODES,
  RE_EDGES,
  RE_NODE_POSITIONS,
  buildRedundantSteps,
  renderRedundantEdgeCanvas,
};

const { template, Visualizer } = registerDeclarativeAlgorithm<RedundantStep>({
  id: 'redundant-edge',
  name: '冗余连接 (Redundant Connection)',
  category: 'graph',
  icon: '🔗',
  difficulty: 2,
  levelOrder: 31,
  description: '左程云算法通关课 Class 056：并查集经典实战，无向图动态加边判环，快速识别导致多余回路的冗余边 (LeetCode 684)',
  learningGoal: '掌握并查集连通性判环机制、动态合并原则与树的环路消除策略',
  hasDeductionTree: true,
  aliases: [
    'redundant-connection',
    'leetcode-684',
    'lc-684',
    'class056-code01',
  ],
  inputs: [],
  presets: [
    { label: '默认图 (5 节点 5 边)', values: {} },
  ],
  metrics: [
    { id: 'metric-re-cur-edge', label: '当前考察边', color: '#3b82f6' },
    { id: 'metric-re-redundant', label: '冗余边', color: '#ef4444' },
    { id: 'metric-re-tree-edges', label: '已合并树边数', color: '#10b981' },
    { id: 'metric-re-parent', label: 'parent 数组', color: '#a855f7' },
  ],
  legend: [
    { label: '树边 (已合并)', state: 'discovered' },
    { label: '检查中', state: 'comparing' },
    { label: '冗余成环边', state: 'swapping' },
    { label: '待检查', color: '#cbd5e1' },
  ],
  codeLanguages: REDUNDANT_EDGE_CODE_LANGUAGES,
  problemHtml: REDUNDANT_EDGE_PROBLEM_HTML,
  analysisHtml: REDUNDANT_EDGE_ANALYSIS_HTML,
  generateSteps: () => buildRedundantSteps(),
  renderCanvas: (container, step) => RedundantEdgeCanvasAdapter.render(container, step),
  renderCustomMetrics: (container, step) => {
    const parentChips = RE_NODES.map((node) => {
      const pVal = step.parent[node];
      const isCur = step.currentEdge && (step.currentEdge[0] === node || step.currentEdge[1] === node);
      const isRoot = pVal === node;
      const chipStyle = isCur
        ? 'display:flex;flex-direction:column;align-items:center;padding:4px 8px;border-radius:6px;border:1px solid #93c5fd;background:#eff6ff;'
        : 'display:flex;flex-direction:column;align-items:center;padding:4px 8px;border-radius:6px;border:1px solid #e2e8f0;background:#f8fafc;';
      return `<div style="${chipStyle}">
        <span style="font-size:9px;color:#64748b;font-family:monospace;">节点 ${node}</span>
        <span style="font-size:11px;font-family:monospace;font-weight:700;color:${isRoot ? '#10b981' : '#a855f7'};">p:${pVal}</span>
      </div>`;
    }).join('');

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:6px;padding:4px 0;">
        <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;background:#f8fafc;padding:6px;border-radius:6px;border:1px solid #e2e8f0;">
          ${parentChips}
        </div>
      </div>
    `;
  },
});

export const redundantEdgeVisualizer = Visualizer;
export { Visualizer as RedundantEdgeVisualizer };
