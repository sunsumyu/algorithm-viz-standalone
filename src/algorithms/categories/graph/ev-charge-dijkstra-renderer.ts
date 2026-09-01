/**
 * 电动车充放电最短路 (Electric Vehicle Charging - LeetCode LCP 35 / 左程云 Class 064 题目4) 声明式可视化器
 * 核心：二维状态 (city, power) 分层图最短路、Dijkstra 堆优化
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  EV_CHARGE_CODE_LANGUAGES,
  EV_CHARGE_PROBLEM_HTML,
  EV_CHARGE_ANALYSIS_HTML,
} from './ev-charge-dijkstra-problem-content';

export interface EVStep {
  curCity: number;
  curPower: number;
  cost: number;
  distGrid: Record<string, number>;
  status: 'start' | 'charge' | 'move' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildEVChargeSteps(): EVStep[] {
  const steps: EVStep[] = [];

  steps.push({
    curCity: 0,
    curPower: 0,
    cost: 0,
    distGrid: { '0,0': 0 },
    status: 'start',
    message: '1. [起点初始状态] 位于城市 0，电量 power = 0，耗时 0，压入分层图优先队列！',
    log: '起点入堆：state(city:0, power:0, cost:0)',
    codeLine: [18, 22],
  });

  steps.push({
    curCity: 0,
    curPower: 2,
    cost: 4,
    distGrid: { '0,0': 0, '0,2': 4 },
    status: 'charge',
    message: '2. [原地充电 2 单位] 城市 0 充电单价为 2，充电 2 单位耗时 +4，状态转移至 (city:0, power:2)！',
    log: '原地充电：(0, 0) ➔ (0, 2), cost = 4',
    codeLine: [26, 32],
  });

  steps.push({
    curCity: 1,
    curPower: 0,
    cost: 7,
    distGrid: { '0,0': 0, '0,2': 4, '1,0': 7 },
    status: 'move',
    message: '3. [沿公路行驶] 从城市 0 行驶至城市 1，道路耗电 2、耗时 3，到达状态 (city:1, power:0, cost:7)！',
    log: '行驶至城市 1：耗电 2, 耗时 +3 -> cost=7',
    codeLine: [34, 42],
  });

  steps.push({
    curCity: 1,
    curPower: 1,
    cost: 8,
    distGrid: { '0,0': 0, '0,2': 4, '1,0': 7, '1,1': 8 },
    status: 'charge',
    message: '4. [便宜城市 1 充点电] 城市 1 充电仅需 1/单位，充 1 单位电量，cost = 8！',
    log: '廉价充电：(1, 0) ➔ (1, 1), cost = 8',
    codeLine: [26, 32],
  });

  steps.push({
    curCity: 2,
    curPower: 0,
    cost: 10,
    distGrid: { '0,0': 0, '0,2': 4, '1,0': 7, '1,1': 8, '2,0': 10 },
    status: 'done',
    message: '🎉 [到达终点城市 2] 消耗 1 单位电量行驶至终点，全网最优最少总耗时 = 10！',
    log: '✓ 到达终点城市 2：最优分层图最短路 = 10',
    codeLine: [45, 50],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<EVStep>({
  id: 'ev-charge-dijkstra',
  name: '电动车充放电最短路 (EV Charge)',
  category: 'graph',
  icon: '⚡',
  badge: {
    mode: '二维分层图 (city, power)',
    complexity: 'O((V · C + E · C) log(V · C)) · O(V · C)',
  },
  card1Title: '⚡ 城市拓扑与 (城市, 电量) 分层沙盘',
  card2Title: '🧭 电池电量与状态距离监视器',
  card2Desc: '当前城市、剩余电量、原地充电与道路行驶两类状态转移',
  legend: [
    { label: '城市节点 (0..2)', color: '#0284c7' },
    { label: '⚡ 充电状态', color: '#f59e0b' },
    { label: '🟢 到达终点状态', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '3 城市充放电经典用例 (LCP 35)', values: {} },
  ],
  metrics: [
    { id: 'metric-cur-city', label: '当前城市', color: '#2563eb' },
    { id: 'metric-cur-power', label: '剩余电量', color: '#f59e0b' },
    { id: 'metric-cur-cost', label: '累计最少耗时', color: '#10b981' },
  ],
  codeLanguages: EV_CHARGE_CODE_LANGUAGES,
  problemHtml: EV_CHARGE_PROBLEM_HTML,
  analysisHtml: EV_CHARGE_ANALYSIS_HTML,
  buildSteps: () => buildEVChargeSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number; price: number }> = {
      0: { x: 75, y: 110, price: 2 },
      1: { x: 155, y: 55, price: 1 },
      2: { x: 235, y: 110, price: 5 },
    };

    const edges = [
      { u: 0, v: 1, cost: 3, power: 2 },
      { u: 1, v: 2, cost: 2, power: 1 },
    ];

    const svgEdges = edges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - 8;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#475569" stroke-width="2" />
            <text x="${midX}" y="${midY}" fill="#94a3b8" font-size="8.5" font-weight="700" font-family="monospace" text-anchor="middle">t:${e.cost}, p:${e.power}</text>
          </g>
        `;
      })
      .join('');

    const nodes = [0, 1, 2];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isCur = step.curCity === u;
        const isTarget = u === 2;
        const bg = isCur ? '#f59e0b' : isTarget ? '#065f46' : '#1e3a8a';
        const border = isCur ? '#facc15' : isTarget ? '#10b981' : '#38bdf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="16" fill="${bg}" stroke="${border}" stroke-width="${isCur ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">C${u}</text>
            <text x="${p.x}" y="${p.y + 28}" fill="#facc15" font-size="8.5" font-weight="700" text-anchor="middle">电价:${p.price}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 200">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          ⚡ 状态定义为 (city, power) 二维分层状态 | 原地充电 cost+price, 道路行驶 cost+t, power-d
        </div>
      </div>
    `;

    const root = container.closest('#algo-ev-charge-dijkstra-view');
    if (root) {
      const cityEl = root.querySelector('#metric-cur-city');
      const powEl = root.querySelector('#metric-cur-power');
      const costEl = root.querySelector('#metric-cur-cost');

      if (cityEl) cityEl.textContent = `City ${step.curCity}`;
      if (powEl) powEl.textContent = `${step.curPower} / 2`;
      if (costEl) costEl.textContent = `${step.cost}`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 二维分层图两类转移:</span>
              <strong style="font-family: monospace; color: #2563eb;">1. 充电: (u, p) ➔ (u, p+1); 2. 行驶: (u, p) ➔ (v, p-d)</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'ev-charge-dijkstra',
  name: '电动车充放电最短路 (EV Charge)',
  viewId: 'algo-ev-charge-dijkstra-view',
  category: 'graph',
  description: '左程云算法通关课 Class 064 题目4：(city, power) 二维分层图、原地充电与公路行驶双转移、Dijkstra 堆优化 (LeetCode LCP 35)',
  icon: '⚡',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 58,
  learningGoal: '掌握二维状态分层图的构建技巧、原地充电与行驶边的拆分以及 Dijkstra 状态去重',
});

export { Visualizer as EVChargeDijkstraVisualizer };
