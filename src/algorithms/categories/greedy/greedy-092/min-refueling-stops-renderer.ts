/**
 * 最低加油次数 (LeetCode 871) - 声明式教学级沙盘渲染器
 * 核心贪心：行进探测 + 大顶堆维护经过加油站油量（后悔贪心策略）
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_092_PROBLEMS } from './greedy-092-problem-content';
import {
  MIN_REFUELING_STOPS_CODES,
  MIN_REFUELING_STOPS_LINES,
} from './greedy-092-stage-codes';
import {
  Greedy092Step,
  renderDecisionBalance,
} from './greedy-092-shared';

export interface StationDef {
  pos: number;
  fuel: number;
  idx: number;
  isPassed?: boolean;
  isRefueled?: boolean;
}

export interface MinRefuelingStopsStep extends Greedy092Step {
  target: number;
  curFuel: number;
  curPos: number;
  stops: number;
  heap: number[];
  stations: StationDef[];
  isFailed?: boolean;
}

export function buildMinRefuelingStopsSteps(target: number, startFuel: number, rawStations: [number, number][]): MinRefuelingStopsStep[] {
  const steps: MinRefuelingStopsStep[] = [];
  const lines = MIN_REFUELING_STOPS_LINES;
  const n = rawStations.length;

  const stations: StationDef[] = rawStations.map(([pos, fuel], idx) => ({
    pos,
    fuel,
    idx,
    isPassed: false,
    isRefueled: false,
  }));

  // Step 0: 入口
  steps.push({
    target,
    curFuel: startFuel,
    curPos: 0,
    stops: 0,
    heap: [],
    stations: stations.map(s => ({ ...s })),
    decision: `主函数入口：目的地 target=${target}，初始油量 startFuel=${startFuel}，沿途有 ${n} 座加油站`,
    message: '核心策略：开到油不够去下一个目标时，贪心地从经过的所有加油站中提取最大油量（后悔机制）',
    log: `enter minRefuelStops(target=${target}, startFuel=${startFuel}, n=${n})`,
    codeLine: lines.entry,
  });

  const heap: number[] = [];
  let curFuel = startFuel;
  let stops = 0;
  let i = 0;

  while (curFuel < target) {
    // 将所有当前油量可达的加油站油量入堆
    let addedCount = 0;
    while (i < n && stations[i].pos <= curFuel) {
      heap.push(stations[i].fuel);
      stations[i].isPassed = true;
      addedCount++;
      i++;
    }
    heap.sort((a, b) => b - a);

    if (addedCount > 0) {
      steps.push({
        target,
        curFuel,
        curPos: curFuel,
        stops,
        heap: [...heap],
        stations: stations.map(s => ({ ...s })),
        decision: `车辆当前最远可达位置 ${curFuel}：沿途路过并记录了 ${addedCount} 座加油站的汽油，入备用大顶堆 [${heap.join(', ')}]`,
        message: '路过时不立即加油，存入备用油桶等待油量告急时使用',
        log: `collected ${addedCount} stations gas, heap=[${heap.join(',')}]`,
        codeLine: lines.collectGas,
      });
    }

    // 若当前油量仍然到不了 target 且堆为空，说明无法抵达
    if (heap.length === 0) {
      steps.push({
        target,
        curFuel,
        curPos: curFuel,
        stops,
        heap: [],
        stations: stations.map(s => ({ ...s })),
        isFailed: true,
        decision: `❌ 无法到达目的地！当前油量仅能开到 ${curFuel}，备用加油站油桶已全部耗尽，无法抵达 target=${target}，返回 -1`,
        message: '搜索终止，判定不可达',
        log: `cannot reach target, fail at pos ${curFuel}`,
        codeLine: lines.done,
      });
      return steps;
    }

    // 后悔式贪心加油：提取堆顶最大油量
    const maxGas = heap.shift()!;
    curFuel += maxGas;
    stops++;

    steps.push({
      target,
      curFuel,
      curPos: curFuel,
      stops,
      heap: [...heap],
      stations: stations.map(s => ({ ...s })),
      decision: `⛽ 油量告急！从历史经过加油站中贪心取出最大油桶 +${maxGas} 升，加油次数增至 ${stops} 次，最远续航距离延伸至 ${curFuel}`,
      message: `当前累计加油次数: ${stops} 次`,
      log: `refueled +${maxGas}, curFuel=${curFuel}, stops=${stops}`,
      codeLine: lines.refuelMax,
    });
  }

  // 收敛返回
  steps.push({
    target,
    curFuel,
    curPos: target,
    stops,
    heap: [...heap],
    stations: stations.map(s => ({ ...s })),
    decision: `🎉 成功抵达目的地 target=${target}！最少加油次数为 ${stops} 次`,
    message: '大顶堆后悔贪心策略达成最优解',
    log: `done reach target stops=${stops}`,
    codeLine: lines.done,
  });

  return steps;
}

export const minRefuelingStopsVisualizer = registerDeclarativeAlgorithm<MinRefuelingStopsStep>({
  id: 'minimum-number-of-refueling-stops',
  name: '最低加油次数 (Min Refueling Stops)',
  category: 'greedy',
  icon: '⛽',
  difficulty: 3,
  levelOrder: 926,
  learningGoal: '掌握后悔贪心策略与大顶堆动态补油机制',
  problemHtml: GREEDY_092_PROBLEMS.minRefuelingStops.html,
  analysisHtml: GREEDY_092_PROBLEMS.minRefuelingStops.html,
  inputs: [
    {
      id: 'input-target',
      label: '目标距离 target',
      type: 'number',
      defaultValue: 100,
      placeholder: '如 100',
    },
    {
      id: 'input-start-fuel',
      label: '初始油量 startFuel',
      type: 'number',
      defaultValue: 10,
      placeholder: '如 10',
    },
    {
      id: 'input-stations',
      label: '加油站列表 [[位置, 油量]]',
      type: 'text',
      defaultValue: '[[10, 60], [20, 30], [30, 30], [60, 40]]',
      placeholder: '[[10,60],[20,30],[30,30],[60,40]]',
    },
  ],
  codeLanguages: MIN_REFUELING_STOPS_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const target = parseInt(String(inputs?.['input-target'] ?? 100), 10);
    const startFuel = parseInt(String(inputs?.['input-start-fuel'] ?? 10), 10);
    let stations: [number, number][] = [[10, 60], [20, 30], [30, 30], [60, 40]];
    try {
      const raw = inputs?.['input-stations'];
      if (Array.isArray(raw)) {
        stations = raw;
      } else if (typeof raw === 'string') {
        stations = JSON.parse(raw);
      }
    } catch {
      // fallback to default
    }
    return buildMinRefuelingStopsSteps(isNaN(target) ? 100 : target, isNaN(startFuel) ? 10 : startFuel, stations);
  },
  renderCanvas: (stageContainer: HTMLElement, step: MinRefuelingStopsStep) => {
    stageContainer.innerHTML = '';

    const mainCard = document.createElement('div');
    mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 顶部状态栏
    const isFinished = step.curPos >= step.target;
    mainCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">目的地: <b>${step.target}</b> km</span>
          <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; font-weight: 600;">最远续航: ${step.curFuel} km</span>
        </div>
        <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
          <span style="color: #64748b;">最少加油次数:</span>
          <span style="color: ${step.isFailed ? '#dc2626' : '#059669'}; font-weight: 800; font-size: 16px;">${step.isFailed ? '-1 (不可达)' : `${step.stops} 次`}</span>
        </div>
      </div>
    `;

    // 中部：公路行程与加油站分布
    const roadBox = document.createElement('div');
    roadBox.style.cssText = 'flex: 1; display: flex; flex-direction: column; gap: 8px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 12px; overflow-y: auto;';

    const track = document.createElement('div');
    track.style.cssText = 'display: flex; align-items: center; gap: 12px; overflow-x: auto; padding: 10px 0;';

    // 起点
    const startNode = document.createElement('div');
    startNode.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 50px;';
    startNode.innerHTML = `
      <span style="font-size: 14px;">🚗</span>
      <div style="padding: 2px 6px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; font-size: 10px; font-weight: 700; color: #1d4ed8;">起点 (0)</div>
    `;
    track.appendChild(startNode);

    // 各加油站
    step.stations.forEach((s) => {
      const isReach = s.pos <= step.curFuel;
      const node = document.createElement('div');
      node.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 65px;';
      node.innerHTML = `
        <span style="font-size: 14px;">${isReach ? '⛽' : '🔒'}</span>
        <div style="padding: 2px 6px; background: ${isReach ? '#ecfdf5' : '#f8fafc'}; border: 1px solid ${isReach ? '#86efac' : '#cbd5e1'}; border-radius: 4px; font-size: 10px; font-weight: 700; color: ${isReach ? '#047857' : '#94a3b8'};">
          ${s.pos}km (+${s.fuel}L)
        </div>
      `;
      track.appendChild(node);
    });

    // 终点
    const endNode = document.createElement('div');
    endNode.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 50px;';
    endNode.innerHTML = `
      <span style="font-size: 14px;">🏁</span>
      <div style="padding: 2px 6px; background: ${isFinished ? '#ecfdf5' : '#f8fafc'}; border: 1px solid ${isFinished ? '#10b981' : '#cbd5e1'}; border-radius: 4px; font-size: 10px; font-weight: 700; color: ${isFinished ? '#047857' : '#94a3b8'};">
        终点 (${step.target})
      </div>
    `;
    track.appendChild(endNode);

    roadBox.appendChild(track);
    mainCard.appendChild(roadBox);

    // 底部：备用大顶堆油桶展示
    const heapBox = document.createElement('div');
    heapBox.style.cssText = 'display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;';
    const heapHtml = step.heap.length === 0
      ? '<span style="color: #94a3b8; font-size: 11px;">备用油桶堆为空</span>'
      : step.heap.map((gas, idx) => {
          const isTop = idx === 0;
          return `
            <div style="padding: 4px 8px; border-radius: 6px; background: ${isTop ? '#fffbeb' : '#ffffff'}; border: 1.5px solid ${isTop ? '#f59e0b' : '#cbd5e1'}; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: ${isTop ? '#b45309' : '#334155'};">
              +${gas} 升
            </div>
          `;
        }).join('');

    heapBox.innerHTML = `
      <span style="font-size: 11px; font-weight: 700; color: #1e293b; min-width: 90px;">备用大顶堆:</span>
      <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">${heapHtml}</div>
    `;
    mainCard.appendChild(heapBox);

    stageContainer.appendChild(mainCard);
  },
});

export function registerMinRefuelingStops(): void {
  // 保持向前兼容导出
}
