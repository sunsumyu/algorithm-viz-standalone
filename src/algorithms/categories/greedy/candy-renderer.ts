/**
 * 分发糖果可视化器（贪心算法）
 * LeetCode 135
 * 重做：玻璃感设计 + rating 放大 + 糖果堆叠 + drop-in 动画
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './candy.html?raw';

interface CandyStep {
  ratings: number[];
  candies: number[];
  currentIndex: number;
  phase: 'init' | 'left-to-right' | 'right-to-left' | 'sum' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

/**
 * 生成可视化步骤：两遍扫描，每遍拆分子步骤显示比较和更新
 */
function candySteps(ratings: number[]): CandyStep[] {
  const steps: CandyStep[] = [];
  const n = ratings.length;

  if (n === 0) {
    steps.push({
      ratings: [], candies: [], currentIndex: -1, phase: 'init',
      message: '输入为空，返回 0', log: 'init: empty', codeLine: 1,
    });
    return steps;
  }

  const candies = new Array(n).fill(1);

  // 初始化
  steps.push({
    ratings: [...ratings], candies: [...candies], currentIndex: -1, phase: 'init',
    message: '初始化：每个孩子至少得到 1 个糖果',
    log: `init: n=${n}, candies=[${candies.join(',')}]`,
    codeLine: [2, 3],
  });

  // 从左到右遍历
  for (let i = 1; i < n; i++) {
    const leftRating = ratings[i - 1];
    const rightRating = ratings[i];

    steps.push({
      ratings: [...ratings], candies: [...candies], currentIndex: i, phase: 'left-to-right',
      message: `左→右：比较位置 ${i}（评分 ${rightRating}）和位置 ${i - 1}（评分 ${leftRating}）`,
      log: `scan L→pos ${i}: compare [${leftRating}] vs [${rightRating}]`,
      codeLine: 5,
    });

    if (rightRating > leftRating) {
      candies[i] = candies[i - 1] + 1;
      steps.push({
        ratings: [...ratings], candies: [...candies], currentIndex: i, phase: 'left-to-right',
        message: `评分 ${rightRating} > ${leftRating}，右侧孩子糖果增加到 ${candies[i]}（= 左侧 ${candies[i - 1]} + 1）`,
        log: `upgrade pos ${i}: -> ${candies[i]}`,
        codeLine: 6,
      });
    }
  }

  // 右→左遍历
  for (let i = n - 2; i >= 0; i--) {
    const leftRating = ratings[i];
    const rightRating = ratings[i + 1];

    steps.push({
      ratings: [...ratings], candies: [...candies], currentIndex: i, phase: 'right-to-left',
      message: `右→左：比较位置 ${i}（评分 ${leftRating}）和位置 ${i + 1}（评分 ${rightRating}）`,
      log: `scan R→pos ${i}: compare [${rightRating}] vs [${leftRating}]`,
      codeLine: 10,
    });

    if (leftRating > rightRating) {
      const oldCandy = candies[i];
      candies[i] = Math.max(candies[i], candies[i + 1] + 1);
      if (candies[i] === oldCandy) {
        steps.push({
          ratings: [...ratings], candies: [...candies], currentIndex: i, phase: 'right-to-left',
          message: `评分 ${leftRating} > ${rightRating}，但已有 ${oldCandy} ≥ ${candies[i + 1] + 1}，无需更新`,
          log: `pos ${i}: ${oldCandy} ≥ ${candies[i + 1] + 1}, skip`,
          codeLine: 11,
        });
      } else {
        steps.push({
          ratings: [...ratings], candies: [...candies], currentIndex: i, phase: 'right-to-left',
          message: `评分 ${leftRating} > ${rightRating}，左侧孩子糖果从 ${oldCandy} 更新为 ${candies[i]}（取 max）`,
          log: `upgrade pos ${i}: ${oldCandy} -> ${candies[i]}`,
          codeLine: 11,
        });
      }
    }
  }

  // sum
  const total = candies.reduce((a, b) => a + b, 0);
  steps.push({
    ratings: [...ratings], candies: [...candies], currentIndex: -1, phase: 'sum',
    message: `计算总糖果数：${candies.join(' + ')} = ${total}`,
    log: `sum ${candies.join('+')} = ${total}`,
    codeLine: 15,
  });

  // done
  steps.push({
    ratings: [...ratings], candies: [...candies], currentIndex: -1, phase: 'done',
    message: `✅ 完成！最少需要 ${total} 个糖果`,
    log: `done: min candies = ${total}`,
    codeLine: 15,
  });

  return steps;
}

