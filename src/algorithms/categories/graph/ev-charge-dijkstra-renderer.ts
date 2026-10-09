/**
 * 电动车充放电最短路 (Electric Vehicle Charging - LeetCode LCP 35) 领域适配器
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：声明式元数据配置、预设案例定义与委托挂载 (LOC < 130)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  EV_CHARGE_CODE_LANGUAGES,
  EV_CHARGE_PROBLEM_HTML,
  EV_CHARGE_ANALYSIS_HTML,
} from './ev-charge-dijkstra-problem-content';
import {
  type EVStep,
  buildEVChargeSteps,
} from './ev-charge-dijkstra-step-compiler';
import { EVChargeCanvasAdapter } from '../../../core/renderers/adapters/ev-charge-canvas-adapter';

export type { EVStep };
export { buildEVChargeSteps };

const { template, Visualizer } = createDeclarativeVisualizer<EVStep>({
  id: 'ev-charge-dijkstra',
  name: '电动车充放电最短路 (EV Charging Dijkstra)',
  viewId: 'algo-ev-charge-dijkstra-view',
  category: 'graph',
  icon: '🔌',
  badge: {
    mode: '二维分层图 (city, power) + 充放电双决策',
    complexity: 'O((M + N·cnt) log(N·cnt)) · O(N·cnt)',
  },
  card1Title: '🔌 城市路网、充电站单价与拓扑沙盘',
  card2Title: '📊 分层状态监视器 (dist[city][power] & 堆波前)',
  card2Desc: '逐行对齐原地充电 p+1 与公路行驶放电 p-w、分层状态扩维与 Dijkstra 堆优化',
  legend: [
    { label: '🏙️ 城市站点', color: '#1e3a8a' },
    { label: '🔋 原地充电 (单价 charge[u])', state: 'discovered' },
    { label: '🚗 公路行驶 (耗电/耗时 w)', state: 'comparing' },
    { label: '⚡ 当前出堆最优状态', color: '#f59e0b' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设城市网络',
      type: 'select',
      defaultValue: 'lcp35_3cities',
      options: [
        { label: '3 城市标准接力充电路网 (最小花费 10)', value: 'lcp35_3cities' },
        { label: '3 城市快捷直达对比路网 (最小花费 11)', value: 'lcp35_shortcut' },
      ],
    },
  ],
  presets: [
    { label: '标准充电路网', values: { 'input-preset': 'lcp35_3cities' } },
    { label: '快捷对比路网', values: { 'input-preset': 'lcp35_shortcut' } },
  ],
  metrics: [
    { id: 'metric-cur-city', label: '当前所在城市', color: '#38bdf8' },
    { id: 'metric-cur-power', label: '当前所持电量', color: '#10b981' },
    { id: 'metric-cur-cost', label: '累计总耗时间', color: '#f59e0b' },
    { id: 'metric-ev-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: EV_CHARGE_CODE_LANGUAGES,
  problemHtml: EV_CHARGE_PROBLEM_HTML,
  analysisHtml: EV_CHARGE_ANALYSIS_HTML,
  hasDeductionTree: true,
  aliases: [
    'ev-charge-dijkstra-064',
    'class064-code05',
    'leetcode-lcp-35',
  ],
  buildSteps: (inputs) => buildEVChargeSteps(String(inputs?.['input-preset'] || 'lcp35_3cities')),
  renderCanvas: (container, step) => EVChargeCanvasAdapter.render(container, step),
  renderCustomMetrics: (container, step) => {
    const rowsHtml = [0, 1, 2].map((c) => {
      const cells = [0, 1, 2].map((p) => {
        const val = step.distGrid[`${c},${p}`] ?? 999;
        const displayVal = val === 999 ? '∞' : `${val}`;
        const isActive = step.activeSlot && step.activeSlot[0] === c && step.activeSlot[1] === p;
        const bg = isActive ? '#fef08a' : '#1e293b';
        const textCol = isActive ? '#854d0e' : '#e2e8f0';
        const border = isActive ? '2px solid #f59e0b' : '1px solid #cbd5e1';
        return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:32px;height:26px;background:${bg};border:${border};border-radius:4px;color:${textCol};font-family:monospace;font-size:10px;font-weight:700;"><span style="font-size:7px;color:#64748b;line-height:1;">p=${p}</span><span style="line-height:1.1;">${displayVal}</span></div>`;
      }).join('');
      return `<div style="display:flex;align-items:center;gap:8px;"><span style="font-family:monospace;font-size:10.5px;font-weight:700;width:75px;color:#38bdf8;">C${c} (各电量):</span><div style="display:flex;gap:4px;">${cells}</div></div>`;
    }).join('');

    const pqPreview = step.pqList.length > 0
      ? step.pqList.slice(0, 4).map((x) => `<span style="background:#1e293b;border:1px solid #f59e0b;color:#facc15;padding:1px 4px;border-radius:4px;font-size:9px;font-family:monospace;">(C${x.city},p=${x.power}:c=${x.cost})</span>`).join(' ')
      : '空堆';

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:5px;font-size:11px;color:#374151;padding:2px 0;">
        <div style="display:flex;flex-direction:column;gap:3px;background:#f8fafc;padding:6px 8px;border-radius:6px;border:1px solid #e2e8f0;">
          ${rowsHtml}
          <div style="display:flex;align-items:center;gap:8px;margin-top:2px;">
            <span style="font-family:monospace;font-size:10.5px;font-weight:700;width:75px;color:#f59e0b;">小根堆 pq:</span>
            <div style="display:flex;gap:4px;flex-wrap:wrap;">${pqPreview}</div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:3px;border-top:1px dashed #cbd5e1;padding-top:3px;">
            <span style="color:#10b981;font-size:10px;font-weight:700;">到达终点最小耗费:</span>
            <strong style="color:#10b981;font-family:monospace;font-size:11px;">Min Cost: ${step.cost} 单位时间</strong>
          </div>
        </div>
      </div>
    `;
  },
});

registerAlgorithm({
  id: 'ev-charge-dijkstra',
  name: '电动车充放电最短路 (EV Charging Dijkstra)',
  viewId: 'algo-ev-charge-dijkstra-view',
  category: 'graph',
  icon: '🔌',
  template,
  Visualizer,
  description: '经典分层图模型：电量与城市二维扩维、原地充电增加电量、公路行驶减少电量、Dijkstra 堆优化 (LeetCode LCP 35)',
  difficulty: 3,
  levelOrder: 104,
  learningGoal: '掌握二维分层图建模思路、充放电状态转移双决策及多维 Dijkstra 求解技巧',
  aliases: [
    'ev-charge-dijkstra-064',
    'class064-code05',
    'leetcode-lcp-35',
  ],
});

export { Visualizer as EVChargeDijkstraVisualizer };
