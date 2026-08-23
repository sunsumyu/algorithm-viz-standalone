/**
 * 跳跃游戏 II 可视化器（贪心算法）
 * LeetCode 45
 * 重做：玻璃感 + 跳跃弧线 + 边界推进
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './jump-game.html?raw';

interface JumpStep {
  array: number[];
  currentIndex: number;
  currentBoundary: number;
  nextBoundary: number;
  jumpCount: number;
  /** 标记这一步是否触发了跳跃 */
  isJump: boolean;
  /** 上一次跳跃的起点（用于弧线动画） */
  jumpFrom: number;
  /** 上一次跳跃的落点（用于弧线动画） */
  jumpTo: number;
  message: string;
  log: string;
  codeLine: number | number[];
}

function buildSteps(arr: number[]): JumpStep[] {
  const steps: JumpStep[] = [];
  if (arr.length <= 1) {
    steps.push({
      array: [...arr], currentIndex: 0, currentBoundary: 0, nextBoundary: 0,
      jumpCount: 0, isJump: false, jumpFrom: -1, jumpTo: -1,
      message: '数组长度 <= 1，无需跳跃', log: 'no jumps needed', codeLine: [1, 2],
    });
    return steps;
  }

  let jumps = 0;
  let currentEnd = 0;
  let farthest = 0;

  steps.push({
    array: [...arr], currentIndex: 0, currentBoundary: 0, nextBoundary: 0,
    jumpCount: 0, isJump: false, jumpFrom: -1, jumpTo: -1,
    message: `初始化：jumps=0, 边界=0, 最远=0`,
    log: `init: jumps=0, boundary=0, farthest=0`,
    codeLine: [3, 4, 5, 6],
  });

  for (let i = 0; i < arr.length - 1; i++) {
    farthest = Math.max(farthest, i + arr[i]);
    steps.push({
      array: [...arr], currentIndex: i, currentBoundary: currentEnd, nextBoundary: farthest,
      jumpCount: jumps, isJump: false, jumpFrom: -1, jumpTo: -1,
      message: `i=${i}, nums[${i}]=${arr[i]}, 可跳到 ${i + arr[i]}, 更新最远为 ${farthest}`,
      log: `scan i=${i}: farthest=max(${farthest - arr[i]}, ${i + arr[i]}) = ${farthest}`,
      codeLine: 8,
    });

    if (i === currentEnd) {
      jumps++;
      const prevBoundary = currentEnd;
      currentEnd = farthest;
      steps.push({
        array: [...arr], currentIndex: i, currentBoundary: currentEnd, nextBoundary: farthest,
        jumpCount: jumps, isJump: true, jumpFrom: prevBoundary, jumpTo: currentEnd,
        message: `🦘 到达边界 ${i}，跳跃！jumps=${jumps}，新边界=${currentEnd}`,
        log: `jump #${jumps}: ${prevBoundary} → ${currentEnd}`,
        codeLine: [10, 11, 12],
      });
    }
  }

  steps.push({
    array: [...arr], currentIndex: arr.length - 1, currentBoundary: arr.length - 1,
    nextBoundary: arr.length - 1, jumpCount: jumps,
    isJump: false, jumpFrom: -1, jumpTo: -1,
    message: `✅ 完成！最少跳跃次数 = ${jumps}`,
    log: `done: jumps=${jumps}`,
    codeLine: 16,
  });

  return steps;
}

export class JumpGameVisualizer extends StepVisualizer<JumpStep> {
  protected codeLines = [
    "public int jump(int[] nums) {",
    "    if (nums.length <= 1) return 0;",
    "    int jumps = 0;",
    "    int currentEnd = 0, farthest = 0;",
    "    for (int i = 0; i < nums.length - 1; i++) {",
    "        farthest = Math.max(farthest, i + nums[i]);",
    "        if (i == currentEnd) {",
    "            jumps++;",
    "            currentEnd = farthest;",
    "        }",
    "    }",
    "    return jumps;",
    "}",
  ];
  protected codePanelTitle = '贪心 · 最少跳跃次数 (Java)';

  private inputEl: HTMLInputElement | null = null;
  private cellsEl: HTMLElement | null = null;
  private countEl: HTMLElement | null = null;
  private boundaryEl: HTMLElement | null = null;
  private farthestEl: HTMLElement | null = null;
  private idxEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private clearLogBtn: HTMLButtonElement | null = null;
  private exampleBtns: NodeListOf<HTMLButtonElement> | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputEl = this.root.querySelector('#jump-input');
    this.cellsEl = this.root.querySelector('#jg-cells');
    this.countEl = this.root.querySelector('#jump-count');
    this.boundaryEl = this.root.querySelector('#current-boundary');
    this.farthestEl = this.root.querySelector('#next-boundary');
    this.idxEl = this.root.querySelector('#jg-idx');
    this.resultEl = this.root.querySelector('#jg-result');
    this.logEl = this.root.querySelector('#jg-log');
    this.clearLogBtn = this.root.querySelector('#jg-log-clear');
    this.exampleBtns = this.root.querySelectorAll('.jg-chip');

    this.bindPlaybackControls({ message: 'step-message' });

    const startBtn = this.root.querySelector('#jump-start');
    if (startBtn) startBtn.addEventListener('click', () => this.start());

