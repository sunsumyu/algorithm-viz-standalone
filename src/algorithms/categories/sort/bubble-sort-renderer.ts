/**
 * 冒泡排序可视化器
 * 玻璃感 + 蓝紫渐变：柱状图高亮比较/交换/冒泡到位，FLIP 动画，完整日志
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './bubble-sort.html?raw';

type Phase = 'init' | 'compare' | 'swap' | 'pass-done' | 'done';

interface BSStep {
  array: number[];
  pass: number;                 // 当前轮数（-1 = 未开始）
  j: number;                    // 当前比较的左索引
  jNext: number;                // j+1
  comparisons: number;
  swaps: number;
  sortedTail: number;           // 末尾已就位的元素数量
  phase: Phase;
  swapping: boolean;            // 这一步是否正在交换
  message: string;
  log: string;
  codeLine: number | number[];
}

function parseArray(input: string): number[] {
  return input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
}

function bubbleSortSteps(input: number[]): BSStep[] {
  const steps: BSStep[] = [];
  const array = [...input];
  const n = array.length;
  let comparisons = 0;
  let swaps = 0;
  let swapped: boolean;

  // init
  steps.push({
    array: [...array], pass: -1, j: -1, jNext: -1,
    comparisons: 0, swaps: 0, sortedTail: 0,
    phase: 'init', swapping: false,
    message: n === 0 ? '数组为空，无需排序。' : `初始化：n=${n}，共需最多 ${n - 1} 轮冒泡。`,
    log: n === 0 ? 'empty array' : `init array = [${array.join(', ')}], max ${n - 1} passes`,
    codeLine: 0,
  });

  if (n === 0) {
    steps.push({
      array: [...array], pass: -1, j: -1, jNext: -1,
      comparisons: 0, swaps: 0, sortedTail: 0,
      phase: 'done', swapping: false,
      message: '✅ 排序完成！数组为空。',
      log: 'done: empty array',
      codeLine: 1,
    });
    return steps;
  }

  for (let pass = 0; pass < n - 1; pass++) {
    swapped = false;

    for (let j = 0; j < n - 1 - pass; j++) {
      // compare step
      comparisons++;
      steps.push({
        array: [...array], pass: pass + 1, j, jNext: j + 1,
        comparisons, swaps, sortedTail: pass,
        phase: 'compare', swapping: false,
        message: `第 ${pass + 1} 轮：比较 arr[${j}]=${array[j]} 与 arr[${j + 1}]=${array[j + 1]}。`,
        log: `pass ${pass + 1}: cmp arr[${j}]=${array[j]} vs arr[${j + 1}]=${array[j + 1]}`,
        codeLine: 3,
      });

      if (array[j] > array[j + 1]) {
        // swap step
        const temp = array[j];
        array[j] = array[j + 1];
        array[j + 1] = temp;
        swaps++;
        swapped = true;

        steps.push({
          array: [...array], pass: pass + 1, j, jNext: j + 1,
          comparisons, swaps, sortedTail: pass,
          phase: 'swap', swapping: true,
          message: `交换：${array[j]} > ${array[j + 1]}(旧值) ⇒ 交换 arr[${j}] 和 arr[${j + 1}]。`,
          log: `pass ${pass + 1}: swap arr[${j}] ↔ arr[${j + 1}] (${temp} ↔ ${array[j]})`,
          codeLine: 4,
        });
      }
    }

    // pass done
    const nowSorted = pass + 1; // elements bubbled to end
    steps.push({
      array: [...array], pass: pass + 1, j: -1, jNext: -1,
      comparisons, swaps, sortedTail: nowSorted,
      phase: 'pass-done', swapping: false,
      message: `第 ${pass + 1} 轮完成！最大值 ${array[n - 1 - pass]} 已冒泡到位置 ${n - 1 - pass}。${swapped ? '' : '本轮无交换，数组已有序，提前结束！'}`,
      log: `pass ${pass + 1} done, max=${array[n - 1 - pass]} at pos ${n - 1 - pass}${!swapped ? ' (early stop)' : ''}`,
      codeLine: 6,
    });

    if (!swapped) break; // early exit optimization
  }

  // done
  steps.push({
    array: [...array], pass: -1, j: -1, jNext: -1,
    comparisons, swaps, sortedTail: n,
    phase: 'done', swapping: false,
    message: `✅ 排序完成！共 ${comparisons} 次比较、${swaps} 次交换。`,
    log: `done: ${comparisons} cmps, ${swaps} swaps`,
    codeLine: 8,
  });

  return steps;
}

export class BubbleSortVisualizer extends StepVisualizer<BSStep> {
  protected codeLines = [
    'public void bubbleSort(int[] arr) {',
    '    int n = arr.length;',
    '    for (int pass = 0; pass < n - 1; pass++) {',
    '        for (int j = 0; j < n - 1 - pass; j++) {',
    '            if (arr[j] > arr[j + 1]) {       // 逆序则交换',
    '                int temp = arr[j];',
    '                arr[j] = arr[j + 1];',
    '                arr[j + 1] = temp;',
    '            }',
    '        }',
    '    }',
    '}',
  ];
  protected codePanelTitle = 'Java 冒泡排序源码';
  protected logContainerId = 'bs-log';
  protected clearLogButtonId = 'bs-log-clear';

  private arrayInput: HTMLInputElement | null = null;
  private statPass: HTMLElement | null = null;
  private statCmp: HTMLElement | null = null;
  private statSwap: HTMLElement | null = null;
  private statSorted: HTMLElement | null = null;
  private barsEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.arrayInput = this.root.querySelector('#bs-array');
    this.statPass = this.root.querySelector('#bs-stat-pass');
    this.statCmp = this.root.querySelector('#bs-stat-cmp');
    this.statSwap = this.root.querySelector('#bs-stat-swap');
    this.statSorted = this.root.querySelector('#bs-stat-sorted');
    this.barsEl = this.root.querySelector('#bs-bars');
    this.resultEl = this.root.querySelector('#bs-result');
    this.logEl = this.root.querySelector('#bs-log');

    this.bindPlaybackControls({
      reset: 'step-reset', prev: 'step-prev', play: 'step-play', next: 'step-next',
      speed: 'bs-speed', speedLabel: 'bs-speed-label',
      counter: 'step-counter', message: 'step-message',
    });

    this.root.querySelector('#bs-start')?.addEventListener('click', () => this.start());
    this.root.querySelectorAll<HTMLButtonElement>('.bs-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.arrayInput) this.arrayInput.value = btn.dataset.arr || '';
        this.start();
      });
    });
    this.arrayInput?.addEventListener('change', () => this.start());
  }

  protected buildSteps(): BSStep[] {
    return bubbleSortSteps(parseArray(this.arrayInput?.value || '5,2,9,1,5,6'));
  }

  protected renderStep(step: BSStep): void {
    this.renderStats(step);
    this.renderBars(step);
    this.renderResultBanner(step);
    this.updateLog(this.logEl, (s, i, isCurrent) => {
      const row = document.createElement('div');
      row.className = 'bs-log-line' + (isCurrent ? ' bs-log-active' : '');
      const num = document.createElement('span');
      num.className = 'bs-log-num';
      num.textContent = `${String(i + 1).padStart(2, '0')}.`;
      const text = document.createElement('span');
      text.textContent = s.log ?? '';
      row.appendChild(num);
      row.appendChild(text);
      return row;
    });
  }

  private renderStats(step: BSStep): void {
    if (this.statPass) this.statPass.textContent = step.phase === 'init' ? '0' : String(step.pass);
    if (this.statCmp) this.statCmp.textContent = String(step.comparisons);
    if (this.statSwap) this.statSwap.textContent = String(step.swaps);
    if (this.statSorted) this.statSorted.textContent = String(step.sortedTail);
  }

  private renderBars(step: BSStep): void {
    const barsEl = this.barsEl;
    if (!barsEl) return;
    const maxVal = Math.max(1, ...step.array);
    const total = step.array.length;
    const barWidth = total > 10 ? 36 : 48;

    // FLIP: First
    const oldPositions = new Map<number, DOMRect>();
    barsEl.querySelectorAll<HTMLElement>('.bs-bar-wrap').forEach((el) => {
      const idx = Number(el.dataset.idx);
      if (Number.isFinite(idx)) oldPositions.set(idx, el.getBoundingClientRect());
    });

    barsEl.innerHTML = '';
    barsEl.style.gap = total > 12 ? '3px' : '6px';

    step.array.forEach((value, idx) => {
      const wrap = document.createElement('div');
      wrap.className = 'bs-bar-wrap';
      wrap.dataset.idx = String(idx);
      wrap.style.width = `${barWidth}px`;

      const bar = document.createElement('div');
      bar.className = 'bs-bar';
      const h = 30 + (value / maxVal) * 170;
      bar.style.height = `${h}px`;
      bar.textContent = String(value);

      // State coloring
      if (step.phase === 'done') {
        bar.classList.add('bs-done');
      } else if (step.phase === 'init') {
        // default bars
      } else if (step.phase === 'compare') {
        if (idx === step.j || idx === step.jNext) {
          bar.classList.add('bs-compare');
        } else if (total - idx <= step.sortedTail) {
          bar.classList.add('bs-sorted');
        }
      } else if (step.phase === 'swap') {
        if (idx === step.j || idx === step.jNext) {
          bar.classList.add('bs-swapping');
        } else if (total - idx <= step.sortedTail) {
          bar.classList.add('bs-sorted');
        }
      } else if (step.phase === 'pass-done') {
        if (total - idx <= step.sortedTail) {
          bar.classList.add('bs-sorted');
          if (idx === total - step.sortedTail) {
            bar.classList.add('bs-pass-done');
          }
        }
      }

      wrap.appendChild(bar);
      const idxLabel = document.createElement('span');
      idxLabel.className = 'bs-idx';
      idxLabel.textContent = String(idx);
      wrap.appendChild(idxLabel);

      // compare markers
      if (step.phase === 'compare') {
        if (idx === step.j) {
          const m = document.createElement('span');
          m.className = 'bs-compare-marker';
          m.textContent = 'arr[j]';
          wrap.appendChild(m);
        }
        if (idx === step.jNext) {
          const m = document.createElement('span');
          m.className = 'bs-compare-marker';
          m.style.left = '50%';
          m.textContent = 'arr[j+1]';
          wrap.appendChild(m);
        }
      }

      // swap arrow
      if (step.phase === 'swap' && idx === step.j) {
        const arrow = document.createElement('span');
        arrow.className = 'bs-swap-arrow';
        arrow.style.left = `${barWidth * 0.8}px`;
        arrow.textContent = '\u21C4';
        wrap.appendChild(arrow);
      }

      barsEl.appendChild(wrap);
    });

    // FLIP: Last + Invert + Play
    requestAnimationFrame(() => {
      barsEl.querySelectorAll<HTMLElement>('.bs-bar-wrap').forEach((el) => {
        const idx = Number(el.dataset.idx);
        if (!Number.isFinite(idx)) return;
        const newRect = el.getBoundingClientRect();
        const oldRect = oldPositions.get(idx);
        if (oldRect) {
          const dx = oldRect.left - newRect.left;
          if (Math.abs(dx) > 0.5) {
            el.style.transition = 'none';
            el.style.transform = `translateX(${dx}px)`;
            requestAnimationFrame(() => {
              el.style.transition = 'transform .5s cubic-bezier(.4,0,.2,1)';
              el.style.transform = '';
            });
          }
        }
      });
    });
  }

  private renderResultBanner(step: BSStep): void {
    if (!this.resultEl) return;
    this.resultEl.classList.remove('bs-result--done');
    const emoji = this.resultEl.querySelector('.bs-emoji') as HTMLElement | null;
    if (step.phase === 'done') {
      this.resultEl.classList.add('bs-result--done');
      if (emoji) emoji.textContent = '\uD83C\uDF89';
    } else if (step.phase === 'compare') {
      if (emoji) emoji.textContent = '\u2696\uFE0F';
    } else if (step.phase === 'swap') {
      if (emoji) emoji.textContent = '\u21C4';
    } else if (step.phase === 'pass-done') {
      if (emoji) emoji.textContent = '\uD83C\uDF00';
    } else if (step.phase === 'init') {
      if (emoji) emoji.textContent = '\uD83C\uDF2A\uFE0F';
    } else {
      if (emoji) emoji.textContent = '\uD83C\uDF2A\uFE0F';
    }
  }

}

registerAlgorithm({
  id: 'bubble-sort',
  name: '冒泡排序',
  viewId: 'algo-bubble-sort-view',
  category: 'sort',
  description: '逐步演示冒泡排序：相邻元素比较、交换、冒泡到位',
  icon: '\uD83C\uDF2A\uFE0F',
  template,
  Visualizer: BubbleSortVisualizer,
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '理解冒泡排序的相邻比较和元素冒泡过程',
});
