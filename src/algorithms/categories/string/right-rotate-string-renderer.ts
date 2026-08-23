/**
 * 右旋转字符串可视化器（三次反转）
 * 经典算法：通过三次反转实现字符串右旋转 k 位
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './right-rotate-string.html?raw';

interface RRStep {
  chars: string[];
  k: number;
  phase: 1 | 2 | 3 | 'init' | 'done';
  left: number;
  right: number;
  status: 'init' | 'phase-intro' | 'swap' | 'advance' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

function buildRRSteps(input: string, k: number): RRStep[] {
  const steps: RRStep[] = [];
  const n = input.length;
  if (n === 0) return steps;
  k = k % n;
  const arr = [...input];
  let swapCount = 0;

  // Init
  steps.push({
    chars: [...arr], k, phase: 'init', left: 0, right: n - 1, status: 'init',
    message: `原始字符串 "${input}"，右旋转 ${k} 位。k = ${k} % ${n} = ${k}。`,
    log: `初始化：s="${input}", k=${k}, n=${n}`,
    codeLine: [0, 1, 2],
  });

  // Phase 1: reverse entire string [0, n-1]
  steps.push({
    chars: [...arr], k, phase: 1, left: 0, right: n - 1, status: 'phase-intro',
    message: `阶段 1：反转整个字符串 [0, ${n - 1}]`,
    log: `阶段1：reverse(arr, 0, ${n - 1})`,
    codeLine: 3,
  });

  let l = 0, r = n - 1;
  while (l < r) {
    steps.push({
      chars: [...arr], k, phase: 1, left: l, right: r, status: 'swap',
      message: `交换 arr[${l}]='${arr[l]}' 与 arr[${r}]='${arr[r]}'`,
      log: `阶段1: 交换 '${arr[l]}' <-> '${arr[r]}'`,
      codeLine: [11, 12],
    });
    [arr[l], arr[r]] = [arr[r], arr[l]];
    swapCount++;
    steps.push({
      chars: [...arr], k, phase: 1, left: l, right: r, status: 'advance',
      message: `交换完成，left++ → ${l + 1}，right-- → ${r - 1}`,
      log: `left -> ${l + 1}, right -> ${r - 1}`,
      codeLine: [13, 14],
    });
    l++;
    r--;
  }

  // Phase 2: reverse first k chars [0, k-1]
  steps.push({
    chars: [...arr], k, phase: 2, left: 0, right: k - 1, status: 'phase-intro',
    message: `阶段 2：反转前 ${k} 个字符 [0, ${k - 1}]`,
    log: `阶段2：reverse(arr, 0, ${k - 1})`,
    codeLine: 4,
  });

  l = 0;
  r = k - 1;
  while (l < r) {
    steps.push({
      chars: [...arr], k, phase: 2, left: l, right: r, status: 'swap',
      message: `交换 arr[${l}]='${arr[l]}' 与 arr[${r}]='${arr[r]}'`,
      log: `阶段2: 交换 '${arr[l]}' <-> '${arr[r]}'`,
      codeLine: [11, 12],
    });
    [arr[l], arr[r]] = [arr[r], arr[l]];
    swapCount++;
    steps.push({
      chars: [...arr], k, phase: 2, left: l, right: r, status: 'advance',
      message: `交换完成，left++ → ${l + 1}，right-- → ${r - 1}`,
      log: `left -> ${l + 1}, right -> ${r - 1}`,
      codeLine: [13, 14],
    });
    l++;
    r--;
  }

  // Phase 3: reverse remaining [k, n-1]
  steps.push({
    chars: [...arr], k, phase: 3, left: k, right: n - 1, status: 'phase-intro',
    message: `阶段 3：反转后 ${n - k} 个字符 [${k}, ${n - 1}]`,
    log: `阶段3：reverse(arr, ${k}, ${n - 1})`,
    codeLine: 5,
  });

  l = k;
  r = n - 1;
  while (l < r) {
    steps.push({
      chars: [...arr], k, phase: 3, left: l, right: r, status: 'swap',
      message: `交换 arr[${l}]='${arr[l]}' 与 arr[${r}]='${arr[r]}'`,
      log: `阶段3: 交换 '${arr[l]}' <-> '${arr[r]}'`,
      codeLine: [11, 12],
    });
    [arr[l], arr[r]] = [arr[r], arr[l]];
    swapCount++;
    steps.push({
      chars: [...arr], k, phase: 3, left: l, right: r, status: 'advance',
      message: `交换完成，left++ → ${l + 1}，right-- → ${r - 1}`,
      log: `left -> ${l + 1}, right -> ${r - 1}`,
      codeLine: [13, 14],
    });
    l++;
    r--;
  }

  // Done
  steps.push({
    chars: [...arr], k, phase: 'done', left: 0, right: n - 1, status: 'done',
    message: `三次反转完成！右旋转 ${k} 位的结果：${arr.join('')}`,
    log: `完成！结果: "${arr.join('')}", 共交换 ${swapCount} 次`,
    codeLine: 6,
  });

  return steps;
}

export class RightRotateStringVisualizer extends StepVisualizer<RRStep> {
  protected codeLines = [
    'public String rightRotate(String s, int k) {',
    '    k = k % s.length();',
    '    char[] arr = s.toCharArray();',
    '    reverse(arr, 0, arr.length - 1);',
    '    reverse(arr, 0, k - 1);',
    '    reverse(arr, k, arr.length - 1);',
    '    return new String(arr);',
    '}',
    'void reverse(char[] arr, int l, int r) {',
    '    while (l < r) {',
    '        char tmp = arr[l];',
    '        arr[l] = arr[r];',
    '        arr[r] = tmp;',
    '        l++;',
    '        r--;',
    '    }',
    '}',
  ];
  protected codePanelTitle = '右旋转字符串代码 (Java)';

  private inputSEl: HTMLInputElement | null = null;
  private inputKEl: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private trackEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private phaseEl: HTMLElement | null = null;
  private leftEl: HTMLElement | null = null;
  private rightEl: HTMLElement | null = null;
  private swapEl: HTMLElement | null = null;
  private tag1: HTMLElement | null = null;
  private tag2: HTMLElement | null = null;
  private tag3: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputSEl = this.root.querySelector('#rr-input-s');
    this.inputKEl = this.root.querySelector('#rr-input-k');
    this.btnStart = this.root.querySelector('#rr-start');
    this.exampleButtons = this.root.querySelectorAll('.rr-example-btn');
    this.trackEl = this.root.querySelector('#rr-track');
    this.logEl = this.root.querySelector('#rr-log');
    this.phaseEl = this.root.querySelector('#rr-phase');
    this.leftEl = this.root.querySelector('#rr-left');
    this.rightEl = this.root.querySelector('#rr-right');
    this.swapEl = this.root.querySelector('#rr-swap');
    this.tag1 = this.root.querySelector('#rr-tag-1');
    this.tag2 = this.root.querySelector('#rr-tag-2');
    this.tag3 = this.root.querySelector('#rr-tag-3');
    this.bindPlaybackControls({ message: 'step-message' });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => {
        if (this.inputSEl) this.inputSEl.value = btn.dataset.s || 'abcdefg';
        if (this.inputKEl) this.inputKEl.value = btn.dataset.k || '2';
        this.start();
      };
    });
  }

  protected buildSteps(): RRStep[] {
    let s = this.inputSEl?.value || 'abcdefg';
    let k = parseInt(this.inputKEl?.value || '2', 10);
    if (s.length === 0) s = 'abcdefg';
    if (isNaN(k) || k < 0) k = 2;
    if (this.inputSEl) this.inputSEl.value = s;
    if (this.inputKEl) this.inputKEl.value = String(k);
    return buildRRSteps(s, k);
  }

  protected renderStep(step: RRStep): void {
    // Stats
    const phaseLabel = step.phase === 'init' ? '-' : step.phase === 'done' ? '完成' : `${step.phase}/3`;
    if (this.phaseEl) this.phaseEl.textContent = phaseLabel;
    if (this.leftEl) this.leftEl.textContent = String(step.left);
    if (this.rightEl) this.rightEl.textContent = String(step.right);

    // Count swaps up to current step
    let swapCount = 0;
    for (let i = 0; i <= this.currentIndex; i++) {
      if (this.steps[i].status === 'swap') swapCount++;
    }
    if (this.swapEl) this.swapEl.textContent = String(swapCount);

    // Phase tags
    if (this.tag1) { this.tag1.className = 'rr-phase-tag' + (step.phase === 1 ? ' active-1' : ''); }
    if (this.tag2) { this.tag2.className = 'rr-phase-tag' + (step.phase === 2 ? ' active-2' : ''); }
    if (this.tag3) { this.tag3.className = 'rr-phase-tag' + (step.phase === 3 ? ' active-3' : ''); }

    // Cells
    if (this.trackEl) {
      this.trackEl.innerHTML = '';
      const phaseNum = step.phase === 'init' || step.phase === 'done' ? 0 : step.phase;

      step.chars.forEach((ch, idx) => {
        const cell = document.createElement('div');
        cell.className = 'rr-cell';

        // Highlight range for current phase
        if (phaseNum === 1) cell.classList.add('phase1');
        else if (phaseNum === 2) {
          if (idx < step.k) cell.classList.add('phase2');
        } else if (phaseNum === 3) {
          if (idx >= step.k) cell.classList.add('phase3');
        }

        // Pointer markers
        let ptr = '';
        if (step.status === 'swap' || step.status === 'advance' || step.status === 'phase-intro') {
          if (idx === step.left && step.left <= step.right) {
            cell.classList.add('left');
            ptr = '<span class="rr-ptr left">L</span>';
          }
          if (idx === step.right && step.right >= step.left) {
            cell.classList.add('right');
            ptr += '<span class="rr-ptr right">R</span>';
          }
        }

        if (step.status === 'advance' && (idx === step.left || idx === step.right)) {
          cell.classList.add('swapped');
        }

        cell.innerHTML = `${ptr}<span class="idx">${idx}</span><span class="val">${ch}</span>`;
        this.trackEl?.appendChild(cell);
      });
    }
    this.renderLogLine(step);
  }

  private renderLogLine(step: RRStep): void {
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
  id: 'right-rotate-string',
  name: '右旋转字符串（三次反转）',
  viewId: 'algo-right-rotate-view',
  category: 'string',
  description: '通过三次反转实现字符串右旋转 k 位',
  icon: '🔄',
  template,
  Visualizer: RightRotateStringVisualizer,
  difficulty: 1,
  levelOrder: 5,
  learningGoal: '掌握通过分段反转实现字符串旋转的技巧',
});

export {};
