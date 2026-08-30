/**
 * 加油站可视化器（贪心算法）— 4-Card 标准现代架构
 * LeetCode 134：维护当前候选起点油量 curSum 与全局净油量 totalSum，亏空时贪心重置起点为 i + 1
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  GAS_STATION_PROBLEM_HTML,
  GAS_STATION_ANALYSIS_HTML,
  GAS_STATION_CODE_LANGUAGES,
} from './gas-station-problem-content';
import template from './gas-station.html?raw';

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

/* ── Visualizer class ─────────────────────────────────────── */
export class GasStationVisualizer extends StepVisualizer<GasStationStep> {
  protected codeLanguages = GAS_STATION_CODE_LANGUAGES;
  protected codeLines = GAS_STATION_CODE_LANGUAGES['java'];
  protected codePanelTitle = '加油站 代码调试';

  private sandboxContainer: HTMLElement | null = null;
  private tankContainer: HTMLElement | null = null;
  private resetMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#gs-sandbox-container');
    this.tankContainer = this.root.querySelector('#gs-tank-container');
    this.resetMonitorContainer = this.root.querySelector('#gs-reset-monitor-container');
    this.metricsContainer = this.root.querySelector('#gs-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.gs-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const gasEl = this.root?.querySelector('#input-gas') as HTMLInputElement | null;
        const costEl = this.root?.querySelector('#input-cost') as HTMLInputElement | null;
        if (gasEl && btn.dataset.gas) gasEl.value = btn.dataset.gas;
        if (costEl && btn.dataset.cost) costEl.value = btn.dataset.cost;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: GAS_STATION_PROBLEM_HTML,
      analysisHtml: GAS_STATION_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): GasStationStep[] {
    const gasEl = this.root?.querySelector('#input-gas') as HTMLInputElement | null;
    const costEl = this.root?.querySelector('#input-cost') as HTMLInputElement | null;

    const gas = (gasEl?.value || '1,2,3,4,5')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    const cost = (costEl?.value || '3,4,5,1,2')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    return buildGasStationSteps(gas.length ? gas : [1, 2, 3, 4, 5], cost.length ? cost : [3, 4, 5, 1, 2]);
  }

  protected renderStep(step: GasStationStep): void {
    const gas = step.gas;
    const cost = step.cost;
    const n = gas.length;

    // 1. 渲染加油站沙盘 (Card 1)
    if (this.sandboxContainer && n > 0) {
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

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <!-- 总体状况栏 -->
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
            <span>当前候选起点: <strong style="color: #d97706; font-family: monospace;">[${step.startStation >= 0 && step.startStation < n ? step.startStation : '-'}]</strong></span>
            <span>全局净油量: <strong style="color: ${step.totalTank >= 0 ? '#059669' : '#dc2626'}; font-family: monospace;">${step.totalTank >= 0 ? `+${step.totalTank}` : step.totalTank}L</strong></span>
          </div>
        </div>

        <!-- 站点水平流 -->
        <div style="display: flex; gap: 8px; overflow-x: auto; justify-content: center; padding: 4px 0;">
          ${stationsHtml}
        </div>
      `;
    }

    // 2. 渲染当前油箱续航 (Card 2 Left)
    if (this.tankContainer) {
      this.tankContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>当前从起点出发累积油量:</span>
            <span style="font-family: monospace; font-weight:800; color: ${step.currentTank >= 0 ? '#059669' : '#dc2626'}; font-size: 12.5px;">${step.currentTank} L</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>全局累积净油量 totalSum:</span>
            <span style="font-family: monospace; font-weight:700; color: #475569;">${step.totalTank} L</span>
          </div>
        </div>
      `;
    }

    // 3. 渲染亏空重置监视器 (Card 2 Center)
    if (this.resetMonitorContainer) {
      const isReset = step.action === 'reset';
      const isSuccess = step.action === 'success';
      const isFailed = step.action === 'failed';

      this.resetMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>续航状态:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isReset ? '#fef2f2' : isSuccess ? '#ecfdf5' : isFailed ? '#fff1f2' : '#eff6ff'}; color: ${isReset ? '#dc2626' : isSuccess ? '#059669' : isFailed ? '#e11d48' : '#2563eb'}; border: 1px solid ${isReset ? '#fecaca' : isSuccess ? '#a7f3d0' : isFailed ? '#fecdd3' : '#bfdbfe'};">
              ${isReset ? '⚠️ 亏空断油 (起点移至 i+1)' : isSuccess ? '🎉 环行成功 (锁定起点)' : isFailed ? '❌ 全局油量不足 (返回 -1)' : '⛽ 油箱正常续航'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 贪心准则: <code style="color:#d97706; font-family:monospace;">if (curSum &lt; 0) { start = i + 1; curSum = 0; }</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染全局收支与唯一有效起点看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>可行出发加油站: <strong style="color: #d97706; font-family: monospace; font-size: 13.5px;">${step.startStation >= 0 ? `下标 [${step.startStation}]` : '-1 (无解)'}</strong></span>
            <span style="font-size: 10.5px; font-weight: 700; color: ${step.totalTank >= 0 ? '#059669' : '#dc2626'};">
              ${step.totalTank >= 0 ? '✓ 全局油量盈余' : '✕ 全局总补给小于总消耗'}
            </span>
          </div>
        </div>
      `;
    }

    const badgeStart = this.root?.querySelector('#badge-start-station');
    if (badgeStart) {
      badgeStart.textContent = `候选起点: ${step.startStation >= 0 ? `[${step.startStation}]` : '-1'}`;
    }


    // 7. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '考察';

        if (st.action === 'reset') {
          badgeColor = '#dc2626';
          badgeBg = '#fef2f2';
          badgeText = '重置';
        } else if (st.action === 'success') {
          badgeColor = '#059669';
          badgeBg = '#ecfdf5';
          badgeText = '成功';
        } else if (st.action === 'failed') {
          badgeColor = '#e11d48';
          badgeBg = '#fff1f2';
          badgeText = '无解';
        }

        return `
          <div style="display: flex; align-items: flex-start; gap: 6px; padding: 3px 0; border-bottom: 1px solid #f8fafc; font-size: 11px;">
            <span style="color: #94a3b8; font-family: monospace; font-size: 10px; min-width: 24px;">#${idx + 1}</span>
            <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 1px 5px; border-radius: 4px; font-weight: 700; font-size: 10px;">${badgeText}</span>
            <span style="color: #334155; flex: 1;">${st.message}</span>
          </div>
        `;
      });

      this.logContainer.innerHTML = logs.join('');
      this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }
    if (this.logCountEl) {
      this.logCountEl.textContent = `${this.currentIndex + 1} / ${this.steps.length} 记录`;
    }
  }

  public reset(): void {
    super.reset();
    if (this.sandboxContainer) this.sandboxContainer.innerHTML = '';
  }
}

registerAlgorithm({
  id: 'gas-station',
  name: '加油站',
  viewId: 'algo-gas-station-view',
  category: 'greedy',
  description: '求绕环形路线行驶一周的唯一起点，累积净油量亏空即贪心将起点推进至 i + 1',
  icon: '⛽',
  template,
  Visualizer: GasStationVisualizer,
  difficulty: 2,
  levelOrder: 12,
  learningGoal: '掌握环形路线贪心跳跃技巧，理解局部亏空排除法与全局收支判定的协同运用',
});
