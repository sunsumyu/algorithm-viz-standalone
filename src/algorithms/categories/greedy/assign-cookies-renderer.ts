/**
 * 分发饼干可视化器（贪心算法）
 * LeetCode 455
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './assign-cookies.html?raw';

export type AcPhase = 'init' | 'check' | 'matched' | 'skip' | 'done';

interface AssignCookiesStep {
  phase: AcPhase;
  children: number[];
  cookies: number[];
  childIndex: number;
  cookieIndex: number;
  satisfiedCount: number;
  /** 已被满足的孩子索引集合 */
  satisfiedChildren: number[];
  /** 已被使用的饼干索引集合 */
  matchedCookies: number[];
  /** 已被跳过的饼干索引集合 */
  skippedCookies: number[];
  message: string;
  codeLine: number;
}

/**
 * 分发饼干算法（贪心），生成可视化步骤
 */
function assignCookiesSteps(children: number[], cookies: number[]): AssignCookiesStep[] {
  const steps: AssignCookiesStep[] = [];

  const sortedChildren = [...children].sort((a, b) => a - b);
  const sortedCookies = [...cookies].sort((a, b) => a - b);

  steps.push({
    phase: 'init',
    children: [...sortedChildren],
    cookies: [...sortedCookies],
    childIndex: 0,
    cookieIndex: 0,
    satisfiedCount: 0,
    satisfiedChildren: [],
    matchedCookies: [],
    skippedCookies: [],
    message: `排序后：孩子需求 [${sortedChildren.join(', ')}]，饼干大小 [${sortedCookies.join(', ')}]`,
    codeLine: 2
  });

  let childIdx = 0;
  let cookieIdx = 0;
  let satisfied = 0;
  const satisfiedChildren: number[] = [];
  const matchedCookies: number[] = [];
  const skippedCookies: number[] = [];

  while (childIdx < sortedChildren.length && cookieIdx < sortedCookies.length) {
    // 检查
    steps.push({
      phase: 'check',
      children: [...sortedChildren],
      cookies: [...sortedCookies],
      childIndex: childIdx,
      cookieIndex: cookieIdx,
      satisfiedCount: satisfied,
      satisfiedChildren: [...satisfiedChildren],
      matchedCookies: [...matchedCookies],
      skippedCookies: [...skippedCookies],
      message: `检查：孩子需求 ${sortedChildren[childIdx]}，饼干大小 ${sortedCookies[cookieIdx]}`,
      codeLine: 5
    });

    if (sortedCookies[cookieIdx] >= sortedChildren[childIdx]) {
      // 匹配
      satisfied++;
      satisfiedChildren.push(childIdx);
      matchedCookies.push(cookieIdx);
      childIdx++;
      cookieIdx++;

      steps.push({
        phase: 'matched',
        children: [...sortedChildren],
        cookies: [...sortedCookies],
        childIndex: childIdx - 1,
        cookieIndex: cookieIdx - 1,
        satisfiedCount: satisfied,
        satisfiedChildren: [...satisfiedChildren],
        matchedCookies: [...matchedCookies],
        skippedCookies: [...skippedCookies],
        message: `✓ 饼干 ${sortedCookies[cookieIdx - 1]} 满足孩子 ${sortedChildren[childIdx - 1]}，已满足 ${satisfied} 个`,
        codeLine: 7
      });
    } else {
      // 跳过
      skippedCookies.push(cookieIdx);
      cookieIdx++;

      steps.push({
        phase: 'skip',
        children: [...sortedChildren],
        cookies: [...sortedCookies],
        childIndex: childIdx,
        cookieIndex: cookieIdx - 1,
        satisfiedCount: satisfied,
        satisfiedChildren: [...satisfiedChildren],
        matchedCookies: [...matchedCookies],
        skippedCookies: [...skippedCookies],
        message: `✗ 饼干 ${sortedCookies[cookieIdx - 1]} 太小，跳过此饼干`,
        codeLine: 10
      });
    }
  }

  // 完成
  steps.push({
    phase: 'done',
    children: [...sortedChildren],
    cookies: [...sortedCookies],
    childIndex: childIdx,
    cookieIndex: cookieIdx,
    satisfiedCount: satisfied,
    satisfiedChildren: [...satisfiedChildren],
    matchedCookies: [...matchedCookies],
    skippedCookies: [...skippedCookies],
    message: `完成！最多可以满足 ${satisfied} 个孩子`,
    codeLine: 14
  });

  return steps;
}

