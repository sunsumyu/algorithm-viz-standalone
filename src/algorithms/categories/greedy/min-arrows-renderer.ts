/**
 * 用最少数量的箭引爆气球可视化器（贪心算法）— 4-Card 标准现代架构
 * LeetCode 452：左端点升序排序 + 重叠气球右边界收紧 + 不重叠时增加弓箭
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  MIN_ARROWS_PROBLEM_HTML,
  MIN_ARROWS_ANALYSIS_HTML,
  MIN_ARROWS_CODE_LANGUAGES,
} from './min-arrows-problem-content';
import template from './min-arrows.html?raw';

export interface MAStep {
  balloons: Array<[number, number]>;
  currentIndex: number;
  arrowCount: number;
  arrowPositions: number[];
  overlapEnd: number;
  action: 'init' | 'sort' | 'new_arrow' | 'overlap' | 'done';
  message: string;
  codeLine: number;
}

export function buildMinArrowsSteps(rawBalloons: Array<[number, number]>): MAStep[] {
  const steps: MAStep[] = [];
  const n = rawBalloons.length;

  if (n === 0) {
    steps.push({
      balloons: [],
      currentIndex: -1,
      arrowCount: 0,
      arrowPositions: [],
      overlapEnd: 0,
      action: 'done',
      message: '输入为空，所需弓箭数为 0',
      codeLine: 2,
    });
    return steps;
  }

  // 1. 按左边界升序排序
  const points = rawBalloons.map(([s, e]) => [s, e] as [number, number]).sort((a, b) => a[0] - b[0]);
  let count = 1;
  const arrowPositions: number[] = [points[0][1]];

  steps.push({
    balloons: points.map(([s, e]) => [s, e]),
    currentIndex: 0,
    arrowCount: 1,
    arrowPositions: [...arrowPositions],
    overlapEnd: points[0][1],
    action: 'sort',
    message: `第 1 步：按左边界升序排序：${points.map((p) => `[${p[0]},${p[1]}]`).join(', ')}，第 1 支箭预定在 x=${points[0][1]}`,
    codeLine: 4,
  });

  for (let i = 1; i < n; i++) {
    const cur = points[i];
    const prevEnd = points[i - 1][1];

    if (cur[0] > prevEnd) {
      count++;
      arrowPositions.push(cur[1]);

      steps.push({
        balloons: points.map(([s, e]) => [s, e]),
        currentIndex: i,
        arrowCount: count,
        arrowPositions: [...arrowPositions],
        overlapEnd: cur[1],
        action: 'new_arrow',
        message: `🏹 气球 [${i}]=[${cur[0]}, ${cur[1]}] 左端点 ${cur[0]} > 前组右端点 ${prevEnd}，无重叠，增加第 ${count} 支箭 (x=${cur[1]})`,
        codeLine: 8,
      });
    } else {
      points[i][1] = Math.min(prevEnd, cur[1]);
      arrowPositions[arrowPositions.length - 1] = points[i][1];

      steps.push({
        balloons: points.map(([s, e]) => [s, e]),
        currentIndex: i,
        arrowCount: count,
        arrowPositions: [...arrowPositions],
        overlapEnd: points[i][1],
        action: 'overlap',
        message: `🎯 气球 [${i}] 与前组重叠 (左界 ${cur[0]} &le; ${prevEnd})！同用一支箭，收紧重叠右界至 x=${points[i][1]}`,
        codeLine: 11,
      });
    }
  }

  steps.push({
    balloons: points.map(([s, e]) => [s, e]),
    currentIndex: n - 1,
    arrowCount: count,
    arrowPositions: [...arrowPositions],
    overlapEnd: points[n - 1][1],
    action: 'done',
    message: `🎉 扫描完成！引爆全部 ${n} 个气球最少需要 ${count} 支箭 (射箭坐标: ${arrowPositions.join(', ')})`,
    codeLine: 14,
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class MinArrowsVisualizer extends StepVisualizer<MAStep> {
  protected codeLanguages = MIN_ARROWS_CODE_LANGUAGES;
  protected codeLines = MIN_ARROWS_CODE_LANGUAGES['java'];
  protected codePanelTitle = '用最少数量的箭引爆气球 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private sandboxContainer: HTMLElement | null = null;
  private intervalContainer: HTMLElement | null = null;
  private overlapMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#ma-sandbox-container');
    this.intervalContainer = this.root.querySelector('#ma-interval-container');
    this.overlapMonitorContainer = this.root.querySelector('#ma-overlap-monitor-container');
    this.metricsContainer = this.root.querySelector('#ma-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 绑定播放控制
    this.bindPlaybackControls();

    // 绑定运行与重置
    this.root.querySelector('#btn-generate')?.addEventListener('click', () => this.start());
    this.root.querySelector('#btn-reset')?.addEventListener('click', () => this.reset());

    // 绑定 Scrubber 进度条
    const slider = this.root.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        if (!isNaN(val) && val >= 0 && val < this.steps.length) {
          this.goToStep(val);
        }
      });
    }

    // 绑定前进后退按钮
    this.root.querySelector('#btn-step-prev')?.addEventListener('click', () => this.prevStep());
    this.root.querySelector('#btn-step-next')?.addEventListener('click', () => this.nextStep());
    this.root.querySelector('#btn-play-pause')?.addEventListener('click', () => this.togglePlay());

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.ma-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ptsEl = this.root?.querySelector('#input-points') as HTMLInputElement | null;
        if (ptsEl && btn.dataset.points) ptsEl.value = btn.dataset.points;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: MIN_ARROWS_PROBLEM_HTML,
      analysisHtml: MIN_ARROWS_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): MAStep[] {
    const ptsEl = this.root?.querySelector('#input-points') as HTMLInputElement | null;
    let balloons: Array<[number, number]> = [];
    try {
      const parsed = JSON.parse(ptsEl?.value || '[[10,16],[2,8],[1,6],[7,12]]');
      if (Array.isArray(parsed) && parsed.every((p) => Array.isArray(p) && p.length >= 2)) {
        balloons = parsed.map((p) => [Number(p[0]), Number(p[1])]);
      }
    } catch {
      balloons = [
        [10, 16],
        [2, 8],
        [1, 6],
        [7, 12],
      ];
    }

    return buildMinArrowsSteps(balloons);
  }

  protected renderStep(step: MAStep): void {
    const balloons = step.balloons;
    const n = balloons.length;

    // 1. 渲染气球坐标轴与垂直射箭沙盘 (Card 1)
    if (this.sandboxContainer && n > 0) {
      const minX = Math.min(...balloons.map((b) => b[0]));
      const maxX = Math.max(...balloons.map((b) => b[1]));
      const xRange = maxX - minX || 1;

      const svgWidth = 420;
      const svgHeight = 160;
      const padX = 35;
      const rowHeight = Math.min(22, (svgHeight - 40) / n);

      const balloonSvgs = balloons
        .map(([s, e], idx) => {
          const x1 = padX + ((s - minX) / xRange) * (svgWidth - padX * 2);
          const x2 = padX + ((e - minX) / xRange) * (svgWidth - padX * 2);
          const width = Math.max(12, x2 - x1);
          const y = 20 + idx * rowHeight;

          const isCurrent = idx === step.currentIndex && step.action !== 'done';
          const fill = isCurrent ? '#f472b6' : '#fbcfe8';
          const stroke = isCurrent ? '#db2777' : '#ec4899';

          return `
            <g>
              <!-- 气球胶囊条 -->
              <rect x="${x1}" y="${y}" width="${width}" height="${rowHeight - 6}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1.5" />
              <text x="${x1 + width / 2}" y="${y + rowHeight / 2 - 1}" fill="#831843" font-size="9" font-family="JetBrains Mono" font-weight="700" text-anchor="middle" dominant-baseline="middle">
                [${s}, ${e}]
              </text>
            </g>
          `;
        })
        .join('');

      // 垂直箭射线 (绿色垂直虚线与箭头)
      const arrowsSvg = step.arrowPositions
        .map((arrowX, aIdx) => {
          const x = padX + ((arrowX - minX) / xRange) * (svgWidth - padX * 2);
          return `
            <g>
              <line x1="${x}" y1="8" x2="${x}" y2="${svgHeight - 12}" stroke="#10b981" stroke-width="2" stroke-dasharray="4 2" />
              <circle cx="${x}" cy="${svgHeight - 8}" r="4" fill="#10b981" />
              <text x="${x}" y="12" fill="#059669" font-size="9" font-family="JetBrains Mono" font-weight="800" text-anchor="middle">
                🏹#${aIdx + 1}
              </text>
            </g>
          `;
        })
        .join('');

      this.sandboxContainer.innerHTML = `
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: 100%; overflow: visible;" preserveAspectRatio="xMidYMid meet">
          <!-- 底部坐标轴 -->
          <line x1="${padX}" y1="${svgHeight - 15}" x2="${svgWidth - padX}" y2="${svgHeight - 15}" stroke="#cbd5e1" stroke-width="1.5" />
          <text x="${padX}" y="${svgHeight - 2}" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono">x=${minX}</text>
          <text x="${svgWidth - padX}" y="${svgHeight - 2}" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono" text-anchor="end">x=${maxX}</text>

          <!-- 气球区间 -->
          ${balloonSvgs}

          <!-- 弓箭射线 -->
          ${arrowsSvg}
        </svg>
      `;
    }

    // 2. 渲染当前考察区间 (Card 2 Left)
    if (this.intervalContainer) {
      const curB = step.currentIndex >= 0 && step.currentIndex < balloons.length ? balloons[step.currentIndex] : null;

      this.intervalContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>当前气球区间:</span>
            <span style="font-family: monospace; font-weight:700; color: #db2777;">
              ${curB ? `[${curB[0]}, ${curB[1]}]` : '-'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>当前组右边界:</span>
            <span style="font-family: monospace; font-weight:700; color: #059669;">x = ${step.overlapEnd}</span>
          </div>
        </div>
      `;
    }

    // 3. 渲染重叠与加箭监视器 (Card 2 Center)
    if (this.overlapMonitorContainer) {
      const isNewArrow = step.action === 'new_arrow';
      const isOverlap = step.action === 'overlap';

      this.overlapMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>重叠状态:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isNewArrow ? '#fff1f2' : isOverlap ? '#ecfdf5' : '#eff6ff'}; color: ${isNewArrow ? '#db2777' : isOverlap ? '#059669' : '#2563eb'}; border: 1px solid ${isNewArrow ? '#fbcfe8' : isOverlap ? '#a7f3d0' : '#bfdbfe'};">
              ${isNewArrow ? '🏹 无交集 (新增 1 箭)' : isOverlap ? '🎯 存在重叠 (同用 1 箭)' : '🔍 初始化排序'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 规则: <code style="color:#db2777; font-family:monospace;">if (s &gt; prevEnd) count++; else prevEnd = min(prevEnd, e);</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染最终射箭与引爆看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>所需最少箭数: <strong style="color: #db2777; font-family: monospace; font-size: 13.5px;">${step.arrowCount}</strong> 支</span>
            <span style="font-family: monospace; font-weight: 700; color: #059669;">射箭位: [${step.arrowPositions.join(', ')}]</span>
          </div>
        </div>
      `;
    }

    const badgeArrow = this.root?.querySelector('#badge-arrow-count');
    if (badgeArrow) {
      badgeArrow.textContent = `已用箭数: ${step.arrowCount} 支`;
    }

    // 5. 更新 Scrubber 进度条
    const slider = this.root?.querySelector('#slider-progress') as HTMLInputElement | null;
    const stepCur = this.root?.querySelector('#step-cur') as HTMLElement | null;
    const stepTotal = this.root?.querySelector('#step-total') as HTMLElement | null;
    const playIcon = this.root?.querySelector('#play-icon') as HTMLElement | null;

    if (slider) {
      slider.max = String(Math.max(0, this.steps.length - 1));
      slider.value = String(this.currentIndex);
    }
    if (stepCur) stepCur.textContent = String(this.currentIndex + 1);
    if (stepTotal) stepTotal.textContent = String(this.steps.length);
    if (playIcon) {
      playIcon.className = this.isPlaying ? 'fa-solid fa-pause text-[12px]' : 'fa-solid fa-play text-[12px]';
    }

    // 6. 暗色终端代码行高亮
    this.terminalInstance?.highlightLine(step.codeLine);

    // 7. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '步骤';

        if (st.action === 'new_arrow') {
          badgeColor = '#db2777';
          badgeBg = '#fdf2f8';
          badgeText = '新箭';
        } else if (st.action === 'overlap') {
          badgeColor = '#059669';
          badgeBg = '#ecfdf5';
          badgeText = '重叠';
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
  id: 'min-arrows',
  name: '用最少数量的箭引爆气球',
  viewId: 'algo-min-arrows-view',
  category: 'greedy',
  description: '按左端点升序排序，贪心收紧重叠区间最小右边界，计算最少所需弓箭数',
  icon: '🎯',
  template,
  Visualizer: MinArrowsVisualizer,
  difficulty: 2,
  levelOrder: 8,
  learningGoal: '掌握区间重叠问题的贪心收缩右边界模型，奠定区间调度类问题的求解范式',
});
