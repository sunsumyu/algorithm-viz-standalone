/**
 * 快乐数可视化器（哈希集合判环）
 * LeetCode 202
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './happy-number.html?raw';

interface HNStep {
  number: number;
  digits: number[];
  squares: number[];
  sum: number;
  seen: number[];
  iteration: number;
  status: 'init' | 'decompose' | 'square' | 'sum' | 'check-seen' | 'happy' | 'cycle';
  message: string;
  log: string;
  codeLine: number | number[];
}

function buildHappyNumberSteps(n: number): HNStep[] {
  const steps: HNStep[] = [];
  const seen = new Set<number>();
  let iteration = 0;

  steps.push({
    number: n, digits: [], squares: [], sum: 0, seen: [], iteration: 0, status: 'init',
    message: `从 n=${n} 开始，每次将数字替换为其各位数字的平方和，直到得到 1（快乐数）或检测到循环（非快乐数）。`,
    log: `初始值 n=${n}。`,
    codeLine: [1, 2],
  });

  while (n !== 1 && !seen.has(n)) {
    // Check seen
    steps.push({
      number: n, digits: [], squares: [], sum: 0, seen: [...seen], iteration, status: 'check-seen',
      message: `检查 n=${n} 是否在 seen 集合中：${seen.has(n) ? '是，发现循环！' : '否，继续处理。'}`,
      log: `检查 ${n} 是否在 seen 中。`,
      codeLine: [3, 4],
    });

    if (seen.has(n)) {
      steps.push({
        number: n, digits: [], squares: [], sum: 0, seen: [...seen], iteration, status: 'cycle',
        message: `发现循环！n=${n} 已经出现过，说明进入无限循环，不是快乐数。`,
        log: `${n} 在 seen 中，循环！`,
        codeLine: [3, 4],
      });
      return steps;
    }

    // Add to seen
    seen.add(n);
    steps.push({
      number: n, digits: [], squares: [], sum: 0, seen: [...seen], iteration, status: 'check-seen',
      message: `将 n=${n} 加入 seen 集合，开始分解数字。`,
      log: `seen.add(${n})。`,
      codeLine: [4],
    });

    // Decompose
    const digits: number[] = [];
    let temp = n;
    while (temp > 0) {
      digits.unshift(temp % 10);
      temp = Math.floor(temp / 10);
    }

    steps.push({
      number: n, digits, squares: [], sum: 0, seen: [...seen], iteration, status: 'decompose',
      message: `将 ${n} 分解为数字：${digits.join(', ')}。`,
      log: `${n} 分解为 [${digits.join(', ')}]。`,
      codeLine: [6, 7],
    });

    // Square
    const squares = digits.map((d) => d * d);
    steps.push({
      number: n, digits, squares, sum: 0, seen: [...seen], iteration, status: 'square',
      message: `计算各位数字的平方：${digits.map((d, i) => `${d}²=${squares[i]}`).join(', ')}。`,
      log: `平方：${digits.map((d, i) => `${d}²=${squares[i]}`).join(', ')}。`,
      codeLine: [8],
    });

    // Sum
    const sum = squares.reduce((a, b) => a + b, 0);
    steps.push({
      number: n, digits, squares, sum, seen: [...seen], iteration, status: 'sum',
      message: `求和：${squares.join(' + ')} = ${sum}。`,
      log: `求和 = ${sum}。`,
      codeLine: [8, 9],
    });

    // Update n
    n = sum;
    iteration++;
    steps.push({
      number: n, digits: [], squares: [], sum: 0, seen: [...seen], iteration, status: 'sum',
      message: `令 n = ${n}，继续下一轮迭代。`,
      log: `n = ${n}，进入下一轮。`,
      codeLine: [10],
    });
  }

  // Check final result
  if (n === 1) {
    steps.push({
      number: n, digits: [], squares: [], sum: 0, seen: [...seen], iteration, status: 'happy',
      message: `n=1，是快乐数！经过 ${iteration} 次迭代，各位数字平方和最终收敛到 1。`,
      log: `n=1，是快乐数！`,
      codeLine: [3, 11],
    });
  }

  return steps;
}

export class HappyNumberVisualizer extends StepVisualizer<HNStep> {
  protected codeLines = [
    'public boolean isHappy(int n) {',
    '    HashSet<Integer> seen = new HashSet<>();',
    '    while (n != 1 && !seen.contains(n)) {',
    '        seen.add(n);',
    '        int sum = 0;',
    '        while (n > 0) {',
    '            int d = n % 10;',
    '            sum += d * d;',
    '            n = n / 10;',
    '        }',
    '        n = sum;',
    '    }',
    '    return n == 1;',
    '}',
  ];
  protected codePanelTitle = 'Java 快乐数代码';

  private numberInput: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private areaEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private curNumEl: HTMLElement | null = null;
  private iterationEl: HTMLElement | null = null;
  private seenSizeEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.numberInput = this.root.querySelector('#hn-number-input');
    this.btnStart = this.root.querySelector('#hn-start');
    this.exampleButtons = this.root.querySelectorAll('.hn-example-btn');
    this.areaEl = this.root.querySelector('#hn-area');
    this.logEl = this.root.querySelector('#hn-log');
    this.curNumEl = this.root.querySelector('#hn-cur-num');
    this.iterationEl = this.root.querySelector('#hn-iteration');
    this.seenSizeEl = this.root.querySelector('#hn-seen-size');
    this.bindPlaybackControls({ message: 'step-message' });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => {
        if (this.numberInput) this.numberInput.value = btn.dataset.num || '19';
        this.start();
      };
    });
  }

  protected buildSteps(): HNStep[] {
    const n = parseInt(this.numberInput?.value || '19', 10) || 19;
    return buildHappyNumberSteps(n);
  }

  protected renderStep(step: HNStep): void {
    if (this.curNumEl) this.curNumEl.textContent = String(step.number);
    if (this.iterationEl) this.iterationEl.textContent = String(step.iteration);
    if (this.seenSizeEl) this.seenSizeEl.textContent = String(step.seen.length);

    if (this.areaEl) {
      this.areaEl.innerHTML = '';

      // Current number display
      const numDisplay = document.createElement('div');
      numDisplay.className = 'hn-current-number';
      if (step.status === 'happy') numDisplay.classList.add('hn-happy');
      if (step.status === 'cycle') numDisplay.classList.add('hn-cycle');
      numDisplay.textContent = String(step.number);
      this.areaEl.appendChild(numDisplay);

      // Decomposition and squares
      if (step.digits.length > 0) {
        const decomposeBlock = document.createElement('div');
        decomposeBlock.className = 'hn-decompose';

        const label = document.createElement('div');
        label.className = 'hn-decompose-label';
        label.textContent = step.status === 'decompose' ? '数字分解' : '平方计算';
        decomposeBlock.appendChild(label);

        const digitsRow = document.createElement('div');
        digitsRow.className = 'hn-digits';

        step.digits.forEach((digit, i) => {
          const box = document.createElement('div');
          box.className = 'hn-digit-box';
          box.style.animationDelay = `${i * 0.1}s`;

          const digitEl = document.createElement('div');
          digitEl.className = 'hn-digit';
          digitEl.textContent = String(digit);
          box.appendChild(digitEl);

          if (step.squares.length > 0) {
            const opEl = document.createElement('div');
            opEl.className = 'hn-op';
            opEl.textContent = '²';
            box.appendChild(opEl);

            const sqEl = document.createElement('div');
            sqEl.className = 'hn-sq';
            sqEl.textContent = `=${step.squares[i]}`;
            box.appendChild(sqEl);
          }

          digitsRow.appendChild(box);

          if (i < step.digits.length - 1) {
            const sep = document.createElement('span');
            sep.className = 'hn-digit-sep';
            sep.textContent = step.squares.length > 0 ? '+' : ',';
            digitsRow.appendChild(sep);
          }
        });

        decomposeBlock.appendChild(digitsRow);
        this.areaEl.appendChild(decomposeBlock);

        // Sum display
        if (step.squares.length > 0 && step.sum > 0) {
          const sumRow = document.createElement('div');
          sumRow.className = 'hn-sum-row';

          const sumLabel = document.createElement('span');
          sumLabel.className = 'hn-sum-label';
          sumLabel.textContent = '求和 =';
          sumRow.appendChild(sumLabel);

          const sumVal = document.createElement('span');
          sumVal.className = 'hn-sum-val';
          sumVal.textContent = String(step.sum);
          sumRow.appendChild(sumVal);

          this.areaEl.appendChild(sumRow);
        }
      }

      // Seen set
      if (step.seen.length > 0) {
        const seenWrap = document.createElement('div');
        seenWrap.className = 'hn-seen-wrap';

        const seenTitle = document.createElement('div');
        seenTitle.className = 'hn-seen-title';
        seenTitle.textContent = '已见集合 (seen)';
        seenWrap.appendChild(seenTitle);

        const seenItems = document.createElement('div');
        seenItems.className = 'hn-seen-items';

        step.seen.forEach((num, i) => {
          const chip = document.createElement('span');
          chip.className = 'hn-seen-chip';
          if (i === step.seen.length - 1 && step.status === 'check-seen') {
            chip.classList.add('hn-seen-latest');
          }
          if (num === step.number && step.status === 'cycle') {
            chip.classList.add('hn-seen-hit');
          }
          chip.textContent = String(num);
          seenItems.appendChild(chip);
        });

        seenWrap.appendChild(seenItems);
        this.areaEl.appendChild(seenWrap);
      }

      // Chain of numbers visited
      if (step.seen.length > 0 || step.status === 'happy') {
        const chainWrap = document.createElement('div');
        chainWrap.className = 'hn-chain-wrap';

        const chainTitle = document.createElement('div');
        chainTitle.className = 'hn-chain-title';
        chainTitle.textContent = '访问序列';
        chainWrap.appendChild(chainTitle);

        const chain = document.createElement('div');
        chain.className = 'hn-chain';

        const sequence = [...step.seen];
        if (step.status !== 'cycle' && step.status !== 'happy') {
          sequence.push(step.number);
        }

        sequence.forEach((num, i) => {
          const node = document.createElement('span');
          node.className = 'hn-chain-node';
          if (num === step.number && step.status === 'happy') {
            node.classList.add('hn-chain-happy');
          } else if (num === step.number && step.status !== 'cycle') {
            node.classList.add('hn-chain-current');
          }
          node.textContent = String(num);
          chain.appendChild(node);

          if (i < sequence.length - 1) {
            const arrow = document.createElement('span');
            arrow.className = 'hn-chain-arrow';
            arrow.textContent = '→';
            chain.appendChild(arrow);
          }
        });

        chainWrap.appendChild(chain);
        this.areaEl.appendChild(chainWrap);
      }
    }

    this.renderLogLine(step);
  }

  private renderLogLine(step: HNStep): void {
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
  id: 'happy-number',
  name: '快乐数（哈希集合判环）',
  viewId: 'algo-happy-number-view',
  category: 'hash-table',
  description: '用哈希集合检测平方和循环，判断快乐数',
  icon: '😊',
  template,
  Visualizer: HappyNumberVisualizer,
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '掌握用 Set 检测循环的方法',
});

export {};
