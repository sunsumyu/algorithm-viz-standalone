import { snapshotGrid2D } from '../../../../core/strategies/grid-snapshot';
/**
 * 左程云算法通关课 Class 064: 电动车游历城市最小费用 (Electric Vehicle Charging · LeetCode LCP 35)
 * 状态空间扩维 (city, power)、原地充电与道路放电双决策与 Dijkstra 堆优化
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth & Bi-Version Synthesis):
 * 深度综合整合：
 * 1. 经典版本的城市电量矩阵、多用例预设 (lcp35_3cities, lcp35_shortcut)；
 * 2. 声明式规范、名师讲义与四语言 1-based 精准行号联动。
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_064_PROBLEMS } from './graph-064-problem-content';
import {
  EV_CHARGE_064_CODES,
  EV_CHARGE_064_LINES,
} from './graph-064-stage-codes';
import {
  Graph064StepBase,
  renderGraph064PriorityQueue,
} from './graph-064-shared';

export interface EVStep extends Graph064StepBase {
  n: number;
  cnt: number;
  curCity: number | null;
  curPower: number | null;
  curTime: number | null;
  distGrid: number[][]; // dist[city][power]
  pqSnapshot: Array<{ city: number; power: number; time: number }>;
}

export function buildEVCharge064Steps(preset: string = 'lcp35_3cities'): EVStep[] {
  const steps: EVStep[] = [];
  const lines = EV_CHARGE_064_LINES;

  const isShortcut = preset === 'lcp35_shortcut';
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

  const dist: number[][] = Array.from({ length: n }, () => new Array(cnt + 1).fill(Infinity));
  dist[start][0] = 0;

  const pq: Array<{ city: number; power: number; time: number }> = [{ city: start, power: 0, time: 0 }];

  steps.push({
    n,
    cnt,
    curCity: start,
    curPower: 0,
    curTime: 0,
    distGrid: snapshotGrid2D(dist),
    pqSnapshot: [...pq],
    decision: `1. 初始化电动车状态：起点城市 ${start}，初始电量 0 格，到达时间 0，加入小根堆`,
    message: `最大电池容量为 ${cnt}，需根据各城市充电单价 [${charge.join(', ')}] 规划最优充电策略。`,
    log: `Init EV state (city=${start}, power=0, time=0)`,
    codeLine: lines.init,
    metrics: { '起点城市': start, '终点城市': end, '电池容量': cnt },
    statusBadge: { text: `起点就绪: 城市${start}`, type: 'info' },
  });

  while (pq.length > 0) {
    pq.sort((a, b) => a.time - b.time);
    const { city: u, power, time } = pq.shift()!;

    if (time > dist[u][power]) continue;

    steps.push({
      n,
      cnt,
      curCity: u,
      curPower: power,
      curTime: time,
      distGrid: snapshotGrid2D(dist),
      pqSnapshot: [...pq],
      decision: `堆顶弹出最优状态 (城市 ${u}, 电量 ${power}/${cnt}格) [累计耗时 = ${time}]，进行充电与行驶分支`,
      message: `探索：1. 在当前城市充 1 格电 (耗时 +${charge[u]})；2. 沿道路行驶消耗电量。`,
      log: `Poll EV state (u=${u}, power=${power}) time=${time}`,
      codeLine: lines.pollState,
      metrics: { '当前城市': u, '剩余电量': `${power}格`, '当前耗时': `${time}s` },
      statusBadge: { text: `探查: 城市${u} (${power}格)`, type: 'info' },
    });

    if (u === end) {
      steps.push({
        n,
        cnt,
        curCity: u,
        curPower: power,
        curTime: time,
        distGrid: snapshotGrid2D(dist),
        pqSnapshot: [...pq],
        decision: `顺利到达终点城市 ${end}！最小旅行总时间为 ${time}`,
        message: `根据小根堆单调性，首次到达终点城市的状态即为全局最优耗时。`,
        log: `End city reached with time ${time}`,
        codeLine: lines.hitEnd,
        metrics: { '最终耗时': `${time}s`, '剩余电量': `${power}格` },
        statusBadge: { text: `到达终点: ${time}s`, type: 'success' },
      });
      break;
    }

    // 分支 1：原地充 1 格电
    if (power < cnt) {
      const nextTime = time + charge[u];
      if (nextTime < dist[u][power + 1]) {
        dist[u][power + 1] = nextTime;
        pq.push({ city: u, power: power + 1, time: nextTime });

        steps.push({
          n,
          cnt,
          curCity: u,
          curPower: power,
          curTime: time,
          distGrid: snapshotGrid2D(dist),
          pqSnapshot: [...pq],
          decision: `[原地充电] 在城市 ${u} 充 1 格电：耗时 +${charge[u]}，新状态 (城市 ${u}, 电量 ${power + 1}格)，累计耗时 ${nextTime}`,
          message: `电池充至 ${power + 1} 格，更新 dist[${u}][${power + 1}] = ${nextTime}。`,
          log: `Charge 1 unit at city ${u} -> power=${power+1}, time=${nextTime}`,
          codeLine: lines.chargeOption,
          metrics: { '决策': '⚡ 原地充电', '城市': u, '充电耗时': charge[u], '新电量': `${power + 1}格` },
          statusBadge: { text: `充至 ${power + 1}格`, type: 'info' },
        });
      }
    }

    // 分支 2：沿道路行驶
    for (const edge of adj[u]) {
      const v = edge.to;
      const w = edge.w;
      if (power >= w) {
        const nextTime = time + w;
        if (nextTime < dist[v][power - w]) {
          dist[v][power - w] = nextTime;
          pq.push({ city: v, power: power - w, time: nextTime });

          steps.push({
            n,
            cnt,
            curCity: u,
            curPower: power,
            curTime: time,
            distGrid: snapshotGrid2D(dist),
            pqSnapshot: [...pq],
            decision: `[道路行驶] 沿道路驶向城市 ${v} (耗电 ${w}格，耗时 ${w})：新状态 (城市 ${v}, 电量 ${power - w}格)，累计耗时 ${nextTime}`,
            message: `电量从 ${power} 格消耗至 ${power - w} 格，成功到达相邻城市。`,
            log: `Drive (${u}->${v}, w=${w}) -> city=${v}, power=${power-w}, time=${nextTime}`,
            codeLine: lines.moveOption,
            metrics: { '决策': '🚗 道路行驶', '目标城市': v, '耗电': `${w}格`, '剩余电量': `${power - w}格` },
            statusBadge: { text: `行驶: 城市${u}➔${v}`, type: 'success' },
          });
        }
      }
    }
  }

  return steps;
}

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