export class CandyVisualizer extends StepVisualizer<CandyStep> {
  protected codeLines = [
    "public int candy(int[] ratings) {",
    "    int n = ratings.length;",
    "    int[] candies = new int[n]; Arrays.fill(candies, 1);",
    "    ",
    "    // 从左到右：保证右侧孩子 > 左侧",
    "    for (int i = 1; i < n; i++) {",
    "        if (ratings[i] > ratings[i - 1]) candies[i] = candies[i - 1] + 1;",
    "    }",
    "    ",
    "    // 从右到左：保证左侧孩子 > 右侧（叠加之前的结果）",
    "    for (int i = n - 2; i >= 0; i--) {",
    "        if (ratings[i] > ratings[i + 1]) candies[i] = Math.max(candies[i], candies[i + 1] + 1);",
    "    }",
    "    ",
    "    int sum = 0; for (int c : candies) sum += c; return sum;",
    "}",
  ];
  protected codePanelTitle = '贪心算法 · 分发糖果 (Java)';

  private inputEl: HTMLInputElement | null = null;
  private childrenRowEl: HTMLElement | null = null;
  private phaseEl: HTMLElement | null = null;
  private scanEl: HTMLElement | null = null;
  private totalEl: HTMLElement | null = null;
  private directionEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private clearLogBtn: HTMLButtonElement | null = null;
  private exampleBtns: NodeListOf<HTMLButtonElement> | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputEl = this.root.querySelector('#candy-input');
    this.childrenRowEl = this.root.querySelector('#candy-children-row');
    this.phaseEl = this.root.querySelector('#candy-stat-phase');
    this.scanEl = this.root.querySelector('#candy-stat-scan');
    this.totalEl = this.root.querySelector('#candy-stat-total');
    this.directionEl = this.root.querySelector('.candy-direction');
    this.resultEl = this.root.querySelector('#candy-result');
    this.logEl = this.root.querySelector('#candy-log');
    this.clearLogBtn = this.root.querySelector('#candy-log-clear');
    this.exampleBtns = this.root.querySelectorAll('.candy-chip');

    this.bindPlaybackControls({ message: 'step-message' });

    const startBtn = this.root.querySelector('#candy-start');
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

  protected buildSteps(): CandyStep[] {
    const defaultRatings: number[] = [1, 2, 2];
    let ratings = defaultRatings;
    if (this.inputEl) {
      const input = this.inputEl.value.trim();
      if (input) {
        const parsed = input.split(/[,，\s]+/).map((n) => parseInt(n.trim())).filter(Number.isFinite);
        if (parsed.length > 0) ratings = parsed;
      }
    }
    return candySteps(ratings);
  }

  protected renderStep(step: CandyStep): void {
    this.renderStats(step);
    this.renderChildren(step);
    this.renderDirection(step);
    this.renderResultBanner(step);
    this.renderLogPanel();
  }

  private renderStats(step: CandyStep): void {
    if (this.phaseEl) {
      const phaseNames: Record<string, string> = {
        'init': '准备中',
        'left-to-right': '左→右遍历',
        'right-to-left': '右→左遍历',
        'sum': '计算总和',
        'done': '完成',
      };
      this.phaseEl.textContent = phaseNames[step.phase] || '准备中';
    }
    if (this.scanEl) {
      if (step.phase === 'left-to-right' || step.phase === 'right-to-left') {
        this.scanEl.textContent = `pos ${step.currentIndex}`;
      } else if (step.phase === 'sum') {
        this.scanEl.textContent = '求和';
      } else {
        this.scanEl.textContent = '-';
      }
    }
    if (this.totalEl) {
      const total = step.candies.reduce((a, b) => a + b, 0);
      this.totalEl.textContent = String(total);
    }
  }

  private renderDirection(step: CandyStep): void {
    const dir = this.directionEl;
    if (!dir) return;
    let arrow = '—';
    let text = '准备完成';
    if (step.phase === 'left-to-right') { arrow = '→'; text = '从左到右遍历'; }
    else if (step.phase === 'right-to-left') { arrow = '←'; text = '从右到左遍历'; }
    else if (step.phase === 'sum') { arrow = 'Σ'; text = '求和'; }
    else if (step.phase === 'done') { arrow = '✓'; text = '完成'; }
    dir.innerHTML = `<span class="candy-arrow">${arrow}</span><span>${text}</span>`;
  }

