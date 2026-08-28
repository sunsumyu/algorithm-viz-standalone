/**
 * 柠檬水找零可视化器（贪心算法）
 * LeetCode 860：每杯柠檬水 $5，顾客用 $5/$10/$20 购买，判断能否成功找零
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './lemonade.html?raw';

export type LemonadePhase = 'init' | 'receive' | 'change' | 'fail' | 'done';

export interface LemonadeStep {
  phase: LemonadePhase;
  bills: number[];
  currentIndex: number;
  fiveCount: number;
  tenCount: number;
  twentyCount: number;
  changeGiven: number[];
  success: boolean;
  message: string;
  codeLine: number;
}

/**
 * 柠檬水找零算法（贪心），生成可视化步骤
 */
export function lemonadeSteps(bills: number[]): LemonadeStep[] {
  const steps: LemonadeStep[] = [];

  if (bills.length === 0) {
    steps.push({
      phase: 'done',
      bills: [],
      currentIndex: -1,
      fiveCount: 0,
      tenCount: 0,
      twentyCount: 0,
      changeGiven: [],
      success: true,
      message: '没有顾客，返回 true',
      codeLine: 1
    });
    return steps;
  }

  let five = 0;
  let ten = 0;
  let twenty = 0;

  // 初始状态
  steps.push({
    phase: 'init',
    bills: [...bills],
    currentIndex: -1,
    fiveCount: 0,
    tenCount: 0,
    twentyCount: 0,
    changeGiven: [],
    success: true,
    message: '开始：收银台初始为空',
    codeLine: 2
  });

  for (let i = 0; i < bills.length; i++) {
    const bill = bills[i];
    let changeGiven: number[] = [];

    // 收到 $5
    if (bill === 5) {
      five++;
      steps.push({
        phase: 'receive',
        bills: [...bills],
        currentIndex: i,
        fiveCount: five,
        tenCount: ten,
        twentyCount: twenty,
        changeGiven: [],
        success: true,
        message: `顾客 ${i + 1}：支付 $5，无需找零，收下`,
        codeLine: 6
      });
    }
    // 收到 $10
    else if (bill === 10) {
      steps.push({
        phase: 'receive',
        bills: [...bills],
        currentIndex: i,
        fiveCount: five,
        tenCount: ten,
        twentyCount: twenty,
        changeGiven: [],
        success: true,
        message: `顾客 ${i + 1}：支付 $10，需要找零 $5`,
        codeLine: 8
      });

      if (five === 0) {
        steps.push({
          phase: 'fail',
          bills: [...bills],
          currentIndex: i,
          fiveCount: five,
          tenCount: ten,
          twentyCount: twenty,
          changeGiven: [],
          success: false,
          message: `没有 $5 无法找零，返回 false`,
          codeLine: 9
        });
        return steps;
      }

      five--;
      ten++;
      changeGiven = [5];

      steps.push({
        phase: 'change',
        bills: [...bills],
        currentIndex: i,
        fiveCount: five,
        tenCount: ten,
        twentyCount: twenty,
        changeGiven: changeGiven,
        success: true,
        message: `找零 $5，收下 $10`,
        codeLine: 11
      });
    }
    // 收到 $20
    else {
      steps.push({
        phase: 'receive',
        bills: [...bills],
        currentIndex: i,
        fiveCount: five,
        tenCount: ten,
        twentyCount: twenty,
        changeGiven: [],
        success: true,
        message: `顾客 ${i + 1}：支付 $20，需要找零 $15`,
        codeLine: 13
      });

      // 贪心策略：优先用 $10 + $5 找零，而不是三个 $5
      if (ten > 0 && five > 0) {
        ten--;
        five--;
        twenty++;
        changeGiven = [10, 5];

        steps.push({
          phase: 'change',
          bills: [...bills],
          currentIndex: i,
          fiveCount: five,
          tenCount: ten,
          twentyCount: twenty,
          changeGiven: changeGiven,
          success: true,
          message: `贪心：用 $10 + $5 找零（保留更多 $5）`,
          codeLine: 15
        });
      } else if (five >= 3) {
        five -= 3;
        twenty++;
        changeGiven = [5, 5, 5];

        steps.push({
          phase: 'change',
          bills: [...bills],
          currentIndex: i,
          fiveCount: five,
          tenCount: ten,
          twentyCount: twenty,
          changeGiven: changeGiven,
          success: true,
          message: `没有 $10，用三个 $5 找零`,
          codeLine: 17
        });
      } else {
        steps.push({
          phase: 'fail',
          bills: [...bills],
          currentIndex: i,
          fiveCount: five,
          tenCount: ten,
          twentyCount: twenty,
          changeGiven: [],
          success: false,
          message: `无法找零 $15，返回 false`,
          codeLine: 19
        });
        return steps;
      }
    }
  }

  // 成功完成
  steps.push({
    phase: 'done',
    bills: [...bills],
    currentIndex: bills.length,
    fiveCount: five,
    tenCount: ten,
    twentyCount: twenty,
    changeGiven: [],
    success: true,
    message: `完成！所有顾客成功找零，返回 true`,
    codeLine: 23
  });

  return steps;
}

