/**
 * 移除元素可视化器（双指针）
 * LeetCode 27
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './remove-element.html?raw';

interface RemoveStep {
  array: number[];
  fast: number;
  slow: number;
  val: number;
  status: 'check' | 'skip' | 'copy' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export class RemoveElementVisualizer extends StepVisualizer<RemoveStep> {
  protected codeLines = [
    'public int removeElement(int[] nums, int val) {',
    '    int slow = 0;',
    '    for (int fast = 0; fast < nums.length; fast++) {',
    '        if (nums[fast] != val) {',
    '            nums[slow] = nums[fast];',
    '            slow++;',
    '        }',
    '    }',
    '    return slow;',
    '}',
  ];
  protected codePanelTitle = '移除元素 Java 实现';

  private arrayInput: HTMLInputElement | null = null;
  private valInput: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private trackEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private fastEl: HTMLElement | null = null;
  private slowEl: HTMLElement | null = null;
  private curEl: HTMLElement | null = null;
  private lenEl: HTMLElement | null = null;
  private currentVal = 3;
  private currentArray: number[] = [3, 2, 2, 3, 4, 3, 5];
  /** 持久化的 cell DOM，按 index 复用，避免每步销毁重建 */
  private cellGrid: HTMLElement[] = [];
  /** 上一帧每个 index 对应的值，用于检测 overwriting */
  private prevValues: number[] = [];

  protected initDOMElements(): void {
    if (!this.root) return;
    this.arrayInput = this.root.querySelector('#rm-array-input');
    this.valInput = this.root.querySelector('#rm-val-input');
    this.btnStart = this.root.querySelector('#rm-start');
    this.exampleButtons = this.root.querySelectorAll('.rm-example-btn');
    this.trackEl = this.root.querySelector('#rm-track');
    this.logEl = this.root.querySelector('#rm-log');
    this.fastEl = this.root.querySelector('#rm-fast');
    this.slowEl = this.root.querySelector('#rm-slow');
    this.curEl = this.root.querySelector('#rm-cur');
    this.lenEl = this.root.querySelector('#rm-len');
    this.bindPlaybackControls({ message: 'step-message' });

    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => {
        if (this.arrayInput) this.arrayInput.value = btn.dataset.arr || '';
        if (this.valInput) this.valInput.value = btn.dataset.val || '';
        this.start();
      };
    });
  }

  protected buildSteps(): RemoveStep[] {
    const arr = this.parseArray(this.arrayInput?.value || '3,2,2,3,4,3,5');
    const val = parseInt(this.valInput?.value || '3', 10);
    this.currentArray = [...arr];
    this.currentVal = Number.isFinite(val) ? val : 3;

    const steps: RemoveStep[] = [];
    let slow = 0;
    const work = [...arr];

    steps.push({
      array: [...work], fast: 0, slow: 0, val: this.currentVal, status: 'check',
      message: `初始化 slow=0，fast 从 0 开始遍历，要移除的值 val=${this.currentVal}。`,
      log: '初始化快慢指针。',
      codeLine: [1, 2],
    });

    for (let fast = 0; fast < work.length; fast++) {
      steps.push({
        array: [...work], fast, slow, val: this.currentVal, status: 'check',
        message: `fast=${fast}，检查 nums[fast]=${work[fast]} 是否等于 val=${this.currentVal}。`,
        log: `检查 nums[${fast}]=${work[fast]}。`,
        codeLine: 3,
      });

      if (work[fast] !== this.currentVal) {
        const prevVal = work[slow];
        work[slow] = work[fast];
        steps.push({
          array: [...work], fast, slow, val: this.currentVal, status: 'copy',
          message: `nums[fast]=${work[fast]} ≠ val，复制到 slow=${slow} 位置（原值 ${prevVal}），slow++ → ${slow + 1}。`,
          log: `保留：nums[${slow}] = ${work[fast]}（原值 ${prevVal}），slow -> ${slow + 1}。`,
          codeLine: [4, 5, 6],
        });
        slow++;
      } else {
        steps.push({
          array: [...work], fast, slow, val: this.currentVal, status: 'skip',
          message: `nums[fast]=${work[fast]} == val，跳过，不复制。`,
          log: `等于 val，跳过。`,
          codeLine: 3,
        });
      }
    }

    steps.push({
      array: [...work], fast: work.length, slow, val: this.currentVal, status: 'done',
      message: `遍历结束，新长度 = slow = ${slow}（前 ${slow} 个元素为移除后的结果）。`,
      log: `返回 slow = ${slow}。`,
      codeLine: 8,
    });
    return steps;
  }

  private parseArray(input: string): number[] {
    return input.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n));
  }

  protected renderStep(step: RemoveStep): void {
    if (this.fastEl) this.fastEl.textContent = String(step.fast);
    if (this.slowEl) this.slowEl.textContent = String(step.slow);
    if (this.curEl) this.curEl.textContent = step.fast < step.array.length ? String(step.array[step.fast]) : '-';
    if (this.lenEl) this.lenEl.textContent = String(step.slow);

    if (this.trackEl) {
      this.ensureCells(step.array.length);
      step.array.forEach((value, index) => {
        const cell = this.cellGrid[index];
        if (!cell) return;
        // 计算各类状态
        const isFast = index === step.fast && step.fast < step.array.length;
        const isSlow = index === step.slow && step.status !== 'done';
        const isTarget = value === step.val;
        const isKept = index < step.slow;

        // 检测 overwriting：slow 位置在新值覆盖旧值时
        const prevVal = this.prevValues[index];
        const isOverwriting =
          step.status === 'copy' &&
          index === step.slow &&
          prevVal !== undefined &&
          prevVal !== value;
        const isRemoving =
          step.status === 'skip' && index === step.fast && isTarget;

        // 切换 class（复用 DOM，transition 生效）
        cell.classList.toggle('fast', isFast);
        cell.classList.toggle('slow', isSlow);
        cell.classList.toggle('target', isTarget);
        cell.classList.toggle('kept', isKept);
        cell.classList.toggle('done', step.status === 'done' && index < step.slow);

        // 重启 overwriting / removing 动画
        if (isOverwriting) {
          this.restartAnimation(cell, 'overwriting');
        } else {
          cell.classList.remove('overwriting');
        }
        if (isRemoving) {
          this.restartAnimation(cell, 'removing');
        } else {
          cell.classList.remove('removing');
        }

        // 指针标签
        let pointers = '';
        if (isFast) pointers += '<span class="rm-ptr fast">fast</span>';
        if (isSlow) pointers += '<span class="rm-ptr slow">slow</span>';
        cell.innerHTML = `${pointers}<span class="idx">${index}</span><span class="val">${value}</span>`;
        // 重启动画后需要重新附加 innerHTML，class 仍保留
      });
      this.prevValues = [...step.array];
    }
    this.renderLogLine(step);
  }

  /** 按需创建/回收 cell，长度匹配时复用 */
  private ensureCells(n: number): void {
    if (!this.trackEl) return;
    // 长度增加：追加新 cell
    while (this.cellGrid.length < n) {
      const cell = document.createElement('div');
      cell.className = 'rm-cell';
      this.cellGrid.push(cell);
      this.trackEl.appendChild(cell);
      this.prevValues.push(undefined as unknown as number);
    }
    // 长度减少：移除多余 cell
    while (this.cellGrid.length > n) {
      const cell = this.cellGrid.pop();
      if (cell && cell.parentElement === this.trackEl) this.trackEl.removeChild(cell);
      this.prevValues.pop();
    }
  }

  /** 重启 CSS 动画 class：先移除，强制 reflow，再加回 */
  private restartAnimation(el: HTMLElement, cls: string): void {
    el.classList.remove(cls);
    // 强制 reflow 以重启动画
    void el.offsetWidth;
    el.classList.add(cls);
  }

  private renderLogLine(step: RemoveStep): void {
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
  id: 'remove-element',
  name: '移除元素（双指针）',
  viewId: 'algo-remove-element-view',
  category: 'array',
  description: '快慢指针原地移除指定值的元素',
  icon: '🧹',
  template,
  Visualizer: RemoveElementVisualizer,
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握快慢双指针原地修改数组的思路',
});