export class AssignCookiesVisualizer extends StepVisualizer<AssignCookiesStep> {
  protected codeLines = [
    "public int findContentChildren(int[] g, int[] s) {",
    "    Arrays.sort(g);",
    "    Arrays.sort(s);",
    "    ",
    "    int child = 0, cookie = 0;",
    "    while (child < g.length && cookie < s.length) {",
    "        if (s[cookie] >= g[child]) {",
    "            child++;  // 满足当前孩子",
    "            cookie++; // 使用当前饼干",
    "        } else {",
    "            cookie++; // 饼干太小，尝试更大的",
    "        }",
    "    }",
    "    return child;",
    "}",
  ];
  protected codePanelTitle = '贪心算法 (Java)';

  private childrenInput: HTMLInputElement | null = null;
  private cookiesInput: HTMLInputElement | null = null;
  private arraysEl: HTMLElement | null = null;
  private satisfiedCountEl: HTMLElement | null = null;
  private childIndexEl: HTMLElement | null = null;
  private cookieIndexEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private stepMessageEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.childrenInput = this.root.querySelector('#children-input');
    this.cookiesInput = this.root.querySelector('#cookies-input');
    this.arraysEl = this.root.querySelector('#ac-arrays');
    this.satisfiedCountEl = this.root.querySelector('#satisfied-count');
    this.childIndexEl = this.root.querySelector('#child-index');
    this.cookieIndexEl = this.root.querySelector('#cookie-index');
    this.resultEl = this.root.querySelector('#ac-result');
    this.stepMessageEl = this.root.querySelector('#step-message');
    this.logEl = this.root.querySelector('#ac-log');

    this.bindPlaybackControls({
      reset: 'step-reset',
      prev: 'step-prev',
      play: 'step-play',
      next: 'step-next',
      speed: 'ac-speed',
      speedLabel: 'ac-speed-label',
      message: 'assign-status'
    });

    this.root.querySelector('#assign-start')?.addEventListener('click', () => this.start());

