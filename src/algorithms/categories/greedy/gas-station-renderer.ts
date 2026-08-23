/**
 * 加油站可视化器（贪心算法）
 * LeetCode 134：从某个加油站出发，绕环路一圈返回起点
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './gas-station.html?raw';

type GasStationStatus = 'ready' | 'scan' | 'reset' | 'success' | 'failed';

interface GasStationStep {
  gas: number[];
  cost: number[];
  currentIndex: number;
  currentTank: number;
  totalTank: number;
  startStation: number;
  failedFrom: number;
  failedTo: number;
  status: GasStationStatus;
  message: string;
  log: string;
  codeLine: number | number[] | { from: number; to: number };
}

function parseNumbers(input: string, fallback: number[]): number[] {
  const parsed = input
    .split(',')
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isFinite(value));

  return parsed.length > 0 ? parsed : fallback;
}

/**
 * 加油站算法（贪心），生成逐步可视化状态。
 */
function gasStationSteps(gasInput: number[], costInput: number[]): GasStationStep[] {
  const steps: GasStationStep[] = [];
  const n = Math.min(gasInput.length, costInput.length);
  const gas = gasInput.slice(0, n);
  const cost = costInput.slice(0, n);

  if (n === 0) {
    return [{
      gas: [],
      cost: [],
      currentIndex: -1,
      currentTank: 0,
      totalTank: 0,
      startStation: -1,
      failedFrom: -1,
      failedTo: -1,
      status: 'failed',
      message: '输入为空，请至少输入一个 gas / cost 数据。',
      log: '❌ 输入为空，无法执行。',
      codeLine: 1,
    }];
  }

  let totalTank = 0;
  let currentTank = 0;
  let startIndex = 0;

  steps.push({
    gas,
    cost,
    currentIndex: -1,
    currentTank,
    totalTank,
    startStation: startIndex,
    failedFrom: -1,
    failedTo: -1,
    status: 'ready',
    message: '初始化：totalTank = 0，currentTank = 0，候选起点 startIndex = 0。',
    log: '🚀 初始化 totalTank = 0，currentTank = 0，startIndex = 0。',
    codeLine: { from: 3, to: 5 },
  });

  for (let i = 0; i < n; i++) {
    const net = gas[i] - cost[i];
    totalTank += net;
    currentTank += net;

    steps.push({
      gas,
      cost,
      currentIndex: i,
      currentTank,
      totalTank,
      startStation: startIndex,
      failedFrom: -1,
      failedTo: -1,
      status: 'scan',
      message: `站 ${i}：加油 ${gas[i]}，去下一站消耗 ${cost[i]}，净油量 ${net >= 0 ? '+' : ''}${net}；currentTank=${currentTank}，totalTank=${totalTank}。`,
      log: `⛽ 到达站 ${i}: net = ${gas[i]} - ${cost[i]} = ${net >= 0 ? '+' : ''}${net}，油箱剩余 ${currentTank}。`,
      codeLine: { from: 8, to: 10 },
    });

    if (currentTank < 0) {
      steps.push({
        gas,
        cost,
        currentIndex: i,
        currentTank,
        totalTank,
        startStation: startIndex,
        failedFrom: startIndex,
        failedTo: i,
        status: 'reset',
        message: `油箱变为负数，候选区间 [${startIndex}, ${i}] 全部失败：从这些站出发都到不了站 ${i + 1}。`,
        log: `⚠️ currentTank < 0，淘汰候选区间 [${startIndex}, ${i}]。`,
        codeLine: 12,
      });

      currentTank = 0;
      startIndex = i + 1;

      steps.push({
        gas,
        cost,
        currentIndex: i,
        currentTank,
        totalTank,
        startStation: startIndex,
        failedFrom: -1,
        failedTo: -1,
        status: 'reset',
        message: `重置 currentTank = 0，并将候选起点移动到 ${startIndex}。`,
        log: `🔄 startIndex = ${startIndex}，currentTank 清零，从新候选起点继续验证。`,
        codeLine: { from: 13, to: 14 },
      });
    }
  }

  const result = totalTank >= 0 ? startIndex : -1;
  steps.push({
    gas,
    cost,
    currentIndex: n,
    currentTank,
    totalTank,
    startStation: result,
    failedFrom: -1,
    failedTo: -1,
    status: totalTank >= 0 ? 'success' : 'failed',
    message: totalTank >= 0
      ? `成功跑完闭环！起点为 ${result}`
      : '总净油量为负，整圈油量不够，无法从任何站点出发完成一周。',
    log: totalTank >= 0
      ? `👉 最终返回答案：${result}。`
      : '👉 最终返回答案：-1。',
    codeLine: 20,
  });

  return steps;
}

