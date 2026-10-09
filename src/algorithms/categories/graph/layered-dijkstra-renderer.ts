/**
 * 分层图最短路 (Layered Graph Shortest Path - 飞行路线 / 洛谷 P4568) 领域适配器
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：声明式元数据配置、预设案例定义与委托挂载 (LOC < 100)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  LAYERED_DIJKSTRA_CODE_LANGUAGES,
  LAYERED_DIJKSTRA_PROBLEM_HTML,
  LAYERED_DIJKSTRA_ANALYSIS_HTML,
} from './layered-dijkstra-problem-content';
import {
  LAYERED_PRESETS,
  type LayeredGraphPreset,
  type LayeredStep,
  buildLayeredDijkstraSteps,
} from './layered-dijkstra-step-compiler';
import { LayeredDijkstraCanvasAdapter } from '../../../core/renderers/adapters/layered-dijkstra-canvas-adapter';

export {
  LAYERED_PRESETS,
  type LayeredGraphPreset,
  type LayeredStep,
  buildLayeredDijkstraSteps,
};

const { template, Visualizer } = createDeclarativeVisualizer<LayeredStep>({
  id: 'layered-dijkstra',
  name: '分层图最短路 (Layered Dijkstra)',
  viewId: 'algo-layered-dijkstra-view',
  category: 'graph',
  icon: '🛫',
  badge: {
    mode: '状态升维 (node, usedK) · 跨层 0 权免费边',
    complexity: 'O((k + 1)E log((k + 1)V)) · O(kV)',
  },
  card1Title: '🛫 飞行路线分层拓扑沙盘 (双层状态空间)',
  card2Title: '📊 分层状态监视器 (dist[node][usedK] & 堆波前)',
  card2Desc: '展示同层常规买票转移与跨层 0 权免票跃迁双决策推进，以及到达终点城市的最低总花费',
  legend: [
    { label: '🔵 第 0 层原价机票', color: '#0369a1' },
    { label: '🌸 第 1 层免票优惠', color: '#db2777' },
    { label: '⚡ 当前出堆考察状态', color: '#f59e0b' },
    { label: '🟢 最优分层最短路', state: 'discovered' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设飞行网络',
      type: 'select',
      defaultValue: 'p4568_standard',
      options: [
        { label: '洛谷 P4568 经典 5 城市 (1 次免票)', value: 'p4568_standard' },
        { label: '3 城市入门双层图 (1 次免票)', value: 'simple_3node' },
      ],
    },
  ],
  presets: [
    { label: '5 城市经典 (P4568)', values: { 'input-preset': 'p4568_standard' } },
    { label: '3 城市简易', values: { 'input-preset': 'simple_3node' } },
  ],
  metrics: [
    { id: 'metric-layer-state', label: '当前出堆状态', color: '#f59e0b' },
    { id: 'metric-layer-dist', label: '当前花费金额', color: '#10b981' },
    { id: 'metric-layer-pq', label: '堆内候选状态', color: '#38bdf8' },
    { id: 'metric-layer-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: LAYERED_DIJKSTRA_CODE_LANGUAGES,
  problemHtml: LAYERED_DIJKSTRA_PROBLEM_HTML,
  analysisHtml: LAYERED_DIJKSTRA_ANALYSIS_HTML,
  hasDeductionTree: true,
  aliases: [
    'layered-dijkstra-064',
    'luogu-p4568',
    'flight-routes',
    'class064-code04',
    'class064-layered-dijkstra',
  ],
  buildSteps: (inputs) => buildLayeredDijkstraSteps(String(inputs?.['input-preset'] || 'p4568_standard')),
  renderCanvas: (container, step) => LayeredDijkstraCanvasAdapter.render(container, step),
  renderCustomMetrics: (container, step) => {
    const config = Object.keys(step.distGrid).length > 4 ? LAYERED_PRESETS.p4568_standard : LAYERED_PRESETS.simple_3node;
    const { n, k } = config;
    let layersHtml = '';
    for (let layer = 0; layer <= k; layer++) {
      const cells = Array.from({ length: n }, (_, u) => {
        const d = step.distGrid[`${u},${layer}`];
        const isCur = step.curNode === u && step.curK === layer;
        const bg = isCur ? '#fef3c7' : d !== undefined ? '#ecfdf5' : '#ffffff';
        const border = isCur ? '2px solid #f59e0b' : d !== undefined ? '1px solid #10b981' : '1px solid #cbd5e1';
        return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:38px;height:30px;background:${bg};border:${border};border-radius:4px;font-family:monospace;font-size:11px;font-weight:700;"><span style="font-size:8px;color:#64748b;line-height:1;">N${u}</span><span style="line-height:1.1;color:${d !== undefined ? '#065f46' : '#94a3b8'};">${d !== undefined ? `${d}元` : '∞'}</span></div>`;
      }).join('');
      layersHtml += `<div style="display:flex;align-items:center;gap:6px;"><span style="font-family:monospace;font-size:10.5px;font-weight:700;width:120px;color:${layer === 0 ? '#0369a1' : '#db2777'};">Layer ${layer} (${layer === 0 ? '原价' : '免票'}):</span><div style="display:flex;gap:4px;">${cells}</div></div>`;
    }
    const pqStr = step.pqList.length > 0 ? step.pqList.slice(0, 4).map((x) => `(N${x.u},L${x.used}:${x.cost}元)`).join(' ➔ ') : '空';
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:8px;font-size:11px;color:#374151;padding:4px 8px;box-sizing:border-box;">
        <div style="display:flex;flex-direction:column;gap:6px;background:#f8fafc;padding:10px;border-radius:6px;border:1px solid #e2e8f0;">
          ${layersHtml}
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;border-top:1px dashed #cbd5e1;padding-top:4px;">
            <span style="color:#a855f7;font-size:10.5px;font-weight:700;">分层波前优先队列:</span>
            <strong style="color:#a855f7;font-family:monospace;font-size:10.5px;">[ ${pqStr} ]</strong>
          </div>
        </div>
      </div>
    `;
  },
});

registerAlgorithm({
  id: 'layered-dijkstra',
  name: '分层图最短路 (Layered Dijkstra)',
  viewId: 'algo-layered-dijkstra-view',
  category: 'graph',
  description: '左程云 Class 064 核心进阶：洛谷 P4568 飞行路线，状态升维 (node, usedK) 建图、同层购票与跨层 0 权免单跃迁',
  icon: '🛫',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 24,
  learningGoal: '深刻掌握分层图最短路思想、K 维度扩维建图与免单/折扣边状态转移',
  aliases: [
    'layered-dijkstra-064',
    'luogu-p4568',
    'flight-routes',
    'class064-code04',
    'class064-layered-dijkstra',
  ],
});

export { Visualizer as LayeredDijkstraVisualizer };
