/**
 * 最大子数组和可视化器（贪心算法 Kadane）— 4-Card 标准现代架构
 * LeetCode 53：连续和为负数时果断清零，贪心捕捉全局峰值
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  MAX_SUBARRAY_PROBLEM_HTML,
  MAX_SUBARRAY_ANALYSIS_HTML,
  MAX_SUBARRAY_CODE_LANGUAGES,
} from './max-subarray-problem-content';
import template from './max-subarray.html?raw';

export type MSPhase = 'init' | 'reset' | 'extend' | 'new-max' | 'done';

export interface MSSStep {
  array: number[];
  currentIndex: number;
  currentSum: number;
  maxSum: number;
  maxStart: number;
  maxEnd: number;
  currentStart: number;
  phase: MSPhase;
  message: string;
  log: string;
  codeLine: number;
}

export function buildMaxSubarraySteps(arr: number[]): MSSStep[] {
  const steps: MSSStep[] = [];
  const n = arr.length;
  if (n === 0) {
    steps.push({
      array: [],
      currentIndex: -1,
      currentSum: 0,
      maxSum: 0,
      maxStart: -1,
      maxEnd: -1,
      currentStart: -1,
      phase: 'done',
      message: '输入为空，返回 0',
      log: 'init: empty',
      codeLine: 2,
    });
    return steps;
  }

  let currentSum = 0;
  let maxSum = arr[0];
  let maxStart = 0;
  let maxEnd = 0;
  let currentStart = 0;

  steps.push({
    array: [...arr],
    currentIndex: -1,
    currentSum: 0,
    maxSum,
    maxStart: 0,
    maxEnd: 0,
    currentStart: 0,
    phase: 'init',
    message: `初始化：nums = [${arr.join(', ')}]，初始最大和 maxSum = ${maxSum}`,
    log: `init: max=${maxSum}, cur=0`,
    codeLine: 3,
  });

  for (let i = 0; i < n; i++) {
    currentSum += arr[i];

    if (currentSum > maxSum) {
      maxSum = currentSum;
      maxStart = currentStart;
      maxEnd = i;
      steps.push({
        array: [...arr],
        currentIndex: i,
        currentSum,
        maxSum,
        maxStart,
        maxEnd,
        currentStart,
        phase: 'new-max',
        message: `★ 刷新全局最大和！nums[${i}]=${arr[i]}，当前累加和=${currentSum}，刷新最高值 maxSum=${maxSum} [${maxStart}..${maxEnd}]`,
        log: `new-max @ ${i}: max=${maxSum}, range=[${maxStart}..${maxEnd}]`,
        codeLine: 8,
      });
    } else {
      steps.push({
        array: [...arr],
        currentIndex: i,
        currentSum,
        maxSum,
        maxStart,
        maxEnd,
        currentStart,
        phase: 'extend',
        message: `➕ 加入 nums[${i}]=${arr[i]}，当前区间和 currentSum=${currentSum} (未超过历史最大和 ${maxSum})`,
        log: `extend @ ${i}: +${arr[i]}, cur=${currentSum}`,
        codeLine: 7,
      });
    }

    if (currentSum < 0) {
      currentSum = 0;
      currentStart = i + 1;
      steps.push({
        array: [...arr],
        currentIndex: i,
        currentSum: 0,
        maxSum,
        maxStart,
        maxEnd,
        currentStart,
        phase: 'reset',
        message: `⚠️ 负和拉低：当前累加和 < 0，只会拖累后续求和，贪心清零 count=0，重置下一区间起点为 ${i + 1}`,
        log: `reset @ ${i}: curSum -> 0, next_start=${i + 1}`,
        codeLine: 11,
      });
    }
  }

  steps.push({
    array: [...arr],
    currentIndex: n - 1,
    currentSum,
    maxSum,
    maxStart,
    maxEnd,
    currentStart,
    phase: 'done',
    message: `🎉 扫描完成！最大连续子数组和为 ${maxSum}，对应区间为 nums[${maxStart}..${maxEnd}]`,
    log: `done: max=${maxSum}, range=[${maxStart}..${maxEnd}]`,
    codeLine: 14,
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class MaxSubarrayVisualizer extends StepVisualizer<MSSStep> {
  protected codeLanguages = MAX_SUBARRAY_CODE_LANGUAGES;
  protected codeLines = MAX_SUBARRAY_CODE_LANGUAGES['java'];
  protected codePanelTitle = '最大子数组和 代码调试';

  private barsContainer: HTMLElement | null = null;
  private sumContainer: HTMLElement | null = null;
  private resetMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.barsContainer = this.root.querySelector('#ms-bars-container');
    this.sumContainer = this.root.querySelector('#ms-sum-container');
    this.resetMonitorContainer = this.root.querySelector('#ms-reset-monitor-container');
    this.metricsContainer = this.root.querySelector('#ms-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.ms-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const numsEl = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
        if (numsEl && btn.dataset.nums) numsEl.value = btn.dataset.nums;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: MAX_SUBARRAY_PROBLEM_HTML,
      analysisHtml: MAX_SUBARRAY_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): MSSStep[] {
    const numsEl = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
    const rawNums = (numsEl?.value || '-2,1,-3,4,-1,2,1,-5,4')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    const nums = rawNums.length > 0 ? rawNums : [-2, 1, -3, 4, -1, 2, 1, -5, 4];
    return buildMaxSubarraySteps(nums);
  }

  protected renderStep(step: MSSStep): void {
    const arr = step.array;
    const n = arr.length;

    // 1. 渲染柱状图与区间沙盘 (Card 1)
    if (this.barsContainer && n > 0) {
      const isDone = step.phase === 'done';
      const curIdx = step.currentIndex;
      const curStart = step.currentStart;
      const maxStart = step.maxStart;
      const maxEnd = step.maxEnd;

      const maxAbs = Math.max(...arr.map((v) => Math.abs(v)), 1);

      const barsHtml = arr
        .map((val, idx) => {
          const isCurrentCursor = !isDone && idx === curIdx;
          const isInCurrentWindow = !isDone && idx >= curStart && idx <= curIdx;
          const isInBestWindow = isDone || (idx >= maxStart && idx <= maxEnd);

          const barHeight = Math.max(12, (Math.abs(val) / maxAbs) * 60);

          let barBg = '#94a3b8';
          let borderColor = '#cbd5e1';
          let textColor = '#0f172a';

          if (isCurrentCursor) {
            barBg = '#3b82f6';
            borderColor = '#1d4ed8';
            textColor = '#1d4ed8';
          } else if (isInBestWindow && isDone) {
            barBg = '#10b981';
            borderColor = '#059669';
            textColor = '#059669';
          } else if (isInCurrentWindow) {
            barBg = '#60a5fa';
            borderColor = '#3b82f6';
            textColor = '#2563eb';
          } else if (val < 0) {
            barBg = '#f87171';
            borderColor = '#ef4444';
            textColor = '#dc2626';
          }

          return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <span style="font-size: 10px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace;">
                ${val}
              </span>
              <div style="width: 28px; height: 70px; display: flex; align-items: ${val >= 0 ? 'flex-end' : 'flex-start'}; justify-content: center; background: #f1f5f9; border-radius: 6px; padding: 2px;">
                <div style="width: 100%; height: ${barHeight}px; background: ${barBg}; border: 1px solid ${borderColor}; border-radius: 4px; transition: all 0.15s;"></div>
              </div>
              <span style="font-size: 8.5px; color: ${isCurrentCursor ? '#2563eb' : '#94a3b8'}; font-weight: 700; font-family: monospace;">
                [${idx}]
              </span>
            </div>
          `;
        })
        .join('');

      this.barsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; width: 100%; gap: 8px;">
          <div style="display: flex; gap: 6px; overflow-x: auto; justify-content: center; padding-bottom: 4px;">
            ${barsHtml}
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 10.5px; color: #64748b; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <span>当前扫描区间: <strong style="color:#2563eb; font-family:monospace;">[${curStart}..${curIdx >= 0 ? curIdx : 0}]</strong></span>
            <span>历史最大区间: <strong style="color:#059669; font-family:monospace;">[${maxStart}..${maxEnd}]</strong></span>
          </div>
        </div>
      `;
    }

    // 2. 渲染累加和状态 (Card 2 Left)
    if (this.sumContainer) {
      this.sumContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>当前连续和 <code style="color:#2563eb; font-weight:700;">count</code>:</span>
            <span style="font-family: monospace; font-weight:700; color: ${step.currentSum > 0 ? '#10b981' : step.currentSum < 0 ? '#dc2626' : '#64748b'};">
              ${step.currentSum}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>历史最大和 <code style="color:#059669; font-weight:700;">maxSum</code>:</span>
            <span style="font-family: monospace; font-weight:800; color:#059669;">${step.maxSum}</span>
          </div>
        </div>
      `;
    }

    // 3. 渲染贪心判定监视器 (Card 2 Center)
    if (this.resetMonitorContainer) {
      const isNewMax = step.phase === 'new-max';
      const isReset = step.phase === 'reset';

      this.resetMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>状态判定:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isNewMax ? '#ecfdf5' : isReset ? '#fef2f2' : '#eff6ff'}; color: ${isNewMax ? '#059669' : isReset ? '#dc2626' : '#2563eb'}; border: 1px solid ${isNewMax ? '#a7f3d0' : isReset ? '#fecaca' : '#bfdbfe'};">
              ${isNewMax ? '★ 刷新最高和' : isReset ? '⚠️ 负和清零 (重置)' : '➕ 正常累加'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 贪心准则: 连续和 count &lt; 0 时从下一位置重新累加</div>
          </div>
        </div>
      `;
    }

    // 4. 渲染全局最优指标 (Card 2 Bottom)
    if (this.metricsContainer) {
      const bestSubarray = arr.slice(step.maxStart, step.maxEnd + 1);
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>最大子数组和: <strong style="color: #0f172a; font-family: monospace; font-size: 13px;">${step.maxSum}</strong></span>
            <span style="font-family: monospace; font-weight: 700; color: #059669;">nums[${step.maxStart}..${step.maxEnd}] = [${bestSubarray.join(', ')}]</span>
          </div>
        </div>
      `;
    }

    const badgeMax = this.root?.querySelector('#badge-max-sum');
    if (badgeMax) {
      badgeMax.textContent = `最大和: ${step.maxSum}`;
    }


    // 7. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '累加';

        if (st.phase === 'new-max') {
          badgeColor = '#059669';
          badgeBg = '#ecfdf5';
          badgeText = '峰值';
        } else if (st.phase === 'reset') {
          badgeColor = '#dc2626';
          badgeBg = '#fef2f2';
          badgeText = '清零';
        } else if (st.phase === 'done') {
          badgeColor = '#2563eb';
          badgeBg = '#eff6ff';
          badgeText = '完成';
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
    if (this.barsContainer) this.barsContainer.innerHTML = '';
  }
}

registerAlgorithm({
  id: 'max-subarray',
  name: '最大子数组和',
  viewId: 'algo-max-subarray-view',
  category: 'greedy',
  description: 'Kadane 贪心算法，连续累加和小于 0 时立即清零重新统计',
  icon: '📊',
  template,
  Visualizer: MaxSubarrayVisualizer,
  difficulty: 2,
  levelOrder: 3,
  learningGoal: '掌握贪心算法在连续子数组求和中的局部最优（负和清零）与全局最优（最大和）',
});
