/**
 * 最大子序和可视化器（贪心算法 Kadane）
 * LeetCode 53
 * 重做：玻璃感 + 柱状图 + 子数组滑动高亮 + 重置 shake + max 更新 bump
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './max-subarray.html?raw';

type MSPhase = 'init' | 'reset' | 'extend' | 'new-max' | 'done';

interface MSSStep {
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
  codeLine: number | number[];
}

function buildSteps(arr: number[]): MSSStep[] {
  const steps: MSSStep[] = [];
  const n = arr.length;
  if (n === 0) {
    steps.push({
      array: [], currentIndex: -1, currentSum: 0, maxSum: 0,
      maxStart: -1, maxEnd: -1, currentStart: -1, phase: 'done',
      message: '输入为空，返回 0', log: 'init: empty', codeLine: 1,
    });
    return steps;
  }

  let currentSum = 0;
  let maxSum = arr[0];
  let maxStart = 0;
  let maxEnd = 0;
  let currentStart = 0;

  steps.push({
    array: [...arr], currentIndex: -1, currentSum: 0, maxSum,
    maxStart: 0, maxEnd: 0, currentStart: 0, phase: 'init',
    message: `初始化：maxSum=${maxSum}，curSum=0`,
    log: `init: max=${maxSum}, cur=0`,
    codeLine: [3, 4],
  });

  for (let i = 0; i < n; i++) {
    if (currentSum < 0) {
      currentSum = 0;
      currentStart = i;
      steps.push({
        array: [...arr], currentIndex: i, currentSum: 0, maxSum,
        maxStart, maxEnd, currentStart, phase: 'reset',
        message: `curSum < 0，重置为 0，新起点 = ${i}`,
        log: `reset @ ${i}: curSum -> 0, start=${i}`,
        codeLine: 6,
      });
    }
    currentSum += arr[i];
    steps.push({
      array: [...arr], currentIndex: i, currentSum, maxSum,
      maxStart, maxEnd, currentStart, phase: 'extend',
      message: `加入 [${i}]=${arr[i]}，curSum=${currentSum}`,
      log: `extend @ ${i}: +${arr[i]}, cur=${currentSum}`,
      codeLine: 7,
    });

    if (currentSum > maxSum) {
      maxSum = currentSum;
      maxStart = currentStart;
      maxEnd = i;
      steps.push({
        array: [...arr], currentIndex: i, currentSum, maxSum,
        maxStart, maxEnd, currentStart, phase: 'new-max',
        message: `★ 新最大和 = ${maxSum}，区间 [${maxStart}..${maxEnd}]`,
        log: `new-max @ ${i}: max=${maxSum}, range=[${maxStart}..${maxEnd}]`,
        codeLine: 8,
      });
    }
  }

  steps.push({
    array: [...arr], currentIndex: n - 1, currentSum, maxSum,
    maxStart, maxEnd, currentStart, phase: 'done',
    message: `✅ 完成！最大子序和 = ${maxSum}，区间 [${maxStart}..${maxEnd}]`,
    log: `done: max=${maxSum}, range=[${maxStart}..${maxEnd}]`,
    codeLine: 11,
  });

  return steps;
}

export class MaxSubarrayVisualizer extends StepVisualizer<MSSStep> {
  protected codeLines = [
    "public int maxSubArray(int[] nums) {",
    "    if (nums.length == 0) return 0;",
    "    int maxSum = nums[0];",
    "    int curSum = 0, start = 0;",
    "    for (int i = 0; i < nums.length; i++) {",
    "        if (curSum < 0) { curSum = 0; start = i; }",
    "        curSum += nums[i];",
    "        if (curSum > maxSum) maxSum = curSum;",
    "    }",
    "    return maxSum;",
    "}",
  ];
  protected codePanelTitle = '贪心 · Kadane 算法 (Java)';

  private inputEl: HTMLInputElement | null = null;
  private barsEl: HTMLElement | null = null;
  private curSumEl: HTMLElement | null = null;
  private maxSumEl: HTMLElement | null = null;
  private rangeEl: HTMLElement | null = null;
  private idxEl: HTMLElement | null = null;
  private statusEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private clearLogBtn: HTMLButtonElement | null = null;
  private exampleBtns: NodeListOf<HTMLButtonElement> | null = null;
  /** 上一帧的最大值，用于检测 new-max 触发 bump */
  private prevMaxSum: number | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputEl = this.root.querySelector('#maxsub-input');
    this.barsEl = this.root.querySelector('#maxsub-bars');
    this.curSumEl = this.root.querySelector('#maxsub-cursum');
    this.maxSumEl = this.root.querySelector('#maxsub-maxsum');
    this.rangeEl = this.root.querySelector('#maxsub-range');
    this.idxEl = this.root.querySelector('#maxsub-idx');
    this.statusEl = this.root.querySelector('#maxsub-status');
    this.resultEl = this.root.querySelector('#maxsub-result');
    this.logEl = this.root.querySelector('#maxsub-log');
    this.clearLogBtn = this.root.querySelector('#maxsub-log-clear');
    this.exampleBtns = this.root.querySelectorAll('.ms-chip');

    this.bindPlaybackControls({
      reset: 'step-reset', prev: 'step-prev', play: 'step-play',
      next: 'step-next', speed: 'maxsub-speed', speedLabel: 'maxsub-speed-label',
      message: 'step-message',
    });

    const startBtn = this.root.querySelector('#maxsub-start');
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

  protected buildSteps(): MSSStep[] {
    const defaultArr = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
    let arr = defaultArr;
    if (this.inputEl) {
      const input = this.inputEl.value.trim();
      if (input) {
        const parsed = input.split(/[,，\s]+/).map((n) => parseInt(n.trim())).filter(Number.isFinite);
        if (parsed.length > 0) arr = parsed;
      }
    }
    this.prevMaxSum = null;
    return buildSteps(arr);
  }

  protected renderStep(step: MSSStep): void {
    this.renderStats(step);
    this.renderBars(step);
    this.renderResultBanner(step);
    this.renderLogPanel();
    this.prevMaxSum = step.maxSum;
  }

  private renderStats(step: MSSStep): void {
    if (this.curSumEl) this.curSumEl.textContent = String(step.currentSum);
    if (this.maxSumEl) this.maxSumEl.textContent = String(step.maxSum);
    if (this.rangeEl) {
      this.rangeEl.textContent = step.maxStart >= 0 ? `[${step.maxStart}..${step.maxEnd}]` : '-';
    }
    if (this.idxEl) this.idxEl.textContent = step.currentIndex >= 0 ? `i=${step.currentIndex}` : '-';
    if (this.statusEl) {
      const names: Record<MSPhase, string> = {
        'init': '初始化', 'reset': '重置', 'extend': '扩展', 'new-max': '新最大', 'done': '完成',
      };
      this.statusEl.textContent = names[step.phase];
    }
  }

  private renderBars(step: MSSStep): void {
    const barsEl = this.barsEl;
    if (!barsEl) return;
    barsEl.innerHTML = '';

    const n = step.array.length;
    if (n === 0) {
      barsEl.innerHTML = '<div style="color:#64748b;padding:24px;">空数组</div>';
      return;
    }

    const maxAbs = Math.max(1, ...step.array.map((v) => Math.abs(v)));
    const barHalfH = 90; // 半高（正/负各占 90px）

    step.array.forEach((value, idx) => {
      const wrap = document.createElement('div');
      wrap.className = 'ms-bar-wrap';

      const bar = document.createElement('div');
      bar.className = 'ms-bar';
      const heightPx = Math.max(8, (Math.abs(value) / maxAbs) * barHalfH);
      bar.style.height = `${heightPx}px`;

      if (value < 0) bar.classList.add('ms-bar--neg');

      // 状态优先级：current > max > sub > 默认
      const inSub = step.currentIndex >= 0 && idx >= step.currentStart && idx <= step.currentIndex;
      const inMax = idx >= step.maxStart && idx <= step.maxEnd;

      if (idx === step.currentIndex) bar.classList.add('ms-bar--current');
      else if (inMax) bar.classList.add('ms-bar--max');
      else if (inSub) bar.classList.add('ms-bar--sub');

      // 重置抖动
      if (step.phase === 'reset' && idx === step.currentIndex) {
        bar.classList.add('ms-bar--reset');
      }
      // 新 max 时所有 max 区间柱子 bump
      if (step.phase === 'new-max' && inMax) {
        bar.classList.add('ms-bar--bump');
      }

      bar.textContent = String(value);
      wrap.appendChild(bar);

      const label = document.createElement('div');
      label.className = 'ms-bar-label';
      label.textContent = `i=${idx}`;
      wrap.appendChild(label);

      barsEl.appendChild(wrap);
    });
  }

  private renderResultBanner(step: MSSStep): void {
    const resultEl = this.resultEl;
    if (!resultEl) return;
    resultEl.classList.toggle('ms-result--done', step.phase === 'done');
    resultEl.classList.toggle('ms-result--reset', step.phase === 'reset');
    const emoji = resultEl.querySelector('.ms-emoji') as HTMLElement | null;
    if (emoji) {
      if (step.phase === 'done') emoji.textContent = '✅';
      else if (step.phase === 'new-max') emoji.textContent = '★';
      else if (step.phase === 'reset') emoji.textContent = '🔄';
      else if (step.phase === 'extend') emoji.textContent = '➕';
      else emoji.textContent = '📊';
    }
  }

  private renderLogPanel(): void {
    const logEl = this.logEl;
    if (!logEl) return;
    logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const line = document.createElement('div');
      line.className = 'ms-log-line' + (i === this.currentIndex ? ' ms-log-active' : '');
      line.innerHTML = `<span class="ms-log-num">${String(i + 1).padStart(2, '0')}</span><span>${s.log}</span>`;
      logEl.appendChild(line);
    });
    logEl.scrollTop = logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'max-subarray',
  name: '最大子序和',
  viewId: 'algo-max-subarray-view',
  category: 'greedy',
  description: 'LeetCode 53：贪心算法，找到具有最大和的连续子数组',
  icon: '📊',
  template,
  Visualizer: MaxSubarrayVisualizer,
  difficulty: 1,
  levelOrder: 3,
  learningGoal: '理解最大子数组和的贪心选择',
});
