/**
 * 左程云算法通关课 Class 064: 飞行路线与分层图最短路 (Flight Routes · 洛谷 P4568)
 * 领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_064_PROBLEMS } from './graph-064-problem-content';
import { LAYERED_DIJKSTRA_064_CODES } from './graph-064-stage-codes';
import { renderGraph064PriorityQueue } from './graph-064-shared';
import {
  LayeredStep,
  buildLayeredDijkstra064Steps,
} from './layered-dijkstra-064-step-compiler';

export type { LayeredStep };
export { buildLayeredDijkstra064Steps };

export const layeredDijkstra064Visualizer = registerDeclarativeAlgorithm<LayeredStep>({
  id: 'layered-dijkstra-064',
  aliases: ['layered-dijkstra', 'class064-code04', 'luogu-p4568', 'flight-routes'],
  name: '飞行路线与分层图最短路 (Class 064)',
  category: 'graph',
  icon: '✈️',
  difficulty: 3,
  levelOrder: 6404,
  learningGoal: '掌握分层图扩维思想、同层常规转移与跨层 0 权转移双决策建模',
  problemHtml: GRAPH_064_PROBLEMS.layeredDijkstra064.html,
  codeLanguages: LAYERED_DIJKSTRA_064_CODES,
  hasDeductionTree: true,
  inputs: [
    {
      id: 'preset',
      label: '航线用例选择',
      type: 'select',
      defaultValue: 'p4568_standard',
      options: [
        { label: '5 城市标准分层图 (1 次免票, 最优花费=4)', value: 'p4568_standard' },
        { label: '3 城市入门双层图 (1 次免票, 免票直达花费=0)', value: 'simple_3node' },
      ],
    },
  ],
  presets: [
    { label: '洛谷 P4568 标准 5 城市', values: { preset: 'p4568_standard' } },
    { label: '3 城市入门双层图', values: { preset: 'simple_3node' } },
  ],
  generateSteps: (inputs) => buildLayeredDijkstra064Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    let layerHtml = '';
    for (let layer = 0; layer <= step.k; layer++) {
      const cityCards = [];
      for (let u = 0; u < step.n; u++) {
        const d = step.distTable[u][layer];
        const isCur = step.curNode === u && step.curUsed === layer;
        const bg = isCur ? '#fef3c7' : d !== Infinity ? '#ecfdf5' : '#ffffff';
        const border = isCur ? '2px solid #f59e0b' : d !== Infinity ? '1px solid #10b981' : '1px solid #cbd5e1';
        cityCards.push(`
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 60px; padding: 6px; background: ${bg}; border: ${border}; border-radius: 6px;">
            <span style="font-size: 11px; font-weight: 700; color: #1e293b;">城市 ${u}</span>
            <span style="font-size: 12px; font-weight: 800; color: #6366f1; font-family: monospace;">${d === Infinity ? '∞' : d}</span>
          </div>
        `);
      }

      layerHtml += `
        <div style="display: flex; flex-direction: column; gap: 4px; padding: 8px 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; box-sizing: border-box;">
          <span style="font-size: 11px; font-weight: 700; color: #475569;">Layer ${layer} (${layer === 0 ? '全额购票层' : `已用 ${layer} 张免票`}):</span>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">${cityCards.join('')}</div>
        </div>
      `;
    }

    const pqItems = step.pqSnapshot.map((x) => ({
      label: `城市${x.u}(L${x.used})`,
      priority: `${x.d}元`,
      highlight: step.curNode === x.u && step.curUsed === x.used,
    }));

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; gap: 10px;">
        <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 540px;">
          ${layerHtml}
        </div>
        <div style="width: 100%; max-width: 540px;">
          ${renderGraph064PriorityQueue(pqItems, '分层小根堆波前')}
        </div>
      </div>
    `;
  },
});
