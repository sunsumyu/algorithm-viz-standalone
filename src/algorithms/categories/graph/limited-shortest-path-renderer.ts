/**
 * K 站中转内最便宜的航班 (LC 787 - Limited Shortest Path) 领域适配器
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：声明式元数据配置、预设案例定义与委托挂载 (LOC < 130)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  LIMITED_SHORTEST_PATH_PROBLEM_HTML,
  LIMITED_SHORTEST_PATH_ANALYSIS_HTML,
  LIMITED_SHORTEST_PATH_CODE_LANGUAGES,
} from './limited-shortest-path-problem-content';
import {
  type LSPStep,
  LSP_EDGES,
  LSP_NODES,
  LSP_NODE_POS,
  LSP_SOURCE,
  LSP_TARGET,
  LSP_K,
  buildLSPSteps,
  withMetrics,
} from './limited-shortest-path-step-compiler';
import { LimitedShortestPathCanvasAdapter } from '../../../core/renderers/adapters/limited-shortest-path-canvas-adapter';

export type { LSPStep };
export {
  LSP_EDGES,
  LSP_NODES,
  LSP_NODE_POS,
  LSP_SOURCE,
  LSP_TARGET,
  LSP_K,
  buildLSPSteps,
  withMetrics,
};

const { template, Visualizer } = registerDeclarativeAlgorithm<LSPStep>({
  id: 'limited-shortest-path',
  name: '有限最短路 (LC 787)',
  category: 'graph',
  description: 'Bellman-Ford 状态备份松弛：限制最多走 K+1 条边求解最便宜航班价格',
  icon: '✈️',
  difficulty: 2,
  levelOrder: 22,
  learningGoal: '掌握 Bellman-Ford 算法在有限边数约束下的状态备份与松弛过程',
  hasDeductionTree: true,
  aliases: [
    'cheapest-flights-within-k-stops',
    'leetcode-787',
    'lc-787',
  ],
  inputs: [],
  presets: [
    { label: '默认航班图 (K=2)', values: {} },
  ],
  metrics: [
    { id: 'metric-lsp-round', label: '当前轮次', color: '#2563eb' },
    { id: 'metric-lsp-edge', label: '考察航线 (u➔v)', color: '#eab308' },
    { id: 'metric-lsp-relax', label: '松弛次数', color: '#16a34a' },
    { id: 'metric-lsp-dst', label: '终点最低价格', color: '#10b981' },
  ],
  legend: [
    { label: '松弛成功', color: '#16a34a' },
    { label: '正在考察', color: '#2563eb' },
    { label: '普通航线', color: '#cbd5e1' },
  ],
  codeLanguages: LIMITED_SHORTEST_PATH_CODE_LANGUAGES,
  problemHtml: LIMITED_SHORTEST_PATH_PROBLEM_HTML,
  analysisHtml: LIMITED_SHORTEST_PATH_ANALYSIS_HTML,
  generateSteps: () => withMetrics(buildLSPSteps()),
  renderCanvas: (container, step) => LimitedShortestPathCanvasAdapter.render(container, step),
  renderCustomMetrics: (container, step) => {
    const distChips = LSP_NODES.map((node) => {
      const dVal = step.dist[node];
      const isTarget = step.currentEdge && step.currentEdge.v === node;
      const chipStyle = isTarget
        ? 'display:flex;flex-direction:column;align-items:center;padding:5px 8px;border-radius:6px;border:1px solid #93c5fd;background:#eff6ff;'
        : 'display:flex;flex-direction:column;align-items:center;padding:5px 8px;border-radius:6px;border:1px solid #e2e8f0;background:#f8fafc;';
      return `<div style="${chipStyle}">
        <span style="font-size:9.5px;color:#64748b;font-family:monospace;">dist[${node}]</span>
        <span style="font-size:11px;font-family:monospace;font-weight:700;color:${dVal >= 999999 ? '#94a3b8' : '#2563eb'};">${dVal >= 999999 ? 'INF' : dVal}</span>
      </div>`;
    }).join('');

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:6px;padding:4px 0;">
        <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;background:#f8fafc;padding:8px;border-radius:6px;border:1px solid #e2e8f0;">
          ${distChips}
        </div>
      </div>
    `;
  },
});

export const limitedShortestPathVisualizer = Visualizer;
export { Visualizer as LimitedShortestPathVisualizer };
