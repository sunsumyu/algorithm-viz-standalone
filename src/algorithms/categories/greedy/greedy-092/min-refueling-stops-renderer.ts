/**
 * 最低加油次数 (LeetCode 871) - 声明式教学级沙盘渲染器
 * 核心贪心：行进探测 + 大顶堆维护经过加油站油量（后悔贪心策略）
 */

import { GREEDY_092_PROBLEMS } from './greedy-092-problem-content';
import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { registerAlgorithm } from '../../../../core/registry';
import {
  MIN_REFUELING_STOPS_CODES,
  MIN_REFUELING_STOPS_LINES,
} from './greedy-092-stage-codes';
import { Greedy092Step } from './greedy-092-shared';

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

const template = `<div id="algo-minimum-number-of-refueling-stops-view" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`;

export const minRefuelingStopsRenderer = UniversalStageVisualizer;
export const minRefuelingStopsVisualizer = UniversalStageVisualizer;

registerAlgorithm({
  id: 'minimum-number-of-refueling-stops',
  name: '最低加油次数 (Minimum Number of Refueling Stops)',
  viewId: 'algo-minimum-number-of-refueling-stops-view',
  category: 'greedy',
  description: 'LeetCode 871：行进探测 + 大顶堆维护经过加油站油量（后悔贪心策略）',
  icon: '⛽',
  template,
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 926,
  learningGoal: '掌握后悔贪心策略与大顶堆动态补油机制',
});

export function registerMinRefuelingStops(): void {
  // 保持向前兼容导出
}
