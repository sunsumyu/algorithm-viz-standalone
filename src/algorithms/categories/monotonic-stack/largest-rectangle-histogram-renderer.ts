/**
 * 柱状图中最大的矩形可视化器（单调栈）
 * LeetCode 84
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './largest-rectangle-histogram.html?raw';

interface LRHStep {
  heights: number[];
  stack: number[];          // 栈存下标
  current: number;          // 当前 i（-1 表示未开始）
  popping: number;          // 正在弹出的下标，-1 无
  currentArea: number;      // 刚刚计算的面积
  maxArea: number;          // 最大面积
  rectLeft: number;         // 当前计算矩形的左边界（含），-1 无
  rectRight: number;        // 当前计算矩形的右边界（含），-1 无
  rectHeight: number;       // 当前矩形高度，-1 无
  status: 'init' | 'push' | 'pop-calc' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

function buildLRHSteps(heights: number[]): LRHStep[] {
  const steps: LRHStep[] = [];
  const n = heights.length;
  // 为了处理哨兵，我们遍历到 n（含），当 i == n 时，视 heights[n] = 0
  const ext = [...heights, 0];
  const stack: number[] = [];
  let maxArea = 0;

  steps.push({
    heights, stack: [], current: -1, popping: -1,
    currentArea: 0, maxArea: 0,
    rectLeft: -1, rectRight: -1, rectHeight: -1,
    status: 'init',
    message: `初始化空栈，maxArea = 0。从左到右遍历每个柱子（末尾加哨兵 0），维护高度递增的单调栈。当遇到比栈顶矮的柱子时，弹出并计算面积。`,
    log: '初始化。',
    codeLine: [1, 2, 3],
  });

  for (let i = 0; i <= n; i++) {
    const hi = ext[i];
    // 入栈前：先描述正在处理哪个下标
    if (i < n) {
      steps.push({
        heights, stack: [...stack], current: i, popping: -1,
        currentArea: 0, maxArea,
        rectLeft: -1, rectRight: -1, rectHeight: -1,
        status: 'push',
        message: `准备处理下标 i=${i}，height[${i}] = ${heights[i]}。`,
        log: `i=${i}，h=${heights[i]}。`,
        codeLine: 4,
      });
    } else {
      steps.push({
        heights, stack: [...stack], current: n, popping: -1,
        currentArea: 0, maxArea,
        rectLeft: -1, rectRight: -1, rectHeight: -1,
        status: 'push',
        message: `遍历到哨兵位置 i=${n}（高度 0），强制弹出栈中剩余柱子并计算面积。`,
        log: `哨兵 i=${n}，h=0。`,
        codeLine: 4,
      });
    }

    while (stack.length > 0 && hi < ext[stack[stack.length - 1]]) {
      const top = stack.pop()!;
      const h = ext[top];
      const w = stack.length === 0 ? i : i - stack[stack.length - 1] - 1;
      const area = h * w;
      if (area > maxArea) maxArea = area;

      // 矩形左右边界：
      // 右边界是弹出柱子的下标 top（它是被弹出的最右柱子）
      // 左边界：栈空则为 0，否则为 stack[top] + 1
      const rl = stack.length === 0 ? 0 : stack[stack.length - 1] + 1;
      const rr = top;

      steps.push({
        heights, stack: [...stack], current: i, popping: top,
        currentArea: area, maxArea,
        rectLeft: rl, rectRight: rr, rectHeight: h,
        status: 'pop-calc',
        message: `height[${i}] = ${hi} < 栈顶 height[${top}] = ${h}，弹出下标 ${top}。高度 = ${h}，宽度 = ${stack.length === 0 ? i : `${i} - ${stack[stack.length - 1]} - 1`} = ${w}，面积 = ${h} × ${w} = ${area}。当前 maxArea = ${maxArea}。`,
        log: `弹出 ${top}(h=${h})，w=${w}，area=${area}，max=${maxArea}。`,
        codeLine: [5, 6, 7, 8],
      });
    }

    if (i < n) {
      stack.push(i);
      steps.push({
        heights, stack: [...stack], current: i, popping: -1,
        currentArea: 0, maxArea,
        rectLeft: -1, rectRight: -1, rectHeight: -1,
        status: 'push',
        message: `下标 ${i}（高度 ${heights[i]}）入栈。栈：[${stack.map((s) => `${s}(${heights[s]})`).join(', ')}]（高度递增）。`,
        log: `入栈 ${i}。`,
        codeLine: 9,
      });
    }
  }

  steps.push({
    heights, stack: [...stack], current: n, popping: -1,
    currentArea: 0, maxArea,
    rectLeft: -1, rectRight: -1, rectHeight: -1,
    status: 'done',
    message: `遍历完成（含哨兵），栈中已无柱子。最大矩形面积 = ${maxArea}。`,
    log: `完成，maxArea = ${maxArea}。`,
    codeLine: 10,
  });

  return steps;
}

export class LargestRectangleHistogramVisualizer extends StepVisualizer<LRHStep> {
  protected codeLines = [
    'public int largestRectangleArea(int[] heights) {',
    '    Deque<Integer> stack = new ArrayDeque<>();',
    '    int maxArea = 0;',
    '    int n = heights.length;',
    '    for (int i = 0; i <= n; i++) {',
    '        int h = (i == n) ? 0 : heights[i];',
    '        while (!stack.isEmpty() && h < heights[stack.peek()]) {',
    '            int top = stack.pop();',
    '            int width = stack.isEmpty() ? i : i - stack.peek() - 1;',
    '            maxArea = Math.max(maxArea, heights[top] * width);',
    '        }',
    '        if (i < n) stack.push(i);',
    '    }',
    '    return maxArea;',
    '}',
  ];
  protected codePanelTitle = '柱状图中最大的矩形代码 (Java)';

  private inputEl: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private barsEl: HTMLElement | null = null;
  private stackEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private iEl: HTMLElement | null = null;
  private popHEl: HTMLElement | null = null;
  private curAreaEl: HTMLElement | null = null;
  private maxAreaEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputEl = this.root.querySelector('#lrh-input');
    this.btnStart = this.root.querySelector('#lrh-start');
    this.exampleButtons = this.root.querySelectorAll('.lrh-example-btn');
    this.barsEl = this.root.querySelector('#lrh-bars');
    this.stackEl = this.root.querySelector('#lrh-stack');
    this.logEl = this.root.querySelector('#lrh-log');
    this.iEl = this.root.querySelector('#lrh-i');
    this.popHEl = this.root.querySelector('#lrh-pop-h');
    this.curAreaEl = this.root.querySelector('#lrh-cur-area');
    this.maxAreaEl = this.root.querySelector('#lrh-max-area');
    this.bindPlaybackControls({
      reset: 'step-reset',
      prev: 'step-prev',
      play: 'step-play',
      next: 'step-next',
      speed: 'lrh-speed',
      speedLabel: 'lrh-speed-label',
      message: 'step-message'
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => { if (this.inputEl) this.inputEl.value = btn.dataset.val || ''; this.start(); };
    });
  }

  protected buildSteps(): LRHStep[] {
    const heights = (this.inputEl?.value || '2,1,5,6,2,3')
      .split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n) && n >= 0);
    if (heights.length === 0) heights.push(2, 1, 5, 6, 2, 3);
    return buildLRHSteps(heights);
  }

  protected renderStep(step: LRHStep): void {
    // 更新统计数据
    if (this.iEl) this.iEl.textContent = step.current >= 0 && step.current < step.heights.length ? String(step.current) : (step.current === step.heights.length ? 'n(哨兵)' : '-');
    if (this.popHEl) this.popHEl.textContent = step.popping >= 0 ? String(step.heights[step.popping]) : '-';
    if (this.curAreaEl) this.curAreaEl.textContent = step.currentArea > 0 ? String(step.currentArea) : '-';
    if (this.maxAreaEl) this.maxAreaEl.textContent = String(step.maxArea);

    // 渲染柱状图 + 矩形叠加
    if (this.barsEl) {
      this.barsEl.innerHTML = '';
      const maxH = Math.max(...step.heights, 1);
      const BAR_AREA_H = 220; // px
      const unit = BAR_AREA_H / maxH;

      // 先画柱子和索引标签
      step.heights.forEach((h, idx) => {
        const col = document.createElement('div');
        col.className = 'lrh-col';

        // 指示器（当前/栈内）
        const ptr = document.createElement('div');
        ptr.className = 'lrh-ptr';
        if (idx === step.current && step.current < step.heights.length) {
          ptr.classList.add('lrh-current');
          ptr.textContent = 'i';
        } else if (step.stack.includes(idx)) {
          ptr.classList.add('lrh-in-stack');
          ptr.textContent = '•';
        }
        col.appendChild(ptr);

        // 柱子
        const barWrap = document.createElement('div');
        barWrap.className = 'lrh-bar-wrap';
        const bar = document.createElement('div');
        bar.className = 'lrh-bar';
        bar.style.height = `${h * unit}px`;
        bar.textContent = String(h);

        if (idx === step.current && step.current < step.heights.length) bar.classList.add('current');
        if (step.stack.includes(idx)) bar.classList.add('in-stack');
        if (idx === step.popping) bar.classList.add('popping');
        barWrap.appendChild(bar);
        col.appendChild(barWrap);

        // 索引
        const idxLabel = document.createElement('div');
        idxLabel.className = 'lrh-idx';
        idxLabel.textContent = String(idx);
        col.appendChild(idxLabel);

        this.barsEl?.appendChild(col);
      });

      // 画矩形覆盖层（当 status == 'pop-calc' 时）
      if (step.status === 'pop-calc' && step.rectLeft >= 0 && step.rectRight >= 0 && step.rectHeight > 0) {
        const cols = this.barsEl.querySelectorAll('.lrh-col');
        const barsContainer = this.barsEl;
        if (barsContainer && cols.length > 0) {
          // 使用柱子的位置信息来绘制矩形
          const firstCol = cols[step.rectLeft] as HTMLElement;
          const lastCol = cols[step.rectRight] as HTMLElement;
          if (firstCol && lastCol) {
            const overlay = document.createElement('div');
            overlay.className = 'lrh-rect-overlay';
            overlay.style.height = `${step.rectHeight * unit}px`;
            overlay.style.left = `${firstCol.offsetLeft}px`;
            overlay.style.width = `${lastCol.offsetLeft + lastCol.offsetWidth - firstCol.offsetLeft}px`;
            // 位置：相对 bars 容器底部
            overlay.style.bottom = `${cols[0].querySelector('.lrh-idx')?.clientHeight || 0}px`;
            // 显示面积
            overlay.textContent = `${step.currentArea}`;
            barsContainer.appendChild(overlay);
          }
        }
      }

      // 最终完成时，找到最大矩形并高亮（可选：在最后一帧显示）
      if (step.status === 'done') {
        // 尝试用最终 maxArea 回溯矩形区域
        const best = findMaxRect(step.heights);
        if (best && best.area === step.maxArea && best.area > 0) {
          const cols = this.barsEl.querySelectorAll('.lrh-col');
          const barsContainer = this.barsEl;
          if (barsContainer && cols.length > 0) {
            const firstCol = cols[best.left] as HTMLElement;
            const lastCol = cols[best.right] as HTMLElement;
            if (firstCol && lastCol) {
              const overlay = document.createElement('div');
              overlay.className = 'lrh-rect-overlay lrh-rect-final';
              overlay.style.height = `${best.height * (220 / Math.max(...step.heights, 1))}px`;
              overlay.style.left = `${firstCol.offsetLeft}px`;
              overlay.style.width = `${lastCol.offsetLeft + lastCol.offsetWidth - firstCol.offsetLeft}px`;
              overlay.style.bottom = `${cols[0].querySelector('.lrh-idx')?.clientHeight || 0}px`;
              overlay.textContent = `${best.area}`;
              barsContainer.appendChild(overlay);
            }
          }
        }
      }
    }

    // 渲染栈
    if (this.stackEl) {
      this.stackEl.innerHTML = '';
      if (step.stack.length === 0) {
        this.stackEl.innerHTML = '<span style="color:#64748b;font-size:13px;font-style:italic;">（空栈）</span>';
      } else {
        step.stack.forEach((idx, i) => {
          const item = document.createElement('span');
          item.className = 'lrh-stack-item';
          if (i === step.stack.length - 1) item.classList.add('lrh-stack-top');
          item.textContent = `${idx}(${step.heights[idx]})`;
          this.stackEl?.appendChild(item);
        });
      }
    }

    this.renderLogLine(step);
  }

  private renderLogLine(step: LRHStep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const line = document.createElement('div');
      if (i === this.currentIndex) line.className = 'active';
      line.textContent = `${String(i + 1).padStart(2, '0')}. ${s.log}`;
      this.logEl?.appendChild(line);
    });
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }
}

/** 找到最大矩形（用于最终高亮） */
function findMaxRect(heights: number[]): { left: number; right: number; height: number; area: number } | null {
  const n = heights.length;
  const ext = [...heights, 0];
  const stack: number[] = [];
  let maxArea = 0;
  let best: { left: number; right: number; height: number; area: number } | null = null;

  for (let i = 0; i <= n; i++) {
    while (stack.length > 0 && ext[i] < ext[stack[stack.length - 1]]) {
      const top = stack.pop()!;
      const h = ext[top];
      const w = stack.length === 0 ? i : i - stack[stack.length - 1] - 1;
      const area = h * w;
      if (area > maxArea) {
        maxArea = area;
        const left = stack.length === 0 ? 0 : stack[stack.length - 1] + 1;
        best = { left, right: top, height: h, area };
      }
    }
    if (i < n) stack.push(i);
  }
  return best;
}

registerAlgorithm({
  id: 'largest-rectangle-histogram',
  name: '柱状图中最大的矩形',
  viewId: 'algo-largest-rectangle-histogram-view',
  category: 'monotonic-stack',
  description: '用单调栈找直方图中的最大矩形面积',
  icon: '📊',
  template,
  Visualizer: LargestRectangleHistogramVisualizer,
  difficulty: 3,
  levelOrder: 5,
  learningGoal: '理解单调栈如何计算最大矩形面积',
});
