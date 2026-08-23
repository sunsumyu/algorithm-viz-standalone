/**
 * 下一个更大元素II 可视化器（单调栈 · 循环数组）
 * LeetCode 503
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './next-greater-element-ii.html?raw';

interface NGE2Step {
  nums: number[];
  answer: number[];          // 结果数组，-Infinity 表示未填
  stack: number[];           // 栈存下标
  current: number;           // 当前原始下标（循环遍历 0 → 2n-2）
  actualIdx: number;         // current % n，实际数组下标
  popping: number;           // 正在弹出的下标，-1 无
  lap: number;               // 0 = 第一圈，1 = 第二圈
  status: 'init' | 'traverse-push' | 'traverse-pop' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

function buildNGE2Steps(nums: number[]): NGE2Step[] {
  const steps: NGE2Step[] = [];
  const n = nums.length;
  const answer: number[] = new Array(n).fill(-Infinity);
  const stack: number[] = [];

  steps.push({
    nums, answer: [...answer], stack: [], current: -1, actualIdx: -1, popping: -1, lap: 0, status: 'init',
    message: `初始化：结果数组全 -Infinity（未填），空栈。循环数组 = 遍历 2n-1 次，i 从 2n-1 递减到 0，实际下标 = i % n。`,
    log: '初始化。',
    codeLine: [1, 2, 3],
  });

  for (let i = 2 * n - 1; i >= 0; i--) {
    const idx = i % n;
    const lapNum = i >= n ? 1 : 0;

    // 弹栈阶段
    let popped = false;
    while (stack.length > 0 && nums[idx] >= nums[stack[stack.length - 1]]) {
      const top = stack.pop()!;
      popped = true;
      steps.push({
        nums, answer: [...answer], stack: [...stack], current: i, actualIdx: idx, popping: top, lap: lapNum, status: 'traverse-pop',
        message: `i=${i}（实际下标 ${idx}），nums[${idx}]=${nums[idx]} >= 栈顶 nums[${top}]=${nums[top]}，弹出下标 ${top}。`,
        log: `弹出 ${top}(val=${nums[top]})。`,
        codeLine: [5, 6],
      });
    }

    // 填答案
    answer[idx] = stack.length > 0 ? nums[stack[stack.length - 1]] : -1;

    // 入栈阶段
    stack.push(idx);
    steps.push({
      nums, answer: [...answer], stack: [...stack], current: i, actualIdx: idx, popping: -1, lap: lapNum, status: 'traverse-push',
      message: `i=${i}（实际下标 ${idx}），nums[${idx}]=${nums[idx]} 入栈。答案 ans[${idx}] = ${answer[idx] === -1 ? '-1（无更大元素）' : answer[idx]}。当前栈：[${stack.join(', ')}]。`,
      log: `i=${i}, idx=${idx}, ans[${idx}]=${answer[idx]}。`,
      codeLine: [7, 8, 9],
    });
  }

  // 完成
  const filled = answer.filter((a) => a !== -Infinity).length;
  steps.push({
    nums, answer: [...answer], stack: [...stack], current: -1, actualIdx: -1, popping: -1, lap: 1, status: 'done',
    message: `遍历结束！共填 ${filled} 个答案。结果：[${answer.join(', ')}]。`,
    log: `完成，结果：[${answer.join(', ')}]。`,
    codeLine: [10],
  });
  return steps;
}

export class NextGreaterElementIIVisualizer extends StepVisualizer<NGE2Step> {
  protected codeLines = [
    'public int[] nextGreaterElements(int[] nums) {',
    '    int n = nums.length;',
    '    int[] ans = new int[n];',
    '    Deque<Integer> stack = new ArrayDeque<>();',
    '    for (int i = 2 * n - 1; i >= 0; i--) {',
    '        while (!stack.isEmpty() && nums[i % n] >= nums[stack.peek()])',
    '            stack.pop();',
    '        ans[i % n] = stack.isEmpty() ? -1 : nums[stack.peek()];',
    '        stack.push(i % n);',
    '    }',
    '    return ans;',
    '}',
  ];
  protected codePanelTitle = '下一个更大元素II 代码 (Java)';

  private inputEl: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private barsEl: HTMLElement | null = null;
  private stackEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private iEl: HTMLElement | null = null;
  private idxEl: HTMLElement | null = null;
  private topEl: HTMLElement | null = null;
  private filledEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputEl = this.root.querySelector('#nge2-input');
    this.btnStart = this.root.querySelector('#nge2-start');
    this.exampleButtons = this.root.querySelectorAll('.nge2-example-btn');
    this.barsEl = this.root.querySelector('#nge2-bars');
    this.stackEl = this.root.querySelector('#nge2-stack');
    this.logEl = this.root.querySelector('#nge2-log');
    this.iEl = this.root.querySelector('#nge2-i');
    this.idxEl = this.root.querySelector('#nge2-idx');
    this.topEl = this.root.querySelector('#nge2-top');
    this.filledEl = this.root.querySelector('#nge2-filled');
    this.bindPlaybackControls({
      reset: 'step-reset',
      prev: 'step-prev',
      play: 'step-play',
      next: 'step-next',
      speed: 'nge2-speed',
      speedLabel: 'nge2-speed-label',
      message: 'step-message'
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => { if (this.inputEl) this.inputEl.value = btn.dataset.val || ''; this.start(); };
    });
  }

  protected buildSteps(): NGE2Step[] {
    const nums = (this.inputEl?.value || '1,2,1')
      .split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((v) => Number.isFinite(v));
    if (nums.length === 0) nums.push(1, 2, 1);
    return buildNGE2Steps(nums);
  }

  protected renderStep(step: NGE2Step): void {
    // 统计面板
    if (this.iEl) this.iEl.textContent = step.current >= 0 ? String(step.current) : '-';
    if (this.idxEl) this.idxEl.textContent = step.actualIdx >= 0 ? `${step.actualIdx}` : '-';
    if (this.topEl) this.topEl.textContent = step.stack.length > 0 ? String(step.nums[step.stack[step.stack.length - 1]]) : '-';
    if (this.filledEl) this.filledEl.textContent = String(step.answer.filter((a) => a !== -Infinity).length);

    // 柱状图
    if (this.barsEl) {
      this.barsEl.innerHTML = '';
      const maxVal = Math.max(...step.nums, 1);
      step.nums.forEach((val, idx) => {
        const col = document.createElement('div');
        col.className = 'nge2-bar-col';

        // 标签行：索引 + 值
        const label = document.createElement('div');
        label.className = 'nge2-bar-label';
        label.textContent = `[${idx}]`;

        const bar = document.createElement('div');
        bar.className = 'nge2-bar';
        bar.style.height = `${(val / maxVal) * 160 + 28}px`;
        bar.textContent = String(val);

        // 当前元素高亮
        if (idx === step.actualIdx && step.current >= 0) bar.classList.add('current');
        // 栈内元素
        if (step.stack.includes(idx)) bar.classList.add('instack');
        // 正在弹出
        if (idx === step.popping) bar.classList.add('popping');
        // 已填答案
        if (step.answer[idx] !== -Infinity) bar.classList.add('resolved');

        const ans = document.createElement('div');
        ans.className = 'nge2-ans';
        if (step.answer[idx] !== -Infinity) {
          ans.classList.add('filled');
          ans.textContent = step.answer[idx] === -1 ? '→ -1' : `→ ${step.answer[idx]}`;
        } else {
          ans.textContent = '→ ?';
        }

        col.appendChild(label);
        col.appendChild(bar);
        col.appendChild(ans);
        this.barsEl?.appendChild(col);
      });
    }

    // 栈区域
    if (this.stackEl) {
      this.stackEl.innerHTML = '';
      if (step.stack.length === 0) {
        this.stackEl.innerHTML = '<span style="color:#64748b;font-size:13px;font-style:italic;">（空栈）</span>';
      } else {
        step.stack.forEach((sIdx, i) => {
          const item = document.createElement('span');
          item.className = 'nge2-stack-item';
          if (i === step.stack.length - 1) item.classList.add('nge2-stack-top');
          item.textContent = `${sIdx}(${step.nums[sIdx]})`;
          this.stackEl?.appendChild(item);
        });
      }
    }

    this.renderLogLine(step);
  }

  private renderLogLine(step: NGE2Step): void {
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
  id: 'next-greater-element-ii',
  name: '下一个更大元素II',
  viewId: 'algo-next-greater-element-ii-view',
  category: 'monotonic-stack',
  description: '单调栈处理循环数组，找下一个更大元素',
  icon: '🔄',
  template,
  Visualizer: NextGreaterElementIIVisualizer,
  difficulty: 2,
  levelOrder: 3,
  learningGoal: '理解单调栈如何处理循环数组',
});
