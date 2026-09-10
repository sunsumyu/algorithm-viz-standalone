/**
 * 合并区间可视化器（贪心算法）— 4-Card 标准现代架构
 * LeetCode 56：左端点升序排序 + 重叠时贪心扩展右边界 + 不重叠追加新区间
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  MERGE_INTERVALS_PROBLEM_HTML,
  MERGE_INTERVALS_ANALYSIS_HTML,
  MERGE_INTERVALS_CODE_LANGUAGES,
} from './merge-intervals-problem-content';
import template from './merge-intervals.html?raw';

export interface MergeStep {
  intervals: Array<[number, number]>;
  result: Array<[number, number]>;
  currentIndex: number;
  action: 'init' | 'sort' | 'merge' | 'append' | 'done';
  message: string;
  codeLine: number;
}

export function buildMergeIntervalsSteps(rawIntervals: Array<[number, number]>): MergeStep[] {
  const steps: MergeStep[] = [];
  const n = rawIntervals.length;

  if (n === 0) {
    steps.push({
      intervals: [],
      result: [],
      currentIndex: -1,
      action: 'done',
      message: '输入为空，返回空数组',
      codeLine: 2,
    });
    return steps;
  }

  // 1. 按左边界升序排序
  const intervals = rawIntervals.map(([s, e]) => [s, e] as [number, number]).sort((a, b) => a[0] - b[0]);
  const result: Array<[number, number]> = [[intervals[0][0], intervals[0][1]]];

  steps.push({
    intervals: intervals.map(([s, e]) => [s, e]),
    result: result.map(([s, e]) => [s, e]),
    currentIndex: 0,
    action: 'sort',
    message: `第 1 步：按左边界升序排序：${intervals.map((i) => `[${i[0]},${i[1]}]`).join(', ')}，将首个区间 [${intervals[0][0]}, ${intervals[0][1]}] 放入结果集`,
    codeLine: 5,
  });

  for (let i = 1; i < n; i++) {
    const cur = intervals[i];
    const last = result[result.length - 1];

    if (cur[0] <= last[1]) {
      const oldEnd = last[1];
      last[1] = Math.max(last[1], cur[1]);

      steps.push({
        intervals: intervals.map(([s, e]) => [s, e]),
        result: result.map(([s, e]) => [s, e]),
        currentIndex: i,
        action: 'merge',
        message: `🧩 发生重叠！区间 [${i}]=[${cur[0]}, ${cur[1]}] 左端点 ${cur[0]} &le; 末尾右界 ${oldEnd}，贪心扩展右界至 max(${oldEnd}, ${cur[1]}) = ${last[1]}`,
        codeLine: 9,
      });
    } else {
      result.push([cur[0], cur[1]]);

      steps.push({
        intervals: intervals.map(([s, e]) => [s, e]),
        result: result.map(([s, e]) => [s, e]),
        currentIndex: i,
        action: 'append',
        message: `➕ 不重叠！区间 [${i}]=[${cur[0]}, ${cur[1]}] 左端点 ${cur[0]} > 末尾右界 ${last[1]}，直接追加到结果集`,
        codeLine: 11,
      });
    }
  }

  steps.push({
    intervals: intervals.map(([s, e]) => [s, e]),
    result: result.map(([s, e]) => [s, e]),
    currentIndex: n - 1,
    action: 'done',
    message: `🎉 合并完成！原始 ${n} 个区间最终合并为 ${result.length} 个不重叠区间：${result.map((i) => `[${i[0]},${i[1]}]`).join(', ')}`,
    codeLine: 14,
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class MergeIntervalsVisualizer extends StepVisualizer<MergeStep> {
  protected codeLanguages = MERGE_INTERVALS_CODE_LANGUAGES;
  protected codeLines = MERGE_INTERVALS_CODE_LANGUAGES['java'];
  protected codePanelTitle = '合并区间 代码调试';

  private sandboxContainer: HTMLElement | null = null;
  private intervalContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#mi-sandbox-container');
    this.intervalContainer = this.root.querySelector('#mi-interval-container');
    this.decisionMonitorContainer = this.root.querySelector('#mi-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#mi-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.mi-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const intEl = this.root?.querySelector('#input-intervals') as HTMLInputElement | null;
        if (intEl && btn.dataset.intervals) intEl.value = btn.dataset.intervals;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: MERGE_INTERVALS_PROBLEM_HTML,
      analysisHtml: MERGE_INTERVALS_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): MergeStep[] {
    const intEl = this.root?.querySelector('#input-intervals') as HTMLInputElement | null;
    let intervals: Array<[number, number]> = [];
    try {
      const parsed = JSON.parse(intEl?.value || '[[1,3],[2,6],[8,10],[15,18]]');
      if (Array.isArray(parsed) && parsed.every((p) => Array.isArray(p) && p.length >= 2)) {
        intervals = parsed.map((p) => [Number(p[0]), Number(p[1])]);
      }
    } catch {
      intervals = [
        [1, 3],
        [2, 6],
        [8, 10],
        [15, 18],
      ];
    }

    return buildMergeIntervalsSteps(intervals);
  }

  protected renderStep(step: MergeStep): void {
    const intervals = step.intervals;
    const result = step.result;
    const n = intervals.length;

    // 1. 渲染双轨沙盘 (Card 1)
    if (this.sandboxContainer && n > 0) {
      const allNums = [...intervals.flat(), ...(result.length ? result.flat() : [])];
      const minX = Math.min(...allNums);
      const maxX = Math.max(...allNums);
      const xRange = maxX - minX || 1;

      const svgWidth = 420;
      const svgHeight = 160;
      const padX = 35;

      // 上轨道：原始区间
      const origHeight = Math.min(18, 55 / n);
      const origSvgs = intervals
        .map(([s, e], idx) => {
          const x1 = padX + ((s - minX) / xRange) * (svgWidth - padX * 2);
          const x2 = padX + ((e - minX) / xRange) * (svgWidth - padX * 2);
          const width = Math.max(10, x2 - x1);
          const y = 20 + idx * origHeight;

          const isCurrent = idx === step.currentIndex && step.action !== 'done';
          const fill = isCurrent ? '#dbeafe' : '#f1f5f9';
          const stroke = isCurrent ? '#2563eb' : '#cbd5e1';
          const textColor = isCurrent ? '#1d4ed8' : '#64748b';

          return `
            <g>
              <rect x="${x1}" y="${y}" width="${width}" height="${origHeight - 4}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="1.5" />
              <text x="${x1 + width / 2}" y="${y + origHeight / 2 - 1}" fill="${textColor}" font-size="8.5" font-family="JetBrains Mono" font-weight="700" text-anchor="middle" dominant-baseline="middle">
                [${s}, ${e}]
              </text>
            </g>
          `;
        })
        .join('');

      // 下轨道：合并后结果
      const resSvgs = result
        .map(([s, e], idx) => {
          const x1 = padX + ((s - minX) / xRange) * (svgWidth - padX * 2);
          const x2 = padX + ((e - minX) / xRange) * (svgWidth - padX * 2);
          const width = Math.max(12, x2 - x1);
          const y = 100;

          const isLast = idx === result.length - 1;
          const fill = isLast ? '#d1fae5' : '#ecfdf5';
          const stroke = isLast ? '#059669' : '#10b981';

          return `
            <g>
              <rect x="${x1}" y="${y}" width="${width}" height="24" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="2" />
              <text x="${x1 + width / 2}" y="${y + 12}" fill="#065f46" font-size="10" font-family="JetBrains Mono" font-weight="800" text-anchor="middle" dominant-baseline="middle">
                [${s}, ${e}]
              </text>
            </g>
          `;
        })
        .join('');

      this.sandboxContainer.innerHTML = `
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: 100%; overflow: visible;" preserveAspectRatio="xMidYMid meet">
          <!-- 上下分界提示 -->
          <text x="${padX}" y="12" fill="#64748b" font-size="8.5" font-weight="700">原始输入区间 (待扫描)</text>
          <text x="${padX}" y="92" fill="#059669" font-size="8.5" font-weight="800">已合并区间集合 (merged)</text>

          <!-- 坐标轴 -->
          <line x1="${padX}" y1="${svgHeight - 12}" x2="${svgWidth - padX}" y2="${svgHeight - 12}" stroke="#cbd5e1" stroke-width="1.5" />
          <text x="${padX}" y="${svgHeight - 2}" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono">x=${minX}</text>
          <text x="${svgWidth - padX}" y="${svgHeight - 2}" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono" text-anchor="end">x=${maxX}</text>

          <!-- 区间条 -->
          ${origSvgs}
          ${resSvgs}
        </svg>
      `;
    }

    // 2. 渲染当前考察与末尾区间 (Card 2 Left)
    if (this.intervalContainer) {
      const cur = step.currentIndex >= 0 && step.currentIndex < intervals.length ? intervals[step.currentIndex] : null;
      const last = result.length ? result[result.length - 1] : null;

      this.intervalContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>当前考察区间:</span>
            <span style="font-family: monospace; font-weight:700; color: #2563eb;">
              ${cur ? `[${cur[0]}, ${cur[1]}]` : '-'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>结果集末尾区间:</span>
            <span style="font-family: monospace; font-weight:700; color: #059669;">
              ${last ? `[${last[0]}, ${last[1]}]` : '-'}
            </span>
          </div>
        </div>
      `;
    }

    // 3. 渲染合并/追加决策监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      const isMerge = step.action === 'merge';
      const isAppend = step.action === 'append';

      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>操作决策:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isMerge ? '#ecfdf5' : isAppend ? '#eff6ff' : '#f8fafc'}; color: ${isMerge ? '#059669' : isAppend ? '#2563eb' : '#64748b'}; border: 1px solid ${isMerge ? '#a7f3d0' : isAppend ? '#bfdbfe' : '#e2e8f0'};">
              ${isMerge ? '🧩 发生重叠 (合并扩界)' : isAppend ? '➕ 无重叠 (追加新区间)' : '🔍 初始化'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 准则: <code style="color:#059669; font-family:monospace;">if (s &lt;= lastEnd) lastEnd = max(lastEnd, e); else append();</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染最终合并结果看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>合并后区间数: <strong style="color: #059669; font-family: monospace; font-size: 13.5px;">${result.length}</strong> 个</span>
            <span style="font-family: monospace; font-weight: 700; color: #334155;">${result.map((i) => `[${i[0]},${i[1]}]`).join(', ')}</span>
          </div>
        </div>
      `;
    }

    const badgeMerged = this.root?.querySelector('#badge-merged-count');
    if (badgeMerged) {
      badgeMerged.textContent = `合并数: ${result.length} 个`;
    }



    // 7. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '步骤';

        if (st.action === 'merge') {
          badgeColor = '#059669';
          badgeBg = '#ecfdf5';
          badgeText = '合并';
        } else if (st.action === 'append') {
          badgeColor = '#2563eb';
          badgeBg = '#eff6ff';
          badgeText = '追加';
        } else if (st.action === 'done') {
          badgeColor = '#7c3aed';
          badgeBg = '#f5f3ff';
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
  id: 'merge-intervals',
  name: '合并区间',
  viewId: 'algo-merge-intervals-view',
  category: 'greedy',
  description: '按左端点升序排序，遍历合并所有重叠区间，动态扩展当前重叠最大右端点',
  icon: '🧩',
  template,
  Visualizer: MergeIntervalsVisualizer,
  difficulty: 2,
  levelOrder: 11,
  learningGoal: '掌握区间合并标准贪心流程，学会维护合并结果集末尾区间的动态扩界技巧',
});