    this.exampleBtns?.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.inputEl) this.inputEl.value = btn.dataset.val || '';
        this.start();
      });
    });

    if (this.clearLogBtn) {
      this.clearLogBtn.addEventListener('click', () => {
        if (this.logEl) this.logEl.innerHTML = '';
      });
    }
  }

  protected buildSteps(): JumpStep[] {
    const defaultArr = [2, 3, 1, 1, 4];
    let arr = defaultArr;
    if (this.inputEl) {
      const input = this.inputEl.value.trim();
      if (input) {
        const parsed = input.split(/[,，\s]+/).map((n) => parseInt(n.trim())).filter(Number.isFinite);
        if (parsed.length > 0) arr = parsed;
      }
    }
    return buildSteps(arr);
  }

  protected renderStep(step: JumpStep): void {
    this.renderStats(step);
    this.renderCells(step);
    this.renderResultBanner(step);
    this.renderLogPanel();
  }

  private renderStats(step: JumpStep): void {
    if (this.countEl) this.countEl.textContent = String(step.jumpCount);
    if (this.boundaryEl) this.boundaryEl.textContent = String(step.currentBoundary);
    if (this.farthestEl) this.farthestEl.textContent = String(step.nextBoundary);
    if (this.idxEl) this.idxEl.textContent = `i=${step.currentIndex}`;
  }

  private renderCells(step: JumpStep): void {
    const cellsEl = this.cellsEl;
    if (!cellsEl) return;
    cellsEl.innerHTML = '';

    const cells: HTMLElement[] = [];
    step.array.forEach((value, idx) => {
      const cell = document.createElement('div');
      cell.className = 'jg-cell';

      if (idx === step.currentIndex) {
        cell.classList.add('jg-cell--current');
        if (step.isJump) cell.classList.add('jg-cell--jump');
      } else if (idx > step.currentIndex && idx <= step.nextBoundary) {
        cell.classList.add('jg-cell--range');
        if (idx === step.nextBoundary) cell.classList.add('jg-cell--destination');
      } else if (idx < step.currentIndex) {
        cell.classList.add('jg-cell--visited');
      }

      const val = document.createElement('div');
      val.className = 'jg-val';
      val.textContent = String(value);
      const idxLabel = document.createElement('div');
      idxLabel.className = 'jg-idx';
      idxLabel.textContent = `i=${idx}`;
      cell.appendChild(val);
      cell.appendChild(idxLabel);

      cellsEl.appendChild(cell);
      cells.push(cell);
    });

    // SVG 跳跃弧线：从 jumpFrom 到 jumpTo
    if (step.isJump && step.jumpFrom >= 0 && step.jumpTo >= 0 && step.jumpTo < cells.length) {
      const fromCell = cells[step.jumpFrom];
      const toCell = cells[step.jumpTo];
      if (fromCell && toCell) {
        const fromRect = fromCell.getBoundingClientRect();
        const toRect = toCell.getBoundingClientRect();
        const parentRect = cellsEl.getBoundingClientRect();
        const fx = fromRect.left + fromRect.width / 2 - parentRect.left;
        const fy = fromRect.top - parentRect.top;
        const tx = toRect.left + toRect.width / 2 - parentRect.left;
        const ty = toRect.top - parentRect.top;
        const midX = (fx + tx) / 2;
        const midY = Math.min(fy, ty) - 50;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'jg-arc');
        svg.style.position = 'absolute';
        svg.style.left = '0';
        svg.style.top = '0';
        svg.style.width = `${parentRect.width}px`;
        svg.style.height = `${parentRect.height}px`;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', 'jg-arc-path');
        path.setAttribute('d', `M ${fx} ${fy} Q ${midX} ${midY} ${tx} ${ty}`);
        svg.appendChild(path);

        cellsEl.appendChild(svg);

        // 弧顶标签
        const tip = document.createElement('div');
        tip.className = 'jg-arc-tip';
        tip.textContent = `+1 jump`;
        tip.style.left = `${midX}px`;
        tip.style.top = `${midY}px`;
        cellsEl.appendChild(tip);
      }
    }
  }

  private renderResultBanner(step: JumpStep): void {
    const resultEl = this.resultEl;
    if (!resultEl) return;
    resultEl.classList.remove('jg-result--done', 'jg-result--jump');
    const emoji = resultEl.querySelector('.jg-emoji') as HTMLElement | null;
    if (step.jumpCount === 0 && step.currentIndex === step.array.length - 1) {
      resultEl.classList.add('jg-result--done');
      if (emoji) emoji.textContent = '✅';
    } else if (step.isJump) {
      resultEl.classList.add('jg-result--jump');
      if (emoji) emoji.textContent = '🦘';
    } else if (emoji) emoji.textContent = '🦘';
  }

  private renderLogPanel(): void {
    const logEl = this.logEl;
    if (!logEl) return;
    logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const line = document.createElement('div');
      line.className = 'jg-log-line' + (i === this.currentIndex ? ' jg-log-active' : '');
      line.innerHTML = `<span class="jg-log-num">${String(i + 1).padStart(2, '0')}</span><span>${s.log}</span>`;
      logEl.appendChild(line);
    });
    logEl.scrollTop = logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'jump-game',
  name: '跳跃游戏 II',
  viewId: 'algo-jump-game-view',
  category: 'greedy',
  description: 'LeetCode 45：贪心算法，找到到达数组末尾的最少跳跃次数',
  icon: '🦘',
  template,
  Visualizer: JumpGameVisualizer,
  difficulty: 2,
  levelOrder: 6,
  learningGoal: '掌握求最少跳跃次数的贪心策略',
});