export class GasStationVisualizer extends StepVisualizer<GasStationStep> {
  protected codeLines = [
    'public int canCompleteCircuit(int[] gas,',
    '                              int[] cost) {',
    '    int totalTank = 0;',
    '    int currentTank = 0;',
    '    int startIndex = 0;',
    '',
    '    for (int i = 0; i < gas.length; i++) {',
    '        int net = gas[i] - cost[i];',
    '        totalTank += net;',
    '        currentTank += net;',
    '',
    '        if (currentTank < 0) {',
    '            startIndex = i + 1;',
    '            currentTank = 0;',
    '        }',
    '    }',
    '',
    '    return totalTank >= 0 ? startIndex : -1;',
    '}',
  ];
  protected codePanelTitle = '☕ Java 源码联动执行';

  private gasInput: HTMLInputElement | null = null;
  private costInput: HTMLInputElement | null = null;
  private trackEl: HTMLElement | null = null;
  private currentStationEl: HTMLElement | null = null;
  private startStationEl: HTMLElement | null = null;
  private currentTankEl: HTMLElement | null = null;
  private totalTankEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private clearLogBtn: HTMLButtonElement | null = null;
  private logs: string[] = [];

  protected initDOMElements(): void {
    if (!this.root) return;

    this.gasInput = this.root.querySelector('#gas-input');
    this.costInput = this.root.querySelector('#cost-input');
    this.trackEl = this.root.querySelector('#gas-station-track');
    this.currentStationEl = this.root.querySelector('#current-station');
    this.startStationEl = this.root.querySelector('#start-station');
    this.currentTankEl = this.root.querySelector('#current-tank');
    this.totalTankEl = this.root.querySelector('#total-tank');
    this.logEl = this.root.querySelector('#gas-station-log');
    this.clearLogBtn = this.root.querySelector('#gas-log-clear');

    this.bindPlaybackControls({
      reset: 'gas-station-reset',
      prev: 'gas-station-prev',
      play: 'gas-station-play',
      next: 'gas-station-next',
      speed: 'gas-station-speed',
      speedLabel: 'gas-station-speed-label',
      counter: 'gas-station-step-counter',
      message: 'gas-station-message',
    });
  }

  protected setupEvents(): void {
    if (!this.root) return;

    this.root.querySelectorAll<HTMLButtonElement>('.gas-example').forEach((button) => {
      button.addEventListener('click', () => {
        if (this.gasInput) this.gasInput.value = button.dataset.gas || '';
        if (this.costInput) this.costInput.value = button.dataset.cost || '';
        void this.start();
      });
    });

    this.gasInput?.addEventListener('change', () => void this.start());
    this.costInput?.addEventListener('change', () => void this.start());
    this.clearLogBtn?.addEventListener('click', () => {
      this.logs = [];
      if (this.logEl) this.logEl.innerHTML = '';
    });
  }

  protected buildSteps(): GasStationStep[] {
    const gas = parseNumbers(this.gasInput?.value || '', [1, 2, 3, 4, 5]);
    const cost = parseNumbers(this.costInput?.value || '', [3, 4, 5, 1, 2]);
    this.logs = [];
    return gasStationSteps(gas, cost);
  }

