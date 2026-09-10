/**
 * 无重叠区间可视化器（贪心算法）— 4-Card 标准现代架构
 * LeetCode 435：按左端点升序排序，重叠时贪心移除右端点更大的区间，求最少移除数
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  NON_OVERLAPPING_PROBLEM_HTML,
  NON_OVERLAPPING_ANALYSIS_HTML,
  NON_OVERLAPPING_CODE_LANGUAGES,
} from './non-overlapping-problem-content';
import template from './non-overlapping.html?raw';

export interface NonOverlappingStep {
  intervals: Array<[number, number]>;
  currentIndex: number;
  removedCount: number;
  removedIndices: number[];
  keptIndices: number[];
  currentEnd: number;
  action: 'init' | 'sort' | 'keep' | 'remove' | 'done';
  message: string;
  codeLine: number;
}

export function buildNonOverlappingSteps(rawIntervals: Array<[number, number]>): NonOverlappingStep[] {
  const steps: NonOverlappingStep[] = [];
  const n = rawIntervals.length;

  if (n === 0) {
    steps.push({
      intervals: [],
      currentIndex: -1,
      removedCount: 0,
      removedIndices: [],
      keptIndices: [],
      currentEnd: 0,
      action: 'done',
      message: '输入为空，需移除区间数为 0',
      codeLine: 2,
    });
    return steps;
  }

  // 1. 按左边界升序排序
  const intervals = rawIntervals.map(([s, e]) => [s, e] as [number, number]).sort((a, b) => a[0] - b[0]);
  let count = 0;
  const removedIndices: number[] = [];
  const keptIndices: number[] = [0];

  steps.push({
    intervals: intervals.map(([s, e]) => [s, e]),
    currentIndex: 0,
    removedCount: 0,
    removedIndices: [],
    keptIndices: [0],
    currentEnd: intervals[0][1],
    action: 'sort',
    message: `第 1 步：按左边界升序排序：${intervals.map((i) => `[${i[0]},${i[1]}]`).join(', ')}，默认保留首个区间`,
    codeLine: 4,
  });

  for (let i = 1; i < n; i++) {
    const cur = intervals[i];
    const prevEnd = intervals[i - 1][1];

    if (cur[0] < prevEnd) {
      count++;
      removedIndices.push(i);
      intervals[i][1] = Math.min(prevEnd, cur[1]);

      steps.push({
        intervals: intervals.map(([s, e]) => [s, e]),
        currentIndex: i,
        removedCount: count,
        removedIndices: [...removedIndices],
        keptIndices: [...keptIndices],
        currentEnd: intervals[i][1],
        action: 'remove',
        message: `🗑️ 发生重叠！区间 [${i}]=[${cur[0]}, ${cur[1]}] 左端点 ${cur[0]} < 前界 ${prevEnd}，贪心移除右界较大者，累计移除 ${count} 个`,
        codeLine: 8,
      });
    } else {
      keptIndices.push(i);

      steps.push({
        intervals: intervals.map(([s, e]) => [s, e]),
        currentIndex: i,
        removedCount: count,
        removedIndices: [...removedIndices],
        keptIndices: [...keptIndices],
        currentEnd: cur[1],
        action: 'keep',
        message: `✓ 互不重叠！区间 [${i}]=[${cur[0]}, ${cur[1]}] 左端点 ${cur[0]} &ge; ${prevEnd}，安全保留`,
        codeLine: 7,
      });
    }
  }

  steps.push({
    intervals: intervals.map(([s, e]) => [s, e]),
    currentIndex: n - 1,
    removedCount: count,
    removedIndices: [...removedIndices],
    keptIndices: [...keptIndices],
    currentEnd: intervals[n - 1][1],
    action: 'done',
    message: `🎉 扫描完成！最少需要移除 ${count} 个区间，剩余 ${n - count} 个区间互不重叠`,
    codeLine: 12,
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class NonOverlappingVisualizer extends StepVisualizer<NonOverlappingStep> {
  protected codeLanguages = NON_OVERLAPPING_CODE_LANGUAGES;
  protected codeLines = NON_OVERLAPPING_CODE_LANGUAGES['java'];
  protected codePanelTitle = '无重叠区间 代码调试';

  private sandboxContainer: HTMLElement | null = null;
  private intervalContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#no-sandbox-container');
    this.intervalContainer = this.root.querySelector('#no-interval-container');
    this.decisionMonitorContainer = this.root.querySelector('#no-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#no-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.no-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const intEl = this.root?.querySelector('#input-intervals') as HTMLInputElement | null;
        if (intEl && btn.dataset.intervals) intEl.value = btn.dataset.intervals;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: NON_OVERLAPPING_PROBLEM_HTML,
      analysisHtml: NON_OVERLAPPING_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): NonOverlappingStep[] {
    const intEl = this.root?.querySelector('#input-intervals') as HTMLInputElement | null;
    let intervals: Array<[number, number]> = [];
    try {
      const parsed = JSON.parse(intEl?.value || '[[1,2],[2,3],[3,4],[1,3]]');
      if (Array.isArray(parsed) && parsed.every((p) => Array.isArray(p) && p.length >= 2)) {
        intervals = parsed.map((p) => [Number(p[0]), Number(p[1])]);
      }
    } catch {
      intervals = [
        [1, 2],
        [2, 3],
        [3, 4],
        [1, 3],
      ];
    }

    return buildNonOverlappingSteps(intervals);
  }

  protected renderStep(step: NonOverlappingStep): void {
    const intervals = step.intervals;
    const n = intervals.length;

    // 1. 渲染区间沙盘 (Card 1)
    if (this.sandboxContainer && n > 0) {
      const minX = Math.min(...intervals.map((b) => b[0]));
      const maxX = Math.max(...intervals.map((b) => b[1]));
      const xRange = maxX - minX || 1;

      const svgWidth = 420;
      const svgHeight = 160;
      const padX = 35;
      const rowHeight = Math.min(24, (svgHeight - 40) / n);

      const intervalSvgs = intervals
        .map(([s, e], idx) => {
          const x1 = padX + ((s - minX) / xRange) * (svgWidth - padX * 2);
          const x2 = padX + ((e - minX) / xRange) * (svgWidth - padX * 2);
          const width = Math.max(12, x2 - x1);
          const y = 20 + idx * rowHeight;

          const isCurrent = idx === step.currentIndex && step.action !== 'done';
          const isRemoved = step.removedIndices.includes(idx);
          const isKept = step.keptIndices.includes(idx);

          let fill = '#f1f5f9';
          let stroke = '#cbd5e1';
          let textColor = '#64748b';
          let dash = '';

          if (isCurrent) {
            fill = '#dbeafe';
            stroke = '#2563eb';
            textColor = '#1d4ed8';
          } else if (isRemoved) {
            fill = '#fee2e2';
            stroke = '#ef4444';
            textColor = '#dc2626';
            dash = 'stroke-dasharray="3 2"';
          } else if (isKept) {
            fill = '#ecfdf5';
            stroke = '#10b981';
            textColor = '#059669';
          }

          return `
            <g>
              <rect x="${x1}" y="${y}" width="${width}" height="${rowHeight - 6}" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="1.5" ${dash} />
              <text x="${x1 + width / 2}" y="${y + rowHeight / 2 - 1}" fill="${textColor}" font-size="9.5" font-family="JetBrains Mono" font-weight="700" text-anchor="middle" dominant-baseline="middle">
                ${isRemoved ? '❌ ' : isKept ? '✓ ' : ''}[${s}, ${e}]
              </text>
            </g>
          `;
        })
        .join('');

      this.sandboxContainer.innerHTML = `
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: 100%; overflow: visible;" preserveAspectRatio="xMidYMid meet">
          <!-- 底部坐标标尺 -->
          <line x1="${padX}" y1="${svgHeight - 15}" x2="${svgWidth - padX}" y2="${svgHeight - 15}" stroke="#cbd5e1" stroke-width="1.5" />
          <text x="${padX}" y="${svgHeight - 2}" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono">x=${minX}</text>
          <text x="${svgWidth - padX}" y="${svgHeight - 2}" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono" text-anchor="end">x=${maxX}</text>

          <!-- 区间块 -->
          ${intervalSvgs}
        </svg>
      `;
    }

    // 2. 渲染当前考察区间与右边界 (Card 2 Left)
    if (this.intervalContainer) {
      const cur = step.currentIndex >= 0 && step.currentIndex < intervals.length ? intervals[step.currentIndex] : null;

      this.intervalContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>当前考察区间:</span>
            <span style="font-family: monospace; font-weight:700; color: #2563eb;">
              ${cur ? `[${cur[0]}, ${cur[1]}]` : '-'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>活跃保留右界:</span>
            <span style="font-family: monospace; font-weight:700; color: #059669;">x = ${step.currentEnd}</span>
          </div>
        </div>
      `;
    }

    // 3. 渲染贪心移除判定监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      const isRemove = step.action === 'remove';
      const isKeep = step.action === 'keep';

      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>判定决策:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isRemove ? '#fef2f2' : isKeep ? '#ecfdf5' : '#eff6ff'}; color: ${isRemove ? '#dc2626' : isKeep ? '#059669' : '#2563eb'}; border: 1px solid ${isRemove ? '#fecaca' : isKeep ? '#a7f3d0' : '#bfdbfe'};">
              ${isRemove ? '🗑️ 发生重叠 (移除右界大者)' : isKeep ? '✓ 无重叠 (保留)' : '🔍 初始化'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 准则: <code style="color:#2563eb; font-family:monospace;">if (s &lt; prevEnd) { count++; prevEnd = min(prevEnd, e); }</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染最终保留与移除看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>最少移除区间数: <strong style="color: #ef4444; font-family: monospace; font-size: 13.5px;">${step.removedCount}</strong> 个</span>
            <span style="font-family: monospace; font-weight: 700; color: #059669;">最终保留: ${n - step.removedCount} 个</span>
          </div>
        </div>
      `;
    }

    const badgeRemoved = this.root?.querySelector('#badge-removed-count');
    if (badgeRemoved) {
      badgeRemoved.textContent = `移除数: ${step.removedCount} 个`;
    }



    // 7. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '步骤';

        if (st.action === 'remove') {
          badgeColor = '#dc2626';
          badgeBg = '#fef2f2';
          badgeText = '移除';
        } else if (st.action === 'keep') {
          badgeColor = '#059669';
          badgeBg = '#ecfdf5';
          badgeText = '保留';
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
    if (this.sandboxContainer) this.sandboxContainer.innerHTML = '';
  }
}

registerAlgorithm({
  id: 'non-overlapping',
  name: '无重叠区间',
  viewId: 'algo-non-overlapping-view',
  category: 'greedy',
  description: '求使剩余区间互不重叠所需移除的最小区间数量，重叠时贪心淘汰右端点更大者',
  icon: '✂️',
  template,
  Visualizer: NonOverlappingVisualizer,
  difficulty: 2,
  levelOrder: 9,
  learningGoal: '掌握区间调度与重叠淘汰的贪心思想，建立与射气球问题的双向映射',
});