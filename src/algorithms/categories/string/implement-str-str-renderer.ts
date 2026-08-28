/**
 * 实现strStr()（KMP算法）可视化器
 * LeetCode 28
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './implement-str-str.html?raw';

export interface SSStep {
  haystack: string;
  needle: string;
  i: number;
  j: number;
  next: number[];
  phase: 'build-next' | 'match';
  status: 'init' | 'compute-next' | 'compare' | 'match' | 'mismatch' | 'advance' | 'found' | 'not-found';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildSSSteps(haystack: string, needle: string): SSStep[] {
  const steps: SSStep[] = [];

  // Handle empty needle edge case (LeetCode: needle.length === 0 returns 0)
  if (needle.length === 0) {
    steps.push({
      haystack, needle, i: 0, j: 0, next: [0], phase: 'match',
      status: 'found',
      message: 'needle 为空串，直接返回 0。',
      log: 'needle 为空串，返回 0。',
      codeLine: [1],
    });
    return steps;
  }

  // Initial state
  let next = [0];
  let nj = 0;

  steps.push({
    haystack, needle, i: 0, j: 0, next: [0], phase: 'build-next',
    status: 'init',
    message: `初始化：haystack="${haystack}"，needle="${needle}"，next[0]=0。准备构建 next 数组。`,
    log: '初始化，准备构建 next 数组。',
    codeLine: [1, 2],
  });

  // Build next array step by step, taking snapshots
  for (let ni = 1; ni < needle.length; ni++) {
    while (nj > 0 && needle[ni] !== needle[nj]) {
      nj = next[nj - 1];
      steps.push({
        haystack, needle, i: 0, j: ni, next: [...next], phase: 'build-next',
        status: 'compute-next',
        message: `构建 next：p[${ni}]='${needle[ni]}' ≠ p[${nj}]='${needle[nj]}'，j 回退到 next[j-1]=${nj}。`,
        log: `next 构建：p[${ni}] ≠ p[${nj}]，j 回退到 ${nj}。`,
        codeLine: [18, 19],
      });
    }
    if (needle[ni] === needle[nj]) {
      nj++;
    }
    next = [...next, nj];
    steps.push({
      haystack, needle, i: 0, j: ni, next: [...next], phase: 'build-next',
      status: 'compute-next',
      message: `构建 next：已检查 p[${ni}]='${needle[ni]}'，next[${ni}]=${nj}。`,
      log: `next 构建：next[${ni}]=${nj}。`,
      codeLine: [20, 21],
    });
  }

  // Match phase
  let i = 0, j = 0;
  while (i < haystack.length) {
    steps.push({
      haystack, needle, i, j, next: [...next], phase: 'match',
      status: 'compare',
      message: `比较：haystack[${i}]='${haystack[i]}' vs needle[${j}]='${needle[j]}'。`,
      log: `比较 h[${i}]='${haystack[i]}' 与 n[${j}]='${needle[j]}'。`,
      codeLine: [4, 5],
    });

    if (haystack[i] === needle[j]) {
      if (j === needle.length - 1) {
        const matchStart = i - j;
        steps.push({
          haystack, needle, i, j, next: [...next], phase: 'match',
          status: 'found',
          message: `找到匹配！j=${j} 到达 needle 末尾，返回 ${matchStart}。`,
          log: `找到完整匹配，返回位置 ${matchStart}。`,
          codeLine: [6],
        });
        return steps;
      }
      steps.push({
        haystack, needle, i, j, next: [...next], phase: 'match',
        status: 'match',
        message: `匹配成功！haystack[${i}]='${haystack[i]}' === needle[${j}]='${needle[j]}'，两个指针各前进一步。`,
        log: `匹配成功，i++，j++。`,
        codeLine: [7],
      });
      i++;
      j++;
    } else if (j > 0) {
      const oldJ = j;
      j = next[j - 1];
      steps.push({
        haystack, needle, i, j, next: [...next], phase: 'match',
        status: 'mismatch',
        message: `失配！haystack[${i}]='${haystack[i]}' ≠ needle[${oldJ}]='${needle[oldJ]}'，j 回退到 next[${oldJ - 1}]=${j}。`,
        log: `失配，j 回退到 ${j}。`,
        codeLine: [8, 9],
      });
    } else {
      steps.push({
        haystack, needle, i, j, next: [...next], phase: 'match',
        status: 'advance',
        message: `失配且 j=0，i 前进一步：i++ → ${i + 1}。`,
        log: `失配，j=0，i++。`,
        codeLine: [10, 11],
      });
      i++;
    }
  }

  steps.push({
    haystack, needle, i, j, next: [...next], phase: 'match',
    status: 'not-found',
    message: `i=${i} 超出 haystack 长度，未找到匹配，返回 -1。`,
    log: '未找到匹配，返回 -1。',
    codeLine: [13],
  });
  return steps;
}

export class StrStrVisualizer extends StepVisualizer<SSStep> {
  protected codeLines = [
    'public int strStr(String haystack, String needle) {',
    '    int[] next = buildNext(needle);',
    '    int i = 0, j = 0;',
    '    while (i < haystack.length()) {',
    '        if (haystack.charAt(i) == needle.charAt(j)) {',
    '            if (j == needle.length() - 1) return i - j;',
    '            i++; j++;',
    '        } else if (j > 0) {',
    '            j = next[j - 1];',
    '        } else {',
    '            i++;',
    '        }',
    '    }',
    '    return -1;',
    '}',
    '',
    'int[] buildNext(String p) {',
    '    int[] next = new int[p.length()];',
    '    int j = 0;',
    '    for (int i = 1; i < p.length(); i++) {',
    '        while (j > 0 && p.charAt(i) != p.charAt(j))',
    '            j = next[j - 1];',
    '        if (p.charAt(i) == p.charAt(j)) j++;',
    '        next[i] = j;',
    '    }',
    '    return next;',
    '}',
  ];
  protected codePanelTitle = 'KMP 算法代码 (Java)';

  private haystackEl: HTMLInputElement | null = null;
  private needleEl: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private trackEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private iEl: HTMLElement | null = null;
  private jEl: HTMLElement | null = null;
  private matchLenEl: HTMLElement | null = null;
  private foundEl: HTMLElement | null = null;
  private nextGridEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.haystackEl = this.root.querySelector('#ss-haystack');
    this.needleEl = this.root.querySelector('#ss-needle');
    this.btnStart = this.root.querySelector('#ss-start');
    this.exampleButtons = this.root.querySelectorAll('.ss-example-btn');
    this.trackEl = this.root.querySelector('#ss-track');
    this.logEl = this.root.querySelector('#ss-log');
    this.iEl = this.root.querySelector('#ss-i');
    this.jEl = this.root.querySelector('#ss-j');
    this.matchLenEl = this.root.querySelector('#ss-match-len');
    this.foundEl = this.root.querySelector('#ss-found');
    this.nextGridEl = this.root.querySelector('#ss-next-grid');
    this.bindPlaybackControls({ message: 'step-message' });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => {
        if (this.haystackEl) this.haystackEl.value = btn.dataset.h || 'hello';
        if (this.needleEl) this.needleEl.value = btn.dataset.n || 'll';
        this.start();
      };
    });
  }

  protected buildSteps(): SSStep[] {
    let h = this.haystackEl?.value || 'hello';
    let n = this.needleEl?.value || 'll';
    if (h.length === 0) h = 'hello';
    if (n.length === 0) n = 'll';
    if (this.haystackEl) this.haystackEl.value = h;
    if (this.needleEl) this.needleEl.value = n;
    return buildSSSteps(h, n);
  }

  protected renderStep(step: SSStep): void {
    if (this.iEl) this.iEl.textContent = String(step.i);
    if (this.jEl) this.jEl.textContent = String(step.j);
    if (this.matchLenEl) this.matchLenEl.textContent = String(step.j);
    if (this.foundEl) {
      this.foundEl.textContent = step.status === 'found' ? String(step.i - step.j) : '-1';
    }

    // Render next array table
    if (this.nextGridEl) {
      this.nextGridEl.innerHTML = '';
      step.next.forEach((val, idx) => {
        const item = document.createElement('div');
        item.className = 'ss-next-item';
        item.innerHTML = `<span class="next-idx">${idx}</span><span class="next-val">${val}</span>`;
        this.nextGridEl?.appendChild(item);
      });
    }

    // Render haystack and needle rows
    if (this.trackEl) {
      this.trackEl.innerHTML = '';

      // Haystack row
      const hRow = document.createElement('div');
      hRow.className = 'ss-row';
      const hLabel = document.createElement('div');
      hLabel.className = 'ss-row-label';
      hLabel.textContent = 'haystack';
      hRow.appendChild(hLabel);

      step.haystack.split('').forEach((ch, idx) => {
        const cell = document.createElement('div');
        cell.className = 'ss-cell';
        let ptr = '';

        // Determine cell state
        if (step.status === 'found' && step.phase === 'match') {
          const matchStart = step.i - step.j;
          const matchEnd = matchStart + step.needle.length;
          if (idx >= matchStart && idx < matchEnd) {
            cell.classList.add('found');
          }
        } else if (step.phase === 'match') {
          if (idx === step.i) {
            cell.classList.add('current');
            ptr = '<span class="ss-ptr ptr-i">i</span>';
          } else if (idx < step.i && idx >= step.i - step.j) {
            cell.classList.add('matched');
          }
        }

        if (step.status === 'mismatch' && idx === step.i) {
          cell.classList.add('mismatch');
        }

        cell.innerHTML = `${ptr}<span class="idx">${idx}</span><span class="val">${ch}</span>`;
        hRow.appendChild(cell);
      });
      this.trackEl?.appendChild(hRow);

      // Needle row
      const nRow = document.createElement('div');
      nRow.className = 'ss-row';
      const nLabel = document.createElement('div');
      nLabel.className = 'ss-row-label';
      nLabel.textContent = 'needle';
      nRow.appendChild(nLabel);

      step.needle.split('').forEach((ch, idx) => {
        const cell = document.createElement('div');
        cell.className = 'ss-cell';
        let ptr = '';

        if (step.phase === 'match' || step.status === 'found') {
          if (idx === step.j) {
            cell.classList.add('current');
            ptr = '<span class="ss-ptr ptr-j">j</span>';
          } else if (idx < step.j) {
            cell.classList.add('matched');
          }
        }

        if (step.status === 'mismatch' && idx === step.j) {
          cell.classList.add('mismatch');
        }

        cell.innerHTML = `${ptr}<span class="idx">${idx}</span><span class="val">${ch}</span>`;
        nRow.appendChild(cell);
      });
      this.trackEl?.appendChild(nRow);
    }
    this.renderLogLine(step);
  }

  private renderLogLine(step: SSStep): void {
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
  id: 'str-str',
  name: '实现strStr()（KMP算法）',
  viewId: 'algo-str-str-view',
  category: 'string',
  description: '用 KMP 算法在 haystack 中查找 needle 的首次位置',
  icon: '🔍',
  template,
  Visualizer: StrStrVisualizer,
  difficulty: 2,
  levelOrder: 6,
  learningGoal: '掌握 KMP 算法的 next 数组与状态转移',
});

export {};
