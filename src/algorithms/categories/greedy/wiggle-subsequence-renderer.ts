/**
 * 摆动序列可视化器（贪心算法）— 4-Card 标准现代架构
 * LeetCode 376：贪心删除单调坡与平坡中间节点，统计波峰波谷数量
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  WIGGLE_SUBSEQUENCE_PROBLEM_HTML,
  WIGGLE_SUBSEQUENCE_ANALYSIS_HTML,
  WIGGLE_SUBSEQUENCE_CODE_LANGUAGES,
} from './wiggle-subsequence-problem-content';
import template from './wiggle-subsequence.html?raw';

export interface WiggleStep {
  array: number[];
  currentIndex: number;
  length: number;
  trend: '↑' | '↓' | '-';
  curDiff: number;
  prevDiff: number;
  wiggleIndices: number[];
  skippedIndices: number[];
  message: string;
  action: 'init' | 'peak_or_valley' | 'flat_or_mono' | 'done';
  codeLine: number;
}

export function wiggleSubsequenceSteps(nums: number[]): WiggleStep[] {
  const steps: WiggleStep[] = [];
  const n = nums.length;

  if (n <= 1) {
    steps.push({
      array: [...nums],
      currentIndex: 0,
      length: n,
      trend: '-',
      curDiff: 0,
      prevDiff: 0,
      wiggleIndices: n === 1 ? [0] : [],
      skippedIndices: [],
      message: n === 0 ? '空数组，摆动长度为 0' : `单元素数组 [${nums[0]}]，摆动长度为 1`,
      action: 'done',
      codeLine: 2,
    });
    return steps;
  }

  let count = 1;
  let prevDiff = 0;
  const wiggleIndices: number[] = [0];
  const skippedIndices: number[] = [];

  steps.push({
    array: [...nums],
    currentIndex: 0,
    length: count,
    trend: '-',
    curDiff: 0,
    prevDiff: 0,
    wiggleIndices: [...wiggleIndices],
    skippedIndices: [...skippedIndices],
    message: `初始化：默认选中首元素 nums[0]=${nums[0]}，当前摆动序列长度 = 1`,
    action: 'init',
    codeLine: 4,
  });

  for (let i = 0; i < n - 1; i++) {
    const curDiff = nums[i + 1] - nums[i];
    let trend: '↑' | '↓' | '-' = '-';
    if (curDiff > 0) trend = '↑';
    else if (curDiff < 0) trend = '↓';

    const isPeakOrValley = (prevDiff <= 0 && curDiff > 0) || (prevDiff >= 0 && curDiff < 0);

    if (isPeakOrValley) {
      count++;
      wiggleIndices.push(i + 1);

      steps.push({
        array: [...nums],
        currentIndex: i + 1,
        length: count,
        trend,
        curDiff,
        prevDiff,
        wiggleIndices: [...wiggleIndices],
        skippedIndices: [...skippedIndices],
        message: `检查差值：prevDiff=${prevDiff}，curDiff=${curDiff} (${trend}) → 出现摆动转折峰谷！保留节点 nums[${i + 1}]=${nums[i + 1]}，长度更新为 ${count}`,
        action: 'peak_or_valley',
        codeLine: 7,
      });

      prevDiff = curDiff;
    } else {
      skippedIndices.push(i + 1);

      steps.push({
        array: [...nums],
        currentIndex: i + 1,
        length: count,
        trend,
        curDiff,
        prevDiff,
        wiggleIndices: [...wiggleIndices],
        skippedIndices: [...skippedIndices],
        message: `检查差值：prevDiff=${prevDiff}，curDiff=${curDiff} (${trend}) → 单调斜坡/平坡连续延伸，贪心过滤中间节点 nums[${i + 1}]=${nums[i + 1]}`,
        action: 'flat_or_mono',
        codeLine: 6,
      });
    }
  }

  steps.push({
    array: [...nums],
    currentIndex: n - 1,
    length: count,
    trend: '-',
    curDiff: 0,
    prevDiff,
    wiggleIndices: [...wiggleIndices],
    skippedIndices: [...skippedIndices],
    message: `遍历完成！最长摆动子序列长度为 ${count}，选中节点集合: [${wiggleIndices.map((idx) => nums[idx]).join(', ')}]`,
    action: 'done',
    codeLine: 12,
  });

  return steps;
}

export class WiggleSubsequenceVisualizer extends StepVisualizer<WiggleStep> {
  protected codeLanguages = WIGGLE_SUBSEQUENCE_CODE_LANGUAGES;
  protected codeLines = WIGGLE_SUBSEQUENCE_CODE_LANGUAGES['java'];
  protected codePanelTitle = '摆动序列 代码调试';

  private waveformContainer: HTMLElement | null = null;
  private diffContainer: HTMLElement | null = null;
  private peakMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.waveformContainer = this.root.querySelector('#ws-waveform-container');
    this.diffContainer = this.root.querySelector('#ws-diff-container');
    this.peakMonitorContainer = this.root.querySelector('#ws-peak-monitor-container');
    this.metricsContainer = this.root.querySelector('#ws-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.ws-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const numsEl = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
        if (numsEl && btn.dataset.nums) numsEl.value = btn.dataset.nums;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: WIGGLE_SUBSEQUENCE_PROBLEM_HTML,
      analysisHtml: WIGGLE_SUBSEQUENCE_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): WiggleStep[] {
    const numsEl = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
    const rawNums = (numsEl?.value || '1,7,4,9,2,5')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    const nums = rawNums.length > 0 ? rawNums : [1, 7, 4, 9, 2, 5];
    return wiggleSubsequenceSteps(nums);
  }

  protected renderStep(step: WiggleStep): void {
    const arr = step.array;
    const n = arr.length;

    // 1. 渲染波形折线图沙盘 (Card 1)
    if (this.waveformContainer && n > 0) {
      const minVal = Math.min(...arr);
      const maxVal = Math.max(...arr);
      const valRange = maxVal - minVal || 1;

      const svgWidth = 420;
      const svgHeight = 160;
      const padX = 30;
      const padY = 25;

      const points = arr.map((val, idx) => {
        const x = padX + (idx / Math.max(1, n - 1)) * (svgWidth - padX * 2);
        const y = svgHeight - padY - ((val - minVal) / valRange) * (svgHeight - padY * 2);
        return { x, y, val, idx };
      });

      // 折线路径
      const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

      // 节点圆圈与标注
      const nodesSvg = points
        .map((p) => {
          const isWiggle = step.wiggleIndices.includes(p.idx);
          const isSkipped = step.skippedIndices.includes(p.idx);
          const isCurrent = p.idx === step.currentIndex && step.action !== 'done';

          let stroke = '#cbd5e1';
          let fill = '#ffffff';
          let r = 5;

          if (isCurrent) {
            stroke = '#2563eb';
            fill = '#3b82f6';
            r = 8;
          } else if (isWiggle) {
            stroke = '#059669';
            fill = '#10b981';
            r = 6.5;
          } else if (isSkipped) {
            stroke = '#94a3b8';
            fill = '#e2e8f0';
            r = 4;
          }

          return `
            <g>
              <circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />
              <text x="${p.x}" y="${p.y - 10}" fill="${isWiggle ? '#059669' : '#64748b'}" font-size="10.5" font-family="JetBrains Mono" font-weight="${isWiggle ? '800' : '600'}" text-anchor="middle">
                ${p.val}
              </text>
              <text x="${p.x}" y="${svgHeight - 6}" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono" text-anchor="middle">
                [${p.idx}]
              </text>
            </g>
          `;
        })
        .join('');

      this.waveformContainer.innerHTML = `
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: 100%; overflow: visible;" preserveAspectRatio="xMidYMid meet">
          <!-- 背景网格线 -->
          <line x1="${padX}" y1="${svgHeight - padY}" x2="${svgWidth - padX}" y2="${svgHeight - padY}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3 3" />
          <line x1="${padX}" y1="${padY}" x2="${svgWidth - padX}" y2="${padY}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3 3" />
          
          <!-- 折线 -->
          <path d="${linePath}" fill="none" stroke="#93c5fd" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />

          <!-- 节点与标签 -->
          ${nodesSvg}
        </svg>
      `;
    }

    // 2. 渲染差值与坡度状态 (Card 2 Left)
    if (this.diffContainer) {
      this.diffContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>当前差值 <code style="color:#2563eb; font-weight:700;">curDiff</code>:</span>
            <span style="font-family: monospace; font-weight:700; color: ${step.curDiff > 0 ? '#10b981' : step.curDiff < 0 ? '#dc2626' : '#64748b'};">
              ${step.curDiff > 0 ? `+${step.curDiff} (↑ 上升)` : step.curDiff < 0 ? `${step.curDiff} (↓ 下降)` : '0 (平坡)'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>上一摆动差值 <code style="color:#64748b; font-weight:700;">preDiff</code>:</span>
            <span style="font-family: monospace; font-weight:700;">${step.prevDiff}</span>
          </div>
        </div>
      `;
    }

    // 3. 渲染峰谷翻转判定监视器 (Card 2 Center)
    if (this.peakMonitorContainer) {
      const isPeak = step.action === 'peak_or_valley';
      const isFlat = step.action === 'flat_or_mono';

      this.peakMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>摆动判定:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isPeak ? '#ecfdf5' : isFlat ? '#fef2f2' : '#eff6ff'}; color: ${isPeak ? '#059669' : isFlat ? '#dc2626' : '#2563eb'}; border: 1px solid ${isPeak ? '#a7f3d0' : isFlat ? '#fecaca' : '#bfdbfe'};">
              ${isPeak ? '⛰️ 构成波峰/波谷 (保留)' : isFlat ? '🚫 单调坡/平坡 (删除)' : '🏁 初始起点'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 翻转规则: <code style="color:#b45309; font-family:monospace;">(cur > 0 &amp;&amp; pre &le; 0) || (cur < 0 &amp;&amp; pre &ge; 0)</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染摆动序列构成与指标 (Card 2 Bottom)
    if (this.metricsContainer) {
      const wiggleSequence = step.wiggleIndices.map((i) => arr[i]);
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>当前摆动长度: <strong style="color: #0f172a; font-family: monospace; font-size: 13px;">${step.length}</strong></span>
            <span style="font-family: monospace; font-weight: 700; color: #059669;">[${wiggleSequence.join(', ')}]</span>
          </div>
        </div>
      `;
    }

    const badgeCount = this.root?.querySelector('#badge-wiggle-count');
    if (badgeCount) {
      badgeCount.textContent = `摆动长度: ${step.length}`;
    }

    // 7. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '步骤';

        if (st.action === 'peak_or_valley') {
          badgeColor = '#059669';
          badgeBg = '#ecfdf5';
          badgeText = '摆动';
        } else if (st.action === 'flat_or_mono') {
          badgeColor = '#dc2626';
          badgeBg = '#fef2f2';
          badgeText = '消除';
        } else if (st.action === 'done') {
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
    if (this.waveformContainer) this.waveformContainer.innerHTML = '';
  }
}

registerAlgorithm({
  id: 'wiggle-subsequence',
  name: '摆动序列',
  viewId: 'algo-wiggle-subsequence-view',
  category: 'greedy',
  description: '求最长摆动子序列，贪心过滤单调坡度与平坡，只统计波峰波谷',
  icon: '〰️',
  template,
  Visualizer: WiggleSubsequenceVisualizer,
  difficulty: 2,
  levelOrder: 2,
  learningGoal: '掌握贪心算法在波形折线分析中的局部最优（保留峰谷）到全局最长的转化',
});
