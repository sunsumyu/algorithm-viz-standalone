/**
 * 柱状图中最大的矩形可视化器（单调栈）— 4-Card 标准现代架构
 * LeetCode 84：首尾加哨兵 0，单调递增栈寻找左右两侧首个更矮柱子，以 mid 为高展开矩形
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  LARGEST_RECTANGLE_HISTOGRAM_PROBLEM_HTML,
  LARGEST_RECTANGLE_HISTOGRAM_ANALYSIS_HTML,
  LARGEST_RECTANGLE_HISTOGRAM_CODE_LANGUAGES,
} from './largest-rectangle-histogram-problem-content';
import template from './largest-rectangle-histogram.html?raw';

export interface LRHStep {
  originalHeights: number[];
  paddedHeights: number[];
  currentIndex: number;
  stack: number[]; // 存储在 paddedHeights 中的下标
  leftIdx: number | null;
  midIdx: number | null;
  rightIdx: number | null;
  currentArea: number;
  maxArea: number;
  bestRect: { left: number; right: number; height: number } | null;
  action: 'init' | 'scan' | 'pop_calc' | 'push' | 'done';
  message: string;
  codeLine: number;
}

export function buildLargestRectangleHistogramSteps(rawHeights: number[]): LRHStep[] {
  const steps: LRHStep[] = [];
  const n = rawHeights.length;

  if (n === 0) {
    steps.push({
      originalHeights: [],
      paddedHeights: [0, 0],
      currentIndex: -1,
      stack: [],
      leftIdx: null,
      midIdx: null,
      rightIdx: null,
      currentArea: 0,
      maxArea: 0,
      bestRect: null,
      action: 'done',
      message: '输入数组为空，最大矩形面积为 0',
      codeLine: 2,
    });
    return steps;
  }

  const paddedHeights = [0, ...rawHeights, 0];
  const stack: number[] = [0];
  let maxArea = 0;
  let bestRect: { left: number; right: number; height: number } | null = null;

  steps.push({
    originalHeights: [...rawHeights],
    paddedHeights: [...paddedHeights],
    currentIndex: 0,
    stack: [0],
    leftIdx: null,
    midIdx: null,
    rightIdx: null,
    currentArea: 0,
    maxArea: 0,
    bestRect: null,
    action: 'init',
    message: `初始化：首尾插入哨兵 0 构成长度 ${paddedHeights.length} 的扩展数组，将下标 0 (高度 0) 压入栈底`,
    codeLine: 4,
  });

  for (let i = 1; i < paddedHeights.length; i++) {
    const curH = paddedHeights[i];
    const isTailSentinel = i === paddedHeights.length - 1;

    steps.push({
      originalHeights: [...rawHeights],
      paddedHeights: [...paddedHeights],
      currentIndex: i,
      stack: [...stack],
      leftIdx: null,
      midIdx: null,
      rightIdx: null,
      currentArea: 0,
      maxArea,
      bestRect,
      action: 'scan',
      message: `🔍 考察柱子 [${i}] (${isTailSentinel ? '尾部哨兵 0' : `高度 ${curH}`})：与栈顶 [${stack[stack.length - 1]}] (高度 ${paddedHeights[stack[stack.length - 1]]}) 比对`,
      codeLine: 8,
    });

    while (stack.length > 0 && curH < paddedHeights[stack[stack.length - 1]]) {
      const mid = stack.pop()!;
      const midH = paddedHeights[mid];

      if (stack.length > 0) {
        const left = stack[stack.length - 1];
        const right = i;
        const w = right - left - 1;
        const area = midH * w;

        if (area > maxArea) {
          maxArea = area;
          bestRect = { left: left + 1, right: right - 1, height: midH };
        }

        steps.push({
          originalHeights: [...rawHeights],
          paddedHeights: [...paddedHeights],
          currentIndex: i,
          stack: [...stack],
          leftIdx: left,
          midIdx: mid,
          rightIdx: right,
          currentArea: area,
          maxArea,
          bestRect,
          action: 'pop_calc',
          message: `🔥 弹出基准柱 [${mid}] (高度 ${midH})！左侧更矮 [${left}], 右侧更矮 [${right}] &rarr; 宽度 w=${w}, 高度 h=${midH}, 本次面积 = ${area}！全局最大 maxArea = ${maxArea}`,
          codeLine: 13,
        });
      }
    }

    stack.push(i);

    steps.push({
      originalHeights: [...rawHeights],
      paddedHeights: [...paddedHeights],
      currentIndex: i,
      stack: [...stack],
      leftIdx: null,
      midIdx: null,
      rightIdx: null,
      currentArea: 0,
      maxArea,
      bestRect,
      action: 'push',
      message: `📥 将柱子 [${i}] (高度 ${curH}) 压入单调栈，维持单调递增`,
      codeLine: 15,
    });
  }

  steps.push({
    originalHeights: [...rawHeights],
    paddedHeights: [...paddedHeights],
    currentIndex: paddedHeights.length - 1,
    stack: [...stack],
    leftIdx: null,
    midIdx: null,
    rightIdx: null,
    currentArea: 0,
    maxArea,
    bestRect,
    action: 'done',
    message: `🎉 遍历结算完成！最终可勾勒出的最大矩形面积为：${maxArea} 单位`,
    codeLine: 17,
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class LargestRectangleHistogramVisualizer extends StepVisualizer<LRHStep> {
  protected codeLanguages = LARGEST_RECTANGLE_HISTOGRAM_CODE_LANGUAGES;
  protected codeLines = LARGEST_RECTANGLE_HISTOGRAM_CODE_LANGUAGES['java'];
  protected codePanelTitle = '柱状图中最大的矩形 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private sandboxContainer: HTMLElement | null = null;
  private rectContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#lrh-sandbox-container');
    this.rectContainer = this.root.querySelector('#lrh-rect-container');
    this.decisionMonitorContainer = this.root.querySelector('#lrh-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#lrh-metrics-container');
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
    this.root.querySelectorAll<HTMLButtonElement>('.lrh-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const hEl = this.root?.querySelector('#input-heights') as HTMLInputElement | null;
        if (hEl && btn.dataset.heights) hEl.value = btn.dataset.heights;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: LARGEST_RECTANGLE_HISTOGRAM_PROBLEM_HTML,
      analysisHtml: LARGEST_RECTANGLE_HISTOGRAM_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): LRHStep[] {
    const hEl = this.root?.querySelector('#input-heights') as HTMLInputElement | null;
    const rawHeights = (hEl?.value || '2,1,5,6,2,3')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    return buildLargestRectangleHistogramSteps(rawHeights.length ? rawHeights : [2, 1, 5, 6, 2, 3]);
  }

  protected renderStep(step: LRHStep): void {
    const paddedHeights = step.paddedHeights;
    const stack = step.stack;
    const n = paddedHeights.length;

    // 1. 渲染柱状图直方图沙盘 (Card 1)
    if (this.sandboxContainer && n > 0) {
      const curIdx = step.currentIndex;
      const isDone = step.action === 'done';
      const isPopCalc = step.action === 'pop_calc';

      const maxH = Math.max(...paddedHeights, 1);

      // 上方：直方图柱子与当前矩形覆盖
      const colsHtml = paddedHeights
        .map((h, idx) => {
          const isSentinel = idx === 0 || idx === n - 1;
          const isCurrent = idx === curIdx && !isDone;
          const isMid = idx === step.midIdx;
          const isLeft = idx === step.leftIdx;
          const isRight = idx === step.rightIdx;
          const inStack = stack.includes(idx);

          // 是否在当前计算矩形覆盖范围内
          const inCurrentRect = isPopCalc && step.leftIdx !== null && step.rightIdx !== null && idx > step.leftIdx && idx < step.rightIdx;

          const colHeightPx = isSentinel ? 6 : Math.max(10, Math.round((h / (maxH + 1)) * 90));

          let barBg = '#475569';
          let border = '#334155';

          if (isSentinel) {
            barBg = '#cbd5e1';
            border = '#94a3b8';
          } else if (isMid) {
            barBg = '#ef4444';
            border = '#dc2626';
          } else if (inCurrentRect) {
            barBg = '#f87171';
            border = '#ef4444';
          } else if (isLeft || isRight) {
            barBg = '#3b82f6';
            border = '#2563eb';
          } else if (isCurrent) {
            barBg = '#f59e0b';
            border = '#d97706';
          } else if (inStack) {
            barBg = '#fbbf24';
            border = '#d97706';
          }

          return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; min-width: 24px; max-width: 46px;">
              <span style="font-size: 8.5px; font-weight: 700; color: ${isMid ? '#ef4444' : inCurrentRect ? '#f87171' : '#64748b'}; font-family: monospace;">
                ${isMid ? `h=${h}` : isSentinel ? '哨兵' : `[${idx}]`}
              </span>
              <div style="width: 100%; height: 95px; display: flex; flex-direction: column; justify-content: flex-end; align-items: center;">
                <div style="width: 22px; height: ${colHeightPx}px; background: ${barBg}; border: 1.5px solid ${border}; border-radius: 4px 4px 0 0; display: flex; align-items: center; justify-content: center; color: ${isSentinel ? '#475569' : '#ffffff'}; font-size: 9px; font-weight: 800; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                  ${h}
                </div>
              </div>
              <span style="font-size: 8.5px; color: ${isMid ? '#ef4444' : isLeft ? '#2563eb' : isRight ? '#2563eb' : isCurrent ? '#d97706' : '#94a3b8'}; font-weight: 700;">
                ${isMid ? '基准' : isLeft ? '左矮' : isRight ? '右矮' : isCurrent ? '当前' : isSentinel ? '0' : `h:${h}`}
              </span>
            </div>
          `;
        })
        .join('');

      // 栈内展示
      const stackItemsHtml = stack
        .map((idx) => {
          return `
            <div style="padding: 2px 8px; border-radius: 6px; background: #fffbeb; border: 1.5px solid #fde68a; color: #b45309; font-size: 11px; font-weight: 800; font-family: 'JetBrains Mono', monospace; display: flex; align-items: center; gap: 4px;">
              <span>[${idx}]</span>
              <span style="color: #ef4444;">h=${paddedHeights[idx]}</span>
            </div>
          `;
        })
        .join('');

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <!-- 柱状图与矩形覆盖展示 -->
          <div style="display: flex; justify-content: space-around; align-items: flex-end; padding: 2px 0; border-bottom: 1px solid #e2e8f0;">
            ${colsHtml}
          </div>

          <!-- 单调栈容器 -->
          <div style="display: flex; align-items: center; gap: 8px; padding-top: 2px;">
            <span style="font-size: 10.5px; font-weight: 700; color: #475569; white-space: nowrap;">🥞 单调递增栈 (栈底 &rarr; 栈顶):</span>
            <div style="display: flex; gap: 4px; overflow-x: auto; flex: 1; align-items: center; min-height: 28px;">
              ${stack.length > 0 ? stackItemsHtml : '<span style="font-size: 10.5px; color: #94a3b8;">栈空</span>'}
            </div>
          </div>
        </div>
      `;
    }

    // 2. 渲染矩形三要素 (Card 2 Left)
    if (this.rectContainer) {
      const left = step.leftIdx;
      const mid = step.midIdx;
      const right = step.rightIdx;

      this.rectContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>左矮界 & 基准柱 & 右矮界:</span>
            <span style="font-family: monospace; font-weight:800; color: #ef4444; font-size: 12.5px;">
              ${mid !== null ? `左[${left}] (${paddedHeights[left!]}) | 基准[${mid}] (${paddedHeights[mid]}) | 右[${right}] (${paddedHeights[right!]})` : '暂无矩形弹出结算'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>本次计算矩形面积 (w &times; h):</span>
            <span style="font-family: monospace; font-weight:700; color: #059669;">
              ${step.currentArea > 0 ? `${step.currentArea} 单位` : '0'}
            </span>
          </div>
        </div>
      `;
    }

    // 3. 渲染矩形展开面积监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      const isPopCalc = step.action === 'pop_calc';
      const isPush = step.action === 'push';

      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>计算状态:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isPopCalc ? '#fef2f2' : isPush ? '#f8fafc' : '#eff6ff'}; color: ${isPopCalc ? '#ef4444' : isPush ? '#475569' : '#2563eb'}; border: 1px solid ${isPopCalc ? '#fecaca' : isPush ? '#e2e8f0' : '#bfdbfe'};">
              ${isPopCalc ? `🔥 弹出基准柱算矩形 (面积 = ${step.currentArea})` : isPush ? '📥 压入栈顶 (递增)' : '🔍 比对栈顶'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 准则: <code style="color:#ef4444; font-family:monospace;">w = right - left - 1; area = heights[mid] * w</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染全局最大矩形看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>全局最大矩形面积: <strong style="color: #ef4444; font-family: monospace; font-size: 13.5px;">${step.maxArea}</strong> 单位</span>
            <span style="font-family: monospace; font-weight: 700; color: #059669;">
              ${step.bestRect ? `最优区间 [${step.bestRect.left}..${step.bestRect.right}], 高度 ${step.bestRect.height}` : '正在搜索'}
            </span>
          </div>
        </div>
      `;
    }

    const badgeArea = this.root?.querySelector('#badge-max-area');
    if (badgeArea) {
      badgeArea.textContent = `最大面积: ${step.maxArea}`;
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
        let badgeText = '扫描';

        if (st.action === 'pop_calc') {
          badgeColor = '#ef4444';
          badgeBg = '#fef2f2';
          badgeText = '面积';
        } else if (st.action === 'push') {
          badgeColor = '#475569';
          badgeBg = '#f8fafc';
          badgeText = '入栈';
        } else if (st.action === 'done') {
          badgeColor = '#10b981';
          badgeBg = '#ecfdf5';
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
  id: 'largest-rectangle-histogram',
  name: '柱状图中最大的矩形',
  viewId: 'algo-largest-rectangle-histogram-view',
  category: 'monotonic-stack',
  description: '首尾插入哨兵 0，单调递增栈寻找每根柱子左右首个更矮边界，计算最大矩形面积',
  icon: '📊',
  template,
  Visualizer: LargestRectangleHistogramVisualizer,
  difficulty: 3,
  levelOrder: 5,
  learningGoal: '掌握单调递增栈在直方图最大矩形中的双向边界扩展技巧，深刻理解首尾哨兵 0 消除边界特判的精妙设计',
});