  protected renderStep(step: GasStationStep): void {
    if (!this.trackEl || !this.currentStationEl || !this.startStationEl || !this.currentTankEl || !this.totalTankEl) return;

    this.currentStationEl.textContent = this.formatCurrentPosition(step);
    this.currentStationEl.classList.toggle('word', step.currentIndex < 0 || step.currentIndex >= step.gas.length);
    this.startStationEl.textContent = step.startStation >= 0 ? String(step.startStation) : '-1';
    this.currentTankEl.textContent = String(step.currentTank);
    this.totalTankEl.textContent = String(step.totalTank);

    this.currentTankEl.style.color = step.currentTank < 0 ? '#dc2626' : '#16a34a';
    this.totalTankEl.style.color = step.totalTank < 0 ? '#dc2626' : '#9333ea';

    this.renderTrack(step);
    this.renderExecutionLog(step);
    this.updateResultBanner(step);
  }

  private formatCurrentPosition(step: GasStationStep): string {
    if (step.status === 'success') return '回到起点';
    if (step.status === 'failed' && step.currentIndex >= step.gas.length) return '失败';
    if (step.currentIndex < 0) return '初始化';
    return String(step.currentIndex);
  }

  private renderTrack(step: GasStationStep): void {
    const trackEl = this.trackEl;
    if (!trackEl) return;
    trackEl.innerHTML = '';

    step.gas.forEach((gasValue, index) => {
      const costValue = step.cost[index] ?? 0;
      const net = gasValue - costValue;
      const station = document.createElement('div');
      station.className = 'gas-station-box';

      if (index === step.currentIndex) station.classList.add('current');
      if (index === step.startStation) station.classList.add('start');
      if (step.failedFrom >= 0 && index >= step.failedFrom && index <= step.failedTo) station.classList.add('failed');

      const netClass = net > 0 ? 'positive' : net < 0 ? 'negative' : 'zero';
      station.innerHTML = `
        <div class="gas-station-head">站 ${index}</div>
        <div class="gas-station-row"><span>⛽</span><span>${gasValue}</span></div>
        <div class="gas-station-row"><span>⛽</span><span>-${costValue}</span></div>
        <div class="gas-net ${netClass}">净: ${net >= 0 ? '+' : ''}${net}</div>
        <div class="gas-start-marker">▣<br>起点</div>
      `;

      trackEl.appendChild(station);
    });
  }

  private renderExecutionLog(step: GasStationStep): void {
    if (!this.logEl) return;

    const prefix = `[${String(this.currentIndex + 1).padStart(2, '0')}/${String(this.steps.length).padStart(2, '0')}]`;
    const entry = `${prefix} ${step.log}`;
    this.logs = this.steps.slice(0, this.currentIndex + 1).map((item, index) => {
      const itemPrefix = `[${String(index + 1).padStart(2, '0')}/${String(this.steps.length).padStart(2, '0')}]`;
      return `${itemPrefix} ${item.log}`;
    });

    this.logEl.innerHTML = '';
    this.logs.forEach((line) => {
      const lineEl = document.createElement('div');
      lineEl.className = `gas-log-line${line === entry ? ' active' : ''}`;
      lineEl.textContent = line;
      this.logEl!.appendChild(lineEl);
    });

    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  private updateResultBanner(step: GasStationStep): void {
    if (!this.messageEl) return;
    this.messageEl.classList.toggle('failed', step.status === 'failed');
  }
}

registerAlgorithm({
  id: 'gas-station',
  name: '加油站',
  viewId: 'algo-gas-station-view',
  category: 'greedy',
  description: 'LeetCode 134：贪心算法，从某个加油站出发，绕环路一圈返回起点',
  icon: '⛽',
  template,
  Visualizer: GasStationVisualizer,
  difficulty: 2,
  levelOrder: 8,
  learningGoal: '掌握加油站可行起点的贪心推导',
});
