/**
 * 爬楼梯可视化器（动态规划）
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './climb-stairs.html?raw';

interface StairsStep {
  n: number;
  currentIndex: number;
  dp: number[];
  status: 'init' | 'compute' | 'done';
  message: string;
  log: string;
  codeLine: number | { from: number; to: number };
}

function buildStairsSteps(n: number): StairsStep[] {
  const steps: StairsStep[] = [];

  if (n <= 2) {
    steps.push({
      n,
      currentIndex: n,
      dp: Array.from({ length: n + 1 }, (_, i) => i),
      status: 'done',
      message: `n=${n} 是基础情况，答案为 ${n}。`,
      log: `基础情况：climbStairs(${n}) = ${n}。`,
      codeLine: 2,
    });
    return steps;
  }

  const dp = new Array(n + 1).fill(0);
  dp[1] = 1;
  dp[2] = 2;

  steps.push({
    n,
    currentIndex: 2,
    dp: [...dp],
    status: 'init',
    message: '初始化：dp[1] = 1，dp[2] = 2。',
    log: '初始化 DP 数组。',
    codeLine: { from: 3, to: 5 },
  });

  for (let i = 3; i <= n; i++) {
    steps.push({
      n,
      currentIndex: i,
      dp: [...dp],
      status: 'compute',
      message: `准备计算 dp[${i}]，它来自 dp[${i - 1}] 和 dp[${i - 2}]。`,
      log: `进入循环 i=${i}。`,
      codeLine: 7,
    });

    dp[i] = dp[i - 1] + dp[i - 2];
    steps.push({
      n,
      currentIndex: i,
      dp: [...dp],
      status: 'compute',
      message: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}。`,
      log: `计算 dp[${i}] = ${dp[i]}。`,
      codeLine: 8,
    });
  }

  steps.push({
    n,
    currentIndex: n,
    dp: [...dp],
    status: 'done',
    message: `计算完成，爬到第 ${n} 阶共有 ${dp[n]} 种方法。`,
    log: `返回 dp[${n}] = ${dp[n]}。`,
    codeLine: 10,
  });

  return steps;
}

export class ClimbStairsVisualizer extends StepVisualizer<StairsStep> {
  protected codeLines = [
    'public int climbStairs(int n) {',
    '    if (n <= 2) return n;',
    '    int[] dp = new int[n + 1];',
    '    dp[1] = 1;',
    '    dp[2] = 2;',
    '',
    '    for (int i = 3; i <= n; i++) {',
    '        dp[i] = dp[i - 1] + dp[i - 2];',
    '    }',
    '    return dp[n];',
    '}',
  ];
  protected codePanelTitle = 'Java 动态规划代码';

  private inputEl: HTMLInputElement | null = null;
  private trackEl: HTMLElement | null = null;
  private formulaEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private currentEl: HTMLElement | null = null;
  private prev1El: HTMLElement | null = null;
  private prev2El: HTMLElement | null = null;
  private answerEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputEl = this.root.querySelector('#stairs-input');
    this.trackEl = this.root.querySelector('#stairs-track');
    this.formulaEl = this.root.querySelector('#stairs-formula');
    this.logEl = this.root.querySelector('#stairs-log');
    this.currentEl = this.root.querySelector('#stairs-current');
    this.prev1El = this.root.querySelector('#stairs-prev1');
    this.prev2El = this.root.querySelector('#stairs-prev2');
    this.answerEl = this.root.querySelector('#stairs-answer');
    this.bindPlaybackControls({ message: 'step-message' });
    this.root.querySelector('#stairs-start')?.addEventListener('click', () => this.start());
    this.root.querySelectorAll<HTMLButtonElement>('.stairs-example-btn').forEach((button) => {
      button.addEventListener('click', () => {
        if (this.inputEl) this.inputEl.value = button.dataset.value || '8';
        this.start();
      });
    });
  }

  protected buildSteps(): StairsStep[] {
    let n = parseInt(this.inputEl?.value || '8', 10);
    if (!Number.isFinite(n)) n = 8;
    n = Math.max(1, Math.min(12, n));
    if (this.inputEl) this.inputEl.value = String(n);
    return buildStairsSteps(n);
  }

  protected renderStep(step: StairsStep): void {
    if (this.currentEl) this.currentEl.textContent = String(step.currentIndex);
    if (this.prev1El) this.prev1El.textContent = step.currentIndex >= 2 ? String(step.dp[step.currentIndex - 1] || '-') : '-';
    if (this.prev2El) this.prev2El.textContent = step.currentIndex >= 3 ? String(step.dp[step.currentIndex - 2] || '-') : '-';
    if (this.answerEl) this.answerEl.textContent = step.status === 'done' ? String(step.dp[step.n]) : '-';
    if (this.formulaEl) {
      this.formulaEl.textContent = step.currentIndex >= 3
        ? `dp[${step.currentIndex}] = dp[${step.currentIndex - 1}] + dp[${step.currentIndex - 2}]`
        : 'dp[i] = dp[i-1] + dp[i-2]';
    }
    this.renderTrack(step);
    this.renderLogLines();
  }

  private renderTrack(step: StairsStep): void {
    if (!this.trackEl) return;
    // DOM 复用：按 step 编号保持 cell，仅更新状态/值，避免每步重建。
    const existing = new Map<string, HTMLElement>();
    Array.from(this.trackEl.querySelectorAll<HTMLElement>('[data-step]')).forEach((el) => {
      existing.set(el.dataset.step!, el);
    });
    const seen = new Set<string>();
    for (let i = 1; i <= step.n; i++) {
      const key = String(i);
      seen.add(key);
      let cell = existing.get(key);
      if (!cell) {
        cell = document.createElement('div');
        cell.className = 'stairs-step';
        cell.dataset.step = key;
        cell.innerHTML = `
          <div class="stairs-step-index">第 ${i} 阶</div>
          <div class="stairs-step-value"></div>
        `;
        this.trackEl.appendChild(cell);
      }
      const isSource = i === step.currentIndex - 1 || i === step.currentIndex - 2;
      cell.classList.toggle('active', i === step.currentIndex);
      cell.classList.toggle('source', isSource);
      // 新计算的 cell 发光（compute 状态下当前格亮起）
      cell.classList.toggle('computing', step.status === 'compute' && i === step.currentIndex);
      const valueEl = cell.querySelector<HTMLElement>('.stairs-step-value');
      if (valueEl) valueEl.textContent = String(step.dp[i] ?? '?');
    }
    existing.forEach((el, key) => {
      if (!seen.has(key)) el.remove();
    });
    const active = this.trackEl.children[step.currentIndex - 1] as HTMLElement | undefined;
    active?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    // 绘制转移箭头：dp[i-1] / dp[i-2] -> dp[i]
    this.drawStairsArrows(step);
  }

  /** 一维转移箭头：当 dp[i] 被计算时，从 dp[i-1] / dp[i-2] 指向 dp[i] */
  private drawStairsArrows(step: StairsStep): void {
    if (!this.trackEl) return;
    const host = this.trackEl;
    const prevPos = getComputedStyle(host).position;
    if (prevPos === 'static') host.style.position = 'relative';
    let svg = host.querySelector<SVGSVGElement>(':scope > .stairs-transition-overlay');
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'stairs-transition-overlay');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      marker.setAttribute('id', 'stairs-arrow');
      marker.setAttribute('viewBox', '0 0 10 10');
      marker.setAttribute('refX', '8');
      marker.setAttribute('refY', '5');
      marker.setAttribute('markerWidth', '7');
      marker.setAttribute('markerHeight', '7');
      marker.setAttribute('orient', 'auto-start-reverse');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
      path.setAttribute('fill', '#fbbf24');
      marker.appendChild(path);
      defs.appendChild(marker);
      svg.appendChild(defs);
      host.appendChild(svg);
    }
    svg.innerHTML = svg.querySelector('defs')?.outerHTML || '';
    const i = step.currentIndex;
    // 仅在 compute 状态（真正计算 dp[i] 的步骤）画箭头，且 i>=3
    if (step.status !== 'compute' || i < 3) return;
    const sources = [i - 1, i - 2].filter((s) => s >= 1);
    if (sources.length === 0) return;
    const toCell = host.querySelector<HTMLElement>(`.stairs-step[data-step="${i}"]`);
    if (!toCell) return;
    const hostRect = host.getBoundingClientRect();
    const toRect = toCell.getBoundingClientRect();
    const toX = toRect.left - hostRect.left + toRect.width / 2;
    const toY = toRect.top - hostRect.top + toRect.height / 2;
    sources.forEach((s) => {
      const fromCell = host.querySelector<HTMLElement>(`.stairs-step[data-step="${s}"]`);
      if (!fromCell) return;
      const fromRect = fromCell.getBoundingClientRect();
      const fromX = fromRect.left - hostRect.left + fromRect.width / 2;
      const fromY = fromRect.top - hostRect.top + fromRect.height / 2;
      const dx = toX - fromX;
      const dy = toY - fromY;
      const dist = Math.hypot(dx, dy) || 1;
      const pad = 22;
      const x1 = fromX + (dx / dist) * pad;
      const y1 = fromY + (dy / dist) * pad;
      const x2 = toX - (dx / dist) * pad;
      const y2 = toY - (dy / dist) * pad;
      // 用稍带弧度的 path 让两支箭头不重叠
      const midX = (x1 + x2) / 2;
      const offset = s === i - 2 ? -18 : 18; // i-2 走上弧，i-1 走下弧
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${x1} ${y1} Q ${midX} ${(y1 + y2) / 2 + offset} ${x2} ${y2}`);
      path.setAttribute('stroke', '#fbbf24');
      path.setAttribute('stroke-width', '2.4');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('fill', 'none');
      path.setAttribute('marker-end', 'url(#stairs-arrow)');
      const len = Math.hypot(x2 - x1, y2 - y1) * 1.15;
      path.style.strokeDasharray = String(len);
      path.style.strokeDashoffset = String(len);
      path.style.animation = 'stairs-draw-arrow 0.5s cubic-bezier(.4,0,.2,1) forwards';
      svg!.appendChild(path);
    });
  }

  private renderLogLines(): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((step, index) => {
      const line = document.createElement('div');
      if (index === this.currentIndex) line.className = 'active';
      line.textContent = `${String(index + 1).padStart(2, '0')}. ${step.log}`;
      this.logEl!.appendChild(line);
    });
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'climb-stairs',
  name: '爬楼梯（动态规划）',
  viewId: 'algo-climb-stairs-view',
  category: 'dynamic-programming',
  description: '使用状态转移 dp[i]=dp[i-1]+dp[i-2] 求方案数',
  icon: '🪜',
  template,
  Visualizer: ClimbStairsVisualizer,
  difficulty: 1,
  levelOrder: 999,
  learningGoal: '理解一维 DP 的状态转移方程',
});
