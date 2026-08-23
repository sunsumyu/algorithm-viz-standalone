/**
 * 反转字符串II 可视化器（分段反转）
 * LeetCode 541
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './reverse-string-ii.html?raw';

interface RS2Step {
  chars: string[];
  k: number;
  blockStart: number;
  left: number;
  right: number;
  i: number;
  status: 'init' | 'check-remaining' | 'reverse' | 'advance' | 'done';
  phase: 'decide' | 'reversing' | 'skipping';
  message: string;
  log: string;
  codeLine: number | number[];
  /** Index up to which characters have been fully processed */
  processedEnd: number;
  /** Whether current step is a swap-just-happened advance */
  swappedLeft: number;
  swappedRight: number;
}

function buildRS2Steps(input: string, k: number): RS2Step[] {
  const steps: RS2Step[] = [];
  const chars = [...input];
  const len = chars.length;
  let reverseCount = 0;
  let blockIdx = 0;
  let processedEnd = 0;

  steps.push({
    chars: [...chars], k, blockStart: 0, left: 0, right: -1, i: 0,
    status: 'init', phase: 'decide',
    message: `初始化：将字符串拆分为字符数组，长度 = ${len}，k = ${k}。`,
    log: '初始化字符数组，准备分段反转。',
    codeLine: [1, 2],
    processedEnd: 0,
    swappedLeft: -1, swappedRight: -1,
  });

  for (let i = 0; i < len; i += 2 * k) {
    const remaining = len - i;
    const left = i;
    const right = Math.min(i + k - 1, len - 1);

    // Step: check remaining
    if (remaining >= k) {
      steps.push({
        chars: [...chars], k, blockStart: i, left, right, i,
        status: 'check-remaining', phase: 'decide',
        message: `第 ${blockIdx + 1} 块：i=${i}，剩余 ${remaining} 个字符 >= k=${k}，反转前 k 个 [${left}..${right}]。`,
        log: `块 ${blockIdx}: i=${i}, 剩余 ${remaining} >= k=${k}, 反转 [${left}..${right}]`,
        codeLine: [3, 4],
        processedEnd,
        swappedLeft: -1, swappedRight: -1,
      });
    } else {
      steps.push({
        chars: [...chars], k, blockStart: i, left, right, i,
        status: 'check-remaining', phase: 'decide',
        message: `第 ${blockIdx + 1} 块：i=${i}，剩余 ${remaining} 个字符 < k=${k}，全部反转 [${left}..${right}]。`,
        log: `块 ${blockIdx}: i=${i}, 剩余 ${remaining} < k=${k}, 全部反转 [${left}..${right}]`,
        codeLine: [3, 4],
        processedEnd,
        swappedLeft: -1, swappedRight: -1,
      });
    }

    // Reverse steps (only if there are at least 2 chars to reverse)
    let l = left, r = right;
    if (l < r) {
      steps.push({
        chars: [...chars], k, blockStart: i, left: l, right: r, i,
        status: 'reverse', phase: 'reversing',
        message: `开始反转：left=${l}, right=${r}，从两端向中间逼近交换。`,
        log: `反转 [${l}..${r}]: left=${l}, right=${r}`,
        codeLine: [5],
        processedEnd,
        swappedLeft: -1, swappedRight: -1,
      });
    }

    while (l < r) {
      steps.push({
        chars: [...chars], k, blockStart: i, left: l, right: r, i,
        status: 'reverse', phase: 'reversing',
        message: `交换 s[${l}]='${chars[l]}' 与 s[${r}]='${chars[r]}'。`,
        log: `交换 '${chars[l]}' <-> '${chars[r]}'`,
        codeLine: [6],
        processedEnd,
        swappedLeft: -1, swappedRight: -1,
      });

      [chars[l], chars[r]] = [chars[r], chars[l]];
      reverseCount++;

      steps.push({
        chars: [...chars], k, blockStart: i, left: l, right: r, i,
        status: 'advance', phase: 'reversing',
        message: `交换完成，left++ → ${l + 1}，right-- → ${r - 1}。`,
        log: `left → ${l + 1}, right → ${r - 1}`,
        codeLine: [7, 8],
        processedEnd,
        swappedLeft: l, swappedRight: r,
      });

      l++;
      r--;
    }

    processedEnd = i + Math.min(2 * k, len - i);

    // After reversal, show skip if there are remaining chars after k
    if (i + k < len && remaining > k) {
      const skipStart = i + k;
      const skipEnd = Math.min(i + 2 * k - 1, len - 1);
      steps.push({
        chars: [...chars], k, blockStart: i, left: l, right: r, i,
        status: 'advance', phase: 'skipping',
        message: `反转完成。跳过后续 ${skipEnd - skipStart + 1} 个字符 [${skipStart}..${skipEnd}]，保持原位不动。`,
        log: `跳过 [${skipStart}..${skipEnd}]（保持原位）`,
        codeLine: [2],
        processedEnd,
        swappedLeft: -1, swappedRight: -1,
      });
    } else {
      // Just mark block as done
      steps.push({
        chars: [...chars], k, blockStart: i, left: l, right: r, i,
        status: 'advance', phase: 'decide',
        message: `块 ${blockIdx + 1} 处理完毕，前进到下一个 2k 块。`,
        log: `块 ${blockIdx} 完成`,
        codeLine: [2],
        processedEnd,
        swappedLeft: -1, swappedRight: -1,
      });
    }

    blockIdx++;
  }

  steps.push({
    chars: [...chars], k, blockStart: 0, left: 0, right: 0, i: len,
    status: 'done', phase: 'decide',
    message: `所有块处理完成！结果：${chars.join('')}`,
    log: `完成！共反转 ${reverseCount} 次，结果: ${chars.join('')}`,
    codeLine: [11],
    processedEnd: len,
    swappedLeft: -1, swappedRight: -1,
  });

  return steps;
}

