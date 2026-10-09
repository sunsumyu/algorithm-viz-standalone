/**
 * 左程云算法通关课 Class 064: 电动车游历城市最小费用 (Electric Vehicle Charging · LeetCode LCP 35)
 * 领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_064_PROBLEMS } from './graph-064-problem-content';
import { EV_CHARGE_064_CODES } from './graph-064-stage-codes';
import { renderGraph064PriorityQueue } from './graph-064-shared';
import {
  EVStep,
  buildEVCharge064Steps,
} from './ev-charge-dijkstra-064-step-compiler';

export type { EVStep };
export { buildEVCharge064Steps };

export const evChargeDijkstra064Visualizer = registerDeclarativeAlgorithm<EVStep>({
  id: 'ev-charge-dijkstra-064',
  aliases: ['ev-charge-dijkstra', 'class064-code05', 'leetcode-lcp-35'],
  name: '电动车游历城市与充放电最优规划 (Class 064)',
  category: 'graph',
  icon: '🔋',
  difficulty: 3,
  levelOrder: 6405,
  learningGoal: '掌握状态扩维 (city, power) 建模、原地充电与道路放电权衡的最短路求解',
  problemHtml: GRAPH_064_PROBLEMS.evChargeDijkstra064.html,
  codeLanguages: EV_CHARGE_064_CODES,
  hasDeductionTree: true,
  inputs: [
    {
      id: 'preset',
      label: '游历用例选择',
      type: 'select',
      defaultValue: 'lcp35_3cities',
      options: [
        { label: '3 城市标准充电网 (最优用时=10)', value: 'lcp35_3cities' },
        { label: '3 城市捷径低费权衡 (最优用时=11)', value: 'lcp35_shortcut' },
      ],
    },
  ],
  presets: [
    { label: '3 城市标准图 (LeetCode LCP 35)', values: { preset: 'lcp35_3cities' } },
    { label: '捷径电价权衡用例', values: { preset: 'lcp35_shortcut' } },
  ],
  generateSteps: (inputs) => buildEVCharge064Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    let rowsHtml = '';
    for (let c = 0; c < step.n; c++) {
      const powerCards = [];
      for (let p = 0; p <= step.cnt; p++) {
        const d = step.distGrid[c][p];
        const isCur = step.curCity === c && step.curPower === p;
        const bg = isCur ? '#fef3c7' : d !== Infinity ? '#ecfdf5' : '#ffffff';
        const border = isCur ? '2px solid #f59e0b' : d !== Infinity ? '1px solid #10b981' : '1px solid #cbd5e1';
        powerCards.push(`
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 52px; padding: 4px; background: ${bg}; border: ${border}; border-radius: 6px;">
            <span style="font-size: 9px; color: #64748b;">${p}格电</span>
            <span style="font-size: 11px; font-weight: 800; color: #6366f1; font-family: monospace;">${d === Infinity ? '∞' : `${d}s`}</span>
          </div>
        `);
      }
      rowsHtml += `
        <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
          <span style="font-size: 11px; font-weight: 700; width: 60px; color: #1e293b;">城市 ${c}:</span>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">${powerCards.join('')}</div>
        </div>
      `;
    }

    const pqItems = step.pqSnapshot.map((x) => ({
      label: `城市${x.city}(${x.power}格)`,
      priority: `${x.time}s`,
      highlight: step.curCity === x.city && step.curPower === x.power,
    }));

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; gap: 10px;">
        <div style="display: flex; flex-direction: column; gap: 6px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; max-width: 520px; box-sizing: border-box;">
          <span style="font-size: 11px; font-weight: 700; color: #475569;">城市-电量状态矩阵 dist[city][power]:</span>
          ${rowsHtml}
        </div>
        <div style="width: 100%; max-width: 520px;">
          ${renderGraph064PriorityQueue(pqItems, '小根堆波前 (按最短时间排序)')}
        </div>
      </div>
    `;
  },
});
