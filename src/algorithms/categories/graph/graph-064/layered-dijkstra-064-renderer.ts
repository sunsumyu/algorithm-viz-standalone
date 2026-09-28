import { snapshotGrid2D } from '../../../../core/strategies/grid-snapshot';
/**
 * 左程云算法通关课 Class 064: 飞行路线与分层图最短路 (Flight Routes · 洛谷 P4568)
 * 二维状态 (u, usedK) 分层图建模、同层买票松弛、跨层 0 权跳跃与 Dijkstra 堆优化
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth & Bi-Version Synthesis):
 * 深度综合整合：
 * 1. 经典版本的分层图拓扑坐标、多预设选择 (p4568_standard, simple_3node)；
 * 2. 声明式规范、名师讲义与四语言 1-based 精准行号联动。
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_064_PROBLEMS } from './graph-064-problem-content';
import {
  LAYERED_DIJKSTRA_064_CODES,
  LAYERED_DIJKSTRA_064_LINES,
} from './graph-064-stage-codes';
import {
  Graph064StepBase,
  renderGraph064PriorityQueue,
} from './graph-064-shared';

export interface LayeredStep extends Graph064StepBase {
  n: number;
  k: number;
  s: number;
  t: number;
  curNode: number | null;
  curUsed: number | null;
  distTable: number[][]; // dist[u][used]
  pqSnapshot: Array<{ u: number; used: number; d: number }>;
  bestCostSoFar: number;
}

export function buildLayeredDijkstra064Steps(preset: string = 'p4568_standard'): LayeredStep[] {
  const steps: LayeredStep[] = [];
  const lines = LAYERED_DIJKSTRA_064_LINES;

  let n = 5;
  let k = 1;
  let s = 0;
  let t = 4;
  let edges: Array<{ u: number; v: number; w: number }> = [];

  if (preset === 'simple_3node') {
    n = 3;
    k = 1;
    s = 0;
    t = 2;
    edges = [
      { u: 0, v: 1, w: 5 },
      { u: 1, v: 2, w: 2 },
      { u: 0, v: 2, w: 9 },
    ];
  } else {
    // p4568_standard (洛谷 P4568 经典)
    n = 5;
    k = 1;
    s = 0;
    t = 4;
    edges = [
      { u: 0, v: 1, w: 2 },
      { u: 0, v: 2, w: 5 },
      { u: 1, v: 2, w: 2 },
      { u: 1, v: 3, w: 4 },
      { u: 2, v: 3, w: 1 },
      { u: 2, v: 4, w: 7 },
      { u: 3, v: 4, w: 3 },
    ];
  }

  const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n }, () => []);
  for (const e of edges) {
    adj[e.u].push({ to: e.v, w: e.w });
    adj[e.v].push({ to: e.u, w: e.w });
  }

  const dist: number[][] = Array.from({ length: n }, () => new Array(k + 1).fill(Infinity));
  dist[s][0] = 0;

  const pq: Array<{ u: number; used: number; d: number }> = [{ u: s, used: 0, d: 0 }];

  steps.push({
    n,
    k,
    s,
    t,
    curNode: null,
    curUsed: null,
    distTable: snapshotGrid2D(dist),
    pqSnapshot: [...pq],
    bestCostSoFar: Infinity,
    decision: `1. 初始化分层图二维距离矩阵 dist[${n}][${k + 1}]：起点 (城市 ${s}, 已用免票 0) 初始距离置为 0`,
    message: `将图扩维为 ${k + 1} 层，Layer 0 代表原图自费，Layer 1 代表消耗 1 次免费机票。`,
    log: `Init dist[${s}][0]=0`,
    codeLine: lines.init,
    metrics: { '城市数': n, '免费票数': k, '起点': `城市 ${s}`, '终点': `城市 ${t}` },
    statusBadge: { text: `起点就绪: 城市${s}`, type: 'info' },
  });

  while (pq.length > 0) {
    pq.sort((a, b) => a.d - b.d);
    const { u, used, d } = pq.shift()!;

    if (d > dist[u][used]) continue;

    steps.push({
      n,
      k,
      s,
      t,
      curNode: u,
      curUsed: used,
      distTable: snapshotGrid2D(dist),
      pqSnapshot: [...pq],
      bestCostSoFar: dist[t][used] === Infinity ? Infinity : dist[t][used],
      decision: `堆顶弹出最优状态 (城市 ${u}, 已用机票 ${used} 次) [总费用 = ${d}]，进行双决策分层扩展`,
      message: `考虑：1. 同层正常购票飞往邻居；2. 跨层消耗 1 张免票免费跃迁。`,
      log: `Poll state (u=${u}, used=${used}) d=${d}`,
      codeLine: lines.pollNode,
      metrics: { '当前城市': `城市 ${u}`, '已用免票': `${used}/${k}`, '当前累计费用': d },
      statusBadge: { text: `探查: 城市${u} (票${used})`, type: 'info' },
    });

    if (u === t) {
      steps.push({
        n,
        k,
        s,
        t,
        curNode: u,
        curUsed: used,
        distTable: snapshotGrid2D(dist),
        pqSnapshot: [...pq],
        bestCostSoFar: d,
        decision: `到达目的地城市 ${t}！当前最短费用即为全局最优答案 ${d}`,
        message: `首次从堆顶弹出的终点状态即为全局最短路。`,
        log: `Target reached with cost ${d}`,
        codeLine: lines.hitTarget,
        metrics: { '最终费用': d, '使用机票数': used },
        statusBadge: { text: `达成终点: 花费=${d}`, type: 'success' },
      });
      break;
    }

    for (const edge of adj[u]) {
      const v = edge.to;
      const w = edge.w;

      // 决策 1：同层买票
      if (dist[u][used] + w < dist[v][used]) {
        dist[v][used] = dist[u][used] + w;
        pq.push({ u: v, used, d: dist[v][used] });

        steps.push({
          n,
          k,
          s,
          t,
          curNode: u,
          curUsed: used,
          distTable: snapshotGrid2D(dist),
          pqSnapshot: [...pq],
          bestCostSoFar: dist[t][used] === Infinity ? Infinity : dist[t][used],
          decision: `[同层买票] 飞往城市 ${v}：花费票价 ${w}，更新 dist[${v}][${used}] = ${dist[v][used]}`,
          message: `未消耗免票机会，保持在 Layer ${used}。`,
          log: `Same-layer relax (${u}->${v}, w=${w}) -> dist[${v}][${used}]=${dist[v][used]}`,
          codeLine: lines.sameLayerRelax,
          metrics: { '决策': '正常购票', '下一城市': `城市 ${v}`, '费用': dist[v][used] },
          statusBadge: { text: `买票: 城市${v}`, type: 'info' },
        });
      }

      // 决策 2：跨层免费
      if (used < k && dist[u][used] < dist[v][used + 1]) {
        dist[v][used + 1] = dist[u][used];
        pq.push({ u: v, used: used + 1, d: dist[v][used + 1] });

        steps.push({
          n,
          k,
          s,
          t,
          curNode: u,
          curUsed: used,
          distTable: snapshotGrid2D(dist),
          pqSnapshot: [...pq],
          bestCostSoFar: dist[t][used + 1] === Infinity ? Infinity : dist[t][used + 1],
          decision: `[跨层免票] 使用 1 张免费机票飞往城市 ${v}：费用 +0，更新 Layer ${used + 1} 的 dist[${v}][${used + 1}] = ${dist[v][used + 1]}`,
          message: `成功消耗 1 次免费权利，状态跃迁至下一层图。`,
          log: `Free-layer relax (${u}->${v}, free) -> dist[${v}][${used+1}]=${dist[v][used+1]}`,
          codeLine: lines.freeLayerRelax,
          metrics: { '决策': '🎟️ 免费跃迁', '下一城市': `城市 ${v}`, '剩余免票': k - (used + 1) },
          statusBadge: { text: `免票: 城市${v}`, type: 'success' },
        });
      }
    }
  }

  return steps;
}

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