  /** 判断某位置在当前步骤相比上一步是否发生过糖果数变化 */
  private wasJustUpdated(step: CandyStep, idx: number): boolean {
    if (this.currentIndex <= 0) return false;
    const prev = this.steps[this.currentIndex - 1];
    if (!prev || prev.candies[idx] === undefined) return false;
    return step.candies[idx] !== prev.candies[idx];
  }

  private renderChildren(step: CandyStep): void {
    const childrenRowEl = this.childrenRowEl;
    if (!childrenRowEl) return;
    childrenRowEl.innerHTML = '';

    step.ratings.forEach((rating, index) => {
      const child = document.createElement('div');
      child.className = 'candy-child';

      // 1) rating box
      const ratingBox = document.createElement('div');
      ratingBox.className = 'candy-rating';
      ratingBox.textContent = String(rating);
      if (index === step.currentIndex) {
        ratingBox.classList.add('candy-rating--current');
      }
      if (step.phase === 'left-to-right' && index === step.currentIndex - 1) {
        ratingBox.classList.add('candy-rating--adjacent-left');
      } else if (step.phase === 'right-to-left' && index === step.currentIndex + 1) {
        ratingBox.classList.add('candy-rating--adjacent-right');
      }

      // 2) candy stack: candyCount layers stacked bottom-up
      const candyCount = step.candies[index] ?? 0;
      const justUpdated = this.wasJustUpdated(step, index);
      const candyStack = document.createElement('div');
      candyStack.className = 'candy-candy-stack';

      for (let layer = 0; layer < candyCount; layer++) {
        const layerEl = document.createElement('div');
        layerEl.className = 'candy-layer';
        const isTop = layer === candyCount - 1;
        if (isTop) {
          // 顶层显示数值
          const numLabel = document.createElement('span');
          numLabel.className = 'candy-layer-num';
          numLabel.textContent = String(candyCount);
          numLabel.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:11px;font-weight:800;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.4);';
          layerEl.appendChild(numLabel);
          if (justUpdated) {
            layerEl.classList.add('candy-layer--updated');
            // 顶部增加一层时，该层是 "new" 的，drop-in 动画
            layerEl.classList.add('candy-layer--new');
            const updateTag = document.createElement('span');
            updateTag.className = 'candy-label candy-label--update';
            updateTag.textContent = '+1';
            candyStack.appendChild(updateTag);
            // 把 updateTag 定位到顶部
            updateTag.style.position = 'absolute';
            updateTag.style.top = `${-candyCount * 16 - 8}px`;
          }
        } else {
          // 中间层 / 底层 - 静态
          layerEl.classList.add('candy-layer--no-change');
        }
        candyStack.appendChild(layerEl);
      }

      // 3) child label
      const idxLabel = document.createElement('div');
      idxLabel.className = 'candy-label';
      idxLabel.textContent = `#${index}`;
      idxLabel.style.position = 'relative';
      idxLabel.style.top = '0';

      child.appendChild(ratingBox);
      child.appendChild(candyStack);
      child.appendChild(idxLabel);
      childrenRowEl.appendChild(child);
    });
  }

  private renderResultBanner(step: CandyStep): void {
    const resultEl = this.resultEl;
    if (!resultEl) return;
    resultEl.classList.toggle('candy-result--done', step.phase === 'done');
    const emoji = resultEl.querySelector('.candy-emoji') as HTMLElement | null;
    if (emoji) {
      if (step.phase === 'done') emoji.textContent = '✅';
      else if (step.phase === 'sum') emoji.textContent = '📝';
      else if (step.phase === 'right-to-left') emoji.textContent = '↩️';
      else if (step.phase === 'left-to-right') emoji.textContent = '➡️';
      else emoji.textContent = '🍬';
    }
  }

  private renderLogPanel(): void {
    const logEl = this.logEl;
    if (!logEl) return;
    logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const line = document.createElement('div');
      line.className = 'candy-log-line' + (i === this.currentIndex ? ' candy-log-active' : '');
      line.innerHTML = `<span class="candy-log-num">${String(i + 1).padStart(2, '0')}</span><span>${s.log}</span>`;
      logEl.appendChild(line);
    });
    logEl.scrollTop = logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'candy',
  name: '分发糖果',
  viewId: 'algo-candy-view',
  category: 'greedy',
  description: 'LeetCode 135：贪心算法，每个孩子至少一个糖果，评分更高的孩子必须比相邻孩子糖果多',
  icon: '🍬',
  template,
  Visualizer: CandyVisualizer,
  difficulty: 3,
  levelOrder: 9,
  learningGoal: '理解两次遍历的糖果分配策略',
});