export class ReverseStringIIVisualizer extends StepVisualizer<RS2Step> {
  protected codeLines = [
    'public String reverseStr(String s, int k) {',
    '    char[] arr = s.toCharArray();',
    '    for (int i = 0; i < arr.length; i += 2 * k) {',
    '        int left = i;',
    '        int right = Math.min(i + k - 1, arr.length - 1);',
    '        while (left < right) {',
    '            char tmp = arr[left];',
    '            arr[left] = arr[right];',
    '            arr[right] = tmp;',
    '            left++;',
    '            right--;',
    '        }',
    '    }',
    '    return new String(arr);',
    '}',
  ];
  protected codePanelTitle = '反转字符串II 代码 (Java)';

  private inputEl: HTMLInputElement | null = null;
  private inputKEl: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private trackEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private blockEl: HTMLElement | null = null;
  private posEl: HTMLElement | null = null;
  private kEl: HTMLElement | null = null;
  private revEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputEl = this.root.querySelector('#rs2-input');
    this.inputKEl = this.root.querySelector('#rs2-input-k');
    this.btnStart = this.root.querySelector('#rs2-start');
    this.exampleButtons = this.root.querySelectorAll('.rs2-example-btn');
    this.trackEl = this.root.querySelector('#rs2-track');
    this.logEl = this.root.querySelector('#rs2-log');
    this.blockEl = this.root.querySelector('#rs2-block');
    this.posEl = this.root.querySelector('#rs2-pos');
    this.kEl = this.root.querySelector('#rs2-k');
    this.revEl = this.root.querySelector('#rs2-rev');
    this.bindPlaybackControls({ message: 'step-message' });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => {
        if (this.inputEl) this.inputEl.value = btn.dataset.s || 'abcdefg';
        if (this.inputKEl) this.inputKEl.value = btn.dataset.k || '2';
        this.start();
      };
    });
  }

  protected buildSteps(): RS2Step[] {
    let s = this.inputEl?.value || 'abcdefg';
    let k = parseInt(this.inputKEl?.value || '2', 10);
    if (s.length === 0) s = 'abcdefg';
    if (isNaN(k) || k < 1) k = 1;
    if (this.inputEl) this.inputEl.value = s;
    if (this.inputKEl) this.inputKEl.value = String(k);
    return buildRS2Steps(s, k);
  }

  protected renderStep(step: RS2Step): void {
    if (this.blockEl) this.blockEl.textContent = String(Math.floor(step.i / (2 * step.k)) + (step.status === 'done' ? 0 : 1));
    if (this.posEl) this.posEl.textContent = String(step.i);
    if (this.kEl) this.kEl.textContent = String(step.k);

    // Count reversals up to current step
    let revCount = 0;
    for (let si = 0; si <= this.currentIndex; si++) {
      if (this.steps[si].status === 'advance' && this.steps[si].swappedLeft >= 0) revCount++;
    }
    if (this.revEl) this.revEl.textContent = String(revCount);

    if (this.trackEl) {
      this.trackEl.innerHTML = '';
      const len = step.chars.length;

      step.chars.forEach((ch, idx) => {
        const cell = document.createElement('div');
        cell.className = 'rs2-cell';
        let ptrHtml = '';

        // Determine cell state based on step context
        if (step.status === 'done') {
          // Everything processed
          cell.classList.add('processed');
        } else if (step.phase === 'skipping') {
          // Characters before current block are processed
          if (idx < step.blockStart + step.k) {
            cell.classList.add('processed');
          } else if (idx < step.processedEnd) {
            cell.classList.add('skipped');
          }
          // After processedEnd: neutral
        } else if (step.phase === 'reversing') {
          if (idx < step.processedEnd && idx < step.blockStart) {
            cell.classList.add('processed');
          } else if (idx >= step.blockStart && idx <= step.blockStart + step.k - 1) {
            // Within the reversing range
            if (step.status === 'advance' && step.swappedLeft >= 0 &&
                (idx === step.swappedLeft || idx === step.swappedRight)) {
              cell.classList.add('swapped');
            } else {
              cell.classList.add('reversing');
            }
          } else if (idx >= step.blockStart + step.k && idx < step.processedEnd) {
            cell.classList.add('skipped');
          }
        } else {
          // decide phase
          if (idx < step.processedEnd) {
            cell.classList.add('processed');
          } else if (idx >= step.blockStart && idx < len) {
            // In current block range: show as active
            if (step.status !== 'init' && idx >= step.blockStart) {
              cell.classList.add('reversing');
            }
          }
        }

        // Pointers (only during reversing / advance in reversing phase)
        if (step.phase === 'reversing' && step.status !== 'done') {
          if (idx === step.left && step.left <= step.right) {
            cell.classList.add('ptr-left');
            ptrHtml += '<span class="rs2-ptr ptr-l">L</span>';
          }
          if (idx === step.right && step.right >= step.left) {
            cell.classList.add('ptr-right');
            ptrHtml += '<span class="rs2-ptr ptr-r">R</span>';
          }
        }

        // Show 'i' pointer on the block start cell
        if (step.status !== 'done' && step.status !== 'init' && idx === step.i && step.phase !== 'skipping') {
          if (!ptrHtml.includes('ptr-i')) {
            ptrHtml += '<span class="rs2-ptr ptr-i">i</span>';
          }
        }

        cell.innerHTML = `${ptrHtml}<span class="idx">${idx}</span><span class="val">${ch}</span>`;
        this.trackEl?.appendChild(cell);
      });
    }
    this.renderLogLine(step);
  }

  private renderLogLine(step: RS2Step): void {
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
  id: 'reverse-string-ii',
  name: '反转字符串II（分段反转）',
  viewId: 'algo-reverse-string-ii-view',
  category: 'string',
  description: '每隔 2k 个字符反转前 k 个字符',
  icon: '🔁',
  template,
  Visualizer: ReverseStringIIVisualizer,
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '掌握分段处理 + 边界条件的双指针反转',
});

export {};