    this.root.querySelectorAll('.ac-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const children = chip.getAttribute('data-children');
        const cookies = chip.getAttribute('data-cookies');
        if (children && this.childrenInput) this.childrenInput.value = children;
        if (cookies && this.cookiesInput) this.cookiesInput.value = cookies;
      });
    });

    this.root.querySelector('#ac-log-clear')?.addEventListener('click', () => {
      if (this.logEl) this.logEl.innerHTML = '';
    });
  }

  protected buildSteps(): AssignCookiesStep[] {
    let children = [1, 2, 3];
    let cookies = [1, 1];

    if (this.childrenInput) {
      const input = this.childrenInput.value.trim();
      if (input) {
        const parsed = input.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
        if (parsed.length > 0) children = parsed;
      }
    }

    if (this.cookiesInput) {
      const input = this.cookiesInput.value.trim();
      if (input) {
        const parsed = input.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
        if (parsed.length > 0) cookies = parsed;
      }
    }

    return assignCookiesSteps(children, cookies);
  }

  protected renderStep(step: AssignCookiesStep): void {
    const arraysEl = this.arraysEl;
    if (!arraysEl || !this.satisfiedCountEl || !this.childIndexEl || !this.cookieIndexEl ||
        !this.resultEl || !this.stepMessageEl) return;

    // 更新统计面板
    this.childIndexEl.textContent = step.childIndex.toString();
    this.cookieIndexEl.textContent = step.cookieIndex.toString();
    this.satisfiedCountEl.textContent = step.satisfiedCount.toString();

    // 更新结果横幅
    this.resultEl.className = 'ac-result';
    if (step.phase === 'done') {
      this.resultEl.classList.add('ac-result--done');
      this.stepMessageEl.textContent = `✅ ${step.message}`;
    } else if (step.phase === 'matched') {
      this.resultEl.classList.add('ac-result--match');
      this.stepMessageEl.textContent = `✅ ${step.message}`;
    } else if (step.phase === 'skip') {
      this.resultEl.classList.add('ac-result--skip');
      this.stepMessageEl.textContent = `❌ ${step.message}`;
    } else if (step.childIndex >= 0 && step.phase !== 'init') {
      this.stepMessageEl.textContent = step.message;
    } else {
      this.stepMessageEl.textContent = '点击「开始分配」观看双指针扫描 + 匹配爆发动画';
    }

    // 渲染双数组
    arraysEl.innerHTML = '';

    // 孩子数组
    const childRow = document.createElement('div');
    childRow.className = 'ac-row';
    const childLabel = document.createElement('span');
    childLabel.className = 'ac-row-label ac-row-label--child';
    childLabel.innerHTML = '<span>👨</span> 孩子需求';
    childRow.appendChild(childLabel);

    step.children.forEach((value, index) => {
      const cell = document.createElement('div');
      cell.className = 'ac-cell';

      if (index === step.childIndex && (step.phase === 'check' || step.phase === 'matched')) {
        cell.classList.add('ac-cell--current-child');
      } else if (step.satisfiedChildren.includes(index)) {
        cell.classList.add('ac-cell--satisfied');
      }

      const cellVal = document.createElement('span');
      cellVal.className = 'ac-cell-val';
      cellVal.textContent = value.toString();
      cell.appendChild(cellVal);

      const cellIdx = document.createElement('span');
      cellIdx.className = 'ac-cell-idx';
      cellIdx.textContent = `[${index}]`;
      cell.appendChild(cellIdx);

      childRow.appendChild(cell);
    });
    arraysEl.appendChild(childRow);

    // 饼干数组
    const cookieRow = document.createElement('div');
    cookieRow.className = 'ac-row';
    const cookieLabel = document.createElement('span');
    cookieLabel.className = 'ac-row-label ac-row-label--cookie';
    cookieLabel.innerHTML = '<span>🍪</span> 饼干大小';
    cookieRow.appendChild(cookieLabel);

    step.cookies.forEach((value, index) => {
      const cell = document.createElement('div');
      cell.className = 'ac-cell';

      if (index === step.cookieIndex && (step.phase === 'check' || step.phase === 'skip')) {
        cell.classList.add('ac-cell--current-cookie');
      } else if (step.matchedCookies.includes(index)) {
        cell.classList.add('ac-cell--matched-cookie');
      } else if (step.skippedCookies.includes(index)) {
        cell.classList.add('ac-cell--skipped');
      }

      const cellVal = document.createElement('span');
      cellVal.className = 'ac-cell-val';
      cellVal.textContent = value.toString();
      cell.appendChild(cellVal);

      const cellIdx = document.createElement('span');
      cellIdx.className = 'ac-cell-idx';
      cellIdx.textContent = `[${index}]`;
      cell.appendChild(cellIdx);

      cookieRow.appendChild(cell);
    });
    arraysEl.appendChild(cookieRow);

    // 渲染日志
    this.renderLogPanel(step);
  }

  protected renderLogPanel(step: AssignCookiesStep): void {
    const log = this.logEl;
    if (!log) return;

    const line = document.createElement('div');
    line.className = 'ac-log-line';
    if (step.phase === 'check' || step.phase === 'matched') {
      line.classList.add('ac-log-active');
    }

    const num = document.createElement('span');
    num.className = 'ac-log-num';
    num.textContent = step.codeLine.toString().padStart(2, '0') + ': ';
    line.appendChild(num);

    const msg = document.createElement('span');
    msg.textContent = step.message;
    line.appendChild(msg);

    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  }
}

registerAlgorithm({
  id: 'assign-cookies',
  name: '分发饼干',
  viewId: 'algo-assign-cookies-view',
  category: 'greedy',
  description: 'LeetCode 455：贪心算法，分配饼干满足尽可能多的孩子',
  icon: '🍪',
  template,
  Visualizer: AssignCookiesVisualizer,
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '理解贪心算法的局部最优推导全局最优思想',
});
