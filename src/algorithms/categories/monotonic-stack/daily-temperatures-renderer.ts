/**
 * 每日温度可视化器（单调栈）
 * LeetCode 739
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './daily-temperatures.html?raw';

export interface DTStep {
  temps: number[];
  answer: number[];      // 答案数组，0 表示未填
  stack: number[];       // 栈存下标
  current: number;       // 当前 i
  popping: number;       // 正在弹出的下标，-1 无
  status: 'init' | 'push' | 'pop' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildDTSteps(temps: number[]): DTStep[] {
  const steps: DTStep[] = [];
  const n = temps.length;
  const answer = new Array(n).fill(0);
  const stack: number[] = [];

  steps.push({
    temps, answer: [...answer], stack: [], current: -1, popping: -1, status: 'init',
    message: `初始化答案数组全 0，空栈。从左到右遍历，维护温度递减的单调栈。`,
    log: '初始化。',
    codeLine: [1, 2],
  });

  for (let i = 0; i < n; i++) {
    while (stack.length > 0 && temps[i] > temps[stack[stack.length - 1]]) {
      const top = stack.pop()!;
      answer[top] = i - top;
      steps.push({
        temps, answer: [...answer], stack: [...stack], current: i, popping: top, status: 'pop',
        message: `当前温度 ${temps[i]} > 栈顶温度 ${temps[top]}，弹出下标 ${top}，answer[${top}] = ${i} - ${top} = ${answer[top]}。`,
        log: `弹出 ${top}，ans[${top}]=${answer[top]}。`,
        codeLine: [3, 4, 5],
      });
    }
    stack.push(i);
    steps.push({
      temps, answer: [...answer], stack: [...stack], current: i, popping: -1, status: 'push',
      message: `下标 ${i}（温度 ${temps[i]}）入栈。当前栈：[${stack.map((s) => temps[s]).join(', ')}]（温度递减）。`,
      log: `入栈 ${i}。`,
      codeLine: 6,
    });
  }

  // 栈中剩余元素答案保持 0
  const filled = answer.filter((a) => a > 0).length;
  steps.push({
    temps, answer: [...answer], stack: [...stack], current: n, popping: -1, status: 'done',
    message: `遍历结束，栈中剩余 ${stack.length} 个下标没有更高温度，答案为 0。共填 ${filled} 个答案。`,
    log: `完成，答案：[${answer.join(', ')}]。`,
    codeLine: 7,
  });
  return steps;
}

export class DailyTemperaturesVisualizer extends StepVisualizer<DTStep> {
  protected codeLines = [
    'public int[] dailyTemperatures(int[] temperatures) {',
    '    int n = temperatures.length;',
    '    int[] ans = new int[n];',
    '    Deque<Integer> stack = new ArrayDeque<>();',
    '    for (int i = 0; i < n; i++) {',
    '        while (!stack.isEmpty() && temperatures[i] > temperatures[stack.peek()]) {',
    '            int top = stack.pop();',
    '            ans[top] = i - top;',
    '        }',
    '        stack.push(i);',
    '    }',
    '    return ans;',
    '}',
  ];
  protected codePanelTitle = '每日温度代码 (Java)';

  private inputEl: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private barsEl: HTMLElement | null = null;
  private stackEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private iEl: HTMLElement | null = null;
  private curEl: HTMLElement | null = null;
  private topEl: HTMLElement | null = null;
  private filledEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputEl = this.root.querySelector('#dt-input');
    this.btnStart = this.root.querySelector('#dt-start');
    this.exampleButtons = this.root.querySelectorAll('.dt-example-btn');
    this.barsEl = this.root.querySelector('#dt-bars');
    this.stackEl = this.root.querySelector('#dt-stack');
    this.logEl = this.root.querySelector('#dt-log');
    this.iEl = this.root.querySelector('#dt-i');
    this.curEl = this.root.querySelector('#dt-cur');
    this.topEl = this.root.querySelector('#dt-top');
    this.filledEl = this.root.querySelector('#dt-filled');
    this.bindPlaybackControls({
      reset: 'step-reset',
      prev: 'step-prev',
      play: 'step-play',
      next: 'step-next',
      speed: 'dt-speed',
      speedLabel: 'dt-speed-label',
      message: 'step-message'
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => { if (this.inputEl) this.inputEl.value = btn.dataset.val || ''; this.start(); };
    });
  }

  protected buildSteps(): DTStep[] {
    const temps = (this.inputEl?.value || '73,74,75,71,69,72,76,73')
      .split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n));
    if (temps.length === 0) temps.push(73, 74, 75, 71, 69, 72, 76, 73);
    return buildDTSteps(temps);
  }

  protected renderStep(step: DTStep): void {
    if (this.iEl) this.iEl.textContent = step.current < step.temps.length ? String(step.current) : '-';
    if (this.curEl) this.curEl.textContent = step.current < step.temps.length ? String(step.temps[step.current]) : '-';
    if (this.topEl) this.topEl.textContent = step.stack.length > 0 ? String(step.temps[step.stack[step.stack.length - 1]]) : '-';
    if (this.filledEl) this.filledEl.textContent = String(step.answer.filter((a) => a > 0).length);

    if (this.barsEl) {
      this.barsEl.innerHTML = '';
      const maxTemp = Math.max(...step.temps, 1);
      step.temps.forEach((temp, idx) => {
        const col = document.createElement('div');
        col.className = 'dt-bar-col';
        const bar = document.createElement('div');
        bar.className = 'dt-bar';
        bar.style.height = `${(temp / maxTemp) * 180 + 24}px`;
        if (idx === step.current) bar.classList.add('current');
        if (step.stack.includes(idx)) bar.classList.add('instack');
        if (idx === step.popping) bar.classList.add('popping');
        if (step.answer[idx] > 0) bar.classList.add('resolved');
        bar.textContent = String(temp);
        const ans = document.createElement('div');
        ans.className = 'dt-ans';
        if (step.answer[idx] > 0) ans.classList.add('filled');
        ans.textContent = step.answer[idx] > 0 ? `→${step.answer[idx]}` : '→0';
        col.appendChild(bar);
        col.appendChild(ans);
        this.barsEl?.appendChild(col);
      });
    }
    if (this.stackEl) {
      this.stackEl.innerHTML = '';
      if (step.stack.length === 0) {
        this.stackEl.innerHTML = '<span style="color:#64748b;font-size:13px;font-style:italic;">（空栈）</span>';
      } else {
        step.stack.forEach((idx, i) => {
          const item = document.createElement('span');
          item.className = 'dt-stack-item';
          if (i === step.stack.length - 1) item.classList.add('dt-stack-top');
          item.textContent = `${idx}(${step.temps[idx]}°)`;
          this.stackEl?.appendChild(item);
        });
      }
    }
    this.renderLogLine(step);
  }

  private renderLogLine(step: DTStep): void {
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

registerAlgorithm({
  id: 'daily-temperatures',
  name: '每日温度（单调栈）',
  viewId: 'algo-daily-temperatures-view',
  category: 'monotonic-stack',
  description: '单调递减栈求下一个更高温度',
  icon: '🌡️',
  template,
  Visualizer: DailyTemperaturesVisualizer,
  difficulty: 2,
  levelOrder: 1,
  learningGoal: '理解单调栈如何找下一个更大元素',
});