export class LemonadeVisualizer extends StepVisualizer<LemonadeStep> {
  protected codeLines = [
    "public boolean lemonadeChange(int[] bills) {",
    "    int five = 0, ten = 0;",
    "    ",
    "    for (int bill : bills) {",
    "        if (bill == 5) {",
    "            five++;",
    "        } else if (bill == 10) {",
    "            if (five == 0) return false;",
    "            five--;",
    "            ten++;",
    "        } else { // bill == 20",
    "            if (ten > 0 && five > 0) {",
    "                ten--;",
    "                five--;",
    "            } else if (five >= 3) {",
    "                five -= 3;",
    "            } else {",
    "                return false;",
    "            }",
    "        }",
    "    }",
    "    ",
    "    return true;",
    "}"
  ];
  protected codePanelTitle = '贪心算法 (Java)';

  private inputField: HTMLInputElement | null = null;
  private transactionsEl: HTMLElement | null = null;
  private fiveCountEl: HTMLElement | null = null;
  private tenCountEl: HTMLElement | null = null;
  private twentyCountEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private stepMessageEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private prevFive = 0;
  private prevTen = 0;
  private prevTwenty = 0;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.inputField = this.root.querySelector('#lemonade-input');
    this.transactionsEl = this.root.querySelector('#lemonade-transactions');
    this.fiveCountEl = this.root.querySelector('#five-count');
    this.tenCountEl = this.root.querySelector('#ten-count');
    this.twentyCountEl = this.root.querySelector('#twenty-count');
    this.resultEl = this.root.querySelector('#lm-result');
    this.stepMessageEl = this.root.querySelector('#step-message');
    this.logEl = this.root.querySelector('#lm-log');

    this.bindPlaybackControls({
      reset: 'step-reset',
      prev: 'step-prev',
      play: 'step-play',
      next: 'step-next',
      speed: 'lm-speed',
      speedLabel: 'lm-speed-label',
      message: 'lemonade-status'
    });

    this.root.querySelector('#lemonade-start')?.addEventListener('click', () => this.start());

