/**
 * 冗余连接 II (LC 685) 领域适配器
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：声明式元数据配置、预设案例定义与委托挂载 (LOC < 120)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  REDUNDANT_EDGE_II_PROBLEM_HTML,
  REDUNDANT_EDGE_II_ANALYSIS_HTML,
  REDUNDANT_EDGE_II_CODE_LANGUAGES,
} from './redundant-edge-ii-problem-content';
import {
  type RedundantIIStep,
  RE2_NODES,
  RE2_EDGES,
  RE2_NODE_POSITIONS,
  buildRedundantIISteps,
} from './redundant-edge-ii-step-compiler';
import {
  RedundantEdgeIICanvasAdapter,
  renderRedundantEdgeIICanvas,
} from '../../../core/renderers/adapters/redundant-edge-ii-canvas-adapter';

export type { RedundantIIStep };
export {
  RE2_NODES,
  RE2_EDGES,
  RE2_NODE_POSITIONS,
  buildRedundantIISteps,
  renderRedundantEdgeIICanvas,
};

const { template, Visualizer } = registerDeclarativeAlgorithm<RedundantIIStep>({
  id: 'redundant-edge-ii',
  aliases: [
    'class057-code01',
    'redundant-connection-ii-685',
    'redundant-edge-2',
    'leetcode-685',
    'lc-685',
  ],
  name: '冗余连接 II (Redundant Connection II)',
  category: 'graph',
  icon: '🔁',
  difficulty: 3,
  levelOrder: 32,
  description: '左程云算法通关课 Class 057：有向图并查集高阶应用，兼顾入度为 2 双父节点冲突与有向环两大难题 (LeetCode 685)',
  learningGoal: '掌握有向树双父节点冲突分析、并查集有向环检验与分支回溯消除策略',
  hasDeductionTree: true,
  inputs: [],
  presets: [
    { label: '默认有向图 (3 节点 3 边)', values: {} },
  ],
  metrics: [
    { id: 'metric-re2-conflict', label: '双父冲突边 conflict', color: '#f59e0b' },
    { id: 'metric-re2-cycle', label: '成环边 cycle', color: '#ec4899' },
    { id: 'metric-re2-indegree', label: '入度表 inDegree', color: '#2563eb' },
    { id: 'metric-re2-uf', label: '并查集 parent', color: '#a855f7' },
  ],
  legend: [
    { label: '检查中', state: 'comparing' },
    { label: '双父节点冲突边', color: '#f59e0b' },
    { label: '导致成环边', color: '#ec4899' },
    { label: '最终冗余边', state: 'swapping' },
  ],
  codeLanguages: REDUNDANT_EDGE_II_CODE_LANGUAGES,
  problemHtml: REDUNDANT_EDGE_II_PROBLEM_HTML,
  analysisHtml: REDUNDANT_EDGE_II_ANALYSIS_HTML,
  generateSteps: () => buildRedundantIISteps(),
  renderCanvas: (container, step) => RedundantEdgeIICanvasAdapter.render(container, step),
  renderCustomMetrics: (container, step) => {
    const inDegChips = RE2_NODES.map((node) => {
      const deg = step.inDegree[node];
      const isConflict = deg > 1;
      const chipStyle = isConflict
        ? 'display:flex;flex-direction:column;align-items:center;padding:4px 8px;border-radius:6px;border:1px solid #fca5a5;background:#fef2f2;'
        : 'display:flex;flex-direction:column;align-items:center;padding:4px 8px;border-radius:6px;border:1px solid #e2e8f0;background:#f8fafc;';
      return `<div style="${chipStyle}">
        <span style="font-size:9px;color:#64748b;font-family:monospace;">节点 ${node}</span>
        <span style="font-size:11px;font-family:monospace;font-weight:700;color:${isConflict ? '#ef4444' : '#2563eb'};">in:${deg}</span>
      </div>`;
    }).join('');

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:6px;padding:4px 0;">
        <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;background:#f8fafc;padding:6px;border-radius:6px;border:1px solid #e2e8f0;">
          ${inDegChips}
        </div>
      </div>
    `;
  },
});

export const redundantEdgeIIVisualizer = Visualizer;
export { Visualizer as RedundantEdgeIIVisualizer };
