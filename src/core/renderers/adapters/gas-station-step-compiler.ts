import { StepBase } from '../../step-visualizer';
import type { HighlightTarget } from '../../step-visualizer';

export const GAS_STATION_CODE_LINES: Record<string, HighlightTarget> = {
  entry: { java: 1, cpp: 3, python: 2, javascript: 1 },
  init: {
    java: { primary: 4, context: [2, 3] },
    cpp: { primary: 6, context: [4, 5] },
    python: { primary: 5, context: [3, 4] },
    javascript: { primary: 4, context: [2, 3] },
  },
  scan: {
    java: { primary: 8, context: [6, 7] },
    cpp: { primary: 9, context: [8] },
    python: { primary: 8, context: [7] },
    javascript: { primary: 7, context: [6] },
  },
  reset: {
    java: { primary: 10, context: [9, 11] },
    cpp: { primary: 11, context: [10, 12] },
    python: { primary: 10, context: [9, 11] },
    javascript: { primary: 9, context: [8, 10] },
  },
  guardEmpty: { java: 14, cpp: 15, python: { primary: 13, context: [12] }, javascript: 13 },
  failTotal: { java: 14, cpp: 15, python: { primary: 13, context: [12] }, javascript: 13 },
  success: { java: 15, cpp: 16, python: 14, javascript: 14 },
};

export interface GasStationStep extends StepBase {
  gas: number[];
  cost: number[];
  currentIndex: number;
  currentTank: number;
  totalTank: number;
  startStation: number;
  failedStations: number[];
  action: 'init' | 'scan' | 'reset' | 'success' | 'failed';
  decision?: string;
  message: string;
  log?: string;
  codeLine: HighlightTarget;
  line?: number;
  metrics?: Record<string, string>;
}

function getLine(target: HighlightTarget): number {
  if (typeof target === 'number') return target;
  if (typeof target === 'object' && target !== null && 'java' in target) {
    const j = (target as any).java;
    if (typeof j === 'number') return j;
    if (j && typeof j.primary === 'number') return j.primary;
  }
  return 1;
}

function normalizeGasStationSteps(steps: GasStationStep[]): GasStationStep[] {
  return steps.map((step) => {
    let actionDesc = '⛽ 油箱正常续航';
    if (step.action === 'reset') actionDesc = '⚠️ 亏空断油 (起点移至 i+1)';
    else if (step.action === 'success') actionDesc = '🎉 环行成功 (锁定起点)';
    else if (step.action === 'failed') actionDesc = '❌ 全局油量不足 (返回 -1)';
    else if (step.action === 'init') actionDesc = '初始化';

    return {
      ...step,
      decision: step.decision ?? actionDesc,
      log: step.log ?? step.message,
      line: step.line ?? getLine(step.codeLine),
      metrics: {
        'cur-tank': `${step.currentTank} L`,
        'total-tank': `${step.totalTank >= 0 ? '+' : ''}${step.totalTank} L`,
        start: step.startStation >= 0 ? `下标 [${step.startStation}]` : '-1 (无解)',
        'net-status': step.totalTank >= 0 ? '✓ 全局油量盈余' : '✕ 总补给 < 总消耗',
        action: actionDesc,
      },
    };
  });
}

export function buildGasStationSteps(rawGas: number[], rawCost: number[]): GasStationStep[] {
  const steps: GasStationStep[] = [];
  const n = Math.min(rawGas.length, rawCost.length);
  const gas = rawGas.slice(0, n);
  const cost = rawCost.slice(0, n);
  const lines = GAS_STATION_CODE_LINES;

  if (n === 0) {
    steps.push({
      gas: [],
      cost: [],
      currentIndex: -1,
      currentTank: 0,
      totalTank: 0,
      startStation: -1,
      failedStations: [],
      action: 'failed',
      message: '输入数据为空，返回 -1',
      codeLine: lines.guardEmpty,
      line: getLine(lines.guardEmpty),
    });
    return normalizeGasStationSteps(steps);
  }

  let totalTank = 0;
  let currentTank = 0;
  let startStation = 0;
  const failedStations: number[] = [];

  steps.push({
    gas,
    cost,
    currentIndex: -1,
    currentTank: 0,
    totalTank: 0,
    startStation: 0,
    failedStations: [],
    action: 'init',
    message: `初始化：共 ${n} 个站点，初始候选起点 start = 0，currentTank = 0，totalTank = 0`,
    codeLine: lines.init,
    line: getLine(lines.init),
  });

  for (let i = 0; i < n; i++) {
    const net = gas[i] - cost[i];
    currentTank += net;
    totalTank += net;

    steps.push({
      gas,
      cost,
      currentIndex: i,
      currentTank,
      totalTank,
      startStation,
      failedStations: [...failedStations],
      action: 'scan',
      message: `⛽ 考察站点 [${i}]：加油 ${gas[i]}L，消耗 ${cost[i]}L，净油量 ${net >= 0 ? '+' : ''}${net}L；当前油箱 = ${currentTank}L，全局净油量 = ${totalTank}L`,
      codeLine: lines.scan,
      line: getLine(lines.scan),
    });

    if (currentTank < 0) {
      for (let f = startStation; f <= i; f++) {
        if (!failedStations.includes(f)) failedStations.push(f);
      }

      startStation = i + 1;
      currentTank = 0;

      steps.push({
        gas,
        cost,
        currentIndex: i,
        currentTank: 0,
        totalTank,
        startStation,
        failedStations: [...failedStations],
        action: 'reset',
        message: `⚠️ 油量亏空！在站点 [${i}] 断油 (油量 ${currentTank + net} < 0)！贪心排除区间 [0 .. ${i}]，候选起点重置为 [${startStation}]`,
        codeLine: lines.reset,
        line: getLine(lines.reset),
      });
    }
  }

  if (totalTank < 0 || startStation >= n) {
    steps.push({
      gas,
      cost,
      currentIndex: n - 1,
      currentTank,
      totalTank,
      startStation: -1,
      failedStations: [...failedStations],
      action: 'failed',
      message: `❌ 全局总净油量 totalTank = ${totalTank} < 0，总消耗大于总补给，环行一周必定无法完成，返回 -1`,
      codeLine: lines.failTotal,
      line: getLine(lines.failTotal),
    });
  } else {
    steps.push({
      gas,
      cost,
      currentIndex: n - 1,
      currentTank,
      totalTank,
      startStation,
      failedStations: [...failedStations],
      action: 'success',
      message: `🎉 全局总净油量 totalTank = ${totalTank} >= 0！唯一可行出发加油站起点为 [${startStation}]`,
      codeLine: lines.success,
      line: getLine(lines.success),
    });
  }

  return normalizeGasStationSteps(steps);
}
