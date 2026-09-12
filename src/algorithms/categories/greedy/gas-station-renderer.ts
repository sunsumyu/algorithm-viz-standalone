/**
 * 加油站可视化器（贪心算法）— 声明式 4-Card 标准架构
 * LeetCode 134：维护当前候选起点油量 curSum 与全局净油量 totalSum，亏空时贪心重置起点为 i + 1
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import {
  GAS_STATION_PROBLEM_HTML,
  GAS_STATION_ANALYSIS_HTML,
  GAS_STATION_CODE_LANGUAGES,
} from './gas-station-problem-content';

export interface GasStationStep {
  gas: number[];
  cost: number[];
  currentIndex: number;
  currentTank: number;
  totalTank: number;
  startStation: number;
  failedStations: number[];
  action: 'init' | 'scan' | 'reset' | 'success' | 'failed';
  message: string;
  codeLine: number;
  metrics?: Record<string, string>;
}

export function buildGasStationSteps(rawGas: number[], rawCost: number[]): GasStationStep[] {
  const steps: GasStationStep[] = [];
  const n = Math.min(rawGas.length, rawCost.length);
  const gas = rawGas.slice(0, n);
  const cost = rawCost.slice(0, n);

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
      codeLine: 1,
    });
    return steps;
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
    codeLine: 4,
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
      codeLine: 8,
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
        codeLine: 10,
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
      codeLine: 13,
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
      message: `🎉 全局总净油量 totalTank = ${totalTank} &ge; 0！唯一可行出发加油站起点为 [${startStation}]`,
      codeLine: 14,
    });
  }

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: GasStationStep[]): GasStationStep[] {
  return steps.map((s) => {
    let action = '⛽ 油箱正常续航';
    if (s.action === 'reset') action = '⚠️ 亏空断油 (起点移至 i+1)';
    else if (s.action === 'success') action = '🎉 环行成功 (锁定起点)';
    else if (s.action === 'failed') action = '❌ 全局油量不足 (返回 -1)';
    else if (s.action === 'init') action = '初始化';

    return {
      ...s,
      log: s.message,
      metrics: {
        'cur-tank': `${s.currentTank} L`,
        'total-tank': `${s.totalTank >= 0 ? '+' : ''}${s.totalTank} L`,
        start: s.startStation >= 0 ? `下标 [${s.startStation}]` : '-1 (无解)',
        'net-status': s.totalTank >= 0 ? '✓ 全局油量盈余' : '✕ 总补给 < 总消耗',
        action,
      },
    };
  });
}

export function renderGasStationCanvas(container: HTMLElement, step: GasStationStep): void {
  const gas = step.gas;
  const cost = step.cost;
  const n = gas.length;

  if (n === 0) {
    container.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const curIdx = step.currentIndex;
  const isSuccess = step.action === 'success';
  const isFailed = step.action === 'failed';

  const stationsHtml = gas
    .map((g, idx) => {
      const c = cost[idx] ?? 0;
      const net = g - c;
      const isCurrent = idx === curIdx && !isSuccess && !isFailed;
      const isCandidateStart = idx === step.startStation;
      const isEliminated = step.failedStations.includes(idx);

      let bg = '#ffffff';
      let borderColor = '#e2e8f0';
      let textColor = '#0f172a';

      if (isCurrent) {
        bg = '#eff6ff';
        borderColor = '#2563eb';
        textColor = '#2563eb';
      } else if (isSuccess && isCandidateStart) {
        bg = '#ecfdf5';
        borderColor = '#10b981';
        textColor = '#059669';
      } else if (isCandidateStart) {
        bg = '#fffbeb';
        borderColor = '#d97706';
        textColor = '#b45309';
      } else if (isEliminated) {
        bg = '#fef2f2';
        borderColor = '#fca5a5';
        textColor = '#94a3b8';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <span style="font-size: 9px; color: ${isCandidateStart ? '#d97706' : isCurrent ? '#2563eb' : '#94a3b8'}; font-weight: 700;">
            ${isCandidateStart ? '🚩 起点' : isCurrent ? '📍 当前' : `[${idx}]`}
          </span>
          <div style="width: 52px; height: 56px; border-radius: 12px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 4px rgba(0,0,0,0.04); gap: 1px;">
            <span style="font-size: 10px; color: #64748b;">+${g} / -${c}</span>
            <span style="font-size: 13px; color: ${net >= 0 ? '#059669' : '#dc2626'};">${net >= 0 ? `+${net}` : net}</span>
          </div>
          <span style="font-size: 8.5px; color: ${isEliminated ? '#ef4444' : net >= 0 ? '#059669' : '#64748b'}; font-weight: 700;">
            ${isEliminated ? '✕ 排除' : net >= 0 ? '盈余' : '亏损'}
          </span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
      <!-- 总体状况栏 -->
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
        <span>当前候选起点: <strong style="color: #d97706; font-family: monospace;">[${step.startStation >= 0 && step.startStation < n ? step.startStation : '-'}]</strong></span>
        <span>全局净油量: <strong style="color: ${step.totalTank >= 0 ? '#059669' : '#dc2626'}; font-family: monospace;">${step.totalTank >= 0 ? `+${step.totalTank}` : step.totalTank}L</strong></span>
      </div>

      <!-- 站点水平流 -->
      <div style="display: flex; gap: 8px; overflow-x: auto; justify-content: center; padding: 4px 0;">
        ${stationsHtml}
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'gas-station',
  name: '加油站',
  category: 'greedy',
  description: '求绕环形路线行驶一周的唯一起点，累积净油量亏空即贪心将起点推进至 i + 1',
  icon: '⛽',
  difficulty: 2,
  levelOrder: 12,
  learningGoal: '掌握环形路线贪心跳跃技巧，理解局部亏空排除法与全局收支判定的协同运用',
  inputs: [
    {
      id: 'gas',
      label: '加油量数组',
      type: 'text',
      defaultValue: '1,2,3,4,5',
      placeholder: '1,2,3,4,5',
    },
    {
      id: 'cost',
      label: '消耗量数组',
      type: 'text',
      defaultValue: '3,4,5,1,2',
      placeholder: '3,4,5,1,2',
    },
  ],
  presets: [
    { label: '示例 1 (起点 3)', values: { gas: '1,2,3,4,5', cost: '3,4,5,1,2' } },
    { label: '示例 2 (无解 -1)', values: { gas: '2,3,4', cost: '3,4,3' } },
    { label: '首站即起点 (起点 0)', values: { gas: '5,1,2,3,4', cost: '4,4,1,5,1' } },
  ],
  metrics: [
    { id: 'cur-tank', label: '当前油箱续航', color: '#059669' },
    { id: 'total-tank', label: '全局净油量', color: '#475569' },
    { id: 'start', label: '可行出发起点', color: '#d97706' },
    { id: 'net-status', label: '全局收支判定', color: '#ef4444' },
    { id: 'action', label: '贪心判定', color: '#2563eb' },
  ],
  legend: [
    { label: '+ 净盈余', color: '#10b981' },
    { label: '- 净亏空', color: '#ef4444' },
    { label: '🚩 候选起点', color: '#d97706' },
    { label: '📍 当前站点', color: '#2563eb' },
  ],
  codeLanguages: GAS_STATION_CODE_LANGUAGES,
  problemHtml: GAS_STATION_PROBLEM_HTML,
  analysisHtml: GAS_STATION_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const gas = parseNumberList(inputs.gas, '1,2,3,4,5');
    const cost = parseNumberList(inputs.cost, '3,4,5,1,2');
    return withMetrics(
      buildGasStationSteps(gas.length ? gas : [1, 2, 3, 4, 5], cost.length ? cost : [3, 4, 5, 1, 2])
    );
  },
  renderCanvas: (container, step) => renderGasStationCanvas(container, step as GasStationStep),
});
