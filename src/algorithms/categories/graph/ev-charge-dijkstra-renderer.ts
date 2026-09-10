/**
 * 电动车充放电最短路 (Electric Vehicle Charging - LeetCode LCP 35) 声明式可视化器
 * 核心：二维状态 (city, power) 分层图最短路、原地充电与道路放电双决策、Dijkstra 堆优化
 * 遵循标准 4-Card 声明式沙盘架构，支持逐行指令执行与多状态矩阵 (dist[city][power], pq) 实时监控
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
  pqList: Array<{ city: number; power: number; cost: number }>;
  activeArray?: 'dist' | 'vis' | 'pq';
  activeSlot?: [number, number];
  status: 'init' | 'charge' | 'move' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildEVChargeSteps(preset: string = 'lcp35_3cities'): EVStep[] {
  const steps: EVStep[] = [];
  const isShortcut = preset === 'lcp35_shortcut';

  // 预设配置
  // lcp35_3cities: 3 城市 0..2, cnt=2, charge=[2, 1, 5], paths=[[0,1,2],[1,2,2]]. 最优解: 10
  // lcp35_shortcut: 3 城市 0..2, cnt=2, charge=[3, 2, 5], paths=[[0,1,2],[1,2,1]]. 最优解: 11
  const n = 3;
  const cnt = 2;
  const start = 0;
  const end = 2;
  const charge = isShortcut ? [3, 2, 5] : [2, 1, 5];
  const paths: Array<[number, number, number]> = isShortcut
    ? [
        [0, 1, 2],
        [1, 2, 1],
      ]
    : [
        [0, 1, 2],
        [1, 2, 2],
      ];

  const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n }, () => []);
  for (const [u, v, w] of paths) {
    adj[u].push({ to: v, w });
    adj[v].push({ to: u, w });
  }

  const dist: number[][] = Array.from({ length: n }, () =>
    new Array(cnt + 1).fill(Infinity)
  );
  const vis: boolean[][] = Array.from({ length: n }, () =>
    new Array(cnt + 1).fill(false)
  );

  const pq: Array<{ city: number; power: number; cost: number }> = [];

  function pushPq(city: number, power: number, cost: number): void {
    pq.push({ city, power, cost });
    pq.sort((a, b) => a.cost - b.cost);
  }

  function pollPq(): { city: number; power: number; cost: number } {
    return pq.shift()!;
  }

  let curCity = start;
  let curPower = 0;
  let curCost = 0;

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'init' | 'charge' | 'move' | 'done',
    activeArray?: 'dist' | 'vis' | 'pq',
    activeSlot?: [number, number]
  ): void {
    const dGrid: Record<string, number> = {};
    for (let c = 0; c < n; c++) {
      for (let p = 0; p <= cnt; p++) {
        dGrid[`${c},${p}`] = dist[c][p] === Infinity ? 999 : dist[c][p];
      }
    }

    const cityStr = `城市 C${curCity}`;
    const powerStr = `${curPower} / ${cnt} 格电`;
    const costStr = `${curCost} 单位时间`;

    const phaseStr =
      status === 'done'
        ? '抵达目的地'
        : status === 'charge'
          ? '原地充电'
          : status === 'move'
            ? '道路放电行驶'
            : '分层图初始化';

    steps.push({
      curCity,
      curPower,
      cost: curCost,
      distGrid: dGrid,
      pqList: pq.map((x) => ({ ...x })),
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-cur-city': cityStr,
        'metric-cur-power': powerStr,
        'metric-cur-cost': costStr,
        'metric-ev-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化 ====================
  // 行 14: electricCarPlan
  makeStep(14, `🚀 [算法初始化] 建立包含 ${n} 个城市、最大电量 ${cnt} 的二维状态分层图 (city, power)。`, 'electricCarPlan 入口', 'init');

  // 行 16: 构建双向邻接表
  makeStep(16, '📦 [构建城市道路网] 存储各城市间双向公路及耗电里程。', '邻接表构建完毕', 'init');

  // 行 23: 初始化 dist 矩阵
  for (let c = 0; c < n; c++) {
    for (let p = 0; p <= cnt; p++) {
      dist[c][p] = Infinity;
      makeStep(24, `🧹 [距离表初始化] dist[C${c}][电量${p}] 置为 INF。`, `dist[${c}][${p}]=INF`, 'init', 'dist', [c, p]);
    }
  }

  // 行 28: 源点 (start, 0) 入堆
  dist[start][0] = 0;
  pushPq(start, 0, 0);
  curCity = start;
  curPower = 0;
  curCost = 0;
  makeStep(28, `🔌 [起点零电就绪] 起点城市 C${start} 初始电量 0，花费 0，压入小根堆 pq。`, `起点 (C${start}, p=0) 入堆`, 'init', 'dist', [start, 0]);

  // ==================== 2. 二维分层图 Dijkstra 循环 ====================
  while (pq.length > 0) {
    // 行 32: Node cur = pq.poll();
    const top = pollPq();
    curCity = top.city;
    curPower = top.power;
    curCost = top.cost;

    // 行 34: if (vis[u][p]) continue;
    if (vis[curCity][curPower]) {
      makeStep(34, `⚪ [已锁定状态跳过] 状态 (C${curCity}, 电量${curPower}) 最优耗时已确立，跳过。`, `跳过已访 (C${curCity}, p=${curPower})`, 'move');
      continue;
    }
    vis[curCity][curPower] = true;
    makeStep(34, `👑 [弹出当前最小花费状态] 弹出状态 (C${curCity}, 电量${curPower}, 耗费=${curCost})！`, `poll (C${curCity}, p=${curPower}, cost=${curCost})`, 'move', 'vis', [curCity, curPower]);

    // 行 36: 到达终点判定
    if (curCity === end) {
      makeStep(36, `🏁 [抵达目的城市] 成功抵达终点城市 C${end}！当前最小总耗时为 ${curCost}！`, '到达终点', 'done');
      break;
    }

    // 决策 1: 行 38 原地充 1 格电
    if (curPower < cnt) {
      const nextPower = curPower + 1;
      const nextCost = curCost + charge[curCity];
      if (!vis[curCity][nextPower] && nextCost < dist[curCity][nextPower]) {
        dist[curCity][nextPower] = nextCost;
        pushPq(curCity, nextPower, nextCost);
        makeStep(38, `🔋 [决策 1: 原地充电] 在城市 C${curCity} 充 1 格电 (单价 ${charge[curCity]})：耗时增至 ${nextCost}，电量增至 ${nextPower}，压入小根堆！`, `充电 (C${curCity}, p=${nextPower})`, 'charge', 'dist', [curCity, nextPower]);
      }
    }

    // 决策 2: 行 44 沿公路行驶放电
    for (const edge of adj[curCity]) {
      const v = edge.to;
      const w = edge.w;
      if (curPower >= w) {
        const nextPower = curPower - w;
        const nextCost = curCost + w;
        if (!vis[v][nextPower] && nextCost < dist[v][nextPower]) {
          dist[v][nextPower] = nextCost;
          pushPq(v, nextPower, nextCost);
          makeStep(44, `🚗 [决策 2: 道路行驶] 沿公路开往城市 C${v} (耗时/电量 ${w})：到达新状态 (C${v}, 电量${nextPower}, 耗费=${nextCost})，压入小根堆！`, `行驶 (C${v}, p=${nextPower})`, 'move', 'dist', [v, nextPower]);
        }
      }
    }
  }

  // 终态
  makeStep(48, `🎉 [电动车最优方案求解完成] 抵达目的城市 C${end} 的全局最优总耗时为 ${curCost}！分层图通过将电量离散扩维，完美将充电决策融入单源最短路！`, '算法结束', 'done');

  return steps;
}

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
  card1Title: '🔌 城市路网、充电站单价与分层图沙盘',
  card2Title: '📊 分层状态监视器 (dist[city][power], pq, 充放电)',
  card2Desc: '逐行对齐原地充电 p+1 与公路行驶放电 p-w、分层状态扩维与 Dijkstra 堆优化',
  legend: [
    { label: '🏙️ 城市站点', color: '#1e3a8a' },
    { label: '🔋 原地充电 (单价 charge[u])', color: '#10b981' },
    { label: '🚗 公路行驶 (耗电/耗时 w)', color: '#38bdf8' },
    { label: '👑 当前出堆最优状态', color: '#f59e0b' },
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
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'lcp35_3cities') as string;
    return buildEVChargeSteps(preset);
  },
  renderCanvas: (container, step) => {
    const n = 3;
    const nodeCoords: Record<number, { x: number; y: number }> = {
      0: { x: 55, y: 105 },
      1: { x: 155, y: 55 },
      2: { x: 255, y: 105 },
    };

    const edges = [
      { u: 0, v: 1, w: 1 },
      { u: 1, v: 2, w: 1 },
      { u: 0, v: 2, w: 2 },
    ];

    const svgEdges = edges
      .map(({ u, v, w }) => {
        const p1 = nodeCoords[u];
        const p2 = nodeCoords[v];
        if (!p1 || !p2) return '';
        const inActive =
          (step.curCity === u || step.curCity === v) && step.status === 'move';

        const color = inActive ? '#facc15' : '#475569';
        const width = inActive ? 3 : 1.5;

        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2 - 4;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />
            <text x="${mx}" y="${my}" fill="${color}" font-size="8.5" font-family="monospace" font-weight="700" text-anchor="middle">w:${w}</text>
          </g>
        `;
      })
      .join('');

    const nodes = [0, 1, 2];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        const isCur = step.curCity === u;
        const bg = isCur ? '#b45309' : '#1e3a8a';
        const border = isCur ? '#facc15' : '#64748b';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="17" fill="${bg}" stroke="${border}" stroke-width="${isCur ? 3 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">C${u}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="${isCur ? '#facc15' : '#94a3b8'}" font-size="8" font-weight="700" text-anchor="middle">${isCur ? `⚡${step.curPower}` : ''}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #f8fafc; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 205px;" viewBox="0 0 310 200">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10px; color: #64748b; text-align: center;">
          金色为当前电动车所在城市与所持电量 | 分层状态 (city, power) 映射至二维最短路
        </div>
      </div>
    `;

    const rootEl =
      container.closest('#algo-ev-charge-dijkstra-view') ||
      container.parentElement ||
      container.ownerDocument;
    if (rootEl) {
      for (const [id, val] of Object.entries(step.metrics ?? {})) {
        const el = rootEl.querySelector(`#${id}`);
        if (el) el.textContent = String(val);
      }

      // 多数组监视器
      const customMetricsContainer = rootEl.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const rowsHtml = [0, 1, 2].map((c) => {
          const cells = [0, 1, 2].map((p) => {
            const val = step.distGrid[`${c},${p}`] ?? 999;
            const displayVal = val === 999 ? '∞' : `${val}`;
            const isActive =
              step.activeSlot && step.activeSlot[0] === c && step.activeSlot[1] === p;
            const bg = isActive ? '#fef08a' : '#1e293b';
            const textCol = isActive ? '#854d0e' : '#e2e8f0';
            const border = isActive ? '2px solid #f59e0b' : '1px solid #cbd5e1';

            return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 32px; height: 26px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 10px; font-weight: 700;">
              <span style="font-size: 7px; color: #64748b; line-height: 1;">p=${p}</span>
              <span style="line-height: 1.1;">${displayVal}</span>
            </div>`;
          }).join('');

          return `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-family: monospace; font-size: 10.5px; font-weight: 700; width: 75px; color: #38bdf8;">C${c} (各电量):</span>
              <div style="display: flex; gap: 4px;">${cells}</div>
            </div>
          `;
        }).join('');

        const pqPreview =
          step.pqList.length > 0
            ? step.pqList
                .slice(0, 4)
                .map((x) => `<span style="background: #1e293b; border: 1px solid #f59e0b; color: #facc15; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-family: monospace;">(C${x.city},p=${x.power}:c=${x.cost})</span>`)
                .join(' ')
            : '空堆';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 5px; font-size: 11px; color: #374151; padding: 2px 0;">
            <div style="display: flex; flex-direction: column; gap: 3px; background: #f8fafc; padding: 6px 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
              ${rowsHtml}
              <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px;">
                <span style="font-family: monospace; font-size: 10.5px; font-weight: 700; width: 75px; color: #f59e0b;">小根堆 pq:</span>
                <div style="display: flex; gap: 4px; flex-wrap: wrap;">${pqPreview}</div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 3px; border-top: 1px dashed #cbd5e1; padding-top: 3px;">
                <span style="color: #10b981; font-size: 10px; font-weight: 700;">到达终点最小耗费:</span>
                <strong style="color: #10b981; font-family: monospace; font-size: 11px;">Min Cost: ${step.cost} 单位时间</strong>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #64748b; font-size: 10.5px;">执行语句:</span>
              <strong style="color: #38bdf8; font-family: monospace; font-size: 11px;">行 ${Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine}: ${step.log}</strong>
            </div>
          </div>
        `;
      }
    }
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
});

export { Visualizer as EVChargeDijkstraVisualizer };