    this.root.querySelectorAll('.lm-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.getAttribute('data-val');
        if (val && this.inputField) this.inputField.value = val;
      });
    });

    this.root.querySelector('#lm-log-clear')?.addEventListener('click', () => {
      if (this.logEl) this.logEl.innerHTML = '';
    });
  }

  protected buildSteps(): LemonadeStep[] {
    let bills = [5, 5, 5, 10, 20];

    if (this.inputField) {
      const input = this.inputField.value.trim();
      if (input) {
        const parsed = input.split(',').map(n => parseInt(n.trim())).filter(n => n === 5 || n === 10 || n === 20);
        if (parsed.length > 0) bills = parsed;
      }
    }

    return lemonadeSteps(bills);
  }

  private bumpStat(el: HTMLElement | null, prev: number, current: number): void {
    if (!el) return;
    el.textContent = current.toString();
    if (prev !== current) {
      el.classList.remove('lm-bump');
      void el.offsetWidth; // 触发回流以重启动画
      el.classList.add('lm-bump');
    }
  }

  protected renderStep(step: LemonadeStep): void {
    if (!this.transactionsEl || !this.fiveCountEl || !this.tenCountEl || !this.twentyCountEl ||
        !this.resultEl || !this.stepMessageEl) return;

    // 更新收银台计数（带 bump 动画）
    this.bumpStat(this.fiveCountEl, this.prevFive, step.fiveCount);
    this.bumpStat(this.tenCountEl, this.prevTen, step.tenCount);
    this.bumpStat(this.twentyCountEl, this.prevTwenty, step.twentyCount);
    this.prevFive = step.fiveCount;
    this.prevTen = step.tenCount;
    this.prevTwenty = step.twentyCount;

    // 更新结果横幅
    this.resultEl.className = 'lm-result';
    if (step.phase === 'done') {
      this.resultEl.classList.add('lm-result--success');
      this.stepMessageEl.textContent = `✅ ${step.message}`;
    } else if (step.phase === 'fail') {
      this.resultEl.classList.add('lm-result--fail');
      this.stepMessageEl.textContent = `❌ ${step.message}`;
    } else if (step.currentIndex >= 0) {
      this.stepMessageEl.textContent = step.message;
    } else {
      this.stepMessageEl.textContent = '点击「开始找零」观看钞票飞入与找零弹出动画';
    }

    // 渲染交易列表
    this.transactionsEl.innerHTML = '';

    step.bills.forEach((bill, index) => {
      const row = document.createElement('div');
      row.className = 'lm-tx-row';

      if (index === step.currentIndex) {
        if (step.phase === 'fail') {
          row.classList.add('lm-tx--fail');
        } else {
          row.classList.add('lm-tx--current');
        }
      } else if (index < step.currentIndex) {
        row.classList.add('lm-tx--success');
      }

      // 序号
      const num = document.createElement('div');
      num.className = 'lm-tx-num';
      num.textContent = `#${index + 1}`;
      row.appendChild(num);

      // 支付的钞票
      const paidBill = document.createElement('div');
      paidBill.className = `lm-bill lm-bill--${bill}`;
      paidBill.textContent = `$${bill}`;
      row.appendChild(paidBill);

      // 找零显示
      const change = document.createElement('div');
      change.className = 'lm-change';

      if (index === step.currentIndex && step.changeGiven.length > 0) {
        const lbl = document.createElement('span');
        lbl.textContent = '找零:';
        change.appendChild(lbl);
        step.changeGiven.forEach((c, ci) => {
          const changeBill = document.createElement('span');
          changeBill.className = `lm-change-bill lm-change-bill--${c}`;
          changeBill.textContent = `$${c}`;
          changeBill.style.animationDelay = `${ci * 0.1}s`;
          change.appendChild(changeBill);
        });
      } else if (index === step.currentIndex && bill === 5) {
        const noChange = document.createElement('span');
        noChange.style.color = '#6ee7b7';
        noChange.textContent = '无需找零 ✅';
        change.appendChild(noChange);
      } else if (index < step.currentIndex) {
        const done = document.createElement('span');
        done.style.color = '#64748b';
        done.textContent = '已处理';
        change.appendChild(done);
      }

      row.appendChild(change);
      const tx = this.transactionsEl;
      if (tx) tx.appendChild(row);
    });

    // 渲染日志
    this.renderLogPanel(step);
  }

  protected renderLogPanel(step: LemonadeStep): void {
    const log = this.logEl;
    if (!log) return;

    const line = document.createElement('div');
    line.className = 'lm-log-line';
    if (step.phase === 'receive' || step.phase === 'change') {
      line.classList.add('lm-log-active');
    }

    const num = document.createElement('span');
    num.className = 'lm-log-num';
    num.textContent = step.codeLine.toString().padStart(2, '0') + ': ';
    line.appendChild(num);

    const msg = document.createElement('span');
    msg.textContent = step.message;
    line.appendChild(msg);

    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  }

  public reset(): void {
    super.reset();
    this.prevFive = 0;
    this.prevTen = 0;
    this.prevTwenty = 0;
  }
}

registerAlgorithm({
  id: 'lemonade',
  name: '柠檬水找零',
  viewId: 'algo-lemonade-view',
  category: 'greedy',
  description: 'LeetCode 860：贪心算法，每杯柠檬水 $5，顾客用 $5/$10/$20 购买，判断能否成功找零',
  icon: '🍋',
  template,
  Visualizer: LemonadeVisualizer,
  difficulty: 1,
  levelOrder: 10,
  learningGoal: '掌握找零模拟的贪心计数',
});
